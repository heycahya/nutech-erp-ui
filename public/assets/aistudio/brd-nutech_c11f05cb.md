# BRD — NUTECH MINI-ERP
**PT Nutech Pundi Arta — Sistem Informasi Operasional Terintegrasi**
**Versi**: 3.0 | **Tanggal**: 18 Oktober 2026
**Status**: Living Document — Active Single Source of Truth

> **Catatan Label Status**:
> - **CONFIRMED** — Fakta operasional terkonfirmasi dari lapangan.
> - **CONFIRMED DESIGN DECISION** — Keputusan desain sistem yang telah disepakati.
> - **DESIGN ASSUMPTION** — Asumsi sementara untuk demo; wajib divalidasi sebelum go-live.
> - **OUT OF SCOPE** — Berada di luar ruang lingkup implementasi.
> - **TBD** — Belum diputuskan; dilarang diasumsikan sepihak.
> - **TECHNICAL CONSTRAINT** — Batasan arsitektur mutlak dari keputusan teknis.

---

## 1. Ringkasan Proyek

| Parameter | Detail |
| :--- | :--- |
| **Nama Proyek** | Nutech Mini-ERP (Integrated Manufacturing & Inventory System) |
| **Perusahaan** | PT Nutech Pundi Arta — Manufaktur komponen otomotif B2B berbahan karet, busa (foam), dan spons (EVA sponge) |
| **Tujuan Utama** | Single Source of Truth untuk 7 divisi; menggantikan proses manual Excel/kertas; tanpa biaya lisensi vendor ERP eksternal |
| **Deployment** | TBD (Kandidat: On-premise LAN Intranet pabrik atau VPS; berbasis Ubuntu Server & Docker Compose) |
| **Developer** | Single developer — prioritas RAD dengan Filament PHP |

### Masalah yang Dipecahkan

Seluruh proses saat ini berjalan manual (kertas/Excel per divisi, tanpa integrasi):
- Pelacakan status pesanan pelanggan lambat dan tidak real-time.
- Stok material dan barang jadi sering tidak akurat karena pencatatan terpisah.
- Distribusi informasi antar divisi via WhatsApp/fisik — rawan keterlambatan dan kesalahan.
- Penagihan invoice bulanan bergantung pada rekap manual Finance.

---

## 2. Ruang Lingkup

### 2.1 In Scope (Rilis Awal / MVP)

| Modul | Deskripsi |
| :--- | :--- |
| **Sales Order** | Input Customer PO, SO digital multi-part, need date, rutin/urgent, partial fulfillment |
| **PPIC & Planning** | SPK bulanan per lini, target harian per part dalam PCS, monitoring gap |
| **Purchasing** | Simulasi MRP (demo), PO Supplier, monitoring pengadaan |
| **Gudang Bahan Baku** | GRN penerimaan material, kartu stok ledger, Material Issue bertahap ke lini |
| **Produksi** | Input aktual harian oleh Admin Operasional, konversi pack ke PCS, pencatatan NG, gap on-the-fly |
| **Barang Jadi (FG Inventory)** | Stok FG multi-lokasi berbasis ledger; tidak wajib transit gudang |
| **Pengiriman & Surat Jalan** | 1 dokumen SJ resmi, cetak SJ, konfirmasi pengiriman yang memotong stok FG |
| **Kontrol SJ vs PO** | Verifikasi kumulatif pengiriman vs SO, status Matched / Exception |
| **Billing & Finance** | Invoice bulanan multi-SJ, payment tracking sederhana (AR monitoring) |
| **Dashboard Manajemen** | KPI produksi, stok, pengiriman, piutang — read-only untuk manajemen |

### 2.2 Out of Scope

Item dan area berikut berada di luar ruang lingkup implementasi:

- **Modul QC Digital** — QC Report digital, form 4M mandiri, deklarasi FG oleh akun QC berada di luar scope rilis ini agar lantai pabrik tidak terbebani.
- **Role Login Khusus QC** — Akun QC mandiri berada di luar scope; laporan QC fisik tetap berjalan AS-IS di kertas.
- **Pemisahan Role Admin Produksi & Pengiriman** — Saat ini dirangkap 1 orang, digabung ke `admin_operasional`; evaluasi jika ada penambahan personel di masa mendatang.
- **Formula MRP Eksak** — Menunggu penyerahan file Excel Purchasing Nutech untuk validasi formula riil; saat ini menggunakan formula simulasi demo.
- **HR/Payroll, presensi biometrik, rekrutmen**
- **Pembukuan akuntansi penuh (General Ledger, Neraca, Jurnal Penyesuaian)**
- **IoT / sensor mesin / SCADA**
- **Portal B2C / e-commerce pelanggan umum**
- **Payment gateway perbankan otomatis**

---

## 3. Alur Bisnis

### 3.1 AS-IS — Kondisi Saat Ini (Manual)

Order-to-Cash saat ini berjalan sepenuhnya manual:

```
[Pelanggan] --kirim PO (email/WA/fisik)--> [Marketing]
    |
    +--> [PPIC]: Buat SPK Excel per lini, distribusi target harian via papan/kertas
    |
    +--> [Purchasing]: Hitung kebutuhan bahan di Excel --> PO ke Supplier
              |
              v
         [Supplier] -> [Gudang Bahan Baku]: Catat penerimaan manual
                            |
                            v (Pengambilan bertahap, dicatat manual)
                       [Lantai Produksi]
                            |
                        Operator catat hasil kerja (kertas)
                        QC sortir fisik -> Laporan QC 4M (kertas terpisah)
                            |
                            v
                  [Admin Produksi]: Rekap laporan harian di komputer
                            |
                            v
            [Barang Jadi] -> [Admin Pengiriman (orang sama)]: Buat & cetak SJ
                            |
                    Barang diantar -> SJ ditandatangan pelanggan -> kembali
                            |
                            v
              [Finance]: Cocokkan SJ vs PO (manual Excel) -> Invoice Bulanan
                            |
                    Catat pembayaran masuk -> Pantau piutang di spreadsheet
```

