# Typing Speed Battle

> **Tugas 1 - Mata Kuliah Pengembangan Aplikasi Berbasis Web (PABWE)**  
> **Program Studi Sarjana Informatika - Institut Teknologi Del (2026)**  
> **Penulis:** Immanuel Parasian Lumbantobing (11S24035)  
> **Dosen Pengampu:** Arie Satia Dharma, S.T, M.Kom.

---

## 1. Deskripsi Proyek

**Typing Speed Battle** adalah aplikasi uji kecepatan mengetik (*typing speed test*) interaktif berbasis web yang dibangun secara murni menggunakan **HTML5, CSS3, dan JavaScript (ES6+)** tanpa menggunakan framework maupun pustaka (*library*) eksternal. Seluruh data rekor disimpan secara persisten di sisi klien menggunakan Web Storage API (`localStorage`).

### Fitur Utama:
- **Dua Pilihan Mode Kata:** Mode Umum (kata bahasa Indonesia sehari-hari) dan Mode IT (istilah teknologi & pemrograman).
- **Pilihan Durasi Waktu:** 30 detik atau 60 detik.
- **Timer Anti-Drift:** Menggunakan diferensiasi timestamp `Date.now()` yang presisi dan kebal jeda interval peramban.
- **Mulai Otomatis:** Timer mulai menghitung mundur secara otomatis saat karakter pertama diketikkan.
- **Umpan Balik Visual Kata:** Warna hijau untuk kata yang benar, merah untuk kata salah, dan kuning untuk kata yang sedang aktif diketik.
- **Metrik Performa:** Menghitung kata per menit (*Gross/Net Words Per Minute* standar 1 kata = 5 karakter) dan persentase akurasi secara konsisten.
- **Leaderboard Lokal:** Menyimpan hingga 10 rekor skor tertinggi di `localStorage` terurut dari WPM terbesar dan aman dari serangan XSS (*Cross-Site Scripting*).
- **Pembersihan Skor:** Fitur untuk mereset seluruh data riwayat skor secara aman.

---

## 2. Struktur Direktori Proyek

Struktur proyek dirancang modular dengan mematuhi prinsip *Separation of Concerns*:

```text
typing-speed-battle/
├── index.html          # Struktur kerangka halaman semantik
├── css/
│   └── style.css       # Desain antarmuka, tata letak responsif & tema biru-putih
├── js/
│   ├── config.js       # Konfigurasi terpusat (durasi, kuota kata, batas leaderboard)
│   ├── words.js        # Bank kata untuk Mode Umum dan Mode IT
│   ├── game.js         # Fungsi murni (shuffle Fisher-Yates, WPM, Akurasi, Timer)
│   ├── storage.js      # Penyimpanan & pembacaan aman ke localStorage
│   ├── ui.js           # Manipulasi tampilan DOM dan rendering leaderboard
│   └── main.js         # Pengatur alur utama (orchestrator) dan penanganan event
├── tests/
│   └── game.test.js    # Pengujian unit otomatis fungsi logika murni (Node.js)
├── package.json        # Konfigurasi ES Module {"type": "module"}
├── .gitignore          # Daftar pengabaian berkas sistem/git
└── README.md           # Panduan lengkap proyek
```

---

## 3. Cara Menjalankan Aplikasi

> **PENTING (Catatan Teknis ES Modules):**  
> Aplikasi ini menggunakan JavaScript ES Modules (`<script type="module">`). Oleh karena itu, aplikasi **TIDAK BOLEH** dibuka dengan cara klik ganda berkas `index.html` (protokol `file:///`) karena peramban akan memblokir impor modul berdasarkan kebijakan keamanan peramban (CORS). Aplikasi harus dibuka melalui **server statis lokal**.

Pilih salah satu metode berikut:

### Opsi A: Menggunakan VS Code Live Server (Direkomendasikan)
1. Buka folder proyek ini di **Visual Studio Code**.
2. Pastikan ekstensi **Live Server** (oleh Ritwick Dey) telah terpasang.
3. Klik kanan pada berkas `index.html`, lalu pilih **"Open with Live Server"** (atau klik tombol **Go Live** di pojok kanan bawah jendela VS Code).
4. Peramban akan otomatis terbuka di alamat:  
   `http://127.0.0.1:5500/` atau `http://localhost:5500/`

---

### Opsi B: Menggunakan Python (Tanpa Instalasi Tambahan)
Jika komputer Anda telah memiliki Python:
1. Buka Terminal atau Command Prompt / PowerShell di folder proyek ini.
2. Jalankan perintah server HTTP lokal:
   ```bash
   python -m http.server 5500
   ```
3. Buka peramban favorit Anda (Chrome, Edge, atau Firefox) dan kunjungi:  
   `http://localhost:5500`

---

### Opsi C: Menggunakan Node.js (npx serve)
Jika komputer Anda memiliki Node.js:
1. Buka Terminal pada direktori proyek.
2. Jalankan perintah:
   ```bash
   npx serve .
   ```
3. Kunjungi tautan localhost yang ditampilkan pada terminal.

---

## 4. Menjalankan Uji Otomatis (Unit Testing)

Fungsi logika murni pada `js/game.js` dapat diuji secara terisolasi tanpa peramban menggunakan Node.js:

```bash
npm test
```
*atau:*
```bash
node tests/game.test.js
```

Jika semua uji berhasil, terminal akan menampilkan pesan:
```text
Semua pengujian lulus
```

---

## 5. Konfigurasi Aplikasi (`js/config.js`)

Seluruh pengaturan sistem dikumpulkan pada `js/config.js` sehingga mudah disesuaikan:

```javascript
export const CONFIG = {
  durations: [30, 60],          // Pilihan durasi tes (detik)
  wordsPerRound: 120,           // Jumlah kata acak yang disiapkan per ronde
  maxScores: 10,                // Kuota maksimal entri papan peringkat
  maxNameLength: 20,            // Batas maksimal karakter nama pemain
  storageKey: "tsb_leaderboard" // Kunci penyimpanan di localStorage
};
```

---

## 6. Ringkasan Pengujian Kasus Tepi (Edge Cases)

| Kode | Skenario | Hasil Uji | Keterangan |
|---|---|---|---|
| **T-01** | Hitung WPM Normal (50 karakter benar, 30 detik) | `20 WPM` | Lulus sesuai rumus standar |
| **T-03** | WPM saat waktu `0` detik | `0` (bukan `Infinity`) | Mencegah *division by zero* |
| **T-05** | Akurasi saat belum mengetik (`0 / 0`) | `0%` (bukan `NaN`) | Menjaga stabilitas antarmuka |
| **T-07** | Pengacakan Fisher-Yates | Array asli tidak termutasi | Fungsi murni (*pure function*) |
| **T-09** | Menekan tombol "Ulangi" berkali-kali | Interval lama dihentikan | Bebas dari *zombie interval* |
| **T-11** | LocalStorage berisi JSON rusak | Aplikasi tetap berjalan normal | Dilindungi blok `try...catch` |
| **T-13** | Nama pemain mengandung tag `<img onerror=...>` | Ditampilkan murni sebagai teks | Dilindungi via `textContent` anti-XSS |
