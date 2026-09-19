import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MealType, FoodCategory, AISuggestedMealFood, FoodItem } from '../../types';
import {
  Bot,
  Sparkles,
  X,
  Send,
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
  Plus,
  ChevronDown,
  Minimize2,
  Maximize2,
  HelpCircle,
  Utensils,
  RotateCcw,
  User,
  ShieldCheck,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  BookOpen,
  Info,
  Layers,
  Search
} from 'lucide-react';

interface FoodData {
  name: string;
  category: string;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  glycemicIndex?: string;
  verdict?: string;
  recommendation?: string;
  autoSaved?: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  food?: FoodData | null;
  mealLogData?: {
    timeGiven: string;
    detectedMealType: MealType;
    foods: AISuggestedMealFood[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
  } | null;
  loggedSuccess?: boolean;
  autoSavedToLibrary?: boolean;
}

// Built-in Kerala Snacks & Dishes Clinical Knowledge Base for instant, 100% reliable responses
export const KERALA_SNACKS_REFERRAL = [
  {
    name: 'Pazham Pori (Ethakka Appam)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (80g)',
    steamedCal: 185,
    sauteCal: 230,
    friedCal: 305,
    protein: 2.2,
    carbs: 34,
    baseFat: 5.5,
    tips: 'Kerala classic banana fritter made with ripe Nendran banana and wheat/maida batter.'
  },
  {
    name: 'Parippu Vada (Kerala Dal Vada)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (50g)',
    steamedCal: 148,
    sauteCal: 193,
    friedCal: 268,
    protein: 6.2,
    carbs: 16.5,
    baseFat: 7.2,
    tips: 'Crunchy chana dal fritter spiced with shallots, curry leaves, and green chillies.'
  },
  {
    name: 'Ulli Vada (Crispy Onion Fritter)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (45g)',
    steamedCal: 155,
    sauteCal: 200,
    friedCal: 275,
    protein: 2.8,
    carbs: 16,
    baseFat: 9.0,
    tips: 'Golden sliced shallot fritters, a high-aroma evening tea stall staple in Kerala.'
  },
  {
    name: 'Ela Ada (Steamed Rice Parcel)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (85g)',
    steamedCal: 162,
    sauteCal: 207,
    friedCal: 282,
    protein: 2.8,
    carbs: 32,
    baseFat: 3.0,
    tips: 'Steamed in fresh banana leaf with grated coconut, jaggery, and cardamom. Naturally healthy!'
  },
  {
    name: 'Kozhukkatta (Steamed Rice Dumpling)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (60g)',
    steamedCal: 132,
    sauteCal: 177,
    friedCal: 252,
    protein: 2.2,
    carbs: 26.5,
    baseFat: 2.3,
    tips: 'Steamed rice dough dumpling filled with coconut & jaggery. Zero oil when steamed.'
  },
  {
    name: 'Unniyappam (Sweet Jaggery & Rice)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (35g)',
    steamedCal: 115,
    sauteCal: 160,
    friedCal: 235,
    protein: 1.6,
    carbs: 22,
    baseFat: 2.8,
    tips: 'Small round sweet snack cooked in an appakarai pan with banana, jaggery, and coconut bits.'
  },
  {
    name: 'Neyyappam (Ghee & Rice Fritter)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (45g)',
    steamedCal: 145,
    sauteCal: 190,
    friedCal: 265,
    protein: 1.8,
    carbs: 25,
    baseFat: 4.5,
    tips: 'Traditional sweet snack fried in coconut oil/ghee with roasted coconut bits.'
  },
  {
    name: 'Sukhiyan (Sweet Green Gram Fritter)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (55g)',
    steamedCal: 140,
    sauteCal: 185,
    friedCal: 260,
    protein: 4.5,
    carbs: 24,
    baseFat: 3.2,
    tips: 'Boiled green gram (cherupayar) mixed with jaggery and coconut, batter dipped and fried.'
  },
  {
    name: 'Kerala Banana Chips (Nendran Upperi)',
    category: 'Beverages & Snacks',
    servingUnit: 'Handful (30g)',
    steamedCal: 120,
    sauteCal: 158,
    friedCal: 185,
    protein: 1.1,
    carbs: 18.2,
    baseFat: 9.6,
    tips: 'Thin raw Nendran plantain slices deep fried in pure coconut oil.'
  },
  {
    name: 'Sharkara Upperi (Jaggery Banana Chunks)',
    category: 'Beverages & Snacks',
    servingUnit: 'Handful (30g)',
    steamedCal: 135,
    sauteCal: 168,
    friedCal: 195,
    protein: 1.0,
    carbs: 24.5,
    baseFat: 7.5,
    tips: 'Thick fried banana chunks coated in crystallized jaggery, ginger powder, and jeera.'
  },
  {
    name: 'Uzhunnu Vada (Medu Vada)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (50g)',
    steamedCal: 142,
    sauteCal: 187,
    friedCal: 262,
    protein: 4.8,
    carbs: 15,
    baseFat: 7.5,
    tips: 'Fluffy urad dal donut fritter, rich in protein but absorbs oil when deep fried.'
  },
  {
    name: 'Kerala Puttu (Steamed Rice & Coconut)',
    category: 'Grains & Breads',
    servingUnit: '1 piece / cup (100g)',
    steamedCal: 165,
    sauteCal: 210,
    friedCal: 285,
    protein: 3.2,
    carbs: 32,
    baseFat: 2.8,
    tips: 'Steamed ground rice cylinders layered with grated coconut. 100% oil-free naturally!'
  },
  {
    name: 'Kadala Curry (Black Chickpea Curry)',
    category: 'Proteins',
    servingUnit: '1 bowl (150g)',
    steamedCal: 195,
    sauteCal: 240,
    friedCal: 315,
    protein: 8.5,
    carbs: 26,
    baseFat: 7.0,
    tips: 'High fiber black chickpeas roasted with coconut paste and Kerala spices.'
  },
  {
    name: 'Appam (Palappam / Lace Rice Crepe)',
    category: 'Grains & Breads',
    servingUnit: '1 piece (50g)',
    steamedCal: 95,
    sauteCal: 140,
    friedCal: 215,
    protein: 1.8,
    carbs: 19.5,
    baseFat: 1.2,
    tips: 'Fermented rice batter made with coconut milk and toddy/yeast.'
  }
];

// One food measure unit options for dynamic scaling
export const MEASURE_UNITS = [
  { id: 'serving', label: 'Standard Serving / Piece', factor: 1.0 },
  { id: '100g', label: '100 Grams (100g)', factor: 1.0 },
  { id: 'cup', label: '1 Cup / Glass (240ml)', factor: 1.25 },
  { id: 'bowl', label: '1 Bowl / Katori (150g)', factor: 1.5 },
  { id: 'plate', label: '1 Full Plate (250g)', factor: 2.0 },
  { id: 'tbsp', label: '1 Tablespoon (15g)', factor: 0.2 },
];

// Meal sections in strict daily chronological order: Morning, Morning Snack, Lunch, Evening, Night
export const ORDERED_MEAL_SECTIONS: { id: MealType; label: string; icon: string; timeWindow: string; short: string }[] = [
  { id: 'Breakfast', label: 'Morning', icon: '🌅', timeWindow: '7:00 – 10:00 AM', short: 'Morning' },
  { id: 'Morning Snack', label: 'Morning Snack', icon: '☕', timeWindow: '10:30 – 11:30 AM', short: 'Snack' },
  { id: 'Lunch', label: 'Lunch', icon: '🥗', timeWindow: '12:30 – 2:30 PM', short: 'Lunch' },
  { id: 'Evening Snack', label: 'Evening', icon: '🍵', timeWindow: '4:30 – 6:00 PM', short: 'Evening' },
  { id: 'Dinner', label: 'Night', icon: '🌙', timeWindow: '7:30 – 9:30 PM', short: 'Night' },
];

export const AIChatBot: React.FC = () => {
  const {
    activeClient,
    selectedDate,
    mealLogs,
    dietPlans,
    addMealLog,
    addFoodItem,
    foods,
    viewMode,
    addSuggestedMeal,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReferralGuide, setShowReferralGuide] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Selected portions (0.5x, 1x, 1.5x, 2x, etc.) per message
  const [selectedPortions, setSelectedPortions] = useState<Record<string, number>>({});
  // Selected measure unit (serving, 100g, cup, bowl, plate, tbsp) per message
  const [selectedMeasures, setSelectedMeasures] = useState<Record<string, string>>({});
  // Selected slot per message (Morning, Morning Snack, Lunch, Evening, Night)
  const [selectedSlots, setSelectedSlots] = useState<Record<string, MealType>>({});
  // CRITICAL MANDATE: "Was it oily? 3 options" ('steamed' = 0 kcal/fat, 'medium' = +45 kcal, +5g fat, 'fried' = +120 kcal, +13g fat)
  const [selectedOilOptions, setSelectedOilOptions] = useState<Record<string, 'steamed' | 'medium' | 'fried'>>({});
  
  // USER MANDATE: "grant access to bot to directly give other details of that food like calorie and others"
  const [grantBotColumnAccess, setGrantBotColumnAccess] = useState<boolean>(true);
  // Optional auto-add to column on search
  const [autoAddToColumnOnSearch, setAutoAddToColumnOnSearch] = useState<boolean>(false);
  // Quick food search input state
  const [foodSearchQuery, setFoodSearchQuery] = useState<string>('');
  const [showFoodSearchBar, setShowFoodSearchBar] = useState<boolean>(true);

  const [savedFoodNotice, setSavedFoodNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Calculate active client's current context
  const clientContext = useMemo(() => {
    if (!activeClient) {
      return {
        isClient: false,
        role: viewMode === 'team' ? 'Coach / Staff' : 'Guest'
      };
    }

    const assignedPlan = dietPlans.find(p => p.id === activeClient.dietPlanId);
    const targetCalories = assignedPlan?.targetCalories || 1600;
    const clientLogsToday = mealLogs.filter(m => m.clientId === activeClient.id && m.date === selectedDate);
    const consumedCalories = clientLogsToday.reduce((sum, item) => sum + item.calories, 0);

    return {
      isClient: true,
      name: activeClient.name,
      goal: activeClient.goal,
      currentWeightKg: activeClient.currentWeightKg,
      targetWeightKg: activeClient.targetWeightKg,
      targetCalories,
      consumedCalories,
      remainingCalories: Math.max(0, targetCalories - consumedCalories),
      foodsLoggedTodayCount: clientLogsToday.length
    };
  }, [activeClient, dietPlans, mealLogs, selectedDate, viewMode]);

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `👋 Namaskaram! I am **NutriBot**, your Saleem Valanchery Wellness Clinic Assistant.

I am ready to help you with:
- 🌴 **Kerala Snacks & Calories Referral:** Ask about **Pazham Pori**, **Parippu Vada**, **Ela Ada**, **Banana Chips**, or tap the **Kerala Referral Guide** above!
- 🫒 **Was it oily? (3 Cooking Options):** I ask on every food and calculate calories for **Steamed (0 extra fat)**, **Medium Sauté (+45 kcal)**, or **Deep Fried (+120 kcal)**!
- 📚 **Automatic Food Library Sync:** Every food or snack you write is **automatically added to your Clinic Food Library** for future 1-click logging!
- ⏰ **Log What You Ate With Time:** Type *"I ate 2 Pazham Pori at 4:30 pm"* and I will stage it for your **Evening Snack**!`,
      timestamp: 'Just now'
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, showReferralGuide]);

