# Data Seeder — Nutech Mini-ERP

## 1. Tujuan

Menyiapkan data awal dan data demo untuk pengembangan, pengujian, serta demonstrasi Nutech Mini-ERP.

Seeder harus mengikuti skema database aktual dan tidak boleh memaksakan perubahan struktur database hanya demi mengakomodasi data contoh.

## 2. Prinsip Implementasi

1. Periksa seluruh migration, model, factory, relasi, enum, dan seeder yang sudah tersedia sebelum membuat implementasi.
2. Gunakan tabel dan kolom yang benar-benar ada. Nama tabel dalam dokumen ini merupakan referensi domain, bukan asumsi nama tabel final.
3. Jangan membuat migration baru atau mengubah skema database hanya untuk mendukung seeder.
4. Gunakan mekanisme idempotent agar seeder dapat dijalankan berulang kali tanpa membuat duplikasi data.
5. Gunakan foreign key dan relasi model yang sudah tersedia.
6. Jangan membuat transaksi yang melanggar aturan stok atau menghasilkan saldo persediaan negatif.
7. Pisahkan data wajib sistem, data master, dan data transaksi demo.
8. Jangan memasukkan data perusahaan atau pelanggan nyata tanpa sumber yang disetujui.
9. Jangan menanamkan password produksi, token, atau kredensial sensitif ke dalam seeder.
10. Seeder tidak boleh menjalankan operasi penghapusan massal terhadap data yang sudah ada.

## 3. Kategori Seeder

### 3.1 System Seeder

Menyiapkan data dasar yang diperlukan agar aplikasi dapat digunakan.

Data yang dapat disiapkan, apabila dependensi terkait sudah tersedia:

- Role pengguna.
- Permission dan pemetaan permission ke role.
- Akun administrator awal untuk kebutuhan pengembangan lokal.
- Data referensi sistem yang memang diwajibkan oleh aplikasi.

Role yang direncanakan:

| Role | Tanggung Jawab |
|---|---|
| `marketing` | Pengelolaan pelanggan dan Sales Order |
| `ppic` | Pemeriksaan kebutuhan material dan Work Order |
| `warehouse` | Pengelolaan persediaan dan pengiriman |
| `production` | Pelaporan hasil produksi, QC, dan downtime |
| `finance` | Pengelolaan penagihan dan invoice |
| `management` | Pemantauan operasional dan dashboard |

Ketentuan:

- Periksa sistem autentikasi dan otorisasi yang sudah terpasang.
- Jika menggunakan Filament Shield dan Spatie Permission, ikuti konfigurasi serta API paket yang benar-benar tersedia.
- Jangan membuat tabel role atau permission baru apabila paket sudah menyediakan tabel yang diperlukan.
- Jangan mengasumsikan role `management` memiliki akses penuh sebelum aturan otorisasi aktual ditentukan.
- Kredensial akun pengembangan harus ditetapkan secara aman melalui konfigurasi atau environment variable.
- Jangan membuat akun administrator dengan password produksi bawaan.

### 3.2 Master Data Seeder

Masukkan data contoh hanya untuk entitas yang sudah memiliki tabel dan relasi yang sesuai.

| Domain | Contoh Data | Ketentuan |
|---|---|---|
| Pelanggan | Pelanggan B2B demo | Gunakan nama fiktif |
| Material | Karet, foam, EVA sponge | Sesuaikan atribut dengan skema aktual |
| Barang jadi | Produk hasil pemotongan | Gunakan relasi produk yang tersedia |
| Satuan | Roll, Sheet, Meter, Kg, Pcs | Gunakan satuan yang didukung sistem |
| Mesin | Mesin potong demo | Sesuaikan dengan struktur master mesin |
| Alasan downtime | Dies Changeover, Blade Sharpening, Machine Repair, Power Outage | Gunakan nilai standar jika skema mendukung |
| Lokasi penyimpanan | Lokasi gudang atau rak demo | Hanya jika entitas lokasi memang tersedia |

Jangan membuat tabel baru hanya untuk menampung data referensi tersebut.

Jangan mengasumsikan seluruh material dapat dikonversi langsung ke Pcs. Data konversi harus mengikuti aturan dan struktur yang sudah tersedia.

### 3.3 Transaction Demo Seeder

Data transaksi demo dibuat setelah master data yang dibutuhkan tersedia.

Urutan relasi bisnis yang direncanakan:

1. Pelanggan demo.
2. Sales Order beserta detail itemnya.
3. Work Order yang merujuk pada Sales Order.
4. Catatan produksi atau shift log.
5. Catatan QC apabila sudah didukung skema.
6. Catatan downtime mesin.
7. Mutasi persediaan melalui mekanisme domain yang tersedia.
8. Surat Jalan dan invoice hanya jika modul serta relasinya sudah tersedia.

Ketentuan:

