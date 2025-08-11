const CACHE_NAME = 'foodscan-ai-v2';
const urlsToCache = [
  '/',
  '/food-scan',
  '/controle-diario',
  '/fit-tracker',
  '/servnutri',
  '/masterchef',
  '/about',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192-temp.png',
  '/icons/icon-512x512-new.png',
  '/assets/foodscan-logo.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache strategy: cache navigation requests and static assets
          if (event.request.mode === 'navigate' || 
              event.request.destination === 'style' ||
              event.request.destination === 'script' ||
              event.request.destination === 'image') {
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }

          return response;
        }).catch(() => {
          // Network failed, try to serve offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});