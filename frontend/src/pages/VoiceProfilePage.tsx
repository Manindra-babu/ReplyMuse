import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sliders, Save, Sparkles, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { voiceApi } from '../services/voice';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { Textarea } from '../components/common/Textarea';
import { useToast } from '../context/ToastContext';
import { VoiceProfile } from '../types';

export const VoiceProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { error, success } = useToast();

  const { data: voiceProfile, isLoading: isVoiceLoading } = useQuery({
    queryKey: ['voiceProfile'],
    queryFn: () => voiceApi.getProfile(),
  });

  const { data: examples = [], isLoading: isExLoading } = useQuery({
    queryKey: ['voiceExamples'],
    queryFn: () => voiceApi.getExamples(),
  });

  const [formState, setFormState] = useState<Partial<VoiceProfile>>({});
  const [newExample, setNewExample] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Sync state once data loaded
  React.useEffect(() => {
    if (voiceProfile) {
      setFormState(voiceProfile);
    }
  }, [voiceProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await voiceApi.updateProfile(formState);
      queryClient.invalidateQueries({ queryKey: ['voiceProfile'] });
      success('Voice profile settings saved successfully.');
    } catch (err: any) {
      error(err.message || 'Failed to update voice profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddExample = async () => {
    if (!newExample.trim() || newExample.trim().length < 10) {
      error('Please provide an authentic example reply (at least 10 characters).');
      return;
    }
    try {
      const currentTexts = examples.map((e) => e.example_text);
      await voiceApi.saveExamples([...currentTexts, newExample.trim()]);
      queryClient.invalidateQueries({ queryKey: ['voiceExamples'] });
      setNewExample('');
      success('Example saved to your reference library.');
    } catch (err: any) {
      error(err.message || 'Failed to save example.');
    }
  };

  const handleDeleteExample = async (id: string) => {
    try {
      await voiceApi.deleteExample(id);
      queryClient.invalidateQueries({ queryKey: ['voiceExamples'] });
      success('Example deleted.');
    } catch (err: any) {
      error(err.message || 'Failed to delete example.');
    }
  };

  const handleReanalyze = async () => {
    if (examples.length === 0) {
      error('At least one example reply is required to analyze your voice.');
      return;
    }
    setIsAnalyzing(true);
    try {
      const texts = examples.map((e) => e.example_text);
      const updated = await voiceApi.analyzeVoice(texts);
      setFormState(updated);
      queryClient.invalidateQueries({ queryKey: ['voiceProfile'] });
      success('Voice profile re-analyzed and updated!');
    } catch (err: any) {
      error(err.message || 'Re-analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isVoiceLoading) {
    return <div className="py-12 text-center text-xs text-[#74786F]">Loading voice profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-[#E5DFD3] pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#2B2B2B] flex items-center gap-2">
            <Sliders className="w-6 h-6 text-[#1F7A5C]" />
            <span>Your Business Voice</span>
          </h1>
          <p className="text-xs text-[#7A7468] mt-1 leading-relaxed font-sans">
            Customize the rules, vocabulary, greetings, and tone ReplyMuse uses to draft your replies.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />}
          loading={isAnalyzing}
          onClick={handleReanalyze}
        >
          Re-Analyze from Examples
        </Button>
      </div>

      {/* Voice Configuration Form */}
      <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 sm:p-8 shadow-soft">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Tone Description"
              value={formState.tone || ''}
              onChange={(e) => setFormState({ ...formState, tone: e.target.value })}
              helperText="e.g. Warm, hospitable, appreciative, friendly"
              required
            />

            <Select
              label="Formality Level"
              value={formState.formality || 'Polished & friendly'}
              onChange={(e) => setFormState({ ...formState, formality: e.target.value })}
              options={[
                { value: 'Casual & warm', label: 'Casual & warm' },
                { value: 'Polished & friendly', label: 'Polished & friendly' },
                { value: 'Professional & structured', label: 'Professional & structured' },
                { value: 'Formal & dignified', label: 'Formal & dignified' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="First-Person Perspective"
              value={formState.first_person_style || 'we'}
              onChange={(e) => setFormState({ ...formState, first_person_style: e.target.value })}
              options={[
                { value: 'we', label: 'Team Voice ("We", "Our team")' },
                { value: 'I', label: 'Solo Owner Voice ("I", "My team")' },
              ]}
            />

            <Input
              label="Default Greeting"
              value={formState.greeting || ''}
              onChange={(e) => setFormState({ ...formState, greeting: e.target.value })}
              placeholder="Hi [Name],"
            />

            <Input
              label="Default Sign-Off"
              value={formState.sign_off || ''}
              onChange={(e) => setFormState({ ...formState, sign_off: e.target.value })}
              placeholder="Warmly, The Team"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E5DFD3]">
            <Input
              label="Preferred Phrases (Comma-separated)"
              value={(formState.preferred_phrases || []).join(', ')}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  preferred_phrases: e.target.value.split(',').map((p) => p.trim()).filter(Boolean),
                })
              }
              helperText="Terms or phrases you want included naturally"
            />

            <Input
              label="Avoided Phrases (Comma-separated)"
              value={(formState.avoided_phrases || []).join(', ')}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  avoided_phrases: e.target.value.split(',').map((p) => p.trim()).filter(Boolean),
                })
              }
              helperText="Corporate buzzwords or robotic jargon to exclude"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSaving}
              icon={<Save className="w-4 h-4 text-white" />}
            >
              Save Voice Profile
            </Button>
          </div>
        </form>
      </div>

      {/* Reference Examples */}
      <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 sm:p-8 shadow-soft space-y-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#2B2B2B]">
            Saved Reference Examples ({examples.length})
          </h2>
          <p className="text-xs text-[#7A7468] mt-1 leading-relaxed font-sans">
            These authentic past replies are stored safely in your database to guide your voice.
          </p>
        </div>

        <div className="space-y-3">
          {examples.map((ex, idx) => (
            <div
              key={ex.id}
              className="p-4 bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl flex items-start justify-between gap-4 text-xs font-sans"
            >
              <div className="space-y-1">
                <span className="font-semibold text-[#7A7468] uppercase tracking-wider text-[10px]">
                  Example #{idx + 1}
                </span>
                <p className="text-[#2B2B2B] leading-relaxed font-sans">{ex.example_text}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteExample(ex.id)}
                className="text-[#7A7468] hover:text-[#D9381E] transition-colors p-1"
                aria-label={`Delete example ${idx + 1}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Example Form */}
        <div className="pt-3 border-t border-[#E5DFD3] space-y-2">
          <Textarea
            placeholder="Paste another authentic reply you wrote to a customer..."
            value={newExample}
            onChange={(e) => setNewExample(e.target.value)}
            minRows={2}
          />
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleAddExample}
          >
            Add Reference Example
          </Button>
        </div>
      </div>
    </div>
  );
};
