import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { getTodayString } from '../../utils/dateUtils';

interface CentreDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedClientId?: string;
}

export const CentreDeviceModal: React.FC<CentreDeviceModalProps> = ({
  isOpen,
  onClose,
  preselectedClientId,
}) => {
  const { clients, activeTeamUser, addCentreDeviceReading } = useApp();

  const [clientId, setClientId] = useState<string>(preselectedClientId || (clients[0]?.id ?? ''));
  const [date, setDate] = useState<string>(() => getTodayString());
  const [deviceModel, setDeviceModel] = useState<string>('InBody 270 Body Composition Analyzer');
  const [weightKg, setWeightKg] = useState<string>('');
  const [heightCm, setHeightCm] = useState<string>('165');
  const [bmi, setBmi] = useState<string>('');
  const [bodyFatPercentage, setBodyFatPercentage] = useState<string>('');
  const [muscleMassKg, setMuscleMassKg] = useState<string>('');
  const [boneMassKg, setBoneMassKg] = useState<string>(''); // Calcium / Bone Mineral
  const [bodyWaterPercentage, setBodyWaterPercentage] = useState<string>(''); // Total Body Water %
  const [visceralFatLevel, setVisceralFatLevel] = useState<string>('');
  const [waistCm, setWaistCm] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);

  // Auto calculate BMI if weight and height exist
  const handleWeightChange = (val: string) => {
    setWeightKg(val);
    const w = parseFloat(val);
    const h = parseFloat(heightCm);
    if (!isNaN(w) && !isNaN(h) && h > 0) {
      setBmi((w / ((h / 100) ** 2)).toFixed(1));
    }
  };

  // Sync client height if client selected
  const handleClientSelect = (id: string) => {
    setClientId(id);
    const cl = clients.find(c => c.id === id);
    if (cl) {
      setHeightCm(String(cl.heightCm));
      if (weightKg) {
        const w = parseFloat(weightKg);
        setBmi((w / ((cl.heightCm / 100) ** 2)).toFixed(1));
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(weightKg);
    if (isNaN(weightNum) || weightNum <= 0 || !clientId) return;

    addCentreDeviceReading({
      clientId,
      date,
      enteredBy: `${activeTeamUser.name} (${deviceModel.split(' ')[0]})`,
      deviceModel,
      weightKg: weightNum,
      heightCm: heightCm ? parseFloat(heightCm) : undefined,
      bmi: bmi ? parseFloat(bmi) : undefined,
      bodyFatPercentage: bodyFatPercentage ? parseFloat(bodyFatPercentage) : undefined,
      muscleMassKg: muscleMassKg ? parseFloat(muscleMassKg) : undefined,
      visceralFatLevel: visceralFatLevel ? parseFloat(visceralFatLevel) : undefined,
      waistCm: waistCm ? parseFloat(waistCm) : undefined,
      boneMassKg: boneMassKg ? parseFloat(boneMassKg) : undefined,
      bodyWaterPercentage: bodyWaterPercentage ? parseFloat(bodyWaterPercentage) : undefined,
      notes: notes || 'Centre visit assessment completed.',
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">New Checking &amp; Calculations Entry</h2>
              <p className="text-xs text-slate-500">InBody, Tanita scanner, and clinical body calculations</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Client & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="centre-client-select" className="block font-semibold uppercase text-slate-600 mb-1">
                Client <span className="text-rose-500">*</span>
              </label>
              <select
                id="centre-client-select"
                value={clientId}
                onChange={(e) => handleClientSelect(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                required
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="centre-date-input" className="block font-semibold uppercase text-slate-600 mb-1">
                Assessment Date <span className="text-rose-500">*</span>
              </label>
              <input
                id="centre-date-input"
                type="date"
                max={getTodayString()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          {/* Centre Device Model */}
          <div>
            <label htmlFor="centre-device-select" className="block font-semibold uppercase text-slate-600 mb-1">
              Centre Scanner / Device
            </label>
            <select
              id="centre-device-select"
              value={deviceModel}
              onChange={(e) => setDeviceModel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="InBody 270 Body Composition Analyzer">InBody 270 Bio-Impedance Analyzer</option>
              <option value="Tanita MC-780 Multi Frequency Segmental">Tanita MC-780 Segmental Scanner</option>
              <option value="Bod Pod Air Displacement Plethysmograph">Bod Pod Body Density System</option>
              <option value="Seca Medical Scale & Stadiometer">Seca Medical Scale &amp; Stadiometer</option>
            </select>
          </div>

          {/* Main Metrics: Weight, Height, BMI */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label htmlFor="centre-weight-input" className="block font-semibold text-slate-700 mb-1">
                Weight (kg) *
              </label>
              <input
                id="centre-weight-input"
                type="number"
                step="0.1"
                min="20"
                max="300"
                value={weightKg}
                onChange={(e) => handleWeightChange(e.target.value)}
                placeholder="e.g. 70.2"
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label htmlFor="centre-height-input" className="block font-semibold text-slate-700 mb-1">
                Height (cm)
              </label>
              <input
                id="centre-height-input"
                type="number"
                step="0.5"
                min="100"
                max="250"
                value={heightCm}
                onChange={(e) => {
                  setHeightCm(e.target.value);
                  const w = parseFloat(weightKg);
                  const h = parseFloat(e.target.value);
                  if (!isNaN(w) && !isNaN(h) && h > 0) {
                    setBmi((w / ((h / 100) ** 2)).toFixed(1));
                  }
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label htmlFor="centre-bmi-input" className="block font-semibold text-slate-700 mb-1">
                BMI (auto)
              </label>
              <input
                id="centre-bmi-input"
                type="number"
                step="0.1"
                value={bmi}
                onChange={(e) => setBmi(e.target.value)}
                placeholder="25.8"
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-blue-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Body Composition Details from Device */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label htmlFor="centre-fat-input" className="block font-semibold text-slate-600 mb-1">
                Body Fat %
              </label>
              <input
                id="centre-fat-input"
                type="number"
                step="0.1"
                value={bodyFatPercentage}
                onChange={(e) => setBodyFatPercentage(e.target.value)}
                placeholder="e.g. 29.5"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label htmlFor="centre-muscle-input" className="block font-semibold text-slate-600 mb-1">
                Muscle Mass (kg)
              </label>
              <input
                id="centre-muscle-input"
                type="number"
                step="0.1"
                value={muscleMassKg}
                onChange={(e) => setMuscleMassKg(e.target.value)}
                placeholder="e.g. 24.4"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label htmlFor="centre-visceral-input" className="block font-semibold text-slate-600 mb-1">
                Visceral Fat Level
              </label>
              <input
                id="centre-visceral-input"
                type="number"
                step="1"
                min="1"
                max="30"
                value={visceralFatLevel}
                onChange={(e) => setVisceralFatLevel(e.target.value)}
                placeholder="e.g. 7"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label htmlFor="centre-waist-input" className="block font-semibold text-slate-600 mb-1">
                Waist (cm)
              </label>
              <input
                id="centre-waist-input"
                type="number"
                step="0.5"
                value={waistCm}
                onChange={(e) => setWaistCm(e.target.value)}
                placeholder="e.g. 82"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Optional Minerals & Human Body Needs */}
          <div className="grid grid-cols-2 gap-3 bg-teal-50/50 p-3 rounded-xl border border-teal-200/80">
            <div>
              <label htmlFor="centre-bone-input" className="block font-semibold text-slate-700 mb-1 text-[11px]">
                Calcium / Bone Mass (kg) <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                id="centre-bone-input"
                type="number"
                step="0.1"
                value={boneMassKg}
                onChange={(e) => setBoneMassKg(e.target.value)}
                placeholder="e.g. 2.4 kg"
                className="w-full bg-white border border-teal-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-xs"
              />
            </div>

            <div>
              <label htmlFor="centre-water-input" className="block font-semibold text-slate-700 mb-1 text-[11px]">
                Total Body Water (%) <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                id="centre-water-input"
                type="number"
                step="0.5"
                value={bodyWaterPercentage}
                onChange={(e) => setBodyWaterPercentage(e.target.value)}
                placeholder="e.g. 55% (50-65% norm)"
                className="w-full bg-white border border-teal-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-xs"
              />
            </div>
          </div>

          {/* Clinical Assessment Notes */}
          <div>
            <label htmlFor="centre-notes-input" className="block font-semibold text-slate-600 mb-1">
              Dietitian Assessment Notes
            </label>
            <textarea
              id="centre-notes-input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Visceral fat reduced by 1 level. Client reports high adherence to 1500 kcal plan."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Clinician verification badge */}
          <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 flex items-center gap-2 text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Recorded under <b>{activeTeamUser.name}</b>. This will appear on the client's phone with a <b>Centre Verified</b> badge.
            </span>
          </div>

          {/* Action buttons */}
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
              disabled={isSaved || !weightKg}
              className="px-5 py-2 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved to Client Record!</span>
                </>
              ) : (
                <span>Save Centre Reading</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
