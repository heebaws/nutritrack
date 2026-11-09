import React, { useState } from 'react';
import { X, ShieldAlert, AlertTriangle, AlertCircle, CheckCircle, Info, Heart, Flame, Sparkles } from 'lucide-react';
import { CLINICAL_FOOD_ENCYCLOPEDIA } from '../../utils/clinicalFoodAudit';

interface ClinicalFoodGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName?: string;
}

export const ClinicalFoodGuideModal: React.FC<ClinicalFoodGuideModalProps> = ({
  isOpen,
  onClose,
  clientName = 'Client'
}) => {
  const [selectedTierId, setSelectedTierId] = useState<string>('all');

  if (!isOpen) return null;

  const tiersToShow = selectedTierId === 'all' 
    ? CLINICAL_FOOD_ENCYCLOPEDIA.tiers 
    : CLINICAL_FOOD_ENCYCLOPEDIA.tiers.filter(t => t.id === selectedTierId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-5 sm:p-6 shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              Official Clinical Guidelines
            </span>
            <span className="text-xs text-emerald-200 font-medium">Saleem Valanchery Wellness Centre</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Coach Saleem's Food Frequency &amp; Risk Guide
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
            Personalized clinical roadmap for <span className="font-bold text-white">{clientName}</span>. Use this authoritative frequency guide to know exactly which foods to enjoy daily, which to moderate, and which to keep strictly as rare treats.
          </p>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-4 no-scrollbar">
            <button
              onClick={() => setSelectedTierId('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedTierId === 'all'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              All 5 Tiers
            </button>
            <button
              onClick={() => setSelectedTierId('strict_avoid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                selectedTierId === 'strict_avoid'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-rose-900/40 text-rose-200 hover:bg-rose-900/60'
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              Strict Avoid
            </button>
            <button
              onClick={() => setSelectedTierId('once_twice_month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                selectedTierId === 'once_twice_month'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'bg-red-900/40 text-red-200 hover:bg-red-900/60'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              1–2x Month
            </button>
            <button
              onClick={() => setSelectedTierId('once_twice_week')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                selectedTierId === 'once_twice_week'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-900/40 text-amber-200 hover:bg-amber-900/60'
              }`}
            >
              <Info className="w-3 h-3" />
              1–2x Week
            </button>
            <button
              onClick={() => setSelectedTierId('daily_portion')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                selectedTierId === 'daily_portion'
                  ? 'bg-yellow-500 text-slate-900 shadow-sm'
                  : 'bg-yellow-900/40 text-yellow-200 hover:bg-yellow-900/60'
              }`}
            >
              Portion Control
            </button>
            <button
              onClick={() => setSelectedTierId('daily_superfoods')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                selectedTierId === 'daily_superfoods'
                  ? 'bg-emerald-400 text-emerald-950 shadow-sm'
                  : 'bg-emerald-900/40 text-emerald-200 hover:bg-emerald-900/60'
              }`}
            >
              <CheckCircle className="w-3 h-3" />
              Eat Daily Freely
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Golden Principles from Coach Saleem */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                4 Clinical Rules of Thumb from Coach Saleem &amp; Faseela Saleem
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CLINICAL_FOOD_ENCYCLOPEDIA.goldenRules.map((rule, idx) => (
                <div key={idx} className="bg-white/90 rounded-xl p-3 border border-amber-100 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-950">
                    <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 text-[10px] flex items-center justify-center font-black shrink-0">
                      {idx + 1}
                    </span>
                    {rule.title}
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {rule.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tiers List */}
          <div className="space-y-6">
            {tiersToShow.map((tier) => {
              const isRose = tier.id === 'strict_avoid';
              const isRed = tier.id === 'once_twice_month';
              const isAmber = tier.id === 'once_twice_week';
              const isYellow = tier.id === 'daily_portion';
              const isGreen = tier.id === 'daily_superfoods';

              const headerBg = isRose 
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : isRed
                ? 'bg-red-50 border-red-200 text-red-950'
                : isAmber
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : isYellow
                ? 'bg-yellow-50 border-yellow-200 text-yellow-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950';

              const badgeBg = isRose
                ? 'bg-rose-600 text-white'
                : isRed
                ? 'bg-red-600 text-white'
                : isAmber
                ? 'bg-amber-600 text-white'
                : isYellow
                ? 'bg-yellow-600 text-white'
                : 'bg-emerald-600 text-white';

              return (
                <div key={tier.id} className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${headerBg}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${badgeBg}`}>
                          {tier.badge}
                        </span>
                        <h4 className="font-black text-sm sm:text-base">{tier.title}</h4>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{tier.subtitle}</p>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 bg-white">
                    {tier.items.map((item, i) => (
                      <div key={i} className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5">
                          <div className="space-y-1 max-w-xl">
                            <span className="font-extrabold text-xs sm:text-sm text-slate-900 block">
                              {item.name}
                            </span>
                            <p className="text-xs text-slate-600 leading-snug">
                              {item.details}
                            </p>
                          </div>
                          <div className={`text-[11px] sm:text-xs font-semibold px-2.5 py-1.5 rounded-xl border shrink-0 sm:max-w-xs ${
                            isGreen 
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                              : isRose || isRed
                              ? 'bg-rose-50 text-rose-900 border-rose-200'
                              : 'bg-amber-50 text-amber-900 border-amber-200'
                          }`}>
                            <span className="font-bold block text-[10px] uppercase tracking-wider opacity-75">
                              {isGreen ? 'Clinical Benefit' : 'Health Risk / Caution'}
                            </span>
                            {item.danger}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Balanced Plate Guide Callout */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  The Universal Balanced Plate Rule
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                Every main meal should aim for: <span className="text-emerald-300 font-bold">50% Vegetables &amp; Whole Fruits</span>, <span className="text-blue-300 font-bold">25% Clean Protein</span> (eggs, fish, lentils, sprouts), and <span className="text-amber-300 font-bold">25% Whole Grains</span> (matta rice, oats, chapati).
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-md"
            >
              Got It, Coach!
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
