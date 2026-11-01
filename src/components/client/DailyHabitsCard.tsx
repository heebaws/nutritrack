import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Footprints, 
  Moon, 
  Pill, 
  Salad, 
  Activity, 
  CheckCircle2, 
  Circle,
  Plus,
  Flame,
  Award
} from 'lucide-react';

export const DailyHabitsCard: React.FC = () => {
  const { activeClient, selectedDate, habits, updateDailyHabits } = useApp();

  const currentHabits = useMemo(() => {
    if (!activeClient) return null;
    const found = habits.find(h => h.clientId === activeClient.id && h.date === selectedDate);
    if (found) return found;
    return {
      id: `hab-temp`,
      clientId: activeClient.id,
      date: selectedDate,
      steps: 0,
      targetSteps: 8000,
      sleepHours: 7.0,
      supplementsTaken: false,
      saladEaten: false,
      stretchingDone: false,
    };
  }, [habits, activeClient?.id, selectedDate]);

  if (!currentHabits) return null;

  // Calculate score
  const stepsDone = currentHabits.steps >= currentHabits.targetSteps;
  const sleepDone = currentHabits.sleepHours >= 7.0;
  const items = [
    stepsDone,
    sleepDone,
    currentHabits.supplementsTaken,
    currentHabits.saladEaten,
    currentHabits.stretchingDone
  ];
  const completedCount = items.filter(Boolean).length;
  const complianceScore = Math.round((completedCount / items.length) * 100);

  const handleAddSteps = (count: number) => {
    const nextSteps = (currentHabits.steps || 0) + count;
    updateDailyHabits(selectedDate, { steps: nextSteps });
  };

  const handleToggleHabit = (field: 'supplementsTaken' | 'saladEaten' | 'stretchingDone') => {
    updateDailyHabits(selectedDate, { [field]: !currentHabits[field] });
  };

  const handleSleepChange = (hours: number) => {
    updateDailyHabits(selectedDate, { sleepHours: hours });
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold shadow-xs">
            <Award className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Daily Clinical Habits &amp; Recovery
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Daily lifestyle factors essential for hormone balance, metabolic rate, and fat oxidation
            </p>
          </div>
        </div>

        {/* Adherence Score Badge */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
              Habits Score
            </span>
            <span className={`text-sm font-black ${complianceScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {completedCount} / {items.length} ({complianceScore}%)
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center font-black text-xs text-slate-700">
            {complianceScore >= 80 ? '🌟' : '🎯'}
          </div>
        </div>
      </div>

      {/* Habits Grid */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* 1. Daily Step Goal */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                <Footprints className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                Daily Steps Target
              </span>
            </div>
            {stepsDone && (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Achieved
              </span>
            )}
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {currentHabits.steps.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-400 ml-1">
                / {currentHabits.targetSteps.toLocaleString()} steps
              </span>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {Math.min(100, Math.round((currentHabits.steps / currentHabits.targetSteps) * 100))}%
            </span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-3">
            <div 
              className="bg-orange-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (currentHabits.steps / currentHabits.targetSteps) * 100)}%` }}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleAddSteps(1000)}
              className="flex-1 bg-white hover:bg-orange-50 border border-slate-200 text-slate-700 text-xs font-bold py-1 px-2 rounded-lg transition-colors cursor-pointer text-center"
            >
              +1,000
            </button>
            <button
              type="button"
              onClick={() => handleAddSteps(2500)}
              className="flex-1 bg-white hover:bg-orange-50 border border-slate-200 text-slate-700 text-xs font-bold py-1 px-2 rounded-lg transition-colors cursor-pointer text-center"
            >
              +2,500
            </button>
            <button
              type="button"
              onClick={() => {
                const val = prompt('Enter exact step count for today:', currentHabits.steps.toString());
                if (val && !isNaN(parseInt(val, 10))) {
                  updateDailyHabits(selectedDate, { steps: parseInt(val, 10) });
                }
              }}
              className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold py-1 px-2.5 rounded-lg transition-colors cursor-pointer"
              title="Set exact steps"
            >
              Set
            </button>
          </div>
        </div>

        {/* 2. Sleep Recovery */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Moon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                Restful Sleep
              </span>
            </div>
            {sleepDone && (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                7h+ Optimal
              </span>
            )}
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {currentHabits.sleepHours}
              </span>
              <span className="text-xs font-bold text-slate-400 ml-1">
                hours
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Goal: 7 - 8.5 hrs
            </span>
          </div>

          <input
            type="range"
            min="4"
            max="11"
            step="0.5"
            value={currentHabits.sleepHours}
            onChange={(e) => handleSleepChange(parseFloat(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
            <span>4 hrs</span>
            <span>7 hrs</span>
            <span>8 hrs</span>
            <span>11 hrs</span>
          </div>
        </div>

        {/* 3. Daily Prescribed Supplements */}
        <div 
          onClick={() => handleToggleHabit('supplementsTaken')}
          className={`border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
            currentHabits.supplementsTaken
              ? 'bg-emerald-50/80 border-emerald-300'
              : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Pill className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                Prescribed Vitamins
              </span>
            </div>
            {currentHabits.supplementsTaken ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300" />
            )}
          </div>

          <p className="my-2 text-xs text-slate-600 font-medium">
            Daily multivitamin, Omega-3 fish oil, Vitamin D3, and probiotic as recommended by coach.
          </p>

          <span className={`text-[11px] font-bold ${currentHabits.supplementsTaken ? 'text-emerald-700' : 'text-slate-400'}`}>
            {currentHabits.supplementsTaken ? '✓ Taken Today' : 'Tap to mark as taken'}
          </span>
        </div>

        {/* 4. High-Fiber Salad & Greens */}
        <div 
          onClick={() => handleToggleHabit('saladEaten')}
          className={`border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
            currentHabits.saladEaten
              ? 'bg-emerald-50/80 border-emerald-300'
              : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-lime-100 text-lime-800 flex items-center justify-center">
                <Salad className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                Raw Greens &amp; Salad
              </span>
            </div>
            {currentHabits.saladEaten ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300" />
            )}
          </div>

          <p className="my-2 text-xs text-slate-600 font-medium">
            A bowl of cucumber, tomato, carrot, and fresh greens eaten before major meals for gut satiety.
          </p>

          <span className={`text-[11px] font-bold ${currentHabits.saladEaten ? 'text-emerald-700' : 'text-slate-400'}`}>
            {currentHabits.saladEaten ? '✓ Eaten Today' : 'Tap to mark as completed'}
          </span>
        </div>

        {/* 5. Post-Meal Mobility / Walk */}
        <div 
          onClick={() => handleToggleHabit('stretchingDone')}
          className={`border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
            currentHabits.stretchingDone
              ? 'bg-emerald-50/80 border-emerald-300'
              : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                10-Min Post-Meal Walk
              </span>
            </div>
            {currentHabits.stretchingDone ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300" />
            )}
          </div>

          <p className="my-2 text-xs text-slate-600 font-medium">
            Light 10-15 min stroll immediately after lunch or dinner to blunt postprandial glucose spike.
          </p>

          <span className={`text-[11px] font-bold ${currentHabits.stretchingDone ? 'text-emerald-700' : 'text-slate-400'}`}>
            {currentHabits.stretchingDone ? '✓ Completed' : 'Tap to mark as done'}
          </span>
        </div>

      </div>
    </div>
  );
};
