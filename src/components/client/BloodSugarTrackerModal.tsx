import React, { useEffect, useMemo, useState } from 'react';
import {
  BloodSugarContext,
  BloodSugarLog,
  ClientProfile,
  DiabeticStatus,
  MealType,
} from '../../types';
import { useApp } from '../../context/AppContext';
import {
  analyzeDailySugarSodiumAndGlycemicLoad,
  classifyBloodSugarReading,
  resolveMealLogNutrients,
} from '../../utils/micronutrients';
import { CLINICAL_DISCLAIMER } from '../../utils/clinicalSafety';
import { formatDateDisplay, getDaysAgoString } from '../../utils/dateUtils';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  X,
  HeartPulse,
  Candy,
  Flame,
  BookOpen,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Activity,
  SlidersHorizontal,
  Utensils,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface BloodSugarTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientProfile;
  initialTab?: 'check' | 'audit' | 'study';
  onOpenLogMeal?: () => void;
}

const CONTEXT_OPTIONS: Array<{
  id: BloodSugarContext;
  label: string;
  shortLabel: string;
  hint: string;
}> = [
  { id: 'fasting', label: 'Fasting (Morning)', shortLabel: 'Fasting', hint: '8+ hrs overnight fast' },
  { id: 'pre_meal', label: 'Before Meal', shortLabel: 'Pre-Meal', hint: 'Just before eating' },
  { id: 'post_meal_2h', label: '2h After Meal', shortLabel: '2h Post-Meal', hint: '2 hours after first bite' },
  { id: 'bedtime', label: 'Bedtime', shortLabel: 'Bedtime', hint: 'Before sleep' },
  { id: 'random', label: 'Anytime Check', shortLabel: 'Random', hint: 'Symptom / mid-day check' },
];

const DIABETIC_STATUS_LABELS: Record<DiabeticStatus, string> = {
  none: 'No Diabetes / Preventive',
  prediabetes: 'Prediabetes',
  type2: 'Type 2 Diabetes',
  type1: 'Type 1 Diabetes',
  gestational: 'Gestational Diabetes',
};

const KERALA_GI_TABLE: Array<{
  food: string;
  gi: string;
  netCarbs: string;
  gl: string;
  tip: string;
}> = [
  { food: 'Boiled Eggs / Grilled Fish / Paneer', gi: '0–10 (Zero)', netCarbs: '0–2g', gl: '0 (Very Low)', tip: 'Zero spike; eat first to blunt meal glucose rise.' },
  { food: 'Kadala Curry (Black Chickpeas, 1 bowl)', gi: '32 (Low)', netCarbs: '16g', gl: '5 (Low)', tip: 'Soluble fiber slows gastric emptying cleanly.' },
  { food: 'Cabbage / Spinach Thoran (1 bowl)', gi: '15–25 (Low)', netCarbs: '5g', gl: '1 (Low)', tip: 'Best volume-builder before rice or puttu.' },
  { food: 'Kerala Matta Red Rice (1 small cup)', gi: '52 (Low-Med)', netCarbs: '34g', gl: '18 (Medium)', tip: 'Keep to 1 katori with fish curry & thoran.' },
  { food: 'Whole Wheat Chapati (2 medium)', gi: '52 (Low-Med)', netCarbs: '35g', gl: '18 (Medium)', tip: 'Pair with dal or egg roast instead of potato.' },
  { food: 'White Boiled Rice (1 full cup)', gi: '73 (High)', netCarbs: '44g', gl: '32 (High)', tip: 'Halve portion & pre-load salad + protein.' },
  { food: 'Maida Porotta (1 piece)', gi: '78 (High)', netCarbs: '36g', gl: '28 (High)', tip: 'Refined flour + oil; spikes 2h sugar sharply.' },
  { food: 'Pazham Pori / Payasam (1 serving)', gi: '68–75 (High)', netCarbs: '32–38g', gl: '24–28 (High)', tip: 'Concentrated sugar; take a 15-min walk after.' },
];

