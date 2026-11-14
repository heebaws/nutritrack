import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { FoodCategory, FoodItem, MealType } from '../../types';
import { estimateNutrition } from '../../utils/nutritionEstimator';
import { determineCalorieQuality, CalorieQuality } from '../../utils/calorieQuality';
import { classifyFoodItem } from '../../utils/clinicalFoodAudit';
import { getFoodImageUrl, FOOD_FALLBACK_SVG } from '../../utils/foodImages';
import {
  X,
  Search,
  Plus,
  Check,
  Flame,
  Droplets,
  Sparkles,
  BookOpen,
  Camera,
  CheckCircle2,
  CheckCircle,
  AlertTriangle,
  Bot,
  Sunrise,
  Coffee,
  Utensils,
  Sunset,
  Moon
} from 'lucide-react';

interface MealLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewDay?: () => void;
  defaultMealType?: MealType;
}

const MEAL_SLOT_CONFIG: Array<{
  id: MealType;
  icon: React.ComponentType<{ className?: string }>;
  shortLabel: string;
}> = [
  { id: 'Breakfast', icon: Sunrise, shortLabel: 'Breakfast' },
  { id: 'Morning Snack', icon: Coffee, shortLabel: 'Morning Snack' },
  { id: 'Lunch', icon: Utensils, shortLabel: 'Lunch' },
  { id: 'Evening Snack', icon: Sunset, shortLabel: 'Evening Snack' },
  { id: 'Dinner', icon: Moon, shortLabel: 'Dinner' },
];

