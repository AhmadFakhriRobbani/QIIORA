/* QIIORA — K4: skema siklus air 2D beranda.
   Gambar ulang ORISINAL (vektor buatan sendiri) yang terinspirasi poster
   NOAA/NWS JetStream "The Water Cycle". Bukan salinan piksel.
   - 12 proses, panah kuning mengalir, panel penjelasan menyatu (bukan pop-up)
   - Jeda/Putar, "Mulai siklus" (sorot berurutan otomatis)
   - Berhenti saat tab/halaman tak terlihat; prefers-reduced-motion -> statis
   ES5, IIFE, tanpa pustaka. */
(function(){
  'use strict';

  /* ---------- Data 12 proses ----------
     lab: posisi lencana (x,y) + a = 'm' (teks di kanan) atau 'a' (teks di kiri)
     panah: daftar path "M x y L x y" / kurva. */
  var PROSES = [
    { id:'penguapan', no:1, nama:'Penguapan', wujud:'cair → gas',
      teks:'Panas matahari membuat air cair di laut, danau, dan sungai berubah menjadi uap air. Uap air itu tidak terlihat dan naik ke udara.',
      lab:{x:34,y:372,a:'m'}, panah:['M62 436 L62 392','M885 452 L885 400'] },
    { id:'transpirasi', no:2, nama:'Transpirasi', wujud:'cair → gas',
      teks:'Tumbuhan menyerap air lewat akar. Sebagian air itu dilepaskan lewat daun ke udara sebagai uap air.',
      lab:{x:606,y:318,a:'m'}, panah:['M566 326 L566 270'] },
    { id:'pengembunan', no:3, nama:'Pengembunan', wujud:'gas → cair',
      teks:'Uap air yang naik menjadi dingin lalu berubah menjadi titik-titik air yang sangat kecil. Titik-titik air itu berkumpul membentuk awan.',
      lab:{x:492,y:128,a:'m'}, panah:['M470 330 L470 270'] },
    { id:'transportasi', no:4, nama:'Transportasi', wujud:'',
      teks:'Angin membawa awan berpindah dari satu tempat ke tempat lain. Air di udara ikut terbawa, bisa berupa uap, tetes air, atau butir es.',
      lab:{x:590,y:70,a:'m'}, panah:['M600 112 L722 112'] },
    { id:'presipitasi', no:5, nama:'Presipitasi', wujud:'',
      teks:'Air jatuh dari awan ke permukaan bumi. Yang paling sering adalah hujan, tetapi bisa juga salju, hujan es, atau gerimis.',
      lab:{x:30,y:262,a:'m'}, panah:['M282 232 L282 330'] },
    { id:'deposisi', no:6, nama:'Deposisi', wujud:'gas → padat',
      teks:'Di tempat yang sangat dingin seperti puncak gunung, uap air bisa langsung berubah menjadi es tanpa menjadi air cair dulu.',
      lab:{x:712,y:284,a:'a'}, panah:['M728 196 L728 252'] },
    { id:'sublimasi', no:7, nama:'Sublimasi', wujud:'padat → gas',
      teks:'Es atau salju bisa langsung berubah menjadi uap air tanpa mencair lebih dahulu.',
      lab:{x:808,y:232,a:'m'}, panah:['M780 258 L780 212'] },
    { id:'limpasan', no:8, nama:'Limpasan', wujud:'',
      teks:'Air mengalir di permukaan bumi, lewat lereng, sungai, dan danau, menuju tempat yang lebih rendah hingga akhirnya sampai ke laut.',
      lab:{x:950,y:364,a:'a'}, panah:['M888 292 L930 342','M752 346 L724 396','M468 462 L418 456'] },
    { id:'infiltrasi', no:9, nama:'Infiltrasi', wujud:'',
      teks:'Air hujan yang jatuh di tanah meresap masuk ke dalam tanah melalui permukaannya.',
      lab:{x:684,y:500,a:'a'}, panah:['M706 478 L706 524'] },
    { id:'perkolasi', no:10, nama:'Perkolasi', wujud:'',
      teks:'Air yang sudah masuk ke tanah terus bergerak turun lebih dalam, melewati celah-celah tanah, sampai tiba di lapisan air tanah.',
      lab:{x:790,y:556,a:'m'}, panah:['M760 534 L760 580'] },
    { id:'serapan', no:11, nama:'Serapan tanaman', wujud:'',
      teks:'Akar tumbuhan menyerap air yang ada di dalam tanah, termasuk dari air tanah yang dekat dengan akar.',
      lab:{x:604,y:608,a:'m'}, panah:['M574 596 C 570 570 566 552 562 532'] },
    { id:'airtanah', no:12, nama:'Air tanah', wujud:'',
      teks:'Air tanah adalah air yang mengalir di bawah permukaan tanah. Alirannya perlahan dan bisa bergerak menuju laut.',
      lab:{x:150,y:612,a:'m'}, panah:['M470 590 C 400 584 340 572 270 566','M250 566 L168 560'] }
  ];
  var URUTAN = ['penguapan','transpirasi','pengembunan','transportasi','presipitasi',
                'deposisi','sublimasi','limpasan','infiltrasi','perkolasi','serapan','airtanah'];

  /* ---------- Pembantu penggambaran ---------- */
  function awan(cx, cy, s, atas, bawah, kelas, tunda){
    return '<g transform="translate('+cx+','+cy+')"><g class="sk-hanyut '+kelas+'" style="animation-delay:'+tunda+'s"><g transform="scale('+s+')">'
      + '<ellipse cx="0" cy="26" rx="92" ry="16" fill="'+bawah+'"/>'
      + '<circle cx="-62" cy="8" r="32" fill="'+bawah+'"/><circle cx="62" cy="10" r="30" fill="'+bawah+'"/>'
      + '<circle cx="-58" cy="2" r="30" fill="'+atas+'"/><circle cx="-20" cy="-14" r="42" fill="'+atas+'"/>'
      + '<circle cx="28" cy="-8" r="38" fill="'+atas+'"/><circle cx="62" cy="6" r="28" fill="'+atas+'"/>'
      + '<rect x="-84" y="2" width="168" height="28" rx="14" fill="'+atas+'"/>'
      + '<path d="M-70 24 Q0 36 76 24" fill="none" stroke="'+bawah+'" stroke-width="6" opacity=".55"/>'
      + '</g></g></g>';
  }
  function uap(x, y, dx, dur, tunda){
    return '<g transform="translate('+x+','+y+')"><ellipse class="sk-uap" rx="5" ry="7" style="--dx:'+dx+'px;animation-duration:'+dur+'s;animation-delay:-'+tunda+'s"/></g>';
  }
  function cemara(x, y, h, w, warna){
    var t = h/3;
    return '<path d="M'+x+' '+(y-h)+' L'+(x-w*.55)+' '+(y-h+t*1.3)+' H'+(x+w*.55)+'Z" fill="'+warna+'"/>'
      + '<path d="M'+x+' '+(y-h+t*.8)+' L'+(x-w*.8)+' '+(y-h+t*2.2)+' H'+(x+w*.8)+'Z" fill="'+warna+'"/>'
      + '<path d="M'+x+' '+(y-h+t*1.6)+' L'+(x-w)+' '+(y-8)+' H'+(x+w)+'Z" fill="'+warna+'"/>'
      + '<rect x="'+(x-3)+'" y="'+(y-9)+'" width="6" height="9" fill="#6B4423"/>';
  }
  function burung(x, y, s, dur, tunda){
    return '<g transform="translate('+x+','+y+') scale('+s+')"><g class="sk-burung" style="animation-duration:'+dur+'s;animation-delay:-'+tunda+'s">'
      + '<path d="M0 0 q8 -9 16 0 q8 -9 16 0" fill="none" stroke="#24364A" stroke-width="2.6" stroke-linecap="round"/></g></g>';
  }
  function jalur(d){ return d; }

  /* ---------- Adegan ---------- */
  function adegan(){
    var i, x, s = '';
    s += '<svg class="sk-svg" viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid slice" role="group" aria-label="Skema siklus air dengan 12 proses. Pilih nomor atau panah untuk membaca penjelasannya.">';
    s += '<defs>'
      + '<linearGradient id="skLangit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3F8FDB"/><stop offset=".55" stop-color="#8CCBF3"/><stop offset="1" stop-color="#D6EEFB"/></linearGradient>'
      + '<linearGradient id="skLaut" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#37C2DC"/><stop offset="1" stop-color="#1B86BE"/></linearGradient>'
      + '<linearGradient id="skRumput" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8AD35F"/><stop offset="1" stop-color="#4E9E46"/></linearGradient>'
      + '<linearGradient id="skGunung" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9AA9BC"/><stop offset="1" stop-color="#66758A"/></linearGradient>'
      + '<linearGradient id="skTanah" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9A6A3C"/><stop offset="1" stop-color="#5B3A1F"/></linearGradient>'
      + '<radialGradient id="skCahaya"><stop offset="0" stop-color="#FFE98A" stop-opacity=".95"/><stop offset=".45" stop-color="#FFD25A" stop-opacity=".35"/><stop offset="1" stop-color="#FFD25A" stop-opacity="0"/></radialGradient>'
      + '<marker id="skKepala" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="2.7" markerHeight="2.7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#FFC21A" stroke="#B8780A" stroke-width="1.3" stroke-linejoin="round"/></marker>'
      + '<clipPath id="skBingkai"><rect width="1000" height="640" rx="20"/></clipPath>'
      + '<clipPath id="skAirLaut"><rect x="0" y="446" width="406" height="56"/></clipPath>'
      + '</defs>';
    s += '<g clip-path="url(#skBingkai)">';

    /* langit */
    s += '<rect width="1000" height="500" fill="url(#skLangit)"/>';

    /* matahari */
    s += '<g transform="translate(95,88)"><circle class="sk-cahaya" r="130" fill="url(#skCahaya)"/>'
       + '<g class="sk-sinar" stroke="#FFC933" stroke-width="7" stroke-linecap="round">';
    for(i = 0; i < 12; i++){
      s += '<path d="M0 -58 V-' + (i % 2 ? 72 : 84) + '" transform="rotate(' + (i * 30) + ')"/>';
    }
    s += '</g><circle r="44" fill="#FFD34D" stroke="#F4A81D" stroke-width="4"/><circle r="30" fill="#FFE68A" opacity=".7"/></g>';

    /* awan: besar (hujan), kecil (pengembunan), kanan (salju) */
    s += awan(250, 128, 1.45, '#C3CFDD', '#8D9DB2', 'sk-h1', 0);
    s += awan(530, 204, .95, '#FFFFFF', '#CBDCEC', 'sk-h2', -4);
    s += awan(872, 108, 1.15, '#FFFFFF', '#C3D5E8', 'sk-h3', -8);

    /* gunung + salju */
    s += '<path d="M640 470 L760 304 L802 330 L850 214 L912 290 L946 262 L1000 332 V470 Z" fill="url(#skGunung)"/>';
    s += '<path d="M850 214 L912 290 L946 262 L1000 332 V470 L905 470 Z" fill="#1C2B3F" opacity=".16"/>';
    s += '<path d="M850 214 L812 270 L834 262 L850 290 L868 262 L892 274 L912 290 Z" fill="#FFFFFF"/>';
    s += '<path d="M850 214 L912 290 L892 274 L868 262 L862 240 Z" fill="#D5E6F7"/>';
    s += '<path d="M760 304 L736 338 L754 332 L768 348 L784 330 L802 330 Z" fill="#FFFFFF"/>';
    s += cemara(690, 462, 52, 18, '#2F7A3F') + cemara(716, 466, 40, 14, '#3C8E4A') + cemara(668, 468, 36, 13, '#3C8E4A');

    /* salju jatuh */
    s += '<g class="sk-salju">';
    for(i = 0; i < 12; i++){
      x = 800 + i * 11;
      s += '<g transform="translate(' + x + ',156)"><circle class="sk-bulir" r="3.2" style="animation-delay:-' + (i * .37).toFixed(2) + 's;--dx:' + (i % 2 ? -10 : 8) + 'px"/></g>';
    }
    s += '</g>';

    /* daratan, pantai, danau */
    s += '<path d="M392 484 C 420 462 470 456 540 464 C 620 472 700 468 780 472 L1000 466 V504 H392 Z" fill="url(#skRumput)"/>';
    s += '<path d="M380 504 V480 C 396 464 436 458 484 468 L506 504 Z" fill="#F1DBA2"/>';
    s += '<path d="M788 478 C 830 462 940 460 996 470 V496 C 940 504 836 506 788 494 Z" fill="#46B4EA"/>';
    s += '<path d="M806 480 C 850 472 920 472 972 478" fill="none" stroke="#BDE8FF" stroke-width="3" stroke-linecap="round" opacity=".7"/>';
    /* sungai di lereng */
    s += '<path class="sk-sungai" d="M906 296 C 892 332 934 360 910 404 S 884 440 872 466" fill="none" stroke="#69C5F6" stroke-width="5" stroke-linecap="round"/>';

    /* pohon birch, cemara, batu, kelapa */
    s += '<g>'
      + '<path d="M556 470 C 555 430 559 400 563 360" stroke="#F1EEE6" stroke-width="13" fill="none" stroke-linecap="round"/>'
      + '<path d="M551 440 h9 M556 412 h8 M558 388 h7" stroke="#6B6B6B" stroke-width="3" stroke-linecap="round"/>'
      + '<circle cx="530" cy="346" r="34" fill="#4BA85A"/><circle cx="592" cy="348" r="36" fill="#43A053"/>'
      + '<circle cx="560" cy="316" r="44" fill="#5DBB63"/><circle cx="536" cy="326" r="26" fill="#6CCB6E"/>'
      + '<circle cx="584" cy="330" r="24" fill="#57B65F"/></g>';
    s += cemara(628, 468, 76, 24, '#2A7A45') + cemara(604, 470, 54, 18, '#3A8F4E');
    s += '<path d="M492 470 L500 450 L520 446 L536 458 L540 470 Z" fill="#9A9AA0"/><path d="M500 450 L520 446 L514 462 Z" fill="#B9B9C0"/>';
    s += '<g><path d="M424 474 C 420 450 428 424 440 404" stroke="#8A5A2B" stroke-width="7" fill="none" stroke-linecap="round"/>'
      + '<g stroke="#2F9A4A" stroke-width="6" fill="none" stroke-linecap="round"><path d="M440 404 q-24 -8 -40 6"/><path d="M440 404 q-8 -22 -26 -26"/><path d="M440 404 q10 -22 32 -20"/><path d="M440 404 q24 -4 38 12"/></g></g>';

    /* laut + ombak */
    s += '<rect x="0" y="446" width="406" height="56" fill="url(#skLaut)"/>';
    s += '<g clip-path="url(#skAirLaut)"><g class="sk-ombak" fill="none" stroke="#BFF0FA" stroke-width="3.4" stroke-linecap="round" opacity=".85">'
      + '<path d="M-60 456 q15 -9 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0"/>'
      + '<path d="M-45 474 q15 -9 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0"/>'
      + '<path d="M-52 492 q15 -9 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0"/>'
      + '</g></g>';

    /* hujan ke laut + riak */
    s += '<g class="sk-hujan">';
    for(i = 0; i < 12; i++){
      x = 214 + i * 11;
      s += '<path d="M' + x + ' 196 L' + (x - 6) + ' 440" style="animation-delay:-' + (i * .13).toFixed(2) + 's"/>';
    }
    s += '</g>';
    for(i = 0; i < 3; i++){
      s += '<ellipse class="sk-riak" cx="' + (232 + i * 46) + '" cy="448" rx="14" ry="3.6" style="animation-delay:-' + (i * .45).toFixed(2) + 's"/>';
    }

    /* tanah potongan */
    s += '<rect x="0" y="500" width="1000" height="140" fill="url(#skTanah)"/>';
    s += '<path d="M0 524 C 160 512 300 534 460 520 S 760 514 1000 526" fill="none" stroke="#6E4524" stroke-width="3" opacity=".6"/>';
    s += '<path d="M0 548 C 200 540 360 556 520 544 S 800 540 1000 552" fill="none" stroke="#7B4F2B" stroke-width="3" opacity=".5"/>';
    s += '<g fill="#B79468" opacity=".75"><circle cx="120" cy="530" r="6"/><circle cx="330" cy="610" r="7"/><circle cx="640" cy="528" r="5"/><circle cx="880" cy="540" r="6"/><circle cx="960" cy="620" r="7"/><circle cx="60" cy="606" r="5"/></g>';
    s += '<g fill="#7C8089" opacity=".85"><ellipse cx="240" cy="520" rx="16" ry="9"/><ellipse cx="820" cy="615" rx="18" ry="10"/><ellipse cx="470" cy="620" rx="14" ry="8"/></g>';
    /* pita air tanah */
    s += '<path d="M1000 588 C 920 596 820 578 700 590 S 520 600 440 580 S 200 562 0 552 V590 C 200 604 400 620 560 622 S 860 618 1000 626 Z" fill="#2F86D8" opacity=".92"/>';
    s += '<path class="sk-airtanah" d="M1000 598 C 920 604 820 590 700 600 S 520 608 440 592 S 200 574 0 566" fill="none" stroke="#A7DBFF" stroke-width="4" stroke-linecap="round"/>';
    /* akar */
    s += '<g stroke="#80522A" stroke-width="3.4" fill="none" stroke-linecap="round">'
      + '<path d="M558 470 C 556 500 560 520 566 546"/><path d="M558 484 C 540 504 530 520 524 540"/>'
      + '<path d="M558 484 C 578 504 592 520 600 538"/><path d="M562 520 C 552 534 548 548 546 562"/></g>';

    /* uap naik */
    s += '<g>';
    for(i = 0; i < 9; i++){ s += uap(24 + i * 42, 436, (i % 2 ? 12 : -8), 4.2 + (i % 3) * .5, (i * .55).toFixed(2)); }
    for(i = 0; i < 4; i++){ s += uap(812 + i * 52, 454, (i % 2 ? 8 : -6), 4.4, (i * .9).toFixed(2)); }
    for(i = 0; i < 4; i++){ s += uap(520 + i * 24, 300, (i % 2 ? 6 : -6), 3.6, (i * .8).toFixed(2)); }
    s += '</g>';

    /* burung */
    s += burung(-40, 70, 1, 22, 0) + burung(-70, 96, .75, 26, 6) + burung(-20, 52, .6, 30, 12);

    /* panah + label proses */
    for(i = 0; i < PROSES.length; i++){
      var p = PROSES[i], j, ds = '', hit = '', lab = '';
      for(j = 0; j < p.panah.length; j++){
        ds += '<path class="sk-pj-luar" d="' + p.panah[j] + '"/>'
            + '<path class="sk-pj" d="' + p.panah[j] + '" marker-end="url(#skKepala)"/>'
            + '<path class="sk-pj-alir" d="' + p.panah[j] + '"/>';
        hit += '<path class="sk-hit" d="' + p.panah[j] + '"/>';
      }
      var kiri = p.lab.a === 'a';
      lab = '<g class="sk-lab" transform="translate(' + p.lab.x + ',' + p.lab.y + ')">'
          + '<text class="sk-nama" x="' + (kiri ? -24 : 24) + '" y="9" text-anchor="' + (kiri ? 'end' : 'start') + '">' + p.nama + '</text>'
          + '<circle class="sk-no-c" r="15"/><text class="sk-no-t" y="6" text-anchor="middle">' + p.no + '</text></g>';
      s += '<g class="sk-p" data-p="' + p.id + '" tabindex="0" role="button" aria-pressed="false" aria-label="' + p.no + '. ' + p.nama + '">'
         + hit + ds + lab + '</g>';
    }

    s += '</g></svg>';
    return s;
  }

  /* ---------- Antarmuka ---------- */
  function cari(id){
    var i;
    for(i = 0; i < PROSES.length; i++){ if(PROSES[i].id === id) return PROSES[i]; }
    return null;
  }

  function pasang(){
    var host = document.querySelector('[data-skema]');
    if(!host || host.getAttribute('data-siap')) return;
    host.setAttribute('data-siap', '1');
    host.classList.add('skema');

    var chips = '', i;
    for(i = 0; i < PROSES.length; i++){
      chips += '<button type="button" class="sk-chip" data-p="' + PROSES[i].id + '" aria-pressed="false"><b>' + PROSES[i].no + '</b>' + PROSES[i].nama + '</button>';
    }
    host.innerHTML =
      '<div class="sk-adegan">' + adegan() + '</div>'
      + '<div class="sk-kontrol">'
      +   '<button type="button" class="sk-btn" data-sk="jeda" aria-pressed="false"><span data-sk-ikon="jeda" aria-hidden="true">❚❚</span><span data-sk-jeda-label>Jeda</span></button>'
      +   '<button type="button" class="sk-btn sk-btn--utama" data-sk="siklus" aria-pressed="false"><span aria-hidden="true">▶</span><span data-sk-siklus-label>Mulai siklus</span></button>'
      + '</div>'
      + '<div class="sk-chips" role="group" aria-label="Daftar proses siklus air">' + chips + '</div>'
      + '<div class="sk-panel" data-sk-panel role="region" aria-live="polite" aria-label="Penjelasan proses">'
      +   '<p class="sk-panel-awal">Ketuk nomor atau panah pada gambar, atau pilih proses di atas, untuk membaca penjelasannya. Atau tekan <b>Mulai siklus</b> untuk melihat prosesnya berurutan.</p>'
      + '</div>';

    var svg = host.querySelector('.sk-svg');
    var panel = host.querySelector('[data-sk-panel]');
    var btnJeda = host.querySelector('[data-sk="jeda"]');
    var btnSiklus = host.querySelector('[data-sk="siklus"]');
    var lblJeda = host.querySelector('[data-sk-jeda-label]');
    var lblSiklus = host.querySelector('[data-sk-siklus-label]');
    var ikonJeda = host.querySelector('[data-sk-ikon="jeda"]');

    var st = { aktif:null, jeda:false, terlihat:true, tabAda:true, diam:false, siklus:false, langkah:0, timer:0 };

    function terapkanGerak(){
      var henti = st.jeda || !st.terlihat || !st.tabAda;
      host.classList.toggle('is-jeda', henti);
      host.classList.toggle('is-diam', st.diam);
    }

    function pilih(id){
      st.aktif = id;
      var i, els = host.querySelectorAll('[data-p]');
      for(i = 0; i < els.length; i++){
        var on = els[i].getAttribute('data-p') === id;
        els[i].setAttribute('aria-pressed', String(on));
        if(els[i].classList){ els[i].classList.toggle('is-sorot', on); }
      }
      host.setAttribute('data-aktif', id || '');
      var p = id ? cari(id) : null;
      if(!p){
        panel.innerHTML = '<p class="sk-panel-awal">Ketuk nomor atau panah pada gambar, atau pilih proses di atas, untuk membaca penjelasannya.</p>';
        return;
      }
      var tambahan = st.siklus ? '<span class="sk-langkah">' + (st.langkah + 1) + ' dari ' + URUTAN.length + '</span>' : '';
      panel.innerHTML =
        '<div class="sk-panel-kepala"><span class="sk-panel-no">' + p.no + '</span><h3>' + p.nama + '</h3>'
        + (p.wujud ? '<span class="sk-wujud">' + p.wujud + '</span>' : '') + tambahan + '</div>'
        + '<p>' + p.teks + '</p>';
    }

    function berhentiSiklus(){
      st.siklus = false;
      if(st.timer){ clearInterval(st.timer); st.timer = 0; }
      btnSiklus.setAttribute('aria-pressed', 'false');
      lblSiklus.textContent = 'Mulai siklus';
      btnSiklus.firstChild.textContent = '▶';
    }
    function langkah(n){
      st.langkah = n % URUTAN.length;
      pilih(URUTAN[st.langkah]);
    }
    function mulaiSiklus(){
      st.siklus = true;
      if(st.jeda){ st.jeda = false; segarkanJeda(); terapkanGerak(); }
      btnSiklus.setAttribute('aria-pressed', 'true');
      lblSiklus.textContent = 'Hentikan siklus';
      btnSiklus.firstChild.textContent = '■';
      langkah(0);
      st.timer = setInterval(function(){
        if(!st.terlihat || !st.tabAda) return;
        if(st.langkah + 1 >= URUTAN.length){ berhentiSiklus(); return; }
        langkah(st.langkah + 1);
      }, 3800);
    }
    function segarkanJeda(){
      btnJeda.setAttribute('aria-pressed', String(st.jeda));
      lblJeda.textContent = st.jeda ? 'Putar' : 'Jeda';
      ikonJeda.textContent = st.jeda ? '▶' : '❚❚';
    }

    /* klik / ketuk */
    host.addEventListener('click', function(e){
      var t = e.target, tombol = null, grup = null;
      while(t && t !== host){
        if(t.getAttribute){
          if(!tombol && t.getAttribute('data-sk')) tombol = t;
          if(!grup && t.getAttribute('data-p')) grup = t;
        }
        t = t.parentNode;
      }
      if(tombol){
        var aksi = tombol.getAttribute('data-sk');
        if(aksi === 'jeda'){ st.jeda = !st.jeda; segarkanJeda(); terapkanGerak(); }
        if(aksi === 'siklus'){ if(st.siklus) berhentiSiklus(); else mulaiSiklus(); }
        return;
      }
      if(grup){
        var id = grup.getAttribute('data-p');
        if(st.siklus) berhentiSiklus();
        pilih(st.aktif === id ? null : id);
      }
    });
    svg.addEventListener('keydown', function(e){
      var g = e.target;
      if(g && g.getAttribute && g.getAttribute('data-p') && (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13 || e.keyCode === 32)){
        e.preventDefault();
        var id = g.getAttribute('data-p');
        if(st.siklus) berhentiSiklus();
        pilih(st.aktif === id ? null : id);
      }
    });

    /* hemat tenaga: berhenti saat tak terlihat */
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(en){
        st.terlihat = en[0].isIntersecting;
        terapkanGerak();
      }, { threshold: 0.05 }).observe(host);
    }
    document.addEventListener('visibilitychange', function(){ st.tabAda = !document.hidden; terapkanGerak(); });
    document.addEventListener('qiiora:view', function(e){
      if(e.detail && e.detail.nama !== 'beranda'){ st.terlihat = false; if(st.siklus) berhentiSiklus(); }
      else { st.terlihat = true; }
      terapkanGerak();
    });
    var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    if(mq){
      st.diam = mq.matches;
      if(mq.addEventListener){ mq.addEventListener('change', function(ev){ st.diam = ev.matches; terapkanGerak(); }); }
    }
    terapkanGerak();
  }

  if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', pasang); }
  else { pasang(); }

  window.QIIORA = window.QIIORA || {};
  window.QIIORA.skema = { proses: PROSES, urutan: URUTAN };
})();
