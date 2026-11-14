import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MealLogModal } from './MealLogModal';
import { MeasurementModal } from './MeasurementModal';
import { CalorieWeightTrajectoryCard } from './CalorieWeightTrajectoryCard';
import { HydrationModal } from './HydrationModal';
import { DailyHabitsCard } from './DailyHabitsCard';
import { ActivityLogModal } from './ActivityLogModal';
import { QuickWeightModal } from './QuickWeightModal';
import { PrintReportModal } from '../common/PrintReportModal';
import { AppointmentsModal } from '../common/AppointmentsModal';
import { LoginPortal } from '../common/LoginPortal';
import { CalorieKnowledgeModal } from './CalorieKnowledgeModal';
import { AppTourGuideModal } from './AppTourGuideModal';
import { ClinicalFoodGuideModal } from './ClinicalFoodGuideModal';
import { NotificationsModal } from './NotificationsModal';
import { MealType } from '../../types';
import { calculateCalorieBreakdown, calculateStepCalories, determineCalorieQuality } from '../../utils/calorieQuality';
import { classifyFoodItem } from '../../utils/clinicalFoodAudit';
import { NutriTrackLogo } from '../common/NutriTrackLogo';
import { getNotificationStatus, parseTimeTo24h, showOSNotification } from '../../utils/notifications';
import { 
  getTodayString, 
  getYesterdayString, 
  getDaysAgoString, 
  formatDateDisplay, 
  formatToLocalIsoDate 
} from '../../utils/dateUtils';
import { 
  Utensils, 
  LineChart as ChartIcon, 
  CalendarDays, 
  Bell, 
  User, 
  Plus, 
  Flame, 
  ChevronRight, 
  ChevronLeft, 
  Trash2, 
  Scale, 
  CheckCircle2, 
  Sparkles, 
  Dumbbell, 
  Wheat, 
  Droplets,
  Award,
  Phone,
  Building2,
  Calendar,
  HeartPulse,
  Clock,
  ShieldCheck,
  Check,
  X,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Layers,
  Printer,
  CalendarCheck,
  Footprints,
  Activity,
  Bot,
  RotateCcw,
  LogOut,
  Smartphone,
  Sun,
  Sunset,
  Moon,
  AlertTriangle,
  HelpCircle,
  Lightbulb,
  BookOpen,
  Compass,
  ArrowRight,
  ArrowLeft,
  LayoutGrid,
  ClipboardList,
  BellRing,
  Languages
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

export const ClientApp: React.FC = () => {
  const { 
    activeClient, 
    clientSignOut, 
    dietitians, 
    dietPlans, 
    mealLogs, 
    deleteMealLog,
    measurements, 
    tips, 
    reminders, 
    toggleReminder,
    selectedDate,
    setSelectedDate,
    addMealLog,
    suggestedMeals,
    acceptSuggestedMeal,
    dismissSuggestedMeal,
    activities,
    habits,
    appointments,
    resetClientDayMealsToDayBefore,
    foods,
    isTipRead,
    language,
    toggleLanguage,
    t,
    tf,
    osHealthInfo,
    isPedometerLive,
    pedometerPermissionState,
    enableMobilePedometer
  } = useApp();

  // Active front-page icon launcher panel (null = serene clean front page with square icons only)
  const [activeViewPanel, setActiveViewPanel] = useState<null | 'meals' | 'plan' | 'progress' | 'profile' | 'more'>(null);
  const [activeMoreSubPanel, setActiveMoreSubPanel] = useState<null | 'habits'>(null);
  // 8,000 kcal trajectory always projected above icons until user taps "Hide Line" (collapses to compact icon bar)
  const [isTrajectoryProjected, setIsTrajectoryProjected] = useState(true);

  // Listen to navigation from chatbot
  useEffect(() => {
    const handleNavToMeals = (e: any) => {
      setActiveViewPanel('meals');
      if (e.detail?.slot) {
        setActiveMealTypeForLog(e.detail.slot);
      }
    };
    window.addEventListener('navigate-to-meals', handleNavToMeals);
    return () => window.removeEventListener('navigate-to-meals', handleNavToMeals);
  }, []);

  // Modal states
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [activeMealTypeForLog, setActiveMealTypeForLog] = useState<MealType>('Breakfast');
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [isQuickWeightModalOpen, setIsQuickWeightModalOpen] = useState(false);
  const [isHydrationModalOpen, setIsHydrationModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isAppointmentsModalOpen, setIsAppointmentsModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCalorieGuideOpen, setIsCalorieGuideOpen] = useState(false);
  const [calorieGuideTab, setCalorieGuideTab] = useState<'what-is-calorie' | 'how-it-detects' | 'how-much-needed' | 'calculator' | 'chrononutrition'>('what-is-calorie');

  const openCalorieGuide = (tab: 'what-is-calorie' | 'how-it-detects' | 'how-much-needed' | 'calculator' | 'chrononutrition' = 'what-is-calorie') => {
    setCalorieGuideTab(tab);
    setIsCalorieGuideOpen(true);
  };
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [isClinicalGuideOpen, setIsClinicalGuideOpen] = useState(false);
  const [planLoggedNotice, setPlanLoggedNotice] = useState<string | null>(null);
  const [isResettingMeals, setIsResettingMeals] = useState(false);
  const [confirmResetMeals, setConfirmResetMeals] = useState(false);
  const [resetFeedbackNotice, setResetFeedbackNotice] = useState<string | null>(null);

  // Listen to open-calorie-guide or open-app-tour events
  useEffect(() => {
    const handleOpenCalorieGuide = () => setIsCalorieGuideOpen(true);
    const handleOpenTour = () => setIsTourModalOpen(true);
    window.addEventListener('open-calorie-guide', handleOpenCalorieGuide);
    window.addEventListener('open-app-tour', handleOpenTour);
    return () => {
      window.removeEventListener('open-calorie-guide', handleOpenCalorieGuide);
      window.removeEventListener('open-app-tour', handleOpenTour);
    };
  }, []);

  const handleResetMealsToDayBefore = async () => {
    if (!activeClient) return;
    const isMl = language === 'ml';
    setConfirmResetMeals(false);
    setIsResettingMeals(true);
    try {
      const res = await resetClientDayMealsToDayBefore(activeClient.id, selectedDate);
      if (res.count > 0) {
        setResetFeedbackNotice(
          isMl
            ? `ഇന്നലെ (${formatDateDisplay(res.dayBefore)}) കഴിച്ച ${res.count} ഭക്ഷണങ്ങൾ ഇന്നത്തേക്ക് ചേർത്തു!`
            : `Successfully set ${res.count} food${res.count > 1 ? 's' : ''} from yesterday (${formatDateDisplay(res.dayBefore)}) into today!`
        );
      } else {
        setResetFeedbackNotice(
          isMl
            ? `തലേദിവസം (${formatDateDisplay(res.dayBefore)}) ഭക്ഷണങ്ങളൊന്നും രേഖപ്പെടുത്തിയിരുന്നില്ല. ഇന്നത്തെ ഡയറി ക്ലിയർ ചെയ്തു.`
            : `No food logs were recorded on the day before (${formatDateDisplay(res.dayBefore)}). Today's food log has been cleared.`
        );
      }
    } catch (err) {
      setResetFeedbackNotice(isMl ? 'റീസെറ്റ് പരാജയപ്പെട്ടു. വീണ്ടും ശ്രമിക്കുക.' : 'Reset failed. Please try again.');
    } finally {
      setIsResettingMeals(false);
      setTimeout(() => {
        setResetFeedbackNotice(null);
      }, 5000);
    }
  };

  // State to toggle individual meal slots in the timeline
  const [openMealSlots, setOpenMealSlots] = useState<Record<string, boolean>>({
    'Breakfast': true,
    'Morning Snack': true,
    'Lunch': true,
    'Evening Snack': true,
    'Dinner': true
  });

  const toggleMealSlot = (slot: string) => {
    setOpenMealSlots(prev => ({ ...prev, [slot]: !prev[slot] }));
  };

  if (!activeClient) {
    return <LoginPortal defaultTab="client" />;
  }

  // Assigned dietitian and plan
  const assignedDietitian = dietitians.find(d => d.id === activeClient.assignedDietitianId) || dietitians[0];
  const assignedPlan = dietPlans.find(p => p.id === activeClient.dietPlanId) || dietPlans[0];

  // Pending AI suggested meals reported via chat
  const pendingSuggestions = useMemo(() => {
    return suggestedMeals.filter(
      s => s.clientId === activeClient.id && s.date === selectedDate && s.status === 'pending'
    );
  }, [suggestedMeals, activeClient.id, selectedDate]);

  // Daily target values: custom needed calorie denominator assigned to client by coach or intake
  const targetCalories = activeClient.neededCalories || activeClient.targetBmr || assignedPlan?.targetCalories || 1600;
  const targetProtein = activeClient.proteinTargetGrams || assignedPlan?.targetProtein || 90;
  const targetCarbs = assignedPlan?.targetCarbs || 160;
  const targetFat = assignedPlan?.targetFat || 45;

  // Filter logs for this client on the selected date
  const clientLogsForDay = useMemo(() => {
    return mealLogs.filter(m => m.clientId === activeClient.id && m.date === selectedDate);
  }, [mealLogs, activeClient.id, selectedDate]);

  // Aggregate macros consumed today
  const consumedTotals = useMemo(() => {
    return clientLogsForDay.reduce((acc, curr) => ({
      calories: acc.calories + curr.calories,
      protein: acc.protein + curr.protein,
      carbs: acc.carbs + curr.carbs,
      fat: acc.fat + curr.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [clientLogsForDay]);

  // Physical activities + phone OS walking steps calories burned today
  const clientActivitiesForDay = useMemo(() => {
    return activities.filter(a => a.clientId === activeClient.id && a.date === selectedDate);
  }, [activities, activeClient.id, selectedDate]);

  const dayHabit = useMemo(() => {
    return habits.find(h => h.clientId === activeClient.id && h.date === selectedDate);
  }, [habits, activeClient.id, selectedDate]);

  const workoutBurnToday = useMemo(() => {
    return clientActivitiesForDay.reduce((sum, a) => sum + a.caloriesBurned, 0);
  }, [clientActivitiesForDay]);

  const stepCaloriesToday = useMemo(() => {
    return calculateStepCalories(dayHabit?.steps || 0, activeClient.currentWeightKg);
  }, [dayHabit?.steps, activeClient.currentWeightKg]);

  const caloriesBurnedToday = workoutBurnToday + stepCaloriesToday;

  // Comprehensive Good Calories vs Bad Calories and Net Burned breakdown
  const calorieBreakdown = useMemo(() => {
    return calculateCalorieBreakdown(clientLogsForDay, caloriesBurnedToday);
  }, [clientLogsForDay, caloriesBurnedToday]);

  const netCalories = calorieBreakdown.netCalories;

  // Next upcoming clinic consultation or InBody scan
  const nextAppointment = useMemo(() => {
    const today = getTodayString();
    return appointments
      .filter(a => a.clientId === activeClient.id && a.date >= today && a.status === 'scheduled')
      .sort((a, b) => a.date.localeCompare(b.date))[0];
  }, [appointments, activeClient.id]);

  // Determine client goal requirement: Weight Loss vs Weight Gain
  const isWeightGainGoal = activeClient.goalType === 'gain' || 
    (!activeClient.goalType && /gain|bulk|surplus|muscle|build/i.test(activeClient.goal)) ||
    (activeClient.targetWeightKg > activeClient.currentWeightKg);

  const isWeightLossGoal = activeClient.goalType === 'loss' || (!activeClient.goalType && !isWeightGainGoal);

  // Calorie target compliance
  const isCalorieGreen = isWeightGainGoal
    ? (netCalories >= targetCalories)
    : (netCalories <= targetCalories);

  const caloriesRemaining = Math.max(0, targetCalories - netCalories);
  const caloriesSurplus = Math.max(0, netCalories - targetCalories);
  const caloriesPercent = targetCalories > 0 ? Math.round((netCalories / targetCalories) * 100) : 0;


  // Measurements for this client sorted by date
  const clientMeasurements = useMemo(() => {
    return measurements
      .filter(m => m.clientId === activeClient.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [measurements, activeClient.id]);

  // Tips for this client
  const clientTips = useMemo(() => {
    return tips.filter(t => 
      t.targetAudience === 'all' || 
      t.clientId === activeClient.id || 
      (t.targetAudience === 'inactive' && activeClient.status === 'inactive')
    );
  }, [tips, activeClient]);

  // Reminders for this client
  const clientReminders = useMemo(() => {
    return reminders.filter(r => r.clientId === activeClient.id);
  }, [reminders, activeClient.id]);

  // Real-time Phone Notification Scheduler via Service Worker (8:00 AM, 1:00 PM, 7:30 PM & coach alerts)
  useEffect(() => {
    if (getNotificationStatus() !== 'granted') return;

    const checkAndDispatchNotifications = async () => {
      const now = new Date();
      const todayKey = getTodayString();
      const nowTotalMins = now.getHours() * 60 + now.getMinutes();

      // 1. Check scheduled meal & hydration reminders (10-minute delivery grace window)
      for (const r of clientReminders) {
        if (!r.enabled) continue;
        const parsed = parseTimeTo24h(r.time);
        if (!parsed) continue;
        const targetMins = parsed.hour * 60 + parsed.minute;
        if (nowTotalMins >= targetMins && nowTotalMins <= targetMins + 10) {
          const storageKey = `nutritrack_notif_${todayKey}_${r.id}`;
          if (!localStorage.getItem(storageKey)) {
            localStorage.setItem(storageKey, '1');
            await showOSNotification(`${r.title} (${r.time})`, {
              body: r.message,
              tag: storageKey,
            });
          }
        }
      }

      // 2. Check new coach reminder tips that haven't been pushed to phone yet
      for (const tip of clientTips.filter(t => t.type === 'reminder')) {
        const tipStorageKey = `nutritrack_coach_tip_${tip.id}`;
        if (!localStorage.getItem(tipStorageKey)) {
          localStorage.setItem(tipStorageKey, '1');
          await showOSNotification(`Coach Reminder · ${tip.dietitianName}`, {
            body: `${tip.title}: ${tip.message}`,
            tag: tipStorageKey,
          });
        }
      }
    };

    checkAndDispatchNotifications();
    const interval = setInterval(checkAndDispatchNotifications, 30000);
    return () => clearInterval(interval);
  }, [clientReminders, clientTips]);

  // Current time-contextual meal recommendation (Circadian Chrononutrition)
  const currentCircadianMeal = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) {
      const isLogged = clientLogsForDay.some(m => m.mealType === 'Breakfast');
      return {
        slot: 'Breakfast' as MealType,
        targetTime: '8:00 AM',
        window: '7:00 AM – 8:30 AM',
        title: 'Morning Breakfast Window',
        scientificReason: 'Diurnal peak for cortisol & insulin sensitivity. Kickstarts resting metabolic rate.',
        isLogged,
        actionText: isLogged ? 'Breakfast Logged ✓' : 'Log Breakfast (8:00 AM)'
      };
    } else if (hour >= 11 && hour < 16) {
      const isLogged = clientLogsForDay.some(m => m.mealType === 'Lunch');
      return {
        slot: 'Lunch' as MealType,
        targetTime: '1:00 PM',
        window: '12:30 PM – 1:30 PM',
        title: 'Midday Lunch Window',
        scientificReason: 'Peak digestive enzymes & resting metabolic fire. Consuming lunch before 2 PM optimizes fat loss by 25%.',
        isLogged,
        actionText: isLogged ? 'Lunch Logged ✓' : 'Log Lunch (1:00 PM)'
      };
    } else if (hour >= 16 && hour < 22) {
      const isLogged = clientLogsForDay.some(m => m.mealType === 'Dinner');
      return {
        slot: 'Dinner' as MealType,
        targetTime: '7:30 PM',
        window: '7:00 PM – 8:00 PM',
        title: 'Evening Dinner Window',
        scientificReason: 'Pre-melatonin window (finish 3h before bed). Avoids nocturnal glucose spike & activates overnight autophagy.',
        isLogged,
        actionText: isLogged ? 'Dinner Logged ✓' : 'Log Dinner (7:30 PM)'
      };
    } else {
      return {
        slot: 'Breakfast' as MealType,
        targetTime: '8:00 AM',
        window: '7:00 AM – 8:30 AM',
        title: 'Overnight Fasting & Recovery',
        scientificReason: '12-hour cellular autophagy fast is active until breakfast. Drink water or warm herbal tea if needed.',
        isLogged: false,
        actionText: 'Preview Breakfast'
      };
    }
  }, [clientLogsForDay]);

  // 1-Tap Quick Common Foods logger
  const handleQuickLogStaple = (foodName: string, calories: number, protein: number, carbs: number, fat: number, unit: string) => {
    if (!activeClient) return;
    const targetSlot = currentCircadianMeal.slot || 'Breakfast';
    const matchedFood = foods.find(f => f.name.toLowerCase().includes(foodName.toLowerCase().split(' ')[0]));
    addMealLog({
      clientId: activeClient.id,
      date: selectedDate,
      mealType: targetSlot,
      foodId: matchedFood?.id || `staple-${foodName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      foodName,
      quantity: 1,
      servingUnit: unit,
      calories,
      protein,
      carbs,
      fat,
    });
    setPlanLoggedNotice(`⚡ Quick logged: ${foodName} (${calories} kcal) into ${targetSlot}!`);
    setTimeout(() => setPlanLoggedNotice(null), 3500);
  };

  // Handle logging a whole meal from the diet plan with 1-click
  const handleLogPlannedMeal = (mealType: MealType) => {
    const plannedMeal = assignedPlan.meals.find(m => m.mealType === mealType);
    if (!plannedMeal) return;

    plannedMeal.recommendedFoods.forEach(rf => {
      addMealLog({
        clientId: activeClient.id,
        date: selectedDate,
        mealType,
        foodId: rf.foodId,
        foodName: rf.foodName,
        quantity: rf.portion,
        servingUnit: rf.unit,
        calories: 120, // baseline estimate if logged from plan
        protein: 8,
        carbs: 15,
        fat: 3,
      });
    });

    setPlanLoggedNotice(`Added ${mealType} items to your daily log!`);
    setTimeout(() => setPlanLoggedNotice(null), 3500);
  };

  const openLogForSlot = (slot: MealType) => {
    setActiveMealTypeForLog(slot);
    setIsMealModalOpen(true);
  };

  const changeDateBy = (days: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + days);
    const nextDate = formatToLocalIsoDate(dateObj);
    // Enforce strictly: past dates and today only, never tomorrow
    if (nextDate <= getTodayString()) {
      setSelectedDate(nextDate);
    }
  };

  const unreadAlertsCount = clientTips.filter(tip => !isTipRead(tip.id)).length;

  // Quick summary of 8,000 kcal projection for compact icon toggle state (includes workout + step burn)
  const trajectoryMiniSummary = useMemo(() => {
    const neededCal = activeClient.neededCalories || activeClient.targetBmr || 1600;
    const today = getTodayString();
    const dateSet = new Set<string>();
    for (let i = 0; i < 5; i++) dateSet.add(getDaysAgoString(i));
    mealLogs
      .filter(l => l.clientId === activeClient.id && l.date && l.date <= today)
      .forEach(l => dateSet.add(l.date));
    habits
      .filter(h => h.clientId === activeClient.id && h.date && h.date <= today)
      .forEach(h => dateSet.add(h.date));
    let runningBalance = 0;
    Array.from(dateSet)
      .sort()
      .forEach(d => {
        const dayLogs = mealLogs.filter(l => l.clientId === activeClient.id && l.date === d);
        const workoutBurn = activities
          .filter(a => a.clientId === activeClient.id && a.date === d)
          .reduce((sum, a) => sum + (Number(a.caloriesBurned) || 0), 0);
        const h = habits.find(item => item.clientId === activeClient.id && item.date === d);
        const stepBurn = calculateStepCalories(h?.steps || 0, activeClient.currentWeightKg);
        const bd = calculateCalorieBreakdown(dayLogs, workoutBurn + stepBurn);
        runningBalance += bd.netCalories - neededCal;
      });
    const kgVal = Math.abs(runningBalance / 8000).toFixed(1);
    const isGained = runningBalance >= 0;
    return {
      runningBalance,
      kgText: isGained ? `+${kgVal} kg` : `-${kgVal} kg`,
    };
  }, [activeClient, mealLogs, activities, habits]);

  const handleLauncherAction = (key: string) => {
    switch (key) {
      case 'log-meal':
        openLogForSlot(currentCircadianMeal.slot || 'Breakfast');
        break;
      case 'morning-weight':
        setIsQuickWeightModalOpen(true);
        break;
      case 'hydration':
        setIsHydrationModalOpen(true);
        break;
      case 'workout':
        setIsActivityModalOpen(true);
        break;
      case 'appointments':
        setIsAppointmentsModalOpen(true);
        break;
      case 'meal-diary':
        setActiveViewPanel(prev => prev === 'meals' ? null : 'meals');
        break;
      case 'trajectory':
        setIsTrajectoryProjected(prev => !prev);
        break;
      case 'profile':
        setActiveViewPanel(prev => prev === 'profile' ? null : 'profile');
        break;
      case 'diet-plan':
        setActiveViewPanel(prev => prev === 'plan' ? null : 'plan');
        break;
      case 'progress':
        setActiveViewPanel(prev => prev === 'progress' ? null : 'progress');
        break;
      case 'app-tour':
        setIsTourModalOpen(true);
        break;
      case 'more':
        setActiveViewPanel(prev => prev === 'more' ? null : 'more');
        break;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5">

      {/* ================= 1. CLEAN COMPACT CLIENT HERO & LIVE CALORIE SNAPSHOT ================= */}
      <div className="bg-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-sm border border-emerald-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">

          {/* Left: Identity + Clean Unboxed Metadata */}
          <div className="flex items-center gap-4 min-w-0">
            <img
              src={activeClient.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
              alt={activeClient.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400/50 shrink-0"
            />
            <div className="min-w-0">
              <h1 className="font-bold text-white text-lg sm:text-2xl tracking-tight truncate">
                {t(`Welcome, ${activeClient.name}`)}
              </h1>
              <div className="text-xs sm:text-sm text-emerald-200 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 tabular-nums">
                <span className="text-emerald-300 font-semibold">
                  {t(activeClient.status === 'active' ? 'Active' : 'Inactive')}
                </span>
                <span aria-hidden="true" className="text-emerald-600">·</span>
                <span>{t('Goal')}: <b className="text-white">{activeClient.goal}</b></span>
                <span aria-hidden="true" className="text-emerald-600">·</span>
                <span>{activeClient.currentWeightKg} kg → <b className="text-white">{activeClient.targetWeightKg} kg</b></span>
              </div>
              <div className="text-xs text-emerald-300/90 mt-1 flex flex-wrap items-center gap-x-2">
                <span>{t('Coach')}: <b className="text-white">{assignedDietitian.name}</b></span>
                <span aria-hidden="true" className="text-emerald-700">·</span>
                <span className="font-mono">{assignedDietitian.phone}</span>
              </div>
            </div>
          </div>

          {/* Right: Live Calorie Balance + Notification Bell Icon */}
          <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-emerald-800/70">
            <div className="text-left md:text-right tabular-nums">
              <span className="text-[11px] font-semibold text-emerald-300 block">
                {t('Daily Calorie Budget')} ({formatDateDisplay(selectedDate)})
              </span>
              <div className="flex items-baseline md:justify-end gap-1.5 mt-0.5">
                <span className={`text-2xl sm:text-3xl font-black ${isCalorieGreen ? 'text-lime-400' : 'text-amber-300'}`}>
                  {netCalories}
                </span>
                <span className="text-xs sm:text-sm text-emerald-200 font-medium">
                  / {targetCalories} kcal
                </span>
              </div>
              <div className="w-40 md:ml-auto bg-emerald-900 h-2 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${isCalorieGreen ? 'bg-lime-400' : 'bg-amber-400'}`}
                  style={{ width: `${Math.min(100, Math.max(4, caloriesPercent))}%` }}
                />
              </div>
            </div>

            {/* Notification Bell Icon Button (Houses Coach Reminders & Phone Alert Schedule) */}
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(true)}
              className="w-13 h-13 aspect-square rounded-2xl bg-emerald-900 hover:bg-emerald-800 border border-emerald-700/80 text-white flex flex-col items-center justify-center relative transition-colors cursor-pointer shrink-0"
              title={t('Notifications & Coach Reminders')}
            >
              <Bell className="w-5 h-5 text-amber-300" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-emerald-950 tabular-nums">
                  {unreadAlertsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {nextAppointment && (
          <div className="mt-4 pt-3 border-t border-emerald-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-200">
            <span>
              {t('Next Appointment')}: <b className="text-white capitalize">{nextAppointment.type.replace('_', ' ')}</b> · {nextAppointment.date} · {nextAppointment.time}
            </span>
            <button
              type="button"
              onClick={() => setIsAppointmentsModalOpen(true)}
              className="text-lime-300 hover:text-white font-semibold underline cursor-pointer"
            >
              {t('View Details')}
            </button>
          </div>
        )}
      </div>

      {/* Feedback Banner */}
      {planLoggedNotice && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm px-4 py-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold">{planLoggedNotice}</span>
        </div>
      )}

      {/* ================= 1.5 ALWAYS-PROJECTED 8,000 KCAL WEIGHT TRAJECTORY ABOVE ICONS ================= */}
      {isTrajectoryProjected ? (
        <CalorieWeightTrajectoryCard
          client={activeClient}
          mealLogs={mealLogs}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onOpenLogModal={openLogForSlot}
          onToggleHide={() => setIsTrajectoryProjected(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsTrajectoryProjected(true)}
          className="w-full bg-white dark:bg-slate-900 hover:bg-emerald-50/70 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 transition-all cursor-pointer group"
          title={t('8,000 kcal Projection')}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 aspect-square rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Scale className="w-5 h-5" />
            </div>
            <div className="text-left min-w-0">
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {t('8,000 kcal Projection')} · <span className="text-emerald-700 dark:text-emerald-400 tabular-nums">{trajectoryMiniSummary.kgText}</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate tabular-nums">
                {trajectoryMiniSummary.runningBalance > 0 ? `+${trajectoryMiniSummary.runningBalance}` : trajectoryMiniSummary.runningBalance} kcal · {t('Tap to open')}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">{t('Tap to open')}</span>
          </div>
        </button>
      )}

      {/* ================= 2. CLEAN SQUARE ICON APP LAUNCHER GRID ================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-5">
        {/* Subtle Single-Line Toolbar: Date Switcher & Meal Window Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => changeDateBy(-1)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(getTodayString())}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>{formatDateDisplay(selectedDate)}</span>
            </button>
            <button
              type="button"
              onClick={() => changeDateBy(1)}
              disabled={selectedDate >= getTodayString()}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
            <span className="hidden sm:inline">
              {t('Next Window')}: <b className="text-slate-900 dark:text-slate-100">{t(currentCircadianMeal.slot)} ({currentCircadianMeal.targetTime})</b>
            </span>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-nutribot'))}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
            >
              <Bot className="w-4 h-4" />
              <span>{t('Ask NutriAI')}</span>
            </button>
          </div>
        </div>

        {/* 12 Crisp Square Icon Tiles with Names Centered Below */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 sm:gap-5 pt-1">
          {[
            {
              key: 'log-meal',
              label: t('Log Meal'),
              icon: Utensils,
              bg: 'bg-emerald-600 text-white hover:bg-emerald-700',
              active: false,
            },
            {
              key: 'morning-weight',
              label: t('Morning Weight'),
              icon: Scale,
              bg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-600 hover:text-white',
              active: false,
            },
            {
              key: 'hydration',
              label: t('Daily Hydration'),
              icon: Droplets,
              bg: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-600 hover:text-white',
              active: isHydrationModalOpen,
            },
            {
              key: 'workout',
              label: t('Log Workout'),
              icon: Dumbbell,
              bg: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 hover:bg-orange-600 hover:text-white',
              active: false,
            },
            {
              key: 'appointments',
              label: t('Appointments'),
              icon: CalendarCheck,
              bg: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-600 hover:text-white',
              active: false,
            },
            {
              key: 'meal-diary',
              label: t('Meal Diary'),
              icon: ClipboardList,
              bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-700 hover:text-white',
              active: activeViewPanel === 'meals',
              badge: clientLogsForDay.length > 0 ? clientLogsForDay.length : undefined,
            },
            {
              key: 'trajectory',
              label: t('8,000 kcal'),
              icon: Flame,
              bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-500 hover:text-white',
              active: isTrajectoryProjected,
            },
            {
              key: 'profile',
              label: t('Coach & Profile'),
              icon: User,
              bg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-600 hover:text-white',
              active: activeViewPanel === 'profile',
            },
            {
              key: 'diet-plan',
              label: t('Diet Plan'),
              icon: CalendarDays,
              bg: 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-600 hover:text-white',
              active: activeViewPanel === 'plan',
            },
            {
              key: 'progress',
              label: t('Progress'),
              icon: ChartIcon,
              bg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-600 hover:text-white',
              active: activeViewPanel === 'progress',
            },
            {
              key: 'app-tour',
              label: t('App Tour'),
              icon: Compass,
              bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-800 hover:text-white',
              active: false,
            },
            {
              key: 'more',
              label: t('More Tools'),
              icon: LayoutGrid,
              bg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-800 hover:text-white',
              active: activeViewPanel === 'more',
              badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined,
            },
          ].map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleLauncherAction(item.key)}
                className="flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
              >
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 aspect-square rounded-2xl flex items-center justify-center relative transition-all duration-150 group-active:scale-95 ${
                    item.active
                      ? 'bg-emerald-800 text-white ring-4 ring-emerald-200 dark:ring-emerald-900 shadow-sm'
                      : item.bg
                  }`}
                >
                  <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2]" />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-slate-900 tabular-nums">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs font-bold text-center leading-tight transition-colors ${
                  item.active ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-950 dark:group-hover:text-white'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Compact Phone OS Steps & Sleep Sync Strip (auto-syncs mobile OS motion + sleep on login) */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-slate-700 dark:text-slate-300 tabular-nums">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-[11px]">
              <Smartphone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{osHealthInfo.osLabel}</span>
            </span>
            <span className="flex items-center gap-1.5 font-semibold">
              <Footprints className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
              <span>{(dayHabit?.steps || 0).toLocaleString()} {t('steps')}</span>
              <span className="text-orange-700 dark:text-orange-400 font-bold">(-{stepCaloriesToday} kcal)</span>
              {isPedometerLive && (
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  · {language === 'ml' ? 'ലൈവ് OS സിങ്ക്' : 'Live OS Sync'}
                </span>
              )}
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
            <span className="flex items-center gap-1.5 font-semibold">
              <Moon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>{dayHabit?.sleepHours ?? 7} {t('hours')} {language === 'ml' ? 'ഉറക്കം' : 'sleep'}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {osHealthInfo.os === 'ios' && osHealthInfo.requiresPermissionPrompt && !isPedometerLive && (
              <button
                type="button"
                onClick={enableMobilePedometer}
                className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>
                  {pedometerPermissionState === 'denied'
                    ? t('Sensor Blocked')
                    : t('Enable iPhone Step Sensor')}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setActiveViewPanel('more');
                setActiveMoreSubPanel('habits');
              }}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{language === 'ml' ? 'ചുവടുകളും ഉറക്കവും മാറ്റുക' : 'Edit Steps & Sleep'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= 3. ON-DEMAND EXPANDED VIEWS (SHOWN ONLY WHEN ICON PRESSED) ================= */}

      {/* A) COACH & PROFILE PANEL (UPPER PAGE LAUNCHER) */}
      {activeViewPanel === 'profile' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{t('Coach & Profile')}</span>
            </h2>
            <button
              type="button"
              onClick={() => setActiveViewPanel(null)}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('Back')}</span>
            </button>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('Your Profile')}</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
                  <span className="text-slate-400 block text-xs">{t('Height')}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-base tabular-nums">{activeClient.heightCm} cm</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
                  <span className="text-slate-400 block text-xs">{t('Age')}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-base tabular-nums">{activeClient.age} yrs</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
                  <span className="text-slate-400 block text-xs">{t('BMI')}</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 text-base tabular-nums">
                    {(activeClient.currentWeightKg / ((activeClient.heightCm / 100) ** 2)).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('Assigned Wellness Coach')}</h3>
              <div className="flex items-start gap-3">
                <img
                  src={assignedDietitian.avatarUrl || 'https://images.unsplash.com/photo-1594824813637-27a3a93d4895?auto=format&fit=crop&q=80&w=250'}
                  alt={assignedDietitian.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{assignedDietitian.name}</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">{assignedDietitian.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{assignedDietitian.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* B) MORE TOOLS SQUARE SUB-LAUNCHER */}
      {activeViewPanel === 'more' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('Additional Health Tools & Profile')}</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveViewPanel(null);
                  setActiveMoreSubPanel(null);
                }}
                className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('Close')}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4">
              <button
                type="button"
                onClick={() => openCalorieGuide('what-is-calorie')}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-16 h-16 aspect-square rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center transition-colors">
                  <Flame className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">{t('Calorie 101')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsNotificationsOpen(true)}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-16 h-16 aspect-square rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 group-hover:bg-rose-600 group-hover:text-white flex items-center justify-center relative transition-colors">
                  <BellRing className="w-6 h-6" />
                  {unreadAlertsCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-slate-900 tabular-nums">
                      {unreadAlertsCount}
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">{t('Notifications')}</span>
              </button>

              <button
                type="button"
                onClick={toggleLanguage}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className={`w-16 h-16 aspect-square rounded-2xl flex items-center justify-center transition-colors ${
                  language === 'ml'
                    ? 'bg-emerald-700 text-white ring-4 ring-emerald-200 dark:ring-emerald-900'
                    : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 group-hover:bg-indigo-600 group-hover:text-white'
                }`}>
                  <Languages className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">
                  {language === 'ml' ? 'English-ലേക്ക് മാറ്റുക' : 'മലയാളം / EN'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMoreSubPanel(prev => prev === 'habits' ? null : 'habits')}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className={`w-16 h-16 aspect-square rounded-2xl flex items-center justify-center transition-colors ${
                  activeMoreSubPanel === 'habits' ? 'bg-amber-600 text-white' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 group-hover:bg-amber-600 group-hover:text-white'
                }`}>
                  <Activity className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">{t('Daily Habits')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsClinicalGuideOpen(true)}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-16 h-16 aspect-square rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 group-hover:bg-teal-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">{t('Food Rules')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPrintModalOpen(true)}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-16 h-16 aspect-square rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 group-hover:bg-slate-800 group-hover:text-white flex items-center justify-center transition-colors">
                  <Printer className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">{t('Print Report')}</span>
              </button>

              <button
                type="button"
                onClick={() => clientSignOut()}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-16 h-16 aspect-square rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 group-hover:bg-rose-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <LogOut className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">{t('Sign Out')}</span>
              </button>
            </div>
          </div>

          {activeMoreSubPanel === 'habits' && <DailyHabitsCard />}
        </div>
      )}

      {/* ================= C) MEAL DIARY & CALORIE BREAKDOWN PANEL ================= */}
      {activeViewPanel === 'meals' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>{t('Meal Diary & Macro Breakdown')} · {formatDateDisplay(selectedDate)}</span>
            </h2>
            <button
              type="button"
              onClick={() => setActiveViewPanel(null)}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('Back')}</span>
            </button>
          </div>

          {/* 1-Tap Quick Common Kerala Staples Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-100">
                ⚡ {language === 'ml' ? `${t(currentCircadianMeal.slot)}-ലേക്ക് ഒറ്റ ടാപ്പിൽ ചേർക്കുക:` : `1-Tap Quick Staples into ${t(currentCircadianMeal.slot)}:`}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'ml' ? 'ഉചിത സമയം:' : 'Recommended:'} {currentCircadianMeal.window}
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogStaple('2 Boiled Eggs', 140, 12, 1, 10, 'pieces')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:text-emerald-900 dark:hover:text-emerald-200 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                🥚 {tf('2 Boiled Eggs')} (140k)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogStaple('2 Appam (Kerala Rice Pancake)', 240, 4, 52, 2, 'pieces')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:text-emerald-900 dark:hover:text-emerald-200 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                🫓 {tf('2 Appam')} (240k)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogStaple('Oats with Skimmed Milk', 180, 8, 30, 3, 'bowl')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:text-emerald-900 dark:hover:text-emerald-200 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                🥣 {tf('Oats')} (180k)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogStaple('Kerala Matta Rice + Ayala Curry', 380, 24, 45, 10, 'plate')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:text-emerald-900 dark:hover:text-emerald-200 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                🍛 {tf('Kerala Matta Rice + Ayala Curry')} (380k)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogStaple('Black Tea / Coffee (No Sugar)', 5, 0, 1, 0, 'cup')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:text-emerald-900 dark:hover:text-emerald-200 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                ☕ {tf('Black Tea')} (5k)
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xs border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-amber-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {t('Daily Calorie Balance & Targets')}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1 flex-wrap tabular-nums">
                      <span className={`text-3xl sm:text-4xl font-black ${isCalorieGreen ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {netCalories}
                      </span>
                      <span className="text-sm sm:text-base font-semibold text-slate-500 dark:text-slate-400">
                        {language === 'ml' ? `നെറ്റ് / ${targetCalories} kcal (ലക്ഷ്യം)` : `Net / ${targetCalories} kcal (Target)`}
                      </span>
                    </div>
                  </div>
                  <div className="text-right tabular-nums">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                      {isWeightLossGoal ? t('Deficit Remaining') : t('Calorie Surplus Needed')}
                    </span>
                    <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">{caloriesRemaining} kcal</span>
                  </div>
                </div>

                  {/* USER MANDATE: Good Calories vs Bad Calories Columns + Burned Calories Minus Calculation */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {/* Column 1: Total Consumed */}
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400 block">
                        {t('Total Food Eaten')}
                      </span>
                      <div className="text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5 tabular-nums">
                        {calorieBreakdown.totalCalories} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">kcal</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{t('Gross food intake')}</span>
                    </div>

                    {/* Column 2: Good Calories */}
                    <div className="bg-emerald-50/70 dark:bg-emerald-950/50 rounded-2xl p-3 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-black tracking-wider text-emerald-900 dark:text-emerald-300 block">
                          🍏 {t('Good Calories')}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                          {calorieBreakdown.totalCalories > 0 ? Math.round((calorieBreakdown.goodCalories / calorieBreakdown.totalCalories) * 100) : 0}%
                        </span>
                      </div>
                      <div className="text-lg font-black text-emerald-800 dark:text-emerald-300 mt-0.5 tabular-nums">
                        {calorieBreakdown.goodCalories} <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400">kcal</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">{t('Wholesome & Nutritious')}</span>
                    </div>

                    {/* Column 3: Bad Calories */}
                    <div className="bg-amber-50/70 dark:bg-amber-950/50 rounded-2xl p-3 border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-black tracking-wider text-amber-900 dark:text-amber-300 block">
                          🍟 {t('Bad Calories')}
                        </span>
                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 tabular-nums">
                          {calorieBreakdown.totalCalories > 0 ? Math.round((calorieBreakdown.badCalories / calorieBreakdown.totalCalories) * 100) : 0}%
                        </span>
                      </div>
                      <div className="text-lg font-black text-amber-900 dark:text-amber-200 mt-0.5 tabular-nums">
                        {calorieBreakdown.badCalories} <span className="text-xs font-normal text-amber-700 dark:text-amber-400">kcal</span>
                      </div>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 block mt-0.5">{t('Fried / Refined / Treats')}</span>
                    </div>

                    {/* Column 4: Calories Burned (Workouts + OS Walking Steps) */}
                    <div className="bg-blue-50/70 dark:bg-blue-950/50 rounded-2xl p-3 border border-blue-200 dark:border-blue-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-black tracking-wider text-blue-900 dark:text-blue-300 block">
                            ⚽ {t('Calorie Burn')}
                          </span>
                          <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400">
                            {t('Exercise')}
                          </span>
                        </div>
                        <div className="text-lg font-black text-blue-800 dark:text-blue-300 mt-0.5 tabular-nums">
                          -{calorieBreakdown.caloriesBurned} <span className="text-xs font-normal text-blue-600 dark:text-blue-400">kcal</span>
                        </div>
                        <span className="text-[10px] text-blue-700 dark:text-blue-400 block mt-0.5 tabular-nums">
                          {language === 'ml'
                            ? `വ്യായാമം: -${workoutBurnToday} · നടപ്പ്: -${stepCaloriesToday}`
                            : `Workout: -${workoutBurnToday} · Steps: -${stepCaloriesToday}`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsActivityModalOpen(true)}
                        className="mt-2 text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-2 py-1 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        title={language === 'ml' ? 'വ്യായാമം അല്ലെങ്കിൽ കായികവിനോദം ചേർക്കുക' : 'Log Football, Workout, Gym, or Walking to minus calories burned'}
                      >
                        <Plus className="w-3 h-3" />
                        <span>{t('Log Burn (e.g. Football)')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Dual Split Calorie Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold flex-wrap gap-1 tabular-nums">
                      <span>
                        {language === 'ml'
                          ? `കലോറി മീറ്റർ: ${calorieBreakdown.goodCalories} നല്ലത് + ${calorieBreakdown.badCalories} മോശം - ${calorieBreakdown.caloriesBurned} കത്തിച്ചത് = `
                          : `Calorie Meter: ${calorieBreakdown.goodCalories} good + ${calorieBreakdown.badCalories} bad - ${calorieBreakdown.caloriesBurned} burned = `}
                        <b className="text-slate-800 dark:text-slate-200">{netCalories} {language === 'ml' ? 'നെറ്റ് kcal' : 'net kcal'}</b>
                      </span>
                      <span>{language === 'ml' ? 'ലക്ഷ്യം' : 'Target'}: {targetCalories} kcal</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden p-0.5 flex">
                      {/* Good Calories Segment */}
                      <div
                        className="bg-emerald-600 h-full rounded-l-full transition-all duration-500"
                        style={{ width: `${targetCalories > 0 ? Math.min(100, (calorieBreakdown.goodCalories / targetCalories) * 100) : 0}%` }}
                        title={`${t('Good Calories')}: ${calorieBreakdown.goodCalories} kcal`}
                      />
                      {/* Bad Calories Segment */}
                      <div
                        className="bg-amber-500 h-full transition-all duration-500"
                        style={{ width: `${targetCalories > 0 ? Math.min(100, (calorieBreakdown.badCalories / targetCalories) * 100) : 0}%` }}
                        title={`${t('Bad Calories')}: ${calorieBreakdown.badCalories} kcal`}
                      />
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap tabular-nums">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                        {language === 'ml' ? 'നല്ലത്' : 'Good'} ({calorieBreakdown.goodCalories} kcal)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                        {language === 'ml' ? 'മോശം' : 'Bad'} ({calorieBreakdown.badCalories} kcal)
                      </span>
                      {calorieBreakdown.caloriesBurned > 0 && (
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                          {language === 'ml' ? 'കത്തിച്ചത്' : 'Burned'} (-{calorieBreakdown.caloriesBurned} kcal)
                        </span>
                      )}
                    </div>
                  </div>

                {/* Macronutrient breakdown cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {/* Protein */}
                  <div className="bg-slate-50/80 dark:bg-slate-800 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-700">
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Dumbbell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        {t('Protein')}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        {Math.round((consumedTotals.protein / targetProtein) * 100)}%
                      </span>
                    </div>
                    <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
                      {consumedTotals.protein} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ {targetProtein}g</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, (consumedTotals.protein / targetProtein) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Carbs */}
                  <div className="bg-slate-50/80 dark:bg-slate-800 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-700">
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Wheat className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        {t('Carbohydrates')}
                      </span>
                      <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 tabular-nums">
                        {Math.round((consumedTotals.carbs / targetCarbs) * 100)}%
                      </span>
                    </div>
                    <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
                      {consumedTotals.carbs} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ {targetCarbs}g</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, (consumedTotals.carbs / targetCarbs) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Fat */}
                  <div className="bg-slate-50/80 dark:bg-slate-800 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-700">
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Droplets className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        {t('Healthy Fats')}
                      </span>
                      <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 tabular-nums">
                        {Math.round((consumedTotals.fat / targetFat) * 100)}%
                      </span>
                    </div>
                    <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
                      {consumedTotals.fat} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ {targetFat}g</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-amber-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, (consumedTotals.fat / targetFat) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Net Calorie & Exercise Burn Row */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 tabular-nums">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span>{t('Activity Burn:')}</span>
                      <span className="text-orange-600 dark:text-orange-400 font-extrabold">-{caloriesBurnedToday} kcal</span>
                    </div>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <span>{t('Net Energy:')}</span>
                      <span className="text-emerald-800 dark:text-emerald-400 font-extrabold">{netCalories} kcal</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsActivityModalOpen(true)}
                    className="text-xs font-bold text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/60 hover:bg-orange-100 dark:hover:bg-orange-900/60 px-3 py-1.5 rounded-xl border border-orange-200 dark:border-orange-800 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>
                      {workoutBurnToday > 0
                        ? (language === 'ml' ? `${clientActivitiesForDay.length} വ്യായാമങ്ങൾ ചേർത്തു` : `${clientActivitiesForDay.length} Workouts Logged`)
                        : t('Log Workout / Burn')}
                    </span>
                  </button>
                </div>
                </div>

              {/* Suggested Meals from AI Chatbot */}
              {pendingSuggestions.length > 0 && (
                <div className="bg-linear-to-br from-emerald-50 via-teal-50/70 to-amber-50/50 dark:from-emerald-950/60 dark:via-slate-900 dark:to-amber-950/40 rounded-3xl p-5 sm:p-6 shadow-sm border-2 border-emerald-300/90 dark:border-emerald-700 space-y-4">

                  <div className="space-y-3">
                    {pendingSuggestions.map((sugg) => (
                      <div
                        key={sugg.id}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-4 border-2 border-emerald-200 dark:border-emerald-800 shadow-xs space-y-3"
                      >
                        {/* Suggestion Top Banner */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-emerald-700 text-white text-xs font-black rounded-lg">
                              {t(sugg.mealType)}
                            </span>
                            <span className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              {language === 'ml' ? 'കഴിച്ച സമയം:' : 'Eaten at:'} <strong className="text-slate-900 dark:text-white">{sugg.timeGiven}</strong>
                            </span>
                          </div>

                          {/* Total calories badge */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-amber-950 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 px-2.5 py-1 rounded-lg flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <strong>{language === 'ml' ? 'ആകെ' : 'Total'}: {sugg.totalCalories} kcal</strong>
                            </span>
                          </div>
                        </div>

                        {/* Each food's calories listed FIRST */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                            {language === 'ml' ? 'ഓരോ ഭക്ഷണത്തിന്റെയും കലോറി:' : "Each Food's Calories (Check First):"}
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {sugg.foods.map((food, fIdx) => (
                              <div
                                key={fIdx}
                                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                              >
                                <div>
                                  <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs block">{tf(food.name)}</span>
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                    {food.quantity}x ({food.servingUnit})
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="font-black text-amber-950 dark:text-amber-200 text-xs bg-amber-100/90 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                                    <Flame className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                    {food.calories} kcal
                                  </span>
                                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                    P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Accept or Dismiss Buttons */}
                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => dismissSuggestedMeal(sugg.id)}
                            className="px-3 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                          >
                            {t('Dismiss')}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              acceptSuggestedMeal(sugg.id);
                              setPlanLoggedNotice(
                                language === 'ml'
                                  ? `${t(sugg.mealType)}-ലേക്ക് എല്ലാ വിഭവങ്ങളും ചേർത്തു!`
                                  : `Accepted & logged all items into ${sugg.mealType}!`
                              );
                              setTimeout(() => setPlanLoggedNotice(null), 3500);
                            }}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>{language === 'ml' ? `${t(sugg.mealType)}-ൽ ചേർക്കുക` : `Accept & Add to ${sugg.mealType}`}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Today's Meals Timeline Cards */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t("Today's Meals Timeline")}</span>
                  </h2>
                  {confirmResetMeals ? (
                    <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 px-3 py-1.5 rounded-xl text-xs">
                      <span className="font-bold text-amber-900 dark:text-amber-200">
                        {language === 'ml' ? 'ഇന്നലത്തെ ഭക്ഷണം പോലെ ആക്കണോ?' : "Copy yesterday's meals?"}
                      </span>
                      <button
                        type="button"
                        onClick={handleResetMealsToDayBefore}
                        className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
                      >
                        {language === 'ml' ? 'ഉറപ്പ്' : 'Confirm'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmResetMeals(false)}
                        className="px-2 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                      >
                        {t('Cancel')}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmResetMeals(true)}
                      disabled={isResettingMeals}
                      title={language === 'ml' ? 'ഇന്നത്തെ ഭക്ഷണ ലിസ്റ്റ് ഇന്നലത്തേതുപോലെ ആക്കുക' : 'Reset your food log for this date to exactly what you had typed the day before'}
                      className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 hover:text-amber-900 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 px-3 py-1.5 rounded-xl transition-all cursor-pointer border border-amber-200 dark:border-amber-800 shadow-2xs disabled:opacity-50 self-start sm:self-auto"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 text-amber-600 dark:text-amber-400 ${isResettingMeals ? 'animate-spin' : ''}`} />
                      <span>{isResettingMeals ? (language === 'ml' ? 'റീസെറ്റ് ചെയ്യുന്നു...' : 'Resetting...') : t("Reset to Yesterday's Foods")}</span>
                    </button>
                  )}
                </div>

                  {resetFeedbackNotice && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                      <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>{resetFeedbackNotice}</span>
                    </div>
                  )}

                  {(['Breakfast', 'Morning Snack', 'Lunch', 'Evening Snack', 'Dinner'] as MealType[]).map((slot) => {
                    const itemsInSlot = clientLogsForDay.filter(m => m.mealType === slot);
                    const slotBreakdown = calculateCalorieBreakdown(itemsInSlot);
                    const slotSuggestions = pendingSuggestions.filter(s => s.mealType === slot);
                    const isSlotOpen = openMealSlots[slot] ?? true;

                    return (
                      <div key={slot} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xs border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div 
                            onClick={() => toggleMealSlot(slot)}
                            className="flex items-center gap-2.5 cursor-pointer group select-none flex-wrap"
                            title={`Click to ${isSlotOpen ? 'collapse' : 'expand'} ${slot}`}
                          >
                            <span className="p-1 rounded-md text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                              {isSlotOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{t(slot)}</span>
                            {slotBreakdown.totalCalories > 0 ? (
                              <div className="flex items-center gap-2 flex-wrap tabular-nums text-xs">
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  {slotBreakdown.totalCalories} kcal
                                </span>
                                {slotBreakdown.goodCalories > 0 && (
                                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                                    · 🍏 {slotBreakdown.goodCalories}
                                  </span>
                                )}
                                {slotBreakdown.badCalories > 0 && (
                                  <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400">
                                    · 🍟 {slotBreakdown.badCalories}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">0 kcal</span>
                            )}
                            <span className="text-[11px] text-slate-400 hidden sm:inline">
                              ({itemsInSlot.length})
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openLogForSlot(slot)}
                              className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{t('Log Food')}</span>
                            </button>
                          </div>
                        </div>

                        {/* Collapsible content */}
                        {isSlotOpen && (
                          <div className="pt-2 space-y-2">
                            {/* Slot-specific pending suggestions */}
                            {slotSuggestions.length > 0 && (
                              <div className="my-2.5 space-y-2">
                                {slotSuggestions.map((sugg) => (
                                  <div
                                    key={sugg.id}
                                    className="p-3 bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                                  >
                                    <div className="flex items-start gap-2">
                                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                                      <div>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="text-xs font-black text-emerald-950 dark:text-emerald-200">
                                            {language === 'ml' ? `AI നിർദ്ദേശം (${sugg.timeGiven})` : `AI Suggestion (Eaten at ${sugg.timeGiven})`}
                                          </span>
                                          <span className="text-[10px] font-extrabold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/70 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-700">
                                            🔥 {sugg.totalCalories} kcal
                                          </span>
                                        </div>
                                        <div className="text-xs text-slate-700 dark:text-slate-300 mt-1 flex flex-wrap items-center gap-1.5">
                                          {sugg.foods.map((f, i) => (
                                            <span key={i} className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-700 text-slate-900 dark:text-slate-100 font-medium text-[11px]">
                                              <strong className="font-bold">{tf(f.name)}</strong>: <strong className="text-amber-700 dark:text-amber-400">{f.calories} kcal</strong>
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          acceptSuggestedMeal(sugg.id);
                                          setPlanLoggedNotice(
                                            language === 'ml'
                                              ? `${t(slot)} ഭക്ഷണം ഡയറിയിൽ ചേർത്തു!`
                                              : `Added ${slot} items to your daily diary!`
                                          );
                                          setTimeout(() => setPlanLoggedNotice(null), 3500);
                                        }}
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>{language === 'ml' ? `${t(slot)}-ൽ ചേർക്കുക` : `Add to ${slot}`}</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => dismissSuggestedMeal(sugg.id)}
                                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                                        title={t('Dismiss')}
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Logged food items list */}
                            {itemsInSlot.length > 0 ? (
                              <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-1">
                                {itemsInSlot.map((item) => {
                                  const itemQuality = item.calorieQuality || determineCalorieQuality(item.foodName);
                                  const itemAudit = classifyFoodItem(item.foodName);
                                  return (
                                    <div key={item.id} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                                      <div>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="font-bold text-slate-800 dark:text-slate-100">{tf(item.foodName)}</span>
                                          {itemAudit.isProblemFood ? (
                                            <span 
                                              className="text-[10px] font-bold text-rose-700 dark:text-rose-400"
                                              title={`${itemAudit.tierLabel}: ${itemAudit.clinicalReason}`}
                                            >
                                              · 🛑 {itemAudit.tier === 'strict_avoid' ? (language === 'ml' ? 'ഒഴിവാക്കേണ്ടത്' : 'Strict Avoid') : itemAudit.tier === 'once_twice_month' ? (language === 'ml' ? 'മാസത്തിൽ 1-2 തവണ' : '1-2x / Month') : (language === 'ml' ? 'ആഴ്ചയിൽ 1-2 തവണ' : '1-2x / Week')}
                                            </span>
                                          ) : itemAudit.isSuperFood ? (
                                            <span 
                                              className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400"
                                              title={language === 'ml' ? 'സൂപ്പർഫുഡ്: ദിവസവും ധൈര്യമായി കഴിക്കാം' : 'Superfood: wholesome nutrition to eat freely'}
                                            >
                                              · 🥗 {language === 'ml' ? 'സൂപ്പർഫുഡ്' : 'Superfood'}
                                            </span>
                                          ) : null}
                                          {itemQuality === 'good' ? (
                                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                                              · 🍏 {t('Good Calories')}
                                            </span>
                                          ) : (
                                            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400">
                                              · 🍟 {t('Bad / Cheat Calories')}
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-2 tabular-nums">
                                          <span>{item.quantity}x ({item.servingUnit})</span>
                                          <span>•</span>
                                          <span className="text-emerald-700 dark:text-emerald-400 font-medium">P: {item.protein}g</span>
                                          <span>•</span>
                                          <span className="text-blue-700 dark:text-blue-400 font-medium">C: {item.carbs}g</span>
                                          <span>•</span>
                                          <span className="text-amber-700 dark:text-amber-400 font-medium">F: {item.fat}g</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm tabular-nums">{item.calories} kcal</span>
                                        <button
                                          type="button"
                                          onClick={() => deleteMealLog(item.id)}
                                          title={language === 'ml' ? 'ഭക്ഷണം നീക്കം ചെയ്യുക' : 'Remove food'}
                                          className="text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="py-4 text-center">
                                <p className="text-xs text-slate-400 italic mb-2">
                                  {language === 'ml'
                                    ? `${t(slot)}-ൽ ഇതുവരെ ഭക്ഷണം ചേർത്തിട്ടില്ല.`
                                    : `No foods logged yet for ${slot.toLowerCase()}.`}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => openLogForSlot(slot)}
                                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                                >
                                  {language === 'ml' ? '+ കഴിച്ച ഭക്ഷണം ചേർക്കാൻ ഇവിടെ തൊടുക' : '+ Click here to add what you ate'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= D) PERSONALIZED DIET PLAN PANEL ================= */}
      {activeViewPanel === 'plan' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{t('Diet Plan')}</span>
            </h2>
            <button
              type="button"
              onClick={() => setActiveViewPanel(null)}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('Back')}</span>
            </button>
          </div>

          {/* Plan Header Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xs border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  {language === 'ml' ? 'നിർദ്ദേശിച്ച ക്ലിനിക്കൽ ഡയറ്റ് പ്ലാൻ' : 'Prescribed Clinical Plan'}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{assignedPlan.title}</h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">{assignedPlan.description}</p>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{language === 'ml' ? `തയ്യാറാക്കിയത്: ${assignedDietitian.name}` : `Reviewed by ${assignedDietitian.name}`}</span>
              </div>
            </div>

            {/* Daily Nutrition Targets Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center tabular-nums">
              <div className="bg-amber-50/70 dark:bg-amber-950/50 p-4 rounded-2xl border border-amber-200/60 dark:border-amber-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">{language === 'ml' ? 'കലോറി ലക്ഷ്യം' : 'Calories Target'}</span>
                <span className="text-xl font-black text-amber-800 dark:text-amber-300">{assignedPlan.targetCalories} kcal</span>
              </div>
              <div className="bg-emerald-50/70 dark:bg-emerald-950/50 p-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">{language === 'ml' ? 'പ്രോട്ടീൻ ലക്ഷ്യം' : 'Protein Goal'}</span>
                <span className="text-xl font-black text-emerald-800 dark:text-emerald-300">{assignedPlan.targetProtein}g</span>
              </div>
              <div className="bg-blue-50/70 dark:bg-blue-950/50 p-4 rounded-2xl border border-blue-200/60 dark:border-blue-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">{t('Carbohydrates')}</span>
                <span className="text-xl font-black text-blue-800 dark:text-blue-300">{assignedPlan.targetCarbs}g</span>
              </div>
              <div className="bg-purple-50/70 dark:bg-purple-950/50 p-4 rounded-2xl border border-purple-200/60 dark:border-purple-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">{t('Daily Hydration')}</span>
                <span className="text-xl font-black text-purple-800 dark:text-purple-300">{assignedPlan.waterTargetLitres} {language === 'ml' ? 'ലിറ്റർ' : 'Litres'}</span>
              </div>
            </div>
          </div>

          {/* Meal Schedule Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedPlan.meals.map((m) => (
              <div key={m.mealType} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xs border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{t(m.mealType)}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">({m.timeGuideline})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLogPlannedMeal(m.mealType)}
                      className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-3 py-1 rounded-xl transition-colors cursor-pointer"
                    >
                      {language === 'ml' ? '+ പ്ലാനിൽ നിന്ന് ചേർക്കുക' : '+ Quick Log from Plan'}
                    </button>
                  </div>

                  {m.instructions && (
                    <p className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/40 px-3 py-2 rounded-xl mb-3 font-medium">
                      💡 {m.instructions}
                    </p>
                  )}

                  <div className="space-y-2">
                    {m.recommendedFoods.map((rf, idx) => (
                      <div key={idx} className="flex items-start justify-between text-xs sm:text-sm text-slate-700 dark:text-slate-300 py-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1"></span>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100">{tf(rf.foodName)}</span>
                            {rf.notes && <span className="text-xs text-slate-400 block italic">{rf.notes}</span>}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {rf.portion}x {rf.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dietitian Clinical Guidelines Card */}
          {assignedPlan.generalGuidelines && (
            <div className="bg-emerald-50 dark:bg-emerald-950/50 rounded-3xl p-6 border border-emerald-200 dark:border-emerald-800">
              <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {language === 'ml' ? 'കോച്ചിന്റെ പ്രത്യേക നിർദ്ദേശങ്ങൾ' : 'Coach Guidelines for You'}
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs sm:text-sm text-emerald-950 dark:text-emerald-100">
                {assignedPlan.generalGuidelines.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-emerald-200/50 dark:border-emerald-800">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ================= E) PROGRESS & MEASUREMENTS PANEL ================= */}
      {activeViewPanel === 'progress' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Header Strip & Back + Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('Body Composition & Progress History')}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('Track weight, BMI, body fat %, and centre device InBody scans')}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMeasurementModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm py-2 px-4 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{t('Record New Reading')}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveViewPanel(null)}
                className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('Back')}</span>
              </button>
            </div>
          </div>

          {/* Progress Overview Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xs border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">{t('Starting Weight')}</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {activeClient.startingWeightKg} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">kg</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xs border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/40 text-center">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block">{t('Current Weight')}</span>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                {activeClient.currentWeightKg} <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400">kg</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xs border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">{t('Target Goal')}</span>
              <div className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">
                {activeClient.targetWeightKg} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">kg</span>
              </div>
            </div>

            <div className="bg-emerald-600 text-white rounded-2xl p-4 shadow-2xs text-center flex flex-col justify-center">
              <span className="text-xs text-emerald-100 block">{t('Total Weight Lost')}</span>
              <div className="text-2xl font-black mt-0.5">
                🎉 {(activeClient.startingWeightKg - activeClient.currentWeightKg).toFixed(1)} kg
              </div>
            </div>
          </div>

          {/* Large Interactive Weight Trend Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xs border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('Weight Progression Timeline')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('Historical weigh-ins with goal marker')}</p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {language === 'ml' ? 'ലക്ഷ്യം' : 'Target'}: {activeClient.targetWeightKg} kg
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={clientMeasurements} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.25} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val) => val.slice(5)} 
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                  />
                  <YAxis 
                    domain={['dataMin - 1', 'dataMax + 1']} 
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', color: '#f8fafc', borderRadius: '12px', border: '1px solid #334155', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.2)' }}
                    formatter={(val: any) => [`${val} kg`, language === 'ml' ? 'ഭാരം' : 'Weight']}
                  />
                  <ReferenceLine 
                    y={activeClient.targetWeightKg} 
                    stroke="#10b981" 
                    strokeDasharray="4 4" 
                    label={{ value: t('Target Goal'), position: 'right', fill: '#10b981', fontSize: 11 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weightKg" 
                    stroke="#0ea5e9" 
                    strokeWidth={3} 
                    dot={{ r: 5, fill: '#0ea5e9', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Historical Logs & Centre Device Readings List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {t('Measurement Logs & Centre InBody Scans')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {clientMeasurements.slice().reverse().map((m) => (
                <div 
                  key={m.id} 
                  className={`rounded-2xl p-4 border transition-all ${
                    m.source === 'centre_device'
                      ? 'bg-blue-50/50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 shadow-2xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white text-base tabular-nums">{m.weightKg} kg</span>
                        {m.source === 'centre_device' ? (
                          <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            <span>· {language === 'ml' ? 'സെന്റർ ഇൻബോഡി സ്കാൻ' : 'Centre InBody Scan'}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                            · {language === 'ml' ? 'സ്വയം രേഖപ്പെടുത്തിയത്' : 'Home Self-Log'}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                        {m.date} · {language === 'ml' ? 'രേഖപ്പെടുത്തിയത്:' : 'Logged by'} {m.enteredBy}
                      </span>
                    </div>

                    {m.bodyFatPercentage && (
                      <div className="text-right bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200/70 dark:border-slate-700 tabular-nums">
                        <span className="text-[10px] text-slate-400 block font-semibold">{language === 'ml' ? 'ശരീര കൊഴുപ്പ്' : 'Body Fat'}</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{m.bodyFatPercentage}%</span>
                      </div>
                    )}
                  </div>

                  {(m.waistCm || m.muscleMassKg || m.visceralFatLevel) && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300 tabular-nums">
                      {m.waistCm && <span>{language === 'ml' ? 'അരവണ്ണം' : 'Waist'}: <b className="text-slate-900 dark:text-white">{m.waistCm} cm</b></span>}
                      {m.muscleMassKg && <span>{language === 'ml' ? 'പേശീബലം' : 'Muscle'}: <b className="text-slate-900 dark:text-white">{m.muscleMassKg} kg</b></span>}
                      {m.visceralFatLevel && <span>{language === 'ml' ? 'വിസറൽ ഫാറ്റ്' : 'Visceral Fat'}: <b className="text-slate-900 dark:text-white">Lvl {m.visceralFatLevel}</b></span>}
                    </div>
                  )}

                  {m.notes && (
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 italic bg-white/70 dark:bg-slate-800/70 p-2 rounded-xl border border-slate-100 dark:border-slate-700">
                      &ldquo;{m.notes}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Modals */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        client={activeClient}
        reminders={clientReminders}
        onToggleReminder={toggleReminder}
        tips={clientTips}
        logsForDay={clientLogsForDay}
        selectedDate={selectedDate}
        onQuickAction={(action, slot) => {
          if (action === 'log-meal') {
            openLogForSlot(slot || currentCircadianMeal.slot || 'Breakfast');
          } else if (action === 'hydration') {
            setIsHydrationModalOpen(true);
          } else if (action === 'weight') {
            setIsQuickWeightModalOpen(true);
          } else if (action === 'plan') {
            setActiveViewPanel('plan');
          } else if (action === 'clinical-rules') {
            setIsClinicalGuideOpen(true);
          }
        }}
      />

      <HydrationModal
        isOpen={isHydrationModalOpen}
        onClose={() => setIsHydrationModalOpen(false)}
      />

      <MealLogModal
        isOpen={isMealModalOpen}
        onClose={() => {
          setIsMealModalOpen(false);
        }}
        onReviewDay={() => {
          setIsMealModalOpen(false);
          setActiveViewPanel('meals');
        }}
        defaultMealType={activeMealTypeForLog}
      />

      <MeasurementModal
        isOpen={isMeasurementModalOpen}
        onClose={() => setIsMeasurementModalOpen(false)}
      />

      <QuickWeightModal
        isOpen={isQuickWeightModalOpen}
        onClose={() => setIsQuickWeightModalOpen(false)}
      />

      <ActivityLogModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
      />

      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />

      <AppointmentsModal
        isOpen={isAppointmentsModalOpen}
        onClose={() => setIsAppointmentsModalOpen(false)}
      />

      <CalorieKnowledgeModal
        isOpen={isCalorieGuideOpen}
        onClose={() => setIsCalorieGuideOpen(false)}
        client={activeClient}
        initialTab={calorieGuideTab}
      />

      <AppTourGuideModal
        isOpen={isTourModalOpen}
        onClose={() => setIsTourModalOpen(false)}
        onOpenCalorieGuide={() => setIsCalorieGuideOpen(true)}
        onOpenMealLog={() => openLogForSlot('Breakfast')}
      />

      <ClinicalFoodGuideModal
        isOpen={isClinicalGuideOpen}
        onClose={() => setIsClinicalGuideOpen(false)}
        clientName={activeClient.name}
      />
    </div>
  );
};
