import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FoodCategory, FoodItem, MealType } from '../../types';
import { X, Search, Plus, Check, Flame, Dumbbell, Wheat, Droplets, Sparkles, BookOpen } from 'lucide-react';

interface MealLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMealType?: MealType;
}

export const MealLogModal: React.FC<MealLogModalProps> = ({
  isOpen,
  onClose,
  defaultMealType = 'Breakfast',
}) => {
  const {
    foods,
    addMealLog,
    addFoodItem,
    activeClientId,
    selectedDate,
    suggestedMeals,
    acceptSuggestedMeal,
    dismissSuggestedMeal
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

  const handleAiEstimate = async () => {
    if (!customName.trim()) return;
    setIsAiEstimating(true);
    setAiEstimateNote(null);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Nutrition macros for ${customName}` })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.food) {
          setCustomCalories(String(data.food.calories));
          setCustomProtein(String(data.food.protein));
          setCustomCarbs(String(data.food.carbs));
          setCustomFat(String(data.food.fat));
          if (data.food.servingUnit) setCustomServing(data.food.servingUnit);
          if (data.food.category) setCustomCategory(data.food.category as FoodCategory);
          setAiEstimateNote(`✨ Auto-filled by NutriBot AI (${data.food.servingUnit})`);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiEstimating(false);
    }
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
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (categoryFilter === '🌴 Kerala Snacks') {
        const isKerala = keralaKeywords.some(kw => item.name.toLowerCase().includes(kw)) || item.id.startsWith('kl-');
        return matchesSearch && isKerala;
      }
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [foods, searchQuery, categoryFilter]);

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
          dietaryTags: ['Custom']
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Add Day's Calories &amp; Meals</h2>
            <p className="text-xs text-slate-500">Pick from food database or add a new food with calories</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector: Library vs Custom Food */}
        <div className="px-5 pt-3 pb-0 flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'library'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Clinic Food Library ({foods.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'custom'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Food &amp; Calories</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Meal Slot Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
              Meal Slot
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {(['Breakfast', 'Morning Snack', 'Lunch', 'Evening Snack', 'Dinner'] as MealType[]).map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setMealType(slot)}
                  className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-all text-center truncate cursor-pointer ${
                    mealType === slot
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {slot}
                </button>
              ))}
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
                  {/* Search input */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search food by name (e.g. Oats, Egg, Chicken, Apple)..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoryFilter(cat)}
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                          categoryFilter === cat
                            ? 'bg-slate-900 text-white font-bold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Food items list */}
                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white">
                    {filteredFoods.length > 0 ? (
                      filteredFoods.map((food) => (
                        <button
                          key={food.id}
                          type="button"
                          onClick={() => handleSelectFood(food)}
                          className="w-full p-2.5 text-left hover:bg-emerald-50/50 transition-colors flex items-center justify-between group cursor-pointer"
                        >
                          <div>
                            <div className="font-semibold text-slate-900 text-xs group-hover:text-emerald-700">
                              {food.name}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {food.servingUnit} • <span className="font-semibold text-emerald-700">{food.calories} kcal</span> • P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                            </div>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center text-slate-500 transition-colors">
                            <Plus className="w-3.5 h-3.5" />
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                        <p>No foods found matching "{searchQuery}".</p>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomName(searchQuery);
                            setActiveTab('custom');
                          }}
                          className="text-xs text-emerald-700 font-bold underline cursor-pointer"
                        >
                          + Create "{searchQuery}" as a custom food
                        </button>
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
                  <button
                    type="button"
                    onClick={handleAiEstimate}
                    disabled={isAiEstimating || !customName.trim()}
                    className="text-[11px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 border border-emerald-300 shadow-2xs"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>{isAiEstimating ? 'NutriBot Estimating...' : '✨ Auto-Fill with NutriBot AI'}</span>
                  </button>
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
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              justAdded ||
              (activeTab === 'library' && !selectedFood) ||
              (activeTab === 'custom' && (!customName.trim() || !customCalories))
            }
            className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Recorded!</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Save to {mealType}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
