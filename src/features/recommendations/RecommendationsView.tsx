import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Target, CheckCheck, BarChart3, ShieldAlert, Wrench } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CardsSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { DecisionOutcomeModal } from '../../components/modals/DecisionOutcomeModal';
import { RecommendationDetailsModal } from '../../components/modals/RecommendationDetailsModal';
import { useAuth } from '../../context/AuthContext';
import { engineService } from '../../services/engine.service';
import { AUTO_REFRESH_INTERVAL } from '../../lib/api/queryClient';
import { Recommendation, Decision } from '../../types/api';

export const RecommendationsView: React.FC = () => {
  const { activeWorkspace, activeProject } = useAuth();
  const [activeTab, setActiveTab] = useState<'recommendations' | 'decisions'>('recommendations');
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);

  const workspaceId = activeWorkspace?.id || '';
  const projectId = activeProject?.id;

  const {
    data: recommendations = [],
    isLoading: isLoadingRecs,
  } = useQuery<Recommendation[]>({
    queryKey: ['recommendations', workspaceId, projectId],
    queryFn: () => engineService.getRecommendations(workspaceId, projectId),
    enabled: !!workspaceId,
    refetchInterval: AUTO_REFRESH_INTERVAL,
  });

  const {
    data: decisions = [],
    isLoading: isLoadingDecs,
    refetch: refetchDecs,
  } = useQuery<Decision[]>({
    queryKey: ['decisions', workspaceId, projectId],
    queryFn: () => engineService.getDecisions(workspaceId, projectId),
    enabled: !!workspaceId,
    refetchInterval: AUTO_REFRESH_INTERVAL,
  });

  const isLoading = isLoadingRecs || isLoadingDecs;
  const rankedDecisions = React.useMemo(() => [...decisions].sort((a, b) => {
    const rankA = typeof a.rank === 'number' ? a.rank : Number.MAX_SAFE_INTEGER;
    const rankB = typeof b.rank === 'number' ? b.rank : Number.MAX_SAFE_INTEGER;
    if (rankA !== rankB) return rankA - rankB;
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  }), [decisions]);

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line-light dark:border-ink-2">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-ink dark:text-white">
            Product Roadmap & Decisions
          </h1>
          <p className="text-xs text-muted dark:text-slate-400 mt-1">
            Data-backed product recommendations and executed decision outcomes closing the feedback loop.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 bg-white dark:bg-ink-2 border border-line dark:border-slate-700 rounded-xl shadow-2xs">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'recommendations'
                ? 'bg-brand text-white shadow-xs'
                : 'text-muted dark:text-slate-400 hover:text-ink dark:hover:text-white'
            }`}
          >
            Recommendations ({recommendations.length})
          </button>
          <button
            onClick={() => setActiveTab('decisions')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'decisions'
                ? 'bg-brand text-white shadow-xs'
                : 'text-muted dark:text-slate-400 hover:text-ink dark:hover:text-white'
            }`}
          >
            Decisions & Outcomes ({decisions.length})
          </button>
        </div>
      </div>

      {isLoading ? (
        <CardsSkeleton count={6} />
      ) : activeTab === 'recommendations' ? (
        recommendations.length === 0 ? (
          <EmptyState
            icon={<Target className="w-8 h-8 text-muted-light dark:text-slate-500" />}
            title="No roadmap recommendations yet"
            description="Once customer signals and insights are processed, QuickBit Live will prioritize highest-impact opportunities."
          />
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, index) => {
              const impact = rec.impact?.toLowerCase();
              const priority = typeof rec.priority === 'string' ? rec.priority.toLowerCase() : undefined;
              return (
                <div
                  key={rec.id}
                  className="p-5 bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl hover:border-brand-border dark:hover:border-indigo-800/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-brand-soft dark:bg-indigo-950/50 border border-brand-border dark:border-indigo-800/60 flex items-center justify-center text-xs font-mono font-bold text-brand dark:text-indigo-400 shrink-0">
                      #{index + 1}
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={
                            (priority || impact) === 'high'
                              ? 'error'
                              : (priority || impact) === 'medium'
                              ? 'warning'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {priority ? `${priority.toUpperCase()} PRIORITY` : impact ? `${impact.toUpperCase()} IMPACT` : 'FEATURE'}
                        </Badge>

                        {typeof rec.confidence === 'number' && (
                          <span className="text-[11px] font-mono font-semibold text-muted dark:text-slate-400">
                            {Math.round(rec.confidence * 100)}% Confidence
                          </span>
                        )}

                        {rec.category && (
                          <Badge variant="outline" size="sm">
                            {rec.category}
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-ink dark:text-white leading-snug">
                        {rec.title}
                      </h3>

                      {(rec.action || rec.reason || rec.description || rec.rationale) && <p className="text-xs text-muted dark:text-slate-300 leading-relaxed max-w-3xl">{rec.action ? <><span className="font-semibold text-muted-strong dark:text-slate-200">Action: </span>{rec.action}</> : (rec.reason || rec.description || rec.rationale)}</p>}
                      <div className="flex flex-wrap gap-2 pt-1 text-[10px] font-semibold"><MetricPill icon={BarChart3} label="Impact" value={rec.expected_impact} tone="indigo" /><MetricPill icon={Wrench} label="Effort" value={rec.effort} tone="amber" /><MetricPill icon={ShieldAlert} label="Risk" value={rec.risk} tone="rose" /></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {typeof rec.demand_score === 'number' && (
                      <div className="text-right mr-2 hidden lg:block">
                        <div className="text-xs font-bold text-brand dark:text-indigo-400 font-mono">
                          {rec.demand_score} / 100
                        </div>
                        <div className="text-[10px] text-muted-light dark:text-slate-500 font-medium">Demand Score</div>
                      </div>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setSelectedRecommendation(rec)}>View details</Button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        decisions.length === 0 ? (
          <EmptyState
            icon={<CheckCheck className="w-8 h-8 text-muted-light dark:text-slate-500" />}
            title="No decisions logged yet"
            description="When recommendations are turned into shipped features, log outcomes here to train the AI engine."
          />
        ) : (
          <div className="space-y-4">
            {rankedDecisions.map((decision) => (
              <div
                key={decision.id}
                className="p-5 bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="accent" size="sm">
                      {typeof decision.rank === 'number' ? `RANK #${decision.rank}` : 'DECISION'}
                    </Badge>
                    {decision.status && (
                      <span className="text-xs font-mono font-semibold text-muted dark:text-slate-400 capitalize">
                        {decision.status}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDecision(decision)}
                  >
                    Log Outcome
                  </Button>
                </div>

                <h3 className="text-sm font-bold text-ink dark:text-white">{decision.narrative?.title || decision.recommendation?.title || decision.title}</h3>

                {decision.description && (
                  <p className="text-xs text-muted dark:text-slate-300 leading-relaxed">{decision.description}</p>
                )}

                {decision.outcome && (
                  <div className="p-3 bg-surface dark:bg-ink-2/60 border border-line dark:border-slate-800 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-ink dark:text-white block">Recorded Outcome</span>
                    <p className="text-muted dark:text-slate-300">{decision.outcome}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Outcome Modal */}
      <DecisionOutcomeModal
        decision={selectedDecision}
        isOpen={!!selectedDecision}
        onClose={() => setSelectedDecision(null)}
        onSuccess={() => {
          refetchDecs();
        }}
      />
      <RecommendationDetailsModal recommendation={selectedRecommendation} isOpen={!!selectedRecommendation} onClose={() => setSelectedRecommendation(null)} />
    </div>
  );
};

const MetricPill: React.FC<{ icon: React.ElementType; label: string; value?: number | string; tone: 'indigo' | 'amber' | 'rose' }> = ({ icon: Icon, label, value, tone }) => {
  if (value === undefined || value === null || value === '') return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  const colors = { indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300', amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300', rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${colors[tone]}`}><Icon className="h-3 w-3" />{label} {Math.round(numeric * 100)}%</span>;
};
