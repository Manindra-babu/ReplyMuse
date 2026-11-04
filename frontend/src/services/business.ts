import { request } from './api';
import { BusinessProfile } from '../types';

export const businessApi = {
  async getProfile(): Promise<BusinessProfile> {
    return request<BusinessProfile>('/business/profile');
  },

  async updateProfile(data: Partial<BusinessProfile>): Promise<BusinessProfile> {
    return request<BusinessProfile>('/business/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
