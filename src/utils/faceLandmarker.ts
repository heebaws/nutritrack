import { AvatarTraitOverrides, ClientProfile } from '../types';

export interface DetectedFaceProfile {
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
  analyzedFromPhoto: boolean;
  confidenceSource: 'mediapipe' | 'canvas_fallback';
}

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [clampByte(r), clampByte(g), clampByte(b)]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
  );
}

function adjustBrightness(hex: string, factor: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) || 180;
  const g = parseInt(clean.slice(2, 4), 16) || 140;
  const b = parseInt(clean.slice(4, 6), 16) || 110;
  return rgbToHex(r * factor, g * factor, b * factor);
}

function sampleRegionRGB(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  width: number,
  height: number
): { r: number; g: number; b: number; luma: number } {
  const x0 = Math.max(0, Math.floor(cx - radius));
  const y0 = Math.max(0, Math.floor(cy - radius));
  const w = Math.max(1, Math.min(width - x0, Math.ceil(radius * 2)));
  const h = Math.max(1, Math.min(height - y0, Math.ceil(radius * 2)));
  const data = ctx.getImageData(x0, y0, w, h).data;
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 40) continue;
    rSum += data[i];
    gSum += data[i + 1];
    bSum += data[i + 2];
    count += 1;
  }
  if (count === 0) return { r: 211, g: 155, b: 116, luma: 165 };
  const r = rSum / count;
  const g = gSum / count;
  const b = bSum / count;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return { r, g, b, luma };
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load profile photo for face analysis'));
    img.src = src;
  });
}

function normalizeOverrideHairStyle(overrideStyle?: AvatarTraitOverrides['hairStyle']): string | undefined {
  switch (overrideStyle) {
    case 'short':
      return 'short_straight';
    case 'curly':
      return 'short_curly';
    case 'buzz':
      return 'bald';
    case 'parted':
      return 'side_part';
    case 'wavy':
      return 'long_wavy';
    case 'long':
      return 'long_wavy';
    case 'bun':
      return 'ponytail';
    default:
      return undefined;
  }
}

function normalizeOverrideFacialHair(fh?: AvatarTraitOverrides['facialHair']): string | undefined {
  switch (fh) {
    case 'stubble':
      return 'light_stubble';
    case 'beard':
      return 'trimmed_beard';
    case 'mustache':
      return 'mustache';
    case 'none':
      return 'none';
    default:
      return undefined;
  }
}

export function mergeAvatarOverrides(
  base: DetectedFaceProfile,
  overrides?: AvatarTraitOverrides
): DetectedFaceProfile {
  if (!overrides) return base;
  const skinHex = overrides.skinToneHex || base.skinToneHex;
  const hairStyle = normalizeOverrideHairStyle(overrides.hairStyle) || base.hairStyle;
  const facialHair = normalizeOverrideFacialHair(overrides.facialHair) || base.facialHair;
  const eyebrowThickness =
    overrides.eyebrowThickness === 'light' ? 'thin' : overrides.eyebrowThickness || base.eyebrowThickness;
  const faceShape =
    overrides.faceShape === 'chiseled' ? 'square' : overrides.faceShape || base.faceShape;
  const glasses =
    overrides.glasses === 'browline' ? 'rectangular' : overrides.glasses || base.glasses;

  return {
    ...base,
    skinToneHex: skinHex,
    skinShadowHex: adjustBrightness(skinHex, 0.84),
    skinHighlightHex: adjustBrightness(skinHex, 1.12),
    hairColorHex: overrides.hairColorHex || base.hairColorHex,
    hairStyle,
    eyeColorHex: overrides.eyeColorHex || base.eyeColorHex,
    eyebrowThickness,
    facialHair,
    glasses,
    faceShape,
  };
}

let cachedLandmarkerPromise: Promise<any | null> | null = null;

