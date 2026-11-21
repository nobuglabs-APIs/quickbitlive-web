import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number | string;
    isPositive?: boolean;
    label?: string;
  } | null;
  context?: string;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  trend,
  context,
  icon,
  className,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={onClick ? { y: -2 } : undefined}
      onClick={onClick}
      className={twMerge(
        clsx(
          'p-5 bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl flex flex-col justify-between gap-3 transition-all duration-150 shadow-2xs',
          onClick && 'cursor-pointer hover:border-brand/40 dark:hover:border-indigo-500/40 hover:shadow-xs',
          className
        )
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold tracking-wider text-muted dark:text-slate-400 uppercase select-none">
          {label}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-xl bg-brand-soft dark:bg-indigo-950/60 border border-brand-border dark:border-indigo-800/60 flex items-center justify-center text-brand dark:text-indigo-400 shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <div className="text-2xl lg:text-3xl font-bold tracking-tight text-ink dark:text-white">
          {value}
        </div>

        {(trend || context) && (
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {trend && (
              <span
                className={clsx(
                  'inline-flex items-center gap-1 font-semibold text-[11px]',
                  trend.isPositive !== false ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                )}
              >
                {trend.isPositive !== false ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {trend.value}
              </span>
            )}
            {context && <span className="text-[11px] text-muted dark:text-slate-400 font-medium">{context}</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
};
