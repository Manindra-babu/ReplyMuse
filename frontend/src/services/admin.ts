import { request } from './api';
import { AdminMetrics, AdminUserListResponse } from '../types';

export const adminApi = {
  async getMetrics(): Promise<AdminMetrics> {
    return request<AdminMetrics>('/admin/metrics');
  },

  async getUsers(params: {
    search?: string;
    plan?: string;
    page?: number;
    page_size?: number;
  } = {}): Promise<AdminUserListResponse> {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.plan && params.plan !== 'all') searchParams.append('plan', params.plan);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.page_size) searchParams.append('page_size', params.page_size.toString());

    const qs = searchParams.toString();
    return request<AdminUserListResponse>(`/admin/users${qs ? `?${qs}` : ''}`);
  },

  async grantCredits(
    userId: string,
    data: { bonus_credits: number; custom_monthly_limit?: number }
  ): Promise<any> {
    return request(`/admin/users/${userId}/credits`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePlan(userId: string, plan: string): Promise<any> {
    return request(`/admin/users/${userId}/plan`, {
      method: 'PUT',
      body: JSON.stringify({ plan }),
    });
  },

  async updateStatus(userId: string, isActive: boolean): Promise<any> {
    return request(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: isActive }),
    });
  },
};
