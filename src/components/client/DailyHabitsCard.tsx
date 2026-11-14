import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateStepCalories } from '../../utils/calorieQuality';
import {
  detectClientOS,
  requestMotionSensorPermission,
  startStepPedometer,
  parseHealthExportFile
} from '../../utils/deviceHealthSync';
import {
  Footprints,
  Moon,
  Pill,
  Salad,
  Activity,
  CheckCircle2,
  Circle,
  Plus,
  Minus,
  Flame,
  Award,
  Smartphone,
  Upload
} from 'lucide-react';

export const DailyHabitsCard: React.FC = () => {
  const { activeClient, selectedDate, habits, updateDailyHabits, t, language } = useApp();
  const isMl = language === 'ml';

  const osInfo = useMemo(() => detectClientOS(), []);
  const [sensorActive, setSensorActive] = useState(false);
  const [sensorStatusNote, setSensorStatusNote] = useState<string | null>(null);
  const [customStepInput, setCustomStepInput] = useState<string>('');
  const [isEditingSteps, setIsEditingSteps] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentHabits = useMemo(() => {
    if (!activeClient) return null;
    const found = habits.find(h => h.clientId === activeClient.id && h.date === selectedDate);
    if (found) return found;
    return {
      id: `hab-temp`,
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

  // Ref to keep latest steps accessible inside motion sensor callback
  const latestStepsRef = useRef<number>(currentHabits?.steps || 0);
  useEffect(() => {
    latestStepsRef.current = currentHabits?.steps || 0;
  }, [currentHabits?.steps]);

  // Auto-enable live pedometer if Android/non-iOS browser already supports DeviceMotion without prompt
  useEffect(() => {
    if (osInfo.supportsMotionSensor && !osInfo.requiresPermissionPrompt && (osInfo.os === 'android' || osInfo.os === 'ios')) {
      setSensorActive(true);
    }
  }, [osInfo.supportsMotionSensor, osInfo.requiresPermissionPrompt, osInfo.os]);

  useEffect(() => {
    if (!sensorActive || !activeClient) return;
    const stop = startStepPedometer(() => {
      const next = (latestStepsRef.current || 0) + 1;
      latestStepsRef.current = next;
      updateDailyHabits(selectedDate, {
        steps: next,
        stepsSource: 'os_sensor',
        lastDeviceSyncAt: new Date().toISOString(),
      });
    });
    return () => stop();
  }, [sensorActive, activeClient?.id, selectedDate]);

  if (!currentHabits || !activeClient) return null;

  const stepCaloriesBurned = calculateStepCalories(currentHabits.steps, activeClient.currentWeightKg);

  // Calculate score
  const stepsDone = currentHabits.steps >= currentHabits.targetSteps;
  const sleepDone = currentHabits.sleepHours >= 7.0;
  const items = [
    stepsDone,
    sleepDone,
    currentHabits.supplementsTaken,
    currentHabits.saladEaten,
    currentHabits.stretchingDone
  ];
  const completedCount = items.filter(Boolean).length;
  const complianceScore = Math.round((completedCount / items.length) * 100);

  const handleAdjustSteps = (delta: number) => {
    const nextSteps = Math.max(0, (currentHabits.steps || 0) + delta);
    updateDailyHabits(selectedDate, {
      steps: nextSteps,
      stepsSource: 'manual',
      lastDeviceSyncAt: new Date().toISOString(),
    });
  };

  const handleSaveCustomSteps = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customStepInput, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      updateDailyHabits(selectedDate, {
        steps: parsed,
        stepsSource: 'manual',
        lastDeviceSyncAt: new Date().toISOString(),
      });
      setIsEditingSteps(false);
    }
  };

  const handleToggleHabit = (field: 'supplementsTaken' | 'saladEaten' | 'stretchingDone') => {
    updateDailyHabits(selectedDate, { [field]: !currentHabits[field] });
  };

  const handleSleepChange = (hours: number) => {
    const clamped = Math.min(14, Math.max(2, Math.round(hours * 2) / 2));
    updateDailyHabits(selectedDate, {
      sleepHours: clamped,
      sleepSource: 'manual',
      lastDeviceSyncAt: new Date().toISOString(),
    });
  };

  const handleTogglePhoneSensor = async () => {
    if (sensorActive) {
      setSensorActive(false);
      setSensorStatusNote(isMl ? 'ഫോൺ സ്റ്റെപ്പ് സെൻസർ നിർത്തി.' : 'Phone step sensor paused.');
      return;
    }
    const perm = await requestMotionSensorPermission();
    if (perm === 'granted') {
      setSensorActive(true);
      setSensorStatusNote(
        isMl
          ? `${osInfo.osLabel} സെൻസർ സജീവം — നിങ്ങൾ നടക്കുമ്പോൾ ചുവടുകൾ താനേ ചേർക്കപ്പെടും.`
          : `${osInfo.osLabel} motion sensor active — walking steps sync automatically.`
      );
    } else if (perm === 'denied') {
      setSensorStatusNote(
        isMl
          ? 'സെൻസർ അനുമതി ലഭിച്ചില്ല. ചുവടുകൾ + / - ബട്ടൺ വഴി മാറ്റാം.'
          : 'Motion permission denied. Use + / - buttons or health file import.'
      );
    } else {
      setSensorStatusNote(
        isMl
          ? 'ഈ ബ്രൗസറിൽ ലൈവ് മോഷൻ സെൻസർ ലഭ്യമല്ല — ഫയൽ ഇംപോർട്ട് അല്ലെങ്കിൽ + / - ഉപയോഗിക്കാം.'
          : 'Live motion sensor unavailable on this device — use Import Health File or + / -.'
      );
    }
  };

  const handleHealthFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      const parsed = parseHealthExportFile(content, selectedDate);
      const patch: Record<string, any> = {
        lastDeviceSyncAt: new Date().toISOString(),
      };
      if (parsed.steps !== undefined) {
        patch.steps = parsed.steps;
        patch.stepsSource = 'health_import';
      }
      if (parsed.sleepHours !== undefined) {
        patch.sleepHours = parsed.sleepHours;
        patch.sleepSource = 'health_import';
      }
      if (patch.steps !== undefined || patch.sleepHours !== undefined) {
        updateDailyHabits(selectedDate, patch);
        setSensorStatusNote(
          isMl
            ? `${parsed.sourceNote}: ചുവടുകൾ/ഉറക്കം ചേർത്തു (നിങ്ങൾക്ക് ഇപ്പോഴും തിരുത്താം).`
            : `${parsed.sourceNote}: synced (you can still adjust + or - anytime).`
        );
      } else {
        setSensorStatusNote(parsed.sourceNote);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold shadow-xs shrink-0">
            <Award className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              {t('Daily Clinical Habits & Recovery')}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t('Daily lifestyle factors essential for hormone balance, metabolic rate, and fat oxidation')}
            </p>
          </div>
        </div>

        {/* Adherence Score */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right tabular-nums">
            <span className="text-[11px] font-bold text-slate-500 block">
              {t('Habits Score')}
            </span>
            <span className={`text-sm font-black ${complianceScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {completedCount} / {items.length} ({complianceScore}%)
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center font-black text-xs text-slate-700">
            {complianceScore >= 80 ? '🌟' : '🎯'}
          </div>
        </div>
      </div>

      {/* OS Health & Motion Sensor Sync Strip */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-emerald-700 flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="text-xs min-w-0">
            <div className="font-bold text-slate-900 flex flex-wrap items-center gap-1.5">
              <span>{t('Phone OS Sensor Sync')}</span>
              <span className="text-slate-400">·</span>
              <span className="text-emerald-700">{osInfo.osLabel} ({osInfo.healthEcosystem})</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
              {sensorStatusNote ||
                (isMl
                  ? 'നിങ്ങളുടെ ഫോണിലെ സെൻസറും രാത്രിയിലെ ഉറക്ക സമയവും ഉപയോഗിച്ച് ചുവടുകളും ഉറക്കവും താനേ രേഖപ്പെടുത്താം — എപ്പോൾ വേണമെങ്കിലും കൂട്ടാനും കുറയ്ക്കാനും സാധിക്കും.'
                  : 'Syncs steps & overnight sleep window from your phone OS session. Always editable with + / - buttons.')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleTogglePhoneSensor}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              sensorActive
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-white border border-slate-200 text-slate-800 hover:bg-emerald-50 hover:border-emerald-300'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>{sensorActive ? t('Live Pedometer On') : t('Start Phone Step Sensor')}</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv,.xml"
            onChange={handleHealthFileImport}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            title={isMl ? 'Apple Health / Health Connect ഫയൽ അപ്‌ലോഡ് ചെയ്യുക' : 'Import Apple Health XML, Health Connect JSON, or CSV'}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t('Import Health File')}</span>
          </button>
        </div>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* 1. Daily Step Goal + Direct Calorie Burn Calculation */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                  <Footprints className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">
                  {t('Daily Steps Target')}
                </span>
              </div>
              {stepsDone && (
                <span className="text-[11px] font-bold text-emerald-700">
                  ✓ {t('Achieved')}
                </span>
              )}
            </div>

            <div className="my-3 flex items-baseline justify-between tabular-nums">
              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {currentHabits.steps.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-400 ml-1">
                  / {currentHabits.targetSteps.toLocaleString()} {t('steps')}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {Math.min(100, Math.round((currentHabits.steps / currentHabits.targetSteps) * 100))}%
              </span>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-orange-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (currentHabits.steps / currentHabits.targetSteps) * 100)}%` }}
              />
            </div>

            {/* Direct Calorie Burned from Steps Display */}
            <div className="mt-2.5 flex items-center justify-between text-xs bg-orange-50 border border-orange-200 rounded-xl px-3 py-1.5 tabular-nums">
              <span className="font-semibold text-orange-900 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-600" />
                <span>{t('Step Burn Added')}:</span>
              </span>
              <span className="font-black text-orange-700">-{stepCaloriesBurned} kcal</span>
            </div>
          </div>

          {/* Add / Reduce / Exact Controls */}
          <div className="space-y-2">
            <div className="grid grid-cols-5 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleAdjustSteps(-500)}
                className="bg-white hover:bg-rose-50 border border-slate-200 text-slate-700 font-bold py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-0.5 tabular-nums"
                title={isMl ? '500 കുറയ്ക്കുക' : 'Reduce 500 steps'}
              >
                <Minus className="w-3 h-3" />
                <span>500</span>
              </button>
              <button
                type="button"
                onClick={() => handleAdjustSteps(500)}
                className="bg-white hover:bg-orange-50 border border-slate-200 text-slate-700 font-bold py-1.5 rounded-lg transition-colors cursor-pointer tabular-nums"
              >
                +500
              </button>
              <button
                type="button"
                onClick={() => handleAdjustSteps(1000)}
                className="bg-white hover:bg-orange-50 border border-slate-200 text-slate-700 font-bold py-1.5 rounded-lg transition-colors cursor-pointer tabular-nums"
              >
                +1,000
              </button>
              <button
                type="button"
                onClick={() => handleAdjustSteps(2500)}
                className="bg-white hover:bg-orange-50 border border-slate-200 text-slate-700 font-bold py-1.5 rounded-lg transition-colors cursor-pointer tabular-nums"
              >
                +2,500
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomStepInput(String(currentHabits.steps || 0));
                  setIsEditingSteps(prev => !prev);
                }}
                className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                {isMl ? 'മാറ്റുക' : 'Edit'}
              </button>
            </div>

            {isEditingSteps && (
              <form onSubmit={handleSaveCustomSteps} className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={100000}
                  value={customStepInput}
                  onChange={(e) => setCustomStepInput(e.target.value)}
                  placeholder={t('Exact steps')}
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-orange-500 tabular-nums"
                />
                <button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  {t('Apply')}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 2. Sleep Recovery (Auto-detected + Editable + / -) */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Moon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">
                  {t('Restful Sleep')}
                </span>
              </div>
              {sleepDone && (
                <span className="text-[11px] font-bold text-emerald-700">
                  ✓ {t('7h+ Optimal')}
                </span>
              )}
            </div>

            <div className="my-3 flex items-baseline justify-between tabular-nums">
              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {currentHabits.sleepHours}
                </span>
                <span className="text-xs font-bold text-slate-400 ml-1">
                  {t('hours')}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {t('Goal: 7 - 8.5 hrs')}
              </span>
            </div>

            {(currentHabits as any).sleepSource === 'os_auto' && (
              <p className="text-[11px] text-indigo-700 font-semibold mb-2">
                {t('Auto-detected sleep')} ({osInfo.osLabel})
              </p>
            )}
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min="3"
              max="12"
              step="0.5"
              value={currentHabits.sleepHours}
              onChange={(e) => handleSleepChange(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleSleepChange((currentHabits.sleepHours || 7) - 0.5)}
                className="flex-1 bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 text-xs font-bold py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 tabular-nums"
              >
                <Minus className="w-3 h-3" />
                <span>0.5 {isMl ? 'മണി' : 'hr'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleSleepChange((currentHabits.sleepHours || 7) + 0.5)}
                className="flex-1 bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 text-xs font-bold py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 tabular-nums"
              >
                <Plus className="w-3 h-3" />
                <span>0.5 {isMl ? 'മണി' : 'hr'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Daily Prescribed Supplements */}
        <div
          onClick={() => handleToggleHabit('supplementsTaken')}
          className={`border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
            currentHabits.supplementsTaken
              ? 'bg-emerald-50/80 border-emerald-300'
              : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Pill className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                {t('Prescribed Vitamins')}
              </span>
            </div>
            {currentHabits.supplementsTaken ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300" />
            )}
          </div>

          <p className="my-2 text-xs text-slate-600 font-medium">
            {t('Daily multivitamin, Omega-3 fish oil, Vitamin D3, and probiotic as recommended by coach.')}
          </p>

          <span className={`text-[11px] font-bold ${currentHabits.supplementsTaken ? 'text-emerald-700' : 'text-slate-400'}`}>
            {currentHabits.supplementsTaken ? t('✓ Taken Today') : t('Tap to mark as taken')}
          </span>
        </div>

        {/* 4. High-Fiber Salad & Greens */}
        <div
          onClick={() => handleToggleHabit('saladEaten')}
          className={`border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
            currentHabits.saladEaten
              ? 'bg-emerald-50/80 border-emerald-300'
              : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-lime-100 text-lime-800 flex items-center justify-center">
                <Salad className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                {t('Raw Greens & Salad')}
              </span>
            </div>
            {currentHabits.saladEaten ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300" />
            )}
          </div>

          <p className="my-2 text-xs text-slate-600 font-medium">
            {t('A bowl of cucumber, tomato, carrot, and fresh greens eaten before major meals for gut satiety.')}
          </p>

          <span className={`text-[11px] font-bold ${currentHabits.saladEaten ? 'text-emerald-700' : 'text-slate-400'}`}>
            {currentHabits.saladEaten ? t('✓ Eaten Today') : t('Tap to mark as completed')}
          </span>
        </div>

        {/* 5. Post-Meal Mobility / Walk */}
        <div
          onClick={() => handleToggleHabit('stretchingDone')}
          className={`border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
            currentHabits.stretchingDone
              ? 'bg-emerald-50/80 border-emerald-300'
              : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                {t('10-Min Post-Meal Walk')}
              </span>
            </div>
            {currentHabits.stretchingDone ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300" />
            )}
          </div>

          <p className="my-2 text-xs text-slate-600 font-medium">
            {t('Light 10-15 min stroll immediately after lunch or dinner to blunt postprandial glucose spike.')}
          </p>

          <span className={`text-[11px] font-bold ${currentHabits.stretchingDone ? 'text-emerald-700' : 'text-slate-400'}`}>
            {currentHabits.stretchingDone ? t('✓ Completed') : t('Tap to mark as done')}
          </span>
        </div>

      </div>
    </div>
  );
};
