/* ============================================================
   QIIORA — Pencarian global (Ctrl+K / ⌘K)
   Indeks dibangun dari view SPA + halaman berdiri sendiri.
   Hasil dikelompokkan, bisa dikendalikan keyboard (↑ ↓ Enter Esc).
   ============================================================ */
(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};

  var INDEKS = [
    // halaman SPA
    { grup:'Halaman', judul:'Beranda', ket:'Ringkasan, progres belajar, pintu masuk', rute:'#/beranda', ico:'home',
      kata:'beranda home awal mulai progres lanjutkan' },
    { grup:'Halaman', judul:'Modul', ket:'Daftar 5 bab, 15 butir per bab', rute:'#/modul', ico:'book',
      kata:'modul bab daftar materi belajar butir' },
    { grup:'Halaman', judul:'Tujuan Pembelajaran', ket:'Capaian Fase C dan indikator', rute:'#/tujuan', ico:'target',
      kata:'tujuan capaian indikator pembelajaran cp tp' },
    { grup:'Halaman', judul:'Materi Pokok', ket:'Lima tahapan siklus air', rute:'#/materi', ico:'layers',
      kata:'materi pokok tahapan evaporasi transpirasi kondensasi presipitasi infiltrasi limpasan hujan awan uap air tanah siklus' },
    { grup:'Halaman', judul:'Simulasi 3D', ket:'Diorama siklus air, putar dan zoom', rute:'#/simulasi', ico:'cube',
      kata:'simulasi 3d diorama model putar zoom tiga dimensi hujan awan laut gunung' },
    { grup:'Halaman', judul:'Model Tanah 3D', ket:'Lapisan tanah kue lapis', rute:'#/model-tanah', ico:'layers',
      kata:'model tanah lapisan kue lapis humus batuan air tanah' },
    { grup:'Halaman', judul:'Kesimpulan', ket:'Empat gagasan kunci', rute:'#/kesimpulan', ico:'check',
      kata:'kesimpulan rangkuman gagasan inti miskonsepsi' },
    { grup:'Halaman', judul:'Kuis Pemahaman', ket:'10 soal dengan pembahasan', rute:'#/kuis', ico:'help',
      kata:'kuis quiz soal latihan skor nilai pembahasan ujian' },
    { grup:'Halaman', judul:'LKPD', ket:'Lembar kerja yang bisa diisi dan dicetak', rute:'#/lkpd', ico:'doc',
      kata:'lkpd lembar kerja peserta didik cetak pdf isi hujan mini percobaan' },
    { grup:'Halaman', judul:'Sumber & Data', ket:'Rujukan Buku IPAS V, BMKG, NASA', rute:'#/sumber', ico:'link',
      kata:'sumber data rujukan referensi bmkg nasa kemdikbud' },
    { grup:'Halaman', judul:'Identitas Penyusun', ket:'Nama, NIM, kelas, prodi, foto', rute:'#/identitas', ico:'user',
      kata:'identitas penyusun nama nim kelas prodi foto' },

    // halaman berdiri sendiri
    { grup:'Halaman lain', judul:'Bab 3 · Siklus Air', ket:'Sesi lengkap: pemanasan sampai post-test', rute:'bab/bab-3-siklus-air.html', ico:'book',
      kata:'bab 3 siklus air sesi pemanasan posttest post-test eksplorasi refleksi hujan awan uap' },
    { grup:'Halaman lain', judul:'Tugas', ket:'Poster, percobaan, tautan Drive', rute:'tugas.html', ico:'doc',
      kata:'tugas post test poster percobaan drive pengumpulan' },
    { grup:'Halaman lain', judul:'Lembar Pengumpulan', ket:'Rekap tugas, skor, jurnal', rute:'kumpul.html', ico:'doc',
      kata:'kumpul pengumpulan rekap lembar cetak json kode' },
    { grup:'Halaman lain', judul:'Mode Pengajar', ket:'Nilai rubrik, rekap, ekspor CSV', rute:'pengajar.html', ico:'user',
      kata:'pengajar guru nilai rubrik rekap csv kode kumpul' },

    // istilah (lompat ke materi)
    { grup:'Istilah', judul:'Evaporasi', ket:'Air cair berubah menjadi uap', rute:'#/materi', ico:'drop',
      kata:'evaporasi penguapan uap matahari laut' },
    { grup:'Istilah', judul:'Transpirasi', ket:'Tumbuhan melepaskan uap air', rute:'#/materi', ico:'drop',
      kata:'transpirasi stomata daun tumbuhan pohon' },
    { grup:'Istilah', judul:'Kondensasi', ket:'Uap air menjadi titik-titik air', rute:'#/materi', ico:'drop',
      kata:'kondensasi pengembunan awan titik air uap mendingin' },
    { grup:'Istilah', judul:'Presipitasi', ket:'Air jatuh kembali ke Bumi', rute:'#/materi', ico:'drop',
      kata:'presipitasi hujan salju es jatuh awan curah' },
    { grup:'Istilah', judul:'Infiltrasi', ket:'Air meresap ke dalam tanah', rute:'#/materi', ico:'drop',
      kata:'infiltrasi meresap tanah air tanah resapan' },
    { grup:'Istilah', judul:'Limpasan', ket:'Air mengalir di permukaan menuju sungai', rute:'#/materi', ico:'drop',
      kata:'limpasan aliran permukaan sungai runoff' },
    { grup:'Istilah', judul:'Evapotranspirasi', ket:'Gabungan evaporasi dan transpirasi', rute:'#/materi', ico:'drop',
      kata:'evapotranspirasi gabungan evaporasi transpirasi' }
  ];

  /* Butir modul ikut diindeks: dibangun dari data bab, bukan ditulis tangan.
     Tanpa ini butir baru tidak akan pernah muncul di pencarian. */
  (function indeksButir(){
    var bab = window.QIIORA.bab;
    if(!bab) return;
    Object.keys(bab).forEach(function(k){
      var b = bab[k];
      if(!b || !b.butir) return;
      b.butir.forEach(function(bt, i){
        var n = i + 1;
        INDEKS.push({
          grup: 'Bab ' + b.nomor + ' · ' + b.judul,
          judul: bt.judul,
          ket: bt.postTest ? 'Post-test bab' : ('Butir ' + n + ' dari ' + b.butir.length),
          rute: '#/modul/bab-' + b.nomor + '/butir-' + n,
          ico: 'book',
          kata: (bt.judul + ' ' + (bt.materi || []).join(' ')).toLowerCase().replace(/[*_]/g, '')
        });
      });
    });
  })();

  var IKON = {
    home:'<path d="M4 11l8-7 8 7v9H4z"/>',
    book:'<path d="M4 5h7v15H4zM13 5h7v15h-7z"/>',
    target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.4"/>',
    layers:'<path d="M3 7h18M3 12h18M3 17h18"/>',
    cube:'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 3v18"/>',
    check:'<path d="M4 12.5l5 5L20 6.5"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3V13"/><circle cx="12.8" cy="16.4" r=".9" fill="currentColor" stroke="none"/>',
    doc:'<path d="M7 3h10v18H7zM4 7h3M4 12h3M4 17h3"/>',
    link:'<path d="M10 13a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 0 0-5.7-5.7L11 6.3"/><path d="M14 11a4 4 0 0 0-5.7 0L6 13.3a4 4 0 0 0 5.7 5.7l1.3-1.3"/>',
    user:'<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
    drop:'<path d="M12 3.5s6 6.4 6 10.2a6 6 0 0 1-12 0C6 9.9 12 3.5 12 3.5z"/>'
  };

  function svg(nama){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true">'
      + (IKON[nama] || IKON.doc) + '</svg>';
  }

  function norm(s){
    return String(s || '').toLowerCase()
      .replace(/[^\w\s\u00C0-\u024F]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }

  // skor: judul cocok > kata kunci cocok
  function cari(q){
    var nq = norm(q);
    if(!nq) return INDEKS.slice(0, 8);
    var kata = nq.split(' ');
    var hasil = [];
    INDEKS.forEach(function(it){
      var judul = norm(it.judul);
      var ket = norm(it.ket);
      var kataKunci = norm(it.kata);
      var skor = 0;
      kata.forEach(function(k){
        if(!k) return;
        if(judul.indexOf(k) === 0) skor += 12;
        else if(judul.indexOf(k) > -1) skor += 8;
        if(ket.indexOf(k) > -1) skor += 4;
        if(kataKunci.indexOf(k) > -1) skor += 3;
      });
      if(skor > 0) hasil.push({ it: it, skor: skor });
    });
    hasil.sort(function(a, b){ return b.skor - a.skor; });
    return hasil.map(function(h){ return h.it; });
  }

  function sorot(teks, q){
    var nq = norm(q);
    if(!nq) return document.createTextNode(teks);
    var frag = document.createDocumentFragment();
    var rendah = teks.toLowerCase();
    var pos = 0;
    nq.split(' ').filter(Boolean).forEach(function(k){
      var i = rendah.indexOf(k, pos);
      if(i === -1) return;
      if(i > pos) frag.appendChild(document.createTextNode(teks.slice(pos, i)));
      var m = document.createElement('mark');
      m.textContent = teks.slice(i, i + k.length);
      frag.appendChild(m);
      pos = i + k.length;
    });
    if(pos < teks.length) frag.appendChild(document.createTextNode(teks.slice(pos)));
    return frag;
  }

  var layer = null, input = null, hasilBox = null, aktifIdx = -1, hasilKini = [];

  function bangun(){
    layer = document.createElement('div');
    layer.className = 'cari-layer';
    layer.setAttribute('role', 'search');
    layer.setAttribute('aria-label', 'Pencarian');
    layer.innerHTML =
      '<div class="cari-box">'
      + '<div class="cari-input-row">'
      + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/></svg>'
      + '<input class="cari-input" type="search" placeholder="Cari halaman, istilah, atau fitur…" aria-label="Kata kunci pencarian" autocomplete="off" spellcheck="false">'
      + '<span class="cari-esc">Esc</span>'
      + '</div>'
      + '<div class="cari-hasil" role="listbox" aria-label="Hasil pencarian"></div>'
      + '<div class="cari-foot"><span><kbd>↑</kbd><kbd>↓</kbd> pilih</span><span><kbd>Enter</kbd> buka</span><span><kbd>Esc</kbd> tutup</span></div>'
      + '</div>';
    document.body.appendChild(layer);
    input = layer.querySelector('.cari-input');
    hasilBox = layer.querySelector('.cari-hasil');

    input.addEventListener('input', function(){ render(input.value); });
    input.addEventListener('keydown', function(e){
      if(e.key === 'ArrowDown'){ e.preventDefault(); geser(1); }
      else if(e.key === 'ArrowUp'){ e.preventDefault(); geser(-1); }
      else if(e.key === 'Enter'){
        e.preventDefault();
        if(hasilKini[aktifIdx]) buka(hasilKini[aktifIdx]);
      }
    });
    layer.addEventListener('click', function(e){
      if(e.target === layer) tutup();
    });
    hasilBox.addEventListener('click', function(e){
      var b = e.target.closest('.cari-item');
      if(!b) return;
      var i = Number(b.getAttribute('data-i'));
      if(hasilKini[i]) buka(hasilKini[i]);
    });
  }

  function render(q){
    var hasil = cari(q);
    hasilKini = hasil;
    aktifIdx = hasil.length ? 0 : -1;
    hasilBox.innerHTML = '';
    if(!hasil.length){
      hasilBox.innerHTML = '<p class="cari-kosong">Tidak ada hasil untuk “' + q.replace(/[<>&]/g, '') + '”. Coba kata lain seperti <strong>hujan</strong>, <strong>kuis</strong>, atau <strong>LKPD</strong>.</p>';
      return;
    }
    var grupTerakhir = '';
    hasil.forEach(function(it, i){
      if(it.grup !== grupTerakhir){
        grupTerakhir = it.grup;
        var g = document.createElement('div');
        g.className = 'cari-grup';
        g.textContent = it.grup;
        hasilBox.appendChild(g);
      }
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'cari-item' + (i === aktifIdx ? ' aktif' : '');
      b.setAttribute('data-i', String(i));
      b.setAttribute('role', 'option');
      b.setAttribute('aria-selected', String(i === aktifIdx));
      b.innerHTML = '<span class="ci-ico">' + svg(it.ico) + '</span><span><span class="ci-t"></span><span class="ci-d"></span></span>';
      b.querySelector('.ci-t').appendChild(sorot(it.judul, q));
      b.querySelector('.ci-d').appendChild(sorot(it.ket, q));
      hasilBox.appendChild(b);
    });
  }

  function geser(d){
    if(!hasilKini.length) return;
    aktifIdx = (aktifIdx + d + hasilKini.length) % hasilKini.length;
    Array.prototype.forEach.call(hasilBox.querySelectorAll('.cari-item'), function(b, i){
      var on = i === aktifIdx;
      b.classList.toggle('aktif', on);
      b.setAttribute('aria-selected', String(on));
      if(on && b.scrollIntoView) b.scrollIntoView({ block: 'nearest' });
    });
  }

  function buka(it){
    tutup();
    if(it.rute.charAt(0) === '#'){
      if(window.QIIORA.router) QIIORA.router.pergi(it.rute);
      else location.hash = it.rute;
    } else {
      location.href = it.rute;
    }
  }

  function bukaLayer(){
    if(!layer) bangun();
    layer.classList.add('on');
    input.value = '';
    render('');
    setTimeout(function(){ input.focus({ preventScroll: true }); }, 40);
  }

  document.addEventListener('pointerdown', function(e){
    if(!layer || !layer.classList.contains('on')) return;
    if(e.target.closest && (e.target.closest('.cari-box') || e.target.closest('[data-cari]'))) return;
    tutup();
  });

  function tutup(){
    if(!layer || !layer.classList.contains('on')) return;
    layer.classList.remove('on');
  }

  document.addEventListener('keydown', function(e){
    var cmdK = (e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey);
    if(cmdK){ e.preventDefault(); bukaLayer(); return; }
    if(e.key === 'Escape' && layer && layer.classList.contains('on')){ e.preventDefault(); tutup(); }
    // "/" membuka pencarian bila fokus tidak di input
    if(e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) && !document.activeElement.isContentEditable){
      e.preventDefault(); bukaLayer();
    }
  });

  document.addEventListener('DOMContentLoaded', function(){
    var tombol = document.querySelector('[data-cari]');
    if(tombol) tombol.addEventListener('click', bukaLayer);
  });

  window.QIIORA.cari = { buka: bukaLayer, tutup: tutup, indeks: INDEKS };
})();
