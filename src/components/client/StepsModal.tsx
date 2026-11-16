import React, { useMemo, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateStepCalories } from '../../utils/calorieQuality';
import { parseHealthExportFile } from '../../utils/deviceHealthSync';
import {
  X,
  Footprints,
  Flame,
  Plus,
  Minus,
  Smartphone,
  Upload,
  CheckCircle2,
} from 'lucide-react';

interface StepsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StepsModal: React.FC<StepsModalProps> = ({ isOpen, onClose }) => {
  const {
    activeClient,
    selectedDate,
    habits,
    updateDailyHabits,
    osHealthInfo,
    isPedometerLive,
    enableMobilePedometer,
    pauseMobilePedometer,
    t,
    language,
  } = useApp();
  const isMl = language === 'ml';

  const [sensorStatusNote, setSensorStatusNote] = useState<string | null>(null);
  const [customStepInput, setCustomStepInput] = useState('');
  const [isEditingExact, setIsEditingExact] = useState(false);
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

  const steps = currentHabit.steps || 0;
  const targetSteps = currentHabit.targetSteps || 8000;
  const pct = Math.min(100, Math.round((steps / targetSteps) * 100));
  const stepBurn = calculateStepCalories(steps, activeClient.currentWeightKg);
  const stepsDone = steps >= targetSteps;

  const adjustSteps = (delta: number) => {
    const next = Math.max(0, steps + delta);
    updateDailyHabits(selectedDate, {
      steps: next,
      stepsSource: 'manual',
      lastDeviceSyncAt: new Date().toISOString(),
    });
  };

