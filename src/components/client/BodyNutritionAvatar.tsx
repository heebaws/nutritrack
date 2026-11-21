import React, { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { ClientProfile, MealLogItem } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  calculateDailyNutrientTargets,
  aggregateConsumedNutrients,
} from '../../utils/micronutrients';
import {
  X,
  Dumbbell,
  Wheat,
  Droplets,
  Leaf,
  Scale,
  RotateCcw,
  Utensils,
  Activity,
  HeartPulse,
  Sun,
  Zap,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Maximize2,
} from 'lucide-react';

export interface FaceAvatarTraits {
  skinToneHex: string;
  skinShadowHex: string;
  skinHighlightHex: string;
  hairColorHex: string;
  hairStyle:
    | 'short_curly'
    | 'short_straight'
    | 'side_part'
    | 'spiky'
    | 'long_wavy'
    | 'ponytail'
    | 'bob'
    | 'headwrap'
    | 'bald'
    | string;
  faceShape: 'oval' | 'round' | 'square' | 'heart' | string;
  eyeColorHex: string;
  eyebrowThickness: 'thin' | 'medium' | 'thick' | string;
  eyebrowStyle: 'arched' | 'straight' | string;
  facialHair: 'none' | 'light_stubble' | 'mustache' | 'trimmed_beard' | 'full_beard' | string;
  glasses: 'none' | 'round' | 'rectangular' | string;
  lipToneHex: string;
  expression: 'warm_smile' | 'calm' | 'confident' | string;
  genderPresentation: 'male' | 'female' | 'neutral' | string;
  portraitSummary: string;
  analyzedFromPhoto?: boolean;
}

export interface BodyAvatarMetrics {
  calorieRatio: number;
  fatFactor: number; // -0.95 (lean/deficit) .. 0 (balanced) .. +1.5 (high surplus/fat)
  netCalories: number;
  eatenCalories: number;
  burnedCalories: number;
  neededCalories: number;
  goalCapCalories: number;
  calorieDiff: number;
  protein: { consumed: number; target: number; pct: number };
  carbs: { consumed: number; target: number; pct: number };
  fat: { consumed: number; target: number; pct: number };
  fiber: { consumed: number; target: number; pct: number };
  iron: { consumed: number; target: number; pct: number };
  vitaminD: { consumed: number; target: number; pct: number };
  magnesium: { consumed: number; target: number; pct: number };
  calcium: { consumed: number; target: number; pct: number };
  statusKey: 'losing' | 'balanced' | 'gaining';
}

function safeHex(val: string | undefined, fallback: string): string {
  if (!val || typeof val !== 'string') return fallback;
  return /^#[0-9a-fA-F]{3,8}$/.test(val.trim()) ? val.trim() : fallback;
}

function hashKey(str: string): string {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

export function deriveBaselineHumanTraits(client: ClientProfile): FaceAvatarTraits {
  const isFemale = client.gender === 'Female';
  return {
    skinToneHex: '#d39b74',
    skinShadowHex: '#b47852',
    skinHighlightHex: '#e7b996',
    hairColorHex: '#1f1b1a',
    hairStyle: isFemale ? 'long_wavy' : 'side_part',
    faceShape: 'oval',
    eyeColorHex: '#2f2018',
    eyebrowThickness: isFemale ? 'thin' : 'medium',
    eyebrowStyle: isFemale ? 'arched' : 'straight',
    facialHair: isFemale ? 'none' : 'light_stubble',
    glasses: 'none',
    lipToneHex: isFemale ? '#b96564' : '#ab695e',
    expression: 'warm_smile',
    genderPresentation: isFemale ? 'female' : 'male',
    portraitSummary: isFemale
      ? 'Warm illustrated human portrait calibrated to profile'
      : 'Natural human portrait calibrated to profile',
    analyzedFromPhoto: false,
  };
}

export function useAnalyzedFaceTraits(client: ClientProfile | null) {
  const baseline = useMemo(
    () =>
      client
        ? deriveBaselineHumanTraits(client)
        : deriveBaselineHumanTraits({
            id: 'anon',
            name: 'Member',
            phone: '',
            gender: 'Male',
            age: 30,
            heightCm: 170,
            startingWeightKg: 70,
            currentWeightKg: 70,
            targetWeightKg: 68,
            goal: '',
            assignedDietitianId: '',
            status: 'active',
            joinedDate: '',
            lastActiveDate: '',
          }),
    [client]
  );
  const [traits, setTraits] = useState<FaceAvatarTraits>(baseline);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const cacheKey = useMemo(() => {
    const imgHash = hashKey(client?.avatarUrl || 'no-photo');
    return `nutritrack_face_traits_v2_${client?.id || 'anon'}_${imgHash}`;
  }, [client?.id, client?.avatarUrl]);

  const runAnalysis = useCallback(
    async (forceRefresh = false) => {
      if (!client?.avatarUrl) {
        setTraits(baseline);
        setAnalysisError(null);
        return;
      }

      if (!forceRefresh) {
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached) as FaceAvatarTraits;
            if (parsed && parsed.skinToneHex) {
              setTraits({ ...baseline, ...parsed, analyzedFromPhoto: true });
              setAnalysisError(null);
              return;
            }
          }
        } catch {
          // Ignore storage read errors
        }
      }

      setIsAnalyzing(true);
      setAnalysisError(null);
      try {
        const res = await fetch('/api/ai/analyze-face-avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: client.avatarUrl,
            clientName: client.name,
            gender: client.gender,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data?.traits) {
          throw new Error(data?.error || 'Could not analyze face photo');
        }
        const merged: FaceAvatarTraits = {
          ...baseline,
          ...data.traits,
          skinToneHex: safeHex(data.traits.skinToneHex, baseline.skinToneHex),
          skinShadowHex: safeHex(data.traits.skinShadowHex, baseline.skinShadowHex),
          skinHighlightHex: safeHex(data.traits.skinHighlightHex, baseline.skinHighlightHex),
          hairColorHex: safeHex(data.traits.hairColorHex, baseline.hairColorHex),
          eyeColorHex: safeHex(data.traits.eyeColorHex, baseline.eyeColorHex),
          lipToneHex: safeHex(data.traits.lipToneHex, baseline.lipToneHex),
          analyzedFromPhoto: true,
        };
        setTraits(merged);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(merged));
        } catch {
          // Ignore quota errors
        }
      } catch (err: any) {
        setAnalysisError(err?.message || 'Face scan unavailable right now');
      } finally {
        setIsAnalyzing(false);
      }
    },
    [client?.avatarUrl, client?.name, client?.gender, baseline, cacheKey]
  );

  useEffect(() => {
    setTraits(baseline);
    runAnalysis(false);
  }, [baseline, runAnalysis]);

  return {
    traits,
    isAnalyzing,
    analysisError,
    reanalyze: () => runAnalysis(true),
  };
}

