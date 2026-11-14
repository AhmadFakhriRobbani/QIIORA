/* ============================================================
   QIIORA — Tema (terang/gelap/otomatis) + ukuran teks.
   Dipanggil paling awal di <head> agar tidak berkedip.
   Preferensi disimpan lewat QIIORA.simpan (namespace qiiora:v2:).
   ============================================================ */
(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};
  var KEY = 'tema';
  var KEY_UKURAN = 'ukuran-teks';
  var akar = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function bacaan(){
    var v = null;
    try{
      var raw = localStorage.getItem(((window.QIIORA.CONFIG && QIIORA.CONFIG.NAMESPACE_STORAGE) || 'qiiora:v2:') + KEY);
      if(raw) v = JSON.parse(raw);
    }catch(e){}
    return (v === 'terang' || v === 'gelap' || v === 'otomatis') ? v : 'otomatis';
  }

  function efektif(p){
    if(p === 'otomatis') return (mq && mq.matches) ? 'gelap' : 'terang';
    return p;
  }

  function terapkan(p){
    akar.setAttribute('data-tema', efektif(p));
    akar.setAttribute('data-tema-pref', p);
    var meta = document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute('content', efektif(p) === 'gelap' ? '#0F1A24' : '#F4FAFF');
  }

  function set(p){
    var q = (p === 'terang' || p === 'gelap' || p === 'otomatis') ? p : 'otomatis';
    terapkan(q);
    if(window.QIIORA.simpan) QIIORA.simpan.simpan(KEY, q);
    else { try{ localStorage.setItem('qiiora:v2:' + KEY, JSON.stringify(q)); }catch(e){} }
    document.dispatchEvent(new CustomEvent('qiiora:tema', { detail: { pref: q, aktif: efektif(q) } }));
    return q;
  }

  // ukuran teks (S/M/L) — dipakai tombol footer
  function ukuranSekarang(){
    var v = 's';
    try{
      var raw = localStorage.getItem(((window.QIIORA.CONFIG && QIIORA.CONFIG.NAMESPACE_STORAGE) || 'qiiora:v2:') + KEY_UKURAN);
      if(raw) v = JSON.parse(raw);
    }catch(e){}
    return (v === 'm' || v === 'l') ? v : 's';
  }
  function setUkuran(u){
    var q = (u === 'm' || u === 'l') ? u : 's';
    akar.setAttribute('data-ukuran', q);
    if(window.QIIORA.simpan) QIIORA.simpan.simpan(KEY_UKURAN, q);
    else { try{ localStorage.setItem('qiiora:v2:' + KEY_UKURAN, JSON.stringify(q)); }catch(e){} }
    document.dispatchEvent(new CustomEvent('qiiora:ukuran', { detail: { ukuran: q } }));
    return q;
  }
  function putarUkuran(){
    var urut = ['s','m','l'];
    var i = urut.indexOf(ukuranSekarang());
    return setUkuran(urut[(i + 1) % urut.length]);
  }

  // terapkan segera (sebelum paint)
  var pref = bacaan();
  terapkan(pref);
  akar.setAttribute('data-ukuran', ukuranSekarang());

  if(mq && mq.addEventListener){
    mq.addEventListener('change', function(){
      if(bacaan() === 'otomatis') terapkan('otomatis');
    });
  }

  window.QIIORA.tema = {
    ambil: bacaan,
    efektif: function(){ return efektif(bacaan()); },
    set: set,
    putar: function(){ return set(efektif(bacaan()) === 'gelap' ? 'terang' : 'gelap'); },
    ukuran: ukuranSekarang,
    setUkuran: setUkuran,
    putarUkuran: putarUkuran
  };
})();