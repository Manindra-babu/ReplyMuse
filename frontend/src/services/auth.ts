import { request } from './api';
import { User } from '../types';

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const authApi = {
  async register(email: string, password: string): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.access_token) {
      localStorage.setItem('replymuse_token', res.access_token);
    }
    return res;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.access_token) {
      localStorage.setItem('replymuse_token', res.access_token);
    }
    return res;
  },

  async loginWithGoogle(credential: string): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
    if (res.access_token) {
      localStorage.setItem('replymuse_token', res.access_token);
    }
    return res;
  },

  async logout(): Promise<void> {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('replymuse_token');
    }
  },

  async getMe(): Promise<User> {
    return request<User>('/auth/me');
  },

  async forgotPassword(email: string): Promise<{ message: string; dev_reset_token?: string }> {
    return request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, new_password: string): Promise<{ message: string }> {
    return request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password }),
    });
  },

  async changePassword(current_password: string, new_password: string): Promise<{ message: string }> {
    return request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password }),
    });
  },

  async deleteAccount(): Promise<{ message: string }> {
    try {
      return await request('/account', { method: 'DELETE' });
    } finally {
      localStorage.removeItem('replymuse_token');
    }
  },
};
