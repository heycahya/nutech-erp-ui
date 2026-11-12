# ARSITEKTUR FRONTEND NUTECH ERP

Dokumen ini mendokumentasikan arsitektur sistem antarmuka pengguna (UI/UX) NUTECH ERP Prototype, hirarki komponen, model state terpusat, dan pemisahan logika bisnis dari lapisan presentasi.

---

## 1. Diagram Arsitektur Komponen

```
+--------------------------------------------------------------------------------+
|                                App.tsx (Root State)                            |
+--------------------------------------------------------------------------------+
|  +--------------------------------------------------------------------------+  |
|  | GlobalTopbar: Brand Identity, Role Switcher (7 Role), Operational Date   |  |
|  +--------------------------------------------------------------------------+  |
|  | PageHeaderRail: Dynamic Breadcrumb, Domain Title, Top Context Actions    |  |
|  +--------------------------------------------------------------------------+  |
|  | +-----------------------+ +--------------------------------------------+ |  |
|  | | SidebarNav            | | RoleViewContainer                          | |  |
|  | | (248px / 64px)        | |                                            | |  |
|  | | - Role Badge          | | - Marketing (SO, Customer, Parts)          | |  |
|  | | - Nav Groups & Items  | | - PPIC (SPK, Targets, Gap, Pack, Lanes)    | |  |
|  | | - Badge Counts        | | - Purchasing (MRP, Shortage, PO, Supplier) | |  |
|  | | - Collapse Toggle     | | - Warehouse (GRN, Issue, Stock, Ledger)    | |  |
|  | |                       | | - Admin Operasional (Prod & Delivery)      | |  |
|  | |                       | | - Finance (Billing, Invoices, AR, Aging)   | |  |
|  | |                       | | - Management (5-Domain Executive Read-Only)| |  |
|  | +-----------------------+ +--------------------------------------------+ |  |
|  +--------------------------------------------------------------------------+  |
|  | FooterStatusBar: System Baseline, Active User Simulation, Source of Truth|  |
|  +--------------------------------------------------------------------------+  |
|  | DevelopmentShowcaseBar: DEV/QA Toolbar (Clean Presentation Toggleable)   |  |
|  +--------------------------------------------------------------------------+  |
|  | Global Modals: SJ Confirm, Create SJ, Delivery Confirm, Create Invoice,  |  |
|  |                Payment Record, SO Form, Customer/Part Form, etc.          |  |
+--------------------------------------------------------------------------------+
```

---

## 2. Struktur Direktori Proyek

```
/src
├── /components
│   ├── /patterns              # 5 Reusable Core UI Patterns (Phase 01 Baseline)
│   │   ├── DataTablePattern.tsx        # SAP-style dense table with summary row
│   │   ├── OverviewPattern.tsx         # Executive metric cards & multi-track bars
│   │   ├── FormInputPattern.tsx        # Dense multi-row form with live conversion
│   │   ├── SplitPaneDetailPattern.tsx  # Header-detail layout with tabbed items
│   │   └── ModalDialogPattern.tsx      # Stock mutation confirmation modal
│   ├── /roles                 # Role-Specific View Implementations
│   │   ├── /marketing         # Customer Master, Part Catalog, SO Views
│   │   ├── /ppic              # SPK, Daily Targets, Gap, Pack Ratio, Lanes
│   │   ├── /purchasing        # MRP Demo, PR Shortage, PO, Suppliers, Materials
│   │   ├── /warehouse         # GRN, Material Issue, Stock Inventory, Ledger
│   │   ├── /admin_operasional # Separated Production & Delivery Views/Modals
│   │   ├── /finance           # Ready to Bill, Invoice Mgmt, AR Tracking, Aging
│   │   ├── /management        # Executive 5-Domain Cards & Read-Only Dashboard
│   │   └── RoleViewContainer.tsx  # Master dynamic router across all 7 roles
│   └── /shell                 # Global Shell Chrome & Navigation
│       ├── GlobalTopbar.tsx            # 52px Header & Role Switcher
│       ├── PageHeaderRail.tsx          # 40px Dynamic Breadcrumb
│       ├── SidebarNav.tsx              # 248px/64px Collapsible Sidebar
│       ├── FooterStatusBar.tsx         # 28px Persistent Footer
│       └── DevelopmentShowcaseBar.tsx  # DEV/QA Evaluation Toolbar
├── /data
│   └── mockData.ts            # Seeded Baseline Entities (SO, SJ, SPK, PO, etc.)
├── /types
│   └── erp.ts                 # TypeScript Domain Interfaces & Enums
├── /utils
│   ├── logic.ts               # Pure Business Logic Functions (Decoupled)
│   └── logic.test.ts          # 37 Unit Tests via node:test Runner
├── App.tsx                    # Root Container, Orchestrator & State Center
├── index.css                  # Global Tailwind Directives & CSS Reset
└── main.tsx                   # React 18 DOM Entry Point
```

