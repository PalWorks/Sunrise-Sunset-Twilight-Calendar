const CACHE_NAME = 'sunmooncal-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/js/app.js',
  '/js/export.js',
  '/js/calendar.js',
  '/js/navigation.js',
  '/js/suncalc.js',
  '/js/jspdf.umd.min.js',
  '/js/html2canvas.min.js',
  '/about.html',
  '/contact.html',
  '/definitions.html',
  '/accuracy.html',
  '/faq.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all assets');
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Stale-While-Revalidate for external CDNs (Leaflet, Google Fonts)
  if (url.hostname === 'unpkg.com' || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open('sunmooncal-cdn-v1').then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }).catch(() => {
            console.error('[SW Error] Failed to fetch CDN resource:', event.request.url);
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Cache First for local assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch((err) => {
        console.error('[SW Error] Network fetch failed:', err);
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
