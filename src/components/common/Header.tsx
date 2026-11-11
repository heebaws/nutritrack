import React from 'react';
import { useApp } from '../../context/AppContext';
import { NutriTrackLogo } from './NutriTrackLogo';
import { 
  Bot,
  Cloud,
  LogIn,
  LogOut,
  Crown,
  Flame
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    activeClient,
    clientSignOut,
    activeTeamUser,
    staffSignOut,
    cloudSyncStatus,
    forceCloudSync,
  } = useApp();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo and Brand */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMode(activeClient ? 'client' : activeTeamUser ? 'team' : 'login')}
              className="text-left cursor-pointer hover:opacity-95 transition-opacity"
              title="NutriTrack Portal Home"
            >
              <NutriTrackLogo size="md" subtitle="Connected Nutrition & Lifestyle Portal" />
            </button>

            {/* Mobile View: Only Login Portal */}
            <div className="flex md:hidden items-center">
              <button
                type="button"
                onClick={() => setViewMode('login')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border ${
                  viewMode === 'login'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login Portal</span>
              </button>
            </div>
          </div>

          {/* Center: Upper bar only has the Login Portal from the three portals */}
          <div className="hidden md:flex items-center justify-center">
            <button
              type="button"
              onClick={() => setViewMode('login')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer border ${
                viewMode === 'login'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <LogIn className="w-4 h-4 text-purple-200" />
              <span>Login Portal</span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                viewMode === 'login'
                  ? 'bg-purple-700 text-purple-100'
                  : 'bg-purple-100 text-purple-800'
              }`}>
                Auth
              </span>
            </button>
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
                  onClick={() => window.dispatchEvent(new CustomEvent('open-calorie-guide'))}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-xl transition-all shadow-2xs cursor-pointer"
                  title="Learn What is a Calorie, Detection, and Human Requirements"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  <span>Calorie 101</span>
                </button>

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
                      {activeTeamUser.role === 'super_admin' ? 'Super Admin' : activeTeamUser.role === 'admin' ? 'Centre Admin' : 'Coach'} • @{activeTeamUser.username || 'coach'}
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
          </div>

        </div>
      </div>
    </header>
  );
};
