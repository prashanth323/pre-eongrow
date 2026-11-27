import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { DivisionProvider } from './context/DivisionContext';
import { useDivision } from './context/useDivision';
import type { DivisionSlug, ViewState } from './types/app.types';

// Layout Components
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

// Direct View Components (statically imported for instant, error-free rendering)
import { LandingPage } from './pages/LandingPage';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { MemberDashboard } from './components/dashboard/MemberDashboard';
import { DivisionHub } from './components/dashboard/DivisionHub';
import { MemberDirectory } from './components/directory/MemberDirectory';
import { OpportunitiesList } from './components/opportunities/OpportunitiesList';
import { EventsList } from './components/events/EventsList';
import { MyTickets } from './components/events/MyTickets';
import { MembershipPlans } from './components/memberships/MembershipPlans';
import { CoursesView } from './components/courses/CoursesView';
import { StudentAffiliateView } from './components/affiliate/StudentAffiliateView';
import { UserSettings } from './components/settings/UserSettings';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { QRScannerView } from './components/scanner/QRScannerView';

// Dedicated Separate Public & Policy Pages
import { DivisionsPage } from './pages/DivisionsPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { StudentCharterPage } from './pages/StudentCharterPage';
import { SummitsPage } from './pages/SummitsPage';
import { AboutPage } from './pages/AboutPage';
import { SecurityPage } from './pages/SecurityPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { VerificationGuidePage } from './pages/VerificationGuidePage';
import { PricingPage } from './pages/PricingPage';
import { NetworkDetailPage } from './pages/NetworkDetailPage';
import { DirectoryPublicPage } from './pages/DirectoryPublicPage';
import { OpportunitiesPublicPage } from './pages/OpportunitiesPublicPage';
import { WalletPassGuidePage } from './pages/WalletPassGuidePage';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { PublicLayout } from './components/layout/PublicLayout';

const PUBLIC_VIEWS: ViewState[] = [
  'landing',
  'divisions-page',
  'how-it-works-page',
  'student-charter-page',
  'summits-page',
  'about-page',
  'security-page',
  'privacy-page',
  'terms-page',
  'verification-guide-page',
  'pricing-page',
  'directory-page',
  'opportunities-page',
  'wallet-pass-page',
  'coming-soon-page',
  'network-student',
  'network-career',
  'network-freelancer',
  'network-entrepreneur',
  'network-business',
  'network-influencer',
  'network-investor',
];

