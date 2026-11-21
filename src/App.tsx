import React, { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/api/queryClient';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LandingPageView } from './features/landing/LandingPageView';
import { LegalPoliciesView } from './features/legal/LegalPoliciesView';
import { CookieConsent } from './components/legal/CookieConsent';
import { AuthView } from './features/auth/AuthView';
import { ResetPasswordView } from './features/auth/ResetPasswordView';
import { VerifyEmailView } from './features/auth/VerifyEmailView';
import { InviteView } from './features/auth/InviteView';
import { AppShell } from './components/layout/AppShell';

function savePendingInvite(invite: { token: string; workspaceId?: string }) {
  try {
    localStorage.setItem('quickbit_pending_invite', JSON.stringify({ token: invite.token, workspace_id: invite.workspaceId || '' }));
  } catch {}
}

function clearPendingInvite() {
  try {
    localStorage.removeItem('quickbit_pending_invite');
  } catch {}
}

const Main: React.FC = () => {
  const { isAuthenticated, isLoading, setManualToken } = useAuth();
  const { success, error: showError } = useToast();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | '2fa' | 'forgot'>('login');
  const [publicView, setPublicView] = useState<'landing' | 'legal'>('landing');
  const [deepLink, setDeepLink] = useState<null | { type: 'reset' | 'verify' | 'invite'; token: string; workspaceId?: string }>(null);
  const [inviteAuth, setInviteAuth] = useState(false);

  useEffect(() => {
    const pathname = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    if (pathname === '/auth/reset-password' || pathname === '/auth/verify-email') {
      const token = params.get('token');
      if (token) {
        setDeepLink({ type: pathname === '/auth/reset-password' ? 'reset' : 'verify', token });
      }
      try {
        localStorage.removeItem('quickbit_oauth_pending');
      } catch {}
      return;
    }

    if (pathname === '/invite') {
      const token = params.get('token');
      const workspaceId = params.get('workspace_id') || undefined;
      if (token && workspaceId) {
        setDeepLink({ type: 'invite', token, workspaceId });
      }
      try {
        localStorage.removeItem('quickbit_oauth_pending');
      } catch {}
      return;
    }

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, '?'));
    const tokenParam =
      params.get('access_token') ||
      params.get('token') ||
      params.get('auth_token') ||
      hashParams.get('access_token') ||
      hashParams.get('token') ||
      hashParams.get('auth_token');
    const oauthError = params.get('error') || hashParams.get('error');

    if (tokenParam) {
      setManualToken(tokenParam)
        .then(() => success('Connected', 'Successfully authenticated with your provider account.'))
        .catch((err: any) => {
          showError('Sign in failed', err?.message || 'Could not verify the provider session.');
        });
      const pendingInvite = typeof localStorage !== 'undefined' ? localStorage.getItem('quickbit_pending_invite') : null;
      if (pendingInvite) {
        try {
          const pi = JSON.parse(pendingInvite);
          if (pi?.token) {
            setDeepLink({ type: 'invite', token: pi.token, workspaceId: pi.workspace_id || undefined });
          }
        } catch {}
        clearPendingInvite();
      }
      window.history.replaceState({}, '', window.location.pathname);
    } else if (oauthError) {
      const errorDesc = params.get('error_description') || hashParams.get('error_description');
      showError('Sign in failed', errorDesc || oauthError);
      window.history.replaceState({}, '', window.location.pathname);
    }

    try {
      localStorage.removeItem('quickbit_oauth_pending');
    } catch {}
  }, []);

  if (deepLink) {
    if (deepLink.type === 'invite') {
      if (!isAuthenticated && inviteAuth) {
        return (
          <>
            <AuthView
              initialMode={authMode}
              onBackToLanding={() => {
                setInviteAuth(false);
                setDeepLink(null);
                clearPendingInvite();
              }}
            />
            <CookieConsent />
          </>
        );
      }
      return (
        <>
          <InviteView
            token={deepLink.token}
            workspaceId={deepLink.workspaceId}
            onNeedAuth={(mode) => {
              savePendingInvite({ token: deepLink.token, workspaceId: deepLink.workspaceId });
              setAuthMode(mode);
              setInviteAuth(true);
            }}
            onDone={() => {
              setDeepLink(null);
              setInviteAuth(false);
              clearPendingInvite();
            }}
          />
          <CookieConsent />
        </>
      );
    }

    return (
      <>
        {deepLink.type === 'reset' ? (
          <ResetPasswordView
            token={deepLink.token}
            onGoToLogin={() => {
              setDeepLink(null);
              setAuthMode('login');
              setShowAuthModal(true);
            }}
            onGoToForgot={() => {
              setDeepLink(null);
              setAuthMode('forgot');
              setShowAuthModal(true);
            }}
          />
        ) : (
          <VerifyEmailView
            token={deepLink.token}
            onGoToLogin={() => {
              setDeepLink(null);
              setAuthMode('login');
              setShowAuthModal(true);
            }}
          />
        )}
        <CookieConsent />
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-surface-deep text-white">
          <div className="flex flex-col items-center gap-4">
            <img
              src="/logo/logo.png"
              alt="QuickBit Live"
              width={120}
              className="animate-pulse"
              draggable={false}
            />
            <div className="flex items-center gap-2 text-xs text-muted-light">
              <span className="w-2 h-2 rounded-full bg-brand animate-ping" />
              <span>Connecting to QuickBit Live Intelligence Engine...</span>
            </div>
          </div>
        </div>
        <CookieConsent />
      </>
    );
  }

  if (!isAuthenticated) {
    if (showAuthModal) {
      return (
        <>
          <AuthView
            initialMode={authMode}
            onBackToLanding={() => setShowAuthModal(false)}
          />
          <CookieConsent />
        </>
      );
    }

    if (publicView === 'legal') {
      return (
        <>
          <LegalPoliciesView
            onBackToLanding={() => setPublicView('landing')}
          />
          <CookieConsent onViewPolicy={() => setPublicView('legal')} />
        </>
      );
    }

    return (
      <>
        <LandingPageView
          onOpenAuth={(mode = 'login') => {
            setAuthMode(mode);
            setShowAuthModal(true);
          }}
          onOpenLegal={() => setPublicView('legal')}
        />
        <CookieConsent onViewPolicy={() => setPublicView('legal')} />
      </>
    );
  }

  return (
    <>
      <AppShell />
      <CookieConsent />
    </>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Main />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

