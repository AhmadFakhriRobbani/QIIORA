/* ============================================================
   QIIORA — Menu profil + LOGOUT (ditulis ulang)

   Keluhan user: chip profil hanya link ke halaman identitas,
   tidak ada opsi keluar sama sekali. Sekarang chip profil
   MEMBUKA MENU berisi:
     - nama & email yang sedang masuk
     - Identitas Penyusun
     - Lembar Pengumpulan
     - Keluar dari akun  <-- ini yang hilang sebelumnya

   Juga menangani panel "Lainnya" supaya tidak ketimbun.
   ============================================================ */
(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};
  if(window.QIIORA.__akunTerpasang) return;   // jangan dobel
  window.QIIORA.__akunTerpasang = true;

  var KUNCI_SESI = 'sesi-masuk';

  var SVG = {
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20c0-4 3.4-6.2 7.5-6.2s7.5 2.2 7.5 6.2"/></svg>',
    lembar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="M7 3h10v18H7z"/><path d="M10.5 8h3M10.5 12h3"/></svg>',
    keluar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>'
  };

  function q(s){ return document.querySelector(s); }
  function simpan(){ return window.QIIORA.simpan || null; }

  function sesi(){
    var s = simpan();
    return s ? s.ambil(KUNCI_SESI, null) : null;
  }

  function keluar(){
    var s = simpan();
    if(s){ s.hapus(KUNCI_SESI); s.hapus('identitas'); }
    try{ sessionStorage.clear(); }catch(e){}
    try{ location.replace(location.pathname); }catch(e){ location.reload(); }
  }

  /* ---------- bangun menu profil ---------- */
  function bangunMenu(){
    var chip = q('[data-profil]');
    if(!chip) return;

    var d = sesi();
    if(!d || !d.email){ chip.hidden = true; return; }
    chip.hidden = false;

    // buang menu lama
    var lama = document.querySelector('.menu-profil');
    if(lama) lama.remove();

    var menu = document.createElement('div');
    menu.className = 'menu-profil';
    menu.setAttribute('data-menu-profil', '');
    menu.hidden = true;
    menu.innerHTML =
        '<div class="mp-head"><b>' + esc(d.nama || 'Pengguna') + '</b><i>' + esc(d.email) + '</i></div>'
      + '<a class="mp-item" href="#/identitas" data-mp="identitas">' + SVG.user + ' Identitas Penyusun</a>'
      + '<a class="mp-item" href="kumpul.html" data-mp="lembar">' + SVG.lembar + ' Lembar Pengumpulan</a>'
      + '<button class="mp-item mp-item--keluar" type="button" data-mp="keluar">' + SVG.keluar + ' Keluar dari akun</button>'
      + '<p class="mp-note">Data belajar tersimpan di peramban ini.</p>';

    chip.parentNode.insertBefore(menu, chip.nextSibling);

    var tmblKeluar = menu.querySelector('[data-mp="keluar"]');
    tmblKeluar.__keluarTerpasang = true;   /* cegah listener dobel */
    tmblKeluar.addEventListener('click', function(e){
      e.preventDefault();
      keluar();
    });
    Array.prototype.forEach.call(menu.querySelectorAll('a'), function(a){
      a.addEventListener('click', function(){ menu.hidden = true; });
    });

    // klik chip = buka/tutup menu, BUKAN pindah halaman
    var baru = chip.cloneNode(true);
    baru.setAttribute('role', 'button');
    baru.setAttribute('aria-haspopup', 'true');
    baru.setAttribute('aria-expanded', 'false');
    baru.removeAttribute('href');
    chip.parentNode.replaceChild(baru, chip);
    baru.appendChild(menu);

    baru.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      var buka = menu.hidden;
      menu.hidden = !buka;
      baru.setAttribute('aria-expanded', String(buka));
    });

    document.addEventListener('click', function(e){
      if(!baru.contains(e.target)) menu.hidden = true;
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') menu.hidden = true;
    });
  }

  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ---------- panel "Lainnya" anti-ketimbun ---------- */
  function pasangNavPanel(){
    var btn = q('[data-nav-more]');
    var panel = q('[data-nav-panel]');
    if(!btn || !panel) return;

    function tutup(){
      panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-terbuka');
    }
    function buka(){
      panel.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      // angkat header supaya panel pasti di atas konten
      document.body.classList.add('nav-terbuka');
    }

    var baru = btn.cloneNode(true);
    btn.parentNode.replaceChild(baru, btn);
    baru.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      if(panel.hidden) buka(); else tutup();
    });

    Array.prototype.forEach.call(panel.querySelectorAll('a'), function(a){
      a.addEventListener('click', tutup);
    });
    document.addEventListener('click', function(e){
      if(!panel.contains(e.target) && !baru.contains(e.target)) tutup();
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') tutup();
    });
  }

  /* Tombol "Keluar" di navbar. Sebelumnya tidak ada listener sama
     sekali - tombol tampil tapi tidak berbuat apa-apa. */
  function pasangTombolNavbar(){
    var b = document.querySelector('[data-logout]');
    if(!b || b.__keluarNavbar) return;
    b.__keluarNavbar = true;
    b.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      keluar();
    });
  }

  /* tombol keluar di drawer HP (dan di mana pun ada [data-mp="keluar"]) */
  function pasangTombolKeluar(){
    Array.prototype.forEach.call(document.querySelectorAll('[data-mp="keluar"]'), function(b){
      if(b.__keluarTerpasang) return;
      b.__keluarTerpasang = true;
      b.addEventListener('click', function(e){
        e.preventDefault();
        keluar();
      });
    });
  }

  function mulai(){
    bangunMenu();
    pasangNavPanel();
    pasangTombolNavbar();
    pasangTombolKeluar();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mulai);
  else mulai();

  // bangun ulang setelah sesi berubah
  document.addEventListener('qiiora:sesi', function(){ setTimeout(mulai, 60); });

  window.QIIORA.akun = { keluar: keluar, bangunMenu: bangunMenu };
})();
