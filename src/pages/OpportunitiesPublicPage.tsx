import React from 'react';
import { ShieldCheck, CheckCircle2, Zap, ArrowRight } from 'lucide-react';
import type { ViewState } from '../types/app.types';
import { Button } from '../components/ui/Button';
import { PublicLayout } from '../components/layout/PublicLayout';

interface OpportunitiesPublicPageProps {
  onNavigate: (view: ViewState) => void;
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const OpportunitiesPublicPage: React.FC<OpportunitiesPublicPageProps> = ({
  onNavigate,
  onGetStarted,
  onSignIn,
}) => {
  const sampleOpps = [
    {
      title: 'Autonomous AI Agent Engineer Intern',
      company: 'NeoFlow AI',
      division: 'Student & Tech',
      location: 'Hyderabad (Hybrid)',
      stipend: '₹30,000 / month',
      type: 'Paid Internship',
      tags: ['TypeScript', 'PostgreSQL', 'LangChain', 'Next.js'],
    },
    {
      title: 'Brand Identity & Design System Lead',
      company: 'Kroma Creative Studio',
      division: 'Freelancer',
      location: 'Remote (India)',
      stipend: '₹85,000 Milestone Contract',
      type: 'Contract Sprint',
      tags: ['Figma', 'Typography', 'Motion', 'Design Systems'],
    },
    {
      title: 'Full-Stack Founding Engineer',
      company: 'AgriSense IoT',
      division: 'Entrepreneur',
      location: 'Bangalore (On-site)',
      stipend: '₹18 - ₹24 LPA + 2.0% Equity',
      type: 'Founding Role',
      tags: ['React', 'Node.js', 'AWS', 'IoT Firmware'],
    },
    {
      title: 'Sustainable Packaging Vendor Tender',
      company: 'BioPack India MSME',
      division: 'Business Owners',
      location: 'Pune / Mumbai',
      stipend: '₹12 Lakh Commercial RFP',
      type: 'Supplier Tender',
      tags: ['Biodegradable', 'B2B Procurement', 'GSTIN Verified'],
    },
  ];

  return (
    <PublicLayout
      currentView="opportunities-page"
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onGetStarted={onGetStarted}
    >
      <div className="space-y-20 py-12">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 pt-16 sm:pt-20">
          <h1 className="text-4xl sm:text-6xl font-extralight text-[#171C19] tracking-[-0.035em] leading-[1.08]">
            Live Opportunities & Gigs
          </h1>
          <p className="text-base sm:text-lg text-[#525854] max-w-2xl mx-auto leading-relaxed">
            Pre-screened roles, paid internships, freelance contracts, and commercial B2B tenders across all 7 networks. Zero recruitment commissions, zero unpaid labor.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Button
              variant="primary"
              size="lg"
              onClick={onGetStarted}
              className="apple-press font-semibold text-xs h-12 px-8 rounded-full shadow-md"
            >
              Browse & Apply Free →
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onNavigate('pricing-page')}
              className="apple-press text-xs font-semibold h-12 px-7 rounded-full"
            >
              Post an Opportunity (0% Cut)
            </Button>
          </div>
        </section>

        {/* Opportunity Principles */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extralight text-[#171C19] tracking-[-0.03em]">
              The eongrow Opportunity Standards
            </h2>
            <p className="text-xs sm:text-sm text-[#525854]">
              Strict guidelines enforced by our verification engine:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="apple-card p-6 rounded-[28px] border border-black/[0.08] space-y-3 apple-press">
              <ShieldCheck className="w-6 h-6 text-black" />
              <h4 className="font-semibold text-sm text-[#171C19]">Strict Ban on Unpaid Internships</h4>
              <p className="text-xs text-[#525854] leading-relaxed">
                Every internship listing must specify a guaranteed monthly stipend. Zero exploitation, guaranteed by our Student Charter.
              </p>
            </div>

            <div className="apple-card p-6 rounded-[28px] border border-black/[0.08] space-y-3 apple-press">
              <Zap className="w-6 h-6 text-black" />
              <h4 className="font-semibold text-sm text-[#171C19]">0% Platform Commission</h4>
              <p className="text-xs text-[#525854] leading-relaxed">
                eongrow takes zero percentage cuts from freelancer milestone payments, client agreements, or hiring salaries.
              </p>
            </div>

            <div className="apple-card p-6 rounded-[28px] border border-black/[0.08] space-y-3 apple-press">
              <CheckCircle2 className="w-6 h-6 text-black" />
              <h4 className="font-semibold text-sm text-[#171C19]">Verified Poster Identity</h4>
              <p className="text-xs text-[#525854] leading-relaxed">
                Posters must hold Business Verified or Professionally Verified status before publishing roles to eliminate recruitment spam.
              </p>
            </div>
          </div>
        </section>

        {/* Sample Opportunities Catalog Preview */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extralight text-[#171C19] tracking-[-0.03em]">
              Active Roles & Tenders Preview
            </h2>
            <p className="text-xs sm:text-sm text-[#525854]">
              Sample briefs currently accepting direct applications:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sampleOpps.map((opp, idx) => (
              <div
                key={idx}
                className="apple-card p-6 rounded-[28px] border border-black/[0.08] space-y-4 apple-press flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/[0.05] text-black">
                      {opp.division}
                    </span>
                    <span className="text-xs font-bold text-black">{opp.stipend}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-normal text-[#171C19] tracking-tight">{opp.title}</h3>
                    <p className="text-xs text-[#818A84] mt-0.5">{opp.company} · {opp.location}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {opp.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="px-2 py-0.5 rounded bg-black/[0.04] text-[11px] font-mono text-[#525854]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
                  <span className="text-xs font-medium text-[#171C19]">{opp.type}</span>
                  <button
                    onClick={onGetStarted}
                    className="text-xs font-semibold text-black hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Apply via Free Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Post an Opportunity CTA */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="p-8 sm:p-12 rounded-[32px] bg-[#171C19] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 max-w-xl">
              <h3 className="text-2xl sm:text-3xl font-extralight tracking-tight">Hiring or Looking for Top Talent?</h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Connect with verified college interns, freelance senior designers, and MSME leaders. Zero commissions, forever.
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={onGetStarted}
              className="bg-white text-black hover:bg-neutral-100 font-bold text-xs h-12 px-8 rounded-full apple-press flex-shrink-0"
            >
              Join eongrow Free →
            </Button>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};
