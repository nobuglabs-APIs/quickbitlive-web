import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';
import { NewProjectModal } from '../modals/NewProjectModal';
import { NewWorkspaceModal } from '../modals/NewWorkspaceModal';
import { SignalDetailDrawer } from '../drawers/SignalDetailDrawer';
import { useAuth } from '../../context/AuthContext';
import { useIsTabActive } from '../../hooks/useIsTabActive';
import { engineService } from '../../services/engine.service';
import { AUTO_REFRESH_INTERVAL } from '../../lib/api/queryClient';
import { Signal } from '../../types/api';

// Features
import { OverviewView } from '../../features/overview/OverviewView';
import { SignalsView } from '../../features/signals/SignalsView';
import { ClustersView } from '../../features/clusters/ClustersView';
import { InsightsView } from '../../features/insights/InsightsView';
import { RecommendationsView } from '../../features/recommendations/RecommendationsView';
import { DecisionsView } from '../../features/decisions/DecisionsView';
import { HistoryView } from '../../features/history/HistoryView';
import { SourcesView } from '../../features/sources/SourcesView';
import { RagQueryView } from '../../features/rag/RagQueryView';
import { DocumentsView } from '../../features/documents/DocumentsView';
import { InstallWidgetView } from '../../features/install/InstallWidgetView';
import { ProjectsView } from '../../features/projects/ProjectsView';
import { SettingsView } from '../../features/settings/SettingsView';

export const AppShell: React.FC = () => {
  const { activeWorkspace, activeProject } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isNewWorkspaceOpen, setIsNewWorkspaceOpen] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);

  const isTabActive = useIsTabActive();
  const pollInterval = isTabActive ? AUTO_REFRESH_INTERVAL : false;

  const workspaceId = activeWorkspace?.id || '';
  const projectId = activeProject?.id;

  // Counts for sidebar badges
  const { data: signals = [] } = useQuery({
    queryKey: ['signals', workspaceId, projectId],
    queryFn: () => engineService.listSignals(workspaceId, projectId),
    enabled: !!workspaceId,
    refetchInterval: pollInterval,
  });

  const { data: insights = [] } = useQuery({
    queryKey: ['insights', workspaceId, projectId],
    queryFn: () => engineService.getInsights(workspaceId, projectId),
    enabled: !!workspaceId,
    refetchInterval: pollInterval,
  });

  const { data: clusters = [] } = useQuery({
    queryKey: ['clusters', workspaceId, projectId],
    queryFn: () => engineService.getClusters(workspaceId, projectId),
    enabled: !!workspaceId,
    refetchInterval: pollInterval,
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ['recommendations', workspaceId, projectId],
    queryFn: () => engineService.getRecommendations(workspaceId, projectId),
    enabled: !!workspaceId,
    refetchInterval: pollInterval,
  });

  const { data: decisions = [] } = useQuery({
    queryKey: ['decisions', workspaceId, projectId],
    queryFn: () => engineService.getDecisions(workspaceId, projectId),
    enabled: !!workspaceId,
    refetchInterval: pollInterval,
  });

  const { data: historyItems = [] } = useQuery({
    queryKey: ['historyItems', workspaceId, projectId],
    queryFn: () => engineService.getHistoryItems(workspaceId, projectId),
    enabled: !!workspaceId,
    refetchInterval: pollInterval,
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface dark:bg-surface-deep font-sans antialiased text-ink dark:text-frost transition-colors duration-200">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenNewWorkspace={() => setIsNewWorkspaceOpen(true)}
          onOpenNewProject={() => setIsNewProjectOpen(true)}
          signalsCount={signals.length}
          insightsCount={insights.length}
          clustersCount={clusters.length}
          recommendationsCount={recommendations.length}
          decisionsCount={decisions.length}
          historyCount={historyItems.length}
        />
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 h-full">
            <Sidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onOpenNewWorkspace={() => {
                setIsMobileMenuOpen(false);
                setIsNewWorkspaceOpen(true);
              }}
              onOpenNewProject={() => {
                setIsMobileMenuOpen(false);
                setIsNewProjectOpen(true);
              }}
              signalsCount={signals.length}
              insightsCount={insights.length}
              clustersCount={clusters.length}
              recommendationsCount={recommendations.length}
              decisionsCount={decisions.length}
              historyCount={historyItems.length}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Topbar
          activeTab={activeTab}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenNewProject={() => setIsNewProjectOpen(true)}
          onOpenNewWorkspace={() => setIsNewWorkspaceOpen(true)}
          onOpenInstall={() => setActiveTab('install')}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {activeTab === 'overview' && (
            <OverviewView
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'signals' && (
            <SignalsView
              onOpenInstall={() => setActiveTab('install')}
              onSelectSignal={setSelectedSignal}
            />
          )}

          {activeTab === 'clusters' && (
            <ClustersView onNavigate={setActiveTab} />
          )}

          {activeTab === 'insights' && (
            <InsightsView onNavigate={setActiveTab} />
          )}

          {activeTab === 'recommendations' && (
            <RecommendationsView />
          )}

          {activeTab === 'decisions' && (
            <DecisionsView />
          )}

          {activeTab === 'history' && <HistoryView />}

          {activeTab === 'sources' && (
            <SourcesView />
          )}

          {activeTab === 'rag' && <RagQueryView />}

          {activeTab === 'documents' && <DocumentsView />}

          {activeTab === 'install' && <InstallWidgetView />}

          {activeTab === 'projects' && <ProjectsView onNavigate={setActiveTab} />}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setActiveTab}
        signalsCount={signals.length}
        insightsCount={insights.length}
      />

      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
      />

      <NewWorkspaceModal
        isOpen={isNewWorkspaceOpen}
        onClose={() => setIsNewWorkspaceOpen(false)}
      />

      <SignalDetailDrawer
        signal={selectedSignal}
        isOpen={!!selectedSignal}
        onClose={() => setSelectedSignal(null)}
      />
    </div>
  );
};
