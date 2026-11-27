import React, { useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { useDivision } from '../../context/useDivision';
import { DIVISIONS_LIST } from '../../lib/divisions';
import { DataService } from '../../services/dataService';
import type { DivisionSlug } from '../../types/app.types';
import { Button } from '../ui/Button';
import { ImageUpload } from '../ui/ImageUpload';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const { profile, updateProfile, joinDivision } = useAuth();
  const { setDivision } = useDivision();

  const [step, setStep] = useState<number>(1);
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [headline, setHeadline] = useState(profile?.headline || '');
  const [city, setCity] = useState(profile?.city || 'Bangalore');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  const [selectedDivisions, setSelectedDivisions] = useState<DivisionSlug[]>(
    profile?.joinedDivisions || ['student']
  );

  const toggleDivision = (slug: DivisionSlug) => {
    if (selectedDivisions.includes(slug)) {
      if (selectedDivisions.length > 1) {
        setSelectedDivisions(selectedDivisions.filter((s) => s !== slug));
      }
    } else {
      setSelectedDivisions([...selectedDivisions, slug]);
    }
  };

  const handleFinish = async () => {
    updateProfile({
      fullName,
      headline,
      city,
      bio,
      avatarUrl,
      joinedDivisions: selectedDivisions,
      currentDivision: selectedDivisions[0] || 'student',
    });

    if (profile?.id) {
      await DataService.updateUserProfile(profile.id, {
        fullName,
        headline,
        city,
        bio,
        avatarUrl,
      });
      for (const div of selectedDivisions) {
        await joinDivision(div);
      }
    }

    setDivision(selectedDivisions[0] || 'student');
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#F4F6F4] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Progress header */}
        <div className="text-center space-y-2">
          <span className="text-xs text-[#818A84] block font-medium">Step {step} of 3</span>
          <h2 className="text-2xl sm:text-3xl font-extralight text-[#171C19] tracking-tight">
            {step === 1 && 'Personalize Your Identity'}
            {step === 2 && 'Tell the Community About Yourself'}
            {step === 3 && 'Choose Your Network Divisions'}
          </h2>
          <p className="text-xs sm:text-sm text-[#818A84] max-w-md mx-auto">
            {step === 1 && 'Your central eongrow profile connects you across all 7 professional ecosystems.'}
            {step === 2 && 'Craft a clear headline so peers, founders, and recruiters can discover you.'}
            {step === 3 && 'Select all divisions relevant to you. You can join multiple with one account!'}
          </p>
        </div>

        {/* Step Cards - Apple Bento Card */}
        <div className="apple-card p-6 sm:p-8 space-y-6 border border-black/[0.06]">
          {step === 1 && (
            <div className="space-y-4">
              <div className="pb-1">
                <ImageUpload
                  variant="avatar"
                  label="Profile Avatar (Optional)"
                  hint="Upload an avatar so peers can recognize you (PNG, JPG max 5MB)"
                  value={avatarUrl}
                  onChange={setAvatarUrl}
                  folder="avatars"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#818A84] block mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-4 py-3 bg-black/[0.03] border border-black/[0.08] rounded-2xl text-sm text-[#171C19] placeholder:text-[#818A84]/70 focus:bg-white focus:border-black/30 focus:ring-4 focus:ring-black/5 focus:outline-none transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#818A84] block mb-1.5">
                  Primary Location (City)
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bangalore, Hyderabad, Mumbai, Delhi-NCR"
                  className="w-full px-4 py-3 bg-black/[0.03] border border-black/[0.08] rounded-2xl text-sm text-[#171C19] placeholder:text-[#818A84]/70 focus:bg-white focus:border-black/30 focus:ring-4 focus:ring-black/5 focus:outline-none transition-all shadow-2xs"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#818A84] block mb-1.5">
                  Professional Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Student Innovator @ RVCE | Aspiring AI Engineer & Founder"
                  className="w-full px-4 py-3 bg-black/[0.03] border border-black/[0.08] rounded-2xl text-sm text-[#171C19] placeholder:text-[#818A84]/70 focus:bg-white focus:border-black/30 focus:ring-4 focus:ring-black/5 focus:outline-none transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#818A84] block mb-1.5">
                  Brief Bio & Collaboration Goals
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your interests, projects, or what you hope to discover on eongrow..."
                  className="w-full px-4 py-3 bg-black/[0.03] border border-black/[0.08] rounded-2xl text-sm text-[#171C19] placeholder:text-[#818A84]/70 focus:bg-white focus:border-black/30 focus:ring-4 focus:ring-black/5 focus:outline-none transition-all shadow-2xs"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3.5 bg-black/[0.04] rounded-2xl border border-black/[0.08] text-xs text-[#171C19] font-medium leading-relaxed">
                Multi-division enrollment: Select all networks that apply. For example, you can simultaneously join as a Student, Freelancer, and Startup Founder.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {DIVISIONS_LIST.map((div) => {
                  const isSelected = selectedDivisions.includes(div.slug);

                  return (
                    <div
                      key={div.slug}
                      onClick={() => toggleDivision(div.slug)}
                      className={`p-3.5 rounded-[18px] border transition-all cursor-pointer flex items-start gap-3 apple-press ${
                        isSelected
                          ? 'border-black bg-black/[0.04] ring-1 ring-black/10'
                          : 'border-black/[0.06] bg-black/[0.015] hover:bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleDivision(div.slug)}
                        className="mt-1 rounded text-black focus:ring-black"
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-normal text-xs text-[#171C19]">{div.name}</h4>
                          {div.slug === 'student' && (
                            <span className="text-xs text-black font-semibold">Free</span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#818A84] line-clamp-1">{div.tagline}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-black/[0.06]">
            {step > 1 ? (
              <Button variant="outline" size="md" onClick={() => setStep(step - 1)} className="apple-press">
                Back
              </Button>
            ) : (
              <span />
            )}

            {step < 3 ? (
              <Button variant="primary" size="md" onClick={() => setStep(step + 1)} className="apple-press">
                Continue
              </Button>
            ) : (
              <Button variant="primary" size="md" onClick={handleFinish} className="font-medium apple-press">
                Complete Onboarding
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
