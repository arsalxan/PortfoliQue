import api from './api.ts';
import type { Portfolio, PortfolioPage, AiReviewResponse } from '../types/portfolio.ts';

export const portfolioService = {
  getAllPortfolios: async (page = 0, size = 6): Promise<PortfolioPage> => {
    const response = await api.get<PortfolioPage>('/portfolios', {
      params: { page, size }
    });
    return response.data;
  },

  getMyPortfolios: async (page = 0, size = 6): Promise<PortfolioPage> => {
    const response = await api.get<PortfolioPage>('/portfolios/my', {
      params: { page, size }
    });
    return response.data;
  },

  getPortfolioById: async (id: number): Promise<Portfolio> => {
    const response = await api.get<Portfolio>(`/portfolios/${id}`);
    return response.data;
  },

  createPortfolio: async (formData: FormData): Promise<Portfolio> => {
    const response = await api.post<Portfolio>('/portfolios', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updatePortfolio: async (id: number, formData: FormData): Promise<Portfolio> => {
    const response = await api.put<Portfolio>(`/portfolios/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deletePortfolio: async (id: number): Promise<void> => {
    await api.delete(`/portfolios/${id}`);
  },

  searchPortfolios: async (query: string, page = 0, size = 6): Promise<PortfolioPage> => {
    const response = await api.get<PortfolioPage>('/portfolios/search', {
      params: { q: query, page, size }
    });
    return response.data;
  },

  getAiReview: async (id: number): Promise<AiReviewResponse> => {
    const response = await api.get<AiReviewResponse>(`/portfolios/${id}/ai-review`);
    return response.data;
  }
};
