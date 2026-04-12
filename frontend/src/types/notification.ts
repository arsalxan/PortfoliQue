export interface Notification {
  id: number;
  senderUsername: string;
  senderFullName: string;
  portfolioId: number;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPage {
  content: Notification[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
