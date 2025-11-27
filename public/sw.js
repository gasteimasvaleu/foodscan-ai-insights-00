// Aimtell SDK - Must be first
importScripts('https://cdn.aimtell.com/sdk/aimtell-worker-sdk.js');

const CACHE_NAME = 'foodscan-ai-v3';
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
  
  self.skipWaiting();
});

// Listen for messages from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();

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
    }).then(() => {
      return self.clients.claim();
    })
  );
  
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'UPDATE_AVAILABLE',
        waitingWorker: self
      });
    });
  });
});
