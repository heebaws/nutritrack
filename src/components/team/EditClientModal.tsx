import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ClientProfile } from '../../types';
import { X, Check, Camera, Upload, ShieldCheck, User, Sparkles, Scale, HeartPulse, KeyRound } from 'lucide-react';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientProfile | null;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=250',
];

export const EditClientModal: React.FC<EditClientModalProps> = ({ isOpen, onClose, client }) => {
  const { updateClient, dietitians, dietPlans, activeTeamUser } = useApp();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [age, setAge] = useState<number>(30);
  const [heightCm, setHeightCm] = useState<number>(165);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const [startingWeightKg, setStartingWeightKg] = useState<number>(70);
  const [currentWeightKg, setCurrentWeightKg] = useState<number>(68);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(60);
  const [neededCalories, setNeededCalories] = useState<number>(1800);
  const [goal, setGoal] = useState('');
  const [goalType, setGoalType] = useState<'loss' | 'gain' | 'maintenance'>('loss');

  const [bodyFatPercentage, setBodyFatPercentage] = useState<number | undefined>(undefined);
  const [targetBodyFatPercentage, setTargetBodyFatPercentage] = useState<number | undefined>(undefined);
  const [visceralFat, setVisceralFat] = useState<number | undefined>(undefined);
  const [targetVisceralFat, setTargetVisceralFat] = useState<number | undefined>(undefined);
  const [bmi, setBmi] = useState<number | undefined>(undefined);
  const [targetBmi, setTargetBmi] = useState<number | undefined>(undefined);
  const [bmr, setBmr] = useState<number | undefined>(undefined);
  const [bmrStatus, setBmrStatus] = useState('');

  const [assignedDietitianId, setAssignedDietitianId] = useState('');
  const [dietPlanId, setDietPlanId] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [imageError, setImageError] = useState<string | null>(null);

  const isSuperAdmin = activeTeamUser?.role === 'super_admin' || activeTeamUser?.isSuperAdmin || activeTeamUser?.username === 'swabeeh';

  useEffect(() => {
    if (!client) return;
    setName(client.name || '');
    setUsername(client.username || client.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || '');
    setPassword(client.password || 'password123');
    setPhone(client.phone || '');
    setEmail(client.email || '');
    setAvatarUrl(client.avatarUrl || '');
    setGender(client.gender || 'Female');
    setAge(client.age || 30);
    setHeightCm(client.heightCm || 165);
    setStatus(client.status || 'active');

    setStartingWeightKg(client.startingWeightKg || 70);
    setCurrentWeightKg(client.currentWeightKg || 68);
    setTargetWeightKg(client.targetWeightKg || 60);
    setNeededCalories(client.neededCalories || 1800);
    setGoal(client.goal || '');
    setGoalType(client.goalType || 'loss');

    setBodyFatPercentage(client.bodyFatPercentage);
    setTargetBodyFatPercentage(client.targetBodyFatPercentage);
    setVisceralFat(client.visceralFat);
    setTargetVisceralFat(client.targetVisceralFat);
    setBmi(client.bmi);
    setTargetBmi(client.targetBmi);
    setBmr(client.bmr);
    setBmrStatus(client.bmrStatus || '');

    setAssignedDietitianId(client.assignedDietitianId || dietitians[0]?.id || '');
    setDietPlanId(client.dietPlanId || dietPlans[0]?.id || '');
    setMedicalNotes(client.medicalNotes || '');
    setImageError(null);
  }, [client, isOpen, dietitians, dietPlans]);

  if (!isOpen || !client) return null;

  // Handle local image file upload preview
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setImageError('Please choose an image under 3MB.');
        return;
      }
      setImageError(null);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Recalculate BMI if height and current weight provided
    const heightM = (heightCm || 165) / 100;
    const computedBmi = heightM > 0 ? parseFloat(((currentWeightKg || 68) / (heightM * heightM)).toFixed(1)) : bmi;

    const updatedProfile: ClientProfile = {
      ...client,
      name: name.trim(),
      username: username.trim() || client.username || name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      password: password.trim() || client.password || 'password123',
      phone: phone.trim() || client.phone,
      email: email.trim(),
      avatarUrl: avatarUrl.trim() || client.avatarUrl,
      gender,
      age: Number(age) || 30,
      heightCm: Number(heightCm) || 165,
      status,

      startingWeightKg: Number(startingWeightKg) || client.startingWeightKg,
      currentWeightKg: Number(currentWeightKg) || client.currentWeightKg,
      targetWeightKg: Number(targetWeightKg) || client.targetWeightKg,
      neededCalories: Number(neededCalories) || client.neededCalories || 1800,
      goal: goal.trim() || client.goal,
      goalType,

      bodyFatPercentage: bodyFatPercentage !== undefined ? Number(bodyFatPercentage) : client.bodyFatPercentage,
      targetBodyFatPercentage: targetBodyFatPercentage !== undefined ? Number(targetBodyFatPercentage) : client.targetBodyFatPercentage,
      visceralFat: visceralFat !== undefined ? Number(visceralFat) : client.visceralFat,
      targetVisceralFat: targetVisceralFat !== undefined ? Number(targetVisceralFat) : client.targetVisceralFat,
      bmi: computedBmi,
      targetBmi: targetBmi !== undefined ? Number(targetBmi) : client.targetBmi,
      bmr: bmr !== undefined ? Number(bmr) : client.bmr,
      bmrStatus: bmrStatus.trim() || client.bmrStatus,

      assignedDietitianId: assignedDietitianId || client.assignedDietitianId,
      dietPlanId: dietPlanId || client.dietPlanId,
      medicalNotes: medicalNotes.trim(),
    };

    updateClient(updatedProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-transparent dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Edit Client Profile &amp; Photo</h2>
                {isSuperAdmin && (
                  <span className="bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                    👑 Super Admin Swabeeh
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update client photo, login credentials, weight goals, and body composition data
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          
          {/* 1. Client Photo Section */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5 text-[11px]">
                <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Client Photo / Avatar</span>
              </label>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Upload custom file or pick preset</span>
            </div>

            {imageError && (
              <div className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {imageError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group shrink-0">
                <img
                  src={avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250'}
                  alt={name || 'Client Avatar'}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white dark:border-slate-700 shadow-md ring-2 ring-blue-200 dark:ring-blue-800"
                />
                <label className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity flex flex-col items-center justify-center cursor-pointer text-[10px] font-semibold gap-1">
                  <Upload className="w-4 h-4" />
                  <span>Change</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-2 flex-1 w-full">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Image URL or Upload from Computer
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... or paste image URL"
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                    <label className="bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-3 py-1.5 rounded-xl cursor-pointer shrink-0 flex items-center gap-1 text-[11px] transition-colors">
                      <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Preset Avatars */}
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">Quick Select Centre Avatars:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {PRESET_AVATARS.map((url, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setAvatarUrl(url)}
                        className={`w-7 h-7 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          avatarUrl === url ? 'border-blue-600 ring-2 ring-blue-300 dark:ring-blue-700 scale-105' : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`Preset ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Personal Information & Login Credentials */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Personal Information &amp; Portal Login</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Phone / Mobile Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 5550192 or +91 98470 12345"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-mono text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Portal Username *</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. sarah"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-mono text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Portal Password *</span>
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. password123"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-mono text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@email.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Account Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-semibold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="active">🟢 Active Client</option>
                  <option value="inactive">🔴 Inactive / On Break</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-semibold text-slate-900 dark:text-slate-100"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  min={10}
                  max={100}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-semibold text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  min={80}
                  max={250}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-semibold text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* 3. Weights & Primary Calorie Targets */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Weights, Goals &amp; Daily Calorie Target</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Starting Wt (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={startingWeightKg}
                  onChange={(e) => setStartingWeightKg(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Current Wt (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={currentWeightKg}
                  onChange={(e) => setCurrentWeightKg(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-blue-700 dark:text-blue-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Target / Needed Wt (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-emerald-700 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Needed Calories (kcal/d)</label>
                <input
                  type="number"
                  value={neededCalories}
                  onChange={(e) => setNeededCalories(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-purple-700 dark:text-purple-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Goal Type</label>
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-semibold text-slate-900 dark:text-slate-100"
                >
                  <option value="loss">📉 Weight / Fat Loss</option>
                  <option value="gain">📈 Healthy Weight / Muscle Gain</option>
                  <option value="maintenance">⚖️ Maintenance &amp; Athletic Performance</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Primary Clinical Goal</label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Weight Loss & PCOS Management (-10.5kg)"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* 4. Body Composition Metrics */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <HeartPulse className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Clinical Body Composition (InBody / Scan Values)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Current Fat %</label>
                <input
                  type="number"
                  step="0.1"
                  value={bodyFatPercentage ?? ''}
                  onChange={(e) => setBodyFatPercentage(e.target.value === '' ? undefined : Number(e.target.value))}
                  placeholder="e.g. 28.5"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Needed Fat %</label>
                <input
                  type="number"
                  step="0.1"
                  value={targetBodyFatPercentage ?? ''}
                  onChange={(e) => setTargetBodyFatPercentage(e.target.value === '' ? undefined : Number(e.target.value))}
                  placeholder="e.g. 22"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-emerald-700 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Visceral Fat (0.5–9)</label>
                <input
                  type="number"
                  step="0.1"
                  value={visceralFat ?? ''}
                  onChange={(e) => setVisceralFat(e.target.value === '' ? undefined : Number(e.target.value))}
                  placeholder="e.g. 8"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Baseline BMR (kcal)</label>
                <input
                  type="number"
                  value={bmr ?? ''}
                  onChange={(e) => setBmr(e.target.value === '' ? undefined : Number(e.target.value))}
                  placeholder="e.g. 1420"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Work / Activity Lifestyle Status</label>
              <input
                type="text"
                value={bmrStatus}
                onChange={(e) => setBmrStatus(e.target.value)}
                placeholder="e.g. Desk Worker, Regular Evening Walking"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* 5. Coach & Diet Plan Assignment */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Assigned Wellness Coach &amp; Clinical Diet Plan</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Assigned Coach</label>
                <select
                  value={assignedDietitianId}
                  onChange={(e) => setAssignedDietitianId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-semibold text-slate-900 dark:text-slate-100"
                >
                  {dietitians.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.role === 'super_admin' ? 'Super Admin' : d.role === 'admin' ? 'Main Admin' : 'Wellness Coach'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Active Diet Plan</label>
                <select
                  value={dietPlanId}
                  onChange={(e) => setDietPlanId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-semibold text-slate-900 dark:text-slate-100"
                >
                  {dietPlans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.targetCalories} kcal)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Clinical Notes</label>
              <textarea
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                placeholder="Add medical history, allergies, food preferences, or coach guidance..."
                rows={2}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Client Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
