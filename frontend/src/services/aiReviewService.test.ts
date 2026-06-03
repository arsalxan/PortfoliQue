import { describe, test, expect, vi, beforeEach } from 'vitest';
import { aiReviewService } from './aiReviewService';
import api from './api';

// Mock the base api axios instance
vi.mock('./api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('aiReviewService API Wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('triggerReview calls correct POST endpoint and returns payload', async () => {
    const mockResponse = { data: { id: 1, status: 'IN_PROGRESS', version: 1 } };
    vi.mocked(api.post).mockResolvedValue(mockResponse);

    const result = await aiReviewService.triggerReview(42);

    expect(api.post).toHaveBeenCalledWith('/portfolios/42/ai-review/trigger');
    expect(result).toEqual(mockResponse.data);
  });

  test('getReviewStatus calls correct status GET endpoint', async () => {
    const mockResponse = { data: { id: 10, status: 'COMPLETED', version: 2 } };
    vi.mocked(api.get).mockResolvedValue(mockResponse);

    const result = await aiReviewService.getReviewStatus(10);

    expect(api.get).toHaveBeenCalledWith('/portfolios/ai-reviews/10/status');
    expect(result).toEqual(mockResponse.data);
  });

  test('getFullReview calls correct details GET endpoint', async () => {
    const mockResponse = { data: { id: 10, performanceScore: 90, accessibilityScore: 95 } };
    vi.mocked(api.get).mockResolvedValue(mockResponse);

    const result = await aiReviewService.getFullReview(10);

    expect(api.get).toHaveBeenCalledWith('/portfolios/ai-reviews/10');
    expect(result).toEqual(mockResponse.data);
  });

  test('getReviewHistory calls correct paginated history GET endpoint', async () => {
    const mockResponse = { data: { content: [], totalPages: 1 } };
    vi.mocked(api.get).mockResolvedValue(mockResponse);

    const result = await aiReviewService.getReviewHistory(42, 2, 5);

    expect(api.get).toHaveBeenCalledWith('/portfolios/42/ai-reviews/history', {
      params: { page: 2, size: 5 },
    });
    expect(result).toEqual(mockResponse.data);
  });
});
