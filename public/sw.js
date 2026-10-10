// Minimal app-shell service worker.
// Deliberately does NOT cache anything under /api/ or any response
// that could contain diary text, insights, or report data — only
// the static shell, per section 17's privacy requirement.
const CACHE_NAME = "kk-shell-v1";
const SHELL_URLS = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)));
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/")) return; // never cache API responses
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
