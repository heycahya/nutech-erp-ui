# Dokumentasi Fitur — Nutech Mini-ERP
**Sumber**: BRD Nutech Mini-ERP v3.0 (18 Oktober 2026)
**Status Dokumen**: Living Document — turunan resmi dari BRD
**Diperbarui**: 18 Oktober 2026

> **Catatan Penting**: Dokumen ini adalah turunan BRD, bukan pengganti BRD.
> BRD tetap menjadi **single source of truth** untuk seluruh aturan bisnis, keputusan, dan scope.
> Jika ada pertentangan antara dokumen ini dan BRD, BRD yang berlaku.
> Jangan ubah TBD menjadi keputusan final tanpa validasi tertulis dari manajemen.

---

## 1. Tujuan dan Ruang Lingkup

### 1.1 Tujuan MVP

Nutech Mini-ERP dirancang sebagai **Single Source of Truth** untuk 7 divisi PT Nutech Pundi Arta — menggantikan proses manual Excel/kertas yang berjalan terpisah antar divisi. Tujuan utama rilis awal (MVP):

- Mendigitalisasi alur Order-to-Cash mulai dari penerimaan PO pelanggan hingga pencatatan pembayaran AR.
- Mengintegrasikan data lintas divisi secara real-time agar status pesanan, stok, pengiriman, dan tagihan dapat dipantau terpusat.
- Menjamin integritas data persediaan (material dan barang jadi) dengan transaksi ACID, ledger append-only, dan larangan saldo negatif.
- Menghilangkan kebergantungan pada WhatsApp/rekap manual untuk koordinasi antar divisi.

**Referensi BRD**: Section 1, Section 2.1

### 1.2 Klasifikasi Status Fitur

| Status | Definisi |
| :--- | :--- |
| **MVP** | Fitur Must Have atau Should Have yang masuk ruang lingkup rilis awal |
| **OUT OF SCOPE** | Secara eksplisit dikecualikan oleh BRD; tidak boleh diimplementasikan |
| **PENDING DECISION** | Fitur atau aspek yang bergantung pada TBD; implementasi dapat dimulai dengan Design Assumption fallback yang tercantum di BRD |

### 1.3 Fitur MVP (In Scope)

Berdasarkan BRD Section 2.1 dan Section 6, fitur MVP mencakup F-01 hingga F-15 (Must Have dan Should Have). Status F-16 (Ekspor Dokumen Umum) masih **PENDING DECISION** — lihat Section 12 BRD.

### 1.4 Fitur Out of Scope

Secara eksplisit dikecualikan oleh BRD Section 2.2 dan Section 9.2:

- Modul QC Digital (Form 4M, QC Report digital, deklarasi FG oleh akun QC)
- Role login khusus QC
- Pemisahan role Admin Produksi dan Admin Pengiriman
- Formula MRP eksak berbasis file Excel Purchasing
- HR/Payroll, presensi biometrik, rekrutmen
- Pembukuan akuntansi penuh (GL, Neraca, Jurnal Penyesuaian)
- IoT / sensor mesin / SCADA
- Portal B2C / e-commerce pelanggan umum
- Payment gateway perbankan otomatis
- Penanganan retur barang terpadu (prosedurnya masih TBD di BRD)

---

## 2. Daftar Fitur per Modul

### 2.1 Modul: Master Data & Konfigurasi

---

#### FEAT-MD-01 — Manajemen Customer

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-MD-01 |
| **Nama** | Manajemen Customer |
| **Modul** | Master Data |
| **Status** | MVP |
| **Referensi BRD** | Section 8.4 |

**Deskripsi**: Kelola data master pelanggan yang menjadi dasar pembuatan Sales Order dan Invoice.

**Atribut Wajib**: ID, Kode Customer, Nama Perusahaan, Alamat, Kontak, Terms Pembayaran.

**Aturan Bisnis**:
- Customer adalah entitas B2B (manufaktur komponen otomotif); tidak ada pelanggan umum/B2C.

**Validasi**:
- Kode dan Nama Customer tidak boleh kosong.
- Kode Customer harus unik.

**Acceptance Criteria**:
- [ ] Admin dapat membuat, mengubah, dan menonaktifkan data customer.
- [ ] Kode customer tidak dapat diduplikasi.
- [ ] Customer yang sudah memiliki SO aktif tidak dapat dihapus secara fisik.

---

#### FEAT-MD-02 — Manajemen Part / Item

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-MD-02 |
| **Nama** | Manajemen Part / Item |
| **Modul** | Master Data |
| **Status** | MVP |
| **Referensi BRD** | Section 8.4 |

**Deskripsi**: Kelola master part/produk yang diproduksi dan dikirimkan ke pelanggan.

**Atribut Wajib**: ID, Nomor Part, Deskripsi, Satuan Resmi (PCS).

**Aturan Bisnis**:
- Satuan resmi part selalu **PCS** (BR-SPK-03).
- 1 part dapat tersusun dari beberapa material (multi-material BOM) (BR-MAT-05).

**Validasi**:
- Nomor Part harus unik di seluruh sistem.

**Acceptance Criteria**:
- [ ] Admin dapat membuat, mengubah, dan menonaktifkan data part.
- [ ] Nomor part tidak dapat diduplikasi.

---

#### FEAT-MD-03 — Manajemen Supplier

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-MD-03 |
| **Nama** | Manajemen Supplier |
| **Modul** | Master Data |
| **Status** | MVP |
| **Referensi BRD** | Section 8.4 |

**Deskripsi**: Kelola data master supplier material bahan baku.

**Atribut Wajib**: ID, Kode Supplier, Nama, Kontak, Alamat, Termin.

**Validasi**:
- Kode Supplier harus unik.

**Acceptance Criteria**:
- [ ] Admin dapat membuat, mengubah, dan menonaktifkan data supplier.
- [ ] Kode supplier tidak dapat diduplikasi.

---

#### FEAT-MD-04 — Manajemen Lane / Lini Produksi

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-MD-04 |
| **Nama** | Manajemen Lane / Lini Produksi |
| **Modul** | Master Data |
| **Status** | MVP |
| **Referensi BRD** | Section 8.4 |

**Deskripsi**: Kelola master lini produksi yang menjadi dasar SPK, target harian, dan stok FG multi-lokasi.

**Atribut Wajib**: ID, Kode Lini, Nama, Kapasitas.

**Aturan Bisnis**:
- Lane adalah salah satu tipe lokasi FG; stok FG dapat disimpan di ujung lane tanpa transit ke gudang (BR-QC-04, BR-QC-05).
- Lini umumnya mengerjakan part yang relatif tetap, tapi tidak terkunci mutlak (BR-SPK-02).

**Acceptance Criteria**:
- [ ] Admin dapat membuat, mengubah, dan menonaktifkan data lane.
- [ ] Lane dapat digunakan sebagai lokasi FG dan lokasi produksi.

---

#### FEAT-MD-05 — Manajemen Lokasi (Location)

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-MD-05 |
| **Nama** | Manajemen Lokasi |
| **Modul** | Master Data |
| **Status** | MVP |
| **Referensi BRD** | Section 8.4 |

**Deskripsi**: Kelola master lokasi fisik yang digunakan untuk stok material dan stok FG.

**Atribut Wajib**: ID, Kode Lokasi, Tipe (Bahan Baku / Lini / Gudang FG / Transit).

**Aturan Bisnis**:
- Stok FG multi-lokasi: dapat berupa lane atau Gudang FG sesuai konfigurasi (BRD Section 2.1, F-04).
- FG tidak wajib transit ke gudang; pengiriman bisa langsung dari lane (BR-QC-04, BR-QC-05).
- Lokasi transit **tidak diwajibkan** oleh BRD; tersedia sebagai tipe opsional.

**Acceptance Criteria**:
- [ ] Admin dapat membuat lokasi dengan tipe berbeda.
- [ ] Lokasi dapat digunakan sebagai sumber stok FG saat pembuatan SJ.

---

#### FEAT-MD-06 — Manajemen Material Bahan Baku

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-MD-06 |
| **Nama** | Manajemen Material Bahan Baku |
| **Modul** | Master Data |
| **Status** | MVP |
| **Referensi BRD** | Section 8.4 |

**Deskripsi**: Kelola master material bahan baku dengan satuan beli dan satuan pakai.

**Atribut Wajib**: ID, Kode Material, Nama Bahan Baku, Satuan Beli (Roll/Sheet/Kg), Satuan Pakai.

