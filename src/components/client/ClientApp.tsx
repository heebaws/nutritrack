import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MealLogModal } from './MealLogModal';
import { MeasurementModal } from './MeasurementModal';
import { CalorieWeightTrajectoryCard } from './CalorieWeightTrajectoryCard';
import { WaterTrackerCard } from './WaterTrackerCard';
import { DailyHabitsCard } from './DailyHabitsCard';
import { ActivityLogModal } from './ActivityLogModal';
import { QuickWeightModal } from './QuickWeightModal';
import { PrintReportModal } from '../common/PrintReportModal';
import { AppointmentsModal } from '../common/AppointmentsModal';
import { LoginPortal } from '../common/LoginPortal';
import { CalorieKnowledgeModal } from './CalorieKnowledgeModal';
import { AppTourGuideModal } from './AppTourGuideModal';
import { ClinicalFoodGuideModal } from './ClinicalFoodGuideModal';
import { MealType } from '../../types';
import { calculateCalorieBreakdown, determineCalorieQuality } from '../../utils/calorieQuality';
import { CoachClinicalAlertsCard } from './CoachClinicalAlertsCard';
import { classifyFoodItem } from '../../utils/clinicalFoodAudit';
import { NutriTrackLogo } from '../common/NutriTrackLogo';
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
  ArrowRight
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
    appointments,
    resetClientDayMealsToDayBefore,
    foods
  } = useApp();

  // Active website navigation tab
  const [activeTab, setActiveTab] = useState<'today' | 'plan' | 'progress' | 'tips' | 'profile'>('today');

  // Listen to navigation from chatbot
  useEffect(() => {
    const handleNavToMeals = (e: any) => {
      setActiveTab('today');
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
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isAppointmentsModalOpen, setIsAppointmentsModalOpen] = useState(false);
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
  const [resetFeedbackNotice, setResetFeedbackNotice] = useState<string | null>(null);

  // Friendly Orientation state
  const [isOrientationDismissed, setIsOrientationDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nutritrack_orientation_dismissed') === 'true';
    } catch (e) {
      return false;
    }
  });

  const dismissOrientation = () => {
    setIsOrientationDismissed(true);
    try {
      localStorage.setItem('nutritrack_orientation_dismissed', 'true');
    } catch (e) {}
  };

  const showOrientation = () => {
    setIsOrientationDismissed(false);
    try {
      localStorage.removeItem('nutritrack_orientation_dismissed');
    } catch (e) {}
  };

  // Comfort Mode vs Detailed Pro Mode
  const [comfortMode, setComfortMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nutritrack_comfort_mode');
      return saved !== null ? saved === 'true' : true; // Default to true (comfort mode)
    } catch (e) {
      return true;
    }
  });

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
    const confirmMsg = `Reset foods for ${formatDateDisplay(selectedDate)} to match what you logged the day before?`;
    if (!window.confirm(confirmMsg)) return;

    setIsResettingMeals(true);
    try {
      const res = await resetClientDayMealsToDayBefore(activeClient.id, selectedDate);
      if (res.count > 0) {
        setResetFeedbackNotice(`Successfully set ${res.count} food${res.count > 1 ? 's' : ''} from yesterday (${formatDateDisplay(res.dayBefore)}) into today!`);
      } else {
        setResetFeedbackNotice(`No food logs were recorded on the day before (${formatDateDisplay(res.dayBefore)}). Today's food log has been cleared.`);
      }
    } catch (err) {
      setResetFeedbackNotice('Reset failed. Please try again.');
    } finally {
      setIsResettingMeals(false);
      setTimeout(() => {
        setResetFeedbackNotice(null);
      }, 5000);
    }
  };

  // Front page sections visibility for customized, non-boring layout with sleek "Show" lines
  interface FrontSections {
    trajectory: boolean;      // 8,000 kcal Weight & Calorie Trajectory
    nutritionTarget: boolean; // Daily Target & Macro Breakdown
    waterTracker: boolean;    // Daily Hydration Tracker
    dailyHabits: boolean;     // Daily Lifestyle & Recovery Habits
    suggestions: boolean;     // AI Meal Suggestions
    mealsTimeline: boolean;   // Today's Meals Timeline
    sideWidgets: boolean;     // Assigned Coach & Habits Reminders
  }

  const [visibleSections, setVisibleSections] = useState<FrontSections>(() => {
    try {
      const saved = localStorage.getItem('nutritrack_front_sections');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      trajectory: false, // Default to FALSE so heavy 8,000 kcal table doesn't overwhelm client
      nutritionTarget: true,
      waterTracker: true,
      dailyHabits: false, // Accessible via 1-click shortcut
      suggestions: true,
      mealsTimeline: true,
      sideWidgets: true,
    };
  });

  const toggleSection = (key: keyof FrontSections) => {
    setVisibleSections(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('nutritrack_front_sections', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const toggleComfortMode = () => {
    const next = !comfortMode;
    setComfortMode(next);
    try {
      localStorage.setItem('nutritrack_comfort_mode', String(next));
    } catch (e) {}
    if (next) {
      // Comfort mode: hide heavy trajectory and habits by default
      const comfortSections = { ...visibleSections, trajectory: false, dailyHabits: false };
      setVisibleSections(comfortSections);
      try {
        localStorage.setItem('nutritrack_front_sections', JSON.stringify(comfortSections));
      } catch (e) {}
    } else {
      showAllSections();
    }
  };

  const showAllSections = () => {
    const all: FrontSections = {
      trajectory: true,
      nutritionTarget: true,
      waterTracker: true,
      dailyHabits: true,
      suggestions: true,
      mealsTimeline: true,
      sideWidgets: true,
    };
    setVisibleSections(all);
    try {
      localStorage.setItem('nutritrack_front_sections', JSON.stringify(all));
    } catch (e) {}
  };

  const collapseAllSections = () => {
    const none: FrontSections = {
      trajectory: false,
      nutritionTarget: false,
      waterTracker: false,
      dailyHabits: false,
      suggestions: false,
      mealsTimeline: false,
      sideWidgets: false,
    };
    setVisibleSections(none);
    try {
      localStorage.setItem('nutritrack_front_sections', JSON.stringify(none));
    } catch (e) {}
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

  // Physical activities and calories burned today
  const clientActivitiesForDay = useMemo(() => {
    return activities.filter(a => a.clientId === activeClient.id && a.date === selectedDate);
  }, [activities, activeClient.id, selectedDate]);

  const caloriesBurnedToday = useMemo(() => {
    return clientActivitiesForDay.reduce((sum, a) => sum + a.caloriesBurned, 0);
  }, [clientActivitiesForDay]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* ================= WEBSITE CLIENT HERO BANNER ================= */}
      <div className="bg-linear-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Subtle background brand watermark */}
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none select-none">
          <NutriTrackLogo size="xl" showText={false} variant="dark" className="w-56 h-56" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          
          {/* Client Details & Coach Attribution */}
          <div className="flex items-start sm:items-center gap-4">
            <img
              src={activeClient.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
              alt={activeClient.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/80 shadow-md shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-extrabold text-white text-xl sm:text-2xl tracking-tight">
                  Welcome, {activeClient.name}
                </h1>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-white/20 text-emerald-100 backdrop-blur-xs border border-white/20">
                  {activeClient.status === 'active' ? 'Active Member' : 'Inactive'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-emerald-100 flex items-center gap-1.5 font-medium">
                <span>🎯 Goal:</span>
                <span className="text-white font-semibold">{activeClient.goal}</span>
                <span className="text-white/40">•</span>
                <span>Current: <b className="text-white">{activeClient.currentWeightKg} kg</b></span>
                <span className="text-white/40">•</span>
                <span>Target: <b className="text-white">{activeClient.targetWeightKg} kg</b></span>
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-emerald-200">
                <span className="flex items-center gap-1.5 bg-black/15 px-3 py-1 rounded-full border border-white/10">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>Coach: <b className="text-white">{assignedDietitian.name}</b></span>
                </span>
                <span className="flex items-center gap-1.5 bg-black/15 px-3 py-1 rounded-full border border-white/10">
                  <Phone className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{assignedDietitian.phone}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openLogForSlot('Breakfast')}
              className="bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-700" />
              <span>Log Meal</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCalorieGuideOpen(true)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              title="Click to learn what is a calorie, detection, and human energy needs"
            >
              <Flame className="w-4 h-4 text-slate-900" />
              <span>Calorie 101</span>
            </button>

            <button
              type="button"
              onClick={() => setIsTourModalOpen(true)}
              className="bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
              title="60-Second Quick Tour of how the app works"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>App Tour</span>
            </button>

            <button
              type="button"
              onClick={() => setIsQuickWeightModalOpen(true)}
              className="bg-emerald-600/90 hover:bg-emerald-600 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition-all border border-emerald-400/40 flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
              title="Quick 5-second morning weigh-in"
            >
              <Scale className="w-4 h-4 text-emerald-200" />
              <span>Morning Weight</span>
            </button>

            <button
              type="button"
              onClick={() => setIsActivityModalOpen(true)}
              className="bg-emerald-600/90 hover:bg-emerald-600 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition-all border border-emerald-400/40 flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
              title="Record workout / calories burned"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>Log Workout</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAppointmentsModalOpen(true)}
              className="bg-emerald-600/90 hover:bg-emerald-600 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition-all border border-emerald-400/40 flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
              title="Centre appointment & consultation"
            >
              <CalendarCheck className="w-4 h-4 text-teal-200" />
              <span>Appointments</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="bg-black/25 hover:bg-black/35 text-white font-semibold text-xs sm:text-sm px-3 py-2 rounded-xl transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
              title="Print official clinical diet plan & progress dossier"
            >
              <Printer className="w-4 h-4 text-emerald-200" />
              <span className="hidden sm:inline">Print Report</span>
            </button>
          </div>

        </div>

        {/* Upcoming Appointment Alert Strip inside banner */}
        {nextAppointment && (
          <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              <span>
                <b>Next Centre Visit:</b> {nextAppointment.type.replace('_', ' ')} on <b className="text-white">{nextAppointment.date} at {nextAppointment.time}</b> with {nextAppointment.dietitianName}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAppointmentsModalOpen(true)}
              className="text-[11px] font-bold underline hover:text-white cursor-pointer"
            >
              View Appointment Details →
            </button>
          </div>
        )}
      </div>

      {/* ================= FRIENDLY WELCOME & 60-SECOND ORIENTATION BANNER ================= */}
      {!isOrientationDismissed ? (
        <div className="bg-linear-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-3xl p-5 sm:p-6 border-2 border-emerald-300 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-3 w-full">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-600 text-white">
                    👋 60-Second Quick Guide
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-950">
                    Welcome, {activeClient.name}! How NutriTrack PRO works:
                  </span>
                </div>
                <button
                  type="button"
                  onClick={dismissOrientation}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 px-2.5 py-1 rounded-lg hover:bg-emerald-200/50 transition-colors cursor-pointer"
                  title="Minimize this guide"
                >
                  ✕ Minimize
                </button>
              </div>

              {/* 3 Step Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-white/95 backdrop-blur-xs p-3.5 rounded-2xl border border-emerald-200 shadow-2xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center shrink-0">1</span>
                    <b className="text-xs text-slate-900">Log Your Meals</b>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Tap <b className="text-emerald-700">+ Log Meal</b> or speak to NutriBot in English or Malayalam. Calories auto-calculate!
                  </p>
                </div>

                <div className="bg-white/95 backdrop-blur-xs p-3.5 rounded-2xl border border-emerald-200 shadow-2xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center shrink-0">2</span>
                    <b className="text-xs text-slate-900">Watch Your Target Bar</b>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Your target is <b className="text-amber-800 font-extrabold">{targetCalories} kcal</b>. Eat wholesome foods (eggs, fish, oats) to stay full and stay in green.
                  </p>
                </div>

                <div className="bg-white/95 backdrop-blur-xs p-3.5 rounded-2xl border border-emerald-200 shadow-2xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 text-xs font-black flex items-center justify-center shrink-0">3</span>
                    <b className="text-xs text-slate-900">1-Tap Water &amp; Habits</b>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Tap water glasses and check daily habits. Your coach reviews your diary live to keep you motivated.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCalorieGuideOpen(true)}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Flame className="w-4 h-4 text-slate-900" />
                  <span>What is a Calorie &amp; How It Calculates (101 Guide)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsTourModalOpen(true)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>60-Second Interactive Tour</span>
                </button>

                <button
                  type="button"
                  onClick={dismissOrientation}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 px-3 py-1.5 rounded-xl hover:bg-emerald-100/60 transition-colors cursor-pointer sm:ml-auto"
                >
                  Got It, Start Tracking ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Collapsed quiet bar with fast access */
        <div className="bg-emerald-50/70 rounded-2xl px-4 py-2.5 border border-emerald-200/80 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-emerald-900 font-medium">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Welcome, <b>{activeClient.name}</b>! Need a refresher on how calories work or how to use the app?
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCalorieGuideOpen(true)}
              className="text-xs font-extrabold text-amber-950 bg-amber-300 hover:bg-amber-400 px-3 py-1 rounded-xl transition-all cursor-pointer shadow-2xs flex items-center gap-1"
            >
              <Flame className="w-3.5 h-3.5 text-slate-900" />
              <span>Calorie 101</span>
            </button>

            <button
              type="button"
              onClick={() => setIsTourModalOpen(true)}
              className="text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-xl transition-all cursor-pointer shadow-2xs flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>App Tour</span>
            </button>

            <button
              type="button"
              onClick={showOrientation}
              className="text-xs text-emerald-700 hover:underline cursor-pointer pl-1 font-semibold"
            >
              Expand Guide
            </button>
          </div>
        </div>
      )}

      {/* ================= WEBSITE NAVIGATION TABS ================= */}
      <div className="bg-white rounded-2xl p-1.5 shadow-2xs border border-slate-200 flex items-center overflow-x-auto gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('today')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'today'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Calorie &amp; Meals Tracker</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('plan')}
          className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'plan'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>My Diet Plan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('progress')}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'progress'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ChartIcon className="w-4 h-4" />
          <span>Progress &amp; Scans</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tips')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer relative ${
            activeTab === 'tips'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Coach Tips &amp; Alerts</span>
          {clientTips.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile &amp; Coach</span>
        </button>
      </div>

      {/* Notice Banner when planned meal logged */}
      {planLoggedNotice && (
        <div className="bg-emerald-100 text-emerald-900 text-sm px-4 py-3 rounded-2xl border border-emerald-300 flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span className="font-semibold">{planLoggedNotice}</span>
        </div>
      )}

      {/* ================= OFFICIAL SCIENTIFIC MEAL CHECK-INS & CHRONONUTRITION ================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xs border border-slate-200 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                <span>Official Scientific Meal Check-ins</span>
                <span className="text-[10px] text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full font-bold">
                  Chrononutrition Standard
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Optimal windows: <b>8:00 AM</b> Breakfast • <b>1:00 PM</b> Lunch • <b>7:30 PM</b> Dinner
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => openCalorieGuide('chrononutrition')}
              className="text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
              title="Read official clinical study and metabolic rationale"
            >
              <span>Timing Science</span>
              <ArrowRight className="w-3 h-3 text-emerald-700" />
            </button>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Live Sync
            </span>
          </div>
        </div>

        {/* Live Circadian Smart Banner (Contextual to Current Time of Day) */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-linear-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-2xs">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-slate-900">
                  Current Window: {currentCircadianMeal.title} ({currentCircadianMeal.targetTime})
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Aptable: {currentCircadianMeal.window}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                {currentCircadianMeal.scientificReason}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openLogForSlot(currentCircadianMeal.slot)}
            className={`text-xs font-extrabold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-2xs ${
              currentCircadianMeal.isLogged
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {currentCircadianMeal.actionText} →
          </button>
        </div>

        {/* 3 Compact Slots with Official Aptable Scientific Times */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Morning: 8:00 AM (7:00 AM - 8:30 AM) */}
          {(() => {
            const hasBreakfast = clientLogsForDay.some(m => m.mealType === 'Breakfast');
            return (
              <div className={`px-3 py-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                hasBreakfast ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-amber-300'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    hasBreakfast ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900 block">Morning 8:00 AM</span>
                      <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-200/60 px-1 py-0.2 rounded">7:00–8:30</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">Breakfast • Insulin Peak</span>
                    <span className={`text-[10px] font-bold ${hasBreakfast ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {hasBreakfast ? '✅ Logged' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openLogForSlot('Breakfast')}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                    hasBreakfast
                      ? 'bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                  }`}
                >
                  {hasBreakfast ? '+ Add' : 'Log'}
                </button>
              </div>
            );
          })()}

          {/* Lunch: 1:00 PM (12:30 PM - 1:30 PM) */}
          {(() => {
            const hasLunch = clientLogsForDay.some(m => m.mealType === 'Lunch');
            return (
              <div className={`px-3 py-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                hasLunch ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-orange-300'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    hasLunch ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    <Sunset className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900 block">Afternoon 1:00 PM</span>
                      <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-200/60 px-1 py-0.2 rounded">12:30–1:30</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">Lunch • Solar Digestive Peak</span>
                    <span className={`text-[10px] font-bold ${hasLunch ? 'text-emerald-700' : 'text-orange-700'}`}>
                      {hasLunch ? '✅ Logged' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openLogForSlot('Lunch')}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                    hasLunch
                      ? 'bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                  }`}
                >
                  {hasLunch ? '+ Add' : 'Log'}
                </button>
              </div>
            );
          })()}

          {/* Dinner: 7:30 PM (7:00 PM - 8:00 PM) */}
          {(() => {
            const hasDinner = clientLogsForDay.some(m => m.mealType === 'Dinner');
            return (
              <div className={`px-3 py-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                hasDinner ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-indigo-300'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    hasDinner ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900 block">Night 7:30 PM</span>
                      <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-200/60 px-1 py-0.2 rounded">7:00–8:00</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">Dinner • Pre-Melatonin Window</span>
                    <span className={`text-[10px] font-bold ${hasDinner ? 'text-emerald-700' : 'text-indigo-700'}`}>
                      {hasDinner ? '✅ Logged' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openLogForSlot('Dinner')}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                    hasDinner
                      ? 'bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                  }`}
                >
                  {hasDinner ? '+ Add' : 'Log'}
                </button>
              </div>
            );
          })()}
        </div>

        {/* 1-Tap Quick Common Kerala Staples (Instant Logging in 1-Click) */}
        <div className="pt-1 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-bold text-slate-700 text-[11px]">⚡ 1-Tap Quick Staples for {currentCircadianMeal.slot}:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogStaple('2 Boiled Eggs', 140, 12, 1, 10, 'pieces')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap"
              title="Quick Log 2 Boiled Eggs (140 kcal, 12g protein)"
            >
              🥚 2 Boiled Eggs (140k)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogStaple('2 Appam (Kerala Rice Pancake)', 240, 4, 52, 2, 'pieces')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap"
              title="Quick Log 2 Appam (240 kcal)"
            >
              🫓 2 Appam (240k)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogStaple('Oats with Skimmed Milk', 180, 8, 30, 3, 'bowl')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap"
              title="Quick Log Oats Bowl (180 kcal)"
            >
              🥣 Oats (180k)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogStaple('Kerala Matta Rice + Ayala Curry', 380, 24, 45, 10, 'plate')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap"
              title="Quick Log Rice + Fish Curry (380 kcal)"
            >
              🍛 Rice + Fish (380k)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogStaple('Black Tea / Coffee (No Sugar)', 5, 0, 1, 0, 'cup')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap"
              title="Quick Log Black Tea (5 kcal)"
            >
              ☕ Black Tea (5k)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogStaple('Fresh Green Salad (Cucumber & Tomato)', 45, 2, 8, 0, 'bowl')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap"
              title="Quick Log Fresh Salad (45 kcal)"
            >
              🥗 Salad (45k)
            </button>
          </div>
        </div>

        {/* Phone notification indicator */}
        {clientTips.some(t => t.type === 'reminder') && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-rose-900 font-medium">
              <Smartphone className="w-3.5 h-3.5 text-rose-600 shrink-0 animate-bounce" />
              <span>
                <b>Phone Alert from Coach:</b> {clientTips.find(t => t.type === 'reminder')?.message}
              </span>
            </div>
            <button
              type="button"
              onClick={() => openLogForSlot('Lunch')}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] transition-colors shrink-0 cursor-pointer shadow-2xs"
            >
              Log Foods Now →
            </button>
          </div>
        )}
      </div>

      {/* ================= TAB 1: TODAY'S CALORIE TRACKER & MEAL LOGS ================= */}
      {activeTab === 'today' && (
        <div className="space-y-6">
          
          {/* Date Selector Toolbar */}
          <div className="bg-white rounded-2xl p-3 shadow-2xs border border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => changeDateBy(-1)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200"
                title="Previous Day (Past days allowed)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-xl border border-slate-200">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold text-slate-900">
                  {formatDateDisplay(selectedDate)}
                </span>
                <span className="text-xs text-slate-500">
                  ({clientLogsForDay.length} foods logged)
                </span>
              </div>

              <button
                type="button"
                onClick={() => changeDateBy(1)}
                disabled={selectedDate >= getTodayString()}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title={selectedDate >= getTodayString() ? "Future dates not allowed (Today is maximum)" : "Next Day"}
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Quick Jump Date Pill Shortcuts */}
              <div className="flex items-center gap-1.5 pl-1">
                <button
                  type="button"
                  onClick={() => setSelectedDate(getTodayString())}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    selectedDate === getTodayString()
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDate(getYesterdayString())}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    selectedDate === getYesterdayString()
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Yesterday
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDate(getDaysAgoString(2))}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    selectedDate === getDaysAgoString(2)
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  2 Days Ago
                </button>
              </div>

              {/* Calendar Past Date Picker (Strict max = today) */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <span className="text-[11px] font-semibold text-slate-400">Pick:</span>
                <input
                  type="date"
                  max={getTodayString()}
                  value={selectedDate}
                  onChange={(e) => {
                    if (e.target.value && e.target.value <= getTodayString()) {
                      setSelectedDate(e.target.value);
                    }
                  }}
                  className="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700 cursor-pointer focus:outline-emerald-500"
                  title="Select any past date (Strictly up to Today, no future dates)"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-nutribot'))}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                title="Ask NutriBot AI Assistant (Instant Food Calories & 1-Click Diary Logging)"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Ask NutriBot (Food AI)</span>
              </button>
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Live Calorie Aggregation</span>
              </div>
            </div>
          </div>

          {/* ================= QUICK DATA SHORTCUTS & COMFORT VIEW CONTROLS ================= */}
          <div className="bg-white/95 backdrop-blur-xs rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Quick Data Shortcuts:
                </span>
                <span className="text-[11px] text-slate-400 hidden md:inline">
                  Click any shortcut to inspect deep data without page clutter
                </span>
              </div>

              {/* View Mode Toggle: Comfort View vs Detailed View */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 hidden sm:inline">Mode:</span>
                <button
                  type="button"
                  onClick={() => !comfortMode && toggleComfortMode()}
                  className={`text-xs font-bold px-3 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    comfortMode
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Comfort View: Decluttered, clean layout with deep data tucked into shortcuts"
                >
                  <span>🌿 Comfort View</span>
                  {comfortMode && <Check className="w-3 h-3 text-white" />}
                </button>
                <button
                  type="button"
                  onClick={() => comfortMode && toggleComfortMode()}
                  className={`text-xs font-bold px-3 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    !comfortMode
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Detailed View: Shows all charts and diagnostic tables expanded"
                >
                  <span>📊 Detailed Pro</span>
                  {!comfortMode && <Check className="w-3 h-3 text-white" />}
                </button>
              </div>
            </div>

            {/* Quick 1-Click Access Shortcuts */}
            <div className="flex flex-wrap items-center gap-2">
              {/* 1. Calorie Knowledge 101 Modal Shortcut */}
              <button
                type="button"
                onClick={() => setIsCalorieGuideOpen(true)}
                className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs group"
                title="Click to understand what is a calorie, detection methods, and human requirements"
              >
                <Flame className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
                <span>🧠 Calorie &amp; Detection Guide</span>
              </button>

              {/* 2. 8,000 kcal Trajectory Shortcut */}
              <button
                type="button"
                onClick={() => toggleSection('trajectory')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                  visibleSections.trajectory
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200 hover:border-emerald-300'
                }`}
                title="Click to show or hide the 8,000 kcal Weight Trajectory Table & Chart"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>8,000 kcal Trajectory</span>
                <span className="text-[10px] font-mono opacity-80">
                  {visibleSections.trajectory ? '▲ Hide' : '▼ View Data'}
                </span>
              </button>

              {/* 3. Coach Clinical Rules & Alerts */}
              <button
                type="button"
                onClick={() => setIsClinicalGuideOpen(true)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 hover:border-teal-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="View Coach Saleem's official food frequency rules and clinical cautions"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Clinical Food Rules</span>
              </button>

              {/* 4. Hydration Water Tracker */}
              <button
                type="button"
                onClick={() => toggleSection('waterTracker')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                  visibleSections.waterTracker
                    ? 'bg-cyan-600 text-white border-cyan-600'
                    : 'bg-white hover:bg-cyan-50 text-slate-700 border-slate-200 hover:border-cyan-300'
                }`}
                title="Click to show or hide the Water Hydration Tracker"
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>Water Tracker</span>
                <span className="text-[10px] font-mono opacity-80">
                  {visibleSections.waterTracker ? '▲' : '▼'}
                </span>
              </button>

              {/* 5. Daily Habits & Recovery */}
              <button
                type="button"
                onClick={() => toggleSection('dailyHabits')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                  visibleSections.dailyHabits
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200 hover:border-emerald-300'
                }`}
                title="Click to show or hide Daily Habits (Steps, Sleep, Vitamins)"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Daily Habits</span>
                <span className="text-[10px] font-mono opacity-80">
                  {visibleSections.dailyHabits ? '▲' : '▼'}
                </span>
              </button>

              {/* 6. Prescribed Diet Plan */}
              <button
                type="button"
                onClick={() => setActiveTab('plan')}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ml-auto"
                title="Open full prescribed diet plan timetable"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>Full Diet Plan →</span>
              </button>
            </div>
          </div>

          {/* Calorie Trajectory & Cumulative 8,000 kcal = 1 kg Weight Projection (Front Page Table) */}
          {!visibleSections.trajectory ? (
            <div 
              onClick={() => toggleSection('trajectory')}
              className="bg-white hover:bg-slate-50/90 rounded-2xl border border-slate-200 p-3 sm:px-5 sm:py-3.5 flex items-center justify-between transition-all shadow-2xs group cursor-pointer hover:border-emerald-300"
              title="Click to show 8,000 kcal Calorie & Weight Projection"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Scale className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                    Calorie Trajectory &amp; Weight Projection
                  </span>
                  <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                    8,000 kcal = 1 kg
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 hidden sm:inline-flex items-center gap-1">
                    <Award className="w-3 h-3 text-emerald-600" />
                    Previous Days Accumulated Balance &amp; Projected Impact
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSection('trajectory');
                }}
                className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 group-hover:bg-emerald-600 group-hover:text-white px-3 py-1.5 rounded-xl transition-all border border-emerald-200 shadow-2xs cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Show</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <CalorieWeightTrajectoryCard
              client={activeClient}
              mealLogs={mealLogs}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onOpenLogModal={openLogForSlot}
              onToggleHide={() => toggleSection('trajectory')}
            />
          )}

          {/* 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 8 Columns: Targets & Meal Slots */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Daily Target vs Consumed Summary Card */}
              {!visibleSections.nutritionTarget ? (
                <div 
                  onClick={() => toggleSection('nutritionTarget')}
                  className="bg-white hover:bg-slate-50/90 rounded-2xl border border-slate-200 p-3 sm:px-5 sm:py-3.5 flex items-center justify-between transition-all shadow-2xs group cursor-pointer hover:border-amber-300"
                  title="Click to show Daily Calorie Target & Macronutrients"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        Daily Calorie Target &amp; Macronutrients
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                        {consumedTotals.calories} / {targetCalories} kcal ({caloriesPercent}%)
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
                        P: {consumedTotals.protein}g • C: {consumedTotals.carbs}g • F: {consumedTotals.fat}g
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSection('nutritionTarget');
                    }}
                    className="flex items-center gap-1.5 text-xs font-extrabold text-amber-800 bg-amber-50 hover:bg-amber-100 group-hover:bg-amber-600 group-hover:text-white px-3 py-1.5 rounded-xl transition-all border border-amber-200 shadow-2xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Show</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-6 shadow-2xs border border-slate-200 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-amber-500" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Daily Calorie Balance &amp; Targets
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                        <span className={`text-3xl sm:text-4xl font-black ${isCalorieGreen ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {netCalories}
                        </span>
                        <span className="text-sm sm:text-base font-semibold text-slate-500">
                          Net / {targetCalories} kcal (Target)
                        </span>
                        {caloriesBurnedToday > 0 && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                            <Activity className="w-3 h-3 text-blue-600" />
                            -{caloriesBurnedToday} kcal Burned
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-500 block">
                          {isWeightLossGoal ? 'Deficit Remaining' : 'Calorie Surplus Needed'}
                        </span>
                        <span className="text-lg font-black text-emerald-700">{caloriesRemaining} kcal</span>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center font-bold text-emerald-800">
                        <span className="text-xs font-extrabold">{caloriesPercent}%</span>
                        <span className="text-[9px] uppercase tracking-tight text-emerald-600">Goal</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleSection('nutritionTarget')}
                        className="ml-2 flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer border border-slate-200"
                        title="Collapse to single line"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide Line</span>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* USER MANDATE: Good Calories vs Bad Calories Columns + Burned Calories Minus Calculation */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {/* Column 1: Total Consumed */}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
                      <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block">
                        Total Food Eaten
                      </span>
                      <div className="text-lg font-black text-slate-900 mt-0.5">
                        {calorieBreakdown.totalCalories} <span className="text-xs font-normal text-slate-500">kcal</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Gross food intake</span>
                    </div>

                    {/* Column 2: Good Calories */}
                    <div className="bg-emerald-50/70 rounded-2xl p-3 border border-emerald-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-black tracking-wider text-emerald-900 block">
                          🍏 Good Calories
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 rounded">
                          {calorieBreakdown.totalCalories > 0 ? Math.round((calorieBreakdown.goodCalories / calorieBreakdown.totalCalories) * 100) : 0}%
                        </span>
                      </div>
                      <div className="text-lg font-black text-emerald-800 mt-0.5">
                        {calorieBreakdown.goodCalories} <span className="text-xs font-normal text-emerald-600">kcal</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 block mt-0.5">Wholesome &amp; Nutritious</span>
                    </div>

                    {/* Column 3: Bad Calories */}
                    <div className="bg-amber-50/70 rounded-2xl p-3 border border-amber-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-black tracking-wider text-amber-900 block">
                          🍟 Bad Calories
                        </span>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 rounded">
                          {calorieBreakdown.totalCalories > 0 ? Math.round((calorieBreakdown.badCalories / calorieBreakdown.totalCalories) * 100) : 0}%
                        </span>
                      </div>
                      <div className="text-lg font-black text-amber-900 mt-0.5">
                        {calorieBreakdown.badCalories} <span className="text-xs font-normal text-amber-700">kcal</span>
                      </div>
                      <span className="text-[10px] text-amber-700 block mt-0.5">Fried / Refined / Treats</span>
                    </div>

                    {/* Column 4: Calories Burned & Sports */}
                    <div className="bg-blue-50/70 rounded-2xl p-3 border border-blue-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-black tracking-wider text-blue-900 block">
                            ⚽ Calorie Burn
                          </span>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 rounded">
                            Exercise
                          </span>
                        </div>
                        <div className="text-lg font-black text-blue-800 mt-0.5">
                          -{calorieBreakdown.caloriesBurned} <span className="text-xs font-normal text-blue-600">kcal</span>
                        </div>
                        <span className="text-[10px] text-blue-600 block mt-0.5">Deducted from total</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsActivityModalOpen(true)}
                        className="mt-2 text-[10px] font-bold text-blue-700 bg-white border border-blue-200 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        title="Log Football, Workout, Gym, or Walking to minus calories burned"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Log Burn (e.g. Football)</span>
                      </button>
                    </div>
                  </div>

                  {/* Dual Split Calorie Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <span>Calorie Meter: {calorieBreakdown.goodCalories} good + {calorieBreakdown.badCalories} bad - {calorieBreakdown.caloriesBurned} burned = <b>{netCalories} net kcal</b></span>
                      <span>Target: {targetCalories} kcal</span>
                    </div>
                    <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-0.5 flex">
                      {/* Good Calories Segment */}
                      <div
                        className="bg-emerald-600 h-full rounded-l-full transition-all duration-500"
                        style={{ width: `${targetCalories > 0 ? Math.min(100, (calorieBreakdown.goodCalories / targetCalories) * 100) : 0}%` }}
                        title={`Good Calories: ${calorieBreakdown.goodCalories} kcal`}
                      />
                      {/* Bad Calories Segment */}
                      <div
                        className="bg-amber-500 h-full transition-all duration-500"
                        style={{ width: `${targetCalories > 0 ? Math.min(100, (calorieBreakdown.badCalories / targetCalories) * 100) : 0}%` }}
                        title={`Bad Calories: ${calorieBreakdown.badCalories} kcal`}
                      />
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                        Good ({calorieBreakdown.goodCalories} kcal)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                        Bad ({calorieBreakdown.badCalories} kcal)
                      </span>
                      {calorieBreakdown.caloriesBurned > 0 && (
                        <span className="flex items-center gap-1 text-blue-600 font-semibold">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                          Burned (-{calorieBreakdown.caloriesBurned} kcal)
                        </span>
                      )}
                    </div>
                  </div>

                {/* Macronutrient breakdown cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                  {/* Protein */}
                  <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100">
                    <div className="text-xs font-bold text-slate-600 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Dumbbell className="w-4 h-4 text-emerald-600" />
                        Protein
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700">
                        {Math.round((consumedTotals.protein / targetProtein) * 100)}%
                      </span>
                    </div>
                    <div className="text-lg font-extrabold text-slate-900 mt-1">
                      {consumedTotals.protein} <span className="text-xs font-normal text-slate-500">/ {targetProtein}g</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, (consumedTotals.protein / targetProtein) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Carbs */}
                  <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100">
                    <div className="text-xs font-bold text-slate-600 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Wheat className="w-4 h-4 text-blue-600" />
                        Carbohydrates
                      </span>
                      <span className="text-[11px] font-semibold text-blue-700">
                        {Math.round((consumedTotals.carbs / targetCarbs) * 100)}%
                      </span>
                    </div>
                    <div className="text-lg font-extrabold text-slate-900 mt-1">
                      {consumedTotals.carbs} <span className="text-xs font-normal text-slate-500">/ {targetCarbs}g</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, (consumedTotals.carbs / targetCarbs) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Fat */}
                  <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100">
                    <div className="text-xs font-bold text-slate-600 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Droplets className="w-4 h-4 text-amber-600" />
                        Healthy Fats
                      </span>
                      <span className="text-[11px] font-semibold text-amber-700">
                        {Math.round((consumedTotals.fat / targetFat) * 100)}%
                      </span>
                    </div>
                    <div className="text-lg font-extrabold text-slate-900 mt-1">
                      {consumedTotals.fat} <span className="text-xs font-normal text-slate-500">/ {targetFat}g</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-amber-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, (consumedTotals.fat / targetFat) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Net Calorie & Exercise Burn Row */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span>Activity Burn:</span>
                      <span className="text-orange-600 font-extrabold">-{caloriesBurnedToday} kcal</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <span>Net Energy:</span>
                      <span className="text-emerald-800 font-extrabold">{netCalories} kcal</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsActivityModalOpen(true)}
                    className="text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl border border-orange-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{caloriesBurnedToday > 0 ? `${clientActivitiesForDay.length} Workouts Logged` : 'Log Workout / Burn'}</span>
                  </button>
                </div>
              </div>
              )}

              {/* Daily Hydration Tracker Card */}
              {visibleSections.waterTracker && (
                <WaterTrackerCard />
              )}

              {/* Daily Clinical Habits & Recovery Card */}
              {visibleSections.dailyHabits && (
                <DailyHabitsCard />
              )}


              {/* Suggested Meals from AI Chatbot */}
              {pendingSuggestions.length > 0 && (
                !visibleSections.suggestions ? (
                  <div 
                    onClick={() => toggleSection('suggestions')}
                    className="bg-white hover:bg-emerald-50/50 rounded-2xl border border-emerald-200 p-3 sm:px-5 sm:py-3.5 flex items-center justify-between transition-all shadow-2xs group cursor-pointer hover:border-emerald-400"
                    title="Click to show NutriBot AI Suggested Meals"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          Suggested Meals from NutriBot AI
                        </span>
                        <span className="bg-emerald-600 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                          {pendingSuggestions.length} Pending
                        </span>
                        <span className="text-xs text-slate-500 hidden sm:inline">
                          Food items reported in chat with time
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSection('suggestions');
                      }}
                      className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 group-hover:bg-emerald-600 group-hover:text-white px-3 py-1.5 rounded-xl transition-all border border-emerald-200 shadow-2xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Show</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="bg-linear-to-br from-emerald-50 via-teal-50/70 to-amber-50/50 rounded-3xl p-5 sm:p-6 shadow-sm border-2 border-emerald-300/90 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
                          <h3 className="text-base font-black text-slate-900">
                            Suggested Meals from NutriBot AI
                          </h3>
                          <span className="bg-emerald-600 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                            {pendingSuggestions.length} Pending
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Food items reported in chat with time are suggested below. Each food's calories are listed first for clinical accuracy.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleSection('suggestions')}
                        className="self-start sm:self-auto flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 bg-white/80 hover:bg-white px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer border border-emerald-200"
                        title="Collapse suggestions to line"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide Line</span>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  <div className="space-y-3">
                    {pendingSuggestions.map((sugg) => (
                      <div
                        key={sugg.id}
                        className="bg-white rounded-2xl p-4 border-2 border-emerald-200 shadow-xs space-y-3"
                      >
                        {/* Suggestion Top Banner */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-emerald-700 text-white text-xs font-black rounded-lg">
                              {sugg.mealType}
                            </span>
                            <span className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                              <Clock className="w-3.5 h-3.5 text-emerald-600" />
                              Eaten at: <strong className="text-slate-900">{sugg.timeGiven}</strong>
                            </span>
                          </div>

                          {/* Total calories badge */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-amber-950 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-lg flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5 text-amber-600" />
                              <strong>Total: {sugg.totalCalories} kcal</strong>
                            </span>
                          </div>
                        </div>

                        {/* Each food's calories listed FIRST */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                            Each Food's Calories (Check First):
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {sugg.foods.map((food, fIdx) => (
                              <div
                                key={fIdx}
                                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                              >
                                <div>
                                  <span className="font-extrabold text-slate-900 text-xs block">{food.name}</span>
                                  <span className="text-[11px] text-slate-500 font-medium">
                                    {food.quantity}x ({food.servingUnit})
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="font-black text-amber-950 text-xs bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                                    <Flame className="w-3 h-3 text-amber-600" />
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
                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => dismissSuggestedMeal(sugg.id)}
                            className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                          >
                            Dismiss
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              acceptSuggestedMeal(sugg.id);
                              setPlanLoggedNotice(`Accepted & logged all items into ${sugg.mealType}!`);
                              setTimeout(() => setPlanLoggedNotice(null), 3500);
                            }}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>Accept & Add to {sugg.mealType}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                )
              )}

              {/* Today's Meals Timeline Cards with Show/Hide Line & Accordion */}
              {!visibleSections.mealsTimeline ? (
                <div 
                  onClick={() => toggleSection('mealsTimeline')}
                  className="bg-white hover:bg-slate-50/90 rounded-2xl border border-slate-200 p-3 sm:px-5 sm:py-3.5 flex items-center justify-between transition-all shadow-2xs group cursor-pointer hover:border-teal-300"
                  title="Click to show Today's Meals Timeline"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                      <Utensils className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        Today's Meals Timeline
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-900 border border-teal-200">
                        {clientLogsForDay.length} foods logged
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
                        Breakfast • Morning Snack • Lunch • Evening Snack • Dinner
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSection('mealsTimeline');
                    }}
                    className="flex items-center gap-1.5 text-xs font-extrabold text-teal-800 bg-teal-50 hover:bg-teal-100 group-hover:bg-teal-600 group-hover:text-white px-3 py-1.5 rounded-xl transition-all border border-teal-200 shadow-2xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Show</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-emerald-600" />
                      <span>Today's Meals Timeline</span>
                    </h2>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* USER MANDATE: Client reset ONLY resets their food logs as the day before */}
                      <button
                        type="button"
                        onClick={handleResetMealsToDayBefore}
                        disabled={isResettingMeals}
                        title="Reset your food log for this date to exactly what you had typed the day before"
                        className="flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer border border-amber-200 shadow-2xs disabled:opacity-50"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 text-amber-600 ${isResettingMeals ? 'animate-spin' : ''}`} />
                        <span>{isResettingMeals ? 'Resetting...' : "Reset to Yesterday's Foods"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleSection('mealsTimeline')}
                        className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer border border-slate-200"
                        title="Collapse meals timeline to line"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide Line</span>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {resetFeedbackNotice && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                      <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{resetFeedbackNotice}</span>
                    </div>
                  )}

                  {(['Breakfast', 'Morning Snack', 'Lunch', 'Evening Snack', 'Dinner'] as MealType[]).map((slot) => {
                    const itemsInSlot = clientLogsForDay.filter(m => m.mealType === slot);
                    const slotBreakdown = calculateCalorieBreakdown(itemsInSlot);
                    const slotSuggestions = pendingSuggestions.filter(s => s.mealType === slot);
                    const isSlotOpen = openMealSlots[slot] ?? true;

                    return (
                      <div key={slot} className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200 hover:border-slate-300 transition-all">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div 
                            onClick={() => toggleMealSlot(slot)}
                            className="flex items-center gap-2.5 cursor-pointer group select-none flex-wrap"
                            title={`Click to ${isSlotOpen ? 'collapse' : 'expand'} ${slot}`}
                          >
                            <span className="p-1 rounded-md text-slate-400 group-hover:text-slate-700 hover:bg-slate-100 transition-colors">
                              {isSlotOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </span>
                            <span className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">{slot}</span>
                            {slotBreakdown.totalCalories > 0 ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                                  {slotBreakdown.totalCalories} kcal
                                </span>
                                {slotBreakdown.goodCalories > 0 && (
                                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded-md border border-emerald-200">
                                    🍏 {slotBreakdown.goodCalories} good
                                  </span>
                                )}
                                {slotBreakdown.badCalories > 0 && (
                                  <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-1.5 py-0.2 rounded-md border border-amber-200">
                                    🍟 {slotBreakdown.badCalories} bad
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">0 kcal</span>
                            )}
                            <span className="text-[11px] text-slate-400 hidden sm:inline">
                              ({itemsInSlot.length} items)
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openLogForSlot(slot)}
                              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Log Food</span>
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
                                    className="p-3 bg-emerald-50/90 border border-emerald-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                                  >
                                    <div className="flex items-start gap-2">
                                      <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                                      <div>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="text-xs font-black text-emerald-950">
                                            AI Suggestion (Eaten at {sugg.timeGiven})
                                          </span>
                                          <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-200">
                                            🔥 {sugg.totalCalories} kcal Total
                                          </span>
                                        </div>
                                        <div className="text-xs text-slate-700 mt-1 flex flex-wrap items-center gap-1.5">
                                          {sugg.foods.map((f, i) => (
                                            <span key={i} className="bg-white px-2 py-0.5 rounded-md border border-emerald-200 text-slate-900 font-medium text-[11px]">
                                              <strong className="font-bold">{f.name}</strong>: <strong className="text-amber-700">{f.calories} kcal</strong>
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
                                          setPlanLoggedNotice(`Added ${slot} items to your daily diary!`);
                                          setTimeout(() => setPlanLoggedNotice(null), 3500);
                                        }}
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Add to {slot}</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => dismissSuggestedMeal(sugg.id)}
                                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg cursor-pointer"
                                        title="Dismiss"
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
                              <div className="divide-y divide-slate-100 pt-1">
                                {itemsInSlot.map((item) => {
                                  const itemQuality = item.calorieQuality || determineCalorieQuality(item.foodName);
                                  const itemAudit = classifyFoodItem(item.foodName);
                                  return (
                                    <div key={item.id} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                                      <div>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="font-bold text-slate-800">{item.foodName}</span>
                                          {itemAudit.isProblemFood ? (
                                            <span 
                                              className="text-[10px] font-black text-rose-900 bg-rose-100/90 border border-rose-300 px-1.5 py-0.2 rounded-md inline-flex items-center gap-0.5"
                                              title={`${itemAudit.tierLabel}: ${itemAudit.clinicalReason}`}
                                            >
                                              🛑 {itemAudit.tier === 'strict_avoid' ? 'Strict Avoid' : itemAudit.tier === 'once_twice_month' ? '1-2x / Month' : '1-2x / Week'}
                                            </span>
                                          ) : itemAudit.isSuperFood ? (
                                            <span 
                                              className="text-[10px] font-black text-emerald-900 bg-emerald-100/90 border border-emerald-300 px-1.5 py-0.2 rounded-md inline-flex items-center gap-0.5"
                                              title="Superfood: wholesome nutrition to eat freely"
                                            >
                                              🥗 Superfood
                                            </span>
                                          ) : null}
                                          {itemQuality === 'good' ? (
                                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                                              🍏 Good Calories
                                            </span>
                                          ) : (
                                            <span className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-300 px-1.5 py-0.2 rounded-md">
                                              🍟 Bad / Cheat Calories
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                                          <span>{item.quantity}x ({item.servingUnit})</span>
                                          <span>•</span>
                                          <span className="text-emerald-700 font-medium">P: {item.protein}g</span>
                                          <span>•</span>
                                          <span className="text-blue-700 font-medium">C: {item.carbs}g</span>
                                          <span>•</span>
                                          <span className="text-amber-700 font-medium">F: {item.fat}g</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="font-bold text-slate-800 text-sm">{item.calories} kcal</span>
                                        <button
                                          type="button"
                                          onClick={() => deleteMealLog(item.id)}
                                          title="Remove food"
                                          className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
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
                                  No foods logged yet for {slot.toLowerCase()}.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => openLogForSlot(slot)}
                                  className="text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
                                >
                                  + Click here to add what you ate
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

            {/* Right 4 Columns: Assigned Coach, Reminders & Fast Actions with Show/Hide Line */}
            <div className="lg:col-span-4 space-y-6">
              {/* Real-time Coach Clinical Reminders (Red for problem foods, Green for healthy choices) */}
              <CoachClinicalAlertsCard 
                logs={clientLogsForDay} 
                client={activeClient} 
                selectedDate={selectedDate} 
              />

              {!visibleSections.sideWidgets ? (
                <div 
                  onClick={() => toggleSection('sideWidgets')}
                  className="bg-white hover:bg-slate-50/90 rounded-2xl border border-slate-200 p-3 sm:px-5 sm:py-3.5 flex items-center justify-between transition-all shadow-2xs group cursor-pointer hover:border-blue-300"
                  title="Click to show Assigned Coach & Habits Reminders"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        Coach &amp; Habits Reminders
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                        {assignedDietitian.name}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSection('sideWidgets');
                    }}
                    className="flex items-center gap-1.5 text-xs font-extrabold text-blue-800 bg-blue-50 hover:bg-blue-100 group-hover:bg-blue-600 group-hover:text-white px-3 py-1.5 rounded-xl transition-all border border-blue-200 shadow-2xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Show</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Coach &amp; Reminders</span>
                    <button
                      type="button"
                      onClick={() => toggleSection('sideWidgets')}
                      className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-slate-200"
                      title="Collapse to single line"
                    >
                      <EyeOff className="w-3 h-3" />
                      <span>Hide Line</span>
                      <ChevronUp className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Assigned Wellness Coach Card */}
                  <div className="bg-white rounded-3xl p-5 shadow-2xs border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Your Assigned Wellness Coach
                      </h3>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <img
                        src={assignedDietitian.avatarUrl || 'https://images.unsplash.com/photo-1594824813637-27a3a93d4895?auto=format&fit=crop&q=80&w=250'}
                        alt={assignedDietitian.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{assignedDietitian.name}</h4>
                        <p className="text-xs text-emerald-700 font-semibold">{assignedDietitian.title}</p>
                        <p className="text-xs text-slate-500 mt-1 leading-snug">{assignedDietitian.bio}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {assignedDietitian.phone}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Centre Verified
                      </span>
                    </div>
                  </div>

                  {/* Water & Habits Reminders */}
                  <div className="bg-white rounded-3xl p-5 shadow-2xs border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-emerald-600" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                          Today's Reminders
                        </h3>
                      </div>
                      <span className="text-[10px] text-slate-400">Toggle active</span>
                    </div>

                    <div className="space-y-2">
                      {clientReminders.map((r) => (
                        <div key={r.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-slate-900">{r.title}</span>
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                {r.time}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{r.message}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleReminder(r.id)}
                            className={`w-10 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center shrink-0 ${
                              r.enabled ? 'bg-emerald-600 justify-end' : 'bg-slate-200 justify-start'
                            }`}
                          >
                            <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Latest Coach Advice Card */}
                  {clientTips.length > 0 && (
                    <div className="bg-emerald-50/70 rounded-3xl p-5 border border-emerald-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          Latest Coach Guidance
                        </span>
                        <span className="text-[10px] text-emerald-600">{clientTips[0].createdAt}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{clientTips[0].title}</h4>
                      <p className="text-xs text-slate-700 leading-relaxed">{clientTips[0].message}</p>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ================= TAB 2: PERSONALIZED DIET PLAN ================= */}
      {activeTab === 'plan' && (
        <div className="space-y-6">
          {/* Plan Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xs border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Prescribed Clinical Plan
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">{assignedPlan.title}</h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">{assignedPlan.description}</p>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Reviewed by {assignedDietitian.name}</span>
              </div>
            </div>

            {/* Daily Nutrition Targets Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 text-center">
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/60">
                <span className="text-xs text-slate-500 font-medium block">Calories Target</span>
                <span className="text-xl font-black text-amber-800">{assignedPlan.targetCalories} kcal</span>
              </div>
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/60">
                <span className="text-xs text-slate-500 font-medium block">Protein Goal</span>
                <span className="text-xl font-black text-emerald-800">{assignedPlan.targetProtein}g</span>
              </div>
              <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200/60">
                <span className="text-xs text-slate-500 font-medium block">Carbohydrates</span>
                <span className="text-xl font-black text-blue-800">{assignedPlan.targetCarbs}g</span>
              </div>
              <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200/60">
                <span className="text-xs text-slate-500 font-medium block">Daily Hydration</span>
                <span className="text-xl font-black text-purple-800">{assignedPlan.waterTargetLitres} Litres</span>
              </div>
            </div>
          </div>

          {/* Meal Schedule Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedPlan.meals.map((m) => (
              <div key={m.mealType} className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{m.mealType}</span>
                      <span className="text-xs text-slate-500 font-medium">({m.timeGuideline})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLogPlannedMeal(m.mealType)}
                      className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-xl transition-colors cursor-pointer"
                    >
                      + Quick Log from Plan
                    </button>
                  </div>

                  {m.instructions && (
                    <p className="text-xs text-emerald-800 bg-emerald-50/60 px-3 py-2 rounded-xl mb-3 font-medium">
                      💡 {m.instructions}
                    </p>
                  )}

                  <div className="space-y-2">
                    {m.recommendedFoods.map((rf, idx) => (
                      <div key={idx} className="flex items-start justify-between text-xs sm:text-sm text-slate-700 py-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1"></span>
                          <div>
                            <span className="font-bold text-slate-900">{rf.foodName}</span>
                            {rf.notes && <span className="text-xs text-slate-400 block italic">{rf.notes}</span>}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-700 whitespace-nowrap bg-slate-100 px-2 py-0.5 rounded-md">
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
            <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-200">
              <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Coach Guidelines for You
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs sm:text-sm text-emerald-950">
                {assignedPlan.generalGuidelines.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 bg-white/70 p-3 rounded-xl border border-emerald-200/50">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: PROGRESS & MEASUREMENTS ================= */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          
          {/* Header Strip & Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Body Composition &amp; Progress History</h2>
              <p className="text-xs text-slate-500">Track weight, BMI, body fat %, and centre device InBody scans</p>
            </div>
            <button
              type="button"
              onClick={() => setIsMeasurementModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Record New Reading</span>
            </button>
          </div>

          {/* Progress Overview Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200 text-center">
              <span className="text-xs font-semibold text-slate-500 block">Starting Weight</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {activeClient.startingWeightKg} <span className="text-xs font-normal text-slate-500">kg</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-2xs border border-emerald-200 bg-emerald-50/20 text-center">
              <span className="text-xs font-semibold text-emerald-700 block">Current Weight</span>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                {activeClient.currentWeightKg} <span className="text-xs font-normal text-emerald-600">kg</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200 text-center">
              <span className="text-xs font-semibold text-slate-500 block">Target Goal</span>
              <div className="text-2xl font-black text-blue-700 mt-1">
                {activeClient.targetWeightKg} <span className="text-xs font-normal text-slate-500">kg</span>
              </div>
            </div>

            <div className="bg-emerald-600 text-white rounded-2xl p-4 shadow-2xs text-center flex flex-col justify-center">
              <span className="text-xs text-emerald-100 block">Total Weight Lost</span>
              <div className="text-2xl font-black mt-0.5">
                🎉 {(activeClient.startingWeightKg - activeClient.currentWeightKg).toFixed(1)} kg
              </div>
            </div>
          </div>

          {/* Large Interactive Weight Trend Chart */}
          <div className="bg-white rounded-3xl p-6 shadow-2xs border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Weight Progression Timeline</h3>
                <p className="text-xs text-slate-500">Historical weigh-ins with goal marker</p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Target: {activeClient.targetWeightKg} kg
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={clientMeasurements} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val) => val.slice(5)} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <YAxis 
                    domain={['dataMin - 1', 'dataMax + 1']} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(val: any) => [`${val} kg`, 'Weight']}
                  />
                  <ReferenceLine 
                    y={activeClient.targetWeightKg} 
                    stroke="#059669" 
                    strokeDasharray="4 4" 
                    label={{ value: 'Target Goal', position: 'right', fill: '#059669', fontSize: 11 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weightKg" 
                    stroke="#0284c7" 
                    strokeWidth={3} 
                    dot={{ r: 5, fill: '#0284c7', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Historical Logs & Centre Device Readings List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">
              Measurement Logs &amp; Centre InBody Scans
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {clientMeasurements.slice().reverse().map((m) => (
                <div 
                  key={m.id} 
                  className={`rounded-2xl p-4 border transition-all ${
                    m.source === 'centre_device'
                      ? 'bg-blue-50/50 border-blue-200 shadow-2xs'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-base">{m.weightKg} kg</span>
                        {m.source === 'centre_device' ? (
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-blue-200">
                            <Building2 className="w-3 h-3" />
                            <span>Centre InBody Scan</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            Home Self-Log
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 mt-1 block">
                        {m.date} • Logged by {m.enteredBy}
                      </span>
                    </div>

                    {m.bodyFatPercentage && (
                      <div className="text-right bg-white p-2 rounded-xl border border-slate-200/70">
                        <span className="text-[10px] text-slate-400 block font-semibold">Body Fat</span>
                        <span className="text-xs font-bold text-slate-800">{m.bodyFatPercentage}%</span>
                      </div>
                    )}
                  </div>

                  {(m.waistCm || m.muscleMassKg || m.visceralFatLevel) && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      {m.waistCm && <span>Waist: <b className="text-slate-900">{m.waistCm} cm</b></span>}
                      {m.muscleMassKg && <span>Muscle: <b className="text-slate-900">{m.muscleMassKg} kg</b></span>}
                      {m.visceralFatLevel && <span>Visceral Fat: <b className="text-slate-900">Lvl {m.visceralFatLevel}</b></span>}
                    </div>
                  )}

                  {m.notes && (
                    <p className="mt-2 text-xs text-slate-600 italic bg-white/70 p-2 rounded-xl border border-slate-100">
                      "{m.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ================= TAB 4: COACH TIPS & REMINDERS ================= */}
      {activeTab === 'tips' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Reminders list (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                Active Alerts &amp; Habits
              </h2>
              <span className="text-xs text-slate-400">Toggle alerts</span>
            </div>

            <div className="bg-white rounded-3xl divide-y divide-slate-100 border border-slate-200 shadow-2xs overflow-hidden">
              {clientReminders.map((r) => (
                <div key={r.id} className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">{r.title}</span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {r.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{r.message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleReminder(r.id)}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center shrink-0 ${
                      r.enabled ? 'bg-emerald-600 justify-end' : 'bg-slate-200 justify-start'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Dietitian Tips & Clinical Notes Feed (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Coach Guidance Feed
            </h2>

            <div className="space-y-3">
              {clientTips.map((tip) => (
                <div key={tip.id} className="bg-white rounded-3xl p-5 shadow-2xs border border-slate-200 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                        {tip.dietitianName[4] || 'C'}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-900 block">{tip.dietitianName}</span>
                        <span className="text-xs text-slate-400">{tip.createdAt}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      tip.type === 'note' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      tip.type === 'reminder' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {tip.type}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{tip.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{tip.message}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ================= TAB 5: PROFILE & DIETITIAN ================= */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Client Profile Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xs border border-slate-200 space-y-6">
            <div className="flex items-center gap-4">
              <img
                src={activeClient.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                alt={activeClient.name}
                className="w-20 h-20 rounded-3xl object-cover border-2 border-emerald-500 shadow-sm"
              />
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">{activeClient.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">Phone: {activeClient.phone}</p>
                <div className="mt-2 inline-block bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200">
                  Goal: {activeClient.goal}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center">
              <div className="bg-slate-50 p-3 rounded-2xl">
                <span className="text-slate-400 block text-xs">Height</span>
                <span className="font-extrabold text-slate-900 text-base">{activeClient.heightCm} cm</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl">
                <span className="text-slate-400 block text-xs">Age</span>
                <span className="font-extrabold text-slate-900 text-base">{activeClient.age} yrs</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl">
                <span className="text-slate-400 block text-xs">BMI</span>
                <span className="font-extrabold text-emerald-700 text-base">
                  {(activeClient.currentWeightKg / ((activeClient.heightCm / 100) ** 2)).toFixed(1)}
                </span>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-500 space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between">
                <span>Portal Username:</span>
                <b className="font-mono text-slate-800">{activeClient.username || 'sarah'}</b>
              </div>
              <div className="flex justify-between">
                <span>Member Status:</span>
                <b className="text-emerald-700 capitalize">{activeClient.status}</b>
              </div>
              <div className="flex justify-between">
                <span>Enrolled Plan:</span>
                <b className="text-slate-800">{assignedPlan.title}</b>
              </div>
            </div>
          </div>

          {/* Assigned Dietitian & Sign Out Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xs border border-slate-200 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Your Assigned Wellness Coach
                </h3>
              </div>

              <div className="flex items-start gap-4">
                <img
                  src={assignedDietitian.avatarUrl || 'https://images.unsplash.com/photo-1594824813637-27a3a93d4895?auto=format&fit=crop&q=80&w=250'}
                  alt={assignedDietitian.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <h4 className="text-base font-bold text-slate-900">{assignedDietitian.name}</h4>
                  <p className="text-xs text-emerald-700 font-semibold">{assignedDietitian.title}</p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{assignedDietitian.bio}</p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {assignedDietitian.phone}
                </span>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Centre Verified Coach
                </span>
              </div>
            </div>

            {/* Client Status Badge */}
            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Active Client Profile</span>
                  <span className="text-[11px] text-slate-500">Connected to NutriTrack Wellness Centre</span>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                Active
              </span>
            </div>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={() => clientSignOut()}
              className="w-full bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold py-3 px-4 rounded-2xl text-xs transition-colors border border-slate-200 hover:border-rose-200 flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out to Login Portal</span>
            </button>
          </div>

        </div>
      )}

      {/* Modals */}
      <MealLogModal
        isOpen={isMealModalOpen}
        onClose={() => setIsMealModalOpen(false)}
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
