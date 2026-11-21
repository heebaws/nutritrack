import { ClientProfile, FoodCategory, FoodItem, MealLogItem } from '../types';

export interface MicronutrientValues {
  calcium: number;   // mg
  iron: number;      // mg
  magnesium: number; // mg
  vitaminD: number;  // IU
}

export interface DailyNutrientTargets {
  calories: number;
  protein: number;   // g
  carbs: number;     // g
  fat: number;       // g
  fiber: number;     // g (RDA strictly capped)
  sugar: number;     // g (WHO <10% kcal guideline, optimal <=25-45g)
  iron: number;      // mg (RDA strictly capped)
  vitaminD: number;  // IU (RDA strictly capped)
  magnesium: number; // mg (RDA strictly capped)
  calcium: number;   // mg (RDA strictly capped)
  rationaleNote: string;
}

export interface ConsumedNutrientTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  iron: number;
  vitaminD: number;
  magnesium: number;
  calcium: number;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Calculates strictly-capped, clinically evidence-based daily nutrient requirements
 * tailored to the client's weight, height, age, biological sex, and daily calorie budget.
 * Ensures displayed targets never exceed clinical needed limits.
 */
export function calculateDailyNutrientTargets(client: ClientProfile): DailyNutrientTargets {
  const weight = Math.max(35, Math.min(200, Number(client.currentWeightKg) || 65));
  const height = Math.max(120, Math.min(220, Number(client.heightCm) || 165));
  const age = Math.max(10, Math.min(100, Number(client.age) || 30));
  const gender = client.gender || 'Other';

  const neededCalories = Math.max(
    1000,
    Math.round(client.neededCalories || client.targetBmr || 1600)
  );

  const isLoss =
    client.goalType === 'loss' ||
    /loss|fat|reduce|slim|lean|cut/i.test(client.goal || '');
  const isGain =
    !isLoss &&
    (client.goalType === 'gain' ||
      /gain|bulk|muscle|increase/i.test(client.goal || ''));

  // Reference ideal/healthy body weight from height so severe excess weight doesn't inflate targets
  const heightM = height / 100;
  const maxHealthyWeightForHeight = 25 * heightM * heightM;
  const effectiveWeight = isLoss
    ? Math.min(weight, Math.max(48, maxHealthyWeightForHeight + 6))
    : weight;

  // Protein: 1.05 - 1.4 g/kg based on goal, strictly capped at clinical ceiling (1.7 g/kg & 35% kcal)
  const proteinPerKg = isLoss ? 1.25 : isGain ? 1.4 : 1.05;
  const sexAdjFactor = gender === 'Female' ? 0.94 : 1.0;
  const computedProtein = Math.round(effectiveWeight * proteinPerKg * sexAdjFactor);
  const rawProtein =
    client.proteinTargetGrams && client.proteinTargetGrams > 0
      ? Math.round(client.proteinTargetGrams)
      : computedProtein;
  const maxProteinCeiling = Math.min(
    Math.round(effectiveWeight * 1.7),
    Math.round((neededCalories * 0.35) / 4)
  );
  const protein = Math.max(46, Math.min(rawProtein, maxProteinCeiling));

  // Fats: 25-28% of daily needed calories, strictly capped at <= 32% of daily calories
  const fatRatio = isLoss ? 0.25 : 0.28;
  const maxFatCeiling = Math.round((neededCalories * 0.32) / 9);
  const fat = Math.max(30, Math.min(Math.round((neededCalories * fatRatio) / 9), maxFatCeiling));

  // Carbohydrates: Remainder strictly inside daily calorie ceiling
  const remainingCarbCalories = Math.max(neededCalories * 0.25, neededCalories - protein * 4 - fat * 9);
  const carbs = Math.max(75, Math.round(remainingCarbCalories / 4));

  // Iron (mg/day) — ICMR / NIH strict RDA by sex & age
  let iron = 12;
  if (gender === 'Female') {
    if (age >= 51) iron = 8;
    else if (age >= 19) iron = 18;
    else if (age >= 14) iron = 15;
    else iron = 8;
  } else if (gender === 'Male') {
    if (age >= 19) iron = 8;
    else if (age >= 14) iron = 11;
    else iron = 8;
  } else {
    iron = age >= 51 ? 8 : 12;
  }

  // Vitamin D (IU/day) — clinical RDA capped at 600 IU (1–70y) or 800 IU (71+y)
  const vitaminD = age >= 71 ? 800 : 600;

  // Magnesium (mg/day) — NIH / ICMR RDA capped strictly by sex, age, and modest weight scaling
  let baseMg = 360;
  let minMg = 310;
  let maxMg = 400;
  if (gender === 'Male') {
    if (age >= 31) {
      baseMg = 420;
      minMg = 390;
      maxMg = 420;
    } else if (age >= 19) {
      baseMg = 400;
      minMg = 380;
      maxMg = 400;
    } else {
      baseMg = 410;
      minMg = 360;
      maxMg = 410;
    }
  } else if (gender === 'Female') {
    if (age >= 31) {
      baseMg = 320;
      minMg = 300;
      maxMg = 320;
    } else if (age >= 19) {
      baseMg = 310;
      minMg = 295;
      maxMg = 310;
    } else {
      baseMg = 360;
      minMg = 320;
      maxMg = 360;
    }
  }
  const mgScale = effectiveWeight < 55 ? 0.96 : 1.0;
  const magnesium = Math.max(minMg, Math.min(maxMg, Math.round(baseMg * mgScale)));

  // Fiber (g/day) — ICMR / IOM 14g per 1,000 kcal rule, strictly capped by sex & age
  const rawCalFiber = Math.round((neededCalories / 1000) * 14);
  let minFiber = 22;
  let maxFiber = 30;
  if (gender === 'Male') {
    if (age >= 51) {
      minFiber = 22;
      maxFiber = 30;
    } else if (age >= 19) {
      minFiber = 24;
      maxFiber = 38;
    } else {
      minFiber = 22;
      maxFiber = 31;
    }
  } else if (gender === 'Female') {
    if (age >= 51) {
      minFiber = 18;
      maxFiber = 21;
    } else if (age >= 19) {
      minFiber = 20;
      maxFiber = 25;
    } else {
      minFiber = 19;
      maxFiber = 26;
    }
  }
  const fiber = Math.max(minFiber, Math.min(maxFiber, rawCalFiber));

  // Calcium (mg/day) — strictly capped by age & sex
  let calcium = 1000;
  if (age >= 71 || (gender === 'Female' && age >= 51)) {
    calcium = 1200;
  } else if (age >= 9 && age <= 18) {
    calcium = 1300;
  }

  // Sugar daily ceiling (WHO < 10% total calories from free/added sugars; 25-45g max)
  const sugar = Math.max(22, Math.min(48, Math.round((neededCalories * 0.08) / 4)));

  return {
    calories: neededCalories,
    protein,
    carbs,
    fat,
    fiber,
    sugar,
    iron,
    vitaminD,
    magnesium,
    calcium,
    rationaleNote: `${gender}, ${age}y, ${weight} kg, ${height} cm · ${neededCalories} kcal`,
  };
}

