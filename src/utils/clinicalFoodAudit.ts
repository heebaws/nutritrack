import { MealLogItem, ClientProfile } from '../types';

export type FoodFrequencyTier = 
  | 'strict_avoid'          // Avoid or strictly limit
  | 'once_twice_month'      // Once or twice a month (occasional treats)
  | 'once_twice_week'       // Once or twice a week
  | 'daily_portion_control' // Small amount daily (portion control)
  | 'daily_superfood';      // Eat daily and more freely

export interface FoodClassificationResult {
  tier: FoodFrequencyTier;
  tierLabel: string;
  isProblemFood: boolean;
  isSuperFood: boolean;
  riskSeverity: 'critical' | 'warning' | 'caution' | 'none';
  riskTitle: string;
  coachWarning: string;
  clinicalReason: string;
  frequencyGuideline: string;
  recommendedSwap: {
    name: string;
    description: string;
    caloriesSaved?: string;
  };
  healthBenefits?: string;
  medicalConditionsWarning?: string[];
}

export interface DailyFoodAuditSummary {
  date: string;
  totalLogs: number;
  problemFoods: Array<{
    logId: string;
    foodName: string;
    mealType: string;
    calories: number;
    audit: FoodClassificationResult;
  }>;
  healthyFoods: Array<{
    logId: string;
    foodName: string;
    mealType: string;
    calories: number;
    audit: FoodClassificationResult;
  }>;
  hasProblemFoods: boolean;
  hasHealthyFoods: boolean;
  dailyCoachVerdict: {
    status: 'alert' | 'balanced' | 'excellent' | 'empty';
    title: string;
    message: string;
    urgentNotice?: string;
  };
  plateDistribution: {
    veggiesAndFruitsPercent: number; // Target: 50%
    leanProteinPercent: number;       // Target: 25%
    wholeGrainsPercent: number;       // Target: 25%
    otherPercent: number;
  };
  arrangedGoodOptions: Array<{
    mealSlot: string;
    title: string;
    recommendedFoods: string[];
    benefit: string;
    prepTip: string;
  }>;
}

// ============================================================================
// CLINICAL KEYWORDS & RULES DIRECT FROM COACH SALEEM'S GUIDELINES
// ============================================================================

const STRICT_AVOID_RULES = [
  {
    keywords: ['soda', 'coke', 'pepsi', 'fizz', 'soft drink', 'energy drink', 'red bull', 'sting', 'mountain dew', 'fanta', 'mirinda', 'sprite', 'cold drink'],
    title: 'Sugary & Carbonated Energy Drinks',
    reason: 'Ultra-high liquid fructose and refined sugar causing severe insulin spikes, fatty liver, and rapid visceral belly fat accumulation. Zero dietary fiber.',
    guideline: 'Strictly limit or avoid (best kept rare)',
    swap: { name: 'Spiced Sambaram / Fresh Lime Water', description: 'Chilled buttermilk with crushed ginger & curry leaves or unsweetened lime water.', caloriesSaved: 'Saves ~140-200 kcal' }
  },
  {
    keywords: ['alcohol', 'beer', 'whiskey', 'vodka', 'rum', 'wine', 'toddy', 'tobacco', 'cigarette'],
    title: 'Alcohol & Toxic Substances',
    reason: 'No safe level for health. Metabolized directly by the liver, pausing fat breakdown and promoting organ inflammation.',
    guideline: 'Strictly limit or avoid (no safe level)',
    swap: { name: 'Infused Jeera Water or Pathimukham', description: 'Traditional Kerala pink herbal water with high antioxidants.', caloriesSaved: 'Zero toxic burden' }
  },
  {
    keywords: ['vanaspati', 'dalda', 'margarine', 'partially hydrogenated', 'trans fat', 'shortening'],
    title: 'Industrial Trans Fats (Vanaspati / Dalda)',
    reason: 'Severely increases LDL (bad) cholesterol, decreases HDL (good) cholesterol, triggers arterial stiffness, and inflames blood vessels.',
    guideline: 'Avoid as much as possible',
    swap: { name: 'Cold-Pressed Coconut Oil (in strict small moderation: 1 tsp)', description: 'Unrefined traditional cold-pressed oil measured with a teaspoon.', caloriesSaved: 'Protects arterial health' }
  },
  {
    keywords: ['charred', 'burnt', 'overcooked grill', 'burnt bbq'],
    title: 'Burnt or Charred Food',
    reason: 'Charring forms heterocyclic amines (HCAs) and polycyclic aromatic hydrocarbons (PAHs) which are toxic and carcinogenic compounds.',
    guideline: 'Do not eat regularly',
    swap: { name: 'Steamed, Clay-Pot or Stewed Preparation', description: 'Evenly cooked foods preserving nutrient bio-availability.', caloriesSaved: 'Eliminates mutagenic compounds' }
  },
  {
    keywords: ['reused oil', 're-fried', 'stale oil', 'black oil fry'],
    title: 'Reused-Oil Fried Food',
    reason: 'Oil heated again and again breaks down into polar compounds, lipid peroxides, and carcinogenic free radicals. Severely damages liver and cellular health.',
    guideline: 'Avoid it as much as you can',
    swap: { name: 'Freshly Air-Fried or Home Sautéed', description: 'Single-use minimal healthy oil preparation.', caloriesSaved: 'Avoids oxidized toxic lipids' }
  }
];

