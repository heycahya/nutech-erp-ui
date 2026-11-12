/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePackToPcs,
  calculateProductionGap,
  calculateSoFulfillment,
  evaluateSjVsPoStatus,
  calculateMrpNetReq,
  formatIndoDate,
  calculateProductionAchievement,
  validateSjSourceLocation,
  validateSalesOrderForm,
  calculateOrderTotals,
  evaluateProductionGapDetail,
  validateSpkForm,
  validatePackConversionConfig,
  calculateSpkTotalTarget,
  calculatePoTotals,
  validatePurchaseOrderForm,
  validateSupplierForm,
  calculateMaterialRequirementSummary,
  validateGrnReceipt,
  validateMaterialIssue,
  validateStockAdjustment,
  calculateWarehouseSummary,
  calculateLedgerBalanceForMaterial,
  validateProductionActualEntry,
  validateSuratJalanDraft,
  validateDeliveryConfirmation,
  evaluateBillingEligibility,
  validateInvoiceCreation,
  validatePaymentRecording,
  calculateFinanceSummary,
} from './logic';

test('calculatePackToPcs correctly converts pack to PCS using configured ratio', () => {
  assert.equal(calculatePackToPcs(10, 50), 500);
  assert.equal(calculatePackToPcs(0, 50), 0);
  assert.equal(calculatePackToPcs(-5, 50), 0);
  assert.equal(calculatePackToPcs(12, 25), 300);
});

test('calculateProductionGap computes on-the-fly Target minus Actual', () => {
  // Target 1000, Actual 850 -> Gap +150 (under-production)
  assert.equal(calculateProductionGap(1000, 850), 150);
  // Target 1000, Actual 1000 -> Gap 0 (exact)
  assert.equal(calculateProductionGap(1000, 1000), 0);
  // Target 1000, Actual 1100 -> Gap -100 (over-production)
  assert.equal(calculateProductionGap(1000, 1100), -100);
});

test('calculateSoFulfillment handles partial fulfillment tracking', () => {
  const result1 = calculateSoFulfillment(5000, 2000);
  assert.equal(result1.remainingQty, 3000);
  assert.equal(result1.percentComplete, 40);
  assert.equal(result1.isFulfilled, false);

  const result2 = calculateSoFulfillment(5000, 5000);
  assert.equal(result2.remainingQty, 0);
  assert.equal(result2.percentComplete, 100);
  assert.equal(result2.isFulfilled, true);
});

test('evaluateSjVsPoStatus flags Matched or Exception correctly', () => {
  assert.equal(evaluateSjVsPoStatus(5000, 4500), 'matched');
  assert.equal(evaluateSjVsPoStatus(5000, 5000), 'matched');
  assert.equal(evaluateSjVsPoStatus(5000, 5200), 'exception');
});

test('calculateMrpNetReq handles standard consumption, scrap, and available stock', () => {
  // 1000 PCS, 0.05 Kg/PCS -> 50 Kg gross, 5% scrap -> 2.5 Kg, Total 52.5 Kg, Available stock 20 Kg -> Net 32.5 Kg
  const net = calculateMrpNetReq(0.05, 1000, 5, 20);
  assert.equal(net, 32.5);

  // Available stock exceeds requirement
  const zeroNet = calculateMrpNetReq(0.05, 100, 5, 20);
  assert.equal(zeroNet, 0);
});

test('formatIndoDate formats ISO YYYY-MM-DD into readable Indonesian date', () => {
  assert.equal(formatIndoDate('2026-11-25'), '25 Nov 2026');
  assert.equal(formatIndoDate('2026-11-04'), '04 Nov 2026');
  assert.equal(formatIndoDate('2026-01-01'), '01 Jan 2026');
  assert.equal(formatIndoDate(''), '-');
});

test('calculateProductionAchievement computes accurate percentage', () => {
  // 3200 / 3300 -> 96.97%
  assert.equal(calculateProductionAchievement(3200, 3300), 96.97);
  // 2500 / 2500 -> 100.00%
  assert.equal(calculateProductionAchievement(2500, 2500), 100);
  // 1050 / 1000 -> 105.00%
  assert.equal(calculateProductionAchievement(1050, 1000), 105);
  // 6750 / 6800 -> 99.26%
  assert.equal(calculateProductionAchievement(6750, 6800), 99.26);
  // zero target safe fallback
  assert.equal(calculateProductionAchievement(100, 0), 0);
});

