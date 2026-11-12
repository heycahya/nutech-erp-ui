# NUTECH ERP — QA Visual Verification Gallery

Direktori ini mendokumentasikan 34 visual browser screenshot dari seluruh 7 role dan modul utama prototype pada viewport desktop **1440 × 900** dengan Clean Presentation Mode (QA badges / overlays disembunyikan).

---

## 1. Marketing & Commercial
- `screenshots/qa_final_01_marketing_so_table.png`: Master Sales Order Table dengan cumulative summary row (25.900 PCS).
- `screenshots/qa_final_02_marketing_split_pane.png`: Split-pane detail view SO-2026-0041 (Delivery tracking & status tags).
- `screenshots/qa_final_03_marketing_so_form.png`: Form create multi-item SO padat dengan kalkulasi live Pack-to-PCS.
- `screenshots/qa_final_04_marketing_customers.png`: Master Data Pelanggan B2B OEM Automotive.
- `screenshots/qa_final_05_marketing_parts.png`: Master Data Part Item dan spesifikasi rasio packing.

## 2. PPIC (Production Planning & Inventory Control)
- `screenshots/qa_final_06_ppic_spk.png`: Manajemen SPK bulanan per production lane.
- `screenshots/qa_final_07_ppic_targets.png`: Grid perencanaan target harian terkunci PPIC (PCS).
- `screenshots/qa_final_08_ppic_gap.png`: Monitoring selisih produksi harian (Target - Actual).
- `screenshots/qa_final_09_ppic_pack_ratio.png`: Konfigurasi konversi Pack-to-PCS per lane + part dengan live simulator.
- `screenshots/qa_final_10_ppic_lanes.png`: Master Lane (Lane 1-3 aktif, Lane 4 berstatus PENDING/TBD).

## 3. Purchasing (Procurement)
- `screenshots/qa_final_11_purchasing_mrp.png`: Simulasi Material Requirement Planning (Gross req, stok on hand, scrap, net req).
- `screenshots/qa_final_12_purchasing_po.png`: Manajemen Purchase Order supplier & split-pane PO detail.
- `screenshots/qa_final_13_purchasing_shortage.png`: Monitoring shortage material & Purchase Requisition (PR).
- `screenshots/qa_final_14_purchasing_inbound.png`: Tracking pengiriman inbound supplier dan estimasi kedatangan.
- `screenshots/qa_final_15_purchasing_suppliers.png`: Master Data Supplier bahan baku dan evaluasi on-time performance.

## 4. Warehouse (Gudang Bahan Baku)
- `screenshots/qa_final_16_warehouse_monitoring.png`: Ringkasan monitoring gudang (stok on-hand, inbound pending, receipt hari ini).
- `screenshots/qa_final_17_warehouse_grn.png`: Penerimaan material via Goods Receipt Note (GRN) terhubung ke PO.
- `screenshots/qa_final_18_warehouse_inventory.png`: Saldo stok bahan baku per item dan bin lokasi rak gudang.
- `screenshots/qa_final_19_warehouse_issue.png`: Pengeluaran material ke lini produksi (Material Issue).
- `screenshots/qa_final_20_warehouse_ledger.png`: Kartu stok ledger material append-only (In, Out, Balance).

## 5. Admin Operasional — Production & Delivery
- `screenshots/qa_final_21_admin_prod_monitoring.png`: Dashboard monitoring lini produksi harian dan status mesin.
- `screenshots/qa_final_22_admin_prod_daily_report.png`: Form pencatatan aktual produksi harian & pencatatan NG terpisah.
- `screenshots/qa_final_23_admin_prod_fg_stocks.png`: Saldo stok Finished Goods multi-lokasi (Ujung Lini vs Gudang FG).
- `screenshots/qa_final_24_admin_del_monitoring.png`: Monitoring operasional armada pengiriman dan status logistik.
- `screenshots/qa_final_25_admin_del_sj_management.png`: Manajemen Surat Jalan (Draft, Printed, Delivered, Exception) & cetak slip.
- `screenshots/qa_final_26_admin_del_so_matching.png`: Verifikasi pencocokan Surat Jalan vs Sales Order (Matched vs Exception).

## 6. Finance & Billing
- `screenshots/qa_final_27_finance_dashboard.png`: Dashboard eksekutif Keuangan & Accounts Receivable (AR).
- `screenshots/qa_final_28_finance_ready_to_bill.png`: Antrean Surat Jalan siap tagih (Delivered & Matched only).
- `screenshots/qa_final_29_finance_invoice_management.png`: Manajemen faktur tagihan (Invoice), kalkulasi PPN 11%, dan status pelunasan.
- `screenshots/qa_final_30_finance_ar_tracking.png`: Pelacakan piutang dagang dan pencatatan riwayat pembayaran.
- `screenshots/qa_final_31_finance_ar_aging.png`: Distribusi AR Aging per bucket umur piutang (Current, 1-30, 31-60, 61-90, >90 hari).

## 7. Management & Shell
- `screenshots/qa_final_32_management_dashboard.png`: Executive 5-Domain Overview & strategic corporate KPIs.
- `screenshots/qa_final_33_management_ar_aging.png`: Executive AR Aging & monitoring risiko kredit pelanggan.
- `screenshots/qa_final_34_sidebar_collapsed_1440x900.png`: Verifikasi sidebar collapsed (64px icon rail) pada viewport 1440 × 900.