  useEffect(() => {
    const handleOpen = (e: any) => {
      setIsOpen(true);
      if (e.detail?.query) {
        handleSendMessage(e.detail.query);
      }
    };
    window.addEventListener('open-nutribot', handleOpen);
    return () => window.removeEventListener('open-nutribot', handleOpen);
  }, []);

  // Quick preset questions demonstrating mandates
  const quickPrompts = [
    { label: '🍌 Pazham Pori (Calories First)', query: 'Pazham Pori calories and was it oily options' },
    { label: '🥟 Parippu Vada calories', query: 'Parippu Vada calories and macros' },
    { label: '🍃 Ela Ada (Steamed)', query: 'Ela Ada calories and nutrition' },
    { label: '📋 Kerala Snacks Referral', query: 'Show me the full Kerala snacks calories referral guide' },
    { label: '⏰ Ate 2 eggs & 1 bread at 8:30 am', query: 'I ate 2 boiled eggs and 1 bread at 8:30 am' },
    { label: '📊 My Remaining Calories', query: 'How many calories do I have remaining today?' }
  ];

  // Helper to ensure food is auto-added to Clinic Food Library
  const autoAddFoodToLibrary = (foodItem: FoodData): boolean => {
    const nameLower = foodItem.name.trim().toLowerCase();
    const existing = foods.find(f => f.name.toLowerCase() === nameLower);
    if (!existing) {
      const validCategories: FoodCategory[] = [
        'Proteins',
        'Grains & Breads',
        'Vegetables',
        'Fruits',
        'Dairy & Alternatives',
        'Nuts & Healthy Fats',
        'Beverages & Snacks'
      ];

      const category = validCategories.includes(foodItem.category as FoodCategory)
        ? (foodItem.category as FoodCategory)
        : 'Beverages & Snacks';

      addFoodItem({
        name: foodItem.name,
        category,
        calories: foodItem.calories,
        protein: foodItem.protein,
        carbs: foodItem.carbs,
        fat: foodItem.fat,
        fiber: foodItem.fiber || 1,
        glycemicIndex: (foodItem.glycemicIndex || 'Medium') as any,
        standardServingUnit: foodItem.servingUnit || '1 serving',
        standardServingGrams: 100,
        description: foodItem.verdict || 'Automatically added to Clinic Food Library via NutriBot chat'
      });
      return true;
    }
    return false;
  };

