import React, { useState, useEffect, useRef } from 'react';
import { Check, Sparkles, Shield, Zap, Building2, GraduationCap } from 'lucide-react';
import type { ViewState } from '../types/app.types';
import { Button } from '../components/ui/Button';
import { PublicLayout } from '../components/layout/PublicLayout';

interface PricingPageProps {
  onNavigate: (view: ViewState) => void;
  onGetStarted: () => void;
  onSignIn: () => void;
}

// Ease-out cubic animated counter for reduced price transition
const AnimatedPriceNumber: React.FC<{
  amount: number;
  isPink: boolean;
}> = ({ amount, isPink }) => {
  const [currentDisplay, setCurrentDisplay] = useState(amount);
  const prevAmountRef = useRef(amount);

  useEffect(() => {
    const startVal = prevAmountRef.current;
    const endVal = amount;

    if (startVal === endVal) {
      setCurrentDisplay(endVal);
      return;
    }

    const duration = 500; // ms transition
    const startTime = performance.now();

    const animateStep = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const interpolated = Math.round(startVal + (endVal - startVal) * ease);
      setCurrentDisplay(interpolated);

      if (progress < 1) {
        requestAnimationFrame(animateStep);
      } else {
        prevAmountRef.current = endVal;
      }
    };

    requestAnimationFrame(animateStep);
  }, [amount]);

  if (amount === 0) {
    return <span>₹0</span>;
  }

  return (
    <span
      className={`inline-block font-extralight tracking-tight transition-colors duration-500 ${
        isPink ? 'text-rose-600 font-normal drop-shadow-[0_1px_8px_rgba(244,63,94,0.25)]' : 'text-[#171C19]'
      }`}
    >
      ₹{currentDisplay.toLocaleString('en-IN')}
    </span>
  );
};

