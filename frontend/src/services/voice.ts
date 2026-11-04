import { request } from './api';
import { VoiceProfile, VoiceExample } from '../types';

export const voiceApi = {
  async getProfile(): Promise<VoiceProfile> {
    return request<VoiceProfile>('/voice/profile');
  },

  async updateProfile(data: Partial<VoiceProfile>): Promise<VoiceProfile> {
    return request<VoiceProfile>('/voice/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getExamples(): Promise<VoiceExample[]> {
    return request<VoiceExample[]>('/voice/examples');
  },

  async saveExamples(examples: string[]): Promise<VoiceExample[]> {
    return request<VoiceExample[]>('/voice/examples', {
      method: 'POST',
      body: JSON.stringify({ examples }),
    });
  },

  async deleteExample(id: string): Promise<void> {
    return request(`/voice/examples/${id}`, { method: 'DELETE' });
  },

  async analyzeVoice(examples: string[]): Promise<VoiceProfile> {
    return request<VoiceProfile>('/voice/analyze', {
      method: 'POST',
      body: JSON.stringify({ examples }),
    });
  },
};