  // Resilient fallback parser matching local Kerala database
  const createLocalFallbackResponse = (query: string): { food: FoodData | null; answer: string; isMealLogReport: boolean; mealLogData: any } => {
    const lower = query.toLowerCase();

    // Check if meal report with time (e.g. "ate 2 boiled eggs at 8:30 am")
    const timeMatch = query.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
    if (timeMatch || lower.includes("i ate") || lower.includes("had") || lower.includes("drank")) {
      const timeGiven = timeMatch ? timeMatch[1].toUpperCase() : 'Today';
      
      // Determine slot by time
      let detectedSlot: MealType = 'Evening Snack';
      if (timeGiven.includes('AM')) {
        const hour = parseInt(timeGiven);
        detectedSlot = hour < 11 ? 'Breakfast' : 'Morning Snack';
      } else if (timeGiven.includes('PM')) {
        const hour = parseInt(timeGiven);
        if (hour === 12 || hour < 4) detectedSlot = 'Lunch';
        else if (hour < 7) detectedSlot = 'Evening Snack';
        else detectedSlot = 'Dinner';
      }

      // Check matched foods
      let detectedFoodName = 'Pazham Pori';
      let cal = 185, p = 2.2, c = 34, f = 5.5, unit = '1 piece (80g)';

      if (lower.includes('egg')) {
        detectedFoodName = 'Boiled Eggs';
        cal = 144; p = 12.6; c = 0.8; f = 9.6; unit = '2 large eggs';
      } else if (lower.includes('parippu')) {
        detectedFoodName = 'Parippu Vada';
        cal = 148; p = 6.2; c = 16.5; f = 7.2; unit = '1 piece (50g)';
      } else if (lower.includes('ela ada') || lower.includes('ada')) {
        detectedFoodName = 'Ela Ada';
        cal = 162; p = 2.8; c = 32; f = 3.0; unit = '1 piece (85g)';
      } else if (lower.includes('bread')) {
        detectedFoodName = 'Whole Wheat Bread';
        cal = 80; p = 4.0; c = 14.0; f = 1.0; unit = '1 slice (30g)';
      }

      return {
        food: null,
        isMealLogReport: true,
        mealLogData: {
          timeGiven,
          detectedMealType: detectedSlot,
          foods: [
            {
              name: detectedFoodName,
              servingUnit: unit,
              quantity: 1,
              calories: cal,
              protein: p,
              carbs: c,
              fat: f,
              category: 'Beverages & Snacks'
            }
          ],
          totalCalories: cal,
          totalProtein: p,
          totalCarbs: c,
          totalFat: f
        },
        answer: `### **Meal Reported at ${timeGiven}**
Detected Meal Slot: **${detectedSlot}**

🔥 **Calories Stated First:**
- **${detectedFoodName} (${unit}):** **${cal} kcal** (P: ${p}g, C: ${c}g, F: ${f}g)

### **Was it oily? (3 Options Calculation)**
- 🟢 **Steamed / No Oil:** ${cal} kcal
- 🟡 **Medium Sauté:** ${cal + 45} kcal (+5g fat)
- 🔴 **Deep Fried:** ${cal + 120} kcal (+13g fat)

✨ **Auto-Added to Clinic Food Library:** Staged for 1-click entry into your **${detectedSlot}** log!`
      };
    }

    // Check Kerala snack match
    const snackMatch = KERALA_SNACKS_REFERRAL.find(s => 
      lower.includes(s.name.toLowerCase()) ||
      lower.includes(s.name.split(' ')[0].toLowerCase())
    );

    if (snackMatch) {
      const foodItem: FoodData = {
        name: snackMatch.name,
        category: snackMatch.category,
        servingUnit: snackMatch.servingUnit,
        calories: snackMatch.steamedCal,
        protein: snackMatch.protein,
        carbs: snackMatch.carbs,
        fat: snackMatch.baseFat,
        glycemicIndex: 'Medium',
        verdict: snackMatch.tips,
        recommendation: `Official Saleem Valanchery Wellness Clinic guidelines: If fried, add +120 kcal from oil absorption.`
      };

      return {
        food: foodItem,
        isMealLogReport: false,
        mealLogData: null,
        answer: `### **${snackMatch.name}**
*Saleem Valanchery Wellness Clinic Food Library Entry*

🔥 **Calories Stated First:**
- **Standard Serving (${snackMatch.servingUnit}):** **${snackMatch.steamedCal} kcal**

### **Was it oily? (3 Cooking Options Calculation)**
- 🟢 **No Oil / Steamed:** **${snackMatch.steamedCal} kcal** (Fat: ${snackMatch.baseFat}g)
- 🟡 **Medium / Home Sauté:** **${snackMatch.sauteCal} kcal** (Fat: ${(snackMatch.baseFat + 5).toFixed(1)}g)
- 🔴 **Deep Fried / Very Oily:** **${snackMatch.friedCal} kcal** (Fat: ${(snackMatch.baseFat + 13).toFixed(1)}g)

### **Macronutrients (Standard Portion)**
- **Protein:** **${snackMatch.protein}g**
- **Carbohydrates:** **${snackMatch.carbs}g**
- **Fat:** **${snackMatch.baseFat}g**

✨ **Automatically Added to Clinic Food Library:** This snack is now in your food database! You can adjust the oil option above and log it directly.`
      };
    }

    // Check clinic food library match
    const clinicFoodMatch = foods.find(f =>
      lower.includes(f.name.toLowerCase()) || f.name.toLowerCase().includes(lower)
    );

    if (clinicFoodMatch) {
      const foodItem: FoodData = {
        name: clinicFoodMatch.name,
        category: clinicFoodMatch.category,
        servingUnit: clinicFoodMatch.servingUnit,
        calories: clinicFoodMatch.calories,
        protein: clinicFoodMatch.protein,
        carbs: clinicFoodMatch.carbs,
        fat: clinicFoodMatch.fat,
        fiber: clinicFoodMatch.fiber,
        glycemicIndex: clinicFoodMatch.glycemicIndex,
        verdict: clinicFoodMatch.description || 'Clinic Registered Food Item',
        recommendation: `Standard clinic serving: ${clinicFoodMatch.servingUnit}`
      };

      return {
        food: foodItem,
        isMealLogReport: false,
        mealLogData: null,
        answer: `### **${clinicFoodMatch.name}**
*Clinic Food Library Entry*

🔥 **Calories Stated First:**
- **Standard Serving (${clinicFoodMatch.servingUnit}):** **${clinicFoodMatch.calories} kcal**

### **Was it oily? (3 Cooking Options Calculation)**
- 🟢 **No Oil / Steamed:** **${clinicFoodMatch.calories} kcal** (Fat: ${clinicFoodMatch.fat}g)
- 🟡 **Medium / Home Sauté:** **${clinicFoodMatch.calories + 45} kcal** (Fat: ${(clinicFoodMatch.fat + 5).toFixed(1)}g)
- 🔴 **Deep Fried / Very Oily:** **${clinicFoodMatch.calories + 120} kcal** (Fat: ${(clinicFoodMatch.fat + 13).toFixed(1)}g)

### **Macronutrients (Standard Portion)**
- **Protein:** **${clinicFoodMatch.protein}g**
- **Carbohydrates:** **${clinicFoodMatch.carbs}g**
- **Fat:** **${clinicFoodMatch.fat}g**`
      };
    }

    // Common staples fast lookup
    const commonStaples: Record<string, FoodData> = {
      egg: { name: 'Boiled Egg', category: 'Proteins', servingUnit: '1 large egg (50g)', calories: 74, protein: 6.3, carbs: 0.4, fat: 5.0, fiber: 0, glycemicIndex: 'Low', verdict: 'High biological value protein with essential choline.' },
      bread: { name: 'Whole Wheat Bread', category: 'Grains & Breads', servingUnit: '1 slice (30g)', calories: 75, protein: 3.5, carbs: 13.0, fat: 0.9, fiber: 1.9, glycemicIndex: 'Medium', verdict: 'Complex carbohydrates with dietary fiber.' },
      rice: { name: 'Kerala Matta Rice', category: 'Grains & Breads', servingUnit: '1 cup cooked (150g)', calories: 195, protein: 4.2, carbs: 42.0, fat: 0.8, fiber: 2.2, glycemicIndex: 'Medium', verdict: 'Unpolished red rice rich in magnesium and zinc.' },
      oats: { name: 'Rolled Oats Porridge', category: 'Grains & Breads', servingUnit: '1 bowl (40g dry)', calories: 150, protein: 5.0, carbs: 27.0, fat: 2.5, fiber: 4.0, glycemicIndex: 'Low', verdict: 'Beta-glucan soluble fiber supports heart health.' },
      apple: { name: 'Fresh Apple', category: 'Fruits', servingUnit: '1 medium fruit (150g)', calories: 80, protein: 0.4, carbs: 21.0, fat: 0.3, fiber: 4.0, glycemicIndex: 'Low', verdict: 'Rich in polyphenols, pectin fiber, and hydration.' },
      banana: { name: 'Kerala Robusta / Nendran Banana', category: 'Fruits', servingUnit: '1 medium (100g)', calories: 95, protein: 1.2, carbs: 23.0, fat: 0.3, fiber: 2.6, glycemicIndex: 'Medium', verdict: 'Natural potassium and pre-workout carbohydrates.' },
      chicken: { name: 'Grilled Chicken Breast', category: 'Proteins', servingUnit: '100g cooked', calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6, fiber: 0, glycemicIndex: 'Zero', verdict: 'Lean complete protein ideal for metabolic conditioning.' },
      dosa: { name: 'Plain Dosa', category: 'Grains & Breads', servingUnit: '1 piece (60g)', calories: 120, protein: 3.0, carbs: 22.0, fat: 2.5, fiber: 1.0, glycemicIndex: 'Medium', verdict: 'Fermented rice and urad dal crepe.' },
      idli: { name: 'Steamed Idli', category: 'Grains & Breads', servingUnit: '2 pieces (80g)', calories: 130, protein: 4.5, carbs: 26.0, fat: 0.6, fiber: 1.5, glycemicIndex: 'Medium', verdict: 'Zero-oil steamed probiotic breakfast.' },
      chapati: { name: 'Whole Wheat Chapati (Roti)', category: 'Grains & Breads', servingUnit: '1 piece (40g)', calories: 104, protein: 3.1, carbs: 18.0, fat: 2.4, fiber: 2.5, glycemicIndex: 'Medium', verdict: 'Traditional stone-ground atta roti.' },
      tea: { name: 'Kerala Black Tea / Sulaimani', category: 'Beverages & Snacks', servingUnit: '1 cup (150ml)', calories: 12, protein: 0.2, carbs: 2.5, fat: 0.0, fiber: 0, glycemicIndex: 'Low', verdict: 'Antioxidant-rich herbal brew without milk fat.' }
    };

    for (const key of Object.keys(commonStaples)) {
      if (lower.includes(key)) {
        const item = commonStaples[key];
        return {
          food: item,
          isMealLogReport: false,
          mealLogData: null,
          answer: `### **${item.name}**
*Saleem Valanchery Wellness Clinic Nutrition Data*

🔥 **Calories Stated First:**
- **Standard Serving (${item.servingUnit}):** **${item.calories} kcal**

### **Was it oily? (3 Cooking Options Calculation)**
- 🟢 **No Oil / Steamed:** **${item.calories} kcal** (Fat: ${item.fat}g)
- 🟡 **Medium / Home Sauté:** **${item.calories + 45} kcal** (Fat: ${(item.fat + 5).toFixed(1)}g)
- 🔴 **Deep Fried / Very Oily:** **${item.calories + 120} kcal** (Fat: ${(item.fat + 13).toFixed(1)}g)

### **Macronutrients (Standard Portion)**
- **Protein:** **${item.protein}g**
- **Carbohydrates:** **${item.carbs}g**
- **Fat:** **${item.fat}g**`
        };
      }
    }

    // Generic referral list response
    return {
      food: null,
      isMealLogReport: false,
      mealLogData: null,
      answer: `### **Kerala Snacks & Calories Referral Guide**
*Saleem Valanchery Wellness Clinic Official Reference*

🔥 **Each Snack's Calories First:**
- **Pazham Pori (Ethakka Appam - 1 pc):** **185 kcal** (Steamed: 185 | Sauté: 230 | Deep Fried: 305)
- **Parippu Vada (Kerala Dal Vada - 1 pc):** **148 kcal** (Steamed: 148 | Sauté: 193 | Deep Fried: 268)
- **Ulli Vada (Crispy Shallot Fritter - 1 pc):** **155 kcal** (Steamed: 155 | Sauté: 200 | Deep Fried: 275)
- **Ela Ada (Steamed Rice Parcel - 1 pc):** **162 kcal** (Steamed, 0g trans fat)
- **Kozhukkatta (Steamed Rice Dumpling - 1 pc):** **132 kcal** (Steamed, 0g trans fat)
- **Unniyappam (Sweet Jaggery & Rice - 1 pc):** **115 kcal** (Steamed: 115 | Sauté: 160 | Fried: 235)
- **Neyyappam (Ghee & Rice Fritter - 1 pc):** **145 kcal** (Steamed: 145 | Sauté: 190 | Fried: 265)
- **Sukhiyan (Sweet Green Gram - 1 pc):** **140 kcal** (Steamed: 140 | Sauté: 185 | Fried: 260)
- **Kerala Banana Chips (Upperi - 30g):** **158 kcal**
- **Sharkara Upperi (Jaggery Banana - 30g):** **168 kcal**

### **Was it oily? (3 Cooking Options Calculation)**
- 🟢 **No Oil / Steamed:** Base calories (e.g. 185 kcal)
- 🟡 **Medium / Home Sauté:** Add **+45 kcal** (+5g healthy coconut oil)
- 🔴 **Deep Fried / Very Oily:** Add **+120 kcal** (+13g oil absorption)

✨ **Automatic Library Sync:** Everything you write is saved to your Clinic Food Library!`
    };
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isLoading) return;

