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

## 📁 Struktur Folder (Vite Standard)

```text
vehicle-inspection-system/
├── src/
│   ├── assets/            # File gambar & SVG
│   │   ├── suv-front.svg
│   │   └── suv-back.svg
│   ├── main.jsx           # Entry point aplikasi
│   ├── Vector.jsx         # Komponen utama inspeksi
│   └── Vector.css         # Styling aplikasi
├── index.html             # Template HTML utama
├── vite.config.js         # Konfigurasi Vite & SVGR
├── package.json           # Daftar library & script
└── README.md              # Dokumentasi proyek
```

## 📋 Prasyarat

Sebelum menjalankan proyek ini, pastikan Anda sudah menginstall:
- [Node.js](https://nodejs.org/) (Versi LTS direkomendasikan)
- NPM (Sudah termasuk saat install Node.js)

## ⚙️ Cara Menjalankan

Ikuti langkah-langkah berikut untuk menjalankan proyek di komputer lokal Anda:

### 1. Clone Repository
```bash
git clone https://github.com/DIASANJOY/vehicle-inspection-system.git
cd vehicle-inspection-system
```

### 2. Install Dependensi
```bash
npm install
```

### 3. Jalankan Mode Pengembangan
```bash
npm run dev
```

### 4. Build untuk Produksi
```bash
npm run build
```

---

Dibuat untuk keperluan PKL / Project Vehicle Inspection.