export function computeBodyAvatarMetrics(
  client: ClientProfile,
  logsForDay: MealLogItem[],
  foods: any[],
  burnedCalories: number,
  simulatedExtraCalories: number = 0
): BodyAvatarMetrics {
  const targets = calculateDailyNutrientTargets(client);
  const consumed = aggregateConsumedNutrients(logsForDay, foods);

  const neededCalories = Math.max(
    1000,
    client.neededCalories || client.targetBmr || targets.calories || 1600
  );

  const extraRatio = simulatedExtraCalories / Math.max(1, neededCalories);
  const eatenCalories = Math.max(0, Math.round(consumed.calories + simulatedExtraCalories));
  const netCalories = Math.max(0, eatenCalories - burnedCalories);
  const calorieDiff = netCalories - neededCalories;
  const calorieRatio = netCalories / neededCalories;

  const simProtein = Math.max(0, Number((consumed.protein + Math.max(0, extraRatio) * 18).toFixed(1)));
  const simCarbs = Math.max(0, Number((consumed.carbs + Math.max(0, extraRatio) * 75).toFixed(1)));
  const simFat = Math.max(0, Number((consumed.fat + Math.max(0, extraRatio) * 32).toFixed(1)));
  const simFiber = Math.max(0, Number((consumed.fiber + Math.max(0, extraRatio) * 3).toFixed(1)));

  const heightM = Math.max(1.2, (client.heightCm || 168) / 100);
  const bmi = (client.currentWeightKg || 65) / (heightM * heightM);
  const bmiOffset = Math.max(-0.35, Math.min(0.45, (bmi - 22) * 0.055));

  const intakeOffset =
    calorieRatio >= 1 ? (calorieRatio - 1) * 2.1 : (calorieRatio - 1) * 1.15;

  const fatFactor = Math.max(-0.95, Math.min(1.5, intakeOffset + bmiOffset * 0.45));

  const pctOf = (val: number, target: number) =>
    target > 0 ? Math.min(140, Math.round((val / target) * 100)) : 0;

  const statusKey: 'losing' | 'balanced' | 'gaining' =
    calorieDiff > 120 ? 'gaining' : calorieDiff < -120 ? 'losing' : 'balanced';

  return {
    calorieRatio,
    fatFactor,
    netCalories,
    eatenCalories,
    burnedCalories,
    neededCalories,
    goalCapCalories: targets.calories,
    calorieDiff,
    protein: { consumed: simProtein, target: targets.protein, pct: pctOf(simProtein, targets.protein) },
    carbs: { consumed: simCarbs, target: targets.carbs, pct: pctOf(simCarbs, targets.carbs) },
    fat: { consumed: simFat, target: targets.fat, pct: pctOf(simFat, targets.fat) },
    fiber: { consumed: simFiber, target: targets.fiber, pct: pctOf(simFiber, targets.fiber) },
    iron: { consumed: consumed.iron, target: targets.iron, pct: pctOf(consumed.iron, targets.iron) },
    vitaminD: { consumed: consumed.vitaminD, target: targets.vitaminD, pct: pctOf(consumed.vitaminD, targets.vitaminD) },
    magnesium: { consumed: consumed.magnesium, target: targets.magnesium, pct: pctOf(consumed.magnesium, targets.magnesium) },
    calcium: { consumed: consumed.calcium, target: targets.calcium, pct: pctOf(consumed.calcium, targets.calcium) },
    statusKey,
  };
}

interface BodyNutritionAvatarSVGProps {
  client: ClientProfile;
  metrics: BodyAvatarMetrics;
  traits?: FaceAvatarTraits;
  size?: 'mini' | 'large';
  className?: string;
}

