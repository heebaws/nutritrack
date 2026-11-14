import React from 'react';
import { useApp } from '../../context/AppContext';
import { NutriTrackLogo } from './NutriTrackLogo';
import { 
  Bot,
  Cloud,
  LogIn,
  LogOut,
  Crown,
  Flame,
  Languages,
  Sun,
  Moon
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
    language,
    toggleLanguage,
    theme,
    toggleTheme,
    t,
  } = useApp();

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-2xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo and Brand */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setViewMode(activeClient ? 'client' : activeTeamUser ? 'team' : 'login')}
              className="text-left cursor-pointer hover:opacity-95 transition-opacity whitespace-nowrap shrink-0"
              title="NutriTrack Portal Home"
            >
              <NutriTrackLogo size="md" subtitle={t('Connected Nutrition & Lifestyle Portal')} />
            </button>

            {/* Mobile View: Theme + Translate + Login Portal */}
            <div className="flex md:hidden items-center gap-1.5">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? t('Light Mode') : t('Dark Mode')}
                title={theme === 'dark' ? t('Light Mode') : t('Dark Mode')}
                className={`p-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
                  theme === 'dark'
                    ? 'bg-amber-950/60 text-amber-300 border-amber-700/70 hover:bg-amber-900/60'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={toggleLanguage}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 ${
                  language === 'ml'
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="Switch English / Malayalam"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{language === 'ml' ? 'EN' : 'മലയാളം'}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('login')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border whitespace-nowrap shrink-0 ${
                  viewMode === 'login'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('Login Portal')}</span>
              </button>
            </div>
          </div>

          {/* Center: Login Portal */}
          <div className="hidden md:flex items-center justify-center">
            <button
              type="button"
              onClick={() => setViewMode('login')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer border whitespace-nowrap shrink-0 ${
                viewMode === 'login'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              <LogIn className={`w-4 h-4 ${viewMode === 'login' ? 'text-purple-200' : 'text-purple-600 dark:text-purple-400'}`} />
              <span>{t('Login Portal')}</span>
            </button>
          </div>

          {/* Right Side: Authenticated User Status, Theme Switch, Translation Switch & Logout */}
          <div className="flex items-center justify-between md:justify-end gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100 dark:border-slate-800">
            {viewMode === 'client' && activeClient ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-emerald-50/80 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs">
                  <img
                    src={activeClient.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                    alt={activeClient.name}
                    className="w-6 h-6 rounded-full object-cover border border-emerald-300 dark:border-emerald-700"
                  />
                  <div className="text-left leading-tight">
                    <span className="font-bold text-slate-900 dark:text-white block truncate max-w-[130px]">{activeClient.name}</span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-mono font-medium">@{activeClient.username || 'client'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-calorie-guide'))}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700 rounded-xl transition-all shadow-2xs cursor-pointer whitespace-nowrap shrink-0"
                  title="Learn What is a Calorie, Detection, and Human Requirements"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{t('Calorie 101')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => clientSignOut()}
                  title="Sign out of client session and go to Login Portal"
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('Sign Out')}</span>
                </button>
              </div>
            ) : viewMode === 'team' && activeTeamUser ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-purple-50/80 dark:bg-purple-950/50 px-2.5 py-1 rounded-xl border border-purple-200 dark:border-purple-800 text-xs">
                  <img
                    src={activeTeamUser.avatarUrl || 'https://images.unsplash.com/photo-1594824813637-27a3a93d4895?auto=format&fit=crop&q=80&w=250'}
                    alt={activeTeamUser.name}
                    className="w-6 h-6 rounded-xl object-cover border border-purple-300 dark:border-purple-700"
                  />
                  <div className="text-left leading-tight">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1 truncate max-w-[140px]">
                      {activeTeamUser.name}
                      {activeTeamUser.role === 'super_admin' && <Crown className="w-3 h-3 text-purple-600 dark:text-purple-400 inline" />}
                    </span>
                    <span className="text-[10px] text-purple-700 dark:text-purple-300 font-mono font-medium">
                      {activeTeamUser.role === 'super_admin' ? 'Super Admin' : activeTeamUser.role === 'admin' ? t('Centre Administrator') : t('Coach')} · @{activeTeamUser.username || 'coach'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => staffSignOut()}
                  title="Sign out of staff session and go to Login Portal"
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('Sign Out')}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t('Sign In with Username & Password')}</span>
                </button>
              </div>
            )}

            {/* Desktop Light / Dark Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? t('Light Mode') : t('Dark Mode')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                theme === 'dark'
                  ? 'bg-slate-800 text-amber-300 border-amber-700/60 hover:bg-slate-700'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
              <span className="hidden lg:inline">{theme === 'dark' ? t('Light Mode') : t('Dark Mode')}</span>
            </button>

            {/* EN <-> Malayalam Translation Switch */}
            <button
              type="button"
              onClick={toggleLanguage}
              title={language === 'ml' ? 'Switch all site text to English' : 'മലയാളത്തിലേക്ക് മാറ്റുക (Translate to Malayalam)'}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                language === 'ml'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-800 dark:hover:text-emerald-300 hover:border-emerald-200'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{language === 'ml' ? 'മലയാളം ✓ · EN' : 'EN / മലയാളം'}</span>
            </button>

            {/* Real-time Cloud Storage Sync Indicator */}
            <button
              type="button"
              onClick={() => forceCloudSync()}
              title={`Cloud Storage: ${cloudSyncStatus === 'connected' ? 'Real-Time Live' : cloudSyncStatus === 'syncing' ? 'Syncing...' : 'Offline'}. Click to refresh.`}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                cloudSyncStatus === 'connected'
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                  : cloudSyncStatus === 'syncing'
                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Cloud className={`w-3.5 h-3.5 ${cloudSyncStatus === 'connected' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
              <span className="hidden xl:inline text-[11px]">
                {cloudSyncStatus === 'connected' ? t('Cloud Sync: Live') : cloudSyncStatus === 'syncing' ? t('Syncing...') : t('Local')}
              </span>
            </button>

            {/* Ask AI Bot Button */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-nutribot'))}
              title="Ask NutriBot AI Assistant"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/70 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
            >
              <Bot className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">{t('Ask AI Bot')}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
