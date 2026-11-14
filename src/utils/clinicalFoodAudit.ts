import { MealLogItem, ClientProfile } from '../types';
import { AppLanguage } from './i18n';

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

const TIER_LABELS_ML: Record<FoodFrequencyTier, string> = {
  strict_avoid: '🚫 പൂർണ്ണമായും ഒഴിവാക്കുക / കർശനമായി നിയന്ത്രിക്കുക',
  once_twice_month: '🛑 മാസത്തിൽ 1-2 തവണ മാത്രം (വല്ലപ്പോഴും)',
  once_twice_week: '⚠️ ആഴ്ചയിൽ 1-2 തവണ മാത്രം',
  daily_portion_control: '⚖️ ദിവസവും ചെറിയ അളവിൽ മാത്രം',
  daily_superfood: '🥗 ദിവസവും ധാരാളം കഴിക്കാം (ഉത്തമം)',
};

const RULE_TEXT_ML: Record<string, { title: string; reason: string; guideline: string; swapName: string; swapDesc: string; swapSaved?: string }> = {
  'Sugary & Carbonated Energy Drinks': {
    title: 'മധുരപാനീയങ്ങളും എനർജി ഡ്രിങ്കുകളും (സോഡ/കോള)',
    reason: 'ദ്രവരൂപത്തിലുള്ള അമിത പഞ്ചസാരയും ഫ്രക്ടോസും ഇൻസുലിൻ പെട്ടെന്ന് കൂട്ടുകയും ഫാറ്റി ലിവറിനും വയറ്റിലെ കൊഴുപ്പ് കൂടാനും കാരണമാകുന്നു.',
    guideline: 'പൂർണ്ണമായും ഒഴിവാക്കുക അല്ലെങ്കിൽ കർശനമായി നിയന്ത്രിക്കുക',
    swapName: 'സംഭാരം / മധുരമില്ലാത്ത നാരങ്ങാവെള്ളം',
    swapDesc: 'ഇഞ്ചിയും കറിവേപ്പിലയും ചേർത്ത തണുത്ത മോര് അല്ലെങ്കിൽ പഞ്ചസാരയില്ലാത്ത നാരങ്ങാവെള്ളം.',
    swapSaved: '~140-200 kcal ലാഭിക്കാം',
  },
  'Alcohol & Toxic Substances': {
    title: 'മദ്യവും ലഹരിവസ്തുക്കളും',
    reason: 'സുരക്ഷിതമായ അളവില്ല. കരളിന്റെ കൊഴുപ്പ് കത്തിക്കൽ പ്രക്രിയ തടസ്സപ്പെടുത്തുകയും ആന്തരിക വീക്കം ഉണ്ടാക്കുകയും ചെയ്യുന്നു.',
    guideline: 'പൂർണ്ണമായും ഒഴിവാക്കുക',
    swapName: 'ജീരകവെള്ളം അല്ലെങ്കിൽ പതിമുഖം വെള്ളം',
    swapDesc: 'ആന്റിഓക്‌സിഡന്റുകൾ നിറഞ്ഞ കേരളീയ ഔഷധ പാനീയം.',
    swapSaved: 'വിഷാംശം ഒഴിവാക്കുന്നു',
  },
  'Industrial Trans Fats (Vanaspati / Dalda)': {
    title: 'ട്രാൻസ് ഫാറ്റ് (വനസ്പതി / ഡാൽഡ)',
    reason: 'ചീത്ത കൊളസ്ട്രോൾ (LDL) കൂട്ടുകയും നല്ല കൊളസ്ട്രോൾ (HDL) കുറയ്ക്കുകയും രക്തക്കുഴലുകളിൽ തടസ്സമുണ്ടാക്കുകയും ചെയ്യുന്നു.',
    guideline: 'കഴിയുന്നത്ര ഒഴിവാക്കുക',
    swapName: 'ശുദ്ധമായ വെളിച്ചെണ്ണ (ദിവസവും 1 ടീസ്പൂൺ മാത്രം)',
    swapDesc: 'അളന്നു മാത്രം ഉപയോഗിക്കുന്ന ശുദ്ധമായ വെളിച്ചെണ്ണ.',
    swapSaved: 'ഹൃദയാരോഗ്യം സംരക്ഷിക്കുന്നു',
  },
  'Burnt or Charred Food': {
    title: 'കരിഞ്ഞതോ അമിതമായി ചുട്ടതോ ആയ ഭക്ഷണം',
    reason: 'ഭക്ഷണം കരിയുമ്പോൾ ആരോഗ്യത്തിന് ഹാനികരമായ രാസവസ്തുക്കൾ (HCAs/PAHs) രൂപപ്പെടുന്നു.',
    guideline: 'പതിവായി കഴിക്കരുത്',
    swapName: 'ആവിയിൽ വേവിച്ചതോ മൺചട്ടിയിൽ പാകം ചെയ്തതോ',
    swapDesc: 'പോഷകങ്ങൾ നഷ്ടപ്പെടാതെ മിതമായ ചൂടിൽ വേവിച്ച ഭക്ഷണം.',
    swapSaved: 'ഹാനികരമായ ഘടകങ്ങൾ ഒഴിവാക്കുന്നു',
  },
  'Reused-Oil Fried Food': {
    title: 'വീണ്ടും ചൂടാക്കിയ എണ്ണയിൽ വറുത്തവ',
    reason: 'ഒരേ എണ്ണ വീണ്ടും വീണ്ടും ചൂടാക്കുമ്പോൾ കരളിനും കോശങ്ങൾക്കും ദോഷകരമായ വിഷാംശങ്ങൾ ഉണ്ടാകുന്നു.',
    guideline: 'പൂർണ്ണമായും ഒഴിവാക്കുക',
    swapName: 'വീട്ടിൽ ആവിയിൽ അല്ലെങ്കിൽ കുറഞ്ഞ എണ്ണയിൽ ഉണ്ടാക്കിയവ',
    swapDesc: 'പുതിയ എണ്ണ ചെറിയ അളവിൽ മാത്രം ഉപയോഗിച്ച് പാകം ചെയ്തവ.',
    swapSaved: 'ഓക്സിഡൈസ്ഡ് കൊഴുപ്പ് ഒഴിവാക്കുന്നു',
  },
  'Deep-Fried Street Food & Fast Food': {
    title: 'എണ്ണയിൽ വറുത്ത സ്ട്രീറ്റ് ഫുഡും ഫാസ്റ്റ് ഫുഡും',
    reason: 'അമിതമായ ട്രാൻസ് ഫാറ്റും ഉപ്പും കലോറിയും ഹൃദ്രോഗത്തിനും ഫാറ്റി ലിവറിനും വയറ്റിലെ കൊഴുപ്പിനും കാരണമാകുന്നു.',
    guideline: 'മാസത്തിൽ 1-2 തവണ മാത്രം (വല്ലപ്പോഴും)',
    swapName: 'ഇല അട / കൊഴുക്കട്ട / വറുത്ത മഖാന',
    swapDesc: 'ആവിയിൽ വേവിച്ച പോഷകസമൃദ്ധമായ നാടൻ പലഹാരങ്ങൾ.',
    swapSaved: '120–180 kcal & 14g എണ്ണ ലാഭിക്കാം',
  },
  'Heavy Sweets & Commercial Desserts': {
    title: 'മധുരപലഹാരങ്ങളും ബേക്കറി കേക്ക്/ഐസ്ക്രീമും',
    reason: 'നാരുകളില്ലാത്ത ശുദ്ധീകരിച്ച പഞ്ചസാരയും കൊഴുപ്പും രക്തത്തിലെ പഞ്ചസാര പെട്ടെന്ന് കൂട്ടുന്നു.',
    guideline: 'മാസത്തിൽ 1-2 തവണ മാത്രം (വല്ലപ്പോഴും)',
    swapName: 'പഴുത്ത പപ്പായ / പേരയ്ക്ക / മാതളനാരങ്ങ',
    swapDesc: 'നാരുകളും വിറ്റാമിനുകളും അടങ്ങിയ സ്വാഭാവിക പഴങ്ങൾ.',
    swapSaved: '250+ kcal പഞ്ചസാര ഒഴിവാക്കാം',
  },
  'Packaged Cream Biscuits, Chips & Instant Noodles': {
    title: 'പാക്കറ്റ് ബിസ്ക്കറ്റുകൾ, ചിപ്സ് & ഇൻസ്റ്റന്റ് നൂഡിൽസ്',
    reason: 'അമിത ഉപ്പും മൈദയും പാം ഓയിലും അടങ്ങിയ അൾട്രാ-പ്രോസസ്ഡ് ഭക്ഷണം.',
    guideline: 'മാസത്തിൽ 1-2 തവണ മാത്രം (വല്ലപ്പോഴും)',
    swapName: 'വറുത്ത ചെറുപയർ / പുഴുങ്ങിയ ചോളം / മഖാന',
    swapDesc: 'നാരുകളും പ്രോട്ടീനും അടങ്ങിയ വീട്ടിൽ തയ്യാറാക്കാവുന്ന ലഘുഭക്ഷണം.',
    swapSaved: 'പ്രോസസ്ഡ് പാം ഓയിൽ ഒഴിവാക്കുന്നു',
  },
  'Red Meat (Beef, Mutton, Pork)': {
    title: 'റെഡ് മീറ്റ് (ബീഫ്, മട്ടൺ, പോർക്ക്)',
    reason: 'അമിതമായ ഉപയോഗം ഹൃദ്രോഗം, യൂറിക് ആസിഡ്, കുടൽ സംബന്ധമായ അസുഖങ്ങൾ എന്നിവയ്ക്കുള്ള സാധ്യത കൂട്ടുന്നു.',
    guideline: 'ആഴ്ചയിൽ 1-2 തവണ മാത്രം (ആഴ്ചയിൽ പരമാവധി 350-500g)',
    swapName: 'തൊലി കളഞ്ഞ ചിക്കൻ ബ്രെസ്റ്റ് അല്ലെങ്കിൽ മത്തി/അയല',
    swapDesc: 'ഒമേഗ-3 സമ്പുഷ്ടമായ ചെറിയ മീൻ കറി അല്ലെങ്കിൽ ഗ്രിൽഡ് ചിക്കൻ.',
    swapSaved: 'സാച്ചുറേറ്റഡ് കൊഴുപ്പ് 65% കുറയ്ക്കുന്നു',
  },
  'Processed Meats': {
    title: 'പ്രോസസ്ഡ് ഇറച്ചി (സോസേജ്, നഗറ്റ്സ്, ബേക്കൺ)',
    reason: 'ലോകാരോഗ്യ സംഘടന (WHO) ആരോഗ്യത്തിന് അപകടകരമായി തരംതിരിച്ച പ്രോസസ്ഡ് ഭക്ഷണം; ഉപ്പും നൈട്രേറ്റും അമിതമാണ്.',
    guideline: 'വളരെ അപൂർവ്വമായി മാത്രം (കഴിയുന്നതും ഒഴിവാക്കുക)',
    swapName: 'പുഴുങ്ങിയ മുട്ട അല്ലെങ്കിൽ ഗ്രിൽഡ് പനീർ/ചിക്കൻ',
    swapDesc: 'പ്രിസർവേറ്റീവുകൾ ഇല്ലാത്ത ശുദ്ധമായ പ്രോട്ടീൻ.',
    swapSaved: 'കൃത്രിമ നൈട്രേറ്റുകൾ ഒഴിവാക്കുന്നു',
  },
  'Biryani & Heavy Oily Curries': {
    title: 'ബിരിയാണിയും അമിത എണ്ണ/നെയ്യ് ഉള്ള കറികളും',
    reason: 'നെയ്യും വറുത്ത ഉള്ളിയും ചേരുന്നതിനാൽ ഒരു പ്ലേറ്റിൽ തന്നെ 750–1100 കലോറി വരെ ഉണ്ടാകാം.',
    guideline: 'ആഴ്ചയിൽ 1-2 തവണ മാത്രം',
    swapName: 'മട്ട അരി ചോറും മീൻ കറിയും തോരനും',
    swapDesc: 'നാരുകളും പ്രോട്ടീനും സന്തുലിതമായ നാടൻ ഉച്ചഭക്ഷണം.',
    swapSaved: '350–500 kcal ലാഭിക്കാം',
  },
  'Deep Fried Fish & Oily Seafood': {
    title: 'എണ്ണയിൽ വറുത്ത മീൻ (ഡീപ് ഫ്രൈ)',
    reason: 'അമിത ചൂടിൽ വറുക്കുന്നത് മീനിലെ നല്ല ഒമേഗ-3 കൊഴുപ്പ് നശിപ്പിക്കുകയും അനാവശ്യ എണ്ണ ആഗിരണം കൂട്ടുകയും ചെയ്യുന്നു.',
    guideline: 'ആഴ്ചയിൽ 1-2 തവണ മാത്രം (കറി വെച്ചതോ ആവിയിൽ വേവിച്ചതോ ഉത്തമം)',
    swapName: 'കുടംപുളി ഇട്ട മീൻ കറി / പാൻ-ഗ്രിൽഡ് ഫിഷ്',
    swapDesc: 'മൺചട്ടിയിൽ വേവിച്ച കുടംപുളി മീൻ കറി.',
    swapSaved: 'ഒമേഗ-3 നിലനിർത്തുന്നു, 110 kcal ലാഭിക്കാം',
  },
  'Large Predatory Fish (Mercury Risk)': {
    title: 'വലിയ കടൽ മത്സ്യങ്ങൾ (മെർക്കുറി സാധ്യത)',
    reason: 'വലിയ മത്സ്യങ്ങളിൽ മെർക്കുറി അളവ് കൂടുതലായിരിക്കാൻ സാധ്യതയുണ്ട് (ഗർഭിണികളും കുട്ടികളും പ്രത്യേകം ശ്രദ്ധിക്കുക).',
    guideline: 'വല്ലപ്പോഴും മാത്രം കഴിക്കുക',
    swapName: 'ചെറിയ മത്സ്യങ്ങൾ (മത്തി/ചാള, നെത്തോലി)',
    swapDesc: 'കാൽസ്യവും ഒമേഗ-3 ഉം നിറഞ്ഞ സുരക്ഷിതമായ ചെറിയ മീനുകൾ.',
    swapSaved: 'ഹൃദയത്തിന് ഏറ്റവും മികച്ചത്',
  },
  'Added Sugar': {
    title: 'അധിക പഞ്ചസാര (Added Sugar)',
    reason: 'ദിവസവും പരമാവധി 6 ടീസ്പൂൺ (25g) മാത്രമാണ് സുരക്ഷിതം; അമിത പഞ്ചസാര ഫാറ്റി ലിവറിന് കാരണമാകും.',
    guideline: 'ദിവസവും 6 ടീസ്പൂണിൽ (25g) താഴെ മാത്രം',
    swapName: 'ഏലക്കായോ കറുവപ്പട്ടയോ ചേർത്ത ചായ',
    swapDesc: 'പഞ്ചസാര ഒഴിവാക്കി സുഗന്ധവ്യഞ്ജനങ്ങൾ ചേർത്ത പാനീയങ്ങൾ.',
    swapSaved: '80–120 kcal ലാഭിക്കാം',
  },
  'Excess Salt & Pickles / Papad': {
    title: 'അമിത ഉപ്പ്, അച്ചാർ, പപ്പടം',
    reason: 'ദിവസവും ആകെ ഉപ്പ് 5 ഗ്രാമിൽ (1 ടീസ്പൂൺ) താഴെയായിരിക്കണം. അമിത ഉപ്പ് രക്തസമ്മർദ്ദം (BP) കൂട്ടും.',
    guideline: 'ആകെ ഉപ്പ് ദിവസവും 1 ടീസ്പൂണിൽ താഴെ മാത്രം',
    swapName: 'വെള്ളരിക്ക പച്ചടി അല്ലെങ്കിൽ പുതിന ചമ്മന്തി',
    swapDesc: 'തൈരും ഇലകളും നാരങ്ങാനീരും ചേർത്ത കുറഞ്ഞ ഉപ്പുള്ള വിഭവങ്ങൾ.',
    swapSaved: 'സോഡിയം 70% കുറയ്ക്കുന്നു',
  },
  'Cooking Oil Portions': {
    title: 'പാചക എണ്ണയുടെ അളവ്',
    reason: 'ഒരാൾക്ക് ദിവസവും 3-4 ടീസ്പൂൺ (15-20 ml) എണ്ണ മതി. 1 ടേബിൾസ്പൂൺ എണ്ണയിൽ 120 കലോറി ഉണ്ട്!',
    guideline: 'ദിവസവും 3–4 ടീസ്പൂൺ (15–20 ml) മാത്രം',
    swapName: 'ആവിയിൽ വേവിച്ചതോ തവയിൽ ചുട്ടതോ',
    swapDesc: 'എണ്ണ കുപ്പിയിൽ നിന്ന് നേരിട്ട് ഒഴിക്കാതെ സ്പൂൺ ഉപയോഗിച്ച് അളക്കുക.',
    swapSaved: 'ദിവസവും 120–240 kcal ലാഭിക്കാം',
  },
  'Commercial or Strained Fruit Juice': {
    title: 'പഴച്ചാറുകൾ (ജ്യൂസ്)',
    reason: 'ജ്യൂസിൽ പഴങ്ങളിലെ നാരുകൾ നഷ്ടപ്പെടുകയും പഞ്ചസാര പെട്ടെന്ന് രക്തത്തിൽ കലരുകയും ചെയ്യുന്നു.',
    guideline: 'ജ്യൂസിന് പകരം മുഴുവൻ പഴമായി കഴിക്കുക',
    swapName: 'തൊലിയോടും നാരുകളോടും കൂടിയ മുഴുവൻ പഴം',
    swapDesc: 'ഓറഞ്ച്, ആപ്പിൾ, പേരയ്ക്ക എന്നിവ അതുപോലെ കടിച്ചു തിന്നുക.',
    swapSaved: '4g ഫൈബർ ലഭിക്കുന്നു',
  },
  'Refined White Flour (Maida) & Excess White Rice': {
    title: 'മൈദ വിഭവങ്ങളും (പൊറോട്ട) അമിത വെള്ള ചോറും',
    reason: 'നാരുകൾ ഇല്ലാത്തതിനാൽ രക്തത്തിലെ പഞ്ചസാര പെട്ടെന്ന് കൂട്ടുകയും വേഗം വിശപ്പുണ്ടാക്കുകയും ചെയ്യുന്നു.',
    guideline: 'മിതമായ അളവിൽ മാത്രം, ധാന്യങ്ങളും പച്ചക്കറികളും ചേർത്ത് കഴിക്കുക',
    swapName: 'മട്ട അരി ചോറ് / ഗോതമ്പ് ചപ്പാത്തി / അപ്പം',
    swapDesc: 'സാവധാനം ദഹിക്കുന്ന ആരോഗ്യകരമായ കാർബോഹൈഡ്രേറ്റുകൾ.',
    swapSaved: 'ഗ്ലൈസെമിക് ലോഡ് കുറയ്ക്കുന്നു',
  },
};

