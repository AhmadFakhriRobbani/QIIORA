/* ============================================================
   QIIORA — Layar muat sinematik (K3, versi 2)

   Acuan efek: referensi/07-vid-efek-loading-7dtk.mp4
   Yang ditiru HANYA efeknya: kamera mulai dari CLOSE-UP pondok di
   tepi danau lalu MENARIK MUNDUR mengungkap pulau QIIORA penuh,
   langit gelap berubah menjadi pagi. Seluruh gambar SVG orisinal.

   Perbaikan penting dibanding versi 1:
   - adegan MENGISI SELURUH LAYAR (bukan kartu 640px) sehingga tidak
     ada ruang kosong besar.
   - durasi minimum 4,6 dtk supaya zoom-out tidak terpotong sebelum
     selesai; progres tetap mengikuti kesiapan NYATA dari muat-boot.js.

   Kontrak API tetap (dipakai muat-boot.js):
     QIIORA.muat.mulai / langkah / selesai / aktif / siap
   Tambahan: mulaiPaksa (dipakai gerbang login) dan tahan()
   ============================================================ */
(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};

  var KUNCI = 'muat-selesai-sesi';
  var NS = 'qiiora:v2:';

  var overlay = null, teksEl = null, persenEl = null, barEl = null;
  var grupZoom = null, langitGelap = null, judulEl = null, langkahEl = null;
  var progres = 0, targetProgres = 0, selesai = false, siapkan = false;
  var waktuMulai = 0, rafZoom = null, ditahan = false;

  var MIN_MS = 4600;      // zoom-out 3,8 dtk + huruf muncul + jeda
  var ZOOM_MS = 3800;

  var pesan = [
    { p: 0,   t: 'Menyiapkan panggung siklus air…' },
    { p: 14,  t: 'Menanam pohon di pulau QIIORA…' },
    { p: 32,  t: 'Mengisi danau, sungai, dan laut…' },
    { p: 50,  t: 'Menghangatkan Matahari…' },
    { p: 66,  t: 'Mengumpulkan awan hujan…' },
    { p: 82,  t: 'Menata skema 12 proses…' },
    { p: 94,  t: 'Menyusun huruf QIIORA…' }
  ];

  var tahapLabel = ['Pulau', 'Air', 'Surya', 'Awan', 'Skema', 'Siap'];

  function teksUntuk(p){
    var t = pesan[0].t;
    for(var i = 0; i < pesan.length; i++){ if(p >= pesan[i].p) t = pesan[i].t; }
    return t;
  }

  /* ---------- Adegan SVG orisinal (viewBox 1600x900) ----------
     Titik fokus zoom = pondok (700,644). Semua bentuk digambar sendiri. */
  function adeganSVG(){
    return ''
    + '<svg class="muat-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">'
    + '<defs>'
    +   '<linearGradient id="qLangit" x1="0" y1="0" x2="0" y2="1">'
    +     '<stop offset="0" stop-color="#7EC3E8"/><stop offset="42%" stop-color="#B9E2F4"/>'
    +     '<stop offset="72%" stop-color="#E4F3F8"/><stop offset="100%" stop-color="#F8ECCB"/>'
    +   '</linearGradient>'
    +   '<radialGradient id="qSurya" cx="50%" cy="46%" r="52%">'
    +     '<stop offset="0" stop-color="#FFFDF0"/><stop offset="36%" stop-color="#FFE79B"/>'
    +     '<stop offset="72%" stop-color="#FFC24A"/><stop offset="100%" stop-color="#F59B18"/>'
    +   '</radialGradient>'
    +   '<linearGradient id="qAir" x1="0" y1="0" x2="0" y2="1">'
    +     '<stop offset="0" stop-color="#8FE0EE"/><stop offset="48%" stop-color="#35A8CC"/>'
    +     '<stop offset="100%" stop-color="#0E6591"/>'
    +   '</linearGradient>'
    +   '<linearGradient id="qGunungA" x1="0" y1="0" x2="0" y2="1">'
    +     '<stop offset="0" stop-color="#A9BECB"/><stop offset="100%" stop-color="#4A6275"/>'
    +   '</linearGradient>'
    +   '<linearGradient id="qGunungB" x1="0" y1="0" x2="0" y2="1">'
    +     '<stop offset="0" stop-color="#8AA3B4"/><stop offset="100%" stop-color="#35505F"/>'
    +   '</linearGradient>'
    +   '<linearGradient id="qBukit" x1="0" y1="0" x2="0" y2="1">'
    +     '<stop offset="0" stop-color="#8AD08F"/><stop offset="100%" stop-color="#3E9160"/>'
    +   '</linearGradient>'
    +   '<linearGradient id="qRumput" x1="0" y1="0" x2="0" y2="1">'
    +     '<stop offset="0" stop-color="#71C17C"/><stop offset="100%" stop-color="#2C7A4C"/>'
    +   '</linearGradient>'
    +   '<linearGradient id="qAtap" x1="0" y1="0" x2="0" y2="1">'
    +     '<stop offset="0" stop-color="#B98CF0"/><stop offset="100%" stop-color="#5B37A8"/>'
    +   '</linearGradient>'
    + '</defs>'

    + '<rect id="qSky" x="0" y="0" width="1600" height="900" fill="url(#qLangit)"/>'
    + '<g id="qPulau">'

    /* matahari + sinar berputar */
    +   '<g id="qSuryaG" transform="translate(1268,148)">'
    +     '<g class="muat-sinar" opacity=".6">'
    +       '<path d="M0 -108 L15 -152 L-15 -152 Z" fill="#FFE7A6"/>'
    +       '<path d="M0 108 L15 152 L-15 152 Z" fill="#FFE7A6"/>'
    +       '<path d="M-108 0 L-152 15 L-152 -15 Z" fill="#FFE7A6"/>'
    +       '<path d="M108 0 L152 15 L152 -15 Z" fill="#FFE7A6"/>'
    +       '<path d="M-78 -78 L-114 -100 L-98 -116 Z" fill="#FFEFC4"/>'
    +       '<path d="M78 78 L114 100 L98 116 Z" fill="#FFEFC4"/>'
    +       '<path d="M78 -78 L112 -96 L98 -112 Z" fill="#FFEFC4"/>'
    +       '<path d="M-78 78 L-112 96 L-98 112 Z" fill="#FFEFC4"/>'
    +     '</g>'
    +     '<circle r="104" fill="#FFD166" opacity=".12"/>'
    +     '<circle r="76" fill="#FFE08A" opacity=".2"/>'
    +     '<circle r="52" fill="url(#qSurya)"/>'
    +     '<circle r="52" fill="none" stroke="#FFF3C4" stroke-width="2.4" opacity=".6"/>'
    +   '</g>'

    /* awan terang */
    +   '<g class="muat-awan muat-awan1" opacity=".95">'
    +     '<ellipse cx="250" cy="146" rx="86" ry="42" fill="#F7FCFF"/>'
    +     '<ellipse cx="312" cy="132" rx="60" ry="50" fill="#FFFFFF"/>'
    +     '<ellipse cx="194" cy="156" rx="56" ry="34" fill="#E9F4FB"/>'
    +   '</g>'
    +   '<g class="muat-awan muat-awan2" opacity=".82">'
    +     '<ellipse cx="700" cy="96" rx="70" ry="32" fill="#F7FCFF"/>'
    +     '<ellipse cx="752" cy="86" rx="48" ry="40" fill="#FFFFFF"/>'
    +     '<ellipse cx="652" cy="102" rx="40" ry="24" fill="#E9F4FB"/>'
    +   '</g>'
    +   '<g class="muat-awan muat-awan3" opacity=".6">'
    +     '<ellipse cx="1010" cy="168" rx="56" ry="26" fill="#F2F9FD"/>'
    +     '<ellipse cx="1048" cy="160" rx="38" ry="32" fill="#FFFFFF"/>'
    +   '</g>'

    /* awan mendung + gerimis (matahari tetap menerobos tipis) */
    +   '<g class="muat-awan muat-awan4" opacity=".92">'
    +     '<g transform="translate(470,238)">'
    +       '<ellipse cx="0" cy="0" rx="96" ry="46" fill="#9FB6C6"/>'
    +       '<ellipse cx="64" cy="-14" rx="64" ry="42" fill="#B4C8D6"/>'
    +       '<ellipse cx="-72" cy="-6" rx="58" ry="36" fill="#8CA6B8"/>'
    +       '<ellipse cx="20" cy="-34" rx="52" ry="34" fill="#C6D7E2"/>'
    +     '</g>'
    +   '</g>'
    +   '<g class="muat-gerimis" stroke="#8FD8F0" stroke-width="3.4" stroke-linecap="round" opacity=".62">'
    +     '<g transform="translate(400,296)">'
    +       '<path class="gt" d="M0 0v20"/><path class="gt" d="M34 6v22"/><path class="gt" d="M68 0v20"/>'
    +       '<path class="gt" d="M102 8v20"/><path class="gt" d="M136 2v18"/><path class="gt" d="M170 8v22"/>'
    +     '</g>'
    +     '<g transform="translate(412,346)">'
    +       '<path class="gt" d="M0 0v16"/><path class="gt" d="M40 4v18"/><path class="gt" d="M80 0v16"/>'
    +       '<path class="gt" d="M120 6v20"/><path class="gt" d="M158 2v14"/>'
    +     '</g>'
    +   '</g>'

    /* burung */
    +   '<g class="muat-burung" fill="none" stroke="#25455C" stroke-width="3.6" stroke-linecap="round" opacity=".55">'
    +     '<path d="M150 214c11-11 19-11 28 0"/><path d="M180 214c11-11 19-11 28 0"/>'
    +     '<path d="M300 178c9-9 15-9 22 0"/><path d="M324 178c9-9 15-9 22 0"/>'
    +     '<path d="M960 132c8-8 13-8 19 0"/><path d="M981 132c8-8 13-8 19 0"/>'
    +   '</g>'

    /* gunung + salju */
    +   '<path d="M470 500 L800 156 L1010 348 L1130 236 L1360 500 Z" fill="url(#qGunungB)" opacity=".88"/>'
    +   '<path d="M700 500 L980 118 L1250 500 Z" fill="url(#qGunungA)"/>'
    +   '<path d="M980 118 L1040 216 L1016 206 L992 232 L966 202 L940 220 Z" fill="#FFFFFF" opacity=".96"/>'
    +   '<path d="M800 156 L842 226 L824 216 L806 238 L786 212 L764 226 Z" fill="#F4FAFD" opacity=".85"/>'

    /* bukit + daratan */
    +   '<path d="M0 520 C 220 452 430 486 640 508 C 880 532 1090 480 1600 520 L1600 900 L0 900 Z" fill="url(#qBukit)" opacity=".62"/>'
    +   '<path d="M0 600 C 240 552 500 580 760 600 C 1040 622 1300 578 1600 606 L1600 900 L0 900 Z" fill="url(#qBukit)"/>'
    +   '<path d="M0 700 C 280 664 560 690 840 706 C 1120 722 1360 690 1600 712 L1600 900 L0 900 Z" fill="url(#qRumput)"/>'

    /* sungai dari gunung ke danau */
    +   '<path d="M988 500 C 920 566 828 616 690 662 C 588 696 540 716 508 742 L592 786 C 632 754 690 728 786 698 C 908 660 1006 600 1074 512 Z" fill="url(#qAir)" opacity=".92"/>'
    +   '<g class="muat-arus" fill="none" stroke="#CFF3FB" stroke-width="4" stroke-linecap="round" opacity=".5">'
    +     '<path d="M940 546c-26 22-56 40-88 54"/>'
    +     '<path d="M800 640c-30 16-60 30-90 42"/>'
    +     '<path d="M660 700c-26 14-46 24-66 34"/>'
    +   '</g>'

    /* danau */
    +   '<ellipse cx="300" cy="800" rx="290" ry="104" fill="url(#qAir)"/>'
    +   '<ellipse cx="300" cy="794" rx="272" ry="88" fill="#2E9CC0" opacity=".3"/>'
    +   '<g class="muat-ombak" fill="none" stroke="#D8F5FD" stroke-width="3.4" stroke-linecap="round" opacity=".7">'
    +     '<path d="M120 786c26-9 52-9 78 0"/><path d="M250 812c30-10 60-10 90 0"/>'
    +     '<path d="M400 780c24-8 48-8 72 0"/><path d="M180 840c28-9 56-9 84 0"/>'
    +   '</g>'

    /* pasir pantai danau */
    +   '<path d="M18 852 C 120 818 300 806 492 834 C 560 844 592 858 600 872 L604 900 L0 900 Z" fill="#EBD9A8" opacity=".92"/>'

    /* ikan */
    +   '<g class="muat-ikan" opacity=".92">'
    +     '<g transform="translate(170,802)"><ellipse rx="19" ry="10" fill="#FF7A59"/><path d="M16 0 L34-11 L34 11 Z" fill="#FF7A59"/><circle cx="-8" cy="-2.4" r="2.4" fill="#102A3C"/></g>'
    +     '<g transform="translate(392,824) scale(.85)"><ellipse rx="19" ry="10" fill="#FFC857"/><path d="M16 0 L34-11 L34 11 Z" fill="#FFC857"/><circle cx="-8" cy="-2.4" r="2.4" fill="#102A3C"/></g>'
    +     '<g transform="translate(268,860) scale(.7)"><ellipse rx="19" ry="10" fill="#7ED0E8"/><path d="M16 0 L34-11 L34 11 Z" fill="#7ED0E8"/><circle cx="-8" cy="-2.4" r="2.4" fill="#102A3C"/></g>'
    +   '</g>'

    /* pohon besar */
    +   '<g class="muat-pohon">'
    +     '<path d="M386 726 L386 596 L410 596 L410 726 Z" fill="#8B5A2B"/>'
    +     '<path d="M392 662 L352 620 M404 690 L446 644" stroke="#8B5A2B" stroke-width="9" stroke-linecap="round"/>'
    +     '<circle cx="398" cy="566" r="76" fill="#3E8B3A"/>'
    +     '<circle cx="336" cy="600" r="56" fill="#4E9B4A"/>'
    +     '<circle cx="462" cy="598" r="54" fill="#2F6B31"/>'
    +     '<circle cx="398" cy="516" r="48" fill="#57A64F"/>'
    +   '</g>'

    /* cemara */
    +   '<g class="muat-cemara">'
    +     '<path d="M1180 712 L1240 712 L1210 566 Z" fill="#2A6B36"/>'
    +     '<path d="M1168 626 L1252 626 L1210 512 Z" fill="#327A3C"/>'
    +     '<path d="M1300 720 L1348 720 L1324 620 Z" fill="#245C2E"/>'
    +     '<path d="M1292 660 L1356 660 L1324 578 Z" fill="#2E7238"/>'
    +     '<path d="M1108 730 L1148 730 L1128 650 Z" fill="#245C2E"/>'
    +     '<path d="M1102 686 L1154 686 L1128 622 Z" fill="#2E7238"/>'
    +   '</g>'

    /* batu */
    +   '<ellipse cx="880" cy="742" rx="30" ry="14" fill="#95A6B2"/>'
    +   '<ellipse cx="922" cy="754" rx="20" ry="10" fill="#8496A3"/>'
    +   '<ellipse cx="652" cy="828" rx="24" ry="11" fill="#8FA1AE"/>'

    /* kelinci */
    +   '<g class="muat-kelinci" transform="translate(1030,724)">'
    +     '<ellipse rx="22" ry="16" fill="#E7E2DA"/>'
    +     '<circle cx="17" cy="-12" r="12" fill="#F0ECE6"/>'
    +     '<path d="M11 -22c-2-12 3-18 7-18 4 0 6 7 3 18Z" fill="#F0ECE6"/>'
    +     '<path d="M22 -22c-1-12 4-17 8-17 4 0 5 7 1 17Z" fill="#EFE9E2"/>'
    +     '<circle cx="-20" cy="-4" r="6" fill="#F7F4EF"/>'
    +     '<circle cx="21" cy="-13" r="1.8" fill="#3A3A3A"/>'
    +   '</g>'

    /* PONDOK — titik fokus zoom */
    +   '<g id="qPondok" transform="translate(700,644)">'
    +     '<rect x="-56" y="-52" width="112" height="72" rx="6" fill="#3E7BD1"/>'
    +     '<rect x="-56" y="-52" width="112" height="72" rx="6" fill="none" stroke="#2A5FA8" stroke-width="3"/>'
    +     '<path d="M-74 -52 L0 -108 L74 -52 Z" fill="url(#qAtap)"/>'
    +     '<path d="M-74 -52 L0 -108 L74 -52 Z" fill="none" stroke="#4A2E8C" stroke-width="3"/>'
    +     '<rect x="-17" y="-34" width="34" height="30" rx="3" fill="#FFE9A8"/>'
    +     '<rect x="-17" y="-34" width="34" height="30" rx="3" fill="none" stroke="#2A5FA8" stroke-width="2.4"/>'
    +     '<path d="M0 -34v30M-17 -19h34" stroke="#2A5FA8" stroke-width="2"/>'
    +     '<rect x="22" y="-14" width="24" height="34" rx="3" fill="#2A5FA8"/>'
    +     '<circle cx="41" cy="4" r="2.6" fill="#FFD166"/>'
    +     '<rect x="42" y="-104" width="16" height="30" fill="#D9CEC1"/>'
    +     '<g class="muat-asap" fill="#EDF3F7" opacity=".8">'
    +       '<circle cx="50" cy="-116" r="9"/><circle cx="56" cy="-134" r="11"/><circle cx="48" cy="-152" r="8"/>'
    +     '</g>'
    +   '</g>'

    /* uap dari permukaan danau */
    +   '<g class="muat-uap" fill="#FFFFFF" opacity=".42">'
    +     '<ellipse cx="230" cy="740" rx="20" ry="10"/><ellipse cx="340" cy="720" rx="24" ry="11"/>'
    +     '<ellipse cx="420" cy="746" rx="18" ry="9"/><ellipse cx="160" cy="716" rx="16" ry="8"/>'
    +   '</g>'

    /* bunga + rumput depan */
    +   '<g class="muat-bunga">'
    +     '<circle cx="532" cy="762" r="7" fill="#FF9FB2"/><circle cx="556" cy="776" r="5.5" fill="#FFC857"/>'
    +     '<circle cx="846" cy="812" r="7" fill="#FF9FB2"/><circle cx="872" cy="826" r="5" fill="#FFFFFF"/>'
    +     '<circle cx="1150" cy="790" r="6.5" fill="#FFC857"/>'
    +     '<circle cx="200" cy="880" r="7" fill="#FFFFFF"/>'
    +   '</g>'
    +   '<g class="muat-rumput" stroke="#2E7A4E" stroke-width="4.5" stroke-linecap="round" fill="none" opacity=".9">'
    +     '<path d="M90 900c0-26 9-38 18-50"/><path d="M124 900c0-22-7-33-15-43"/>'
    +     '<path d="M620 900c0-26 9-38 18-50"/><path d="M654 900c0-22-7-33-15-43"/>'
    +     '<path d="M1000 900c0-26 9-38 18-50"/><path d="M1420 900c0-24 8-36 17-48"/>'
    +   '</g>'

    + '</g>'
    + '<rect id="qLangitGelap" x="0" y="0" width="1600" height="900" fill="#05101A" opacity=".94" pointer-events="none"/>'
    + '</svg>';
  }

  /* transformasi zoom mengelilingi satu titik */
  var FX = 700, FY = 620, ZOOM_AWAL = 5.4;

  function setZoom(s){
    if(!grupZoom) return;
    var tx = FX - FX * s;
    var ty = FY - FY * s;
    grupZoom.setAttribute('transform',
      'translate(' + tx.toFixed(2) + ',' + ty.toFixed(2) + ') scale(' + s.toFixed(3) + ')');
  }

  function setGelap(o){
    if(langitGelap) langitGelap.setAttribute('opacity', String(Math.max(0, Math.min(1, o)).toFixed(3)));
  }

  function gambar(){
    if(!overlay) return;
    if(barEl){
      barEl.style.width = progres.toFixed(1) + '%';
      var b = overlay.querySelector('.muat-bar');
      if(b) b.setAttribute('aria-valuenow', String(Math.round(progres)));
    }
    if(persenEl) persenEl.textContent = Math.round(progres) + '%';
    if(teksEl){
      var t = teksUntuk(progres);
      if(teksEl.textContent !== t) teksEl.textContent = t;
    }
    if(langkahEl){
      var n = Math.round(progres / 100 * tahapLabel.length);
      Array.prototype.forEach.call(langkahEl.children, function(li, i){
        li.classList.toggle('on', i < n);
        li.classList.toggle('kini', i === Math.min(n, tahapLabel.length - 1) && progres < 100);
      });
    }
  }

  function maju(ke){
    targetProgres = Math.max(targetProgres, Math.min(100, ke));
  }

  /* ---------- zoom-out sinematik ----------
     mulaiZoomSekali: penjaga supaya zoom TIDAK dijalankan dua kali
     (rAF + pengaman waktu bisa sama-sama memanggilnya). */
  var zoomMulai = false;
  function mulaiZoomSekali(){
    if(zoomMulai) return;
    zoomMulai = true;
    mulaiZoom();
  }

  function mulaiZoom(){
    var kurangi = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(kurangi){
      setZoom(1); setGelap(0);
      if(judulEl) judulEl.classList.add('tampil');
      return;
    }
    setZoom(ZOOM_AWAL);
    setGelap(.94);
    var t0 = performance.now();

    function langkahZoom(now){
      if(!grupZoom) return;
      var t = Math.min(1, (now - t0) / ZOOM_MS);
      // easeInOutCubic: mulai pelan (kamera menoleh), cepat di tengah, melambat di akhir
      var e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setZoom(ZOOM_AWAL + (1 - ZOOM_AWAL) * e);
      setGelap(.94 * (1 - Math.pow(e, .78)));
      if(t < 1){
        rafZoom = requestAnimationFrame(langkahZoom);
      } else if(judulEl){
        judulEl.classList.add('tampil');
      }
    }
    rafZoom = requestAnimationFrame(langkahZoom);
  }

  /* ---------- siklus hidup ---------- */
  function bangun(){
    if(overlay) return overlay;
    selesai = false; progres = 0; targetProgres = 0; siapkan = false;

    overlay = document.createElement('div');
    overlay.className = 'muat';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Memuat QIIORA');

    var huruf = 'QIIORA'.split('').map(function(h, i){
      return '<span style="--i:' + i + '">' + h + '</span>';
    }).join('');

    var langkahHTML = tahapLabel.map(function(l){ return '<li>' + l + '</li>'; }).join('');

    overlay.innerHTML =
        '<div class="muat-scene">' + adeganSVG() + '</div>'
      + '<div class="muat-scrim" aria-hidden="true"></div>'
      + '<div class="muat-info">'
      +   '<div class="muat-judul" aria-hidden="true">' + huruf + '</div>'
      +   '<p class="muat-sub">Siklus Air · IPAS Fase C · Kelas V</p>'
      +   '<ol class="muat-langkah" aria-hidden="true">' + langkahHTML + '</ol>'
      +   '<div class="muat-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>'
      +   '<div class="muat-baris"><p class="muat-teks">Menyiapkan panggung siklus air…</p><p class="muat-persen">0%</p></div>'
      + '</div>'
      + '<button class="muat-lewati" type="button" hidden>Lewati</button>';

    (document.body || document.documentElement).appendChild(overlay);
    waktuMulai = Date.now();
    // kunci gulir: layar muat menutupi penuh, halaman di belakang
    // tidak boleh bisa digulir (dulu muncul bilah gulir di tepi).
    document.documentElement.classList.add('sedang-muat');

    grupZoom    = overlay.querySelector('#qPulau');
    langitGelap = overlay.querySelector('#qLangitGelap');
    judulEl     = overlay.querySelector('.muat-judul');
    barEl       = overlay.querySelector('.muat-bar i');
    teksEl      = overlay.querySelector('.muat-teks');
    persenEl    = overlay.querySelector('.muat-persen');
    langkahEl   = overlay.querySelector('.muat-langkah');

    var btn = overlay.querySelector('.muat-lewati');
    setTimeout(function(){ if(btn) btn.hidden = false; }, 2200);
    btn.addEventListener('click', function(){ maju(100); keluar(); });

    /* PENJAGA WAKTU KERAS: apa pun yang gagal (skrip pihak ketiga
       tidak pernah siap, rAF mati karena tab di latar, dsb), layar
       muat WAJIB selesai. Dulu tanpa ini layar muat bisa menggantung
       selamanya dan navbar terlihat menembusnya. */
    zoomMulai = false;
    var penjagaMuat = setTimeout(function(){
      if(overlay && !selesai){
        maju(100);
        gambar();
        keluar();
      }
    }, 12000);
    overlay.__penjaga = penjagaMuat;

    gambar();
    maju(8);
    siapkan = true;

    /* rAF dipakai hanya untuk animasi zoom. Kalau tab di latar, rAF mati
       dan zoom tidak pernah mulai -> layar muat tampak beku. Pengaman
       waktu memastikan zoom tetap dimulai walau rAF tertahan. */
    mulaiZoomSekali();
    setTimeout(function(){ mulaiZoomSekali(); }, 700);

    // setInterval, bukan RAF: RAF berhenti saat tab di latar dan bar
    // tidak boleh beku hanya karena itu.
    var tik = setInterval(function(){
      if(selesai){ clearInterval(tik); return; }
      /* Plafon berbasis WAKTU: walau semua modul sudah siap dalam 300 ms,
         bar tetap bergerak merata sepanjang durasi sinematik. Tanpa ini
         bar melompat ke 96% seketika lalu diam — persis keluhan "keburu". */
      var kurangiGerak = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var durasi = kurangiGerak ? 900 : MIN_MS;
      var frac = Math.min(1, (Date.now() - waktuMulai) / durasi);
      var plafon = 8 + frac * 88;
      var tujuan = Math.min(targetProgres, plafon);

      if(progres < tujuan){
        progres = Math.min(tujuan, progres + Math.max(.35, (tujuan - progres) * .18));
        gambar();
      } else if(targetProgres < 100 && progres < 99){
        /* modul siap tapi waktu belum habis: merayap makin pelan ke 99% */
        progres = Math.min(99, progres + Math.max(.04, (99 - progres) * .012));
        gambar();
      }
    }, 48);

    document.dispatchEvent(new CustomEvent('qiiora:muat-mulai'));
    return overlay;
  }

  function keluar(){
    if(!overlay || selesai) return;
    if(!siapkan){ setTimeout(keluar, 120); return; }

    // durasi minimum: zoom-out harus selesai, jangan dipotong
    var kurangi = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var minimal = kurangi ? 900 : MIN_MS;
    var sisa = minimal - (Date.now() - waktuMulai);
    if(sisa > 0){ setTimeout(keluar, sisa); return; }

    selesai = true;
    progres = 100; targetProgres = 100; gambar();
    if(teksEl) teksEl.textContent = 'Siap — selamat belajar!';
    if(judulEl) judulEl.classList.add('tampil');

    setTimeout(function(){
      overlay.classList.add('keluar');
      setTimeout(function(){
        if(rafZoom) cancelAnimationFrame(rafZoom);
        if(overlay && overlay.__penjaga) clearTimeout(overlay.__penjaga);
        if(overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        document.documentElement.classList.remove('sedang-muat');
        overlay = null; grupZoom = null; langitGelap = null; judulEl = null; langkahEl = null;
        try{ sessionStorage.setItem(KUNCI, '1'); }catch(e){}
        document.dispatchEvent(new CustomEvent('qiiora:muat-selesai'));
      }, 620);
    }, 420);
  }

  function adaSesi(){
    try{
      var raw = localStorage.getItem(NS + 'sesi-masuk');
      if(!raw) return false;
      var d = JSON.parse(raw);
      return !!(d && d.nama && String(d.nama).trim());
    }catch(e){ return false; }
  }

  /* ---------- API publik ---------- */
  window.QIIORA.muat = {
    mulai: function(){
      var sudah = false;
      try{ sudah = sessionStorage.getItem(KUNCI) === '1'; }catch(e){}
      if(sudah) return false;
      if(ditahan) return false;
      bangun(); maju(8);
      return true;
    },
    // dipakai gerbang login: tampilkan layar muat tanpa peduli kunci sesi
    mulaiPaksa: function(){
      ditahan = false;
      try{ sessionStorage.removeItem(KUNCI); }catch(e){}
      if(overlay){ maju(8); return true; }
      bangun(); maju(8);
      return true;
    },
    tahan: function(){ ditahan = true; return true; },
    langkah: maju,
    selesai: keluar,
    aktif: function(){ return !!overlay && !selesai; },
    siap: function(){ return siapkan; },
    durasiMin: function(){ return MIN_MS; }
  };

  // Jalankan sendiri di <head>: layar muat harus tampil SEBELUM three.min.js
  // selesai diunduh — TAPI hanya bila siswa sudah punya sesi. Tanpa sesi,
  // gerbang login yang tampil lebih dulu.
  try{
    var sudahSesi = false;
    try{ sudahSesi = sessionStorage.getItem(KUNCI) === '1'; }catch(e){}
    if(!sudahSesi && adaSesi()){ bangun(); maju(8); }
  }catch(e){}
})();
