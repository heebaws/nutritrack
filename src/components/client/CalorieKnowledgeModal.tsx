import React, { useState, useMemo } from 'react';
import { ClientProfile } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Flame,
  HelpCircle,
  X,
  Sparkles,
  Scale,
  Dumbbell,
  Wheat,
  Droplets,
  Activity,
  Calculator,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Apple,
  ShieldCheck,
  HeartPulse,
  Clock,
  Sun,
  Sunset,
  Moon,
  Award
} from 'lucide-react';

interface CalorieKnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: ClientProfile;
  initialTab?: 'what-is-calorie' | 'how-it-detects' | 'how-much-needed' | 'calculator' | 'chrononutrition';
}

export const CalorieKnowledgeModal: React.FC<CalorieKnowledgeModalProps> = ({
  isOpen,
  onClose,
  client,
  initialTab = 'what-is-calorie'
}) => {
  const { language } = useApp();
  const isMl = language === 'ml';

  const [activeTab, setActiveTab] = useState<'what-is-calorie' | 'how-it-detects' | 'how-much-needed' | 'calculator' | 'chrononutrition'>(initialTab);

  // Sync if initialTab changes
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Interactive Calculator State (prefilled with client stats if available)
  const [calcGender, setCalcGender] = useState<'Male' | 'Female'>(client?.gender === 'Female' ? 'Female' : 'Male');
  const [calcAge, setCalcAge] = useState<number>(client?.age || 28);
  const [calcWeight, setCalcWeight] = useState<number>(client?.currentWeightKg || 70);
  const [calcHeight, setCalcHeight] = useState<number>(client?.heightCm || 170);
  const [calcActivity, setCalcActivity] = useState<number>(1.375); // Light active
  const [calcGoal, setCalcGoal] = useState<'loss' | 'maintenance' | 'gain'>(
    client?.goalType === 'gain' ? 'gain' : 'loss'
  );

  // Compute BMR using Mifflin-St Jeor formula
  const computedBmr = useMemo(() => {
    if (calcGender === 'Male') {
      return Math.round((10 * calcWeight) + (6.25 * calcHeight) - (5 * calcAge) + 5);
    } else {
      return Math.round((10 * calcWeight) + (6.25 * calcHeight) - (5 * calcAge) - 161);
    }
  }, [calcGender, calcWeight, calcHeight, calcAge]);

  const computedTdee = useMemo(() => {
    return Math.round(computedBmr * calcActivity);
  }, [computedBmr, calcActivity]);

  const computedTargetCalories = useMemo(() => {
    if (calcGoal === 'loss') return Math.max(1200, computedTdee - 500);
    if (calcGoal === 'gain') return computedTdee + 300;
    return computedTdee;
  }, [computedTdee, calcGoal]);

  // Recommended macros
  const macroGrams = useMemo(() => {
    const proteinKcal = computedTargetCalories * 0.25;
    const carbsKcal = computedTargetCalories * 0.50;
    const fatKcal = computedTargetCalories * 0.25;

    return {
      protein: Math.round(proteinKcal / 4),
      carbs: Math.round(carbsKcal / 4),
      fat: Math.round(fatKcal / 9),
    };
  }, [computedTargetCalories]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-linear-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-5 sm:p-6 shrink-0 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center shrink-0">
                <Flame className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-[11px] text-emerald-200 font-semibold">
                  <span className="uppercase tracking-wider font-black text-emerald-300">
                    {isMl ? 'പോഷണവും ഊർജ്ജവും 101' : 'Nutrition & Energy 101'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{isMl ? 'ലളിതവും വ്യക്തവുമായ ഗൈഡ്' : 'Clear & Jargon-Free Guide'}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5 tracking-tight">
                  {isMl ? 'കലോറിയും ശരീരത്തിന്റെ ഊർജ്ജ ആവശ്യകതയും' : 'Understanding Calories & Your Body'}
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100 mt-1">
                  {isMl
                    ? 'എന്താണ് കലോറി, ന്യൂട്രിട്രാക്ക് അത് എങ്ങനെ കണ്ടെത്തുന്നു, നിങ്ങളുടെ ശരീരത്തിന് ദിവസവും എത്ര ആവശ്യമുണ്ട്.'
                    : 'What is a calorie, how NutriTrack detects it, and exactly how much your body needs every day.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-white/80 hover:text-white p-2.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
              title={isMl ? 'അടയ്ക്കുക' : 'Close Guide'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs (Wrapped cleanly without desktop horizontal scrollbar) */}
          <div className="flex flex-wrap items-center gap-2 mt-5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('what-is-calorie')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'what-is-calorie'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'bg-white/10 text-emerald-100 hover:bg-white/20'
              }`}
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>{isMl ? '1. എന്താണ് കലോറി?' : '1. What is a Calorie?'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('how-it-detects')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'how-it-detects'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'bg-white/10 text-emerald-100 hover:bg-white/20'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{isMl ? '2. എങ്ങനെ കണക്കാക്കുന്നു' : '2. How NutriTrack Detects It'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('how-much-needed')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'how-much-needed'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'bg-white/10 text-emerald-100 hover:bg-white/20'
              }`}
            >
              <HeartPulse className="w-4 h-4 shrink-0" />
              <span>{isMl ? '3. എത്ര കലോറി വേണം?' : '3. How Much Do You Need?'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('calculator')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'calculator'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'bg-white/10 text-emerald-100 hover:bg-white/20'
              }`}
            >
              <Calculator className="w-4 h-4 shrink-0" />
              <span>{isMl ? '4. കലോറി കാൽക്കുലേറ്റർ' : '4. Interactive Calculator'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('chrononutrition')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'chrononutrition'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'bg-white/10 text-emerald-100 hover:bg-white/20'
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>{isMl ? '5. ശാസ്ത്രീയ ഭക്ഷണ സമയം' : '5. Official Meal Timing Science'}</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">

          {/* ================= TAB 1: WHAT IS A CALORIE? ================= */}
          {activeTab === 'what-is-calorie' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Introduction Banner */}
              <div className="bg-emerald-50/80 dark:bg-emerald-950/35 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">
                    {isMl ? 'ലളിതമായ നിർവചനം' : 'Plain-Language Definition'}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {isMl
                      ? 'കലോറി എന്നാൽ നിങ്ങളുടെ ശരീരത്തിനുള്ള ഇന്ധനത്തിന്റെ അളവാണ്.'
                      : 'A Calorie is simply a unit of fuel for your body.'}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1">
                    {isMl
                      ? 'ഒരു വാഹനത്തിന് ഓടാൻ പെട്രോളോ ഡീസലോ ആവശ്യമുള്ളതുപോലെ, രക്തം പമ്പ് ചെയ്യാനും ശ്വസിക്കാനും ചിന്തിക്കാനും നടക്കാനും മനുഷ്യശരീരത്തിന് കലോറി (ഭക്ഷണ ഊർജ്ജം) ആവശ്യമാണ്.'
                      : 'Just as an automobile needs petrol or diesel to move its wheels, your human body needs calories (food energy) to pump blood through your veins, breathe air, think, rebuild tissues, and walk.'}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800/60 text-center shrink-0 sm:w-48 shadow-2xs tabular-nums">
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 block">1 kcal</span>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {isMl ? '1,000 ചെറു കലോറികൾ' : '1,000 calories'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {isMl ? '1 കിലോ വെള്ളം 1°C ചൂടാക്കാൻ വേണ്ട ഊർജ്ജം' : 'Energy to warm 1kg water by 1°C'}
                  </span>
                </div>
              </div>

              {/* Where Calories Go in Your Body */}
              <div>
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    {isMl
                      ? 'നിങ്ങൾ കഴിക്കുന്ന ഭക്ഷണത്തിലെ ഊർജ്ജം ദിവസവും എവിടെ പോകുന്നു?'
                      : 'Where Does Your Food Energy Actually Go Every Day?'}
                  </span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* BMR */}
                  <div className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between tabular-nums">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200">60% – 70%</span>
                      <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400">
                        {isMl ? 'അടിസ്ഥാന അവയവങ്ങൾ' : 'Basal Organs'}
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                      {isMl ? 'BMR (ജീവൻ നിലനിർത്താൻ)' : 'BMR (Keeping You Alive)'}
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {isMl
                        ? 'നിങ്ങൾ ദിവസം മുഴുവൻ അനങ്ങാതെ കിടന്നാലും, ഹൃദയം 100,000 തവണ മിടിക്കാനും തലച്ചോറും ശ്വാസകോശവും പ്രവർത്തിക്കാനും ദിവസവും 1,200 മുതൽ 1,600 kcal വരെ ആവശ്യമാണ്.'
                        : 'Even if you stay in bed all day without moving, your heart beats 100,000 times, your brain processes thoughts, and lungs breathe. This takes 1,200 to 1,600 kcal daily.'}
                    </p>
                  </div>

                  {/* Physical Activity */}
                  <div className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between tabular-nums">
                      <span className="text-xs font-black text-blue-700 dark:text-blue-400">20% – 30%</span>
                      <span className="text-[11px] font-bold text-blue-800 dark:text-blue-400">
                        {isMl ? 'ശാരീരിക ചലനം' : 'Movement'}
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                      {isMl ? 'നടത്തവും വ്യായാമവും' : 'Activity & Workouts'}
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {isMl
                        ? 'നടക്കുന്നതും പടികൾ കയറുന്നതും ജോലി ചെയ്യുന്നതും കായിക വിനോദങ്ങളും. നിങ്ങൾ വയ്ക്കുന്ന ഓരോ ചുവടും അധിക കലോറി കത്തിക്കുന്നു.'
                        : 'Walking, climbing stairs, working, cleaning, and sports. Every step you take and workout you do burns additional calories on top of your baseline.'}
                    </p>
                  </div>

                  {/* Thermic Effect of Food */}
                  <div className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between tabular-nums">
                      <span className="text-xs font-black text-amber-700 dark:text-amber-400">10%</span>
                      <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400">
                        {isMl ? 'ദഹനം' : 'Digestion'}
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                      {isMl ? 'ഭക്ഷണത്തിന്റെ തെർമിക് പ്രഭാവം (TEF)' : 'Thermic Effect (TEF)'}
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {isMl
                        ? 'ഭക്ഷണം ദഹിപ്പിക്കാൻ തന്നെ ആമാശയം ഊർജ്ജം ഉപയോഗിക്കുന്നു. പ്രോട്ടീൻ അടങ്ങിയ ഭക്ഷണങ്ങൾ ദഹിക്കാൻ മാത്രം അവയുടെ 25% കലോറി ചെലവഴിക്കുന്നു!'
                        : 'Your stomach and digestive enzymes burn energy just breaking down food. High-protein foods burn up to 25% of their own calories just digesting!'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Good Calories vs Bad Calories */}
              <div className="bg-linear-to-r from-emerald-50 via-teal-50 to-amber-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-amber-950/30 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                <div className="flex items-center gap-2">
                  <Apple className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  <h4 className="font-black text-slate-900 dark:text-white text-base">
                    {isMl
                      ? 'മുട്ടയിലെ 200 കലോറിയും കോളയിലെ 200 കലോറിയും ഒന്നല്ല (കലോറി നിലവാരം)'
                      : 'Why 200 Calories of Eggs ≠ 200 Calories of Cola (Calorie Quality)'}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {isMl
                    ? 'ഭൗതികശാസ്ത്രത്തിൽ 200 കലോറി എപ്പോഴും ഒന്നാണെങ്കിലും, മനുഷ്യശരീരത്തിന്റെ ജൈവരസതന്ത്രത്തിൽ പോഷകങ്ങൾ തികച്ചും വ്യത്യസ്തമായാണ് പ്രവർത്തിക്കുന്നത്:'
                    : 'In pure physics, 200 calories is 200 calories. But in human biochemistry, your body processes different nutrients completely differently:'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-3.5 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
                    <span className="font-extrabold text-xs text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
                      <span>
                        {isMl
                          ? '🍏 നല്ല കലോറി (മുട്ട, പയറുവർഗ്ഗങ്ങൾ, മീൻ, പച്ചക്കറികൾ)'
                          : '🍏 Wholesome Good Calories (Eggs, Lentils, Fish, Veggies)'}
                      </span>
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {isMl
                        ? 'പ്രോട്ടീനും നാരുകളും ധാതുക്കളും നിറഞ്ഞവ. ഇവ ഇൻസുലിൻ സ്ഥിരപ്പെടുത്തുകയും പേശികളെ സംരക്ഷിക്കുകയും 3–4 മണിക്കൂർ വിശപ്പില്ലാതെ നിർത്തുകയും ചെയ്യുന്നു.'
                        : 'Packed with protein, fiber, and micronutrients. They keep insulin stable, trigger fullness hormones (leptin), protect lean muscle, and keep you full for 3 to 4 hours.'}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-xl p-3.5 border border-amber-200 dark:border-amber-800/60 shadow-2xs">
                    <span className="font-extrabold text-xs text-amber-900 dark:text-amber-400 flex items-center gap-1.5 mb-1">
                      <span>
                        {isMl
                          ? '🍟 മോശം കലോറി (മധുരപാനീയങ്ങൾ, എണ്ണയിൽ വറുത്ത പലഹാരങ്ങൾ)'
                          : '🍟 Refined / Bad Calories (Sugary Drinks, Fried Snacks)'}
                      </span>
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {isMl
                        ? 'രക്തത്തിലെ പഞ്ചസാര പെട്ടെന്ന് കൂട്ടുകയും അധിക കലോറി വയറ്റിലെ കൊഴുപ്പായി സംഭരിക്കുകയും ചെയ്യുന്നു. 40 മിനിറ്റിനുള്ളിൽ വീണ്ടും വിശപ്പ് ഉണ്ടാകും.'
                        : 'Cause sudden blood sugar spikes and large insulin dumps. Excess calories are immediately routed into visceral fat cells, while leaving you hungry again 40 minutes later.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Action */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('how-it-detects')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>
                    {isMl
                      ? 'അടുത്തത്: ന്യൂട്രിട്രാക്ക് എങ്ങനെ കലോറി കണക്കാക്കുന്നു →'
                      : 'Next: How NutriTrack Calculates Calories →'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 2: HOW NUTRITRACK DETECTS IT ================= */}
          {activeTab === 'how-it-detects' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                  {isMl ? 'ശാസ്ത്രീയ അളക്കൽ രീതി' : 'Scientific Measurement Process'}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  {isMl
                    ? 'ഭക്ഷണ കലോറി കൃത്യതയോടെ എങ്ങനെ കണക്കാക്കുന്നു'
                    : 'How NutriTrack Computes Food Calories with Clinical Accuracy'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                  {isMl
                    ? 'നിങ്ങൾ ഒരിക്കലും കലോറി ഊഹിക്കേണ്ടതില്ല. ലബോറട്ടറി ഭക്ഷണ പട്ടികകളും കേരളീയ വിഭവങ്ങളുടെ കൃത്യമായ അളവുകളും 4-4-9 സൂത്രവാക്യവുമാണ് ആപ്പ് ഉപയോഗിക്കുന്നത്.'
                    : 'You never have to guess or manually calculate numbers. NutriTrack uses laboratory food composition tables, Kerala recipe portions, and the universal macronutrient formula.'}
                </p>
              </div>

              {/* The Universal 4-4-9 Macronutrient Formula */}
              <div className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    {isMl
                      ? 'സാർവത്രിക മാക്രോന്യൂട്രിയന്റ് സൂത്രവാക്യം (ഭക്ഷണ ശാസ്ത്രം)'
                      : 'The Universal Macronutrient Formula (The Science of Food)'}
                  </span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {isMl
                    ? 'ഭൂമിയിലെ എല്ലാ ഭക്ഷണത്തിലും പ്രധാനമായും മൂന്ന് ഘടകങ്ങളാണുള്ളത്. ഇവയുടെ ഗ്രാം അളവ് നോക്കിയാണ് കൃത്യമായ കലോറി നിശ്ചയിക്കുന്നത്:'
                    : 'Every food on earth is composed of three primary building blocks. The exact calorie count is calculated by weighing these three grams:'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-3.5 border border-emerald-200 dark:border-emerald-800/60">
                    <div className="flex items-center justify-between tabular-nums">
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                        <Dumbbell className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        {isMl ? 'പ്രോട്ടീൻ' : 'Protein'}
                      </span>
                      <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">4 kcal / g</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                      {isMl
                        ? 'പേശികളും അവയവങ്ങളും ചർമ്മവും നിർമ്മിക്കുന്നു; കോശങ്ങളെ നന്നാക്കുകയും വിശപ്പ് തടയുകയും ചെയ്യുന്നു.'
                        : 'Builds muscle, organs, enzymes, skin. Keeps you feeling full and repairs body tissues.'}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-xl p-3.5 border border-blue-200 dark:border-blue-800/60">
                    <div className="flex items-center justify-between tabular-nums">
                      <span className="text-xs font-bold text-blue-800 dark:text-blue-400 flex items-center gap-1">
                        <Wheat className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        {isMl ? 'കാർബോഹൈഡ്രേറ്റ്സ്' : 'Carbohydrates'}
                      </span>
                      <span className="text-xs font-black text-blue-700 dark:text-blue-400">4 kcal / g</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                      {isMl
                        ? 'തലച്ചോറിന്റെയും ശരീരചലനത്തിന്റെയും ഇന്ധനം. അരി, ഓട്സ്, അപ്പം, പഴങ്ങൾ എന്നിവയിൽ അടങ്ങിയിരിക്കുന്നു.'
                        : 'Fuel for physical movement and brain function. Found in rice, oats, bread, fruits, tubers.'}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-xl p-3.5 border border-amber-200 dark:border-amber-800/60">
                    <div className="flex items-center justify-between tabular-nums">
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        {isMl ? 'കൊഴുപ്പും എണ്ണയും' : 'Fats & Oils'}
                      </span>
                      <span className="text-xs font-black text-amber-700 dark:text-amber-400">9 kcal / g</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                      {isMl
                        ? 'ഹോർമോണുകൾക്കും തലച്ചോറിലെ കോശങ്ങൾക്കും വിറ്റാമിൻ (A, D, E, K) ആഗിരണത്തിനും അനിവാര്യമാണ്.'
                        : 'Essential for hormones, brain cell walls, and fat-soluble vitamins (A, D, E, K).'}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-mono">
                  {isMl
                    ? <><b>ഉദാഹരണം:</b> 1 പുഴുങ്ങിയ മുട്ട (50g) = 6.3g പ്രോട്ടീൻ (25 kcal) + 0.6g കാർബ് (2 kcal) + 5.3g കൊഴുപ്പ് (48 kcal) = <b>75 kcal</b></>
                    : <><b>Real Formula Example:</b> 1 Boiled Egg (50g) = 6.3g Protein (25 kcal) + 0.6g Carb (2 kcal) + 5.3g Fat (48 kcal) = <b>75 kcal</b></>}
                </div>
              </div>

              {/* 3 Input Methods */}
              <div>
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                  {isMl ? 'ഭക്ഷണം കണ്ടെത്താനുള്ള 3 വഴികൾ:' : '3 Ways NutriTrack Detects Your Meals:'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-2 shadow-2xs">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                      📚
                    </div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {isMl ? '800+ കേരള വിഭവങ്ങളുടെ ലൈബ്രറി' : 'Verified Kerala Food Library'}
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {isMl
                        ? 'പുട്ട്, അപ്പം, മലബാർ ബിരിയാണി, മീൻ കറി, പഴംപൊരി തുടങ്ങി എല്ലാ വിഭവങ്ങളുടെയും കൃത്യമായ ഗ്രാമും കലോറിയും തയ്യാറാണ്.'
                        : 'Kerala & Indian dishes (Puttu, Appam, Malabar Biriyani, Fish Curry, Parippu Vada) calibrated with exact grams and portion sizes.'}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-2 shadow-2xs">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
                      🎙️
                    </div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {isMl ? 'ശബ്ദ സന്ദേശവും ചാറ്റും' : 'Voice Recording & Chat'}
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {isMl
                        ? 'മൈക്ക് അമർത്തി മലയാളത്തിലോ ഇംഗ്ലീഷിലോ പറഞ്ഞാൽ മതി; ന്യൂട്രിബോട്ട് അളവുകൾ കണക്കാക്കി ഡയറിയിൽ ചേർക്കും.'
                        : 'Tap the microphone or type in English or Malayalam. NutriBot parses the quantity and logs it with one tap.'}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-2 shadow-2xs">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
                      📷
                    </div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {isMl ? 'ഭക്ഷണത്തിന്റെ ഫോട്ടോ സ്കാൻ' : 'Photo Plate Recognition'}
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {isMl
                        ? 'കഴിക്കുന്ന പാത്രത്തിന്റെ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്താൽ കറികളും എണ്ണയുടെ അളവും ന്യൂട്രിബോട്ട് താനേ കണ്ടെത്തും.'
                        : 'Upload or take a photo of your food. NutriBot estimates the portion, side curries, and cooking oils automatically.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Action */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('what-is-calorie')}
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  {isMl ? '← നിർവചനത്തിലേക്ക് തിരികെ' : '← Back to Definition'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('how-much-needed')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>{isMl ? 'അടുത്തത്: എത്ര കലോറി വേണം? →' : 'Next: How Much Do You Need? →'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 3: HOW MUCH DO YOU NEED? ================= */}
          {activeTab === 'how-much-needed' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                  {isMl ? 'വ്യക്തിഗത ഊർജ്ജ ആവശ്യകത' : 'Personalized Energy Requirements'}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  {isMl ? 'ഒരു മനുഷ്യന് ദിവസവും എത്ര ഊർജ്ജം ആവശ്യമാണ്?' : 'How Much Energy Does a Human Need Daily?'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                  {isMl
                    ? 'പ്രായം, ലിംഗഭേദം, ഇപ്പോഴത്തെ ഭാരം, ഉയരം, ദിവസേനയുള്ള അധ്വാനം എന്നിവ അനുസരിച്ച് ഓരോരുത്തരുടെയും കലോറി ആവശ്യം വ്യത്യസ്തമാണ്.'
                    : "Every person's calorie requirement is different based on age, sex, current body weight, height, and daily physical movement."}
                </p>
              </div>

              {/* The 2-Step Medical Calculation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {isMl ? 'ഘട്ടം 1: BMR (അടിസ്ഥാന ഊർജ്ജം) കണ്ടെത്തുക' : 'Step 1: Calculate BMR (Baseline)'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {isMl
                      ? 'വിശ്രമാവസ്ഥയിൽ ശരീരം ജീവൻ നിലനിർത്താൻ എത്ര കലോറി കത്തിക്കുന്നു എന്ന് Mifflin-St Jeor സൂത്രവാക്യം കണക്കാക്കുന്നു:'
                      : 'The Mifflin-St Jeor clinical formula calculates how many calories your organs burn just to stay alive at rest:'}
                  </p>
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-700 dark:text-slate-300 space-y-1">
                    <div><b>{isMl ? 'പുരുഷൻ' : 'Men'}:</b> (10 × kg) + (6.25 × cm) - (5 × {isMl ? 'പ്രായം' : 'age'}) + 5</div>
                    <div><b>{isMl ? 'സ്ത്രീ' : 'Women'}:</b> (10 × kg) + (6.25 × cm) - (5 × {isMl ? 'പ്രായം' : 'age'}) - 161</div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isMl
                      ? 'സാധാരണയായി മുതിർന്നവർക്ക് 1,200 മുതൽ 1,750 kcal/ദിവസം വരെയാണ് BMR.'
                      : 'Typically ranges from 1,200 to 1,750 kcal/day for adults.'}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {isMl ? 'ഘട്ടം 2: പ്രവൃത്തി നിരക്ക് ഗുണിക്കുക (TDEE)' : 'Step 2: Multiply by Activity (TDEE)'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {isMl
                      ? 'നിങ്ങളുടെ ജോലി, നടത്തം, വ്യായാമം എന്നിവ കൂടി ഉൾപ്പെടുത്തിയ ആകെ കലോറി (TDEE):'
                      : 'Total Daily Energy Expenditure (TDEE) accounts for lifestyle, work, and movement:'}
                  </p>
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                    <li><b>{isMl ? 'ഇരുന്നുകൊണ്ടുള്ള ജോലി' : 'Desk Job / Sedentary'}:</b> BMR × 1.20</li>
                    <li><b>{isMl ? 'മിതമായ നടത്തം (1-3 ദിവസം)' : 'Lightly Active (1-3 days)'}:</b> BMR × 1.375</li>
                    <li><b>{isMl ? 'മികച്ച വ്യായാമം (3-5 ദിവസം)' : 'Moderate Active (3-5 days)'}:</b> BMR × 1.55</li>
                    <li><b>{isMl ? 'കഠിന ശാരീരികാധ്വാനം' : 'Heavy Physical Labor'}:</b> BMR × 1.725</li>
                  </ul>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isMl
                      ? 'സാധാരണയായി ദിവസവും 1,800 മുതൽ 2,600 kcal വരെയാണ് TDEE.'
                      : 'Typically ranges from 1,800 to 2,600 kcal/day.'}
                  </p>
                </div>
              </div>

              {/* The 8,000 kcal Rule */}
              <div className="bg-emerald-50 dark:bg-emerald-950/35 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  <h4 className="font-black text-slate-900 dark:text-white text-sm sm:text-base">
                    {isMl
                      ? '8,000 കലോറി മെഡിക്കൽ നിയമം (1 കിലോ ഭാരം കൂടുന്നതും കുറയുന്നതും)'
                      : 'The 8,000 kcal Medical Rule (How 1 kg of Weight is Lost or Gained)'}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {isMl
                    ? 'വൈദ്യശാസ്ത്രപ്രകാരം 1 കിലോഗ്രാം ശരീരക്കൊഴുപ്പിൽ ഏകദേശം 7,700 മുതൽ 8,000 kcal ഊർജ്ജം അടങ്ങിയിട്ടുണ്ട്.'
                    : 'Clinically, 1 kilogram of human body fat represents approximately 7,700 to 8,000 kcal of stored energy.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-3.5 border border-emerald-200 dark:border-emerald-800/60">
                    <span className="text-xs font-black text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" />
                      {isMl ? 'കൊഴുപ്പ് കുറയ്ക്കൽ (-500 kcal/ദിവസം)' : 'Fat Loss (-500 kcal/day)'}
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {isMl
                        ? 'TDEE-യെക്കാൾ 500 kcal കുറച്ച് കഴിക്കുക. 16 ദിവസത്തിൽ 8,000 kcal കുറവ് വന്ന് 1 കിലോ കൊഴുപ്പ് സുരക്ഷിതമായി കുറയും.'
                        : 'Eat 500 kcal less than your TDEE. Over 16 days, you accumulate an 8,000 kcal deficit = 1 kg of body fat lost safely.'}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                      ⚖️ {isMl ? 'ഭാരം നിലനിർത്തൽ' : 'Maintenance'}
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {isMl
                        ? 'കൃത്യമായി നിങ്ങളുടെ TDEE കലോറി കഴിച്ചാൽ ശരീരഭാരം മാറ്റമില്ലാതെ തുടരും.'
                        : 'Eat exactly your TDEE. Energy in equals energy out. Your weight remains completely steady.'}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-xl p-3.5 border border-blue-200 dark:border-blue-800/60">
                    <span className="text-xs font-black text-blue-800 dark:text-blue-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {isMl ? 'പേശീബലം കൂട്ടൽ (+300 kcal/ദിവസം)' : 'Muscle Bulk (+300 kcal/day)'}
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {isMl
                        ? 'TDEE-യെക്കാൾ 300 kcal അധികവും ഉയർന്ന പ്രോട്ടീനും വ്യായാമവും ചേർത്താൽ ആരോഗ്യകരമായി പേശി വളരും.'
                        : 'Eat 300 kcal above TDEE with high protein (1.6g-2g/kg) and resistance training to build clean muscle tissue.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Client's Personal Breakdown if logged in */}
              {client && (
                <div className="bg-linear-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-300" />
                      <span>
                        {isMl ? `നിങ്ങളുടെ ലൈവ് അളവുകൾ (${client.name})` : `Your Live Prescribed Numbers (${client.name})`}
                      </span>
                    </span>
                    <span className="text-xs font-bold text-emerald-200">
                      {isMl ? 'ലക്ഷ്യം:' : 'Goal:'} {client.goal}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center tabular-nums">
                    <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs border border-white/10">
                      <span className="text-[10px] text-emerald-200 block">{isMl ? 'ഇപ്പോഴത്തെ ഭാരം' : 'Current Weight'}</span>
                      <span className="text-lg font-black text-white">{client.currentWeightKg} kg</span>
                    </div>

                    <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs border border-white/10">
                      <span className="text-[10px] text-emerald-200 block">{isMl ? 'ലക്ഷ്യ ഭാരം' : 'Target Weight'}</span>
                      <span className="text-lg font-black text-white">{client.targetWeightKg} kg</span>
                    </div>

                    <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs border border-white/10">
                      <span className="text-[10px] text-emerald-200 block">{isMl ? 'അടിസ്ഥാന BMR' : 'Baseline BMR'}</span>
                      <span className="text-lg font-black text-white">{client.bmr || 1420} kcal</span>
                    </div>

                    <div className="bg-amber-400 text-slate-900 rounded-xl p-2.5 font-bold shadow-xs">
                      <span className="text-[10px] uppercase font-black tracking-tight block">
                        {isMl ? 'പ്രതിദിന ലക്ഷ്യം' : 'Prescribed Target'}
                      </span>
                      <span className="text-lg font-black">{client.neededCalories || client.targetBmr || 1600} kcal</span>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-100">
                    {isMl
                      ? <>💡 <b>കോച്ചിന്റെ കുറിപ്പ്:</b> നിങ്ങളുടെ മെറ്റബോളിസം മന്ദഗതിയിലാക്കാതെ ലക്ഷ്യത്തിലെത്താൻ പ്രത്യേകം നിശ്ചയിച്ച പ്രതിദിന അളവാണ് <b>{client.neededCalories || client.targetBmr || 1600} kcal</b>.</>
                      : <>💡 <b>Coach Note:</b> Your daily target of <b>{client.neededCalories || client.targetBmr || 1600} kcal</b> is specifically formulated to create a sustainable deficit for your goal without slowing down your thyroid or metabolism.</>}
                  </p>
                </div>
              )}

              {/* Navigation Action */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('how-it-detects')}
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  {isMl ? '← തിരികെ പോകുക' : '← Back to Detection'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('calculator')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>{isMl ? 'ലൈവ് കലോറി കാൽക്കുലേറ്റർ തുറക്കുക →' : 'Try the Live Calorie Calculator →'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 4: INTERACTIVE CALCULATOR ================= */}
          {activeTab === 'calculator' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                  {isMl ? 'ഇന്ററാക്ടീവ് പരിശോധന ടൂൾ' : 'Interactive Exploration Tool'}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  {isMl ? 'ശരീരത്തിന് വേണ്ട കലോറി സ്വയം കണക്കാക്കൂ' : "Calculate Any Human Body's Calorie Needs"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                  {isMl
                    ? 'ഭാരം, ഉയരം, പ്രായം, വ്യായാമം എന്നിവ മാറ്റി നിങ്ങളുടെ പ്രതിദിന കലോറിയും പ്രോട്ടീൻ-കാർബ്-ഫാറ്റ് അളവും പരിശോധിക്കുക.'
                    : 'Adjust the sliders below to explore how weight, activity level, and goals change your daily calorie and macronutrient targets.'}
                </p>
              </div>

              {/* Controls Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">

                {/* Sex & Age */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      {isMl ? 'ലിംഗഭേദം' : 'Biological Sex'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCalcGender('Male')}
                        className={`py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                          calcGender === 'Male'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {isMl ? 'പുരുഷൻ (+5)' : 'Male (+5 offset)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalcGender('Female')}
                        className={`py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                          calcGender === 'Female'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {isMl ? 'സ്ത്രീ (-161)' : 'Female (-161 offset)'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 tabular-nums">
                      <span>{isMl ? 'പ്രായം:' : 'Age:'}</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{calcAge} {isMl ? 'വയസ്സ്' : 'years'}</span>
                    </div>
                    <input
                      type="range"
                      min={14}
                      max={85}
                      value={calcAge}
                      onChange={(e) => setCalcAge(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 tabular-nums">
                      <span>{isMl ? 'ഇപ്പോഴത്തെ ഭാരം:' : 'Current Weight:'}</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{calcWeight} kg</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={160}
                      value={calcWeight}
                      onChange={(e) => setCalcWeight(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 tabular-nums">
                      <span>{isMl ? 'ഉയരം:' : 'Height:'}</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{calcHeight} cm</span>
                    </div>
                    <input
                      type="range"
                      min={130}
                      max={210}
                      value={calcHeight}
                      onChange={(e) => setCalcHeight(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Activity & Goal */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      {isMl ? 'ദിവസേനയുള്ള ശാരീരിക അധ്വാനം' : 'Daily Physical Activity'}
                    </label>
                    <select
                      value={calcActivity}
                      onChange={(e) => setCalcActivity(Number(e.target.value))}
                      className="w-full text-xs font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 focus:outline-emerald-500 cursor-pointer"
                    >
                      <option value={1.2}>
                        {isMl ? 'ഇരുന്നുകൊണ്ടുള്ള ജോലി (വ്യായാമം കുറവ്)' : 'Sedentary (Desk job, minimal exercise)'}
                      </option>
                      <option value={1.375}>
                        {isMl ? 'ലഘു വ്യായാമം (ആഴ്ചയിൽ 1-3 ദിവസം)' : 'Light Active (1-3 days walking/workout)'}
                      </option>
                      <option value={1.55}>
                        {isMl ? 'മിതമായ വ്യായാമം (ആഴ്ചയിൽ 3-5 ദിവസം)' : 'Moderate Active (3-5 days workout/sports)'}
                      </option>
                      <option value={1.725}>
                        {isMl ? 'കഠിന വ്യായാമം (ആഴ്ചയിൽ 6-7 ദിവസം)' : 'Very Active (6-7 days heavy training)'}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      {isMl ? 'പ്രധാന ആരോഗ്യ ലക്ഷ്യം' : 'Primary Health Goal'}
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCalcGoal('loss')}
                        className={`py-2 text-[11px] font-bold rounded-xl border transition-colors cursor-pointer ${
                          calcGoal === 'loss'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {isMl ? '📉 കൊഴുപ്പ് കുറയ്ക്കൽ (-500)' : '📉 Fat Loss (-500)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalcGoal('maintenance')}
                        className={`py-2 text-[11px] font-bold rounded-xl border transition-colors cursor-pointer ${
                          calcGoal === 'maintenance'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {isMl ? '⚖️ നിലനിർത്തൽ' : '⚖️ Maintain'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalcGoal('gain')}
                        className={`py-2 text-[11px] font-bold rounded-xl border transition-colors cursor-pointer ${
                          calcGoal === 'gain'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {isMl ? '📈 പേശി കൂട്ടൽ (+300)' : '📈 Muscle (+300)'}
                      </button>
                    </div>
                  </div>

                  {/* Quick Kerala Food Comparison */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs tabular-nums">
                    <span className="font-extrabold text-slate-700 dark:text-slate-200 block text-[11px] uppercase tracking-wider">
                      {isMl ? 'പ്രധാന കേരളീയ വിഭവങ്ങളുടെ കലോറി:' : 'Popular Portion Calorie Equivalents:'}
                    </span>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>{isMl ? '1 അപ്പവും മുട്ടക്കറിയും:' : '1 Appam with Egg Curry:'}</span>
                      <b className="text-slate-900 dark:text-white">~240 kcal</b>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>{isMl ? '1 പഴംപൊരി:' : '1 Pazham Pori (Banana Fritter):'}</span>
                      <b className="text-amber-800 dark:text-amber-400">~210 kcal</b>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>{isMl ? '1 കപ്പ് പുട്ടും കടലക്കറിയും:' : '1 Cup Puttu with Kadala:'}</span>
                      <b className="text-slate-900 dark:text-white">~340 kcal</b>
                    </div>
                  </div>
                </div>

              </div>

              {/* Live Result Output */}
              <div className="bg-linear-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-5 shadow-md space-y-4 tabular-nums">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/15">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300">
                      {isMl ? 'നിർദ്ദേശിച്ച പ്രതിദിന കലോറി ലക്ഷ്യം' : 'Estimated Daily Recommended Target'}
                    </span>
                    <div className="text-3xl sm:text-4xl font-black text-amber-300 mt-0.5">
                      {computedTargetCalories} <span className="text-sm font-semibold text-white">kcal / {isMl ? 'ദിവസം' : 'day'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-emerald-100">
                    <div className="bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                      <span className="block text-[10px] text-emerald-300">{isMl ? 'അടിസ്ഥാന BMR:' : 'Basal BMR:'}</span>
                      <b>{computedBmr} kcal</b>
                    </div>
                    <div className="bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                      <span className="block text-[10px] text-emerald-300">{isMl ? 'ആകെ TDEE:' : 'Maintenance TDEE:'}</span>
                      <b>{computedTdee} kcal</b>
                    </div>
                  </div>
                </div>

                {/* Macro Split for this calorie level */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-emerald-200 flex-wrap gap-1">
                    <span>
                      {isMl
                        ? `${computedTargetCalories} kcal-നുള്ള സമീകൃത മാക്രോ അളവ്:`
                        : `Balanced Macronutrient Split for ${computedTargetCalories} kcal:`}
                    </span>
                    <span>25% P · 50% C · 25% F</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 pt-1">
                    <div className="bg-white/10 rounded-xl p-2.5 text-center border border-white/10">
                      <span className="text-[10px] text-emerald-200 block">🥩 {isMl ? 'പ്രോട്ടീൻ' : 'Protein'}</span>
                      <span className="text-base font-extrabold text-white">{macroGrams.protein}g</span>
                      <span className="text-[9px] text-emerald-300 block">({macroGrams.protein * 4} kcal)</span>
                    </div>

                    <div className="bg-white/10 rounded-xl p-2.5 text-center border border-white/10">
                      <span className="text-[10px] text-blue-200 block">🌾 {isMl ? 'കാർബ്സ്' : 'Carbs'}</span>
                      <span className="text-base font-extrabold text-white">{macroGrams.carbs}g</span>
                      <span className="text-[9px] text-blue-200 block">({macroGrams.carbs * 4} kcal)</span>
                    </div>

                    <div className="bg-white/10 rounded-xl p-2.5 text-center border border-white/10">
                      <span className="text-[10px] text-amber-200 block">🥑 {isMl ? 'കൊഴുപ്പ്' : 'Fats'}</span>
                      <span className="text-base font-extrabold text-white">{macroGrams.fat}g</span>
                      <span className="text-[9px] text-amber-200 block">({macroGrams.fat * 9} kcal)</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ================= TAB 5: OFFICIAL MEAL TIMING SCIENCE (CHRONONUTRITION) ================= */}
          {activeTab === 'chrononutrition' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Introduction Banner */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-amber-950 dark:text-amber-200 text-base">
                    {isMl
                      ? 'ക്രോണോന്യൂട്രീഷൻ: കലോറി പോലെ തന്നെ ഭക്ഷണം കഴിക്കുന്ന സമയവും പ്രധാനമാണ്'
                      : 'Chrononutrition: Why Meal Timing Matters Just as Much as Calories'}
                  </h3>
                  <p className="text-xs text-amber-900 dark:text-amber-200/80 mt-1 leading-relaxed">
                    {isMl
                      ? 'നിങ്ങളുടെ മെറ്റബോളിസം ഒരു ജൈവിക ക്ലോക്ക് (Circadian Rhythm) അനുസരിച്ചാണ് പ്രവർത്തിക്കുന്നത്. ഉച്ചയ്ക്ക് 1:00-ന് കഴിക്കുന്ന 500 kcal ഭക്ഷണവും രാത്രി 10:30-ന് കഴിക്കുന്ന അതേ ഭക്ഷണവും ശരീരത്തിൽ തികച്ചും വ്യത്യസ്തമായ ഹോർമോൺ മാറ്റങ്ങളാണ് ഉണ്ടാക്കുന്നത്.'
                      : 'Your metabolism is not a steady furnace; it follows an evolutionary circadian rhythm governed by clock genes. The exact same 500 kcal meal eaten at 1:00 PM vs 10:30 PM creates completely different hormonal responses in your body.'}
                  </p>
                </div>
              </div>

              {/* The 3 Official Scientific Meal Windows */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isMl
                    ? 'ശാസ്ത്രീയമായി നിശ്ചയിച്ച 3 പ്രധാന ഭക്ഷണ സമയങ്ങൾ'
                    : 'The Three Official & Scientific Daily Meal Windows'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Breakfast */}
                  <div className="bg-amber-50/60 dark:bg-amber-950/25 rounded-2xl p-4 border border-amber-200 dark:border-amber-800/60 flex flex-col justify-between space-y-3 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                          <Sun className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </span>
                        <span className="text-xs font-black text-amber-900 dark:text-amber-300 font-mono">
                          8:00 AM
                        </span>
                      </div>
                      <h5 className="font-black text-slate-900 dark:text-white text-sm mt-2">
                        {isMl ? '1. പ്രഭാതഭക്ഷണം (Breakfast)' : '1. Morning Breakfast'}
                      </h5>
                      <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 block">
                        {isMl ? 'ശാസ്ത്രീയ സമയം: 7:00 AM – 8:30 AM' : 'Scientific Window: 7:00 AM – 8:30 AM'}
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                        {isMl
                          ? 'രാവിലെ ഇൻസുലിൻ സംവേദനക്ഷമത ഏറ്റവും ഉയർന്നിരിക്കും. ഈ സമയത്ത് കഴിക്കുന്ന ഊർജ്ജം കൊഴുപ്പായി മാറാതെ പേശികളിൽ ഊർജ്ജമായി ഉപയോഗിക്കപ്പെടുന്നു.'
                          : 'Diurnal peak in insulin sensitivity and cortisol. Calories eaten now are immediately routed into muscle glycogen rather than visceral fat. Morning Thermic Effect of Food (TEF) is 2.5× higher than at night.'}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800/60 text-[11px] text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-amber-900 dark:text-amber-300 block mb-0.5">{isMl ? 'കേരളീയ മാതൃക:' : 'Kerala Ideal:'}</span>
                      {isMl
                        ? 'പുട്ടും കടലക്കറിയും, 2 അപ്പവും മുട്ടക്കറിയും, അല്ലെങ്കിൽ ഓട്സ് കഞ്ഞിയും ബദാമും.'
                        : 'Puttu + Kadala curry, 2 Appam with egg roast, or Oats kanji with almonds.'}
                    </div>
                  </div>

                  {/* Lunch */}
                  <div className="bg-orange-50/60 dark:bg-orange-950/25 rounded-2xl p-4 border border-orange-200 dark:border-orange-800/60 flex flex-col justify-between space-y-3 hover:border-orange-300 dark:hover:border-orange-700 transition-colors">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-800 dark:text-orange-300 flex items-center justify-center font-bold text-xs">
                          <Sunset className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        </span>
                        <span className="text-xs font-black text-orange-900 dark:text-orange-300 font-mono">
                          1:00 PM
                        </span>
                      </div>
                      <h5 className="font-black text-slate-900 dark:text-white text-sm mt-2">
                        {isMl ? '2. ഉച്ചഭക്ഷണം (Lunch)' : '2. Midday Lunch'}
                      </h5>
                      <span className="text-[11px] font-bold text-orange-800 dark:text-orange-400 block">
                        {isMl ? 'ശാസ്ത്രീയ സമയം: 12:30 PM – 1:30 PM' : 'Scientific Window: 12:30 PM – 1:30 PM'}
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                        {isMl
                          ? 'ഉച്ചനേരത്ത് ദഹന എൻസൈമുകൾ ഏറ്റവും ശക്തമായിരിക്കും. 2 മണിക്ക് മുമ്പ് ഉച്ചഭക്ഷണം കഴിക്കുന്നത് കൊഴുപ്പ് കുറയ്ക്കാൻ 25% വേഗത നൽകുന്നു.'
                          : 'Pancreatic digestive enzymes (amylase, protease, lipase) and resting body temperature peak at solar noon. In Harvard clinical trials, eating lunch before 2:00 PM yielded 25% higher fat loss vs late lunch.'}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-800/60 text-[11px] text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-orange-900 dark:text-orange-300 block mb-0.5">{isMl ? 'കേരളീയ മാതൃക:' : 'Kerala Ideal:'}</span>
                      {isMl
                        ? '1 കപ്പ് മട്ട അരി ചോറ്, മത്തി/അയല മീൻ കറി, കാബേജ് തോരൻ, സംഭാരം.'
                        : '1 cup Kerala Matta rice, Mathi/Ayala fish curry, Cabbage thoran & Sambharam (spiced buttermilk).'}
                    </div>
                  </div>

                  {/* Dinner */}
                  <div className="bg-indigo-50/60 dark:bg-indigo-950/25 rounded-2xl p-4 border border-indigo-200 dark:border-indigo-800/60 flex flex-col justify-between space-y-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                          <Moon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </span>
                        <span className="text-xs font-black text-indigo-900 dark:text-indigo-300 font-mono">
                          7:30 PM
                        </span>
                      </div>
                      <h5 className="font-black text-slate-900 dark:text-white text-sm mt-2">
                        {isMl ? '3. രാത്രി ഭക്ഷണം (Dinner)' : '3. Evening Dinner'}
                      </h5>
                      <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-400 block">
                        {isMl ? 'ശാസ്ത്രീയ സമയം: 7:00 PM – 8:00 PM' : 'Scientific Window: 7:00 PM – 8:00 PM'}
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                        {isMl
                          ? 'ഉറങ്ങുന്നതിന് 2.5–3 മണിക്കൂർ മുമ്പ് ഭക്ഷണം പൂർത്തിയാക്കുന്നത് രാത്രിയിലെ പഞ്ചസാര വർദ്ധനവ് തടയുകയും കോശങ്ങളുടെ ശുദ്ധീകരണം (Autophagy) എളുപ്പമാക്കുകയും ചെയ്യുന്നു.'
                          : 'Finishing dinner 2.5–3 hours before bed avoids the melatonin-insulin conflict (melatonin blocks pancreatic insulin release). Unlocks a 12-hour clean cellular autophagy & fat-burning fast until morning.'}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800/60 text-[11px] text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-indigo-900 dark:text-indigo-300 block mb-0.5">{isMl ? 'കേരളീയ മാതൃക:' : 'Kerala Ideal:'}</span>
                      {isMl
                        ? '2 ഗോതമ്പ് ചപ്പാത്തിയും പരിപ്പ്-ചീര കറിയും, അല്ലെങ്കിൽ ആവിയിൽ വേവിച്ച പച്ചക്കറിയും ഗ്രിൽഡ് ചിക്കനും.'
                        : '2 Wheat phulkas with Dal palak, or Steamed vegetables with grilled chicken/paneer. Avoid heavy biriyani!'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Biological Mechanisms Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-black text-sm text-white">
                    {isMl ? 'ക്രോണോന്യൂട്രീഷനിലെ 3 ജൈവിക നിയമങ്ങൾ' : 'The 3 Biological Laws of Chrononutrition'}
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                    <span className="font-bold text-emerald-300 block mb-1">
                      {isMl ? '1. ഇൻസുലിൻ ക്ലോക്ക്' : '1. Insulin Clock'}
                    </span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {isMl
                        ? 'രാവിലെ 8 മുതൽ ഉച്ചയ്ക്ക് 2 വരെ പേശികൾ ഇൻസുലിനോട് നന്നായി പ്രതികരിക്കുന്നു; പകൽ സമയത്തെ കാർബ്സ് വേഗം ദഹിക്കും.'
                        : 'Your muscle cells are significantly more insulin sensitive between 8 AM and 2 PM. Carbohydrates consumed during daylight are metabolized efficiently without chronic insulin spikes.'}
                    </p>
                  </div>

                  <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                    <span className="font-bold text-emerald-300 block mb-1">
                      {isMl ? '2. മെലറ്റോണിൻ പ്രഭാവം' : '2. Melatonin Antagonism'}
                    </span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {isMl
                        ? 'രാത്രി ഉറക്ക ഹോർമോൺ (മെലറ്റോണിൻ) ഇൻസുലിനെ തടയുന്നു. അതിനാൽ 8:30-ന് ശേഷമുള്ള ഭക്ഷണം പഞ്ചസാര കൂട്ടുന്നു.'
                        : 'When evening comes, the pineal gland releases melatonin to induce sleep. Melatonin directly inhibits pancreatic beta cells from secreting insulin. Late dinners (post 8:30 PM) keep blood glucose high all night.'}
                    </p>
                  </div>

                  <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                    <span className="font-bold text-emerald-300 block mb-1">
                      {isMl ? '3. 12-മണിക്കൂർ ഓട്ടോഫജി വിശ്രമം' : '3. The 12-Hour Autophagy Window'}
                    </span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {isMl
                        ? '7:30 PM-ന് അത്താഴം കഴിച്ച് 8:00 AM-ന് പ്രഭാതഭക്ഷണം കഴിക്കുമ്പോൾ ശരീരത്തിന് സ്വാഭാവികമായ 12.5 മണിക്കൂർ വിശ്രമം ലഭിക്കുന്നു.'
                        : 'By wrapping up dinner at 7:30 PM and eating breakfast at 8:00 AM, you secure a natural 12.5-hour clean metabolic fast every single day without any extreme starvation.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Coach Saleem's Habit Checklist */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 dark:text-emerald-100 space-y-1">
                  <span className="font-black block">
                    {isMl ? 'കോച്ച് സലീമിന്റെ സുവർണ്ണ നിയമം:' : "Coach Saleem's Golden Rule:"}
                  </span>
                  <p className="leading-relaxed">
                    {isMl
                      ? <>നിങ്ങളുടെ ഫോൺ അലേർട്ടുകൾ <b>8:00 AM</b>, <b>1:00 PM</b>, <b>7:30 PM</b> സമയങ്ങളിൽ സെറ്റ് ചെയ്യുക. കഴിക്കാൻ ഇരിക്കുമ്പോൾ തന്നെ ന്യൂട്രിട്രാക്കിൽ രേഖപ്പെടുത്തുന്നത് അനാവശ്യ സ്നാക്കുകൾ ഒഴിവാക്കാൻ സഹായിക്കും.</>
                      : <>Set your phone notifications to remind you at <b>8:00 AM</b>, <b>1:00 PM</b>, and <b>7:30 PM</b>. Even a 10-second log in NutriTrack right when you sit down ensures you stay disciplined and prevents after-hours mindless snacking!</>}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              {isMl
                ? 'WHO, ICMR മാർഗ്ഗനിർദ്ദേശങ്ങളും കോച്ച് സലീം പ്രോട്ടോക്കോളുകളും അടിസ്ഥാനമാക്കി തയ്യാറാക്കിയത്.'
                : 'Medically calibrated based on WHO and ICMR guidelines & Coach Saleem protocols.'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs ml-auto min-h-[44px]"
          >
            {isMl ? 'മനസ്സിലായി, നന്ദി!' : 'Got It, Thanks!'}
          </button>
        </div>

      </div>
    </div>
  );
};
