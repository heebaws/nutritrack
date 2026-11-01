import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Scale, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp, 
  Minus 
} from 'lucide-react';

interface QuickWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickWeightModal: React.FC<QuickWeightModalProps> = ({ isOpen, onClose }) => {
  const { activeClient, selectedDate, addMeasurement } = useApp();

  const [weightKg, setWeightKg] = useState<string>(activeClient?.currentWeightKg?.toString() || '70.0');
  const [waistCm, setWaistCm] = useState<string>('');
  const [notes, setNotes] = useState<string>('Morning fasting weigh-in on home scale');

  if (!isOpen || !activeClient) return null;

  const currentParsed = parseFloat(weightKg);
  const diffFromCurrent = !isNaN(currentParsed) ? +(currentParsed - activeClient.currentWeightKg).toFixed(1) : 0;
  const diffFromStart = !isNaN(currentParsed) ? +(currentParsed - activeClient.startingWeightKg).toFixed(1) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalWeight = parseFloat(weightKg);
    if (isNaN(finalWeight) || finalWeight <= 0) return;

    addMeasurement({
      clientId: activeClient.id,
      date: selectedDate,
      source: 'client_self',
      enteredBy: 'Client Morning Weigh-in',
      weightKg: finalWeight,
      waistCm: waistCm ? parseFloat(waistCm) : undefined,
      notes: notes || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Morning Weight Check-in</h2>
              <p className="text-xs text-emerald-100 font-medium">
                Fast weigh-in for {selectedDate}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Main Weight Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Weight Today (kg)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="30"
                max="250"
                autoFocus
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full bg-slate-50 border-2 border-emerald-500/30 focus:border-emerald-600 rounded-2xl px-4 py-3 text-2xl font-black text-slate-900 focus:outline-hidden"
                required
              />
              <span className="absolute right-4 top-3.5 text-sm font-bold text-slate-400">
                kg
              </span>
            </div>
          </div>

          {/* Quick Comparison Cards */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Vs Starting</span>
              <div className="flex items-center gap-1 mt-0.5 font-bold">
                {diffFromStart < 0 ? (
                  <span className="text-emerald-600 flex items-center gap-0.5">
                    <TrendingDown className="w-3.5 h-3.5" /> {diffFromStart} kg
                  </span>
                ) : diffFromStart > 0 ? (
                  <span className="text-rose-600 flex items-center gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" /> +{diffFromStart} kg
                  </span>
                ) : (
                  <span className="text-slate-500">Same (0 kg)</span>
                )}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">To Goal</span>
              <div className="font-bold text-slate-700 mt-0.5">
                {Math.abs(+(activeClient.targetWeightKg - (!isNaN(currentParsed) ? currentParsed : activeClient.currentWeightKg)).toFixed(1))} kg left
              </div>
            </div>
          </div>

          {/* Waist (Optional) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Waist Circumference (cm) - Optional
            </label>
            <input
              type="number"
              step="0.5"
              placeholder="e.g. 82.5"
              value={waistCm}
              onChange={(e) => setWaistCm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-emerald-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Notes (Scale model, conditions)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-emerald-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Weigh-in</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
