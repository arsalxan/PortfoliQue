import { render, screen, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { useEffect } from 'react';
import { AiReviewProvider, useAiReview } from './AiReviewContext';
import { aiReviewService } from '../services/aiReviewService';

// Mock the API wrapper
vi.mock('../services/aiReviewService', () => ({
  aiReviewService: {
    getReviewStatus: vi.fn(),
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
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('restores active review from localStorage on mount', () => {
    const savedReview = {
      id: 77,
      portfolioId: 42,
      portfolioUrl: 'https://saved.com',
      version: 1,
      status: 'COMPLETED' as const,
      createdAt: '2026-06-03T12:00:00Z',
    };
    localStorage.setItem('activeAiReview', JSON.stringify(savedReview));

    let extractedContext: any = null;
    render(
      <AiReviewProvider>
        <TestComponent onMount={(val) => { extractedContext = val; }} />
      </AiReviewProvider>
    );

    expect(extractedContext.activeReview).toEqual(savedReview);
  });

  test('sets active review and caches in localStorage when trigger is hit', () => {
    let extractedContext: any = null;
    render(
      <AiReviewProvider>
        <TestComponent onMount={(val) => { extractedContext = val; }} />
      </AiReviewProvider>
    );

    const newReview = {
      id: 88,
      portfolioId: 42,
      portfolioUrl: 'https://new.com',
      version: 1,
      status: 'IN_PROGRESS' as const,
      createdAt: '2026-06-03T12:00:00Z',
    };

    act(() => {
      extractedContext.setActiveReview(newReview);
    });

    expect(extractedContext.activeReview).toEqual(newReview);
    expect(JSON.parse(localStorage.getItem('activeAiReview') || '')).toEqual(newReview);
  });

  test('polls status every 10 seconds if active review status is IN_PROGRESS', async () => {
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
    render(
      <AiReviewProvider>
        <TestComponent onMount={(val) => { extractedContext = val; }} />
      </AiReviewProvider>
    );

    act(() => {
      extractedContext.setActiveReview(initialReview);
    });

    // Fast-forward 10 seconds
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    expect(aiReviewService.getReviewStatus).toHaveBeenCalledWith(88);
    expect(extractedContext.activeReview.status).toBe('COMPLETED');
  });
});
