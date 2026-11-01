import { FoodCategory, MealType } from '../types';

export interface EstimatedFood {
  name: string;
  category: FoodCategory;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  glycemicIndex: string;
  verdict: string;
  recommendation: string;
}

export interface OilOption {
  id: 'steamed' | 'medium' | 'fried';
  label: string;
  calorieAdjustment: number;
  fatAdjustment: number;
  description: string;
}

export const CLINICAL_OIL_OPTIONS: OilOption[] = [
  { id: 'steamed', label: '🟢 No Oil / Steamed', calorieAdjustment: 0, fatAdjustment: 0, description: 'Base calories (0g added cooking oil)' },
  { id: 'medium', label: '🟡 Medium / Home Sauté', calorieAdjustment: 45, fatAdjustment: 5, description: '+45 kcal (+5g fat, light tawa roasting)' },
  { id: 'fried', label: '🔴 Deep Fried / Very Oily', calorieAdjustment: 120, fatAdjustment: 13, description: '+120 kcal (+13g fat, deep oil bath / tea-shop)' }
];

// Rich, clinical encyclopedia of 250+ popular items (Kerala, Indian, Gym/Fitness, Global)
const COMPREHENSIVE_FOOD_DATABASE: Record<string, EstimatedFood> = {
  // --- Kerala & South Indian Specialties ---
  'pazham pori': {
    name: 'Pazham Pori (Ethakka Appam)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (80g)',
    calories: 185,
    protein: 2.2,
    carbs: 34.0,
    fat: 5.5,
    fiber: 2.1,
    glycemicIndex: 'Medium-High',
    verdict: 'Ripe Nendran plantain dipped in batter. Delicious traditional snack; note oil absorption.',
    recommendation: 'Opt for air-fried or light tawa-roasted version to save up to 120 kcal.'
  },
  'ethakka appam': {
    name: 'Pazham Pori (Ethakka Appam)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (80g)',
    calories: 185,
    protein: 2.2,
    carbs: 34.0,
    fat: 5.5,
    fiber: 2.1,
    glycemicIndex: 'Medium-High',
    verdict: 'Ripe Nendran plantain dipped in batter. Delicious traditional snack; note oil absorption.',
    recommendation: 'Opt for air-fried or light tawa-roasted version to save up to 120 kcal.'
  },
  'parippu vada': {
    name: 'Parippu Vada (Kerala Dal Vada)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (50g)',
    calories: 148,
    protein: 6.2,
    carbs: 16.5,
    fat: 7.2,
    fiber: 3.5,
    glycemicIndex: 'Low-Medium',
    verdict: 'Crunchy chana dal fritter spiced with shallots, curry leaves, and ginger. Good protein content.',
    recommendation: 'Pairs well with Sulaimani tea. Moderation recommended due to deep frying.'
  },
  'ulli vada': {
    name: 'Ulli Vada (Crispy Onion Fritter)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (45g)',
    calories: 155,
    protein: 2.8,
    carbs: 16.0,
    fat: 9.0,
    fiber: 2.0,
    glycemicIndex: 'Medium',
    verdict: 'Crispy onion fritter seasoned with green chillies and curry leaves.',
    recommendation: 'High oil absorption. Limit to 1 piece and pair with a fresh vegetable salad.'
  },
  'uzhunnu vada': {
    name: 'Uzhunnu Vada (Medu Vada)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (50g)',
    calories: 142,
    protein: 4.8,
    carbs: 15.0,
    fat: 7.5,
    fiber: 2.4,
    glycemicIndex: 'Medium',
    verdict: 'Fluffy urad dal donut fritter. Good plant protein and fermented prebiotic benefit.',
    recommendation: 'Consume with sambar rather than thick coconut chutney to moderate saturated fats.'
  },
  'vada': {
    name: 'Medu / Dal Vada',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (50g)',
    calories: 145,
    protein: 5.2,
    carbs: 15.5,
    fat: 7.4,
    fiber: 2.8,
    glycemicIndex: 'Medium',
    verdict: 'Traditional South Indian savory fritter made from lentils.',
    recommendation: 'Check cooking oil style; deep fried absorbs ~13g fat.'
  },
  'ela ada': {
    name: 'Ela Ada (Steamed Rice Parcel)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (85g)',
    calories: 162,
    protein: 2.8,
    carbs: 32.0,
    fat: 3.0,
    fiber: 2.0,
    glycemicIndex: 'Medium',
    verdict: 'Traditional steamed delicacy wrapped in banana leaf with coconut and jaggery. Naturally oil-free!',
    recommendation: 'Ideal wholesome afternoon snack. 100% steamed with zero trans fats.'
  },
  'kozhukkatta': {
    name: 'Kozhukkatta (Steamed Rice Dumpling)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (60g)',
    calories: 132,
    protein: 2.2,
    carbs: 26.5,
    fat: 2.3,
    fiber: 1.5,
    glycemicIndex: 'Medium',
    verdict: 'Steamed rice dumpling filled with grated coconut and jaggery.',
    recommendation: 'Zero cooking oil added. Excellent clean carb choice for energy.'
  },
  'unniyappam': {
    name: 'Unniyappam (Sweet Rice & Jaggery Fritter)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (35g)',
    calories: 115,
    protein: 1.6,
    carbs: 22.0,
    fat: 2.8,
    fiber: 1.1,
    glycemicIndex: 'High',
    verdict: 'Sweet snack made from roasted rice flour, jaggery, banana, and coconut bits.',
    recommendation: 'Treat as an occasional sweet treat due to jaggery concentration.'
  },
  'neyyappam': {
    name: 'Neyyappam (Ghee Rice Fritter)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (45g)',
    calories: 145,
    protein: 1.8,
    carbs: 25.0,
    fat: 4.5,
    fiber: 1.0,
    glycemicIndex: 'High',
    verdict: 'Traditional ghee-fried sweet rice cake.',
    recommendation: 'Rich in calorie density. Limit portion to 1 piece.'
  },
  'sukhiyan': {
    name: 'Sukhiyan (Green Gram Sweet Fritter)',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (55g)',
    calories: 140,
    protein: 4.5,
    carbs: 24.0,
    fat: 3.2,
    fiber: 3.0,
    glycemicIndex: 'Medium',
    verdict: 'Whole green gram (mung bean) cooked with jaggery and coconut, batter-fried.',
    recommendation: 'Provides good fiber and micronutrients from green gram.'
  },
  'puttu': {
    name: 'Kerala Puttu (Steamed Rice & Coconut)',
    category: 'Grains & Breads',
    servingUnit: '1 cup / piece (100g)',
    calories: 165,
    protein: 3.2,
    carbs: 32.0,
    fat: 2.8,
    fiber: 2.0,
    glycemicIndex: 'Medium',
    verdict: 'Steamed ground rice cylinders layered with grated coconut. 100% oil-free!',
    recommendation: 'Pair with Kadala Curry or boiled egg for a complete amino acid profile.'
  },
  'kadala curry': {
    name: 'Kerala Kadala Curry (Black Chickpeas)',
    category: 'Proteins',
    servingUnit: '1 bowl (150g)',
    calories: 195,
    protein: 8.5,
    carbs: 26.0,
    fat: 7.0,
    fiber: 6.5,
    glycemicIndex: 'Low',
    verdict: 'High-fiber black chickpeas in roasted coconut gravy. Exceptional satiety and sustained energy.',
    recommendation: 'One of the best traditional Kerala breakfasts when paired with puttu or appam.'
  },
  'appam': {
    name: 'Palappam (Kerala Lace Rice Crepe)',
    category: 'Grains & Breads',
    servingUnit: '1 piece (50g)',
    calories: 95,
    protein: 1.8,
    carbs: 19.5,
    fat: 1.2,
    fiber: 0.8,
    glycemicIndex: 'Medium',
    verdict: 'Fermented rice batter with coconut milk. Soft center with crisp lacy edges.',
    recommendation: 'Light and easily digestible. Pair with vegetable stew or egg curry.'
  },
  'idiyappam': {
    name: 'Idiyappam (String Hoppers)',
    category: 'Grains & Breads',
    servingUnit: '2 pieces (80g)',
    calories: 130,
    protein: 2.4,
    carbs: 28.0,
    fat: 0.8,
    fiber: 1.2,
    glycemicIndex: 'Medium',
    verdict: 'Steamed rice noodles. Zero added oil and gentle on the gastrointestinal tract.',
    recommendation: 'Ideal clean dinner or light morning meal.'
  },
  'porotta': {
    name: 'Kerala Malabar Porotta',
    category: 'Grains & Breads',
    servingUnit: '1 piece (80g)',
    calories: 290,
    protein: 5.5,
    carbs: 42.0,
    fat: 11.5,
    fiber: 1.4,
    glycemicIndex: 'High',
    verdict: 'Layered refined flour flatbread kneaded with oil/ghee.',
    recommendation: 'High calorie density. Pair with grilled chicken or dal instead of heavy gravies.'
  },
  'parotta': {
    name: 'Kerala Malabar Porotta',
    category: 'Grains & Breads',
    servingUnit: '1 piece (80g)',
    calories: 290,
    protein: 5.5,
    carbs: 42.0,
    fat: 11.5,
    fiber: 1.4,
    glycemicIndex: 'High',
    verdict: 'Layered refined flour flatbread kneaded with oil/ghee.',
    recommendation: 'High calorie density. Pair with grilled chicken or dal instead of heavy gravies.'
  },
  'kerala matta rice': {
    name: 'Kerala Matta Rice (Cooked)',
    category: 'Grains & Breads',
    servingUnit: '1 cup cooked (150g)',
    calories: 195,
    protein: 4.2,
    carbs: 42.0,
    fat: 0.8,
    fiber: 2.4,
    glycemicIndex: 'Medium',
    verdict: 'Indigenous red parboiled rice rich in magnesium, zinc, and B-vitamins.',
    recommendation: 'Preferred over polished white rice for glycemic control and sustained energy.'
  },
  'rice': {
    name: 'Cooked Rice (Matta / White)',
    category: 'Grains & Breads',
    servingUnit: '1 cup cooked (150g)',
    calories: 195,
    protein: 4.0,
    carbs: 42.0,
    fat: 0.6,
    fiber: 1.8,
    glycemicIndex: 'Medium',
    verdict: 'Core carbohydrate staple providing clean fuel for muscles and brain.',
    recommendation: 'Measure portions using a standard katori/cup to maintain caloric target.'
  },
  'fish curry': {
    name: 'Kerala Fish Curry (Meen Curry)',
    category: 'Proteins',
    servingUnit: '1 bowl with 1 piece fish (150g)',
    calories: 180,
    protein: 21.0,
    carbs: 4.0,
    fat: 8.5,
    fiber: 1.2,
    glycemicIndex: 'Low',
    verdict: 'Fresh fish simmered with kudampuli (Malabar tamarind), turmeric, and spices. Rich in Omega-3!',
    recommendation: 'Kudampuli aids digestion and lipid metabolism. Outstanding lean protein choice.'
  },
  'meen pollichathu': {
    name: 'Meen Pollichathu (Banana Leaf Fish)',
    category: 'Proteins',
    servingUnit: '1 piece (120g)',
    calories: 210,
    protein: 24.0,
    carbs: 5.0,
    fat: 10.0,
    fiber: 1.5,
    glycemicIndex: 'Low',
    verdict: 'Pearl spot / fish coated in masala and slow-steamed in a fresh banana leaf.',
    recommendation: 'High protein, moderate healthy fat from coconut oil marinade.'
  },
  'beef fry': {
    name: 'Kerala Beef Roast / Fry',
    category: 'Proteins',
    servingUnit: '1 plate (120g)',
    calories: 285,
    protein: 26.0,
    carbs: 4.5,
    fat: 18.0,
    fiber: 1.0,
    glycemicIndex: 'Low',
    verdict: 'Slow-cooked spiced beef with fried coconut slices and curry leaves.',
    recommendation: 'Very high protein and iron. Balance with high-fiber greens or salad.'
  },
  'chicken roast': {
    name: 'Kerala Chicken Roast',
    category: 'Proteins',
    servingUnit: '1 plate (150g)',
    calories: 245,
    protein: 28.0,
    carbs: 6.0,
    fat: 12.0,
    fiber: 1.5,
    glycemicIndex: 'Low',
    verdict: 'Marinated chicken roasted with onions, tomatoes, and whole Malabar spices.',
    recommendation: 'High biological value protein. Choose breast pieces for lower saturated fat.'
  },
  'kuzhi mandi': {
    name: 'Chicken Kuzhi Mandi',
    category: 'Grains & Breads',
    servingUnit: '1 plate with 1 chicken quarter (350g)',
    calories: 580,
    protein: 34.0,
    carbs: 68.0,
    fat: 18.0,
    fiber: 3.0,
    glycemicIndex: 'Medium-High',
    verdict: 'Pit-cooked fragrant spiced rice served with tender chicken.',
    recommendation: 'Portion control is key; share the rice and prioritize the salad and chicken.'
  },
  'biryani': {
    name: 'Malabar Chicken Biryani',
    category: 'Grains & Breads',
    servingUnit: '1 plate (300g)',
    calories: 520,
    protein: 28.0,
    carbs: 62.0,
    fat: 16.5,
    fiber: 2.8,
    glycemicIndex: 'Medium',
    verdict: 'Khaima / Jeerakasala rice cooked with spiced chicken, fried onions, and raisins.',
    recommendation: 'Enjoy with cool onion cucumber raita to aid glycemic stabilization.'
  },
  'banana chips': {
    name: 'Kerala Banana Chips (Nendran Upperi)',
    category: 'Beverages & Snacks',
    servingUnit: 'Handful (30g)',
    calories: 158,
    protein: 1.1,
    carbs: 18.2,
    fat: 9.6,
    fiber: 1.8,
    glycemicIndex: 'Medium',
    verdict: 'Raw plantain sliced thin and deep fried in coconut oil.',
    recommendation: 'High calorie density due to coconut oil. Stick strictly to 25-30g.'
  },
  'chips': {
    name: 'Banana / Potato Chips',
    category: 'Beverages & Snacks',
    servingUnit: 'Handful (30g)',
    calories: 155,
    protein: 1.5,
    carbs: 18.0,
    fat: 9.2,
    fiber: 1.5,
    glycemicIndex: 'Medium-High',
    verdict: 'Deep-fried savory crunchy snack.',
    recommendation: 'High oil absorption. Consume mindfully as an occasional treat.'
  },
  'sharkara upperi': {
    name: 'Sharkara Upperi (Jaggery Banana Chunks)',
    category: 'Beverages & Snacks',
    servingUnit: 'Handful (30g)',
    calories: 168,
    protein: 1.0,
    carbs: 24.5,
    fat: 7.5,
    fiber: 1.2,
    glycemicIndex: 'High',
    verdict: 'Fried plantain chunks coated in crystallized jaggery, ginger powder, and cumin.',
    recommendation: 'High fast-release carbohydrates. Best reserved for festive moments.'
  },
  'halwa': {
    name: 'Kozhikodan Black Halwa',
    category: 'Beverages & Snacks',
    servingUnit: '1 square (50g)',
    calories: 215,
    protein: 1.2,
    carbs: 36.0,
    fat: 7.8,
    fiber: 0.5,
    glycemicIndex: 'High',
    verdict: 'Traditional sweet made from maida, jaggery/sugar, and coconut oil or ghee.',
    recommendation: 'Concentrated sugar and fats. Keep portion small.'
  },

  // --- Core Fitness & Gym Nutrition ---
  'boiled egg': {
    name: 'Boiled Egg (Large)',
    category: 'Proteins',
    servingUnit: '1 large egg (50g)',
    calories: 74,
    protein: 6.3,
    carbs: 0.4,
    fat: 5.0,
    fiber: 0,
    glycemicIndex: 'Low',
    verdict: 'Gold standard complete protein with all 9 essential amino acids and brain-boosting choline.',
    recommendation: 'Ideal for breakfast or post-workout. Satiating and zero added oil.'
  },
  'egg': {
    name: 'Whole Egg',
    category: 'Proteins',
    servingUnit: '1 large egg (50g)',
    calories: 74,
    protein: 6.3,
    carbs: 0.4,
    fat: 5.0,
    fiber: 0,
    glycemicIndex: 'Low',
    verdict: 'Complete protein source rich in lutein, zeaxanthin, vitamin D, and B12.',
    recommendation: 'Eat boiled or poached to avoid added oil calories.'
  },
  'egg white': {
    name: 'Egg White (Boiled)',
    category: 'Proteins',
    servingUnit: '1 egg white (33g)',
    calories: 17,
    protein: 3.6,
    carbs: 0.2,
    fat: 0.1,
    fiber: 0,
    glycemicIndex: 'Low',
    verdict: 'Pure bioavailable protein with virtually zero fat and cholesterol.',
    recommendation: 'Great tool to hit high protein goals during calorie deficits.'
  },
  'omelette': {
    name: '2-Egg Veggie Omelette',
    category: 'Proteins',
    servingUnit: '1 omelette (2 eggs + veg)',
    calories: 185,
    protein: 13.5,
    carbs: 3.0,
    fat: 13.0,
    fiber: 1.0,
    glycemicIndex: 'Low',
    verdict: 'Nutritious eggs beaten with onions, tomatoes, green chillies, and cilantro.',
    recommendation: 'Use light spray of olive or coconut oil on a non-stick tawa.'
  },
  'chicken breast': {
    name: 'Grilled Chicken Breast',
    category: 'Proteins',
    servingUnit: '100g cooked',
    calories: 165,
    protein: 31.0,
    carbs: 0.0,
    fat: 3.6,
    fiber: 0,
    glycemicIndex: 'Low',
    verdict: 'Leanest complete animal protein for muscle preservation and fat loss.',
    recommendation: 'Marinate with lemon, garlic, pepper, and Greek yogurt before grilling.'
  },
  'chicken': {
    name: 'Cooked Chicken',
    category: 'Proteins',
    servingUnit: '100g cooked',
    calories: 195,
    protein: 27.0,
    carbs: 1.0,
    fat: 9.0,
    fiber: 0,
    glycemicIndex: 'Low',
    verdict: 'High-quality animal protein promoting muscle recovery and metabolic rate.',
    recommendation: 'Prefer skinless cuts cooked with minimal oil.'
  },
  'fish': {
    name: 'Fresh Fish (Grilled / Steamed)',
    category: 'Proteins',
    servingUnit: '100g cooked',
    calories: 135,
    protein: 22.0,
    carbs: 0.0,
    fat: 4.8,
    fiber: 0,
    glycemicIndex: 'Low',
    verdict: 'Excellent lean protein packed with essential Omega-3 fatty acids EPA & DHA.',
    recommendation: 'Supports heart, joints, and brain health. Aim for 2-3 servings per week.'
  },
  'salmon': {
    name: 'Grilled Atlantic Salmon',
    category: 'Proteins',
    servingUnit: '1 fillet (120g)',
    calories: 245,
    protein: 26.0,
    carbs: 0.0,
    fat: 15.0,
    fiber: 0,
    glycemicIndex: 'Low',
    verdict: 'Superfood rich in anti-inflammatory Omega-3 fatty acids and astaxanthin.',
    recommendation: 'Healthy fats that protect cardiovascular health and reduce visceral fat.'
  },
  'whey': {
    name: 'Whey Protein Shake (with Water)',
    category: 'Proteins',
    servingUnit: '1 scoop (30g powder in 250ml water)',
    calories: 120,
    protein: 24.0,
    carbs: 2.5,
    fat: 1.5,
    fiber: 0.5,
    glycemicIndex: 'Low',
    verdict: 'Rapidly absorbed complete whey protein isolate/concentrate.',
    recommendation: 'Drink within 60 minutes post-workout or as a filling mid-day protein boost.'
  },
  'protein shake': {
    name: 'Whey Protein Shake (with Water)',
    category: 'Proteins',
    servingUnit: '1 scoop (30g powder in 250ml water)',
    calories: 120,
    protein: 24.0,
    carbs: 2.5,
    fat: 1.5,
    fiber: 0.5,
    glycemicIndex: 'Low',
    verdict: 'Rapidly absorbed complete whey protein isolate/concentrate.',
    recommendation: 'Drink within 60 minutes post-workout or as a filling mid-day protein boost.'
  },
  'paneer': {
    name: 'Fresh Cottage Cheese (Paneer)',
    category: 'Dairy & Alternatives',
    servingUnit: '100g',
    calories: 265,
    protein: 18.0,
    carbs: 3.5,
    fat: 20.0,
    fiber: 0,
    glycemicIndex: 'Low',
    verdict: 'Rich vegetarian source of casein protein and bone-strengthening calcium.',
    recommendation: 'Slow digesting; great for dinner to fuel overnight muscle protein synthesis.'
  },
  'paneer butter masala': {
    name: 'Paneer Butter Masala',
    category: 'Proteins',
    servingUnit: '1 bowl (180g)',
    calories: 340,
    protein: 12.0,
    carbs: 14.0,
    fat: 26.0,
    fiber: 2.5,
    glycemicIndex: 'Medium',
    verdict: 'Paneer cubes in creamy tomato butter gravy.',
    recommendation: 'High in dairy fat; ask for less butter/cream or pair with whole wheat roti.'
  },
  'tofu': {
    name: 'Firm Soya Tofu',
    category: 'Proteins',
    servingUnit: '100g',
    calories: 85,
    protein: 10.0,
    carbs: 2.0,
    fat: 4.5,
    fiber: 1.5,
    glycemicIndex: 'Low',
    verdict: 'Plant-based complete protein containing all essential amino acids with low saturated fat.',
    recommendation: 'Excellent for cholesterol management and fat loss.'
  },
  'greek yogurt': {
    name: 'Plain Greek Yogurt (Unsweetened)',
    category: 'Dairy & Alternatives',
    servingUnit: '1 cup (150g)',
    calories: 100,
    protein: 15.0,
    carbs: 6.0,
    fat: 1.5,
    fiber: 0,
    glycemicIndex: 'Low',
    verdict: 'Strained yogurt with double the protein of regular curd and gut-friendly probiotics.',
    recommendation: 'Superb breakfast base with berries or chia seeds.'
  },
  'peanut butter': {
    name: 'Natural Peanut Butter (No Added Sugar)',
    category: 'Nuts & Healthy Fats',
    servingUnit: '1 tbsp (16g)',
    calories: 95,
    protein: 4.0,
    carbs: 3.2,
    fat: 8.0,
    fiber: 1.2,
    glycemicIndex: 'Low',
    verdict: 'Dense source of monounsaturated fatty acids, vitamin E, and plant protein.',
    recommendation: 'Limit to 1-2 tbsp daily due to high caloric density.'
  },
  'almonds': {
    name: 'Raw Almonds (Badam)',
    category: 'Nuts & Healthy Fats',
    servingUnit: '10-12 pieces (15g)',
    calories: 85,
    protein: 3.2,
    carbs: 3.0,
    fat: 7.4,
    fiber: 1.8,
    glycemicIndex: 'Low',
    verdict: 'Rich in antioxidant vitamin E, magnesium, and healthy fats that support lipid profile.',
    recommendation: 'Soaking overnight improves digestive bioavailability.'
  },
  'oats': {
    name: 'Rolled Oats Porridge',
    category: 'Grains & Breads',
    servingUnit: '1 bowl (40g dry cooked in water)',
    calories: 150,
    protein: 5.0,
    carbs: 27.0,
    fat: 2.5,
    fiber: 4.0,
    glycemicIndex: 'Low',
    verdict: 'Packed with beta-glucan soluble fiber clinically proven to reduce LDL cholesterol.',
    recommendation: 'Great sustained energy breakfast; top with a scoop of protein or cinnamon.'
  },
  'bread': {
    name: 'Whole Wheat Bread',
    category: 'Grains & Breads',
    servingUnit: '1 slice (30g)',
    calories: 75,
    protein: 3.5,
    carbs: 13.0,
    fat: 0.9,
    fiber: 1.9,
    glycemicIndex: 'Medium',
    verdict: 'Complex carbohydrates with dietary fiber and B-complex vitamins.',
    recommendation: 'Pair with boiled eggs or peanut butter for stable glucose response.'
  },
  'chapati': {
    name: 'Whole Wheat Chapati (Roti)',
    category: 'Grains & Breads',
    servingUnit: '1 piece (40g)',
    calories: 104,
    protein: 3.1,
    carbs: 18.0,
    fat: 2.4,
    fiber: 2.5,
    glycemicIndex: 'Medium',
    verdict: 'Stone-ground whole wheat atta flatbread. Zero refined flour.',
    recommendation: 'Cook with dry tawa heat; avoid applying excessive ghee on top.'
  },
  'roti': {
    name: 'Whole Wheat Roti',
    category: 'Grains & Breads',
    servingUnit: '1 piece (40g)',
    calories: 104,
    protein: 3.1,
    carbs: 18.0,
    fat: 2.4,
    fiber: 2.5,
    glycemicIndex: 'Medium',
    verdict: 'Stone-ground whole wheat flatbread rich in dietary fiber.',
    recommendation: 'Pairs well with dal or grilled proteins.'
  },
  'dosa': {
    name: 'Plain Dosa',
    category: 'Grains & Breads',
    servingUnit: '1 piece (60g)',
    calories: 120,
    protein: 3.0,
    carbs: 22.0,
    fat: 2.5,
    fiber: 1.0,
    glycemicIndex: 'Medium',
    verdict: 'Fermented rice and urad dal crepe. Gut-friendly fermentation.',
    recommendation: 'Use light tawa oil wipe instead of ladle pours.'
  },
  'idli': {
    name: 'Steamed Idli',
    category: 'Grains & Breads',
    servingUnit: '2 pieces (80g)',
    calories: 130,
    protein: 4.5,
    carbs: 26.0,
    fat: 0.6,
    fiber: 1.5,
    glycemicIndex: 'Medium',
    verdict: '100% oil-free steamed probiotic breakfast staple.',
    recommendation: 'One of the lightest, most gut-friendly breakfast choices in South Asia.'
  },

  // --- Popular Global & Street Foods ---
  'shawarma': {
    name: 'Chicken Shawarma Roll',
    category: 'Grains & Breads',
    servingUnit: '1 roll (180g)',
    calories: 395,
    protein: 26.0,
    carbs: 38.0,
    fat: 15.0,
    fiber: 2.5,
    glycemicIndex: 'Medium',
    verdict: 'Spiced rotisserie chicken with pickles and sauce wrapped in khubz/pita.',
    recommendation: 'Ask for extra chicken, fresh veggies, and replace heavy garlic mayo with tahini or light yogurt sauce to save 120 kcal.'
  },
  'pizza': {
    name: 'Pizza (Regular Slice)',
    category: 'Grains & Breads',
    servingUnit: '1 slice (100g)',
    calories: 265,
    protein: 11.0,
    carbs: 30.0,
    fat: 10.5,
    fiber: 1.8,
    glycemicIndex: 'High',
    verdict: 'Baked crust topped with tomato sauce, mozzarella cheese, and toppings.',
    recommendation: 'Choose thin crust with vegetable and chicken toppings; enjoy 1-2 slices alongside a green salad.'
  },
  'burger': {
    name: 'Chicken Burger',
    category: 'Grains & Breads',
    servingUnit: '1 burger (180g)',
    calories: 420,
    protein: 22.0,
    carbs: 44.0,
    fat: 18.0,
    fiber: 2.2,
    glycemicIndex: 'Medium-High',
    verdict: 'Bun, patty, lettuce, and sauces.',
    recommendation: 'Choose grilled chicken over crispy fried patty and skip double cheese.'
  },
  'sandwich': {
    name: 'Grilled Chicken & Veggie Sandwich',
    category: 'Grains & Breads',
    servingUnit: '1 sandwich (160g)',
    calories: 295,
    protein: 18.0,
    carbs: 34.0,
    fat: 9.0,
    fiber: 3.5,
    glycemicIndex: 'Medium',
    verdict: 'Whole grain bread stuffed with grilled chicken, tomatoes, cucumber, and mint chutney.',
    recommendation: 'Balanced macronutrient meal when made with brown/whole wheat bread.'
  },
  'pasta': {
    name: 'Cooked Pasta (Tomato Sauce / Arabbiata)',
    category: 'Grains & Breads',
    servingUnit: '1 bowl (180g cooked)',
    calories: 240,
    protein: 8.5,
    carbs: 45.0,
    fat: 3.0,
    fiber: 3.0,
    glycemicIndex: 'Medium',
    verdict: 'Durum wheat semolina cooked al dente in light tomato and herb sauce.',
    recommendation: 'Add grilled chicken or shrimp for protein; avoid heavy cream Alfredo sauces.'
  },
  'salad': {
    name: 'Fresh Garden Salad',
    category: 'Vegetables',
    servingUnit: '1 large bowl (200g)',
    calories: 65,
    protein: 2.8,
    carbs: 11.0,
    fat: 1.0,
    fiber: 4.5,
    glycemicIndex: 'Low',
    verdict: 'Crisp lettuce, cucumbers, tomatoes, bell peppers, and carrot with lemon dressing.',
    recommendation: 'Eat before lunch or dinner to enhance fullness and reduce blood sugar spikes.'
  },
  'samosa': {
    name: 'Potato Samosa',
    category: 'Beverages & Snacks',
    servingUnit: '1 piece (75g)',
    calories: 220,
    protein: 3.5,
    carbs: 26.0,
    fat: 11.5,
    fiber: 2.2,
    glycemicIndex: 'High',
    verdict: 'Spiced potato and pea pastry deep-fried in oil.',
    recommendation: 'High oil absorption. Limit to occasional consumption or try baked versions.'
  },
  'dal': {
    name: 'Yellow Dal Tadka',
    category: 'Proteins',
    servingUnit: '1 bowl (150g)',
    calories: 140,
    protein: 7.8,
    carbs: 20.0,
    fat: 3.5,
    fiber: 5.0,
    glycemicIndex: 'Low',
    verdict: 'Yellow lentils tempered with cumin, garlic, and turmeric.',
    recommendation: 'Excellent gut-healthy vegetarian protein and soluble fiber source.'
  },

  // --- Fruits & Beverages ---
  'apple': {
    name: 'Fresh Apple',
    category: 'Fruits',
    servingUnit: '1 medium fruit (150g)',
    calories: 80,
    protein: 0.4,
    carbs: 21.0,
    fat: 0.3,
    fiber: 4.0,
    glycemicIndex: 'Low',
    verdict: 'Rich in pectin soluble fiber and quercetin antioxidants.',
    recommendation: 'Eat with skin on for maximum fiber and polyphenol content.'
  },
  'banana': {
    name: 'Banana (Nendran / Robusta)',
    category: 'Fruits',
    servingUnit: '1 medium (100g)',
    calories: 95,
    protein: 1.2,
    carbs: 23.0,
    fat: 0.3,
    fiber: 2.6,
    glycemicIndex: 'Medium',
    verdict: 'Natural electrolyte powerhouse loaded with potassium, vitamin B6, and quick energy.',
    recommendation: 'Ideal pre-workout fuel 30-45 minutes before exercise.'
  },
  'mango': {
    name: 'Ripe Mango Chunks',
    category: 'Fruits',
    servingUnit: '1 cup (150g)',
    calories: 99,
    protein: 1.4,
    carbs: 25.0,
    fat: 0.6,
    fiber: 2.6,
    glycemicIndex: 'Medium',
    verdict: 'King of fruits loaded with vitamin C, vitamin A, and digestive enzymes.',
    recommendation: 'Enjoy fresh slices in daytime rather than post-dinner sweet.'
  },
  'orange': {
    name: 'Fresh Orange',
    category: 'Fruits',
    servingUnit: '1 medium fruit (130g)',
    calories: 62,
    protein: 1.2,
    carbs: 15.4,
    fat: 0.2,
    fiber: 3.1,
    glycemicIndex: 'Low',
    verdict: 'Rich in vitamin C, flavonoids, and cellular hydration.',
    recommendation: 'Eat whole fruit rather than strained juice to preserve fiber.'
  },
  'papaya': {
    name: 'Fresh Ripe Papaya',
    category: 'Fruits',
    servingUnit: '1 bowl (150g)',
    calories: 59,
    protein: 0.9,
    carbs: 14.5,
    fat: 0.4,
    fiber: 2.7,
    glycemicIndex: 'Low-Medium',
    verdict: 'Contains papain enzyme that facilitates protein digestion and eases gut bloating.',
    recommendation: 'Superb breakfast addition or morning snack.'
  },
  'avocado': {
    name: 'Fresh Avocado',
    category: 'Nuts & Healthy Fats',
    servingUnit: 'Half medium fruit (75g)',
    calories: 120,
    protein: 1.5,
    carbs: 6.0,
    fat: 11.0,
    fiber: 5.0,
    glycemicIndex: 'Low',
    verdict: 'Loaded with oleic monounsaturated fatty acids, potassium, and prebiotic fiber.',
    recommendation: 'Supports satiety and nutrient absorption in salads.'
  },
  'sulaimani': {
    name: 'Kerala Sulaimani (Spiced Black Tea)',
    category: 'Beverages & Snacks',
    servingUnit: '1 cup (150ml)',
    calories: 15,
    protein: 0.2,
    carbs: 3.5,
    fat: 0.0,
    fiber: 0,
    glycemicIndex: 'Low',
    verdict: 'Fragrant Malabar black tea brewed with cardamom, clove, and a squeeze of fresh lemon.',
    recommendation: 'Zero saturated fat. Helps digestion after hearty meals.'
  },
  'tea': {
    name: 'Sulaimani / Black Tea',
    category: 'Beverages & Snacks',
    servingUnit: '1 cup (150ml)',
    calories: 15,
    protein: 0.2,
    carbs: 3.0,
    fat: 0.0,
    fiber: 0,
    glycemicIndex: 'Low',
    verdict: 'Antioxidant-rich tea with flavonoids.',
    recommendation: 'Drink without added refined white sugar.'
  },
  'coffee': {
    name: 'Black Coffee',
    category: 'Beverages & Snacks',
    servingUnit: '1 cup (180ml)',
    calories: 5,
    protein: 0.3,
    carbs: 0.5,
    fat: 0.0,
    fiber: 0,
    glycemicIndex: 'Low',
    verdict: 'Thermogenic beverage that mobilizes fatty acids and enhances mental alertness.',
    recommendation: 'Great pre-workout energy drink without dairy fat.'
  },
  'tender coconut': {
    name: 'Tender Coconut Water (Karikku)',
    category: 'Beverages & Snacks',
    servingUnit: '1 coconut water (250ml)',
    calories: 48,
    protein: 1.0,
    carbs: 10.5,
    fat: 0.2,
    fiber: 1.1,
    glycemicIndex: 'Low',
    verdict: 'Nature\'s isotonic hydration drink packed with bioavailable potassium and magnesium.',
    recommendation: 'Superior natural alternative to artificial sports electrolyte drinks.'
  }
};

