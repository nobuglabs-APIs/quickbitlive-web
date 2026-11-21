import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-[13px] font-semibold text-ink dark:text-slate-200 select-none">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={twMerge(
            clsx(
              'w-full min-h-[90px] rounded-xl border bg-white dark:bg-ink-2 px-3 py-2 text-xs sm:text-sm text-ink dark:text-white placeholder:text-muted-light dark:placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand disabled:cursor-not-allowed disabled:bg-frost dark:disabled:bg-slate-800/60 disabled:text-muted-light',
              error ? 'border-rose-500 focus:ring-rose-500/30 focus:border-rose-500' : 'border-line dark:border-slate-700',
              className
            )
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-600 dark:text-rose-400 leading-tight">{error}</p>}
        {!error && helperText && <p className="text-xs text-muted dark:text-slate-400 leading-tight">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
