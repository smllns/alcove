// alcove's service worker: only for notifications (nothing is kept for
// offline use, so a new version of the site is always the one shown).
// A message from the server (server/src/push/send.ts) is shown as a
// notification; tapped, it opens where it says in alcove: in the window
// already open if there is one (which goes there itself, as any link
// would: app/FollowNotifications), or else in a new one.

// A new version takes over at once, the open windows too
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) =>
  event.waitUntil(self.clients.claim()),
);

self.addEventListener('push', (event) => {
  const message = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(message.title || 'alcove', {
      body: message.body,
      tag: message.tag,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: message.url || '/library' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const to = event.notification.data?.url || '/library';
  event.waitUntil(
    (async () => {
      const [here] = await self.clients.matchAll({ type: 'window' });
      if (!here) return self.clients.openWindow(to);
      here.postMessage({ goTo: to });
      return here.focus();
    })(),
  );
});
