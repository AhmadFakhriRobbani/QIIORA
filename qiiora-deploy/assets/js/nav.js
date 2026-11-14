/* ============================================================
   QIIORA — Cangkang: drawer HP, panel "Lainnya", bottom-nav,
   bayangan header saat scroll, tombol footer (tema, ukuran, ke atas).
   ============================================================ */
(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};
  var body = document.body;

  function q(s, c){ return (c || document).querySelector(s); }
  function qa(s, c){ return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  function bukaDrawer(buka){
    body.classList.toggle('nav-open', buka);
    qa('[data-nav-toggle]').forEach(function(b){ b.setAttribute('aria-expanded', String(buka)); });
    if(buka){
      var pertama = q('.drawer-body a');
      if(pertama) pertama.focus({ preventScroll: true });
    }
  }

  function tutupPanel(){
    var panel = q('[data-nav-panel]');
    var tombol = q('[data-nav-more]');
    if(panel) panel.hidden = true;
    if(tombol) tombol.setAttribute('aria-expanded', 'false');
  }

  document.addEventListener('DOMContentLoaded', function(){
    /* ---------- Drawer / toggle HP ---------- */
    qa('[data-nav-toggle]').forEach(function(b){
      b.addEventListener('click', function(){
        bukaDrawer(!body.classList.contains('nav-open'));
      });
    });
    var scrim = q('[data-drawer-scrim]');
    if(scrim) scrim.addEventListener('click', function(){ bukaDrawer(false); });
    var tutup = q('[data-drawer-close]');
    if(tutup) tutup.addEventListener('click', function(){ bukaDrawer(false); });

    /* ---------- Tutup drawer saat tautan navigasi diklik ---------- */
    qa('.drawer-body a, .bottom-nav a').forEach(function(a){
      a.addEventListener('click', function(){ bukaDrawer(false); });
    });

    /* ---------- Panel "Lainnya" ---------- */
    var moreBtn = q('[data-nav-more]');
    var panel = q('[data-nav-panel]');
    if(moreBtn && panel){
      moreBtn.addEventListener('click', function(e){
        e.stopPropagation();
        var akanBuka = panel.hidden;
        panel.hidden = !akanBuka;
        moreBtn.setAttribute('aria-expanded', String(akanBuka));
      });
      panel.addEventListener('click', function(e){
        if(e.target.closest('a')) tutupPanel();
      });
    }

    /* ---------- Klik luar menutup panel ---------- */
    document.addEventListener('click', function(e){
      if(panel && !panel.hidden && !panel.contains(e.target) && !(moreBtn && moreBtn.contains(e.target))){
        tutupPanel();
      }
    });

    /* ---------- Esc ---------- */
    document.addEventListener('keydown', function(e){
      if(e.key !== 'Escape') return;
      if(panel && !panel.hidden){ tutupPanel(); if(moreBtn) moreBtn.focus(); return; }
      if(body.classList.contains('nav-open')){
        bukaDrawer(false);
        var t = q('[data-nav-toggle]');
        if(t) t.focus();
      }
    });

    /* ---------- Bayangan header saat scroll ---------- */
    var head = q('.site-head');
    if(head){
      var geser = function(){
        head.classList.toggle('is-scrolled', window.scrollY > 8);
      };
      window.addEventListener('scroll', geser, { passive: true });
      geser();
    }

    /* ---------- Tombol footer: tema ---------- */
    var temaBtn = q('[data-tema-toggle]');
    if(temaBtn && QIIORA.tema){
      var segarkanTema = function(){
        var aktif = QIIORA.tema.efektif();
        temaBtn.setAttribute('aria-pressed', String(aktif === 'gelap'));
        var lab = temaBtn.querySelector('[data-tema-label]');
        if(lab) lab.textContent = aktif === 'gelap' ? 'Mode terang' : 'Mode gelap';
      };
      segarkanTema();
      temaBtn.addEventListener('click', function(){ QIIORA.tema.putar(); segarkanTema(); });
      document.addEventListener('qiiora:tema', segarkanTema);
    }

    /* ---------- Tombol footer: ukuran teks ---------- */
    var ukuranBtn = q('[data-ukuran-toggle]');
    if(ukuranBtn && QIIORA.tema){
      var segarkanUkuran = function(){
        var u = QIIORA.tema.ukuran();
        var lab = ukuranBtn.querySelector('[data-ukuran-label]');
        if(lab) lab.textContent = 'Teks ' + u.toUpperCase();
        ukuranBtn.setAttribute('aria-label', 'Ukuran teks: ' + u.toUpperCase() + '. Klik untuk mengganti.');
      };
      segarkanUkuran();
      ukuranBtn.addEventListener('click', function(){ QIIORA.tema.putarUkuran(); segarkanUkuran(); });
      document.addEventListener('qiiora:ukuran', segarkanUkuran);
    }

    /* ---------- Kembali ke atas ---------- */
    var keAtas = q('[data-to-top]');
    if(keAtas) keAtas.addEventListener('click', function(){
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* ---------- Status koneksi ---------- */
    var status = q('[data-koneksi]');
    if(status){
      var cekStatus = function(){
        var on = navigator.onLine !== false;
        status.classList.toggle('offline', !on);
        status.innerHTML = '<i aria-hidden="true"></i>' + (on ? 'Tersambung' : 'Mode luring — data tetap tersimpan di perangkat');
      };
      cekStatus();
      window.addEventListener('online', cekStatus);
      window.addEventListener('offline', cekStatus);
    }

    /* ---------- Chip profil (dari sesi masuk) ---------- */
    var profil = q('[data-profil]');
    if(profil){
      var sesi = null;
      try{ sesi = QIIORA.simpan ? QIIORA.simpan.ambil('sesi-masuk', null) : null; }catch(e){}
      var tampilkanProfil = function(){
        if(!sesi || !sesi.nama){ profil.hidden = true; return; }
        var nama = String(sesi.nama).trim();
        var awal = nama.split(/\s+/).slice(0, 2).map(function(w){ return w.charAt(0).toUpperCase(); }).join('');
        var inisial = q('[data-profil-inisial]', profil);
        var nm = q('[data-profil-nama]', profil);
        var kl = q('[data-profil-kelas]', profil);
        if(inisial) inisial.textContent = awal || 'Q';
        if(nm) nm.textContent = nama.split(/\s+/)[0];
        /* Label chip HARUS "Identitas Penyusun" — bukan "Profil".
           User protes chip-nya berubah jadi "profil siswa".
           Chip ini pintu ke halaman penyusun + menu keluar. */
        if(kl) kl.textContent = 'Identitas Penyusun';
        profil.hidden = false;
        profil.setAttribute('title', nama + ' — buka menu akun');
        profil.setAttribute('aria-label', 'Menu akun ' + nama);
      };
      tampilkanProfil();
      document.addEventListener('qiiora:sesi', function(e){ sesi = e.detail; tampilkanProfil(); });
    }

    /* ---------- Versi ---------- */
    qa('[data-versi]').forEach(function(el){
      el.textContent = 'v' + ((QIIORA.CONFIG && QIIORA.CONFIG.VERSI) || '1.1.0');
    });

    /* ---------- Mulai router (cangkang SPA) ---------- */
    if(QIIORA.router) QIIORA.router.mulai();
  });
})();
