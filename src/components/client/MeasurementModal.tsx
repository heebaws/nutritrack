import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Scale, CheckCircle2 } from 'lucide-react';
import { getTodayString } from '../../utils/dateUtils';

interface MeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MeasurementModal: React.FC<MeasurementModalProps> = ({ isOpen, onClose }) => {
  const { activeClient, addMeasurement } = useApp();

  const [date, setDate] = useState<string>(() => getTodayString());
  const [weightKg, setWeightKg] = useState<string>(activeClient ? String(activeClient.currentWeightKg) : '');
  const [waistCm, setWaistCm] = useState<string>('');
  const [hipCm, setHipCm] = useState<string>('');
  const [bodyFatPercentage, setBodyFatPercentage] = useState<string>('');
  const [boneMassKg, setBoneMassKg] = useState<string>('');
  const [bodyWaterPercentage, setBodyWaterPercentage] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen && activeClient) {
      setWeightKg(String(activeClient.currentWeightKg));
      setDate(getTodayString());
      setWaistCm('');
      setHipCm('');
      setBodyFatPercentage('');
      setBoneMassKg('');
      setBodyWaterPercentage('');
      setNotes('');
      setIsSaved(false);
    }
  }, [isOpen, activeClient]);

  if (!isOpen || !activeClient) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(weightKg);
    if (isNaN(weightNum) || weightNum <= 0) return;

    addMeasurement({
      clientId: activeClient.id,
      date,
      source: 'client_self',
      enteredBy: `${activeClient.name} (Self-log)`,
      weightKg: weightNum,
      waistCm: waistCm ? parseFloat(waistCm) : undefined,
      hipCm: hipCm ? parseFloat(hipCm) : undefined,
      bodyFatPercentage: bodyFatPercentage ? parseFloat(bodyFatPercentage) : undefined,
      boneMassKg: boneMassKg ? parseFloat(boneMassKg) : undefined,
      bodyWaterPercentage: bodyWaterPercentage ? parseFloat(bodyWaterPercentage) : undefined,
      notes: notes || undefined,
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-slate-900/70 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Record Measurements</h2>
              <p className="text-xs text-slate-500">Hand-enter readings from your scale/tape</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Date
            </label>
            <input
              type="date"
              max={getTodayString()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              required
            />
          </div>

          {/* Weight */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase text-slate-600">
                Body Weight <span className="text-emerald-600 font-bold">*</span>
              </label>
              <span className="text-[11px] text-slate-500">Target: {activeClient.targetWeightKg} kg</span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="20"
                max="300"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="e.g. 69.5"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                kg
              </span>
            </div>
          </div>

          {/* Circumferences */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Waist
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="30"
                  max="200"
                  value={waistCm}
                  onChange={(e) => setWaistCm(e.target.value)}
                  placeholder="e.g. 81"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  cm
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Hips
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="30"
                  max="200"
                  value={hipCm}
                  onChange={(e) => setHipCm(e.target.value)}
                  placeholder="e.g. 98"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  cm
                </span>
              </div>
            </div>
          </div>

          {/* Body Fat % (optional) */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Body Fat % <span className="text-[11px] font-normal text-slate-400">(Optional smart scale reading)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="5"
                max="60"
                value={bodyFatPercentage}
                onChange={(e) => setBodyFatPercentage(e.target.value)}
                placeholder="e.g. 29.5"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                %
              </span>
            </div>
          </div>

          {/* Optional Calcium & Body Water */}
          <div className="grid grid-cols-2 gap-3 bg-teal-50/50 p-2.5 rounded-xl border border-teal-100">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Calcium / Bone (kg) <span className="text-slate-400 font-normal">(Opt)</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={boneMassKg}
                onChange={(e) => setBoneMassKg(e.target.value)}
                placeholder="e.g. 2.4"
                className="w-full bg-white border border-teal-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Body Water % <span className="text-slate-400 font-normal">(Opt)</span>
              </label>
              <input
                type="number"
                step="0.5"
                value={bodyWaterPercentage}
                onChange={(e) => setBodyWaterPercentage(e.target.value)}
                placeholder="e.g. 55"
                className="w-full bg-white border border-teal-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Taken right after waking up, feeling energetic"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaved}
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Reading</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
