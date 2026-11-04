import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ReviewComposer } from '../components/composer/ReviewComposer';
import { businessApi } from '../services/business';
import { voiceApi } from '../services/voice';
import { reviewsApi } from '../services/reviews';

export const ComposerPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: business } = useQuery({
    queryKey: ['businessProfile'],
    queryFn: () => businessApi.getProfile().catch(() => null),
  });

  const { data: voiceProfile } = useQuery({
    queryKey: ['voiceProfile'],
    queryFn: () => voiceApi.getProfile().catch(() => null),
  });

  const handleSuccess = () => {
    // Invalidate usage and history queries
    queryClient.invalidateQueries({ queryKey: ['usage'] });
    queryClient.invalidateQueries({ queryKey: ['recentHistory'] });
    queryClient.invalidateQueries({ queryKey: ['history'] });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-studio-border pb-4">
        <h1 className="font-serif text-3xl font-semibold text-studio-text">
          Review Reply Composer
        </h1>
        <p className="text-xs text-studio-muted mt-1 leading-relaxed">
          Paste any Google review to draft an authentic response in your business voice. Edit if needed, then copy directly to Google.
        </p>
      </div>

      <ReviewComposer
        business={business}
        voiceProfile={voiceProfile}
        onSuccess={handleSuccess}
      />
    </div>
  );
};
