const CACHE_NAME = "note-cache-v6";
const BASE = "/Re_S2miL/";

const FILES_TO_CACHE = [
  BASE + "index.html",
  BASE + "manifest.json",
  BASE + "Study.css",
  BASE + "Study.js",
  BASE + "title.js",
  BASE + "icons/icon-192.png",
  BASE + "icons/icon-512.png"
];

self.addEventListener("install", (e) => {
  console.log("SW install 시작");
  self.skipWaiting();

  e.waitUntil(
    caches.open(CACHE_NAME).then((c) => {
      console.log("캐시 오픈");
      return c.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  event.respondWith(
    caches.match(req).then((cached) => {
      return cached || fetch(req);
    })
  );
});