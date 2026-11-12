# SPESIFIKASI MODUL & HALAMAN NUTECH ERP

Dokumen ini memuat daftar lengkap halaman, subfitur, dan aturan bisnis yang diimplementasikan untuk setiap dari 7 role operasional pada prototype NUTECH ERP.

---

## 1. Role: Management & Direksi (`management`)

**Karakteristik Utama**: Murni **Read-Only** (BR-ROL-01). Seluruh kontrol pengeditan dinonaktifkan secara permanen.

| Halaman | Nav ID | Komponen | Deskripsi & Aturan Bisnis |
| :--- | :--- | :--- | :--- |
| **Executive Dashboard KPI** | `mgmt-kpi` | `ManagementDashboard.tsx` | Ringkasan 5 domain manufaktur otomotif: (1) Output SPK harian, (2) Stok 3 kategori material, (3) Stok fisik FG multi-lokasi (7.200 PCS on-hand), (4) Status 4 Surat Jalan, (5) Kuantitas penagihan fisik (25.900 Total, 7.700 Delivered, 2.500 Billed, 5.200 Unbilled). Dilengkapi panel isolasi pengecualian integritas data `SO-2026-0043`. |
| **Monitoring Produksi Lini** | `mgmt-prod-gap` | `ProductionMonitoringView.tsx` | Monitoring per lini kerja (Lane 1 Rubber, Lane 2 Foam, Lane 3 EVA). Lane 4 ditampilkan dengan badge tegas `PENDING (TBD)` sesuai batasan ekspansi BRD §2.1. |
| **Valuasi Stok Material & FG** | `mgmt-stock-val` | `StockValuationView.tsx` | Breakdown saldo stok fisik bahan baku di gudang dan barang jadi multi-lokasi (Line-End Conveyor 4.200 PCS + Gudang FG 3.000 PCS). Staging Area tidak dihitung sebagai saldo resmi. |
| **AR Aging Piutang** | `mgmt-ar-aging` | `ArAgingView.tsx` | Analisis umur piutang dalam kuantitas PCS resmi (Zero Fake Rupiah) dan transparansi status penangguhan termin kredit (TBD-14). |

---

## 2. Role: Marketing & Komersial (`marketing`)

**Karakteristik Utama**: Pengelolaan pesanan pelanggan dan master data komersial B2B.

| Halaman | Nav ID | Komponen | Deskripsi & Aturan Bisnis |
| :--- | :--- | :--- | :--- |
| **Daftar Sales Order** | `marketing-so-list` | `DataTablePattern.tsx` | Tabel padat data SO (`SO-2026-0041` s.d. `SO-2026-0045`) dengan status produksi, pengiriman, dan billing. Summary row menampilkan total kumulatif 25.900 PCS dan catatan internal SO 13.700 PCS unverified. |
| **Status Pemenuhan Parsial** | `marketing-so-fulfillment`| `OverviewPattern.tsx` | Kartu metrik pemenuhan pelanggan dan pelacakan *three-track downstream status* (Produksi, Pengiriman, Penagihan). |
| **Master Customer B2B** | `marketing-customers` | `CustomerMasterView.tsx` | Direktori 5 mitra manufaktur OEM/Tier-1 (PT Auto Dinamika Manufaktur, PT Trans Mega Motor Indonesia, dsb.), syarat pembayaran, kontak purchasing, dan form input customer baru. |
| **Katalog Part Komponen** | `marketing-parts` | `PartCatalogView.tsx` | Katalog 6 part komponen otomotif (Rubber Gasket, Foam Barrier, EVA Sponge, dll.), gambar komponen, spesifikasi material, dan rasio pack default. |
| **Detail Sales Order** | - (Split-Pane) | `SplitPaneDetailPattern.tsx` | Master-detail view menampilkan header SO, rincian part item, riwayat pengiriman Surat Jalan terkait, dan tombol aksi cetak / edit. |
| **Input Sales Order Baru** | - (Form Input) | `FormInputPattern.tsx` | Form pemesanan dengan multi-item dinamis, konversi Pack-to-PCS otomatis, validasi need date, dan peringatan batas kredit. |

---

