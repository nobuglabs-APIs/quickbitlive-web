import { apiClient } from '../lib/api/client';
import { IrisConfig, IrisConfigResponse } from '../types/api';

export const irisService = {
  getIrisConfig: (workspaceId: string, projectId: string) =>
    apiClient
      .get<IrisConfigResponse>(`/workspaces/${workspaceId}/projects/${projectId}/iris`)
      .then((res) => res.iris || null),

  updateIrisConfig: (workspaceId: string, projectId: string, config: IrisConfig) =>
    apiClient
      .patch<IrisConfigResponse>(`/workspaces/${workspaceId}/projects/${projectId}/iris`, config)
      .then((res) => res.iris || null),

  resetIrisConfig: (workspaceId: string, projectId: string) =>
    apiClient.delete<{ message?: string }>(`/workspaces/${workspaceId}/projects/${projectId}/iris`),

  widgetVerify: (token?: string) =>
    apiClient.post<{ status?: string; valid?: boolean }>('/api/v1/widget/verify', undefined, undefined, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  widgetChat: (data: { project_id?: string; message: string; history?: any[]; context?: any }, token?: string) =>
    apiClient.post<{ reply?: string; response?: string; message?: string }>('/api/v1/widget/chat', data, undefined, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
};
