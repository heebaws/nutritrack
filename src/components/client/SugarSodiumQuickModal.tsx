import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClientProfile, MealType } from '../../types';
import {
  analyzeDailySugarSodiumAndGlycemicLoad,
  resolveMealLogNutrients,
} from '../../utils/micronutrients';
import { formatDateDisplay } from '../../utils/dateUtils';
import {
  X,
  Candy,
  Flame,
  Plus,
  CheckCircle2,
  Trash2,
  Edit3,
  Check,
  Utensils,
  HeartPulse,
  Sparkles,
} from 'lucide-react';

interface SugarSodiumQuickModalProps {
  isOpen: boolean;
  mode: 'sugar' | 'sodium';
  client: ClientProfile;
  defaultMealType?: MealType;
  onClose: () => void;
  onOpenLogMeal?: () => void;
  onOpenBloodSugar?: () => void;
}

const MEAL_SLOTS: MealType[] = [
  'Breakfast',
  'Morning Snack',
  'Lunch',
  'Evening Snack',
  'Dinner',
];

interface QuickPreset {
  id: string;
  label: string;
  subLabel: string;
  amount: number;
  calories: number;
  carbs: number;
}

const SUGAR_PRESETS: QuickPreset[] = [
  { id: 'tsp-1', label: '+1 tsp Sugar', subLabel: '4 g sugar · 16 kcal', amount: 4, calories: 16, carbs: 4 },
  { id: 'tsp-2', label: '+2 tsp (Tea / Coffee)', subLabel: '8 g sugar · 32 kcal', amount: 8, calories: 32, carbs: 8 },
  { id: 'jaggery', label: '+1 tbsp Honey / Jaggery', subLabel: '14 g sugar · 52 kcal', amount: 14, calories: 52, carbs: 14 },
  { id: 'sweet', label: '+Sweet / Dessert', subLabel: '20 g sugar · 140 kcal', amount: 20, calories: 140, carbs: 24 },
];

const SODIUM_PRESETS: QuickPreset[] = [
  { id: 'pinch', label: '+1 Pinch Table Salt', subLabel: '380 mg sodium · 0 kcal', amount: 380, calories: 0, carbs: 0 },
  { id: 'quarter', label: '+1/4 tsp Salt', subLabel: '580 mg sodium · 0 kcal', amount: 580, calories: 0, carbs: 0 },
  { id: 'half', label: '+1/2 tsp Salt', subLabel: '1,150 mg sodium · 0 kcal', amount: 1150, calories: 0, carbs: 0 },
  { id: 'pickle', label: '+Pickle / Pappadam', subLabel: '450 mg sodium · 35 kcal', amount: 450, calories: 35, carbs: 4 },
];

