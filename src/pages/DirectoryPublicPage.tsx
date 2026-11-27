import React from 'react';
import { ShieldCheck, CheckCircle2, Lock, Award } from 'lucide-react';
import type { ViewState } from '../types/app.types';
import { Button } from '../components/ui/Button';
import { PublicLayout } from '../components/layout/PublicLayout';

interface DirectoryPublicPageProps {
  onNavigate: (view: ViewState) => void;
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const DirectoryPublicPage: React.FC<DirectoryPublicPageProps> = ({
  onNavigate,
  onGetStarted,
  onSignIn,
}) => {
  const verifiedTiers = [
    {
      level: 'Tier 1: Contact Verified',
      badge: 'Email & Phone OTP',
      desc: 'Authenticates genuine ownership of contact information. Prevents automated mass bot registration.',
    },
    {
      level: 'Tier 2: Identity Verified',
      badge: 'Govt / College ID',
      desc: 'Aadhaar, Passport, or Student ID card verification performed by our compliance review team.',
    },
    {
      level: 'Tier 3: Professionally Verified',
      badge: 'Portfolio / GitHub / Figma',
      desc: 'Validates proven professional track record, deployed code repositories, or design portfolios.',
    },
    {
      level: 'Tier 4: Business Verified',
      badge: 'MCA / GSTIN Incorporation',
      desc: 'Validates registered MSME, LLP, or Private Limited entity credentials for trusted commercial contracts.',
    },
    {
      level: 'Tier 5: Institutional Partner',
      badge: 'Super Admin / Strategic Lead',
      desc: 'Reserved for verified venture funds, university deans, and keynote summit speakers.',
    },
  ];

  const sampleMembers = [
    {
      name: 'Ananya Rao',
      role: 'Founder & AI Engineer',
      company: 'NeoFlow AI',
      city: 'Hyderabad',
      division: 'Entrepreneur',
      tier: 'Tier 4: Business Verified',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    },
    {
      name: 'Karthik Varma',
      role: 'Product Designer',
      company: 'Studio Kroma',
      city: 'Bangalore',
      division: 'Freelancer',
      tier: 'Tier 3: Professionally Verified',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    },
    {
      name: 'Rohan Mehra',
      role: 'Undergraduate AI Intern',
      company: 'IIT Hyderabad',
      city: 'Hyderabad',
      division: 'Student',
      tier: 'Tier 2: Identity Verified',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80',
    },
    {
      name: 'Priya Sundaram',
      role: 'Managing Partner',
      company: 'Apex Seed Ventures',
      city: 'Mumbai',
      division: 'Investor',
      tier: 'Tier 5: Institutional Partner',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
    },
  ];

  return (
    <PublicLayout
      currentView="directory-page"
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onGetStarted={onGetStarted}
    >
      <div className="space-y-20 py-12">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 pt-16 sm:pt-20">
          <h1 className="text-4xl sm:text-6xl font-extralight text-[#171C19] tracking-[-0.035em] leading-[1.08]">
            Verified Member Directory
          </h1>
          <p className="text-base sm:text-lg text-[#525854] max-w-2xl mx-auto leading-relaxed">
            Every profile on eongrow is authenticated through a 5-tier verification hierarchy. Zero anonymous bots, zero fake recruiters, and zero unverified agencies.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Button
              variant="primary"
              size="lg"
              onClick={onGetStarted}
              className="apple-press font-semibold text-xs h-12 px-8 rounded-full shadow-md"
            >
              Get Verified Profile Free →
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onNavigate('verification-guide-page')}
              className="apple-press text-xs font-semibold h-12 px-7 rounded-full"
            >
              Review SLA & Verification Rules
            </Button>
          </div>
        </section>

        {/* 5-Tier Verification Protocol Overview */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extralight text-[#171C19] tracking-[-0.03em]">
              The 5 Trust Verification Tiers
            </h2>
            <p className="text-xs sm:text-sm text-[#525854]">
              Progressive cryptographic and institutional authentication ensuring high-signal peer networking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {verifiedTiers.map((t, idx) => (
              <div
                key={idx}
                className="apple-card p-6 rounded-[28px] border border-black/[0.08] space-y-3 apple-press"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-black">{t.level}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                    {t.badge}
                  </span>
                </div>
                <p className="text-xs text-[#525854] leading-relaxed pt-1">
                  {t.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Member Spotlights Showcase */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extralight text-[#171C19] tracking-[-0.03em]">
              Peer Spotlight Across India
            </h2>
            <p className="text-xs sm:text-sm text-[#525854]">
              Preview how verified credentials appear inside chapter directories:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sampleMembers.map((m, idx) => (
              <div
                key={idx}
                className="apple-card p-6 rounded-[28px] border border-black/[0.08] space-y-4 apple-press flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-12 h-12 rounded-full object-cover border border-black/[0.08]"
                    />
                    <div>
                      <h4 className="font-semibold text-sm text-[#171C19]">{m.name}</h4>
                      <p className="text-xs text-[#818A84]">{m.city}, India</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[#171C19]">{m.role}</p>
                    <p className="text-xs text-[#525854]">{m.company}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-black/[0.06] space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{m.tier}</span>
                  </div>
                  <span className="inline-block text-[10px] font-semibold text-black bg-black/[0.05] px-2.5 py-0.5 rounded-full capitalize">
                    {m.division} Network
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Join Directory CTA */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="p-8 sm:p-12 rounded-[32px] bg-[#171C19] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 max-w-xl">
              <h3 className="text-2xl sm:text-3xl font-extralight tracking-tight">Claim Your Verified Identity</h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Connect with verified founders, designers, and student leaders across India. 100% free signup.
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={onGetStarted}
              className="bg-white text-black hover:bg-neutral-100 font-bold text-xs h-12 px-8 rounded-full apple-press flex-shrink-0"
            >
              Join Directory Free →
            </Button>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};
