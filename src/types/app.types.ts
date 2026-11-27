export type ViewState =
  | 'landing'
  | 'dashboard'
  | 'division-hub'
  | 'directory'
  | 'opportunities'
  | 'events'
  | 'my-tickets'
  | 'memberships'
  | 'settings'
  | 'admin'
  | 'scanner'
  | 'onboarding'
  | 'courses'
  | 'affiliate'
  | 'divisions-page'
  | 'how-it-works-page'
  | 'student-charter-page'
  | 'summits-page'
  | 'about-page'
  | 'security-page'
  | 'privacy-page'
  | 'terms-page'
  | 'verification-guide-page'
  | 'pricing-page'
  | 'directory-page'
  | 'opportunities-page'
  | 'wallet-pass-page'
  | 'network-student'
  | 'network-career'
  | 'network-freelancer'
  | 'network-entrepreneur'
  | 'network-business'
  | 'network-influencer'
  | 'network-investor'
  | 'coming-soon-page';

export type DivisionSlug =
  | 'student'
  | 'career'
  | 'freelancer'
  | 'entrepreneur'
  | 'business'
  | 'influencer'
  | 'investor';

export type UserRole =
  | 'super_admin'
  | 'division_admin'
  | 'chapter_manager'
  | 'event_organizer'
  | 'moderator'
  | 'member';

export type VerificationStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

export interface UserSessionProfile {
  id: string;
  email: string;
  fullName: string;
  displayName?: string;
  role?: UserRole;
  roles?: string[];
  avatarUrl?: string;
  headline?: string;
  bio?: string;
  city?: string;
  state?: string;
  gender?: string;
  isWomenDiscountEligible?: boolean;
  joinedDivisions: DivisionSlug[];
  activeDivision?: DivisionSlug;
  currentDivision?: DivisionSlug;
  verificationStatus?: Record<DivisionSlug, VerificationStatus>;
  verificationLevel?: string;
  trustBadge?: boolean;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  website?: string;
  customMarkdown?: string;
}

export interface DivisionMeta {
  id?: string;
  slug: DivisionSlug;
  name: string;
  tagline: string;
  description: string;
  colorHex: string;
  iconName?: string;
  badgeLabel?: string;
  badge?: string;
  isFreeLifetime?: boolean;
  isFreeOnly?: boolean;
  targetAudience?: string;
  keyBenefits?: string[];
  features?: string[];
}

export interface MembershipPlanItem {
  id: string;
  name: string;
  planType: string;
  price: number;
  womenPrice?: number;
  period: string;
  isPopular?: boolean;
  description: string;
  features: string[];
  divisionSlug?: string;
  durationDays?: number | null;
  isActive?: boolean;
}

export interface CourseLesson {
  id: string;
  title: string;
  duration?: string;
  durationMinutes: number;
  youtubeId?: string;
  videoUrl?: string;
  description?: string;
  resources?: Array<{ title: string; url: string }>;
}

export interface CourseModule {
  id?: string;
  chapterNumber?: number;
  title: string;
  description?: string;
  lessons: CourseLesson[];
}

export interface CourseItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  instructorName?: string;
  instructor?: string;
  instructorRole?: string;
  instructorAvatar?: string;
  instructorBio?: string;
  level?: string;
  bannerUrl?: string;
  thumbnailUrl?: string;
  duration?: string;
  durationHours: number;
  lessonsCount?: number;
  certificationFee: number;
  isPublished: boolean;
  prerequisites?: string[];
  skillsGained?: string[];
  modules: CourseModule[];
  curriculum?: any;
}

export interface CourseEnrollmentItem {
  id: string;
  courseId: string;
  userId: string;
  progressPercentage: number;
  progressPct?: number;
  completedLessonIds: string[];
  completedLessons?: any;
  enrolledAt: string;
  completedAt?: string;
  certificationPaid?: boolean;
  certificateIssued?: boolean;
  certificateNumber?: string;
  certificationStatus?: string;
  certificateId?: string;
  certifiedAt?: string;
  course?: CourseItem;
}

export interface AffiliateProfileItem {
  id: string;
  userId: string;
  referralCode: string;
  totalReferrals: number;
  totalConversions: number;
  successfulConversions: number;
  totalEarnings: number;
  pendingPayout: number;
  paidPayout: number;
  paidOut?: number;
  payoutUpiId?: string;
  isActive: boolean;
}

export interface AffiliateReferralItem {
  id: string;
  affiliateProfileId?: string;
  affiliateUserId?: string;
  referredUserId: string;
  referredUserName?: string;
  referredUserEmail?: string;
  referralCode?: string;
  registeredAt: string;
  signupAt?: string;
  hasConverted: boolean;
  conversionDate?: string;
  subscriptionRole?: string;
  firstSubscriptionRole?: string;
  subscriptionPlan?: string;
  commissions: Array<{
    id: string;
    commissionAmount: number;
    commissionPercentage: number;
    paymentAmount: number;
    status: string;
    createdAt: string;
  }>;
}

export interface AffiliateCommissionItem {
  id: string;
  affiliateUserId: string;
  referralId: string;
  paymentId: string;
  membershipRole: string;
  paymentAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  status: 'approved' | 'paid' | 'cancelled';
  createdAt: string;
}

export interface AffiliatePayoutItem {
  id: string;
  affiliateProfileId?: string;
  affiliateUserId?: string;
  affiliateUserName?: string;
  userName?: string;
  userEmail?: string;
  amount: number;
  status: 'pending' | 'approved' | 'processed' | 'rejected';
  payoutMethod: 'upi' | 'bank_transfer' | string;
  payoutDetails?: any;
  transactionReference?: string | null;
  notes?: string | null;
  createdAt?: string;
  requestedAt?: string;
  processedAt?: string | null;
}

export interface AffiliateSettingsItem {
  id?: string;
  commissionPercentage: number | null;
  minPayoutAmount: number;
  isProgramActive?: boolean;
  isActive?: boolean;
  updatedAt?: string;
}

export interface EventDiscountResult {
  discountPercent: number;
  isFreePassAvailable: boolean;
  freePassesRemaining: number;
  membershipTier: string;
  originalPrice: number;
  finalPrice: number;
}
