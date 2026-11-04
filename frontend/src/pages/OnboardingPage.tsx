import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepBusinessDetails } from '../components/onboarding/StepBusinessDetails';
import { StepPreviousReplies } from '../components/onboarding/StepPreviousReplies';
import { StepVoiceReview } from '../components/onboarding/StepVoiceReview';
import { businessApi } from '../services/business';
import { voiceApi } from '../services/voice';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { VoiceProfile, BusinessProfile } from '../types';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { error, success } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [businessData, setBusinessData] = useState<any>(null);
  const [examples, setExamples] = useState<string[]>([]);
  const [inferredVoice, setInferredVoice] = useState<Partial<VoiceProfile>>({});
  const [loading, setLoading] = useState<boolean>(false);

  // Step 1: Save business details to backend
  const handleBusinessSubmit = async (data: any) => {
    setLoading(true);
    try {
      const savedBiz = await businessApi.updateProfile(data);
      setBusinessData(savedBiz);
      setStep(2);
    } catch (err: any) {
      error(err.message || 'Failed to save business details.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Send previous replies to AI analyzer
  const handleExamplesSubmit = async (exList: string[]) => {
    setLoading(true);
    try {
      setExamples(exList);
      const voice = await voiceApi.analyzeVoice(exList);
      setInferredVoice(voice);
      setStep(3);
      success('Voice profile successfully inferred from your authentic replies!');
    } catch (err: any) {
      error(err.message || 'Voice analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Save final voice profile adjustments
  const handleVoiceFinish = async (updatedVoice: Partial<VoiceProfile>) => {
    setLoading(true);
    try {
      await voiceApi.updateProfile(updatedVoice);
      await refreshUser();
      success('Welcome to ReplyMuse Studio! Your business voice is ready.');
      navigate('/dashboard');
    } catch (err: any) {
      error(err.message || 'Failed to finalize voice profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Progress Header */}
      <div className="mb-8 text-center space-y-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#EE6A4B]">
          Initial Setup
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#2B2B2B]">
          Teach ReplyMuse Your Voice
        </h1>
        <div className="flex items-center justify-center gap-2 pt-2">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                num === step
                  ? 'w-12 bg-[#1F7A5C]'
                  : num < step
                  ? 'w-6 bg-[#1F7A5C]/40'
                  : 'w-6 bg-[#E5DFD3]'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 sm:p-8 shadow-soft">
        {step === 1 && (
          <StepBusinessDetails
            initialData={businessData}
            onNext={handleBusinessSubmit}
            loading={loading}
          />
        )}

        {step === 2 && (
          <StepPreviousReplies
            onBack={() => setStep(1)}
            onNext={handleExamplesSubmit}
            loading={loading}
          />
        )}

        {step === 3 && (
          <StepVoiceReview
            initialVoice={inferredVoice}
            onBack={() => setStep(2)}
            onFinish={handleVoiceFinish}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};
