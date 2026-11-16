import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle2, Info } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useApp } from '../../context/AppContext';

export const PWAInstallButton: React.FC<{ variant?: 'compact' | 'card' }> = ({ variant = 'card' }) => {
  const { canInstall, isInstalled, promptInstall } = usePWAInstall();
  const { osHealthInfo, t, language } = useApp();
  const isMl = language === 'ml';
  const [showInstructions, setShowInstructions] = useState(false);

  if (isInstalled) {
    if (variant === 'compact') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{t('App Installed')}</span>
        </span>
      );
    }
    return (
      <div className="bg-emerald-50/80 dark:bg-emerald-950/40 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="text-xs">
          <h4 className="font-bold text-slate-900 dark:text-white">{t('Installed App Mode Active')}</h4>
          <p className="text-slate-600 dark:text-slate-300 mt-0.5">
            {isMl
              ? 'ഇൻസ്റ്റാൾ ചെയ്ത ആപ്പിൽ ഒരിക്കൽ നോട്ടിഫിക്കേഷൻ അനുവദിച്ചാൽ ഡെസ്ക്ടോപ്പ് പോലെ കൃത്യസമയത്ത് അലേർട്ടുകൾ ലഭിക്കും.'
              : 'Notifications allowed once inside the installed app deliver meal & coach alerts reliably just like desktop.'}
          </p>
        </div>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (canInstall) {
      await promptInstall();
    } else {
      setShowInstructions(prev => !prev);
    }
  };

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
        title={t('Install NutriTrack App')}
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t('Install App')}</span>
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('Install App on Phone or Desktop')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              {isMl
                ? 'ഹോം സ്ക്രീനിലേക്ക് ഇൻസ്റ്റാൾ ചെയ്ത് ഒരിക്കൽ നോട്ടിഫിക്കേഷൻ അനുവദിച്ചാൽ ഡെസ്ക്ടോപ്പ് പോലെ തന്നെ ഫോണിലും എല്ലാ അലേർട്ടുകളും ലഭിക്കും.'
                : 'Install NutriTrack Pro & allow notifications once to receive the same reliable alerts on phone and desktop.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleInstallClick}
          className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 self-start sm:self-center"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{canInstall ? t('Install Now') : t('How to Install')}</span>
        </button>
      </div>

      {showInstructions && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            {osHealthInfo.os === 'ios' ? (
              <p>
                {isMl
                  ? 'iPhone / Safari-ൽ താഴെയുള്ള Share (📤) ബട്ടൺ തൊട്ട് "Add to Home Screen" തിരഞ്ഞെടുക്കുക, തുടർന്ന് ഇൻസ്റ്റാൾ ചെയ്ത ആപ്പ് തുറന്ന് നോട്ടിഫിക്കേഷൻ അനുവദിക്കുക.'
                  : 'On iPhone/iPad Safari: Tap Share (📤) → "Add to Home Screen", then open the installed app and allow notifications once.'}
              </p>
            ) : (
              <p>
                {isMl
                  ? 'Chrome / Edge മെനുവിൽ (⋮) നിന്ന് "Install app" അല്ലെങ്കിൽ "Add to Home screen" തിരഞ്ഞെടുക്കുക.'
                  : 'In Chrome or Edge browser menu (⋮), choose "Install app" or "Add to Home screen".'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