const ONCE_TWICE_MONTH_RULES = [
  {
    keywords: ['burger', 'fried chicken', 'samosa', 'pakora', 'french fries', 'fries', 'puff', 'puffs', 'shawarma', 'mayo shawarma', 'deep fried', 'pazham pori (deep fried)', 'ulli vada', 'bhatura'],
    title: 'Deep-Fried Street Food & Fast Food',
    reason: 'Extremely high in trans fats, saturated fats, and excess sodium. Directly linked to heart disease, non-alcoholic fatty liver, and stubborn abdominal visceral fat.',
    guideline: 'Limit to once or twice a month (occasional treats)',
    swap: { name: 'Steamed Ela Ada / Kozhukatta / Roasted Makhana', description: 'Nutritious steamed rice parcels with grated coconut & jaggery or crunchy roasted makhana.', caloriesSaved: 'Saves 120–180 kcal & 14g oil' }
  },
  {
    keywords: ['jalebi', 'gulab jamun', 'laddu', 'halwa', 'cake', 'ice cream', 'pastry', 'chattipathiri', 'sweet', 'mutta mala', 'pastries', 'doughnut', 'donut'],
    title: 'Heavy Sweets & Commercial Desserts',
    reason: 'Predominantly refined table sugar and saturated fats with zero dietary fiber, leading to swift blood sugar spikes followed by severe energy crashes.',
    guideline: 'Limit to once or twice a month (occasional treats)',
    swap: { name: 'Fresh Whole Papaya / Guava / Pomegranate', description: 'Naturally sweet fresh fruits offering live enzymes, pectin fiber, and vitamins.', caloriesSaved: 'Saves 250+ kcal of refined sugar' }
  },
  {
    keywords: ['cream biscuit', 'biscuit', 'chips', 'potato chips', 'instant noodles', 'maggi', 'kurkure', 'lays', 'oreo'],
    title: 'Packaged Cream Biscuits, Chips & Instant Noodles',
    reason: 'Ultra-processed food loaded with excess sodium, refined maida flour, and unhealthy industrial palm oils with negligible micronutrients.',
    guideline: 'Limit to once or twice a month (occasional treats)',
    swap: { name: 'Roasted Cherupayar / Boiled Sweet Corn / Makhana', description: 'Crunchy whole-grain and pulse snacks seasoned with pinch of rock salt and pepper.', caloriesSaved: 'Eliminates ultra-processed palm oil' }
  }
];

const ONCE_TWICE_WEEK_RULES = [
  {
    keywords: ['beef', 'mutton', 'pork', 'lamb', 'red meat', 'beef fry', 'beef ularthiyathu', 'mutton stew', 'pork vindaloo'],
    title: 'Red Meat (Beef, Mutton, Pork)',
    reason: 'Excess intake raises risks of colorectal cancer, cardiovascular disease, and elevated uric acid. Medical recommendation is max 350-500g cooked weight per week.',
    guideline: 'Limit to once or twice a week (max 350–500g cooked/week)',
    swap: { name: 'Skinless Chicken Breast or Fresh Sardine/Mackerel', description: 'Lean poultry or omega-3 rich small fish cooked in light kudampuli gravy.', caloriesSaved: 'Reduces saturated fats by 65%' }
  },
  {
    keywords: ['sausage', 'salami', 'nuggets', 'bacon', 'hot dog', 'processed meat', 'corned beef'],
    title: 'Processed Meats',
    reason: 'The WHO classifies processed meats as a Group 1 carcinogen. High in curing nitrates, sodium, and trans fats.',
    guideline: 'Keep it very rare (max once a week, ideally avoid)',
    swap: { name: 'Fresh Boiled Eggs or Grilled Paneer/Chicken', description: 'Unprocessed natural whole protein sources.', caloriesSaved: 'Free from synthetic curing nitrites' }
  },
  {
    keywords: ['biryani', 'thalassery biriyani', 'malabar biriyani', 'mutton biriyani', 'dum biriyani', 'ghee rice with beef', 'heavy curry', 'butter chicken'],
    title: 'Biryani & Heavy Oily Curries',
    reason: 'Extremely calorie dense (often 750–1100 kcal per serving) due to generous ghee, fried onions, and marinated meats.',
    guideline: 'Limit to once or twice a week',
    swap: { name: 'Steamed Matta Rice with Fish Curry & Veg Thoran', description: 'A balanced Kerala thali with fiber and clean omega-3 fats.', caloriesSaved: 'Saves 350–500 kcal' }
  },
  {
    keywords: ['fried fish', 'fish fry', 'ayala fry', 'mathi fry (deep)', 'karimeen fry', 'chemmeen fry (deep)'],
    title: 'Deep Fried Fish & Oily Seafood',
    reason: 'Deep frying destroys delicate Omega-3 fatty acids and absorbs up to 15g of oxidised frying oil per fillet.',
    guideline: 'Limit to once or twice a week (Baking, steaming or shallow cooking is far superior)',
    swap: { name: 'Kudampuli Meen Curry or Meen Moilee (Light)', description: 'Traditional clay-pot fish curry with garcinia cambogia (kudampuli).', caloriesSaved: 'Preserves Omega-3, saves 110 kcal' }
  },
  {
    keywords: ['swordfish', 'king mackerel', 'ayakoora (large)', 'shark', 'neymeen (large)'],
    title: 'Large Predatory Fish (Mercury Risk)',
    reason: 'Bioaccumulation of heavy methylmercury poses neurological risks, particularly for women planning pregnancy, nursing mothers, and children.',
    guideline: 'Limit to occasionally (once a week or less)',
    swap: { name: 'Small Pelagic Fish (Mathi / Sardines, Netholi / Anchovies)', description: 'High in EPA/DHA Omega-3, calcium with bones, and extremely low mercury.', caloriesSaved: 'Maximum cardiovascular protection' }
  }
];

