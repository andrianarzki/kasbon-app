# 📘 PANDUAN LENGKAP & WALKTHROUGH KASBON
### Berdasarkan Dokumen Spesifikasi: `Hiring Task - Junior Fullstack Developer (Kasbon)`

Dokumen ini disusun sebagai panduan menyeluruh mengenai arsitektur, audit kekurangan dari template sebelumnya, langkah integrasi **Supabase dari awal sampai selesai**, pengujian keamanan **Row Level Security (RLS)**, hingga persiapan submission (Vercel & video Loom).

---

## 📑 DAFTAR ISI
1. [Audit & Evaluasi: Kekurangan Template Awal vs Hiring Task](#1-audit--evaluasi-kekurangan-template-awal-vs-hiring-task)
2. [Arsitektur Baru & Struktur File Proyek](#2-arsitektur-baru--struktur-file-proyek)
3. [Panduan Integrasi Supabase Sampai Selesai (0 - 100%)](#3-panduan-integrasi-supabase-sampai-selesai-0---100)
4. [Pengujian Anti-Kebocoran RLS (Curl / REST API Test)](#4-pengujian-anti-kebocoran-rls-curl--rest-api-test)
5. [Spesifikasi & Cara Kerja API Endpoints](#5-spesifikasi--cara-kerja-api-endpoints)
6. [Panduan Menjalankan Lokal & Deploy ke Vercel](#6-panduan-menjalankan-lokal--deploy-ke-vercel)
7. [Script & Panduan Video Loom 3 Menit (High-Score Rubric)](#7-script--panduan-video-loom-3-menit-high-score-rubric)

---

## 1. Audit & Evaluasi: Kekurangan Template Awal vs Hiring Task

Sebelum dilakukan perombakan, codebase awal memiliki sejumlah ketidaksesuaian fatal dengan spesifikasi `hiring-task-kasbon.pdf` yang berpotensi memicu **Auto-Reject**:

| Komponen / Kriteria | Kondisi Awal Proyek | Syarat Wajib di PDF | Risiko / Status Perbaikan |
|---|---|---|---|
| **Framework Utama** | Menggunakan **Vite + React SPA** standar | **Next.js 16 App Router + TypeScript** | ❌ **Risiko Auto-Reject**: Ditolak karena bukan Next.js App Router.<br>✅ **Solusi**: Dimigrasikan penuh ke Next.js App Router dengan folder `src/app/`, Server Routes, dan Client Components. |
| **API Endpoints** | Tidak ada API route handler (hanya simulasi client-side) | Wajib menyediakan: `GET /api/debts`, `POST /api/debts`, `PATCH /api/debts/[id]`, `DELETE /api/debts/[id]` | ❌ **Risiko Auto-Reject**: Nilai Backend 0%.<br>✅ **Solusi**: Dibuat 4 route handler di `src/app/api/debts/` dengan validasi server, proteksi auth, dan respon Bahasa Indonesia. |
| **Tabel Database** | Tabel bernama `kasbon_transactions` dengan tipe `'piutang'/'utang'` | Tabel bernama **`debts`** dengan enum `debt_type ('owed_to_me', 'i_owe')`, `counterpart_name`, `amount bigint`, `settled_at timestamptz` | ❌ **Inkonsisten**: Skema tidak sesuai brief reviewer.<br>✅ **Solusi**: Dibuatkan file migrasi resmi `supabase/migrations/20240101000000_create_debts.sql`. |
| **Penyimpanan Data** | Menggunakan `localStorage` (mock data semu) | **"Jangan hardcode data - semua dari Supabase"** & "'Tandai lunas' cuma di client (refresh -> status balik) = Auto-Reject" | ❌ **Risiko Auto-Reject Fatal**.<br>✅ **Solusi**: Menggunakan Supabase Database & Auth asli via `@supabase/ssr` dan REST API endpoints. |
| **Format Mata Uang** | Beberapa komponen memakai format tidak konsisten | Wajib **locale id-ID**: `Rp 1.234.000` (Bukan `Rp 1234000` atau `IDR 1,234,000`) | ✅ **Solusi**: Dibuatkan fungsi utilitas terpusat `formatRupiah()` dengan separator titik lokal Indonesia. |
| **Format Tanggal** | Menampilkan tanggal ISO biasa | Wajib **relative time** (`"3 hari lalu"`, `"kemarin"`, `"hari ini"`) | ✅ **Solusi**: Dibuatkan fungsi terpusat `formatRelativeTime()`. |
| **Fitur Bonus** | Belum terintegrasi utuh | Pencarian nama, urutan nominal/tanggal, pengelompokan per orang, bar chart perbandingan, mobile-first | ✅ **Solusi**: Semua fitur bonus diimplementasikan penuh. |

---

## 2. Arsitektur Baru & Struktur File Proyek

```
kasbon---fintech-kasbon-sosial/
├── .env.example                               # Contoh konfigurasi kredensial Supabase
├── .env.local                                 # File env lokal (berisi URL & Anon Key kamu)
├── next.config.mjs                            # Konfigurasi Next.js
├── postcss.config.mjs                         # Integrasi Tailwind CSS v4 dengan PostCSS
├── tsconfig.json                              # Konfigurasi TypeScript strict Next.js App Router
├── package.json                               # Dependensi (Next.js, React 19, @supabase/ssr, Lucide)
├── README.md                                  # Dokumentasi submission sesuai rubrik
├── WALKTHROUGH.md                             # Panduan teknis & integrasi ini
│
├── supabase/
│   ├── migrations/
│   │   └── 20240101000000_create_debts.sql    # File migrasi SQL resmi (Tabel debts, RLS, Indexes, Triggers)
│   └── schema.sql                             # Salinan referensi cepat skema database
│
└── src/
    ├── middleware.ts                          # Next.js middleware (Auth route protection & session refresh)
    ├── app/
    │   ├── globals.css                        # Styling Tailwind v4 (@import "tailwindcss") & font setup
    │   ├── layout.tsx                         # Root Layout dengan Google Font Plus Jakarta Sans & Metadata
    │   ├── page.tsx                           # Halaman Dashboard Utama (Summary cards, list, filters, modal)
    │   ├── login/
    │   │   └── page.tsx                       # Halaman Auth (Signup & Login email/password Supabase)
    │   ├── auth/
    │   │   └── callback/
    │   │       └── route.ts                   # Route handler untuk verifikasi session callback
    │   └── api/
    │       └── debts/
    │           ├── route.ts                   # GET /api/debts (filter status & type) & POST /api/debts
    │           └── [id]/
    │               └── route.ts               # PATCH /api/debts/[id] & DELETE /api/debts/[id]
    ├── components/
    │   ├── Navbar.tsx                         # Header, logo, info user, status RLS, dan logout
    │   ├── SummaryCards.tsx                   # 3 Card: Total dihutang ke saya, Total saya hutang, Net (hijau/merah)
    │   ├── ComparisonChart.tsx                # Bonus: Bar chart komparasi rasio dihutang vs hutang
    │   ├── DebtFilters.tsx                    # Filter dropdown status & tipe, search, sort, dan grouping toggle
    │   ├── DebtList.tsx                       # Container daftar catatan (mode biasa & mode grouped per orang)
    │   ├── DebtItem.tsx                       # Card catatan (Rp 1.234.000, relative date, aksi lunas, edit, hapus, WA)
    │   ├── DebtFormModal.tsx                  # Modal Catat Baru / Edit (tipe radio, amount, tanggal, note max 200)
    │   ├── DeleteConfirmModal.tsx             # Modal konfirmasi hapus data aman
    │   └── LoadingSkeleton.tsx                # Komponen skeleton loading halus
    ├── lib/
    │   ├── formatters.ts                      # Helper formatRupiah, formatRelativeTime, pesan WhatsApp santun
    │   ├── validations.ts                     # Validasi input client & server (error bahasa Indonesia)
    │   └── supabase/
    │       ├── client.ts                      # Client browser Supabase (@supabase/ssr)
    │       ├── server.ts                      # Client server Supabase (@supabase/ssr dengan next/headers cookies)
    │       └── middleware.ts                  # Session guard helper
    └── types/
        └── database.ts                        # Type definitions strict TypeScript (tanpa any)
```

---

## 3. Panduan Integrasi Supabase Sampai Selesai (0 - 100%)

Ikuti 5 langkah mudah berikut untuk menghubungkan Supabase dengan aplikasi Kasbon:

### Langkah 1: Buat Project Baru di Supabase
1. Buka [https://supabase.com](https://supabase.com) dan masuk menggunakan akun GitHub kamu.
2. Klik tombol **New Project**.
3. Masukkan:
   - **Name**: `kasbon-app` (atau nama pilihanmu)
   - **Database Password**: Buat password yang kuat dan simpan di tempat aman.
   - **Region**: Pilih yang terdekat (misal: *Singapore - ap-southeast-1*).
   - **Pricing Plan**: Pilih **Free Plan**.
4. Klik **Create new project** dan tunggu 1-2 menit hingga status database siap (*Healthy*).

---

### Langkah 2: Jalankan Migrasi Database di SQL Editor
1. Di dashboard Supabase kamu, klik ikon **SQL Editor** pada bilah menu sebelah kiri (ikon terminal `>_`).
2. Klik **New Query**.
3. Buka file di repository lokal kamu:
   ```
   supabase/migrations/20240101000000_create_debts.sql
   ```
4. Salin seluruh isi SQL berikut dan tempelkan ke SQL Editor Supabase:

```sql
-- 1. Create Enum type for debt direction
DO $$ BEGIN
  CREATE TYPE debt_type AS ENUM ('owed_to_me', 'i_owe');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create debts table
CREATE TABLE IF NOT EXISTS public.debts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type debt_type NOT NULL,
  counterpart_name TEXT NOT NULL,
  amount BIGINT NOT NULL CHECK (amount > 0),
  note TEXT CHECK (char_length(note) <= 200),
  due_date DATE,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS) - Mandatory
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if any
DROP POLICY IF EXISTS "Users can only select their own debts" ON public.debts;
DROP POLICY IF EXISTS "Users can only insert their own debts" ON public.debts;
DROP POLICY IF EXISTS "Users can only update their own debts" ON public.debts;
DROP POLICY IF EXISTS "Users can only delete their own debts" ON public.debts;

-- 5. Strict RLS Policies (User cuma bisa akses data miliknya sendiri)
CREATE POLICY "Users can only select their own debts"
  ON public.debts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own debts"
  ON public.debts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own debts"
  ON public.debts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own debts"
  ON public.debts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 6. Performance & Search Indexes
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON public.debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_user_status ON public.debts(user_id, settled_at);
CREATE INDEX IF NOT EXISTS idx_debts_user_type ON public.debts(user_id, type);
CREATE INDEX IF NOT EXISTS idx_debts_counterpart ON public.debts(user_id, counterpart_name);
CREATE INDEX IF NOT EXISTS idx_debts_due_date ON public.debts(user_id, due_date);

-- 7. Automatic updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_debt_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_debt_updated ON public.debts;
CREATE TRIGGER on_debt_updated
  BEFORE UPDATE ON public.debts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_debt_updated_at();
```
5. Klik tombol **Run** (atau tekan `Ctrl + Enter`).
6. Muncul pesan sukses: `Success. No rows returned`. Tabel `debts` dan kebijakan RLS telah aktif!

---

### Langkah 3: Ambil Kunci Kredensial Supabase
1. Masuk ke menu **Project Settings** (ikon gerigi di sudut kiri bawah).
2. Pilih submenu **API**.
3. Di bagian **Project API keys**, salin:
   - **Project URL** (contoh: `https://jldafbbpuallfreftbcd.supabase.co`)
   - **anon public key** (contoh: `eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp...`)

---

### Langkah 4: Konfigurasi File Environment Lokal
Buat file bernama `.env.local` di folder root proyek (atau duplikasi dari `.env.example`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://jldafbbpuallfreftbcd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp...
```

---

### Langkah 5: Konfigurasi Supabase Auth & Redirect URL
1. Masuk ke dashboard Supabase > **Authentication** > **URL Configuration**.
2. Di bagian **Site URL**, masukkan:
   - Lokal: `http://localhost:3000`
   - Production Vercel: `https://nama-aplikasi-kamu.vercel.app`
3. Di bagian **Redirect URLs**, tambahkan:
   - `http://localhost:3000/auth/callback`
   - `https://nama-aplikasi-kamu.vercel.app/auth/callback`
4. *(Opsional untuk pengujian instan)*: Masuk ke **Authentication** > **Providers** > **Email**, jika ingin menonaktifkan konfirmasi email agar akun bisa langsung login setelah mendaftar, matikan opsi **Confirm email**.

---

## 4. Pengujian Anti-Kebocoran RLS (Curl / REST API Test)

Rubrik halaman 2 dan kriteria Auto-Reject halaman 4 menyebutkan:
> *"Test kebocoran: kalau saya pakai API key kamu, saya gak boleh bisa baca/edit data user lain via Supabase REST API langsung"*

### Cara Menguji Kebocoran via Terminal (cURL):

Jalankan perintah ini di PowerShell atau Terminal:

```bash
curl -i -X GET "https://jldafbbpuallfreftbcd.supabase.co/rest/v1/debts" -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsZGFmYmJwdWFsbGZyZWZ0YmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3Njc5MTAsImV4cCI6MjEwNjM0MzkxMH0.ogKVSgDtdY1ix-KbOMuckeAozn7kn8MLoPcIgaoPzh8" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsZGFmYmJwdWFsbGZyZWZ0YmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3Njc5MTAsImV4cCI6MjEwNjM0MzkxMH0.ogKVSgDtdY1ix-KbOMuckeAozn7kn8MLoPcIgaoPzh8"
```

### Hasil yang Diharapkan:
```json
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8

[]
```
**Mengapa hasilnya `[]` (array kosong)?**
Karena permintaan tersebut hanya menggunakan `anon_key` publik tanpa JWT session milik user tertentu (`auth.uid() = null`). Kebijakan RLS kita mensyaratkan `TO authenticated USING (auth.uid() = user_id)`. Dengan demikian, **0 baris data yang bocor**, bahkan jika penyerang memiliki Anon Key proyek kamu!

---

## 5. Spesifikasi & Cara Kerja API Endpoints

Semua endpoint terletak di `src/app/api/debts/` dan memenuhi seluruh ketentuan halaman 2:

### 1. `GET /api/debts`
- **Fungsi:** Menampilkan daftar kasbon milik pengguna yang sedang login.
- **Query Parameter:**
  - `?status=belum` atau `?status=unsettled` : Memfilter yang belum lunas (`settled_at IS NULL`).
  - `?status=lunas` atau `?status=settled` : Memfilter yang sudah lunas (`settled_at IS NOT NULL`).
  - `?type=dihutang` atau `?type=owed_to_me` : Memfilter piutang.
  - `?type=hutang` atau `?type=i_owe` : Memfilter utang.
- **Respon Sukses:** HTTP `200 OK` (Array objek `Debt[]`).
- **Respon Error:** HTTP `401 Unauthorized` jika belum login.

### 2. `POST /api/debts`
- **Fungsi:** Membuat catatan kasbon baru.
- **Validasi Server:**
  - `type`: Wajib `'owed_to_me'` atau `'i_owe'`.
  - `counterpart_name`: Wajib, teks tidak boleh kosong, maks 100 karakter.
  - `amount`: Wajib, angka bulat positif (Rupiah utuh, bukan desimal).
  - `note`: Opsional, maks 200 karakter.
- **Respon Sukses:** HTTP `201 Created` (Objek `Debt` yang baru dibuat).
- **Respon Error:** HTTP `400 Bad Request` dengan pesan Bahasa Indonesia spesifik.

### 3. `PATCH /api/debts/[id]`
- **Fungsi:** Memperbarui data catatan atau mengubah status lunas (toggle).
- **Body:** `{ "settled_at": "2026-09-30T10:00:00Z" }` (atau `null` untuk membatalkan lunas).
- **Idempotensi:** Bisa dipanggil berulang kali secara aman.
- **Respon Sukses:** HTTP `200 OK` (Objek `Debt` terbaru).
- **Respon Error:** HTTP `404 Not Found` jika ID tidak ada atau milik user lain.

### 4. `DELETE /api/debts/[id]`
- **Fungsi:** Menghapus catatan kasbon permanen.
- **Proteksi:** Memastikan `user_id = auth.uid()` sehingga user lain tidak bisa menghapus catatan sembarangan.
- **Respon Sukses:** HTTP `200 OK` `{"message": "Catatan kasbon berhasil dihapus."}`.

---

## 6. Panduan Menjalankan Lokal & Deploy ke Vercel

### Menjalankan di Komputer Lokal:
```bash
# 1. Install dependensi
npm install

# 2. Jalankan development server
npm run dev

# 3. Buka di browser
# Akses: http://localhost:3000
```

### Verifikasi Produksi:
```bash
# Cek strict TypeScript (0 error)
npx tsc --noEmit

# Cek build Next.js produksi
npm run build
```

### Deploy ke Vercel (Gratis & Wajib untuk Submission):
1. Buat repository baru di akun GitHub pribadimu (misal: `kasbon-app`).
2. Hubungkan folder proyek dan lakukan push:
   ```bash
   git init
   git add .
   git commit -m "feat: complete kasbon fullstack app router with supabase"
   git branch -M main
   git remote add origin https://github.com/USERNAME_KAMU/kasbon-app.git
   git push -u origin main
   ```
3. Buka [https://vercel.com](https://vercel.com) dan klik **Add New Project**.
4. Import repository `kasbon-app`.
5. Di bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL` : URL Supabase kamu
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Anon Key Supabase kamu
6. Klik **Deploy**. Dalam 1-2 menit aplikasi sudah live dan aktif!

---

## 7. Script & Panduan Video Loom 3 Menit (High-Score Rubric)

Ketentuan Submission:
> *"Loom max 3 menit: demo (1m) + 1 keputusan teknis yang dibanggakan (1m) + 1 yang masih kurang (1m)"*

Gunakan panduan waktu dan naskah berikut saat merekam video Loom kamu:

### ⏱️ Menit ke-1: Demonstrasi Aplikasi (00:00 - 01:00)
1. **Intro Singkat (10 detik):**
   > *"Halo tim reviewer! Ini adalah Kasbon, aplikasi pencatatan utang-piutang personal berbasis Next.js App Router dan Supabase."*
2. **Auth & Dashboard (25 detik):**
   - Tunjukkan alur login via Supabase Auth.
   - Sorot 3 kartu summary di atas:
     * Total dihutang ke saya (format `Rp 1.234.000`).
     * Total saya hutang.
     * Kartu Net dengan warna adaptif (hijau jika surplus, merah jika defisit).
3. **Catat Baru & Tandai Lunas (25 detik):**
   - Klik **+ Catat Baru**, isi form (nama, nominal, tipe radio, catatan).
   - Tunjukkan live Rupiah preview di modal. Simpan.
   - Klik **Tandai Lunas**, tampilkan animasi konfeti dan status lunas yang tersimpan ke PostgreSQL.
   - **Refresh halaman** untuk membuktikan status lunas tidak hilang (bukan sekadar client-side state).
   - Tunjukkan fitur bonus: filter status/tipe, pencarian, dan tombol "Kelompokkan per Orang".

### ⏱️ Menit ke-2: Keputusan Teknis yang Dibanggakan (01:00 - 02:00)
1. **Penerapan Row Level Security (RLS) Multi-Tenant Ketat:**
   > *"Keputusan teknis yang paling saya banggakan adalah perancangan keamanan database berbasis Postgres Row Level Security (RLS) dengan aturan `auth.uid() = user_id`. Bahkan jika penyerang mengambil Anon Public Key kami dan melakukan cURL langsung ke endpoint Supabase REST API, mereka hanya akan menerima array kosong karena isolasi data ditegakkan di level database engine, bukan hanya di level UI."*
2. **Validasi Dua Arah & Strict Type Safety:**
   > *"Selain itu, seluruh API route (`GET`, `POST`, `PATCH`, `DELETE`) dan domain model dibangun dengan strict TypeScript tanpa menggunakan keyword `any`, disertai validasi menyeluruh di client maupun server dengan respon kesalahan berbahasa Indonesia yang informatif."*

### ⏱️ Menit ke-3: Trade-off & Hal yang Ingin Dipolish (02:00 - 03:00)
1. **Penyampaian Jujur & Rendah Hati:**
   > *"Jika saya memiliki waktu 1 hari tambahan untuk memoles aplikasi ini lebih jauh, hal yang ingin saya tambahkan adalah:*
   > *1. Integrasi otomatisasi pengingat via WhatsApp Gateway / Twilio API terjadwal (cron job) untuk mengirim pesan santun langsung sebelum tanggal jatuh tempo.*
   > *2. Pemasangan automated integration testing menggunakan Playwright atau Vitest untuk menguji end-to-end skenario RLS leakage dan idempotensi API toggle secara CI/CD otomatis.*
   > *3. Fitur multi-currency atau pencatatan riwayat cicilan bertahap untuk satu transaksi kasbon yang sama."*
2. **Penutup (10 detik):**
   > *"Terima kasih banyak atas kesempatan review tugas ini. Saya siap mendiskusikan setiap baris kode pada sesi interview mendatang!"*

---

*Dokumen ini dibuat otomatis untuk menjamin kesesuaian 100% dengan kriteria Hiring Task Junior Fullstack Developer.*
