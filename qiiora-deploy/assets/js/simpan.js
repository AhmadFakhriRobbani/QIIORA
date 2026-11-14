(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};
  var CONFIG = window.QIIORA.CONFIG || {};
  var NS = CONFIG.NAMESPACE_STORAGE || 'qiiora:v2:';

  // Migrasi kunci penyimpanan lama jika ada
  try {
    var oldLkpd = localStorage.getItem('lkpd-siklus-air-v1');
    if(oldLkpd && !localStorage.getItem(NS + 'lkpd')) {
      localStorage.setItem(NS + 'lkpd', oldLkpd);
    }
    var oldId = localStorage.getItem('identitas-siklus-air-v1');
    if(oldId && !localStorage.getItem(NS + 'identitas')) {
      localStorage.setItem(NS + 'identitas', oldId);
    }
  } catch(e){}

  window.QIIORA.simpan = {
    ambil: function(key, fallback){
      try {
        var val = localStorage.getItem(NS + key);
        return val !== null ? JSON.parse(val) : fallback;
      } catch(e) {
        return fallback;
      }
    },
    simpan: function(key, val){
      try {
        localStorage.setItem(NS + key, JSON.stringify(val));
        return true;
      } catch(e) {
        return false;
      }
    },
    hapus: function(key){
      try {
        localStorage.removeItem(NS + key);
        return true;
      } catch(e) {
        return false;
      }
    }
  };
})();
