import { apiClient } from '../lib/api/client';
import {
  Workspace,
  WorkspaceCreate,
  WorkspaceUpdate,
  WorkspaceMember,
  MemberInvite,
  InviteInfo,
} from '../types/api';

export const workspacesService = {
  list: () => apiClient.get<Workspace[]>('/workspaces/'),

  create: (data: WorkspaceCreate) => apiClient.post<Workspace>('/workspaces/', data),

  get: (workspaceId: string) => apiClient.get<Workspace>(`/workspaces/${workspaceId}`),

  update: (workspaceId: string, data: WorkspaceUpdate) =>
    apiClient.patch<Workspace>(`/workspaces/${workspaceId}`, data),

  delete: (workspaceId: string) => apiClient.delete<{ message?: string }>(`/workspaces/${workspaceId}`),

  listMembers: (workspaceId: string) =>
    apiClient.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members/`),

  inviteMember: (workspaceId: string, data: MemberInvite) =>
    apiClient.post<InviteInfo>(`/workspaces/${workspaceId}/members/invite`, data),

  acceptInvite: (workspaceId: string, token: string) =>
    apiClient.post<{ message?: string }>(`/workspaces/${workspaceId}/members/accept`, { token }),

  listInvites: (workspaceId: string) =>
    apiClient.get<InviteInfo[]>(`/workspaces/${workspaceId}/members/invites`),

  removeMember: (workspaceId: string, targetUserId: string) =>
    apiClient.delete<{ message?: string }>(`/workspaces/${workspaceId}/members/${targetUserId}`),
};
