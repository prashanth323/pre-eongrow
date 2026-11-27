import React, { useState } from 'react';
import { Mail, Lock, User, X, Copy, Check, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { DEMO_CREDENTIALS, type DemoRole } from '../../context/authContextDef';
import { supabase } from '../../lib/supabase';
import { ABSTRACT_IMAGES } from '../../lib/abstractImages';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface DemoAccount {
  role: DemoRole;
  label: string;
  name: string;
  email: string;
  password: string;
  headline: string;
  icon: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'student',
    label: 'Student',
    name: 'Aarav Sharma',
    email: DEMO_CREDENTIALS.student.email,
    password: DEMO_CREDENTIALS.student.password,
    headline: 'RVCE Undergrad · Student Hub & Free Hackathons',
    icon: '🎓',
  },
  {
    role: 'founder',
    label: 'Founder & CEO',
    name: 'Ananya Rao',
    email: DEMO_CREDENTIALS.founder.email,
    password: DEMO_CREDENTIALS.founder.password,
    headline: 'CEO @ NeoFlow AI · Pitch Decks & Dealflow',
    icon: '🚀',
  },
  {
    role: 'business',
    label: 'Business MSME',
    name: 'Meera Deshmukh',
    email: DEMO_CREDENTIALS.business.email,
    password: DEMO_CREDENTIALS.business.password,
    headline: 'MD @ Zest Organics · B2B Vendor Alliances',
    icon: '💼',
  },
  {
    role: 'freelancer',
    label: 'Freelancer',
    name: 'Devansh Kapur',
    email: DEMO_CREDENTIALS.freelancer.email,
    password: DEMO_CREDENTIALS.freelancer.password,
    headline: 'Design Director · Freelance Contracts',
    icon: '🎨',
  },
  {
    role: 'influencer',
    label: 'Creator',
    name: 'Priya Nair',
    email: DEMO_CREDENTIALS.influencer.email,
    password: DEMO_CREDENTIALS.influencer.password,
    headline: 'Tech Creator (450K+) · Masterclasses',
    icon: '🌟',
  },
  {
    role: 'investor',
    label: 'Investor',
    name: 'Karan Singhania',
    email: DEMO_CREDENTIALS.investor.email,
    password: DEMO_CREDENTIALS.investor.password,
    headline: 'Managing Partner · Syndicates & Startups',
    icon: '📈',
  },
  {
    role: 'admin',
    label: 'Super Admin',
    name: 'Vikramaditya Verma',
    email: DEMO_CREDENTIALS.admin.email,
    password: DEMO_CREDENTIALS.admin.password,
    headline: 'CCO · System Ops & Gate Scanner',
    icon: '⚡',
  },
];

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  onSuccess,
}) => {
  const { signIn, signUp, setDemoRole } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(defaultMode);
  const [email, setEmail] = useState(DEMO_ACCOUNTS[0].email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS[0].password);
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedDemoRole, setSelectedDemoRole] = useState<DemoRole>('student');
  const [showAllDemoAccounts, setShowAllDemoAccounts] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  React.useEffect(() => {
    setMode(defaultMode);
    if (defaultMode === 'login') {
      setEmail(DEMO_ACCOUNTS[0].email);
      setPassword(DEMO_ACCOUNTS[0].password);
      setSelectedDemoRole('student');
    } else {
      setEmail('');
      setPassword('');
      setFullName('');
    }
    setErrorMsg('');
    setSuccessMsg('');
  }, [defaultMode, isOpen]);

  const activeDemo = DEMO_ACCOUNTS.find((a) => a.role === selectedDemoRole) || DEMO_ACCOUNTS[0];

  const handleCopyText = (text: string, key: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleSelectDemo = (acc: DemoAccount) => {
    setSelectedDemoRole(acc.role);
    setEmail(acc.email);
    setPassword(acc.password);
    setErrorMsg('');
  };

  const handleQuickDemoLogin = async (acc: DemoAccount) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setSelectedDemoRole(acc.role);
    setErrorMsg('');
    setIsLoading(true);
    try {
      if (setDemoRole) {
        await setDemoRole(acc.role);
        onSuccess();
        onClose();
      } else {
        const res = await signIn(acc.email, acc.password);
        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setErrorMsg(res.error || 'Failed to sign in');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await signIn(email, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Failed to sign in');
        } else {
          onSuccess();
          onClose();
        }
      } else if (mode === 'register') {
        const res = await signUp(email, fullName, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Failed to register');
        } else {
          onSuccess();
          onClose();
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Password reset instructions have been sent to your email.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      hideHeader
      noPadding
      maxWidth="3xl"
      className="overflow-hidden p-0 max-w-4xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[560px]">
        {/* Left Column: Premium Abstract Image Side Panel (Desktop / Tablet) */}
        <div className="relative md:col-span-5 hidden md:flex flex-col justify-between overflow-hidden bg-[#171C19] p-8 text-white select-none">
          {/* Abstract Image Background Texture */}
          <div className="absolute inset-0 z-0">
            <img
              src={mode === 'register' ? ABSTRACT_IMAGES.paperCurves : ABSTRACT_IMAGES.meshFlow}
              alt="eongrow Abstract Visual"
              className="w-full h-full object-cover opacity-65 scale-105 transition-all duration-700 ease-out"
            />
            {/* Cinematic Obsidian Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#121614] via-[#171C19]/50 to-black/40" />
            <div className="absolute inset-0 bg-radial-at-t from-white/10 via-transparent to-black/60 pointer-events-none" />
          </div>

          {/* Top Brand Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <img src="/whiteapplogo.png" alt="eongrow" className="h-6 sm:h-7 w-auto object-contain" />
          </div>

          {/* Bottom Pitch */}
          <div className="relative z-10 space-y-3">
            <h4 className="text-xl sm:text-2xl font-light text-white leading-snug tracking-tight">
              One identity to connect, collaborate, and scale across India.
            </h4>
            {mode === 'login' && (
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white/90 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                  ⚡ 7 Demo Personas Available
                </span>
                <p className="text-[11px] text-white/80 leading-snug">
                  Explore Student, Founder, Business, Freelancer, Creator, Investor, and Admin ecosystems.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Abstract Banner Strip (Visible on mobile screens < md) */}
        <div className="relative md:hidden h-20 overflow-hidden bg-[#171C19] flex-shrink-0">
          <img
            src={mode === 'register' ? ABSTRACT_IMAGES.paperCurves : ABSTRACT_IMAGES.meshFlow}
            alt="eongrow Abstract Banner"
            className="w-full h-full object-cover opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
          <div className="absolute inset-0 p-4 flex items-end justify-between text-white z-10">
            <div className="flex items-center gap-2">
              <img src="/whiteapplogo.png" alt="eongrow" className="h-5 sm:h-6 w-auto object-contain" />
            </div>
          </div>
        </div>

        {/* Right Column: Auth Form */}
        <div className="md:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-between relative bg-white overflow-y-auto max-h-[90vh]">
          {/* Close button top-right */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/[0.05] hover:bg-black/[0.1] text-neutral-600 flex items-center justify-center apple-press cursor-pointer transition-colors z-20"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div>
            {/* Header */}
            <div className="mb-5 pr-8">
              <h3 className="text-xl sm:text-2xl font-light text-[#171C19] tracking-tight">
                {mode === 'login'
                  ? 'Sign in to eongrow'
                  : mode === 'register'
                  ? 'Create Your eongrow Account'
                  : 'Reset Password'}
              </h3>
            </div>

            {/* Demo Credentials Section (Visible in login mode) */}
            {mode === 'login' && (
              <div className="mb-5 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#171C19] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Demo Credentials (1-Click Fill)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAllDemoAccounts(!showAllDemoAccounts)}
                    className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>{showAllDemoAccounts ? 'Compact View' : 'View All 7 Accounts'}</span>
                    {showAllDemoAccounts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {/* Persona selector pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 -mx-1 px-1">
                  {DEMO_ACCOUNTS.map((acc) => {
                    const isSelected = selectedDemoRole === acc.role;
                    return (
                      <button
                        key={acc.role}
                        type="button"
                        onClick={() => handleSelectDemo(acc)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer apple-press shadow-2xs ${
                          isSelected
                            ? 'bg-black text-white ring-2 ring-black/10'
                            : 'bg-black/[0.04] text-[#525854] hover:bg-black/[0.08] hover:text-[#171C19]'
                        }`}
                      >
                        <span>{acc.icon}</span>
                        <span>{acc.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Demo Account Card */}
                {!showAllDemoAccounts && activeDemo && (
                  <div className="p-3.5 rounded-2xl bg-[#F6F7F5] border border-black/[0.06] space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#171C19] truncate">
                            {activeDemo.icon} {activeDemo.name}
                          </span>
                          <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                            {activeDemo.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#818A84] truncate mt-0.5">
                          {activeDemo.headline}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuickDemoLogin(activeDemo)}
                        disabled={isLoading}
                        className="px-3.5 py-1.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 apple-press shadow-xs flex-shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Instant Login</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-black/[0.06] text-xs">
                      <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-black/[0.06]">
                        <div className="min-w-0 pr-1">
                          <span className="text-[9px] text-[#818A84] uppercase font-mono block">Email</span>
                          <span className="font-mono text-[11px] text-[#171C19] truncate block">
                            {activeDemo.email}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleCopyText(activeDemo.email, 'email', e)}
                          className="p-1 text-[#818A84] hover:text-black rounded transition-colors"
                          title="Copy Email"
                        >
                          {copiedKey === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-black/[0.06]">
                        <div className="min-w-0 pr-1">
                          <span className="text-[9px] text-[#818A84] uppercase font-mono block">Password</span>
                          <span className="font-mono text-[11px] text-[#171C19] truncate block font-bold">
                            {activeDemo.password}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleCopyText(activeDemo.password, 'password', e)}
                          className="p-1 text-[#818A84] hover:text-black rounded transition-colors"
                          title="Copy Password"
                        >
                          {copiedKey === 'password' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expanded All 7 Demo Accounts List */}
                {showAllDemoAccounts && (
                  <div className="space-y-2 p-3 rounded-2xl bg-[#F6F7F5] border border-black/[0.06] max-h-56 overflow-y-auto pr-1">
                    {DEMO_ACCOUNTS.map((acc) => {
                      const isSelected = selectedDemoRole === acc.role;
                      return (
                        <div
                          key={acc.role}
                          className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 text-xs ${
                            isSelected
                              ? 'bg-white border-black/30 shadow-2xs'
                              : 'bg-white/70 border-black/[0.05] hover:bg-white'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-[#171C19] truncate text-[11px]">
                                {acc.icon} {acc.name}
                              </span>
                              <span className="text-[9px] text-[#818A84] px-1.5 py-0.2 rounded bg-black/[0.04] font-medium flex-shrink-0">
                                {acc.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#818A84] font-mono">
                              <span className="truncate">{acc.email}</span>
                              <span>·</span>
                              <span className="font-bold text-[#171C19]">{acc.password}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleSelectDemo(acc)}
                              className="px-2 py-1 rounded-lg border border-black/[0.08] hover:bg-black/[0.05] text-[11px] font-medium"
                            >
                              Fill
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickDemoLogin(acc)}
                              className="px-2.5 py-1 rounded-lg bg-black text-white hover:bg-neutral-800 text-[11px] font-semibold"
                            >
                              Login
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-black/[0.04] border border-black/[0.08] text-[#171C19] rounded-xl text-xs font-medium">
                  {successMsg}
                </div>
              )}

              {mode === 'register' && (
                <div>
                  <label className="text-xs font-medium text-[#818A84] block mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#818A84] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-black/[0.03] border border-black/[0.08] rounded-2xl text-xs md:text-sm text-[#171C19] placeholder:text-[#818A84]/70 focus:bg-white focus:border-black/30 focus:ring-4 focus:ring-black/5 focus:outline-none transition-all shadow-2xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-[#818A84] block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#818A84] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com or .edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-black/[0.03] border border-black/[0.08] rounded-2xl text-xs md:text-sm text-[#171C19] placeholder:text-[#818A84]/70 focus:bg-white focus:border-black/30 focus:ring-4 focus:ring-black/5 focus:outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-[#818A84]">Password</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-xs text-black font-medium hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#818A84] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-black/[0.03] border border-black/[0.08] rounded-2xl text-xs md:text-sm text-[#171C19] placeholder:text-[#818A84]/70 focus:bg-white focus:border-black/30 focus:ring-4 focus:ring-black/5 focus:outline-none transition-all shadow-2xs"
                    />
                  </div>
                </div>
              )}

              <Button
                variant="primary"
                size="md"
                className="w-full font-bold apple-press mt-2"
                isLoading={isLoading}
                type="submit"
              >
                {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
              </Button>

              {/* Mode Toggles */}
              <div className="pt-2 text-center text-xs text-[#818A84]">
                {mode === 'login' ? (
                  <p>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="font-bold text-black hover:underline cursor-pointer"
                    >
                      Sign up
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="font-bold text-black hover:underline cursor-pointer"
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </Modal>
  );
};