/**
 * Estimates Iron (mg), Vitamin D (IU), Magnesium (mg), and Calcium (mg) per serving
 * for any food in the 841+ library, custom food, or AI-detected meal item.
 */
export function estimateFoodMicronutrients(input: {
  name: string;
  category?: FoodCategory | string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  servingGrams?: number;
  description?: string;
}): MicronutrientValues {
  const name = (input.name || '').toLowerCase();
  const desc = (input.description || '').toLowerCase();
  const combined = `${name} ${desc}`;
  const cat = input.category || 'Beverages & Snacks';
  const cal = Math.max(0, Number(input.calories) || 0);
  const prot = Math.max(0, Number(input.protein) || 0);
  const carbs = Math.max(0, Number(input.carbs) || 0);
  const fiber = Math.max(0, Number(input.fiber) || 0);

  // Near-zero calorie drinks/water
  if (
    cal <= 5 &&
    (name.includes('water') ||
      name.includes('vellam') ||
      name.includes('jeeraka') ||
      name.includes('pathimugam'))
  ) {
    return { calcium: 2, iron: 0, magnesium: 1, vitaminD: 0 };
  }

  // Parse explicit Calcium value if documented in library description (e.g. "Calcium: 120 mg")
  let parsedCalcium: number | null = null;
  const calMatch = desc.match(/calcium:\s*(\d+(?:\.\d+)?)\s*mg/i);
  if (calMatch) {
    parsedCalcium = Number(calMatch[1]);
  }
  let parsedIron: number | null = null;
  const ironMatch = desc.match(/iron:\s*(\d+(?:\.\d+)?)\s*mg/i);
  if (ironMatch) {
    parsedIron = Number(ironMatch[1]);
  }
  let parsedMg: number | null = null;
  const mgMatch = desc.match(/magnesium:\s*(\d+(?:\.\d+)?)\s*mg/i);
  if (mgMatch) {
    parsedMg = Number(mgMatch[1]);
  }
  let parsedVitD: number | null = null;
  const vitDMatch = desc.match(/vitamin\s*d:\s*(\d+(?:\.\d+)?)\s*iu/i);
  if (vitDMatch) {
    parsedVitD = Number(vitDMatch[1]);
  }

  // Portion factor relative to a standard ~150 kcal serving
  const scale = Math.max(0.35, Math.min(2.8, cal > 0 ? cal / 150 : 1));

  // Defaults by broad food category
  let calcium = 18 * scale;
  let iron = 0.8 * scale;
  let magnesium = 18 * scale;
  let vitaminD = 2;

  if (cat === 'Dairy & Alternatives') {
    calcium = 165 * Math.min(2.0, scale);
    iron = 0.25 * scale;
    magnesium = 22 * scale;
    vitaminD = combined.includes('butter') || combined.includes('ghee') ? 18 : 38;
  } else if (cat === 'Proteins') {
    calcium = 28 * scale;
    iron = 1.6 * scale;
    magnesium = 28 * scale;
    vitaminD = 16;
  } else if (cat === 'Vegetables') {
    calcium = 58 * Math.min(2.2, scale);
    iron = 1.6 * scale;
    magnesium = 34 * scale;
    vitaminD = 0;
  } else if (cat === 'Grains & Breads') {
    calcium = 22 * scale;
    iron = 1.2 * scale;
    magnesium = 28 * scale;
    vitaminD = 0;
  } else if (cat === 'Fruits') {
    calcium = 20 * scale;
    iron = 0.45 * scale;
    magnesium = 22 * scale;
    vitaminD = 0;
  } else if (cat === 'Nuts & Healthy Fats') {
    calcium = 38 * Math.min(2.0, scale);
    iron = 1.2 * scale;
    magnesium = 48 * Math.min(2.2, scale);
    vitaminD = 0;
  }

  // Specific nutrient-dense food keyword calibrations
  if (
    /mathi|sardine|ayala|mackerel|salmon|tuna|pomfret|seer|neymeen|fish|meen|karimeen|prawn|chemmeen|crab|shrimp|oyster|mussel/i.test(
      combined
    )
  ) {
    const isFattyFish = /mathi|sardine|ayala|mackerel|salmon|tuna/i.test(combined);
    vitaminD = isFattyFish ? Math.round(180 * Math.min(1.8, scale)) : Math.round(65 * Math.min(1.6, scale));
    calcium = /mathi|sardine/i.test(combined) ? 140 : 48;
    iron = Math.max(iron, 1.5);
    magnesium = Math.max(magnesium, 38);
  }

  if (/\begg\b|mutta|omelet|omelette|scrambled|poached|boiled egg/i.test(combined)) {
    const eggCountApprox = Math.max(1, Math.round(prot / 6) || 1);
    const isWhiteOnly = /egg white|white only/i.test(combined);
    vitaminD = isWhiteOnly ? 0 : Math.min(160, eggCountApprox * 44);
    iron = isWhiteOnly ? 0.1 : r1(eggCountApprox * 0.9);
    calcium = isWhiteOnly ? 4 : Math.round(eggCountApprox * 28);
    magnesium = Math.round(eggCountApprox * 6);
  }

  if (/mushroom|koon/i.test(combined)) {
    vitaminD = Math.max(vitaminD, 85);
    magnesium = Math.max(magnesium, 18);
  }

  if (/liver|beef|mutton|pork|goat|red meat|irachi/i.test(combined)) {
    iron = Math.max(iron, /liver/i.test(combined) ? 6.2 : 3.2 * Math.min(1.8, scale));
    magnesium = Math.max(magnesium, 28);
    vitaminD = Math.max(vitaminD, 14);
  }

  if (/spinach|cheera|moringa|muringa|drumstick leaf|greens|palak|kale|broccoli|cabbage|thoran/i.test(combined)) {
    iron = Math.max(iron, /moringa|muringa|cheera|spinach|palak/i.test(combined) ? 3.2 : 1.8);
    calcium = Math.max(calcium, /moringa|muringa|cheera|spinach/i.test(combined) ? 135 : 68);
    magnesium = Math.max(magnesium, 48);
  }

  if (/ragi|finger millet|kozhikodan|sesame|ellu|til/i.test(combined)) {
    calcium = Math.max(calcium, /sesame|ellu/i.test(combined) ? 180 : 145);
    iron = Math.max(iron, 2.4);
    magnesium = Math.max(magnesium, 55);
  }

  if (/kadala|chickpea|chana|lentil|dal|parippu|rajma|beans|moong|cherupayar|vanpayar|cowpea|soy|tofu/i.test(combined)) {
    iron = Math.max(iron, 2.5);
    magnesium = Math.max(magnesium, 52);
    calcium = Math.max(calcium, /tofu|soy/i.test(combined) ? 120 : 42);
  }

  if (/paneer|milk|curd|yogurt|dahi|lassi|buttermilk|sambharam|cheese|whey|payasam/i.test(combined)) {
    calcium = Math.max(calcium, /whey|milk|paneer|yogurt|curd/i.test(combined) ? 175 : 95);
    vitaminD = Math.max(vitaminD, /milk|whey|yogurt/i.test(combined) ? 42 : 18);
    magnesium = Math.max(magnesium, 24);
  }

  if (/almond|badam|cashew|walnut|pistachio|peanut|flax|chia|pumpkin seed|sunflower/i.test(combined)) {
    magnesium = Math.max(magnesium, 54);
    calcium = Math.max(calcium, 44);
    iron = Math.max(iron, 1.3);
  }

  if (/matta|red rice|oats|oatmeal|brown rice|wheat|roti|chapati|ragi/i.test(combined)) {
    magnesium = Math.max(magnesium, 36);
    iron = Math.max(iron, 1.3);
  }

  if (/banana|pazham|nendran|karikku|tender coconut|avocado|dates|fig/i.test(combined)) {
    magnesium = Math.max(magnesium, 29);
    iron = Math.max(iron, /dates|fig/i.test(combined) ? 1.4 : 0.5);
  }

  if (/jaggery|sharkara|aval|beaten rice/i.test(combined)) {
    iron = Math.max(iron, 2.1);
    magnesium = Math.max(magnesium, 32);
  }

  // Fiber boost gently correlates with plant mineral density
  if (fiber >= 4) {
    magnesium = Math.max(magnesium, 38);
    iron = Math.max(iron, 1.4);
  }
  if (carbs > 25 && prot < 3 && cat === 'Beverages & Snacks' && /cake|halwa|sugar|candy|soda/i.test(combined)) {
    calcium = Math.min(calcium, 16);
    iron = Math.min(iron, 0.5);
    magnesium = Math.min(magnesium, 12);
    vitaminD = 0;
  }

  return {
    calcium: Math.round(parsedCalcium !== null ? parsedCalcium : calcium),
    iron: r1(parsedIron !== null ? parsedIron : iron),
    magnesium: Math.round(parsedMg !== null ? parsedMg : magnesium),
    vitaminD: Math.round(parsedVitD !== null ? parsedVitD : vitaminD),
  };
}

