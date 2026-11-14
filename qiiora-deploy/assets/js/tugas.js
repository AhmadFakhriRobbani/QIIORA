(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};

  var DRIVE_RE = [
    /^https:\/\/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]{10,120})(?:\/.*)?$/,
    /^https:\/\/drive\.google\.com\/drive\/folders\/([A-Za-z0-9_-]{10,120})(?:\?.*)?$/,
    /^https:\/\/drive\.google\.com\/open\?id=([A-Za-z0-9_-]{10,120})$/,
    /^https:\/\/docs\.google\.com\/(?:document|presentation|spreadsheets|forms)\/d\/([A-Za-z0-9_-]{10,120})(?:\/.*)?$/
  ];

  // Kembalikan { valid:boolean, kategori:string, alasan:string }
  function validasiTautan(raw){
    var s = String(raw || '').trim();
    if(!s) return { valid:false, kategori:'kosong', alasan:'Tautan masih kosong.' };
    if(/\s/.test(s)) return { valid:false, kategori:'berspasi', alasan:'Tautan tidak boleh mengandung spasi.' };
    if(!/^https:\/\//i.test(s)){
      return { valid:false, kategori:'bukan-https', alasan:'Tautan harus diawali https://.' };
    }
    var hostOk = /^(https:\/\/)?(www\.)?(drive|docs)\.google\.com\//i.test(s);
    if(!hostOk){
      return { valid:false, kategori:'bukan-drive', alasan:'Hanya tautan Google Drive (drive.google.com / docs.google.com) yang diterima.' };
    }
    for(var i=0;i<DRIVE_RE.length;i++){
      if(DRIVE_RE[i].test(s)){
        return { valid:true, kategori:'drive', alasan:'Tautan Drive valid.' };
      }
    }
    return { valid:false, kategori:'format-tak-dikenal', alasan:'Format tautan Drive tidak dikenali.' };
  }

  window.QIIORA.tugas = {
    validasiTautan: validasiTautan,

    // Ambil daftar pengumpulan tersimpan { PT1: {link,status,catatan,waktu}, ... }
    ambilKumpul: function(){
      return QIIORA.simpan.ambil('kumpul', {});
    },
    simpanKumpul: function(obj){
      QIIORA.simpan.simpan('kumpul', obj);
    },
    deteksiDuplikat: function(obj){
      var links = {};
      Object.keys(obj).forEach(function(k){
        var l = (obj[k] && obj[k].link || '').trim();
        if(!l) return;
        links[l] = links[l] || [];
        links[l].push(k);
      });
      return Object.keys(links).filter(function(l){ return links[l].length > 1; })
        .map(function(l){ return { link:l, id:links[l] }; });
    }
  };
})();