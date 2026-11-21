import React, { useRef, useEffect, useState, useCallback } from 'react';
import { IrisSkin } from '../../types/api';
import { API_BASE_URL } from '../../lib/api/client';

declare global {
  interface Window {
    IrisMascot?: new (opts: {
      x: number;
      y: number;
      scale: number;
      skin: string;
      colors?: Record<string, string>;
    }) => {
      attach: (canvas: HTMLCanvasElement) => void;
      detach: () => void;
      setExpression: (expr: string) => void;
      setSkin: (skin: string) => void;
      say?: (text: string, duration: number) => void;
      wave?: (count: number) => void;
      notice?: () => void;
    };
  }
}

const EXPRESSIONS = [
  { id: 'happy', label: 'Happy' },
  { id: 'sad', label: 'Sad' },
  { id: 'surprised', label: 'Surprised' },
  { id: 'angry', label: 'Angry' },
  { id: 'thinking', label: 'Thinking' },
  { id: 'sleepy', label: 'Sleepy' },
  { id: 'love', label: 'Love' },
  { id: 'playful', label: 'Playful' },
  { id: 'cool', label: 'Cool' },
  { id: 'dizzy', label: 'Dizzy' },
] as const;

interface IrisPreviewProps {
  skin: IrisSkin;
  primaryColor: string;
  screenColor: string;
  greeting: string;
  tone: string;
  formality: string;
}

