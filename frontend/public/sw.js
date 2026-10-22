// self.addEventListener('install', (event) => {
//  // console.log('[SW] Service Worker installed');
//   self.skipWaiting();
// });

// self.addEventListener('activate', (event) => {
//   //console.log('[SW] Service Worker activated');
//   event.waitUntil(clients.claim());
// });

// self.addEventListener('fetch', (event) => {
//   event.respondWith(fetch(event.request));
// });