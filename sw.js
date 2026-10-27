const CACHE = "selfcare-studio-2.1";
const CORE = ["./", "./index.html", "./installieren.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const r = e.request; if (r.method !== "GET") return;
  const url = new URL(r.url);
  if (r.mode === "navigate") {
    const key = url.pathname.endsWith("installieren.html") ? "./installieren.html" : "./index.html";
    e.respondWith(fetch(r).then((res) => { const c = res.clone(); caches.open(CACHE).then((x) => x.put(key, c)); return res; }).catch(() => caches.match(key)));
    return;
  }
  if (url.origin === location.origin || url.host.endsWith("fonts.googleapis.com") || url.host.endsWith("fonts.gstatic.com")) {
    e.respondWith(caches.match(r).then((hit) => hit || fetch(r).then((res) => { if (res.ok || res.type === "opaque") { const c = res.clone(); caches.open(CACHE).then((x) => x.put(r, c)); } return res; })));
  }
});
