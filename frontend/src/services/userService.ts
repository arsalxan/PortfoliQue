import api from './api.ts';
import type { UserProfileResponse } from '../types/user';

export const userService = {
  getProfile: async (): Promise<UserProfileResponse> => {
    const response = await api.get<UserProfileResponse>('/users/profile');
    return response.data;
  },

  updateProfile: async (formData: FormData): Promise<UserProfileResponse> => {
    const response = await api.put<UserProfileResponse>('/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteAccount: async (): Promise<void> => {
    await api.delete('/users/profile');
  }
};
