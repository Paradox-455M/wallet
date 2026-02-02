import apiClient from './client';
import type { AuthUser } from '../types/auth';

export const getCurrentUser = async (): Promise<AuthUser> => {
  const { data } = await apiClient.get<{ user: AuthUser }>('/api/auth/me');
  return data.user;
};

export const updateProfile = async (fullName: string) => {
  const { data } = await apiClient.put('/api/auth/profile', { fullName });
  return data;
};

export const loginUser = async (email: string, password: string): Promise<{ token: string; user: AuthUser }> => {
  const { data } = await apiClient.post<{ token: string; user: AuthUser }>('/api/auth/login', { email, password });
  return data;
};

export const registerUser = async (
  email: string,
  password: string,
  fullName: string
): Promise<{ token: string; user: AuthUser }> => {
  const { data } = await apiClient.post<{ token: string; user: AuthUser }>('/api/auth/register', {
    email,
    password,
    fullName,
  });
  return data;
};
