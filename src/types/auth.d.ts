export interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  isAdmin: boolean;
  createdAt: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface LoginData {
  usernameOrEmail: string;
  password: string;
}

export interface UpdateUserData {
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

export interface PasswordResetRequest {
  id: number;
  userId: number;
  username: string;
  email: string;
  requestedAt: number;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  approvedBy?: number;
  approvedAt?: number;
  completedAt?: number;
}