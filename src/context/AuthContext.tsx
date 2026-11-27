import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DataService } from '../services/dataService';
import type { DivisionSlug, UserSessionProfile } from '../types/app.types';
import { AuthContext, DEMO_CREDENTIALS, type DemoRole } from './authContextDef';

const DEMO_PROFILES: Record<DemoRole, UserSessionProfile> = {
  student: {
    id: 'd0000000-0000-0000-0000-000000000003',
    email: 'aarav.sharma@campus.edu',
    fullName: 'Aarav Sharma',
    displayName: 'Aarav',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    headline: 'Computer Science Undergrad @ RVCE | Full-Stack Enthusiast',
    bio: 'Passionate about distributed systems, AI tools, and building student tech communities.',
    city: 'Bangalore',
    state: 'Karnataka',
    verificationLevel: 'contact_verified',
    roles: ['member'],
    joinedDivisions: ['student', 'freelancer'],
    currentDivision: 'student',
  },
  founder: {
    id: 'd0000000-0000-0000-0000-000000000002',
    email: 'ananya.rao@apexventures.io',
    fullName: 'Ananya Rao',
    displayName: 'Ananya',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    headline: 'Founder & CEO @ NeoFlow AI | Tech Entrepreneur',
    bio: 'Building autonomous workflow agents for Indian MSMEs. Looking for tech leads & angel co-investors.',
    city: 'Hyderabad',
    state: 'Telangana',
    gender: 'female',
    isWomenDiscountEligible: true,
    verificationLevel: 'business_verified',
    roles: ['member'],
    joinedDivisions: ['entrepreneur', 'business', 'investor'],
    currentDivision: 'entrepreneur',
  },
  freelancer: {
    id: 'd0000000-0000-0000-0000-000000000004',
    email: 'devansh@designstudio.in',
    fullName: 'Devansh Kapur',
    displayName: 'Devansh',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    headline: 'Independent Design Director & Brand Strategist',
    bio: 'Crafting high-conversion SaaS web applications, design systems, and brand identities.',
    city: 'Delhi-NCR',
    state: 'Delhi',
    verificationLevel: 'professionally_verified',
    roles: ['member'],
    joinedDivisions: ['freelancer', 'career'],
    currentDivision: 'freelancer',
  },
  business: {
    id: 'd0000000-0000-0000-0000-000000000005',
    email: 'meera@zestorganics.in',
    fullName: 'Meera Deshmukh',
    displayName: 'Meera',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
    headline: 'Managing Director @ Zest Organics India | MSME Leader',
    bio: 'Scaling sustainable packaging and B2B industrial distribution across western India.',
    city: 'Pune',
    state: 'Maharashtra',
    gender: 'female',
    isWomenDiscountEligible: true,
    verificationLevel: 'business_verified',
    roles: ['member'],
    joinedDivisions: ['business'],
    currentDivision: 'business',
  },
  influencer: {
    id: 'd0000000-0000-0000-0000-000000000006',
    email: 'priya@techcreator.in',
    fullName: 'Priya Nair',
    displayName: 'Priya',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    headline: 'Tech & Startup Creator (450K+ Community)',
    bio: 'Covering the Indian startup ecosystem, AI breakthroughs, and founder journeys across YouTube and LinkedIn.',
    city: 'Mumbai',
    state: 'Maharashtra',
    gender: 'female',
    isWomenDiscountEligible: true,
    verificationLevel: 'identity_verified',
    roles: ['member'],
    joinedDivisions: ['influencer', 'freelancer'],
    currentDivision: 'influencer',
  },
  investor: {
    id: 'd0000000-0000-0000-0000-000000000007',
    email: 'karan@singhaniaventures.com',
    fullName: 'Karan Singhania',
    displayName: 'Karan',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
    headline: 'Managing Partner @ Singhania Ventures | Angel Syndicate Lead',
    bio: 'Backing bold Indian founders across SaaS, FinTech, and DeepTech at Pre-Seed & Seed stages.',
    city: 'Mumbai',
    state: 'Maharashtra',
    verificationLevel: 'special_credentials',
    roles: ['member'],
    joinedDivisions: ['investor', 'entrepreneur'],
    currentDivision: 'investor',
  },
  admin: {
    id: 'd0000000-0000-0000-0000-000000000001',
    email: 'admin@eongrow.network',
    fullName: 'Vikramaditya Verma',
    displayName: 'Vikram',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    headline: 'Chief Community Officer & Super Admin @ eongrow',
    bio: 'Managing 7 network divisions, city chapters, and premier summit activations across India.',
    city: 'New Delhi',
    state: 'Delhi',
    verificationLevel: 'special_credentials',
    roles: ['super_admin', 'admin', 'event_organiser'],
    joinedDivisions: ['student', 'career', 'freelancer', 'entrepreneur', 'business', 'influencer', 'investor'],
    currentDivision: 'student',
  },
};

