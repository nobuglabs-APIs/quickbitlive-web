import React from 'react';
import { BarChart3, ShieldAlert, Wrench } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Recommendation } from '../../types/api';

interface RecommendationDetailsModalProps {
  recommendation: Recommendation | null;
  isOpen: boolean;
  onClose: () => void;
}

const percentage = (value?: number | string) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? `${Math.round(numeric * 100)}%` : '—';
};

export const RecommendationDetailsModal: React.FC<RecommendationDetailsModalProps> = ({ recommendation, isOpen, onClose }) => <Modal isOpen={isOpen} onClose={onClose} title={recommendation?.title || 'Recommendation details'} description="The rationale and trade-offs behind this recommendation." maxWidth="lg">
  {recommendation && <div className="space-y-5">
    <div className="flex flex-wrap gap-2"><Badge variant={recommendation.priority === 'high' ? 'error' : recommendation.priority === 'medium' ? 'warning' : 'neutral'} size="sm">{String(recommendation.priority || 'standard').toUpperCase()} PRIORITY</Badge><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{percentage(recommendation.confidence)} confidence</span></div>
    {recommendation.action && <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/25"><div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300"><Wrench className="h-4 w-4" />Recommended action</div><p className="mt-2 text-sm font-semibold text-ink dark:text-white">{recommendation.action}</p></div>}
    {(recommendation.reason || recommendation.rationale || recommendation.description) && <div><h4 className="text-xs font-bold text-ink dark:text-white">Why this matters</h4><p className="mt-2 text-sm leading-relaxed text-muted dark:text-slate-300">{recommendation.reason || recommendation.rationale || recommendation.description}</p></div>}
    <div className="grid grid-cols-3 gap-3"><Metric icon={BarChart3} label="Expected impact" value={percentage(recommendation.expected_impact)} tone="indigo" /><Metric icon={Wrench} label="Effort" value={percentage(recommendation.effort)} tone="amber" /><Metric icon={ShieldAlert} label="Risk" value={percentage(recommendation.risk)} tone="rose" /></div>
  </div>}
</Modal>;

const Metric: React.FC<{ icon: React.ElementType; label: string; value: string; tone: 'indigo' | 'amber' | 'rose' }> = ({ icon: Icon, label, value, tone }) => {
  const colors = { indigo: 'text-indigo-600 dark:text-indigo-300', amber: 'text-amber-600 dark:text-amber-300', rose: 'text-rose-600 dark:text-rose-300' };
  return <div className="rounded-xl border border-line p-3 dark:border-slate-700"><Icon className={`h-4 w-4 ${colors[tone]}`} /><p className="mt-3 text-lg font-bold text-ink dark:text-white">{value}</p><p className="text-[10px] font-medium text-muted dark:text-slate-400">{label}</p></div>;
};
