/* ============================================================
   QIIORA — Latar pemandangan hidup (G3)

   Menggantikan latar abstrak sebelumnya. Acuan visual:
   referensi latar 2 ("sangat suka") + 3 (tenda) + 4.

   Prinsip yang DIPERBAIKI dari versi lama:
   1. Bukan lagi "awan + gerimis yang diburamkan". Ini PEMANDANGAN
      UTUH: langit, matahari, awan, gunung bersalju, hutan pinus,
      danau beriak, batu, alang-alang, bunga, dan tenda.
   2. Kanvas `position:fixed` menutupi SELURUH layar dan digambar
      penuh — tidak dipudarkan jadi kabut. Isi halaman boleh
      menutupinya sebagian (kartu, panel), itu memang wajar.
   3. Danau berada di KAKI pemandangan dan mengalir sampai dasar
      halaman. Karena kanvas tetap (fixed) dan footer dibuat
      tembus, air terlihat menembus footer sampai baris terakhir.
   4. Semua digambar sendiri dengan Canvas 2D; tanpa berkas gambar.

   API (dipakai muat-boot.js dan pengaturan):
     QIIORA.latar.statistik() / setKualitas() / kualitas()
   ============================================================ */
(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};

  var KUNCI = 'kualitas-grafis';
  var PRESET = {
    rendah: { awan: 4, burung: 3,  riak: 16, dprMaks: 1,   fps: 30, bintang: 0 },
    sedang: { awan: 6, burung: 5,  riak: 26, dprMaks: 1.5, fps: 45, bintang: 0 },
    tinggi: { awan: 9, burung: 7,  riak: 38, dprMaks: 2,   fps: 60, bintang: 0 }
  };

  var wadah = null, kanvas = null, ctx = null;
  var lebar = 0, tinggi = 0, dpr = 1;
  var awan = [], burung = [], riak = [], bungaData = [], alangData = [];
  var jalan = false, raf = null, terakhir = 0, kurangiGerak = false;
  var kualitas = 'sedang', retak = null, tersembunyi = false, gelap = false;
  var bintang = [];

  function q(s){ return document.querySelector(s); }
  function simpan(){ return window.QIIORA.simpan || null; }

  function deteksi(){
    var inti = navigator.hardwareConcurrency || 4;
    var mem = navigator.deviceMemory || 4;
    if(window.matchMedia('(max-width: 640px)').matches || inti <= 4) return 'rendah';
    if(inti >= 8 && mem >= 8) return 'tinggi';
    return 'sedang';
  }

  function bacaKualitas(){
    var v = null;
    try{ v = simpan() ? simpan().ambil(KUNCI, null) : null; }catch(e){}
    if(v === 'rendah' || v === 'sedang' || v === 'tinggi') return v;
    return deteksi();
  }

  function preset(){ return PRESET[kualitas] || PRESET.sedang; }

  /* ---------- palet ---------- */
  function palet(){
    if(gelap){
      return {
        langitAtas: '#0A1A2A', langitBawah: '#204560',
        surya: '#FFD79A', suryaPendar: 'rgba(255,200,120,',
        awanTerang: '#3E5C74', awanGelap: '#2A4258', awanPerut: '#4E6C84',
        gunungGelap: '#1B3348', gunungTerang: '#2C4C66', salju: '#DCEBFA',
        hutanJauh: '#12283A', hutanDekat: '#0C1E2C',
        airAtas: '#1E5A78', airBawah: '#0A2C40', riakWarna: 'rgba(180,230,255,',
        batu: '#3E5566', batuTerang: '#55708496',
        rumput: '#1D5A3A', rumputTerang: '#2A7A4E'
      };
    }
    return {
      langitAtas: '#8FC9EE', langitBawah: '#DCEFFB',
      surya: '#FFF3C4', suryaPendar: 'rgba(255,233,160,',
      awanTerang: '#FFFFFF', awanGelap: '#D6E6F2', awanPerut: '#EAF4FB',
      gunungGelap: '#7E97AC', gunungTerang: '#A8BECD', salju: '#FFFFFF',
      hutanJauh: '#4E7A63', hutanDekat: '#2F5D46',
      airAtas: '#7FD4DE', airBawah: '#2C7C9E', riakWarna: 'rgba(255,255,255,',
      batu: '#8FA1AE', batuTerang: '#B4C4CF',
      rumput: '#4E9B48', rumputTerang: '#78C25C'
    };
  }

  /* ---------- pembuat objek ---------- */
  function buatAwan(n){
    awan = [];
    for(var i = 0; i < n; i++){
      awan.push({
        x: Math.random(),
        y: .05 + Math.random() * .30,
        s: .55 + Math.random() * 1.05,
        v: .0022 + Math.random() * .0042,
        alpa: .72 + Math.random() * .26,
        lapis: i % 3
      });
    }
  }

  function buatBurung(n){
    burung = [];
    for(var i = 0; i < n; i++){
      burung.push({
        x: Math.random(),
        y: .06 + Math.random() * .22,
        v: .009 + Math.random() * .013,
        s: .5 + Math.random() * .7,
        fase: Math.random() * 6.283
      });
    }
  }

  function buatRiak(n){
    riak = [];
    for(var i = 0; i < n; i++){
      riak.push({
        x: Math.random(),
        y: Math.random(),
        lebar: .04 + Math.random() * .10,
        v: .4 + Math.random() * .9,
        alpa: .12 + Math.random() * .3,
        fase: Math.random() * 6.283
      });
    }
  }

  function buatBunga(n){
    bungaData = [];
    for(var i = 0; i < n; i++){
      bungaData.push({
        x: Math.random(),
        s: .7 + Math.random() * .8,
        fase: Math.random() * 6.283,
        warna: ['#FFC857', '#FF8FB1', '#FFFFFF', '#C79BFF'][i % 4]
      });
    }
  }

  function buatAlang(n){
    alangData = [];
    for(var i = 0; i < n; i++){
      alangData.push({ x: Math.random(), s: .7 + Math.random() * .8, fase: Math.random() * 6.283 });
    }
  }

  /* ---------- geometri pemandangan ---------- */
  /* Semua posisi dihitung dari tinggi layar. Cakrawala (horizon)
     diletakkan ~58% tinggi: langit & gunung di atas, danau di bawah.
     Danau sengaja MELEWATI dasar layar supaya terasa menyambung
     dengan kaki halaman dan footer. */
  function horizon(){ return tinggi * .58; }
  /* Rumput tepi HANYA di sudut kiri & kanan. Di tengah, air
     turun sampai tepi bawah layar supaya footer benar-benar
     menyatu dengan danau (permintaan user). */
  /* kakiAir tidak lagi dipakai: danau digambar langsung sampai dasar
     layar (lihat gambarDanau) supaya air menyentuh tepi bawah. */

  /* ---------- langit + matahari ---------- */
  function gambarLangit(){
    var P = palet();
    var lg = ctx.createLinearGradient(0, 0, 0, horizon());
    lg.addColorStop(0, P.langitAtas);
    lg.addColorStop(.62, P.langitBawah);
    lg.addColorStop(1, gelap ? '#2B5470' : '#EFF8FE');
    ctx.fillStyle = lg;
    ctx.fillRect(0, 0, lebar, horizon() + 2);

    // matahari
    var sx = lebar * .72, sy = tinggi * .17, sr = Math.min(lebar, tinggi) * .055;
    var g2 = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 5.5);
    g2.addColorStop(0, P.suryaPendar + (gelap ? '.5' : '.85') + ')');
    g2.addColorStop(.35, P.suryaPendar + (gelap ? '.18' : '.32') + ')');
    g2.addColorStop(1, P.suryaPendar + '0)');
    ctx.fillStyle = g2;
    ctx.beginPath();
    ctx.arc(sx, sy, sr * 5.5, 0, 6.2832);
    ctx.fill();

    ctx.fillStyle = P.surya;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, 6.2832);
    ctx.fill();
  }

  /* ---------- awan bergaya ---------- */
  function gambarAwan(a, t){
    var P = palet();
    var x = ((a.x + t * a.v) % 1.25 - .12) * lebar;
    var y = a.y * tinggi;
    var r = 26 * a.s * (lebar / 900 + .55);

    ctx.save();
    ctx.globalAlpha = a.alpa;

    // perut awan hangat (khas referensi)
    ctx.fillStyle = P.awanPerut;
    ctx.beginPath();
    ctx.ellipse(x, y + r * .52, r * 1.9, r * .62, 0, 0, 6.2832);
    ctx.fill();

    // badan awan
    ctx.fillStyle = P.awanTerang;
    [[0,0,1],[.85,.18,.76],[-.85,.22,.66],[.28,-.52,.64],[-.36,-.42,.54],[1.45,.30,.5],[-1.45,.34,.44]]
      .forEach(function(o){
        ctx.beginPath();
        ctx.arc(x + o[0]*r, y + o[1]*r, r*o[2], 0, 6.2832);
        ctx.fill();
      });

    // bayangan bawah
    if(!gelap){
      ctx.globalAlpha = a.alpa * .5;
      ctx.fillStyle = P.awanGelap;
      ctx.beginPath();
      ctx.ellipse(x - r * .15, y + r * .66, r * 1.5, r * .38, 0, 0, 6.2832);
      ctx.fill();
    }
    ctx.restore();
  }

  /* ---------- burung ---------- */
  function gambarBurung(b, t){
    var x = ((b.x + t * b.v) % 1.2 - .1) * lebar;
    var y = b.y * tinggi + Math.sin(t * .8 + b.fase) * 7;
    var s = 9 * b.s;
    var kepak = Math.sin(t * 7 + b.fase) * .5;

    ctx.save();
    ctx.globalAlpha = gelap ? .55 : .5;
    ctx.strokeStyle = gelap ? '#BFD6E6' : '#2E4658';
    ctx.lineWidth = 2 * b.s;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + s * .55, y - s * (.45 + kepak), x + s * 1.15, y + s * .12);
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x - s * .55, y - s * (.45 + kepak), x - s * 1.15, y + s * .12);
    ctx.stroke();
    ctx.restore();
  }

  /* ---------- gunung bersalju ---------- */
  function gambarGunung(){
    var P = palet();
    var dasar = horizon() + 2;
    var puncakY = tinggi * .30;

    function satuGunung(cx, lebarG, tinggiG, gelapnya){
      var warna = gelapnya ? P.gunungGelap : P.gunungTerang;
      ctx.fillStyle = warna;
      ctx.beginPath();
      ctx.moveTo(cx - lebarG, dasar);
      ctx.lineTo(cx - lebarG * .34, dasar - tinggiG * .52);
      ctx.lineTo(cx - lebarG * .12, dasar - tinggiG * .84);
      ctx.lineTo(cx, dasar - tinggiG);
      ctx.lineTo(cx + lebarG * .16, dasar - tinggiG * .78);
      ctx.lineTo(cx + lebarG * .42, dasar - tinggiG * .48);
      ctx.lineTo(cx + lebarG, dasar);
      ctx.closePath();
      ctx.fill();

      // salju di puncak
      ctx.fillStyle = P.salju;
      ctx.beginPath();
      ctx.moveTo(cx, dasar - tinggiG);
      ctx.lineTo(cx - lebarG * .12, dasar - tinggiG * .84);
      ctx.lineTo(cx - lebarG * .06, dasar - tinggiG * .78);
      ctx.lineTo(cx - lebarG * .02, dasar - tinggiG * .84);
      ctx.lineTo(cx + lebarG * .05, dasar - tinggiG * .74);
      ctx.lineTo(cx + lebarG * .16, dasar - tinggiG * .78);
      ctx.closePath();
      ctx.fill();

      // bayangan sisi kanan
      ctx.save();
      ctx.globalAlpha = .22;
      ctx.fillStyle = gelap ? '#05131F' : '#4F6B80';
      ctx.beginPath();
      ctx.moveTo(cx, dasar - tinggiG);
      ctx.lineTo(cx + lebarG * .16, dasar - tinggiG * .78);
      ctx.lineTo(cx + lebarG * .42, dasar - tinggiG * .48);
      ctx.lineTo(cx + lebarG, dasar);
      ctx.lineTo(cx + lebarG * .06, dasar);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    satuGunung(lebar * .22, lebar * .26, (dasar - puncakY) * .74, true);
    satuGunung(lebar * .80, lebar * .24, (dasar - puncakY) * .68, true);
    satuGunung(lebar * .48, lebar * .34, dasar - puncakY, false);
    satuGunung(lebar * .64, lebar * .22, (dasar - puncakY) * .62, false);

    // kabut tipis di kaki gunung
    var kg = ctx.createLinearGradient(0, dasar - tinggi * .10, 0, dasar + 4);
    kg.addColorStop(0, gelap ? 'rgba(40,80,110,0)' : 'rgba(255,255,255,0)');
    kg.addColorStop(1, gelap ? 'rgba(40,80,110,.35)' : 'rgba(255,255,255,.55)');
    ctx.fillStyle = kg;
    ctx.fillRect(0, dasar - tinggi * .10, lebar, tinggi * .10 + 4);
  }

  /* ---------- hutan pinus ---------- */
  function gambarHutan(){
    var P = palet();
    var dasar = horizon() + 3;
    var tPohon = tinggi * .075;

    for(var baris = 0; baris < 2; baris++){
      ctx.fillStyle = baris === 0 ? P.hutanJauh : P.hutanDekat;
      ctx.globalAlpha = baris === 0 ? .78 : 1;
      var langkah = baris === 0 ? 13 : 9;
      var offs = baris === 0 ? 0 : 5;
      for(var x = -20 + offs; x < lebar + 30; x += langkah){
        /* variasi tiga lapis: tinggi acak halus + celah sesekali,
           supaya baris pohon tidak terlihat seperti gigi gergaji. */
        var acak = Math.abs(Math.sin(x * 12.9898) * 43758.5453) % 1;
        var ganjil = ((x * 7919) % 17) < 2 ? .45 : 1;
        var tng = tPohon * (baris === 0 ? .68 : 1) * (.62 + acak * .72) * ganjil;
        if(tng < 3) continue;
        ctx.beginPath();
        ctx.moveTo(x, dasar);
        ctx.lineTo(x - tng * .30, dasar);
        ctx.lineTo(x, dasar - tng);
        ctx.lineTo(x + tng * .30, dasar);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- danau ---------- */
  function gambarDanau(t){
    var P = palet();
    var atas = horizon() + 2;
    var bawah = tinggi + 2;

    var lg = ctx.createLinearGradient(0, atas, 0, bawah);
    lg.addColorStop(0, P.airAtas);
    lg.addColorStop(.55, gelap ? '#164A64' : '#3E9CB8');
    lg.addColorStop(1, P.airBawah);
    ctx.fillStyle = lg;
    ctx.fillRect(0, atas, lebar, bawah - atas);

    // pantulan gunung
        ctx.save();
        ctx.globalAlpha = .30;
        ctx.fillStyle = P.salju;
        for(var i = 0; i < 5; i++){
          var py = atas + i * (tinggi * .022);
          var wf = .22 - i * .03;
          ctx.fillRect(lebar * .48 - lebar * wf / 2, py, lebar * wf, 2.5);
        }
        ctx.restore();

        /* Bayangan gunung di air: bentuk segitiga terbalik yang memudar.
           Tanpa ini danau hanya terlihat seperti pita warna. */
        ctx.save();
        ctx.globalAlpha = gelap ? .18 : .26;
        ctx.fillStyle = P.gunungTerang;
        ctx.beginPath();
        ctx.moveTo(lebar * .48, atas);
        ctx.lineTo(lebar * .30, atas + tinggi * .10);
        ctx.lineTo(lebar * .40, atas + tinggi * .05);
        ctx.lineTo(lebar * .48, atas + tinggi * .13);
        ctx.lineTo(lebar * .58, atas + tinggi * .05);
        ctx.lineTo(lebar * .68, atas + tinggi * .11);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        /* Bayangan hutan di tepi air: pita gelap tipis tepat di bawah
           garis pantai, memberi kesan kedalaman. */
        ctx.save();
        var hg = ctx.createLinearGradient(0, atas, 0, atas + tinggi * .07);
        hg.addColorStop(0, gelap ? 'rgba(8,30,44,.55)' : 'rgba(30,90,70,.4)');
        hg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = hg;
        ctx.fillRect(0, atas, lebar, tinggi * .07);
        ctx.restore();

    // riak
    for(var r = 0; r < riak.length; r++){
      var k = riak[r];
      var ry = atas + 6 + ((k.y + t * k.v * .02) % 1) * (bawah - atas - 8);
      var rx = ((k.x + Math.sin(t * .25 + k.fase) * .012) % 1) * lebar;
      ctx.save();
      ctx.globalAlpha = k.alpa * (1 - (ry - atas) / (bawah - atas) * .45);
      ctx.strokeStyle = P.riakWarna + '1)';
      ctx.lineWidth = Math.max(1, 1.6 * (k.lebar * 12));
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + lebar * k.lebar, ry);
      ctx.stroke();
      ctx.restore();
    }

    // kilau matahari di air
    ctx.save();
    ctx.globalAlpha = gelap ? .18 : .34;
    var sg = ctx.createRadialGradient(lebar * .72, atas + 10, 0, lebar * .72, atas + 10, lebar * .22);
    sg.addColorStop(0, P.surya);
    sg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(lebar * .45, atas, lebar * .55, tinggi * .28);
    ctx.restore();
  }

  /* ---------- tepi depan ---------- */
  function gambarTepi(t){
    var P = palet();
    var dasar = tinggi + 4;

    /* Bukit rumput hanya di SUDUT. Tengahnya dibiarkan air sampai
       tepi bawah layar, jadi footer duduk di atas danau. */
    var kakiBukit = tinggi * .78;
    ctx.fillStyle = P.rumput;
    ctx.beginPath();
    ctx.moveTo(0, kakiBukit);
    ctx.bezierCurveTo(lebar * .07, kakiBukit - tinggi * .04, lebar * .12, kakiBukit + tinggi * .06, lebar * .17, dasar);
    ctx.lineTo(0, dasar);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(lebar, kakiBukit + tinggi * .01);
    ctx.bezierCurveTo(lebar * .93, kakiBukit - tinggi * .035, lebar * .88, kakiBukit + tinggi * .05, lebar * .83, dasar);
    ctx.lineTo(lebar, dasar);
    ctx.closePath();
    ctx.fill();

    // rumput terang
    ctx.save();
    ctx.globalAlpha = .5;
    ctx.fillStyle = P.rumputTerang;
    ctx.beginPath();
    ctx.moveTo(0, kakiBukit + tinggi * .005);
    ctx.bezierCurveTo(lebar * .07, kakiBukit - tinggi * .03, lebar * .11, kakiBukit + tinggi * .05, lebar * .155, dasar);
    ctx.lineTo(0, dasar);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // batu
    ctx.save();
    ctx.fillStyle = P.batu;
    ctx.beginPath();
    ctx.ellipse(lebar * .87, kakiBukit + tinggi * .070, lebar * .048, tinggi * .026, -.12, 0, 6.2832);
    ctx.fill();
    ctx.fillStyle = P.batuTerang;
    ctx.beginPath();
    ctx.ellipse(lebar * .860, kakiBukit + tinggi * .060, lebar * .028, tinggi * .014, -.2, 0, 6.2832);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.fillStyle = P.batu;
    ctx.beginPath();
    ctx.ellipse(lebar * .055, kakiBukit + tinggi * .085, lebar * .022, tinggi * .012, .1, 0, 6.2832);
    ctx.fill();
    ctx.restore();

    // alang
    alangData.forEach(function(a){
      var ax = a.x * lebar;
      // alang hanya di sudut kiri/kanan, tempat rumputnya
      if(ax > lebar * .13 && ax < lebar * .87) return;
      var ay = kakiBukit + tinggi * .095;
      var ayun = Math.sin(t * 1.3 + a.fase) * .10;
      ctx.save();
      ctx.strokeStyle = gelap ? '#2A6B4A' : '#2E7A4E';
      ctx.lineWidth = 2.4 * a.s;
      ctx.lineCap = 'round';
      ctx.globalAlpha = .75;
      for(var i = -1; i <= 1; i++){
        ctx.beginPath();
        ctx.moveTo(ax + i * 4 * a.s, ay);
        ctx.quadraticCurveTo(
          ax + i * 6 * a.s + ayun * 26, ay - tinggi * .032 * a.s,
          ax + i * 8 * a.s + ayun * 46, ay - tinggi * .055 * a.s);
        ctx.stroke();
      }
      ctx.restore();
    });

    // bunga
    bungaData.forEach(function(b){
      var bx = b.x * lebar;
      var diKiri = bx < lebar * .10;
      var diKanan = bx > lebar * .90;
      if(!diKiri && !diKanan) return;
      var by = kakiBukit + tinggi * (diKiri ? .085 : .090) + Math.sin(b.fase) * 3;
      var ayun = Math.sin(t * 1.6 + b.fase) * 2.2;
      ctx.save();
      ctx.fillStyle = b.warna;
      ctx.globalAlpha = .9;
      ctx.beginPath();
      ctx.arc(bx + ayun, by, 2.6 * b.s, 0, 6.2832);
      ctx.fill();
      ctx.restore();
    });

    // tenda
    var tx = lebar * .925, ty = kakiBukit + tinggi * .105;
    var tw = lebar * .075, th = tinggi * .075;
    ctx.save();
    ctx.globalAlpha = .95;
    ctx.fillStyle = gelap ? '#8A7A5E' : '#E4D3AE';
    ctx.beginPath();
    ctx.moveTo(tx, ty - th);
    ctx.lineTo(tx + tw, ty);
    ctx.lineTo(tx - tw, ty);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = gelap ? '#132C3C' : '#2A4356';
    ctx.beginPath();
    ctx.moveTo(tx, ty - th * .74);
    ctx.lineTo(tx + tw * .40, ty);
    ctx.lineTo(tx - tw * .40, ty);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = gelap ? 'rgba(220,235,250,.3)' : 'rgba(120,95,60,.35)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(tx, ty - th); ctx.lineTo(tx, ty - th * .74);
    ctx.stroke();
    ctx.restore();

    /* Gradasi gelap hanya di bawah bukit sudut. Tengahnya dibiarkan
       terang supaya air danau terlihat menyentuh tepi bawah halaman. */
    var rg = ctx.createLinearGradient(0, dasar - tinggi * .06, 0, dasar);
    rg.addColorStop(0, 'rgba(0,0,0,0)');
    rg.addColorStop(1, gelap ? 'rgba(6,26,20,.5)' : 'rgba(30,90,50,.3)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, dasar - tinggi * .06, lebar * .19, tinggi * .06);
    ctx.fillRect(lebar * .81, dasar - tinggi * .06, lebar * .19, tinggi * .06);
  }

  /* ---------- ukur ---------- */
  function ukur(){
    if(!kanvas) return;
    lebar = Math.max(1, Math.round(window.innerWidth));
    tinggi = Math.max(1, Math.round(window.innerHeight));
    dpr = Math.min(window.devicePixelRatio || 1, preset().dprMaks);
    kanvas.width = Math.round(lebar * dpr);
    kanvas.height = Math.round(tinggi * dpr);
    kanvas.style.width = lebar + 'px';
    kanvas.style.height = tinggi + 'px';
    if(ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* ---------- gambar satu bingkai ---------- */
  var jam = 0;
  function lukis(ts){
    if(!kanvas || !ctx) return;
    var p = preset();
    if(ts - terakhir < 1000 / p.fps - 1) return;
    var dt = Math.min(ts - terakhir, 140);
    terakhir = ts;
    jam += dt / 1000;
    var t = kurangiGerak ? 0 : jam;

    ctx.clearRect(0, 0, lebar, tinggi);
    gambarLangit();
    var urut = awan.slice().sort(function(a, b){ return a.lapis - b.lapis; });
    urut.forEach(function(a){ gambarAwan(a, t); });
    burung.forEach(function(b){ gambarBurung(b, t); });
    gambarGunung();
    gambarHutan();
    gambarDanau(t);
    gambarTepi(t);
  }

  function loop(ts){
    if(!jalan){ raf = null; return; }
    raf = requestAnimationFrame(loop);
    if(tersembunyi) return;
    lukis(ts);
  }

  function mulai(){
    if(!kanvas || tersembunyi) return;
    if(jalan) return;
    jalan = true; terakhir = 0;
    if(!raf) raf = requestAnimationFrame(loop);
  }
  function henti(){
    jalan = false;
    if(raf){ cancelAnimationFrame(raf); raf = null; }
  }

  function terapkan(nama){
    kualitas = (nama === 'rendah' || nama === 'sedang' || nama === 'tinggi') ? nama : deteksi();
    var p = preset();
    buatAwan(p.awan); buatBurung(p.burung); buatRiak(p.riak);
    buatBunga(26); buatAlang(18);
    ukur();
  }

  function tema(){ gelap = document.documentElement.getAttribute('data-tema') === 'gelap'; }

  function bangun(){
    wadah = document.createElement('div');
    wadah.className = 'latar-hidup';
    wadah.setAttribute('aria-hidden', 'true');
    kanvas = document.createElement('canvas');
    kanvas.className = 'latar-hidup-kanvas';
    wadah.appendChild(kanvas);
    document.body.insertBefore(wadah, document.body.firstChild);

    ctx = kanvas.getContext('2d');
    if(!ctx){ if(wadah.parentNode) wadah.parentNode.removeChild(wadah); wadah = null; kanvas = null; return false; }

    document.body.classList.add('ada-latar');
    tema();
    kurangiGerak = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    terapkan(bacaKualitas());

    window.addEventListener('resize', function(){
      clearTimeout(retak);
      retak = setTimeout(function(){ ukur(); lukis(performance.now()); }, 200);
    });
    document.addEventListener('visibilitychange', function(){
      tersembunyi = document.hidden;
      if(tersembunyi) henti(); else mulai();
    });
    document.addEventListener('qiiora:tema', function(){ tema(); lukis(performance.now()); });
    return true;
  }

  window.QIIORA.latar = {
    pasang: bangun,
    kualitas: function(){ return kualitas; },
    setKualitas: function(nama){ terapkan(nama); if(jalan) henti(); if(!kurangiGerak) mulai(); return kualitas; },
    gambarUlang: function(){ lukis(performance.now()); },
    statistik: function(){ return { kualitas: kualitas, awan: awan.length, burung: burung.length, riak: riak.length, dpr: dpr, jalan: jalan }; }
  };

  function mulaiAwal(){
    if(!bangun()) return;
    lukis(performance.now());
    if(!kurangiGerak) mulai();
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mulaiAwal);
  else mulaiAwal();
})();