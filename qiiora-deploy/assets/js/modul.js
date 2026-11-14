/* ============================================================
   QIIORA — Mesin butir modul (Fase 7 / H1)

   Satu mesin membaca data bab dari `data/bab/bab-N.js` dan
   merendernya menjadi butir 1–15. Tidak ada HTML per bab.

   Rute: #/modul                 -> daftar bab
         #/modul/bab-3/butir-5   -> butir 5 Bab 3

   Memakai ulang komponen yang sudah ada:
   - QIIORA.kuis.buatPg / buatBs / renderKhusus / catatHasil
   - QIIORA.simpan (aditif: kunci `progres-butir-bab-N`)
   - kelas CSS yang sudah ada (.btn, .badge, .card, .bab-*)

   Sumber soal tetap `data/soal.js` — bentuk datanya tidak diubah,
   mesin ini hanya merujuk id soal.
   ============================================================ */
(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};

  var KUNCI = 'progres-butir-bab-';

  /* Kalimat penghubung antara judul butir dan panel visual.
     Tanpa ini panel terasa seperti gambar tempelan. */
  var PENGANTAR_VISUAL = {
    hujan:    'Perhatikan: hujan turun, sebagian meresap, sebagian mengalir ke laut.',
    uap:      'Perhatikan: panas Matahari mengubah air menjadi uap yang naik.',
    wujud:    'Perhatikan: air bisa berubah wujud tanpa berubah zatnya.',
    serap:    'Perhatikan: air menembus humus, tanah atas, lalu berhenti di batuan.',
    siklus:   'Perhatikan: empat tahap ini berputar terus tanpa henti.',
    sungai:   'Perhatikan: air mengalir menurun, dari gunung sampai laut.',
    tanah:    'Perhatikan: tiga jenis tanah, tiga kecepatan resapan berbeda.',
    pohon:    'Perhatikan: akar menyerap air, daun melepasnya sebagai uap.',
    hemat:    'Perhatikan: selisih air terbuang saat keran dibiarkan terbuka.',
    awan:     'Perhatikan: uap yang naik berubah menjadi titik air dan membentuk awan.',
    default:  'Perhatikan: air terus bergerak, tidak pernah berhenti.'
  };

  function el(tag, cls, teks){
    var e = document.createElement(tag);
    if(cls) e.className = cls;
    if(teks !== undefined && teks !== null) e.textContent = teks;
    return e;
  }

  /* Markdown mini: **tebal** dan *miring* saja — cukup untuk materi. */
  function kaya(teks){
    var f = document.createDocumentFragment();
    var pola = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
    var sisa = String(teks || '');
    var pos = 0, m;
    while((m = pola.exec(sisa))){
      if(m.index > pos) f.appendChild(document.createTextNode(sisa.slice(pos, m.index)));
      var isi = m[0];
      var kuat = isi.slice(0, 2) === '**';
      var t = kuat ? isi.slice(2, -2) : isi.slice(1, -1);
      var e = document.createElement(kuat ? 'strong' : 'em');
      e.textContent = t;
      f.appendChild(e);
      pos = m.index + isi.length;
    }
    if(pos < sisa.length) f.appendChild(document.createTextNode(sisa.slice(pos)));
    return f;
  }

  /* ---------- Progres butir ---------- */
  function ambilProgres(bab){
    var d = QIIORA.simpan.ambil(KUNCI + bab, null);
    if(!d || typeof d !== 'object') return { selesai: {}, skor: {} };
    return {
      selesai: d.selesai || {},
      skor: d.skor || {}
    };
  }

  function simpanProgres(bab, d){
    QIIORA.simpan.simpan(KUNCI + bab, d);
  }

  function tandaiButir(bab, i, benar){
    var d = ambilProgres(bab);
    d.selesai[i] = benar ? 'benar' : 'dikerjakan';
    if(benar) d.skor[i] = true;
    simpanProgres(bab, d);
  }

  function batalkanTanda(bab, i){
    var d = ambilProgres(bab);
    delete d.selesai[i];
    delete d.skor[i];
    simpanProgres(bab, d);
  }

  /* ---------- Cari soal ---------- */
  function cariSoal(id){
    var daftar = QIIORA.soal || [];
    for(var i = 0; i < daftar.length; i++){
      if(daftar[i].id === id) return daftar[i];
    }
    return null;
  }

  /* ---------- Kerangka halaman butir ---------- */
  var wadahMesin = null;
  var babAktif = null;
  var butirAktif = 0;

  function pastikanKerangka(){
    if(wadahMesin) return wadahMesin;
    wadahMesin = document.querySelector('[data-butir-shell]');
    return wadahMesin;
  }

  /* ---------- Daftar butir (peta 15 butir) ---------- */
  function renderPeta(bab, nomorAktif){
    var ul = el('ol', 'peta-butir');
    ul.setAttribute('aria-label', 'Peta butir bab ' + bab.nomor);
    var prog = ambilProgres(bab.nomor);

    bab.butir.forEach(function(b, i){
      var n = i + 1;
      var li = el('li');
      var a = el('a', 'peta-item');
      a.href = '#/modul/bab-' + bab.nomor + '/butir-' + n;
      a.setAttribute('data-rute', '/modul/bab-' + bab.nomor + '/butir-' + n);
      if(n === nomorAktif) a.setAttribute('aria-current', 'step');
      if(prog.selesai[n]) a.classList.add(prog.selesai[n] === 'benar' ? 'is-benar' : 'is-dikerjakan');
      if(b.postTest) a.classList.add('is-posttest');

      var no = el('span', 'peta-no', b.postTest ? 'PT' : (n < 10 ? '0' + n : String(n)));
      var t = el('span', 'peta-judul', b.judul);
      a.appendChild(no);
      a.appendChild(t);
      li.appendChild(a);
      ul.appendChild(li);
    });
    return ul;
  }

  /* ---------- Satu soal: pakai ulang kuis.js ---------- */
  function renderSoal(soal, nomor, selesai){
    var kotak = el('div', 'soal');
    kotak.setAttribute('data-soal', soal.id);

    var kepala = el('div', 'soal-kepala');
    kepala.appendChild(el('span', 'soal-no', 'Soal ' + nomor));
    kepala.appendChild(el('span', 'badge badge--jenis', 'Tingkat ' + soal.tingkat));
    kotak.appendChild(kepala);

    var stem = el('p', 'soal-stem');
    stem.appendChild(kaya(soal.stem));
    kotak.appendChild(stem);

    var wadahJawab = el('div', 'soal-jawab');
    kotak.appendChild(wadahJawab);

    var umpan = el('div', 'soal-umpan');
    umpan.hidden = true;
    kotak.appendChild(umpan);

    var selesaiSekali = false;
    function akhir(benar, kunciTeks){
      if(selesaiSekali) return;
      selesaiSekali = true;
      umpan.hidden = false;
      umpan.classList.add(benar ? 'ok' : 'salah');
      umpan.innerHTML = '';
      var judul = el('p', 'umpan-judul', benar ? 'Benar!' : 'Belum tepat');
      umpan.appendChild(judul);
      if(!benar && kunciTeks){
        var k = el('p', 'umpan-kunci');
        k.appendChild(document.createTextNode('Jawaban yang tepat: '));
        var b = el('strong', '', kunciTeks);
        k.appendChild(b);
        umpan.appendChild(k);
      }
      if(soal.pembahasan){
        var p = el('p', 'umpan-bahasan');
        p.appendChild(kaya(soal.pembahasan));
        umpan.appendChild(p);
      }
      selesai(benar);
    }

    if(soal.tipe === 'pg' || soal.tipe === 'bs'){
      var tampil = soal.tipe === 'pg' ? QIIORA.kuis.buatPg(soal) : QIIORA.kuis.buatBs(soal);
      var grup = el('div', 'opsi-grup');
      grup.setAttribute('role', 'group');
      var sudah = false;
      tampil.opsi.forEach(function(teks, i){
        var b = el('button', 'opsi', teks);
        b.type = 'button';
        grup.appendChild(b);
        b.addEventListener('click', function(){
          if(sudah) return;
          sudah = true;
          var benar = i === tampil.jawaban;
          Array.prototype.forEach.call(grup.children, function(x, xi){
            x.disabled = true;
            if(xi === tampil.jawaban) x.classList.add('ok');
            else if(xi === i) x.classList.add('salah');
          });
          akhir(benar, tampil.opsi[tampil.jawaban]);
        });
      });
      wadahJawab.appendChild(grup);

    } else {
      // isian / urutkan / jodohkan / hitung -> renderKhusus di kuis.js
      QIIORA.kuis.renderKhusus(soal, wadahJawab, function(benar, kunci){
        akhir(benar, kunci);
      });
    }

    return kotak;
  }

  /* ---------- Tugas proyek pada butir 15 ---------- */
  function renderTugas(idTugas){
    var daftar = QIIORA.tugasList || [];
    var t = null;
    for(var i = 0; i < daftar.length; i++){ if(daftar[i].id === idTugas) t = daftar[i]; }
    if(!t) return null;

    var kartu = el('div', 'card tugas-kartu');
    kartu.appendChild(el('p', 'mono', 'Tugas proyek'));
    var h = el('h3', '', t.judul);
    kartu.appendChild(h);
    if(t.tujuan){
      var p = el('p', 'tugas-tujuan');
      p.appendChild(kaya(t.tujuan));
      kartu.appendChild(p);
    }
    if(t.langkah && t.langkah.length){
      kartu.appendChild(el('p', 'tugas-label', 'Langkah'));
      var ol = el('ol', 'tugas-langkah');
      t.langkah.forEach(function(l){ ol.appendChild(el('li', '', l)); });
      kartu.appendChild(ol);
    }
    if(t.rubrik && t.rubrik.length){
      kartu.appendChild(el('p', 'tugas-label', 'Dinilai dengan rubrik'));
      var ul = el('ul', 'tugas-rubrik');
      t.rubrik.forEach(function(r){
        ul.appendChild(el('li', '', r.kriteria + ' — ' + (r.level || []).join(' / ')));
      });
      kartu.appendChild(ul);
    }
    var a = el('a', 'btn', 'Buka halaman pengumpulan');
    a.href = 'tugas.html';
    kartu.appendChild(a);
    return kartu;
  }

  /* ---------- Render satu butir ---------- */
  function renderButir(bab, nomor){
    var shell = pastikanKerangka();
    if(!shell) return;

    var b = bab.butir[nomor - 1];
    if(!b) return;

    butirAktif = nomor;
    document.body.setAttribute('data-butir-aktif', String(nomor));

    shell.innerHTML = '';

    /* kepala: peta + posisi */
    var atas = el('div', 'butir-atas');
    var kiri = el('div', 'butir-posisi');
    var tautanBab = el('a', 'kembali-modul', '');
    tautanBab.href = '#/modul';
    tautanBab.setAttribute('data-rute', '/modul');
    tautanBab.innerHTML = '<span aria-hidden="true">‹</span> Semua bab';
    kiri.appendChild(tautanBab);
    kiri.appendChild(el('h1', 'butir-judul', b.judul));
    var meta = el('p', 'butir-meta');
    meta.textContent = 'Bab ' + bab.nomor + ' · Butir ' + nomor + ' dari ' + bab.butir.length;
    kiri.appendChild(meta);
    atas.appendChild(kiri);
    shell.appendChild(atas);
    shell.appendChild(renderPeta(bab, nomor));

    /* isi */
    var isi = el('div', 'butir-isi');

    /* visual penguat: dipilih otomatis dari isi butir */
    if(QIIORA.visual && QIIORA.visual.buat){
      var jenisVisual = QIIORA.visual.pilih(b);
      var panelVisual = QIIORA.visual.buat(jenisVisual, isi, QIIORA.visual.label(jenisVisual));
      if(panelVisual){
        // satu kalimat penghubung supaya panel tidak terasa tempelan
        var ketVisual = el('p', 'visual-pengantar');
        ketVisual.textContent = PENGANTAR_VISUAL[jenisVisual] || PENGANTAR_VISUAL.default;
        panelVisual.appendChild(ketVisual);
      }
    }

    if(b.materi && b.materi.length){
      var artikel = el('div', 'materi');
      b.materi.forEach(function(par){
        var p = el('p');
        p.appendChild(kaya(par));
        artikel.appendChild(p);
      });
      isi.appendChild(artikel);
    }

    if(b.salahKaprah){
      var sk = el('aside', 'salah-kaprah');
      sk.appendChild(el('p', 'sk-label', 'Koreksi salah kaprah'));
      var skp = el('p');
      skp.appendChild(kaya(b.salahKaprah));
      sk.appendChild(skp);
      isi.appendChild(sk);
    }

    if(b.percobaan){
      var pc = el('aside', 'percobaan');
      pc.appendChild(el('p', 'sk-label', b.percobaan.judul));
      var pcp = el('p');
      pcp.appendChild(kaya(b.percobaan.teks));
      pc.appendChild(pcp);
      isi.appendChild(pc);
    }

    if(b.fakta){
      var fk = el('p', 'fakta-kecil');
      fk.appendChild(kaya(b.fakta));
      isi.appendChild(fk);
    }

    if(b.tautanModel){
      var tm = el('a', 'btn btn--ghost btn--sm tautan-model', 'Lihat air meresap di Model Tanah 3D');
      tm.href = b.tautanModel;
      tm.setAttribute('data-rute', b.tautanModel);
      isi.appendChild(tm);
    }

    /* soal */
    var soals = (b.soal || []).map(cariSoal).filter(Boolean);
    if(soals.length){
      var blokSoal = el('section', 'blok-soal');
      blokSoal.appendChild(el('h2', 'blok-judul', b.postTest ? 'Soal ujian bab' : 'Latihan'));
      blokSoal.appendChild(el('p', 'blok-sub', b.postTest
        ? 'Dijawab sekali. Skormu langsung tampil setelah semua soal selesai.'
        : 'Jawab untuk melanjutkan. Pembahasan muncul setelah kamu menjawab.'));

      var benar = 0, dijawab = 0;
      var skorEl = el('p', 'skor-butir');
      skorEl.hidden = true;

      soals.forEach(function(s, i){
        blokSoal.appendChild(renderSoal(s, i + 1, function(ok){
          dijawab++;
          if(ok) benar++;
          if(dijawab === soals.length){
            skorEl.hidden = false;
            var pct = Math.round(benar / soals.length * 100);
            skorEl.textContent = 'Skor: ' + benar + '/' + soals.length + ' (' + pct + '%)';
            skorEl.classList.add(pct >= 70 ? 'ok' : 'salah');
            tandaiButir(bab.nomor, nomor, pct >= 70);
            if(b.postTest) QIIORA.kuis.catatHasil('posttest', bab.nomor, benar, soals.length);
            perbaruiPeta(bab, nomor);
            perbaruiNavigasi();
          }
        }));
      });
      blokSoal.appendChild(skorEl);
      isi.appendChild(blokSoal);
    }

    if(b.postTest && b.tugas){
      var kt = renderTugas(b.tugas);
      if(kt) isi.appendChild(kt);
    }

    if(b.sumberButir){
      var sb = el('p', 'sumber-butir', 'Sumber: ' + b.sumberButir);
      isi.appendChild(sb);
    }

    shell.appendChild(isi);

    /* navigasi bawah */
    var nav = el('nav', 'butir-nav');
    nav.setAttribute('data-butir-nav', '');
    shell.appendChild(nav);
    perbaruiNavigasi();
  }

  function perbaruiPeta(bab, nomor){
    var lama = document.querySelector('.peta-butir');
    if(lama){
      var baru = renderPeta(bab, nomor);
      lama.replaceWith(baru);
    }
  }

  function ikon(d){
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }

  function perbaruiNavigasi(){
    var nav = document.querySelector('[data-butir-nav]');
    if(!nav || !babAktif) return;
    var bab = babAktif;
    var total = bab.butir.length;
    var n = butirAktif;
    nav.innerHTML = '';

    var bar = el('div', 'butir-aksi');

    /* tengah: toggle tandai selesai */
    var prog = ambilProgres(bab.nomor);
    var sudah = !!prog.selesai[n];
    var tandai = el('button', 'btn btn-tandai' + (sudah ? ' is-batal' : ''));
    tandai.type = 'button';
    tandai.setAttribute('aria-pressed', sudah ? 'true' : 'false');
    tandai.innerHTML = sudah
      ? ikon('<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>') + '<span>Batalkan tanda selesai</span>'
      : ikon('<path d="M4 12.5l5 5L20 6.5"/>') + '<span>Tandai butir ini selesai</span>';
    tandai.addEventListener('click', function(){
      if(sudah) batalkanTanda(bab.nomor, n); else tandaiButir(bab.nomor, n, false);
      perbaruiPeta(bab, n);
      perbaruiNavigasi();
      var baru = document.querySelector('[data-butir-nav] .btn-tandai');
      if(baru) try{ baru.focus({ preventScroll: true }); }catch(e){}
    });

    /* kiri */
    var kiri = el('div', 'butir-aksi-kiri');
    if(n > 1){
      var prev = el('a', 'btn btn--ghost nav-butir', '‹ Sebelumnya');
      prev.href = '#/modul/bab-' + bab.nomor + '/butir-' + (n - 1);
      prev.setAttribute('data-rute', '/modul/bab-' + bab.nomor + '/butir-' + (n - 1));
      kiri.appendChild(prev);
    }
    /* kanan */
    var kanan = el('div', 'butir-aksi-kanan');
    if(n < total){
      var next = el('a', 'btn nav-butir', n === total - 1 ? 'Post-test ›' : 'Berikutnya ›');
      next.href = '#/modul/bab-' + bab.nomor + '/butir-' + (n + 1);
      next.setAttribute('data-rute', '/modul/bab-' + bab.nomor + '/butir-' + (n + 1));
      kanan.appendChild(next);
    } else {
      var balik = el('a', 'btn nav-butir', 'Selesai — kembali ke daftar');
      balik.href = '#/modul';
      balik.setAttribute('data-rute', '/modul');
      kanan.appendChild(balik);
    }

    bar.appendChild(kiri);
    bar.appendChild(tandai);
    bar.appendChild(kanan);
    nav.appendChild(bar);

    /* ulangi butir (konfirmasi dua-tahap di tempat) */
    var ada = (bab.butir[n - 1].soal || []).length > 0 || sudah;
    if(ada){
      var ulang = el('button', 'btn btn--ghost btn--sm btn-ulangi');
      ulang.type = 'button';
      ulang.innerHTML = ikon('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>') + '<span>Ulangi butir</span>';
      ulang.addEventListener('click', function(){
        QIIORA.ui.konfirmasi({
          judul: 'Hapus jawaban & skor butir ini?',
          labelLanjut: 'Ya, ulangi',
          target: ulang,
          onHasil: function(ya){
            if(!ya) return;
            batalkanTanda(bab.nomor, n);
            renderButir(bab, n);
            try{ window.scrollTo({ top: 0, behavior: 'smooth' }); }catch(e){}
          }
        });
      });
      var baris = el('div', 'butir-ulangi');
      baris.appendChild(ulang);
      nav.appendChild(baris);
    }
  }

  /* ---------- Daftar bab (#/modul) ---------- */
  function renderDaftarBab(){
    var grid = document.querySelector('[data-bab-grid]');
    if(!grid) return;
    var bab = window.QIIORA.bab || {};

    Object.keys(bab).forEach(function(k){
      var b = bab[k];
      var kartu = grid.querySelector('[data-bab-kartu="' + b.nomor + '"]');
      var siap = b.butir && b.butir.length === 15;
      if(!kartu || !siap) return;
      kartu.classList.remove('is-segera');
      kartu.classList.add('is-siap');
      kartu.setAttribute('href', '#/modul/bab-' + b.nomor + '/butir-1');
      kartu.setAttribute('data-rute', '/modul/bab-' + b.nomor + '/butir-1');
      var badge = kartu.querySelector('.badge');
      if(badge){
        badge.className = 'badge';
        badge.textContent = 'Siap dipelajari';
      }
      var hitung = kartu.querySelector('.bab-count');
      if(hitung) hitung.textContent = '15 butir';
      else {
        var meta = kartu.querySelector('.bab-meta');
        if(meta) meta.appendChild(el('span', 'bab-count', '15 butir'));
      }
    });
  }

  /* ---------- Tampil/sembunyi daftar bab ----------
     Saat sebuah butir dibuka, daftar bab dan kepala halaman "Pilih bab"
     harus hilang: satu halaman satu isi. */
  function aturDaftar(tampil){
    var view = document.getElementById('view-modul');
    if(!view) return;
    var bagian = view.querySelectorAll('.view-head, [data-bab-grid], .catatan-kecil');
    Array.prototype.forEach.call(bagian, function(el){
      // atribut hidden bisa dikalahkan oleh `display:grid` di CSS,
      // jadi pakai kelas yang punya !important
      el.classList.toggle('is-sembunyi', !tampil);
      if(tampil) el.removeAttribute('hidden');
      else el.setAttribute('hidden', '');
    });
  }

  /* ---------- Masuk / keluar rute ---------- */
  function bukaRute(sisa){
    var shell = pastikanKerangka();
    if(!shell) return;

    // #/modul
    if(!sisa || !sisa.length){
      shell.hidden = true;
      shell.innerHTML = '';
      babAktif = null;
      aturDaftar(true);
      renderDaftarBab();
      return;
    }

    // #/modul/bab-3  atau  #/modul/bab-3/butir-5
    var m = /^bab-(\d+)$/.exec(sisa[0] || '');
    if(!m){
      shell.hidden = true;
      return;
    }
    var nomorBab = Number(m[1]);
    var bab = (window.QIIORA.bab || {})[nomorBab];
    if(!bab){
      shell.hidden = false;
      aturDaftar(false);
      shell.innerHTML = '';
      var kosong = el('div', 'butir-kosong');
      kosong.appendChild(el('h2', '', 'Bab ' + nomorBab + ' belum tersedia'));
      kosong.appendChild(el('p', '', 'Bab ini belum ditulis. Kami tidak mengisi materi dengan karangan.'));
      var kembali = el('a', 'btn btn--sm', 'Kembali ke daftar bab');
      kembali.href = '#/modul';
      kembali.setAttribute('data-rute', '/modul');
      kosong.appendChild(kembali);
      shell.appendChild(kosong);
      return;
    }

    var nomorButir = 1;
    if(sisa[1]){
      var mb = /^butir-(\d+)$/.exec(sisa[1]);
      if(mb) nomorButir = Number(mb[1]);
    }
    nomorButir = Math.max(1, Math.min(bab.butir.length, nomorButir));

    shell.hidden = false;
    aturDaftar(false);
    babAktif = bab;
    renderButir(bab, nomorButir);
  }

  /* ---------- API publik ---------- */
  window.QIIORA.modul = {
    mulai: function(){
      renderDaftarBab();
      document.addEventListener('qiiora:view', function(e){
        if(!e.detail || e.detail.nama !== 'modul') return;
        bukaRute(e.detail.sisa || []);
      });
      // kalau halaman dibuka langsung di rute butir, event sudah lewat
      var r = QIIORA.router && QIIORA.router.ruteSekarang ? QIIORA.router.ruteSekarang() : null;
      if(r && r.nama === 'modul') bukaRute(r.sisa || []);
    },
    ambilProgres: ambilProgres,
    renderPeta: renderPeta
  };

  /* Inisialisasi sendiri: pendengar DOMContentLoaded milik nav.js (yang
     menjalankan router) didaftarkan lebih dulu karena nav.js dimuat lebih
     awal, jadi di sini rute pertama sudah selesai dan bisa dibaca langsung. */
  function mulai(){
    renderDaftarBab();
    var sisaTerakhir = null;
    function muatDariHash(){
      var r = QIIORA.router && QIIORA.router.ruteSekarang ? QIIORA.router.ruteSekarang() : null;
      if(!r || r.nama !== 'modul') return;
      var kunci = (r.sisa || []).join('/');
      if(kunci === sisaTerakhir) return;
      sisaTerakhir = kunci;
      bukaRute(r.sisa || []);
      // pastikan keadaan tampil/sembunyi daftar selalu ikut rute
      aturDaftar(!(r.sisa && r.sisa.length));
    }
    document.addEventListener('qiiora:view', function(e){
      if(!e.detail || e.detail.nama !== 'modul') return;
      sisaTerakhir = (e.detail.sisa || []).join('/');
      bukaRute(e.detail.sisa || []);
    });
    /* router berhenti lebih awal bila view-nya sama (#/modul/bab-3/butir-1 ->
       #/modul/bab-3/butir-2): `current === target` membuatnya "return" tanpa
       memancarkan qiiora:view. hashchange menutup celah itu. */
    window.addEventListener('hashchange', muatDariHash);
    muatDariHash();
  }
  QIIORA.modul.mulai = mulai;
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', mulai);
  } else {
    mulai();
  }
})();