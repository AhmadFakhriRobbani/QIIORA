/* ============================================================
   QIIORA — Data Bab 4: Awan dan Hujan
   15 butir: 1–14 materi singkat + soal latihan, 15 = post-test.

   SUMBER:
   - BMKG (bbmkg3.bmkg.go.id, "Citra Satelit") — pengelompokan awan
     menurut ketinggian: awan tinggi (Cirrus, Cirrostratus,
     Cirrocumulus), awan menengah (Altostratus, Altocumulus),
     awan rendah (Stratus, Stratocumulus, Cumulus, Cumulonimbus).
   - BMKG Stasiun Klimatologi — "Penakar Hujan Observatorium":
     alat ukur curah hujan manual, satuan milimeter (mm), periode
     24 jam, dibaca pukul 07.00 waktu setempat.
   - Buku Siswa IPAS Kelas V, Kemendikdasmen RI.
   - NASA Science — "The Water Cycle" (kondensasi & presipitasi).
   ============================================================ */
(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};
  window.QIIORA.bab = window.QIIORA.bab || {};

  window.QIIORA.bab[4] = {
    nomor: 4,
    judul: 'Awan dan Hujan',
    ringkas: 'Jenis awan, proses terbentuknya hujan, dan cara mengukur curah hujan.',
    sumber: [
      'BMKG — “Citra Satelit”: pengelompokan awan tinggi, menengah, dan rendah.',
      'BMKG Stasiun Klimatologi — “Penakar Hujan Observatorium”: satuan milimeter, periode 24 jam, pembacaan pukul 07.00.',
      'Buku Siswa IPAS Kelas V, Kemendikdasmen RI — awan dan presipitasi.',
      'NASA Science — “The Water Cycle”: kondensasi dan presipitasi.'
    ],
    butir: [

      /* ---------- 1 ---------- */
      {
        id: 'b4-b01',
        judul: 'Awan bukan uap air',
        materi: [
          'Awan yang kita lihat **bukan uap air**. Awan tersusun dari **titik-titik air** atau **kristal es** yang sangat kecil — hasil pengembunan, bukan gas.',
          'Uap air sendiri tidak terlihat. Jadi ketika kamu menunjuk "uap" berwarna putih di langit, yang kamu lihat sebenarnya adalah kumpulan titik air yang sudah mengembun.'
        ],
        salahKaprah: 'Awan = titik air atau kristal es. Uap air = gas tidak terlihat.',
        sumberButir: 'Buku Siswa IPAS Kelas V; NASA Science',
        soal: ['b4-q01']
      },

      /* ---------- 2 ---------- */
      {
        id: 'b4-b02',
        judul: 'Bagaimana awan terbentuk',
        materi: [
          'Prosesnya tiga langkah. **Pertama**, air di laut, danau, dan sungai menguap karena panas Matahari. **Kedua**, uap itu naik ke udara yang lebih dingin. **Ketiga**, uap mengembun menjadi titik-titik air kecil.',
          'Titik-titik air itu berkumpul mengelilingi debu atau garam laut yang sangat halus di udara. Kumpulan itulah yang kita lihat sebagai **awan**.'
        ],
        sumberButir: 'NASA Science; Buku Siswa IPAS Kelas V',
        soal: ['b4-q02', 'b4-q13']
      },

      /* ---------- 3 ---------- */
      {
        id: 'b4-b03',
        judul: 'Awan dikelompokkan menurut ketinggian',
        materi: [
          'BMKG mengelompokkan awan menurut **ketinggiannya**. **Awan tinggi** (sekitar 6–18 km): sirus, sirusstratus, siruskumulus. **Awan menengah** (sekitar 3–5 km): altostratus, altokumulus.',
          '**Awan rendah** (di bawah 2 km): stratus, stratokumulus, kumulus, dan kumulonimbus. Makin tinggi awan, makin dingin udaranya — itulah sebabnya awan tinggi tersusun dari kristal es.'
        ],
        fakta: 'Pengelompokan ini mengikuti klasifikasi awan yang dipakai BMKG dalam pengamatan citra satelit.',
        sumberButir: 'BMKG',
        soal: ['b4-q03']
      },

      /* ---------- 4 ---------- */
      {
        id: 'b4-b04',
        judul: 'Awan sirus: tipis seperti bulu',
        materi: [
          '**Awan sirus** (cirrus) adalah awan **tinggi** yang tipis, halus, dan berserat seperti bulu atau kapas yang ditarik. Karena sangat tinggi dan dingin, awan ini tersusun dari **kristal es**.',
          'Sirus biasanya menandakan cuaca masih cerah, tetapi bisa juga pertanda bahwa cuaca akan berubah dalam beberapa jam ke depan.'
        ],
        sumberButir: 'BMKG; Buku Siswa IPAS Kelas V',
        soal: ['b4-q03', 'b4-q10']
      },

      /* ---------- 5 ---------- */
      {
        id: 'b4-b05',
        judul: 'Awan kumulus: kapas putih',
        materi: [
          '**Awan kumulus** adalah awan **rendah** berwarna putih dan bergumpal seperti kapas. Awan ini terbentuk ketika udara hangat naik dari permukaan yang panas.',
          'Kumulus yang kecil dan terpisah biasanya menandakan cuaca **cerah**. Namun kalau kumulus terus tumbuh tinggi dan menggelap, ia bisa berkembang menjadi awan badai.'
        ],
        sumberButir: 'BMKG',
        soal: ['b4-q04']
      },

      /* ---------- 6 ---------- */
      {
        id: 'b4-b06',
        judul: 'Awan stratus: selimut kelabu',
        materi: [
          '**Awan stratus** adalah awan **rendah** yang melebar seperti **selimut** atau lapisan tipis menutupi langit. Warnanya kelabu merata, bukan bergumpal.',
          'Saat stratus menutupi langit, hari terasa mendung dan bisa turun **gerimis** halus. Stratus tidak menghasilkan hujan deras seperti kumulonimbus.'
        ],
        sumberButir: 'BMKG',
        soal: ['b4-q06']
      },

      /* ---------- 7 ---------- */
      {
        id: 'b4-b07',
        judul: 'Awan kumulonimbus: raja badai',
        materi: [
          '**Awan kumulonimbus** (disingkat CB) adalah awan **rendah** yang menjulang sangat tinggi — bisa menembus lapisan awan menengah. Warnanya gelap, tebal, dan bagian atasnya melebar seperti landasan.',
          'Awan inilah yang menimbulkan **hujan deras**, **petir**, **angin kencang**, dan kadang **hujan es**. Kalau melihat CB tumbuh di sore hari, bersiaplah untuk hujan.'
        ],
        sumberButir: 'BMKG',
        soal: ['b4-q05', 'b4-q11']
      },

      /* ---------- 8 ---------- */
      {
        id: 'b4-b08',
        judul: 'Dari awan menjadi hujan',
        materi: [
          'Di dalam awan, titik-titik air terus bergerak dan **bertumbukan**. Saat bertumbukan, mereka bergabung menjadi titik yang lebih besar.',
          'Titik air yang makin besar makin berat. Ketika beratnya melebihi kemampuan udara menahannya, titik itu **jatuh** sebagai hujan. Kalau udara di bawahnya sangat dingin, jatuhnya bisa berupa **salju** atau **hujan es**.'
        ],
        sumberButir: 'NASA Science; Buku Siswa IPAS Kelas V',
        soal: ['b4-q07', 'b4-q13']
      },

      /* ---------- 9 ---------- */
      {
        id: 'b4-b09',
        judul: 'Tidak semua awan menurunkan hujan',
        materi: [
          'Banyak awan melintas di langit tanpa menurunkan hujan. Hujan baru terjadi bila titik air di dalam awan **cukup besar dan berat**.',
          'Awan tipis seperti sirus hampir tidak pernah menghasilkan hujan yang sampai ke tanah — titiknya terlalu kecil, dan sering menguap lagi sebelum mencapai permukaan.'
        ],
        sumberButir: 'Buku Siswa IPAS Kelas V',
        soal: ['b4-q09']
      },

      /* ---------- 10 ---------- */
      {
        id: 'b4-b10',
        judul: 'Mengukur curah hujan',
        materi: [
          'Curah hujan diukur dengan **penakar hujan** (ombrometer). Air hujan masuk lewat corong, tertampung di tabung, lalu diukur dengan gelas ukur.',
          'Satuannya **milimeter (mm)**, bukan liter. Penakar hujan observatorium diukur setiap **24 jam** dan dibaca pada pukul **07.00** waktu setempat. (Sumber: BMKG)'
        ],
        sumberButir: 'BMKG — Penakar Hujan Observatorium',
        soal: ['b4-q08', 'b4-q12']
      },

      /* ---------- 11 ---------- */
      {
        id: 'b4-b11',
        judul: 'Arti angka milimeter',
        materi: [
          'Hujan **1 mm** berarti air setinggi 1 mm menutupi permukaan datar. Kalau ditampung di atas 1 m², air itu sama dengan **1 liter**.',
          'Jadi hujan 35 mm di atap seluas 20 m² berarti 35 × 20 = **700 liter** air. Angka curah hujan membantu petani memutuskan kapan menanam dan membantu kota merancang saluran air.'
        ],
        percobaan: {
          judul: 'Coba sendiri',
          teks: 'Letakkan gelas ukur berpenampang datar di halaman saat hujan. Setelah hujan berhenti, ukur tingginya. Itulah curah hujan hari itu dalam milimeter.'
        },
        sumberButir: 'BMKG',
        soal: ['b4-q15']
      },

      /* ---------- 12 ---------- */
      {
        id: 'b4-b12',
        judul: 'Hujan di Indonesia',
        materi: [
          'Indonesia beriklim **tropis** dengan dua musim: **hujan** dan **kemarau**. Musim hujan biasanya jatuh pada Oktober–Maret, kemarau pada April–September.',
          'Karena berada di sekitar garis khatulistiwa, Indonesia menerima panas Matahari sepanjang tahun. Panas itu membuat penguapan tinggi, sehingga awan hujan mudah terbentuk.'
        ],
        sumberButir: 'BMKG; Buku Siswa IPAS Kelas V',
        soal: ['b4-q15']
      },

      /* ---------- 13 ---------- */
      {
        id: 'b4-b13',
        judul: 'Awan dan cuaca sehari-hari',
        materi: [
          'Awan bisa membantu memperkirakan cuaca. **Kumulus kecil** di pagi cerah: biasanya cuaca baik. **Stratus** merata: mendung, mungkin gerimis.',
          '**Kumulonimbus** yang tumbuh cepat di siang panas: waspada hujan deras dan petir. Perkiraan ini tidak selalu tepat, tetapi cukup membantu untuk bersiap.'
        ],
        sumberButir: 'BMKG',
        soal: ['b4-q14', 'b4-q04']
      },

      /* ---------- 14 ---------- */
      {
        id: 'b4-b14',
        judul: 'Ringkasan: awan dan hujan',
        materi: [
          'Awan terbentuk dari **titik air atau kristal es**, bukan uap. BMKG mengelompokkannya menurut ketinggian: **tinggi** (sirus), **menengah** (altostratus), **rendah** (stratus, kumulus, kumulonimbus).',
          'Hujan turun ketika titik air di awan **cukup berat**. Curah hujan diukur dengan **penakar hujan** dalam satuan **milimeter**, setiap 24 jam, dibaca pukul 07.00.'
        ],
        sumberButir: 'BMKG; NASA Science; Buku Siswa IPAS Kelas V',
        soal: ['b4-q14', 'b4-q08', 'b4-q07']
      },

      /* ---------- 15 — POST-TEST ---------- */
      {
        id: 'b4-b15',
        judul: 'Post-test Bab 4',
        postTest: true,
        materi: [
          'Ini butir terakhir Bab 4. Kerjakan soal ujian bab untuk melihat pemahamanmu, lalu selesaikan tugas proyek di bawahnya.'
        ],
        soal: ['b4-q01', 'b4-q02', 'b4-q03', 'b4-q04', 'b4-q05', 'b4-q06', 'b4-q07', 'b4-q08', 'b4-q09'],
        tugas: 'PT12',
        sumberButir: 'Seluruh materi Bab 4'
      }
    ]
  };
})();