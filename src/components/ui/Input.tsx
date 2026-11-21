import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightElement, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-semibold text-ink dark:text-slate-200 select-none">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3 text-muted dark:text-slate-400 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={twMerge(
              clsx(
                'w-full h-9 rounded-xl border bg-white dark:bg-ink-2 px-3 py-1.5 text-xs sm:text-sm text-ink dark:text-white placeholder:text-muted-light dark:placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand disabled:cursor-not-allowed disabled:bg-frost dark:disabled:bg-slate-800/60 disabled:text-muted-light',
                leftIcon ? 'pl-9' : 'pl-3',
                rightElement ? 'pr-10' : 'pr-3',
                error ? 'border-rose-500 focus:ring-rose-500/30 focus:border-rose-500' : 'border-line dark:border-slate-700',
                className
              )
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-rose-600 dark:text-rose-400 leading-tight">{error}</p>}
        {!error && helperText && <p className="text-xs text-muted dark:text-slate-400 leading-tight">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