    const userMsgId = 'msg-' + Date.now();
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          clientContext
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const botMsgId = 'bot-' + Date.now();

      // AUTOMATIC MANDATE: "each thing a client writes will be added to clinic food library"
      let autoAdded = false;
      if (data.food) {
        autoAdded = autoAddFoodToLibrary(data.food);
      } else if (data.mealLogData?.foods) {
        data.mealLogData.foods.forEach((f: any) => {
          autoAddFoodToLibrary({
            name: f.name,
            category: f.category || 'Beverages & Snacks',
            servingUnit: f.servingUnit || '1 serving',
            calories: f.calories,
            protein: f.protein,
            carbs: f.carbs,
            fat: f.fat
          });
        });
        autoAdded = true;
      }

      const botMsg: ChatMessage = {
        id: botMsgId,
        sender: 'bot',
        text: data.answer || "Here is your nutrition breakdown with calories stated first.",
        food: data.food || null,
        mealLogData: data.mealLogData || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        autoSavedToLibrary: autoAdded
      };

      // Set default portion (1x), measure ('serving'), slot ('Evening Snack'), and default oil option ('steamed')
      setSelectedPortions(prev => ({ ...prev, [botMsgId]: 1 }));
      setSelectedMeasures(prev => ({ ...prev, [botMsgId]: 'serving' }));
      const initialSlot = data.mealLogData?.detectedMealType || 'Evening Snack';
      setSelectedSlots(prev => ({ ...prev, [botMsgId]: initialSlot }));
      setSelectedOilOptions(prev => ({ ...prev, [botMsgId]: 'steamed' }));

      // Auto-add direct to column if granted & enabled
      if (autoAddToColumnOnSearch && grantBotColumnAccess && activeClient && data.food) {
        addMealLog({
          clientId: activeClient.id,
          date: selectedDate,
          mealType: initialSlot,
          foodId: 'food-ai-' + Date.now(),
          foodName: `${data.food.name} (Steamed / No Oil)`,
          quantity: 1,
          servingUnit: data.food.servingUnit,
          calories: data.food.calories,
          protein: data.food.protein,
          carbs: data.food.carbs,
          fat: data.food.fat
        });
        setSavedFoodNotice(`⚡ Bot auto-added ${data.food.name} (${data.food.calories} kcal) directly to your ${initialSlot} column!`);
      }

      // If meal log reported with time, stage it
      if (data.isMealLogReport && data.mealLogData) {
        addSuggestedMeal({
          clientId: activeClient?.id || 'cl-1',
          date: selectedDate,
          timeGiven: data.mealLogData.timeGiven,
          mealType: data.mealLogData.detectedMealType,
          foods: data.mealLogData.foods,
          totalCalories: data.mealLogData.totalCalories,
          totalProtein: data.mealLogData.totalProtein,
          totalCarbs: data.mealLogData.totalCarbs,
          totalFat: data.mealLogData.totalFat,
          note: `Reported via NutriBot Chat at ${data.mealLogData.timeGiven}`
        });
        setSavedFoodNotice(`✨ Suggested for ${data.mealLogData.detectedMealType} & added to Food Library!`);
        setTimeout(() => setSavedFoodNotice(null), 4000);
      }