const DAILY_PORTION_RULES = [
  {
    keywords: ['white sugar', 'added sugar', 'cane sugar', 'jaggery in excess', 'syrup'],
    title: 'Added Sugar',
    reason: 'Adult safe limit is up to 6 teaspoons (25g) of added sugar daily, ideally less. Excessive intake accelerates non-alcoholic fatty liver and insulin resistance.',
    guideline: 'Keep under 6 tsp (25g) added sugar daily',
    swap: { name: 'Cinnamon or Cardamom Spiced Tea', description: 'Natural fragrant spices to sweeten palate without insulin spikes.', caloriesSaved: 'Saves 80–120 kcal' }
  },
  {
    keywords: ['pickle', 'naranga achar', 'mango pickle', 'papad', 'pappadam', 'soya sauce', 'salted chips'],
    title: 'Excess Salt & Pickles / Papad',
    reason: 'Recommended daily salt is strictly under 5g (1 level teaspoon) across all meals. High sodium triggers hypertension and fluid retention.',
    guideline: 'Keep total salt under 5g (1 teaspoon) a day',
    swap: { name: 'Spiced Pachadi or Fresh Mint/Coriander Chutney', description: 'Fresh yogurt and herb dips seasoned with lemon and curry leaves.', caloriesSaved: 'Cuts sodium by 70%' }
  },
  {
    keywords: ['cooking oil', 'deep oil', 'ghee in excess', 'oil (fried)'],
    title: 'Cooking Oil Portions',
    reason: 'Target is 3-4 teaspoons (15-20 ml) per person per day. 1 tablespoon of oil contains 120 calories!',
    guideline: 'Limit to 3–4 teaspoons (15–20 ml) per person daily',
    swap: { name: 'Steamed or Tawa-Roasted Preparations', description: 'Use measuring spoons instead of pouring directly from bottle.', caloriesSaved: 'Saves 120–240 kcal daily' }
  },
  {
    keywords: ['fruit juice', 'orange juice', 'apple juice', 'mango shake', 'grape juice'],
    title: 'Commercial or Strained Fruit Juice',
    reason: 'Fruit juice delivers concentrated fructose sugars without the beneficial dietary fiber of whole fruits, causing rapid glucose elevation.',
    guideline: 'Prefer whole fruit; keep juice strictly limited',
    swap: { name: 'Whole Fresh Fruit with Pulp & Skin', description: 'Whole orange, apple, or guava with intact fiber slows gastric emptying.', caloriesSaved: 'Adds 4g fiber, blunts glucose' }
  },
  {
    keywords: ['parotta', 'porotta', 'kerala parotta', 'maida', 'white bread', 'naan', 'white rice in excess'],
    title: 'Refined White Flour (Maida) & Excess White Rice',
    reason: 'Stripped of germ and bran fiber. Causes high glycemic spikes and quick return of hunger.',
    guideline: 'Eat in moderate portions, mixed with whole grains & vegetables',
    swap: { name: 'Kerala Matta Rice / Whole Wheat Chapati / Appam', description: 'Complex carbohydrates rich in magnesium and slow-digesting starches.', caloriesSaved: 'Lowers Glycemic Index' }
  }
];

