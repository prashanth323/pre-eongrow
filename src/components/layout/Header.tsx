import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Search,
  Bell,
  X,
  Users,
  Briefcase,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useDivision } from '../../context/useDivision';
import { supabase } from '../../lib/supabase';
import {
  DataService,
  type MemberItem,
  type OpportunityItem,
  type EventItem,
} from '../../services/dataService';
import type { ViewState } from '../../types/app.types';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

interface HeaderProps {
  onOpenMobileNav: () => void;
  onNavigate: (view: ViewState) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileNav, onNavigate }) => {
  const { profile } = useAuth();
  const { currentDivision, divisionMeta, isJoined } = useDivision();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    desc: string;
    time: string;
    unread: boolean;
    type: string;
  }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Searchable catalog state for real-time Apple Spotlight search
  const [searchCatalog, setSearchCatalog] = useState<{
    members: MemberItem[];
    opportunities: OpportunityItem[];
    events: EventItem[];
  }>({ members: [], opportunities: [], events: [] });

  useEffect(() => {
    let isMounted = true;
    async function loadNotifications() {
      const items = await DataService.getNotifications(profile?.id);
      if (isMounted) {
        setNotifications(items);
      }
    }
    loadNotifications();

    // Pre-cache searchable entities for instant Spotlight results
    async function loadSearchData() {
      const [members, opportunities, events] = await Promise.all([
        DataService.getMembers(),
        DataService.getOpportunities(),
        DataService.getEvents(),
      ]);
      if (isMounted) {
        setSearchCatalog({ members, opportunities, events });
      }
    }
    loadSearchData();

    // Supabase Realtime channel subscription for instant live updates
    const channel = supabase
      .channel(`public:notifications:${profile?.id || 'live'}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload: any) => {
          const n = payload.new;
          if (!profile?.id || n.user_id === profile.id) {
            setNotifications((prev) => [
              {
                id: n.id,
                title: n.title,
                desc: n.body,
                time: 'Just now',
                unread: true,
                type: n.notification_type || 'system',
              },
              ...prev,
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  // Click-outside listener for Spotlight search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
    await DataService.markNotificationsRead(profile?.id);
  };

  // Real-time filtered items across 3 dimensions
  const q = searchQuery.trim().toLowerCase();
  const matchingMembers = q
    ? searchCatalog.members
        .filter(
          (m) =>
            m.fullName.toLowerCase().includes(q) ||
            m.headline?.toLowerCase().includes(q) ||
            m.city?.toLowerCase().includes(q) ||
            m.divisions.some((d) => d.toLowerCase().includes(q))
        )
        .slice(0, 3)
    : [];

  const matchingOpportunities = q
    ? searchCatalog.opportunities
        .filter(
          (o) =>
            o.title.toLowerCase().includes(q) ||
            o.companyName?.toLowerCase().includes(q) ||
            o.divisionSlug.toLowerCase().includes(q)
        )
        .slice(0, 3)
    : [];

  const matchingEvents = q
    ? searchCatalog.events
        .filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.city?.toLowerCase().includes(q) ||
            e.venueName?.toLowerCase().includes(q)
        )
        .slice(0, 3)
    : [];

  const totalMatches =
    matchingMembers.length + matchingOpportunities.length + matchingEvents.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
    } else if (e.key === 'Enter' && q) {
      setIsSearchOpen(false);
      if (matchingOpportunities.length > 0) {
        onNavigate('opportunities');
      } else if (matchingEvents.length > 0) {
        onNavigate('events');
      } else {
        onNavigate('directory');
      }
    }
  };

  return (
    // Apple Design: Translucent chrome layer with content scrolling underneath
    <header className="sticky top-0 z-30 h-16 apple-glass border-b border-black/[0.06] px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu & Apple Spotlight Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 rounded-full text-[#171C19] hover:bg-black/[0.04] apple-press cursor-pointer"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search with Apple Spotlight dropdown */}
        <div ref={searchRef} className="relative w-full">
          <Search className="w-4 h-4 text-[#818A84] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={`Search members, opportunities, summits in ${divisionMeta.name}...`}
            value={searchQuery}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onKeyDown={handleKeyDown}
            className="w-full pl-9 pr-9 py-2 bg-black/[0.04] border border-transparent rounded-full text-xs md:text-sm text-[#171C19] placeholder:text-[#818A84] focus:bg-white focus:border-black/20 focus:ring-2 focus:ring-black/10 focus:outline-none transition-all"
          />

          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-black/[0.06] text-[#818A84] hover:text-black cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Apple Spotlight Results Popover */}
          {isSearchOpen && q.length > 0 && (
            <div className="absolute left-0 top-11 mt-1.5 w-full apple-card bg-white/95 backdrop-blur-2xl border border-black/[0.08] shadow-[0_16px_40px_-8px_rgba(0,0,0,0.18)] rounded-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] text-[11px] text-[#818A84] font-medium px-1">
                <span>Spotlight Search</span>
                <span>{totalMatches} results found</span>
              </div>

              {totalMatches === 0 ? (
                <div className="py-6 text-center text-xs text-[#818A84]">
                  No matching members, opportunities, or events found for "{searchQuery}".
                </div>
              ) : (
                <div className="divide-y divide-black/[0.04] space-y-2 pt-1">
                  {/* Members Section */}
                  {matchingMembers.length > 0 && (
                    <div className="pt-1.5 space-y-1">
                      <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-[#818A84]">
                        <Users className="w-3 h-3" />
                        <span>Members</span>
                      </div>
                      {matchingMembers.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => {
                            setIsSearchOpen(false);
                            onNavigate('directory');
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-black/[0.04] cursor-pointer apple-press transition-colors"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Avatar src={m.avatarUrl} name={m.fullName} size="sm" />
                            <div className="truncate">
                              <p className="text-xs font-semibold text-[#171C19] truncate">{m.fullName}</p>
                              <p className="text-[11px] text-[#818A84] truncate">{m.headline || 'Member'}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-black bg-black/[0.05] px-2 py-0.5 rounded-full capitalize">
                            {m.divisions[0] || m.city}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Opportunities Section */}
                  {matchingOpportunities.length > 0 && (
                    <div className="pt-2 space-y-1">
                      <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-[#818A84]">
                        <Briefcase className="w-3 h-3" />
                        <span>Opportunities</span>
                      </div>
                      {matchingOpportunities.map((o) => (
                        <div
                          key={o.id}
                          onClick={() => {
                            setIsSearchOpen(false);
                            onNavigate('opportunities');
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-black/[0.04] cursor-pointer apple-press transition-colors"
                        >
                          <div className="truncate">
                            <p className="text-xs font-semibold text-[#171C19] truncate">{o.title}</p>
                            <p className="text-[11px] text-[#818A84] truncate">{o.companyName} · {o.city} {o.isRemote && '(Remote)'}</p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-[#818A84] flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Events Section */}
                  {matchingEvents.length > 0 && (
                    <div className="pt-2 space-y-1">
                      <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-[#818A84]">
                        <Calendar className="w-3 h-3" />
                        <span>Summits & Events</span>
                      </div>
                      {matchingEvents.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => {
                            setIsSearchOpen(false);
                            onNavigate('events');
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-black/[0.04] cursor-pointer apple-press transition-colors"
                        >
                          <div className="truncate">
                            <p className="text-xs font-semibold text-[#171C19] truncate">{evt.title}</p>
                            <p className="text-[11px] text-[#818A84] truncate">{evt.city} · {evt.venueName}</p>
                          </div>
                          <span className="text-[10px] font-semibold text-black bg-black/[0.05] px-2 py-0.5 rounded-full">
                            {evt.isFree ? 'Free Pass' : 'Pass Open'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Quick Jump Action */}
              {totalMatches > 0 && (
                <div className="pt-2.5 mt-2 border-t border-black/[0.06] flex items-center justify-between text-[11px] text-[#818A84] px-1">
                  <span>Press <kbd className="px-1.5 py-0.5 rounded bg-black/[0.06] text-[10px] font-mono text-black">Enter</kbd> to view in full hub</span>
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      onNavigate('directory');
                    }}
                    className="font-bold text-black hover:underline cursor-pointer"
                  >
                    View Directory →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions, Quick Tickets & Profile */}
      <div className="flex items-center gap-2.5 md:gap-3.5">
        {/* Quick Ticket Action */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('my-tickets')}
          className="hidden md:inline-flex"
        >
          Tickets
        </Button>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full text-[#171C19] hover:bg-black/[0.04] relative apple-press cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className={`w-5 h-5 ${notifications.some((n) => n.unread) ? 'text-black' : 'text-[#818A84]'}`} />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 md:w-96 apple-card bg-white/95 backdrop-blur-2xl border border-black/[0.08] p-5 z-50 animate-in fade-in zoom-in-95 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.18)] rounded-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                <h4 className="font-light text-sm text-[#171C19]">Notifications</h4>
                <span className="text-xs text-[#818A84]">{notifications.filter((n) => n.unread).length} new</span>
              </div>
              <div className="py-2.5 space-y-2 max-h-72 overflow-y-auto scrollbar-none">
                {notifications.length === 0 ? (
                  <p className="text-xs text-[#818A84] py-4 text-center">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-2xl transition-colors cursor-pointer apple-press ${
                        n.unread ? 'bg-black/[0.05] hover:bg-black/[0.08]' : 'hover:bg-black/[0.03]'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-semibold text-[#171C19]">{n.title}</p>
                        <p className="text-[11px] text-[#525854] mt-0.5 leading-relaxed">{n.desc}</p>
                        <p className="text-[10px] text-black mt-1 font-semibold">{n.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="pt-2 border-t border-black/[0.06] text-center">
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-xs font-semibold text-black hover:underline cursor-pointer"
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Avatar & Settings Shortcut */}
        <div
          onClick={() => onNavigate('settings')}
          className="flex items-center gap-2 pl-1 cursor-pointer apple-press"
        >
          <Avatar
            src={profile?.avatarUrl}
            name={profile?.fullName}
            size="sm"
            isVerified={profile?.verificationLevel !== 'unverified'}
          />
        </div>
      </div>
    </header>
  );
};