const AppContent: React.FC = () => {
  const { profile } = useAuth();
  const { currentDivision, divisionMeta, setDivision, isExploring, registeredDivisions, setActiveFeatureTab } = useDivision();

  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [comingSoonReason, setComingSoonReason] = useState<'signin' | 'register' | 'event' | 'opportunity' | 'general'>('general');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // When a real session loads or user authenticates, transition to dashboard
  const hasInitializedAuthRef = React.useRef(false);
  React.useEffect(() => {
    if (profile && !hasInitializedAuthRef.current) {
      hasInitializedAuthRef.current = true;
      setCurrentView('dashboard');
    } else if (!profile) {
      hasInitializedAuthRef.current = false;
    }
  }, [profile]);

  // Scroll to top of window whenever the current view changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentView]);

  // Support direct URL routing to #signin, #login, #signup, #comingsoon
  React.useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#signin' || hash === '#login') {
        setComingSoonReason('signin');
        setCurrentView('coming-soon-page');
      } else if (hash === '#signup' || hash === '#register') {
        setComingSoonReason('register');
        setCurrentView('coming-soon-page');
      } else if (
        hash === '#comingsoon' ||
        hash === '#coming-soon' ||
        hash === '#waitlist' ||
        hash === '#earlyaccess'
      ) {
        setComingSoonReason('general');
        setCurrentView('coming-soon-page');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // In exploration mode, route data-centric views to the corresponding feature tabs in DivisionHub
  React.useEffect(() => {
    if (isExploring) {
      if (currentView === 'opportunities') {
        setActiveFeatureTab('opportunities');
      } else if (currentView === 'directory') {
        setActiveFeatureTab('community');
      } else if (currentView === 'events' || currentView === 'my-tickets') {
        setActiveFeatureTab('summits');
      } else if (currentView === 'dashboard') {
        setActiveFeatureTab('overview');
      }
    }
  }, [isExploring, currentView, setActiveFeatureTab]);

  // Handle landing page actions: cleanly route login and registration to designed Coming Soon page
  const handleOpenAuth = (mode: 'login' | 'register') => {
    setComingSoonReason(mode === 'login' ? 'signin' : 'register');
    setCurrentView('coming-soon-page');
  };

  const handleExploreDivisionFromLanding = (slug: DivisionSlug) => {
    setDivision(slug);
    setCurrentView(`network-${slug}` as ViewState);
  };

  const isPublicView = PUBLIC_VIEWS.includes(currentView);

  // If user is viewing any public/marketing page, or is unauthenticated
  if (isPublicView || !profile) {
    const effectiveView = isPublicView ? currentView : 'coming-soon-page';

    return (
      <div className={`min-h-screen ${effectiveView === 'landing' || effectiveView === 'coming-soon-page' ? 'bg-[#07040F]' : 'bg-[#F4F6F4]'} text-[#171C19]`}>
        {effectiveView === 'landing' && (
          <LandingPage
            onGetStarted={() => handleOpenAuth('register')}
            onSignIn={() => handleOpenAuth('login')}
            onExploreDivision={handleExploreDivisionFromLanding}
            onBrowseEvents={() => setCurrentView('summits-page')}
            onNavigate={setCurrentView}
          />
        )}

        {effectiveView === 'coming-soon-page' && (
          <PublicLayout
            currentView="coming-soon-page"
            onNavigate={setCurrentView}
            onSignIn={() => handleOpenAuth('login')}
            onGetStarted={() => handleOpenAuth('register')}
            onExploreDivision={handleExploreDivisionFromLanding}
          >
            <ComingSoonPage
              onNavigate={setCurrentView}
              reason={comingSoonReason}
            />
          </PublicLayout>
        )}

        {effectiveView === 'divisions-page' && (
          <PublicLayout
            currentView="divisions-page"
            onNavigate={setCurrentView}
            onSignIn={() => handleOpenAuth('login')}
            onGetStarted={() => handleOpenAuth('register')}
            onExploreDivision={handleExploreDivisionFromLanding}
          >
            <DivisionsPage
              onNavigate={setCurrentView}
              onExploreDivision={handleExploreDivisionFromLanding}
              onGetStarted={() => handleOpenAuth('register')}
            />
          </PublicLayout>
        )}

        {effectiveView === 'how-it-works-page' && (
          <PublicLayout
            currentView="how-it-works-page"
            onNavigate={setCurrentView}
            onSignIn={() => handleOpenAuth('login')}
            onGetStarted={() => handleOpenAuth('register')}
            onExploreDivision={handleExploreDivisionFromLanding}
          >
            <HowItWorksPage
              onNavigate={setCurrentView}
              onGetStarted={() => handleOpenAuth('register')}
            />
          </PublicLayout>
        )}

        {effectiveView === 'student-charter-page' && (
          <PublicLayout
            currentView="student-charter-page"
            onNavigate={setCurrentView}
            onSignIn={() => handleOpenAuth('login')}
            onGetStarted={() => handleOpenAuth('register')}
            onExploreDivision={handleExploreDivisionFromLanding}
          >
            <StudentCharterPage
              onNavigate={setCurrentView}
              onGetStarted={() => handleOpenAuth('register')}
            />
          </PublicLayout>
        )}

        {effectiveView === 'summits-page' && (
          <PublicLayout
            currentView="summits-page"
            onNavigate={setCurrentView}
            onSignIn={() => handleOpenAuth('login')}
            onGetStarted={() => handleOpenAuth('register')}
            onExploreDivision={handleExploreDivisionFromLanding}
          >
            <SummitsPage
              onNavigate={setCurrentView}
              onGetStarted={() => handleOpenAuth('register')}
            />
          </PublicLayout>
        )}

        {effectiveView === 'about-page' && (
          <PublicLayout
            currentView="about-page"
            onNavigate={setCurrentView}
            onSignIn={() => handleOpenAuth('login')}
            onGetStarted={() => handleOpenAuth('register')}
            onExploreDivision={handleExploreDivisionFromLanding}
          >
            <AboutPage
              onNavigate={setCurrentView}
              onGetStarted={() => handleOpenAuth('register')}
            />
          </PublicLayout>
        )}

        {effectiveView === 'security-page' && (
          <PublicLayout
            currentView="security-page"
            onNavigate={setCurrentView}
            onSignIn={() => handleOpenAuth('login')}
            onGetStarted={() => handleOpenAuth('register')}
            onExploreDivision={handleExploreDivisionFromLanding}
          >
            <SecurityPage
              onNavigate={setCurrentView}
              onGetStarted={() => handleOpenAuth('register')}
            />
          </PublicLayout>
        )}

        {effectiveView === 'privacy-page' && (
          <PublicLayout
            currentView="privacy-page"
            onNavigate={setCurrentView}
            onSignIn={() => handleOpenAuth('login')}
            onGetStarted={() => handleOpenAuth('register')}
            onExploreDivision={handleExploreDivisionFromLanding}
          >
            <PrivacyPolicyPage onNavigate={setCurrentView} />
          </PublicLayout>
        )}

        {effectiveView === 'terms-page' && (
          <PublicLayout
            currentView="terms-page"
            onNavigate={setCurrentView}
            onSignIn={() => handleOpenAuth('login')}
            onGetStarted={() => handleOpenAuth('register')}
            onExploreDivision={handleExploreDivisionFromLanding}
          >
            <TermsOfServicePage onNavigate={setCurrentView} />
          </PublicLayout>
        )}

        {effectiveView === 'verification-guide-page' && (
          <PublicLayout
            currentView="verification-guide-page"
            onNavigate={setCurrentView}
            onSignIn={() => handleOpenAuth('login')}
            onGetStarted={() => handleOpenAuth('register')}
            onExploreDivision={handleExploreDivisionFromLanding}
          >
            <VerificationGuidePage
              onNavigate={setCurrentView}
              onGetStarted={() => handleOpenAuth('register')}
            />
          </PublicLayout>
        )}

        {effectiveView.startsWith('network-') && (
          <NetworkDetailPage
            slug={effectiveView.replace('network-', '') as DivisionSlug}
            onNavigate={setCurrentView}
            onSignIn={() => handleOpenAuth('login')}
            onGetStarted={() => handleOpenAuth('register')}
          />
        )}

        {effectiveView === 'pricing-page' && (
          <PricingPage
            onNavigate={setCurrentView}
            onSignIn={() => handleOpenAuth('login')}
            onGetStarted={() => handleOpenAuth('register')}
          />
        )}

        {effectiveView === 'directory-page' && (
          <DirectoryPublicPage
            onNavigate={setCurrentView}
            onSignIn={() => handleOpenAuth('login')}
            onGetStarted={() => handleOpenAuth('register')}
          />
        )}

        {effectiveView === 'opportunities-page' && (
          <OpportunitiesPublicPage
            onNavigate={setCurrentView}
            onSignIn={() => handleOpenAuth('login')}
            onGetStarted={() => handleOpenAuth('register')}
          />
        )}

        {effectiveView === 'wallet-pass-page' && (
          <WalletPassGuidePage
            onNavigate={setCurrentView}
            onSignIn={() => handleOpenAuth('login')}
            onGetStarted={() => handleOpenAuth('register')}
          />
        )}
      </div>
    );
  }

  // If user is undergoing onboarding
  if (currentView === 'onboarding') {
    return (
      <div className="min-h-screen bg-[#F4F6F4] text-[#171C19]">
        <OnboardingFlow onComplete={() => setCurrentView('dashboard')} />
      </div>
    );
  }

  // Authenticated Application Shell
  return (
    <div className="flex min-h-screen bg-[#F4F6F4] text-[#171C19]">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          onNavigate={setCurrentView}
        />

        {/* Top Exploration Mode Banner */}
        {isExploring && (
          <div className="bg-[#171C19] border-b border-black/20 text-white px-4 sm:px-8 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span>
                Exploring <strong>{divisionMeta.name}</strong> in Preview Mode
              </span>
            </div>
            <div className="flex items-center gap-3">
              {registeredDivisions.length > 0 && (
                <button
                  onClick={() => setDivision(registeredDivisions[0].slug)}
                  className="text-white/70 hover:text-white underline cursor-pointer text-xs transition-colors"
                >
                  Return to {registeredDivisions[0].name.split(' ')[0]}
                </button>
              )}
              <button
                onClick={() => setCurrentView('memberships')}
                className="bg-white text-black font-semibold px-3 py-1 rounded-full text-xs hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Join {divisionMeta.name.split(' ')[0]} {currentDivision === 'student' ? '(Free)' : ''}
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {isExploring ? (
            /* In exploration mode, show ALL FEATURES of this ecosystem instead of internal member database data! */
            <>
              {currentView === 'memberships' && (
                <MembershipPlans />
              )}
              {currentView === 'settings' && (
                <UserSettings />
              )}
              {currentView === 'admin' && (
                <AdminDashboard />
              )}
              {currentView === 'scanner' && (
                <QRScannerView />
              )}
              {currentView !== 'memberships' &&
                currentView !== 'settings' &&
                currentView !== 'admin' &&
                currentView !== 'scanner' && (
                  <DivisionHub onNavigate={setCurrentView} />
                )}
            </>
          ) : (
            /* Active member workspace: full operational data access */
            <>
              {currentView === 'dashboard' && (
                <MemberDashboard onNavigate={setCurrentView} />
              )}

              {currentView === 'division-hub' && (
                <DivisionHub onNavigate={setCurrentView} />
              )}

              {currentView === 'directory' && (
                <MemberDirectory />
              )}

              {currentView === 'opportunities' && (
                <OpportunitiesList />
              )}

              {currentView === 'events' && (
                <EventsList onViewTickets={() => setCurrentView('my-tickets')} />
              )}

              {currentView === 'my-tickets' && (
                <MyTickets />
              )}

              {currentView === 'memberships' && (
                <MembershipPlans />
              )}

              {currentView === 'courses' && (
                <CoursesView onNavigateToOpportunities={() => setCurrentView('opportunities')} />
              )}

              {currentView === 'affiliate' && (
                <StudentAffiliateView />
              )}

              {currentView === 'settings' && (
                <UserSettings />
              )}

              {currentView === 'admin' && (
                <AdminDashboard />
              )}

              {currentView === 'scanner' && (
                <QRScannerView />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DivisionProvider>
        <AppContent />
      </DivisionProvider>
    </AuthProvider>
  );
}
