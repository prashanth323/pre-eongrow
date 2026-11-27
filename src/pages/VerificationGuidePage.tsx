import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { ABSTRACT_IMAGES } from '../lib/abstractImages';
import type { ViewState } from '../types/app.types';
import { Button } from '../components/ui/Button';

interface VerificationGuidePageProps {
  onNavigate: (view: ViewState) => void;
  onGetStarted: () => void;
}

export const VerificationGuidePage: React.FC<VerificationGuidePageProps> = ({
  onNavigate,
  onGetStarted,
}) => {
  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Header with Pure Abstract Texture (No Green Overlay) */}
      <section className="relative overflow-hidden bg-[#121413] text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={ABSTRACT_IMAGES.security}
            alt="Verification Architecture Texture"
            className="w-full h-full object-cover opacity-35 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#121413]/70 via-[#121413]/90 to-[#121413]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight tracking-tight leading-tight">
            Trust Verification Guidelines <br />
            <span className="font-light text-white/90">& Tier Hierarchy</span>
          </h1>
          <p className="text-sm sm:text-base text-white/75 max-w-2xl mx-auto leading-relaxed">
            How eongrow eliminates spam, impersonation, and fraudulent job postings through progressive cryptographic and human credential verification.
          </p>
        </div>
      </section>

      {/* 2. The 5 Trust Tiers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extralight text-[#171C19] tracking-tight">
            The 5 Verification Tiers
          </h2>
          <p className="text-xs sm:text-sm text-[#818A84]">
            Every tier unlocks elevated community privileges, direct introduction quotas, and badge visibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              tier: 'Contact Verified',
              badge: 'Email & Phone Confirmed',
              docs: 'OTP verified email (.edu or corporate) and mobile number.',
              unlocks: 'Browse community directory, apply to internships, attend public meetups.',
            },
            {
              tier: 'Identity Verified',
              badge: 'Government / Student ID',
              docs: 'College ID card, Aadhaar, Passport, or Driver License.',
              unlocks: 'Post student hackathons, claim ₹0 admission passes, request direct connections.',
            },
            {
              tier: 'Professionally Verified',
              badge: 'Verified Portfolio / Career',
              docs: 'GitHub repository, Figma design system, or corporate offer letter.',
              unlocks: 'Bid on verified freelance contracts, list creative services, access career referrals.',
            },
            {
              tier: 'Business Verified',
              badge: 'Registered Entity / MSME',
              docs: 'MCA Certificate of Incorporation, GSTIN certificate, or Udyam MSME number.',
              unlocks: 'Post commercial tenders, recruit full-time staff, host B2B vendor exhibitions.',
            },
            {
              tier: 'Special Credentials',
              badge: 'Strategic / Institutional',
              docs: 'SEBI-registered AIF/angel syndicate credentials, or chapter director appointment.',
              unlocks: 'Access private startup deal rooms, co-investment syndicates, executive lounges.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="apple-card p-6 border border-black/[0.06] space-y-3.5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-black/[0.04] flex items-center justify-center text-black shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-black uppercase tracking-wider">{item.badge}</span>
              </div>
              <h4 className="font-light text-base text-[#171C19] tracking-tight">{item.tier}</h4>
              <div className="space-y-2 text-xs text-[#525854] pt-1 border-t border-black/[0.06]">
                <p><strong>Required Proof:</strong> {item.docs}</p>
                <p><strong>Privileges:</strong> {item.unlocks}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Review Process & SLA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-[28px] bg-white border border-black/[0.08] shadow-xs space-y-6">
          <div className="max-w-2xl space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extralight text-[#171C19] tracking-tight">
              24-Hour Review Turnaround
            </h3>
            <p className="text-xs sm:text-sm text-[#525854] leading-relaxed">
              When you upload credentials in Account Settings, our administrative compliance team reviews documents within one business day:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-[#FAFCFA] border border-black/[0.06] space-y-2">
              <span className="font-mono text-xs font-medium text-black">Step 1: Upload</span>
              <p className="text-xs text-[#525854] leading-relaxed">
                Submit your PDF or image via the Account Settings &gt; Trust Verification tab.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#FAFCFA] border border-black/[0.06] space-y-2">
              <span className="font-mono text-xs font-medium text-black">Step 2: Admin Audit</span>
              <p className="text-xs text-[#525854] leading-relaxed">
                Super Admins verify registration numbers against official registrar databases.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#FAFCFA] border border-black/[0.06] space-y-2">
              <span className="font-mono text-xs font-medium text-black">Step 3: Badge Issuance</span>
              <p className="text-xs text-[#525854] leading-relaxed">
                Your profile updates immediately in the global directory and you receive an in-app confirmation toast.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] bg-[#171C19] text-white p-8 sm:p-12 border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative z-10 max-w-xl space-y-2">
            <h3 className="text-2xl font-light text-white tracking-tight">Ready to verify your professional account?</h3>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Sign in or create an account to submit your verification documents today.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 flex-shrink-0">
            <Button variant="primary" size="md" onClick={onGetStarted} className="apple-press font-bold text-xs">
              Get Verified Free →
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => onNavigate('landing')}
              className="apple-press text-xs font-semibold bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Return Home
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
