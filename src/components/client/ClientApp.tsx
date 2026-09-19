import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ClientAuth } from './ClientAuth';
import { MealLogModal } from './MealLogModal';
import { MeasurementModal } from './MeasurementModal';
import { MealType } from '../../types';
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
  LogOut,
  Building2,
  Calendar,
  HeartPulse,
  Clock,
  ShieldCheck,
  Check,
  X
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
    dismissSuggestedMeal
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
  const [planLoggedNotice, setPlanLoggedNotice] = useState<string | null>(null);

  if (!activeClient) {
    return <ClientAuth />;
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

  // Determine client goal requirement: Weight Loss vs Weight Gain
  const isWeightGainGoal = activeClient.goalType === 'gain' || 
    (!activeClient.goalType && /gain|bulk|surplus|muscle|build/i.test(activeClient.goal)) ||
    (activeClient.targetWeightKg > activeClient.currentWeightKg);

  const isWeightLossGoal = activeClient.goalType === 'loss' || (!activeClient.goalType && !isWeightGainGoal);

  // USER MANDATE:
  // "and if any clients requirement is weight loss the calorie lesser than the denominator will turn green else it will turn red
  //  and when the clients requirement is weight gain the numerator the calorie needed to be greater than the denominator in that case it will turn green else it will turn red"
  const isCalorieGreen = isWeightGainGoal
    ? (consumedTotals.calories >= targetCalories)
    : (consumedTotals.calories <= targetCalories);

  const caloriesRemaining = Math.max(0, targetCalories - consumedTotals.calories);
  const caloriesSurplus = Math.max(0, consumedTotals.calories - targetCalories);
  const caloriesPercent = targetCalories > 0 ? Math.round((consumedTotals.calories / targetCalories) * 100) : 0;

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
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* ================= WEBSITE CLIENT HERO BANNER ================= */}
      <div className="bg-linear-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
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
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => openLogForSlot('Breakfast')}
              className="bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-700" />
              <span>Log Meal</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMeasurementModalOpen(true)}
              className="bg-emerald-600/80 hover:bg-emerald-600 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all border border-emerald-400/40 flex items-center gap-2 cursor-pointer backdrop-blur-xs"
            >
              <Scale className="w-4 h-4" />
              <span>Record Scan</span>
            </button>

            <button
              type="button"
              onClick={clientSignOut}
              title="Sign Out of Portal"
              className="p-2.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-white/20"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

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

      {/* ================= TAB 1: TODAY'S CALORIE TRACKER & MEAL LOGS ================= */}
      {activeTab === 'today' && (
        <div className="space-y-6">
          
          {/* Date Selector Toolbar */}
          <div className="bg-white rounded-2xl p-3 shadow-2xs border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => changeDateBy(-1)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-xl border border-slate-200">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold text-slate-900">
                  {selectedDate === '2026-09-15' ? 'Today, Sep 15, 2026' : selectedDate}
                </span>
                <span className="text-xs text-slate-500">
                  ({clientLogsForDay.length} foods logged)
                </span>
              </div>

              <button
                type="button"
                onClick={() => changeDateBy(1)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {selectedDate !== '2026-09-15' && (
                <button
                  type="button"
                  onClick={() => setSelectedDate('2026-09-15')}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
                >
                  Jump to Today
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Real-time calorie &amp; macronutrient aggregation</span>
            </div>
          </div>

          {/* 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 8 Columns: Targets & Meal Slots */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Daily Target vs Consumed Summary Card */}
              <div className="bg-white rounded-3xl p-6 shadow-2xs border border-slate-200 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-amber-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Daily Calorie Target
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900">{consumedTotals.calories}</span>
                      <span className="text-sm sm:text-base font-semibold text-slate-500">/ {targetCalories} kcal</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-500 block">Remaining</span>
                      <span className="text-lg font-black text-emerald-700">{caloriesRemaining} kcal</span>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center font-bold text-emerald-800">
                      <span className="text-xs font-extrabold">{caloriesPercent}%</span>
                      <span className="text-[9px] uppercase tracking-tight text-emerald-600">Goal</span>
                    </div>
                  </div>
                </div>

                {/* Calorie Progress Bar */}
                <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      caloriesPercent > 105 ? 'bg-rose-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(100, caloriesPercent)}%` }}
                  />
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
              </div>

              {/* Suggested Meals from AI Chatbot */}
              {pendingSuggestions.length > 0 && (
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
              )}

              {/* Today's Meals Timeline Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-emerald-600" />
                    Today's Meals Timeline
                  </h2>
                  <span className="text-xs text-slate-400">Add or edit foods in each slot</span>
                </div>

                {(['Breakfast', 'Morning Snack', 'Lunch', 'Evening Snack', 'Dinner'] as MealType[]).map((slot) => {
                  const itemsInSlot = clientLogsForDay.filter(m => m.mealType === slot);
                  const slotCalories = itemsInSlot.reduce((sum, item) => sum + item.calories, 0);
                  const slotSuggestions = pendingSuggestions.filter(s => s.mealType === slot);

                  return (
                    <div key={slot} className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200 hover:border-slate-300 transition-all">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-900 text-sm">{slot}</span>
                          {slotCalories > 0 ? (
                            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                              {slotCalories} kcal
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">0 kcal</span>
                          )}
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
                          {itemsInSlot.map((item) => (
                            <div key={item.id} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                              <div>
                                <span className="font-bold text-slate-800">{item.foodName}</span>
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
                          ))}
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
                  );
                })}
              </div>

            </div>

            {/* Right 4 Columns: Assigned Coach, Reminders & Fast Actions */}
            <div className="lg:col-span-4 space-y-6">
              
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
                    Clinic Verified
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
                  Clinic Verified Coach
                </span>
              </div>
            </div>

            {/* Sign Out Action Button */}
            <button
              type="button"
              onClick={clientSignOut}
              className="w-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-bold text-xs sm:text-sm py-3 px-4 rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-200 hover:border-rose-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Client Portal</span>
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

    </div>
  );
};
