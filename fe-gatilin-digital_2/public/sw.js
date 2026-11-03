/* Service worker de Gatilín Digital
 *  - Modo sin conexión: guarda las páginas y los datos públicos ya visitados.
 *  - Notificaciones push (recorridos y recordatorios).
 * Cambia VERSION al publicar para invalidar la caché antigua.
 */
const VERSION = 'v2';
const CACHE_PAGINAS = `gatilin-paginas-${VERSION}`;
const CACHE_ESTATICOS = `gatilin-estaticos-${VERSION}`;
const CACHE_DATOS = `gatilin-datos-${VERSION}`;

const PRECACHE = ['/', '/festival', '/sigueteo', '/mapa', '/offline.html', '/icons/icon-192.png', '/manifest.webmanifest'];

// Datos públicos que conviene tener sin conexión (red primero, caché si falla)
const API_CACHEABLE = /\/api\/(eventos(\?|$|\/tipos)|festival|cofradia\/(list|mapa|ranking|slug\/)|organizacion|cofrades\/by-cofradia)/;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_PAGINAS).then((cache) =>
      // Si alguna página falla, no se cancela toda la instalación
      Promise.all(PRECACHE.map((url) => cache.add(new Request(url, { cache: 'reload' })).catch(() => null)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k.startsWith('gatilin-') && !k.endsWith(VERSION)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

const redPrimero = async (request, cacheName, fallbackUrl) => {
  const cache = await caches.open(cacheName);
  try {
    const resp = await fetch(request);
    if (resp && resp.ok) cache.put(request, resp.clone());
    return resp;
  } catch {
    const enCache = await cache.match(request, { ignoreVary: true });
    if (enCache) return enCache;
    if (fallbackUrl) return (await caches.match(fallbackUrl)) || Response.error();
    return Response.error();
  }
};

const cachePrimero = async (request) => {
  const cache = await caches.open(CACHE_ESTATICOS);
  const enCache = await cache.match(request);
  if (enCache) return enCache;
  const resp = await fetch(request);
  if (resp && resp.ok) cache.put(request, resp.clone());
  return resp;
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Nunca cachear el panel ni datos privados
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/localizador') || request.headers.get('Authorization')) return;

  // Navegación (páginas HTML)
  if (request.mode === 'navigate') {
    event.respondWith(redPrimero(request, CACHE_PAGINAS, '/offline.html'));
    return;
  }

  // Archivos estáticos con hash del build e imágenes propias
  if (url.origin === self.location.origin && (url.pathname.startsWith('/_next/static/') || /\.(png|svg|webp|jpg|woff2?)$/.test(url.pathname))) {
    event.respondWith(cachePrimero(request));
    return;
  }

  // Datos públicos de la API (puede estar en otro dominio)
  if (API_CACHEABLE.test(url.pathname + url.search)) {
    event.respondWith(redPrimero(request, CACHE_DATOS));
  }
});

// ---------------- Notificaciones push ----------------
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'Gatilín Digital', body: event.data ? event.data.text() : '' };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Gatilín Digital', {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-maskable-192.png',
      tag: data.tag,
      renotify: Boolean(data.tag),
      data: { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const destino = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((ventanas) => {
      for (const v of ventanas) {
        if ('focus' in v) {
          v.navigate(destino);
          return v.focus();
        }
      }
      return self.clients.openWindow(destino);
    })
  );
});
