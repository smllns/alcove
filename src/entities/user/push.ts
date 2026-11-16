import { request } from '@/shared/api/http';

// This device taking alcove's notifications (a heart on the reader's
// review, a follow, alcove's news), through its browser's push service,
// or no longer; the service worker that shows them is public/sw.js

// Whether this browser can take notifications at all
export const pushSupported = () =>
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

// An iPhone or iPad takes them only in alcove opened from its home screen,
// not in a tab
export const needsHomeScreen = () => {
  const apple =
    /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  return apple && !matchMedia('(display-mode: standalone)').matches;
};

// The service worker, as the site loads
export function registerWorker() {
  if ('serviceWorker' in navigator)
    navigator.serviceWorker.register('/sw.js').catch(() => {});
}

// The key push services take alcove's messages by; none when the server
// sends none
export const fetchPushKey = async () =>
  (await request<{ key: string | null }>('/push/key')).key;

// What this device's push service knows it by, if it takes them now
export async function deviceSubscription() {
  if (!pushSupported()) return null;
  const worker = await navigator.serviceWorker.ready;
  return worker.pushManager.getSubscription();
}

// Notifications turned on here: asked of the reader first, as a tap on
// the switch (a browser asks only then), and told to the server; false
// if the reader said no
export async function turnPushOn(key: string) {
  if ((await Notification.requestPermission()) !== 'granted') return false;
  const worker = await navigator.serviceWorker.ready;
  const subscription = await worker.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: key,
  });
  await request('/push/devices', {
    method: 'POST',
    body: subscription.toJSON(),
  });
  return true;
}

// Turned off here: the server forgets the device first, while it's still
// signed in as the reader (as on signing out)
export async function turnPushOff() {
  const subscription = await deviceSubscription().catch(() => null);
  if (!subscription) return;
  await request('/push/devices', {
    method: 'DELETE',
    body: { endpoint: subscription.endpoint },
  }).catch(() => {});
  await subscription.unsubscribe();
}
