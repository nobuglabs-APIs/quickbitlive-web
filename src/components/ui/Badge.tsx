import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'accent' | 'outline' | 'purple';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center font-semibold rounded-full whitespace-nowrap transition-colors select-none';

  const variants = {
    neutral: 'bg-frost dark:bg-slate-800 text-muted-strong dark:text-slate-300 border border-line dark:border-slate-700',
    success: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/40',
    warning: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/40',
    error: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/40',
    info: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/40',
    accent: 'bg-brand-soft dark:bg-indigo-950/50 text-brand dark:text-indigo-300 border border-brand-border dark:border-indigo-800/60',
    purple: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/40',
    outline: 'bg-transparent text-muted dark:text-slate-400 border border-line dark:border-slate-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] leading-tight gap-1',
    md: 'px-2.5 py-1 text-xs leading-tight gap-1.5',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))} {...props}>
      {children}
    </span>
  );
};
