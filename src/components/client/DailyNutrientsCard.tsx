import React, { useMemo } from 'react';
import { ClientProfile, MealLogItem } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  calculateDailyNutrientTargets,
  aggregateConsumedNutrients,
} from '../../utils/micronutrients';
import {
  Dumbbell,
  Wheat,
  Droplets,
  Leaf,
  HeartPulse,
  Sun,
  Zap,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface DailyNutrientsCardProps {
  client: ClientProfile;
  logs: MealLogItem[];
}

export const DailyNutrientsCard: React.FC<DailyNutrientsCardProps> = ({ client, logs }) => {
  const { foods, t, language } = useApp();
  const isMl = language === 'ml';

  const targets = useMemo(() => calculateDailyNutrientTargets(client), [client]);
  const consumed = useMemo(
    () => aggregateConsumedNutrients(logs, foods),
    [logs, foods]
  );

  const items = useMemo(
    () => [
      {
        key: 'protein',
        label: t('Protein'),
        consumed: consumed.protein,
        target: targets.protein,
        unit: 'g',
        icon: Dumbbell,
        barColor: 'bg-emerald-500',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        textAccent: 'text-emerald-700 dark:text-emerald-400',
      },
      {
        key: 'carbs',
        label: t('Carbohydrates'),
        mobileLabel: t('Carbs'),
        consumed: consumed.carbs,
        target: targets.carbs,
        unit: 'g',
        icon: Wheat,
        barColor: 'bg-blue-500',
        badgeBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        textAccent: 'text-blue-700 dark:text-blue-400',
      },
      {
        key: 'fat',
        label: t('Fats'),
        consumed: consumed.fat,
        target: targets.fat,
        unit: 'g',
        icon: Droplets,
        barColor: 'bg-amber-500',
        badgeBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        textAccent: 'text-amber-700 dark:text-amber-400',
      },
      {
        key: 'fiber',
        label: t('Fiber'),
        consumed: consumed.fiber,
        target: targets.fiber,
        unit: 'g',
        icon: Leaf,
        barColor: 'bg-lime-500',
        badgeBg: 'bg-lime-50 dark:bg-lime-950/60 text-lime-700 dark:text-lime-300 border-lime-200 dark:border-lime-800',
        textAccent: 'text-lime-700 dark:text-lime-400',
      },
      {
        key: 'iron',
        label: t('Iron'),
        consumed: consumed.iron,
        target: targets.iron,
        unit: 'mg',
        icon: HeartPulse,
        barColor: 'bg-rose-500',
        badgeBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        textAccent: 'text-rose-700 dark:text-rose-400',
      },
      {
        key: 'vitaminD',
        label: t('Vitamin D'),
        consumed: consumed.vitaminD,
        target: targets.vitaminD,
        unit: 'IU',
        icon: Sun,
        barColor: 'bg-indigo-500',
        badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        textAccent: 'text-indigo-700 dark:text-indigo-400',
      },
      {
        key: 'magnesium',
        label: t('Magnesium'),
        consumed: consumed.magnesium,
        target: targets.magnesium,
        unit: 'mg',
        icon: Zap,
        barColor: 'bg-teal-500',
        badgeBg: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
        textAccent: 'text-teal-700 dark:text-teal-400',
      },
      {
        key: 'calcium',
        label: t('Calcium'),
        consumed: consumed.calcium,
        target: targets.calcium,
        unit: 'mg',
        icon: ShieldCheck,
        barColor: 'bg-sky-500',
        badgeBg: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
        textAccent: 'text-sky-700 dark:text-sky-400',
      },
    ],
    [consumed, targets, t]
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col justify-between min-w-0 w-full overflow-hidden space-y-2.5 sm:space-y-3.5">
      {/* Header */}
      <div className="flex flex-wrap items-center sm:items-start justify-between gap-1.5 sm:gap-2 pb-2 sm:pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white leading-tight truncate">
              {t('Daily Nutrient Targets')}
            </h2>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate tabular-nums">
              {client.gender || 'Client'} · {client.age || 30}y · {client.currentWeightKg} kg · {client.heightCm} cm
            </p>
          </div>
        </div>

        <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap shrink-0 tabular-nums">
          {t('Goal Cap')}: {targets.calories} kcal
        </span>
      </div>

      {/* 8 Strictly-Capped Nutrient Bars (2x4 Compact Grid on Mobile & Desktop) */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5">
        {items.map((item) => {
          const IconComponent = item.icon;
          const pct = item.target > 0 ? Math.min(100, Math.round((item.consumed / item.target) * 100)) : 0;
          const met = item.consumed >= item.target;

          return (
            <div
              key={item.key}
              className="rounded-xl sm:rounded-2xl p-2 sm:p-2.5 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/80 space-y-1 sm:space-y-1.5 min-w-0"
            >
              <div className="flex items-center justify-between gap-1 text-[11px] sm:text-xs min-w-0">
                <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                  <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg border flex items-center justify-center shrink-0 ${item.badgeBg}`}>
                    <IconComponent className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
                    {item.mobileLabel ? (
                      <>
                        <span className="sm:hidden">{item.mobileLabel}</span>
                        <span className="hidden sm:inline">{item.label}</span>
                      </>
                    ) : (
                      item.label
                    )}
                  </span>
                </div>
                <span className={`text-[9px] sm:text-[10px] font-black tabular-nums shrink-0 ${met ? 'text-emerald-600 dark:text-emerald-400' : item.textAccent}`}>
                  {pct}%
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-1 text-[11px] sm:text-xs tabular-nums min-w-0">
                <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm shrink-0">
                  {item.consumed}
                  <span className="text-[10px] sm:text-[11px] font-normal text-slate-500 dark:text-slate-400 ml-0.5">
                    {item.unit}
                  </span>
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                  <span className="hidden sm:inline">{t('Daily Needed')}: </span>
                  <span className="sm:hidden">{t('Need')}: </span>
                  <b className="text-slate-800 dark:text-slate-200">{item.target}{item.unit}</b>
                </span>
              </div>

              <div className="w-full h-1 sm:h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${met ? 'bg-emerald-500' : item.barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 leading-snug">
        {isMl
          ? 'ഭാരം, ഉയരം, പ്രായം, ലിംഗഭേദം എന്നിവ അടിസ്ഥാനമാക്കി ആവശ്യമായ പരമാവധി പരിധിക്കുള്ളിൽ കണക്കാക്കിയതാണ്.'
          : 'Calibrated strictly within safe clinical limits from your weight, height, age & gender.'}
      </p>
    </div>
  );
};
