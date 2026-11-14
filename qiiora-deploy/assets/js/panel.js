/* ============================================================
   QIIORA — Panel interaktif (pengganti pop-up minimalis)

   Pengganti QIIORA.ui.sheet. Bedanya:
   - bukan kotak dialog sekali-lihat, tapi KARTU yang menempel di
     sisi layar (desktop) / naik dari bawah (HP) dan bisa
     dilipat, dipindah, atau dibiarkan terbuka sambil membaca.
   - isinya bisa bertab, punya langkah (1/3), dan tiap butir
     bisa langsung membuka rute lain — jadi mengalir, bukan
     "klik lalu hilang".
   - tanpa scrim gelap: isi halaman tetap terlihat dan bisa diklik.

   API: QIIORA.panel.buka(opsi) -> { el, tutup, ganti }
        QIIORA.panel.tutup()
   opsi: judul, sub, iko, isi (string|Node), tab:[{label,isi}],
         langkah:{kini,total,label}, aksi:[{label,kelas,rute,aksi}],
         tautan:[{label,ket,rute,iko}], target (elemen pemicu)
   ============================================================ */
(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};

  var satu = null;   // hanya satu panel pada satu waktu

  function el(tag, cls, html){
    var e = document.createElement(tag);
    if(cls) e.className = cls;
    if(html != null) e.innerHTML = html;
    return e;
  }

  var IKON = {
    info:   '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.5"/>',
    buku:   '<path d="M4 5h7v15H4zM13 5h7v15h-7z"/>',
    air:    '<path d="M12 3c4 0 7 3 7 7 0 5-7 11-7 11S5 15 5 10c0-4 3-7 7-7z"/>',
    tanah:  '<path d="M3 8h18M3 13h18M3 18h18"/>',
    awan:   '<path d="M5 16a4 4 0 0 1 .8-7.9A5.5 5.5 0 0 1 16.9 6a4.5 4.5 0 0 1 .6 8.9"/>',
    kuis:   '<circle cx="12" cy="12" r="9"/><path d="M9.4 9.4a2.6 2.6 0 1 1 3.5 2.4v1.2"/>',
    langkah:'<path d="M4 18V9M10 18V5M16 18v-7M22 18v-4"/>',
    orang:  '<circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20c0-4 3.4-6.2 7.5-6.2s7.5 2.2 7.5 6.2"/>'
  };

  function ikonSVG(nama){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
      + (IKON[nama] || IKON.info) + '</svg>';
  }

  function tutup(){
    if(!satu) return;
    var p = satu;
    satu = null;
    p.el.classList.remove('on');
    p.el.classList.add('pergi');
    document.body.classList.remove('panel-ada');
    setTimeout(function(){
      if(p.el.parentNode) p.el.parentNode.removeChild(p.el);
    }, 320);
    if(p.opsi.onTutup) p.opsi.onTutup();
    document.dispatchEvent(new CustomEvent('qiiora:panel-tutup'));
  }

  function buka(opsi){
    opsi = opsi || {};
    if(satu) tutup();

    var panel = el('section', 'panel-kartu');
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', opsi.judul || 'Rincian');

    var kepala =
        '<div class="pk-head">'
      +   '<span class="pk-iko">' + ikonSVG(opsi.iko || 'info') + '</span>'
      +   '<div class="pk-judul-wrap">'
      +     (opsi.langkah ? '<p class="pk-langkah">Langkah ' + opsi.langkah.kini + ' dari ' + opsi.langkah.total
              + (opsi.langkah.label ? ' · ' + opsi.langkah.label : '') + '</p>' : '')
      +     '<h2 class="pk-judul"></h2>'
      +     (opsi.sub ? '<p class="pk-sub"></p>' : '')
      +   '</div>'
      +   '<div class="pk-tombol">'
      +     '<button class="pk-lipat" type="button" aria-label="Lipat panel" aria-expanded="true">'
      +       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>'
      +     '</button>'
      +     '<button class="pk-tutup" type="button" aria-label="Tutup panel">'
      +       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
      +     '</button>'
      +   '</div>'
      + '</div>';

    var tabHTML = '';
    if(opsi.tab && opsi.tab.length){
      tabHTML = '<div class="pk-tabs" role="tablist">'
        + opsi.tab.map(function(t, i){
            return '<button type="button" role="tab" aria-selected="' + (i === 0) + '">' + t.label + '</button>';
          }).join('')
        + '</div>';
    }

    panel.innerHTML = kepala
      + '<div class="pk-body">'
      +   tabHTML
      +   '<div class="pk-isi"></div>'
      +   (opsi.aksi && opsi.aksi.length ? '<div class="pk-aksi"></div>' : '')
      +   (opsi.tautan && opsi.tautan.length ? '<div class="pk-tautan-wrap"><p class="pk-tautan-label">Lanjut ke</p><div class="pk-tautan"></div></div>' : '')
      + '</div>';

    panel.querySelector('.pk-judul').textContent = opsi.judul || '';
    if(opsi.sub) panel.querySelector('.pk-sub').textContent = opsi.sub;

    var isi = panel.querySelector('.pk-isi');

    function isiTab(i){
      isi.innerHTML = '';
      if(opsi.tab && opsi.tab.length){
        var t = opsi.tab[i] || opsi.tab[0];
        if(typeof t.isi === 'string') isi.innerHTML = t.isi;
        else if(t.isi) isi.appendChild(t.isi);
        Array.prototype.forEach.call(panel.querySelectorAll('.pk-tabs button'), function(b, bi){
          b.setAttribute('aria-selected', String(bi === i));
        });
      } else if(typeof opsi.isi === 'string'){
        isi.innerHTML = opsi.isi;
      } else if(opsi.isi){
        isi.appendChild(opsi.isi);
      }
      isi.scrollTop = 0;
    }
    isiTab(0);

    Array.prototype.forEach.call(panel.querySelectorAll('.pk-tabs button'), function(b, i){
      b.addEventListener('click', function(){ isiTab(i); });
    });

    /* aksi */
    var aksiWadah = panel.querySelector('.pk-aksi');
    if(aksiWadah){
      opsi.aksi.forEach(function(a){
        var b = el('button', 'btn ' + (a.kelas || 'btn--ghost btn--sm'));
        b.type = 'button';
        b.textContent = a.label;
        if(a.rute){
          b.addEventListener('click', function(){
            if(window.QIIORA.router) QIIORA.router.pergi(a.rute);
            tutup();
          });
        } else {
          b.addEventListener('click', function(){
            if(a.aksi) a.aksi(tutup);
            if(a.tutup !== false) tutup();
          });
        }
        aksiWadah.appendChild(b);
      });
    }

    /* tautan lanjutan: mengalir ke halaman lain, bukan sekadar menutup */
    var tautanWadah = panel.querySelector('.pk-tautan');
    if(tautanWadah){
      opsi.tautan.forEach(function(t){
        var b = el('button', 'pk-tautan-item');
        b.type = 'button';
        b.innerHTML = '<span class="pk-tautan-iko">' + ikonSVG(t.iko || 'langkah') + '</span>'
          + '<span class="pk-tautan-txt"><b></b><i></i></span>'
          + '<svg class="pk-panah" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
        b.querySelector('b').textContent = t.label;
        b.querySelector('i').textContent = t.ket || '';
        b.addEventListener('click', function(){
          if(t.aksi) t.aksi();
          if(t.rute && window.QIIORA.router){
            QIIORA.router.pergi(t.rute);
            tutup();
          } else if(!t.aksi){
            tutup();
          }
        });
        tautanWadah.appendChild(b);
      });
    }

    /* lipat / buka */
    var lipat = panel.querySelector('.pk-lipat');
    lipat.addEventListener('click', function(){
      var terlipat = panel.classList.toggle('terlipat');
      lipat.setAttribute('aria-expanded', String(!terlipat));
      lipat.setAttribute('aria-label', terlipat ? 'Buka panel' : 'Lipat panel');
    });

    panel.querySelector('.pk-tutup').addEventListener('click', tutup);
    panel.addEventListener('keydown', function(e){
      if(e.key === 'Escape'){ e.stopPropagation(); tutup(); }
    });

    document.body.appendChild(panel);
    document.body.classList.add('panel-ada');
    requestAnimationFrame(function(){ panel.classList.add('on'); });

    satu = { el: panel, opsi: opsi, tutup: tutup, ganti: function(o){ tutup(); return buka(o); } };

    // fokus ke judul supaya pembaca layar tahu panel berganti,
    // tanpa merebut fokus dari isi halaman
    if(opsi.fokus !== false){
      panel.querySelector('.pk-judul').setAttribute('tabindex', '-1');
      try{ panel.querySelector('.pk-judul').focus({ preventScroll: true }); }catch(e){}
    }

    document.dispatchEvent(new CustomEvent('qiiora:panel', { detail: { judul: opsi.judul } }));
    return satu;
  }

  /* ---------- jembatan: menggantikan ui.sheet lama ---------- */
  function dariSheet(lama){
    // opsi ui.sheet: {judul, sub, isi, aksi:[{label,kelas}], target, label}
    var isiNode = null;
    if(typeof lama.isi === 'string') isiNode = lama.isi;
    else if(lama.isi) isiNode = lama.isi;

    return buka({
      judul: lama.judul || lama.label || 'Rincian',
      sub: lama.sub,
      iko: lama.iko || 'info',
      isi: isiNode,
      aksi: (lama.aksi || []).map(function(a){
        return { label: a.label, kelas: a.kelas || 'btn--ghost btn--sm', aksi: a.aksi };
      }),
      tautan: lama.tautan,
      langkah: lama.langkah
    });
  }

  window.QIIORA.panel = {
    buka: buka,
    tutup: tutup,
    ada: function(){ return !!satu; },
    aktif: function(){ return satu ? satu.el : null; },
    /* dipakai halaman lain yang dulu memanggil ui.sheet */
    dariSheet: dariSheet
  };

  /* ui.sheet dialihkan ke panel interaktif, sekali saja di sini */
  document.addEventListener('DOMContentLoaded', function(){
    if(window.QIIORA.ui && QIIORA.ui.sheet){
      var asli = QIIORA.ui.sheet;
      QIIORA.ui.sheet = function(opsi){ return dariSheet(opsi || {}); };
      QIIORA.ui.sheet.asli = asli;
    }
  });
})();