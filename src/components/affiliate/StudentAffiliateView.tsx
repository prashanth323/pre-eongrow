import React, { useState, useEffect } from 'react';
import {
  Share2,
  Copy,
  Check,
  TrendingUp,
  Users,
  DollarSign,
  Wallet,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { formatCurrency, formatDate } from '../../lib/utils';
import { DataService } from '../../services/dataService';
import type {
  AffiliateProfileItem,
  AffiliateReferralItem,
  AffiliatePayoutItem,
  AffiliateSettingsItem,
} from '../../types/app.types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Pagination } from '../common/Pagination';

export const StudentAffiliateView: React.FC = () => {
  const { profile, joinDivision } = useAuth();

  const [affiliateProfile, setAffiliateProfile] = useState<AffiliateProfileItem | null>(null);
  const [settings, setSettings] = useState<AffiliateSettingsItem | null>(null);
  const [referrals, setReferrals] = useState<AffiliateReferralItem[]>([]);
  const [payouts, setPayouts] = useState<AffiliatePayoutItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Pagination states
  const [referralsPage, setReferralsPage] = useState(1);
  const referralsPerPage = 6;
  const paginatedReferrals = referrals.slice(
    (referralsPage - 1) * referralsPerPage,
    referralsPage * referralsPerPage
  );

  const [payoutsPage, setPayoutsPage] = useState(1);
  const payoutsPerPage = 5;
  const paginatedPayouts = payouts.slice(
    (payoutsPage - 1) * payoutsPerPage,
    payoutsPage * payoutsPerPage
  );

  // Payout request modal
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'bank_transfer'>('upi');
  const [upiId, setUpiId] = useState('');
  const [bankAccount, setBankAccount] = useState({ accountName: '', accountNumber: '', ifsc: '' });
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null);
  const [payoutError, setPayoutError] = useState<string | null>(null);

  const loadAffiliateData = async () => {
    if (!profile?.id) return;
    setLoading(true);

    const [prof, sett, refs, pays] = await Promise.all([
      DataService.getAffiliateProfile(profile.id),
      DataService.getAffiliateSettings(),
      DataService.getAffiliateReferrals(profile.id),
      DataService.getAffiliatePayouts(profile.id),
    ]);

    setAffiliateProfile(prof);
    setSettings(sett);
    setReferrals(refs);
    setPayouts(pays);
    if (prof) {
      setPayoutAmount(prof.pendingPayout);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAffiliateData();
  }, [profile?.id]);

  const referralCode = affiliateProfile?.referralCode || 'NGF-STUDENT';
  const referralLink = `${window.location.origin}/join?ref=${referralCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRequestPayout = async () => {
    if (!profile?.id || !affiliateProfile) return;
    if (payoutAmount <= 0 || payoutAmount > affiliateProfile.pendingPayout) {
      setPayoutError('Please specify a valid withdrawal amount.');
      return;
    }

    const minAmount = settings?.minPayoutAmount ?? 500;
    if (payoutAmount < minAmount) {
      setPayoutError(`Minimum payout request is ${formatCurrency(minAmount)}.`);
      return;
    }

    setIsSubmittingPayout(true);
    setPayoutError(null);

    const details = payoutMethod === 'upi' ? { upiId } : bankAccount;
    const res = await DataService.requestAffiliatePayout({
      userId: profile.id,
      amount: payoutAmount,
      payoutMethod,
      payoutDetails: details,
    });

    if (res.success) {
      setPayoutSuccess('Payout request submitted successfully.');
      await loadAffiliateData();
      setTimeout(() => {
        setShowPayoutModal(false);
        setPayoutSuccess(null);
      }, 1500);
    } else {
      setPayoutError(res.error || 'Failed to submit payout request.');
    }
    setIsSubmittingPayout(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extralight text-[#171C19] tracking-tight">Student Affiliate & Referral Program</h2>
        <p className="text-sm text-[#818A84] mt-1">
          Refer founders, professionals, and peers to eongrow and earn commissions on verified subscriptions.
        </p>
      </div>

      {/* Student Role Requirement Notice if user hasn't joined student role */}
      {!profile?.joinedDivisions?.includes('student') && (
        <div className="rounded-2xl p-4 bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <h4 className="font-semibold text-amber-950">Activate Student Ambassador Status</h4>
            <p className="text-amber-900/80 mt-0.5">
              The affiliate referral commission system is granted to members of the Student Network. Student membership is 100% free forever.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => joinDivision('student')}
            className="bg-amber-950 text-white hover:bg-black font-semibold text-xs border-0 shadow-xs flex-shrink-0"
          >
            Join Student Network (Free)
          </Button>
        </div>
      )}

      {/* Referral Link & Code Apple Card */}
      <div className="apple-card p-6 sm:p-7 border border-black/[0.08] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs text-[#818A84] block font-mono">
              Referral Code: <strong className="font-mono text-black">{referralCode}</strong>
            </span>
            <h3 className="text-xl font-light text-[#171C19] tracking-tight">Your Unique Referral Link</h3>
            <p className="text-xs text-[#818A84] leading-relaxed">
              Share your link with founders, freelancers, or students. When someone registers and joins a paid membership,
              your commission will be automatically calculated on verified payments.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center bg-black/[0.03] border border-black/[0.08] rounded-xl px-3 py-2 text-xs font-mono text-[#171C19]">
              <span className="truncate max-w-[220px]">{referralLink}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 text-xs font-medium"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? 'Copied' : 'Copy Link'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 text-xs font-semibold"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                {copiedCode ? 'Copied' : 'Copy Code'}
              </Button>
            </div>
          </div>
        </div>

        {/* Commission Status Bar */}
        <div className="mt-5 pt-4 border-t border-black/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="text-[#171C19]">
              {settings?.commissionPercentage !== null && settings?.commissionPercentage !== undefined ? (
                <>
                  Configured Commission Rate: <strong className="text-emerald-700 font-bold">{settings.commissionPercentage}%</strong> of referred eligible subscription payments.
                </>
              ) : (
                <span className="text-[#818A84]">
                  Affiliate Program Active: <strong className="text-[#171C19]">Commission rate is currently being defined by administrator</strong>. All referrals are logged.
                </span>
              )}
            </span>
          </div>

          <div className="text-[11px] text-[#818A84]">
            Minimum Payout: {formatCurrency(settings?.minPayoutAmount ?? 500)}
          </div>
        </div>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="apple-card p-5 border border-black/[0.06] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#818A84]">
            <span>Total Referrals</span>
            <Users className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-light text-[#171C19]">
            {loading ? '...' : affiliateProfile?.totalReferrals || 0}
          </div>
          <p className="text-[10px] text-[#818A84]">Users registered with your code</p>
        </div>

        <div className="apple-card p-5 border border-black/[0.06] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#818A84]">
            <span>Conversions</span>
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-light text-[#171C19]">
            {loading ? '...' : affiliateProfile?.successfulConversions || 0}
          </div>
          <p className="text-[10px] text-[#818A84]">Active paid subscribers</p>
        </div>

        <div className="apple-card p-5 border border-black/[0.06] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#818A84]">
            <span>Total Earned</span>
            <DollarSign className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-light text-[#171C19]">
            {loading ? '...' : formatCurrency(affiliateProfile?.totalEarnings || 0)}
          </div>
          <p className="text-[10px] text-[#818A84]">Cumulative commissions</p>
        </div>

        <div className="apple-card p-5 border border-black/[0.06] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#818A84]">
            <span>Pending Payout</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-light text-black font-semibold">
            {loading ? '...' : formatCurrency(affiliateProfile?.pendingPayout || 0)}
          </div>
          <p className="text-[10px] text-[#818A84]">Available for withdrawal</p>
        </div>

        <div className="apple-card p-5 border border-black/[0.06] space-y-1 col-span-2 md:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#818A84]">
              <span>Paid Out</span>
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-light text-[#171C19]">
              {loading ? '...' : formatCurrency(affiliateProfile?.paidOut || 0)}
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="w-full text-xs font-semibold mt-2"
            disabled={!affiliateProfile || affiliateProfile.pendingPayout < (settings?.minPayoutAmount ?? 500)}
            onClick={() => {
              setPayoutAmount(affiliateProfile?.pendingPayout || 0);
              setShowPayoutModal(true);
            }}
          >
            Withdraw
          </Button>
        </div>
      </div>

      {/* Referrals Activity Table */}
      <div className="apple-card p-6 border border-black/[0.06] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-light text-[#171C19] tracking-tight">Referred Members & Status</h3>
          <span className="text-xs text-[#818A84]">{referrals.length} Total</span>
        </div>

        {referrals.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#818A84]">
            No referrals recorded yet. Share your code to start tracking member registrations.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8ECE9] text-[#818A84]">
                  <th className="py-2.5 font-medium">Referred User</th>
                  <th className="py-2.5 font-medium">Joined Date</th>
                  <th className="py-2.5 font-medium">Role / Division</th>
                  <th className="py-2.5 font-medium">Status</th>
                  <th className="py-2.5 font-medium text-right">Commission Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECE9]">
                {paginatedReferrals.map((r) => {
                  const totalComm = r.commissions.reduce((acc, c) => acc + c.commissionAmount, 0);
                  return (
                    <tr key={r.id} className="hover:bg-black/[0.01]">
                      <td className="py-3">
                        <span className="font-semibold text-[#171C19] block">{r.referredUserName}</span>
                        <span className="text-[11px] text-[#818A84]">{r.referredUserEmail}</span>
                      </td>
                      <td className="py-3 text-[#818A84]">{formatDate(r.registeredAt)}</td>
                      <td className="py-3">
                        <span className="capitalize font-medium text-[#171C19]">
                          {r.subscriptionRole || 'Registered Member'}
                        </span>
                        {r.subscriptionPlan && (
                          <span className="text-[10px] text-[#818A84] block">{r.subscriptionPlan}</span>
                        )}
                      </td>
                      <td className="py-3">
                        {r.hasConverted ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                            Converted (Paid)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-black/[0.04] text-[#818A84] text-[10px]">
                            Registered Free
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right font-semibold text-black">
                        {totalComm > 0 ? formatCurrency(totalComm) : '₹0'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="pt-4 border-t border-black/[0.06]">
              <Pagination
                currentPage={referralsPage}
                totalItems={referrals.length}
                pageSize={referralsPerPage}
                onPageChange={setReferralsPage}
              />
            </div>
          </div>
        )}
      </div>

      {/* Payout Requests History */}
      {payouts.length > 0 && (
        <div className="apple-card p-6 border border-black/[0.06] space-y-4">
          <h3 className="text-base font-light text-[#171C19] tracking-tight">Withdrawal Requests History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8ECE9] text-[#818A84]">
                  <th className="py-2.5 font-medium">Date</th>
                  <th className="py-2.5 font-medium">Amount</th>
                  <th className="py-2.5 font-medium">Method</th>
                  <th className="py-2.5 font-medium">Status</th>
                  <th className="py-2.5 font-medium">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECE9]">
                {paginatedPayouts.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 text-[#818A84]">{formatDate(p.requestedAt)}</td>
                    <td className="py-3 font-semibold text-black">{formatCurrency(p.amount)}</td>
                    <td className="py-3 uppercase text-[11px] text-[#818A84]">{p.payoutMethod}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        p.status === 'processed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'approved'
                          ? 'bg-blue-100 text-blue-800'
                          : p.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-[#818A84]">
                      {p.transactionReference || 'Processing'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pt-4 border-t border-black/[0.06]">
              <Pagination
                currentPage={payoutsPage}
                totalItems={payouts.length}
                pageSize={payoutsPerPage}
                onPageChange={setPayoutsPage}
              />
            </div>
          </div>
        </div>
      )}

      {/* Payout Request Modal */}
      {showPayoutModal && (
        <Modal
          isOpen={showPayoutModal}
          onClose={() => setShowPayoutModal(false)}
          title="Withdraw Affiliate Earnings"
          description={`Available balance: ${formatCurrency(affiliateProfile?.pendingPayout || 0)}`}
        >
          <div className="space-y-4">
            {payoutSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-medium">
                {payoutSuccess}
              </div>
            ) : (
              <>
                {payoutError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-medium">
                    {payoutError}
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-[#171C19] block mb-1">
                    Withdrawal Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(Number(e.target.value))}
                    max={affiliateProfile?.pendingPayout || 0}
                    className="w-full p-2.5 bg-[#F4F6F4] border border-[#E8ECE9] rounded-xl text-xs text-[#171C19]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#171C19] block mb-1">
                    Payout Method
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('upi')}
                      className={`flex-1 py-2 text-xs rounded-xl border font-medium ${
                        payoutMethod === 'upi' ? 'border-black bg-black text-white' : 'border-[#E8ECE9] bg-white text-[#171C19]'
                      }`}
                    >
                      UPI ID
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('bank_transfer')}
                      className={`flex-1 py-2 text-xs rounded-xl border font-medium ${
                        payoutMethod === 'bank_transfer' ? 'border-black bg-black text-white' : 'border-[#E8ECE9] bg-white text-[#171C19]'
                      }`}
                    >
                      Bank Transfer (NEFT/IMPS)
                    </button>
                  </div>
                </div>

                {payoutMethod === 'upi' ? (
                  <div>
                    <label className="text-xs font-semibold text-[#171C19] block mb-1">UPI ID</label>
                    <input
                      type="text"
                      placeholder="e.g. name@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full p-2.5 bg-[#F4F6F4] border border-[#E8ECE9] rounded-xl text-xs text-[#171C19]"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-semibold text-[#171C19] block mb-1">Account Holder Name</label>
                      <input
                        type="text"
                        value={bankAccount.accountName}
                        onChange={(e) => setBankAccount({ ...bankAccount, accountName: e.target.value })}
                        className="w-full p-2.5 bg-[#F4F6F4] border border-[#E8ECE9] rounded-xl text-xs text-[#171C19]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#171C19] block mb-1">Account Number</label>
                      <input
                        type="text"
                        value={bankAccount.accountNumber}
                        onChange={(e) => setBankAccount({ ...bankAccount, accountNumber: e.target.value })}
                        className="w-full p-2.5 bg-[#F4F6F4] border border-[#E8ECE9] rounded-xl text-xs text-[#171C19]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#171C19] block mb-1">IFSC Code</label>
                      <input
                        type="text"
                        value={bankAccount.ifsc}
                        onChange={(e) => setBankAccount({ ...bankAccount, ifsc: e.target.value })}
                        className="w-full p-2.5 bg-[#F4F6F4] border border-[#E8ECE9] rounded-xl text-xs text-[#171C19]"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setShowPayoutModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    isLoading={isSubmittingPayout}
                    onClick={handleRequestPayout}
                  >
                    Submit Withdrawal Request
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
