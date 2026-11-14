(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};

  var STORAGE = 'skor-';

  function acak(arr){
    var a = arr.slice();
    for(var i = a.length - 1; i > 0; i--){
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Kunci jawaban setelah dipilih; jawaban terkunci permanen
  function normalIsian(s){
    return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  window.QIIORA.kuis = {
    acak: acak,

    // Siapkan paket soal berdasarkan mode
    siapkan: function(mode, n, bank){
      var pool = (bank || QIIORA.soal || []).filter(function(s){ return s.bab === (window.__qiiora_bab || 3); });
      if(mode === 'pretest') pool = pool.filter(function(s){ return s.tingkat <= 1; });
      var pilihan = acak(pool).slice(0, n || pool.length);
      return pilihan;
    },

    // Buat representasi tampilan soal PG dengan urutan opsi diacak
    buatPg: function(soal){
      var idx = soal.pilihan.map(function(_, i){ return i; });
      idx = acak(idx);
      return {
        id: soal.id,
        tipe: 'pg',
        stem: soal.stem,
        opsi: idx.map(function(i){ return soal.pilihan[i]; }),
        jawaban: idx.indexOf(soal.jawaban),
        pembahasan: soal.pembahasan,
        indikator: soal.indikator,
        tingkat: soal.tingkat
      };
    },

    cekPg: function(tampilan, dipilih, jawabanBenar){
      return dipilih === jawabanBenar;
    },

    buatBs: function(s){
      return { id:s.id, tipe:'bs', stem:s.stem, opsi:['Benar','Salah'], jawaban:s.jawaban, pembahasan:s.pembahasan, indikator:s.indikator };
    },

    // ===== Tipe soal tambahan: isian, urutkan, jodohkan, hitung =====
    // Menggambar kontrol di `wadah`, memanggil selesai(benar, kunciTeks) sekali setelah dijawab (jawaban terkunci).
    renderKhusus: function(soal, wadah, selesai){
      wadah.innerHTML = '';
      var sudah = false;
      function el(tag, cls, teks){ var e = document.createElement(tag); if(cls) e.className = cls; if(teks !== undefined) e.textContent = teks; return e; }
      function akhir(benar, kunci){ if(sudah) return; sudah = true; selesai(benar, kunci); }
      var tombol = el('button', 'btn khusus-cek', 'Periksa jawaban');
      tombol.type = 'button';
      var kotak = el('div', 'khusus');
      wadah.appendChild(kotak);

      if(soal.tipe === 'isian'){
        var inp = el('input', 'khusus-input'); inp.type = 'text'; inp.autocomplete = 'off';
        inp.setAttribute('aria-label', 'Jawaban singkat'); inp.placeholder = 'Ketik jawabanmu';
        kotak.appendChild(inp); kotak.appendChild(tombol);
        var cek = function(){
          if(sudah || !normalIsian(inp.value)) return;
          var terima = soal.jawaban.concat(soal.sinonim || []).map(normalIsian);
          var b = terima.indexOf(normalIsian(inp.value)) !== -1;
          inp.disabled = true; tombol.disabled = true;
          inp.classList.add(b ? 'ok' : 'salah');
          akhir(b, soal.jawaban[0]);
        };
        tombol.addEventListener('click', cek);
        inp.addEventListener('keydown', function(e){ if(e.key === 'Enter') cek(); });

      } else if(soal.tipe === 'urutkan'){
        var dipilih = [];
        var daftar = el('div', 'susun-pilih');
        var hasil = el('ol', 'susun-hasil');
        hasil.setAttribute('aria-label', 'Urutan jawabanmu');
        var reset = el('button', 'btn btn--ghost btn--sm', 'Ulangi susunan'); reset.type = 'button';
        var btnItem = [];
        acak(soal.item.map(function(_, i){ return i; })).forEach(function(i){
          var b = el('button', 'susun-item', soal.item[i]); b.type = 'button';
          b.addEventListener('click', function(){
            if(sudah || dipilih.indexOf(i) !== -1) return;
            dipilih.push(i); b.disabled = true;
            hasil.appendChild(el('li', '', soal.item[i]));
            tombol.disabled = dipilih.length !== soal.item.length;
          });
          btnItem.push(b); daftar.appendChild(b);
        });
        reset.addEventListener('click', function(){
          if(sudah) return;
          dipilih = []; hasil.innerHTML = ''; tombol.disabled = true;
          btnItem.forEach(function(b){ b.disabled = false; });
        });
        tombol.disabled = true;
        kotak.appendChild(el('p', 'khusus-petunjuk', 'Ketuk kartu satu per satu sesuai urutan yang benar.'));
        kotak.appendChild(daftar); kotak.appendChild(hasil);
        var aksi = el('div', 'khusus-aksi'); aksi.appendChild(tombol); aksi.appendChild(reset); kotak.appendChild(aksi);
        tombol.addEventListener('click', function(){
          if(sudah) return;
          var b = dipilih.every(function(v, k){ return v === soal.jawaban[k]; });
          tombol.disabled = true; reset.disabled = true;
          hasil.classList.add(b ? 'ok' : 'salah');
          akhir(b, soal.jawaban.map(function(i){ return soal.item[i]; }).join(' → '));
        });

      } else if(soal.tipe === 'jodohkan'){
        var pilihan = [];
        var urutKanan = acak(soal.kanan.map(function(_, i){ return i; }));
        soal.kiri.forEach(function(teks, ki){
          var baris = el('div', 'jodoh-baris');
          var lab = el('label', '', teks); var id = 'jd-' + soal.id + '-' + ki; lab.setAttribute('for', id);
          var sel = el('select'); sel.id = id;
          var o0 = el('option', '', '— pilih pasangan —'); o0.value = ''; sel.appendChild(o0);
          urutKanan.forEach(function(ri){ var o = el('option', '', soal.kanan[ri]); o.value = String(ri); sel.appendChild(o); });
          sel.addEventListener('change', function(){ tombol.disabled = pilihan.some(function(s){ return s.value === ''; }); });
          pilihan.push(sel); baris.appendChild(lab); baris.appendChild(sel); kotak.appendChild(baris);
        });
        tombol.disabled = true; kotak.appendChild(tombol);
        tombol.addEventListener('click', function(){
          if(sudah) return;
          var semuaBenar = true;
          pilihan.forEach(function(sel, ki){
            var b = Number(sel.value) === soal.jawaban[ki];
            if(!b) semuaBenar = false;
            sel.disabled = true; sel.classList.add(b ? 'ok' : 'salah');
          });
          tombol.disabled = true;
          akhir(semuaBenar, soal.kiri.map(function(k, i){ return k + ' = ' + soal.kanan[soal.jawaban[i]]; }).join('; '));
        });

      } else if(soal.tipe === 'hitung'){
        var angka = el('input', 'khusus-input'); angka.type = 'text'; angka.inputMode = 'decimal'; angka.autocomplete = 'off';
        angka.setAttribute('aria-label', 'Jawaban angka'); angka.placeholder = 'Ketik angka';
        kotak.appendChild(angka); kotak.appendChild(el('span', 'khusus-satuan', soal.satuan || '')); kotak.appendChild(tombol);
        var cekH = function(){
          var v = parseFloat(String(angka.value).replace(',', '.'));
          if(sudah || isNaN(v)) return;
          var b = Math.abs(v - soal.jawaban) <= (soal.toleransi || 0);
          angka.disabled = true; tombol.disabled = true; angka.classList.add(b ? 'ok' : 'salah');
          akhir(b, soal.jawaban + ' ' + (soal.satuan || ''));
        };
        tombol.addEventListener('click', cekH);
        angka.addEventListener('keydown', function(e){ if(e.key === 'Enter') cekH(); });
      }
    },

    catatHasil: function(mode, bab, benar, total){
      var keys = {};
      keys[STORAGE + mode] = { bab: bab, benar: benar, total: total, waktu: new Date().toISOString() };
      Object.keys(keys).forEach(function(k){ QIIORA.simpan.simpan(k, keys[k]); });

      // simpan terbaik
      var pct = total ? Math.round(benar / total * 100) : 0;
      var bestKey = STORAGE + mode + '-best-bab-' + bab;
      var prev = QIIORA.simpan.ambil(bestKey, -1);
      if(pct > prev) QIIORA.simpan.simpan(bestKey, pct);
      return pct;
    },

    ambilHasil: function(mode){
      return QIIORA.simpan.ambil(STORAGE + mode, {});
    }
  };
})();