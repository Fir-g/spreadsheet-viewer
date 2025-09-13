import { apiClient } from './base/ApiClient';
import { STORAGE_KEYS } from '@/config/constants';
import type { User } from '@/types';

interface LoginCredentials {
  username: string;
  password: string;
}

interface SignupData {
  username: string;
  name: string;
  password: string;
  role: string;
}

interface AuthResponse {
  access_token: string;
  user?: User;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    if (response.access_token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.access_token);
    }
    
    return response;
  }

  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/signup', data);
    
    if (response.access_token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.access_token);
    }
    
    return response;
  }

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    window.location.href = '/';
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }
}

export const authService = new AuthService();