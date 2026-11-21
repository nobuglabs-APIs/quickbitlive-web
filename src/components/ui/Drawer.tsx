import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const widthClasses = {
    sm: 'max-w-md',
    md: 'max-w-[480px]',
    lg: 'max-w-[560px]',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 dark:bg-black/60 backdrop-blur-2xs"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className={twMerge(
              clsx(
                'relative w-full h-full bg-white dark:bg-ink border-l border-line-light dark:border-ink-2 shadow-2xl z-10 flex flex-col justify-between text-ink dark:text-frost',
                widthClasses[width]
              )
            )}
          >
            <div className="flex items-start justify-between p-5 border-b border-line-light dark:border-ink-2 bg-white dark:bg-ink">
              <div className="pr-4 min-w-0">
                <h3 className="text-base font-bold text-ink dark:text-white truncate">{title}</h3>
                {subtitle && <p className="text-xs text-muted dark:text-slate-400 mt-0.5 truncate">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="text-muted dark:text-slate-400 hover:text-ink dark:hover:text-white p-1 rounded-lg hover:bg-surface dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-white dark:bg-ink">{children}</div>

            {footer && (
              <div className="flex items-center justify-end gap-2.5 p-4 bg-surface dark:bg-ink-2/60 border-t border-line-light dark:border-ink-2">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
