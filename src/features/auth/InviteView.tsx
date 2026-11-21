import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { workspacesService } from '../../services/workspaces.service';
import { Logo } from '../../components/ui/Logo';
import { ArrowLeft, ArrowRight, Clock, Sun, Moon, UserPlus } from 'lucide-react';

interface InviteViewProps {
  token: string;
  workspaceId?: string;
  onNeedAuth: (mode: 'login' | 'register') => void;
  onDone: () => void;
}

type Outcome = 'idle' | 'accepting' | 'accepted' | 'error';

export const InviteView: React.FC<InviteViewProps> = ({ token, workspaceId, onNeedAuth, onDone }) => {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, refreshWorkspaces } = useAuth();

  const [outcome, setOutcome] = useState<Outcome>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const attempted = useRef(false);

  useEffect(() => {
    if (!token || !workspaceId) {
      setOutcome('error');
      setErrorMsg('This invitation link is incomplete or invalid.');
      return;
    }
    if (!isAuthenticated) return;
    if (attempted.current) return;
    attempted.current = true;

    setOutcome('accepting');
    workspacesService
      .acceptInvite(workspaceId, token)
      .then(async () => {
        await refreshWorkspaces();
        setOutcome('accepted');
      })
      .catch((err: any) => {
        setOutcome('error');
        setErrorMsg(err.message || 'Unable to accept this invitation.');
      });
  }, [isAuthenticated, token, workspaceId, refreshWorkspaces]);

  const wrongAccount = /different email/i.test(errorMsg);

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-deep flex flex-col justify-between text-ink dark:text-frost font-sans antialiased transition-colors duration-200">
      {/* Header */}
      <header className="px-6 py-4 border-b border-line-light dark:border-ink-2 bg-white dark:bg-ink flex items-center justify-between">
        <div className="flex items-center gap-3">
          {(isAuthenticated || outcome === 'error') && (
            <button
              type="button"
              onClick={onDone}
              className="p-1.5 rounded-xl text-muted dark:text-slate-400 hover:text-ink dark:hover:text-white hover:bg-surface dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold mr-1 cursor-pointer"
              title="Go to QuickBit Live"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to QuickBit</span>
            </button>
          )}

          <Logo variant="full" size="md" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl text-muted dark:text-slate-400 hover:text-ink dark:hover:text-white bg-surface dark:bg-ink-2 hover:bg-frost dark:hover:bg-slate-800 border border-line dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-muted" />}
          </button>
        </div>
      </header>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.2)] space-y-5"
        >
          {!isAuthenticated ? (
            // Not signed in: explain the invitation and ask for auth
            <>
              <div className="space-y-1.5 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-brand/10 dark:bg-indigo-950/60 text-brand dark:text-indigo-300 flex items-center justify-center mb-2">
                  <UserPlus className="w-6 h-6" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-ink dark:text-white">You've been invited!</h1>
                <p className="text-xs text-muted dark:text-slate-400 leading-relaxed">
                  A colleague invited you to join a team workspace on QuickBit Live.
                  Sign in (or create an account) with the email address the invitation was sent to.
                </p>
              </div>

              <div className="space-y-2.5">
                <Button
                  type="button"
                  variant="primary"
                  className="w-full"
                  onClick={() => onNeedAuth('login')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign In to Accept
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => onNeedAuth('register')}
                >
                  Create Account
                </Button>
              </div>

              <div className="pt-4 border-t border-line-light dark:border-ink-2 text-center">
                <button
                  type="button"
                  onClick={onDone}
                  className="text-xs text-muted dark:text-slate-400 hover:text-brand dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Maybe later
                </button>
              </div>
            </>
          ) : outcome === 'accepting' || outcome === 'idle' ? (
            // Signed in: accepting in the background
            <div className="space-y-4 py-6 flex flex-col items-center justify-center text-center">
              <span className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
              <h1 className="text-xl font-bold tracking-tight text-ink dark:text-white">Accepting your invitation</h1>
              <p className="text-xs text-muted dark:text-slate-400 leading-relaxed">
                Joining the workspace on QuickBit Live...
              </p>
            </div>
          ) : outcome === 'accepted' ? (
            // Successful acceptance
            <div className="space-y-4">
              <div className="space-y-1.5 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                  <UserPlus className="w-6 h-6" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-ink dark:text-white">Welcome to the team!</h1>
                <p className="text-xs text-muted dark:text-slate-400 leading-relaxed">
                  You've joined the workspace. Head to QuickBit Live to explore projects, signals, and insights.
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                className="w-full"
                onClick={onDone}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Open QuickBit Live
              </Button>
            </div>
          ) : (
            // Error while accepting
            <div className="space-y-4">
              <div className="space-y-1.5 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2">
                  <Clock className="w-6 h-6" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-ink dark:text-white">
                  {wrongAccount ? 'Wrong Account' : 'Invitation Unavailable'}
                </h1>
                <p className="text-xs text-muted dark:text-slate-400 leading-relaxed">
                  {wrongAccount
                    ? 'This invitation was sent to a specific email address. Sign out and sign in with that account to accept it.'
                    : 'This invitation is invalid or has expired. Ask your team to send you a new one.'}
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                className="w-full"
                onClick={onDone}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Go to QuickBit Live
              </Button>
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer info */}
      <footer className="px-6 py-4 border-t border-line-light dark:border-ink-2 bg-white dark:bg-ink text-center text-xs text-muted-light dark:text-slate-500">
        QuickBit Live AI Product Intelligence &copy; 2026.
      </footer>
    </div>
  );
};