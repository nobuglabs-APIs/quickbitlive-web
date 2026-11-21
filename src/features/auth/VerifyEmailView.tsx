import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/auth.service';
import { Logo } from '../../components/ui/Logo';
import { ArrowLeft, ArrowRight, Mail, Sun, Moon, ShieldCheck } from 'lucide-react';

interface VerifyEmailViewProps {
  token: string;
  onGoToLogin: () => void;
}

type Status = 'verifying' | 'verified' | 'error';

export const VerifyEmailView: React.FC<VerifyEmailViewProps> = ({ token, onGoToLogin }) => {
  const { isDark, toggleTheme } = useTheme();
  const { success, error: showError } = useToast();

  const [status, setStatus] = useState<Status>('verifying');
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let mounted = true;
    authService
      .verifyEmail(token)
      .then(() => {
        if (mounted) setStatus('verified');
      })
      .catch((err: any) => {
        if (mounted) {
          setStatus('error');
          showError('Verification Failed', err.message || 'This verification link is invalid or expired.');
        }
      });
    return () => {
      mounted = false;
    };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setResending(true);
    try {
      await authService.resendVerification({ email });
      success('Verification Email Sent', 'Check your inbox for a new verification link.');
    } catch (err: any) {
      showError('Request Failed', err.message || 'Unable to resend the verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-deep flex flex-col justify-between text-ink dark:text-frost font-sans antialiased transition-colors duration-200">
      {/* Header */}
      <header className="px-6 py-4 border-b border-line-light dark:border-ink-2 bg-white dark:bg-ink flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onGoToLogin}
            className="p-1.5 rounded-xl text-muted dark:text-slate-400 hover:text-ink dark:hover:text-white hover:bg-surface dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold mr-1 cursor-pointer"
            title="Back to Sign In"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Sign In</span>
          </button>

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
          {status === 'verifying' && (
            <div className="space-y-4 py-6 flex flex-col items-center justify-center text-center">
              <span className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
              <h1 className="text-xl font-bold tracking-tight text-ink dark:text-white">Verifying your email</h1>
              <p className="text-xs text-muted dark:text-slate-400 leading-relaxed">
                Confirming your email address with QuickBit Live...
              </p>
            </div>
          )}

          {status === 'verified' && (
            <div className="space-y-4">
              <div className="space-y-1.5 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-ink dark:text-white">Email Verified</h1>
                <p className="text-xs text-muted dark:text-slate-400 leading-relaxed">
                  Your email address has been verified. You can now sign in to QuickBit Live.
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                className="w-full"
                onClick={onGoToLogin}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="space-y-1.5 text-center">
                <h1 className="text-xl font-bold tracking-tight text-ink dark:text-white">Verification Failed</h1>
                <p className="text-xs text-muted dark:text-slate-400 leading-relaxed">
                  This verification link is invalid or expired. Request a new link below.
                </p>
              </div>

              <form onSubmit={handleResend} className="space-y-4">
                <Input
                  label="Account Email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={resending}
                >
                  Send New Verification Link
                </Button>
              </form>

              <div className="pt-4 border-t border-line-light dark:border-ink-2 text-center">
                <button
                  type="button"
                  onClick={onGoToLogin}
                  className="text-xs text-brand dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
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