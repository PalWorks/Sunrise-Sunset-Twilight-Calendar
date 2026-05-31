const CACHE_NAME = 'sunmooncal-v2';
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
  '/about',
  '/contact',
  '/definitions',
  '/accuracy',
  '/faq'
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

  // Bypass SW for .html extensions (except index.html) because Cloudflare Pages redirects them to clean URLs,
  // which causes an opaque redirect ERR_FAILED bug in Chromium service workers.
  if (url.pathname.endsWith('.html') && url.pathname !== '/index.html') {
    return; // Let the browser handle the 308 redirect natively
  }

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
