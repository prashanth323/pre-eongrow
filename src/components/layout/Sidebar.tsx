import React, { useState } from 'react';
import {
  LayoutDashboard,
  Layers,
  Compass,
  Users,
  Briefcase,
  Calendar,
  Ticket,
  CreditCard,
  Shield,
  QrCode,
  ChevronDown,
  Sparkles,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Building2,
  TrendingUp,
  Palette,
  Rocket,
  BookOpen,
  Share2,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useDivision } from '../../context/useDivision';
import type { FeatureTab } from '../../context/divisionContextDef';
import { cn } from '../../lib/utils';
import type { DivisionSlug, ViewState } from '../../types/app.types';
import { Avatar } from '../ui/Avatar';
import { AppleSelect } from '../ui/AppleSelect';

const DivisionIconRenderer: React.FC<{ slug: DivisionSlug; className?: string }> = ({ slug, className }) => {
  switch (slug) {
    case 'student': return <GraduationCap className={className} />;
    case 'career': return <Briefcase className={className} />;
    case 'freelancer': return <Palette className={className} />;
    case 'entrepreneur': return <Rocket className={className} />;
    case 'business': return <Building2 className={className} />;
    case 'influencer': return <Sparkles className={className} />;
    case 'investor': return <TrendingUp className={className} />;
    default: return <Compass className={className} />;
  }
};

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { profile, signOut, isAdmin, setDemoRole } = useAuth();
  const {
    currentDivision,
    divisionMeta,
    setDivision,
    registeredDivisions,
    unregisteredDivisions,
    isJoined,
    isExploring,
    activeFeatureTab,
    setActiveFeatureTab,
  } = useDivision();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNetworkMenu, setShowNetworkMenu] = useState(false);

  // Dynamic Navigation Items tailored strictly to active member vs. ecosystem explorer
  const getNavItemsForDivision = (slug: DivisionSlug) => {
    const baseItems = [
      { id: 'dashboard' as ViewState, label: 'Dashboard', icon: LayoutDashboard },
    ];

    let divisionSpecificItems: Array<{ id: ViewState; label: string; icon: any; tab?: FeatureTab }> = [];

    switch (slug) {
      case 'student':
        divisionSpecificItems = [
          { id: 'courses', label: 'Student Courses', icon: BookOpen },
          { id: 'affiliate', label: 'Affiliate Program', icon: Share2 },
          { id: 'directory', label: 'Student Directory', icon: Users },
          { id: 'opportunities', label: 'Internships & Roles', icon: Briefcase },
          { id: 'events', label: 'Hackathons & Summits', icon: Calendar },
        ];
        break;
      case 'career':
        divisionSpecificItems = [
          { id: 'directory', label: 'Executive Directory', icon: Users },
          { id: 'opportunities', label: 'Job Referrals & Roles', icon: Briefcase },
          { id: 'events', label: 'Masterclasses & Summits', icon: Calendar },
        ];
        break;
      case 'freelancer':
        divisionSpecificItems = [
          { id: 'directory', label: 'Talent & Squads', icon: Users },
          { id: 'opportunities', label: 'Client Gigs & Contracts', icon: Briefcase },
          { id: 'events', label: 'Freelancer Meetups', icon: Calendar },
        ];
        break;
      case 'entrepreneur':
        divisionSpecificItems = [
          { id: 'directory', label: 'Founders & Mentors', icon: Users },
          { id: 'opportunities', label: 'Co-Founders & Pitch Room', icon: Briefcase },
          { id: 'events', label: 'Demo Days & Summits', icon: Calendar },
        ];
        break;
      case 'business':
        divisionSpecificItems = [
          { id: 'directory', label: 'Buyers & Suppliers', icon: Users },
          { id: 'opportunities', label: 'B2B Tenders & Contracts', icon: Briefcase },
          { id: 'events', label: 'Trade Delegations & Expos', icon: Calendar },
        ];
        break;
      case 'influencer':
        divisionSpecificItems = [
          { id: 'directory', label: 'Creator Directory', icon: Users },
          { id: 'opportunities', label: 'Brand Campaigns & Deals', icon: Briefcase },
          { id: 'events', label: 'Creator Meetups & Summits', icon: Calendar },
        ];
        break;
      case 'investor':
        divisionSpecificItems = [
          { id: 'directory', label: 'Investor Directory', icon: Users },
          { id: 'opportunities', label: 'Startup Deal Flow', icon: Briefcase },
          { id: 'events', label: 'Private Roundtables', icon: Calendar },
        ];
        break;
      default:
        divisionSpecificItems = [
          { id: 'directory', label: 'Member Directory', icon: Users },
          { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
          { id: 'events', label: 'Events & Summits', icon: Calendar },
        ];
    }

    const universalBottomItems = [
      { id: 'my-tickets' as ViewState, label: 'My Tickets & QR', icon: Ticket },
      { id: 'memberships' as ViewState, label: 'Membership Plans', icon: CreditCard },
    ];

    return [...baseItems, ...divisionSpecificItems, ...universalBottomItems];
  };

  // When exploring, show ALL FEATURES instead of internal member data screens!
  const getNavItems = () => {
    if (isExploring) {
      return [
        { id: 'division-hub' as ViewState, label: 'All Features & Overview', icon: Layers, tab: 'overview' as FeatureTab },
        { id: 'division-hub' as ViewState, label: 'Workspaces & Toolkits', icon: Compass, tab: 'toolkits' as FeatureTab },
        { id: 'division-hub' as ViewState, label: 'Opportunities & Roles', icon: Briefcase, tab: 'opportunities' as FeatureTab },
        { id: 'division-hub' as ViewState, label: 'Verified Community', icon: Users, tab: 'community' as FeatureTab },
        { id: 'division-hub' as ViewState, label: 'Summits & Roundtables', icon: Calendar, tab: 'summits' as FeatureTab },
        { id: 'memberships' as ViewState, label: 'Plans & Pricing', icon: CreditCard, tab: 'pricing' as FeatureTab },
      ];
    }

    return getNavItemsForDivision(currentDivision);
  };

  const navItems = getNavItems();

  const adminNavItems = [
    { id: 'admin' as ViewState, label: 'Admin Dashboard', icon: Shield },
    { id: 'scanner' as ViewState, label: 'Event QR Scanner', icon: QrCode },
  ];

  const handleNavClick = (view: ViewState, tab?: FeatureTab) => {
    if (tab) {
      setActiveFeatureTab(tab);
    }
    onNavigate(view);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-40 h-screen apple-glass border-r border-black/[0.06] flex flex-col justify-between transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-20' : 'w-72',
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Top Header & Brand (Overflow visible to prevent flyout clipping) */}
        <div className="relative z-30 flex-shrink-0">
          {/* Logo Bar */}
          <div className="p-5 flex items-center justify-between border-b border-black/[0.06]">
            <div
              onClick={() => handleNavClick('landing')}
              className="flex items-center gap-3 cursor-pointer group apple-press"
            >
              {isCollapsed ? (
                <div className="w-10 h-10 flex items-center justify-center p-1 transition-transform group-hover:scale-105">
                  <img src="/appicon.png" alt="eongrow" className="w-8 h-8 object-contain" />
                </div>
              ) : (
                <div className="flex items-center">
                  <img
                    src="/applogo.png"
                    alt="eongrow"
                    className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
                  />
                </div>
              )}
            </div>

            {/* Collapse button (Desktop only) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-full text-[#818A84] hover:text-[#171C19] hover:bg-black/[0.04] apple-press cursor-pointer"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Network Switcher Dropdown */}
          <div className="p-3 border-b border-black/[0.06] relative">
            <div
              onClick={() => setShowNetworkMenu(!showNetworkMenu)}
              className={cn(
                'flex items-center justify-between p-2.5 rounded-2xl border border-black/[0.06] bg-black/[0.03] hover:bg-black/[0.06] transition-all cursor-pointer group apple-press',
                isCollapsed && 'justify-center p-2'
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-xs"
                  style={{ backgroundColor: divisionMeta.colorHex }}
                >
                  <DivisionIconRenderer slug={currentDivision} className="w-4 h-4" />
                </div>
                {!isCollapsed && (
                  <div className="text-left truncate">
                    <p className="text-xs font-semibold text-[#171C19] truncate">{divisionMeta.name}</p>
                    <p className="text-[10px] text-black font-semibold flex items-center gap-1">
                      {isJoined(currentDivision) ? 'Active Member' : 'Exploring'}
                    </p>
                  </div>
                )}
              </div>
              {!isCollapsed && <ChevronDown className={cn("w-4 h-4 text-[#818A84] group-hover:text-[#171C19] transition-transform duration-200", showNetworkMenu && "rotate-180 text-black")} />}
            </div>

            {/* Backdrop click-away listener for switch division menu */}
            {showNetworkMenu && (
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setShowNetworkMenu(false)}
              />
            )}

            {/* Network Dropdown Menu - Panel grows outside sidebar to avoid text wrapping */}
            {showNetworkMenu && (
              <div
                className={cn(
                  'z-50 apple-card border border-black/[0.08] p-2 space-y-2.5 animate-in fade-in zoom-in-95 shadow-[0_20px_50px_rgba(0,0,0,0.22)] bg-white/95 backdrop-blur-2xl max-h-[85vh] overflow-y-auto',
                  isCollapsed
                    ? 'absolute left-full top-1 ml-3 w-88 sm:w-96'
                    : 'absolute left-2 top-16 w-88 sm:w-96'
                )}
              >
                {/* 1. Registered Networks Section */}
                <div>
                  <div className="px-2.5 py-1 mb-1 flex items-center justify-between border-b border-black/[0.04]">
                    <span className="text-[11px] font-bold text-[#171C19] uppercase tracking-wider">
                      Your Registered Networks ({registeredDivisions.length})
                    </span>
                    <span className="text-[10px] text-black font-semibold">Active</span>
                  </div>
                  <div className="space-y-1">
                    {registeredDivisions.length === 0 ? (
                      <div className="px-2.5 py-2 text-xs text-[#818A84] italic">
                        No registered networks yet
                      </div>
                    ) : (
                      registeredDivisions.map((div) => {
                        const isCurrent = div.slug === currentDivision;
                        return (
                          <button
                            key={div.slug}
                            onClick={() => {
                              setDivision(div.slug);
                              setShowNetworkMenu(false);
                            }}
                            className={cn(
                              'w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer apple-press',
                              isCurrent
                                ? 'bg-black/[0.08] text-black font-bold shadow-xs'
                                : 'hover:bg-black/[0.04] text-[#171C19]'
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className="w-6 h-6 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-xs"
                                style={{ backgroundColor: div.colorHex }}
                              >
                                <DivisionIconRenderer slug={div.slug} className="w-3.5 h-3.5" />
                              </div>
                              <span className="truncate whitespace-nowrap font-medium">{div.name}</span>
                            </div>
                            <span
                              className={cn(
                                'text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 ml-2',
                                isCurrent ? 'bg-black text-white' : 'bg-black/[0.06] text-black'
                              )}
                            >
                              {isCurrent ? 'Current' : 'Switch'}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 2. Explore Other Networks Section */}
                {unregisteredDivisions.length > 0 && (
                  <div className="pt-1.5 border-t border-black/[0.06]">
                    <div className="px-2.5 py-1 mb-1 flex items-center justify-between border-b border-black/[0.04]">
                      <span className="text-[11px] font-bold text-[#818A84] uppercase tracking-wider">
                        Explore Other Networks
                      </span>
                      <span className="text-[10px] text-[#818A84] font-medium">Preview Mode</span>
                    </div>
                    <div className="space-y-1">
                      {unregisteredDivisions.map((div) => {
                        const isCurrent = div.slug === currentDivision;
                        return (
                          <button
                            key={div.slug}
                            onClick={() => {
                              setDivision(div.slug);
                              setActiveFeatureTab('overview');
                              onNavigate('division-hub');
                              setShowNetworkMenu(false);
                            }}
                            className={cn(
                              'w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer apple-press',
                              isCurrent
                                ? 'bg-amber-500/10 text-amber-950 font-bold border border-amber-500/20'
                                : 'hover:bg-black/[0.03] text-[#525854]'
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className="w-6 h-6 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-xs opacity-80"
                                style={{ backgroundColor: div.colorHex }}
                              >
                                <DivisionIconRenderer slug={div.slug} className="w-3.5 h-3.5" />
                              </div>
                              <span className="truncate whitespace-nowrap font-medium">{div.name}</span>
                            </div>
                            <span className="text-[10px] text-[#818A84] flex items-center gap-1 flex-shrink-0 ml-2 whitespace-nowrap">
                              {div.slug === 'student' ? 'Free Access' : 'Explore →'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Exploration Mode Notice Card */}
          {isExploring && !isCollapsed && (
            <div className="mx-3 mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
              <div className="flex items-center gap-1.5 text-amber-900 font-semibold mb-1">
                <Compass className="w-3.5 h-3.5 text-amber-700" />
                <span>Exploring {divisionMeta.name.split(' ')[0]}</span>
              </div>
              <p className="text-[11px] text-amber-950/70 mb-2.5 leading-tight">
                Previewing features of this network. No live data access until enrolled.
              </p>
              <div className="space-y-1.5">
                <button
                  onClick={() => handleNavClick('memberships', 'pricing')}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-[#171C19] text-white font-semibold text-[11px] hover:bg-black transition-colors cursor-pointer shadow-xs text-center block"
                >
                  Join {divisionMeta.name.split(' ')[0]} {currentDivision === 'student' ? '(Free)' : ''}
                </button>
                {registeredDivisions.length > 0 && (
                  <button
                    onClick={() => {
                      setDivision(registeredDivisions[0].slug);
                      onNavigate('dashboard');
                    }}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-white/80 border border-amber-500/30 text-amber-950 font-semibold text-[11px] hover:bg-white transition-colors cursor-pointer text-center block"
                  >
                    ← Return to {registeredDivisions[0].name.split(' ')[0]}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-xs text-[#818A84] uppercase tracking-wider font-semibold">
              {!isCollapsed && (isExploring ? 'Ecosystem Features' : 'Platform')}
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const itemTab = (item as any).tab;
              const isActive = isExploring
                ? (item.id === 'division-hub'
                    ? currentView === 'division-hub' && activeFeatureTab === itemTab
                    : currentView === item.id)
                : currentView === item.id;

              return (
                <button
                  key={`${item.id}-${itemTab || item.label}`}
                  onClick={() => handleNavClick(item.id, itemTab)}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs md:text-sm font-medium transition-all duration-150 cursor-pointer apple-press',
                    isActive
                      ? 'bg-black text-white font-semibold shadow-xs'
                      : 'text-[#171C19] hover:bg-black/[0.04] hover:text-black'
                  )}
                >
                  <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-white' : 'text-[#818A84]')} />
                  {!isCollapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
                </button>
              );
            })}

            {/* Admin & Scanner Management Section */}
            {(isAdmin || profile?.roles?.includes('event_organiser')) && (
              <>
                <div className="pt-4 pb-1 px-3 text-xs text-[#818A84]">
                  {!isCollapsed && 'Operations'}
                </div>
                {adminNavItems
                  .filter((item) => isAdmin || item.id === 'scanner')
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        title={isCollapsed ? item.label : undefined}
                        className={cn(
                          'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs md:text-sm font-medium transition-all duration-150 cursor-pointer apple-press',
                          isActive
                            ? 'bg-black text-white font-semibold shadow-xs'
                            : 'text-[#171C19] hover:bg-black/[0.03]'
                        )}
                      >
                        <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-white' : 'text-[#818A84]')} />
                        {!isCollapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
                      </button>
                    );
                  })}
              </>
            )}
          </nav>
        </div>

        {/* Bottom Profile & Role Bar */}
        <div className="p-3 border-t border-black/[0.06] bg-black/[0.02] relative z-30">
          {/* Quick Demo Role Switcher (Apple Style Persona Selector) */}
          {!isCollapsed && (
            <div className="mb-2.5 p-2 bg-white rounded-2xl border border-black/[0.06] shadow-xs space-y-1.5 relative">
              <div className="flex items-center justify-between text-xs text-[#818A84] px-1">
                <span>Assume Persona</span>
                <span className="text-[10px] text-black font-semibold">7 Roles + Admin</span>
              </div>
              <AppleSelect
                direction="up"
                options={[
                  { value: 'student', label: 'Aarav Sharma', description: 'Student & Hackathon Lead' },
                  { value: 'founder', label: 'Ananya Rao', description: 'Startup Founder & CEO' },
                  { value: 'freelancer', label: 'Devansh Kapur', description: 'Full-Stack Freelancer' },
                  { value: 'business', label: 'Meera Deshmukh', description: 'MSME Business Director' },
                  { value: 'influencer', label: 'Priya Nair', description: 'Tech Creator & Keynote' },
                  { value: 'investor', label: 'Karan Singhania', description: 'Venture Capital Partner' },
                  { value: 'admin', label: 'Vikramaditya Verma', description: 'Network Super Admin' },
                ]}
                value={
                  profile?.id === 'd0000000-0000-0000-0000-000000000001'
                    ? 'admin'
                    : profile?.id === 'd0000000-0000-0000-0000-000000000002'
                    ? 'founder'
                    : profile?.id === 'd0000000-0000-0000-0000-000000000003'
                    ? 'student'
                    : profile?.id === 'd0000000-0000-0000-0000-000000000004'
                    ? 'freelancer'
                    : profile?.id === 'd0000000-0000-0000-0000-000000000005'
                    ? 'business'
                    : profile?.id === 'd0000000-0000-0000-0000-000000000006'
                    ? 'influencer'
                    : profile?.id === 'd0000000-0000-0000-0000-000000000007'
                    ? 'investor'
                    : 'student'
                }
                onChange={(val) => setDemoRole(val as any)}
                className="w-full"
                menuClassName="w-full left-0 right-0 max-w-none shadow-[0_-16px_40px_-8px_rgba(0,0,0,0.2)] border border-black/10"
                buttonClassName="py-1.5 px-2.5 rounded-xl bg-black/[0.03] border-black/[0.06]"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div
              onClick={() => handleNavClick('settings')}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
            >
              <Avatar
                src={profile?.avatarUrl}
                name={profile?.fullName}
                size="sm"
                isVerified={profile?.verificationLevel !== 'unverified'}
              />
              {!isCollapsed && (
                <div className="truncate">
                  <p className="text-xs font-bold text-[#171C19] group-hover:text-black truncate">
                    {profile?.fullName || 'Guest Member'}
                  </p>
                  <p className="text-[11px] text-[#818A84] truncate capitalize">
                    {profile?.roles?.[0]?.replace('_', ' ') || profile?.role?.replace('_', ' ') || 'Member'}
                  </p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={() => signOut()}
                title="Log out"
                className="p-1.5 rounded-lg text-[#818A84] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
