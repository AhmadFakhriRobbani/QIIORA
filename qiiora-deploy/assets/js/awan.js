/* ============================================================
   QIIORA — Jembatan Supabase (sinkronisasi nyata)

   APA YANG DILAKUKAN
   Sebelum ini, SELURUH data belajar hanya disimpan di localStorage
   peramban. Tidak ada satu baris pun yang dikirim ke Supabase,
   walaupun skema 01–07 sudah siap.

   Berkas ini menyambungkan keduanya TANPA mengubah halaman:
     - QIIORA.simpan (localStorage) tetap dipakai apa adanya
       sehingga aplikasi tetap jalan walau internet mati.
     - Setiap penulisan juga dikirim ke Supabase sebagai salinan
       "sumber kebenaran" saat pengguna sedang login.

   POLA: local-first, lalu dorong ke awan.
     1. Tulis ke localStorage  -> instan, selalu berhasil
     2. Kirim ke Supabase      -> bila jaringan ada
     3. Bila gagal, baris masuk antrean dan dicoba lagi nanti

   KEAMANAN
   - Hanya memakai kunci publik (publishable/anon). Tidak pernah
     service_role.
   - RLS di Supabase tetap menegakkan "siswa hanya data sendiri".
   - Token sesi disimpan di localStorage kunci terpisah.

   PEMETAAN KUNCI LOKAL -> TABEL SUPABASE
     identitas / sesi-masuk  -> qiiora_profil (baca saja)
     progres-bab-N           -> qiiora_progres_butir
     kuis-terakhir / skor-*  -> qiiora_hasil_kuis
     lkpd                    -> qiiora_lkpd_isian
     kumpul                  -> qiiora_pengumpulan
     jurnal-ringkas          -> qiiora_jurnal
     kualitas-grafis         -> qiiora_pengaturan
   ============================================================ */
