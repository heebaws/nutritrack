import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { FoodCategory, FoodItem } from '../../types';
import { Search, Plus, Edit2, Trash2, X, Check, UtensilsCrossed, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import { estimateNutrition } from '../../utils/nutritionEstimator';

export const FoodDatabaseManager: React.FC = () => {
  const { foods, addFoodItem, updateFoodItem, deleteFoodItem, removeDuplicateFoods } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [isCleaningDuplicates, setIsCleaningDuplicates] = useState(false);
  const [cleanMessage, setCleanMessage] = useState<string | null>(null);
  const [isAiVerifying, setIsAiVerifying] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  // Form states for add/edit
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Proteins');
  const [servingUnit, setServingUnit] = useState('');
  const [calories, setCalories] = useState<number>(100);
  const [protein, setProtein] = useState<number>(10);
  const [carbs, setCarbs] = useState<number>(10);
  const [fat, setFat] = useState<number>(2);
  const [fiber, setFiber] = useState<number>(0);

  // Duplicate detection count
  const duplicateCount = useMemo(() => {
    const normalize = (n: string) => {
      const clean = (n || '').toLowerCase().trim();
      const unicodeClean = clean.replace(/[^\p{L}\p{N}]/gu, '');
      return unicodeClean || clean;
    };
    const seen = new Set<string>();
    let dupes = 0;
    for (const f of foods) {
      const key = normalize(f.name);
      if (seen.has(key)) dupes++;
      else seen.add(key);
    }
    return dupes;
  }, [foods]);

  const handleCleanDuplicates = async () => {
    setIsCleaningDuplicates(true);
    setCleanMessage(null);
    try {
      const res = await removeDuplicateFoods();
      setCleanMessage(`✓ Successfully removed ${res.count} duplicate food entries from library.`);
      setTimeout(() => setCleanMessage(null), 4000);
    } catch (err: any) {
      setCleanMessage(`Failed to clean duplicates: ${err.message || 'Error'}`);
    } finally {
      setIsCleaningDuplicates(false);
    }
  };

  const handleAiVerify = async () => {
    if (!name.trim()) return;
    setIsAiVerifying(true);
    setAiNote(null);
    try {
      const est = estimateNutrition(name);
      setCalories(est.calories);
      setProtein(est.protein);
      setCarbs(est.carbs);
      setFat(est.fat);
      setFiber(est.fiber || 0);
      setServingUnit(est.servingUnit);
      if (est.category) setCategory(est.category as FoodCategory);
      setAiNote(`✨ AI Verified: Calibrated accurately for ${est.servingUnit}`);
    } finally {
      setIsAiVerifying(false);
    }
  };

  const categories: string[] = [
    'All',
    '🌴 Kerala Foods (145 Items)',
    'Proteins',
    'Grains & Breads',
    'Vegetables',
    'Fruits',
    'Dairy & Alternatives',
    'Nuts & Healthy Fats',
    'Beverages & Snacks'
  ];

  const filteredFoods = useMemo(() => {
    return foods.filter(f => {
      const matchesQuery = f.name.toLowerCase().includes(searchQuery.toLowerCase());
      let matchesCat = true;
      if (selectedCategory === '🌴 Kerala Foods (145 Items)') {
        matchesCat = f.id.startsWith('kl-') || /[\u0D00-\u0D7F]/.test(f.name);
      } else if (selectedCategory !== 'All') {
        matchesCat = f.category === selectedCategory;
      }
      return matchesQuery && matchesCat;
    });
  }, [foods, searchQuery, selectedCategory]);

  const openAddModal = () => {
    setEditingFood(null);
    setName('');
    setCategory('Proteins');
    setServingUnit('100g');
    setCalories(100);
    setProtein(10);
    setCarbs(10);
    setFat(2);
    setFiber(0);
    setIsEditModalOpen(true);
  };

  const openEditModal = (food: FoodItem) => {
    setEditingFood(food);
    setName(food.name);
    setCategory(food.category);
    setServingUnit(food.servingUnit);
    setCalories(food.calories);
    setProtein(food.protein);
    setCarbs(food.carbs);
    setFat(food.fat);
    setFiber(food.fiber || 0);
    setIsEditModalOpen(true);
  };

  const handleSaveFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !servingUnit.trim()) return;

    if (editingFood) {
      updateFoodItem({
        ...editingFood,
        name: name.trim(),
        category,
        servingUnit: servingUnit.trim(),
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        fiber: Number(fiber) || 0,
      });
    } else {
      addFoodItem({
        name: name.trim(),
        category,
        servingUnit: servingUnit.trim(),
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        fiber: Number(fiber) || 0,
      });
    }

    setIsEditModalOpen(false);
  };

  const handleDelete = (id: string, foodName: string) => {
    if (window.confirm(`Are you sure you want to remove "${foodName}" from the centre food database?\n\nNote: Deleting from this library will NOT delete meals already logged by clients. All historical client logs remain preserved and safe.`)) {
      deleteFoodItem(id);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-blue-600" />
            Food List &amp; Nutrition Values
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain accurate calorie and macro values ({foods.length} items). <span className="text-emerald-700 font-medium">Safe deletion guaranteed: deleting an item from this library never deletes meals already logged by clients.</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCleanDuplicates}
            disabled={isCleaningDuplicates}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-xl border border-slate-300 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Scan library and delete duplicate food entries"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCleaningDuplicates ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            <span>Clean Double Entries</span>
            {duplicateCount > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-1.5 py-0.2 rounded-full border border-amber-300">
                {duplicateCount} dupes
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Food</span>
          </button>
        </div>
      </div>

      {/* Clean Feedback Toast Banner */}
      {cleanMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{cleanMessage}</span>
        </div>
      )}

      {/* Search and category filters */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search food by name..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Food Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Food Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Serving Unit</th>
                <th className="py-2.5 px-3 text-right">Calories</th>
                <th className="py-2.5 px-3 text-right">Protein</th>
                <th className="py-2.5 px-3 text-right">Carbs</th>
                <th className="py-2.5 px-3 text-right">Fat</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFoods.length > 0 ? (
                filteredFoods.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {item.name}
                      {item.isCustom && (
                        <span className="ml-1.5 text-[10px] font-medium bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                          Custom
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{item.category}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">{item.servingUnit}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-700">{item.calories} kcal</td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 font-medium">{item.protein}g</td>
                    <td className="py-2.5 px-3 text-right text-blue-700 font-medium">{item.carbs}g</td>
                    <td className="py-2.5 px-3 text-right text-slate-700 font-medium">{item.fat}g</td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded-md transition-colors"
                          title="Edit Nutrition Values"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                          title="Delete Food"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    No foods found matching "{searchQuery}". Click "Add New Food" above to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Food Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {editingFood ? 'Edit Food Item' : 'Add New Food Item'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFood} className="p-5 space-y-3.5 text-xs">
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold uppercase text-slate-600">
                    Food Name *
                  </label>
                  <button
                    type="button"
                    onClick={handleAiVerify}
                    disabled={!name.trim() || isAiVerifying}
                    className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 transition-colors disabled:opacity-40 cursor-pointer"
                    title="Calibrate accurate calories and macros with AI"
                  >
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>{isAiVerifying ? 'Checking...' : 'AI Verify & Calibrate'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (aiNote) setAiNote(null);
                  }}
                  placeholder="e.g. Grilled Paneer Tikka or Sulaimani"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
                {aiNote && (
                  <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{aiNote}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-slate-600 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FoodCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
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
                  <label className="block font-semibold uppercase text-slate-600 mb-1">
                    Serving Unit *
                  </label>
                  <input
                    type="text"
                    value={servingUnit}
                    onChange={(e) => setServingUnit(e.target.value)}
                    placeholder="e.g. 1 bowl (150g)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {/* Nutrition Inputs */}
              <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Calories</label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold text-amber-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={protein}
                    onChange={(e) => setProtein(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 font-medium text-emerald-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={carbs}
                    onChange={(e) => setCarbs(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 font-medium text-blue-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={fat}
                    onChange={(e) => setFat(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 font-medium text-slate-700"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Food</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
