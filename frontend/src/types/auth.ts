export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  profilePicture: string | null;
  role: 'USER' | 'ADMIN';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  fullName: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  token: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  profilePicture: string | null;
  message: string;
}
