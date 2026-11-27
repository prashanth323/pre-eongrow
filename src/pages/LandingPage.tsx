import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { DIVISIONS_LIST } from '../lib/divisions';
import { formatDate } from '../lib/utils';
import { ABSTRACT_IMAGES } from '../lib/abstractImages';
import { DataService, MOCK_EVENTS, type EventItem } from '../services/dataService';
import type { DivisionSlug, ViewState } from '../types/app.types';
import { Button } from '../components/ui/Button';
import { ArrowRevealButton } from '../components/ui/ArrowRevealButton';
import { QRCodeView } from '../components/common/QRCodeView';
import { PublicLayout } from '../components/layout/PublicLayout';
import { EventDetailModal } from '../components/events/EventDetailModal';
import WayglimBackground from '../components/WayglimBackground';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onExploreDivision: (slug: DivisionSlug) => void;
  onBrowseEvents?: () => void;
  onNavigate?: (view: ViewState) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSignIn,
  onExploreDivision,
  onBrowseEvents,
  onNavigate = () => {},
}) => {
  const [events, setEvents] = useState<EventItem[]>(MOCK_EVENTS);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedDetailEvent, setSelectedDetailEvent] = useState<EventItem | null>(null);
  const [activeBentoRole, setActiveBentoRole] = useState<'student' | 'founder' | 'freelancer' | 'investor'>('student');

  useEffect(() => {
    async function loadSummits() {
      const data = await DataService.getEvents();
      if (data && data.length > 0) {
        setEvents(data);
      }
    }
    loadSummits();
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'Why should I join eongrow instead of using separate platforms like LinkedIn or Upwork?',
      a: 'Traditional networks force you into rigid, single-dimensional buckets. On eongrow, you hold one verified identity and participate as a student, freelance creator, and startup founder simultaneously. Your reputation, trust badges, and peer introductions cross network boundaries without needing multiple disconnected accounts.',
    },
    {
      q: 'Is the Student Network really 100% free forever?',
      a: 'Yes, unconditionally. Under our founding charter, college and university students never pay subscription fees. Students receive full access to verified internship boards, senior mentorship circles, campus challenges, and ₹0 admission passes to collegiate hackathons. The network is sustainably funded through enterprise B2B tools and corporate summit ticketing.',
    },
    {
      q: 'How does Cross-Pollination work in practice?',
      a: 'Cross-pollination enables direct, organic collaboration across traditionally segregated groups. For example, a student intern hired by a startup founder can team up with a freelance designer to launch a product, source sustainable raw materials from a verified MSME leader, and pitch their traction to an angel investor—all within the same trusted ecosystem.',
    },
    {
      q: 'How are physical event tickets and admissions secured?',
      a: 'Every admission pass is protected by an offline cryptographic token generated in PostgreSQL. Passholders can export native `.pkpass` files to Apple Wallet or sync with Google Wallet. At physical summit gates, staff use live WebRTC camera hardware scanners with PostgreSQL concurrency locking (`FOR UPDATE`) to verify credentials and detect duplicate check-in attempts instantly.',
    },
    {
      q: 'What are the 5 Trust Verification Tiers?',
      a: 'eongrow implements progressive verification: Contact Verified (OTP email/mobile), Identity Verified (Government/College ID), Professionally Verified (GitHub/Figma portfolio), Business Verified (MCA incorporation/GSTIN certificate), and Special Credentials (institutional partners/super admins). Higher tiers unlock larger intro quotas and priority deal flow.',
    },
    {
      q: 'Can I post opportunities or hire without paying recruitment commissions?',
      a: 'Yes. Registered founders, MSMEs, and creators can post internships, full-time jobs, freelance gigs, and commercial tenders directly to the network. eongrow takes 0% cut on internship stipends, ensuring fair compensation flows directly to talent.',
    },
  ];

  return (
    <PublicLayout
      currentView="landing"
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onGetStarted={onGetStarted}
      onExploreDivision={onExploreDivision}
    >
      <div className="w-full bg-[#07040F]">
        {/* 1. Hero Section with Wayglim Animated Shader Background - 100% Full Screen Viewport */}
        <section className="relative isolate overflow-hidden w-full h-screen min-h-[100dvh] flex flex-col items-center justify-center pt-16 pb-8 px-4 sm:px-6 lg:px-8">
          <WayglimBackground />

          <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
            {/* Primary Headline with Word-by-Word Blur-In Animation */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extralight text-white tracking-[-0.035em] leading-[1.18] sm:leading-[1.14] max-w-4xl mx-auto drop-shadow-sm flex flex-wrap justify-center gap-x-3 sm:gap-x-4 pb-1">
              <span className="inline-flex flex-wrap justify-center gap-x-2.5 sm:gap-x-3.5 py-1">
                {[
                  { text: 'One', delay: 80 },
                  { text: 'verified', delay: 200 },
                  { text: 'identity.', delay: 320 },
                ].map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-block animate-blur-word pb-2 -mb-2"
                    style={{ animationDelay: `${item.delay}ms` }}
                  >
                    {item.text}
                  </span>
                ))}
              </span>
              <span className="inline-flex flex-wrap justify-center gap-x-2.5 sm:gap-x-3.5 font-normal py-1">
                {[
                  { text: 'Seven', delay: 460 },
                  { text: 'thriving', delay: 580 },
                  { text: 'ecosystems.', delay: 700 },
                ].map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-block animate-blur-word text-transparent bg-clip-text bg-gradient-to-r from-white via-white/95 to-white/70 pb-3 -mb-3 pt-1 -mt-1"
                    style={{ animationDelay: `${item.delay}ms` }}
                  >
                    {item.text}
                  </span>
                ))}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              Participate as a student, freelancer, and startup founder simultaneously under a single account. Zero paywalls for students, verified cross-division hiring, and cryptographic summit passes.
            </p>

            {/* Action Row */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <ArrowRevealButton
                onClick={onGetStarted}
                className="w-full sm:w-auto"
              >
                Create Free Account
              </ArrowRevealButton>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate('divisions-page')}
                className="w-full sm:w-auto font-medium apple-press text-sm px-7 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-md transition-all"
              >
                Explore the 7 Ecosystems
              </Button>
            </div>
          </div>
        </section>

        {/* 2. Below-Hero Sections in Clean Light Canvas */}
        <div className="bg-[#F5F6F5] text-[#171C19] space-y-24 pb-24 subtle-mesh">
          {/* Bento Surface with macOS Chrome & Live Workspace UI - Apple Glass Design with entrance animation */}
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20 animate-bento-entrance">
            <div className="rounded-[32px] bg-white/80 backdrop-blur-2xl border border-white/80 shadow-[0_24px_70px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-500">
              {/* Window Chrome Header with macOS Traffic Lights (Glowing dot removed) */}
              <div className="px-5 py-3.5 bg-black/[0.03] backdrop-blur-md border-b border-black/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] shadow-xs" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E] shadow-xs" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28C840] shadow-xs" />
                  </div>
                  <span className="text-xs font-mono text-[#818A84]">eongrow.network · Unified Ecosystem</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-black font-semibold px-2.5 py-0.5 rounded-full bg-black/[0.05] border border-black/10">Active Session: Live</span>
                </div>
              </div>

              {/* Workspace Bento Frame with Frosted Apple Glass UI */}
              <div className="p-6 sm:p-8 relative overflow-hidden space-y-6">
                {/* Full-Container Abstract Backdrop Image */}
                <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
                  <img
                    src={ABSTRACT_IMAGES.cardLight}
                    alt="Abstract Backdrop"
                    className="w-full h-full object-cover opacity-20 scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/85 to-white/95 backdrop-blur-[2px]" />
                </div>

                {/* Division Segmented Badges - Changes Cards on Click without navigating */}
                <div className="relative z-10 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveBentoRole('student')}
                    className={`px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                      activeBentoRole === 'student'
                        ? 'bg-black text-white shadow-xs'
                        : 'bg-black/[0.05] text-[#171C19] hover:bg-black/10 border border-black/10'
                    }`}
                  >
                    Student Network (100% Free)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveBentoRole('founder')}
                    className={`px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                      activeBentoRole === 'founder'
                        ? 'bg-black text-white shadow-xs'
                        : 'bg-black/[0.05] text-[#171C19] hover:bg-black/10 border border-black/10'
                    }`}
                  >
                    Startup Founder & CEO
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveBentoRole('freelancer')}
                    className={`px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                      activeBentoRole === 'freelancer'
                        ? 'bg-black text-white shadow-xs'
                        : 'bg-black/[0.05] text-[#171C19] hover:bg-black/10 border border-black/10'
                    }`}
                  >
                    Freelancer & Designer
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveBentoRole('investor')}
                    className={`px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                      activeBentoRole === 'investor'
                        ? 'bg-black text-white shadow-xs'
                        : 'bg-black/[0.05] text-[#171C19] hover:bg-black/10 border border-black/10'
                    }`}
                  >
                    Investor Deal Room
                  </button>
                </div>

                {/* 3 Live Interaction Mocks Inside Bento Frame - Dynamically Changes Per Role */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-left transition-all duration-300">
                  {/* Card 1: Primary Pipeline */}
                  <div className="p-4.5 rounded-2xl bg-white/85 backdrop-blur-md border border-white/95 shadow-sm space-y-3 apple-press hover:bg-white hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#818A84]">
                        {activeBentoRole === 'student' && 'Internship Brief'}
                        {activeBentoRole === 'founder' && 'Direct Talent Match'}
                        {activeBentoRole === 'freelancer' && 'High-Value Gig Brief'}
                        {activeBentoRole === 'investor' && 'Deal Room Pipeline'}
                      </span>
                      <span className="text-xs font-bold text-black">
                        {activeBentoRole === 'student' && '₹30,000 / mo'}
                        {activeBentoRole === 'founder' && '0% Markups'}
                        {activeBentoRole === 'freelancer' && '₹1,50,000 Milestone'}
                        {activeBentoRole === 'investor' && '₹45L ARR (+32%)'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-normal text-sm text-[#171C19]">
                        {activeBentoRole === 'student' && 'Autonomous Agent Engineer'}
                        {activeBentoRole === 'founder' && 'Senior Full-Stack Lead'}
                        {activeBentoRole === 'freelancer' && 'Design System & Mobile App UI'}
                        {activeBentoRole === 'investor' && 'NeoFlow AI — Pre-Seed Round'}
                      </h4>
                      <p className="text-xs text-[#818A84] mt-0.5">
                        {activeBentoRole === 'student' && 'NeoFlow AI · Hyderabad (Hybrid)'}
                        {activeBentoRole === 'founder' && '3 Qualified Applicants · Career Network'}
                        {activeBentoRole === 'freelancer' && 'FinSprint SaaS · Bangalore (Remote)'}
                        {activeBentoRole === 'investor' && 'Enterprise Workflow AI · Cap Table Verified'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                      {activeBentoRole === 'student' && (
                        <>
                          <span className="px-2 py-0.5 rounded bg-black/[0.04] font-mono text-neutral-700 border border-black/[0.05]">TypeScript</span>
                          <span className="px-2 py-0.5 rounded bg-black/[0.04] font-mono text-neutral-700 border border-black/[0.05]">PostgreSQL Engine</span>
                        </>
                      )}
                      {activeBentoRole === 'founder' && (
                        <>
                          <span className="px-2 py-0.5 rounded bg-black/[0.04] font-mono text-neutral-700 border border-black/[0.05]">RVCE Alumni</span>
                          <span className="px-2 py-0.5 rounded bg-black/[0.04] font-mono text-neutral-700 border border-black/[0.05]">Rust & React</span>
                        </>
                      )}
                      {activeBentoRole === 'freelancer' && (
                        <>
                          <span className="px-2 py-0.5 rounded bg-black/[0.04] font-mono text-neutral-700 border border-black/[0.05]">Figma Systems</span>
                          <span className="px-2 py-0.5 rounded bg-black/[0.04] font-mono text-neutral-700 border border-black/[0.05]">Escrow Protected</span>
                        </>
                      )}
                      {activeBentoRole === 'investor' && (
                        <>
                          <span className="px-2 py-0.5 rounded bg-black/[0.04] font-mono text-neutral-700 border border-black/[0.05]">B2B SaaS</span>
                          <span className="px-2 py-0.5 rounded bg-black/[0.04] font-mono text-neutral-700 border border-black/[0.05]">14 Enterprise Pilots</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card 2: Security & Pass Credential */}
                  <div className="p-4.5 rounded-2xl bg-white/85 backdrop-blur-md border border-black/15 shadow-sm space-y-3 relative overflow-hidden apple-press hover:bg-white hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#818A84]">
                        {activeBentoRole === 'student' && 'Digital Admission Pass'}
                        {activeBentoRole === 'founder' && 'Syndicate Allocation'}
                        {activeBentoRole === 'freelancer' && 'Verified Portfolio Badge'}
                        {activeBentoRole === 'investor' && 'Syndicate Allocation'}
                      </span>
                      <span className="text-xs font-mono font-bold text-black">
                        {activeBentoRole === 'student' && 'TKT-NGTS-8842'}
                        {activeBentoRole === 'founder' && 'SYN-RND-004'}
                        {activeBentoRole === 'freelancer' && 'TIER-3-PRO'}
                        {activeBentoRole === 'investor' && '$1.2M COMMITTED'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 bg-white p-1 rounded-xl shadow-xs">
                        <QRCodeView value="ngf_qr_9e4c19a07b4f2c918e77a2d10c558b3e94fa10b9c2847a" size={56} className="p-1" />
                      </div>
                      <div>
                        <h4 className="font-normal text-xs text-[#171C19] line-clamp-1">
                          {activeBentoRole === 'student' && 'India Tech Summit 2026'}
                          {activeBentoRole === 'founder' && 'Seed Cohort Term Sheet Room'}
                          {activeBentoRole === 'freelancer' && 'Design Director Credential'}
                          {activeBentoRole === 'investor' && 'eongrow Venture Syndicate #4'}
                        </h4>
                        <p className="text-xs text-black font-semibold mt-0.5">
                          {activeBentoRole === 'student' && 'Valid for Offline Scan'}
                          {activeBentoRole === 'founder' && '3 Term Sheets Requested'}
                          {activeBentoRole === 'freelancer' && 'Top 5% Talent Rank'}
                          {activeBentoRole === 'investor' && 'Blume Syndicate Lead'}
                        </p>
                        <p className="text-[10px] text-[#818A84] mt-0.5">
                          {activeBentoRole === 'student' && 'Bangalore Convention Centre'}
                          {activeBentoRole === 'founder' && 'Encrypted Due Diligence'}
                          {activeBentoRole === 'freelancer' && '0% Platform Commission'}
                          {activeBentoRole === 'investor' && 'Closed-Door Roundtable'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Direct Synergy / Warm Intro Match */}
                  <div className="p-4.5 rounded-2xl bg-white/85 backdrop-blur-md border border-white/95 shadow-sm space-y-3 apple-press hover:bg-white hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#818A84]">
                        {activeBentoRole === 'student' && 'Senior Mentorship Match'}
                        {activeBentoRole === 'founder' && 'MSME Supplier Match'}
                        {activeBentoRole === 'freelancer' && 'Client Project Invite'}
                        {activeBentoRole === 'investor' && 'Founder Warm Intro'}
                      </span>
                      <span className="text-xs text-emerald-600 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                        {activeBentoRole === 'student' && 'Mentor'}
                        {activeBentoRole === 'founder' && 'Commercial B2B'}
                        {activeBentoRole === 'freelancer' && 'Direct Client'}
                        {activeBentoRole === 'investor' && 'Warm Pitch'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          activeBentoRole === 'student'
                            ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80'
                            : activeBentoRole === 'founder'
                            ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=80&q=80'
                            : activeBentoRole === 'freelancer'
                            ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80'
                            : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&q=80'
                        }
                        alt="Profile Persona"
                        className="w-10 h-10 rounded-full object-cover border border-black/[0.06]"
                      />
                      <div>
                        <h4 className="font-normal text-xs text-[#171C19]">
                          {activeBentoRole === 'student' && 'Dr. Rajesh Verma'}
                          {activeBentoRole === 'founder' && 'Meera Deshmukh'}
                          {activeBentoRole === 'freelancer' && 'Priya Sharma'}
                          {activeBentoRole === 'investor' && 'Ananya Rao'}
                        </h4>
                        <p className="text-xs text-[#818A84] truncate">
                          {activeBentoRole === 'student' && 'VP of AI @ TechCorp'}
                          {activeBentoRole === 'founder' && 'Managing Director @ Zest Organics'}
                          {activeBentoRole === 'freelancer' && 'Head of Design @ FinSprint'}
                          {activeBentoRole === 'investor' && 'Founder & CEO @ NeoFlow AI'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onGetStarted}
                      className="w-full py-1.5 rounded-full bg-black text-white hover:bg-neutral-800 font-semibold text-xs transition-colors cursor-pointer apple-press shadow-xs"
                    >
                      {activeBentoRole === 'student' && 'Request 1-on-1 Session'}
                      {activeBentoRole === 'founder' && 'Initiate B2B Agreement'}
                      {activeBentoRole === 'freelancer' && 'Accept Project Brief'}
                      {activeBentoRole === 'investor' && 'Schedule 20-min Diligence'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

        {/* 3. Platform Comparison: eongrow vs Fragmented Silos */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extralight text-[#171C19] tracking-[-0.03em]">
              Why eongrow vs Traditional Silos
            </h2>
            <p className="text-xs sm:text-sm text-[#525854]">
              How our unified architecture replaces four disconnected software subscriptions.
            </p>
          </div>

          <div className="apple-card p-0 overflow-hidden border border-black/[0.08]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-black/[0.02] border-b border-black/[0.06] text-[#818A84]">
                    <th className="p-4 sm:p-5 font-semibold">Core Capability</th>
                    <th className="p-4 sm:p-5 font-bold text-black bg-black/[0.04]">eongrow</th>
                    <th className="p-4 sm:p-5 font-normal">Traditional Platforms (LinkedIn / Upwork / Eventbrite)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.06] text-[#525854]">
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-[#171C19]">Student Access Policy</td>
                    <td className="p-4 sm:p-5 text-black font-semibold bg-black/[0.02]">
                      100% Free Forever Charter. ₹0 fees, guaranteed.
                    </td>
                    <td className="p-4 sm:p-5 text-[#818A84]">
                      Aggressive InMail paywalls & expensive monthly subscriptions.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-[#171C19]">Multi-Role Flexibility</td>
                    <td className="p-4 sm:p-5 text-black font-semibold bg-black/[0.02]">
                      One login for Student, Freelancer, Founder, and Investor roles.
                    </td>
                    <td className="p-4 sm:p-5 text-[#818A84]">
                      Fragmented across multiple sites with disconnected reputations.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-[#171C19]">Summit Admission Security</td>
                    <td className="p-4 sm:p-5 text-black font-semibold bg-black/[0.02]">
                      Cryptographic offline Apple Wallet `.pkpass` & WebRTC gate scanner.
                    </td>
                    <td className="p-4 sm:p-5 text-[#818A84]">
                      Paper/email PDFs vulnerable to duplication and screenshot fraud.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-[#171C19]">Student Fair Pay Guarantee</td>
                    <td className="p-4 sm:p-5 text-black font-semibold bg-black/[0.02]">
                      Strict ban on unpaid internships; verified stipends only.
                    </td>
                    <td className="p-4 sm:p-5 text-[#818A84]">
                      Flooded with unvetted zero-pay listings and agency spam.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 4. The 7 Interconnected Networks Showcase with Real Abstract Images */}
        <section id="divisions" className="py-16 bg-white border-y border-black/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extralight text-[#171C19] tracking-[-0.03em]">
                  Seven Specialized Ecosystems
                </h2>
                <p className="text-xs sm:text-sm text-[#525854] mt-1">
                  Each network has its own dedicated tools, perks, and opportunities.
                </p>
              </div>
              <Button
                variant="outline"
                size="md"
                onClick={() => onNavigate('divisions-page')}
                className="apple-press text-xs font-semibold"
              >
                View Complete 7 Networks Page →
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DIVISIONS_LIST.map((div) => {
                const abstractImg = ABSTRACT_IMAGES.divisions[div.slug];

                return (
                  <div
                    key={div.slug}
                    className="apple-card p-0 overflow-hidden flex flex-col justify-between border border-black/[0.08] hover:shadow-lg transition-all group"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={abstractImg}
                        alt={div.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                        <span className="font-semibold text-base drop-shadow-sm tracking-tight">{div.name}</span>
                        {div.isFreeOnly && (
                          <span className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-sm text-[9px] font-bold text-white uppercase border border-white/20">
                            Free Forever
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <p className="text-xs text-black font-semibold">{div.tagline}</p>
                        <p className="text-xs text-[#525854] leading-relaxed line-clamp-2">{div.description}</p>
                      </div>

                      <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between">
                        <button
                          onClick={() => {
                            if (onExploreDivision) onExploreDivision(div.slug);
                            else onNavigate(`network-${div.slug}` as ViewState);
                          }}
                          className="text-xs font-semibold text-black hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Explore Hub</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <span className="text-[11px] text-[#818A84]">{div.badge}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. Cross-Pollination Engine with Textured Card */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extralight text-[#171C19] tracking-[-0.03em]">
              How Collaboration Flows Without Friction
            </h2>
            <p className="text-xs sm:text-sm text-[#525854]">
              Real examples of how value moves across our 7 ecosystems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="apple-card p-6 rounded-[24px] space-y-3 apple-press">
              <span className="w-9 h-9 rounded-xl bg-black/[0.05] text-black flex items-center justify-center font-bold text-xs">01</span>
              <h4 className="font-normal text-sm text-[#171C19] tracking-tight">Student ↔ Startup</h4>
              <p className="text-xs text-[#525854] leading-relaxed">
                CS undergrads match with funded startups for paid AI internships with zero recruitment markups.
              </p>
            </div>
            <div className="apple-card p-6 rounded-[24px] space-y-3 apple-press">
              <span className="w-9 h-9 rounded-xl bg-black/[0.05] text-black flex items-center justify-center font-bold text-xs">02</span>
              <h4 className="font-normal text-sm text-[#171C19] tracking-tight">Business ↔ Freelancer</h4>
              <p className="text-xs text-[#525854] leading-relaxed">
                MSMEs hire vetted UI/UX designers and brand creators with verified escrows and 0% commission cuts.
              </p>
            </div>
            <div className="apple-card p-6 rounded-[24px] space-y-3 apple-press">
              <span className="w-9 h-9 rounded-xl bg-black/[0.05] text-black flex items-center justify-center font-bold text-xs">03</span>
              <h4 className="font-normal text-sm text-[#171C19] tracking-tight">Founder ↔ Investor</h4>
              <p className="text-xs text-[#525854] leading-relaxed">
                Founders receive direct warm intros to angel syndicates without cold emails or blind pitches.
              </p>
            </div>
            <div className="apple-card p-6 rounded-[24px] space-y-3 apple-press">
              <span className="w-9 h-9 rounded-xl bg-black/[0.05] text-black flex items-center justify-center font-bold text-xs">04</span>
              <h4 className="font-normal text-sm text-[#171C19] tracking-tight">Creator ↔ Enterprise</h4>
              <p className="text-xs text-[#525854] leading-relaxed">
                Tech creators connect directly with brand leaders for verified PR campaigns and conference keynotes.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Student Charter Banner with Pure Abstract Backdrop (Zero Green Overlay) */}
        <section id="student-charter" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[28px] bg-[#121413] text-white p-8 sm:p-12 shadow-2xl border border-white/10">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
              <img
                src={ABSTRACT_IMAGES.studentCharter}
                alt="Charter Abstract Texture"
                className="w-full h-full object-cover scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#121413]/90 via-[#121413]/75 to-[#121413]/90 backdrop-blur-[1px]" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight leading-tight">
                  Student Access is a Right, Not a Revenue Stream.
                </h2>
                <p className="text-white/75 text-xs sm:text-sm leading-relaxed">
                  We stand by a strict platform rule: College students and fresh graduates will never be prompted to buy subscriptions to join the Student Network, create profiles, explore internships, or connect with industry mentors.
                </p>
                <div className="flex items-center gap-6 text-xs text-white/70 pt-1">
                  <span>Zero signup fees</span>
                  <span>·</span>
                  <span>Verified mentorship</span>
                  <span>·</span>
                  <span>₹0 Hackathon passes</span>
                </div>
              </div>

              <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={onBrowseEvents || onGetStarted}
                  className="bg-white text-black hover:bg-neutral-100 border-0 font-bold shadow-lg apple-press px-8"
                >
                  Claim Free Student Pass
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onNavigate('student-charter-page')}
                  className="apple-press text-xs font-semibold bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Read Full Charter →
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Flagship Summits & Digital Pass Section */}
        <section id="summits" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extralight text-[#171C19] tracking-[-0.03em]">
                Flagship Summits Across India
              </h2>
              <p className="text-xs sm:text-sm text-[#525854] mt-1">
                Admission passes are protected with cryptographic QR tokens. Check in instantly using your phone.
              </p>
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={() => onNavigate('summits-page')}
              className="apple-press text-xs font-semibold"
            >
              Browse All Summits Page →
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.slice(0, 2).map((evt) => (
              <div
                key={evt.id}
                onClick={() => setSelectedDetailEvent(evt)}
                className="apple-card p-0 overflow-hidden flex flex-col justify-between apple-press border border-black/[0.06] hover:border-black/30 transition-all cursor-pointer group"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={evt.bannerUrl}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 text-white text-xs font-semibold">
                    {evt.city} · {evt.venueName}
                  </div>
                </div>

                <div className="p-7 space-y-3.5">
                  <div className="text-xs text-black font-semibold">
                    {formatDate(evt.startsAt)}
                  </div>

                  <h4 className="font-light text-xl text-[#171C19] group-hover:text-black transition-colors tracking-tight">
                    {evt.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#525854] leading-relaxed line-clamp-2">{evt.shortDescription}</p>

                  <div className="pt-3 flex items-center justify-between border-t border-black/[0.06]">
                    <div className="text-xs text-[#818A84]">
                      Instant Digital Wallet QR
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDetailEvent(evt);
                        }}
                        className="apple-press text-xs font-medium"
                      >
                        View Details
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDetailEvent(evt);
                        }}
                        className="apple-press text-xs font-semibold"
                      >
                        Register Pass
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. Comprehensive Interactive FAQ Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extralight text-[#171C19] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#818A84]">
              Everything you need to know about the eongrow network architecture.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="apple-card p-5 border border-black/[0.06] transition-all cursor-pointer"
                  onClick={() => toggleFaq(idx)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="font-light text-sm sm:text-base text-[#171C19] tracking-tight">{faq.q}</h4>
                    <ChevronDown
                      className={`w-4 h-4 text-[#818A84] transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? 'rotate-180 text-black' : ''
                      }`}
                    />
                  </div>
                  {isOpen && (
                    <div className="mt-3 pt-3 border-t border-black/[0.06] text-xs sm:text-sm text-[#525854] leading-relaxed animate-in fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 9. Final Call to Action with Ambient Abstract Texture */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="relative overflow-hidden rounded-[28px] bg-[#171C19] text-white p-8 sm:p-14 border border-white/10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
              <img
                src={ABSTRACT_IMAGES.meshFlow}
                alt="Texture"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="relative z-10 max-w-xl space-y-3">
              <h3 className="text-3xl sm:text-4xl font-extralight text-white tracking-tight leading-tight">
                Join India's unified professional community.
              </h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Connect with verified peers, explore paid internships, hire top designers, and check in to premier tech summits today.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
              <ArrowRevealButton
                onClick={onGetStarted}
                className="w-full sm:w-auto h-11 px-7 text-xs font-bold"
              >
                Create Free Account
              </ArrowRevealButton>
              <Button
                variant="outline"
                size="lg"
                onClick={onSignIn}
                className="w-full sm:w-auto apple-press text-xs font-semibold bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Sign In
              </Button>
            </div>
          </div>
        </section>
        </div>
      </div>

      {/* Detail Mode Modal */}
      {selectedDetailEvent && (
        <EventDetailModal
          isOpen={Boolean(selectedDetailEvent)}
          event={selectedDetailEvent}
          onClose={() => setSelectedDetailEvent(null)}
          onRequireAuth={onGetStarted}
        />
      )}
    </PublicLayout>
  );
};