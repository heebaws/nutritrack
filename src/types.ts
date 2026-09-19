export type UserRole = 'client' | 'dietitian' | 'admin' | 'coach';

export interface ClientProfile {
  id: string;
  name: string;
  username?: string;
  password?: string;
  phone: string;
  email?: string;
  gender: 'Female' | 'Male' | 'Other';
  age: number;
  heightCm: number;
  startingWeightKg: number;
  currentWeightKg: number;
  targetWeightKg: number; // needed weight
  
  // Body Composition & Health Metrics
  bodyFatPercentage?: number; // Current fat %
  targetBodyFatPercentage?: number; // Needed fat % (Men: 10-30%, Women: 20-30%)
  bodyFatStatus?: string; // e.g. "Normal (10-30%)", "Elevated", "High"

  visceralFat?: number; // Current V-Fat rating
  targetVisceralFat?: number; // Needed V-Fat (5-9)
  visceralFatStatus?: string; // e.g. "Normal (5-9)", "Elevated (10-14)", "High (15+)"

  bmi?: number; // Current BMI (kg/m^2)
  targetBmi?: number; // Needed BMI (15-23)
  bmiStatus?: string; // e.g. "Normal (15-23)", "Higher (>23)"

  bmr?: number; // Basal Metabolic Rate (baseline kcal/day)
  targetBmr?: number; // Required daily calories based on activity/work
  bmrStatus?: string; // e.g. "Sedentary Desk Job", "Moderate Physical Work", "Heavy Active Work"

  // USER MANDATE: Needed daily calorie (denominator in main bar) & Goal requirement
  neededCalories?: number; // Custom-typed daily calorie requirement (denominator in main bar)
  goalType?: 'loss' | 'gain' | 'maintenance'; // Requirement: Weight Loss vs Weight Gain vs Maintenance

  // USER MANDATE: Optional human body metrics & minerals (all optional)
  muscleMassKg?: number; // Skeletal Muscle Mass in kg (optional)
  targetMuscleMassKg?: number; // Target muscle mass in kg (optional)
  boneMassKg?: number; // Bone mineral / Calcium in kg (optional, e.g. 2.2 - 3.2 kg)
  bodyWaterPercentage?: number; // Total Body Water % (optional, e.g. 50-65%)
  dailyWaterTargetLiters?: number; // Daily water intake needed in Liters (optional, e.g. 2.5 - 3.5 L)
  proteinTargetGrams?: number; // Daily protein requirement in grams (optional)

  goal: string;
  assignedDietitianId: string;
  dietPlanId?: string;
  status: 'active' | 'inactive';
  joinedDate: string;
  lastActiveDate: string;
  avatarUrl?: string;
  medicalNotes?: string;
}

export interface DietitianProfile {
  id: string;
  name: string;
  username?: string;
  password?: string;
  role: 'dietitian' | 'admin';
  email: string;
  phone: string;
  title: string;
  specialization: string;
  bio: string;
  avatarUrl?: string;
}

export type FoodCategory = 
  | 'Proteins'
  | 'Grains & Breads'
  | 'Vegetables'
  | 'Fruits'
  | 'Dairy & Alternatives'
  | 'Nuts & Healthy Fats'
  | 'Beverages & Snacks';

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  servingUnit: string; // e.g. "1 medium bowl (150g)", "1 medium apple", "1 cup (240ml)", "100g"
  servingGrams?: number;
  calories: number; // per servingUnit
  protein: number;  // grams
  carbs: number;    // grams
  fat: number;      // grams
  fiber?: number;   // grams
  isCustom?: boolean;
  addedBy?: string;
}

export type MealType = 
  | 'Breakfast'
  | 'Morning Snack'
  | 'Lunch'
  | 'Evening Snack'
  | 'Dinner';

export interface MealLogItem {
  id: string;
  clientId: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  foodId: string;
  foodName: string;
  quantity: number; // multiplier of servingUnit (e.g. 1, 1.5, 2)
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timeLogged: string;
}

export interface RecommendedFood {
  foodId: string;
  foodName: string;
  portion: number;
  unit: string;
  notes?: string;
}

export interface DietPlanMeal {
  mealType: MealType;
  timeGuideline: string;
  recommendedFoods: RecommendedFood[];
  instructions?: string;
}

export interface DietPlan {
  id: string;
  title: string;
  description: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  waterTargetLitres: number;
  createdByDietitianId: string;
  meals: DietPlanMeal[];
  generalGuidelines: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BodyMeasurement {
  id: string;
  clientId: string;
  date: string; // YYYY-MM-DD
  source: 'client_self' | 'centre_device';
  enteredBy: string; // e.g. "Client" or "Dr. Maya Lin (InBody 270)"
  deviceModel?: string; // e.g. "InBody 270 Body Composition Analyzer"
  weightKg: number;
  heightCm?: number;
  bmi?: number;
  bodyFatPercentage?: number;
  muscleMassKg?: number;
  visceralFatLevel?: number;
  waistCm?: number;
  hipCm?: number;
  chestCm?: number;
  boneMassKg?: number; // Calcium / Bone Mineral (kg, optional)
  bodyWaterPercentage?: number; // Total Body Water % (optional)
  notes?: string;
}

export interface DietitianTip {
  id: string;
  dietitianId: string;
  dietitianName: string;
  clientId?: string | null; // null means broadcast to all clients of this dietitian or all clients
  targetAudience: 'all' | 'specific' | 'inactive';
  type: 'tip' | 'note' | 'reminder';
  title: string;
  message: string;
  createdAt: string;
}

export interface ClientReminder {
  id: string;
  clientId: string;
  title: string;
  time: string; // e.g. "08:30 AM"
  type: 'meal' | 'measurement' | 'water' | 'centre_visit';
  enabled: boolean;
  message: string;
}

export interface AISuggestedMealFood {
  name: string;
  servingUnit: string;
  quantity: number;
  calories: number; // EACH food's calories
  protein: number;
  carbs: number;
  fat: number;
  category?: FoodCategory | string;
}

export interface AISuggestedMeal {
  id: string;
  clientId: string;
  date: string; // YYYY-MM-DD
  timeGiven: string; // e.g. "8:30 AM"
  mealType: MealType; // Breakfast, Morning Snack, Lunch, Evening Snack, Dinner
  foods: AISuggestedMealFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  status: 'pending' | 'accepted' | 'dismissed';
  createdAt: string;
  note?: string;
}
