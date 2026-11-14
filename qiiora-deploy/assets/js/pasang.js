/* ============================================================
   QIIORA — Pasang sebagai aplikasi (PWA)

   Tombol "Pasang Aplikasi" di footer memanggil ini. Peramban
   modern (Chrome/Edge/Android) memunculkan dialog pasang sendiri
   lewat event `beforeinstallprompt`. Bila peramban tidak
   mendukung (Firefox, Safari lama), tampilkan petunjuk manual.

   Tidak perlu Flutter/EXE: web dipasang sebagai aplikasi (PWA).
   Di Android hasilnya ikon di layar utama + jalan tanpa alamat
   bar; di Windows jadi pintasan aplikasi.
   ============================================================ */
(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};

  var promptTertunda = null;
  var sudahTerpasang = false;

  function q(s){ return document.querySelector(s); }

  /* ---------- deteksi sudah terpasang ---------- */
  function cekTerpasang(){
    if(window.matchMedia('(display-mode: standalone)').matches) return true;
    if(window.navigator.standalone === true) return true;
    return false;
  }

  /* ---------- tangkap event pasang ---------- */
  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault();
    promptTertunda = e;
    perbaruiTombol(true);
  });

  window.addEventListener('appinstalled', function(){
    sudahTerpasang = true;
    promptTertunda = null;
    perbaruiTombol(false);
    beriTahu('QIIORA sudah terpasang di perangkat ini.');
  });

  /* ---------- label tombol ---------- */
  function perbaruiTombol(bisaPasang){
    var btn = q('[data-pasang-apk]');
    if(!btn) return;
    var teks = btn.querySelector('span');
    if(cekTerpasang() || sudahTerpasang){
      if(teks) teks.textContent = 'Sudah terpasang';
      btn.setAttribute('aria-label', 'QIIORA sudah terpasang');
      btn.classList.add('sudah-pasang');
      btn.disabled = true;
    } else if(bisaPasang){
      if(teks) teks.textContent = 'Pasang Aplikasi';
      btn.disabled = false;
      btn.classList.remove('sudah-pasang');
    }
  }

  /* ---------- pesan kecil di footer ---------- */
  var jamPesan = null;
  function beriTahu(teks){
    var el = q('[data-pasang-pesan]');
    if(!el){
      el = document.createElement('p');
      el.className = 'pasang-pesan';
      el.setAttribute('data-pasang-pesan', '');
      el.setAttribute('role', 'status');
      var tools = q('.foot-tools');
      if(tools && tools.parentNode) tools.parentNode.appendChild(el);
      else return;
    }
    el.textContent = teks;
    el.classList.add('tampil');
    clearTimeout(jamPesan);
    jamPesan = setTimeout(function(){ el.classList.remove('tampil'); }, 4200);
  }

  /* ---------- petunjuk manual ---------- */
  function petunjukManual(){
    var w = window;
    var ua = navigator.userAgent;
    var android = /Android/i.test(ua);
    var ios = /iPhone|iPad|iPod/i.test(ua);
    var teks;

    if(android){
      teks = 'Di Chrome Android: buka menu ⋮ lalu pilih "Tambahkan ke layar Utama".';
    } else if(ios){
      teks = 'Di Safari: ketuk tombol Bagikan lalu pilih "Tambahkan ke Layar Utama".';
    } else {
      teks = 'Di Chrome atau Edge: klik ikon pasang di bilah alamat, atau menu ⋮ → "Pasang QIIORA".';
    }
    beriTahu(teks);
  }

  /* ---------- pemasangan ---------- */
  function pasang(){
    if(cekTerpasang() || sudahTerpasang){
      beriTahu('QIIORA sudah terpasang. Buka dari ikon di layar utama.');
      return;
    }
    if(!promptTertunda){
      petunjukManual();
      return;
    }
    promptTertunda.prompt();
    promptTertunda.userChoice.then(function(pilihan){
      if(pilihan && pilihan.outcome === 'accepted'){
        beriTahu('Sedang memasang QIIORA…');
      } else {
        beriTahu('Pemasangan dibatalkan. Kamu bisa mencoba lagi kapan saja.');
      }
      promptTertunda = null;
      perbaruiTombol(false);
    }).catch(function(){
      promptTertunda = null;
      petunjukManual();
    });
  }

  /* ---------- daftarkan service worker ---------- */
  function daftarSW(){
    if(!('serviceWorker' in navigator)) return;
    // file:// tidak mendukung service worker — lewati tanpa galat
    if(location.protocol === 'file:') return;

    navigator.serviceWorker.register('./sw.js').then(function(reg){
      // bila ada versi baru, ambil diam-diam
      reg.addEventListener('updatefound', function(){
        var baru = reg.installing;
        if(!baru) return;
        baru.addEventListener('statechange', function(){
          if(baru.state === 'installed' && navigator.serviceWorker.controller){
            beriTahu('Versi baru QIIORA tersedia. Muat ulang untuk memakainya.');
          }
        });
      });
    }).catch(function(){ /* diabaikan: situs tetap jalan */ });
  }

  /* ---------- mulai ---------- */
  function mulai(){
    var btn = q('[data-pasang-apk]');
    if(btn){
      // ganti handler lama (yang hanya alert) dengan pemasangan nyata
      var baru = btn.cloneNode(true);
      btn.parentNode.replaceChild(baru, btn);
      baru.addEventListener('click', function(e){
        e.preventDefault();
        pasang();
      });
      perbaruiTombol(!!promptTertunda);
    }

    // meta manifest & ikon, dipasang dari sini supaya index.html tetap rapi
    if(!q('link[rel="manifest"]')){
      var l = document.createElement('link');
      l.rel = 'manifest';
      l.href = 'manifest.webmanifest';
      document.head.appendChild(l);
    }
    if(!q('link[rel="apple-touch-icon"]')){
      var al = document.createElement('link');
      al.rel = 'apple-touch-icon';
      al.href = 'assets/ikon/apple-180.png';
      document.head.appendChild(al);
    }
    if(!q('meta[name="apple-mobile-web-app-capable"]')){
      var m = document.createElement('meta');
      m.name = 'apple-mobile-web-app-capable';
      m.content = 'yes';
      document.head.appendChild(m);
    }

    daftarSW();
  }

  window.QIIORA.pasang = {
    pasang: pasang,
    terpasang: cekTerpasang,
    siap: function(){ return !!promptTertunda; }
  };

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mulai);
  else mulai();
})();