import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AiReviewStatus } from '../types/portfolio';
import { aiReviewService } from '../services/aiReviewService';
import { useAuth } from './AuthContext';

interface AiReviewContextType {
  latestReview: AiReviewStatus | null;
  setLatestReview: (review: AiReviewStatus | null) => void;
  checkLatestReviewStatus: (reviewId: number) => Promise<void>;
  refreshLatestReview: () => Promise<void>;
}

const AiReviewContext = createContext<AiReviewContextType | undefined>(undefined);

export function AiReviewProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [latestReview, setLatestReview] = useState<AiReviewStatus | null>(null);

  const checkLatestReviewStatus = useCallback(async (reviewId: number) => {
    try {
      const updated = await aiReviewService.getReviewStatus(reviewId);
      setLatestReview(updated);
    } catch (err) {
      console.error('Failed to get review status:', err);
    }
  }, []);

  const refreshLatestReview = useCallback(async () => {
    try {
      const latest = await aiReviewService.getLatestReview();
      setLatestReview(latest);
    } catch (err) {
      console.error('Failed to refresh latest review:', err);
    }
  }, []);

  // Fetch the latest active audit status upon user session login/mount
  useEffect(() => {
    if (isAuthenticated) {
      refreshLatestReview();
    } else {
      setLatestReview(null);
    }
  }, [isAuthenticated, refreshLatestReview]);

  // Polling hook: runs every 10 seconds if active review is IN_PROGRESS
  useEffect(() => {
    if (!latestReview || latestReview.status !== 'IN_PROGRESS') return;

    const interval = setInterval(async () => {
      try {
        const updated = await aiReviewService.getReviewStatus(latestReview.id);
        setLatestReview(updated);
        if (updated.status !== 'IN_PROGRESS') {
          clearInterval(interval);
        }
      } catch (err: any) {
        // If status check yields 404 (indicating the portfolio/audit was deleted), refresh
        if (err.response?.status === 404) {
          clearInterval(interval);
          refreshLatestReview();
        } else {
          console.error('Error polling AI Review status:', err);
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [latestReview, refreshLatestReview]);

  return (
    <AiReviewContext.Provider value={{ latestReview, setLatestReview, checkLatestReviewStatus, refreshLatestReview }}>
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

