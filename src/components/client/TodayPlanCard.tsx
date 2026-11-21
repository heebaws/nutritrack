import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { evaluateExperienceLevel, generateAdaptiveDailyPlan } from '../../utils/cheatAndAdaptiveEngine';
import { formatDateDisplay } from '../../utils/dateUtils';
import {
  Dumbbell,
  CalendarDays,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
} from 'lucide-react';

interface TodayPlanCardProps {
  onOpenDietPlan: () => void;
  onOpenWorkoutModal: () => void;
  onOpenOnboarding: () => void;
}

export const TodayPlanCard: React.FC<TodayPlanCardProps> = ({
  onOpenDietPlan,
  onOpenWorkoutModal,
  onOpenOnboarding,
}) => {
  const { activeClient, mealLogs, activities, selectedDate, addActivity, language } = useApp();
  const isMl = language === 'ml';

  const experience = useMemo(() => {
    if (!activeClient) return null;
    return evaluateExperienceLevel(activeClient, mealLogs, activities, selectedDate);
  }, [activeClient, mealLogs, activities, selectedDate]);

  const dailyPlan = useMemo(() => {
    if (!activeClient) return null;
    return generateAdaptiveDailyPlan({
      client: activeClient,
      mealLogs,
      activities,
      dateStr: selectedDate,
    });
  }, [activeClient, mealLogs, activities, selectedDate]);

  if (!activeClient || !experience || !dailyPlan) return null;

  const { exercisePlan } = dailyPlan;

  const handleQuickLogRoutine = () => {
    addActivity({
      clientId: activeClient.id,
      date: selectedDate,
      activityName: exercisePlan.focusTitle,
      intensity: exercisePlan.isRestDay ? 'light' : 'moderate',
      durationMinutes: exercisePlan.totalMinutes,
      caloriesBurned: exercisePlan.estimatedBurnKcal,
      notes: `Logged from ${experience.level} Adaptive Routine`,
    });
    onOpenWorkoutModal();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5 min-w-0">
      {/* Header + Dynamic Experience Tier */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              {isMl ? 'ഇന്നത്തെ പ്ലാനും പരിശീലന നിലവാരവും' : "Today's Adaptive Workout & Level"}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate tabular-nums">
              {formatDateDisplay(selectedDate)} · {experience.rationale}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-extrabold tabular-nums">
            {experience.level} · {experience.score}/100
          </span>
          <button
            type="button"
            onClick={onOpenOnboarding}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            title="Calibrate Preferences"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>{activeClient.onboardingCompleted ? 'Recalibrate' : 'Calibrate'}</span>
          </button>
        </div>
      </div>

      {/* Exercise Summary + 3 Phase Blocks */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <Sparkles className="w-3.5 h-3.5 text-[#E06D53]" />
          <span>{exercisePlan.focusTitle}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-300 tabular-nums">
          <span>{exercisePlan.totalMinutes} min</span>
          <span>·</span>
          <span className="text-orange-600 dark:text-orange-400 flex items-center gap-0.5">
            <Flame className="w-3 h-3" />-{exercisePlan.estimatedBurnKcal} kcal
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {exercisePlan.blocks.map((block) => (
          <div
            key={block.phase}
            className="rounded-2xl p-3 bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/80 space-y-1.5"
          >
            <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-900 dark:text-white">
              <span>{block.phase}</span>
              <span className="text-emerald-700 dark:text-emerald-400 tabular-nums">{block.durationMinutes}m</span>
            </div>
            <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
              {block.items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-snug">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {exercisePlan.modificationNote}
        </span>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenDietPlan}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <CalendarDays className="w-3.5 h-3.5 text-[#E06D53]" />
            <span>Open Diet Plan</span>
          </button>

          <button
            type="button"
            onClick={handleQuickLogRoutine}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Log This Workout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