test('validateSjSourceLocation audits sourceLocation against part production lanes', () => {
  // SJ-0089: Multi-line (RUB from Lane 1, EVA from Lane 3, raw was 'Lane 2')
  const sj89 = validateSjSourceLocation(['NTC-RUB-0101', 'NTC-EVA-0301'], 'Lane 2 (Ujung Lini)');
  assert.equal(sj89.isValid, false);
  assert.equal(sj89.displayLocation, 'Lokasi Belum Ditentukan (Konsolidasi Multi-Lini)');
  assert.equal(sj89.validationStatus, 'Multi-Line Conflict');

  // SJ-0090: Gudang FG (valid regardless of part)
  const sj90 = validateSjSourceLocation(['NTC-RUB-0104'], 'Gudang FG');
  assert.equal(sj90.isValid, true);
  assert.equal(sj90.displayLocation, 'Gudang FG');
  assert.equal(sj90.validationStatus, 'Valid');

  // SJ-0091: Foam part produced on Lane 2, but raw was 'Lane 1 (Ujung Lini)'
  const sj91 = validateSjSourceLocation(['NTC-FOAM-0201'], 'Lane 1 (Ujung Lini)');
  assert.equal(sj91.isValid, false);
  assert.equal(sj91.displayLocation, 'Lokasi Belum Ditentukan (Ketidaksesuaian Data Lini)');
  assert.equal(sj91.validationStatus, 'Line Mismatch');
});

test('validateSalesOrderForm validates customer, PO, need date, and items', () => {
  // Valid input
  const validResult = validateSalesOrderForm({
    customerId: 'CUST-01',
    customerPoNumber: 'PO-12345',
    needDate: '2026-11-20',
    items: [{ partId: 'PART-01', qtyPcs: 1000 }],
  });
  assert.equal(validResult.isValid, true);
  assert.equal(validResult.errors.length, 0);

  // Missing fields
  const invalidResult = validateSalesOrderForm({
    customerId: '',
    customerPoNumber: 'AB',
    needDate: '',
    items: [],
  });
  assert.equal(invalidResult.isValid, false);
  assert.equal(invalidResult.errors.length, 4);

  // Invalid item qty
  const zeroQtyResult = validateSalesOrderForm({
    customerId: 'CUST-01',
    customerPoNumber: 'PO-999',
    needDate: '2026-11-20',
    items: [{ partId: 'PART-01', qtyPcs: 0 }],
  });
  assert.equal(zeroQtyResult.isValid, false);
});

test('calculateOrderTotals correctly computes cumulative PCS and estimated amount', () => {
  const totals = calculateOrderTotals([
    { qtyPcs: 1000, unitPrice: 12500 },
    { qtyPcs: 500, unitPrice: 20000 },
  ]);
  assert.equal(totals.totalQtyPcs, 1500);
  assert.equal(totals.totalEstimatedAmount, 1000 * 12500 + 500 * 20000); // 12.5M + 10M = 22.5M
  assert.equal(totals.itemCount, 2);

  const emptyTotals = calculateOrderTotals([]);
  assert.equal(emptyTotals.totalQtyPcs, 0);
  assert.equal(emptyTotals.totalEstimatedAmount, 0);
  assert.equal(emptyTotals.itemCount, 0);
});

test('evaluateProductionGapDetail classifies defisit, tercapai, and surplus accurately', () => {
  // Target 1000, Actual 850 -> Defisit +150
  const defisit = evaluateProductionGapDetail(1000, 850);
  assert.equal(defisit.gap, 150);
  assert.equal(defisit.status, 'defisit');
  assert.equal(defisit.badgeVariant, 'warning');
  assert.match(defisit.label, /Defisit/);

  // Target 1000, Actual 1000 -> Tercapai
  const tercapai = evaluateProductionGapDetail(1000, 1000);
  assert.equal(tercapai.gap, 0);
  assert.equal(tercapai.status, 'tercapai');
  assert.equal(tercapai.badgeVariant, 'neutral');

  // Target 1000, Actual 1050 -> Surplus -50
  const surplus = evaluateProductionGapDetail(1000, 1050);
  assert.equal(surplus.gap, -50);
  assert.equal(surplus.status, 'surplus');
  assert.equal(surplus.badgeVariant, 'success');
  assert.match(surplus.label, /Surplus/);
});

test('validateSpkForm validates number, lane, period, and items', () => {
  // Valid SPK
  const valid = validateSpkForm({
    spkNumber: 'SPK-2026-11-L1',
    laneId: 'lane-1',
    periodMonth: 'November',
    periodYear: '2026',
    items: [{ partId: 'PART-001', targetPcsMonthly: 50000 }],
  });
  assert.equal(valid.isValid, true);
  assert.equal(valid.errors.length, 0);

  // Missing fields & invalid targets
  const invalid = validateSpkForm({
    spkNumber: '',
    laneId: '',
    periodMonth: '',
    periodYear: '',
    items: [{ partId: '', targetPcsMonthly: 0 }],
  });
  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.length >= 4);
});

