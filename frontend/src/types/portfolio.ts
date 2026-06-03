export interface Portfolio {
  id: number;
  url: string;
  description: string | null;
  screenshot: string | null;
  gitRepo: string | null;
  userId: number;
  username: string;
  fullName: string;
  feedbackCount: number;
  createdAt: string;
}

export interface PortfolioRequest {
  url: string;
  title: string;
  description?: string;
  gitRepo?: string;
  category?: string;
}

export interface PortfolioPage {
  content: Portfolio[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface AiReviewResponse {
  portfolioId: number;
  portfolioUrl: string;
  pageTitle: string;
  linkCount: number;
  imageCount: number;
  review: string;
}

export interface AiReviewStatus {
  id: number;
  portfolioId: number;
  portfolioUrl: string;
  version: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export interface AiReviewFull {
  id: number;
  portfolioId: number;
  version: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  performanceScore: number | null;
  accessibilityScore: number | null;
  seoScore: number | null;
  jsoupReviewText: string | null;
  lighthouseReviewText: string | null;
  finalReviewText: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface AiReviewHistory {
  id: number;
  version: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  performanceScore: number | null;
  accessibilityScore: number | null;
  seoScore: number | null;
  createdAt: string;
}

export interface AiReviewHistoryPage {
  content: AiReviewHistory[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
