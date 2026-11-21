/**
 * QuickBit Live Central API Client
 * Base URL: configured via VITE_API_URL (see .env.development / .env.production).
 * Dev fallback: /api-proxy (Vite proxy to http://localhost:8000).
 */

import { mapApiError, FormattedError } from './errorHandler';

const envApiUrl = typeof import.meta !== 'undefined'
  ? String(import.meta.env?.VITE_API_URL || '').trim()
  : '';

export const API_BASE_URL = envApiUrl
  || (typeof import.meta !== 'undefined' && import.meta.env?.DEV ? '/api-proxy' : 'http://localhost:8000');

const TOKEN_KEY = 'quickbit_access_token';

export const authStorage = {
  getToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {}
  },
  removeToken: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },
};

export class ApiError extends Error {
  status: number;
  detail?: any;

  constructor(formatted: FormattedError) {
    super(formatted.message);
    this.name = 'ApiError';
    this.status = formatted.status;
    this.detail = formatted.detail;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
  token?: string | null;
}

export async function apiRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', headers = {}, body, params, token } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.append(k, String(v));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const activeToken = token !== undefined ? token : authStorage.getToken();

  const reqHeaders: Record<string, string> = {
    ...headers,
  };

  if (activeToken) {
    reqHeaders['Authorization'] = `Bearer ${activeToken}`;
  }

  let reqBody: BodyInit | undefined = undefined;
  if (body !== undefined) {
    if (body instanceof FormData) {
      reqBody = body;
    } else {
      reqHeaders['Content-Type'] = 'application/json';
      reqBody = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(url, {
      method,
      headers: reqHeaders,
      body: reqBody,
    });

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: response.statusText };
      }

      const formatted = mapApiError({
        status: response.status,
        detail: errorData?.detail || errorData?.message || response.statusText,
      });

      if (response.status === 401) {
        // Broadcast unauthorized event if needed
        window.dispatchEvent(new CustomEvent('quickbit:unauthorized'));
      }

      throw new ApiError(formatted);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return (await response.json()) as T;
    }

    return (await response.text()) as unknown as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    const formatted = mapApiError(err);
    throw new ApiError(formatted);
  }
}

export const apiClient = {
  get: <T = any>(endpoint: string, params?: Record<string, any>, options?: Partial<RequestOptions>) =>
    apiRequest<T>(endpoint, { method: 'GET', params, ...options }),

  post: <T = any>(endpoint: string, body?: any, params?: Record<string, any>, options?: Partial<RequestOptions>) =>
    apiRequest<T>(endpoint, { method: 'POST', body, params, ...options }),

  patch: <T = any>(endpoint: string, body?: any, params?: Record<string, any>, options?: Partial<RequestOptions>) =>
    apiRequest<T>(endpoint, { method: 'PATCH', body, params, ...options }),

  delete: <T = any>(endpoint: string, params?: Record<string, any>, options?: Partial<RequestOptions>) =>
    apiRequest<T>(endpoint, { method: 'DELETE', params, ...options }),

  upload: <T = any>(endpoint: string, formData: FormData, params?: Record<string, any>, options?: Partial<RequestOptions>) =>
    apiRequest<T>(endpoint, { method: 'POST', body: formData, params, ...options }),
};
