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
  X,
  MessageSquare,
  Building,
  Ticket,
  Radio,
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

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
  onBookingSuccess?: (ticket: TicketItem) => void;
  onRequireAuth?: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  onClose,
  event,
  onBookingSuccess,
  onRequireAuth,
}) => {
  const { profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'agenda' | 'speakers' | 'sponsors' | 'passes'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [attendeeName, setAttendeeName] = useState(profile?.fullName || '');
  const [attendeeEmail, setAttendeeEmail] = useState(profile?.email || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [issuedTicket, setIssuedTicket] = useState<TicketItem | null>(null);
  const [discountInfo, setDiscountInfo] = useState<EventDiscountResult | null>(null);
  const [redeemFreePass, setRedeemFreePass] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync selected category when event changes
  useEffect(() => {
    if (event?.ticketCategories && event.ticketCategories.length > 0) {
      setSelectedCategory(event.ticketCategories[0]);
    } else {
      setSelectedCategory(null);
    }
    setActiveTab('overview');
    setIssuedTicket(null);
    setBookingError(null);
  }, [event]);

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

  if (!isOpen || !event) return null;

  const isHackathon = event.eventType === 'hackathon';
  const prizePool = event.metadata?.prize_pool;
  const hackathonTracks = event.metadata?.hackathon_tracks;
  const discordUrl = event.metadata?.discord_url;

  const divisionMeta = event.divisionSlug ? DIVISIONS_CATALOG[event.divisionSlug] : null;

  const handleShare = () => {
    const text = `${event.title} - ${formatDate(event.startsAt)} at ${event.venueName}, ${event.city}. Check it out on eongrow!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
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
      if (onRequireAuth) {
        onRequireAuth();
      }
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
      const fullTicket: TicketItem = {
        ...res.ticket,
        eventTitle: event.title,
        eventDate: formatDateTime(event.startsAt),
        venueName: event.venueName,
        city: event.city,
        categoryName: redeemFreePass ? `${selectedCategory.name} (Free Pass Benefit)` : selectedCategory.name,
      };
      setIssuedTicket(fullTicket);
      if (onBookingSuccess) {
        onBookingSuccess(fullTicket);
      }
    } else {
      setBookingError(res.error || 'Failed to complete pass registration.');
    }
    setIsProcessing(false);
  };

  const capacityPct = Math.min(100, Math.round(((event.currentAttendees || 0) / (event.maxAttendees || 100)) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 md:p-8 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-[28px] shadow-2xl border border-black/10 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Sticky Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-md"
          title="Close detail view"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hero Header with Event Banner */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-neutral-900 flex-shrink-0">
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-4 left-4 right-16 flex items-center gap-2 flex-wrap z-10">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-md border border-white/20 shadow-xs flex items-center gap-1.5">
              {isHackathon ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  National Hackathon (36-Hour Sprint)
                </>
              ) : event.eventType === 'conference' ? (
                <>
                  <Building className="w-3.5 h-3.5 text-blue-300" />
                  Flagship Tech Summit & Expo
                </>
              ) : event.eventType === 'networking_meetup' ? (
                <>
                  <Users className="w-3.5 h-3.5 text-emerald-300" />
                  B2B Alliance & Matchmaking
                </>
              ) : (
                <>
                  <Award className="w-3.5 h-3.5 text-purple-300" />
                  Masterclass & Workshop
                </>
              )}
            </span>

            {divisionMeta && (
              <span
                className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-xs backdrop-blur-md"
                style={{ backgroundColor: divisionMeta.colorHex || '#171C19' }}
              >
                {divisionMeta.name}
              </span>
            )}

            {event.isOnline && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/90 text-white backdrop-blur-md flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" />
                Live Hybrid / Online
              </span>
            )}
          </div>

          {/* Bottom Title & Pitch */}
          <div className="absolute bottom-4 left-4 right-4 text-white z-10 space-y-1.5">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-white leading-tight">
              {event.title}
            </h2>
            <p className="text-xs sm:text-sm text-white/80 line-clamp-2 max-w-3xl leading-relaxed">
              {event.shortDescription || event.description}
            </p>
          </div>
        </div>

        {/* Quick Highlights Strip */}
        <div className="bg-[#171C19] text-white px-5 py-3.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-white/90">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">{formatDate(event.startsAt)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/90">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>{formatDateTime(event.startsAt)} IST</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/90">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{event.venueName}, {event.city}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/90 transition-colors text-[11px] font-medium flex items-center gap-1 border border-white/15"
              title="Add to Google Calendar"
            >
              <Calendar className="w-3 h-3" />
              + Calendar
            </a>
            <button
              onClick={handleShare}
              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/90 transition-colors text-[11px] font-medium flex items-center gap-1 border border-white/15 cursor-pointer"
              title="Copy event details"
            >
              <Share2 className="w-3 h-3" />
              {copiedLink ? 'Copied!' : 'Share'}
            </button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setActiveTab('passes')}
              className="bg-white text-black hover:bg-neutral-100 text-xs font-bold py-1 px-3 h-auto"
            >
              Register Pass →
            </Button>
          </div>
        </div>

        {/* Detail Navigation Tabs */}
        <div className="border-b border-black/[0.08] px-5 bg-neutral-50/70 flex items-center gap-1 overflow-x-auto flex-shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3.5 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-black text-[#171C19] font-semibold'
                : 'border-transparent text-[#818A84] hover:text-black'
            }`}
          >
            Overview & Details
          </button>
          {event.agenda && event.agenda.length > 0 && (
            <button
              onClick={() => setActiveTab('agenda')}
              className={`py-3 px-3.5 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'agenda'
                  ? 'border-black text-[#171C19] font-semibold'
                  : 'border-transparent text-[#818A84] hover:text-black'
              }`}
            >
              Schedule & Agenda ({event.agenda.length})
            </button>
          )}
          {event.speakers && event.speakers.length > 0 && (
            <button
              onClick={() => setActiveTab('speakers')}
              className={`py-3 px-3.5 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'speakers'
                  ? 'border-black text-[#171C19] font-semibold'
                  : 'border-transparent text-[#818A84] hover:text-black'
              }`}
            >
              Speakers & Mentors ({event.speakers.length})
            </button>
          )}
          {event.sponsors && event.sponsors.length > 0 && (
            <button
              onClick={() => setActiveTab('sponsors')}
              className={`py-3 px-3.5 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'sponsors'
                  ? 'border-black text-[#171C19] font-semibold'
                  : 'border-transparent text-[#818A84] hover:text-black'
              }`}
            >
              Partners & Sponsors ({event.sponsors.length})
            </button>
          )}
          <button
            onClick={() => setActiveTab('passes')}
            className={`py-3 px-3.5 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'passes'
                ? 'border-black text-[#171C19] font-semibold'
                : 'border-transparent text-[#818A84] hover:text-black'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            Passes & Registration
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: OVERVIEW & DETAILS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Capacity & Attendance Banner */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-black/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[#818A84] block text-[11px]">Admission Capacity</span>
                  <strong className="text-sm font-semibold text-[#171C19]">
                    {event.currentAttendees} of {event.maxAttendees} Passes Claimed ({capacityPct}%)
                  </strong>
                </div>
                <div className="w-full sm:w-48 bg-black/[0.08] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-black h-full rounded-full transition-all duration-500"
                    style={{ width: `${capacityPct}%` }}
                  />
                </div>
              </div>

              {/* Event Description */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-[#818A84]">About This Event</h4>
                <p className="text-sm text-[#525854] leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>

              {/* HACKATHON-SPECIFIC DETAIL SECTION */}
              {isHackathon && (
                <div className="space-y-5 pt-2">
                  {/* Prize Pool Breakdown Card */}
                  {prizePool && (
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white border border-amber-500/30 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-900 flex items-center justify-center">
                            <Trophy className="w-5 h-5 fill-current" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold block">
                              Grand Prize Pool
                            </span>
                            <h4 className="text-xl font-bold text-amber-950 font-mono">
                              {prizePool.total || '₹5,00,000 INR'}
                            </h4>
                          </div>
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-900 font-bold border border-amber-500/30">
                          Cash + Cloud Grants
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3.5 bg-white rounded-xl border border-amber-200 shadow-xs space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                            🥇 1st Place Champion
                          </span>
                          <strong className="text-black font-semibold text-xs block leading-snug">
                            {prizePool.first_prize || '₹2,50,000 Cash + $50k Cloud'}
                          </strong>
                        </div>
                        <div className="p-3.5 bg-white rounded-xl border border-amber-200 shadow-xs space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                            🥈 2nd Place Runner-Up
                          </span>
                          <strong className="text-black font-semibold text-xs block leading-snug">
                            {prizePool.second_prize || '₹1,50,000 Cash + $25k Cloud'}
                          </strong>
                        </div>
                        <div className="p-3.5 bg-white rounded-xl border border-amber-200 shadow-xs space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                            🥉 3rd Place Finalist
                          </span>
                          <strong className="text-black font-semibold text-xs block leading-snug">
                            {prizePool.third_prize || '₹1,00,000 Cash + Angel Intro'}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hackathon Problem Tracks */}
                  {hackathonTracks && hackathonTracks.length > 0 && (
                    <div className="space-y-2.5">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-[#818A84] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-black" />
                        Hackathon Tracks & Challenges
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {hackathonTracks.map((trk: string, idx: number) => (
                          <div key={idx} className="p-4 rounded-xl bg-black/[0.02] border border-black/[0.06] space-y-1">
                            <span className="text-[10px] font-mono text-[#818A84] uppercase tracking-wider block">
                              Track 0{idx + 1}
                            </span>
                            <strong className="text-xs font-semibold text-[#171C19] block">
                              {trk}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rules, Team Size, and Discord */}
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-black/[0.06] space-y-3">
                    <h5 className="font-semibold text-xs text-[#171C19] flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-black" />
                      Hackathon Participation Rules & Submission Format
                    </h5>
                    <ul className="text-xs text-[#525854] space-y-1.5 list-disc pl-4 leading-relaxed">
                      <li>Team Size: 1 to 4 members. Cross-college and independent hacker squads are welcome.</li>
                      <li>Submission Requirements: Public GitHub repository with MIT/Apache license and 3-minute video demo.</li>
                      <li>Fresh Code Rule: All core application code must be written within the 36-hour sprint window.</li>
                      <li>Mentorship: Live check-in reviews scheduled with staff engineers on Discord & on-site.</li>
                    </ul>

                    {discordUrl && (
                      <div className="pt-2 flex items-center justify-between border-t border-black/[0.04]">
                        <span className="text-xs text-[#818A84]">Need teammates or mentor help?</span>
                        <a
                          href={discordUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[#5865F2] text-white font-medium text-xs flex items-center gap-1.5 hover:bg-[#4752C4] transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Join Hackathon Discord
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Venue & Physical Check-in Details */}
              <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.06] space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#818A84] block">
                  Venue & Admission Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#818A84] block">Venue Address:</span>
                    <strong className="text-[#171C19] font-medium block">{event.venueName}</strong>
                    <span className="text-[#525854]">{event.city}, India</span>
                  </div>
                  <div>
                    <span className="text-[#818A84] block">Gate Authentication:</span>
                    <span className="text-[#525854] block">Cryptographic QR Pass scanned via WebRTC gate terminal. Instant offline verification supported.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCHEDULE & AGENDA */}
          {activeTab === 'agenda' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-[#171C19]">Event Itinerary & Timeline</h4>
                  <p className="text-xs text-[#818A84]">Keynotes, technical workshops, and mentor review checkpoints</p>
                </div>
                <span className="text-xs font-mono text-[#818A84]">{event.agenda?.length || 0} Scheduled Sessions</span>
              </div>

              <div className="space-y-3">
                {event.agenda?.map((ag, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-black/[0.06] hover:border-black/20 transition-all shadow-2xs space-y-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-black/[0.05] text-[#171C19]">
                          {ag.time}
                        </span>
                        {ag.venue && (
                          <span className="text-[10px] text-[#818A84] flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {ag.venue}
                          </span>
                        )}
                      </div>
                      <h5 className="font-medium text-sm text-[#171C19]">{ag.title}</h5>
                    </div>

                    {ag.speaker && (
                      <div className="sm:text-right text-xs text-[#818A84] flex-shrink-0">
                        <span className="block text-[10px] uppercase tracking-wider text-[#818A84]">Speaker / Lead</span>
                        <strong className="text-[#171C19] font-medium">{ag.speaker}</strong>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SPEAKERS & MENTORS */}
          {activeTab === 'speakers' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-[#171C19]">Featured Speakers, Jury & Mentors</h4>
                <p className="text-xs text-[#818A84]">Learn from technical founders, principal AI scientists, and investors</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {event.speakers?.map((sp, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-black/[0.06] shadow-2xs flex items-start gap-3.5"
                  >
                    <img
                      src={sp.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                      alt={sp.name}
                      className="w-12 h-12 rounded-full object-cover border border-black/10 flex-shrink-0"
                    />
                    <div className="space-y-1 flex-1 min-w-0">
                      <h5 className="font-medium text-sm text-[#171C19] truncate">{sp.name}</h5>
                      <p className="text-xs text-[#818A84] truncate">{sp.role} · <strong className="text-[#171C19] font-medium">{sp.company}</strong></p>
                      {sp.topic && (
                        <div className="pt-1">
                          <span className="text-[11px] font-medium text-black bg-black/[0.03] px-2 py-0.5 rounded inline-block line-clamp-1 border border-black/[0.04]">
                            "{sp.topic}"
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PARTNERS & SPONSORS */}
          {activeTab === 'sponsors' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-[#171C19]">Ecosystem Sponsors & Cloud Partners</h4>
                <p className="text-xs text-[#818A84]">Supported by industry leaders providing compute credits and fast-track hiring</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {event.sponsors?.map((sp, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-black/[0.06] shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <h5 className="font-medium text-sm text-[#171C19]">{sp.name}</h5>
                      <span className="text-xs text-[#818A84] block mt-0.5">{sp.tier}</span>
                    </div>
                    {sp.logo && (
                      <img
                        src={sp.logo}
                        alt={sp.name}
                        className="w-10 h-10 rounded-xl object-cover border border-black/10 flex-shrink-0"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PASSES & REGISTRATION */}
          {activeTab === 'passes' && (
            <div className="space-y-5">
              {issuedTicket ? (
                /* Issued Ticket Success View */
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <h4 className="font-bold text-base text-emerald-900">Pass Confirmed & Issued!</h4>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Your digital pass has been generated and saved to your cryptographic QR wallet. Present this at the venue gate for instant admission.
                  </p>

                  <div className="p-4 bg-white rounded-xl border border-emerald-300 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-xs">
                      <span className="text-[#818A84] block text-[10px] uppercase tracking-wider">Pass Holder</span>
                      <strong className="text-sm font-semibold text-[#171C19] block">{issuedTicket.attendeeName}</strong>
                      <span className="text-[#818A84]">{issuedTicket.categoryName}</span>
                      <div className="pt-1 text-[11px] font-mono text-[#818A84]">
                        Ticket ID: #{issuedTicket.ticketNumber}
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <QRCodeView value={issuedTicket.qrToken || `pass:${issuedTicket.id}`} size={110} />
                      <span className="text-[10px] font-mono text-[#818A84]">Gate Token</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button variant="outline" size="sm" onClick={() => setIssuedTicket(null)}>
                      Register Another Pass
                    </Button>
                  </div>
                </div>
              ) : (
                /* Pass Selection & Registration Form */
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-[#171C19]">Select Your Admission Pass Tier</h4>
                    <p className="text-xs text-[#818A84]">
                      Verified students receive 100% free passes. Subsidies automatically applied.
                    </p>
                  </div>

                  {bookingError && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-medium">
                      {bookingError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {event.ticketCategories.map((cat) => {
                      const isSelected = selectedCategory?.id === cat.id;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                            isSelected
                              ? 'border-black bg-black/[0.02] shadow-sm'
                              : 'border-black/[0.08] hover:border-black/30 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h5 className="font-semibold text-sm text-[#171C19]">{cat.name}</h5>
                              <span className="text-[11px] text-[#818A84] block mt-0.5">
                                {cat.isFree ? '100% Free Entry' : 'General & Industry Admission'}
                              </span>
                            </div>
                            <div className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0">
                              {isSelected && <div className="w-3 h-3 rounded-full bg-black" />}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between">
                            <span className="text-base font-bold text-black font-mono">
                              {cat.isFree ? '₹0 (Free)' : formatCurrency(cat.price)}
                            </span>
                            <span className="text-[10px] text-[#818A84]">
                              {cat.maxQuantity - cat.soldCount} remaining
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Attendee Info Form */}
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-black/[0.06] space-y-3">
                    <span className="text-xs font-semibold text-[#171C19] block">
                      Ticket Holder Identification
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-[#818A84] mb-1">Full Legal Name</label>
                        <input
                          type="text"
                          value={attendeeName}
                          onChange={(e) => setAttendeeName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full px-3 py-2 bg-white border border-black/10 rounded-xl text-xs text-[#171C19] focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#818A84] mb-1">Email for Pass Delivery</label>
                        <input
                          type="email"
                          value={attendeeEmail}
                          onChange={(e) => setAttendeeEmail(e.target.value)}
                          placeholder="your.email@college.edu"
                          className="w-full px-3 py-2 bg-white border border-black/10 rounded-xl text-xs text-[#171C19] focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                    </div>

                    {/* Benefit Entitlement Check */}
                    {discountInfo?.isFreePassAvailable && (
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-950 text-xs flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Gift className="w-4 h-4 text-amber-700 flex-shrink-0" />
                          <span className="font-medium text-xs">
                            {discountInfo.freePassesRemaining} Free Passes Available
                          </span>
                        </div>
                        <div className="flex items-center gap-2 select-none">
                          <span className="text-xs font-semibold text-black">Redeem</span>
                          <Switch
                            checked={redeemFreePass}
                            onCheckedChange={setRedeemFreePass}
                            activeColor="bg-emerald-600"
                            aria-label="Apply Free Pass"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Registration Button */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs">
                      <span className="text-[#818A84] block text-[10px]">Total Due:</span>
                      <strong className="text-base font-bold text-black font-mono">
                        {redeemFreePass || selectedCategory?.isFree
                          ? '₹0'
                          : formatCurrency(selectedCategory?.price || 0)}
                      </strong>
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      isLoading={isProcessing}
                      onClick={handleConfirmRegistration}
                      className="apple-press text-xs font-bold"
                    >
                      {profile ? 'Confirm & Generate Pass' : 'Sign In to Register Pass'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-neutral-50/80 border-t border-black/[0.08] flex items-center justify-between text-xs flex-shrink-0">
          <span className="text-[#818A84] flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-black/50" />
            Verified eongrow Event Admission
          </span>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Back to All Events
          </Button>
        </div>
      </div>
    </div>
  );
};