test('validatePackConversionConfig validates positive ratio and prevents duplicates', () => {
  const existing = [
    { id: 'cfg-1', laneId: 'lane-1', partId: 'PART-001' },
    { id: 'cfg-2', laneId: 'lane-2', partId: 'PART-003' },
  ];

  // Valid new
  const valid = validatePackConversionConfig('lane-1', 'PART-002', 40, existing);
  assert.equal(valid.isValid, true);

  // Duplicate lane + part
  const duplicate = validatePackConversionConfig('lane-1', 'PART-001', 50, existing);
  assert.equal(duplicate.isValid, false);
  assert.match(duplicate.error || '', /sudah terdaftar/);

  // Same config edit (allowed)
  const selfEdit = validatePackConversionConfig('lane-1', 'PART-001', 55, existing, 'cfg-1');
  assert.equal(selfEdit.isValid, true);

  // Zero ratio (rejected)
  const zeroRatio = validatePackConversionConfig('lane-3', 'PART-005', 0, existing);
  assert.equal(zeroRatio.isValid, false);
});

test('calculateSpkTotalTarget correctly sums monthly targets', () => {
  assert.equal(calculateSpkTotalTarget([]), 0);
  assert.equal(
    calculateSpkTotalTarget([
      { targetPcsMonthly: 50000 },
      { targetPcsMonthly: 35800 },
    ]),
    85800
  );
});

test('calculatePoTotals accurately calculates total items, total quantity, and amount', () => {
  const items = [
    { qtyOrdered: 1000, unitPrice: 45000 },
    { qtyOrdered: 200, unitPrice: 120000 },
  ];
  const result = calculatePoTotals(items);
  assert.equal(result.totalItems, 2);
  assert.equal(result.totalQty, 1200);
  assert.equal(result.totalAmount, 45000000 + 24000000); // 69.000.000
});

test('validatePurchaseOrderForm validates supplier, dates, and item rows', () => {
  // Valid PO
  const valid = validatePurchaseOrderForm({
    supplierId: 'SUPP-SKR-01',
    orderDate: '2026-11-06',
    expectedDeliveryDate: '2026-11-14',
    items: [{ materialId: 'MAT-001', qtyOrdered: 500, unitPrice: 45000 }],
  });
  assert.equal(valid.isValid, true);

  // Missing supplier
  const noSupp = validatePurchaseOrderForm({
    supplierId: '',
    orderDate: '2026-11-06',
    expectedDeliveryDate: '2026-11-14',
    items: [{ materialId: 'MAT-001', qtyOrdered: 500, unitPrice: 45000 }],
  });
  assert.equal(noSupp.isValid, false);
  assert.match(noSupp.error || '', /Pemasok/);

  // Empty items
  const noItems = validatePurchaseOrderForm({
    supplierId: 'SUPP-SKR-01',
    orderDate: '2026-11-06',
    expectedDeliveryDate: '2026-11-14',
    items: [],
  });
  assert.equal(noItems.isValid, false);
  assert.match(noItems.error || '', /minimal harus memiliki 1 baris/);

  // Zero quantity
  const zeroQty = validatePurchaseOrderForm({
    supplierId: 'SUPP-SKR-01',
    orderDate: '2026-11-06',
    expectedDeliveryDate: '2026-11-14',
    items: [{ materialId: 'MAT-001', qtyOrdered: 0, unitPrice: 45000 }],
  });
  assert.equal(zeroQty.isValid, false);
  assert.match(zeroQty.error || '', /Kuantitas order/);
});

test('validateSupplierForm ensures unique code and required contact details', () => {
  const existing = [
    { id: 'supp-1', code: 'SUPP-SKR-01' },
    { id: 'supp-2', code: 'SUPP-PLY-02' },
  ];

  // Valid
  const valid = validateSupplierForm(
    { code: 'SUPP-NEW-01', name: 'PT Mitra Baru', contactPerson: 'Budi', paymentTerms: 'Net 30' },
    existing
  );
  assert.equal(valid.isValid, true);

  // Duplicate code
  const dup = validateSupplierForm(
    { code: 'SUPP-SKR-01', name: 'PT Duplikat', contactPerson: 'Budi', paymentTerms: 'Net 30' },
    existing
  );
  assert.equal(dup.isValid, false);
  assert.match(dup.error || '', /sudah digunakan/);

  // Short name
  const shortName = validateSupplierForm(
    { code: 'SUPP-VAL-01', name: 'P', contactPerson: 'Budi', paymentTerms: 'Net 30' },
    existing
  );
  assert.equal(shortName.isValid, false);
});

