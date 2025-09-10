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
  
  // Don't skip waiting automatically - let the app decide
  self.skipWaiting();
});

// Listen for messages from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push notification event listener
self.addEventListener('push', event => {
  console.log('Push notification received:', event);
  
  let notificationData = {};
  
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      console.log('Error parsing push data:', e);
      notificationData = {
        title: 'Nova Notificação',
        message: event.data.text()
      };
    }
  } else {
    notificationData = {
      title: 'Nova Notificação',
      message: 'Você tem uma nova notificação do FoodScan AI'
    };
  }

  const options = {
    body: notificationData.message || notificationData.body,
    icon: '/icons/icon-192x192-foodscan.png',
    badge: '/icons/icon-192x192-foodscan.png',
    tag: 'foodscan-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'Ver',
        icon: '/icons/icon-192x192-foodscan.png'
      }
    ],
    data: {
      url: '/',
      ...notificationData
    }
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title || 'FoodScan AI', options)
  );
});

// Notification click event listener
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clientList => {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no existing window/tab was found, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
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
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
  
  // Notify clients about the update
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'UPDATE_AVAILABLE',
        waitingWorker: self
      });
    });
  });
});