import React from 'react';

export interface ReviewReplyConnectorProps {
  className?: string;
  label?: string;
}

export const ReviewReplyConnector: React.FC<ReviewReplyConnectorProps> = ({
  className = '',
  label = 'AI crafted reply',
}) => {
  return (
    <div className={`flex items-center gap-2 pl-4 sm:pl-6 my-1.5 ${className}`} aria-hidden="true">
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-[#EE6A4B] shrink-0"
      >
        {/* Curved arrow curling down and right */}
        <path
          d="M8 4V16C8 21.5228 12.4772 26 18 26H26"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M22 21L27 26L22 31"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label && (
        <span className="text-[11px] font-sans font-medium text-[#EE6A4B] tracking-wide uppercase">
          {label}
        </span>
      )}
    </div>
  );
};
