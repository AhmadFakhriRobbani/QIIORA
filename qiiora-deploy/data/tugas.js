(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};
  window.QIIORA.tugasList = [
    {
      id: 'PT1',
      bab: 1,
      judul: 'Poster / Infografis "Air di Bumi"',
      format: ['gambar', 'PDF'],
      penamaan: 'NIM_Nama_PT1',
      tujuan: 'Menyajikan data sebaran air di Bumi (laut, es, air tawar) dalam bentuk visual yang menarik dan mudah dipahami.',
      langkah: [
        'Gunakan kertas atau aplikasi desain (Canva/PowerPoint).',
        'Tampilkan diagram persentase sebaran air (97% laut, 3% tawar; rincian es dan air tanah).',
        'Berikan 2-3 kalimat kesimpulan mengapa air tawar sangat berharga.'
      ],
      checklist: [
        'Persentase air laut dan tawar sesuai data NASA (97% : 3%).',
        'Desain rapi dan mudah dibaca.',
        'Sudah diuji di jendela incognito Google Drive.'
      ],
      rubrik: [
        { kriteria: 'Keakuratan Data', level: ['Semua angka akurat', 'Sebagian besar akurat', 'Ada angka keliru', 'Data tidak sesuai'] },
        { kriteria: 'Kerapian & Visual', level: ['Sangat kreatif & rapi', 'Cukup rapi', 'Kurang rapi', 'Tidak lengkap'] }
      ]
    },
    {
      id: 'PT2',
      bab: 2,
      judul: 'Pengamatan Wujud Air & Tabel Perubahan',
      format: ['foto', 'dokumen'],
      penamaan: 'NIM_Nama_PT2',
      tujuan: 'Mengamati secara langsung perubahan wujud air (padat → cair → gas) di rumah atau sekolah.',
      langkah: [
        'Ambil es batu, amati saat mencair menjadi air.',
        'Panaskan air hingga mendidih dan menguap.',
        'Catat waktu dan suhu (jika ada termometer) pada tabel pengamatan.'
      ],
      checklist: [
        'Tabel pengamatan terisi lengkap.',
        'Foto kegiatan dilampirkan.',
        'Penjelasan perubahan wujud tepat.'
      ],
      rubrik: [
        { kriteria: 'Ketepatan Pengamatan', level: ['Pengamatan runtut & benar', 'Cukup runtut', 'Kurang rinci', 'Tidak diamati'] }
      ]
    },
    {
      id: 'PT3',
      bab: 3,
      judul: 'Laporan Percobaan "Hujan Mini"',
      format: ['dokumen', 'foto/video'],
      penamaan: 'NIM_Nama_PT3',
      tujuan: 'Memodelkan siklus air mini menggunakan panci, air panas, dan piring es.',
      langkah: [
        'Ikuti langkah Kegiatan 2 pada LKPD (panci air panas + piring es di atasnya).',
        'Amati terbentuknya titik-titik air (kondensasi) dan jatuhnya tetesan (presipitasi).',
        'Tulis laporan 1 halaman berisi tujuan, alat, hasil pengamatan, dan kesimpulan.'
      ],
      checklist: [
        'Laporan memuat seluruh bagian (tujuan, alat, hasil, kesimpulan).',
        'Kesimpulan menghubungkan percobaan dengan siklus air di alam.'
      ],
      rubrik: [
        { kriteria: 'Analisis Percobaan', level: ['Menghubungkan tepat dengan konsep', 'Cukup sesuai', 'Kurang tepat', 'Tidak relevan'] }
      ]
    },
    {
      id: 'PT4',
      bab: 3,
      judul: 'Diagram Siklus Air Buatan Sendiri',
      format: ['gambar', 'teks'],
      penamaan: 'NIM_Nama_PT4',
      tujuan: 'Menggambar dan menjelaskan 5 tahap siklus air dengan bahasa sendiri.',
      langkah: [
        'Buat diagram siklus air di kertas gambar atau digital.',
        'Beri label 5 tahap: evaporasi, transpirasi, kondensasi, presipitasi, infiltrasi/limpasan.',
        'Tulis paragraf singkat di bawah gambar untuk menjelaskan arah panah.'
      ],
      checklist: [
        'Kelima tahap lengkap dan berurutan benar.',
        'Penjelasan paragraf menggunakan bahasa sendiri.'
      ],
      rubrik: [
        { kriteria: 'Kelengkapan Tahap', level: ['5 tahap lengkap & benar', '4 tahap benar', '3 tahap benar', '<3 tahap'] }
      ]
    },
    {
      id: 'PT5',
      bab: 6,
      judul: 'Studi Kasus: Banjir atau Kekeringan',
      format: ['dokumen'],
      penamaan: 'NIM_Nama_PT5',
      tujuan: 'Menganalisis penyebab dan dampak bencana terkait air di lingkungan sekitar.',
      langkah: [
        'Pilih satu topik: banjir lokal atau kekeringan musim kemarau.',
        'Cari informasi penyebab utamanya (mis. alih fungsi lahan, sampah, curah hujan ekstrem).',
        'Tulis 1 halaman analisis beserta 2 saran solusi pencegahan.'
      ],
      checklist: [
        'Penyebab dianalisis secara logis.',
        'Solusi yang diusulkan aplikatif.'
      ],
      rubrik: [
        { kriteria: 'Kedalaman Analisis', level: ['Analisis mendalam & solutif', 'Cukup baik', 'Terlalu singkat', 'Tidak ada analisis'] }
      ]
    },
    {
      id: 'PT6',
      bab: 7,
      judul: 'Rancangan Biopori / Panen Hujan',
      format: ['gambar', 'dokumen'],
      penamaan: 'NIM_Nama_PT6',
      tujuan: 'Merancang lubang biopori atau sistem penampungan air hujan rumah tangga.',
      langkah: [
        'Buat sketsa penampang pembuatan lubang biopori atau tandon air hujan.',
        'Hitung estimasi tampungan air jika luas atap 30 m² dan curah hujan 50 mm.',
        'Tulis panduan singkat cara merawatnya.'
      ],
      checklist: [
        'Sketsa jelas.',
        'Perhitungan volume air benar (1 mm di 1 m² = 1 liter).'
      ],
      rubrik: [
        { kriteria: 'Ketepatan Hitungan', level: ['Hitungan tepat & logis', 'Ada kesalahan kecil', 'Hitungan keliru', 'Tidak dihitung'] }
      ]
    },
    {
      id: 'PT7',
      bab: 7,
      judul: 'Audit Pemakaian Air Rumah Tangga',
      format: ['tabel', 'refleksi'],
      penamaan: 'NIM_Nama_PT7',
      tujuan: 'Menghitung dan mengevaluasi penggunaan air bersih di rumah selama 3 hari.',
      langkah: [
        'Catat kegiatan penggunaan air (mandi, cuci, masak, siram tanaman).',
        'Identifikasi kegiatan mana yang paling boros.',
        'Buat komitmen 3 langkah penghematan.'
      ],
      checklist: [
        'Catatan 3 hari terisi.',
        'Komitmen penghematan realistis.'
      ],
      rubrik: [
        { kriteria: 'Refleksi & Aksi', level: ['Refleksi nyata & komitmen jelas', 'Cukup baik', 'Kurang rinci', 'Tidak ada refleksi'] }
      ]
    },
    {
      id: 'PT8',
      bab: 8,
      judul: 'Jurnal Belajar Kumulatif',
      format: ['PDF'],
      penamaan: 'NIM_Nama_PT8',
      tujuan: 'Mengumpulkan seluruh rekap jurnal belajar dari Bab 1 sampai Bab 8.',
      langkah: [
        'Ekspor jurnal belajar dari aplikasi QIIORA.',
        'Periksa kembali kelengkapan catatan tiap sesi.',
        'Simpan sebagai PDF dan unggah.'
      ],
      checklist: [
        'Semua bab tercakup.',
        'Format PDF rapi.'
      ],
      rubrik: [
        { kriteria: 'Kelengkapan Jurnal', level: ['Lengkap 8 bab', '6-7 bab', '<6 bab', 'Tidak lengkap'] }
      ]
    },
    {
      id: 'PT9',
      bab: 8,
      judul: 'Video Penjelasan 2 Menit "Aku Menjelaskan Siklus Air"',
      format: ['video'],
      penamaan: 'NIM_Nama_PT9',
      tujuan: 'Berkomunikasi lisan menjelaskan siklus air secara ringkas dan komunikatif.',
      langkah: [
        'Rekam video berdurasi maksimal 2 menit.',
        'Gunakan alat peraga sederhana (gambar/botol/model) saat menjelaskan.',
        'Unggah ke Drive dan pastikan tautan dapat diakses publik.'
      ],
      checklist: [
        'Durasi ≤ 2 menit.',
        'Suara jelas dan penjelasan runtut.'
      ],
      rubrik: [
        { kriteria: 'Komunikasi Lisan', level: ['Sangat komunikatif & runtut', 'Cukup jelas', 'Kurang lancar', 'Tidak sesuai'] }
      ]
    },
    {
      id: 'PT10',
      bab: 8,
      judul: 'Proyek Aksi Air (Capstone)',
      format: ['folder Drive'],
      penamaan: 'NIM_Nama_PT10',
      tujuan: 'Melakukan aksi nyata menjaga air di sekolah/rumah (kampanye, pembuatan biopori, atau pembersihan saluran).',
      langkah: [
        'Buat folder khusus di Google Drive berisi: proposal singkat, foto kegiatan, dan laporan hasil.',
        'Bagikan tautan folder tersebut.'
      ],
      checklist: [
        'Folder Drive berisi dokumen dan foto aksi.',
        'Aksi benar-benar dilaksanakan.'
      ],
      rubrik: [
        { kriteria: 'Kualitas Aksi', level: ['Aksi nyata berdampak positif', 'Cukup baik', 'Kurang terencana', 'Tidak ada bukti aksi'] }
      ]
    },
    {
      id: 'PT11',
      bab: 8,
      judul: 'Refleksi Akhir & Retrospektif',
      format: ['dokumen'],
      penamaan: 'NIM_Nama_PT11',
      tujuan: 'Melakukan refleksi menyeluruh atas proses belajar modul QIIORA.',
      langkah: [
        'Jawab 3 pertanyaan retrospektif: apa yang berubah dalam pemahamanku, hal apa yang paling berkesan, dan rencana tindak lanjut ke depan.'
      ],
      checklist: [
        'Tiga pertanyaan dijawab tuntas.'
      ],
      rubrik: [
        { kriteria: 'Refleksi Diri', level: ['Refleksi sangat mendalam', 'Cukup mendalam', 'Singkat', 'Tidak dikerjakan'] }
      ]
    },
    {
      id: 'PT12',
      bab: 4,
      judul: 'Jurnal Pengamatan Awan & Curah Hujan',
      format: ['foto', 'dokumen'],
      penamaan: 'NIM_Nama_PT12',
      tujuan: 'Mengamati jenis awan dan mengukur curah hujan selama beberapa hari, lalu menghubungkan keduanya.',
      langkah: [
        'Amati langit setiap pagi dan sore selama 5 hari. Catat jenis awan yang dominan: sirus, kumulus, stratus, atau kumulonimbus.',
        'Buat penakar hujan sederhana dari botol plastik bekas yang mulutnya dipotong dan diberi penggaris. Letakkan di tempat terbuka.',
        'Catat tinggi air hujan setiap pagi pada jam yang sama, dalam satuan milimeter.',
        'Bandingkan: pada hari dengan awan apa hujan paling banyak turun?'
      ],
      checklist: [
        'Tabel pengamatan 5 hari terisi lengkap (tanggal, jenis awan, curah hujan mm).',
        'Foto penakar hujan sederhana dilampirkan.',
        'Ada kesimpulan yang menghubungkan jenis awan dengan curah hujan.',
        'Tidak memotret wajah orang lain tanpa izin.'
      ],
      rubrik: [
        { kriteria: 'Ketepatan Pengamatan', level: ['Data 5 hari lengkap & runtut', 'Data 4 hari lengkap', 'Data kurang dari 4 hari', 'Tidak ada data'] },
        { kriteria: 'Ketepatan Klasifikasi Awan', level: ['Semua awan terklasifikasi benar', 'Sebagian besar benar', 'Banyak kekeliruan', 'Tidak diklasifikasi'] },
        { kriteria: 'Kesimpulan', level: ['Kesimpulan didukung data', 'Kesimpulan cukup didukung', 'Kesimpulan tidak berdasar data', 'Tidak ada kesimpulan'] }
      ]
    }
    ,
    {
      id: 'PT13',
      bab: 5,
      judul: 'Peta Perjalanan Air di Lingkungan Sekitar',
      format: ['dokumen', 'foto'],
      penamaan: 'NIM_Nama_PT13',
      tujuan: 'Memetakan perjalanan air dari tempat tinggal sampai sungai terdekat, dan menilai apakah resapan air di lingkungan itu baik atau buruk.',
      langkah: [
        'Gambar sketsa sederhana lingkungan rumahmu: atap, halaman, selokan, dan sungai terdekat.',
        'Tandai dengan panah: air hujan dari atap ke mana, dan air di halaman meresap atau mengalir.',
        'Periksa apakah ada sumur resapan, biopori, atau permukaan yang tertutup beton.',
        'Tulis 3 saran perbaikan agar air lebih banyak meresap ke tanah di lingkunganmu.'
      ],
      checklist: [
        'Sketsa menunjukkan alur air dari rumah sampai sungai.',
        'Ada tanda jelas bagian yang meresap dan yang mengalir di permukaan.',
        'Tiga saran perbaikan masuk akal dan bisa dilakukan.',
        'Foto lingkungan (tanpa wajah orang lain) dilampirkan.'
      ],
      rubrik: [
        { kriteria: 'Kelengkapan Sketsa', level: ['Sangat lengkap & jelas', 'Cukup lengkap', 'Banyak bagian hilang', 'Tidak ada sketsa'] },
        { kriteria: 'Ketepatan Analisis Resapan', level: ['Analisis tepat & beralasan', 'Cukup tepat', 'Kurang tepat', 'Tidak ada analisis'] },
        { kriteria: 'Saran Perbaikan', level: ['Tiga saran aplikatif', 'Dua saran aplikatif', 'Satu saran', 'Tidak ada saran'] }
      ]
    }
  ];
})();
