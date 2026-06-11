const CACHE_NAME = 'synkora-site-v13';
const OFFLINE_URL = './offline.html';

/* Core app shell: files needed for first paint and offline navigation. */
const CORE_ASSETS = [
  './',
  './index.html',
  OFFLINE_URL,
  './site.webmanifest',
  './css/styles.css?v=20260611b',
  './js/app.js?v=20260611b',
  './assets/favicon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/apple-touch-icon.png',
  './assets/logo-mark.svg',
  './assets/logo.png',
  './pages/apropos.html',
  './pages/bizpocket.html',
  './pages/buildsync-ai.html',
  './pages/devis-btp.html',
  './pages/cgu.html',
  './pages/confidentialite.html',
  './pages/cookies.html',
  './pages/lodpam.html',
  './pages/mentions-legales.html',
  './pages/studynk.html',
  './pages/article-lancement-synkora.html',
  './pages/article-buildsync-ai-btp.html',
  './pages/article-ecosysteme-multi-plateformes.html'
];

const STATIC_DESTINATIONS = new Set(['style', 'script', 'image', 'font', 'manifest']);

/* Shared cache writer used by both network-first and cache-first strategies. */
const cacheResponse = async (request, response) => {
  if (!response || response.status !== 200) return response;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
  return response;
};

/* Pages prefer fresh network content, then fall back to cache and offline.html. */
const networkFirst = async (request) => {
  const cached = await caches.match(request);
  const network = fetch(request)
    .then((response) => cacheResponse(request, response))
    .catch(() => null);
  const timeout = new Promise((resolve) => {
    setTimeout(() => resolve(null), 2500);
  });
  const response = await Promise.race([network, timeout]);

  return response || cached || await network || await caches.match(OFFLINE_URL);
};

/* Static assets prefer cache for faster repeat visits and stronger offline support. */
const cacheFirst = async (request) => {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    return await cacheResponse(request, await fetch(request));
  } catch (error) {
    return cached || Response.error();
  }
};

/* Install: preload the app shell, then activate the new worker immediately. */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* Activate: delete old cache versions and claim current tabs. */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

/* Fetch: handle same-origin GET requests only; external links stay untouched. */
self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (STATIC_DESTINATIONS.has(request.destination) || url.pathname.endsWith('.webmanifest')) {
    event.respondWith(cacheFirst(request));
  }
});
