import React from 'react';
import { Shield } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div className="border-b border-[#E5DFD3] pb-4">
        <h1 className="font-serif text-3xl font-bold text-[#2B2B2B] flex items-center gap-2">
          <Shield className="w-6 h-6 text-[#1F7A5C]" />
          <span>Privacy Policy</span>
        </h1>
        <p className="text-xs text-[#7A7468] mt-1">Last updated: November 2026</p>
      </div>

      <div className="prose prose-sm max-w-none text-[#2B2B2B] space-y-6 text-xs leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-base font-semibold text-[#2B2B2B]">1. Overview</h2>
          <p className="text-[#7A7468]">
            ReplyMuse ("we", "our", or "us") provides an AI-assisted review reply studio for local businesses. This policy outlines what data we collect, why we process it, and how your information is protected.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base font-semibold text-[#2B2B2B]">2. Information We Collect</h2>
          <ul className="list-disc list-inside space-y-1 text-[#7A7468]">
            <li><strong>Account Data:</strong> Email address and cryptographically hashed passwords (bcrypt).</li>
            <li><strong>Business Profile Data:</strong> Business name, category, operational description, and optional support email/phone.</li>
            <li><strong>Voice Profile & Examples:</strong> 3 to 5 example replies entered by you to infer your brand tone.</li>
            <li><strong>Review & Draft Records:</strong> Customer review texts you manually paste and generated reply variations.</li>
            <li><strong>Usage Telemetry:</strong> Atomic monthly generation event counters to enforce quota boundaries.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base font-semibold text-[#2B2B2B]">3. AI Provider Processing</h2>
          <p className="text-[#7A7468]">
            Review text and business voice instructions are transmitted to our backend and processed through configured AI inference endpoints (such as Google Gemini). Under enterprise and paid API terms, user submission data is not used to train public foundational models.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base font-semibold text-[#2B2B2B]">4. Data Retention and Erasure</h2>
          <p className="text-[#7A7468]">
            You retain full ownership of your data. You may edit or delete business details, voice examples, or individual draft records at any time. When you trigger "Delete Account" from Settings, all associated database records are immediately and permanently erased.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base font-semibold text-[#2B2B2B]">5. Contact Information</h2>
          <p className="text-[#7A7468]">
            For questions regarding privacy practices, please contact <a href="mailto:privacy@replymuse.com" className="text-[#1F7A5C] underline">privacy@replymuse.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
};
