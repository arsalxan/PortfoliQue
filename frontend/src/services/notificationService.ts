import api from './api.ts';
import type { NotificationPage } from '../types/notification.ts';

export const notificationService = {
  getNotifications: async (page = 0, size = 20): Promise<NotificationPage> => {
    const response = await api.get<NotificationPage>('/notifications', { params: { page, size } });
    return response.data;
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await api.get<{ count: number }>('/notifications/unread-count');
    return response.data;
  },

  getUnreadPreview: async (): Promise<Notification[]> => {
    const response = await api.get<Notification[]>('/notifications/unread-preview');
    return response.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await api.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/mark-all-read');
  },
};
