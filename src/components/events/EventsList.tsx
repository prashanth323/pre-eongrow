import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Gift,
  Ticket,
  MapPin,
  Users,
  Trophy,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useDivision } from '../../context/useDivision';
import { DIVISIONS_CATALOG } from '../../lib/divisions';
import { formatCurrency, formatDate, formatDateTime } from '../../lib/utils';
import { ABSTRACT_IMAGES } from '../../lib/abstractImages';
import { DataService, type EventItem, type TicketItem } from '../../services/dataService';
import type { EventDiscountResult } from '../../types/app.types';
import { QRCodeView } from '../common/QRCodeView';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { AppleSelect } from '../ui/AppleSelect';
import { Switch } from '../ui/Switch';
import { Pagination } from '../common/Pagination';
import { EventDetailModal } from './EventDetailModal';
import { EventExpandedView } from './EventExpandedView';

interface EventsListProps {
  onViewTickets: () => void;
}

export const EventsList: React.FC<EventsListProps> = ({ onViewTickets }) => {
  const { profile } = useAuth();
  const { currentDivision, divisionMeta, isExploring } = useDivision();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>(currentDivision);
  const [filterType, setFilterType] = useState<'all' | 'conference' | 'hackathon'>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    setSelectedDivision(currentDivision);
  }, [currentDivision]);

  // Event Detail Modal State
  const [selectedDetailEvent, setSelectedDetailEvent] = useState<EventItem | null>(null);

  // Booking Modal State
  const [bookingEvent, setBookingEvent] = useState<EventItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [attendeeName, setAttendeeName] = useState(profile?.fullName || '');
  const [attendeeEmail, setAttendeeEmail] = useState(profile?.email || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [issuedTicket, setIssuedTicket] = useState<TicketItem | null>(null);
  const [discountInfo, setDiscountInfo] = useState<EventDiscountResult | null>(null);
  const [redeemFreePass, setRedeemFreePass] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvents() {
      const data = await DataService.getEvents();
      setEvents(data);
    }
    loadEvents();
  }, []);

  // Fetch benefit discount whenever event or category changes
  useEffect(() => {
    let isMounted = true;
    async function checkDiscount() {
      if (profile?.id && bookingEvent?.id && selectedCategory?.id) {
        const res = await DataService.getUserEventDiscount(
          profile.id,
          bookingEvent.id,
          selectedCategory.id
        );
        if (isMounted) {
          setDiscountInfo(res);
          if (res.isFreePassAvailable) {
            setRedeemFreePass(true);
          } else {
            setRedeemFreePass(false);
          }
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
  }, [profile?.id, bookingEvent?.id, selectedCategory?.id]);

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      searchQuery === '' ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venueName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDivision =
      selectedDivision === 'all' || !e.divisionSlug || e.divisionSlug === selectedDivision;
    const matchesType =
      filterType === 'all' ||
      (filterType === 'hackathon' ? e.eventType === 'hackathon' : e.eventType !== 'hackathon');

    return matchesSearch && matchesDivision && matchesType;
  });

  const paginatedEvents = filteredEvents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleStartBooking = (evt: EventItem) => {
    setBookingEvent(evt);
    setSelectedCategory(evt.ticketCategories[0] || null);
    setAttendeeName(profile?.fullName || 'Aarav Sharma');
    setAttendeeEmail(profile?.email || 'member@eongrow.network');
    setIssuedTicket(null);
    setBookingError(null);
  };

  const handleConfirmRegistration = async () => {
    if (!bookingEvent || !selectedCategory) return;
    setIsProcessing(true);
    setBookingError(null);

    const res = await DataService.bookTicket({
      eventId: bookingEvent.id,
      ticketCategoryId: selectedCategory.id,
      userId: profile?.id || 'd0000000-0000-0000-0000-000000000003',
      attendeeName: attendeeName || profile?.fullName || 'eongrow Member',
      attendeeEmail: attendeeEmail || profile?.email || 'member@eongrow.network',
      isFree: selectedCategory.isFree,
      price: selectedCategory.price,
      redeemFreePass: redeemFreePass && Boolean(discountInfo?.isFreePassAvailable),
    });

    if (res.success && res.ticket) {
      setIssuedTicket({
        ...res.ticket,
        eventTitle: bookingEvent.title,
        eventDate: formatDateTime(bookingEvent.startsAt),
        venueName: bookingEvent.venueName,
        city: bookingEvent.city,
        categoryName: redeemFreePass ? `${selectedCategory.name} (Lifetime Free Pass)` : selectedCategory.name,
      });
    } else {
      setBookingError(res.error || 'Failed to complete ticket registration.');
    }
    setIsProcessing(false);
  };

  if (selectedDetailEvent) {
    return (
      <EventExpandedView
        event={selectedDetailEvent}
        onBack={() => setSelectedDetailEvent(null)}
        onBookingSuccess={() => {
          setSelectedDetailEvent(null);
          onViewTickets();
        }}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Summits Header with Pure Abstract Geometry Texture */}
      <div className="relative overflow-hidden rounded-[26px] bg-[#121413] p-6 sm:p-7 text-white shadow-sm border border-white/10 card-lift">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-35">
          <img
            src={ABSTRACT_IMAGES.summits}
            alt="Summits Abstract Architecture"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extralight tracking-tight text-white">
              Flagship Summits & Roundtables
            </h2>
            <p className="text-xs sm:text-sm text-white/75 leading-relaxed max-w-2xl">
              Workshops, AI hackathons, B2B exhibitions, and investor roundtables across Bangalore, Hyderabad, Mumbai, and Delhi-NCR.
            </p>
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={onViewTickets}
            className="bg-white text-black hover:bg-neutral-100 border-0 font-bold text-xs apple-press shadow-xs flex-shrink-0"
          >
            My Tickets & QR Wallet →
          </Button>
        </div>
      </div>

      {/* Exploration Banner */}
      {isExploring && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-amber-800 font-bold text-base">🔭</span>
            <span className="text-amber-950 font-medium">
              You are viewing summits & events in the <strong>{divisionMeta.name}</strong> network in preview mode.
            </span>
          </div>
          <span className="text-[11px] text-amber-900 bg-amber-500/20 px-2.5 py-1 rounded-full font-semibold flex-shrink-0">
            Preview Mode
          </span>
        </div>
      )}

      {/* Search Bar & Division Filter - Apple Bento Pill Controls */}
      <div className="apple-card p-4 sm:p-5 border border-black/[0.06] space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-[#818A84] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search summits & hackathons by title, city, or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-black/[0.03] border border-transparent rounded-full text-xs md:text-sm text-[#171C19] placeholder:text-[#818A84] focus:bg-white focus:border-black/20 focus:ring-2 focus:ring-black/10 focus:outline-none transition-all"
            />
          </div>

          <div className="sm:col-span-4">
            <AppleSelect
              options={[
                { value: currentDivision, label: `${divisionMeta.name} (Current)` },
                { value: 'all', label: 'All 7 Ecosystems' },
                ...Object.values(DIVISIONS_CATALOG)
                  .filter((d) => d.slug !== currentDivision)
                  .map((d) => ({
                    value: d.slug,
                    label: d.name,
                  })),
              ]}
              value={selectedDivision}
              onChange={setSelectedDivision}
              className="w-full"
              buttonClassName="py-2.5 px-4 rounded-full bg-black/[0.03] border-transparent hover:border-black/10"
            />
          </div>
        </div>

        {/* Filter bar with segmented tabs */}
        <div className="flex items-center gap-1.5 pt-3 border-t border-black/[0.04] overflow-x-auto scrollbar-none py-0.5">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-black text-white shadow-xs'
                : 'bg-black/[0.03] text-[#818A84] hover:text-black'
            }`}
          >
            All Experiences ({events.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('conference')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'conference'
                ? 'bg-black text-white shadow-xs'
                : 'bg-black/[0.03] text-[#818A84] hover:text-black'
            }`}
          >
            Flagship Summits
          </button>
          <button
            type="button"
            onClick={() => setFilterType('hackathon')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'hackathon'
                ? 'bg-black text-white shadow-xs'
                : 'bg-black/[0.03] text-[#818A84] hover:text-black'
            }`}
          >
            Hackathons
          </button>
        </div>
      </div>

      {/* Events Grid - Apple Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {paginatedEvents.map((evt) => {
          const prizePool = typeof evt.metadata?.prize_pool === 'object' ? evt.metadata?.prize_pool?.total : evt.metadata?.prize_pool;

          return (
            <div
              key={evt.id}
              onClick={() => setSelectedDetailEvent(evt)}
              className="apple-card p-0 overflow-hidden flex flex-col justify-between border border-black/[0.06] apple-press cursor-pointer hover:border-black/30 transition-all group"
            >
              <div>
                {/* Event Banner */}
                <div className="relative h-52 overflow-hidden bg-neutral-900">
                  <img
                    src={evt.bannerUrl}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    {prizePool ? (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500 text-black shadow-md flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 fill-current" />
                        {prizePool} Prize Pool
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-3 py-1 rounded-full apple-glass border border-white/30 text-white shadow-xs">
                        {formatDate(evt.startsAt)}
                      </span>
                    )}

                    {evt.divisionSlug && (
                      <span
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white shadow-xs backdrop-blur-md uppercase tracking-wider"
                        style={{ backgroundColor: DIVISIONS_CATALOG[evt.divisionSlug]?.colorHex || '#171C19' }}
                      >
                        {DIVISIONS_CATALOG[evt.divisionSlug]?.name.split(' ')[0] || evt.divisionSlug}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-white/80" />
                      {evt.venueName}, {evt.city}
                    </span>
                    <span className="text-white/80 font-mono text-[11px]">
                      {formatDate(evt.startsAt)}
                    </span>
                  </div>
                </div>

                {/* Event Body */}
                <div className="p-6 space-y-3.5">
                  <h3
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDetailEvent(evt);
                    }}
                    className="text-xl font-light text-[#171C19] group-hover:text-black cursor-pointer transition-colors tracking-tight"
                  >
                    {evt.title}
                  </h3>
                  <p className="text-xs text-[#525854] leading-relaxed line-clamp-2">
                    {evt.description}
                  </p>

                  <div className="space-y-1 pt-2 border-t border-black/[0.06] text-xs text-[#818A84]">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-black/50" />
                      <span>{formatDateTime(evt.startsAt)} IST</span>
                    </div>
                  </div>

                  {/* Pass Categories */}
                  <div className="pt-2">
                    <span className="text-xs text-[#818A84] block mb-1.5 font-medium">
                      Pass Categories & Entitlements
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {evt.ticketCategories.map((cat) => (
                        <span
                          key={cat.id}
                          className="text-[11px] px-2.5 py-0.5 rounded-full bg-black/[0.03] text-[#171C19] border border-black/[0.04] font-medium"
                        >
                          {cat.name}: <strong className="text-black">{cat.isFree ? 'Free' : formatCurrency(cat.price)}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-6 pt-0 flex items-center justify-between border-t border-black/[0.04] mt-4">
                <span className="text-xs text-[#818A84] font-medium">
                  <strong className="text-[#171C19]">{evt.currentAttendees}</strong> / {evt.maxAttendees} registered
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDetailEvent(evt);
                    }}
                    className="text-xs font-medium"
                  >
                    View Details
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartBooking(evt);
                    }}
                    className="apple-press text-xs font-semibold"
                  >
                    Register Pass
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Events Pagination */}
      <div className="pt-4 border-t border-black/[0.06]">
        <Pagination
          currentPage={currentPage}
          totalItems={filteredEvents.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Comprehensive Event Detail Mode Modal */}
      {selectedDetailEvent && (
        <EventDetailModal
          isOpen={Boolean(selectedDetailEvent)}
          onClose={() => setSelectedDetailEvent(null)}
          event={selectedDetailEvent}
          onBookingSuccess={(ticket) => {
            setSelectedDetailEvent(null);
            setIssuedTicket(ticket);
            setBookingEvent(selectedDetailEvent);
          }}
        />
      )}

      {/* Ticket Booking Modal with Membership Discount / Free Pass Redemption */}
      {bookingEvent && (
        <Modal
          isOpen={Boolean(bookingEvent)}
          onClose={() => setBookingEvent(null)}
          title={issuedTicket ? 'Registration Confirmed!' : `Register for ${bookingEvent.title}`}
          description={
            issuedTicket
              ? 'Your official eongrow QR Pass has been generated and added to your wallet.'
              : 'Select your pass category and confirm attendee information.'
          }
          maxWidth="lg"
        >
          <div className="space-y-5">
            {issuedTicket ? (
              /* Success / Ticket View */
              <div className="space-y-4 text-center">
                <div className="p-6 bg-[#FAFCFA] border border-[#E8ECE9] rounded-2xl space-y-4">
                  <div className="inline-flex p-3 bg-white rounded-2xl shadow-sm border border-[#E8ECE9]">
                    <QRCodeView value={issuedTicket.qrToken} size={160} />
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-black">Valid Digital Ticket</span>
                    <h4 className="font-light text-base text-[#171C19] mt-1">
                      {issuedTicket.eventTitle}
                    </h4>
                    <p className="text-xs text-[#818A84] mt-0.5">{issuedTicket.venueName}, {issuedTicket.city}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-[#E8ECE9] text-left">
                    <div>
                      <span className="text-[10px] text-[#818A84] block">Attendee Name</span>
                      <strong className="text-[#171C19]">{issuedTicket.attendeeName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#818A84] block">Pass Type</span>
                      <strong className="text-black">{issuedTicket.categoryName}</strong>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-[#E8ECE9]">
                      <span className="text-[10px] text-[#818A84] block">Unique Ticket ID</span>
                      <span className="font-mono text-xs font-semibold text-[#171C19]">{issuedTicket.ticketNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <Button variant="outline" size="sm" onClick={() => setBookingEvent(null)}>
                    Done
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setBookingEvent(null);
                      onViewTickets();
                    }}
                  >
                    View in Wallet
                  </Button>
                </div>
              </div>
            ) : (
              /* Booking Form */
              <div className="space-y-4">
                {bookingError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                    {bookingError}
                  </div>
                )}

                {/* Category Selection */}
                <div>
                  <label className="text-xs font-medium text-[#818A84] block mb-2">
                    Select Pass Category
                  </label>
                  <div className="space-y-2">
                    {bookingEvent.ticketCategories.map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          selectedCategory?.id === cat.id
                            ? 'border-black bg-black/[0.04] ring-1 ring-black/10'
                            : 'border-[#E8ECE9] hover:bg-[#F4F6F4]'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-xs text-[#171C19]">{cat.name}</p>
                          <p className="text-[11px] text-[#818A84]">
                            {cat.maxQuantity - cat.soldCount} passes remaining
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-black">
                            {cat.isFree ? 'Free Pass' : formatCurrency(cat.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lifetime Free Pass / Membership Discount Entitlements */}
                {discountInfo && !selectedCategory?.isFree && (
                  <div className="p-3.5 bg-black/[0.03] rounded-xl border border-black/[0.08] space-y-2">
                    {discountInfo.isFreePassAvailable ? (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <Gift className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <div>
                            <span className="text-xs font-semibold text-[#171C19] block">
                              Lifetime Member Benefit: Free Pass Available
                            </span>
                            <span className="text-[11px] text-[#818A84]">
                              {discountInfo.freePassesRemaining} of 3 free passes remaining
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 select-none">
                          <span className="text-xs font-medium text-[#171C19]">Redeem</span>
                          <Switch
                            checked={redeemFreePass}
                            onCheckedChange={setRedeemFreePass}
                            activeColor="bg-emerald-600"
                            aria-label="Redeem free pass"
                          />
                        </div>
                      </div>
                    ) : discountInfo.discountPercent > 0 ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-800">
                        <Ticket className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>
                          <strong>{discountInfo.discountPercent}% Membership Discount Applied</strong> (Saved {formatCurrency((selectedCategory?.price || 0) - discountInfo.finalPrice)})
                        </span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-[#818A84] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-black/50" />
                        <span>Yearly and Lifetime members enjoy 25% discount or free passes on all events.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Attendee Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-[#171C19] block mb-1">Attendee Name</label>
                    <input
                      type="text"
                      value={attendeeName}
                      onChange={(e) => setAttendeeName(e.target.value)}
                      className="w-full p-2.5 bg-[#F4F6F4] border border-[#E8ECE9] rounded-xl text-xs text-[#171C19]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#171C19] block mb-1">Attendee Email</label>
                    <input
                      type="email"
                      value={attendeeEmail}
                      onChange={(e) => setAttendeeEmail(e.target.value)}
                      className="w-full p-2.5 bg-[#F4F6F4] border border-[#E8ECE9] rounded-xl text-xs text-[#171C19]"
                    />
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-[#E8ECE9] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#818A84] block">Total Payable</span>
                    <span className="text-base font-semibold text-black">
                      {(() => {
                        if (selectedCategory?.isFree || (redeemFreePass && discountInfo?.isFreePassAvailable)) {
                          return '₹0 (Free)';
                        }
                        if (discountInfo && discountInfo.finalPrice !== undefined) {
                          return formatCurrency(discountInfo.finalPrice);
                        }
                        return formatCurrency(selectedCategory?.price || 0);
                      })()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setBookingEvent(null)}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      isLoading={isProcessing}
                      onClick={handleConfirmRegistration}
                    >
                      {selectedCategory?.isFree || (redeemFreePass && discountInfo?.isFreePassAvailable)
                        ? 'Confirm Free Pass'
                        : 'Proceed to Razorpay'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
