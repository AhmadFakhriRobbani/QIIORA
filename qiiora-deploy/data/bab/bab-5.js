/* ============================================================
   QIIORA — Data Bab 5: Air Tanah dan Sungai
   15 butir: 1–14 materi singkat + soal latihan, 15 = post-test.

   SUMBER:
   - USGS Water Science School — "Aquifers and Groundwater":
     zona tak jenuh, zona jenuh, muka air tanah (water table),
     akuifer, resapan (recharge).
   - USGS — "Groundwater Storage and the Water Cycle" dan
     "Artificial Groundwater Recharge".
   - Modul Perairan Darat / materi DAS: Daerah Aliran Sungai dibatasi
     punggung bukit; bagian hulu (pegunungan, daerah konservasi),
     tengah, dan hilir.
   - Buku Siswa IPAS Kelas V, Kemendikdasmen RI.
   ============================================================ */
(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};
  window.QIIORA.bab = window.QIIORA.bab || {};

  window.QIIORA.bab[5] = {
    nomor: 5,
    judul: 'Air Tanah dan Sungai',
    ringkas: 'Perjalanan air di dalam tanah dan aliran sungai sampai kembali ke laut.',
    sumber: [
      'USGS Water Science School — “Aquifers and Groundwater”: zona tak jenuh, zona jenuh, muka air tanah, akuifer.',
      'USGS — “Groundwater Storage and the Water Cycle”; “Artificial Groundwater Recharge”.',
      'Materi Daerah Aliran Sungai (DAS): batas punggung bukit, bagian hulu–tengah–hilir.',
      'Buku Siswa IPAS Kelas V, Kemendikdasmen RI — air tanah dan sungai.'
    ],
    butir: [

      /* ---------- 1 ---------- */
      {
        id: 'b5-b01',
        judul: 'Air yang tersembunyi di dalam tanah',
        materi: [
          'Ketika hujan turun, sebagian air tidak mengalir di permukaan. Air itu **meresap** ke dalam tanah dan tersimpan di ruang-ruang kecil di antara butir tanah dan batuan.',
          'Air inilah yang disebut **air tanah**. Kita tidak bisa melihatnya, tetapi bisa mengambilnya lewat **sumur** atau melihatnya keluar sebagai **mata air**.'
        ],
        tautanModel: '#/model-tanah',
        sumberButir: 'USGS; Buku Siswa IPAS Kelas V',
        soal: ['b5-q01', 'b5-q09']
      },

      /* ---------- 2 ---------- */
      {
        id: 'b5-b02',
        judul: 'Zona tak jenuh dan zona jenuh',
        materi: [
          'Tanah di bawah permukaan terbagi dua lapisan. Lapisan atas disebut **zona tak jenuh**: porinya terisi sebagian air dan sebagian udara.',
          'Di bawahnya ada **zona jenuh**: seluruh porinya terisi air. Batas antara keduanya disebut **muka air tanah**. Kalau kamu menggali sumur, permukaan air di dasar sumur itulah muka air tanah setempat.'
        ],
        sumberButir: 'USGS Water Science School',
        soal: ['b5-q02']
      },

      /* ---------- 3 ---------- */
      {
        id: 'b5-b03',
        judul: 'Akuifer: spons raksasa di bawah tanah',
        materi: [
          'Lapisan tanah atau batuan yang mampu **menyimpan dan mengalirkan** air dalam jumlah besar disebut **akuifer**. Bayangkan seperti spons raksasa yang terisi air.',
          'Tidak semua lapisan bisa menjadi akuifer. Lempung yang rapat sulit dilewati air, sedangkan pasir dan kerikil berpori besar mudah. Karena itu letak akuifer berbeda-beda di setiap tempat.'
        ],
        sumberButir: 'USGS Water Science School',
        soal: ['b5-q01', 'b5-q11']
      },

      /* ---------- 4 ---------- */
      {
        id: 'b5-b04',
        judul: 'Air tanah harus diisi ulang',
        materi: [
          'Air tanah tidak datang dengan sendirinya. Ia terisi lewat **resapan** (recharge): air hujan yang meresap turun sampai zona jenuh.',
          'Kalau pengambilan air tanah lebih cepat daripada pengisiannya, **muka air tanah turun**. Sumur penduduk bisa mengering, dan tanaman kehilangan cadangan air di musim kemarau.'
        ],
        sumberButir: 'USGS',
        soal: ['b5-q03', 'b5-q08']
      },

      /* ---------- 5 ---------- */
      {
        id: 'b5-b05',
        judul: 'Sumur resapan: membantu tanah mengisi diri',
        materi: [
          '**Sumur resapan** adalah lubang atau bangunan yang menampung air hujan lalu membiarkannya meresap ke tanah. Fungsinya mempercepat air masuk ke akuifer.',
          'Manfaatnya dua sekaligus: **mengurangi banjir** karena air tidak langsung mengalir ke selokan, dan **mengisi air tanah** agar sumur tidak kering saat kemarau.'
        ],
        tautanModel: '#/model-tanah',
        sumberButir: 'USGS — Artificial Groundwater Recharge; Buku Siswa IPAS Kelas V',
        soal: ['b5-q07', 'b5-q15']
      },

      /* ---------- 6 ---------- */
      {
        id: 'b5-b06',
        judul: 'Sungai: air yang mengalir di permukaan',
        materi: [
          'Air yang tidak meresap menjadi **limpasan**. Air ini mengalir ke selokan, parit, lalu berkumpul menjadi **anak sungai** dan **sungai utama**.',
          'Sungai mengalir dari tempat **tinggi** ke tempat **rendah** karena gaya gravitasi. Semakin banyak air yang masuk, semakin deras alirannya.'
        ],
        sumberButir: 'Buku Siswa IPAS Kelas V',
        soal: ['b5-q13']
      },

      /* ---------- 7 ---------- */
      {
        id: 'b5-b07',
        judul: 'Hulu, tengah, hilir',
        materi: [
          'Sungai punya tiga bagian. **Hulu** berada di pegunungan: airnya jernih, alirannya cepat, dan di sinilah air paling banyak meresap.',
          '**Tengah** berada di dataran: aliran melambat dan mulai membawa sedimen. **Hilir** berada dekat muara: alirannya paling lambat dan air dari seluruh wilayah berkumpul di sini.'
        ],
        sumberButir: 'Materi DAS; Buku Siswa IPAS Kelas V',
        soal: ['b5-q04', 'b5-q13']
      },

      /* ---------- 8 ---------- */
      {
        id: 'b5-b08',
        judul: 'Daerah Aliran Sungai (DAS)',
        materi: [
          '**DAS** adalah wilayah daratan yang dibatasi **punggung bukit**. Semua air hujan yang jatuh di dalam wilayah itu mengalir ke **satu sungai utama**.',
          'Karena itu apa yang terjadi di **hulu** memengaruhi **hilir**. Kalau hutan di hulu ditebang, air tidak lagi meresap dan banjir di hilir menjadi lebih sering.'
        ],
        sumberButir: 'Materi DAS',
        soal: ['b5-q05', 'b5-q12', 'b5-q10']
      },

      /* ---------- 9 ---------- */
      {
        id: 'b5-b09',
        judul: 'Mengapa hilir rawan banjir',
        materi: [
          'Di **hilir**, air dari seluruh DAS berkumpul menjadi satu. Sementara itu daratannya lebih **datar**, sehingga aliran melambat.',
          'Kalau hujan deras turun bersamaan, air datang lebih cepat daripada kemampuan sungai mengalirkannya. Air meluap — itulah **banjir**. Membangun di bantaran sungai memperburuk keadaan.'
        ],
        sumberButir: 'Materi DAS; Buku Siswa IPAS Kelas V',
        soal: ['b5-q06']
      },

      /* ---------- 10 ---------- */
      {
        id: 'b5-b10',
        judul: 'Air tanah bukan sungai bawah tanah',
        materi: [
          'Banyak orang membayangkan air tanah sebagai **sungai** yang mengalir di dalam gua. Itu keliru.',
          'Air tanah **mengisi pori-pori** tanah dan batuan, seperti air di dalam spons. Alirannya sangat lambat — bisa hanya beberapa sentimeter sampai beberapa meter per hari, jauh lebih lambat dari sungai di permukaan.'
        ],
        salahKaprah: 'Air tanah bukan sungai bawah tanah. Ia mengisi pori batuan dan bergerak sangat lambat.',
        sumberButir: 'USGS',
        soal: ['b5-q09']
      },

      /* ---------- 11 ---------- */
      {
        id: 'b5-b11',
        judul: 'Mata air: air tanah yang muncul',
        materi: [
          'Kadang air tanah keluar sendiri ke permukaan di tempat tertentu. Keluarnya itu disebut **mata air**. Biasanya muncul di lereng bukit atau kaki gunung.',
          'Mata air menjadi sumber air bersih bagi banyak desa. Karena itu daerah resapan di sekitarnya perlu dijaga — kalau tidak, mata air bisa berhenti mengalir.'
        ],
        sumberButir: 'USGS; Buku Siswa IPAS Kelas V',
        soal: ['b5-q03']
      },

      /* ---------- 12 ---------- */
      {
        id: 'b5-b12',
        judul: 'Menjaga air tanah bersama',
        materi: [
          'Ada beberapa cara sederhana menjaga air tanah. **Menanam pohon** membuat tanah lebih berpori. **Membuat sumur resapan** membantu air masuk. **Tidak menutup halaman dengan beton** memberi air kesempatan meresap.',
          'Sebaliknya, menebang hutan, menutup seluruh halaman dengan semen, dan mengambil air tanah berlebihan membuat cadangan air menipis. Yang dirugikan adalah semua orang di DAS yang sama.'
        ],
        sumberButir: 'Buku Siswa IPAS Kelas V; USGS',
        soal: ['b5-q10', 'b5-q08']
      },

      /* ---------- 13 ---------- */
      {
        id: 'b5-b13',
        judul: 'Menghitung air yang bisa ditampung',
        materi: [
          'Sumur resapan bisa dihitung kapasitasnya. Hujan **1 mm** di atas **1 m²** sama dengan **1 liter** air.',
          'Contoh: hujan 50 mm di atap seluas 40 m² = 50 × 40 = **2000 liter** = **2 m³**. Kalau sumur resapan berkapasitas 2 m³, seluruh air atap itu bisa tertampung dan meresap, bukan terbuang ke selokan.'
        ],
        sumberButir: 'BMKG (satuan curah hujan); USGS',
        soal: ['b5-q15']
      },

      /* ---------- 14 ---------- */
      {
        id: 'b5-b14',
        judul: 'Ringkasan: dari tanah ke sungai ke laut',
        materi: [
          'Air hujan punya dua jalan. **Meresap** ke tanah mengisi **akuifer**, dan bisa diambil lewat sumur atau muncul sebagai mata air. Atau **mengalir** di permukaan sebagai limpasan menuju **sungai**.',
          'Sungai mengalir dari **hulu** ke **hilir** lalu ke **laut**, tempat air menguap lagi. Di dalam **DAS**, perbuatan di hulu selalu terasa di hilir.'
        ],
        sumberButir: 'USGS; Materi DAS; Buku Siswa IPAS Kelas V',
        soal: ['b5-q14', 'b5-q05', 'b5-q06']
      },

      /* ---------- 15 — POST-TEST ---------- */
      {
        id: 'b5-b15',
        judul: 'Post-test Bab 5',
        postTest: true,
        materi: [
          'Ini butir terakhir Bab 5 — dan butir terakhir dari lima bab modul. Kerjakan soal ujian bab, lalu selesaikan tugas proyek di bawahnya.'
        ],
        soal: ['b5-q01', 'b5-q02', 'b5-q03', 'b5-q04', 'b5-q05', 'b5-q06', 'b5-q07', 'b5-q08', 'b5-q09'],
        tugas: 'PT13',
        sumberButir: 'Seluruh materi Bab 5'
      }
    ]
  };
})();