export const BloodSugarTrackerModal: React.FC<BloodSugarTrackerModalProps> = ({
  isOpen,
  onClose,
  client,
  initialTab = 'check',
  onOpenLogMeal,
}) => {
  const {
    selectedDate,
    mealLogs,
    foods,
    bloodSugarLogs,
    addBloodSugarLog,
    deleteBloodSugarLog,
    updateMealLog,
    updateClientSelf,
    theme,
    language,
    t,
  } = useApp();

  const isMl = language === 'ml';
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'check' | 'audit' | 'study'>(initialTab);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Glucometer Entry Form State
  const [unit, setUnit] = useState<'mg/dL' | 'mmol/L'>('mg/dL');
  const [readingStr, setReadingStr] = useState<string>('108');
  const [context, setContext] = useState<BloodSugarContext>('fasting');
  const [hba1cStr, setHba1cStr] = useState<string>('');
  const [linkedMealType, setLinkedMealType] = useState<MealType | ''>('');
  const [notes, setNotes] = useState<string>('');
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  // Inline Food Sugar/Fiber/Sodium Label Editor State inside Tab 2
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [editSugar, setEditSugar] = useState<string>('0');
  const [editFiber, setEditFiber] = useState<string>('0');
  const [editSodium, setEditSodium] = useState<string>('0');

  const dayMealLogs = useMemo(
    () => mealLogs.filter((m) => m.clientId === client.id && m.date === selectedDate),
    [mealLogs, client.id, selectedDate]
  );

  const clientSugarLogs = useMemo(
    () =>
      bloodSugarLogs
        .filter((bs) => bs.clientId === client.id)
        .sort((a, b) =>
          `${b.date} ${b.createdAt || b.timeLogged}`.localeCompare(
            `${a.date} ${a.createdAt || a.timeLogged}`
          )
        ),
    [bloodSugarLogs, client.id]
  );

  const daySugarLogs = useMemo(
    () => clientSugarLogs.filter((bs) => bs.date === selectedDate),
    [clientSugarLogs, selectedDate]
  );

  const audit = useMemo(
    () => analyzeDailySugarSodiumAndGlycemicLoad(client, dayMealLogs, foods, daySugarLogs),
    [client, dayMealLogs, foods, daySugarLogs]
  );

  const numericEntered = parseFloat(readingStr);
  const previewMgDl = useMemo(() => {
    if (!Number.isFinite(numericEntered) || numericEntered <= 0) return 0;
    return unit === 'mmol/L'
      ? Math.round(numericEntered * 18.0182)
      : Math.round(numericEntered);
  }, [numericEntered, unit]);

  const previewClass = useMemo(
    () =>
      previewMgDl > 0
        ? classifyBloodSugarReading(previewMgDl, context, client.diabeticStatus || 'none')
        : null,
    [previewMgDl, context, client.diabeticStatus]
  );

  // 14-day Trend Chart Data (Glucose mg/dL + Food Sugar g)
  const chartData = useMemo(() => {
    const days: Array<{
      dateLabel: string;
      avgGlucose: number | null;
      fastingGlucose: number | null;
      postMealGlucose: number | null;
      foodSugarG: number;
      foodSodiumMg: number;
    }> = [];

    for (let i = 13; i >= 0; i--) {
      const d = getDaysAgoString(i);
      const dayMeals = mealLogs.filter((m) => m.clientId === client.id && m.date === d);
      const dayAudit = analyzeDailySugarSodiumAndGlycemicLoad(client, dayMeals, foods, []);
      const dayReadings = clientSugarLogs.filter((bs) => bs.date === d);

      const fastingVals = dayReadings
        .filter((r) => r.context === 'fasting' || r.context === 'pre_meal')
        .map((r) => r.valueMgDl);
      const postVals = dayReadings
        .filter((r) => r.context === 'post_meal_2h' || r.context === 'random')
        .map((r) => r.valueMgDl);
      const allVals = dayReadings.map((r) => r.valueMgDl);

      const avg = (arr: number[]) =>
        arr.length > 0 ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : null;

      days.push({
        dateLabel: d.slice(5),
        avgGlucose: avg(allVals),
        fastingGlucose: avg(fastingVals),
        postMealGlucose: avg(postVals),
        foodSugarG: dayAudit.consumed.sugar,
        foodSodiumMg: dayAudit.consumed.sodium,
      });
    }
    return days;
  }, [client, mealLogs, foods, clientSugarLogs]);

  if (!isOpen) return null;

  const handleToggleUnit = (nextUnit: 'mg/dL' | 'mmol/L') => {
    if (nextUnit === unit) return;
    const currentVal = parseFloat(readingStr);
    if (Number.isFinite(currentVal) && currentVal > 0) {
      if (nextUnit === 'mmol/L') {
        setReadingStr((currentVal / 18.0182).toFixed(1));
      } else {
        setReadingStr(String(Math.round(currentVal * 18.0182)));
      }
    }
    setUnit(nextUnit);
  };

  const handleSaveReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewMgDl || previewMgDl < 25 || previewMgDl > 750) return;
    const parsedHba1c = parseFloat(hba1cStr);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    addBloodSugarLog({
      clientId: client.id,
      date: selectedDate,
      timeLogged: timeStr,
      context,
      valueMgDl: previewMgDl,
      unitEntered: unit,
      rawEnteredValue: Number(numericEntered.toFixed(1)),
      hba1cPercent:
        Number.isFinite(parsedHba1c) && parsedHba1c >= 3 && parsedHba1c <= 18
          ? Number(parsedHba1c.toFixed(1))
          : undefined,
      linkedMealType: linkedMealType || undefined,
      foodSugarGramsAtLog: audit.consumed.sugar,
      foodCarbsGramsAtLog: audit.consumed.carbs,
      foodSodiumMgAtLog: audit.consumed.sodium,
      notes: notes.trim() || undefined,
    });

    setNotes('');
    setSavedBanner(`Logged ${previewMgDl} mg/dL (${context.replace(/_/g, ' ')}) for ${formatDateDisplay(selectedDate)}.`);
    setTimeout(() => setSavedBanner(null), 4000);
  };

  const beginEditMeal = (logId: string) => {
    const target = dayMealLogs.find((m) => m.id === logId);
    if (!target) return;
    const resolved = resolveMealLogNutrients(target, foods);
    setEditingMealId(logId);
    setEditSugar(String(Math.round(resolved.sugar * 10) / 10));
    setEditFiber(String(Math.round(resolved.fiber * 10) / 10));
    setEditSodium(String(Math.round(resolved.sodium)));
  };

  const saveEditMeal = (logId: string) => {
    const s = Math.max(0, Number(editSugar) || 0);
    const fib = Math.max(0, Number(editFiber) || 0);
    const na = Math.max(0, Math.round(Number(editSodium) || 0));
    updateMealLog(logId, {
      sugar: Math.round(s * 10) / 10,
      fiber: Math.round(fib * 10) / 10,
      sodium: na,
    });
    setEditingMealId(null);
  };

  const diabeticStatus: DiabeticStatus = client.diabeticStatus || 'none';
  const fastingTarget = client.fastingSugarTargetMgDl || (diabeticStatus === 'none' ? 99 : 130);
  const postMealTarget = client.postMealSugarTargetMgDl || (diabeticStatus === 'none' ? 140 : 180);

  return (
    <div
      className="fixed inset-0 z-[65] bg-slate-900/70 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[93vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-emerald-950 text-white px-4 sm:px-6 py-4 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 shrink-0">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white truncate">
                  {t('Blood Sugar')}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/15 text-emerald-100 uppercase shrink-0">
                  {DIABETIC_STATUS_LABELS[diabeticStatus]}
                </span>
                {client.hypertensionOrSaltSensitive && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/25 text-amber-200 border border-amber-400/30 shrink-0">
                    Salt-Sensitive (1,500mg Na)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-200 truncate tabular-nums">
                {formatDateDisplay(selectedDate)} · Target Sugar ≤{audit.targets.sugar}g · Sodium ≤{audit.targets.sodium}mg · Fasting Goal &lt;{fastingTarget} mg/dL
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('Close')}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-6 pt-3 pb-2 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('check')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === 'check'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>{t('Daily Sugar Check & Log')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Candy className="w-3.5 h-3.5" />
              <span>{t('Food Sugar & Sodium Audit')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('study')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === 'study'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t('Detailed Sugar Study')}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowProfileSetup((v) => !v)}
            className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>{showProfileSetup ? 'Hide Patient Setup' : 'Sugar Patient Profile'}</span>
          </button>
        </div>

        {/* Collapsible Patient Diabetes & Salt-Sensitivity Calibration Bar */}
        {showProfileSetup && (
          <div className="px-4 sm:px-6 py-3 bg-emerald-50/70 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-900 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs shrink-0">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300 block mb-1">
                Diabetes / Glycemic Status
              </label>
              <select
                value={diabeticStatus}
                onChange={(e) => {
                  const next = e.target.value as DiabeticStatus;
                  updateClientSelf({
                    diabeticStatus: next,
                    fastingSugarTargetMgDl: next === 'none' ? 99 : 130,
                    postMealSugarTargetMgDl: next === 'none' ? 140 : 180,
                  });
                }}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
              >
                <option value="none">No Diabetes (Preventive)</option>
                <option value="prediabetes">Prediabetes</option>
                <option value="type2">Type 2 Diabetes</option>
                <option value="type1">Type 1 Diabetes</option>
                <option value="gestational">Gestational Diabetes</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300 block mb-1">
                Fasting Target (mg/dL)
              </label>
              <input
                type="number"
                value={fastingTarget}
                min={70}
                max={200}
                onChange={(e) =>
                  updateClientSelf({ fastingSugarTargetMgDl: Math.max(70, Number(e.target.value) || 99) })
                }
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold tabular-nums"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300 block mb-1">
                2h Post-Meal Target (mg/dL)
              </label>
              <input
                type="number"
                value={postMealTarget}
                min={100}
                max={260}
                onChange={(e) =>
                  updateClientSelf({ postMealSugarTargetMgDl: Math.max(100, Number(e.target.value) || 140) })
                }
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold tabular-nums"
              />
            </div>

            <div className="flex items-end">
              <label className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(client.hypertensionOrSaltSensitive)}
                  onChange={(e) =>
                    updateClientSelf({ hypertensionOrSaltSensitive: e.target.checked })
                  }
                  className="accent-emerald-700"
                />
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  Salt-Sensitive / High BP (1,500mg Na cap)
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* TAB 1: DAILY SUGAR CHECK & LOG */}
          {activeTab === 'check' && (
            <div className="space-y-5">
              {/* Top Needed vs Consumed Mini Summary Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800 tabular-nums">
                  <span className="text-[10px] font-bold text-pink-700 dark:text-pink-300 uppercase block">
                    Food Sugar Today
                  </span>
                  <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                    {audit.consumed.sugar}g{' '}
                    <span className="text-[11px] font-semibold text-slate-500">
                      / {audit.targets.sugar}g cap
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 tabular-nums">
                  <span className="text-[10px] font-bold text-orange-700 dark:text-orange-300 uppercase block">
                    Food Sodium Today
                  </span>
                  <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                    {audit.consumed.sodium}mg{' '}
                    <span className="text-[11px] font-semibold text-slate-500">
                      / {audit.targets.sodium}mg
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 tabular-nums">
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase block">
                    Net Carbs / GL
                  </span>
                  <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                    {audit.netCarbsGrams}g{' '}
                    <span className="text-[11px] font-semibold text-slate-500">
                      · GL {audit.estimatedGlycemicLoad}
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 tabular-nums">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase block">
                    Fiber Buffer
                  </span>
                  <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                    {audit.consumed.fiber}g{' '}
                    <span className="text-[11px] font-semibold text-slate-500">
                      ({audit.fiberBufferRatioPct}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Glucometer Check Form */}
              <form
                onSubmit={handleSaveReading}
                className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {isMl ? 'ഇന്നത്തെ ഗ്ലൂക്കോമീറ്റർ റീഡിംഗ് രേഖപ്പെടുത്തുക' : 'Log Today’s Glucometer Blood Sugar Reading'}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Auto-links your logged food sugar ({audit.consumed.sugar}g), carbs ({audit.consumed.carbs}g) &amp; sodium ({audit.consumed.sodium}mg) on {formatDateDisplay(selectedDate)}.
                    </p>
                  </div>

                  {/* Unit Switcher mg/dL <-> mmol/L */}
                  <div className="inline-flex rounded-xl bg-white dark:bg-slate-900 p-0.5 border border-slate-200 dark:border-slate-700">
                    {(['mg/dL', 'mmol/L'] as const).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => handleToggleUnit(u)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                          unit === u
                            ? 'bg-emerald-700 text-white'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Context Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {CONTEXT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setContext(opt.id)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border cursor-pointer transition-colors ${
                        context === opt.id
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                      }`}
                      title={opt.hint}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Reading ({unit}) *
                    </label>
                    <input
                      type="number"
                      step={unit === 'mmol/L' ? '0.1' : '1'}
                      min={unit === 'mmol/L' ? 1.5 : 30}
                      max={unit === 'mmol/L' ? 40 : 700}
                      value={readingStr}
                      onChange={(e) => setReadingStr(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black text-base tabular-nums"
                    />
                    {unit === 'mmol/L' && previewMgDl > 0 && (
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5 block tabular-nums">
                        = {previewMgDl} mg/dL
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Optional HbA1c (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={3.5}
                      max={16}
                      placeholder="e.g. 5.8"
                      value={hba1cStr}
                      onChange={(e) => setHba1cStr(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Linked Meal (optional)
                    </label>
                    <select
                      value={linkedMealType}
                      onChange={(e) => setLinkedMealType(e.target.value as MealType | '')}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="">General Day Check</option>
                      <option value="Breakfast">After Breakfast</option>
                      <option value="Morning Snack">Morning Snack</option>
                      <option value="Lunch">After Lunch</option>
                      <option value="Evening Snack">Evening Snack</option>
                      <option value="Dinner">After Dinner</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Notes / Symptoms
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Walked 15 min after lunch"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      maxLength={200}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Live Classification Feedback & Low Glucose Safety Alert */}
                {previewClass && (
                  <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 ${previewClass.badgeClass}`}>
                    <div className="flex items-start gap-2">
                      {previewClass.band === 'low' || previewClass.band === 'elevated' ? (
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      ) : (
                        <Activity className="w-4 h-4 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-extrabold text-xs">{previewClass.label}</div>
                        <p className="text-[11px] opacity-90">{previewClass.guidance}</p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Save Sugar Check</span>
                    </button>
                  </div>
                )}

                {savedBanner && (
                  <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{savedBanner}</span>
                  </div>
                )}
              </form>

              {/* Selected Date Readings List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wide">
                    Readings on {formatDateDisplay(selectedDate)} ({daySugarLogs.length})
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Total recorded all days: {clientSugarLogs.length}
                  </span>
                </div>

                {daySugarLogs.length === 0 ? (
                  <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400">
                    No blood sugar checks recorded for {formatDateDisplay(selectedDate)} yet. Enter your morning fasting or 2h post-meal reading above.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {daySugarLogs.map((log: BloodSugarLog) => {
                      const cls = classifyBloodSugarReading(log.valueMgDl, log.context, diabeticStatus);
                      const ctxLabel =
                        CONTEXT_OPTIONS.find((c) => c.id === log.context)?.shortLabel || log.context;
                      return (
                        <div
                          key={log.id}
                          className="p-3 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-950 text-white font-black text-sm tabular-nums shrink-0">
                              {log.valueMgDl} <span className="text-[10px] font-normal text-slate-300">mg/dL</span>
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {ctxLabel}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${cls.badgeClass}`}>
                                  {cls.label}
                                </span>
                                {log.hba1cPercent !== undefined && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300">
                                    HbA1c {log.hba1cPercent}%
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums mt-0.5">
                                {log.timeLogged}
                                {log.linkedMealType ? ` · ${log.linkedMealType}` : ''}
                                {log.foodSugarGramsAtLog !== undefined ? ` · Dietary Sugar: ${log.foodSugarGramsAtLog}g` : ''}
                                {log.foodSodiumMgAtLog !== undefined ? ` · Sodium: ${log.foodSodiumMgAtLog}mg` : ''}
                                {log.notes ? ` · "${log.notes}"` : ''}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => deleteBloodSugarLog(log.id)}
                            aria-label="Delete blood sugar reading"
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 14-Day Blood Glucose & Food Sugar Dual Chart */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">
                      14-Day Blood Glucose (mg/dL) vs Food Sugar (g)
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Compare daily meal sugar intake against fasting &amp; post-meal glucose checks
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold">
                    <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Glucose (mg/dL)
                    </span>
                    <span className="flex items-center gap-1 text-pink-600 dark:text-pink-400">
                      <span className="w-2.5 h-2.5 rounded-sm bg-pink-400/60" /> Food Sugar (g)
                    </span>
                  </div>
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} />
                      <XAxis dataKey="dateLabel" tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }} />
                      <YAxis
                        yAxisId="left"
                        domain={[60, 220]}
                        tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={[0, 80]}
                        tick={{ fontSize: 10, fill: isDark ? '#f472b6' : '#db2777' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          color: '#f8fafc',
                          borderRadius: '12px',
                          border: 'none',
                          fontSize: '11px',
                        }}
                      />
                      <ReferenceLine
                        yAxisId="left"
                        y={fastingTarget}
                        stroke="#10b981"
                        strokeDasharray="4 4"
                      />
                      <ReferenceLine
                        yAxisId="left"
                        y={postMealTarget}
                        stroke="#f59e0b"
                        strokeDasharray="4 4"
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="foodSugarG"
                        name="Food Sugar (g)"
                        fill="rgba(236, 72, 153, 0.35)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="avgGlucose"
                        name="Avg Glucose (mg/dL)"
                        stroke="#e11d48"
                        strokeWidth={2.5}
                        connectNulls
                        dot={{ r: 3.5 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FOOD SUGAR & SODIUM AUDIT */}
          {activeTab === 'audit' && (
            <div className="space-y-5">
              {/* Needed vs Consumed Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800 space-y-2 tabular-nums">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-pink-900 dark:text-pink-200 flex items-center gap-1.5">
                      <Candy className="w-4 h-4" /> Sugar Budget
                    </span>
                    <span className="text-[11px] font-black text-pink-700 dark:text-pink-300">
                      {audit.consumed.sugar}g / {audit.targets.sugar}g
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        audit.consumed.sugar > audit.targets.sugar ? 'bg-rose-500' : 'bg-pink-500'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.round((audit.consumed.sugar / Math.max(1, audit.targets.sugar)) * 100))}%`,
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    {audit.consumed.sugar <= audit.targets.sugar
                      ? `${audit.sugarRemainingGrams}g remaining safely today.`
                      : `${(audit.consumed.sugar - audit.targets.sugar).toFixed(1)}g above daily ceiling!`}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 space-y-2 tabular-nums">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-orange-900 dark:text-orange-200 flex items-center gap-1.5">
                      <Flame className="w-4 h-4" /> Sodium (Salt) Budget
                    </span>
                    <span className="text-[11px] font-black text-orange-700 dark:text-orange-300">
                      {audit.consumed.sodium}mg / {audit.targets.sodium}mg
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        audit.consumed.sodium > audit.targets.sodium ? 'bg-rose-500' : 'bg-orange-500'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.round((audit.consumed.sodium / Math.max(1, audit.targets.sodium)) * 100))}%`,
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    {audit.consumed.sodium <= audit.targets.sodium
                      ? `${audit.sodiumRemainingMg}mg remaining safely today.`
                      : `${audit.consumed.sodium - audit.targets.sodium}mg over AHA/WHO sodium limit!`}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-2 tabular-nums">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-blue-900 dark:text-blue-200">
                      Glycemic Load (GL)
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      audit.glycemicLoadBand === 'Low'
                        ? 'bg-emerald-100 text-emerald-800'
                        : audit.glycemicLoadBand === 'Moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      GL {audit.estimatedGlycemicLoad} · {audit.glycemicLoadBand}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-700 dark:text-slate-300 space-y-0.5">
                    <div>Total Carbs: <b>{audit.consumed.carbs}g</b> · Fiber: <b>{audit.consumed.fiber}g</b></div>
                    <div>Net Carbs (Carbs - Fiber): <b>{audit.netCarbsGrams}g</b></div>
                  </div>
                </div>
              </div>

              {/* Logged Foods Table with Inline Accuracy Override */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">
                      Foods Consumed on {formatDateDisplay(selectedDate)} — Label-Exact Sugar, Fiber &amp; Sodium
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Tap Edit on any food to enter exact nutrition-label Sugar (g), Fiber (g), or Sodium (mg) for 100% precision.
                    </p>
                  </div>
                  {onOpenLogMeal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenLogMeal();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Utensils className="w-3 h-3" />
                      <span>+ Log Food</span>
                    </button>
                  )}
                </div>

                {dayMealLogs.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                    No meals logged for {formatDateDisplay(selectedDate)} yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {dayMealLogs.map((log) => {
                      const res = resolveMealLogNutrients(log, foods);
                      const isEditing = editingMealId === log.id;
                      return (
                        <div key={log.id} className="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white truncate">
                              {log.foodName}{' '}
                              <span className="text-[11px] font-normal text-slate-500">
                                ({log.quantity}× {log.servingUnit} · {log.mealType})
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums mt-0.5 flex flex-wrap gap-2">
                              <span>{Math.round(log.calories)} kcal</span>
                              <span>· Carbs {res.carbs}g</span>
                              <span className="text-lime-700 dark:text-lime-400 font-semibold">· Fiber {Math.round(res.fiber * 10) / 10}g</span>
                              <span className="text-pink-700 dark:text-pink-400 font-bold">· Sugar {Math.round(res.sugar * 10) / 10}g</span>
                              <span className="text-orange-700 dark:text-orange-400 font-bold">· Sodium {Math.round(res.sodium)}mg</span>
                            </div>
                          </div>

                          {isEditing ? (
                            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                              <label className="text-[10px] font-bold text-pink-700 dark:text-pink-300">
                                Sug(g)
                                <input
                                  type="number"
                                  step="0.5"
                                  min={0}
                                  value={editSugar}
                                  onChange={(e) => setEditSugar(e.target.value)}
                                  className="w-14 ml-1 px-1.5 py-1 rounded-lg border border-pink-300 dark:border-pink-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold tabular-nums"
                                />
                              </label>
                              <label className="text-[10px] font-bold text-lime-700 dark:text-lime-300">
                                Fib(g)
                                <input
                                  type="number"
                                  step="0.5"
                                  min={0}
                                  value={editFiber}
                                  onChange={(e) => setEditFiber(e.target.value)}
                                  className="w-14 ml-1 px-1.5 py-1 rounded-lg border border-lime-300 dark:border-lime-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold tabular-nums"
                                />
                              </label>
                              <label className="text-[10px] font-bold text-orange-700 dark:text-orange-300">
                                Na(mg)
                                <input
                                  type="number"
                                  step="5"
                                  min={0}
                                  value={editSodium}
                                  onChange={(e) => setEditSodium(e.target.value)}
                                  className="w-16 ml-1 px-1.5 py-1 rounded-lg border border-orange-300 dark:border-orange-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold tabular-nums"
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => saveEditMeal(log.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingMealId(null)}
                                className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => beginEditMeal(log.id)}
                              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 font-bold text-[11px] border border-slate-200 dark:border-slate-700 cursor-pointer shrink-0"
                            >
                              Edit Sugar / Salt
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Top Contributors Split */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h5 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs">
                    Top Sugar Sources Today
                  </h5>
                  {audit.topSugarFoods.length === 0 ? (
                    <p className="text-[11px] text-slate-500">Zero sugary foods logged today.</p>
                  ) : (
                    audit.topSugarFoods.slice(0, 5).map((s) => (
                      <div key={s.logId} className="flex items-center justify-between text-[11px] tabular-nums">
                        <span className="truncate font-semibold text-slate-700 dark:text-slate-200 pr-2">{s.foodName}</span>
                        <span className="font-bold text-pink-700 dark:text-pink-400 shrink-0">{s.amount}g ({s.sharePct}%)</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h5 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs">
                    Top Sodium Sources Today
                  </h5>
                  {audit.topSodiumFoods.length === 0 ? (
                    <p className="text-[11px] text-slate-500">Minimal sodium logged today.</p>
                  ) : (
                    audit.topSodiumFoods.slice(0, 5).map((s) => (
                      <div key={s.logId} className="flex items-center justify-between text-[11px] tabular-nums">
                        <span className="truncate font-semibold text-slate-700 dark:text-slate-200 pr-2">{s.foodName}</span>
                        <span className="font-bold text-orange-700 dark:text-orange-400 shrink-0">{s.amount}mg ({s.sharePct}%)</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DETAILED SUGAR STUDY */}
          {activeTab === 'study' && (
            <div className="space-y-4">
              {/* Key Principles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                  <h4 className="font-extrabold text-emerald-950 dark:text-emerald-200 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    1. How Food Turns Into Blood Sugar
                  </h4>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                    Digestible carbohydrates break down into glucose in the small intestine.{' '}
                    <b>Net Carbs = Total Carbs − Dietary Fiber</b>. Fiber does not raise blood sugar; instead, soluble fiber (from kadala, oats, vegetables) forms a gel that slows glucose absorption and softens the insulin spike.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-1.5">
                  <h4 className="font-extrabold text-blue-950 dark:text-blue-200 text-xs flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-600" />
                    2. Glycemic Index (GI) vs Glycemic Load (GL)
                  </h4>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                    GI measures speed of sugar rise (0–100), whereas <b>GL = (GI × Net Carbs) ÷ 100</b> measures the real total spike of your actual serving. Daily target: keep single meals Low-GL (≤10) or Moderate-GL (11–19) and total daily GL ≤80–100.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-1.5">
                  <h4 className="font-extrabold text-amber-950 dark:text-amber-200 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    3. Plate Sequence &amp; 10-Min Post-Meal Walk
                  </h4>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                    Eating <b>vegetables/thoran first → protein (eggs/fish/chicken) second → rice/roti last</b> slows gastric emptying and cuts 2-hour glucose peaks by ~25–35%. A gentle 10–15 minute walk within 30 minutes of eating activates insulin-independent muscle GLUT4 transporters.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 space-y-1.5">
                  <h4 className="font-extrabold text-orange-950 dark:text-orange-200 text-xs flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-600" />
                    4. Sodium, Insulin Resistance &amp; Blood Pressure
                  </h4>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                    High insulin tells kidneys to retain sodium, raising vascular pressure. Meanwhile, high-sodium pickles, pappadam, and processed mixes worsen endothelial stiffness. Therefore AHA recommends <b>≤1,500 mg sodium/day</b> and <b>≤25g added sugar/day</b> for diabetic or salt-sensitive patients.
                  </p>
                </div>
              </div>

              {/* Kerala & Everyday Meal GI/GL Comparison Table */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 font-extrabold text-slate-900 dark:text-white text-xs">
                  Kerala &amp; Clinic Foods — Glycemic Index &amp; Glycemic Load Guide
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-100/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <th className="py-2 px-3 font-bold">Food Item</th>
                        <th className="py-2 px-3 font-bold">GI</th>
                        <th className="py-2 px-3 font-bold">Net Carbs</th>
                        <th className="py-2 px-3 font-bold">GL</th>
                        <th className="py-2 px-3 font-bold">Clinical Coaching Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {KERALA_GI_TABLE.map((row) => (
                        <tr key={row.food} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                          <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{row.food}</td>
                          <td className="py-2 px-3 tabular-nums">{row.gi}</td>
                          <td className="py-2 px-3 tabular-nums">{row.netCarbs}</td>
                          <td className="py-2 px-3 font-semibold tabular-nums">{row.gl}</td>
                          <td className="py-2 px-3">{row.tip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ADA Reference Ranges Table */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 font-extrabold text-slate-900 dark:text-white text-xs">
                  Educational Blood Glucose &amp; HbA1c Reference Ranges (ADA Guidelines)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px] tabular-nums">
                    <thead>
                      <tr className="bg-slate-100/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <th className="py-2 px-3 font-bold">Metric / Check Timing</th>
                        <th className="py-2 px-3 font-bold text-emerald-700 dark:text-emerald-400">Normal / Healthy</th>
                        <th className="py-2 px-3 font-bold text-amber-700 dark:text-amber-400">Prediabetes Range</th>
                        <th className="py-2 px-3 font-bold text-rose-700 dark:text-rose-400">Diabetes Clinical Goal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">Fasting / Before Meal</td>
                        <td className="py-2 px-3">70 – 99 mg/dL (3.9–5.5 mmol/L)</td>
                        <td className="py-2 px-3">100 – 125 mg/dL</td>
                        <td className="py-2 px-3">80 – 130 mg/dL</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">2h After Meal (Post-Prandial)</td>
                        <td className="py-2 px-3">&lt; 140 mg/dL (&lt;7.8 mmol/L)</td>
                        <td className="py-2 px-3">140 – 199 mg/dL</td>
                        <td className="py-2 px-3">&lt; 180 mg/dL</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">HbA1c (3-Month Avg)</td>
                        <td className="py-2 px-3">&lt; 5.7%</td>
                        <td className="py-2 px-3">5.7% – 6.4%</td>
                        <td className="py-2 px-3">&lt; 7.0% (individualized)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Mandatory Clinical Educational Disclaimer */}
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
            <b>Wellness &amp; Safety Notice:</b> {CLINICAL_DISCLAIMER} Blood glucose readings below <b>70 mg/dL</b> or persistently elevated readings should always be reviewed promptly with your physician.
          </div>
        </div>
      </div>
    </div>
  );
};