**Fakta lapangan yang terkonfirmasi (CONFIRMED):**
- 1 Customer PO menghasilkan 1 Sales Order (multi-part, need date, rutin/urgent)
- SPK diterbitkan bulanan per lini produksi; bisa multi-part
- Target produksi resmi selalu dalam satuan **PCS** sejak awal bulan
- Operator menghitung dengan satuan pack/wadah; rasio pack-ke-PCS beda per lini per part
- Laporan QC dan Laporan Produksi adalah **dokumen fisik yang terpisah**
- Kuantitas FG **bukan** otomatis = Aktual minus NG; ditetapkan fisik oleh QC
- Bahan baku wajib masuk Gudang Bahan Baku dulu, baru diambil bertahap ke lini
- Admin Produksi dan Admin Pengiriman **dirangkap 1 orang staf yang sama**
- Hanya ada **1 dokumen Surat Jalan** resmi (tidak ada SJ terpisah untuk Admin vs Finance)
- Beberapa SJ digabung menjadi 1 Invoice tagihan bulanan per pelanggan

### 3.2 TO-BE — Alur Sistem Baru

```
[Pelanggan] --kirim PO--> [Marketing] -> Input di Modul Sales Order (SO digital)
                                |
              Data SO langsung terbaca PPIC & Purchasing di sistem
                                |
         +----------------------+----------------------+
         v (Paralel)                                   v (Paralel)
    [PPIC] (role: ppic)                        [Purchasing] (role: purchasing)
    Buat SPK Bulanan per Lane                  Simulasi MRP -> Terbitkan PO Supplier
    Set Target Harian per Part (PCS)                      |
    Target terkunci dari operator                          v
         |                                    [Supplier] -> Kirim material fisik
         |                                          |
         |                          [Gudang Bahan Baku] (role: warehouse)
         |                          Catat GRN -> Stok bahan baku bertambah
         |                          Otorisasi Material Issue bertahap ke lini
         |                                          |
         v                                          v
    [Lantai Produksi] <------- Material masuk ke lini kerja
    Operator kerja fisik, catat di kertas
    QC sortir fisik, isi Laporan QC 4M (kertas terpisah, AS-IS)
         |
         v
    [Admin Operasional] (role: admin_operasional) -- Modul Produksi
    Input laporan harian aktual (PCS / konversi dari pack)
    Input NG; Sistem hitung Gap = Target minus Aktual (tidak auto-cascade)
    Catat FG yang lolos QC fisik beserta lokasi simpan
         |
         v
    [Stok Barang Jadi] -- Ledger FG per lokasi (lane / Gudang FG)
         |
         v
    [Admin Operasional] (role: admin_operasional) -- Modul Pengiriman
    Terima DN pelanggan -> Buat 1 Surat Jalan -> Cetak
    [Saat SJ tercetak: stok FG BELUM berkurang]
    Barang dikirim -> SJ kembali ditandatangan pelanggan
    Klik "Konfirmasi Pengiriman" ->
    [BARU SAAT INI: Stok FG berkurang di ledger] -> Status SJ = Delivered
         |
         v
    [Sistem] Hitung kumulatif SJ Delivered vs SO -> Matched / Exception
         |
         v
    [Finance] (role: finance) -- Modul Billing
    Centang SJ berstatus Matched -> Generate 1 Invoice Bulanan
    Catat penerimaan pembayaran -> Status: Unpaid / Partially Paid / Paid / Overdue
         |
         v
    [Dashboard] (role: management) -- Pantau KPI real-time
```

---

## 4. Peran Pengguna & RBAC

### 4.1 Pemetaan Role Sistem

> **Prinsip**: Role sistem mengikuti tanggung jawab aktual staf, bukan nama jabatan. Hak akses digabungkan hanya jika beban kerja nyata dirangkap oleh staf yang sama.

| Role Sistem | Fungsi Bisnis | Modul Utama | Status |
| :--- | :--- | :--- | :--- |
| `marketing` | Divisi Komersial | Sales Order: input PO, buat SO, pantau status | CONFIRMED |
| `ppic` | Divisi Perencanaan | SPK Bulanan, Target Harian PCS, Monitoring Gap | CONFIRMED |
| `purchasing` | Divisi Pengadaan | Simulasi MRP, PO Supplier, monitoring pengadaan | CONFIRMED |
| `warehouse` | Admin Gudang Bahan Baku | GRN penerimaan material, kartu stok, Material Issue bertahap | CONFIRMED |
| `admin_operasional` | Admin Produksi **dan** Admin Pengiriman (1 orang rangkap) | **Modul Produksi**: input aktual, NG, FG. **Modul Pengiriman**: Surat Jalan, konfirmasi pengiriman. (2 modul terpisah, 1 role) | CONFIRMED DESIGN DECISION |
| `finance` | Divisi Keuangan | Billing Invoice bulanan, Payment Tracking, piutang AR | CONFIRMED |
| `management` | Direksi / Manajer | Executive Dashboard — read-only, tidak menginput data | CONFIRMED |

### 4.2 Aktor Tanpa Akun Login

| Aktor | Alasan | Status |
| :--- | :--- | :--- |
| **Operator Lini Produksi** | Bekerja fisik di lantai pabrik; input ke sistem dilakukan Admin Operasional berdasarkan rekap fisik | CONFIRMED DESIGN DECISION |
| **Petugas QC** | Modul digital QC berada di luar scope; laporan QC fisik tetap berjalan AS-IS di kertas | OUT OF SCOPE |
| **Supervisor Produksi** | Belum ada keputusan apakah perlu akun mandiri atau cukup `admin_operasional` | TBD |

### 4.3 Aturan RBAC

| Rule ID | Aturan | Status |
| :--- | :--- | :--- |
| BR-ROL-01 | Role sistem tidak dibuat semata-mata karena nama jabatan atau nama formulir berbeda | CONFIRMED DESIGN DECISION |
| BR-ROL-02 | Role `admin_operasional` menggabungkan hak akses Produksi dan Pengiriman karena dirangkap 1 staf | CONFIRMED DESIGN DECISION |
| BR-ROL-03 | Penggabungan role tidak boleh menyatukan domain data, alur transaksi, atau batas logika bisnis antara Modul Produksi dan Modul Pengiriman | TECHNICAL CONSTRAINT |
| BR-ROL-04 | Role `warehouse` hanya mencakup Gudang Bahan Baku; pengelolaan SJ dan konfirmasi pengiriman FG ada di `admin_operasional` | CONFIRMED DESIGN DECISION |
| BR-ROL-05 | Konfigurasi final seluruh role wajib divalidasi manajemen sebelum Filament Shield dikunci di production | TBD |

