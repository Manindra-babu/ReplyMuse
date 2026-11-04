import React from 'react';
import { AlertTriangle, ShieldAlert, PhoneCall } from 'lucide-react';
import { SafetyFlags } from '../../types';

interface SafetyWarningBadgeProps {
  safetyFlags?: SafetyFlags;
  sentiment?: string;
}

export const SafetyWarningBadge: React.FC<SafetyWarningBadgeProps> = ({
  safetyFlags,
  sentiment,
}) => {
  if (!safetyFlags?.is_sensitive && sentiment !== 'negative') {
    return null;
  }

  const isSensitive = safetyFlags?.is_sensitive;

  return (
    <div
      className={`rounded-2xl border p-4 mb-4 text-xs text-[#2B2B2B] font-sans animate-in fade-in ${
        isSensitive
          ? 'border-[#F9CDC9] bg-[#FDF0ED]'
          : 'border-[#F9DBAF] bg-[#FEF7EE]'
      }`}
    >
      <div className="flex items-start gap-3">
        {isSensitive ? (
          <ShieldAlert className="w-4 h-4 text-[#D9381E] shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <p
            className={`font-semibold ${
              isSensitive ? 'text-[#D9381E]' : 'text-[#D97706]'
            }`}
          >
            {isSensitive
              ? 'Sensitive Complaint Detected — Human Review Advised'
              : 'Calm & Non-Defensive Response Protocol'}
          </p>
          <p className="text-[#2B2B2B]/90 leading-relaxed">
            {safetyFlags?.summary ||
              'This draft remains calm and empathetic, offering your verified direct contact details rather than debating facts publicly. Please inspect before copying.'}
          </p>
          {safetyFlags?.private_channel_offered && (
            <div
              className={`flex items-center gap-1.5 pt-1 text-[11px] font-medium ${
                isSensitive ? 'text-[#D9381E]' : 'text-[#D97706]'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Private communication invitation included in draft</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