export const MealLogModal: React.FC<MealLogModalProps> = ({
  isOpen,
  onClose,
  onReviewDay,
  defaultMealType = 'Breakfast',
}) => {
  const {
    foods,
    mealLogs,
    addMealLog,
    addFoodItem,
    activeClientId,
    selectedDate,
    suggestedMeals,
    acceptSuggestedMeal,
    dismissSuggestedMeal,
    t,
    tf
  } = useApp();

  const [activeTab, setActiveTab] = useState<'library' | 'custom'>('library');
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [justAdded, setJustAdded] = useState(false);

  // Suggestions for this client, date, and active slot
  const relevantSuggestions = useMemo(() => {
    return suggestedMeals.filter(
      s => s.clientId === activeClientId && s.date === selectedDate && s.status === 'pending' && s.mealType === mealType
    );
  }, [suggestedMeals, activeClientId, selectedDate, mealType]);

  // Custom food fields
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<FoodCategory>('Proteins');
  const [customServing, setCustomServing] = useState('1 serving');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [saveToLibrary, setSaveToLibrary] = useState(true);
  const [isAiEstimating, setIsAiEstimating] = useState(false);
  const [aiEstimateNote, setAiEstimateNote] = useState<string | null>(null);
  // CRITICAL MANDATE: "Was it oily? 3 options"
  const [oilOption, setOilOption] = useState<'steamed' | 'medium' | 'fried'>('steamed');
  // USER MANDATE: Good Calories vs Bad Calories toggle (flexible per meal log, not fixed permanently to food)
  const [mealCalorieQuality, setMealCalorieQuality] = useState<CalorieQuality>('good');
  const [customQuality, setCustomQuality] = useState<CalorieQuality>('good');

  // NutriBot Live Search Extension states
  const [searchExtensionOil, setSearchExtensionOil] = useState<'steamed' | 'medium' | 'fried'>('steamed');
  const [searchExtensionQuality, setSearchExtensionQuality] = useState<CalorieQuality>('good');
  const [searchExtensionQty, setSearchExtensionQty] = useState<number>(1);
  const [extensionAddedNotice, setExtensionAddedNotice] = useState<string | null>(null);

  const searchExtensionFood = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 1) return null;
    return estimateNutrition(searchQuery.trim());
  }, [searchQuery]);

  // MANDATE: "the extention of nutribot in log food will work just by name wegets the extention"
  // Auto-resolve custom food by name with debouncing
  useEffect(() => {
    if (activeTab !== 'custom' || !customName.trim()) {
      return;
    }
    const timer = setTimeout(() => {
      const est = estimateNutrition(customName);
      setCustomCalories(String(est.calories));
      setCustomProtein(String(est.protein));
      setCustomCarbs(String(est.carbs));
      setCustomFat(String(est.fat));
      setCustomServing(est.servingUnit);
      setCustomCategory(est.category);
      setAiEstimateNote(`✨ NutriBot Extension: Auto-filled by name (${est.servingUnit})`);
    }, 120);

    return () => clearTimeout(timer);
  }, [customName, activeTab]);

  const handleLogViaNutribotExtension = () => {
    if (!activeClientId || !searchExtensionFood) return;

    const oilCal = searchExtensionOil === 'fried' ? 120 : searchExtensionOil === 'medium' ? 45 : 0;
    const oilFat = searchExtensionOil === 'fried' ? 13 : searchExtensionOil === 'medium' ? 5 : 0;
    const qty = Math.max(0.1, Number(searchExtensionQty) || 1);

    const totalCal = Math.round((searchExtensionFood.calories + oilCal) * qty);
    const totalProt = Number((searchExtensionFood.protein * qty).toFixed(1));
    const totalCarb = Number((searchExtensionFood.carbs * qty).toFixed(1));
    const totalFat = Number(((searchExtensionFood.fat + oilFat) * qty).toFixed(1));

    const prepLabel =
      searchExtensionOil === 'fried' ? 'Deep Fried' :
      searchExtensionOil === 'medium' ? 'Medium Sauté' :
      'Steamed / No Oil';

    const quality = determineCalorieQuality(
      searchExtensionFood.name,
      searchExtensionFood.category,
      searchExtensionOil
    );

    // 1. Add to clinic food library
    const savedFood = addFoodItem({
      name: searchExtensionFood.name,
      category: searchExtensionFood.category,
      servingUnit: searchExtensionFood.servingUnit,
      calories: searchExtensionFood.calories,
      protein: searchExtensionFood.protein,
      carbs: searchExtensionFood.carbs,
      fat: searchExtensionFood.fat,
      fiber: searchExtensionFood.fiber,
      glycemicIndex: searchExtensionFood.glycemicIndex as any,
      calorieQuality: quality
    });

    // 2. Add to client's daily meal log with per-meal flexible calorie quality
    addMealLog({
      clientId: activeClientId,
      date: selectedDate,
      mealType,
      foodId: savedFood.id,
      foodName: `${searchExtensionFood.name} (${prepLabel})`,
      quantity: qty,
      servingUnit: searchExtensionFood.servingUnit,
      calories: totalCal,
      protein: totalProt,
      carbs: totalCarb,
      fat: totalFat,
      calorieQuality: searchExtensionQuality
    });

    setExtensionAddedNotice(`✓ Logged ${qty}x ${searchExtensionFood.name} (${totalCal} kcal) to ${mealType}!`);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      setExtensionAddedNotice(null);
      onClose();
    }, 700);
  };

  const handleAiEstimate = async () => {
    if (!customName.trim()) return;
    setIsAiEstimating(true);
    setAiEstimateNote(null);
    try {
      const localEst = estimateNutrition(customName);
      setCustomCalories(String(localEst.calories));
      setCustomProtein(String(localEst.protein));
      setCustomCarbs(String(localEst.carbs));
      setCustomFat(String(localEst.fat));
      setCustomServing(localEst.servingUnit);
      setCustomCategory(localEst.category);
      setAiEstimateNote(`✨ Auto-filled by NutriBot AI (${localEst.servingUnit})`);

      // Attempt server refinement in background
      fetch('/api/ai/estimate-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: customName })
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.food) {
          setCustomCalories(String(data.food.calories));
          setCustomProtein(String(data.food.protein));
          setCustomCarbs(String(data.food.carbs));
          setCustomFat(String(data.food.fat));
          if (data.food.servingUnit) setCustomServing(data.food.servingUnit);
          if (data.food.category) setCustomCategory(data.food.category as FoodCategory);
        }
      })
      .catch(() => {});
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiEstimating(false);
    }
  };

  const photoInputRef = useRef<HTMLInputElement>(null);
  const [isPhotoScanning, setIsPhotoScanning] = useState(false);

  const handlePhotoScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPhotoScanning(true);
    setAiEstimateNote(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch('/api/ai/analyze-meal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: file.type || 'image/jpeg'
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.plateSummary) setCustomName(data.plateSummary);
          if (data.totalCalories) setCustomCalories(String(data.totalCalories));
          if (data.totalProtein) setCustomProtein(String(data.totalProtein));
          if (data.totalCarbs) setCustomCarbs(String(data.totalCarbs));
          if (data.totalFat) setCustomFat(String(data.totalFat));
          setCustomServing('1 meal plate');
          if (data.cookingMethod === 'Deep Fried') setOilOption('fried');
          else if (data.cookingMethod === 'Medium Sauté') setOilOption('medium');
          else setOilOption('steamed');

          setAiEstimateNote(`✨ Plate scanned by Gemini 3.8 Flash: ${data.dietitianVerdict || 'Nutrition calibrated'}`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsPhotoScanning(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  useEffect(() => {
    if (isOpen) {
      setMealType(defaultMealType);
      setSelectedFood(null);
      setQuantity(1);
      setSearchQuery('');
      setCategoryFilter('All');
      setJustAdded(false);
      setActiveTab('library');
      setCustomName('');
      setCustomCalories('');
      setCustomProtein('');
      setCustomCarbs('');
      setCustomFat('');
      setCustomServing('1 serving');
      setSaveToLibrary(true);
      setOilOption('steamed');
    }
  }, [isOpen, defaultMealType]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const categories: string[] = [
    'All',
    '🌴 Kerala Snacks',
    'Proteins',
    'Grains & Breads',
    'Vegetables',
    'Fruits',
    'Dairy & Alternatives',
    'Nuts & Healthy Fats',
    'Beverages & Snacks'
  ];

  const filteredFoods = useMemo(() => {
    const keralaKeywords = ['pazham', 'vada', 'ada', 'upperi', 'chips', 'unniyappam', 'neyyappam', 'sukhiyan', 'kozhukkatta', 'halwa', 'puttu', 'kadala', 'bajji', 'achappam'];
    return foods.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = item.name.toLowerCase().includes(q) || tf(item.name).toLowerCase().includes(q);
      if (categoryFilter === '🌴 Kerala Snacks') {
        const isKerala = keralaKeywords.some(kw => item.name.toLowerCase().includes(kw)) || item.id.startsWith('kl-') || /[\u0D00-\u0D7F]/.test(item.name);
        return matchesSearch && isKerala;
      }
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [foods, searchQuery, categoryFilter, tf]);

  // Slot-specific history-first ordering: previous foods added in THIS meal slot appear FIRST in order
  const { orderedFoods, previousFoodIds } = useMemo(() => {
    const normalizeName = (raw: string) =>
      (raw || '')
        .replace(/\s*\((?:Steamed\s*\/\s*No Oil|Medium Sauté|Deep Fried[^)]*|Steamed)\)\s*$/i, '')
        .trim()
        .toLowerCase();

    const slotLogs = mealLogs
      .filter(m => m.clientId === activeClientId && m.mealType === mealType)
      .slice()
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    const rankById = new Map<string, number>();
    const rankByName = new Map<string, number>();

    slotLogs.forEach((log, idx) => {
      if (log.foodId && !rankById.has(log.foodId)) {
        rankById.set(log.foodId, idx);
      }
      const norm = normalizeName(log.foodName);
      if (norm && !rankByName.has(norm)) {
        rankByName.set(norm, idx);
      }
    });

    const prevIds = new Set<string>();
    const withRank: Array<{ food: FoodItem; rank: number }> = [];
    const rest: FoodItem[] = [];

    filteredFoods.forEach(food => {
      const idRank = rankById.get(food.id);
      const nameRank = rankByName.get(normalizeName(food.name));
      const rank = idRank !== undefined ? idRank : nameRank;
      if (rank !== undefined) {
        prevIds.add(food.id);
        withRank.push({ food, rank });
      } else {
        rest.push(food);
      }
    });

    withRank.sort((a, b) => a.rank - b.rank);
    return {
      orderedFoods: [...withRank.map(x => x.food), ...rest],
      previousFoodIds: prevIds,
    };
  }, [filteredFoods, mealLogs, activeClientId, mealType]);

  // Oil calculation adjustments:
  // Steamed = +0 kcal, +0g fat
  // Medium = +45 kcal, +5g fat
  // Fried = +120 kcal, +13g fat
  const oilCal = oilOption === 'fried' ? 120 : oilOption === 'medium' ? 45 : 0;
  const oilFat = oilOption === 'fried' ? 13 : oilOption === 'medium' ? 5 : 0;

  const calculatedNutrition = useMemo(() => {
    if (!selectedFood) return null;
    const qty = Math.max(0.1, Number(quantity) || 1);
    return {
      calories: Math.round((selectedFood.calories + oilCal) * qty),
      protein: Number((selectedFood.protein * qty).toFixed(1)),
      carbs: Number((selectedFood.carbs * qty).toFixed(1)),
      fat: Number(((selectedFood.fat + oilFat) * qty).toFixed(1)),
    };
  }, [selectedFood, quantity, oilCal, oilFat]);

  const customCalculatedNutrition = useMemo(() => {
    const cCal = (parseFloat(customCalories) || 0) + oilCal;
    const cProt = parseFloat(customProtein) || 0;
    const cCarb = parseFloat(customCarbs) || 0;
    const cFat = (parseFloat(customFat) || 0) + oilFat;
    const qty = Math.max(0.1, Number(quantity) || 1);

    return {
      calories: Math.round(cCal * qty),
      protein: Number((cProt * qty).toFixed(1)),
      carbs: Number((cCarb * qty).toFixed(1)),
      fat: Number((cFat * qty).toFixed(1)),
    };
  }, [customCalories, customProtein, customCarbs, customFat, quantity, oilCal, oilFat]);

  if (!isOpen) return null;

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setOilOption('steamed');
    const initialQual = food.calorieQuality || determineCalorieQuality(food.name, food.category, 'steamed');
    setMealCalorieQuality(initialQual);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClientId) return;

    const prepLabel = oilOption === 'fried' ? 'Deep Fried' : oilOption === 'medium' ? 'Medium Sauté' : 'Steamed / No Oil';

    if (activeTab === 'library') {
      if (!selectedFood || !calculatedNutrition) return;

      addMealLog({
        clientId: activeClientId,
        date: selectedDate,
        mealType,
        foodId: selectedFood.id,
        foodName: `${selectedFood.name} (${prepLabel})`,
        quantity: Number(quantity) || 1,
        servingUnit: selectedFood.servingUnit,
        calories: calculatedNutrition.calories,
        protein: calculatedNutrition.protein,
        carbs: calculatedNutrition.carbs,
        fat: calculatedNutrition.fat,
        calorieQuality: mealCalorieQuality
      });
    } else {
      // Custom food entry
      if (!customName.trim() || !customCalories) return;

      const cCal = parseFloat(customCalories) || 0;
      const cProt = parseFloat(customProtein) || 0;
      const cCarb = parseFloat(customCarbs) || 0;
      const cFat = parseFloat(customFat) || 0;

      let foodId = `custom-${Date.now()}`;

      if (saveToLibrary) {
        const newFood = addFoodItem({
          name: customName.trim(),
          category: customCategory,
          servingUnit: customServing.trim() || '1 serving',
          calories: cCal,
          protein: cProt,
          carbs: cCarb,
          fat: cFat,
          fiber: 0,
          glycemicIndex: 'medium',
          allergenInfo: 'None',
          clinicVerified: true,
          dietaryTags: ['Custom'],
          calorieQuality: customQuality
        });
        foodId = newFood.id;
      }

      addMealLog({
        clientId: activeClientId,
        date: selectedDate,
        mealType,
        foodId,
        foodName: `${customName.trim()} (${prepLabel})`,
        quantity: Number(quantity) || 1,
        servingUnit: customServing.trim() || '1 serving',
        calories: customCalculatedNutrition.calories,
        protein: customCalculatedNutrition.protein,
        carbs: customCalculatedNutrition.carbs,
        fat: customCalculatedNutrition.fat,
        calorieQuality: customQuality
      });
    }

    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      onClose();
      // Reset form
      setSelectedFood(null);
      setQuantity(1);
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF8F4] w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E7E0D3] flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in fade-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Warm Editorial Header */}
        <div className="px-5 py-4 bg-[#F5F1E8] border-b border-[#E7E0D3] flex items-center justify-between gap-2 shrink-0">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight truncate">
              {t("Add Day's Calories & Meals")}
            </h2>
            <p className="text-xs text-slate-600 truncate">
              {t('Pick from food database or add a new food with calories')}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                onClose();
                window.dispatchEvent(new CustomEvent('open-nutribot', { detail: { query: searchQuery || customName || '' } }));
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl border border-[#DFD8C8] transition-colors cursor-pointer shadow-2xs"
              title={t('Open NutriBot AI Assistant chat')}
            >
              <Bot className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t('Ask NutriBot')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('Close')}
              className="w-9 h-9 rounded-xl bg-white hover:bg-rose-50 border border-[#DFD8C8] text-slate-700 hover:text-rose-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector: Library vs Custom Food */}
        <div className="px-5 pt-2.5 pb-0 flex border-b border-[#E7E0D3] bg-[#F5F1E8]/60 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'library'
                ? 'border-emerald-700 text-emerald-900 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t('Centre Food Library')} ({foods.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'custom'
                ? 'border-emerald-700 text-emerald-900 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('Add Custom Food & Calories')}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Visual 5-Slot Meal Selector (Icons + Full Non-Truncated Labels) */}
          <div className="bg-white rounded-2xl p-2 border border-[#E7E0D3] shadow-2xs">
            <div className="grid grid-cols-5 gap-1">
              {MEAL_SLOT_CONFIG.map((slot) => {
                const IconComp = slot.icon;
                const isSelected = mealType === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setMealType(slot.id)}
                    className={`py-2 px-1 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 text-center cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50 border-amber-400 text-amber-950 ring-1 ring-amber-300 font-bold shadow-2xs'
                        : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <IconComp className={`w-5 h-5 ${isSelected ? 'text-amber-700' : 'text-emerald-800'}`} />
                    <span className="text-[10px] sm:text-[11px] font-bold leading-tight">
                      {t(slot.shortLabel)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pending AI Chat Suggestions for this Slot */}
          {relevantSuggestions.length > 0 && (
            <div className="p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span className="text-xs font-black text-emerald-950">
                    Suggested from NutriBot Chat ({mealType})
                  </span>
                </div>
                <span className="text-[11px] font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                  🔥 {relevantSuggestions[0].totalCalories} kcal Total
                </span>
              </div>

              <p className="text-[11px] text-slate-600">
                You reported eating this at <strong className="text-slate-900">{relevantSuggestions[0].timeGiven}</strong>. Each food's calories are verified below:
              </p>

              <div className="space-y-1.5">
                {relevantSuggestions[0].foods.map((food, fIdx) => (
                  <div
                    key={fIdx}
                    className="p-2 bg-white rounded-xl border border-emerald-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-extrabold text-slate-900 block">{food.name}</span>
                      <span className="text-[10px] text-slate-500">{food.quantity}x ({food.servingUnit})</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md text-xs">
                        🔥 {food.calories} kcal
                      </span>
                      <div className="text-[9px] text-slate-400 mt-0.5">
                        P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-emerald-200">
                <button
                  type="button"
                  onClick={() => dismissSuggestedMeal(relevantSuggestions[0].id)}
                  className="px-3 py-1 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={() => {
                    acceptSuggestedMeal(relevantSuggestions[0].id);
                    setJustAdded(true);
                    setTimeout(() => {
                      setJustAdded(false);
                      onClose();
                    }, 600);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept This Suggestion</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'library' ? (
            /* ================= TAB 1: LIBRARY SEARCH & SELECT ================= */
            <>
              {selectedFood ? (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wide">
                        {selectedFood.category}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base">{selectedFood.name}</h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Standard serving: <span className="font-medium">{selectedFood.servingUnit}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFood(null)}
                      className="text-xs text-emerald-700 hover:text-emerald-900 underline font-medium cursor-pointer"
                    >
                      Change Food
                    </button>
                  </div>

                  {/* Real-time Coach Clinical Advisory & Frequency Limit */}
                  {(() => {
                    const audit = classifyFoodItem(selectedFood.name, selectedFood.category, oilOption);
                    if (audit.isProblemFood) {
                      return (
                        <div className="p-3 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-1.5 animate-in fade-in">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-600 text-white flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {audit.tierLabel}
                            </span>
                            <span className="text-[10px] font-bold text-rose-800">
                              Coach Saleem Advisory
                            </span>
                          </div>
                          <p className="text-xs text-rose-900 font-semibold leading-snug">
                            {audit.coachWarning}
                          </p>
                          <p className="text-[11px] text-rose-800 leading-snug">
                            {audit.clinicalReason}
                          </p>
                          <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200 text-emerald-950 text-[11px] space-y-0.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                              🔄 Suggested Healthy Swap:
                            </span>
                            <span className="font-bold text-emerald-900">{audit.recommendedSwap.name}</span>
                            <p className="text-[10px] text-emerald-700">{audit.recommendedSwap.description}</p>
                          </div>
                        </div>
                      );
                    } else if (audit.isSuperFood) {
                      return (
                        <div className="p-2.5 rounded-2xl bg-emerald-100/80 border border-emerald-300 text-emerald-950 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                          <div>
                            <span className="text-xs font-black text-emerald-900 block">
                              🌟 Coach Saleem Approved Superfood
                            </span>
                            <span className="text-[11px] text-emerald-800 font-medium leading-snug">
                              {audit.healthBenefits || audit.frequencyGuideline}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Quantity Input */}
                  <div className="pt-2 border-t border-emerald-200/60">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <label htmlFor="quantity-input" className="text-xs font-semibold text-slate-700">
                        Portions / Servings:
                      </label>
                      <div className="flex items-center gap-2">
                        {[0.5, 1, 1.5, 2].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setQuantity(preset)}
                            className={`text-xs px-2 py-0.5 rounded-md border font-medium transition-colors cursor-pointer ${
                              quantity === preset
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {preset}x
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        id="quantity-input"
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="20"
                        value={quantity}
                        onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                        className="w-24 px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-slate-600">
                        x {selectedFood.servingUnit}
                      </span>
                    </div>
                  </div>

                  {/* Was it oily? 3 options */}
                  <div className="pt-2 border-t border-emerald-200/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-amber-600" />
                        Was it oily? (3 Options):
                      </label>
                      <span className="text-[10px] font-bold text-amber-800">
                        {oilCal > 0 ? `+${oilCal * (Number(quantity) || 1)} kcal oil` : '0 oil kcal'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'steamed', label: '🟢 Steamed / No Oil', sub: '+0 kcal' },
                        { id: 'medium', label: '🟡 Medium Sauté', sub: '+45 kcal' },
                        { id: 'fried', label: '🔴 Deep Fried', sub: '+120 kcal' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setOilOption(opt.id as any)}
                          className={`p-1.5 rounded-lg text-center border transition-all cursor-pointer ${
                            oilOption === opt.id
                              ? 'bg-amber-100 border-amber-400 text-amber-950 font-black ring-1 ring-amber-300'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="text-[11px] font-bold leading-tight">{opt.label}</div>
                          <div className="text-[9px] text-slate-500">{opt.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Good vs Bad Calorie Toggle (Flexible per log, not permanently fixed) */}
                  <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">Calorie Quality:</span>
                      <span className="text-[10px] text-slate-500">Flexible each time (not permanently fixed)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setMealCalorieQuality('good')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          mealCalorieQuality === 'good'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        🟢 Good Calories
                      </button>
                      <button
                        type="button"
                        onClick={() => setMealCalorieQuality('bad')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          mealCalorieQuality === 'bad'
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        🔴 Bad / Treat
                      </button>
                    </div>
                  </div>

                  {/* Calculated Calorie & Macro breakdown */}
                  {calculatedNutrition && (
                    <div className="bg-white p-3 rounded-lg border border-emerald-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600 font-medium">Added to Today's Calories:</span>
                        <span className="text-base font-black text-emerald-700 flex items-center gap-1">
                          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                          {calculatedNutrition.calories} kcal
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Protein</span>
                          <span className="font-bold text-blue-700">{calculatedNutrition.protein}g</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Carbs</span>
                          <span className="font-bold text-amber-700">{calculatedNutrition.carbs}g</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Fats</span>
                          <span className="font-bold text-rose-700">{calculatedNutrition.fat}g</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Search Input + Clean Category Dropdown Side-by-Side (No horizontal scrollbar) */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 min-w-0">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('Search food database...')}
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#DFD8C8] rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                      />
                    </div>

                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      aria-label={t('Category')}
                      className="w-36 sm:w-44 py-2.5 px-2.5 bg-white border border-[#DFD8C8] rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden cursor-pointer shrink-0"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat === 'All' ? t('All Categories') : t(cat.replace('🌴 ', ''))}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Feedback notice when logged via NutriBot Extension */}
                  {extensionAddedNotice && (
                    <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs px-3 py-2 rounded-xl flex items-center gap-2 font-bold animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{extensionAddedNotice}</span>
                    </div>
                  )}

                  {/* 🤖 NutriBot AI Live Extension Card: Appears in real-time as user types any food name! */}
                  {searchExtensionFood && (
                    <div className="p-3.5 bg-linear-to-br from-emerald-50 via-teal-50 to-amber-50/50 rounded-2xl border-2 border-emerald-400 shadow-sm space-y-2.5 animate-fadeIn">
                      {/* Header */}
                      <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                          <span className="text-xs font-black text-slate-900 tracking-tight">
                            NutriBot AI Extension: Live Food Resolution
                          </span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded-full">
                          {searchExtensionFood.category}
                        </span>
                      </div>

                      {/* Food name & serving */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">
                            {searchExtensionFood.name}
                          </h4>
                          <p className="text-[11px] text-slate-600 font-medium">
                            Standard serving: <strong>{searchExtensionFood.servingUnit}</strong>
                          </p>
                        </div>

                        {/* Calories Stated First in Bold */}
                        <div className="text-right shrink-0 bg-amber-100 border border-amber-300 px-3 py-1 rounded-xl shadow-2xs">
                          <span className="text-[10px] font-black uppercase text-amber-800 block">
                            Calories First Check
                          </span>
                          <span className="text-sm font-black text-amber-950">
                            🔥 {Math.round((searchExtensionFood.calories + (searchExtensionOil === 'fried' ? 120 : searchExtensionOil === 'medium' ? 45 : 0)) * searchExtensionQty)} kcal
                          </span>
                        </div>
                      </div>

                      {/* Was it oily? 3 Cooking Options */}
                      <div className="p-2 bg-white rounded-xl border border-emerald-200 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-700 flex items-center gap-1">
                            <Droplets className="w-3 h-3 text-amber-600" />
                            Was it oily? (3 Cooking Options):
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            {searchExtensionOil === 'fried' ? '+120 kcal' : searchExtensionOil === 'medium' ? '+45 kcal' : 'Base 0g fat'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          {[
                            { id: 'steamed', label: '🟢 Steamed / No Oil', sub: '+0 kcal' },
                            { id: 'medium', label: '🟡 Medium Sauté', sub: '+45 kcal' },
                            { id: 'fried', label: '🔴 Deep Fried', sub: '+120 kcal' },
                          ].map(opt => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setSearchExtensionOil(opt.id as any)}
                              className={`py-1 px-1.5 rounded-lg text-center border transition-all cursor-pointer ${
                                searchExtensionOil === opt.id
                                  ? 'bg-amber-100 border-amber-400 text-amber-950 font-black shadow-2xs ring-1 ring-amber-300'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <div className="text-[10px] font-bold leading-tight">{opt.label}</div>
                              <div className="text-[9px] text-slate-500">{opt.sub}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Macros & Quantity */}
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <div className="text-[10px] font-bold text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200">
                          P: <strong>{(searchExtensionFood.protein * searchExtensionQty).toFixed(1)}g</strong> • 
                          C: <strong>{(searchExtensionFood.carbs * searchExtensionQty).toFixed(1)}g</strong> • 
                          F: <strong>{((searchExtensionFood.fat + (searchExtensionOil === 'fried' ? 13 : searchExtensionOil === 'medium' ? 5 : 0)) * searchExtensionQty).toFixed(1)}g</strong>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold text-slate-500">Qty:</span>
                          {[0.5, 1, 1.5, 2].map(p => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setSearchExtensionQty(p)}
                              className={`px-1.5 py-0.5 text-[10px] font-black rounded-md transition-colors cursor-pointer ${
                                searchExtensionQty === p
                                  ? 'bg-emerald-700 text-white shadow-2xs'
                                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {p}x
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Calorie Quality Option (Flexible each time) */}
                      <div className="flex items-center justify-between p-1.5 bg-white rounded-xl border border-emerald-200">
                        <span className="text-[10px] font-bold text-slate-700">Calorie Quality:</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSearchExtensionQuality('good')}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                              searchExtensionQuality === 'good'
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            🟢 Good
                          </button>
                          <button
                            type="button"
                            onClick={() => setSearchExtensionQuality('bad')}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                              searchExtensionQuality === 'bad'
                                ? 'bg-rose-600 text-white shadow-2xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            🔴 Bad / Treat
                          </button>
                        </div>
                      </div>

                      {/* 1-Click Log with NutriBot Extension Button */}
                      <button
                        type="button"
                        onClick={handleLogViaNutribotExtension}
                        className="w-full py-2 px-3 bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>➕ 1-Click Log with NutriBot Extension to {mealType}</span>
                      </button>
                    </div>
                  )}

                  {/* Food Cards List with Photos & Previous-First Slot Ordering */}
                  <div className="max-h-72 overflow-y-auto space-y-2 pr-0.5">
                    {orderedFoods.length > 0 ? (
                      orderedFoods.map((food) => {
                        const isPreviousInSlot = previousFoodIds.has(food.id);
                        return (
                          <button
                            key={food.id}
                            type="button"
                            onClick={() => handleSelectFood(food)}
                            className={`w-full p-2.5 text-left rounded-2xl border transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                              isPreviousInSlot
                                ? 'bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50'
                                : 'bg-white border-[#E7E0D3] hover:border-emerald-300 hover:bg-emerald-50/30'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <img
                                src={getFoodImageUrl(food.name, food.category)}
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = FOOD_FALLBACK_SVG;
                                }}
                                referrerPolicy="no-referrer"
                                alt={food.name}
                                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 bg-emerald-50"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-emerald-800 leading-snug">
                                    {tf(food.name)}
                                  </span>
                                  {isPreviousInSlot && (
                                    <span className="text-[10px] font-bold text-emerald-700">
                                      · {t('Usual')} ({t(mealType)})
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums truncate">
                                  {food.servingUnit} · <strong className="text-slate-900">{food.calories} kcal</strong> · P:{food.protein}g C:{food.carbs}g F:{food.fat}g
                                </div>
                              </div>
                            </div>

                            <div className="w-9 h-9 rounded-full border border-emerald-200 bg-emerald-50/70 group-hover:bg-emerald-700 group-hover:text-white group-hover:border-emerald-700 flex items-center justify-center text-emerald-800 transition-colors shrink-0">
                              <Plus className="w-4 h-4" />
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-500 space-y-2 bg-white rounded-2xl border border-[#E7E0D3]">
                        <p>No catalog foods matching &quot;{searchQuery}&quot;.</p>
                        {searchExtensionFood ? (
                          <p className="text-emerald-700 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                            ✨ NutriBot has resolved <strong>{searchExtensionFood.name}</strong>! Tap the green button above to log it to your {t(mealType)} diary with 1-click.
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setCustomName(searchQuery);
                              setActiveTab('custom');
                            }}
                            className="text-xs text-emerald-700 font-bold underline cursor-pointer"
                          >
                            + Create &quot;{searchQuery}&quot; as a custom food
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ================= TAB 2: ADD CUSTOM FOOD & CALORIES ================= */
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Food Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="file"
                      ref={photoInputRef}
                      onChange={handlePhotoScan}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={isPhotoScanning}
                      className="text-[11px] font-bold text-teal-800 bg-teal-100 hover:bg-teal-200 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40 border border-teal-300 shadow-2xs"
                      title="Take or upload food photo to analyze with Gemini 3.8 Flash"
                    >
                      <Camera className="w-3 h-3 text-teal-700" />
                      <span>{isPhotoScanning ? 'Scanning Plate...' : '📸 Scan Plate Photo'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAiEstimate}
                      disabled={isAiEstimating || !customName.trim()}
                      className="text-[11px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 border border-emerald-300 shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>{isAiEstimating ? 'Estimating...' : '✨ Auto-Fill with AI'}</span>
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. bread, boiled egg, chicken breast, avocado"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                {aiEstimateNote && (
                  <p className="text-[11px] font-bold text-emerald-700 mt-1 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    {aiEstimateNote}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as FoodCategory)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  >
                    <option value="Proteins">Proteins</option>
                    <option value="Grains & Breads">Grains &amp; Breads</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Dairy & Alternatives">Dairy &amp; Alternatives</option>
                    <option value="Nuts & Healthy Fats">Nuts &amp; Healthy Fats</option>
                    <option value="Beverages & Snacks">Beverages &amp; Snacks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Serving Unit
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1 plate, 1 cup, 150g"
                    value={customServing}
                    onChange={(e) => setCustomServing(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-amber-800 mb-1">
                    Calories (kcal) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 280"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-blue-800 mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="e.g. 15"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-700 mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="e.g. 30"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-rose-700 mb-1">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="e.g. 8"
                    value={customFat}
                    onChange={(e) => setCustomFat(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Was it oily? 3 options for Custom Food */}
              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-amber-600" />
                    Was this food oily? (3 Options):
                  </span>
                  <span className="text-[10px] font-bold text-amber-800">
                    {oilCal > 0 ? `+${oilCal * (Number(quantity) || 1)} kcal oil` : '0 oil kcal'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'steamed', label: '🟢 Steamed / No Oil', sub: '+0 kcal' },
                    { id: 'medium', label: '🟡 Medium Sauté', sub: '+45 kcal' },
                    { id: 'fried', label: '🔴 Deep Fried', sub: '+120 kcal' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setOilOption(opt.id as any)}
                      className={`p-1.5 rounded-lg text-center border transition-all cursor-pointer ${
                        oilOption === opt.id
                          ? 'bg-amber-100 border-amber-400 text-amber-950 font-black ring-1 ring-amber-300'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-[11px] font-bold">{opt.label}</div>
                      <div className="text-[9px] text-slate-500">{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* USER MANDATE: Good Calories vs Bad / Cheat Calories Classification */}
              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Calorie Quality:
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Classifies toward Good vs Bad ratio
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomQuality('good')}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      customQuality === 'good'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-black ring-1 ring-emerald-300'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>🍏</span>
                      <span>Good Calories</span>
                    </div>
                    <div className="text-[10px] text-emerald-700 mt-0.5">Wholesome, protein, clean food</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustomQuality('bad')}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      customQuality === 'bad'
                        ? 'bg-amber-50 border-amber-400 text-amber-950 font-black ring-1 ring-amber-300'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>🍟</span>
                      <span>Bad / Cheat Calories</span>
                    </div>
                    <div className="text-[10px] text-amber-700 mt-0.5">Fried, sugary, junk, cheat food</div>
                  </button>
                </div>
              </div>

              {/* Portions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Portions consumed:</span>
                <div className="flex items-center gap-2">
                  {[0.5, 1, 1.5, 2].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setQuantity(preset)}
                      className={`text-xs px-2 py-0.5 rounded-md border font-medium transition-colors cursor-pointer ${
                        quantity === preset
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {preset}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Calculation Preview */}
              {customCalories && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-emerald-900 font-semibold">Total Day's Calories to Add:</span>
                  <span className="text-base font-black text-emerald-800 flex items-center gap-1">
                    <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                    {customCalculatedNutrition.calories} kcal
                  </span>
                </div>
              )}

              {/* Save to site database checkbox */}
              <label className="flex items-center gap-2 pt-1 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={saveToLibrary}
                  onChange={(e) => setSaveToLibrary(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>Add this food item to the site database so others can log it too</span>
              </label>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-[#E7E0D3] bg-[#F5F1E8] flex items-center justify-between gap-2 shrink-0">
          {onReviewDay ? (
            <button
              type="button"
              onClick={onReviewDay}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer px-2 py-1"
            >
              {t('Review Day')}
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl transition-colors cursor-pointer"
            >
              {t('Cancel')}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                justAdded ||
                (activeTab === 'library' && !selectedFood) ||
                (activeTab === 'custom' && (!customName.trim() || !customCalories))
              }
              className="px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-900 hover:to-emerald-800 text-white rounded-xl transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t('Recorded!')}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{t(`Save to ${mealType}`)}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
