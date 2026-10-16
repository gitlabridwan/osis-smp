# OSIS — Satu Ruang Bersama

Paket halaman pembuka OSIS mengikuti struktur contoh Edu Episians: iframe layar penuh, layar pembuka, status koneksi, muat ulang, dan dukungan pemasangan PWA. Nama dan URL memakai OSIS dari percakapan sebelumnya.

## Cara memakai

1. Ekstrak ZIP, lalu unggah seluruh isinya ke folder yang sama pada hosting statis HTTPS. Pertahankan folder `icons/`.
2. Buka alamat hosting tersebut. Tombol **Buka langsung** selalu tersedia di kanan atas untuk membuka aplikasi Google di tab yang sama.
3. Untuk mengganti deployment, ubah `data-app-url` pada iframe dan `href` tautan `direct-link` di `index.html`.

`index.html`, `styles.css`, `app.js`, `manifest.webmanifest`, `sw.js`, `favicon.svg`, `og.png`, dan folder `icons/` merupakan satu paket. Jangan hanya mengunggah `index.html`.

Paket ini merupakan halaman pembungkus pada hosting terpisah. Pertahankan halaman aplikasi dan fungsi backend di Apps Script. Menjadikan pembungkus ini sebagai halaman yang dilayani oleh deployment yang sama akan membuat aplikasi memuat dirinya sendiri.

Parameter `?page=home`, `website`, `login`, `register`, dan `dashboard` diteruskan ke iframe dan tautan langsung. Parameter lain tidak diteruskan.

## Jika Apps Script tetap kosong atau menolak koneksi

Halaman pembungkus tidak dapat mengubah izin embedding atau izin akses deployment Google. Jika halaman bisa dibuka langsung tetapi ditolak dalam iframe, periksa hasil `HtmlOutput` yang dikembalikan oleh `doGet` yang sudah ada. Untuk mengizinkan embedding, panggil:

```javascript
output.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
```

`output` di sini berarti objek `HtmlOutput` aplikasi Anda yang sudah ada, termasuk hasil `.evaluate()` jika memakai template. Terapkan sebelum objek itu dikembalikan oleh `doGet`, pertahankan routing dan logika aplikasi, lalu perbarui deployment Web App.

`ALLOWALL` mengizinkan situs mana pun menyematkan aplikasi; pengembang perlu menyiapkan perlindungan clickjacking yang sesuai. Pastikan pula pengguna mempunyai izin untuk mengakses deployment. Halaman login atau otorisasi Google mungkin perlu dibuka lewat **Buka langsung**.

Event `load` iframe tidak membuktikan aplikasi berhasil ditampilkan. Halaman lintas domain tidak bisa diperiksa dari pembungkus ini. Setelah 15 detik, pemberitahuan menawarkan muat ulang atau akses langsung tanpa menyatakan bahwa pemuatan pasti gagal.

## Memasang sebagai aplikasi

- Sajikan lewat HTTPS. Untuk pengembangan, localhost juga didukung; membuka berkas HTML langsung tidak memenuhi syarat pemasangan PWA.
- **Pasang aplikasi** muncul jika browser memberikan event pemasangan. Ketersediaannya bergantung pada browser dan perangkat.
- Pada iPhone/iPad, buka melalui Safari, pilih **Bagikan**, lalu **Tambahkan ke Layar Utama**.
- Saat sudah dipasang, ikon membuka alamat pembungkus dalam mode aplikasi. Iframe tetap memuat konten OSIS dari Google.

Service worker menyimpan berkas tampilan lokal. Konten, akun, formulir, dan data Apps Script tidak disimpan oleh service worker ini. Konten OSIS tetap memerlukan internet. Ketika koneksi pulih, halaman yang sudah terbuka tidak dimuat ulang secara otomatis agar isian formulir tetap terjaga.

Ketika mengubah daftar berkas yang disimpan atau ingin mengganti versi cache, naikkan akhiran versi `CACHE_NAME` di `sw.js`. Gambar `og.png` disertakan; untuk pratinjau berbagi di hosting produksi, gunakan URL absolut gambar tersebut pada meta `og:image`.

## Pemeriksaan

Paket diperiksa secara lokal untuk sintaks JavaScript, rujukan aset, dimensi ikon, penerusan halaman, status koneksi, timeout iframe, dan alur tombol pemasangan. Tampilan halaman Google dan instalasi pada perangkat belum diuji terhadap deployment Anda.

## Referensi

- [Google Apps Script: XFrameOptionsMode](https://developers.google.com/apps-script/reference/html/x-frame-options-mode?hl=id)
- [MDN: Membuat PWA dapat dipasang](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)
- [MDN: Memicu dialog pemasangan](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Trigger_install_prompt)
