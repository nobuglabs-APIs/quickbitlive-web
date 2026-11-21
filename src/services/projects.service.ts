import { apiClient } from '../lib/api/client';
import { Project, ProjectCreate, ProjectUpdate, IrisConfig } from '../types/api';

export const projectsService = {
  list: (workspaceId: string) =>
    apiClient.get<Project[]>(`/workspaces/${workspaceId}/projects/`),

  create: (workspaceId: string, data: ProjectCreate) =>
    apiClient.post<Project>(`/workspaces/${workspaceId}/projects/`, data),

  get: (workspaceId: string, projectId: string) =>
    apiClient.get<Project>(`/workspaces/${workspaceId}/projects/${projectId}`),

  update: (workspaceId: string, projectId: string, data: ProjectUpdate) =>
    apiClient.patch<Project>(`/workspaces/${workspaceId}/projects/${projectId}`, data),

  delete: (workspaceId: string, projectId: string) =>
    apiClient.delete<{ message?: string }>(`/workspaces/${workspaceId}/projects/${projectId}`),

  getIris: (workspaceId: string, projectId: string) =>
    apiClient.get<IrisConfig>(`/workspaces/${workspaceId}/projects/${projectId}/iris`),

  updateIris: (workspaceId: string, projectId: string, config: IrisConfig) =>
    apiClient.patch<IrisConfig>(`/workspaces/${workspaceId}/projects/${projectId}/iris`, config),

  resetIris: (workspaceId: string, projectId: string) =>
    apiClient.delete<{ message?: string }>(`/workspaces/${workspaceId}/projects/${projectId}/iris`),
};
