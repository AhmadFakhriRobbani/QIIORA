(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};

  /* ============================================================
     S1 — Diorama Siklus Air 3D (K5, rombak visual)
     Acuan: referensi/05-vid-3d-UTAMA-23dtk.mp4 (utama)
            referensi/06-vid-3d-pendamping-14dtk.mp4 (bentuk awan/hujan)

     KONTRAK API YANG DIPERTAHANKAN (dipakai index.html, jangan diubah):
       QIIORA.simS1.bangun(scene, camera, renderer) -> state
       QIIORA.simS1.perbarui(state, dt, elapsed, camera, controls, wadah)
       QIIORA.simS1.anchors = {1..5: Vector3}   <- hotspot 01..05
       state.stage / state.sunIntensity / state.cutaway / state.transfer

     Yang baru (menjawab keluhan Fiqi di referensi/02-ss-3d-sekarang.png):
       - Warna hidup: rumput bergradasi, laut biru dalam, pasir krem, batu abu
       - Gunung batu + puncak salju (vertex color), bukan kerucut putih polos
       - Pohon cemara instanced banyak, bergoyang
       - Sungai berkelok dengan air benar-benar MENGALIR (tekstur bergeser)
       - Lapisan tanah jelas: humus/topsoil/subsoil/batuan + pita air tanah
       - Matahari: bola kuning keemasan + pendar radial + sinar berputar
         (dulu cakram krem datar - itu keluhan utamanya)
       - Awan gumpal seperti video 06; hujan tetes cyan; salju di puncak
       - Partikel: evaporasi, transpirasi, hujan, limpasan, resapan, air tanah
       - Latar gradasi navy + grid tipis (seperti video 05)
       - Preset kamera sinematik + auto-orbit saat kamera diam
       - state.intensitas = persentase nyata tiap proses (untuk pil label)
     ============================================================ */

  var S = {};

  var WUJUD = {
    0: { label: 'Pengantar', onChange: '—' },
    1: { label: 'Evaporasi', onChange: 'cair -> gas' },
    2: { label: 'Transpirasi', onChange: 'cair -> gas' },
    3: { label: 'Kondensasi', onChange: 'gas -> cair' },
    4: { label: 'Presipitasi', onChange: 'cair / padat' },
    5: { label: 'Infiltrasi & limpasan', onChange: 'tetap cair' }
  };

  var PRESET = {
    rendah: { bayangan: 512,  segAir: 20, awan: 26, uap: 70,  hujan: 160, aliran: 45,  pohon: 34, salju: 40,  dpr: 1,   fogNear: 22, fogFar: 52 },
    sedang: { bayangan: 1024, segAir: 30, awan: 40, uap: 130, hujan: 300, aliran: 90,  pohon: 62, salju: 80,  dpr: 1.5, fogNear: 19, fogFar: 48 },
    tinggi: { bayangan: 2048, segAir: 42, awan: 56, uap: 200, hujan: 460, aliran: 140, pohon: 96, salju: 130, dpr: 2,   fogNear: 17, fogFar: 46 }
  };

  function deteksiKualitas(){
    var inti = navigator.hardwareConcurrency || 4;
    var mem  = navigator.deviceMemory || 4;
    var sempit = window.matchMedia('(max-width: 720px)').matches;
    if(sempit || inti <= 4 || mem <= 4) return 'rendah';
    if(inti >= 8 && mem >= 8) return 'tinggi';
    return 'sedang';
  }

  function std(color, extra){
    var p = { color: color, roughness: .88, metalness: 0, flatShading: true };
    if(extra) for(var k in extra) p[k] = extra[k];
    return new THREE.MeshStandardMaterial(p);
  }

  /* ---------- tekstur buatan sendiri (tanpa berkas luar) ---------- */

  function teksturPendar(){
    var c = document.createElement('canvas');
    c.width = c.height = 256;
    var g = c.getContext('2d');
    var grd = g.createRadialGradient(128,128,0,128,128,128);
    grd.addColorStop(0,   'rgba(255,246,214,1)');
    grd.addColorStop(.18, 'rgba(255,226,140,.92)');
    grd.addColorStop(.42, 'rgba(255,196,74,.42)');
    grd.addColorStop(.72, 'rgba(255,170,50,.12)');
    grd.addColorStop(1,   'rgba(255,160,40,0)');
    g.fillStyle = grd;
    g.fillRect(0,0,256,256);
    return new THREE.CanvasTexture(c);
  }

  function teksturSinar(){
    var c = document.createElement('canvas');
    c.width = c.height = 256;
    var g = c.getContext('2d');
    g.translate(128,128);
    for(var i=0;i<16;i++){
      g.save();
      g.rotate(i * Math.PI / 8);
      var grd = g.createLinearGradient(0,0,0,-122);
      grd.addColorStop(0,  'rgba(255,232,150,.30)');
      grd.addColorStop(.55,'rgba(255,214,110,.10)');
      grd.addColorStop(1,  'rgba(255,200,90,0)');
      g.fillStyle = grd;
      g.beginPath();
      g.moveTo(-7,0); g.lineTo(0,-122); g.lineTo(7,0);
      g.closePath(); g.fill();
      g.restore();
    }
    return new THREE.CanvasTexture(c);
  }

  function teksturButir(){
    var c = document.createElement('canvas');
    c.width = c.height = 64;
    var g = c.getContext('2d');
    var grd = g.createRadialGradient(32,25,2,32,32,30);
    grd.addColorStop(0,'rgba(255,255,255,1)');
    grd.addColorStop(.5,'rgba(224,246,255,.95)');
    grd.addColorStop(1,'rgba(150,215,245,0)');
    g.fillStyle = grd;
    g.beginPath(); g.arc(32,32,30,0,6.2832); g.fill();
    return new THREE.CanvasTexture(c);
  }

  // pita horizontal yang digeser terus -> sungai terlihat mengalir
  function teksturAliran(){
    var c = document.createElement('canvas');
    c.width = 64; c.height = 128;
    var g = c.getContext('2d');
    g.fillStyle = '#2196F3';
    g.fillRect(0,0,64,128);
    for(var i=0;i<9;i++){
      var y = i * 15 + 2;
      g.fillStyle = 'rgba(190,235,255,' + (0.18 + (i%3)*0.13) + ')';
      g.beginPath();
      g.ellipse(32, y, 26 + (i%3)*6, 3.4, 0, 0, 6.2832);
      g.fill();
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }

  function teksturAirTanah(){
    var c = document.createElement('canvas');
    c.width = 128; c.height = 32;
    var g = c.getContext('2d');
    g.fillStyle = '#0E5C74';
    g.fillRect(0,0,128,32);
    for(var i=0;i<7;i++){
      g.fillStyle = 'rgba(120,225,255,.34)';
      g.beginPath();
      g.ellipse(i*20 + 8, 16, 12, 3.6, 0, 0, 6.2832);
      g.fill();
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3,1);
    return t;
  }

  function teksturLatar(){
    var c = document.createElement('canvas');
    c.width = 16; c.height = 256;
    var g = c.getContext('2d');
    var grd = g.createLinearGradient(0,0,0,256);
    grd.addColorStop(0,   '#0B1A2B');
    grd.addColorStop(.45, '#08131F');
    grd.addColorStop(1,   '#04080E');
    g.fillStyle = grd;
    g.fillRect(0,0,16,256);
    return new THREE.CanvasTexture(c);
  }

  /* ================= bangun ================= */
  S.bangun = function(scene, camera, renderer, opsi){
    opsi = opsi || {};
    var kualitas = opsi.kualitas || deteksiKualitas();
    var P = PRESET[kualitas] || PRESET.sedang;

    var state = {
      stage: 0,
      sunIntensity: .6,
      cutaway: false,
      transfer: 0,
      kualitas: kualitas,
      preset: P,
      awanAktif: 0,
      intensitas: { evap:0, trans:0, cond:0, rain:0, infil:0, alir:0, limpasan:0, airtanah:0 }
    };

    if('toneMapping' in renderer){
      /* ACES Filmic memang "sinematik", tetapi ia MENDESATURASI warna
         terang — inilah sebab utama diorama terlihat pucat. Untuk
         media ajar anak, warna harus jernih dan pekat. Linear tone
         mapping mempertahankan saturasi, sRGB encoding menjaga
         kecerahan tidak meledak. */
      renderer.toneMapping = THREE.LinearToneMapping;
      renderer.toneMappingExposure = 1.04;
    }

    if('background' in scene){
      scene.background = teksturLatar();
    }
    /* Kabut dipakai untuk kedalaman, bukan untuk memutihkan. near 17
       terlalu dekat (kamera utama ada di jarak ~18,8) sehingga seluruh
       diorama sudah tertutup kabut tipis. */
    scene.fog = new THREE.Fog(0x0B2036, P.fogNear + 11, P.fogFar + 22);

    /* ---------- cahaya ----------
       Cahaya isian (hemi + ambient) yang terlalu besar membuat semua
       permukaan sama terang -> kontras hilang. Diturunkan, lalu
       diimbangi directional supaya ada sisi terang & sisi bayangan. */
    var hemi = new THREE.HemisphereLight(0xBFE2FF, 0x6B4A2A, .38);
    scene.add(hemi);
    var ambient = new THREE.AmbientLight(0x9FC3DC, .11);
    scene.add(ambient);

    var dir = new THREE.DirectionalLight(0xFFF4D6, 2.55);
    dir.position.set(-8.5, 12, 5);
    dir.castShadow = true;
    dir.shadow.mapSize.width = P.bayangan;
    dir.shadow.mapSize.height = P.bayangan;
    dir.shadow.camera.left = -14; dir.shadow.camera.right = 14;
    dir.shadow.camera.top = 16;   dir.shadow.camera.bottom = -12;
    dir.shadow.camera.near = 1;   dir.shadow.camera.far = 38;
    dir.shadow.bias = -0.0004;
    if('radius' in dir.shadow) dir.shadow.radius = 2.6;
    scene.add(dir); scene.add(dir.target);

    var fill = new THREE.DirectionalLight(0x8FC8E8, .26);
    fill.position.set(9, 6, 10);
    scene.add(fill);

    var pantul = new THREE.PointLight(0x54CEE0, .5, 16);
    pantul.position.set(-4, 1.2, 1);
    scene.add(pantul);

    /* pantulan hangat dari matahari tepat di sisi barat diorama:
       memberi tepi keemasan pada gunung & air (menambah kedalaman) */
    var rim = new THREE.DirectionalLight(0xFFC98A, .45);
    rim.position.set(-11, 4, -8);
    scene.add(rim);

    var island = new THREE.Group();
    scene.add(island);

    function box(w,h,d,x,y,z,material,cast,receive){
      var m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), material);
      m.position.set(x,y,z);
      m.castShadow = cast !== false;
      m.receiveShadow = receive !== false;
      island.add(m);
      return m;
    }

    /* ---------- lapisan tanah (harus JELAS: keluhan "tanah tak terlihat") ---------- */
    box(12.9, .22, 8.9, 0, -2.62, 0, std(0x0A1E27), false, true);          // alas
    box(12, 1.15, 8, 0, -1.93, 0, std(0x6E7B85, {roughness:1}));           // batuan C/R
    box(12, .62, 8, 0, -1.05, 0, std(0x9A6B48, {roughness:1}));            // subsoil B
    box(12, .42, 8, 0, -.53, 0, std(0x6B452B, {roughness:1}));             // topsoil A
    box(12, .1, 8, 0, -.27, 0, std(0x4A2F1C, {roughness:1}));              // humus

    /* ---------- rumput bergradasi (terang dekat pantai) ----------
       Warna dinaikkan saturasinya: hijau limau ke hijau hutan.
       Versi lama (0x9CCC5B -> 0x3E8B36) terlalu kelabu di bawah
       tone mapping, sehingga rumput menyatu dengan tanah.        */
    box(12, .3, 8, 0, -.12, 0, std(0x4FBF3E, {roughness:1}));

    var rumputGeo = new THREE.PlaneGeometry(7.5, 7.9, 34, 30);
    var posR = rumputGeo.attributes.position;
    var warna = new Float32Array(posR.count * 3);
    var cTerang = new THREE.Color(0xB4E85C);
    var cGelap  = new THREE.Color(0x2E8B2E);
    var cTmp = new THREE.Color();
    for(var vi = 0; vi < posR.count; vi++){
      var vx = posR.getX(vi);
      var vz = posR.getY(vi);
      var t = Math.min(1, Math.max(0, (vx + 3.75) / 7.5));
      cTmp.copy(cTerang).lerp(cGelap, Math.pow(t, .72));
      var n = (Math.sin(vx*2.1 + vz*1.7) * .5 + .5) * .05;
      warna[vi*3]   = Math.min(1, cTmp.r + n);
      warna[vi*3+1] = Math.min(1, cTmp.g + n);
      warna[vi*3+2] = Math.min(1, cTmp.b + n * .4);
    }
    rumputGeo.setAttribute('color', new THREE.BufferAttribute(warna, 3));
    var rumput = new THREE.Mesh(rumputGeo, new THREE.MeshStandardMaterial({
      vertexColors: true, roughness: 1, metalness: 0, flatShading: false
    }));
    rumput.rotation.x = -Math.PI / 2;
    rumput.position.set(1.9, .035, 0);
    rumput.receiveShadow = true;
    island.add(rumput);

    /* ---------- laut ----------
       Tumpukan: dasar gelap (opaque) -> badan air (tembus) -> muka air.
       Semua yang tembus WAJIB depthWrite:false + renderOrder berurutan.
       Tanpa itu bidang air yang bergelombang menembus pasir/dasar dan
       berkedip-kedip (inilah "glitch" yang dikeluhkan).               */
    box(4.9, .06, 7.9, -3.5, -.03, 0, std(0x06314A), false, true);         // dasar

    var lautTebalMat = new THREE.MeshStandardMaterial({
      color: 0x0B6FBF, transparent: true, opacity: .86, roughness: .28, metalness: .18,
      depthWrite: false
    });
    var lautTebal = box(4.9, .55, 7.86, -3.5, -.33, 0, lautTebalMat, false, false);
    lautTebal.renderOrder = 1;

    var segX = P.segAir, segY = Math.round(P.segAir * 1.6);
    var waterGeo = new THREE.PlaneGeometry(4.96, 7.86, segX, segY);
    var waterMat = new THREE.MeshStandardMaterial({
      color: 0x0E86D6, transparent: true, opacity: .92,
      roughness: .24, metalness: .34, flatShading: true, depthWrite: false
    });
    var water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(-3.5, .075, 0);
    water.receiveShadow = false;
    water.renderOrder = 2;
    island.add(water);
    var waterBase = waterGeo.attributes.position.array.slice();

    /* ---------- pantai pasir krem ---------- */
    box(.62, .07, 7.95, -1.02, .045, 0, std(0xF2DDA8, {roughness:1}));
    var bibir = box(.34, .05, 7.95, -1.42, .02, 0, std(0xE6CE92, {roughness:1}));
    bibir.rotation.z = .1;
    /* dulu ada pita putih tipis di sini; dari kamera ia terbaca sebagai
       garis cacat. Busa pantai (instanced) sekarang mengisi peran itu. */

    /* ---------- gunung batu + puncak salju (vertex color) ---------- */
    function gunung(radius, tinggi, seg, x, y, z){
      var geo = new THREE.ConeGeometry(radius, tinggi, seg, 4);
      var p = geo.attributes.position;
      var col = new Float32Array(p.count * 3);
      var batuTua = new THREE.Color(0x6B7784);
      var batuMuda = new THREE.Color(0xA6B3BE);
      var saljuC = new THREE.Color(0xFFFFFF);
      var cc = new THREE.Color();
      var batasSalju = tinggi * .30;
      for(var i = 0; i < p.count; i++){
        var py = p.getY(i) + tinggi/2;
        var f = py / tinggi;
        if(py >= tinggi - batasSalju){
          cc.copy(saljuC);
        } else {
          cc.copy(batuTua).lerp(batuMuda, Math.min(1, f / .72));
        }
        var v = 1 + (Math.sin(i * 2.7) * .5) * .06;
        col[i*3]   = Math.min(1, cc.r * v);
        col[i*3+1] = Math.min(1, cc.g * v);
        col[i*3+2] = Math.min(1, cc.b * v);
      }
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      var m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
        vertexColors: true, roughness: .95, metalness: 0, flatShading: true
      }));
      m.position.set(x, y, z);
      m.castShadow = true; m.receiveShadow = true;
      island.add(m);
      return m;
    }
    gunung(2.25, 3.3, 10, 3.5, 1.5, -2.0);
    gunung(1.35, 2.15, 8, 4.5, .95, .7);

    /* ---------- danau kecil di kaki gunung ---------- */
    var danauMat = new THREE.MeshStandardMaterial({
      color: 0x2E9BD6, transparent: true, opacity: .92, roughness: .12, metalness: .35
    });
    var danau = new THREE.Mesh(new THREE.CircleGeometry(.52, 20), danauMat);
    danau.rotation.x = -Math.PI / 2;
    danau.position.set(2.65, .06, -.85);
    danau.receiveShadow = true;
    island.add(danau);

    /* ---------- sungai berkelok + air mengalir ---------- */
    var tikAliran = teksturAliran();
    tikAliran.repeat.set(1, 7);
    var riverCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.65, .12, -.85),
      new THREE.Vector3(2.0,  .12,  .35),
      new THREE.Vector3(1.15, .12, 1.35),
      new THREE.Vector3(.15,  .12, 2.05),
      new THREE.Vector3(-.95, .12, 2.25),
      new THREE.Vector3(-1.5,  .12, 1.6)
    ]);
    // Tepi sungai (bank) lebih gelap & lebih lebar: memberi kontras supaya
    // alur sungai terbaca dari kamera. Tanpa ini, pipa radius kecil hilang
    // di antara pohon (sudah dibuktikan lewat tangkapan layar K5).
    var bankMat = std(0x7A5A3A, {roughness:1});
    var bank = new THREE.Mesh(new THREE.TubeGeometry(riverCurve, 72, .205, 8, false), bankMat);
    bank.receiveShadow = true;
    island.add(bank);

    var riverMat = new THREE.MeshStandardMaterial({
      color: 0x2196F3, map: tikAliran, roughness: .2, metalness: .3,
      transparent: true, opacity: .95
    });
    var river = new THREE.Mesh(new THREE.TubeGeometry(riverCurve, 72, .155, 10, false), riverMat);
    river.receiveShadow = true;
    island.add(river);

    /* ---------- air tanah ---------- */
    var tikAirTanah = teksturAirTanah();
    var akuiferMat = new THREE.MeshStandardMaterial({
      color: 0x0E7490, map: tikAirTanah, transparent: true, opacity: 0,
      roughness: .35, metalness: .15, emissive: 0x0A4F63, emissiveIntensity: .5
    });
    var akuifer = new THREE.Mesh(new THREE.BoxGeometry(11.5, .5, 7.5), akuiferMat);
    akuifer.position.set(0, -1.32, 0);
    island.add(akuifer);

    var tableMat = new THREE.MeshStandardMaterial({
      color: 0x38BDF8, transparent: true, opacity: 0,
      roughness: .25, metalness: .2, emissive: 0x0E7490, emissiveIntensity: .45
    });
    var waterTable = new THREE.Mesh(new THREE.BoxGeometry(11.2, .12, .06), tableMat);
    waterTable.position.set(0, -.86, 4.05);
    island.add(waterTable);

    /* ---------- pohon cemara instanced ---------- */
    var jumlahPohon = P.pohon;
    var kayuMat = std(0x6B4728, {roughness:1});
    var daunMatA = std(0x2FA83A, {roughness:.9});
    var daunMatB = std(0x15722A, {roughness:.9});

    var batangMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(.055, .085, .5, 6), kayuMat, jumlahPohon);
    var daunMeshA  = new THREE.InstancedMesh(new THREE.ConeGeometry(.40, .78, 7), daunMatA, jumlahPohon);
    var daunMeshB  = new THREE.InstancedMesh(new THREE.ConeGeometry(.30, .62, 7), daunMatB, jumlahPohon);
    [batangMesh, daunMeshA, daunMeshB].forEach(function(m){
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      m.castShadow = true; m.receiveShadow = true;
      m.frustumCulled = false;
      island.add(m);
    });

    var pohonData = [];
    var dummy = new THREE.Object3D();
    var batasCoba = 0;
    while(pohonData.length < jumlahPohon && batasCoba < jumlahPohon * 30){
      batasCoba++;
      var px = -1.9 + Math.random() * 7.3;
      var pz = -3.5 + Math.random() * 7.0;
      if(px < -.75) continue;
      var dG1 = Math.sqrt((px-3.5)*(px-3.5) + (pz+2.0)*(pz+2.0));
      var dG2 = Math.sqrt((px-4.5)*(px-4.5) + (pz-.7)*(pz-.7));
      if(dG1 < 1.55 || dG2 < 1.0) continue;
      var dekatSungai = false;
      for(var tt = 0; tt <= 10; tt++){
        var ptC = riverCurve.getPoint(tt/10);
        // .7 (bukan .3): bank sungai radius .205 + margin, supaya alur
        // sungai tidak tertutup tajuk pohon.
        if(Math.abs(px - ptC.x) < .7 && Math.abs(pz - ptC.z) < .7){ dekatSungai = true; break; }
      }
      if(dekatSungai) continue;
      pohonData.push({
        x: px, z: pz,
        s: .62 + Math.random() * .85,
        rot: Math.random() * 6.283,
        fase: Math.random() * 6.283
      });
    }
    while(pohonData.length < jumlahPohon){
      pohonData.push({ x: -0.4 + Math.random()*6.8, z: -3.4 + Math.random()*6.8,
                       s: .6 + Math.random()*.8, rot: Math.random()*6.28, fase: Math.random()*6.28 });
    }

    /* ---------- pondok kecil ---------- */
    var pondok = new THREE.Group();
    var dinding = new THREE.Mesh(new THREE.BoxGeometry(1.0, .62, .8), std(0xD7CDBD, {roughness:.95}));
    dinding.position.y = .31; dinding.castShadow = true; dinding.receiveShadow = true;
    var atap = new THREE.Mesh(new THREE.ConeGeometry(.85, .52, 4), std(0x8D5A3B, {roughness:.95}));
    atap.position.y = .85; atap.rotation.y = Math.PI/4; atap.castShadow = true;
    var pintu = new THREE.Mesh(new THREE.BoxGeometry(.2, .32, .03), std(0x4E342E));
    pintu.position.set(0, .16, .41);
    pondok.add(dinding, atap, pintu);
    pondok.position.set(.55, 0, -1.75);
    pondok.rotation.y = -.45;
    island.add(pondok);

    /* ---------- batu kecil (bentuk & warna beragam) ---------- */
    var batuWarna = [0x8A8F94, 0x9BA3AA, 0x77808A, 0xA8A29A];
    [[-0.3,2.9,.16],[1.05,3.15,.12],[4.6,2.5,.2],[2.2,-2.6,.14],[-0.1,-2.9,.11],
     [3.2,2.7,.09],[.4,-3.2,.1]].forEach(function(b, bi){
      var bt = new THREE.Mesh(
        new THREE.DodecahedronGeometry(b[2], 0),
        std(batuWarna[bi % batuWarna.length], {roughness:.96, flatShading:true})
      );
      bt.position.set(b[0], b[2]*.6, b[1]);
      bt.rotation.set(Math.random()*3, Math.random()*3, Math.random()*3);
      bt.castShadow = true; bt.receiveShadow = true;
      island.add(bt);
    });

    /* ---------- busa di garis pantai ---------- */
    /* Deretan pita putih tipis yang bergerak naik-turun; memberi kesan
       ombak memecah di pasir. Tanpa gambar luar, hanya bidang + pita. */
    var busaData = [];
    var busaGeo = new THREE.PlaneGeometry(.5, .13);
    var busaMat = new THREE.MeshBasicMaterial({
      color: 0xEAFBFF, transparent: true, opacity: .5,
      depthWrite: false
    });
    var busaMesh = new THREE.InstancedMesh(busaGeo, busaMat, 16);
    busaMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    busaMesh.frustumCulled = false;
    busaMesh.renderOrder = 3;
    island.add(busaMesh);
    for(var bi2 = 0; bi2 < 16; bi2++){
      busaData.push({
        z: -3.7 + bi2 * .49,
        x: -1.42 + (Math.random() - .5) * .12,
        fase: Math.random() * 6.283
      });
    }
    var busaDummy = new THREE.Object3D();

    /* ---------- bunga kecil di rumput ---------- */
    var bungaWarna = [0xFF8FB1, 0xFFD166, 0xFFFFFF, 0xC79BFF];
    for(var fi = 0; fi < 22; fi++){
      var fx = 2.2 + Math.random() * 3.6;
      var fz = -3.3 + Math.random() * 6.6;
      var fw = bungaWarna[fi % bungaWarna.length];
      var kelopak = new THREE.Mesh(
        new THREE.SphereGeometry(.045, 6, 5),
        new THREE.MeshStandardMaterial({color: fw, roughness:.7, flatShading:true})
      );
      kelopak.position.set(fx, .12, fz);
      kelopak.castShadow = false; kelopak.receiveShadow = false;
      island.add(kelopak);
      var tangkai = new THREE.Mesh(
        new THREE.CylinderGeometry(.008, .008, .11, 4),
        new THREE.MeshStandardMaterial({color: 0x3E8B36, roughness:1})
      );
      tangkai.position.set(fx, .06, fz);
      island.add(tangkai);
    }

    /* ---------- burung melintas (2 ekor, sayap mengepak) ----------
       Bentuk dulu: elipsoid + dua bidang datar -> terbaca seperti
       pesawat kertas. Kini badan lebih pipih, kepala + ekor kecil,
       dan sayap melengkung ke belakang seperti burung sungguhan. */
    var burungGrup = [];
    function buatBurung(){
      var g = new THREE.Group();
      var matB = new THREE.MeshStandardMaterial({color:0x33465A, roughness:.75, flatShading:true});

      var badan = new THREE.Mesh(new THREE.SphereGeometry(.055, 8, 6), matB);
      badan.scale.set(2.1, .62, .62);
      g.add(badan);

      // kepala + paruh
      var kepala = new THREE.Mesh(new THREE.SphereGeometry(.036, 8, 6), matB);
      kepala.position.set(.098, .012, 0);
      g.add(kepala);
      var paruh = new THREE.Mesh(new THREE.ConeGeometry(.014, .05, 5),
        new THREE.MeshStandardMaterial({color:0xE8A33D, roughness:.7}));
      paruh.position.set(.14, .008, 0);
      paruh.rotation.z = -Math.PI / 2;
      g.add(paruh);

      // ekor bercabang
      var ekor = new THREE.Mesh(new THREE.ConeGeometry(.03, .085, 4), matB.clone());
      ekor.position.set(-.115, 0, 0);
      ekor.rotation.z = Math.PI / 2;
      g.add(ekor);

      // sayap: dua segmen per sisi supaya melengkung, bukan papan datar
      function sayap(sisi){
        var s = new THREE.Group();
        var dalam = new THREE.Mesh(new THREE.PlaneGeometry(.115, .075), matB.clone());
        dalam.material.side = THREE.DoubleSide;
        dalam.rotation.x = -Math.PI / 2;
        dalam.position.set(-.045, 0, sisi * .052);
        s.add(dalam);
        var luar = new THREE.Mesh(new THREE.PlaneGeometry(.10, .06), matB.clone());
        luar.material.side = THREE.DoubleSide;
        luar.rotation.x = -Math.PI / 2;
        luar.rotation.y = sisi * .32;      // ujung sayap menyapu ke belakang
        luar.position.set(-.155, -.008, sisi * .115);
        s.add(luar);
        s.position.set(.01, .022, 0);
        g.add(s);
        return s;
      }
      var sKiri = sayap(-1), sKanan = sayap(1);
      g.userData = { kiri: sKiri, kanan: sKanan };
      scene.add(g);
      return g;
    }
    burungGrup.push({
      m: buatBurung(),
      jari: 6.2, tinggi: 4.9, laju: .16, fase: 0, arah: 1
    });
    burungGrup.push({
      m: buatBurung(),
      jari: 5.4, tinggi: 5.6, laju: .21, fase: 2.4, arah: -1
    });

    /* ---------- grid tipis di dasar (seperti video 05) ----------
       Dulu opacity .5 dengan dua warna terang: terlalu ramai dan
       bersaing dengan diorama. Kini sangat redup + memudar ke tepi
       lewat fog, sekadar memberi kesan landasan.                  */
    var grid = new THREE.GridHelper(46, 46, 0x16304A, 0x0F2134);
    grid.position.y = -2.75;
    if(grid.material){
      grid.material.transparent = true;
      grid.material.opacity = .22;
      grid.material.depthWrite = false;
    }
    grid.renderOrder = -2;
    scene.add(grid);

    /* ---------- matahari: bola + pendar + sinar ----------
       Pendar/sinar dulu terlalu kuat sehingga puncak layar "meledak"
       putih dan tertutup flare. Dikecilkan & diredupkan supaya
       matahari terbaca sebagai bola, bukan tumpahan cahaya.        */
    var sunMat = new THREE.MeshBasicMaterial({ color: 0xFFB300 });
    var sun = new THREE.Mesh(new THREE.SphereGeometry(.62, 26, 20), sunMat);
    sun.position.set(-6.2, 5.0, -3.6);
    scene.add(sun);

    var glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: teksturPendar(), transparent: true, opacity: .62,
      blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true
    }));
    glow.scale.set(5.4, 5.4, 1);
    glow.position.copy(sun.position);
    glow.renderOrder = -1;
    scene.add(glow);

    var sinar = new THREE.Sprite(new THREE.SpriteMaterial({
      map: teksturSinar(), transparent: true, opacity: .34,
      blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true
    }));
    sinar.scale.set(8.6, 8.6, 1);
    sinar.position.copy(sun.position);
    sinar.renderOrder = -1;
    scene.add(sinar);

    /* ---------- awan gumpal (klaster bola) ---------- */
    var bolaGeo = new THREE.SphereGeometry(1, 9, 7);
    var awanMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF, roughness: 1, metalness: 0,
      flatShading: true, transparent: true, opacity: .97
    });
    var awanMesh = new THREE.InstancedMesh(bolaGeo, awanMat, P.awan);
    awanMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    awanMesh.castShadow = true;
    awanMesh.receiveShadow = false;
    awanMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(P.awan * 3).fill(1), 3);
    awanMesh.count = 0;
    awanMesh.frustumCulled = false;
    scene.add(awanMesh);

    var awanData = [];
    var jumlahKlaster = Math.max(4, Math.round(P.awan / 7));
    var perKlaster = Math.floor(P.awan / jumlahKlaster);
    for(var kk = 0; kk < jumlahKlaster; kk++){
      var sudut = Math.random() * 6.283;
      var jari = Math.pow(Math.random(), .55) * 2.6;
      /* Awan dinaikkan & dirapatkan sedikit supaya tidak menutupi
         puncak gunung dan matahari (keluhan: gunung tak terlihat). */
      var cx = 1.1 + Math.cos(sudut) * jari;
      var cy = 4.0 + (Math.random() - .5) * .62;
      var cz = .1 + Math.sin(sudut) * jari * .8;
      for(var jj = 0; jj < perKlaster; jj++){
        awanData.push({
          x: cx + (Math.random() - .5) * 1.3,
          y: cy + (Math.random() - .5) * .3,
          z: cz + (Math.random() - .5) * 1.0,
          r: .30 + Math.random() * .42,
          fase: Math.random() * 6.283,
          klaster: kk
        });
      }
    }

    /* ---------- partikel ---------- */
    var texButir = teksturButir();

    function buatButir(jumlah, warna, ukuran, bentuk){
      var geo = bentuk === 'tetes'
        ? new THREE.CylinderGeometry(ukuran * .5, ukuran * .9, ukuran * 3.2, 5)
        : new THREE.SphereGeometry(ukuran, 6, 5);
      var mat = new THREE.MeshStandardMaterial({
        color: warna, roughness: .25, metalness: .1,
        transparent: true, opacity: 0, map: texButir,
        emissive: warna, emissiveIntensity: .28, depthWrite: false
      });
      var mesh = new THREE.InstancedMesh(geo, mat, jumlah);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.frustumCulled = false;
      scene.add(mesh);
      return mesh;
    }

    var uapMesh    = buatButir(P.uap, 0xFFD9A0, .055);
    var transMesh  = buatButir(Math.round(P.uap * .7), 0x9BE39B, .048);
    var hujanMesh  = buatButir(P.hujan, 0x7FD8F5, .04, 'tetes');
    var saljuMesh  = buatButir(P.salju, 0xFFFFFF, .042);
    var aliranMesh = buatButir(P.aliran, 0x64C8F0, .05);
    var resapMesh  = buatButir(Math.round(P.aliran * .7), 0x54B8E0, .046);
    var tanahMesh  = buatButir(Math.round(P.aliran * .8), 0x2E9BC4, .044);

    function acak(n, fn){ var a=[]; for(var i=0;i<n;i++) a.push(fn(i)); return a; }

    var uapArr = acak(P.uap, function(i){
      var dariSungai = i % 3 === 0;
      if(dariSungai){
        var ptS = riverCurve.getPoint(Math.random());
        return { x: ptS.x + (Math.random()-.5)*.3, z: ptS.z + (Math.random()-.5)*.3,
                 y: .2 + Math.random()*2.4, s: .18 + Math.random()*.26, p: Math.random()*6.283 };
      }
      return { x: -5.9 + Math.random()*4.5, z: -3.9 + Math.random()*7.8,
               y: .2 + Math.random()*2.8, s: .20 + Math.random()*.28, p: Math.random()*6.283 };
    });

    var transArr = acak(Math.round(P.uap * .7), function(i){
      var tp = pohonData[i % pohonData.length];
      return { x: tp.x + (Math.random()-.5)*.55, z: tp.z + (Math.random()-.5)*.55,
               y: .75 + Math.random()*.7, s: .16 + Math.random()*.22, p: Math.random()*6.283 };
    });

    var hujanArr = acak(P.hujan, function(){
      return { x: -1.4 + Math.random()*8.2, z: -3.6 + Math.random()*7.3,
               y: .2 + Math.random()*4.2, s: 2.6 + Math.random()*2.2 };
    });

    var saljuArr = acak(P.salju, function(){
      var a = Math.random() * 6.283;
      var r = Math.random() * 1.5;
      return { x: 3.5 + Math.cos(a)*r, z: -2.0 + Math.sin(a)*r,
               y: 2.2 + Math.random()*1.6, s: .5 + Math.random()*.7, p: Math.random()*6.283 };
    });

    var limpasanArr = acak(Math.round(P.aliran * .8), function(){
      return { t: Math.random(), u: .012 + Math.random()*.02, off: (Math.random()-.5)*.16 };
    });

    var resapArr = acak(Math.round(P.aliran * .7), function(){
      return { x: -.6 + Math.random()*7.0, z: -3.4 + Math.random()*6.8,
               y: -.1 - Math.random()*.9, s: .22 + Math.random()*.3, p: Math.random()*6.283 };
    });

    var tanahArr = acak(Math.round(P.aliran * .8), function(){
      return { x: 5.6 - Math.random()*10.5, z: (Math.random()-.5)*6.6,
               y: -1.3 + (Math.random()-.5)*.24, s: .16 + Math.random()*.24, p: Math.random()*6.283 };
    });

    /* ---------- panah proses ---------- */
    var arrows = {};
    function arrow(points, color){
      var g = new THREE.Group();
      var curve = new THREE.CatmullRomCurve3(points.map(function(p){ return new THREE.Vector3(p[0],p[1],p[2]); }));
      var m1 = new THREE.MeshBasicMaterial({color:color, transparent:true, opacity:0, depthWrite:false});
      var m2 = new THREE.MeshBasicMaterial({color:color, transparent:true, opacity:0, depthWrite:false});
      var tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 36, .042, 7, false), m1);
      var head = new THREE.Mesh(new THREE.ConeGeometry(.14, .34, 9), m2);
      var end = curve.getPoint(1);
      var tan = curve.getTangent(1).normalize();
      head.position.copy(end);
      head.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), tan);
      g.add(tube, head);
      g.userData.mats = [m1, m2];
      scene.add(g);
      return g;
    }
    arrows['1'] = arrow([[-4.6,.6,2.2],[-4.4,1.8,2.2],[-4.0,3.0,1.6]], 0xFFB74D);
    arrows['2'] = arrow([[1.6,1.2,2.0],[1.7,2.1,1.6],[1.7,3.0,1.0]], 0x81C784);
    arrows['3'] = arrow([[.8,3.7,1.0],[.0,4.0,.6],[-.8,3.9,.2]], 0x81D4FA);
    arrows['4'] = arrow([[.6,3.6,.6],[1.0,2.4,1.0],[1.1,.5,1.2]], 0x4FC3F7);
    arrows['5'] = arrow([[1.6,-.1,4.05],[1.6,-.8,4.05]], 0x26A69A);
    arrows['6'] = arrow([[1.4,.3,3.4],[.2,.3,3.7],[-1.0,.3,3.3],[-1.6,.3,2.2]], 0x26A69A);

    /* ---------- anchor label (KONTRAK hotspot 1..5) ---------- */
    S.anchors = {
      1: new THREE.Vector3(-4.3, 2.1, 1.9),
      2: new THREE.Vector3(1.8, 2.4, 1.6),
      3: new THREE.Vector3(0.1, 4.0, .6),
      4: new THREE.Vector3(1.0, 1.9, 1.2),
      5: new THREE.Vector3(1.6, -.7, 4.05)
    };

    /* ---------- preset kamera sinematik ---------- */
    // minD/maxD wajib ikut: simkit memasang controls.minDistance = 9,
    // sehingga preset "dekat" akan ditahan di jarak 9 dan tidak pernah dekat.
    S.presetKamera = {
      // Jarak dihitung dari island (x -6..6, z -4..4).
      // Didekatkan dari 19,3 -> 15,4 supaya diorama mengisi bingkai
      // (sebelumnya 38% layar hanya latar kosong).
      umum:   { pos: [8.4, 6.9, 10.8], target: [0, .9, 0],    fov: 38, minD: 8,  maxD: 24 },
      sungai: { pos: [3.9, 4.2, 5.6],   target: [1.1, .3, 1.0], fov: 42, minD: 4,  maxD: 20 },
      lereng: { pos: [-0.9, 2.6, 6.8],  target: [.9, .5, 1.4], fov: 46, minD: 4,  maxD: 20 }
    };

    var smooth = { evap:0, trans:0, cond:0, rain:0, infil:0, alir:0, limpasan:0, airtanah:0, sun:.6 };

    state.refs = {
      dir: dir, hemi: hemi, ambient: ambient, fill: fill, pantul: pantul, rim: rim,
      sun: sun, sunMat: sunMat, glow: glow, sinar: sinar,
      water: water, waterGeo: waterGeo, waterBase: waterBase, waterMat: waterMat,
      lautTebalMat: lautTebalMat,
      riverMat: riverMat, bankMat: bankMat, riverCurve: riverCurve,
      tikAliran: tikAliran, tikAirTanah: tikAirTanah,
      danauMat: danauMat,
      awanMesh: awanMesh, awanMat: awanMat, awanData: awanData,
      pohonData: pohonData,
      batangMesh: batangMesh, daunMeshA: daunMeshA, daunMeshB: daunMeshB,
      uapMesh: uapMesh, transMesh: transMesh, hujanMesh: hujanMesh,
      saljuMesh: saljuMesh, aliranMesh: aliranMesh, resapMesh: resapMesh, tanahMesh: tanahMesh,
      uapArr: uapArr, transArr: transArr, hujanArr: hujanArr, saljuArr: saljuArr,
      limpasanArr: limpasanArr, resapArr: resapArr, tanahArr: tanahArr,
      arrows: arrows, tableMat: tableMat, waterTable: waterTable,
      akuiferMat: akuiferMat, akuifer: akuifer,
      busaMesh: busaMesh, busaData: busaData, busaDummy: busaDummy,
      burungGrup: burungGrup,
      grid: grid,
      WHITE: new THREE.Color(0xFFFFFF),
      GRAY: new THREE.Color(0x7C8FA3),
      smooth: smooth, dummy: dummy,
      kamera: null, controls: null, orbitSiap: false,
      waktuDiam: 0, tween: null
    };

    return state;
  };

  /* ================= preset kamera ================= */
  S.pergiKe = function(state, nama){
    var p = S.presetKamera[nama];
    if(!p || !state || !state.refs) return;
    var R = state.refs;
    R.tween = {
      t: 0,
      dari: R.kamera ? R.kamera.position.clone() : null,
      ke: new THREE.Vector3(p.pos[0], p.pos[1], p.pos[2]),
      dariTarget: R.controls ? R.controls.target.clone() : null,
      keTarget: new THREE.Vector3(p.target[0], p.target[1], p.target[2]),
      fovDari: R.kamera ? R.kamera.fov : 36,
      fovKe: p.fov || 36
    };
    if(R.controls){
      R.controls.autoRotate = false;
      R.controls.minDistance = p.minD || 9;
      R.controls.maxDistance = p.maxD || 24;
    }
    R.minDSebelum = p.minD || 9;
  };

  /* ================= perbarui ================= */
  S.perbarui = function(state, dt, elapsed, camera, controls, wadah){
    var R = state.refs;
    var sm = R.smooth;
    var st = state.stage;
    var intensity = state.sunIntensity;
    var dummy2 = R.dummy;

    if(!R.kamera) R.kamera = camera;
    if(!R.controls && controls) R.controls = controls;
    if(R.controls && !R.orbitSiap){
      R.orbitSiap = true;
      R.controls.autoRotate = true;
      R.controls.autoRotateSpeed = .38;
      R.controls.addEventListener('start', function(){
        R.controls.autoRotate = false;
        R.waktuDiam = 0;
        R.tween = null;
      });
      R.controls.addEventListener('end', function(){
        R.waktuDiam = 0;
      });
    }

    var target = {
      evap:     st === 0 ? .62 : (st === 1 ? 1 : .12),
      trans:    st === 0 ? .50 : (st === 2 ? 1 : .10),
      cond:     st === 0 ? .55 : (st === 3 ? 1 : .18),
      rain:     st === 0 ? .45 : (st === 4 ? 1 : .04),
      infil:    st === 0 ? .42 : (st === 5 ? 1 : .10),
      alir:     st === 0 ? .40 : (st === 5 ? 1 : .10),
      limpasan: st === 0 ? .38 : (st === 5 ? 1 : .12),
      airtanah: st === 0 ? .34 : (st === 5 ? 1 : .10)
    };
    for(var key in target){ sm[key] += (target[key] - sm[key]) * .075; }
    sm.sun += (intensity - sm.sun) * .08;

    /* persentase nyata untuk pil label (bukan angka tetap) */
    var I = state.intensitas;
    I.evap     = Math.round(sm.evap * intensity * 100);
    I.trans    = Math.round(sm.trans * intensity * 100);
    I.cond     = Math.round(sm.cond * 100);
    I.rain     = Math.round(sm.rain * 100);
    I.infil    = Math.round(sm.infil * 100);
    I.alir     = Math.round(sm.alir * 100);
    I.limpasan = Math.round(sm.limpasan * 100);
    I.airtanah = Math.round(sm.airtanah * 100);

    /* kamera: tween preset + auto-orbit setelah diam */
    if(R.tween && R.kamera && R.controls){
      var TW = R.tween;
      TW.t = Math.min(1, TW.t + dt / 1.35);
      var e = TW.t < .5 ? 2*TW.t*TW.t : 1 - Math.pow(-2*TW.t + 2, 2) / 2;
      if(TW.dari) R.kamera.position.lerpVectors(TW.dari, TW.ke, e);
      else R.kamera.position.copy(TW.ke);
      if(TW.dariTarget) R.controls.target.lerpVectors(TW.dariTarget, TW.keTarget, e);
      else R.controls.target.copy(TW.keTarget);
      R.kamera.fov = TW.fovDari + (TW.fovKe - TW.fovDari) * e;
      R.kamera.updateProjectionMatrix();
      if(TW.t >= 1){
        R.tween = null;
        R.waktuDiam = 0;
        // biarkan pengguna zoom lebih jauh setelah tween selesai
        if(R.controls) R.controls.minDistance = Math.min(R.minDSebelum || 3.2, 9);
      }
    } else if(R.controls && R.controls.autoRotate === false){
      R.waktuDiam += dt;
      if(R.waktuDiam > 4 && !R.tween) R.controls.autoRotate = true;
    }

    /* gelombang laut — amplitudo DIBATASI. Dulu .038 + .028 = .066,
       sementara muka air hanya .075 di atas pasir, sehingga puncak
       gelombang menembus pasir dan berkedip. Kini maksimum .032. */
    var wp = R.waterGeo.attributes.position;
    var amp = .020 + sm.evap * .012;
    for(var i = 0; i < wp.count; i++){
      var wx = R.waterBase[i*3];
      var wy = R.waterBase[i*3+1];
      wp.array[i*3+2] =
        Math.sin(wx*1.9 + elapsed*1.25) * amp +
        Math.cos(wy*1.25 + elapsed*.92) * amp * .82 +
        Math.sin((wx + wy) * 2.6 + elapsed*1.8) * amp * .34;
    }
    wp.needsUpdate = true;

    /* busa pantai: pita naik-turun & memudar, mengikuti gelombang */
    if(R.busaMesh && R.busaData){
      var bd = R.busaData, bdm = R.busaDummy;
      for(var bi3 = 0; bi3 < bd.length; bi3++){
        var bo = bd[bi3];
        var bf = Math.sin(elapsed * .85 + bo.fase);
        bdm.position.set(bo.x + bf * .07, .035, bo.z);
        bdm.rotation.set(-Math.PI / 2, 0, 0);
        var bs = .8 + bf * .22;
        bdm.scale.set(bs, 1.1 + bf * .35, 1);
        bdm.updateMatrix();
        R.busaMesh.setMatrixAt(bi3, bdm.matrix);
      }
      R.busaMesh.instanceMatrix.needsUpdate = true;
      R.busaMesh.material.opacity = .34 + Math.sin(elapsed * .7) * .12;
    }

    /* burung: mengitari pulau, sayap mengepak */
    if(R.burungGrup){
      for(var bgI = 0; bgI < R.burungGrup.length; bgI++){
        var bg = R.burungGrup[bgI];
        var sudutB = elapsed * bg.laju * bg.arah + bg.fase;
        var bx = Math.cos(sudutB) * bg.jari;
        var bz = Math.sin(sudutB) * bg.jari * .72;
        var by = bg.tinggi + Math.sin(elapsed * .9 + bg.fase) * .34;
        bg.m.position.set(bx, by, bz);
        // hadapkan ke arah gerak
        bg.m.rotation.y = -sudutB + (bg.arah > 0 ? Math.PI / 2 : -Math.PI / 2);
        bg.m.rotation.z = Math.sin(sudutB) * (bg.arah > 0 ? -.16 : .16);
        // kepakan sayap
        var kepak = Math.sin(elapsed * 7.4 + bg.fase) * .5;
        // grup sayap kini diputar di sumbu X (mengepak naik-turun)
        bg.m.userData.kiri.rotation.x = kepak;
        bg.m.userData.kanan.rotation.x = -kepak;
      }
    }

    /* sungai & air tanah mengalir */
    R.tikAliran.offset.y = (R.tikAliran.offset.y - dt * (.35 + sm.alir * .8)) % 1;
    R.tikAirTanah.offset.x = (R.tikAirTanah.offset.x + dt * (.10 + sm.airtanah * .34)) % 1;

    /* pohon bergoyang */
    var pd = R.pohonData;
    for(i = 0; i < pd.length; i++){
      var t0 = pd[i];
      var ayun = Math.sin(elapsed * 1.35 + t0.fase) * .045;
      var skala = t0.s;
      dummy2.position.set(t0.x, .25 * skala, t0.z);
      dummy2.rotation.set(ayun * .5, t0.rot, ayun * .4);
      dummy2.scale.set(skala, skala, skala);
      dummy2.updateMatrix();
      R.batangMesh.setMatrixAt(i, dummy2.matrix);
      dummy2.position.set(t0.x, .72 * skala, t0.z);
      dummy2.rotation.set(ayun, t0.rot, ayun * .7);
      dummy2.scale.set(skala, skala, skala);
      dummy2.updateMatrix();
      R.daunMeshA.setMatrixAt(i, dummy2.matrix);
      dummy2.position.set(t0.x, 1.02 * skala, t0.z);
      dummy2.rotation.set(ayun * 1.4, t0.rot, ayun);
      dummy2.scale.set(skala, skala, skala);
      dummy2.updateMatrix();
      R.daunMeshB.setMatrixAt(i, dummy2.matrix);
    }
    R.batangMesh.instanceMatrix.needsUpdate = true;
    R.daunMeshA.instanceMatrix.needsUpdate = true;
    R.daunMeshB.instanceMatrix.needsUpdate = true;

    var o;

    /* uap / evaporasi */
    var uapArr = R.uapArr;
    var evapMult = Math.max(.3, 1 + (sm.sun - .5) * 1.9);
    for(i = 0; i < uapArr.length; i++){
      o = uapArr[i];
      o.y += o.s * dt * evapMult;
      if(o.y > 3.5) o.y = .15 + Math.random() * .35;
      dummy2.position.set(
        o.x + Math.sin(elapsed*.9 + o.p) * .15, o.y,
        o.z + Math.cos(elapsed*.72 + o.p) * .1);
      dummy2.rotation.set(0,0,0);
      dummy2.scale.setScalar(.78 + Math.sin(elapsed*2 + o.p) * .24);
      dummy2.updateMatrix();
      R.uapMesh.setMatrixAt(i, dummy2.matrix);
    }
    R.uapMesh.instanceMatrix.needsUpdate = true;
    R.uapMesh.material.opacity = .05 + sm.evap * .82;

    /* transpirasi */
    var transArr = R.transArr;
    for(i = 0; i < transArr.length; i++){
      o = transArr[i];
      o.y += o.s * dt;
      if(o.y > 3.3) o.y = .8 + Math.random() * .4;
      dummy2.position.set(
        o.x + Math.sin(elapsed*.82 + o.p) * .12, o.y,
        o.z + Math.cos(elapsed*.66 + o.p) * .08);
      dummy2.rotation.set(0,0,0);
      dummy2.scale.setScalar(.72 + Math.sin(elapsed*2.2 + o.p) * .2);
      dummy2.updateMatrix();
      R.transMesh.setMatrixAt(i, dummy2.matrix);
    }
    R.transMesh.instanceMatrix.needsUpdate = true;
    R.transMesh.material.opacity = .04 + sm.trans * .84;

    /* hujan */
    var hujanArr = R.hujanArr;
    for(i = 0; i < hujanArr.length; i++){
      o = hujanArr[i];
      o.y -= o.s * dt;
      if(o.y < .12){
        o.y = 3.9 + Math.random() * .8;
        o.x = -1.4 + Math.random() * 8.2;
        o.z = -3.6 + Math.random() * 7.3;
      }
      dummy2.position.set(o.x, o.y, o.z);
      dummy2.rotation.set(0,0,0);
      dummy2.scale.set(.85, 1.15, .85);
      dummy2.updateMatrix();
      R.hujanMesh.setMatrixAt(i, dummy2.matrix);
    }
    R.hujanMesh.instanceMatrix.needsUpdate = true;
    R.hujanMesh.material.opacity = .03 + sm.rain * .88;

    /* salju di puncak */
    var saljuArr = R.saljuArr;
    for(i = 0; i < saljuArr.length; i++){
      o = saljuArr[i];
      o.y -= o.s * dt * .55;
      if(o.y < 2.0) o.y = 3.7 + Math.random() * .5;
      dummy2.position.set(
        o.x + Math.sin(elapsed * .7 + o.p) * .12, o.y,
        o.z + Math.cos(elapsed * .55 + o.p) * .12);
      dummy2.rotation.set(0,0,0);
      dummy2.scale.setScalar(1);
      dummy2.updateMatrix();
      R.saljuMesh.setMatrixAt(i, dummy2.matrix);
    }
    R.saljuMesh.instanceMatrix.needsUpdate = true;
    R.saljuMesh.material.opacity = .05 + sm.rain * .75;

    /* limpasan menyusuri sungai */
    var limpasanArr = R.limpasanArr;
    for(i = 0; i < limpasanArr.length; i++){
      o = limpasanArr[i];
      o.t += o.u * dt;
      if(o.t > 1) o.t -= 1;
      var lp = R.riverCurve.getPoint(o.t);
      dummy2.position.set(
        lp.x + Math.sin(elapsed*1.5 + i) * .06,
        lp.y + .07,
        lp.z + o.off);
      dummy2.rotation.set(0,0,0);
      dummy2.scale.set(.8, .8, 1.3);
      dummy2.updateMatrix();
      R.aliranMesh.setMatrixAt(i, dummy2.matrix);
    }
    R.aliranMesh.instanceMatrix.needsUpdate = true;
    R.aliranMesh.material.opacity = .04 + sm.limpasan * .82;

    /* resapan ke dalam tanah */
    var resapArr = R.resapArr;
    for(i = 0; i < resapArr.length; i++){
      o = resapArr[i];
      o.y -= o.s * dt * .55;
      if(o.y < -1.5) o.y = -.12 + Math.random() * .1;
      dummy2.position.set(
        o.x + Math.sin(elapsed * .9 + o.p) * .05, o.y,
        o.z + Math.cos(elapsed * .7 + o.p) * .05);
      dummy2.rotation.set(0,0,0);
      dummy2.scale.setScalar(.9);
      dummy2.updateMatrix();
      R.resapMesh.setMatrixAt(i, dummy2.matrix);
    }
    R.resapMesh.instanceMatrix.needsUpdate = true;
    R.resapMesh.material.opacity = .04 + sm.infil * .78;

    /* air tanah mengalir ke laut */
    var tanahArr = R.tanahArr;
    for(i = 0; i < tanahArr.length; i++){
      o = tanahArr[i];
      o.x -= o.s * dt * (0.8 + sm.airtanah);
      if(o.x < -5.2) o.x = 5.6;
      dummy2.position.set(o.x, o.y, o.z);
      dummy2.rotation.set(0,0,0);
      dummy2.scale.set(1.25, .85, .85);
      dummy2.updateMatrix();
      R.tanahMesh.setMatrixAt(i, dummy2.matrix);
    }
    R.tanahMesh.instanceMatrix.needsUpdate = true;
    R.tanahMesh.material.opacity = .04 + sm.airtanah * .74;

    /* awan */
    var tampil = Math.min(R.awanData.length,
      Math.max(6, Math.round(R.awanData.length * (.42 + sm.cond * .58))));
    state.awanAktif = tampil;
    R.awanMesh.count = tampil;
    var gelap = sm.rain * .78;
    var wa = new THREE.Color();
    for(i = 0; i < tampil; i++){
      var a = R.awanData[i];
      dummy2.position.set(
        a.x + Math.sin(elapsed * .24 + a.fase) * .2,
        a.y + Math.sin(elapsed * .52 + a.fase) * .06,
        a.z + Math.cos(elapsed * .19 + a.fase) * .12);
      dummy2.rotation.set(0, a.fase, 0);
      dummy2.scale.setScalar(a.r * (.92 + sm.cond * .2));
      dummy2.updateMatrix();
      R.awanMesh.setMatrixAt(i, dummy2.matrix);
      wa.copy(R.WHITE).lerp(R.GRAY, gelap);
      R.awanMesh.setColorAt(i, wa);
    }
    R.awanMesh.instanceMatrix.needsUpdate = true;
    if(R.awanMesh.instanceColor) R.awanMesh.instanceColor.needsUpdate = true;

    /* matahari + cahaya */
    var pulse = (1 + Math.sin(elapsed * 1.3) * .022) * (.9 + intensity * .18);
    R.sun.scale.setScalar(pulse);
    /* skala dasar disamakan dengan yang dipasang di bangun():
       5,4 dan 8,6. Dulu 8 dan 13 (nilai lama) menimpa perubahan
       sehingga pendar matahari kembali membanjiri layar. */
    R.glow.scale.set(5.4 * pulse, 5.4 * pulse, 1);
    R.sinar.scale.set(8.6 * pulse, 8.6 * pulse, 1);
    R.glow.material.opacity = .30 * intensity + .22;
    R.sinar.material.opacity = .16 * intensity + .12;
    R.sinar.material.rotation = elapsed * .06;
    R.sunMat.color.setRGB(1, .70 + intensity * .10, .02 + intensity * .12);

    R.dir.intensity = 1.45 + intensity * 1.15;
    R.dir.color.setRGB(1, .94 + intensity * .04, .82 + intensity * .12);
    R.hemi.intensity = .30 + intensity * .18;
    R.ambient.intensity = .08 + intensity * .06;
    R.pantul.intensity = .3 + sm.evap * .5;

    /* air laut & danau */
    R.water.position.y = .1 - (sm.evap * intensity * .06);
    R.waterMat.opacity = .93 - sm.evap * intensity * .08;
    R.riverMat.opacity = .95 - sm.evap * .06;
    R.danauMat.opacity = .92 - sm.evap * .05;
    R.lautTebalMat.opacity = .78 + sm.evap * .06;

    /* air tanah terlihat */
    var buka = state.cutaway ? 1 : 0;
    R.tableMat.opacity = Math.max(sm.infil * .85, buka * .55);
    R.waterTable.scale.y = 1 + sm.infil * 2.6;
    R.akuiferMat.opacity = buka ? (.34 + sm.airtanah * .34) : Math.max(.14, sm.airtanah * .34);
    R.akuifer.position.y = -1.32 + sm.infil * .08;

    /* panah penekanan tahap */
    for(var id in R.arrows){
      var tOp = 0;
      if(st === 5 && (id === '5' || id === '6')) tOp = .95;
      else if(Number(id) === st) tOp = .95;
      R.arrows[id].userData.mats.forEach(function(m){ m.opacity += (tOp - m.opacity) * .08; });
    }

    state.transfer += (sm.evap * intensity * 1.4 + sm.rain * .55 + sm.limpasan * .3) * dt;
  };

  S.wujud = WUJUD;
  S.preset = PRESET;
  S.deteksi = deteksiKualitas;

  window.QIIORA.simS1 = S;
})();