export const BodyNutritionAvatarSVG: React.FC<BodyNutritionAvatarSVGProps> = ({
  client,
  metrics,
  traits: propTraits,
  size = 'mini',
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');
  const bodyClipId = `human-body-clip-${uid}`;
  const skinGradId = `human-skin-grad-${uid}`;
  const proteinGradId = `prot-grad-${uid}`;
  const fatGradId = `fat-grad-${uid}`;
  const carbsGradId = `carb-grad-${uid}`;

  const traits = useMemo(
    () => propTraits || deriveBaselineHumanTraits(client),
    [propTraits, client]
  );

  const f = metrics.fatFactor; // -0.95 .. +1.5
  const isFemale = traits.genderPresentation === 'female' || (!traits.genderPresentation && client.gender === 'Female');
  const isGain = f > 0.15;
  const isLean = f < -0.15;

  // Dynamic organic human proportions responsive to calorie surplus vs deficit
  const cx = 120;
  const faceCheekW = Number((23.5 + f * 3.8 + (traits.faceShape === 'round' ? 2 : traits.faceShape === 'heart' ? -1 : 0)).toFixed(1));
  const jawW = Number((faceCheekW * (traits.faceShape === 'square' ? 0.86 : 0.72) + Math.max(0, f) * 2.8).toFixed(1));
  const neckW = Number(((isFemale ? 9.5 : 11.2) + Math.max(0, f) * 3.2).toFixed(1));
  const shoulderW = Number(((isFemale ? 38 : 44) + f * 4.5).toFixed(1));
  const chestW = Number(((isFemale ? 31 : 35) + Math.max(0, f) * 7.5 + (metrics.protein.pct / 100) * 2.5).toFixed(1));
  const waistW = Number(Math.max(18, (isFemale ? 23 : 26) + f * 17.5).toFixed(1)); // Visibly fuller belly on surplus
  const hipW = Number(Math.max(25, (isFemale ? 34 : 30.5) + f * 14).toFixed(1));
  const armThick = Number(Math.max(7.5, 10 + f * 3.8).toFixed(1));
  const thighW = Number(Math.max(12, 16.5 + f * 5.2).toFixed(1));
  const calfW = Number(Math.max(9.5, 12 + f * 3.2).toFixed(1));

  // Smooth organic full-body human silhouette using cubic bezier curves (head neck down to feet)
  const humanBodyPath = useMemo(() => {
    const legGap = Math.max(2.5, 5.5 - Math.max(0, f) * 1.8);
    const armOutShoulderX = cx + shoulderW + 8;
    const elbowX = cx + shoulderW + armThick + 5;
    const wristX = cx + shoulderW + armThick + 2;
    const handY = 208;
    const armInShoulderX = cx + chestW + 4;

    const armLOutShoulderX = cx - shoulderW - 8;
    const elbowLX = cx - shoulderW - armThick - 5;
    const wristLX = cx - shoulderW - armThick - 2;
    const armLInShoulderX = cx - chestW - 4;

    return [
      // Top of neck behind jaw
      `M ${cx - neckW} 68`,
      `L ${cx + neckW} 68`,
      `C ${cx + neckW} 82, ${cx + neckW + 6} 86, ${cx + shoulderW * 0.72} 90`,
      // Right trapezius -> curved deltoid shoulder -> bicep -> elbow -> forearm -> sculpted hand
      `C ${cx + shoulderW + 2} 92, ${armOutShoulderX} 102, ${armOutShoulderX} 118`,
      `C ${armOutShoulderX + 2} 142, ${elbowX + 2} 162, ${elbowX} 174`,
      `C ${elbowX - 1} 188, ${wristX} 198, ${wristX + 2} ${handY}`,
      `C ${wristX + 3} ${handY + 12}, ${wristX - 7} ${handY + 14}, ${wristX - armThick * 0.75} ${handY + 6}`,
      `C ${wristX - armThick} 196, ${elbowX - armThick - 1} 178, ${armInShoulderX + 3} 135`,
      // Right underarm -> pectorals / ribcage -> waist/belly -> hip curve
      `C ${cx + chestW} 146, ${cx + waistW} 162, ${cx + waistW + (isGain ? 8 : 2)} 180`,
      `C ${cx + waistW + (isGain ? 10 : 4)} 195, ${cx + hipW} 206, ${cx + hipW - 2} 222`,
      // Right thigh -> knee taper -> calf -> ankle -> natural human foot
      `C ${cx + legGap + thighW + 6} 248, ${cx + legGap + calfW + 6} 274, ${cx + legGap + calfW + 3} 296`,
      `C ${cx + legGap + calfW + 2} 314, ${cx + legGap + calfW + 10} 336, ${cx + legGap + calfW + 12} 342`,
      `C ${cx + legGap + calfW + 10} 348, ${cx + legGap + 1} 348, ${cx + legGap} 340`,
      `L ${cx + legGap + 2} 302`,
      `C ${cx + legGap + 3} 274, ${cx + legGap + 2} 244, ${cx + legGap + 1} 228`,
      // Inner pelvis bridge
      `Q ${cx} 232, ${cx - legGap - 1} 228`,
      // Left inner thigh -> ankle -> foot -> outer calf -> thigh -> hip
      `C ${cx - legGap - 2} 244, ${cx - legGap - 3} 274, ${cx - legGap - 2} 302`,
      `L ${cx - legGap} 340`,
      `C ${cx - legGap - 1} 348, ${cx - legGap - calfW - 10} 348, ${cx - legGap - calfW - 12} 342`,
      `C ${cx - legGap - calfW - 10} 336, ${cx - legGap - calfW - 2} 314, ${cx - legGap - calfW - 3} 296`,
      `C ${cx - legGap - calfW - 6} 274, ${cx - legGap - thighW - 6} 248, ${cx - hipW + 2} 222`,
      // Left hip -> waist -> chest -> underarm
      `C ${cx - hipW} 206, ${cx - waistW - (isGain ? 10 : 4)} 195, ${cx - waistW - (isGain ? 8 : 2)} 180`,
      `C ${cx - waistW} 162, ${cx - chestW} 146, ${armLInShoulderX - 3} 135`,
      // Left forearm -> hand -> outer shoulder -> neck
      `C ${elbowLX + armThick + 1} 178, ${wristLX + armThick} 196, ${wristLX + armThick * 0.75} ${handY + 6}`,
      `C ${wristLX + 7} ${handY + 14}, ${wristLX - 3} ${handY + 12}, ${wristLX - 2} ${handY}`,
      `C ${wristLX} 198, ${elbowLX + 1} 188, ${elbowLX} 174`,
      `C ${elbowLX - 2} 162, ${armLOutShoulderX - 2} 142, ${armLOutShoulderX} 118`,
      `C ${armLOutShoulderX} 102, ${cx - shoulderW - 2} 92, ${cx - shoulderW * 0.72} 90`,
      `C ${cx - neckW - 6} 86, ${cx - neckW} 82, ${cx - neckW} 68`,
      `Z`,
    ].join(' ');
  }, [neckW, shoulderW, chestW, waistW, hipW, armThick, thighW, calfW, isGain, f]);

  // Organic human head silhouette (cranium, cheekbones, jaw, chin)
  const headPath = useMemo(() => {
    const chinY = 74 + Math.max(0, f) * 2.5;
    const browY = 34;
    return [
      `M ${cx} 14`,
      `C ${cx + faceCheekW * 0.95} 14, ${cx + faceCheekW + 1} 28, ${cx + faceCheekW} ${browY + 8}`,
      `C ${cx + faceCheekW + (isGain ? 2.5 : 0)} 54, ${cx + jawW} 66, ${cx} ${chinY}`,
      `C ${cx - jawW} 66, ${cx - faceCheekW - (isGain ? 2.5 : 0)} 54, ${cx - faceCheekW} ${browY + 8}`,
      `C ${cx - faceCheekW - 1} 28, ${cx - faceCheekW * 0.95} 14, ${cx} 14`,
      `Z`,
    ].join(' ');
  }, [faceCheekW, jawW, f, isGain]);

  // Nutrient fill proportions
  const proteinRatio = Math.min(1, Math.max(0.14, metrics.protein.pct / 100));
  const carbsRatio = Math.min(1, Math.max(0.14, metrics.carbs.pct / 100));
  const fatRatio = Math.min(1, Math.max(0.15, metrics.fat.pct / 100));
  const fiberRatio = Math.min(1, Math.max(0.14, metrics.fiber.pct / 100));

  const outlineColor = isGain ? '#d97706' : isLean ? '#059669' : '#10b981';
  const browStrokeW = traits.eyebrowThickness === 'thick' ? 2.8 : traits.eyebrowThickness === 'thin' ? 1.5 : 2.1;
  const eyeY = 42;
  const mouthY = 60.5;
  const smileCurve = traits.expression === 'warm_smile' ? 4.2 : traits.expression === 'confident' ? 2.6 : 1.2;

  return (
    <svg
      viewBox="0 0 240 360"
      className={className}
      role="img"
      aria-label={`${client.name} illustrated human body nutrient avatar`}
    >
      <defs>
        <clipPath id={bodyClipId}>
          <path d={humanBodyPath} />
        </clipPath>
        <radialGradient id={skinGradId} cx="46%" cy="38%" r="65%">
          <stop offset="0%" stopColor={traits.skinHighlightHex} />
          <stop offset="58%" stopColor={traits.skinToneHex} />
          <stop offset="100%" stopColor={traits.skinShadowHex} />
        </radialGradient>
        <linearGradient id={proteinGradId} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#16a34a" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0.94" />
        </linearGradient>
        <linearGradient id={fatGradId} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={metrics.calorieDiff > 350 ? '#dc2626' : '#d97706'} stopOpacity="0.92" />
          <stop offset="100%" stopColor={metrics.calorieDiff > 350 ? '#fb7185' : '#fbbf24'} stopOpacity="0.94" />
        </linearGradient>
        <linearGradient id={carbsGradId} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.92" />
        </linearGradient>
      </defs>

      {/* Studio floor shadow proportional to body width */}
      <ellipse
        cx={cx}
        cy="348"
        rx={Math.round(38 + Math.max(0, f) * 16)}
        ry="6.5"
        fill="rgba(15, 23, 42, 0.22)"
      />

      {/* Clipped Sculpted Human Body Filled With Color-Coded Nutrition */}
      <g clipPath={`url(#${bodyClipId})`}>
        {/* Natural human skin base layer */}
        <rect x="0" y="68" width="240" height="292" fill={`url(#${skinGradId})`} opacity="0.34" />
        <rect x="0" y="68" width="240" height="292" fill="#0f172a" opacity="0.62" />

        {/* 1. GREEN = PROTEIN (Upper Chest, Shoulders & Arms Muscle Zone: y=72..152) */}
        <rect x="0" y="72" width="240" height="80" fill="#064e3b" opacity="0.45" />
        <rect
          x="0"
          y={152 - Math.round(80 * proteinRatio)}
          width="240"
          height={Math.round(80 * proteinRatio)}
          fill={`url(#${proteinGradId})`}
        />

        {/* 2. AMBER / ORANGE (+Crimson on Surplus) = FATS & CALORIE RESERVE (Belly & Core: y=152..210) */}
        <rect x="0" y="152" width="240" height="58" fill="#78350f" opacity="0.35" />
        <rect
          x="0"
          y={210 - Math.round(58 * fatRatio)}
          width="240"
          height={Math.round(58 * fatRatio)}
          fill={`url(#${fatGradId})`}
        />

        {/* 3. TEAL = FIBER RIBBON (Digestive Gut Belt: y=210..232) */}
        <rect x="0" y="210" width="240" height="22" fill="#134e4a" opacity="0.4" />
        <rect
          x="0"
          y={232 - Math.round(22 * fiberRatio)}
          width="240"
          height={Math.round(22 * fiberRatio)}
          fill="#14b8a6"
          opacity="0.92"
        />

        {/* 4. BLUE = CARBOHYDRATES ENERGY (Hips, Thighs & Legs: y=232..352) */}
        <rect x="0" y="232" width="240" height="120" fill="#1e3a8a" opacity="0.45" />
        <rect
          x="0"
          y={352 - Math.round(120 * carbsRatio)}
          width="240"
          height={Math.round(120 * carbsRatio)}
          fill={`url(#${carbsGradId})`}
        />

        {/* Subtle human anatomical shading lines (collarbone, pecs/ribs, core contour) */}
        <path
          d={`M ${cx - chestW * 0.68} 102 Q ${cx} 112, ${cx + chestW * 0.68} 102`}
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1.2"
        />
        <path
          d={`M ${cx - chestW * 0.75} 126 Q ${cx - chestW * 0.25} 135, ${cx - 4} 129`}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.2"
        />
        <path
          d={`M ${cx + chestW * 0.75} 126 Q ${cx + chestW * 0.25} 135, ${cx + 4} 129`}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.2"
        />
        <line x1="25" y1="152" x2="215" y2="152" stroke="rgba(255,255,255,0.24)" strokeWidth="1" />
        <line x1="25" y1="210" x2="215" y2="210" stroke="rgba(255,255,255,0.24)" strokeWidth="1" />
        <line x1="25" y1="232" x2="215" y2="232" stroke="rgba(255,255,255,0.24)" strokeWidth="1" />

        {/* Micronutrient Bio-Nodes (Iron, Vitamin D, Magnesium, Calcium) */}
        <circle cx={cx} cy="117" r={size === 'mini' ? 3.5 : 4.8} fill="#f43f5e" stroke="#ffffff" strokeWidth="1.1" opacity={metrics.iron.pct > 5 ? 1 : 0.4} />
        <circle cx={cx} cy="137" r={size === 'mini' ? 3.5 : 4.8} fill="#a855f7" stroke="#ffffff" strokeWidth="1.1" opacity={metrics.vitaminD.pct > 5 ? 1 : 0.4} />
        <circle cx={cx} cy="182" r={size === 'mini' ? 3.5 : 4.8} fill="#2dd4bf" stroke="#ffffff" strokeWidth="1.1" opacity={metrics.magnesium.pct > 5 ? 1 : 0.4} />
        <circle cx={cx} cy="258" r={size === 'mini' ? 3.5 : 4.8} fill="#38bdf8" stroke="#ffffff" strokeWidth="1.1" opacity={metrics.calcium.pct > 5 ? 1 : 0.4} />
      </g>

      {/* Natural Skin Neck & Clavicle Fill */}
      <path
        d={`M ${cx - neckW} 64 L ${cx + neckW} 64 L ${cx + neckW + 2} 84 Q ${cx} 92, ${cx - neckW - 2} 84 Z`}
        fill={`url(#${skinGradId})`}
      />
      {/* Chin cast shadow onto neck */}
      <ellipse cx={cx} cy="73" rx={jawW * 0.72} ry="5" fill={traits.skinShadowHex} opacity="0.55" />

      {/* Crisp Organic Body Contour Outline */}
      <path
        d={humanBodyPath}
        fill="none"
        stroke={outlineColor}
        strokeWidth={size === 'mini' ? 2.4 : 2.2}
        strokeLinejoin="round"
      />

      {/* ================= ILLUSTRATED HUMAN HEAD (ANALYZED FROM PHOTO — ZERO RAW PASTE) ================= */}
      {/* Back Hair Layer (for longer hair styles / headwrap) */}
      {(traits.hairStyle === 'long_wavy' || traits.hairStyle === 'bob') && (
        <path
          d={`M ${cx - faceCheekW - 8} 36 C ${cx - faceCheekW - 12} 60, ${cx - faceCheekW - 10} ${traits.hairStyle === 'long_wavy' ? 98 : 76}, ${cx - faceCheekW + 4} ${traits.hairStyle === 'long_wavy' ? 104 : 78} L ${cx + faceCheekW - 4} ${traits.hairStyle === 'long_wavy' ? 104 : 78} C ${cx + faceCheekW + 10} ${traits.hairStyle === 'long_wavy' ? 98 : 76}, ${cx + faceCheekW + 12} 60, ${cx + faceCheekW + 8} 36 C ${cx + faceCheekW + 4} 8, ${cx - faceCheekW - 4} 8, ${cx - faceCheekW - 8} 36 Z`}
          fill={traits.hairColorHex}
        />
      )}
      {traits.hairStyle === 'ponytail' && (
        <path
          d={`M ${cx + 6} 18 C ${cx + faceCheekW + 14} 16, ${cx + faceCheekW + 18} 48, ${cx + faceCheekW + 10} 72 C ${cx + faceCheekW + 2} 64, ${cx + faceCheekW + 2} 40, ${cx + 4} 26 Z`}
          fill={traits.hairColorHex}
        />
      )}
      {traits.hairStyle === 'headwrap' && (
        <path
          d={`M ${cx - faceCheekW - 9} 36 C ${cx - faceCheekW - 11} 6, ${cx + faceCheekW + 11} 6, ${cx + faceCheekW + 9} 36 L ${cx + faceCheekW + 10} 84 Q ${cx} 92, ${cx - faceCheekW - 10} 84 Z`}
          fill={traits.hairColorHex}
        />
      )}

      {/* Human Ears */}
      <ellipse cx={cx - faceCheekW - 1.5} cy="45" rx="4.2" ry="7.2" fill={traits.skinToneHex} stroke={traits.skinShadowHex} strokeWidth="0.9" />
      <ellipse cx={cx + faceCheekW + 1.5} cy="45" rx="4.2" ry="7.2" fill={traits.skinToneHex} stroke={traits.skinShadowHex} strokeWidth="0.9" />

      {/* Human Face & Jaw Contour (subtly fuller cheeks on calorie surplus) */}
      <path d={headPath} fill={`url(#${skinGradId})`} stroke={traits.skinShadowHex} strokeWidth="1.1" />

      {/* Warm Cheek Flush (healthy glow + subtle fullness indicator) */}
      <ellipse cx={cx - faceCheekW * 0.56} cy="50" rx={isGain ? 6.5 : 4.8} ry="3.2" fill="#e11d48" opacity={isGain ? 0.16 : 0.09} />
      <ellipse cx={cx + faceCheekW * 0.56} cy="50" rx={isGain ? 6.5 : 4.8} ry="3.2" fill="#e11d48" opacity={isGain ? 0.16 : 0.09} />

      {/* Facial Hair Layer (Beard / Stubble / Mustache analyzed from his photo) */}
      {traits.facialHair === 'full_beard' && (
        <path
          d={`M ${cx - faceCheekW + 1} 46 C ${cx - faceCheekW + 1} 67, ${cx - jawW * 0.7} 77, ${cx} 78 C ${cx + jawW * 0.7} 77, ${cx + faceCheekW - 1} 67, ${cx + faceCheekW - 1} 46 C ${cx + jawW * 0.85} 58, ${cx + 9} 56, ${cx} 56 C ${cx - 9} 56, ${cx - jawW * 0.85} 58, ${cx - faceCheekW + 1} 46 Z`}
          fill={traits.hairColorHex}
          opacity="0.92"
        />
      )}
      {traits.facialHair === 'trimmed_beard' && (
        <path
          d={`M ${cx - faceCheekW + 2} 48 C ${cx - faceCheekW + 2} 66, ${cx - jawW * 0.65} 75, ${cx} 76 C ${cx + jawW * 0.65} 75, ${cx + faceCheekW - 2} 66, ${cx + faceCheekW - 2} 48 C ${cx + jawW * 0.82} 60, ${cx + 8} 58, ${cx} 58 C ${cx - 8} 58, ${cx - jawW * 0.82} 60, ${cx - faceCheekW + 2} 48 Z`}
          fill={traits.hairColorHex}
          opacity="0.82"
        />
      )}
      {traits.facialHair === 'light_stubble' && (
        <path
          d={`M ${cx - faceCheekW + 3} 50 C ${cx - jawW * 0.9} 66, ${cx - jawW * 0.55} 74, ${cx} 74 C ${cx + jawW * 0.55} 74, ${cx + jawW * 0.9} 66, ${cx + faceCheekW - 3} 50 C ${cx + jawW * 0.8} 62, ${cx} 68, ${cx - jawW * 0.8} 62 Z`}
          fill={traits.hairColorHex}
          opacity="0.28"
        />
      )}
      {(traits.facialHair === 'mustache' || traits.facialHair === 'trimmed_beard' || traits.facialHair === 'full_beard') && (
        <path
          d={`M ${cx - 9.5} 56.5 Q ${cx} 53, ${cx + 9.5} 56.5 Q ${cx} 58.2, ${cx - 9.5} 56.5 Z`}
          fill={traits.hairColorHex}
          opacity="0.9"
        />
      )}

      {/* Eyebrows */}
      <path
        d={
          traits.eyebrowStyle === 'arched'
            ? `M ${cx - 14.5} ${eyeY - 6.5} Q ${cx - 9.5} ${eyeY - 9.5}, ${cx - 4.5} ${eyeY - 6.5}`
            : `M ${cx - 14.5} ${eyeY - 6.8} Q ${cx - 9.5} ${eyeY - 8.2}, ${cx - 4.5} ${eyeY - 6.8}`
        }
        fill="none"
        stroke={traits.hairColorHex}
        strokeWidth={browStrokeW}
        strokeLinecap="round"
      />
      <path
        d={
          traits.eyebrowStyle === 'arched'
            ? `M ${cx + 4.5} ${eyeY - 6.5} Q ${cx + 9.5} ${eyeY - 9.5}, ${cx + 14.5} ${eyeY - 6.5}`
            : `M ${cx + 4.5} ${eyeY - 6.8} Q ${cx + 9.5} ${eyeY - 8.2}, ${cx + 14.5} ${eyeY - 6.8}`
        }
        fill="none"
        stroke={traits.hairColorHex}
        strokeWidth={browStrokeW}
        strokeLinecap="round"
      />

      {/* Realistic Human Eyes (Sclera, Colored Iris, Pupil, Catchlight, Lash) */}
      {[cx - 9.2, cx + 9.2].map((ex, idx) => (
        <g key={idx}>
          <ellipse cx={ex} cy={eyeY} rx="4.2" ry="2.8" fill="#ffffff" />
          <circle cx={ex} cy={eyeY} r="2.15" fill={traits.eyeColorHex} />
          <circle cx={ex} cy={eyeY} r="1.05" fill="#0f172a" />
          <circle cx={ex - 0.7} cy={eyeY - 0.7} r="0.6" fill="#ffffff" />
          <path
            d={`M ${ex - 4.4} ${eyeY - 0.6} Q ${ex} ${eyeY - 3.6}, ${ex + 4.4} ${eyeY - 0.6}`}
            fill="none"
            stroke="#1e1b18"
            strokeWidth="1.15"
            strokeLinecap="round"
          />
        </g>
      ))}

      {/* Glasses (if detected from client photo) */}
      {traits.glasses === 'round' && (
        <g fill="none" stroke="#334155" strokeWidth="1.4">
          <circle cx={cx - 9.2} cy={eyeY} r="6.6" />
          <circle cx={cx + 9.2} cy={eyeY} r="6.6" />
          <line x1={cx - 2.6} y1={eyeY} x2={cx + 2.6} y2={eyeY} />
        </g>
      )}
      {traits.glasses === 'rectangular' && (
        <g fill="none" stroke="#1e293b" strokeWidth="1.4">
          <rect x={cx - 16} y={eyeY - 4.5} width="13.5" height="9" rx="2.2" />
          <rect x={cx + 2.5} y={eyeY - 4.5} width="13.5" height="9" rx="2.2" />
          <line x1={cx - 2.5} y1={eyeY - 0.5} x2={cx + 2.5} y2={eyeY - 0.5} />
        </g>
      )}

      {/* Nose Bridge & Tip */}
      <path
        d={`M ${cx} ${eyeY + 1} L ${cx - 1.2} 50.5 Q ${cx} 52.5, ${cx + 2.2} 50.5`}
        fill="none"
        stroke={traits.skinShadowHex}
        strokeWidth="1.25"
        strokeLinecap="round"
      />

      {/* Expressive Human Mouth / Lips */}
      <path
        d={`M ${cx - 7.5} ${mouthY} Q ${cx} ${mouthY + smileCurve}, ${cx + 7.5} ${mouthY}`}
        fill="none"
        stroke={traits.lipToneHex}
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      {traits.expression === 'warm_smile' && (
        <path
          d={`M ${cx - 5.2} ${mouthY + 0.6} Q ${cx} ${mouthY + smileCurve - 0.8}, ${cx + 5.2} ${mouthY + 0.6}`}
          fill="#ffffff"
          opacity="0.85"
        />
      )}

      {/* Front Hair / Crown (Matched to Gemini Photo Analysis) */}
      {traits.hairStyle !== 'bald' && traits.hairStyle !== 'headwrap' && (
        <g>
          {traits.hairStyle === 'short_curly' && (
            <path
              d={`M ${cx - faceCheekW - 1} 36 C ${cx - faceCheekW - 4} 20, ${cx - 18} 9, ${cx} 9 C ${cx + 18} 9, ${cx + faceCheekW + 4} 20, ${cx + faceCheekW + 1} 36 C ${cx + faceCheekW - 3} 28, ${cx + 12} 22, ${cx + 4} 26 C ${cx} 21, ${cx - 7} 26, ${cx - 14} 23 C ${cx - 20} 26, ${cx - faceCheekW + 3} 28, ${cx - faceCheekW - 1} 36 Z`}
              fill={traits.hairColorHex}
            />
          )}
          {(traits.hairStyle === 'side_part' || traits.hairStyle === 'short_straight') && (
            <path
              d={`M ${cx - faceCheekW - 1} 37 C ${cx - faceCheekW - 3} 16, ${cx - 12} 9, ${cx + 2} 9 C ${cx + 18} 9, ${cx + faceCheekW + 3} 18, ${cx + faceCheekW + 1} 37 C ${cx + faceCheekW - 3} 26, ${cx + 10} 21, ${cx - 4} 24 C ${cx - 14} 27, ${cx - faceCheekW + 4} 26, ${cx - faceCheekW - 1} 37 Z`}
              fill={traits.hairColorHex}
            />
          )}
          {traits.hairStyle === 'spiky' && (
            <path
              d={`M ${cx - faceCheekW - 1} 36 L ${cx - faceCheekW - 3} 22 L ${cx - 14} 11 L ${cx - 6} 16 L ${cx} 7 L ${cx + 7} 15 L ${cx + 15} 10 L ${cx + faceCheekW + 2} 22 L ${cx + faceCheekW + 1} 36 C ${cx + faceCheekW - 5} 24, ${cx - faceCheekW + 5} 24, ${cx - faceCheekW - 1} 36 Z`}
              fill={traits.hairColorHex}
            />
          )}
          {(traits.hairStyle === 'long_wavy' || traits.hairStyle === 'bob' || traits.hairStyle === 'ponytail') && (
            <path
              d={`M ${cx - faceCheekW - 2} 38 C ${cx - faceCheekW - 3} 14, ${cx - 10} 9, ${cx} 9 C ${cx + 10} 9, ${cx + faceCheekW + 3} 14, ${cx + faceCheekW + 2} 38 C ${cx + faceCheekW - 3} 25, ${cx + 8} 19, ${cx} 24 C ${cx - 8} 19, ${cx - faceCheekW + 3} 25, ${cx - faceCheekW - 2} 38 Z`}
              fill={traits.hairColorHex}
            />
          )}
          {/* Subtle natural hair sheen */}
          <path
            d={`M ${cx - 10} 15 Q ${cx} 12, ${cx + 11} 16`}
            fill="none"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Clear macro labels inside the big view */}
      {size === 'large' && (
        <g fontSize="9.5" fontWeight="800" textAnchor="middle" fill="#ffffff">
          <text x={cx} y="108" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.85)' }}>
            PROTEIN {metrics.protein.pct}%
          </text>
          <text x={cx} y="172" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.85)' }}>
            FATS {metrics.fat.pct}%
          </text>
          <text x={cx} y="224" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.85)' }}>
            FIBER {metrics.fiber.pct}%
          </text>
          <text x={cx} y="280" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.85)' }}>
            CARBS {metrics.carbs.pct}%
          </text>
        </g>
      )}
    </svg>
  );
};

