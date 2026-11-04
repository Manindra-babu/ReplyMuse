import React from 'react';
import { GoogleIcon } from './GoogleIcon';
import { StarRating } from './StarRating';

export interface ReviewCardProps {
  reviewerName: string;
  rating?: number | null;
  reviewText: string;
  date?: string;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  reviewerName,
  rating = 5,
  reviewText,
  date,
  badges,
  actions,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl p-5 sm:p-6 border border-[#E5DFD3] shadow-[0_4px_20px_-2px_rgba(43,43,43,0.06),0_2px_6px_-1px_rgba(43,43,43,0.04)] transition-all duration-150 hover:shadow-[0_8px_24px_-4px_rgba(43,43,43,0.08)] ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#F7F3E8] border border-[#E5DFD3] flex items-center justify-center shrink-0 shadow-2xs">
            <GoogleIcon size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-sans font-semibold text-sm text-[#2B2B2B]">
                {reviewerName || 'Google Reviewer'}
              </span>
              {badges}
            </div>
            {date && <span className="text-[11px] text-[#7A7468] font-sans">{date}</span>}
          </div>
        </div>

        {rating !== undefined && rating !== null && (
          <div className="shrink-0 pt-0.5">
            <StarRating rating={rating} size="sm" />
          </div>
        )}
      </div>

      <p className="text-sm font-sans leading-relaxed text-[#2B2B2B] whitespace-pre-line">
        "{reviewText}"
      </p>

      {actions && (
        <div className="mt-4 pt-3 border-t border-[#E5DFD3] flex items-center justify-end gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};
