/* Service worker: app shell + data precached, photos cached as viewed. The group API (/api/*) is NEVER cached. */
const V = '4bacca1d68', SHELL = 'crew-shell-' + V, PHOTOS = 'crew-photos-v1';
const ASSETS = ['index.html', 'app.css?v=' + V, 'app.js?v=' + V, 'intro.js?v=' + V, 'vendor/leaflet.js?v=' + V, 'vendor/leaflet.css?v=' + V,
  'japan.json?v=' + V, 'data.json?v=' + V, 'manifest.json', 'icon-180.png', 'icon-192.png', 'icon-512.png',
  'fonts/fonts.css?v=' + V, ...['khand-500', 'khand-600', 'khand-700', 'hind-400', 'hind-500', 'hind-600', 'hind-700'].map(f => `fonts/${f}-latin.woff2`)];
self.addEventListener('install', e => e.waitUntil(caches.open(SHELL).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('crew-shell-') && k !== SHELL).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/') || u.pathname.startsWith('/.netlify/')) return;
  if (/\/(p|t)\/[^/]+/.test(u.pathname)) {
    e.respondWith(caches.open(PHOTOS).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r }))));
    return;
  }
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(SHELL).then(c => c.put('index.html', copy)); return r }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
