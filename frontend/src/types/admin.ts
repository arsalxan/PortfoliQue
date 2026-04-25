import type { UserResponse } from './user';
import type { Portfolio } from './portfolio';
import type { Feedback } from './feedback';

export interface AdminDashboardResponse {
  totalUsers: number;
  totalPortfolios: number;
  totalFeedbacks: number;
}

export interface AdminUsersPage {
  content: UserResponse[];
  totalPages: number;
  totalElements: number;
}

export interface AdminPortfoliosPage {
  content: Portfolio[];
  totalPages: number;
  totalElements: number;
}

export interface AdminFeedbacksPage {
  content: Feedback[];
  totalPages: number;
  totalElements: number;
}