---

## 5. Aturan Bisnis

### 5.1 Sales Order & Komersial

| Rule ID | Aturan | Status |
| :--- | :--- | :--- |
| BR-SO-01 | 1 Customer PO menghasilkan 1 Sales Order internal (multi-part / multi-line item) | CONFIRMED |
| BR-SO-02 | SO adalah induk transaksi untuk seluruh alur downstream | CONFIRMED |
| BR-SO-03 | Sistem mendukung partial fulfillment: pengiriman & penagihan bertahap tanpa membatalkan sisa order | CONFIRMED |
| BR-SO-04 | Pesanan diklasifikasikan: Rutin Bulanan atau Urgent | CONFIRMED |
| BR-SO-05 | Need date (tanggal kebutuhan pelanggan) adalah atribut krusial untuk prioritas produksi | CONFIRMED |
| BR-SO-06 | Status progres SO dikelola terpisah: status produksi, pengiriman, dan billing tidak disatukan | CONFIRMED |
| BR-SO-07 | Wewenang approval resmi untuk pesanan urgent | TBD |
| BR-SO-08 | Prosedur approval SO sebelum data mengalir ke PPIC & Purchasing | TBD |
| BR-SO-09 | Kapan harga satuan diinput: saat SO dibuat oleh Marketing, atau saat Invoice oleh Finance | TBD |

### 5.2 Perencanaan Produksi & SPK

| Rule ID | Aturan | Status |
| :--- | :--- | :--- |
| BR-SPK-01 | SPK diterbitkan bulanan per lini produksi (lane); bisa memuat multi-part | CONFIRMED |
| BR-SPK-02 | Lini produksi umumnya mengerjakan part yang relatif tetap, tapi tidak terkunci mutlak | CONFIRMED |
| BR-SPK-03 | Target produksi resmi selalu dalam satuan PCS | CONFIRMED |
| BR-SPK-04 | PPIC menetapkan target harian per lane per part dalam PCS sejak awal bulan | CONFIRMED |
| BR-SPK-05 | Staf lini / operator tidak bisa mengubah angka target yang telah ditetapkan PPIC | CONFIRMED |
| BR-SPK-06 | Relasi database SPK ke Sales Order: 1:1 atau N:1 | TBD |
| BR-SPK-07 | Pihak yang berwenang menyetujui SPK sebelum aktif di lantai | TBD |
| BR-SPK-08 | Prosedur jika pesanan urgent masuk di pertengahan bulan dan target sudah dikunci | TBD |

### 5.3 Pelaporan Produksi Harian

| Rule ID | Aturan | Status |
| :--- | :--- | :--- |
| BR-PR-01 | Gap = Target minus Aktual, dihitung on-the-fly; tidak disimpan sebagai nilai statis | CONFIRMED |
| BR-PR-02 | Gap hari ini tidak otomatis ditambahkan ke target hari berikutnya | CONFIRMED |
| BR-PR-03 | Target harian berikutnya tetap mengacu pada rencana awal PPIC | CONFIRMED |
| BR-PR-04 | Operator menghitung dengan satuan pack; Admin input pack dan sistem konversi ke PCS | CONFIRMED |
| BR-PR-05 | Rasio konversi pack-to-PCS dikonfigurasi per lini per part (tidak ada rasio global pabrik) | CONFIRMED |
| BR-PR-06 | Laporan produksi harian dapat memuat aktual untuk banyak part sekaligus | CONFIRMED |
| BR-PR-07 | Temuan NG (barang cacat) di lini dapat dicatat dalam laporan harian | CONFIRMED |
| BR-PR-08 | Downtime lini, kategori standar: Dies Changeover, Blade Sharpening, Machine Repair, Power Outage | DESIGN ASSUMPTION |
| BR-PR-09 | Frekuensi input: per shift atau per penutupan hari kerja | TBD |
| BR-PR-10 | Standarisasi dropdown alasan gap/deviasi, atau tetap free text | TBD |
| BR-PR-11 | Mekanisme lock laporan harian dan verifikasi Supervisor Produksi | TBD |

### 5.4 Quality Control & Barang Jadi (FG)

| Rule ID | Aturan | Status |
| :--- | :--- | :--- |
| BR-QC-01 | Laporan Produksi dan Laporan QC adalah dokumen fisik terpisah; tidak boleh disatukan | CONFIRMED |
| BR-QC-02 | Kuantitas FG bukan hasil otomatis (Aktual minus NG); dinyatakan dan disahkan fisik oleh QC | CONFIRMED |
| BR-QC-03 | Modul digital QC Report dan role login QC berada di luar scope; laporan QC fisik 4M tetap AS-IS di kertas | OUT OF SCOPE |
| BR-QC-04 | FG tidak wajib transit ke gudang; bisa disimpan di ujung lini (lane) atau Gudang FG | CONFIRMED |
| BR-QC-05 | Pengiriman bisa mengambil barang langsung dari lini tanpa harus lewat gudang | CONFIRMED |
| BR-QC-06 | Minimal atribut stok FG: Part, Qty, Lokasi Fisik, Status Stok | CONFIRMED |
| BR-QC-07 | Standarisasi definisi status stok FG (misal: Available, Allocated, Shipped) | TBD |
| BR-QC-08 | Prosedur rework produk sebelum verifikasi mutu final | TBD |
| BR-QC-09 | Pihak yang berwenang melakukan koreksi atau pembatalan status barang jadi di sistem | TBD |

### 5.5 Material & Gudang Bahan Baku