/**
 * Estimates dietary fiber (g) per serving when explicit fiber is not specified.
 */
export function estimateFoodFiber(input: {
  name: string;
  category?: FoodCategory | string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fiber?: number;
  description?: string;
}): number {
  if (input.fiber !== undefined && input.fiber !== null && !Number.isNaN(Number(input.fiber))) {
    return r1(Math.max(0, Number(input.fiber)));
  }

  const name = (input.name || '').toLowerCase();
  const desc = (input.description || '').toLowerCase();
  const combined = `${name} ${desc}`;
  const cat = input.category || 'Beverages & Snacks';
  const cal = Math.max(0, Number(input.calories) || 0);
  const carbs = Math.max(0, Number(input.carbs) || 0);

  if (cal <= 10 || /water|vellam|black tea|black coffee|kattan|ghee|oil|butter\b/.test(name)) {
    return 0;
  }

  // Zero/low-carb animal foods unless prepared in a vegetable curry
  if (
    carbs <= 2 &&
    /\begg\b|mutta|chicken|beef|mutton|fish|meen|prawn|paneer|milk|curd|yogurt|whey|cheese/i.test(name) &&
    !/curry|masala|roast|stew|thoran/i.test(name)
  ) {
    return 0;
  }

  if (/chia|flax|psyllium|isabgol/i.test(combined)) return 7.5;
  if (/kadala|chickpea|chana|rajma|moong|cherupayar|vanpayar|cowpea|lentil|dal|parippu|sambar|avial|koottu/i.test(combined)) {
    return r1(Math.max(2.5, carbs * 0.22));
  }
  if (/oats|oatmeal|ragi|moringa|muringa|cheera|spinach|palak|thoran|broccoli|beans|salad|greens|cabbage|carrot/i.test(combined)) {
    return r1(Math.max(2.4, carbs * 0.2));
  }
  if (/almond|badam|walnut|pistachio|peanut|cashew|dates|fig|guava|pera|apple|papaya|orange|pear|berries/i.test(combined)) {
    return r1(Math.max(1.8, Math.min(6, carbs * 0.16)));
  }
  if (/matta|red rice|brown rice|whole wheat|chapati|roti|puttu|ragi|banana|pazham|nendran/i.test(combined)) {
    return r1(Math.max(1.6, Math.min(5.5, carbs * 0.11)));
  }
  if (cat === 'Vegetables') return r1(Math.max(2.0, carbs * 0.25));
  if (cat === 'Fruits') return r1(Math.max(1.5, carbs * 0.14));
  if (cat === 'Grains & Breads') return r1(Math.max(1.0, carbs * 0.08));
  if (cat === 'Nuts & Healthy Fats') return r1(Math.max(1.2, carbs * 0.2));

  if (carbs <= 1) return 0;
  return r1(Math.min(4.5, carbs * 0.07));
}

