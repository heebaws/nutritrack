import React, { useState, useMemo } from 'react';
import { ClientProfile, MealLogItem } from '../../types';
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
      const consumed = dayLogs.reduce((sum, l) => sum + (Number(l.calories) || 0), 0);
      const dayDifference = consumed - neededCalories; // > 0 is excess, < 0 is low/deficit

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
        consumed,
        dayDifference,
        runningCalorieBalance,
        projectedKgChange,
        isSuccess
      };
    });

    return rows;
  }, [clientLogs, neededCalories, isWeightGainGoal]);

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
              Calorie Trajectory &amp; Weight Projection
            </span>
            <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white/90 text-slate-700 border border-slate-200 shadow-2xs">
              8,000 kcal = 1 kg Rule
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg shadow-2xs ${
              isWeightGainGoal 
                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}>
              {isWeightGainGoal ? '🏋️ Weight Gain' : '🥗 Weight Loss'}
            </span>

            {onToggleHide && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleHide();
                }}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 bg-white/80 hover:bg-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-slate-200"
                title="Collapse whole section to single line"
              >
                <EyeOff className="w-3 h-3" />
                <span>Hide Line</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Point Content: Key Result, Cumulative Balance & Target */}
        <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              {isCelebrated ? (
                <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider bg-emerald-600 text-white px-3 py-1 rounded-full shadow-xs">
                  <Award className="w-3.5 h-3.5" />
                  Celebrated On Track
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider bg-rose-600 text-white px-3 py-1 rounded-full shadow-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Regression Notice
                </span>
              )}

              <span className="text-xs font-semibold text-slate-600">
                {trajectoryRows.length} Days Tracked Cumulative
              </span>
            </div>

            <div className="flex items-baseline gap-3 pt-0.5 flex-wrap">
              <span className={`text-2xl sm:text-3xl lg:text-4xl font-black ${
                isCelebrated ? 'text-emerald-700' : 'text-rose-700'
              }`}>
                {isGained ? `+${roundedKgStr} kg Gained` : `-${roundedKgStr} kg Weight Loss`}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-700 bg-white/80 px-2.5 py-1 rounded-lg border border-black/5">
                {cumulativeCalories > 0 ? `+${cumulativeCalories}` : cumulativeCalories} kcal net balance
              </span>
            </div>
          </div>

          {/* Right Side Stats & Touch to Expand Button */}
          <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 shrink-0">
            <div className="text-left sm:text-right">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Daily Needed Target
              </div>
              <div className="text-lg sm:text-xl font-black text-slate-800">
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
                  <span>Hide Details</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Touch for Details</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tactile hint bar at the bottom */}
        <div className="mt-3 pt-2.5 border-t border-black/5 flex items-center justify-between text-[11px] text-slate-600 font-medium">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            Every 8,000 kcal excess = 1 kg gained • Every 8,000 kcal deficit = 1 kg lost
          </span>
          <span className="hidden sm:inline font-bold underline group-hover:text-slate-900">
            {isDetailsOpen ? 'Click to collapse breakdown ▲' : 'Click / Touch to inspect previous days calculation ▼'}
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
                Clinical Cumulative Progress Analysis
              </span>
              <p className="font-medium">
                {isWeightGainGoal ? (
                  isGained ? (
                    <span className="text-emerald-900">
                      🎉 <b>Great job!</b> You have maintained a caloric surplus ({cumulativeCalories > 0 ? `+${cumulativeCalories}` : cumulativeCalories} kcal). Showing <b>{roundedKgStr} kg gained</b> on track with your weight gain target!
                    </span>
                  ) : (
                    <span className="text-rose-900">
                      ⚠️ <b>Deficit Alert:</b> You are in a caloric deficit ({cumulativeCalories} kcal). Showing <b>{roundedKgStr} kg lost</b>, which is a regression for your weight gain goal.
                    </span>
                  )
                ) : (
                  !isGained ? (
                    <span className="text-emerald-900">
                      🎉 <b>Outstanding Progress!</b> You have maintained a caloric deficit ({cumulativeCalories} kcal). Showing <b>{roundedKgStr} kg weight loss</b> celebrated for your fat loss target!
                    </span>
                  ) : (
                    <span className="text-rose-900">
                      ⚠️ <b>Surplus Alert:</b> You are in a caloric excess ({cumulativeCalories > 0 ? `+${cumulativeCalories}` : cumulativeCalories} kcal). Showing <b>{roundedKgStr} kg gained</b>, which is a regression for your weight loss goal.
                    </span>
                  )
                )}
              </p>
            </div>

            <div className="shrink-0 bg-white p-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 text-xs">
              <span className="block font-bold text-slate-800">Formula Rule:</span>
              <span>(Excess / Deficit) ÷ 8,000 kcal</span>
            </div>
          </div>

          {/* Table Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Daily Calorie Balance &amp; Running Cumulative Table</span>
              <span className="text-xs font-normal text-slate-500">
                ({trajectoryRows.length} Days Analyzed)
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
                <span>Add Data for Yesterday</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                title="Collapse detailed data"
              >
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Collapse</span>
              </button>
            </div>
          </div>

          {/* Historical Trajectory Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Target Needed</th>
                  <th className="py-3 px-4">Logged Intake</th>
                  <th className="py-3 px-4">Day Balance (Excess / Low)</th>
                  <th className="py-3 px-4">Cumulative Calorie Balance</th>
                  <th className="py-3 px-4">Projected Weight Impact</th>
                  <th className="py-3 px-4">Goal Evaluation</th>
                  <th className="py-3 px-4 text-right">Action</th>
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
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Today
                            </span>
                          )}
                          {isYesterday && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                              Yesterday
                            </span>
                          )}
                          {isTwoDaysAgo && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                              2 Days Ago
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Target */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {row.needed} kcal
                      </td>

                      {/* Logged Intake */}
                      <td className="py-3.5 px-4">
                        {row.logsCount > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{row.consumed} kcal</span>
                            <span className="text-[11px] text-slate-500">({row.logsCount} items)</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No food logged</span>
                        )}
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
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Celebrated</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Regression</span>
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
                          Log Food
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
                <b>Front Page Motivational Display:</b> This table continuously aggregates previous days&apos; caloric excess and lows using the clinical 8,000 kcal = 1 kg formula.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsDetailsOpen(false)}
              className="self-end sm:self-auto flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-200"
            >
              <ChevronUp className="w-4 h-4" />
              <span>Collapse Detailed Data</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
