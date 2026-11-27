import React, { useState } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Share2,
  Check,
  UserPlus,
  MessageSquare,
  Sparkles,
  Award,
  Globe,
  BookOpen,
  Briefcase,
  Layers,
} from 'lucide-react';
import { DIVISIONS_CATALOG } from '../../lib/divisions';
import { ABSTRACT_IMAGES } from '../../lib/abstractImages';
import type { MemberItem } from '../../services/dataService';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { MarkdownViewer } from '../ui/MarkdownPreviewer';

interface ExpandedProfileViewerProps {
  member: MemberItem;
  onBack: () => void;
  onConnect?: (member: MemberItem) => void;
  onRequestIntro?: (member: MemberItem) => void;
  onDirectMessage?: (memberId: string) => void;
  isConnected?: boolean;
}

export const ExpandedProfileViewer: React.FC<ExpandedProfileViewerProps> = ({
  member,
  onBack,
  onConnect,
  onRequestIntro,
  onDirectMessage,
  isConnected = false,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'credentials' | 'activity'>('portfolio');

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const primaryDivisionSlug = member.divisions[0] || 'student';
  const coverImage = ABSTRACT_IMAGES.divisions[primaryDivisionSlug] || ABSTRACT_IMAGES.directory;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#818A84] hover:text-black transition-colors cursor-pointer px-3 py-1.5 rounded-full hover:bg-black/[0.05]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Member Directory</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#818A84] hover:text-black transition-colors cursor-pointer px-3 py-1.5 rounded-full border border-black/[0.08] hover:bg-black/[0.04]"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copiedLink ? 'Profile Copied' : 'Share Profile'}</span>
        </button>
      </div>

      {/* Main Expanded Profile Card */}
      <div className="apple-card p-0 overflow-hidden border border-black/[0.08] bg-white shadow-sm rounded-[28px]">
        {/* Cover Artwork Banner */}
        <div className="relative h-48 sm:h-60 w-full overflow-hidden bg-neutral-900">
          <img
            src={coverImage}
            alt="Cover pattern"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        {/* Profile Header Bar */}
        <div className="px-6 sm:px-8 pb-6 relative pt-0">
          {/* Avatar and Verification Checkmark */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
            <div className="relative -mt-16 sm:-mt-20 z-10 flex-shrink-0">
              <div className="relative inline-block rounded-full ring-4 ring-white bg-white shadow-lg overflow-hidden w-24 h-24 sm:w-28 sm:h-28">
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={member.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-100 flex items-center justify-center font-bold text-2xl text-[#171C19]">
                    {member.fullName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              {member.verificationLevel !== 'unverified' && (
                <div
                  className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-sm border border-black/[0.08]"
                  title={member.verificationLevel.replace('_', ' ')}
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {isConnected ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onDirectMessage && onDirectMessage(member.id)}
                  className="text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Direct Message
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onConnect && onConnect(member)}
                  className="text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Connect
                </Button>
              )}

              {onRequestIntro && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRequestIntro(member)}
                  className="text-xs font-medium"
                >
                  Request Intro
                </Button>
              )}
            </div>
          </div>

          {/* Member Name, Headline & Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-light text-[#171C19] tracking-tight">
                {member.fullName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/[0.04] text-neutral-800 border border-black/[0.06] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                {member.verificationLevel.replace('_', ' ')}
              </span>
            </div>

            <p className="text-sm text-[#818A84] max-w-2xl leading-relaxed">
              {member.headline}
            </p>

            <div className="flex items-center gap-4 text-xs text-[#818A84] pt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {member.city}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Member since {member.joinedDate || '2024'}
              </span>
            </div>
          </div>

          {/* Social Links Bar */}
          <div className="mt-5 pt-4 border-t border-black/[0.06] flex items-center gap-2.5 flex-wrap">
            {member.linkedinUrl && (
              <a
                href={member.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#171C19] font-medium px-3 py-1.5 rounded-full bg-black/[0.03] hover:bg-black/[0.07] border border-black/[0.06] transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-[#0A66C2]" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8m1.39 9.74v-8.37H5.07v8.37h2.78z" />
                </svg>
                <span>LinkedIn</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-50" />
              </a>
            )}

            {member.githubUrl && (
              <a
                href={member.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#171C19] font-medium px-3 py-1.5 rounded-full bg-black/[0.03] hover:bg-black/[0.07] border border-black/[0.06] transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-[#24292F]" viewBox="0 0 24 24">
                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                </svg>
                <span>GitHub</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-50" />
              </a>
            )}

            {member.twitterUrl && (
              <a
                href={member.twitterUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#171C19] font-medium px-3 py-1.5 rounded-full bg-black/[0.03] hover:bg-black/[0.07] border border-black/[0.06] transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-[#1DA1F2]" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Twitter / X</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-50" />
              </a>
            )}

            {member.website && (
              <a
                href={member.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#171C19] font-medium px-3 py-1.5 rounded-full bg-black/[0.03] hover:bg-black/[0.07] border border-black/[0.06] transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>Portfolio</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-50" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Profile Detail Tabs: Portfolio & Markdown Bio vs Credentials */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Custom Markdown Portfolio & Bio */}
        <div className="lg:col-span-8 space-y-6">
          <div className="apple-card p-6 sm:p-7 border border-black/[0.06] bg-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <h3 className="text-base font-medium text-[#171C19] tracking-tight flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-neutral-700" />
                Verified Bio & Portfolio
              </h3>
              <span className="text-[10px] text-[#818A84] font-mono">Custom Markdown</span>
            </div>

            {member.customMarkdown ? (
              <div className="prose-clean pt-1">
                <MarkdownViewer content={member.customMarkdown} />
              </div>
            ) : (
              <p className="text-xs text-[#525854] leading-relaxed">
                {member.bio || 'No expanded bio entered yet.'}
              </p>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Ecosystems, Skills, & Trust Credentials */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Ecosystems */}
          <div className="apple-card p-5 border border-black/[0.06] bg-white space-y-3">
            <h4 className="text-xs font-semibold text-[#171C19] uppercase tracking-wider">
              Active Ecosystems ({member.divisions.length})
            </h4>
            <div className="space-y-2">
              {member.divisions.map((dSlug) => {
                const div = DIVISIONS_CATALOG[dSlug];
                return (
                  <div
                    key={dSlug}
                    className="p-3 rounded-xl border border-black/[0.06] bg-black/[0.01] flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-semibold text-[#171C19] block">
                        {div?.name || dSlug}
                      </span>
                      <span className="text-[10px] text-[#818A84]">
                        {div?.tagline || 'Verified Network'}
                      </span>
                    </div>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: div?.colorHex || '#171C19' }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verified Skills & Domains */}
          <div className="apple-card p-5 border border-black/[0.06] bg-white space-y-3">
            <h4 className="text-xs font-semibold text-[#171C19] uppercase tracking-wider">
              Skills & Expertise
            </h4>
            <div className="flex items-center gap-1.5 flex-wrap">
              {member.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-black/[0.04] text-[#171C19] border border-black/[0.06]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Verification Audit */}
          <div className="apple-card p-5 border border-black/[0.06] bg-white space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
              <h4 className="text-xs font-semibold uppercase tracking-wider">Identity Trust Score</h4>
            </div>
            <p className="text-xs text-[#818A84] leading-relaxed">
              This member has completed cryptographic KYC identity verification and is certified under eongrow's cross-ecosystem trust charter.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