**Aturan Bisnis**:
- Sistem wajib dapat mengonversi satuan beli ke satuan produksi (PCS) dan satuan limbah (Kg Scrap) (BR-MAT-04 — TECHNICAL CONSTRAINT).

**Acceptance Criteria**:
- [ ] Admin dapat mendefinisikan material dengan satuan beli berbeda.
- [ ] Sistem mendukung konversi satuan antar UoM.

---

#### FEAT-MD-07 — Manajemen UoM (Satuan)

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-MD-07 |
| **Nama** | Manajemen Satuan (UoM) |
| **Modul** | Master Data |
| **Status** | MVP |
| **Referensi BRD** | Section 8.4 |

**Deskripsi**: Kelola master satuan yang dipakai di seluruh sistem.

**Satuan yang dikenal**: PCS, Pack, Roll, Sheet, Kg, Meter.

**Acceptance Criteria**:
- [ ] Sistem mendukung seluruh satuan yang terdaftar di BRD.
- [ ] UoM dapat dikaitkan ke material, part, dan konversi.

---

#### FEAT-MD-08 — Konfigurasi Pack Conversion (Rasio Pack-to-PCS)

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-MD-08 |
| **Nama** | Konfigurasi Konversi Pack ke PCS |
| **Modul** | Master Data / Konfigurasi Produksi |
| **Status** | MVP (Should Have — F-14) |
| **Referensi BRD** | Section 6 F-14, BR-PR-04, BR-PR-05, Section 8.4 |

**Deskripsi**: Konfigurasi rasio konversi pack-to-PCS yang berbeda per lini produksi per part.

**Aturan Bisnis**:
- Rasio konversi dikonfigurasi per lane per part; tidak ada rasio global pabrik (BR-PR-05).
- Operator menghitung dengan satuan pack; Admin input pack dan sistem konversi ke PCS (BR-PR-04).

**Validasi**:
- Rasio harus bernilai positif dan tidak boleh nol.
- Kombinasi Lane + Part harus unik dalam tabel konfigurasi.

**Acceptance Criteria**:
- [ ] PPIC atau admin_operasional dapat mengatur rasio pack-per-PCS untuk setiap kombinasi lane dan part.
- [ ] Sistem menggunakan rasio ini saat Admin input produksi aktual dalam satuan pack.
- [ ] Rasio duplikat (Lane + Part yang sama) ditolak.

---

#### FEAT-MD-09 — Bill of Materials (BOM) — DESIGN ASSUMPTION

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-MD-09 |
| **Nama** | Bill of Materials (BOM) |
| **Modul** | Master Data |
| **Status** | MVP — nilai riil adalah **DESIGN ASSUMPTION / PLACEHOLDER** |
| **Referensi BRD** | Section 8.4, BR-MAT-05, BR-MAT-06, BR-MAT-08, TBD-15 |

**Deskripsi**: Konfigurasi kebutuhan material per PCS per part untuk mendukung simulasi MRP.

**Aturan Bisnis**:
- 1 part dapat tersusun dari beberapa jenis material (multi-material BOM) (BR-MAT-05).
- Nilai Standard BOM (kebutuhan per PCS) adalah **DESIGN ASSUMPTION** untuk demo; nilai riil belum ditetapkan (TBD-15).
- Scrap Allowance per part per material adalah **DESIGN ASSUMPTION** untuk demo; nilai riil belum ditetapkan (TBD-15).

> **TBD-15**: Nilai riil standard consumption dan scrap allowance per part belum ditetapkan. Nilai BOM yang diinput hanya untuk simulasi demo. Wajib divalidasi sebelum go-live.

**Acceptance Criteria**:
- [ ] Admin dapat mengkonfigurasi BOM: Part — Material — Qty per PCS — Scrap Allowance (%).
- [ ] BOM digunakan oleh simulasi MRP (F-05).
- [ ] Sistem menampilkan label/keterangan bahwa nilai BOM adalah estimasi demo.

---

### 2.2 Modul: Sales Order

---

#### FEAT-SO-01 — Input Sales Order

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-SO-01 |
| **Nama** | Input Sales Order |
| **Modul** | Sales Order |
| **Status** | MVP (Must Have — F-01) |
| **Role** | `marketing` |
| **Referensi BRD** | Section 2.1, Section 5.1, F-01, BR-SO-01 hingga BR-SO-06 |

**Deskripsi**: Marketing menginput Customer PO menjadi Sales Order internal yang multi-part. SO menjadi induk seluruh transaksi downstream.

**Input Utama**:
- Customer (dari master data)
- Nomor PO pelanggan
- Tipe pesanan: Rutin Bulanan atau Urgent (BR-SO-04)
- Need date / tanggal kebutuhan pelanggan (BR-SO-05)
- Line item: Part, Qty yang dipesan

**Output Utama**:
- SO digital dengan status awal produksi, pengiriman, dan billing yang terpisah (BR-SO-06)

**Aturan Bisnis**:
- 1 Customer PO menghasilkan 1 Sales Order internal, multi-part / multi-line item (BR-SO-01)
- SO adalah induk transaksi untuk seluruh alur downstream (BR-SO-02)
- Status progres SO dikelola terpisah: status produksi, pengiriman, dan billing tidak disatukan (BR-SO-06)
- Need date adalah atribut krusial untuk prioritas produksi (BR-SO-05)

**Validasi**:
- Customer harus terdaftar di master data.
- Nomor PO pelanggan harus diisi.
- Need date harus diisi.
- Setiap line item wajib memiliki part dan qty yang valid (qty > 0).

**PENDING DECISION (TBD-08, TBD-09, TBD-11)**:
- TBD-08: Prosedur approval SO sebelum data mengalir ke PPIC & Purchasing — *Fallback: SO langsung aktif setelah input.*
- TBD-09: Kapan harga satuan diinput (saat SO oleh Marketing, atau saat Invoice oleh Finance) — *Fallback: field `unit_price` nullable di SO; dapat diisi Finance saat billing.*
- TBD-11: Wewenang approval urgent SO — *Fallback: Urgent diinput langsung dengan flag; tanpa approval digital di sistem.*

**Acceptance Criteria**:
- [ ] Marketing dapat membuat SO dengan 1 atau lebih line item.
- [ ] SO dapat ditandai Rutin atau Urgent.
- [ ] Need date wajib diisi dan tersimpan.
- [ ] Status produksi, pengiriman, dan billing SO tercatat terpisah.
- [ ] SO menjadi referensi untuk pembuatan SPK, SJ, dan Invoice.

---

#### FEAT-SO-02 — Pemantauan Status SO

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-SO-02 |
| **Nama** | Pemantauan Status SO |
| **Modul** | Sales Order |
| **Status** | MVP |
| **Role** | `marketing`, `management` |
| **Referensi BRD** | BR-SO-06, BR-SO-03, F-01 |

**Deskripsi**: Marketing dan manajemen dapat memantau status setiap SO secara real-time.

**Aturan Bisnis**:
- Sistem mendukung partial fulfillment: pengiriman dan penagihan bertahap tanpa membatalkan sisa order (BR-SO-03).
- Status produksi, pengiriman, dan billing dipantau terpisah per SO (BR-SO-06).

**Acceptance Criteria**:
- [ ] SO menampilkan qty yang dipesan, qty yang sudah terkirim (kumulatif), dan qty yang sudah ditagih.
- [ ] Partial delivery tidak menutup SO secara otomatis.
- [ ] Status SO dapat ditelusuri ke SJ dan Invoice yang berkaitan.

---

### 2.3 Modul: PPIC & Perencanaan Produksi (SPK)

---

#### FEAT-SPK-01 — Pembuatan SPK Bulanan

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-SPK-01 |
| **Nama** | Pembuatan SPK Bulanan |
| **Modul** | PPIC & Planning |
| **Status** | MVP (Must Have — F-02) |
| **Role** | `ppic` |
| **Referensi BRD** | Section 5.2, F-02, BR-SPK-01 hingga BR-SPK-05 |

**Deskripsi**: PPIC menerbitkan SPK bulanan per lini produksi yang memuat target produksi multi-part dalam satuan PCS.

**Input Utama**:
- Lane / lini produksi
- Bulan dan tahun
- Referensi SO (nullable — relasi TBD, lihat TBD-05)
- Part yang diproduksi dan target harian per tanggal dalam PCS

**Output Utama**:
- SPK digital dengan target harian per part dalam PCS