| Rule ID | Aturan | Status |
| :--- | :--- | :--- |
| BR-MAT-01 | Seluruh material supplier wajib masuk Gudang Bahan Baku terlebih dahulu (GRN), tidak langsung ke lini | CONFIRMED |
| BR-MAT-02 | Pengambilan bahan baku dilakukan bertahap per kebutuhan lini; 1 SPK bisa banyak kali Material Issue | CONFIRMED |
| BR-MAT-03 | Setiap pengambilan bahan wajib diawasi & diotorisasi oleh Admin Gudang Bahan Baku | CONFIRMED |
| BR-MAT-04 | Sistem HARUS mengonversi satuan beli (Roll, Sheet, Kg) ke satuan produksi (Pcs) dan limbah (Kg Scrap) | TECHNICAL CONSTRAINT |
| BR-MAT-05 | 1 nomor part bisa tersusun dari beberapa jenis material bahan baku (multi-material BOM) | CONFIRMED |
| BR-MAT-06 | Formula MRP simulasi demo: Net Req = (Std Consumption x Target Qty) + Scrap Allowance minus Available Stock | DESIGN ASSUMPTION |
| BR-MAT-07 | Formula MRP riil di Excel (validasi proses aktual; formula eksak tetap Out of Scope untuk MVP dan menggunakan simulasi BR-MAT-06) | TBD |
| BR-MAT-08 | Nilai riil standard consumption per part dan scrap allowance aktual PT Nutech | TBD |
| BR-MAT-09 | Approval PO Supplier oleh Direktur/Manajer sebelum dikirim ke supplier | TBD |
| BR-MAT-10 | Formulir fisik bon permintaan bahan baku dari lantai produksi | TBD |

### 5.6 Pengiriman & Surat Jalan

| Rule ID | Aturan | Status |
| :--- | :--- | :--- |
| BR-DEL-01 | Hanya ada 1 dokumen Surat Jalan resmi (tidak ada pemisahan SJ Admin vs SJ Finance) | CONFIRMED |
| BR-DEL-02 | Barang yang dikirim bisa bersumber dari lini kerja atau Gudang FG | CONFIRMED |
| BR-DEL-03 | Status SJ Draft — TIDAK memotong stok FG | CONFIRMED DESIGN DECISION |
| BR-DEL-04 | Status SJ Printed (Tercetak) — TIDAK memotong stok FG | CONFIRMED DESIGN DECISION |
| BR-DEL-05 | Stok FG berkurang HANYA saat barang benar-benar keluar fisik pabrik dan Admin menekan Konfirmasi Pengiriman | CONFIRMED DESIGN DECISION |
| BR-DEL-06 | Konfirmasi pengiriman dilakukan Admin Operasional setelah SJ fisik kembali bertanda tangan pelanggan | CONFIRMED DESIGN DECISION |
| BR-DEL-07 | Pihak yang bertanggung jawab mengunduh/menerima DN (Delivery Note) dari pelanggan (dibedakan dari Surat Jalan resmi Nutech) | TBD |
| BR-DEL-08 | Prosedur penanganan retur barang dari pelanggan | TBD |
| BR-DEL-09 | Jumlah rangkap cetak SJ fisik (arsip Nutech, pelanggan, supir) | TBD |

### 5.7 Verifikasi Pengiriman (Kontrol SJ vs PO)

| Rule ID | Aturan | Status |
| :--- | :--- | :--- |
| BR-CTL-01 | Verifikasi dilakukan setelah pengiriman Delivered dan sebelum proses billing | CONFIRMED |
| BR-CTL-02 | Perhitungan wajib berbasis kumulatif (bukan 1 SJ vs 1 PO) karena partial delivery | CONFIRMED |
| BR-CTL-03 | Status hasil verifikasi: Matched (lolos, bisa ditagihkan) atau Exception (ada deviasi) | CONFIRMED |
| BR-CTL-04 | Logika Matched untuk demo: kumulatif kirim <= kuantitas PO dan part number sesuai | DESIGN ASSUMPTION |
| BR-CTL-05 | Penanggung jawab resmi yang mengeksekusi dan mengesahkan verifikasi SJ vs PO | TBD |
| BR-CTL-06 | Prosedur resolusi jika status Exception (revisi PO? ditagih terpisah? barang kembali?) | TBD |

### 5.8 Billing & Finance

| Rule ID | Aturan | Status |
| :--- | :--- | :--- |
| BR-BIL-01 | Penagihan ke pelanggan dilakukan secara bulanan | CONFIRMED |
| BR-BIL-02 | Beberapa SJ Matched untuk pelanggan & periode yang sama digabung menjadi 1 Invoice | CONFIRMED |
| BR-BIL-03 | Aturan 1 SJ = 1 Invoice tidak berlaku di PT Nutech Pundi Arta | CONFIRMED |
| BR-BIL-04 | Default: 1 Invoice per pelanggan per bulan kalender | DESIGN ASSUMPTION |
| BR-BIL-05 | Status pembayaran: Unpaid, Partially Paid, Paid; jika melewati jatuh tempo: Overdue | CONFIRMED |
| BR-BIL-06 | Sistem hanya AR tracking sederhana; bukan pembukuan GL/jurnal akuntansi | CONFIRMED |
| BR-BIL-07 | Termin pembayaran standar Invoice | TBD |
| BR-BIL-08 | Prosedur approval bertingkat sebelum Invoice dikirim ke pelanggan | TBD |
| BR-BIL-09 | Format penomoran dan kelengkapan field Invoice resmi PT Nutech | TBD |

---

## 6. Persyaratan Fungsional

