import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/auth.service';
import { Logo } from '../../components/ui/Logo';
import { ArrowRight, KeyRound, Sun, Moon, ShieldCheck, ArrowLeft } from 'lucide-react';

interface ResetPasswordViewProps {
  token: string;
  onGoToLogin: () => void;
  onGoToForgot: () => void;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ token, onGoToLogin, onGoToForgot }) => {
  const { isDark, toggleTheme } = useTheme();
  const { success, error: showError } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reset, setReset] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      showError('Invalid Password', 'Your new password must have at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      showError('Passwords Do Not Match', 'Both password fields must match.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({ token, new_password: password });
      setReset(true);
      success('Password Updated', 'Your password was reset successfully.');
    } catch (err: any) {
      showError('Reset Failed', err.message || 'Invalid or expired reset link. Please request a new one.');
    } finally {
      setIsLoading(false);
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
          {reset ? (
            <div className="space-y-4">
              <div className="space-y-1.5 text-center">
                <h1 className="text-xl font-bold tracking-tight text-ink dark:text-white">Password Updated</h1>
                <p className="text-xs text-muted dark:text-slate-400 leading-relaxed">
                  Your password has been reset successfully. You can now sign in with your new password.
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
          ) : (
            <>
              <div className="space-y-1.5 text-center">
                <h1 className="text-xl font-bold tracking-tight text-ink dark:text-white">Set a new password</h1>
                <p className="text-xs text-muted dark:text-slate-400 leading-relaxed">
                  Choose a strong password for your QuickBit Live account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<KeyRound className="w-4 h-4" />}
                  autoFocus
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<ShieldCheck className="w-4 h-4" />}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Update Password
                </Button>
              </form>

              <div className="pt-4 border-t border-line-light dark:border-ink-2 text-xs text-muted dark:text-slate-400">
                Link expired or invalid?{' '}
                <button
                  type="button"
                  onClick={onGoToForgot}
                  className="text-brand dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                >
                  Request a new reset link
                </button>
              </div>
            </>
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