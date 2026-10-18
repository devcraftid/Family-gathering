FAMILY GATHERING KP WARINGIN — FULL UPDATE

Konteks acara:
- Holiday gathering privat satu hari untuk rombongan KP Waringin.
- Bus disewa khusus oleh rombongan, bukan layanan tiket publik.
- Tidak ada fitur tiket dan tidak memakai logo gambar.

Navigasi:
- Landing page publik tampil pertama kali tanpa login.
- Tombol Login Admin membuka form login.
- Login berhasil membawa admin ke dashboard.
- Logout mengembalikan pengguna ke landing page publik.
- Navigasi halaman tanpa reload.

Denah bus:
- Layout kursi per baris: 2 kursi kiri + lorong + 3 kursi kanan.
- Status warna: hijau terisi, merah kosong, kuning pencarian, biru dipilih.
- Kursi belakang mengikuti susunan rear 59–54 yang sudah tersedia.

Pemasangan:
1. Ekstrak ZIP dan pertahankan folder img.
2. Jalankan index.html melalui localhost/hosting HTTPS.
3. Pastikan Supabase URL dan publishable key pada konfigurasi kode sudah benar.
4. Admin harus memiliki app_metadata.role = admin.
5. Uji login, logout, booking kursi, absensi QR, dan policy RLS pada project Supabase aktif.
