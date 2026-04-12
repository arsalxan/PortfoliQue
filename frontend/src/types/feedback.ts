export interface Feedback {
  id: number;
  design: string | null;
  responsiveness: string | null;
  content: string | null;
  uxFlow: string | null;
  accessibility: string | null;
  technicalPerformance: string | null;
  additional: string | null;
  userId: number;
  username: string;
  fullName: string;
  portfolioId: number;
  portfolioOwnerUsername: string;
  portfolioOwnerFullName: string;
  createdAt: string;
}

export interface FeedbackRequest {
  design?: string;
  responsiveness?: string;
  content?: string;
  uxFlow?: string;
  accessibility?: string;
  technicalPerformance?: string;
  additional?: string;
}

export interface FeedbackPage {
  content: Feedback[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
