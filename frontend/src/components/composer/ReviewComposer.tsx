import React, { useState } from 'react';
import {
  MessageSquare,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { reviewsApi } from '../../services/reviews';
import { voiceApi } from '../../services/voice';
import { ReviewWithDrafts, ReplyDraft, BusinessProfile, VoiceProfile } from '../../types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Select } from '../common/Select';
import { StarRating } from '../common/StarRating';
import { GeneratedReplyCard } from './GeneratedReplyCard';
import { ReviewCard } from '../common/ReviewCard';
import { ReviewReplyConnector } from '../common/ReviewReplyConnector';
import { SparkleIcon } from '../common/SparkleIcon';
import { useToast } from '../../context/ToastContext';

interface ReviewComposerProps {
  business?: BusinessProfile | null;
  voiceProfile?: VoiceProfile | null;
  onSuccess?: () => void;
}

export const ReviewComposer: React.FC<ReviewComposerProps> = ({
  voiceProfile: initialVoiceProfile,
  onSuccess,
}) => {
  const { error, success } = useToast();

  // Form State
  const [reviewText, setReviewText] = useState('');
  const [starRating, setStarRating] = useState<number | undefined>(undefined);
  const [reviewerName, setReviewerName] = useState('');
  const [responseLanguage, setResponseLanguage] = useState('en');

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [currentResult, setCurrentResult] = useState<ReviewWithDrafts | null>(null);
  const [activeDraftIdx, setActiveDraftIdx] = useState<number>(0);

  // Load Voice Profile (fallback to query if not provided via props)
  const { data: queriedVoice } = useQuery({
    queryKey: ['voiceProfile'],
    queryFn: () => voiceApi.getProfile().catch(() => null),
    enabled: !initialVoiceProfile,
  });

  const activeVoice = initialVoiceProfile || queriedVoice;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      error('Please enter the customer review text.');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await reviewsApi.createReview({
        review_text: reviewText.trim(),
        star_rating: starRating,
        reviewer_name: reviewerName.trim() || undefined,
        response_language: responseLanguage,
      });

      setCurrentResult(result);
      setActiveDraftIdx(0);
      success('Crafted personalized reply in your brand voice!');
      onSuccess?.();
    } catch (err: any) {
      error(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!currentResult) return;
    setIsRegenerating(true);
    try {
      const updated = await reviewsApi.regenerateDraft(currentResult.review.id);
      setCurrentResult(updated);
      setActiveDraftIdx(0);
      success('Created new response variation!');
      onSuccess?.();
    } catch (err: any) {
      error(err.message || 'Regeneration failed.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDraftUpdated = (updated: ReplyDraft) => {
    if (!currentResult) return;
    const newHistory = currentResult.draft_history.map((d: ReplyDraft) =>
      d.id === updated.id ? updated : d
    );
    setCurrentResult({
      ...currentResult,
      draft_history: newHistory,
      active_draft: currentResult.active_draft.id === updated.id ? updated : currentResult.active_draft,
    });
  };

  return (
    <div className="space-y-8">
      {/* Voice Status Banner */}
      {activeVoice && (
        <div className="bg-white border border-[#E5DFD3] rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-soft">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#1F7A5C]" />
            <span className="text-[#2B2B2B] font-medium font-sans">Active Studio Voice:</span>
            <span className="font-semibold text-[#1F7A5C] bg-[#DCEBE3] px-2.5 py-0.5 rounded-full border border-[#BEE0D0]">
              {activeVoice.tone}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[#7A7468] text-xs font-sans">
            <span>Perspective: <strong className="text-[#2B2B2B] uppercase font-semibold">{activeVoice.first_person_style}</strong></span>
            <span>•</span>
            <span>Formality: <strong className="text-[#2B2B2B] font-semibold">{activeVoice.formality}</strong></span>
          </div>
        </div>
      )}

      {/* Main Review Input Form */}
      <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 sm:p-8 shadow-soft">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-base font-serif font-bold text-[#2B2B2B] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#1F7A5C]" />
              <span>Customer Review Input</span>
            </h2>
            <span className="text-xs text-[#7A7468]">
              Paste the customer review from Google Business Profile
            </span>
          </div>

          <Textarea
            placeholder="e.g. 'Loved the cardamom pistachio croissants and filter coffee! Service was a bit slow during the morning rush but staff was very kind. Will definitely visit again!'"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            minRows={4}
            maxLength={3000}
            showCount
            aria-label="Customer review text"
            required
          />

          {/* Optional Review Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-3 border-t border-[#E5DFD3]">
            {/* Star Rating */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B2B2B] mb-1.5 font-sans">
                Star Rating (Optional)
              </label>
              <div className="h-9 flex items-center">
                <StarRating
                  rating={starRating}
                  onChange={(r) => setStarRating(starRating === r ? undefined : r)}
                  interactive
                  size="md"
                />
                {starRating && (
                  <button
                    type="button"
                    onClick={() => setStarRating(undefined)}
                    className="ml-2 text-[11px] text-[#7A7468] hover:text-[#2B2B2B] underline"
                  >
                    clear
                  </button>
                )}
              </div>
            </div>

            {/* Reviewer Name */}
            <div>
              <Input
                label="Reviewer Name (Optional)"
                placeholder="e.g. Priya Sharma"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
              />
            </div>

            {/* Language Selection */}
            <div>
              <Select
                label="Response Language"
                value={responseLanguage}
                onChange={(e) => setResponseLanguage(e.target.value)}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'hi', label: 'Hindi (हिंदी)' },
                  { value: 'hinglish', label: 'Hinglish' },
                  { value: 'auto', label: 'Match Reviewer Language' },
                ]}
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between flex-wrap gap-4">
            <p className="text-xs text-[#7A7468] flex items-center gap-1.5">
              <SparkleIcon size={14} className="text-[#EE6A4B]" />
              <span>Learns from your established voice profile & policies</span>
            </p>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isGenerating}
              icon={<SparkleIcon size={16} className="text-white" />}
              className="w-full sm:w-auto font-semibold shadow-xs"
            >
              Generate Reply
            </Button>
          </div>
        </form>
      </div>

      {/* Generated Response Workspace */}
      {currentResult && (
        <section aria-label="Generated reply workspace" className="space-y-3">
          {/* 1. Review Card with Google 'G' icon and amber rating */}
          <ReviewCard
            reviewerName={currentResult.review.reviewer_name || 'Google Reviewer'}
            rating={currentResult.review.star_rating}
            date="Review submitted"
            reviewText={currentResult.review.review_text}
          />

          {/* 2. Review -> Reply Curved Coral Arrow Link */}
          <ReviewReplyConnector label="AI reply crafted in your voice" />

          {/* 3. AI Reply Card */}
          <GeneratedReplyCard
            drafts={currentResult.draft_history}
            activeDraftIndex={activeDraftIdx}
            onSelectDraftIndex={(idx) => setActiveDraftIdx(idx)}
            onRegenerate={handleRegenerate}
            isRegenerating={isRegenerating}
            sentiment={currentResult.review.detected_sentiment}
            onDraftUpdated={handleDraftUpdated}
          />
        </section>
      )}
    </div>
  );
};
