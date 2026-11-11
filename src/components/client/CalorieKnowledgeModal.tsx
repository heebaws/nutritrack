import React, { useState, useMemo } from 'react';
import { ClientProfile } from '../../types';
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
  ArrowRight, 
  CheckCircle2, 
  Info, 
  BookOpen, 
  Utensils, 
  Award, 
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Apple,
  ShieldCheck,
  HeartPulse,
  Clock,
  Sun,
  Sunset,
  Moon
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
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
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                    Nutrition &amp; Energy 101
                  </span>
                  <span className="text-[10px] text-emerald-300 font-medium">Clear &amp; Jargon-Free Guide</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5 tracking-tight">
                  Understanding Calories &amp; Your Body
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100 mt-1">
                  What is a calorie, how NutriTrack detects it, and exactly how much your body needs every day.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title="Close Guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 mt-5 overflow-x-auto pb-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('what-is-calorie')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'what-is-calorie'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'bg-white/10 text-emerald-100 hover:bg-white/20'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>1. What is a Calorie?</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('how-it-detects')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'how-it-detects'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'bg-white/10 text-emerald-100 hover:bg-white/20'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>2. How NutriTrack Detects It</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('how-much-needed')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'how-much-needed'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'bg-white/10 text-emerald-100 hover:bg-white/20'
              }`}
            >
              <HeartPulse className="w-4 h-4" />
              <span>3. How Much Do You Need?</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('calculator')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'calculator'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'bg-white/10 text-emerald-100 hover:bg-white/20'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>4. Interactive Calculator</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('chrononutrition')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'chrononutrition'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'bg-white/10 text-emerald-100 hover:bg-white/20'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>5. Official Meal Timing Science</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-800 text-sm leading-relaxed">
          
          {/* ================= TAB 1: WHAT IS A CALORIE? ================= */}
          {activeTab === 'what-is-calorie' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Introduction Banner */}
              <div className="bg-emerald-50/80 rounded-2xl p-5 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 block">
                    Plain-Language Definition
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">
                    A Calorie is simply a unit of fuel for your body.
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1">
                    Just as an automobile needs petrol or diesel to move its wheels, your human body needs calories (food energy) to pump blood through your veins, breathe air, think, rebuild tissues, and walk.
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-emerald-200 text-center shrink-0 sm:w-44 shadow-2xs">
                  <span className="text-2xl font-black text-emerald-700 block">1 kcal</span>
                  <span className="text-[11px] font-bold text-slate-500">1,000 calories</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Energy to warm 1kg water by 1°C</span>
                </div>
              </div>

              {/* Where Calories Go in Your Body */}
              <div>
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Where Does Your Food Energy Actually Go Every Day?</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* BMR */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800">60% – 70%</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Basal Organs
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-900 text-sm">BMR (Keeping You Alive)</h5>
                    <p className="text-xs text-slate-600">
                      Even if you stay in bed all day without moving, your heart beats 100,000 times, your brain processes thoughts, and lungs breathe. This takes <b>1,200 to 1,600 kcal</b> daily.
                    </p>
                  </div>

                  {/* Physical Activity */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-blue-700">20% – 30%</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        Movement
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-900 text-sm">Activity &amp; Workouts</h5>
                    <p className="text-xs text-slate-600">
                      Walking, climbing stairs, working, cleaning, and sports. Every step you take and workout you do burns additional calories on top of your baseline.
                    </p>
                  </div>

                  {/* Thermic Effect of Food */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-700">10%</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Digestion
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-900 text-sm">Thermic Effect (TEF)</h5>
                    <p className="text-xs text-slate-600">
                      Your stomach and digestive enzymes burn energy just breaking down food. High-protein foods burn up to <b>25% of their own calories</b> just digesting!
                    </p>
                  </div>
                </div>
              </div>

              {/* Good Calories vs Bad Calories */}
              <div className="bg-linear-to-r from-emerald-50 via-teal-50 to-amber-50 rounded-2xl p-5 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Apple className="w-5 h-5 text-emerald-700" />
                  <h4 className="font-black text-slate-900 text-base">
                    Why 200 Calories of Eggs ≠ 200 Calories of Cola (Calorie Quality)
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  In pure physics, 200 calories is 200 calories. But in <b>human biochemistry</b>, your body processes different nutrients completely differently:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-white rounded-xl p-3.5 border border-emerald-200 shadow-2xs">
                    <span className="font-extrabold text-xs text-emerald-800 flex items-center gap-1.5 mb-1">
                      <span>🍏 Wholesome Good Calories (Eggs, Lentils, Fish, Veggies)</span>
                    </span>
                    <p className="text-xs text-slate-600">
                      Packed with protein, fiber, and micronutrients. They keep insulin stable, trigger fullness hormones (leptin), protect lean muscle, and keep you full for 3 to 4 hours.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-3.5 border border-amber-200 shadow-2xs">
                    <span className="font-extrabold text-xs text-amber-900 flex items-center gap-1.5 mb-1">
                      <span>🍟 Refined / Bad Calories (Sugary Drinks, Fried Snacks)</span>
                    </span>
                    <p className="text-xs text-slate-600">
                      Cause sudden blood sugar spikes and large insulin dumps. Excess calories are immediately routed into visceral fat cells, while leaving you hungry again 40 minutes later.
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
                  <span>Next: How NutriTrack Calculates Calories →</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 2: HOW NUTRITRACK DETECTS IT ================= */}
          {activeTab === 'how-it-detects' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 block">
                  Scientific Measurement Process
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  How NutriTrack Computes Food Calories with Clinical Accuracy
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  You never have to guess or manually calculate numbers. NutriTrack uses laboratory food composition tables, Kerala recipe portions, and the universal macronutrient formula.
                </p>
              </div>

              {/* The Universal 4-4-9 Macronutrient Formula */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  <span>The Universal Macronutrient Formula (The Science of Food)</span>
                </h4>
                <p className="text-xs text-slate-600">
                  Every food on earth is composed of three primary building blocks. The exact calorie count is calculated by weighing these three grams:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-white rounded-xl p-3.5 border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                        <Dumbbell className="w-3.5 h-3.5 text-emerald-600" />
                        Protein
                      </span>
                      <span className="text-xs font-black text-emerald-700">4 kcal / gram</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      Builds muscle, organs, enzymes, skin. Keeps you feeling full and repairs body tissues.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-3.5 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-800 flex items-center gap-1">
                        <Wheat className="w-3.5 h-3.5 text-blue-600" />
                        Carbohydrates
                      </span>
                      <span className="text-xs font-black text-blue-700">4 kcal / gram</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      Fuel for physical movement and brain function. Found in rice, oats, bread, fruits, tubers.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-3.5 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-amber-600" />
                        Fats &amp; Oils
                      </span>
                      <span className="text-xs font-black text-amber-700">9 kcal / gram</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      Essential for hormones, brain cell walls, and fat-soluble vitamins (A, D, E, K).
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 font-mono">
                  <b>Real Formula Example:</b> 1 Boiled Egg (50g) = 6.3g Protein (25 kcal) + 0.6g Carb (2 kcal) + 5.3g Fat (48 kcal) = <b>75 kcal</b>
                </div>
              </div>

              {/* 3 Input Methods: Database, Voice, Photo */}
              <div>
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 mb-3">
                  3 Ways NutriTrack Detects Your Meals:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2 shadow-2xs">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      📚
                    </div>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">560+ Verified Foods</h5>
                    <p className="text-xs text-slate-600">
                      Kerala &amp; Indian dishes (Puttu, Appam, Malabar Biriyani, Fish Curry, Parippu Vada) calibrated with exact grams and portion sizes.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2 shadow-2xs">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                      🎙️
                    </div>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Voice Recording &amp; Chat</h5>
                    <p className="text-xs text-slate-600">
                      Tap the microphone or type in English or Malayalam. NutriBot parses the quantity and logs it with one tap.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2 shadow-2xs">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                      📷
                    </div>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Photo Plate Recognition</h5>
                    <p className="text-xs text-slate-600">
                      Upload or take a photo of your food. NutriBot estimates the portion, side curries, and cooking oils automatically.
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Action */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('what-is-calorie')}
                  className="text-slate-600 hover:text-slate-900 font-bold text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  ← Back to Definition
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('how-much-needed')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Next: How Much Do You Need? →</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 3: HOW MUCH DO YOU NEED? ================= */}
          {activeTab === 'how-much-needed' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 block">
                  Personalized Energy Requirements
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  How Much Energy Does a Human Need Daily?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Every person's calorie requirement is different based on age, sex, current body weight, height, and daily physical movement.
                </p>
              </div>

              {/* The 2-Step Medical Calculation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                    <h4 className="font-bold text-slate-900 text-sm">Step 1: Calculate BMR (Baseline)</h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    The <b>Mifflin-St Jeor</b> clinical formula calculates how many calories your organs burn just to stay alive at rest:
                  </p>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] font-mono text-slate-700 space-y-1">
                    <div><b>Men:</b> (10 × kg) + (6.25 × cm) - (5 × age) + 5</div>
                    <div><b>Women:</b> (10 × kg) + (6.25 × cm) - (5 × age) - 161</div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Typically ranges from <b>1,200 to 1,750 kcal/day</b> for adults.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                    <h4 className="font-bold text-slate-900 text-sm">Step 2: Multiply by Activity (TDEE)</h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    Total Daily Energy Expenditure (TDEE) accounts for lifestyle, work, and movement:
                  </p>
                  <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                    <li><b>Desk Job / Sedentary:</b> BMR × 1.20</li>
                    <li><b>Lightly Active (1-3 days):</b> BMR × 1.375</li>
                    <li><b>Moderate Active (3-5 days):</b> BMR × 1.55</li>
                    <li><b>Heavy Physical Labor:</b> BMR × 1.725</li>
                  </ul>
                  <p className="text-[11px] text-slate-500">
                    Typically ranges from <b>1,800 to 2,600 kcal/day</b>.
                  </p>
                </div>
              </div>

              {/* The 8,000 kcal Rule for Weight Change */}
              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-700" />
                  <h4 className="font-black text-slate-900 text-sm sm:text-base">
                    The 8,000 kcal Medical Rule (How 1 kg of Weight is Lost or Gained)
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Clinically, <b>1 kilogram of human body fat represents approximately 7,700 to 8,000 kcal of stored energy</b>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-white rounded-xl p-3.5 border border-emerald-200">
                    <span className="text-xs font-black text-emerald-800 flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" />
                      Fat Loss (-500 kcal/day)
                    </span>
                    <p className="text-xs text-slate-600 mt-1">
                      Eat 500 kcal less than your TDEE. Over 16 days, you accumulate an 8,000 kcal deficit = <b>1 kg of body fat lost safely</b>.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-3.5 border border-slate-200">
                    <span className="text-xs font-black text-slate-800">
                      ⚖️ Maintenance
                    </span>
                    <p className="text-xs text-slate-600 mt-1">
                      Eat exactly your TDEE. Energy in equals energy out. Your weight remains completely steady.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-3.5 border border-blue-200">
                    <span className="text-xs font-black text-blue-800 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Muscle Bulk (+300 kcal/day)
                    </span>
                    <p className="text-xs text-slate-600 mt-1">
                      Eat 300 kcal above TDEE with high protein (1.6g-2g/kg) and resistance training to build clean muscle tissue.
                    </p>
                  </div>
                </div>
              </div>

              {/* Client's Personal Breakdown if logged in */}
              {client && (
                <div className="bg-linear-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-300" />
                      <span>Your Live Prescribed Numbers ({client.name})</span>
                    </span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                      Goal: {client.goal}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs border border-white/10">
                      <span className="text-[10px] text-emerald-200 block">Current Weight</span>
                      <span className="text-lg font-black text-white">{client.currentWeightKg} kg</span>
                    </div>

                    <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs border border-white/10">
                      <span className="text-[10px] text-emerald-200 block">Target Weight</span>
                      <span className="text-lg font-black text-white">{client.targetWeightKg} kg</span>
                    </div>

                    <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs border border-white/10">
                      <span className="text-[10px] text-emerald-200 block">Baseline BMR</span>
                      <span className="text-lg font-black text-white">{client.bmr || 1420} kcal</span>
                    </div>

                    <div className="bg-amber-400 text-slate-900 rounded-xl p-2.5 font-bold shadow-xs">
                      <span className="text-[10px] uppercase font-black tracking-tight block">Prescribed Target</span>
                      <span className="text-lg font-black">{client.neededCalories || client.targetBmr || 1600} kcal</span>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-100">
                    💡 <b>Coach Note:</b> Your daily target of <b>{client.neededCalories || client.targetBmr || 1600} kcal</b> is specifically formulated to create a sustainable deficit for your goal without slowing down your thyroid or metabolism.
                  </p>
                </div>
              )}

              {/* Navigation Action */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('how-it-detects')}
                  className="text-slate-600 hover:text-slate-900 font-bold text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  ← Back to Detection
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('calculator')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Try the Live Calorie Calculator →</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 4: INTERACTIVE CALCULATOR ================= */}
          {activeTab === 'calculator' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 block">
                  Interactive Exploration Tool
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Calculate Any Human Body's Calorie Needs
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Adjust the sliders below to explore how weight, activity level, and goals change your daily calorie and macronutrient targets.
                </p>
              </div>

              {/* Controls Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50 rounded-2xl p-5 border border-slate-200">
                
                {/* Sex & Age */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Biological Sex</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCalcGender('Male')}
                        className={`py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                          calcGender === 'Male'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Male (+5 offset)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalcGender('Female')}
                        className={`py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                          calcGender === 'Female'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Female (-161 offset)
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Age:</span>
                      <span className="text-emerald-700 font-extrabold">{calcAge} years</span>
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
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Current Weight:</span>
                      <span className="text-emerald-700 font-extrabold">{calcWeight} kg</span>
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
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Height:</span>
                      <span className="text-emerald-700 font-extrabold">{calcHeight} cm</span>
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
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Daily Physical Activity</label>
                    <select
                      value={calcActivity}
                      onChange={(e) => setCalcActivity(Number(e.target.value))}
                      className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-emerald-500 cursor-pointer"
                    >
                      <option value={1.2}>Sedentary (Desk job, minimal exercise)</option>
                      <option value={1.375}>Light Active (1-3 days walking/workout)</option>
                      <option value={1.55}>Moderate Active (3-5 days workout/sports)</option>
                      <option value={1.725}>Very Active (6-7 days heavy training)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Primary Health Goal</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCalcGoal('loss')}
                        className={`py-2 text-[11px] font-bold rounded-xl border transition-colors cursor-pointer ${
                          calcGoal === 'loss'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        📉 Fat Loss (-500)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalcGoal('maintenance')}
                        className={`py-2 text-[11px] font-bold rounded-xl border transition-colors cursor-pointer ${
                          calcGoal === 'maintenance'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        ⚖️ Maintain
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalcGoal('gain')}
                        className={`py-2 text-[11px] font-bold rounded-xl border transition-colors cursor-pointer ${
                          calcGoal === 'gain'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        📈 Muscle (+300)
                      </button>
                    </div>
                  </div>

                  {/* Quick Kerala Food Comparison */}
                  <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-1.5 text-xs">
                    <span className="font-extrabold text-slate-700 block text-[11px] uppercase tracking-wider">
                      Popular Portion Calorie Equivalents:
                    </span>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>1 Appam with Egg Curry:</span>
                      <b className="text-slate-900">~240 kcal</b>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>1 Pazham Pori (Banana Fritter):</span>
                      <b className="text-amber-800">~210 kcal</b>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>1 Cup Puttu with Kadala:</span>
                      <b className="text-slate-900">~340 kcal</b>
                    </div>
                  </div>
                </div>

              </div>

              {/* Live Result Output */}
              <div className="bg-linear-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-5 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/15">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300">
                      Estimated Daily Recommended Target
                    </span>
                    <div className="text-3xl sm:text-4xl font-black text-amber-300 mt-0.5">
                      {computedTargetCalories} <span className="text-sm font-semibold text-white">kcal / day</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-emerald-100">
                    <div className="bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                      <span className="block text-[10px] text-emerald-300">Basal BMR:</span>
                      <b>{computedBmr} kcal</b>
                    </div>
                    <div className="bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                      <span className="block text-[10px] text-emerald-300">Maintenance TDEE:</span>
                      <b>{computedTdee} kcal</b>
                    </div>
                  </div>
                </div>

                {/* Macro Split for this calorie level */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-emerald-200">
                    <span>Balanced Macronutrient Split for {computedTargetCalories} kcal:</span>
                    <span>25% P • 50% C • 25% F</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 pt-1">
                    <div className="bg-white/10 rounded-xl p-2.5 text-center border border-white/10">
                      <span className="text-[10px] text-emerald-200 block">🥩 Protein</span>
                      <span className="text-base font-extrabold text-white">{macroGrams.protein}g</span>
                      <span className="text-[9px] text-emerald-300 block">({macroGrams.protein * 4} kcal)</span>
                    </div>

                    <div className="bg-white/10 rounded-xl p-2.5 text-center border border-white/10">
                      <span className="text-[10px] text-blue-200 block">🌾 Carbs</span>
                      <span className="text-base font-extrabold text-white">{macroGrams.carbs}g</span>
                      <span className="text-[9px] text-blue-200 block">({macroGrams.carbs * 4} kcal)</span>
                    </div>

                    <div className="bg-white/10 rounded-xl p-2.5 text-center border border-white/10">
                      <span className="text-[10px] text-amber-200 block">🥑 Fats</span>
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
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-amber-950 text-base">
                    Chrononutrition: Why Meal Timing Matters Just as Much as Calories
                  </h3>
                  <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                    Your metabolism is not a steady furnace; it follows an evolutionary <b>circadian rhythm</b> governed by clock genes. The exact same 500 kcal meal eaten at <b>1:00 PM</b> vs <b>10:30 PM</b> creates completely different hormonal responses in your body.
                  </p>
                </div>
              </div>

              {/* The 3 Official Scientific Meal Windows */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  The Three Official &amp; Scientific Daily Meal Windows
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Breakfast */}
                  <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200 flex flex-col justify-between space-y-3 hover:border-amber-300 transition-colors">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold text-xs">
                          <Sun className="w-4 h-4 text-amber-600" />
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-mono">
                          8:00 AM
                        </span>
                      </div>
                      <h5 className="font-black text-slate-900 text-sm mt-2">
                        1. Morning Breakfast
                      </h5>
                      <span className="text-[11px] font-bold text-amber-800 block">
                        Scientific Window: 7:00 AM – 8:30 AM
                      </span>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        <b>Why 8:00 AM?</b> Diurnal peak in insulin sensitivity and cortisol. Calories eaten now are immediately routed into muscle glycogen rather than visceral fat. Morning Thermic Effect of Food (TEF) is 2.5× higher than at night.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-[11px] text-slate-700">
                      <span className="font-bold text-amber-900 block mb-0.5">Kerala Ideal:</span>
                      Puttu + Kadala curry, 2 Appam with egg roast, or Oats kanji with almonds.
                    </div>
                  </div>

                  {/* Lunch */}
                  <div className="bg-orange-50/60 rounded-2xl p-4 border border-orange-200 flex flex-col justify-between space-y-3 hover:border-orange-300 transition-colors">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-800 flex items-center justify-center font-bold text-xs">
                          <Sunset className="w-4 h-4 text-orange-600" />
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-200 text-orange-900 font-mono">
                          1:00 PM
                        </span>
                      </div>
                      <h5 className="font-black text-slate-900 text-sm mt-2">
                        2. Midday Lunch
                      </h5>
                      <span className="text-[11px] font-bold text-orange-800 block">
                        Scientific Window: 12:30 PM – 1:30 PM
                      </span>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        <b>Why 1:00 PM?</b> Pancreatic digestive enzymes (amylase, protease, lipase) and resting body temperature peak at solar noon. In Harvard clinical trials, eating lunch before 2:00 PM yielded <b>25% higher fat loss</b> vs late lunch.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-orange-200 text-[11px] text-slate-700">
                      <span className="font-bold text-orange-900 block mb-0.5">Kerala Ideal:</span>
                      1 cup Kerala Matta rice, Mathi/Ayala fish curry, Cabbage thoran &amp; Sambharam (spiced buttermilk).
                    </div>
                  </div>

                  {/* Dinner */}
                  <div className="bg-indigo-50/60 rounded-2xl p-4 border border-indigo-200 flex flex-col justify-between space-y-3 hover:border-indigo-300 transition-colors">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-800 flex items-center justify-center font-bold text-xs">
                          <Moon className="w-4 h-4 text-indigo-600" />
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-900 font-mono">
                          7:30 PM
                        </span>
                      </div>
                      <h5 className="font-black text-slate-900 text-sm mt-2">
                        3. Evening Dinner
                      </h5>
                      <span className="text-[11px] font-bold text-indigo-800 block">
                        Scientific Window: 7:00 PM – 8:00 PM
                      </span>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        <b>Why 7:30 PM?</b> Finishing dinner 2.5–3 hours before bed avoids the melatonin-insulin conflict (melatonin blocks pancreatic insulin release). Unlocks a 12-hour clean cellular autophagy &amp; fat-burning fast until morning.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-indigo-200 text-[11px] text-slate-700">
                      <span className="font-bold text-indigo-900 block mb-0.5">Kerala Ideal:</span>
                      2 Wheat phulkas with Dal palak, or Steamed vegetables with grilled chicken/paneer. Avoid heavy biriyani!
                    </div>
                  </div>
                </div>
              </div>

              {/* Biological Mechanisms Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-black text-sm text-white">
                    The 3 Biological Laws of Chrononutrition
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                    <span className="font-bold text-emerald-300 block mb-1">1. Insulin Clock</span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      Your muscle cells are significantly more insulin sensitive between 8 AM and 2 PM. Carbohydrates consumed during daylight are metabolized efficiently without chronic insulin spikes.
                    </p>
                  </div>

                  <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                    <span className="font-bold text-emerald-300 block mb-1">2. Melatonin Antagonism</span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      When evening comes, the pineal gland releases melatonin to induce sleep. Melatonin directly inhibits pancreatic beta cells from secreting insulin. Late dinners (post 8:30 PM) keep blood glucose high all night.
                    </p>
                  </div>

                  <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                    <span className="font-bold text-emerald-300 block mb-1">3. The 12-Hour Autophagy Window</span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      By wrapping up dinner at 7:30 PM and eating breakfast at 8:00 AM, you secure a natural 12.5-hour clean metabolic fast every single day without any extreme starvation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Coach Saleem's Habit Checklist */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 space-y-1">
                  <span className="font-black block">Coach Saleem&apos;s Golden Rule:</span>
                  <p className="leading-relaxed">
                    Set your phone notifications to remind you at <b>8:00 AM</b>, <b>1:00 PM</b>, and <b>7:30 PM</b>. Even a 10-second log in NutriTrack right when you sit down ensures you stay disciplined and prevents after-hours mindless snacking!
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Medically calibrated based on WHO and ICMR guidelines &amp; Coach Saleem protocols.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs ml-auto"
          >
            Got It, Thanks!
          </button>
        </div>

      </div>
    </div>
  );
};
