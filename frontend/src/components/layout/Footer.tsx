import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E5DFD3] bg-white mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Manifesto */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="inline-block" aria-label="ReplyMuse Home">
              <BrandLogo size="sm" showTagline={false} />
            </Link>
            <p className="text-xs text-[#7A7468] leading-relaxed max-w-md">
              Every reply, in your voice. An AI studio crafted for cafes, restaurants, clinics, salons, and local shops. Never generic. Never robotic.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#7A7468]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1F7A5C]" />
              <span>Manual copy-paste workflow. No unsolicited Google API access required.</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#2B2B2B] mb-3">
              Studio
            </h4>
            <ul className="space-y-2 text-xs text-[#7A7468]">
              <li>
                <Link to="/composer" className="hover:text-[#1F7A5C] transition-colors">
                  Review Composer
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-[#1F7A5C] transition-colors">
                  Review History
                </Link>
              </li>
              <li>
                <Link to="/style" className="hover:text-[#1F7A5C] transition-colors">
                  Voice Profile
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#1F7A5C] transition-colors">
                  Usage & Allowance
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#2B2B2B] mb-3">
              Trust & Privacy
            </h4>
            <ul className="space-y-2 text-xs text-[#7A7468]">
              <li>
                <Link to="/privacy" className="hover:text-[#1F7A5C] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#1F7A5C] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <span className="text-[#7A7468]">
                  Support: <a href="mailto:care@replymuse.com" className="hover:text-[#1F7A5C] hover:underline">care@replymuse.com</a>
                </span>
              </li>
              <li className="pt-1 text-[11px] text-[#7A7468]">
                Crafted for local business owners with genuine care.
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[#E5DFD3] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A7468]">
          <p>© {new Date().getFullYear()} ReplyMuse. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Built for independent businesses in India</span>
            <Heart className="w-3.5 h-3.5 text-[#EE6A4B] fill-[#EE6A4B] inline" />
          </p>
        </div>
      </div>
    </footer>
  );
};
