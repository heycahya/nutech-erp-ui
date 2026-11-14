# NUTECH ERP UI Prototype (Pure HTML5 & CSS3 — Zero JavaScript Edition)

Prototipe antarmuka pengguna (UI Prototype) **Sistem Informasi Manufaktur Terintegrasi PT Nutech Manufaktur Komponen (NUTECH ERP)** yang dibangun sepenuhnya menggunakan **Pure HTML5 & CSS3 (100% Zero JavaScript)** dengan tingkat presisi visual dan ketepatan data operasional 1:1 (*pixel-perfect*) pada resolusi desktop `1440 × 900`.

---

## Fitur Utama & Arsitektur Zero-JavaScript

Seluruh interaksi antarmuka berjalan secara *native* di browser hanya dengan mengandalkan spesifikasi standar **HTML5** dan **CSS3**:

- **Zero JavaScript (`0 KB` JS):** Tidak ada file `.js`, tag `<script>`, maupun atribut *inline event handler* (`onclick`, `onchange`).
- **Sidebar Collapse & Expand (`248px` ↔ `64px`):** Menggunakan *hidden checkbox* (`#sidebar-toggle:checked`) dan CSS *general sibling combinator* (`~`).
- **Role Switcher Dropdown (RBAC 7 Peran):** Menggunakan *hidden checkbox* (`#role-dropdown-toggle:checked`) lengkap dengan *backdrop* penutup otomatis saat diklik di luar panel.
- **Modal Dialog Interaktif:** Menggunakan *pseudo-class* `:target` (`#modal-create-so`, `#modal-actual-entry`, `#modal-create-sj`, `#modal-confirm-sj`, `#modal-sj-printed`, `#modal-create-invoice`, `#modal-record-payment`, dll.) serta halaman *pre-opened modal state* (`.is-open`) untuk inspeksi visual instan.
- **Filter Tabel, Tab Switching & Split-Pane Detail:** Menggunakan grup `<input type="radio">` yang dikombinasikan dengan selektor CSS3 di `css/pages.css`.
- **Single-File Self-Contained SVG Icons:** Seluruh ikon vektor menggunakan `<svg>` + `<symbol id="...">` dan `<use href="#...">` langsung di setiap dokumen HTML tanpa ketergantungan *library* eksternal.

---

## Cara Menjalankan Proyek

Karena proyek ini murni terdiri dari dokumen statis HTML5 dan CSS3, Anda tidak memerlukan *Node.js*, *npm*, atau proses *build* apa pun.

### 1. Menggunakan Server HTTP Lokal (Direkomendasikan)
Jalankan perintah berikut dari direktori *root* proyek:

```bash
python3 -m http.server 8080
```

Kemudian buka di browser (Chrome / Brave / Firefox / Edge):
- **Halaman Utama (Entry Point):** `http://localhost:8080/` atau `http://localhost:8080/index.html`

### 2. Membuka Langsung dari File Explorer
Anda juga dapat membuka file `index.html` atau halaman mana pun di dalam folder `pages/<role>/` secara langsung melalui protokol `file://` di browser.

### 3. Deploy ke GitHub Pages / Static Hosting
Proyek ini siap langsung di-*deploy* ke **GitHub Pages**, **Netlify**, **Vercel**, atau **Cloudflare Pages** dari *root directory* (`/`) tanpa langkah kompilasi.

---

## Daftar Lengkap 7 Role RBAC & Modul Operasional

