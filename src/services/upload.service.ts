import { apiClient } from '../lib/api/client';
import { ProjectDocument } from '../types/api';

export const uploadService = {
  uploadUserAvatar: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiClient.upload<{ avatar_url?: string; message?: string }>('/upload/users/me/avatar', fd);
  },

  uploadOrgLogo: (orgId: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiClient.upload<{ logo_url?: string; message?: string }>(`/upload/organizations/${orgId}/logo`, fd);
  },

  uploadWorkspaceLogo: (workspaceId: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiClient.upload<{ logo_url?: string; message?: string }>(`/upload/workspaces/${workspaceId}/logo`, fd);
  },

  uploadProjectLogo: (projectId: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiClient.upload<{ logo_url?: string; message?: string }>(`/upload/projects/${projectId}/logo`, fd);
  },

  uploadProjectDocument: (projectId: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiClient.upload<ProjectDocument>(`/upload/projects/${projectId}/document`, fd);
  },

  listProjectDocuments: (projectId: string) =>
    apiClient.get<ProjectDocument[]>(`/upload/projects/${projectId}`),

  getDocumentStatus: (projectId: string, documentId: string) =>
    apiClient.get<ProjectDocument>(`/upload/projects/${projectId}/documents/${documentId}`),

  deleteProjectDocument: (projectId: string, documentId: string) =>
    apiClient.delete<{ message?: string }>(`/upload/projects/${projectId}/documents/${documentId}`),
};
