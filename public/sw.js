const CACHE_NAME = 'homespend-v1';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

// No fetch handler — let all requests pass through normally
