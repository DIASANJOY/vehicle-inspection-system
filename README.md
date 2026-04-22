<<<<<<< HEAD
Cara Menjalankan: jika belum menginstall npm maka install dulu
npm install
lalu jalankan :
npm run dev 
untuk menjalankan server dan agar halaman browser akan terload sendirinya seiring perubahan code
=======
# Vehicle Inspection System

A modern, interactive web application for vehicle inspection built with **React** and **Vite**. This tool allows users to perform visual inspections on vehicle panels (Front and Rear) using interactive SVG maps.

## 🚀 Fitur Utama

- **Interactive SVG Mapping**: Klik langsung pada bagian mobil untuk menandai kondisi.
- **Cycle Marker System**:
  - Klik 1x: ✓ (Lulus/Kondisi Baik)
  - Klik 2x: ✕ (Cacat/Rusak)
  - Klik 3x: Hapus Penanda
- **Sistem Komplain**: Muncul input catatan otomatis jika ada bagian yang ditandai sebagai cacat (✕).
- **Dual View**: Mendukung inspeksi panel depan (*Front Panel*) dan panel belakang (*Rear Panel*).
- **Responsive Design**: Tampilan premium yang menyesuaikan ukuran layar.

## 🛠️ Teknologi yang Digunakan

- [React.js](https://reactjs.org/) - Library UI utama.
- [Vite](https://vitejs.dev/) - Build tool generasi terbaru yang sangat cepat.
- [vite-plugin-svgr](https://github.com/pd4d10/vite-plugin-svgr) - Untuk mengolah file SVG sebagai komponen React.
- **Vanilla CSS** - Untuk styling kustom yang ringan dan fleksibel.

## 📋 Prasyarat

Sebelum menjalankan proyek ini, pastikan Anda sudah menginstall:
- [Node.js](https://nodejs.org/) (Versi LTS direkomendasikan)
- NPM (Sudah termasuk saat install Node.js)

## ⚙️ Cara Menjalankan (Dokumentasi Vite)

Ikuti langkah-langkah berikut untuk menjalankan proyek di komputer lokal Anda:

### 1. Clone Repository
```bash
git clone https://github.com/DIASANJOY/vehicle-inspection-system.git
cd vehicle-inspection-system
```

### 2. Install Dependensi
Perintah ini akan mendownload semua library yang dibutuhkan (termasuk Vite dan React) ke dalam folder `node_modules`:
```bash
npm install
```

### 3. Jalankan Mode Pengembangan (Development)
Jalankan perintah berikut untuk membuka aplikasi di browser:
```bash
npm run dev
```
Setelah perintah dijalankan, buka alamat yang muncul di terminal (biasanya `http://localhost:5173`).

### 4. Build untuk Produksi
Jika ingin membuat file siap pakai untuk hosting:
```bash
npm run build
```

---

Dibuat untuk keperluan PKL / Project Vehicle Inspection.
>>>>>>> d162980 (Update: Cycle markers logic, complaint notes system, and professional README.md)
