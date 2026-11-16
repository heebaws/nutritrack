/* NutriTrack Pro Service Worker — Installed App & Desktop Notifications + Schedule Sync */

const SCHEDULE_CACHE = 'nutritrack-schedule-v1';
const SCHEDULE_KEY = '/_nutritrack_reminder_schedule.json';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.clients.claim().then(() => checkAndFireDueScheduledNotifications())
  );
});

async function readScheduleData() {
  try {
    const cache = await caches.open(SCHEDULE_CACHE);
    const res = await cache.match(SCHEDULE_KEY);
    if (!res) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function writeScheduleData(data) {
  try {
    const cache = await caches.open(SCHEDULE_CACHE);
    await cache.put(
      SCHEDULE_KEY,
      new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      })
    );
  } catch {}
}

function getNextOccurrenceTimestamp(hour, minute) {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime();
}

async function scheduleOSNotificationTriggers(reminders) {
  if (!Array.isArray(reminders)) return;
  // Use Notification Triggers API (`TimestampTrigger`) when supported by Chromium/Android
  if (typeof self.TimestampTrigger === 'undefined') return;
  if (!self.registration || typeof self.registration.showNotification !== 'function') return;

  for (const rem of reminders) {
    if (!rem || !rem.enabled || typeof rem.hour !== 'number' || typeof rem.minute !== 'number') continue;
    const tag = `nutritrack-sched-${rem.id}`;
    try {
      const existing = await self.registration.getNotifications({ tag, includeTriggered: true });
      for (const n of existing) {
        n.close();
      }
      const fireAt = getNextOccurrenceTimestamp(rem.hour, rem.minute);
      await self.registration.showNotification(rem.title || 'NutriTrack Pro Reminder', {
        body: rem.message || 'Time for your scheduled meal & nutrition check-in.',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag,
        renotify: true,
        showTrigger: new self.TimestampTrigger(fireAt),
        data: { url: '/' },
      });
    } catch {
      // Ignore if browser rejects showTrigger
    }
  }
}

async function checkAndFireDueScheduledNotifications() {
  try {
    const data = await readScheduleData();
    if (!data || !Array.isArray(data.reminders) || !data.reminders.length) return;
    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') return;

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const firedMap = data.firedMap || {};
    let updated = false;

    for (const rem of data.reminders) {
      if (!rem || !rem.enabled || typeof rem.hour !== 'number' || typeof rem.minute !== 'number') continue;
      const fireKey = `${rem.id}:${todayStr}`;
      if (firedMap[fireKey]) continue;

      const targetMinutes = rem.hour * 60 + rem.minute;
      // Fire if within scheduled minute up to 20 minutes after target (catches wakeups & installed PWA launches)
      if (nowMinutes >= targetMinutes && nowMinutes <= targetMinutes + 20) {
        firedMap[fireKey] = Date.now();
        updated = true;
        await self.registration.showNotification(rem.title || 'NutriTrack Pro Reminder', {
          body: rem.message || 'Time for your scheduled meal & nutrition check-in.',
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          tag: `nutritrack-meal-${rem.id}-${todayStr}`,
          renotify: true,
          data: { url: '/' },
        });
      }
    }

    if (updated) {
      await writeScheduleData({ ...data, firedMap });
    }
  } catch {}
}

// Receive synced reminder schedules or manual wake checks from the app
self.addEventListener('message', (event) => {
  const payload = event.data;
  if (!payload || typeof payload !== 'object') return;

  if (payload.type === 'SYNC_NOTIFICATION_SCHEDULE') {
    event.waitUntil(
      (async () => {
        const existing = (await readScheduleData()) || { firedMap: {} };
        await writeScheduleData({
          reminders: payload.reminders || [],
          firedMap: existing.firedMap || {},
          updatedAt: Date.now(),
        });
        await scheduleOSNotificationTriggers(payload.reminders || []);
        await checkAndFireDueScheduledNotifications();
      })()
    );
  } else if (payload.type === 'CHECK_DUE_NOTIFICATIONS') {
    event.waitUntil(checkAndFireDueScheduledNotifications());
  }
});

// Handle Periodic Background Sync (for installed PWAs on Chrome/Edge/Android)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'nutritrack-reminder-check') {
    event.waitUntil(checkAndFireDueScheduledNotifications());
  }
});

// Handle Web Push payloads (ready for VAPID / FCM backend push when configured)
self.addEventListener('push', (event) => {
  let title = 'NutriTrack Pro Reminder';
  let body = 'Time for your scheduled nutrition & hydration check-in.';
  let tag = 'nutritrack-push';
  let url = '/';

  if (event.data) {
    try {
      const payload = event.data.json();
      title = payload.title || title;
      body = payload.body || body;
      tag = payload.tag || tag;
      url = payload.url || url;
    } catch {
      const text = event.data.text();
      if (text) body = text;
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag,
      renotify: true,
      data: { url },
    })
  );
});

// Focus app window or open installed PWA when user taps phone/desktop notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'NUTRITRACK_NOTIFICATION_CLICK', tag: event.notification.tag });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return undefined;
    })
  );
});
