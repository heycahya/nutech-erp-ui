/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FEAT-PUR-02 — Purchase Order (PO) Supplier Management
 * Grounded in: brd-nutech.md §5.5, features.md §2.4, BR-MAT-01, BR-MAT-09, TBD-12.
 */

import React, { useState, useMemo } from 'react';
import {
  PurchaseOrder,
  PurchaseOrderItem,
  Supplier,
  RawMaterial,
  PoStatus,
  PoGrnStatus,
  PurchaseUomType,
} from '../../../types/erp';
import {
  calculatePoTotals,
  validatePurchaseOrderForm,
  formatIndoDate,
} from '../../../utils/logic';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  X,
  Trash2,
  ShieldAlert,
  Building,
  Info,
  Layers,
} from 'lucide-react';

interface PurchaseOrderManagementViewProps {
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
  materials: RawMaterial[];
  onSavePo: (po: PurchaseOrder) => void;
  initialSelectedPoId?: string;
  prefillMaterialId?: string | null;
  prefillQty?: number | null;
  onClearPrefill?: () => void;
}

export const PurchaseOrderManagementView: React.FC<PurchaseOrderManagementViewProps> = ({
  purchaseOrders,
  suppliers,
  materials,
  onSavePo,
  initialSelectedPoId,
  prefillMaterialId,
  prefillQty,
  onClearPrefill,
}) => {
  // 1. Navigation / Filter State
  const [activeTab, setActiveTab] = useState<'all' | 'Open' | 'Partially Received' | 'Received' | 'Draft'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');

  // 2. Selected PO for Detail View / Split Pane
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(() => {
    if (initialSelectedPoId) {
      return purchaseOrders.find((p) => p.id === initialSelectedPoId) || purchaseOrders[0] || null;
    }
    return purchaseOrders[0] || null;
  });

  // 3. Modal State for Create / Edit PO
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(Boolean(prefillMaterialId));
  const [editingPo, setEditingPo] = useState<PurchaseOrder | null>(null);

  // Form Fields
  const [formPoNumber, setFormPoNumber] = useState<string>('');
  const [formSupplierId, setFormSupplierId] = useState<string>('');
  const [formOrderDate, setFormOrderDate] = useState<string>('2026-11-06');
  const [formExpectedDate, setFormExpectedDate] = useState<string>('2026-11-13');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formStatus, setFormStatus] = useState<PoStatus>('Open');
  const [formItems, setFormItems] = useState<
    {
      id: string;
      materialId: string;
      materialCode: string;
      materialName: string;
      qtyOrdered: number;
      purchaseUom: PurchaseUomType;
      unitPrice: number;
      qtyReceivedGrn: number;
      notes?: string;
    }[]
  >([]);
  const [formError, setFormError] = useState<string | null>(null);

  // Handle prefill from MRP Simulation if present
  React.useEffect(() => {
    if (prefillMaterialId) {
      const targetMat = materials.find((m) => m.id === prefillMaterialId);
      if (targetMat) {
        const nextNumber = `PO-SUPP-2026-00${purchaseOrders.length + 80}`;
        setEditingPo(null);
        setFormPoNumber(nextNumber);
        setFormSupplierId(targetMat.preferredSupplierId || suppliers[0]?.id || '');
        setFormOrderDate('2026-11-06');
        setFormExpectedDate('2026-11-13');
        setFormNotes(`Diterbitkan otomatis dari rekomendasi Simulasi MRP (${targetMat.code}).`);
        setFormStatus('Open');
        setFormItems([
          {
            id: `poi-new-${Date.now()}`,
            materialId: targetMat.id,
            materialCode: targetMat.code,
            materialName: targetMat.name,
            qtyOrdered: prefillQty && prefillQty > 0 ? prefillQty : targetMat.minOrderQty,
            purchaseUom: targetMat.purchaseUom,
            unitPrice: targetMat.standardPricePerUom,
            qtyReceivedGrn: 0,
            notes: 'Rekomendasi pemenuhan defisit MRP',
          },
        ]);
        setFormError(null);
        setIsFormModalOpen(true);
        if (onClearPrefill) onClearPrefill();
      }
    }
  }, [prefillMaterialId, prefillQty, materials, purchaseOrders.length, suppliers, onClearPrefill]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    const nextNumber = `PO-SUPP-2026-00${purchaseOrders.length + 80}`;
    const defaultSupp = suppliers[0];
    const defaultMat = materials[0];

    setEditingPo(null);
    setFormPoNumber(nextNumber);
    setFormSupplierId(defaultSupp?.id || '');
    setFormOrderDate('2026-11-06');
    setFormExpectedDate('2026-11-13');
    setFormNotes('');
    setFormStatus('Open');
    setFormItems([
      {
        id: `poi-${Date.now()}`,
        materialId: defaultMat?.id || '',
        materialCode: defaultMat?.code || '',
        materialName: defaultMat?.name || '',
        qtyOrdered: defaultMat?.minOrderQty || 100,
        purchaseUom: defaultMat?.purchaseUom || 'Kg',
        unitPrice: defaultMat?.standardPricePerUom || 45000,
        qtyReceivedGrn: 0,
        notes: '',
      },
    ]);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (po: PurchaseOrder) => {
    setEditingPo(po);
    setFormPoNumber(po.poNumber);
    setFormSupplierId(po.supplierId);
    setFormOrderDate(po.orderDate);
    setFormExpectedDate(po.expectedDeliveryDate);
    setFormNotes(po.notes || '');
    setFormStatus(po.status);
    setFormItems(
      po.items.map((it) => ({
        ...it,
      }))
    );
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Add Item Line
  const handleAddLineItem = () => {
    const defaultMat = materials[0];
    setFormItems((prev) => [
      ...prev,
      {
        id: `poi-${Date.now()}-${prev.length}`,
        materialId: defaultMat?.id || '',
        materialCode: defaultMat?.code || '',
        materialName: defaultMat?.name || '',
        qtyOrdered: 100,
        purchaseUom: defaultMat?.purchaseUom || 'Kg',
        unitPrice: defaultMat?.standardPricePerUom || 45000,
        qtyReceivedGrn: 0,
        notes: '',
      },
    ]);
  };

  // Remove Item Line
  const handleRemoveLineItem = (index: number) => {
    if (formItems.length <= 1) {
      setFormError('PO minimal harus memiliki 1 baris item material.');
      return;
    }
    setFormItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Update Item Line Material
  const handleItemMaterialChange = (index: number, matId: string) => {
    const mat = materials.find((m) => m.id === matId);
    if (!mat) return;

    setFormItems((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          return {
            ...item,
            materialId: mat.id,
            materialCode: mat.code,
            materialName: mat.name,
            purchaseUom: mat.purchaseUom,
            unitPrice: mat.standardPricePerUom,
          };
        }
        return item;
      })
    );
  };

  // Update Item Line Quantity
  const handleItemQtyChange = (index: number, qty: number) => {
    setFormItems((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          return { ...item, qtyOrdered: Math.max(0, qty) };
        }
        return item;
      })
    );
  };

  // Update Item Line Price
  const handleItemPriceChange = (index: number, price: number) => {
    setFormItems((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          return { ...item, unitPrice: Math.max(0, price) };
        }
        return item;
      })
    );
  };

  // Handle Save PO
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validatePurchaseOrderForm({
      supplierId: formSupplierId,
      orderDate: formOrderDate,
      expectedDeliveryDate: formExpectedDate,
      items: formItems,
    });

    if (!validation.isValid) {
      setFormError(validation.error || 'Data form tidak valid.');
      return;
    }

    const supplierObj = suppliers.find((s) => s.id === formSupplierId);
    const totals = calculatePoTotals(formItems);

    const savedPo: PurchaseOrder = {
      id: editingPo ? editingPo.id : `po-${Date.now()}`,
      poNumber: formPoNumber,
      supplierId: formSupplierId,
      supplierName: supplierObj ? supplierObj.name : 'Supplier Terpilih',
      orderDate: formOrderDate,
      expectedDeliveryDate: formExpectedDate,
      status: formStatus,
      grnStatus: editingPo ? editingPo.grnStatus : 'No Receipt',
      approvalStatus: 'Approved (Direct Purchasing)', // TBD-12 Fallback
      totalAmount: totals.totalAmount,
      createdBy: editingPo ? editingPo.createdBy : 'Andi Pratama (Purchasing)',
      items: formItems.map((it) => ({
        id: it.id,
        materialId: it.materialId,
        materialCode: it.materialCode,
        materialName: it.materialName,
        qtyOrdered: it.qtyOrdered,
        purchaseUom: it.purchaseUom,
        unitPrice: it.unitPrice,
        qtyReceivedGrn: it.qtyReceivedGrn,
        notes: it.notes,
      })),
      notes: formNotes,
    };

    onSavePo(savedPo);
    setSelectedPo(savedPo);
    setIsFormModalOpen(false);
  };

  // 4. Filtered Purchase Orders
  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter((po) => {
      // Tab filter
      if (activeTab !== 'all' && po.status !== activeTab) {
        return false;
      }
      // Supplier filter
      if (supplierFilter !== 'all' && po.supplierId !== supplierFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchPo = po.poNumber.toLowerCase().includes(q);
        const matchSupp = po.supplierName.toLowerCase().includes(q);
        const matchItem = po.items.some(
          (it) => it.materialCode.toLowerCase().includes(q) || it.materialName.toLowerCase().includes(q)
        );
        return matchPo || matchSupp || matchItem;
      }
      return true;
    });
  }, [purchaseOrders, activeTab, supplierFilter, searchQuery]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#ffffff] p-6 space-y-5">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#d5dce2] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0057d2] bg-[#ebf8ff] px-2 py-0.5 rounded-[4px] border border-[#0057d2]/20">
              FEAT-PUR-02 · Modul Pengadaan
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#10683b] bg-[#edf7ed] px-2 py-0.5 rounded-[4px] border border-[#a5d6a7]">
              OPERASIONAL RESMI PO SUPPLIER
            </span>
          </div>
          <h1 className="text-[18px] font-bold text-[#000000] mt-1 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#0057d2]" />
            Purchase Order (PO) Bahan Baku Supplier
          </h1>
          <p className="text-[11px] text-[#545454] mt-0.5">
            Penerbitan dan pengelolaan dokumen Purchase Order bahan baku multi-line dengan satuan beli supplier (Roll, Sheet, Kg).
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="px-3.5 py-1.5 text-[11px] font-bold text-[#ffffff] bg-[#0057d2] hover:bg-[#0040b0] rounded-[4px] cursor-pointer inline-flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Terbitkan PO Supplier Baru</span>
        </button>
      </div>

      {/* 2. Enterprise Governance Warning (BR-MAT-01 & BR-QC-02) */}
      <div className="p-3 bg-[#f8f9fa] border-l-4 border-l-[#0057d2] border-y border-r border-[#d5dce2] rounded-r-[4px] flex items-start gap-2.5 text-[11px]">
        <Info className="w-4 h-4 text-[#0057d2] shrink-0 mt-0.5" />
        <div className="text-[#354a5f] leading-relaxed">
          <strong className="text-[#000000]">Kepatuhan Tata Kelola Stok (BR-MAT-01 & BR-QC-02):</strong> Penerbitan PO di modul Purchasing <em>TIDAK PERNAH otomatis menambah saldo persediaan bahan baku</em>. Penambahan stok fisik material hanya sah dilakukan oleh <strong>Admin Warehouse</strong> melalui verifikasi kedatangan fisik dan penerbitan <strong>Goods Receipt Note (GRN)</strong>.
        </div>
      </div>

      {/* 3. Search & Segmented Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px]">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'all', label: 'Semua PO', count: purchaseOrders.length },
            { id: 'Open', label: 'Open (In Transit)', count: purchaseOrders.filter((p) => p.status === 'Open').length },
            { id: 'Partially Received', label: 'Sebagian Diterima', count: purchaseOrders.filter((p) => p.status === 'Partially Received').length },
            { id: 'Received', label: 'Selesai (GRN Penuh)', count: purchaseOrders.filter((p) => p.status === 'Received').length },
            { id: 'Draft', label: 'Draft', count: purchaseOrders.filter((p) => p.status === 'Draft').length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-[4px] cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#ffffff] text-[#0057d2] border border-[#d5dce2] shadow-xs'
                  : 'text-[#545454] hover:text-[#000000] hover:bg-[#eaecee]'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-[#eaecee] text-[#354a5f] rounded-[3px] tabular-nums">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Supplier Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#545454] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari No. PO, Supplier, Material..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] w-[220px] focus:outline-none focus:border-[#0057d2]"
            />
          </div>

          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="px-2.5 py-1 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
          >
            <option value="all">Semua Supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Main Two-Column Layout: Master PO Table (Left) + Detail Split-Pane (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Table Column (7 Cols on large screens) */}
        <div className="lg:col-span-7 border border-[#d5dce2] rounded-[4px] overflow-hidden bg-[#ffffff]">
          <div className="px-4 py-2.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
            <div className="text-[11px] font-bold text-[#000000] uppercase tracking-wider">
              Daftar Dokumen PO Supplier ({filteredOrders.length} Ditemukan)
            </div>
            <span className="text-[10px] text-[#545454]">
              Klik baris untuk membuka detail split pane
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] border-collapse">
              <thead className="bg-[#ffffff] border-b border-[#d5dce2] text-[10px] font-bold text-[#545454] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">No. PO & Tanggal</th>
                  <th className="py-2.5 px-3">Pemasok (Supplier)</th>
                  <th className="py-2.5 px-3 text-right">Nilai PO (Rp)</th>
                  <th className="py-2.5 px-3 text-center">Status PO</th>
                  <th className="py-2.5 px-3 text-center">Status GRN Gudang</th>
                  <th className="py-2.5 px-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaecee]">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[12px] text-[#545454]">
                      Tidak ada dokumen Purchase Order yang sesuai kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((po) => {
                    const isSelected = selectedPo?.id === po.id;
                    return (
                      <tr
                        key={po.id}
                        onClick={() => setSelectedPo(po)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#ebf8ff]' : 'hover:bg-[#f8f9fa]'
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <div className="font-mono font-bold text-[#0057d2] text-[11px]">
                            {po.poNumber}
                          </div>
                          <div className="text-[10px] text-[#545454] mt-0.5">
                            {formatIndoDate(po.orderDate)} · ETA {formatIndoDate(po.expectedDeliveryDate)}
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-[#000000] text-[11px]">
                            {po.supplierName}
                          </div>
                          <div className="text-[10px] text-[#545454] mt-0.5 truncate max-w-[180px]">
                            {po.items.map((it) => `${it.materialCode} (${it.qtyOrdered} ${it.purchaseUom})`).join(', ')}
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-[#000000]">
                          {po.totalAmount.toLocaleString('id-ID')}
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          {po.status === 'Received' ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#edf7ed] text-[#10683b] border border-[#a5d6a7] rounded-[3px]">
                              Received
                            </span>
                          ) : po.status === 'Partially Received' ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#fff6e5] text-[#8d4b00] border border-[#8d4b00]/30 rounded-[3px]">
                              Partial Inbound
                            </span>
                          ) : po.status === 'Open' ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#ebf8ff] text-[#0057d2] border border-[#0057d2]/30 rounded-[3px]">
                              Open (In Transit)
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#f5f6f7] text-[#545454] border border-[#d5dce2] rounded-[3px]">
                              Draft
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          {po.grnStatus === 'Fully Received' ? (
                            <span className="text-[10px] font-semibold text-[#10683b] flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>GRN Penuh</span>
                            </span>
                          ) : po.grnStatus === 'Partial GRN' ? (
                            <span className="text-[10px] font-semibold text-[#8d4b00] flex items-center justify-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>GRN Parsial</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#545454]">
                              Belum Diterima
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(po)}
                            className="p-1 text-[#0057d2] hover:text-[#0040b0] hover:bg-[#ebf8ff] rounded cursor-pointer"
                            title="Edit Dokumen PO"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Split Pane Column (5 Cols on large screens) */}
        <div className="lg:col-span-5 border border-[#d5dce2] rounded-[4px] bg-[#ffffff] overflow-hidden">
          {selectedPo ? (
            <div>
              {/* Detail Header */}
              <div className="p-4 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#0057d2] uppercase tracking-wider block">
                    Detail Dokumen Purchase Order
                  </span>
                  <h3 className="text-[15px] font-bold text-[#000000] mt-0.5">
                    {selectedPo.poNumber}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(selectedPo)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-[#0057d2] bg-[#ffffff] border border-[#d5dce2] hover:bg-[#ebf8ff] rounded-[4px] cursor-pointer inline-flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    disabled
                    className="px-2.5 py-1 text-[11px] font-semibold text-[#8c9ba5] bg-[#eaecee] border border-[#d5dce2] rounded-[4px] cursor-not-allowed inline-flex items-center gap-1"
                    title="Fitur Cetak PDF resmi TBD-07"
                  >
                    <FileText className="w-3 h-3" />
                    <span>PDF (TBD)</span>
                  </button>
                </div>
              </div>

              {/* Detail Content */}
              <div className="p-4 space-y-4 text-[12px]">
                {/* Meta Summary Grid */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
                  <div>
                    <span className="text-[10px] text-[#545454] block">Nama Pemasok:</span>
                    <span className="font-bold text-[#000000] text-[11px]">{selectedPo.supplierName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#545454] block">Otorisasi Pembelian:</span>
                    <span className="font-semibold text-[#10683b] text-[11px]">{selectedPo.approvalStatus}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#545454] block">Tanggal Penerbitan:</span>
                    <span className="font-medium text-[#223548] text-[11px]">{formatIndoDate(selectedPo.orderDate)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#545454] block">Estimasi Kedatangan (ETA):</span>
                    <span className="font-medium text-[#0057d2] text-[11px]">{formatIndoDate(selectedPo.expectedDeliveryDate)}</span>
                  </div>
                </div>

                {/* Items Breakdown Table */}
                <div>
                  <div className="text-[11px] font-bold text-[#000000] mb-1.5 flex items-center justify-between">
                    <span>Rincian Item Material Bahan Baku ({selectedPo.items.length} Baris):</span>
                    <span className="text-[10px] text-[#545454]">Satuan Beli Supplier</span>
                  </div>

                  <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead className="bg-[#f5f6f7] border-b border-[#d5dce2] font-bold text-[#545454]">
                        <tr>
                          <th className="py-2 px-2.5">Material</th>
                          <th className="py-2 px-2 text-right">Order</th>
                          <th className="py-2 px-2 text-right">Fisik GRN</th>
                          <th className="py-2 px-2.5 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eaecee]">
                        {selectedPo.items.map((it) => (
                          <tr key={it.id} className="hover:bg-[#f8f9fa]">
                            <td className="py-2 px-2.5">
                              <div className="font-mono font-bold text-[#0057d2]">{it.materialCode}</div>
                              <div className="text-[#354a5f] text-[10px] truncate max-w-[140px]">{it.materialName}</div>
                            </td>
                            <td className="py-2 px-2 text-right font-mono tabular-nums font-semibold">
                              {it.qtyOrdered.toLocaleString('id-ID')} {it.purchaseUom}
                            </td>
                            <td className="py-2 px-2 text-right font-mono tabular-nums">
                              <span className={it.qtyReceivedGrn >= it.qtyOrdered ? 'text-[#10683b] font-bold' : 'text-[#8d4b00]'}>
                                {it.qtyReceivedGrn.toLocaleString('id-ID')}
                              </span>
                            </td>
                            <td className="py-2 px-2.5 text-right font-mono font-bold tabular-nums text-[#000000]">
                              Rp {(it.qtyOrdered * it.unitPrice).toLocaleString('id-ID')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-[#f5f6f7] border-t border-[#d5dce2] font-bold">
                        <tr>
                          <td colSpan={3} className="py-2 px-2.5 text-right text-[#545454]">
                            Total Nilai PO:
                          </td>
                          <td className="py-2 px-2.5 text-right font-mono text-[#0057d2] text-[12px]">
                            Rp {selectedPo.totalAmount.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Notes & Linked Info */}
                {selectedPo.notes && (
                  <div className="p-2.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] text-[11px]">
                    <span className="font-bold text-[#545454] block">Catatan Pengadaan:</span>
                    <p className="text-[#223548] mt-0.5">{selectedPo.notes}</p>
                  </div>
                )}

                {/* Inbound Status Alert Box */}
                <div className="p-3 bg-[#ebf8ff] border border-[#0057d2]/30 rounded-[4px] text-[11px] space-y-1">
                  <div className="font-bold text-[#0057d2] flex items-center gap-1.5">
                    <Truck className="w-4 h-4" />
                    <span>MONITORING STATUS PENERIMAAN WAREHOUSE:</span>
                  </div>
                  <p className="text-[#223548] leading-relaxed">
                    Status Dokumen PO: <strong className="font-semibold text-[#000000]">{selectedPo.status}</strong>.<br />
                    Verifikasi Fisik Gudang: <strong>{selectedPo.grnStatus}</strong>.<br />
                    <span className="text-[#545454] text-[10px]">
                      * Admin Warehouse bertindak sebagai pihak berwenang yang menginput bukti fisik surat jalan supplier via modul GRN (BR-MAT-01).
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-[12px] text-[#545454]">
              Pilih salah satu dokumen PO pada tabel di sebelah kiri untuk melihat rincian item material.
            </div>
          )}
        </div>
      </div>

      {/* 5. Modal Form Create / Edit Purchase Order */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#000000]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-xl w-full max-w-[800px] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-bold text-[#0057d2] uppercase tracking-wider block">
                  {editingPo ? 'Revisi Dokumen PO' : 'Penerbitan Dokumen PO Baru'}
                </span>
                <h3 className="text-[14px] font-bold text-[#000000] mt-0.5">
                  {editingPo ? `Edit Purchase Order (${editingPo.poNumber})` : 'Formulir Purchase Order Supplier'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 text-[#545454] hover:text-[#000000] rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-[#fff6e5] border border-[#8d4b00]/30 rounded-[4px] text-[11px] text-[#8d4b00] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Master Header Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    No. Dokumen PO:
                  </label>
                  <input
                    type="text"
                    value={formPoNumber}
                    onChange={(e) => setFormPoNumber(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 text-[12px] font-mono font-bold bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    Pemasok (Supplier):
                  </label>
                  <select
                    value={formSupplierId}
                    onChange={(e) => setFormSupplierId(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  >
                    <option value="">Pilih Supplier...</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    Status Dokumen PO:
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as PoStatus)}
                    className="w-full px-2.5 py-1.5 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  >
                    <option value="Open">Open (Terbit / In Transit)</option>
                    <option value="Draft">Draft</option>
                    <option value="Partially Received">Partially Received</option>
                    <option value="Received">Received</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    Tanggal Order:
                  </label>
                  <input
                    type="date"
                    value={formOrderDate}
                    onChange={(e) => setFormOrderDate(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    Estimasi Kedatangan (ETA):
                  </label>
                  <input
                    type="date"
                    value={formExpectedDate}
                    onChange={(e) => setFormExpectedDate(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    Kewenangan Approval (TBD-12):
                  </label>
                  <div className="px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] text-[#10683b] font-medium">
                    Approved (Direct Purchasing)
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-bold text-[#000000]">
                    Daftar Material Bahan Baku:
                  </div>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="px-2.5 py-1 text-[11px] font-bold text-[#0057d2] hover:bg-[#ebf8ff] border border-[#0057d2]/30 rounded-[4px] cursor-pointer inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Baris Material</span>
                  </button>
                </div>

                <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead className="bg-[#f5f6f7] border-b border-[#d5dce2] font-bold text-[#545454]">
                      <tr>
                        <th className="py-2 px-3">Material Baku</th>
                        <th className="py-2 px-2 text-center">Satuan Beli</th>
                        <th className="py-2 px-2 text-right">Kuantitas</th>
                        <th className="py-2 px-2 text-right">Harga Satuan (Rp)</th>
                        <th className="py-2 px-2.5 text-right">Subtotal (Rp)</th>
                        <th className="py-2 px-2 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eaecee]">
                      {formItems.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-[#f8f9fa]">
                          <td className="py-2 px-3">
                            <select
                              value={item.materialId}
                              onChange={(e) => handleItemMaterialChange(idx, e.target.value)}
                              className="w-full px-2 py-1 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                            >
                              {materials.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.code} — {m.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="py-2 px-2 text-center">
                            <span className="font-bold text-[#000000] px-2 py-0.5 bg-[#f5f6f7] border border-[#d5dce2] rounded text-[11px]">
                              {item.purchaseUom}
                            </span>
                          </td>

                          <td className="py-2 px-2 text-right">
                            <input
                              type="number"
                              min="1"
                              value={item.qtyOrdered}
                              onChange={(e) => handleItemQtyChange(idx, parseInt(e.target.value, 10) || 0)}
                              className="w-[90px] px-2 py-1 text-[11px] text-right font-mono bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                            />
                          </td>

                          <td className="py-2 px-2 text-right">
                            <input
                              type="number"
                              min="0"
                              step="500"
                              value={item.unitPrice}
                              onChange={(e) => handleItemPriceChange(idx, parseInt(e.target.value, 10) || 0)}
                              className="w-[110px] px-2 py-1 text-[11px] text-right font-mono bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                            />
                          </td>

                          <td className="py-2 px-2.5 text-right font-mono font-bold text-[#000000]">
                            {(item.qtyOrdered * item.unitPrice).toLocaleString('id-ID')}
                          </td>

                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLineItem(idx)}
                              disabled={formItems.length <= 1}
                              className="p-1 text-[#545454] hover:text-[#d32f2f] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-[#f5f6f7] border-t border-[#d5dce2] font-bold">
                      <tr>
                        <td colSpan={4} className="py-2 px-3 text-right text-[#545454]">
                          Total Nilai Order:
                        </td>
                        <td className="py-2 px-2.5 text-right font-mono text-[#0057d2] text-[13px]">
                          Rp {calculatePoTotals(formItems).totalAmount.toLocaleString('id-ID')}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold text-[#223548] mb-1">
                  Catatan Pengadaan / Instruksi Logistik Supplier:
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Misal: Sertifikasi uji lab wajib dilampirkan bersama surat jalan supplier."
                  className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-[#d5dce2] flex items-center justify-between">
                <span className="text-[10px] text-[#545454]">
                  * Dokumen PO siap diterbitkan dan dipantau di monitoring kedatangan bahan.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-1.5 text-[11px] font-semibold text-[#223548] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-[11px] font-bold text-[#ffffff] bg-[#0057d2] hover:bg-[#0040b0] rounded-[4px] cursor-pointer shadow-xs"
                  >
                    Simpan & Terbitkan PO
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