const DAILY_SUPERFOOD_RULES = [
  {
    keywords: ['cheera', 'spinach', 'cabbage', 'beans', 'thoran', 'salad', 'cucumber', 'vegetable', 'avial', 'olen', 'kovakka', 'ash gourd', 'moringa', 'murungayila', 'broccoli'],
    title: 'Vegetables & Leafy Greens',
    benefits: 'High dietary fiber, prebiotic gut food, rich in folate, potassium, and magnesium. Helps reduce visceral fat rating.',
    guideline: 'Eat daily and freely (fill 50% of your plate)'
  },
  {
    keywords: ['apple', 'guava', 'papaya', 'pomegranate', 'orange', 'berries', 'watermelon', 'muskmelon', 'fruit'],
    title: 'Whole Fresh Fruits',
    benefits: 'Living antioxidants, vitamin C, water content, and soluble pectin fiber to regulate cholesterol and bowel motility.',
    guideline: '1–2 whole fruits daily (eat whole with fiber, not juiced)'
  },
  {
    keywords: ['cherupayar', 'kadala', 'chana', 'dal', 'parippu', 'rajma', 'lentil', 'sprouts', 'moong', 'edamame', 'beans curry'],
    title: 'Pulses, Lentils & Beans',
    benefits: 'Plant-based clean protein, resistant starch, low glycemic index, and sustained satiety throughout the day.',
    guideline: 'Eat daily (fill 25% of your plate with clean protein)'
  },
  {
    keywords: ['matta rice', 'oats', 'ragi', 'muthari', 'whole wheat', 'barley', 'quinoa', 'brown rice', 'millets'],
    title: 'Whole Grains & Millets',
    benefits: 'Slow-release complex carbohydrates that stabilize postprandial blood glucose and provide sustained energy.',
    guideline: 'Eat daily in controlled portions (fill 25% of your plate)'
  },
  {
    keywords: ['curd', 'buttermilk', 'sambaram', 'yogurt', 'moru', 'spiced buttermilk'],
    title: 'Curd & Spiced Buttermilk (Sambaram)',
    benefits: 'Natural probiotic strains (Lactobacillus) to restore healthy microbiome, soothe stomach lining, and assist digestion.',
    guideline: '1–2 servings daily (curd with meals or refreshing sambaram at 4 PM)'
  },
  {
    keywords: ['water', 'jeera water', 'pathimukham', 'boiled water'],
    title: 'Pure Water & Herbal Infusions',
    benefits: 'Maintains cellular hydration, flushes nitrogenous waste, prevents kidney stones, and curbs false hunger signals.',
    guideline: 'Drink 2.5 to 3.5 Litres daily'
  },
  {
    keywords: ['egg', 'boiled egg', 'mutta', 'poached egg'],
    title: 'Whole Eggs (Boiled / Poached)',
    benefits: 'Gold standard complete bioavailable protein with choline, lutein, and essential amino acids.',
    guideline: '1 whole egg daily is great for most healthy adults'
  },
  {
    keywords: ['almond', 'walnut', 'nuts', 'chia', 'flax seed'],
    title: 'Nuts & Seeds (Handful / 30g)',
    benefits: 'Plant sterols, alpha-linolenic acid (ALA), and vitamin E to protect heart valves and skin tone.',
    guideline: 'A modest handful (about 30g) a day (healthy but calorie dense)'
  }
];

// ============================================================================
// CLASSIFICATION ENGINE
// ============================================================================

