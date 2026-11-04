import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NutriTrackLogo } from './NutriTrackLogo';
import { 
  User, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Stethoscope, 
  Crown,
  AlertCircle
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
    activeTeamUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'client' | 'coach'>(defaultTab);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          setSuccessMessage('Welcome back! Logging into client portal...');
          setTimeout(() => {
            setViewMode('client');
          }, 350);
        } else {
          // Check if it was accidentally a coach username
          const staffCheck = dietitians.find(d => 
            d.username?.toLowerCase() === cleanId.toLowerCase() || 
            d.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, '')
          );
          if (staffCheck) {
            setError(`"${cleanId}" is a Coach account. Please switch to the "Coach & Admin Login" tab to sign in.`);
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
          }, 350);
        } else {
          // Check if it was accidentally a client username
          const clientCheck = clients.find(c => 
            c.username?.toLowerCase() === cleanId.toLowerCase() || 
            c.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, '')
          );
          if (clientCheck) {
            setError(`"${cleanId}" is a Client account. Please switch to the "Client Login" tab to sign in.`);
          } else {
            setError(res.message || 'Invalid coach username or password. Please verify your credentials.');
          }
          setIsSubmitting(false);
        }
      }
    }, 300);
  };

  return (
    <div className="max-w-2xl mx-auto my-8 sm:my-14 px-4">
      
      {/* Top Clinic Branding Banner */}
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="mb-4">
          <NutriTrackLogo size="xl" subtitle="Clinical Nutrition & Diet Management System" />
        </div>
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-bold border border-emerald-200 mb-2 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Saleem Valanchery Clinic &amp; Diagnostic Centre</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Secure Portal Access
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-md mx-auto leading-relaxed">
          Sign in securely to your personal nutrition diary or clinical practitioner dashboard.
        </p>

        {/* Currently active session notice */}
        {(activeClient || activeTeamUser) && (
          <div className="mt-4 inline-flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 text-xs text-slate-600 shadow-2xs">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active Session: <b>{activeClient?.name || activeTeamUser?.name}</b>
            </span>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => setViewMode(activeClient ? 'client' : 'team')}
              className="font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
            >
              Go to Dashboard &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-9">
        {/* Role Switcher Tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl mb-7 border border-slate-200/80">
          <button
            type="button"
            onClick={() => {
              setActiveTab('client');
              setError(null);
            }}
            className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'client'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-emerald-600" />
            <span>Client Login</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
              Members
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('coach');
              setError(null);
            }}
            className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'coach'
                ? 'bg-white text-purple-800 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-purple-600" />
            <span>Coach &amp; Admin</span>
            <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Crown className="w-3 h-3 text-purple-600" />
              Staff
            </span>
          </button>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username / Phone Input */}
          <div>
            <label 
              htmlFor="portal-username"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              {activeTab === 'client' ? 'Username or Mobile Number' : 'Coach / Admin Username'}
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
                    ? 'Enter your registered username or phone' 
                    : 'Enter your coach/admin username'
                }
                autoComplete="username"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label 
              htmlFor="portal-password"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Password
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
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                tabIndex={-1}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me & Security Note */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
              />
              <span>Remember me on this browser</span>
            </label>
            <span className="text-[11px] text-slate-400">Encrypted portal login</span>
          </div>

          {/* Feedback Error Message */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-3 ${
              activeTab === 'client'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
            }`}
          >
            <span>
              {isSubmitting
                ? 'Verifying Credentials...'
                : activeTab === 'client'
                ? 'Sign In to Client Portal'
                : 'Sign In to Coach & Admin Portal'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-5 border-t border-slate-100 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure Cloud Connection</span>
          </span>
          <span>Saleem Valanchery Wellness Centre</span>
        </div>
      </div>
    </div>
  );
};
