import React, { useState, useMemo, useEffect } from 'react';
import { ClientProfile, MealLogItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { calculateCalorieBreakdown, calculateStepCalories } from '../../utils/calorieQuality';
import {
  assessBMI,
  calculateMifflinTDEE,
  cmToFtIn,
  ftInToCm,
  kgToLbs,
  lbsToKg,
  computeProjectedGoalDate,
  CLINICAL_DISCLAIMER,
} from '../../utils/clinicalSafety';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
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
  EyeOff,
  ChevronDown,
  ChevronUp,
  Footprints,
  Dumbbell,
  Smartphone,
  Plus,
  BarChart3,
  Activity,
  RotateCcw,
} from 'lucide-react';
import { 
  getTodayString, 
  getYesterdayString, 
  getDaysAgoString, 
  formatDateDisplay
} from '../../utils/dateUtils';

interface CalorieWeightTrajectoryCardProps {
  client: ClientProfile;
  mealLogs: MealLogItem[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenLogModal: (mealType?: any) => void;
  onToggleHide?: () => void;
  onOpenStepsModal?: () => void;
  onOpenWorkoutModal?: () => void;
}

export const CalorieWeightTrajectoryCard: React.FC<CalorieWeightTrajectoryCardProps> = ({
  client,
  mealLogs,
  selectedDate,
  onSelectDate,
  onOpenLogModal,
  onToggleHide,
  onOpenStepsModal,
  onOpenWorkoutModal,
}) => {
  const { activities, habits, measurements, isPedometerLive, osHealthInfo, t, language } = useApp();
  const isMl = language === 'ml';
  // Option to show/hide the detailed breakdown and previous days table when touching the main point
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [analyticsTab, setAnalyticsTab] = useState<'calories' | 'weight' | 'bmi'>('calories');

  // Interactive BMI Calculator State (synced with profile initially, toggleable Metric vs Imperial)
  const [bmiUnit, setBmiUnit] = useState<'metric' | 'imperial'>(client.preferredUnitSystem || 'metric');
  const [calcWeightKg, setCalcWeightKg] = useState<number>(client.currentWeightKg || 65);
  const [calcHeightCm, setCalcHeightCm] = useState<number>(client.heightCm || 168);
  const [calcFeet, setCalcFeet] = useState<number>(() => cmToFtIn(client.heightCm || 168).feet);
  const [calcInches, setCalcInches] = useState<number>(() => cmToFtIn(client.heightCm || 168).inches);

  useEffect(() => {
    setCalcWeightKg(client.currentWeightKg || 65);
    const hCm = client.heightCm || 168;
    setCalcHeightCm(hCm);
    const fi = cmToFtIn(hCm);
    setCalcFeet(fi.feet);
    setCalcInches(fi.inches);
    if (client.preferredUnitSystem) setBmiUnit(client.preferredUnitSystem);
  }, [client.id, client.currentWeightKg, client.heightCm, client.preferredUnitSystem]);

  const effectiveBmiHeightCm = bmiUnit === 'imperial' ? ftInToCm(calcFeet, calcInches) : calcHeightCm;
  const bmiInfo = useMemo(
    () => assessBMI(calcWeightKg, effectiveBmiHeightCm),
    [calcWeightKg, effectiveBmiHeightCm]
  );

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

  // Last 7 days chart data for Daily Calories vs Target
  const last7CaloriesSeries = useMemo(() => {
    const out: Array<{ label: string; net: number; eaten: number; target: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = getDaysAgoString(i);
      const match = trajectoryRows.find((r) => r.date === d);
      out.push({
        label: d.slice(5),
        net: match ? match.netCalories : 0,
        eaten: match ? match.consumed : 0,
        target: neededCalories,
      });
    }
    return out;
  }, [trajectoryRows, neededCalories]);

  // Weight Trend & Projected Goal Date
  const { tdee } = useMemo(
    () =>
      calculateMifflinTDEE({
        weightKg: client.currentWeightKg || 65,
        heightCm: client.heightCm || 168,
        age: client.age || 30,
        gender: client.gender || 'Male',
        activityLevel: client.activityLevel || 'moderate',
      }),
    [client]
  );

  const recent7AvgDelta = useMemo(() => {
    const logged = trajectoryRows.slice(-7).filter((r) => r.logsCount > 0);
    if (logged.length === 0) return undefined;
    return Math.round(logged.reduce((s, r) => s + r.dayDifference, 0) / logged.length);
  }, [trajectoryRows]);

  const goalProjection = useMemo(
    () =>
      computeProjectedGoalDate({
        currentWeightKg: client.currentWeightKg || 65,
        targetWeightKg: client.targetWeightKg || 62,
        goalType: client.goalType || (isWeightGainGoal ? 'gain' : 'loss'),
        dailyTargetCalories: neededCalories,
        estimatedTdee: tdee,
        recent7DayAvgNetDelta: recent7AvgDelta,
      }),
    [client.currentWeightKg, client.targetWeightKg, client.goalType, isWeightGainGoal, neededCalories, tdee, recent7AvgDelta]
  );

  const weightCurveSeries = useMemo(() => {
    const clientMeas = measurements
      .filter((m) => m.clientId === client.id)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-6)
      .map((m) => ({
        label: m.date.slice(5),
        actualKg: Number(m.weightKg.toFixed(1)),
        projectedKg: Number(m.weightKg.toFixed(1)),
      }));

    if (clientMeas.length === 0) {
      clientMeas.push({
        label: 'Now',
        actualKg: client.currentWeightKg,
        projectedKg: client.currentWeightKg,
      });
    }

    const baseW = client.currentWeightKg;
    const weeklyDelta = goalProjection.projectedWeeklyKg || (isWeightGainGoal ? 0.25 : -0.45);
    const futurePoints = [1, 2, 4].map((wks) => {
      const d = new Date();
      d.setDate(d.getDate() + wks * 7);
      const nextW = Math.round((baseW + weeklyDelta * wks) * 10) / 10;
      const clampedW = isWeightGainGoal
        ? Math.min(client.targetWeightKg + 1, nextW)
        : Math.max(client.targetWeightKg - 0.5, nextW);
      return {
        label: `+${wks}w`,
        actualKg: undefined as number | undefined,
        projectedKg: clampedW,
      };
    });

    return [
      ...clientMeas.map((m) => ({
        label: m.label,
        actualKg: m.actualKg as number | undefined,
        projectedKg: m.projectedKg,
      })),
      ...futurePoints,
    ];
  }, [measurements, client.id, client.currentWeightKg, client.targetWeightKg, goalProjection.projectedWeeklyKg, isWeightGainGoal]);

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

