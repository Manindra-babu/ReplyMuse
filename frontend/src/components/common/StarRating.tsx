import React from 'react';
import { Star } from 'lucide-react';

export interface StarRatingProps {
  rating?: number | null;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  onChange,
  size = 'md',
  interactive = false,
}) => {
  const currentRating = rating || 0;

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  return (
    <div className="flex items-center gap-1" role={interactive ? 'radiogroup' : 'img'} aria-label={`Rating: ${currentRating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= currentRating;
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(star)}
            className={`transition-colors rounded focus:outline-none focus:ring-1 focus:ring-[#F5A623] ${
              interactive ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'
            }`}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={`${starSizes} ${
                isFilled
                  ? 'fill-[#F5A623] text-[#F5A623]'
                  : 'fill-transparent text-[#D5CDBD] hover:text-[#F5A623]'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
