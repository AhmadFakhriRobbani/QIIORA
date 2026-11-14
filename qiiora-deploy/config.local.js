/* ============================================================
   QIIORA — Konfigurasi Supabase (AKTIF)

   Berkas ini berisi ALAMAT dan KUNCI PUBLIK proyek Supabase.
   Aman diunggah ke GitHub Pages karena:
     - Hanya memakai kunci `publishable` / anon. Kunci ini memang
       dirancang untuk ada di sisi klien.
     - Keamanan data dijaga oleh RLS di database (28 policy),
       bukan oleh kerahasiaan kunci ini.
     - Kunci `service_role` TIDAK boleh ada di sini. Jangan pernah
       menambahkannya.
   ============================================================ */
window.QIIORA_CONFIG = {
  SUPABASE_URL: 'https://jzbtqucngaatqffkqpcv.supabase.co',

  // publishable key (bukan service_role)
  SUPABASE_ANON_KEY: 'sb_publishable_LMjSHRa4okgc8mj8y_3_Xw_0eIzMDMB',

  // true = data juga dikirim ke Supabase saat pengguna login.
  // false = sepenuhnya lokal (localStorage), untuk lab tanpa internet.
  AKTIFKAN_SUPABASE: true
};