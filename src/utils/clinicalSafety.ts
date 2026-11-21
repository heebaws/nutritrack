import { ActivityLevel, ClientProfile } from '../types';

export type BMICategoryKey = 'underweight' | 'healthy' | 'overweight' | 'obese';

export interface BMIAssessment {
  bmi: number;
  categoryKey: BMICategoryKey;
  label: string;
  shortLabel: string;
  healthyRangeKg: { min: number; max: number };
  healthyRangeLbs: { min: number; max: number };
  alertType: 'none' | 'underweight' | 'obese' | 'caution';
  bannerMessage?: string;
  clinicalNote: string;
  gaugePercent: number; // 0-100 on 14..40 BMI axis
}

export const CLINICAL_DISCLAIMER =
  'Guidance & estimates in NutriTrack support healthy habits and are not a substitute for professional medical or registered dietitian advice.';

export function cmToFtIn(cm: number): { feet: number; inches: number } {
  const safeCm = Math.max(90, Math.min(240, Number(cm) || 165));
  const totalInches = safeCm / 2.54;
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches - feet * 12);
  if (inches === 12) {
    feet += 1;
    inches = 0;
  }
  return { feet, inches };
}

export function ftInToCm(feet: number, inches: number): number {
  const totalInches = Math.max(36, Math.min(96, (Number(feet) || 5) * 12 + (Number(inches) || 0)));
  return Math.round(totalInches * 2.54);
}

