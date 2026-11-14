import React from 'react';
import { useApp } from '../../context/AppContext';
import { NutriTrackLogo } from './NutriTrackLogo';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  Building2, 
  Award, 
  User, 
  Scale, 
  Calendar, 
  Flame, 
  Droplets,
  HeartPulse
} from 'lucide-react';
import { formatDateDisplay } from '../../utils/dateUtils';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  clientId
}) => {
  const { 
    clients, 
    activeClient, 
    dietitians, 
    dietPlans, 
    measurements, 
    mealLogs,
    selectedDate,
    language,
    t,
    tf
  } = useApp();

  const isMl = language === 'ml';

  if (!isOpen) return null;

  const targetClient = clientId 
    ? clients.find(c => c.id === clientId) || activeClient 
    : activeClient;

  if (!targetClient) return null;

  const assignedDietitian = dietitians.find(d => d.id === targetClient.assignedDietitianId) || dietitians[0];
  const assignedPlan = dietPlans.find(p => p.id === targetClient.dietPlanId) || dietPlans[0];

  const clientMeasurements = measurements
    .filter(m => m.clientId === targetClient.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 dark:bg-slate-950/85 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 my-auto flex flex-col max-h-[92vh]">
        
        {/* Modal Toolbar (hidden during actual browser print) */}
        <div className="print:hidden px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold">
              {isMl ? 'ക്ലിനിക്കൽ റിപ്പോർട്ടും ഡയറ്റ് പ്ലാൻ പ്രിന്റ് വ്യൂവും' : 'Clinical Report & Diet Plan Print View'}
            </span>
            <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md">
              {isMl ? 'ഔദ്യോഗിക മെഡിക്കൽ ഫോർമാറ്റ്' : 'Official Medical Format'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isMl ? 'പ്രിന്റ് / PDF ആയി സേവ് ചെയ്യുക' : 'Print / Save as PDF'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-white text-slate-800 print:p-0 print:overflow-visible">
          
          {/* Clinic Letterhead */}
          <div className="border-b-2 border-emerald-700 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <NutriTrackLogo size="lg" showText={false} />
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {isMl ? 'ന്യൂട്രിട്രാക്ക് വെൽനെസ് സെന്റർ' : 'NutriTrack Wellness Centre'}
                </h1>
                <p className="text-xs font-semibold text-emerald-800">
                  {isMl
                    ? 'മെറ്റബോളിക് ആരോഗ്യ, ജീവിതശൈലി മാറ്റ & ക്ലിനിക്കൽ ന്യൂട്രീഷൻ സെന്റർ'
                    : 'Center for Metabolic Health, Lifestyle Transformation & Clinical Nutrition'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Valanchery, Malappuram, Kerala • Phone: +91 98470 12345 • info@nutritrackwellness.com
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
                {isMl ? 'പ്രിസ്ക്രിപ്ഷൻ ഡോസിയർ' : 'Prescription Dossier'}
              </span>
              <span className="text-xs font-mono font-bold text-slate-700">
                REF: NT-{targetClient.id.toUpperCase()}-{selectedDate}
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isMl ? 'നൽകിയ തീയതി:' : 'Issued Date:'} {formatDateDisplay(selectedDate)}
              </p>
            </div>
          </div>

          {/* Client Demographic & Target Summary */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 mb-6">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-600" />
              <span>{isMl ? 'ക്ലയന്റ് വിവരങ്ങളും ക്ലിനിക്കൽ ലക്ഷ്യങ്ങളും' : 'Patient Profile & Clinical Goals'}</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">{isMl ? 'പേര്' : 'Patient Name'}</span>
                <span className="font-bold text-slate-900 text-sm">{targetClient.name}</span>
                <span className="text-slate-500 block text-[10px]">
                  {isMl ? `പ്രായം: ${targetClient.age} • ${targetClient.gender}` : `Age: ${targetClient.age} • ${targetClient.gender}`}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">{isMl ? 'ചുമതലയുള്ള കോച്ച്' : 'Assigned Coach'}</span>
                <span className="font-bold text-slate-900">{assignedDietitian.name}</span>
                <span className="text-emerald-700 block text-[10px] font-semibold">{assignedDietitian.title}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">{isMl ? 'ഭാര ലക്ഷ്യം' : 'Weight Trajectory'}</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {targetClient.currentWeightKg} kg <span className="text-slate-400 font-normal">→ {isMl ? 'ലക്ഷ്യം:' : 'Target:'}</span> {targetClient.targetWeightKg} kg
                </span>
                <span className="text-slate-500 block text-[10px] tabular-nums">
                  {isMl ? `ആരംഭം: ${targetClient.startingWeightKg} kg` : `Starting: ${targetClient.startingWeightKg} kg`}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">{isMl ? 'പ്രതിദിന കലോറി ലക്ഷ്യം' : 'Daily Calorie Denominator'}</span>
                <span className="font-black text-emerald-800 text-sm tabular-nums">
                  {targetClient.neededCalories || targetClient.targetBmr || assignedPlan?.targetCalories || 1600} kcal/day
                </span>
                <span className="text-slate-500 block text-[10px]">
                  {t('Goal')}: {targetClient.goal}
                </span>
              </div>
            </div>
          </div>

          {/* The Prescribed Diet Plan Timetable */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>
                  {isMl ? `നിർദ്ദേശിച്ച ഡയറ്റ് പ്ലാൻ: ${assignedPlan.title}` : `Prescribed Diet Regimen: ${assignedPlan.title}`}
                </span>
              </h2>
              <span className="text-xs font-bold text-slate-500 tabular-nums">
                {isMl ? 'ലക്ഷ്യം:' : 'Targets:'} {assignedPlan.targetCalories} kcal • P: {assignedPlan.targetProtein}g • C: {assignedPlan.targetCarbs}g • F: {assignedPlan.targetFat}g
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3 w-28">{t('Meal Slot')}</th>
                    <th className="py-2.5 px-3 w-24">{isMl ? 'സമയം' : 'Timing'}</th>
                    <th className="py-2.5 px-3">{isMl ? 'നിർദ്ദേശിച്ച ഭക്ഷണങ്ങളും അളവും' : 'Recommended Foods & Clinical Portions'}</th>
                    <th className="py-2.5 px-3 w-48">{isMl ? 'ഡയറ്റീഷ്യൻ കുറിപ്പുകൾ' : 'Dietitian Notes'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignedPlan.meals.map((m) => (
                    <tr key={m.mealType} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-bold text-emerald-900 bg-emerald-50/30">
                        {t(m.mealType)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                        {m.timeGuideline}
                      </td>
                      <td className="py-2.5 px-3">
                        <ul className="list-disc list-inside space-y-0.5">
                          {m.recommendedFoods.map((rf, idx) => (
                            <li key={idx} className="text-slate-800">
                              <span className="font-semibold">{tf(rf.foodName)}</span>: {rf.portion} {rf.unit}
                              {rf.notes && <span className="text-slate-400 italic text-[11px]"> ({rf.notes})</span>}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 italic text-[11px]">
                        {m.instructions || (isMl ? 'എണ്ണ മിതമായി ഉപയോഗിക്കുക (ആവിയിൽ / കുറഞ്ഞ എണ്ണയിൽ).' : 'Follow standard cooking oil discipline (steamed/shallow sauté).')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* InBody Body Composition & 8,000 Calorie Rule Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs">
            
            {/* 8,000 Calorie Rule */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4">
              <h3 className="font-extrabold text-emerald-950 mb-2 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-emerald-700" />
                <span>{isMl ? '8,000 കലോറി നിയമ പ്രൊജക്ഷൻ' : 'The 8,000 Calorie Rule Trajectory'}</span>
              </h3>
              <p className="text-slate-600 mb-2 leading-relaxed font-mono text-[11px] bg-white p-2 rounded-lg border border-emerald-100">
                {isMl
                  ? 'ഭാര മാറ്റം (kg) = (ആകെ കലോറി കുറവ് / അധികം) ÷ 8,000 kcal'
                  : 'Net Weight Change (kg) = (Cumulative Calorie Deficit / Surplus) ÷ 8,000 kcal'}
              </p>
              <div className="bg-white rounded-xl p-3 border border-emerald-100 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">{isMl ? 'ഭാരം കുറയ്ക്കാൻ:' : 'Weight Loss Rule:'}</span>
                  <span className="font-bold text-emerald-700">
                    {isMl ? 'കലോറി < ലക്ഷ്യം ആയാൽ പച്ച (നല്ലത്)' : 'Calorie < Denominator turns GREEN'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isMl ? 'ഭാരം കൂട്ടാൻ:' : 'Weight Gain Rule:'}</span>
                  <span className="font-bold text-emerald-700">
                    {isMl ? 'കലോറി > ലക്ഷ്യം ആയാൽ പച്ച (നല്ലത്)' : 'Calorie > Denominator turns GREEN'}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100">
                  <span className="text-slate-500">{isMl ? 'പ്രതിദിന വെള്ളം ലക്ഷ്യം:' : 'Daily Water Prescription:'}</span>
                  <span className="font-bold text-slate-800">
                    {targetClient.dailyWaterTargetLiters || 2.5} {isMl ? 'ലിറ്റർ / ദിവസം' : 'Liters / day'}
                  </span>
                </div>
              </div>
            </div>

            {/* InBody Scan Baseline */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <h3 className="font-extrabold text-slate-900 mb-2 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-emerald-600" />
                <span>{isMl ? 'ഇൻബോഡി ക്ലിനിക്കൽ പരിശോധനാ വിവരങ്ങൾ' : 'InBody Clinical Diagnostic Metrics'}</span>
              </h3>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 block">{isMl ? 'ശരീര കൊഴുപ്പ് %' : 'Body Fat %'}</span>
                  <span className="font-bold text-slate-800 text-xs tabular-nums">
                    {targetClient.bodyFatPercentage ? `${targetClient.bodyFatPercentage}%` : '24.2%'}
                  </span>
                  <span className="text-[10px] text-emerald-700 block">
                    {isMl ? 'ലക്ഷ്യം:' : 'Target:'} {targetClient.targetBodyFatPercentage || 18}%
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 block">{isMl ? 'വിസറൽ ഫാറ്റ്' : 'Visceral Fat Level'}</span>
                  <span className="font-bold text-slate-800 text-xs tabular-nums">
                    {targetClient.visceralFat ? targetClient.visceralFat : '6.5'}
                  </span>
                  <span className="text-[10px] text-emerald-700 block">
                    {isMl ? `ലക്ഷ്യം: ${targetClient.targetVisceralFat || 4.0} (സുരക്ഷിതം: 0.5-9)` : `Target: ${targetClient.targetVisceralFat || 4.0} (Safe: 0.5-9)`}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 block">{isMl ? 'പേശി ഭാരം (SMM)' : 'Muscle Mass (SMM)'}</span>
                  <span className="font-bold text-slate-800 text-xs tabular-nums">
                    {targetClient.muscleMassKg ? `${targetClient.muscleMassKg} kg` : '26.8 kg'}
                  </span>
                  <span className="text-[10px] text-emerald-700 block">
                    {isMl ? 'പ്രോട്ടീനിലൂടെ സംരക്ഷിക്കുക' : 'Preserve via protein'}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 block">BMI &amp; BMR</span>
                  <span className="font-bold text-slate-800 text-xs tabular-nums">
                    BMI: {targetClient.bmi || 24.1} • BMR: {targetClient.bmr || 1420} kcal
                  </span>
                  <span className="text-[10px] text-emerald-700 block">
                    {isMl ? 'ലക്ഷ്യം BMI: 21.5' : 'Target BMI: 21.5'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Clinical General Guidelines & Coach Sign-off */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-6 text-xs">
            <div className="max-w-lg space-y-1 text-slate-500 text-[11px]">
              <span className="font-bold text-slate-700 block text-xs">
                {isMl ? 'പ്രധാന ക്ലിനിക്കൽ നിർദ്ദേശങ്ങൾ:' : 'Important Clinical Instructions:'}
              </span>
              {isMl ? (
                <>
                  <p>• അധിക എണ്ണ ഒഴിവാക്കാൻ എണ്ണയിൽ പൊരിച്ച പലഹാരങ്ങൾ (പഴംപൊരി, പരിപ്പ് വട) ഒഴിവാക്കുക.</p>
                  <p>• ആവിയിൽ വേവിച്ച പരമ്പരാഗത ഭക്ഷണങ്ങൾ (ഇല അട, ഇഡലി, പുട്ട്) പച്ചക്കറികൾക്കൊപ്പം തിരഞ്ഞെടുക്കുക.</p>
                  <p>• കോച്ചിന്റെ തത്സമയ നിരീക്ഷണത്തിനായി ദിവസവും ഭക്ഷണം ന്യൂട്രിട്രാക്കിൽ രേഖപ്പെടുത്തുക.</p>
                </>
              ) : (
                <>
                  <p>• Avoid deep-fried snacks (Pazham Pori, Parippu Vada) to prevent excess surface oil absorption.</p>
                  <p>• Favor steamed traditional options (Ela Ada, Idli, Puttu) with light vegetable accompaniments.</p>
                  <p>• Log all meals daily in NutriTrack to maintain real-time sync with your coach portal.</p>
                </>
              )}
            </div>

            <div className="text-center sm:text-right shrink-0">
              <div className="inline-block border-b-2 border-slate-400 pb-1 w-44 mb-1">
                <span className="font-serif italic text-base text-slate-700 font-bold">
                  {assignedDietitian.name}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                {isMl ? 'സർട്ടിഫൈഡ് വെൽനെസ് കോച്ച് ഒപ്പ്' : 'Certified Wellness Coach Signature'}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold block">
                {isMl ? 'ന്യൂട്രിട്രാക്ക് വെൽനെസ് & ഡയഗ്നോസ്റ്റിക് സെന്റർ' : 'NutriTrack Wellness & Diagnostic Centre'}
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
