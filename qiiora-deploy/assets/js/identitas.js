/* ============================================================
   QIIORA — Identitas Penyusun (non-editable, foto dari URL)

   DIPERBAIKI:
   - Isian readonly (span, bukan input).
   - Tidak ada NIS, hanya NIM.
   - Data default: Fiqi Islam Mahfutdin, 2683207016, 1A,
     Pendidikan Informatika.
   - Foto diambil dari URL eksternal (dikecilkan & disimpan
     di localStorage).
   ============================================================ */
(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};

  var KUNCI_ID = 'identitas';
  var KUNCI_FOTO = 'identitas-foto';
  var MAKS_SISI = 480;

  var DATA_DEFAULT = {
    nama: 'FIQI ISLAM MAHFUTDIN',
    nim: '2683207016',
    kelas: '1A',
    prodi: 'PENDIDIKAN INFORMATIKA'
  };

  var FOTO_URL = 'https://i.pinimg.com/736x/3e/aa/bf/3eaabf26098843197b25b1399227c7b9.jpg';

  function q(s){ return document.querySelector(s); }
  function qa(s){ return Array.prototype.slice.call(document.querySelectorAll(s)); }
  function simpan(){ return window.QIIORA.simpan || null; }

  /* PENTING: halaman ini adalah identitas PENYUSUN aplikasi, bukan
     data siswa yang sedang login. Siapa pun yang masuk, yang tampil
     tetap data Fiqi. Sebelumnya nilai diambil dari kunci 'identitas'
     yang diisi gerbang login, sehingga akun Gmail mana pun bisa
     menimpanya. Sekarang selalu ditulis dari DATA_DEFAULT. */
  function tampilkanIsian(){
    var s = simpan();
    if(s) s.simpan(KUNCI_ID, {
      nama: DATA_DEFAULT.nama, nim: DATA_DEFAULT.nim,
      kelas: DATA_DEFAULT.kelas, prodi: DATA_DEFAULT.prodi
    });
    qa('[data-id]').forEach(function(el){
      var k = el.getAttribute('data-id');
      el.textContent = DATA_DEFAULT[k] || '—';
    });
  }

  function segarkanKartu(){
    var d = { nama: DATA_DEFAULT.nama, nim: DATA_DEFAULT.nim,
              kelas: DATA_DEFAULT.kelas, prodi: DATA_DEFAULT.prodi };
    var terisi = true;
    var nama = q('[data-kartu-nama]');
    var nim = q('[data-kartu-nim]');
    var kelas = q('[data-kartu-kelas]');
    var prodi = q('[data-kartu-prodi]');
    var ava = q('[data-kartu-ava]');
    if(nama) nama.textContent = d.nama || DATA_DEFAULT.nama;
    if(nim) nim.textContent = d.nim || DATA_DEFAULT.nim;
    if(kelas) kelas.textContent = d.kelas || DATA_DEFAULT.kelas;
    if(prodi) prodi.textContent = d.prodi || DATA_DEFAULT.prodi;
    if(ava){
      var awal = String(d.nama || DATA_DEFAULT.nama).trim().split(/\s+/).slice(0,2)
        .map(function(w){ return w.charAt(0).toUpperCase(); }).join('');
      ava.textContent = awal || 'Q';
    }
    var kartu = q('[data-id-kartu]');
    if(kartu) kartu.classList.toggle('terisi', terisi);
  }

  function tampilkanFoto(dataURL){
    var bingkai = q('[data-foto-bingkai]');
    var img = q('[data-foto-img]');
    var kosong = q('[data-foto-kosong]');
    if(dataURL && dataURL.length > 100){
      if(img){ img.src = dataURL; img.hidden = false; }
      if(kosong) kosong.hidden = true;
      if(bingkai) bingkai.classList.add('siap');
    } else {
      if(img){ img.hidden = true; img.removeAttribute('src'); }
      if(kosong) kosong.hidden = false;
      if(bingkai) bingkai.classList.remove('siap');
    }
  }

  function muatFotoDariURL(url){
    var s = simpan();
    if(!s) return;
    var tersimpan = s.ambil(KUNCI_FOTO, null);
    if(tersimpan && typeof tersimpan === 'string' && tersimpan.length > 100){
      tampilkanFoto(tersimpan);
      return;
    }
    /* Dua percobaan:
       1) dengan crossOrigin -> bisa dikecilkan ke kanvas & disimpan
          di localStorage (jalan luring).
       2) bila CORS ditolak -> pakai URL apa adanya di tag <img>.
          Ini penting: situs ini harus tetap menampilkan foto walau
          sumbernya tidak mengizinkan kanvas. */
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function(){
      var w = img.width, h = img.height;
      var skala = Math.min(1, MAKS_SISI / Math.max(w, h));
      var cw = Math.round(w * skala), ch = Math.round(h * skala);
      var c = document.createElement('canvas');
      c.width = cw; c.height = ch;
      var g = c.getContext('2d');
      g.imageSmoothingQuality = 'high';
      g.drawImage(img, 0, 0, cw, ch);
      try{
        var dataURL = c.toDataURL('image/jpeg', .86);
        if(dataURL && dataURL.length > 100){
          s.simpan(KUNCI_FOTO, dataURL);
          tampilkanFoto(dataURL);
        }
      }catch(e){ pakaiURLLangsung(url); }
    };
    img.onerror = function(){ pakaiURLLangsung(url); };
    img.src = url;
  }

  /* Cadangan: tampilkan URL langsung tanpa dikecilkan. */
  function pakaiURLLangsung(url){
    var bingkai = q('[data-foto-bingkai]');
    var imgEl = q('[data-foto-img]');
    var kosong = q('[data-foto-kosong]');
    if(!imgEl) return;
    imgEl.crossOrigin = null;
    imgEl.onload = function(){
      if(kosong) kosong.hidden = true;
      if(bingkai) bingkai.classList.add('siap');
    };
    imgEl.onerror = function(){
      imgEl.hidden = true;
      if(kosong) kosong.hidden = false;
      if(bingkai) bingkai.classList.remove('siap');
    };
    imgEl.src = url;
    imgEl.hidden = false;
  }

  function mulai(){
    if(!q('#identitas')) return;
    tampilkanIsian();
    segarkanKartu();
    muatFotoDariURL(FOTO_URL);
  }

  document.addEventListener('qiiora:view', function(e){
    if(e.detail && e.detail.nama === 'identitas'){
      tampilkanIsian();
      segarkanKartu();
      var s = simpan();
      var foto = s ? s.ambil(KUNCI_FOTO, null) : null;
      if(foto && typeof foto === 'string' && foto.length > 100) tampilkanFoto(foto);
      else muatFotoDariURL(FOTO_URL);
    }
  });

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mulai);
  else mulai();
})();
