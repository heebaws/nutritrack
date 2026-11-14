import { formatToLocalIsoDate } from './dateUtils';

export type ClientPhoneOS = 'android' | 'ios' | 'desktop';

export interface DetectedOSInfo {
  os: ClientPhoneOS;
  osLabel: string;
  healthEcosystem: string;
  supportsMotionSensor: boolean;
  requiresPermissionPrompt: boolean;
}

export function detectClientOS(): DetectedOSInfo {
  if (typeof navigator === 'undefined') {
    return {
      os: 'desktop',
      osLabel: 'Browser Session',
      healthEcosystem: 'Web Sensor + Sleep Sync',
      supportsMotionSensor: false,
      requiresPermissionPrompt: false,
    };
  }

  const ua = navigator.userAgent || '';
  const platform = (navigator as any).userAgentData?.platform || navigator.platform || '';
  const isIOS =
    /iPad|iPhone|iPod/i.test(ua) ||
    (/Mac/i.test(platform) && typeof document !== 'undefined' && 'ontouchend' in document);
  const isAndroid = /Android/i.test(ua);

  const hasDeviceMotion = typeof window !== 'undefined' && 'DeviceMotionEvent' in window;
  const hasGenericAccelerometer = typeof window !== 'undefined' && 'Accelerometer' in window;
  const supportsMotionSensor = hasDeviceMotion || hasGenericAccelerometer;
  const requiresPermissionPrompt =
    hasDeviceMotion &&
    typeof (window as any).DeviceMotionEvent?.requestPermission === 'function';

  if (isIOS) {
    return {
      os: 'ios',
      osLabel: 'iOS (iPhone)',
      healthEcosystem: 'Apple Health · iOS Motion',
      supportsMotionSensor,
      requiresPermissionPrompt,
    };
  }

  if (isAndroid) {
    return {
      os: 'android',
      osLabel: 'Android',
      healthEcosystem: 'Health Connect · Android Sensor',
      supportsMotionSensor,
      requiresPermissionPrompt,
    };
  }

  return {
    os: 'desktop',
    osLabel: /Mac/i.test(platform) ? 'macOS' : /Win/i.test(platform) ? 'Windows' : 'Web Browser',
    healthEcosystem: 'OS Activity & Sleep Window Sync',
    supportsMotionSensor,
    requiresPermissionPrompt,
  };
}

const LAST_ACTIVE_TS_KEY = 'nutritrack_os_last_active_ts';
const SLEEP_SYNC_DATE_KEY = 'nutritrack_os_sleep_synced_date';

export function recordDeviceActivityTimestamp(): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(LAST_ACTIVE_TS_KEY, String(Date.now()));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Estimates overnight sleep duration when a client opens the app after an overnight gap.
 * Uses local calendar date comparison (not UTC) and bounds to 4.0h – 11.0h.
 */
export function estimateOvernightSleepHours(todayIso: string): number | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const alreadySyncedDate = localStorage.getItem(SLEEP_SYNC_DATE_KEY);
    if (alreadySyncedDate === todayIso) return null;

    const rawPrev = localStorage.getItem(LAST_ACTIVE_TS_KEY);
    const now = Date.now();
    if (!rawPrev) {
      localStorage.setItem(LAST_ACTIVE_TS_KEY, String(now));
      return null;
    }

    const prevMs = Number(rawPrev);
    if (!prevMs || Number.isNaN(prevMs)) return null;

    const prevDate = new Date(prevMs);
    const prevIso = formatToLocalIsoDate(prevDate);

    const diffHours = (now - prevMs) / (1000 * 60 * 60);
    // Genuine overnight rest gap: previous activity was on an earlier local calendar day and gap is 4..12 hrs
    if (prevIso < todayIso && diffHours >= 4 && diffHours <= 12) {
      const roundedHalfHour = Math.min(11, Math.max(4, Math.round(diffHours * 2) / 2));
      localStorage.setItem(SLEEP_SYNC_DATE_KEY, todayIso);
      localStorage.setItem(LAST_ACTIVE_TS_KEY, String(now));
      return roundedHalfHour;
    }

    localStorage.setItem(LAST_ACTIVE_TS_KEY, String(now));
    return null;
  } catch {
    return null;
  }
}

export async function requestMotionSensorPermission(): Promise<'granted' | 'denied' | 'unsupported'> {
  if (typeof window === 'undefined') return 'unsupported';
  const DME = (window as any).DeviceMotionEvent;
  if (DME && typeof DME.requestPermission === 'function') {
    try {
      const res = await DME.requestPermission();
      return res === 'granted' ? 'granted' : 'denied';
    } catch {
      return 'denied';
    }
  }
  if ('DeviceMotionEvent' in window || 'Accelerometer' in window) {
    return 'granted';
  }
  return 'unsupported';
}

