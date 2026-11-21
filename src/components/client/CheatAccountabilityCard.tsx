import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getCalendarMonthCheatSummary,
  getWeeklyCheatAndCalorieDigest,
} from '../../utils/cheatAndAdaptiveEngine';
import { formatDateDisplay, getTodayString } from '../../utils/dateUtils';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Flame,
  Calendar,
  TrendingDown,
  TrendingUp,
  HeartHandshake,
  Dumbbell,
} from 'lucide-react';

interface CheatAccountabilityCardProps {
  onLogCheatOrMeal?: () => void;
  onLogWorkout?: () => void;
}

export const CheatAccountabilityCard: React.FC<CheatAccountabilityCardProps> = ({
  onLogCheatOrMeal,
  onLogWorkout,
}) => {
  const {
    activeClient,
    mealLogs,
    challenges,
    selectedDate,
    toggleChallengeComplete,
    updateChallengeMode,
    language,
  } = useApp();

  const isMl = language === 'ml';

  const monthlySummary = useMemo(() => {
    if (!activeClient) return null;
    return getCalendarMonthCheatSummary(mealLogs, activeClient.id, selectedDate);
  }, [activeClient, mealLogs, selectedDate]);

  const weeklyDigest = useMemo(() => {
    if (!activeClient) return null;
    return getWeeklyCheatAndCalorieDigest(mealLogs, activeClient, selectedDate);
  }, [activeClient, mealLogs, selectedDate]);

  const relevantChallenges = useMemo(() => {
    if (!activeClient) return [];
    const today = getTodayString();
    return challenges
      .filter(
        (c) =>
          c.clientId === activeClient.id &&
          (c.targetDate >= selectedDate || c.targetDate >= today || !c.completed)
      )
      .sort((a, b) => (a.completed === b.completed ? b.targetDate.localeCompare(a.targetDate) : a.completed ? 1 : -1))
      .slice(0, 2);
  }, [activeClient, challenges, selectedDate]);

  if (!activeClient || !monthlySummary || !weeklyDigest) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 min-w-0">
      {/* Header + Monthly Cheat Quota Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              {isMl ? 'ചീറ്റ് മീൽ & പ്രതിവാര റിപ്പോർട്ട്' : 'Monthly Treat & Accountability'}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {monthlySummary.monthLabel} · {monthlySummary.usedCount}/{monthlySummary.limit}{' '}
              {isMl ? 'ഉപയോഗിച്ചു' : 'monthly treat used'}
            </p>
          </div>
        </div>

        <span
          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border whitespace-nowrap ${
            monthlySummary.isAvailable
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800'
          }`}
        >
          {monthlySummary.isAvailable
            ? isMl
              ? 'ഈ മാസം 1 ട്രീറ്റ് ബാക്കിയുണ്ട്'
              : 'Cheat meal available this month'
            : isMl
            ? `ഉപയോഗിച്ചത്: ${formatDateDisplay(monthlySummary.firstUsedDate || selectedDate)}`
            : `Used on ${formatDateDisplay(monthlySummary.firstUsedDate || selectedDate)}`}
        </span>
      </div>

      {/* Monthly Balance Guidance */}
      <div className="text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800">
        <div className="space-y-0.5 min-w-0">
          {monthlySummary.isAvailable ? (
            <p className="font-medium leading-relaxed">
              {isMl
                ? 'നിങ്ങൾക്ക് മാസത്തിൽ ഒരു ചീറ്റ് മീൽ ആസ്വദിക്കാം. മനസ്സമാധാനത്തോടെ ഇഷ്ടഭക്ഷണം കഴിക്കാം.'
                : 'You have 1 planned treat meal available this month — enjoy mindfully without guilt.'}
            </p>
          ) : (
            <p className="font-medium leading-relaxed">
              {isMl
                ? `ഈ മാസത്തെ ചീറ്റ് മീൽ (${monthlySummary.firstUsedMealName || 'Meal'}) രേഖപ്പെടുത്തിയിട്ടുണ്ട്. അധിക ചീറ്റ് മീൽ അടുത്ത ദിവസത്തെ 50 പുഷ്-അപ്പ് + 50 സ്ക്വാട്ട് ചലഞ്ച് നൽകും.`
                : `Monthly treat used (${monthlySummary.firstUsedMealName || 'Logged meal'}). Any extra treat this month unlocks tomorrow's fun 50 push-ups + 50 squats accountability challenge.`}
            </p>
          )}
        </div>
        {onLogCheatOrMeal && (
          <button
            type="button"
            onClick={onLogCheatOrMeal}
            className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0 cursor-pointer"
          >
            {isMl ? 'ഭക്ഷണം രേഖപ്പെടുത്തുക →' : 'Log Meal / Treat →'}
          </button>
        )}
      </div>

      {/* Active Next-Day Accountability Challenge Cards */}
      {relevantChallenges.length > 0 && (
        <div className="space-y-2.5">
          {relevantChallenges.map((ch) => (
            <div
              key={ch.id}
              className={`rounded-2xl p-3.5 border transition-colors space-y-3 ${
                ch.completed
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                  : 'bg-[#FFF7F4] dark:bg-slate-800/80 border-[#F2C3B5] dark:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
                    <Dumbbell className="w-3.5 h-3.5 text-[#E06D53]" />
                    <span>Challenge for {formatDateDisplay(ch.targetDate)}</span>
                    <span aria-hidden="true">·</span>
                    <span>From {ch.triggerMealName}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                    {ch.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => toggleChallengeComplete(ch.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors ${
                    ch.completed
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white hover:border-emerald-500'
                  }`}
                >
                  {ch.completed ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Circle className="w-3.5 h-3.5" />
                  )}
                  <span>{ch.completed ? 'Completed' : 'Mark Complete'}</span>
                </button>
              </div>

              {/* Mode Switcher: Split into 5x10 vs Injury-Safe vs Full */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                {(
                  [
                    { key: 'split_sets', label: 'Split into 5×10 Sets' },
                    { key: 'joint_friendly', label: 'Beginner / Joint-Friendly' },
                    { key: 'standard', label: 'Single Session' },
                  ] as const
                ).map((modeOpt) => {
                  const active = ch.mode === modeOpt.key;
                  return (
                    <button
                      key={modeOpt.key}
                      type="button"
                      onClick={() => updateChallengeMode(ch.id, modeOpt.key, ch.setsCompleted)}
                      className={`px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                        active
                          ? 'bg-slate-900 dark:bg-emerald-700 text-white border-slate-900 dark:border-emerald-700'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {modeOpt.label}
                    </button>
                  );
                })}
              </div>

              {ch.mode === 'split_sets' && (
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-slate-600 dark:text-slate-300 font-semibold mr-1">
                    5 rounds (10 push-ups + 10 squats each):
                  </span>
                  {[1, 2, 3, 4, 5].map((setNum) => {
                    const done = (ch.setsCompleted || 0) >= setNum;
                    return (
                      <button
                        key={setNum}
                        type="button"
                        onClick={() =>
                          updateChallengeMode(
                            ch.id,
                            'split_sets',
                            done ? setNum - 1 : setNum
                          )
                        }
                        className={`w-7 h-7 rounded-lg font-black tabular-nums border cursor-pointer transition-colors ${
                          done
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                        }`}
                        aria-label={`Mark set ${setNum} complete`}
                      >
                        {setNum}
                      </button>
                    );
                  })}
                </div>
              )}

              {ch.mode === 'joint_friendly' && (
                <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700">
                  Joint-friendly swap: <b>5×10 Incline Wall Push-ups</b> + <b>5×10 Supported Chair Squats</b> + <b>5-min gentle walk</b>. Zero knee or wrist strain.
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Weekly 7-Day Digest Card */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{isMl ? '7-ദിവസത്തെ പ്രതിവാര അവലോകനം' : 'Weekly 7-Day Digest'}</span>
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
            {formatDateDisplay(weeklyDigest.startDate)} – {formatDateDisplay(weeklyDigest.endDate)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 tabular-nums text-center">
          <div className="rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/80">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
              Cheat Calories
            </span>
            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
              {weeklyDigest.totalCheatCalories} <span className="text-[10px] font-normal">kcal</span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-0.5 mt-0.5">
              {weeklyDigest.deltaCheatCalories <= 0 ? (
                <TrendingDown className="w-3 h-3 text-emerald-600" />
              ) : (
                <TrendingUp className="w-3 h-3 text-amber-600" />
              )}
              <span>
                {weeklyDigest.deltaCheatCalories > 0
                  ? `+${weeklyDigest.deltaCheatCalories}`
                  : weeklyDigest.deltaCheatCalories}{' '}
                vs prev
              </span>
            </span>
          </div>

          <div className="rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/80">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
              Days Over Goal
            </span>
            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
              {weeklyDigest.daysExceededTarget} <span className="text-[10px] font-normal">/ 7 days</span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Prev wk: {weeklyDigest.prevWeekDaysExceeded}d
            </span>
          </div>

          <div className="rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/80">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
              7-Day Avg Intake
            </span>
            <div className="text-sm sm:text-base font-black text-emerald-700 dark:text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 shrink-0" />
              <span>{weeklyDigest.avgDailyCalories || '—'}</span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Goal: {weeklyDigest.targetDailyCalories}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800 text-xs">
          <div className="flex items-start gap-2 text-emerald-950 dark:text-emerald-100 min-w-0 flex-1">
            <HeartHandshake className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-snug text-[11px] sm:text-xs font-medium">{weeklyDigest.tip}</p>
          </div>
          {onLogWorkout && (
            <button
              type="button"
              onClick={onLogWorkout}
              className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline shrink-0 cursor-pointer"
            >
              Log Movement →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
