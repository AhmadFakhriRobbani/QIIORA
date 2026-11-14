/* ============================================================
   QIIORA — Data Bab 3: Siklus Air
   15 butir: 1–14 materi singkat + soal latihan, 15 = post-test.

   Pemetaan soal lama (b3-qNN) ke butir menurut `indikator` + `rujukan`:
     indikator I1 = pengertian/proses dasar penguapan
     indikator I2 = istilah & tahap siklus
     indikator I3 = peresapan/air tanah
     indikator I4 = peran manusia & penerapan
   Materi butir mengikuti 5 tahap Bab 3 lama (mp1–mp5) + pengayaan.

   Sumber: Buku Siswa IPAS Kelas V (Kemendikdasmen), NASA Science,
   BMKG. Angka 70% / 3% / 68% dari NASA Science (tertulis di Bab 3 lama).
   ============================================================ */
(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};
  window.QIIORA.bab = window.QIIORA.bab || {};

  window.QIIORA.bab[3] = {
    nomor: 3,
    judul: 'Siklus Air',
    ringkas: 'Penguapan, pengembunan, hujan, lalu meresap atau mengalir kembali ke laut.',
    sumber: [
      'Buku Siswa IPAS Kelas V, Kemendikdasmen RI — materi siklus air dan air tanah.',
      'NASA Science — “Water Cycle” dan fakta sebaran air di Bumi (70% permukaan, 3% air tawar, 68% air tawar berupa es).',
      'BMKG — penjelasan proses presipitasi dan curah hujan.'
    ],
    butir: [

      /* ---------- 1 ---------- */
      {
        id: 'b3-b01',
        judul: 'Air yang tidak pernah habis',
        materi: [
          'Bumi disebut planet air karena sekitar 70% permukaannya tertutup air. Namun air itu tidak diam — ia terus berpindah dari laut ke langit, lalu kembali ke darat dan laut.',
          'Perpindahan air yang berulang ini disebut **siklus air**. Karena berulang, jumlah air di Bumi kira-kira tetap: air yang kita pakai hari ini pernah dipakai makhluk hidup ratusan tahun lalu.'
        ],
        sumberButir: 'NASA Science, Water Cycle',
        soal: ['b3-q01']
      },

      /* ---------- 2 ---------- */
      {
        id: 'b3-b02',
        judul: 'Evaporasi: air menjadi uap',
        materi: [
          'Matahari memanaskan permukaan laut, danau, dan sungai. Air yang cukup panas berubah menjadi **uap air** dan naik ke udara. Perubahan dari cair ke gas ini disebut **evaporasi** (penguapan).',
          'Semakin luas permukaan air dan semakin panas udaranya, semakin cepat penguapan terjadi. Itu sebabnya jemuran lebih cepat kering di hari terik.'
        ],
        percobaan: {
          judul: 'Coba sendiri',
          teks: 'Taruh sedikit air di piring, letakkan di tempat terkena Matahari. Periksa setelah 2 jam — airnya berkurang. Ke mana perginya?'
        },
        sumberButir: 'Buku Siswa IPAS Kelas V',
        soal: ['b3-q12']
      },

      /* ---------- 3 ---------- */
      {
        id: 'b3-b03',
        judul: 'Transpirasi: tumbuhan melepas uap',
        materi: [
          'Tumbuhan menyerap air dari tanah lewat akar. Sebagian air itu dipakai untuk memasak makanan, sebagian lagi dilepas sebagai uap melalui lubang kecil di daun yang disebut **stomata**.',
          'Pelepasan uap air dari tumbuhan disebut **transpirasi**. Evaporasi dari permukaan air dan transpirasi dari tumbuhan digabung menjadi satu istilah: **evapotranspirasi**.'
        ],
        sumberButir: 'Buku Siswa IPAS Kelas V',
        soal: ['b3-q02']
      },

      /* ---------- 4 ---------- */
      {
        id: 'b3-b04',
        judul: 'Uap air tidak terlihat',
        materi: [
          'Banyak orang menyebut asap putih di atas air mendidih sebagai “uap”. Sebenarnya uap air adalah gas yang **tidak berwarna dan tidak terlihat**.',
          'Yang kita lihat sebagai asap putih itu adalah titik-titik air kecil hasil pengembunan, bukan gasnya. Karena tidak terlihat, uap air di udara hanya bisa diketahui dari alat ukur kelembapan.'
        ],
        salahKaprah: 'Uap air ≠ asap putih. Yang tampak putih adalah titik air yang sudah mengembun.',
        sumberButir: 'Buku Siswa IPAS Kelas V',
        soal: ['b3-q09', 'b3-q06']
      },

      /* ---------- 5 ---------- */
      {
        id: 'b3-b05',
        judul: 'Kondensasi: uap menjadi titik air',
        materi: [
          'Uap air naik ke udara yang lebih dingin. Karena dingin, uap itu berubah kembali menjadi titik-titik air sangat kecil. Perubahan gas menjadi cair ini disebut **kondensasi** (pengembunan).',
          'Titik-titik air itu saling menempel dan berkumpul membentuk **awan**. Contoh kondensasi yang mudah diamati: titik air di luar gelas es, atau kaca jendela yang berembun saat hujan.'
        ],
        sumberButir: 'Buku Siswa IPAS Kelas V; NASA Science',
        soal: ['b3-q03', 'b3-q10']
      },

      /* ---------- 6 ---------- */
      {
        id: 'b3-b06',
        judul: 'Awan bukan uap air',
        materi: [
          'Awan yang kita lihat di langit **bukan** uap air. Awan tersusun dari titik-titik air atau kristal es yang sangat kecil — hasil kondensasi, bukan gas.',
          'Karena itu awan bisa terlihat putih atau kelabu, sedangkan uap air sama sekali tidak tampak. Satu awan besar bisa berisi miliaran titik air, tetapi titiknya begitu kecil sehingga masih bisa melayang.'
        ],
        salahKaprah: 'Awan = titik air atau kristal es, bukan uap air.',
        sumberButir: 'Buku Siswa IPAS Kelas V',
        soal: ['b3-q06']
      },

      /* ---------- 7 ---------- */
      {
        id: 'b3-b07',
        judul: 'Presipitasi: air jatuh kembali',
        materi: [
          'Di dalam awan, titik-titik air terus bergabung dan membesar. Saat beratnya melebihi kemampuan udara menahannya, air jatuh ke Bumi. Peristiwa turunnya air dari atmosfer ini disebut **presipitasi**.',
          'Bentuknya bisa bermacam-macam: **hujan** di daerah panas, **salju** di daerah sangat dingin, atau **hujan es** bila udara di atas sangat dingin.'
        ],
        sumberButir: 'BMKG; Buku Siswa IPAS Kelas V',
        soal: ['b3-q04']
      },

      /* ---------- 8 ---------- */
      {
        id: 'b3-b08',
        judul: 'Urutan tahap siklus air',
        materi: [
          'Siklus air selalu berjalan dalam urutan yang sama: **evaporasi → transpirasi → kondensasi → presipitasi → infiltrasi/limpasan** — lalu kembali lagi ke awal.',
          'Urutan ini tidak pernah terbalik: air tidak mungkin jatuh sebagai hujan sebelum berkumpul di awan, dan awan tidak terbentuk tanpa uap air yang naik lebih dulu.'
        ],
        sumberButir: 'Buku Siswa IPAS Kelas V',
        soal: ['b3-q12', 'b3-q13']
      },

      /* ---------- 9 ---------- */
      {
        id: 'b3-b09',
        judul: 'Infiltrasi: air meresap ke tanah',
        materi: [
          'Air hujan yang mencapai tanah punya dua pilihan. Sebagian **meresap** ke dalam pori-pori tanah — ini disebut **infiltrasi**. Sebagian lagi mengalir di permukaan menuju sungai — ini disebut **limpasan**.',
          'Air yang meresap masuk melewati lapisan tanah satu per satu, lalu berkumpul di ruang antar butir tanah sebagai **air tanah**. Di sinilah air bisa tersimpan lama, bahkan bertahun-tahun.'
        ],
        tautanModel: '#/model-tanah',
        sumberButir: 'Buku Siswa IPAS Kelas V',
        soal: ['b3-q05', 'b3-q11']
      },

      /* ---------- 10 ---------- */
      {
        id: 'b3-b10',
        judul: 'Limpasan dan kembali ke laut',
        materi: [
          'Air yang tidak meresap mengalir di permukaan sebagai **limpasan**, masuk ke selokan, anak sungai, lalu sungai besar, dan akhirnya kembali ke **laut**.',
          'Di laut, air itu akan menguap lagi karena panas Matahari — dan siklus pun berulang. Jadi air yang kita minum hari ini bisa jadi pernah jatuh di tempat yang sangat jauh.'
        ],
        sumberButir: 'Buku Siswa IPAS Kelas V',
        soal: ['b3-q04']
      },

      /* ---------- 11 ---------- */
      {
        id: 'b3-b11',
        judul: 'Mengapa air tawar sangat berharga',
        materi: [
          'Sekitar 70% permukaan Bumi tertutup air, tetapi hanya ±**3%** yang berupa air tawar. Dari air tawar itu, lebih dari **68%** justru tersimpan sebagai es di gletser dan lapisan es — tidak bisa langsung diminum.',
          'Artinya air tawar yang mudah dijangkau manusia sangat sedikit. Inilah alasan kita perlu menghemat air meskipun Bumi terlihat penuh air.'
        ],
        fakta: 'Sumber angka: NASA Science, Water Cycle.',
        sumberButir: 'NASA Science',
        soal: ['b3-q14']
      },

      /* ---------- 12 ---------- */
      {
        id: 'b3-b12',
        judul: 'Menghitung air hujan',
        materi: [
          'Curah hujan diukur dalam **milimeter (mm)**. Hujan 1 mm berarti air setinggi 1 mm menutupi permukaan datar seluas 1 m² — sama dengan **1 liter** air per meter persegi.',
          'Jadi hujan 5 mm di atap seluas 20 m² berarti 5 × 20 = **100 liter** air. Hitungan sederhana ini dipakai untuk memperkirakan berapa air yang bisa ditampung tandon atau sumur resapan.'
        ],
        sumberButir: 'BMKG — cara pengukuran curah hujan',
        soal: ['b3-q14']
      },

      /* ---------- 13 ---------- */
      {
        id: 'b3-b13',
        judul: 'Peran manusia menjaga siklus air',
        materi: [
          'Siklus air berjalan sendiri, tetapi manusia bisa memperlambat atau merusaknya. Menebang hutan habis-habisan membuat tanah tidak lagi menahan air, sehingga limpasan membesar dan air tanah berkurang.',
          'Sebaliknya, menanam pohon, membuat **sumur resapan**, dan tidak membuang sampah ke sungai membantu air tetap meresap ke tanah dan mengurangi banjir.'
        ],
        sumberButir: 'Buku Siswa IPAS Kelas V',
        soal: ['b3-q07', 'b3-q08']
      },

      /* ---------- 14 ---------- */
      {
        id: 'b3-b14',
        judul: 'Ringkasan: satu putaran penuh',
        materi: [
          'Mari ulangi sekali lagi. Matahari memanaskan air → **evaporasi**. Tumbuhan ikut melepas uap → **transpirasi**. Uap naik, mendingin, menjadi titik air → **kondensasi** membentuk awan.',
          'Titik air bergabung sampai berat → **presipitasi** sebagai hujan. Sampai di tanah, air **meresap** (infiltrasi) atau **mengalir** (limpasan) kembali ke laut. Siklus siap berulang.'
        ],
        sumberButir: 'Buku Siswa IPAS Kelas V; NASA Science',
        soal: ['b3-q13', 'b3-q03', 'b3-q05']
      },

      /* ---------- 15 — POST-TEST ---------- */
      {
        id: 'b3-b15',
        judul: 'Post-test Bab 3',
        postTest: true,
        materi: [
          'Ini butir terakhir Bab 3. Kerjakan soal ujian bab untuk melihat pemahamanmu, lalu selesaikan tugas proyek di bawahnya.'
        ],
        soal: ['b3-q01', 'b3-q02', 'b3-q03', 'b3-q04', 'b3-q05', 'b3-q06', 'b3-q07', 'b3-q08', 'b3-q09'],
        tugas: 'PT3',
        sumberButir: 'Seluruh tahap Bab 3'
      }
    ]
  };
})();