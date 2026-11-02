// Grotadas V8 - atualizacao 2026-11-02: navegacao network-first.
const CACHE = 'grotadas-v8-relatorios-network-first-20261102';
const SHELL = ['./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys=await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('grotadas-v8-') && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url=new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith('/grotadas-vendas/')) return;
  if (event.request.mode === 'navigate') {
    event.respondWith((async()=>{
      try {
        const response=await fetch(event.request, {cache:'no-store'});
        if(response.ok){const cache=await caches.open(CACHE);await cache.put('./index.html',response.clone());}
        return response;
      }catch(err){return (await caches.match('./index.html')) || Response.error();}
    })());
    return;
  }
  event.respondWith((async()=>{
    const cached=await caches.match(event.request);
    if(cached)return cached;
    try {const r=await fetch(event.request);if(r.ok){const c=await caches.open(CACHE);await c.put(event.request,r.clone());}return r;}
    catch(e){return Response.error();}
  })());
});
