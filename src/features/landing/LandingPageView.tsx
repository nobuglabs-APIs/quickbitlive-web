import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, animate } from 'motion/react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  Menu,
  Moon,
  Radio,
  Sun,
  X,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Logo } from '../../components/ui/Logo';
import { resetCookieConsent } from '../../components/legal/CookieConsent';

interface LandingPageViewProps {
  onOpenAuth: (initialMode?: 'login' | 'register') => void;
  onOpenLegal?: () => void;
}

/* ─── Single fade-in (the only entrance animation on the page) ─── */
const FadeIn: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.45, delay, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

/* ─── Animated Counter (one-shot, no loops) ─── */
const AnimatedCounter: React.FC<{ from?: number; to: number; suffix?: string; className?: string; delay?: number }> = ({ from = 0, to, suffix = '', className, delay = 0 }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const val = useMotionValue(from);
  const rounded = useTransform(val, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (inView) {
      const controls = animate(val, to, { duration: 1.6, ease: 'easeOut', delay });
      return () => controls.stop();
    }
  }, [inView, val, to, delay]);

  return <motion.span ref={ref} className={`tabular-nums ${className ?? ''}`}>{rounded}</motion.span>;
};

/* ─── Static product shot (reads as a screenshot, zero animation) ─── */
const ProductShot: React.FC = () => {
  const rail = [
    { icon: Radio, label: 'Signals', active: true },
    { icon: FileText, label: 'Cases', active: false },
    { icon: CheckCircle2, label: 'Decisions', active: false },
  ];
  const rows = [
    { dot: 'bg-indigo-500', title: 'Checkout fails with 500 on /pay', meta: '18 signals · 4 min ago', active: true },
    { dot: 'bg-slate-300 dark:bg-slate-600', title: '“Can’t reset my password”', meta: '9 signals · 26 min ago', active: false },
    { dot: 'bg-slate-300 dark:bg-slate-600', title: 'App crashes on startup (Android 14)', meta: '6 signals · 1 h ago', active: false },
    { dot: 'bg-emerald-500', title: 'Login timeout on slow networks', meta: 'Resolving · 12 signals', active: false },
  ];

  return (
    <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-xl shadow-slate-200/60 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2.5 dark:border-slate-700">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
        <div className="mx-auto w-full max-w-xs rounded-md bg-slate-100 px-3 py-1 text-center text-[11px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          app.quickbit.live/overview
        </div>
        <div className="w-10" />
      </div>

      <div className="grid sm:grid-cols-[180px_1fr] lg:grid-cols-[180px_1fr_240px]">
        {/* Mini rail */}
        <div className="hidden flex-col gap-1 border-r border-slate-200 p-3 sm:flex dark:border-slate-700">
          <p className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Acme Inc</p>
          {rail.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                item.active
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </div>
          ))}
        </div>

        {/* Mini inbox */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">Signals inbox</p>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              128 open
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {rows.map((row) => (
              <div
                key={row.title}
                className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 ${
                  row.active
                    ? 'border-indigo-200 bg-indigo-50/60 dark:border-indigo-800 dark:bg-indigo-500/10'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${row.dot}`} />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">{row.title}</p>
                  <p className="text-[11px] text-slate-400">{row.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mini recommendation */}
        <div className="hidden border-l border-slate-200 p-4 lg:block dark:border-slate-700">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recommended</p>
          <p className="mt-2 text-sm font-bold leading-snug">Fix checkout 500s before Friday checkout peak</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-indigo-600 tabular-nums">86%</p>
          <p className="text-[11px] text-slate-400">confidence · 214 orders at risk</p>
          <div className="mt-4 rounded-lg bg-indigo-600 py-2 text-center text-xs font-semibold text-white">
            Log decision
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Content ─── */
const steps = [
  { n: '01', title: 'Connect your sources', text: 'Widget, API or email. Signals stream in and are deduplicated automatically.' },
  { n: '02', title: 'Cases form themselves', text: 'Related signals are grouped into one case, with impact and trend attached.' },
  { n: '03', title: 'Get a recommendation', text: 'Each case ships with a suggested action, expected impact and confidence.' },
  { n: '04', title: 'Decide and track', text: 'Log the decision, push it to your tools and watch the case resolve.' },
];

const features = [
  {
    icon: Radio,
    eyebrow: 'Signals',
    title: 'One inbox for every signal',
    text: 'Feedback, errors and usage events land in a single queue, already deduplicated and ranked by impact.',
    bullets: ['Widget, API and email sources', 'Automatic duplicates merged', 'Impact score on every row'],
    visual: (
      <div className="space-y-2">
        {['Checkout 500 on /pay · 18 signals', 'Password reset fails · 9 signals', 'Slow search on mobile · 5 signals'].map((t, i) => (
          <div key={t} className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 ${i === 0 ? 'border-indigo-200 bg-indigo-50/60 dark:border-indigo-800 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-slate-700'}`}>
            <span className={`h-2 w-2 shrink-0 rounded-full ${i === 0 ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
            <p className="truncate text-xs font-semibold">{t}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: FileText,
    eyebrow: 'Cases',
    title: 'Complaints become cases',
    text: 'Dozens of scattered reports collapse into one case with a clear owner, trend and user impact.',
    bullets: ['Signals grouped automatically', 'Trend and impact attached', 'One thread per problem'],
    visual: (
      <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <span className="inline-block rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">Case</span>
        <p className="mt-3 text-sm font-bold">Checkout failures on /pay</p>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">32 signals</span>
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">Growing</span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">Started 3 days ago · affects 4% of checkouts · 214 orders at risk.</p>
      </div>
    ),
  },
  {
    icon: CheckCircle2,
    eyebrow: 'Decisions',
    title: 'A log of what you decided',
    text: 'Every decision is recorded with context, so next quarter you know exactly why something shipped.',
    bullets: ['Decision with context attached', 'Pushed to your tracker', 'Impact tracked after shipping'],
    visual: (
      <div className="space-y-2">
        {[
          { t: 'Fix checkout 500s', m: 'Logged Tue · shipped' },
          { t: 'Rewrite password reset flow', m: 'Logged Fri · in progress' },
          { t: 'Deprecate legacy search', m: 'Logged Mar 12 · done' },
        ].map((d) => (
          <div key={d.t} className="flex items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2.5 dark:border-slate-700">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-600" />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">{d.t}</p>
              <p className="text-[11px] text-slate-400">{d.m}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

const metrics = [
  { to: 92, suffix: '%', label: 'of signals grouped without manual triage' },
  { to: 38, suffix: '%', label: 'less time spent grooming the backlog' },
  { to: 10, suffix: ' min', label: 'from signup to first insight' },
];

/* ─── Main Landing ─── */
export const LandingPageView: React.FC<LandingPageViewProps> = ({ onOpenAuth, onOpenLegal }) => {
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollTo = (id: string) => document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#" className="flex items-center"><Logo variant="full" size="md" /></a>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex dark:text-slate-300">
            <a href="#product" className="transition-colors hover:text-slate-900 dark:hover:text-white">Product</a>
            <a href="#how-it-works" className="transition-colors hover:text-slate-900 dark:hover:text-white">How it works</a>
            <a href="#metrics" className="transition-colors hover:text-slate-900 dark:hover:text-white">Results</a>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} aria-label="Toggle theme" className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={() => onOpenAuth('login')} className="hidden px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 sm:block dark:text-slate-300 dark:hover:text-white">Sign in</button>
            <button onClick={() => onOpenAuth('register')} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu" className="p-2 text-slate-500 md:hidden dark:text-slate-300">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="overflow-hidden border-t border-slate-200 bg-white px-4 py-2 md:hidden dark:border-slate-800 dark:bg-slate-950">
              <div className="space-y-1 py-2 text-sm font-medium">
                {[
                  { label: 'Product', href: '#product' },
                  { label: 'How it works', href: '#how-it-works' },
                  { label: 'Results', href: '#metrics' },
                ].map((item) => (
                  <a key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2 text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">{item.label}</a>
                ))}
                <button onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }} className="block w-full rounded-lg px-3 py-2 text-left text-indigo-600 dark:text-indigo-400">Sign in</button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main>
        {/* Hero */}
        <section className="px-4 pb-16 pt-14 text-center sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Product intelligence
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Know exactly what to build next.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg dark:text-slate-400">
              QuickBit Live collects feedback, errors and usage signals, groups them into cases and tells you what to fix first.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button onClick={() => onOpenAuth('register')} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 sm:w-auto">
                Start free <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => scrollTo('#product')} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800">
                See the product
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-400">Free plan · No credit card · 10 minutes to first insight</p>
          </div>
          <FadeIn delay={0.1}>
            <ProductShot />
          </FadeIn>
        </section>

        {/* Metrics */}
        <section id="metrics" className="border-y border-slate-200 bg-slate-50 px-4 py-12 sm:px-6 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mx-auto grid max-w-5xl gap-8 text-center sm:grid-cols-3">
            {metrics.map((m, i) => (
              <FadeIn key={m.label} delay={i * 0.06}>
                <p className="text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">
                  <AnimatedCounter to={m.to} suffix={m.suffix} />
                </p>
                <p className="mx-auto mt-2 max-w-[220px] text-sm text-slate-500 dark:text-slate-400">{m.label}</p>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <FadeIn className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">How it works</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">From noise to decision in four steps.</h2>
            </FadeIn>
            <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
              {steps.map((s) => (
                <FadeIn key={s.n}>
                  <div className="grid gap-2 py-6 sm:grid-cols-[64px_1fr_1fr] sm:gap-6">
                    <span className="font-mono text-sm font-semibold text-slate-400">{s.n}</span>
                    <h3 className="text-base font-bold">{s.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{s.text}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="product" className="border-t border-slate-200 bg-slate-50 px-4 py-16 sm:px-6 sm:py-20 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mx-auto max-w-5xl">
            <FadeIn className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Product</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Built for the way teams decide.</h2>
            </FadeIn>
            <div className="mt-12 space-y-14">
              {features.map((f, i) => (
                <div key={f.title} className="grid items-center gap-8 lg:grid-cols-2">
                  <FadeIn className={i % 2 === 1 ? 'lg:order-2' : ''}>
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                      <f.icon className="h-4 w-4" /> {f.eyebrow}
                    </p>
                    <h3 className="mt-3 text-2xl font-bold tracking-tight">{f.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base dark:text-slate-400">{f.text}</p>
                    <ul className="mt-5 space-y-2.5">
                      {f.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-2.5 text-sm font-medium">
                          <Check className="h-4 w-4 shrink-0 text-indigo-600" /> {b}
                        </li>
                      ))}
                    </ul>
                  </FadeIn>
                  <FadeIn delay={0.08} className={i % 2 === 1 ? 'lg:order-1' : ''}>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                      {f.visual}
                    </div>
                  </FadeIn>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-16 sm:px-6 sm:py-20">
          <FadeIn className="mx-auto max-w-5xl">
            <div className="rounded-2xl bg-indigo-600 px-6 py-14 text-center text-white sm:px-12">
              <h2 className="mx-auto max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
                Stop guessing what to build next.
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-indigo-100 sm:text-base">
                Connect your first source today and wake up to a ranked list of what matters.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button onClick={() => onOpenAuth('register')} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-50 sm:w-auto">
                  Start free <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => onOpenAuth('login')} className="inline-flex w-full items-center justify-center rounded-lg border border-indigo-400 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 sm:w-auto">
                  Sign in
                </button>
              </div>
            </div>
          </FadeIn>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 px-4 py-12 text-sm text-slate-500 sm:px-6 dark:border-slate-800 dark:text-slate-400">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div className="space-y-4">
              <Logo variant="full" size="md" />
              <p className="max-w-xs text-sm leading-relaxed">Product intelligence that turns feedback and technical signals into clear decisions.</p>
            </div>
            {[
              { title: 'Product', links: ['Signals', 'Cases', 'Decisions', 'Changelog'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Resources', links: ['Documentation', 'Support', 'Status'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">{col.title}</h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="transition-colors hover:text-slate-900 dark:hover:text-white">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs sm:flex-row dark:border-slate-800">
            <span>© {new Date().getFullYear()} QuickBit Live. All rights reserved.</span>
            <div className="flex gap-5">
              {['Privacy', 'Terms', 'Cookies'].map((link) => (
                <button key={link} onClick={() => onOpenLegal?.()} className="transition-colors hover:text-slate-900 dark:hover:text-white">{link}</button>
              ))}
              <button onClick={() => resetCookieConsent()} className="transition-colors hover:text-slate-900 dark:hover:text-white">Cookie settings</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
