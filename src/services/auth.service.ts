import { apiClient, API_BASE_URL } from '../lib/api/client';
import {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  VerifyTwoFactorRequest,
  ResendTwoFactorRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ResendVerificationRequest,
  UpdateMeRequest,
  ApiKeyCreate,
  ApiKeyResponse,
  User,
} from '../types/api';

export type OAuthProvider = 'google' | 'github';

export const getOAuthUrl = (provider: OAuthProvider): string => `${API_BASE_URL}/auth/${provider}`;

export const authService = {
  login: (data: LoginRequest) => apiClient.post<TokenResponse>('/auth/login', data),

  register: (data: RegisterRequest) => apiClient.post<TokenResponse>('/auth/register', data),

  verify2FA: (data: VerifyTwoFactorRequest) => apiClient.post<TokenResponse>('/auth/verify-2fa', data),

  resend2FA: (data: ResendTwoFactorRequest) => apiClient.post<{ message?: string }>('/auth/resend-2fa', data),

  getMe: () => apiClient.get<User>('/auth/me'),

  updateMe: (data: UpdateMeRequest) => apiClient.patch<User>('/auth/me', data),

  forgotPassword: (data: ForgotPasswordRequest) => apiClient.post<{ message?: string }>('/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordRequest) => apiClient.post<{ message?: string }>('/auth/reset-password', data),

  resendVerification: (data: ResendVerificationRequest) =>
    apiClient.post<{ message?: string }>('/auth/resend-verification', data),

  verifyEmail: (token: string) => apiClient.get<{ message?: string }>('/auth/verify-email', { token }),

  listApiKeys: () => apiClient.get<ApiKeyResponse[]>('/auth/api-keys'),

  createApiKey: (data: ApiKeyCreate) => apiClient.post<ApiKeyResponse>('/auth/api-keys', data),

  deleteApiKey: (keyId: string) => apiClient.delete<{ message?: string }>(`/auth/api-keys/${keyId}`),
};
