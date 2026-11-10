/* Service worker (generuje se při buildu – viz vite.config.ts). Verze se mění s každým buildem. */
const VERSION = '62cca18ae77b';
const CACHE = 'kt-' + VERSION;
const PRECACHE = ["./","./assets/index-Dqj7_qCg.css","./assets/index-Ytvnw6xt.js","./favicon.svg","./index.html","./manifest.webmanifest","./vily-l.webp","./vily-r.webp"];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('kt-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (e) => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    // stránka: nejdřív síť (čerstvý program), při výpadku uložená verze
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put('./index.html', copy));
        return res;
      }).catch(() => caches.match('./index.html')),
    );
    return;
  }
  // soubory s hashem v názvu: nejdřív cache
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    })),
  );
});
