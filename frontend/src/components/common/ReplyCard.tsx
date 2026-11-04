import React from 'react';
import { SparkleIcon } from './SparkleIcon';

export interface ReplyCardProps {
  replyText: string;
  title?: string;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
  offset?: boolean;
  className?: string;
}

export const ReplyCard: React.FC<ReplyCardProps> = ({
  replyText,
  title = 'AI-written reply in your voice',
  badges,
  actions,
  offset = true,
  className = '',
}) => {
  return (
    <div
      className={`bg-[#DCEBE3]/60 border border-[#1F7A5C]/40 rounded-2xl p-5 sm:p-6 shadow-[0_4px_16px_-2px_rgba(31,122,92,0.08)] relative ${
        offset ? 'ml-3 sm:ml-8' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-[#1F7A5C]/15">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#1F7A5C]/15 flex items-center justify-center text-[#1F7A5C]">
            <SparkleIcon size={14} className="text-[#1F7A5C]" />
          </div>
          <span className="font-sans font-semibold text-xs text-[#1F7A5C] tracking-wide uppercase">
            {title}
          </span>
        </div>
        {badges}
      </div>

      <div className="text-sm font-sans leading-relaxed text-[#2B2B2B] whitespace-pre-line">
        {replyText}
      </div>

      {actions && (
        <div className="mt-4 pt-3 border-t border-[#1F7A5C]/15 flex flex-wrap items-center justify-between gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};
