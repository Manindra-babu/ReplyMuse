export interface User {
  id: string;
  email: string;
  is_active: boolean;
  is_admin?: boolean;
  email_verified: boolean;
  created_at: string;
  has_business_profile: boolean;
  has_voice_profile: boolean;
}

export interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  category: string;
  description: string;
  contact_email?: string | null;
  contact_phone?: string | null;
  default_language: string;
  preferred_greeting?: string | null;
  preferred_sign_off?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VoiceProfile {
  id: string;
  business_id: string;
  tone: string;
  formality: string;
  preferred_length: string;
  greeting?: string | null;
  sign_off?: string | null;
  preferred_phrases: string[];
  avoided_phrases: string[];
  first_person_style: string;
  language_preference: string;
  created_at: string;
  updated_at: string;
}

export interface VoiceExample {
  id: string;
  business_id: string;
  example_text: string;
  created_at: string;
}

export interface SafetyFlags {
  is_sensitive?: boolean;
  allegation_detected?: boolean;
  private_channel_offered?: boolean;
  summary?: string | null;
}

export interface ReplyDraft {
  id: string;
  review_id: string;
  model_provider: string;
  model_name: string;
  original_draft: string;
  edited_reply: string;
  status: 'draft' | 'edited' | 'copied' | 'published';
  safety_flags: SafetyFlags;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  business_id: string;
  review_text: string;
  reviewer_name?: string | null;
  star_rating?: number | null;
  response_language?: string | null;
  detected_sentiment: 'positive' | 'neutral' | 'negative' | 'sensitive';
  created_at: string;
  updated_at: string;
}

export interface ReviewWithDrafts {
  review: Review;
  active_draft: ReplyDraft;
  draft_history: ReplyDraft[];
}

export interface HistoryItem extends Review {
  active_draft?: ReplyDraft | null;
  total_drafts_count: number;
}

export interface PaginatedHistory {
  items: HistoryItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface UsageQuota {
  plan: string;
  monthly_limit: number;
  bonus_credits?: number;
  total_allowance?: number;
  used: number;
  remaining: number;
  period_start: string;
  reset_date: string;
  is_quota_exhausted: boolean;
}

export interface AdminMetrics {
  total_users: number;
  active_users: number;
  total_businesses: number;
  total_generations_month: number;
  total_generations_all_time: number;
  plan_distribution: Record<string, number>;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  business_name?: string | null;
  category?: string | null;
  plan: string;
  monthly_limit: number;
  bonus_credits: number;
  used_month: number;
  remaining: number;
}

export interface AdminUserListResponse {
  items: AdminUserListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
