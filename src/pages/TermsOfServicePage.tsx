import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { ViewState } from '../types/app.types';
import { Button } from '../components/ui/Button';

interface TermsOfServicePageProps {
  onNavigate: (view: ViewState) => void;
}

export const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {/* Header */}
      <div className="space-y-3 pb-8 border-b border-black/[0.08]">
        <h1 className="text-3xl sm:text-5xl font-extralight text-[#171C19] tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs sm:text-sm text-[#818A84]">
          Effective Date: November 2026 · Governing eongrow
        </p>
      </div>

      {/* Summary Box with Apple Texture Accent */}
      <div className="p-6 rounded-2xl bg-[#FAFCFA] border border-black/[0.08] space-y-2 text-[#171C19]">
        <h4 className="font-semibold text-sm">Community Guidelines Summary:</h4>
        <ul className="space-y-1.5 text-xs text-[#525854]">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-black flex-shrink-0" />
            <span>Strict zero-tolerance policy against unsolicited spam, aggressive sales outreach, and impersonation.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-black flex-shrink-0" />
            <span>Unpaid internships are prohibited on the opportunities board; all student listings must provide stipends.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-black flex-shrink-0" />
            <span>Digital event passes are non-transferable cryptographic tokens tied to the registered attendee's profile.</span>
          </li>
        </ul>
      </div>

      {/* Terms Sections */}
      <div className="space-y-8 text-xs sm:text-sm text-[#525854] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-light text-[#171C19]">1. Agreement to Terms</h2>
          <p>
            By creating an account or accessing eongrow, you agree to comply with and be bound by these Terms of Service, our Privacy Policy, and the eongrow Student Protection Charter. If you do not agree, you must discontinue use of the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-light text-[#171C19]">2. Student Network Free Lifetime Guarantee</h2>
          <p>
            The Student Network division is guaranteed 100% free lifetime access for bona fide college and university students. eongrow shall never charge mandatory subscription fees or paywall core networking features for enrolled student accounts.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-light text-[#171C19]">3. Commercial Opportunities & Fair Pay</h2>
          <p>
            Employers and recruiters posting opportunities in the Student, Freelancer, and Career divisions warrant that all compensation details listed are accurate and lawful. Unpaid internships are strictly prohibited and will be taken down upon report.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-light text-[#171C19]">4. Event Ticketing, Wallets & Hardware Check-In</h2>
          <p>
            All summit admission passes issued through the platform contain unique cryptographic tokens for venue gate scanning. Tickets are valid for one-time admission only; duplicate presentations will trigger automated fraud detection and entry denial.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-light text-[#171C19]">5. Account Termination & Audit Rights</h2>
          <p>
            eongrow administrators reserve the right to suspend or terminate accounts that engage in harassment, fraud, malicious ticket reselling, or intellectual property violation, subject to immutable review logs recorded in `public.audit_log`.
          </p>
        </section>
      </div>

      {/* Bottom Nav Action */}
      <div className="pt-6 border-t border-black/[0.08] flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => onNavigate('landing')} className="apple-press text-xs">
          ← Return to Home
        </Button>
        <Button variant="primary" size="sm" onClick={() => onNavigate('privacy-page')} className="apple-press text-xs font-semibold">
          Privacy Policy →
        </Button>
      </div>
    </div>
  );
};
