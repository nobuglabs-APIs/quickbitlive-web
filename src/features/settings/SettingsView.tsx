import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Settings, Save, Mail, Trash2, Plus, Upload, Building2, Check, FolderGit2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { NewWorkspaceModal } from '../../components/modals/NewWorkspaceModal';
import { NewProjectModal } from '../../components/modals/NewProjectModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { workspacesService } from '../../services/workspaces.service';
import { authService } from '../../services/auth.service';
import { uploadService } from '../../services/upload.service';
import { WorkspaceMember } from '../../types/api';

export const SettingsView: React.FC = () => {
  const { user, workspaces, activeWorkspace, setActiveWorkspace, projects, activeProject, setActiveProject, refreshUserData, refreshWorkspaces } = useAuth();
  const { success, error: showError } = useToast();

  const [activeTab, setActiveTab] = useState<'workspace' | 'members' | 'profile'>('workspace');

  // Workspace settings
  const [workspaceName, setWorkspaceName] = useState(activeWorkspace?.name || '');
  const [workspaceDescription, setWorkspaceDescription] = useState(activeWorkspace?.description || '');
  const [isSavingWs, setIsSavingWs] = useState(false);
  const [isNewWsOpen, setIsNewWsOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

  // Invite member
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isInviting, setIsInviting] = useState(false);

  // User Profile
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [isSavingUser, setIsSavingUser] = useState(false);

  const workspaceId = activeWorkspace?.id || '';

  useEffect(() => {
    setWorkspaceName(activeWorkspace?.name || '');
    setWorkspaceDescription(activeWorkspace?.description || '');
  }, [activeWorkspace]);

  const {
    data: members = [],
    isLoading: isLoadingMembers,
    refetch: refetchMembers,
  } = useQuery<WorkspaceMember[]>({
    queryKey: ['workspace-members', workspaceId],
    queryFn: () => workspacesService.listMembers(workspaceId),
    enabled: !!workspaceId,
  });

  const handleSaveWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId || !workspaceName.trim()) return;

    setIsSavingWs(true);
    try {
      await workspacesService.update(workspaceId, {
        name: workspaceName.trim(),
        description: workspaceDescription.trim() || null,
      });
      success('Workspace Saved', 'Workspace details updated.');
      await refreshWorkspaces();
    } catch (err: any) {
      showError('Save failed', err.message);
    } finally {
      setIsSavingWs(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId || !inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      await workspacesService.inviteMember(workspaceId, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      success('Invite Dispatched', `Invitation sent to ${inviteEmail.trim()}`);
      setInviteEmail('');
      refetchMembers();
    } catch (err: any) {
      showError('Invite failed', err.message);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    if (!workspaceId) return;
    try {
      await workspacesService.removeMember(workspaceId, targetUserId);
      success('Member Removed', 'User access removed from this workspace.');
      refetchMembers();
    } catch (err: any) {
      showError('Remove failed', err.message);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingUser(true);
    try {
      await authService.updateMe({ full_name: fullName.trim() });
      success('Profile Updated', 'Your profile details have been saved.');
      await refreshUserData();
    } catch (err: any) {
      showError('Update failed', err.message);
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadService.uploadUserAvatar(file);
      success('Avatar Updated', 'Your avatar image has been uploaded.');
      await refreshUserData();
    } catch (err: any) {
      showError('Upload failed', err.message);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line-light dark:border-ink-2">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-ink dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-brand dark:text-indigo-400" />
            Workspace & Account Settings
          </h1>
          <p className="text-xs text-muted dark:text-slate-400 mt-1">
            Manage organization members, workspace configurations, and personal profile credentials.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 bg-white dark:bg-ink-2 border border-line dark:border-slate-700 rounded-xl shadow-2xs">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'workspace'
                ? 'bg-brand text-white shadow-xs'
                : 'text-muted dark:text-slate-400 hover:text-ink dark:hover:text-white'
            }`}
          >
            Workspace
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'members'
                ? 'bg-brand text-white shadow-xs'
                : 'text-muted dark:text-slate-400 hover:text-ink dark:hover:text-white'
            }`}
          >
            Members ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-brand text-white shadow-xs'
                : 'text-muted dark:text-slate-400 hover:text-ink dark:hover:text-white'
            }`}
          >
            My Profile
          </button>
        </div>
      </div>

      {activeTab === 'workspace' && (
        <div className="space-y-6 max-w-2xl">
          {/* Workspace Details */}
          <form onSubmit={handleSaveWorkspace} className="p-6 bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pr-1">
              <h3 className="text-xs font-bold text-ink dark:text-white uppercase tracking-wider">
                Workspace Details
              </h3>
            </div>

            <Input
              label="Workspace Name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              required
            />

            <Input
              label="Description"
              placeholder="What is this workspace for?"
              value={workspaceDescription}
              onChange={(e) => setWorkspaceDescription(e.target.value)}
            />

            <div className="pt-1">
              <Button type="submit" variant="primary" size="sm" isLoading={isSavingWs} leftIcon={<Save className="w-3.5 h-3.5" />}>
                Save Workspace
              </Button>
            </div>
          </form>

          {/* Workspaces */}
          <div className="p-6 bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-ink dark:text-white uppercase tracking-wider">
                Your Workspaces
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsNewWsOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                New Workspace
              </Button>
            </div>

            <div className="divide-y divide-line-light dark:divide-ink-2">
              {workspaces.map((ws) => {
                const isActive = ws.id === workspaceId;
                return (
                  <button
                    key={ws.id}
                    onClick={() => setActiveWorkspace(ws)}
                    disabled={isActive}
                    className={`w-full flex items-center gap-3 py-3 text-left transition-colors ${
                      isActive ? 'cursor-default' : 'hover:bg-surface dark:hover:bg-slate-800/60 cursor-pointer'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand to-[#7C3AED] text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-2xs">
                      {ws.name ? ws.name[0].toUpperCase() : <Building2 className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-ink dark:text-white truncate flex items-center gap-1.5">
                        {ws.name}
                      </div>
                      {ws.description && (
                        <div className="text-[11px] text-muted dark:text-slate-400 truncate mt-0.5">
                          {ws.description}
                        </div>
                      )}
                    </div>
                    {isActive && (
                      <Badge variant="success" size="sm">
                        <Check className="w-2.5 h-2.5" /> Active
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Projects in this workspace */}
          <div className="p-6 bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-ink dark:text-white uppercase tracking-wider">
                Projects in {activeWorkspace?.name || 'Workspace'}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsNewProjectOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                New Project
              </Button>
            </div>

            <div className="divide-y divide-line-light dark:divide-ink-2">
              {projects.map((p) => {
                const isActive = p.id === activeProject?.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActiveProject(p)}
                    disabled={isActive}
                    className={`w-full flex items-center gap-3 py-3 text-left transition-colors ${
                      isActive ? 'cursor-default' : 'hover:bg-surface dark:hover:bg-slate-800/60 cursor-pointer'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-brand-soft dark:bg-indigo-950/50 text-brand dark:text-indigo-400 flex items-center justify-center text-sm font-bold shrink-0">
                      <FolderGit2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-ink dark:text-white truncate">{p.name}</div>
                      {p.description && (
                        <div className="text-[11px] text-muted dark:text-slate-400 truncate mt-0.5">{p.description}</div>
                      )}
                    </div>
                    {isActive && (
                      <Badge variant="success" size="sm">
                        <Check className="w-2.5 h-2.5" /> Active
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <NewWorkspaceModal
            isOpen={isNewWsOpen}
            onClose={() => setIsNewWsOpen(false)}
          />

          <NewProjectModal
            isOpen={isNewProjectOpen}
            onClose={() => setIsNewProjectOpen(false)}
          />
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-6">
          {/* Invite form */}
          <form onSubmit={handleInviteMember} className="p-6 bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-ink dark:text-white uppercase tracking-wider">
              Invite Team Member
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Input
                  placeholder="colleague@company.com"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-32"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </Select>

                <Button type="submit" variant="primary" size="md" isLoading={isInviting} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Invite
                </Button>
              </div>
            </div>
          </form>

          {/* Members Table */}
          {isLoadingMembers ? (
            <TableSkeleton rows={3} columns={3} />
          ) : (
            <div className="border border-line-light dark:border-ink-2 rounded-2xl bg-white dark:bg-ink overflow-hidden shadow-2xs">
              <div className="flex items-center justify-between p-4 border-b border-line-light dark:border-ink-2 bg-surface dark:bg-ink-2/60 text-xs font-bold text-muted dark:text-slate-400 uppercase tracking-wider">
                <span className="flex-1">Member</span>
                <span className="w-32">Role</span>
                <span className="w-16 text-right">Action</span>
              </div>

              <div className="divide-y divide-line-light dark:divide-ink-2">
                {members.map((m) => (
                  <div
                    key={m.id || m.user_id}
                    className="flex items-center justify-between p-4 text-xs hover:bg-surface dark:hover:bg-ink-2/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand to-[#7C3AED] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                        {m.email ? m.email[0].toUpperCase() : 'M'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-ink dark:text-white truncate">
                          {m.full_name || m.email?.split('@')[0]}
                        </div>
                        <div className="text-[11px] text-muted dark:text-slate-400 truncate font-mono">
                          {m.email}
                        </div>
                      </div>
                    </div>

                    <div className="w-32">
                      <Badge variant="neutral" size="sm">
                        {m.role || 'Member'}
                      </Badge>
                    </div>

                    <div className="w-16 text-right">
                      {m.user_id !== user?.id && (
                        <button
                          onClick={() => handleRemoveMember(m.user_id || m.id)}
                          className="text-muted-light hover:text-rose-600 dark:hover:text-rose-400 p-1 transition-colors cursor-pointer"
                          title="Remove user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="p-6 bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl shadow-2xs space-y-4 max-w-xl">
          <h3 className="text-xs font-bold text-ink dark:text-white uppercase tracking-wider">
            Personal Profile
          </h3>

          <div className="flex items-center gap-4">
            {user?.avatar_url && !user.avatar_url.includes('default.svg') ? (
              <img
                src={user.avatar_url}
                alt={user?.full_name || 'Avatar'}
                className="w-12 h-12 rounded-2xl object-cover border border-line dark:border-slate-700 shrink-0 shadow-2xs"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand to-[#7C3AED] text-white flex items-center justify-center text-base font-bold shrink-0 shadow-2xs">
                {user?.full_name ? user.full_name[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : 'U'}
              </div>
            )}

            <label className="text-xs text-ink dark:text-white font-semibold border border-line dark:border-slate-700 bg-white dark:bg-ink-2 hover:bg-surface dark:hover:bg-slate-800 px-3 py-1.5 rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs">
              <Upload className="w-3.5 h-3.5 text-brand dark:text-indigo-400" />
              <span>Change Avatar</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
            </label>
          </div>

          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <Input
            label="Email Address"
            value={user?.email || ''}
            disabled
            helperText="Managed by account authentication."
          />

          <div className="pt-2">
            <Button type="submit" variant="primary" size="sm" isLoading={isSavingUser} leftIcon={<Save className="w-3.5 h-3.5" />}>
              Save Profile
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