**Aturan Bisnis**:
- SPK diterbitkan bulanan per lane; bisa memuat multi-part (BR-SPK-01).
- Target produksi resmi selalu dalam satuan PCS (BR-SPK-03).
- PPIC menetapkan target harian per lane per part sejak awal bulan (BR-SPK-04).
- Staf lini / operator tidak bisa mengubah angka target (BR-SPK-05).
- Field `so_id` di SPK dibuat nullable karena relasi 1:1 atau N:1 belum diputuskan (TBD-05).

**PENDING DECISION (TBD-05, TBD-07)**:
- TBD-05: Relasi SPK ke SO (1:1 atau N:1) — *Fallback: `so_id` nullable.*
- TBD-07: Pihak yang menyetujui SPK sebelum aktif — *Fallback: SPK langsung aktif setelah dibuat PPIC.*

**Acceptance Criteria**:
- [ ] PPIC dapat membuat SPK per lane per bulan.
- [ ] SPK dapat memuat beberapa part sekaligus.
- [ ] Target harian per part dalam PCS tersimpan dan terkunci dari operator.
- [ ] Target tidak dapat diubah oleh role selain PPIC.

---

#### FEAT-SPK-02 — Monitoring Gap Produksi

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-SPK-02 |
| **Nama** | Monitoring Gap Produksi |
| **Modul** | PPIC & Planning |
| **Status** | MVP |
| **Role** | `ppic`, `management` |
| **Referensi BRD** | BR-PR-01, BR-PR-02, BR-PR-03, F-02 |

**Deskripsi**: Sistem menghitung dan menampilkan gap antara target dan aktual produksi per hari.

**Aturan Bisnis**:
- Gap = Target minus Aktual, dihitung on-the-fly; tidak disimpan sebagai nilai statis (BR-PR-01).
- Gap hari ini tidak otomatis ditambahkan ke target hari berikutnya (BR-PR-02).
- Target hari berikutnya tetap mengacu pada rencana awal PPIC (BR-PR-03).

**Acceptance Criteria**:
- [ ] Gap ditampilkan per hari per part per lane.
- [ ] Gap dihitung on-the-fly dari target dan aktual; tidak ada kolom gap statis di database.
- [ ] Gap negatif (over-produksi) dapat ditampilkan dan tidak memengaruhi target hari berikutnya.

---

### 2.4 Modul: Purchasing & Pengadaan Material

---

#### FEAT-PUR-01 — Simulasi MRP (Demo)

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-PUR-01 |
| **Nama** | Simulasi MRP |
| **Modul** | Purchasing |
| **Status** | MVP (Must Have — F-05) — nilai BOM adalah DESIGN ASSUMPTION |
| **Role** | `purchasing` |
| **Referensi BRD** | Section 5.5, F-05, BR-MAT-06, BR-MAT-07, BR-MAT-08, TBD-06, TBD-15 |

**Deskripsi**: Estimasi kebutuhan material bahan baku berdasarkan target produksi SPK, BOM, dan stok tersedia. Merupakan simulasi demo; formula MRP eksak OUT OF SCOPE untuk MVP.

**Formula Demo (DESIGN ASSUMPTION)**:
```
Net Req = (Std Consumption x Target Qty) + Scrap Allowance - Available Stock
```

**Aturan Bisnis**:
- Formula MRP riil dari Excel Purchasing tetap **Out of Scope** untuk MVP (BR-MAT-07).
- Nilai Std Consumption dan Scrap Allowance adalah **DESIGN ASSUMPTION** (BR-MAT-06, BR-MAT-08, TBD-15).

**PENDING DECISION**: TBD-06 (formula MRP eksak) dan TBD-15 (nilai BOM riil) belum diputuskan.

**Acceptance Criteria**:
- [ ] Purchasing dapat menjalankan simulasi MRP berdasarkan target SPK aktif.
- [ ] Hasil simulasi menampilkan Net Requirement per material.
- [ ] Sistem menampilkan label bahwa hasil adalah estimasi simulasi demo.

---

#### FEAT-PUR-02 — Purchase Order Supplier

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-PUR-02 |
| **Nama** | Purchase Order Supplier |
| **Modul** | Purchasing |
| **Status** | MVP (Must Have — F-06) |
| **Role** | `purchasing` |
| **Referensi BRD** | Section 5.5, F-06, BR-MAT-09, TBD-12 |

**Deskripsi**: Purchasing menerbitkan PO ke supplier berdasarkan hasil simulasi MRP atau kebutuhan aktual.

**Input Utama**:
- Supplier
- Material, qty, satuan beli (Roll/Sheet/Kg)
- Tanggal PO

**PENDING DECISION (TBD-12)**: Approval PO Supplier oleh Direktur sebelum dikirim — *Fallback: PO diterbitkan langsung oleh Purchasing.*

**Acceptance Criteria**:
- [ ] Purchasing dapat membuat PO dengan multi-line item material.
- [ ] PO menggunakan satuan beli supplier (Roll/Sheet/Kg).
- [ ] Status PO dapat dipantau (Open, Partially Received, Received).

---

### 2.5 Modul: Gudang Bahan Baku

---

#### FEAT-WH-01 — Goods Receipt Note (GRN)

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-WH-01 |
| **Nama** | Penerimaan Material (GRN) |
| **Modul** | Gudang Bahan Baku |
| **Status** | MVP (Must Have — F-06) |
| **Role** | `warehouse` |
| **Referensi BRD** | Section 5.5, F-06, BR-MAT-01, NFR-04 |

**Deskripsi**: Admin Gudang mencatat penerimaan material dari supplier. Setiap GRN menambah saldo stok material melalui ledger append-only.

**Aturan Bisnis**:
- Seluruh material supplier wajib masuk Gudang Bahan Baku terlebih dahulu melalui GRN; tidak boleh langsung ke lini (BR-MAT-01).
- Setiap penambahan stok dicatat di `inventory_movements` (ledger append-only) (NFR-04).

**Validasi**:
- GRN harus merujuk PO supplier yang valid.
- Qty yang diterima tidak boleh melebihi qty yang dipesan per line PO tanpa konfirmasi.

**Acceptance Criteria**:
- [ ] Admin Gudang dapat membuat GRN per PO supplier.
- [ ] Stok material bertambah di ledger setelah GRN dikonfirmasi.
- [ ] Riwayat GRN per material dapat ditelusuri.

---

#### FEAT-WH-02 — Kartu Stok Material (Ledger)

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-WH-02 |
| **Nama** | Kartu Stok Material |
| **Modul** | Gudang Bahan Baku |
| **Status** | MVP (Must Have — F-06) |
| **Role** | `warehouse` |
| **Referensi BRD** | F-06, NFR-02, NFR-04 |

**Deskripsi**: Ledger append-only yang mencatat seluruh pergerakan stok material (masuk via GRN, keluar via Material Issue, penyesuaian).

**Aturan Bisnis**:
- Ledger bersifat append-only; baris tidak boleh dihapus atau diubah (NFR-04).
- Saldo stok tidak boleh bernilai negatif (zero negative stock) (NFR-02).
- Setiap baris wajib menyimpan: `user_id`, `created_at`, `movement_type`, `reference_type`, `reference_id`, `qty`, `notes` (NFR-04).

**Validasi**:
- Setiap mutasi stok keluar wajib memeriksa ketersediaan stok sebelum diproses.
- Mutasi yang akan menyebabkan saldo negatif harus ditolak sistem.

**Acceptance Criteria**:
- [ ] Setiap pergerakan stok material tercatat di ledger dengan atribut lengkap.
- [ ] Saldo stok real-time tersedia per material per lokasi.
- [ ] Saldo tidak pernah bernilai negatif; sistem menolak transaksi yang melanggar ini.
- [ ] Riwayat lengkap dapat ditelusuri per material.

---

#### FEAT-WH-03 — Material Issue Bertahap ke Lini

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-WH-03 |
| **Nama** | Material Issue Bertahap ke Lini |
| **Modul** | Gudang Bahan Baku |
| **Status** | MVP (Must Have — F-07) |
| **Role** | `warehouse` |
| **Referensi BRD** | Section 5.5, F-07, BR-MAT-02, BR-MAT-03, BR-MAT-10 |

**Deskripsi**: Admin Gudang mengotorisasi pengeluaran bahan baku ke lini produksi secara bertahap. 1 SPK tidak sama dengan 1 kali Material Issue.

**Aturan Bisnis**:
- Pengambilan bahan dilakukan bertahap per kebutuhan lini; 1 SPK bisa banyak kali Material Issue (BR-MAT-02).
- Setiap pengambilan wajib diotorisasi Admin Gudang (BR-MAT-03).

