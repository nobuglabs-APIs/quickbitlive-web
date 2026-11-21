import React from 'react';
import { AlertTriangle, BarChart3, CheckCircle2, Lightbulb, ShieldAlert } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Decision } from '../../types/api';

interface DecisionDetailsModalProps {
  decision: Decision | null;
  isOpen: boolean;
  onClose: () => void;
}

const detailSections = [
  { key: 'what_happened', label: 'What happened', icon: BarChart3 },
  { key: 'why_it_matters', label: 'Why it matters', icon: AlertTriangle },
  { key: 'recommended_action', label: 'Recommended action', icon: Lightbulb },
] as const;

export const DecisionDetailsModal: React.FC<DecisionDetailsModalProps> = ({ decision, isOpen, onClose }) => {
  const narrative = decision?.narrative;
  const title = narrative?.title || decision?.recommendation?.title || decision?.title || 'Decision details';
  const confidence = decision?.confidence ?? decision?.recommendation?.confidence;

  return <Modal isOpen={isOpen} onClose={onClose} title={title} description="AI analysis and the evidence behind this product decision." maxWidth="xl">
    {decision && <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {typeof decision.rank === 'number' && <Badge variant="accent" size="sm">RANK #{decision.rank}</Badge>}
        {(decision.priority || decision.recommendation?.priority) && <Badge variant="warning" size="sm">{String(decision.priority || decision.recommendation?.priority).toUpperCase()} PRIORITY</Badge>}
        {typeof confidence === 'number' && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{Math.round(confidence * 100)}% confidence</span>}
        {typeof decision.score === 'number' && <span className="text-[11px] font-medium text-muted dark:text-slate-400">Impact score: {Math.round(decision.score * 100)}%</span>}
      </div>

      {(narrative?.executive_summary || decision.description) && <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/25"><p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">Executive summary</p><p className="mt-2 text-sm leading-relaxed text-ink-3 dark:text-slate-200">{narrative?.executive_summary || decision.description}</p></div>}

      <div className="grid gap-3 sm:grid-cols-2">
        {detailSections.map(({ key, label, icon: Icon }) => narrative?.[key] && <div key={key} className="rounded-xl border border-line p-4 dark:border-slate-700"><div className="flex items-center gap-2 text-xs font-bold text-ink dark:text-white"><Icon className="h-4 w-4 text-indigo-500" />{label}</div><p className="mt-2 text-xs leading-relaxed text-muted dark:text-slate-300">{narrative[key]}</p></div>)}
      </div>

      {(decision.reason || decision.recommendation?.reason || decision.rationale) && <div><h4 className="text-xs font-bold text-ink dark:text-white">Evidence & rationale</h4><p className="mt-2 text-xs leading-relaxed text-muted dark:text-slate-300">{decision.reason || decision.recommendation?.reason || decision.rationale}</p></div>}
      {decision.root_cause && <div><h4 className="text-xs font-bold text-ink dark:text-white">Root cause</h4><p className="mt-2 text-xs leading-relaxed text-muted dark:text-slate-300">{decision.root_cause}</p></div>}
      {narrative?.risks && narrative.risks.length > 0 && <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 dark:border-amber-900/60 dark:bg-amber-950/20"><div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-200"><ShieldAlert className="h-4 w-4" />Risks to monitor</div><ul className="mt-2 space-y-1.5 text-xs text-amber-900/80 dark:text-amber-100/80">{narrative.risks.map((risk) => <li key={risk} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" />{risk}</li>)}</ul></div>}
      {narrative?.confidence_statement && <p className="text-[11px] italic text-muted-light dark:text-slate-500">{narrative.confidence_statement}</p>}
    </div>}
  </Modal>;
};
