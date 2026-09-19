import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DietPlan, MealType, RecommendedFood } from '../../types';
import { X, Plus, Trash2, Check, Sparkles } from 'lucide-react';

interface DietPlanBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingPlan?: DietPlan | null;
}

export const DietPlanBuilderModal: React.FC<DietPlanBuilderModalProps> = ({
  isOpen,
  onClose,
  existingPlan,
}) => {
  const { foods, activeTeamUser, createDietPlan, updateDietPlan, clients, assignDietPlan } = useApp();

  const [title, setTitle] = useState(existingPlan?.title || '');
  const [description, setDescription] = useState(existingPlan?.description || '');
  const [targetCalories, setTargetCalories] = useState<number>(existingPlan?.targetCalories || 1500);
  const [targetProtein, setTargetProtein] = useState<number>(existingPlan?.targetProtein || 90);
  const [targetCarbs, setTargetCarbs] = useState<number>(existingPlan?.targetCarbs || 150);
  const [targetFat, setTargetFat] = useState<number>(existingPlan?.targetFat || 45);
  const [waterTargetLitres, setWaterTargetLitres] = useState<number>(existingPlan?.waterTargetLitres || 2.5);

  const [assignedClientIds, setAssignedClientIds] = useState<string[]>([]);
  const [activeSlot, setActiveSlot] = useState<MealType>('Breakfast');
  const [guidelinesText, setGuidelinesText] = useState(
    existingPlan?.generalGuidelines.join('\n') || 
    'Drink 500ml water upon waking.\nAvoid refined sugars.\nChew food thoroughly.'
  );

  // Meals structure
  const defaultMeals = [
    { mealType: 'Breakfast' as MealType, timeGuideline: '8:00 AM - 9:00 AM', recommendedFoods: [] as RecommendedFood[], instructions: 'High protein to start the day.' },
    { mealType: 'Morning Snack' as MealType, timeGuideline: '11:00 AM', recommendedFoods: [] as RecommendedFood[], instructions: 'Fruit & nuts fiber boost.' },
    { mealType: 'Lunch' as MealType, timeGuideline: '1:00 PM - 2:00 PM', recommendedFoods: [] as RecommendedFood[], instructions: 'Balanced meal with complex carbs and veggies.' },
    { mealType: 'Evening Snack' as MealType, timeGuideline: '5:00 PM', recommendedFoods: [] as RecommendedFood[], instructions: 'Light evening snack with tea or buttermilk.' },
    { mealType: 'Dinner' as MealType, timeGuideline: '8:00 PM', recommendedFoods: [] as RecommendedFood[], instructions: 'Easily digestible protein and steamed greens.' }
  ];

  const [meals, setMeals] = useState(existingPlan?.meals || defaultMeals);

  // Temporary food picker for currently selected slot
  const [selectedFoodId, setSelectedFoodId] = useState<string>(foods[0]?.id || '');
  const [portion, setPortion] = useState<number>(1);
  const [foodNote, setFoodNote] = useState<string>('');

  if (!isOpen) return null;

  const handleAddFoodToCurrentSlot = () => {
    const food = foods.find(f => f.id === selectedFoodId);
    if (!food) return;

    setMeals(prev => prev.map(m => {
      if (m.mealType === activeSlot) {
        return {
          ...m,
          recommendedFoods: [
            ...m.recommendedFoods,
            {
              foodId: food.id,
              foodName: food.name,
              portion: Number(portion) || 1,
              unit: food.servingUnit,
              notes: foodNote || undefined,
            }
          ]
        };
      }
      return m;
    }));

    setFoodNote('');
    setPortion(1);
  };

  const handleRemoveFoodFromSlot = (mealType: MealType, index: number) => {
    setMeals(prev => prev.map(m => {
      if (m.mealType === mealType) {
        return {
          ...m,
          recommendedFoods: m.recommendedFoods.filter((_, i) => i !== index)
        };
      }
      return m;
    }));
  };

  const handleToggleClientAssign = (id: string) => {
    setAssignedClientIds(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const guidelines = guidelinesText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    let planId = existingPlan?.id;

    if (existingPlan) {
      updateDietPlan({
        ...existingPlan,
        title: title.trim(),
        description: description.trim(),
        targetCalories: Number(targetCalories) || 1500,
        targetProtein: Number(targetProtein) || 90,
        targetCarbs: Number(targetCarbs) || 150,
        targetFat: Number(targetFat) || 45,
        waterTargetLitres: Number(waterTargetLitres) || 2.5,
        meals,
        generalGuidelines: guidelines,
      });
    } else {
      const newPlanId = `dp-${Date.now()}`;
      planId = newPlanId;
      createDietPlan({
        title: title.trim(),
        description: description.trim(),
        targetCalories: Number(targetCalories) || 1500,
        targetProtein: Number(targetProtein) || 90,
        targetCarbs: Number(targetCarbs) || 150,
        targetFat: Number(targetFat) || 45,
        waterTargetLitres: Number(waterTargetLitres) || 2.5,
        createdByDietitianId: activeTeamUser.id,
        meals,
        generalGuidelines: guidelines,
      });
    }

    // Assign to selected clients
    if (planId && assignedClientIds.length > 0) {
      assignedClientIds.forEach(cId => {
        assignDietPlan(cId, planId!);
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {existingPlan ? 'Edit Diet Plan' : 'Create & Assign Diet Plan'}
            </h2>
            <p className="text-xs text-slate-500">
              Prescribe daily calorie targets, meal timings, and food portions
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSavePlan} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Plan Title and Description */}
          <div className="space-y-3">
            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Plan Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 1,600 kcal Balanced Glycemic Deficit Plan"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                required
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Clinical Focus / Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Optimized for steady fat loss, high fiber, and insulin stabilization"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Calorie and Macro Targets */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2.5">
              Daily Nutrition Targets
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Calories (kcal)</label>
                <input
                  type="number"
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold text-amber-700"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Protein (g)</label>
                <input
                  type="number"
                  value={targetProtein}
                  onChange={(e) => setTargetProtein(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 font-semibold text-emerald-700"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Carbs (g)</label>
                <input
                  type="number"
                  value={targetCarbs}
                  onChange={(e) => setTargetCarbs(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 font-semibold text-blue-700"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Fat (g)</label>
                <input
                  type="number"
                  value={targetFat}
                  onChange={(e) => setTargetFat(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 font-semibold text-slate-700"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Water (Litres)</label>
                <input
                  type="number"
                  step="0.1"
                  value={waterTargetLitres}
                  onChange={(e) => setWaterTargetLitres(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 font-semibold text-cyan-700"
                />
              </div>
            </div>
          </div>

          {/* Meals & Foods Configuration */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs">Configure Meal Slots</h3>
              <span className="text-[11px] text-slate-500">Pick foods from clinic database</span>
            </div>

            {/* Meal Slot Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {(['Breakfast', 'Morning Snack', 'Lunch', 'Evening Snack', 'Dinner'] as MealType[]).map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setActiveSlot(slot)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeSlot === slot
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>

            {/* Current Slot Details */}
            {(() => {
              const currentSlotData = meals.find(m => m.mealType === activeSlot);
              if (!currentSlotData) return null;

              return (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-slate-800 text-xs">{activeSlot} Guidelines:</span>
                    <input
                      type="text"
                      value={currentSlotData.instructions || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMeals(prev => prev.map(m => m.mealType === activeSlot ? { ...m, instructions: val } : m));
                      }}
                      placeholder="e.g. Eat within 1 hour of waking"
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900"
                    />
                  </div>

                  {/* Foods in this slot */}
                  <div className="space-y-1.5">
                    {currentSlotData.recommendedFoods.length > 0 ? (
                      currentSlotData.recommendedFoods.map((rf, idx) => (
                        <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-slate-900">{rf.foodName}</span>
                            <span className="text-slate-500 text-[11px] ml-2">
                              {rf.portion}x {rf.unit} {rf.notes && `(${rf.notes})`}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFoodFromSlot(activeSlot, idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-400 italic py-1">
                        No foods added to {activeSlot} yet. Use the picker below.
                      </p>
                    )}
                  </div>

                  {/* Add Food Row */}
                  <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <select
                      value={selectedFoodId}
                      onChange={(e) => setSelectedFoodId(e.target.value)}
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-2 py-1.5 font-medium text-slate-900 text-xs"
                    >
                      {foods.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.servingUnit} • {f.calories} kcal)
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="10"
                      value={portion}
                      onChange={(e) => setPortion(parseFloat(e.target.value) || 1)}
                      placeholder="Qty"
                      className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-center font-bold text-xs"
                    />

                    <input
                      type="text"
                      value={foodNote}
                      onChange={(e) => setFoodNote(e.target.value)}
                      placeholder="Notes (optional)"
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs"
                    />

                    <button
                      type="button"
                      onClick={handleAddFoodToCurrentSlot}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 transition-colors shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* General Dietitian Guidelines */}
          <div>
            <label className="block font-semibold uppercase text-slate-600 mb-1">
              General Dietitian Guidelines (One per line)
            </label>
            <textarea
              rows={3}
              value={guidelinesText}
              onChange={(e) => setGuidelinesText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Assign Plan to Clients */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Assign to Clients
            </h3>
            <p className="text-[11px] text-slate-500 mb-2">
              Select clients to immediately activate this plan on their mobile app:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {clients.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-blue-300 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={assignedClientIds.includes(c.id) || c.dietPlanId === existingPlan?.id}
                    onChange={() => handleToggleClientAssign(c.id)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div className="truncate">
                    <span className="font-semibold text-slate-900 block">{c.name}</span>
                    <span className="text-[10px] text-slate-500">{c.phone} • {c.goal}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
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
              className="px-5 py-2 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{existingPlan ? 'Save Changes' : 'Create & Assign Plan'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