## 3. Role: PPIC - Perencanaan Produksi (`ppic`)

**Karakteristik Utama**: Perencanaan bulanan dan penetapan target harian resmi yang mengikat lantai produksi.

| Halaman | Nav ID | Komponen | Deskripsi & Aturan Bisnis |
| :--- | :--- | :--- | :--- |
| **SPK Bulanan per Lini** | `ppic-spk` | `SpkManagementView.tsx` | Pengelolaan Surat Perintah Kerja (SPK) berbasis periode bulanan per lini manufaktur. Form pembuatan SPK dengan alokasi target kumulatif PCS. |
| **Target Harian (Terkunci)**| `ppic-targets` | `DailyTargetPlanningView.tsx` | Matriks target harian per tanggal dan per part. Target hanya dapat disunting oleh role PPIC dan terkunci bagi operator lantai lini. |
| **Monitoring Gap Produksi** | `ppic-gap` | `ProductionGapMonitoringView.tsx`| Monitoring selisih `Target - Actual`. Positif = Defisit, 0 = Tercapai, Negatif = Surplus. Defisit hari ini tidak otomatis dialihkan ke hari berikutnya. |
| **Rasio Pack-to-PCS** | `ppic-pack-ratio` | `PackRatioConfigView.tsx` | Konfigurasi faktor konversi pack resmi per lini dan per part (misal: 50 PCS/pack untuk Rubber Gasket). Melarang duplikasi konfigurasi. |
| **Master Lini Kerja (Lanes)**| `ppic-lanes` | `MasterLanesView.tsx` | Konfigurasi 4 lini manufaktur. Lane 1 (Rubber Cutting - Aktif), Lane 2 (Foam Slicing - Aktif), Lane 3 (EVA Die-cut - Aktif), Lane 4 (Assembly & Packing - PENDING/TBD). |

---

## 4. Role: Purchasing - Pengadaan (`purchasing`)

**Karakteristik Utama**: Estimasi kebutuhan material, purchase requisition, dan pengadaan bahan baku ke pemasok.

| Halaman | Nav ID | Komponen | Deskripsi & Aturan Bisnis |
| :--- | :--- | :--- | :--- |
| **Simulasi MRP Demo** | `purchasing-mrp` | `MrpSimulationView.tsx` | Kalkulasi kebutuhan kotor (gross req) dari target SPK, scrap allowance (asumsi TBD-06), dikurangi stok on-hand gudang untuk menghasilkan saran pembelian material. Tombol pintas "+ Buat PO dari Rekomendasi". |
| **Laporan Kebutuhan (PR)** | `purchasing-shortage` | `MaterialShortageView.tsx` | Manajemen tiket defisit material yang dilaporkan oleh gudang atau sistem, level urgensi (Urgent / Normal), dan konversi menjadi PO. |
| **PO Supplier Bahan Baku** | `purchasing-po` | `PurchaseOrderManagementView.tsx`| Daftar dan form penerbitan Purchase Order multi-item ke supplier bahan baku (PT Indo Synthetic Rubber, PT Foamindo Prima, dsb.), status penerimaan parsial, dan estimasi nilai transaksi. |
| **Monitoring Inbound Bahan** | `purchasing-inbound` | `PurchasingMonitoringView.tsx` | Pelacakan status pengiriman bahan baku dari pemasok dan jadwal kedatangan di pabrik. |
| **Master Supplier** | `purchasing-suppliers` | `SupplierMasterView.tsx` | Direktori pemasok bahan baku, alamat gudang supplier, kontak PIC, dan form penambahan supplier baru. |
| **Master Material & UoM** | `purchasing-materials` | `MaterialMasterView.tsx` | Katalog bahan baku, satuan ukuran (Kg, Sheet, Block), faktor konversi UoM, dan stok minimum buffer. |

---

## 5. Role: Warehouse - Gudang Bahan Baku (`warehouse`)

**Karakteristik Utama**: Penerimaan fisik, penyimpanan lokasi rak, pengeluaran ke lini SPK, dan kartu stok append-only.

