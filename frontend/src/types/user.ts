export interface UserResponse {
  id: number;
  username: string;
  fullName: string;
  email: string;
  profilePicture: string | null;
  role: string;
  createdAt: string;
}

export interface UserProfileResponse extends UserResponse {
  emailVerified: boolean;
  // Stats
  portfolioCount: number;
  feedbackCount: number;
}
