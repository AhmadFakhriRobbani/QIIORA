/* ============================================================
   QIIORA — Visual penguat per butir (K3)

   Setiap butir modul mendapat satu panel visual di atas materi.
   Isinya dipilih OTOMATIS dari judul + kata kunci materi, jadi
   tidak perlu menyunting 5 berkas data bab satu per satu.

   Jenis visual yang tersedia (semua digambar sendiri, tanpa aset):
     hujan     — awan, tetes jatuh, tanah menyerap, limpasan
     uap       — air memanas, uap naik, mengembun jadi awan
     serap     — penampang tanah: air meresap lapis demi lapis
     siklus    — diagram putar 4 tahap dengan panah bergerak
     sungai    — aliran dari gunung ke laut, belok-belok
     tanah     — tiga jenis tanah (pasir, lempung, liat) menyerap
     pohon     — transpirasi: akar -> batang -> daun -> uap
     hemat     — cara hemat air (keran, tampungan air hujan)
     awan      — jenis awan & proses pembentukannya
     default   — tetes air berdenyut dengan cincin

   API: QIIORA.visual.buat(kunci, wadah) -> elemen kanvas
        QIIORA.visual.pilih(butir) -> kunci jenis
   ============================================================ */
(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};

  /* ---------- pemilih otomatis ----------
     Versi pertama memakai "kata kunci pertama yang cocok" dan hasilnya
     buruk: kata "uap" muncul di hampir semua materi siklus air,
     sehingga hampir semua butir jadi visual 'uap'. Sekarang dipakai
     PENILAIAN BERBOBOT: kata kunci di JUDUL bernilai 4, di materi
     bernilai 1. Jenis dengan skor tertinggi menang, dan 'default'
     hanya dipakai bila tidak ada yang cocok. */
  var ATURAN = [
    { kunci: 'serap',  uji: /meresap|infiltrasi|perkolasi|air tanah|akuifer|resapan|zona tak jenuh/i, judul: /meresap|air tanah|akuifer|resapan|sumur/i },
    { kunci: 'tanah',  uji: /jenis tanah|\bpasir\b|lempung|\bliat\b|tekstur|\bpori\b|humus/i, judul: /\btanah\b|pasir|lempung|liat/i },
    { kunci: 'pohon',  uji: /transpirasi|tumbuhan|stomata|\bdaun\b|\bakar\b/i, judul: /transpirasi|tumbuhan|daun|akar/i },
    /* Token pendek WAJIB pakai \b — tanpa itu 'es' cocok di dalam
       "proses/selesai" dan hampir semua butir jadi 'wujud'. */
    { kunci: 'wujud',  uji: /\bwujud\b|\bpadat\b|\bcair\b|mencair|membeku|\bgas\b|menguap|mengembun|\bes\b|kutub|salju/i, judul: /wujud|padat|cair|mencair|membeku|\bes\b|kutub/i },
    { kunci: 'uap',    uji: /evaporasi|penguapan|\bmemanas\b|mendidih/i, judul: /evaporasi|penguapan|memanas/i },
    { kunci: 'awan',   uji: /kondensasi|pengembunan|\bawan\b|sirus|kumulus|stratus|\bembun\b/i, judul: /kondensasi|pengembunan|awan|sirus|kumulus|stratus/i },
    { kunci: 'hujan',  uji: /presipitasi|\bhujan\b|\bturun\b|graupel|gerimis/i, judul: /presipitasi|hujan|gerimis/i },
    { kunci: 'sungai', uji: /limpasan|runoff|\bsungai\b|\baliran\b|banjir|danau/i, judul: /sungai|limpasan|aliran|danau|banjir/i },
    { kunci: 'hemat',  uji: /hemat|konservasi|pencemaran|polusi|dampak|menjaga/i, judul: /hemat|menjaga|pencemaran|polusi|dampak/i },
    { kunci: 'siklus', uji: /\bsiklus\b|\bdaur\b|berulang/i, judul: /siklus|daur|berulang/i }
  ];

  function pilih(butir){
    if(!butir) return 'default';
    // jenis eksplisit di data bab selalu menang
    if(butir.visual) return butir.visual;

    var judul = String(butir.judul || '');
    var isi = [judul]
      .concat(butir.materi || [])
      .concat([butir.fakta || '', butir.salahKaprah || ''])
      .join(' ');

    var terbaik = null, skorTerbaik = 0;

    ATURAN.forEach(function(a, i){
      var s = 0;
      if(a.judul && a.judul.test(judul)) s += 4;
      // hitung kemunculan di seluruh teks, maksimal 3
      var m = isi.match(new RegExp(a.uji.source, 'gi'));
      if(m) s += Math.min(3, m.length);
      // aturan yang lebih awal menang bila skor sama-penting
      var nilai = s * 100 - i;
      if(s > 0 && nilai > skorTerbaik){ skorTerbaik = nilai; terbaik = a.kunci; }
    });

    return terbaik || 'default';
  }

  /* ---------- kanvas dasar ---------- */
  var WARNA = {
    langit: ['#CFE9FA', '#EAF6FE'],
    air: '#2A93C8',
    airTerang: '#64C8EE',
    tanah: ['#7A5A3A', '#9A6B48', '#B98A5E'],
    rumput: '#4FA53C',
    awan: '#FFFFFF',
    surya: '#FFC93C',
    tetes: '#3FA9DE',
    daun: '#2FA83A'
  };

  function kanvas(wadah, tinggi){
    var c = document.createElement('canvas');
    c.className = 'visual-kanvas';
    c.setAttribute('role', 'img');
    c.setAttribute('aria-label', 'Animasi penguat materi');
    c.width = 720;
    c.height = tinggi || 300;
    wadah.appendChild(c);
    return c;
  }

  /* latar langit + tanah dasar, dipakai beberapa jenis */
  function latarDasar(g, w, h, adaTanah){
    var lg = g.createLinearGradient(0, 0, 0, h);
    lg.addColorStop(0, WARNA.langit[0]);
    lg.addColorStop(1, WARNA.langit[1]);
    g.fillStyle = lg;
    g.fillRect(0, 0, w, h);

    if(adaTanah){
      var t = h * .62;
      g.fillStyle = WARNA.tanah[2];
      g.fillRect(0, t, w, h - t);
      g.fillStyle = WARNA.tanah[1];
      g.fillRect(0, t + (h - t) * .35, w, h);
      g.fillStyle = WARNA.rumput;
      g.fillRect(0, t - 6, w, 8);
    }
  }

  /* awan gumpal */
  function awan(g, x, y, s, alpha){
    g.save();
    g.globalAlpha = alpha == null ? .95 : alpha;
    g.fillStyle = WARNA.awan;
    var r = 26 * s;
    [[0,0,1],[.75,.16,.78],[-.8,.2,.68],[.2,-.42,.6],[-.32,-.34,.52]].forEach(function(o){
      g.beginPath();
      g.arc(x + o[0]*r, y + o[1]*r, r*o[2], 0, 6.2832);
      g.fill();
    });
    g.restore();
  }

  function tetes(g, x, y, len, alpha){
    g.save();
    g.globalAlpha = alpha == null ? .85 : alpha;
    g.strokeStyle = WARNA.tetes;
    g.lineWidth = 2.6;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x - 2, y + len);
    g.stroke();
    g.restore();
  }

  /* ---------- penggambar per jenis ---------- */
  var GAMBAR = {

    /* HUJAN — awan gelap, tetes, tanah menyerap, limpasan ke tepi */
    hujan: function(g, w, h, t){
      latarDasar(g, w, h, true);
      var tanahY = h * .62;

      /* Awan hujan dibuat GELAP: awan putih membuat siswa bingung,
         karena hujan turun dari awan mendung, bukan awan cerah. */
      function awanHujan(x, y, s, alpa){
        g.save();
        g.globalAlpha = alpa;
        g.fillStyle = '#6B8296';
        var r = 26 * s;
        [[0,0,1],[.75,.16,.78],[-.8,.2,.68],[.2,-.42,.6],[-.32,-.34,.52]].forEach(function(o){
          g.beginPath();
          g.arc(x + o[0]*r, y + o[1]*r, r*o[2], 0, 6.2832);
          g.fill();
        });
        // perut awan lebih gelap
        g.globalAlpha = alpa * .85;
        g.fillStyle = '#4C6274';
        g.beginPath();
        g.ellipse(x, y + r * .55, r * 1.05, r * .38, 0, 0, 6.2832);
        g.fill();
        g.restore();
      }

      awanHujan(w * .5 + Math.sin(t * .5) * 8, h * .16, 1.5, .97);
      awanHujan(w * .22 + Math.sin(t * .4 + 2) * 6, h * .12, .9, .82);
      awanHujan(w * .8 + Math.sin(t * .45 + 1) * 6, h * .14, 1, .86);

      // tetes jatuh DARI awan SAMPAI tanah (menyambung, tidak menggantung)
      for(var i = 0; i < 30; i++){
        var fx = w * .14 + (i * 37 % (w * .72));
        var fase = (t * .6 + i * .117) % 1;
        var awal = h * .29;
        var fy = awal + fase * (tanahY - awal);
        var panjang = 9 + fase * 5;
        tetes(g, fx, fy, panjang, .45 + fase * .45);
      }

      // genangan DI ATAS tanah (bukan di bawah permukaan)
      g.save();
      g.globalAlpha = .42;
      g.fillStyle = WARNA.air;
      g.beginPath();
      g.ellipse(w * .5, tanahY - 1, w * .28 + Math.sin(t) * 8, 5, 0, 0, 6.2832);
      g.fill();
      g.restore();

      // bulir air masuk ke lapisan tanah, dimulai tepat di permukaan
      for(var j = 0; j < 14; j++){
        var px = w * .22 + (j * 53 % (w * .56));
        var f2 = (t * .45 + j * .17) % 1;
        var py = tanahY + 2 + f2 * (h - tanahY - 18);
        g.save();
        g.globalAlpha = .65 * (1 - f2 * .45);
        g.fillStyle = WARNA.airTerang;
        g.beginPath();
        g.arc(px, py, 2.8 - f2 * .8, 0, 6.2832);
        g.fill();
        g.restore();
      }

      // limpasan ke tepi (menuju laut) — kurva, bukan garis lurus
      g.save();
      g.strokeStyle = WARNA.air;
      g.lineWidth = 4;
      g.globalAlpha = .6;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(w * .62, tanahY + 1);
      g.bezierCurveTo(w * .74, tanahY + 8, w * .82, tanahY + 22, w * .95, tanahY + 40);
      g.stroke();
      g.restore();

      // panah kecil di ujung limpasan
      g.save();
      g.globalAlpha = .6;
      g.fillStyle = WARNA.air;
      g.beginPath();
      g.moveTo(w * .95, tanahY + 44);
      g.lineTo(w * .925, tanahY + 33);
      g.lineTo(w * .965, tanahY + 35);
      g.closePath();
      g.fill();
      g.restore();
    },

    /* UAP — air memanas, uap naik, mengembun */
    uap: function(g, w, h, t){
      latarDasar(g, w, h, true);
      var airY = h * .72;

      // panci/wadah air
      g.fillStyle = '#2A93C8';
      g.beginPath();
      g.moveTo(w * .24, airY);
      g.lineTo(w * .76, airY);
      g.lineTo(w * .70, h * .96);
      g.lineTo(w * .30, h * .96);
      g.closePath();
      g.fill();

      // garis gelombang permukaan air
      g.strokeStyle = 'rgba(255,255,255,.7)';
      g.lineWidth = 2;
      for(var k = 0; k < 3; k++){
        g.beginPath();
        for(var x = w * .28; x < w * .72; x += 6){
          var y = airY + 4 + k * 7 + Math.sin(x * .06 + t * 2.5 + k) * 2.4;
          if(x === w * .28) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.stroke();
      }

      // uap naik & melengkung
      for(var i = 0; i < 16; i++){
        var fase = (t * .32 + i * .111) % 1;
        var ux = w * (.30 + (i % 5) * .1) + Math.sin(fase * 6 + i) * 16 * fase;
        var uy = airY - fase * (airY - h * .08);
        g.save();
        g.globalAlpha = Math.sin(fase * Math.PI) * .55;
        g.fillStyle = '#E8F6FF';
        g.beginPath();
        g.arc(ux, uy, 4 + fase * 9, 0, 6.2832);
        g.fill();
        g.restore();
      }

      // awan hasil pengembunan di atas
      awan(g, w * .5, h * .11, 1.15, .35 + Math.sin(t * .8) * .15);

      // matahari memanaskan
      g.save();
      g.fillStyle = WARNA.surya;
      g.globalAlpha = .9;
      g.beginPath();
      g.arc(w * .87, h * .16, 20, 0, 6.2832);
      g.fill();
      g.restore();
      // sinar
      g.save();
      g.strokeStyle = 'rgba(255,201,60,.7)';
      g.lineWidth = 3;
      for(var s = 0; s < 8; s++){
        var a = s * .785 + t * .3;
        g.beginPath();
        g.moveTo(w * .87 + Math.cos(a) * 26, h * .16 + Math.sin(a) * 26);
        g.lineTo(w * .87 + Math.cos(a) * 38, h * .16 + Math.sin(a) * 38);
        g.stroke();
      }
      g.restore();
    },

    /* SERAP — penampang tanah, air meresap lapis demi lapis */
    serap: function(g, w, h, t){
      latarDasar(g, w, h, false);

      var atas = h * .12;
      // lapisan: humus, topsoil, subsoil, batuan
      var lapis = [
        { y: atas,              hh: (h - atas) * .18, c: '#4A2F1C', n: 'Humus' },
        { y: atas + (h-atas)*.18, hh: (h - atas) * .24, c: '#6B452B', n: 'Tanah atas' },
        { y: atas + (h-atas)*.42, hh: (h - atas) * .28, c: '#9A6B48', n: 'Tanah bawah' },
        { y: atas + (h-atas)*.70, hh: (h - atas) * .30, c: '#7C8A94', n: 'Batuan' }
      ];
      lapis.forEach(function(l){
        g.fillStyle = l.c;
        g.fillRect(0, l.y, w, l.hh);
        g.save();
        g.fillStyle = 'rgba(255,255,255,.55)';
        g.font = 'bold 14.5px system-ui, sans-serif';
        g.fillText(l.n, 10, l.y + 15);
        g.restore();
      });
      g.fillStyle = WARNA.rumput;
      g.fillRect(0, atas - 7, w, 8);

      // permukaan air tergenang
      g.save();
      g.globalAlpha = .55;
      g.fillStyle = WARNA.air;
      g.beginPath();
      g.ellipse(w * .5, atas - 2, w * .34 + Math.sin(t) * 8, 6, 0, 0, 6.2832);
      g.fill();
      g.restore();

      // bulir air turun menembus lapisan (makin dalam makin lambat)
      for(var i = 0; i < 20; i++){
        var px = w * .18 + (i * 71 % (w * .64));
        var fase = (t * .22 + i * .097) % 1;
        var py = atas + 4 + fase * (h - atas - 14);
        var alpa = .75 - fase * .35;
        g.save();
        g.globalAlpha = alpa;
        g.fillStyle = WARNA.airTerang;
        g.beginPath();
        g.arc(px, py, 2.4 + (1 - fase) * 1.6, 0, 6.2832);
        g.fill();
        g.restore();
      }

      // pita air tanah (akuifer) berdenyut
      var ay = atas + (h - atas) * .66;
      g.save();
      g.globalAlpha = .4 + Math.sin(t * 1.1) * .12;
      g.fillStyle = WARNA.air;
      g.fillRect(0, ay, w, 16);
      g.restore();

      // panah resapan
      g.save();
      g.strokeStyle = 'rgba(255,255,255,.75)';
      g.lineWidth = 2.4;
      g.lineCap = 'round';
      for(var a = 0; a < 3; a++){
        var ax = w * (.3 + a * .2);
        var ay2 = atas + 24 + ((t * 40 + a * 30) % ((h - atas) * .5));
        g.beginPath();
        g.moveTo(ax, ay2);
        g.lineTo(ax, ay2 + 12);
        g.moveTo(ax - 5, ay2 + 7);
        g.lineTo(ax, ay2 + 12);
        g.lineTo(ax + 5, ay2 + 7);
        g.stroke();
      }
      g.restore();
    },

    /* SIKLUS — diagram 4 tahap berputar */
    siklus: function(g, w, h, t){
      latarDasar(g, w, h, false);

      var cx = w / 2, cy = h / 2 + 4;
      var R = Math.min(w, h) * .32;

      // cincin
      g.save();
      g.strokeStyle = 'rgba(42,147,200,.3)';
      g.lineWidth = 14;
      g.beginPath();
      g.arc(cx, cy, R, 0, 6.2832);
      g.stroke();
      g.restore();

      // bagian berjalan: busur berputar
      g.save();
      g.strokeStyle = WARNA.air;
      g.lineWidth = 6;
      g.lineCap = 'round';
      g.beginPath();
      g.arc(cx, cy, R, t * .9, t * .9 + 1.1);
      g.stroke();
      g.restore();

      var tahap = [
        { n: '1', l: 'Penguapan',   c: '#2A93C8' },
        { n: '2', l: 'Pengembunan', c: '#7EC3E8' },
        { n: '3', l: 'Presipitasi', c: '#3FA9DE' },
        { n: '4', l: 'Aliran',      c: '#2E8B57' }
      ];

      tahap.forEach(function(s, i){
        var a = i / 4 * 6.2832 - Math.PI / 2 + t * .25;
        var x = cx + Math.cos(a) * R;
        var y = cy + Math.sin(a) * R;

        g.save();
        g.fillStyle = s.c;
        g.beginPath();
        g.arc(x, y, 21, 0, 6.2832);
        g.fill();
        g.fillStyle = '#fff';
        g.font = 'bold 16px system-ui, sans-serif';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(s.n, x, y + 1);
        g.textAlign = 'start';
        g.textBaseline = 'alphabetic';
        g.restore();

        // label di luar cincin
        var lx = cx + Math.cos(a) * (R + 42);
        var ly = cy + Math.sin(a) * (R + 42);
        g.save();
        g.fillStyle = 'rgba(20,49,74,.82)';
        g.font = 'bold 13.5px system-ui, sans-serif';
        g.textAlign = 'center';
        g.fillText(s.l, lx, ly);
        g.textAlign = 'start';
        g.restore();
      });

      // inti
      g.save();
      g.fillStyle = 'rgba(255,255,255,.9)';
      g.beginPath();
      g.arc(cx, cy, R * .38, 0, 6.2832);
      g.fill();
      g.fillStyle = '#14314A';
      g.font = 'bold 15px system-ui, sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('SIKLUS', cx, cy - 8);
      g.fillText('AIR', cx, cy + 10);
      g.textAlign = 'start';
      g.textBaseline = 'alphabetic';
      g.restore();
    },

    /* SUNGAI — dari gunung ke laut */
    sungai: function(g, w, h, t){
      latarDasar(g, w, h, false);

      // gunung
      g.save();
      g.fillStyle = '#7C8A94';
      g.beginPath();
      g.moveTo(w * .05, h * .68);
      g.lineTo(w * .22, h * .18);
      g.lineTo(w * .40, h * .68);
      g.closePath();
      g.fill();
      g.fillStyle = '#fff';
      g.beginPath();
      g.moveTo(w * .22, h * .18);
      g.lineTo(w * .28, h * .33);
      g.lineTo(w * .16, h * .33);
      g.closePath();
      g.fill();
      g.restore();

      // daratan
      g.fillStyle = '#4FA53C';
      g.beginPath();
      g.moveTo(0, h * .68);
      g.bezierCurveTo(w * .3, h * .6, w * .5, h * .72, w, h * .66);
      g.lineTo(w, h);
      g.lineTo(0, h);
      g.closePath();
      g.fill();

      // laut
      g.save();
      g.fillStyle = '#1E7FC4';
      g.beginPath();
      g.moveTo(w * .72, h * .7);
      g.bezierCurveTo(w * .82, h * .68, w * .92, h * .72, w, h * .70);
      g.lineTo(w, h);
      g.lineTo(w * .72, h);
      g.closePath();
      g.fill();
      g.globalAlpha = .4;
      g.strokeStyle = '#fff';
      g.lineWidth = 2;
      for(var i = 0; i < 4; i++){
        var yy = h * .78 + i * 12;
        g.beginPath();
        for(var x = w * .74; x < w; x += 8){
          var y = yy + Math.sin(x * .08 + t * 2 + i) * 2.4;
          if(x === w * .74) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.stroke();
      }
      g.restore();

      // aliran sungai berkelok
      g.save();
      g.strokeStyle = WARNA.air;
      g.lineWidth = 13;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(w * .22, h * .34);
      g.bezierCurveTo(w * .30, h * .5, w * .46, h * .56, w * .52, h * .68);
      g.bezierCurveTo(w * .60, h * .80, w * .70, h * .78, w * .80, h * .80);
      g.stroke();
      g.restore();

      // riak bergerak menyusuri sungai
      g.save();
      g.globalAlpha = .8;
      g.strokeStyle = '#DFF6FF';
      g.lineWidth = 3;
      g.setLineDash([9, 15]);
      g.lineDashOffset = -t * 42;
      g.beginPath();
      g.moveTo(w * .22, h * .34);
      g.bezierCurveTo(w * .30, h * .5, w * .46, h * .56, w * .52, h * .68);
      g.bezierCurveTo(w * .60, h * .80, w * .70, h * .78, w * .80, h * .80);
      g.stroke();
      g.restore();
    },

    /* TANAH — tiga jenis menyerap berbeda cepat */
        tanah: function(g, w, h, t){
          latarDasar(g, w, h, false);

          var jenis = [
            { n: 'Pasir', c: '#D8C08A', laju: 1.0, ket: 'paling cepat' },
            { n: 'Lempung', c: '#8B6B45', laju: .55, ket: 'sedang' },
            { n: 'Liat', c: '#7A4F2E', laju: .26, ket: 'paling lambat' }
          ];
          /* Kolom diberi margin kiri-kanan supaya tepi tidak terpotong. */
          var tepi = 12;
          var kolomW = (w - tepi * 2) / 3;

          jenis.forEach(function(j, idx){
            var x0 = tepi + idx * kolomW;
            var atas = h * .26;

            // wadah tanah dengan sudut membulat, bukan kotak terpotong
            g.save();
            g.fillStyle = j.c;
            g.beginPath();
            g.roundRect(x0 + 7, atas, kolomW - 14, h * .60, 10);
            g.fill();
            g.fillStyle = 'rgba(0,0,0,.16)';
            g.beginPath();
            g.roundRect(x0 + 7, atas, kolomW - 14, 7, 4);
            g.fill();
            g.restore();

            // label jenis + kecepatan resapan
            g.save();
            g.fillStyle = '#14314A';
            g.font = 'bold 14.5px system-ui, sans-serif';
            g.textAlign = 'center';
            g.fillText(j.n, x0 + kolomW / 2, atas - 20);
            g.font = 'bold 11.5px system-ui, sans-serif';
            g.fillStyle = 'rgba(20,49,74,.62)';
            g.fillText(j.ket, x0 + kolomW / 2, atas - 6);
            g.textAlign = 'start';
            g.restore();

            // air meresap sesuai laju
            for(var i = 0; i < 9; i++){
              var px = x0 + 18 + (i * 31 % Math.max(20, kolomW - 34));
              var fase = (t * .28 * j.laju + i * .13) % 1;
              var py = atas + 10 + fase * (h * .60 - 22);
              g.save();
              g.globalAlpha = .85 - fase * .3;
              g.fillStyle = WARNA.airTerang;
              g.beginPath();
              g.arc(px, py, 3.2, 0, 6.2832);
              g.fill();
              g.restore();
            }

            // genangan di permukaan tanah
            g.save();
            g.globalAlpha = .5;
            g.fillStyle = WARNA.air;
            g.beginPath();
            g.ellipse(x0 + kolomW / 2, atas + 3, kolomW * .32, 5, 0, 0, 6.2832);
            g.fill();
            g.restore();
          });

          /* Keterangan titik air: tanpa ini pembaca menebak-nebak. */
          g.save();
          g.fillStyle = 'rgba(20,49,74,.7)';
          g.font = 'bold 11.5px system-ui, sans-serif';
          g.fillText('● = air yang meresap', tepi + 2, h * .955);
          g.restore();
        },

    /* POHON — transpirasi dari akar ke daun */
    pohon: function(g, w, h, t){
      latarDasar(g, w, h, true);
      var tanahY = h * .74;
      var px = w * .5;

      // batang
      g.fillStyle = '#6B4728';
      g.fillRect(px - 11, h * .36, 22, tanahY - h * .36);

      // akar
      g.strokeStyle = '#6B4728';
      g.lineWidth = 6;
      g.lineCap = 'round';
      [-1, 1].forEach(function(s){
        g.beginPath();
        g.moveTo(px, tanahY - 6);
        g.quadraticCurveTo(px + s * 30, tanahY + 6, px + s * 52, tanahY + 26);
        g.stroke();
      });

      // tajuk
      var tajuk = [
        { x: px, y: h * .26, r: 46 },
        { x: px - 40, y: h * .33, r: 34 },
        { x: px + 40, y: h * .33, r: 34 },
        { x: px, y: h * .18, r: 32 }
      ];
      tajuk.forEach(function(o){
        g.fillStyle = WARNA.daun;
        g.beginPath();
        g.arc(o.x + Math.sin(t * 1.1 + o.x) * 2.2, o.y, o.r, 0, 6.2832);
        g.fill();
      });

      // bulir air naik dari akar ke daun (xilem)
      for(var i = 0; i < 10; i++){
        var fase = (t * .38 + i * .1) % 1;
        var y = tanahY - fase * (tanahY - h * .24);
        var x = px + Math.sin(fase * 5 + i) * 4;
        g.save();
        g.globalAlpha = .85 - fase * .4;
        g.fillStyle = WARNA.airTerang;
        g.beginPath();
        g.arc(x, y, 2.6, 0, 6.2832);
        g.fill();
        g.restore();
      }

      // uap keluar dari tajuk
      for(var j = 0; j < 12; j++){
        var f2 = (t * .3 + j * .12) % 1;
        var ux = px + (j % 4 - 1.5) * 26 + Math.sin(f2 * 6 + j) * 12 * f2;
        var uy = h * .2 - f2 * h * .18;
        g.save();
        g.globalAlpha = Math.sin(f2 * Math.PI) * .5;
        g.fillStyle = '#E8F6FF';
        g.beginPath();
        g.arc(ux, uy, 3 + f2 * 8, 0, 6.2832);
        g.fill();
        g.restore();
      }

      // akar menyerap air tanah
      g.save();
      g.globalAlpha = .32;
      g.fillStyle = WARNA.air;
      g.fillRect(0, tanahY + 30, w, h - tanahY - 30);
      g.restore();
    },

    /* WUJUD — tiga wujud air: padat, cair, gas */
    wujud: function(g, w, h, t){
      latarDasar(g, w, h, false);

      var kotak = [
        { n: 'PADAT', sub: 'Es',      y: .5, c: '#BFE6FA' },
        { n: 'CAIR',  sub: 'Air',     y: .5, c: '#2A93C8' },
        { n: 'GAS',   sub: 'Uap air', y: .5, c: '#D9EEFA' }
      ];
      var kolomW = w / 3;

      kotak.forEach(function(k, idx){
        var x0 = idx * kolomW;
        // wadah
        g.save();
        g.fillStyle = 'rgba(255,255,255,.55)';
        g.strokeStyle = 'rgba(42,147,200,.4)';
        g.lineWidth = 2;
        g.beginPath();
        g.roundRect(x0 + 14, h * .2, kolomW - 28, h * .56, 12);
        g.fill();
        g.stroke();
        g.restore();

        var cx = x0 + kolomW / 2;

        if(idx === 0){
          // es: balok kristal
          g.save();
          g.fillStyle = k.c;
          g.strokeStyle = 'rgba(255,255,255,.9)';
          g.lineWidth = 2;
          g.beginPath();
          g.roundRect(cx - 34, h * .40, 68, 58, 8);
          g.fill(); g.stroke();
          // retak kristal
          g.beginPath();
          g.moveTo(cx - 20, h * .43); g.lineTo(cx + 8, h * .55);
          g.moveTo(cx + 22, h * .42); g.lineTo(cx - 4, h * .58);
          g.strokeStyle = 'rgba(255,255,255,.6)';
          g.stroke();
          g.restore();
        } else if(idx === 1){
          // air: gelombang mengisi wadah
          g.save();
          g.fillStyle = k.c;
          g.globalAlpha = .85;
          g.beginPath();
          g.moveTo(x0 + 16, h * .48);
          for(var x = x0 + 16; x <= x0 + kolomW - 16; x += 5){
            g.lineTo(x, h * .48 + Math.sin(x * .07 + t * 2) * 3);
          }
          g.lineTo(x0 + kolomW - 16, h * .74);
          g.lineTo(x0 + 16, h * .74);
          g.closePath();
          g.fill();
          g.restore();
        } else {
          // gas: bulir uap naik bebas
          for(var i = 0; i < 12; i++){
            var f = ((t * .34 + i * .13) % 1);
            var px = cx + Math.sin(i * 2.1 + f * 4) * 26;
            var py = h * .72 - f * (h * .44);
            g.save();
            g.globalAlpha = Math.sin(f * Math.PI) * .68;
            g.fillStyle = '#8FD0EC';
            g.beginPath();
            g.arc(px, py, 3 + f * 5, 0, 6.2832);
            g.fill();
            g.restore();
          }
        }

        // label
        g.save();
        g.fillStyle = 'rgba(20,49,74,.9)';
        g.font = 'bold 14.5px system-ui, sans-serif';
        g.textAlign = 'center';
        g.fillText(k.n, cx, h * .86);
        g.font = '12.5px system-ui, sans-serif';
        g.fillStyle = 'rgba(20,49,74,.6)';
        g.fillText(k.sub, cx, h * .92);
        g.textAlign = 'start';
        g.restore();
      });

      // panah antar wadah
      g.save();
      g.strokeStyle = 'rgba(42,147,200,.55)';
      g.lineWidth = 2.4;
      g.setLineDash([5, 5]);
      g.lineDashOffset = -t * 18;
      [kolomW, kolomW * 2].forEach(function(x){
        g.beginPath();
        g.moveTo(x - 10, h * .46);
        g.lineTo(x + 10, h * .46);
        g.stroke();
      });
      g.restore();
    },

    /* HEMAT — dua keadaan berdampingan: boros vs hemat */
    hemat: function(g, w, h, t){
      latarDasar(g, w, h, false);

      var kiriX = w * .27, kananX = w * .73;
      var kepalaY = h * .30;

      /* ---------- KIRI: keran terbuka, air terbuang ---------- */
      g.save();
      // keran
      g.strokeStyle = '#8FA1AE';
      g.lineWidth = 9;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(kiriX - 26, kepalaY);
      g.lineTo(kiriX, kepalaY);
      g.lineTo(kiriX, kepalaY + 22);
      g.stroke();

      // air mengalir terbuang, jatuh ke lantai
      g.globalAlpha = .85;
      g.strokeStyle = WARNA.tetes;
      g.lineWidth = 5;
      g.setLineDash([9, 11]);
      g.lineDashOffset = -t * 60;
      g.beginPath();
      g.moveTo(kiriX, kepalaY + 26);
      g.lineTo(kiriX, h * .88);
      g.stroke();
      g.setLineDash([]);

      // cipratan di lantai
      g.globalAlpha = .55;
      g.fillStyle = WARNA.air;
      g.beginPath();
      g.ellipse(kiriX, h * .89, 30 + Math.sin(t * 2) * 5, 6, 0, 0, 6.2832);
      g.fill();
      g.restore();

      // tanda silang merah
      g.save();
      g.strokeStyle = '#E05C6E';
      g.lineWidth = 7;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(kiriX - 62, kepalaY - 30);
      g.lineTo(kiriX - 38, kepalaY - 6);
      g.moveTo(kiriX - 38, kepalaY - 30);
      g.lineTo(kiriX - 62, kepalaY - 6);
      g.stroke();
      g.restore();

      /* ---------- KANAN: keran ditutup, air ditampung ---------- */
      g.save();
      g.strokeStyle = '#8FA1AE';
      g.lineWidth = 9;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(kananX - 26, kepalaY);
      g.lineTo(kananX, kepalaY);
      g.stroke();
      g.restore();

      // ember menampung
      g.save();
      g.fillStyle = '#C8D6E0';
      g.beginPath();
      g.moveTo(kananX - 30, h * .62);
      g.lineTo(kananX + 30, h * .62);
      g.lineTo(kananX + 23, h * .88);
      g.lineTo(kananX - 23, h * .88);
      g.closePath();
      g.fill();
      // air di ember naik-turun
      var isi = .10 + (Math.sin(t * .55) * .5 + .5) * .12;
      g.fillStyle = WARNA.air;
      g.fillRect(kananX - 25, h * (.88 - isi), 50, h * isi);
      g.restore();

      // tanda centang hijau
      g.save();
      g.strokeStyle = '#3BB273';
      g.lineWidth = 7;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.beginPath();
      g.moveTo(kananX - 62, kepalaY - 16);
      g.lineTo(kananX - 50, kepalaY - 4);
      g.lineTo(kananX - 30, kepalaY - 32);
      g.stroke();
      g.restore();

      /* ---------- label bawah ---------- */
      g.save();
      g.textAlign = 'center';
      g.fillStyle = '#B33A4E';
      g.font = 'bold 14px system-ui, sans-serif';
      g.fillText('Dibiarkan terbuka', kiriX, h * .965);
      g.fillStyle = '#227A4C';
      g.fillText('Ditutup, air ditampung', kananX, h * .965);
      g.textAlign = 'start';
      g.restore();
    },

    /* AWAN — tiga jenis awan dengan uap yang membentuknya */
    awan: function(g, w, h, t){
      latarDasar(g, w, h, false);

      /* Awan putih di atas langit terang nyaris tak terlihat.
         Ditambah bayangan bawah supaya bentuknya terbaca. */
      function awanJenis(x, y, s, jenis){
        g.save();
        var r = 24 * s;
        g.fillStyle = '#FFFFFF';
        g.strokeStyle = '#A9C4D8';
        g.lineWidth = 1.6;
        if(jenis === 'stratus'){
          // pipih memanjang
          g.beginPath();
          g.roundRect(x - r * 2.1, y - r * .34, r * 4.2, r * .78, r * .4);
          g.fill(); g.stroke();
          g.beginPath();
          g.roundRect(x - r * 1.5, y + r * .3, r * 3.0, r * .52, r * .3);
          g.fill(); g.stroke();
        } else if(jenis === 'sirus'){
          // serat tipis menyapu
          g.strokeStyle = '#FFFFFF';
          g.lineWidth = 3.4;
          g.lineCap = 'round';
          for(var i = 0; i < 4; i++){
            g.beginPath();
            g.moveTo(x - r * 1.9, y + i * r * .30);
            g.quadraticCurveTo(x, y - r * .30 + i * r * .22, x + r * 2.0, y + i * r * .30 - r * .14);
            g.stroke();
          }
        } else {
          // kumulus: gumpalan padat
          [[0,0,1],[.78,.16,.76],[-.8,.2,.66],[.24,-.46,.62],[-.34,-.38,.54]].forEach(function(o){
            g.beginPath();
            g.arc(x + o[0]*r, y + o[1]*r, r*o[2], 0, 6.2832);
            g.fill(); g.stroke();
          });
        }
        g.restore();
      }

      var jenis = [
        { k: 'sirus',   n: 'Sirus',   y: .26, s: .85 },
        { k: 'kumulus', n: 'Kumulus', y: .50, s: 1.15 },
        { k: 'stratus', n: 'Stratus', y: .76, s: 1.0 }
      ];

      jenis.forEach(function(j, i){
        var x = w * .5 + Math.sin(t * .35 + i * 1.2) * 16;
        awanJenis(x, h * j.y, j.s, j.k);
        // label di kiri, tidak menimpa awan
        g.save();
        g.fillStyle = '#14314A';
        g.font = 'bold 14px system-ui, sans-serif';
        g.fillText(j.n, 16, h * j.y + 5);
        g.restore();
      });

      // uap naik di sisi kanan, membentuk awan
      for(var i2 = 0; i2 < 16; i2++){
        var f = (t * .28 + i2 * .09) % 1;
        var ux = w * .88 + Math.sin(f * 5 + i2) * 14 * f;
        var uy = h * .96 - f * h * .5;
        g.save();
        g.globalAlpha = Math.sin(f * Math.PI) * .5;
        g.fillStyle = '#8FD0EC';
        g.beginPath();
        g.arc(ux, uy, 3 + f * 7, 0, 6.2832);
        g.fill();
        g.restore();
      }

      // panah uap -> awan
      g.save();
      g.strokeStyle = 'rgba(42,147,200,.45)';
      g.lineWidth = 2.4;
      g.setLineDash([5, 6]);
      g.beginPath();
      g.moveTo(w * .88, h * .58);
      g.lineTo(w * .70, h * .30);
      g.stroke();
      g.restore();
    },

    /* DEFAULT — tetes berdenyut dengan cincin */
    default: function(g, w, h, t){
      latarDasar(g, w, h, false);
      var cx = w / 2, cy = h / 2;
      var denyut = 1 + Math.sin(t * 1.6) * .06;

      // cincin
      for(var i = 0; i < 3; i++){
        var f = ((t * .32 + i * .33) % 1);
        g.save();
        g.globalAlpha = (1 - f) * .4;
        g.strokeStyle = WARNA.air;
        g.lineWidth = 3;
        g.beginPath();
        g.arc(cx, cy, 30 + f * 90, 0, 6.2832);
        g.stroke();
        g.restore();
      }

      // bentuk tetes
      g.save();
      g.fillStyle = WARNA.air;
      g.beginPath();
      var R = 30 * denyut;
      g.moveTo(cx, cy - R * 1.7);
      g.bezierCurveTo(cx + R * 1.05, cy - R * .1, cx + R, cy + R * .85, cx, cy + R);
      g.bezierCurveTo(cx - R, cy + R * .85, cx - R * 1.05, cy - R * .1, cx, cy - R * 1.7);
      g.fill();
      // kilau
      g.globalAlpha = .55;
      g.fillStyle = '#fff';
      g.beginPath();
      g.ellipse(cx - R * .3, cy + R * .1, R * .22, R * .32, -.4, 0, 6.2832);
      g.fill();
      g.restore();
    }
  };

  /* ---------- pasang panel ---------- */
  function buat(jenis, wadah, judul){
    if(!wadah) return null;
    var gambar = GAMBAR[jenis] || GAMBAR.default;

    var panel = document.createElement('figure');
    panel.className = 'visual-panel';
    panel.setAttribute('data-visual', jenis);

    var c = kanvas(panel);
    var g = c.getContext('2d');
    if(!g) return null;

    var ket = document.createElement('figcaption');
    ket.className = 'visual-ket';
    ket.textContent = judul || LABEL[jenis] || 'Ilustrasi proses';
    panel.appendChild(ket);

    wadah.appendChild(panel);

    var kurangi = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var jalan = true, raf = null, t0 = performance.now();
    var terlihat = true;

    // ukur ulang agar tajam di layar Retina
    function ukur(){
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var lebar = panel.clientWidth || 720;
      var tinggi = Math.max(200, Math.round(lebar * .42));
      c.width = Math.round(lebar * dpr);
      c.height = Math.round(tinggi * dpr);
      c.style.width = lebar + 'px';
      c.style.height = tinggi + 'px';
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w: lebar, h: tinggi };
    }

    var dim = ukur();

    /* Lukis SATU bingkai secara sinkron. Tanpa ini kanvas kosong bila
       requestAnimationFrame tidak berjalan (tab di latar, atau
       prefers-reduced-motion). */
    g.clearRect(0, 0, dim.w, dim.h);
    gambar(g, dim.w, dim.h, 0);

    function lukis(ts){
      if(!jalan) return;
      raf = requestAnimationFrame(lukis);
      if(!terlihat) return;
      var t = ((ts - t0) / 1000) * (kurangi ? .25 : 1);
      g.clearRect(0, 0, dim.w, dim.h);
      gambar(g, dim.w, dim.h, t);
    }
    if(!kurangi) raf = requestAnimationFrame(lukis);

    if('ResizeObserver' in window){
      /* Jebakan: ukur() mengubah width/height kanvas, yang memicu
         ResizeObserver lagi -> "loop completed with undelivered
         notifications". Dijaga: hanya ukur ulang bila lebar panel
         benar-benar berubah, dan ukur di frame berikutnya. */
      var lebarTerakhir = panel.clientWidth;
      var penundaUkur = null;
      var ro = new ResizeObserver(function(){
        var w2 = panel.clientWidth;
        if(Math.abs(w2 - lebarTerakhir) < 2) return;
        lebarTerakhir = w2;
        clearTimeout(penundaUkur);
        penundaUkur = setTimeout(function(){
          dim = ukur();
          g.clearRect(0, 0, dim.w, dim.h);
          gambar(g, dim.w, dim.h, 0);
        }, 120);
      });
      ro.observe(panel);
    }
    if('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(en){
        terlihat = en[0].isIntersecting;
      }, { threshold: 0 });
      io.observe(panel);
    }

    return panel;
  }

  var LABEL = {
    hujan: 'Hujan turun, air meresap dan mengalir ke laut',
    uap: 'Air dipanaskan Matahari lalu naik sebagai uap',
    wujud: 'Tiga wujud air: padat, cair, dan gas',
    serap: 'Air meresap melewati lapisan tanah',
    siklus: 'Empat tahap siklus air berulang',
    sungai: 'Air mengalir dari gunung menuju laut',
    tanah: 'Tiga jenis tanah, tiga kecepatan resapan',
    pohon: 'Tumbuhan mengeluarkan uap lewat daun',
    hemat: 'Membuka dan menutup keran menghemat air',
    awan: 'Uap mengembun membentuk awan',
    default: 'Air bergerak sepanjang siklus'
  };

  window.QIIORA.visual = {
    pilih: pilih,
    buat: buat,
    jenis: Object.keys(GAMBAR),
    label: function(k){ return LABEL[k] || LABEL.default; }
  };
})();