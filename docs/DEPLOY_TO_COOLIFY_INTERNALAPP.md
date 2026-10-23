# Panduan Deployment Coolify: Zen Internal Super-App

Dokumentasi resmi ini memuat panduan langkah-demi-langkah penerapan (**deployment**) **Zen Internal Super-App** ke platform **Coolify** untuk dua target environment:
1. **Trial / Staging Version** (terhubung ke Supabase Staging: `okchlapizmhoueeeldrh.supabase.co`)
2. **Production Version** (terhubung ke Supabase Production: `ihdlwogvjfgawgsalgng.supabase.co`)

---

## 1. Arsitektur & Standar Production Grade

Aplikasi dibangun menggunakan arsitektur modern berkinerja tinggi:
- **Teknologi**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Vite PWA (Service Worker & Manifest).
- **Web Server Container**: Nginx Alpine multi-stage build berukuran ringan (< 30 MB) dengan kompresi Gzip.
- **PWA & SPA Routing**: Nginx dikonfigurasi untuk fallback routing SPA (`try_files $uri $uri/ /index.html;`) serta kontrol cache agresif:
  - File inti aplikasi (`index.html`, `sw.js`, `.webmanifest`): Disajikan dengan header `no-cache, no-store, must-revalidate` agar perangkat staf (smartphone / tablet) selalu menerima pembaruan versi terbaru secara instan.
  - Fingerprinted Vite bundle (`/assets/*`): Disajikan dengan header `Cache-Control: public, max-age=31536000, immutable` untuk kecepatan muat maksimum.
- **Keamanan Zero-Leakage**:
  - **Penghapusan Log Otomatis**: Semua `console.log`, `console.warn`, `console.error`, dan `debugger` otomatis dihapus oleh esbuild (`drop: ['console', 'debugger']`) saat proses kompilasi production bundle (`npm run build`). Hal ini mencegah inspeksi data sensitif oleh pihak luar melalui DevTools konsol browser.
  - **Tanpa Hardcode Kredensial**: Tidak ada fallback URL atau Anon Key di dalam kode sumber (`src/lib/supabaseClient.ts`). Jika variabel lingkungan tidak disediakan pada tahap build, proses build/runtime akan gagal dengan peringatan keamanan yang jelas.
  - **Dynamic Branding**: Nama aplikasi, navbar title, dan versi aplikasi dapat disesuaikan per target environment tanpa mengubah kode.
  - **Security Headers Nginx**: Dilengkapi dengan `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection`, dan `Referrer-Policy`.
  - **Healthcheck Container**: Endpoint `/healthz` otomatis memverifikasi kesiapan web server Nginx.

---

## 2. Informasi Repositori & Kredensial Environment

### A. Repositori Git
- **Repository URL**: `https://github.com/borist-nababan-cloud/zen-frontend-internalapp.git`
- **Default Branch**: `main`
- **Build Pack**: `Dockerfile`
- **Container Port**: `80`
- **Healthcheck Path**: `/healthz`

---

### B. Konfigurasi Variabel Lingkungan (Environment Variables)

> [!IMPORTANT]
> **ATURAN VITE BUILD DI COOLIFY**:
> Pada aplikasi berbasis Vite / React SPA, seluruh variabel dengan awalan `VITE_` dikompilasi ke dalam bundle JavaScript **pada saat build time** di dalam container Docker.
> Oleh karena itu, di Coolify pastikan mencentang opsi **"Build Variable"** (atau "Available during build time") untuk setiap variabel di bawah ini.

#### 1. Versi Trial / Staging
Gunakan konfigurasi ini untuk aplikasi versi Trial/Testing (misal domain: `internal-trial.zenreflexology.com`):