**PENDING DECISION (TBD-10)**: Formulir fisik bon permintaan bahan baku dari lantai produksi — *Fallback: Admin Gudang input langsung berdasarkan permintaan lisan/fisik.*

**Validasi**:
- Qty yang dikeluarkan tidak boleh melebihi saldo stok tersedia (zero negative stock).
- Material Issue harus mencantumkan lane tujuan.

**Acceptance Criteria**:
- [ ] Admin Gudang dapat membuat Material Issue untuk 1 atau lebih material ke 1 lane.
- [ ] 1 SPK dapat memiliki banyak Material Issue.
- [ ] Stok material berkurang di ledger setelah Material Issue dikonfirmasi.
- [ ] Sistem menolak Material Issue jika stok tidak mencukupi.

---

#### FEAT-WH-04 — Stock Adjustment Material

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-WH-04 |
| **Nama** | Stock Adjustment Material |
| **Modul** | Gudang Bahan Baku |
| **Status** | MVP (Should Have — F-13) |
| **Role** | `warehouse` (permission khusus) |
| **Referensi BRD** | F-13, NFR-04 |

**Deskripsi**: Koreksi saldo stok material via ledger dengan alasan wajib, dibatasi permission khusus.

**Aturan Bisnis**:
- Adjustment dicatat sebagai movement type `adj` di ledger append-only (NFR-04).
- Saldo tidak boleh bernilai negatif setelah adjustment.
- Alasan adjustment wajib diisi.

**Acceptance Criteria**:
- [ ] Hanya role dengan permission khusus yang dapat melakukan stock adjustment.
- [ ] Adjustment tercatat di ledger dengan user_id, alasan, dan timestamp.
- [ ] Saldo pasca-adjustment tidak boleh negatif.

---

### 2.6 Modul: Produksi

---

#### FEAT-PR-01 — Input Laporan Produksi Harian

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-PR-01 |
| **Nama** | Input Laporan Produksi Harian |
| **Modul** | Produksi |
| **Status** | MVP (Must Have — F-03) |
| **Role** | `admin_operasional` |
| **Referensi BRD** | Section 5.3, F-03, BR-PR-01 hingga BR-PR-11 |

**Deskripsi**: Admin Operasional menginput laporan produksi aktual harian per lane. Input dapat berupa pack (dikonversi otomatis ke PCS) atau langsung PCS.

**Input Utama**:
- Lane dan tanggal
- Part yang diproduksi
- Qty aktual (pack atau PCS)
- Qty NG (barang cacat)
- Catatan / alasan deviasi (free text sementara — TBD-16)
- Downtime (DESIGN ASSUMPTION: Dies Changeover, Blade Sharpening, Machine Repair, Power Outage) (BR-PR-08)

**Output Utama**:
- Data aktual PCS tersimpan; Gap (Target minus Aktual) dihitung on-the-fly

**Aturan Bisnis**:
- Operator menghitung dengan pack; Admin input pack dan sistem konversi ke PCS (BR-PR-04).
- Rasio konversi per lini per part (BR-PR-05).
- Gap = Target minus Aktual, on-the-fly, tidak disimpan sebagai nilai statis (BR-PR-01).
- Gap hari ini tidak otomatis ditambahkan ke target berikutnya (BR-PR-02).
- Laporan dapat memuat aktual banyak part sekaligus (BR-PR-06).
- NG dapat dicatat dalam laporan harian (BR-PR-07).
- Kuantitas FG **bukan** otomatis = Aktual minus NG; FG ditetapkan fisik oleh QC (BR-QC-02).

**PENDING DECISION**: TBD-09/TBD-13 (frekuensi per shift atau per hari — *Fallback: form per tanggal*), TBD-16 (dropdown atau free text — *Fallback: free text*).

**Acceptance Criteria**:
- [ ] Admin dapat input aktual harian per lane per part.
- [ ] Input pack dikonversi otomatis ke PCS menggunakan rasio yang dikonfigurasi.
- [ ] NG dapat dicatat terpisah dari aktual.
- [ ] Gap ditampilkan on-the-fly; tidak ada kolom gap statis di database.
- [ ] Laporan produksi tidak otomatis mengubah saldo FG (FG diinput terpisah setelah QC fisik).

---

#### FEAT-PR-02 — Pencatatan Barang Jadi (FG) ke Inventory

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-PR-02 |
| **Nama** | Pencatatan FG ke Inventory |
| **Modul** | Produksi / FG Inventory |
| **Status** | MVP (Must Have — F-03, F-04) |
| **Role** | `admin_operasional` |
| **Referensi BRD** | BR-QC-02, BR-QC-04, BR-QC-05, BR-QC-06, F-04, NFR-04, TBD-03 |

**Deskripsi**: Admin Operasional mencatat FG yang lolos QC fisik beserta lokasi simpan ke ledger FG inventory. Ini adalah aksi terpisah dari input laporan produksi harian.

**Aturan Bisnis**:
- Kuantitas FG **bukan** otomatis = Aktual minus NG; ditetapkan fisik oleh QC dan dicatat Admin berdasarkan bukti fisik (BR-QC-02).
- FG tidak wajib transit ke gudang; bisa disimpan di ujung lane atau Gudang FG (BR-QC-04).
- Atribut minimal FG: Part, Qty, Lokasi Fisik, Status Stok (BR-QC-06).
- Dicatat di `fg_inventory_movements` (ledger append-only) (NFR-04).

**PENDING DECISION**: TBD-03 (mekanisme serah terima fisik FG dari QC — *Fallback: Admin input berdasarkan bukti fisik; form serah terima diparaf supervisor*), TBD-07 (standarisasi status stok FG).

**Acceptance Criteria**:
- [ ] Admin dapat mencatat FG masuk ke lokasi yang dipilih (lane atau gudang FG).
- [ ] Qty FG yang dicatat adalah nilai yang dinyatakan QC secara fisik, bukan kalkulasi otomatis.
- [ ] Saldo FG bertambah di ledger setelah pencatatan dikonfirmasi.
- [ ] Saldo FG tidak pernah bernilai negatif.

---

### 2.7 Modul: FG Inventory (Barang Jadi)

---

#### FEAT-FG-01 — Stok FG Multi-Lokasi

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-FG-01 |
| **Nama** | Stok FG Multi-Lokasi |
| **Modul** | FG Inventory |
| **Status** | MVP (Must Have — F-04) |
| **Role** | `admin_operasional` |
| **Referensi BRD** | Section 2.1 F-04, BR-QC-04, BR-QC-05, BR-QC-06, NFR-02, NFR-04 |

**Deskripsi**: Stok FG dicatat berdasarkan part dan lokasi fisik (lane atau Gudang FG). Sistem mempertahankan saldo per lokasi berbasis ledger append-only.

**Aturan Bisnis**:
- Stok FG dicatat per Part per Lokasi (BR-QC-06).
- Lokasi dapat berupa lane atau Gudang FG sesuai konfigurasi (F-04).
- Lokasi transit **tidak diwajibkan** BRD; tersedia sebagai opsional jika konfigurasi menggunakannya.
- Ledger `fg_inventory_movements` bersifat append-only (NFR-04).
- Saldo tidak boleh negatif (NFR-02).
- Transaksi ACID wajib dijamin (NFR-02).

**Acceptance Criteria**:
- [ ] Saldo FG tersedia per part per lokasi secara real-time.
- [ ] Riwayat pergerakan FG dapat ditelusuri per part per lokasi.
- [ ] Saldo antar lokasi tidak pernah negatif.
- [ ] Transfer FG antar lokasi tidak menciptakan atau menghilangkan stok (saldo total tetap konsisten).

---

#### FEAT-FG-02 — Transfer FG Antar Lokasi

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-FG-02 |
| **Nama** | Transfer FG Antar Lokasi |
| **Modul** | FG Inventory |
| **Status** | MVP (Must Have — F-04) |
| **Role** | `admin_operasional` |
| **Referensi BRD** | F-04, NFR-02, NFR-04 |

**Deskripsi**: Perpindahan stok FG dari satu lokasi ke lokasi lain dicatat dengan transaksi atomik untuk menjaga konsistensi saldo.

**Aturan Bisnis**:
- Transfer dicatat sebagai movement type `transfer` di ledger FG.
- Transfer harus atomik: pengurangan di lokasi asal dan penambahan di lokasi tujuan terjadi dalam 1 transaksi DB (NFR-02).
- Saldo lokasi asal tidak boleh negatif setelah transfer.

**Validasi**:
- Qty transfer tidak boleh melebihi saldo di lokasi asal.
- Lokasi asal dan tujuan tidak boleh sama.

