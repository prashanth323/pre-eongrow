import React from 'react';
import { Smartphone, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import type { ViewState } from '../types/app.types';
import { Button } from '../components/ui/Button';
import { QRCodeView } from '../components/common/QRCodeView';
import { PublicLayout } from '../components/layout/PublicLayout';

interface WalletPassGuidePageProps {
  onNavigate: (view: ViewState) => void;
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const WalletPassGuidePage: React.FC<WalletPassGuidePageProps> = ({
  onNavigate,
  onGetStarted,
  onSignIn,
}) => {
  return (
    <PublicLayout
      currentView="wallet-pass-page"
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onGetStarted={onGetStarted}
    >
      <div className="space-y-20 py-12">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 pt-16 sm:pt-20">
          <h1 className="text-4xl sm:text-6xl font-extralight text-[#171C19] tracking-[-0.035em] leading-[1.08]">
            Apple Wallet & Cryptographic Passes
          </h1>
          <p className="text-base sm:text-lg text-[#525854] max-w-2xl mx-auto leading-relaxed">
            Every summit admission ticket is backed by an offline cryptographic token generated in PostgreSQL. Passholders can export native `.pkpass` files directly to Apple Wallet or Google Wallet.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigate('summits-page')}
              className="apple-press font-semibold text-xs h-12 px-8 rounded-full shadow-md"
            >
              Browse National Summits & Passes →
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onGetStarted}
              className="apple-press text-xs font-semibold h-12 px-7 rounded-full"
            >
              Create Account Free
            </Button>
          </div>
        </section>

        {/* Live Interactive Wallet Pass Graphic */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[32px] p-8 sm:p-12 bg-white border border-black/[0.08] shadow-sm flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-4 max-w-lg">
              <h2 className="text-2xl sm:text-3xl font-extralight text-[#171C19] tracking-tight">
                Offline Physical Gate Security
              </h2>
              <p className="text-xs sm:text-sm text-[#525854] leading-relaxed">
                Physical check-in desks at Bangalore Convention Centre and Hyderabad HICC run live WebRTC camera hardware scanners. Every scan uses PostgreSQL concurrency locking (`FOR UPDATE`) to verify token cryptographic hash signatures and prevent duplicate badge print attempts.
              </p>
              <div className="space-y-2 pt-2 text-xs text-[#525854]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Apple Wallet PassKit companion compatible (`.pkpass`)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Google Wallet & WearOS companion sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Tamper-proof HMAC SHA-256 cryptographic signatures</span>
                </div>
              </div>
            </div>

            {/* Apple Wallet Pass Mockup */}
            <div className="w-full max-w-xs rounded-[28px] bg-[#121413] text-white p-6 shadow-2xl border border-white/10 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <img src="/whiteapplogo.png" alt="eongrow" className="h-4 sm:h-5 w-auto object-contain" />
                  <span className="text-xs font-bold tracking-tight">eongrow Tech Summit</span>
                </div>
                <span className="text-[10px] uppercase font-mono text-white/60">PassKit</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-white/50 uppercase tracking-wider block">Attendee</span>
                <p className="text-sm font-semibold">Ananya Rao</p>
                <p className="text-[11px] text-white/70">Founder · All-Access Delegate</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border-y border-white/10 py-3">
                <div>
                  <span className="text-[10px] text-white/50 uppercase block">City</span>
                  <strong className="text-white font-medium">Bangalore</strong>
                </div>
                <div>
                  <span className="text-[10px] text-white/50 uppercase block">Status</span>
                  <span className="text-emerald-400 font-semibold">Active & Valid</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center pt-2 space-y-2">
                <div className="bg-white p-2.5 rounded-2xl shadow-inner">
                  <QRCodeView value="ngf_pkpass_offline_token_8842_sec" size={120} />
                </div>
                <span className="text-[10px] font-mono text-white/50">TKT-NGTS-8842-SEC</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Pillars of Gate Security */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extralight text-[#171C19] tracking-[-0.03em]">
              Architectural Guarantees
            </h2>
            <p className="text-xs sm:text-sm text-[#525854]">
              How physical admissions stay fraud-proof without requiring high-latency cloud round-trips:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="apple-card p-6 rounded-[28px] border border-black/[0.08] space-y-3 apple-press">
              <Smartphone className="w-6 h-6 text-black" />
              <h4 className="font-semibold text-sm text-[#171C19]">Offline Wallet Sync</h4>
              <p className="text-xs text-[#525854] leading-relaxed">
                Save directly to your phone. At convention entry gates with poor cellular coverage, your pass validates offline without internet.
              </p>
            </div>

            <div className="apple-card p-6 rounded-[28px] border border-black/[0.08] space-y-3 apple-press">
              <Lock className="w-6 h-6 text-black" />
              <h4 className="font-semibold text-sm text-[#171C19]">Anti-Screenshot Locking</h4>
              <p className="text-xs text-[#525854] leading-relaxed">
                Tokens contain dynamic time-salted check hashes that prevent scalpers from sharing duplicate screenshot passes.
              </p>
            </div>

            <div className="apple-card p-6 rounded-[28px] border border-black/[0.08] space-y-3 apple-press">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
              <h4 className="font-semibold text-sm text-[#171C19]">WebRTC Gate Scanning</h4>
              <p className="text-xs text-[#525854] leading-relaxed">
                Organizers scan credentials in under 120ms with atomic database deduplication locks at physical turnstiles.
              </p>
            </div>
          </div>
        </section>

        {/* Action Callout */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="p-8 sm:p-12 rounded-[32px] bg-[#171C19] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 max-w-xl">
              <h3 className="text-2xl sm:text-3xl font-extralight tracking-tight">Explore Upcoming Summits Across India</h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Students receive ₹0 hackathon passes. Verified professionals and founders access priority delegate seats.
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigate('summits-page')}
              className="bg-white text-black hover:bg-neutral-100 font-bold text-xs h-12 px-8 rounded-full apple-press flex-shrink-0"
            >
              View Flagship Summits →
            </Button>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};
