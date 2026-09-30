# Kasbon - Web App Pencatatan Utang Piutang Pribadi

Aplikasi web sederhana untuk melacak utang-piutang pribadi (siapa hutang berapa ke kita, atau kita hutang berapa ke siapa), dilengkapi tombol tandai "lunas", kalkulasi selisih saldo (*net*), dan proteksi multi-tenant database dengan **PostgreSQL Row Level Security (RLS)** via **Supabase**.

---

## 🚀 Demo & Deployment

- **Link Vercel Deploy (Live Demo):** [https://kasbon-app-gamma.vercel.app](https://kasbon-app-gamma.vercel.app)
- **Repository GitHub:** [https://github.com/andrianarzki/kasbon-app](https://github.com/andrianarzki/kasbon-app)

---

## 🛠️ Stack Teknologi (Wajib)

- **Framework:** Next.js 16 App Router + TypeScript (Strict, minimal `any`)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`)
- **Backend & Database:** Supabase (PostgreSQL + Supabase Auth + RLS Policies)
- **Icons:** Lucide React
- **Pustaka Tambahan & Alasan Penggunaan:**
  - `canvas-confetti`: Memberikan efek visual konfeti yang memuaskan dan menyenangkan saat pengguna menandai utang/piutang sebagai lunas.
  - `clsx` & `tailwind-merge`: Mengelola penggabungan class CSS kondisional secara aman.

---

## ⚙️ Panduan Setup & Menjalankan Lokal

### 1. Kloning Repository & Install Dependensi
```bash
git clone https://github.com/andrianarzki/kasbon-app.git
cd kasbon-app
npm install
```

### 2. Konfigurasi Environment Variables
Salin file template environment:
```bash
cp .env.example .env.local
```
Lalu buka `.env.local` dan isi kredensial dari project Supabase kamu:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-name].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
```

### 3. Cara Menjalankan Migrasi Database
1. Buka dashboard [Supabase](https://supabase.com) > Pilih project kamu > Masuk ke menu **SQL Editor**.
2. Buka file `supabase/migrations/20240101000000_create_debts.sql` di repository ini.
3. Tempelkan seluruh isi kodenya ke SQL Editor Supabase, lalu klik **Run**.
4. Tabel `debts` berserta Enum `debt_type`, indeks, dan 4 aturan ketat **Row Level Security (RLS)** akan aktif secara instan.

### 4. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka peramban di [http://localhost:3000](http://localhost:3000).

### 5. Memeriksa Tipe & Build Produksi
```bash
# Validasi TypeScript
npx tsc --noEmit

# Validasi Build Next.js
npm run build
```

---

## 💡 Technical Approach (Keputusan Teknis yang Dibanggakan)

Keputusan teknis yang paling saya banggakan dalam proyek ini adalah penerapan arsitektur keamanan berlapis yang berpusat pada **PostgreSQL Row Level Security (RLS)** dengan kebijakan ketat `auth.uid() = user_id`. Keamanan data tidak hanya diproteksi pada tataran aplikasi Next.js (melalui Route Handler `/api/debts` dan Middleware session guard), melainkan diisolasi secara deterministik di level database engine Postgres. Alhasil, bahkan jika pengguna mengeksekusi panggilan REST API Supabase langsung menggunakan `anon_key` publik via cURL, database engine secara otomatis menolak dan mengembalikan array kosong (`[]`), sehingga menjamin nol persen (0%) kebocoran data antar pengguna. Selain itu, sinkronisasi status "Tandai Lunas" dirancang sepenuhnya *idempotent* dan persisten ke database, menghilangkan risiko status hilang saat browser di-refresh.

---

## ⚖️ Trade-off (Kalau Ada 1 Hari Lagi, Apa yang Dipolish?)

Jika diberikan waktu 1 hari tambahan, area yang ingin saya poles lebih lanjut meliputi:
1. **Otomatisasi Notifikasi WhatsApp Terjadwal (Cron Job):** Mengintegrasikan WhatsApp Cloud API atau penyedia SMS gateway untuk otomatis mengirim pesan santun (seperti template pesan WA santun yang sudah kami siapkan di tombol kartu) H-1 sebelum tanggal jatuh tempo tiba.
2. **Pencatatan Cicilan Parsial (Partial Payment):** Menambahkan relasi tabel `debt_installments` agar satu kasbon bisa dicicil bertahap (misal pinjam Rp 1.000.000, dicicil 2x Rp 500.000) lengkap dengan riwayat log pembayarannya.
3. **Automated End-to-End Testing (Playwright / Vitest):** Mengimplementasikan pipeline pengujian otomatis untuk memverifikasi isolasi multi-tenant, simulasi kebocoran RLS via HTTP mock, dan idempotensi API toggle secara berkelanjutan di CI/CD.

---

## ⏱️ Time Spent (Jujur)

- **Total Waktu Pengerjaan:** ~5.5 Jam
  - **30 Menit:** Mempelajari brief, merancang skema relasional tabel `debts`, enum, dan kebijakan RLS Postgres.
  - **1 Jam:** Pembangunan arsitektur Next.js 16 App Router & konfigurasi Tailwind CSS v4.
  - **1.5 Jam:** Membangun seluruh 4 API route handlers (`GET`, `POST`, `PATCH`, `DELETE`) beserta validasi server dan respon error Bahasa Indonesia.
  - **1.5 Jam:** Membangun antarmuka dashboard, 3 kartu ringkasan kalkulasi otomatis, form modal interaktif dengan format Rupiah `id-ID` terpadu, modal konfirmasi, filter, sorting, grouping catatan per orang, dan generator pengingat WhatsApp santun.
  - **1 Jam:** Pengujian anti-bocor RLS dengan cURL, validasi build produksi Next.js, penulisan dokumentasi README.

---

## 📋 Fitur yang Tersedia

### Fitur Wajib (Deliverables)
- ✅ **Autentikasi Supabase:** Signup & login email + password, modal konfirmasi logout, serta proteksi rute aplikasi khusus user terautentikasi.
- ✅ **Dashboard Ringkasan (3 Card):**
  - "Total dihutang ke saya" (`Rp X`)
  - "Total saya hutang" (`Rp Y`)
  - "Net" (`X - Y`, warna dinamis hijau jika surplus dan merah jika defisit)
- ✅ **Daftar Catatan Kasbon:**
  - Nama orang, tipe (dihutang / saya hutang), nominal format `Rp 1.234.000` (locale `id-ID`), tanggal relatif ("3 hari lalu", "kemarin"), status (Belum Lunas / Lunas).
  - Tombol aksi: "Tandai lunas" (toggle idempotent persisten ke DB), "Edit", "Hapus".
- ✅ **Filter Fleksibel & Responsive:** Grid filter yang rapi di HP (Status, Tipe, Urutan, Grouping).
- ✅ **Form Catat Baru / Edit:**
  - Radio tipe kasbon (Saya dihutang / Saya hutang), nama orang (wajib), nominal rupiah (wajib), tanggal (default hari ini), catatan opsional (maks 200 karakter).
  - Validasi menyeluruh di sisi client dan server, dilengkapi konfirmasi password saat daftar baru.
- ✅ **API Endpoints Standar:**
  - `GET /api/debts?status=&type=`
  - `POST /api/debts`
  - `PATCH /api/debts/[id]`
  - `DELETE /api/debts/[id]`
- ✅ **Database & Migrasi SQL:** Tabel `debts` di folder `supabase/migrations/` dengan RLS anti-bocor.

### Fitur Bonus (Signal Niat & Taste)
- 🌟 **Pencarian Nama:** Cari catatan berdasarkan nama orang atau isi catatan.
- 🌟 **Pengurutan Fleksibel (Sort):** Berdasarkan tanggal terbaru/terlama dan nominal terbesar/terkecil.
- 🌟 **Grouping per Orang:** Mengelompokkan riwayat kasbon dari nama orang yang sama (misal: *"Budi: 3 catatan, total Rp X (Net: Rp Y)"*).
- 🌟 **Bar Chart Komparasi:** Grafik perbandingan rasio total dihutang vs total saya hutang.
- 🌟 **Empty & Loading States:** Dilengkapi komponen skeleton loading dan ilustrasi saat belum ada data.
- 🌟 **Pengingat WhatsApp Santun:** Tombol salin pesan otomatis dengan redaksi santun khas Indonesia.
- 🌟 **Mobile-First Responsive:** Tampilan 1 tombol "Catat Baru" utama dan grid filter simetris di smartphone maupun desktop.
