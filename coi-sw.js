// Cross-origin isolation for static hosts that cannot set response headers. The engine needs
// SharedArrayBuffer, which needs COOP: same-origin + COEP: require-corp on every response.
// Hosts that already send them (see _headers) never reach this worker.
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function(e){
  var req = e.request;
  if (req.cache === 'only-if-cached' && req.mode !== 'same-origin') return;
  e.respondWith(fetch(req).then(function(r){
    if (r.status === 0) return r;
    var h = new Headers(r.headers);
    h.set('Cross-Origin-Opener-Policy', 'same-origin');
    h.set('Cross-Origin-Embedder-Policy', 'require-corp');
    h.set('Cross-Origin-Resource-Policy', 'cross-origin');
    // Status and body pass through unchanged, so Range (206) reads from StreamFS still work.
    return new Response(r.body, { status: r.status, statusText: r.statusText, headers: h });
  }));
});