test('calculateMaterialRequirementSummary handles multi-BOM gross req and stock subtraction', () => {
  const targets = {
    'NTC-RUB-0101': 5000, // 0.08 Kg * 5000 = 400 Kg + 5% scrap = 420 Kg
    'NTC-RUB-0104': 2000, // 0.12 Kg * 2000 = 240 Kg + 5% scrap = 252 Kg
  };
  const boms = [
    {
      partNumber: 'NTC-RUB-0101',
      materialId: 'MAT-001',
      materialCode: 'MAT-EPDM-01',
      materialName: 'EPDM Synthetic Rubber',
      stdConsumptionPerPcs: 0.08,
      scrapAllowancePercent: 5,
    },
    {
      partNumber: 'NTC-RUB-0104',
      materialId: 'MAT-001',
      materialCode: 'MAT-EPDM-01',
      materialName: 'EPDM Synthetic Rubber',
      stdConsumptionPerPcs: 0.12,
      scrapAllowancePercent: 5,
    },
  ];
  const materials = [
    {
      id: 'MAT-001',
      code: 'MAT-EPDM-01',
      name: 'EPDM Synthetic Rubber',
      category: 'Karet / Rubber',
      purchaseUom: 'Kg' as const,
      onHandQty: 600, // Demand is 420 + 252 = 672 Kg -> Net Req: 72 Kg
      allocatedSpkQty: 620,
      safetyStock: 300,
      standardPricePerUom: 45000,
      preferredSupplierName: 'PT Sumber Karet Sejahtera',
    },
  ];

  const summary = calculateMaterialRequirementSummary(targets, boms, materials);
  assert.equal(summary.length, 1);
  assert.equal(summary[0].grossRequirement, 640);
  assert.equal(summary[0].scrapAllowanceQty, 32);
  assert.equal(summary[0].totalDemand, 672);
  assert.equal(summary[0].availableStock, 600);
  assert.equal(summary[0].netRequirement, 72);
  assert.equal(summary[0].recommendedPoQty, 72);
  assert.equal(summary[0].status, 'Defisit (PO Diperlukan)');
});

// ==========================================
// SPRINT 05: WAREHOUSE UNIT TESTS
// ==========================================

test('validateGrnReceipt enforces positive qty and prevents exceeding remaining PO balance', () => {
  // Ordered 1000, previously 200 -> Remaining 800
  // 1. Valid partial receipt
  const valid = validateGrnReceipt(1000, 200, 300);
  assert.equal(valid.isValid, true);
  assert.equal(valid.remainingPoQty, 800);

  // 2. Exact remaining receipt
  const exact = validateGrnReceipt(1000, 200, 800);
  assert.equal(exact.isValid, true);

  // 3. Exceeds remaining (850 > 800) -> Rejected
  const exceed = validateGrnReceipt(1000, 200, 850);
  assert.equal(exceed.isValid, false);
  assert.match(exceed.error || '', /melebihi sisa pesanan PO/);

  // 4. Zero receipt -> Rejected
  const zero = validateGrnReceipt(1000, 200, 0);
  assert.equal(zero.isValid, false);
  assert.match(zero.error || '', /harus lebih besar dari 0/);
});

test('validateMaterialIssue enforces zero-negative stock policy and requires target lane', () => {
  // On-hand 840 Kg
  // 1. Valid issue 360 Kg
  const valid = validateMaterialIssue(840, 360, 'lane-1');
  assert.equal(valid.isValid, true);
  assert.equal(valid.balanceAfterIssue, 480);

  // 2. Issue exact stock 840 Kg
  const exact = validateMaterialIssue(840, 840, 'lane-1');
  assert.equal(exact.isValid, true);
  assert.equal(exact.balanceAfterIssue, 0);

  // 3. Exceeds available stock (900 > 840) -> Rejected (Zero Negative Policy)
  const exceed = validateMaterialIssue(840, 900, 'lane-1');
  assert.equal(exceed.isValid, false);
  assert.match(exceed.error || '', /Zero Negative Stock/);

  // 4. Missing target lane -> Rejected
  const noLane = validateMaterialIssue(840, 100, '');
  assert.equal(noLane.isValid, false);
  assert.match(noLane.error || '', /Lini produksi tujuan wajib/);
});

test('validateStockAdjustment enforces non-negative physical qty and mandatory reason', () => {
  // System qty 210, actual physical found 200 -> Difference -10
  // 1. Valid adjustment with reason
  const valid = validateStockAdjustment(210, 200, 'Stock Opname Bulanan', 'Susut potongan sample uji QC');
  assert.equal(valid.isValid, true);
  assert.equal(valid.differenceQty, -10);

  // 2. Negative actual physical qty (< 0) -> Rejected
  const neg = validateStockAdjustment(210, -5, 'Stock Opname Bulanan', 'Susut potongan sample uji QC');
  assert.equal(neg.isValid, false);
  assert.match(neg.error || '', /tidak boleh bernilai negatif/);

  // 3. Missing reason category -> Rejected
  const noCat = validateStockAdjustment(210, 200, '', 'Susut potongan sample uji QC');
  assert.equal(noCat.isValid, false);
  assert.match(noCat.error || '', /Kategori alasan/);

  // 4. Reason too short (< 5 chars) -> Rejected
  const shortReason = validateStockAdjustment(210, 200, 'Stock Opname Bulanan', 'ok');
  assert.equal(shortReason.isValid, false);
  assert.match(shortReason.error || '', /minimal 5 karakter/);
});

