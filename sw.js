/* Scoped app-shell cache. Bump VERSION when publishing changed assets. */
const VERSION = 'liver-reset-v3';
const CACHE = VERSION + '-' + self.registration.scope;
const ASSETS = ['./', './index.html', './manifest.json', './images/icon-192.png', './images/icon-512.png', './images/wellness-atlas.png', './images/sunrise.png', './fonts/thai-400.woff2', './fonts/thai-700.woff2'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('liver-reset-') && key.endsWith(self.registration.scope) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  // Navigation is network-first; app shell is the offline fallback.
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE).then(cache => cache.put('./index.html', copy)));
        return response;
      }
      return caches.match('./index.html').then(cached => cached || response);
    }).catch(() => caches.match('./index.html')));
    return;
  }
  // Cache same-origin assets when present. Missing optional photos use HTML placeholders.
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response.ok && response.type === 'basic') {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE).then(cache => cache.put(request, copy)));
    }
    return response;
  }).catch(() => new Response('', {status: 503, statusText: 'Offline'}))));
});
