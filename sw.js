"use strict";

const CACHE_PREFIX = "osis-pwa-shell-";
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const SHELL_FILES = [
  "./index.html", "./styles.css", "./app.js", "./manifest.webmanifest", "./favicon.svg",
  "./icons/icon-192.png", "./icons/icon-512.png",
  "./icons/icon-maskable-512.png", "./icons/apple-touch-icon.png"
];
const SHELL_URLS = SHELL_FILES.map(path => new URL(path, self.location.href).href);
const INDEX_URL = new URL("./index.html", self.location.href).href;

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(SHELL_URLS.map(url => new Request(url, { cache: "reload" })));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  // Konten Apps Script dan data pengguna tidak disimpan oleh service worker ini.
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        return await fetch(request);
      } catch {
        return (await caches.match(INDEX_URL)) || Response.error();
      }
    })());
    return;
  }

  // Cache hanya berkas tampilan yang tercantum, bukan endpoint lain.
  if (!SHELL_URLS.includes(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response.ok) {
        try { await cache.put(request, response.clone()); } catch { /* Kuota cache penuh. */ }
      }
      return response;
    } catch {
      return (await cache.match(request)) || Response.error();
    }
  })());
});
