import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Flame, 
  Dumbbell, 
  Footprints, 
  Activity, 
  Clock, 
  CheckCircle2,
  Trash2
} from 'lucide-react';

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_ACTIVITIES = [
  { name: 'Brisk Walking (Outdoor/Treadmill)', mlName: 'വേഗത്തിലുള്ള നടത്തം (പുറത്ത്/ട്രെഡ്‌മിൽ)', baseKcalPerMin: 4.5, icon: '🚶' },
  { name: 'Strength & Resistance Training', mlName: 'സ്ട്രെങ്ത് & വെയിറ്റ് ട്രെയിനിംഗ്', baseKcalPerMin: 5.5, icon: '🏋️' },
  { name: 'Jogging / Running', mlName: 'ജോഗിംഗ് / ഓട്ടം', baseKcalPerMin: 9.0, icon: '🏃' },
  { name: 'Cycling / Spin Bike', mlName: 'സൈക്ലിംഗ് / സ്പിൻ ബൈക്ക്', baseKcalPerMin: 7.0, icon: '🚴' },
  { name: 'Badminton / Court Sports', mlName: 'ബാഡ്മിന്റൺ / കോർട്ട് സ്പോർട്സ്', baseKcalPerMin: 6.5, icon: '🏸' },
  { name: 'Yoga & Functional Mobility', mlName: 'യോഗ & സ്ട്രെച്ചിംഗ്', baseKcalPerMin: 3.2, icon: '🧘' },
  { name: 'Swimming (Freestyle/Laps)', mlName: 'നീന്തൽ (സ്വിമ്മിംഗ്)', baseKcalPerMin: 8.0, icon: '🏊' },
  { name: 'Football / High Intensity Turf', mlName: 'ഫുട്ബോൾ / ടർഫ് ഗെയിംസ്', baseKcalPerMin: 8.5, icon: '⚽' },
];

export const ActivityLogModal: React.FC<ActivityLogModalProps> = ({ isOpen, onClose }) => {
  const { activeClient, selectedDate, activities, addActivity, deleteActivity, language, t } = useApp();
  const isMl = language === 'ml';

  const [activityName, setActivityName] = useState<string>(PRESET_ACTIVITIES[0].name);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [intensity, setIntensity] = useState<'light' | 'moderate' | 'vigorous'>('moderate');
  const [customCalories, setCustomCalories] = useState<string>('');

  if (!isOpen || !activeClient) return null;

  // Activities logged for today
  const dayActivities = activities.filter(
    a => a.clientId === activeClient.id && a.date === selectedDate
  );

  const totalCaloriesBurnedToday = dayActivities.reduce((acc, curr) => acc + curr.caloriesBurned, 0);

  // Compute estimated calories
  const currentPreset = PRESET_ACTIVITIES.find(p => p.name === activityName);
  const intensityMultiplier = intensity === 'light' ? 0.8 : intensity === 'moderate' ? 1.0 : 1.3;
  const calculatedKcal = Math.round(
    (currentPreset ? currentPreset.baseKcalPerMin : 5.0) * durationMinutes * intensityMultiplier
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCalories = customCalories ? parseInt(customCalories, 10) : calculatedKcal;
    
    addActivity({
      clientId: activeClient.id,
      date: selectedDate,
      activityName,
      durationMinutes,
      caloriesBurned: finalCalories,
      intensity,
    });

    setCustomCalories('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/75 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">{t('Log Physical Activity & Burn')}</h2>
              <p className="text-xs text-orange-100 font-medium tabular-nums">
                {selectedDate}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Preset Activity Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              {t('Select Activity Type')}
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
              {PRESET_ACTIVITIES.map((item) => (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => setActivityName(item.name)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer text-xs font-semibold ${
                    activityName === item.name
                      ? 'bg-orange-50 dark:bg-orange-950/60 border-orange-400 dark:border-orange-600 text-orange-900 dark:text-orange-200 font-bold shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="text-base shrink-0">{item.icon}</span>
                  <span className="truncate">{isMl ? item.mlName : item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Duration & Intensity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {t('Duration (Minutes)')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="300"
                  step="5"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-orange-500"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">
                  {isMl ? 'മിനിറ്റ്' : 'min'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {t('Workout Intensity')}
              </label>
              <select
                value={intensity}
                onChange={(e) => setIntensity(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-orange-500 cursor-pointer"
              >
                <option value="light">{isMl ? 'ലഘുവായ വേഗം (0.8x)' : 'Light Pace (0.8x)'}</option>
                <option value="moderate">{isMl ? 'മിതമായത് (1.0x)' : 'Moderate / Normal (1.0x)'}</option>
                <option value="vigorous">{isMl ? 'കഠിന വ്യായാമം (1.3x)' : 'Vigorous / High HR (1.3x)'}</option>
              </select>
            </div>
          </div>

          {/* Computed Calories Burned Card */}
          <div className="bg-orange-50 dark:bg-orange-950/50 rounded-2xl p-4 border border-orange-200/80 dark:border-orange-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-orange-800 dark:text-orange-300 tracking-wider">
                {t('Estimated Energy Burned')}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5 tabular-nums">
                <span className="text-2xl font-black text-orange-600 dark:text-orange-400">
                  {customCalories ? customCalories : calculatedKcal}
                </span>
                <span className="text-xs font-bold text-orange-800 dark:text-orange-300">kcal</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">
                {isMl ? 'സ്മാർട്ട് വാച്ച് അളവ് ചേർക്കാൻ:' : 'Override with fitness watch:'}
              </span>
              <input
                type="number"
                placeholder={isMl ? 'കലോറി (kcal)' : 'Custom kcal'}
                value={customCalories}
                onChange={(e) => setCustomCalories(e.target.value)}
                className="w-28 bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-700 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 mt-1"
              />
            </div>
          </div>

          {/* Today's Already Logged Activities */}
          {dayActivities.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {isMl
                    ? `ഇന്ന് ചെയ്ത വ്യായാമങ്ങൾ (${dayActivities.length})`
                    : `Logged Workouts for Today (${dayActivities.length})`}
                </span>
                <span className="text-xs font-black text-orange-600 dark:text-orange-400 tabular-nums">
                  {isMl ? `ആകെ കുറഞ്ഞത്: ${totalCaloriesBurnedToday} kcal` : `Total Burned: ${totalCaloriesBurnedToday} kcal`}
                </span>
              </div>
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {dayActivities.map((act) => {
                  const matchedPreset = PRESET_ACTIVITIES.find(p => p.name === act.activityName);
                  return (
                    <div
                      key={act.id}
                      className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                          {isMl && matchedPreset ? matchedPreset.mlName : act.activityName}
                        </span>
                        <span className="text-slate-400">
                          ({act.durationMinutes} {isMl ? 'മിനിറ്റ്' : 'min'})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-orange-700 dark:text-orange-400 tabular-nums">-{act.caloriesBurned} kcal</span>
                        <button
                          type="button"
                          onClick={() => deleteActivity(act.id)}
                          className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                          title={isMl ? 'വ്യായാമം നീക്കം ചെയ്യുക' : 'Remove workout'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t('Cancel')}
            </button>
            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('Record Workout')}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