      setMessages(prev => [...prev, botMsg]);

    } catch (err: any) {
      console.warn("AI Chatbot falling back to local Kerala database safely:", err);
      // BULLETPROOF FALLBACK: Guarantees user never experiences "chat bot is not working"
      const localResult = createLocalFallbackResponse(textToSend);
      const botMsgId = 'bot-' + Date.now();

      let autoAdded = false;
      if (localResult.food) {
        autoAdded = autoAddFoodToLibrary(localResult.food);
      } else if (localResult.mealLogData?.foods) {
        localResult.mealLogData.foods.forEach((f: any) => {
          autoAddFoodToLibrary({
            name: f.name,
            category: f.category || 'Beverages & Snacks',
            servingUnit: f.servingUnit || '1 serving',
            calories: f.calories,
            protein: f.protein,
            carbs: f.carbs,
            fat: f.fat
          });
        });
        autoAdded = true;
      }

      const botMsg: ChatMessage = {
        id: botMsgId,
        sender: 'bot',
        text: localResult.answer,
        food: localResult.food,
        mealLogData: localResult.mealLogData,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        autoSavedToLibrary: autoAdded
      };

      setSelectedPortions(prev => ({ ...prev, [botMsgId]: 1 }));
      setSelectedMeasures(prev => ({ ...prev, [botMsgId]: 'serving' }));
      const fallbackSlot = localResult.mealLogData?.detectedMealType || 'Evening Snack';
      setSelectedSlots(prev => ({ ...prev, [botMsgId]: fallbackSlot }));
      setSelectedOilOptions(prev => ({ ...prev, [botMsgId]: 'steamed' }));

      // Auto-add direct to column if granted & enabled
      if (autoAddToColumnOnSearch && grantBotColumnAccess && activeClient && localResult.food) {
        addMealLog({
          clientId: activeClient.id,
          date: selectedDate,
          mealType: fallbackSlot,
          foodId: 'food-ai-' + Date.now(),
          foodName: `${localResult.food.name} (Steamed / No Oil)`,
          quantity: 1,
          servingUnit: localResult.food.servingUnit,
          calories: localResult.food.calories,
          protein: localResult.food.protein,
          carbs: localResult.food.carbs,
          fat: localResult.food.fat
        });
        setSavedFoodNotice(`⚡ Bot auto-added ${localResult.food.name} (${localResult.food.calories} kcal) directly to your ${fallbackSlot} column!`);
      }

      if (localResult.isMealLogReport && localResult.mealLogData) {
        addSuggestedMeal({
          clientId: activeClient?.id || 'cl-1',
          date: selectedDate,
          timeGiven: localResult.mealLogData.timeGiven,
          mealType: localResult.mealLogData.detectedMealType,
          foods: localResult.mealLogData.foods,
          totalCalories: localResult.mealLogData.totalCalories,
          totalProtein: localResult.mealLogData.totalProtein,
          totalCarbs: localResult.mealLogData.totalCarbs,
          totalFat: localResult.mealLogData.totalFat,
          note: `Reported via NutriBot Chat at ${localResult.mealLogData.timeGiven}`
        });
      }

      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Compute oil-adjusted nutrition and measure-scaled nutrition for a given message
  const getAdjustedNutrition = (msgId: string, baseFood: FoodData) => {
    const portion = selectedPortions[msgId] ?? 1;
    const measureId = selectedMeasures[msgId] || 'serving';
    const measureObj = MEASURE_UNITS.find(m => m.id === measureId) || MEASURE_UNITS[0];
    const measureFactor = measureObj.factor;

    const oilOption = selectedOilOptions[msgId] || 'steamed';

    // 3 Options calculation:
    // Steamed = +0 kcal, +0g fat
    // Medium = +45 kcal, +5g fat
    // Fried = +120 kcal, +13g fat
    const oilCal = oilOption === 'fried' ? 120 : oilOption === 'medium' ? 45 : 0;
    const oilFat = oilOption === 'fried' ? 13 : oilOption === 'medium' ? 5 : 0;

    const totalMultiplier = portion * measureFactor;

    const adjustedCalories = Math.round((baseFood.calories + oilCal) * totalMultiplier);
    const adjustedProtein = Number((baseFood.protein * totalMultiplier).toFixed(1));
    const adjustedCarbs = Number((baseFood.carbs * totalMultiplier).toFixed(1));
    const adjustedFat = Number(((baseFood.fat + oilFat) * totalMultiplier).toFixed(1));
    const adjustedFiber = baseFood.fiber ? Number((baseFood.fiber * totalMultiplier).toFixed(1)) : undefined;

    return {
      oilOption,
      oilCal,
      oilFat,
      adjustedCalories,
      adjustedProtein,
      adjustedCarbs,
      adjustedFat,
      adjustedFiber,
      portion,
      measureId,
      measureLabel: measureObj.label,
      measureFactor,
      totalMultiplier
    };
  };

  // Handle logging food directly from the chat card to the client column with all details
  const handleLogFoodFromChat = (msgId: string, food: FoodData, targetSlot?: MealType) => {
    if (!activeClient) {
      alert("Please select a client from Column 2 or sign in to log this food into the daily diary.");
      return;
    }

    const { oilOption, adjustedCalories, adjustedProtein, adjustedCarbs, adjustedFat, portion, measureLabel } =
      getAdjustedNutrition(msgId, food);
    const slot = targetSlot || selectedSlots[msgId] || 'Evening Snack';

    const oilLabel =
      oilOption === 'fried' ? 'Deep Fried (+120 kcal)' :
      oilOption === 'medium' ? 'Medium Sauté (+45 kcal)' :
      'Steamed / No Oil';

    const servingDesc = portion !== 1 || measureLabel !== 'Standard Serving / Piece'
      ? `${portion}x [${measureLabel}]`
      : food.servingUnit;

    // Add to daily meal logs in AppContext (Column 3 / Client Daily Diary)
    addMealLog({
      clientId: activeClient.id,
      date: selectedDate,
      mealType: slot,
      foodId: 'food-ai-' + Date.now(),
      foodName: `${food.name} (${oilLabel})`,
      quantity: portion,
      servingUnit: servingDesc,
      calories: adjustedCalories,
      protein: adjustedProtein,
      carbs: adjustedCarbs,
      fat: adjustedFat
    });

    // Mark message as logged
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, loggedSuccess: true } : m));
    
    // Feedback: Bot directly gave other details of that food to column
    setSavedFoodNotice(
      `⚡ Bot directly added ${food.name} (${adjustedCalories} kcal, P:${adjustedProtein}g, C:${adjustedCarbs}g, F:${adjustedFat}g) to ${slot} column!`
    );
    setTimeout(() => setSavedFoodNotice(null), 4000);
  };

  // Handle logging whole suggested meal from chat card
  const handleLogSuggestedMealFromChat = (msgId: string, mealLogData: NonNullable<ChatMessage['mealLogData']>) => {
    if (!activeClient) {
      alert("Please sign in or select a client to log this meal into the daily diary.");
      return;
    }

    const oilOption = selectedOilOptions[msgId] || 'steamed';
    const oilCal = oilOption === 'fried' ? 120 : oilOption === 'medium' ? 45 : 0;
    const oilFat = oilOption === 'fried' ? 13 : oilOption === 'medium' ? 5 : 0;

    mealLogData.foods.forEach((f, idx) => {
      addMealLog({
        clientId: activeClient.id,
        date: selectedDate,
        mealType: mealLogData.detectedMealType,
        foodId: `food-ai-${Date.now()}-${idx}`,
        foodName: `${f.name} (${oilOption === 'fried' ? 'Deep Fried' : oilOption === 'medium' ? 'Medium Sauté' : 'Steamed'})`,
        quantity: f.quantity || 1,
        servingUnit: f.servingUnit || '1 serving',
        calories: f.calories + oilCal,
        protein: f.protein,
        carbs: f.carbs,
        fat: Number((f.fat + oilFat).toFixed(1)),
      });
    });

    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, loggedSuccess: true } : m));
    setSavedFoodNotice(`✓ Successfully logged all items to your ${mealLogData.detectedMealType}!`);
    setTimeout(() => setSavedFoodNotice(null), 3500);
  };

  // Formatter for bold text and headings
  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-extrabold text-slate-900 text-xs sm:text-sm pt-2 pb-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-emerald-600 rounded-full inline-block" />
                {formatInlineBolds(trimmed.replace('### ', ''))}
              </h4>
            );
          }

          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-2 py-0.5">
                <span className="text-emerald-600 font-black">•</span>
                <span className="text-slate-800">{formatInlineBolds(trimmed.substring(2))}</span>
              </div>
            );
          }

          return (
            <p key={idx} className="text-slate-800">
              {formatInlineBolds(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  const formatInlineBolds = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-black text-slate-950">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 group">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            title="Ask NutriBot AI Assistant (Kerala Snacks & Calories)"
            className="flex items-center gap-2.5 bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer border border-emerald-400/40"
          >
            <div className="relative">
              <Bot className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full" />
            </div>
            <span className="text-xs sm:text-sm font-bold tracking-tight">
              Ask NutriBot (Kerala Food AI)
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 hidden sm:inline" />
          </button>
        </div>
      )}

      {/* Floating Chatbot Modal / Drawer */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-200 flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden ${
            isExpanded
              ? 'inset-4 sm:inset-8'
              : 'bottom-4 right-4 w-[calc(100vw-32px)] sm:w-[480px] h-[660px] max-h-[88vh]'
          }`}
        >
          {/* Top Header */}
          <div className="bg-linear-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-inner">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm tracking-tight">NutriBot AI Assistant</h3>
                  <span className="text-[10px] uppercase font-extrabold bg-emerald-500/40 text-emerald-100 px-2 py-0.5 rounded-full border border-emerald-400/30">
                    Kerala Diet AI
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/80">
                  Saleem Valanchery Clinic • Kerala Snacks &amp; Food Calories
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Kerala Snacks Referral Toggle Button */}
              <button
                type="button"
                onClick={() => setShowReferralGuide(!showReferralGuide)}
                title="View Kerala Snacks & Calories Referral List"
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                  showReferralGuide
                    ? 'bg-amber-400 text-slate-900 border-amber-300 shadow-2xs font-extrabold'
                    : 'bg-white/15 text-white hover:bg-white/25 border-white/20'
                }`}
              >
                <span>🌴 Kerala Referral</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title={isExpanded ? 'Restore window size' : 'Expand chat window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Client Strip */}
          {activeClient ? (
            <div className="bg-emerald-50/90 px-4 py-2 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-900 shrink-0">
              <div className="flex items-center gap-2 truncate">
                <User className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="font-semibold truncate">{activeClient.name}</span>
                <span className="text-emerald-500">•</span>
                <span className="text-slate-600 truncate">{activeClient.goal}</span>
              </div>
              <div className="font-mono font-bold text-[11px] text-emerald-800 shrink-0">
                {clientContext.remainingCalories} kcal left today
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900 shrink-0">
              <span className="font-medium">Guest Mode • Tap Column 2 in Client Portal to sign in</span>
              <span className="text-amber-800 font-bold">NutriBot Ready</span>
            </div>
          )}

          {/* Saved Notification Banner */}
          {savedFoodNotice && (
            <div className="bg-emerald-100 text-emerald-900 text-xs px-4 py-2 border-b border-emerald-200 flex items-center gap-2 shrink-0 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-bold">{savedFoodNotice}</span>
            </div>
          )}

          {/* Kerala Snacks Referral Drawer (Mandate: "add snacks and its calories in referal") */}
          {showReferralGuide && (
            <div className="bg-linear-to-b from-amber-50 to-orange-50/40 p-3.5 border-b-2 border-amber-300 max-h-56 overflow-y-auto shrink-0 shadow-inner space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🌴</span>
                  <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                    Kerala Snacks &amp; Calories Referral Guide
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReferralGuide(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-slate-600">
                Official reference values from Saleem Valanchery Wellness Clinic. Tap <strong>Calculate</strong> to inspect oil options &amp; auto-add to clinic library:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {KERALA_SNACKS_REFERRAL.map((snack, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-white rounded-xl border border-amber-200/80 shadow-2xs flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-xs truncate">{snack.name}</div>
                      <div className="text-[10px] text-slate-500">{snack.servingUnit}</div>
                      <div className="text-[10px] font-black text-amber-900 mt-0.5">
                        🔥 {snack.steamedCal} kcal (Base) • Fried: {snack.friedCal} kcal
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowReferralGuide(false);
                        handleSendMessage(`Tell me about ${snack.name} calories and calculate was it oily options`);
                      }}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black shrink-0 cursor-pointer shadow-2xs transition-colors"
                    >
                      Check &rarr;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Food Search & Direct Logging Bar */}
          <div className="bg-linear-to-r from-emerald-50 via-white to-teal-50/60 border-b border-emerald-100 p-2.5 sm:p-3 shrink-0 shadow-2xs space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                <Search className="w-3.5 h-3.5 text-emerald-600" />
                <span>Search Food Portions &amp; Calories:</span>
              </div>
              
              {/* Grant Access to Bot to Directly Give Other Details to Column */}
              <div className="flex items-center gap-2">
                <div
                  title="Grant bot access to directly write calories and nutrition to client diary columns"
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                    grantBotColumnAccess
                      ? 'bg-emerald-100/90 border-emerald-300 text-emerald-900'
                      : 'bg-slate-100 border-slate-300 text-slate-600'
                  }`}
                >
                  <ShieldCheck className={`w-3.5 h-3.5 ${grantBotColumnAccess ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <label className="text-[10px] font-bold flex items-center gap-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={grantBotColumnAccess}
                      onChange={(e) => setGrantBotColumnAccess(e.target.checked)}
                      className="w-3 h-3 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>{grantBotColumnAccess ? '✓ Bot Column Access Granted' : 'Grant Bot Access'}</span>
                  </label>
                </div>

                <label
                  title="When searching, automatically add the food with its calories to the selected column"
                  className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-slate-600 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={autoAddToColumnOnSearch}
                    onChange={(e) => setAutoAddToColumnOnSearch(e.target.checked)}
                    className="w-3 h-3 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>Auto-add on search</span>
                </label>
              </div>
            </div>

            {/* Search Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!foodSearchQuery.trim()) return;
                handleSendMessage(foodSearchQuery.trim());
                setFoodSearchQuery('');
              }}
              className="flex items-center gap-1.5"
            >
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={foodSearchQuery}
                  onChange={(e) => setFoodSearchQuery(e.target.value)}
                  placeholder="Search any food (e.g. Pazham Pori, Boiled Egg, Oats, Rice, Apple)..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 transition-all placeholder:text-slate-400 font-medium shadow-2xs"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !foodSearchQuery.trim()}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <Search className="w-3 h-3" />
                <span>Search</span>
              </button>
            </form>

            {/* Quick Food Shortcuts */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[10px]">
              <span className="font-bold text-slate-400 uppercase shrink-0">Quick:</span>
              {[
                { label: '🍌 Pazham Pori', q: 'Pazham Pori calories and portions' },
                { label: '🥚 Boiled Egg', q: 'Boiled Egg calories and portions' },
                { label: '🍞 Wheat Bread', q: 'Whole Wheat Bread calories' },
                { label: '🥟 Parippu Vada', q: 'Parippu Vada calories and portions' },
                { label: '🌾 Oats', q: 'Oats calories and portions' },
                { label: '🍎 Apple', q: 'Apple portions and calories' },
                { label: '🍗 Chicken', q: 'Chicken Breast calories' },
                { label: '🍛 Rice', q: 'Kerala Matta Rice calories' },
                { label: '🍃 Ela Ada', q: 'Ela Ada calories and portions' },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip.q)}
                  className="px-2 py-0.5 bg-white hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 rounded-lg text-slate-700 font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-2xs"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg) => {
              // Extract oil adjustment calculations if food object is present
              const adjusted = msg.food ? getAdjustedNutrition(msg.id, msg.food) : null;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[92%] sm:max-w-[88%] rounded-2xl p-3.5 text-xs sm:text-sm shadow-2xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-700 text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                    }`}
                  >
                    {/* Badge: Automatically Added to Clinic Food Library */}
                    {msg.autoSavedToLibrary && (
                      <div className="mb-2.5 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>✨ Automatically Saved to Clinic Food Library</span>
                      </div>
                    )}

                    {/* SUGGESTED MEAL CARD (When reporting meal eaten with time) */}
                    {msg.mealLogData && (
                      <div className="mb-3.5 p-3.5 bg-linear-to-br from-emerald-50 via-teal-50 to-amber-50/40 rounded-2xl border-2 border-emerald-300 text-slate-900 space-y-3 shadow-xs">
                        <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-emerald-200">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                              <span className="font-black text-slate-900 text-sm">Suggested for Your Meals Section</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                              <span className="flex items-center gap-1 font-semibold text-slate-700">
                                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                                Eaten at: <strong className="text-slate-900 font-extrabold">{msg.mealLogData.timeGiven}</strong>
                              </span>
                              <span>•</span>
                              <span className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-md text-[11px]">
                                {msg.mealLogData.detectedMealType}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0 bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl shadow-2xs">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block flex items-center justify-end gap-1">
                              <Flame className="w-3 h-3 text-amber-600" />
                              Total Calories
                            </span>
                            <span className="text-base font-black text-amber-950">
                              {msg.mealLogData.totalCalories} <span className="text-xs font-bold text-amber-700">kcal</span>
                            </span>
                          </div>
                        </div>

                        {/* Each Food's Calories Stated FIRST */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-amber-500" />
                            Each Food's Calories (Check First):
                          </span>
                          
                          <div className="space-y-1.5">
                            {msg.mealLogData.foods.map((food, fIdx) => (
                              <div
                                key={fIdx}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-emerald-200 shadow-2xs"
                              >
                                <div className="flex-1 mr-2">
                                  <span className="font-extrabold text-slate-900 text-xs sm:text-sm block">
                                    {food.name}
                                  </span>
                                  <span className="text-[11px] text-slate-500 font-medium">
                                    Portion: <strong className="text-slate-700">{food.quantity}x ({food.servingUnit})</strong>
                                  </span>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="font-black text-amber-950 text-xs sm:text-sm bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                                    <Flame className="w-3 h-3 text-amber-600" />
                                    <strong>{food.calories} kcal</strong>
                                  </span>
                                  <div className="text-[10px] font-semibold text-slate-500 mt-0.5">
                                    P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Was it oily? 3 Options for this suggested meal */}
                        <div className="p-2.5 bg-white rounded-xl border border-amber-200 space-y-1.5">
                          <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1">
                            <Droplets className="w-3.5 h-3.5 text-amber-600" />
                            Was this meal oily? (Select cooking style):
                          </span>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { id: 'steamed', label: '🟢 Steamed / No Oil', sub: '+0 kcal' },
                              { id: 'medium', label: '🟡 Medium Sauté', sub: '+45 kcal' },
                              { id: 'fried', label: '🔴 Deep Fried', sub: '+120 kcal' },
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setSelectedOilOptions(prev => ({ ...prev, [msg.id]: opt.id as any }))}
                                className={`p-1.5 rounded-lg text-center border transition-all cursor-pointer ${
                                  (selectedOilOptions[msg.id] || 'steamed') === opt.id
                                    ? 'bg-amber-100 border-amber-400 text-amber-950 font-black shadow-2xs'
                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                <div className="text-[10px] font-bold leading-tight">{opt.label}</div>
                                <div className="text-[9px] text-slate-500 font-semibold">{opt.sub}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleLogSuggestedMealFromChat(msg.id, msg.mealLogData!)}
                            disabled={msg.loggedSuccess}
                            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                              msg.loggedSuccess
                                ? 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                            }`}
                          >
                            {msg.loggedSuccess ? (
                              <>
                                <Check className="w-4 h-4 text-emerald-800" />
                                <span>Added to Daily Meal Diary!</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                <span>Add to {msg.mealLogData.detectedMealType} Diary</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* FOOD INQUIRY CARD: Calories First + "Was it oily? 3 Options" + Auto-Added Library */}
                    {msg.food && adjusted && (
                      <div className="mb-3.5 p-3.5 bg-emerald-50/70 rounded-2xl border-2 border-emerald-200 text-slate-900 space-y-3">
                        
                        {/* 1. Food Header */}
                        <div className="flex items-start justify-between gap-2 pb-2 border-b border-emerald-200/80">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-black text-slate-900 text-base">{msg.food.name}</span>
                              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                                {msg.food.category}
                              </span>
                            </div>
                            <span className="text-xs text-slate-600 font-bold block mt-0.5">
                              Serving Unit: <strong className="text-slate-900">{msg.food.servingUnit}</strong>
                            </span>
                          </div>

                          <span className="text-xs font-black text-emerald-800 bg-white px-2.5 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                            {msg.food.glycemicIndex || 'GI: Balanced'}
                          </span>
                        </div>

                        {/* 2. PROMINENT CALORIES FIRST BANNER (Dynamic recalculation with oil) */}
                        <div className="p-3 bg-amber-100 border-2 border-amber-300 rounded-xl flex items-center justify-between shadow-2xs">
                          <div className="flex items-center gap-2">
                            <Flame className="w-5 h-5 text-amber-600 shrink-0" />
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                                Calories First Check
                              </span>
                              <span className="text-xs font-semibold text-amber-900">
                                {adjusted.portion}x portion ({adjusted.oilOption === 'fried' ? 'Deep Fried' : adjusted.oilOption === 'medium' ? 'Medium Sauté' : 'Steamed / No Oil'})
                              </span>
                            </div>
                          </div>
                          <span className="text-xl font-black text-amber-950">
                            {adjusted.adjustedCalories} <span className="text-xs font-bold text-amber-700">kcal</span>
                          </span>
                        </div>

                        {/* 3. CRITICAL MANDATE: "Was it oily? 3 options and calculate the calories accordingly" */}
                        <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-2 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                              <Droplets className="w-3.5 h-3.5 text-amber-600" />
                              Was it oily? (3 Cooking Options):
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              Live Calorie Recalculation
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              {
                                id: 'steamed',
                                title: '🟢 No Oil / Steamed',
                                calText: `${Math.round(msg.food.calories * adjusted.portion)} kcal`,
                                subText: '+0 kcal (0g added fat)'
                              },
                              {
                                id: 'medium',
                                title: '🟡 Medium Sauté',
                                calText: `${Math.round((msg.food.calories + 45) * adjusted.portion)} kcal`,
                                subText: '+45 kcal (+5g fat)'
                              },
                              {
                                id: 'fried',
                                title: '🔴 Deep Fried / Oily',
                                calText: `${Math.round((msg.food.calories + 120) * adjusted.portion)} kcal`,
                                subText: '+120 kcal (+13g fat)'
                              },
                            ].map((opt) => {
                              const isSelected = adjusted.oilOption === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => setSelectedOilOptions(prev => ({ ...prev, [msg.id]: opt.id as any }))}
                                  className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-amber-100 border-amber-400 text-amber-950 font-black shadow-xs ring-2 ring-amber-300'
                                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  <div className="text-[11px] font-bold leading-tight">{opt.title}</div>
                                  <div className="text-xs font-black text-amber-900 mt-0.5">{opt.calText}</div>
                                  <div className="text-[9px] text-slate-500">{opt.subText}</div>
                                </button>
                              );
                            })}
                          </div>

                          <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                            <span>Selected preparation: <strong className="text-slate-900">{adjusted.oilOption === 'fried' ? 'Deep Fried' : adjusted.oilOption === 'medium' ? 'Medium Sauté' : 'No Oil / Steamed'}</strong></span>
                            <span className="font-bold text-amber-800">
                              {adjusted.oilCal > 0 ? `+${adjusted.oilCal} kcal from oil` : 'Zero added oil calories'}
                            </span>
                          </div>
                        </div>

                        {/* 4. Core Macronutrients Grid (Calories, Protein, Carbs, Fat) */}
                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div className="bg-amber-50/80 p-2 rounded-xl border border-amber-200">
                            <span className="text-[10px] font-black text-amber-800 block flex items-center justify-center gap-0.5">
                              <Flame className="w-3 h-3 text-amber-600 inline" />
                              Calories
                            </span>
                            <span className="text-sm font-black text-amber-950 mt-0.5 block">
                              {adjusted.adjustedCalories} <span className="text-[9px] font-normal text-amber-700">kcal</span>
                            </span>
                          </div>

                          <div className="bg-emerald-50/90 p-2 rounded-xl border border-emerald-200">
                            <span className="text-[10px] font-black text-emerald-800 block flex items-center justify-center gap-0.5">
                              <Dumbbell className="w-3 h-3 text-emerald-600 inline" />
                              Protein
                            </span>
                            <span className="text-sm font-black text-emerald-950 mt-0.5 block">
                              {adjusted.adjustedProtein} <span className="text-[9px] font-normal text-emerald-700">g</span>
                            </span>
                          </div>

                          <div className="bg-blue-50/80 p-2 rounded-xl border border-blue-200">
                            <span className="text-[10px] font-black text-blue-800 block flex items-center justify-center gap-0.5">
                              <Wheat className="w-3 h-3 text-blue-600 inline" />
                              Carbs
                            </span>
                            <span className="text-sm font-black text-blue-950 mt-0.5 block">
                              {adjusted.adjustedCarbs} <span className="text-[9px] font-normal text-blue-700">g</span>
                            </span>
                          </div>

                          <div className="bg-orange-50/80 p-2 rounded-xl border border-orange-200">
                            <span className="text-[10px] font-black text-orange-800 block flex items-center justify-center gap-0.5">
                              <Droplets className="w-3 h-3 text-orange-600 inline" />
                              Fat
                            </span>
                            <span className="text-sm font-black text-orange-950 mt-0.5 block">
                              {adjusted.adjustedFat} <span className="text-[9px] font-normal text-orange-700">g</span>
                            </span>
                          </div>
                        </div>

                        {/* 5. Options of Qty & One Food Measure */}
                        <div className="bg-white p-3 rounded-2xl border border-emerald-100 shadow-2xs space-y-2.5">
                          <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
                            <span className="text-slate-800 font-extrabold text-[11px] flex items-center gap-1">
                              <span>📏</span>
                              <span>Options of Qty &amp; Measure:</span>
                            </span>
                            <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              {adjusted.portion}x • {adjusted.adjustedCalories} kcal
                            </span>
                          </div>

                          {/* Measure of One Food Selector */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 block">
                              Measure of 1 Food Unit:
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                              {MEASURE_UNITS.map((u) => {
                                const isSelected = (selectedMeasures[msg.id] || 'serving') === u.id;
                                return (
                                  <button
                                    key={u.id}
                                    type="button"
                                    onClick={() => setSelectedMeasures(prev => ({ ...prev, [msg.id]: u.id }))}
                                    className={`px-2 py-1 rounded-lg text-left text-[10px] font-bold border transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-emerald-100/90 border-emerald-400 text-emerald-950 ring-1 ring-emerald-400'
                                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                    }`}
                                  >
                                    <div className="truncate">{u.label}</div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Quantity Selector: Quick multipliers + Stepper */}
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-bold text-slate-500">Qty:</span>
                              {[0.5, 1, 1.5, 2, 3, 4].map((p) => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => setSelectedPortions(prev => ({ ...prev, [msg.id]: p }))}
                                  className={`px-1.5 py-0.5 text-[11px] font-black rounded-md transition-colors cursor-pointer ${
                                    (selectedPortions[msg.id] ?? 1) === p
                                      ? 'bg-emerald-700 text-white shadow-2xs'
                                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                  }`}
                                >
                                  {p}x
                                </button>
                              ))}
                            </div>

                            {/* Stepper buttons */}
                            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = selectedPortions[msg.id] ?? 1;
                                  if (cur > 0.5) setSelectedPortions(prev => ({ ...prev, [msg.id]: Number((cur - 0.5).toFixed(1)) }));
                                }}
                                className="w-5 h-5 flex items-center justify-center font-bold text-slate-700 hover:bg-white rounded cursor-pointer text-xs"
                              >
                                -
                              </button>
                              <span className="text-xs font-mono font-bold px-1 text-slate-900">
                                {selectedPortions[msg.id] ?? 1}x
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = selectedPortions[msg.id] ?? 1;
                                  setSelectedPortions(prev => ({ ...prev, [msg.id]: Number((cur + 0.5).toFixed(1)) }));
                                }}
                                className="w-5 h-5 flex items-center justify-center font-bold text-slate-700 hover:bg-white rounded cursor-pointer text-xs"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* 6. Add Direct to Food Menu on Each Section (In Chronological Order) */}
                        <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-emerald-950 font-black text-[11px] flex items-center gap-1">
                              <span>🍽️</span>
                              <span>Add Direct to Food Menu by Section:</span>
                            </span>
                            <span className="text-[10px] text-emerald-800 font-bold">In Daily Order</span>
                          </div>

                          {/* 5 Ordered Sections: Morning, Morning Snack, Lunch, Evening, Night */}
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                            {ORDERED_MEAL_SECTIONS.map((sec) => {
                              const isSelected = (selectedSlots[msg.id] || 'Evening Snack') === sec.id;
                              return (
                                <button
                                  key={sec.id}
                                  type="button"
                                  onClick={() => setSelectedSlots(prev => ({ ...prev, [msg.id]: sec.id }))}
                                  className={`p-1.5 rounded-xl text-center border transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-emerald-700 border-emerald-800 text-white font-black shadow-xs ring-2 ring-emerald-400'
                                      : 'bg-white border-slate-200 text-slate-700 hover:bg-emerald-50'
                                  }`}
                                >
                                  <div className="text-sm">{sec.icon}</div>
                                  <div className="text-[11px] font-bold leading-tight truncate">{sec.label}</div>
                                  <div className={`text-[9px] truncate ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                                    {sec.short}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 7. Grant Bot Access & Action: Direct Add to Column */}
                        <div className="space-y-1.5 pt-1">
                          {grantBotColumnAccess ? (
                            <button
                              type="button"
                              onClick={() => handleLogFoodFromChat(msg.id, msg.food!)}
                              disabled={msg.loggedSuccess}
                              className={`w-full py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                                msg.loggedSuccess
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white'
                              }`}
                            >
                              {msg.loggedSuccess ? (
                                <>
                                  <Check className="w-4 h-4 text-emerald-700" />
                                  <span>✓ Directly Added to {selectedSlots[msg.id] || 'Evening Snack'} Column!</span>
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                                  <span>
                                    ⚡ Direct Add to {ORDERED_MEAL_SECTIONS.find(s => s.id === (selectedSlots[msg.id] || 'Evening Snack'))?.label || selectedSlots[msg.id]} Column ({adjusted.adjustedCalories} kcal)
                                  </span>
                                </>
                              )}
                            </button>
                          ) : (
                            <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-center">
                              <p className="text-[11px] text-amber-900 font-bold mb-1">
                                🔒 Bot Column Access is paused.
                              </p>
                              <button
                                type="button"
                                onClick={() => setGrantBotColumnAccess(true)}
                                className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 cursor-pointer"
                              >
                                Grant Access to Bot to Add to Column
                              </button>
                            </div>
                          )}

                          {/* Quick 1-Click Direct Add to ANY Section */}
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                            <span className="font-bold text-slate-600">Quick 1-click add to column:</span>
                            <div className="flex items-center gap-1 flex-wrap">
                              {ORDERED_MEAL_SECTIONS.map((sec) => (
                                <button
                                  key={sec.id}
                                  type="button"
                                  onClick={() => handleLogFoodFromChat(msg.id, msg.food!, sec.id)}
                                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-emerald-600 hover:text-white rounded text-[10px] font-bold text-slate-700 transition-colors cursor-pointer"
                                  title={`Directly add to ${sec.label} column`}
                                >
                                  +{sec.short}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* Markdown conversational text */}
                    <div className="space-y-1.5">
                      {renderFormattedText(msg.text)}
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs max-w-[80%]">
                <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span>NutriBot is calculating calories &amp; oil preparation...</span>
                  <span className="flex gap-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-150" />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-300" />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Pill Carousel */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Quick:
            </span>
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(qp.query)}
                className="whitespace-nowrap px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 rounded-full text-[11px] font-medium text-slate-600 transition-all cursor-pointer shrink-0"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about Pazham Pori, Parippu Vada, oil calories, or type what you ate..."
              disabled={isLoading}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white p-2.5 rounded-2xl transition-colors cursor-pointer shadow-xs shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Subtext */}
          <div className="px-4 py-1.5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between shrink-0">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Saleem Valanchery Clinic Kerala Food Database
            </span>
            <span>All foods auto-saved to library</span>
          </div>

        </div>
      )}
    </>
  );
};
