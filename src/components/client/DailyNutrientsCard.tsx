import React, { useMemo, useState } from 'react';
import { ClientProfile, MealLogItem, MealType, WaterLog } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  calculateDailyNutrientTargets,
  aggregateConsumedNutrients,
  NutrientKey,
} from '../../utils/micronutrients';
import { formatDateDisplay } from '../../utils/dateUtils';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import {
  Dumbbell,
  Wheat,
  Droplets,
  Leaf,
  Candy,
  GlassWater,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  HeartPulse,
  Flame,
} from 'lucide-react';

interface DailyNutrientsCardProps {
  client: ClientProfile;
  logs: MealLogItem[];
  waterLogs?: WaterLog[];
  selectedDate: string;
  onAddWaterGlass?: () => void;
  onOpenHydrationModal?: () => void;
  onInspectNutrient?: (key: NutrientKey) => void;
  onOpenBloodSugarModal?: () => void;
}

const MACRO_COLORS = ['#059669', '#2563eb', '#d97706'];

const ProgressRing: React.FC<{
  pct: number;
  strokeHex: string;
  size?: number;
}> = ({ pct, strokeHex, size = 44 }) => {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const offset = circ - (clamped / 100) * circ;

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90" aria-hidden="true">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={4.5}
        className="text-slate-200 dark:text-slate-700"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={strokeHex}
        strokeWidth={4.5}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-300"
      />
    </svg>
  );
};

function getStatusLabel(consumed: number, target: number, isCeiling: boolean) {
  if (target <= 0) return { label: 'On Track', textClass: 'text-emerald-700 dark:text-emerald-400' };
  const ratio = consumed / target;
  if (isCeiling) {
    if (ratio > 1.05) return { label: 'Exceeded', textClass: 'text-rose-600 dark:text-rose-400' };
    if (ratio >= 0.85) return { label: 'Near Limit', textClass: 'text-amber-700 dark:text-amber-400' };
    return { label: 'Within Limit', textClass: 'text-emerald-700 dark:text-emerald-400' };
  }
  if (ratio > 1.2) return { label: 'Exceeded', textClass: 'text-amber-700 dark:text-amber-400' };
  if (ratio >= 0.75) return { label: 'On Track', textClass: 'text-emerald-700 dark:text-emerald-400' };
  return { label: 'Building', textClass: 'text-slate-500 dark:text-slate-400' };
}

