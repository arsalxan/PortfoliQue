import api from './api';
import type { NotificationPage } from '../types/notification';

export const notificationService = {
  getNotifications: async (page = 0, size = 15): Promise<NotificationPage> => {
    const response = await api.get<NotificationPage>('/notifications', {
      params: { page, size }
    });
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<{ count: number }>('/notifications/unread-count');
    return response.data.count;
  },

  markAsRead: async (id: number): Promise<void> => {
    await api.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/mark-all-read');
  }
};
