import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { ViewState } from '../types/app.types';
import { Button } from '../components/ui/Button';

interface PrivacyPolicyPageProps {
  onNavigate: (view: ViewState) => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {/* Header */}
      <div className="space-y-3 pb-8 border-b border-black/[0.08]">
        <h1 className="text-3xl sm:text-5xl font-extralight text-[#171C19] tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-[#818A84]">
          Effective Date: November 2026 · Compliant with DPDP Act (India, 2023)
        </p>
      </div>

      {/* Summary Box with Apple Texture Accent */}
      <div className="p-6 rounded-2xl bg-white/80 border border-black/[0.08] space-y-2 text-[#171C19] shadow-2xs">
        <h4 className="font-semibold text-sm">Key Privacy Guarantees at a Glance:</h4>
        <ul className="space-y-1.5 text-xs text-[#525854]">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-black" />
            <span>We never sell or broker user personal data to third-party telemarketers or ad networks.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-black" />
            <span>Student educational and contact data is strictly firewalled from commercial exploitation.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-black" />
            <span>Verification documents are stored in private encrypted storage accessible only to compliance auditors.</span>
          </li>
        </ul>
      </div>

      {/* Policy Sections */}
      <div className="space-y-8 text-xs sm:text-sm text-[#525854] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-light text-[#171C19]">1. Information We Collect</h2>
          <p>
            When you register on eongrow, we collect your name, email address, optional contact details, educational institution or company affiliation, professional headline, and skills. When you apply for trust verification, we collect official documents (e.g., student IDs, government IDs, MCA certificates) solely to authenticate your account.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-light text-[#171C19]">2. Purpose and Legal Basis for Processing</h2>
          <p>
            Your information is processed to provide multi-division community networking, facilitate job/internship applications, issue cryptographic summit passes, and maintain platform security using Row-Level Security (RLS) enforcement. We process data based on your explicit consent and contractual necessity for providing network services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-light text-[#171C19]">3. Zero Monetization of Student Data</h2>
          <p>
            As stipulated in the eongrow Student Network Charter, we do not commercialize, license, or monetize student user profiles, resumes, or application metrics. The Student Network is funded sustainably through enterprise subscriptions and corporate summit ticketing.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-light text-[#171C19]">4. Data Retention and Erasure Rights</h2>
          <p>
            Under India's Digital Personal Data Protection (DPDP) Act 2023, you hold the right to access, rectify, and erase your personal data at any time. When you delete your account in User Settings, your profile, active tickets, and stored verification documents are purged from our database within 30 days.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-light text-[#171C19]">5. Contact and Grievance Officer</h2>
          <p>
            For privacy inquiries, data subject access requests, or grievance redressal, please contact our Data Protection Officer at: <strong className="text-[#171C19]">privacy@eongrow.network</strong>.
          </p>
        </section>
      </div>

      {/* Bottom Nav Action */}
      <div className="pt-6 border-t border-black/[0.08] flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => onNavigate('landing')} className="apple-press text-xs">
          ← Return to Home
        </Button>
        <Button variant="primary" size="sm" onClick={() => onNavigate('terms-page')} className="apple-press text-xs font-semibold">
          Terms of Service →
        </Button>
      </div>
    </div>
  );
};
