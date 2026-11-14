/* ============================================================
   QIIORA — Menghubungkan layar muat ke peristiwa pemuatan NYATA
   (bukan timer palsu): three.min.js, OrbitControls, DOM siap,
   skema beranda, latar berornamen, latar hidup, paint pertama.

   Perbaikan: dulu layar muat selesai 1,1 dtk setelah DOM siap,
   padahal skema beranda & latar belum tampil — itu sebabnya
   "keburu masuk ke halaman utama" walau belum dirender.
   ============================================================ */
(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};
  if(!window.QIIORA.muat) return;

  var skrip = {
    three: false, orbit: false, dom: false, font: false,
    skema: false, ornamen: false, latar: false, beban: false, lukis: false
  };
  var sudahSelesai = false;
  var ditahan = false;   // true selama gerbang masih terbuka

  /* Status "aktif" TIDAK boleh dikunci saat skrip dimuat: layar muat
     baru berjalan setelah gerbang ditutup. Jadi tanya setiap kali. */
  function sedangMuat(){
    return !!(window.QIIORA.muat && window.QIIORA.muat.aktif());
  }

  function kirimLangkah(v){
    if(!sedangMuat()){ ditahan = true; return; }
    ditahan = false;
    window.QIIORA.muat.langkah(v);
  }

  /* bobot: jumlah bobot inilah yang menentukan progres akhir */
  function totalTercapai(){
    var t = 0;
    if(skrip.three)   t += 24;
    if(skrip.orbit)   t += 8;
    if(skrip.dom)     t += 20;
    if(skrip.font)    t += 6;
    if(skrip.skema)   t += 20;
    if(skrip.ornamen) t += 8;
    if(skrip.latar)   t += 6;
    if(skrip.lukis)   t += 4;
    if(skrip.beban)   t += 4;
    return t;   // maksimum 100
  }

  function nilai(kunci){
    if(skrip[kunci]) return;
    skrip[kunci] = true;
    kirimLangkah(8 + totalTercapai() * 0.88);
    cekSelesai();
  }

  function intiSiap(){
    return skrip.three && skrip.orbit && skrip.dom && skrip.skema && skrip.latar;
  }

  function cekSelesai(){
    if(sudahSelesai || !sedangMuat() || !intiSiap()) return;
    sudahSelesai = true;
    /* Dulu memakai requestAnimationFrame untuk "beri 2 frame".
       rAF BERHENTI TOTAL saat tab di latar belakang (document.hidden),
       sehingga layar muat menggantung 0%->"Menyiapkan" SELAMANYA dan
       progres di bawah tidak pernah jalan. Itu sebabnya pengguna
       melihat navbar muncul di atas layar muat: layar muat tak pernah
       selesai.
       OBAT: pakai setTimeout, yang tetap berjalan di tab latar. */
    setTimeout(function(){
      window.QIIORA.muat.langkah(97);
      window.QIIORA.muat.selesai();
    }, 120);
  }

  /* ---------- pantau skrip pihak lain ---------- */
  function pantau(kunci, uji, maks){
    var n = 0;
    var t = setInterval(function(){
      n++;
      if(uji()){ clearInterval(t); nilai(kunci); }
      else if(n > (maks || 60)){ clearInterval(t); nilai(kunci); }  // gagal muat -> tetap maju
    }, 50);
    return t;
  }

  pantau('three', function(){ return typeof THREE !== 'undefined'; });
  pantau('orbit', function(){ return typeof THREE !== 'undefined' && !!THREE.OrbitControls; });

  /* ---------- DOM + router + modul penggambar ---------- */
  document.addEventListener('DOMContentLoaded', function(){
    // router mulai di nav.js pada DOMContentLoaded; beri satu frame
    requestAnimationFrame(function(){
      nilai('dom');
      tanyaPenggambar();
    });
  });

  /* skema.js & ornamen.js menggambar setelah DOM siap. Kita tanya
     langsung ke API-nya, bukan menebak lewat timer panjang. */
  function tanyaPenggambar(){
    var coba = 0;
    var t = setInterval(function(){
      coba++;
      // skema: ada grup proses di DOM
      if(!skrip.skema && document.querySelector('[data-skema] .skema-proses, [data-skema] svg')){
        nilai('skema');
      }
      // ornamen: kanvas latar sudah terpasang
      if(!skrip.ornamen && document.querySelector('[data-ornamen] .ornamen-kanvas')){
        nilai('ornamen');
      }
      // latar hidup global (dipasang latar-hidup.js)
      if(!skrip.latar && document.querySelector('.latar-hidup-kanvas')){
        nilai('latar');
      }
      if((skrip.skema && skrip.ornamen && skrip.latar) || coba > 70){
        clearInterval(t);
        nilai('skema'); nilai('ornamen'); nilai('latar');
      }
    }, 60);
  }

  /* ---------- font ---------- */
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(function(){ nilai('font'); }).catch(function(){ nilai('font'); });
  } else {
    nilai('font');
  }

  /* ---------- paint pertama benar-benar terjadi ---------- */
  window.addEventListener('load', function(){
    nilai('beban');
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ nilai('lukis'); });
    });
  });

  /* ---------- saat layar muat BENAR-BENAR mulai ----------
     Semua penanda yang sudah tercapai dikirim ulang supaya progres
     tidak mengunci di 8% ketika gerbang ditutup.                */
  var penjaga = null;
  document.addEventListener('qiiora:muat-mulai', function(){
    kirimLangkah(8 + totalTercapai() * 0.88);
    cekSelesai();

    // jaring pengaman DIHITUNG DARI SAAT INI, bukan dari muat skrip
    clearTimeout(penjaga);
    penjaga = setTimeout(function(){
      if(!sudahSelesai && sedangMuat()){
        sudahSelesai = true;
        window.QIIORA.muat.langkah(100);
        window.QIIORA.muat.selesai();
      }
    }, 9000);
  });

  document.addEventListener('qiiora:muat-selesai', function(){
    clearTimeout(penjaga);
  });
})();