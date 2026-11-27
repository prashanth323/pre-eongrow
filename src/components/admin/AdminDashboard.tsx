import React, { useState, useEffect } from 'react';
import {
  Edit2,
} from 'lucide-react';
import { DIVISIONS_LIST, DIVISIONS_CATALOG } from '../../lib/divisions';
import { formatDate, formatCurrency } from '../../lib/utils';
import { ABSTRACT_IMAGES } from '../../lib/abstractImages';
import { DataService, MOCK_EVENTS } from '../../services/dataService';
import type {
  MembershipPlanItem,
  CourseItem,
  AffiliatePayoutItem,
} from '../../types/app.types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'plans' | 'courses' | 'affiliate' | 'users' | 'verification' | 'events' | 'audit'
  >('overview');

  const [stats, setStats] = useState<{
    totalUsers: number;
    activeUsers: number;
    totalEvents: number;
    upcomingEvents: number;
    totalOpportunities: number;
    activeOpportunities: number;
    totalPayments: number;
    totalRevenue: number;
    divisionBreakdown: Array<{ division: string; slug: string; member_count: number }>;
  } | null>(null);

  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [eventsList, setEventsList] = useState<any[]>(MOCK_EVENTS);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Plans Management State
  const [allPlans, setAllPlans] = useState<MembershipPlanItem[]>([]);
  const [editingPlan, setEditingPlan] = useState<MembershipPlanItem | null>(null);
  const [planForm, setPlanForm] = useState({ price: 0, womenPrice: 0, name: '', isActive: true });

  // Courses Management State
  const [allCourses, setAllCourses] = useState<CourseItem[]>([]);

  // Affiliate Management State
  const [commissionInput, setCommissionInput] = useState<string>('');
  const [minPayoutInput, setMinPayoutInput] = useState<number>(500);
  const [allPayouts, setAllPayouts] = useState<AffiliatePayoutItem[]>([]);
  const [payoutProcessModal, setPayoutProcessModal] = useState<AffiliatePayoutItem | null>(null);
  const [payoutTxRef, setPayoutTxRef] = useState<string>('');
  const [payoutNotes, setPayoutNotes] = useState<string>('');

  const loadAdminData = async () => {
    const [vReqs, adminUsers, evts, logs, platformStats, plans, courses, sett, payouts] = await Promise.all([
      DataService.getVerificationRequests(),
      DataService.getAdminUsers(),
      DataService.getEvents(),
      DataService.getAuditLogs(),
      DataService.getPlatformStats(),
      DataService.getMembershipPlans(),
      DataService.getCourses(),
      DataService.getAffiliateSettings(),
      DataService.getAffiliatePayouts(),
    ]);

    if (vReqs) setVerificationRequests(vReqs);
    if (adminUsers) setUsersList(adminUsers);
    if (evts && evts.length > 0) setEventsList(evts);
    if (logs) setAuditLogs(logs);
    if (platformStats) setStats(platformStats);
    if (plans) setAllPlans(plans);
    if (courses) setAllCourses(courses);
    if (sett) {
      setCommissionInput(sett.commissionPercentage !== null ? String(sett.commissionPercentage) : '');
      setMinPayoutInput(sett.minPayoutAmount || 500);
    }
    if (payouts) setAllPayouts(payouts);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleReviewVerification = async (id: string, status: 'approved' | 'rejected') => {
    setActionMessage(null);
    const res = await DataService.reviewVerification(id, status);
    if (res.success) {
      setVerificationRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      setActionMessage({
        type: 'success',
        text: `Verification request ${status === 'approved' ? 'approved' : 'rejected'} successfully in database.`,
      });
      loadAdminData();
    } else {
      setActionMessage({
        type: 'error',
        text: res.error || 'Failed to update verification request.',
      });
    }
  };

  const handleToggleUserStatus = async (id: string) => {
    setActionMessage(null);
    const user = usersList.find((u) => u.id === id);
    if (!user) return;
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const res = await DataService.toggleUserStatus(id, newStatus === 'active');
    if (res.success) {
      setUsersList((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, status: newStatus } : u
        )
      );
      setActionMessage({
        type: 'success',
        text: `User ${user.name} status updated to ${newStatus}.`,
      });
      loadAdminData();
    } else {
      setActionMessage({
        type: 'error',
        text: res.error || 'Failed to update user status.',
      });
    }
  };

  // Save Membership Plan Changes
  const handleSavePlan = async () => {
    if (!editingPlan) return;
    setActionMessage(null);

    const res = await DataService.updateMembershipPlan(editingPlan.id, {
      name: planForm.name,
      priceAmount: Number(planForm.price),
      womenPriceAmount: planForm.womenPrice > 0 ? Number(planForm.womenPrice) : null,
      isActive: planForm.isActive,
    });

    if (res.success) {
      setActionMessage({ type: 'success', text: `Membership plan "${planForm.name}" updated in database.` });
      setEditingPlan(null);
      await loadAdminData();
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to update plan.' });
    }
  };

  // Save Affiliate Settings
  const handleSaveAffiliateSettings = async () => {
    setActionMessage(null);
    const comm = commissionInput.trim() === '' ? null : Number(commissionInput);

    const res = await DataService.updateAffiliateSettings(comm, minPayoutInput);
    if (res.success) {
      setActionMessage({
        type: 'success',
        text: comm !== null
          ? `Affiliate commission rate updated to ${comm}% in database.`
          : 'Affiliate commission rate unset (pending administrative activation).',
      });
      await loadAdminData();
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to update affiliate settings.' });
    }
  };

  // Process Payout Request
  const handleProcessPayout = async (status: 'approved' | 'rejected' | 'processed') => {
    if (!payoutProcessModal) return;
    setActionMessage(null);

    const res = await DataService.processAffiliatePayout({
      payoutId: payoutProcessModal.id,
      status,
      transactionReference: payoutTxRef || undefined,
      notes: payoutNotes || undefined,
    });

    if (res.success) {
      setActionMessage({ type: 'success', text: `Payout request marked as ${status}.` });
      setPayoutProcessModal(null);
      setPayoutTxRef('');
      setPayoutNotes('');
      await loadAdminData();
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to update payout request.' });
    }
  };

  const totalMemberships = stats?.divisionBreakdown?.reduce((sum, d) => sum + Number(d.member_count), 0) ?? 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header with Abstract Texture */}
      <div className="relative overflow-hidden rounded-[26px] bg-[#171C19] p-6 sm:p-7 text-white shadow-sm border border-white/10 card-lift">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <img
            src={ABSTRACT_IMAGES.security}
            alt="Admin Security Texture"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-white/70 font-mono font-bold tracking-wider uppercase">Super Admin Operations</span>
            <h2 className="text-2xl sm:text-3xl font-extralight tracking-tight text-white">
              Platform Governance & Control
            </h2>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-2xl">
              Configure role-based subscription pricing, affiliate commission %, manage member payouts, courses, and audit immutable PostgreSQL logs.
            </p>
          </div>
          <span className="text-xs font-mono text-white/70 self-start md:self-center">
            PostgreSQL RLS Active
          </span>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-medium border ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {actionMessage.text}
        </div>
      )}

      {/* Admin Tabs - Apple Segmented Control */}
      <div className="apple-segment-track p-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none rounded-full">
        {[
          { id: 'overview', label: 'Platform Overview' },
          { id: 'plans', label: `Plans & Pricing (${allPlans.length})` },
          { id: 'affiliate', label: `Affiliate & Payouts (${allPayouts.filter((p) => p.status === 'pending').length} pending)` },
          { id: 'courses', label: `Courses (${allCourses.length})` },
          { id: 'verification', label: `Verifications (${verificationRequests.filter((v) => v.status === 'pending' || v.status === 'submitted').length})` },
          { id: 'users', label: `User Directory (${usersList.length})` },
          { id: 'events', label: 'Summits & Ticketing' },
          { id: 'audit', label: `Audit Logs (${auditLogs.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer apple-press ${
              activeTab === tab.id
                ? 'bg-white text-[#171C19] shadow-xs font-bold'
                : 'text-[#818A84] hover:text-[#171C19]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="apple-card p-5 sm:p-6 border border-black/[0.06] apple-press">
              <span className="text-xs text-[#818A84]">Total Registered Users</span>
              <h3 className="text-2xl font-light text-[#171C19] mt-2 tracking-tight">
                {stats?.totalUsers ?? usersList.length}
              </h3>
              <p className="text-xs text-black font-semibold mt-1">
                {stats?.activeUsers ?? usersList.filter((u) => u.status === 'active').length} Active Accounts
              </p>
            </div>

            <div className="apple-card p-5 sm:p-6 border border-black/[0.06] apple-press">
              <span className="text-xs text-[#818A84]">Gross Revenue Volume</span>
              <h3 className="text-2xl font-light text-[#171C19] mt-2 tracking-tight">
                {formatCurrency(stats?.totalRevenue ?? 0)}
              </h3>
              <p className="text-xs text-black font-semibold mt-1">
                {stats?.totalPayments ?? 0} Completed Payments
              </p>
            </div>

            <div className="apple-card p-5 sm:p-6 border border-black/[0.06] apple-press">
              <span className="text-xs text-[#818A84]">Active Division Memberships</span>
              <h3 className="text-2xl font-light text-[#171C19] mt-2 tracking-tight">
                {totalMemberships > 0 ? totalMemberships : usersList.reduce((sum, u) => sum + (u.divisions?.length || 0), 0)}
              </h3>
              <p className="text-xs text-[#818A84] mt-1">Across 7 network divisions</p>
            </div>

            <div className="apple-card p-5 sm:p-6 border border-black/[0.06] apple-press">
              <span className="text-xs text-[#818A84]">Pending Verifications</span>
              <h3 className="text-2xl font-light text-[#171C19] mt-2 tracking-tight">
                {verificationRequests.filter((v) => v.status === 'pending' || v.status === 'submitted').length}
              </h3>
              <p className="text-xs text-black font-semibold mt-1">
                Requires super admin review
              </p>
            </div>
          </div>

          {/* Division Memberships Distribution */}
          <Card className="p-6">
            <h4 className="font-light text-base text-[#171C19] tracking-tight mb-4">
              Multi-Division Membership Distribution
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {DIVISIONS_LIST.map((div) => {
                const count = stats?.divisionBreakdown?.find((d) => d.slug === div.slug)?.member_count ??
                  usersList.filter((u) => u.divisions?.includes(div.slug)).length;
                return (
                  <div key={div.slug} className="p-3.5 rounded-xl bg-black/[0.02] border border-black/[0.06] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#171C19]">{div.name}</p>
                      <span className="text-[10px] text-[#818A84] uppercase font-mono">{div.slug}</span>
                    </div>
                    <span className="text-sm font-light text-black font-semibold">{count}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Plans & Pricing */}
      {activeTab === 'plans' && (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E8ECE9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-light text-base text-[#171C19]">Role-Based Subscription Plans & Pricing</h4>
              <p className="text-xs text-[#818A84] mt-0.5">
                All pricing is dynamically managed in PostgreSQL. Changes immediately update across all checkout flows.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8ECE9] text-[#818A84] bg-black/[0.01]">
                  <th className="py-3 px-4 font-medium">Division</th>
                  <th className="py-3 px-4 font-medium">Plan Name</th>
                  <th className="py-3 px-4 font-medium">Period / Duration</th>
                  <th className="py-3 px-4 font-medium">Standard Price</th>
                  <th className="py-3 px-4 font-medium">Women's Price</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECE9]">
                {allPlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-black/[0.01]">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#171C19] capitalize">
                        {plan.divisionSlug ? (DIVISIONS_CATALOG as any)[plan.divisionSlug]?.name || plan.divisionSlug : 'Platform'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#171C19]">{plan.name}</td>
                    <td className="py-3.5 px-4 text-[#818A84]">{plan.period}</td>
                    <td className="py-3.5 px-4 font-semibold text-black">
                      {plan.price === 0 ? '₹0 (Free)' : formatCurrency(plan.price)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-800">
                      {plan.womenPrice !== undefined ? formatCurrency(plan.womenPrice) : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        plan.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-black/[0.04] text-[#818A84]'
                      }`}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs py-1 px-2.5 h-auto flex items-center gap-1.5 ml-auto"
                        onClick={() => {
                          setEditingPlan(plan);
                          setPlanForm({
                            name: plan.name,
                            price: plan.price,
                            womenPrice: plan.womenPrice || 0,
                            isActive: Boolean(plan.isActive),
                          });
                        }}
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit Pricing
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab: Affiliate Program & Payouts */}
      {activeTab === 'affiliate' && (
        <div className="space-y-6">
          {/* Commission Configuration Card */}
          <Card className="p-6">
            <h4 className="font-light text-base text-[#171C19] tracking-tight mb-2">
              Affiliate Commission Configuration
            </h4>
            <p className="text-xs text-[#818A84] mb-4">
              Configure the referral commission percentage applied to verified subscription payments.
              Leaving commission unset (empty) pauses automatic payouts while continuing referral tracking.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-xs font-semibold text-[#171C19] block mb-1">
                  Commission Percentage (%)
                </label>
                <input
                  type="number"
                  placeholder="Leave blank for unset"
                  value={commissionInput}
                  onChange={(e) => setCommissionInput(e.target.value)}
                  min="0"
                  max="100"
                  step="0.5"
                  className="w-full p-2.5 bg-[#F4F6F4] border border-[#E8ECE9] rounded-xl text-xs text-[#171C19]"
                />
                <span className="text-[10px] text-[#818A84] mt-1 block">
                  {commissionInput.trim() === '' ? 'Currently Unset (No commissions auto-generated)' : `Active: ${commissionInput}%`}
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171C19] block mb-1">
                  Minimum Payout Threshold (₹)
                </label>
                <input
                  type="number"
                  value={minPayoutInput}
                  onChange={(e) => setMinPayoutInput(Number(e.target.value))}
                  min="100"
                  className="w-full p-2.5 bg-[#F4F6F4] border border-[#E8ECE9] rounded-xl text-xs text-[#171C19]"
                />
              </div>

              <div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSaveAffiliateSettings}
                  className="w-full text-xs font-semibold"
                >
                  Save Affiliate Settings
                </Button>
              </div>
            </div>
          </Card>

          {/* Member Payout Requests Table */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#E8ECE9]">
              <h4 className="font-light text-base text-[#171C19]">Student Affiliate Withdrawal Requests</h4>
              <p className="text-xs text-[#818A84] mt-0.5">Review, approve, or mark withdrawal payouts processed with transaction reference.</p>
            </div>

            {allPayouts.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#818A84]">
                No affiliate withdrawal requests recorded.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E8ECE9] text-[#818A84] bg-black/[0.01]">
                      <th className="py-3 px-4 font-medium">Requested By</th>
                      <th className="py-3 px-4 font-medium">Amount</th>
                      <th className="py-3 px-4 font-medium">Method</th>
                      <th className="py-3 px-4 font-medium">Details</th>
                      <th className="py-3 px-4 font-medium">Date</th>
                      <th className="py-3 px-4 font-medium">Status</th>
                      <th className="py-3 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8ECE9]">
                    {allPayouts.map((p) => (
                      <tr key={p.id} className="hover:bg-black/[0.01]">
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-[#171C19] block">{p.userName || 'Student Affiliate'}</span>
                          <span className="text-[11px] text-[#818A84]">{p.userEmail}</span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-black">{formatCurrency(p.amount)}</td>
                        <td className="py-3.5 px-4 uppercase text-[11px] font-mono">{p.payoutMethod}</td>
                        <td className="py-3.5 px-4 text-[#818A84]">
                          {p.payoutMethod === 'upi' ? (
                            <span className="font-mono text-black">{p.payoutDetails.upiId}</span>
                          ) : (
                            <span>{p.payoutDetails.accountNumber} ({p.payoutDetails.ifsc})</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[#818A84]">{formatDate(p.requestedAt)}</td>
                        <td className="py-3.5 px-4">
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
                        <td className="py-3.5 px-4 text-right">
                          {p.status === 'pending' || p.status === 'approved' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs py-1 px-2.5 h-auto ml-auto"
                              onClick={() => {
                                setPayoutProcessModal(p);
                                setPayoutTxRef('');
                                setPayoutNotes('');
                              }}
                            >
                              Manage Payout
                            </Button>
                          ) : (
                            <span className="text-[11px] font-mono text-[#818A84]">
                              {p.transactionReference || 'Completed'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab: Courses & Certifications */}
      {activeTab === 'courses' && (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E8ECE9]">
            <h4 className="font-light text-base text-[#171C19]">Courses & Certification Pricing</h4>
            <p className="text-xs text-[#818A84] mt-0.5">
              Course modules and internship opportunities remain 100% free for students. Official certification fees are configurable below.
            </p>
          </div>

          <div className="divide-y divide-[#E8ECE9]">
            {allCourses.map((c) => (
              <div key={c.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h5 className="font-medium text-sm text-[#171C19]">{c.title}</h5>
                  <p className="text-xs text-[#818A84] mt-0.5">
                    Instructor: {c.instructorName} • {c.durationHours} Hours Practical • {c.modules.length} Modules
                  </p>
                  <p className="text-xs text-emerald-700 font-semibold mt-1">
                    Free Course Access Active
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] text-[#818A84] block">Certification Fee</span>
                    <strong className="text-sm text-black font-semibold">{formatCurrency(c.certificationFee)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab: Verifications */}
      {activeTab === 'verification' && (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-[#E8ECE9]">
            <h4 className="font-light text-sm text-[#171C19]">Identity & Accreditation Verifications</h4>
            <p className="text-xs text-[#818A84]">Review student college IDs, corporate GSTIN, and startup incorporation records.</p>
          </div>

          {verificationRequests.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#818A84]">
              No verification requests pending review.
            </div>
          ) : (
            <div className="divide-y divide-[#E8ECE9]">
              {verificationRequests.map((req) => (
                <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-normal text-sm text-[#171C19]">{req.userName}</h5>
                      <span className="text-xs text-[#818A84] font-mono">({req.verificationType})</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                          req.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : req.status === 'rejected'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#818A84]">{req.userEmail} • Submitted {formatDate(req.submittedAt)}</p>
                    <div className="text-xs text-[#525854] bg-[#F4F6F4] p-2 rounded-lg font-mono">
                      {JSON.stringify(req.data)}
                    </div>
                  </div>

                  {(req.status === 'pending' || req.status === 'submitted') && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReviewVerification(req.id, 'rejected')}
                        className="text-red-600 hover:bg-red-50 border-red-200 text-xs"
                      >
                        Reject
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleReviewVerification(req.id, 'approved')}
                        className="text-xs"
                      >
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab: Users Management */}
      {activeTab === 'users' && (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-[#E8ECE9] flex items-center justify-between">
            <div>
              <h4 className="font-light text-sm text-[#171C19]">User Directory & Multi-Role Privileges</h4>
              <p className="text-xs text-[#818A84] mt-0.5">Manage accounts, multi-division memberships, and active status.</p>
            </div>
          </div>

          {usersList.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#818A84]">
              Loading user directory from PostgreSQL...
            </div>
          ) : (
            <div className="divide-y divide-[#E8ECE9]">
              {usersList.map((user) => (
                <div key={user.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h5 className="font-normal text-sm text-[#171C19]">{user.name}</h5>
                      <span className="text-xs text-[#818A84] font-mono capitalize">{user.role?.replace(/_/g, ' ')}</span>
                      {user.status === 'suspended' && (
                        <span className="text-xs text-amber-600 font-medium">Suspended</span>
                      )}
                    </div>
                    <p className="text-xs text-[#818A84]">{user.email}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {user.divisions?.map((d: string) => (
                        <span key={d} className="px-1.5 py-0.5 rounded text-[10px] bg-black/[0.04] text-[#171C19] capitalize">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleUserStatus(user.id)}
                      className="text-xs"
                    >
                      {user.status === 'active' ? 'Suspend' : 'Reactivate'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab: Summits & Ticketing */}
      {activeTab === 'events' && (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-[#E8ECE9]">
            <h4 className="font-light text-sm text-[#171C19]">Event Quotas & Ticketing Ledger</h4>
            <p className="text-xs text-[#818A84]">Manage registration capacity, gate check-in logs, and ticket categories.</p>
          </div>

          <div className="divide-y divide-[#E8ECE9]">
            {eventsList.map((evt) => (
              <div key={evt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h5 className="font-normal text-sm text-[#171C19]">{evt.title}</h5>
                  <p className="text-xs text-[#818A84]">{evt.venueName}, {evt.city} • {formatDate(evt.startsAt)}</p>
                  <p className="text-xs text-black font-semibold">
                    {evt.currentAttendees} attendees booked / {evt.maxAttendees} total capacity
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-black font-semibold">Registrations Open</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab: Audit Logs */}
      {activeTab === 'audit' && (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-[#E8ECE9]">
            <h4 className="font-light text-sm text-[#171C19]">Administrative Audit Trail</h4>
            <p className="text-xs text-[#818A84]">Immutable record of all admin privileges and actions.</p>
          </div>
          {auditLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#818A84]">
              No audit logs recorded yet in database.
            </div>
          ) : (
            <div className="divide-y divide-[#E8ECE9] text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#171C19]">{log.action}</p>
                    <p className="text-[#818A84]">Actor: {log.actor} • Target: {log.target}</p>
                  </div>
                  <span className="text-[#818A84]">{log.time}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Plan Edit Modal */}
      {editingPlan && (
        <Modal
          isOpen={Boolean(editingPlan)}
          onClose={() => setEditingPlan(null)}
          title={`Edit ${editingPlan.name}`}
          description={`Update pricing and configuration for ${editingPlan.divisionSlug} - ${editingPlan.planType}.`}
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#171C19] block mb-1">Plan Display Name</label>
              <input
                type="text"
                value={planForm.name}
                onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                className="w-full p-2.5 bg-[#F4F6F4] border border-[#E8ECE9] rounded-xl text-xs text-[#171C19]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#171C19] block mb-1">Standard Price (₹)</label>
                <input
                  type="number"
                  value={planForm.price}
                  onChange={(e) => setPlanForm({ ...planForm, price: Number(e.target.value) })}
                  className="w-full p-2.5 bg-[#F4F6F4] border border-[#E8ECE9] rounded-xl text-xs text-[#171C19]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171C19] block mb-1">Women's Concession Price (₹)</label>
                <input
                  type="number"
                  value={planForm.womenPrice}
                  onChange={(e) => setPlanForm({ ...planForm, womenPrice: Number(e.target.value) })}
                  className="w-full p-2.5 bg-[#F4F6F4] border border-[#E8ECE9] rounded-xl text-xs text-[#171C19]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="planActiveCheck"
                checked={planForm.isActive}
                onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })}
                className="rounded border-gray-300 text-black focus:ring-black"
              />
              <label htmlFor="planActiveCheck" className="text-xs font-medium text-[#171C19] cursor-pointer">
                Plan is active and available for member checkout
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8ECE9]">
              <Button variant="outline" size="sm" onClick={() => setEditingPlan(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={handleSavePlan}>
                Save Changes to DB
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Payout Processing Modal */}
      {payoutProcessModal && (
        <Modal
          isOpen={Boolean(payoutProcessModal)}
          onClose={() => setPayoutProcessModal(null)}
          title="Process Withdrawal Payout"
          description={`Amount: ${formatCurrency(payoutProcessModal.amount)} to ${payoutProcessModal.userName}`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-[#FAFCFA] rounded-xl border border-[#E8ECE9] text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#818A84]">Method:</span>
                <strong className="uppercase">{payoutProcessModal.payoutMethod}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#818A84]">Details:</span>
                <span className="font-mono">
                  {payoutProcessModal.payoutMethod === 'upi'
                    ? payoutProcessModal.payoutDetails.upiId
                    : `${payoutProcessModal.payoutDetails.accountNumber} (${payoutProcessModal.payoutDetails.ifsc})`}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#171C19] block mb-1">
                Bank / UPI Transaction Reference (UTR)
              </label>
              <input
                type="text"
                placeholder="e.g. UPI-2026112001928374"
                value={payoutTxRef}
                onChange={(e) => setPayoutTxRef(e.target.value)}
                className="w-full p-2.5 bg-[#F4F6F4] border border-[#E8ECE9] rounded-xl text-xs text-[#171C19]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#171C19] block mb-1">
                Administrative Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="Notes for affiliate logs"
                value={payoutNotes}
                onChange={(e) => setPayoutNotes(e.target.value)}
                className="w-full p-2.5 bg-[#F4F6F4] border border-[#E8ECE9] rounded-xl text-xs text-[#171C19]"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#E8ECE9]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleProcessPayout('rejected')}
                className="text-red-600 hover:bg-red-50 border-red-200 text-xs"
              >
                Reject Payout
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPayoutProcessModal(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleProcessPayout('processed')}
                >
                  Mark Processed & Paid
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
