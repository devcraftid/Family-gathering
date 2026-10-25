FAMILY GATHERING KP WARINGIN — STRUKTUR FILE & DOKUMENTASI

Struktur File Proyek:
├── index.html          -> Halaman Publik (Landing page, hero, denah & booking, absensi, rundown)
├── admin.html          -> Halaman Admin (Login autentikasi admin & full management dashboard)
├── vercel.json         -> Routing & rewrites untuk deployment Vercel
├── css/
│   ├── base.css        -> Tokens, reset, typography, buttons, cards, forms, tables, toast
│   ├── public.css      -> Styling halaman publik, hero, denah kursi 59 seat, public booking
│   ├── admin.css       -> Styling admin topbar, sidebar, dashboard grid, scanner, status
│   ├── bottom-nav.css  -> Bottom navigation bar mobile (4 menu) & drawer sheet "Lainnya"
│   └── icons.css       -> Styling badge & micro-interaction icon modern
├── js/
│   ├── config.js       -> Inisialisasi Supabase, layout kursi 59 seat, utility functions
│   ├── icons.js        -> Library icon SVG modern (Lucide-style vector icons)
│   ├── public.js       -> Logic halaman publik (booking, search, absensi mandiri, rundown)
│   ├── admin.js        -> Logic halaman admin (auth, peserta CRUD, sesi absensi, backup)
│   └── bottom-nav.js   -> Controller navigasi bawah mobile & drawer sheet semua menu
└── img/
    ├── banner-kawah-putih.jpg -> Foto banner utama Kawah Putih
    ├── highlight-*.jpg        -> Foto highlight informasi acara
    ├── feature-*.jpg          -> Foto kartu fitur layanan
    └── meta-*.jpg             -> Foto metadata gathering

Navigasi Mobile Bottom Bar:
- Terdapat 4 menu utama di bagian bawah layar HP:
  1. Beranda (Keterangan: Utama)
  2. Kursi Bus (Keterangan: Booking)
  3. Absensi (Keterangan: Kehadiran)
  4. Lainnya (Keterangan: Semua Menu)
- Menu "Lainnya" membuka bottom sheet drawer modal interaktif yang menampilkan SEMUA menu acara lengkap beserta icon modern dan deskripsi/keterangan fungsi masing-masing menu.