  const handleApplyExact = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customStepInput, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      updateDailyHabits(selectedDate, {
        steps: Math.min(150000, parsed),
        stepsSource: 'manual',
        lastDeviceSyncAt: new Date().toISOString(),
      });
      setIsEditingExact(false);
    }
  };

  const handleToggleSensor = async () => {
    if (isPedometerLive) {
      pauseMobilePedometer();
      setSensorStatusNote(isMl ? 'ഫോൺ സ്റ്റെപ്പ് സെൻസർ നിർത്തി.' : 'Phone step sensor paused.');
      return;
    }
    const perm = await enableMobilePedometer();
    if (perm === 'granted') {
      setSensorStatusNote(
        isMl
          ? `${osHealthInfo.osLabel} സെൻസർ സജീവം — നിങ്ങൾ നടക്കുമ്പോൾ ചുവടുകൾ താനേ ചേർക്കപ്പെടും.`
          : `${osHealthInfo.osLabel} motion sensor active — walking steps sync automatically.`
      );
    } else if (perm === 'denied') {
      setSensorStatusNote(
        isMl
          ? 'സെൻസർ അനുമതി ലഭിച്ചില്ല. + / - ബട്ടൺ അല്ലെങ്കിൽ ഹെൽത്ത് ഫയൽ ഉപയോഗിക്കാം.'
          : 'Motion permission denied. Use + / - buttons or health file import.'
      );
    } else {
      setSensorStatusNote(
        isMl
          ? 'ഈ ബ്രൗസറിൽ ലൈവ് മോഷൻ സെൻസർ ലഭ്യമല്ല — ഹെൽത്ത് ഫയൽ അല്ലെങ്കിൽ + / - ഉപയോഗിക്കാം.'
          : 'Live motion sensor unavailable on this browser — use Import Health File or + / -.'
      );
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseHealthExportFile(String(reader.result || ''), selectedDate);
      if (parsed.steps !== undefined) {
        updateDailyHabits(selectedDate, {
          steps: parsed.steps,
          stepsSource: 'health_import',
          lastDeviceSyncAt: new Date().toISOString(),
        });
        setSensorStatusNote(
          isMl
            ? `${parsed.sourceNote}: ${parsed.steps.toLocaleString()} ചുവടുകൾ ചേർത്തു.`
            : `${parsed.sourceNote}: synced ${parsed.steps.toLocaleString()} steps.`
        );
      } else {
        setSensorStatusNote(parsed.sourceNote);
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
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-orange-600 to-amber-600 text-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <Footprints className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-extrabold tracking-tight truncate">
                {t('Daily Steps')}
              </h2>
              <p className="text-xs text-orange-100 font-medium tabular-nums truncate">
                {selectedDate} · {t('Step Burn Added')}: -{stepBurn} kcal
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
          {/* Progress Snapshot */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                {t('Daily Steps Target')}
              </span>
              {stepsDone && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('Achieved')}</span>
                </span>
              )}
            </div>

            <div className="flex items-baseline justify-between tabular-nums">
              <div>
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {steps.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1.5">
                  / {targetSteps.toLocaleString()} {t('steps')}
                </span>
              </div>
              <span className="text-sm font-black text-orange-600 dark:text-orange-400">
                {pct}%
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-orange-500 transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800/70 rounded-xl px-3.5 py-2 tabular-nums">
              <span className="font-semibold text-orange-900 dark:text-orange-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span>{t('Step Burn Added')}:</span>
              </span>
              <span className="font-black text-orange-700 dark:text-orange-300">
                -{stepBurn} kcal ({activeClient.currentWeightKg} kg)
              </span>
            </div>
          </div>

          {/* Quick 1-Tap Controls & Exact Edit */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
              {t('Quick 1-Tap Log:')}
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => adjustSteps(-500)}
                className="py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 tabular-nums"
              >
                <Minus className="w-3.5 h-3.5" />
                <span>500</span>
              </button>
              <button
                type="button"
                onClick={() => adjustSteps(500)}
                className="py-2.5 px-3 rounded-xl bg-orange-50 dark:bg-orange-950/50 hover:bg-orange-100 dark:hover:bg-orange-900/60 border border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200 font-bold transition-colors cursor-pointer tabular-nums"
              >
                +500 {t('steps')}
              </button>
              <button
                type="button"
                onClick={() => adjustSteps(1000)}
                className="py-2.5 px-3 rounded-xl bg-orange-50 dark:bg-orange-950/50 hover:bg-orange-100 dark:hover:bg-orange-900/60 border border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200 font-bold transition-colors cursor-pointer tabular-nums"
              >
                +1,000 {t('steps')}
              </button>
              <button
                type="button"
                onClick={() => adjustSteps(2500)}
                className="py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition-colors cursor-pointer tabular-nums"
              >
                +2,500 {t('steps')}
              </button>
            </div>

            <div className="pt-1">
              {!isEditingExact ? (
                <button
                  type="button"
                  onClick={() => {
                    setCustomStepInput(String(steps));
                    setIsEditingExact(true);
                  }}
                  className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  {isMl ? 'കൃത്യമായ ചുവടുകൾ നൽകുക' : 'Enter Exact Step Count'}
                </button>
              ) : (
                <form onSubmit={handleApplyExact} className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={150000}
                    value={customStepInput}
                    onChange={(e) => setCustomStepInput(e.target.value)}
                    placeholder={t('Exact steps')}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-orange-500 tabular-nums"
                  />
                  <button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                  >
                    {t('Apply')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingExact(false)}
                    className="text-xs font-semibold text-slate-500 px-2.5 py-2 cursor-pointer"
                  >
                    {t('Cancel')}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Phone OS Motion Sensor & Health File Sync */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-start gap-2.5 text-xs">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {t('Phone OS Sensor Sync')} · <span className="text-emerald-700 dark:text-emerald-400">{osHealthInfo.osLabel}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {sensorStatusNote ||
                    (isMl
                      ? 'ഫോണിലെ മോഷൻ സെൻസർ വഴിയോ ഹെൽത്ത് എക്സ്പോർട്ട് ഫയൽ വഴിയോ ചുവടുകൾ ചേർക്കാം.'
                      : 'Auto-sync live phone steps via motion sensor or import Apple Health / Health Connect / CSV exports.')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleToggleSensor}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isPedometerLive
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/40'
                }`}
              >
                <Footprints className="w-3.5 h-3.5" />
                <span>{isPedometerLive ? t('Live Pedometer On') : t('Start Phone Step Sensor')}</span>
              </button>

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
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{t('Import Health File')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
