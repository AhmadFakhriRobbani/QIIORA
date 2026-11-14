/* ============================================================
   QIIORA — Komponen UI pengganti alert/confirm/prompt (§8)
   QIIORA.ui.toast / sheet / konfirmasi / pesan / coach
   Fokus terkelola, Esc + klik luar + geser menutup, tidak menumpuk.
   ============================================================ */
(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};

  var tumpukan = [];          // lapisan aktif, teratas = terakhir
  var fokusSebelum = null;

  function el(tag, cls, html){
    var e = document.createElement(tag);
    if(cls) e.className = cls;
    if(html != null) e.innerHTML = html;
    return e;
  }

  function kunciBody(){
    document.body.classList.toggle('ui-terkunci', tumpukan.length > 0);
  }

  function fokusable(wadah){
    return Array.prototype.slice.call(
      wadah.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')
    ).filter(function(e){ return e.offsetParent !== null; });
  }

  function jebakFokus(e, wadah){
    if(e.key !== 'Tab') return;
    var f = fokusable(wadah);
    if(!f.length) return;
    var pertama = f[0], terakhir = f[f.length - 1];
    if(e.shiftKey && document.activeElement === pertama){ e.preventDefault(); terakhir.focus(); }
    else if(!e.shiftKey && document.activeElement === terakhir){ e.preventDefault(); pertama.focus(); }
  }

  function daftar(lapisan){
    if(!tumpukan.length) fokusSebelum = document.activeElement;
    tumpukan.push(lapisan);
    kunciBody();
  }

  function lepas(lapisan){
    var i = tumpukan.indexOf(lapisan);
    if(i > -1) tumpukan.splice(i, 1);
    kunciBody();
    if(!tumpukan.length && fokusSebelum && fokusSebelum.focus){
      try{ fokusSebelum.focus({ preventScroll: true }); }catch(e){}
      fokusSebelum = null;
    }
  }

  /* ---------------- Toast ---------------- */
  var toastEl = null, toastTimer = null;
  function toast(pesan, opsi){
    opsi = opsi || {};
    if(!toastEl){
      toastEl = el('div', 'toast');
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    var jenis = opsi.jenis || 'info';
    toastEl.className = 'toast' + (jenis === 'ok' ? ' toast--ok' : jenis === 'bad' ? ' toast--bad' : '');
    var ico = jenis === 'ok'
      ? '<svg class="t-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>'
      : jenis === 'bad'
      ? '<svg class="t-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M12 7v7M12 17.5v.5"/><circle cx="12" cy="12" r="9"/></svg>'
      : '';
    toastEl.innerHTML = ico + '<span></span>';
    toastEl.querySelector('span').textContent = String(pesan);
    // paksa reflow agar transisi jalan saat toast dipanggil beruntun
    void toastEl.offsetWidth;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toastEl.classList.remove('show'); }, opsi.durasi || 2600);
    return toastEl;
  }

  /* ---------------- Sheet ---------------- */
  function sheet(opsi){
    opsi = opsi || {};
    // Panel inline: menyatu dengan tata letak, tanpa backdrop, tanpa merebut fokus.
    var lama = document.querySelectorAll('.ui-panel');
    Array.prototype.forEach.call(lama, function(x){ if(x.parentNode) x.parentNode.removeChild(x); });

    var panel = el('section', 'ui-panel');
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', opsi.label || opsi.judul || 'Rincian');
    var html = '<div class="ui-panel-head"><div><h2></h2></div>'
      + '<button class="ui-close" type="button" aria-label="Tutup">'
      + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>'
      + '<div class="ui-panel-body"></div>';
    if(opsi.aksi && opsi.aksi.length) html += '<div class="ui-panel-foot"></div>';
    panel.innerHTML = html;
    panel.querySelector('h2').textContent = opsi.judul || '';
    if(opsi.sub){
      var p = el('p'); p.textContent = opsi.sub;
      panel.querySelector('.ui-panel-head div').appendChild(p);
    }
    var body = panel.querySelector('.ui-panel-body');
    if(typeof opsi.isi === 'string') body.innerHTML = opsi.isi;
    else if(opsi.isi) body.appendChild(opsi.isi);

    var foot = panel.querySelector('.ui-panel-foot');
    if(foot){
      opsi.aksi.forEach(function(a){
        var b = el('button', 'btn ' + (a.kelas || 'btn--netral'));
        b.type = 'button';
        b.textContent = a.label;
        b.addEventListener('click', function(){
          if(a.aksi) a.aksi(tutup);
          if(a.tutup !== false) tutup();
        });
        foot.appendChild(b);
      });
    }

    var anchor = opsi.target || document.activeElement;
    if(!anchor || anchor === document.body || anchor === document.documentElement) anchor = null;
    var host = anchor ? (anchor.closest('.card, section, form, .panel, .box, .stage-copy') || anchor.parentNode) : null;
    if(host && host.parentNode){
      host.parentNode.insertBefore(panel, host.nextSibling);
    } else {
      var utama = document.querySelector('.view.is-active, main') || document.body;
      utama.appendChild(panel);
    }
    requestAnimationFrame(function(){
      panel.classList.add('on');
      try{ panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }catch(e){}
    });

    function tutup(){
      if(!panel.parentNode) return;
      panel.classList.remove('on');
      setTimeout(function(){ if(panel.parentNode) panel.parentNode.removeChild(panel); }, 220);
      if(opsi.onTutup) opsi.onTutup();
    }
    panel.querySelector('.ui-close').addEventListener('click', tutup);
    panel.addEventListener('keydown', function(e){ if(e.key === 'Escape') tutup(); });
    return { el: panel, tutup: tutup, body: body };
  }

  /* ---------------- Dialog konfirmasi ---------------- */
  function konfirmasi(opsi){
    // Konfirmasi dua-tahap di tempat: tombol berubah jadi "Yakin? [Ya] [Batal]" selama 4 dtk.
    opsi = opsi || {};
    var anchor = opsi.target || document.activeElement;
    if(!anchor || anchor === document.body || anchor === document.documentElement) anchor = null;
    var selesai = false;
    var strip = el('span', 'ui-yakin');
    strip.setAttribute('role', 'group');
    strip.setAttribute('aria-label', opsi.judul || 'Konfirmasi');
    var tanya = el('span', 'ui-yakin-tanya');
    tanya.textContent = opsi.judul || 'Yakin?';
    var ya = el('button', 'btn ' + (opsi.bahaya === false ? '' : 'btn--bahaya'));
    ya.type = 'button';
    ya.textContent = opsi.labelLanjut || 'Ya';
    var batal = el('button', 'btn btn--netral');
    batal.type = 'button';
    batal.textContent = opsi.labelBatal || 'Batal';
    strip.appendChild(tanya); strip.appendChild(ya); strip.appendChild(batal);

    var timer = null;
    function selesaikan(hasil){
      if(selesai) return;
      selesai = true;
      clearTimeout(timer);
      if(strip.parentNode) strip.parentNode.removeChild(strip);
      if(anchor){ anchor.style.display = anchor.getAttribute('data-ui-disp') || ''; anchor.removeAttribute('data-ui-disp'); try{ anchor.focus({ preventScroll: true }); }catch(e){} }
      if(opsi.onHasil) opsi.onHasil(!!hasil);
    }
    if(anchor && anchor.parentNode){
      anchor.setAttribute('data-ui-disp', anchor.style.display || '');
      anchor.parentNode.insertBefore(strip, anchor);
      anchor.style.display = 'none';
    } else {
      strip.className += ' ui-yakin--lepas';
      document.body.appendChild(strip);
    }
    ya.addEventListener('click', function(){ selesaikan(true); });
    batal.addEventListener('click', function(){ selesaikan(false); });
    strip.addEventListener('keydown', function(e){ if(e.key === 'Escape') selesaikan(false); });
    timer = setTimeout(function(){ selesaikan(false); }, 4000);
    setTimeout(function(){ try{ batal.focus({ preventScroll: true }); }catch(e){} }, 30);
    return { el: strip, tutup: function(){ selesaikan(false); } };
  }

  /* ---------------- Pesan inline ---------------- */
  function pesan(wadah, teks, jenis){
    if(!wadah) return null;
    var p = wadah.querySelector('.ui-pesan');
    if(!p){
      p = el('div', 'ui-pesan');
      p.setAttribute('role', jenis === 'galat' ? 'alert' : 'status');
      wadah.appendChild(p);
    }
    p.className = 'ui-pesan' + (jenis === 'galat' ? ' ui-pesan--galat' : jenis === 'ok' ? ' ui-pesan--ok' : '');
    p.setAttribute('role', jenis === 'galat' ? 'alert' : 'status');
    var ico = jenis === 'galat'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.5"/></svg>'
      : jenis === 'ok'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5v.5"/></svg>';
    p.innerHTML = ico + '<div></div>';
    p.querySelector('div').textContent = String(teks);
    p.hidden = false;
    return p;
  }
  function hapusPesan(wadah){
    if(!wadah) return;
    var p = wadah.querySelector('.ui-pesan');
    if(p) p.hidden = true;
  }

  /* ---------------- Coachmark ---------------- */
  function coach(opsi){
    // Gelembung ucapan non-modal: menempel pada elemen, tanpa backdrop, tanpa merebut fokus, bisa dilewati.
    opsi = opsi || {};
    var langkah = opsi.langkah || [];
    if(!langkah.length) return null;
    var i = 0;
    var kotak = el('div', 'ui-coach');
    kotak.setAttribute('role', 'note');
    kotak.setAttribute('aria-label', opsi.label || 'Petunjuk singkat');
    document.body.appendChild(kotak);
    var targetAktif = null;

    function bersihTarget(){
      if(targetAktif){ targetAktif.classList.remove('ui-coach-target'); targetAktif = null; }
    }

    function gambar(){
      var s = langkah[i];
      var t = s.target ? document.querySelector(s.target) : null;
      if(!t){ if(i < langkah.length - 1){ i++; gambar(); } else { tutup(); } return; }
      kotak.innerHTML = '<h3></h3><p></p><div class="ui-coach-foot">'
        + '<button type="button" class="ghost" data-lewati>Lewati</button>'
        + '<button type="button" data-maju>' + (i === langkah.length - 1 ? 'Selesai' : 'Lanjut') + '</button>'
        + '</div>';
      kotak.querySelector('h3').textContent = s.judul || '';
      kotak.querySelector('p').textContent = s.teks || '';
      bersihTarget();
      targetAktif = t;
      t.classList.add('ui-coach-target');
      var r = t.getBoundingClientRect();
      var tinggi = kotak.offsetHeight || 150;
      var atas = r.bottom + 12;
      if(atas + tinggi > window.innerHeight - 12) atas = Math.max(12, r.top - tinggi - 12);
      kotak.style.top = atas + 'px';
      kotak.style.left = Math.min(Math.max(12, r.left), Math.max(12, window.innerWidth - kotak.offsetWidth - 12)) + 'px';
      requestAnimationFrame(function(){ kotak.classList.add('on'); });
    }

    kotak.addEventListener('click', function(e){
      if(e.target.hasAttribute('data-maju')){
        if(i < langkah.length - 1){ i++; gambar(); } else { tutup(); }
      } else if(e.target.hasAttribute('data-lewati')){
        tutup();
      }
    });

    function tutup(){
      kotak.classList.remove('on');
      bersihTarget();
      setTimeout(function(){ if(kotak.parentNode) kotak.parentNode.removeChild(kotak); }, 220);
      if(opsi.onSelesai) opsi.onSelesai();
    }

    gambar();
    return { tutup: tutup };
  }

  /* ---------------- Esc global ---------------- */
  document.addEventListener('keydown', function(e){
    if(e.key !== 'Escape' || !tumpukan.length) return;
    var atas = tumpukan[tumpukan.length - 1];
    if(atas && atas.tutup){ e.preventDefault(); atas.tutup(false); }
  });

  window.QIIORA.ui = {
    toast: toast,
    sheet: sheet,
    konfirmasi: konfirmasi,
    pesan: pesan,
    hapusPesan: hapusPesan,
    coach: coach,
    adaLapisan: function(){ return tumpukan.length > 0; }
  };
})();
