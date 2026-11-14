/* ============================================================
   QIIORA — Data Bab 2: Wujud Air
   15 butir: 1–14 materi singkat + soal latihan, 15 = post-test.

   SUMBER:
   - Buku Siswa IPAS Kelas V, Kemendikdasmen RI — materi zat dan
     perubahannya.
   - Kemendikdasmen (cdn.murid.kemendikdasmen.go.id) — artikel
     "Kalor dan Perubahan Wujud Benda": enam perubahan wujud
     (mencair, membeku, menguap, mengembun, menyublim, mengkristal).
   - Titik beku air 0 °C dan titik didih 100 °C pada tekanan udara
     normal (1 atm) — materi suhu dan kalor IPAS.
   ============================================================ */
(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};
  window.QIIORA.bab = window.QIIORA.bab || {};

  window.QIIORA.bab[2] = {
    nomor: 2,
    judul: 'Wujud Air',
    ringkas: 'Padat, cair, dan gas: bagaimana suhu mengubah wujud air.',
    sumber: [
      'Buku Siswa IPAS Kelas V, Kemendikdasmen RI — zat dan perubahannya.',
      'Kemendikdasmen — artikel “Kalor dan Perubahan Wujud Benda”: mencair, membeku, menguap, mengembun, menyublim, mengkristal.',
      'NASA Science — “The Water Cycle”: air berubah wujud dalam siklus air.',
      'BMKG — suhu udara dan proses pengembunan.'
    ],
    butir: [

      /* ---------- 1 ---------- */
      {
        id: 'b2-b01',
        judul: 'Tiga wujud air',
        materi: [
          'Air adalah zat yang bisa berwujud **tiga macam**: **padat** (es), **cair** (air yang kita minum), dan **gas** (uap air).',
          'Wujudnya bergantung pada **suhu**. Pada suhu biasa sekitar 20°C, air berwujud cair. Turunkan suhunya, air membeku. Panaskan sampai 100°C, air mendidih menjadi uap.'
        ],
        sumberButir: 'Buku Siswa IPAS Kelas V',
        soal: ['b2-q01']
      },

      /* ---------- 2 ---------- */
      {
        id: 'b2-b02',
        judul: 'Wujud padat: es',
        materi: [
          'Pada wujud **padat**, partikel air tersusun rapat dan teratur, sehingga bentuknya tetap. Es batu di gelas tetap berbentuk kubus walaupun gelasnya dimiringkan.',
          'Air membeku menjadi es pada suhu **0°C**. Di daerah yang sangat dingin, air di danau bisa membeku di permukaannya, sementara bagian bawahnya tetap cair.'
        ],
        sumberButir: 'Buku Siswa IPAS Kelas V',
        soal: ['b2-q02']
      },

      /* ---------- 3 ---------- */
      {
        id: 'b2-b03',
        judul: 'Wujud cair: air',
        materi: [
          'Pada wujud **cair**, partikel air lebih longgar susunannya dan bisa bergeser. Akibatnya air **mengikuti bentuk wadahnya**, tetapi volumenya tetap.',
          'Air yang dituang dari gelas ke botol akan berbentuk botol. Namun banyaknya tidak berkurang — selama tidak ada yang tumpah atau menguap.'
        ],
        sumberButir: 'Buku Siswa IPAS Kelas V',
        soal: ['b2-q01']
      },

      /* ---------- 4 ---------- */
      {
        id: 'b2-b04',
        judul: 'Wujud gas: uap air',
        materi: [
          'Pada wujud **gas**, partikel air bergerak sangat bebas dan berjauhan. Uap air memenuhi seluruh ruang yang ada dan **tidak terlihat**.',
          'Air berubah menjadi uap pada suhu **100°C** saat mendidih. Tetapi penguapan juga terjadi di bawah 100°C — itulah sebabnya jemuran bisa kering di hari biasa, tanpa dipanaskan sampai mendidih.'
        ],
        salahKaprah: 'Uap air tidak terlihat. Asap putih di atas air mendidih adalah titik air yang sudah mengembun, bukan gasnya.',
        sumberButir: 'Buku Siswa IPAS Kelas V',
        soal: ['b2-q03', 'b2-q09']
      },

      /* ---------- 5 ---------- */
      {
        id: 'b2-b05',
        judul: 'Mencair dan membeku',
        materi: [
          '**Mencair** (melebur) adalah perubahan dari **padat → cair** karena menerima panas. Contoh: es batu yang dibiarkan di tempat hangat berubah menjadi air.',
          '**Membeku** adalah kebalikannya: **cair → padat** karena melepas panas. Contoh: air di dalam freezer berubah menjadi es. Keduanya terjadi pada suhu 0°C untuk air.'
        ],
        sumberButir: 'Kemendikdasmen — Kalor dan Perubahan Wujud Benda',
        soal: ['b2-q04', 'b2-q05']
      },

      /* ---------- 6 ---------- */
      {
        id: 'b2-b06',
        judul: 'Menguap dan mengembun',
        materi: [
          '**Menguap** adalah perubahan **cair → gas** karena menerima panas. Contoh: air jemuran mengering, air laut menguap karena panas Matahari.',
          '**Mengembun** (kondensasi) adalah kebalikannya: **gas → cair** karena melepas panas atau mendingin. Contoh: titik air di luar gelas es, atau kaca jendela berembun saat hujan.'
        ],
        sumberButir: 'Kemendikdasmen; Buku Siswa IPAS Kelas V',
        soal: ['b2-q06', 'b2-q07', 'b2-q12']
      },

      /* ---------- 7 ---------- */
      {
        id: 'b2-b07',
        judul: 'Menyublim dan mengkristal',
        materi: [
          '**Menyublim** adalah perubahan **padat → gas** tanpa menjadi cair lebih dulu. Contoh: kapur barus di lemari lama-lama mengecil dan habis karena berubah menjadi gas.',
          '**Mengkristal** (deposisi) adalah kebalikannya: **gas → padat** langsung. Contoh: embun beku di daun pada pagi yang sangat dingin, atau salju yang terbentuk dari uap air di awan.'
        ],
        sumberButir: 'Kemendikdasmen — Kalor dan Perubahan Wujud Benda',
        soal: ['b2-q08', 'b2-q11']
      },

      /* ---------- 8 ---------- */
      {
        id: 'b2-b08',
        judul: 'Enam perubahan wujud',
        materi: [
          'Ada **enam** perubahan wujud yang perlu kamu kenal: **mencair** (padat→cair), **membeku** (cair→padat), **menguap** (cair→gas), **mengembun** (gas→cair), **menyublim** (padat→gas), dan **mengkristal** (gas→padat).',
          'Perhatikan pola: tiga perubahan "naik" memerlukan **panas**, tiga perubahan "turun" melepaskan **panas**. Itu sebabnya es mencair saat hangat dan air membeku saat dingin.'
        ],
        sumberButir: 'Kemendikdasmen',
        soal: ['b2-q14']
      },

      /* ---------- 9 ---------- */
      {
        id: 'b2-b09',
        judul: 'Panas yang tersembunyi',
        materi: [
          'Saat es mencair, suhunya tetap **0°C** walaupun terus dipanaskan. Panas yang masuk tidak menaikkan suhu, tetapi dipakai untuk **mengubah wujud**.',
          'Hal yang sama terjadi saat air mendidih: suhunya tetap **100°C** selama masih ada air yang berubah menjadi uap. Setelah semua berubah menjadi uap, barulah suhu uap bisa naik lagi.'
        ],
        percobaan: {
          judul: 'Coba sendiri',
          teks: 'Letakkan termometer di dalam gelas berisi es batu yang sedang mencair. Amati: suhunya tetap sekitar 0°C sampai seluruh es habis.'
        },
        sumberButir: 'Buku Siswa IPAS Kelas V',
        soal: ['b2-q15']
      },

      /* ---------- 10 ---------- */
      {
        id: 'b2-b10',
        judul: 'Mengapa es mengapung',
        materi: [
          'Es batu **mengapung** di air, bukan tenggelam. Penyebabnya: ketika air membeku, partikelnya tersusun lebih renggang sehingga **es lebih ringan** daripada air pada volume yang sama.',
          'Karena itu gunung es di laut mengapung, dan permukaan danau membeku lebih dulu daripada dasarnya. Kalau es tenggelam, ikan di danau dingin akan kehilangan tempat hidup.'
        ],
        sumberButir: 'Buku Siswa IPAS Kelas V',
        soal: ['b2-q10']
      },

      /* ---------- 11 ---------- */
      {
        id: 'b2-b11',
        judul: 'Air satu-satunya zat seperti ini',
        materi: [
          'Hampir semua zat menyusut ketika membeku. **Air justru memuai** — volumenya bertambah saat menjadi es, sehingga es lebih ringan.',
          'Sifat istimewa ini penting bagi kehidupan: es mengapung dan menutupi permukaan air, sehingga air di bawahnya tetap cair dan makhluk hidup di dalamnya bisa bertahan saat musim dingin.'
        ],
        fakta: 'Sifat ini disebut anomali air — air berperilaku berbeda dari kebanyakan zat lain.',
        sumberButir: 'Buku Siswa IPAS Kelas V',
        soal: ['b2-q10']
      },

      /* ---------- 12 ---------- */
      {
        id: 'b2-b12',
        judul: 'Perubahan wujud di sekitar kita',
        materi: [
          'Enam perubahan wujud itu ada di rumahmu setiap hari. Es di freezer **membeku**. Es di minuman **mencair**. Air di jemuran **menguap**. Kaca gelas es **berembun**.',
          'Kapur barus di lemari **menyublim**. Embun beku di daun pagi hari **mengkristal**. Kalau kamu perhatikan, sains ada di dapur dan kamar mandi.'
        ],
        sumberButir: 'Kemendikdasmen; Buku Siswa IPAS Kelas V',
        soal: ['b2-q14', 'b2-q05', 'b2-q07']
      },

      /* ---------- 13 ---------- */
      {
        id: 'b2-b13',
        judul: 'Suhu dan wujud: hubungannya',
        materi: [
          'Suhu menentukan wujud air. Di bawah **0°C**: padat. Antara **0°C dan 100°C**: cair. Di atas **100°C**: gas.',
          'Batas itu berlaku pada **tekanan udara normal** (1 atm). Di puncak gunung yang tekanannya lebih rendah, air mendidih di bawah 100°C — karena itu memasak di gunung lebih lama.'
        ],
        sumberButir: 'Buku Siswa IPAS Kelas V',
        soal: ['b2-q02', 'b2-q03', 'b2-q15']
      },

      /* ---------- 14 ---------- */
      {
        id: 'b2-b14',
        judul: 'Ringkasan: wujud air dan perubahannya',
        materi: [
          'Air punya **tiga wujud**: padat (es), cair (air), gas (uap). Ada **enam perubahan wujud**: mencair, membeku, menguap, mengembun, menyublim, mengkristal.',
          'Air membeku pada **0°C** dan mendidih pada **100°C** (tekanan normal). Es **mengapung** karena lebih ringan daripada air. Semua ini menggerakkan siklus air di Bumi.'
        ],
        sumberButir: 'Buku Siswa IPAS Kelas V; Kemendikdasmen',
        soal: ['b2-q13', 'b2-q08', 'b2-q06']
      },

      /* ---------- 15 — POST-TEST ---------- */
      {
        id: 'b2-b15',
        judul: 'Post-test Bab 2',
        postTest: true,
        materi: [
          'Ini butir terakhir Bab 2. Kerjakan soal ujian bab untuk melihat pemahamanmu, lalu selesaikan tugas proyek di bawahnya.'
        ],
        soal: ['b2-q01', 'b2-q02', 'b2-q03', 'b2-q04', 'b2-q05', 'b2-q06', 'b2-q07', 'b2-q08', 'b2-q09'],
        tugas: 'PT2',
        sumberButir: 'Seluruh materi Bab 2'
      }
    ]
  };
})();