/* NutriTrack Pro Service Worker — Mobile Notifications & PWA Support */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
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
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag,
      renotify: true,
      data: { url },
    })
  );
});

// Focus app window or open it when user taps phone notification
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