interface NutrientGridProps {
  metrics: BodyAvatarMetrics;
}

const NutrientTargetsGrid: React.FC<NutrientGridProps> = ({ metrics }) => {
  const { t } = useApp();

  const items = [
    {
      key: 'protein',
      label: t('Protein'),
      consumed: metrics.protein.consumed,
      target: metrics.protein.target,
      unit: 'g',
      pct: metrics.protein.pct,
      icon: Dumbbell,
      barColor: 'bg-emerald-500',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      textAccent: 'text-emerald-700 dark:text-emerald-400',
    },
    {
      key: 'carbs',
      label: t('Carbohydrates'),
      mobileLabel: t('Carbs'),
      consumed: metrics.carbs.consumed,
      target: metrics.carbs.target,
      unit: 'g',
      pct: metrics.carbs.pct,
      icon: Wheat,
      barColor: 'bg-blue-500',
      badgeBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      textAccent: 'text-blue-700 dark:text-blue-400',
    },
    {
      key: 'fat',
      label: t('Fats'),
      consumed: metrics.fat.consumed,
      target: metrics.fat.target,
      unit: 'g',
      pct: metrics.fat.pct,
      icon: Droplets,
      barColor: metrics.calorieDiff > 350 ? 'bg-rose-500' : 'bg-amber-500',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      textAccent: 'text-amber-700 dark:text-amber-400',
    },
    {
      key: 'fiber',
      label: t('Fiber'),
      consumed: metrics.fiber.consumed,
      target: metrics.fiber.target,
      unit: 'g',
      pct: metrics.fiber.pct,
      icon: Leaf,
      barColor: 'bg-lime-500',
      badgeBg: 'bg-lime-50 dark:bg-lime-950/60 text-lime-700 dark:text-lime-300 border-lime-200 dark:border-lime-800',
      textAccent: 'text-lime-700 dark:text-lime-400',
    },
    {
      key: 'iron',
      label: t('Iron'),
      consumed: metrics.iron.consumed,
      target: metrics.iron.target,
      unit: 'mg',
      pct: metrics.iron.pct,
      icon: HeartPulse,
      barColor: 'bg-rose-500',
      badgeBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      textAccent: 'text-rose-700 dark:text-rose-400',
    },
    {
      key: 'vitaminD',
      label: t('Vitamin D'),
      consumed: metrics.vitaminD.consumed,
      target: metrics.vitaminD.target,
      unit: 'IU',
      pct: metrics.vitaminD.pct,
      icon: Sun,
      barColor: 'bg-indigo-500',
      badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      textAccent: 'text-indigo-700 dark:text-indigo-400',
    },
    {
      key: 'magnesium',
      label: t('Magnesium'),
      consumed: metrics.magnesium.consumed,
      target: metrics.magnesium.target,
      unit: 'mg',
      pct: metrics.magnesium.pct,
      icon: Zap,
      barColor: 'bg-teal-500',
      badgeBg: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
      textAccent: 'text-teal-700 dark:text-teal-400',
    },
    {
      key: 'calcium',
      label: t('Calcium'),
      consumed: metrics.calcium.consumed,
      target: metrics.calcium.target,
      unit: 'mg',
      pct: metrics.calcium.pct,
      icon: ShieldCheck,
      barColor: 'bg-sky-500',
      badgeBg: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
      textAccent: 'text-sky-700 dark:text-sky-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
      {items.map((item) => {
        const IconComponent = item.icon;
        const barWidthPct = Math.min(100, item.pct);
        const met = item.consumed >= item.target;

        return (
          <div
            key={item.key}
            className="rounded-xl sm:rounded-2xl p-2 sm:p-2.5 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/80 space-y-1 sm:space-y-1.5 min-w-0"
          >
            <div className="flex items-center justify-between gap-1 text-[11px] sm:text-xs min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg border flex items-center justify-center shrink-0 ${item.badgeBg}`}>
                  <IconComponent className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
                  {item.mobileLabel ? (
                    <>
                      <span className="sm:hidden">{item.mobileLabel}</span>
                      <span className="hidden sm:inline">{item.label}</span>
                    </>
                  ) : (
                    item.label
                  )}
                </span>
              </div>
              <span className={`text-[9px] sm:text-[10px] font-black tabular-nums shrink-0 ${met ? 'text-emerald-600 dark:text-emerald-400' : item.textAccent}`}>
                {item.pct}%
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-1 text-[11px] sm:text-xs tabular-nums min-w-0">
              <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm shrink-0">
                {item.consumed}
                <span className="text-[10px] sm:text-[11px] font-normal text-slate-500 dark:text-slate-400 ml-0.5">
                  {item.unit}
                </span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                <span className="hidden sm:inline">{t('Daily Needed')}: </span>
                <span className="sm:hidden">{t('Need')}: </span>
                <b className="text-slate-800 dark:text-slate-200">{item.target}{item.unit}</b>
              </span>
            </div>

            <div className="w-full h-1 sm:h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${met ? 'bg-emerald-500' : item.barColor}`}
                style={{ width: `${barWidthPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface FirstScreenBodyAvatarCardProps {
  client: ClientProfile;
  metrics: BodyAvatarMetrics;
  traits: FaceAvatarTraits;
  isAnalyzing: boolean;
  onClick: () => void;
}

export const FirstScreenBodyAvatarCard: React.FC<FirstScreenBodyAvatarCardProps> = ({
  client,
  metrics,
  traits,
  isAnalyzing,
  onClick,
}) => {
  const { language, t } = useApp();
  const isMl = language === 'ml';

  const statusLabel =
    metrics.statusKey === 'gaining'
      ? isMl ? 'അധിക കലോറി · ഭാരം കൂടുന്നു' : 'Surplus · Gaining'
      : metrics.statusKey === 'losing'
        ? isMl ? 'കലോറി കുറവ് · ഭാരം കുറയുന്നു' : 'Deficit · Losing'
        : isMl ? 'സമതുലിത ശരീരം' : 'Balanced';

  const statusPillClass =
    metrics.statusKey === 'gaining'
      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700'
      : metrics.statusKey === 'losing'
        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
        : 'bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col justify-between min-w-0 w-full overflow-hidden space-y-3">
      {/* Top Interactive Avatar Header (Tap Avatar or Button to Open Big Preview) */}
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-700 transition-all cursor-pointer group"
      >
        <div className="w-18 h-26 sm:w-22 sm:h-30 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center p-1 shrink-0 overflow-hidden group-hover:scale-[1.03] transition-transform">
          <BodyNutritionAvatarSVG
            client={client}
            metrics={metrics}
            traits={traits}
            size="mini"
            className="w-full h-full drop-shadow-xs"
          />
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white leading-tight truncate">
                {t('Daily Nutrient Targets')}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate tabular-nums">
                {client.gender || 'Client'} · {client.age || 30}y · {client.currentWeightKg} kg · {client.heightCm} cm
              </p>
            </div>

            <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap shrink-0 tabular-nums">
              {t('Goal Cap')}: {metrics.goalCapCalories} kcal
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${statusPillClass}`}>
              {statusLabel}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
              <Sparkles className="w-2.5 h-2.5" />
              <span>
                {isAnalyzing
                  ? isMl ? 'മുഖം സ്കാൻ...' : 'Analyzing...'
                  : traits.analyzedFromPhoto
                    ? isMl ? 'AI മുഖചിത്രം' : 'Face-Analyzed'
                    : isMl ? 'ശരീര അവതാർ' : 'Body Twin'}
              </span>
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 text-[10px] sm:text-[11px] pt-0.5">
            <span className="text-slate-500 dark:text-slate-400 truncate">
              {metrics.fatFactor > 0.2
                ? isMl ? `+${metrics.calorieDiff} kcal അധികം` : `+${metrics.calorieDiff} kcal surplus`
                : metrics.fatFactor < -0.2
                  ? isMl ? `${metrics.calorieDiff} kcal കുറവ്` : `${metrics.calorieDiff} kcal deficit`
                  : isMl ? 'കൃത്യമായ കലോറി നില' : 'Matching daily need'}
            </span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400 group-hover:underline flex items-center gap-1 shrink-0">
              <Maximize2 className="w-3 h-3" />
              <span>{t('Open Full Body')}</span>
            </span>
          </div>
        </div>
      </button>

      {/* Unified All-8 Daily Nutrient Targets Grid */}
      <NutrientTargetsGrid metrics={metrics} />

      {/* Calibrated Clinical Footer */}
      <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 leading-snug">
        {isMl
          ? 'ഭാരം, ഉയരം, പ്രായം, ലിംഗഭേദം എന്നിവ അടിസ്ഥാനമാക്കി ആവശ്യമായ പരമാവധി പരിധിക്കുള്ളിൽ കണക്കാക്കിയതാണ്.'
          : 'Calibrated strictly within safe clinical limits from your weight, height, age & gender.'}
      </p>
    </div>
  );
};

interface BodyAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientProfile;
  logsForDay: MealLogItem[];
  burnedCalories: number;
  traits?: FaceAvatarTraits;
  isAnalyzing?: boolean;
  analysisError?: string | null;
  onReanalyze?: () => void;
  onOpenLogMeal: () => void;
  onOpenWorkout: () => void;
}

export const BodyAvatarModal: React.FC<BodyAvatarModalProps> = ({
  isOpen,
  onClose,
  client,
  logsForDay,
  burnedCalories,
  traits: externalTraits,
  isAnalyzing = false,
  analysisError = null,
  onReanalyze,
  onOpenLogMeal,
  onOpenWorkout,
}) => {
  const { foods, language, t } = useApp();
  const isMl = language === 'ml';
  const [simDeltaKcal, setSimDeltaKcal] = useState(0);

  // Always default back to live logged meals whenever modal opens or closes (never persist simulation edits)
  useEffect(() => {
    setSimDeltaKcal(0);
  }, [isOpen, client.id]);

  const handleClose = useCallback(() => {
    setSimDeltaKcal(0);
    onClose();
  }, [onClose]);

  const traits = useMemo(
    () => externalTraits || deriveBaselineHumanTraits(client),
    [externalTraits, client]
  );

  const metrics = useMemo(
    () => computeBodyAvatarMetrics(client, logsForDay, foods, burnedCalories, simDeltaKcal),
    [client, logsForDay, foods, burnedCalories, simDeltaKcal]
  );

  if (!isOpen) return null;

  const statusText =
    metrics.statusKey === 'gaining'
      ? isMl
        ? 'അധിക കലോറി · ഭാരം കൂടുന്ന അവസ്ഥ'
        : 'Surplus Intake · Gaining Weight'
      : metrics.statusKey === 'losing'
        ? isMl
          ? 'ലക്ഷ്യത്തേക്കാൾ കുറവ് · ഭാരം കുറയുന്നു'
          : 'Calorie Deficit · Losing Weight'
        : isMl
          ? 'കൃത്യമായ ലക്ഷ്യം · സമതുലിതാവസ്ഥ'
          : 'Balanced · On Target Needs';

  const statusBadgeClass =
    metrics.statusKey === 'gaining'
      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700'
      : metrics.statusKey === 'losing'
        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
        : 'bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-emerald-950 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-400/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold text-white truncate">
                {client.name} · {t('Live Body & Nutrient Avatar')}
              </h2>
              <p className="text-[11px] text-emerald-200 truncate tabular-nums">
                {client.currentWeightKg} kg → {client.targetWeightKg} kg · {isMl ? 'ദിവസേന ആവശ്യമായ കലോറി' : 'Calculated Need'}: {metrics.neededCalories} kcal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="text-white/85 hover:text-white px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold shrink-0"
          >
            <X className="w-4 h-4" />
            <span>{t('Close')}</span>
          </button>
        </div>

        {/* Main 2-Column Content */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 items-start max-h-[82vh] overflow-y-auto">
          {/* Left: Big Dynamic Human-Like Illustrated Body Figure + Temporary Preview Slider */}
          <div className="md:col-span-5 flex flex-col items-center bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            <div className={`px-3 py-1 rounded-xl border text-[11px] font-bold text-center ${statusBadgeClass}`}>
              {statusText}
            </div>

            <div className="w-48 h-70 sm:w-52 sm:h-76 flex items-center justify-center">
              <BodyNutritionAvatarSVG
                client={client}
                metrics={metrics}
                traits={traits}
                size="large"
                className="w-full h-full drop-shadow-md transition-all duration-300"
              />
            </div>

            {/* Face Analysis Metadata & Re-scan */}
            <div className="w-full text-center space-y-1.5">
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                {traits.portraitSummary}
              </p>
              {analysisError && (
                <p className="text-[10px] text-amber-700 dark:text-amber-300">
                  {analysisError}
                </p>
              )}
              {onReanalyze && client.avatarUrl && (
                <button
                  type="button"
                  onClick={onReanalyze}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200/80 dark:hover:bg-emerald-900/60 text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzing ? (isMl ? 'സ്കാൻ ചെയ്യുന്നു...' : 'Analyzing face...') : t('Re-analyze Photo')}</span>
                </button>
              )}
            </div>

            <div className="w-full grid grid-cols-3 gap-1.5 text-center tabular-nums text-[11px] pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">
                  {isMl ? 'കഴിച്ചത്' : 'Eaten'}
                </span>
                <b className="text-slate-900 dark:text-white">{metrics.eatenCalories}</b>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">
                  {isMl ? 'കത്തിച്ചത്' : 'Burned'}
                </span>
                <b className="text-orange-600 dark:text-orange-400">-{metrics.burnedCalories}</b>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">
                  {isMl ? 'ബാക്കി/മാറ്റം' : 'Vs Need'}
                </span>
                <b className={metrics.calorieDiff > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
                  {metrics.calorieDiff > 0 ? `+${metrics.calorieDiff}` : metrics.calorieDiff}
                </b>
              </div>
            </div>

            {/* Temporary Editable Calorie Preview Slider (Does NOT save — resets to logged meals on close) */}
            <div className="w-full p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <span>
                    {isMl ? 'കലോറി മാറ്റി ശരീരമാറ്റം കാണാം:' : 'See Body Change by Calories Eaten:'}
                  </span>
                </span>
                {simDeltaKcal !== 0 && (
                  <button
                    type="button"
                    onClick={() => setSimDeltaKcal(0)}
                    className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{isMl ? 'ഇന്നത്തെ നില' : 'Live Today'}</span>
                  </button>
                )}
              </div>

              <input
                type="range"
                min={-600}
                max={1400}
                step={50}
                value={simDeltaKcal}
                onChange={(e) => setSimDeltaKcal(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
                aria-label="Simulate calorie intake change"
              />
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-400 tabular-nums">
                <span>-600 kcal</span>
                <span className="font-bold text-emerald-800 dark:text-emerald-300">
                  {simDeltaKcal === 0
                    ? isMl ? 'യഥാർത്ഥ ഭക്ഷണം (Default)' : 'Live Logged Meals'
                    : `${simDeltaKcal > 0 ? `+${simDeltaKcal}` : simDeltaKcal} kcal (${isMl ? 'പ്രിവ്യൂ മാത്രം' : 'preview only'})`}
                </span>
                <span>+1,400 kcal</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center">
                {isMl
                  ? 'ഇത് സേവ് ചെയ്യില്ല — അടയ്ക്കുമ്പോൾ നിങ്ങളുടെ യഥാർത്ഥ ഭക്ഷണ കണക്കിലേക്ക് തിരികെ വരും.'
                  : 'Preview only — closing resets automatically to your logged meals.'}
              </p>
            </div>
          </div>

          {/* Right: Complete Daily Nutrient Targets (Protein, Carbs, Fats, Fiber, Iron, Vit D, Mg, Calcium) */}
          <div className="md:col-span-7 space-y-3.5 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight truncate">
                  {t('Daily Nutrient Targets')}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate tabular-nums">
                  {client.gender || 'Client'} · {client.age || 30}y · {client.currentWeightKg} kg · {client.heightCm} cm
                </p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap shrink-0 tabular-nums">
                {t('Goal Cap')}: {metrics.goalCapCalories} kcal
              </span>
            </div>

            <NutrientTargetsGrid metrics={metrics} />

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              {isMl
                ? 'ഭാരം, ഉയരം, പ്രായം, ലിംഗഭേദം എന്നിവ അടിസ്ഥാനമാക്കി ആവശ്യമായ പരമാവധി പരിധിക്കുള്ളിൽ കണക്കാക്കിയതാണ്.'
                : 'Calibrated strictly within safe clinical limits from your weight, height, age & gender.'}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onOpenLogMeal();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>{t('Log Meal')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onOpenWorkout();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-orange-50 dark:bg-orange-950/50 hover:bg-orange-100 dark:hover:bg-orange-900/50 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{t('Log Workout')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