**Acceptance Criteria**:
- [ ] Admin dapat mentransfer FG dari 1 lokasi ke lokasi lain.
- [ ] Transfer dicatat di ledger sebagai out di lokasi asal dan in di lokasi tujuan dalam 1 transaksi.
- [ ] Saldo total part tidak berubah setelah transfer (tidak ada stok yang hilang atau tercipta).
- [ ] Sistem menolak transfer jika saldo lokasi asal tidak mencukupi.

---

#### FEAT-FG-03 — Stock Adjustment FG

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-FG-03 |
| **Nama** | Stock Adjustment FG |
| **Modul** | FG Inventory |
| **Status** | MVP (Should Have — F-13) |
| **Role** | `admin_operasional` (permission khusus) |
| **Referensi BRD** | F-13, NFR-04, BR-QC-09 |

**Deskripsi**: Koreksi saldo FG via ledger dengan alasan wajib, dibatasi permission khusus.

**PENDING DECISION (BR-QC-09)**: Pihak yang berwenang melakukan koreksi/pembatalan status FG masih TBD.

**Acceptance Criteria**:
- [ ] Hanya role dengan permission khusus yang dapat melakukan adjustment FG.
- [ ] Adjustment tercatat di ledger dengan user_id, alasan, dan timestamp.
- [ ] Saldo pasca-adjustment tidak boleh negatif.

---

### 2.8 Modul: Pengiriman & Surat Jalan

---

#### FEAT-DEL-01 — Pembuatan Surat Jalan (SJ)

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-DEL-01 |
| **Nama** | Pembuatan Surat Jalan |
| **Modul** | Pengiriman |
| **Status** | MVP (Must Have — F-08) |
| **Role** | `admin_operasional` |
| **Referensi BRD** | Section 5.6, F-08, BR-DEL-01 hingga BR-DEL-06 |

**Deskripsi**: Admin Operasional membuat 1 dokumen Surat Jalan resmi sebagai dasar pengiriman barang ke pelanggan. SJ berstatus Draft atau Printed **tidak memotong stok FG**.

**Input Utama**:
- Customer
- Referensi SO dan line item SO
- Part yang dikirim, qty, lokasi sumber FG
- Tanggal pengiriman

**Aturan Bisnis**:
- Hanya 1 dokumen SJ resmi (tidak ada SJ Admin dan SJ Finance terpisah) (BR-DEL-01).
- Barang bisa bersumber dari lane atau Gudang FG (BR-DEL-02).
- Status Draft — TIDAK memotong stok FG (BR-DEL-03).
- Status Printed — TIDAK memotong stok FG (BR-DEL-04).
- Stok FG berkurang HANYA saat konfirmasi pengiriman setelah SJ kembali bertandatangan (BR-DEL-05, BR-DEL-06).

**PENDING DECISION**: TBD-07 (format template dan rangkap cetak SJ — *Fallback: format industri standar*), TBD-09 (penanggung jawab penerimaan DN dari pelanggan).

**Validasi**:
- SJ harus merujuk SO yang valid.
- Qty yang dikirim tidak boleh melebihi qty yang belum terkirim di SO line item.

**Acceptance Criteria**:
- [ ] Admin dapat membuat SJ dengan multi-line item dari 1 SO.
- [ ] SJ mencantumkan lokasi sumber FG per item.
- [ ] Status SJ Draft/Printed tidak mengubah saldo FG.
- [ ] SJ dapat dicetak sebagai dokumen fisik.

---

#### FEAT-DEL-02 — Cetak Surat Jalan

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-DEL-02 |
| **Nama** | Cetak Surat Jalan |
| **Modul** | Pengiriman |
| **Status** | MVP (Must Have — F-08) |
| **Role** | `admin_operasional` |
| **Referensi BRD** | F-08, BR-DEL-01, TBD-07 |

**Deskripsi**: Admin dapat mencetak SJ sebagai dokumen fisik resmi yang dibawa pengemudi.

**Aturan Bisnis**:
- Mencetak SJ mengubah status dari Draft ke Printed.
- Printed **tidak** memotong stok FG (BR-DEL-04).

**PENDING DECISION (TBD-07)**: Format template dan jumlah rangkap SJ resmi PT Nutech — *Fallback: format standar industri.*

**Acceptance Criteria**:
- [ ] Mencetak SJ mengubah status ke Printed.
- [ ] Stok FG tidak berubah saat SJ dicetak.
- [ ] Dokumen SJ tercetak memuat informasi yang dibutuhkan untuk pengiriman.

---

#### FEAT-DEL-03 — Konfirmasi Pengiriman (Delivered)

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-DEL-03 |
| **Nama** | Konfirmasi Pengiriman |
| **Modul** | Pengiriman |
| **Status** | MVP (Must Have — F-08) |
| **Role** | `admin_operasional` |
| **Referensi BRD** | BR-DEL-05, BR-DEL-06, NFR-02, NFR-04, TBD-02 |

**Deskripsi**: Admin menekan "Konfirmasi Pengiriman" setelah SJ fisik kembali bertandatangan pelanggan. **Ini adalah satu-satunya titik di mana stok FG berkurang.**

**Aturan Bisnis**:
- Stok FG berkurang HANYA saat Admin menekan Konfirmasi Pengiriman (BR-DEL-05).
- Konfirmasi dilakukan setelah SJ kembali bertandatangan pelanggan (BR-DEL-06).
- Pengurangan stok dicatat di `fg_inventory_movements` dengan movement type `out` (NFR-04).
- Transaksi pengurangan stok bersifat ACID; saldo tidak boleh negatif (NFR-02).
- Setelah konfirmasi, status SJ berubah ke Delivered.

**PENDING DECISION (TBD-02)**: Trigger pemotongan stok — saat truk berangkat atau saat SJ bertandatangan kembali? — *Fallback (DESIGN ASSUMPTION): konfirmasi saat SJ kembali bertandatangan (Opsi B).*

**Validasi**:
- Saldo FG di lokasi sumber harus mencukupi qty setiap item di SJ pada saat konfirmasi.
- Jika saldo tidak mencukupi, konfirmasi ditolak dan error ditampilkan per item.

**Acceptance Criteria**:
- [ ] Hanya SJ berstatus Printed yang dapat dikonfirmasi.
- [ ] Konfirmasi mengurangi saldo FG di lokasi sumber sesuai qty setiap item SJ.
- [ ] Pengurangan dilakukan dalam 1 transaksi DB atomik.
- [ ] Status SJ berubah ke Delivered setelah konfirmasi berhasil.
- [ ] Sistem menolak konfirmasi jika stok tidak mencukupi.
- [ ] SJ berstatus Draft/Printed tidak memotong stok; hanya konfirmasi yang memotong.

---

### 2.9 Modul: Verifikasi SJ vs PO (Kontrol)

---

#### FEAT-CTL-01 — Verifikasi Kumulatif SJ vs SO

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-CTL-01 |
| **Nama** | Verifikasi Kumulatif SJ vs SO |
| **Modul** | Kontrol SJ vs PO |
| **Status** | MVP (Must Have — F-09) |
| **Role** | `finance` (penanggung jawab resmi TBD-09) |
| **Referensi BRD** | Section 5.7, F-09, BR-CTL-01 hingga BR-CTL-06 |

**Deskripsi**: Sistem mengagregasi seluruh SJ Delivered untuk 1 SO dan membandingkan kumulatif pengiriman terhadap kuantitas SO. Hasil: Matched atau Exception.

**Aturan Bisnis**:
- Verifikasi dilakukan setelah Delivered dan sebelum billing (BR-CTL-01).
- Perhitungan wajib kumulatif karena partial delivery (BR-CTL-02).
- Status: Matched atau Exception (BR-CTL-03).
- Logika Matched (DESIGN ASSUMPTION): kumulatif kirim <= qty SO dan part number sesuai (BR-CTL-04).

**PENDING DECISION**: TBD-09 (penanggung jawab resmi verifikasi), TBD-10 (prosedur resolusi Exception — *Fallback: SJ Exception diblokir dari billing*).

**Validasi Billing Protection**:
- Qty yang dapat ditagih (billable qty) tidak boleh melebihi qty SO yang terverifikasi.
- SJ berstatus Exception tidak dapat diikutkan dalam Invoice.

