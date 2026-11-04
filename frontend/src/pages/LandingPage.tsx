import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { SparkleIcon } from '../components/common/SparkleIcon';
import { WaveDivider } from '../components/common/WaveDivider';
import { ReviewCard } from '../components/common/ReviewCard';
import { ReplyCard } from '../components/common/ReplyCard';
import { ReviewReplyConnector } from '../components/common/ReviewReplyConnector';

export const LandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'positive' | 'negative'>('positive');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'How does ReplyMuse learn my business voice?',
      a: 'During setup, you paste 3 to 5 replies you have written in the past. ReplyMuse analyzes your natural tone, vocabulary, formality, and sign-offs to create a reusable style profile. It does not train a public model on your private data.',
    },
    {
      q: 'Does ReplyMuse post replies automatically to Google?',
      a: 'No. ReplyMuse is a specialized writing studio designed to keep you in full control. You paste in customer reviews, review and fine-tune the drafted response, and copy it back to your Google Business Profile in one click.',
    },
    {
      q: 'How does ReplyMuse handle angry or unfair negative reviews?',
      a: 'Negative reviews receive calm, empathetic, non-defensive replies that de-escalate tension publicly and invite the reviewer to connect privately using your verified contact phone or email. ReplyMuse never invents fake contact details or argues with customers.',
    },
    {
      q: 'What is included in the free tier?',
      a: 'Every registered account receives 10 free AI generations per month, one business voice profile, full versioned draft history, editing tools, and one-click copy to clipboard.',
    },
    {
      q: 'Is ReplyMuse available for cafes, restaurants and shops in India?',
      a: 'Yes. ReplyMuse is tailored for local independent businesses across India, supporting English, Hindi, and Hinglish phrasing.',
    },
  ];

  return (
    <div className="-mt-8 pb-16">
      {/* Hero Section with Illustrated Café Background */}
      <section
        role="region"
        aria-label="Reply to every Google review in seconds hero illustration"
        className="hero-wave-blend relative w-screen bg-[#F7F3E8] overflow-hidden"
        style={{
          width: '100vw',
          marginLeft: 'calc(50% - 50vw)',
          marginRight: 'calc(50% - 50vw)',
        }}
      >
        {/* Desktop Layout (>= 900px): Full-bleed background image with 30% / 1fr / 26% grid */}
        <div
          className="hidden min-[900px]:grid grid-cols-[30%_1fr_26%] items-center w-full relative"
          style={{
            backgroundImage: `url('/images/hero-cafe-reply.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            aspectRatio: '1644 / 957',
            minHeight: '560px',
            maxHeight: '92vh',
          }}
        >
          {/* Left Column (0-30%): Cafe storefront area */}
          <div aria-hidden="true" className="h-full w-full pointer-events-none" />

          {/* Middle Column (1fr / 30%-74%): Headline, Subtext, Badge, Buttons with soft radial cream glow */}
          <div className="relative z-10 py-8 px-4 sm:px-6 text-center flex flex-col items-center justify-center space-y-5">
            {/* Soft radial cream glow behind the text for readability */}
            <div
              className="absolute inset-0 -z-10 rounded-full blur-2xl pointer-events-none scale-110"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(247, 243, 232, 0.95) 0%, rgba(247, 243, 232, 0.75) 55%, rgba(247, 243, 232, 0) 80%)',
              }}
              aria-hidden="true"
            />

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/90 backdrop-blur-xs border border-[#E5DFD3] rounded-full text-xs font-medium text-[#7A7468] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#EE6A4B]" />
              <span>Crafted for cafes & local business owners</span>
              <SparkleIcon size={12} className="text-[#EE6A4B]" />
            </div>

            <h1
              className="font-serif font-bold tracking-tight text-[#2B2B2B]"
              style={{
                fontSize: 'clamp(2rem, 3.2vw, 3.2rem)',
                lineHeight: 1.1,
                textWrap: 'balance',
              }}
            >
              Reply to every Google review{' '}
              <span
                className="inline-block whitespace-nowrap text-[#1F7A5C] underline decoration-[#EE6A4B]/80 decoration-wavy"
                style={{
                  whiteSpace: 'nowrap',
                  display: 'inline-block',
                }}
              >
                in seconds
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#2B2B2B]/90 font-sans font-normal leading-relaxed max-w-[440px] mx-auto">
              AI-written replies that sound like you. Turn customer feedback into repeat guests while preserving your authentic voice.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link to="/register">
                <Button
                  variant="coral"
                  size="lg"
                  icon={<ArrowRight className="w-4 h-4 text-white" />}
                  className="bg-[#EE6A4B] text-white hover:bg-[#D95A3D] shadow-sm font-semibold px-6 py-3"
                >
                  Get started
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button
                  variant="secondary"
                  size="lg"
                  className="border border-[#E5DFD3] text-[#2B2B2B] bg-white/95 backdrop-blur-xs hover:bg-[#F7F3E8] shadow-2xs font-medium px-6 py-3"
                >
                  See how it works
                </Button>
              </a>
            </div>
          </div>

          {/* Right Column (74-100% / 26% width): Review cards and decorative lines */}
          <div aria-hidden="true" className="h-full w-full pointer-events-none" />
        </div>

        {/* Stacked Layout Below 900px: Image area on top, text on solid cream panel beneath */}
        <div className="min-[900px]:hidden flex flex-col w-full">
          {/* Top image area: cropped to show cafe storefront & review cards */}
          <div
            className="w-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('/images/hero-cafe-reply.png')`,
              aspectRatio: '1644 / 957',
              minHeight: '240px',
              maxHeight: '420px',
            }}
            aria-hidden="true"
          />

          {/* Bottom solid cream panel: nothing overlaps the artwork */}
          <div className="bg-[#F7F3E8] px-6 py-8 sm:py-10 text-center flex flex-col items-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#E5DFD3] rounded-full text-xs font-medium text-[#7A7468] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#EE6A4B]" />
              <span>Crafted for cafes & local business owners</span>
              <SparkleIcon size={12} className="text-[#EE6A4B]" />
            </div>

            <h1
              className="font-serif font-bold tracking-tight text-[#2B2B2B]"
              style={{
                fontSize: 'clamp(1.85rem, 5vw, 2.6rem)',
                lineHeight: 1.15,
                textWrap: 'balance',
              }}
            >
              Reply to every Google review{' '}
              <span
                className="inline-block whitespace-nowrap text-[#1F7A5C] underline decoration-[#EE6A4B]/80 decoration-wavy"
                style={{
                  whiteSpace: 'nowrap',
                  display: 'inline-block',
                }}
              >
                in seconds
              </span>
            </h1>

            <p className="text-sm text-[#2B2B2B]/90 font-sans font-normal leading-relaxed max-w-[440px] mx-auto">
              AI-written replies that sound like you. Turn customer feedback into repeat guests while preserving your authentic voice.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full sm:w-auto">
              <Link to="/register" className="w-full sm:w-auto">
                <Button
                  variant="coral"
                  size="lg"
                  icon={<ArrowRight className="w-4 h-4 text-white" />}
                  className="w-full sm:w-auto bg-[#EE6A4B] text-white hover:bg-[#D95A3D] shadow-sm font-semibold px-6 py-3"
                >
                  Get started
                </Button>
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto border border-[#E5DFD3] text-[#2B2B2B] bg-white hover:bg-[#F7F3E8] shadow-2xs font-medium px-6 py-3"
                >
                  See how it works
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Wave Overlay at Bottom of Hero: Cream (#F7F3E8), blends smoothly into page background */}
        <div
          className="absolute bottom-[-1px] left-0 right-0 w-full overflow-hidden pointer-events-none z-20"
          style={{ height: 'clamp(48px, 7vw, 110px)' }}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-full h-full"
            style={{ display: 'block' }}
          >
            <path
              d="M0,50 C320,95 620,15 940,60 C1200,95 1340,35 1440,45 L1440,120 L0,120 Z"
              fill="#F7F3E8"
            />
          </svg>
        </div>
      </section>

      {/* Main Content Sections */}
      <div
        className="space-y-16 sm:space-y-20"
        style={{ paddingTop: 'clamp(24px, 4vw, 56px)' }}
      >
        {/* Live Studio Preview Showcase */}
        <section
          id="features"
          className="max-w-4xl mx-auto space-y-6 scroll-mt-[88px]"
          style={{ scrollMarginTop: '88px' }}
        >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#EE6A4B]">
            <SparkleIcon size={12} className="text-[#EE6A4B]" />
            <span>Studio In Action</span>
            <SparkleIcon size={12} className="text-[#EE6A4B]" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#2B2B2B]">
            From Customer Review to Thoughtful Reply
          </h2>
          <p className="text-xs sm:text-sm text-[#7A7468]">
            See how ReplyMuse transforms raw Google feedback into personalized brand replies
          </p>
        </div>

        {/* Paired ReviewCard -> ReviewReplyConnector -> ReplyCard */}
        <div className="bg-[#FAF8F5] border border-[#E5DFD3] rounded-3xl p-6 sm:p-8 space-y-2 shadow-soft">
          <ReviewCard
            reviewerName="Priya K."
            rating={5}
            date="2 days ago"
            reviewText="Their cardamom pistachio croissants are the best in Bangalore! Friendly staff and lovely natural lighting. Will be visiting every weekend."
          />

          <ReviewReplyConnector label="AI reply crafted in your voice" />

          <ReplyCard
            title="Draft in Your Style (Artisanal Café Voice)"
            replyText={`Hi Priya,\n\nThank you so much for the wonderful review! Our bakers put tremendous love into laminating the cardamom pistachio croissants fresh every dawn. We are thrilled you enjoyed the morning light in our courtyard, and we can’t wait to welcome you back this weekend!\n\nWarmly,\nThe Oven & Bean Team`}
          />
        </div>
      </section>

      {/* The Problem Section */}
      <section className="max-w-4xl mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white border border-[#E5DFD3] rounded-3xl p-8 sm:p-10 shadow-soft">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#EE6A4B]">The Problem</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2B2B] tracking-tight mt-1">
              Why business owners stop responding to reviews
            </h2>
          </div>
          <div className="space-y-4 text-sm text-[#7A7468] leading-relaxed font-sans">
            <p>
              You spend long hours running your business. When reviews arrive on Google, crafting thoughtful replies takes energy. But silence signals neglect to prospective customers checking your listing.
            </p>
            <p>
              Standard AI chatbots sound robotic, cold, and fake. ReplyMuse solves this by learning from your authentic words so every generated reply sounds naturally like you.
            </p>
          </div>
        </div>
      </section>

      {/* 3-Step Workflow */}
      <section
        id="how-it-works"
        className="max-w-5xl mx-auto space-y-10 scroll-mt-[88px]"
        style={{ scrollMarginTop: '88px' }}
      >
        <div className="text-center space-y-2">
          <h2 className="font-serif text-3xl font-bold text-[#2B2B2B]">
            Three simple steps. Complete peace of mind.
          </h2>
          <p className="text-xs sm:text-sm text-[#7A7468]">
            No complicated setup. No automated posting risks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 sm:p-7 space-y-3 shadow-soft hover:shadow-soft-lg transition-all">
            <div className="w-9 h-9 rounded-xl bg-[#1F7A5C] text-white flex items-center justify-center font-serif text-sm font-semibold shadow-xs">
              1
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2B2B2B]">
              Teach your tone
            </h3>
            <p className="text-xs text-[#7A7468] leading-relaxed font-sans">
              Paste 3 to 5 real previous replies. ReplyMuse extracts your unique warmth, preferred greetings, and sign-offs into a reusable voice profile.
            </p>
          </div>

          <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 sm:p-7 space-y-3 shadow-soft hover:shadow-soft-lg transition-all">
            <div className="w-9 h-9 rounded-xl bg-[#EE6A4B] text-white flex items-center justify-center font-serif text-sm font-semibold shadow-xs">
              2
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2B2B2B]">
              Paste a review
            </h3>
            <p className="text-xs text-[#7A7468] leading-relaxed font-sans">
              Whenever a customer leaves feedback on Google, copy their text and drop it into ReplyMuse with their optional star rating.
            </p>
          </div>

          <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 sm:p-7 space-y-3 shadow-soft hover:shadow-soft-lg transition-all">
            <div className="w-9 h-9 rounded-xl bg-[#1F7A5C] text-white flex items-center justify-center font-serif text-sm font-semibold shadow-xs">
              3
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2B2B2B]">
              Copy your reply
            </h3>
            <p className="text-xs text-[#7A7468] leading-relaxed font-sans">
              Generate a tailored response in seconds. Fine-tune any word if needed, click copy, and paste directly back to Google.
            </p>
          </div>
        </div>
      </section>

      {/* Decorative Wave Divider */}
      <WaveDivider color="coral" height={18} />

      {/* Positive & Negative Example Showcase */}
      <section className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-3xl font-bold text-[#2B2B2B]">
            Handles praise with warmth. Defuses complaints with grace.
          </h2>
          <p className="text-xs sm:text-sm text-[#7A7468]">
            Inspect real response strategies crafted for local cafes, clinics, and businesses
          </p>
        </div>

        <div className="flex justify-center gap-2">
          <button
            onClick={() => setActiveTab('positive')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'positive'
                ? 'bg-[#1F7A5C] text-white shadow-xs'
                : 'bg-white border border-[#E5DFD3] text-[#7A7468] hover:text-[#2B2B2B]'
            }`}
          >
            Positive 5-Star Praise
          </button>
          <button
            onClick={() => setActiveTab('negative')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'negative'
                ? 'bg-[#EE6A4B] text-white shadow-xs'
                : 'bg-white border border-[#E5DFD3] text-[#7A7468] hover:text-[#2B2B2B]'
            }`}
          >
            Difficult 1-Star Complaint
          </button>
        </div>

        <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 sm:p-8 space-y-3 shadow-soft">
          {activeTab === 'positive' ? (
            <div className="space-y-3 animate-in fade-in">
              <ReviewCard
                reviewerName="Mrs. Nair"
                rating={5}
                date="Yesterday"
                reviewText="Dr. Verma was remarkably patient with my daughter's braces checkup. Clean clinic and zero wait time!"
              />
              <ReviewReplyConnector label="ReplyMuse Strategy: Genuine gratitude without sales pitches" />
              <ReplyCard
                title="Drafted Reply (Dental Clinic Voice)"
                replyText={`Dear Mrs. Nair,\n\nThank you so much for your kind words! We understand visiting the dentist can feel daunting for younger patients, and our whole team is delighted your daughter felt comfortable throughout her braces adjustment. We look forward to seeing her at her next routine checkup!\n\nWarm regards,\nDr. Verma & The Smile Craft Team`}
              />
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in">
              <ReviewCard
                reviewerName="Arvind"
                rating={1}
                date="3 days ago"
                reviewText="Waited 45 minutes for our main course last night and when it arrived, the soup was lukewarm. Disappointed."
              />
              <ReviewReplyConnector label="ReplyMuse Strategy: Calm, non-defensive acknowledgment with private resolution" />
              <ReplyCard
                title="Drafted Reply (Heritage Bistro Voice)"
                replyText={`Hello Arvind,\n\nThank you for sharing your candid feedback. We are genuinely sorry to hear about the kitchen delay and the temperature of your soup during your dinner with us. We hold ourselves to high hospitality standards and clearly fell short of your expectations.\n\nPlease reach out directly to our management team at care@heritagebistro.in or +91 98765 43210 so we can listen and make this right for you. We truly value your patronage and the opportunity to improve.\n\nWarmly,\nThe Heritage Bistro Team`}
              />
            </div>
          )}
        </div>
      </section>

      {/* Target Business Categories */}
      <section className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-3xl font-bold text-[#2B2B2B]">
            Built for local businesses of all categories
          </h2>
          <p className="text-xs sm:text-sm text-[#7A7468]">
            Adapts effortlessly to your industry's standards
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            'Cafés & Bakeries',
            'Dentists & Clinics',
            'Salons & Spas',
            'Fitness Studios & Gyms',
            'Retail & Specialty Shops',
            'Local Trades & Services',
            'Boutique Stays & Hotels',
            'Independent Restaurants',
          ].map((cat) => (
            <div
              key={cat}
              className="p-4 bg-white border border-[#E5DFD3] rounded-2xl text-center text-xs font-semibold text-[#2B2B2B] shadow-2xs hover:border-[#1F7A5C] hover:bg-[#FAF8F5] transition-all"
            >
              {cat}
            </div>
          ))}
        </div>
      </section>

      {/* Transparent Free Plan */}
      <section
        id="pricing"
        className="max-w-3xl mx-auto bg-white border border-[#E5DFD3] rounded-3xl p-8 sm:p-10 space-y-6 shadow-soft scroll-mt-[88px]"
        style={{ scrollMarginTop: '88px' }}
      >
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#EE6A4B]">
            Simple & Transparent
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#2B2B2B]">
            Start Free. No credit card required.
          </h2>
          <p className="text-xs sm:text-sm text-[#7A7468]">
            Generous starter tier with monthly free allowances
          </p>
        </div>

        <div className="p-6 bg-[#FAF8F5] rounded-2xl border border-[#E5DFD3] space-y-4">
          <div className="flex items-baseline justify-between border-b border-[#E5DFD3] pb-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#2B2B2B]">Free Starter</h3>
              <p className="text-xs text-[#7A7468]">For local business owners starting out</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-serif font-bold text-[#2B2B2B]">₹0</span>
              <span className="text-xs text-[#7A7468]"> / month</span>
            </div>
          </div>

          <ul className="space-y-2 text-xs text-[#2B2B2B]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1F7A5C] shrink-0" />
              <span><strong>10 AI review generations</strong> per calendar month</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1F7A5C] shrink-0" />
              <span><strong>1 tailored business voice profile</strong> learned from your previous replies</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1F7A5C] shrink-0" />
              <span><strong>Full reply history & search</strong> to easily retrieve any past drafts</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1F7A5C] shrink-0" />
              <span><strong>Versioned draft regenerations</strong> without losing earlier edits</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1F7A5C] shrink-0" />
              <span><strong>One-click copy to clipboard</strong> with fallback support</span>
            </li>
          </ul>

          <div className="pt-2">
            <Link to="/register" className="w-full block">
              <Button variant="coral" size="lg" className="w-full bg-[#EE6A4B] text-white hover:bg-[#D95A3D] shadow-sm font-semibold">
                Claim your free account →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section
        id="faq"
        className="max-w-3xl mx-auto space-y-6 scroll-mt-[88px]"
        style={{ scrollMarginTop: '88px' }}
      >
        <div className="text-center space-y-2">
          <h2 className="font-serif text-3xl font-bold text-[#2B2B2B]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#7A7468]">
            Clear, honest answers about ReplyMuse
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E5DFD3] rounded-2xl overflow-hidden shadow-2xs"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-[#2B2B2B] hover:bg-[#FAF8F5] transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-[#7A7468] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#7A7468] shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-4 sm:px-5 pb-4 text-xs sm:text-sm text-[#7A7468] leading-relaxed border-t border-[#E5DFD3] pt-3 font-sans">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-4xl mx-auto text-center bg-gradient-to-r from-[#DCEBE3]/60 via-[#F7F3E8] to-[#DCEBE3]/60 border border-[#C2DDD0] rounded-3xl p-10 space-y-4 shadow-soft">
        <div className="w-10 h-10 rounded-full bg-[#1F7A5C] text-white flex items-center justify-center mx-auto shadow-xs">
          <SparkleIcon size={18} className="text-white" />
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B2B2B]">
          Never write a generic reply again.
        </h2>
        <p className="text-xs sm:text-sm text-[#7A7468] max-w-md mx-auto font-sans leading-relaxed">
          Set up your voice profile in 3 minutes. Start turning reviews into lasting customer relationships.
        </p>
        <div className="pt-2">
          <Link to="/register">
            <Button
              variant="coral"
              size="lg"
              icon={<SparkleIcon size={14} className="text-white" />}
              className="bg-[#EE6A4B] text-white hover:bg-[#D95A3D] shadow-sm font-semibold px-8 py-3"
            >
              Get started free
            </Button>
          </Link>
        </div>
      </section>
      </div>
    </div>
  );
};