(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};

  var CFG       = window.QIIORA_CONFIG || {};
  var URL_BASE  = (CFG.SUPABASE_URL || '').replace(/\/+$/, '');
  var KUNCI_PUB = CFG.SUPABASE_ANON_KEY || '';
  var AKTIF     = !!CFG.AKTIFKAN_SUPABASE && !!URL_BASE && !!KUNCI_PUB;

  var KUNCI_SESI  = 'qiiora:v2:sesi-supabase';
  var KUNCI_ANTRE = 'qiiora:v2:antrean-awan';
  var KUNCI_ID    = 'qiiora:v2:identitas';
  var KUNCI_SESI2 = 'qiiora:v2:sesi-masuk';

  var TERSEDIA = typeof fetch === 'function';

  /* ---------- util ---------- */
  function baca(kunci, cadangan){
    try{ var v = localStorage.getItem(kunci); return v ? JSON.parse(v) : cadangan; }
    catch(e){ return cadangan; }
  }
  function tulis(kunci, nilai){
    try{ localStorage.setItem(kunci, JSON.stringify(nilai)); return true; }
    catch(e){ return false; }
  }

  function sesi(){ return baca(KUNCI_SESI, null); }
  function token(){ var s = sesi(); return s && s.access_token ? s.access_token : null; }
  function pengguna(){ var s = sesi(); return s && s.user ? s.user : null; }
  function uid(){ var u = pengguna(); return u ? u.id : null; }
  function sudahLogin(){ return !!token(); }

  /* ---------- HTTP ---------- */
  function minta(jalur, opsi){
    opsi = opsi || {};
    var t = token() || KUNCI_PUB;
    return fetch(URL_BASE + jalur, {
      method: opsi.method || 'GET',
      headers: {
        'apikey': KUNCI_PUB,
        'Authorization': 'Bearer ' + t,
        'Content-Type': 'application/json',
        'Prefer': opsi.prefer || 'return=representation'
      },
      body: opsi.body ? JSON.stringify(opsi.body) : undefined
    }).then(function(r){
      return r.text().then(function(txt){
        var isi = null;
        try{ isi = txt ? JSON.parse(txt) : null; }catch(e){ isi = txt; }
        if(!r.ok){
          var galat = new Error((isi && isi.message) || ('HTTP ' + r.status));
          galat.status = r.status; galat.isi = isi;
          throw galat;
        }
        return isi;
      });
    });
  }

  /* ---------- autentikasi ---------- */
  function masuk(email, sandi){
    if(!AKTIF) return Promise.reject(new Error('Supabase tidak aktif'));
    return minta('/auth/v1/token?grant_type=password', {
      method: 'POST', body: { email: email, password: sandi }, prefer: 'return=minimal'
    }).then(function(d){
      if(d && d.access_token){ tulis(KUNCI_SESI, d); }
      return d;
    });
  }

  function daftar(email, sandi){
    if(!AKTIF) return Promise.reject(new Error('Supabase tidak aktif'));
    return minta('/auth/v1/signup', {
      method: 'POST', body: { email: email, password: sandi }, prefer: 'return=minimal'
    }).then(function(d){
      if(d && d.access_token){ tulis(KUNCI_SESI, d); }
      return d;
    });
  }

  function keluarAwan(){
    try{ localStorage.removeItem(KUNCI_SESI); }catch(e){}
  }

  /* ---------- antrean (bila jaringan gagal) ---------- */
  function antre(pekerjaan){
    var q = baca(KUNCI_ANTRE, []);
    q.push(pekerjaan);
    if(q.length > 200) q = q.slice(-200);
    tulis(KUNCI_ANTRE, q);
  }

  function jalankanAntrean(){
    if(!sudahLogin()) return Promise.resolve(0);
    var q = baca(KUNCI_ANTRE, []);
    if(!q.length) return Promise.resolve(0);
    var sisa = [], berhasil = 0;
    return q.reduce(function(rantai, p){
      return rantai.then(function(){
        return minta(p.jalur, { method: p.method || 'POST', body: p.body,
          prefer: p.method === 'POST' ? 'resolution=merge-duplicates,return=minimal' : 'return=minimal'
        }).then(function(){ berhasil++; })
          .catch(function(e){
            // 401/403 = sesi habis atau RLS menolak: jangan ulangi selamanya
            if(e.status === 401 || e.status === 403) return;
            sisa.push(p);
          });
      });
    }, Promise.resolve()).then(function(){
      tulis(KUNCI_ANTRE, sisa);
      return berhasil;
    });
  }

  /* ---------- dorong satu baris ---------- */
  function dorong(jalur, body, kunciKonflik){
    if(!AKTIF || !sudahLogin()) return Promise.resolve(false);
    var prefer = kunciKonflik
      ? 'resolution=merge-duplicates,return=minimal'
      : 'return=minimal';
    return minta(jalur, { method: 'POST', body: body, prefer: prefer })
      .then(function(){ return true; })
      .catch(function(e){
        if(e.status === 401 || e.status === 403){
          // sesi tidak sah: simpan untuk dicoba setelah login
          antre({ jalur: jalur, method: 'POST', body: body });
          return false;
        }
        antre({ jalur: jalur, method: 'POST', body: body });
        return false;
      });
  }

  /* ---------- PEMETAAN: kunci lokal -> tabel ---------- */

  // progres-butir-bab-N -> qiiora_progres_butir
  //   Bentuk nilai NYATA (dibaca dari localStorage):
  //     { "selesai": { "1": "dikerjakan", "2": "benar" }, "skor": { "1": 10 } }
  //   Kunci lama `progres-bab-N` juga ditangani untuk kompatibilitas.
  function dorongProgres(namaKunci, nilai){
    var m = /^progres-(?:butir-)?bab-(\d+)$/.exec(namaKunci);
    if(!m) return Promise.resolve(false);
    var bab = parseInt(m[1], 10);
    if(!(bab >= 1 && bab <= 5) || !nilai) return Promise.resolve(false);

    var u = uid();
    var selesai = (nilai && nilai.selesai && typeof nilai.selesai === 'object') ? nilai.selesai : null;
    var skorPeta = (nilai && nilai.skor && typeof nilai.skor === 'object') ? nilai.skor : {};
    var daftar = [];

    if(selesai){
      Object.keys(selesai).forEach(function(k){
        var st = selesai[k];
        var benar = (st === 'benar' || st === true || st === 'selesai');
        daftar.push({ butir: parseInt(k, 10), benar: benar, skor: skorPeta[k] });
      });
    } else if(Array.isArray(nilai)){
      nilai.forEach(function(b, i){
        var n = (typeof b === 'number') ? b : (i + 1);
        daftar.push({ butir: n, benar: true });
      });
    } else if(typeof nilai === 'object'){
      Object.keys(nilai).forEach(function(k){
        var v = nilai[k];
        if(v === true || v === 'benar' || v === 'selesai' || (v && v.benar)){
          daftar.push({ butir: parseInt(k, 10), benar: true });
        }
      });
    }

    return daftar.reduce(function(rantai, d){
      if(!(d.butir >= 1 && d.butir <= 15)) return rantai;
      var benar = !!d.benar;
      return rantai.then(function(){
        return dorong('/rest/v1/qiiora_progres_butir', {
          pengguna_id: u, bab: bab, butir: d.butir,
          status: benar ? 'benar' : 'dikerjakan',
          skor: benar
        }, true);
      });
    }, Promise.resolve(true));
  }

  // skor-kuis / skor-pretest / skor-posttest -> qiiora_hasil_kuis
  //   Bentuk nilai NYATA: { bab: 3, benar: 8, total: 10, waktu: "..." }
  function dorongSkor(namaKunci, nilai){
    var m = /^skor-(kuis|pretest|posttest)$/.exec(namaKunci);
    if(!m) return Promise.resolve(false);
    if(!nilai || typeof nilai !== 'object') return Promise.resolve(false);

    var mode = m[1];
    var benar = Number(nilai.benar || 0);
    var total = Number(nilai.total || 0);
    var bab   = Number(nilai.bab || 1);
    if(!(total > 0)) return Promise.resolve(false);
    if(benar > total) benar = total;
    if(!(bab >= 1 && bab <= 5)) bab = 1;

    return dorong('/rest/v1/qiiora_hasil_kuis', {
      pengguna_id: uid(), mode: mode, bab: bab, benar: benar, total: total
    });
  }

  // tema / ukuran-teks / kualitas-grafis -> qiiora_pengaturan
  //   Catatan: tema.js menulis LANGSUNG ke localStorage (bukan lewat
  //   QIIORA.simpan), jadi ditangkap dengan membungkus localStorage.
  function dorongPengaturan(namaKunci, nilai){
    if(namaKunci !== 'kualitas-grafis' && namaKunci !== 'tema' && namaKunci !== 'ukuran-teks')
      return Promise.resolve(false);

    var tema   = baca('qiiora:v2:tema', 'sistem');
    var ukuran = parseInt(baca('qiiora:v2:ukuran-teks', 100), 10);
    var grafis = baca('qiiora:v2:kualitas-grafis', 'otomatis');

    if(namaKunci === 'kualitas-grafis') grafis = nilai;
    if(namaKunci === 'tema')            tema   = nilai;
    if(namaKunci === 'ukuran-teks')     ukuran = parseInt(nilai, 10);

    if(['terang','gelap','sistem'].indexOf(tema) < 0) tema = 'sistem';
    if(['rendah','sedang','tinggi','otomatis'].indexOf(grafis) < 0) grafis = 'otomatis';
    if(!(ukuran >= 85 && ukuran <= 160)) ukuran = 100;

    return dorong('/rest/v1/qiiora_pengaturan', {
      pengguna_id: uid(), tema: tema, ukuran_teks: ukuran, kualitas_grafis: grafis
    }, true);
  }

  // kumpul -> qiiora_pengumpulan
  //   Bentuk nilai NYATA (assets/js/tugas.js):
  //     { "PT1": { link, status, catatan, waktu }, "PT2": {...} }
  //   Satu baris Supabase per tugas.
  function dorongKumpul(nilai){
    if(!nilai || typeof nilai !== 'object') return Promise.resolve(false);
    var kunciTugas = Object.keys(nilai);
    if(!kunciTugas.length) return Promise.resolve(false);

    return kunciTugas.reduce(function(rantai, k){
      var e = nilai[k];
      if(!e || typeof e !== 'object') return rantai;
      var tautan = e.link || e.tautan || null;
      var catatan = e.catatan || null;
      var st = e.status;
      // hanya kirim bila ada isi; entri kosong dilewati
      if(!tautan && !catatan) return rantai;
      return rantai.then(function(){
        return dorong('/rest/v1/qiiora_pengumpulan', {
          pengguna_id: uid(),
          tugas_id: String(k).slice(0, 60),
          bab: null,
          tautan: tautan,
          catatan: catatan,
          status: (st === 'dikirim' || st === 'dinilai') ? st : 'draf',
          dikirim: (st === 'dikirim' || st === 'dinilai')
            ? (e.waktu ? new Date(e.waktu).toISOString() : new Date().toISOString())
            : null
        }, true);
      });
    }, Promise.resolve(true));
  }

  // lkpd -> qiiora_lkpd_isian
  //   CATATAN JUJUR: sampai sekarang tidak ada berkas JS yang MENULIS
  //   kunci 'lkpd' (LKPD hanya dicetak, tidak disimpan). Fungsi ini
  //   disiapkan supaya begitu penulisnya ada, data langsung tersinkron.
  function dorongLkpd(nilai){
    if(!nilai || typeof nilai !== 'object') return Promise.resolve(false);
    var entri = Array.isArray(nilai) ? nilai : Object.keys(nilai).map(function(k){
      return { lkpd_id: k, isi: nilai[k] };
    });
    return entri.reduce(function(rantai, e){
      var id = e && (e.lkpd_id || e.id);
      if(!id) return rantai;
      return rantai.then(function(){
        return dorong('/rest/v1/qiiora_lkpd_isian', {
          pengguna_id: uid(),
          lkpd_id: String(id).slice(0, 60),
          judul: e.judul || null,
          isi: e.isi || e.jawaban || {},
          status: (e.status === 'dikirim' || e.status === 'dinilai') ? e.status : 'draf',
          dikirim: (e.status === 'dikirim' || e.status === 'dinilai')
            ? new Date().toISOString() : null
        }, true);
      });
    }, Promise.resolve(true));
  }

  // kumpul -> qiiora_pengumpulan
  //   Bentuk nilai NYATA (assets/js/tugas.js):
  //     { "PT1": { link, status, catatan, waktu }, "PT2": {...} }
  //   Satu baris Supabase per tugas.
  function dorongKumpul(nilai){
    if(!nilai || typeof nilai !== 'object') return Promise.resolve(false);
    var kunciTugas = Object.keys(nilai);
    if(!kunciTugas.length) return Promise.resolve(false);

    return kunciTugas.reduce(function(rantai, k){
      var e = nilai[k];
      if(!e || typeof e !== 'object') return rantai;
      var tautan = e.link || e.tautan || null;
      var catatan = e.catatan || null;
      var st = e.status;
      // hanya kirim bila ada isi; entri kosong dilewati
      if(!tautan && !catatan) return rantai;
      return rantai.then(function(){
        return dorong('/rest/v1/qiiora_pengumpulan', {
          pengguna_id: uid(),
          tugas_id: String(k).slice(0, 60),
          bab: null,
          tautan: tautan,
          catatan: catatan,
          status: (st === 'dikirim' || st === 'dinilai') ? st : 'draf',
          dikirim: (st === 'dikirim' || st === 'dinilai')
            ? (e.waktu ? new Date(e.waktu).toISOString() : new Date().toISOString())
            : null
        }, true);
      });
    }, Promise.resolve(true));
  }

  // lkpd -> qiiora_lkpd_isian
  function dorongLkpd(nilai){
    if(!nilai || typeof nilai !== 'object') return Promise.resolve(false);
    var entri = Array.isArray(nilai) ? nilai : Object.keys(nilai).map(function(k){
      return { lkpd_id: k, isi: nilai[k] };
    });
    return entri.reduce(function(rantai, e){
      var id = e.lkpd_id || e.id;
      if(!id) return rantai;
      return rantai.then(function(){
        return dorong('/rest/v1/qiiora_lkpd_isian', {
          pengguna_id: uid(),
          lkpd_id: String(id).slice(0, 60),
          judul: e.judul || null,
          isi: e.isi || e.jawaban || {},
          status: e.status === 'dikirim' || e.status === 'dinilai' ? e.status : 'draf',
          dikirim: e.status && e.status !== 'draf' ? new Date().toISOString() : null
        }, true);
      });
    }, Promise.resolve(true));
  }

  // jurnal-sesi-N -> qiiora_jurnal
  //   Bentuk nilai NYATA (assets/js/jurnal.js):
  //     { bab:3, tahuSebelum, tigaHal, bingungPilihan, bingungTeks,
  //       kehidupan, aksi, keyakinan{}, exit{}, catatanSim, waktu }
  //   Tabel qiiora_jurnal: (pengguna_id, tanggal, judul, teks, suasana)
  function dorongJurnal(namaKunci, nilai){
    var m = /^jurnal-sesi-(\d+)$/.exec(namaKunci);
    if(!m) return Promise.resolve(false);
    if(!nilai || typeof nilai !== 'object') return Promise.resolve(false);

    var bab = parseInt(m[1], 10);
    if(!(bab >= 1 && bab <= 8)) bab = 1;

    // gabungkan isi jurnal menjadi satu teks yang bermakna
    var bagian = [];
    function tambah(label, v){
      var t = String(v == null ? '' : v).trim();
      if(t) bagian.push(label + ': ' + t);
    }
    tambah('Tahu sebelum', nilai.tahuSebelum);
    tambah('Tiga hal baru', nilai.tigaHal);
    tambah('Masih bingung', nilai.bingungTeks || nilai.bingungPilihan);
    tambah('Contoh di kehidupan', nilai.kehidupan);
    tambah('Aksi yang akan dilakukan', nilai.aksi);
    tambah('Catatan simulasi', nilai.catatanSim);
    if(nilai.exit){
      tambah('Exit ticket (3)', nilai.exit.tiga);
      tambah('Exit ticket (2)', nilai.exit.dua);
      tambah('Exit ticket (1)', nilai.exit.satu);
    }
    var teks = bagian.join('\n');
    if(!teks) return Promise.resolve(false);

    // suasana: ambil dari keyakinan rata-rata bila ada
    var suasana = 'biasa';
    if(nilai.keyakinan){
      var ak = Object.keys(nilai.keyakinan).map(function(k){ return Number(nilai.keyakinan[k]) || 0; });
      var rata = ak.length ? ak.reduce(function(a,b){return a+b;},0) / ak.length : 0;
      if(rata >= 3.5) suasana = 'senang';
      else if(rata <= 1.5) suasana = 'sulit';
      else if(rata <= 2.5) suasana = 'bingung';
    }

    var tanggal = (nilai.waktu ? String(nilai.waktu).slice(0,10) : new Date().toISOString().slice(0,10));

    return dorong('/rest/v1/qiiora_jurnal', {
      pengguna_id: uid(),
      tanggal: tanggal,
      judul: 'Jurnal belajar Bab ' + bab,
      teks: teks.slice(0, 4000),
      suasana: suasana
    });
  }

  /* ---------- pembungkus QIIORA.simpan ---------- */
  function pasangPembungkus(){
    var asli = window.QIIORA.simpan;
    if(!asli || asli.__awan) return;
    var simpanAsli = asli.simpan.bind(asli);

    asli.simpan = function(kunci, nilai){
      var ok = simpanAsli(kunci, nilai);   // lokal dulu: selalu jalan
      if(!AKTIF || !sudahLogin()) return ok;

      try{
        if(/^progres-(?:butir-)?bab-\d+$/.test(kunci)) dorongProgres(kunci, nilai);
        else if(/^skor-(kuis|pretest|posttest)$/.test(kunci)) dorongSkor(kunci, nilai);
        else if(kunci === 'kualitas-grafis' ||
                kunci === 'tema' ||
                kunci === 'ukuran-teks')          dorongPengaturan(kunci, nilai);
        else if(kunci === 'kumpul')               dorongKumpul(nilai);
        else if(kunci === 'lkpd')                 dorongLkpd(nilai);
        else if(/^jurnal-sesi-\d+$/.test(kunci)) dorongJurnal(kunci, nilai);
      }catch(e){ /* sinkronisasi tidak boleh merusak penyimpanan lokal */ }

      return ok;
    };
    asli.__awan = true;
  }

  /* ---------- pembungkus localStorage.setItem ----------
     tema.js menulis langsung ke localStorage, melewati QIIORA.simpan.
     Tanpa pembungkus ini, pilihan tema & ukuran teks tidak pernah
     sampai ke Supabase. Dibungkus dengan hati-hati: penyimpanan lokal
     SELALU dijalankan lebih dulu, sinkronisasi menyusul. */
  function pasangPembungkusStorage(){
    if(localStorage.__awan) return;
    var asli = localStorage.setItem.bind(localStorage);
    try{
      localStorage.setItem = function(kunci, nilai){
        asli(kunci, nilai);                 // lokal dulu: tidak pernah gagal
        if(!AKTIF || !sudahLogin()) return;
        if(!/^qiiora:v2:(tema|ukuran-teks|kualitas-grafis)$/.test(kunci)) return;
        var nama = kunci.replace('qiiora:v2:', '');
        var v = nilai;
        try{ v = JSON.parse(nilai); }catch(e){ /* biarkan apa adanya */ }
        try{ dorongPengaturan(nama, v); }catch(e){}
      };
      localStorage.__awan = true;
    }catch(e){ /* browser menolak: abaikan, aplikasi tetap jalan */ }
  }

  /* ---------- API publik ---------- */
  window.QIIORA.awan = {
    aktif: function(){ return AKTIF; },
    alamat: function(){ return URL_BASE; },
    sudahLogin: sudahLogin,
    pengguna: pengguna,
    masuk: masuk,
    daftar: daftar,
    keluar: keluarAwan,
    profilSaya: function(){ return minta('/rest/v1/rpc/qiiora_profil_saya', { method:'POST', body:{} }); },
    ringkasSiswa: function(id){ return minta('/rest/v1/rpc/qiiora_ringkas_siswa', { method:'POST', body:{ p_siswa: id || null } }); },
    rekapKelas: function(idKelas){ return minta('/rest/v1/rpc/qiiora_ekspor_nilai', { method:'POST', body:{ p_kelas: idKelas } }); },
    jalankanAntrean: jalankanAntrean,
    antreanJumlah: function(){ return (baca(KUNCI_ANTRE, []) || []).length; },
    /* dipakai gerbang: setelah sesi lokal dibuat, coba login awan
       dengan email yang sama. Bila akun belum ada, daftarkan. */
    sinkronSesi: function(email, sandi){
      if(!AKTIF || !email) return Promise.resolve(null);
      var s = String(sandi || '');
      // Supabase menolak sandi < 6 karakter; pakai sandi turunan yang stabil
      if(s.length < 6){
        s = 'qiiora-' + String(email).split('@')[0].slice(0, 16) + '-2026';
      }
      return masuk(email, s).catch(function(){
        return daftar(email, s).catch(function(){ return null; });
      }).then(function(d){
        if(d && d.access_token){
          pasangPembungkus();
          pasangPembungkusStorage();
          jalankanAntrean();
        }
        return d;
      });
    }
  };

  /* ---------- mulai ---------- */
  function mulai(){
    if(!AKTIF){
      try{ console.info('[QIIORA] Supabase tidak aktif — sepenuhnya lokal.'); }catch(e){}
      return;
    }
    pasangPembungkus();
    pasangPembungkusStorage();
    if(sudahLogin()){
      jalankanAntrean();
      // segarkan token bila hampir kedaluwarsa
      var s = sesi();
      if(s && s.expires_at && (s.expires_at * 1000 - Date.now()) < 120000 && s.refresh_token){
        minta('/auth/v1/token?grant_type=refresh_token', {
          method:'POST', body:{ refresh_token: s.refresh_token }, prefer:'return=minimal'
        }).then(function(d){ if(d && d.access_token) tulis(KUNCI_SESI, d); })
          .catch(function(){ keluarAwan(); });
      }
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', mulai);
  } else {
    mulai();
  }
})();