import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Cookie,
  Eye,
  FileText,
  Lock,
  Mail,
  RefreshCw,
  Scale,
  Shield,
  Sparkles,
  Trash2,
  Wrench,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Logo } from '../../components/ui/Logo';

interface LegalPoliciesViewProps {
  onBackToLanding: () => void;
}

const LAST_UPDATED = 'September 4, 2026';
const PRODUCT_NAME = 'QuickBit Live';

const sections = [
  {
    id: 'about',
    icon: Sparkles,
    title: 'About this page',
    content: (
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {PRODUCT_NAME} is a product-intelligence platform. We collect feedback, errors and
        behavioral signals from your websites and products, group them into cases, and turn them
        into insights and recommended decisions. This page explains what data is collected, how it
        is used, and what you can do about it. These policies apply to the {PRODUCT_NAME} web app
        and to the QuickBit Live widget installed on sites that use it.
      </p>
    ),
  },
  {
    id: 'terms',
    icon: Scale,
    title: 'Terms of Use',
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        <p>
          By creating an account or using {PRODUCT_NAME}, you agree to use the service lawfully and
          not to abuse it: no attempts to breach security, no reselling the service or extracting
          customer data for purposes other than those stated here, and no interference with other
          users' workspaces.
        </p>
        <p>
          You are responsible for the content you connect to {PRODUCT_NAME} (source sites, feedback
          data, documents) and for keeping your account credentials and API keys confidential.
          We may suspend accounts that clearly violate these rules.
        </p>
        <p>
          The service is provided "as is" without warranties of uninterrupted availability. We may
          stop, change or retire features with notice, and we are not liable for decisions you take
          based on insights produced by the platform.
        </p>
      </div>
    ),
  },
  {
    id: 'privacy',
    icon: Eye,
    title: 'Privacy & data we collect',
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        <p>
          <strong className="font-semibold text-slate-800 dark:text-slate-100">Account data.</strong>{' '}
          When you register we store the identity details from your provider (e.g. name and email
          from Google or GitHub) to manage your access. Passwords are never stored — sign-in is
          delegated to your provider.
        </p>
        <p>
          <strong className="font-semibold text-slate-800 dark:text-slate-100">Workspace data.</strong>{' '}
          The signals, cases, insights and settings inside your workspaces belong to you. They are
          used only to run the features you use and are never sold.
        </p>
        <p>
          <strong className="font-semibold text-slate-800 dark:text-slate-100">Behavioral data.</strong>{' '}
          When the QuickBit Live widget runs on a site, it records behavior signals (page visits, clicks,
          console errors, form feedback) under an anonymous identifier. This identifier is not tied
          to a personal identity — we never collect names, passwords or payment details of your end
          users.
        </p>
        <p>
          <strong className="font-semibold text-slate-800 dark:text-slate-100">Technical data.</strong>{' '}
          Our servers keep routine logs (timestamps, error codes) used for security and operations.
        </p>
      </div>
    ),
  },
  {
    id: 'cookies',
    icon: Cookie,
    title: 'Cookies & local storage',
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        <p>
          {PRODUCT_NAME} does not use third-party tracking cookies, advertising cookies or
          cross-site trackers. To make the product work (and remember your preferences) we store
          small values in your browser's local storage:
        </p>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-bold">Key</th>
                <th className="px-4 py-3 font-bold">Purpose</th>
                <th className="px-4 py-3 font-bold">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 dark:divide-slate-800 dark:text-slate-300">
              {[
                ['quickbit_access_token', 'Keeps you signed in between visits', 'Session / storage'],
                ['quickbit_user_session', 'Cached copy of your profile for faster loading', 'Storage'],
                ['quickbit_theme', 'Your light/dark theme preference', 'Preference'],
                ['quickbit_cookie_consent', 'Stores whether you accepted or rejected the cookie banner', 'Preference'],
                ['quickbit_workspace_id / quickbit_project_id', 'Remembers the workspace and project you last used', 'Preference'],
                ['quickbit_oauth_pending', 'Temporarily remembers which provider (Google/GitHub) you chose to sign in with', 'Session'],
                ['quickbit_ anonymized id (widget)', 'Anonymous visitor id so signals are grouped without identifying the person', 'Widget'],
                ['qb_sent_errors (widget)', 'One-time error report deduplication (max 1 per error, per 24h, per browser)', 'Widget'],
              ].map(([key, purpose, type]) => (
                <tr key={key}>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-indigo-600 dark:text-indigo-300">{key}</td>
                  <td className="px-4 py-2.5">{purpose}</td>
                  <td className="px-4 py-2.5">{type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          You can clear all of these at any time through your browser's site-data settings —
          clearing them is safe; you will simply be signed out and your preferences reset.
        </p>
        <p>
          <strong className="font-semibold text-slate-800 dark:text-slate-100">Widget note.</strong>{' '}
          If you install the QuickBit Live widget on your own site, we recommend your site's privacy
          policy discloses it (anonymous behavioral signals and anonymous visitor id in local
          storage), since the widget runs in your visitors' browsers.
        </p>
      </div>
    ),
  },
  {
    id: 'widget',
    icon: Wrench,
    title: 'The QuickBit Live widget',
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        <p>
          The widget is a small script (≈27 KB, served compressed) that you add to your site with a
          single <span className="font-mono text-[12px] text-indigo-600 dark:text-indigo-300">&lt;script&gt;</span>{' '}
          tag plus a project API key. It renders a mascot button, talks to the {PRODUCT_NAME} API to
          verify the key, loads the exact look and text you configured, and sends back behavior
          signals so your dashboard stays current.
        </p>
        <p>
          The widget never reads passwords, payment data, or personal fields, and its network calls
          go only to the API server defined in the embed tag. All communication happens over HTTPS.
          The widget intentionally prints nothing to the browser console.
        </p>
      </div>
    ),
  },
  {
    id: 'security',
    icon: Lock,
    title: 'Security & API keys',
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        <p>
          All traffic to {PRODUCT_NAME} is encrypted with HTTPS. Passwords are never stored; user
          sign-in uses OAuth with Google and GitHub. API keys are project-scoped hashes — the
          widget send the key only over HTTPS, and a key can be revoked at any time from the
          project settings.
        </p>
        <p>
          Where a project defines an allowed domain, the backend refuses signals arriving from any
          other domain, protecting you from outside traffic being attributed to your workspace.
        </p>
      </div>
    ),
  },
  {
    id: 'rights',
    icon: Trash2,
    title: 'Your rights',
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        <p>
          You can access, correct and delete the data in your workspace at any time through the app.
          Deleting a project removes its signals, cases and insights. To delete your account or
          request a copy of all your data, contact us using the details below — we respond within
          30 days.
        </p>
        <p>
          We keep routine logs only as long as needed for security and operations (typically up to
          30 days).
        </p>
      </div>
    ),
  },
  {
    id: 'changes',
    icon: RefreshCw,
    title: 'Changes to these policies',
    content: (
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        We may update these policies as {PRODUCT_NAME} evolves. Material changes are announced in
        the app and by updating the date below. Continued use of the service after changes take
        effect means you accept the updated policies.
      </p>
    ),
  },
  {
    id: 'contact',
    icon: Mail,
    title: 'Contact',
    content: (
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        Questions about these policies, your data or your account can be sent to us at
        <a href="mailto:contact@quickbit.live" className="ml-1 font-semibold text-indigo-600 hover:underline dark:text-indigo-300">
          contact@quickbit.live
        </a>
        . We'll answer as soon as possible.
      </p>
    ),
  },
];

