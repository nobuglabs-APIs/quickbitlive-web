import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart as PieIcon } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { Badge } from '../../components/ui/Badge';
import { CardsSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { engineService } from '../../services/engine.service';
import { AUTO_REFRESH_INTERVAL } from '../../lib/api/queryClient';
import { Signal } from '../../types/api';

const COLORS = ['#4F46E5', '#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#94A3B8'];

interface SourceRow {
  name: string;
  count: number;
  color: string;
}

export const SourcesView: React.FC = () => {
  const { activeWorkspace, activeProject } = useAuth();
  const { isDark } = useTheme();

  const workspaceId = activeWorkspace?.id || '';
  const projectId = activeProject?.id;

  const {
    data: signals = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Signal[]>({
    queryKey: ['signals', workspaceId, projectId],
    queryFn: () => engineService.listSignals(workspaceId, projectId),
    enabled: !!workspaceId,
    refetchInterval: AUTO_REFRESH_INTERVAL,
  });

  const sources = useMemo<SourceRow[]>(() => {
    const map = new Map<string, number>();
    signals.forEach((s) => {
      const name = (s.source || 'widget').trim() || 'widget';
      map.set(name, (map.get(name) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count], idx) => ({
        name,
        count,
        color: COLORS[idx % COLORS.length],
      }))
      .sort((a, b) => b.count - a.count);
  }, [signals]);

  const total = sources.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line-light dark:border-ink-2">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-ink dark:text-white">
            Signal Sources
          </h1>
          <p className="text-xs text-muted dark:text-slate-400 mt-1">
            Breakdown of customer signals by ingestion source.
          </p>
        </div>
      </div>

      {isLoading ? (
        <CardsSkeleton count={3} />
      ) : error ? (
        <ErrorState
          title="Could not load sources"
          message="An error occurred while fetching signal sources."
          onRetry={() => refetch()}
        />
      ) : sources.length === 0 ? (
        <EmptyState
          icon={<PieIcon className="w-8 h-8 text-muted-light dark:text-slate-500" />}
          title="No sources yet"
          description="Signals ingested from your widget, API, or integrations will be grouped here by source."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl p-6 shadow-2xs flex items-center justify-center">
            <div className="relative w-60 h-60 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sources}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    strokeWidth={0}
                  >
                    {sources.map((s, i) => (
                      <Cell key={`cell-${i}`} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                      color: isDark ? '#FFFFFF' : '#0F172A',
                      borderRadius: '10px',
                      border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-extrabold text-ink dark:text-white leading-tight">
                  {total}
                </span>
                <span className="text-[10px] text-muted-light dark:text-slate-500 font-medium uppercase">
                  Total Signals
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-ink dark:text-white">Distribution</h3>
            <div className="space-y-3">
              {sources.map((s) => {
                const pct = total ? Math.round((s.count / total) * 100) : 0;
                return (
                  <div key={s.name} className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-xs font-medium text-muted-strong dark:text-slate-300 capitalize flex-1 truncate">
                      {s.name}
                    </span>
                    <Badge variant="neutral" size="sm">
                      {s.count}
                    </Badge>
                    <span className="text-xs font-semibold text-ink dark:text-white w-10 text-right">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
