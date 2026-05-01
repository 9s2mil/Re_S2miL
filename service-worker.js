const CACHE_NAME = "note-cache-v6";
const BASE = "/Re_S2miL/";

const FILES_TO_CACHE = [
  BASE + "index.html",
  BASE + "manifest.json",
  BASE + "Study.css",
  BASE + "Study.js",
  BASE + "icons/icon-192.png",
  BASE + "icons/icon-512.png"
];

self.addEventListener("install", (e) => {
  console.log("SW install 시작");
  self.skipWaiting();

  e.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log("캐시 오픈");

      for (const url of FILES_TO_CACHE) {
        try {
          const res = await fetch(url, { cache: "no-cache" });

          if (!res || !res.ok) {
            console.warn("캐시 실패(무시):", url);
            continue;
          }

          await cache.put(url, res);
          console.log("캐시 성공:", url);

        } catch (err) {
          console.warn("네트워크 실패(무시):", url);
        }
      }
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
  const BASE = "/Re_S2miL/";

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req).catch(() => {
        if (req.mode === "navigate") {
          return caches.match(BASE + "index.html");
        }
        return new Response("", { status: 404 });
      });
    })
  );
});