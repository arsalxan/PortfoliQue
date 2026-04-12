import api from './api.ts';
import type { Feedback, FeedbackPage, FeedbackRequest } from '../types/feedback.ts';

export const feedbackService = {
  getFeedbacksForPortfolio: async (portfolioId: number, page = 0, size = 10): Promise<FeedbackPage> => {
    const response = await api.get<FeedbackPage>(`/portfolios/${portfolioId}/feedbacks`, {
      params: { page, size }
    });
    return response.data;
  },

  getMyFeedbacks: async (page = 0, size = 10): Promise<FeedbackPage> => {
    const response = await api.get<FeedbackPage>('/feedbacks/my', {
      params: { page, size }
    });
    return response.data;
  },

  createFeedback: async (portfolioId: number, data: FeedbackRequest): Promise<Feedback> => {
    const response = await api.post<Feedback>(`/portfolios/${portfolioId}/feedbacks`, data);
    return response.data;
  },

  getFeedbackById: async (id: number): Promise<Feedback> => {
    const response = await api.get<Feedback>(`/feedbacks/${id}`);
    return response.data;
  },

  updateFeedback: async (id: number, data: FeedbackRequest): Promise<Feedback> => {
    const response = await api.put<Feedback>(`/feedbacks/${id}`, data);
    return response.data;
  },

  deleteFeedback: async (id: number): Promise<void> => {
    await api.delete(`/feedbacks/${id}`);
  },

  summarizeFeedback: async (id: number): Promise<{ summary: string }> => {
    const response = await api.get<{ summary: string }>(`/feedbacks/${id}/summarize`);
    return response.data;
  }
};