export const LegalPoliciesView: React.FC<LegalPoliciesViewProps> = ({ onBackToLanding }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen bg-[#FBFCFF] text-[#111827] dark:bg-surface-deep dark:text-surface font-sans antialiased">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-ink/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#" onClick={(e) => { e.preventDefault(); onBackToLanding(); }} className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400">
            <ArrowLeft className="h-4 w-4" />
            Back to homepage
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); onBackToLanding(); }} className="flex items-center"><Logo variant="full" size="md" /></a>
          <button onClick={toggleTheme} aria-label="Toggle theme" className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <motion.span key={isDark ? 'legal-light' : 'legal-dark'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.2 }} className="block text-sm">
              {isDark ? '☀' : '☾'}
            </motion.span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 70, damping: 16 }}
          className="py-12 text-center sm:py-16"
        >
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Legal &amp; Policies</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Terms of use, privacy and cookies for {PRODUCT_NAME} — so you always know how the
            product and its widget work.
          </p>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:border-indigo-800/60 dark:bg-indigo-950/50 dark:text-indigo-300">
            <FileText className="h-3.5 w-3.5" />
            Last updated: {LAST_UPDATED}
          </span>
        </motion.section>

        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start">
            <nav className="lg:space-y-1">
              {sections.map((s, i) => (
                <motion.a
                  key={s.id}
                  href={`#${s.id}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600 lg:border-slate-100 lg:bg-slate-50/60 lg:hover:border-indigo-100 dark:text-slate-400 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300 dark:lg:border-slate-800 dark:lg:bg-slate-800/40"
                >
                  <s.icon className="h-3.5 w-3.5 shrink-0" />
                  {s.title}
                </motion.a>
              ))}
            </nav>
          </aside>

          <div className="space-y-5">
            {sections.map((s, i) => (
              <motion.section
                key={s.id}
                id={s.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ type: 'spring', stiffness: 70, damping: 16, delay: i * 0.03 }}
                className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                    <s.icon className="h-4.5 w-4.5" />
                  </div>
                  <h2 className="text-lg font-bold tracking-tight">{s.title}</h2>
                </div>
                <div className="mt-4">{s.content}</div>
              </motion.section>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-100 bg-white px-4 py-8 text-xs text-slate-500 sm:px-6 dark:border-slate-800 dark:bg-ink dark:text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <span>© {new Date().getFullYear()} {PRODUCT_NAME}. All rights reserved.</span>
          <div className="flex gap-5">
            {['Privacy', 'Terms', 'Cookies'].map((link) => (
              <button
                key={link}
                onClick={() => document.getElementById('cookies')?.scrollIntoView({ behavior: 'smooth' })}
                className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-300"
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};