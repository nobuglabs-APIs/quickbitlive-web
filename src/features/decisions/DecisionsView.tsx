import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Target } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CardsSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { DecisionOutcomeModal } from '../../components/modals/DecisionOutcomeModal';
import { DecisionDetailsModal } from '../../components/modals/DecisionDetailsModal';
import { useAuth } from '../../context/AuthContext';
import { engineService } from '../../services/engine.service';
import { AUTO_REFRESH_INTERVAL } from '../../lib/api/queryClient';
import { Decision } from '../../types/api';

const statusVariant = (
  status?: string
): 'success' | 'warning' | 'neutral' | 'info' => {
  if (!status) return 'neutral';
  const s = status.toLowerCase();
  if (s === 'executed' || s === 'resolved' || s === 'solved') return 'success';
  if (s === 'in_progress' || s === 'pending') return 'warning';
  return 'neutral';
};

export const DecisionsView: React.FC = () => {
  const { activeWorkspace, activeProject } = useAuth();
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [detailsDecision, setDetailsDecision] = useState<Decision | null>(null);

  const workspaceId = activeWorkspace?.id || '';
  const projectId = activeProject?.id;
  const queryClient = useQueryClient();

  const refreshEngineLists = React.useCallback(() => {
    ['decisions', 'signals', 'clusters', 'cases', 'insights', 'recommendations', 'historyItems'].forEach((key) => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });
  }, [queryClient]);

  const {
    data: decisions = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Decision[]>({
    queryKey: ['decisions', workspaceId, projectId],
    queryFn: () => engineService.getDecisions(workspaceId, projectId),
    enabled: !!workspaceId,
    refetchInterval: AUTO_REFRESH_INTERVAL,
  });

  const rankedDecisions = React.useMemo(() => [...decisions].sort((a, b) => {
    const rankA = typeof a.rank === 'number' ? a.rank : Number.MAX_SAFE_INTEGER;
    const rankB = typeof b.rank === 'number' ? b.rank : Number.MAX_SAFE_INTEGER;
    if (rankA !== rankB) return rankA - rankB;
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  }), [decisions]);

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line-light dark:border-ink-2">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-ink dark:text-white">
            Decisions &amp; Outcomes
          </h1>
          <p className="text-xs text-muted dark:text-slate-400 mt-1">
            Executed product decisions and their recorded outcomes, closing the AI feedback loop.
          </p>
        </div>
      </div>

      {isLoading ? (
        <CardsSkeleton count={6} />
      ) : error ? (
        <ErrorState
          title="Could not load decisions"
          message="An error occurred while fetching decisions from QuickBit Live engine."
          onRetry={() => refetch()}
        />
      ) : decisions.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="w-8 h-8 text-muted-light dark:text-slate-500" />}
          title="No decisions logged yet"
          description="When recommendations are turned into shipped features, log the outcomes here to train the AI engine."
        />
      ) : (
        <div className="space-y-4">
          {rankedDecisions.map((decision) => (
            <div
              key={decision.id}
              className="p-5 bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl space-y-3 shadow-2xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="accent" size="sm">
                    <Target className="w-3 h-3" />
                    {typeof decision.rank === 'number' ? `RANK #${decision.rank}` : 'DECISION'}
                  </Badge>
                  {decision.priority && <Badge variant={decision.priority === 'high' ? 'error' : decision.priority === 'medium' ? 'warning' : 'neutral'} size="sm">{decision.priority} priority</Badge>}
                  {decision.status ? (
                    <Badge variant={statusVariant(decision.status)} size="sm">
                      {decision.status.replace(/_/g, ' ')}
                    </Badge>
                  ) : (
                    <Badge
                      variant={decision.solved ? 'success' : 'neutral'}
                      size="sm"
                    >
                      {decision.solved ? 'Solved' : 'Open'}
                    </Badge>
                  )}
                  {decision.created_at && (
                    <span className="text-[11px] text-muted-light dark:text-slate-500 font-mono">
                      {new Date(decision.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => setDetailsDecision(decision)}>View details</Button><Button variant="outline" size="sm" onClick={() => setSelectedDecision(decision)}>Log Outcome</Button></div>
              </div>

              <h3 className="text-sm font-bold text-ink dark:text-white">{decision.narrative?.title || decision.recommendation?.title || decision.title}</h3>

              {(decision.narrative?.executive_summary || decision.description || decision.recommendation?.action) && (
                <p className="text-xs text-muted dark:text-slate-300 leading-relaxed">
                  {decision.narrative?.executive_summary || decision.description || decision.recommendation?.action}
                </p>
              )}

              {decision.outcome && (
                <div className="p-3 bg-surface dark:bg-ink-2/60 border border-line dark:border-slate-800 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-ink dark:text-white block text-emerald-600 dark:text-emerald-400">
                    Recorded Outcome
                  </span>
                  <p className="text-muted dark:text-slate-300">{decision.outcome}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <DecisionOutcomeModal
        decision={selectedDecision}
        isOpen={!!selectedDecision}
        onClose={() => setSelectedDecision(null)}
        onSuccess={refreshEngineLists}
      />
      <DecisionDetailsModal decision={detailsDecision} isOpen={!!detailsDecision} onClose={() => setDetailsDecision(null)} />
    </div>
  );
};
