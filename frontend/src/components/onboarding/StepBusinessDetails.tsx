import React, { useState } from 'react';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { BusinessProfile } from '../../types';

interface StepBusinessDetailsProps {
  initialData?: Partial<BusinessProfile>;
  onNext: (data: any) => void;
  loading?: boolean;
}

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

export const StepBusinessDetails: React.FC<StepBusinessDetailsProps> = ({
  initialData,
  onNext,
  loading = false,
}) => {
  const [businessName, setBusinessName] = useState(initialData?.business_name || '');
  const [category, setCategory] = useState(initialData?.category || CATEGORIES[0].value);
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState(initialData?.description || '');
  const [contactEmail, setContactEmail] = useState(initialData?.contact_email || '');
  const [contactPhone, setContactPhone] = useState(initialData?.contact_phone || '');
  const [defaultLanguage, setDefaultLanguage] = useState(initialData?.default_language || 'en');
  const [preferredGreeting, setPreferredGreeting] = useState(initialData?.preferred_greeting || 'Hi [Name],');
  const [preferredSignOff, setPreferredSignOff] = useState(
    initialData?.preferred_sign_off || 'Warmly,\nThe Team'
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!businessName.trim()) {
      errs.businessName = 'Business name is required';
    }
    if (category === 'Other' && !customCategory.trim()) {
      errs.category = 'Please specify your business category';
    }
    if (!description.trim() || description.trim().length < 10) {
      errs.description = 'Please provide a short description (at least 10 characters)';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    onNext({
      business_name: businessName.trim(),
      category: category === 'Other' ? customCategory.trim() : category,
      description: description.trim(),
      contact_email: contactEmail.trim() || undefined,
      contact_phone: contactPhone.trim() || undefined,
      default_language: defaultLanguage,
      preferred_greeting: preferredGreeting.trim() || undefined,
      preferred_sign_off: preferredSignOff.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-[#E6E1D8] pb-4">
        <h3 className="font-serif text-lg font-semibold text-[#22231F]">
          Step 1: Describe Your Business
        </h3>
        <p className="text-xs text-[#74786F] mt-1 leading-relaxed">
          Provide your business context so AI replies match what you do, where you operate, and how you resolve issues.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Business Name"
          placeholder="e.g. Copper Chimney Bistro"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          error={errors.businessName}
          required
        />

        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={CATEGORIES}
        />
      </div>

      {category === 'Other' && (
        <Input
          label="Specify Category"
          placeholder="e.g. Pet Grooming & Daycare"
          value={customCategory}
          onChange={(e) => setCustomCategory(e.target.value)}
          error={errors.category}
          required
        />
      )}

      <Textarea
        label="Business Description & Offerings"
        placeholder="e.g. An artisanal sourdough bakery and specialty coffee bar located in Koramangala, Bangalore. Known for handcrafted pastries, cozy seating, and welcoming morning crowd."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors.description}
        minRows={3}
        maxLength={1500}
        showCount
        required
      />

      <div className="pt-2 border-t border-[#E6E1D8]">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#22231F] mb-2">
          Private Resolution Channels (Optional)
        </h4>
        <p className="text-xs text-[#74786F] mb-4 leading-relaxed">
          When answering negative reviews, ReplyMuse will invite the customer to reach out to these verified channels. ReplyMuse will never invent fake contact details.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Support / Escalation Email"
            type="email"
            placeholder="care@yourbusiness.com"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            helperText="Used in negative review responses for direct escalation"
          />

          <Input
            label="Support Phone Number"
            placeholder="+91 98765 43210"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </div>
      </div>

      <div className="pt-2 border-t border-[#E5DFD3]">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#2B2B2B] mb-3 font-sans">
          Default Formatting
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Default Greeting"
            value={preferredGreeting}
            onChange={(e) => setPreferredGreeting(e.target.value)}
            placeholder="Hi [Name],"
          />

          <Input
            label="Default Sign-Off"
            value={preferredSignOff}
            onChange={(e) => setPreferredSignOff(e.target.value)}
            placeholder="Warmly, The Team"
          />

          <Select
            label="Primary Language"
            value={defaultLanguage}
            onChange={(e) => setDefaultLanguage(e.target.value)}
            options={[
              { value: 'en', label: 'English' },
              { value: 'hi', label: 'Hindi' },
              { value: 'hinglish', label: 'Hinglish' },
            ]}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" variant="primary" size="lg" loading={loading}>
          Continue to Voice Examples →
        </Button>
      </div>
    </form>
  );
};