  // Selected date Workouts & Walking Steps summary (feeds directly into Net Calories & 8,000 kcal projection)
  const selectedDayActivityData = useMemo(() => {
    const dayHabit = habits.find(h => h.clientId === client.id && h.date === selectedDate);
    const steps = dayHabit?.steps || 0;
    const targetSteps = dayHabit?.targetSteps || 8000;
    const stepPct = Math.min(100, Math.round((steps / targetSteps) * 100));
    const stepBurn = calculateStepCalories(steps, client.currentWeightKg);
    const estKm = (steps * 0.00075).toFixed(1);

    const dayWorkouts = activities.filter(a => a.clientId === client.id && a.date === selectedDate);
    const workoutBurn = dayWorkouts.reduce((sum, a) => sum + (Number(a.caloriesBurned) || 0), 0);
    const workoutMins = dayWorkouts.reduce((sum, a) => sum + (Number(a.durationMinutes) || 0), 0);
    const workoutTargetKcal = 300;
    const workoutPct = Math.min(100, Math.round((workoutBurn / workoutTargetKcal) * 100));

    const totalBurn = stepBurn + workoutBurn;

    return {
      steps,
      targetSteps,
      stepPct,
      stepBurn,
      estKm,
      dayWorkouts,
      workoutBurn,
      workoutMins,
      workoutPct,
      totalBurn,
    };
  }, [habits, activities, client.id, client.currentWeightKg, selectedDate]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-xs border border-slate-200 dark:border-slate-800 space-y-2.5 sm:space-y-3.5 min-w-0 w-full overflow-hidden flex flex-col justify-between">
      
      {/* ================= UPPER SECTION: 8,000 CALORIE MAIN POINT ================= */}
      {/* Touchable Main Point Hero Banner */}
      <div 
        onClick={() => setIsDetailsOpen(!isDetailsOpen)}
        className={`rounded-xl sm:rounded-2xl p-2.5 sm:p-5 border transition-all cursor-pointer group select-none shadow-xs hover:shadow-md min-w-0 ${
          isCelebrated
            ? 'bg-linear-to-r from-emerald-50 via-teal-50/80 to-emerald-100/60 dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 hover:border-emerald-400'
            : 'bg-linear-to-r from-rose-50 via-red-50/80 to-orange-50/60 dark:from-rose-950/60 dark:via-red-950/40 dark:to-slate-900 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100 hover:border-rose-400'
        }`}
        title="Touch / Click to show or hide the detailed previous days breakdown"
      >
        {/* Top Badges & Hide Line Tool */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 pb-2 sm:pb-3 border-b border-black/5 dark:border-white/10 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white/90 dark:bg-slate-900 shadow-2xs flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold shrink-0">
              <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm tracking-tight truncate">
              {t('Calorie Trajectory & Weight Projection')}
            </span>
            <span className="hidden sm:inline text-[11px] font-bold text-slate-600 dark:text-slate-300 shrink-0">
              · {t('8,000 kcal = 1 kg Rule')}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className={`text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-lg shadow-2xs ${
              isWeightGainGoal 
                ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800' 
                : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
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
                className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl transition-colors cursor-pointer border border-slate-300 dark:border-slate-700 shadow-2xs"
                title={t('Hide Line')}
              >
                <EyeOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">{t('Hide Line')}</span>
                <span className="sm:hidden">{t('Hide')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Point Content: Side-by-Side Key Result & Target even on Mobile */}
        <div className="pt-2 sm:pt-3 flex items-center justify-between gap-2 sm:gap-4">
          <div className="space-y-1 sm:space-y-1.5 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {isCelebrated ? (
                <span className="inline-flex items-center gap-1 text-[9px] sm:text-xs font-black uppercase tracking-wider bg-emerald-600 text-white px-1.5 sm:px-2.5 py-0.5 rounded-md sm:rounded-lg shadow-xs">
                  <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  {t('Celebrated On Track')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] sm:text-xs font-black uppercase tracking-wider bg-rose-600 text-white px-1.5 sm:px-2.5 py-0.5 rounded-md sm:rounded-lg shadow-xs">
                  <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  {t('Regression Notice')}
                </span>
              )}

              <span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
                {trajectoryRows.length} {isMl ? 'ദിവസം' : 'Days'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 sm:gap-3 pt-0.5 flex-wrap">
              <span className={`text-xl sm:text-3xl lg:text-4xl font-black tabular-nums leading-none ${
                isCelebrated ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
              }`}>
                {isGained ? `+${roundedKgStr} kg` : `-${roundedKgStr} kg`}
              </span>
              <span className="text-[10px] sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg border border-black/5 dark:border-slate-700 tabular-nums">
                {cumulativeCalories > 0 ? `+${cumulativeCalories}` : cumulativeCalories} kcal
              </span>
            </div>
          </div>

          {/* Right Side Stats & Touch to Expand Button */}
          <div className="flex flex-col items-end justify-center gap-1 sm:gap-2 shrink-0 text-right">
            <div>
              <div className="text-[9px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide leading-tight">
                {t('Daily Needed Target')}
              </div>
              <div className="text-sm sm:text-xl font-black text-slate-800 dark:text-white tabular-nums leading-tight">
                {neededCalories}{' '}
                <span className="text-[10px] sm:text-xs font-normal text-slate-500 dark:text-slate-400">
                  <span className="sm:hidden">kcal</span>
                  <span className="hidden sm:inline">kcal/day</span>
                </span>
              </div>
            </div>

            {/* Interactive Touch Indicator Button */}
            <div 
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl font-extrabold text-[10px] sm:text-xs transition-all shadow-xs border ${
                isDetailsOpen 
                  ? 'bg-slate-900 dark:bg-emerald-700 text-white border-slate-800 dark:border-emerald-600' 
                  : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 group-hover:bg-slate-900 dark:group-hover:bg-emerald-700 group-hover:text-white group-hover:border-slate-800 dark:group-hover:border-emerald-600'
              }`}
            >
              {isDetailsOpen ? (
                <>
                  <span className="hidden sm:inline">{t('Hide Details')}</span>
                  <span className="sm:hidden">{t('Collapse')}</span>
                  <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">{t('Touch for Details')}</span>
                  <span className="sm:hidden">{t('Details')}</span>
                  <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tactile hint bar at the bottom */}
        <div className="mt-2 sm:mt-3 pt-1.5 sm:pt-2.5 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 font-medium">
          <span className="flex items-center gap-1 truncate">
            <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
            <span className="sm:hidden truncate">{t('8,000 kcal = 1 kg Rule')}</span>
            <span className="hidden sm:inline">{t('Every 8,000 kcal excess = 1 kg gained • Every 8,000 kcal deficit = 1 kg lost')}</span>
          </span>
          <span className="hidden sm:inline font-bold underline group-hover:text-slate-900 dark:group-hover:text-white shrink-0">
            {isDetailsOpen ? t('Collapse') : t('Touch for Details')}
          </span>
        </div>
      </div>

      {/* ================= CHARTS, PROJECTED GOAL DATE & INTERACTIVE BMI GAUGE ================= */}
      <div className="rounded-2xl p-3 sm:p-3.5 bg-slate-50/80 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 space-y-2.5 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px]">
            {(
              [
                { id: 'calories', label: isMl ? 'കലോറി ചാർട്ട്' : '7d Calories', icon: BarChart3 },
                { id: 'weight', label: isMl ? 'ഭാര പ്രവചനം' : 'Weight Curve', icon: Activity },
                { id: 'bmi', label: isMl ? 'BMI ഗേജ്' : 'BMI Calculator', icon: Scale },
              ] as const
            ).map((tab) => {
              const IconComp = tab.icon;
              const active = analyticsTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAnalyticsTab(tab.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                    active
                      ? 'bg-emerald-700 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <IconComp className="w-3 h-3" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold tabular-nums flex items-center gap-2">
            <span>
              BMI <b className="text-slate-900 dark:text-white">{bmiInfo.bmi}</b> · {bmiInfo.shortLabel}
            </span>
            {goalProjection.projectedDateStr && (
              <span className="hidden sm:inline text-emerald-700 dark:text-emerald-400">
                · Goal est: <b>{goalProjection.projectedDateStr}</b>
              </span>
            )}
          </div>
        </div>

        {analyticsTab === 'calories' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              <span>Daily Net Calories vs Target ({neededCalories} kcal)</span>
              <span>{goalProjection.projectedDateStr ? `Est. Goal: ${goalProjection.projectedDateStr}` : goalProjection.trendLabel}</span>
            </div>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7CaloriesSeries} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.25} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #334155',
                      fontSize: '11px',
                    }}
                    formatter={(v: any) => [`${v} kcal`, 'Net Intake']}
                  />
                  <ReferenceLine y={neededCalories} stroke="#E06D53" strokeDasharray="4 4" />
                  <Bar dataKey="net" fill="#059669" radius={[5, 5, 0, 0]} maxBarSize={26} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {analyticsTab === 'weight' && (
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              <span>Weight Trend &amp; Projected Curve ({client.currentWeightKg} → {client.targetWeightKg} kg)</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                {goalProjection.projectedDateStr
                  ? `Goal Date: ${goalProjection.projectedDateStr} (~${goalProjection.projectedWeeklyKg} kg/wk)`
                  : goalProjection.trendLabel}
              </span>
            </div>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightCurveSeries} margin={{ top: 6, right: 10, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.25} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #334155',
                      fontSize: '11px',
                    }}
                    formatter={(v: any, name: any) => [
                      `${v} kg`,
                      name === 'actualKg' ? 'Recorded' : 'Projected',
                    ]}
                  />
                  <ReferenceLine y={client.targetWeightKg} stroke="#10b981" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="projectedKg" stroke="#E06D53" strokeDasharray="5 4" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="actualKg" stroke="#059669" strokeWidth={2.5} connectNulls dot={{ r: 4, fill: '#059669' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {analyticsTab === 'bmi' && (
          <div className="space-y-2.5 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 p-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px]">
                <button
                  type="button"
                  onClick={() => setBmiUnit('metric')}
                  className={`px-2.5 py-0.5 rounded-lg font-bold cursor-pointer ${
                    bmiUnit === 'metric' ? 'bg-slate-900 dark:bg-emerald-700 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  kg / cm
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const fi = cmToFtIn(calcHeightCm);
                    setCalcFeet(fi.feet);
                    setCalcInches(fi.inches);
                    setBmiUnit('imperial');
                  }}
                  className={`px-2.5 py-0.5 rounded-lg font-bold cursor-pointer ${
                    bmiUnit === 'imperial' ? 'bg-slate-900 dark:bg-emerald-700 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  lbs / ft·in
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCalcWeightKg(client.currentWeightKg || 65);
                  const hCm = client.heightCm || 168;
                  setCalcHeightCm(hCm);
                  const fi = cmToFtIn(hCm);
                  setCalcFeet(fi.feet);
                  setCalcInches(fi.inches);
                }}
                className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Sync Profile</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] tabular-nums">
              {bmiUnit === 'metric' ? (
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">Height (cm)</label>
                  <input
                    type="number"
                    min={100}
                    max={235}
                    value={calcHeightCm}
                    onChange={(e) => setCalcHeightCm(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">Ft</label>
                    <input
                      type="number"
                      min={3}
                      max={7}
                      value={calcFeet}
                      onChange={(e) => setCalcFeet(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">In</label>
                    <input
                      type="number"
                      min={0}
                      max={11}
                      value={calcInches}
                      onChange={(e) => setCalcInches(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">
                  Weight ({bmiUnit === 'imperial' ? 'lbs' : 'kg'})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={bmiUnit === 'imperial' ? kgToLbs(calcWeightKg) : calcWeightKg}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setCalcWeightKg(bmiUnit === 'imperial' ? lbsToKg(v) : v);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>

            {/* WHO Clinical Spectrum Gauge Bar */}
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between text-[11px] tabular-nums">
                <span className="font-extrabold text-slate-900 dark:text-white">
                  BMI {bmiInfo.bmi} · {bmiInfo.label}
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Healthy:{' '}
                  {bmiUnit === 'imperial'
                    ? `${bmiInfo.healthyRangeLbs.min}–${bmiInfo.healthyRangeLbs.max} lbs`
                    : `${bmiInfo.healthyRangeKg.min}–${bmiInfo.healthyRangeKg.max} kg`}
                </span>
              </div>
              <div className="relative h-2.5 w-full rounded-full overflow-hidden flex">
                <div className="w-[17%] bg-sky-400" title="Underweight <18.5" />
                <div className="w-[25%] bg-emerald-500" title="Healthy 18.5–24.9" />
                <div className="w-[19%] bg-amber-400" title="Overweight 25–29.9" />
                <div className="w-[39%] bg-rose-500" title="Obese ≥30" />
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-slate-950 dark:bg-white ring-2 ring-white dark:ring-slate-950 rounded-full transition-all duration-300"
                  style={{ left: `calc(${bmiInfo.gaugePercent}% - 3px)` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 tabular-nums">
                <span>14</span>
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>40</span>
              </div>
            </div>

            {bmiInfo.bannerMessage && (
              <p className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl p-2 leading-snug">
                {bmiInfo.bannerMessage}
              </p>
            )}
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
              {CLINICAL_DISCLAIMER}
            </p>
          </div>
        )}
      </div>

      {/* ================= MIDDLE SECTION: WORKOUTS & WALKING STEPS LIVE PANEL ================= */}
      <div className="space-y-2 sm:space-y-3 pt-0.5 sm:pt-1 min-w-0">
        {/* Clean Header Row */}
        <div className="flex items-center justify-between gap-2 pb-1.5 sm:pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
              <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                {t('Workouts & Walking Steps')}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate tabular-nums">
                {formatDateDisplay(selectedDate)}
                {isPedometerLive ? ` · ${osHealthInfo.osLabel} ${t('Live Sync')}` : ''}
              </p>
            </div>
          </div>

          <div className="text-right tabular-nums shrink-0">
            <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 dark:text-slate-400 block leading-tight">
              {t('Total Burn Today')}
            </span>
            <span className="text-xs sm:text-base font-black text-orange-600 dark:text-orange-400 leading-tight">
              -{selectedDayActivityData.totalBurn} kcal
            </span>
          </div>
        </div>

        {/* 2-Column Compact Activity Blocks (Side-by-Side on Mobile & Desktop) */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5">
          {/* Walking Steps Block */}
          <button
            type="button"
            onClick={() => onOpenStepsModal?.()}
            className="text-left rounded-xl sm:rounded-2xl p-2 sm:p-3 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-orange-50/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-orange-300 dark:hover:border-orange-700 transition-colors space-y-1 sm:space-y-2 cursor-pointer min-w-0"
          >
            <div className="flex items-center justify-between gap-1 text-[11px] sm:text-xs">
              <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 flex items-center justify-center shrink-0">
                  <Footprints className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
                  <span className="sm:hidden">{t('Steps')}</span>
                  <span className="hidden sm:inline">{t('Daily Steps')}</span>
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-black text-orange-600 dark:text-orange-400 tabular-nums shrink-0">
                {selectedDayActivityData.stepPct}%
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-1 tabular-nums">
              <div className="truncate">
                <span className="text-xs sm:text-base font-black text-slate-900 dark:text-white">
                  {selectedDayActivityData.steps.toLocaleString()}
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 sm:ml-1">
                  /{selectedDayActivityData.targetSteps.toLocaleString()}
                </span>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-orange-700 dark:text-orange-300 shrink-0">
                -{selectedDayActivityData.stepBurn}k
                <span className="hidden sm:inline">cal</span>
              </span>
            </div>

            <div className="w-full h-1 sm:h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-orange-500 transition-all duration-300"
                style={{ width: `${selectedDayActivityData.stepPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 tabular-nums gap-1">
              <span className="truncate">~{selectedDayActivityData.estKm} km</span>
              <span className="font-semibold text-orange-700 dark:text-orange-400 flex items-center gap-0.5 shrink-0">
                {isPedometerLive && <Smartphone className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                <span>{t('Add Steps')}</span>
              </span>
            </div>
          </button>

          {/* Workouts & Sports Block */}
          <button
            type="button"
            onClick={() => onOpenWorkoutModal?.()}
            className="text-left rounded-xl sm:rounded-2xl p-2 sm:p-3 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-rose-50/50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-rose-300 dark:hover:border-rose-700 transition-colors space-y-1 sm:space-y-2 cursor-pointer min-w-0 flex flex-col justify-between"
          >
            <div className="space-y-1 sm:space-y-2 w-full">
              <div className="flex items-center justify-between gap-1 text-[11px] sm:text-xs">
                <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center justify-center shrink-0">
                    <Dumbbell className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
                    <span className="sm:hidden">{t('Workouts')}</span>
                    <span className="hidden sm:inline">{t('Workouts & Sports')}</span>
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                  {selectedDayActivityData.dayWorkouts.length}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-1 tabular-nums">
                <div className="truncate">
                  <span className="text-xs sm:text-base font-black text-slate-900 dark:text-white">
                    -{selectedDayActivityData.workoutBurn}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 sm:ml-1">
                    kcal
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0">
                  {selectedDayActivityData.workoutMins}m
                  <span className="hidden sm:inline">in</span>
                </span>
              </div>

              <div className="w-full h-1 sm:h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-rose-500 transition-all duration-300"
                  style={{ width: `${selectedDayActivityData.workoutPct}%` }}
                />
              </div>
            </div>

            {selectedDayActivityData.dayWorkouts.length > 0 ? (
              <div className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 truncate tabular-nums">
                {selectedDayActivityData.dayWorkouts
                  .slice(0, 2)
                  .map((w) => `${w.activityName} (${w.durationMinutes}m · -${w.caloriesBurned}k)`)
                  .join(' · ')}
              </div>
            ) : (
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 gap-1">
                <span className="truncate hidden sm:inline">{t('No workouts logged today')}</span>
                <span className="font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-0.5 shrink-0">
                  <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span>{t('Add Workout')}</span>
                </span>
              </div>
            )}
          </button>
        </div>

        {/* Footer note connecting burn directly to net calorie calculation */}
        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 leading-tight tabular-nums">
          {isMl
            ? `ആകെ കത്തിച്ച കലോറി (-${selectedDayActivityData.totalBurn} kcal = ചുവടുകൾ -${selectedDayActivityData.stepBurn} + വ്യായാമം -${selectedDayActivityData.workoutBurn}) മുകളിലെ 8,000 kcal കണക്കിൽ കുറച്ചിട്ടുണ്ട്.`
            : `Net burn subtracted above: -${selectedDayActivityData.totalBurn} kcal (-${selectedDayActivityData.stepBurn} steps · -${selectedDayActivityData.workoutBurn} workouts).`}
        </p>
      </div>

      {/* ================= EXPANDED DETAILED DATA SECTION ================= */}
      {isDetailsOpen && (
        <div className="space-y-4 pt-2 transition-all">
          
          {/* Detailed Clinical Assessment & Formula Box */}
          <div className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                {t('Clinical Cumulative Progress Analysis')}
              </span>
              <p className="font-medium">
                {isWeightGainGoal ? (
                  isGained ? (
                    <span className="text-emerald-900 dark:text-emerald-300">
                      {isMl ? (
                        <>🎉 <b>അഭിനന്ദനങ്ങൾ!</b> നിങ്ങൾ അധിക കലോറി നിലനിർത്തി ({cumulativeCalories > 0 ? `+${cumulativeCalories}` : cumulativeCalories} kcal). ഭാരം കൂട്ടൽ ലക്ഷ്യത്തിന് അനുസൃതമായി <b>{roundedKgStr} kg വർദ്ധനവ്</b> കാണിക്കുന്നു!</>
                      ) : (
                        <>🎉 <b>Great job!</b> You have maintained a caloric surplus ({cumulativeCalories > 0 ? `+${cumulativeCalories}` : cumulativeCalories} kcal). Showing <b>{roundedKgStr} kg gained</b> on track with your weight gain target!</>
                      )}
                    </span>
                  ) : (
                    <span className="text-rose-900 dark:text-rose-300">
                      {isMl ? (
                        <>⚠️ <b>കലോറി കുറവ്:</b> നിലവിൽ കലോറി കുറവിലാണ് ({cumulativeCalories} kcal). <b>{roundedKgStr} kg കുറവ്</b> കാണിക്കുന്നത് നിങ്ങളുടെ ഭാരം കൂട്ടൽ ലക്ഷ്യത്തിന് വിരുദ്ധമാണ്.</>
                      ) : (
                        <>⚠️ <b>Deficit Alert:</b> You are in a caloric deficit ({cumulativeCalories} kcal). Showing <b>{roundedKgStr} kg lost</b>, which is a regression for your weight gain goal.</>
                      )}
                    </span>
                  )
                ) : (
                  !isGained ? (
                    <span className="text-emerald-900 dark:text-emerald-300">
                      {isMl ? (
                        <>🎉 <b>മികച്ച പുരോഗതി!</b> നിങ്ങൾ കലോറി കുറവ് നിലനിർത്തി ({cumulativeCalories} kcal). ഭാരം കുറയ്ക്കൽ ലക്ഷ്യത്തിലേക്ക് <b>{roundedKgStr} kg കുറവ്</b> രേഖപ്പെടുത്തി!</>
                      ) : (
                        <>🎉 <b>Outstanding Progress!</b> You have maintained a caloric deficit ({cumulativeCalories} kcal). Showing <b>{roundedKgStr} kg weight loss</b> celebrated for your fat loss target!</>
                      )}
                    </span>
                  ) : (
                    <span className="text-rose-900 dark:text-rose-300">
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

            <div className="shrink-0 bg-white dark:bg-slate-900 p-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs">
              <span className="block font-bold text-slate-800 dark:text-white">{isMl ? 'കണക്കുകൂട്ടൽ സൂത്രവാക്യം:' : 'Formula Rule:'}</span>
              <span>{isMl ? '(അധികം / കുറവ്) ÷ 8,000 kcal' : '(Excess / Deficit) ÷ 8,000 kcal'}</span>
            </div>
          </div>

          {/* Table Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('Daily Calorie Balance & Running Cumulative Table')}</span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400 tabular-nums">
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
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t('Add Data for Yesterday')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="text-xs font-bold text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                title={t('Collapse')}
              >
                <ChevronUp className="w-3.5 h-3.5" />
                <span>{t('Collapse')}</span>
              </button>
            </div>
          </div>

          {/* Historical Trajectory Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                  <th className="py-3 px-4">{t('Date')}</th>
                  <th className="py-3 px-4">{t('Normal Baseline')}</th>
                  <th className="py-3 px-3 text-emerald-800 dark:text-emerald-400">{t('Good Cal')}</th>
                  <th className="py-3 px-3 text-amber-900 dark:text-amber-400">{t('Bad Cal')}</th>
                  <th className="py-3 px-3">{t('Total Eaten')}</th>
                  <th className="py-3 px-3 text-orange-700 dark:text-orange-400">{t('Sports Burn')}</th>
                  <th className="py-3 px-3 text-blue-900 dark:text-blue-400">{t('Net Intake')}</th>
                  <th className="py-3 px-4">{t('Day Balance')}</th>
                  <th className="py-3 px-4">{t('Cumulative Balance')}</th>
                  <th className="py-3 px-4">{t('Projected Weight Impact')}</th>
                  <th className="py-3 px-4">{t('Goal Evaluation')}</th>
                  <th className="py-3 px-4 text-right">{t('Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
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
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 font-medium' 
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span>{formatDateDisplay(row.date)}</span>
                          {isToday && (
                            <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">
                              · {t('Today')}
                            </span>
                          )}
                          {isYesterday && (
                            <span className="text-[10px] font-bold uppercase text-blue-700 dark:text-blue-400">
                              · {t('Yesterday')}
                            </span>
                          )}
                          {isTwoDaysAgo && (
                            <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">
                              · {t('2 Days Ago')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Target */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {row.needed} kcal
                      </td>

                      {/* Good Calories */}
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 text-xs">
                          🍏 {row.goodCalories} kcal
                        </span>
                      </td>

                      {/* Bad Calories */}
                      <td className="py-3.5 px-3">
                        <span className={`font-bold px-2 py-0.5 rounded-md border text-xs ${
                          row.badCalories > 0 
                            ? 'text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800' 
                            : 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        }`}>
                          🍟 {row.badCalories} kcal
                        </span>
                      </td>

                      {/* Logged Intake Total */}
                      <td className="py-3.5 px-3">
                        {row.logsCount > 0 ? (
                          <div className="flex items-center gap-1">
                            <span className="font-extrabold text-slate-900 dark:text-white">{row.consumed} kcal</span>
                            <span className="text-[10px] text-slate-400">({row.logsCount})</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500 italic">0 kcal</span>
                        )}
                      </td>

                      {/* Activity Burn */}
                      <td className="py-3.5 px-3">
                        {row.caloriesBurned > 0 ? (
                          <span className="font-extrabold text-orange-600 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 px-2 py-0.5 rounded-md text-xs">
                            -{row.caloriesBurned} kcal
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500">0 kcal</span>
                        )}
                      </td>

                      {/* Net Intake */}
                      <td className="py-3.5 px-3">
                        <span className="font-black text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-md text-xs">
                          {row.netCalories} kcal
                        </span>
                      </td>

                      {/* Day Balance */}
                      <td className="py-3.5 px-4">
                        {row.logsCount > 0 ? (
                          <span className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-full ${
                            row.dayDifference > 0 
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300' 
                              : row.dayDifference < 0
                                ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-900 dark:text-sky-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                          }`}>
                            {row.dayDifference > 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            <span>{dayDiffSign} kcal {row.dayDifference > 0 ? 'Excess' : 'Low/Deficit'}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500">0 kcal</span>
                        )}
                      </td>

                      {/* Cumulative Calorie Balance */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <span className="text-xs font-mono">
                          {cumSign} kcal
                        </span>
                      </td>

                      {/* Projected Weight Impact */}
                      <td className="py-3.5 px-4">
                        <span className={`font-black text-xs sm:text-sm px-2.5 py-1 rounded-lg ${
                          row.isSuccess 
                            ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 font-extrabold' 
                            : 'bg-rose-100 dark:bg-rose-950/70 text-rose-900 dark:text-rose-300 font-extrabold'
                        }`}>
                          {kgLabel}
                        </span>
                      </td>

                      {/* Goal Evaluation */}
                      <td className="py-3.5 px-4">
                        {row.isSuccess ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>{t('Celebrated')}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-400">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
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
                          className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
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
            <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p>
                <b>{t('8,000 kcal Projection')}:</b> {t('Every 8,000 kcal excess = 1 kg gained • Every 8,000 kcal deficit = 1 kg lost')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsDetailsOpen(false)}
              className="self-end sm:self-auto flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
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
