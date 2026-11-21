import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BrainCircuit, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { CardsSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useAuth } from '../../context/AuthContext';
import { engineService } from '../../services/engine.service';
import { AUTO_REFRESH_INTERVAL } from '../../lib/api/queryClient';
import { Insight } from '../../types/api';

interface InsightsViewProps {
  onNavigate: (tab: string) => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({ onNavigate }) => {
  const { activeWorkspace, activeProject } = useAuth();
  const [impactFilter, setImpactFilter] = useState('all');

  const workspaceId = activeWorkspace?.id || '';
  const projectId = activeProject?.id;

  const {
    data: insights = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Insight[]>({
    queryKey: ['insights', workspaceId, projectId],
    queryFn: () => engineService.getInsights(workspaceId, projectId),
    enabled: !!workspaceId,
    refetchInterval: AUTO_REFRESH_INTERVAL,
  });

  const filteredInsights = useMemo(() => {
    return insights.filter((ins) => {
      if (impactFilter === 'all') return true;
      const impact = ins.impact?.toLowerCase();
      return !!impact && (impact === impactFilter || impact.includes(impactFilter) || impactFilter.includes(impact));
    });
  }, [insights, impactFilter]);

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line-light dark:border-ink-2">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-ink dark:text-white">
            AI Product Insights
          </h1>
          <p className="text-xs text-muted dark:text-slate-400 mt-1">
            Synthesized intelligence identifying market demand, churn risks, UX friction, and product opportunities.
          </p>
        </div>

        <div className="w-48">
          <Select
            value={impactFilter}
            onChange={(e) => setImpactFilter(e.target.value)}
          >
            <option value="all">All Impact Levels</option>
            <option value="high">High Impact</option>
            <option value="medium">Medium Impact</option>
            <option value="low">Low Impact</option>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <CardsSkeleton count={6} />
      ) : error ? (
        <ErrorState
          title="Could not load insights"
          message="An error occurred while fetching insights from QuickBit Live engine."
          onRetry={() => refetch()}
        />
      ) : filteredInsights.length === 0 ? (
        <EmptyState
          icon={<BrainCircuit className="w-8 h-8 text-brand dark:text-indigo-400" />}
          title="No insights generated yet"
          description="Connect a signal source and the engine will automatically synthesize strategic insights."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredInsights.map((insight) => {
            const impact = insight.impact?.toLowerCase();
            return (
              <div
                key={insight.id}
                className="p-5 bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl hover:border-brand-border dark:hover:border-indigo-800/60 transition-all space-y-4 shadow-2xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          impact === 'high'
                            ? 'error'
                            : impact === 'medium'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {impact ? `${impact.toUpperCase()} IMPACT` : 'INSIGHT'}
                      </Badge>
                      {insight.type && (
                        <Badge variant="outline" size="sm">
                          {insight.type}
                        </Badge>
                      )}
                    </div>

                    {typeof insight.confidence === 'number' && (
                      <span className="text-[11px] font-mono font-semibold text-muted dark:text-slate-400">
                        {Math.round(insight.confidence * 100)}% Confidence
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-ink dark:text-white leading-snug">
                    {insight.title}
                  </h3>

                  <p className="text-xs text-muted dark:text-slate-300 leading-relaxed">
                    {insight.description || insight.content}
                  </p>

                  {insight.recommendations && insight.recommendations.length > 0 && (
                    <div className="pt-2 border-t border-line-light dark:border-ink-2 space-y-1.5">
                      <span className="text-[11px] font-bold text-muted dark:text-slate-400 uppercase tracking-wider block">
                        Action Items
                      </span>
                      {insight.recommendations.map((rec: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-ink dark:text-slate-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{typeof rec === 'string' ? rec : rec.title || rec.content}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-line-light dark:border-ink-2 flex items-center justify-between text-xs">
                  <span className="text-muted dark:text-slate-400 font-medium">
                    {insight.evidence_count || insight.signals_count || 0} supporting signals
                  </span>

                  <button
                    onClick={() => onNavigate('recommendations')}
                    className="text-xs font-semibold text-brand dark:text-indigo-400 hover:text-brand-hover dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    View Roadmap <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