export const IrisPreview: React.FC<IrisPreviewProps> = ({
  skin,
  primaryColor,
  screenColor,
  greeting,
  tone,
  formality,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mascotRef = useRef<InstanceType<NonNullable<typeof window.IrisMascot>> | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [activeExpression, setActiveExpression] = useState('happy');
  const [expanded, setExpanded] = useState(false);

  const loadIrisScript = useCallback(() => {
    if (window.IrisMascot) {
      setLoaded(true);
      return;
    }
    const existing = document.querySelector(`script[src="${API_BASE_URL}/iris.js"]`);
    if (existing) {
      existing.addEventListener('load', () => setLoaded(true));
      return;
    }
    const script = document.createElement('script');
    script.src = `${API_BASE_URL}/iris.js`;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    loadIrisScript();
  }, [loadIrisScript]);

  useEffect(() => {
    if (!loaded || !canvasRef.current || !window.IrisMascot) return;

    if (mascotRef.current) {
      mascotRef.current.detach();
    }

    const mascot = new window.IrisMascot({
      x: 70,
      y: 105,
      scale: 0.65,
      skin: skin,
      colors: {
        primary: primaryColor,
        primaryDark: primaryColor,
        body: '#ffffff',
        screen: screenColor,
        screenGlow: 'rgba(138,108,255,0.10)',
        shadow: 'rgba(20,10,40,0.15)',
        groundShadow: 'rgba(20,10,40,0.10)',
        pink: '#ff4081',
        yellow: '#ffd93d',
        orange: '#ff6b35',
      },
    });

    mascot.attach(canvasRef.current);
    mascot.setExpression(activeExpression);
    mascotRef.current = mascot;

    return () => {
      mascot.detach();
      mascotRef.current = null;
    };
  }, [loaded, skin, primaryColor, screenColor]);

  useEffect(() => {
    if (mascotRef.current) {
      mascotRef.current.setExpression(activeExpression);
    }
  }, [activeExpression]);

  const handleBadgeClick = () => {
    setExpanded(true);
    if (mascotRef.current) {
      mascotRef.current.setExpression('happy');
      mascotRef.current.wave?.(2);
    }
    setActiveExpression('happy');
  };

  const handleClose = () => {
    setExpanded(false);
    if (mascotRef.current) {
      mascotRef.current.setExpression('happy');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-muted dark:text-slate-400">
          Live Mascot Preview
        </span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-soft dark:bg-indigo-950/50 text-brand dark:text-indigo-300">
          {skin}
        </span>
      </div>

      {/* Simulated website with mascot */}
      <div className="w-full bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl shadow-xl overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-surface dark:bg-ink-2 border-b border-line-light dark:border-ink-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-white dark:bg-surface-deep border border-line dark:border-slate-700 rounded-lg px-3 py-1 text-[10px] text-muted dark:text-slate-500 font-mono truncate">
              https://yoursite.com
            </div>
          </div>
        </div>

        {/* Simulated page content */}
        <div className="relative h-[380px] bg-surface dark:bg-[#0B0D14] overflow-hidden">
          {/* Fake page content */}
          <div className="p-6 space-y-4 opacity-40">
            <div className="h-4 bg-line dark:bg-slate-700 rounded w-1/3" />
            <div className="h-3 bg-line dark:bg-slate-700 rounded w-3/4" />
            <div className="h-3 bg-line dark:bg-slate-700 rounded w-2/3" />
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="h-20 bg-line dark:bg-slate-700 rounded-xl" />
              <div className="h-20 bg-line dark:bg-slate-700 rounded-xl" />
              <div className="h-20 bg-line dark:bg-slate-700 rounded-xl" />
            </div>
            <div className="h-3 bg-line dark:bg-slate-700 rounded w-full" />
            <div className="h-3 bg-line dark:bg-slate-700 rounded w-4/5" />
          </div>

          {/* ── Widget container (bottom-right) ──────────────────── */}
          <div className="absolute bottom-4 right-4">
            {/* Chat bubble - slides up above mascot */}
            <div
              className="absolute bottom-[118px] right-0 w-[280px] bg-white dark:bg-ink-2 border rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              style={{
                borderColor: primaryColor,
                opacity: expanded ? 1 : 0,
                transform: expanded ? 'translateY(0)' : 'translateY(10px)',
                visibility: expanded ? 'visible' : 'hidden',
                pointerEvents: expanded ? 'auto' : 'none',
              }}
            >
              <div className="flex items-center justify-between px-3 py-2.5" style={{ backgroundColor: primaryColor }}>
                <span className="text-white text-xs font-semibold">IRIS Assistant</span>
                <button
                  onClick={handleClose}
                  className="text-white/80 hover:text-white text-sm font-bold leading-none cursor-pointer"
                >
                  &times;
                </button>
              </div>
              <div className="flex-1 p-3">
                <div className="bg-surface dark:bg-surface-deep rounded-xl rounded-bl-sm p-3 text-xs text-ink dark:text-white leading-relaxed">
                  {greeting || 'Hello! How can I help you?'}
                </div>
              </div>
              <div className="px-3 pb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 bg-surface dark:bg-surface-deep border rounded-lg px-3 py-2 text-[10px] text-muted-light"
                    style={{ borderColor: `${primaryColor}40` }}
                  >
                    Type your feedback...
                  </div>
                  <button
                    className="px-3 py-2 rounded-lg text-white text-[10px] font-semibold cursor-pointer"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* Mascot canvas - hidden when minimized */}
            <div
              className="transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              style={{
                opacity: expanded ? 1 : 0,
                transform: expanded ? 'scale(1) translateY(0)' : 'scale(0.1) translateY(100px)',
                visibility: expanded ? 'visible' : 'hidden',
              }}
            >
              {!loaded && (
                <div className="w-[140px] h-[170px] flex items-center justify-center text-[10px] text-muted-light dark:text-slate-500">
                  Loading Iris...
                </div>
              )}
              <canvas
                ref={canvasRef}
                width={140}
                height={160}
                className={`block ${loaded ? '' : 'hidden'}`}
              />
            </div>

            {/* Badge - visible when minimized, shrinks away when expanded */}
            <button
              onClick={handleBadgeClick}
              className="absolute bottom-0 right-0 w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 hover:shadow-xl"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 4px 16px ${primaryColor}66`,
                opacity: expanded ? 0 : 1,
                transform: expanded ? 'scale(0.1) rotate(-90deg)' : 'scale(1) rotate(0deg)',
                visibility: expanded ? 'hidden' : 'visible',
                pointerEvents: expanded ? 'none' : 'auto',
              }}
            >
              <svg viewBox="0 0 100 100" width="28" height="28">
                <circle cx="46" cy="46" r="28" stroke="#ffffff" strokeWidth="13" fill="none" />
                <path d="M 64 60 L 78 80" stroke="#ffffff" strokeWidth="9" strokeLinecap="round" fill="none" />
              </svg>
            </button>
          </div>
        </div>

        {/* Expression bar */}
        <div className="px-4 py-3 bg-white dark:bg-ink border-t border-line-light dark:border-ink-2">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] font-bold text-muted-light dark:text-slate-500 uppercase shrink-0 mr-1">
              Expression:
            </span>
            {EXPRESSIONS.map((expr) => (
              <button
                key={expr.id}
                onClick={() => setActiveExpression(expr.id)}
                className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeExpression === expr.id
                    ? 'bg-brand text-white'
                    : 'bg-frost dark:bg-ink-2 text-muted dark:text-slate-400 hover:bg-line dark:hover:bg-slate-700'
                }`}
              >
                {expr.label}
              </button>
            ))}
          </div>
        </div>

        {/* Info footer */}
        <div className="px-4 py-2 bg-surface dark:bg-ink-2 border-t border-line-light dark:border-ink-2 text-[10px] text-muted-light dark:text-slate-500 flex items-center justify-between">
          <span>{tone} tone &bull; {formality} formality</span>
          <span>Powered by QuickBit Live</span>
        </div>
      </div>
    </div>
  );
};