**Acceptance Criteria**:
- [ ] Sistem menghitung kumulatif qty terkirim (Delivered) per part per SO secara otomatis.
- [ ] Status Matched jika kumulatif <= qty SO dan part sesuai.
- [ ] Status Exception jika terjadi deviasi.
- [ ] SJ Exception diblokir dari proses billing.
- [ ] Riwayat verifikasi dapat ditelusuri.

---

### 2.10 Modul: Billing & Finance

---

#### FEAT-BIL-01 — Pembuatan Invoice Bulanan Multi-SJ

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-BIL-01 |
| **Nama** | Invoice Bulanan Multi-SJ |
| **Modul** | Billing & Finance |
| **Status** | MVP (Must Have — F-10) |
| **Role** | `finance` |
| **Referensi BRD** | Section 5.8, F-10, BR-BIL-01 hingga BR-BIL-09 |

**Deskripsi**: Finance membuat 1 Invoice per pelanggan per bulan dengan menggabungkan beberapa SJ Matched yang belum ditagih.

**Aturan Bisnis**:
- Penagihan dilakukan bulanan (BR-BIL-01).
- Beberapa SJ Matched digabung menjadi 1 Invoice per pelanggan per periode (BR-BIL-02).
- Aturan 1 SJ = 1 Invoice tidak berlaku di PT Nutech (BR-BIL-03).
- Default: 1 Invoice per pelanggan per bulan kalender (BR-BIL-04 — DESIGN ASSUMPTION).
- Hanya SJ Matched yang dapat diikutkan dalam Invoice; SJ Exception diblokir.

**PENDING DECISION**: TBD-07 (kapan harga satuan diinput), TBD-08 (format dan penomoran Invoice resmi), TBD-09 (approval bertingkat sebelum Invoice dikirim), TBD-14 (termin pembayaran standar).

**Validasi Billing Protection**:
- Qty yang ditagih per line item tidak boleh melebihi qty yang terkirim (Delivered) dan terverifikasi (Matched).
- Finance tidak dapat memasukkan SJ yang sudah ada di Invoice lain (pencegahan double billing).
- SJ berstatus Exception atau belum Delivered tidak dapat dimasukkan ke Invoice.

**Acceptance Criteria**:
- [ ] Finance dapat memilih SJ Matched untuk 1 pelanggan dalam 1 periode.
- [ ] Invoice memuat detail per SJ dan per line item.
- [ ] Qty yang ditagih tidak melebihi qty terkirim yang terverifikasi.
- [ ] 1 SJ tidak dapat masuk ke 2 Invoice berbeda (pencegahan double billing).
- [ ] Invoice memiliki total amount dan status pembayaran.

---

#### FEAT-BIL-02 — Payment Tracking (AR Monitoring)

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-BIL-02 |
| **Nama** | Payment Tracking — AR Monitoring |
| **Modul** | Billing & Finance |
| **Status** | MVP (Must Have — F-11) |
| **Role** | `finance` |
| **Referensi BRD** | F-11, BR-BIL-05, BR-BIL-06, TBD-14 |

**Deskripsi**: Finance mencatat penerimaan pembayaran dan memantau saldo piutang (AR) per Invoice. Ini bukan sistem akuntansi GL.

**Status Pembayaran**: Unpaid, Partially Paid, Paid, Overdue (BR-BIL-05).

**Aturan Bisnis**:
- Sistem hanya AR tracking sederhana; bukan pembukuan GL/jurnal akuntansi (BR-BIL-06).
- Invoice yang melewati jatuh tempo menjadi Overdue (BR-BIL-05).

**PENDING DECISION (TBD-14)**: Termin pembayaran standar — nilai belum ditetapkan; sistem wajib mendukung konfigurasi termin per customer.

**Acceptance Criteria**:
- [ ] Finance dapat mencatat pembayaran (partial atau lunas) per Invoice.
- [ ] Status Invoice berubah otomatis sesuai pembayaran yang diterima.
- [ ] Invoice yang melewati jatuh tempo ditandai Overdue.
- [ ] Saldo AR dapat dipantau per customer.

---

### 2.11 Modul: Dashboard Manajemen

---

#### FEAT-DSH-01 — Dashboard KPI Manajemen

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-DSH-01 |
| **Nama** | Dashboard KPI Manajemen |
| **Modul** | Dashboard |
| **Status** | MVP (Should Have — F-12) |
| **Role** | `management` (read-only) |
| **Referensi BRD** | Section 2.1, F-12 |

**Deskripsi**: Dashboard read-only untuk Direksi/Manajer memantau KPI produksi, stok material, stok FG, pengiriman, dan piutang AR secara real-time.

**KPI yang Ditampilkan**: Produksi (aktual vs target per lane), Stok material dan FG, Status pengiriman, Piutang AR.

**Aturan Bisnis**:
- Role `management` hanya membaca; tidak dapat menginput data apapun.

**Acceptance Criteria**:
- [ ] Dashboard menampilkan KPI dari seluruh modul.
- [ ] Role management tidak dapat mengubah data apapun.
- [ ] Data yang ditampilkan mencerminkan kondisi terkini.

---

### 2.12 Modul: User, Role, & Permission

---

#### FEAT-RBAC-01 — Manajemen User dan Role

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-RBAC-01 |
| **Nama** | Manajemen User dan Role |
| **Modul** | User & RBAC |
| **Status** | MVP (Must Have — NFR-03) |
| **Role** | `super_admin` / administrator |
| **Referensi BRD** | Section 4, NFR-03, BR-ROL-01 hingga BR-ROL-05 |

**Deskripsi**: Manajemen akun pengguna dan penetapan role menggunakan Filament Shield & Spatie Laravel Permission.

**7 Role Sistem**:
1. `marketing` — Sales Order
2. `ppic` — SPK & Planning
3. `purchasing` — Purchasing & MRP
4. `warehouse` — Gudang Bahan Baku
5. `admin_operasional` — Produksi & Pengiriman (1 role rangkap)
6. `finance` — Billing & AR
7. `management` — Dashboard read-only

**Aturan Bisnis**:
- Role mengikuti tanggung jawab aktual staf, bukan nama jabatan (BR-ROL-01).
- `admin_operasional` menggabungkan hak akses Produksi dan Pengiriman karena dirangkap 1 staf (BR-ROL-02).
- Penggabungan role tidak boleh menyatukan domain data atau alur transaksi antar modul Produksi dan Pengiriman (BR-ROL-03 — TECHNICAL CONSTRAINT).
- `warehouse` hanya Gudang Bahan Baku; SJ dan konfirmasi pengiriman FG ada di `admin_operasional` (BR-ROL-04).
- Operator lini dan QC tidak memiliki akun login (CONFIRMED DESIGN DECISION).

**PENDING DECISION (TBD-01)**: Validasi final pemetaan role sebelum Filament Shield dikunci di production — wajib divalidasi manajemen.

**Acceptance Criteria**:
- [ ] 7 role sistem tersedia dan dapat ditetapkan ke user.
- [ ] Akses per modul dibatasi sesuai role.
- [ ] Operator lini dan QC tidak memiliki akun.
- [ ] Perubahan role memerlukan permission administrator.

---

### 2.13 Modul: Laporan & Ekspor

---

#### FEAT-RPT-01 — Laporan Shortage Material

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-RPT-01 |
| **Nama** | Laporan Shortage Material |
| **Modul** | Laporan |
| **Status** | MVP (Should Have — F-15) |
| **Role** | Lintas modul |
| **Referensi BRD** | F-15 |

**Deskripsi**: Fitur untuk menginput dan memantau kekurangan bahan secara fleksibel lintas bagian, memicu tindak lanjut Purchasing.

**Acceptance Criteria**:
- [ ] Pengguna lintas modul dapat melaporkan kekurangan bahan.
- [ ] Laporan shortage dapat dipantau Purchasing untuk tindak lanjut.

---

#### FEAT-RPT-02 — Ekspor Dokumen Umum

| Atribut | Detail |
| :--- | :--- |
| **ID** | FEAT-RPT-02 |
| **Nama** | Ekspor Dokumen Umum (PDF/Excel) |
| **Modul** | Laporan |
| **Status** | **PENDING DECISION** — Could Have (F-16); status penyertaan dalam MVP belum diputuskan |
| **Role** | Semua modul |
| **Referensi BRD** | F-16, Section 12 |

**Deskripsi**: Ekspor laporan dan data ke format PDF/Excel lintas modul. Berbeda dari fungsi cetak SJ fisik resmi (F-08 — sudah MVP).

> **PENDING DECISION**: F-16 berstatus Could Have dan penyertaannya dalam MVP belum diputuskan (Section 12 BRD). Jangan implementasi tanpa konfirmasi scope.

