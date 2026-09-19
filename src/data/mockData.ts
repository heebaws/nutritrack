import { 
  ClientProfile, 
  DietitianProfile, 
  FoodItem, 
  DietPlan, 
  MealLogItem, 
  BodyMeasurement, 
  DietitianTip, 
  ClientReminder 
} from '../types';

export const INITIAL_DIETITIANS: DietitianProfile[] = [
  {
    id: 'admin-1',
    name: 'Saleem Valanchery',
    username: 'saleem',
    password: 'password123',
    role: 'admin',
    email: 'saleem.valanchery@wellnessclinic.com',
    phone: '+91 98470 12345',
    title: 'Wellness Coach & Lead Clinic Admin',
    specialization: 'Holistic Wellness, Weight Loss & Lifestyle Coaching',
    bio: 'Lead Wellness Coach and Clinic Founder guiding personalized lifestyle transformation, sustainable nutrition, and metabolic wellness.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  },
  {
    id: 'dt-1',
    name: 'Faseela Saleem',
    username: 'faseela',
    password: 'password123',
    role: 'dietitian',
    email: 'faseela.saleem@wellnessclinic.com',
    phone: '+91 98470 54321',
    title: 'Wellness Coach & Nutrition Specialist',
    specialization: 'Women\'s Wellness, Metabolic Health & Mindful Nutrition',
    bio: 'Certified Wellness Coach focused on mindful nutrition, family wellness, sustainable weight balance, and daily habit coaching.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
  },
  {
    id: 'dt-2',
    name: 'Rahul Sharma, MS',
    username: 'rahul',
    password: 'password123',
    role: 'dietitian',
    email: 'rahul.sharma@wellnessclinic.com',
    phone: '+91 98470 99887',
    title: 'Fitness & Sports Nutritionist',
    specialization: 'Lean Muscle & High-Performance Diets',
    bio: 'Specialist in athletic nutrition, macronutrient cycling, and body composition optimization.',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250',
  }
];

export const INITIAL_FOODS: FoodItem[] = [
  // Proteins
  { id: 'f-1', name: 'Grilled Chicken Breast', category: 'Proteins', servingUnit: '100g (cooked)', servingGrams: 100, calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  { id: 'f-2', name: 'Boiled Eggs (2 whole)', category: 'Proteins', servingUnit: '2 large eggs', servingGrams: 100, calories: 144, protein: 12.6, carbs: 0.8, fat: 9.8, fiber: 0 },
  { id: 'f-3', name: 'Egg Whites (3 whites)', category: 'Proteins', servingUnit: '3 large whites', servingGrams: 99, calories: 51, protein: 10.8, carbs: 0.7, fat: 0.2, fiber: 0 },
  { id: 'f-4', name: 'Paneer / Cottage Cheese', category: 'Proteins', servingUnit: '100g (low fat)', servingGrams: 100, calories: 180, protein: 18, carbs: 4, fat: 10, fiber: 0 },
  { id: 'f-5', name: 'Tofu (Firm)', category: 'Proteins', servingUnit: '100g', servingGrams: 100, calories: 83, protein: 10, carbs: 2, fat: 5, fiber: 1 },
  { id: 'f-6', name: 'Salmon Fillet (Baked)', category: 'Proteins', servingUnit: '100g', servingGrams: 100, calories: 206, protein: 22, carbs: 0, fat: 12, fiber: 0 },
  { id: 'f-7', name: 'Yellow Moong Dal (Cooked)', category: 'Proteins', servingUnit: '1 medium bowl (150g)', servingGrams: 150, calories: 145, protein: 9, carbs: 24, fat: 1.5, fiber: 5 },
  { id: 'f-8', name: 'Whey Protein Isolate', category: 'Proteins', servingUnit: '1 scoop (30g)', servingGrams: 30, calories: 120, protein: 25, carbs: 1.5, fat: 1, fiber: 0 },

  // Grains & Breads
  { id: 'f-9', name: 'Whole Wheat Roti / Chapati', category: 'Grains & Breads', servingUnit: '1 medium roti (35g)', servingGrams: 35, calories: 104, protein: 3.2, carbs: 20, fat: 1.2, fiber: 2.8 },
  { id: 'f-10', name: 'Brown Rice (Cooked)', category: 'Grains & Breads', servingUnit: '1 cup (150g)', servingGrams: 150, calories: 168, protein: 3.5, carbs: 36, fat: 1.3, fiber: 2.5 },
  { id: 'f-11', name: 'Rolled Oats (Dry)', category: 'Grains & Breads', servingUnit: '1/2 cup (40g)', servingGrams: 40, calories: 152, protein: 5.3, carbs: 27, fat: 2.6, fiber: 4 },
  { id: 'f-12', name: 'Quinoa (Cooked)', category: 'Grains & Breads', servingUnit: '1 cup (185g)', servingGrams: 185, calories: 222, protein: 8.1, carbs: 39, fat: 3.6, fiber: 5.2 },
  { id: 'f-13', name: 'Whole Grain Bread', category: 'Grains & Breads', servingUnit: '1 slice (32g)', servingGrams: 32, calories: 82, protein: 4, carbs: 14, fat: 1.1, fiber: 2 },

  // Vegetables
  { id: 'f-14', name: 'Mixed Green Salad (Cucumber, Tomato, Greens)', category: 'Vegetables', servingUnit: '1 large bowl (200g)', servingGrams: 200, calories: 45, protein: 2, carbs: 8, fat: 0.5, fiber: 3.5 },
  { id: 'f-15', name: 'Steamed Broccoli & Cauliflower', category: 'Vegetables', servingUnit: '1 cup (150g)', servingGrams: 150, calories: 48, protein: 3.8, carbs: 8.4, fat: 0.6, fiber: 4.2 },
  { id: 'f-16', name: 'Sauteed Spinach with Garlic', category: 'Vegetables', servingUnit: '1 cup (180g)', servingGrams: 180, calories: 65, protein: 5, carbs: 6, fat: 2.5, fiber: 4 },

  // Fruits
  { id: 'f-17', name: 'Crisp Apple', category: 'Fruits', servingUnit: '1 medium (180g)', servingGrams: 180, calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4 },
  { id: 'f-18', name: 'Banana', category: 'Fruits', servingUnit: '1 medium (118g)', servingGrams: 118, calories: 105, protein: 1.3, carbs: 27, fat: 0.3, fiber: 3.1 },
  { id: 'f-19', name: 'Papaya Cubes', category: 'Fruits', servingUnit: '1 cup (145g)', servingGrams: 145, calories: 62, protein: 0.7, carbs: 16, fat: 0.4, fiber: 2.5 },
  { id: 'f-20', name: 'Fresh Blueberries', category: 'Fruits', servingUnit: '1/2 cup (75g)', servingGrams: 75, calories: 42, protein: 0.6, carbs: 10.5, fat: 0.2, fiber: 1.8 },

  // Dairy & Alternatives
  { id: 'f-21', name: 'Greek Yogurt (Plain / Low Fat)', category: 'Dairy & Alternatives', servingUnit: '1 cup (170g)', servingGrams: 170, calories: 100, protein: 17, carbs: 6, fat: 0.7, fiber: 0 },
  { id: 'f-22', name: 'Skimmed Milk', category: 'Dairy & Alternatives', servingUnit: '1 glass (240ml)', servingGrams: 240, calories: 86, protein: 8.3, carbs: 12, fat: 0.2, fiber: 0 },
  { id: 'f-23', name: 'Unsweetened Almond Milk', category: 'Dairy & Alternatives', servingUnit: '1 glass (240ml)', servingGrams: 240, calories: 35, protein: 1.2, carbs: 1, fat: 2.8, fiber: 1 },

  // Nuts & Healthy Fats
  { id: 'f-24', name: 'Raw Almonds & Walnuts', category: 'Nuts & Healthy Fats', servingUnit: 'Handful (25g)', servingGrams: 25, calories: 155, protein: 5, carbs: 4, fat: 14, fiber: 2.5 },
  { id: 'f-25', name: 'Chia Seeds', category: 'Nuts & Healthy Fats', servingUnit: '1 tbsp (12g)', servingGrams: 12, calories: 58, protein: 2, carbs: 5, fat: 3.8, fiber: 4.1 },
  { id: 'f-26', name: 'Extra Virgin Olive Oil', category: 'Nuts & Healthy Fats', servingUnit: '1 tsp (5ml)', servingGrams: 5, calories: 40, protein: 0, carbs: 0, fat: 4.5, fiber: 0 },

  // Beverages & Snacks
  { id: 'f-27', name: 'Roasted Makhana (Fox Nuts)', category: 'Beverages & Snacks', servingUnit: '1 bowl (30g)', servingGrams: 30, calories: 106, protein: 3, carbs: 20, fat: 1.2, fiber: 2.2 },
  { id: 'f-28', name: 'Green Tea (No sugar)', category: 'Beverages & Snacks', servingUnit: '1 cup (200ml)', servingGrams: 200, calories: 2, protein: 0.1, carbs: 0.2, fat: 0, fiber: 0 },
  { id: 'f-29', name: 'Sprouted Moong Salad', category: 'Beverages & Snacks', servingUnit: '1 cup (120g)', servingGrams: 120, calories: 110, protein: 8, carbs: 18, fat: 0.8, fiber: 4.5 },
  { id: 'f-30', name: 'Buttermilk / Chaas (Spiced)', category: 'Beverages & Snacks', servingUnit: '1 glass (200ml)', servingGrams: 200, calories: 45, protein: 3.5, carbs: 4, fat: 1.5, fiber: 0 },

  // Kerala Snacks & Delicacies (Requested by Saleem Valanchery Clinic)
  { id: 'kl-1', name: 'Pazham Pori (Ethakka Appam)', category: 'Beverages & Snacks', servingUnit: '1 piece (80g)', servingGrams: 80, calories: 185, protein: 2.2, carbs: 34, fat: 5.5, fiber: 2.1 },
  { id: 'kl-2', name: 'Parippu Vada (Kerala Dal Vada)', category: 'Beverages & Snacks', servingUnit: '1 piece (50g)', servingGrams: 50, calories: 148, protein: 6.2, carbs: 16.5, fat: 7.2, fiber: 3.8 },
  { id: 'kl-3', name: 'Uzhunnu Vada (Medu Vada)', category: 'Beverages & Snacks', servingUnit: '1 piece (50g)', servingGrams: 50, calories: 142, protein: 4.8, carbs: 15, fat: 7.5, fiber: 2.2 },
  { id: 'kl-4', name: 'Unniyappam (Sweet Jaggery & Rice)', category: 'Beverages & Snacks', servingUnit: '1 piece (35g)', servingGrams: 35, calories: 115, protein: 1.6, carbs: 22, fat: 2.8, fiber: 1 },
  { id: 'kl-5', name: 'Neyyappam (Ghee & Rice Fritter)', category: 'Beverages & Snacks', servingUnit: '1 piece (45g)', servingGrams: 45, calories: 145, protein: 1.8, carbs: 25, fat: 4.5, fiber: 1.2 },
  { id: 'kl-6', name: 'Sukhiyan (Sweet Green Gram Fritter)', category: 'Beverages & Snacks', servingUnit: '1 piece (55g)', servingGrams: 55, calories: 140, protein: 4.5, carbs: 24, fat: 3.2, fiber: 2.6 },
  { id: 'kl-7', name: 'Kerala Banana Chips (Nendran Upperi)', category: 'Beverages & Snacks', servingUnit: 'Handful (30g)', servingGrams: 30, calories: 158, protein: 1.1, carbs: 18.2, fat: 9.6, fiber: 1.8 },
  { id: 'kl-8', name: 'Sharkara Upperi (Jaggery Banana Chips)', category: 'Beverages & Snacks', servingUnit: 'Handful (30g)', servingGrams: 30, calories: 168, protein: 1.0, carbs: 24.5, fat: 7.5, fiber: 1.5 },
  { id: 'kl-9', name: 'Ela Ada (Steamed Rice Parcel)', category: 'Beverages & Snacks', servingUnit: '1 piece (85g)', servingGrams: 85, calories: 162, protein: 2.8, carbs: 32, fat: 3.0, fiber: 2.0 },
  { id: 'kl-10', name: 'Kozhukkatta (Steamed Rice Dumpling)', category: 'Beverages & Snacks', servingUnit: '1 piece (60g)', servingGrams: 60, calories: 132, protein: 2.2, carbs: 26.5, fat: 2.3, fiber: 1.5 },
  { id: 'kl-11', name: 'Kerala Mixture (Spicy Crunch)', category: 'Beverages & Snacks', servingUnit: 'Small bowl (30g)', servingGrams: 30, calories: 162, protein: 3.5, carbs: 15, fat: 10.2, fiber: 2.0 },
  { id: 'kl-12', name: 'Achappam (Rose Cookies)', category: 'Beverages & Snacks', servingUnit: '1 piece (25g)', servingGrams: 25, calories: 98, protein: 1.2, carbs: 14.5, fat: 4.2, fiber: 0.5 },
  { id: 'kl-13', name: 'Mutta Bajji (Kerala Egg Fritter)', category: 'Beverages & Snacks', servingUnit: '1 piece (70g)', servingGrams: 70, calories: 158, protein: 6.8, carbs: 11.2, fat: 9.8, fiber: 1.2 },
  { id: 'kl-14', name: 'Kallummakkaya Nirachathu (Stuffed Mussels)', category: 'Beverages & Snacks', servingUnit: '2 pieces (70g)', servingGrams: 70, calories: 185, protein: 11.5, carbs: 16, fat: 8.5, fiber: 1.5 },
  { id: 'kl-15', name: 'Kerala Calicut Halwa', category: 'Beverages & Snacks', servingUnit: '1 slice (40g)', servingGrams: 40, calories: 175, protein: 1.0, carbs: 26, fat: 7.8, fiber: 0.5 },

  // Kerala Traditional Meals & Curries
  { id: 'kl-16', name: 'Kerala Puttu (Steamed Rice & Coconut)', category: 'Grains & Breads', servingUnit: '1 piece / cup (100g)', servingGrams: 100, calories: 165, protein: 3.2, carbs: 32, fat: 2.8, fiber: 2.2 },
  { id: 'kl-17', name: 'Kadala Curry (Black Chickpea Roasted Gravy)', category: 'Proteins', servingUnit: '1 bowl (150g)', servingGrams: 150, calories: 195, protein: 8.5, carbs: 26, fat: 7.0, fiber: 6.5 },
  { id: 'kl-18', name: 'Appam (Palappam / Lace Rice Crepe)', category: 'Grains & Breads', servingUnit: '1 piece (50g)', servingGrams: 50, calories: 95, protein: 1.8, carbs: 19.5, fat: 1.2, fiber: 0.8 },
  { id: 'kl-19', name: 'Idiyappam (Noolappam / String Hoppers)', category: 'Grains & Breads', servingUnit: '1 piece (45g)', servingGrams: 45, calories: 78, protein: 1.5, carbs: 17.2, fat: 0.4, fiber: 0.9 },
  { id: 'kl-20', name: 'Malabar Porotta (Flaky Flatbread)', category: 'Grains & Breads', servingUnit: '1 porotta (75g)', servingGrams: 75, calories: 295, protein: 5.5, carbs: 38, fat: 14.0, fiber: 1.8 },
  { id: 'kl-21', name: 'Kerala Matta Rice (Red Rice Cooked)', category: 'Grains & Breads', servingUnit: '1 cup (150g)', servingGrams: 150, calories: 198, protein: 4.2, carbs: 42, fat: 1.0, fiber: 2.8 },
  { id: 'kl-22', name: 'Kerala Fish Curry (Kudampuli Gravy)', category: 'Proteins', servingUnit: '1 bowl (150g)', servingGrams: 150, calories: 172, protein: 21, carbs: 3.5, fat: 8.2, fiber: 1.0 },
  { id: 'kl-23', name: 'Kerala Fish Fry (Tawa Seared / Karimeen)', category: 'Proteins', servingUnit: '1 piece (100g)', servingGrams: 100, calories: 220, protein: 23, carbs: 2.0, fat: 13.8, fiber: 0.5 },
  { id: 'kl-24', name: 'Kerala Beef Fry / Roast (Ularthiyathu)', category: 'Proteins', servingUnit: '1 bowl (100g)', servingGrams: 100, calories: 265, protein: 26, carbs: 4.5, fat: 16.0, fiber: 1.5 },
  { id: 'kl-ulli', name: 'Ulli Vada (Crispy Onion Fritter)', category: 'Beverages & Snacks', servingUnit: '1 piece (45g)', servingGrams: 45, calories: 155, protein: 2.8, carbs: 16, fat: 9.0, fiber: 2.1 },
  { id: 'kl-25', name: 'Kerala Chicken Roast / Curry', category: 'Proteins', servingUnit: '1 bowl (150g)', servingGrams: 150, calories: 215, protein: 24, carbs: 4.0, fat: 11.5, fiber: 1.2 },
  { id: 'kl-26', name: 'Aviyal (Coconut Vegetables)', category: 'Vegetables', servingUnit: '1 bowl (150g)', servingGrams: 150, calories: 138, protein: 3.2, carbs: 14.5, fat: 7.8, fiber: 4.2 },
  { id: 'kl-27', name: 'Thoran (Cabbage/Beans with Coconut)', category: 'Vegetables', servingUnit: '1 bowl (120g)', servingGrams: 120, calories: 98, protein: 2.6, carbs: 9.5, fat: 5.8, fiber: 3.6 },
  { id: 'kl-28', name: 'Kerala Sambar (Spiced Lentil & Veg)', category: 'Vegetables', servingUnit: '1 bowl (150g)', servingGrams: 150, calories: 115, protein: 5.2, carbs: 18, fat: 2.6, fiber: 4.5 },
  { id: 'kl-29', name: 'Moru Curry / Pulissery (Spiced Buttermilk)', category: 'Dairy & Alternatives', servingUnit: '1 bowl (150g)', servingGrams: 150, calories: 85, protein: 3.5, carbs: 6.2, fat: 5.2, fiber: 0.5 },
  { id: 'kl-30', name: 'Thalassery Chicken Biryani', category: 'Grains & Breads', servingUnit: '1 plate (300g)', servingGrams: 300, calories: 485, protein: 28, carbs: 58, fat: 16.5, fiber: 3.2 },
  { id: 'kl-31', name: 'Pathiri (Thin Steamed Rice Roti)', category: 'Grains & Breads', servingUnit: '1 piece (30g)', servingGrams: 30, calories: 55, protein: 1.1, carbs: 12, fat: 0.2, fiber: 0.5 },
  { id: 'kl-32', name: 'Kerala Egg Roast (Mutta Roast)', category: 'Proteins', servingUnit: '1 egg with gravy (120g)', servingGrams: 120, calories: 185, protein: 9.5, carbs: 8.0, fat: 12.5, fiber: 1.5 }
];

export const INITIAL_DIET_PLANS: DietPlan[] = [
  {
    id: 'dp-1',
    title: '1,500 kcal Sustainable Fat Loss & Metabolic Reset',
    description: 'Designed for gradual, steady fat loss while protecting lean muscle mass and stabilizing blood sugar.',
    targetCalories: 1500,
    targetProtein: 95,
    targetCarbs: 150,
    targetFat: 45,
    waterTargetLitres: 2.8,
    createdByDietitianId: 'dt-1',
    createdAt: '2026-08-20',
    updatedAt: '2026-09-01',
    generalGuidelines: [
      'Drink 500ml water upon waking and 30 minutes before main meals.',
      'Finish dinner at least 2.5 hours before bedtime.',
      'Chew slowly and take at least 20 minutes to complete each meal.',
      'Limit sodium in the evening to reduce fluid retention.'
    ],
    meals: [
      {
        mealType: 'Breakfast',
        timeGuideline: '8:00 AM - 9:00 AM',
        instructions: 'High protein breakfast to curb mid-day cravings.',
        recommendedFoods: [
          { foodId: 'f-11', foodName: 'Rolled Oats (Dry)', portion: 1, unit: '1/2 cup (40g)', notes: 'Cook with water or almond milk' },
          { foodId: 'f-21', foodName: 'Greek Yogurt (Plain / Low Fat)', portion: 0.8, unit: '1 cup (170g)', notes: 'Stir in for creamy texture' },
          { foodId: 'f-20', foodName: 'Fresh Blueberries', portion: 1, unit: '1/2 cup (75g)' },
          { foodId: 'f-25', foodName: 'Chia Seeds', portion: 1, unit: '1 tbsp (12g)' },
        ]
      },
      {
        mealType: 'Morning Snack',
        timeGuideline: '11:00 AM - 11:30 AM',
        instructions: 'Light fiber & antioxidants boost.',
        recommendedFoods: [
          { foodId: 'f-17', foodName: 'Crisp Apple', portion: 1, unit: '1 medium (180g)' },
          { foodId: 'f-24', foodName: 'Raw Almonds & Walnuts', portion: 0.6, unit: 'Handful (25g)', notes: 'About 7-8 almonds' },
          { foodId: 'f-28', foodName: 'Green Tea (No sugar)', portion: 1, unit: '1 cup (200ml)' },
        ]
      },
      {
        mealType: 'Lunch',
        timeGuideline: '1:00 PM - 2:00 PM',
        instructions: 'Balanced plate: 1/2 vegetables, 1/4 protein, 1/4 complex carb.',
        recommendedFoods: [
          { foodId: 'f-1', foodName: 'Grilled Chicken Breast', portion: 1, unit: '100g (cooked)', notes: 'Or 120g Paneer/Tofu if vegetarian' },
          { foodId: 'f-9', foodName: 'Whole Wheat Roti / Chapati', portion: 1.5, unit: '1 medium roti (35g)' },
          { foodId: 'f-14', foodName: 'Mixed Green Salad', portion: 1, unit: '1 large bowl (200g)' },
          { foodId: 'f-7', foodName: 'Yellow Moong Dal (Cooked)', portion: 0.8, unit: '1 medium bowl (150g)' },
        ]
      },
      {
        mealType: 'Evening Snack',
        timeGuideline: '5:00 PM - 5:30 PM',
        instructions: 'Post-work satiety snack to avoid overeating at dinner.',
        recommendedFoods: [
          { foodId: 'f-27', foodName: 'Roasted Makhana (Fox Nuts)', portion: 1, unit: '1 bowl (30g)' },
          { foodId: 'f-30', foodName: 'Buttermilk / Chaas (Spiced)', portion: 1, unit: '1 glass (200ml)', notes: 'With roasted cumin and mint' },
        ]
      },
      {
        mealType: 'Dinner',
        timeGuideline: '7:30 PM - 8:30 PM',
        instructions: 'Light, easily digestible protein and cooked greens.',
        recommendedFoods: [
          { foodId: 'f-6', foodName: 'Salmon Fillet (Baked)', portion: 0.9, unit: '100g', notes: 'Or 1.5 cup Moong Dal + Tofu' },
          { foodId: 'f-15', foodName: 'Steamed Broccoli & Cauliflower', portion: 1, unit: '1 cup (150g)' },
          { foodId: 'f-10', foodName: 'Brown Rice (Cooked)', portion: 0.6, unit: '1 cup (150g)' },
        ]
      }
    ]
  },
  {
    id: 'dp-2',
    title: '1,850 kcal Lean Strength & High-Protein Fuel',
    description: 'Focused on muscle recovery, sustained energy levels, and nutrient timing around workouts.',
    targetCalories: 1850,
    targetProtein: 135,
    targetCarbs: 180,
    targetFat: 55,
    waterTargetLitres: 3.5,
    createdByDietitianId: 'dt-2',
    createdAt: '2026-08-28',
    updatedAt: '2026-09-05',
    generalGuidelines: [
      'Take whey protein within 45 mins post-workout.',
      'Stay hydrated with 3.5L fluids daily minimum.',
      'Include healthy fats with every major meal.'
    ],
    meals: [
      {
        mealType: 'Breakfast',
        timeGuideline: '7:30 AM - 8:30 AM',
        instructions: 'High protein energy kick-off.',
        recommendedFoods: [
          { foodId: 'f-2', foodName: 'Boiled Eggs (2 whole)', portion: 1, unit: '2 large eggs' },
          { foodId: 'f-3', foodName: 'Egg Whites (3 whites)', portion: 1, unit: '3 large whites' },
          { foodId: 'f-13', foodName: 'Whole Grain Bread', portion: 2, unit: '1 slice (32g)' },
        ]
      },
      {
        mealType: 'Morning Snack',
        timeGuideline: '11:00 AM',
        instructions: 'Mid-morning protein and fruit.',
        recommendedFoods: [
          { foodId: 'f-8', foodName: 'Whey Protein Isolate', portion: 1, unit: '1 scoop (30g)' },
          { foodId: 'f-18', foodName: 'Banana', portion: 1, unit: '1 medium (118g)' },
        ]
      },
      {
        mealType: 'Lunch',
        timeGuideline: '1:30 PM',
        instructions: 'Fuel & complex carb recovery.',
        recommendedFoods: [
          { foodId: 'f-1', foodName: 'Grilled Chicken Breast', portion: 1.5, unit: '100g (cooked)' },
          { foodId: 'f-10', foodName: 'Brown Rice (Cooked)', portion: 1.2, unit: '1 cup (150g)' },
          { foodId: 'f-14', foodName: 'Mixed Green Salad', portion: 1, unit: '1 large bowl (200g)' },
        ]
      },
      {
        mealType: 'Evening Snack',
        timeGuideline: '5:30 PM',
        instructions: 'Satiety and healthy micronutrients.',
        recommendedFoods: [
          { foodId: 'f-29', foodName: 'Sprouted Moong Salad', portion: 1, unit: '1 cup (120g)' },
        ]
      },
      {
        mealType: 'Dinner',
        timeGuideline: '8:30 PM',
        instructions: 'Night-time muscle synthesis and sound sleep.',
        recommendedFoods: [
          { foodId: 'f-4', foodName: 'Paneer / Cottage Cheese', portion: 1, unit: '100g (low fat)' },
          { foodId: 'f-9', foodName: 'Whole Wheat Roti / Chapati', portion: 2, unit: '1 medium roti (35g)' },
          { foodId: 'f-16', foodName: 'Sauteed Spinach with Garlic', portion: 1, unit: '1 cup (180g)' },
        ]
      }
    ]
  }
];

export const INITIAL_CLIENTS: ClientProfile[] = [
  {
    id: 'cl-1',
    name: 'Sarah Jenkins',
    username: 'sarah',
    password: 'password123',
    phone: '5550192',
    email: 'sarah.j@example.com',
    gender: 'Female',
    age: 32,
    heightCm: 165,
    startingWeightKg: 74.5,
    currentWeightKg: 69.8,
    targetWeightKg: 64.0,
    bodyFatPercentage: 33.2,
    targetBodyFatPercentage: 24.0,
    bodyFatStatus: 'Above Normal (Target 20-30%)',
    visceralFat: 11,
    targetVisceralFat: 7,
    visceralFatStatus: 'Elevated (Target 5-9)',
    bmi: 25.6,
    targetBmi: 21.5,
    bmiStatus: 'Overweight >23 (Target 15-23)',
    bmr: 1460,
    targetBmr: 1850,
    bmrStatus: 'Sedentary Desk Job (Req: 1,750-1,850 kcal)',
    neededCalories: 1500, // Denominator in main bar
    goalType: 'loss', // Requirement: Weight Loss
    muscleMassKg: 24.5, // Optional muscle mass
    targetMuscleMassKg: 26.0,
    boneMassKg: 2.4, // Optional Calcium / Bone mineral
    bodyWaterPercentage: 54.2, // Optional Total Body Water %
    dailyWaterTargetLiters: 2.8, // Optional Water intake need
    proteinTargetGrams: 90,
    goal: 'Weight Loss & PCOS Management (-10.5kg total target)',
    assignedDietitianId: 'admin-1', // Under Saleem Valanchery
    dietPlanId: 'dp-1',
    status: 'active',
    joinedDate: '2026-07-15',
    lastActiveDate: '2026-09-15',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    medicalNotes: 'Mild insulin resistance. Prioritize complex carbs and low glycemic index meals.'
  },
  {
    id: 'cl-2',
    name: 'Marcus Vance',
    username: 'marcus',
    password: 'password123',
    phone: '5550193',
    email: 'marcus.v@example.com',
    gender: 'Male',
    age: 28,
    heightCm: 180,
    startingWeightKg: 85.0,
    currentWeightKg: 81.2,
    targetWeightKg: 78.0,
    bodyFatPercentage: 22.4,
    targetBodyFatPercentage: 16.0,
    bodyFatStatus: 'Normal (10-30% range)',
    visceralFat: 8,
    targetVisceralFat: 6,
    visceralFatStatus: 'Optimal (Target 5-9)',
    bmi: 25.1,
    targetBmi: 22.8,
    bmiStatus: 'Higher than 23 (Target 15-23)',
    bmr: 1820,
    targetBmr: 2450,
    bmrStatus: 'Active Gym Training (Req: 2,400-2,500 kcal)',
    neededCalories: 2100, // Denominator in main bar
    goalType: 'loss', // Requirement: Fat Loss
    muscleMassKg: 35.8,
    targetMuscleMassKg: 37.0,
    boneMassKg: 3.2,
    bodyWaterPercentage: 59.2,
    dailyWaterTargetLiters: 3.5,
    proteinTargetGrams: 140,
    goal: 'Fat Loss & Lean Muscle Definition (-7kg target)',
    assignedDietitianId: 'dt-1', // Under Faseela Saleem
    dietPlanId: 'dp-2',
    status: 'active',
    joinedDate: '2026-08-01',
    lastActiveDate: '2026-09-15',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    medicalNotes: 'No known allergies. Strength trains 4x weekly.'
  },
  {
    id: 'cl-3',
    name: 'Priya Patel',
    username: 'priya',
    password: 'password123',
    phone: '5550194',
    email: 'priya.p@example.com',
    gender: 'Female',
    age: 39,
    heightCm: 158,
    startingWeightKg: 68.0,
    currentWeightKg: 66.5,
    targetWeightKg: 58.0,
    bodyFatPercentage: 34.0,
    targetBodyFatPercentage: 25.0,
    bodyFatStatus: 'Above Normal (Target 20-30%)',
    visceralFat: 10,
    targetVisceralFat: 6,
    visceralFatStatus: 'Mild Elevated (Target 5-9)',
    bmi: 26.6,
    targetBmi: 22.0,
    bmiStatus: 'Higher than 23 (Target 15-23)',
    bmr: 1380,
    targetBmr: 1720,
    bmrStatus: 'Moderate Standing Work (Req: 1,650-1,750 kcal)',
    goal: 'Post-Partum Healthy Weight Reduction & Energy Boost',
    assignedDietitianId: 'admin-1', // Under Saleem Valanchery
    dietPlanId: 'dp-1',
    status: 'active',
    joinedDate: '2026-08-10',
    lastActiveDate: '2026-09-14',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    medicalNotes: 'Vegetarian. Needs adequate B12 and iron support.'
  },
  {
    id: 'cl-4',
    name: 'David Miller',
    username: 'david',
    password: 'password123',
    phone: '5550195',
    email: 'david.m@example.com',
    gender: 'Male',
    age: 46,
    heightCm: 175,
    startingWeightKg: 96.0,
    currentWeightKg: 94.8,
    targetWeightKg: 82.0,
    bodyFatPercentage: 36.5,
    targetBodyFatPercentage: 22.0,
    bodyFatStatus: 'High Fat >30% (Target 10-30%)',
    visceralFat: 16,
    targetVisceralFat: 8,
    visceralFatStatus: 'High V-Fat 16 (Target 5-9)',
    bmi: 31.0,
    targetBmi: 23.0,
    bmiStatus: 'High BMI 31 (Target 15-23)',
    bmr: 1890,
    targetBmr: 2260,
    bmrStatus: 'Sedentary Desk Job (Req: 2,100-2,300 kcal)',
    goal: 'Cardiovascular Risk Reduction & Visceral Fat Loss',
    assignedDietitianId: 'admin-1', // Under Saleem Valanchery
    dietPlanId: 'dp-1',
    status: 'inactive', // inactive report trigger!
    joinedDate: '2026-07-28',
    lastActiveDate: '2026-09-08',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    medicalNotes: 'Borderline hypertension. Low sodium protocol. Has not logged meals for 7 days.'
  },
  {
    id: 'cl-5',
    name: 'Amina Al-Mansoor',
    username: 'amina',
    password: 'password123',
    phone: '5550196',
    email: 'amina.m@example.com',
    gender: 'Female',
    age: 26,
    heightCm: 168,
    startingWeightKg: 62.0,
    currentWeightKg: 62.5,
    targetWeightKg: 65.0,
    neededCalories: 2350, // Denominator in main bar: Weight Gain Surplus
    goalType: 'gain', // Requirement: Weight Gain
    bodyFatPercentage: 19.2,
    targetBodyFatPercentage: 22.0,
    visceralFat: 4,
    targetVisceralFat: 5,
    bmi: 22.1,
    targetBmi: 23.0,
    bmr: 1510,
    targetBmr: 2350,
    muscleMassKg: 27.5,
    targetMuscleMassKg: 29.5,
    boneMassKg: 2.7,
    bodyWaterPercentage: 58.0,
    dailyWaterTargetLiters: 3.2,
    proteinTargetGrams: 115,
    goal: 'Healthy Weight Gain & Athletic Stamina (+3kg muscle)',
    assignedDietitianId: 'dt-1', // Under Faseela Saleem
    dietPlanId: 'dp-2',
    status: 'inactive', // inactive report trigger!
    joinedDate: '2026-08-18',
    lastActiveDate: '2026-09-09',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
    medicalNotes: 'Marathon runner. High metabolic rate. Last logged 6 days ago.'
  }
];

// Initial meal logs for Sarah Jenkins (cl-1) for today and recent days
export const INITIAL_MEAL_LOGS: MealLogItem[] = [
  // Today's Breakfast
  {
    id: 'ml-1',
    clientId: 'cl-1',
    date: '2026-09-15',
    mealType: 'Breakfast',
    foodId: 'f-11',
    foodName: 'Rolled Oats (Dry)',
    quantity: 1,
    servingUnit: '1/2 cup (40g)',
    calories: 152,
    protein: 5.3,
    carbs: 27,
    fat: 2.6,
    timeLogged: '08:15 AM'
  },
  {
    id: 'ml-2',
    clientId: 'cl-1',
    date: '2026-09-15',
    mealType: 'Breakfast',
    foodId: 'f-21',
    foodName: 'Greek Yogurt (Plain / Low Fat)',
    quantity: 1,
    servingUnit: '1 cup (170g)',
    calories: 100,
    protein: 17,
    carbs: 6,
    fat: 0.7,
    timeLogged: '08:16 AM'
  },
  {
    id: 'ml-3',
    clientId: 'cl-1',
    date: '2026-09-15',
    mealType: 'Breakfast',
    foodId: 'f-20',
    foodName: 'Fresh Blueberries',
    quantity: 1,
    servingUnit: '1/2 cup (75g)',
    calories: 42,
    protein: 0.6,
    carbs: 10.5,
    fat: 0.2,
    timeLogged: '08:18 AM'
  },
  // Today's Morning Snack
  {
    id: 'ml-4',
    clientId: 'cl-1',
    date: '2026-09-15',
    mealType: 'Morning Snack',
    foodId: 'f-17',
    foodName: 'Crisp Apple',
    quantity: 1,
    servingUnit: '1 medium (180g)',
    calories: 95,
    protein: 0.5,
    carbs: 25,
    fat: 0.3,
    timeLogged: '11:10 AM'
  },
  {
    id: 'ml-5',
    clientId: 'cl-1',
    date: '2026-09-15',
    mealType: 'Morning Snack',
    foodId: 'f-24',
    foodName: 'Raw Almonds & Walnuts',
    quantity: 0.6,
    servingUnit: 'Handful (25g)',
    calories: 93,
    protein: 3,
    carbs: 2.4,
    fat: 8.4,
    timeLogged: '11:12 AM'
  },
  // Today's Lunch
  {
    id: 'ml-6',
    clientId: 'cl-1',
    date: '2026-09-15',
    mealType: 'Lunch',
    foodId: 'f-1',
    foodName: 'Grilled Chicken Breast',
    quantity: 1.2,
    servingUnit: '100g (cooked)',
    calories: 198,
    protein: 37.2,
    carbs: 0,
    fat: 4.3,
    timeLogged: '01:30 PM'
  },
  {
    id: 'ml-7',
    clientId: 'cl-1',
    date: '2026-09-15',
    mealType: 'Lunch',
    foodId: 'f-9',
    foodName: 'Whole Wheat Roti / Chapati',
    quantity: 1.5,
    servingUnit: '1 medium roti (35g)',
    calories: 156,
    protein: 4.8,
    carbs: 30,
    fat: 1.8,
    timeLogged: '01:32 PM'
  },
  {
    id: 'ml-8',
    clientId: 'cl-1',
    date: '2026-09-15',
    mealType: 'Lunch',
    foodId: 'f-14',
    foodName: 'Mixed Green Salad (Cucumber, Tomato, Greens)',
    quantity: 1,
    servingUnit: '1 large bowl (200g)',
    calories: 45,
    protein: 2,
    carbs: 8,
    fat: 0.5,
    timeLogged: '01:35 PM'
  },

  // Yesterday's full day (2026-09-14)
  { id: 'ml-y1', clientId: 'cl-1', date: '2026-09-14', mealType: 'Breakfast', foodId: 'f-2', foodName: 'Boiled Eggs (2 whole)', quantity: 1, servingUnit: '2 large eggs', calories: 144, protein: 12.6, carbs: 0.8, fat: 9.8, timeLogged: '08:30 AM' },
  { id: 'ml-y2', clientId: 'cl-1', date: '2026-09-14', mealType: 'Breakfast', foodId: 'f-13', foodName: 'Whole Grain Bread', quantity: 2, servingUnit: '1 slice (32g)', calories: 164, protein: 8, carbs: 28, fat: 2.2, timeLogged: '08:32 AM' },
  { id: 'ml-y3', clientId: 'cl-1', date: '2026-09-14', mealType: 'Morning Snack', foodId: 'f-19', foodName: 'Papaya Cubes', quantity: 1, servingUnit: '1 cup (145g)', calories: 62, protein: 0.7, carbs: 16, fat: 0.4, timeLogged: '11:15 AM' },
  { id: 'ml-y4', clientId: 'cl-1', date: '2026-09-14', mealType: 'Lunch', foodId: 'f-7', foodName: 'Yellow Moong Dal (Cooked)', quantity: 1, servingUnit: '1 medium bowl (150g)', calories: 145, protein: 9, carbs: 24, fat: 1.5, timeLogged: '01:45 PM' },
  { id: 'ml-y5', clientId: 'cl-1', date: '2026-09-14', mealType: 'Lunch', foodId: 'f-10', foodName: 'Brown Rice (Cooked)', quantity: 1, servingUnit: '1 cup (150g)', calories: 168, protein: 3.5, carbs: 36, fat: 1.3, timeLogged: '01:45 PM' },
  { id: 'ml-y6', clientId: 'cl-1', date: '2026-09-14', mealType: 'Evening Snack', foodId: 'f-27', foodName: 'Roasted Makhana (Fox Nuts)', quantity: 1, servingUnit: '1 bowl (30g)', calories: 106, protein: 3, carbs: 20, fat: 1.2, timeLogged: '05:20 PM' },
  { id: 'ml-y7', clientId: 'cl-1', date: '2026-09-14', mealType: 'Dinner', foodId: 'f-6', foodName: 'Salmon Fillet (Baked)', quantity: 1, servingUnit: '100g', calories: 206, protein: 22, carbs: 0, fat: 12, timeLogged: '08:15 PM' },
  { id: 'ml-y8', clientId: 'cl-1', date: '2026-09-14', mealType: 'Dinner', foodId: 'f-15', foodName: 'Steamed Broccoli & Cauliflower', quantity: 1, servingUnit: '1 cup (150g)', calories: 48, protein: 3.8, carbs: 8.4, fat: 0.6, timeLogged: '08:15 PM' },
];

// Initial measurements for Sarah Jenkins (cl-1) showing progress over time & centre device readings
export const INITIAL_MEASUREMENTS: BodyMeasurement[] = [
  {
    id: 'm-1',
    clientId: 'cl-1',
    date: '2026-07-15',
    source: 'centre_device',
    enteredBy: 'Dr. Maya Lin',
    deviceModel: 'InBody 270 Body Composition Analyzer',
    weightKg: 74.5,
    heightCm: 165,
    bmi: 27.4,
    bodyFatPercentage: 32.8,
    muscleMassKg: 24.1,
    visceralFatLevel: 9,
    waistCm: 88,
    hipCm: 104,
    chestCm: 94,
    notes: 'Baseline initial consultation assessment. Elevated visceral fat, recommended 1500 kcal plan.'
  },
  {
    id: 'm-2',
    clientId: 'cl-1',
    date: '2026-07-29',
    source: 'client_self',
    enteredBy: 'Sarah (Self-log)',
    weightKg: 73.6,
    waistCm: 87,
    hipCm: 103,
    notes: 'Home bathroom scale morning check. Feeling less bloated.'
  },
  {
    id: 'm-3',
    clientId: 'cl-1',
    date: '2026-08-12',
    source: 'centre_device',
    enteredBy: 'Dr. Maya Lin',
    deviceModel: 'InBody 270 Body Composition Analyzer',
    weightKg: 72.3,
    heightCm: 165,
    bmi: 26.5,
    bodyFatPercentage: 31.2,
    muscleMassKg: 24.3,
    visceralFatLevel: 8,
    waistCm: 85,
    hipCm: 102,
    chestCm: 93,
    notes: '4-week clinical checkup. Body fat down 1.6%, muscle mass preserved.'
  },
  {
    id: 'm-4',
    clientId: 'cl-1',
    date: '2026-08-26',
    source: 'client_self',
    enteredBy: 'Sarah (Self-log)',
    weightKg: 71.1,
    waistCm: 83.5,
    hipCm: 100.5,
    notes: 'Completed 10k steps 5 days in a row.'
  },
  {
    id: 'm-5',
    clientId: 'cl-1',
    date: '2026-09-09',
    source: 'centre_device',
    enteredBy: 'Dr. Maya Lin',
    deviceModel: 'InBody 270 Body Composition Analyzer',
    weightKg: 70.2,
    heightCm: 165,
    bmi: 25.8,
    bodyFatPercentage: 29.5,
    muscleMassKg: 24.4,
    visceralFatLevel: 7,
    waistCm: 82,
    hipCm: 99,
    chestCm: 91,
    notes: 'Week 8 centre review. Visceral fat dropped to level 7. Great adherence!'
  },
  {
    id: 'm-6',
    clientId: 'cl-1',
    date: '2026-09-14',
    source: 'client_self',
    enteredBy: 'Sarah (Self-log)',
    weightKg: 69.8,
    waistCm: 81.5,
    hipCm: 98.5,
    notes: 'Broke below the 70kg milestone this morning!'
  }
];

export const INITIAL_TIPS: DietitianTip[] = [
  {
    id: 'tip-1',
    dietitianId: 'admin-1',
    dietitianName: 'Saleem Valanchery (Wellness Coach)',
    clientId: 'cl-1',
    targetAudience: 'specific',
    type: 'note',
    title: 'Fantastic milestone on reaching 69.8 kg!',
    message: 'Sarah, so proud of your consistency! Breaking below 70kg is a huge milestone. Continue maintaining your morning water intake and keep dinner light and nutrient-rich.',
    createdAt: '2026-09-14 09:30 AM'
  },
  {
    id: 'tip-2',
    dietitianId: 'dt-1',
    dietitianName: 'Faseela Saleem (Wellness Coach)',
    clientId: null,
    targetAudience: 'all',
    type: 'tip',
    title: 'Beat the 4 PM Sugar Cravings with Roasted Makhana or Almonds',
    message: 'When energy dips in the late afternoon, reach for dry roasted makhana (fox nuts) or a handful of raw almonds rather than sugary biscuits. It keeps your insulin steady!',
    createdAt: '2026-09-13 03:15 PM'
  },
  {
    id: 'tip-3',
    dietitianId: 'admin-1',
    dietitianName: 'Saleem Valanchery (Wellness Coach)',
    clientId: 'cl-1',
    targetAudience: 'specific',
    type: 'reminder',
    title: 'Reminder: Scheduled Wellness Checkup next Tuesday',
    message: 'Your monthly body composition scan is due on September 22nd. Please come in fasting for 2 hours before the scan for accurate readings.',
    createdAt: '2026-09-12 11:00 AM'
  },
  {
    id: 'tip-4',
    dietitianId: 'dt-2',
    dietitianName: 'Rahul Sharma, MS',
    clientId: null,
    targetAudience: 'all',
    type: 'tip',
    title: 'Electrolytes & Morning Hydration Rule',
    message: 'Add a pinch of pink Himalayan salt and a squeeze of fresh lemon to 500ml lukewarm water every morning. It boosts cellular hydration and digestive enzymes.',
    createdAt: '2026-09-10 08:00 AM'
  }
];

export const INITIAL_REMINDERS: ClientReminder[] = [
  {
    id: 'rem-1',
    clientId: 'cl-1',
    title: 'Log Your Breakfast',
    time: '08:30 AM',
    type: 'meal',
    enabled: true,
    message: 'Take 30 seconds to record what you ate for breakfast to stay on track.'
  },
  {
    id: 'rem-2',
    clientId: 'cl-1',
    title: 'Midday Hydration & Lunch Log',
    time: '01:30 PM',
    type: 'meal',
    enabled: true,
    message: 'Have you drank 1.5L of water yet? Log your lunch foods and portions.'
  },
  {
    id: 'rem-3',
    clientId: 'cl-1',
    title: 'Log Your Dinner',
    time: '08:30 PM',
    type: 'meal',
    enabled: true,
    message: 'Finish your day strong by logging dinner before heading to bed.'
  },
  {
    id: 'rem-4',
    clientId: 'cl-1',
    title: 'Weekly Body Measurement Check',
    time: 'Every Monday 07:30 AM',
    type: 'measurement',
    enabled: true,
    message: 'Step on your scale and measure waist circumference for your dietitian review.'
  }
];
