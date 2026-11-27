import React, { useState, useEffect } from 'react';
import {
  Search,
  Users,
  MessageSquare,
  SlidersHorizontal,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Sparkles,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useDivision } from '../../context/useDivision';
import { DIVISIONS_CATALOG } from '../../lib/divisions';
import { ABSTRACT_IMAGES } from '../../lib/abstractImages';
import { DataService, type MemberItem } from '../../services/dataService';
import type { DivisionSlug } from '../../types/app.types';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { AppleSelect } from '../ui/AppleSelect';
import { Pagination } from '../common/Pagination';
import { ExpandedProfileViewer } from './ExpandedProfileViewer';
import { ConnectionManager } from '../networking/ConnectionManager';

export const MemberDirectory: React.FC = () => {
  const { profile } = useAuth();
  const { currentDivision, divisionMeta, isJoined, isExploring } = useDivision();

  // Top View Mode: Directory Browsing vs Connection Hub
  const [viewMode, setViewMode] = useState<'directory' | 'connections'>('directory');

  const [members, setMembers] = useState<MemberItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>(currentDivision);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedVerification, setSelectedVerification] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'trust_tier' | 'newest' | 'alpha'>('recommended');
  const [selectedMember, setSelectedMember] = useState<MemberItem | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Synchronize with active or explored division
  useEffect(() => {
    setSelectedDivision(currentDivision);
  }, [currentDivision]);

  // Reset to first page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDivision, selectedCity, selectedVerification, sortBy]);

  // Modals
  const [connectModalMember, setConnectModalMember] = useState<MemberItem | null>(null);
  const [introModalMember, setIntroModalMember] = useState<MemberItem | null>(null);
  const [introPurpose, setIntroPurpose] = useState('Business Partnership / Vendor Enquiry');
  const [connectMessage, setConnectMessage] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadMembers() {
      const data = await DataService.getMembers();
      setMembers(data);
    }
    loadMembers();
  }, []);

  const verificationWeight = (tier: string) => {
    switch (tier) {
      case 'special_credentials': return 5;
      case 'business_verified': return 4;
      case 'professionally_verified': return 3;
      case 'identity_verified': return 2;
      case 'contact_verified': return 1;
      default: return 0;
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      searchQuery === '' ||
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDivision =
      selectedDivision === 'all' || m.divisions.includes(selectedDivision as DivisionSlug);

    const matchesCity = selectedCity === 'all' || m.city.toLowerCase() === selectedCity.toLowerCase();

    const matchesVerification =
      selectedVerification === 'all' || m.verificationLevel === selectedVerification;

    return matchesSearch && matchesDivision && matchesCity && matchesVerification;
  });

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (sortBy === 'trust_tier') {
      return verificationWeight(b.verificationLevel) - verificationWeight(a.verificationLevel);
    }
    if (sortBy === 'newest') {
      return b.id.localeCompare(a.id);
    }
    if (sortBy === 'alpha') {
      return a.fullName.localeCompare(b.fullName);
    }
    return 0; // recommended order
  });

  const paginatedMembers = sortedMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSendConnection = async () => {
    if (!connectModalMember) return;
    setActionSuccess(`Connection request sent to ${connectModalMember.fullName}!`);
    await DataService.sendConnectionRequest(
      profile?.id || 'd0000000-0000-0000-0000-000000000003',
      connectModalMember.id,
      connectMessage
    );
    setTimeout(() => {
      setConnectModalMember(null);
      setConnectMessage('');
      setActionSuccess(null);
    }, 1200);
  };

  const handleSendIntro = async () => {
    if (!introModalMember) return;
    setActionSuccess(`Introduction request forwarded for ${introModalMember.fullName}!`);
    await DataService.sendIntroductionRequest(
      profile?.id || 'd0000000-0000-0000-0000-000000000003',
      introModalMember.id,
      'Cross-Division Collaboration',
      'Requesting warm introduction via eongrow.'
    );
    setTimeout(() => {
      setIntroModalMember(null);
      setActionSuccess(null);
    }, 1200);
  };

  const cities = ['all', 'Bangalore', 'Hyderabad', 'Mumbai', 'Delhi-NCR', 'Chennai', 'Pune'];

  // If a member is selected, render the full Expanded Profile Viewer
  if (selectedMember) {
    return (
      <ExpandedProfileViewer
        member={selectedMember}
        onBack={() => setSelectedMember(null)}
        onConnect={(m) => {
          setSelectedMember(null);
          setConnectModalMember(m);
        }}
        onRequestIntro={(m) => {
          setSelectedMember(null);
          setIntroModalMember(m);
        }}
        onDirectMessage={() => {
          setSelectedMember(null);
          setViewMode('connections');
        }}
      />
    );
  }

  // If in Connections Mode, render the Connection & Direct Messaging Hub
  if (viewMode === 'connections') {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
          <div className="flex items-center gap-2 p-1 bg-black/[0.04] rounded-full">
            <button
              type="button"
              onClick={() => setViewMode('directory')}
              className="py-1.5 px-4 rounded-full text-xs font-medium text-[#818A84] hover:text-black cursor-pointer transition-colors"
            >
              Member Directory
            </button>
            <button
              type="button"
              onClick={() => setViewMode('connections')}
              className="py-1.5 px-4 rounded-full text-xs font-bold bg-white text-black shadow-xs cursor-pointer"
            >
              My Connections & Chats
            </button>
          </div>
        </div>

        <ConnectionManager
          onViewProfile={(memberId) => {
            const found = members.find((m) => m.id === memberId);
            if (found) setSelectedMember(found);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Toggle Bar: Directory vs Connections */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-1.5 p-1 bg-black/[0.04] rounded-full">
          <button
            type="button"
            onClick={() => setViewMode('directory')}
            className="py-1.5 px-4 rounded-full text-xs font-bold bg-white text-black shadow-xs cursor-pointer"
          >
            Member Directory
          </button>
          <button
            type="button"
            onClick={() => setViewMode('connections')}
            className="py-1.5 px-4 rounded-full text-xs font-medium text-[#818A84] hover:text-black cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <span>My Connections & Chats</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </button>
        </div>
      </div>

      {/* Directory Header with Pure Abstract Geometry Artwork (Zero Green Overlay) */}
      <div className="relative overflow-hidden rounded-[26px] bg-[#121413] p-6 sm:p-7 text-white shadow-sm border border-white/10 card-lift">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-35">
          <img
            src={ABSTRACT_IMAGES.directory}
            alt="Directory Abstract Architecture"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#121413]/90 via-[#121413]/70 to-[#121413]/90" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extralight tracking-tight text-white">
              eongrow Verified Member Directory
            </h2>
            <p className="text-xs sm:text-sm text-white/75 leading-relaxed max-w-2xl">
              Discover and connect with verified peers, founders, creators, and business leaders across 7 networks. Click any profile for expanded portfolio and markdown view.
            </p>
          </div>
          <span className="text-xs font-mono text-white/80 self-start md:self-center">
            {filteredMembers.length} Verified Members
          </span>
        </div>
      </div>

      {/* Exploration Banner */}
      {isExploring && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-amber-800 font-bold text-base">🔭</span>
            <span className="text-amber-950 font-medium">
              You are exploring the <strong>{divisionMeta.name}</strong> member directory. Join this network to unlock direct intro requests and peer messaging.
            </span>
          </div>
          <span className="text-[11px] text-amber-900 bg-amber-500/20 px-2.5 py-1 rounded-full font-semibold flex-shrink-0">
            Preview Mode
          </span>
        </div>
      )}

      {/* Advanced Filter & Sort Bar - Apple Flex Controls */}
      <div className="apple-card p-4 sm:p-5 border border-black/[0.06] shadow-2xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full">
          {/* Search Input - Expands to fill available space */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-[#818A84] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, role, company, or skills (e.g. AI, React, MSME)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-black/[0.03] border border-transparent rounded-full text-xs md:text-sm text-[#171C19] placeholder:text-[#818A84] focus:bg-white focus:border-black/20 focus:ring-2 focus:ring-black/10 focus:outline-none transition-all"
            />
          </div>

          {/* Filter Dropdowns - Flexed Row */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Division Filter */}
            <div className="flex-1 sm:flex-initial min-w-[135px]">
              <AppleSelect
                options={[
                  { value: 'all', label: 'All Ecosystems' },
                  ...Object.values(DIVISIONS_CATALOG).map((d) => ({
                    value: d.slug,
                    label: d.name.split(' ')[0],
                  })),
                ]}
                value={selectedDivision}
                onChange={setSelectedDivision}
                className="w-full"
                buttonClassName="py-2.5 px-3 rounded-full bg-black/[0.03] border-transparent hover:border-black/10 text-xs"
              />
            </div>

            {/* Verification Tier Filter */}
            <div className="flex-1 sm:flex-initial min-w-[130px]">
              <AppleSelect
                options={[
                  { value: 'all', label: 'All Tiers' },
                  { value: 'special_credentials', label: 'Special Credentials' },
                  { value: 'business_verified', label: 'Business' },
                  { value: 'professionally_verified', label: 'Professional' },
                  { value: 'identity_verified', label: 'Identity' },
                  { value: 'contact_verified', label: 'Contact' },
                ]}
                value={selectedVerification}
                onChange={setSelectedVerification}
                className="w-full"
                buttonClassName="py-2.5 px-3 rounded-full bg-black/[0.03] border-transparent hover:border-black/10 text-xs"
              />
            </div>

            {/* City Filter */}
            <div className="flex-1 sm:flex-initial min-w-[115px]">
              <AppleSelect
                options={cities.map((c) => ({
                  value: c,
                  label: c === 'all' ? 'All Cities' : c,
                }))}
                value={selectedCity}
                onChange={setSelectedCity}
                className="w-full"
                buttonClassName="py-2.5 px-3 rounded-full bg-black/[0.03] border-transparent hover:border-black/10 text-xs capitalize"
              />
            </div>

            {/* Sort By Filter */}
            <div className="flex-1 sm:flex-initial min-w-[130px]">
              <AppleSelect
                options={[
                  { value: 'recommended', label: 'Recommended' },
                  { value: 'trust_tier', label: 'Highest Trust' },
                  { value: 'newest', label: 'Recently Joined' },
                  { value: 'alpha', label: 'Alphabetical' },
                ]}
                value={sortBy}
                onChange={(val) => setSortBy(val as any)}
                className="w-full"
                buttonClassName="py-2.5 px-3 rounded-full bg-black/[0.03] border-transparent hover:border-black/10 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Members Grid - Apple Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {paginatedMembers.map((member) => (
          <div
            key={member.id}
            className="apple-card flex flex-col justify-between p-6 space-y-4 border border-black/[0.06] hover:border-black/20 hover:shadow-md transition-all group"
          >
            <div>
              {/* Header: Avatar, Name & Trust Tier */}
              <div
                onClick={() => setSelectedMember(member)}
                className="flex items-start gap-3 cursor-pointer flex-1 min-w-0"
              >
                <Avatar
                  src={member.avatarUrl}
                  name={member.fullName}
                  size="lg"
                  isVerified={member.verificationLevel !== 'unverified'}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-semibold text-sm text-[#171C19] group-hover:text-black transition-colors truncate tracking-tight">
                      {member.fullName}
                    </h4>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                      {member.verificationLevel.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-[#818A84] truncate mt-0.5">{member.headline}</p>
                  <p className="text-[11px] text-neutral-600 mt-1">
                    {member.city}
                  </p>
                </div>
              </div>

              {/* Bio snippet */}
              <p className="text-xs text-[#818A84] mt-3 line-clamp-2 leading-relaxed">
                {member.bio}
              </p>

              {/* Division Badges */}
              <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                {member.divisions.map((dSlug) => {
                  const div = DIVISIONS_CATALOG[dSlug];
                  return (
                    <span
                      key={dSlug}
                      className="text-[11px] text-[#525854] bg-black/[0.03] px-2.5 py-0.5 rounded-full font-medium"
                    >
                      {div?.name.split(' ')[0] || dSlug}
                    </span>
                  );
                })}
              </div>

              {/* Skills Tags */}
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-black/[0.04] flex-wrap">
                {member.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="text-[10px] font-medium text-[#171C19] bg-black/[0.03] px-2 py-0.5 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {member.skills.length > 3 && (
                  <span className="text-[10px] text-[#818A84]">+{member.skills.length - 3}</span>
                )}
              </div>
            </div>

            {/* Actions: View Profile, Request Intro, Connect */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-black/[0.06]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMember(member)}
                className="text-xs py-1.5 col-span-1"
              >
                Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIntroModalMember(member)}
                className="text-xs py-1.5 col-span-1"
              >
                Intro
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setConnectModalMember(member)}
                className="text-xs py-1.5 col-span-1"
              >
                Connect
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card className="text-center py-12 space-y-3">
          <h4 className="font-light text-base text-[#171C19]">No members found matching your search</h4>
          <p className="text-xs text-[#818A84] max-w-sm mx-auto">
            Try adjusting your search query, division filter, verification tier, or city selection.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedDivision('all');
              setSelectedCity('all');
              setSelectedVerification('all');
              setSortBy('recommended');
            }}
          >
            Clear Filters
          </Button>
        </Card>
      )}

      {/* Pagination Controls */}
      <div className="pt-6 border-t border-black/[0.06]">
        <Pagination
          currentPage={currentPage}
          totalItems={sortedMembers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Connect Modal */}
      {connectModalMember && (
        <Modal
          isOpen={Boolean(connectModalMember)}
          onClose={() => setConnectModalMember(null)}
          title={`Connect with ${connectModalMember.fullName}`}
          description={`Expand your professional circle in the ${DIVISIONS_CATALOG[currentDivision].name}.`}
        >
          <div className="space-y-4">
            {actionSuccess ? (
              <div className="p-4 bg-black/[0.04] text-[#171C19] border border-black/[0.08] rounded-xl text-center font-semibold text-sm">
                ✓ {actionSuccess}
              </div>
            ) : (
              <>
                {!isJoined(currentDivision) && (
                  <p className="text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    <strong>Note:</strong> You are connecting from exploration mode. Your request will include a preview introduction note.
                  </p>
                )}
                <textarea
                  rows={3}
                  placeholder={`Hi ${connectModalMember.displayName}, I would love to connect with you regarding...`}
                  value={connectMessage}
                  onChange={(e) => setConnectMessage(e.target.value)}
                  className="w-full p-3 bg-black/[0.03] border border-black/[0.08] rounded-xl text-xs md:text-sm text-[#171C19] focus:bg-white focus:border-black/30 focus:outline-none"
                />
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setConnectModalMember(null)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleSendConnection}>
                    Send Request
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* Introduction Request Modal */}
      {introModalMember && (
        <Modal
          isOpen={Boolean(introModalMember)}
          onClose={() => setIntroModalMember(null)}
          title={`Request Introduction to ${introModalMember.fullName}`}
          description="eongrow Chapter Managers and mutual connections facilitate trusted warm introductions."
        >
          <div className="space-y-4">
            {actionSuccess ? (
              <div className="p-4 bg-black/[0.05] text-[#171C19] border border-black/10 rounded-2xl text-center font-bold text-sm">
                ✓ {actionSuccess}
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs font-semibold text-[#171C19] block mb-1.5">Introduction Purpose</label>
                  <AppleSelect
                    options={[
                      { value: 'Business Partnership / Vendor Enquiry', label: 'Business Partnership / Vendor Enquiry' },
                      { value: 'Co-Founder / Early Team Discussion', label: 'Co-Founder / Early Team Discussion' },
                      { value: 'Career Mentorship & Guidance', label: 'Career Mentorship & Guidance' },
                      { value: 'Startup Investment & Pitch', label: 'Startup Investment & Pitch' },
                    ]}
                    value={introPurpose}
                    onChange={setIntroPurpose}
                    className="w-full"
                    buttonClassName="p-2.5 bg-[#F4F6F4] border-black/10 rounded-xl"
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="Explain why an introduction would be valuable for both parties..."
                  className="w-full p-3 bg-[#F4F6F4] border border-[#E8ECE9] rounded-xl text-xs text-[#171C19] focus:bg-white focus:border-black/30 focus:outline-none"
                />
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIntroModalMember(null)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleSendIntro}>
                    Submit Intro Request
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
