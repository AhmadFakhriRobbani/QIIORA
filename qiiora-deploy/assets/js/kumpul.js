(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};

  // Bagikan objek menjadi baris teks pesan (upaya minimal tanpa runtime polyfill yang berat)
  function encodeJson(obj){
    // Encode string aman untuk URL
    function b64u(str){
      var bytes = unescape(encodeURIComponent(str));
      var bin = '';
      for(var i=0;i<bytes.length;i++){
        bin += String.fromCharCode(bytes.charCodeAt(i));
      }
      return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    }
    return b64u(JSON.stringify(obj));
  }

  function decodeJson(code){
    var b64 = code.replace(/-/g,'+').replace(/_/g,'/');
    while(b64.length % 4) b64 += '=';
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for(var i=0;i<bin.length;i++) bytes[i] = bin.charCodeAt(i);
    return JSON.parse(decodeURIComponent(
      new TextDecoder('utf-8').decode(bytes)
    ));
  }

  function buildData(){
    var identitas = QIIORA.simpan.ambil('identitas', {});
    var kumpul = QIIORA.simpan.ambil('kumpul', {});
    var skor = {
      pretest: QIIORA.simpan.ambil('skor-pretest', {}),
      posttest: QIIORA.simpan.ambil('skor-posttest', {})
    };
    var jurnal = QIIORA.simpan.ambil('jurnal-ringkas', []);

    var tugasArr = (QIIORA.tugasList || []).map(function(t){
      var k = kumpul[t.id] || {};
      return {
        id: t.id,
        judul: t.judul,
        status: k.status || 'belum',
        link: k.link || '',
        catatan: k.catatan || '',
        waktu: k.waktu || ''
      };
    });

    return {
      v: 1,
      proyek: 'qiiora',
      waktu: new Date().toISOString(),
      identitas: {
        nama: identitas.nama || '',
        nim: identitas.nim || '',
        kelas: identitas.kelas || '',
        prodi: identitas.prodi || ''
      },
      tugas: tugasArr,
      skor: skor,
      jurnal: { ringkas: jurnal }
    };
  }

  window.QIIORA.kumpul = {
    susunKode: function(){
      return encodeJson(buildData());
    },
    bacaKode: function(code){
      return decodeJson(code);
    },
    batasKode: 6000
  };
})();