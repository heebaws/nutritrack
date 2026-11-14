import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  RefreshCw,
  Heart,
  Activity,
  Flame
} from 'lucide-react';
import { MealLogItem, ClientProfile } from '../../types';
import { auditDailyMealLogs } from '../../utils/clinicalFoodAudit';
import { ClinicalFoodGuideModal } from './ClinicalFoodGuideModal';
import { useApp } from '../../context/AppContext';

interface CoachClinicalAlertsCardProps {
  logs: MealLogItem[];
  client: ClientProfile;
  selectedDate: string;
}

export const CoachClinicalAlertsCard: React.FC<CoachClinicalAlertsCardProps> = ({
  logs,
  client
}) => {
  const { language, t, tf } = useApp();
  const isMl = language === 'ml';
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const audit = auditDailyMealLogs(logs, client, language);

  return (
    <>
      <div className="space-y-4">

        {/* ================= RED ALERT SECTION: FOODS THAT MAY CAUSE PROBLEMS ================= */}
        {audit.hasProblemFoods && (
          <div className="bg-rose-50/95 dark:bg-rose-950/35 border-2 border-rose-300 dark:border-rose-800 rounded-3xl p-5 shadow-xs text-rose-950 dark:text-rose-100 space-y-4 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-rose-600 text-white">
                      {isMl ? 'കോച്ച് മുന്നറിയിപ്പ്' : 'Coach Clinical Alert'}
                    </span>
                    <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300">
                      {isMl
                        ? `${audit.problemFoods.length} ഭക്ഷണങ്ങൾ ശ്രദ്ധിക്കുക`
                        : `${audit.problemFoods.length} Item${audit.problemFoods.length > 1 ? 's' : ''} Flagged`}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-rose-950 dark:text-rose-100 mt-0.5">
                    {isMl ? 'കോച്ച് സലീമിന്റെ പ്രധാന മുന്നറിയിപ്പ്' : "Coach Saleem's Urgent Food Warning"}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="text-[11px] font-bold text-rose-700 dark:text-rose-200 hover:text-rose-900 dark:hover:text-white bg-rose-100 dark:bg-rose-900/60 hover:bg-rose-200/80 dark:hover:bg-rose-900 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer border border-rose-200 dark:border-rose-700 shrink-0 flex items-center gap-1"
                title={isMl ? 'ഭക്ഷണ നിയമങ്ങൾ കാണുക' : 'View frequency rules'}
              >
                <BookOpen className="w-3 h-3" />
                <span className="hidden sm:inline">{isMl ? 'നിയമങ്ങൾ' : 'Rules'}</span>
              </button>
            </div>

            {/* Coach Voice Prompt */}
            <p className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed font-medium bg-white/70 dark:bg-slate-900/70 p-3 rounded-2xl border border-rose-200 dark:border-rose-800/70">
              <span className="font-extrabold text-rose-950 dark:text-white">
                {isMl ? `${client.name}-നുള്ള അറിയിപ്പ്:` : `Notice for ${client.name}:`}
              </span>{' '}
              {audit.dailyCoachVerdict.message}
            </p>

            {/* List of Problem Foods Logged Today */}
            <div className="space-y-2.5">
              {audit.problemFoods.map(({ logId, foodName, mealType, calories, audit: itemAudit }) => (
                <div
                  key={logId}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-rose-200 dark:border-rose-800/70 shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                          {tf(foodName)}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          {t(mealType)}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 tabular-nums">
                          {calories} kcal
                        </span>
                      </div>
                      <span className="inline-block text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 mt-0.5">
                        {itemAudit.tierLabel}
                      </span>
                    </div>

                    <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {/* Why it causes problems */}
                  <div className="bg-rose-50/80 dark:bg-rose-950/40 rounded-xl p-2.5 text-[11px] text-rose-950 dark:text-rose-200 border border-rose-100 dark:border-rose-900/60 space-y-1">
                    <span className="font-bold text-[10px] uppercase tracking-wider text-rose-800 dark:text-rose-300 block">
                      {isMl ? 'ആരോഗ്യ പ്രശ്നവും അളവ് നിയന്ത്രണവും:' : 'Clinical Risk & Frequency Limit:'}
                    </span>
                    <p className="leading-snug">{itemAudit.clinicalReason}</p>
                    <span className="inline-block text-[10px] font-black text-rose-800 dark:text-rose-200 bg-rose-200/60 dark:bg-rose-900/60 px-2 py-0.5 rounded">
                      {isMl ? 'പരിധി:' : 'Limit:'} {itemAudit.frequencyGuideline}
                    </span>
                  </div>

                  {/* Medical Condition Warning if active */}
                  {itemAudit.medicalConditionsWarning && itemAudit.medicalConditionsWarning.length > 0 && (
                    <div className="p-2 rounded-xl bg-red-100/90 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-950 dark:text-red-200 text-[11px] font-bold">
                      {itemAudit.medicalConditionsWarning.map((cw, i) => (
                        <div key={i}>{cw}</div>
                      ))}
                    </div>
                  )}

                  {/* Recommended Good Swap */}
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-xl p-2.5 border border-emerald-200 dark:border-emerald-800/70 text-emerald-950 dark:text-emerald-200 space-y-1">
                    <div className="flex items-center justify-between gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        {isMl ? 'കോച്ച് നിർദ്ദേശിക്കുന്ന മികച്ച പകരക്കാരൻ' : "Coach Saleem's Smart Swap"}
                      </span>
                      {itemAudit.recommendedSwap.caloriesSaved && (
                        <span className="text-emerald-700 dark:text-emerald-300 font-extrabold bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.2 rounded">
                          {itemAudit.recommendedSwap.caloriesSaved}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-black text-emerald-900 dark:text-emerald-100">
                      {itemAudit.recommendedSwap.name}
                    </div>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-snug">
                      {itemAudit.recommendedSwap.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Button to Open Frequency Guide */}
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="w-full py-2.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>
                {isMl ? 'മുഴുവൻ ഭക്ഷണ നിയമങ്ങളും കാണുക (5 വിഭാഗങ്ങൾ)' : 'View Full Frequency Rules (Once/Month vs Once/Week)'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ================= GREEN PRAISE SECTION ================= */}
        {audit.hasHealthyFoods && (
          <div className="bg-emerald-50/95 dark:bg-emerald-950/35 border-2 border-emerald-300 dark:border-emerald-800 rounded-3xl p-5 shadow-xs text-emerald-950 dark:text-emerald-100 space-y-4 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-emerald-600 text-white">
                      {isMl ? 'കോച്ച് അഭിനന്ദനം' : 'Coach Praise'}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                      {isMl
                        ? `${audit.healthyFoods.length} സൂപ്പർഫുഡുകൾ കഴിച്ചു`
                        : `${audit.healthyFoods.length} Superfood${audit.healthyFoods.length > 1 ? 's' : ''} Logged`}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-emerald-950 dark:text-emerald-100 mt-0.5">
                    {isMl ? 'കോച്ച് സലീമിന്റെ അഭിനന്ദനം' : "Coach Saleem's Commendation"}
                  </h3>
                </div>
              </div>

              <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>

            {/* Coach Praise Message */}
            <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium bg-white/70 dark:bg-slate-900/70 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/70">
              <span className="font-extrabold text-emerald-950 dark:text-white">
                {isMl ? `അഭിനന്ദനങ്ങൾ, ${client.name}!` : `Great job, ${client.name}!`}
              </span>{' '}
              {isMl
                ? 'ഇന്ന് പോഷകസമൃദ്ധമായ നല്ല ഭക്ഷണങ്ങളാണ് നിങ്ങൾ തിരഞ്ഞെടുത്തത്. ഇവ നാരുകളും ധാതുക്കളും നൽകുകയും വയറ്റിലെ കൊഴുപ്പ് കുറയ്ക്കാൻ സഹായിക്കുകയും ചെയ്യുന്നു.'
                : 'You logged wholesome, nutrient-dense foods today. These provide essential dietary fiber, clean micronutrients, and protect your visceral fat balance.'}
            </p>

            {/* Logged Healthy Items Badges */}
            <div className="flex flex-wrap gap-1.5">
              {audit.healthyFoods.map(({ logId, foodName, mealType }) => (
                <span
                  key={logId}
                  className="inline-flex items-center gap-1 text-[11px] font-bold bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 shadow-2xs"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  {tf(foodName)} <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">({t(mealType)})</span>
                </span>
              ))}
            </div>

            {/* Balanced Plate Meter */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-emerald-200 dark:border-emerald-800/70 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 flex-wrap gap-1">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  {isMl ? 'ഇന്നത്തെ പ്ലേറ്റ് സന്തുലിതാവസ്ഥ' : "Today's Plate Balance"}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {isMl ? 'ലക്ഷ്യം: 50% പച്ചക്കറി / 25% പ്രോട്ടീൻ / 25% ധാന്യങ്ങൾ' : 'Target: 50% Veg / 25% Prot / 25% Grains'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex border border-slate-200 dark:border-slate-700">
                <div
                  style={{ width: `${Math.min(100, audit.plateDistribution.veggiesAndFruitsPercent)}%` }}
                  className="bg-emerald-500 h-full transition-all"
                  title={`${audit.plateDistribution.veggiesAndFruitsPercent}%`}
                />
                <div
                  style={{ width: `${Math.min(100, audit.plateDistribution.leanProteinPercent)}%` }}
                  className="bg-blue-500 h-full transition-all"
                  title={`${audit.plateDistribution.leanProteinPercent}%`}
                />
                <div
                  style={{ width: `${Math.min(100, audit.plateDistribution.wholeGrainsPercent)}%` }}
                  className="bg-amber-500 h-full transition-all"
                  title={`${audit.plateDistribution.wholeGrainsPercent}%`}
                />
              </div>

              <div className="grid grid-cols-3 gap-1 pt-1 text-center text-[10px] font-bold tabular-nums">
                <span className="text-emerald-700 dark:text-emerald-400">🥗 {isMl ? 'പച്ചക്കറികൾ' : 'Veggies'} {audit.plateDistribution.veggiesAndFruitsPercent}%</span>
                <span className="text-blue-700 dark:text-blue-400">🥩 {isMl ? 'പ്രോട്ടീൻ' : 'Protein'} {audit.plateDistribution.leanProteinPercent}%</span>
                <span className="text-amber-700 dark:text-amber-400">🌾 {isMl ? 'ധാന്യങ്ങൾ' : 'Grains'} {audit.plateDistribution.wholeGrainsPercent}%</span>
              </div>
            </div>

            {/* Arranged Good Options */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  {isMl ? 'അടുത്ത ഭക്ഷണങ്ങൾക്കുള്ള മികച്ച ഓപ്ഷനുകൾ' : 'Arranged Good Options (Coach Logic)'}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {isMl ? 'അടുത്ത നേരം' : 'Next Meals'}
                </span>
              </div>

              <div className="space-y-2">
                {audit.arrangedGoodOptions.map((opt, i) => (
                  <div key={i} className="bg-white/90 dark:bg-slate-900 rounded-2xl p-3 border border-emerald-100 dark:border-emerald-800/70 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <span className="text-xs font-black text-slate-900 dark:text-white">{opt.title}</span>
                      <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        {opt.mealSlot}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {opt.recommendedFoods.map((rf, rIdx) => (
                        <span key={rIdx} className="text-[10px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          ✓ {rf}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug pt-1">
                      {opt.benefit}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Empty State */}
        {!audit.hasProblemFoods && !audit.hasHealthyFoods && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-3xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold shrink-0">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  {isMl ? 'പ്രതിദിന ക്ലിനിക്കൽ ഫുഡ് ഓഡിറ്റ്' : 'Daily Clinical Food Audit'}
                </span>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  {isMl ? 'കോച്ച് സലീമിന്റെ നിർദ്ദേശങ്ങൾ തയ്യാറാണ്' : "Coach Saleem's Guidance Ready"}
                </h4>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {isMl
                ? 'നിങ്ങൾ കഴിച്ച ഭക്ഷണം ചേർക്കുമ്പോൾ തന്നെ കോച്ച് സലീം അത് പരിശോധിച്ച് മുന്നറിയിപ്പുകളും നല്ല പകരക്കാരും നൽകും.'
                : "Log what you ate for breakfast, lunch, tea-time, or dinner. Coach Saleem's engine will instantly review your foods, warn you in red if any harmful items were logged, and praise your healthy wins with smart swaps!"}
            </p>

            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-emerald-900 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>{isMl ? 'ഭക്ഷണ നിയമങ്ങളുടെ ഗൈഡ് തുറക്കുക (5 വിഭാഗങ്ങൾ)' : 'Open Coach Food Frequency Guide (5 Tiers)'}</span>
            </button>
          </div>
        )}

      </div>

      {/* Complete Food Frequency Encyclopedia Modal */}
      <ClinicalFoodGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        clientName={client.name}
      />
    </>
  );
};
