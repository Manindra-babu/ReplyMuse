import React, { useState } from 'react';
import {
  Copy,
  Check,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { HistoryItem } from '../../types';
import { StarRating } from '../common/StarRating';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { GoogleIcon } from '../common/GoogleIcon';
import { SparkleIcon } from '../common/SparkleIcon';
import { useClipboard } from '../../hooks/useClipboard';
import { reviewsApi } from '../../services/reviews';
import { useToast } from '../../context/ToastContext';

interface ReviewHistoryCardProps {
  item: HistoryItem;
  onRefresh?: () => void;
}

export const ReviewHistoryCard: React.FC<ReviewHistoryCardProps> = ({
  item,
  onRefresh,
}) => {
  const { copied, copy } = useClipboard();
  const { success } = useToast();
  const [expanded, setExpanded] = useState(false);

  const activeDraft = item.active_draft;

  const handleCopy = async () => {
    if (!activeDraft) return;
    await copy(activeDraft.edited_reply, 'Reply copied to clipboard');
    try {
      await reviewsApi.updateDraft(activeDraft.id, { status: 'copied' });
      if (onRefresh) onRefresh();
    } catch {
      // Non-fatal
    }
  };

  const sentimentVariant = {
    positive: 'success' as const,
    neutral: 'muted' as const,
    negative: 'error' as const,
    sensitive: 'error' as const,
  }[item.detected_sentiment] || 'muted';

  return (
    <div className="bg-white border border-[#E5DFD3] rounded-3xl shadow-soft overflow-hidden transition-all duration-150 hover:shadow-soft-lg hover:border-[#1F7A5C]">
      {/* Review Header */}
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#F7F3E8] border border-[#E5DFD3] flex items-center justify-center shrink-0">
              <GoogleIcon size={13} />
            </div>
            {item.star_rating && (
              <StarRating rating={item.star_rating} size="sm" />
            )}
            <span className="font-semibold text-xs text-[#2B2B2B]">
              {item.reviewer_name || 'Google Reviewer'}
            </span>
            <Badge variant={sentimentVariant} size="sm">
              {item.detected_sentiment}
            </Badge>
            {activeDraft && (
              <Badge variant="default" size="sm">
                Status: {activeDraft.status}
              </Badge>
            )}
          </div>

          <p className="text-sm font-sans text-[#2B2B2B] leading-relaxed pt-1 pl-8">
            "{item.review_text}"
          </p>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto text-[11px] text-[#7A7468] shrink-0 gap-1.5 font-sans">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(item.created_at).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          {item.total_drafts_count > 1 && (
            <span className="flex items-center gap-1 text-[#1F7A5C] font-semibold">
              <Layers className="w-3 h-3" />
              {item.total_drafts_count} variations
            </span>
          )}
        </div>
      </div>

      {/* Active Draft Reply Drawer */}
      {activeDraft && (
        <div className="bg-[#DCEBE3]/60 border-t border-[#1F7A5C]/20 border-l-4 border-l-[#1F7A5C] px-5 py-4 ml-4 sm:ml-8 rounded-b-3xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1F7A5C] flex items-center gap-1.5">
              <SparkleIcon size={12} className="text-[#1F7A5C]" />
              <span>Saved Studio Reply</span>
            </span>

            <Button
              variant={copied ? 'outline' : 'ghost'}
              size="sm"
              icon={copied ? <Check className="w-3.5 h-3.5 text-[#1F7A5C]" /> : <Copy className="w-3.5 h-3.5" />}
              onClick={handleCopy}
              className={`text-xs h-7 px-2.5 ${copied ? 'border-[#1F7A5C] text-[#1F7A5C]' : ''}`}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>

          <p className={`text-xs text-[#2B2B2B] font-sans leading-relaxed whitespace-pre-line ${
            expanded ? '' : 'line-clamp-3'
          }`}>
            {activeDraft.edited_reply}
          </p>

          {activeDraft.edited_reply.length > 200 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 text-[11px] font-medium text-[#1F7A5C] hover:underline flex items-center gap-0.5"
            >
              <span>{expanded ? 'Show less' : 'Read full reply'}</span>
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