---

## 3. Aturan FG Multi-Lokasi

Berdasarkan BRD F-04, BR-QC-04, BR-QC-05, BR-QC-06, NFR-02, NFR-04:

### 3.1 Prinsip Dasar

- Stok FG dicatat berdasarkan **Part** dan **Lokasi** (kombinasi Part + Lokasi = satu saldo).
- Lokasi dapat berupa **Lane** (lini produksi) atau **Gudang FG** sesuai konfigurasi.
- **Lokasi transit tidak diwajibkan** BRD; tersedia sebagai tipe lokasi opsional jika dibutuhkan.
- FG tidak harus transit ke gudang sebelum dikirim; pengiriman dapat langsung dari lane.

### 3.2 Ledger Inventory FG

- Tabel `fg_inventory_movements` bersifat **append-only** — tidak ada delete atau update pada baris yang sudah ada.
- Setiap baris wajib: `user_id`, `created_at`, `movement_type`, `reference_type`, `reference_id`, `qty`, `notes`.
- Tipe pergerakan: `in` (FG masuk), `out` (pengiriman dikonfirmasi), `transfer` (pindah lokasi), `adj` (adjustment dengan alasan).

### 3.3 Larangan Saldo Negatif

- Setiap mutasi stok keluar (`out`, `transfer`) wajib memvalidasi saldo di lokasi asal sebelum diproses.
- Jika saldo tidak mencukupi, transaksi ditolak dan pesan error ditampilkan.
- Saldo negatif dilarang mutlak (NFR-02, Section 9.1).

### 3.4 Konsistensi Transfer Antar Lokasi

- Transfer antar lokasi harus dilakukan dalam **1 transaksi DB atomik** (ACID).
- Pengurangan di lokasi asal dan penambahan di lokasi tujuan harus terjadi bersamaan.
- Jika salah satu gagal, seluruh transfer di-rollback.
- Total saldo seluruh lokasi untuk 1 part tidak boleh berubah akibat transfer.

---

## 4. Aturan Delivery dan Surat Jalan

Berdasarkan BRD Section 5.6, BR-DEL-01 hingga BR-DEL-06:

### 4.1 Status SJ dan Dampak Stok

| Status SJ | Memotong Stok FG? | Referensi BRD |
| :--- | :--- | :--- |
| Draft | Tidak | BR-DEL-03 |
| Printed | Tidak | BR-DEL-04 |
| Delivered | Ya — hanya pada saat konfirmasi | BR-DEL-05 |

**Ini adalah aturan bisnis yang telah dikonfirmasi (CONFIRMED DESIGN DECISION). Tidak boleh diubah demi menyederhanakan implementasi.**

### 4.2 Alur Konfirmasi Pengiriman

1. Admin membuat SJ — status: **Draft** — stok FG tidak berubah.
2. Admin mencetak SJ — status: **Printed** — stok FG tidak berubah.
3. Barang dikirim fisik ke pelanggan.
4. SJ fisik kembali ke kantor bertandatangan pelanggan.
5. Admin klik "Konfirmasi Pengiriman" — stok FG berkurang — status: **Delivered**.

### 4.3 Partial Delivery

- Skenario partial delivery didukung (BR-SO-03): 1 SO dapat memiliki beberapa SJ (delivered bertahap).
- Setiap SJ hanya memotong stok sesuai qty yang ada di SJ tersebut.
- Kumulatif pengiriman dipantau di Modul Verifikasi SJ vs PO.

---

## 5. Aturan Billing dan Validasi

Berdasarkan BRD Section 5.7, Section 5.8, BR-CTL-01 hingga BR-CTL-06, BR-BIL-01 hingga BR-BIL-09:

### 5.1 Perlindungan Kuantitas Billing

- Qty yang ditagih per line item **tidak boleh melebihi** qty yang terkirim (Delivered) dan terverifikasi (Matched).
- Sumber kebenaran qty: `delivery_order_items.qty_shipped` dari SJ berstatus Delivered dan Matched.
- Finance tidak dapat mengubah qty di Invoice melebihi batas ini.

### 5.2 Validasi SJ vs PO (Kumulatif)

- Perhitungan wajib kumulatif, bukan 1 SJ vs 1 PO (BR-CTL-02).
- Logika Matched (DESIGN ASSUMPTION untuk demo): kumulatif kirim <= qty SO dan part number sesuai (BR-CTL-04).
- Logika Matched yang tepat (validasi bisnis riil) menunggu keputusan resmi.

### 5.3 Pemisahan Validasi Teknis dan Kebijakan Exception

| Aspek | Status |
| :--- | :--- |
| Implementasi perhitungan kumulatif dan penentuan Matched/Exception | Dapat diimplementasikan |
| Prosedur resolusi jika Exception (revisi PO, retur, tagih terpisah?) | TBD-10 — belum diputuskan |
| Penanggung jawab resmi verifikasi | TBD-09 — belum diputuskan |

### 5.4 Pencegahan Double Billing

- 1 SJ tidak dapat dimasukkan ke 2 Invoice berbeda.
- Sistem memvalidasi bahwa setiap SJ line item yang dipilih Finance belum ada di Invoice yang sudah diterbitkan.

### 5.5 Hal yang Tidak Diasumsikan

- Harga satuan tidak diasumsikan; pengaturan waktu input harga belum diputuskan (TBD-09).
- Termin pembayaran tidak diasumsikan; TBD-14 belum ditetapkan nilai tepatnya.
- Format Invoice resmi belum dikumpulkan; TBD-08 masih open.

---

## 6. Persyaratan Non-Fungsional

Berdasarkan BRD Section 7, NFR-01 hingga NFR-05:

| Kode | Kategori | Spesifikasi | Referensi BRD |
| :--- | :--- | :--- | :--- |
| NFR-01 | Performa | Response time transaksi <= 2 detik pada jaringan operasional (LAN intranet/akses stabil ke host) | NFR-01 |
| NFR-02 | Integritas Inventory | Transaksi ACID mutlak; larangan saldo negatif (zero negative stock); mekanisme penjamin konsistensi sesuai keputusan arsitektur (Section 8.2) | NFR-02 |
| NFR-03 | Keamanan RBAC | Auth via Filament Shield; 7 role sistem; operator & QC tanpa akun | NFR-03 |
| NFR-04 | Audit Trail | `inventory_movements` dan `fg_inventory_movements` bersifat append-only; setiap baris wajib menyimpan: `user_id`, `created_at`, `movement_type`, `reference_type`, `reference_id`, `qty`, `notes` | NFR-04 |
| NFR-05 | Availability | Sistem tersedia penuh saat jam kerja pabrik; `innodb_flush_log_at_trx_commit = 1`; backup otomatis harian ke storage eksternal | NFR-05 |

**KPI Keberhasilan (dari BRD Section 7)**:

| KPI | Target |
| :--- | :--- |
| Waktu perekaman laporan produksi | <= 2 jam setelah shift/hari kerja |
| Akurasi stok (stock opname) | Selisih fisik vs sistem < 0,5% |
| Kebenaran Invoice | 0% kesalahan kuantitas |
| Response time sistem | <= 2 detik |
| Ketertelusuran dokumen | 100% dapat ditelusuri ke SO asal |

> Catatan: Target performa, retensi backup, RPO, dan RTO yang tidak disebutkan di BRD **tidak diasumsikan** di dokumen ini.

---

## 7. Daftar TBD dan Blocker

Berdasarkan BRD Section 11. Seluruh item berikut **belum memiliki keputusan resmi**.

### 7.1 Prioritas Tinggi — Sprint Blocker

| ID | Pertanyaan | Fitur Terdampak | Dapat Coding Tanpa Keputusan? |
| :--- | :--- | :--- | :--- |
| TBD-01 | Validasi final pemetaan seluruh role sistem sebelum Filament Shield dikunci di production | FEAT-RBAC-01 | Ya — gunakan pemetaan Section 4 BRD sebagai fallback |
| TBD-02 | Trigger pemotongan stok FG: saat truk berangkat atau saat SJ bertandatangan kembali? | FEAT-DEL-03 | Ya — fallback: konfirmasi saat SJ kembali (Opsi B); logika dapat diubah nanti |
| TBD-03 | Mekanisme serah terima fisik FG dari QC ke Admin Operasional | FEAT-PR-02 | Ya — fallback: Admin input berdasarkan bukti fisik; form serah terima diparaf supervisor |
| TBD-04 | Baseline jadwal: tanggal cut-off baru dan target go-live resmi | Master schedule | Ya — tidak memblokir implementasi fitur |

