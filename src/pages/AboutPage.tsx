import React from 'react';
import {
  Compass,
  MapPin,
  Heart,
  Building,
} from 'lucide-react';
import { ABSTRACT_IMAGES } from '../lib/abstractImages';
import type { ViewState } from '../types/app.types';
import { Button } from '../components/ui/Button';

interface AboutPageProps {
  onNavigate: (view: ViewState) => void;
  onGetStarted: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onNavigate,
  onGetStarted,
}) => {
  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Header with Global Network Abstract Texture (No Green Overlay) */}
      <section className="relative overflow-hidden bg-[#121413] text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={ABSTRACT_IMAGES.about}
            alt="About Architecture Texture"
            className="w-full h-full object-cover opacity-35 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#121413]/70 via-[#121413]/90 to-[#121413]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight tracking-tight leading-tight">
            Building India's Unified <br />
            <span className="font-light text-white/90">Opportunity Infrastructure</span>
          </h1>
          <p className="text-sm sm:text-base text-white/75 max-w-2xl mx-auto leading-relaxed">
            eongrow was born out of a simple observation: India has the world's most talented youth, most ambitious founders, and most resilient businesses, yet they remain trapped in disconnected silos.
          </p>
        </div>
      </section>

      {/* 2. Core Pillars & Principles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extralight text-[#171C19] tracking-tight">
            What Drives Our Architecture
          </h2>
          <p className="text-xs sm:text-sm text-[#818A84]">
            Designed with Apple-level restraint, transparent economics, and zero paywalls for learners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="apple-card p-6 border border-black/[0.06] space-y-3.5">
            <div className="w-10 h-10 rounded-2xl bg-black/[0.05] flex items-center justify-center text-black shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="font-light text-base text-[#171C19] tracking-tight">One Identity, Many Hats</h4>
            <p className="text-xs text-[#525854] leading-relaxed">
              Professionals are not single-dimensional. You should not need five different platforms to be a student, a freelancer, and a tech co-founder simultaneously.
            </p>
          </div>

          <div className="apple-card p-6 border border-black/[0.06] space-y-3.5">
            <div className="w-10 h-10 rounded-2xl bg-black/[0.05] flex items-center justify-center text-black shadow-xs">
              <Heart className="w-5 h-5" />
            </div>
            <h4 className="font-light text-base text-[#171C19] tracking-tight">Radical Openness for Students</h4>
            <p className="text-xs text-[#525854] leading-relaxed">
              We pledge that student access will remain 100% free forever. No monetization of student data, no subscription gates for college opportunities.
            </p>
          </div>

          <div className="apple-card p-6 border border-black/[0.06] space-y-3.5">
            <div className="w-10 h-10 rounded-2xl bg-black/[0.05] flex items-center justify-center text-black shadow-xs">
              <Building className="w-5 h-5" />
            </div>
            <h4 className="font-light text-base text-[#171C19] tracking-tight">Physical Meets Digital</h4>
            <p className="text-xs text-[#525854] leading-relaxed">
              True trust happens in real life. We back our digital network with regional summits, high-security gate QR passes, and offline chapter meetups.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Regional City Chapters Across India */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="p-8 sm:p-10 rounded-[28px] bg-white border border-black/[0.08] shadow-xs space-y-6">
          <div className="max-w-2xl space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extralight text-[#171C19] tracking-tight">
              Active City Chapters
            </h3>
            <p className="text-xs sm:text-sm text-[#525854] leading-relaxed">
              eongrow operates autonomous city chapters led by regional community directors across India's primary innovation clusters:
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-2">
            {[
              { city: 'Bangalore', state: 'Karnataka', role: 'HQ & Tech Hub' },
              { city: 'Hyderabad', state: 'Telangana', role: 'AI & DeepTech' },
              { city: 'Mumbai', state: 'Maharashtra', role: 'FinTech & Media' },
              { city: 'Delhi-NCR', state: 'Delhi', role: 'Policy & B2B' },
              { city: 'Pune', state: 'Maharashtra', role: 'Industrial & MSME' },
              { city: 'Chennai', state: 'Tamil Nadu', role: 'SaaS & Hardware' },
            ].map((c, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#FAFCFA] border border-black/[0.06] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#171C19]">
                  <MapPin className="w-3.5 h-3.5 text-black" />
                  <span>{c.city}</span>
                </div>
                <p className="text-[11px] text-[#818A84]">{c.state}</p>
                <p className="text-[10px] text-black font-semibold pt-1 border-t border-black/[0.04]">{c.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Bottom Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] bg-[#171C19] text-white p-8 sm:p-12 border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
            <img
              src={ABSTRACT_IMAGES.meshFlow}
              alt="Texture"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-10 max-w-xl space-y-2">
            <h3 className="text-2xl font-light text-white tracking-tight">Become part of the eongrow network.</h3>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Join thousands of students, founders, freelancers, and investors accelerating India's innovation future.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 flex-shrink-0">
            <Button variant="primary" size="md" onClick={onGetStarted} className="apple-press font-bold text-xs">
              Join Community Free →
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => onNavigate('divisions-page')}
              className="apple-press text-xs font-semibold bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Explore 7 Networks
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