export const SugarSodiumQuickModal: React.FC<SugarSodiumQuickModalProps> = ({
  isOpen,
  mode,
  client,
  defaultMealType = 'Evening Snack',
  onClose,
  onOpenLogMeal,
  onOpenBloodSugar,
}) => {
  const {
    selectedDate,
    mealLogs,
    foods,
    addMealLog,
    updateMealLog,
    deleteMealLog,
    t,
  } = useApp();

  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [customLabel, setCustomLabel] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState<string>('0');
  const [editFiberVal, setEditFiberVal] = useState<string>('0');

  useEffect(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    if (isOpen) {
      setMealType(defaultMealType);
      setCustomAmount('');
      setCustomLabel('');
      setFeedback(null);
      setEditingLogId(null);
    }
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, [isOpen, mode, defaultMealType]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const dayMealLogs = useMemo(
    () => mealLogs.filter((m) => m.clientId === client.id && m.date === selectedDate),
    [mealLogs, client.id, selectedDate]
  );

  const audit = useMemo(
    () => analyzeDailySugarSodiumAndGlycemicLoad(client, dayMealLogs, foods, []),
    [client, dayMealLogs, foods]
  );

  const contributorRows = useMemo(() => {
    const rawTotal = mode === 'sugar' ? audit.consumed.sugar : audit.consumed.sodium;
    return dayMealLogs
      .map((log) => {
        const res = resolveMealLogNutrients(log, foods);
        const value = mode === 'sugar' ? Math.round(res.sugar * 10) / 10 : Math.round(res.sodium);
        const fiber = Math.round(res.fiber * 10) / 10;
        const sharePct = rawTotal > 0 && value > 0 ? Math.max(1, Math.round((value / rawTotal) * 100)) : 0;
        return { log, value, fiber, sharePct };
      })
      .sort((a, b) => b.value - a.value);
  }, [dayMealLogs, foods, mode, audit.consumed.sugar, audit.consumed.sodium]);

  if (!isOpen) return null;

  const isSugar = mode === 'sugar';
  const consumed = isSugar ? audit.consumed.sugar : audit.consumed.sodium;
  const target = isSugar ? audit.targets.sugar : audit.targets.sodium;
  const remaining = isSugar ? audit.sugarRemainingGrams : audit.sodiumRemainingMg;
  const unit = isSugar ? 'g' : 'mg';
  const pct = Math.min(100, Math.round((consumed / Math.max(1, target)) * 100));
  const isOver = consumed > target;

  const showToast = (msg: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setFeedback(msg);
    toastTimerRef.current = setTimeout(() => {
      setFeedback(null);
      toastTimerRef.current = null;
    }, 3500);
  };

  const handleAddPreset = (preset: QuickPreset) => {
    if (isSugar) {
      addMealLog({
        clientId: client.id,
        date: selectedDate,
        mealType,
        foodId: `quick-sugar-${preset.id}`,
        foodName: preset.label.replace(/^\+/, ''),
        quantity: 1,
        servingUnit: `${preset.amount} g sugar`,
        calories: preset.calories,
        protein: 0,
        carbs: preset.carbs,
        fat: 0,
        fiber: 0,
        sugar: preset.amount,
        sodium: 0,
        calorieQuality: preset.amount >= 10 ? 'bad' : 'good',
      });
      showToast(`Added +${preset.amount}g sugar to ${mealType} (${formatDateDisplay(selectedDate)})`);
    } else {
      addMealLog({
        clientId: client.id,
        date: selectedDate,
        mealType,
        foodId: `quick-sodium-${preset.id}`,
        foodName: preset.label.replace(/^\+/, ''),
        quantity: 1,
        servingUnit: `${preset.amount} mg sodium`,
        calories: preset.calories,
        protein: 0,
        carbs: preset.carbs,
        fat: preset.id === 'pickle' ? 1.5 : 0,
        fiber: 0,
        sugar: 0,
        sodium: preset.amount,
        calorieQuality: preset.amount >= 700 ? 'bad' : 'good',
      });
      showToast(`Added +${preset.amount}mg sodium to ${mealType} (${formatDateDisplay(selectedDate)})`);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customAmount);
    if (!Number.isFinite(val) || val <= 0) return;

    if (isSugar) {
      const grams = Math.round(val * 10) / 10;
      const itemName = customLabel.trim() || 'Direct Sugar Intake';
      addMealLog({
        clientId: client.id,
        date: selectedDate,
        mealType,
        foodId: 'quick-sugar-custom',
        foodName: itemName,
        quantity: 1,
        servingUnit: `${grams} g sugar`,
        calories: Math.round(grams * 4),
        protein: 0,
        carbs: grams,
        fat: 0,
        fiber: 0,
        sugar: grams,
        sodium: 0,
        calorieQuality: grams >= 10 ? 'bad' : 'good',
      });
      showToast(`Added ${itemName} (+${grams}g sugar) to ${mealType}`);
    } else {
      const mg = Math.round(val);
      const itemName = customLabel.trim() || 'Direct Salt / Sodium';
      addMealLog({
        clientId: client.id,
        date: selectedDate,
        mealType,
        foodId: 'quick-sodium-custom',
        foodName: itemName,
        quantity: 1,
        servingUnit: `${mg} mg sodium`,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: mg,
        calorieQuality: mg >= 700 ? 'bad' : 'good',
      });
      showToast(`Added ${itemName} (+${mg}mg sodium) to ${mealType}`);
    }

    setCustomAmount('');
    setCustomLabel('');
  };

  const beginEdit = (logId: string, val: number, fiber: number) => {
    setEditingLogId(logId);
    setEditVal(String(val));
    setEditFiberVal(String(fiber));
  };

  const saveEdit = (logId: string) => {
    const parsed = parseFloat(editVal);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    if (isSugar) {
      const fib = Math.max(0, parseFloat(editFiberVal) || 0);
      updateMealLog(logId, {
        sugar: Math.round(parsed * 10) / 10,
        fiber: Math.round(fib * 10) / 10,
      });
    } else {
      updateMealLog(logId, {
        sodium: Math.round(parsed),
      });
    }
    setEditingLogId(null);
    showToast(`Updated ${isSugar ? 'sugar' : 'sodium'} value for today's log.`);
  };

  return (
    <div
      className="fixed inset-0 z-[65] bg-slate-900/65 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 flex items-center justify-between gap-3 text-white shrink-0 ${
            isSugar
              ? 'bg-gradient-to-r from-pink-700 via-rose-700 to-rose-600'
              : 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              {isSugar ? <Candy className="w-5 h-5" /> : <Flame className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight truncate">
                  {isSugar ? t('Sugar Intake & Quick Add') : t('Sodium (Salt) & Quick Add')}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/20 uppercase shrink-0 tabular-nums">
                  {isSugar ? `Limit ≤ ${target}g` : `Limit ≤ ${target}mg`}
                </span>
              </div>
              <p className="text-[11px] text-white/90 truncate tabular-nums">
                {formatDateDisplay(selectedDate)} · {isSugar ? 'How much sugar needed vs consumed from foods' : 'How much sodium needed vs consumed from foods'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('Close')}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {feedback && (
            <div className="px-3.5 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Needed vs Consumed Progress Card */}
          <div
            className={`p-4 rounded-2xl border space-y-2.5 tabular-nums ${
              isSugar
                ? 'bg-pink-50/70 dark:bg-pink-950/30 border-pink-200 dark:border-pink-900'
                : 'bg-orange-50/70 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900'
            }`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span
                className={`text-xs font-extrabold uppercase tracking-wider ${
                  isSugar ? 'text-pink-900 dark:text-pink-200' : 'text-orange-900 dark:text-orange-200'
                }`}
              >
                {isSugar ? 'Daily Sugar From Foods' : 'Daily Sodium From Foods'}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-2xl font-black ${isOver ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                  {consumed}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  / {target} {unit}
                </span>
              </div>
            </div>

            <div className="w-full h-3 rounded-full bg-white dark:bg-slate-800 overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isOver
                    ? 'bg-rose-600'
                    : isSugar
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500'
                }`}
                style={{ width: `${Math.max(4, pct)}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span className={isOver ? 'text-rose-700 dark:text-rose-300 font-bold' : 'text-slate-600 dark:text-slate-300 font-medium'}>
                {isOver
                  ? `${Math.round((consumed - target) * 10) / 10} ${unit} above today's recommended ceiling`
                  : `${remaining} ${unit} remaining inside safe ceiling`}
              </span>
              {isSugar ? (
                <span className="text-slate-500 dark:text-slate-400">
                  Net Carbs: <b>{audit.netCarbsGrams}g</b> · Fiber: <b>{audit.consumed.fiber}g</b>
                </span>
              ) : (
                <span className="text-slate-500 dark:text-slate-400">
                  {client.hypertensionOrSaltSensitive || (client.diabeticStatus && client.diabeticStatus !== 'none')
                    ? 'Tightened 1,500mg AHA limit active'
                    : 'WHO 2,000mg daily standard'}
                </span>
              )}
            </div>
          </div>

          {/* Meal Slot Selector + 1-Tap Quick Add */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className={`w-4 h-4 ${isSugar ? 'text-pink-600 dark:text-pink-400' : 'text-orange-600 dark:text-orange-400'}`} />
                <span>{isSugar ? 'Quick 1-Tap Add Sugar' : 'Quick 1-Tap Add Sodium (Salt)'}</span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Adds directly to {formatDateDisplay(selectedDate)}
              </span>
            </div>

            {/* Slot Picker */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
              {MEAL_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setMealType(slot)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border whitespace-nowrap cursor-pointer transition-colors ${
                    mealType === slot
                      ? isSugar
                        ? 'bg-pink-700 text-white border-pink-700'
                        : 'bg-orange-600 text-white border-orange-600'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {t(slot)}
                </button>
              ))}
            </div>

            {/* Preset Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {(isSugar ? SUGAR_PRESETS : SODIUM_PRESETS).map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleAddPreset(preset)}
                  className={`p-2.5 rounded-xl border text-left bg-white dark:bg-slate-900 transition-all cursor-pointer ${
                    isSugar
                      ? 'border-pink-200 dark:border-pink-900/70 hover:bg-pink-50 dark:hover:bg-pink-950/50 hover:border-pink-400'
                      : 'border-orange-200 dark:border-orange-900/70 hover:bg-orange-50 dark:hover:bg-orange-950/50 hover:border-orange-400'
                  }`}
                >
                  <div className="font-extrabold text-slate-900 dark:text-white text-xs">
                    {preset.label}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                    {preset.subLabel}
                  </div>
                </button>
              ))}
            </div>

            {/* Direct Custom Amount Form */}
            <form onSubmit={handleAddCustom} className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder={isSugar ? 'Food / Drink name (e.g. Milk Chai)' : 'Source (e.g. Curry Salt / Soup)'}
                className="sm:col-span-5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
              <input
                type="number"
                step={isSugar ? '0.1' : '1'}
                min={isSugar ? '0.1' : '1'}
                max={isSugar ? '300' : '10000'}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder={isSugar ? 'Exact Sugar (g)' : 'Exact Sodium (mg)'}
                className="sm:col-span-4 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
              <button
                type="submit"
                disabled={!customAmount || parseFloat(customAmount) <= 0}
                className={`sm:col-span-3 py-2 px-3 rounded-xl font-extrabold text-white text-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 transition-colors ${
                  isSugar ? 'bg-pink-700 hover:bg-pink-800' : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isSugar ? 'Add Sugar' : 'Add Sodium'}</span>
              </button>
            </form>
          </div>

          {/* Today's Food Contributors (Edit or Remove) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
              <span className="font-extrabold text-slate-900 dark:text-white">
                {isSugar ? "Today's Foods & Sugar Contribution" : "Today's Foods & Sodium Contribution"} ({contributorRows.length})
              </span>
              <div className="flex items-center gap-2">
                {onOpenBloodSugar && isSugar && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenBloodSugar();
                    }}
                    className="text-[11px] font-bold text-rose-700 dark:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <HeartPulse className="w-3 h-3" />
                    <span>{t('Blood Sugar')}</span>
                  </button>
                )}
                {onOpenLogMeal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenLogMeal();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Utensils className="w-3 h-3" />
                    <span>+ {t('Log Meal')}</span>
                  </button>
                )}
              </div>
            </div>

            {contributorRows.length === 0 ? (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                No foods or {isSugar ? 'sugar' : 'sodium'} entries logged for {formatDateDisplay(selectedDate)} yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
                {contributorRows.map(({ log, value, fiber, sharePct }) => {
                  const isEditing = editingLogId === log.id;
                  return (
                    <div
                      key={log.id}
                      className="px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {log.foodName}{' '}
                          <span className="text-[11px] font-normal text-slate-500">
                            · {log.mealType}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                          {Math.round(log.calories)} kcal ·{' '}
                          <span className={isSugar ? 'text-pink-700 dark:text-pink-300 font-bold' : 'text-orange-700 dark:text-orange-300 font-bold'}>
                            {value} {unit} {sharePct > 0 ? `(${sharePct}%)` : ''}
                          </span>
                          {isSugar && ` · Fiber ${fiber}g`}
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                            {isSugar ? 'Sug(g)' : 'Na(mg)'}
                            <input
                              type="number"
                              step={isSugar ? '0.1' : '1'}
                              min={0}
                              value={editVal}
                              onChange={(e) => setEditVal(e.target.value)}
                              className="w-16 ml-1 px-1.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold tabular-nums"
                            />
                          </label>
                          {isSugar && (
                            <label className="text-[10px] font-bold text-lime-700 dark:text-lime-300">
                              Fib(g)
                              <input
                                type="number"
                                step="0.1"
                                min={0}
                                value={editFiberVal}
                                onChange={(e) => setEditFiberVal(e.target.value)}
                                className="w-14 ml-1 px-1.5 py-1 rounded-lg border border-lime-300 dark:border-lime-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold tabular-nums"
                              />
                            </label>
                          )}
                          <button
                            type="button"
                            onClick={() => saveEdit(log.id)}
                            className="p-1.5 rounded-lg bg-emerald-700 text-white cursor-pointer"
                            aria-label="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingLogId(null)}
                            className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                            aria-label="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => beginEdit(log.id, value, fiber)}
                            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteMealLog(log.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                            aria-label="Delete entry"
                            title="Remove entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