/**
 * Estimates sugar (g) per serving when explicit sugar is not stored on the food record.
 */
export function estimateFoodSugar(input: {
  name: string;
  category?: FoodCategory | string;
  calories?: number;
  carbs?: number;
  sugar?: number;
  description?: string;
}): number {
  if (input.sugar !== undefined && input.sugar !== null && !Number.isNaN(Number(input.sugar))) {
    return r1(Math.max(0, Number(input.sugar)));
  }

  const name = (input.name || '').toLowerCase();
  const desc = (input.description || '').toLowerCase();
  const combined = `${name} ${desc}`;
  const cat = input.category || 'Beverages & Snacks';
  const cal = Math.max(0, Number(input.calories) || 0);
  const carbs = Math.max(0, Number(input.carbs) || 0);

  if (cal <= 5 || /no sugar|unsweetened|black tea|black coffee|sulaimani|jeeraka|pathimugam|water|sambharam/i.test(combined)) {
    return /sulaimani/i.test(combined) ? 2.5 : 0;
  }

  if (carbs <= 1.5) return 0;

  if (/halwa|payasam|cake|ice cream|shake|sharjah|sarbath|jaggery|sharkara|unniyappam|neyyappam|jam|soda|cola|sweet|chocolate|laddu|gulab|barfi|donut|pastry|juice/i.test(combined)) {
    return r1(Math.min(carbs, Math.max(5, carbs * 0.62)));
  }

  if (/milk|curd|yogurt|lassi|chaya|tea|coffee/i.test(combined)) {
    return /chaya|tea|coffee/i.test(combined) ? r1(Math.min(carbs, 7.5)) : r1(Math.min(carbs, carbs * 0.72));
  }

  if (cat === 'Fruits' || /banana|pazham|mango|apple|orange|papaya|grapes|dates|fig|berry/i.test(combined)) {
    return r1(Math.min(carbs, Math.max(2, carbs * 0.56)));
  }

  if (/bread|bun|cake|biscuit|pazham pori|ethakka|sukhiyan/i.test(combined)) {
    return r1(Math.min(carbs, Math.max(2, carbs * 0.28)));
  }

  if (cat === 'Vegetables') return r1(Math.min(carbs, carbs * 0.25));
  if (cat === 'Grains & Breads') return r1(Math.min(4, carbs * 0.04));

  return r1(Math.min(carbs * 0.12, 8));
}

