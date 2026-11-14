/* ============================================================
   QIIORA — Animasi di DALAM kotak footer

   User minta animasi berjalan di dalam kotak footer, bukan
   membelakangi footer. Jadi kanvas kecil ditempatkan DI DALAM
   .foot-grid dan .foot-bottom, lalu dipotong oleh overflow:hidden
   kotak itu. Latar halaman di area footer tidak ikut terlihat.

   Yang digambar: langit senja bergradasi, awan bergerak, bukit,
   air beriak, dan burung — miniatur pemandangan yang sama.
   ============================================================ */
(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};

  function pasang(wadah, opsi){
    if(!wadah) return null;
    var c = document.createElement('canvas');
    wadah.appendChild(c);
    var g = c.getContext('2d');
    if(!g) return null;

    var gelap = document.documentElement.getAttribute('data-tema') === 'gelap';
    var awan = [], riak = [];
    for(var i = 0; i < 7; i++){
      awan.push({ x: Math.random(), y: .12 + Math.random() * .38,
                  s: .5 + Math.random() * .8, v: .004 + Math.random() * .008 });
    }
    for(var j = 0; j < 18; j++){
      riak.push({ x: Math.random(), y: Math.random(), w: .03 + Math.random() * .08,
                  v: .3 + Math.random() * .7, a: .1 + Math.random() * .25 });
    }

    var lebar = 1, tinggi = 1, raf = null;

    function ukur(){
      var w = wadah.clientWidth || 1, h = wadah.clientHeight || 1;
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      lebar = w; tinggi = h;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      c.style.width = w + 'px';
      c.style.height = h + 'px';
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    var jam = 0;
    function lukis(){
      raf = requestAnimationFrame(lukis);
      jam += .016;
      var t = jam;
      g.clearRect(0, 0, lebar, tinggi);

      // langit
      var lg = g.createLinearGradient(0, 0, 0, tinggi);
      if(gelap){
        lg.addColorStop(0, '#123C5C');
        lg.addColorStop(.55, '#2C6685');
        lg.addColorStop(1, '#3E7F9B');
      } else {
        lg.addColorStop(0, '#8FCDEF');
        lg.addColorStop(.62, '#D6EEFB');
        lg.addColorStop(1, '#EAF6FE');
      }
      g.fillStyle = lg;
      g.fillRect(0, 0, lebar, tinggi);

      // matahari lembut
      g.save();
      g.globalAlpha = gelap ? .3 : .55;
      var sx = lebar * .78, sy = tinggi * .26, sr = Math.min(lebar, tinggi) * .10;
      var sg = g.createRadialGradient(sx, sy, 0, sx, sy, sr * 4);
      sg.addColorStop(0, gelap ? 'rgba(255,210,140,.7)' : 'rgba(255,236,170,.9)');
      sg.addColorStop(1, 'rgba(255,236,170,0)');
      g.fillStyle = sg;
      g.beginPath(); g.arc(sx, sy, sr * 4, 0, 6.2832); g.fill();
      g.restore();

      // awan
      awan.forEach(function(a){
        var x = ((a.x + t * a.v) % 1.2 - .1) * lebar;
        var y = a.y * tinggi;
        var r = 13 * a.s;
        g.save();
        g.globalAlpha = gelap ? .55 : .8;
        g.fillStyle = gelap ? '#5A87A8' : '#FFFFFF';
        [[0,0,1],[.8,.16,.76],[-.8,.2,.66],[.24,-.44,.6]].forEach(function(o){
          g.beginPath();
          g.arc(x + o[0]*r, y + o[1]*r, r*o[2], 0, 6.2832);
          g.fill();
        });
        g.restore();
      });

      // bukit
      var dasar = tinggi * .56;
      g.fillStyle = gelap ? '#1D5442' : '#4E9B48';
      g.beginPath();
      g.moveTo(0, dasar + 12);
      g.bezierCurveTo(lebar*.28, dasar - tinggi*.12, lebar*.55, dasar + tinggi*.12, lebar, dasar - tinggi*.04);
      g.lineTo(lebar, tinggi); g.lineTo(0, tinggi);
      g.closePath(); g.fill();

      // air
      var airY = tinggi * .68;
      var ag = g.createLinearGradient(0, airY, 0, tinggi);
      ag.addColorStop(0, gelap ? '#2E7EA6' : '#7FD4DE');
      ag.addColorStop(1, gelap ? '#14405C' : '#2C7C9E');
      g.fillStyle = ag;
      g.fillRect(0, airY, lebar, tinggi - airY);

      // riak
      riak.forEach(function(r2){
        var ry = airY + ((r2.y + t * r2.v * .015) % 1) * (tinggi - airY);
        var rx = ((r2.x + Math.sin(t * .3 + r2.y * 6) * .01) % 1) * lebar;
        g.save();
        g.globalAlpha = r2.a;
        g.strokeStyle = gelap ? 'rgba(180,230,255,.9)' : 'rgba(255,255,255,.95)';
        g.lineWidth = 1.4;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(rx, ry);
        g.lineTo(rx + lebar * r2.w, ry);
        g.stroke();
        g.restore();
      });
    }

    ukur();
    lukis();

    if('ResizeObserver' in window){
      var ro = new ResizeObserver(function(){ ukur(); });
      ro.observe(wadah);
    }
    document.addEventListener('qiiora:tema', function(){
      gelap = document.documentElement.getAttribute('data-tema') === 'gelap';
    });

    return { berhenti: function(){ if(raf) cancelAnimationFrame(raf); } };
  }

  function mulai(){
    pasang(document.querySelector('[data-foot-anim]'));
    pasang(document.querySelector('[data-foot-anim-bawah]'));
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mulai);
  else mulai();
})();
