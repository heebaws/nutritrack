import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ClientProfile, MealType } from '../../types';
import { 
  X, 
  User, 
  Phone, 
  Target, 
  Calendar, 
  Scale, 
  Building2, 
  Send, 
  Plus, 
  TrendingDown, 
  FileText,
  Utensils
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

interface ClientDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientProfile | null;
  onOpenCentreReading: (clientId: string) => void;
  onOpenSendTip: (clientId: string) => void;
}

export const ClientDossierModal: React.FC<ClientDossierModalProps> = ({
  isOpen,
  onClose,
  client,
  onOpenCentreReading,
  onOpenSendTip,
}) => {
  const { dietitians, dietPlans, mealLogs, measurements, assignDietitian, assignDietPlan } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'meals' | 'measurements' | 'plan'>('overview');

  const assignedDietitian = useMemo(() => {
    if (!client) return null;
    return dietitians.find(d => d.id === client.assignedDietitianId) || dietitians[0];
  }, [dietitians, client]);

  const assignedPlan = useMemo(() => {
    if (!client) return null;
    return dietPlans.find(p => p.id === client.dietPlanId) || dietPlans[0];
  }, [dietPlans, client]);

  const clientMeasurements = useMemo(() => {
    if (!client) return [];
    return measurements
      .filter(m => m.clientId === client.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [measurements, client]);

  const clientMealLogs = useMemo(() => {
    if (!client) return [];
    return mealLogs.filter(m => m.clientId === client.id);
  }, [mealLogs, client]);

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        
        {/* Header with Client Identity */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={client.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
              alt={client.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{client.name}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  client.status === 'active' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {client.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Phone: <span className="font-mono text-slate-700">{client.phone}</span> • Joined {client.joinedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenSendTip(client.id)}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-blue-600" />
              <span>Send Message / Tip</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenCentreReading(client.id)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>+ Centre Reading</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-white text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Client Profile &amp; Progress
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('meals')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'meals' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Meal Logs ({clientMealLogs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('measurements')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'measurements' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Measurements &amp; Device Scans ({clientMeasurements.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('plan')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'plan' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Diet Plan Assignment
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {/* TAB 1: OVERVIEW & PROGRESS */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              
              {/* Vitals Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-500">Starting Weight</span>
                  <div className="text-base font-black text-slate-900 mt-0.5">{client.startingWeightKg} kg</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-blue-600">Current Weight</span>
                  <div className="text-base font-black text-blue-700 mt-0.5">{client.currentWeightKg} kg</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-emerald-600">Needed Weight (Target)</span>
                  <div className="text-base font-black text-emerald-700 mt-0.5">{client.targetWeightKg} kg</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-500">Net Progress</span>
                  <div className="text-base font-black text-emerald-600 mt-0.5">
                    -{(client.startingWeightKg - client.currentWeightKg).toFixed(1)} kg
                  </div>
                </div>
              </div>

              {/* Comprehensive Body Composition & Clinical Norms Panel */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span>🧬 Clinical Body Composition &amp; Metabolic Profile</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Gender: {client.gender} | Age: {client.age}y | Height: {client.heightCm} cm
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* 1. Body Fat % */}
                  <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/70 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-amber-900 uppercase">💧 Body Fat %</span>
                      <span className="font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-sm">
                        {client.gender === 'Male' ? 'Norm: 10–20%' : 'Norm: 20–30%'}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-lg font-black text-slate-900">{client.bodyFatPercentage ?? '--'}%</span>
                      <span className="text-xs text-emerald-700 font-semibold">Needed: {client.targetBodyFatPercentage ?? '--'}%</span>
                    </div>
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-amber-200/50 flex items-center justify-between">
                      <span>Status:</span>
                      <span className="font-semibold text-amber-900">{client.bodyFatStatus || 'Monitored'}</span>
                    </div>
                  </div>

                  {/* 2. Visceral Fat */}
                  <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-200/70 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-rose-900 uppercase">🫀 Visceral Fat (V-Fat)</span>
                      <span className="font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded-sm">
                        Needed: 0.5 – 9
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-lg font-black text-slate-900">{client.visceralFat ?? '--'}</span>
                      <span className="text-xs text-emerald-700 font-semibold">Needed: {client.targetVisceralFat ?? 7}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-rose-200/50 flex items-center justify-between">
                      <span>Status:</span>
                      <span className={`font-bold px-1.5 py-0.2 rounded-full text-[9px] ${
                        (client.visceralFat ?? 0) > 14 ? 'bg-rose-100 text-rose-800' : (client.visceralFat ?? 0) >= 10 ? 'bg-amber-100 text-amber-800' : (client.visceralFat ?? 0) < 0.5 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {client.visceralFatStatus || ((client.visceralFat ?? 0) > 9 ? 'Elevated' : (client.visceralFat ?? 0) < 0.5 ? 'Low' : 'Optimal')}
                      </span>
                    </div>
                  </div>

                  {/* 3. BMI */}
                  <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-200/70 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-blue-900 uppercase">📐 Body Mass Index (BMI)</span>
                      <span className="font-bold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded-sm">
                        Needed: 18 – 23
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-lg font-black text-slate-900">{client.bmi ?? '--'}</span>
                      <span className="text-xs text-emerald-700 font-semibold">Needed: {client.targetBmi ?? 21.5}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-blue-200/50 flex items-center justify-between">
                      <span>Status:</span>
                      <span className="font-semibold text-blue-900">{client.bmiStatus || 'Monitored'}</span>
                    </div>
                  </div>

                  {/* 4. BMR & Work Calorie Status */}
                  <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-200/70 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-purple-900 uppercase">🔥 BMR &amp; Work Calorie</span>
                      <span className="font-bold text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded-sm">
                        Required
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-lg font-black text-slate-900">{client.bmr ?? '--'}</span>
                        <span className="text-[10px] text-slate-400 ml-1">kcal (Base)</span>
                      </div>
                      <span className="text-xs text-purple-800 font-bold">Req: {client.targetBmr ?? '--'} kcal</span>
                    </div>
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-purple-200/50 truncate">
                      <span className="font-medium text-purple-900">{client.bmrStatus || 'Standard activity'}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg leading-relaxed">
                  ℹ️ <strong>Clinical Target Note:</strong> In modern populations, typical fat percentage and BMI tend to exceed baseline targets. The clinical goal is calibrated against the healthy norms (Men Fat: 10–20%, Women Fat: 20–30%, Visceral Fat: 0.5–9, BMI: 18–23, BMR adjusted according to physical work/activity).
                </p>

                {/* Calorie Denominator & Goal Requirement Rule */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-tight flex items-center gap-1.5">
                      <span>🎯 Calorie Denominator &amp; Threshold Bar Logic</span>
                    </span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      (client.goalType === 'gain' || /gain|bulk|muscle/i.test(client.goal))
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}>
                      {(client.goalType === 'gain' || /gain|bulk|muscle/i.test(client.goal))
                        ? 'Requirement: Weight Gain (Surplus Target)'
                        : 'Requirement: Weight Loss (Deficit Target)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-200/80">
                      <span className="text-[10px] text-slate-500 block font-medium">Main Bar Denominator</span>
                      <div className="text-base font-black text-slate-900 mt-0.5">
                        {client.neededCalories || client.targetBmr || assignedPlan?.targetCalories || 1600} <span className="text-xs font-normal text-slate-500">kcal/day</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Custom denominator assigned at client intake</span>
                    </div>

                    <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-200/80">
                      <span className="text-[10px] text-slate-500 block font-medium">Active Color Rule</span>
                      {(client.goalType === 'gain' || /gain|bulk|muscle/i.test(client.goal)) ? (
                        <p className="text-[11px] text-slate-800 font-semibold mt-0.5">
                          <span className="text-emerald-700 font-bold">🟢 Green</span> when calories consumed &gt; denominator; <span className="text-rose-600 font-bold">🔴 Red</span> if under.
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-800 font-semibold mt-0.5">
                          <span className="text-emerald-700 font-bold">🟢 Green</span> when calories consumed &lt; denominator; <span className="text-rose-600 font-bold">🔴 Red</span> if over.
                        </p>
                      )}
                      <span className="text-[10px] text-slate-400">Controls live client dashboard coloring</span>
                    </div>
                  </div>
                </div>

                {/* Additional Human Body Needs & Minerals */}
                <div className="bg-teal-50/50 border border-teal-200 rounded-xl p-3.5 space-y-2">
                  <span className="text-[11px] font-bold text-teal-950 uppercase tracking-tight block">
                    🧬 Key Human Body Needs &amp; Minerals
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                    <div className="bg-white p-2 rounded-lg border border-teal-100">
                      <span className="text-[10px] text-slate-500 block">Muscle Mass</span>
                      <span className="font-bold text-slate-900">
                        {client.muscleMassKg ? `${client.muscleMassKg} kg` : '--'}
                      </span>
                      {client.targetMuscleMassKg && (
                        <span className="text-[10px] text-emerald-700 block">Target: {client.targetMuscleMassKg} kg</span>
                      )}
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-teal-100">
                      <span className="text-[10px] text-slate-500 block">Calcium / Bone</span>
                      <span className="font-bold text-slate-900">
                        {client.boneMassKg ? `${client.boneMassKg} kg` : '2.3 kg (Est.)'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">Mineral density</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-teal-100">
                      <span className="text-[10px] text-slate-500 block">Total Body Water</span>
                      <span className="font-bold text-slate-900">
                        {client.bodyWaterPercentage ? `${client.bodyWaterPercentage}%` : '52% (Norm)'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">Norm: 50–65%</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-teal-100">
                      <span className="text-[10px] text-slate-500 block">Water Target</span>
                      <span className="font-bold text-blue-700">
                        {client.dailyWaterTargetLiters ? `${client.dailyWaterTargetLiters} L/day` : '2.5 L/day'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">Hydration need</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Goal and Clinic Assignments */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Primary Goal
                  </span>
                  <p className="text-xs font-semibold text-slate-900">{client.goal}</p>
                  {client.medicalNotes && (
                    <p className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg">
                      Medical Notes: {client.medicalNotes}
                    </p>
                  )}
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      Assigned Dietitian
                    </span>
                    <select
                      value={client.assignedDietitianId}
                      onChange={(e) => assignDietitian(client.id, e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800"
                    >
                      {dietitians.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.role})
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Lead: <span className="font-semibold text-slate-900">{assignedDietitian?.name}</span> ({assignedDietitian?.specialization})
                  </p>
                </div>
              </div>

              {/* Progress Chart */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-800 text-xs">Clinical Weight Trend vs Goal</h3>
                  <span className="text-[11px] text-slate-500">Based on {clientMeasurements.length} records</span>
                </div>

                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={clientMeasurements} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                      <ReferenceLine y={client.targetWeightKg} stroke="#059669" strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="weightKg" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: '#2563eb' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MEAL LOGS */}
          {activeTab === 'meals' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-xs">Logged Meals by Client</h3>
                <span className="text-[11px] text-slate-500">Sorted by newest</span>
              </div>

              {clientMealLogs.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden">
                  {clientMealLogs.map((log) => (
                    <div key={log.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{log.foodName}</span>
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {log.mealType}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {log.date} at {log.timeLogged} • {log.quantity}x ({log.servingUnit})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-amber-700 block">{log.calories} kcal</span>
                        <span className="text-[10px] text-slate-500">
                          P: {log.protein}g | C: {log.carbs}g | F: {log.fat}g
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 p-8 text-center text-slate-400 rounded-xl">
                  No meals logged yet by this client.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MEASUREMENTS & DEVICE SCANS */}
          {activeTab === 'measurements' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-xs">Measurement History &amp; Centre Scans</h3>
                <button
                  type="button"
                  onClick={() => onOpenCentreReading(client.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] px-3 py-1 rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Enter New Device Reading</span>
                </button>
              </div>

              <div className="space-y-2">
                {clientMeasurements.slice().reverse().map((m) => (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-xl border ${
                      m.source === 'centre_device'
                        ? 'bg-blue-50/60 border-blue-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{m.weightKg} kg</span>
                          {m.source === 'centre_device' ? (
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              <span>{m.deviceModel || 'Centre Device'}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              Home Self-Log
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">
                          Recorded {m.date} by {m.enteredBy}
                        </span>
                      </div>

                      {m.bmi && (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">BMI</span>
                          <span className="font-bold text-blue-800">{m.bmi}</span>
                        </div>
                      )}
                    </div>

                    {/* Additional metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                      {m.bodyFatPercentage && <div>Body Fat: <b>{m.bodyFatPercentage}%</b></div>}
                      {m.muscleMassKg && <div>Muscle: <b>{m.muscleMassKg} kg</b></div>}
                      {m.visceralFatLevel && <div>Visceral Fat: <b>Lvl {m.visceralFatLevel}</b></div>}
                      {m.waistCm && <div>Waist: <b>{m.waistCm} cm</b></div>}
                      {m.boneMassKg && <div>Calcium: <b>{m.boneMassKg} kg</b></div>}
                      {m.bodyWaterPercentage && <div>Water: <b>{m.bodyWaterPercentage}%</b></div>}
                    </div>

                    {m.notes && (
                      <p className="text-[11px] text-slate-600 italic mt-1.5 bg-white/70 p-1.5 rounded-md">
                        "{m.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DIET PLAN ASSIGNMENT */}
          {activeTab === 'plan' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Current Assigned Plan</span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{assignedPlan.title}</h3>
                  </div>
                  <select
                    value={client.dietPlanId || ''}
                    onChange={(e) => assignDietPlan(client.id, e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-semibold text-blue-700 text-xs shadow-xs"
                  >
                    {dietPlans.map((p) => (
                      <option key={p.id} value={p.id}>
                        Switch to: {p.title}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-slate-600">{assignedPlan.description}</p>

                <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-200 text-center">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Calories</span>
                    <span className="font-black text-amber-700 text-xs">{assignedPlan.targetCalories}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Protein</span>
                    <span className="font-black text-emerald-700 text-xs">{assignedPlan.targetProtein}g</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Carbs</span>
                    <span className="font-black text-blue-700 text-xs">{assignedPlan.targetCarbs}g</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Water</span>
                    <span className="font-black text-cyan-700 text-xs">{assignedPlan.waterTargetLitres}L</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-xs">Plan Meal Breakdown</h4>
                {assignedPlan.meals.map((m) => (
                  <div key={m.mealType} className="bg-white p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{m.mealType}</span>
                      <span className="text-slate-500 font-medium text-[11px]">{m.timeGuideline}</span>
                    </div>
                    {m.instructions && (
                      <p className="text-[11px] text-emerald-800 italic mb-1.5">{m.instructions}</p>
                    )}
                    <div className="space-y-1">
                      {m.recommendedFoods.map((rf, idx) => (
                        <div key={idx} className="flex items-center justify-between text-slate-600 text-[11px]">
                          <span>• {rf.foodName}</span>
                          <span className="font-semibold">{rf.portion}x {rf.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
