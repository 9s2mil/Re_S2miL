const CACHE_NAME = "note-cache-v90";
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
  // 🔥 외부 요청은 건드리지 않음 (Google Fonts 등)
  if (!event.request.url.startsWith(self.location.origin)) return;

  const req = event.request;
  const BASE = "/Re_S2miL/";

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        return res;
      }).catch(() => {
        // ⭐ 오프라인일 때 "문서"만 index.html로 대체
        if (req.mode === "navigate") {
          return caches.match(BASE + "index.html");
        }

        // ❗ 나머지는 그냥 실패하도록 둠 (404 응답 생성 금지)
      });
    })
  );
});