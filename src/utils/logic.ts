/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Nutech ERP Pure Business Logic Functions (Decoupled & Deterministic)
 */

/**
 * Konversi input pack ke PCS berdasarkan rasio pack-to-PCS per lini per part (BR-PR-04, BR-PR-05)
 */
export function calculatePackToPcs(packs: number, pcsPerPack: number): number {
  if (packs < 0 || pcsPerPack <= 0) return 0;
  return Math.floor(packs * pcsPerPack);
}

/**
 * Kalkulasi Gap Produksi On-The-Fly: Target minus Aktual (BR-PR-01)
 * Positif = Kurang dari target (under-production)
 * Negatif = Melebihi target (over-production)
 */
export function calculateProductionGap(targetQtyPcs: number, actualQtyPcs: number): number {
  return targetQtyPcs - actualQtyPcs;
}

/**
 * Perhitungan Pemenuhan Sales Order (Partial Fulfillment support BR-SO-03)
 */
export function calculateSoFulfillment(qtyOrdered: number, qtyDelivered: number) {
  const safeOrdered = Math.max(0, qtyOrdered);
  const safeDelivered = Math.max(0, qtyDelivered);
  const remaining = Math.max(0, safeOrdered - safeDelivered);
  const percent = safeOrdered > 0 ? Math.min(100, Math.round((safeDelivered / safeOrdered) * 100)) : 0;
  return {
    remainingQty: remaining,
    percentComplete: percent,
    isFulfilled: remaining === 0,
  };
}

/**
 * Verifikasi Kumulatif Surat Jalan Delivered vs SO (BR-CTL-04)
 * Matched jika kumulatif kirim <= kuantitas SO
 * Exception jika kumulatif kirim melebihi kuantitas SO
 */
export function evaluateSjVsPoStatus(soOrderedQty: number, cumulativeDeliveredQty: number): 'matched' | 'exception' {
  if (cumulativeDeliveredQty <= soOrderedQty && cumulativeDeliveredQty >= 0) {
    return 'matched';
  }
  return 'exception';
}

/**
 * Simulasi Demo MRP (BR-MAT-06):
 * Net Req = (Std Consumption x Target Qty) + Scrap Allowance - Available Stock
 */
export function calculateMrpNetReq(
  stdConsumptionPerPcs: number,
  targetQtyPcs: number,
  scrapAllowancePercent: number,
  availableStock: number
): number {
  const grossRequirement = stdConsumptionPerPcs * targetQtyPcs;
  const scrapQty = grossRequirement * (scrapAllowancePercent / 100);
  const totalRequirement = grossRequirement + scrapQty;
  const netRequirement = Math.max(0, totalRequirement - availableStock);
  return Number(netRequirement.toFixed(2));
}

/**
 * Format tanggal standar Indonesia (misal: "25 Nov 2026")
 * Tidak mengubah nilai tanggal asli di database/state.
 */
export function formatIndoDate(dateStr: string): string {
  if (!dateStr) return '-';
  // Handle ISO string or YYYY-MM-DD
  const cleanDate = dateStr.split('T')[0];
  const parts = cleanDate.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthName = months[month - 1] || parts[1];
  const dayFormatted = day < 10 ? `0${day}` : `${day}`;
  return `${dayFormatted} ${monthName} ${year}`;
}

/**
 * Kalkulasi Persentase Capaian Produksi (Achievement %)
 * Rumus: (Aktual / Target) * 100, dibulatkan 2 desimal
 */
export function calculateProductionAchievement(actualQtyPcs: number, targetQtyPcs: number): number {
  if (targetQtyPcs <= 0) return 0;
  return Number(((actualQtyPcs / targetQtyPcs) * 100).toFixed(2));
}

/**
 * Validasi Lokasi Pengambilan Surat Jalan (Preserve Raw Location, Audit Validated Location)
 * Memeriksa apakah lokasi sumber fisik sesuai dengan lini manufaktur part.
 * Lane 1: Rubber (NTC-RUB-*)
 * Lane 2: Foam (NTC-FOAM-*)
 * Lane 3: EVA (NTC-EVA-*)
 */
export function validateSjSourceLocation(
  partNumbers: string[],
  rawSourceLocation: string
): { isValid: boolean; displayLocation: string; validationStatus: string } {
  // If Gudang FG, it is a valid consolidated warehouse location
  if (rawSourceLocation.toLowerCase().includes('gudang fg')) {
    return {
      isValid: true,
      displayLocation: 'Gudang FG',
      validationStatus: 'Valid',
    };
  }

  // Check unique lanes for the parts
  const lanes = new Set<string>();
  for (const p of partNumbers) {
    if (p.includes('RUB')) lanes.add('Lane 1');
    else if (p.includes('FOAM')) lanes.add('Lane 2');
    else if (p.includes('EVA')) lanes.add('Lane 3');
  }

  if (lanes.size > 1) {
    return {
      isValid: false,
      displayLocation: 'Lokasi Belum Ditentukan (Konsolidasi Multi-Lini)',
      validationStatus: 'Multi-Line Conflict',
    };
  }

  const expectedLane = Array.from(lanes)[0];
  if (expectedLane && !rawSourceLocation.includes(expectedLane)) {
    return {
      isValid: false,
      displayLocation: 'Lokasi Belum Ditentukan (Ketidaksesuaian Data Lini)',
      validationStatus: 'Line Mismatch',
    };
  }

  return {
    isValid: true,
    displayLocation: rawSourceLocation,
    validationStatus: 'Valid',
  };
}

