import type { UserRole } from '../constants/roles.constant';

export interface User {
  id: string;
  userName: string;
  role: UserRole | string;
}

export interface LoginCredentials {
  userName: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
