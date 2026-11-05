import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  PenTool,
  History,
  Sliders,
  Store,
  Settings as SettingsIcon,
  Home,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { reviewsApi } from '../../services/reviews';
import { useQuery } from '@tanstack/react-query';
import { SparkleIcon } from '../common/SparkleIcon';
import { BrandLogo } from '../common/BrandLogo';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll detection: add shadow after scrolling 20px
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Fetch usage quota for navbar pill when user is logged in
  const { data: usage } = useQuery({
    queryKey: ['usage'],
    queryFn: () => reviewsApi.getUsage(),
    enabled: !!user,
    refetchInterval: 60000,
  });

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Home', icon: Home },
    { to: '/composer', label: 'Generate Reply', icon: PenTool },
    { to: '/history', label: 'Review History', icon: History },
    { to: '/style', label: 'Your Style', icon: Sliders },
    { to: '/business', label: 'Business Profile', icon: Store },
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
    ...(user?.is_admin ? [{ to: '/admin', label: 'Admin Console', icon: ShieldCheck }] : []),
  ];

  const landingLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  // Filter landing links: hide if section does not exist on page
  const [visibleLandingLinks, setVisibleLandingLinks] = useState(landingLinks);

  useEffect(() => {
    if (location.pathname === '/') {
      const filtered = landingLinks.filter((item) => {
        return document.querySelector(item.href) !== null;
      });
      if (filtered.length > 0) {
        setVisibleLandingLinks(filtered);
      }
    }
  }, [location.pathname]);

  // Smooth-scroll anchor click handler
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', href);
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 border-b border-[#1F7A5C]/12 ${
        scrolled ? 'shadow-[0_4px_24px_rgba(43,43,43,0.06)]' : 'shadow-none'
      }`}
      style={{
        backgroundColor: 'rgba(247, 243, 232, 0.82)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4 relative">
        {/* Brand Logo */}
        <Link
          to={user ? '/dashboard' : '/'}
          className="shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1F7A5C] focus-visible:ring-offset-2 rounded-xl"
          aria-label="ReplyMuse Home"
          onClick={() => {
            if (location.pathname === '/') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <BrandLogo size="md" />
        </Link>

        {/* Unauthenticated / Landing Page Navigation */}
        {!user ? (
          <>
            {/* Centered Desktop Navigation Links (Features, How it works, Pricing, FAQ) */}
            <nav
              aria-label="Landing page sections"
              className="hidden min-[900px]:flex items-center gap-7 lg:gap-8 absolute left-1/2 -translate-x-1/2"
            >
              {visibleLandingLinks.map((item) => (
                <a
                  key={item.label}
                  href={location.pathname === '/' ? item.href : `/${item.href}`}
                  onClick={(e) => handleAnchorClick(e, item.href)}
                  className="relative text-sm font-medium text-[#2B2B2B] hover:text-[#1F7A5C] transition-colors py-1 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1F7A5C] focus-visible:ring-offset-2 rounded-sm"
                >
                  <span>{item.label}</span>
                  {/* Coral Underline Hover Animation */}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#EE6A4B] rounded-full transition-all duration-300 ease-out group-hover:w-full" />
                </a>
              ))}
            </nav>

            {/* Right Buttons: Sign In text link + Coral Pill Button */}
            <div className="hidden min-[900px]:flex items-center gap-5 whitespace-nowrap shrink-0">
              <Link
                to="/login"
                className="text-sm font-medium text-[#2B2B2B] hover:text-[#1F7A5C] transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1F7A5C] focus-visible:ring-offset-2 rounded-sm"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                style={{ padding: '0.55rem 1.1rem' }}
                className="text-xs sm:text-sm font-semibold text-white bg-[#EE6A4B] hover:bg-[#D95A3D] rounded-full transition-all shadow-xs hover:shadow-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#EE6A4B] focus-visible:ring-offset-2"
              >
                Get Started Free
              </Link>
            </div>
          </>
        ) : (
          /* Authenticated Dashboard Navigation */
          <nav className="hidden min-[1100px]:flex items-center gap-1.5 whitespace-nowrap shrink-0">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.to ||
                (item.to === '/dashboard' && location.pathname === '/');
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1F7A5C] ${
                    isActive
                      ? 'bg-[#1F7A5C] text-white shadow-xs font-semibold'
                      : 'text-[#2B2B2B] hover:text-[#1F7A5C] hover:bg-[#1F7A5C]/8'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-white' : 'text-[#7A7468]'
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Authenticated User Status & Logout */}
        {user && (
          <div className="hidden min-[1100px]:flex items-center gap-3 shrink-0 whitespace-nowrap">
            {usage && (
              <div
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-white border border-[#E5DFD3] rounded-full shadow-xs whitespace-nowrap"
                title={`${usage.remaining} free generations remaining until ${usage.reset_date.slice(
                  0,
                  10
                )}`}
              >
                <SparkleIcon size={12} className="text-[#EE6A4B]" />
                <span className="text-[#7A7468]">Replies:</span>
                <span className="font-semibold text-[#2B2B2B]">
                  {usage.used} / {usage.monthly_limit}
                </span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-xl text-[#7A7468] hover:text-[#D9381E] hover:bg-[#1F7A5C]/8 border border-transparent hover:border-[#1F7A5C]/15 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#D9381E]"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Mobile Menu Toggle Button (Visible below 900px for landing, 1100px for auth) */}
        <div className={`flex ${user ? 'min-[1100px]:hidden' : 'min-[900px]:hidden'} items-center gap-2`}>
          {user && usage && (
            <span className="text-[11px] font-sans font-medium px-2 py-0.5 bg-white border border-[#E5DFD3] rounded-full text-[#2B2B2B]">
              {usage.used}/{usage.monthly_limit}
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#2B2B2B] hover:bg-[#1F7A5C]/10 rounded-xl border border-[#1F7A5C]/15 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1F7A5C]"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Panel */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className={`${
            user ? 'min-[1100px]:hidden' : 'min-[900px]:hidden'
          } border-b border-[#1F7A5C]/12 px-6 py-5 shadow-lg transition-all animate-in fade-in slide-in-from-top-2`}
          style={{
            backgroundColor: 'rgba(247, 243, 232, 0.97)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          {user ? (
            <div className="space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium ${
                      isActive
                        ? 'bg-[#1F7A5C] text-white font-semibold'
                        : 'text-[#2B2B2B] hover:bg-[#1F7A5C]/8'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className="pt-2 border-t border-[#1F7A5C]/12">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm text-[#D9381E] font-medium hover:bg-[#FDF0ED] rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-3">
              {/* Stacked Navigation Links */}
              {visibleLandingLinks.map((item) => (
                <a
                  key={item.label}
                  href={location.pathname === '/' ? item.href : `/${item.href}`}
                  onClick={(e) => handleAnchorClick(e, item.href)}
                  className="text-base font-medium text-[#2B2B2B] hover:text-[#1F7A5C] py-2 px-1 transition-colors border-b border-[#1F7A5C]/8 flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  <span className="text-xs text-[#7A7468]">→</span>
                </a>
              ))}

              {/* Stacked Sign In & Get Started Free Buttons */}
              <div className="pt-3 flex flex-col gap-2.5">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-medium text-[#2B2B2B] hover:text-[#1F7A5C] hover:bg-[#1F7A5C]/8 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ padding: '0.65rem 1.2rem' }}
                  className="w-full text-center text-sm font-semibold text-white bg-[#EE6A4B] hover:bg-[#D95A3D] rounded-full transition-colors shadow-xs"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
