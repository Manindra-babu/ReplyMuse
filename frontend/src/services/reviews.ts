import { request } from './api';
import {
  Review,
  ReviewWithDrafts,
  ReplyDraft,
  PaginatedHistory,
  UsageQuota,
} from '../types';

export interface CreateReviewParams {
  review_text: string;
  reviewer_name?: string;
  star_rating?: number;
  response_language?: string;
}

export interface HistoryQueryParams {
  search?: string;
  rating?: number;
  sentiment?: string;
  status?: string;
  sort?: 'newest' | 'oldest';
  page?: number;
  page_size?: number;
}

export const reviewsApi = {
  async createReview(data: CreateReviewParams): Promise<ReviewWithDrafts> {
    return request<ReviewWithDrafts>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getReview(id: string): Promise<ReviewWithDrafts> {
    return request<ReviewWithDrafts>(`/reviews/${id}`);
  },

  async regenerateDraft(
    reviewId: string,
    languageOverride?: string
  ): Promise<ReviewWithDrafts> {
    return request<ReviewWithDrafts>(`/reviews/${reviewId}/drafts`, {
      method: 'POST',
      body: JSON.stringify({ language_override: languageOverride }),
    });
  },

  async updateDraft(
    draftId: string,
    data: { edited_reply?: string; status?: string }
  ): Promise<ReplyDraft> {
    return request<ReplyDraft>(`/drafts/${draftId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async getHistory(params: HistoryQueryParams = {}): Promise<PaginatedHistory> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.rating) query.append('rating', params.rating.toString());
    if (params.sentiment) query.append('sentiment', params.sentiment);
    if (params.status) query.append('status', params.status);
    if (params.sort) query.append('sort', params.sort);
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());

    const qs = query.toString();
    return request<PaginatedHistory>(`/history${qs ? `?${qs}` : ''}`);
  },

  async getUsage(): Promise<UsageQuota> {
    return request<UsageQuota>('/usage');
  },
};