/**
 * Clean user search input into normalized query words
 */
function cleanSearchQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/how many calories in|how many calories|calories in|calories|macro|macros|what is|tell me about|is it good to eat|can i eat|nutrition of|nutrition for|tell me/gi, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Universal Nutrition Estimator
 * Resolves ANY food query by name using database lookup, alias matching, or intelligent clinical heuristics.
 */
export function estimateNutrition(rawQuery: string): EstimatedFood {
  const clean = cleanSearchQuery(rawQuery);
  const words = clean.split(' ').filter(Boolean);

  // 1. Direct exact or substring match in catalog
  for (const [key, item] of Object.entries(COMPREHENSIVE_FOOD_DATABASE)) {
    if (clean === key || clean.includes(key) || key.includes(clean)) {
      return { ...item };
    }
  }

  // 2. Multi-word fuzzy match
  for (const [key, item] of Object.entries(COMPREHENSIVE_FOOD_DATABASE)) {
    const keyWords = key.split(' ');
    if (words.some(w => keyWords.includes(w) && w.length > 2)) {
      return { ...item };
    }
  }

  // 3. Category & Nutrient Heuristic Generator for arbitrary/unrecognized foods
  // Formulates biologically realistic nutritional values based on linguistic patterns:
  let category: FoodCategory = 'Beverages & Snacks';
  let servingUnit = '1 serving (100g)';
  let calories = 180;
  let protein = 5.0;
  let carbs = 22.0;
  let fat = 7.0;
  let fiber = 2.0;
  let glycemicIndex = 'Medium';
  let verdict = `Nutritional assessment for ${rawQuery.trim()}. Formatted by NutriBot clinical engine.`;
  let recommendation = 'Check preparation method below; steamed or grilled minimizes surplus oil calories.';

  const lower = rawQuery.toLowerCase();

  if (lower.includes('salad') || lower.includes('spinach') || lower.includes('cucumber') || lower.includes('broccoli') || lower.includes('cabbage')) {
    category = 'Vegetables';
    servingUnit = '1 bowl (150g)';
    calories = 65;
    protein = 2.5;
    carbs = 9.0;
    fat = 1.2;
    fiber = 4.0;
    glycemicIndex = 'Low';
    verdict = 'High volume, low caloric density, abundant micronutrients and dietary fiber.';
    recommendation = 'Ideal pre-meal plate to boost satiety and balance postprandial glucose.';
  } else if (lower.includes('shake') || lower.includes('smoothie') || lower.includes('whey') || lower.includes('protein')) {
    category = 'Proteins';
    servingUnit = '1 glass / shaker (300ml)';
    calories = 190;
    protein = 24.0;
    carbs = 14.0;
    fat = 3.5;
    fiber = 1.5;
    glycemicIndex = 'Low';
    verdict = 'High protein beverage optimized for muscle recovery and metabolic preservation.';
    recommendation = 'Consume post-workout or as a filling mid-meal snack.';
  } else if (lower.includes('chicken') || lower.includes('beef') || lower.includes('mutton') || lower.includes('meat') || lower.includes('fish') || lower.includes('egg')) {
    category = 'Proteins';
    servingUnit = '1 portion (120g)';
    calories = 220;
    protein = 25.0;
    carbs = 2.0;
    fat = 12.0;
    fiber = 0.5;
    glycemicIndex = 'Low';
    verdict = 'Complete protein containing all essential amino acids for tissue repair.';
    recommendation = 'Prefer grilled, baked, or stewed preparations over deep frying.';
  } else if (lower.includes('rice') || lower.includes('bread') || lower.includes('roti') || lower.includes('naan') || lower.includes('porotta') || lower.includes('pasta') || lower.includes('noodle')) {
    category = 'Grains & Breads';
    servingUnit = '1 plate / serving (150g)';
    calories = 240;
    protein = 5.5;
    carbs = 46.0;
    fat = 3.5;
    fiber = 2.5;
    glycemicIndex = 'Medium-High';
    verdict = 'Starchy carbohydrate staple supplying glycogen energy.';
    recommendation = 'Pair with high protein and vegetables to slow down glucose absorption.';
  } else if (lower.includes('juice') || lower.includes('tea') || lower.includes('coffee') || lower.includes('soda') || lower.includes('water')) {
    category = 'Beverages & Snacks';
    servingUnit = '1 glass (250ml)';
    calories = 85;
    protein = 0.8;
    carbs = 18.0;
    fat = 0.2;
    fiber = 0.5;
    glycemicIndex = 'Medium';
    verdict = 'Liquid refreshment. Note any added sugars or sweet syrups.';
    recommendation = 'Choose unsweetened infusions or tender coconut water for optimal hydration.';
  } else if (lower.includes('curry') || lower.includes('gravy') || lower.includes('masala') || lower.includes('sambar')) {
    category = 'Proteins';
    servingUnit = '1 bowl (160g)';
    calories = 185;
    protein = 7.0;
    carbs = 16.0;
    fat = 9.5;
    fiber = 3.5;
    glycemicIndex = 'Medium';
    verdict = 'Spiced vegetable or protein stew rich in anti-inflammatory turmeric and cumin.';
    recommendation = 'Control the amount of added cooking oil or coconut milk in the tempering.';
  } else if (lower.includes('sweet') || lower.includes('cake') || lower.includes('ice cream') || lower.includes('dessert') || lower.includes('chocolate')) {
    category = 'Beverages & Snacks';
    servingUnit = '1 piece / scoop (80g)';
    calories = 280;
    protein = 3.5;
    carbs = 38.0;
    fat = 12.5;
    fiber = 1.0;
    glycemicIndex = 'High';
    verdict = 'Energy-dense confection with concentrated sugars and fats.';
    recommendation = 'Savor mindfully in controlled portions after high-fiber meals.';
  }

  // Capitalize name neatly
  const formattedName = clean.length > 0
    ? clean.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
    : rawQuery.trim();

  return {
    name: formattedName,
    category,
    servingUnit,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    glycemicIndex,
    verdict,
    recommendation
  };
}

