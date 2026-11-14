/**
 * Reliable Cross-Device Notification Helper
 * Uses ServiceWorkerRegistration.showNotification() so Android Chrome never throws
 * `TypeError: Illegal constructor` when calling `new Notification(...)`, and falls back safely.
 */

export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

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
    return perm;
  } catch {
    return Notification.permission || 'default';
  }
}

export interface OSNotificationOptions {
  body: string;
  tag?: string;
  url?: string;
  renotify?: boolean;
}

export async function showOSNotification(title: string, options: OSNotificationOptions): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission !== 'granted') {
    return false;
  }

  const payload = {
    body: options.body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: options.tag || `nutritrack-${Date.now()}`,
    renotify: options.renotify ?? false,
    data: { url: options.url || '/' },
  };

  // Prefer Service Worker notification (required by Android Chrome, works seamlessly on Desktop too)
  if ('serviceWorker' in navigator) {
    try {
      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        reg = await navigator.serviceWorker.register('/sw.js');
      }
      const readyReg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<ServiceWorkerRegistration>((resolve) => setTimeout(() => resolve(reg!), 1200)),
      ]);
      if (readyReg && typeof readyReg.showNotification === 'function') {
        await readyReg.showNotification(title, payload);
        return true;
      }
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