export const DailyNutrientsCard: React.FC<DailyNutrientsCardProps> = ({
  client,
  logs,
  waterLogs = [],
  selectedDate,
  onAddWaterGlass,
  onOpenHydrationModal,
  onInspectNutrient,
  onOpenBloodSugarModal,
}) => {
  const { foods, t, language } = useApp();
  const isMl = language === 'ml';
  const [showMealSummary, setShowMealSummary] = useState(false);

  const targets = useMemo(() => calculateDailyNutrientTargets(client), [client]);
  const consumed = useMemo(
    () => aggregateConsumedNutrients(logs, foods),
    [logs, foods]
  );

  const waterTotalMl = useMemo(
    () =>
      waterLogs
        .filter((w) => w.clientId === client.id && w.date === selectedDate)
        .reduce((sum, w) => sum + (Number(w.amountMl) || 0), 0),
    [waterLogs, client.id, selectedDate]
  );
  const waterTargetMl = Math.round((client.dailyWaterTargetLiters || 2.5) * 1000);

  const macroPieData = useMemo(() => {
    const pKcal = consumed.protein * 4;
    const cKcal = consumed.carbs * 4;
    const fKcal = consumed.fat * 9;
    const total = pKcal + cKcal + fKcal;
    if (total <= 0) {
      return [
        { name: 'Protein', value: 30 },
        { name: 'Carbs', value: 45 },
        { name: 'Fat', value: 25 },
      ];
    }
    return [
      { name: 'Protein', value: Math.round(pKcal) },
      { name: 'Carbs', value: Math.round(cKcal) },
      { name: 'Fat', value: Math.round(fKcal) },
    ];
  }, [consumed]);

  const mealSlotSummary = useMemo(() => {
    const slots: MealType[] = ['Breakfast', 'Morning Snack', 'Lunch', 'Evening Snack', 'Dinner'];
    return slots.map((slot) => {
      const slotLogs = logs.filter((l) => l.mealType === slot);
      const totals = aggregateConsumedNutrients(slotLogs, foods);
      return {
        slot,
        count: slotLogs.length,
        ...totals,
      };
    });
  }, [logs, foods]);

  const nutrientRings: Array<{
    key: NutrientKey | 'water';
    label: string;
    consumed: number;
    target: number;
    unit: string;
    strokeHex: string;
    isCeiling?: boolean;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      key: 'protein',
      label: t('Protein'),
      consumed: consumed.protein,
      target: targets.protein,
      unit: 'g',
      strokeHex: '#059669',
      icon: Dumbbell,
    },
    {
      key: 'carbs',
      label: t('Carbs'),
      consumed: consumed.carbs,
      target: targets.carbs,
      unit: 'g',
      strokeHex: '#2563eb',
      icon: Wheat,
    },
    {
      key: 'fat',
      label: t('Fats'),
      consumed: consumed.fat,
      target: targets.fat,
      unit: 'g',
      strokeHex: '#d97706',
      icon: Droplets,
    },
    {
      key: 'fiber',
      label: t('Fiber'),
      consumed: consumed.fiber,
      target: targets.fiber,
      unit: 'g',
      strokeHex: '#65a30d',
      icon: Leaf,
    },
    {
      key: 'sugar',
      label: t('Sugar'),
      consumed: consumed.sugar,
      target: targets.sugar,
      unit: 'g',
      strokeHex: consumed.sugar > targets.sugar ? '#e11d48' : '#db2777',
      isCeiling: true,
      icon: Candy,
    },
    {
      key: 'sodium',
      label: t('Sodium'),
      consumed: consumed.sodium,
      target: targets.sodium,
      unit: 'mg',
      strokeHex: consumed.sodium > targets.sodium ? '#e11d48' : '#ea580c',
      isCeiling: true,
      icon: Flame,
    },
    {
      key: 'water',
      label: t('Water'),
      consumed: Math.round((waterTotalMl / 1000) * 10) / 10,
      target: Math.round((waterTargetMl / 1000) * 10) / 10,
      unit: 'L',
      strokeHex: '#0891b2',
      icon: GlassWater,
    },
  ];

  const diabeticStatus = client.diabeticStatus && client.diabeticStatus !== 'none' ? client.diabeticStatus : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {isMl ? 'പോഷക റിംഗുകളും ഷുഗർ/സോഡിയവും' : 'Nutrient Rings, Sugar, Sodium & Hydration'}
              </h2>
              {diabeticStatus && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 uppercase shrink-0">
                  {diabeticStatus === 'prediabetes' ? 'Pre-DM' : diabeticStatus}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate tabular-nums">
              {formatDateDisplay(selectedDate)} · {consumed.calories} / {targets.calories} kcal · {t('Sugar')} ≤{targets.sugar}g · {t('Sodium')} ≤{targets.sodium}mg
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenBloodSugarModal && (
            <button
              type="button"
              onClick={onOpenBloodSugarModal}
              className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>{t('Blood Sugar')}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => (onAddWaterGlass ? onAddWaterGlass() : onOpenHydrationModal?.())}
            className="px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 border border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+250 ml</span>
          </button>
        </div>
      </div>

      {/* 6 Progress Rings Grid + Macro Split Donut */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-8 grid grid-cols-2 gap-2">
          {nutrientRings.map((ring) => {
            const pct = ring.target > 0 ? Math.round((ring.consumed / ring.target) * 100) : 0;
            const status = getStatusLabel(ring.consumed, ring.target, Boolean(ring.isCeiling));
            const IconComp = ring.icon;
            return (
              <button
                key={ring.key}
                type="button"
                onClick={() => {
                  if (ring.key === 'water') {
                    onOpenHydrationModal?.();
                  } else {
                    onInspectNutrient?.(ring.key);
                  }
                }}
                className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/80 hover:border-emerald-400 transition-colors text-left cursor-pointer min-w-0"
              >
                <div className="relative flex items-center justify-center shrink-0">
                  <ProgressRing pct={pct} strokeHex={ring.strokeHex} size={42} />
                  <IconComp className="w-3.5 h-3.5 text-slate-700 dark:text-slate-200 absolute" />
                </div>
                <div className="min-w-0 flex-1 tabular-nums">
                  <div className="flex items-center justify-between gap-1 text-[11px]">
                    <span className="font-bold text-slate-900 dark:text-white truncate">{ring.label}</span>
                    <span className={`text-[10px] font-bold shrink-0 ${status.textClass}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">
                    {ring.consumed}
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      /{ring.target}{ring.unit}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Recharts Macro Split Donut */}
        <div className="sm:col-span-4 flex flex-col items-center justify-center rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/80 p-3">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1">
            Macro Energy Split
          </span>
          <div className="w-28 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroPieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={28}
                  outerRadius={46}
                  paddingAngle={2}
                >
                  {macroPieData.map((_, idx) => (
                    <Cell key={idx} fill={MACRO_COLORS[idx % MACRO_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: any, name: any) => [`${v} kcal`, name]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    borderRadius: '10px',
                    border: 'none',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600" /> P {consumed.protein}g
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-600" /> C {consumed.carbs}g
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-600" /> F {consumed.fat}g
            </span>
          </div>
        </div>
      </div>

      {/* Collapsible Meal-by-Meal Nutrient Summary */}
      <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setShowMealSummary((v) => !v)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 py-1 cursor-pointer"
        >
          <span>Meal-by-Meal Nutrient Breakdown ({logs.length} items)</span>
          {showMealSummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showMealSummary && (
          <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800 text-xs tabular-nums">
            {mealSlotSummary.map((row) => (
              <div key={row.slot} className="py-2 flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-100">{t(row.slot)}</span>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-2">
                  <b>{row.calories} kcal</b>
                  <span>· P {row.protein}g</span>
                  <span>· C {row.carbs}g</span>
                  <span>· F {row.fat}g</span>
                  <span>· Fib {row.fiber}g</span>
                  <span>· Sug {row.sugar}g</span>
                  <span>· Na {row.sodium}mg</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
