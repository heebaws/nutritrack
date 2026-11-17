/**
 * Reliable Cross-Device Notification Helper (Installed PWA Mobile + Desktop Parity)
 * Uses ServiceWorkerRegistration.showNotification() so Android Chrome & installed PWAs
 * never throw `TypeError: Illegal constructor`, syncs reminder schedules into the SW,
 * and persists permission state smoothly.
 */

export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

const PERM_GRANTED_STORAGE_KEY = 'nutritrack_clinic_v1_notif_granted';

export function isInstalledPWA(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

export function getNotificationStatus(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestOSNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      try {
        localStorage.setItem(PERM_GRANTED_STORAGE_KEY, '1');
      } catch {}
    }
    return perm;
  } catch {
    return Notification.permission || 'default';
  }
}

export function wasNotificationOnceAllowed(): boolean {
  try {
    return localStorage.getItem(PERM_GRANTED_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export interface OSNotificationOptions {
  body: string;
  tag?: string;
  url?: string;
  renotify?: boolean;
}

async function getReadyServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    let reg = await navigator.serviceWorker.getRegistration();
    if (!reg) {
      reg = await navigator.serviceWorker.register('/sw.js');
    }
    const readyReg = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<ServiceWorkerRegistration>((resolve) => setTimeout(() => resolve(reg!), 1200)),
    ]);
    return readyReg || null;
  } catch {
    return null;
  }
}

export async function showOSNotification(title: string, options: OSNotificationOptions): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission !== 'granted') {
    return false;
  }

  const payload: NotificationOptions & { renotify?: boolean } = {
    body: options.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: options.tag || `nutritrack-${Date.now()}`,
    renotify: options.renotify ?? false,
    data: { url: options.url || '/' },
  };

  // Prefer Service Worker notification (required by Android Chrome & installed PWAs, works on Desktop too)
  const readyReg = await getReadyServiceWorker();
  if (readyReg && typeof readyReg.showNotification === 'function') {
    try {
      await readyReg.showNotification(title, payload);
      return true;
    } catch {
      // Fall through to standard Notification constructor
    }
  }

  try {
    new Notification(title, {
      body: payload.body,
      icon: payload.icon,
      tag: payload.tag,
    });
    return true;
  } catch {
    return false;
  }
}

export function parseTimeTo24h(timeStr: string): { hour: number; minute: number } | null {
  const m = (timeStr || '').match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  const minute = parseInt(m[2], 10);
  const ampm = m[3]?.toUpperCase();
  if (ampm === 'PM' && hour < 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  return { hour, minute };
}

export interface SyncedReminderScheduleItem {
  id: string;
  title: string;
  message: string;
  hour: number;
  minute: number;
  enabled: boolean;
}

/**
 * Syncs the client's enabled reminder schedule into the Service Worker cache so
 * installed mobile & desktop PWAs receive consistent alerts on time and on wake.
 */
export async function syncReminderScheduleToSW(items: SyncedReminderScheduleItem[]): Promise<void> {
  const reg = await getReadyServiceWorker();
  if (!reg) return;
  const target = reg.active || navigator.serviceWorker.controller;
  if (target) {
    target.postMessage({
      type: 'SYNC_NOTIFICATION_SCHEDULE',
      reminders: items,
    });
  }
  // Best-effort Periodic Background Sync registration when permission is granted
  if ('periodicSync' in reg && typeof (reg as any).periodicSync?.register === 'function') {
    try {
      await (reg as any).periodicSync.register('nutritrack-reminder-check', {
        minInterval: 30 * 60 * 1000,
      });
    } catch {
      // Optional browser capability
    }
  }
}

export async function triggerSWDueNotificationCheck(): Promise<void> {
  const reg = await getReadyServiceWorker();
  const target = reg?.active || (typeof navigator !== 'undefined' ? navigator.serviceWorker?.controller : null);
  if (target) {
    target.postMessage({ type: 'CHECK_DUE_NOTIFICATIONS' });
  }
}

export function isIOSDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent || '');
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function getExistingPushSubscription(): Promise<PushSubscription | null> {
  if (typeof window === 'undefined' || !('PushManager' in window)) return null;
  const reg = await getReadyServiceWorker();
  if (!reg?.pushManager) return null;
  try {
    return await reg.pushManager.getSubscription();
  } catch {
    return null;
  }
}

export async function subscribeDeviceToWebPush(
  clientId: string,
  reminders: SyncedReminderScheduleItem[] = []
): Promise<{ ok: boolean; endpoint?: string }> {
  if (typeof window === 'undefined' || !('Notification' in window) || !('PushManager' in window)) {
    return { ok: false };
  }
  if (Notification.permission !== 'granted') {
    return { ok: false };
  }

  try {
    const reg = await getReadyServiceWorker();
    if (!reg?.pushManager) return { ok: false };

    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      const keyRes = await fetch('/api/push/vapid-public-key');
      if (!keyRes.ok) return { ok: false };
      const { publicKey } = await keyRes.json();
      if (!publicKey) return { ok: false };

      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }

    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        subscription: subscription.toJSON(),
        timezoneOffsetMinutes: new Date().getTimezoneOffset(),
        reminders,
      }),
    });

    if (!res.ok) return { ok: false };
    return { ok: true, endpoint: subscription.endpoint };
  } catch {
    return { ok: false };
  }
}

export async function syncRemindersToPushServer(
  clientId: string,
  reminders: SyncedReminderScheduleItem[]
): Promise<void> {
  try {
    const existingSub = await getExistingPushSubscription();
    if (!existingSub) {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        await subscribeDeviceToWebPush(clientId, reminders);
      }
      return;
    }

    await fetch('/api/push/sync-reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        endpoint: existingSub.endpoint,
        timezoneOffsetMinutes: new Date().getTimezoneOffset(),
        reminders,
      }),
    });
  } catch {
    // Non-blocking sync
  }
}

export async function sendServerTestWebPush(
  clientId: string,
  title: string,
  body: string
): Promise<boolean> {
  try {
    const existingSub = await getExistingPushSubscription();
    const res = await fetch('/api/push/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        endpoint: existingSub?.endpoint,
        title,
        body,
      }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.success);
  } catch {
    return false;
  }
}

