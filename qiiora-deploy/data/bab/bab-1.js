/* ============================================================
   QIIORA — Data Bab 1: Air di Bumi
   15 butir: 1–14 materi singkat + soal latihan, 15 = post-test.

   SUMBER ANGKA (semua terverifikasi, tidak ada karangan):
   - NASA Space Place / NASA Science: permukaan Bumi 71% tertutup air;
     sekitar 96,5% air Bumi adalah air asin; air tawar sekitar 3,5%
     (NASA) sedangkan USGS menyebut 2,5% — di materi dipakai
     "sekitar 3%" dan perbedaan ini disebut terus terang.
   - NASA: sekitar 68% air tawar terperangkap sebagai es di gletser
     dan lapisan es.
   - USGS: sekitar 30% air tawar Bumi berupa air tanah; air tawar di
     danau dan sungai kurang dari 1%.
   ============================================================ */
(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};
  window.QIIORA.bab = window.QIIORA.bab || {};

  window.QIIORA.bab[1] = {
    nomor: 1,
    judul: 'Air di Bumi',
    ringkas: 'Sebaran air di laut, es, dan daratan serta mengapa air tawar sangat berharga.',
    sumber: [
      'NASA Space Place — “How Much Water Is on Earth?”: 71% permukaan Bumi tertutup air, 96,5% air asin, air tawar sekitar 3,5%, dan 68% air tawar terperangkap sebagai es.',
      'NASA Science — “The Water Cycle”: total air Bumi sekitar 1,39 miliar km³, sekitar 96,5% di samudra.',
      'USGS Water Science School — “Where is Earth’s Water?” dan “How Much Water is There on Earth?”: air tawar Bumi sekitar 2,5%; sekitar 30% air tawar berupa air tanah; air tawar di danau dan sungai kurang dari 1%.',
      'Buku Siswa IPAS Kelas V, Kemendikdasmen RI — materi air di Bumi.'
    ],
    catatanSumber: 'NASA menyebut air tawar 3,5%, USGS menyebut 2,5%. Materi memakai “sekitar 3%” agar tidak menyesatkan; selisihnya karena cara membulatkan, bukan karena datanya bertentangan.',
    butir: [

      /* ---------- 1 ---------- */
      {
        id: 'b1-b01',
        judul: 'Planet yang tertutup air',
        materi: [
          'Dilihat dari luar angkasa, Bumi tampak biru. Penyebabnya sederhana: sekitar **71%** permukaan Bumi tertutup air. Itu sebabnya Bumi dijuluki **planet air**.',
          'Air itu tidak hanya di laut. Ada yang membeku di kutub, ada yang mengalir di sungai, ada yang tersimpan di dalam tanah, dan ada yang melayang di udara sebagai uap.'
        ],
        sumberButir: 'NASA Space Place; USGS',
        soal: ['b1-q01']
      },

      /* ---------- 2 ---------- */
      {
        id: 'b1-b02',
        judul: 'Hampir semuanya air asin',
        materi: [
          'Dari seluruh air di Bumi, sekitar **96,5%** adalah **air asin** di laut dan samudra. Sisanya yang kecil sekali baru air tawar.',
          'Air laut terasa asin karena mengandung garam terlarut. Garam itu berasal dari batuan di darat yang terkikis air hujan, terbawa sungai, lalu mengendap di laut selama jutaan tahun.'
        ],
        sumberButir: 'NASA; USGS',
        soal: ['b1-q02', 'b1-q12']
      },

      /* ---------- 3 ---------- */
      {
        id: 'b1-b03',
        judul: 'Air tawar yang sangat sedikit',
        materi: [
          'Air tawar di Bumi hanya sekitar **3%** dari seluruh air. NASA menyebut 3,5%, USGS menyebut 2,5% — perbedaannya karena cara membulatkan, dan keduanya sepakat bahwa jumlahnya kecil sekali.',
          'Bandingkan dengan satu gelas air: kalau seluruh air Bumi diibaratkan satu gelas penuh, air tawarnya hanya sekitar satu sendok teh. Sedikit sekali, bukan?'
        ],
        salahKaprah: 'Bumi disebut "planet air", tetapi air yang bisa langsung diminum sangat sedikit. Dua hal itu sama-sama benar.',
        sumberButir: 'NASA; USGS',
        soal: ['b1-q03', 'b1-q15']
      },

      /* ---------- 4 ---------- */
      {
        id: 'b1-b04',
        judul: 'Es di kutub menyimpan paling banyak',
        materi: [
          'Dari air tawar yang sedikit itu, sekitar **68%** justru terperangkap sebagai **es** di gletser dan lapisan es kutub. Es ini beku, jauh dari tempat tinggal manusia, dan tidak bisa langsung diminum.',
          'Kalau es di kutub mencair karena Bumi makin panas, air tawar itu akan mengalir ke laut dan bercampur menjadi asin. Air tawar yang bisa dipakai justru makin sedikit.'
        ],
        fakta: 'Sumber angka: NASA Space Place — “68% of fresh water is trapped in ice and glaciers”.',
        sumberButir: 'NASA Space Place',
        soal: ['b1-q03']
      },

      /* ---------- 5 ---------- */
      {
        id: 'b1-b05',
        judul: 'Air di dalam tanah',
        materi: [
          'Air tawar yang tidak membeku sebagian besar tersimpan **di dalam tanah**, kira-kira **30%** dari seluruh air tawar Bumi. Inilah **air tanah**.',
          'Air tanah tidak mengalir seperti sungai di bawah tanah. Ia mengisi ruang-ruang kecil (pori) di antara butir tanah dan batuan, seperti air yang terserap spons.'
        ],
        tautanModel: '#/model-tanah',
        sumberButir: 'USGS Water Science School',
        soal: ['b1-q04', 'b1-q10']
      },

      /* ---------- 6 ---------- */
      {
        id: 'b1-b06',
        judul: 'Sungai dan danau: sedikit tetapi paling kita pakai',
        materi: [
          'Air tawar di **danau dan sungai** jumlahnya kurang dari **1%** air tawar Bumi. Namun justru inilah yang setiap hari kita pakai: untuk minum, mandi, mencuci, dan mengairi sawah.',
          'Jadi air yang paling mudah dijangkau manusia adalah bagian yang paling kecil. Itu sebabnya sungai dan danau perlu dijaga kebersihannya.'
        ],
        sumberButir: 'USGS Water Science School',
        soal: ['b1-q05']
      },

      /* ---------- 7 ---------- */
      {
        id: 'b1-b07',
        judul: 'Air juga ada di udara',
        materi: [
          'Di atas kita, air juga ada — sebagai **uap air** yang tidak terlihat dan sebagai titik-titik air di awan. Jumlahnya kurang dari 1% air tawar, tetapi perannya besar: dari sinilah hujan berasal.',
          'Uap air di udara juga yang membuat cuaca terasa lembap atau kering. Saat cuaca dingin, uap itu bisa mengembun di kaca jendela rumahmu.'
        ],
        sumberButir: 'USGS; Buku Siswa IPAS Kelas V',
        soal: ['b1-q14']
      },

      /* ---------- 8 ---------- */
      {
        id: 'b1-b08',
        judul: 'Air laut tidak bisa langsung diminum',
        materi: [
          'Air laut mengandung garam terlarut dalam jumlah tinggi. Tubuh kita tidak dapat mengolah air bergaram sebanyak itu — meminumnya justru membuat tubuh makin kehausan.',
          'Untuk mengubah air laut menjadi air tawar, diperlukan alat penyuling yang mahal dan memakai banyak energi. Karena itu kita lebih bergantung pada air tawar dari sungai, danau, dan tanah.'
        ],
        salahKaprah: 'Air laut bukan "air kotor" — ia bersih, hanya terlalu asin untuk diminum.',
        sumberButir: 'Buku Siswa IPAS Kelas V',
        soal: ['b1-q07', 'b1-q09']
      },

      /* ---------- 9 ---------- */
      {
        id: 'b1-b09',
        judul: 'Jumlah air kira-kira tetap',
        materi: [
          'Air terus dipakai, tetapi jumlahnya di Bumi kira-kira **tetap**. Sebabnya: air tidak hilang, hanya **berpindah tempat dan berubah wujud** dalam siklus air.',
          'Air yang kamu minum hari ini bisa saja pernah menguap dari laut, jatuh sebagai hujan di gunung, meresap ke tanah, lalu keluar lagi di mata air. Molekulnya sama, hanya berkeliling.'
        ],
        sumberButir: 'NASA Science; Buku Siswa IPAS Kelas V',
        soal: ['b1-q06']
      },

      /* ---------- 10 ---------- */
      {
        id: 'b1-b10',
        judul: 'Membaca data sebaran air',
        materi: [
          'Cara paling jujur memahami sebaran air adalah lewat angka. Dari seluruh air Bumi: sekitar **96,5%** air asin di laut, dan sekitar **3%** air tawar.',
          'Dari air tawar itu: sekitar **68%** es di kutub, sekitar **30%** air tanah, dan sisanya kurang dari **2%** ada di sungai, danau, dan udara. Perhatikan: yang paling mudah kita pakai justru paling sedikit.'
        ],
        fakta: 'Angka dari NASA Space Place dan USGS Water Science School. Presentase dibulatkan.',
        sumberButir: 'NASA; USGS',
        soal: ['b1-q13', 'b1-q05']
      },

      /* ---------- 11 ---------- */
      {
        id: 'b1-b11',
        judul: 'Menghitung bagian air tawar',
        materi: [
          'Persentase mudah diubah menjadi jumlah nyata. Kalau air tawar hanya **3%**, maka dari 100 liter air Bumi hanya **3 liter** yang air tawar.',
          'Dari 3 liter itu, sekitar 2 liter membeku sebagai es, sekitar 0,9 liter tersimpan di dalam tanah, dan hanya sekitar 0,06 liter yang ada di sungai, danau, dan udara. Itulah bagian yang benar-benar bisa kita pakai.'
        ],
        percobaan: {
          judul: 'Coba sendiri',
          teks: 'Isi gelas dengan 100 sendok air. Ambil 3 sendok sebagai "air tawar". Dari 3 sendok itu, ambil lagi sebagian besar sebagai "es". Sisanya — itulah air yang bisa diminum.'
        },
        sumberButir: 'NASA; USGS (hitungan diturunkan dari persentase)',
        soal: ['b1-q15']
      },

      /* ---------- 12 ---------- */
      {
        id: 'b1-b12',
        judul: 'Air tanah dan sumur',
        materi: [
          'Karena air tanah tersimpan di pori-pori tanah, manusia bisa mengambilnya dengan membuat **sumur**. Sumur digali sampai menembus lapisan tanah yang berisi air.',
          'Kalau air tanah diambil terus-menerus tanpa diberi kesempatan terisi kembali oleh hujan, permukaan air tanah akan turun. Sumur bisa mengering, dan tanaman kehilangan cadangan air.'
        ],
        tautanModel: '#/model-tanah',
        sumberButir: 'USGS; Buku Siswa IPAS Kelas V',
        soal: ['b1-q04', 'b1-q11']
      },

      /* ---------- 13 ---------- */
      {
        id: 'b1-b13',
        judul: 'Mengapa air tawar berharga',
        materi: [
          'Tiga hal membuat air tawar sangat berharga. Pertama, jumlahnya sedikit — hanya sekitar 3% dari seluruh air. Kedua, sebagian besar membeku di kutub. Ketiga, air laut tidak bisa langsung diminum.',
          'Semua makhluk hidup di darat — manusia, hewan, tumbuhan — bergantung pada bagian kecil itu. Karena itu menghemat air bukan sekadar imbauan, tetapi kebutuhan.'
        ],
        sumberButir: 'NASA; USGS',
        soal: ['b1-q08']
      },

      /* ---------- 14 ---------- */
      {
        id: 'b1-b14',
        judul: 'Ringkasan: di mana air berada',
        materi: [
          'Mari ulangi sekali. Permukaan Bumi **71%** tertutup air, dan **96,5%** air Bumi adalah air asin. Air tawar hanya sekitar **3%**.',
          'Dari air tawar itu: **68%** es di kutub, **30%** air tanah, dan kurang dari **2%** di sungai, danau, serta udara. Jumlahnya kira-kira tetap karena air berputar dalam **siklus air**.'
        ],
        sumberButir: 'NASA; USGS',
        soal: ['b1-q14', 'b1-q06']
      },

      /* ---------- 15 — POST-TEST ---------- */
      {
        id: 'b1-b15',
        judul: 'Post-test Bab 1',
        postTest: true,
        materi: [
          'Ini butir terakhir Bab 1. Kerjakan soal ujian bab untuk melihat pemahamanmu, lalu selesaikan tugas proyek di bawahnya.'
        ],
        soal: ['b1-q01', 'b1-q02', 'b1-q03', 'b1-q04', 'b1-q05', 'b1-q06', 'b1-q07', 'b1-q08', 'b1-q09'],
        tugas: 'PT1',
        sumberButir: 'Seluruh materi Bab 1'
      }
    ]
  };
})();