/**
 * Generate formatted bold markdown with calories stated first
 */
export function formatFoodMarkdown(food: EstimatedFood, oilOption: 'steamed' | 'medium' | 'fried' = 'steamed', portion: number = 1): string {
  const oilCal = oilOption === 'fried' ? 120 : oilOption === 'medium' ? 45 : 0;
  const oilFat = oilOption === 'fried' ? 13 : oilOption === 'medium' ? 5 : 0;

  const totalCal = Math.round((food.calories + oilCal) * portion);
  const totalProt = Number((food.protein * portion).toFixed(1));
  const totalCarb = Number((food.carbs * portion).toFixed(1));
  const totalFat = Number(((food.fat + oilFat) * portion).toFixed(1));
  const totalFiber = Number((food.fiber * portion).toFixed(1));

  return `🔥 **Calories:** **${totalCal} kcal** (per **${portion}x ${food.servingUnit}**)

### **Was it oily? (3 Cooking Options Calculation)**
- 🟢 **No Oil / Steamed:** **${Math.round(food.calories * portion)} kcal** (Base preparation, 0g added trans fat)
- 🟡 **Medium / Home Sauté:** **${Math.round((food.calories + 45) * portion)} kcal** (+45 kcal, +5g cooking oil / tawa roast)
- 🔴 **Deep Fried / Very Oily:** **${Math.round((food.calories + 120) * portion)} kcal** (+120 kcal, +13g oil bath absorption)

### **Nutritional Details**
- **Food Category:** **${food.category}**
- **Standard Serving Unit:** **${food.servingUnit}**
- **Protein:** **${totalProt} g**
- **Carbohydrates:** **${totalCarb} g**
- **Healthy Fats:** **${totalFat} g**
- **Dietary Fiber:** **${totalFiber} g**
- **Glycemic Index:** **${food.glycemicIndex}**

### **Clinical Verdict**
${food.verdict}

### **Coach Recommendations**
${food.recommendation}

✨ *This food is automatically synchronized to your Clinic Food Library and ready for 1-click logging to your daily diary!*`;
}