export function classifyFoodItem(foodName: string, category?: string, preparation?: string): FoodClassificationResult {
  const lower = (foodName || '').toLowerCase().trim();
  const isFried = preparation?.toLowerCase().includes('fried') || lower.includes('(deep fried)') || lower.includes('deep fried');

  // 1. Check Strict Avoid
  for (const rule of STRICT_AVOID_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      return {
        tier: 'strict_avoid',
        tierLabel: '🚫 Strictly Limit / Avoid',
        isProblemFood: true,
        isSuperFood: false,
        riskSeverity: 'critical',
        riskTitle: rule.title,
        coachWarning: `Coach Saleem Warning: ${rule.title} should be strictly limited or avoided.`,
        clinicalReason: rule.reason,
        frequencyGuideline: rule.guideline,
        recommendedSwap: rule.swap
      };
    }
  }

  // 2. Check Once or Twice a Month
  for (const rule of ONCE_TWICE_MONTH_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw)) || (isFried && (category === 'Beverages & Snacks' || lower.includes('vada') || lower.includes('appam')))) {
      return {
        tier: 'once_twice_month',
        tierLabel: '🛑 Limit to Once or Twice a Month',
        isProblemFood: true,
        isSuperFood: false,
        riskSeverity: 'critical',
        riskTitle: rule.title,
        coachWarning: `Coach Saleem's Guidance: This is an occasional treat. Limit to once or twice a month at most.`,
        clinicalReason: rule.reason,
        frequencyGuideline: rule.guideline,
        recommendedSwap: rule.swap
      };
    }
  }

  // 3. Check Once or Twice a Week
  for (const rule of ONCE_TWICE_WEEK_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      return {
        tier: 'once_twice_week',
        tierLabel: '⚠️ Limit to Once or Twice a Week',
        isProblemFood: true,
        isSuperFood: false,
        riskSeverity: 'warning',
        riskTitle: rule.title,
        coachWarning: `Coach Saleem's Advisory: Tasty but dense. Limit intake to once or twice a week.`,
        clinicalReason: rule.reason,
        frequencyGuideline: rule.guideline,
        recommendedSwap: rule.swap
      };
    }
  }

  // 4. Check Daily Portion Control
  for (const rule of DAILY_PORTION_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      return {
        tier: 'daily_portion_control',
        tierLabel: '⚖️ Daily Portion Control',
        isProblemFood: lower.includes('excess') || lower.includes('parotta') || lower.includes('sugar') || lower.includes('pickle'),
        isSuperFood: false,
        riskSeverity: 'caution',
        riskTitle: rule.title,
        coachWarning: `Coach Saleem's Portion Tip: Keep to small, controlled daily amounts.`,
        clinicalReason: rule.reason,
        frequencyGuideline: rule.guideline,
        recommendedSwap: rule.swap
      };
    }
  }

  // 5. Check Daily Superfoods
  for (const rule of DAILY_SUPERFOOD_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      return {
        tier: 'daily_superfood',
        tierLabel: '🥗 Eat Daily & More Freely',
        isProblemFood: false,
        isSuperFood: true,
        riskSeverity: 'none',
        riskTitle: rule.title,
        coachWarning: '',
        clinicalReason: '',
        frequencyGuideline: rule.guideline,
        recommendedSwap: { name: 'Keep enjoying this choice', description: 'Pair with colorful salads and fresh water.' },
        healthBenefits: rule.benefits
      };
    }
  }

  // Default fallback classification based on category
  const isHealthyCategory = category === 'Vegetables' || category === 'Fruits' || category === 'Proteins';
  return {
    tier: isHealthyCategory ? 'daily_superfood' : 'daily_portion_control',
    tierLabel: isHealthyCategory ? '🥗 Whole Nutrient Food' : '⚖️ Balanced Moderate Food',
    isProblemFood: false,
    isSuperFood: isHealthyCategory,
    riskSeverity: 'none',
    riskTitle: foodName,
    coachWarning: '',
    clinicalReason: '',
    frequencyGuideline: 'Maintain balanced plate proportions (1/2 veggies, 1/4 protein, 1/4 grains).',
    recommendedSwap: { name: 'Wholesome portion', description: 'Eat mindfully and chew slowly.' }
  };
}

// ============================================================================
// AUDIT ALL MEAL LOGS FOR THE DAY
// ============================================================================

