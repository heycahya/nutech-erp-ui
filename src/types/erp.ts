/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Domain Types for Nutech ERP
 */

export type RoleType =
  | 'marketing'
  | 'ppic'
  | 'purchasing'
  | 'warehouse'
  | 'admin_operasional'
  | 'finance'
  | 'management';

export interface RoleInfo {
  id: RoleType;
  title: string;
  department: string;
  badgeLabel: string;
  isReadOnly?: boolean;
  description: string;
}

export type OrderType = 'Rutin Bulanan' | 'Urgent';

export type StatusProduction = 'Pending' | 'In Production' | 'Completed';
export type StatusDelivery = 'Pending' | 'Partially Shipped' | 'Fully Delivered';
export type StatusBilling = 'Unbilled' | 'Partially Billed' | 'Fully Billed';

export interface Customer {
  id: string;
  code: string;
  name: string;
  address: string;
  contactPerson: string;
  phone: string;
  paymentTerms: string; // e.g. "Net 30", "Net 45"
}

export interface PartItem {
  id: string;
  partNumber: string;
  description: string;
  category: 'Karet / Rubber' | 'Busa / Foam' | 'EVA Sponge';
  officialUom: 'PCS';
  defaultPackRatio: number; // PCS per pack
  standardPrice: number;
}

export interface SalesOrderItem {
  id: string;
  partId: string;
  partNumber: string;
  partDescription: string;
  qtyOrdered: number; // in PCS
  unitPrice: number;
  qtyDelivered: number; // in PCS
  qtyBilled: number; // in PCS
}

export interface SalesOrder {
  id: string;
  soNumber: string;
  customerPoNumber: string;
  customerId: string;
  customerName: string;
  orderType: OrderType;
  orderDate: string;
  needDate: string;
  statusProduction: StatusProduction;
  statusDelivery: StatusDelivery;
  statusBilling: StatusBilling;
  items: SalesOrderItem[];
  notes?: string;
  createdBy: string;
}

export type SjStatus = 'Draft' | 'Printed' | 'Delivered';
export type SjControlStatus = 'Pending' | 'Matched' | 'Exception';

export interface DeliveryOrder {
  id: string;
  sjNumber: string;
  soId: string;
  soNumber: string;
  customerPoNumber: string;
  customerName: string;
  deliveryDate: string;
  status: SjStatus;
  controlStatus: SjControlStatus;
  sourceLocation: string;
  items: {
    partNumber: string;
    partDescription: string;
    qtyShipped: number;
  }[];
  vehicleNumber?: string;
  driverName?: string;
  recipientName?: string; // e.g. "Bpk. Hendrawan (Receiving ADM)"
  confirmedAt?: string; // Timestamp konfirmasi tanda tangan fisik
  proofOfDeliveryNotes?: string; // Catatan bukti surat jalan asli bertanda tangan
  deductedFromFg?: boolean; // Mencegah double deduction
}

export interface ProductionPlan {
  id: string;
  spkNumber: string;
  laneId: string;
  laneName: string;
  periodMonth: string;
  periodYear: string;
  targetPcsDaily: number;
  partId: string;
  partNumber: string;
  status: 'Active' | 'Closed';
}

export interface SpkItem {
  id: string;
  partId: string;
  partNumber: string;
  partDescription: string;
  targetPcsMonthly: number;
  dailyTargetPcs: number; // calculated default daily target
}

export interface ProductionOrderSpk {
  id: string;
  spkNumber: string; // e.g. "SPK-2026-11-L1"
  laneId: string; // "lane-1", "lane-2", "lane-3"
  laneName: string; // "Lane 1 (Rubber Cutting)"
  periodMonth: string; // "November"
  periodYear: string; // "2026"
  status: 'Active' | 'Draft' | 'Closed';
  soId?: string | null; // nullable per TBD-05
  soNumber?: string | null;
  customerName?: string | null;
  orderType?: OrderType; // "Rutin Bulanan" | "Urgent"
  targetPcsTotal: number;
  createdAt: string;
  items: SpkItem[];
  notes?: string;
}