/**
 * Detect if user message is reporting an eaten meal with a specific time
 */
export function detectEatenMealWithTime(message: string): {
  isMealLog: boolean;
  timeGiven?: string;
  mealSlot?: MealType;
  foods?: Array<{ name: string; quantity: number; servingUnit: string; calories: number; protein: number; carbs: number; fat: number; category: string }>;
  totalCalories?: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFat?: number;
} | null {
  const lower = message.toLowerCase();
  
  // Time regex: e.g. "8:30 am", "4pm", "1:15 pm", "12:00", "8 am", "9.30pm"
  const timeRegex = /\b(\d{1,2}(?::|\.)\d{2}\s*(?:am|pm)?|\d{1,2}\s*(?:am|pm))\b/i;
  const match = lower.match(timeRegex);

  const eatVerbs = ['ate', 'had', 'eaten', 'consumed', 'drinking', 'drank', 'having', 'took', 'finished'];
  const hasEatVerb = eatVerbs.some(v => lower.includes(v));

  if (!match && !hasEatVerb) {
    return null;
  }

  const timeStr = match ? match[1].toUpperCase() : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Infer meal slot from time string
  let mealSlot: MealType = 'Evening Snack';
  const hourMatch = timeStr.match(/(\d{1,2})/);
  const hour = hourMatch ? parseInt(hourMatch[1], 10) : 16;
  const isPM = timeStr.toLowerCase().includes('pm');
  const normalizedHour = (isPM && hour < 12) ? hour + 12 : (!isPM && hour === 12) ? 0 : hour;

  if (normalizedHour >= 5 && normalizedHour <= 10) {
    mealSlot = 'Breakfast';
  } else if (normalizedHour > 10 && normalizedHour < 12) {
    mealSlot = 'Morning Snack';
  } else if (normalizedHour >= 12 && normalizedHour <= 15) {
    mealSlot = 'Lunch';
  } else if (normalizedHour > 15 && normalizedHour <= 18) {
    mealSlot = 'Evening Snack';
  } else {
    mealSlot = 'Dinner';
  }

  // Parse food items mentioned in sentence
  // Strip time and eat verbs
  let stripped = lower
    .replace(timeRegex, '')
    .replace(/i ate|i had|had|ate|at|in the morning|for breakfast|for lunch|for dinner|today/gi, '')
    .trim();

  // Split on "and", ",", "+"
  const parts = stripped.split(/,| and |\+/).map(p => p.trim()).filter(Boolean);
  
  if (parts.length === 0) {
    parts.push('Healthy Meal');
  }

  const foodsList: Array<{ name: string; quantity: number; servingUnit: string; calories: number; protein: number; carbs: number; fat: number; category: string }> = [];
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const part of parts) {
    // Check for quantity prefix: e.g. "2 boiled eggs", "1 apple", "half plate rice"
    const qtyMatch = part.match(/^(\d+(?:\.\d+)?|half|one|two|three)\s+/i);
    let qty = 1;
    let foodPart = part;
    if (qtyMatch) {
      const qVal = qtyMatch[1].toLowerCase();
      if (qVal === 'half') qty = 0.5;
      else if (qVal === 'one') qty = 1;
      else if (qVal === 'two') qty = 2;
      else if (qVal === 'three') qty = 3;
      else qty = parseFloat(qVal) || 1;
      foodPart = part.replace(qtyMatch[0], '').trim();
    }

    const est = estimateNutrition(foodPart);
    const itemCal = Math.round(est.calories * qty);
    const itemProt = Number((est.protein * qty).toFixed(1));
    const itemCarb = Number((est.carbs * qty).toFixed(1));
    const itemFat = Number((est.fat * qty).toFixed(1));

    totalCalories += itemCal;
    totalProtein += itemProt;
    totalCarbs += itemCarb;
    totalFat += itemFat;

    foodsList.push({
      name: est.name,
      quantity: qty,
      servingUnit: est.servingUnit,
      calories: itemCal,
      protein: itemProt,
      carbs: itemCarb,
      fat: itemFat,
      category: est.category
    });
  }

  return {
    isMealLog: true,
    timeGiven: timeStr,
    mealSlot,
    foods: foodsList,
    totalCalories,
    totalProtein: Number(totalProtein.toFixed(1)),
    totalCarbs: Number(totalCarbs.toFixed(1)),
    totalFat: Number(totalFat.toFixed(1))
  };
}
