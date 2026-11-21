import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X } from 'lucide-react';

interface CookieConsentProps {
  onViewPolicy?: () => void;
}

const CONSENT_KEY = 'quickbit_cookie_consent';
const RESET_EVENT = 'quickbit:reset-cookie-consent';

export const getCookieConsent = (): 'accepted' | 'rejected' | null => {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === 'accepted' || v === 'rejected' ? v : null;
  } catch {
    return null;
  }
};

export const resetCookieConsent = (): void => {
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch {}
  window.dispatchEvent(new Event(RESET_EVENT));
};

export const CookieConsent: React.FC<CookieConsentProps> = ({ onViewPolicy }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getCookieConsent() === null);
  }, []);

  useEffect(() => {
    const onReset = () => setVisible(true);
    window.addEventListener(RESET_EVENT, onReset);
    return () => window.removeEventListener(RESET_EVENT, onReset);
  }, []);

  if (!visible) return null;

  const choose = (value: 'accepted' | 'rejected') => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {}
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 90, damping: 16 }}
          className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-700 dark:bg-ink/95"
        >
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
              <Cookie className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">We value your privacy</h3>
                <button
                  onClick={() => choose('rejected')}
                  aria-label="Close cookie banner"
                  className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                QuickBit uses only local storage for essential features (keeping you signed in and
                remembering your theme and preferences). We don't use third-party tracking or
                advertising cookies.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => choose('accepted')}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
                >
                  Accept essentials
                </button>
                <button
                  onClick={() => choose('rejected')}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Reject
                </button>
                {onViewPolicy && (
                  <button
                    onClick={onViewPolicy}
                    className="px-2 py-2 text-xs font-semibold text-indigo-600 underline-offset-4 transition-colors hover:underline dark:text-indigo-300"
                  >
                    Cookie policy
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};