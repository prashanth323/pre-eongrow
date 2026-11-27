import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  Ticket,
  CheckCircle2,
  Gift,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useDivision } from '../../context/useDivision';
import { DIVISIONS_CATALOG } from '../../lib/divisions';
import { formatCurrency } from '../../lib/utils';
import { DataService } from '../../services/dataService';
import type { DivisionSlug, MembershipPlanItem } from '../../types/app.types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export const MembershipPlans: React.FC = () => {
  const { profile, joinDivision } = useAuth();
  const { currentDivision, setDivision, allDivisions } = useDivision();

  const [activeTabDivision, setActiveTabDivision] = useState<DivisionSlug>(currentDivision);
  const [plans, setPlans] = useState<MembershipPlanItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [applyWomenDiscount, setApplyWomenDiscount] = useState<boolean>(Boolean(profile?.isWomenDiscountEligible));
  const [selectedPlanModal, setSelectedPlanModal] = useState<MembershipPlanItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeMeta = DIVISIONS_CATALOG[activeTabDivision];

  useEffect(() => {
    if (profile?.isWomenDiscountEligible) {
      setApplyWomenDiscount(true);
    }
  }, [profile?.isWomenDiscountEligible]);

  useEffect(() => {
    let isMounted = true;
    async function loadPlans() {
      setLoading(true);
      const dbPlans = await DataService.getMembershipPlans(activeTabDivision);
      if (isMounted) {
        setPlans(dbPlans);
        setLoading(false);
      }
    }
    loadPlans();
    return () => {
      isMounted = false;
    };
  }, [activeTabDivision]);

  const handleUpgrade = async () => {
    if (!selectedPlanModal) return;
    setIsProcessing(true);
    setErrorMessage(null);

    const effectivePrice = applyWomenDiscount && selectedPlanModal.womenPrice !== undefined
      ? selectedPlanModal.womenPrice
      : selectedPlanModal.price;

    if (effectivePrice === 0) {
      const res = await DataService.subscribeMembership({
        divisionSlug: activeTabDivision,
        planSlug: selectedPlanModal.planType,
        amount: 0,
        applyWomenDiscount: false,
        userId: profile?.id,
        attendeeName: profile?.fullName,
        attendeeEmail: profile?.email,
      });

      if (res.success) {
        await joinDivision(activeTabDivision);
        setIsProcessing(false);
        setUpgradeSuccess(true);
        setTimeout(() => {
          setSelectedPlanModal(null);
          setUpgradeSuccess(false);
        }, 1500);
      } else {
        setErrorMessage(res.error || 'Failed to activate plan.');
        setIsProcessing(false);
      }
      return;
    }

    // Paid membership subscription via Razorpay
    const res = await DataService.subscribeMembership({
      divisionSlug: activeTabDivision,
      planSlug: selectedPlanModal.planType,
      amount: effectivePrice,
      applyWomenDiscount,
      userId: profile?.id,
      attendeeName: profile?.fullName,
      attendeeEmail: profile?.email,
    });

    if (res.success) {
      await joinDivision(activeTabDivision);
      setUpgradeSuccess(true);
      setTimeout(() => {
        setSelectedPlanModal(null);
        setUpgradeSuccess(false);
      }, 1500);
    } else {
      setErrorMessage(res.error || 'Payment gateway configuration is required for live transactions.');
    }
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extralight text-[#171C19] tracking-tight">Multi-Division Membership & Subscriptions</h2>
        <p className="text-sm text-[#818A84] mt-1">
          Independent membership plans tailored for students, professionals, creators, and entrepreneurs.
        </p>
      </div>

      {/* Student Network Zero-Cost Guarantee Banner */}
      <div className="relative overflow-hidden p-6 rounded-[24px] bg-white border border-black/[0.08] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 apple-card">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-black/[0.04] flex items-center justify-center flex-shrink-0 text-[#171C19]">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-base text-[#171C19]">Student Network: 100% Free Lifetime Access & Affiliate Program</h3>
            <p className="text-xs text-[#818A84] max-w-2xl leading-relaxed">
              No hidden charges. Verified students get free access to courses, internship opportunities, hackathons, and mentorship.
              Students can also join other divisions and participate in the Student Affiliate Program.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="self-start md:self-center font-medium cursor-pointer"
          onClick={() => {
            setActiveTabDivision('student');
            setDivision('student');
          }}
        >
          View Student Free Access
        </Button>
      </div>

      {/* Division Selector Tabs - Apple Segmented Control */}
      <div className="apple-segment-track p-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none rounded-full">
        {allDivisions.map((div) => {
          const isActive = activeTabDivision === div.slug;
          return (
            <button
              key={div.slug}
              onClick={() => {
                setActiveTabDivision(div.slug);
                setDivision(div.slug);
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer apple-press ${
                isActive
                  ? 'bg-white text-[#171C19] shadow-xs font-bold'
                  : 'text-[#818A84] hover:text-[#171C19]'
              }`}
            >
              {div.name}
            </button>
          );
        })}
      </div>

      {/* Division Pitch Banner & Women's Concession Toggle */}
      <div className="p-6 rounded-[24px] bg-black/[0.02] border border-black/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-light text-[#171C19] tracking-tight">{activeMeta.tagline}</h3>
          <p className="text-xs text-[#818A84] mt-1 max-w-xl">{activeMeta.description}</p>
        </div>

        {/* Women in Tech & Business Pricing Concession Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-3.5 rounded-2xl border border-black/[0.08] shadow-2xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <div className="text-xs">
              <span className="font-semibold text-[#171C19] block">Women's Special Concession</span>
              <span className="text-[#818A84] text-[11px]">Special 50% concession across all paid plans</span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={applyWomenDiscount}
              onChange={(e) => setApplyWomenDiscount(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
          </label>
        </div>
      </div>

      {/* Plan Cards Grid - Apple Bento Cards */}
      {loading ? (
        <div className="py-12 text-center text-sm text-[#818A84]">Loading configured membership plans...</div>
      ) : plans.length === 0 ? (
        <div className="py-12 text-center text-sm text-[#818A84]">No plans currently configured for this division.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const hasWomenDiscount = plan.womenPrice !== undefined && plan.womenPrice < plan.price;
            const currentPrice = applyWomenDiscount && hasWomenDiscount ? plan.womenPrice! : plan.price;

            const isYearly = plan.planType.includes('yearly') || plan.planType.includes('annual');
            const isLifetime = plan.planType.includes('lifetime');

            return (
              <div
                key={plan.id}
                className={`apple-card p-7 flex flex-col justify-between relative transition-all border ${
                  plan.isPopular
                    ? 'border-black ring-2 ring-black/10 shadow-md'
                    : 'border-black/[0.06]'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-light text-[#171C19] tracking-tight">{plan.name}</h4>
                      <p className="text-xs text-[#818A84] mt-1 leading-relaxed">{plan.description}</p>
                    </div>
                    {plan.isPopular && (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-black font-bold">
                        Recommended
                      </span>
                    )}
                  </div>

                  <div className="pt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extralight text-[#171C19] tracking-tight">
                        {currentPrice === 0 ? '₹0' : formatCurrency(currentPrice)}
                      </span>
                      <span className="text-xs text-[#818A84] font-medium">{plan.period}</span>
                    </div>

                    {hasWomenDiscount && (
                      <div className="mt-1 flex items-center gap-2 text-xs">
                        {applyWomenDiscount ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                            Women's Price Applied (Standard: {formatCurrency(plan.price)})
                          </span>
                        ) : (
                          <span className="text-[#818A84]">
                            Women's Price: <strong className="text-black font-semibold">{formatCurrency(plan.womenPrice!)}</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Built-in Membership Benefit Badges */}
                  <div className="pt-3 pb-1">
                    {isYearly && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/[0.03] border border-black/[0.06] text-xs text-[#171C19]">
                        <Ticket className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                        <span><strong>25% Discount</strong> on all summit & meetup passes</span>
                      </div>
                    )}
                    {isLifetime && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/[0.03] border border-black/[0.06] text-xs text-[#171C19]">
                        <Gift className="w-4 h-4 text-amber-700 flex-shrink-0" />
                        <span><strong>3 Free Event Passes</strong> included + 25% off all future passes</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#E8ECE9] space-y-2">
                    <span className="text-xs text-[#818A84] block font-medium">
                      Included Network Privileges
                    </span>
                    {plan.features.map((feat: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#171C19]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-black/40 mt-0.5 flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#E8ECE9]">
                  <Button
                    variant={plan.isPopular ? 'primary' : 'outline'}
                    size="md"
                    className="w-full"
                    onClick={() => {
                      setErrorMessage(null);
                      setSelectedPlanModal(plan);
                    }}
                  >
                    {currentPrice === 0 ? 'Activate Free Plan' : 'Select Plan'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Plan Activation / Upgrade Modal */}
      {selectedPlanModal && (
        <Modal
          isOpen={Boolean(selectedPlanModal)}
          onClose={() => {
            setSelectedPlanModal(null);
            setErrorMessage(null);
          }}
          title={`Confirm ${selectedPlanModal.name}`}
          description={`Join ${activeMeta.name} with ${selectedPlanModal.planType.replace(/_/g, ' ')} status.`}
        >
          <div className="space-y-4">
            {upgradeSuccess ? (
              <div className="p-6 bg-black/[0.04] text-[#171C19] border border-black/[0.08] rounded-2xl text-center space-y-2">
                <p className="font-semibold text-base text-[#171C19]">Membership Successfully Activated 🎉</p>
                <p className="text-xs text-[#818A84]">
                  You now have active access to {activeMeta.name} with all associated benefits.
                </p>
              </div>
            ) : (
              <>
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                    {errorMessage}
                  </div>
                )}

                <div className="p-4 bg-[#FAFCFA] rounded-xl border border-[#E8ECE9] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#818A84]">Selected Division:</span>
                    <strong className="text-[#171C19]">{activeMeta.name}</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#818A84]">Membership Plan:</span>
                    <strong className="text-black">{selectedPlanModal.name}</strong>
                  </div>

                  {selectedPlanModal.womenPrice !== undefined && (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[#818A84]">Pricing Tier:</span>
                      <span className={`font-medium ${applyWomenDiscount ? 'text-emerald-700' : 'text-[#171C19]'}`}>
                        {applyWomenDiscount ? "Women's Concession (50% Concession)" : 'Standard Membership'}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm pt-2 border-t border-[#E8ECE9]">
                    <span className="font-bold text-[#171C19]">Payable Amount:</span>
                    <strong className="text-base font-semibold text-black">
                      {(() => {
                        const effectivePrice = applyWomenDiscount && selectedPlanModal.womenPrice !== undefined
                          ? selectedPlanModal.womenPrice
                          : selectedPlanModal.price;
                        return effectivePrice === 0 ? '₹0 (Free)' : formatCurrency(effectivePrice);
                      })()}
                    </strong>
                  </div>
                </div>

                {/* Event Pass Benefits Note */}
                <div className="p-3 bg-black/[0.02] rounded-xl border border-black/[0.06] text-xs text-[#818A84] space-y-1">
                  <p className="font-semibold text-[#171C19] flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5 text-black" />
                    Automatic Event Pass Entitlements
                  </p>
                  <p>
                    {selectedPlanModal.planType.includes('lifetime')
                      ? 'As a Lifetime Member, your first 3 event passes will be 100% free, followed by 25% off all future passes.'
                      : selectedPlanModal.planType.includes('yearly') || selectedPlanModal.planType.includes('annual')
                      ? 'As a Yearly Member, you receive an automatic 25% discount on all summit and event tickets.'
                      : 'Free access to public community meetups and standard event registrations.'}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedPlanModal(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    isLoading={isProcessing}
                    onClick={handleUpgrade}
                  >
                    {(() => {
                      const effectivePrice = applyWomenDiscount && selectedPlanModal.womenPrice !== undefined
                        ? selectedPlanModal.womenPrice
                        : selectedPlanModal.price;
                      return effectivePrice === 0 ? 'Confirm Free Access' : 'Pay & Activate via Razorpay';
                    })()}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
