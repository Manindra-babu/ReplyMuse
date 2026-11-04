import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, ChevronLeft, ChevronRight } from 'lucide-react';
import { reviewsApi } from '../services/reviews';
import { HistoryFilterBar } from '../components/history/HistoryFilterBar';
import { ReviewHistoryCard } from '../components/history/ReviewHistoryCard';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';

export const HistoryPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [rating, setRating] = useState<number | undefined>();
  const [sentiment, setSentiment] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['history', search, rating, sentiment, status, sort, page],
    queryFn: () =>
      reviewsApi.getHistory({
        search: search || undefined,
        rating,
        sentiment: sentiment || undefined,
        status: status || undefined,
        sort,
        page,
        page_size: 10,
      }),
  });

  const handleReset = () => {
    setSearch('');
    setRating(undefined);
    setSentiment('');
    setStatus('');
    setSort('newest');
    setPage(1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-[#E5DFD3] pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#2B2B2B] flex items-center gap-2">
            <History className="w-6 h-6 text-[#1F7A5C]" />
            <span>Review History</span>
          </h1>
          <p className="text-xs text-[#7A7468] mt-1 leading-relaxed">
            Search, inspect, and retrieve every drafted response and original customer review.
          </p>
        </div>

        {data && (
          <span className="text-xs text-[#7A7468] bg-white border border-[#E5DFD3] rounded-full px-3 py-1 shadow-2xs font-sans">
            Total records: <strong className="text-[#2B2B2B]">{data.total}</strong>
          </span>
        )}
      </div>

      {/* Filter and Search Bar */}
      <HistoryFilterBar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        rating={rating}
        onRatingChange={(r) => {
          setRating(r);
          setPage(1);
        }}
        sentiment={sentiment}
        onSentimentChange={(s) => {
          setSentiment(s);
          setPage(1);
        }}
        status={status}
        onStatusChange={(st) => {
          setStatus(st);
          setPage(1);
        }}
        sort={sort}
        onSortChange={(so) => {
          setSort(so);
          setPage(1);
        }}
        onReset={handleReset}
      />

      {/* List of Reviews */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-[#7A7468]">
          Loading review history...
        </div>
      ) : data && data.items.length > 0 ? (
        <div className="space-y-4">
          {data.items.map((item) => (
            <ReviewHistoryCard key={item.id} item={item} onRefresh={refetch} />
          ))}

          {/* Pagination Controls */}
          {data.total_pages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-[#E5DFD3] text-xs text-[#7A7468]">
              <span>
                Page {data.page} of {data.total_pages}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={data.page <= 1}
                  onClick={() => setPage(page - 1)}
                  icon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={data.page >= data.total_pages}
                  onClick={() => setPage(page + 1)}
                  icon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="No matching reviews found"
          description="Try adjusting your search criteria or filter selections to view saved reviews."
          secondaryActionLabel="Reset Filters"
          onSecondaryAction={handleReset}
        />
      )}
    </div>
  );
};