| Nama Variabel | Nilai (Value) | Keterangan |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | `https://okchlapizmhoueeeldrh.supabase.co` | Supabase Staging URL |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_UWMj_yrx7u157kklx62Tzg_Kzy787QN` | Supabase Staging Anon Key |
| `VITE_APP_NAME` | `Zen Internal Super-App (Trial)` | Nama PWA Staging |
| `VITE_APP_SHORT_NAME` | `ZenTrial` | Nama icon PWA |
| `VITE_APP_VERSION` | `1.0.0-trial` | Label versi aplikasi |
| `VITE_NAVBAR_TITLE` | `ZEN OPERATIONAL [TRIAL]` | Judul header navbar |
| `VITE_GOOGLE_CLIENT_ID` | `120918753452-rpp1v3qu3am70ocmvdt4pojlemct1kf6.apps.googleusercontent.com` | Google OAuth Client ID |

**Format Salin-Tempel Sekaligus (.env) untuk Coolify Staging:**
```env
VITE_SUPABASE_URL=https://okchlapizmhoueeeldrh.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_UWMj_yrx7u157kklx62Tzg_Kzy787QN
VITE_APP_NAME=Zen Internal Super-App (Trial)
VITE_APP_SHORT_NAME=ZenTrial
VITE_APP_VERSION=1.0.0-trial
VITE_NAVBAR_TITLE=ZEN OPERATIONAL [TRIAL]
VITE_GOOGLE_CLIENT_ID=120918753452-rpp1v3qu3am70ocmvdt4pojlemct1kf6.apps.googleusercontent.com
```

---

#### 2. Versi Production
Gunakan konfigurasi ini untuk aplikasi versi Utama / Live Operasional (misal domain: `internal.zenreflexology.com`):

| Nama Variabel | Nilai (Value) | Keterangan |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | `https://ihdlwogvjfgawgsalgng.supabase.co` | Supabase Production URL |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_KobV2o95Ymfem77b4zVBJg_E_onldRD` | Supabase Production Anon Key |
| `VITE_APP_NAME` | `Zen Internal Super-App` | Nama PWA Production |
| `VITE_APP_SHORT_NAME` | `ZenInternal` | Nama icon PWA |
| `VITE_APP_VERSION` | `1.0.0` | Label versi aplikasi |
| `VITE_NAVBAR_TITLE` | `ZEN OPERATIONAL` | Judul header navbar |
| `VITE_GOOGLE_CLIENT_ID` | `120918753452-rpp1v3qu3am70ocmvdt4pojlemct1kf6.apps.googleusercontent.com` | Google OAuth Client ID |

**Format Salin-Tempel Sekaligus (.env) untuk Coolify Production:**
```env
VITE_SUPABASE_URL=https://ihdlwogvjfgawgsalgng.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_KobV2o95Ymfem77b4zVBJg_E_onldRD
VITE_APP_NAME=Zen Internal Super-App
VITE_APP_SHORT_NAME=ZenInternal
VITE_APP_VERSION=1.0.0
VITE_NAVBAR_TITLE=ZEN OPERATIONAL
VITE_GOOGLE_CLIENT_ID=120918753452-rpp1v3qu3am70ocmvdt4pojlemct1kf6.apps.googleusercontent.com
```

---

## 3. Langkah-demi-Langkah Penerapan di Coolify

### Langkah 1: Buat Resource Baru di Coolify
1. Buka dashboard **Coolify** Anda.
2. Masuk ke **Project** target (misal: `Zen Production` atau `Zen Staging`).
3. Klik tombol **+ New** lalu pilih **Application**.
4. Pilih **Public Repository** (atau **Private Repository (GitHub App)** jika privat).
5. Masukkan URL: `https://github.com/borist-nababan-cloud/zen-frontend-internalapp.git`
6. Tentukan branch: `main`.

### Langkah 2: Konfigurasi Build & Container
1. Pada menu aplikasi yang baru dibuat, masuk ke tab **General**:
   - **Build Pack**: Pilih `Dockerfile`.
   - **Base Directory**: Kosongkan atau isi `/`.
   - **Dockerfile Location**: `/Dockerfile`.
   - **Ports Exposes**: Masukkan `80`.
2. Pada bagian **Domains**:
   - Untuk Trial: Masukkan domain (misal: `https://internal-trial.zenreflexology.com`).
   - Untuk Production: Masukkan domain (misal: `https://internal.zenreflexology.com`).
   - Centang opsi otomatis generate SSL certificate via Let's Encrypt.

### Langkah 3: Masukkan Environment Variables
1. Buka tab **Environment Variables** di menu samping Coolify.
2. Tempel variabel lingkungan sesuai target (lihat daftar di Bagian 2 di atas).
3. **Sangat Penting**: Pastikan opsi **"Build Variable"** diaktifkan (dicentang) untuk semua variabel `VITE_*`.
4. Klik **Save**.

### Langkah 4: Konfigurasi Health Check
1. Buka tab **Health Checks** di Coolify.
2. Aktifkan Health Check:
   - **Protocol**: `HTTP`
   - **Path**: `/healthz`
   - **Port**: `80`
   - **Interval**: `10` detik
   - **Timeout**: `3` detik
   - **Start Period**: `5` detik
