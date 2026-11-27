import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, CheckCircle2, FileText, X } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { DataService } from '../../services/dataService';
import type { UserSessionProfile } from '../../types/app.types';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { MarkdownPreviewer } from '../ui/MarkdownPreviewer';

interface ProfileFormProps {
  profile: UserSessionProfile;
  updateProfile: (updates: Partial<UserSessionProfile>) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profile, updateProfile }) => {
  const [fullName, setFullName] = useState(profile.fullName || '');
  const [headline, setHeadline] = useState(profile.headline || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [city, setCity] = useState(profile.city || 'Bangalore');
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl || '');
  const [githubUrl, setGithubUrl] = useState(profile.githubUrl || '');
  const [twitterUrl, setTwitterUrl] = useState(profile.twitterUrl || '');
  const [website, setWebsite] = useState(profile.website || '');
  const [customMarkdown, setCustomMarkdown] = useState(profile.customMarkdown || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const processAvatarFile = async (file: File) => {
    setIsUploadingPhoto(true);
    setPhotoError(null);
    const res = await DataService.uploadUserAvatar(profile.id, file);
    setIsUploadingPhoto(false);
    if (res.success && res.avatarUrl) {
      updateProfile({ avatarUrl: res.avatarUrl });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } else {
      setPhotoError(res.error || 'Failed to upload photo');
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processAvatarFile(file);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const handleAvatarDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPhoto(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processAvatarFile(file);
    }
  };

  const handleRemovePhoto = async () => {
    updateProfile({ avatarUrl: '' });
    if (profile.id) {
      await DataService.updateUserProfile(profile.id, { avatarUrl: '' });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSaveProfile = async () => {
    const updates = {
      fullName,
      headline,
      bio,
      city,
      linkedinUrl,
      githubUrl,
      twitterUrl,
      website,
      customMarkdown,
    };
    updateProfile(updates);
    if (profile.id) {
      await DataService.updateUserProfile(profile.id, updates);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="apple-card p-6 sm:p-7 border border-black/[0.06] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/[0.06]">
        <div className="flex items-center gap-4">
          <div
            onClick={() => photoInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingPhoto(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDraggingPhoto(false); }}
            onDrop={handleAvatarDrop}
            className={`relative rounded-full cursor-pointer transition-all group flex-shrink-0 ${
              isDraggingPhoto ? 'ring-4 ring-black/20 scale-105' : 'hover:opacity-90'
            }`}
            title="Click or drop image to upload"
          >
            <Avatar
              src={profile.avatarUrl}
              name={profile.fullName}
              size="xl"
              isVerified={profile.verificationLevel !== 'unverified'}
            />
            <div
              className={`absolute inset-0 rounded-full bg-black/40 flex items-center justify-center text-white transition-opacity ${
                isUploadingPhoto ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              {isUploadingPhoto ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
            </div>
          </div>

          <div>
            <h4 className="font-light text-base text-[#171C19] tracking-tight">{profile.fullName}</h4>
            <p className="text-xs text-[#818A84]">{profile.email}</p>
            <div className="pt-1.5 flex items-center gap-2">
              <span className="text-xs text-black font-semibold capitalize">
                {profile.verificationLevel?.replace('_', ' ') || 'Unverified'}
              </span>
              <span className="text-xs text-[#818A84]">· Profile 85% Complete</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="apple-press text-xs"
              isLoading={isUploadingPhoto}
              onClick={() => photoInputRef.current?.click()}
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              {profile.avatarUrl ? 'Change Photo' : 'Upload Photo'}
            </Button>
            {profile.avatarUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="apple-press text-xs text-red-600 hover:text-red-700"
                onClick={handleRemovePhoto}
              >
                Remove
              </Button>
            )}
          </div>
          <span className="text-[10px] text-[#818A84]">Drag & drop or click (JPG, PNG, max 5MB)</span>
          {photoError && (
            <span className="text-[11px] text-red-600 font-medium">{photoError}</span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[#818A84] block mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/[0.03] border border-black/[0.08] rounded-2xl text-xs md:text-sm text-[#171C19] focus:bg-white focus:border-black/30 focus:ring-4 focus:ring-black/5 focus:outline-none transition-all shadow-2xs"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#818A84] block mb-1.5">
              Location (City)
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/[0.03] border border-black/[0.08] rounded-2xl text-xs md:text-sm text-[#171C19] focus:bg-white focus:border-black/30 focus:ring-4 focus:ring-black/5 focus:outline-none transition-all shadow-2xs"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-[#818A84] block mb-1.5">
            Professional Headline
          </label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Computer Science Undergrad @ RVCE | Full-Stack Dev"
            className="w-full px-4 py-2.5 bg-black/[0.03] border border-black/[0.08] rounded-2xl text-xs md:text-sm text-[#171C19] focus:bg-white focus:border-black/30 focus:ring-4 focus:ring-black/5 focus:outline-none transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[#818A84] block mb-1.5">
            Bio & Background
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-4 py-3 bg-black/[0.03] border border-black/[0.08] rounded-2xl text-xs md:text-sm text-[#171C19] focus:bg-white focus:border-black/30 focus:ring-4 focus:ring-black/5 focus:outline-none transition-all shadow-2xs"
          />
        </div>

        {/* Social & Portfolio Links */}
        <div className="pt-2 border-t border-black/[0.06] space-y-3">
          <h5 className="text-xs font-semibold text-[#171C19] uppercase tracking-wider">
            Social & External Profiles
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#818A84] block mb-1.5">
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-4 py-2.5 bg-black/[0.03] border border-black/[0.08] rounded-2xl text-xs text-[#171C19] focus:bg-white focus:border-black/30 focus:outline-none shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#818A84] block mb-1.5">
                GitHub Profile URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full px-4 py-2.5 bg-black/[0.03] border border-black/[0.08] rounded-2xl text-xs text-[#171C19] focus:bg-white focus:border-black/30 focus:outline-none shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#818A84] block mb-1.5">
                Twitter / X Profile URL
              </label>
              <input
                type="url"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                placeholder="https://x.com/username"
                className="w-full px-4 py-2.5 bg-black/[0.03] border border-black/[0.08] rounded-2xl text-xs text-[#171C19] focus:bg-white focus:border-black/30 focus:outline-none shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#818A84] block mb-1.5">
                Portfolio / Personal Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourportfolio.com"
                className="w-full px-4 py-2.5 bg-black/[0.03] border border-black/[0.08] rounded-2xl text-xs text-[#171C19] focus:bg-white focus:border-black/30 focus:outline-none shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Custom Markdown Portfolio Section with Live Previewer */}
        <div className="pt-2 border-t border-black/[0.06]">
          <MarkdownPreviewer
            value={customMarkdown}
            onChange={setCustomMarkdown}
            label="Custom Markdown Bio & Portfolio"
            placeholder={`# About Me\n\n- Senior systems engineer & builder\n- Featured projects: [My SaaS](https://example.com)\n\n### Tech Stack\nReact, TypeScript, Node.js, Go`}
            minRows={7}
          />
        </div>

        <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
          {savedSuccess ? (
            <span className="text-xs font-semibold text-black">
              Profile updated successfully
            </span>
          ) : (
            <span />
          )}
          <Button variant="primary" size="md" onClick={handleSaveProfile} className="apple-press">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export const UserSettings: React.FC = () => {
  const { profile, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'verification' | 'privacy' | 'notifications'>('profile');
  const [visibility, setVisibility] = useState('members_only');

  // Verification upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadDocType, setUploadDocType] = useState('identity_verified');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDraggingDoc, setIsDraggingDoc] = useState(false);
  const [uploadedDocName, setUploadedDocName] = useState<string | null>(null);

  const processDocFile = async (file: File) => {
    if (!profile?.id) return;
    setUploadedDocName(file.name);
    setIsUploading(true);
    await DataService.uploadVerificationDocument({
      userId: profile.id,
      file,
      verificationType: uploadDocType,
    });
    setIsUploading(false);
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
    }, 4000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processDocFile(file);
    }
  };

  const handleDocDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingDoc(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processDocFile(file);
    }
  };

  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extralight text-[#171C19] tracking-tight">Account Settings & Privacy Controls</h2>
        <p className="text-sm text-[#818A84] mt-1">
          Manage your verified professional identity, division profiles, and notification preferences.
        </p>
      </div>

      {/* Tabs - Apple Segmented Control */}
      <div className="apple-segment-track p-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none rounded-full">
        {[
          { id: 'profile', label: 'Personal & Professional Profile' },
          { id: 'verification', label: 'Trust & Identity Verification' },
          { id: 'privacy', label: 'Privacy & Directory Visibility' },
          { id: 'notifications', label: 'Notification Channels' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer apple-press ${
              activeTab === t.id
                ? 'bg-white text-[#171C19] shadow-xs font-bold'
                : 'text-[#818A84] hover:text-[#171C19]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Profile */}
      {activeTab === 'profile' && profile && (
        <ProfileForm key={profile.id} profile={profile} updateProfile={updateProfile} />
      )}

      {/* Tab: Verification */}
      {activeTab === 'verification' && (
        <Card className="space-y-6">
          <div>
            <h4 className="font-light text-lg text-[#171C19]">eongrow Trust Verification Protocol</h4>
            <p className="text-xs text-[#818A84] mt-0.5">
              Verified members enjoy higher search ranking, verified checkmarks, and access to closed investor deal flow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { type: 'identity_verified', label: 'Government / Student ID', desc: 'Aadhaar, Passport or College ID card' },
              { type: 'professionally_verified', label: 'Professional Proof', desc: 'Offer letter, work email or client contract' },
              { type: 'business_verified', label: 'Business & Startup Entity', desc: 'MCA Certificate, GSTIN or incorporation deed' },
            ].map((v) => (
              <div
                key={v.type}
                onClick={() => setUploadDocType(v.type)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  uploadDocType === v.type
                    ? 'border-black bg-black/[0.04] ring-1 ring-black/10'
                    : 'border-[#E8ECE9] hover:bg-[#F4F6F4]'
                }`}
              >
                <h5 className="font-normal text-xs text-[#171C19]">{v.label}</h5>
                <p className="text-[11px] text-[#818A84] mt-1">{v.desc}</p>
              </div>
            ))}
          </div>

          {/* Upload Box */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDraggingDoc(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDraggingDoc(false); }}
            onDrop={handleDocDrop}
            onClick={handleTriggerUpload}
            className={`p-6 sm:p-8 border-2 border-dashed rounded-2xl text-center space-y-3 transition-all cursor-pointer ${
              isDraggingDoc
                ? 'border-black bg-black/[0.04] ring-2 ring-black/10'
                : 'border-[#E8ECE9] hover:border-black/30 bg-[#FAFCFA] hover:bg-[#F7F9F7]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-black/[0.04] flex items-center justify-center mx-auto text-black">
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-[#171C19]">
                Click or drag & drop verification document (PDF, PNG, JPG)
              </p>
              <p className="text-[11px] text-[#818A84] mt-0.5">
                Stored in encrypted private storage vault with signed URL access only.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              isLoading={isUploading}
              onClick={(e) => {
                e.stopPropagation();
                handleTriggerUpload();
              }}
              className="apple-press text-xs"
            >
              Select File from Device
            </Button>

            {uploadSuccess && (
              <div className="p-2.5 rounded-xl bg-black/[0.04] border border-black/[0.08] inline-flex items-center gap-2 text-xs font-medium text-black mt-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{uploadedDocName || 'Document'} submitted to verification review queue</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Tab: Privacy */}
      {activeTab === 'privacy' && (
        <Card className="space-y-4">
          <div>
            <h4 className="font-light text-lg text-[#171C19]">Profile Visibility Settings</h4>
            <p className="text-xs text-[#818A84] mt-0.5">
              Control who can see your contact information, division profiles, and portfolio.
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              { id: 'public', label: 'Public — Visible to anyone on the web', desc: 'Recommended for creators, founders, and freelancers seeking clients.' },
              { id: 'members_only', label: 'Members Only — Visible to logged-in eongrow members', desc: 'Protected within the verified community network.' },
              { id: 'connections_only', label: 'Connections Only — Visible only to approved contacts', desc: 'Restricted to direct connections.' },
            ].map((p) => (
              <label
                key={p.id}
                onClick={() => setVisibility(p.id)}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer ${
                  visibility === p.id ? 'border-black bg-black/[0.04]' : 'border-[#E8ECE9]'
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === p.id}
                  onChange={() => setVisibility(p.id)}
                  className="mt-1 text-black focus:ring-black"
                />
                <div>
                  <p className="text-xs font-bold text-[#171C19]">{p.label}</p>
                  <p className="text-[11px] text-[#818A84]">{p.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E8ECE9] text-right">
            <Button variant="primary" size="sm" onClick={() => alert('Privacy preferences updated.')}>
              Update Privacy Settings
            </Button>
          </div>
        </Card>
      )}

      {/* Tab: Notifications */}
      {activeTab === 'notifications' && (
        <Card className="space-y-4">
          <div>
            <h4 className="font-light text-lg text-[#171C19]">Notification Preferences</h4>
            <p className="text-xs text-[#818A84] mt-0.5">
              Configure in-platform, email, and WhatsApp notifications for summit passes and deal introductions.
            </p>
          </div>

          <div className="space-y-3 text-xs divide-y divide-[#E8ECE9]">
            {[
              { title: 'Event Ticket Issuance & Check-in Reminders', desc: 'Instant QR pass delivery and venue schedule changes.', email: true, whatsapp: true },
              { title: 'Connection & Warm Introduction Requests', desc: 'When another verified member requests to connect.', email: true, whatsapp: false },
              { title: 'Opportunity Application Updates', desc: 'Notifications when an employer or founder reviews your application.', email: true, whatsapp: false },
              { title: 'Platform & Division Announcements', desc: 'Curated monthly roundups and major summit activations.', email: false, whatsapp: false },
            ].map((n, i) => (
              <div key={i} className="pt-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-[#171C19]">{n.title}</p>
                  <p className="text-[11px] text-[#818A84]">{n.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked={n.email} className="rounded text-black" />
                    <span>Email</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked={n.whatsapp} className="rounded text-black" />
                    <span>WhatsApp</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
