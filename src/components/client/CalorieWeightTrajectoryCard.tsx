import React, { useState, useMemo } from 'react';
import { ClientProfile, MealLogItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { calculateCalorieBreakdown, calculateStepCalories } from '../../utils/calorieQuality';
import { 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  AlertTriangle, 
  Calendar, 
  Info, 
  PlusCircle, 
  CheckCircle2,
  Scale,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  getTodayString, 
  getYesterdayString, 
  getDaysAgoString, 
  formatDateDisplay,
  formatToLocalIsoDate
} from '../../utils/dateUtils';

interface CalorieWeightTrajectoryCardProps {
  client: ClientProfile;
  mealLogs: MealLogItem[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenLogModal: (mealType?: any) => void;
  onToggleHide?: () => void;
}

export const CalorieWeightTrajectoryCard: React.FC<CalorieWeightTrajectoryCardProps> = ({
  client,
  mealLogs,
  selectedDate,
  onSelectDate,
  onOpenLogModal,
  onToggleHide
}) => {
  const { activities, habits, t, language } = useApp();
  const isMl = language === 'ml';
  // Option to show/hide the detailed breakdown and previous days table when touching the main point
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  // 1. Determine client needed calories & goal direction
  const neededCalories = client.neededCalories || client.targetBmr || 1600;
  
  // Weight gain goal vs Weight loss goal
  const isWeightGainGoal = 
    client.goalType === 'gain' || 
    /gain|bulk|muscle|increase/i.test(client.goal || '');

  // 2. Aggregate logs for Sarah/current client across dates
  const clientLogs = useMemo(() => {
    return mealLogs.filter(l => l.clientId === client.id);
  }, [mealLogs, client.id]);

  // Build list of unique dates to display (last 5 days minimum, plus any logged dates)
  const trajectoryRows = useMemo(() => {
    const today = getTodayString();
    const dateSet = new Set<string>();

    // Add recent 5 days
    for (let i = 0; i < 5; i++) {
      dateSet.add(getDaysAgoString(i));
    }

    // Add any dates that have logs
    clientLogs.forEach(l => {
      if (l.date && l.date <= today) {
        dateSet.add(l.date);
      }
    });

    // Sort dates chronologically from oldest to newest to compute running cumulative
    const sortedDates = Array.from(dateSet).sort();

    let runningCalorieBalance = 0;

    const rows = sortedDates.map(date => {
      const dayLogs = clientLogs.filter(l => l.date === date);
      const dayActivities = activities.filter(a => a.clientId === client.id && a.date === date);
      const activityBurn = dayActivities.reduce((sum, a) => sum + (Number(a.caloriesBurned) || 0), 0);
      const dayHabit = habits.find(h => h.clientId === client.id && h.date === date);
      const stepBurn = calculateStepCalories(dayHabit?.steps || 0, client.currentWeightKg);
      const dayBurn = activityBurn + stepBurn;
      const breakdown = calculateCalorieBreakdown(dayLogs, dayBurn);

      // MANDATE: burned calories (workouts + walking steps) minused from total eaten = net calories
      const dayDifference = breakdown.netCalories - neededCalories; // > 0 is excess, < 0 is deficit

      runningCalorieBalance += dayDifference;

      // 8000 kcal = 1 kg rule
      const projectedKgChange = runningCalorieBalance / 8000;

      // Check celebration vs regression for this running point
      let isSuccess = false;
      if (isWeightGainGoal) {
        isSuccess = runningCalorieBalance >= 0;
      } else {
        isSuccess = runningCalorieBalance <= 0;
      }

      return {
        date,
        logsCount: dayLogs.length,
        needed: neededCalories,
        consumed: breakdown.totalCalories,
        goodCalories: breakdown.goodCalories,
        badCalories: breakdown.badCalories,
        caloriesBurned: breakdown.caloriesBurned,
        netCalories: breakdown.netCalories,
        dayDifference,
        runningCalorieBalance,
        projectedKgChange,
        isSuccess
      };
    });

    return rows;
  }, [clientLogs, activities, habits, client.id, client.currentWeightKg, neededCalories, isWeightGainGoal]);

  // Current overall cumulative status (as of the latest row / today)
  const latestRow = trajectoryRows[trajectoryRows.length - 1] || {
    runningCalorieBalance: 0,
    projectedKgChange: 0,
    isSuccess: true
  };

  const cumulativeCalories = latestRow.runningCalorieBalance;
  const projectedKg = Math.abs(latestRow.projectedKgChange);
  const roundedKgStr = projectedKg.toFixed(1);
  const isGained = cumulativeCalories >= 0;

  // Determine celebration wording
  const isCelebrated = isWeightGainGoal ? isGained : !isGained;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xs border border-slate-200 space-y-4">
      
      {/* ================= UPPER SECTION: 8,000 CALORIE MAIN POINT ================= */}
      {/* Touchable Main Point Hero Banner */}
      <div 
        onClick={() => setIsDetailsOpen(!isDetailsOpen)}
        className={`rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer group select-none shadow-xs hover:shadow-md ${
          isCelebrated
            ? 'bg-linear-to-r from-emerald-50 via-teal-50/80 to-emerald-100/60 border-emerald-300 text-emerald-950 hover:border-emerald-400'
            : 'bg-linear-to-r from-rose-50 via-red-50/80 to-orange-50/60 border-rose-300 text-rose-950 hover:border-rose-400'
        }`}
        title="Touch / Click to show or hide the detailed previous days breakdown"
      >
        {/* Top Badges & Hide Line Tool */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-black/5">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-white/90 shadow-2xs flex items-center justify-center text-emerald-700 font-bold">
              <Scale className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
              {t('Calorie Trajectory & Weight Projection')}
            </span>
            <span className="text-[11px] font-bold text-slate-600">
              · {t('8,000 kcal = 1 kg Rule')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg shadow-2xs ${
              isWeightGainGoal 
                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}>
              {isWeightGainGoal ? t('Weight Gain') : t('Weight Loss')}
            </span>

            {onToggleHide && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleHide();
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer border border-slate-300 shadow-2xs"
                title={t('Hide Line')}
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>{t('Hide Line')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Point Content: Key Result, Cumulative Balance & Target */}
        <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              {isCelebrated ? (
                <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-0.5 rounded-lg shadow-xs">
                  <Award className="w-3.5 h-3.5" />
                  {t('Celebrated On Track')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider bg-rose-600 text-white px-2.5 py-0.5 rounded-lg shadow-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {t('Regression Notice')}
                </span>
              )}

              <span className="text-xs font-semibold text-slate-600 tabular-nums">
                {trajectoryRows.length} {isMl ? 'ദിവസങ്ങൾ' : 'Days'}
              </span>
            </div>

            <div className="flex items-baseline gap-3 pt-0.5 flex-wrap">
              <span className={`text-2xl sm:text-3xl lg:text-4xl font-black tabular-nums ${
                isCelebrated ? 'text-emerald-700' : 'text-rose-700'
              }`}>
                {isGained ? `+${roundedKgStr} kg` : `-${roundedKgStr} kg`}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-700 bg-white/80 px-2.5 py-1 rounded-lg border border-black/5 tabular-nums">
                {cumulativeCalories > 0 ? `+${cumulativeCalories}` : cumulativeCalories} kcal
              </span>
            </div>
          </div>

          {/* Right Side Stats & Touch to Expand Button */}
          <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 shrink-0">
            <div className="text-left sm:text-right">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                {t('Daily Needed Target')}
              </div>
              <div className="text-lg sm:text-xl font-black text-slate-800 tabular-nums">
                {neededCalories} <span className="text-xs font-normal text-slate-500">kcal/day</span>
              </div>
            </div>

            {/* Interactive Touch Indicator Button */}
            <div 
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all shadow-xs border ${
                isDetailsOpen 
                  ? 'bg-slate-900 text-white border-slate-800' 
                  : 'bg-white text-slate-900 border-slate-300 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-800'
              }`}
            >
              {isDetailsOpen ? (
                <>
                  <span>{t('Hide Details')}</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>{t('Touch for Details')}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tactile hint bar at the bottom */}
        <div className="mt-3 pt-2.5 border-t border-black/5 flex items-center justify-between text-[11px] text-slate-600 font-medium">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            {t('Every 8,000 kcal excess = 1 kg gained • Every 8,000 kcal deficit = 1 kg lost')}
          </span>
          <span className="hidden sm:inline font-bold underline group-hover:text-slate-900 shrink-0">
            {isDetailsOpen ? t('Collapse') : t('Touch for Details')}
          </span>
        </div>
      </div>

      {/* ================= EXPANDED DETAILED DATA SECTION ================= */}
      {isDetailsOpen && (
        <div className="space-y-4 pt-2 transition-all">
          
          {/* Detailed Clinical Assessment & Formula Box */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {t('Clinical Cumulative Progress Analysis')}
              </span>
              <p className="font-medium">
                {isWeightGainGoal ? (
                  isGained ? (
                    <span className="text-emerald-900">
                      {isMl ? (
                        <>🎉 <b>അഭിനന്ദനങ്ങൾ!</b> നിങ്ങൾ അധിക കലോറി നിലനിർത്തി ({cumulativeCalories > 0 ? `+${cumulativeCalories}` : cumulativeCalories} kcal). ഭാരം കൂട്ടൽ ലക്ഷ്യത്തിന് അനുസൃതമായി <b>{roundedKgStr} kg വർദ്ധനവ്</b> കാണിക്കുന്നു!</>
                      ) : (
                        <>🎉 <b>Great job!</b> You have maintained a caloric surplus ({cumulativeCalories > 0 ? `+${cumulativeCalories}` : cumulativeCalories} kcal). Showing <b>{roundedKgStr} kg gained</b> on track with your weight gain target!</>
                      )}
                    </span>
                  ) : (
                    <span className="text-rose-900">
                      {isMl ? (
                        <>⚠️ <b>കലോറി കുറവ്:</b> നിലവിൽ കലോറി കുറവിലാണ് ({cumulativeCalories} kcal). <b>{roundedKgStr} kg കുറവ്</b> കാണിക്കുന്നത് നിങ്ങളുടെ ഭാരം കൂട്ടൽ ലക്ഷ്യത്തിന് വിരുദ്ധമാണ്.</>
                      ) : (
                        <>⚠️ <b>Deficit Alert:</b> You are in a caloric deficit ({cumulativeCalories} kcal). Showing <b>{roundedKgStr} kg lost</b>, which is a regression for your weight gain goal.</>
                      )}
                    </span>
                  )
                ) : (
                  !isGained ? (
                    <span className="text-emerald-900">
                      {isMl ? (
                        <>🎉 <b>മികച്ച പുരോഗതി!</b> നിങ്ങൾ കലോറി കുറവ് നിലനിർത്തി ({cumulativeCalories} kcal). ഭാരം കുറയ്ക്കൽ ലക്ഷ്യത്തിലേക്ക് <b>{roundedKgStr} kg കുറവ്</b> രേഖപ്പെടുത്തി!</>
                      ) : (
                        <>🎉 <b>Outstanding Progress!</b> You have maintained a caloric deficit ({cumulativeCalories} kcal). Showing <b>{roundedKgStr} kg weight loss</b> celebrated for your fat loss target!</>
                      )}
                    </span>
                  ) : (
                    <span className="text-rose-900">
                      {isMl ? (
                        <>⚠️ <b>അധിക കലോറി മുന്നറിയിപ്പ്:</b> നിലവിൽ അധിക കലോറിയിലാണ് ({cumulativeCalories > 0 ? `+${cumulativeCalories}` : cumulativeCalories} kcal). <b>{roundedKgStr} kg വർദ്ധനവ്</b> കാണിക്കുന്നു.</>
                      ) : (
                        <>⚠️ <b>Surplus Alert:</b> You are in a caloric excess ({cumulativeCalories > 0 ? `+${cumulativeCalories}` : cumulativeCalories} kcal). Showing <b>{roundedKgStr} kg gained</b>, which is a regression for your weight loss goal.</>
                      )}
                    </span>
                  )
                )}
              </p>
            </div>

            <div className="shrink-0 bg-white p-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 text-xs">
              <span className="block font-bold text-slate-800">{isMl ? 'കണക്കുകൂട്ടൽ സൂത്രവാക്യം:' : 'Formula Rule:'}</span>
              <span>{isMl ? '(അധികം / കുറവ്) ÷ 8,000 kcal' : '(Excess / Deficit) ÷ 8,000 kcal'}</span>
            </div>
          </div>

          {/* Table Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>{t('Daily Calorie Balance & Running Cumulative Table')}</span>
              <span className="text-xs font-normal text-slate-500 tabular-nums">
                ({trajectoryRows.length})
              </span>
            </h3>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onSelectDate(getYesterdayString());
                  onOpenLogModal();
                }}
                className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t('Add Data for Yesterday')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                title={t('Collapse')}
              >
                <ChevronUp className="w-3.5 h-3.5" />
                <span>{t('Collapse')}</span>
              </button>
            </div>
          </div>

          {/* Historical Trajectory Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4">{t('Date')}</th>
                  <th className="py-3 px-4">{t('Normal Baseline')}</th>
                  <th className="py-3 px-3 text-emerald-800">{t('Good Cal')}</th>
                  <th className="py-3 px-3 text-amber-900">{t('Bad Cal')}</th>
                  <th className="py-3 px-3">{t('Total Eaten')}</th>
                  <th className="py-3 px-3 text-orange-700">{t('Sports Burn')}</th>
                  <th className="py-3 px-3 text-blue-900">{t('Net Intake')}</th>
                  <th className="py-3 px-4">{t('Day Balance')}</th>
                  <th className="py-3 px-4">{t('Cumulative Balance')}</th>
                  <th className="py-3 px-4">{t('Projected Weight Impact')}</th>
                  <th className="py-3 px-4">{t('Goal Evaluation')}</th>
                  <th className="py-3 px-4 text-right">{t('Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trajectoryRows.map((row) => {
                  const isSelected = row.date === selectedDate;
                  const isToday = row.date === getTodayString();
                  const isYesterday = row.date === getYesterdayString();
                  const isTwoDaysAgo = row.date === getDaysAgoString(2);

                  const dayDiffSign = row.dayDifference > 0 ? `+${row.dayDifference}` : `${row.dayDifference}`;
                  const cumSign = row.runningCalorieBalance > 0 ? `+${row.runningCalorieBalance}` : `${row.runningCalorieBalance}`;
                  const rowProjectedKg = Math.abs(row.projectedKgChange).toFixed(2);
                  const kgLabel = row.runningCalorieBalance >= 0 ? `+${rowProjectedKg} kg Gained` : `-${rowProjectedKg} kg Lost`;

                  return (
                    <tr 
                      key={row.date} 
                      className={`transition-colors ${
                        isSelected 
                          ? 'bg-emerald-50/70 font-medium' 
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{formatDateDisplay(row.date)}</span>
                          {isToday && (
                            <span className="text-[10px] font-bold uppercase text-emerald-700">
                              · {t('Today')}
                            </span>
                          )}
                          {isYesterday && (
                            <span className="text-[10px] font-bold uppercase text-blue-700">
                              · {t('Yesterday')}
                            </span>
                          )}
                          {isTwoDaysAgo && (
                            <span className="text-[10px] font-bold uppercase text-amber-700">
                              · {t('2 Days Ago')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Target */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {row.needed} kcal
                      </td>

                      {/* Good Calories */}
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-xs">
                          🍏 {row.goodCalories} kcal
                        </span>
                      </td>

                      {/* Bad Calories */}
                      <td className="py-3.5 px-3">
                        <span className={`font-bold px-2 py-0.5 rounded-md border text-xs ${
                          row.badCalories > 0 
                            ? 'text-amber-900 bg-amber-50 border-amber-300' 
                            : 'text-slate-400 bg-slate-50 border-slate-200'
                        }`}>
                          🍟 {row.badCalories} kcal
                        </span>
                      </td>

                      {/* Logged Intake Total */}
                      <td className="py-3.5 px-3">
                        {row.logsCount > 0 ? (
                          <div className="flex items-center gap-1">
                            <span className="font-extrabold text-slate-900">{row.consumed} kcal</span>
                            <span className="text-[10px] text-slate-400">({row.logsCount})</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">0 kcal</span>
                        )}
                      </td>

                      {/* Activity Burn (e.g. Football) */}
                      <td className="py-3.5 px-3">
                        {row.caloriesBurned > 0 ? (
                          <span className="font-extrabold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md text-xs">
                            -{row.caloriesBurned} kcal
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">0 kcal</span>
                        )}
                      </td>

                      {/* Net Intake */}
                      <td className="py-3.5 px-3">
                        <span className="font-black text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md text-xs">
                          {row.netCalories} kcal
                        </span>
                      </td>

                      {/* Day Balance */}
                      <td className="py-3.5 px-4">
                        {row.logsCount > 0 ? (
                          <span className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-full ${
                            row.dayDifference > 0 
                              ? 'bg-amber-100 text-amber-900' 
                              : row.dayDifference < 0
                                ? 'bg-sky-100 text-sky-900'
                                : 'bg-slate-100 text-slate-800'
                          }`}>
                            {row.dayDifference > 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            <span>{dayDiffSign} kcal {row.dayDifference > 0 ? 'Excess' : 'Low/Deficit'}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">0 kcal</span>
                        )}
                      </td>

                      {/* Cumulative Calorie Balance */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <span className="text-xs font-mono">
                          {cumSign} kcal
                        </span>
                      </td>

                      {/* Projected Weight Impact */}
                      <td className="py-3.5 px-4">
                        <span className={`font-black text-xs sm:text-sm px-2.5 py-1 rounded-lg ${
                          row.isSuccess 
                            ? 'bg-emerald-100 text-emerald-900 font-extrabold' 
                            : 'bg-rose-100 text-rose-900 font-extrabold'
                        }`}>
                          {kgLabel}
                        </span>
                      </td>

                      {/* Goal Evaluation */}
                      <td className="py-3.5 px-4">
                        {row.isSuccess ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{t('Celebrated')}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>{t('Regression')}</span>
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectDate(row.date);
                            onOpenLogModal();
                          }}
                          className="text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-slate-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          title={`Log food for ${row.date}`}
                        >
                          {t('Log Food')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Collapse Button & Guidance Note */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p>
                <b>{t('8,000 kcal Projection')}:</b> {t('Every 8,000 kcal excess = 1 kg gained • Every 8,000 kcal deficit = 1 kg lost')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsDetailsOpen(false)}
              className="self-end sm:self-auto flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-200"
            >
              <ChevronUp className="w-4 h-4" />
              <span>{t('Collapse Detailed Data')}</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