| Kode | Fitur | Prioritas | Role |
| :--- | :--- | :--- | :--- |
| F-01 | **Sales Order Management** — Input Customer PO, SO multi-line item, need date, rutin/urgent, partial fulfillment, pemisahan status downstream | Must Have | `marketing` |
| F-02 | **SPK & Production Planning** — SPK bulanan per lane, target harian per part dalam PCS, terkunci dari operator | Must Have | `ppic` |
| F-03 | **Production Reporting** — Input aktual harian per lane (PCS/pack konversi), NG lini, Gap on-the-fly, tidak auto-cascade | Must Have | `admin_operasional` |
| F-04 | **FG Inventory Multi-Lokasi** — Stok FG berbasis ledger per lokasi fisik (lane, Gudang FG), riwayat perpindahan; saldo masuk dicatat Admin Operasional | Must Have | `admin_operasional` |
| F-05 | **Simulasi MRP (Demo)** — Estimasi kebutuhan bahan: Planned Req + Scrap minus Available Stock = Net Req, konversi UoM ke PO Supplier | Must Have | `purchasing` |
| F-06 | **Gudang Bahan Baku & Purchasing** — GRN material via ledger, kartu stok, zero negative stock | Must Have | `purchasing`, `warehouse` |
| F-07 | **Material Issue Bertahap** — Pengeluaran bahan ke lini secara bertahap, diotorisasi Admin Gudang; 1 SPK tidak sama dengan 1 kali issue | Must Have | `warehouse` |
| F-08 | **Pengiriman & Surat Jalan** — 1 dokumen SJ resmi, fungsi cetak dokumen fisik Surat Jalan resmi, konfirmasi pengiriman yang memotong stok FG di ledger hanya saat Delivered | Must Have | `admin_operasional` |
| F-09 | **Verifikasi SJ vs PO** — Agregasi otomatis cumulative delivery vs SO, status Matched / Exception | Must Have | `finance` / TBD |
| F-10 | **Billing Bulanan Multi-SJ** — Gabung SJ Matched menjadi 1 Invoice per pelanggan per periode | Must Have | `finance` |
| F-11 | **Payment Tracking Sederhana** — Status pelunasan: Unpaid, Partially Paid, Paid, Overdue; saldo piutang AR; tanpa GL | Must Have | `finance` |
| F-12 | **Dashboard Manajemen** — KPI produksi, stok material & FG, pengiriman, AR — real-time, read-only | Should Have | `management` |
| F-13 | **Stock Adjustment** — Koreksi saldo via ledger dengan alasan wajib; dibatasi permission khusus | Should Have | `warehouse`, `admin_operasional` |
| F-14 | **Master Pack Conversion** — Konfigurasi rasio pack-to-PCS per lini per part | Should Have | `ppic`, `admin_operasional` |
| F-15 | **Pelaporan Shortage Material** — Input kekurangan bahan secara fleksibel lintas bagian; memicu tindak lanjut Purchasing | Should Have | Lintas modul |
| F-16 | **Ekspor Dokumen Umum** — Ekspor laporan/data ke format PDF/Excel umum lintas modul (di luar fungsi cetak fisik SJ resmi pada F-08) | Could Have | Semua modul |
| F-17 | **QC Report Digital** — Form QC digital, analisis 4M, deklarasi FG oleh akun QC | OUT OF SCOPE | — |

---

## 7. Persyaratan Non-Fungsional

| Kode | Kategori | Spesifikasi |
| :--- | :--- | :--- |
| NFR-01 | **Performa** | Response time transaksi <= 2 detik pada jaringan operasional (LAN intranet pabrik / akses stabil ke host) |
| NFR-02 | **Integritas Inventory** | Integritas persediaan mutlak dengan transaksi ACID dan larangan saldo negatif (*zero negative stock*). Pola teknis penjamin konsistensi (transaksi DB, locking, layering) wajib diimplementasikan sesuai keputusan arsitektur (Section 8.2). |
| NFR-03 | **Keamanan RBAC** | Auth & otorisasi via Filament Shield. 7 role sistem; operator & QC tanpa akun. |
| NFR-04 | **Audit Trail** | Tabel `inventory_movements` dan `fg_inventory_movements` bersifat append-only. Setiap baris wajib menyimpan: `user_id`, `created_at`, `movement_type`, `reference_type`, `reference_id`, `qty`, `notes`. |
| NFR-05 | **Availability** | Sistem tersedia penuh saat jam kerja pabrik. DB dikonfigurasi `innodb_flush_log_at_trx_commit = 1`. Backup otomatis harian ke storage eksternal. |

**KPI Keberhasilan:**

| KPI | Target |
| :--- | :--- |
| Waktu perekaman laporan produksi | <= 2 jam setelah shift/hari kerja berakhir |
| Akurasi stok (stock opname) | Selisih fisik vs sistem < 0,5% |
| Kebenaran Invoice | 0% kesalahan kuantitas |
| Response time sistem | <= 2 detik pada jaringan akses operasional |
| Ketertelusuran dokumen | 100% dapat ditelusuri ke SO asal |

---

## 8. Arsitektur & Tech Stack

### 8.1 Tech Stack

#### Teknologi Inti (Core Stack)

| Komponen | Pilihan | Versi / Spesifikasi | Keterangan |
| :--- | :--- | :--- | :--- |
| **Backend Framework** | Laravel | 13.x | Framework aplikasi monolitik utama |
| **Runtime Environment** | PHP | 8.3+ | Runtime CLI dan PHP-FPM |
| **Admin Panel & UI** | Filament PHP | 5.x (Livewire, Tailwind CSS) | Presentation layer & CRUD admin generator |
| **Database Utama** | MySQL | 8.4 LTS | RDBMS utama dengan dukungan transaksi ACID |
| **RBAC Engine** | Filament Shield & Spatie Laravel Permission | Versi kompatibel Filament 5.x & Spatie Permission v6.x | Pengelolaan role, permission, dan policy Filament |
| **Automated Testing** | Pest (PHPUnit Engine) | Pest v3.x | Framework testing standar ekosistem Laravel |
| **Web Server / Reverse Proxy** | Nginx | Stable | Reverse proxy & web server PHP-FPM |
| **Containerization** | Docker & Docker Compose | Compose v2 | Standarisasi runtime dan deployment aplikasi (baik opsi on-premise maupun VPS) |
| **Server OS** | Ubuntu Server | 24.04 LTS | OS host server (baik server lokal pabrik maupun host VPS) |
| **Version Control** | Git | 2.x | Pelacakan versi kode sumber |
| **Remote Repository** | GitHub | Cloud Private Repository | Manajemen repositori kode terpusat |
| **Keamanan / HTTPS** | TLS | TLS 1.2 / 1.3 | Enkripsi jalur komunikasi web server |
| **Backup Sistem** | Automated Backup Script | Terjadwal | Backup berkala database dan file penting ke media penyimpanan terpisah |

#### Komponen Pendukung & Opsional

| Komponen | Pilihan | Status | Keterangan |
| :--- | :--- | :--- | :--- |
| **Cache & Queue Driver** | Redis | 7.x (Opsional / Sesuai Kebutuhan) | Digunakan sesuai kebutuhan jika beban antrean background jobs atau cache transaksi memerlukan in-memory store |
| **CI/CD Pipeline** | GitHub Actions | Opsional (Tahap Awal) | Otomasi pengujian/linting; tidak menjadi blocker untuk tahap awal rilis |

### 8.2 Pola Arsitektur (TBD — Belum Diputuskan)

