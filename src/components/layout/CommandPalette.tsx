import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  LayoutDashboard,
  Radio,
  Layers,
  Lightbulb,
  Sparkles,
  Target,
  CheckCircle2,
  History,
  Plug,
  FileText,
  Building2,
  Settings,
  X,
  ArrowRight,
} from 'lucide-react';

export interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions' | 'Data';
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  signalsCount?: number;
  insightsCount?: number;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  signalsCount = 0,
  insightsCount = 0,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items: CommandItem[] = [
    {
      id: 'nav-overview',
      title: 'Go to Overview',
      category: 'Navigation',
      icon: <LayoutDashboard className="w-4 h-4 text-brand dark:text-indigo-400" />,
      action: () => {
        onNavigate('overview');
        onClose();
      },
    },
    {
      id: 'nav-signals',
      title: `Signals (${signalsCount})`,
      category: 'Navigation',
      icon: <Radio className="w-4 h-4 text-brand dark:text-indigo-400" />,
      action: () => {
        onNavigate('signals');
        onClose();
      },
    },
    {
      id: 'nav-cases',
      title: 'Cases',
      category: 'Navigation',
      icon: <Layers className="w-4 h-4 text-brand dark:text-indigo-400" />,
      action: () => {
        onNavigate('clusters');
        onClose();
      },
    },
    {
      id: 'nav-insights',
      title: `Insights (${insightsCount})`,
      category: 'Navigation',
      icon: <Lightbulb className="w-4 h-4 text-brand dark:text-indigo-400" />,
      action: () => {
        onNavigate('insights');
        onClose();
      },
    },
    {
      id: 'nav-recommendations',
      title: 'Recommendations',
      category: 'Navigation',
      icon: <Target className="w-4 h-4 text-brand dark:text-indigo-400" />,
      action: () => {
        onNavigate('recommendations');
        onClose();
      },
    },
    {
      id: 'nav-decisions',
      title: 'Decisions',
      category: 'Navigation',
      icon: <CheckCircle2 className="w-4 h-4 text-brand dark:text-indigo-400" />,
      action: () => {
        onNavigate('decisions');
        onClose();
      },
    },
    {
      id: 'nav-history',
      title: 'History',
      category: 'Navigation',
      icon: <History className="w-4 h-4 text-brand dark:text-indigo-400" />,
      action: () => {
        onNavigate('history');
        onClose();
      },
    },
    {
      id: 'nav-ask',
      title: 'Ask AI',
      category: 'Navigation',
      icon: <Sparkles className="w-4 h-4 text-brand dark:text-indigo-400" />,
      action: () => {
        onNavigate('rag');
        onClose();
      },
    },
    {
      id: 'nav-documents',
      title: 'Documents',
      category: 'Navigation',
      icon: <FileText className="w-4 h-4 text-brand dark:text-indigo-400" />,
      action: () => {
        onNavigate('documents');
        onClose();
      },
    },
    {
      id: 'nav-connect',
      title: 'Connect',
      category: 'Navigation',
      icon: <Plug className="w-4 h-4 text-brand dark:text-indigo-400" />,
      action: () => {
        onNavigate('install');
        onClose();
      },
    },
    {
      id: 'nav-projects',
      title: 'Projects',
      category: 'Navigation',
      icon: <Building2 className="w-4 h-4 text-brand dark:text-indigo-400" />,
      action: () => {
        onNavigate('projects');
        onClose();
      },
    },
    {
      id: 'nav-settings',
      title: 'Settings',
      category: 'Navigation',
      icon: <Settings className="w-4 h-4 text-brand dark:text-indigo-400" />,
      action: () => {
        onNavigate('settings');
        onClose();
      },
    },
  ];

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onNavigate(''); // just toggle
      }
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose, onNavigate]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/50 dark:bg-black/70 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col"
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line-light dark:border-ink-2">
              <Search className="w-4 h-4 text-muted dark:text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search commands, signals, insights, or navigation..."
                className="w-full bg-transparent text-sm text-ink dark:text-white placeholder:text-muted-light dark:placeholder:text-slate-500 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-muted-light hover:text-ink dark:hover:text-white p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <span className="text-[10px] font-mono font-semibold text-muted dark:text-slate-400 bg-surface dark:bg-ink-2 border border-line dark:border-slate-700 rounded-md px-1.5 py-0.5">
                ESC
              </span>
            </div>

            <div className="max-h-[340px] overflow-y-auto p-2">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted dark:text-slate-400">
                  No matching results found for "{query}".
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredItems.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={item.id}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-brand-soft dark:bg-indigo-950/50 text-brand dark:text-indigo-300 font-semibold'
                            : 'text-muted-strong dark:text-slate-300 hover:bg-surface dark:hover:bg-ink-2/70'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`p-1.5 rounded-lg ${
                              isSelected ? 'bg-white dark:bg-ink-2 shadow-2xs' : 'text-muted dark:text-slate-400'
                            }`}
                          >
                            {item.icon}
                          </div>
                          <span className="truncate">{item.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-light dark:text-slate-500 font-medium">
                          <span>{item.category}</span>
                          {isSelected && <ArrowRight className="w-3 h-3 text-brand dark:text-indigo-400" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-4 py-2.5 bg-surface dark:bg-ink-2/60 border-t border-line-light dark:border-ink-2 text-[11px] text-muted dark:text-slate-400">
              <div className="flex items-center gap-2 font-medium">
                <span>Navigate</span>
                <span className="font-mono bg-white dark:bg-ink border border-line dark:border-slate-700 rounded px-1">↑↓</span>
                <span>Select</span>
                <span className="font-mono bg-white dark:bg-ink border border-line dark:border-slate-700 rounded px-1">↵</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-semibold text-ink dark:text-white">QuickBit Live Online</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
