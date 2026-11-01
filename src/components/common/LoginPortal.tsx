import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Stethoscope, 
  LogIn,
  Crown,
  Users,
  Info
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
          ? 'Please enter your client username or mobile number (e.g. sarah, marcus, or 555-0192).'
          : 'Please enter your coach/admin username or mobile number (e.g. swabeeh, saleem, or faseela).'
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
          setSuccessMessage(`Welcome back! Authenticated client portal access.`);
          setTimeout(() => {
            setViewMode('client');
          }, 350);
        } else {
          // Check if it was accidentally a coach or super admin username
          const staffCheck = dietitians.find(d => 
            d.username?.toLowerCase() === cleanId.toLowerCase() || 
            d.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, '')
          );
          if (staffCheck) {
            setError(`"${cleanId}" is a Coach / Staff account. Switch to the "Coach & Admin Login" tab above to sign in.`);
          } else {
            setError(res.message || 'Login failed. Please verify your username and password.');
          }
          setIsSubmitting(false);
        }
      } else {
        const res = staffSignIn(cleanId, password);
        if (res.success) {
          const isSuper = cleanId.toLowerCase() === 'swabeeh' || cleanId === '9061253633';
          setSuccessMessage(
            isSuper 
              ? 'Welcome Super Admin Swabeeh! Master clinical authority unlocked.' 
              : 'Welcome Coach! Clinic administration unlocked.'
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
            setError(`"${cleanId}" is a Client account. Switch to the "Client Login" tab above to sign in.`);
          } else {
            setError(res.message || 'Login failed. Please verify your coach/admin credentials.');
          }
          setIsSubmitting(false);
        }
      }
    }, 300);
  };

  const handleFillCredentials = (user: string, pass: string, role: 'client' | 'coach') => {
    setActiveTab(role);
    setIdentifier(user);
    setPassword(pass);
    setError(null);
    setSuccessMessage(`Credentials for "${user}" filled. Click "Sign In" below to verify.`);
  };

  // Safe valid clients
  const displayClients = clients.filter(c => c && c.id && (c.name?.trim() || c.phone?.trim()));

  return (
    <div className="max-w-6xl mx-auto my-6 sm:my-10 px-4">
      
      {/* Top Clinic Branding Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-bold border border-emerald-200 mb-3 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Saleem Valanchery Wellness Clinic • Unified Login Portal</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Welcome to NutriTrack Portal
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1.5 max-w-xl mx-auto leading-relaxed">
          Sign in with your username and password to log meals, track calories &amp; hydration, or access clinical administration.
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
              Resume Dashboard &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Form on Left, Quick Test Accounts on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Credentials Sign In Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            
            {/* Role Switcher Tabs */}
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl mb-6 border border-slate-200/80">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('client');
                  setError(null);
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'client'
                    ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span>Client Login</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                  Members
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('coach');
                  setError(null);
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'coach'
                    ? 'bg-white text-blue-800 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <span>Coach &amp; Admin Login</span>
                <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded-full font-bold flex items-center gap-0.5">
                  <Crown className="w-3 h-3 text-purple-600" />
                  Staff
                </span>
              </button>
            </div>

            {/* Form Title & Context */}
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>{activeTab === 'client' ? 'Client Portal Sign In' : 'Coach & Admin Portal Sign In'}</span>
                {activeTab === 'coach' && (
                  <span className="text-xs font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md border border-purple-200">
                    Super Admin Ready
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeTab === 'client'
                  ? 'Access your daily Kerala meals, calorie trajectory, and assigned diet plan.'
                  : 'Clinic administration, edit client photos and datas, manage coaches, and edit food library.'}
              </p>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Username Input */}
              <div>
                <label 
                  htmlFor="portal-username"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  {activeTab === 'client' ? 'Username or Mobile Number' : 'Coach / Super Admin Username'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    {activeTab === 'client' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                    )}
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
                        ? 'e.g. sarah, marcus, or 5550192' 
                        : 'e.g. swabeeh (Super Admin) or saleem or faseela'
                    }
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label 
                    htmlFor="portal-password"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                  >
                    Password
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {activeTab === 'coach' ? (
                      <>Super Admin: <b className="font-mono text-purple-700">9061253633</b></>
                    ) : (
                      <>Demo password: <b className="font-mono text-slate-600">password123</b></>
                    )}
                  </span>
                </div>
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
                    placeholder={
                      activeTab === 'coach'
                        ? 'Enter password (e.g. 9061253633 for Swabeeh)'
                        : '••••••••'
                    }
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
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
                  <span>Stay signed in on this browser</span>
                </label>
                <span className="text-[11px] text-slate-400">Encrypted clinic access</span>
              </div>

              {/* Feedback Error Message */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-start gap-2 animate-in fade-in">
                  <span className="text-sm">⚠️</span>
                  <div className="flex-1">{error}</div>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
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
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-200'
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
          </div>

          {/* Footer of Form */}
          <div className="mt-8 pt-5 border-t border-slate-100 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Real-Time Cloud Synced</span>
            </span>
            <span>Super Admin Swabeeh &amp; Lead Coach Saleem Valanchery</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Quick 1-Click Demo Accounts & Pre-Fill Options (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-7 space-y-6">
          
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shadow-amber-200">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Quick-Fill Credentials
                  </h3>
                  <p className="text-[11px] text-slate-500">Tap to auto-fill or enter instantly</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                1-Click Ready
              </span>
            </div>
          </div>

          {/* Section 1: Super Admin & Coach Accounts */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600">
              <span className="flex items-center gap-1 text-purple-700">
                <Crown className="w-3.5 h-3.5 text-purple-600" />
                Coaches &amp; Admin ({dietitians.length})
              </span>
              <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-1.5 py-0.2 rounded">
                Super Admin Featured
              </span>
            </div>

            <div className="space-y-2">
              {dietitians.map((d) => {
                const uName = d.username || d.name.split(' ')[0].toLowerCase();
                const uPass = d.password || 'password123';
                const isSuper = d.id === 'super-admin-swabeeh' || uName === 'swabeeh';
                const isAdmin = d.role === 'admin' || isSuper;

                return (
                  <div
                    key={d.id}
                    className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2.5 text-xs ${
                      isSuper
                        ? 'border-purple-300 bg-purple-50/50 hover:bg-purple-100/60 shadow-2xs'
                        : 'border-slate-200 bg-slate-50/70 hover:bg-blue-50/40 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={d.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250'}
                        alt={d.name}
                        className={`w-9 h-9 rounded-xl object-cover shrink-0 border ${
                          isSuper ? 'border-purple-300' : 'border-slate-200'
                        }`}
                      />
                      <div className="truncate">
                        <div className="font-bold text-slate-900 truncate text-xs flex items-center gap-1">
                          <span>{d.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                            isSuper
                              ? 'bg-purple-200 text-purple-900 border border-purple-300'
                              : isAdmin
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {isSuper ? 'Super Admin' : isAdmin ? 'Admin' : 'Coach'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                          User: <b className="text-purple-700 font-bold">{uName}</b> • Pass: <b className="text-slate-800">{uPass}</b>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={() => handleFillCredentials(uName, uPass, 'coach')}
                        title="Insert username & password into login form"
                        className={`px-3 py-1.5 font-bold rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-2xs ${
                          isSuper 
                            ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Insert</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Clients List */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600">
              <span className="flex items-center gap-1 text-emerald-700">
                <Users className="w-3.5 h-3.5" />
                Client Accounts ({displayClients.length})
              </span>
              <span className="text-[10px] text-slate-400 font-normal">All pass: password123</span>
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {displayClients.slice(0, 5).map((client) => {
                const uName = client.username || client.name.split(' ')[0].toLowerCase();
                const uPass = client.password || 'password123';

                return (
                  <div
                    key={client.id}
                    className="p-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-emerald-50/40 hover:border-emerald-300 transition-all flex items-center justify-between gap-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={client.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                        alt={client.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200"
                      />
                      <div className="truncate">
                        <div className="font-bold text-slate-900 truncate text-xs flex items-center gap-1">
                          <span>{client.name}</span>
                          <span className={`text-[9px] px-1 py-0.2 rounded-full font-bold uppercase ${
                            client.status === 'inactive' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            ({client.status || 'Active'})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono truncate flex items-center gap-1.5 mt-0.5">
                          <span>User: <b className="text-emerald-700 font-bold">{uName}</b></span>
                          <span className="text-slate-300">•</span>
                          <span>Pass: <b className="text-slate-700">{uPass}</b></span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={() => handleFillCredentials(uName, uPass, 'client')}
                        title="Insert username & password into login form"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Insert</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Registration Notice */}
          <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-200 text-xs text-purple-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              Super Admin <b>Swabeeh</b> has master privileges across the clinic: full authority to edit client photos and metrics, manage coaches, and delete library items without affecting clients' logged history.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
