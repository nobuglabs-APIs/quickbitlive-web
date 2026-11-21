import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  Lightbulb,
  Calendar,
  Bell,
  TrendingUp,
  Users,
  Clock,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useIsTabActive } from '../../hooks/useIsTabActive';
import { engineService } from '../../services/engine.service';
import { AUTO_REFRESH_INTERVAL } from '../../lib/api/queryClient';
import { Signal, Insight, Recommendation, Snapshot, Cluster, TrendItem, Decision } from '../../types/api';

interface OverviewViewProps {
  onNavigate: (tab: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigate,
}) => {
  const { activeWorkspace, activeProject } = useAuth();
  const { isDark } = useTheme();
  const [timeframe, setTimeframe] = useState<'7D' | '14D' | '30D'>('7D');
  const [isTimeframeOpen, setIsTimeframeOpen] = useState(false);

  const isTabActive = useIsTabActive();
  const pollInterval = isTabActive ? AUTO_REFRESH_INTERVAL : false;

  const workspaceId = activeWorkspace?.id || '';
  const projectId = activeProject?.id;
  const hasProject = !!activeProject?.id;

  // Onboarding dismissal persists per workspace
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  React.useEffect(() => {
    try {
      setOnboardingDismissed(localStorage.getItem(`qb_onboarding_${workspaceId || 'none'}`) === 'done');
    } catch {
      setOnboardingDismissed(false);
    }
  }, [workspaceId]);
  const dismissOnboarding = () => {
    try {
      localStorage.setItem(`qb_onboarding_${workspaceId || 'none'}`, 'done');
    } catch { /* storage unavailable */ }
    setOnboardingDismissed(true);
  };

  const { data: snapshot } = useQuery<Snapshot>({
    queryKey: ['snapshot', workspaceId, projectId],
    queryFn: () => engineService.getSnapshot(workspaceId, projectId),
    enabled: !!workspaceId,
    refetchInterval: pollInterval,
  });

  const { data: signals = [] } = useQuery<Signal[]>({
    queryKey: ['signals', workspaceId, projectId],
    queryFn: () => engineService.listSignals(workspaceId, projectId),
    enabled: !!workspaceId,
    refetchInterval: pollInterval,
  });

  const { data: insights = [] } = useQuery<Insight[]>({
    queryKey: ['insights', workspaceId, projectId],
    queryFn: () => engineService.getInsights(workspaceId, projectId),
    enabled: !!workspaceId,
    refetchInterval: pollInterval,
  });

  const { data: recommendations = [] } = useQuery<Recommendation[]>({
    queryKey: ['recommendations', workspaceId, projectId],
    queryFn: () => engineService.getRecommendations(workspaceId, projectId),
    enabled: !!workspaceId,
    refetchInterval: pollInterval,
  });

  const { data: decisions = [] } = useQuery<Decision[]>({
    queryKey: ['decisions', workspaceId, projectId],
    queryFn: () => engineService.getDecisions(workspaceId, projectId),
    enabled: !!workspaceId,
    refetchInterval: pollInterval,
  });

  const { data: clusters = [] } = useQuery<Cluster[]>({
    queryKey: ['clusters', workspaceId, projectId],
    queryFn: () => engineService.getClusters(workspaceId, projectId),
    enabled: !!workspaceId,
    refetchInterval: pollInterval,
  });

  const { data: trends = [] } = useQuery<TrendItem[] | Record<string, any>>({
    queryKey: ['trends', workspaceId, projectId],
    queryFn: () => engineService.getTrends(workspaceId, projectId) as Promise<TrendItem[] | Record<string, any>>,
    enabled: !!workspaceId,
    refetchInterval: pollInterval,
  });

  // Onboarding progress: guides new users to their first decision
  const hasSignals = signals.length > 0;
  const hasCases = clusters.length > 0;
  const hasDecision = decisions.length > 0;
  const isEmpty = hasProject && !hasSignals && !hasDecision;
  const onboardingSteps = [
    { id: 'source', title: 'Connect a source', desc: 'Widget, API or email — one is enough.', done: hasSignals, tab: 'signals', action: 'Connect source' },
    { id: 'case', title: 'Review your first case', desc: 'Signals group into cases automatically.', done: hasCases, tab: 'clusters', action: 'View cases' },
    { id: 'decision', title: 'Log your first decision', desc: 'Pick a recommendation and record it.', done: hasDecision, tab: 'decisions', action: 'Log decision' },
  ];
  const onboardingDoneCount = onboardingSteps.filter((s) => s.done).length;
  const showChecklist = hasProject && onboardingDoneCount < onboardingSteps.length && !onboardingDismissed;

  // Source distribution built from real ingested signals
  const sourceData = React.useMemo(() => {
    const map = new Map<string, number>();
    signals.forEach((s) => {
      const name = (s.source || 'widget').trim() || 'widget';
      map.set(name, (map.get(name) || 0) + 1);
    });
    const colors = ['#4F46E5', '#06B6D4', '#F59E0B', '#3B82F6', '#94A3B8', '#10B981', '#EF4444'];
    return Array.from(map.entries())
      .map(([name, value], idx) => ({ name, value, color: colors[idx % colors.length] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [signals]);

  const sourceTotal = sourceData.reduce((acc, s) => acc + s.value, 0);

  // The trends endpoint has evolved across API versions. Normalize its known
  // response shapes, then fall back to the timestamps on the real signals.
  const areaChartData = React.useMemo<{ date: string; count: number }[]>(() => {
    const points = new Map<string, number>();
    const addPoint = (dateValue: unknown, value: unknown) => {
      const count = Number(value);
      if (!dateValue || !Number.isFinite(count) || count <= 0) return;
      const parsedDate = new Date(String(dateValue));
      const date = Number.isNaN(parsedDate.getTime())
        ? String(dateValue)
        : parsedDate.toISOString().slice(0, 10);
      points.set(date, (points.get(date) || 0) + count);
    };
    const collectTrendPoints = (value: any, fallbackDate?: string, depth = 0) => {
      if (depth > 3 || value === null || value === undefined) return;
      if (Array.isArray(value)) return value.forEach((item) => collectTrendPoints(item, fallbackDate, depth + 1));
      if (typeof value === 'number') return addPoint(fallbackDate, value);
      if (typeof value !== 'object') return;
      const count = value.count ?? value.volume ?? value.signals_count ?? value.signal_count ?? value.total ?? value.value ?? value.signals?.length;
      const date = value.date ?? value.period ?? value.day ?? value.timestamp ?? value.created_at ?? fallbackDate;
      if (count !== undefined && date) addPoint(date, count);
      Object.entries(value).forEach(([key, nested]) => {
        if (['count', 'volume', 'signals_count', 'signal_count', 'total', 'value', 'date', 'period', 'day', 'timestamp', 'created_at'].includes(key)) return;
        collectTrendPoints(nested, date || key, depth + 1);
      });
    };

    collectTrendPoints(trends);

    // A populated signals list is the source of truth if /trends is unavailable
    // or returns no usable buckets for the selected workspace/project.
    if (points.size === 0) {
      signals.forEach((signal) => addPoint(signal.created_at || (signal as any).timestamp || (signal as any).received_at, 1));
    }

    return Array.from(points.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [trends, signals]);

  const chartData = React.useMemo(() => {
    const n = timeframe === '7D' ? 7 : timeframe === '14D' ? 14 : 30;
    return areaChartData.slice(-n);
  }, [areaChartData, timeframe]);

  const chartMax = Math.max(1, ...chartData.map((p) => p.count));
  const niceMax = chartMax * 1.15;

  const topIssues = React.useMemo(() => clusters
    .map((cluster) => {
      const apiCount = Number(cluster.signal_count ?? cluster.count ?? 0);
      const embeddedCount = Array.isArray(cluster.signals) ? cluster.signals.length : 0;
      const idCount = Array.isArray(cluster.signal_ids) ? cluster.signal_ids.length : 0;
      const relatedCount = Array.isArray(cluster.related_signals) ? cluster.related_signals.length : 0;
      const evidenceCount = Array.isArray(cluster.evidence) ? cluster.evidence.length : 0;
      const linkedSignals = signals.filter((signal) => signal.cluster_id === cluster.id).length;
      const titleTerms = (cluster.name || cluster.title || cluster.topic || '')
        .toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 3 && !['problem', 'issue', 'product', 'usability'].includes(term));
      const textMatches = titleTerms.length === 0 ? 0 : signals.filter((signal) => {
        const content = String(signal.content || '').toLowerCase();
        return titleTerms.some((term) => content.includes(term));
      }).length;
      return { cluster, count: apiCount > 0 ? apiCount : Math.max(embeddedCount, idCount, relatedCount, evidenceCount, linkedSignals, textMatches) };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5), [clusters, signals]);

  const totalSignals = snapshot?.total_signals ?? signals.length;
  const activeClusters = clusters.length;

  const growthPct = React.useMemo(() => {
    if (chartData.length < 4) return null;
    const half = Math.ceil(chartData.length / 2);
    const recent = chartData.slice(half).reduce((sum, p) => sum + p.count, 0);
    const previous = chartData.slice(0, half).reduce((sum, p) => sum + p.count, 0);
    if (!previous) return null;
    return Math.round(((recent - previous) / previous) * 100);
  }, [chartData]);

  // Highlighted Top Recommendation: source it from the RANK 1 decision
  // (not insertion order), falling back to the first recommendation if no
  // decision exists yet.
  const topDecision = decisions.length > 0
    ? [...decisions].sort((a, b) => (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER))[0]
    : null;
  const topRec = topDecision?.recommendation || (recommendations.length > 0 ? recommendations[0] : null);
  // Full Recommendation row for rich metrics (impact/effort/risk), matched by
  // the decision's linked recommendation id, else the first standalone one.
  const topRecMetrics =
    (topDecision?.recommendation?.id &&
      recommendations.find((r) => r.id === topDecision.recommendation!.id)) ||
    recommendations[0] ||
    null;
  const impactPct = topRecMetrics?.expected_impact != null ? Math.round(topRecMetrics.expected_impact * 100) : null;
  const effortPct = topRecMetrics?.effort != null && Number.isFinite(Number(topRecMetrics.effort)) ? Math.round(Number(topRecMetrics.effort) * 100) : null;
  const riskPct = topRecMetrics?.risk != null ? Math.round(topRecMetrics.risk * 100) : null;
  const confidenceScore = topRec?.confidence ? Math.round(topRec.confidence * 100) : 0;
  const recommendedAction = topRec?.action || topRec?.title || null;

  // Mini bar-sparkline built from the cluster's OWN signals bucketed by day,
  // so it reflects real data whenever it exists (falls back to flat when empty).
  const renderSparkline = (cluster: Cluster) => {
    const byDay = new Map<string, number>();
    const items = Array.isArray(cluster.signals)
      ? (cluster.signals as any[]).filter((s) => s && s.created_at)
      : [];
    items.forEach((s) => {
      const date = new Date(s.created_at).toISOString().slice(0, 10);
      byDay.set(date, (byDay.get(date) || 0) + 1);
    });
    const points = Array.from(byDay.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([, n]) => n);
    const max = Math.max(1, ...points);
    const bucketCount = Math.max(6, points.length);
    const buckets = new Array(bucketCount).fill(0);
    points.forEach((n, idx) => {
      buckets[Math.floor((idx / Math.max(1, points.length)) * bucketCount)] += n;
    });
    return (
      <svg className="w-14 h-5 overflow-visible shrink-0" viewBox="0 0 60 20" preserveAspectRatio="none">
        {buckets.map((n, i) => {
          const h = max > 0 ? Math.max(2, (n / max) * 18) : 2;
          const y = 20 - h;
          return (
            <rect
              key={i}
              x={i * (60 / bucketCount)}
              y={y}
              width={Math.max(2, 60 / bucketCount - 1)}
              height={h}
              fill={isDark ? '#64748B' : '#CBD5E1'}
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="p-3 lg:p-5 max-w-[1400px] mx-auto space-y-3 font-sans antialiased text-ink dark:text-frost transition-colors duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-ink dark:text-white">
            Overview
          </h1>
          <p className="text-xs sm:text-sm text-muted dark:text-slate-400 mt-0.5">
            Real-time product intelligence
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Live Data Pill */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-ink border border-line dark:border-slate-800 rounded-xl text-xs font-medium text-ink-3 dark:text-slate-300 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-muted dark:text-slate-400" />
            <span>Last {timeframe === '7D' ? 7 : timeframe === '14D' ? 14 : 30} days</span>
            <span className="ml-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Live data" />
          </div>

          {/* Notification Bell */}
          <button
            onClick={() => {
              onNavigate('insights');
            }}
            className="relative p-2.5 bg-white dark:bg-ink hover:bg-surface dark:hover:bg-slate-800 border border-line dark:border-slate-800 rounded-xl text-muted dark:text-slate-400 hover:text-ink dark:hover:text-white shadow-2xs transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Onboarding checklist */}
      {showChecklist && (
        <div className="bg-white dark:bg-ink rounded-2xl p-5 border border-line-light dark:border-ink-2 shadow-[0_4px_25px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.2)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-ink dark:text-white tracking-tight">
                Get set up in 3 steps
              </h2>
              <p className="text-xs text-muted dark:text-slate-400 mt-0.5">
                {onboardingDoneCount} of {onboardingSteps.length} complete — finish setup to unlock recommendations.
              </p>
            </div>
            <button
              onClick={dismissOnboarding}
              aria-label="Dismiss setup guide"
              className="p-1.5 rounded-lg text-muted-light dark:text-slate-500 hover:text-ink dark:hover:text-white hover:bg-surface dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {onboardingSteps.map((step, idx) => (
              <div
                key={step.id}
                className={`rounded-xl border p-3.5 flex flex-col gap-2 ${
                  step.done
                    ? 'border-line dark:border-slate-700 bg-surface dark:bg-ink-2/50'
                    : 'border-line dark:border-slate-700 bg-white dark:bg-ink'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    step.done
                      ? 'bg-emerald-500 text-white'
                      : 'bg-brand-soft dark:bg-brand/15 text-brand dark:text-indigo-300'
                  }`}>
                    {step.done ? <Check className="w-3 h-3" /> : idx + 1}
                  </span>
                  <span className="text-xs font-bold text-ink dark:text-white">{step.title}</span>
                </div>
                <p className="text-[11px] text-muted dark:text-slate-400 leading-relaxed">{step.desc}</p>
                {!step.done && (
                  <button
                    onClick={() => onNavigate(step.tab)}
                    className="mt-auto self-start inline-flex items-center gap-1 text-xs font-semibold text-brand dark:text-indigo-400 hover:text-brand-hover dark:hover:text-indigo-300 cursor-pointer"
                  >
                    {step.action}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hero Section: AI RECOMMENDED DECISION Spotlight Card */}
      <div className="bg-white dark:bg-ink rounded-2xl p-5 border border-line-light dark:border-ink-2 shadow-[0_4px_25px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.2)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Decision & Action */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-brand dark:text-indigo-400 text-[11px] font-bold tracking-wider uppercase">
                <span>AI RECOMMENDED DECISION</span>
              </div>
              {topRec && (
                <div className="flex flex-wrap items-center gap-2">
                  {topRec?.priority && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      {String(topRec.priority).toUpperCase()} PRIORITY
                    </span>
                  )}
                  {topRec?.confidence != null && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      {confidenceScore}% confidence
                    </span>
                  )}
                </div>
              )}
            </div>

            {!topRec ? (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-ink dark:text-white tracking-tight leading-tight">
                  No priority recommendation yet
                </h2>
                <p className="text-xs sm:text-sm text-muted dark:text-slate-400 mt-1.5 leading-relaxed">
                  Once the engine processes your signals, recommended decisions will appear here for you to review and action.
                </p>
                {isEmpty && (
                  <button
                    onClick={() => onNavigate('signals')}
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    <span>Connect your first source</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-ink dark:text-white tracking-tight leading-tight">
                    {topRec?.title}
                  </h2>
                </div>

                {topRec.action && (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5 dark:border-indigo-900/60 dark:bg-indigo-950/25">
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
                      Recommended action
                    </p>
                    <p className="mt-1.5 text-sm font-semibold text-ink dark:text-white">{topRec.action}</p>
                  </div>
                )}

                {topRec.reason && (
                  <div>
                    <h4 className="text-xs font-bold text-ink dark:text-white">Why this matters</h4>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted dark:text-slate-300">{topRec.reason}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2.5 pt-0.5">
                  <div className="rounded-xl border border-line p-2.5 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted dark:text-slate-400">
                      <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
                      Impact
                    </div>
                    <p className="mt-1.5 text-lg font-bold text-ink dark:text-white">
                      {impactPct != null ? `${impactPct}%` : '—'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-line p-2.5 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted dark:text-slate-400">
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      Effort
                    </div>
                    <p className="mt-1.5 text-lg font-bold text-ink dark:text-white">
                      {effortPct != null ? `${effortPct}%` : '—'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-line p-2.5 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted dark:text-slate-400">
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                      Risk
                    </div>
                    <p className="mt-1.5 text-lg font-bold text-ink dark:text-white">
                      {riskPct != null ? `${riskPct}%` : '—'}
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => onNavigate('recommendations')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <span>View recommendation</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('insights')}
                className="px-4 py-2.5 bg-transparent hover:bg-surface dark:hover:bg-ink-2 text-muted-strong dark:text-slate-300 text-xs sm:text-sm font-medium rounded-xl transition-colors cursor-pointer"
              >
                View evidence
              </button>
            </div>
          </div>

          {/* Center Column: Radial Gauge Progress */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center py-1">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                {/* Background Ring */}
                <circle
                  cx="70"
                  cy="70"
                  r="56"
                  stroke={isDark ? '#1E293B' : '#EEF2FF'}
                  strokeWidth="11"
                  fill="transparent"
                />
                {/* Progress Ring with gradient */}
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>
                <circle
                  cx="70"
                  cy="70"
                  r="56"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="11"
                  strokeDasharray={2 * Math.PI * 56}
                  strokeDashoffset={2 * Math.PI * 56 * (1 - confidenceScore / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Inside Gauge Text */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl sm:text-[28px] font-bold text-ink dark:text-white tracking-tight leading-none">
                  {confidenceScore}%
                </span>
                <span className="text-[9px] font-bold text-muted-light dark:text-slate-500 tracking-widest uppercase mt-1">
                  CONFIDENCE
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Key Metrics List */}
          <div className="lg:col-span-4 space-y-3 lg:pl-5 lg:border-l border-line-light dark:border-ink-2">
            {/* Metric 1: Signal growth */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-soft dark:bg-brand/15 flex items-center justify-center text-brand dark:text-indigo-400 shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-ink dark:text-slate-200">
                    {growthPct === null ? '—' : `${growthPct >= 0 ? '+' : ''}${growthPct}%`}
                  </div>
                  <div className="text-[11px] text-muted-light dark:text-slate-500">Signal growth vs previous period</div>
                </div>
              </div>
            </div>

            {/* Metric 2: Signals analyzed */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface dark:bg-ink-2 flex items-center justify-center text-muted dark:text-slate-400 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-ink dark:text-slate-200">{totalSignals.toLocaleString()}</div>
                  <div className="text-[11px] text-muted-light dark:text-slate-500">Total signals analyzed</div>
                </div>
              </div>
            </div>

            {/* Metric 3: Active clusters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface dark:bg-ink-2 flex items-center justify-center text-muted dark:text-slate-400 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-ink dark:text-slate-200">{activeClusters}</div>
                  <div className="text-[11px] text-muted-light dark:text-slate-500">Active clusters</div>
                </div>
              </div>
            </div>

            {/* Metric 4: Recommended action */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-surface dark:bg-ink-2 flex items-center justify-center text-muted dark:text-slate-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div
                    className="text-xs font-semibold text-ink dark:text-slate-200 truncate max-w-[180px]"
                    title={recommendedAction || undefined}
                  >
                    {recommendedAction || '—'}
                  </div>
                  <div className="text-[11px] text-muted-light dark:text-slate-500">Recommended action</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Grid: Top Issues, Signals Over Time, Sources */}
      {!isEmpty && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Card 1: Top Issues */}
        <div className="bg-white dark:bg-ink rounded-2xl p-5 border border-line-light dark:border-ink-2 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-ink dark:text-white mb-3">
              Top Issues
            </h3>

            <div className="space-y-2.5">
              {topIssues.length === 0 ? (
                <div className="text-xs text-muted dark:text-slate-400 py-6 text-center">
                  No clusters formed yet. Connect a signal source and refresh the engine.
                </div>
              ) : (
                topIssues.map(({ cluster, count }, idx) => {
                  const palette = [
                    'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
                    'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400',
                    'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
                    'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
                    'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
                  ];
                  const iconBg = palette[idx % palette.length];
                  return (
                    <div
                      key={cluster.id}
                      onClick={() => onNavigate('clusters')}
                      className="flex items-center justify-between gap-2 p-1.5 -mx-1.5 rounded-lg hover:bg-surface dark:hover:bg-ink-2 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-semibold text-ink dark:text-slate-200 truncate">
                            {cluster.name || cluster.title || 'Signal Theme'}
                          </div>
                        </div>
                        {cluster.sentiment && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-frost dark:bg-slate-800 text-muted dark:text-slate-400 border border-line dark:border-slate-700 shrink-0">
                            {cluster.sentiment}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-xs font-bold text-ink dark:text-white">
                            {count.toLocaleString()}
                          </div>
                          <div className="text-[10px] font-semibold text-muted dark:text-slate-400">signals</div>
                        </div>
                        {renderSparkline(cluster)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-surface dark:border-slate-800/80 mt-3">
            <button
              onClick={() => onNavigate('clusters')}
              className="w-full flex items-center justify-between text-xs text-muted dark:text-slate-400 hover:text-ink dark:hover:text-white font-medium transition-colors cursor-pointer"
            >
              <span>View all issues</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-light dark:text-slate-500" />
            </button>
          </div>
        </div>

        {/* Card 2: Signals Over Time */}
        <div className="bg-white dark:bg-ink rounded-2xl p-5 border border-line-light dark:border-ink-2 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm sm:text-base text-ink dark:text-white">
                Signals Over Time
              </h3>

              <div className="relative">
                <button
                  onClick={() => setIsTimeframeOpen(!isTimeframeOpen)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-surface dark:bg-ink-2 border border-line dark:border-slate-700 rounded-lg text-[11px] font-semibold text-muted-strong dark:text-slate-300 hover:bg-frost dark:hover:bg-slate-700 cursor-pointer"
                >
                  <span>{timeframe}</span>
                  <ChevronDown className="w-3 h-3 text-muted-light dark:text-slate-500" />
                </button>

                {isTimeframeOpen && (
                  <div className="absolute right-0 mt-1 bg-white dark:bg-ink-2 border border-line dark:border-slate-700 rounded-lg shadow-xl z-30 py-1 text-xs">
                    {(['7D', '14D', '30D'] as const).map((tf) => (
                      <button
                        key={tf}
                        onClick={() => {
                          setTimeframe(tf);
                          setIsTimeframeOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-surface dark:hover:bg-slate-800 text-xs ${
                          timeframe === tf
                            ? 'font-bold text-brand dark:text-indigo-400 bg-brand-soft dark:bg-indigo-950/40'
                            : 'text-muted-strong dark:text-slate-300'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Smooth Area Chart */}
            <div className="h-44 w-full pt-1">
              {chartData.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface/60 px-6 text-center dark:border-slate-700 dark:bg-slate-800/30">
                  <TrendingUp className="mb-2 h-5 w-5 text-muted-light dark:text-slate-500" />
                  <p className="text-xs font-semibold text-muted-strong dark:text-slate-300">No signals in this period</p>
                  <p className="mt-1 text-[11px] text-muted-light dark:text-slate-500">New signals will appear here as they are received.</p>
                </div>
              ) : <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="signalsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={isDark ? 0.4 : 0.25} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: isDark ? '#64748B' : '#94A3B8', fontSize: 10 }}
                    dy={5}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: isDark ? '#64748B' : '#94A3B8', fontSize: 10 }}
                    tickFormatter={(val) => (val === 0 ? '0' : val >= 1000 ? `${Math.round(val / 1000)}K` : `${val}`)}
                    domain={[0, Math.ceil(niceMax)]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                      color: isDark ? '#FFFFFF' : '#0F172A',
                      borderRadius: '10px',
                      border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${val} signals`, 'Volume']}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#6366F1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#signalsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>}
            </div>
          </div>

          <div className="pt-4 border-t border-surface dark:border-slate-800/80 mt-3">
            <button
              onClick={() => onNavigate('sources')}
              className="w-full flex items-center justify-between text-xs text-muted dark:text-slate-400 hover:text-ink dark:hover:text-white font-medium transition-colors cursor-pointer"
            >
              <span>View signals by source</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-light dark:text-slate-500" />
            </button>
          </div>
        </div>

        {/* Card 3: Sources */}
        <div className="bg-white dark:bg-ink rounded-2xl p-5 border border-line-light dark:border-ink-2 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-ink dark:text-white mb-2">
              Sources
            </h3>

            {/* Donut chart + Legend */}
            <div className="flex items-center justify-between gap-2 py-2">
              {/* Donut Chart with Total in Center */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>

                <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-base font-extrabold text-ink dark:text-white leading-tight">
                    {sourceTotal.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-muted-light dark:text-slate-500 font-medium uppercase">
                    Total
                  </span>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex-1 space-y-2 pl-2">
                {sourceData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-muted-strong dark:text-slate-300 truncate">{item.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-ink dark:text-white">
                      {sourceTotal > 0 ? Math.round((item.value / sourceTotal) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-surface dark:border-slate-800/80 mt-3">
            <button
              onClick={() => onNavigate('sources')}
              className="w-full flex items-center justify-between text-xs text-muted dark:text-slate-400 hover:text-ink dark:hover:text-white font-medium transition-colors cursor-pointer"
            >
              <span>View all sources</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-light dark:text-slate-500" />
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Bottom AI Insight Card */}
      {!isEmpty && (
      <div className="bg-white dark:bg-ink rounded-2xl p-4 sm:p-5 border border-line-light dark:border-ink-2 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex items-center gap-1.5 text-brand dark:text-indigo-400 font-bold text-xs shrink-0 pt-0.5 sm:pt-0">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>AI Insight</span>
          </div>
          <p className="text-xs sm:text-[13px] text-ink-3 dark:text-slate-300 leading-relaxed font-normal">
            {insights.length > 0
              ? insights[0].title + ': ' + (insights[0].description || insights[0].content || '')
              : 'No AI insights yet. Connect a signal source and refresh the engine to generate insights from your data.'}
          </p>
        </div>

        <button
          onClick={() => onNavigate('insights')}
          className="text-xs font-semibold text-brand dark:text-indigo-400 hover:text-brand-hover dark:hover:text-indigo-300 flex items-center gap-1 shrink-0 cursor-pointer self-end sm:self-center"
        >
          <span>View insight</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      )}

      {/* Footer Text */}
      <div className="text-center pt-1 pb-3">
        <p className="text-xs text-muted-light dark:text-slate-500">
          QuickBit Live continuously analyzes signals and learns from outcomes to improve decisions.
        </p>
      </div>
    </div>
  );
};
