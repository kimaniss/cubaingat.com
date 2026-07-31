const CACHE_NAME = 'cubaingat-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://arleta.site/interactivelink/118/logo-cubaingat.png'
];

// 1. Install Event: Cache aset asas untuk keupayaan Offline
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Bersihkan cache lama jika ada
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event: Benarkan app dibuka semasa Offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});

// 4. Custom Event untuk Terima Pemicu Notifikasi dari Main Thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body } = event.data;

    const options = {
      body: body,
      icon: 'https://arleta.site/interactivelink/118/logo-cubaingat.png',
      badge: 'https://arleta.site/interactivelink/118/logo-cubaingat.png',
      vibrate: [200, 100, 200, 100, 200],
      tag: 'cubaingat-reminder',
      renotify: true,
      actions: [
        { action: 'open', title: '👁️ Buka App' }
      ]
    };

    self.registration.showNotification(title, options);
  }
});

// 5. Notification Click Event: Buka balik app apabila pengguna klik notifikasi
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let client of clientList) {
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./index.html');
      }
    })
  );
});
