import api from './api.ts';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth.ts';

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  verifyEmail: async (token: string): Promise<AuthResponse> => {
    const response = await api.get<AuthResponse>(`/auth/verify-email/${token}`);
    return response.data;
  },
};
