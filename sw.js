// Si cambias algún archivo de la app, sube el número de versión para que los celulares se actualicen.
const V = 'horas-extras-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png',
  './icon-512-maskable.png', './jspdf.umd.min.js', './jspdf.plugin.autotable.min.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});
// Responde desde el celular (funciona sin internet) y actualiza en segundo plano.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    const c = await caches.open(V);
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => {
      if (r && r.ok && new URL(e.request.url).origin === location.origin) c.put(e.request, r.clone());
      return r;
    }).catch(() => null);
    return hit || (await net) || c.match('./index.html');
  })());
});