export interface DailyProductionRecord {
  id: string;
  spkId: string;
  spkNumber: string;
  date: string; // YYYY-MM-DD
  laneId: string;
  laneName: string;
  partId: string;
  partNumber: string;
  partDescription: string;
  targetPcs: number; // Target harian PPIC (PCS terkunci)
  actualPcs: number; // Aktual produksi
  actualPacks?: number; // Pack input operator
  packRatio: number; // Pack to PCS conversion ratio
  gapPcs: number; // Target - Actual (On-the-fly)
  ngPcs?: number; // Kuantitas NG (Not Good) dicatat terpisah
  ngReason?: string; // Alasan/kategori cacat fisik
  downtimeReason?: string; // Dies Changeover, Blade Sharpening, Machine Repair, Power Outage, None
  downtimeMinutes?: number; // Durasi downtime dalam menit
  operatorName?: string; // Nama operator pelapor
  shiftNumber?: number; // 1, 2, atau 3
  notes?: string;
  isUrgent?: boolean;
}

export interface PackConversionConfig {
  id: string;
  laneId: string;
  laneName: string;
  partId: string;
  partNumber: string;
  partDescription: string;
  packRatio: number; // PCS per pack
  effectiveDate: string;
}

export interface ProductionLane {
  id: string;
  code: string;
  name: string;
  processName: string;
  status: 'Active' | 'Inactive' | 'Pending Configuration';
  dailyCapacityPcs: number;
  allowedCategories: string[];
  supervisorName: string;
  description: string;
  machineCount: number;
}

export interface UiPatternType {
  id: 'overview' | 'data-table' | 'form-input' | 'split-pane' | 'modal-demo';
  label: string;
  description: string;
}

// ==========================================
// PURCHASING DOMAIN TYPES (SPRINT 04)
// ==========================================

export type PurchaseUomType = 'Roll' | 'Sheet' | 'Kg';
export type UsageUomType = 'PCS' | 'Mtr' | 'Kg';

export interface Supplier {
  id: string;
  code: string;
  name: string;
  category: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  paymentTerms: string; // e.g. "Net 30", "Net 45"
  leadTimeDays: number;
  status: 'Active' | 'Inactive';
  notes?: string;
  rating?: string;
}

export interface RawMaterial {
  id: string;
  code: string;
  name: string;
  category: 'Karet / Rubber' | 'Busa / Foam' | 'EVA Sponge';
  purchaseUom: PurchaseUomType;
  usageUom: UsageUomType;
  conversionRatio: number; // e.g. 1 Roll = 25 Kg, or 1 Sheet = 50 PCS
  conversionNote: string;
  onHandQty: number; // Saldo fisik resmi (840, 1250, 950)
  allocatedSpkQty: number; // Kebutuhan alokasi SPK
  safetyStock: number;
  minOrderQty: number;
  standardPricePerUom: number; // Estimasi harga beli
  preferredSupplierId: string;
  preferredSupplierName: string;
  storageLocation: string;
  standardScrapPct: number; // e.g. 3-5%
}

export interface BomAssumption {
  id: string;
  partId: string;
  partNumber: string;
  partDescription: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  stdConsumptionPerPcs: number; // Standar pemakaian per PCS
  scrapAllowancePercent: number; // Scrap allowance asumsi (%)
  designAssumptionNote: string;
}

export interface PurchaseOrderItem {
  id: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  qtyOrdered: number;
  purchaseUom: PurchaseUomType;
  unitPrice: number;
  qtyReceivedGrn: number; // Dicatat murni oleh Warehouse GRN
  notes?: string;
}

export type PoStatus = 'Draft' | 'Open' | 'Partially Received' | 'Received' | 'Cancelled';
export type PoGrnStatus = 'No Receipt' | 'Partial GRN' | 'Fully Received';

export interface PurchaseOrder {
  id: string;
  poNumber: string; // e.g. "PO-SUPP-2026-0079"
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  status: PoStatus;
  grnStatus: PoGrnStatus;
  approvalStatus: 'Approved (Direct Purchasing)' | 'Pending Approval'; // TBD-12 Fallback
  totalAmount: number;
  createdBy: string;
  items: PurchaseOrderItem[];
  notes?: string;
  linkedSpkId?: string;
}

