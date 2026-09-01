# 📘 Digital Log Book (Personal Edition)

Aplikasi **Digital Log Book Pribadi** berbasis web yang modern, cepat, responsif, dan simpel untuk mencatat aktivitas harian, menghitung durasi jam kerja otomatis, menyimpan lampiran bukti kerja, serta mengekspor rekapitulasi ke format **PDF, Excel (.xlsx), dan CSV**.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ (App Router) & React 19 (TypeScript)
- **Database & ORM**: Drizzle ORM + PostgreSQL / Local Store
- **Styling**: Tailwind CSS & Modern Clean UI (shadcn/ui aesthetic)
- **Data & State**: TanStack Query (fetching & caching) & Zustand
- **Form & Validasi**: React Hook Form + Zod
- **Dokumen & Ekspor**: jsPDF, jsPDF-AutoTable & SheetJS (XLSX)

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Masuk ke Folder Proyek
```bash
cd c:\Users\user\OneDrive\Desktop\loogbook
```

### 2. Jalankan Server Development
```bash
npm run dev
```

Buka browser Anda dan akses:
👉 **[http://localhost:3000](http://localhost:3000)** *(atau port yang ditampilkan di terminal, misal http://localhost:3002)*

---

## 🧭 Menu & Fitur Utama

1. **📊 Dashboard (`/dashboard`)**
   - Ringkasan total aktivitas kerja & total jam kerja terakumulasi.
   - Status capaian (*Selesai*, *In Progress*, *Draf*).
   - Grafik distribusi kategori pekerjaan & daftar aktivitas terbaru.

2. **📖 Log Book Saya (`/logbook`)**
   - Daftar seluruh catatan aktivitas kerja.
   - Pencarian cepat dan filter rentang tanggal, kategori, atau status.
   - Tombol tambah, edit, hapus, dan lihat rincian lengkap.

3. **➕ Catat Aktivitas Baru (`/logbook/new`)**
   - Form input: Tanggal, Waktu Mulai & Selesai (durasi otomatis dihitung).
   - Pemilihan kategori & lokasi kerja (Kantor / WFH / Lapangan).
   - Deskripsi rincian pekerjaan & output capaian.
   - Unggah lampiran berkas bukti (screenshot, PDF, dokumen).

4. **📑 Laporan & Ekspor (`/reports`)**
   - Filter rekapitulasi data berdasarkan periode (Hari Ini, Minggu Ini, Bulan Ini, atau Rentang Tanggal Kustom).
   - **Export PDF**: Menghasilkan dokumen PDF rapi siap cetak/kirim.
   - **Export Excel (.xlsx)**: Mengunduh file spreadsheet siap olah.
   - **Export CSV**: Format data tabel ringan.

5. **⚙️ Kategori & Profil (`/settings`)**
   - Kustomisasi kategori pekerjaan (nama, deskripsi, dan warna label).
   - Pengaturan nama pemilik log book dan jabatan (akan otomatis tercantum di kop laporan cetak).
