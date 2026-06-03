import { render, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { useEffect } from 'react';
import { AiReviewProvider, useAiReview } from './AiReviewContext';
import { aiReviewService } from '../services/aiReviewService';
import { useAuth } from './AuthContext';

// Mock the AuthContext
vi.mock('./AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock the API wrapper
vi.mock('../services/aiReviewService', () => ({
  aiReviewService: {
    getReviewStatus: vi.fn(),
    getLatestReview: vi.fn(),
  },
}));

// Helper component to extract context values during tests
function TestComponent({ onMount }: { onMount: (contextVal: any) => void }) {
  const context = useAiReview();
  useEffect(() => {
    onMount(context);
  }, [context, onMount]);
  return <div data-testid="test-val">Loaded</div>;
}

describe('AiReviewContext and Provider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 1, email: 'test@example.com', role: 'USER' },
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('fetches latest review on mount when authenticated', async () => {
    const mockReview = {
      id: 77,
      portfolioId: 42,
      portfolioUrl: 'https://saved.com',
      version: 1,
      status: 'COMPLETED' as const,
      createdAt: '2026-06-03T12:00:00Z',
    };
    vi.mocked(aiReviewService.getLatestReview).mockResolvedValue(mockReview);

    let extractedContext: any = null;
    await act(async () => {
      render(
        <AiReviewProvider>
          <TestComponent onMount={(val) => { extractedContext = val; }} />
        </AiReviewProvider>
      );
    });

    expect(aiReviewService.getLatestReview).toHaveBeenCalled();
    expect(extractedContext.latestReview).toEqual(mockReview);
  });

  test('sets latest review when trigger/setLatestReview is hit', async () => {
    vi.mocked(aiReviewService.getLatestReview).mockResolvedValue(null);

    let extractedContext: any = null;
    await act(async () => {
      render(
        <AiReviewProvider>
          <TestComponent onMount={(val) => { extractedContext = val; }} />
        </AiReviewProvider>
      );
    });

    const newReview = {
      id: 88,
      portfolioId: 42,
      portfolioUrl: 'https://new.com',
      version: 1,
      status: 'IN_PROGRESS' as const,
      createdAt: '2026-06-03T12:00:00Z',
    };

    act(() => {
      extractedContext.setLatestReview(newReview);
    });

    expect(extractedContext.latestReview).toEqual(newReview);
  });

  test('polls status every 10 seconds if latest review status is IN_PROGRESS', async () => {
    vi.mocked(aiReviewService.getLatestReview).mockResolvedValue(null);

    const initialReview = {
      id: 88,
      portfolioId: 42,
      portfolioUrl: 'https://new.com',
      version: 1,
      status: 'IN_PROGRESS' as const,
      createdAt: '2026-06-03T12:00:00Z',
    };

    const updatedReview = {
      ...initialReview,
      status: 'COMPLETED' as const,
    };

    vi.mocked(aiReviewService.getReviewStatus).mockResolvedValue(updatedReview);

    let extractedContext: any = null;
    await act(async () => {
      render(
        <AiReviewProvider>
          <TestComponent onMount={(val) => { extractedContext = val; }} />
        </AiReviewProvider>
      );
    });

    act(() => {
      extractedContext.setLatestReview(initialReview);
    });

    // Fast-forward 10 seconds
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    expect(aiReviewService.getReviewStatus).toHaveBeenCalledWith(88);
    expect(extractedContext.latestReview.status).toBe('COMPLETED');
  });
});
