import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

interface HistoryFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  rating?: number;
  onRatingChange: (val?: number) => void;
  sentiment: string;
  onSentimentChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  sort: 'newest' | 'oldest';
  onSortChange: (val: 'newest' | 'oldest') => void;
  onReset: () => void;
}

export const HistoryFilterBar: React.FC<HistoryFilterBarProps> = ({
  search,
  onSearchChange,
  rating,
  onRatingChange,
  sentiment,
  onSentimentChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  onReset,
}) => {
  return (
    <div className="bg-white border border-[#E5DFD3] rounded-3xl p-5 sm:p-6 space-y-3 shadow-soft">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#7A7468] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search review text or reviewer name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-[#E5DFD3] rounded-xl pl-10 pr-3 py-2 text-xs text-[#2B2B2B] placeholder:text-[#A1A59C] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]/25 focus:border-[#1F7A5C] transition-all font-sans"
          />
        </div>

        {/* Sort Select */}
        <div className="w-full sm:w-auto">
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as 'newest' | 'oldest')}
            className="w-full bg-[#FAF8F5] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs text-[#2B2B2B] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]/25 focus:border-[#1F7A5C] font-sans"
            aria-label="Sort order"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E5DFD3] text-xs">
        <span className="text-[#7A7468] font-medium flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </span>

        {/* Star Rating Filter */}
        <select
          value={rating || ''}
          onChange={(e) => onRatingChange(e.target.value ? Number(e.target.value) : undefined)}
          className="bg-[#FAF8F5] border border-[#E5DFD3] rounded-lg px-2.5 py-1 text-xs text-[#2B2B2B] focus:border-[#1F7A5C] focus:outline-none font-sans"
          aria-label="Filter by star rating"
        >
          <option value="">All Ratings</option>
          <option value="5">★★★★★ (5 stars)</option>
          <option value="4">★★★★☆ (4 stars)</option>
          <option value="3">★★★☆☆ (3 stars)</option>
          <option value="2">★★☆☆☆ (2 stars)</option>
          <option value="1">★☆☆☆☆ (1 star)</option>
        </select>

        {/* Sentiment Filter */}
        <select
          value={sentiment}
          onChange={(e) => onSentimentChange(e.target.value)}
          className="bg-[#FAF8F5] border border-[#E5DFD3] rounded-lg px-2.5 py-1 text-xs text-[#2B2B2B] focus:border-[#1F7A5C] focus:outline-none font-sans"
          aria-label="Filter by sentiment"
        >
          <option value="">All Sentiments</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
          <option value="sensitive">Sensitive</option>
        </select>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="bg-[#FAF8F5] border border-[#E5DFD3] rounded-lg px-2.5 py-1 text-xs text-[#2B2B2B] focus:border-[#1F7A5C] focus:outline-none font-sans"
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="edited">Edited</option>
          <option value="copied">Copied</option>
          <option value="published">Published</option>
        </select>

        {/* Reset Filters button */}
        {(search || rating || sentiment || status || sort !== 'newest') && (
          <button
            onClick={onReset}
            className="ml-auto inline-flex items-center gap-1 text-[11px] text-[#7A7468] hover:text-[#1F7A5C] underline font-sans"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