export function kgToLbs(kg: number): number {
  return Math.round((Number(kg) || 0) * 2.20462 * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  return Math.round(((Number(lbs) || 0) / 2.20462) * 10) / 10;
}

/**
 * Assesses BMI using WHO clinical bands and computes healthy weight bounds for height.
 * Surfaces supportive non-alarmist guidance if Underweight (<18.5) or Obese (>=30).
 */
export function assessBMI(weightKg: number, heightCm: number): BMIAssessment {
  const safeW = Math.max(25, Math.min(280, Number(weightKg) || 65));
  const safeH = Math.max(100, Math.min(240, Number(heightCm) || 165));
  const heightM = safeH / 100;
  const bmi = Math.round((safeW / (heightM * heightM)) * 10) / 10;

  const minHealthyKg = Math.round(18.5 * heightM * heightM * 10) / 10;
  const maxHealthyKg = Math.round(24.9 * heightM * heightM * 10) / 10;

  let categoryKey: BMICategoryKey = 'healthy';
  let label = 'Healthy Weight';
  let shortLabel = 'Healthy';
  let alertType: BMIAssessment['alertType'] = 'none';
  let bannerMessage: string | undefined;
  let clinicalNote =
    'Your BMI sits inside the standard healthy range (18.5–24.9). Focus on steady protein, fiber, hydration, and enjoyable movement.';

  if (bmi < 18.5) {
    categoryKey = 'underweight';
    label = 'Underweight (<18.5)';
    shortLabel = 'Underweight';
    alertType = 'underweight';
    bannerMessage =
      'Your BMI is below 18.5. We recommend pausing calorie deficits and checking with a healthcare clinician or registered dietitian to build nourishing strength safely.';
    clinicalNote =
      'Nutrient-dense meals, adequate protein, and medical check-ins help support healthy body mass without strain.';
  } else if (bmi < 25) {
    categoryKey = 'healthy';
    label = 'Healthy Weight (18.5–24.9)';
    shortLabel = 'Healthy';
    alertType = 'none';
  } else if (bmi < 30) {
    categoryKey = 'overweight';
    label = 'Overweight (25.0–29.9)';
    shortLabel = 'Overweight';
    alertType = 'caution';
    clinicalNote =
      'A moderate, sustainable calorie balance (up to 0.5–0.75 kg/week) with daily steps works far better than aggressive restriction.';
  } else {
    categoryKey = 'obese';
    label = 'Obese Range (≥30.0)';
    shortLabel = 'Elevated BMI';
    alertType = 'obese';
    bannerMessage =
      'Your BMI is ≥ 30. NutriTrack keeps your daily plan sustainable and joint-friendly—please pair this plan with periodic medical or registered dietitian check-ins.';
    clinicalNote =
      'Prioritize joint-friendly low-impact cardio, adequate protein, and a gentle calorie target above clinical floors.';
  }

  // Map BMI 14..40 -> 0..100%
  const gaugePercent = Math.max(2, Math.min(98, Math.round(((bmi - 14) / 26) * 100)));

  return {
    bmi,
    categoryKey,
    label,
    shortLabel,
    healthyRangeKg: { min: minHealthyKg, max: maxHealthyKg },
    healthyRangeLbs: { min: kgToLbs(minHealthyKg), max: kgToLbs(maxHealthyKg) },
    alertType,
    bannerMessage,
    clinicalNote,
    gaugePercent,
  };
}

/**
 * Evidence-based minimum daily calorie safety floors:
 * - Female: >= 1,200 kcal/day
 * - Male: >= 1,500 kcal/day
 * - Other: >= 1,350 kcal/day
 */
export function getSafeCalorieFloor(gender: ClientProfile['gender'] | string): number {
  if (gender === 'Female') return 1200;
  if (gender === 'Male') return 1500;
  return 1350;
}

export function getActivityMultiplier(level?: ActivityLevel): number {
  switch (level) {
    case 'sedentary':
      return 1.2;
    case 'light':
      return 1.375;
    case 'moderate':
      return 1.55;
    case 'active':
      return 1.725;
    case 'very_active':
      return 1.9;
    default:
      return 1.45;
  }
}

/**
 * Computes Mifflin-St Jeor BMR & TDEE from anthropometric fields.
 */
export function calculateMifflinTDEE(params: {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: ClientProfile['gender'];
  activityLevel?: ActivityLevel;
}): { bmr: number; tdee: number } {
  const w = Math.max(30, Number(params.weightKg) || 65);
  const h = Math.max(110, Number(params.heightCm) || 165);
  const a = Math.max(12, Number(params.age) || 30);
  const sexOffset = params.gender === 'Male' ? 5 : params.gender === 'Female' ? -161 : -78;
  const bmr = Math.round(10 * w + 6.25 * h - 5 * a + sexOffset);
  const tdee = Math.round(bmr * getActivityMultiplier(params.activityLevel));
  return { bmr, tdee };
}

export interface SafeGoalValidation {
  safeTargetWeightKg: number;
  safeWeeklyRateKg: number;
  safeDailyCalories: number;
  calorieFloor: number;
  warnings: string[];
  wasAdjusted: boolean;
}

/**
 * Enforces safety guardrails:
 * 1) Never allows target weight below BMI 18.5.
 * 2) Caps weekly weight loss at <= 1.0 kg/week.
 * 3) Enforces daily calorie floor (>=1,200 women / >=1,500 men).
 */
export function validateSafeGoalSettings(input: {
  currentWeightKg: number;
  targetWeightKg: number;
  heightCm: number;
  age: number;
  gender: ClientProfile['gender'];
  goalType: 'loss' | 'gain' | 'maintenance';
  activityLevel?: ActivityLevel;
  requestedWeeklyRateKg?: number;
  requestedCalories?: number;
}): SafeGoalValidation {
  const warnings: string[] = [];
  let wasAdjusted = false;
  const heightM = Math.max(1.1, (Number(input.heightCm) || 165) / 100);
  const minHealthyKg = Math.round(18.5 * heightM * heightM * 10) / 10;

  let safeTargetWeightKg = Number(input.targetWeightKg) || input.currentWeightKg;
  if (input.goalType === 'loss' && safeTargetWeightKg < minHealthyKg) {
    safeTargetWeightKg = minHealthyKg;
    warnings.push(
      `Target weight adjusted to ${minHealthyKg} kg (BMI 18.5) so your goal never enters the underweight range.`
    );
    wasAdjusted = true;
  }

  let safeWeeklyRateKg = Math.abs(Number(input.requestedWeeklyRateKg) || 0.5);
  if (input.goalType === 'loss' && safeWeeklyRateKg > 1.0) {
    safeWeeklyRateKg = 1.0;
    warnings.push('Weekly loss rate capped at 1.0 kg/week to protect lean muscle and energy.');
    wasAdjusted = true;
  }
  if (input.goalType === 'gain' && safeWeeklyRateKg > 0.75) {
    safeWeeklyRateKg = 0.75;
  }

  const { tdee } = calculateMifflinTDEE({
    weightKg: input.currentWeightKg,
    heightCm: input.heightCm,
    age: input.age,
    gender: input.gender,
    activityLevel: input.activityLevel,
  });

  const calorieFloor = getSafeCalorieFloor(input.gender);
  // 8,000 kcal = 1 kg -> ~1,143 kcal/day for 1kg/wk, capped safely at moderate deficit <= 800 kcal/day
  const deltaFromRate = Math.round((safeWeeklyRateKg * 8000) / 7);
  let computedTargetCal = tdee;
  if (input.goalType === 'loss') {
    computedTargetCal = tdee - Math.min(850, deltaFromRate);
  } else if (input.goalType === 'gain') {
    computedTargetCal = tdee + Math.min(500, deltaFromRate);
  }

  let safeDailyCalories =
    input.requestedCalories && input.requestedCalories > 0
      ? Math.round(input.requestedCalories)
      : computedTargetCal;

  if (safeDailyCalories < calorieFloor) {
    safeDailyCalories = calorieFloor;
    warnings.push(
      `Daily calorie budget raised to the safe clinical minimum of ${calorieFloor.toLocaleString()} kcal/day.`
    );
    wasAdjusted = true;
  }

  return {
    safeTargetWeightKg: Math.round(safeTargetWeightKg * 10) / 10,
    safeWeeklyRateKg: Math.round(safeWeeklyRateKg * 100) / 100,
    safeDailyCalories,
    calorieFloor,
    warnings,
    wasAdjusted,
  };
}

/**
 * Computes projected goal date using either observed recent net calorie trend (8,000 kcal = 1 kg)
 * or configured safe daily budget delta vs maintenance TDEE.
 */
export function computeProjectedGoalDate(params: {
  currentWeightKg: number;
  targetWeightKg: number;
  goalType: 'loss' | 'gain' | 'maintenance';
  dailyTargetCalories: number;
  estimatedTdee: number;
  recent7DayAvgNetDelta?: number; // avg daily (eaten - burned - target)
}): {
  daysToGoal: number | null;
  projectedDateStr: string | null;
  projectedWeeklyKg: number;
  trendLabel: string;
} {
  const diffKg = params.targetWeightKg - params.currentWeightKg;
  if (params.goalType === 'maintenance' || Math.abs(diffKg) < 0.25) {
    return {
      daysToGoal: 0,
      projectedDateStr: null,
      projectedWeeklyKg: 0,
      trendLabel: 'At maintenance target',
    };
  }

  // Theoretical daily balance relative to maintenance TDEE
  const baseDailyBalance = params.dailyTargetCalories - params.estimatedTdee;
  // Blend with recent adherence shift if logged
  const effectiveDailyBalance =
    params.recent7DayAvgNetDelta !== undefined
      ? baseDailyBalance + params.recent7DayAvgNetDelta * 0.45
      : baseDailyBalance;

  const movingTowardGoal =
    (diffKg < 0 && effectiveDailyBalance < -60) ||
    (diffKg > 0 && effectiveDailyBalance > 60);

  if (!movingTowardGoal) {
    const fallbackDaily = diffKg < 0 ? -450 : 300;
    const estDays = Math.min(365, Math.max(7, Math.round((Math.abs(diffKg) * 8000) / Math.abs(fallbackDaily))));
    const d = new Date();
    d.setDate(d.getDate() + estDays);
    return {
      daysToGoal: estDays,
      projectedDateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      projectedWeeklyKg: Math.round(((fallbackDaily * 7) / 8000) * 100) / 100,
      trendLabel: 'Based on planned safe pace',
    };
  }

  const kcalNeeded = Math.abs(diffKg) * 8000;
  const daysToGoal = Math.min(365, Math.max(7, Math.round(kcalNeeded / Math.abs(effectiveDailyBalance))));
  const projectedDate = new Date();
  projectedDate.setDate(projectedDate.getDate() + daysToGoal);

  return {
    daysToGoal,
    projectedDateStr: projectedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    projectedWeeklyKg: Math.round(((effectiveDailyBalance * 7) / 8000) * 100) / 100,
    trendLabel: 'Live trajectory projection',
  };
}