async function fetchUserProfile(userId: string): Promise<UserSessionProfile | null> {
  try {
    const { data: profileData, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileErr || !profileData) return null;

    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('is_active', true);

    const { data: membershipsData } = await supabase
      .from('user_division_memberships')
      .select('divisions(slug)')
      .eq('user_id', userId)
      .eq('status', 'active');

    const userRoles = (rolesData?.map((r) => r.role) || ['member']) as any[];
    const joined = (membershipsData?.map((m: any) => m.divisions?.slug).filter(Boolean) || ['student']) as DivisionSlug[];

    return {
      id: profileData.id,
      email: profileData.email || '',
      fullName: profileData.full_name || 'Member',
      displayName: profileData.display_name || profileData.full_name?.split(' ')[0] || 'Member',
      avatarUrl: profileData.avatar_url || '',
      headline: profileData.headline || 'eongrow Member',
      bio: profileData.bio || '',
      city: profileData.city || 'India',
      state: profileData.state || '',
      gender: profileData.gender || undefined,
      isWomenDiscountEligible: profileData.is_women_discount_eligible ?? (profileData.gender?.toLowerCase() === 'female'),
      verificationLevel: profileData.verification_level || 'unverified',
      roles: userRoles.length > 0 ? userRoles : ['member'],
      joinedDivisions: joined.length > 0 ? joined : ['student'],
      currentDivision: joined[0] || 'student',
    };
  } catch (err) {
    console.warn('fetchUserProfile note:', err);
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserSessionProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync Supabase Auth session
  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured) {
      setProfile(null);
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    // Check for referral code in URL query string on startup
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref') || urlParams.get('referral');
      if (refCode) {
        localStorage.setItem('ngf_referral_code', refCode.trim().toUpperCase());
      }
    } catch {}

    async function loadSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const dbProfile = await fetchUserProfile(session.user.id);
          if (dbProfile && isMounted) {
            setProfile(dbProfile);
            setIsLoading(false);
            return;
          }
        }

        // No active session: keep profile null so user is a guest visitor
        if (isMounted) {
          setProfile(null);
        }
      } catch (err) {
        console.warn('Session load note:', err);
        if (isMounted) {
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user && isMounted) {
        const dbProfile = await fetchUserProfile(session.user.id);
        if (dbProfile && isMounted) {
          setProfile(dbProfile);
        }
      } else if (!session && isMounted) {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      if (password) {
        // Attempt authentic Supabase auth first
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (!error && data.user) {
            const dbProfile = await fetchUserProfile(data.user.id);
            if (dbProfile) {
              setProfile(dbProfile);
              return { success: true };
            }
          }
        } catch (authErr) {
          console.warn('Supabase auth attempt notice:', authErr);
        }

        // Demo accounts fallback matching
        const matchedDemoRole = (Object.keys(DEMO_CREDENTIALS) as DemoRole[]).find(
          (role) =>
            DEMO_CREDENTIALS[role].email.toLowerCase() === email.trim().toLowerCase() &&
            DEMO_CREDENTIALS[role].password === password
        );

        if (matchedDemoRole) {
          setProfile(DEMO_PROFILES[matchedDemoRole]);
          return { success: true };
        }
      }
      return { success: false, error: 'Invalid credentials. Please verify your email or use a demo account.' };
    } catch (err: any) {
      // Final fallback check for demo account match
      const matchedDemoRole = (Object.keys(DEMO_CREDENTIALS) as DemoRole[]).find(
        (role) =>
          DEMO_CREDENTIALS[role].email.toLowerCase() === email.trim().toLowerCase() &&
          DEMO_CREDENTIALS[role].password === password
      );
      if (matchedDemoRole) {
        setProfile(DEMO_PROFILES[matchedDemoRole]);
        return { success: true };
      }
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, fullName: string, password?: string) => {
    setIsLoading(true);
    try {
      if (!password) {
        return { success: false, error: 'Password is required' };
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
      if (data.user) {
        // Automatically attribute referral if user registered with a referral code
        try {
          const storedRef = localStorage.getItem('ngf_referral_code');
          if (storedRef) {
            await DataService.recordReferral(storedRef, data.user.id);
            localStorage.removeItem('ngf_referral_code');
          }
        } catch (refErr) {
          console.warn('Referral attribution notice:', refErr);
        }

        const dbProfile = await fetchUserProfile(data.user.id);
        if (dbProfile) {
          setProfile(dbProfile);
        }
        return { success: true };
      }
      return { success: false, error: 'Could not create account' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Signup failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const updateProfile = (updates: Partial<UserSessionProfile>) => {
    if (!profile) return;
    setProfile({ ...profile, ...updates });
  };

  const joinDivision = async (slug: DivisionSlug): Promise<boolean> => {
    if (!profile) return false;
    if (profile.joinedDivisions.includes(slug)) return true;

    // Join via Supabase DB function
    try {
      const { error } = await supabase.rpc('join_division', {
        _division_slug: slug,
        _plan_slug: 'free-basic',
        _division_profile: {},
      });
      if (error) {
        console.warn('Backend join RPC warning:', error);
      }
    } catch (err) {
      console.warn('Backend join RPC fallback:', err);
    }

    setProfile({
      ...profile,
      joinedDivisions: [...profile.joinedDivisions, slug],
      currentDivision: slug,
    });
    return true;
  };

  const setDemoRole = async (role: DemoRole) => {
    setIsLoading(true);
    try {
      const creds = DEMO_CREDENTIALS[role];
      if (creds) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: creds.email,
          password: creds.password,
        });
        if (!error && data.user) {
          const dbProfile = await fetchUserProfile(data.user.id);
          if (dbProfile) {
            setProfile(dbProfile);
            return;
          }
        }
      }
      setProfile(DEMO_PROFILES[role]);
    } catch (err) {
      console.warn('Persona switch fallback:', err);
      setProfile(DEMO_PROFILES[role]);
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = Boolean(profile?.roles?.some((r) => r === 'admin' || r === 'super_admin'));
  const isSuperAdmin = Boolean(profile?.roles?.includes('super_admin'));

  return (
    <AuthContext.Provider
      value={{
        profile,
        isLoading,
        isAdmin,
        isSuperAdmin,
        signIn,
        signUp,
        signOut,
        updateProfile,
        joinDivision,
        setDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
