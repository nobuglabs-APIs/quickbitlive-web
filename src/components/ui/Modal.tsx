import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
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

  const maxWClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/50 dark:bg-black/70 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={twMerge(
              clsx(
                'relative w-full bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl shadow-xl z-10 overflow-hidden flex flex-col text-ink dark:text-frost',
                maxWClasses[maxWidth]
              )
            )}
          >
            <div className="flex items-start justify-between p-5 border-b border-line-light dark:border-ink-2">
              <div>
                <h3 className="text-base font-bold text-ink dark:text-white leading-snug">{title}</h3>
                {description && <p className="text-xs text-muted dark:text-slate-400 mt-1">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="text-muted dark:text-slate-400 hover:text-ink dark:hover:text-white p-1 rounded-lg hover:bg-surface dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">{children}</div>

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
