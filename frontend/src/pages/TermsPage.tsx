import React from 'react';
import { FileText } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div className="border-b border-[#E5DFD3] pb-4">
        <h1 className="font-serif text-3xl font-bold text-[#2B2B2B] flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#1F7A5C]" />
          <span>Terms of Service</span>
        </h1>
        <p className="text-xs text-[#7A7468] mt-1">Last updated: November 2026</p>
      </div>

      <div className="prose prose-sm max-w-none text-[#2B2B2B] space-y-6 text-xs leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-base font-semibold text-[#2B2B2B]">1. Acceptance of Terms</h2>
          <p className="text-[#7A7468]">
            By creating an account or using ReplyMuse, you agree to these Terms of Service. If you do not agree, please do not use the application.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base font-semibold text-[#2B2B2B]">2. Nature of Service: Human-in-the-Loop Studio</h2>
          <p className="text-[#7A7468]">
            ReplyMuse is an assistive writing tool. ReplyMuse generates proposed reply drafts for you to review, edit, and copy. ReplyMuse does not automatically publish responses to Google or any third-party platform. You remain solely responsible for reviewing any generated response before posting it publicly.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base font-semibold text-[#2B2B2B]">3. Acceptable Use</h2>
          <p className="text-[#7A7468]">
            You agree not to use ReplyMuse to generate defamatory, harassing, deceptive, or fraudulent content. You agree not to attempt prompt-injection attacks or circumvent system quota enforcement.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base font-semibold text-[#2B2B2B]">4. Freemium Quotas & Fair Use</h2>
          <p className="text-[#7A7468]">
            Free tier accounts include an initial allowance of 10 AI generations per calendar month. Quotas reset automatically on the 1st of each calendar month (UTC). Unused generations do not roll over.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base font-semibold text-[#2B2B2B]">5. Disclaimer of Warranties</h2>
          <p className="text-[#7A7468]">
            ReplyMuse is provided "as is" without warranty of any kind. ReplyMuse does not guarantee increased customer ratings, search placement, or financial results.
          </p>
        </section>
      </div>
    </div>
  );
};
