import React, { useState } from 'react';
import { Plus, Trash2, HelpCircle } from 'lucide-react';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';

interface StepPreviousRepliesProps {
  onBack: () => void;
  onNext: (examples: string[]) => void;
  loading?: boolean;
}

const DEFAULT_SAMPLES = [
  "Thank you so much for the kind words, Rahul! Our team takes immense pride in getting the roast coffee and sourdough just right. Hope to see you back on Saturday morning!",
  "Hi Priya, we are thrilled you enjoyed the ambience and our staff's hospitality. Looking forward to welcoming you and your family again soon!",
  "Hello Amit, thank you for sharing your candid thoughts with us. We are genuinely sorry about the wait time during Sunday brunch. Please reach out to us at care@mybusiness.com so we can make this right.",
];

export const StepPreviousReplies: React.FC<StepPreviousRepliesProps> = ({
  onBack,
  onNext,
  loading = false,
}) => {
  const { error } = useToast();
  const [examples, setExamples] = useState<string[]>(DEFAULT_SAMPLES);

  const handleUpdate = (index: number, val: string) => {
    const updated = [...examples];
    updated[index] = val;
    setExamples(updated);
  };

  const handleAdd = () => {
    if (examples.length >= 6) {
      error('Maximum 6 examples allowed.');
      return;
    }
    setExamples([...examples, '']);
  };

  const handleRemove = (index: number) => {
    if (examples.length <= 1) {
      error('At least one example reply is required.');
      return;
    }
    setExamples(examples.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = examples.map((e) => e.trim()).filter((e) => e.length >= 10);
    if (valid.length < 1) {
      error('Please provide at least one genuine example reply (at least 10 characters).');
      return;
    }
    onNext(valid);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-[#E5DFD3] pb-4">
        <h3 className="font-serif text-lg font-bold text-[#2B2B2B]">
          Step 2: Paste Previous Replies (3 to 5 recommended)
        </h3>
        <p className="text-xs text-[#7A7468] mt-1 leading-relaxed font-sans">
          ReplyMuse analyzes these authentic past replies to extract your natural tone, vocabulary, greeting habits, and brand style.
        </p>
      </div>

      <div className="bg-[#DCEBE3]/60 border border-[#BEE0D0] rounded-2xl p-4 text-xs text-[#2B2B2B] flex items-start gap-2.5 font-sans">
        <HelpCircle className="w-4 h-4 text-[#1F7A5C] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#1F7A5C]">Tip:</strong> Include both positive and negative replies if you have them. This teaches ReplyMuse how you celebrate good reviews and how you defuse difficult situations.
        </p>
      </div>

      <div className="space-y-4">
        {examples.map((example, idx) => (
          <div
            key={idx}
            className="p-5 bg-white border border-[#E5DFD3] rounded-2xl space-y-2 relative shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7A7468] font-sans">
                Example Reply #{idx + 1}
              </span>
              {examples.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="text-[#7A7468] hover:text-[#D9381E] transition-colors p-1"
                  aria-label={`Remove example ${idx + 1}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <Textarea
              placeholder="Paste a reply you previously wrote to a customer on Google..."
              value={example}
              onChange={(e) => handleUpdate(idx, e.target.value)}
              minRows={3}
              maxLength={1500}
              showCount
              required
            />
          </div>
        ))}
      </div>

      {examples.length < 6 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={handleAdd}
        >
          Add Another Example
        </Button>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-[#E5DFD3]">
        <Button type="button" variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <Button type="submit" variant="primary" size="lg" loading={loading}>
          Analyze Voice Profile →
        </Button>
      </div>
    </form>
  );
};