3. Klik **Save**.

### Langkah 5: Jalankan Deployment
1. Klik tombol **Deploy** di pojok kanan atas dashboard Coolify.
2. Pantau live build logs:
   - Tahap 1: `npm ci` mengunduh dependensi.
   - Tahap 2: `npm run build` mengompilasi TypeScript dan memproduksi bundle PWA dengan konsol yang sudah di-strip.
   - Tahap 3: Image Nginx Alpine dibentuk dan container dijalankan.
3. Setelah status berubah menjadi **Healthy (Green)**, buka tautan domain Anda di peramban.

---

## 4. Konfigurasi Autentikasi Supabase & Google OAuth

Agar fitur login Google dan navigasi sesi berjalan mulus, domain Coolify Anda harus didaftarkan di Supabase Auth:

### A. Di Dashboard Supabase (Lakukan pada Staging dan Production)
1. Buka **Project Settings** -> **Authentication** -> **URL Configuration**.
2. **Site URL**: Masukkan domain Coolify Anda (misal: `https://internal.zenreflexology.com`).
3. **Redirect URLs**: Tambahkan baris-baris berikut:
   ```text
   https://internal.zenreflexology.com
   https://internal.zenreflexology.com/**
   http://localhost:5174
   http://localhost:5174/**
   ```
   *(Ganti dengan `internal-trial.zenreflexology.com` untuk project Staging)*.
4. Klik **Save**.

### B. Di Google Cloud Console
1. Buka [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Pilih OAuth 2.0 Client ID yang digunakan aplikasi.
3. Di bagian **Authorized redirect URIs**, pastikan callback Supabase terdaftar:
   - Untuk Staging: `https://okchlapizmhoueeeldrh.supabase.co/auth/v1/callback`
   - Untuk Production: `https://ihdlwogvjfgawgsalgng.supabase.co/auth/v1/callback`
4. Di bagian **Authorized JavaScript origins**, tambahkan domain Coolify Anda:
   - `https://internal-trial.zenreflexology.com`
   - `https://internal.zenreflexology.com`

---

## 5. Pemeriksaan Paska-Deployment (Checklist Verifikasi)

Setelah aplikasi online, lakukan pengujian berikut:

1. **Pemeriksaan Health Check**:
   Kunjungi `https://domain-anda/healthz` -> Harus mengembalikan teks `OK` dengan HTTP status code `200`.
2. **Pemeriksaan Keamanan Konsol**:
   Buka DevTools peramban (F12) -> Buka tab **Console**.
   Pastikan tidak ada pesan debug, data profil, atau log kueri yang muncul.
3. **Pemeriksaan Login Google**:
   Klik tombol **Login Google** -> Otomatis diarahkan ke halaman akun Google, lalu berhasil kembali ke Beranda dengan profil dan role terdeteksi.
4. **Pemeriksaan Modul Operasional**:
   - **View Payroll** (`/payroll`): Menampilkan filter dropdown dibatasi maksimal 4 periode terbaru, header karyawan, serta rincian slip gaji.
   - **Lihat Absensi** (`/attendance`): Rentang tanggal dibatasi maksimal 14 hari, default hari ini, menampilkan rekam log `fp_in` dan `fp_out`.
   - **Lihat Komisi** (`/commission`): Rentang tanggal dibatasi maksimal 7 hari, hanya dapat diakses staf berdepartemen `TR` (15%) dan `TB` (10%), menampilkan total estimasi dan disclaimer perhitungan.
5. **Pemeriksaan PWA (Progressive Web App)**:
   - Pada browser Chrome / Safari mobile, akan muncul opsi **"Install App"** atau ikon instalasi di address bar.
   - Aplikasi dapat dipasang ke Homescreen ponsel dan berjalan dalam mode layar penuh (standalone).

---

## 6. Prosedur Pembaruan Aplikasi (Auto-Update)

Jika Anda melakukan push commit baru ke branch `main`:
1. Coolify dengan webhook GitHub akan otomatis memicu build ulang (**re-deploy**).
2. Service Worker pada aplikasi staf akan mendeteksi `sw.js` baru (berkat header `no-cache`), lalu memperbarui cache lokal tanpa mengharuskan staf melakukan clear cache manual.
