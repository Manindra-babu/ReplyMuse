import React, { useState } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  Edit3,
  Save,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { ReplyDraft } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { SparkleIcon } from '../common/SparkleIcon';
import { useClipboard } from '../../hooks/useClipboard';
import { SafetyWarningBadge } from './SafetyWarningBadge';
import { reviewsApi } from '../../services/reviews';
import { useToast } from '../../context/ToastContext';

interface GeneratedReplyCardProps {
  drafts: ReplyDraft[];
  activeDraftIndex: number;
  onSelectDraftIndex: (idx: number) => void;
  onRegenerate: () => Promise<void>;
  isRegenerating: boolean;
  sentiment?: string;
  onDraftUpdated?: (updated: ReplyDraft) => void;
}

export const GeneratedReplyCard: React.FC<GeneratedReplyCardProps> = ({
  drafts,
  activeDraftIndex,
  onSelectDraftIndex,
  onRegenerate,
  isRegenerating,
  sentiment,
  onDraftUpdated,
}) => {
  const currentDraft = drafts[activeDraftIndex] || drafts[0];
  const { copied, copy } = useClipboard();
  const { success, error } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(currentDraft ? currentDraft.edited_reply : '');
  const [isSaving, setIsSaving] = useState(false);

  // Sync edit text when active draft changes
  React.useEffect(() => {
    if (currentDraft) {
      setEditText(currentDraft.edited_reply);
      setIsEditing(false);
    }
  }, [currentDraft?.id]);

  if (!currentDraft) return null;

  const handleCopy = async () => {
    await copy(currentDraft.edited_reply, 'Reply copied! Paste into Google Business Profile.');
    try {
      const updated = await reviewsApi.updateDraft(currentDraft.id, { status: 'copied' });
      if (onDraftUpdated) onDraftUpdated(updated);
    } catch {
      // Non-fatal if status update fails
    }
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) {
      error('Reply text cannot be empty');
      return;
    }
    setIsSaving(true);
    try {
      const updated = await reviewsApi.updateDraft(currentDraft.id, {
        edited_reply: editText.trim(),
        status: 'edited',
      });
      if (onDraftUpdated) onDraftUpdated(updated);
      setIsEditing(false);
      success('Edits saved to draft record');
    } catch (err: any) {
      error(err.message || 'Failed to save edits');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkPublished = async () => {
    try {
      const updated = await reviewsApi.updateDraft(currentDraft.id, { status: 'published' });
      if (onDraftUpdated) onDraftUpdated(updated);
      success('Marked as published externally to Google');
    } catch (err: any) {
      error(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="ml-3 sm:ml-8 bg-[#DCEBE3]/60 border border-[#1F7A5C]/40 rounded-3xl shadow-soft overflow-hidden animate-in fade-in duration-200 animate-coral-shimmer">
      {/* Header Bar */}
      <div className="px-5 py-3.5 border-b border-[#1F7A5C]/15 bg-white/70 backdrop-blur-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#1F7A5C]/15 flex items-center justify-center text-[#1F7A5C]">
            <SparkleIcon size={14} className="text-[#1F7A5C]" />
          </div>
          <span className="font-serif font-bold text-sm text-[#2B2B2B]">
            Generated Studio Draft
          </span>

          {/* Draft version picker if regenerated */}
          {drafts.length > 1 && (
            <div className="flex items-center gap-1 ml-2 bg-white border border-[#E5DFD3] rounded-lg px-2 py-0.5 text-xs text-[#7A7468]">
              <span>Variation:</span>
              {drafts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectDraftIndex(idx)}
                  className={`px-1.5 py-0.5 rounded font-mono text-[11px] transition-colors ${
                    idx === activeDraftIndex
                      ? 'bg-[#1F7A5C] text-white font-semibold'
                      : 'hover:bg-[#F7F3E8] text-[#2B2B2B]'
                  }`}
                  aria-label={`Switch to draft version ${idx + 1}`}
                >
                  #{idx + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={
              currentDraft.status === 'published'
                ? 'success'
                : currentDraft.status === 'copied'
                ? 'success'
                : currentDraft.status === 'edited'
                ? 'emerald'
                : 'muted'
            }
            size="sm"
          >
            {currentDraft.status}
          </Badge>
          <span className="text-[11px] text-[#7A7468] font-mono flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {currentDraft.edited_reply.length} chars
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <SafetyWarningBadge
          safetyFlags={currentDraft.safety_flags}
          sentiment={sentiment}
        />

        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full bg-white border border-[#1F7A5C] rounded-2xl p-4 text-sm font-sans leading-relaxed text-[#2B2B2B] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]/25 min-h-[160px] resize-y shadow-2xs"
              aria-label="Edit response text"
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditText(currentDraft.edited_reply);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Save className="w-3.5 h-3.5 text-white" />}
                loading={isSaving}
                onClick={handleSaveEdit}
              >
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="group relative">
            <div className="whitespace-pre-line text-sm leading-relaxed text-[#2B2B2B] font-sans bg-white/90 p-5 sm:p-6 rounded-2xl border border-[#1F7A5C]/20 border-l-4 border-l-[#1F7A5C] min-h-[120px] shadow-soft">
              {currentDraft.edited_reply}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-5 pt-4 border-t border-[#1F7A5C]/15 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!isEditing && (
              <Button
                variant="secondary"
                size="sm"
                icon={<Edit3 className="w-3.5 h-3.5 text-[#7A7468]" />}
                onClick={() => setIsEditing(true)}
              >
                Fine-tune
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw className={`w-3.5 h-3.5 text-[#7A7468] ${isRegenerating ? 'animate-spin' : ''}`} />}
              loading={isRegenerating}
              onClick={onRegenerate}
              title="Generate an alternative response variation"
            >
              Regenerate Variation
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {currentDraft.status === 'copied' && (
              <button
                type="button"
                onClick={handleMarkPublished}
                className="text-xs text-[#7A7468] hover:text-[#1F7A5C] underline flex items-center gap-1 font-sans"
                title="Confirm when you have successfully pasted this reply to your Google Business Profile"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Mark Published to Google</span>
              </button>
            )}

            <Button
              variant={copied ? 'outline' : 'primary'}
              size="md"
              icon={copied ? <Check className="w-4 h-4 text-[#1F7A5C]" /> : <Copy className="w-4 h-4 text-white" />}
              onClick={handleCopy}
              className={`font-semibold ${copied ? 'border-[#1F7A5C] text-[#1F7A5C]' : ''}`}
            >
              {copied ? 'Copied to Clipboard!' : 'Copy Reply'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
