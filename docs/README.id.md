# Debian Web Sandbox

🌐 Bahasa yang tersedia:
- [English](../README.md)
- [Bahasa Indonesia (Aktif)](./README.id.md)

Sebuah simulasi berbasis web dari *installer* TUI (Text User Interface) Debian dan lingkungan terminal dasar, yang dibangun menggunakan React.

## Tujuan

Proyek ini adalah alat edukasi yang dirancang untuk membantu pengguna baru agar terbiasa dengan proses instalasi Debian dan antarmuka baris perintah (CLI) dasar Linux di lingkungan browser web yang aman dan bebas risiko. Proyek ini bertujuan untuk mensimulasikan "rasa" dari instalasi yang sesungguhnya guna membangun pemahaman yang lebih baik bagi mereka yang sedang belajar Linux.

## Fitur Saat Ini

### 1. Simulasi Installer

Sebuah *installer* bergaya TUI dengan beberapa langkah yang memandu pengguna melalui proses (simulasi) berikut:

* Pemilihan bahasa, lokasi, dan papan ketik (keyboard).
* Pengaturan nama host dan akun pengguna.
* Pengaturan partisi berbasis menu (mensimulasikan "Guided partitioning" berdasarkan masukan pengguna).
* Serangkaian log instalasi realistis yang bergulir (Sistem Dasar, GRUB, Konfigurasi Akhir).

### 2. Simulasi Terminal

Setelah instalasi, sistem akan "reboot" ke TTY login prompt yang disimulasikan. Setelah login dengan pengguna yang dibuat saat instalasi, Anda akan masuk ke lingkungan terminal dasar.

**Perintah yang Didukung:**

* **Navigasi:** `cd`, `ls`, `dir`
* **File/Direktori:** `cat`, `mkdir`, `touch`, `rm`, `rmdir`
* **Editor:** `nano`, `vi` (keduanya membuka editor teks sederhana dengan `Ctrl+X` untuk menyimpan/keluar)
* **Sesi:** `clear`, `exit` (untuk *logout*)

## Cara Menjalankan

Proyek ini dibangun menggunakan [Vite](https://vitejs.dev/).

1.  **Instalasi *dependency*:**
    ```sh
    npm install
    ```
2.  **Jalankan *development server*:**
    ```sh
    npm run dev
    ```

## Dalam Pengembangan

Proyek ini masih dalam tahap pengembangan. Sistem *file* yang ada hanyalah objek JavaScript sederhana, dan perintah-perintahnya adalah simulasi dasar. Perintah tambahan dan simulasi yang lebih mendalam direncanakan untuk masa mendatang.
