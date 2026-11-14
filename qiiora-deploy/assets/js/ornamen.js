/* ============================================================
   QIIORA — Latar berornamen beranda (§9.3)
   Langit berlapis (gradien + cahaya matahari), awan parallax,
   partikel halus. Kanvas 2D (bukan WebGL) supaya ringan.
   Tunduk pada Aturan C (kontras rendah, gerak lambat, tidak menutupi
   simulasi), berhenti saat tab tersembunyi, mati pada
   prefers-reduced-motion. Kualitas: Rendah / Sedang / Tinggi / Otomatis.
   ============================================================ */
(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};

  var KUNCI = 'kualitas-grafis';
  var kanvas = null, ctx = null, wadah = null;
  var dpr = 1, lebar = 0, tinggi = 0;
  var awan = [], partikel = [], retak = null;
  var jalan = false, raf = null, terakhir = 0, frameTercatat = 0;
  var kurangiGerak = false;
  var kualitas = 'sedang';

  var PRESET = {
    rendah:  { awan: 3,  partikel: 14, dprMaks: 1,   fps: 30 },
    sedang:  { awan: 5,  partikel: 30, dprMaks: 1.5, fps: 45 },
    tinggi:  { awan: 8,  partikel: 56, dprMaks: 2,   fps: 60 }
  };

  function deteksiOtomatis(){
    var inti = navigator.hardwareConcurrency || 4;
    var mem = navigator.deviceMemory || 4;
    var sempit = window.matchMedia('(max-width: 640px)').matches;
    if(sempit || inti <= 4) return 'rendah';
    if(inti >= 8 && mem >= 8) return 'tinggi';
    return 'sedang';
  }

  function bacaKualitas(){
    var v = null;
    try{ v = QIIORA.simpan ? QIIORA.simpan.ambil(KUNCI, null) : null; }catch(e){}
    if(v === 'rendah' || v === 'sedang' || v === 'tinggi') return v;
    if(v === 'otomatis') return deteksiOtomatis();
    return null;   // belum pernah dipilih
  }

  function presetAktif(){
    return PRESET[kualitas] || PRESET.sedang;
  }

  function buatAwan(n){
    awan = [];
    for(var i = 0; i < n; i++){
      awan.push({
        x: Math.random(),
        y: .06 + Math.random() * .46,
        r: 42 + Math.random() * 78,
        v: .0035 + Math.random() * .0075,     // sangat lambat: 1 layar ≈ 2–5 menit
        alpha: .16 + Math.random() * .2,
        lapis: i % 3
      });
    }
  }

  function buatPartikel(n){
    partikel = [];
    for(var i = 0; i < n; i++){
      partikel.push({
        x: Math.random(), y: Math.random(),
        r: .8 + Math.random() * 2.1,
        v: .002 + Math.random() * .006,
        goyang: Math.random() * 6.283,
        alpha: .12 + Math.random() * .3
      });
    }
  }

  function ukur(){
    if(!kanvas || !wadah) return;
    var r = wadah.getBoundingClientRect();
    lebar = Math.max(1, Math.round(r.width));
    tinggi = Math.max(1, Math.round(r.height));
    dpr = Math.min(window.devicePixelRatio || 1, presetAktif().dprMaks);
    kanvas.width = Math.round(lebar * dpr);
    kanvas.height = Math.round(tinggi * dpr);
    kanvas.style.width = lebar + 'px';
    kanvas.style.height = tinggi + 'px';
    if(ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function gambarAwan(a, t){
    var x = (a.x + t * a.v) % 1.2 - .1;
    var px = x * lebar;
    var py = a.y * tinggi;
    var r = a.r * (0.7 + a.lapis * 0.22);
    ctx.beginPath();
    ctx.globalAlpha = a.alpha;
    // awan = tiga lingkaran bertumpuk, bukan bentuk rumit
    ctx.arc(px, py, r, 0, 6.2832);
    ctx.arc(px + r * .78, py + r * .16, r * .72, 0, 6.2832);
    ctx.arc(px - r * .8, py + r * .2, r * .62, 0, 6.2832);
    ctx.fill();
  }

  function loopSekarang(ts){
    if(!jalan){ raf = null; return; }
    raf = requestAnimationFrame(loopSekarang);
    var p = presetAktif();
    var jedaIdeal = 1000 / p.fps;
    if(ts - terakhir < jedaIdeal - 1) return;
    var dt = Math.min(ts - terakhir, 120);
    terakhir = ts;
    frameTercatat++;
    var t = ts / 1000;

    ctx.clearRect(0, 0, lebar, tinggi);

    // awan: putih lembut, kontras rendah
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    for(var i = 0; i < awan.length; i++) gambarAwan(awan[i], t);

    // partikel: titik air melayang naik
    ctx.fillStyle = 'rgba(47,128,237,.55)';
    for(var j = 0; j < partikel.length; j++){
      var d = partikel[j];
      d.y -= d.v * dt * .06;
      if(d.y < -.03){ d.y = 1.03; d.x = Math.random(); }
      var px = d.x * lebar + Math.sin(t * .5 + d.goyang) * 8;
      ctx.globalAlpha = d.alpha;
      ctx.beginPath();
      ctx.arc(px, d.y * tinggi, d.r, 0, 6.2832);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function mulai(){
    if(!kanvas || kurangiGerak) return;
    if(jalan) return;
    jalan = true;
    terakhir = 0;
    if(!raf) raf = requestAnimationFrame(loopSekarang);
  }

  function henti(){
    jalan = false;
    if(raf){ cancelAnimationFrame(raf); raf = null; }
  }

  function terapkanKualitas(nama){
    // 'otomatis' diselesaikan ke salah satu preset nyata, jadi perilaku grafis
    // selalu jelas dan bisa diperiksa (bukan cabang tanpa efek)
    kualitas = (nama === 'rendah' || nama === 'sedang' || nama === 'tinggi') ? nama : deteksiOtomatis();
    var p = presetAktif();
    buatAwan(p.awan);
    buatPartikel(p.partikel);
    ukur();
    return kualitas;
  }

  function bangun(){
    wadah = document.querySelector('[data-ornamen]');
    if(!wadah) return false;

    var sudah = bacaKualitas();
    kualitas = sudah || deteksiOtomatis();

    kanvas = document.createElement('canvas');
    kanvas.className = 'ornamen-kanvas';
    kanvas.setAttribute('aria-hidden', 'true');
    wadah.appendChild(kanvas);

    // lapisan cahaya matahari (CSS, bukan kanvas)
    var cahaya = document.createElement('div');
    cahaya.className = 'ornamen-cahaya';
    cahaya.setAttribute('aria-hidden', 'true');
    wadah.appendChild(cahaya);

    // butir air jatuh (CSS, sedikit)
    var gerimis = document.createElement('div');
    gerimis.className = 'ornamen-gerimis';
    gerimis.setAttribute('aria-hidden', 'true');
    var isi = '';
    for(var i = 0; i < 10; i++){
      isi += '<i style="left:' + (6 + Math.random() * 88).toFixed(1) + '%;animation-delay:' + (Math.random() * 6).toFixed(2) + 's;animation-duration:' + (7 + Math.random() * 5).toFixed(1) + 's"></i>';
    }
    gerimis.innerHTML = isi;
    wadah.appendChild(gerimis);

    ctx = kanvas.getContext('2d');
    if(!ctx){
      wadah.removeChild(kanvas);
      kanvas = null;
      return false;
    }

    kurangiGerak = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    terapkanKualitas(kualitas);

    window.addEventListener('resize', function(){
      clearTimeout(retak);
      retak = setTimeout(ukur, 180);
    });

    document.addEventListener('visibilitychange', function(){
      if(document.hidden) henti(); else mulai();
    });

    // berhenti saat beranda tidak tampil
    document.addEventListener('qiiora:view', function(e){
      if(!e.detail) return;
      if(e.detail.nama === 'beranda'){ ukur(); mulai(); } else { henti(); }
    });

    var mqGerak = window.matchMedia('(prefers-reduced-motion: reduce)');
    if(mqGerak.addEventListener){
      mqGerak.addEventListener('change', function(ev){
        kurangiGerak = ev.matches;
        if(kurangiGerak) henti(); else mulai();
      });
    }

    if(!kurangiGerak) mulai();
    return true;
  }

  window.QIIORA.ornamen = {
    pasang: bangun,
    kualitas: function(){ return kualitas; },
    setKualitas: function(nama){
      terapkanKualitas(nama);
      var pref = (nama === 'rendah' || nama === 'sedang' || nama === 'tinggi' || nama === 'otomatis') ? nama : 'otomatis';
      try{ if(QIIORA.simpan) QIIORA.simpan.simpan(KUNCI, pref); }catch(e){}
      document.dispatchEvent(new CustomEvent('qiiora:kualitas', { detail: { kualitas: kualitas, pref: pref } }));
      return kualitas;
    },
    pref: function(){
      var v = null;
      try{ v = QIIORA.simpan ? QIIORA.simpan.ambil(KUNCI, null) : null; }catch(e){}
      return (v === 'rendah' || v === 'sedang' || v === 'tinggi' || v === 'otomatis') ? v : 'otomatis';
    },
    otomatis: deteksiOtomatis,
    preset: PRESET,
    // diagnostik: jumlah objek & DPR yang benar-benar dipakai
    statistik: function(){
      return { kualitas: kualitas, awan: awan.length, partikel: partikel.length, dpr: dpr,
               dprPerangkat: window.devicePixelRatio || 1, dprMaks: presetAktif().dprMaks,
               jalan: jalan, frame: frameTercatat };
    }
  };
})();