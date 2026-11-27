import { createContext } from 'react';
import type { DivisionSlug, UserSessionProfile } from '../types/app.types';

export type DemoRole =
  | 'student'
  | 'founder'
  | 'freelancer'
  | 'business'
  | 'influencer'
  | 'investor'
  | 'admin';

export const DEMO_CREDENTIALS: Record<DemoRole, { email: string; password: string }> = {
  student: { email: 'aarav.sharma@campus.edu', password: 'Student@123456' },
  founder: { email: 'ananya.rao@apexventures.io', password: 'Founder@123456' },
  freelancer: { email: 'devansh@designstudio.in', password: 'Devansh@123456' },
  business: { email: 'meera@zestorganics.in', password: 'Meera@123456' },
  influencer: { email: 'priya@techcreator.in', password: 'Priya@123456' },
  investor: { email: 'karan@singhaniaventures.com', password: 'Karan@123456' },
  admin: { email: 'admin@eongrow.network', password: 'Admin@123456' },
};

export interface AuthContextType {
  profile: UserSessionProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, fullName: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserSessionProfile>) => void;
  joinDivision: (slug: DivisionSlug) => Promise<boolean>;
  setDemoRole: (role: DemoRole) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