export interface MaterialShortageTicket {
  id: string;
  ticketNumber: string; // e.g. "PR-2026-11-001"
  requestedByRole: 'ppic' | 'admin_operasional' | 'warehouse';
  requesterName: string;
  requestDate: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  qtyNeeded: number;
  uom: string;
  urgency: 'Normal' | 'Urgent' | 'Critical';
  status: 'Pending' | 'In Review' | 'PO Created' | 'Resolved';
  poReferenceId?: string;
  laneId?: string;
  reason: string;
}

export interface MrpSimulationResult {
  materialId: string;
  materialCode: string;
  materialName: string;
  category: string;
  purchaseUom: PurchaseUomType;
  grossRequirement: number;
  scrapAllowanceQty: number;
  scrapPercent: number;
  totalDemand: number;
  availableStock: number;
  netRequirement: number; // Defisit yang perlu dibeli
  recommendedPoQty: number;
  preferredSupplierName: string;
  leadTimeDays: number;
  estimatedCost: number;
  status: 'Defisit (PO Diperlukan)' | 'Stok Aman' | 'Buffer Tipis';
}

// ----------------------------------------------------
// 6. WAREHOUSE & INVENTORY MANAGEMENT DOMAIN (FEAT-WH-01 to 04)
// ----------------------------------------------------

export type GrnStatus = 'Draft' | 'Confirmed' | 'Cancelled';

export interface GoodsReceiptNoteItem {
  id: string;
  poItemId: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  qtyOrdered: number;
  qtyPreviouslyReceived: number;
  qtyReceivedNow: number;
  purchaseUom: PurchaseUomType;
  storageLocation: string;
  condition: 'Good' | 'Damaged' | 'QC Sample Pending';
  notes?: string;
}

export interface GoodsReceiptNote {
  id: string;
  grnNumber: string; // e.g. "GRN-2026-0890"
  poId: string;
  poNumber: string; // e.g. "PO-SUPP-2026-0079"
  supplierId: string;
  supplierName: string;
  receivedDate: string; // ISO YYYY-MM-DD
  deliveryOrderNumber: string; // Surat Jalan Supplier e.g. "SJ-SUPP-4491"
  vehicleNumber?: string; // e.g. "B 9812 UIK"
  driverName?: string;
  receivedBy: string; // Admin Gudang Bahan Baku
  status: GrnStatus;
  items: GoodsReceiptNoteItem[];
  totalQtyReceived: number;
  notes?: string;
}

export type MaterialIssueStatus = 'Draft' | 'Confirmed' | 'Cancelled';

export interface MaterialIssueItem {
  id: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  qtyIssued: number;
  uom: string;
  storageLocation: string;
  notes?: string;
}

export interface MaterialIssue {
  id: string;
  issueNumber: string; // e.g. "ISSUE-2026-11-001"
  issueDate: string;
  spkId: string;
  spkNumber: string; // e.g. "SPK-2026-11-L1"
  targetLaneId: string;
  targetLaneName: string;
  requestedBy: string; // Operator / Foreman lini
  authorizedBy: string; // Admin Gudang Bahan Baku (BR-MAT-03)
  status: MaterialIssueStatus;
  items: MaterialIssueItem[];
  totalQtyIssued: number;
  notes?: string;
}

export type StockMovementType = 'init' | 'grn' | 'issue' | 'adj';

export interface StockMovement {
  id: string;
  transactionDate: string;
  movementType: StockMovementType;
  referenceType: 'INITIAL_BALANCE' | 'PO_GRN' | 'MATERIAL_ISSUE' | 'STOCK_ADJUSTMENT';
  referenceNumber: string; // e.g. "GRN-2026-0890", "ISSUE-2026-11-001"
  materialId: string;
  materialCode: string;
  materialName: string;
  storageLocation: string;
  qtyIn: number;
  qtyOut: number;
  balanceAfter: number;
  uom: string;
  userId: string;
  userName: string;
  reason?: string;
  notes?: string;
}

export type AdjustmentReasonCategory = 
  | 'Stock Opname Bulanan'
  | 'Kerusakan / Cacat Fisik'
  | 'Koreksi Kesalahan Input'
  | 'Selisih Timbangan / Scrap'
  | 'Lain-lain';

