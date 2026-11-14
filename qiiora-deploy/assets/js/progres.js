(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};

  // Status langkah per bab: 'belum' | 'sedang' | 'selesai'
  var KEY = 'progres-bab-';

  function defaultProgres(){
    return {
      pemanasan: 'belum',
      belajar: 'belum',
      eksplorasi: 'belum',
      latihan: 'belum',
      refleksi: 'belum',
      posttest: 'belum'
    };
  }

  window.QIIORA.progres = {
    ambil: function(bab){
      var d = QIIORA.simpan.ambil(KEY + bab, null);
      var base = defaultProgres();
      if(!d) return base;
      for(var k in base){ if(d[k]) base[k] = d[k]; }
      return base;
    },
    set: function(bab, langkah, status){
      var d = this.ambil(bab);
      d[langkah] = status;
      QIIORA.simpan.simpan(KEY + bab, d);
      return d;
    },
    lanjut: function(bab, langkah){
      return this.set(bab, langkah, 'selesai');
    }
  };
})();