---

## 3. Strategi Pengelolaan State (State Management)

Karena prototipe ini berjalan secara murni *frontend-only* tanpa koneksi database aktif, state operasional dikelola secara terpusat pada `App.tsx` menggunakan React `useState` hooks.

### Aliran Data Antar-Modul (Cross-Module Data Flow):
1. **Sales Order (Marketing)**: Menyediakan pesanan pelanggan yang menjadi dasar kebutuhan SPK pada PPIC dan alokasi pengiriman.
2. **SPK & Target (PPIC)**: Menghasilkan SPK bulanan per lini manufaktur dan target harian (PCS).
3. **Simulasi MRP & PO (Purchasing)**: Membaca target SPK dan stok material untuk mengestimasi kebutuhan material dan menerbitkan Purchase Order ke supplier.
4. **GRN & Material Issue (Warehouse)**: Menerima material dari PO yang dikonfirmasi dan mengeluarkan material ke lini SPK sesuai prinsip zero-negative stock.
5. **Produksi Aktual (Admin Operasional - Produksi)**: Operator mencatat output harian per shift tanpa mengubah target terkunci PPIC. Output tidak otomatis menambah stok FG sebelum proses serah-terima.
6. **Surat Jalan & Konfirmasi Delivery (Admin Operasional - Pengiriman)**: Penerbitan SJ fisik hanya dapat memotong stok FG jika statusnya dikonfirmasi menjadi `Delivered` dan divalidasi ke lokasi sumber yang sah.
7. **Penerbitan Faktur & AR (Finance)**: Audit gerbang penagihan hanya meloloskan SJ yang telah `Delivered` dan `Matched` untuk digabungkan menjadi commercial invoice multi-SJ dengan PPN 11%, dan melacak mutasi kas masuk ke saldo piutang.
8. **Executive Read-Only Overview (Management)**: Merangkum seluruh metrik operasional secara waktu nyata tanpa izin manipulasi data (BR-ROL-01).

---

## 4. Pemisahan Logika Murni (Decoupled Pure Logic)

Seluruh kalkulasi matematika, formula gap, validasi form, dan verifikasi aturan bisnis dipisahkan ke dalam `src/utils/logic.ts` tanpa ketergantungan pada React rendering lifecycle:

- `calculateProductionGap`: Menghitung `Target - Actual`. Positif = Defisit, 0 = Tercapai, Negatif = Surplus.
- `calculateSoFulfillment`: Evaluasi multi-track status pengiriman dan penagihan SO.
- `evaluateSjVsPoStatus`: Pencocokan kuantitas SJ terhadap item SO (`Matched` vs `Exception`).
- `calculateMrpNetReq`: Kalkulasi estimasi kebutuhan bersih material dari BOM, scrap rate, dan on-hand inventory.
- `validateGrnReceipt`: Memastikan penerimaan fisik tidak melebihi sisa alokasi PO.
- `validateMaterialIssue`: Menegakkan kebijakan zero-negative stock untuk pengeluaran bahan.
- `validateDeliveryConfirmation`: Memastikan ketersediaan stok fisik Finished Goods sebelum status SJ menjadi `Delivered`.
- `validateInvoiceCreation`: Mencegah *double billing*, mengisolasi anomali `SO-0043`, dan menghitung PPN 11%.
- `validatePaymentRecording`: Memvalidasi pembayaran kas masuk tidak melebihi sisa piutang outstanding.

---

## 5. Strategi Pengujian (Testing Strategy)

- **Engine**: Node.js built-in test runner (`node:test` dan `node:assert/strict`) dijalankan melalui `npx --yes tsx --test src/utils/logic.test.ts`.
- **Cakupan**: 37 unit test case otomatis yang memvalidasi setiap aturan bisnis utama.
- **Visual E2E Verification**: Browser automation via `playwright-cli` pada viewport standar `1440 × 900` untuk memverifikasi interaktivitas, modal dialog, split-pane drawer, dan navigasi lintas role.