| Halaman | Nav ID | Komponen | Deskripsi & Aturan Bisnis |
| :--- | :--- | :--- | :--- |
| **Monitoring Gudang** | `warehouse-monitoring` | `WarehouseMonitoringView.tsx`| Ringkasan operasional gudang material: saldo stok on-hand, GRN menunggu konfirmasi, material issue hari ini, dan tiket kekurangan bahan. |
| **Penerimaan Bahan (GRN)** | `warehouse-grn` | `GoodsReceiptNoteView.tsx` | Pembuatan Goods Receipt Note berbasis PO. Mendukung penerimaan parsial. Kuantitas fisik tidak boleh melebihi sisa PO. Draft GRN tidak menambah stok; stok hanya bertambah saat GRN dikonfirmasi (`Confirmed`). |
| **Saldo Stok & Lokasi Rak** | `warehouse-inventory` | `RawMaterialInventoryView.tsx`| Pemetaan stok per kode material dan lokasi bin rak gudang (Rak A-01, Rak B-02, Rak C-01). Indikator level stok terhadap buffer minimum. |
| **Material Issue ke Lini** | `warehouse-issue` | `MaterialIssueView.tsx` | Pengeluaran bahan baku untuk SPK lini produksi. Menegakkan aturan ketat *Zero-Negative Stock Policy* (pengeluaran dilarang melebihi stok tersedia). |
| **Kartu Stok Ledger Material**| `warehouse-ledger` | `StockLedgerView.tsx` | Catatan mutasi persediaan append-only (tidak dapat diedit/dihapus) yang mencatat tipe transaksi (GRN, Issue, Adjustment), nomor referensi dokumen, dan saldo berjalan. |
| **Penyesuaian Stok (Adj)** | `warehouse-adj` | `StockAdjustmentView.tsx` | Form penyesuaian stok fisik hasil stock opname dengan alasan tertulis dan otorisasi supervisor. |

---

## 6. Role: Admin Operasional (`admin_operasional`)

**Karakteristik Utama**: Terbagi secara tegas menjadi dua domain operasional mandiri: Lantai Produksi dan Ekspedisi Pengiriman.

### A. Sub-Domain: Produksi (Lantai Lini)
| Halaman | Nav ID | Komponen | Deskripsi & Aturan Bisnis |
| :--- | :--- | :--- | :--- |
| **Monitoring Produksi Lini** | `prod-monitoring` | `ProductionMonitoringView.tsx`| Dashboard kinerja shift, total output target vs aktual, persentase capaian pabrik, dan status lini. |
| **Laporan & Input Aktual** | `prod-daily-report` | `DailyProductionReportView.tsx`| Input aktual per lini, tanggal, dan shift. Target PPIC terkunci. Input mendukung PCS atau Pack (rasio konversi otomatis). Catatan produk NG dipisahkan. **Aktual tidak otomatis menambah stok FG.** |
| **Riwayat & Log Produksi** | `prod-history` | `ProductionHistoryView.tsx` | Tabel log rekam jejak produksi shift per part number. |
| **Monitoring Downtime & OEE** | `prod-downtime` | `ProductionDowntimeView.tsx` | Monitoring penyebab gangguan mesin/operasi (Ganti Pisau, Setup Cetakan, Gangguan Daya) dan menit henti. |
| **Stok Finished Goods (FG)** | `prod-fg-stocks` | `FinishedGoodsStockView.tsx` | Monitoring saldo barang jadi di 2 lokasi resmi: *Line-End Conveyor / QC Drop Zone* (4.200 PCS) dan *Gudang FG* (3.000 PCS). Staging Area dilarang menjadi saldo resmi. |

