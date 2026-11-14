(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};
  window.$ = function(s, c){ return (c || document).querySelector(s); };
  window.$$ = function(s, c){ return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
})();
