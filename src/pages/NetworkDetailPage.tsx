import React, { useState } from 'react';
import { Users, Briefcase, Calendar, Check, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { DIVISIONS_CATALOG, DIVISION_PERSONA_IMAGES, DIVISIONS_LIST, NETWORK_TOOLKIT_MODULES, type NetworkModuleData } from '../lib/divisions';
import type { DivisionSlug, ViewState } from '../types/app.types';
import { Button } from '../components/ui/Button';
import { PublicLayout } from '../components/layout/PublicLayout';
import { Modal } from '../components/ui/Modal';

interface NetworkDetailPageProps {
  slug: DivisionSlug;
  onNavigate: (view: ViewState) => void;
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const NetworkDetailPage: React.FC<NetworkDetailPageProps> = ({
  slug,
  onNavigate,
  onGetStarted,
  onSignIn,
}) => {
  const division = DIVISIONS_CATALOG[slug] || DIVISIONS_CATALOG.student;
  const personaImg = DIVISION_PERSONA_IMAGES[slug];
  const modules = NETWORK_TOOLKIT_MODULES[slug] || [];
  const [selectedModule, setSelectedModule] = useState<NetworkModuleData | null>(null);

  return (
    <PublicLayout
      currentView={`network-${slug}` as ViewState}
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onGetStarted={onGetStarted}
    >
      <div className="space-y-20">
        {/* 1. Immersive Hero Section (Network badge removed) */}
        <section className="relative overflow-hidden bg-[#121413] text-white pt-28 pb-20 px-4 sm:px-6 lg:px-8 border-b border-white/10">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img
              src={personaImg}
              alt={division.name}
              className="w-full h-full object-cover opacity-25 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#121413]/70 via-[#121413]/90 to-[#121413]" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5">
            <h1 className="text-4xl sm:text-6xl font-extralight tracking-tight leading-tight">
              {division.name}
            </h1>

            <p className="text-lg sm:text-xl text-white/90 font-light max-w-2xl mx-auto leading-relaxed">
              {division.tagline}
            </p>

            <p className="text-xs sm:text-sm text-white/70 max-w-2xl mx-auto leading-relaxed">
              {division.description}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Button
                variant="primary"
                size="lg"
                onClick={onGetStarted}
                className="w-full sm:w-auto bg-white text-black hover:bg-neutral-100 font-bold text-xs h-12 px-8 rounded-full apple-press shadow-lg"
              >
                Join {division.name} →
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate('pricing-page')}
                className="w-full sm:w-auto text-xs font-semibold bg-white/10 border-white/20 text-white hover:bg-white/20 h-12 px-7 rounded-full apple-press"
              >
                View Membership Plans
              </Button>
            </div>
          </div>
        </section>

        {/* 2. Switcher Bar: Jump to Other Networks */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs text-[#818A84] font-medium mr-2 flex-shrink-0">All 7 Networks:</span>
            {DIVISIONS_LIST.map((d) => (
              <button
                key={d.slug}
                onClick={() => onNavigate(`network-${d.slug}` as ViewState)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all apple-press cursor-pointer ${
                  d.slug === slug
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-white border border-black/[0.08] text-[#525854] hover:text-black hover:border-black/20'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        </section>

        {/* 3. Specialized Network Toolkits & Workspaces (Moved from dashboard hub to public showcase) */}
        {modules.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="max-w-3xl space-y-2">
              <h2 className="text-3xl sm:text-4xl font-extralight text-[#171C19] tracking-tight">
                Workspaces & Toolkits for {division.name}
              </h2>
              <p className="text-xs sm:text-sm text-[#525854]">
                Everything built specifically for members in this network — authenticated, verified, and completely seamless.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {modules.map((mod) => (
                <div
                  key={mod.id}
                  className="apple-card overflow-hidden p-0 border border-black/[0.08] flex flex-col justify-between group hover:shadow-xl transition-all duration-300 rounded-[28px]"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={mod.image}
                      alt={mod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-4 left-5 right-5 text-white">
                      <h4 className="font-medium text-base tracking-tight drop-shadow-sm">{mod.title}</h4>
                    </div>
                  </div>

                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <p className="text-xs text-[#525854] leading-relaxed">{mod.desc}</p>

                      <div className="space-y-1.5 pt-2">
                        {mod.capabilities.map((cap, cIdx) => (
                          <div key={cIdx} className="flex items-center gap-2 text-xs text-[#171C19]">
                            <Check className="w-3.5 h-3.5 text-black flex-shrink-0" />
                            <span>{cap}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setSelectedModule(mod)}
                        className="text-xs font-semibold text-black hover:underline flex items-center gap-1 cursor-pointer apple-press"
                      >
                        <span>View Workflow & Preview</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={onGetStarted}
                        className="text-xs px-4"
                      >
                        {mod.action}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Core Ecosystem Capabilities */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extralight text-[#171C19] tracking-[-0.03em]">
              Capabilities Designed for {division.name}
            </h2>
            <p className="text-xs sm:text-sm text-[#525854]">
              Every tool in this network is engineered to eliminate friction and foster trusted peer collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {division.features?.map((feat, idx) => (
              <div
                key={idx}
                className="apple-card p-6 rounded-[28px] border border-black/[0.08] space-y-3 apple-press"
              >
                <div className="w-9 h-9 rounded-xl bg-black/[0.05] text-black flex items-center justify-center font-bold text-xs">
                  0{idx + 1}
                </div>
                <h4 className="font-normal text-sm text-[#171C19] tracking-tight">{feat}</h4>
                <p className="text-xs text-[#525854] leading-relaxed">
                  Authenticated through cryptographic credentials and verified platform governance.
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Cross-Pollination Guarantee Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[32px] p-8 sm:p-12 bg-white border border-black/[0.08] shadow-sm space-y-6">
            <div className="max-w-3xl space-y-3">
              <h3 className="text-2xl sm:text-3xl font-extralight text-[#171C19] tracking-tight">
                How {division.name} Connects with the Entire Ecosystem
              </h3>
              <p className="text-xs sm:text-sm text-[#525854] leading-relaxed">
                You never operate in isolation on eongrow. With a single verified account, members in this network seamlessly interact with all other spheres:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              <div className="p-5 rounded-2xl bg-[#FAFCFA] border border-black/[0.06] space-y-2">
                <Users className="w-5 h-5 text-black" />
                <h5 className="font-semibold text-xs text-[#171C19]">Warm Peer Introductions</h5>
                <p className="text-xs text-[#525854] leading-relaxed">
                  Request direct introductions across city chapters without cold emailing or paywalled InMail quotas.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAFCFA] border border-black/[0.06] space-y-2">
                <Briefcase className="w-5 h-5 text-black" />
                <h5 className="font-semibold text-xs text-[#171C19]">0% Commission Opportunities</h5>
                <p className="text-xs text-[#525854] leading-relaxed">
                  Publish or apply for projects, freelance gigs, and jobs with zero recruitment or platform markups.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAFCFA] border border-black/[0.06] space-y-2">
                <Calendar className="w-5 h-5 text-black" />
                <h5 className="font-semibold text-xs text-[#171C19]">Offline Summit Access</h5>
                <p className="text-xs text-[#525854] leading-relaxed">
                  Check in to national conclaves and roundtables across Bangalore, Hyderabad, Mumbai, and Delhi.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Ready to Join Action Callout */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="p-8 sm:p-12 rounded-[32px] bg-[#171C19] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 max-w-xl">
              <h3 className="text-2xl sm:text-3xl font-extralight tracking-tight">
                Join the {division.name} Today
              </h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Connect with verified innovators, founders, and peers. One account gives you lifelong access.
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={onGetStarted}
              className="bg-white text-black hover:bg-neutral-100 font-bold text-xs h-12 px-8 rounded-full apple-press flex-shrink-0"
            >
              Get Started Free →
            </Button>
          </div>
        </section>
      </div>

      {/* Module Workflow & Preview Modal */}
      {selectedModule && (
        <Modal
          isOpen={Boolean(selectedModule)}
          onClose={() => setSelectedModule(null)}
          title={selectedModule.title}
          description={selectedModule.desc}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            <div className="relative h-44 rounded-2xl overflow-hidden">
              <img
                src={selectedModule.image}
                alt={selectedModule.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-[#171C19]">Member Workflow:</h5>
              <div className="space-y-2">
                {selectedModule.workflow.map((step, sIdx) => (
                  <div key={sIdx} className="flex items-center gap-3 p-3 bg-black/[0.03] rounded-xl text-xs">
                    <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                      {sIdx + 1}
                    </span>
                    <span className="text-[#171C19] font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setSelectedModule(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedModule(null);
                  onGetStarted();
                }}
              >
                Unlock Toolkit Access
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PublicLayout>
  );
};