test('calculateWarehouseSummary correctly calculates inventory and pending inbound metrics', () => {
  const materials = [
    { onHandQty: 840, safetyStock: 300 }, // Safe
    { onHandQty: 1250, safetyStock: 400 }, // Safe
    { onHandQty: 250, safetyStock: 350 }, // Near Buffer / Warning!
  ];
  const movements = [{ movementType: 'grn' }, { movementType: 'issue' }];
  const pos = [
    { grnStatus: 'Fully Received' },
    { grnStatus: 'Partial GRN' },
    { grnStatus: 'No Receipt' },
  ];

  const summary = calculateWarehouseSummary(materials, movements, pos);
  assert.equal(summary.totalMaterialItems, 3);
  assert.equal(summary.totalPhysicalUnits, 840 + 1250 + 250);
  assert.equal(summary.bufferWarningCount, 1);
  assert.equal(summary.inboundWaitingGrnCount, 2);
  assert.equal(summary.totalMovementsCount, 2);
});

test('calculateLedgerBalanceForMaterial reconstructs live balance from append-only movements', () => {
  const movements: {
    materialId: string;
    movementType: 'init' | 'grn' | 'issue' | 'adj';
    qtyIn: number;
    qtyOut: number;
  }[] = [
    { materialId: 'MAT-001', movementType: 'init', qtyIn: 200, qtyOut: 0 },
    { materialId: 'MAT-001', movementType: 'grn', qtyIn: 1000, qtyOut: 0 },
    { materialId: 'MAT-001', movementType: 'issue', qtyIn: 0, qtyOut: 360 },
  ];

  // 200 + 1000 - 360 = 840
  const balance = calculateLedgerBalanceForMaterial('MAT-001', movements);
  assert.equal(balance, 840);
});

// ==========================================
// SPRINT 06: PRODUCTION & DELIVERY UNIT TESTS
// ==========================================

test('1. validateProductionActualEntry validates lane, date, part, locked PPIC target, and gap calculation without affecting FG stock', () => {
  // Valid entry: Defisit (Target 3300, Actual 3200 -> Gap +100 Defisit)
  const res1 = validateProductionActualEntry({
    laneId: 'lane-1',
    date: '2026-11-04',
    partId: 'PART-001',
    targetPcs: 3300,
    actualPcs: 3200,
    actualPacks: 64,
    packRatio: 50,
    ngPcs: 15,
  });
  assert.equal(res1.isValid, true);
  assert.equal(res1.gapPcs, 100);
  assert.equal(res1.gapStatus, 'defisit');
  assert.equal(res1.achievementPercent, 96.97);
  assert.equal(res1.affectsFgStock, false); // Wajib false per BRD

  // Surplus entry (Target 1000, Actual 1050 -> Gap -50 Surplus)
  const res2 = validateProductionActualEntry({
    laneId: 'lane-3',
    date: '2026-11-04',
    partId: 'PART-005',
    targetPcs: 1000,
    actualPcs: 1050,
    ngPcs: 5,
  });
  assert.equal(res2.isValid, true);
  assert.equal(res2.gapPcs, -50);
  assert.equal(res2.gapStatus, 'surplus');

  // Lane 4 blocked
  const res3 = validateProductionActualEntry({
    laneId: 'lane-4',
    date: '2026-11-04',
    partId: 'PART-001',
    targetPcs: 2000,
    actualPcs: 1500,
  });
  assert.equal(res3.isValid, false);
  assert.match(res3.errors[0], /Lane 4 berstatus Pending Configuration/);
});