export interface StockAdjustment {
  id: string;
  adjNumber: string; // e.g. "ADJ-2026-11-001"
  adjDate: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  storageLocation: string;
  systemQtyBefore: number;
  actualPhysicalQty: number;
  differenceQty: number; // positif = surplus, negatif = defisit
  uom: string;
  reasonCategory: AdjustmentReasonCategory;
  reasonDetail: string; // Wajib diisi (NFR-04)
  authorizedBy: string; // Admin Gudang (FEAT-WH-04)
  notes?: string;
}

export interface StorageBinLocation {
  id: string;
  code: string; // e.g. "RAK-A-01"
  name: string; // "Gudang Material Rak A-01"
  zone: 'Zone A - Karet EPDM' | 'Zone B - Busa PU' | 'Zone C - EVA Pallet';
  capacityLimit: string;
  currentMaterialCode: string;
  status: 'Normal' | 'Near Capacity' | 'Available';
}

// ==========================================
// FINISHED GOODS (FG) & OPERATIONAL TYPES (SPRINT 06)
// ==========================================

export type FgLocationType = 'Ujung Lini Produksi' | 'Gudang FG';

export interface FinishedGoodStock {
  id: string;
  partId: string;
  partNumber: string;
  partDescription: string;
  category: 'Karet / Rubber' | 'Busa / Foam' | 'EVA Sponge';
  lineEndQty: number; // Ujung Lini (4.200 total)
  warehouseQty: number; // Gudang FG (3.000 total)
  totalQtyPcs: number; // 7.200 total
  defaultPackRatio: number;
  shippingAllocation?: string;
  lastUpdated?: string;
}

export interface FgStockMovement {
  id: string;
  timestamp: string;
  movementType: 'DELIVERY_DEDUCTION' | 'INITIAL_SNAPSHOT' | 'INTERNAL_TRANSFER';
  referenceNumber: string; // e.g. "SJ-2026-0091"
  partNumber: string;
  partDescription: string;
  sourceLocation: FgLocationType;
  qtyChange: number; // negatif untuk pengiriman, positif untuk transfer masuk
  balanceAfter: number;
  authorizedBy: string;
  notes?: string;
}

// ==========================================
// FINANCE & BILLING AR TYPES (SPRINT 07)
// ==========================================

export type InvoiceStatus = 'Unpaid' | 'Partially Paid' | 'Paid' | 'Overdue';

export interface InvoiceItem {
  id: string;
  sjId: string;
  sjNumber: string;
  soId: string;
  soNumber: string;
  partNumber: string;
  partDescription: string;
  qtyBilled: number; // in PCS (terverifikasi dari SJ Delivered)
  unitPrice: number; // Estimasi Simulasi (TBD-09)
  subtotal: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-11-001"
  customerId: string;
  customerName: string;
  customerPoNumber: string;
  periodMonth: string; // e.g. "November"
  periodYear: string; // e.g. "2026"
  invoiceDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  paymentTerms: string; // e.g. "Net 30", "Net 45" (TBD-14)
  items: InvoiceItem[];
  totalQtyPcs: number;
  subtotalAmount: number;
  taxAmount: number; // PPN 11%
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: InvoiceStatus;
  linkedSjNumbers: string[];
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export type PaymentMethod =
  | 'Bank Transfer (BCA)'
  | 'Bank Transfer (Mandiri)'
  | 'Giro / Cek'
  | 'Setoran Tunai'
  | 'Lainnya';

export interface PaymentRecord {
  id: string;
  paymentNumber: string; // e.g. "PAY-2026-11-001"
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  paymentDate: string; // YYYY-MM-DD
  amountPaid: number;
  paymentMethod: PaymentMethod;
  referenceNumber: string; // e.g. "TRF-BCA-88912"
  recordedBy: string;
  notes?: string;
}

export interface ReadyToBillItem {
  sjId: string;
  sjNumber: string;
  soId: string;
  soNumber: string;
  customerName: string;
  deliveryDate: string;
  partNumber: string;
  partDescription: string;
  qtyDelivered: number;
  qtyAlreadyBilled: number;
  qtyAvailableToBill: number;
  unitPrice: number;
  estimatedSubtotal: number;
  isEligible: boolean;
  ineligibilityReason?: string;
}


