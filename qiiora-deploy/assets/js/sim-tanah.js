(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};

  /* ============================================================
     Model Tanah 3D "Kue Lapis" (§9.5)
     Profil tanah horizon O–A–B–C–R.
     Sumber nama & urutan: profil tanah (horizon tanah) — O serasah,
     A topsoil, B subsoil, C regolith/batuan lapuk, R batuan induk.

     Fitur:
     - Lima lapisan terpisah, tiap lapisan punya tekstur prosedural sendiri
     - Butir/mineral per lapisan memakai InstancedMesh (bukan gambar datar)
     - Pecah (exploded view) beranimasi easing + susun otomatis
     - Lapisan bisa digeser sendiri-sendiri
     - Klik lapisan -> panel samping yang SELALU terlihat (bukan pop-up)
     - Air meresap ke tiap lapisan dengan laju berbeda menurut porositas
     - Bisa diputar, di-zoom, disorot
     ============================================================ */

  var T = {};
  var lapisanGrup = [];

  /* ---------- Data lapisan (nama & urutan dari sumber) ---------- */
  T.LAPISAN = [
    {
      kode: 'O',
      nama: 'Serasah / Humus',
      istilah: 'Lapisan organik',
      tebal: 0.16,
      warna: 0x2E2318,
      warnaButir: [0x5A4326, 0x2E2115, 0x6B5334],
      porositas: 1.0,
      lajuAir: 1.0,
      ciri: 'Lapisan paling atas, berisi daun kering, ranting, dan sisa tumbuhan yang membusuk. Berwarna sangat gelap, gembur, dan berbau tanah.',
      peran: 'Menahan air hujan di permukaan agar tidak langsung mengalir, menjaga kelembapan, dan menjadi sumber makanan bagi tumbuhan.',
      butir: 'Daun & serat'
    },
    {
      kode: 'A',
      nama: 'Tanah Atas',
      istilah: 'Topsoil',
      tebal: 0.58,
      warna: 0x50381F,
      warnaButir: [0x5E4529, 0x3A2A18, 0x7A5A36],
      porositas: 0.86,
      lajuAir: 0.86,
      ciri: 'Campuran humus dan butiran mineral. Berwarna cokelat tua, paling gembur, dan paling banyak mengandung akar tanaman serta cacing.',
      peran: 'Tempat akar menyerap air dan zat hara. Lapisan paling penting untuk peresapan air hujan.',
      butir: 'Akar & butir mineral'
    },
    {
      kode: 'B',
      nama: 'Tanah Bawah',
      istilah: 'Subsoil',
      tebal: 0.78,
      warna: 0x8A5A32,
      warnaButir: [0x7C5A34, 0x5A3E22, 0x8E6C42],
      porositas: 0.46,
      lajuAir: 0.44,
      ciri: 'Lebih padat dan liat, mengandung sedikit bahan organik. Warnanya lebih cerah dan sering bercak karena mineral terlarut terkumpul di sini.',
      peran: 'Menyimpan air yang meresap dari lapisan di atasnya. Peresapan di lapisan ini jauh lebih lambat karena pori-porinya kecil.',
      butir: 'Butir liat'
    },
    {
      kode: 'C',
      nama: 'Batuan Lapuk',
      istilah: 'Regolith',
      tebal: 0.66,
      warna: 0x9A9080,
      warnaButir: [0x9A9384, 0x746E62, 0xADA595],
      porositas: 0.20,
      lajuAir: 0.15,
      ciri: 'Pecahan batuan yang belum sepenuhnya menjadi tanah. Berwarna kelabu pucat, keras, dan bercampur kerikil.',
      peran: 'Jalur terakhir air menuju batuan dasar. Air hanya lewat melalui celah dan retakan, sangat lambat.',
      butir: 'Kerikil & pecahan batu'
    },
    {
      kode: 'R',
      nama: 'Batuan Induk',
      istilah: 'Bedrock',
      tebal: 0.52,
      warna: 0x53606E,
      warnaButir: [0x6B7681, 0x4A545E, 0x7E8994],
      porositas: 0.02,
      lajuAir: 0.0,
      ciri: 'Batuan padat yang belum lapuk. Tidak ada pori yang bisa dilewati air, hanya retakan besar.',
      peran: 'Menjadi dasar dan batas bawah. Air tanah berkumpul di atas lapisan ini, itulah sebabnya sumur digali sampai mendekati batuan dasar.',
      butir: 'Batuan padat'
    }
  ];

  /* ---------- Tekstur prosedural per lapisan ---------- */
  function teksturLapisan(lapisan, ukuran){
    var c = document.createElement('canvas');
    c.width = c.height = ukuran;
    var g = c.getContext('2d');

    // dasar berbutir
    g.fillStyle = '#' + lapisan.warna.toString(16).padStart(6, '0');
    g.fillRect(0, 0, ukuran, ukuran);

    // bintik mineral
    var jml = lapisan.kode === 'R' ? 60 : (lapisan.kode === 'C' ? 260 : 520);
    for(var i = 0; i < jml; i++){
      var w = lapisan.warnaButir[i % lapisan.warnaButir.length];
      g.fillStyle = 'rgba(' + ((w >> 16) & 255) + ',' + ((w >> 8) & 255) + ',' + (w & 255) + ',' + (0.25 + Math.random() * 0.6) + ')';
      var r = 1 + Math.random() * (lapisan.kode === 'C' || lapisan.kode === 'R' ? 5 : 3);
      g.beginPath();
      g.arc(Math.random() * ukuran, Math.random() * ukuran, r, 0, 6.2832);
      g.fill();
    }

    // retakan untuk batuan
    if(lapisan.kode === 'R' || lapisan.kode === 'C'){
      g.strokeStyle = 'rgba(20,24,28,.55)';
      g.lineWidth = lapisan.kode === 'R' ? 2.2 : 1.2;
      for(var k = 0; k < (lapisan.kode === 'R' ? 7 : 14); k++){
        g.beginPath();
        var x = Math.random() * ukuran, y = Math.random() * ukuran;
        g.moveTo(x, y);
        for(var s = 0; s < 4; s++){
          x += (Math.random() - .5) * ukuran * .5;
          y += (Math.random() - .5) * ukuran * .5;
          g.lineTo(x, y);
        }
        g.stroke();
      }
    }

    // pori terang untuk lapisan berongga (menunjukkan ruang air)
    if(lapisan.porositas > 0.4){
      var pori = Math.round(lapisan.porositas * 160);
      g.fillStyle = 'rgba(255,255,255,.16)';
      for(var p = 0; p < pori; p++){
        g.beginPath();
        g.arc(Math.random() * ukuran, Math.random() * ukuran, .8 + Math.random() * 1.8, 0, 6.2832);
        g.fill();
      }
    }

    var tex = new THREE.CanvasTexture(c);
    // renderer memakai outputEncoding = sRGB; tanpa ini warna tekstur
    // dibaca sebagai linear dan seluruh lapisan tampak krem pucat.
    if('sRGBEncoding' in THREE) tex.encoding = THREE.sRGBEncoding;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 1);
    tex.anisotropy = 4;
    return tex;
  }

  /* ---------- Bangun scene ---------- */
  T.bangun = function(scene, camera, renderer, opsi){
    opsi = opsi || {};
    var kualitas = opsi.kualitas || 'sedang';
    var jumlahButir = kualitas === 'tinggi' ? 900 : (kualitas === 'rendah' ? 260 : 520);
    var texSize = kualitas === 'tinggi' ? 512 : 256;

    var state = {
      terbongkar: 0,          // 0 = tersusun, 1 = terbongkar penuh
      targetBongkar: 0,
      lapisanAktif: null,      // indeks lapisan yang disorot
      airMeresap: true,
      kualitas: kualitas
    };

    if('toneMapping' in renderer){
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
    }

    scene.fog = new THREE.Fog(0xDDEBF5, 14, 40);

    /* cahaya */
    scene.add(new THREE.HemisphereLight(0xE4F1F8, 0x2A2118, .78));
    scene.add(new THREE.AmbientLight(0xC8DCE8, .24));

    var dir = new THREE.DirectionalLight(0xFFF4DE, 1.5);
    dir.position.set(-6, 11, 7);
    dir.castShadow = true;
    dir.shadow.mapSize.width = kualitas === 'tinggi' ? 2048 : 1024;
    dir.shadow.mapSize.height = dir.shadow.mapSize.width;
    dir.shadow.camera.left = -10; dir.shadow.camera.right = 10;
    dir.shadow.camera.top = 12;   dir.shadow.camera.bottom = -12;
    dir.shadow.bias = -0.0008;
    scene.add(dir); scene.add(dir.target);

    var rim = new THREE.DirectionalLight(0x9FC8E0, .45);
    rim.position.set(7, 6, -8);
    scene.add(rim);

    /* ---------- Wadah lapisan ---------- */
    var akar = new THREE.Group();
    scene.add(akar);

    var LEBAR = 6.4, DALAM = 4.2;
    var lapisanMeshes = [];
    var butirMeshes = [];
    var yAwal = 0.9;   // permukaan atas

    var totalTebal = 0;
    T.LAPISAN.forEach(function(l){ totalTebal += l.tebal; });
    var skala = 3.0 / totalTebal;

    // celah tipis: tanpa ini lima lapisan menyatu jadi satu balok
    var CELAH = 0.05;
    var posisiAtas = [];
    var y = yAwal;
    T.LAPISAN.forEach(function(l, i){
      posisiAtas[i] = y;
      y -= l.tebal * skala + CELAH;
    });

    T.LAPISAN.forEach(function(l, i){
      var tinggi = l.tebal * skala;
      var grup = new THREE.Group();
      grup.position.y = posisiAtas[i] - tinggi / 2;
      akar.add(grup);

      /* --- badan lapisan --- */
      var geo = new THREE.BoxGeometry(LEBAR, tinggi, DALAM, 1, 1, 1);
      var mat = new THREE.MeshStandardMaterial({
        map: teksturLapisan(l, texSize),
        color: 0xFFFFFF,
        roughness: l.kode === 'R' ? .82 : .97,
        metalness: 0,
        flatShading: false,
        emissive: 0xFFFFFF,
        emissiveIntensity: 0        // dulu 0.18: semua lapisan tercuci jadi krem
      });
      var mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { lapisan: i, kode: l.kode };
      grup.add(mesh);
      lapisanMeshes[i] = mesh;

      /* --- garis tepi tipis agar batas lapisan jelas --- */
      var tepi = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: 0x121A22, transparent: true, opacity: .55 })
      );
      grup.add(tepi);

      /* --- butir/mineral per lapisan (InstancedMesh) --- */
      var per = Math.round(jumlahButir * (l.kode === 'O' ? .5 : l.kode === 'R' ? .7 : 1) / T.LAPISAN.length);
      var butirGeo = l.kode === 'C' || l.kode === 'R'
        ? new THREE.IcosahedronGeometry(.038, 0)
        : new THREE.SphereGeometry(.032, 5, 4);
      var butirMat = new THREE.MeshStandardMaterial({
        color: l.warnaButir[0], roughness: .85, metalness: 0,
        flatShading: true, vertexColors: false
      });
      var butir = new THREE.InstancedMesh(butirGeo, butirMat, per);
      var d = new THREE.Object3D();
      var warna = new THREE.Color();
      for(var b = 0; b < per; b++){
        d.position.set(
          (Math.random() - .5) * LEBAR * .96,
          (Math.random() - .5) * tinggi * .82,
          (Math.random() - .5) * DALAM * .96
        );
        var sk = .6 + Math.random() * .9;
        d.scale.setScalar(sk);
        d.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        d.updateMatrix();
        butir.setMatrixAt(b, d.matrix);
        warna.setHex(l.warnaButir[b % l.warnaButir.length]);
        butir.setColorAt(b, warna);
      }
      butir.instanceMatrix.needsUpdate = true;
      if(butir.instanceColor) butir.instanceColor.needsUpdate = true;
      butir.castShadow = kualitas === 'tinggi';
      grup.add(butir);
      butirMeshes[i] = butir;

      grup.userData = { lapisan: i, tinggi: tinggi, yDasar: posisiAtas[i] - tinggi / 2, kode: l.kode };
      lapisanGrup[i] = grup;
    });

    /* ---------- Air meresap ---------- */
    var AIR_N = kualitas === 'tinggi' ? 420 : (kualitas === 'rendah' ? 130 : 260);
    var airGeo = new THREE.SphereGeometry(.036, 6, 5);
    var airMat = new THREE.MeshStandardMaterial({
      color: 0x2E9BC8, roughness: .3, metalness: .12,
      transparent: true, opacity: .92, emissive: 0x0A3A52, emissiveIntensity: .15
    });
    var airMesh = new THREE.InstancedMesh(airGeo, airMat, AIR_N);
    airMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    airMesh.frustumCulled = false;
    scene.add(airMesh);

    var airData = [];
    for(var a = 0; a < AIR_N; a++){
      airData.push({
        x: (Math.random() - .5) * LEBAR * .92,
        z: (Math.random() - .5) * DALAM * .92,
        y: yAwal + Math.random() * 1.6,
        // laju mengikuti sifat lapisan; diisi di perbarui()
        fase: Math.random() * 6.283,
        jeda: Math.random() * 3
      });
    }

    /* ---------- Permukaan rumput + akar (atas) ---------- */
    var rumput = new THREE.Mesh(
      new THREE.BoxGeometry(LEBAR, .05, DALAM),
      new THREE.MeshStandardMaterial({ color: 0x4A8544, roughness: 1 })
    );
    rumput.position.y = yAwal + .025;
    rumput.receiveShadow = true;
    akar.add(rumput);

    /* akar kecil menembus O/A */
    var akarMat = new THREE.MeshStandardMaterial({ color: 0x6B4B33, roughness: 1 });
    var akarGrup = new THREE.Group();
    akar.add(akarGrup);
    for(var ak = 0; ak < 14; ak++){
      var t = new THREE.Mesh(new THREE.CylinderGeometry(.012, .02, .55, 5), akarMat);
      var px = (Math.random() - .5) * LEBAR * .8;
      var pz = (Math.random() - .5) * DALAM * .8;
      t.position.set(px, yAwal - .28, pz);
      t.rotation.set((Math.random() - .5) * .3, 0, (Math.random() - .5) * .3);
      t.castShadow = true;
      akarGrup.add(t);
    }

    /* ---------- label kode lapisan (sprite) ---------- */
    function spriteKode(teks, warna){
      var c = document.createElement('canvas');
      c.width = 128; c.height = 128;
      var g = c.getContext('2d');
      g.fillStyle = 'rgba(255,255,255,.94)';
      g.beginPath(); g.arc(64, 64, 54, 0, 6.2832); g.fill();
      g.strokeStyle = warna; g.lineWidth = 6; g.stroke();
      g.fillStyle = warna;
      g.font = '800 62px "Baloo 2", system-ui, sans-serif';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(teks, 64, 68);
      var tex = new THREE.CanvasTexture(c);
      if('sRGBEncoding' in THREE) tex.encoding = THREE.sRGBEncoding;
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
      sp.scale.set(.38, .38, 1);
      return sp;
    }
    var spritesKode = [];
    T.LAPISAN.forEach(function(l, i){
      var sp = spriteKode(l.kode, '#' + l.warna.toString(16).padStart(6, '0'));
      sp.position.set(-LEBAR / 2 - .32, posisiAtas[i] - (l.tebal * skala) / 2, DALAM / 2 + .1);
      akar.add(sp);
      spritesKode[i] = sp;
    });

    state.refs = {
      akar: akar, lapisanMeshes: lapisanMeshes, butirMeshes: butirMeshes,
      airMesh: airMesh, airData: airData, spritesKode: spritesKode,
      yAwal: yAwal, LEBAR: LEBAR, DALAM: DALAM, skala: skala,
      posisiAtas: posisiAtas, dir: dir, airMat: airMat,
      tinggiSusun: totalTebal * skala + CELAH * (T.LAPISAN.length - 1),
      puncak: yAwal, dasar: y - CELAH
    };

    // pembingkaian dilakukan di frame pertama: saat itu kamera, aspek, dan
    // OrbitControls sudah siap. Kalau dilakukan di sini, controls.target masih
    // milik adegan lain dan update() akan menyeret kamera kembali.
    state._bingkarTerakhir = -9;

    return state;
  };

  /* ---------- Bingkai kamera: model selalu masuk layar ----------
     Sasaran = pusat tumpukan (tidak digeser-geser; menggeser sasaran tiap
     iterasi membuat hasilnya melenceng). Hanya JARAK yang diiterasi:
     delapan sudut kotak diproyeksikan, faktor luber terbesar dipakai
     untuk mengoreksi jarak. Konvergen karena faktor itu hampir linear
     terhadap jarak pada kamera perspektif. */
  T.bingkai = function(state, kamera, kontrol){
    var R = state.refs;
    if(!R || !kamera) return;

    if(!state._fovDiset){ kamera.fov = 34; state._fovDiset = true; }

    var bongkar = state.terbongkar || 0;
    var dasarTerbongkar = R.dasar - 3 * 0.85 * bongkar;   // empat lapisan bergeser ke bawah
    var puncak = R.puncak;
    var pusatY = (puncak + dasarTerbongkar) / 2;
    var setengahT = (puncak - dasarTerbongkar) / 2 + 0.15;

    var target = new THREE.Vector3(0, pusatY, 0);

    var arah = kamera.position.clone().sub(target);
    if(arah.lengthSq() < 0.001) arah.set(0.55, 0.42, 0.72);
    arah.normalize();

    var hx = R.LEBAR / 2 + 0.2, hz = R.DALAM / 2 + 0.2;
    var sudut = [];
    for(var a = 0; a < 2; a++){
      for(var b = 0; b < 2; b++){
        for(var c = 0; c < 2; c++){
          sudut.push(new THREE.Vector3(a ? hx : -hx, pusatY + (b ? setengahT : -setengahT), c ? hz : -hz));
        }
      }
    }

    var tanV = Math.tan(kamera.fov * Math.PI / 360);
    var tanH = tanV * (kamera.aspect || 1.6);
    var cadangan = 0.92;
    var jarak = Math.max(kamera.position.distanceTo(target), 5);

    // ukur LUAS TERPAKAI di layar, lalu sesuaikan jarak agar tepat memenuhi
    // ~92% bingkai (arah koreksi dua arah: menjauh bila luber, mendekat bila sisa)
    for(var it = 0; it < 6; it++){
      kamera.position.copy(target).add(arah.clone().multiplyScalar(jarak));
      kamera.lookAt(target);
      kamera.updateMatrixWorld(true);

      var maks = 0;
      for(var i = 0; i < sudut.length; i++){
        var q = sudut[i].clone().project(kamera);
        maks = Math.max(maks, Math.abs(q.x), Math.abs(q.y));
      }
      if(maks < 0.0001) break;
      var koreksi = maks / cadangan;
      if(Math.abs(koreksi - 1) < 0.015) break;
      jarak *= koreksi;
    }

    kamera.lookAt(target);
    kamera.updateMatrixWorld(true);
    kamera.updateProjectionMatrix();

    if(kontrol){
      kontrol.target.copy(target);
      kontrol.minDistance = jarak * 0.4;
      kontrol.maxDistance = jarak * 2.6;
      if(kontrol.maxPolarAngle < 1.5) kontrol.maxPolarAngle = 1.54;
      kontrol.update();
    }
    state._jarakIdeal = jarak;
  };

  /* ---------- Perbarui tiap frame ---------- */
  T.perbarui = function(state, dt, elapsed, kamera, kontrol){
    var R = state.refs;
    if(!R) return;

    /* easing bongkar/susun */
    state.terbongkar += (state.targetBongkar - state.terbongkar) * Math.min(1, dt * 4.2);
    var bongkar = state.terbongkar;

    /* kamera ikut menyesuaikan supaya tumpukan tidak terpotong */
    if(kamera && Math.abs(bongkar - (state._bingkarTerakhir == null ? -9 : state._bingkarTerakhir)) > 0.02){
      T.bingkai(state, kamera, kontrol);
      state._bingkarTerakhir = bongkar;
    }

    /* geser tiap lapisan: makin ke bawah makin jauh, dengan jarak tetap */
    var jarak = 0.85;
    for(var i = 0; i < lapisanGrup.length; i++){
      var grup = lapisanGrup[i];
      if(!grup) continue;
      var l = T.LAPISAN[i];
      var dasarY = R.posisiAtas[i] - (l.tebal * R.skala) / 2;
      // menjauh ke bawah + sedikit menyamping agar terlihat tumpukan
      grup.position.y = dasarY - (i * jarak) * bongkar;
      grup.position.x = (i - 2) * 0.10 * bongkar;

      /* sorotan lapisan aktif */
      var aktif = state.lapisanAktif === i;
      var m = R.lapisanMeshes[i];
      if(m && m.material){
        var targetEm = aktif ? .30 : 0;
        m.material.emissiveIntensity += (targetEm - m.material.emissiveIntensity) * .12;
      }
      /* butir ikut menyorot */
      var bt = R.butirMeshes[i];
      if(bt && bt.material){
        bt.material.emissiveIntensity = aktif ? .3 : 0;
      }
      /* label ikut bergerak */
      var sp = R.spritesKode[i];
      if(sp){
        sp.position.y = grup.position.y;
        sp.material.opacity = 1 - bongkar * 0.15;
      }
    }

    /* ---------- air meresap ke tiap lapisan ---------- */
    var air = R.airMesh;
    var d = new THREE.Object3D();
    var yAwal = R.yAwal;

    for(var k = 0; k < R.airData.length; k++){
      var o = R.airData[k];
      if(state.airMeresap){
        /* cari lapisan tempat titik ini berada */
        var idx = -1;
        for(var L = 0; L < T.LAPISAN.length; L++){
          var atas = R.posisiAtas[L];
          var bawah = atas - T.LAPISAN[L].tebal * R.skala;
          if(o.y <= atas && o.y > bawah){ idx = L; break; }
        }
        var laju = idx >= 0 ? T.LAPISAN[idx].lajuAir : 1;
        // batuan induk: air berhenti lalu mengalir ke samping
        if(idx === T.LAPISAN.length - 1){
          o.y -= 0.02 * dt;                 // hampir berhenti
          o.x += (Math.random() - .5) * .04 * dt;
        } else {
          o.y -= (0.55 + laju * 1.6) * dt;
        }
        if(o.y < -2.6){
          // muncul lagi di atas: hujan baru
          o.y = yAwal + .9 + Math.random() * .9;
          o.x = (Math.random() - .5) * R.LEBAR * .92;
          o.z = (Math.random() - .5) * R.DALAM * .92;
        }
      }
      d.position.set(
        o.x + Math.sin(elapsed * 1.3 + o.fase) * .015,
        o.y,
        o.z + Math.cos(elapsed * 1.1 + o.fase) * .015
      );
      var skalaAir = 0.8 + Math.sin(elapsed * 3 + o.fase) * .18;
      d.scale.setScalar(skalaAir);
      d.updateMatrix();
      air.setMatrixAt(k, d.matrix);
    }
    air.instanceMatrix.needsUpdate = true;
  };

  /* ---------- API kontrol ---------- */
  T.bongkar = function(state, nilai){
    state.targetBongkar = Math.max(0, Math.min(1, nilai));
  };
  T.setSorot = function(state, i){ state.lapisanAktif = i; };
  T.setAir = function(state, on){ state.airMeresap = !!on; };

  window.QIIORA.simTanah = T;
})();