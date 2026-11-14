/* ============================================================
   QIIORA — Service Worker (agar web bisa dipasang jadi aplikasi)

   PERBAIKAN PENTING:
   Versi sebelumnya memakai CACHE-FIRST untuk semua aset statis
   (CSS/JS). Akibatnya, setiap kali berkas diperbarui di disk,
   browser TETAP menyajikan salinan lama dari cache — selamanya.
   Itulah sebabnya perbaikan tampilan tidak pernah terlihat.

   Sekarang NETWORK-FIRST untuk semua berkas lokal:
   - Online  -> selalu berkas terbaru dari server.
   - Offline -> baru pakai cache (aplikasi tetap jalan).
   ============================================================ */
'use strict';

var VERSI = 'qiiora-v3-2026-11-14';
var INTI = [
  './',
  './index.html',
  './manifest.webmanifest'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(VERSI).then(function(c){
      return Promise.all(INTI.map(function(u){
        return c.add(u).catch(function(){ /* lewati yang gagal */ });
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if(k !== VERSI) return caches.delete(k);
        return null;
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;

  var url = new URL(req.url);
  if(url.origin !== self.location.origin) return;

  /* NETWORK-FIRST untuk SEMUA berkas lokal. Saat online, berkas yang
     baru disunting selalu terpakai. Cache hanya saat jaringan gagal. */
  e.respondWith(
    fetch(req).then(function(res){
      if(res && res.status === 200 && res.type === 'basic'){
        var salinan = res.clone();
        caches.open(VERSI).then(function(c){ c.put(req, salinan); });
      }
      return res;
    }).catch(function(){
      return caches.match(req).then(function(r){
        return r || caches.match('./index.html');
      });
    })
  );
});

self.addEventListener('message', function(e){
  if(e.data === 'perbarui-cache'){
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.skipWaiting(); });
  }
});
