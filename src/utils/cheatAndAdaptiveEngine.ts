import {
  AccountabilityChallenge,
  ActivityLog,
  ClientProfile,
  DietPreference,
  ExperienceLevel,
  FoodItem,
  MealLogItem,
  MealType,
} from '../types';
import { addDaysToDateString } from './dateUtils';
import { CLINICAL_DISCLAIMER } from './clinicalSafety';

export interface MonthlyCheatSummary {
  monthKey: string; // YYYY-MM
  monthLabel: string;
  limit: number; // 1 allowed cheat meal per calendar month
  usedCount: number;
  remaining: number;
  isAvailable: boolean;
  firstUsedDate?: string;
  firstUsedMealName?: string;
  logsInMonth: MealLogItem[];
}

export interface WeeklyCheatDigest {
  startDate: string;
  endDate: string;
  totalCheatCalories: number;
  cheatMealsCount: number;
  daysExceededTarget: number;
  avgDailyCalories: number;
  targetDailyCalories: number;
  prevWeekCheatCalories: number;
  prevWeekCheatCount: number;
  prevWeekDaysExceeded: number;
  deltaCheatCalories: number;
  deltaDaysExceeded: number;
  tip: string;
  toneStatus: 'steady' | 'balanced' | 'reset';
}

export function getCalendarMonthCheatSummary(
  mealLogs: MealLogItem[],
  clientId: string,
  referenceDate: string
): MonthlyCheatSummary {
  const monthKey = (referenceDate || new Date().toISOString().slice(0, 10)).slice(0, 7);
  const [y, m] = monthKey.split('-').map(Number);
  const monthLabel = new Date(y, (m || 1) - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const logsInMonth = mealLogs
    .filter(
      (log) =>
        log.clientId === clientId &&
        log.date.startsWith(monthKey) &&
        Boolean(log.isCheatMeal)
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  const limit = 1;
  const usedCount = logsInMonth.length;
  const remaining = Math.max(0, limit - usedCount);

  return {
    monthKey,
    monthLabel,
    limit,
    usedCount,
    remaining,
    isAvailable: usedCount < limit,
    firstUsedDate: logsInMonth[0]?.date,
    firstUsedMealName: logsInMonth[0]?.foodName,
    logsInMonth,
  };
}

/**
 * Builds an Accountability Challenge for tomorrow when a user logs a 2nd+ cheat meal
 * in the same calendar month. Includes set-splitting and beginner/injury-safe options.
 */
export function buildNextDayAccountabilityChallenge(params: {
  clientId: string;
  triggerDate: string;
  triggerMealName: string;
  cheatCountThisMonth: number;
}): Omit<AccountabilityChallenge, 'id'> {
  const tomorrow = addDaysToDateString(params.triggerDate, 1);
  return {
    clientId: params.clientId,
    triggerDate: params.triggerDate,
    targetDate: tomorrow,
    title: '50 Push-ups + 50 Bodyweight Squats',
    description:
      'Extra cheat meal logged — keep momentum fun! Complete 50 push-ups + 50 squats tomorrow, split into sets, or switch to the joint-friendly flow.',
    triggerMealName: params.triggerMealName,
    cheatCountThisMonth: params.cheatCountThisMonth,
    mode: 'split_sets',
    completed: false,
    setsCompleted: 0,
    totalSets: 5,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Generates the rolling 7-day Cheat Meal & Calorie Ceiling Digest comparing this week vs previous week.
 */
export function getWeeklyCheatAndCalorieDigest(
  mealLogs: MealLogItem[],
  client: ClientProfile,
  referenceDate: string
): WeeklyCheatDigest {
  const targetDailyCalories = Math.max(
    1200,
    Math.round(client.neededCalories || client.targetBmr || 1600)
  );

  const summarizeWindow = (endStr: string) => {
    const daySet: string[] = [];
    for (let i = 6; i >= 0; i--) {
      daySet.push(addDaysToDateString(endStr, -i));
    }
    const startStr = daySet[0];
    const windowLogs = mealLogs.filter(
      (l) => l.clientId === client.id && daySet.includes(l.date)
    );
    const cheatLogs = windowLogs.filter((l) => Boolean(l.isCheatMeal));
    const totalCheatCalories = Math.round(
      cheatLogs.reduce((s, l) => s + (Number(l.calories) || 0), 0)
    );
    let daysExceededTarget = 0;
    let totalAllCalories = 0;
    let loggedDaysCount = 0;
    for (const d of daySet) {
      const dayCals = windowLogs
        .filter((l) => l.date === d)
        .reduce((s, l) => s + (Number(l.calories) || 0), 0);
      if (dayCals > 0) {
        loggedDaysCount += 1;
        totalAllCalories += dayCals;
      }
      if (dayCals > targetDailyCalories) {
        daysExceededTarget += 1;
      }
    }
    return {
      startStr,
      endStr,
      totalCheatCalories,
      cheatMealsCount: cheatLogs.length,
      daysExceededTarget,
      avgDailyCalories: loggedDaysCount > 0 ? Math.round(totalAllCalories / loggedDaysCount) : 0,
    };
  };

  const curr = summarizeWindow(referenceDate);
  const prevEnd = addDaysToDateString(referenceDate, -7);
  const prev = summarizeWindow(prevEnd);

  const deltaCheatCalories = curr.totalCheatCalories - prev.totalCheatCalories;
  const deltaDaysExceeded = curr.daysExceededTarget - prev.daysExceededTarget;

  let toneStatus: WeeklyCheatDigest['toneStatus'] = 'steady';
  let tip =
    'Your 7-day rhythm is calm and consistent. Keep anchoring breakfast and lunch with protein and fiber.';

  if (curr.cheatMealsCount >= 2 || curr.daysExceededTarget >= 3) {
    toneStatus = 'reset';
    tip =
      'Try pairing treat meals with a crisp salad starter and a 15-minute walk — small pre-meal fiber buffers keep blood sugar steady without skipping foods you enjoy.';
  } else if (deltaCheatCalories > 150 || curr.daysExceededTarget >= 2) {
    toneStatus = 'balanced';
    tip =
      'Notice when extra snacks sneak in (often late afternoon). Adding Greek yogurt, roasted chana, or buttermilk at 4 PM cuts evening cravings naturally.';
  } else if (deltaDaysExceeded < 0 || curr.daysExceededTarget === 0) {
    toneStatus = 'steady';
    tip =
      'Great consistency this week! Staying close to your daily budget leaves plenty of room for your monthly planned treat.';
  }

  return {
    startDate: curr.startStr,
    endDate: curr.endStr,
    totalCheatCalories: curr.totalCheatCalories,
    cheatMealsCount: curr.cheatMealsCount,
    daysExceededTarget: curr.daysExceededTarget,
    avgDailyCalories: curr.avgDailyCalories,
    targetDailyCalories,
    prevWeekCheatCalories: prev.totalCheatCalories,
    prevWeekCheatCount: prev.cheatMealsCount,
    prevWeekDaysExceeded: prev.daysExceededTarget,
    deltaCheatCalories,
    deltaDaysExceeded,
    tip,
    toneStatus,
  };
}

/**
 * Dynamically evaluates a client's real-time Experience Level (Beginner / Intermediate / Advanced)
 * using onboarding self-report blended with 14-day logging consistency, workout cadence, and adherence.
 */
export function evaluateExperienceLevel(
  client: ClientProfile,
  mealLogs: MealLogItem[],
  activities: ActivityLog[],
  referenceDate: string
): {
  level: ExperienceLevel;
  score: number;
  consistencyDays14: number;
  workoutSessions14: number;
  adherenceRatePct: number;
  rationale: string;
} {
  const days14: string[] = [];
  for (let i = 13; i >= 0; i--) {
    days14.push(addDaysToDateString(referenceDate, -i));
  }
  const targetKcal = Math.max(1200, Number(client.neededCalories || client.targetBmr || 1600));

  let consistencyDays14 = 0;
  let onTargetDays = 0;
  for (const d of days14) {
    const dayCals = mealLogs
      .filter((l) => l.clientId === client.id && l.date === d)
      .reduce((s, l) => s + (Number(l.calories) || 0), 0);
    if (dayCals > 0) {
      consistencyDays14 += 1;
      if (Math.abs(dayCals - targetKcal) <= targetKcal * 0.2) {
        onTargetDays += 1;
      }
    }
  }

  const workoutSessions14 = activities.filter(
    (a) => a.clientId === client.id && days14.includes(a.date)
  ).length;

  const adherenceRatePct =
    consistencyDays14 > 0 ? Math.round((onTargetDays / consistencyDays14) * 100) : 0;

  // Baseline points from onboarding experience
  const basePts =
    client.experienceLevel === 'Advanced'
      ? 35
      : client.experienceLevel === 'Intermediate'
      ? 20
      : 8;

  const consistencyPts = Math.min(35, Math.round((consistencyDays14 / 14) * 35));
  const workoutPts = Math.min(20, workoutSessions14 * 3);
  const adherencePts = Math.round((adherenceRatePct / 100) * 15);
  const score = Math.min(100, basePts + consistencyPts + workoutPts + adherencePts);

  let level: ExperienceLevel = 'Beginner';
  if (score >= 68 && workoutSessions14 >= 4 && consistencyDays14 >= 5) {
    level = 'Advanced';
  } else if (score >= 42 || (consistencyDays14 >= 4 && workoutSessions14 >= 2)) {
    level = 'Intermediate';
  }

  const rationale = `${consistencyDays14}/14 days logged · ${workoutSessions14} workouts · ${adherenceRatePct}% on-target`;

  return {
    level,
    score,
    consistencyDays14,
    workoutSessions14,
    adherenceRatePct,
    rationale,
  };
}

export interface AdaptiveMealOption {
  id: string;
  name: string;
  portionLabel: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  tags: string[];
  prepTip: string;
}

export interface AdaptiveMealSlotPlan {
  mealType: MealType;
  timeWindow: string;
  primary: AdaptiveMealOption;
  alternatives: AdaptiveMealOption[];
  targetCalories: number;
}

export interface AdaptiveExerciseBlock {
  phase: 'Warm-up' | 'Main Workout' | 'Cool-down';
  durationMinutes: number;
  items: string[];
}

export interface AdaptiveDailyPlan {
  date: string;
  experienceLevel: ExperienceLevel;
  targetCalories: number;
  hydrationTargetLiters: number;
  dailyTip: string;
  cheatRebalanceNote?: string;
  clinicalDisclaimer: string;
  mealSlots: AdaptiveMealSlotPlan[];
  exercisePlan: {
    isRestDay: boolean;
    focusTitle: string;
    totalMinutes: number;
    estimatedBurnKcal: number;
    blocks: AdaptiveExerciseBlock[];
    modificationNote: string;
  };
}

const MEAL_TEMPLATES: Record<
  'Breakfast' | 'Lunch' | 'Evening Snack' | 'Dinner',
  AdaptiveMealOption[]
> = {
  Breakfast: [
    {
      id: 'adp-bf-1',
      name: '2 Steamed Idli + Kadala / Lentil Sambar + Boiled Egg Whites',
      portionLabel: '2 pcs + 1 bowl + 2 whites',
      calories: 340,
      protein: 19,
      carbs: 48,
      fat: 6,
      fiber: 7,
      sugar: 4,
      tags: ['vegetarian_ok_minus_egg', 'eggetarian', 'kerala_traditional', 'high_protein', 'dairy_free', 'nut_free', 'gluten_free'],
      prepTip: 'Steam-cooked and gentle on morning digestion.',
    },
    {
      id: 'adp-bf-2',
      name: 'Rolled Oats Porridge with Chia, Soy Milk & Fresh Apple',
      portionLabel: '1 bowl (250g)',
      calories: 325,
      protein: 14,
      carbs: 49,
      fat: 7,
      fiber: 9,
      sugar: 11,
      tags: ['vegetarian', 'vegan', 'eggetarian', 'balanced', 'nut_free'],
      prepTip: 'Beta-glucan oats fiber keeps fullness high through noon.',
    },
    {
      id: 'adp-bf-3',
      name: 'Kerala Puttu + Roasted Bengal Gram Kadala Curry',
      portionLabel: '1 piece puttu + 1 bowl curry',
      calories: 375,
      protein: 14,
      carbs: 59,
      fat: 9,
      fiber: 8,
      sugar: 4,
      tags: ['vegetarian', 'vegan', 'kerala_traditional', 'balanced', 'dairy_free', 'nut_free', 'gluten_free'],
      prepTip: 'Classic Kerala pair with slow-release complex carbs.',
    },
    {
      id: 'adp-bf-4',
      name: '2-Egg Veggie Scramble + Whole-Grain Avocado Toast',
      portionLabel: '2 eggs + 1 slice',
      calories: 360,
      protein: 20,
      carbs: 22,
      fat: 20,
      fiber: 6,
      sugar: 3,
      tags: ['eggetarian', 'high_protein', 'low_carb', 'balanced', 'dairy_free', 'nut_free'],
      prepTip: 'Rich in choline and satiating healthy fats.',
    },
    {
      id: 'adp-bf-5',
      name: 'Spiced Moong Dal Chilla (2 crepes) + Mint Greek Yogurt',
      portionLabel: '2 crepes + 80g curd',
      calories: 335,
      protein: 18,
      carbs: 42,
      fat: 9,
      fiber: 7,
      sugar: 4,
      tags: ['vegetarian', 'high_protein', 'balanced', 'gluten_free', 'nut_free'],
      prepTip: 'High plant protein savory breakfast.',
    },
  ],
  Lunch: [
    {
      id: 'adp-ln-1',
      name: 'Kerala Matta Rice + Grilled Fish / Mackerel Curry + Thoran Greens',
      portionLabel: '1 cup rice + 120g fish + greens',
      calories: 510,
      protein: 34,
      carbs: 54,
      fat: 14,
      fiber: 8,
      sugar: 4,
      tags: ['pescatarian', 'kerala_traditional', 'balanced', 'high_protein', 'dairy_free', 'nut_free', 'gluten_free'],
      prepTip: 'Omega-3 rich fish curry paired with mineral-dense matta rice.',
    },
    {
      id: 'adp-ln-2',
      name: 'Grilled Herb Chicken Bowl with Quinoa, Broccoli & Olive Vinaigrette',
      portionLabel: '130g chicken + 1 cup quinoa + veg',
      calories: 495,
      protein: 41,
      carbs: 42,
      fat: 15,
      fiber: 8,
      sugar: 5,
      tags: ['balanced', 'high_protein', 'dairy_free', 'nut_free', 'gluten_free'],
      prepTip: 'Lean muscle-building midday plate.',
    },
    {
      id: 'adp-ln-3',
      name: '2 Whole Wheat Chapati + Paneer Bhurji + Cucumber Kosambari Salad',
      portionLabel: '2 rotis + 120g paneer + salad',
      calories: 505,
      protein: 27,
      carbs: 48,
      fat: 21,
      fiber: 8,
      sugar: 5,
      tags: ['vegetarian', 'eggetarian', 'high_protein', 'balanced', 'nut_free'],
      prepTip: 'Steady calcium and slow-digesting vegetarian casein.',
    },
    {
      id: 'adp-ln-4',
      name: 'Tofu & Edamame Brown Rice Stir-Fry with Sesame & Bok Choy',
      portionLabel: '150g tofu + 1 cup rice',
      calories: 470,
      protein: 26,
      carbs: 50,
      fat: 16,
      fiber: 9,
      sugar: 5,
      tags: ['vegetarian', 'vegan', 'dairy_free', 'gluten_free', 'balanced'],
      prepTip: 'Plant-complete amino acids with isoflavone recovery support.',
    },
  ],
  'Evening Snack': [
    {
      id: 'adp-sn-1',
      name: 'Kerala Spiced Sambharam + Roasted Chickpeas (Kadala)',
      portionLabel: '1 glass (240ml) + 30g roasted',
      calories: 165,
      protein: 8,
      carbs: 22,
      fat: 4,
      fiber: 5,
      sugar: 4,
      tags: ['vegetarian', 'kerala_traditional', 'balanced', 'nut_free', 'gluten_free'],
      prepTip: 'Probiotic hydration + crunchy fiber to beat 4 PM cravings.',
    },
    {
      id: 'adp-sn-2',
      name: 'Plain Greek Yogurt + Fresh Guava / Berry Slices',
      portionLabel: '150g yogurt + 100g fruit',
      calories: 170,
      protein: 15,
      carbs: 18,
      fat: 3,
      fiber: 4,
      sugar: 11,
      tags: ['vegetarian', 'eggetarian', 'high_protein', 'low_carb', 'nut_free', 'gluten_free'],
      prepTip: '15g protein curb before dinner.',
    },
    {
      id: 'adp-sn-3',
      name: 'Fresh Papaya Bowl + Roasted Pumpkin Seeds',
      portionLabel: '150g fruit + 15g seeds',
      calories: 155,
      protein: 6,
      carbs: 19,
      fat: 7,
      fiber: 4,
      sugar: 10,
      tags: ['vegetarian', 'vegan', 'dairy_free', 'nut_free', 'gluten_free', 'balanced'],
      prepTip: 'Digestive papain enzymes and magnesium-rich seeds.',
    },
    {
      id: 'adp-sn-4',
      name: 'Black Coffee / Sulaimani + Soaked Almonds (12 pcs)',
      portionLabel: '1 cup + 15g almonds',
      calories: 115,
      protein: 4,
      carbs: 6,
      fat: 8,
      fiber: 2,
      sugar: 1,
      tags: ['vegetarian', 'vegan', 'low_carb', 'kerala_traditional', 'dairy_free', 'gluten_free'],
      prepTip: 'Clean pre-workout alertness.',
    },
  ],
  Dinner: [
    {
      id: 'adp-dn-1',
      name: '2 String Hoppers (Idiyappam) + Vegetable Stew + Steamed Fish',
      portionLabel: '2 idiyappam + 1 bowl + 100g fish',
      calories: 410,
      protein: 27,
      carbs: 48,
      fat: 11,
      fiber: 6,
      sugar: 4,
      tags: ['pescatarian', 'kerala_traditional', 'balanced', 'high_protein', 'dairy_free', 'nut_free', 'gluten_free'],
      prepTip: 'Light, easy-to-digest Kerala dinner 2.5 hrs before sleep.',
    },
    {
      id: 'adp-dn-2',
      name: 'Cauliflower & Herb Chicken Skillet with Sautéed Zucchini',
      portionLabel: '140g chicken + 200g veg',
      calories: 375,
      protein: 38,
      carbs: 16,
      fat: 16,
      fiber: 6,
      sugar: 6,
      tags: ['low_carb', 'high_protein', 'balanced', 'dairy_free', 'nut_free', 'gluten_free'],
      prepTip: 'Low evening glycemic load for steady overnight recovery.',
    },
    {
      id: 'adp-dn-3',
      name: 'Moong Dal Khichdi with Roasted Bottle Gourd & Cucumber Raita',
      portionLabel: '1 large bowl (260g)',
      calories: 390,
      protein: 16,
      carbs: 58,
      fat: 9,
      fiber: 9,
      sugar: 5,
      tags: ['vegetarian', 'eggetarian', 'balanced', 'nut_free', 'gluten_free'],
      prepTip: 'Comforting plant amino acids + gut-soothing hydration.',
    },
    {
      id: 'adp-dn-4',
      name: 'Baked Herb Tofu & Mixed Greens Buddha Bowl with Tahini Lemon',
      portionLabel: '160g tofu + 200g greens',
      calories: 385,
      protein: 24,
      carbs: 28,
      fat: 18,
      fiber: 9,
      sugar: 4,
      tags: ['vegetarian', 'vegan', 'low_carb', 'dairy_free', 'nut_free', 'gluten_free'],
      prepTip: 'Plant calcium & magnesium for restful sleep.',
    },
  ],
};

function matchesDietAndAllergies(
  option: AdaptiveMealOption,
  dietPref: DietPreference = 'balanced',
  allergies: string[] = []
): boolean {
  const nameLower = option.name.toLowerCase();
  const normalizedAllergies = allergies.map((a) => a.toLowerCase().trim()).filter(Boolean);

  for (const allergen of normalizedAllergies) {
    if (allergen.includes('dairy') || allergen.includes('lactose') || allergen.includes('milk')) {
      if (/paneer|yogurt|curd|milk|sambharam|raita|cheese|whey/i.test(nameLower)) return false;
    }
    if (allergen.includes('nut') || allergen.includes('peanut') || allergen.includes('almond')) {
      if (/almond|peanut|cashew|walnut|badam/i.test(nameLower)) return false;
    }
    if (allergen.includes('gluten') || allergen.includes('wheat')) {
      if (/chapati|roti|bread|toast|oats|wheat/i.test(nameLower)) return false;
    }
    if (allergen.includes('egg')) {
      if (/egg/i.test(nameLower)) return false;
    }
    if (allergen.includes('fish') || allergen.includes('seafood')) {
      if (/fish|mackerel|salmon|prawn/i.test(nameLower)) return false;
    }
    if (allergen.includes('soy')) {
      if (/tofu|soy|edamame/i.test(nameLower)) return false;
    }
  }

  if (dietPref === 'vegan') return option.tags.includes('vegan');
  if (dietPref === 'vegetarian') {
    return option.tags.includes('vegetarian') || option.tags.includes('vegan');
  }
  if (dietPref === 'eggetarian') {
    return (
      option.tags.includes('eggetarian') ||
      option.tags.includes('vegetarian') ||
      option.tags.includes('vegan')
    );
  }
  if (dietPref === 'pescatarian') {
    return !/chicken|beef|mutton/i.test(nameLower);
  }
  return true;
}

/**
 * Generates an adaptive, allergy-safe Diet + Exercise Plan for a given date.
 */
export function generateAdaptiveDailyPlan(params: {
  client: ClientProfile;
  foodsLibrary?: FoodItem[];
  mealLogs: MealLogItem[];
  activities: ActivityLog[];
  dateStr: string;
  swaps?: Partial<Record<'Breakfast' | 'Lunch' | 'Evening Snack' | 'Dinner', number>>;
  regenerateOffset?: number;
}): AdaptiveDailyPlan {
  const { client, mealLogs, activities, dateStr, swaps = {}, regenerateOffset = 0 } = params;
  const evalResult = evaluateExperienceLevel(client, mealLogs, activities, dateStr);
  const dietPref: DietPreference = client.dietPreference || 'balanced';
  const allergies = client.allergies || [];

  const baseTargetCal = Math.max(1200, Math.round(client.neededCalories || client.targetBmr || 1600));

  // Gentle non-extreme next-day adjustment if yesterday had a cheat meal
  const yesterday = addDaysToDateString(dateStr, -1);
  const hadCheatYesterday = mealLogs.some(
    (l) => l.clientId === client.id && l.date === yesterday && Boolean(l.isCheatMeal)
  );
  const adjustedCal = hadCheatYesterday
    ? Math.max(client.gender === 'Male' ? 1500 : 1200, baseTargetCal - 120)
    : baseTargetCal;

  // Deterministic day seed from date string + offset
  const dateSeed =
    dateStr.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) + regenerateOffset;

  const slotTargets: Record<'Breakfast' | 'Lunch' | 'Evening Snack' | 'Dinner', { pct: number; time: string }> = {
    Breakfast: { pct: 0.25, time: '7:30 – 8:30 AM' },
    Lunch: { pct: 0.35, time: '12:45 – 1:45 PM' },
    'Evening Snack': { pct: 0.12, time: '4:15 – 5:00 PM' },
    Dinner: { pct: 0.28, time: '7:15 – 8:15 PM' },
  };

  const mealSlots: AdaptiveMealSlotPlan[] = (
    ['Breakfast', 'Lunch', 'Evening Snack', 'Dinner'] as const
  ).map((slotKey, slotIdx) => {
    const rawPool = MEAL_TEMPLATES[slotKey];
    let filtered = rawPool.filter((opt) => matchesDietAndAllergies(opt, dietPref, allergies));
    if (filtered.length === 0) {
      // Safe fallback plant/whole-food list
      filtered = rawPool.filter((opt) => !/chicken|beef|fish/i.test(opt.name));
      if (filtered.length === 0) filtered = rawPool;
    }

    // Prioritize diet preference tag if matched
    const sorted = [...filtered].sort((a, b) => {
      const aMatch = a.tags.includes(dietPref) ? 1 : 0;
      const bMatch = b.tags.includes(dietPref) ? 1 : 0;
      return bMatch - aMatch;
    });

    const swapIdx = swaps[slotKey] ?? ((dateSeed + slotIdx) % sorted.length);
    const chosen = sorted[swapIdx % sorted.length];
    const targetSlotCal = Math.round(adjustedCal * slotTargets[slotKey].pct);
    const scaleFactor = Math.max(0.7, Math.min(1.45, targetSlotCal / Math.max(100, chosen.calories)));

    const scaleOption = (opt: AdaptiveMealOption): AdaptiveMealOption => ({
      ...opt,
      calories: Math.round(opt.calories * scaleFactor),
      protein: Math.round(opt.protein * scaleFactor),
      carbs: Math.round(opt.carbs * scaleFactor),
      fat: Math.round(opt.fat * scaleFactor),
      fiber: Math.round(opt.fiber * scaleFactor),
      sugar: Math.round(opt.sugar * scaleFactor),
    });

    const alternatives = sorted
      .filter((o) => o.id !== chosen.id)
      .slice(0, 3)
      .map(scaleOption);

    return {
      mealType: slotKey,
      timeWindow: slotTargets[slotKey].time,
      primary: scaleOption(chosen),
      alternatives,
      targetCalories: targetSlotCal,
    };
  });

  // Exercise plan adapted to experience level, scheduleDaysPerWeek, equipment & medical notes
  const dayOfWeek = new Date(dateStr + 'T12:00:00').getDay(); // 0=Sun..6=Sat
  const scheduleDays = Math.max(2, Math.min(7, Number(client.scheduleDaysPerWeek) || 4));
  const restDaysMap: Record<number, number[]> = {
    2: [1, 2, 4, 5, 6],
    3: [0, 2, 4, 6],
    4: [0, 3, 5],
    5: [0, 4],
    6: [0],
    7: [],
  };
  const isRestDay = (restDaysMap[scheduleDays] || [0, 4]).includes(dayOfWeek);
  const equipment = client.equipment || 'none_home';
  const eqLabel =
    equipment === 'full_gym'
      ? 'Gym Equipment'
      : equipment === 'dumbbells_bands'
      ? 'Dumbbells & Resistance Bands'
      : 'Bodyweight (Home)';

  let exercisePlan: AdaptiveDailyPlan['exercisePlan'];

  if (isRestDay) {
    exercisePlan = {
      isRestDay: true,
      focusTitle: 'Active Recovery & Mobility',
      totalMinutes: 20,
      estimatedBurnKcal: 85,
      blocks: [
        { phase: 'Warm-up', durationMinutes: 5, items: ['20-breath diaphragmatic breathing', 'Neck & shoulder rolls'] },
        { phase: 'Main Workout', durationMinutes: 10, items: ['Gentle 10–15 min post-meal stroll', 'Cat-cow + thoracic rotation'] },
        { phase: 'Cool-down', durationMinutes: 5, items: ['Hamstring & calf gentle stretch'] },
      ],
      modificationNote: 'Rest days rebuild tissue and keep cortisol low — enjoy light walking without strain.',
    };
  } else if (evalResult.level === 'Beginner') {
    exercisePlan = {
      isRestDay: false,
      focusTitle: `Foundation Strength & Cardio (${eqLabel})`,
      totalMinutes: 28,
      estimatedBurnKcal: 175,
      blocks: [
        { phase: 'Warm-up', durationMinutes: 5, items: ['Marching in place (2m)', 'Arm circles & hip openers (3m)'] },
        {
          phase: 'Main Workout',
          durationMinutes: 18,
          items: [
            '2×10 Supported Chair Squats (30s rest)',
            '2×10 Incline Wall Push-Ups',
            equipment === 'none_home' ? '2×20s Glute Bridges' : '2×12 Light Goblet Rows',
            '8 min brisk walk cadence',
          ],
        },
        { phase: 'Cool-down', durationMinutes: 5, items: ['Quadriceps stretch', 'Deep nasal breathing'] },
      ],
      modificationNote: 'Joint-friendly Beginner pace. Stop any movement that causes sharp pain.',
    };
  } else if (evalResult.level === 'Intermediate') {
    exercisePlan = {
      isRestDay: false,
      focusTitle: `Metabolic Strength Circuit (${eqLabel})`,
      totalMinutes: 40,
      estimatedBurnKcal: 295,
      blocks: [
        { phase: 'Warm-up', durationMinutes: 6, items: ['Dynamic world’s greatest stretch', 'Jumping jacks or step-jacks (3m)'] },
        {
          phase: 'Main Workout',
          durationMinutes: 28,
          items: [
            '3×12 Bodyweight or Dumbbell Squats',
            '3×10–12 Push-Ups (or Chest Press)',
            '3×12 Split Lunges / Step-Ups',
            '3×30s Forearm Plank + 10 min Zone-2 tempo walk/jog',
          ],
        },
        { phase: 'Cool-down', durationMinutes: 6, items: ['Hip flexor & chest opener stretch'] },
      ],
      modificationNote: 'Intermediate progression automatically unlocked from your consistency.',
    };
  } else {
    exercisePlan = {
      isRestDay: false,
      focusTitle: `Performance Hypertrophy & Conditioning (${eqLabel})`,
      totalMinutes: 52,
      estimatedBurnKcal: 420,
      blocks: [
        { phase: 'Warm-up', durationMinutes: 8, items: ['Mobility flow', '2 ramp-up sets at 50% load'] },
        {
          phase: 'Main Workout',
          durationMinutes: 36,
          items: [
            '4×10–12 Loaded Squats / Leg Press',
            '4×10 Weighted Push-Ups / Bench Press',
            '4×12 Bent-Over Rows / Pull-Ups',
            '12 min HIIT intervals or Zone-2 finisher',
          ],
        },
        { phase: 'Cool-down', durationMinutes: 8, items: ['Pigeon stretch', 'Slow parasympathetic cooldown'] },
      ],
      modificationNote: 'Advanced programming calibrated from your steady training frequency.',
    };
  }

  const hydrationTargetLiters =
    Math.round(
      Math.max(
        2.0,
        Math.min(4.0, client.dailyWaterTargetLiters || (Number(client.currentWeightKg) || 65) * 0.035)
      ) * 10
    ) / 10;

  const tips = [
    'Eat 15–20g of protein with your first meal to steady hunger hormones for the rest of the day.',
    'A 10-minute relaxed walk after lunch noticeably smooths post-meal energy dips.',
    'Pair high-iron plant foods like lentils and greens with a squeeze of lemon for better absorption.',
    'Hydrate 300 ml before coffee or tea each morning to wake up digestion cleanly.',
  ];

  return {
    date: dateStr,
    experienceLevel: evalResult.level,
    targetCalories: adjustedCal,
    hydrationTargetLiters,
    dailyTip: tips[dateSeed % tips.length],
    cheatRebalanceNote: hadCheatYesterday
      ? 'Gentle post-treat balance: today nudges calories ~120 kcal lighter with higher fiber & hydration—never an extreme fast.'
      : undefined,
    clinicalDisclaimer: CLINICAL_DISCLAIMER,
    mealSlots,
    exercisePlan,
  };
}
