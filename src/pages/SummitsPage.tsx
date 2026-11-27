import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  QrCode,
  Smartphone,
  Shield,
  Trophy,
} from 'lucide-react';
import { ABSTRACT_IMAGES } from '../lib/abstractImages';
import { formatDate, formatCurrency } from '../lib/utils';
import { DataService, MOCK_EVENTS, type EventItem } from '../services/dataService';
import type { ViewState } from '../types/app.types';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/common/Pagination';
import { EventExpandedView } from '../components/events/EventExpandedView';
import { EventDetailModal } from '../components/events/EventDetailModal';

interface SummitsPageProps {
  onNavigate: (view: ViewState) => void;
  onGetStarted: () => void;
}

export const SummitsPage: React.FC<SummitsPageProps> = ({
  onNavigate,
  onGetStarted,
}) => {
  const [events, setEvents] = useState<EventItem[]>(MOCK_EVENTS);
  const [selectedDetailEvent, setSelectedDetailEvent] = useState<EventItem | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;
  const paginatedEvents = events.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    async function load() {
      const data = await DataService.getEvents();
      if (data && data.length > 0) {
        setEvents(data);
      }
    }
    load();
  }, []);

  if (selectedDetailEvent) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <EventExpandedView
          event={selectedDetailEvent}
          onBack={() => setSelectedDetailEvent(null)}
          onRequireAuth={onGetStarted}
        />
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Header with Pure Abstract Geometry Texture (No Green Overlay) */}
      <section className="relative overflow-hidden bg-[#121413] text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={ABSTRACT_IMAGES.summits}
            alt="Summits Abstract Texture"
            className="w-full h-full object-cover opacity-35 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#121413]/70 via-[#121413]/90 to-[#121413]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight tracking-tight leading-tight">
            Flagship Summits & <br />
            <span className="font-light text-white/90">Cryptographic Pass Experience</span>
          </h1>
          <p className="text-sm sm:text-base text-white/75 max-w-2xl mx-auto leading-relaxed">
            Taking digital connections into physical reality across India's premier tech clusters. Secured with Apple Wallet PassKit companion and WebRTC hardware gate scanning.
          </p>
        </div>
      </section>

      {/* 2. Hardware Gate & Digital Wallet Feature Trio */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extralight text-[#171C19] tracking-tight">
            How eongrow Physical Admission Operates
          </h2>
          <p className="text-xs sm:text-sm text-[#818A84]">
            Engineered for zero-queue, 1-tap physical check-ins without internet dependency at the entrance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="apple-card p-6 border border-black/[0.06] space-y-3.5">
            <div className="w-10 h-10 rounded-2xl bg-black/[0.04] flex items-center justify-center text-black shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <h4 className="font-light text-base text-[#171C19] tracking-tight">Cryptographic QR Tokens</h4>
            <p className="text-xs text-[#525854] leading-relaxed">
              Every pass generates a tamper-proof cryptographic token linked to your verified identity. Screenshots cannot be forged or duplicated.
            </p>
          </div>

          <div className="apple-card p-6 border border-black/[0.06] space-y-3.5">
            <div className="w-10 h-10 rounded-2xl bg-black/[0.04] flex items-center justify-center text-black shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <h4 className="font-light text-base text-[#171C19] tracking-tight">Apple & Google Wallet Sync</h4>
            <p className="text-xs text-[#525854] leading-relaxed">
              Export native `.pkpass` files directly to Apple Wallet or save passes to Google Wallet for instant offline presentation at the venue gate.
            </p>
          </div>

          <div className="apple-card p-6 border border-black/[0.06] space-y-3.5">
            <div className="w-10 h-10 rounded-2xl bg-black/[0.04] flex items-center justify-center text-black shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="font-light text-base text-[#171C19] tracking-tight">WebRTC Hardware Scanner</h4>
            <p className="text-xs text-[#525854] leading-relaxed">
              Venue gate staff validate admission with live WebRTC camera hardware. Concurrency locks prevent duplicate check-in fraud.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Live Summits & Hackathons Catalog */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl sm:text-3xl font-extralight text-[#171C19] tracking-tight">
              Flagship Summits & Hackathons Across India
            </h3>
          </div>
          <span className="text-xs text-[#818A84]">{events.length} Upcoming Events</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paginatedEvents.map((evt) => {
            const isHackathon = evt.eventType === 'hackathon';
            const prizePool = evt.metadata?.prize_pool?.total;

            return (
              <div
                key={evt.id}
                onClick={() => setSelectedDetailEvent(evt)}
                className="apple-card p-0 overflow-hidden flex flex-col justify-between border border-black/[0.08] hover:shadow-xl transition-all group cursor-pointer"
              >
                <div className="relative h-60 overflow-hidden">
                  <img
                    src={evt.bannerUrl}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/20">
                      {isHackathon ? '36h Hackathon' : evt.eventType.replace('_', ' ')}
                    </span>

                    {prizePool && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-black shadow-md flex items-center gap-1">
                        <Trophy className="w-3 h-3 fill-current" />
                        {prizePool} Prize Pool
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-white/80" />
                      <span>{evt.city} · {evt.venueName}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-black/70 border border-white/20 text-[10px] font-medium text-white uppercase backdrop-blur-md">
                      {evt.isFree ? 'Free Pass Available' : 'Passes Open'}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-black font-semibold">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(evt.startsAt)}</span>
                    </div>
                    <h4 className="font-light text-xl text-[#171C19] tracking-tight group-hover:text-black transition-colors">
                      {evt.title}
                    </h4>
                    <p className="text-xs text-[#525854] leading-relaxed line-clamp-2">{evt.shortDescription}</p>
                  </div>

                  <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between gap-4">
                    <div className="text-xs">
                      <span className="text-[#818A84] block text-[10px]">Pass Starting At</span>
                      <strong className="text-sm font-semibold text-[#171C19]">
                        {evt.isFree
                          ? '₹0 (Free Student Pass)'
                          : formatCurrency(evt.ticketCategories?.find(tc => !tc.isFree)?.price || 1499)}
                      </strong>
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
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDetailEvent(evt);
                        }}
                        className="apple-press text-xs font-semibold"
                      >
                        Register Pass →
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summits Pagination */}
        {events.length > pageSize && (
          <div className="pt-6 border-t border-black/[0.06]">
            <Pagination
              currentPage={currentPage}
              totalItems={events.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </section>

      {/* 4. Bottom Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] bg-[#171C19] text-white p-8 sm:p-12 border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
            <img
              src={ABSTRACT_IMAGES.darkMatrix}
              alt="Texture"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-10 max-w-xl space-y-2">
            <h3 className="text-2xl font-light text-white tracking-tight">Need to manage physical tickets or scan badges?</h3>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Log in to view your issued passes in your Digital QR Wallet or access the Organizer WebRTC scanner.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 flex-shrink-0">
            <Button variant="primary" size="md" onClick={onGetStarted} className="apple-press font-bold text-xs">
              Access My Wallet →
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => onNavigate('landing')}
              className="apple-press text-xs font-semibold bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Return Home
            </Button>
          </div>
        </div>
      </section>

      {/* Detail Mode Modal */}
      {selectedDetailEvent && (
        <EventDetailModal
          isOpen={Boolean(selectedDetailEvent)}
          event={selectedDetailEvent}
          onClose={() => setSelectedDetailEvent(null)}
          onRequireAuth={onGetStarted}
        />
      )}
    </div>
  );
};