test('2. validateSuratJalanDraft validates physical source locations (Ujung Lini or Gudang FG) and rejects Staging Area', () => {
  // Valid source: Gudang FG
  const validWh = validateSuratJalanDraft({
    soId: 'so-1',
    deliveryDate: '2026-11-05',
    sourceLocation: 'Gudang FG',
    items: [{ partNumber: 'NTC-RUB-0104', qtyShipped: 500 }],
  });
  assert.equal(validWh.isValid, true);

  // Valid source: Ujung Lini Produksi
  const validLine = validateSuratJalanDraft({
    soId: 'so-1',
    deliveryDate: '2026-11-05',
    sourceLocation: 'Ujung Lini Produksi (Lane 1)',
    items: [{ partNumber: 'NTC-RUB-0101', qtyShipped: 500 }],
  });
  assert.equal(validLine.isValid, true);

  // Invalid: Staging Area (Rejected per BRD §5.5)
  const invalidStaging = validateSuratJalanDraft({
    soId: 'so-1',
    deliveryDate: '2026-11-05',
    sourceLocation: 'Staging Area Loading Dock',
    items: [{ partNumber: 'NTC-RUB-0101', qtyShipped: 500 }],
  });
  assert.equal(invalidStaging.isValid, false);
  assert.match(invalidStaging.errors.join(' '), /Staging Area bukan merupakan lokasi/);
});

test('3. validateDeliveryConfirmation validates available FG stock before confirming Delivered', () => {
  // Stock 1800, Shipped 1200 -> Sufficient, Valid
  const resValid = validateDeliveryConfirmation({
    currentStatus: 'Printed',
    controlStatus: 'Matched',
    proofSigned: true,
    totalQtyShipped: 1200,
    availableStockAtLocation: 1800,
  });
  assert.equal(resValid.isValid, true);
  assert.equal(resValid.deductPcs, 1200);

  // Stock 500, Shipped 1500 -> Insufficient stock, Rejected!
  const resShort = validateDeliveryConfirmation({
    currentStatus: 'Printed',
    controlStatus: 'Pending',
    proofSigned: true,
    totalQtyShipped: 1500,
    availableStockAtLocation: 500,
  });
  assert.equal(resShort.isValid, false);
  assert.match(resShort.error || '', /melebihi saldo persediaan FG yang tersedia/);
});

test('4. Draft and Printed status do not reduce FG stock, only valid Delivered does', () => {
  // Without physical proof signed -> Rejected from deducting
  const resNoProof = validateDeliveryConfirmation({
    currentStatus: 'Printed',
    controlStatus: 'Pending',
    proofSigned: false,
    totalQtyShipped: 1500,
    availableStockAtLocation: 2000,
  });
  assert.equal(resNoProof.isValid, false);
  assert.match(resNoProof.error || '', /Bukti fisik lembar Surat Jalan/);
});

test('5. validateDeliveryConfirmation prevents double-deduction on already Delivered or baseline SJs', () => {
  // Baseline delivered SJ (alreadyDeducted: true) -> Rejected from double deduction
  const resBaseline = validateDeliveryConfirmation({
    currentStatus: 'Delivered',
    controlStatus: 'Matched',
    proofSigned: true,
    totalQtyShipped: 1200,
    availableStockAtLocation: 1800,
    alreadyDeducted: true,
  });
  assert.equal(resBaseline.isValid, false);
  assert.match(resBaseline.error || '', /sudah berstatus Delivered.*Konfirmasi berulang dicegah/);
});

test('6. evaluateSjVsPoStatus correctly evaluates Matched vs Exception against SO ordered quantity', () => {
  // SO ordered 13000, delivered 6500 -> Matched
  assert.equal(evaluateSjVsPoStatus(13000, 6500), 'matched');

  // SO ordered 6000, delivered 6000 -> Matched (exact)
  assert.equal(evaluateSjVsPoStatus(6000, 6000), 'matched');

  // SO ordered 5000, delivered 5500 -> Exception (over-delivery)
  assert.equal(evaluateSjVsPoStatus(5000, 5500), 'exception');
});

test('7. evaluateBillingEligibility enforces that Exception SJs or unconfirmed SJs cannot be billed', () => {
  // Delivered + Matched -> Eligible
  const el1 = evaluateBillingEligibility('Delivered', 'Matched');
  assert.equal(el1.isEligible, true);

  // Delivered + Exception -> Ineligible (BR-BIL-01)
  const el2 = evaluateBillingEligibility('Delivered', 'Exception');
  assert.equal(el2.isEligible, false);
  assert.match(el2.reason, /berstatus Exception dilarang masuk/);

  // Printed + Pending -> Ineligible
  const el3 = evaluateBillingEligibility('Printed', 'Pending');
  assert.equal(el3.isEligible, false);
  assert.match(el3.reason, /Hanya Surat Jalan berstatus Delivered/);

  // Draft + Pending -> Ineligible
  const el4 = evaluateBillingEligibility('Draft', 'Pending');
  assert.equal(el4.isEligible, false);
});

// ==========================================
// SPRINT 07: FINANCE & BILLING AR UNIT TESTS
// ==========================================

