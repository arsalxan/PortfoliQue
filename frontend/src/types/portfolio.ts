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
  description?: string;
  gitRepo?: string;
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
