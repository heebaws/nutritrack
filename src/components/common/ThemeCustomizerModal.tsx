import React from 'react';
import { AccentTheme, useApp } from '../../context/AppContext';
import { Palette, Sun, Moon, Check, X, Sparkles, Bell } from 'lucide-react';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCENT_OPTIONS: Array<{
  id: AccentTheme;
  name: string;
  nameMl: string;
  desc: string;
  descMl: string;
  swatchHex: string;
  heroHex: string;
}> = [
  {
    id: 'emerald',
    name: 'Clinical Emerald',
    nameMl: 'ക്ലിനിക്കൽ എമറാൾഡ്',
    desc: 'Classic NutriTrack wellness green',
    descMl: 'ന്യൂട്രിട്രാക്ക് ഒറിജിനൽ പച്ച',
    swatchHex: '#059669',
    heroHex: '#022c22',
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    nameMl: 'ഓഷ്യൻ ബ്ലൂ',
    desc: 'Crisp clinical hydration blue',
    descMl: 'ശാന്തമായ നീല തീം',
    swatchHex: '#2563eb',
    heroHex: '#0f172a',
  },
  {
    id: 'violet',
    name: 'Royal Violet',
    nameMl: 'റോയൽ വയലറ്റ്',
    desc: 'Modern studio purple palette',
    descMl: 'വയലറ്റ് സ്റ്റുഡിയോ തീം',
    swatchHex: '#7c3aed',
    heroHex: '#2e1065',
  },
  {
    id: 'teal',
    name: 'Coastal Teal',
    nameMl: 'കോസ്റ്റൽ ടീൽ',
    desc: 'Fresh tropical mineral teal',
    descMl: 'മിനറൽ ടീൽ തീം',
    swatchHex: '#0d9488',
    heroHex: '#042f2e',
  },
  {
    id: 'amber',
    name: 'Warm Gold',
    nameMl: 'വാം ഗോൾഡ്',
    desc: 'Energetic saffron & bronze tone',
    descMl: 'സ്വർണ്ണ നിറത്തിലുള്ള തീം',
    swatchHex: '#d97706',
    heroHex: '#451a03',
  },
  {
    id: 'rose',
    name: 'Berry Rose',
    nameMl: 'ബെറി റോസ്',
    desc: 'Vibrant crimson berry accent',
    descMl: 'റോസ് ബെറി തീം',
    swatchHex: '#e11d48',
    heroHex: '#4c0519',
  },
];

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme, accentTheme, setAccentTheme, language, t, viewMode, activeClient, tips, isTipRead } = useApp();
  const isMl = language === 'ml';

  const unreadAlertsCount =
    viewMode === 'client' && activeClient
      ? tips.filter(
          (tip) =>
            (tip.targetAudience === 'all' ||
              tip.clientId === activeClient.id ||
              (tip.targetAudience === 'inactive' && activeClient.status === 'inactive')) &&
            !isTipRead(tip.id)
        ).length
      : 0;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-emerald-950 text-white px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Palette className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white leading-tight">
                {t('Customize Theme')}
              </h2>
              <p className="text-xs text-emerald-200">
                {isMl ? 'നിങ്ങളുടെ ഇഷ്ടത്തിനനുസരിച്ച് ആപ്പിന്റെ നിറവും ലൈറ്റ്/ഡാർക്ക് മോഡും മാറ്റുക' : 'Personalize app colors and Light / Dark appearance'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
          >
            <X className="w-4 h-4" />
            <span>{t('Close')}</span>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* 1. Light vs Dark Mode */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              {isMl ? 'ഡിസ്‌പ്ലേ മോഡ്' : 'Appearance Mode'}
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Sun className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-extrabold">{t('Light Mode')}</div>
                  <div className="text-[11px] opacity-75">{isMl ? 'തെളിച്ചമുള്ള പകൽ മോഡ്' : 'Bright daylight'}</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-amber-300 flex items-center justify-center shrink-0">
                  <Moon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-extrabold">{t('Dark Mode')}</div>
                  <div className="text-[11px] opacity-75">{isMl ? 'രാത്രിക്ക് അനുയോജ്യമായ ഡാർക്ക് മോഡ്' : 'Night comfort'}</div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Color Theme Palette */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isMl ? 'ആപ്പ് കളർ തീം' : 'App Color Theme'}</span>
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              {ACCENT_OPTIONS.map((opt) => {
                const isSelected = accentTheme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAccentTheme(opt.id)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/70 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border border-black/10 shadow-2xs"
                      style={{
                        background: `linear-gradient(135deg, ${opt.heroHex} 0%, ${opt.swatchHex} 100%)`,
                      }}
                    >
                      {isSelected && <Check className="w-5 h-5 text-white stroke-[3]" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                        {isMl ? opt.nameMl : opt.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {isMl ? opt.descMl : opt.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {viewMode === 'client' && activeClient && (
            <button
              type="button"
              onClick={() => {
                onClose();
                window.dispatchEvent(new CustomEvent('open-notifications'));
              }}
              className="w-full p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/35 hover:bg-amber-100/80 dark:hover:bg-amber-900/45 flex items-center justify-between gap-3 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                    {t('Notifications & Coach Reminders')}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                    {isMl ? 'ഭക്ഷണ സമയങ്ങളും കോച്ച് സന്ദേശങ്ങളും കാണുക' : 'View meal schedule alerts & coach messages'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {unreadAlertsCount > 0 && (
                  <span className="min-w-[22px] h-5.5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center tabular-nums">
                    {unreadAlertsCount}
                  </span>
                )}
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  {isMl ? 'തുറക്കുക →' : 'Open →'}
                </span>
              </div>
            </button>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              {isMl ? 'തീം സേവ് ചെയ്യുക' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
