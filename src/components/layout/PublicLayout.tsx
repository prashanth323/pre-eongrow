import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Palette,
  Rocket,
  Building2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import type { DivisionSlug, ViewState } from '../../types/app.types';
import { Button } from '../ui/Button';

interface PublicLayoutProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onSignIn: () => void;
  onGetStarted: () => void;
  onExploreDivision?: (slug: DivisionSlug) => void;
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  currentView,
  onNavigate,
  onSignIn,
  onGetStarted,
  onExploreDivision: _onExploreDivision,
  children,
}) => {
  const isLanding = currentView === 'landing';
  const isComingSoon = currentView === 'coming-soon-page';
  const isDarkCanvas = isLanding || isComingSoon;
  const [isInHero, setIsInHero] = useState<boolean>(isLanding);
  const [pricingMenuOpen, setPricingMenuOpen] = useState(false);
  const pricingMenuTimeoutRef = useRef<any>(null);

  // Instant scroll-to-top on any link click
  const handleNav = (view: ViewState) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    onNavigate(view);
  };

  // Monitor scroll to switch nav color to white while in the hero section
  useEffect(() => {
    if (!isLanding) {
      setIsInHero(false);
      return;
    }

    const handleScroll = () => {
      // The hero section occupies full viewport height
      const heroThreshold = window.innerHeight * 0.75;
      setIsInHero(window.scrollY < heroThreshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLanding]);

  const handlePricingMouseEnter = () => {
    if (pricingMenuTimeoutRef.current) clearTimeout(pricingMenuTimeoutRef.current);
    setPricingMenuOpen(true);
  };

  const handlePricingMouseLeave = () => {
    pricingMenuTimeoutRef.current = setTimeout(() => {
      setPricingMenuOpen(false);
    }, 280);
  };

  return (
    <div className={`min-h-screen ${isDarkCanvas ? 'bg-[#07040F] text-white' : 'bg-[#F5F6F5] text-[#171C19]'} font-sans flex flex-col justify-between selection:bg-black/10`}>
      {/* 1. iOS Top-Docked Curved Notch / Dock Header Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 px-2 sm:px-4 w-full flex justify-center pointer-events-none transition-all duration-300">
        <header
          className={`pointer-events-auto relative w-full max-w-4xl lg:max-w-5xl rounded-b-[28px] border-x border-b px-3.5 sm:px-6 h-14 sm:h-15 flex items-center justify-between transition-all duration-300 ${
            isInHero
              ? 'bg-white/95 backdrop-blur-2xl border-black/10 shadow-[0_16px_40px_rgba(0,0,0,0.18)] text-black'
              : 'bg-black/85 backdrop-blur-2xl border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.55),0_1px_0_rgba(255,255,255,0.1)_inset] text-white'
          }`}
        >
          {/* Top Left Concave Shoulder / Notch Ear */}
          <svg
            className={`w-4 h-4 absolute top-0 -left-4 pointer-events-none transition-colors duration-300 ${
              isInHero ? 'text-white/95 fill-current' : 'text-black/85 fill-current'
            }`}
            viewBox="0 0 16 16"
          >
            <path d="M 0 0 C 8 0, 16 4, 16 16 L 16 0 Z" />
          </svg>
          {/* Top Right Concave Shoulder / Notch Ear */}
          <svg
            className={`w-4 h-4 absolute top-0 -right-4 pointer-events-none transition-colors duration-300 ${
              isInHero ? 'text-white/95 fill-current' : 'text-black/85 fill-current'
            }`}
            viewBox="0 0 16 16"
          >
            <path d="M 16 0 C 8 0, 0 4, 0 16 L 0 0 Z" />
          </svg>

          {/* Logo */}
          <div
            onClick={() => handleNav('landing')}
            className="flex items-center gap-2 cursor-pointer apple-press group"
          >
            {isInHero ? (
              <img
                src="/applogo.png"
                alt="eongrow"
                className="h-6 sm:h-7 w-auto object-contain transition-transform group-hover:scale-105"
              />
            ) : (
              <img
                src="/whiteapplogo.png"
                alt="eongrow"
                className="h-6 sm:h-7 w-auto object-contain transition-transform group-hover:scale-105"
              />
            )}
          </div>

          {/* Top Nav: Dedicated Separate Pages + All Pricings Nav Popover */}
          <nav
            className={`hidden md:flex items-center gap-1 text-xs font-medium transition-colors ${
              isInHero ? 'text-black/75' : 'text-white/80'
            }`}
          >
            <button
              onClick={() => handleNav('divisions-page')}
              className={`px-3 py-1.5 rounded-full transition-all apple-press cursor-pointer ${
                currentView === 'divisions-page' || currentView.startsWith('network-')
                  ? isInHero
                    ? 'bg-black text-white font-semibold shadow-xs'
                    : 'bg-white/20 text-white font-semibold shadow-xs'
                  : isInHero
                  ? 'hover:bg-black/[0.06] hover:text-black'
                  : 'hover:bg-white/10 hover:text-white'
              }`}
            >
              7 Networks
            </button>

            {/* Pricing Nav with Minimal Apple Dropdown */}
            <div
              className="relative"
              onMouseEnter={handlePricingMouseEnter}
              onMouseLeave={handlePricingMouseLeave}
            >
              <button
                onClick={() => {
                  setPricingMenuOpen(false);
                  handleNav('pricing-page');
                }}
                className={`px-3 py-1.5 rounded-full transition-all apple-press cursor-pointer flex items-center gap-1 ${
                  currentView === 'pricing-page'
                    ? isInHero
                      ? 'bg-black text-white font-semibold shadow-xs'
                      : 'bg-white/20 text-white font-semibold shadow-xs'
                    : isInHero
                    ? 'hover:bg-black/[0.06] hover:text-black'
                    : 'hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>Pricing</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${pricingMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Glass Pricing Dropdown Showing All 7 Networks */}
              {pricingMenuOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[340px] sm:w-[410px] z-50 pointer-events-auto">
                  <div
                    className={`rounded-2xl p-2.5 shadow-[0_20px_48px_rgba(0,0,0,0.22)] backdrop-blur-2xl border transition-all animate-in fade-in slide-in-from-top-1 duration-150 ${
                      isInHero
                        ? 'bg-white/95 border-black/10 text-[#171C19]'
                        : 'bg-black/90 border-white/15 text-white'
                    }`}
                  >
                    <div className="px-2.5 py-1 mb-1.5 flex items-center justify-between border-b border-black/[0.06]">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                        7 Specialized Network Plans
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Charter Concessions Active
                      </span>
                    </div>

                    <div className="space-y-1">
                      {/* 1. Student Charter */}
                      <button
                        type="button"
                        onClick={() => {
                          setPricingMenuOpen(false);
                          handleNav('pricing-page');
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center justify-between text-left ${
                          isInHero ? 'hover:bg-black/[0.05]' : 'hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-black/[0.05] flex items-center justify-center flex-shrink-0">
                            <GraduationCap className="w-4 h-4 text-emerald-700" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-semibold block truncate">Student Charter</span>
                            <span className="text-[10px] opacity-60 truncate block">100% Free Lifetime · Zero Fees</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-mono">
                          ₹0 Free
                        </span>
                      </button>

                      {/* 2. Career */}
                      <button
                        type="button"
                        onClick={() => {
                          setPricingMenuOpen(false);
                          handleNav('pricing-page');
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center justify-between text-left ${
                          isInHero ? 'hover:bg-black/[0.05]' : 'hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-black/[0.05] flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-semibold block truncate">Career Network</span>
                            <span className="text-[10px] opacity-60 truncate block">Executive Referrals & Roles</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold opacity-85 font-mono">from ₹499/mo</span>
                      </button>

                      {/* 3. Freelancer */}
                      <button
                        type="button"
                        onClick={() => {
                          setPricingMenuOpen(false);
                          handleNav('pricing-page');
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center justify-between text-left ${
                          isInHero ? 'hover:bg-black/[0.05]' : 'hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-black/[0.05] flex items-center justify-center flex-shrink-0">
                            <Palette className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-semibold block truncate">Freelancer Network</span>
                            <span className="text-[10px] opacity-60 truncate block">Client Gigs & Squads</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold opacity-85 font-mono">from ₹999/mo</span>
                      </button>

                      {/* 4. Entrepreneur */}
                      <button
                        type="button"
                        onClick={() => {
                          setPricingMenuOpen(false);
                          handleNav('pricing-page');
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center justify-between text-left ${
                          isInHero ? 'hover:bg-black/[0.05]' : 'hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-black/[0.05] flex items-center justify-center flex-shrink-0">
                            <Rocket className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-semibold block truncate">Entrepreneur Network</span>
                            <span className="text-[10px] opacity-60 truncate block">Co-Founders & Pitch Room</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold opacity-85 font-mono">from ₹1,499/mo</span>
                      </button>

                      {/* 5. Business */}
                      <button
                        type="button"
                        onClick={() => {
                          setPricingMenuOpen(false);
                          handleNav('pricing-page');
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center justify-between text-left ${
                          isInHero ? 'hover:bg-black/[0.05]' : 'hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-black/[0.05] flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-semibold block truncate">Business & MSME</span>
                            <span className="text-[10px] opacity-60 truncate block">B2B Tenders & Procurement</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold opacity-85 font-mono">from ₹2,999/mo</span>
                      </button>

                      {/* 6. Influencer */}
                      <button
                        type="button"
                        onClick={() => {
                          setPricingMenuOpen(false);
                          handleNav('pricing-page');
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center justify-between text-left ${
                          isInHero ? 'hover:bg-black/[0.05]' : 'hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-black/[0.05] flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-semibold block truncate">Creator & Influencer</span>
                            <span className="text-[10px] opacity-60 truncate block">Brand Campaigns & Sponsorships</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold opacity-85 font-mono">from ₹999/mo</span>
                      </button>

                      {/* 7. Investor */}
                      <button
                        type="button"
                        onClick={() => {
                          setPricingMenuOpen(false);
                          handleNav('pricing-page');
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center justify-between text-left ${
                          isInHero ? 'hover:bg-black/[0.05]' : 'hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-black/[0.05] flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-semibold block truncate">Investor & Syndicate</span>
                            <span className="text-[10px] opacity-60 truncate block">Deal Flow & Due Diligence</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold opacity-85 font-mono">from ₹4,999/mo</span>
                      </button>
                    </div>

                    {/* Clean Footer Bar */}
                    <div
                      className={`mt-2 pt-2 border-t px-2 flex items-center justify-between ${
                        isInHero ? 'border-black/[0.06]' : 'border-white/10'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setPricingMenuOpen(false);
                          handleNav('pricing-page');
                        }}
                        className={`text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                          isInHero ? 'text-black hover:opacity-75' : 'text-white hover:opacity-75'
                        }`}
                      >
                        <span>View Complete Multi-Network Pricing Table</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNav('student-charter-page')}
              className={`px-3 py-1.5 rounded-full transition-all apple-press cursor-pointer ${
                currentView === 'student-charter-page'
                  ? isInHero
                    ? 'bg-black text-white font-semibold shadow-xs'
                    : 'bg-white/20 text-white font-semibold shadow-xs'
                  : isInHero
                  ? 'hover:bg-black/[0.06] hover:text-black'
                  : 'hover:bg-white/10 hover:text-white'
              }`}
            >
              Student Guarantee
            </button>
            <button
              onClick={() => handleNav('summits-page')}
              className={`px-3 py-1.5 rounded-full transition-all apple-press cursor-pointer ${
                currentView === 'summits-page'
                  ? isInHero
                    ? 'bg-black text-white font-semibold shadow-xs'
                    : 'bg-white/20 text-white font-semibold shadow-xs'
                  : isInHero
                  ? 'hover:bg-black/[0.06] hover:text-black'
                  : 'hover:bg-white/10 hover:text-white'
              }`}
            >
              Summits & Passes
            </button>
            <button
              onClick={() => handleNav('about-page')}
              className={`px-3 py-1.5 rounded-full transition-all apple-press cursor-pointer ${
                currentView === 'about-page'
                  ? isInHero
                    ? 'bg-black text-white font-semibold shadow-xs'
                    : 'bg-white/20 text-white font-semibold shadow-xs'
                  : isInHero
                  ? 'hover:bg-black/[0.06] hover:text-black'
                  : 'hover:bg-white/10 hover:text-white'
              }`}
            >
              About
            </button>
          </nav>

          {/* Auth CTA Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSignIn}
              className={`apple-press text-xs font-semibold rounded-full px-3 h-8 transition-colors ${
                isInHero
                  ? 'text-black hover:bg-black/[0.06] hover:text-black'
                  : 'text-white hover:bg-white/10 hover:text-white'
              }`}
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onGetStarted}
              className={`apple-press font-semibold text-xs shadow-xs rounded-full px-3.5 h-8 transition-colors ${
                isInHero
                  ? 'bg-black text-white hover:bg-neutral-800'
                  : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              Join Free →
            </Button>
          </div>
        </header>
      </div>

      {/* 2. Main Page Content */}
      <main className="flex-1 w-full">{children}</main>

      {/* 3. Comprehensive, Fully-Functional Footer (hidden on coming soon page) */}
      {!isComingSoon && (
        <footer className="bg-[#171C19] text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10 mt-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-white/10">
            {/* Col 1: Brand & Charter */}
            <div className="space-y-4 md:col-span-2">
              <div
                onClick={() => handleNav('landing')}
                className="flex items-center gap-3 cursor-pointer inline-flex group"
              >
                <img
                  src="/whiteapplogo.png"
                  alt="eongrow"
                  className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105"
                />
              </div>
              <p className="text-xs text-white/60 leading-relaxed max-w-sm">
                India's premier multi-division professional networking community. Uniting students, professionals, creators, founders, business owners, and investors under one verified identity.
              </p>
              <div className="pt-2 flex items-center gap-3 text-xs text-white/60">
                <span className="font-medium text-white/80">
                  100% Free Forever for Students
                </span>
                <span>•</span>
                <span>Encrypted Passes</span>
              </div>
            </div>

            {/* Col 2: 7 Ecosystems (All Functional & Dedicated Pages) */}
            <div>
              <h5 className="font-semibold text-xs tracking-wider uppercase text-white/50 mb-3.5">7 Ecosystems</h5>
              <ul className="space-y-2 text-xs text-white/70">
                <li>
                  <button
                    onClick={() => handleNav('network-student')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Student Network (100% Free)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('network-career')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Career & Professional
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('network-freelancer')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Freelancer & Creator
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('network-entrepreneur')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Entrepreneur & Startup
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('network-business')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Business Owners & MSME
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('network-influencer')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Influencers & Media
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('network-investor')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Investors & Strategic
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Platform Tools (All Functional & Dedicated Pages) */}
            <div>
              <h5 className="font-semibold text-xs tracking-wider uppercase text-white/50 mb-3.5">Platform Tools</h5>
              <ul className="space-y-2 text-xs text-white/70">
                <li>
                  <button
                    onClick={() => handleNav('directory-page')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Verified Member Directory
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('opportunities-page')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Live Opportunities & Gigs
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('summits-page')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Cryptographic Summit Passes
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('wallet-pass-page')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Apple & Google Wallet Sync
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('pricing-page')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Membership Plans & Pricing
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Trust, Architecture & Guides (All Functional) */}
            <div>
              <h5 className="font-semibold text-xs tracking-wider uppercase text-white/50 mb-3.5">Trust & Security</h5>
              <ul className="space-y-2 text-xs text-white/70">
                <li>
                  <button
                    onClick={() => handleNav('security-page')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    PostgreSQL RLS Architecture
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('verification-guide-page')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Trust Verification Protocols
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('student-charter-page')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Student Protection Charter
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('about-page')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    eongrow Mission & Chapters
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Legal & Policy Bar (All Functional) */}
          <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-4">
            <p>© 2026 eongrow. Built on high-performance distributed architecture and Apple Design principles.</p>
            <div className="flex flex-wrap items-center gap-6">
              <button
                onClick={() => handleNav('privacy-page')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => handleNav('terms-page')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
              <button
                onClick={() => handleNav('student-charter-page')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Student Charter
              </button>
              <button
                onClick={() => handleNav('security-page')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Security
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
