/* Service worker: guarda o app para funcionar offline. Troque VERSION ao publicar mudanças. */
const VERSION = 'ym-v5';
const FILES = ['./', './index.html', './style.css', './app.js', './data.js', './kanji.js', './prep.js', './audio/index.js', './pos.js', './drinks.js', './cond.js', './audio/pos.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return; // Wikipedia etc. vão direto à rede
  // rede primeiro, sempre conferindo com o servidor (cache: 'no-cache'), para atualizações aparecerem no próximo carregamento;
  // sem internet, usa a cópia guardada
  e.respondWith(
    fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)).catch(() => { }); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