export function auditDailyMealLogs(
  logs: MealLogItem[],
  clientProfile?: ClientProfile
): DailyFoodAuditSummary {
  const problemFoods: DailyFoodAuditSummary['problemFoods'] = [];
  const healthyFoods: DailyFoodAuditSummary['healthyFoods'] = [];

  let veggiesGramsScore = 0;
  let proteinScore = 0;
  let grainsScore = 0;
  let otherScore = 0;

  logs.forEach(log => {
    const audit = classifyFoodItem(log.foodName);
    
    // Check if client has medical conditions that make this even more sensitive
    if (clientProfile?.medicalNotes) {
      const medNotes = clientProfile.medicalNotes.toLowerCase();
      const customAlerts: string[] = [];
      if ((medNotes.includes('diabet') || medNotes.includes('sugar')) && (audit.tier === 'strict_avoid' || audit.riskTitle.includes('Sugar') || audit.riskTitle.includes('Sweet') || audit.riskTitle.includes('Juice'))) {
        customAlerts.push('⚠️ Strict Alert (Diabetes): This meal causes an acute glycemic surge.');
      }
      if ((medNotes.includes('bp') || medNotes.includes('hypertens') || medNotes.includes('pressure')) && (audit.riskTitle.includes('Salt') || audit.riskTitle.includes('Pickle') || audit.riskTitle.includes('Fast Food'))) {
        customAlerts.push('⚠️ Strict Alert (High BP): Elevated sodium directly increases arterial blood pressure.');
      }
      if ((medNotes.includes('cholesterol') || (clientProfile.visceralFat && clientProfile.visceralFat >= 10)) && (audit.tier === 'once_twice_month' || audit.riskTitle.includes('Trans Fat') || audit.riskTitle.includes('Deep-Fried'))) {
        customAlerts.push('⚠️ Strict Alert (High Cholesterol / Visceral Fat): Deep oil stalls fat loss and elevates arterial plaque risk.');
      }
      if (customAlerts.length > 0) {
        audit.medicalConditionsWarning = customAlerts;
      }
    }

    if (audit.isProblemFood) {
      problemFoods.push({
        logId: log.id,
        foodName: log.foodName,
        mealType: log.mealType,
        calories: log.calories,
        audit
      });
    }

    if (audit.isSuperFood) {
      healthyFoods.push({
        logId: log.id,
        foodName: log.foodName,
        mealType: log.mealType,
        calories: log.calories,
        audit
      });
    }

    // Plate distribution heuristic
    const lower = log.foodName.toLowerCase();
    if (lower.includes('salad') || lower.includes('thoran') || lower.includes('vegetable') || lower.includes('cheera') || lower.includes('fruit') || lower.includes('apple') || lower.includes('papaya')) {
      veggiesGramsScore += log.calories || 50;
    } else if (lower.includes('egg') || lower.includes('chicken') || lower.includes('fish') || lower.includes('dal') || lower.includes('kadala') || lower.includes('cherupayar') || lower.includes('paneer') || lower.includes('sprouts')) {
      proteinScore += log.calories || 100;
    } else if (lower.includes('rice') || lower.includes('roti') || lower.includes('chapati') || lower.includes('oats') || lower.includes('appam') || lower.includes('puttu') || lower.includes('idli')) {
      grainsScore += log.calories || 120;
    } else {
      otherScore += log.calories || 80;
    }
  });

  const totalPlatePoints = veggiesGramsScore + proteinScore + grainsScore + otherScore || 1;
  const veggiesAndFruitsPercent = Math.round((veggiesGramsScore / totalPlatePoints) * 100);
  const leanProteinPercent = Math.round((proteinScore / totalPlatePoints) * 100);
  const wholeGrainsPercent = Math.round((grainsScore / totalPlatePoints) * 100);
  const otherPercent = Math.max(0, 100 - (veggiesAndFruitsPercent + leanProteinPercent + wholeGrainsPercent));

  // Determine Coach Saleem's Daily Verdict
  let status: 'alert' | 'balanced' | 'excellent' | 'empty' = 'empty';
  let title = "No Meals Logged Today";
  let message = "Log your breakfast, lunch, snacks, or dinner to receive instant clinical feedback from Coach Saleem.";
  let urgentNotice: string | undefined = undefined;

  if (logs.length > 0) {
    if (problemFoods.length > 0) {
      status = 'alert';
      title = "Coach Saleem's Clinical Caution: Attention Needed";
      message = `You logged ${problemFoods.length} item${problemFoods.length > 1 ? 's' : ''} today that should be limited (occasional treats or high-risk foods). Occasional indulgences are acceptable 1–2 times a month, but regular consumption stalls fat loss and elevates visceral fat.`;
      urgentNotice = `Review the red alerts below and choose the recommended healthy swaps for your next meal!`;
    } else if (healthyFoods.length >= 3) {
      status = 'excellent';
      title = "Coach Saleem's Commendation: Outstanding Nutrition!";
      message = `Superb discipline today! Your meal logs are loaded with fiber-rich vegetables, wholesome proteins, and clean hydration. This directly accelerates visceral fat reduction and sustained daily energy.`;
    } else {
      status = 'balanced';
      title = "Coach Saleem's Progress Check: Balanced Daily Track";
      message = `Solid baseline logs for today. To hit optimal results, ensure half your plate consists of vegetables/fruits and incorporate 1 serving of buttermilk or moong sprouts.`;
    }
  }

  // Next Good Options (arranged by clinical logic)
  const arrangedGoodOptions = [
    {
      mealSlot: 'Evening Snack (4:00 PM - 5:30 PM)',
      title: 'Smart Tea-Time Swap',
      recommendedFoods: ['Spiced Sambaram (Moru)', '1 Handful Roasted Cherupayar or Makhana', 'Steamed Ela Ada'],
      benefit: 'Eliminates 150 kcal of deep frying oil, prevents insulin crashes, and calms late afternoon cravings.',
      prepTip: 'Crush green chili, ginger, and curry leaves into cold churned curd with Himalayan salt.'
    },
    {
      mealSlot: 'Dinner (7:30 PM - 8:30 PM)',
      title: 'Light Metabolic Rest Dinner',
      recommendedFoods: ['2 Whole Wheat Chapatis or 1 Appam', 'Cheera (Spinach) or Cabbage Thoran', '2 Boiled Eggs or Kudampuli Fish Curry'],
      benefit: 'High protein with slow carbs ensures overnight muscle recovery and low blood sugar levels before sleep.',
      prepTip: 'Eat your vegetable salad and protein first before eating the chapati to blunt glucose response.'
    },
    {
      mealSlot: 'Hydration & Gut Support',
      title: 'Daily Probiotic & Water Protocol',
      recommendedFoods: ['3 Litres Fresh Water', '1 Glass Sambaram', 'Jeerakam Water'],
      benefit: 'Restores gut microflora, speeds up fat metabolism, and flushes sodium retention.',
      prepTip: 'Keep a 1-Litre bottle at your desk and finish 3 refills before 7:00 PM.'
    }
  ];

  return {
    date: logs[0]?.date || new Date().toISOString().split('T')[0],
    totalLogs: logs.length,
    problemFoods,
    healthyFoods,
    hasProblemFoods: problemFoods.length > 0,
    hasHealthyFoods: healthyFoods.length > 0,
    dailyCoachVerdict: { status, title, message, urgentNotice },
    plateDistribution: {
      veggiesAndFruitsPercent,
      leanProteinPercent,
      wholeGrainsPercent,
      otherPercent
    },
    arrangedGoodOptions
  };
}

