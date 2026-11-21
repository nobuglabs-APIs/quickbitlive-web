import { apiClient } from '../lib/api/client';
import {
  Signal,
  SignalRequest,
  Snapshot,
  Cluster,
  CaseItem,
  Insight,
  Recommendation,
  Decision,
  DecisionOutcomeRequest,
  HistoryItem,
  TrendItem,
  PatternItem,
  EventItem,
} from '../types/api';

export const engineService = {
  createSignal: (data: SignalRequest, apiKey?: string) =>
    apiClient.post<Signal>('/signals', data, undefined, apiKey ? { headers: { 'x-api-key': apiKey } } : undefined),

  listSignals: (workspaceId: string, projectId?: string) =>
    apiClient.get<Signal[]>('/signals', { workspace_id: workspaceId, project_id: projectId }),

  getSnapshot: (workspaceId: string, projectId?: string) =>
    apiClient.get<Snapshot>('/snapshot', { workspace_id: workspaceId, project_id: projectId }),

  getClusters: (workspaceId: string, projectId?: string) =>
    apiClient.get<Cluster[]>('/clusters', { workspace_id: workspaceId, project_id: projectId }),

  getCases: (workspaceId: string, projectId?: string) =>
    apiClient.get<CaseItem[]>('/cases', { workspace_id: workspaceId, project_id: projectId }),

  getInsights: (workspaceId: string, projectId?: string) =>
    apiClient.get<Insight[]>('/insights', { workspace_id: workspaceId, project_id: projectId }),

  getRecommendations: (workspaceId: string, projectId?: string) =>
    apiClient.get<Recommendation[]>('/recommendations', { workspace_id: workspaceId, project_id: projectId }),

  getDecisions: (workspaceId: string, projectId?: string) =>
    apiClient.get<Decision[]>('/decisions', { workspace_id: workspaceId, project_id: projectId }),

  submitDecisionOutcome: (workspaceId: string, decisionId: string, data: DecisionOutcomeRequest) =>
    apiClient.post<Decision>(`/decisions/${decisionId}/outcome`, data, { workspace_id: workspaceId }),

  getTrends: (workspaceId: string, projectId?: string) =>
    apiClient.get<TrendItem[] | Record<string, any>>('/trends', { workspace_id: workspaceId, project_id: projectId }),

  getPatterns: (workspaceId: string, projectId?: string) =>
    apiClient.get<PatternItem[]>('/patterns', { workspace_id: workspaceId, project_id: projectId }),

  getEvents: (workspaceId: string, projectId?: string) =>
    apiClient.get<EventItem[]>('/events', { workspace_id: workspaceId, project_id: projectId }),

  getHistory: (workspaceId: string, projectId?: string) =>
    apiClient.get<any[]>('/history', { workspace_id: workspaceId, project_id: projectId }),

  getHistoryItems: (workspaceId: string, projectId?: string) =>
    apiClient.get<HistoryItem[]>('/history/items', { workspace_id: workspaceId, project_id: projectId }),
};
