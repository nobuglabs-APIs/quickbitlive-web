import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/auth.service';
import { Logo } from '../../components/ui/Logo';
import { ArrowRight, Mail, Lock, User, ShieldCheck, ArrowLeft, Sun, Moon } from 'lucide-react';

interface AuthViewProps {
  initialMode?: 'login' | 'register' | '2fa' | 'forgot';
  onBackToLanding?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ initialMode = 'login', onBackToLanding }) => {
  const { login, register, loginWithGoogle, loginWithGitHub, setManualToken } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { success, error: showError, info } = useToast();

  const [mode, setMode] = useState<'login' | 'register' | '2fa' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<'google' | 'github' | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const res = await login({ email, password });
      if (res.two_factor_required) {
        setMode('2fa');
        info('Two-Factor Authentication', 'Please enter the verification code sent to your email.');
      } else {
        success('Welcome to QuickBit Live', 'Successfully authenticated.');
      }
    } catch (err: any) {
      showError('Authentication Failed', err.message || 'Check your credentials or verify your email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const res = await register({ email, password, full_name: fullName });
      if (res.access_token) {
        success('Account Created', 'Welcome to QuickBit Live Product Intelligence.');
      } else {
        success('Registration Successful', 'Please check your email inbox to verify your account before logging in.');
        setMode('login');
      }
    } catch (err: any) {
      showError('Registration Failed', err.message || 'Unable to complete registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setPendingProvider('google');
    setIsLoading(true);
    await loginWithGoogle();
  };

  const handleGitHubAuth = async () => {
    setPendingProvider('github');
    setIsLoading(true);
    await loginWithGitHub();
  };

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorCode) return;

    setIsLoading(true);
    try {
      const res = await authService.verify2FA({ email, code: twoFactorCode });
      if (res.access_token) {
        await setManualToken(res.access_token);
        success('2FA Verified', 'Successfully authenticated.');
      }
    } catch (err: any) {
      showError('2FA Verification Failed', err.message || 'Invalid 2FA code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend2FA = async () => {
    try {
      await authService.resend2FA({ email });
      info('Code Resent', 'A new verification code has been dispatched to your email.');
    } catch (err: any) {
      showError('Failed to resend code', err.message);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await authService.forgotPassword({ email });
      success('Password Reset Email Sent', 'Check your inbox for reset instructions.');
      setMode('login');
    } catch (err: any) {
      showError('Request Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-deep flex flex-col justify-between text-ink dark:text-frost font-sans antialiased transition-colors duration-200">
      {/* Header */}
      <header className="px-6 py-4 border-b border-line-light dark:border-ink-2 bg-white dark:bg-ink flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBackToLanding && (
            <button
              type="button"
              onClick={onBackToLanding}
              className="p-1.5 rounded-xl text-muted dark:text-slate-400 hover:text-ink dark:hover:text-white hover:bg-surface dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold mr-1 cursor-pointer"
              title="Back to Landing Page"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
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
          {/* Header text */}
          <div className="space-y-1.5 text-center">
            <h1 className="text-xl font-bold tracking-tight text-ink dark:text-white">
              {mode === 'login' && 'Sign in to QuickBit Live'}
              {mode === 'register' && 'Create your QuickBit Live account'}
              {mode === '2fa' && 'Two-Factor Authentication'}
              {mode === 'forgot' && 'Reset your password'}
            </h1>
            <p className="text-xs text-muted dark:text-slate-400 leading-relaxed">
              {mode === 'login' && 'AI-driven product intelligence and real-time customer signals.'}
              {mode === 'register' && 'Start ingesting feedback, clusters, and roadmap insights.'}
              {mode === '2fa' && `Enter the 6-digit code sent to ${email}`}
              {mode === 'forgot' && 'Enter your email to receive reset instructions.'}
            </p>
          </div>

          {/* Social OAuth Buttons for Login and Register modes */}
          {(mode === 'login' || mode === 'register') && (
            <div className="space-y-2.5">
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white dark:bg-ink-2 hover:bg-surface dark:hover:bg-slate-800 border border-line dark:border-slate-700 rounded-xl text-xs font-semibold text-ink dark:text-white transition-all duration-150 shadow-2xs hover:shadow-md hover:-translate-y-px active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {pendingProvider === 'google' ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                    <span>Redirecting to Google…</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* GitHub Button */}
              <button
                type="button"
                onClick={handleGitHubAuth}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white dark:bg-ink-2 hover:bg-surface dark:hover:bg-slate-800 border border-line dark:border-slate-700 rounded-xl text-xs font-semibold text-ink dark:text-white transition-all duration-150 shadow-2xs hover:shadow-md hover:-translate-y-px active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {pendingProvider === 'github' ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#24292F] dark:border-white border-t-transparent rounded-full animate-spin" />
                    <span>Redirecting to GitHub…</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span>Continue with GitHub</span>
                  </>
                )}
              </button>

              <div className="relative py-2 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-line-light dark:border-ink-2" />
                </div>
                <span className="relative px-3 bg-white dark:bg-ink text-[11px] font-medium text-muted-light dark:text-slate-500 uppercase tracking-wider">
                  Or continue with email
                </span>
              </div>
            </div>
          )}

          {/* Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Work Email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[13px] font-semibold text-ink dark:text-slate-200">Password</label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-muted dark:text-slate-400 hover:text-brand dark:hover:text-indigo-400 transition-colors"
                  >
                    Forgot?
                  </button>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In
              </Button>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Alex Morgan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="Work Email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Account
              </Button>
            </form>
          )}

          {mode === '2fa' && (
            <form onSubmit={handle2FA} className="space-y-4">
              <Input
                label="Verification Code"
                placeholder="123456"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                leftIcon={<ShieldCheck className="w-4 h-4" />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
              >
                Verify & Continue
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend2FA}
                  className="text-xs text-muted dark:text-slate-400 hover:text-brand dark:hover:text-indigo-400 underline"
                >
                  Resend code
                </button>
              </div>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
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
                isLoading={isLoading}
              >
                Send Reset Link
              </Button>
            </form>
          )}

          {/* Toggle modes */}
          <div className="pt-4 border-t border-line-light dark:border-ink-2 flex flex-col items-center gap-2 text-xs text-muted dark:text-slate-400">
            {mode === 'login' ? (
              <div>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-brand dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                >
                  Sign up
                </button>
              </div>
            ) : (
              <div>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-brand dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Footer info */}
      <footer className="px-6 py-4 border-t border-line-light dark:border-ink-2 bg-white dark:bg-ink text-center text-xs text-muted-light dark:text-slate-500">
        QuickBit Live AI Product Intelligence &copy; 2026.
      </footer>
    </div>
  );
};
