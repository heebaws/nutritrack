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
  Flame, 
  Stethoscope, 
  HeartPulse, 
  HelpCircle,
  LogIn
} from 'lucide-react';

export const ClientAuth: React.FC = () => {
  const { clientSignIn, clients, quickSwitchClient, setViewMode } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!identifier.trim()) {
      setError('Please enter your username or registered mobile number.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your portal password.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = clientSignIn(identifier, password);
      if (!res.success) {
        setError(res.message || 'Login failed. Please verify your username and password.');
      }
      setIsSubmitting(false);
    }, 300);
  };

  const fillCredentials = (username: string, pass: string) => {
    setIdentifier(username);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="max-w-6xl mx-auto my-6 sm:my-10 px-4">
      {/* Top Banner introducing the Clinic */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-bold border border-emerald-200 mb-3 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Saleem Valanchery Wellness Clinic • Client Nutrition &amp; Diet Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Client Portal Sign In
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl mx-auto">
          Log your daily Kerala &amp; clinic meals, review your assigned diet plan, and check real-time calories &amp; macros.
        </p>
      </div>

      {/* TWO DISTINCT LOGIN COLUMNS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* LOGIN COLUMN 1: Direct Credentials Sign In Form */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-emerald-200">
                  <LogIn className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">Column 1</span>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    Client Account Sign In
                  </h2>
                </div>
              </div>
              <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200">
                Member Access
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Username or Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="username-input"
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setError(null);
                    }}
                    placeholder="e.g. sarah or rajesh or 555-0192"
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Portal Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {error && (
                  <p className="mt-2 text-xs text-rose-600 font-semibold flex items-center gap-1.5 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                    <span>⚠️</span> {error}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" defaultChecked className="rounded text-emerald-600 focus:ring-emerald-500" />
                  <span>Remember my login on this device</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-sm shadow-emerald-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
              >
                <span>{isSubmitting ? 'Verifying...' : 'Sign In to Client Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Encrypted Clinic Portal</span>
            </span>
            <span>Coach Saleem Valanchery &amp; Team</span>
          </div>
        </div>

        {/* LOGIN COLUMN 2: 1-Click Client Profiles & Staff Portal */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-amber-200">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block">Column 2</span>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    1-Click Client Accounts
                  </h2>
                </div>
              </div>
              <span className="text-[11px] font-semibold bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
                Instant Demo
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Tap <strong>Enter</strong> to instantly test client features, or <strong>Fill</strong> to populate the credentials form in Column 1:
            </p>

            {/* List of Clients */}
            <div className="space-y-3">
              {clients.slice(0, 4).map((client) => {
                const uName = client.username || client.name.split(' ')[0].toLowerCase();
                const uPass = client.password || 'password123';

                return (
                  <div
                    key={client.id}
                    className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-emerald-50/40 hover:border-emerald-300 transition-all flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={client.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                        alt={client.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 shadow-2xs"
                      />
                      <div className="truncate">
                        <div className="font-bold text-slate-900 truncate text-xs sm:text-sm">
                          {client.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                          <span>{client.goal}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-mono text-emerald-700 font-semibold">{uName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => fillCredentials(uName, uPass)}
                        title="Fill credentials into Column 1"
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Fill
                      </button>
                      <button
                        type="button"
                        onClick={() => quickSwitchClient(client.id)}
                        title="Instant 1-click enter into this client's portal"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <span>Enter</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coach / Admin Portal Link */}
            <div className="mt-4 p-3 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-blue-950">Are you a Clinic Coach or Staff?</span>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('team')}
                className="font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
              >
                Go to Coach Portal &rarr;
              </button>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-400 text-center">
            Need an account? Contact Wellness Coach Saleem Valanchery at the clinic.
          </div>
        </div>

      </div>
    </div>
  );
};