Penetapan pola arsitektur internal aplikasi saat ini berstatus **TBD (Belum Diputuskan)**. Keputusan mengenai pola dan struktur arsitektur sistem akan dibahas serta disepakati secara resmi setelah seluruh kebutuhan bisnis, aturan bisnis (*business rules*), alur transaksi antar-bagian, dan batas tanggung jawab setiap domain tervalidasi secara lengkap bersama tim dan pemangku kepentingan.

**Prinsip Kebutuhan Inti:**
Meskipun pola arsitektur belum ditetapkan, sistem tetap berpegang pada prinsip kebutuhan mendasar ERP bahwa **konsistensi transaksi dan integritas data persediaan (inventory & finished goods) adalah kebutuhan mutlak** yang harus dijamin dalam desain sistem nantinya. Namun, implementasi teknisnya tidak ditetapkan sebelum keputusan arsitektur dibuat.

**Detail Teknis yang Ditunda Pembahasannya:**
Detail implementasi berikut ditunda sampai pembahasan dan keputusan arsitektur resmi dilakukan:
1. **Struktur direktori dan pembagian domain** (termasuk pengorganisasian kode sumber dan batasan domain).
2. **Penempatan business logic** pada Service Classes atau pola lapisan logika bisnis lainnya.
3. **Batas tanggung jawab Filament Resources** sebagai presentation layer.
4. **Mekanisme mutasi inventory dan finished goods**, termasuk implementasi ledger service, database transaction, dan row locking.
5. **Mekanisme komunikasi antar-domain** melalui service layer, domain events, atau mekanisme lainnya.

### 8.3 Konsep Model Data Utama

```sql
-- DOMAIN: Sales
sales_orders: id, customer_id, po_number, order_type(rutin/urgent), need_date,
              status_production, status_delivery, status_billing, created_by
sales_order_items: id, so_id, part_id, qty_ordered, unit_price[TBD],
                   qty_delivered, qty_billed

-- DOMAIN: Planning
spk: id, lane_id, bulan, tahun, so_id[nullable -- relasi TBD: 1:1 atau N:1], status
production_targets: id, spk_id, lane_id, part_id, target_date, target_qty_pcs

-- DOMAIN: Production
production_actuals: id, lane_id, part_id, actual_date, actual_qty_pcs, ng_qty,
                    reason, input_by(admin_operasional)
-- [Modul QC di luar scope: qc_reports, qc_fg_declarations]

-- DOMAIN: Inventory FG (Barang Jadi)
fg_inventory_movements: id, item_id, location_id, movement_type(in/out/transfer/adj),
                         qty, reference_type, reference_id, user_id, notes, created_at
                         -- append-only ledger; jaminan konsistensi transaksi; larangan saldo negatif (zero negative stock)
fg_inventory_stocks: id, item_id, location_id, qty_on_hand
                     -- multi-lokasi: lane, fg_warehouse, transit

-- DOMAIN: Inventory Material (Bahan Baku)
inventory_movements: id, material_id, location_id, movement_type(in/out/adj),
                     qty, reference_type(grn/material_issue/adj),
                     reference_id, user_id, notes, created_at
inventory_stocks: id, material_id, location_id, qty_on_hand
material_issues: id, lane_id, spk_id[opsional], issue_date,
                 authorized_by(warehouse), issued_to, notes
material_issue_items: id, material_issue_id, material_id, qty_issued, uom_id

-- DOMAIN: Purchasing
purchase_orders: id, supplier_id, po_number, po_date, status, created_by
purchase_order_items: id, po_id, material_id, qty_ordered, uom_id, qty_received
goods_receipt_notes: id, po_id, supplier_id, grn_number, receipt_date,
                     received_by(warehouse), warehouse_location_id
goods_receipt_note_items: id, grn_id, po_item_id, material_id, qty_received, uom_id

-- DOMAIN: Delivery
delivery_orders: id, customer_id, sj_number, delivery_date,
                 status(draft/printed/delivered),
                 control_status(pending/matched/exception),
                 created_by(admin_operasional), confirmed_by, confirmed_at
                 -- stok FG berkurang HANYA saat status = delivered
delivery_order_items: id, do_id, so_item_id, part_id, qty_shipped,
                      fg_source_location_id

-- DOMAIN: Billing
invoices: id, customer_id, invoice_number, period_month, period_year,
          total_amount, status, created_by(finance)
invoice_delivery_orders: id, invoice_id, do_id  -- multi-SJ ke 1 Invoice
invoice_items: id, invoice_id, do_item_id, part_id, qty, unit_price, subtotal

-- DOMAIN: Finance
payment_records: id, invoice_id, payment_date, amount_paid, notes, recorded_by(finance)
```

### 8.4 Master Data yang Diperlukan

| Entitas | Atribut Kunci |
| :--- | :--- |
| Customer | ID, Kode, Nama Perusahaan, Alamat, Kontak, Terms Pembayaran |
| Part / Item | ID, Nomor Part, Deskripsi, Satuan Resmi (PCS) |
| Lane / Lini Kerja | ID, Kode Lini, Nama, Kapasitas |
| Pack Conversion | Lane ID, Part ID, Jumlah PCS per Pack |
| Material | ID, Kode, Nama Bahan Baku, Satuan Beli (Roll/Sheet/Kg), Satuan Pakai |
| Standard BOM | Part ID, Material ID, Kebutuhan per PCS — DESIGN ASSUMPTION (placeholder demo) |
| Scrap Allowance | Part ID, Material ID, Toleransi Cacat (%) — DESIGN ASSUMPTION (placeholder demo) |
| Supplier | ID, Kode, Nama, Kontak, Alamat, Termin |
| UoM | PCS, Pack, Roll, Sheet, Kg, Meter |
| Location | ID, Kode, Tipe (Bahan Baku / Lini / Gudang FG / Transit) |

---

## 9. Batasan Sistem

### 9.1 Batasan Teknis
- Model hosting dan deployment sistem masih dalam pembahasan (TBD); VPS merupakan salah satu kandidat model hosting yang sedang dipertimbangkan di samping opsi on-premise, tanpa penetapan provider, spesifikasi server, atau layanan berbayar tertentu sebagai keputusan final saat ini.
- Integritas data persediaan mutlak dijaga dengan larangan saldo stok bernilai negatif (*zero negative stock*).
- Menjamin keamanan dan konsistensi transaksi data persediaan (ACID); mekanisme dan pola implementasi teknis spesifik tidak ditetapkan sebelum ada keputusan arsitektur resmi.

