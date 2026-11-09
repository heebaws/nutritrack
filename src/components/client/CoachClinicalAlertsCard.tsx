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
  Flame, 
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { MealLogItem, ClientProfile } from '../../types';
import { auditDailyMealLogs } from '../../utils/clinicalFoodAudit';
import { ClinicalFoodGuideModal } from './ClinicalFoodGuideModal';

interface CoachClinicalAlertsCardProps {
  logs: MealLogItem[];
  client: ClientProfile;
  selectedDate: string;
}

export const CoachClinicalAlertsCard: React.FC<CoachClinicalAlertsCardProps> = ({
  logs,
  client,
  selectedDate
}) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'both' | 'alerts' | 'praise'>('both');

  const audit = auditDailyMealLogs(logs, client);

  return (
    <>
      <div className="space-y-4">
        
        {/* ================= RED ALERT SECTION: FOODS THAT MAY CAUSE PROBLEMS ================= */}
        {audit.hasProblemFoods && (
          <div className="bg-rose-50/95 border-2 border-rose-300 rounded-3xl p-5 shadow-xs text-rose-950 space-y-4 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-600 text-white">
                      Coach Clinical Alert
                    </span>
                    <span className="text-[11px] font-bold text-rose-800">
                      {audit.problemFoods.length} Item{audit.problemFoods.length > 1 ? 's' : ''} Flagged
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-rose-950 mt-0.5">
                    Coach Saleem's Urgent Food Warning
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-rose-100 hover:bg-rose-200/80 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer border border-rose-200 shrink-0 flex items-center gap-1"
                title="View frequency rules"
              >
                <BookOpen className="w-3 h-3" />
                <span className="hidden sm:inline">Rules</span>
              </button>
            </div>

            {/* Coach Voice Prompt */}
            <p className="text-xs text-rose-900 leading-relaxed font-medium bg-white/70 p-3 rounded-2xl border border-rose-200">
              <span className="font-extrabold text-rose-950">Notice for {client.name}:</span> {audit.dailyCoachVerdict.message}
            </p>

            {/* List of Problem Foods Logged Today */}
            <div className="space-y-2.5">
              {audit.problemFoods.map(({ logId, foodName, mealType, calories, audit: itemAudit }) => (
                <div 
                  key={logId}
                  className="bg-white rounded-2xl p-3.5 border border-rose-200 shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-xs sm:text-sm text-slate-900">
                          {foodName}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
                          {mealType}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {calories} kcal
                        </span>
                      </div>
                      <span className="inline-block text-[10px] font-black uppercase tracking-wider text-rose-700 mt-0.5">
                        {itemAudit.tierLabel}
                      </span>
                    </div>

                    <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {/* Why it causes problems */}
                  <div className="bg-rose-50/80 rounded-xl p-2.5 text-[11px] text-rose-950 border border-rose-100 space-y-1">
                    <span className="font-bold text-[10px] uppercase tracking-wider text-rose-800 block">
                      Clinical Risk &amp; Frequency Limit:
                    </span>
                    <p className="leading-snug">{itemAudit.clinicalReason}</p>
                    <span className="inline-block text-[10px] font-black text-rose-800 bg-rose-200/60 px-2 py-0.5 rounded">
                      Limit: {itemAudit.frequencyGuideline}
                    </span>
                  </div>

                  {/* Medical Condition Warning if active */}
                  {itemAudit.medicalConditionsWarning && itemAudit.medicalConditionsWarning.length > 0 && (
                    <div className="p-2 rounded-xl bg-red-100/90 border border-red-300 text-red-950 text-[11px] font-bold">
                      {itemAudit.medicalConditionsWarning.map((cw, i) => (
                        <div key={i}>{cw}</div>
                      ))}
                    </div>
                  )}

                  {/* Recommended Good Swap */}
                  <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-200 text-emerald-950 space-y-1">
                    <div className="flex items-center justify-between gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 text-emerald-600" />
                        Coach Saleem's Smart Swap
                      </span>
                      {itemAudit.recommendedSwap.caloriesSaved && (
                        <span className="text-emerald-700 font-extrabold bg-emerald-100 px-1.5 py-0.2 rounded">
                          {itemAudit.recommendedSwap.caloriesSaved}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-black text-emerald-900">
                      {itemAudit.recommendedSwap.name}
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-snug">
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
              <span>View Full Frequency Rules (Once/Month vs Once/Week)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ================= GREEN PRAISE SECTION: HEALTHY FOODS SUPPORT & GOOD OPTIONS ================= */}
        {audit.hasHealthyFoods && (
          <div className="bg-emerald-50/95 border-2 border-emerald-300 rounded-3xl p-5 shadow-xs text-emerald-950 space-y-4 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                      Coach Praise
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800">
                      {audit.healthyFoods.length} Superfood{audit.healthyFoods.length > 1 ? 's' : ''} Logged
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-emerald-950 mt-0.5">
                    Coach Saleem's Commendation
                  </h3>
                </div>
              </div>

              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>

            {/* Coach Praise Message */}
            <p className="text-xs text-emerald-900 leading-relaxed font-medium bg-white/70 p-3 rounded-2xl border border-emerald-200">
              <span className="font-extrabold text-emerald-950">Great job, {client.name}!</span> You logged wholesome, nutrient-dense foods today. These provide essential dietary fiber, clean micronutrients, and protect your visceral fat balance.
            </p>

            {/* Logged Healthy Items Badges */}
            <div className="flex flex-wrap gap-1.5">
              {audit.healthyFoods.map(({ logId, foodName, mealType }) => (
                <span 
                  key={logId}
                  className="inline-flex items-center gap-1 text-[11px] font-bold bg-white px-2.5 py-1 rounded-xl border border-emerald-200 text-emerald-900 shadow-2xs"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {foodName} <span className="text-[10px] text-emerald-600 font-semibold">({mealType})</span>
                </span>
              ))}
            </div>

            {/* Balanced Plate Meter */}
            <div className="bg-white rounded-2xl p-3.5 border border-emerald-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  Today's Plate Balance
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Target: 50% Veg / 25% Prot / 25% Grains</span>
              </div>

              {/* Progress Bar */}
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden flex border border-slate-200">
                <div 
                  style={{ width: `${Math.min(100, audit.plateDistribution.veggiesAndFruitsPercent)}%` }} 
                  className="bg-emerald-500 h-full transition-all"
                  title={`Veggies & Fruits: ${audit.plateDistribution.veggiesAndFruitsPercent}%`}
                />
                <div 
                  style={{ width: `${Math.min(100, audit.plateDistribution.leanProteinPercent)}%` }} 
                  className="bg-blue-500 h-full transition-all"
                  title={`Protein: ${audit.plateDistribution.leanProteinPercent}%`}
                />
                <div 
                  style={{ width: `${Math.min(100, audit.plateDistribution.wholeGrainsPercent)}%` }} 
                  className="bg-amber-500 h-full transition-all"
                  title={`Whole Grains: ${audit.plateDistribution.wholeGrainsPercent}%`}
                />
              </div>

              <div className="grid grid-cols-3 gap-1 pt-1 text-center text-[10px] font-bold">
                <span className="text-emerald-700">🥗 Veggies {audit.plateDistribution.veggiesAndFruitsPercent}%</span>
                <span className="text-blue-700">🥩 Protein {audit.plateDistribution.leanProteinPercent}%</span>
                <span className="text-amber-700">🌾 Grains {audit.plateDistribution.wholeGrainsPercent}%</span>
              </div>
            </div>

            {/* Arranged Good Options (Coach Saleem's Logic) */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-emerald-600" />
                  Arranged Good Options (Coach Logic)
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">Next Meals</span>
              </div>

              <div className="space-y-2">
                {audit.arrangedGoodOptions.map((opt, i) => (
                  <div key={i} className="bg-white/90 rounded-2xl p-3 border border-emerald-100 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-black text-slate-900">{opt.title}</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {opt.mealSlot}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {opt.recommendedFoods.map((rf, rIdx) => (
                        <span key={rIdx} className="text-[10px] font-bold bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          ✓ {rf}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug pt-1">
                      {opt.benefit}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* If no meals logged yet today, show clean clinical guide invitation */}
        {!audit.hasProblemFoods && !audit.hasHealthyFoods && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold shrink-0">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Daily Clinical Food Audit
                </span>
                <h4 className="text-xs sm:text-sm font-black text-slate-900">
                  Coach Saleem's Guidance Ready
                </h4>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Log what you ate for breakfast, lunch, tea-time, or dinner. Coach Saleem's engine will instantly review your foods, warn you in red if any harmful items were logged, and praise your healthy wins with smart swaps!
            </p>

            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-emerald-900 font-bold text-xs border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
              <span>Open Coach Food Frequency Guide (5 Tiers)</span>
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