### B. Sub-Domain: Pengiriman (Surat Jalan)
| Halaman | Nav ID | Komponen | Deskripsi & Aturan Bisnis |
| :--- | :--- | :--- | :--- |
| **Monitoring Pengiriman** | `del-monitoring` | `DeliveryMonitoringView.tsx` | Metrik Surat Jalan: Delivered (7.700 PCS), Printed (1.500 PCS), Draft (2.500 PCS). Pipeline pengiriman armada truk. |
| **Pengelolaan Surat Jalan** | `del-sj-list` | `SuratJalanManagementView.tsx`| Tabel daftar SJ (`SJ-2026-0089` s.d. `SJ-2026-0092`). Aksi cetak SJ mengubah Draft menjadi Printed tanpa memotong stok. Tombol aksi "+ Buat Surat Jalan Baru" dan "Konfirmasi Terkirim". |
| **Pencocokan SO & Tagihan** | `del-so-matching` | `DeliveryControlMatchingView.tsx`| Verifikasi kuantitas pengiriman fisik SJ terhadap item pesanan SO. Menandai status `Matched` atau `Exception`. |
| **Riwayat Log Pengiriman** | `del-history` | `DeliveryHistoryView.tsx` | Log pergerakan armada pengiriman, nama pengemudi, nomor polisi, dan waktu serah-terima fisik pelanggan. |
| **Modal Buat Surat Jalan** | - (Modal) | `CreateSuratJalanModal.tsx` | Pembuatan SJ baru dengan validasi kuantitas tidak melebihi sisa pesanan SO dan lokasi asal fisik resmi. |
| **Modal Konfirmasi Delivery**| - (Modal) | `DeliveryConfirmationModal.tsx`| Konfirmasi status `Delivered`. **Hanya pada tahap ini stok FG resmi terpotong (BR-DEL-02).** Validasi ketersediaan stok fisik on-hand sebelum konfirmasi. |

---

## 7. Role: Finance - Keuangan & Penagihan (`finance`)

**Karakteristik Utama**: Audit gerbang penagihan, faktur komersial bulanan, dan piutang usaha (tanpa General Ledger).

| Halaman | Nav ID | Komponen | Deskripsi & Aturan Bisnis |
| :--- | :--- | :--- | :--- |
| **Dashboard Keuangan & AR** | `fin-dashboard` | `FinanceDashboardView.tsx` | Metrik finansial penagihan: Total Faktur (Rp 34.687.500), Kas Diterima (Rp 15.000.000), Sisa Piutang (Rp 19.687.500), Sisa Belum Ditagih (5.200 PCS). Tabel faktur aktif dan antrean SJ siap tagih. |
| **Surat Jalan Siap Ditagih** | `fin-ready-to-bill` | `ReadyToBillView.tsx` | **Audit Gerbang Penagihan (BR-BIL-01)**: Hanya Surat Jalan fisik yang telah `Delivered` dan `Matched` (`SJ-0089` dan `SJ-0090`) yang dapat diproses. SJ Draft dan Printed dikunci sistem. Item `NTC-RUB-0101` yang sudah ditagihkan ditandai `TERTAGIH LENGKAP` (mencegah *double billing*). |
| **Manajemen Faktur (Invoice)**| `fin-invoice-list` | `InvoiceManagementView.tsx` | Split-pane manajemen faktur bulanan gabungan multi-SJ (`INV-2026-11-001`), perhitungan DPP, PPN 11%, dan tracking pelunasan. |
| **Modal Terbitkan Faktur** | - (Modal) | `CreateInvoiceModal.tsx` | Pembuatan faktur komersial gabungan multi-SJ untuk customer yang sama, perhitungan otomatis PPN 11%, form PO customer, dan termin kredit Net 30/Net 45. |
| **Pelacakan Piutang (AR)** | `fin-ar-tracking` | `AccountsReceivableView.tsx`| Monitoring saldo piutang: Tab per Faktur, Tab Rekapitulasi per Customer B2B, dan Tab Riwayat Mutasi Kas Masuk. |
| **Modal Catat Pembayaran** | - (Modal) | `PaymentRecordModal.tsx` | Form pencatatan kas masuk bank (BCA/Mandiri/Giro) dengan validasi larangan overpayment, persentase cepat 100%/50%, dan otomatis memperbarui status faktur menjadi Lunas (`Paid`). |
| **AR Aging & Jatuh Tempo** | `fin-ar-aging` | `ArAgingViewFinance.tsx` | Pengelompokan umur kredit: Lancar (`0-30 Hari`), Lewat `31-60 Hari`, Lewat `61-90 Hari`, dan `> 90 Hari`. Transparansi kepatuhan terhadap kebijakan termin pembayaran TBD-14. |
