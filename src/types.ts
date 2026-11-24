export type ViewMode = 'client' | 'team' | 'login';

export type UserRole = 'client' | 'dietitian' | 'admin' | 'coach';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

export type DietPreference =
  | 'balanced'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'eggetarian'
  | 'high_protein'
  | 'low_carb'
  | 'kerala_traditional';

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type EquipmentAccess = 'none_home' | 'dumbbells_bands' | 'full_gym';

export interface AvatarTraitOverrides {
  skinToneHex?: string;
  hairStyle?: 'short' | 'wavy' | 'long' | 'bun' | 'curly' | 'buzz' | 'parted';
  hairColorHex?: string;
  eyeColorHex?: string;
  eyebrowThickness?: 'light' | 'medium' | 'thick';
  facialHair?: 'none' | 'stubble' | 'beard' | 'mustache';
  glasses?: 'none' | 'round' | 'rectangular' | 'browline';
  faceShape?: 'oval' | 'round' | 'square' | 'heart' | 'chiseled';
}

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
  targetBodyFatPercentage?: number; // Needed fat % (Men: 10-20%, Women: 20-30%)
  bodyFatStatus?: string;

  visceralFat?: number; // Current V-Fat rating
  targetVisceralFat?: number; // Needed V-Fat (0.5-9)
  visceralFatStatus?: string;

  bmi?: number; // Current BMI (kg/m^2)
  targetBmi?: number; // Needed BMI (18-23)
  bmiStatus?: string;

  bmr?: number; // Basal Metabolic Rate (baseline kcal/day)
  targetBmr?: number; // Required daily calories based on activity/work
  bmrStatus?: string;

  // Daily calorie budget & Goal requirement
  neededCalories?: number;
  goalType?: 'loss' | 'gain' | 'maintenance';
  weeklyRateKg?: number; // Planned weekly change capped safely at <= 1.0 kg/week

  // Optional human body metrics & minerals
  muscleMassKg?: number;
  targetMuscleMassKg?: number;
  boneMassKg?: number;
  bodyWaterPercentage?: number;
  dailyWaterTargetLiters?: number;
  proteinTargetGrams?: number;

  // Onboarding, Personalization & Adaptive Engine Profile
  activityLevel?: ActivityLevel;
  dietPreference?: DietPreference;
  allergies?: string[];
  experienceLevel?: ExperienceLevel;
  scheduleDaysPerWeek?: number;
  equipment?: EquipmentAccess;
  eatingHabits?: string;
  onboardingCompleted?: boolean;
  preferredUnitSystem?: 'metric' | 'imperial';
  lastLevelEvaluatedAt?: string;

  // Custom Photo & Face-Matched Avatar Fine-Tuning
  avatarUrl?: string;
  avatarTraits?: AvatarTraitOverrides;

  goal: string;
  assignedDietitianId: string;
  dietPlanId?: string;
  status: 'active' | 'inactive';
  joinedDate: string;
  lastActiveDate: string;
  medicalNotes?: string;
  readTipIds?: string[];

  // Glycemic / Diabetes & Blood Pressure Registration & Targets
  diabeticStatus?: DiabeticStatus;
  fastingSugarTargetMgDl?: number;
  postMealSugarTargetMgDl?: number;
  hypertensionOrSaltSensitive?: boolean;
}

export interface DietitianProfile {
  id: string;
  name: string;
  username?: string;
  password?: string;
  role: 'dietitian' | 'admin' | 'super_admin';
  isSuperAdmin?: boolean;
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
  servingUnit: string;
  servingGrams?: number;
  calories: number; // per servingUnit
  protein: number;  // grams
  carbs: number;    // grams
  fat: number;      // grams
  fiber?: number;   // grams
  sugar?: number;   // grams
  sodium?: number;  // mg
  calcium?: number; // mg
  iron?: number;    // mg
  magnesium?: number; // mg
  vitaminD?: number;  // IU
  glycemicIndex?: 'low' | 'medium' | 'high' | string;
  allergenInfo?: string;
  clinicVerified?: boolean;
  dietaryTags?: string[];
  standardServingUnit?: string;
  standardServingGrams?: number;
  description?: string;
  isCustom?: boolean;
  addedBy?: string;
  calorieQuality?: 'good' | 'bad';
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
  quantity: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  calcium?: number;
  iron?: number;
  magnesium?: number;
  vitaminD?: number;
  timeLogged: string;
  calorieQuality?: 'good' | 'bad';
  isCheatMeal?: boolean;
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
  enteredBy: string;
  deviceModel?: string;
  weightKg: number;
  heightCm?: number;
  bmi?: number;
  bodyFatPercentage?: number;
  muscleMassKg?: number;
  visceralFatLevel?: number;
  waistCm?: number;
  hipCm?: number;
  chestCm?: number;
  boneMassKg?: number;
  bodyWaterPercentage?: number;
  notes?: string;
}

