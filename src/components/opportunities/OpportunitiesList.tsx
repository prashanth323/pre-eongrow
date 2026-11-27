import React, { useState, useEffect } from 'react';
import {
  Search,
  Briefcase,
  CheckCircle2,
  Building2,
  MapPin,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useDivision } from '../../context/useDivision';
import { DIVISIONS_CATALOG } from '../../lib/divisions';
import { formatDate, formatCompensation } from '../../lib/utils';
import { ABSTRACT_IMAGES } from '../../lib/abstractImages';
import { DataService, type OpportunityItem } from '../../services/dataService';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { AppleSelect } from '../ui/AppleSelect';
import { ImageUpload } from '../ui/ImageUpload';
import { Pagination } from '../common/Pagination';

export const OpportunitiesList: React.FC = () => {
  const { profile } = useAuth();
  const { currentDivision, divisionMeta, isJoined, isExploring } = useDivision();

  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDivision, setSelectedDivision] = useState<string>(currentDivision);
  const [selectedOpp, setSelectedOpp] = useState<OpportunityItem | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Synchronize division filter with active/explored division
  useEffect(() => {
    setSelectedDivision(currentDivision);
  }, [currentDivision]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType, selectedDivision]);

  // Apply Modal state
  const [applyOpp, setApplyOpp] = useState<OpportunityItem | null>(null);
  const [coverNote, setCoverNote] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Create Opportunity Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createBlockedNotice, setCreateBlockedNotice] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('job');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyLogo, setNewCompanyLogo] = useState('');
  const [newBannerUrl, setNewBannerUrl] = useState('');
  const [newAboutCompany, setNewAboutCompany] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newResponsibilities, setNewResponsibilities] = useState('');
  const [newRequirements, setNewRequirements] = useState('');
  const [newPerks, setNewPerks] = useState('');
  const [newRounds, setNewRounds] = useState('');
  const [newBatchEligibility, setNewBatchEligibility] = useState('');
  const [newSkills, setNewSkills] = useState('');
  const [newBudget, setNewBudget] = useState('');

  useEffect(() => {
    async function loadOpps() {
      const data = await DataService.getOpportunities();
      setOpportunities(data);
    }
    loadOpps();
  }, []);

  const filteredOpps = opportunities.filter((o) => {
    const matchesSearch =
      searchQuery === '' ||
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'all' || o.opportunityType === selectedType;
    const matchesDiv = selectedDivision === 'all' || o.divisionSlug === selectedDivision;

    return matchesSearch && matchesType && matchesDiv;
  });

  const sortedOpps = filteredOpps;
  const paginatedOpps = sortedOpps.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleApply = async () => {
    if (!selectedOpp && !applyOpp) return;
    const targetOpp = applyOpp || selectedOpp;
    if (!targetOpp) return;

    setIsSubmitted(true);
    await DataService.applyForOpportunity({
      opportunityId: targetOpp.id,
      applicantId: profile?.id || 'd0000000-0000-0000-0000-000000000003',
      coverLetter: coverNote,
      resumeUrl: resumeUrl,
    });

    setTimeout(() => {
      setApplyOpp(null);
      setIsSubmitted(false);
      setCoverNote('');
      setResumeUrl('');
    }, 1200);
  };

  const handleCreateOpp = async () => {
    const parseList = (text: string) =>
      text
        .split('\n')
        .map((s) => s.trim().replace(/^[-*•]\s*/, ''))
        .filter(Boolean);

    const res = await DataService.createOpportunity({
      title: newTitle || 'Full-Stack Software Engineer',
      opportunityType: (newType === 'all' ? 'job' : newType) as any,
      description: newDesc || 'High impact opportunity posted via eongrow.',
      city: profile?.city || 'Bangalore',
      isRemote: true,
      compensationType: 'paid',
      budgetMin: Number(newBudget) || 30000,
      currency: 'INR',
      requiredSkills: newSkills ? newSkills.split(',').map((s) => s.trim()) : ['React', 'TypeScript'],
      divisionSlug: currentDivision,
      companyName: newCompanyName || (profile?.fullName ? `${profile.fullName}'s Venture` : 'eongrow Partner'),
      companyLogo: newCompanyLogo || undefined,
      bannerUrl: newBannerUrl || undefined,
      aboutCompany: newAboutCompany || undefined,
      responsibilities: newResponsibilities ? parseList(newResponsibilities) : undefined,
      requirements: newRequirements ? parseList(newRequirements) : undefined,
      perks: newPerks ? parseList(newPerks) : undefined,
      rounds: newRounds ? parseList(newRounds) : undefined,
      batchEligibility: newBatchEligibility || undefined,
      postedByName: profile?.fullName || 'Member',
      postedById: profile?.id,
    });

    if (res.data) {
      setOpportunities([res.data, ...opportunities]);
    }
    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
    setNewCompanyName('');
    setNewCompanyLogo('');
    setNewBannerUrl('');
    setNewAboutCompany('');
    setNewResponsibilities('');
    setNewRequirements('');
    setNewPerks('');
    setNewRounds('');
    setNewBatchEligibility('');
    setNewSkills('');
    setNewBudget('');
  };

  const oppTypes = [
    { id: 'all', label: 'All Opportunities' },
    { id: 'internship', label: 'Internships' },
    { id: 'job', label: 'Full-Time Jobs' },
    { id: 'freelance_project', label: 'Freelance & Gigs' },
    { id: 'cofounder_search', label: 'Co-Founders' },
    { id: 'business_requirement', label: 'B2B Requirements' },
    { id: 'creator_campaign', label: 'Brand Campaigns' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Opportunities Header with Pure Abstract Geometry Texture */}
      <div className="relative overflow-hidden rounded-[26px] bg-[#121413] p-6 sm:p-7 text-white shadow-sm border border-white/10 card-lift">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-35">
          <img
            src={ABSTRACT_IMAGES.opportunities}
            alt="Opportunities Abstract Texture"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#121413]/90 via-[#121413]/70 to-[#121413]/90" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extralight tracking-tight text-white">
              eongrow Opportunities & Collaborations
            </h2>
            <p className="text-xs sm:text-sm text-white/75 leading-relaxed max-w-2xl">
              Discover verified jobs, internships with fair stipends, freelance gigs, co-founders, and commercial enterprise tenders.
            </p>
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              if (!isJoined(currentDivision)) {
                setCreateBlockedNotice(true);
              } else {
                setShowCreateModal(true);
              }
            }}
            className="bg-white text-black hover:bg-neutral-100 border-0 font-bold text-xs apple-press shadow-xs flex-shrink-0"
          >
            Post Opportunity →
          </Button>
        </div>
      </div>

      {/* Exploration Banner */}
      {isExploring && (
        <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.06] flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-[#818A84] font-bold text-base">🔭</span>
            <span className="text-[#171C19] font-medium">
              You are exploring opportunities in the <strong>{divisionMeta.name}</strong> network. Join this division to submit verified applications and post new listings.
            </span>
          </div>
          <span className="text-[11px] text-[#171C19] bg-black/[0.04] border border-black/[0.06] px-2.5 py-1 rounded-full font-medium flex-shrink-0">
            Preview Mode
          </span>
        </div>
      )}

      {/* Filter and Search Bar - Apple Bento Pill Controls */}
      <div className="apple-card p-4 sm:p-5 border border-black/[0.06] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-[#818A84] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by role, company, or skills (e.g. React, B2B, AI)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-black/[0.03] border border-transparent rounded-full text-xs md:text-sm text-[#171C19] placeholder:text-[#818A84] focus:bg-white focus:border-black/20 focus:ring-2 focus:ring-black/10 focus:outline-none transition-all"
            />
          </div>

          <div className="sm:col-span-3">
            <AppleSelect
              options={oppTypes.map((t) => ({ value: t.id, label: t.label }))}
              value={selectedType}
              onChange={setSelectedType}
              className="w-full"
              buttonClassName="py-2.5 px-4 rounded-full bg-black/[0.03] border-transparent hover:border-black/10"
            />
          </div>

          <div className="sm:col-span-3">
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
      </div>

      {/* Opportunities List - Apple Cards */}
      <div className="space-y-4">
        {paginatedOpps.map((opp) => {
          const divMeta = DIVISIONS_CATALOG[opp.divisionSlug];

          return (
            <div
              key={opp.id}
              className="apple-card p-6 md:p-7 border border-black/[0.06] transition-all apple-press"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                {/* Left: Company Logo + Details */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-black/[0.04] border border-black/[0.08] overflow-hidden flex items-center justify-center flex-shrink-0">
                    {opp.companyLogo ? (
                      <img
                        src={opp.companyLogo}
                        alt={opp.companyName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-5 h-5 text-black/50" />
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap text-xs text-[#818A84]">
                      <span className="font-semibold text-black uppercase tracking-wider text-[10px] bg-black/[0.04] px-2 py-0.5 rounded">
                        {opp.opportunityType.replace('_', ' ')}
                      </span>
                      <span>·</span>
                      <span>{divMeta?.name}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#818A84]" />
                        {opp.city} {opp.isRemote && '(Remote)'}
                      </span>
                    </div>

                    <div>
                      <h3
                        onClick={() => setSelectedOpp(opp)}
                        className="text-base md:text-lg font-light text-[#171C19] hover:text-black cursor-pointer transition-colors tracking-tight"
                      >
                        {opp.title}
                      </h3>
                      <p className="text-xs font-semibold text-[#171C19] mt-0.5">
                        {opp.companyName}
                      </p>
                    </div>

                    <p className="text-xs text-[#818A84] leading-relaxed line-clamp-2">
                      {opp.description}
                    </p>

                    {/* Batch Eligibility or Perks Callout */}
                    {(opp.batchEligibility || (opp.perks && opp.perks.length > 0)) && (
                      <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px]">
                        {opp.batchEligibility && (
                          <span className="text-[#171C19] bg-black/[0.04] border border-black/[0.06] px-2.5 py-0.5 rounded-md font-normal">
                            {opp.batchEligibility}
                          </span>
                        )}
                        {opp.perks && opp.perks[0] && (
                          <span className="text-[#171C19] bg-black/[0.04] border border-black/[0.06] px-2.5 py-0.5 rounded-md font-normal">
                            {opp.perks[0]}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Skills Pills */}
                    <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
                      {opp.requiredSkills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[11px] font-medium text-[#171C19] bg-[#F4F6F4] px-2.5 py-0.5 rounded-md border border-[#E8ECE9]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Compensation & Actions */}
                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#E8ECE9]">
                  <div className="md:text-right">
                    <span className="text-[11px] text-[#818A84] block">Compensation / Stipend</span>
                    <span className="text-sm md:text-base font-semibold text-black">
                      {formatCompensation(opp.budgetMin, opp.budgetMax, opp.currency)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedOpp(opp)}>
                      Details
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => setApplyOpp(opp)}>
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredOpps.length === 0 && (
          <Card className="text-center py-12 space-y-3">
            <Briefcase className="w-12 h-12 text-[#818A84] mx-auto opacity-50" />
            <h4 className="font-light text-base text-[#171C19]">No opportunities found</h4>
            <p className="text-xs text-[#818A84] max-w-sm mx-auto">
              Try adjusting your search criteria or explore other categories.
            </p>
          </Card>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="pt-4 border-t border-black/[0.06]">
        <Pagination
          currentPage={currentPage}
          totalItems={filteredOpps.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Opportunity Detail Modal */}
      {selectedOpp && (
        <Modal
          isOpen={Boolean(selectedOpp)}
          onClose={() => setSelectedOpp(null)}
          title={selectedOpp.title}
          description={`${selectedOpp.companyName} • ${selectedOpp.city} ${selectedOpp.isRemote ? '(Remote)' : ''}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">
            {/* Banner Image */}
            {selectedOpp.bannerUrl && (
              <div className="relative h-44 sm:h-52 rounded-2xl overflow-hidden bg-neutral-900 border border-black/[0.08]">
                <img
                  src={selectedOpp.bannerUrl}
                  alt={selectedOpp.title}
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white p-1 border border-white/20 shadow-md flex items-center justify-center flex-shrink-0">
                      {selectedOpp.companyLogo ? (
                        <img src={selectedOpp.companyLogo} alt={selectedOpp.companyName} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Building2 className="w-5 h-5 text-black" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-white">{selectedOpp.companyName}</h4>
                      <span className="text-[11px] text-white/70 capitalize">{selectedOpp.opportunityType.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white">
                    {formatCompensation(selectedOpp.budgetMin, selectedOpp.budgetMax, selectedOpp.currency)}
                  </span>
                </div>
              </div>
            )}

            {/* Quick Metadata Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-black/[0.02] p-3 rounded-xl border border-black/[0.06]">
              <div>
                <span className="text-[10px] text-[#818A84] block">Type</span>
                <strong className="text-[#171C19] capitalize">{selectedOpp.opportunityType.replace('_', ' ')}</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#818A84] block">Location</span>
                <strong className="text-[#171C19]">{selectedOpp.city} {selectedOpp.isRemote && '(Remote)'}</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#818A84] block">Compensation</span>
                <strong className="text-black">{formatCompensation(selectedOpp.budgetMin, selectedOpp.budgetMax, selectedOpp.currency)}</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#818A84] block">Posted</span>
                <strong className="text-[#171C19]">{formatDate(selectedOpp.postedAt)}</strong>
              </div>
            </div>

            {/* About Company */}
            {selectedOpp.aboutCompany && (
              <div className="space-y-1.5">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-[#818A84]">About {selectedOpp.companyName}</h5>
                <p className="text-xs text-[#525854] leading-relaxed">
                  {selectedOpp.aboutCompany}
                </p>
              </div>
            )}

            {/* Role Overview */}
            <div className="space-y-1.5">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-[#818A84]">Role Overview</h5>
              <p className="text-xs text-[#525854] leading-relaxed whitespace-pre-line">
                {selectedOpp.description}
              </p>
            </div>

            {/* Key Responsibilities */}
            {selectedOpp.responsibilities && selectedOpp.responsibilities.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-[#818A84]">Key Responsibilities</h5>
                <div className="space-y-1.5">
                  {selectedOpp.responsibilities.map((resp, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-[#171C19]">
                      <div className="w-4 h-4 rounded-full bg-black/[0.04] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-black" />
                      </div>
                      <span className="leading-relaxed">{resp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {selectedOpp.requirements && selectedOpp.requirements.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-[#818A84]">Requirements & Qualifications</h5>
                <div className="space-y-1.5">
                  {selectedOpp.requirements.map((req, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-[#171C19]">
                      <div className="w-4 h-4 rounded-full bg-black/[0.04] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-black" />
                      </div>
                      <span className="leading-relaxed">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Perks & Benefits */}
            {selectedOpp.perks && selectedOpp.perks.length > 0 && (
              <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.06] space-y-2">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-[#171C19]">Perks, Benefits & PPO Evaluation</h5>
                <div className="space-y-1.5">
                  {selectedOpp.perks.map((perk, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#171C19]">
                      <span className="text-[#818A84]">•</span>
                      <span className="leading-relaxed">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interview Rounds & Selection Timeline */}
            {selectedOpp.rounds && selectedOpp.rounds.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-[#818A84]">Hiring Process & Interview Rounds</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedOpp.rounds.map((round, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-black/[0.02] border border-black/[0.06] flex items-start gap-2.5 text-xs">
                      <span className="w-5 h-5 rounded-md bg-black text-white text-[10px] font-mono font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-[#171C19] leading-tight">{round}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Batch Eligibility */}
            {selectedOpp.batchEligibility && (
              <div className="p-3 rounded-xl bg-black/[0.02] border border-black/[0.06] text-xs text-[#171C19] flex items-center gap-2">
                <span><strong className="font-medium text-black">Eligible Batches:</strong> {selectedOpp.batchEligibility}</span>
              </div>
            )}

            {/* Required Skills */}
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-[#818A84] mb-1.5">Required Skills</h5>
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedOpp.requiredSkills.map((s) => (
                  <span key={s} className="px-2.5 py-1 bg-[#F4F6F4] text-[#171C19] rounded-lg text-xs font-semibold border border-[#E8ECE9]">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8ECE9] flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedOpp(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setApplyOpp(selectedOpp);
                  setSelectedOpp(null);
                }}
              >
                Apply / Express Interest
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Application Modal */}
      {applyOpp && (
        <Modal
          isOpen={Boolean(applyOpp)}
          onClose={() => setApplyOpp(null)}
          title={`Apply for ${applyOpp.title}`}
          description={`Submit your application directly to ${applyOpp.companyName}.`}
        >
          <div className="space-y-4">
            {isSubmitted ? (
              <div className="p-6 bg-black/[0.04] text-[#171C19] border border-black/[0.08] rounded-2xl text-center font-semibold text-sm space-y-2">
                <CheckCircle2 className="w-8 h-8 text-black mx-auto" />
                <p>Application successfully submitted!</p>
                <p className="text-xs font-normal text-[#818A84]">The opportunity poster will review your verified profile.</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs font-semibold text-[#171C19] block mb-1">Cover Note / Value Proposition</label>
                  <textarea
                    rows={4}
                    placeholder="Describe your relevant experience, project links, and why you are the best fit..."
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    className="w-full p-3 bg-black/[0.03] border border-black/[0.08] rounded-xl text-xs md:text-sm text-[#171C19] focus:bg-white focus:border-black/30 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#171C19] block mb-1">Portfolio / Resume Link</label>
                  <input
                    type="url"
                    placeholder="https://github.com/yourhandle or Figma / Google Drive link"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    className="w-full p-2.5 bg-black/[0.03] border border-black/[0.08] rounded-xl text-xs text-[#171C19] focus:bg-white focus:border-black/30 focus:outline-none"
                  />
                </div>

                {applyOpp && !isJoined(applyOpp.divisionSlug) && (
                  <div className="p-3 bg-black/[0.02] border border-black/[0.06] rounded-xl text-xs text-[#171C19] leading-relaxed">
                    <strong>Note:</strong> You have not joined the <em>{DIVISIONS_CATALOG[applyOpp.divisionSlug]?.name}</em> network yet. Your application will be submitted as an external candidate.
                  </div>
                )}

                <div className="p-3 bg-[#FAFCFA] rounded-xl border border-[#E8ECE9] text-[11px] text-[#818A84]">
                  eongrow will automatically attach your verified credentials and contact details.
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setApplyOpp(null)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleApply}>
                    Submit Application
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* Blocked Post Opportunity Notice Modal for Exploring Users */}
      {createBlockedNotice && (
        <Modal
          isOpen={createBlockedNotice}
          onClose={() => setCreateBlockedNotice(false)}
          title={`Join ${divisionMeta.name}`}
          description="Opportunity posting privileges require an active division membership."
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.06] text-xs text-[#171C19] space-y-2">
              <p className="font-semibold text-sm">
                Active Division Membership Required
              </p>
              <p className="leading-relaxed">
                You are currently exploring <strong>{divisionMeta.name}</strong> in preview mode. To publish job openings, client contracts, or collaboration requests, please join this network.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setCreateBlockedNotice(false)}>
                Dismiss
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setCreateBlockedNotice(false);
                }}
              >
                Understood
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Opportunity Modal with Rich Fields */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Publish an Opportunity"
          description={`Post a new requirement in the ${DIVISIONS_CATALOG[currentDivision].name}.`}
          maxWidth="2xl"
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div>
              <label className="text-xs font-semibold text-[#171C19] block mb-1">Opportunity Title *</label>
              <input
                type="text"
                placeholder="e.g. Full-Stack Engineering Intern (React & Node)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2.5 bg-[#F4F6F4] border border-[#E8ECE9] rounded-xl text-xs text-[#171C19] focus:bg-white focus:border-black/30 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#171C19] block mb-1">Company / Organization Name</label>
                <input
                  type="text"
                  placeholder="e.g. NeoFlow AI Labs"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F6F4] border border-[#E8ECE9] rounded-xl text-xs text-[#171C19]"
                />
              </div>

              <div>
                <ImageUpload
                  label="Company Logo (Optional)"
                  hint="Upload square logo (PNG, JPG, SVG)"
                  variant="logo"
                  folder="company-logos"
                  value={newCompanyLogo}
                  onChange={setNewCompanyLogo}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#171C19] block mb-1">Opportunity Type</label>
                <AppleSelect
                  options={[
                    { value: 'internship', label: 'Internship' },
                    { value: 'job', label: 'Full-Time Job' },
                    { value: 'freelance_project', label: 'Freelance Project' },
                    { value: 'cofounder_search', label: 'Co-Founder Search' },
                    { value: 'business_requirement', label: 'B2B Requirement' },
                    { value: 'creator_campaign', label: 'Brand Campaign' },
                  ]}
                  value={newType}
                  onChange={setNewType}
                  className="w-full"
                  buttonClassName="p-2.5 bg-[#F4F6F4] border-black/10 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171C19] block mb-1">Budget / Monthly Stipend (INR)</label>
                <input
                  type="number"
                  placeholder="e.g. 30000"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F6F4] border border-[#E8ECE9] rounded-xl text-xs text-[#171C19]"
                />
              </div>
            </div>

            <div>
              <ImageUpload
                label="Header Banner Image (Optional)"
                hint="Upload landscape banner for listing header (PNG, JPG, WEBP)"
                variant="banner"
                folder="opportunity-banners"
                value={newBannerUrl}
                onChange={setNewBannerUrl}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#171C19] block mb-1">About the Company / Venture</label>
              <input
                type="text"
                placeholder="Brief 1-2 sentence overview of your company mission and product..."
                value={newAboutCompany}
                onChange={(e) => setNewAboutCompany(e.target.value)}
                className="w-full p-2.5 bg-[#F4F6F4] border border-[#E8ECE9] rounded-xl text-xs text-[#171C19]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#171C19] block mb-1">Required Skills (Comma separated)</label>
              <input
                type="text"
                placeholder="e.g. React, TypeScript, Node.js, PostgreSQL"
                value={newSkills}
                onChange={(e) => setNewSkills(e.target.value)}
                className="w-full p-2.5 bg-[#F4F6F4] border border-[#E8ECE9] rounded-xl text-xs text-[#171C19]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#171C19] block mb-1">Detailed Description *</label>
              <textarea
                rows={3}
                placeholder="Detail the scope of the role, team context, and overall goal..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full p-3 bg-[#F4F6F4] border border-[#E8ECE9] rounded-xl text-xs md:text-sm text-[#171C19] focus:bg-white focus:border-black/30 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#171C19] block mb-1">Key Responsibilities (One per line)</label>
                <textarea
                  rows={3}
                  placeholder="Design modular UI components&#10;Optimize database queries&#10;Collaborate with product designers"
                  value={newResponsibilities}
                  onChange={(e) => setNewResponsibilities(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F6F4] border border-[#E8ECE9] rounded-xl text-xs text-[#171C19]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171C19] block mb-1">Requirements & Qualifications (One per line)</label>
                <textarea
                  rows={3}
                  placeholder="2+ years experience with React&#10;Comfortable with SQL & Git&#10;Strong communication skills"
                  value={newRequirements}
                  onChange={(e) => setNewRequirements(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F6F4] border border-[#E8ECE9] rounded-xl text-xs text-[#171C19]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#171C19] block mb-1">Perks, Stipend & PPO (One per line)</label>
                <textarea
                  rows={2}
                  placeholder="Pre-Placement Offer (PPO) evaluation (₹12 LPA)&#10;Latest M3 MacBook provided&#10;Flexible remote hours"
                  value={newPerks}
                  onChange={(e) => setNewPerks(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F6F4] border border-[#E8ECE9] rounded-xl text-xs text-[#171C19]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171C19] block mb-1">Interview Rounds (One per line)</label>
                <textarea
                  rows={2}
                  placeholder="Round 1: Resume Screen&#10;Round 2: Technical Assignment&#10;Round 3: Live System Design"
                  value={newRounds}
                  onChange={(e) => setNewRounds(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F6F4] border border-[#E8ECE9] rounded-xl text-xs text-[#171C19]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#171C19] block mb-1">Batch Eligibility (For Internships/Campus)</label>
              <input
                type="text"
                placeholder="e.g. 2025, 2026, and 2027 Batches (B.Tech / MCA / BCA)"
                value={newBatchEligibility}
                onChange={(e) => setNewBatchEligibility(e.target.value)}
                className="w-full p-2.5 bg-[#F4F6F4] border border-[#E8ECE9] rounded-xl text-xs text-[#171C19]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8ECE9]">
              <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreateOpp}>
                Publish Opportunity
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
