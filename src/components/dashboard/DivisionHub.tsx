import React, { useState } from 'react';
import {
  Layers,
  Compass,
  Briefcase,
  Users,
  Calendar,
  CreditCard,
  Sparkles,
  Award,
  Rocket,
  Building2,
  TrendingUp,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useDivision } from '../../context/useDivision';
import type { FeatureTab } from '../../context/divisionContextDef';
import { ABSTRACT_IMAGES } from '../../lib/abstractImages';
import { formatCurrency } from '../../lib/utils';
import type { DivisionSlug, ViewState } from '../../types/app.types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface DivisionHubProps {
  onNavigate: (view: ViewState) => void;
}

export const DivisionHub: React.FC<DivisionHubProps> = ({ onNavigate }) => {
  const { joinDivision } = useAuth();
  const {
    currentDivision,
    divisionMeta,
    isJoined,
    isExploring,
    registeredDivisions,
    setDivision,
    activeFeatureTab,
    setActiveFeatureTab,
  } = useDivision();

  const [isJoining, setIsJoining] = useState(false);
  const [selectedPreviewModule, setSelectedPreviewModule] = useState<any | null>(null);

  const isUserJoined = isJoined(currentDivision);

  const handleJoin = async () => {
    setIsJoining(true);
    await joinDivision(currentDivision);
    setIsJoining(false);
  };

  // Division-specific modules/toolkits with curated Unsplash photography
  const getDivisionSpecificModules = (slug: DivisionSlug) => {
    switch (slug) {
      case 'student':
        return [
          {
            id: 'mod-1',
            title: 'Verified Student Job & Internship Board',
            desc: 'Curated entry-level roles, summer research fellowships, and funded tech internships with stipends up to ₹45,000/mo.',
            image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
            icon: Briefcase,
            capabilities: [
              'Zero unpaid ghost roles guarantee',
              'Fast-track referral loops with partner startups',
              'Stipend escrow and academic credit verification',
            ],
            workflow: ['Upload resume or Github link', 'One-click apply to vetted tech roles', 'Direct interview invitations'],
            action: 'Explore Internships Feature',
            view: 'opportunities' as ViewState,
          },
          {
            id: 'mod-2',
            title: 'National Student Hackathons & AI Challenges',
            desc: 'Join 36-hour national college hackathons with ₹5 Lakh+ prize pool, cloud sponsor credits, and recruiter fast-tracks.',
            image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
            icon: Rocket,
            capabilities: [
              'Pre-formed team squads and discord rooms',
              'Complimentary cloud credits & API keys',
              'Live demos in front of top VC angels',
            ],
            workflow: ['Register student squad', 'Receive hackathon problem statement', 'Submit working demo and win grants'],
            action: 'Browse Hackathons Feature',
            view: 'events' as ViewState,
          },
          {
            id: 'mod-3',
            title: 'Senior Alumni & Career Mentorship Circles',
            desc: 'Book free 30-minute 1-on-1 resume reviews and career navigation sessions with working professionals in Tier-1 firms.',
            image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
            icon: Users,
            capabilities: [
              'Direct pairing with engineers at Google, Microsoft, Swiggy',
              'System design and coding interview mock reviews',
              'Career pathing and grad school guidance',
            ],
            workflow: ['Choose mentor domain', 'Select free calendar slot', 'Join 30-minute 1-on-1 video call'],
            action: 'Find a Mentor Feature',
            view: 'directory' as ViewState,
          },
          {
            id: 'mod-4',
            title: 'Free Student Network Membership Guarantee',
            desc: 'As per eongrow founding charter, student membership is 100% free forever. Pay only for optional paid summit passes.',
            image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
            icon: Award,
            capabilities: [
              'Zero membership charges forever',
              'Free access to deep-tech courses and community modules',
              'Student affiliate ambassador earning eligibility',
            ],
            workflow: ['Sign in with campus email', 'Instant verified student activation', 'Lifetime free access guarantee'],
            action: 'View Student Charter',
            view: 'memberships' as ViewState,
          },
        ];
      case 'career':
        return [
          {
            id: 'mod-1',
            title: 'Confidential Lateral Job Referrals',
            desc: 'Direct internal referrals into Tier-1 product companies and executive roles across Bangalore, Hyderabad & NCR.',
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
            icon: Briefcase,
            capabilities: [
              'Blind candidate profiling for total confidentiality',
              'Direct submission to VP and Director-level hiring loops',
              'Executive compensation benchmark data (₹25L - ₹80L+ CTC)',
            ],
            workflow: ['Configure confidential visibility', 'Select target target firms & salary bracket', 'Warm referral intro by peer'],
            action: 'View Referrals Feature',
            view: 'opportunities' as ViewState,
          },
          {
            id: 'mod-2',
            title: 'Executive Masterclasses & Leadership Circles',
            desc: 'Monthly masterclasses with CTOs, VPs, and Fortune 500 leaders on scaling teams and executive presence.',
            image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
            icon: Compass,
            capabilities: [
              'Closed-door case study tear-downs',
              'Engineering leadership and VP transition frameworks',
              'Interactive Q&A and private networking circles',
            ],
            workflow: ['Claim member masterclass pass', 'Access prep deck and case study', 'Attend live executive masterclass'],
            action: 'Register Masterclass Feature',
            view: 'events' as ViewState,
          },
          {
            id: 'mod-3',
            title: 'Verified Professional Networking Directory',
            desc: 'Connect with senior engineering managers, product leads, and management consultants across industries.',
            image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
            icon: Users,
            capabilities: [
              'LinkedIn and corporate email verified badges',
              'Domain tags: SaaS, FinTech, AI, HealthTech, DeepTech',
              'Direct introduction requests via chapter leads',
            ],
            workflow: ['Filter by city, title, or company', 'Review verified credentials and career bio', 'Request confidential intro'],
            action: 'Discover Professionals Feature',
            view: 'directory' as ViewState,
          },
        ];
      case 'freelancer':
        return [
          {
            id: 'mod-1',
            title: 'High-Value Client Project Marketplace',
            desc: 'Bid on verified design, engineering, copywriting, and marketing projects with 100% secured escrows.',
            image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
            icon: Briefcase,
            capabilities: [
              '100% project milestone escrow protection',
              'Zero platform commission cuts on private contracts',
              'Verified enterprise and founder client briefs',
            ],
            workflow: ['Browse client project briefs', 'Submit tailored proposal & portfolio link', 'Escrow locked before kickoff'],
            action: 'Explore Client Gigs Feature',
            view: 'opportunities' as ViewState,
          },
          {
            id: 'mod-2',
            title: 'Interactive Portfolio & Case Study Showcase',
            desc: 'Showcase your best case studies, Figma designs, and GitHub projects to business owners and marketing directors.',
            image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
            icon: Sparkles,
            capabilities: [
              'Embed Figma prototypes, live URLs, and GitHub repos',
              'Verified peer testimonials and rating badges',
              'Inbound direct enquiry form attached to your profile',
            ],
            workflow: ['Build interactive case studies', 'Link client outcomes and ROI metrics', 'Receive direct client DMs'],
            action: 'Update Portfolio Feature',
            view: 'settings' as ViewState,
          },
          {
            id: 'mod-3',
            title: 'Freelancer Squads & Subcontracting',
            desc: 'Team up with other specialists to take on enterprise contracts beyond individual bandwidth.',
            image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
            icon: Users,
            capabilities: [
              'Squad creation with split-payout escrow agreements',
              'Cross-discipline pairing (e.g. Designer + Engineer + Marketer)',
              'Pitch collectively to enterprise accounts',
            ],
            workflow: ['Create or join a specialized squad', 'Pool domain expertise into one proposal', 'Deliver enterprise engagements'],
            action: 'Find Collaborators Feature',
            view: 'directory' as ViewState,
          },
        ];
      case 'entrepreneur':
        return [
          {
            id: 'mod-1',
            title: 'Smart Co-Founder Discovery Matchmaker',
            desc: 'Find business or technical co-founders with complementary skill sets, shared equity expectations, and commitment.',
            image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80',
            icon: Users,
            capabilities: [
              'Complementary skill matching (Tech vs. GTM vs. Ops)',
              'Standardized equity split & vesting agreement templates',
              'Verified background checks and previous exits',
            ],
            workflow: ['Define venture thesis & required co-founder traits', 'Auto-matched with verified candidates', 'Book private alignment dinner'],
            action: 'Search Co-Founders Feature',
            view: 'opportunities' as ViewState,
          },
          {
            id: 'mod-2',
            title: 'Closed-Door Pitch Days & Demo Lounges',
            desc: 'Present your pitch deck directly to angel syndicates and institutional venture funds.',
            image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
            icon: Rocket,
            capabilities: [
              'Direct stage time in front of active seed investors',
              'Pre-screened room: zero non-accredited observers',
              'Same-day term sheet & syndicate syndicate notes',
            ],
            workflow: ['Submit pitch deck and metrics', 'Screening review by investment committee', 'Present live at demo day'],
            action: 'Summit Demo Days Feature',
            view: 'events' as ViewState,
          },
          {
            id: 'mod-3',
            title: '$50,000+ eongrow Startup Perks & Credits',
            desc: 'Exclusive cloud hosting credits, legal incorporation toolkits, and banking discounts for registered founders.',
            image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=800&q=80',
            icon: Award,
            capabilities: [
              'AWS / GCP / Azure cloud credits up to $25k',
              'Stripe processing fee waivers & Notion for Startups',
              'Discounted corporate banking and legal incorporation',
            ],
            workflow: ['Verify registered venture status', 'Claim promotional vouchers and API keys', 'Deploy infrastructure cost-free'],
            action: 'Claim Perks Feature',
            view: 'memberships' as ViewState,
          },
        ];
      case 'business':
        return [
          {
            id: 'mod-1',
            title: 'B2B Buyer & Supplier Directory',
            desc: 'Verified vendors, OEMs, distributors, and bulk raw material suppliers across industrial clusters.',
            image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
            icon: Building2,
            capabilities: [
              'GSTIN and MCA verified corporate business profiles',
              'Clustered by industrial hubs: Pune, Surat, NCR, Peenya',
              'Direct procurement inquiries and RFQs',
            ],
            workflow: ['Search by industry, capability, or raw material', 'Review audited factory & turnover credentials', 'Send direct RFQ'],
            action: 'Browse Vendors Feature',
            view: 'directory' as ViewState,
          },
          {
            id: 'mod-2',
            title: 'Tender & Business Requirements Board',
            desc: 'Post commercial procurement tenders and receive vetted proposals from regional partners.',
            image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
            icon: Briefcase,
            capabilities: [
              'Procurement tenders from ₹5 Lakh to ₹50 Crore+',
              'Pre-screened bidder qualifications & delivery track records',
              'Commercial dispute resolution and contract mediation',
            ],
            workflow: ['Post commercial RFP or material requirement', 'Receive vetted quotes from certified suppliers', 'Finalize supply contract'],
            action: 'View Requirements Feature',
            view: 'opportunities' as ViewState,
          },
          {
            id: 'mod-3',
            title: 'High-Level Chapter Trade Delegations',
            desc: 'Participate in inter-city business expos, networking dinners, and commercial delegation summits.',
            image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
            icon: Compass,
            capabilities: [
              'Cross-state buyer-seller meetups',
              'Private executive dining with chamber presidents',
              'Exhibition booth discounts at national expos',
            ],
            workflow: ['Register for chapter trade summit', 'Receive curated 1-on-1 B2B meeting schedule', 'Execute strategic partnerships'],
            action: 'Chapter Events Feature',
            view: 'events' as ViewState,
          },
        ];
      case 'influencer':
        return [
          {
            id: 'mod-1',
            title: 'Direct Brand Campaign Briefs',
            desc: 'Sponsorship offers and PR campaigns with verified budgets and upfront payment commitments.',
            image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
            icon: Briefcase,
            capabilities: [
              '100% upfront brand escrow protection',
              'Pre-negotiated usage rights and contract terms',
              'Direct communications with brand marketing heads',
            ],
            workflow: ['Review active brand briefs and target niches', 'Submit rate card and content angle', 'Deliver campaign and receive funds'],
            action: 'Brand Campaigns Feature',
            view: 'opportunities' as ViewState,
          },
          {
            id: 'mod-2',
            title: 'Verified Media Kit & Analytics Badge',
            desc: 'Link your YouTube, Instagram, and LinkedIn stats to showcase verified audience engagement to sponsors.',
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
            icon: Sparkles,
            capabilities: [
              'Live API data on subscriber engagement & demographics',
              'eongrow Verified Creator Trust Badge',
              'One-click shareable media kit link for sponsor decks',
            ],
            workflow: ['Connect social media analytics channels', 'Auto-generate audited performance metrics', 'Share verified link with brands'],
            action: 'Update Media Kit Feature',
            view: 'settings' as ViewState,
          },
          {
            id: 'mod-3',
            title: 'Creator Collaboration Meetups',
            desc: 'Co-produce podcasts, joint live-streams, and collaborative video content with fellow creators.',
            image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
            icon: Users,
            capabilities: [
              'Cross-creator studio sessions in major cities',
              'Audience cross-pollination and joint productions',
              'Access to discounted production gear and studios',
            ],
            workflow: ['Discover creators in complementary niches', 'Propose collaborative video or podcast topic', 'Record and co-distribute'],
            action: 'Creator Network Feature',
            view: 'directory' as ViewState,
          },
        ];
      case 'investor':
        return [
          {
            id: 'mod-1',
            title: 'Vetted Startup Pipeline & Pitch Decks',
            desc: 'Access pre-screened early-stage startups with traction, verified unit economics, and audited cap tables.',
            image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80',
            icon: TrendingUp,
            capabilities: [
              'Pre-vetted deal flow filtered by industry, ARR, and stage',
              'Standardized 1-page investment memos & data rooms',
              'Audited financial metrics and founder background checks',
            ],
            workflow: ['Filter deal pipeline by stage and check size', 'Access founder data rooms with one click', 'Schedule founder deep-dive'],
            action: 'View Deal Flow Feature',
            view: 'opportunities' as ViewState,
          },
          {
            id: 'mod-2',
            title: 'Co-Investment Syndicates & Investor Roundtables',
            desc: 'Collaborate with angel networks and institutional VCs on co-investment opportunities.',
            image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
            icon: Compass,
            capabilities: [
              'Syndicate SPV infrastructure with zero legal hassle',
              'Co-invest alongside lead VCs in high-conviction rounds',
              'Closed-door quarterly portfolio review breakfasts',
            ],
            workflow: ['Join verified investor syndicate', 'Review lead investor thesis & allocation', 'Participate with flexible check sizes'],
            action: 'Private Roundtables Feature',
            view: 'events' as ViewState,
          },
          {
            id: 'mod-3',
            title: 'Strategic Advisory & Board Placements',
            desc: 'Connect with portfolio companies seeking independent board advisors and growth mentors.',
            image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
            icon: Award,
            capabilities: [
              'Advisory equity agreements (FAST framework standard)',
              'Quarterly board meeting alignment',
              'Strategic GTM & enterprise customer introductions',
            ],
            workflow: ['List advisory domains & desired equity terms', 'Matched with accelerating ventures', 'Sign standardized advisory agreement'],
            action: 'Advisory Roles Feature',
            view: 'directory' as ViewState,
          },
        ];
    }
  };

  const modules = getDivisionSpecificModules(currentDivision);

  // Pricing details by division
  const getPricingDetails = (slug: DivisionSlug) => {
    switch (slug) {
      case 'student':
        return {
          title: 'Student Network Access',
          yearlyStandard: 0,
          yearlyWomen: 0,
          isFree: true,
          planDesc: 'Guaranteed 100% free forever for all college students and fresh graduates.',
        };
      case 'investor':
        return {
          title: 'Investor Network Access',
          yearlyStandard: 0,
          yearlyWomen: 0,
          isFree: true,
          planDesc: 'Vetted invite-only membership for accredited angels and venture partners.',
        };
      case 'entrepreneur':
        return {
          title: 'Startup Founder Membership',
          yearlyStandard: 5000,
          yearlyWomen: 2500,
          lifetimeStandard: 30000,
          lifetimeWomen: 15000,
          isFree: false,
          planDesc: 'Full founder perks, co-founder matchmaker, demo day stages, and $50k+ cloud credits.',
        };
      case 'business':
        return {
          title: 'Business Owner Membership',
          yearlyStandard: 9999,
          yearlyWomen: 4999,
          lifetimeStandard: 60000,
          lifetimeWomen: 30000,
          isFree: false,
          planDesc: 'Commercial tender board, verified supplier directory, and chapter trade delegations.',
        };
      default: // freelancer, career, influencer
        return {
          title: `${divisionMeta.name.split(' ')[0]} Membership`,
          yearlyStandard: 3000,
          yearlyWomen: 1500,
          monthlyStandard: 499,
          monthlyWomen: 249,
          isFree: false,
          planDesc: 'Marketplace access, escrow protection, verified directory badge, and masterclasses.',
        };
    }
  };

  const pricing = getPricingDetails(currentDivision);

  // Sample blueprint items to showcase the Opportunity Engine feature without rendering raw DB data
  const getSampleOpportunityBlueprint = (slug: DivisionSlug) => {
    switch (slug) {
      case 'student':
        return [
          { role: 'AI Platform Engineering Intern', org: 'VectorFlow AI', pay: '₹35,000 / month', type: 'Funded Internship', tags: ['Python', 'LLMs', 'FastAPI'], city: 'Bangalore (Hybrid)' },
          { role: 'Frontend & Design System Fellow', org: 'NovaStack Labs', pay: '₹30,000 / month', type: 'Summer Fellowship', tags: ['React', 'TypeScript', 'Tailwind'], city: 'Remote' },
          { role: 'Campus Ambassador & Developer Relations', org: 'eongrow Student Hub', pay: '₹18,000 / month', type: 'Part-Time Ambassador', tags: ['Community', 'Events', 'Workshops'], city: 'Pan-India' },
        ];
      case 'career':
        return [
          { role: 'Principal Distributed Systems Architect', org: 'FinScale Product Corp', pay: '₹55,00,000 - ₹75,00,000 / yr', type: 'Executive Lateral Role', tags: ['Go', 'Postgres', 'Distributed Consensus'], city: 'Bangalore' },
          { role: 'Director of Product Management', org: 'HyperRetail Enterprise', pay: '₹48,00,000 - ₹65,00,000 / yr', type: 'Leadership Placement', tags: ['B2B SaaS', 'GTM Strategy', 'Org Scaling'], city: 'Hyderabad' },
        ];
      case 'freelancer':
        return [
          { role: 'Design System & Micro-Interactions Spec', org: 'Apex Payments Inc', pay: '₹2,50,000 (Escrowed)', type: 'Fixed Milestone Gig', tags: ['Figma', 'Tokens', 'Component Library'], city: 'Remote' },
          { role: 'Next.js 15 Migration & Performance Audit', org: 'OmniCloud India', pay: '₹1,80,000 (Escrowed)', type: 'Contract Sprint', tags: ['Next.js', 'Turbopack', 'Vercel'], city: 'Remote' },
        ];
      case 'entrepreneur':
        return [
          { role: 'Technical Co-Founder (CTO)', org: 'Agentic Logistics AI', pay: '25% - 35% Equity + ₹18L Cliff', type: 'Co-Founder Search', tags: ['Autonomous Agents', 'Full-Stack', 'Early Traction'], city: 'Bangalore' },
          { role: 'Growth & GTM Co-Founder', org: 'KisanDirect MSME', pay: '20% - 30% Equity + Seed Backing', type: 'Co-Founder Search', tags: ['B2B Sales', 'Agritech Supply', 'Fundraising'], city: 'Pune' },
        ];
      case 'business':
        return [
          { role: 'Sustainable Corrugated Packaging Annual RFP', org: 'Zenith Logistics Group', pay: '₹45,00,000 Annual Value', type: 'Commercial Tender', tags: ['OEM Supply', 'ISO 9001', 'Bulk Logistics'], city: 'Mumbai Hub' },
          { role: 'Cold-Chain Warehousing & Delivery Partner', org: 'FreshRoute Foods', pay: '₹80,00,000 Multi-Year Contract', type: 'Procurement Requirement', tags: ['Cold Storage', 'Fleet Ops', 'West India'], city: 'Pune / Mumbai' },
        ];
      case 'influencer':
        return [
          { role: 'Q1 AI Developer Tool Launch Integration', org: 'CodeMatrix Labs', pay: '₹3,50,000 (Upfront Escrow)', type: 'Sponsored Campaign', tags: ['YouTube Video', 'LinkedIn Carousel', 'Developer Audience'], city: 'Pan-India' },
          { role: 'National Tech Summit Keynote & Livestream Host', org: 'eongrow Summits', pay: '₹2,00,000 Honorarium', type: 'Event Host & PR', tags: ['Keynote', 'Podcast Live', 'Interviews'], city: 'Hyderabad' },
        ];
      case 'investor':
        return [
          { role: 'Enterprise Agentic Automation Seed Round', org: 'AutoCorp AI (Pre-Money: ₹28 Cr)', pay: '$1,200,000 Round (₹25L Check)', type: 'Syndicated Deal Note', tags: ['B2B SaaS', '₹1.8 Cr ARR', 'Audited Cap Table'], city: 'Bangalore' },
          { role: 'Cross-Border Supply Chain FinTech Pre-Series A', org: 'PayPort Direct (Pre-Money: ₹65 Cr)', pay: '$2,500,000 Round (₹50L Check)', type: 'Lead Investor Co-Allocation', tags: ['FinTech', 'RBI NBFC Partner', '3.4x YoY'], city: 'Mumbai' },
        ];
    }
  };

  const sampleOpportunities = getSampleOpportunityBlueprint(currentDivision);

  const tabs: Array<{ id: FeatureTab; label: string; icon: any }> = [
    { id: 'overview', label: 'All Features & Overview', icon: Layers },
    { id: 'toolkits', label: 'Workspaces & Toolkits', icon: Compass },
    { id: 'opportunities', label: 'Opportunities Engine', icon: Briefcase },
    { id: 'community', label: 'Verified Community', icon: Users },
    { id: 'summits', label: 'Summits & Passes', icon: Calendar },
    { id: 'pricing', label: 'Plans & Pricing', icon: CreditCard },
  ];

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto pb-16">
      {/* 1. Header Banner */}
      <div
        className="rounded-[30px] p-6 sm:p-9 text-white relative overflow-hidden shadow-sm apple-card border-0"
        style={{ backgroundColor: divisionMeta.colorHex }}
      >
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={ABSTRACT_IMAGES.divisions[currentDivision] || ABSTRACT_IMAGES.meshFlow}
            alt="Division Texture"
            className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity scale-105"
          />
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            {isExploring && (
              <span className="text-xs font-mono text-amber-200 block">
                Preview Mode (All Features)
              </span>
            )}
            <h1 className="text-2xl sm:text-4xl font-extralight tracking-tight">{divisionMeta.name}</h1>
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
              {divisionMeta.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-shrink-0">
            {isUserJoined ? (
              <div className="bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full text-xs font-bold text-white border border-white/30 text-center">
                ✓ Active Workspace Member
              </div>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="md"
                  isLoading={isJoining}
                  onClick={pricing.isFree ? handleJoin : () => onNavigate('memberships')}
                  className="bg-white text-black hover:bg-neutral-100 border-0 font-bold shadow-md apple-press px-6 text-xs"
                >
                  {pricing.isFree
                    ? `Join ${divisionMeta.name.split(' ')[0]} (100% Free)`
                    : `Join Network from ${formatCurrency(pricing.yearlyStandard)}/yr`}
                </Button>
                {registeredDivisions.length > 0 && (
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => {
                      setDivision(registeredDivisions[0].slug);
                      onNavigate('dashboard');
                    }}
                    className="bg-white/10 text-white hover:bg-white/20 border-white/30 backdrop-blur-sm text-xs font-semibold"
                  >
                    Return to {registeredDivisions[0].name.split(' ')[0]}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Decorative ambient blur */}
        <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      </div>

      {/* 2. Apple Segmented Feature Tab Navigation */}
      <div className="apple-card p-1.5 border border-black/[0.08] flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-white/80 backdrop-blur-xl rounded-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFeatureTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveFeatureTab(tab.id);
                if (tab.id === 'pricing') {
                  onNavigate('memberships');
                }
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer apple-press flex-1 justify-center ${
                isActive
                  ? 'bg-black text-white shadow-xs'
                  : 'text-[#525854] hover:text-black hover:bg-black/[0.04]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#818A84]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: OVERVIEW & ALL FEATURES */}
      {activeFeatureTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Ecosystem Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="apple-card p-5 border border-black/[0.06]">
              <span className="text-xs text-[#818A84]">Ecosystem Scale</span>
              <h4 className="text-xl sm:text-2xl font-light text-[#171C19] mt-1">5,000+ Verified</h4>
              <p className="text-[11px] text-black font-semibold mt-0.5">Active Network Peers</p>
            </div>
            <div className="apple-card p-5 border border-black/[0.06]">
              <span className="text-xs text-[#818A84]">Regional Chapters</span>
              <h4 className="text-xl sm:text-2xl font-light text-[#171C19] mt-1">7 Metro Hubs</h4>
              <p className="text-[11px] text-[#818A84] mt-0.5">BLR, HYD, BOM, NCR & More</p>
            </div>
            <div className="apple-card p-5 border border-black/[0.06]">
              <span className="text-xs text-[#818A84]">Trust Standard</span>
              <h4 className="text-xl sm:text-2xl font-light text-[#171C19] mt-1">100% Vetted</h4>
              <p className="text-[11px] text-black font-semibold mt-0.5">Multi-tier ID Protocol</p>
            </div>
            <div className="apple-card p-5 border border-black/[0.06]">
              <span className="text-xs text-[#818A84]">Pass Entitlement</span>
              <h4 className="text-xl sm:text-2xl font-light text-[#171C19] mt-1">25% Discount</h4>
              <p className="text-[11px] text-black font-semibold mt-0.5">+ 3 Free Lifetime Passes</p>
            </div>
          </div>

          {/* Core Capabilities Bento */}
          <div className="apple-card p-6 sm:p-8 border border-black/[0.06] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-black/[0.06]">
              <div>
                <h3 className="font-light text-xl text-[#171C19] tracking-tight">Core Ecosystem Capabilities</h3>
                <p className="text-xs text-[#818A84] mt-0.5">
                  Every capability unlocked when enrolled in the {divisionMeta.name}.
                </p>
              </div>
              <span className="text-xs font-mono text-[#818A84]">
                {divisionMeta.features?.length || 6} Capabilities
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(divisionMeta.features || []).map((feat, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.06] hover:bg-black/[0.04] transition-colors space-y-2 apple-press"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-black/[0.06] flex items-center justify-center text-black flex-shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <h4 className="font-semibold text-xs text-[#171C19] leading-tight">{feat}</h4>
                  </div>
                  <p className="text-[11px] text-[#818A84] leading-relaxed pl-9">
                    Included for all verified members with zero hidden add-on platform fees.
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Why Join Callout */}
          <div className="apple-card p-6 sm:p-8 border border-black/[0.06] bg-gradient-to-br from-white via-white to-black/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h3 className="font-light text-2xl text-[#171C19] tracking-tight">
                Accelerate your growth in {divisionMeta.name}
              </h3>
              <p className="text-xs text-[#525854] leading-relaxed">
                Connect with peers who share your exact professional objectives. From confidential deal flow to verified supplier networks, eongrow removes the friction of cold outreach.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={pricing.isFree ? handleJoin : () => onNavigate('memberships')}
                className="apple-press text-xs font-semibold px-6"
              >
                {pricing.isFree ? 'Join Network (Free)' : 'View Plans & Join →'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WORKSPACES & SPECIALIZED TOOLKITS */}
      {activeFeatureTab === 'toolkits' && (
        <div className="space-y-6">
          <div className="apple-card p-6 sm:p-8 border border-black/[0.06]">
            <h3 className="font-light text-2xl text-[#171C19] tracking-tight mb-1">
              {divisionMeta.name} Workspaces & Toolkits
            </h3>
            <p className="text-xs text-[#818A84] mb-6">
              Specialized operational tools custom-designed for this division's workflow.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {modules.map((mod) => {
                const Icon = mod.icon || Layers;

                return (
                  <div
                    key={mod.id}
                    className="rounded-[24px] border border-black/[0.08] bg-white flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out apple-press group"
                  >
                    {/* Visual Card Image Header */}
                    {mod.image && (
                      <div className="relative h-44 overflow-hidden bg-[#171C19]">
                        <img
                          src={mod.image}
                          alt={mod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                        <div className="absolute top-3.5 left-3.5">
                          <div className="w-9 h-9 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xs">
                            <Icon className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="absolute bottom-3 left-4 right-4">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-white/80 font-medium block">
                            Feature Toolkit
                          </span>
                          <h4 className="font-normal text-base text-white tracking-tight drop-shadow-sm truncate">
                            {mod.title}
                          </h4>
                        </div>
                      </div>
                    )}

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        {!mod.image && (
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-2xl bg-black/[0.04] flex items-center justify-center text-black">
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#818A84]">
                              Feature Module
                            </span>
                          </div>
                        )}

                        <p className="text-xs text-[#818A84] leading-relaxed">{mod.desc}</p>

                        <div className="mt-4 pt-3 border-t border-black/[0.04] space-y-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#818A84] block font-medium">
                            Capabilities Included
                          </span>
                          {mod.capabilities?.map((cap: string, cIdx: number) => (
                            <div key={cIdx} className="flex items-center gap-2 text-xs text-[#525854]">
                              <span className="text-[#818A84] font-medium select-none">—</span>
                              <span>{cap}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
                        <span className="text-[11px] text-[#818A84] font-mono">3-Step Workflow</span>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedPreviewModule(mod)}
                          className="apple-press text-xs font-semibold"
                        >
                          Preview Workflow →
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OPPORTUNITIES & ROLES FEATURE ENGINE */}
      {activeFeatureTab === 'opportunities' && (
        <div className="space-y-6">
          <div className="apple-card p-6 sm:p-8 border border-black/[0.06] space-y-6">
            <div>
              <h3 className="font-light text-2xl text-[#171C19] tracking-tight">
                Curated Opportunities & Role Matchmaking
              </h3>
              <p className="text-xs text-[#818A84] mt-1 max-w-2xl leading-relaxed">
                eongrow does not allow open spam listings. All opportunities in this network are pre-screened with verified budgets, clear compensation, and escrow protections.
              </p>
            </div>

            {/* Feature Guarantees Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.06] space-y-1">
                <span className="text-xs font-bold text-[#171C19]">100% Verified Posters</span>
                <p className="text-[11px] text-[#818A84] leading-relaxed">
                  Only GSTIN/MCA-verified organizations and approved partners can publish roles.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.06] space-y-1">
                <span className="text-xs font-bold text-[#171C19]">Fair Compensation Standard</span>
                <p className="text-[11px] text-[#818A84] leading-relaxed">
                  No unpaid internships, no ghost roles. Full salary or stipend disclosure upfront.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.06] space-y-1">
                <span className="text-xs font-bold text-[#171C19]">Escrow Protection</span>
                <p className="text-[11px] text-[#818A84] leading-relaxed">
                  Freelance contracts and corporate procurement RFQs secure funds in verified escrows.
                </p>
              </div>
            </div>

            {/* Sample Blueprint Format (Feature Preview, Not Live Data) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#171C19]">
                  Sample Opportunity Blueprints in {divisionMeta.name}
                </h4>
                <span className="text-[11px] text-[#818A84]">Feature Blueprint Preview</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sampleOpportunities.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-black/[0.06] bg-black/[0.01] hover:bg-white hover:shadow-xs transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs text-[#818A84]">
                      <span className="font-semibold text-black">{item.type}</span>
                      <span>{item.city}</span>
                    </div>
                    <div>
                      <h5 className="font-normal text-sm text-[#171C19]">{item.role}</h5>
                      <p className="text-xs text-[#818A84] mt-0.5">{item.org}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-black/[0.04]">
                      <span className="text-xs font-semibold text-[#171C19]">{item.pay}</span>
                      <div className="flex items-center gap-1">
                        {item.tags.map((tg) => (
                          <span key={tg} className="text-[10px] px-2 py-0.5 rounded-md bg-black/[0.04] text-[#525854]">
                            {tg}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Callout */}
            <div className="p-5 rounded-2xl bg-[#171C19] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold">Ready to apply to live roles or hire talent?</h4>
                <p className="text-xs text-white/70 mt-0.5">
                  Join the {divisionMeta.name} to view active applicants, direct hiring contacts, and full job briefs.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={pricing.isFree ? handleJoin : () => onNavigate('memberships')}
                className="bg-white text-black hover:bg-neutral-100 font-semibold text-xs border-0 flex-shrink-0"
              >
                {pricing.isFree ? 'Unlock Live Board (Free)' : 'Join to Apply & Post →'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VERIFIED COMMUNITY & DIRECTORY FEATURE */}
      {activeFeatureTab === 'community' && (
        <div className="space-y-6">
          <div className="apple-card p-6 sm:p-8 border border-black/[0.06] space-y-6">
            <div>
              <h3 className="font-light text-2xl text-[#171C19] tracking-tight">
                eongrow Verified Member Directory
              </h3>
              <p className="text-xs text-[#818A84] mt-1 max-w-2xl leading-relaxed">
                Connect directly with verified leaders, innovators, and suppliers without spam. Every profile in this network is authenticated under our 4-level verification standard.
              </p>
            </div>

            {/* 4-Level Verification Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.06] space-y-2">
                <span className="text-[10px] font-bold text-[#818A84] uppercase">Tier 1</span>
                <h5 className="font-semibold text-xs text-[#171C19]">Contact Verified</h5>
                <p className="text-[11px] text-[#818A84] leading-relaxed">
                  Verified college or business domain email + SMS OTP authenticated identity.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.06] space-y-2">
                <span className="text-[10px] font-bold text-[#818A84] uppercase">Tier 2</span>
                <h5 className="font-semibold text-xs text-[#171C19]">Professionally Verified</h5>
                <p className="text-[11px] text-[#818A84] leading-relaxed">
                  Confirmed employment history, LinkedIn verification, and GitHub/Portfolio proof.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.06] space-y-2">
                <span className="text-[10px] font-bold text-[#818A84] uppercase">Tier 3</span>
                <h5 className="font-semibold text-xs text-[#171C19]">Business Verified</h5>
                <p className="text-[11px] text-[#818A84] leading-relaxed">
                  Government GSTIN / MCA / CIN registration verified with authorized signatory check.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.06] space-y-2">
                <span className="text-[10px] font-bold text-[#818A84] uppercase">Tier 4</span>
                <h5 className="font-semibold text-xs text-[#171C19]">Special Credentials</h5>
                <p className="text-[11px] text-[#818A84] leading-relaxed">
                  Accredited Angel Investors, Syndicate Leads, SEBI Registered Advisors, and Keynotes.
                </p>
              </div>
            </div>

            {/* Networking Workflow */}
            <div className="p-6 rounded-2xl bg-black/[0.02] border border-black/[0.06] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#171C19]">
                How Networking Operates in this Network
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#525854]">
                <div className="space-y-1">
                  <strong>1. Search & Filter:</strong> Find members by city, industry domain, technology stack, or verification level.
                </div>
                <div className="space-y-1">
                  <strong>2. Warm Introductions:</strong> Send introductory connection notes or request chapter manager facilitation.
                </div>
                <div className="space-y-1">
                  <strong>3. Offline Meetups:</strong> Meet in person at chapter dinners, roundtables, and regional summit lounges.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#818A84]">
                Members never receive unsolicited spam or external marketing blasts.
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={pricing.isFree ? handleJoin : () => onNavigate('memberships')}
                className="apple-press text-xs font-semibold px-6"
              >
                {pricing.isFree ? 'Join Community (Free)' : 'Join to Access Directory →'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SUMMITS & DIGITAL PASS ENTITLEMENTS */}
      {activeFeatureTab === 'summits' && (
        <div className="space-y-6">
          <div className="apple-card p-6 sm:p-8 border border-black/[0.06] space-y-6">
            <div>
              <h3 className="font-light text-2xl text-[#171C19] tracking-tight">
                Flagship Summits, Roundtables & Expos
              </h3>
              <p className="text-xs text-[#818A84] mt-1 max-w-2xl leading-relaxed">
                Connect face-to-face across Bangalore, Mumbai, Hyderabad, and Delhi-NCR. Members enjoy dedicated ticket discounts and free pass allocations.
              </p>
            </div>

            {/* Member Entitlements Box */}
            <div className="p-5 rounded-2xl bg-black/[0.03] border border-black/[0.06] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#171C19]">
                Official Pass Entitlement Guarantee
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white border border-black/[0.06] space-y-1.5">
                  <span className="text-xs font-bold text-black flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-black" />
                    Yearly Members: 25% Pass Discount
                  </span>
                  <p className="text-[11px] text-[#818A84] leading-relaxed">
                    Yearly subscribers receive an automatic 25% discount across all meetup passes, summit delegate passes, and masterclasses.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-black/[0.06] space-y-1.5">
                  <span className="text-xs font-bold text-black flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-black" />
                    Lifetime Members: First 3 Passes 100% Free
                  </span>
                  <p className="text-[11px] text-[#818A84] leading-relaxed">
                    Lifetime members receive their first 3 flagship summit passes completely free, followed by a perpetual 25% discount on all subsequent passes.
                  </p>
                </div>
              </div>
            </div>

            {/* Digital QR Wallet Feature */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.06] space-y-1">
                <span className="font-bold text-[#171C19]">Instant QR Wallet</span>
                <p className="text-[11px] text-[#818A84]">
                  Tickets are generated instantly with a cryptographically signed QR code for zero-wait check-ins.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.06] space-y-1">
                <span className="font-bold text-[#171C19]">Offline Scan Validation</span>
                <p className="text-[11px] text-[#818A84]">
                  Event coordinators scan badges with our high-speed mobile validator even in low-signal convention halls.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.06] space-y-1">
                <span className="font-bold text-[#171C19]">VIP Networking Lounges</span>
                <p className="text-[11px] text-[#818A84]">
                  Registered members gain exclusive badge-access to private speaker lounges and delegation rooms.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#818A84]">
                Next flagship summits scheduled for Bangalore, Hyderabad, and Mumbai.
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onNavigate('summits-page')}
                className="apple-press text-xs font-semibold px-6"
              >
                Browse Summit Calendar →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Preview Modal */}
      {selectedPreviewModule && (
        <Modal
          isOpen={Boolean(selectedPreviewModule)}
          onClose={() => setSelectedPreviewModule(null)}
          title={selectedPreviewModule.title}
          description="Interactive Workflow and Capability Breakdown"
        >
          <div className="space-y-4">
            <p className="text-xs text-[#525854] leading-relaxed">
              {selectedPreviewModule.desc}
            </p>

            <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.06] space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#171C19] block">
                3-Step Member Workflow
              </span>
              <div className="space-y-2">
                {selectedPreviewModule.workflow?.map((step: string, sIdx: number) => (
                  <div key={sIdx} className="flex items-start gap-2.5 text-xs text-[#525854]">
                    <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {sIdx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-black/[0.06]">
              <span className="text-xs text-[#818A84]">
                {pricing.isFree ? 'Free for all members' : `Included with ${divisionMeta.name}`}
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedPreviewModule(null);
                  if (pricing.isFree) {
                    handleJoin();
                  } else {
                    onNavigate('memberships');
                  }
                }}
              >
                {pricing.isFree ? 'Activate Free Access' : 'View Membership Plans'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