/**
 * Ensures any FoodItem carries complete fiber, sugar, calcium, magnesium, vitaminD, and iron fields.
 */
export function enrichFoodWithMicronutrients(food: FoodItem): FoodItem {
  const est = estimateFoodMicronutrients(food);
  return {
    ...food,
    fiber: food.fiber !== undefined ? food.fiber : estimateFoodFiber(food),
    sugar: food.sugar !== undefined ? food.sugar : estimateFoodSugar(food),
    calcium: food.calcium !== undefined ? food.calcium : est.calcium,
    iron: food.iron !== undefined ? food.iron : est.iron,
    magnesium: food.magnesium !== undefined ? food.magnesium : est.magnesium,
    vitaminD: food.vitaminD !== undefined ? food.vitaminD : est.vitaminD,
  };
}

export type NutrientKey =
  | 'protein'
  | 'carbs'
  | 'fat'
  | 'fiber'
  | 'sugar'
  | 'iron'
  | 'vitaminD'
  | 'magnesium'
  | 'calcium';

export interface ResolvedLogNutrients extends ConsumedNutrientTotals {}

export interface FoodNutrientSourceItem {
  logId: string;
  foodId: string;
  foodName: string;
  mealType: MealLogItem['mealType'];
  quantity: number;
  servingUnit: string;
  calories: number;
  amount: number;
  sharePct: number;
}

