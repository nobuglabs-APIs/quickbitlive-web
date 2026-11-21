import React from 'react';
import {
  LayoutDashboard,
  Radio,
  Layers,
  Lightbulb,
  Target,
  CheckCircle2,
  History,
  Database,
  Building2,
  Settings,
  ChevronDown,
  Plus,
  LogOut,
} from 'lucide-react';
import { Logo } from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  badge?: string;
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenNewWorkspace: () => void;
  onOpenNewProject?: () => void;
  signalsCount?: number;
  insightsCount?: number;
  clustersCount?: number;
  recommendationsCount?: number;
  decisionsCount?: number;
  historyCount?: number;
  onCloseMobile?: () => void;
}

/* Identity avatar: deterministic tone per id so each workspace/project is recognizable */
const AVATAR_TONES = [
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
];

const toneFor = (id: string): string => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_TONES[h % AVATAR_TONES.length];
};

const initialsFor = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenNewWorkspace,
  onOpenNewProject,
  signalsCount,
  insightsCount,
  clustersCount,
  recommendationsCount,
  decisionsCount,
  historyCount,
  onCloseMobile,
}) => {
  const {
    user,
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    projects,
    activeProject,
    setActiveProject,
    logout,
  } = useAuth();

  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = React.useState(false);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'signals', label: 'Signals', icon: Radio, count: signalsCount },
    { id: 'clusters', label: 'Cases', icon: Layers, count: clustersCount },
    { id: 'insights', label: 'Insights', icon: Lightbulb, count: insightsCount },
    { id: 'recommendations', label: 'Recommendations', icon: Target, count: recommendationsCount },
    { id: 'decisions', label: 'Decisions', icon: CheckCircle2, count: decisionsCount },
    { id: 'history', label: 'History', icon: History, count: historyCount },
    { id: 'sources', label: 'Sources', icon: Database },
    { id: 'projects', label: 'Projects', icon: Building2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tabId: string) => {
    onTabChange(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  const displayName = user?.full_name || 'John Doe';
  const roleName = user?.email ? (user.email.includes('admin') ? 'Admin Team' : 'Product Team') : 'Product Team';

  return (
    <aside className="w-56 h-full bg-white dark:bg-ink border-r border-line-light dark:border-ink-2 flex flex-col justify-between select-none shrink-0 font-sans transition-colors duration-200">
      <div className="flex flex-col min-h-0 flex-1">
        {/* Brand Header */}
        <div className="px-4 pt-3 pb-3 flex items-center justify-start">
          <Logo variant="full" size="md" />
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-brand-soft dark:bg-brand/15 text-brand dark:text-indigo-400 font-semibold'
                    : 'text-muted dark:text-slate-400 hover:bg-surface dark:hover:bg-ink-2 hover:text-ink dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-brand dark:text-indigo-400' : 'text-muted-light dark:text-slate-500'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      isActive
                        ? 'bg-brand text-white'
                        : 'bg-frost dark:bg-ink-2 text-muted dark:text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Workspace Selector & User Profile */}
      <div className="p-3 border-t border-line-light dark:border-ink-2 space-y-2.5">
        {/* Workspace Selector Box */}
        <div className="relative">
          <div className="text-[10px] font-bold text-muted-light dark:text-slate-500 uppercase tracking-wider px-1 mb-1.5 font-sans">
            WORKSPACE
          </div>
          <button
            onClick={() => {
              setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen);
            }}
            className="w-full flex items-center justify-between px-2.5 py-2 bg-surface dark:bg-ink-2/70 hover:bg-frost dark:hover:bg-ink-2 border border-line dark:border-slate-800 rounded-xl text-xs font-semibold text-ink dark:text-slate-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold ${toneFor(activeWorkspace?.id || '')}`}>
                {initialsFor(activeWorkspace?.name || '?')}
              </div>
              <span className="truncate">{activeWorkspace?.name || 'No workspace'}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-light dark:text-slate-500 shrink-0" />
          </button>

          {isWorkspaceMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1.5 bg-white dark:bg-ink-2 border border-line dark:border-slate-700 rounded-xl shadow-xl z-30 py-1 max-h-48 overflow-y-auto">
              <div className="px-3 py-1.5 text-[10px] font-bold text-muted-light dark:text-slate-400 uppercase tracking-wider border-b border-frost dark:border-slate-700">
                <span>Switch Workspace</span>
              </div>
              <button
                onClick={() => {
                  setIsWorkspaceMenuOpen(false);
                  onOpenNewWorkspace();
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-brand dark:text-indigo-400 hover:bg-surface dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> New Workspace
              </button>
              <div className="border-t border-frost dark:border-slate-700 my-1" />
              {workspaces.length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted dark:text-slate-400 text-center">
                  <span>No workspaces yet</span>
                </div>
              ) : (
                workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setIsWorkspaceMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-surface dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                      activeWorkspace?.id === ws.id
                        ? 'font-semibold text-brand dark:text-indigo-400 bg-brand-soft dark:bg-brand/15'
                        : 'text-muted-strong dark:text-slate-300'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    {activeWorkspace?.id === ws.id && <span className="w-1.5 h-1.5 rounded-full bg-brand" />}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Project Selector Box */}
        <div className="relative">
          <div className="text-[10px] font-bold text-muted-light dark:text-slate-500 uppercase tracking-wider px-1 mb-1.5 font-sans">
            Project
          </div>
          <button
            onClick={() => {
              setIsProjectMenuOpen(!isProjectMenuOpen);
            }}
            className="w-full flex items-center justify-between px-2.5 py-2 bg-surface dark:bg-ink-2/70 hover:bg-frost dark:hover:bg-ink-2 border border-line dark:border-slate-800 rounded-xl text-xs font-semibold text-ink dark:text-slate-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold ${toneFor(activeProject?.id || '')}`}>
                {initialsFor(activeProject?.name || '?')}
              </div>
              <span className="truncate">{activeProject?.name || 'No project'}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-light dark:text-slate-500 shrink-0" />
          </button>

          {isProjectMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1.5 bg-white dark:bg-ink-2 border border-line dark:border-slate-700 rounded-xl shadow-xl z-30 py-1 max-h-48 overflow-y-auto">
              <div className="px-3 py-1.5 text-[10px] font-bold text-muted-light dark:text-slate-400 uppercase tracking-wider border-b border-frost dark:border-slate-700">
                <span>Switch Project</span>
              </div>
              <button
                onClick={() => {
                  setIsProjectMenuOpen(false);
                  onOpenNewProject?.();
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-brand dark:text-indigo-400 hover:bg-surface dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> New Project
              </button>
              <div className="border-t border-frost dark:border-slate-700 my-1" />
              {projects.length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted dark:text-slate-400 text-center">
                  <span>No projects yet</span>
                </div>
              ) : (
                projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      setActiveProject(proj);
                      setIsProjectMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-surface dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                      activeProject?.id === proj.id
                        ? 'font-semibold text-brand dark:text-indigo-400 bg-brand-soft dark:bg-brand/15'
                        : 'text-muted-strong dark:text-slate-300'
                    }`}
                  >
                    <span className="truncate">{proj.name}</span>
                    {activeProject?.id === proj.id && <span className="w-1.5 h-1.5 rounded-full bg-brand" />}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* User profile row */}
        <div className="relative pt-1">
          <div
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-surface dark:hover:bg-ink-2 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {user?.avatar_url && !user.avatar_url.includes('default.svg') ? (
                <img
                  src={user.avatar_url}
                  alt={displayName}
                  className="w-7 h-7 rounded-full object-cover border border-amber-300 shrink-0 shadow-2xs"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-200 to-amber-400 border border-amber-300 flex items-center justify-center text-[#78350F] font-bold text-xs shrink-0 shadow-2xs">
                  {displayName[0]}
                </div>
              )}
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-xs font-semibold text-ink dark:text-slate-200 truncate leading-tight">
                  {displayName}
                </span>
                <span className="text-[11px] text-muted-light dark:text-slate-500 truncate leading-tight">
                  {roleName}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-light dark:text-slate-500 shrink-0" />
          </div>

          {isUserMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1.5 bg-white dark:bg-ink-2 border border-line dark:border-slate-700 rounded-xl shadow-xl z-30 py-1">
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  onTabChange('settings');
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-muted-strong dark:text-slate-300 hover:bg-surface dark:hover:bg-slate-800 flex items-center gap-2"
              >
                <Settings className="w-3.5 h-3.5 text-muted-light dark:text-slate-400" />
                <span>Account Settings</span>
              </button>
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-medium"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
