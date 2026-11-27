import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Lock,
  Award,
  HeartHandshake,
  FileCheck,
} from 'lucide-react';
import { ABSTRACT_IMAGES } from '../lib/abstractImages';
import type { ViewState } from '../types/app.types';
import { Button } from '../components/ui/Button';

interface StudentCharterPageProps {
  onNavigate: (view: ViewState) => void;
  onGetStarted: () => void;
}

export const StudentCharterPage: React.FC<StudentCharterPageProps> = ({
  onNavigate,
  onGetStarted,
}) => {
  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Header with Abstract Natural Architecture Texture (No Green Overlay) */}
      <section className="relative overflow-hidden bg-[#121413] text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={ABSTRACT_IMAGES.studentCharter}
            alt="Student Charter Texture"
            className="w-full h-full object-cover opacity-35 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#121413]/70 via-[#121413]/90 to-[#121413]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight tracking-tight leading-tight">
            The eongrow Student Network <br />
            <span className="font-light text-white/90">100% Free Forever Charter</span>
          </h1>
          <p className="text-sm sm:text-base text-white/75 max-w-2xl mx-auto leading-relaxed">
            Our constitutional commitment to undergraduate, postgraduate, and diploma students across India: you will never be charged a subscription fee to connect, learn, and earn.
          </p>
        </div>
      </section>

      {/* 2. The 5 Immutable Student Guarantees */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extralight text-[#171C19] tracking-tight">
            The 5 Immutable Guarantees
          </h2>
          <p className="text-xs sm:text-sm text-[#818A84]">
            Enshrined into our platform code, database rules, and corporate bylaws.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Lock className="w-5 h-5 text-black" />,
              title: 'Zero Subscription Charges Ever',
              desc: 'No trial periods, no hidden renewal traps, and no credit card required at sign up. Student Network access is lifetime free.',
            },
            {
              icon: <Award className="w-5 h-5 text-black" />,
              title: 'Fair-Pay Internships Only',
              desc: 'All internships listed on eongrow must offer fair stipends (up to ₹45,000/mo). We strictly ban zero-pay exploitation listings.',
            },
            {
              icon: <FileCheck className="w-5 h-5 text-black" />,
              title: '₹0 Free Hackathon Passes',
              desc: 'Every eongrow student hackathon and collegiate challenge offers ₹0 admission passes with digital wallet tickets.',
            },
            {
              icon: <HeartHandshake className="w-5 h-5 text-black" />,
              title: 'Pro Bono Senior Mentorship',
              desc: 'Access 1-on-1 resume reviews and career navigation sessions from verified directors, CTOs, and founders without paying mentorship fees.',
            },
            {
              icon: <ShieldCheck className="w-5 h-5 text-black" />,
              title: 'Zero Data Brokering',
              desc: 'Your college credentials, GPA, and personal contact details are never sold to third-party telemarketers or advertising brokers.',
            },
            {
              icon: <GraduationCap className="w-5 h-5 text-black" />,
              title: 'Direct Fast-Track Hiring',
              desc: 'Verified student projects and hackathon code directly fast-track into interviews with tech startups and partner enterprises.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="apple-card p-6 border border-black/[0.06] space-y-3.5 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-black/[0.04] flex items-center justify-center shadow-xs">
                {item.icon}
              </div>
              <h4 className="font-light text-base text-[#171C19] tracking-tight">{item.title}</h4>
              <p className="text-xs text-[#525854] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Sustainable Funding Model Transparency */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-[28px] bg-white border border-black/[0.08] shadow-xs space-y-6">
          <div className="max-w-3xl space-y-3">
            <h3 className="text-2xl sm:text-3xl font-extralight text-[#171C19] tracking-tight">
              How Can eongrow Be 100% Free for Students?
            </h3>
            <p className="text-xs sm:text-sm text-[#525854] leading-relaxed">
              We believe students are the future creators of wealth, not monetization targets. eongrow is sustainably funded through:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-[#FAFCFA] border border-black/[0.06] space-y-2">
              <h5 className="font-normal text-sm text-[#171C19]">Enterprise & B2B Subscriptions</h5>
              <p className="text-xs text-[#525854] leading-relaxed">
                Corporations, MSMEs, and investment funds pay for premium commercial tender tools and syndicate deal flow access.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#FAFCFA] border border-black/[0.06] space-y-2">
              <h5 className="font-normal text-sm text-[#171C19]">Corporate Summit Passes</h5>
              <p className="text-xs text-[#525854] leading-relaxed">
                Enterprises and executive delegates purchase passes for our flagship summits, subsidizing student venue admission.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#FAFCFA] border border-black/[0.06] space-y-2">
              <h5 className="font-normal text-sm text-[#171C19]">Cloud Sponsor Grants</h5>
              <p className="text-xs text-[#525854] leading-relaxed">
                Global cloud infrastructure providers sponsor hackathon prize pools and student compute credits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Action Banner with Abstract Texture */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] bg-[#171C19] text-white p-8 sm:p-12 border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
            <img
              src={ABSTRACT_IMAGES.darkMatrix}
              alt="Texture"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-10 max-w-xl space-y-2">
            <h3 className="text-2xl font-light text-white tracking-tight">Are you a university or college student in India?</h3>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Register with your .edu email or student ID card to activate instant verified access to internships and hackathons.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 flex-shrink-0">
            <Button variant="primary" size="md" onClick={onGetStarted} className="apple-press font-bold text-xs">
              Claim Free Student Account →
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => onNavigate('summits-page')}
              className="apple-press text-xs font-semibold bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Browse ₹0 Hackathons
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
