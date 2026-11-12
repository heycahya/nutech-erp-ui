# NUTECH ERP — High-Fidelity UI Prototype

Sistem Informasi Perencanaan & Operasional Terintegrasi untuk Manufaktur Komponen Otomotif (Tier-2 Supplier) **PT Nutech Pundi Arta**.

Prototype ini mengimplementasikan antarmuka pengguna (UI/UX) untuk **7 Role Operasional** berdasarkan spesifikasi resmi dokumen sumber (*Business Requirement Document* v3.0, *Features Matrix*, *Design Guidelines*, dan *Data Seeder*).

---

## 1. Quick Start & Execution

### Prasyarat
- Node.js >= 18.x
- NPM atau Bun

### Instalasi & Menjalankan Server Dev
```bash
# Instalasi dependencies
npm install

# Menjalankan server pengembangan (Port 3000)
npm run dev

# Memeriksa static type checking
npm run lint

# Menjalankan unit tests logika murni
npm test

# Build produksi
npm run build
```

Aplikasi berjalan pada: `http://localhost:3000`

---

## 2. Ikhtisar 7 Role Operasional

Aplikasi dirancang dengan *Role-Based Access Control* (RBAC) frontend yang dapat disimulasikan secara instan melalui **Role Switcher** di bilah atas:

| Role | Kode | Hak Akses | Fokus Fungsional Utama |
| :--- | :--- | :--- | :--- |
| **Marketing & Komersial** | `marketing` | Operasional | Sales Order Management, Multi-track fulfillment (Produksi, Pengiriman, Billing), Master Customer B2B, Katalog Part Komponen. |
| **PPIC (Perencanaan)** | `ppic` | Operasional | SPK Bulanan per Lini, Perencanaan Target Harian (Terkunci), Monitoring Gap Produksi, Rasio Konversi Pack-to-PCS, Master Lini (Lane 1-3 aktif, Lane 4 TBD). |
| **Purchasing (Pengadaan)**| `purchasing` | Operasional | Simulasi Estimasi Kebutuhan Material (MRP Demo), Laporan Defisit/Shortage (PR), Purchase Order Supplier Bahan Baku, Monitoring Inbound, Master Supplier & Material. |
| **Warehouse (Bahan Baku)**| `warehouse` | Operasional | Goods Receipt Note (GRN) terhubung PO, Saldo Multi-Lokasi Rak, Material Issue ke Lini SPK, Kartu Stok Ledger (Append-Only), Stock Adjustment. |
| **Admin Operasional** | `admin_operasional`| Operasional | Terbagi tegas 2 sub-domain:<br>1. **Produksi**: Laporan Harian, Input Aktual per Shift, Downtime/OEE, Multi-Lokasi Finished Goods.<br>2. **Pengiriman**: Monitoring Delivery, Pengelolaan Surat Jalan (SJ), Audit Pencocokan SO-SJ, Riwayat Log Pengiriman. |
| **Finance (Billing & AR)**| `finance` | Operasional | Audit Gerbang Penagihan (Ready to Bill), Pembuatan Faktur Multi-SJ, Manajemen Faktur Komersial (PPN 11%), Pelacakan Piutang Dagang (AR), Pencatatan Kas Masuk, AR Aging Analysis (TBD-14). |
| **Direksi & Manajemen** | `management` | **Murni Read-Only** | Ringkasan Eksekutif 5 Domain (Kinerja Lini, Bahan Baku, Stok FG, Status SJ, Piutang AR), Isolasi Pengecualian Integritas Data (SO-0043), Analisis Aging Kredit. |

---

## 3. Baseline Data & Ketentuan Integritas

Sistem memelihara integritas data transaksi bawaan (*seeded baseline*) dari Phase 01:
- **Total Volume Order (5 Seeded SO)**: `25.900 PCS` (`SO-2026-0041` s.d. `SO-2026-0045`).
- **Verified Delivered (Fisik SJ)**: `7.700 PCS` (`SJ-2026-0089` 6.500 PCS + `SJ-2026-0090` 1.200 PCS).
- **Verified Billed (Faktur Resmi)**: `2.500 PCS` (`soi-101` via `INV-2026-11-001`).
- **Unbilled Terkirim Fisik**: `5.200 PCS` (`7.700 - 2.500 PCS` siap ditagihkan).
- **Internal SO `qtyDelivered`**: `13.700 PCS` (Termasuk 6.000 PCS `SO-0043` unverified; diberi label semantik transparan).
- **Internal SO `qtyBilled`**: `8.500 PCS` (Termasuk 6.000 PCS `SO-0043` unverified; diberi label semantik transparan).
- **Isolasi SO-2026-0043**: Diisolasi sebagai *Data Integrity Exception* (tidak ada Surat Jalan fisik), dilarang masuk KPI Delivered, KPI Billed, maupun proses penagihan faktur resmi.

---

## 4. Standar Desain Antarmuka (Enterprise Design System)

- **Palette**:
  - Warna Utama / Brand: `#0057d2` (Nutech Sapphire Blue)
  - Hover / Active: `#0049b0` / `#00368a`
  - Text Utama: `#223548` & `#000000`
  - Text Sekunder: `#545454` & `#475e75`
  - Garis Batas / Border: `#d5dce2`
  - Background Shell: `#f5f6f7`
- **Layout & Dimensi**:
  - Viewport Acuan: `1440 × 900` Desktop
  - Sidebar: `248px` (Expanded) / `64px` (Collapsed) dengan transisi mulus
  - Topbar Header: `52px` persistent
  - Page Breadcrumb Header: `40px`
  - Footer Status Bar: `28px` persistent
- **Zero-Pill Discipline**:
  - Border radius komponen dibatasi maksimal `4px` (kecuali avatar 6px).
  - Tidak menggunakan pill capsule (`rounded-full`) untuk status bisnis; badge status menggunakan kotak proporsional dengan label teks tegas dan kontras tinggi.

---

## 5. Dokumentasi Teknis Lanjutan

Detail arsitektur dan panduan penyerahan developer tersedia dalam berkas berikut:
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — Struktur arsitektur aplikasi frontend, state management, dan aliran data.
- [`MODULES.md`](./MODULES.md) — Rincian modul dan halaman pada setiap dari 7 role.
- [`UI-COMPONENTS.md`](./UI-COMPONENTS.md) — Katalog komponen UI, layout pattern, form, modal, dan drawer.
- [`DEVELOPER-HANDOFF.md`](./DEVELOPER-HANDOFF.md) — Panduan transisi ke full-stack developer (kontrak API, skema DB, dan event model).
- [`KNOWN-LIMITATIONS.md`](./KNOWN-LIMITATIONS.md) — Daftar batasan prototipe frontend, keputusan TBD, dan roadmap backend.
