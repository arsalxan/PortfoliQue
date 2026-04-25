import api from './api';
import type { 
  AdminDashboardResponse, 
  AdminUsersPage, 
  AdminPortfoliosPage, 
  AdminFeedbacksPage 
} from '../types/admin';

export const adminService = {
  getDashboardStats: async (): Promise<AdminDashboardResponse> => {
    const response = await api.get<AdminDashboardResponse>('/admin/dashboard');
    return response.data;
  },

  getUsers: async (search = '', page = 0, size = 20): Promise<AdminUsersPage> => {
    const response = await api.get<AdminUsersPage>('/admin/users', {
      params: { search, page, size }
    });
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },

  getPortfolios: async (search = '', page = 0, size = 20): Promise<AdminPortfoliosPage> => {
    const response = await api.get<AdminPortfoliosPage>('/admin/portfolios', {
      params: { search, page, size }
    });
    return response.data;
  },

  deletePortfolio: async (id: number): Promise<void> => {
    await api.delete(`/admin/portfolios/${id}`);
  },

  getFeedbacks: async (givenBy = '', content = '', page = 0, size = 20): Promise<AdminFeedbacksPage> => {
    const response = await api.get<AdminFeedbacksPage>('/admin/feedbacks', {
      params: { givenBy, content, page, size }
    });
    return response.data;
  },

  deleteFeedback: async (id: number): Promise<void> => {
    await api.delete(`/admin/feedbacks/${id}`);
  }
};
