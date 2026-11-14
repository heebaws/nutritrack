import { MealLogItem } from '../types';

export type CalorieQuality = 'good' | 'bad';

const BAD_CALORIE_KEYWORDS = [
  'fried',
  'chips',
  'soda',
  'coke',
  'pepsi',
  'fizz',
  'sugar',
  'candy',
  'cake',
  'pizza',
  'burger',
  'puff',
  'samosa',
  'halwa',
  'laddu',
  'sweet',
  'jalebi',
  'bhatura',
  'porotta',
  'parotta',
  'shawarma',
  'upperi',
  'vada',
  'gulab jamun',
  'donut',
  'doughnut',
  'ice cream',
  'pastry',
  'mayo',
  'mayonnaise',
  'fries',
  'french fries',
  'nuggets',
  'sausage',
  'hot dog',
  'deep fried',
  'sharkara upperi',
  'neyyappam',
  'unniyappam',
  'pazham pori',
  'cookie',
  'biscuit',
  'syrup'
];

/**
 * Determine if a food or meal log counts as Good Calories (wholesome nutrients)
 * or Bad Calories (high refined sugar, deep-fried oil, processed snack).
 */
export function determineCalorieQuality(
  foodName: string,
  category?: string,
  oilOption?: 'steamed' | 'medium' | 'fried',
  explicitQuality?: 'good' | 'bad'
): CalorieQuality {
  if (explicitQuality === 'good' || explicitQuality === 'bad') {
    return explicitQuality;
  }

  if (oilOption === 'fried') {
    return 'bad';
  }

  const lower = (foodName || '').toLowerCase().trim();

  if (BAD_CALORIE_KEYWORDS.some(kw => lower.includes(kw))) {
    return 'bad';
  }

  if (category === 'Beverages & Snacks') {
    if (
      lower.includes('tea with sugar') ||
      lower.includes('shake') ||
      lower.includes('soft drink') ||
      lower.includes('juice with sugar')
    ) {
      return 'bad';
    }
  }

  return 'good';
}

export interface CalorieBreakdown {
  totalCalories: number;
  goodCalories: number;
  badCalories: number;
  caloriesBurned: number;
  netCalories: number;
}

/**
 * Calculate good vs bad vs total calories from meal logs, factoring in activity calorie burns
 */
export function calculateCalorieBreakdown(
  logs: MealLogItem[],
  caloriesBurned: number = 0
): CalorieBreakdown {
  let goodCalories = 0;
  let badCalories = 0;

  logs.forEach(log => {
    const quality = log.calorieQuality || determineCalorieQuality(log.foodName);
    if (quality === 'bad') {
      badCalories += log.calories || 0;
    } else {
      goodCalories += log.calories || 0;
    }
  });

  const totalCalories = goodCalories + badCalories;
  const netCalories = Math.max(0, totalCalories - caloriesBurned);

  return {
    totalCalories,
    goodCalories,
    badCalories,
    caloriesBurned,
    netCalories
  };
}

/**
 * Convert daily walking steps into clinical calories burned adjusted for body weight.
 * ~0.04 kcal/step at 70kg baseline (~320 kcal for 8,000 steps).
 */
export function calculateStepCalories(steps: number, weightKg: number = 70): number {
  const safeSteps = Math.max(0, Number(steps) || 0);
  const safeWeight = weightKg && weightKg > 20 ? weightKg : 70;
  return Math.round(safeSteps * 0.04 * (safeWeight / 70));
}

