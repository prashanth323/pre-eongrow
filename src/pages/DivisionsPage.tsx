import React from 'react';
import {
  GraduationCap,
  Briefcase,
  Palette,
  Rocket,
  Building2,
  Sparkles,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { DIVISIONS_LIST } from '../lib/divisions';
import { ABSTRACT_IMAGES } from '../lib/abstractImages';
import type { DivisionSlug, ViewState } from '../types/app.types';
import { Button } from '../components/ui/Button';

interface DivisionsPageProps {
  onNavigate: (view: ViewState) => void;
  onExploreDivision: (slug: DivisionSlug) => void;
  onGetStarted: () => void;
}

const getDivisionIcon = (slug: DivisionSlug) => {
  switch (slug) {
    case 'student': return <GraduationCap className="w-5 h-5" />;
    case 'career': return <Briefcase className="w-5 h-5" />;
    case 'freelancer': return <Palette className="w-5 h-5" />;
    case 'entrepreneur': return <Rocket className="w-5 h-5" />;
    case 'business': return <Building2 className="w-5 h-5" />;
    case 'influencer': return <Sparkles className="w-5 h-5" />;
    case 'investor': return <TrendingUp className="w-5 h-5" />;
  }
};

export const DivisionsPage: React.FC<DivisionsPageProps> = ({
  onNavigate,
  onExploreDivision,
  onGetStarted,
}) => {
  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Header with Pure Abstract Image Banner (Zero Green Overlay) */}
      <section className="relative overflow-hidden bg-[#121413] text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={ABSTRACT_IMAGES.meshFlow}
            alt="Hero Abstract Architecture"
            className="w-full h-full object-cover opacity-35 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#121413]/70 via-[#121413]/90 to-[#121413]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight tracking-tight leading-tight">
            Seven Purpose-Built Ecosystems. <br />
            <span className="font-light text-white/90">One Unified Identity.</span>
          </h1>
          <p className="text-sm sm:text-base text-white/75 max-w-2xl mx-auto leading-relaxed">
            Unlike fragmented platforms where students, founders, freelancers, and investors operate on completely disconnected tools, eongrow unites India's knowledge economy under a single cryptographic account.
          </p>
        </div>
      </section>

      {/* 2. Interactive 7-Division Grid with Abstract Card Accents */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extralight text-[#171C19] tracking-tight">
            Explore Every Specialized Network
          </h2>
          <p className="text-xs sm:text-sm text-[#818A84]">
            Join as many divisions as reflect your professional scope. No silo walls, no duplicate logins.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DIVISIONS_LIST.map((div) => {
            const abstractImg = ABSTRACT_IMAGES.divisions[div.slug];

            return (
              <div
                key={div.slug}
                className="apple-card p-0 overflow-hidden flex flex-col justify-between border border-black/[0.08] hover:shadow-lg transition-all group"
              >
                {/* Card Top: Abstract Imagery Header */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={abstractImg}
                    alt={div.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  
                  {/* Floating Icon & Badge */}
                  <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
                        style={{ backgroundColor: div.colorHex }}
                      >
                        {getDivisionIcon(div.slug)}
                      </div>
                      <span className="font-semibold text-sm drop-shadow-sm">{div.name}</span>
                    </div>
                    {div.isFreeOnly && (
                      <span className="px-2 py-0.5 rounded-full bg-black text-[10px] font-bold text-white tracking-wide uppercase">
                        100% Free
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body: Informative Highlights */}
                <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <p className="text-xs text-black font-semibold tracking-tight">{div.tagline}</p>
                    <p className="text-xs text-[#525854] leading-relaxed">{div.description}</p>

                    <div className="pt-2 border-t border-black/[0.06] space-y-2">
                      <span className="text-[11px] font-semibold text-[#171C19] block">Core Capabilities:</span>
                      <ul className="space-y-1.5 text-xs text-[#525854]">
                        {(div.features || []).map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-black flex-shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between gap-3">
                    <button
                      onClick={() => onNavigate(`network-${div.slug}` as ViewState)}
                      className="text-xs font-semibold text-black hover:underline flex items-center gap-1 cursor-pointer apple-press"
                    >
                      <span>Explore Hub</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigate('opportunities-page')}
                      className="text-xs apple-press"
                    >
                      View Opportunities
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Cross-Pollination Callout Banner with Textured Backdrop */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] bg-[#171C19] text-white p-8 sm:p-12 border border-white/10 shadow-xl">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
            <img
              src={ABSTRACT_IMAGES.crossPollination}
              alt="Texture"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-10 max-w-2xl space-y-4">
            <h3 className="text-2xl sm:text-3xl font-extralight tracking-tight leading-tight">
              A student today can be a freelance designer tomorrow and a venture-backed founder next year.
            </h3>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Your verified reputation, peer connections, and event history travel with you across all 7 networks seamlessly without losing identity integrity.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={onGetStarted}
                className="apple-press font-bold text-xs"
              >
                Join eongrow Free →
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => onNavigate('how-it-works-page')}
                className="apple-press text-xs font-semibold bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                How Cross-Pollination Works
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
