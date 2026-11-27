import React from 'react';
import {
  Sparkles,
  Users,
  Repeat,
  Shield,
  Layers,
  Briefcase,
  Rocket,
} from 'lucide-react';
import { ABSTRACT_IMAGES } from '../lib/abstractImages';
import type { ViewState } from '../types/app.types';
import { Button } from '../components/ui/Button';

interface HowItWorksPageProps {
  onNavigate: (view: ViewState) => void;
  onGetStarted: () => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({
  onNavigate,
  onGetStarted,
}) => {
  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Header with Abstract Fluid Architecture Texture (No Green Overlay) */}
      <section className="relative overflow-hidden bg-[#121413] text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={ABSTRACT_IMAGES.crossPollination}
            alt="Cross Pollination Abstract Texture"
            className="w-full h-full object-cover opacity-35 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#121413]/70 via-[#121413]/90 to-[#121413]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight tracking-tight leading-tight">
            How Cross-Pollination <br />
            <span className="font-light text-white/90">Powers Real Collaboration</span>
          </h1>
          <p className="text-sm sm:text-base text-white/75 max-w-2xl mx-auto leading-relaxed">
            Eliminating artificial barriers between learning, freelancing, founding, and investing. One verified profile opens doors across all 7 professional spheres.
          </p>
        </div>
      </section>

      {/* 2. The Multi-Division Lifecycle (4 Pillars) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extralight text-[#171C19] tracking-tight">
            The 4 Pillars of eongrow Cross-Pollination
          </h2>
          <p className="text-xs sm:text-sm text-[#818A84]">
            How ideas, capital, and talent flow without friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <Shield className="w-5 h-5 text-black" />,
              step: '01',
              title: 'Unified Verified Identity',
              desc: 'Verify once with student ID, Aadhaar, MCA incorporation, or portfolio. Your trust tier applies across every division you join.',
            },
            {
              icon: <Layers className="w-5 h-5 text-black" />,
              step: '02',
              title: 'Fluid Multi-Membership',
              desc: 'Be a college student by morning, take freelance brand design gigs by afternoon, and test early startup prototypes by night.',
            },
            {
              icon: <Repeat className="w-5 h-5 text-black" />,
              step: '03',
              title: 'Cross-Division Commerce',
              desc: 'Founders hire students for paid internships; MSMEs procure parts from business peers; angel syndicates fund top founders.',
            },
            {
              icon: <Sparkles className="w-5 h-5 text-black" />,
              step: '04',
              title: 'Hardware Gate Summits',
              desc: 'Take online connections into real life. Admission passes are secured with offline cryptographic tokens validated at physical venue gates.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="apple-card p-6 border border-black/[0.06] space-y-4 hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-black/[0.05] flex items-center justify-center shadow-xs">
                  {item.icon}
                </div>
                <span className="font-mono text-xs font-bold text-[#818A84]">{item.step}</span>
              </div>
              <div className="space-y-1.5">
                <h4 className="font-light text-base text-[#171C19] tracking-tight">{item.title}</h4>
                <p className="text-xs text-[#525854] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Real-World Case Studies / Scenarios */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="p-8 sm:p-10 rounded-[28px] bg-white border border-black/[0.08] shadow-xs space-y-8">
          <div className="max-w-2xl space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extralight text-[#171C19] tracking-tight">
              A Complete Collaboration in Action
            </h3>
            <p className="text-xs sm:text-sm text-[#525854] leading-relaxed">
              Here is how a real venture emerges through eongrow cross-pollination in less than 30 days:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Case 1 */}
            <div className="p-5 rounded-2xl bg-[#FAFCFA] border border-black/[0.06] space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#171C19]">
                <Rocket className="w-4 h-4 text-black" />
                <span>Stage 1: Founder Posts Brief</span>
              </div>
              <p className="text-xs text-[#525854] leading-relaxed">
                Ananya Rao (NeoFlow AI) posts an opportunity for a Full-Stack Autonomous Agent Intern with a ₹30,000/mo stipend.
              </p>
              <div className="pt-2 text-[11px] font-medium text-[#818A84] border-t border-black/[0.06]">
                Division: Entrepreneur & Startup
              </div>
            </div>

            {/* Case 2 */}
            <div className="p-5 rounded-2xl bg-[#FAFCFA] border border-black/[0.06] space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#171C19]">
                <Users className="w-4 h-4 text-black" />
                <span>Stage 2: Student Matches & Applies</span>
              </div>
              <p className="text-xs text-[#525854] leading-relaxed">
                Aarav Sharma (RVCE CS undergrad) discovers the paid role via the free Student Job Board and applies with verified GitHub credentials.
              </p>
              <div className="pt-2 text-[11px] font-medium text-[#818A84] border-t border-black/[0.06]">
                Division: Student Network (Free Forever)
              </div>
            </div>

            {/* Case 3 */}
            <div className="p-5 rounded-2xl bg-[#FAFCFA] border border-black/[0.06] space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#171C19]">
                <Briefcase className="w-4 h-4 text-black" />
                <span>Stage 3: Summit Deal & Investment</span>
              </div>
              <p className="text-xs text-[#525854] leading-relaxed">
                Both attend the eongrow India Tech Summit in Bangalore. Ananya presents at Demo Day; Karan Singhania commits angel syndicate backing.
              </p>
              <div className="pt-2 text-[11px] font-medium text-[#818A84] border-t border-black/[0.06]">
                Division: Investor & Strategic
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom CTA with Textured Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] bg-white border border-black/[0.08] shadow-xs p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6 apple-card">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
            <img
              src={ABSTRACT_IMAGES.cardLight}
              alt="Texture"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-10 max-w-xl space-y-2">
            <h3 className="text-2xl font-light text-[#171C19] tracking-tight">Ready to unlock cross-division access?</h3>
            <p className="text-xs sm:text-sm text-[#525854] leading-relaxed">
              Create your account in under 60 seconds. Students join 100% free with lifetime access.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 flex-shrink-0">
            <Button variant="primary" size="md" onClick={onGetStarted} className="apple-press font-bold text-xs">
              Join eongrow Free →
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => onNavigate('divisions-page')}
              className="apple-press text-xs font-semibold"
            >
              Browse 7 Networks
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
