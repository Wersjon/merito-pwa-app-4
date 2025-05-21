// strategia stale-while-revalidate

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("pwa-4-cache-v1").then((cache) => {
      return cache.addAll([
        "/pwa_app_4/index.html",
        "/pwa_app_4/sticky-notes.html",
        "/pwa_app_4/weather.html",
        "/pwa_app_4/src/weather.js",
        "/pwa_app_4/src/sticky-notes.js",
        "/pwa_app_4/src/db.js",
        "/pwa_app_4/src/app.js",
        "/pwa_app_4/manifest.json",
        "/pwa_app_4/icons/icon-192x192.png",
        "/pwa_app_4/icons/icon-512x512.png",
      ]);
    })
  );
});

// stale-while-revalidate: zwraca cache, ale w tle pobiera i aktualizuje cache brrrrr
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.open("pwa-4-cache-v1").then((cache) =>
      cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse); // fallback na cache

        return cachedResponse || fetchPromise;
      })
    )
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = ["pwa-4-cache-v1"];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
