import React from 'react';
import { Drawer } from '../ui/Drawer';
import { Badge } from '../ui/Badge';
import { Signal } from '../../types/api';
import { Calendar, Globe, User, Tag } from 'lucide-react';

interface SignalDetailDrawerProps {
  signal: Signal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SignalDetailDrawer: React.FC<SignalDetailDrawerProps> = ({ signal, isOpen, onClose }) => {
  if (!signal) return null;

  const formattedDate = signal.created_at
    ? new Date(signal.created_at).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Unknown date';

  const metadata = signal.metadata || {};

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Signal Details"
      width="md"
    >
      <div className="space-y-6 text-sm">
        {/* Source & Sentiment Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="accent" size="sm">
            <Globe className="w-3 h-3" />
            {signal.source || 'widget'}
          </Badge>
          {signal.sentiment && (
            <Badge
              variant={
                signal.sentiment.includes('pos')
                  ? 'success'
                  : signal.sentiment.includes('risk') || signal.sentiment.includes('frust')
                  ? 'error'
                  : 'neutral'
              }
              size="sm"
            >
              {signal.sentiment}
            </Badge>
          )}
        </div>

        {/* Content section */}
        <div>
          <label className="text-[11px] font-bold text-muted dark:text-slate-400 uppercase tracking-wider block mb-2">
            Feedback Text
          </label>
          <div className="p-4 bg-surface dark:bg-ink-2/60 border border-line dark:border-slate-800 rounded-xl text-ink dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans text-sm">
            {signal.content}
          </div>
        </div>

        {/* Metadata info */}
        <div className="space-y-3 pt-2">
          <label className="text-[11px] font-bold text-muted dark:text-slate-400 uppercase tracking-wider block">
            Signal Attributes
          </label>

          <div className="grid grid-cols-1 gap-2.5 p-4 bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl">
            <div className="flex items-center justify-between text-xs py-1.5 border-b border-line-light dark:border-ink-2">
              <span className="text-muted dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand dark:text-indigo-400" />
                Ingested At
              </span>
              <span className="font-mono text-ink dark:text-white font-medium">{formattedDate}</span>
            </div>

            <div className="flex items-center justify-between text-xs py-1.5 border-b border-line-light dark:border-ink-2">
              <span className="text-muted dark:text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand dark:text-indigo-400" />
                User Email
              </span>
              <span className="font-mono text-ink dark:text-white font-medium">
                {metadata.user_email || metadata.email || 'Anonymous / Unassigned'}
              </span>
            </div>

            {metadata.plan && (
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-line-light dark:border-ink-2">
                <span className="text-muted dark:text-slate-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand dark:text-indigo-400" />
                  Subscription Plan
                </span>
                <span className="font-semibold text-ink dark:text-white capitalize">{metadata.plan}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
};
