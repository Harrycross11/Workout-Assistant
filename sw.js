// ============================================================
// Workout Assistant - service worker
// ============================================================
// Cache-first for the app shell (everything needed to run offline) - bump
// CACHE_NAME whenever any cached file changes so old clients pick up the
// new version instead of being stuck on a stale cache forever.
const CACHE_NAME = 'workout-assistant-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './data.js',
  './storage.js',
  './chart.js',
  './notifications.js',
  './app.js',
  './manifest.json',
  './icons/icon.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
        return response;
      }).catch(() => cached);
    })
  );
});

// ---------- Periodic Background Sync (Chrome/Android only, best effort) ----------
// See notifications.js's top comment for the full explanation of why this
// can't be a precise schedule. IMPORTANT SIMPLIFICATION: a service worker
// can't read localStorage (only page-context JS can), so this handler can't
// check your actual workout times/check-in status the way
// checkScheduledNotifications() does when the app itself is open. Instead it
// just shows a generic nudge - the real, detailed reminder logic runs the
// moment you next actually open the app (see app.js's visibilitychange/
// focus listeners), which is the reliable path. This is a deliberate,
// documented trade-off rather than duplicating the whole data layer into
// IndexedDB just for this rarely-triggered, browser-throttled event.
self.addEventListener('periodicsync', (e) => {
  if (e.tag === 'workout-assistant-check') {
    e.waitUntil(
      self.registration.showNotification('Workout Assistant', {
        body: "Open the app to see today's workout, meals, or check-in status.",
        tag: 'periodic-nudge',
        icon: 'icons/icon-192.png',
      })
    );
  }
});