export interface DietitianTip {
  id: string;
  dietitianId: string;
  dietitianName: string;
  clientId?: string | null;
  targetAudience: 'all' | 'specific' | 'inactive';
  type: 'tip' | 'note' | 'reminder' | 'challenge' | 'digest';
  title: string;
  message: string;
  createdAt: string;
}

export interface ClientReminder {
  id: string;
  clientId: string;
  title: string;
  time: string;
  type: 'meal' | 'measurement' | 'water' | 'centre_visit' | 'workout' | 'challenge' | 'digest';
  enabled: boolean;
  message: string;
  mealSlot?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  deliveredChannel?: 'in_app' | 'mobile_push' | 'sms';
}

export interface AccountabilityChallenge {
  id: string;
  clientId: string;
  triggerDate: string; // YYYY-MM-DD when the extra cheat meal was logged
  targetDate: string;  // YYYY-MM-DD (tomorrow relative to triggerDate)
  title: string;
  description: string;
  triggerMealName: string;
  cheatCountThisMonth: number;
  mode: 'standard' | 'split_sets' | 'joint_friendly';
  completed: boolean;
  completedAt?: string;
  setsCompleted?: number;
  totalSets?: number;
  createdAt: string;
}

export interface AISuggestedMealFood {
  name: string;
  servingUnit: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  calcium?: number;
  iron?: number;
  magnesium?: number;
  vitaminD?: number;
  category?: FoodCategory | string;
}

export interface AISuggestedMeal {
  id: string;
  clientId: string;
  date: string; // YYYY-MM-DD
  timeGiven: string;
  mealType: MealType;
  foods: AISuggestedMealFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  status: 'pending' | 'accepted' | 'dismissed';
  createdAt: string;
  note?: string;
}

export interface WaterLog {
  id: string;
  clientId: string;
  date: string; // YYYY-MM-DD
  amountMl: number;
  timeLogged: string;
}

export interface ActivityLog {
  id: string;
  clientId: string;
  date: string; // YYYY-MM-DD
  activityName: string;
  durationMinutes: number;
  caloriesBurned: number;
  intensity: 'light' | 'moderate' | 'vigorous';
  timeLogged: string;
  challengeId?: string;
  notes?: string;
}

export interface DailyHabits {
  id: string;
  clientId: string;
  date: string; // YYYY-MM-DD
  steps: number;
  targetSteps: number;
  sleepHours: number;
  supplementsTaken: boolean;
  saladEaten: boolean;
  stretchingDone: boolean;
  stepsSource?: 'os_sensor' | 'health_import' | 'manual';
  sleepSource?: 'os_auto' | 'health_import' | 'manual';
  lastDeviceSyncAt?: string;
}

export interface ClinicAppointment {
  id: string;
  clientId: string;
  clientName: string;
  dietitianId: string;
  dietitianName: string;
  date: string; // YYYY-MM-DD
  time: string;
  type: 'inbody_scan' | 'diet_review' | 'initial_consult' | 'virtual_checkin';
  status: 'scheduled' | 'completed' | 'cancelled';
  location: string;
  notes?: string;
}

export type DiabeticStatus =
  | 'none'
  | 'prediabetes'
  | 'type1'
  | 'type2'
  | 'gestational';

export type BloodSugarContext =
  | 'fasting'
  | 'pre_meal'
  | 'post_meal_2h'
  | 'bedtime'
  | 'random';

export interface BloodSugarLog {
  id: string;
  clientId: string;
  date: string; // YYYY-MM-DD
  timeLogged: string;
  context: BloodSugarContext;
  valueMgDl: number;
  unitEntered?: 'mg/dL' | 'mmol/L';
  rawEnteredValue?: number;
  hba1cPercent?: number;
  linkedMealType?: MealType;
  foodSugarGramsAtLog?: number;
  foodCarbsGramsAtLog?: number;
  foodSodiumMgAtLog?: number;
  notes?: string;
  createdAt?: string;
}
