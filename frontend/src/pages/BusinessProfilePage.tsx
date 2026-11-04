import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Store, Save } from 'lucide-react';
import { businessApi } from '../services/business';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Textarea } from '../components/common/Textarea';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import { BusinessProfile } from '../types';

const CATEGORIES = [
  { value: 'Restaurants, Cafés & Bakeries', label: 'Restaurants, Cafés & Bakeries' },
  { value: 'Dentists & Healthcare Clinics', label: 'Dentists & Healthcare Clinics' },
  { value: 'Gyms, Yoga & Fitness Studios', label: 'Gyms, Yoga & Fitness Studios' },
  { value: 'Salons, Spas & Wellness', label: 'Salons, Spas & Wellness' },
  { value: 'Retail Boutiques & Specialty Stores', label: 'Retail Boutiques & Specialty Stores' },
  { value: 'Plumbers, Electricians & Trades', label: 'Plumbers, Electricians & Trades' },
  { value: 'Hotels, Stays & Hospitality', label: 'Hotels, Stays & Hospitality' },
  { value: 'Other', label: 'Other Local Business' },
];

export const BusinessProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { error, success } = useToast();

  const { data: business, isLoading } = useQuery({
    queryKey: ['businessProfile'],
    queryFn: () => businessApi.getProfile(),
  });

  const [formState, setFormState] = useState<Partial<BusinessProfile>>({});
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (business) {
      setFormState(business);
    }
  }, [business]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await businessApi.updateProfile(formState);
      queryClient.invalidateQueries({ queryKey: ['businessProfile'] });
      success('Business profile updated successfully.');
    } catch (err: any) {
      error(err.message || 'Failed to update business profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-xs text-[#74786F]">Loading business profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-[#E5DFD3] pb-4">
        <h1 className="font-serif text-3xl font-bold text-[#2B2B2B] flex items-center gap-2">
          <Store className="w-6 h-6 text-[#1F7A5C]" />
          <span>Business Profile</span>
        </h1>
        <p className="text-xs text-[#7A7468] mt-1 leading-relaxed font-sans">
          Maintain your core business details, services description, and escalation contact channels.
        </p>
      </div>

      <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 sm:p-8 shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Business Name"
              value={formState.business_name || ''}
              onChange={(e) => setFormState({ ...formState, business_name: e.target.value })}
              required
            />

            <Select
              label="Business Category"
              value={formState.category || CATEGORIES[0].value}
              onChange={(e) => setFormState({ ...formState, category: e.target.value })}
              options={CATEGORIES}
            />
          </div>

          <Textarea
            label="Business Description"
            value={formState.description || ''}
            onChange={(e) => setFormState({ ...formState, description: e.target.value })}
            minRows={4}
            maxLength={2000}
            showCount
            helperText="Describe what you serve, key highlights, and customer care ethos."
            required
          />

          <div className="pt-2 border-t border-[#E5DFD3]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#22231F] mb-2">
              Private Escalation Channels
            </h3>
            <p className="text-xs text-[#74786F] mb-4 leading-relaxed">
              Included strictly in negative review responses to invite upset customers into a private discussion. ReplyMuse never hallucinates or invents fake phone numbers or emails.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Support Email"
                type="email"
                placeholder="care@yourbusiness.com"
                value={formState.contact_email || ''}
                onChange={(e) => setFormState({ ...formState, contact_email: e.target.value })}
              />

              <Input
                label="Support Phone"
                placeholder="+91 98765 43210"
                value={formState.contact_phone || ''}
                onChange={(e) => setFormState({ ...formState, contact_phone: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#E5DFD3]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#22231F] mb-3">
              Default Greetings & Sign-Offs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Default Greeting"
                value={formState.preferred_greeting || ''}
                onChange={(e) => setFormState({ ...formState, preferred_greeting: e.target.value })}
                placeholder="Hi [Name],"
              />

              <Input
                label="Default Sign-Off"
                value={formState.preferred_sign_off || ''}
                onChange={(e) => setFormState({ ...formState, preferred_sign_off: e.target.value })}
                placeholder="Warmly, The Team"
              />

              <Select
                label="Default Language"
                value={formState.default_language || 'en'}
                onChange={(e) => setFormState({ ...formState, default_language: e.target.value })}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'hi', label: 'Hindi' },
                  { value: 'hinglish', label: 'Hinglish' },
                ]}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSaving}
              icon={<Save className="w-4 h-4 text-white" />}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