// ============================================================================
// COMPLETE CLINICAL GUIDELINES ENCYCLOPEDIA (FOR MODAL / REFERENCE GUIDE)
// ============================================================================

export const CLINICAL_FOOD_ENCYCLOPEDIA = {
  tiers: [
    {
      id: 'strict_avoid',
      badge: 'STRICTLY AVOID OR LIMIT',
      color: 'rose',
      title: 'Foods to Avoid or Strictly Limit',
      subtitle: 'No safe level or severely harmful to cardiovascular & liver health',
      items: [
        {
          name: 'Sugary drinks & energy drinks',
          details: 'Cold drinks, soda, packaged sweet fruit drinks, energy drinks (Red Bull, Sting). Best kept strictly rare.',
          danger: 'Direct driver of non-alcoholic fatty liver, sharp insulin spikes, and deep abdominal visceral fat.'
        },
        {
          name: 'Alcohol and tobacco',
          details: 'Zero safe level for metabolic and cardiovascular health.',
          danger: 'Stops hepatic fat oxidation completely; promotes systemic cellular inflammation.'
        },
        {
          name: 'Industrial trans fats (Vanaspati, Dalda)',
          details: 'Partially hydrogenated vegetable fats used in commercial bakeries and cheap frying.',
          danger: 'Causes severe arterial plaque buildup, raises bad LDL, and lowers protective HDL.'
        },
        {
          name: 'Burnt or charred food',
          details: 'Heavily charred or over-barbecued meats and burnt crusts.',
          danger: 'Forms carcinogenic heterocyclic amines (HCAs) and polycyclic aromatic hydrocarbons (PAHs).'
        },
        {
          name: 'Reused-oil fried food',
          details: 'Oil heated again and again at street stalls and tea shops.',
          danger: 'Forms toxic aldehydes and oxidized lipid peroxides that damage gut lining and liver cells.'
        }
      ]
    },
    {
      id: 'once_twice_month',
      badge: 'LIMIT: 1–2 TIMES A MONTH',
      color: 'red',
      title: 'Foods to Limit to Once or Twice a Month',
      subtitle: 'Occasional treats only — regular intake leads to visceral fat & metabolic syndrome',
      items: [
        {
          name: 'Deep-fried street food & fast food',
          details: 'Burgers, french fries, fried chicken, samosas, pakoras, puffs, mayo shawarma.',
          danger: 'Extremely high in trans/saturated fats and sodium; strongly linked to heart disease and fatty liver.'
        },
        {
          name: 'Sweets & rich desserts',
          details: 'Jalebi, gulab jamun, laddu, halwa, cakes, pastries, commercial ice cream.',
          danger: 'Concentrated refined table sugar combined with fat; promotes insulin resistance.'
        },
        {
          name: 'Packaged cream biscuits, chips & instant noodles',
          details: 'Ultra-processed packaged snacks, potato chips, instant cup/packaged noodles.',
          danger: 'Stripped of nutrients, loaded with refined maida, sodium, and low-grade palm olein.'
        }
      ]
    },
    {
      id: 'once_twice_week',
      badge: 'LIMIT: 1–2 TIMES A WEEK',
      color: 'amber',
      title: 'Foods to Limit to Once or Twice a Week',
      subtitle: 'Nutrient-rich but dense in saturated fats, calories, or heavy metals',
      items: [
        {
          name: 'Red meat (Beef, Mutton, Pork)',
          details: 'Up to about 350–500 g cooked weight per week is the maximum safe advice.',
          danger: 'Excess intake significantly raises risks of colorectal cancer, cardiovascular disease, and gout.'
        },
        {
          name: 'Processed meats (Sausages, Salami, Nuggets, Bacon)',
          details: 'WHO classifies processed meat as a Group 1 carcinogen.',
          danger: 'Synthetic sodium nitrite preservatives linked to cellular DNA damage. Keep very rare.'
        },
        {
          name: 'Biryani and heavy oily curries',
          details: 'Tasty and traditional, but dense with 800–1100 kcal per standard plate.',
          danger: 'Can easily wipe out an entire week of calorie deficit in a single meal.'
        },
        {
          name: 'Deep-fried fish or fried snacks',
          details: 'Baking, steaming, or light shallow cooking in traditional clay pots is far superior.',
          danger: 'Deep frying destroys delicate Omega-3 fatty acids and adds 120+ kcal of absorbed oil.'
        },
        {
          name: 'Large predatory fish (Swordfish, King Mackerel, Shark)',
          details: 'Important for pregnant women, nursing mothers, and children to strictly limit.',
          danger: 'High methylmercury bioaccumulation poses neurological and cardiovascular risks.'
        }
      ]
    },
    {
      id: 'daily_portion',
      badge: 'SMALL AMOUNT DAILY',
      color: 'yellow',
      title: 'Foods to Limit to a Small Amount Daily',
      subtitle: 'Essential portion discipline for everyday staples',
      items: [
        {
          name: 'Added sugar',
          details: 'Up to max 6 teaspoons (25 g) of added sugar a day for adults, ideally less.',
          danger: 'Includes sugar in tea, coffee, syrups, and packaged foods.'
        },
        {
          name: 'Salt & Sodium',
          details: 'Under 5 g (1 level teaspoon) a day across the whole day.',
          danger: 'Watch out for hidden sodium in pickles (achar), pappadam, soya sauce, and processed snacks.'
        },
        {
          name: 'Cooking oil',
          details: 'About 3–4 teaspoons (15–20 ml) per person per day.',
          danger: 'Use measuring spoons instead of free pouring. 1 tbsp adds 120 kcal.'
        },
        {
          name: 'Tea and coffee',
          details: '2–3 cups a day maximum. Keep caffeine under 400 mg daily.',
          danger: 'Avoid adding white table sugar; do not drink within 1 hour before sleep.'
        },
        {
          name: 'Whole eggs',
          details: '1 whole egg a day is fine and beneficial for most healthy people.',
          danger: 'If diagnosed with familial hypercholesterolemia or advanced diabetes, follow doctor advice on yolks.'
        },
        {
          name: 'Milk and dairy',
          details: '2–3 servings a day is plenty. Prefer unsweetened curd or buttermilk.',
          danger: 'Excess full-cream dairy can rapidly increase daily saturated fat intake.'
        },
        {
          name: 'Fruit juice',
          details: 'Far better to eat the whole fruit with fiber. Juice is pure sugar without fiber.',
          danger: 'Drinking juice causes rapid fructose spikes without feeling full.'
        },
        {
          name: 'Nuts & seeds',
          details: 'A modest handful (about 30 g) a day.',
          danger: 'Extremely healthy fats, but very calorie dense (~180–200 kcal per handful).'
        },
        {
          name: 'Rice and white flour (Maida)',
          details: 'Eat in controlled moderate portions, and mix with whole grains, millets, and vegetables.',
          danger: 'High glycemic index; spikes blood sugar if eaten alone without protein and fiber.'
        }
      ]
    },
    {
      id: 'daily_superfoods',
      badge: 'EAT DAILY & FREELY',
      color: 'emerald',
      title: 'Foods You Can Eat Daily (and More Freely)',
      subtitle: 'The foundation of lifelong health, lean muscle, and optimal visceral fat',
      items: [
        {
          name: 'Vegetables (especially leafy greens) & Whole Fruits',
          details: 'Cheera, cabbage, beans, moringa, cucumber, guava, papaya, apples, berries.',
          danger: 'High fiber, living enzymes, and cellular micronutrients.'
        },
        {
          name: 'Pulses, lentils and beans',
          details: 'Cherupayar (green gram), kadala (chana), dal, rajma, sprouted beans.',
          danger: 'Clean plant protein, gut-nourishing resistant starch, and sustained energy.'
        },
        {
          name: 'Whole grains and millets',
          details: 'Kerala matta rice, steel-cut oats, ragi (finger millet), whole wheat, barley.',
          danger: 'Complex carbs with intact bran and germ for steady blood sugar.'
        },
        {
          name: 'Curd or spiced buttermilk (Sambaram)',
          details: 'Fresh probiotic curd, or buttermilk blended with ginger, curry leaves, and green chili.',
          danger: 'Restores healthy intestinal microflora and enhances digestive enzyme secretion.'
        },
        {
          name: 'Fresh water',
          details: '2.5 to 3.5 Litres daily depending on ambient temperature and sweat rate.',
          danger: 'Essential for cellular hydration, joint lubrication, and fat transport.'
        }
      ]
    }
  ],
  goldenRules: [
    {
      title: 'Medical Conditions Change the Limits',
      description: 'Diabetes, high blood pressure, kidney disease, high cholesterol, gout, or fatty liver require stricter personal limits on sugar, sodium, protein, or saturated fats. Always align with your physician and Coach Saleem.'
    },
    {
      title: 'Even Healthy Food Can Be Harmful in Excess',
      description: 'Too many nuts (over 50g), excessive fruit sugar from 5-6 mangoes, or excessive protein powder without adequate water can strain kidneys and trigger weight gain.'
    },
    {
      title: 'Variety Matters More Than Any Single Food',
      description: 'Aim for a balanced plate every single day: 50% Vegetables & Whole Fruit, 25% Clean Protein, and 25% Whole Grains/Millets.'
    },
    {
      title: 'The Occasional Treat is Not the Problem',
      description: 'Regular daily habits matter infinitely more than a once-a-month celebration. Never feel guilty for an occasional treat; simply resume your clean routine immediately the next morning!'
    }
  ]
};
