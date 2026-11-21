import React from 'react';
import { Layers } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <Layers className="w-8 h-8 text-muted-light dark:text-slate-500" />,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 sm:p-12 border border-dashed border-line dark:border-slate-800 rounded-2xl bg-surface dark:bg-ink-2/40 min-h-[280px]">
      <div className="p-3 bg-white dark:bg-ink border border-line dark:border-slate-800 rounded-xl shadow-2xs mb-3.5">
        {icon}
      </div>
      <h4 className="text-sm sm:text-base font-bold text-ink dark:text-white tracking-tight">{title}</h4>
      <p className="text-xs text-muted dark:text-slate-400 mt-1 max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={onAction} leftIcon={actionIcon}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
