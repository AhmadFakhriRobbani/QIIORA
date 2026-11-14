(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};

  // Mesin bersama semua simulasi 3D (§9.1)
  // Satu renderer per sim, hanya sim terlihat yang berjalan, dispose saat ditinggalkan.
  var NS = {};

  function webGLAvailable(){
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch(e){ return false; }
  }

  // proyeksi label 3D → layar dengan penghindar tumpang tindih (perbaikan A2)
  /* Proyeksi anchor 3D -> layar, dengan penataan anti-tumpang yang
     memperhatikan TEPI wadah.

     Jebakan yang diperbaiki: dulu visibilitas dihitung dari koordinat
     yang SUDAH dijepit, sehingga label yang jatuh tepat di tepi
     (y = 0) dianggap tidak terlihat dan disembunyikan — semua label
     hilang sekaligus. Kini visibilitas dihitung dari NDC asli, lalu
     posisi dijepit ke dalam kotak. */
  function proyeksikanLabel(camera, wrap, daftar, renderer){
    var cw = wrap.clientWidth, ch = wrap.clientHeight;
    if(cw < 2 || ch < 2) return {};
    var v = new THREE.Vector3();
    var ditempatkan = [];
    var hasil = {};

    var PAD = 8, TINGGI = 26, LEBAR = 104;
    var minX = LEBAR / 2 + PAD, maksX = Math.max(minX, cw - LEBAR / 2 - PAD);
    var minY = TINGGI / 2 + PAD, maksY = Math.max(minY, ch - TINGGI / 2 - PAD);

    Object.keys(daftar).forEach(function(id){
      var anchor = daftar[id];
      v.copy(anchor).project(camera);

      // visibilitas dari NDC ASLI, sebelum dijepit
      var diDepan = v.z < 1;
      var dalamLayar = v.x >= -1 && v.x <= 1 && v.y >= -1 && v.y <= 1;

      var x = (v.x * 0.5 + 0.5) * cw;
      var y = (-v.y * 0.5 + 0.5) * ch;

      // jepit ke dalam kotak: label tidak boleh terpotong tepi
      x = Math.max(minX, Math.min(maksX, x));
      y = Math.max(minY, Math.min(maksY, y));

      function bentrok(px, py){
        for(var i = 0; i < ditempatkan.length; i++){
          var d = ditempatkan[i];
          if(Math.abs(d.y - py) < TINGGI && Math.abs(d.x - px) < LEBAR) return true;
        }
        return false;
      }

      // cari posisi bebas: turun dulu, lalu naik bila mentok bawah
      if(bentrok(x, y)){
        var turun = y;
        for(var s = 1; s <= 8 && bentrok(x, turun); s++) turun = y + s * TINGGI;
        if(turun > maksY){
          var naik = y;
          for(var t = 1; t <= 8 && bentrok(x, naik); t++) naik = y - t * TINGGI;
          y = Math.max(minY, Math.min(maksY, naik));
        } else {
          y = Math.min(maksY, turun);
        }
      }

      ditempatkan.push({x: x, y: y});
      hasil[id] = { x: x, y: y, terlihat: diDepan && dalamLayar };
    });
    return hasil;
  }

  NS.buat = function(opts){
    opts = opts || {};
    var wadah = opts.wadah;              // elemen target
    var bangun = opts.bangun || function(scene){ return {}; };
    var perbarui = opts.perbarui || function(state, dt, elapsed){};
    var kontrol = opts.kontrol || null;  // optional panel builder
    var deskripsi = opts.deskripsi || '';
    var fallbackEl = opts.fallback || null;

    if(!wadah) return null;

    var api = { wadah: wadah };

    // Fallback bila WebGL / THREE tidak ada
    function runtuh(){
      if(fallbackEl) fallbackEl.hidden = false;
      var hp = wadah.querySelectorAll('.hotspot');
      for(var i=0;i<hp.length;i++) hp[i].hidden = true;
      api.gagal = true;
    }

    if(!webGLAvailable() || typeof THREE === 'undefined'){
      runtuh();
      api.siap = false;
      return api;
    }

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    var dprMaks = (opts.kualitas && QIIORA.simS1 && QIIORA.simS1.preset[opts.kualitas])
      ? QIIORA.simS1.preset[opts.kualitas].dpr : 2;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprMaks));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if('outputEncoding' in renderer) renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.domElement.style.display = 'block';
    wadah.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(38, 1, .1, 100);
    camera.position.set(8.4, 6.9, 10.8);
    // bangun() boleh menimpa sudut pandang untuk adegannya sendiri (mis. model tanah)
    var sudutBawaan = { pos: camera.position.clone(), targetY: .9, fov: 38 };

    var controls = null;
    if(THREE.OrbitControls){
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = .06;
      controls.enablePan = false;
      controls.minDistance = 9;
      controls.maxDistance = 24;
      controls.minPolarAngle = .55;
      controls.maxPolarAngle = 1.42;
      controls.target.set(0, .8, 0);
      controls.update();
    }

    var state = bangun(scene, camera, renderer) || {};

    // scene boleh meminta sudut pandang sendiri lewat state.kamera
    if(state.kamera){
      camera.position.copy(state.kamera.pos);
      if(state.kamera.fov){ camera.fov = state.kamera.fov; camera.updateProjectionMatrix(); }
      if(controls){
        controls.target.set(0, state.kamera.targetY == null ? .8 : state.kamera.targetY, 0);
        controls.minDistance = state.kamera.minD || controls.minDistance;
        controls.maxDistance = state.kamera.maxD || controls.maxDistance;
        controls.update();
      }
    }

    var running = true;
    var rio = null;
    if('IntersectionObserver' in window){
      rio = new IntersectionObserver(function(entries){
        running = entries[0].isIntersecting;
      }, { threshold: 0 });
      rio.observe(wadah);
    }

    function onVis(){
      if(document.hidden) running = false;
      else running = true;
    }
    document.addEventListener('visibilitychange', onVis);

    function resize(){
      var w = wadah.clientWidth;
      var h = wadah.clientHeight;
      if(!w || !h || w < 2 || h < 2) return;   // view tersembunyi -> jangan render 0px
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    resize();

    var clock = new THREE.Clock();
    var elapsed = 0;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var disposeCalled = false;

    var rafId = null;
    function animasi(){
      if(disposeCalled) return;
      rafId = requestAnimationFrame(animasi);
      if(!running) return;
      var dt = Math.min(clock.getDelta(), .05);
      elapsed += reduce ? dt * .35 : dt;
      if(controls) controls.update();
      perbarui(state, dt, elapsed, camera, controls, wadah);
      renderer.render(scene, camera);
    }
    animasi();

    // Ukuran: ResizeObserver menangani SEMUA kasus (view SPA muncul, fullscreen,
    // rotasi layar, panel dibuka) tanpa bergantung urutan event.
    var ro = null;
    if('ResizeObserver' in window){
      ro = new ResizeObserver(function(){
        resize();
        if(wadah.clientWidth > 2 && wadah.clientHeight > 2) running = true;
      });
      ro.observe(wadah);
    }
    // ResizeObserver tidak memicu apa pun bila wadah masih 0x0 saat dibuat.
    // Karena itu: ukur ulang berkala sampai wadah punya ukuran nyata.
    var cobaUkur = 0;
    var penundaUkur = setInterval(function(){
      cobaUkur++;
      if(wadah.clientWidth > 2 && wadah.clientHeight > 2){
        resize(); running = true; clearInterval(penundaUkur);
      } else if(cobaUkur > 40){ clearInterval(penundaUkur); }
    }, 120);

    document.addEventListener('qiiora:view', function(e){
      if(e.detail && e.detail.el && e.detail.el.contains(wadah)){
        requestAnimationFrame(function(){ resize(); running = true; });
      }
    });
    document.addEventListener('fullscreenchange', function(){
      requestAnimationFrame(function(){ resize(); });
    });

    api.dispose = function(){
      disposeCalled = true;
      if(rafId) cancelAnimationFrame(rafId);
      if(rio) rio.disconnect();
      if(ro) ro.disconnect();
      clearInterval(penundaUkur);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('resize', resize);
      scene.traverse(function(obj){
        if(obj.geometry) obj.geometry.dispose();
        if(obj.material){
          if(Array.isArray(obj.material)) obj.material.forEach(function(m){ m.dispose(); });
          else obj.material.dispose();
        }
      });
      renderer.dispose();
      if(renderer.domElement && renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
    api.state = state;
    api.renderer = renderer;
    api.scene = scene;
    api.camera = camera;
    api.controls = controls;
    api.sudutBawaan = sudutBawaan;
    api.proyeksikanLabel = function(daftar){ return proyeksikanLabel(camera, wadah, daftar, renderer); };
    api.siap = true;
    if(kontrol) kontrol(api);
    return api;
  };

  NS.proyeksikanLabel = proyeksikanLabel;

  window.QIIORA.sim = NS;
})();