/**
 * Validasi form Sales Order (BR-SO-01, BR-SO-05, FEAT-SO-01)
 * Memeriksa customer, nomor PO pelanggan, tanggal kebutuhan (need date), dan minimal 1 line item valid.
 */
export function validateSalesOrderForm(input: {
  customerId: string;
  customerPoNumber: string;
  needDate: string;
  items: { partId: string; qtyPcs: number }[];
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.customerId || input.customerId.trim() === '') {
    errors.push('Customer B2B wajib dipilih.');
  }

  if (!input.customerPoNumber || input.customerPoNumber.trim().length < 3) {
    errors.push('Nomor PO pelanggan wajib diisi minimal 3 karakter.');
  }

  if (!input.needDate || input.needDate.trim() === '') {
    errors.push('Tanggal kebutuhan pelanggan (Need Date) wajib diisi (BR-SO-05).');
  }

  if (!input.items || input.items.length === 0) {
    errors.push('Sales Order wajib memiliki minimal 1 line item part (BR-SO-01).');
  } else {
    input.items.forEach((item, idx) => {
      if (!item.partId) {
        errors.push(`Item #${idx + 1}: Part komponen wajib dipilih.`);
      }
      if (!item.qtyPcs || item.qtyPcs <= 0) {
        errors.push(`Item #${idx + 1}: Kuantitas pesanan (PCS) harus lebih dari 0.`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Kalkulasi ringkasan kuantitas dan nilai estimasi Sales Order
 */
export function calculateOrderTotals(
  items: { qtyPcs: number; unitPrice: number }[]
): { totalQtyPcs: number; totalEstimatedAmount: number; itemCount: number } {
  if (!items || items.length === 0) {
    return { totalQtyPcs: 0, totalEstimatedAmount: 0, itemCount: 0 };
  }

  let totalQty = 0;
  let totalAmount = 0;

  for (const item of items) {
    const qty = Math.max(0, item.qtyPcs || 0);
    const price = Math.max(0, item.unitPrice || 0);
    totalQty += qty;
    totalAmount += qty * price;
  }

  return {
    totalQtyPcs: totalQty,
    totalEstimatedAmount: totalAmount,
    itemCount: items.length,
  };
}

/**
 * Evaluasi status Gap Produksi (BR-PR-01, BR-PR-02)
 * Gap = Target - Actual
 * Positif = Defisit (under-production)
 * Nol = Target Tercapai Tepat
 * Negatif = Surplus (over-production)
 */
export function evaluateProductionGapDetail(targetQtyPcs: number, actualQtyPcs: number): {
  gap: number;
  status: 'defisit' | 'tercapai' | 'surplus';
  label: string;
  badgeVariant: 'warning' | 'success' | 'neutral';
} {
  const gap = targetQtyPcs - actualQtyPcs;
  if (gap > 0) {
    return {
      gap,
      status: 'defisit',
      label: `+${gap.toLocaleString('id-ID')} PCS (Defisit)`,
      badgeVariant: 'warning',
    };
  }
  if (gap === 0) {
    return {
      gap: 0,
      status: 'tercapai',
      label: '0 PCS (Tercapai)',
      badgeVariant: 'neutral',
    };
  }
  return {
    gap,
    status: 'surplus',
    label: `${gap.toLocaleString('id-ID')} PCS (Surplus)`,
    badgeVariant: 'success',
  };
}

/**
 * Validasi form penerbitan SPK Bulanan (FEAT-SPK-01, BR-SPK-01 s/d BR-SPK-05)
 * SPK diterbitkan bulanan per lane, memuat multi-part, satuan resmi PCS.
 */
export function validateSpkForm(input: {
  spkNumber: string;
  laneId: string;
  periodMonth: string;
  periodYear: string;
  items: { partId: string; targetPcsMonthly: number }[];
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.spkNumber || input.spkNumber.trim().length < 3) {
    errors.push('Nomor SPK wajib diisi minimal 3 karakter.');
  }

  if (!input.laneId || input.laneId.trim() === '') {
    errors.push('Lini produksi (Lane) wajib dipilih (BR-SPK-01).');
  }

  if (!input.periodMonth || !input.periodYear) {
    errors.push('Periode bulan dan tahun wajib ditentukan.');
  }

  if (!input.items || input.items.length === 0) {
    errors.push('SPK wajib memuat minimal 1 part komponen.');
  } else {
    input.items.forEach((item, idx) => {
      if (!item.partId) {
        errors.push(`Line #${idx + 1}: Part komponen wajib dipilih.`);
      }
      if (!item.targetPcsMonthly || item.targetPcsMonthly <= 0) {
        errors.push(`Line #${idx + 1}: Target produksi bulanan (PCS) harus lebih dari 0 (BR-SPK-03).`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validasi konfigurasi rasio konversi Pack-to-PCS (FEAT-MD-08, BR-PR-04, BR-PR-05)
 * Rasio > 0 dan kombinasi Lane + Part harus unik.
 */
export function validatePackConversionConfig(
  laneId: string,
  partId: string,
  packRatio: number,
  existingConfigs: { id?: string; laneId: string; partId: string }[],
  currentConfigId?: string
): { isValid: boolean; error?: string } {
  if (!laneId || laneId.trim() === '') {
    return { isValid: false, error: 'Lini produksi wajib dipilih.' };
  }

  if (!partId || partId.trim() === '') {
    return { isValid: false, error: 'Part komponen wajib dipilih.' };
  }

  if (!packRatio || packRatio <= 0) {
    return { isValid: false, error: 'Rasio konversi harus berupa angka positif lebih dari 0.' };
  }

  // Cek duplikasi kombinasi lane + part
  const isDuplicate = existingConfigs.some((cfg) => {
    if (currentConfigId && cfg.id === currentConfigId) return false;
    return cfg.laneId === laneId && cfg.partId === partId;
  });

  if (isDuplicate) {
    return {
      isValid: false,
      error: 'Konfigurasi untuk kombinasi Lini dan Part tersebut sudah terdaftar (duplikat ditolak).',
    };
  }

  return { isValid: true };
}

/**
 * Kalkulasi total target bulanan dari item SPK
 */
export function calculateSpkTotalTarget(items: { targetPcsMonthly: number }[]): number {
  if (!items || items.length === 0) return 0;
  return items.reduce((acc, curr) => acc + Math.max(0, curr.targetPcsMonthly || 0), 0);
}

// ==========================================
// SPRINT 04: PURCHASING DOMAIN LOGIC
// ==========================================

/**
 * Kalkulasi Subtotal dan Total Nilai Purchase Order
 */
export function calculatePoTotals(items: { qtyOrdered: number; unitPrice: number }[]): {
  totalItems: number;
  totalQty: number;
  totalAmount: number;
} {
  if (!items || items.length === 0) {
    return { totalItems: 0, totalQty: 0, totalAmount: 0 };
  }

  const totalItems = items.length;
  let totalQty = 0;
  let totalAmount = 0;

  for (const item of items) {
    const qty = Math.max(0, item.qtyOrdered || 0);
    const price = Math.max(0, item.unitPrice || 0);
    totalQty += qty;
    totalAmount += qty * price;
  }

  return {
    totalItems,
    totalQty,
    totalAmount,
  };
}

/**
 * Validasi Form Pembuatan / Edit Purchase Order
 */
export function validatePurchaseOrderForm(data: {
  supplierId: string;
  orderDate: string;
  expectedDeliveryDate: string;
  items: { materialId: string; qtyOrdered: number; unitPrice: number }[];
}): { isValid: boolean; error?: string } {
  if (!data.supplierId || data.supplierId.trim() === '') {
    return { isValid: false, error: 'Pemasok (Supplier) wajib dipilih.' };
  }

  if (!data.orderDate) {
    return { isValid: false, error: 'Tanggal PO wajib diisi.' };
  }

  if (!data.expectedDeliveryDate) {
    return { isValid: false, error: 'Estimasi tanggal kedatangan (Need/Delivery Date) wajib diisi.' };
  }

  if (!data.items || data.items.length === 0) {
    return { isValid: false, error: 'PO minimal harus memiliki 1 baris item material.' };
  }

  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    if (!item.materialId) {
      return { isValid: false, error: `Baris item #${i + 1}: Material bahan baku wajib dipilih.` };
    }
    if (item.qtyOrdered <= 0) {
      return { isValid: false, error: `Baris item #${i + 1}: Kuantitas order harus lebih besar dari 0.` };
    }
    if (item.unitPrice < 0) {
      return { isValid: false, error: `Baris item #${i + 1}: Harga satuan tidak boleh bernilai negatif.` };
    }
  }

  return { isValid: true };
}

/**
 * Validasi Form Master Supplier
 */
export function validateSupplierForm(
  data: {
    code: string;
    name: string;
    contactPerson: string;
    paymentTerms: string;
  },
  existingSuppliers: { id?: string; code: string }[],
  currentSupplierId?: string
): { isValid: boolean; error?: string } {
  if (!data.code || data.code.trim().length < 3) {
    return { isValid: false, error: 'Kode Supplier wajib diisi (minimal 3 karakter).' };
  }

  if (!data.name || data.name.trim().length < 3) {
    return { isValid: false, error: 'Nama Supplier wajib diisi (minimal 3 karakter).' };
  }

  if (!data.contactPerson || data.contactPerson.trim() === '') {
    return { isValid: false, error: 'Nama kontak PIC Supplier wajib diisi.' };
  }

  if (!data.paymentTerms || data.paymentTerms.trim() === '') {
    return { isValid: false, error: 'Termin pembayaran standar wajib diisi (misal: Net 30).' };
  }

  const isDuplicate = existingSuppliers.some(
    (s) =>
      s.code.trim().toLowerCase() === data.code.trim().toLowerCase() &&
      s.id !== currentSupplierId
  );

  if (isDuplicate) {
    return { isValid: false, error: `Kode Supplier "${data.code}" sudah digunakan. Gunakan kode unik lain.` };
  }

  return { isValid: true };
}

/**
 * Simulasi Kalkulasi MRP Demo (BR-MAT-06, TBD-06, TBD-15)
 * Net Req = Gross Req + Scrap Allowance - Available Stock
 */
export function calculateMaterialRequirementSummary(
  targetPcsPerPart: Record<string, number>,
  boms: {
    partNumber: string;
    materialId: string;
    materialCode: string;
    materialName: string;
    stdConsumptionPerPcs: number;
    scrapAllowancePercent: number;
  }[],
  materials: {
    id: string;
    code: string;
    name: string;
    category: string;
    purchaseUom: 'Roll' | 'Sheet' | 'Kg';
    onHandQty: number;
    allocatedSpkQty: number;
    safetyStock: number;
    standardPricePerUom: number;
    preferredSupplierName: string;
  }[]
) {
  return materials.map((mat) => {
    // Cari semua BOM yang memakai material ini
    const relevantBoms = boms.filter((b) => b.materialCode === mat.code || b.materialId === mat.id);

    let grossRequirement = 0;
    let scrapQty = 0;

    for (const bom of relevantBoms) {
      const targetPcs = targetPcsPerPart[bom.partNumber] || 0;
      const consumption = targetPcs * bom.stdConsumptionPerPcs;
      const scrap = consumption * (bom.scrapAllowancePercent / 100);
      grossRequirement += consumption;
      scrapQty += scrap;
    }

    grossRequirement = Number(grossRequirement.toFixed(2));
    scrapQty = Number(scrapQty.toFixed(2));
    const totalDemand = Number((grossRequirement + scrapQty).toFixed(2));
    const availableStock = mat.onHandQty;
    const netRequirement = Math.max(0, Number((totalDemand - availableStock).toFixed(2)));
    const recommendedPoQty = netRequirement > 0 ? Math.ceil(netRequirement) : 0;
    const estimatedCost = recommendedPoQty * mat.standardPricePerUom;

    let status: 'Defisit (PO Diperlukan)' | 'Stok Aman' | 'Buffer Tipis' = 'Stok Aman';
    if (netRequirement > 0) {
      status = 'Defisit (PO Diperlukan)';
    } else if (availableStock - totalDemand < mat.safetyStock) {
      status = 'Buffer Tipis';
    }

    return {
      materialId: mat.id,
      materialCode: mat.code,
      materialName: mat.name,
      category: mat.category,
      purchaseUom: mat.purchaseUom,
      grossRequirement,
      scrapAllowanceQty: scrapQty,
      scrapPercent: relevantBoms.length > 0 ? relevantBoms[0].scrapAllowancePercent : 0,
      totalDemand,
      availableStock,
      netRequirement,
      recommendedPoQty,
      preferredSupplierName: mat.preferredSupplierName,
      leadTimeDays: 7,
      estimatedCost,
      status,
    };
  });
}

// ==========================================
// SPRINT 05: WAREHOUSE DOMAIN LOGIC
// ==========================================

/**
 * Validasi Penerimaan Material GRN (FEAT-WH-01, BR-MAT-01)
 * Qty diterima harus > 0 dan tidak boleh melebihi sisa PO tanpa otorisasi.
 */
export function validateGrnReceipt(
  orderedQty: number,
  alreadyReceivedQty: number,
  qtyReceivedNow: number
): { isValid: boolean; error?: string; remainingPoQty: number } {
  const remainingPoQty = Math.max(0, orderedQty - alreadyReceivedQty);

  if (qtyReceivedNow <= 0) {
    return {
      isValid: false,
      error: 'Kuantitas penerimaan fisik harus lebih besar dari 0.',
      remainingPoQty,
    };
  }

  if (qtyReceivedNow > remainingPoQty) {
    return {
      isValid: false,
      error: `Kuantitas penerimaan (${qtyReceivedNow}) melebihi sisa pesanan PO (${remainingPoQty}). Kelebihan kuantitas ditolak (FEAT-WH-01).`,
      remainingPoQty,
    };
  }

  return {
    isValid: true,
    remainingPoQty,
  };
}

/**
 * Validasi Material Issue ke Lini (FEAT-WH-03, BR-MAT-02, BR-MAT-03)
 * Qty dikeluarkan harus > 0 dan tidak boleh melebihi saldo on-hand fisik (Zero Negative Policy).
 */
export function validateMaterialIssue(
  currentOnHandQty: number,
  qtyToIssue: number,
  targetLaneId: string
): { isValid: boolean; error?: string; balanceAfterIssue: number } {
  if (!targetLaneId || targetLaneId.trim() === '') {
    return {
      isValid: false,
      error: 'Lini produksi tujuan wajib ditentukan (BR-MAT-02).',
      balanceAfterIssue: currentOnHandQty,
    };
  }

  if (qtyToIssue <= 0) {
    return {
      isValid: false,
      error: 'Kuantitas bahan yang dikeluarkan harus lebih besar dari 0.',
      balanceAfterIssue: currentOnHandQty,
    };
  }

  if (qtyToIssue > currentOnHandQty) {
    return {
      isValid: false,
      error: `Saldo stok tidak mencukupi. Permintaan (${qtyToIssue}) melebihi saldo tersedia (${currentOnHandQty}). Transaksi ditolak (NFR-02 Zero Negative Stock).`,
      balanceAfterIssue: currentOnHandQty,
    };
  }

  const balanceAfterIssue = currentOnHandQty - qtyToIssue;

  return {
    isValid: true,
    balanceAfterIssue,
  };
}

/**
 * Validasi Stock Adjustment Material (FEAT-WH-04, F-13, NFR-04)
 * Alasan wajib diisi (minimal 5 karakter) dan saldo pasca-adjustment tidak boleh negatif.
 */
export function validateStockAdjustment(
  currentSystemQty: number,
  actualPhysicalQty: number,
  reasonCategory: string,
  reasonDetail: string
): { isValid: boolean; error?: string; differenceQty: number } {
  if (actualPhysicalQty < 0) {
    return {
      isValid: false,
      error: 'Hasil perhitungan fisik (fisik riil) tidak boleh bernilai negatif (NFR-02).',
      differenceQty: 0,
    };
  }

  if (!reasonCategory || reasonCategory.trim() === '') {
    return {
      isValid: false,
      error: 'Kategori alasan penyesuaian stok wajib dipilih.',
      differenceQty: 0,
    };
  }

  if (!reasonDetail || reasonDetail.trim().length < 5) {
    return {
      isValid: false,
      error: 'Alasan penyesuaian stok wajib diisi secara rinci minimal 5 karakter (NFR-04 Audit Trail).',
      differenceQty: 0,
    };
  }

  const differenceQty = actualPhysicalQty - currentSystemQty;

  return {
    isValid: true,
    differenceQty,
  };
}

/**
 * Kalkulasi Rekap Saldo dan Ringkasan Gudang Bahan Baku
 */
export function calculateWarehouseSummary(
  materials: { onHandQty: number; safetyStock: number }[],
  movements: { movementType: string }[],
  openPurchaseOrders: { grnStatus: string }[]
): {
  totalMaterialItems: number;
  totalPhysicalUnits: number;
  bufferWarningCount: number;
  inboundWaitingGrnCount: number;
  totalMovementsCount: number;
} {
  const totalMaterialItems = materials.length;
  let totalPhysicalUnits = 0;
  let bufferWarningCount = 0;

  for (const m of materials) {
    totalPhysicalUnits += m.onHandQty;
    if (m.onHandQty <= m.safetyStock) {
      bufferWarningCount++;
    }
  }

  const inboundWaitingGrnCount = openPurchaseOrders.filter(
    (po) => po.grnStatus === 'No Receipt' || po.grnStatus === 'Partial GRN'
  ).length;

  return {
    totalMaterialItems,
    totalPhysicalUnits,
    bufferWarningCount,
    inboundWaitingGrnCount,
    totalMovementsCount: movements.length,
  };
}

/**
 * Rekonsiliasi Saldo Material dari Ledger Transaksi (Append-Only Verification)
 */
export function calculateLedgerBalanceForMaterial(
  materialId: string,
  movements: {
    materialId: string;
    movementType: 'init' | 'grn' | 'issue' | 'adj';
    qtyIn: number;
    qtyOut: number;
  }[]
): number {
  const relevantMovements = movements.filter((m) => m.materialId === materialId);
  let balance = 0;

  for (const mov of relevantMovements) {
    if (mov.movementType === 'init' || mov.movementType === 'grn') {
      balance += mov.qtyIn;
    } else if (mov.movementType === 'issue') {
      balance -= mov.qtyOut;
    } else if (mov.movementType === 'adj') {
      balance += (mov.qtyIn - mov.qtyOut);
    }
  }

  return Math.max(0, balance);
}

// ==========================================
// ADMIN OPERASIONAL & DELIVERY LOGIC (SPRINT 06)
// ==========================================

export interface ProductionEntryValidationResult {
  isValid: boolean;
  gapPcs: number;
  gapStatus: 'defisit' | 'tercapai' | 'surplus';
  achievementPercent: number;
  affectsFgStock: false; // Aturan Baku BRD: Aktual produksi TIDAK otomatis menambah FG
  errors: string[];
}

/**
 * Validasi Input Aktual Produksi Harian (BR-PR-01 s/d BR-PR-05)
 * - Target PPIC terkunci dan tidak boleh diubah
 * - Gap = Target - Actual (Positif = Defisit, Nol = Tercapai, Negatif = Surplus)
 * - NG dicatat terpisah dan tidak mengubah formula gap
 * - Hasil input tidak otomatis menambah saldo FG (affectsFgStock: false)
 */
export function validateProductionActualEntry(input: {
  laneId: string;
  date: string;
  partId: string;
  targetPcs: number;
  actualPcs: number;
  actualPacks?: number;
  packRatio?: number;
  ngPcs?: number;
}): ProductionEntryValidationResult {
  const errors: string[] = [];

  if (!input.laneId || input.laneId.trim() === '') {
    errors.push('Lini produksi wajib dipilih');
  }

  if (input.laneId === 'lane-4') {
    errors.push('Lane 4 berstatus Pending Configuration dan tidak dapat menerima pelaporan produksi');
  }

  if (!input.date || input.date.trim() === '') {
    errors.push('Tanggal pelaporan produksi wajib diisi');
  }

  if (!input.partId || input.partId.trim() === '') {
    errors.push('Part komponen yang diproduksi wajib dipilih');
  }

  if (input.targetPcs === undefined || input.targetPcs <= 0) {
    errors.push('Target PPIC harian tidak valid atau belum terkonfigurasi');
  }

  if (input.actualPcs === undefined || input.actualPcs < 0) {
    errors.push('Kuantitas aktual produksi harus berupa angka non-negatif');
  }

  if (input.ngPcs !== undefined && input.ngPcs < 0) {
    errors.push('Kuantitas NG (Not Good) tidak boleh bernilai negatif');
  }

  const gapPcs = (input.targetPcs || 0) - (input.actualPcs || 0);
  let gapStatus: 'defisit' | 'tercapai' | 'surplus' = 'tercapai';
  if (gapPcs > 0) gapStatus = 'defisit';
  else if (gapPcs < 0) gapStatus = 'surplus';

  const achievementPercent = calculateProductionAchievement(input.actualPcs || 0, input.targetPcs || 1);

  return {
    isValid: errors.length === 0,
    gapPcs,
    gapStatus,
    achievementPercent,
    affectsFgStock: false, // BRD: Disiplin tanpa mutasi otomatis ke FG
    errors,
  };
}

/**
 * Validasi Pembuatan Draft Surat Jalan (BR-DEL-01, BR-DEL-02)
 * Lokasi sumber fisik resmi HANYA Ujung Lini Produksi dan Gudang FG.
 * Staging Area dilarang menjadi lokasi fisik resmi tanpa dasar BRD.
 */
export function validateSuratJalanDraft(input: {
  soId: string;
  deliveryDate: string;
  sourceLocation: string;
  items: { partNumber: string; qtyShipped: number }[];
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.soId || input.soId.trim() === '') {
    errors.push('Referensi Sales Order (SO) wajib dipilih');
  }

  if (!input.deliveryDate || input.deliveryDate.trim() === '') {
    errors.push('Tanggal pengiriman (delivery date) wajib diisi');
  }

  const locLower = (input.sourceLocation || '').toLowerCase();
  const isValidLocation =
    locLower.includes('ujung lini') ||
    locLower.includes('lane') ||
    locLower.includes('gudang fg');

  if (!input.sourceLocation || !isValidLocation) {
    errors.push(
      'Lokasi sumber pengiriman fisik tidak sah. Lokasi resmi hanya: Ujung Lini Produksi atau Gudang FG'
    );
  }

  if (locLower.includes('staging')) {
    errors.push(
      'Staging Area bukan merupakan lokasi persediaan FG resmi menurut BRD §5.5'
    );
  }

  if (!input.items || input.items.length === 0) {
    errors.push('Surat Jalan wajib memiliki minimal 1 line item barang yang dikirim');
  } else {
    for (const it of input.items) {
      if (!it.partNumber || it.partNumber.trim() === '') {
        errors.push('Part number pada baris item pengiriman wajib diisi');
      }
      if (!it.qtyShipped || it.qtyShipped <= 0) {
        errors.push(`Kuantitas pengiriman untuk ${it.partNumber || 'item'} harus lebih besar dari 0`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validasi Konfirmasi Pengiriman Fisik (Status Delivered & Pemotongan Stok FG)
 * - Mencegah pemotongan stok pada Draft dan Printed (BR-DEL-02)
 * - Mencegah double deduction pada transaksi baseline
 * - Wajib bukti fisik tanda tangan penerimaan
 * - Menolak pemotongan jika kuantitas melebihi stok FG di lokasi
 */
export function validateDeliveryConfirmation(input: {
  currentStatus: 'Draft' | 'Printed' | 'Delivered';
  controlStatus: 'Pending' | 'Matched' | 'Exception';
  proofSigned: boolean;
  totalQtyShipped: number;
  availableStockAtLocation: number;
  alreadyDeducted?: boolean;
}): { isValid: boolean; error?: string; deductPcs: number } {
  if (input.alreadyDeducted) {
    return {
      isValid: false,
      error: 'Surat Jalan ini sudah berstatus Delivered dan saldo FG sudah dipotong pada snapshot baseline. Konfirmasi berulang dicegah.',
      deductPcs: 0,
    };
  }

  if (input.currentStatus === 'Delivered') {
    return {
      isValid: false,
      error: 'Surat Jalan sudah berstatus Delivered sebelumnya.',
      deductPcs: 0,
    };
  }

  if (!input.proofSigned) {
    return {
      isValid: false,
      error: 'Bukti fisik lembar Surat Jalan bertanda tangan dan dicap basah pelanggan wajib diverifikasi.',
      deductPcs: 0,
    };
  }

  if (input.totalQtyShipped <= 0) {
    return {
      isValid: false,
      error: 'Kuantitas barang yang dikirim harus lebih besar dari 0.',
      deductPcs: 0,
    };
  }

  if (input.availableStockAtLocation < input.totalQtyShipped) {
    return {
      isValid: false,
      error: `Kuantitas pengiriman (${input.totalQtyShipped.toLocaleString('id-ID')} PCS) melebihi saldo persediaan FG yang tersedia di lokasi (${input.availableStockAtLocation.toLocaleString('id-ID')} PCS).`,
      deductPcs: 0,
    };
  }

  return {
    isValid: true,
    deductPcs: input.totalQtyShipped,
  };
}

/**
 * Evaluasi Kelayakan Masuk Penagihan / Invoice (BR-BIL-01 & NFR-03)
 * Surat Jalan dengan status Exception atau belum Delivered DILARANG masuk tagihan.
 */
export function evaluateBillingEligibility(
  status: 'Draft' | 'Printed' | 'Delivered',
  controlStatus: 'Pending' | 'Matched' | 'Exception'
): { isEligible: boolean; reason: string } {
  if (status !== 'Delivered') {
    return {
      isEligible: false,
      reason: 'Hanya Surat Jalan berstatus Delivered yang dapat diproses ke penagihan.',
    };
  }

  if (controlStatus === 'Exception') {
    return {
      isEligible: false,
      reason: 'Surat Jalan berstatus Exception dilarang masuk proses penagihan (BR-BIL-01 / NFR-03).',
    };
  }

  if (controlStatus !== 'Matched') {
    return {
      isEligible: false,
      reason: 'Surat Jalan harus terverifikasi Matched terhadap PO / SO pelanggan.',
    };
  }

  return {
    isEligible: true,
    reason: 'Surat Jalan memenuhi syarat penagihan: Delivered dan Matched.',
  };
}

/**
 * ==========================================================
 * FINANCE & BILLING AR PURE FUNCTIONS (SPRINT 07)
 * BRD §5.7 (BR-CTL-01..06), §5.8 (BR-BIL-01..09), FEAT-BIL-01, FEAT-BIL-02
 * ==========================================================
 */

export interface ValidateInvoiceInput {
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerPoNumber: string;
  periodMonth: string;
  periodYear: string;
  dueDate: string;
  paymentTerms: string;
  items: {
    sjId: string;
    sjNumber: string;
    soId: string;
    soNumber: string;
    partNumber: string;
    partDescription: string;
    qtyToBill: number;
    unitPrice: number;
    availableUnbilledQty: number;
    sjStatus: 'Draft' | 'Printed' | 'Delivered';
    sjControlStatus: 'Pending' | 'Matched' | 'Exception';
  }[];
  existingInvoices?: {
    id: string;
    invoiceNumber: string;
    items: {
      sjId: string;
      partNumber: string;
      qtyBilled: number;
    }[];
  }[];
}

export interface ValidateInvoiceResult {
  isValid: boolean;
  errors: string[];
  totalQtyPcs: number;
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  linkedSjNumbers: string[];
}

export function validateInvoiceCreation(input: ValidateInvoiceInput): ValidateInvoiceResult {
  const errors: string[] = [];

  if (!input.invoiceNumber || input.invoiceNumber.trim() === '') {
    errors.push('Nomor Invoice wajib diisi.');
  }

  if (!input.customerId || !input.customerName) {
    errors.push('Customer B2B wajib dipilih.');
  }

  if (!input.customerPoNumber || input.customerPoNumber.trim() === '') {
    errors.push('Nomor PO Customer wajib dicantumkan.');
  }

  if (!input.periodMonth || !input.periodYear) {
    errors.push('Periode penagihan (Bulan & Tahun) wajib diisi.');
  }

  if (!input.items || input.items.length === 0) {
    errors.push('Invoice minimal harus memuat satu baris Surat Jalan (SJ).');
  }

  let totalQtyPcs = 0;
  let subtotalAmount = 0;
  const linkedSjsSet = new Set<string>();

  input.items.forEach((item, index) => {
    // 1. Audit Billing Eligibility (BR-BIL-01): Only Delivered & Matched
    if (item.sjStatus !== 'Delivered' || item.sjControlStatus !== 'Matched') {
      errors.push(
        `Item baris #${index + 1} (${item.partNumber} - ${item.sjNumber}) tidak memenuhi syarat billing: Status harus Delivered & Matched.`
      );
    }

    // 2. Reject SO-0043 or unverified delivery exceptions
    if (item.soNumber === 'SO-2026-0043' || item.sjControlStatus === 'Exception') {
      errors.push(
        `Item baris #${index + 1} (${item.sjNumber}) tergolong Data Integrity Exception dan dilarang masuk invoice.`
      );
    }

    // 3. Positive quantity check
    if (item.qtyToBill <= 0) {
      errors.push(
        `Kuantitas ditagih untuk part ${item.partNumber} (${item.sjNumber}) harus lebih besar dari 0 PCS.`
      );
    }

    // 4. Quantity cannot exceed verified unbilled quantity
    if (item.qtyToBill > item.availableUnbilledQty) {
      errors.push(
        `Kuantitas ditagih untuk part ${item.partNumber} (${item.qtyToBill.toLocaleString('id-ID')} PCS) melebihi sisa yang belum ditagihkan (${item.availableUnbilledQty.toLocaleString('id-ID')} PCS).`
      );
    }

    // 5. Positive unit price check
    if (item.unitPrice < 0) {
      errors.push(`Harga satuan untuk part ${item.partNumber} tidak boleh negatif.`);
    }

    totalQtyPcs += item.qtyToBill;
    subtotalAmount += item.qtyToBill * item.unitPrice;
    linkedSjsSet.add(item.sjNumber);
  });

  // Calculate tax: PPN 11% (standar manufaktur Indonesia)
  const taxAmount = Math.round(subtotalAmount * 0.11);
  const totalAmount = subtotalAmount + taxAmount;

  return {
    isValid: errors.length === 0,
    errors,
    totalQtyPcs,
    subtotalAmount,
    taxAmount,
    totalAmount,
    linkedSjNumbers: Array.from(linkedSjsSet),
  };
}

export interface ValidatePaymentInput {
  invoiceId: string;
  invoiceNumber: string;
  totalInvoiceAmount: number;
  currentPaidAmount: number;
  amountToPay: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber: string;
}

export interface ValidatePaymentResult {
  isValid: boolean;
  errors: string[];
  newPaidAmount: number;
  newOutstandingAmount: number;
  newStatus: 'Unpaid' | 'Partially Paid' | 'Paid';
}

export function validatePaymentRecording(input: ValidatePaymentInput): ValidatePaymentResult {
  const errors: string[] = [];
  const currentOutstanding = Math.max(0, input.totalInvoiceAmount - input.currentPaidAmount);

  if (!input.invoiceId || !input.invoiceNumber) {
    errors.push('Faktur tagihan (Invoice) wajib dipilih.');
  }

  if (!input.paymentDate || input.paymentDate.trim() === '') {
    errors.push('Tanggal pembayaran wajib diisi.');
  }

  if (!input.paymentMethod || input.paymentMethod.trim() === '') {
    errors.push('Metode pembayaran wajib dipilih.');
  }

  if (!input.referenceNumber || input.referenceNumber.trim() === '') {
    errors.push('Nomor referensi transfer / bukti bayar wajib diisi.');
  }

  if (input.amountToPay <= 0) {
    errors.push('Nominal pembayaran harus lebih besar dari Rp 0.');
  }

  if (input.amountToPay > currentOutstanding) {
    errors.push(
      `Nominal pembayaran (Rp ${input.amountToPay.toLocaleString('id-ID')}) melebihi sisa piutang tertagih (Rp ${currentOutstanding.toLocaleString('id-ID')}).`
    );
  }

  const newPaidAmount = input.currentPaidAmount + (errors.length === 0 ? input.amountToPay : 0);
  const newOutstandingAmount = Math.max(0, input.totalInvoiceAmount - newPaidAmount);

  let newStatus: 'Unpaid' | 'Partially Paid' | 'Paid' = 'Unpaid';
  if (newPaidAmount >= input.totalInvoiceAmount) {
    newStatus = 'Paid';
  } else if (newPaidAmount > 0) {
    newStatus = 'Partially Paid';
  }

  return {
    isValid: errors.length === 0,
    errors,
    newPaidAmount,
    newOutstandingAmount,
    newStatus,
  };
}

export interface FinanceSummaryMetrics {
  verifiedDeliveredPcs: number; // Baseline 7.700 PCS
  verifiedBilledPcs: number; // Baseline 2.500 PCS
  unbilledDeliveredPcs: number; // Baseline 5.200 PCS
  totalInvoicedAmount: number;
  totalPaidAmount: number;
  totalOutstandingAr: number;
  overdueArAmount: number;
  activeInvoicesCount: number;
  readyToBillSjCount: number;
}

export function calculateFinanceSummary(
  deliveryOrders: {
    status: string;
    controlStatus: string;
    items: { qtyShipped: number }[];
  }[],
  invoices: {
    status: string;
    totalAmount: number;
    paidAmount: number;
    outstandingAmount: number;
    totalQtyPcs: number;
    dueDate: string;
  }[]
): FinanceSummaryMetrics {
  // 1. Delivered Terverifikasi (Hanya SJ Delivered & Matched)
  const verifiedDeliveredPcs = deliveryOrders
    .filter((sj) => sj.status === 'Delivered' && sj.controlStatus === 'Matched')
    .reduce((acc, sj) => acc + sj.items.reduce((s, it) => s + it.qtyShipped, 0), 0);

  // 2. Billed Terverifikasi (Berasal dari totalQtyPcs pada Invoices resmi)
  const verifiedBilledPcs = invoices.reduce((acc, inv) => acc + inv.totalQtyPcs, 0);

  // 3. Unbilled Delivered
  const unbilledDeliveredPcs = Math.max(0, verifiedDeliveredPcs - verifiedBilledPcs);

  // 4. Financial Totals
  const totalInvoicedAmount = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalPaidAmount = invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
  const totalOutstandingAr = invoices.reduce((acc, inv) => acc + inv.outstandingAmount, 0);

  // 5. Overdue check based on due date < today (2026-11-10)
  const today = '2026-11-10';
  const overdueArAmount = invoices
    .filter((inv) => inv.status !== 'Paid' && inv.dueDate < today)
    .reduce((acc, inv) => acc + inv.outstandingAmount, 0);

  return {
    verifiedDeliveredPcs,
    verifiedBilledPcs,
    unbilledDeliveredPcs,
    totalInvoicedAmount,
    totalPaidAmount,
    totalOutstandingAr,
    overdueArAmount,
    activeInvoicesCount: invoices.length,
    readyToBillSjCount: deliveryOrders.filter(
      (sj) => sj.status === 'Delivered' && sj.controlStatus === 'Matched'
    ).length,
  };
}
