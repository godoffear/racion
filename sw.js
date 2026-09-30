// Рацион: работа без интернета.
// Страница открывается из кэша сразу, свежая версия тихо подтягивается в фоне.
const CACHE = 'racion-v3-2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
const PAGE = new URL('./index.html', self.registration.scope).href;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (r.cache === 'no-store' || u.hostname === 'calendar.google.com') return;
  if (r.mode === 'navigate') {
    const net = fetch(r).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(PAGE, copy)); }
      return res;
    });
    e.respondWith(caches.match(PAGE).then(hit => {
      if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
      return net.catch(() => caches.match(PAGE));
    }));
    return;
  }
  if (u.origin === location.origin || u.hostname.endsWith('googleapis.com') || u.hostname.endsWith('gstatic.com')) {
    e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => {
      if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); }
      return res;
    })));
  }
});