| No | Role (Peran RBAC) | Direktori | Halaman & Modul Tersedia |
| :-: | :--- | :--- | :--- |
| **1** | **Management** *(Direksi — Read-Only)* | `pages/management/` | • `dashboard.html` — Ringkasan Eksekutif, Hero Produksi (`99,26%`), Ringkasan AR & Isolasi Anomali `SO-2026-0043`<br>• `production-monitoring.html` — Monitoring Pencapaian Target vs Aktual 3 Lini<br>• `stock-valuation.html` — Valuasi Persediaan FG (`7.200 PCS`) & Bahan Baku RM<br>• `ar-aging.html` — Analisis Umur Piutang Pelanggan (Read-Only) |
| **2** | **Marketing** *(Divisi Komersial)* | `pages/marketing/` | • `sales-orders.html` — Daftar Sales Order (PO Customer) & Modal Input SO<br>• `sales-orders-split.html` — Split-Pane Detail Rincian 4 Sales Order<br>• `sales-order-form.html` — Halaman State Modal Form Buat SO Terbuka<br>• `customers.html` — Master Data Pelanggan OEM (ADM, TMMI, HMMI, NKU)<br>• `parts.html` — Katalog 6 Part Komponen Otomotif & Spesifikasi BOM<br>• `so-fulfillment.html` — Pelacakan Pemenuhan Pesanan & Jadwal Kirim |
| **3** | **PPIC** *(Perencanaan & Pengendalian)* | `pages/ppic/` | • `spk.html` — Manajemen Surat Perintah Kerja (SPK) & Modal Buat SPK<br>• `daily-targets.html` — Perencanaan Target Harian per Lini (`6.800 PCS`)<br>• `gap-monitoring.html` — Monitoring Gap Target vs Aktual (`+50 PCS Defisit` Lini 2)<br>• `pack-ratio.html` — Konfigurasi Standar Kemasan (Box/Polybag/Pallet ke PCS)<br>• `master-lanes.html` — Master Data 3 Lini Produksi & Kapasitas Mesin |
| **4** | **Purchasing** *(Pengadaan Material)* | `pages/purchasing/` | • `mrp.html` — Simulasi Kebutuhan Bahan Baku (MRP) & Kalkulasi Defisit Batch<br>• `purchase-orders.html` — Manajemen PO Supplier & Modal Penerbitan PO<br>• `shortage.html` — Peringatan Kekurangan Stok Kritis (*Shortage Alerts*)<br>• `inbound-monitoring.html` — Pelacakan Kedatangan PO Supplier (*In-Transit*)<br>• `suppliers.html` — Direktori Master Pemasok Bahan Baku<br>• `materials.html` — Katalog Bahan Baku (EPDM, PU Foam, EVA Sponge) |
| **5** | **Warehouse** *(Gudang Bahan Baku RM)* | `pages/warehouse/` | • `monitoring.html` — Dashboard Operasional Gudang RM, Antrean PO & Live Ledger<br>• `grn.html` — Penerimaan Barang (*Goods Receipt Note* / GRN) & Konversi Kemasan<br>• `raw-materials.html` — Saldo Stok Fisik (`840 Kg`, `1.250 Sheet`, `950 Sheet`) & Lokasi Rak (`RAK-A-01`, `RAK-B-04`, `PALLET-C-02`)<br>• `material-issue.html` — Pengeluaran Material ke Lini Produksi berbasis SPK<br>• `stock-ledger.html` — Kartu Stok / Buku Besar Mutasi Masuk-Keluar RM<br>• `stock-adjustment.html` — Penyesuaian Stok & Rekonsiliasi *Stock Opname* |
| **6** | **Admin Produksi & Pengiriman** *(Operasional Pabrik)* | `pages/production/`<br>`pages/delivery/` | **Modul Produksi (`pages/production/`):**<br>• `monitoring.html` — Monitoring Lantai Produksi & Modal Input Aktual<br>• `actual-entry-modal.html` — State Modal Input Hasil Produksi Aktual Terbuka<br>• `daily-report.html` — Laporan Harian Produksi Shift (LHP)<br>• `fg-stocks.html` — Stok Multi-Lokasi FG (`7.200 PCS` = `4.200` Ujung Lini + `3.000` Gudang FG)<br>• `history.html` — Riwayat & Log Eksekusi Produksi 9 Shift<br>• `downtime.html` — Catatan Downtime Mesin, Pergantian Pisau/Dies & OEE<br><br>**Modul Pengiriman (`pages/delivery/`):**<br>• `monitoring.html` — Monitoring Ekspedisi & Siklus Surat Jalan<br>• `sj-management.html` — Pengelolaan Surat Jalan (`Draft` → `Printed` → `Delivered`)<br>• `create-sj-modal.html`, `confirm-sj-modal.html`, `sj-printed.html` — State Modal Buat SJ, Konfirmasi POD, & Pratinjau Cetak SJ<br>• `so-matching.html` — Rekonsiliasi SO vs SJ Fisik (`7.700 PCS`) & Audit *Billing Gate*<br>• `history.html` — Arsip Riwayat Keberangkatan Armada & POD |
| **7** | **Finance** *(Keuangan & Penagihan)* | `pages/finance/` | • `dashboard.html` — Ringkasan Keuangan, *Billing Gate* & Piutang (`Rp 20.535.000`)<br>• `ready-to-bill.html` — Antrean Pengiriman Siap Tagih (`5.200 PCS`) & Isolasi Anomali `SO-2026-0043`<br>• `invoices.html` — Manajemen Faktur (`INV-2026-11-001`) & Pencatatan Pelunasan<br>• `accounts-receivable.html` — Buku Besar Piutang Pelanggan (3 Tab: Faktur, Customer, Kas Masuk)<br>• `ar-aging.html` — Analisis Umur Piutang (*AR Aging Schedule*) |

---

## Struktur Direktori Proyek

```text
.
├── README.md                              # Dokumentasi proyek Pure HTML5 & CSS3
├── index.html                             # Entry point utama aplikasi (Management Dashboard + Navigasi 7 Role)
├── css/                                   # Arsitektur Stylesheet Modular (5 File CSS3)
│   ├── tokens.css                         # CSS Custom Properties (warna, tipografi, radius, dimensi layout)
│   ├── base.css                           # Reset CSS, tabular numerals (.tnum), scrollbar 6px, utilities
│   ├── shell.css                          # App Shell 5 komponen + Pure CSS Sidebar Collapse & Role Dropdown
│   ├── patterns.css                       # 5 Core UI Patterns (DataTable, KPI/Hero, Form, Split-Pane, Modal)
│   └── pages.css                          # Aturan spesifik modul, filter radio CSS, tab, & cetak Surat Jalan
└── pages/                                 # Seluruh halaman modul berdasarkan Role RBAC (46 File HTML5)
    ├── shell-reference.html               # Halaman referensi state App Shell (Sidebar Collapsed & Role Dropdown)
    ├── management/                        # 4 halaman modul Management (Read-Only)
    ├── marketing/                         # 6 halaman modul Marketing
    ├── ppic/                              # 5 halaman modul PPIC
    ├── purchasing/                        # 6 halaman modul Purchasing
    ├── warehouse/                         # 6 halaman modul Warehouse (Gudang RM)
    ├── production/                        # 6 halaman modul Admin Produksi
    ├── delivery/                          # 7 halaman modul Admin Pengiriman (Surat Jalan)
    └── finance/                           # 5 halaman modul Finance & AR
```
