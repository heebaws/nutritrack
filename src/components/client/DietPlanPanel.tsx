import React, { useMemo, useState } from 'react';
import { DietPlan, DietitianProfile, MealType } from '../../types';
import { useApp } from '../../context/AppContext';
import { generateAdaptiveDailyPlan } from '../../utils/cheatAndAdaptiveEngine';
import { formatDateDisplay } from '../../utils/dateUtils';
import {
  CalendarDays,
  RefreshCw,
  ArrowLeft,
  Plus,
  Sparkles,
  Droplets,
  Dumbbell,
  ShieldCheck,
  SlidersHorizontal,
  ArrowLeftRight,
  CheckCircle2,
} from 'lucide-react';

interface DietPlanPanelProps {
  assignedPlan?: DietPlan;
  assignedDietitian?: DietitianProfile;
  onBack: () => void;
  onOpenOnboarding: () => void;
  onOpenWorkoutModal: () => void;
}

export const DietPlanPanel: React.FC<DietPlanPanelProps> = ({
  assignedPlan,
  assignedDietitian,
  onBack,
  onOpenOnboarding,
  onOpenWorkoutModal,
}) => {
  const { activeClient, mealLogs, activities, foods, selectedDate, addMealLog, language, t } = useApp();
  const isMl = language === 'ml';

  const [swaps, setSwaps] = useState<Partial<Record<'Breakfast' | 'Lunch' | 'Evening Snack' | 'Dinner', number>>>({});
  const [regenerateOffset, setRegenerateOffset] = useState(0);
  const [addedSlotNotice, setAddedSlotNotice] = useState<string | null>(null);

  const adaptivePlan = useMemo(() => {
    if (!activeClient) return null;
    return generateAdaptiveDailyPlan({
      client: activeClient,
      foodsLibrary: foods,
      mealLogs,
      activities,
      dateStr: selectedDate,
      swaps,
      regenerateOffset,
    });
  }, [activeClient, foods, mealLogs, activities, selectedDate, swaps, regenerateOffset]);

  const eatenTodayKcal = useMemo(() => {
    if (!activeClient) return 0;
    return mealLogs
      .filter((l) => l.clientId === activeClient.id && l.date === selectedDate)
      .reduce((sum, l) => sum + (Number(l.calories) || 0), 0);
  }, [mealLogs, activeClient, selectedDate]);

  if (!activeClient || !adaptivePlan) return null;

  const handleSwapSlot = (slotKey: 'Breakfast' | 'Lunch' | 'Evening Snack' | 'Dinner') => {
    setSwaps((prev) => ({
      ...prev,
      [slotKey]: (prev[slotKey] ?? 0) + 1,
    }));
  };

  const handleLogSlotMeal = (slotPlan: (typeof adaptivePlan.mealSlots)[number]) => {
    const primary = slotPlan.primary;
    addMealLog({
      clientId: activeClient.id,
      date: selectedDate,
      mealType: slotPlan.mealType as MealType,
      foodId: primary.id,
      foodName: primary.name,
      quantity: 1,
      servingUnit: primary.portionLabel,
      calories: primary.calories,
      protein: primary.protein,
      carbs: primary.carbs,
      fat: primary.fat,
      fiber: primary.fiber,
      sugar: primary.sugar,
    });
    setAddedSlotNotice(`Logged ${primary.name} (${primary.calories} kcal) for ${formatDateDisplay(selectedDate)}`);
    setTimeout(() => setAddedSlotNotice(null), 3500);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#E06D53]" />
            <span>Diet Plan for {formatDateDisplay(selectedDate)}</span>
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Tailored to {activeClient.dietPreference || 'balanced'} eating · {adaptivePlan.experienceLevel} tier ·{' '}
            {activeClient.allergies?.length ? `Excludes: ${activeClient.allergies.join(', ')}` : 'No food exclusions'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSwaps({});
              setRegenerateOffset((n) => n + 1);
            }}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isMl ? 'ദിവസം പുതുക്കുക' : 'Regenerate Day'}</span>
          </button>

          <button
            type="button"
            onClick={onBack}
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('Back')}</span>
          </button>
        </div>
      </div>

      {/* Onboarding CTA Banner if user hasn't calibrated preferences yet */}
      {!activeClient.onboardingCompleted && (
        <div className="rounded-2xl p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-950 dark:text-amber-100">
            <SlidersHorizontal className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">
              Calibrate your eating style, allergies, equipment &amp; safe weekly pace for hyper-accurate plans.
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenOnboarding}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer shrink-0"
          >
            Personalize Now →
          </button>
        </div>
      )}

      {addedSlotNotice && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{addedSlotNotice}</span>
        </div>
      )}

      {adaptivePlan.cheatRebalanceNote && (
        <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-medium">
          {adaptivePlan.cheatRebalanceNote}
        </div>
      )}

      {/* Eaten vs Planned Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 tabular-nums text-center">
        <div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Planned Budget</span>
          <b className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{adaptivePlan.targetCalories} kcal</b>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Eaten Today</span>
          <b className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-400">{eatenTodayKcal} kcal</b>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Hydration Target</span>
          <b className="text-base sm:text-lg font-black text-cyan-700 dark:text-cyan-400 flex items-center justify-center gap-1">
            <Droplets className="w-3.5 h-3.5" />
            {adaptivePlan.hydrationTargetLiters} L
          </b>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Exercise Focus</span>
          <b className="text-xs sm:text-sm font-extrabold text-[#E06D53] truncate block mt-1">
            {adaptivePlan.exercisePlan.isRestDay ? 'Active Recovery' : `${adaptivePlan.exercisePlan.totalMinutes}m Training`}
          </b>
        </div>
      </div>

      {/* 4 Adaptive Meal Cards with 1-Tap Swap & Add to Log */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {adaptivePlan.mealSlots.map((slot) => {
          const opt = slot.primary;
          const slotKey = slot.mealType as 'Breakfast' | 'Lunch' | 'Evening Snack' | 'Dinner';
          return (
            <div
              key={slot.mealType}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">{t(slot.mealType)}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-1.5">· {slot.timeWindow}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSwapSlot(slotKey)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                    <span>Swap</span>
                  </button>
                </div>

                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {opt.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {opt.portionLabel} · {opt.prepTip}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 tabular-nums">
                  <b className="text-slate-900 dark:text-white">{opt.calories} kcal</b>
                  <span>· P {opt.protein}g</span>
                  <span>· C {opt.carbs}g</span>
                  <span>· F {opt.fat}g</span>
                  <span>· Fib {opt.fiber}g</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleLogSlotMeal(slot)}
                className="w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Log ({formatDateDisplay(selectedDate)})</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Adaptive Daily Tip + Exercise Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="rounded-2xl p-4 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
          <div className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Daily Nutrition Tip</span>
          </div>
          <p className="text-xs text-emerald-950 dark:text-emerald-100 leading-relaxed">
            {adaptivePlan.dailyTip}
          </p>
        </div>

        <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-[#E06D53] shrink-0" />
              <span className="truncate">{adaptivePlan.exercisePlan.focusTitle}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              {adaptivePlan.exercisePlan.totalMinutes} min · Est. burn -{adaptivePlan.exercisePlan.estimatedBurnKcal} kcal
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenWorkoutModal}
            className="px-3.5 py-2 rounded-xl bg-[#E06D53] hover:bg-[#cc5a41] text-white text-xs font-bold shrink-0 cursor-pointer"
          >
            Log Workout
          </button>
        </div>
      </div>

      {/* Prescribed Coach Guidelines (if present) */}
      {assignedPlan?.generalGuidelines && assignedPlan.generalGuidelines.length > 0 && (
        <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Coach Guidelines ({assignedDietitian?.name || 'Nutritionist'})
            </span>
            <span className="text-[11px] text-slate-400">{assignedPlan.title}</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
            {assignedPlan.generalGuidelines.map((g, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-[10px] text-slate-500 dark:text-slate-400 px-1">
        {adaptivePlan.clinicalDisclaimer}
      </p>
    </div>
  );
};
