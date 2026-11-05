import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  PenTool,
  History,
  Sliders,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { businessApi } from '../services/business';
import { voiceApi } from '../services/voice';
import { reviewsApi } from '../services/reviews';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { StarRating } from '../components/common/StarRating';
import { EmptyState } from '../components/common/EmptyState';
import { SparkleIcon } from '../components/common/SparkleIcon';
import { GoogleIcon } from '../components/common/GoogleIcon';
import { useClipboard } from '../hooks/useClipboard';
import { useAuth } from '../context/AuthContext';
import { HistoryItem } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { copied, copy } = useClipboard();
  const [expandedDrafts, setExpandedDrafts] = useState<Record<string, boolean>>({});
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);

  const toggleDraftExpand = (id: string) => {
    setExpandedDrafts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Queries
  const { data: business } = useQuery({
    queryKey: ['businessProfile'],
    queryFn: () => businessApi.getProfile().catch(() => null),
    enabled: Boolean(user?.has_business_profile),
  });

  const { data: voiceProfile } = useQuery({
    queryKey: ['voiceProfile'],
    queryFn: () => voiceApi.getProfile().catch(() => null),
    enabled: Boolean(user?.has_voice_profile),
  });

  const { data: usage } = useQuery({
    queryKey: ['usage'],
    queryFn: () => reviewsApi.getUsage(),
  });

  const { data: history } = useQuery({
    queryKey: ['recentHistory'],
    queryFn: () => reviewsApi.getHistory({ page: 1, page_size: 5, sort: 'newest' }),
  });

  const hasIncompleteSetup = !business || !voiceProfile;

  return (
    <div className="space-y-8 relative">
      {/* Onboarding Incomplete Reminder */}
      {hasIncompleteSetup && (
        <div className="bg-[#FEF7EE] border border-[#F9DBAF] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#D97706]">
                Setup Incomplete
              </p>
              <p className="text-xs text-[#2B2B2B]/80 mt-0.5">
                Complete your business details and voice profile to begin generating authentic replies.
              </p>
            </div>
          </div>
          <Link to="/onboarding">
            <Button variant="coral" size="sm">
              Complete Onboarding →
            </Button>
          </Link>
        </div>
      )}

      {/* Greeting and Overview */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5DFD3] pb-6">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7468]">
            Café & Business Studio
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#2B2B2B] mt-1">
            {business ? `${business.business_name} Studio` : 'Welcome to ReplyMuse'}
          </h1>
          <p className="text-xs text-[#7A7468] mt-1 font-medium font-sans">
            {business?.category || 'Independent Local Business'} • Workspace active
          </p>
        </div>

        <Link to="/composer">
          <Button variant="primary" size="lg" icon={<SparkleIcon size={16} className="text-white" />}>
            Generate Reply
          </Button>
        </Link>
      </div>

      {/* Studio Indicators Grid: 3 Equal Height Cards with Identical Padding and Heading Styles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Card 1: Monthly Quota Meter */}
        <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-soft flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between min-h-[28px]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7A7468]">
              Monthly Credit Quota
            </span>
            <span className="text-xs font-sans text-[#2B2B2B] font-semibold bg-[#FAF8F5] border border-[#E5DFD3] px-2.5 py-0.5 rounded-full capitalize">
              {usage?.plan || 'Free'} Plan
            </span>
          </div>

          <div className="space-y-2 flex-1 justify-center flex flex-col">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-serif font-bold text-[#2B2B2B]">
                {usage?.used ?? 0}
                <span className="text-xs text-[#7A7468] font-sans font-normal ml-1">
                  / {(usage?.monthly_limit ?? 10) + (usage?.bonus_credits ?? 0)} total
                </span>
              </span>
              <span className="text-xs font-semibold text-[#1F7A5C]">
                {usage?.remaining ?? 10} remaining
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-[#DCEBE3]/60 rounded-full overflow-hidden border border-[#BEE0D0]">
              <div
                className="h-full bg-[#1F7A5C] transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    (((usage?.used ?? 0) / Math.max(1, (usage?.monthly_limit ?? 10) + (usage?.bonus_credits ?? 0))) * 100)
                  )}%`,
                }}
              />
            </div>

            {(usage?.bonus_credits ?? 0) > 0 && (
              <span className="text-[11px] font-semibold text-[#1F7A5C]">
                Includes +{usage?.bonus_credits} bonus credits
              </span>
            )}
          </div>

          <div className="pt-1 flex items-center justify-between border-t border-[#E5DFD3]/60">
            <p className="text-[11px] text-[#7A7468] font-sans">
              Resets on{' '}
              <strong className="text-[#2B2B2B]">
                {usage?.reset_date
                  ? new Date(usage.reset_date).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'next cycle'}
              </strong>
            </p>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="text-[11px] font-semibold text-[#EE6A4B] hover:text-[#EE6A4B]/80 hover:underline"
            >
              Need more? →
            </button>
          </div>
        </div>

        {/* Card 2: Business Voice Summary */}
        <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-soft flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between min-h-[28px]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7A7468]">
              Active Voice
            </span>
            <Link
              to="/style"
              className="text-xs text-[#1F7A5C] hover:underline flex items-center gap-1 font-semibold"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Edit Style</span>
            </Link>
          </div>

          <div className="flex-1 justify-center flex flex-col">
            {voiceProfile ? (
              <div className="space-y-2 text-xs">
                <p className="text-[#2B2B2B] font-medium leading-relaxed line-clamp-2">
                  "{voiceProfile.tone}"
                </p>
                <div className="pt-1 flex flex-wrap gap-1.5">
                  <Badge variant="emerald" size="sm">
                    {voiceProfile.formality}
                  </Badge>
                  <Badge variant="default" size="sm">
                    Voice: {voiceProfile.first_person_style.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#7A7468]">Voice profile not configured yet.</p>
            )}
          </div>

          <div className="text-[11px] text-[#7A7468] font-sans pt-1">
            <span>Synced to AI review composer</span>
          </div>
        </div>

        {/* Card 3: Quick Launch Action Card */}
        <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-soft flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between min-h-[28px]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7A7468]">
              Quick Composer
            </span>
            <span className="w-6 h-6 rounded-lg bg-[#DCEBE3] flex items-center justify-center text-[#1F7A5C] shrink-0">
              <PenTool className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="flex-1 justify-center flex flex-col">
            <p className="text-xs text-[#7A7468] leading-relaxed font-sans">
              Got a new customer review on Google? Paste it right now to draft a personalized reply in your brand voice.
            </p>
          </div>

          <div className="pt-1">
            <Link to="/composer" className="w-full block">
              <Button variant="secondary" size="sm" className="w-full">
                Open Composer →
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Reviews & Drafts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#1F7A5C]" />
            <h2 className="font-serif text-xl font-bold text-[#2B2B2B]">
              Recent Studio Generations
            </h2>
          </div>
          <Link
            to="/history"
            className="text-xs text-[#1F7A5C] hover:underline font-semibold font-sans"
          >
            View all history ({history?.total ?? 0}) →
          </Link>
        </div>

        {history && history.items.length > 0 ? (
          <div className="bg-white border border-[#E5DFD3] rounded-3xl divide-y divide-[#E5DFD3] overflow-hidden shadow-soft">
            {history.items.map((item: HistoryItem) => (
              <div key={item.id} className="p-5 sm:p-6 flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#F7F3E8] border border-[#E5DFD3] flex items-center justify-center shrink-0">
                      <GoogleIcon size={13} />
                    </div>
                    {item.star_rating && <StarRating rating={item.star_rating} size="sm" />}
                    <span className="font-semibold text-xs text-[#2B2B2B]">
                      {item.reviewer_name || 'Google Reviewer'}
                    </span>
                    <Badge
                      variant={
                        item.detected_sentiment === 'positive'
                          ? 'success'
                          : item.detected_sentiment === 'negative'
                          ? 'error'
                          : 'muted'
                      }
                      size="sm"
                    >
                      {item.detected_sentiment}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#7A7468] leading-relaxed italic line-clamp-2 pl-8">
                    "{item.review_text}"
                  </p>
                  {item.active_draft && (
                    <div className="mt-2 ml-8 p-4 bg-[#DCEBE3]/50 rounded-2xl border border-[#1F7A5C]/20 border-l-4 border-l-[#1F7A5C] text-xs text-[#2B2B2B] font-sans shadow-2xs space-y-1">
                      <div
                        className={`text-xs text-[#2B2B2B] leading-[1.55] transition-all ${
                          expandedDrafts[item.id] ? 'h-auto whitespace-pre-line' : 'line-clamp-3 h-auto'
                        }`}
                      >
                        <strong className="text-[#1F7A5C]">Draft:</strong> {item.active_draft.edited_reply}
                      </div>

                      {item.active_draft.edited_reply.length > 120 && (
                        <button
                          type="button"
                          onClick={() => toggleDraftExpand(item.id)}
                          className="pt-1 text-[11px] font-semibold text-[#1F7A5C] hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>{expandedDrafts[item.id] ? 'Show less' : 'Show more'}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {item.active_draft && (
                  <Button
                    variant={copied ? 'outline' : 'secondary'}
                    size="sm"
                    onClick={() => copy(item.active_draft!.edited_reply)}
                    icon={copied ? <Check className="w-3.5 h-3.5 text-[#1F7A5C]" /> : <Copy className="w-3.5 h-3.5" />}
                    className="shrink-0"
                  >
                    Copy
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No replies generated yet"
            description="Whenever you receive a customer review on your Google Business Profile, paste it here to create a thoughtful response in your voice."
            actionLabel="Draft Your First Reply"
            actionTo="/composer"
          />
        )}
      </div>

      {/* Upgrade / More Credits Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-soft space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#EE6A4B]">
                Upgrade Your Studio
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#2B2B2B] mt-1">
                Choose the Right Tier for Your Business
              </h3>
              <p className="text-xs text-[#7A7468] mt-1">
                Need more replies to handle peak seasonal reviews? Select a plan or contact support for customized allowances.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl border border-[#E5DFD3] bg-[#FAF8F5] flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-[#2B2B2B]">Free Starter</span>
                  <div className="font-serif text-xl font-bold text-[#2B2B2B] mt-1">₹0</div>
                  <p className="text-[11px] text-[#7A7468] mt-1">10 replies / mo</p>
                </div>
                <span className="text-[10px] bg-white border border-[#E5DFD3] px-2 py-0.5 rounded-full font-semibold text-center mt-3">
                  Current
                </span>
              </div>

              <div className="p-4 rounded-2xl border-2 border-[#1F7A5C] bg-[#DCEBE3]/20 flex flex-col justify-between relative shadow-xs">
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#1F7A5C] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Popular
                </span>
                <div>
                  <span className="text-xs font-bold text-[#1F7A5C]">Growth Studio</span>
                  <div className="font-serif text-xl font-bold text-[#2B2B2B] mt-1">₹1,499<span className="text-xs text-[#7A7468] font-sans font-normal">/mo</span></div>
                  <p className="text-[11px] text-[#7A7468] mt-1">100 replies / mo</p>
                </div>
                <a
                  href="mailto:care@replymuse.com?subject=Upgrade%20to%20Growth%20Studio"
                  className="text-[11px] bg-[#1F7A5C] text-white text-center py-1 rounded-xl font-semibold mt-3 hover:bg-[#1F7A5C]/90"
                >
                  Upgrade
                </a>
              </div>

              <div className="p-4 rounded-2xl border border-[#E5DFD3] bg-[#FAF8F5] flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-[#2B2B2B]">Pro Studio</span>
                  <div className="font-serif text-xl font-bold text-[#2B2B2B] mt-1">₹3,499<span className="text-xs text-[#7A7468] font-sans font-normal">/mo</span></div>
                  <p className="text-[11px] text-[#7A7468] mt-1">500 replies / mo</p>
                </div>
                <a
                  href="mailto:care@replymuse.com?subject=Upgrade%20to%20Pro%20Studio"
                  className="text-[11px] bg-white border border-[#E5DFD3] text-[#2B2B2B] text-center py-1 rounded-xl font-semibold mt-3 hover:border-[#1F7A5C]"
                >
                  Contact
                </a>
              </div>
            </div>

            <div className="p-3.5 bg-[#FEF7EE] border border-[#F9DBAF] rounded-2xl text-[11px] text-[#2B2B2B]">
              <strong className="text-[#D97706] font-semibold">Special Offer:</strong> Need a quick temporary boost? Email our team or message founder support and receive <strong>+25 bonus credits</strong> instantly!
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setShowUpgradeModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
