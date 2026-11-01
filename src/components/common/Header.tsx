import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  ShieldCheck, 
  RotateCcw, 
  Stethoscope, 
  LayoutDashboard,
  Bot,
  Cloud,
  RefreshCw,
  Smartphone,
  LogIn,
  LogOut,
  Crown
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    activeClient,
    clients,
    quickSwitchClient,
    clientSignOut,
    activeTeamUser,
    dietitians,
    quickSwitchTeamRole,
    staffSignOut,
    resetAllData,
    cloudSyncStatus,
    lastSyncedAt,
    forceCloudSync,
  } = useApp();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo and Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-sm shadow-emerald-200">
                🥗
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-lg tracking-tight">NutriTrack</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                    Wellness Clinic
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Connected Nutrition &amp; Lifestyle Management Portal
                </p>
              </div>
            </div>

            {/* Mobile View Switcher for small screens */}
            <div className="flex md:hidden items-center bg-slate-100 p-1 rounded-lg gap-1">
              <button
                type="button"
                onClick={() => setViewMode('client')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                  viewMode === 'client' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Client</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('team')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                  viewMode === 'team' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Coach</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('login')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                  viewMode === 'login' ? 'bg-white text-purple-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5 text-purple-600" />
                <span>Login</span>
              </button>
            </div>
          </div>

          {/* Center Website Switcher: Client Web Portal vs Coach / Admin Web Portal vs Login Portal */}
          <div className="hidden md:flex items-center justify-center">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  if (activeClient) {
                    setViewMode('client');
                  } else {
                    setViewMode('login');
                  }
                }}
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'client'
                    ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span>Client Portal</span>
                <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                  {activeClient ? 'Active' : 'Login Req'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (activeTeamUser) {
                    setViewMode('team');
                  } else {
                    setViewMode('login');
                  }
                }}
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'team'
                    ? 'bg-white text-blue-800 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-blue-600" />
                <span>Coach &amp; Admin</span>
                <span className="text-[10px] uppercase font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">
                  {activeTeamUser ? 'Active' : 'Login Req'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('login')}
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'login'
                    ? 'bg-white text-purple-800 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-4 h-4 text-purple-600" />
                <span>Login Portal</span>
                <span className="text-[10px] uppercase font-bold bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded">
                  Auth
                </span>
              </button>
            </div>
          </div>

          {/* Right Side: Authenticated User Status & Logout */}
          <div className="flex items-center justify-between md:justify-end gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
            {viewMode === 'client' && activeClient ? (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 bg-emerald-50/80 px-2.5 py-1 rounded-xl border border-emerald-200 text-xs">
                  <img
                    src={activeClient.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                    alt={activeClient.name}
                    className="w-6 h-6 rounded-full object-cover border border-emerald-300"
                  />
                  <div className="text-left leading-tight">
                    <span className="font-bold text-slate-900 block truncate max-w-[130px]">{activeClient.name}</span>
                    <span className="text-[10px] text-emerald-700 font-mono font-medium">@{activeClient.username || 'client'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => clientSignOut()}
                  title="Sign out of client session and go to Login Portal"
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : viewMode === 'team' && activeTeamUser ? (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 bg-purple-50/80 px-2.5 py-1 rounded-xl border border-purple-200 text-xs">
                  <img
                    src={activeTeamUser.avatarUrl || 'https://images.unsplash.com/photo-1594824813637-27a3a93d4895?auto=format&fit=crop&q=80&w=250'}
                    alt={activeTeamUser.name}
                    className="w-6 h-6 rounded-xl object-cover border border-purple-300"
                  />
                  <div className="text-left leading-tight">
                    <span className="font-bold text-slate-900 flex items-center gap-1 truncate max-w-[140px]">
                      {activeTeamUser.name}
                      {activeTeamUser.role === 'super_admin' && <Crown className="w-3 h-3 text-purple-600 inline" />}
                    </span>
                    <span className="text-[10px] text-purple-700 font-mono font-medium">
                      {activeTeamUser.role === 'super_admin' ? 'Super Admin' : activeTeamUser.role === 'admin' ? 'Clinic Admin' : 'Coach'} • @{activeTeamUser.username || 'coach'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => staffSignOut()}
                  title="Sign out of staff session and go to Login Portal"
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In with Username &amp; Password</span>
                </button>
              </div>
            )}

            {/* Real-time Cloud Storage Sync Indicator */}
            <button
              type="button"
              onClick={() => forceCloudSync()}
              title={`Cloud Storage: ${cloudSyncStatus === 'connected' ? 'Real-Time Live (Client Phone updates show instantly to Coach)' : cloudSyncStatus === 'syncing' ? 'Syncing...' : 'Offline'}. Click to refresh.`}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                cloudSyncStatus === 'connected'
                  ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : cloudSyncStatus === 'syncing'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              <Cloud className={`w-3.5 h-3.5 ${cloudSyncStatus === 'connected' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="hidden xl:inline text-[11px]">
                {cloudSyncStatus === 'connected' ? 'Cloud Sync: Live' : cloudSyncStatus === 'syncing' ? 'Syncing...' : 'Local'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  cloudSyncStatus === 'connected'
                    ? 'bg-emerald-500 animate-pulse'
                    : cloudSyncStatus === 'syncing'
                    ? 'bg-amber-400 animate-spin'
                    : 'bg-slate-300'
                }`}
              />
            </button>

            {/* Ask AI Bot Button */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-nutribot'))}
              title="Ask NutriBot AI Assistant (Instant Food Calories & Clear Doubts)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors cursor-pointer shadow-2xs"
            >
              <Bot className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Ask AI Bot</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* Reset Data Button */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all demo records, meal logs, and measurements back to default?')) {
                  resetAllData();
                }
              }}
              title="Reset Demo Data"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