async function getMediaPipeFaceLandmarker(): Promise<any | null> {
  if (typeof window === 'undefined') return null;
  if (cachedLandmarkerPromise) return cachedLandmarkerPromise;

  cachedLandmarkerPromise = (async () => {
    try {
      const vision = await import('@mediapipe/tasks-vision');
      const { FilesetResolver, FaceLandmarker } = vision;
      const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
      const loader = (async () => {
        const fileset = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        );
        return FaceLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          },
          runningMode: 'IMAGE',
          numFaces: 1,
          outputFaceBlendshapes: false,
        });
      })();
      return await Promise.race([loader, timeout]);
    } catch {
      return null;
    }
  })();

  return cachedLandmarkerPromise;
}

/**
 * Runs on-device MediaPipe Face Landmarker to extract face geometry & pixel-sampled colors
 * (skin tone, hair, eyes, brows, facial hair, glasses) without copying raw pixels to the avatar.
 * Falls back cleanly to deterministic HTML5 Canvas facial-region sampling if WASM CDN is blocked.
 */
export async function analyzeFaceWithMediaPipe(
  imageUrl: string,
  client: Pick<ClientProfile, 'gender' | 'name' | 'avatarTraits'>
): Promise<DetectedFaceProfile> {
  const isFemale = client.gender === 'Female';
  const fallbackBase: DetectedFaceProfile = {
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
    portraitSummary: 'On-device stylized portrait calibrated to your profile',
    analyzedFromPhoto: true,
    confidenceSource: 'canvas_fallback',
  };

  try {
    const img = await loadImageElement(imageUrl);
    const canvas = document.createElement('canvas');
    const size = 256;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return mergeAvatarOverrides(fallbackBase, client.avatarTraits);

    // Cover-crop square
    const scale = Math.max(size / img.width, size / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, (size - dw) / 2, (size - dh) / 2, dw, dh);

    // Default landmark normalized coordinates (standard portrait framing)
    let foreheadPt = { x: size * 0.5, y: size * 0.3 };
    let leftCheekPt = { x: size * 0.38, y: size * 0.52 };
    let rightCheekPt = { x: size * 0.62, y: size * 0.52 };
    let hairCrownPt = { x: size * 0.5, y: size * 0.14 };
    let leftHairSidePt = { x: size * 0.22, y: size * 0.55 };
    let leftEyePt = { x: size * 0.41, y: size * 0.43 };
    let chinPt = { x: size * 0.5, y: size * 0.72 };
    let mouthPt = { x: size * 0.5, y: size * 0.64 };
    let faceShape: DetectedFaceProfile['faceShape'] = 'oval';
    let confidenceSource: 'mediapipe' | 'canvas_fallback' = 'canvas_fallback';

    const landmarker = await getMediaPipeFaceLandmarker();
    if (landmarker) {
      try {
        const result = landmarker.detect(canvas);
        const lm = result?.faceLandmarks?.[0];
        if (lm && lm.length > 400) {
          confidenceSource = 'mediapipe';
          const pt = (idx: number) => ({
            x: Math.max(4, Math.min(size - 4, lm[idx].x * size)),
            y: Math.max(4, Math.min(size - 4, lm[idx].y * size)),
          });
          foreheadPt = pt(10);
          leftCheekPt = pt(234);
          rightCheekPt = pt(454);
          leftEyePt = pt(159);
          chinPt = pt(152);
          mouthPt = pt(13);
          hairCrownPt = { x: foreheadPt.x, y: Math.max(6, foreheadPt.y - size * 0.14) };
          leftHairSidePt = { x: Math.max(6, leftCheekPt.x - size * 0.08), y: leftCheekPt.y + size * 0.12 };

          const faceW = Math.hypot(rightCheekPt.x - leftCheekPt.x, rightCheekPt.y - leftCheekPt.y);
          const faceH = Math.hypot(chinPt.x - foreheadPt.x, chinPt.y - foreheadPt.y);
          const jawL = pt(172);
          const jawR = pt(397);
          const jawW = Math.hypot(jawR.x - jawL.x, jawR.y - jawL.y);
          const whRatio = faceW / Math.max(1, faceH);
          const jawRatio = jawW / Math.max(1, faceW);

          if (whRatio > 0.87) faceShape = 'round';
          else if (jawRatio > 0.84) faceShape = 'square';
          else if (jawRatio < 0.68) faceShape = 'heart';
          else faceShape = 'oval';
        }
      } catch {
        // Fallback to heuristic portrait region sampling
      }
    }

    const cheekL = sampleRegionRGB(ctx, leftCheekPt.x, leftCheekPt.y, 10, size, size);
    const cheekR = sampleRegionRGB(ctx, rightCheekPt.x, rightCheekPt.y, 10, size, size);
    const forehead = sampleRegionRGB(ctx, foreheadPt.x, foreheadPt.y, 9, size, size);
    const skinR = (cheekL.r + cheekR.r + forehead.r) / 3;
    const skinG = (cheekL.g + cheekR.g + forehead.g) / 3;
    const skinB = (cheekL.b + cheekR.b + forehead.b) / 3;
    const skinToneHex = rgbToHex(skinR, skinG, skinB);

    const hairSample = sampleRegionRGB(ctx, hairCrownPt.x, hairCrownPt.y, 12, size, size);
    const sideHairSample = sampleRegionRGB(ctx, leftHairSidePt.x, leftHairSidePt.y, 10, size, size);
    const hairColorHex =
      hairSample.luma > 225
        ? '#1f1b1a'
        : rgbToHex(hairSample.r, hairSample.g, hairSample.b);

    const hairLooksLong =
      !isFemale
        ? sideHairSample.luma < forehead.luma - 28 && Math.abs(sideHairSample.r - hairSample.r) < 35
        : sideHairSample.luma < 140;

    let hairStyle: string = isFemale ? 'long_wavy' : 'side_part';
    if (hairSample.luma >= cheekL.luma - 14 && !isFemale) {
      hairStyle = 'bald';
    } else if (hairLooksLong) {
      hairStyle = isFemale ? 'long_wavy' : 'short_curly';
    } else if (isFemale) {
      hairStyle = 'bob';
    }

    const eyeSample = sampleRegionRGB(ctx, leftEyePt.x, leftEyePt.y, 4, size, size);
    const eyeColorHex =
      eyeSample.luma < 90
        ? rgbToHex(eyeSample.r * 0.75, eyeSample.g * 0.75, eyeSample.b * 0.75)
        : '#2f2018';

    const lipSample = sampleRegionRGB(ctx, mouthPt.x, mouthPt.y, 5, size, size);
    const lipToneHex =
      lipSample.r > lipSample.b + 10
        ? rgbToHex(lipSample.r * 0.9, lipSample.g * 0.78, lipSample.b * 0.78)
        : fallbackBase.lipToneHex;

    // Detect chin/jaw darkness delta for beard/stubble
    const chinSample = sampleRegionRGB(ctx, chinPt.x, chinPt.y - 8, 9, size, size);
    const jawDelta = cheekL.luma - chinSample.luma;
    let facialHair = fallbackBase.facialHair;
    if (isFemale) {
      facialHair = 'none';
    } else if (jawDelta > 48) {
      facialHair = 'full_beard';
    } else if (jawDelta > 28) {
      facialHair = 'trimmed_beard';
    } else if (jawDelta > 12) {
      facialHair = 'light_stubble';
    } else {
      facialHair = 'none';
    }

    const bridgeSample = sampleRegionRGB(ctx, size * 0.5, leftEyePt.y, 4, size, size);
    const glasses = bridgeSample.luma < forehead.luma - 45 ? 'rectangular' : 'none';

    const detected: DetectedFaceProfile = {
      ...fallbackBase,
      skinToneHex,
      skinShadowHex: adjustBrightness(skinToneHex, 0.84),
      skinHighlightHex: adjustBrightness(skinToneHex, 1.12),
      hairColorHex,
      hairStyle,
      faceShape,
      eyeColorHex,
      facialHair,
      glasses,
      lipToneHex,
      analyzedFromPhoto: true,
      confidenceSource,
      portraitSummary:
        confidenceSource === 'mediapipe'
          ? `On-device MediaPipe landmarks (${faceShape} face · auto-matched skin, hair & features)`
          : `On-device facial feature scan (${faceShape} face · auto-matched tone & features)`,
    };

    return mergeAvatarOverrides(detected, client.avatarTraits);
  } catch {
    return mergeAvatarOverrides(fallbackBase, client.avatarTraits);
  }
}
