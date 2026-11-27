import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { useDivision } from '../../context/useDivision';
import { formatDate, formatCompensation } from '../../lib/utils';
import { DIVISION_PERSONA_IMAGES } from '../../lib/divisions';
import { DataService, type EventItem, type OpportunityItem, type MemberItem, type TicketItem } from '../../services/dataService';
import type { ViewState } from '../../types/app.types';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { EventDetailModal } from '../events/EventDetailModal';

interface MemberDashboardProps {
  onNavigate: (view: ViewState) => void;
  onSelectEvent?: (event: EventItem) => void;
  onSelectOpportunity?: (opp: OpportunityItem) => void;
  onSelectMember?: (member: MemberItem) => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  onNavigate,
  onSelectEvent,
  onSelectOpportunity,
  onSelectMember,
}) => {
  const { profile } = useAuth();
  const {
    currentDivision,
    divisionMeta,
    setDivision,
    registeredDivisions,
    unregisteredDivisions,
    isJoined,
    isExploring,
    setActiveFeatureTab,
  } = useDivision();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [userTicket, setUserTicket] = useState<TicketItem | null>(null);
  const [selectedDetailEvent, setSelectedDetailEvent] = useState<EventItem | null>(null);

  useEffect(() => {
    async function loadData() {
      const [evts, opps, mems, tkts] = await Promise.all([
        DataService.getEvents(),
        DataService.getOpportunities(),
        DataService.getMembers(),
        DataService.getUserTickets(profile?.id),
      ]);
      setEvents(evts);
      setOpportunities(opps);
      setMembers(mems);
      if (tkts && tkts.length > 0) {
        setUserTicket(tkts[0]);
      }
    }
    loadData();
  }, [profile?.id]);

  const filteredOpportunities = opportunities.filter(
    (o) => o.divisionSlug === currentDivision
  ).slice(0, 3);

  const upcomingEvents = events.slice(0, 2);
  const suggestedMembers = members.filter((m) => m.id !== profile?.id).slice(0, 4);

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto pb-12">
      {/* Exploration Mode Announcement Banner */}
      {isExploring && (
        <div className="rounded-2xl p-4 sm:p-5 bg-amber-500/10 border border-amber-500/25 text-[#171C19] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-900 flex-shrink-0 text-lg">
              🔭
            </div>
            <div>
              <h4 className="font-semibold text-sm text-amber-950">
                Exploring {divisionMeta.name} (Preview Mode)
              </h4>
              <p className="text-xs text-amber-900/80 mt-0.5">
                You have preview access to this network's curated roles, summits, and directory. Join to submit applications, post, and unlock full member benefits.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {registeredDivisions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDivision(registeredDivisions[0].slug)}
                className="text-xs font-semibold bg-white/80 border-amber-500/30 text-amber-950"
              >
                Return to {registeredDivisions[0].name.split(' ')[0]}
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('memberships')}
              className="bg-amber-950 text-white hover:bg-black font-semibold text-xs border-0 shadow-xs"
            >
              Join {divisionMeta.name.split(' ')[0]} {currentDivision === 'student' ? '(Free)' : ''}
            </Button>
          </div>
        </div>
      )}
      {/* 1. Hero Welcome Card with Real Unsplash Abstract Texture */}
      <div className="relative overflow-hidden bg-[#121413] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-black/20 card-lift">
        {/* Real Abstract Texture Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1400&q=80"
            alt="Abstract Texture"
            className="w-full h-full object-cover object-center opacity-30 scale-105"
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extralight tracking-tight">
              Welcome back, {profile?.displayName || 'Innovator'}
            </h2>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              {divisionMeta.tagline}. Connect with verified peers, apply to high-impact opportunities, and manage tickets for upcoming summits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={() => onNavigate('directory')}
              className="bg-white text-black hover:bg-neutral-100 border-0 shadow-sm tap-press font-semibold"
            >
              Explore Members
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => onNavigate('events')}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm tap-press font-semibold"
            >
              View Summits
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="apple-card p-5 sm:p-6 border border-black/[0.06]">
          <span className="text-xs text-[#818A84]">Division</span>
          <h4 className="text-xl sm:text-2xl font-light text-[#171C19] tracking-tight mt-1 truncate">{divisionMeta.name.split(' ')[0]}</h4>
          <p className="text-xs text-black font-semibold mt-1">
            {isJoined(currentDivision) ? 'Active' : 'Exploring'}
          </p>
        </div>

        <div className="apple-card p-5 sm:p-6 border border-black/[0.06]">
          <span className="text-xs text-[#818A84]">Opportunities</span>
          <h4 className="text-xl sm:text-2xl font-light text-[#171C19] tracking-tight mt-1">{opportunities.length}+ Roles</h4>
          <p className="text-xs text-[#818A84] mt-1">Internships, Jobs & Deals</p>
        </div>

        <div className="apple-card p-5 sm:p-6 border border-black/[0.06]">
          <span className="text-xs text-[#818A84]">Summits</span>
          <h4 className="text-xl sm:text-2xl font-light text-[#171C19] tracking-tight mt-1">{events.length} Events</h4>
          <p className="text-xs text-black font-semibold mt-1">Instant QR Tickets</p>
        </div>

        <div className="apple-card p-5 sm:p-6 border border-black/[0.06]">
          <span className="text-xs text-[#818A84]">Verification</span>
          <h4 className="text-xl sm:text-2xl font-light text-[#171C19] tracking-tight mt-1 capitalize">
            {profile?.verificationLevel?.replace('_', ' ') || 'Unverified'}
          </h4>
          <p className="text-xs text-[#818A84] mt-1">Trust Protocol</p>
        </div>
      </div>

      {/* 3. Two-Column Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recommended Opportunities & Events */}
        <div className="lg:col-span-2 space-y-6">
          {/* Opportunities Section */}
          <div className="apple-card p-6 sm:p-7 border border-black/[0.06]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-black/[0.06]">
              <div>
                <h3 className="font-light text-lg text-[#171C19] tracking-tight">
                  Curated Opportunities
                </h3>
                <p className="text-xs text-[#818A84] mt-0.5">Matched to your profile and current division focus</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('opportunities')} className="apple-press text-xs font-semibold">
                View all
              </Button>
            </div>

            <div className="space-y-3">
              {filteredOpportunities.map((opp) => (
                <div
                  key={opp.id}
                  onClick={() => onSelectOpportunity?.(opp) || onNavigate('opportunities')}
                  className="p-4 sm:p-5 rounded-[20px] border border-black/[0.06] hover:border-black/20 hover:bg-[#F4F6F4]/60 transition-all cursor-pointer group apple-press bg-white/70 shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap text-xs text-[#818A84]">
                        <span className="font-medium text-[#171C19]">
                          {opp.opportunityType.replace('_', ' ')}
                        </span>
                        <span>·</span>
                        <span>
                          {opp.city} {opp.isRemote && '(Remote)'}
                        </span>
                      </div>
                      <h4 className="font-normal text-sm text-[#171C19] group-hover:text-black transition-colors tracking-tight">
                        {opp.title}
                      </h4>
                      <p className="text-xs text-[#818A84] line-clamp-1">{opp.companyName} · {opp.description}</p>
                    </div>

                    <div className="text-right sm:flex-shrink-0">
                      <p className="text-xs font-semibold text-[#171C19]">
                        {formatCompensation(opp.budgetMin, opp.budgetMax, opp.currency)}
                      </p>
                      <Button variant="secondary" size="sm" className="mt-2 text-xs py-1 apple-press">
                        Apply
                      </Button>
                    </div>
                  </div>

                  {/* Skills Pills */}
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-black/[0.04] flex-wrap">
                    {opp.requiredSkills.map((sk) => (
                      <span key={sk} className="text-[11px] font-medium text-[#171C19] bg-black/[0.03] border border-black/[0.04] px-2.5 py-0.5 rounded-full">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events Preview */}
          <div className="apple-card p-6 sm:p-7 border border-black/[0.06]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-black/[0.06]">
              <div>
                <h3 className="font-light text-lg text-[#171C19] tracking-tight">
                  Flagship Summits & Meetups
                </h3>
                <p className="text-xs text-[#818A84] mt-0.5">Workshops, hackathons, and strategic networking sessions</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('events')} className="apple-press text-xs font-semibold">
                All events
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent?.(evt) || setSelectedDetailEvent(evt)}
                  className="rounded-[22px] border border-black/[0.06] overflow-hidden hover:border-black/20 transition-all cursor-pointer group flex flex-col justify-between apple-press bg-white shadow-2xs"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={evt.bannerUrl}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2.5 left-2.5 apple-glass px-2.5 py-1 rounded-full text-xs font-medium text-[#171C19] border border-white/40 shadow-xs">
                      {formatDate(evt.startsAt)}
                    </div>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-normal text-sm text-[#171C19] group-hover:text-black transition-colors line-clamp-1 tracking-tight">
                        {evt.title}
                      </h4>
                      <p className="text-xs text-[#818A84] line-clamp-2 mt-1">{evt.shortDescription}</p>
                    </div>

                    <div className="pt-3 border-t border-black/[0.04] flex items-center justify-between text-xs">
                      <span className="text-[#818A84]">
                        {evt.city}
                      </span>
                      <span className="font-medium text-black">Register Pass</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Ticket Pass Preview & Recommended Connections */}
        <div className="space-y-6">
          {/* Quick Ticket & Mobile App Card with Subtle Abstract Texture */}
          <div className="apple-card p-6 relative overflow-hidden bg-white border border-black/[0.06]">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
              <img
                src="/images/abstract/card-light-texture.jpg"
                alt="Card Texture"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-medium text-[#171C19]">
                  Event Pass
                </span>
                <span className="text-[11px] text-black font-semibold">
                  {userTicket ? (userTicket.status === 'used' ? 'Used' : 'Valid') : 'Explore'}
                </span>
              </div>

              {userTicket ? (
                <div className="p-4 bg-white/95 backdrop-blur-md rounded-[20px] border border-black/[0.06] shadow-xs space-y-3">
                  <div>
                    <p className="text-xs text-[#818A84]">{userTicket.categoryName}</p>
                    <h5 className="font-normal text-sm text-[#171C19] tracking-tight mt-0.5">{userTicket.eventTitle}</h5>
                    <p className="text-xs text-[#818A84] mt-0.5">{userTicket.venueName}, {userTicket.city}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2.5 border-t border-dashed border-neutral-200">
                    <div>
                      <p className="text-[11px] text-[#818A84]">Attendee</p>
                      <p className="font-medium text-[#171C19]">{userTicket.attendeeName}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#818A84]">Ticket #</p>
                      <p className="font-mono text-xs text-[#171C19] font-medium">{userTicket.ticketNumber}</p>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs font-semibold mt-2 apple-press"
                    onClick={() => onNavigate('my-tickets')}
                  >
                    View Digital Pass & QR
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-white/95 backdrop-blur-md rounded-[20px] border border-black/[0.06] shadow-xs space-y-3 text-center">
                  <p className="text-xs text-[#818A84]">No passes booked yet</p>
                  <p className="text-xs text-[#171C19]">Explore national tech summits and claim your free or delegate ticket.</p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs font-semibold mt-1 apple-press"
                    onClick={() => onNavigate('events')}
                  >
                    Explore Summits
                  </Button>
                </div>
              )}

              <p className="text-xs text-[#818A84] text-center mt-3">
                Also accessible on the companion eongrow Ticket mobile app.
              </p>
            </div>
          </div>

          {/* Recommended Members to Connect */}
          <div className="apple-card p-6 border border-black/[0.06]">
            <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-black/[0.06]">
              <h3 className="font-light text-base text-[#171C19] tracking-tight">Discover Peers</h3>
              <button
                type="button"
                onClick={() => onNavigate('directory')}
                className="text-xs font-semibold text-black hover:underline cursor-pointer apple-press"
              >
                View Directory
              </button>
            </div>

            <div className="space-y-3">
              {suggestedMembers.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-[18px] hover:bg-black/[0.025] transition-colors apple-press"
                >
                  <div
                    onClick={() => onSelectMember?.(m) || onNavigate('directory')}
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                  >
                    <Avatar
                      src={m.avatarUrl}
                      name={m.fullName}
                      size="sm"
                      isVerified={m.verificationLevel !== 'unverified'}
                    />
                    <div className="min-w-0">
                      <h5 className="font-normal text-xs text-[#171C19] hover:text-black truncate">
                        {m.fullName}
                      </h5>
                      <p className="text-[11px] text-[#818A84] truncate">{m.headline}</p>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-xs px-3 py-1 flex-shrink-0 apple-press"
                    onClick={() => onSelectMember?.(m) || onNavigate('directory')}
                  >
                    Connect
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. The 7 Networks Hub — Unified Multi-Division Network Access (Moved to Bottom) */}
      <div className="apple-card p-6 sm:p-7 border border-black/[0.06] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-black/[0.06]">
          <div>
            <h3 className="font-light text-xl text-[#171C19] tracking-tight">Your Multi-Division Network Access</h3>
            <p className="text-xs text-[#818A84] mt-0.5">
              Only your registered divisions grant full active privileges. You can freely explore any other network in preview mode.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => onNavigate('memberships')} className="apple-press text-xs font-semibold">
            Manage Plans & Upgrades
          </Button>
        </div>

        {/* Section 1: Registered Workspaces */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#171C19]">
              Your Registered Networks ({registeredDivisions.length})
            </h4>
            <span className="text-[11px] text-black font-semibold">Full Active Access</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {registeredDivisions.map((div) => {
              const isCurrent = div.slug === currentDivision;

              return (
                <div
                  key={div.slug}
                  onClick={() => {
                    setDivision(div.slug);
                    onNavigate('dashboard');
                  }}
                  className={`rounded-[22px] transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between apple-press group bg-white ${
                    isCurrent
                      ? 'border-2 border-black shadow-md ring-2 ring-black/5'
                      : 'border border-black/[0.08] hover:border-black/30 hover:shadow-md'
                  }`}
                >
                  <div className="relative h-20 overflow-hidden">
                    <img
                      src={DIVISION_PERSONA_IMAGES[div.slug]}
                      alt={div.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="font-semibold drop-shadow-sm truncate">{div.name}</span>
                      <span className="text-[10px] font-bold bg-white text-black px-2 py-0.5 rounded-full shadow-xs">
                        {isCurrent ? 'Active Now' : 'Joined'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <p className="text-[11px] text-[#818A84] line-clamp-2">{div.tagline}</p>
                    <div className="mt-3 pt-2.5 border-t border-black/[0.04] flex items-center justify-between text-[11px]">
                      <span className={isCurrent ? 'text-black font-bold' : 'text-[#818A84] group-hover:text-[#171C19]'}>
                        {isCurrent ? 'Current Workspace' : 'Switch Workspace →'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Explore Other Networks (Preview Mode) */}
        {unregisteredDivisions.length > 0 && (
          <div className="pt-2 border-t border-black/[0.06]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#818A84]">
                Explore Other Networks ({unregisteredDivisions.length})
              </h4>
              <span className="text-[11px] text-[#818A84] font-medium">Click to Preview All Features</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {unregisteredDivisions.map((div) => {
                const isCurrent = div.slug === currentDivision;

                return (
                  <div
                    key={div.slug}
                    onClick={() => {
                      setDivision(div.slug);
                      setActiveFeatureTab('overview');
                      onNavigate('division-hub');
                    }}
                    className={`rounded-[22px] transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between apple-press group bg-white/70 hover:bg-white ${
                      isCurrent
                        ? 'border-2 border-amber-600 shadow-sm ring-2 ring-amber-500/20'
                        : 'border border-black/[0.05] hover:border-black/20 hover:shadow-xs opacity-85 hover:opacity-100'
                    }`}
                  >
                    <div className="relative h-20 overflow-hidden">
                      <img
                        src={DIVISION_PERSONA_IMAGES[div.slug]}
                        alt={div.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 filter grayscale-[25%]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white text-xs">
                        <span className="font-semibold drop-shadow-sm truncate">{div.name}</span>
                        <span className="text-[10px] font-medium bg-black/40 backdrop-blur-xs border border-white/20 px-2 py-0.5 rounded-full text-white/90">
                          {div.slug === 'student' ? 'Free Access' : 'Preview'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <p className="text-[11px] text-[#818A84] line-clamp-2">{div.tagline}</p>
                      <div className="mt-3 pt-2.5 border-t border-black/[0.04] flex items-center justify-between text-[11px]">
                        <span className={isCurrent ? 'text-amber-900 font-bold' : 'text-[#818A84] group-hover:text-black'}>
                          {isCurrent ? 'Currently Exploring' : 'Explore All Features →'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedDetailEvent && (
        <EventDetailModal
          isOpen={Boolean(selectedDetailEvent)}
          event={selectedDetailEvent}
          onClose={() => setSelectedDetailEvent(null)}
          onBookingSuccess={() => {
            setSelectedDetailEvent(null);
            onNavigate('my-tickets');
          }}
        />
      )}
    </div>
  );
};
