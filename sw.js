/* Allerlingo Offline-Speicher: Die App wird beim ersten Besuch auf dem Handy gespeichert
   und funktioniert danach auch ohne Internet. Bei Internet holt sie sich im Hintergrund Updates. */
const CACHE = "allerlingo-v15";
const FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./favicon.png",
  "./impressum.html",
  "./datenschutz.html",
  "./legal.css",
  "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const isPage = req.mode === "navigate";
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(isPage ? "./" : req, { ignoreSearch: isPage });
      const fresh = fetch(req).then(res => {
        if (res && (res.ok || res.type === "opaque")) cache.put(isPage ? "./" : req, res.clone());
        return res;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});
