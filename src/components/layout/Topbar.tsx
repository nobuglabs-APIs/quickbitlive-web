import React, { useState } from 'react';
import { Search, Menu, Plus, Sun, Moon, FolderGit2, Building2, Plug, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface TopbarProps {
  activeTab: string;
  onOpenCommandPalette: () => void;
  onOpenMobileMenu: () => void;
  onOpenNewProject: () => void;
  onOpenNewWorkspace: () => void;
  onOpenInstall: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  activeTab,
  onOpenCommandPalette,
  onOpenMobileMenu,
  onOpenNewProject,
  onOpenNewWorkspace,
  onOpenInstall,
}) => {
  const { activeWorkspace, activeProject } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);

  const tabLabels: Record<string, string> = {
    overview: 'Overview',
    signals: 'Signals',
    clusters: 'Cases',
    insights: 'Insights',
    recommendations: 'Recommendations',
    decisions: 'Decisions',
    history: 'History',
    sources: 'Sources',
    projects: 'Projects',
    settings: 'Settings',
  };

  const closeCreateMenu = () => setIsCreateMenuOpen(false);

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/90 dark:bg-ink/90 backdrop-blur-md border-b border-line-light dark:border-ink-2 flex items-center justify-between px-3 lg:px-5 font-sans transition-colors duration-200">
      {/* Left: Mobile trigger & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded-lg text-muted dark:text-muted-light hover:text-ink dark:hover:text-white hover:bg-surface dark:hover:bg-ink-2 transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-muted dark:text-muted-light truncate">
          <span className="font-semibold text-ink dark:text-slate-100 hidden sm:inline">
            {activeWorkspace?.name || 'No workspace'}
          </span>
          <span className="text-[#CBD5E1] dark:text-slate-600 hidden sm:inline">/</span>
          <span className="text-muted dark:text-slate-400 hidden md:inline truncate max-w-[140px]">
            {activeProject?.name || 'No project'}
          </span>
          <span className="text-[#CBD5E1] dark:text-slate-600 hidden md:inline">/</span>
          <span className="font-semibold text-brand dark:text-indigo-400 bg-brand-soft dark:bg-brand/15 px-2.5 py-0.5 rounded-md truncate">
            {tabLabels[activeTab] || 'Overview'}
          </span>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="flex-1 max-w-sm mx-3 hidden sm:block">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 bg-surface dark:bg-ink-2/70 hover:bg-frost dark:hover:bg-ink-2 border border-line dark:border-slate-800 rounded-xl text-xs text-muted dark:text-slate-400 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-muted-light dark:text-slate-500" />
            <span>Search signals, insights, cases...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] font-mono bg-white dark:bg-slate-800 border border-line dark:border-slate-700 rounded px-1.5 py-0.5 text-muted dark:text-slate-400 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Quick actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl text-muted dark:text-muted-light hover:text-ink dark:hover:text-white bg-white dark:bg-ink-2 hover:bg-surface dark:hover:bg-slate-700 border border-line dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-muted" />
          )}
        </button>

        {/* Create Dropdown — single, visible place to create anything */}
        <div className="relative">
          <button
            onClick={() => setIsCreateMenuOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand hover:bg-brand-hover dark:bg-brand dark:hover:bg-brand-hover text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isCreateMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isCreateMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={closeCreateMenu} />
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-ink-2 border border-line dark:border-slate-700 rounded-xl shadow-xl z-50 py-1.5">
                <button
                  onClick={() => {
                    closeCreateMenu();
                    onOpenNewProject();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-muted-strong dark:text-slate-300 hover:bg-surface dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                >
                  <FolderGit2 className="w-4 h-4 text-brand dark:text-indigo-400" />
                  <span>New Project</span>
                </button>
                <button
                  onClick={() => {
                    closeCreateMenu();
                    onOpenNewWorkspace();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-muted-strong dark:text-slate-300 hover:bg-surface dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-brand dark:text-indigo-400" />
                  <span>New Workspace</span>
                </button>
                <button
                  onClick={() => {
                    closeCreateMenu();
                    onOpenInstall();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-muted-strong dark:text-slate-300 hover:bg-surface dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                >
                  <Plug className="w-4 h-4 text-brand dark:text-indigo-400" />
                  <span>Connect Signal Source</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};