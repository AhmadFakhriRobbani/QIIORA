/* ============================================================
   QIIORA — Beranda: ringkasan progres & tombol "Lanjutkan belajar"
   ============================================================ */
(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};

  document.addEventListener('DOMContentLoaded', function(){
    var heroProg = document.querySelector('[data-hero-progress]');
    var barFill = document.querySelector('[data-hp-fill]');
    var numPersen = document.querySelector('[data-hp-persen]');
    var noteEl = document.querySelector('[data-hp-note]');
    var lanjutBtn = document.querySelector('[data-lanjut]');
    var lanjutLab = document.querySelector('[data-lanjut-label]');

    if(!heroProg) return;

    // Hitung progres Bab 3 dari data-layer (progres.js tidak selalu dimuat di beranda)
    var bab3 = {};
    try{
      if(QIIORA.progres) bab3 = QIIORA.progres.ambil('3');
      else if(QIIORA.simpan) bab3 = QIIORA.simpan.ambil('progres-bab-3', {}) || {};
    }catch(e){ bab3 = {}; }
    var langkahs = ['pemanasan', 'belajar', 'eksplorasi', 'latihan', 'refleksi', 'posttest'];
    var selesai = 0;
    langkahs.forEach(function(l){
      if(bab3[l] === 'selesai') selesai++;
    });
    var pct = Math.round(selesai / langkahs.length * 100);

    // Kartu progres selalu tampil: keadaan 0% pun informatif (bukan halaman kosong).
    heroProg.hidden = false;
    if(barFill) barFill.style.width = pct + '%';
    if(numPersen) numPersen.textContent = pct + '%';
    var bar = heroProg.querySelector('[role="progressbar"]');
    if(bar) bar.setAttribute('aria-valuenow', String(pct));

    if(noteEl){
      if(pct === 100) noteEl.textContent = 'Bab 3 selesai! Kamu bisa memilih bab lain atau mengulang kuis dan LKPD.';
      else if(pct > 0) noteEl.textContent = 'Progres Bab 3: ' + selesai + ' dari ' + langkahs.length + ' langkah selesai.';
      else noteEl.textContent = 'Belum dimulai. Bab 3 punya 6 langkah: pemanasan sampai post-test.';
    }

    if(lanjutLab) lanjutLab.textContent = pct === 100 ? 'Pilih bab' : (pct > 0 ? 'Lanjutkan Bab 3' : 'Mulai Bab 3');
    if(lanjutBtn) lanjutBtn.setAttribute('href', pct === 100 ? '#/modul' : 'bab/bab-3-siklus-air.html');

    /* ---------- Ornamen latar + kontrol kualitas grafis ---------- */
    if(window.QIIORA.ornamen){
      QIIORA.ornamen.pasang();
      var seg = document.querySelectorAll('[data-kualitas]');
      var awal = QIIORA.ornamen.pref();
      Array.prototype.forEach.call(seg, function(b){
        b.setAttribute('aria-pressed', String(b.getAttribute('data-kualitas') === awal));
        b.addEventListener('click', function(){
          var pilih = b.getAttribute('data-kualitas');
          QIIORA.ornamen.setKualitas(pilih);
          try{ QIIORA.simpan.simpan('kualitas-grafis', pilih); }catch(e){}
          Array.prototype.forEach.call(seg, function(x){
            x.setAttribute('aria-pressed', String(x === b));
          });
          if(QIIORA.ui && QIIORA.ui.toast){
            QIIORA.ui.toast('Kualitas grafis: ' + (pilih === 'otomatis' ? 'Otomatis (' + QIIORA.ornamen.kualitas() + ')' : pilih), { jenis: 'ok' });
          }
        });
      });
    }

    /* ---------- Tur perkenalan sekali jalan ---------- */
    var KUNCI_TUR = 'tur-beranda';
    var sudahTur = false;
    try{ sudahTur = !!QIIORA.simpan.ambil(KUNCI_TUR, false); }catch(e){}
    if(false && !sudahTur && QIIORA.ui && window.innerWidth > 640 && (!location.hash || /^#\/?(beranda)?$/.test(location.hash))){
      setTimeout(function(){
        var c = QIIORA.ui.coach({
          label: 'Perkenalan QIIORA',
          langkah: [
            { judul:'Selamat datang di QIIORA', teks:'Media belajar siklus air dengan simulasi 3D. Mulai dari tombol di sini.', target:'.hero-actions' },
            { judul:'Semua halaman ada di menu', teks:'Beranda, Modul, Simulasi, Kuis, dan LKPD. Di HP menu ada di bawah.', target:'.nav' },
            { judul:'Cari cepat', teks:'Tekan Ctrl+K (atau tombol Cari) untuk melompat ke halaman atau istilah mana pun.', target:'[data-cari]' }
          ],
          onSelesai: function(){
            try{ QIIORA.simpan.simpan(KUNCI_TUR, true); }catch(e){}
          }
        });
        if(!c) return;
      }, 900);
    }

  });
})();