# PANDUAN HANDOFF PENGEMBANG (DEVELOPER HANDOFF)

Panduan teknis ini disusun bagi tim pengembang perangkat lunak (Backend & Full-Stack Engineers) untuk mengonversi prototype antarmuka **NUTECH ERP** menjadi aplikasi produksi terintegrasi.

---

## 1. Arsitektur Backend yang Direkomendasikan

- **Platform Server**: Node.js (NestJS / Express / Fastify) atau Go / Python FastAPI.
- **Database Utama**: Relational DBMS (PostgreSQL atau MySQL) dengan dukungan ACID transactions untuk mutasi stok dan penagihan finansial.
- **Autentikasi & Otorisasi**: JWT Bearer Token dengan Role-Based Access Control (RBAC) mencakup 7 role yang ada (`marketing`, `ppic`, `purchasing`, `warehouse`, `admin_operasional`, `finance`, `management`).

---

## 2. Pemetaan Skema Database (Database Schema Mapping)

Berdasarkan interface pada `src/types/erp.ts`, entitas database yang diperlukan mencakup:

```sql
-- 1. Master Customers & Parts
CREATE TABLE customers (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(32) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(32),
  payment_term VARCHAR(64) DEFAULT 'Net 30',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parts (
  id VARCHAR(64) PRIMARY KEY,
  part_number VARCHAR(64) UNIQUE NOT NULL,
  part_name VARCHAR(255) NOT NULL,
  category VARCHAR(64) NOT NULL,
  material VARCHAR(128) NOT NULL,
  default_pack_ratio INT NOT NULL DEFAULT 50,
  unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sales Orders & Items
CREATE TABLE sales_orders (
  id VARCHAR(64) PRIMARY KEY,
  so_number VARCHAR(64) UNIQUE NOT NULL,
  customer_id VARCHAR(64) REFERENCES customers(id),
  po_number VARCHAR(64) NOT NULL,
  order_date DATE NOT NULL,
  need_date DATE NOT NULL,
  order_type VARCHAR(32) NOT NULL DEFAULT 'Rutin Bulanan',
  status VARCHAR(32) NOT NULL DEFAULT 'In Production',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sales_order_items (
  id VARCHAR(64) PRIMARY KEY,
  sales_order_id VARCHAR(64) REFERENCES sales_orders(id) ON DELETE CASCADE,
  part_id VARCHAR(64) REFERENCES parts(id),
  qty_ordered INT NOT NULL,
  qty_delivered_internal INT DEFAULT 0,
  qty_billed_internal INT DEFAULT 0,
  unit_price NUMERIC(15, 2) NOT NULL,
  subtotal NUMERIC(15, 2) NOT NULL
);

-- 3. PPIC SPK & Daily Records
CREATE TABLE production_lanes (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(32) UNIQUE NOT NULL,
  name VARCHAR(128) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' -- ACTIVE | PENDING_TBD
);

CREATE TABLE production_spk (
  id VARCHAR(64) PRIMARY KEY,
  spk_number VARCHAR(64) UNIQUE NOT NULL,
  lane_id VARCHAR(64) REFERENCES production_lanes(id),
  period_month INT NOT NULL,
  period_year INT NOT NULL,
  total_target_pcs INT NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE daily_production_records (
  id VARCHAR(64) PRIMARY KEY,
  spk_id VARCHAR(64) REFERENCES production_spk(id),
  date DATE NOT NULL,
  lane_id VARCHAR(64) REFERENCES production_lanes(id),
  part_id VARCHAR(64) REFERENCES parts(id),
  target_pcs INT NOT NULL, -- Dikunci hanya oleh PPIC
  actual_pcs INT NOT NULL DEFAULT 0, -- Diinput oleh Admin Operasional
  actual_packs INT NOT NULL DEFAULT 0,
  gap_pcs INT GENERATED ALWAYS AS (target_pcs - actual_pcs) STORED,
  downtime_reason VARCHAR(255),
  notes TEXT
);

-- 4. Finished Goods Inventory & Surat Jalan
CREATE TABLE finished_goods_stock (
  id VARCHAR(64) PRIMARY KEY,
  part_id VARCHAR(64) REFERENCES parts(id),
  location_name VARCHAR(128) NOT NULL, -- Line-End Conveyor | Gudang FG
  qty_on_hand INT NOT NULL DEFAULT 0,
  min_buffer INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE delivery_orders (
  id VARCHAR(64) PRIMARY KEY,
  sj_number VARCHAR(64) UNIQUE NOT NULL,
  so_id VARCHAR(64) REFERENCES sales_orders(id),
  delivery_date DATE NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'Draft', -- Draft | Printed | Delivered | Cancelled
  driver_name VARCHAR(128),
  vehicle_plate VARCHAR(32),
  source_location VARCHAR(128) NOT NULL,
  received_by VARCHAR(128),
  received_at TIMESTAMP
);

-- 5. Invoicing & Accounts Receivable (Finance)
CREATE TABLE commercial_invoices (
  id VARCHAR(64) PRIMARY KEY,
  invoice_number VARCHAR(64) UNIQUE NOT NULL,
  customer_id VARCHAR(64) REFERENCES customers(id),
  customer_po_number VARCHAR(64) NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  payment_term VARCHAR(64) NOT NULL DEFAULT 'Net 30',
  subtotal_dpp NUMERIC(15, 2) NOT NULL,
  tax_ppn_11 NUMERIC(15, 2) NOT NULL,
  total_amount NUMERIC(15, 2) NOT NULL,
  paid_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  outstanding_balance NUMERIC(15, 2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
  status VARCHAR(32) NOT NULL DEFAULT 'Unpaid' -- Unpaid | Partially Paid | Paid | Overdue
);

CREATE TABLE invoice_sj_relations (
  invoice_id VARCHAR(64) REFERENCES commercial_invoices(id),
  delivery_order_id VARCHAR(64) REFERENCES delivery_orders(id),
  PRIMARY KEY (invoice_id, delivery_order_id)
);

CREATE TABLE payment_records (
  id VARCHAR(64) PRIMARY KEY,
  payment_number VARCHAR(64) UNIQUE NOT NULL,
  invoice_id VARCHAR(64) REFERENCES commercial_invoices(id),
  payment_date DATE NOT NULL,
  amount_paid NUMERIC(15, 2) NOT NULL,
  payment_method VARCHAR(64) NOT NULL,
  reference_no VARCHAR(128) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Aturan Bisnis Server-Side yang WAJIB Ditegakkan

Saat membangun REST/RPC API endpoint, backend wajib menerapkan aturan bisnis berikut:

1. **Target Produksi Terkunci (BR-PPIC-02)**:
   - Endpoint update target harian (`PATCH /api/ppic/targets/:id`) hanya dapat diakses dengan role `ppic`.
   - Role `admin_operasional` hanya memiliki izin menulis pada endpoint input aktual (`POST /api/production/actual-records`).
2. **Larangan Penambahan Stok FG Otomatis dari Input Aktual (BR-PROD-02)**:
   - Pencatatan aktual produksi harian **TIDAK BOLEH** secara otomatis meningkatkan kolom `qty_on_hand` di tabel `finished_goods_stock`.
3. **Pemotongan Stok FG Hanya saat Status Delivered (BR-DEL-02)**:
   - Transisi status SJ menjadi `Draft` atau `Printed` tidak boleh memotong persediaan barang jadi.
   - Pemotongan persediaan fisik dilakukan di dalam transaksi database serializable saat endpoint `POST /api/delivery/confirm-delivery` dipanggil.
4. **Gerbang Penagihan Resmi (BR-BIL-01)**:
   - Endpoint pembuatan invoice (`POST /api/finance/invoices`) wajib memvalidasi bahwa seluruh Surat Jalan yang digabungkan berstatus `Delivered` dan `Matched`.
   - Mengembalikan error HTTP 400 jika ada SJ bertipe Draft, Printed, atau berstatus Exception.
5. **Pencegahan Double-Billing**:
   - Backend wajib menghitung saldo `sisa_unbilled = qty_delivered - SUM(qty_invoiced)`.
   - Dilarang membuat line item invoice dengan kuantitas melebihi sisa unbilled.
6. **Zero-Negative Stock Policy (BR-MAT-02)**:
   - Pengeluaran material gudang (`POST /api/warehouse/material-issues`) wajib memverifikasi stok cukup: `qty_available >= qty_issue`.
7. **Isolasi Anomali Data SO-2026-0043**:
   - Query KPI eksekutif untuk kuantitas Delivered dan Billed terverifikasi wajib didasarkan pada `JOIN delivery_orders` yang berstatus `Delivered`, bukan kolom akumulasi internal Sales Order.
