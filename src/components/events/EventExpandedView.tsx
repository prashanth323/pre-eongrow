import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Trophy,
  Sparkles,
  Share2,
  CheckCircle2,
  Shield,
  Award,
  ArrowLeft,
  Building,
  Ticket,
  ExternalLink,
  Check,
  Smartphone,
  Lock,
  Gift,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { DIVISIONS_CATALOG } from '../../lib/divisions';
import { formatDate, formatDateTime, formatCurrency } from '../../lib/utils';
import { DataService, type EventItem, type TicketItem } from '../../services/dataService';
import type { EventDiscountResult } from '../../types/app.types';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';
import { QRCodeView } from '../common/QRCodeView';

interface EventExpandedViewProps {
  event: EventItem;
  onBack: () => void;
  onBookingSuccess?: (ticket: TicketItem) => void;
  onRequireAuth?: () => void;
}

export const EventExpandedView: React.FC<EventExpandedViewProps> = ({
  event,
  onBack,
  onBookingSuccess,
  onRequireAuth,
}) => {
  const { profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'agenda' | 'speakers' | 'tracks'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<any>(
    event.ticketCategories && event.ticketCategories.length > 0 ? event.ticketCategories[0] : null
  );
  const [attendeeName, setAttendeeName] = useState(profile?.fullName || '');
  const [attendeeEmail, setAttendeeEmail] = useState(profile?.email || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [issuedTicket, setIssuedTicket] = useState<TicketItem | null>(null);
  const [discountInfo, setDiscountInfo] = useState<EventDiscountResult | null>(null);
  const [redeemFreePass, setRedeemFreePass] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync profile details
  useEffect(() => {
    if (profile) {
      setAttendeeName(profile.fullName || '');
      setAttendeeEmail(profile.email || '');
    }
  }, [profile]);

  // Check discount whenever selected category changes
  useEffect(() => {
    let isMounted = true;
    async function checkDiscount() {
      if (profile?.id && event?.id && selectedCategory?.id) {
        const res = await DataService.getUserEventDiscount(
          profile.id,
          event.id,
          selectedCategory.id
        );
        if (isMounted) {
          setDiscountInfo(res);
          setRedeemFreePass(Boolean(res.isFreePassAvailable));
        }
      } else {
        setDiscountInfo(null);
        setRedeemFreePass(false);
      }
    }
    checkDiscount();
    return () => {
      isMounted = false;
    };
  }, [profile?.id, event?.id, selectedCategory?.id]);

  const isHackathon = event.eventType === 'hackathon';
  const rawPrizePool = event.metadata?.prize_pool;
  const prizePoolTotal =
    typeof rawPrizePool === 'object' && rawPrizePool !== null
      ? rawPrizePool.total
      : typeof rawPrizePool === 'string'
      ? rawPrizePool
      : null;

  const prizeBreakdown =
    typeof rawPrizePool === 'object' && rawPrizePool !== null
      ? [
          rawPrizePool.first_prize && {
            place: 'First Place',
            title: rawPrizePool.first_prize,
          },
          rawPrizePool.second_prize && {
            place: 'Second Place',
            title: rawPrizePool.second_prize,
          },
          rawPrizePool.third_prize && {
            place: 'Third Place',
            title: rawPrizePool.third_prize,
          },
        ].filter(Boolean)
      : [];

  const hackathonTracks = event.metadata?.hackathon_tracks || [];
  const discordUrl = event.metadata?.discord_url;
  const hasTracksOrPrizes = isHackathon || Boolean(prizePoolTotal) || hackathonTracks.length > 0;
  const divisionMeta = event.divisionSlug ? DIVISIONS_CATALOG[event.divisionSlug] : null;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(`${event.description}\n\nVenue: ${event.venueName}, ${event.city}`);
    const location = encodeURIComponent(`${event.venueName}, ${event.city}`);
    const start = new Date(event.startsAt).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end = new Date(event.endsAt).toISOString().replace(/-|:|\.\d\d\d/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
  };

  const handleConfirmRegistration = async () => {
    if (!profile) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    if (!selectedCategory) return;
    setIsProcessing(true);
    setBookingError(null);

    const res = await DataService.bookTicket({
      eventId: event.id,
      ticketCategoryId: selectedCategory.id,
      userId: profile.id,
      attendeeName: attendeeName || profile.fullName || 'eongrow Member',
      attendeeEmail: attendeeEmail || profile.email || 'member@eongrow.network',
      isFree: selectedCategory.isFree,
      price: selectedCategory.price,
      redeemFreePass: redeemFreePass && Boolean(discountInfo?.isFreePassAvailable),
    });

    if (res.success && res.ticket) {
      setIssuedTicket(res.ticket);
      if (onBookingSuccess) onBookingSuccess(res.ticket);
    } else {
      setBookingError(res.error || 'Failed to complete pass registration.');
    }
    setIsProcessing(false);
  };

  const capacityPct = Math.min(100, Math.round(((event.currentAttendees || 0) / (event.maxAttendees || 100)) * 100));

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 animate-in fade-in duration-200">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#818A84] hover:text-black transition-colors cursor-pointer px-3 py-1.5 rounded-full hover:bg-black/[0.05]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Summits & Hackathons</span>
        </button>

        <div className="flex items-center gap-2">
          <a
            href={getGoogleCalendarUrl()}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#818A84] hover:text-black transition-colors px-3 py-1.5 rounded-full border border-black/[0.08] hover:bg-black/[0.04]"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Add to Calendar</span>
          </a>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#818A84] hover:text-black transition-colors px-3 py-1.5 rounded-full border border-black/[0.08] hover:bg-black/[0.04]"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Hero Cover Header */}
      <div className="apple-card p-0 overflow-hidden border border-black/[0.08] bg-white shadow-sm rounded-[28px] relative">
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-neutral-900">
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Top Category Badges */}
          <div className="absolute top-5 left-5 right-5 flex items-center justify-between gap-2 flex-wrap">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-black/40 text-white backdrop-blur-md border border-white/20 shadow-xs">
              {isHackathon
                ? 'National Hackathon'
                : event.eventType === 'conference'
                ? 'Tech Summit'
                : 'Alliance Meetup'}
            </span>

            {divisionMeta && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium text-white backdrop-blur-md bg-black/40 border border-white/20">
                {divisionMeta.name}
              </span>
            )}
          </div>

          {/* Hero Bottom Information */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extralight tracking-tight text-white leading-tight">
              {event.title}
            </h1>
            <div className="flex items-center gap-4 text-xs sm:text-sm text-white/80 flex-wrap pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-white/70" />
                {formatDate(event.startsAt)} · {new Date(event.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-white/70" />
                {event.venueName}, {event.city}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Left 8 Cols (Details/Agenda), Right 4 Cols (Booking Pass Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Event Overview, Schedule, Speakers */}
        <div className="lg:col-span-8 space-y-6">
          {/* Segmented Tab Bar */}
          <div className="flex items-center gap-2 p-1 bg-black/[0.04] rounded-full max-w-md">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white text-black shadow-xs font-bold'
                  : 'text-[#818A84] hover:text-black'
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('agenda')}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'agenda'
                  ? 'bg-white text-black shadow-xs font-bold'
                  : 'text-[#818A84] hover:text-black'
              }`}
            >
              Agenda
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('speakers')}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'speakers'
                  ? 'bg-white text-black shadow-xs font-bold'
                  : 'text-[#818A84] hover:text-black'
              }`}
            >
              Speakers ({event.speakers?.length || 0})
            </button>
            {hasTracksOrPrizes && (
              <button
                type="button"
                onClick={() => setActiveTab('tracks')}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'tracks'
                    ? 'bg-white text-black shadow-xs font-bold'
                    : 'text-[#818A84] hover:text-black'
                }`}
              >
                {isHackathon ? 'Tracks & Prizes' : 'Tracks & Focus'}
              </button>
            )}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="apple-card p-6 sm:p-7 border border-black/[0.06] bg-white space-y-4">
                <h3 className="text-base font-semibold text-[#171C19]">About This Experience</h3>
                <p className="text-xs sm:text-sm text-[#525854] leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>

                {/* Key Highlights Bento */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-black/[0.06]">
                  <div className="p-3.5 rounded-xl bg-black/[0.02] border border-black/[0.04] space-y-1">
                    <span className="text-[10px] text-[#818A84] uppercase tracking-wider block">Format</span>
                    <span className="text-xs font-semibold text-[#171C19] capitalize">
                      {event.isOnline ? 'Virtual Stream' : 'Physical In-Person'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/[0.02] border border-black/[0.04] space-y-1">
                    <span className="text-[10px] text-[#818A84] uppercase tracking-wider block">Admission</span>
                    <span className="text-xs font-semibold text-[#171C19]">
                      Cryptographic PassKit
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/[0.02] border border-black/[0.04] space-y-1">
                    <span className="text-[10px] text-[#818A84] uppercase tracking-wider block">Capacity</span>
                    <span className="text-xs font-semibold text-emerald-700">
                      {event.currentAttendees || 42} / {event.maxAttendees || 250} Reserved
                    </span>
                  </div>
                </div>
              </div>

              {/* Venue & Location Details */}
              <div className="apple-card p-6 border border-black/[0.06] bg-white space-y-3">
                <h3 className="text-base font-semibold text-[#171C19]">Venue & Gate Access</h3>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black/[0.04] flex items-center justify-center flex-shrink-0 text-neutral-800">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#171C19]">{event.venueName}</h4>
                    <p className="text-xs text-[#818A84] mt-0.5">{event.city}, India</p>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-2 font-medium">
                      WebRTC Hardware Scanner Supported at Gate
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AGENDA */}
          {activeTab === 'agenda' && (
            <div className="apple-card p-6 sm:p-7 border border-black/[0.06] bg-white space-y-6">
              <h3 className="text-base font-semibold text-[#171C19]">Event Schedule & Milestones</h3>
              {event.agenda && event.agenda.length > 0 ? (
                <div className="relative border-l-2 border-black/[0.08] ml-3 space-y-6 pl-5">
                  {event.agenda.map((item, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-black ring-4 ring-white" />
                      <div className="space-y-1">
                        <span className="text-[11px] font-mono text-[#818A84] font-semibold block">
                          {item.time}
                        </span>
                        <h4 className="text-sm font-semibold text-[#171C19]">{item.title}</h4>
                        {item.venue && <p className="text-xs text-[#525854] leading-relaxed">Venue: {item.venue}</p>}
                        {item.speaker && (
                          <span className="text-[11px] text-emerald-800 font-medium block pt-0.5">
                            Speaker: {item.speaker}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#818A84]">Detailed agenda schedule will be published shortly before check-in.</p>
              )}
            </div>
          )}

          {/* TAB 3: SPEAKERS */}
          {activeTab === 'speakers' && (
            <div className="apple-card p-6 sm:p-7 border border-black/[0.06] bg-white space-y-6">
              <h3 className="text-base font-semibold text-[#171C19]">Keynote Speakers & Industry Mentors</h3>
              {event.speakers && event.speakers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.speakers.map((sp, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-black/[0.06] bg-black/[0.01] flex items-center gap-3.5"
                    >
                      <img
                        src={sp.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                        alt={sp.name}
                        className="w-12 h-12 rounded-full object-cover border border-black/10 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-[#171C19] truncate">{sp.name}</h4>
                        <p className="text-[11px] text-[#818A84] truncate">{sp.role}</p>
                        <span className="text-[10px] text-black/70 font-medium block mt-0.5">{sp.company}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#818A84]">Speakers are being finalized and announced on rolling basis.</p>
              )}
            </div>
          )}

          {/* TAB 4: HACKATHON TRACKS & PRIZES */}
          {hasTracksOrPrizes && activeTab === 'tracks' && (
            <div className="space-y-6">
              {/* Prize Pool Summary Card */}
              {prizePoolTotal && (
                <div className="apple-card p-6 border border-black/[0.08] bg-white space-y-2">
                  <h3 className="text-sm font-medium text-[#171C19]">
                    Prize Pool
                  </h3>
                  <p className="text-2xl sm:text-3xl font-light font-mono text-[#171C19] tracking-tight">
                    {prizePoolTotal}
                  </p>
                  <p className="text-xs text-[#525854] leading-relaxed">
                    Direct bank disbursement and non-dilutive ecosystem grants sponsored by network partners.
                  </p>
                </div>
              )}

              {/* Prize Allocation Breakdown */}
              {prizeBreakdown.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-[#171C19]">Prize Allocation</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {prizeBreakdown.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl border border-black/[0.06] bg-black/[0.02] flex flex-col justify-between space-y-2"
                      >
                        <span className="text-xs text-[#818A84] font-medium">{item.place}</span>
                        <p className="text-xs font-semibold text-[#171C19] leading-snug">
                          {item.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hackathon Problem Tracks & Challenges */}
              {hackathonTracks && hackathonTracks.length > 0 && (
                <div className="apple-card p-6 border border-black/[0.06] bg-white space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-[#171C19]">
                      {isHackathon ? 'Tracks & Challenges' : 'Focus Tracks'}
                    </h4>
                    <p className="text-xs text-[#818A84] mt-0.5">
                      Curated problem statements for team submissions.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {hackathonTracks.map((tr: any, idx: number) => {
                      const title = typeof tr === 'object' ? tr.title : tr;
                      const description = typeof tr === 'object' ? tr.description : null;
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl border border-black/[0.06] bg-black/[0.02] space-y-1"
                        >
                          <h5 className="text-xs font-semibold text-[#171C19]">{title}</h5>
                          <p className="text-xs text-[#525854] leading-relaxed">
                            {description ||
                              'Build production-ready, benchmarked solutions with clear evaluation metrics and deployable architectures.'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Evaluation & Community Bento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="apple-card p-5 border border-black/[0.06] bg-white space-y-3">
                  <h4 className="text-xs font-semibold text-[#171C19]">Evaluation Criteria</h4>
                  <div className="space-y-2 text-xs text-[#525854]">
                    <div className="flex items-center justify-between pb-1.5 border-b border-black/[0.04]">
                      <span>Technical Execution & Architecture</span>
                      <span className="font-mono text-[#171C19]">30%</span>
                    </div>
                    <div className="flex items-center justify-between pb-1.5 border-b border-black/[0.04]">
                      <span>Practical Utility & Market Fit</span>
                      <span className="font-mono text-[#171C19]">30%</span>
                    </div>
                    <div className="flex items-center justify-between pb-1.5 border-b border-black/[0.04]">
                      <span>UI/UX Polish & Experience Design</span>
                      <span className="font-mono text-[#171C19]">20%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Working Demo & Presentation</span>
                      <span className="font-mono text-[#171C19]">20%</span>
                    </div>
                  </div>
                </div>

                <div className="apple-card p-5 border border-black/[0.06] bg-white flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-[#171C19]">Hacker Community</h4>
                    <p className="text-xs text-[#525854] leading-relaxed">
                      Connect with teammates, access cloud resources, and schedule mentor office hours in our hacker channel.
                    </p>
                  </div>
                  {discordUrl ? (
                    <a
                      href={discordUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-4 rounded-full bg-black hover:bg-neutral-800 text-white transition-colors"
                    >
                      <span>Join Discord Channel</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-black/[0.02] text-xs text-[#818A84] text-center">
                      Channel links are shared upon pass confirmation.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Sticky Ticket Pass Reservation Card */}
        <div className="lg:col-span-4 sticky top-6 space-y-4">
          <div className="apple-card p-6 border border-black/[0.08] bg-white shadow-md rounded-[26px] space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs text-[#818A84]">
                <span>Admission Pass</span>
                <span className="text-emerald-700 font-semibold">{capacityPct}% Reserved</span>
              </div>
              <div className="w-full bg-black/[0.05] h-1.5 rounded-full overflow-hidden mt-1.5">
                <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${capacityPct}%` }} />
              </div>
            </div>

            {/* Issued Ticket QR Code Screen */}
            {issuedTicket ? (
              <div className="space-y-4 text-center">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-semibold">Pass Confirmed!</h4>
                  <p className="text-[11px] text-emerald-800">Your pass is secured and verified cryptographically.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-black/[0.08] shadow-xs inline-block">
                  <QRCodeView
                    value={issuedTicket.qrToken || issuedTicket.id}
                    size={160}
                  />
                </div>

                <div className="text-[11px] text-[#818A84] space-y-1">
                  <p>Present at venue entrance for WebRTC gate scanning.</p>
                  <p className="font-mono text-[10px]">Pass ID: #{issuedTicket.id.slice(0, 8)}</p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-medium"
                  onClick={() => setIssuedTicket(null)}
                >
                  Book Another Pass
                </Button>
              </div>
            ) : (
              /* Pass Category Selection & Checkout */
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#171C19] uppercase tracking-wider block">
                    Select Pass Tier
                  </label>
                  <div className="space-y-2">
                    {event.ticketCategories?.map((cat) => {
                      const isSelected = selectedCategory?.id === cat.id;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-left ${
                            isSelected
                              ? 'bg-black/[0.02] border-black/40 ring-1 ring-black/10'
                              : 'bg-white hover:bg-black/[0.01] border-black/[0.08]'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-semibold text-[#171C19] block">{cat.name}</span>
                            <span className="text-[10px] text-[#818A84]">{(cat as any).description || (cat.isFree ? 'Free Admission' : 'Full Access Pass')}</span>
                          </div>
                          <span className="text-xs font-bold text-black font-mono">
                            {cat.isFree || cat.price === 0 ? '₹0 Free' : formatCurrency(cat.price)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Attendee Details */}
                <div className="space-y-2.5 pt-2 border-t border-black/[0.06]">
                  <div>
                    <label className="text-[11px] font-medium text-[#818A84] block mb-1">
                      Attendee Name
                    </label>
                    <input
                      type="text"
                      value={attendeeName}
                      onChange={(e) => setAttendeeName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.03] border border-black/[0.08] text-xs text-[#171C19] focus:outline-none focus:border-black/30"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#818A84] block mb-1">
                      Attendee Email
                    </label>
                    <input
                      type="email"
                      value={attendeeEmail}
                      onChange={(e) => setAttendeeEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.03] border border-black/[0.08] text-xs text-[#171C19] focus:outline-none focus:border-black/30"
                    />
                  </div>
                </div>

                {/* Free Student Pass Entitlement Toggle Switch */}
                {discountInfo?.isFreePassAvailable && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <Gift className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <label
                            htmlFor="redeemPass"
                            className="text-xs font-semibold text-emerald-950 cursor-pointer block leading-tight"
                          >
                            Redeem Free Pass
                          </label>
                          <span className="text-[11px] text-emerald-700 block mt-0.5">
                            {discountInfo.freePassesRemaining} free passes remaining with membership
                          </span>
                        </div>
                      </div>
                      <Switch
                        id="redeemPass"
                        checked={redeemFreePass}
                        onCheckedChange={setRedeemFreePass}
                        activeColor="bg-emerald-600"
                        aria-label="Redeem 1 Free Lifetime Pass"
                      />
                    </div>
                  </div>
                )}

                {bookingError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                    {bookingError}
                  </div>
                )}

                {/* Confirm Action Button */}
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleConfirmRegistration}
                  isLoading={isProcessing}
                  className="w-full text-xs font-semibold py-3 cursor-pointer shadow-xs"
                >
                  {!profile
                    ? 'Sign In to Reserve Pass'
                    : selectedCategory?.isFree || redeemFreePass
                    ? 'Claim Pass & Generate QR (₹0)'
                    : `Book Pass (${formatCurrency(selectedCategory?.price || 0)})`}
                </Button>

                <p className="text-[10px] text-center text-[#818A84] flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-600" />
                  Instant WebRTC PassKit sync
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
