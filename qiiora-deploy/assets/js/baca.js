(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};
  var KEY = 'baca';
  var pref = Object.assign({kontras:false}, (QIIORA.simpan && QIIORA.simpan.ambil(KEY, {})) || {});
  var root = document.documentElement;

  // Ukuran teks dikelola QIIORA.tema (satu sumber), kontras dikelola di sini.
  function terapkan(){
    if(QIIORA.tema) root.setAttribute('data-ukuran', QIIORA.tema.ukuran());
    if(pref.kontras) root.setAttribute('data-kontras','tinggi'); else root.removeAttribute('data-kontras');
  }
  function simpan(){ if(QIIORA.simpan) QIIORA.simpan.simpan(KEY, pref); }
  terapkan();

  document.addEventListener('DOMContentLoaded', function(){
    var tog = document.querySelector('[data-nav-toggle]');
    if(!tog || !tog.parentNode) return;
    var wadah = document.createElement('div');
    wadah.className = 'baca';
    var tombol = document.createElement('button');
    tombol.type = 'button'; tombol.className = 'baca-btn';
    tombol.setAttribute('aria-expanded','false'); tombol.setAttribute('aria-controls','bacaPanel');
    tombol.setAttribute('aria-label','Pengaturan tampilan baca');
    tombol.textContent = 'Aa';
    var panel = document.createElement('div');
    panel.className = 'baca-panel'; panel.id = 'bacaPanel'; panel.hidden = true;
    panel.setAttribute('role','group'); panel.setAttribute('aria-label','Tampilan baca');
    panel.innerHTML = '<p class="baca-judul">Ukuran teks</p><div class="baca-baris">' +
      '<button type="button" data-u="s" aria-label="Teks kecil">A</button>' +
      '<button type="button" data-u="m" aria-label="Teks sedang">A</button>' +
      '<button type="button" data-u="l" aria-label="Teks besar">A</button></div>' +
      '<button type="button" class="baca-kontras" data-k aria-pressed="false">Kontras tinggi</button>';
    wadah.appendChild(tombol); wadah.appendChild(panel);
    tog.parentNode.insertBefore(wadah, tog);

    function segarkan(){
      var u = QIIORA.tema ? QIIORA.tema.ukuran() : 's';
      Array.prototype.forEach.call(panel.querySelectorAll('[data-u]'), function(b){
        b.setAttribute('aria-pressed', String(b.getAttribute('data-u') === u));
      });
      panel.querySelector('[data-k]').setAttribute('aria-pressed', String(pref.kontras));
    }
    segarkan();
    tombol.addEventListener('click', function(){
      panel.hidden = !panel.hidden;
      tombol.setAttribute('aria-expanded', String(!panel.hidden));
    });
    panel.addEventListener('click', function(e){
      var u = e.target.getAttribute && e.target.getAttribute('data-u');
      if(u){ if(QIIORA.tema) QIIORA.tema.setUkuran(u); }
      else if(e.target.hasAttribute && e.target.hasAttribute('data-k')){ pref.kontras = !pref.kontras; }
      else return;
      terapkan(); simpan(); segarkan();
    });
    document.addEventListener('qiiora:ukuran', function(){ terapkan(); segarkan(); });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && !panel.hidden){ panel.hidden = true; tombol.setAttribute('aria-expanded','false'); tombol.focus(); }
    });
  });
})();
