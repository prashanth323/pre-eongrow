import React from 'react';
import {
  ShieldCheck,
  Lock,
  Key,
  Server,
  Database,
  FileCheck,
} from 'lucide-react';
import { ABSTRACT_IMAGES } from '../lib/abstractImages';
import type { ViewState } from '../types/app.types';
import { Button } from '../components/ui/Button';

interface SecurityPageProps {
  onNavigate: (view: ViewState) => void;
  onGetStarted: () => void;
}

export const SecurityPage: React.FC<SecurityPageProps> = ({
  onNavigate,
  onGetStarted,
}) => {
  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Header with Monolithic Dark Slate Texture */}
      <section className="relative overflow-hidden bg-[#171C19] text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={ABSTRACT_IMAGES.security}
            alt="Security Architecture"
            className="w-full h-full object-cover opacity-20 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#171C19]/70 via-[#171C19]/90 to-[#171C19]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight tracking-tight leading-tight">
            Security, Isolation & <br />
            <span className="font-light text-white/90">Row-Level Governance</span>
          </h1>
          <p className="text-sm sm:text-base text-white/70 max-w-2xl mx-auto leading-relaxed">
            Engineered from day one with PostgreSQL Row-Level Security (RLS), atomic database transactions, tamper-proof QR tokens, and encrypted private storage.
          </p>
        </div>
      </section>

      {/* 2. Security Pillars Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extralight text-[#171C19] tracking-tight">
            Defense in Depth at Every Layer
          </h2>
          <p className="text-xs sm:text-sm text-[#818A84]">
            How we protect member privacy, intellectual property, and summit access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="apple-card p-6 border border-black/[0.06] space-y-3.5">
            <div className="w-10 h-10 rounded-2xl bg-black/[0.04] flex items-center justify-center text-black shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="font-light text-base text-[#171C19] tracking-tight">PostgreSQL Row-Level Security</h4>
            <p className="text-xs text-[#525854] leading-relaxed">
              Every table is guarded by RLS policies. User profiles, connection requests, and documents can only be queried or mutated by authorized parties verified via cryptographically signed JWT.
            </p>
          </div>

          <div className="apple-card p-6 border border-black/[0.06] space-y-3.5">
            <div className="w-10 h-10 rounded-2xl bg-black/[0.04] flex items-center justify-center text-black shadow-xs">
              <Key className="w-5 h-5" />
            </div>
            <h4 className="font-light text-base text-[#171C19] tracking-tight">Anti-Replay QR Cryptography</h4>
            <p className="text-xs text-[#525854] leading-relaxed">
              Admission tokens are generated using pgcrypto. When scanned at venue gates, the database applies row-level locking (`FOR UPDATE`), making double check-ins mathematically impossible.
            </p>
          </div>

          <div className="apple-card p-6 border border-black/[0.06] space-y-3.5">
            <div className="w-10 h-10 rounded-2xl bg-black/[0.04] flex items-center justify-center text-black shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-light text-base text-[#171C19] tracking-tight">Private Storage Isolation</h4>
            <p className="text-xs text-[#525854] leading-relaxed">
              Verification documents (college IDs, Aadhaar, incorporation papers) are stored in private encrypted storage vaults accessible strictly to the uploader and authorized super administrators.
            </p>
          </div>

          <div className="apple-card p-6 border border-black/[0.06] space-y-3.5">
            <div className="w-10 h-10 rounded-2xl bg-black/[0.04] flex items-center justify-center text-black shadow-xs">
              <Server className="w-5 h-5" />
            </div>
            <h4 className="font-light text-base text-[#171C19] tracking-tight">HMAC Edge Function Payments</h4>
            <p className="text-xs text-[#525854] leading-relaxed">
              Razorpay order generation and webhook signature verifications run exclusively in serverless Edge Functions. API secrets never touch client-side browser memory.
            </p>
          </div>

          <div className="apple-card p-6 border border-black/[0.06] space-y-3.5">
            <div className="w-10 h-10 rounded-2xl bg-black/[0.04] flex items-center justify-center text-black shadow-xs">
              <FileCheck className="w-5 h-5" />
            </div>
            <h4 className="font-light text-base text-[#171C19] tracking-tight">Immutable Audit Logging</h4>
            <p className="text-xs text-[#525854] leading-relaxed">
              All administrative role changes, account suspensions, and verification reviews trigger non-repudiable audit logs recorded in `public.audit_log` with actor timestamps.
            </p>
          </div>

          <div className="apple-card p-6 border border-black/[0.06] space-y-3.5">
            <div className="w-10 h-10 rounded-2xl bg-black/[0.04] flex items-center justify-center text-black shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-light text-base text-[#171C19] tracking-tight">DPDP Act 2023 Compliance</h4>
            <p className="text-xs text-[#525854] leading-relaxed">
              Designed in full compliance with India's Digital Personal Data Protection Act (DPDP) 2023, offering complete data export and account erasure rights upon request.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Bottom Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] bg-[#171C19] text-white p-8 sm:p-12 border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative z-10 max-w-xl space-y-2">
            <h3 className="text-2xl font-light text-white tracking-tight">Have a security question or responsible disclosure?</h3>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Our engineering team responds promptly to all vulnerability reports and security inquiries.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 flex-shrink-0">
            <Button
              variant="outline"
              size="md"
              onClick={() => onNavigate('privacy-page')}
              className="apple-press text-xs font-semibold bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Privacy Policy
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={onGetStarted}
              className="apple-press font-bold text-xs"
            >
              Join Secure Network
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