test('8. validateInvoiceCreation rejects non-Delivered or Exception SJs (BR-BIL-01)', () => {
  const result = validateInvoiceCreation({
    invoiceNumber: 'INV-2026-11-TEST',
    customerId: 'CUST-TMMIN-02',
    customerName: 'PT Trans Mega Motor Indonesia',
    customerPoNumber: 'TMMIN-P4-09821',
    periodMonth: 'November',
    periodYear: '2026',
    dueDate: '2026-12-15',
    paymentTerms: 'Net 45',
    items: [
      {
        sjId: 'do-3',
        sjNumber: 'SJ-2026-0091',
        soId: 'so-2',
        soNumber: 'SO-2026-0042',
        partNumber: 'NTC-FOAM-0201',
        partDescription: 'Acoustic Foam Barrier Firewall 10mm',
        qtyToBill: 1500,
        unitPrice: 24500,
        availableUnbilledQty: 1500,
        sjStatus: 'Printed', // Not Delivered!
        sjControlStatus: 'Pending',
      },
    ],
  });

  assert.equal(result.isValid, false);
  assert.match(result.errors[0], /tidak memenuhi syarat billing: Status harus Delivered & Matched/);
});

test('9. validateInvoiceCreation isolates and rejects SO-2026-0043 as unverified delivery exception', () => {
  const result = validateInvoiceCreation({
    invoiceNumber: 'INV-2026-11-TEST2',
    customerId: 'CUST-DNIA-03',
    customerName: 'PT Daya Nusantara Industri Auto',
    customerPoNumber: 'DNIA-PO-7781',
    periodMonth: 'November',
    periodYear: '2026',
    dueDate: '2026-12-05',
    paymentTerms: 'Net 30',
    items: [
      {
        sjId: 'sim-sj-43',
        sjNumber: 'SJ-SIM-0043',
        soId: 'so-3',
        soNumber: 'SO-2026-0043', // Isolated unverified SO!
        partNumber: 'NTC-RUB-0101',
        partDescription: 'Gasket Seal Cylinder Head EPDM',
        qtyToBill: 6000,
        unitPrice: 12500,
        availableUnbilledQty: 6000,
        sjStatus: 'Delivered',
        sjControlStatus: 'Exception',
      },
    ],
  });

  assert.equal(result.isValid, false);
  assert.ok(result.errors.some((e) => e.includes('Data Integrity Exception')));
});

test('10. validateInvoiceCreation prevents exceeding available unbilled quantity on SJ', () => {
  const result = validateInvoiceCreation({
    invoiceNumber: 'INV-2026-11-TEST3',
    customerId: 'CUST-ADM-01',
    customerName: 'PT Auto Dinamika Manufaktur',
    customerPoNumber: 'ADM-PO-2610-8812',
    periodMonth: 'November',
    periodYear: '2026',
    dueDate: '2026-12-02',
    paymentTerms: 'Net 30',
    items: [
      {
        sjId: 'do-1',
        sjNumber: 'SJ-2026-0089',
        soId: 'so-1',
        soNumber: 'SO-2026-0041',
        partNumber: 'NTC-EVA-0301',
        partDescription: 'EVA Sponge Weatherstrip Door Sash',
        qtyToBill: 5000, // Available is only 4000!
        unitPrice: 10000,
        availableUnbilledQty: 4000,
        sjStatus: 'Delivered',
        sjControlStatus: 'Matched',
      },
    ],
  });

  assert.equal(result.isValid, false);
  assert.ok(result.errors.some((e) => e.includes('melebihi sisa yang belum ditagihkan')));
});

test('11. validateInvoiceCreation succeeds for eligible multi-SJ and calculates subtotal, 11% PPN, and total', () => {
  const result = validateInvoiceCreation({
    invoiceNumber: 'INV-2026-11-002',
    customerId: 'CUST-ADM-01',
    customerName: 'PT Auto Dinamika Manufaktur',
    customerPoNumber: 'ADM-PO-2610-8812',
    periodMonth: 'November',
    periodYear: '2026',
    dueDate: '2026-12-02',
    paymentTerms: 'Net 30',
    items: [
      {
        sjId: 'do-1',
        sjNumber: 'SJ-2026-0089',
        soId: 'so-1',
        soNumber: 'SO-2026-0041',
        partNumber: 'NTC-EVA-0301',
        partDescription: 'EVA Sponge Weatherstrip Door Sash',
        qtyToBill: 4000,
        unitPrice: 10000,
        availableUnbilledQty: 4000,
        sjStatus: 'Delivered',
        sjControlStatus: 'Matched',
      },
    ],
  });

  assert.equal(result.isValid, true);
  assert.equal(result.totalQtyPcs, 4000);
  assert.equal(result.subtotalAmount, 40000000); // 4.000 x 10.000
  assert.equal(result.taxAmount, 4400000); // 11% of 40.000.000
  assert.equal(result.totalAmount, 44400000); // 40.000.000 + 4.400.000
  assert.deepEqual(result.linkedSjNumbers, ['SJ-2026-0089']);
});