/**
 * Resolves exact macro + micro nutrient totals for a single MealLogItem,
 * matching aggregateConsumedNutrients 1:1.
 */
export function resolveMealLogNutrients(
  log: MealLogItem,
  foodsLibrary: FoodItem[]
): ResolvedLogNutrients {
  const byId = new Map<string, FoodItem>();
  const byName = new Map<string, FoodItem>();
  for (const f of foodsLibrary) {
    if (f.id) byId.set(f.id, f);
    if (f.name) byName.set(f.name.toLowerCase().trim(), f);
  }

  return resolveLogWithMaps(log, byId, byName);
}

function resolveLogWithMaps(
  log: MealLogItem,
  byId: Map<string, FoodItem>,
  byName: Map<string, FoodItem>
): ResolvedLogNutrients {
  const matchedFood =
    byId.get(log.foodId) || byName.get((log.foodName || '').toLowerCase().trim());
  const qty = Math.max(0.1, Number(log.quantity) || 1);

  let fiber = 0;
  if (log.fiber !== undefined) {
    fiber = Number(log.fiber) || 0;
  } else if (matchedFood) {
    fiber = estimateFoodFiber(matchedFood) * qty;
  } else {
    fiber = estimateFoodFiber({
      name: log.foodName,
      calories: log.calories,
      protein: log.protein,
      carbs: log.carbs,
    });
  }

  let sugar = 0;
  if (log.sugar !== undefined) {
    sugar = Number(log.sugar) || 0;
  } else if (matchedFood) {
    sugar = estimateFoodSugar(matchedFood) * qty;
  } else {
    sugar = estimateFoodSugar({
      name: log.foodName,
      calories: log.calories,
      carbs: log.carbs,
    });
  }

  let iron = 0;
  let vitaminD = 0;
  let magnesium = 0;
  let calcium = 0;

  if (
    log.iron !== undefined ||
    log.vitaminD !== undefined ||
    log.magnesium !== undefined ||
    log.calcium !== undefined
  ) {
    const est = matchedFood
      ? estimateFoodMicronutrients(matchedFood)
      : estimateFoodMicronutrients({
          name: log.foodName,
          calories: log.calories / qty,
          protein: log.protein / qty,
          carbs: log.carbs / qty,
          fat: log.fat / qty,
        });
    iron = log.iron !== undefined ? Number(log.iron) || 0 : est.iron * qty;
    vitaminD = log.vitaminD !== undefined ? Number(log.vitaminD) || 0 : est.vitaminD * qty;
    magnesium = log.magnesium !== undefined ? Number(log.magnesium) || 0 : est.magnesium * qty;
    calcium = log.calcium !== undefined ? Number(log.calcium) || 0 : est.calcium * qty;
  } else if (matchedFood) {
    const enriched = enrichFoodWithMicronutrients(matchedFood);
    iron = (enriched.iron || 0) * qty;
    vitaminD = (enriched.vitaminD || 0) * qty;
    magnesium = (enriched.magnesium || 0) * qty;
    calcium = (enriched.calcium || 0) * qty;
  } else {
    const est = estimateFoodMicronutrients({
      name: log.foodName,
      calories: log.calories,
      protein: log.protein,
      carbs: log.carbs,
      fat: log.fat,
    });
    iron = est.iron;
    vitaminD = est.vitaminD;
    magnesium = est.magnesium;
    calcium = est.calcium;
  }

  return {
    calories: Number(log.calories) || 0,
    protein: Number(log.protein) || 0,
    carbs: Number(log.carbs) || 0,
    fat: Number(log.fat) || 0,
    fiber,
    sugar,
    iron,
    vitaminD,
    magnesium,
    calcium,
  };
}

