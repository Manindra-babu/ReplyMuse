import React from 'react';
import { Button } from './Button';
import { SparkleIcon } from './SparkleIcon';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionTo?: string;
  actionIcon?: React.ReactNode;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  actionTo,
  actionIcon = <SparkleIcon size={14} className="text-white" />,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-3xl border border-[#E5DFD3] p-8 sm:p-12 text-center space-y-4 shadow-[0_4px_20px_-2px_rgba(43,43,43,0.04)] ${className}`}
    >
      {/* Faded dashed-outline speech-bubble illustration */}
      <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
        {/* Secondary speech bubble behind */}
        <div
          className="absolute -top-1 -right-2 w-14 h-11 border-2 border-dashed border-[#EE6A4B]/40 bg-[#F7F3E8]/80 rounded-2xl rotate-6 flex items-center justify-center"
          aria-hidden="true"
        >
          <SparkleIcon size={10} className="text-[#EE6A4B]/70" />
        </div>

        {/* Main speech bubble */}
        <div
          className="relative w-20 h-16 border-2 border-dashed border-[#1F7A5C]/40 bg-[#DCEBE3]/40 rounded-2xl flex flex-col items-center justify-center shadow-2xs"
          aria-hidden="true"
        >
          <div className="w-8 h-1 bg-[#1F7A5C]/30 rounded-full mb-1" />
          <div className="w-11 h-1 bg-[#1F7A5C]/20 rounded-full" />
          {/* Speech bubble tail */}
          <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-[#DCEBE3]/50 border-r-2 border-b-2 border-dashed border-[#1F7A5C]/40 rotate-45" />
        </div>
      </div>

      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2B2B2B]">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-[#7A7468] leading-relaxed font-sans">
          {description}
        </p>
      </div>

      {(actionLabel || secondaryActionLabel) && (
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && (
            actionTo ? (
              <a href={actionTo}>
                <Button variant="primary" size="md" icon={actionIcon}>
                  {actionLabel}
                </Button>
              </a>
            ) : (
              <Button variant="primary" size="md" onClick={onAction} icon={actionIcon}>
                {actionLabel}
              </Button>
            )
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="secondary" size="md" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
