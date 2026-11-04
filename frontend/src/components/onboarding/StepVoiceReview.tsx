import React, { useState } from 'react';
import { Sparkles, Check, Info } from 'lucide-react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { VoiceProfile } from '../../types';

interface StepVoiceReviewProps {
  initialVoice: Partial<VoiceProfile>;
  onBack: () => void;
  onFinish: (profile: Partial<VoiceProfile>) => void;
  loading?: boolean;
}

export const StepVoiceReview: React.FC<StepVoiceReviewProps> = ({
  initialVoice,
  onBack,
  onFinish,
  loading = false,
}) => {
  const [tone, setTone] = useState(initialVoice.tone || 'Warm, appreciative, and hospitable');
  const [formality, setFormality] = useState(initialVoice.formality || 'Polished & friendly');
  const [preferredLength, setPreferredLength] = useState(
    initialVoice.preferred_length || 'Balanced (2-4 sentences)'
  );
  const [greeting, setGreeting] = useState(initialVoice.greeting || 'Hi [Name],');
  const [signOff, setSignOff] = useState(initialVoice.sign_off || 'Warmly,\nThe Team');
  const [firstPersonStyle, setFirstPersonStyle] = useState(
    initialVoice.first_person_style || 'we'
  );
  const [preferredPhrases, setPreferredPhrases] = useState(
    (initialVoice.preferred_phrases || []).join(', ')
  );
  const [avoidedPhrases, setAvoidedPhrases] = useState(
    (initialVoice.avoided_phrases || []).join(', ')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFinish({
      tone: tone.trim(),
      formality: formality.trim(),
      preferred_length: preferredLength.trim(),
      greeting: greeting.trim(),
      sign_off: signOff.trim(),
      first_person_style: firstPersonStyle,
      preferred_phrases: preferredPhrases
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean),
      avoided_phrases: avoidedPhrases
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean),
      language_preference: initialVoice.language_preference || 'en',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in">
      <div className="border-b border-[#E5DFD3] pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-[#1F7A5C]" />
          <h3 className="font-serif text-lg font-bold text-[#2B2B2B]">
            Step 3: Review Your Inferred Voice Profile
          </h3>
        </div>
        <p className="text-xs text-[#7A7468] leading-relaxed font-sans">
          ReplyMuse has extracted your brand's unique linguistic fingerprint. You can edit any field below to fine-tune exactly how future replies should sound.
        </p>
      </div>

      <div className="bg-white border border-[#E5DFD3] rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Inferred Tone"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            helperText="e.g. Warm, gracious, humble, enthusiastic"
            required
          />

          <Select
            label="Formality Level"
            value={formality}
            onChange={(e) => setFormality(e.target.value)}
            options={[
              { value: 'Casual & warm', label: 'Casual & warm' },
              { value: 'Polished & friendly', label: 'Polished & friendly' },
              { value: 'Professional & structured', label: 'Professional & structured' },
              { value: 'Formal & dignified', label: 'Formal & dignified' },
            ]}
          />
          <Select
            label="Typical Reply Length"
            value={preferredLength}
            onChange={(e) => setPreferredLength(e.target.value)}
            options={[
              { value: 'Concise (1-2 sentences)', label: 'Concise (1-2 sentences)' },
              { value: 'Balanced (2-4 sentences)', label: 'Balanced (2-4 sentences)' },
              { value: 'Detailed (4-6 sentences)', label: 'Detailed (4-6 sentences)' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Perspective Voice"
            value={firstPersonStyle}
            onChange={(e) => setFirstPersonStyle(e.target.value)}
            options={[
              { value: 'we', label: 'Team Voice ("We", "Our team")' },
              { value: 'I', label: 'Solo Owner Voice ("I", "My team")' },
            ]}
          />

          <Input
            label="Default Greeting"
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            placeholder="Hi [Name],"
          />

          <Input
            label="Default Sign-Off"
            value={signOff}
            onChange={(e) => setSignOff(e.target.value)}
            placeholder="Warmly, The Team"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E5DFD3]">
          <Input
            label="Preferred Phrases (Comma separated)"
            value={preferredPhrases}
            onChange={(e) => setPreferredPhrases(e.target.value)}
            helperText="Expressions you love using (e.g. 'Delighted to host you', 'handmade with love')"
          />

          <Input
            label="Phrases to Avoid (Comma separated)"
            value={avoidedPhrases}
            onChange={(e) => setAvoidedPhrases(e.target.value)}
            helperText="Cold boilerplate to avoid (e.g. 'Inconvenience regretted', 'As per policy')"
          />
        </div>
      </div>

      <div className="p-4 bg-[#DCEBE3]/60 border border-[#BEE0D0] rounded-2xl text-[11px] text-[#2B2B2B] flex items-start gap-2 font-sans">
        <Info className="w-4 h-4 text-[#1F7A5C] shrink-0 mt-0.5" />
        <span>
          This profile is safely stored in PostgreSQL and used for all future review generations. You can edit or re-analyze your style anytime from the <strong>Your Style</strong> tab.
        </span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#E5DFD3]">
        <Button type="button" variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          icon={<Check className="w-4 h-4 text-white" />}
        >
          Save Voice & Launch Studio →
        </Button>
      </div>
    </form>
  );
};
