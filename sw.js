/* Service worker: guarda o app para funcionar offline. Troque VERSION ao publicar mudanças. */
const VERSION = 'ym-v2';
const FILES = ['./', './index.html', './style.css', './app.js', './data.js', './kanji.js', './prep.js', './audio/index.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return; // Wikipedia etc. vão direto à rede
  // rede primeiro (pega atualizações), cache como reserva offline
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(req, copy)).catch(() => { });
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
