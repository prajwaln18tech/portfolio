// Service worker: precache the shell, then network-first so the live site is always fresh
// and the cached copy is only used when offline.
const CACHE = 'pn-portfolio-v6';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/style.css',
  './assets/js/main.js',
  './assets/js/data.js',
  './assets/js/ui.js',
  './assets/js/field.js',
  './assets/js/terminal.js',
  './assets/js/search.js',
  './assets/js/ask.js',
  './assets/js/pipeline.js',
  './assets/js/clusters.js',
  './assets/js/palette.js',
  './assets/js/colophon.js',
  './assets/js/confetti.js',
  './assets/js/embed-worker.js',
  './assets/js/narrator.js',
  './assets/icons/icon.svg',
  './images/portrait-cutout.webp',
  './images/avatar.webp',
  './images/myimage.jpeg',
  './images/nasa.jpg',
];
const FONTS = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin && !FONTS.test(request.url)) return; // model weights etc. are cached by Transformers.js itself

  e.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok || res.type === 'opaque') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
        }
        return res;
      })
      .catch(() => caches.match(request, { ignoreSearch: true }).then((hit) => hit || caches.match('./index.html'))),
  );
});
