import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AiReviewStatus } from '../types/portfolio';
import { aiReviewService } from '../services/aiReviewService';

interface AiReviewContextType {
  activeReview: AiReviewStatus | null;
  setActiveReview: (review: AiReviewStatus | null) => void;
  checkLatestReviewStatus: (reviewId: number) => Promise<void>;
  refreshActiveReview: () => Promise<void>;
}

const AiReviewContext = createContext<AiReviewContextType | undefined>(undefined);

export function AiReviewProvider({ children }: { children: ReactNode }) {
  const [activeReview, setActiveReviewState] = useState<AiReviewStatus | null>(() => {
    const saved = localStorage.getItem('activeAiReview');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const setActiveReview = useCallback((review: AiReviewStatus | null) => {
    setActiveReviewState(review);
    if (review) {
      localStorage.setItem('activeAiReview', JSON.stringify(review));
    } else {
      localStorage.removeItem('activeAiReview');
    }
  }, []);

  const checkLatestReviewStatus = useCallback(async (reviewId: number) => {
    try {
      const updated = await aiReviewService.getReviewStatus(reviewId);
      setActiveReview(updated);
    } catch (err) {
      console.error('Failed to get review status:', err);
    }
  }, [setActiveReview]);

  const refreshActiveReview = useCallback(async () => {
    try {
      const latest = await aiReviewService.getActiveReview();
      setActiveReview(latest);
    } catch (err) {
      console.error('Failed to refresh active review:', err);
    }
  }, [setActiveReview]);

  // Polling hook: runs every 10 seconds if active review is IN_PROGRESS
  useEffect(() => {
    if (!activeReview || activeReview.status !== 'IN_PROGRESS') return;

    const interval = setInterval(async () => {
      try {
        const updated = await aiReviewService.getReviewStatus(activeReview.id);
        setActiveReview(updated);
        if (updated.status !== 'IN_PROGRESS') {
          clearInterval(interval);
        }
      } catch (err: any) {
        // If status check yields 404 (indicating the portfolio/audit was deleted), refresh
        if (err.response?.status === 404) {
          clearInterval(interval);
          refreshActiveReview();
        } else {
          console.error('Error polling AI Review status:', err);
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [activeReview, setActiveReview, refreshActiveReview]);

  return (
    <AiReviewContext.Provider value={{ activeReview, setActiveReview, checkLatestReviewStatus, refreshActiveReview }}>
      {children}
    </AiReviewContext.Provider>
  );
}

export function useAiReview(): AiReviewContextType {
  const context = useContext(AiReviewContext);
  if (context === undefined) {
    throw new Error('useAiReview must be used within an AiReviewProvider');
  }
  return context;
}
