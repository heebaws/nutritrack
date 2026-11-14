import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Utensils,
  Flame,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Award,
  Bell,
  Smartphone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AppTourGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCalorieGuide?: () => void;
  onOpenMealLog?: () => void;
}

export const AppTourGuideModal: React.FC<AppTourGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenCalorieGuide
}) => {
  const { language } = useApp();
  const isMl = language === 'ml';
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: isMl ? 'ന്യൂട്രിട്രാക്ക് പ്രോയിലേക്ക് സ്വാഗതം!' : 'Welcome to NutriTrack PRO!',
      subtitle: isMl ? 'നിങ്ങളുടെ വ്യക്തിഗത ക്ലിനിക്കൽ ഡയറ്റ് & ആരോഗ്യ സഹായി' : 'Your personal clinical diet & healthy lifestyle companion',
      icon: <Sparkles className="w-8 h-8 text-amber-300" />,
      content: (
        <div className="space-y-4">
          <div className="bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800/70">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              {isMl ? 'ഒരു സംശയവുമില്ലാതെ, എല്ലാം താനേ നടക്കും.' : 'Zero Confusion. Everything is Automatic.'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {isMl
                ? 'ആരുടെയും സഹായമില്ലാതെ തന്നെ ആർക്കും ഉപയോഗിക്കാൻ കഴിയുന്ന വിധത്തിലാണ് ന്യൂട്രിട്രാക്ക് നിർമ്മിച്ചിരിക്കുന്നത്. കഴിച്ച ഭക്ഷണവും കുടിച്ച വെള്ളവും ചേർത്താൽ കോച്ച് നിങ്ങളുടെ പുരോഗതി ലൈവായി വിലയിരുത്തും.'
                : 'NutriTrack is built so you never need anyone to explain how it works. You log what you eat, tap when you drink water, and your coach monitors your daily progress live.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center shadow-2xs">
              <span className="text-xl block mb-1">🍽️</span>
              <b className="text-slate-800 dark:text-slate-100 block">{isMl ? '1. ഭക്ഷണം ചേർക്കുക' : '1. Log Meals'}</b>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">{isMl ? 'വെറും 30 സെക്കൻഡ് മതി' : 'Takes 30 seconds per meal'}</span>
            </div>
            <div className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center shadow-2xs">
              <span className="text-xl block mb-1">🎯</span>
              <b className="text-slate-800 dark:text-slate-100 block">{isMl ? '2. പച്ച നിറത്തിൽ തുടരുക' : '2. Stay in Green'}</b>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">{isMl ? 'പ്രതിദിന കലോറി ലക്ഷ്യം' : 'Daily calories target bar'}</span>
            </div>
            <div className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center shadow-2xs">
              <span className="text-xl block mb-1">👨‍⚕️</span>
              <b className="text-slate-800 dark:text-slate-100 block">{isMl ? '3. കോച്ച് നിർദ്ദേശങ്ങൾ' : '3. Coach Feedback'}</b>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">{isMl ? 'ഉപദേശങ്ങളും സ്കാൻ റിപ്പോർട്ടും' : 'Daily advice & scan reports'}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: isMl ? '30 സെക്കൻഡിൽ ഭക്ഷണം രേഖപ്പെടുത്താം' : 'Logging Your Meals in 30 Seconds',
      subtitle: isMl ? 'തിരയൽ, ശബ്ദ സന്ദേശം, അല്ലെങ്കിൽ ഫോട്ടോ വഴി' : 'Instant food search, voice speech, or food photos',
      icon: <Utensils className="w-8 h-8 text-emerald-300" />,
      content: (
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {isMl
              ? 'പ്രഭാതഭക്ഷണം, ഉച്ചഭക്ഷണം, സ്നാക്ക്സ്, അത്താഴം എന്നിവ എളുപ്പത്തിൽ രേഖപ്പെടുത്താം:'
              : 'You can record your breakfast, lunch, snacks, and dinner in multiple effortless ways:'}
          </p>

          <div className="space-y-2.5">
            <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 text-xs">
                1
              </div>
              <div>
                <b className="text-xs text-slate-900 dark:text-white block">
                  {isMl ? '"ഭക്ഷണം ചേർക്കുക" ഐക്കൺ അമർത്തുക' : 'Tap "Log Meal" on Any Meal Slot'}
                </b>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isMl
                    ? 'പഴംപൊരി, അപ്പം, പുട്ട്, ബിരിയാണി തുടങ്ങി 800+ കേരള വിഭവങ്ങൾ തിരയുക. കലോറിയും പ്രോട്ടീനും താനേ കണക്കാക്കും.'
                    : 'Search 800+ verified Kerala & Indian dishes (Pazham Pori, Appam, Puttu, Biriyani). Calories, protein, carbs, and fats auto-calculate.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </div>
              <div>
                <b className="text-xs text-slate-900 dark:text-white block">
                  {isMl ? 'ന്യൂട്രിബോട്ട് AI-യോട് സംസാരിക്കുക' : 'Tell NutriBot AI (Voice or Text)'}
                </b>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isMl
                    ? 'താഴെ വലതുവശത്തുള്ള AI ബോട്ട് ഐക്കൺ തുറന്ന് മലയാളത്തിൽ സംസാരിക്കൂ ("ഞാൻ 2 അപ്പവും മുട്ടക്കറിയും കഴിച്ചു"). ഒറ്റ ക്ലിക്കിൽ ഡയറിയിൽ ചേർക്കാം!'
                    : 'Click the green NutriBot icon at the bottom-right. Speak with the microphone in Malayalam or English ("I ate 2 appam and 1 egg curry"). It records it into your diary in 1 click!'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 font-bold flex items-center justify-center shrink-0 text-xs">
                3
              </div>
              <div>
                <b className="text-xs text-slate-900 dark:text-white block">
                  {isMl ? 'ഡയറ്റ് പ്ലാനിൽ നിന്ന് നേരിട്ട് ചേർക്കുക' : 'Copy From Prescribed Diet Plan'}
                </b>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isMl
                    ? 'കോച്ച് നൽകിയ ഡയറ്റ് പ്ലാൻ പിന്തുടരുന്നുണ്ടെങ്കിൽ, ഒറ്റ ബട്ടണിൽ പ്ലാനിലെ മുഴുവൻ ഭക്ഷണവും ചേർക്കാം.'
                    : 'If you followed your coach\'s prescribed plan, click "Quick Log from Plan" to import all planned foods in 1 second.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: isMl ? 'കലോറി മീറ്ററും നല്ല vs മോശം കലോറിയും' : 'Your Calorie Meter & Good vs Bad Calories',
      subtitle: isMl ? 'വിശപ്പില്ലാതെ പച്ച നിറത്തിലുള്ള ലക്ഷ്യത്തിൽ എത്താനുള്ള ശാസ്ത്രം' : 'The science of staying in the green without feeling starved',
      icon: <Flame className="w-8 h-8 text-amber-400" />,
      content: (
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
              {isMl ? 'നിങ്ങളുടെ പ്രതിദിന ലക്ഷ്യം (ഉദാ. 1,600 kcal)' : 'Your Daily Target (e.g. 1,600 kcal)'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {isMl
                ? 'നിങ്ങളുടെ BMR, ഉയരം, ലക്ഷ്യഭാരം എന്നിവ അടിസ്ഥാനമാക്കിയാണ് കോച്ച് ഈ കലോറി ലക്ഷ്യം നിശ്ചയിച്ചിരിക്കുന്നത്.'
                : 'Your target is calculated scientifically by your coach based on your BMR, height, and body fat goal.'}
            </p>

            <div className="pt-2">
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden flex">
                <div className="bg-emerald-600 h-full w-[65%]" title={isMl ? 'നല്ല കലോറി' : 'Good Calories'} />
                <div className="bg-amber-500 h-full w-[15%]" title={isMl ? 'മോശം കലോറി' : 'Bad Calories'} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                <span>{isMl ? '🍏 നല്ല കലോറി (പ്രോട്ടീനും നാരുകളും)' : '🍏 Good Calories (High Protein & Fiber)'}</span>
                <span>{isMl ? '🍟 വറുത്തവ / ട്രീറ്റുകൾ' : '🍟 Treats / Fried'}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3">
            <span>
              {isMl
                ? 'എന്താണ് കലോറി എന്നും മനുഷ്യന് എത്ര കലോറി വേണമെന്നും പഠിക്കണോ?'
                : 'Want to learn what a calorie really is and how much a human needs?'}
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCalorieGuide?.();
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs whitespace-nowrap cursor-pointer shrink-0"
            >
              {isMl ? 'കലോറി ഗൈഡ് 101 തുറക്കുക →' : 'Open Calorie Guide 101 →'}
            </button>
          </div>
        </div>
      )
    },
    {
      title: isMl ? 'കൃത്യസമയത്ത് ഫോൺ അലേർട്ടുകൾ' : 'Stay Active with Scheduled Reminders',
      subtitle: isMl ? 'രാവിലെയും ഉച്ചയ്ക്കും രാത്രിയുമുള്ള ശാസ്ത്രീയ ഓർമ്മപ്പെടുത്തലുകൾ' : 'Automatic check-ins at Breakfast, Lunch, and Dinner',
      icon: <Bell className="w-8 h-8 text-teal-300" />,
      content: (
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {isMl
              ? 'ഭക്ഷണം രേഖപ്പെടുത്താൻ മറക്കാതിരിക്കാൻ കൃത്യസമയത്ത് ഓർമ്മപ്പെടുത്തലുകൾ ഫോണിൽ എത്തും:'
              : 'To make sure you never forget your diary, NutriTrack has automatic reminders:'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <span className="font-bold text-amber-900 dark:text-amber-200 block">{isMl ? '🌅 രാവിലെ (8:00 AM)' : '🌅 Morning (8:00 AM)'}</span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold block">7:00 – 8:30 AM</span>
              <span className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 block">
                {isMl ? 'പ്രഭാതഭക്ഷണവും ഇൻസുലിൻ ബാലൻസും' : 'Breakfast & morning cortisol insulin alignment'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800">
              <span className="font-bold text-orange-900 dark:text-orange-200 block">{isMl ? '☀️ ഉച്ചയ്ക്ക് (1:00 PM)' : '☀️ Afternoon (1:00 PM)'}</span>
              <span className="text-[10px] text-orange-700 dark:text-orange-400 font-semibold block">12:30 – 1:30 PM</span>
              <span className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 block">
                {isMl ? 'ഉച്ചഭക്ഷണവും ദഹനശക്തിയുടെ ഉച്ചസ്ഥായിയും' : 'Lunch & peak midday digestive fire'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
              <span className="font-bold text-indigo-900 dark:text-indigo-200 block">{isMl ? '🌙 രാത്രി (7:30 PM)' : '🌙 Night (7:30 PM)'}</span>
              <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-semibold block">7:00 – 8:00 PM</span>
              <span className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 block">
                {isMl ? 'ഉറക്കത്തിന് 3 മണിക്കൂർ മുമ്പുള്ള അത്താഴം' : 'Dinner pre-melatonin (3 hrs before sleep)'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 rounded-xl border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
            <Smartphone className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              {isMl
                ? <><b>3-ദിവസത്തെ നിഷ്ക്രിയ മുന്നറിയിപ്പ്:</b> തുടർച്ചയായി 3 ദിവസം ഭക്ഷണം രേഖപ്പെടുത്തിയില്ലെങ്കിൽ കോച്ചിന്റെ പോർട്ടലിൽ അലേർട്ട് വരുകയും ഫോണിലേക്ക് സന്ദേശം അയക്കുകയും ചെയ്യും.</>
                : <><b>3-Day Inactive Protection:</b> If you don&apos;t log meals for 3 consecutive days, your profile flags in red in your coach&apos;s portal, and phone reminders are triggered to keep you accountable!</>}
            </div>
          </div>
        </div>
      )
    },
    {
      title: isMl ? 'ലളിതമായ സ്ക്വയർ ഐക്കൺ ഡിസൈൻ' : "Clean 'Comfort View' with 1-Click Shortcuts",
      subtitle: isMl ? 'അധിക വിവരങ്ങൾ ആവശ്യമുള്ളപ്പോൾ മാത്രം തുറക്കാവുന്ന രീതിയിൽ ക്രമീകരിച്ചിരിക്കുന്നു' : 'Deep data is neatly tucked away so your screen is always peaceful',
      icon: <Award className="w-8 h-8 text-emerald-300" />,
      content: (
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {isMl
              ? 'ഒറ്റയടിക്ക് ഒരുപാട് വിവരങ്ങൾ കാണുന്നത് ഒഴിവാക്കാൻ പ്രധാന വിവരങ്ങൾ മാത്രം മുന്നിലും, ബാക്കി ടൂളുകൾ സ്ക്വയർ ഐക്കണുകൾക്കുള്ളിലുമാണ് നൽകിയിട്ടുള്ളത്:'
              : "We noticed clients can feel overwhelmed when too much data shows at once. That's why we organized secondary data behind fast 1-click shortcuts:"}
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
              <b>🧠 {isMl ? 'കലോറി 101 ഗൈഡ്:' : 'Calorie 101 Guide:'}</b>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">{isMl ? 'BMR & കലോറി അറിവുകൾ' : 'Learn BMR & food calories'}</span>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
              <b>📈 {isMl ? '8,000 കലോറി പ്രൊജക്ഷൻ:' : '8,000 kcal Trajectory:'}</b>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">{isMl ? 'ഭാര മാറ്റങ്ങളുടെ കണക്ക്' : 'Weight loss projections'}</span>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
              <b>🩺 {isMl ? 'ഭക്ഷണ നിയമങ്ങൾ:' : 'Clinical Food Rules:'}</b>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">{isMl ? 'കോച്ച് സലീം മുന്നറിയിപ്പുകൾ' : 'Coach Saleem cautions & tiers'}</span>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
              <b>💧 {isMl ? 'വെള്ളവും ശീലങ്ങളും:' : 'Water & Habits:'}</b>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">{isMl ? 'വെള്ളം, ഉറക്കം, ഫോൺ സ്റ്റെപ്പുകൾ' : 'Glasses, sleep & daily steps'}</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 font-semibold text-center">
            {isMl
              ? '🎉 നിങ്ങൾ തുടങ്ങാൻ തയ്യാറാണ്! ലളിതവും സുഖകരവുമായ ആരോഗ്യയാത്ര ആശംസിക്കുന്നു.'
              : "🎉 You're ready to start! No complicated manuals or instructions needed."}
          </div>
        </div>
      )
    }
  ];

  const current = steps[currentStep];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              {current.icon}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 tabular-nums">
                {isMl ? `ഘട്ടം ${currentStep + 1} / ${steps.length}` : `Step ${currentStep + 1} of ${steps.length}`}
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">{current.title}</h3>
              <p className="text-xs text-emerald-100">{current.subtitle}</p>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center gap-1.5 mt-4">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-8 bg-amber-400' : idx < currentStep ? 'w-3 bg-emerald-400' : 'w-3 bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {current.content}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{isMl ? 'മുമ്പത്തേത്' : 'Previous'}</span>
          </button>

          <div className="flex items-center gap-2">
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>{isMl ? 'അടുത്ത ഘട്ടം' : 'Next Step'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <span>{isMl ? 'തുടങ്ങാം!' : "Let's Get Started!"}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-white" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
