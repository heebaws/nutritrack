import React, { useMemo, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { parseHealthExportFile } from '../../utils/deviceHealthSync';
import {
  X,
  Moon,
  Plus,
  Minus,
  Smartphone,
  Upload,
  CheckCircle2,
} from 'lucide-react';

interface SleepModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SleepModal: React.FC<SleepModalProps> = ({ isOpen, onClose }) => {
  const {
    activeClient,
    selectedDate,
    habits,
    updateDailyHabits,
    osHealthInfo,
    t,
    language,
  } = useApp();
  const isMl = language === 'ml';

  const [importNote, setImportNote] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentHabit = useMemo(() => {
    if (!activeClient) return null;
    const found = habits.find(h => h.clientId === activeClient.id && h.date === selectedDate);
    if (found) return found;
    return {
      id: 'hab-temp',
      clientId: activeClient.id,
      date: selectedDate,
      steps: 0,
      targetSteps: 8000,
      sleepHours: 7.0,
      supplementsTaken: false,
      saladEaten: false,
      stretchingDone: false,
    };
  }, [habits, activeClient?.id, selectedDate]);

  if (!isOpen || !activeClient || !currentHabit) return null;

  const sleepHours = currentHabit.sleepHours ?? 7.0;
  const pct = Math.min(100, Math.round((sleepHours / 8.0) * 100));
  const sleepOptimal = sleepHours >= 7.0;

  const handleSetSleep = (hours: number) => {
    const clamped = Math.min(14, Math.max(2, Math.round(hours * 2) / 2));
    updateDailyHabits(selectedDate, {
      sleepHours: clamped,
      sleepSource: 'manual',
      lastDeviceSyncAt: new Date().toISOString(),
    });
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseHealthExportFile(String(reader.result || ''), selectedDate);
      if (parsed.sleepHours !== undefined) {
        updateDailyHabits(selectedDate, {
          sleepHours: parsed.sleepHours,
          sleepSource: 'health_import',
          lastDeviceSyncAt: new Date().toISOString(),
        });
        setImportNote(
          isMl
            ? `${parsed.sourceNote}: ${parsed.sleepHours} മണിക്കൂർ ഉറക്കം ചേർത്തു.`
            : `${parsed.sourceNote}: synced ${parsed.sleepHours} hours sleep.`
        );
      } else {
        setImportNote(parsed.sourceNote);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header matching HydrationModal */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 text-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <Moon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-extrabold tracking-tight truncate">
                {t('Sleep Tracker')}
              </h2>
              <p className="text-xs text-indigo-100 font-medium tabular-nums truncate">
                {selectedDate} · {t('Goal: 7 - 8.5 hrs')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
            <span>{t('Close')}</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950">
          {/* Sleep Snapshot */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                {t('Restful Sleep')}
              </span>
              {sleepOptimal && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('7h+ Optimal')}</span>
                </span>
              )}
            </div>

            <div className="flex items-baseline justify-between tabular-nums">
              <div>
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {sleepHours}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1.5">
                  {t('hours')}
                </span>
              </div>
              <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                {pct}%
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>

            {currentHabit.sleepSource === 'os_auto' && (
              <p className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                <span>
                  {t('Auto-detected sleep')} ({osHealthInfo.osLabel}) — {isMl ? 'എപ്പോൾ വേണമെങ്കിലും മാറ്റാം' : 'Editable anytime'}
                </span>
              </p>
            )}
          </div>

          {/* Slider + Fine Adjust + Quick Presets */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <input
              type="range"
              min="3"
              max="12"
              step="0.5"
              value={sleepHours}
              onChange={(e) => handleSetSleep(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />

            <div className="flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => handleSetSleep(sleepHours - 0.5)}
                className="flex-1 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1 tabular-nums"
              >
                <Minus className="w-3.5 h-3.5" />
                <span>0.5 {isMl ? 'മണി' : 'hr'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetSleep(sleepHours + 0.5)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1 tabular-nums"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>0.5 {isMl ? 'മണി' : 'hr'}</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                {isMl ? 'ഉറക്ക സമയം തിരഞ്ഞെടുക്കുക:' : 'Quick Sleep Presets:'}
              </span>
              <div className="grid grid-cols-5 gap-1.5 text-xs tabular-nums">
                {[6, 7, 7.5, 8, 8.5].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSetSleep(preset)}
                    className={`py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                      sleepHours === preset
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                    }`}
                  >
                    {preset}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Health Export Sync */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs space-y-0.5">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{osHealthInfo.osLabel} ({osHealthInfo.healthEcosystem})</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                {importNote ||
                  (isMl
                    ? 'രാത്രി ഉറക്ക സമയം ഫോൺ OS വഴിയോ ഹെൽത്ത് ഫയൽ വഴിയോ അപ്ഡേറ്റ് ചെയ്യാം.'
                    : 'Sleep is essential for cortisol control & overnight fat loss recovery.')}
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv,.xml"
              onChange={handleFileImport}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-center"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{t('Import Health File')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
