import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layers, MessageSquare, ArrowRight, ShieldAlert } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { CardsSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { engineService } from '../../services/engine.service';
import { AUTO_REFRESH_INTERVAL } from '../../lib/api/queryClient';
import { Cluster, CaseItem } from '../../types/api';

interface ClustersViewProps {
  onNavigate: (tab: string) => void;
}

export const ClustersView: React.FC<ClustersViewProps> = ({ onNavigate }) => {
  const { activeWorkspace, activeProject } = useAuth();
  const [activeTab, setActiveTab] = useState<'clusters' | 'cases'>('clusters');

  const workspaceId = activeWorkspace?.id || '';
  const projectId = activeProject?.id;

  const {
    data: clusters = [],
    isLoading: isLoadingClusters,
  } = useQuery<Cluster[]>({
    queryKey: ['clusters', workspaceId, projectId],
    queryFn: () => engineService.getClusters(workspaceId, projectId),
    enabled: !!workspaceId,
    refetchInterval: AUTO_REFRESH_INTERVAL,
  });

  const {
    data: cases = [],
    isLoading: isLoadingCases,
  } = useQuery<CaseItem[]>({
    queryKey: ['cases', workspaceId, projectId],
    queryFn: () => engineService.getCases(workspaceId, projectId),
    enabled: !!workspaceId,
    refetchInterval: AUTO_REFRESH_INTERVAL,
  });

  const isLoading = isLoadingClusters || isLoadingCases;

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line-light dark:border-ink-2">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-ink dark:text-white">
            Semantic Clusters & Cases
          </h1>
          <p className="text-xs text-muted dark:text-slate-400 mt-1">
            Machine-synthesized groups aggregating similar customer signals into cohesive product problem themes.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 bg-white dark:bg-ink-2 border border-line dark:border-slate-700 rounded-xl shadow-2xs">
          <button
            onClick={() => setActiveTab('clusters')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'clusters'
                ? 'bg-brand text-white shadow-xs'
                : 'text-muted dark:text-slate-400 hover:text-ink dark:hover:text-white'
            }`}
          >
            Clusters ({clusters.length})
          </button>
          <button
            onClick={() => setActiveTab('cases')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'cases'
                ? 'bg-brand text-white shadow-xs'
                : 'text-muted dark:text-slate-400 hover:text-ink dark:hover:text-white'
            }`}
          >
            Cases ({cases.length})
          </button>
        </div>
      </div>

      {isLoading ? (
        <CardsSkeleton count={6} />
      ) : activeTab === 'clusters' ? (
        clusters.length === 0 ? (
          <EmptyState
            icon={<Layers className="w-8 h-8 text-muted-light dark:text-slate-500" />}
            title="No semantic clusters formed"
            description="The QuickBit Live Intelligence Engine will cluster signals automatically as more customer feedback is ingested."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clusters.map((cluster) => (
              <div
                key={cluster.id}
                className="p-5 bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl hover:border-brand-border dark:hover:border-indigo-800/60 transition-all space-y-3.5 shadow-2xs flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="accent" size="sm">
                      <Layers className="w-3 h-3" />
                      Cluster
                    </Badge>
                    {typeof cluster.confidence === 'number' && (
                      <span className="text-[11px] font-mono font-semibold text-muted dark:text-slate-400">
                        {Math.round(cluster.confidence * 100)}% Confidence
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-ink dark:text-white leading-snug">
                    {cluster.name || cluster.title || 'Signal Theme'}
                  </h3>

                  <p className="text-xs text-muted dark:text-slate-300 leading-relaxed">
                    {cluster.summary || cluster.description || 'Aggregated topic of recurring customer signals.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-line-light dark:border-ink-2 flex items-center justify-between text-xs text-muted dark:text-slate-400">
                  <div className="flex items-center gap-1.5 font-semibold text-ink dark:text-white">
                    <MessageSquare className="w-3.5 h-3.5 text-brand dark:text-indigo-400" />
                    <span>{cluster.signal_count || cluster.count || 0} signals</span>
                  </div>

                  <button
                    onClick={() => onNavigate('signals')}
                    className="text-xs font-semibold text-brand dark:text-indigo-400 hover:text-brand-hover dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    Explore <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        cases.length === 0 ? (
          <EmptyState
            icon={<ShieldAlert className="w-8 h-8 text-muted-light dark:text-slate-500" />}
            title="No problem cases open"
            description="Specific customer friction cases and root causes will appear here when identified by the AI engine."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="p-5 bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <Badge
                    variant={caseItem.severity === 'high' ? 'error' : caseItem.severity === 'medium' ? 'warning' : 'neutral'}
                    size="sm"
                  >
                    {caseItem.severity ? `${caseItem.severity.toUpperCase()} SEVERITY` : 'CASE'}
                  </Badge>
                  {caseItem.status && (
                    <span className="text-xs font-mono font-semibold text-muted dark:text-slate-400 capitalize">
                      {caseItem.status}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-ink dark:text-white">{caseItem.title}</h3>

                {caseItem.description && (
                  <p className="text-xs text-muted dark:text-slate-300 leading-relaxed">{caseItem.description}</p>
                )}

                {caseItem.root_cause && (
                  <div className="p-3 bg-surface dark:bg-ink-2/60 border border-line dark:border-slate-800 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-ink dark:text-white block">Root Cause Analysis</span>
                    <p className="text-muted dark:text-slate-300">{caseItem.root_cause}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
