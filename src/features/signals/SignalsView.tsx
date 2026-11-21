import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  MessageSquare,
  Search,
  Plug,
  Globe,
  User,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { FeedbackListSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useAuth } from '../../context/AuthContext';
import { engineService } from '../../services/engine.service';
import { Signal } from '../../types/api';

interface SignalsViewProps {
  onOpenInstall: () => void;
  onSelectSignal: (signal: Signal) => void;
}

export const isSentimentMatch = (value: string, filter: string): boolean => {
  if (filter === 'all') return true;
  if (!value) return false;
  const f = filter.toLowerCase();
  const v = value.toLowerCase();
  if (v === f) return true;
  if (f === 'churn_risk') return v.includes('churn') || v.includes('risk');
  if (f === 'frustrated') return v.includes('frust');
  return v.includes(f) || f.includes(v);
};

// The API returns `received_at` (timestamp of arrival); fall back to
// `created_at` for older payloads that only carried that field.
const sorterTime = (s: Signal): number => {
  const t = s.received_at || s.created_at;
  if (!t) return 0;
  const ms = new Date(t).getTime();
  return Number.isNaN(ms) ? 0 : ms;
};

export const SignalsView: React.FC<SignalsViewProps> = ({ onOpenInstall, onSelectSignal }) => {
  const { activeWorkspace, activeProject } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

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
  });

  const filteredSignals = useMemo(() => {
    return signals
      .filter((s) => {
        const matchesSearch =
          s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.metadata?.user_email &&
            s.metadata.user_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (s.source && s.source.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesSource =
          sourceFilter === 'all' ||
          (s.source &&
            (s.source.toLowerCase().includes(sourceFilter.toLowerCase()) ||
              sourceFilter.toLowerCase().includes(s.source.toLowerCase())));

        const normalizedSentiment = (s.sentiment || s.metadata?.sentiment || '').toLowerCase();
        const matchesSentiment = isSentimentMatch(normalizedSentiment, sentimentFilter);

        return matchesSearch && matchesSource && matchesSentiment;
      })
      .sort((a, b) => {
        const timeA = sorterTime(a);
        const timeB = sorterTime(b);
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [signals, searchQuery, sourceFilter, sentimentFilter, sortOrder]);

  // Reset to the first page whenever filters or sort order change.
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sourceFilter, sentimentFilter, sortOrder]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSignals.length / PAGE_SIZE)
  );
  const safePage = Math.min(currentPage, totalPages);
  const paginatedSignals = filteredSignals.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line-light dark:border-ink-2">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-ink dark:text-white">
            Customer Signals & Feedback
          </h1>
          <p className="text-xs text-muted dark:text-slate-400 mt-1">
            Real-time feed of ingested feedback, support conversations, and feature requests.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenInstall}
          leftIcon={<Plug className="w-3.5 h-3.5" />}
        >
          Connect Widget
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white dark:bg-ink p-3.5 border border-line-light dark:border-ink-2 rounded-2xl shadow-2xs">
        <div className="lg:col-span-2">
          <Input
            placeholder="Search feedback text, email, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <Select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
        >
          <option value="all">All Sources</option>
          <option value="widget">Iris Web Widget</option>
          <option value="api">REST API</option>
          <option value="email">Email</option>
          <option value="intercom">Intercom / Helpdesk</option>
          <option value="slack">Slack</option>
          <option value="sales_call">Sales Calls</option>
        </Select>

        <Select
          value={sentimentFilter}
          onChange={(e) => setSentimentFilter(e.target.value)}
        >
          <option value="all">All Sentiments</option>
          <option value="positive">Positive (+)</option>
          <option value="neutral">Neutral (•)</option>
          <option value="frustrated">Frustrated (!)</option>
          <option value="churn_risk">Churn Risk (⚠)</option>
        </Select>
      </div>

      {/* Signals List / Table */}
      {isLoading ? (
        <FeedbackListSkeleton count={6} />
      ) : error ? (
        <ErrorState
          title="Could not load signals"
          message="There was an error communicating with the QuickBit Live signals endpoint."
          onRetry={() => refetch()}
        />
      ) : filteredSignals.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="w-8 h-8 text-muted-light dark:text-slate-500" />}
          title={searchQuery || sourceFilter !== 'all' ? 'No matching signals' : 'No signals yet'}
          description={
            searchQuery || sourceFilter !== 'all'
              ? 'Try adjusting your search criteria or resetting filters.'
              : 'Signals arrive automatically from your Iris widget and API webhooks — you only need to connect a source once.'
          }
          actionLabel="Connect a Signal Source"
          onAction={onOpenInstall}
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted dark:text-slate-400 px-1">
            <span>
              Showing {filteredSignals.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filteredSignals.length)} of {filteredSignals.length} signals
            </span>
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1 hover:text-brand dark:hover:text-indigo-400 transition-colors cursor-pointer font-medium"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}</span>
            </button>
          </div>

          <div className="divide-y divide-line-light dark:divide-ink-2 border border-line-light dark:border-ink-2 rounded-2xl bg-white dark:bg-ink overflow-hidden shadow-2xs">
            {paginatedSignals.map((signal) => {
              const formattedDate = signal.received_at || signal.created_at
                ? new Date(signal.received_at || signal.created_at!).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Recent';

              const sentiment = signal.sentiment || signal.metadata?.sentiment;
              const userEmail = signal.metadata?.user_email || signal.metadata?.email;

              return (
                <div
                  key={signal.id}
                  onClick={() => onSelectSignal(signal)}
                  className="p-4 hover:bg-surface dark:hover:bg-ink-2/60 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <Badge variant="accent" size="sm">
                        <Globe className="w-3 h-3" />
                        {signal.source || 'widget'}
                      </Badge>

                      {sentiment && (
                        <Badge
                          variant={
                            sentiment.includes('pos')
                              ? 'success'
                              : sentiment.includes('risk') || sentiment.includes('frust')
                              ? 'error'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {sentiment}
                        </Badge>
                      )}

                      {userEmail && (
                        <span className="text-[11px] text-muted dark:text-slate-400 flex items-center gap-1 font-mono">
                          <User className="w-3 h-3" />
                          {userEmail}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-ink dark:text-slate-200 leading-relaxed line-clamp-2">
                      {signal.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-xs text-muted-light dark:text-slate-500">
                    <span className="font-mono text-[11px]">{formattedDate}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 px-1">
              <p className="text-xs text-muted dark:text-slate-400">
                Page {safePage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-line dark:border-slate-700 bg-white dark:bg-ink text-muted-strong dark:text-slate-300 hover:bg-surface dark:hover:bg-ink-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - safePage) <= 1
                  )
                  .reduce<number[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) {
                      acc.push(-1);
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === -1 ? (
                      <span key={`ellipsis-${idx}`} className="text-xs text-muted-light dark:text-slate-500 px-1">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`min-w-8 h-8 px-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                          p === safePage
                            ? 'bg-brand text-white'
                            : 'border border-line dark:border-slate-700 bg-white dark:bg-ink text-muted-strong dark:text-slate-300 hover:bg-surface dark:hover:bg-ink-2'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-line dark:border-slate-700 bg-white dark:bg-ink text-muted-strong dark:text-slate-300 hover:bg-surface dark:hover:bg-ink-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
