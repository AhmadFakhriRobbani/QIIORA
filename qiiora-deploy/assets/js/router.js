/* ============================================================
   QIIORA — Router hash untuk cangkang SPA.
   Rute: #/beranda, #/modul, #/modul/bab-3/butir-5, #/simulasi, ...
   Satu view tampil pada satu waktu; Back/Forward/refresh bekerja.
   ============================================================ */
(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};

  var DEFAULT = 'beranda';
  var views = [];
  var current = null;

  function daftarView(){
    views = Array.prototype.slice.call(document.querySelectorAll('[data-view]'));
  }

  function parse(hash){
    var raw = String(hash || '').replace(/^#\/?/, '');
    if(!raw) return { nama: DEFAULT, sisa: [] };
    var bagian = raw.split('/').filter(Boolean);
    return { nama: bagian[0] || DEFAULT, sisa: bagian.slice(1) };
  }

  function cari(nama){
    for(var i=0;i<views.length;i++){
      if(views[i].getAttribute('data-view') === nama) return views[i];
    }
    return null;
  }

  function tandaiNav(nama){
    var tautan = Array.prototype.slice.call(document.querySelectorAll('[data-nav-key]'));
    tautan.forEach(function(a){
      var kunci = a.getAttribute('data-nav-key');
      if(kunci === nama){
        a.setAttribute('aria-current', 'page');
      } else {
        a.removeAttribute('aria-current');
      }
    });
    // penanda bergerak (desktop) — hanya untuk tautan langsung di bilah nav,
    // bukan tautan di dalam panel "Lainnya"
    var ind = document.querySelector('[data-nav-ind]');
    var aktif = document.querySelector('.nav > a[aria-current="page"]');
    if(ind && aktif && aktif.offsetWidth > 0){
      ind.style.width = aktif.offsetWidth + 'px';
      ind.style.transform = 'translate(' + aktif.offsetLeft + 'px,-50%)';
      ind.classList.add('on');
    } else if(ind){
      ind.classList.remove('on');
    }

    // kalau halaman aktif ada di panel "Lainnya", tandai tombolnya
    var moreBtn = document.querySelector('[data-nav-more]');
    if(moreBtn){
      var isiPanel = document.querySelector('[data-nav-panel] [aria-current="page"]');
      moreBtn.classList.toggle('is-aktif', !!isiPanel);
    }
  }

  function tampilkan(nama, sisa, opts){
    var target = cari(nama);
    if(!target){
      target = cari(DEFAULT);
      nama = DEFAULT;
      sisa = [];
    }
    if(current === target && !(opts && opts.paksa)) return;

    views.forEach(function(v){
      var on = v === target;
      v.classList.toggle('is-active', on);
      if(on){ v.removeAttribute('hidden'); } else { v.setAttribute('hidden',''); }
    });
    current = target;

    var judul = target.getAttribute('data-title') || nama;
    var proyek = (window.QIIORA.CONFIG && QIIORA.CONFIG.NAMA_PROYEK) || 'QIIORA';
    document.title = judul + ' — ' + proyek;

    tandaiNav(nama);

    if(!(opts && opts.pertahankanScroll)){
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    // elemen .reveal di dalam view langsung tampil (tidak menunggu IntersectionObserver,
    // karena view yang tersembunyi tidak pernah "terlihat" oleh observer)
    var reveal = target.querySelectorAll('.reveal');
    Array.prototype.forEach.call(reveal, function(el){ el.classList.add('in'); });

    // beri tahu modul lain (simulasi perlu resize saat view tampil)
    try{
      document.dispatchEvent(new CustomEvent('qiiora:view', {
        detail: { nama: nama, sisa: sisa, el: target }
      }));
    }catch(e){}

    // fokus ke judul view untuk pembaca layar
    var h1 = target.querySelector('h1, h2');
    if(h1 && !(opts && opts.tanpaFokus)){
      if(!h1.hasAttribute('tabindex')) h1.setAttribute('tabindex','-1');
      try{ h1.focus({ preventScroll: true }); }catch(e){}
    }
  }

  function rute(opts){
    var p = parse(location.hash);
    tampilkan(p.nama, p.sisa, opts);
  }

  function pergi(ke, ganti){
    var tujuan = ke.charAt(0) === '#' ? ke : '#/' + String(ke).replace(/^\/+/, '');
    if(ganti && history.replaceState){
      history.replaceState(null, '', tujuan);
      rute({ paksa: true });
    } else if(location.hash === tujuan){
      rute({ paksa: true });
    } else {
      location.hash = tujuan;
    }
  }

  window.QIIORA.router = {
    mulai: function(){
      daftarView();
      if(!views.length) return;   // halaman biasa (tugas/kumpul/pengajar/bab) tanpa view SPA
      if(!location.hash || location.hash === '#'){
        if(history.replaceState) history.replaceState(null, '', '#/' + DEFAULT);
      }
      rute({ paksa: true, tanpaFokus: true });
      window.addEventListener('hashchange', function(){ rute(); });
      // tautan internal yang memakai data-rute
      document.addEventListener('click', function(e){
        var a = e.target.closest ? e.target.closest('[data-rute]') : null;
        if(!a) return;
        e.preventDefault();
        pergi(a.getAttribute('data-rute'));
      });
      // tautan "lewati ke konten" tidak boleh mengubah hash router
      var skip = document.querySelector('[data-skip]');
      if(skip) skip.addEventListener('click', function(e){
        e.preventDefault();
        var main = document.getElementById('main');
        if(main){
          if(!main.hasAttribute('tabindex')) main.setAttribute('tabindex','-1');
          main.focus({ preventScroll: true });
          main.scrollIntoView({ block: 'start' });
        }
      });
    },
    pergi: pergi,
    ruteSekarang: function(){ return parse(location.hash); },
    segarkan: function(){ daftarView(); rute({ paksa: true, pertahankanScroll: true, tanpaFokus: true }); }
  };
})();
