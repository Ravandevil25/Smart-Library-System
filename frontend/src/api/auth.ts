import apiClient from './client';
import type { AuthResponse, User } from '../types';

export const authApi = {
  register: async (userData: {
    name: string;
    rollNo: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  login: async (rollNo: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', { rollNo, password });
    return response.data;
  },
  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  return JSON.parse(userStr);
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setStoredAuth = (token: string, user: User): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearStoredAuth = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