- Jangan membuat Work Order tanpa relasi yang valid terhadap order asal jika relasi tersebut diwajibkan.
- Jangan mengarang status transaksi di luar enum atau aturan status yang sudah diterapkan.
- Jangan mengisi hasil produksi, QC, dan scrap secara acak tanpa menjaga konsistensi satuan dan validasi yang tersedia.
- Jangan membuat transaksi persediaan dengan mengubah saldo stok secara langsung apabila sistem menggunakan inventory ledger.
- Jangan membuat `inventory_movements` palsu hanya demi menghasilkan saldo demo. Gunakan Service Layer yang benar jika mekanisme tersebut sudah tersedia.
- Jangan membuat invoice atau Surat Jalan apabila struktur dan aturan bisnisnya belum tersedia.
- Jika sebagian modul belum diimplementasikan, lewati data transaksi modul tersebut dan laporkan keterbatasannya.

## 4. Strategi Persediaan

Sistem direncanakan menggunakan:

- `inventory_movements` sebagai buku besar mutasi persediaan.
- `inventory_stocks` sebagai representasi saldo aktif.

Nama tersebut harus diverifikasi terhadap migration aktual sebelum implementasi.

Ketentuan:

1. Saldo awal harus memiliki sumber dan mekanisme pencatatan yang jelas.
2. Setiap mutasi harus mengikuti aturan domain persediaan yang berlaku.
3. Jangan menghasilkan stok negatif.
4. Jangan melewati mekanisme transaksi database dan row-level locking yang digunakan aplikasi.
5. Jangan mengubah saldo aktif secara langsung untuk menyamarkan ketidaksesuaian ledger.
6. Jangan menambahkan data saldo awal jika mekanisme saldo awal belum tersedia atau belum ditentukan.

Jika Service Layer untuk mutasi persediaan belum tersedia, tunda pembuatan data transaksi stok. Jangan membuat implementasi alternatif di seeder.

## 5. Strategi Idempotensi

Seeder harus aman dijalankan berulang kali.

- Gunakan key unik yang stabil jika tersedia, misalnya kode master atau nomor dokumen.
- Gunakan `updateOrCreate`, `firstOrCreate`, atau pendekatan lain yang sesuai dengan constraint database aktual.
- Jangan mengandalkan nama tampilan sebagai identitas unik jika nama tersebut dapat berubah.
- Hindari membuat transaksi demo baru pada setiap eksekusi.
- Jangan menimpa perubahan pengguna pada data yang sudah ada tanpa alasan yang jelas.
- Jangan menghapus seluruh tabel sebelum melakukan seeding.

Jika identitas unik atau aturan pembaruan belum jelas, tentukan strategi berdasarkan migration dan model sebelum implementasi.

## 6. Pemisahan Data Pengembangan dan Produksi

Data demo hanya boleh digunakan di lingkungan pengembangan atau pengujian.

- Pisahkan seeder data demo dari seeder data wajib sistem.
- Jangan menjalankan data demo secara otomatis pada deployment produksi.
- Jangan menghapus atau mengganti data operasional yang sudah ada.
- Jangan menyimpan password atau kredensial sensitif dalam source code.
- Gunakan data fiktif untuk pelanggan, dokumen, dan transaksi demonstrasi.

## 7. Urutan Eksekusi

Urutan berikut merupakan urutan konseptual. Sesuaikan dengan dependensi yang ditemukan pada kode aktual.

1. Seeder referensi dasar.
2. Seeder role dan permission.
3. Seeder akun pengembangan.
4. Seeder master data.
5. Seeder transaksi demo.
6. Seeder persediaan melalui mekanisme domain yang sah, jika sudah tersedia.

Jika suatu kategori belum didukung skema atau implementasi, jangan memaksakan eksekusinya.

## 8. Verifikasi Sebelum Implementasi

Sebelum menulis atau mengubah kode seeder:

- Periksa migration dan constraint database.
- Periksa model, factory, relasi, enum, dan Service Layer yang tersedia.
- Periksa seeder yang sudah ada agar tidak menduplikasi fungsi.
- Pastikan dependensi seeder mengikuti urutan yang benar.
- Pastikan implementasi idempotent.
- Pastikan data demo tidak menghasilkan foreign key yang invalid.
- Pastikan tidak ada perubahan schema yang diperlukan.

Setelah implementasi:

- Jalankan pengujian pada database pengembangan atau pengujian.
- Jalankan seeder lebih dari sekali untuk memverifikasi idempotensi.
- Verifikasi jumlah record, relasi, serta konsistensi data.
- Pastikan tidak ada stok negatif atau mutasi persediaan yang melewati Service Layer.
- Laporkan seeder yang berhasil, seeder yang dilewati, serta dependensi yang belum tersedia.

Jangan menjalankan seeder terhadap database produksi.

## 9. Hal yang Belum Diputuskan

Hal-hal berikut tidak boleh dipaksakan melalui data demo sebelum struktur atau aturan bisnisnya tersedia:

- Detail konversi satuan pembelian menjadi satuan produksi.
- Kebijakan saldo awal dan penyesuaian stok.
- Aturan revisi dan pembatalan Sales Order.
- Aturan status serta penerbitan Work Order.
- Detail QC dan hubungan antara hasil produksi dengan barang jadi yang tersedia.
- Aturan pengurangan stok berdasarkan kejadian pengiriman fisik.
- Penggabungan beberapa Surat Jalan dalam satu invoice.
- Struktur pembayaran, pajak, diskon, dan termin penagihan.
- Kebijakan persetujuan dan otorisasi transaksi.

Dokumen ini menjadi pedoman awal seeding, bukan pengganti keputusan bisnis atau definisi skema database.