test('12. validatePaymentRecording enforces positive amount and prevents overpayment beyond outstanding', () => {
  // Invoice total: 34.687.500, paid: 15.000.000, outstanding: 19.687.500
  // Overpayment test
  const overpay = validatePaymentRecording({
    invoiceId: 'inv-1',
    invoiceNumber: 'INV-2026-11-001',
    totalInvoiceAmount: 34687500,
    currentPaidAmount: 15000000,
    amountToPay: 20000000, // 20.000.000 > 19.687.500
    paymentDate: '2026-11-10',
    paymentMethod: 'Bank Transfer (BCA)',
    referenceNumber: 'TRF-BCA-999',
  });

  assert.equal(overpay.isValid, false);
  assert.match(overpay.errors[0], /melebihi sisa piutang tertagih/);

  // Zero amount test
  const zero = validatePaymentRecording({
    invoiceId: 'inv-1',
    invoiceNumber: 'INV-2026-11-001',
    totalInvoiceAmount: 34687500,
    currentPaidAmount: 15000000,
    amountToPay: 0,
    paymentDate: '2026-11-10',
    paymentMethod: 'Bank Transfer (BCA)',
    referenceNumber: 'TRF-BCA-999',
  });

  assert.equal(zero.isValid, false);
  assert.match(zero.errors[0], /harus lebih besar dari Rp 0/);
});

test('13. validatePaymentRecording updates paid balance and transitions to Paid on full settlement', () => {
  // Full payment of remaining 19.687.500
  const fullPay = validatePaymentRecording({
    invoiceId: 'inv-1',
    invoiceNumber: 'INV-2026-11-001',
    totalInvoiceAmount: 34687500,
    currentPaidAmount: 15000000,
    amountToPay: 19687500,
    paymentDate: '2026-11-10',
    paymentMethod: 'Bank Transfer (BCA)',
    referenceNumber: 'TRF-BCA-1002',
  });

  assert.equal(fullPay.isValid, true);
  assert.equal(fullPay.newPaidAmount, 34687500);
  assert.equal(fullPay.newOutstandingAmount, 0);
  assert.equal(fullPay.newStatus, 'Paid');

  // Partial payment of 5.000.000
  const partialPay = validatePaymentRecording({
    invoiceId: 'inv-1',
    invoiceNumber: 'INV-2026-11-001',
    totalInvoiceAmount: 34687500,
    currentPaidAmount: 15000000,
    amountToPay: 5000000,
    paymentDate: '2026-11-10',
    paymentMethod: 'Bank Transfer (BCA)',
    referenceNumber: 'TRF-BCA-1003',
  });

  assert.equal(partialPay.isValid, true);
  assert.equal(partialPay.newPaidAmount, 20000000);
  assert.equal(partialPay.newOutstandingAmount, 14687500);
  assert.equal(partialPay.newStatus, 'Partially Paid');
});

test('14. calculateFinanceSummary strictly preserves baseline: 7.700 Delivered, 2.500 Billed, 5.200 Unbilled', () => {
  const deliveryOrders = [
    {
      status: 'Delivered',
      controlStatus: 'Matched',
      items: [{ qtyShipped: 2500 }, { qtyShipped: 4000 }], // SJ-0089: 6.500 PCS
    },
    {
      status: 'Delivered',
      controlStatus: 'Matched',
      items: [{ qtyShipped: 1200 }], // SJ-0090: 1.200 PCS
    },
    {
      status: 'Printed',
      controlStatus: 'Pending',
      items: [{ qtyShipped: 1500 }], // SJ-0091: 1.500 PCS (locked)
    },
    {
      status: 'Draft',
      controlStatus: 'Pending',
      items: [{ qtyShipped: 2500 }], // SJ-0092: 2.500 PCS (locked)
    },
  ];

  const invoices = [
    {
      status: 'Partially Paid',
      totalAmount: 34687500,
      paidAmount: 15000000,
      outstandingAmount: 19687500,
      totalQtyPcs: 2500, // Baseline Billed: 2.500 PCS
      dueDate: '2026-12-02',
    },
  ];

  const summary = calculateFinanceSummary(deliveryOrders, invoices);

  assert.equal(summary.verifiedDeliveredPcs, 7700);
  assert.equal(summary.verifiedBilledPcs, 2500);
  assert.equal(summary.unbilledDeliveredPcs, 5200);
  assert.equal(summary.totalInvoicedAmount, 34687500);
  assert.equal(summary.totalPaidAmount, 15000000);
  assert.equal(summary.totalOutstandingAr, 19687500);
  assert.equal(summary.readyToBillSjCount, 2);
});
