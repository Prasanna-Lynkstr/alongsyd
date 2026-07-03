/* Alongsyd service worker — offline-friendly app shell + Web Push.
 * Deliberately simple for the pilot: a network-first strategy that falls back
 * to cache so the installed app still opens if the connection drops. */
const CACHE = "alongsyd-v3";
const APP_SHELL = ["/", "/schemes", "/manifest.webmanifest", "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  // Only handle same-origin GETs; never cache auth or API calls.
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/auth")) return;

  // Navigations must honour the server's auth/onboarding redirects. A plain
  // fetch() of a navigation request (redirect mode "manual") yields an opaque
  // redirect, and iOS standalone PWAs refuse to render that — the tell-tale
  // "This page couldn't load." So we follow redirects and hand the browser a
  // clean redirect it can act on; offline, we fall back to the cached shell.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(new Request(request, { redirect: "follow" }))
        .then((response) =>
          response.redirected ? Response.redirect(response.url, 302) : response,
        )
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/")),
        ),
    );
    return;
  }

  // Non-navigation same-origin GETs (assets, data): network-first, cache fallback.
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("/"))),
  );
});

/* ---- Web Push -------------------------------------------------------------
 * Show a notification when the server pushes one, and open the relevant screen
 * (e.g. the answered question) when the parent taps it. */
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data && event.data.text() };
  }
  const title = data.title || "Alongsyd";
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: data.tag,
    data: { url: data.url || "/ask" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/ask";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windows) => {
        // Focus an existing tab on that URL if we have one; else open it.
        for (const client of windows) {
          if (client.url.includes(target) && "focus" in client) return client.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow(target);
      }),
  );
});