### 9.2 Batasan Bisnis
- Modul digital QC (laporan digital, form 4M, deklarasi FG) dan role login khusus QC berstatus Out of Scope (laporan QC fisik tetap berjalan AS-IS di kertas).
- Pemisahan role Admin Produksi dan Admin Pengiriman berstatus Out of Scope (tetap dirangkap 1 akun `admin_operasional`).
- Formula MRP eksak berbasis file Excel Purchasing berstatus Out of Scope (menggunakan formula simulasi kebutuhan demo).
- Tidak mencakup HR/Payroll, presensi biometrik, dan rekrutmen.
- Tidak mencakup pembukuan akuntansi umum (GL, Neraca, Jurnal Penyesuaian, Arus Kas).
- Tidak mengintegrasikan IoT / sensor mesin pabrik / SCADA.
- Tidak ada portal mandiri / e-commerce untuk supplier atau pelanggan umum (B2C).
- Tidak mencakup integrasi payment gateway perbankan otomatis.

### 9.3 Asumsi Kontekstual
- Komputer di kantor dan stasiun kerja terhubung stabil ke jaringan lokal / internet untuk mengakses sistem (merupakan asumsi operasional, bergantung pada keputusan akhir model hosting on-premise vs VPS).
- Data BOM (standard consumption) dan scrap allowance merupakan asumsi perancangan (*DESIGN ASSUMPTION*) untuk demo; data riil wajib divalidasi dan diinput sebelum go-live.
- Rasio konversi pack-to-PCS diasumsikan dikonfigurasi dinamis per lini per part di master data.

---

## 10. Risiko

| Risiko | Dampak | Mitigasi |
| :--- | :--- | :--- |
| Ketergantungan satu personel pada `admin_operasional` | Tinggi | UI form dibuat ringkas; dokumentasi SOP jelas untuk delegasi |
| Modul QC di luar scope berisiko menyebabkan deviasi data FG | Sedang | Form serah terima fisik FG wajib diparaf pengawas mutu sebelum Admin input ke sistem |
| Gangguan listrik / kerusakan server lokal | Kritis | UPS server; `innodb_flush_log_at_trx_commit = 1`; backup harian otomatis ke storage eksternal |
| Selisih stok fisik vs catatan sistem | Tinggi | Jaminan transaksi ACID dan larangan saldo negatif (*zero negative stock*) dengan pola teknis penjamin konsistensi sesuai arsitektur (Section 8.2); Stock Adjustment bersyarat dengan audit trail |
| TBD menggantung terlalu lama | Sedang | Design Assumption fleksibel digunakan sementara; daftar TBD ditinjau rutin bersama manajemen |
| Timeline proyek belum punya baseline baru | Tinggi | Lakukan audit progres riil (cek repo & server pabrik), lalu tetapkan tanggal cut-off bersama manajemen |

---

## 11. Open Questions (TBD)

Butir-butir berikut **belum memiliki keputusan resmi**. Tim pengembang **dilarang** mengubah TBD menjadi keputusan final tanpa validasi tertulis dari manajemen.

### Prioritas Tinggi — Sprint Blocker

| ID | Pertanyaan | Tindakan Sementara | Komponen Terdampak |
| :--- | :--- | :--- | :--- |
| TBD-01 | Validasi final pemetaan seluruh role sistem sebelum Filament Shield dikunci | Gunakan pemetaan Section 4 sebagai Design Decision sementara | RBAC, Policies |
| TBD-02 | Trigger pemotongan stok FG: saat truk berangkat atau saat SJ bertandatangan kembali ke kantor? | Diasumsikan: konfirmasi saat SJ kembali bertandatangan (Opsi B) | Modul Pengiriman, Mutasi Stok FG |
| TBD-03 | Mekanisme serah terima fisik FG dari QC ke Admin Operasional (modul QC di luar scope) | Admin input berdasarkan bukti fisik QC; form serah terima diparaf supervisor | Modul Produksi, FG Inventory |
| TBD-04 | Baseline jadwal revisi proyek: tanggal cut-off baru dan target go-live resmi | Semua milestone TBD; tidak mengarang tanggal baru | Master schedule |

### Prioritas Sedang — Perlu Sebelum UAT

| ID | Pertanyaan | Tindakan Sementara |
| :--- | :--- | :--- |
| TBD-05 | Relasi database SPK ke SO: 1:1 atau N:1 (satu SPK bisa lintas PO pelanggan)? | Field `spk.so_id` dibuat nullable |
| TBD-06 | Formula MRP eksak Purchasing di Excel (ada variabel tambahan selain Std BOM x Target?) | Formula simulasi demo tetap digunakan untuk MVP; pengumpulan Excel bertujuan memahami proses riil tanpa otomatis memasukkan formula riil ke scope MVP |
| TBD-07 | Format template, penomoran, dan rangkap cetak Surat Jalan resmi Nutech | Format industri standar sementara |
| TBD-08 | Format, penomoran, dan field Invoice resmi PT Nutech | Penomoran otomatis standar sementara |
| TBD-09 | Penanggung jawab resmi verifikasi SJ vs PO (Finance, Marketing, atau Admin Pengiriman?) | Finance memverifikasi daftar Matched sebelum Invoice |
| TBD-10 | Prosedur penyelesaian Exception (over-delivery): revisi PO? ditagih terpisah? retur? | SJ Exception diblokir dari billing hingga diselesaikan |
| TBD-11 | Wewenang approval urgent SO sebelum PPIC & Purchasing mulai bekerja | Urgent diinput langsung dengan flag; tanpa approval digital di sistem |
| TBD-12 | Approval PO Supplier: perlu tanda tangan Direktur sebelum dikirim? | PO diterbitkan langsung oleh Purchasing |
| TBD-13 | Frekuensi input produksi: per shift atau per hari? | Form support input per tanggal (fleksibel) |
| TBD-14 | Termin pembayaran standar Invoice (misal: 30 hari kalender) | TBD |
| TBD-15 | Nilai riil standard BOM dan scrap allowance per part | Estimasi placeholder demo |

### Prioritas Rendah — Polishing