### 7.2 Prioritas Sedang — Perlu Sebelum UAT

| ID | Pertanyaan | Fitur Terdampak | Dapat Coding Tanpa Keputusan? |
| :--- | :--- | :--- | :--- |
| TBD-05 | Relasi database SPK ke SO: 1:1 atau N:1? | FEAT-SPK-01 | Ya — `so_id` nullable |
| TBD-06 | Formula MRP eksak Purchasing di Excel (variabel tambahan?) | FEAT-PUR-01 | Ya — formula simulasi demo dipakai |
| TBD-07 | Format template, penomoran, rangkap cetak SJ resmi Nutech | FEAT-DEL-01, FEAT-DEL-02 | Ya — format standar industri sementara |
| TBD-08 | Format, penomoran, field Invoice resmi PT Nutech | FEAT-BIL-01 | Ya — penomoran otomatis standar sementara |
| TBD-09 | Penanggung jawab resmi verifikasi SJ vs PO | FEAT-CTL-01 | Ya — fallback: Finance memverifikasi |
| TBD-10 | Prosedur resolusi Exception over-delivery | FEAT-CTL-01, FEAT-BIL-01 | Ya — fallback: SJ Exception diblokir dari billing |
| TBD-11 | Wewenang approval urgent SO | FEAT-SO-01 | Ya — fallback: Urgent diinput langsung dengan flag |
| TBD-12 | Approval PO Supplier oleh Direktur | FEAT-PUR-02 | Ya — fallback: PO langsung diterbitkan Purchasing |
| TBD-13 | Frekuensi input produksi: per shift atau per hari? | FEAT-PR-01 | Ya — form support input per tanggal (fleksibel) |
| TBD-14 | Termin pembayaran standar Invoice | FEAT-BIL-02 | Parsial — sistem support konfigurasi termin; nilai default tidak diasumsikan |
| TBD-15 | Nilai riil standard BOM dan scrap allowance per part | FEAT-MD-09, FEAT-PUR-01 | Ya — placeholder demo digunakan; wajib divalidasi sebelum go-live |

### 7.3 Prioritas Rendah — Polishing

| ID | Pertanyaan | Fitur Terdampak | Dapat Coding Tanpa Keputusan? |
| :--- | :--- | :--- | :--- |
| TBD-16 | Dropdown alasan gap/downtime atau free text? | FEAT-PR-01 | Ya — free text untuk demo |
| TBD-17 | Safety stock minimum per material | FEAT-WH-02 | Ya — field tersedia tapi tidak wajib diisi |
| TBD-18 | Istilah baku tanda terima pelanggan (THF/TEH/Delivery Receipt) | FEAT-DEL-01 | Ya — sementara: "Tanda Terima Pengiriman" |
| TBD-19 | Format penomoran SO dan SPK | FEAT-SO-01, FEAT-SPK-01 | Ya — penomoran otomatis sistem sementara |

---

## 8. Fitur Out of Scope

| Nama | Alasan | Referensi BRD |
| :--- | :--- | :--- |
| QC Report Digital (Form 4M, deklarasi FG oleh akun QC) | Laporan QC fisik tetap AS-IS; modul digital tidak diimplementasikan | Section 2.2, BR-QC-03, Section 9.2 |
| Role Login Khusus QC | Out of scope bersama modul QC Digital | Section 2.2 |
| Pemisahan Role Admin Produksi & Pengiriman | Dirangkap 1 orang, digabung ke `admin_operasional` | Section 2.2, BR-ROL-02 |
| Formula MRP Eksak (dari Excel Purchasing) | Menggunakan simulasi demo untuk MVP | Section 2.2, BR-MAT-07 |
| HR/Payroll, presensi biometrik, rekrutmen | Di luar domain ERP manufaktur ini | Section 2.2 |
| Pembukuan GL, Neraca, Jurnal Penyesuaian | Hanya AR tracking sederhana | Section 2.2, BR-BIL-06 |
| IoT / sensor mesin / SCADA | Di luar scope | Section 2.2 |
| Portal B2C / e-commerce | Di luar scope | Section 2.2 |
| Payment gateway perbankan otomatis | Di luar scope | Section 2.2 |
| Penanganan Retur Terpadu | Prosedur belum ditetapkan (BR-DEL-08) | BR-DEL-08 |

---

## 9. Ringkasan Status Fitur

| ID | Nama Fitur | Modul | Status | Referensi BRD |
| :--- | :--- | :--- | :--- | :--- |
| FEAT-MD-01 | Manajemen Customer | Master Data | MVP | Section 8.4 |
| FEAT-MD-02 | Manajemen Part/Item | Master Data | MVP | Section 8.4 |
| FEAT-MD-03 | Manajemen Supplier | Master Data | MVP | Section 8.4 |
| FEAT-MD-04 | Manajemen Lane | Master Data | MVP | Section 8.4 |
| FEAT-MD-05 | Manajemen Lokasi | Master Data | MVP | Section 8.4 |
| FEAT-MD-06 | Manajemen Material | Master Data | MVP | Section 8.4 |
| FEAT-MD-07 | Manajemen UoM | Master Data | MVP | Section 8.4 |
| FEAT-MD-08 | Pack Conversion Config | Master Data | MVP | F-14, BR-PR-04/05 |
| FEAT-MD-09 | Bill of Materials | Master Data | MVP (nilai DESIGN ASSUMPTION) | BR-MAT-05/06 |
| FEAT-SO-01 | Input Sales Order | Sales Order | MVP | F-01, BR-SO-01/02 |
| FEAT-SO-02 | Pemantauan Status SO | Sales Order | MVP | BR-SO-03/06 |
| FEAT-SPK-01 | Pembuatan SPK Bulanan | PPIC | MVP | F-02, BR-SPK-01/05 |
| FEAT-SPK-02 | Monitoring Gap | PPIC | MVP | BR-PR-01/03 |
| FEAT-PUR-01 | Simulasi MRP | Purchasing | MVP (DESIGN ASSUMPTION) | F-05, BR-MAT-06 |
| FEAT-PUR-02 | Purchase Order Supplier | Purchasing | MVP | F-06, BR-MAT-09 |
| FEAT-WH-01 | GRN Penerimaan Material | Gudang | MVP | F-06, BR-MAT-01 |
| FEAT-WH-02 | Kartu Stok Material | Gudang | MVP | F-06, NFR-04 |
| FEAT-WH-03 | Material Issue Bertahap | Gudang | MVP | F-07, BR-MAT-02/03 |
| FEAT-WH-04 | Stock Adjustment Material | Gudang | MVP (Should Have) | F-13 |
| FEAT-PR-01 | Input Laporan Produksi | Produksi | MVP | F-03, BR-PR-01/07 |
| FEAT-PR-02 | Pencatatan FG ke Inventory | Produksi/FG | MVP | F-03/04, BR-QC-02 |
| FEAT-FG-01 | Stok FG Multi-Lokasi | FG Inventory | MVP | F-04, NFR-02/04 |
| FEAT-FG-02 | Transfer FG Antar Lokasi | FG Inventory | MVP | F-04, NFR-02 |
| FEAT-FG-03 | Stock Adjustment FG | FG Inventory | MVP (Should Have) | F-13 |
| FEAT-DEL-01 | Pembuatan Surat Jalan | Pengiriman | MVP | F-08, BR-DEL-01/05 |
| FEAT-DEL-02 | Cetak Surat Jalan | Pengiriman | MVP | F-08, BR-DEL-04 |
| FEAT-DEL-03 | Konfirmasi Pengiriman | Pengiriman | MVP | F-08, BR-DEL-05/06 |
| FEAT-CTL-01 | Verifikasi Kumulatif SJ vs SO | Kontrol | MVP | F-09, BR-CTL-01/04 |
| FEAT-BIL-01 | Invoice Bulanan Multi-SJ | Billing | MVP | F-10, BR-BIL-01/04 |
| FEAT-BIL-02 | Payment Tracking / AR | Finance | MVP | F-11, BR-BIL-05/06 |
| FEAT-DSH-01 | Dashboard KPI Manajemen | Dashboard | MVP (Should Have) | F-12 |
| FEAT-RBAC-01 | Manajemen User dan Role | RBAC | MVP | Section 4, NFR-03 |
| FEAT-RPT-01 | Laporan Shortage Material | Laporan | MVP (Should Have) | F-15 |
| FEAT-RPT-02 | Ekspor Dokumen Umum | Laporan | PENDING DECISION | F-16, Section 12 |
