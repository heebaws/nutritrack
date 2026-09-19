import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UserPlus, Check } from 'lucide-react';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose }) => {
  const { dietitians, dietPlans, addClient } = useApp();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('password123');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [age, setAge] = useState<number>(30);
  const [heightCm, setHeightCm] = useState<number>(165);
  const [startingWeightKg, setStartingWeightKg] = useState<number>(70);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(64);
  const [goal, setGoal] = useState('');
  const [assignedDietitianId, setAssignedDietitianId] = useState<string>(dietitians[0]?.id || '');
  const [dietPlanId, setDietPlanId] = useState<string>(dietPlans[0]?.id || '');
  const [medicalNotes, setMedicalNotes] = useState('');

  // New Body Composition & Health Metrics
  const [bodyFatPercentage, setBodyFatPercentage] = useState<number>(gender === 'Male' ? 24 : 32);
  const [targetBodyFatPercentage, setTargetBodyFatPercentage] = useState<number>(gender === 'Male' ? 18 : 24);
  const [visceralFat, setVisceralFat] = useState<number>(10);
  const [targetVisceralFat, setTargetVisceralFat] = useState<number>(7);
  const [customBmi, setCustomBmi] = useState<string>('');
  const [targetBmi, setTargetBmi] = useState<number>(21.5);
  const [bmr, setBmr] = useState<number>(1520);
  const [bmrActivity, setBmrActivity] = useState<string>('Sedentary Desk Job');

  // USER MANDATE: Typed Needed Calorie (denominator in main bar) & Goal Requirement
  const [neededCalories, setNeededCalories] = useState<string>('1600');
  const [goalType, setGoalType] = useState<'loss' | 'gain' | 'maintenance'>('loss');

  // USER MANDATE: Optional human body metrics & minerals
  const [muscleMassKg, setMuscleMassKg] = useState<string>('');
  const [targetMuscleMassKg, setTargetMuscleMassKg] = useState<string>('');
  const [boneMassKg, setBoneMassKg] = useState<string>(''); // Calcium & Bone Mineral Content (kg)
  const [bodyWaterPercentage, setBodyWaterPercentage] = useState<string>(''); // Total Body Water %
  const [dailyWaterTargetLiters, setDailyWaterTargetLiters] = useState<string>('3.0'); // Daily water intake needed
  const [proteinTargetGrams, setProteinTargetGrams] = useState<string>(''); // Daily protein need in grams
  const [showOptionalBodyNeeds, setShowOptionalBodyNeeds] = useState<boolean>(true);

  // Compute BMI dynamically from weight and height
  const computedBmi = heightCm > 0 ? Number((startingWeightKg / Math.pow(heightCm / 100, 2)).toFixed(1)) : 22.0;
  const activeBmi = customBmi !== '' ? parseFloat(customBmi) : computedBmi;

  // Auto-calculate BMR using Mifflin-St Jeor equation
  const calculateAutoBmr = () => {
    let base = 10 * startingWeightKg + 6.25 * heightCm - 5 * age;
    if (gender === 'Male') {
      base += 5;
    } else {
      base -= 161;
    }
    const val = Math.round(base);
    setBmr(val);
  };

  // Activity multipliers for daily required calories (Target BMR)
  const activityMultipliers: Record<string, number> = {
    'Sedentary Desk Job': 1.2,
    'Light Activity / Standing Work': 1.375,
    'Moderate Physical Work': 1.55,
    'Heavy Physical Labor / Athlete': 1.725
  };
  const currentMultiplier = activityMultipliers[bmrActivity] || 1.2;
  const targetRequiredCalories = Math.round(bmr * currentMultiplier);

  if (!isOpen) return null;

  const handleGenderChange = (newGender: 'Female' | 'Male' | 'Other') => {
    setGender(newGender);
    if (newGender === 'Male') {
      setBodyFatPercentage(24);
      setTargetBodyFatPercentage(18);
    } else {
      setBodyFatPercentage(32);
      setTargetBodyFatPercentage(24);
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!username || username === name.toLowerCase().replace(/[^a-z0-9]/g, '')) {
      const generated = val.toLowerCase().replace(/[^a-z0-9]/g, '');
      setUsername(generated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !goal.trim()) return;

    const finalUsername = username.trim() || name.toLowerCase().replace(/[^a-z0-9]/g, '') || `user${Date.now().toString().slice(-4)}`;
    const finalPassword = password.trim() || 'password123';

    // Status helpers
    const fatStatus = gender === 'Male'
      ? (bodyFatPercentage > 30 ? 'High (>30%)' : bodyFatPercentage < 10 ? 'Low (<10%)' : 'Normal (10-30%)')
      : (bodyFatPercentage > 30 ? 'High (>30%)' : bodyFatPercentage < 20 ? 'Low (<20%)' : 'Normal (20-30%)');

    const vFatStatus = visceralFat > 14 
      ? 'High Risk (15+)' 
      : visceralFat >= 10 
      ? 'Elevated (10-14)' 
      : 'Optimal (5-9)';

    const bmiStat = activeBmi > 27 
      ? 'High Risk (>27)' 
      : activeBmi > 23 
      ? 'Overweight (>23)' 
      : activeBmi < 15 
      ? 'Underweight (<15)' 
      : 'Normal (15-23)';

    addClient({
      name: name.trim(),
      username: finalUsername,
      password: finalPassword,
      phone: phone.trim(),
      email: email.trim() || undefined,
      gender,
      age: Number(age) || 30,
      heightCm: Number(heightCm) || 165,
      startingWeightKg: Number(startingWeightKg) || 70,
      currentWeightKg: Number(startingWeightKg) || 70,
      targetWeightKg: Number(targetWeightKg) || 64,

      // Body Composition & Health Metrics
      bodyFatPercentage: Number(bodyFatPercentage),
      targetBodyFatPercentage: Number(targetBodyFatPercentage),
      bodyFatStatus: fatStatus,

      visceralFat: Number(visceralFat),
      targetVisceralFat: Number(targetVisceralFat),
      visceralFatStatus: vFatStatus,

      bmi: Number(activeBmi),
      targetBmi: Number(targetBmi),
      bmiStatus: bmiStat,

      bmr: Number(bmr),
      targetBmr: targetRequiredCalories,
      bmrStatus: `${bmrActivity} (Req: ${targetRequiredCalories} kcal)`,

      // USER MANDATE: Custom-typed needed calories (denominator in main bar) & Goal Requirement
      neededCalories: parseFloat(neededCalories) || targetRequiredCalories || 1600,
      goalType,

      // USER MANDATE: Optional human body metrics & minerals (all optional)
      muscleMassKg: muscleMassKg ? parseFloat(muscleMassKg) : undefined,
      targetMuscleMassKg: targetMuscleMassKg ? parseFloat(targetMuscleMassKg) : undefined,
      boneMassKg: boneMassKg ? parseFloat(boneMassKg) : undefined,
      bodyWaterPercentage: bodyWaterPercentage ? parseFloat(bodyWaterPercentage) : undefined,
      dailyWaterTargetLiters: dailyWaterTargetLiters ? parseFloat(dailyWaterTargetLiters) : undefined,
      proteinTargetGrams: proteinTargetGrams ? parseFloat(proteinTargetGrams) : undefined,

      goal: goal.trim(),
      assignedDietitianId,
      dietPlanId,
      medicalNotes: medicalNotes.trim() || undefined,
      avatarUrl: `https://images.unsplash.com/photo-${gender === 'Female' ? '1544005313-94ddf0286df2' : '1507003211169-0a1dd7228f2d'}?auto=format&fit=crop&q=80&w=150`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Add New Client</h2>
              <p className="text-xs text-slate-500">Register and assign client to a dietitian</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-3.5 text-xs flex-1">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Rachel Adams"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 555-0199"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          {/* Portal Credentials Section */}
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
            <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>🔑 Client Portal Login Credentials</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Portal Username *
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  placeholder="e.g. rachel"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Portal Password *
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. password123"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => handleGenderChange(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900"
              />
            </div>
          </div>

          {/* 1. WEIGHT & NEEDED WEIGHT */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                ⚖️ Weight &amp; Needed Weight (Target)
              </span>
              <span className="text-[10px] text-slate-500">kg</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Current / Starting Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={startingWeightKg}
                  onChange={(e) => setStartingWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-emerald-700 mb-1 text-[11px]">
                  Needed / Target Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 font-bold text-emerald-700"
                  required
                />
              </div>
            </div>
          </div>

          {/* 2. BODY FAT % (MEN 10-30%, WOMEN 20-30%) */}
          <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 text-[11px] uppercase tracking-wider">
                💧 Body Fat % (Fat Needed Range)
              </span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                {gender === 'Male' ? 'Men: 10 – 30%' : 'Women: 20 – 30%'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Current Body Fat (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={bodyFatPercentage}
                  onChange={(e) => setBodyFatPercentage(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-emerald-700 mb-1 text-[11px]">
                  Needed / Target Fat (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={targetBodyFatPercentage}
                  onChange={(e) => setTargetBodyFatPercentage(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 font-bold text-emerald-700"
                />
              </div>
            </div>

            <p className="text-[10px] text-amber-800 bg-amber-100/70 p-2 rounded-lg leading-relaxed">
              💡 <strong>Clinical Norm:</strong> Man is <strong>10–30%</strong>, Woman is <strong>20–30%</strong>. Usually people's fat is higher than this range; target is set to bring them back within healthy bounds.
            </p>
          </div>

          {/* 3. VISCERAL FAT (V-FAT: NEEDED 5-9) */}
          <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-900 text-[11px] uppercase tracking-wider">
                🫀 Visceral Fat (V-Fat: Needed is 5–9)
              </span>
              <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md">
                Healthy Needed: 5 – 9
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Current V-Fat Level
                </label>
                <input
                  type="number"
                  step="1"
                  value={visceralFat}
                  onChange={(e) => setVisceralFat(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-rose-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-emerald-700 mb-1 text-[11px]">
                  Needed V-Fat (Target: 5-9)
                </label>
                <input
                  type="number"
                  step="1"
                  value={targetVisceralFat}
                  onChange={(e) => setTargetVisceralFat(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 font-bold text-emerald-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] bg-white p-2 rounded-lg border border-rose-100">
              <span className="text-slate-600">Current Assessment:</span>
              <span className={`font-bold px-2 py-0.5 rounded-full ${
                visceralFat > 14 
                  ? 'bg-rose-100 text-rose-800' 
                  : visceralFat >= 10 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {visceralFat > 14 ? '🚨 High Risk (15+)' : visceralFat >= 10 ? '⚠️ Elevated (10-14)' : '✓ Optimal (5-9)'}
              </span>
            </div>
          </div>

          {/* 4. BMI (BODY MASS INDEX: NEEDED 15-23) */}
          <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900 text-[11px] uppercase tracking-wider">
                📐 BMI (Needed Range is 15–23)
              </span>
              <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">
                Standard: 15 – 23
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 text-[11px]">
                    Current BMI (kg/m²)
                  </label>
                  <span className="text-[10px] text-blue-600 font-bold">Auto: {computedBmi}</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={customBmi !== '' ? customBmi : computedBmi}
                  onChange={(e) => setCustomBmi(e.target.value)}
                  className="w-full bg-white border border-blue-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-emerald-700 mb-1 text-[11px]">
                  Needed BMI (Target: 15-23)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={targetBmi}
                  onChange={(e) => setTargetBmi(parseFloat(e.target.value) || 21.5)}
                  className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 font-bold text-emerald-700"
                />
              </div>
            </div>

            <p className="text-[10px] text-blue-800 bg-blue-100/70 p-2 rounded-lg">
              ℹ️ Usually people's BMI will be higher than 23. Current status: <strong className="text-slate-900 font-black">
                {activeBmi > 27 ? 'High Risk (>27)' : activeBmi > 23 ? 'Overweight (>23)' : activeBmi < 15 ? 'Underweight (<15)' : 'Optimal (15-23)'}
              </strong>
            </p>
          </div>

          {/* 5. BMR (BASAL METABOLIC RATE & WORK/ACTIVITY STATUS) */}
          <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-900 text-[11px] uppercase tracking-wider">
                🔥 BMR &amp; Daily Required Calories (Work Status)
              </span>
              <button
                type="button"
                onClick={calculateAutoBmr}
                className="text-[10px] font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              >
                ⚡ Auto-Compute BMR
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Baseline BMR (kcal/day)
                </label>
                <input
                  type="number"
                  step="10"
                  value={bmr}
                  onChange={(e) => setBmr(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-purple-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-purple-800 mb-1 text-[11px]">
                  Required Calories / Status
                </label>
                <div className="w-full bg-purple-100/70 border border-purple-300 rounded-lg px-2.5 py-1.5 font-black text-purple-950 text-sm">
                  {targetRequiredCalories} <span className="text-[10px] font-normal text-purple-700">kcal/day</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                Work &amp; Physical Activity Level:
              </label>
              <select
                value={bmrActivity}
                onChange={(e) => setBmrActivity(e.target.value)}
                className="w-full bg-white border border-purple-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900"
              >
                <option value="Sedentary Desk Job">Sedentary Desk Job (Little to no exercise: 1.2x)</option>
                <option value="Light Activity / Standing Work">Light Activity / Standing Work (1-3 days active: 1.375x)</option>
                <option value="Moderate Physical Work">Moderate Physical Work / Active Job (3-5 days: 1.55x)</option>
                <option value="Heavy Physical Labor / Athlete">Heavy Physical Labor / Hard Training (6-7 days: 1.725x)</option>
              </select>
            </div>
          </div>

          {/* USER MANDATE 1: NEEDED CALORIES (DENOMINATOR IN MAIN BAR) & GOAL REQUIREMENT */}
          <div className="bg-amber-50/70 p-3.5 rounded-xl border-2 border-amber-300 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-amber-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                🎯 Needed Daily Calories &amp; Main Bar Denominator
              </span>
              <button
                type="button"
                onClick={() => setNeededCalories(String(targetRequiredCalories))}
                className="text-[10px] font-bold text-amber-800 bg-amber-200/80 hover:bg-amber-300 px-2 py-0.5 rounded transition-colors cursor-pointer"
              >
                ⚡ Use BMR ({targetRequiredCalories} kcal)
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-800 text-xs">
                  Needed Calories / Target Denominator (kcal/day) *
                </label>
                <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                  Main Bar Denominator: {neededCalories || targetRequiredCalories} kcal
                </span>
              </div>
              <input
                type="number"
                step="10"
                min="500"
                max="6000"
                value={neededCalories}
                onChange={(e) => setNeededCalories(e.target.value)}
                placeholder="e.g. 1500 or 2200"
                className="w-full bg-white border-2 border-amber-400 rounded-xl px-3 py-2 text-base font-black text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                required
              />
              <p className="text-[11px] text-amber-900 mt-1 leading-snug">
                📌 <em>As you type this amount, it will directly become this client's unique calorie denominator in their main bar!</em>
              </p>
            </div>

            {/* Goal Requirement Selection */}
            <div>
              <label className="block font-bold text-slate-800 text-xs mb-1.5">
                Client Calorie Color Rule / Requirement:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label
                  onClick={() => setGoalType('loss')}
                  className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    goalType === 'loss'
                      ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="goalType"
                      checked={goalType === 'loss'}
                      onChange={() => setGoalType('loss')}
                      className="text-emerald-600"
                    />
                    <span className="font-black text-xs text-emerald-950">Weight Loss / Fat Loss</span>
                  </div>
                  <p className="text-[10px] text-emerald-800 mt-1 pl-5">
                    🟢 Green if calories <strong>&lt; {neededCalories || targetRequiredCalories}</strong><br />
                    🔴 Red if exceeds denominator
                  </p>
                </label>

                <label
                  onClick={() => setGoalType('gain')}
                  className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    goalType === 'gain'
                      ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="goalType"
                      checked={goalType === 'gain'}
                      onChange={() => setGoalType('gain')}
                      className="text-emerald-600"
                    />
                    <span className="font-black text-xs text-emerald-950">Weight Gain / Surplus</span>
                  </div>
                  <p className="text-[10px] text-emerald-800 mt-1 pl-5">
                    🟢 Green if calories <strong>&gt; {neededCalories || targetRequiredCalories}</strong><br />
                    🔴 Red if below denominator
                  </p>
                </label>
              </div>
            </div>
          </div>

          {/* USER MANDATE 2: OPTIONAL HUMAN BODY NEEDS & MINERALS */}
          <div className="bg-teal-50/60 p-3.5 rounded-xl border border-teal-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                🧪 Optional Human Body Needs &amp; Minerals (Optional)
              </span>
              <button
                type="button"
                onClick={() => setShowOptionalBodyNeeds(!showOptionalBodyNeeds)}
                className="text-[10px] font-bold text-teal-700 hover:text-teal-900 bg-teal-100/70 px-2 py-0.5 rounded cursor-pointer"
              >
                {showOptionalBodyNeeds ? '− Hide Details' : '+ Show (Optional)'}
              </button>
            </div>

            {showOptionalBodyNeeds && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  {/* Muscle Mass */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                      Muscle Mass (kg) <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={muscleMassKg}
                      onChange={(e) => setMuscleMassKg(e.target.value)}
                      placeholder="e.g. 26.5"
                      className="w-full bg-white border border-teal-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-teal-800 mb-1 text-[11px]">
                      Target Muscle Mass (kg) <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={targetMuscleMassKg}
                      onChange={(e) => setTargetMuscleMassKg(e.target.value)}
                      placeholder="e.g. 29.0"
                      className="w-full bg-white border border-teal-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-teal-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Calcium / Bone Mass */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                      Calcium / Bone Mass (kg) <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={boneMassKg}
                      onChange={(e) => setBoneMassKg(e.target.value)}
                      placeholder="e.g. 2.4 (Norm: 2.0-3.5)"
                      className="w-full bg-white border border-teal-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                    />
                  </div>

                  {/* Body Water % */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                      Total Body Water (%) <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={bodyWaterPercentage}
                      onChange={(e) => setBodyWaterPercentage(e.target.value)}
                      placeholder="e.g. 55% (Norm: 50-65%)"
                      className="w-full bg-white border border-teal-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Daily Water Intake Needed */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                      Daily Water Target (L) <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={dailyWaterTargetLiters}
                      onChange={(e) => setDailyWaterTargetLiters(e.target.value)}
                      placeholder="e.g. 3.0"
                      className="w-full bg-white border border-teal-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-blue-700"
                    />
                  </div>

                  {/* Daily Protein Target */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                      Daily Protein Need (g) <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={proteinTargetGrams}
                      onChange={(e) => setProteinTargetGrams(e.target.value)}
                      placeholder="e.g. 90"
                      className="w-full bg-white border border-teal-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-purple-700"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-600 mb-1">
              Primary Goal *
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => {
                setGoal(e.target.value);
                const text = e.target.value.toLowerCase();
                if (/gain|bulk|surplus|muscle|build/.test(text)) {
                  setGoalType('gain');
                } else if (/loss|reduce|cut|lean|deficit/.test(text)) {
                  setGoalType('loss');
                }
              }}
              placeholder="e.g. Weight Loss & Insulin Resistance (-5kg target)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Assign Dietitian *
              </label>
              <select
                value={assignedDietitianId}
                onChange={(e) => setAssignedDietitianId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900"
              >
                {dietitians.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Initial Diet Plan
              </label>
              <select
                value={dietPlanId}
                onChange={(e) => setDietPlanId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900"
              >
                {dietPlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-600 mb-1">
              Medical / Dietary Notes
            </label>
            <input
              type="text"
              value={medicalNotes}
              onChange={(e) => setMedicalNotes(e.target.value)}
              placeholder="e.g. Vegetarian, lactose sensitive, mild hypertension"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Register Client</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
