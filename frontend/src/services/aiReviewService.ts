import api from './api';
import type { AiReviewStatus, AiReviewFull, AiReviewHistoryPage } from '../types/portfolio';

export const aiReviewService = {
  // Trigger a new review for a given portfolio
  triggerReview: async (portfolioId: number): Promise<AiReviewStatus> => {
    const res = await api.post<AiReviewStatus>(`/portfolios/${portfolioId}/ai-review/trigger`);
    return res.data;
  },

  // Poll the status of an in-progress review
  getReviewStatus: async (reviewId: number): Promise<AiReviewStatus> => {
    const res = await api.get<AiReviewStatus>(`/portfolios/ai-reviews/${reviewId}/status`);
    return res.data;
  },

  // Fetch the full review content (only call when COMPLETED)
  getFullReview: async (reviewId: number): Promise<AiReviewFull> => {
    const res = await api.get<AiReviewFull>(`/portfolios/ai-reviews/${reviewId}`);
    return res.data;
  },

  // Paginated history of all reviews for a portfolio
  getReviewHistory: async (portfolioId: number, page = 0, size = 5): Promise<AiReviewHistoryPage> => {
    const res = await api.get<AiReviewHistoryPage>(`/portfolios/${portfolioId}/ai-reviews/history`, {
      params: { page, size }
    });
    return res.data;
  }
};
