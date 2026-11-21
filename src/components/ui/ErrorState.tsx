import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong.',
  message = "We couldn't load your data from the QuickBit Live API.",
  onRetry,
  isRetrying = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 sm:p-12 border border-rose-200 dark:border-rose-900/50 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 min-h-[260px]">
      <div className="p-3 bg-white dark:bg-ink border border-rose-200 dark:border-rose-800 rounded-xl shadow-2xs mb-3.5 text-rose-600 dark:text-rose-400">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-sm sm:text-base font-bold text-ink dark:text-white tracking-tight">{title}</h4>
      <p className="text-xs text-muted dark:text-slate-400 mt-1 max-w-sm leading-relaxed">{message}</p>
      {onRetry && (
        <div className="mt-5">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            isLoading={isRetrying}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Try again
          </Button>
        </div>
      )}
    </div>
  );
};
