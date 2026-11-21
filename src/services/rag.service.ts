import { apiClient } from '../lib/api/client';
import { RAGQueryRequest, RAGQueryResponse } from '../types/api';

export const ragService = {
  query: (data: RAGQueryRequest) => apiClient.post<RAGQueryResponse>('/rag/query', data),

  invalidate: (projectId: string) => apiClient.post<{ message?: string }>(`/rag/invalidate/${projectId}`),
};