/**
 * Aggregates all daily macronutrients & micronutrients from today's logged meals.
 * Automatically resolves missing micronutrients from the food library or estimator
 * so previously logged meals also show complete mineral & vitamin bars.
 */
export function aggregateConsumedNutrients(
  logs: MealLogItem[],
  foodsLibrary: FoodItem[]
): ConsumedNutrientTotals {
  const byId = new Map<string, FoodItem>();
  const byName = new Map<string, FoodItem>();
  for (const f of foodsLibrary) {
    if (f.id) byId.set(f.id, f);
    if (f.name) byName.set(f.name.toLowerCase().trim(), f);
  }

  const totals: ConsumedNutrientTotals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    iron: 0,
    vitaminD: 0,
    magnesium: 0,
    calcium: 0,
  };

  for (const log of logs) {
    const res = resolveLogWithMaps(log, byId, byName);
    totals.calories += res.calories;
    totals.protein += res.protein;
    totals.carbs += res.carbs;
    totals.fat += res.fat;
    totals.fiber += res.fiber;
    totals.sugar += res.sugar;
    totals.iron += res.iron;
    totals.vitaminD += res.vitaminD;
    totals.magnesium += res.magnesium;
    totals.calcium += res.calcium;
  }

  return {
    calories: Math.round(totals.calories),
    protein: r1(totals.protein),
    carbs: r1(totals.carbs),
    fat: r1(totals.fat),
    fiber: r1(totals.fiber),
    sugar: r1(totals.sugar),
    iron: r1(totals.iron),
    vitaminD: Math.round(totals.vitaminD),
    magnesium: Math.round(totals.magnesium),
    calcium: Math.round(totals.calcium),
  };
}

/**
 * Returns every logged food item on that day that contributed a positive amount of the
 * requested nutrient, sorted from highest contributor to lowest with exact % shares.
 */
export function getFoodNutrientBreakdownForDay(
  logs: MealLogItem[],
  foodsLibrary: FoodItem[],
  nutrientKey: NutrientKey
): {
  sources: FoodNutrientSourceItem[];
  totalFromFoods: number;
  zeroCount: number;
} {
  const byId = new Map<string, FoodItem>();
  const byName = new Map<string, FoodItem>();
  for (const f of foodsLibrary) {
    if (f.id) byId.set(f.id, f);
    if (f.name) byName.set(f.name.toLowerCase().trim(), f);
  }

  const isInt = nutrientKey === 'vitaminD' || nutrientKey === 'magnesium' || nutrientKey === 'calcium';
  const roundVal = (v: number) => (isInt ? Math.round(v) : r1(v));

  let rawTotal = 0;
  let zeroCount = 0;
  const rawSources: Omit<FoodNutrientSourceItem, 'sharePct'>[] = [];

  for (const log of logs) {
    const res = resolveLogWithMaps(log, byId, byName);
    const rawAmt = Number(res[nutrientKey]) || 0;
    const displayAmt = roundVal(rawAmt);
    if (displayAmt <= 0) {
      zeroCount += 1;
      continue;
    }
    rawTotal += rawAmt;
    rawSources.push({
      logId: log.id,
      foodId: log.foodId,
      foodName: log.foodName,
      mealType: log.mealType,
      quantity: log.quantity,
      servingUnit: log.servingUnit,
      calories: Math.round(Number(log.calories) || 0),
      amount: displayAmt,
    });
  }

  rawSources.sort((a, b) => b.amount - a.amount);

  const sources: FoodNutrientSourceItem[] = rawSources.map((s) => ({
    ...s,
    sharePct: rawTotal > 0 ? Math.max(1, Math.round((s.amount / rawTotal) * 100)) : 0,
  }));

  return {
    sources,
    totalFromFoods: roundVal(rawTotal),
    zeroCount,
  };
}