export const PricingPage: React.FC<PricingPageProps> = ({
  onNavigate,
  onGetStarted,
  onSignIn,
}) => {
  const [applyWomenDiscount, setApplyWomenDiscount] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  // Exact numerical values for smooth interpolation
  const proNumericPrice = applyWomenDiscount
    ? (billingCycle === 'annual' ? 749 : 999)
    : (billingCycle === 'annual' ? 1499 : 1999);

  const founderNumericPrice = applyWomenDiscount
    ? (billingCycle === 'annual' ? 2499 : 3499)
    : (billingCycle === 'annual' ? 4999 : 6999);

  const plans = [
    {
      id: 'student-tier',
      name: 'Student Charter',
      division: 'Student Network',
      numericPrice: 0,
      period: 'forever',
      originalPrice: null,
      tagline: 'Guaranteed 100% Free Forever under Constitutional Charter.',
      icon: GraduationCap,
      badge: '₹0 Forever',
      highlight: false,
      ctaText: 'Claim Free Student Access',
      features: [
        'Unconditional ₹0 fee — No credit card required',
        'Verified internship board with minimum stipend floor',
        'Direct 1-on-1 mentorship with industry leaders',
        '₹0 pass allocation to collegiate hackathons',
        'Campus chapter ambassador network',
        'Cryptographic student credential badge',
      ],
    },
    {
      id: 'pro-tier',
      name: 'Professional & Creator',
      division: 'Career & Freelancer',
      numericPrice: proNumericPrice,
      period: 'per month',
      originalPrice: applyWomenDiscount ? (billingCycle === 'annual' ? '₹1,499' : '₹1,999') : (billingCycle === 'annual' ? '₹1,999' : null),
      tagline: 'For professionals, independent creators, and senior specialists.',
      icon: Zap,
      badge: applyWomenDiscount ? '50% Concession' : 'Most Popular',
      highlight: true,
      ctaText: applyWomenDiscount ? 'Claim 50% Concession Tier →' : 'Join Professional Tier →',
      features: [
        'Everything in Free Student, plus:',
        'Unlimited verified peer introductions & referral requests',
        'Client contract templates & safe escrow milestone tools',
        '25% discount on all National Summit admission passes',
        'Identity Verified & Professionally Verified Trust Badges',
        'Priority spotlight in the verified member directory',
      ],
    },
    {
      id: 'enterprise-tier',
      name: 'Founder & Enterprise',
      division: 'Startup, MSME & Investor',
      numericPrice: founderNumericPrice,
      period: 'per month',
      originalPrice: applyWomenDiscount ? (billingCycle === 'annual' ? '₹4,999' : '₹6,999') : (billingCycle === 'annual' ? '₹6,999' : null),
      tagline: 'For startup founders, MSME business owners, and venture investors.',
      icon: Building2,
      badge: applyWomenDiscount ? '50% Founder Concession' : 'Venture & B2B',
      highlight: false,
      ctaText: applyWomenDiscount ? 'Claim Founder Concession →' : 'Access Founder Suite →',
      features: [
        'Post unlimited job openings & paid internships (0% fee)',
        'Direct MSME supplier tenders & commercial deal requests',
        'Closed-door investor roundtables & due diligence rooms',
        '2 VIP passes to every Flagship National Tech Summit',
        'Business Verified (GSTIN/MCA) badge with maximum trust weight',
        'Dedicated chapter relationship manager for warm introductions',
      ],
    },
  ];

  return (
    <PublicLayout
      currentView="pricing-page"
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onGetStarted={onGetStarted}
    >
      <div
        className={`min-h-screen space-y-20 py-12 transition-colors duration-700 ${
          applyWomenDiscount
            ? 'bg-gradient-to-b from-rose-50/70 via-[#FFF8FA] to-pink-50/50 text-[#1F1418]'
            : 'bg-[#F5F6F5] text-[#171C19]'
        }`}
      >
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 pt-16 sm:pt-20">
          <h1 className="text-4xl sm:text-6xl font-extralight tracking-[-0.035em] leading-[1.08]">
            Transparent, Charter-Backed Membership
          </h1>
          <p className="text-base sm:text-lg text-[#525854] max-w-2xl mx-auto leading-relaxed">
            Zero fees for students under our founding charter. Predictable flat memberships for professionals and founders with 0% commission on internships and contracts.
          </p>

          {/* Toggle Controls: Billing Cycle & Women's Concession Toggle */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Billing Cycle Switcher */}
            <div className="inline-flex items-center p-1 rounded-full bg-black/[0.05] border border-black/[0.08]">
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  billingCycle === 'annual'
                    ? applyWomenDiscount
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-black text-white shadow-xs'
                    : 'text-[#525854] hover:text-black'
                }`}
              >
                Annual (Save 25%)
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? applyWomenDiscount
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-black text-white shadow-xs'
                    : 'text-[#525854] hover:text-black'
                }`}
              >
                Monthly
              </button>
            </div>

            {/* Women Concession Toggle with Pink Theme Trigger */}
            <button
              type="button"
              onClick={() => setApplyWomenDiscount(!applyWomenDiscount)}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer apple-press ${
                applyWomenDiscount
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white border-transparent shadow-[0_4px_16px_rgba(244,63,94,0.35)] ring-2 ring-rose-300'
                  : 'bg-white border-black/[0.08] text-[#525854] hover:border-black/20 hover:text-black'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${applyWomenDiscount ? 'text-white fill-white' : 'text-neutral-400'}`} />
              <span>Women in Tech & Business 50% Concession</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                  applyWomenDiscount
                    ? 'bg-white/20 text-white'
                    : 'bg-rose-50 text-rose-600 border border-rose-200'
                }`}
              >
                50% OFF
              </span>
            </button>
          </div>
        </section>

        {/* Pricing Cards Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.id}
                  className={`rounded-[32px] p-8 flex flex-col justify-between transition-all duration-500 relative ${
                    p.highlight
                      ? applyWomenDiscount
                        ? 'bg-white border-2 border-rose-400 shadow-[0_24px_70px_rgba(244,63,94,0.16)] ring-2 ring-rose-400/20'
                        : 'bg-white border-2 border-black shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-black/5'
                      : applyWomenDiscount
                      ? 'bg-white/90 border border-rose-200 shadow-sm hover:shadow-md'
                      : 'bg-white/80 border border-black/[0.08] shadow-sm hover:shadow-md'
                  }`}
                >
                  {p.highlight && (
                    <div
                      className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-[11px] font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-sm transition-colors duration-500 ${
                        applyWomenDiscount
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500'
                          : 'bg-black'
                      }`}
                    >
                      {p.badge}
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors duration-500 ${
                          applyWomenDiscount ? 'bg-rose-100 text-rose-600' : 'bg-black/[0.05] text-black'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-[#818A84]">{p.division}</span>
                    </div>

                    <div>
                      <h3 className="text-2xl font-light text-[#171C19] tracking-tight">{p.name}</h3>
                      <p className="text-xs text-[#525854] mt-1 leading-relaxed">{p.tagline}</p>
                    </div>

                    {/* Numeric Animated Price Section */}
                    <div className="pt-2 pb-4 border-y border-black/[0.06]">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extralight tracking-tight">
                          <AnimatedPriceNumber
                            amount={p.numericPrice}
                            isPink={applyWomenDiscount && p.numericPrice > 0}
                          />
                        </span>
                        <span className="text-xs text-[#818A84]">/{p.period}</span>
                        {p.originalPrice && (
                          <span className="text-xs line-through text-[#818A84] ml-1">{p.originalPrice}</span>
                        )}
                      </div>
                      {p.numericPrice === 0 ? (
                        <p className="text-[11px] font-semibold text-emerald-700 mt-1">₹0 Student Charter Guarantee</p>
                      ) : applyWomenDiscount ? (
                        <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-rose-500" />
                          <span>50% Women in Tech Concession Applied</span>
                        </p>
                      ) : null}
                    </div>

                    <ul className="space-y-3 text-xs text-[#525854]">
                      {p.features.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <Check
                            className={`w-4 h-4 flex-shrink-0 mt-0.5 transition-colors duration-500 ${
                              applyWomenDiscount && p.numericPrice > 0
                                ? 'text-rose-500'
                                : 'text-emerald-600'
                            }`}
                          />
                          <span className="leading-relaxed">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-8">
                    <Button
                      variant={p.highlight ? 'primary' : 'outline'}
                      size="lg"
                      onClick={onGetStarted}
                      className={`w-full font-semibold text-xs apple-press h-12 rounded-full transition-all duration-500 ${
                        p.highlight && applyWomenDiscount
                          ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-md border-0'
                          : ''
                      }`}
                    >
                      {p.ctaText}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Feature Matrix / Guarantee Box */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`rounded-[32px] p-8 sm:p-10 border shadow-sm space-y-6 transition-colors duration-500 ${
              applyWomenDiscount
                ? 'bg-white/95 border-rose-200'
                : 'bg-white border-black/[0.08]'
            }`}
          >
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extralight text-[#171C19] tracking-tight">
                Our Founding Financial Ethics
              </h2>
              <p className="text-xs sm:text-sm text-[#525854] leading-relaxed">
                Why eongrow will never shift to pay-to-apply job boards or charge students subscription fees:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div className="p-5 rounded-2xl bg-[#FAFCFA] border border-black/[0.06] space-y-2">
                <Shield className="w-5 h-5 text-black" />
                <h4 className="font-semibold text-sm text-[#171C19]">0% Internship Cut</h4>
                <p className="text-xs text-[#525854] leading-relaxed">
                  We take ₹0 from internship stipends or creator milestones. 100% of compensation reaches the talent directly.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAFCFA] border border-black/[0.06] space-y-2">
                <GraduationCap className="w-5 h-5 text-black" />
                <h4 className="font-semibold text-sm text-[#171C19]">Charter Protected</h4>
                <p className="text-xs text-[#525854] leading-relaxed">
                  The Student Free Forever charter is locked into our platform governance bylaws and cannot be altered by board resolution.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAFCFA] border border-black/[0.06] space-y-2">
                <Zap className="w-5 h-5 text-black" />
                <h4 className="font-semibold text-sm text-[#171C19]">Enterprise Sustained</h4>
                <p className="text-xs text-[#525854] leading-relaxed">
                  Sustainable revenue is generated strictly from enterprise tools, tender listings, and corporate summit delegate ticketing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Action Banner */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div
            className={`p-8 sm:p-12 rounded-[32px] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl transition-colors duration-500 ${
              applyWomenDiscount
                ? 'bg-gradient-to-r from-[#201015] via-[#2A151D] to-[#1F1418] border border-rose-400/20'
                : 'bg-[#171C19]'
            }`}
          >
            <div className="space-y-2 max-w-xl">
              <h3 className="text-2xl sm:text-3xl font-extralight tracking-tight">Ready to explore eongrow?</h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Create a verified identity today. Students never pay, and professionals receive an automatic 14-day full feature trial.
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={onGetStarted}
              className={`hover:bg-neutral-100 font-bold text-xs h-12 px-8 rounded-full apple-press flex-shrink-0 transition-colors ${
                applyWomenDiscount ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-white text-black'
              }`}
            >
              Get Started Free →
            </Button>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};
