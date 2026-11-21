import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div
      className={twMerge(clsx('animate-pulse rounded-lg bg-line dark:bg-slate-800', className))}
      {...props}
    />
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="w-full border border-line-light dark:border-ink-2 rounded-xl overflow-hidden bg-white dark:bg-ink">
      <div className="flex items-center gap-4 p-4 border-b border-line-light dark:border-ink-2 bg-surface dark:bg-ink-2/60">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-line-light dark:divide-ink-2">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 p-4">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardsSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 border border-line-light dark:border-ink-2 rounded-xl bg-white dark:bg-ink space-y-3">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
};

export const FeedbackListSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 border border-line-light dark:border-ink-2 rounded-xl bg-white dark:bg-ink flex items-start gap-4">
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-5/6" />
            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
