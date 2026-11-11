import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Utensils, 
  Flame, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Award, 
  Bot, 
  Droplets, 
  Bell, 
  ShieldCheck,
  Scale,
  Smartphone
} from 'lucide-react';
import { NutriTrackLogo } from '../common/NutriTrackLogo';

interface AppTourGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCalorieGuide?: () => void;
  onOpenMealLog?: () => void;
}

export const AppTourGuideModal: React.FC<AppTourGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenCalorieGuide,
  onOpenMealLog
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "Welcome to NutriTrack PRO!",
      subtitle: "Your personal clinical diet & healthy lifestyle companion",
      icon: <Sparkles className="w-8 h-8 text-amber-300" />,
      content: (
        <div className="space-y-4">
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              Zero Confusion. Everything is Automatic.
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              NutriTrack is built so you never need anyone to explain how it works. You log what you eat, tap when you drink water, and your coach monitors your daily progress live.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-2xs">
              <span className="text-xl block mb-1">🍽️</span>
              <b className="text-slate-800 block">1. Log Meals</b>
              <span className="text-slate-500 text-[11px]">Takes 30 seconds per meal</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-2xs">
              <span className="text-xl block mb-1">🎯</span>
              <b className="text-slate-800 block">2. Stay in Green</b>
              <span className="text-slate-500 text-[11px]">Daily calories target bar</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-2xs">
              <span className="text-xl block mb-1">👨‍⚕️</span>
              <b className="text-slate-800 block">3. Coach Feedback</b>
              <span className="text-slate-500 text-[11px]">Daily advice &amp; scan reports</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Logging Your Meals in 30 Seconds",
      subtitle: "Instant food search, voice speech, or food photos",
      icon: <Utensils className="w-8 h-8 text-emerald-300" />,
      content: (
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-slate-600">
            You can record your breakfast, lunch, snacks, and dinner in multiple effortless ways:
          </p>

          <div className="space-y-2.5">
            <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                1
              </div>
              <div>
                <b className="text-xs text-slate-900 block">Tap "+ Log Meal" on Any Meal Slot</b>
                <p className="text-xs text-slate-500">
                  Search 560+ verified Kerala &amp; Indian dishes (Pazham Pori, Appam, Puttu, Biriyani). Calories, protein, carbs, and fats auto-calculate.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </div>
              <div>
                <b className="text-xs text-slate-900 block">Tell NutriBot AI (Voice or Text)</b>
                <p className="text-xs text-slate-500">
                  Click the green NutriBot icon at the bottom-right. Speak with the microphone in Malayalam or English ("I ate 2 appam and 1 egg curry"). It records it into your diary in 1 click!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-xs">
                3
              </div>
              <div>
                <b className="text-xs text-slate-900 block">Copy From Prescribed Diet Plan</b>
                <p className="text-xs text-slate-500">
                  If you followed your coach's prescribed plan, click "Log Entire Plan Meal" to import all planned foods in 1 second.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Your Calorie Meter & Good vs Bad Calories",
      subtitle: "The science of staying in the green without feeling starved",
      icon: <Flame className="w-8 h-8 text-amber-400" />,
      content: (
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
              Your Daily Target (e.g. 1,600 kcal)
            </h4>
            <p className="text-xs text-slate-600">
              Your target is calculated scientifically by your coach based on your BMR, height, and body fat goal.
            </p>

            <div className="pt-2">
              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
                <div className="bg-emerald-600 h-full w-[65%]" title="Good Calories" />
                <div className="bg-amber-500 h-full w-[15%]" title="Bad Calories" />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>🍏 Good Calories (High Protein &amp; Fiber)</span>
                <span>🍟 Treats / Fried</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-3">
            <span>Want to learn what a calorie really is and how much a human needs?</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCalorieGuide?.();
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs whitespace-nowrap cursor-pointer shrink-0"
            >
              Open Calorie Guide 101 →
            </button>
          </div>
        </div>
      )
    },
    {
      title: "Stay Active with Scheduled Reminders",
      subtitle: "Automatic check-ins at Breakfast, Lunch, and Dinner",
      icon: <Bell className="w-8 h-8 text-teal-300" />,
      content: (
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600">
            To make sure you never forget your diary, NutriTrack has automatic reminders:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <span className="font-bold text-amber-900 block">🌅 Morning (8:00 AM)</span>
              <span className="text-[10px] text-amber-700 font-semibold block">Window: 7:00 – 8:30 AM</span>
              <span className="text-slate-600 text-[11px] mt-0.5 block">Breakfast &amp; morning cortisol insulin alignment</span>
            </div>
            <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
              <span className="font-bold text-orange-900 block">☀️ Afternoon (1:00 PM)</span>
              <span className="text-[10px] text-orange-700 font-semibold block">Window: 12:30 – 1:30 PM</span>
              <span className="text-slate-600 text-[11px] mt-0.5 block">Lunch &amp; peak midday digestive fire</span>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
              <span className="font-bold text-indigo-900 block">🌙 Night (7:30 PM)</span>
              <span className="text-[10px] text-indigo-700 font-semibold block">Window: 7:00 – 8:00 PM</span>
              <span className="text-slate-600 text-[11px] mt-0.5 block">Dinner pre-melatonin (3 hrs before sleep)</span>
            </div>
          </div>

          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
            <Smartphone className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <b>3-Day Inactive Protection:</b> If you don't log meals for 3 consecutive days, your profile flags in red in your coach's portal, and phone reminders are triggered to keep you accountable!
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Clean 'Comfort View' with 1-Click Shortcuts",
      subtitle: "Deep data is neatly tucked away so your screen is always peaceful",
      icon: <Award className="w-8 h-8 text-emerald-300" />,
      content: (
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600">
            We noticed clients can feel overwhelmed when too much data shows at once. That's why we organized secondary data behind fast <b>1-click shortcuts</b>:
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <b>🧠 Calorie 101 Guide:</b>
              <span className="text-slate-500 block text-[11px]">Learn BMR &amp; food calories</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <b>📈 8,000 kcal Trajectory:</b>
              <span className="text-slate-500 block text-[11px]">Weight loss projections</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <b>🩺 Clinical Food Rules:</b>
              <span className="text-slate-500 block text-[11px]">Coach Saleem cautions &amp; tiers</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <b>💧 Water &amp; Habits:</b>
              <span className="text-slate-500 block text-[11px]">Glasses, sleep &amp; daily steps</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-semibold text-center">
            🎉 You're ready to start! No complicated manuals or instructions needed.
          </div>
        </div>
      )
    }
  ];

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              {current.icon}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                Step {currentStep + 1} of {steps.length}
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">{current.title}</h3>
              <p className="text-xs text-emerald-100">{current.subtitle}</p>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center gap-1.5 mt-4">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-8 bg-amber-400' : idx < currentStep ? 'w-3 bg-emerald-400' : 'w-3 bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {current.content}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <span>Let's Get Started!</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
