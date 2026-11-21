import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { CardsSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useAuth } from '../../context/AuthContext';
import { engineService } from '../../services/engine.service';
import { AUTO_REFRESH_INTERVAL } from '../../lib/api/queryClient';
import { HistoryItem } from '../../types/api';

const fmtDate = (value?: string | null) => {
  if (!value) return '—';
  const d = new Date(value);
  return isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const HistoryView: React.FC = () => {
  const { activeWorkspace, activeProject } = useAuth();

  const workspaceId = activeWorkspace?.id || '';
  const projectId = activeProject?.id;

  const {
    data: items = [],
    isLoading,
    error,
    refetch,
  } = useQuery<HistoryItem[]>({
    queryKey: ['historyItems', workspaceId, projectId],
    queryFn: () => engineService.getHistoryItems(workspaceId, projectId),
    enabled: !!workspaceId,
    refetchInterval: AUTO_REFRESH_INTERVAL,
  });

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line-light dark:border-ink-2">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-ink dark:text-white">
            History
          </h1>
          <p className="text-xs text-muted dark:text-slate-400 mt-1">
            Resolved problems and their recorded outcomes. New signals to the same problem bring it back as a regression.
          </p>
        </div>
      </div>

      {isLoading ? (
        <CardsSkeleton count={4} />
      ) : error ? (
        <ErrorState
          title="Could not load history"
          message="An error occurred while fetching the history of resolved problems."
          onRetry={() => refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<History className="w-8 h-8 text-muted-light dark:text-slate-500" />}
          title="No resolved problems yet"
          description="When a decision is logged as solved, the related signals, cases and decisions move here automatically."
        />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl space-y-3 shadow-2xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="success" size="sm">
                    <CheckCircle2 className="w-3 h-3" />
                    Resolved
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    {item.attempts ?? 0} attempt{item.attempts === 1 ? '' : 's'}
                  </Badge>
                  {typeof item.success_rate === 'number' && (
                    <Badge
                      variant={item.success_rate >= 0.5 ? 'success' : 'neutral'}
                      size="sm"
                    >
                      {(item.success_rate * 100).toFixed(0)}% success
                    </Badge>
                  )}
                </div>
                <span className="text-[11px] text-muted-light dark:text-slate-500 font-mono">
                  Resolved {fmtDate(item.resolved_at)}
                </span>
              </div>

              <h3 className="text-sm font-bold text-ink dark:text-white">
                {item.cluster_title || item.problem_key}
              </h3>

              {item.decision_reason && (
                <p className="text-xs text-muted dark:text-slate-300 leading-relaxed">{item.decision_reason}</p>
              )}

              {item.action && (
                <p className="text-xs text-muted dark:text-slate-400 leading-relaxed">
                  <span className="font-semibold text-muted-strong dark:text-slate-300">Action:</span> {item.action}
                </p>
              )}

              {item.outcome && (
                <div className="p-3 bg-surface dark:bg-ink-2/60 border border-line dark:border-slate-800 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-ink dark:text-white block text-emerald-600 dark:text-emerald-400">
                    Recorded Outcome
                  </span>
                  <p className="text-muted dark:text-slate-300">{item.outcome}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};