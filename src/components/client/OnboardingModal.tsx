import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActivityLevel, DietPreference, EquipmentAccess, ExperienceLevel } from '../../types';
import {
  assessBMI,
  cmToFtIn,
  ftInToCm,
  kgToLbs,
  lbsToKg,
  validateSafeGoalSettings,
  CLINICAL_DISCLAIMER,
} from '../../utils/clinicalSafety';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Target,
  Utensils,
  Dumbbell,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALLERGY_OPTIONS = ['Dairy', 'Nuts', 'Gluten', 'Eggs', 'Fish / Seafood', 'Soy'];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { activeClient, updateClientSelf, language } = useApp();
  const isMl = language === 'ml';

  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [goalType, setGoalType] = useState<'loss' | 'gain' | 'maintenance'>('loss');
  const [heightCm, setHeightCm] = useState(170);
  const [feet, setFeet] = useState(5);
  const [inches, setInches] = useState(7);
  const [currentWeightKg, setCurrentWeightKg] = useState(70);
  const [targetWeightKg, setTargetWeightKg] = useState(65);
  const [weeklyRateKg, setWeeklyRateKg] = useState(0.5);

  const [dietPreference, setDietPreference] = useState<DietPreference>('balanced');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Beginner');
  const [scheduleDaysPerWeek, setScheduleDaysPerWeek] = useState(4);
  const [equipment, setEquipment] = useState<EquipmentAccess>('none_home');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');

  useEffect(() => {
    if (!isOpen || !activeClient) return;
    setStep(0);
    setUnitSystem(activeClient.preferredUnitSystem || 'metric');
    const h = activeClient.heightCm || 170;
    setHeightCm(h);
    const fi = cmToFtIn(h);
    setFeet(fi.feet);
    setInches(fi.inches);
    setCurrentWeightKg(activeClient.currentWeightKg || 70);
    setTargetWeightKg(activeClient.targetWeightKg || 65);
    setGoalType(
      activeClient.goalType ||
        (activeClient.targetWeightKg > activeClient.currentWeightKg
          ? 'gain'
          : activeClient.targetWeightKg < activeClient.currentWeightKg
          ? 'loss'
          : 'maintenance')
    );
    setWeeklyRateKg(Math.min(1.0, activeClient.weeklyRateKg || 0.5));
    setDietPreference(activeClient.dietPreference || 'balanced');
    setActivityLevel(activeClient.activityLevel || 'moderate');
    setExperienceLevel(activeClient.experienceLevel || 'Beginner');
    setScheduleDaysPerWeek(activeClient.scheduleDaysPerWeek || 4);
    setEquipment(activeClient.equipment || 'none_home');
    setAllergies(activeClient.allergies || []);
    setMedicalNotes(activeClient.medicalNotes || '');
    setCustomAllergy('');
  }, [isOpen, activeClient]);

  const effectiveHeightCm = unitSystem === 'imperial' ? ftInToCm(feet, inches) : heightCm;

  const bmiAssessment = useMemo(
    () => assessBMI(currentWeightKg, effectiveHeightCm),
    [currentWeightKg, effectiveHeightCm]
  );

  const validation = useMemo(
    () =>
      validateSafeGoalSettings({
        currentWeightKg,
        targetWeightKg,
        heightCm: effectiveHeightCm,
        age: activeClient?.age || 30,
        gender: activeClient?.gender || 'Male',
        goalType,
        activityLevel,
        requestedWeeklyRateKg: weeklyRateKg,
      }),
    [currentWeightKg, targetWeightKg, effectiveHeightCm, activeClient?.age, activeClient?.gender, goalType, activityLevel, weeklyRateKg]
  );

  if (!isOpen || !activeClient) return null;

  const toggleAllergy = (item: string) => {
    setAllergies((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const handleFinish = () => {
    const goalText =
      goalType === 'loss'
        ? 'Sustainable Weight Loss'
        : goalType === 'gain'
        ? 'Healthy Lean Weight Gain'
        : 'Balanced Maintenance';

    updateClientSelf({
      heightCm: effectiveHeightCm,
      currentWeightKg: Math.round(currentWeightKg * 10) / 10,
      targetWeightKg: validation.safeTargetWeightKg,
      goalType,
      goal: goalText,
      weeklyRateKg: validation.safeWeeklyRateKg,
      neededCalories: validation.safeDailyCalories,
      bmi: bmiAssessment.bmi,
      bmiStatus: bmiAssessment.shortLabel,
      dietPreference,
      activityLevel,
      experienceLevel,
      scheduleDaysPerWeek,
      equipment,
      allergies,
      medicalNotes: medicalNotes.trim(),
      preferredUnitSystem: unitSystem,
      onboardingCompleted: true,
    });
    onClose();
  };

  const stepsMeta = [
    { title: isMl ? 'ലക്ഷ്യവും വേഗതയും' : 'Goals & Safety Pace', icon: Target },
    { title: isMl ? 'ഭക്ഷണ ശീലങ്ങൾ' : 'Eating Habits', icon: Utensils },
    { title: isMl ? 'വ്യായാമവും സമയവും' : 'Fitness & Equipment', icon: Dumbbell },
    { title: isMl ? 'അലർജിയും ആരോഗ്യവും' : 'Allergies & Safety Review', icon: ShieldAlert },
  ];

  const ActiveIcon = stepsMeta[step].icon;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-emerald-950 text-white px-5 py-4 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
              <ActiveIcon className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold text-white truncate">
                {isMl ? 'ന്യൂട്രിട്രാക്ക് പേഴ്സണൽ കാലിബ്രേഷൻ' : 'NutriTrack Adaptive Onboarding'}
              </h2>
              <p className="text-[11px] text-emerald-200 truncate">
                Step {step + 1} of 4 · {stepsMeta[step].title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
            <span>{isMl ? 'അടയ്ക്കുക' : 'Close'}</span>
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-4 gap-1 px-5 pt-3 bg-slate-50/70 dark:bg-slate-950/60">
          {stepsMeta.map((s, idx) => (
            <button
              key={s.title}
              type="button"
              onClick={() => setStep(idx as 0 | 1 | 2 | 3)}
              className={`h-1.5 rounded-full transition-colors cursor-pointer ${
                idx <= step ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'
              }`}
              aria-label={`Jump to step ${idx + 1}: ${s.title}`}
            />
          ))}
        </div>

        {/* Scrollable Step Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {step === 0 && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  {isMl ? 'നിങ്ങളുടെ പ്രധാന ലക്ഷ്യം തിരഞ്ഞെടുക്കുക' : 'Choose Your Primary Wellness Goal'}
                </span>
                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setUnitSystem('metric')}
                    className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                      unitSystem === 'metric' ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-white shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    kg / cm
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const fi = cmToFtIn(heightCm);
                      setFeet(fi.feet);
                      setInches(fi.inches);
                      setUnitSystem('imperial');
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                      unitSystem === 'imperial' ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-white shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    lbs / ft·in
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { key: 'loss', title: isMl ? 'ഭാരം കുറയ്ക്കൽ' : 'Lose Fat Safely', sub: 'Sustainable deficit' },
                    { key: 'maintenance', title: isMl ? 'ഭാരം നിലനിർത്തൽ' : 'Maintain & Tone', sub: 'Steady energy balance' },
                    { key: 'gain', title: isMl ? 'ഭാരം കൂട്ടൽ' : 'Gain Lean Mass', sub: 'Surplus + protein' },
                  ] as const
                ).map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => setGoalType(g.key)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      goalType === g.key
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-950 dark:text-white ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-extrabold text-xs">{g.title}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{g.sub}</div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 tabular-nums">
                {unitSystem === 'metric' ? (
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Height (cm)</label>
                    <input
                      type="number"
                      min={100}
                      max={235}
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Feet</label>
                      <input
                        type="number"
                        min={3}
                        max={7}
                        value={feet}
                        onChange={(e) => setFeet(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Inches</label>
                      <input
                        type="number"
                        min={0}
                        max={11}
                        value={inches}
                        onChange={(e) => setInches(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Current ({unitSystem === 'imperial' ? 'lbs' : 'kg'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={unitSystem === 'imperial' ? kgToLbs(currentWeightKg) : currentWeightKg}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setCurrentWeightKg(unitSystem === 'imperial' ? lbsToKg(v) : v);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Target ({unitSystem === 'imperial' ? 'lbs' : 'kg'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={unitSystem === 'imperial' ? kgToLbs(targetWeightKg) : targetWeightKg}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setTargetWeightKg(unitSystem === 'imperial' ? lbsToKg(v) : v);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              {goalType === 'loss' && (
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between mb-1">
                    <span>Weekly Weight Loss Pace (capped ≤ 1.0 kg/week)</span>
                    <b className="text-emerald-700 dark:text-emerald-400 tabular-nums">{weeklyRateKg.toFixed(2)} kg/wk</b>
                  </label>
                  <input
                    type="range"
                    min={0.25}
                    max={1.0}
                    step={0.05}
                    value={weeklyRateKg}
                    onChange={(e) => setWeeklyRateKg(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                {isMl ? 'നിങ്ങളുടെ ഭക്ഷണരീതി തിരഞ്ഞെടുക്കുക' : 'Select Your Everyday Eating Style'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { key: 'balanced', label: 'Balanced Omnivore' },
                    { key: 'kerala_traditional', label: 'Kerala Wholesome' },
                    { key: 'high_protein', label: 'High Protein' },
                    { key: 'vegetarian', label: 'Vegetarian' },
                    { key: 'eggetarian', label: 'Eggetarian' },
                    { key: 'pescatarian', label: 'Pescatarian' },
                    { key: 'vegan', label: 'Plant Vegan' },
                    { key: 'low_carb', label: 'Lower Carb' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setDietPreference(opt.key)}
                    className={`p-3 rounded-2xl border font-bold text-left cursor-pointer transition-all ${
                      dietPreference === opt.key
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1.5">
                  Daily Activity Baseline
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(
                    [
                      { key: 'sedentary', label: 'Sedentary', desc: 'Mostly desk / <4k steps' },
                      { key: 'light', label: 'Lightly Active', desc: '5k–7k steps · 1–2 workouts' },
                      { key: 'moderate', label: 'Moderately Active', desc: '8k+ steps · 3–4 workouts' },
                      { key: 'active', label: 'Very Active', desc: '5–6 workouts/wk' },
                      { key: 'very_active', label: 'Athletic', desc: 'Daily intense training' },
                    ] as const
                  ).map((act) => (
                    <button
                      key={act.key}
                      type="button"
                      onClick={() => setActivityLevel(act.key)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                        activityLevel === act.key
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-950 dark:text-white'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-bold">{act.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{act.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-2">
                  Starting Experience Level (auto-updates live from your 14-day logging & workout consistency)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperienceLevel(lvl)}
                      className={`p-3 rounded-2xl border font-extrabold text-center cursor-pointer transition-colors ${
                        experienceLevel === lvl
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between mb-1">
                  <span>Preferred Workout Days per Week</span>
                  <b className="text-emerald-700 dark:text-emerald-400 tabular-nums">{scheduleDaysPerWeek} days/wk</b>
                </label>
                <input
                  type="range"
                  min={2}
                  max={7}
                  step={1}
                  value={scheduleDaysPerWeek}
                  onChange={(e) => setScheduleDaysPerWeek(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <p className="font-bold text-slate-600 dark:text-slate-300 mb-2">Equipment Access</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(
                    [
                      { key: 'none_home', label: 'No Equipment (Home)', desc: 'Bodyweight + walking' },
                      { key: 'dumbbells_bands', label: 'Dumbbells & Bands', desc: 'Home resistance kit' },
                      { key: 'full_gym', label: 'Full Gym Access', desc: 'Machines & free weights' },
                    ] as const
                  ).map((eq) => (
                    <button
                      key={eq.key}
                      type="button"
                      onClick={() => setEquipment(eq.key)}
                      className={`p-3 rounded-2xl border text-left cursor-pointer ${
                        equipment === eq.key
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-950 dark:text-white'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-bold">{eq.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{eq.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1.5">
                  Food Allergies &amp; Exclusions (Auto-filtered from Adaptive Diet Plan)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {ALLERGY_OPTIONS.map((al) => {
                    const active = allergies.includes(al);
                    return (
                      <button
                        key={al}
                        type="button"
                        onClick={() => toggleAllergy(al)}
                        className={`px-3 py-1.5 rounded-xl border font-bold cursor-pointer ${
                          active
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {al}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customAllergy}
                    onChange={(e) => setCustomAllergy(e.target.value)}
                    placeholder="Add other allergy (e.g., Shellfish, Peanuts)..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const v = customAllergy.trim();
                      if (v && !allergies.includes(v)) setAllergies((p) => [...p, v]);
                      setCustomAllergy('');
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Injury / Joint / Clinical Notes (Optional)
                </label>
                <input
                  type="text"
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  placeholder="e.g., Knee discomfort, Lower back care, Thyroid..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Calibrated Summary Box */}
              <div className="rounded-2xl p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 tabular-nums">
                  <span className="font-extrabold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Safe Calibrated Daily Budget: <b>{validation.safeDailyCalories} kcal/day</b>
                  </span>
                  <span className="font-bold text-slate-600 dark:text-slate-300">
                    BMI {bmiAssessment.bmi} · {bmiAssessment.shortLabel}
                  </span>
                </div>
                {validation.warnings.map((w, idx) => (
                  <p key={idx} className="text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </p>
                ))}
                {bmiAssessment.bannerMessage && (
                  <p className="text-[11px] text-amber-800 dark:text-amber-300">{bmiAssessment.bannerMessage}</p>
                )}
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{CLINICAL_DISCLAIMER}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 shrink-0">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 0 | 1 | 2 | 3)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">Safe limits enforced automatically</span>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as 0 | 1 | 2 | 3)}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>{isMl ? 'പദ്ധതി സേവ് ചെയ്യുക' : 'Save & Generate My Plan'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