/**
 * Starts a lightweight Web DeviceMotion / Generic Accelerometer step detector.
 * Returns a cleanup function to stop listening.
 */
export function startStepPedometer(onStep: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  let lastMagnitude = 9.81;
  let lastStepTime = 0;

  const processAccelSample = (x: number, y: number, z: number) => {
    const mag = Math.sqrt(x * x + y * y + z * z);
    const delta = Math.abs(mag - lastMagnitude);
    lastMagnitude = mag;

    const now = Date.now();
    // Typical human walking cadence peak (>= 320ms apart, delta > 1.6 m/s^2)
    if (delta > 1.6 && now - lastStepTime > 320) {
      lastStepTime = now;
      onStep();
    }
  };

  if ('DeviceMotionEvent' in window) {
    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (!acc) return;
      processAccelSample(acc.x ?? 0, acc.y ?? 0, acc.z ?? 0);
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }

  // Fallback to W3C Generic Sensor API Accelerometer on supported Android browsers
  if ('Accelerometer' in window) {
    try {
      const AccelerometerCtor = (window as any).Accelerometer;
      const sensor = new AccelerometerCtor({ frequency: 20 });
      const handleReading = () => {
        processAccelSample(sensor.x ?? 0, sensor.y ?? 0, sensor.z ?? 0);
      };
      sensor.addEventListener('reading', handleReading);
      sensor.start();
      return () => {
        try {
          sensor.removeEventListener('reading', handleReading);
          sensor.stop();
        } catch {}
      };
    } catch {
      return () => {};
    }
  }

  return () => {};
}

/**
 * Parses an uploaded Apple Health XML, Google Health Connect JSON, or CSV export
 * to extract today's / latest step count and sleep hours.
 */
export function parseHealthExportFile(
  content: string,
  targetDate: string
): { steps?: number; sleepHours?: number; sourceNote: string } {
  const trimmed = (content || '').trim();
  if (!trimmed) return { sourceNote: 'Empty file' };

  // 1. JSON format (Health Connect / Shortcuts / Generic JSON)
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      const records = Array.isArray(parsed) ? parsed : [parsed];
      let steps: number | undefined;
      let sleepHours: number | undefined;

      for (const rec of records) {
        if (!rec || typeof rec !== 'object') continue;
        if (typeof rec.steps === 'number') steps = Math.max(steps || 0, Math.round(rec.steps));
        if (typeof rec.stepCount === 'number') steps = Math.max(steps || 0, Math.round(rec.stepCount));
        if (typeof rec.sleepHours === 'number') sleepHours = Number(rec.sleepHours.toFixed(1));
        if (typeof rec.sleepMinutes === 'number') {
          sleepHours = Math.round((rec.sleepMinutes / 60) * 2) / 2;
        }
      }
      return {
        steps,
        sleepHours,
        sourceNote: 'Imported from OS Health JSON',
      };
    } catch {
      // Fallback to text/XML scan
    }
  }

  // 2. Apple Health export.xml snippet
  if (trimmed.includes('HKQuantityTypeIdentifierStepCount') || trimmed.includes('<Record')) {
    let totalSteps = 0;
    const stepRegex = new RegExp(
      `HKQuantityTypeIdentifierStepCount[^>]*startDate="${targetDate}[^"]*"[^>]*value="(\\d+(?:\\.\\d+)?)"`,
      'g'
    );
    let m: RegExpExecArray | null;
    while ((m = stepRegex.exec(trimmed)) !== null) {
      totalSteps += Math.round(Number(m[1]) || 0);
    }
    return {
      steps: totalSteps > 0 ? totalSteps : undefined,
      sourceNote: 'Imported from Apple Health XML',
    };
  }

  // 3. CSV format (date,steps,sleepHours)
  const lines = trimmed.split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    if (line.includes(targetDate)) {
      const cols = line.split(/[,\t;]/).map((c) => c.trim());
      const numericCols = cols.map((c) => Number(c)).filter((n) => !Number.isNaN(n));
      if (numericCols.length > 0) {
        const steps = numericCols.find((n) => n >= 100);
        const sleepHours = numericCols.find((n) => n > 0 && n <= 16);
        return {
          steps: steps !== undefined ? Math.round(steps) : undefined,
          sleepHours: sleepHours !== undefined ? Math.round(sleepHours * 2) / 2 : undefined,
          sourceNote: 'Imported from Health CSV',
        };
      }
    }
  }

  return { sourceNote: 'No matching steps or sleep rows found for this date' };
}
