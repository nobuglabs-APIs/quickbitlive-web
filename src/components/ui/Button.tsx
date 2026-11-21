import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all duration-150 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none whitespace-nowrap cursor-pointer';

    const variants = {
      primary: 'bg-brand hover:bg-brand-hover text-white focus-visible:ring-brand shadow-xs',
      secondary: 'bg-brand-soft dark:bg-indigo-950/50 text-brand dark:text-indigo-300 hover:bg-[#E0E7FF] dark:hover:bg-indigo-900/60 focus-visible:ring-indigo-400',
      outline: 'border border-line dark:border-slate-700 bg-white dark:bg-ink-2 text-ink dark:text-slate-200 hover:bg-surface dark:hover:bg-slate-800 focus-visible:ring-slate-400 shadow-2xs',
      ghost: 'text-muted dark:text-slate-400 hover:text-ink dark:hover:text-white hover:bg-surface dark:hover:bg-ink-2 focus-visible:ring-slate-400',
      danger: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500 shadow-xs',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-9 px-4 text-xs sm:text-sm gap-2',
      lg: 'h-10 px-5 text-sm gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
