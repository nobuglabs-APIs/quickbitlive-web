import { apiClient } from '../lib/api/client';
import { Organization, OrganizationUpdate, WorkspaceMember } from '../types/api';

export const organizationsService = {
  list: () => apiClient.get<Organization[]>('/organizations/'),

  get: (orgId: string) => apiClient.get<Organization>(`/organizations/${orgId}`),

  update: (orgId: string, data: OrganizationUpdate) =>
    apiClient.patch<Organization>(`/organizations/${orgId}`, data),

  listMembers: (orgId: string) =>
    apiClient.get<WorkspaceMember[]>(`/organizations/${orgId}/members`),

  inviteMember: (orgId: string, email: string, role: string = 'member') =>
    apiClient.post<{ message?: string }>(`/organizations/${orgId}/members`, { email, role }),

  removeMember: (orgId: string, targetUserId: string) =>
    apiClient.delete<{ message?: string }>(`/organizations/${orgId}/members/${targetUserId}`),
};
