import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActivityLevel, DietPreference } from '../../types';
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
  Camera,
  RotateCw,
  Trash2,
  X,
  Check,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  AlertTriangle,
  ZoomIn,
  Upload,
} from 'lucide-react';

interface ProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOnboarding?: () => void;
}

const COMMON_ALLERGIES = ['Dairy', 'Nuts', 'Gluten', 'Eggs', 'Fish / Seafood', 'Soy'];

export const ProfileEditorModal: React.FC<ProfileEditorModalProps> = ({
  isOpen,
  onClose,
  onOpenOnboarding,
}) => {
  const { activeClient, updateClientSelf, language } = useApp();
  const isMl = language === 'ml';

  const [name, setName] = useState('');
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other'>('Male');
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [heightCm, setHeightCm] = useState(170);
  const [feet, setFeet] = useState(5);
  const [inches, setInches] = useState(7);
  const [currentWeightKg, setCurrentWeightKg] = useState(70);
  const [targetWeightKg, setTargetWeightKg] = useState(66);
  const [goalType, setGoalType] = useState<'loss' | 'gain' | 'maintenance'>('loss');
  const [weeklyRateKg, setWeeklyRateKg] = useState(0.5);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [dietPreference, setDietPreference] = useState<DietPreference>('balanced');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');

  // Photo Crop / Zoom / Rotate Studio State
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState(1.1);
  const [cropRotation, setCropRotation] = useState(0); // 0, 90, 180, 270
  const [cropOffsetX, setCropOffsetX] = useState(0); // -50..50
  const [cropOffsetY, setCropOffsetY] = useState(0); // -50..50
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen || !activeClient) return;
    setName(activeClient.name || '');
    setAge(activeClient.age || 30);
    setGender(activeClient.gender || 'Male');
    const sys = activeClient.preferredUnitSystem || 'metric';
    setUnitSystem(sys);
    const hCm = activeClient.heightCm || 170;
    setHeightCm(hCm);
    const fi = cmToFtIn(hCm);
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
    setActivityLevel(activeClient.activityLevel || 'moderate');
    setDietPreference(activeClient.dietPreference || 'balanced');
    setAllergies(activeClient.allergies || []);
    setMedicalNotes(activeClient.medicalNotes || '');
    setRawImageSrc(null);
    setCropZoom(1.1);
    setCropRotation(0);
    setCropOffsetX(0);
    setCropOffsetY(0);
    setPhotoError(null);
    setSavedNotice(null);
  }, [isOpen, activeClient]);

  // Render live cropped preview canvas whenever rawImageSrc/crop controls change
  useEffect(() => {
    if (!rawImageSrc || !previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const size = 280;
      canvas.width = size;
      canvas.height = size;
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, size, size);

      ctx.save();
      ctx.translate(size / 2 + cropOffsetX * 1.4, size / 2 + cropOffsetY * 1.4);
      ctx.rotate((cropRotation * Math.PI) / 180);
      const baseScale = Math.max(size / img.width, size / img.height);
      const finalScale = baseScale * cropZoom;
      const dw = img.width * finalScale;
      const dh = img.height * finalScale;
      ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();
    };
    img.src = rawImageSrc;
  }, [rawImageSrc, cropZoom, cropRotation, cropOffsetX, cropOffsetY]);

  const effectiveHeightCm = unitSystem === 'imperial' ? ftInToCm(feet, inches) : heightCm;

  const bmiAssessment = useMemo(
    () => assessBMI(currentWeightKg, effectiveHeightCm),
    [currentWeightKg, effectiveHeightCm]
  );

  const goalValidation = useMemo(
    () =>
      validateSafeGoalSettings({
        currentWeightKg,
        targetWeightKg,
        heightCm: effectiveHeightCm,
        age,
        gender,
        goalType,
        activityLevel,
        requestedWeeklyRateKg: weeklyRateKg,
      }),
    [currentWeightKg, targetWeightKg, effectiveHeightCm, age, gender, goalType, activityLevel, weeklyRateKg]
  );

  if (!isOpen || !activeClient) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please choose a valid image file (JPG, PNG, or WebP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setPhotoError('Image must be 8 MB or smaller before compression.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRawImageSrc(reader.result);
        setCropZoom(1.1);
        setCropRotation(0);
        setCropOffsetX(0);
        setCropOffsetY(0);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveCroppedPhoto = () => {
    if (!previewCanvasRef.current) return;
    // Compress strictly <= 180 KB JPEG Data URL so Firestore document limit stays safe
    let quality = 0.82;
    let dataUrl = previewCanvasRef.current.toDataURL('image/jpeg', quality);
    while (dataUrl.length > 175000 && quality > 0.35) {
      quality -= 0.1;
      dataUrl = previewCanvasRef.current.toDataURL('image/jpeg', quality);
    }
    updateClientSelf({ avatarUrl: dataUrl });
    setRawImageSrc(null);
    setSavedNotice(isMl ? 'ചിത്രം സേവ് ചെയ്തു — അവതാർ പുതുക്കുന്നു!' : 'Photo saved & avatar refreshed!');
    setTimeout(() => setSavedNotice(null), 3500);
  };

  const handleRemovePhoto = () => {
    updateClientSelf({ avatarUrl: '' });
    setRawImageSrc(null);
    setSavedNotice(isMl ? 'പ്രൊഫൈൽ ചിത്രം നീക്കം ചെയ്തു.' : 'Profile photo removed.');
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const toggleAllergy = (item: string) => {
    setAllergies((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleAddCustomAllergy = () => {
    const clean = customAllergy.trim();
    if (!clean) return;
    if (!allergies.includes(clean)) {
      setAllergies((prev) => [...prev, clean]);
    }
    setCustomAllergy('');
  };

  const handleSaveProfileDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const goalText =
      goalType === 'loss'
        ? 'Sustainable Weight Loss'
        : goalType === 'gain'
        ? 'Healthy Lean Weight Gain'
        : 'Balanced Maintenance';

    updateClientSelf({
      name: name.trim() || activeClient.name,
      age: Math.max(13, Math.min(100, Number(age) || 30)),
      gender,
      heightCm: effectiveHeightCm,
      currentWeightKg: Math.round(currentWeightKg * 10) / 10,
      targetWeightKg: goalValidation.safeTargetWeightKg,
      goalType,
      goal: goalText,
      weeklyRateKg: goalValidation.safeWeeklyRateKg,
      neededCalories: goalValidation.safeDailyCalories,
      bmi: bmiAssessment.bmi,
      bmiStatus: bmiAssessment.shortLabel,
      activityLevel,
      dietPreference,
      allergies,
      medicalNotes: medicalNotes.trim(),
      preferredUnitSystem: unitSystem,
    });

    setSavedNotice(
      goalValidation.wasAdjusted
        ? `Profile saved with clinical safety adjustment (${goalValidation.safeDailyCalories} kcal/day floor).`
        : isMl
        ? 'പ്രൊഫൈൽ വിവരങ്ങൾ തൽക്ഷണം സേവ് ചെയ്തു!'
        : 'Profile details saved and applied across NutriTrack!'
    );
    setTimeout(() => setSavedNotice(null), 4000);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-emerald-950 text-white px-5 py-4 flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-extrabold text-white truncate">
              {isMl ? 'പ്രൊഫൈലും ഫോട്ടോ സ്റ്റുഡിയോയും' : 'Profile & Picture Studio'}
            </h2>
            <p className="text-xs text-emerald-200 truncate">
              {isMl
                ? 'ചിത്രം, ലക്ഷ്യങ്ങൾ, ഭക്ഷണരീതികൾ എന്നിവ തൽക്ഷണം അപ്ഡേറ്റ് ചെയ്യാം'
                : 'Customize your portrait, body units, dietary rules, and wellness goals'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/85 hover:text-white px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold shrink-0"
          >
            <X className="w-4 h-4" />
            <span>{isMl ? 'അടയ്ക്കുക' : 'Close'}</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {savedNotice && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{savedNotice}</span>
            </div>
          )}

          {/* Section 1: Picture Upload, Crop, Rotate & Privacy Note */}
          <div className="rounded-2xl p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{isMl ? 'പ്രൊഫൈൽ ചിത്രം (Crop & Rotate)' : 'Profile Picture & Avatar Match'}</span>
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>On-device face processing</span>
              </span>
            </div>

            {rawImageSrc ? (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-5 flex flex-col items-center gap-2">
                  <canvas
                    ref={previewCanvasRef}
                    className="w-44 h-44 rounded-2xl border-2 border-emerald-500 shadow-sm bg-slate-900"
                  />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Compressed preview (max 280×280)
                  </span>
                </div>
                <div className="sm:col-span-7 space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-1">
                      <span className="flex items-center gap-1"><ZoomIn className="w-3.5 h-3.5" /> Zoom</span>
                      <span className="tabular-nums">{cropZoom.toFixed(2)}×</span>
                    </label>
                    <input
                      type="range"
                      min={0.8}
                      max={2.4}
                      step={0.05}
                      value={cropZoom}
                      onChange={(e) => setCropZoom(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Pan Left / Right
                      </label>
                      <input
                        type="range"
                        min={-60}
                        max={60}
                        step={2}
                        value={cropOffsetX}
                        onChange={(e) => setCropOffsetX(Number(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Pan Up / Down
                      </label>
                      <input
                        type="range"
                        min={-60}
                        max={60}
                        step={2}
                        value={cropOffsetY}
                        onChange={(e) => setCropOffsetY(Number(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setCropRotation((r) => (r + 90) % 360)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Rotate 90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveCroppedPhoto}
                      className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRawImageSrc(null)}
                      className="px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {activeClient.avatarUrl ? (
                  <img
                    src={activeClient.avatarUrl}
                    alt={activeClient.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500/60 shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center font-black text-2xl shrink-0">
                    {(activeClient.name || 'U').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{activeClient.avatarUrl ? 'Upload & Crop New Photo' : 'Upload Profile Photo'}</span>
                    </button>
                    {activeClient.avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Photo</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Privacy note: Your photo is processed on-device where possible solely to generate and personalize your avatar. You can replace or delete it anytime.
                  </p>
                </div>
              </div>
            )}

            {photoError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{photoError}</p>
            )}
          </div>

          {/* Section 2: Editable Personal, Body Metrics, Unit Switcher & Preferences */}
          <form onSubmit={handleSaveProfileDetails} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{isMl ? 'ശരീര അളവുകളും ലക്ഷ്യങ്ങളും' : 'Personal Metrics & Safety Calibration'}</span>
              </h3>

              {/* Metric / Imperial Segmented Toggle */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setUnitSystem('metric')}
                  className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                    unitSystem === 'metric'
                      ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
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
                  className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                    unitSystem === 'imperial'
                      ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  lbs / ft·in
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Age (yrs)</label>
                <input
                  type="number"
                  min={13}
                  max={100}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold tabular-nums"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'Female' | 'Male' | 'Other')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="Female">Female (Floor 1,200 kcal)</option>
                  <option value="Male">Male (Floor 1,500 kcal)</option>
                  <option value="Other">Other (Floor 1,350 kcal)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {unitSystem === 'metric' ? (
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Height (cm)</label>
                  <input
                    type="number"
                    min={100}
                    max={235}
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold tabular-nums"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Height (ft)</label>
                    <input
                      type="number"
                      min={3}
                      max={7}
                      value={feet}
                      onChange={(e) => setFeet(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold tabular-nums"
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
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold tabular-nums"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Current Weight ({unitSystem === 'imperial' ? 'lbs' : 'kg'})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={unitSystem === 'imperial' ? kgToLbs(currentWeightKg) : currentWeightKg}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCurrentWeightKg(unitSystem === 'imperial' ? lbsToKg(val) : val);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold tabular-nums"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Target Weight ({unitSystem === 'imperial' ? 'lbs' : 'kg'})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={unitSystem === 'imperial' ? kgToLbs(targetWeightKg) : targetWeightKg}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setTargetWeightKg(unitSystem === 'imperial' ? lbsToKg(val) : val);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Goal Direction</label>
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value as 'loss' | 'gain' | 'maintenance')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="loss">Lose Fat Safely</option>
                  <option value="maintenance">Maintain & Tone</option>
                  <option value="gain">Gain Lean Mass</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Activity Level</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="sedentary">Sedentary (Desk / Low steps)</option>
                  <option value="light">Lightly Active (1–2 workouts/wk)</option>
                  <option value="moderate">Moderately Active (3–4/wk)</option>
                  <option value="active">Active (5–6 workouts/wk)</option>
                  <option value="very_active">Athlete / Heavy Physical</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Diet Preference</label>
                <select
                  value={dietPreference}
                  onChange={(e) => setDietPreference(e.target.value as DietPreference)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="balanced">Balanced Omnivore</option>
                  <option value="kerala_traditional">Kerala Wholesome</option>
                  <option value="high_protein">High Protein</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="eggetarian">Eggetarian</option>
                  <option value="pescatarian">Pescatarian (Fish)</option>
                  <option value="vegan">Plant-Based Vegan</option>
                  <option value="low_carb">Lower Carb</option>
                </select>
              </div>
            </div>

            {goalType === 'loss' && (
              <div className="text-xs">
                <label className="font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between mb-1">
                  <span>Weekly Pace (safely capped at ≤ 1.0 kg/week)</span>
                  <b className="text-emerald-700 dark:text-emerald-400 tabular-nums">{weeklyRateKg.toFixed(2)} kg/week</b>
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

            {/* Allergies */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-600 dark:text-slate-300 block">
                Allergies & Food Exclusions (Diet Plan adapts immediately)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_ALLERGIES.map((al) => {
                  const active = allergies.includes(al);
                  return (
                    <button
                      key={al}
                      type="button"
                      onClick={() => toggleAllergy(al)}
                      className={`px-3 py-1 rounded-xl border font-semibold cursor-pointer transition-colors ${
                        active
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {al}
                    </button>
                  );
                })}
                {allergies
                  .filter((a) => !COMMON_ALLERGIES.includes(a))
                  .map((extra) => (
                    <button
                      key={extra}
                      type="button"
                      onClick={() => toggleAllergy(extra)}
                      className="px-3 py-1 rounded-xl border bg-rose-600 text-white border-rose-600 font-semibold cursor-pointer"
                    >
                      {extra} ×
                    </button>
                  ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customAllergy}
                  onChange={(e) => setCustomAllergy(e.target.value)}
                  placeholder="Add custom allergy (e.g., Shellfish, Sesame)..."
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddCustomAllergy}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Medical / Injury Notes */}
            <div className="text-xs">
              <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Joint / Injury / Medical Considerations (Optional)
              </label>
              <input
                type="text"
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                placeholder="e.g., Knee sensitivity, PCOS, Gestational check-ins, Back-friendly exercises..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Live Safety Check Preview */}
            <div className="rounded-2xl p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1.5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 tabular-nums">
                <span className="font-bold text-emerald-950 dark:text-emerald-200">
                  Live Safe Daily Budget: <b>{goalValidation.safeDailyCalories} kcal/day</b>
                </span>
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  BMI {bmiAssessment.bmi} · {bmiAssessment.shortLabel}
                </span>
              </div>
              {goalValidation.warnings.map((w, idx) => (
                <p key={idx} className="text-amber-800 dark:text-amber-300 flex items-start gap-1.5 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </p>
              ))}
              {bmiAssessment.bannerMessage && (
                <p className="text-amber-800 dark:text-amber-300 text-[11px]">{bmiAssessment.bannerMessage}</p>
              )}
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{CLINICAL_DISCLAIMER}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {onOpenOnboarding && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenOnboarding();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E06D53]" />
                  <span>Full Onboarding Calibration</span>
                </button>
              )}
              <button
                type="submit"
                className="ml-auto px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>{isMl ? 'മാറ്റങ്ങൾ സേവ് ചെയ്യുക' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