| ID | Pertanyaan | Tindakan Sementara |
| :--- | :--- | :--- |
| TBD-16 | Standarisasi dropdown alasan gap/downtime produksi atau tetap free text? | Free text untuk demo |
| TBD-17 | Ambang batas minimum stok bahan baku (safety stock) per material | Belum dikonfigurasi |
| TBD-18 | Istilah baku tanda terima pelanggan (pernah disebut THF/TEH di lapangan; dibedakan konteksnya dari Surat Jalan resmi Nutech dan DN pelanggan) | Sementara diasumsikan: "Tanda Terima Pengiriman / Delivery Receipt"; terminologi resmi menunggu konfirmasi |
| TBD-19 | Format penomoran SO dan SPK (ada standar kode bulan/departemen?) | Penomoran otomatis sistem |

---

## 12. Fase Rilis

| Fase | Scope | Status Timeline |
| :--- | :--- | :--- |
| **Rilis Awal (MVP)** | Fitur F-01 s/d F-15 (Must Have & Should Have, termasuk cetak Surat Jalan resmi pada F-08); Fitur F-16 (Ekspor Dokumen Umum - Could Have) [TBD — status penyertaan dalam MVP] — lihat Section 6 | TBD — perlu re-baselining jadwal bersama manajemen |

> **Catatan Scope & Timeline**:
> - Seluruh fitur yang berstatus **Out of Scope** (termasuk Modul QC Digital, Role Login Khusus QC, Pemisahan Role Admin Operasional, Formula MRP Eksak, dan Penanganan Retur Terpadu) tidak dijadwalkan ke dalam fase rilis berikutnya.
> - Jadwal awal proyek belum terverifikasi progres riilnya. Seluruh target milestone dan tanggal go-live berstatus TBD hingga audit progres dan re-baselining disepakati bersama manajemen.

---

## 13. Panduan untuk AI Coding Agent

Bagian ini adalah instruksi permanen untuk AI coding agent yang membantu implementasi sistem.

**Prinsip wajib:**
1. **JANGAN** menyarankan paket ERP vendor eksternal atau memaksakan provider/layanan cloud berbayar tertentu; model hosting (on-premise vs VPS) berstatus TBD dan mengikuti keputusan resmi manajemen.
2. **PISAHKAN** logika bisnis dan mutasi persediaan dari presentation layer (Filament Resources); detail pola arsitektur dan struktur lapisan logika bisnis mengikuti keputusan resmi arsitektur (Section 8.2).
3. **WAJIB MENJAMIN** konsistensi transaksi (ACID) dan integritas data persediaan pada setiap mutasi stok; mekanisme penjamin konsistensi (seperti transaksi DB dan locking) diimplementasikan sesuai keputusan arsitektur (Section 8.2).
4. **JANGAN** buat stok bernilai negatif (*zero negative stock*) — validasi mutlak sebelum setiap mutasi.
5. **PERTAHANKAN** batas tanggung jawab dan isolasi modul Produksi dan Pengiriman secara domain data dan alur transaksi, meskipun keduanya diakses role `admin_operasional` yang sama.
6. **Jika ada yang TBD** di dokumen ini — gunakan Design Assumption yang sudah tercantum sebagai fallback; jangan mengarang keputusan baru.
7. **Saat implementasi mengubah keputusan bisnis penting**, update dokumen ini.

**Tech stack ringkas (mengacu Section 8.1):** Laravel 13.x | PHP 8.3+ | Filament PHP 5.x (Livewire, Tailwind CSS) | MySQL 8.4 LTS | Pest v3.x | Nginx | Docker & Docker Compose v2 | Ubuntu Server 24.04 LTS | Filament Shield & Spatie Permission | Redis 7.x (opsional) | GitHub Actions (opsional).

---

## 14. Checklist Dokumen Sampel yang Perlu Dikumpulkan

Daftar dokumen fisik dan file asli PT Nutech Pundi Arta yang **perlu diminta dari masing-masing divisi** sebelum go-live. Dokumen ini menjadi acuan format formulir dan template cetak di aplikasi.

### Dari Marketing
- [ ] Contoh PO Pelanggan (dokumen asli / scan) — format, kolom, informasi standar PO pelanggan
- [ ] Contoh Excel Rekap Sales Order yang digunakan Marketing saat ini — kolom, pengelompokan part, format penomoran SO

### Dari PPIC
- [ ] Contoh SPK bulanan yang pernah diterbitkan PPIC — format, kolom, cara pengisian
- [ ] Contoh tabel Target Harian per lini per part — bisa file Excel atau foto papan/lembaran jadwal lini

### Dari Purchasing
- [ ] File Excel perhitungan kebutuhan bahan baku yang aktif digunakan — untuk memahami dan memvalidasi proses aktual (TBD-06), tanpa mengubah status bahwa formula eksak tetap Out of Scope pada MVP
- [ ] Contoh PO Supplier yang pernah diterbitkan — format, kolom, satuan beli (Roll/Sheet/Kg), format penomoran

### Dari Admin Gudang Bahan Baku
- [ ] Contoh Kartu Stok fisik atau Bon Pengambilan Bahan — format pencatatan masuk/keluar bahan yang berjalan saat ini

### Dari Admin Operasional
- [ ] Contoh Laporan Produksi Harian (formulir kertas lantai lini) — kolom, satuan (Pack/PCS), keterangan NG
- [ ] Contoh Laporan QC dengan analisis 4M (formulir QC fisik) — konfirmasi bahwa ini dokumen terpisah dari Laporan Produksi
- [ ] Tabel Konversi Pack ke PCS per lini — daftar isi pack per kombinasi lini dan part number (krusial untuk fitur F-14)

### Dari Admin Pengiriman
- [ ] Contoh Delivery Note (DN) dari pelanggan — format dan informasi standar DN pelanggan (dokumen acuan pelanggan, dibedakan dari Surat Jalan resmi Nutech)
- [ ] Contoh Surat Jalan resmi PT Nutech Pundi Arta — **dokumen paling penting**; template cetak SJ di aplikasi harus mengikuti format resmi Nutech yang sudah dikenal pelanggan (lihat TBD-07)

### Dari Finance
- [ ] File Excel Kontrol SJ vs PO yang digunakan Finance saat ini — cara pencocokan dan kolom yang digunakan
- [ ] Contoh Invoice Bulanan (Faktur Tagihan) yang pernah dikirim ke pelanggan — format, logo, kolom, penomoran (lihat TBD-08, TBD-09)