export function classifyFoodItem(foodName: string, category?: string, preparation?: string, lang: AppLanguage = 'en'): FoodClassificationResult {
  const isMl = lang === 'ml';
  const lower = (foodName || '').toLowerCase().trim();
  const isFried = preparation?.toLowerCase().includes('fried') || lower.includes('(deep fried)') || lower.includes('deep fried');

  // 1. Check Strict Avoid
  for (const rule of STRICT_AVOID_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      const ml = RULE_TEXT_ML[rule.title];
      return {
        tier: 'strict_avoid',
        tierLabel: isMl ? TIER_LABELS_ML.strict_avoid : '🚫 Strictly Limit / Avoid',
        isProblemFood: true,
        isSuperFood: false,
        riskSeverity: 'critical',
        riskTitle: isMl && ml ? ml.title : rule.title,
        coachWarning: isMl && ml
          ? `കോച്ച് സലീം മുന്നറിയിപ്പ്: ${ml.title} പൂർണ്ണമായും ഒഴിവാക്കണം.`
          : `Coach Saleem Warning: ${rule.title} should be strictly limited or avoided.`,
        clinicalReason: isMl && ml ? ml.reason : rule.reason,
        frequencyGuideline: isMl && ml ? ml.guideline : rule.guideline,
        recommendedSwap: isMl && ml
          ? { name: ml.swapName, description: ml.swapDesc, caloriesSaved: ml.swapSaved }
          : rule.swap
      };
    }
  }

  // 2. Check Once or Twice a Month
  for (const rule of ONCE_TWICE_MONTH_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw)) || (isFried && (category === 'Beverages & Snacks' || lower.includes('vada') || lower.includes('appam')))) {
      const ml = RULE_TEXT_ML[rule.title];
      return {
        tier: 'once_twice_month',
        tierLabel: isMl ? TIER_LABELS_ML.once_twice_month : '🛑 Limit to Once or Twice a Month',
        isProblemFood: true,
        isSuperFood: false,
        riskSeverity: 'critical',
        riskTitle: isMl && ml ? ml.title : rule.title,
        coachWarning: isMl
          ? 'കോച്ച് സലീമിന്റെ നിർദ്ദേശം: ഇത് മാസത്തിൽ ഒന്നോ രണ്ടോ തവണ മാത്രം കഴിക്കേണ്ട ട്രീറ്റ് ആണ്.'
          : "Coach Saleem's Guidance: This is an occasional treat. Limit to once or twice a month at most.",
        clinicalReason: isMl && ml ? ml.reason : rule.reason,
        frequencyGuideline: isMl && ml ? ml.guideline : rule.guideline,
        recommendedSwap: isMl && ml
          ? { name: ml.swapName, description: ml.swapDesc, caloriesSaved: ml.swapSaved }
          : rule.swap
      };
    }
  }

  // 3. Check Once or Twice a Week
  for (const rule of ONCE_TWICE_WEEK_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      const ml = RULE_TEXT_ML[rule.title];
      return {
        tier: 'once_twice_week',
        tierLabel: isMl ? TIER_LABELS_ML.once_twice_week : '⚠️ Limit to Once or Twice a Week',
        isProblemFood: true,
        isSuperFood: false,
        riskSeverity: 'warning',
        riskTitle: isMl && ml ? ml.title : rule.title,
        coachWarning: isMl
          ? 'കോച്ച് സലീമിന്റെ ഉപദേശം: കലോറി കൂടുതലായതിനാൽ ആഴ്ചയിൽ 1-2 തവണയായി ചുരുക്കുക.'
          : "Coach Saleem's Advisory: Tasty but dense. Limit intake to once or twice a week.",
        clinicalReason: isMl && ml ? ml.reason : rule.reason,
        frequencyGuideline: isMl && ml ? ml.guideline : rule.guideline,
        recommendedSwap: isMl && ml
          ? { name: ml.swapName, description: ml.swapDesc, caloriesSaved: ml.swapSaved }
          : rule.swap
      };
    }
  }

  // 4. Check Daily Portion Control
  for (const rule of DAILY_PORTION_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      const ml = RULE_TEXT_ML[rule.title];
      return {
        tier: 'daily_portion_control',
        tierLabel: isMl ? TIER_LABELS_ML.daily_portion_control : '⚖️ Daily Portion Control',
        isProblemFood: lower.includes('excess') || lower.includes('parotta') || lower.includes('sugar') || lower.includes('pickle'),
        isSuperFood: false,
        riskSeverity: 'caution',
        riskTitle: isMl && ml ? ml.title : rule.title,
        coachWarning: isMl
          ? 'കോച്ച് സലീമിന്റെ അളവ് നിർദ്ദേശം: ദിവസവും വളരെ ചെറിയ അളവിൽ മാത്രം ഉപയോഗിക്കുക.'
          : "Coach Saleem's Portion Tip: Keep to small, controlled daily amounts.",
        clinicalReason: isMl && ml ? ml.reason : rule.reason,
        frequencyGuideline: isMl && ml ? ml.guideline : rule.guideline,
        recommendedSwap: isMl && ml
          ? { name: ml.swapName, description: ml.swapDesc, caloriesSaved: ml.swapSaved }
          : rule.swap
      };
    }
  }

  // 5. Check Daily Superfoods
  for (const rule of DAILY_SUPERFOOD_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      return {
        tier: 'daily_superfood',
        tierLabel: isMl ? TIER_LABELS_ML.daily_superfood : '🥗 Eat Daily & More Freely',
        isProblemFood: false,
        isSuperFood: true,
        riskSeverity: 'none',
        riskTitle: rule.title,
        coachWarning: '',
        clinicalReason: '',
        frequencyGuideline: isMl ? 'ദിവസവും ധൈര്യമായി കഴിക്കാവുന്ന ഉത്തമ ഭക്ഷണം' : rule.guideline,
        recommendedSwap: isMl
          ? { name: 'ഇതേ നല്ല ശീലം തുടരുക', description: 'പച്ചക്കറി സാലഡും ശുദ്ധജലവും ഒപ്പം കഴിക്കുക.' }
          : { name: 'Keep enjoying this choice', description: 'Pair with colorful salads and fresh water.' },
        healthBenefits: rule.benefits
      };
    }
  }

  // Default fallback classification based on category
  const isHealthyCategory = category === 'Vegetables' || category === 'Fruits' || category === 'Proteins';
  return {
    tier: isHealthyCategory ? 'daily_superfood' : 'daily_portion_control',
    tierLabel: isMl
      ? (isHealthyCategory ? '🥗 പോഷകസമൃദ്ധമായ ഭക്ഷണം' : '⚖️ മിതമായ അളവിൽ കഴിക്കാവുന്ന ഭക്ഷണം')
      : (isHealthyCategory ? '🥗 Whole Nutrient Food' : '⚖️ Balanced Moderate Food'),
    isProblemFood: false,
    isSuperFood: isHealthyCategory,
    riskSeverity: 'none',
    riskTitle: foodName,
    coachWarning: '',
    clinicalReason: '',
    frequencyGuideline: isMl
      ? 'പ്ലേറ്റ് നിയമം പാലിക്കുക (50% പച്ചക്കറി, 25% പ്രോട്ടീൻ, 25% ധാന്യങ്ങൾ).'
      : 'Maintain balanced plate proportions (1/2 veggies, 1/4 protein, 1/4 grains).',
    recommendedSwap: isMl
      ? { name: 'സന്തുലിത അളവ്', description: 'സാവധാനം ചവച്ചരച്ച് കഴിക്കുക.' }
      : { name: 'Wholesome portion', description: 'Eat mindfully and chew slowly.' }
  };
}

