// sw.js
const CACHE_NAME = 'musedo-v1';
const ASSETS = [
  './',                // GitHub Pages sẽ trả index.html cho path /musedo/
  './index.html',
  './Asset/icon-192.png',
  './Asset/icon-512.png',
  // Thêm các file tĩnh nặng nếu muốn: ảnh, fonts, ...
];

// Cài đặt: pre-cache
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

// Kích hoạt: dọn cache cũ
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Chiến lược: network first, fallback cache
self.addEventListener('fetch', (e) => {
  const req = e.request;
  e.respondWith(
    fetch(req)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, resClone));
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
  );
});