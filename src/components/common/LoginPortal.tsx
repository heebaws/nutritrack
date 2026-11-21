import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NutriTrackLogo } from './NutriTrackLogo';
import { CLINICAL_DISCLAIMER } from '../../utils/clinicalSafety';
import {
  User,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  Stethoscope,
  AlertCircle,
  Sparkles,
  Activity,
  Salad,
  HeartHandshake,
} from 'lucide-react';

interface LoginPortalProps {
  defaultTab?: 'client' | 'coach';
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ defaultTab = 'client' }) => {
  const {
    clients,
    dietitians,
    clientSignIn,
    staffSignIn,
    setViewMode,
    activeClient,
    activeTeamUser,
    language,
    t,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'client' | 'coach'>(defaultTab);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    const handleOpenCoach = () => {
      setActiveTab('coach');
      setError(null);
      setSuccessMessage(null);
    };
    const handleOpenClient = () => {
      setActiveTab('client');
      setError(null);
      setSuccessMessage(null);
    };
    window.addEventListener('open-coach-login', handleOpenCoach);
    window.addEventListener('open-client-login', handleOpenClient);
    return () => {
      window.removeEventListener('open-coach-login', handleOpenCoach);
      window.removeEventListener('open-client-login', handleOpenClient);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanId = identifier.trim();
    if (!cleanId) {
      setError(
        activeTab === 'client'
          ? 'Please enter your client username or registered mobile number.'
          : 'Please enter your coach/admin username or registered mobile number.'
      );
      return;
    }

    if (!password.trim()) {
      setError('Please enter your account password.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      if (activeTab === 'client') {
        const res = clientSignIn(cleanId, password);
        if (res.success) {
          setSuccessMessage('Welcome back! Opening your wellness dashboard...');
          setTimeout(() => {
            setViewMode('client');
          }, 300);
        } else {
          const staffCheck = dietitians.find(
            (d) =>
              d.username?.toLowerCase() === cleanId.toLowerCase() ||
              d.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, '')
          );
          if (staffCheck) {
            setError(`"${cleanId}" is a Coach account. Touch the NutriTrack logo above to open Coach Login.`);
          } else {
            setError(res.message || 'Invalid username or password. Please try again.');
          }
          setIsSubmitting(false);
        }
      } else {
        const res = staffSignIn(cleanId, password);
        if (res.success) {
          const isSuper = cleanId.toLowerCase() === 'swabeeh' || cleanId === '9061253633';
          setSuccessMessage(
            isSuper
              ? 'Welcome Super Admin Swabeeh! Master clinical authority verified.'
              : 'Welcome Coach! Clinical administration unlocked.'
          );
          setTimeout(() => {
            setViewMode('team');
          }, 300);
        } else {
          const clientCheck = clients.find(
            (c) =>
              c.username?.toLowerCase() === cleanId.toLowerCase() ||
              c.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, '')
          );
          if (clientCheck) {
            setError(`"${cleanId}" is a Client account. Switch back to Client Login to sign in.`);
          } else {
            setError(res.message || 'Invalid coach username or password. Please verify your credentials.');
          }
          setIsSubmitting(false);
        }
      }
    }, 250);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pt-6 sm:pt-10 pb-8">
      {/* Editorial Hero + Solo Login Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left: Value Proposition & Benefit Highlights */}
        <section className="lg:col-span-6 space-y-5 lg:pt-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setActiveTab((prev) => (prev === 'client' ? 'coach' : 'client'));
                setError(null);
                setSuccessMessage(null);
              }}
              className="text-left cursor-pointer rounded-2xl p-1.5 -ml-1.5 hover:bg-white/70 dark:hover:bg-slate-900/60 transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              aria-label="NutriTrack Logo — Touch to toggle Coach Portal Login"
              title="Touch NutriTrack logo to switch Coach Login"
            >
              <NutriTrackLogo size="lg" subtitle="Eat smart. Live strong." />
            </button>
          </div>

          <div className="space-y-3">
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#122119] dark:text-[#F2F7F3] leading-[1.15]">
              {activeTab === 'coach'
                ? language === 'ml'
                  ? 'കോച്ച് & ക്ലിനിക്കൽ അഡ്മിൻ പോർട്ടൽ'
                  : 'Precision coaching for calmer, lasting client health.'
                : language === 'ml'
                ? 'നിങ്ങളുടെ ആരോഗ്യവും ഭക്ഷണക്രമവും ശാസ്ത്രീയമായി അറിയാം.'
                : 'Calm, clinical-grade nutrition built around your daily life.'}
            </h1>
            <p className="text-sm sm:text-base text-[#52675B] dark:text-[#A1B5A9] leading-relaxed max-w-xl">
              Track regional Kerala and global meals, visualize your progress on a living face-matched avatar, and follow adaptive daily diet and training plans backed by safe clinical limits.
            </p>
          </div>

          {/* 3 Clean Benefit Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 pt-1">
            <div className="bg-white/90 dark:bg-[#122019]/90 border border-[#DCE6DE] dark:border-[#24392E] rounded-2xl p-3.5 shadow-2xs flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-extrabold text-[#122119] dark:text-white">
                  Face-Matched Living Avatar
                </h2>
                <p className="text-[11px] text-[#52675B] dark:text-[#A1B5A9] mt-0.5 leading-snug">
                  On-device facial geometry meets real-time nutrition balance and posture trends.
                </p>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-[#122019]/90 border border-[#DCE6DE] dark:border-[#24392E] rounded-2xl p-3.5 shadow-2xs flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-[#E06D53] flex items-center justify-center shrink-0">
                <Salad className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-extrabold text-[#122119] dark:text-white">
                  Adaptive Diet &amp; Exercise Engine
                </h2>
                <p className="text-[11px] text-[#52675B] dark:text-[#A1B5A9] mt-0.5 leading-snug">
                  Allergy-safe meal swaps, 8,000 kcal trajectory projections, and smart workouts.
                </p>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-[#122019]/90 border border-[#DCE6DE] dark:border-[#24392E] rounded-2xl p-3.5 shadow-2xs flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-extrabold text-[#122119] dark:text-white">
                  Honest Monthly Cheat Accountability
                </h2>
                <p className="text-[11px] text-[#52675B] dark:text-[#A1B5A9] mt-0.5 leading-snug">
                  1 mindful treat per month with encouraging next-day movement challenges and weekly digests.
                </p>
              </div>
            </div>
          </div>

          {activeClient || activeTeamUser ? (
            <div className="inline-flex items-center gap-3 bg-white dark:bg-[#122019] px-4 py-2.5 rounded-2xl border border-[#DCE6DE] dark:border-[#24392E] text-xs text-[#52675B] dark:text-[#A1B5A9] shadow-2xs">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Active Session: <b className="text-[#122119] dark:text-white">{activeClient?.name || activeTeamUser?.name}</b>
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button
                type="button"
                onClick={() => setViewMode(activeClient ? 'client' : 'team')}
                className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Open Dashboard &rarr;
              </button>
            </div>
          ) : null}
        </section>

        {/* Right: Clean Solo Client Login Card (Coach opens on NutriTrack Logo tap) */}
        <section className="lg:col-span-6">
          <div className="bg-white dark:bg-[#122019] rounded-3xl shadow-sm border border-[#DCE6DE] dark:border-[#24392E] p-6 sm:p-8">
            {activeTab === 'coach' ? (
              <div className="flex items-center justify-between gap-2 pb-4 mb-5 border-b border-purple-100 dark:border-purple-900/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-purple-950 dark:text-purple-200">
                      {t('Coach & Admin')}
                    </div>
                    <div className="text-[11px] text-[#52675B] dark:text-[#A1B5A9]">
                      {language === 'ml' ? 'ക്ലിനിക്കൽ ടീം പ്രവേശനം' : 'Clinical nutritionist & admin access'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('client');
                    setError(null);
                  }}
                  className="text-xs font-bold text-[#122119] dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 px-3 py-1.5 rounded-xl bg-[#EDF3EE] dark:bg-[#172820] transition-colors cursor-pointer"
                >
                  &larr; {t('Client Login')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 pb-4 mb-5 border-b border-[#DCE6DE] dark:border-[#24392E]">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-[#122119] dark:text-white">
                    {t('Client Login')}
                  </div>
                  <div className="text-[11px] text-[#52675B] dark:text-[#A1B5A9]">
                    {language === 'ml'
                      ? 'നിങ്ങളുടെ യൂസർനെയിം അല്ലെങ്കിൽ മൊബൈൽ നമ്പർ ഉപയോഗിച്ച് ലോഗിൻ ചെയ്യുക'
                      : 'Sign in with your username, email, or registered mobile'}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="portal-username"
                  className="block text-xs font-bold uppercase tracking-wider text-[#122119] dark:text-slate-200 mb-1.5"
                >
                  {activeTab === 'client' ? t('Username or Mobile Number') : t('Coach / Admin Username')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="portal-username"
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setError(null);
                    }}
                    placeholder={
                      activeTab === 'client'
                        ? 'Enter your username or mobile number'
                        : 'Enter your coach/admin username'
                    }
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF8F3] dark:bg-[#0B1410] border border-[#DCE6DE] dark:border-[#24392E] rounded-xl text-[#122119] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium focus:bg-white dark:focus:bg-[#172820] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="portal-password"
                  className="block text-xs font-bold uppercase tracking-wider text-[#122119] dark:text-slate-200 mb-1.5"
                >
                  {t('Password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="portal-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-3 bg-[#FAF8F3] dark:bg-[#0B1410] border border-[#DCE6DE] dark:border-[#24392E] rounded-xl text-[#122119] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium focus:bg-white dark:focus:bg-[#172820] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#52675B] dark:text-[#A1B5A9] pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                  />
                  <span>{t('Remember me on this browser')}</span>
                </label>
                <span className="text-[11px] opacity-80">On-device face privacy</span>
              </div>

              {error && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1">{error}</div>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2 active:scale-[0.99] ${
                  activeTab === 'client'
                    ? 'bg-emerald-700 hover:bg-emerald-800'
                    : 'bg-purple-700 hover:bg-purple-800'
                }`}
              >
                <span>
                  {isSubmitting
                    ? 'Verifying...'
                    : activeTab === 'client'
                    ? t('Sign In to Client Portal')
                    : t('Sign In to Coach & Admin Portal')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#DCE6DE] dark:border-[#24392E] text-xs text-[#52675B] dark:text-[#A1B5A9] flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Real-time Cloud Sync</span>
              </span>
              <span>Saleem Valanchery Wellness Centre</span>
            </div>
          </div>
        </section>
      </div>

      {/* Clean Wellness Footer */}
      <footer className="mt-10 pt-5 border-t border-[#DCE6DE] dark:border-[#24392E] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#52675B] dark:text-[#A1B5A9]">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <span>{CLINICAL_DISCLAIMER}</span>
        </div>
        <span className="shrink-0 font-semibold">NutriTrack v2 · Eat smart. Live strong.</span>
      </footer>
    </div>
  );
};
