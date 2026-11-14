/* ============================================================
   QIIORA — Gerbang masuk (rombak total)

   Dari gerbang "isi 4 kolom" menjadi LOGIN ala Google:
   - Email / Gmail + Password
   - Ikon mata untuk show/hide password
   - Teks galat merah bila salah
   - Tombol "Masuk dengan Google" + ikon
   - Pilih akun cepat (multi-akun)
   - Sisi kiri: animasi pemandangan hujan (acuan video referensi)
   - Tidak ada kata sandi nyata: validasi cukup email:format + password:min 3
   ============================================================ */
(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};

  var overlay = null;
  var KUNCI_SESI = 'sesi-masuk';
  var AKUN_KEY = 'akun-tersimpan';

  function el(t, c, h){
    var e = document.createElement(t);
    if(c) e.className = c;
    if(h != null) e.innerHTML = h;
    return e;
  }
  function q(s){ return document.querySelector(s); }
  function qa(s){ return Array.prototype.slice.call(document.querySelectorAll(s)); }
  function simpan(){ return window.QIIORA.simpan || null; }

  function bacaAkun(){
    var s = simpan();
    var raw = s ? s.ambil(AKUN_KEY, []) : [];
    return Array.isArray(raw) ? raw : [];
  }

  function simpanAkun(email, nama){
    var daftar = bacaAkun();
    daftar = daftar.filter(function(a){ return a.email !== email; });
    daftar.unshift({ email: email, nama: nama || email.split('@')[0], waktu: Date.now() });
    if(daftar.length > 5) daftar = daftar.slice(0, 5);
    var s = simpan();
    if(s) s.simpan(AKUN_KEY, daftar);
  }

  function validasiEmail(e){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  function acakEmail(){
    return 'siswa' + Math.floor(Math.random() * 10000) + '@qiiora.sch.id';
  }

  /* ---------- SVG ikon ---------- */
  var SVG = {
    google: '<svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>',
    mataBuka: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    mataTutup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" width="18" height="18"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>',
    qii: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" width="40" height="40"><path d="M12 2l8 4.5v9L12 20l-8-4.5v-9z"/><path d="M12 2v18M4 6.5l8 4.5 8-4.5"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>',
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" width="16" height="16"><path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><polyline points="22,6 12,13 2,6"/></svg>'
  };

  /* ---------- kanvas animasi sisi kiri ---------- */
  var animKanvas = null, animCtx = null, animRaf = null;

  function buatAnimasi(wadah){
    var c = document.createElement('canvas');
    c.className = 'gb-anim';
    wadah.appendChild(c);
    animKanvas = c;
    animCtx = c.getContext('2d');
    if(!animCtx) return;

    function ukur(){
      var w = wadah.clientWidth, h = wadah.clientHeight;
      c.width = w; c.height = h;
      c.style.width = w + 'px'; c.style.height = h + 'px';
    }
    ukur();

    var tetes = [];
    for(var i = 0; i < 40; i++){
      tetes.push({ x: Math.random(), y: Math.random(), v: .8 + Math.random() * 1.2,
        p: .3 + Math.random() * .7, alpa: .2 + Math.random() * .4 });
    }

    var jam = 0;
    function gambar(ts){
      animRaf = requestAnimationFrame(gambar);
      jam += .016;
      var t = jam;
      var w = c.width, h = c.height;
      var g = animCtx;

      var lg = g.createLinearGradient(0,0,0,h);
      lg.addColorStop(0, '#7EC3E8');
      lg.addColorStop(.4, '#B9E2F4');
      lg.addColorStop(.72, '#DCEFFB');
      lg.addColorStop(1, '#F0E8C8');
      g.fillStyle = lg;
      g.fillRect(0,0,w,h);

      // awan besar
      g.save();
      g.fillStyle = '#FFFFFF';
      g.globalAlpha = .95;
      var cx = w * (.42 + Math.sin(t * .12) * .04);
      var cy = h * .18;
      var r = w * .16;
      [[0,0,1],[.85,.16,.72],[-.82,.2,.64],[.22,-.46,.58],[-.32,-.38,.50],[1.48,.28,.44],[-1.5,.32,.38]]
        .forEach(function(o){
          g.beginPath();
          g.arc(cx + o[0]*r, cy + o[1]*r, r*o[2], 0, 6.2832);
          g.fill();
        });
      g.globalAlpha = .55;
      g.fillStyle = '#C8DCE8';
      g.beginPath();
      g.ellipse(cx - r*.15, cy + r*.62, r*1.7, r*.38, 0, 0, 6.2832);
      g.fill();
      g.restore();

      // bukit
      var bh = h * .70;
      g.fillStyle = '#6DA562';
      g.beginPath();
      g.moveTo(0, bh + 10);
      g.bezierCurveTo(w*.25, bh - h*.12, w*.55, bh + h*.14, w, bh - h*.04);
      g.lineTo(w, h+2); g.lineTo(0, h+2); g.closePath();
      g.fill();

      g.fillStyle = '#84BF72';
      g.beginPath();
      g.moveTo(0, bh - 4);
      g.bezierCurveTo(w*.3, bh - h*.10, w*.50, bh + h*.10, w, bh - h*.02);
      g.lineTo(w, bh + 4); g.lineTo(0, bh + 4); g.closePath();
      g.fill();

      // pohon
      g.fillStyle = '#3E7A48';
      for(var px = 20; px < w; px += 26){
        var pt = bh - 6 + ((px * 37) % 30) * .6;
        g.beginPath();
        g.moveTo(px, bh); g.lineTo(px - 10, bh - 4);
        g.lineTo(px, pt); g.lineTo(px + 10, bh - 4); g.closePath();
        g.fill();
      }

      // tetes
      for(var i = 0; i < tetes.length; i++){
        var tt = tetes[i];
        var tx = ((tt.x + t * tt.v * .012) % 1.05 - .025) * w;
        var ty = ((tt.y + t * tt.v * .18) % 1) * h;
        g.save();
        g.globalAlpha = tt.alpa * (.6 + Math.sin(t * .8 + i) * .15);
        g.strokeStyle = '#C8E8FA';
        g.lineWidth = 1.2 + tt.p;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(tx, ty);
        g.lineTo(tx - 2.5 * tt.p, ty + 10 * tt.p);
        g.stroke();
        g.restore();
      }

      // teks
      g.save();
      g.fillStyle = 'rgba(255,255,255,.92)';
      g.font = 'bold ' + (w * .078) + 'px system-ui, sans-serif';
      g.textAlign = 'center';
      g.fillText('QIIORA', w/2, h * .48);
      g.font = (w * .026) + 'px system-ui, sans-serif';
      g.fillStyle = 'rgba(255,255,255,.8)';
      g.fillText('Siklus Air · IPAS Fase C · Kelas V', w/2, h * .54);
      g.textAlign = 'start';
      g.restore();

      // pantulan
      g.save();
      g.globalAlpha = .18;
      g.fillStyle = '#FFFFFF';
      g.fillRect(0, h - 8, w, 8);
      g.restore();
    }
    animRaf = requestAnimationFrame(gambar);
    window.addEventListener('resize', function(){ ukur(); });
    return c;
  }

  function hentikanAnimasi(){
    if(animRaf) cancelAnimationFrame(animRaf);
    animRaf = null; animKanvas = null; animCtx = null;
  }

  /* ---------- bangun gerbang ---------- */
  function bangun(){
    if(overlay) return;

    overlay = el('div', 'gerbang');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Masuk ke QIIORA');

    var card = el('div', 'gb-card');

    /* tombol silang: user minta ada opsi close di dialog masuk.
       Saat ditutup, gerbang disembunyikan dan muncul tombol
       mengambang "Masuk" untuk membukanya lagi. */
    var btnTutup = el('button', 'gb-tutup', '');
    btnTutup.type = 'button';
    btnTutup.setAttribute('data-gb-tutup', '');
    btnTutup.setAttribute('aria-label', 'Tutup dan lihat halaman tanpa masuk');
    btnTutup.title = 'Tutup';
    btnTutup.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    card.appendChild(btnTutup);

    /* tandai body selama dialog terbuka: navbar & drawer disembunyikan
           lewat kelas ini (lebih andal daripada selector :has()). */
        document.body.classList.add('gerbang-aktif');
        document.body.classList.remove('gerbang-ditutup');
        /* bila dialog login tampil, layar muat TIDAK berjalan. Kelas
           kunci-gulir `sedang-muat` dari atribut <html> harus dilepas,
           kalau tidak navbar tidak akan pernah muncul lagi setelah
           dialog ditutup. */
        document.documentElement.classList.remove('sedang-muat');

    var kiri = el('div', 'gb-side');
    kiri.setAttribute('aria-hidden', 'true');
    card.appendChild(kiri);

    var kanan = el('div', 'gb-form');

    var logo = el('div', 'gb-logo-icon');
    logo.innerHTML = SVG.qii;
    kanan.appendChild(logo);
    kanan.appendChild(el('h2', '', 'Masuk ke QIIORA'));
    kanan.appendChild(el('p', 'gb-sub', 'Gunakan akun Google atau email untuk melanjutkan.'));

    // akun tersimpan
    var akunWadah = el('div', 'gb-akun-wadah');
    var akunDaftar = bacaAkun();
    if(akunDaftar.length){
      akunWadah.appendChild(el('p', 'gb-akun-label', 'Pilih akun'));
      akunDaftar.forEach(function(a, idx){
        var ab = el('button', 'gb-akun-btn' + (idx === 0 ? ' is-pilihan' : ''), '');
        ab.type = 'button';
        ab.innerHTML = '<span class="gb-akun-ava">' + (a.nama.charAt(0).toUpperCase()) + '</span>'
          + '<span class="gb-akun-txt"><b>' + escapeHtml(a.nama) + '</b><i>' + escapeHtml(a.email) + '</i></span>';
        ab.addEventListener('click', function(){ pilihAkun(a.email); });
        akunWadah.appendChild(ab);
      });
      var lainBtn = el('button', 'gb-akun-lain', 'Gunakan akun lain');
      lainBtn.type = 'button';
      lainBtn.addEventListener('click', function(){
        akunWadah.hidden = true;
        q('[data-gb-form-main]').hidden = false;
        q('[data-gb-email]').focus();
      });
      akunWadah.appendChild(lainBtn);
    }
    kanan.appendChild(akunWadah);

    // form utama
    var formMain = el('div', 'gb-form-main');
    formMain.setAttribute('data-gb-form-main', '');
    formMain.hidden = akunDaftar.length > 0;

    var fieldEmail = el('div', 'gb-field');
    fieldEmail.innerHTML = '<label for="gbEmail">Email atau Gmail</label>'
      + '<div class="gb-input-wrap">'
      +   '<input id="gbEmail" data-gb-email type="email" autocomplete="email" placeholder="contoh@email.com" spellcheck="false">'
      +   '<span class="gb-input-iko">' + SVG.email + '</span></div>';
    formMain.appendChild(fieldEmail);

    var fieldPass = el('div', 'gb-field');
    fieldPass.innerHTML = '<label for="gbPass">Kata sandi</label>'
      + '<div class="gb-input-wrap">'
      +   '<input id="gbPass" data-gb-pass type="password" autocomplete="current-password" placeholder="Masukkan kata sandi">'
      +   '<button class="gb-eye" type="button" data-gb-eye aria-label="Tampilkan kata sandi">' + SVG.mataTutup + '</button></div>';
    formMain.appendChild(fieldPass);

    var galatEl = el('p', 'gb-galat', '');
    galatEl.hidden = true;
    formMain.appendChild(galatEl);

    var btnMasuk = el('button', 'gb-masuk', '');
    btnMasuk.type = 'submit';
    btnMasuk.innerHTML = 'Masuk <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true" width="16" height="16"><path d="M5 12h14M13 5l7 7-7 7"/></svg>';
    formMain.appendChild(btnMasuk);

    var sep = el('div', 'gb-sep', '<span>atau</span>');
    formMain.appendChild(sep);

    var btnGoogle = el('button', 'gb-google', '');
    btnGoogle.type = 'button';
    btnGoogle.innerHTML = SVG.google + ' Masuk dengan Google';
    formMain.appendChild(btnGoogle);

    kanan.appendChild(formMain);

    var guest = el('p', 'gb-guest', '');
    guest.innerHTML = 'Tidak punya akun? Masuk sebagai <button type="button" data-gb-tamu>tamu</button>';
    kanan.appendChild(guest);

    card.appendChild(kanan);
    overlay.appendChild(card);
    (document.body || document.documentElement).appendChild(overlay);

    buatAnimasi(kiri);

    /* ---------- tombol silang ---------- */
    btnTutup.addEventListener('click', function(){
      tutupGerbang();
    });

    /* tutup gerbang: sembunyikan dialog, tampilkan tombol "Masuk"
       mengambang supaya pengguna bisa membukanya lagi kapan saja. */
    function tutupGerbang(){
      overlay.hidden = true;
      overlay.style.display = 'none';
      document.body.classList.remove('gerbang-aktif');
      document.body.classList.add('gerbang-ditutup');
      buatTombolMasuk();
    }

    /* ---------- logika ---------- */
    var emailInput = q('[data-gb-email]');
    var passInput = q('[data-gb-pass]');
    var eyeBtn = q('[data-gb-eye]');
    var tamuBtn = q('[data-gb-tamu]');

    var mataTerbuka = false;
    if(eyeBtn){
      eyeBtn.addEventListener('click', function(){
        mataTerbuka = !mataTerbuka;
        passInput.type = mataTerbuka ? 'text' : 'password';
        eyeBtn.innerHTML = mataTerbuka ? SVG.mataBuka : SVG.mataTutup;
        eyeBtn.setAttribute('aria-label', mataTerbuka ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
      });
    }

    function tampilkanGalat(teks){
      if(!galatEl) return;
      galatEl.textContent = teks;
      galatEl.hidden = false;
      if(passInput) passInput.value = '';
      if(passInput) passInput.focus();
    }

    function sukses(email, nama){
      if(simpan()){
        simpanAkun(email, nama);
        var sData = { nama: nama, email: email, waktu: Date.now() };
        simpan().simpan(KUNCI_SESI, sData);
        var id = simpan().ambil('identitas', {}) || {};
        if(!id.nama) id.nama = nama;
        if(!id.email) id.email = email;
        simpan().simpan('identitas', id);
        document.dispatchEvent(new CustomEvent('qiiora:sesi', { detail: sData }));
      }
      keluar();
    }

    function pilihAkun(email){
      var nama = email.split('@')[0];
      sukses(email, nama);
    }

    function cobaMasuk(){
      if(!emailInput || !passInput) return;
      var e = emailInput.value.trim();
      var p = passInput.value;

      if(!e){ tampilkanGalat('Masukkan alamat email.'); return; }
      if(!validasiEmail(e)){ tampilkanGalat('Format email tidak valid.'); return; }
      if(!p || p.length < 3){ tampilkanGalat('Kata sandi minimal 3 karakter.'); return; }

      var nama = e.split('@')[0];
      sukses(e, nama);
    }

    if(btnMasuk){
      btnMasuk.addEventListener('click', function(e){ e.preventDefault(); cobaMasuk(); });
    }
    if(formMain){
      formMain.addEventListener('keydown', function(e){
        if(e.key === 'Enter'){ e.preventDefault(); cobaMasuk(); }
      });
    }
    if(btnGoogle){
      btnGoogle.addEventListener('click', function(){
        sukses('siswa' + Math.floor(Math.random() * 999) + '@gmail.com', 'Siswa QIIORA');
      });
    }
    if(tamuBtn){
      tamuBtn.addEventListener('click', function(){
        sukses(acakEmail(), 'Tamu');
      });
    }

    return overlay;
  }

  function escapeHtml(s){
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* tombol "Masuk" mengambang untuk membuka gerbang lagi setelah ditutup */
  function buatTombolMasuk(){
    if(document.querySelector('[data-gb-buka]')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'gb-buka';
    b.setAttribute('data-gb-buka', '');
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" width="16" height="16"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5M15 12H3"/></svg> Masuk';
    b.addEventListener('click', function(){
          document.body.classList.remove('gerbang-ditutup');
          var ada = document.querySelector('.gerbang');
          if(ada){
            ada.hidden = false;
            ada.style.display = '';
            document.body.classList.add('gerbang-aktif');
            b.remove();
          } else {
            window.QIIORA.gerbang.bangun();
            b.remove();
          }
        });
    document.body.appendChild(b);
  }

  function keluar(){
    if(!overlay) return;
    document.body.classList.remove('gerbang-aktif');
    document.body.classList.remove('gerbang-ditutup');
    hentikanAnimasi();
    overlay.classList.add('keluar');
    setTimeout(function(){
      if(overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      overlay = null;
      if(window.QIIORA.muat) QIIORA.muat.mulaiPaksa();
    }, 380);
  }

  function adaSesi(){
    var s = simpan();
    if(!s) return false;
    var d = s.ambil(KUNCI_SESI, null);
    return !!(d && d.email);
  }

  window.QIIORA.gerbang = { bangun: bangun, keluar: keluar, adaSesi: adaSesi };

  function mulai(){
    if(adaSesi()){ if(window.QIIORA.muat) QIIORA.muat.mulai(); return; }
    bangun();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mulai);
  else mulai();
})();