// ============================================================================
// AUDIT ALL MEAL LOGS FOR THE DAY
// ============================================================================

export function auditDailyMealLogs(
  logs: MealLogItem[],
  clientProfile?: ClientProfile,
  lang: AppLanguage = 'en'
): DailyFoodAuditSummary {
  const isMl = lang === 'ml';
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
        customAlerts.push(
          isMl
            ? '⚠️ പ്രമേഹ മുന്നറിയിപ്പ്: ഈ ഭക്ഷണം രക്തത്തിലെ പഞ്ചസാര പെട്ടെന്ന് കൂട്ടും.'
            : '⚠️ Strict Alert (Diabetes): This meal causes an acute glycemic surge.'
        );
      }
      if ((medNotes.includes('bp') || medNotes.includes('hypertens') || medNotes.includes('pressure')) && (audit.riskTitle.includes('Salt') || audit.riskTitle.includes('Pickle') || audit.riskTitle.includes('Fast Food'))) {
        customAlerts.push(
          isMl
            ? '⚠️ ബിപി മുന്നറിയിപ്പ്: ഇതിലെ ഉപ്പിന്റെ അളവ് രക്തസമ്മർദ്ദം കൂട്ടാൻ സാധ്യതയുണ്ട്.'
            : '⚠️ Strict Alert (High BP): Elevated sodium directly increases arterial blood pressure.'
        );
      }
      if ((medNotes.includes('cholesterol') || (clientProfile.visceralFat && clientProfile.visceralFat >= 10)) && (audit.tier === 'once_twice_month' || audit.riskTitle.includes('Trans Fat') || audit.riskTitle.includes('Deep-Fried'))) {
        customAlerts.push(
          isMl
            ? '⚠️ കൊളസ്ട്രോൾ / വിസറൽ ഫാറ്റ് മുന്നറിയിപ്പ്: എണ്ണയിൽ പൊരിച്ചത് കൊഴുപ്പ് കുറയ്ക്കൽ തടസ്സപ്പെടുത്തും.'
            : '⚠️ Strict Alert (High Cholesterol / Visceral Fat): Deep oil stalls fat loss and elevates arterial plaque risk.'
        );
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
  let title = isMl ? 'ഇന്ന് ഭക്ഷണമൊന്നും രേഖപ്പെടുത്തിയിട്ടില്ല' : 'No Meals Logged Today';
  let message = isMl
    ? 'കോച്ച് സലീമിന്റെ നിർദ്ദേശങ്ങൾ ലഭിക്കാൻ രാവിലത്തെയും ഉച്ചത്തെയും ഭക്ഷണങ്ങൾ രേഖപ്പെടുത്തുക.'
    : 'Log your breakfast, lunch, snacks, or dinner to receive instant clinical feedback from Coach Saleem.';
  let urgentNotice: string | undefined = undefined;

  if (logs.length > 0) {
    if (problemFoods.length > 0) {
      status = 'alert';
      title = isMl ? 'കോച്ച് സലീമിന്റെ മുന്നറിയിപ്പ്: ശ്രദ്ധ ആവശ്യമുണ്ട്' : "Coach Saleem's Clinical Caution: Attention Needed";
      message = isMl
        ? `ഇന്ന് നിയന്ത്രിക്കേണ്ട ${problemFoods.length} ഭക്ഷണം രേഖപ്പെടുത്തിയിട്ടുണ്ട്. മാസത്തിൽ 1-2 തവണ ഇവ കഴിക്കാമെങ്കിലും പതിവായി കഴിക്കുന്നത് കൊഴുപ്പ് കുറയ്ക്കാൻ തടസ്സമാകും.`
        : `You logged ${problemFoods.length} item${problemFoods.length > 1 ? 's' : ''} today that should be limited (occasional treats or high-risk foods). Occasional indulgences are acceptable 1–2 times a month, but regular consumption stalls fat loss and elevates visceral fat.`;
      urgentNotice = isMl
        ? 'താഴെയുള്ള ചുവന്ന മുന്നറിയിപ്പുകൾ പരിശോധിച്ച് നല്ല പകരക്കാർ തിരഞ്ഞെടുക്കുക!'
        : 'Review the red alerts below and choose the recommended healthy swaps for your next meal!';
    } else if (healthyFoods.length >= 3) {
      status = 'excellent';
      title = isMl ? 'കോച്ച് സലീമിന്റെ അഭിനന്ദനം: മികച്ച ഭക്ഷണക്രമം!' : "Coach Saleem's Commendation: Outstanding Nutrition!";
      message = isMl
        ? 'ഇന്നത്തെ ഭക്ഷണക്രമം വളരെ മികച്ചതാണ്! നാരുകളടങ്ങിയ പച്ചക്കറികളും നല്ല പ്രോട്ടീനും വയറ്റിലെ കൊഴുപ്പ് കുറയ്ക്കാൻ സഹായിക്കും.'
        : 'Superb discipline today! Your meal logs are loaded with fiber-rich vegetables, wholesome proteins, and clean hydration. This directly accelerates visceral fat reduction and sustained daily energy.';
    } else {
      status = 'balanced';
      title = isMl ? 'കോച്ച് സലീമിന്റെ വിലയിരുത്തൽ: സന്തുലിതമായ ദിനം' : "Coach Saleem's Progress Check: Balanced Daily Track";
      message = isMl
        ? 'ഇന്നത്തെ ഭക്ഷണം മികച്ച തുടക്കമാണ്. പ്ലേറ്റിന്റെ പകുതി പച്ചക്കറികളും പഴങ്ങളും ചേർക്കുകയും 1 ഗ്ലാസ് സംഭാരം കുടിക്കുകയും ചെയ്യുക.'
        : 'Solid baseline logs for today. To hit optimal results, ensure half your plate consists of vegetables/fruits and incorporate 1 serving of buttermilk or moong sprouts.';
    }
  }

  // Next Good Options (arranged by clinical logic)
  const arrangedGoodOptions = isMl
    ? [
        {
          mealSlot: 'വൈകുന്നേരത്തെ ലഘുഭക്ഷണം (4:00 PM - 5:30 PM)',
          title: 'ചായ സമയത്തെ ആരോഗ്യകരമായ മാറ്റം',
          recommendedFoods: ['മസാല സംഭാരം (മോര്)', '1 പിടി വറുത്ത ചെറുപയർ / മഖാന', 'ആവിയിൽ വേവിച്ച ഇല അട'],
          benefit: 'എണ്ണയിൽ പൊരിച്ച 150 കലോറി ഒഴിവാക്കുകയും വൈകുന്നേരത്തെ വിശപ്പ് നിയന്ത്രിക്കുകയും ചെയ്യുന്നു.',
          prepTip: 'തണുത്ത മോരിൽ ഇഞ്ചി, പച്ചമുളക്, കറിവേപ്പില എന്നിവ ചതച്ചു ചേർത്ത് കുടിക്കുക.'
        },
        {
          mealSlot: 'രാത്രി ഭക്ഷണം (7:30 PM - 8:30 PM)',
          title: 'ലഘുവായ രാത്രി ഭക്ഷണം',
          recommendedFoods: ['2 ഗോതമ്പ് ചപ്പാത്തി അല്ലെങ്കിൽ 1 അപ്പം', 'ചീര / കാബേജ് തോരൻ', '2 പുഴുങ്ങിയ മുട്ട അല്ലെങ്കിൽ കുടമ്പുളി മീൻ കറി'],
          benefit: 'രാത്രിയിൽ രക്തത്തിലെ പഞ്ചസാര കൂടാതെ പേശികളുടെ ആരോഗ്യം സംരക്ഷിക്കുന്നു.',
          prepTip: 'ചപ്പാത്തിക്ക് മുമ്പ് പച്ചക്കറി സാലഡും പ്രോട്ടീനും ആദ്യം കഴിക്കുക.'
        },
        {
          mealSlot: 'വെള്ളവും ഉദര ആരോഗ്യവും',
          title: 'ദിവസേന വെള്ളം & പ്രോബയോട്ടിക് നിയമം',
          recommendedFoods: ['3 ലിറ്റർ ശുദ്ധജലം', '1 ഗ്ലാസ് സംഭാരം', 'ജീരകവെള്ളം'],
          benefit: 'ദഹനം മെച്ചപ്പെടുത്തുകയും കൊഴുപ്പ് വേഗത്തിൽ കത്തിക്കുകയും ചെയ്യുന്നു.',
          prepTip: '1 ലിറ്റർ ബോട്ടിൽ കൂടെ കരുതി വൈകിട്ട് 7 മണിക്ക് മുമ്പ് 3 തവണ നിറച്ചു കുടിക്കുക.'
        }
      ]
    : [
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

export const CLINICAL_FOOD_ENCYCLOPEDIA_ML: typeof CLINICAL_FOOD_ENCYCLOPEDIA = {
  tiers: [
    {
      id: 'strict_avoid',
      badge: 'പൂർണ്ണമായി ഒഴിവാക്കുക',
      color: 'rose',
      title: 'പൂർണ്ണമായി ഒഴിവാക്കേണ്ടതോ കർശനമായി നിയന്ത്രിക്കേണ്ടതോ ആയ ഭക്ഷണങ്ങൾ',
      subtitle: 'ഹൃദയത്തിനും കരളിനും കടുത്ത ദോഷം ചെയ്യുന്നവ',
      items: [
        {
          name: 'മധുരപാനീയങ്ങളും എനർജി ഡ്രിങ്കുകളും',
          details: 'കോള, സോഡ, പാക്കറ്റ് ജ്യൂസുകൾ, എനർജി ഡ്രിങ്കുകൾ (Red Bull, Sting).',
          danger: 'കരൾ വീക്കത്തിനും (Fatty Liver) രക്തത്തിലെ പഞ്ചസാര കൂടാനും വയറിലെ കൊഴുപ്പിനും കാരണമാകുന്നു.'
        },
        {
          name: 'മദ്യവും പുകയിലയും',
          details: 'ആരോഗ്യത്തിന് സുരക്ഷിതമായ അളവൊന്നും ഇതിലില്ല.',
          danger: 'കരളിന്റെ കൊഴുപ്പ് ദഹനത്തെ തടയുകയും ശരീരത്തിൽ വീക്കം ഉണ്ടാക്കുകയും ചെയ്യുന്നു.'
        },
        {
          name: 'ട്രാൻസ് ഫാറ്റ് (വനസ്പതി, ഡാൽഡ)',
          details: 'ബേക്കറി പലഹാരങ്ങളിലും കൃത്രിമ വെണ്ണയിലും അടങ്ങിയ ഹൈഡ്രജനേറ്റഡ് കൊഴുപ്പ്.',
          danger: 'ചീത്ത കൊളസ്ട്രോൾ (LDL) വർദ്ധിപ്പിക്കുകയും രക്തക്കുഴലുകളിൽ തടസ്സമുണ്ടാക്കുകയും ചെയ്യുന്നു.'
        },
        {
          name: 'കരിഞ്ഞ ഭക്ഷണങ്ങൾ',
          details: 'കൂടുതലായി കരിഞ്ഞ ഗ്രിൽഡ് മാംസവും പൊള്ളിച്ച ഭക്ഷണങ്ങളും.',
          danger: 'കാൻസറിന് കാരണമായേക്കാവുന്ന വിഷരാസവസ്തുക്കൾ ഉണ്ടാക്കുന്നു.'
        },
        {
          name: 'വീണ്ടും ചൂടാക്കിയ എണ്ണയിലെ പലഹാരങ്ങൾ',
          details: 'ഒരേ എണ്ണ പലതവണ ചൂടാക്കി പൊരിച്ചെടുക്കുന്ന തട്ടുകട ഭക്ഷണങ്ങൾ.',
          danger: 'ഉദരരോഗങ്ങൾക്കും കരളിനും കടുത്ത ദോഷം ചെയ്യുന്ന വിഷാംശം അടങ്ങിയിട്ടുണ്ട്.'
        }
      ]
    },
    {
      id: 'once_twice_month',
      badge: 'മാസത്തിൽ 1–2 തവണ മാത്രം',
      color: 'red',
      title: 'മാസത്തിൽ ഒന്നോ രണ്ടോ തവണ മാത്രം കഴിക്കേണ്ടവ',
      subtitle: 'വല്ലപ്പോഴുമുള്ള ആഘോഷങ്ങൾക്ക് മാത്രം — പതിവാക്കിയാൽ അമിതവണ്ണം ഉണ്ടാകും',
      items: [
        {
          name: 'എണ്ണയിൽ വറുത്ത തെരുവോര ഭക്ഷണങ്ങളും ഫാസ്റ്റ് ഫുഡും',
          details: 'ബർഗർ, ഫ്രൈഡ് ചിക്കൻ, സമൂസ, പക്കോട, പഫ്സ്, മയോണൈസ് ഷവർമ.',
          danger: 'അമിതമായ കൊഴുപ്പും ഉപ്പും; ഹൃദ്രോഗത്തിനും ഫാറ്റി ലിവറിനും പ്രധാന കാരണം.'
        },
        {
          name: 'മധുരപലഹാരങ്ങളും കേക്കുകളും',
          details: 'ജിലേബി, ഗുലാബ് ജാമുൻ, ലഡ്ഡു, ഹൽവ, കേക്ക്, ഐസ്ക്രീം.',
          danger: 'ശുദ്ധീകരിച്ച പഞ്ചസാരയും കൊഴുപ്പും മാത്രം; ഇൻസുലിൻ പ്രതിരോധം വർദ്ധിപ്പിക്കുന്നു.'
        },
        {
          name: 'പാക്കറ്റ് ബിസ്കറ്റുകൾ, ചിപ്സ്, ഇൻസ്റ്റന്റ് നൂഡിൽസ്',
          details: 'ഉയർന്ന അളവിൽ സംസ്കരിച്ച പാക്കറ്റ് ലഘുഭക്ഷണങ്ങൾ.',
          danger: 'മൈദയും പാമോയിലും അമിതമായ ഉപ്പും മാത്രം; പോഷകങ്ങൾ തീരെയില്ല.'
        }
      ]
    },
    {
      id: 'once_twice_week',
      badge: 'ആഴ്ചയിൽ 1–2 തവണ മാത്രം',
      color: 'amber',
      title: 'ആഴ്ചയിൽ ഒന്നോ രണ്ടോ തവണയായി നിയന്ത്രിക്കേണ്ടവ',
      subtitle: 'രുചികരമാണെങ്കിലും കലോറിയും സാച്ചുറേറ്റഡ് കൊഴുപ്പും കൂടുതലുള്ളവ',
      items: [
        {
          name: 'റെഡ് മീറ്റ് (ബീഫ്, മട്ടൺ, പോർക്ക്)',
          details: 'ആഴ്ചയിൽ പരമാവധി 350–500 ഗ്രാം പാകം ചെയ്ത അളവിൽ മാത്രം.',
          danger: 'അമിതമായാൽ ഹൃദ്രോഗം, കാൻസർ, യൂറിക് ആസിഡ് എന്നിവ കൂടാൻ സാധ്യത.'
        },
        {
          name: 'പ്രോസസ് ചെയ്ത മാംസം (സോസേജ്, നഗ്ഗറ്റ്സ്, ബേക്കൺ)',
          details: 'WHO ഗ്രൂപ്പ് 1 കാർസിനോജനായി പട്ടികപ്പെടുത്തിയത്.',
          danger: 'കൃത്രിമ പ്രിസർവേറ്റീവുകൾ അടങ്ങിയിരിക്കുന്നതിനാൽ വളരെ അപൂർവ്വമായി മാത്രം കഴിക്കുക.'
        },
        {
          name: 'ബിരിയാണിയും എണ്ണയേറിയ കറികളും',
          details: 'ഒരു പ്ലേറ്റ് ബിരിയാണിയിൽ 800–1100 കലോറി വരെ ഉണ്ടാകും.',
          danger: 'ഒരാഴ്ചത്തെ കലോറി നിയന്ത്രണം ഒരൊറ്റ നേരത്തെ ഭക്ഷണം കൊണ്ട് നഷ്ടപ്പെടാം.'
        },
        {
          name: 'എണ്ണയിൽ വറുത്ത മീൻ (Fish Fry)',
          details: 'പൊരിക്കുന്നതിന് പകരം കറി വെക്കുകയോ ആവിയിൽ വേവിക്കുകയോ ചെയ്യുക.',
          danger: 'വറുക്കുമ്പോൾ നല്ല ഒമേഗ-3 നശിക്കുകയും 120+ കലോറി എണ്ണ കൂടുതലാകുകയും ചെയ്യുന്നു.'
        },
        {
          name: 'വലിയ കടൽ മത്സ്യങ്ങൾ (സ്രാവ്, വലിയ നെയ്മീൻ)',
          details: 'ഗർഭിണികളും കുട്ടികളും വളരെ കുറച്ച് മാത്രം കഴിക്കുക.',
          danger: 'മെർക്കുറി (Mercury) അളവ് കൂടുതലാകാൻ സാധ്യതയുള്ളതിനാൽ ചെറിയ മീനുകളാണ് നല്ലത്.'
        }
      ]
    },
    {
      id: 'daily_portion',
      badge: 'ദിവസവും ചെറിയ അളവിൽ',
      color: 'yellow',
      title: 'ദിവസവും മിതമായ അളവിൽ മാത്രം ഉപയോഗിക്കേണ്ടവ',
      subtitle: 'ദൈനംദിന ഭക്ഷണത്തിൽ അളവ് നിയന്ത്രിക്കേണ്ട പ്രധാന ഘടകങ്ങൾ',
      items: [
        {
          name: 'പഞ്ചസാര',
          details: 'ദിവസവും പരമാവധി 6 ടീസ്പൂൺ (25 ഗ്രാം) അല്ലെങ്കിൽ അതിലും കുറവ്.',
          danger: 'ചായയിലും കാപ്പിയിലും പാക്കറ്റ് ഭക്ഷണങ്ങളിലുമുള്ള മധുരം കൂടി കണക്കാക്കണം.'
        },
        {
          name: 'ഉപ്പ് (സോഡിയം)',
          details: 'ദിവസവും 5 ഗ്രാമിൽ (1 ടീസ്പൂൺ) താഴെ മാത്രം.',
          danger: 'അച്ചാർ, പപ്പടം, സോസുകൾ എന്നിവയിലെ ഉപ്പ് രക്തസമ്മർദ്ദം കൂട്ടും.'
        },
        {
          name: 'പാചക എണ്ണ',
          details: 'ഒരാൾക്ക് ദിവസവും 3–4 ടീസ്പൂൺ (15–20 മില്ലി) മാത്രം.',
          danger: 'ഒരു ടേബിൾസ്പൂൺ എണ്ണയിൽ 120 കലോറി ഉണ്ട്; സ്പൂൺ ഉപയോഗിച്ച് അളക്കുക.'
        },
        {
          name: 'ചായയും കാപ്പിയും',
          details: 'ദിവസവും 2–3 കപ്പ് മാത്രം; ഉറക്കത്തിന് മുമ്പ് ഒഴിവാക്കുക.',
          danger: 'വെള്ള പഞ്ചസാര ചേർക്കാതെ കുടിക്കുന്നതാണ് ഉത്തമം.'
        },
        {
          name: 'മുട്ട',
          details: 'ആരോഗ്യമുള്ളവർക്ക് ദിവസം 1 മുട്ട കഴിക്കാം.',
          danger: 'ഉയർന്ന കൊളസ്ട്രോളോ പ്രമേഹമോ ഉള്ളവർ ഡോക്ടറുടെ നിർദ്ദേശം തേടുക.'
        },
        {
          name: 'പാലും പാലുൽപ്പന്നങ്ങളും',
          details: 'ദിവസവും 2–3 തവണ മതി. കൊഴുപ്പ് കുറഞ്ഞ തൈരോ മോരോ തിരഞ്ഞെടുക്കുക.',
          danger: 'അമിതമായാൽ ശരീരത്തിൽ കൊഴുപ്പ് കൂടാം.'
        },
        {
          name: 'പഴച്ചാറുകൾ (Fruit Juice)',
          details: 'ജ്യൂസിനേക്കാൾ നല്ലത് നാരുകളോട് കൂടിയ മുഴുവൻ പഴം കഴിക്കുന്നതാണ്.',
          danger: 'ജ്യൂസിൽ നാരുകൾ നഷ്ടപ്പെടുന്നതിനാൽ പഞ്ചസാര പെട്ടെന്ന് കൂടും.'
        },
        {
          name: 'നട്സ് & സീഡ്സ്',
          details: 'ദിവസവും ഒരു പിടി (ഏകദേശം 30 ഗ്രാം).',
          danger: 'ആരോഗ്യകരമാണെങ്കിലും കലോറി വളരെ കൂടുതലാണ്.'
        },
        {
          name: 'ചോറും മൈദയും',
          details: 'അളവ് നിയന്ത്രിച്ച് പച്ചക്കറികളോടും ധാന്യങ്ങളോടും കൂടി കഴിക്കുക.',
          danger: 'ചോറ് മാത്രം അമിതമായി കഴിക്കുന്നത് പഞ്ചസാര കൂട്ടും.'
        }
      ]
    },
    {
      id: 'daily_superfoods',
      badge: 'ദിവസവും ധൈര്യമായി കഴിക്കാം',
      color: 'emerald',
      title: 'ദിവസവും നിർഭയം കഴിക്കാവുന്ന സൂപ്പർഫുഡുകൾ',
      subtitle: 'ദീർഘകാല ആരോഗ്യത്തിനും പേശീബലത്തിനും ശരീരഭാരം കുറയ്ക്കാനുമുള്ള അടിത്തറ',
      items: [
        {
          name: 'പച്ചക്കറികളും ഇലക്കറികളും മുഴുവൻ പഴങ്ങളും',
          details: 'ചീര, കാബേജ്, ബീൻസ്, മുരിങ്ങയില, വെള്ളരിക്ക, പേരക്ക, പപ്പായ, ആപ്പിൾ.',
          danger: 'ഉയർന്ന നാരുകളും വിറ്റാമിനുകളും ദഹനത്തെ സഹായിക്കും.'
        },
        {
          name: 'പയറുവർഗ്ഗങ്ങളും പരിപ്പും കടലയും',
          details: 'ചെറുപയർ, കടല, പരിപ്പ്, രാജ്‌മ, മുളപ്പിച്ച പയറുകൾ.',
          danger: 'സസ്യാഹാര പ്രോട്ടീനും ദീർഘനേരത്തെ ഊർജ്ജവും നൽകുന്നു.'
        },
        {
          name: 'തവിടുള്ള ധാന്യങ്ങളും മില്ലറ്റുകളും',
          details: 'കേരള മട്ട അരി, ഓട്സ്, റാഗി, ഗോതമ്പ്, ബാർലി.',
          danger: 'രക്തത്തിലെ പഞ്ചസാര സ്ഥിരമായി നിലനിർത്തുന്നു.'
        },
        {
          name: 'തൈരും സംഭാരവും (മോര്)',
          details: 'ഇഞ്ചിയും കറിവേപ്പിലയും ചേർത്ത സംഭാരം.',
          danger: 'ഉദരത്തിലെ നല്ല ബാക്ടീരിയകളെ വളർത്തുകയും ദഹനം എളുപ്പമാക്കുകയും ചെയ്യുന്നു.'
        },
        {
          name: 'ശുദ്ധമായ കുടിവെള്ളം',
          details: 'ദിവസവും 2.5 മുതൽ 3.5 ലിറ്റർ വരെ.',
          danger: 'ശരീരത്തിലെ മാലിന്യങ്ങൾ പുറന്തള്ളാനും കൊഴുപ്പ് കത്തിക്കാനും അനിവാര്യം.'
        }
      ]
    }
  ],
  goldenRules: [
    {
      title: 'രോഗാവസ്ഥകൾക്കനുസരിച്ച് അളവ് മാറും',
      description: 'പ്രമേഹം, രക്തസമ്മർദ്ദം, കൊളസ്ട്രോൾ, ഫാറ്റി ലിവർ തുടങ്ങിയവ ഉള്ളവർ കോച്ച് സലീമിന്റെയും ഡോക്ടറുടെയും പ്രത്യേക നിർദ്ദേശങ്ങൾ കർശനമായി പാലിക്കുക.'
    },
    {
      title: 'നല്ല ഭക്ഷണവും അമിതമായാൽ ദോഷം',
      description: 'നട്സ്, മാമ്പഴം, പ്രോട്ടീൻ തുടങ്ങിയ ആരോഗ്യകരമായ ഭക്ഷണങ്ങൾ പോലും അമിതമായാൽ ഭാരം കൂടാൻ ഇടയാക്കും.'
    },
    {
      title: 'വൈവിധ്യമാർന്ന സമീകൃത പ്ലേറ്റ്',
      description: 'ഓരോ പ്രധാന ഭക്ഷണത്തിലും 50% പച്ചക്കറികളും പഴങ്ങളും, 25% നല്ല പ്രോട്ടീൻ, 25% ധാന്യങ്ങൾ എന്ന ക്രമം പാലിക്കുക.'
    },
    {
      title: 'വല്ലപ്പോഴുമുള്ള വിരുന്നിൽ കുറ്റബോധം വേണ്ട',
      description: 'ദിവസേനയുള്ള നല്ല ശീലങ്ങളാണ് പ്രധാനം. മാസത്തിലൊരിക്കൽ ഇഷ്ടമുള്ള ഭക്ഷണം കഴിച്ചാൽ വിഷമിക്കാതെ അടുത്ത നേരം മുതൽ സാധാരണ ഡയറ്റിലേക്ക് മടങ്ങുക.'
    }
  ]
};

export function getClinicalFoodEncyclopedia(lang: AppLanguage = 'en') {
  return lang === 'ml' ? CLINICAL_FOOD_ENCYCLOPEDIA_ML : CLINICAL_FOOD_ENCYCLOPEDIA;
}
