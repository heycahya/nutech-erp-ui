/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Pattern 3: Dense Manufacturing Form Input (Input & Edit Sales Order - FEAT-SO-01 / F-01)
 * Multi-part order lines, customer PO, need date, pack-to-PCS calculator, validation, and confirmation modal.
 */

import React, { useState, useEffect } from 'react';
import { Customer, OrderType, PartItem, SalesOrder, SalesOrderItem } from '../../types/erp';
import { MOCK_CUSTOMERS, MOCK_PARTS } from '../../data/mockData';
import { calculatePackToPcs, validateSalesOrderForm, calculateOrderTotals, formatIndoDate } from '../../utils/logic';
import { Plus, Trash2, CheckCircle2, ArrowRight, AlertTriangle, AlertCircle, X, ShieldAlert } from 'lucide-react';

interface FormInputPatternProps {
  onSaveOrder: (savedOrder: SalesOrder) => void;
  onCancel: () => void;
  editingOrder?: SalesOrder | null;
  customers?: Customer[];
  parts?: PartItem[];
}

export const FormInputPattern: React.FC<FormInputPatternProps> = ({
  onSaveOrder,
  onCancel,
  editingOrder = null,
  customers = MOCK_CUSTOMERS,
  parts = MOCK_PARTS,
}) => {
  const isEditMode = Boolean(editingOrder);

  // Form Header State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    editingOrder ? editingOrder.customerId : (customers[0]?.id || MOCK_CUSTOMERS[0].id)
  );
  const [poNumber, setPoNumber] = useState<string>(
    editingOrder ? editingOrder.customerPoNumber : 'ADM-PO-2611-9014'
  );
  const [orderType, setOrderType] = useState<OrderType>(
    editingOrder ? editingOrder.orderType : 'Rutin Bulanan'
  );
  const [needDate, setNeedDate] = useState<string>(
    editingOrder ? editingOrder.needDate : '2026-11-25'
  );
  const [notes, setNotes] = useState<string>(
    editingOrder?.notes || 'Pengiriman reguler mingguan sesuai jadwal assembly.'
  );

  // Line Items State
  interface FormLineItem {
    id?: string;
    partId: string;
    packsInput: number;
    qtyPcs: number;
    unitPrice: number;
    qtyDelivered?: number;
    qtyBilled?: number;
  }

  const [lineItems, setLineItems] = useState<FormLineItem[]>(() => {
    if (editingOrder && editingOrder.items.length > 0) {
      return editingOrder.items.map((item) => {
        const part = parts.find((p) => p.id === item.partId || p.partNumber === item.partNumber);
        const ratio = part ? part.defaultPackRatio : 50;
        return {
          id: item.id,
          partId: part ? part.id : parts[0].id,
          packsInput: Math.max(1, Math.round(item.qtyOrdered / ratio)),
          qtyPcs: item.qtyOrdered,
          unitPrice: item.unitPrice,
          qtyDelivered: item.qtyDelivered,
          qtyBilled: item.qtyBilled,
        };
      });
    }
    return [
      {
        partId: parts[0].id,
        packsInput: 40,
        qtyPcs: calculatePackToPcs(40, parts[0].defaultPackRatio),
        unitPrice: parts[0].standardPrice,
      },
      {
        partId: parts[4] ? parts[4].id : parts[0].id,
        packsInput: 50,
        qtyPcs: calculatePackToPcs(50, parts[4] ? parts[4].defaultPackRatio : parts[0].defaultPackRatio),
        unitPrice: parts[4] ? parts[4].standardPrice : parts[0].standardPrice,
      },
    ];
  });

  // Validation & Modal State
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Update when editingOrder changes
  useEffect(() => {
    if (editingOrder) {
      setSelectedCustomerId(editingOrder.customerId);
      setPoNumber(editingOrder.customerPoNumber);
      setOrderType(editingOrder.orderType);
      setNeedDate(editingOrder.needDate);
      setNotes(editingOrder.notes || '');
      if (editingOrder.items.length > 0) {
        setLineItems(
          editingOrder.items.map((item) => {
            const part = parts.find((p) => p.id === item.partId || p.partNumber === item.partNumber);
            const ratio = part ? part.defaultPackRatio : 50;
            return {
              id: item.id,
              partId: part ? part.id : parts[0].id,
              packsInput: Math.max(1, Math.round(item.qtyOrdered / ratio)),
              qtyPcs: item.qtyOrdered,
              unitPrice: item.unitPrice,
              qtyDelivered: item.qtyDelivered,
              qtyBilled: item.qtyBilled,
            };
          })
        );
      }
    }
  }, [editingOrder, parts]);

  // Handle changing a line item part
  const handlePartChange = (index: number, partId: string) => {
    const part = parts.find((p) => p.id === partId);
    if (!part) return;

    const updated = [...lineItems];
    updated[index].partId = partId;
    updated[index].unitPrice = part.standardPrice;
    updated[index].qtyPcs = calculatePackToPcs(updated[index].packsInput, part.defaultPackRatio);
    setLineItems(updated);
  };

  // Handle changing packs input with auto conversion
  const handlePacksChange = (index: number, packs: number) => {
    const updated = [...lineItems];
    const part = parts.find((p) => p.id === updated[index].partId);
    const ratio = part ? part.defaultPackRatio : 1;
    updated[index].packsInput = packs;
    updated[index].qtyPcs = calculatePackToPcs(packs, ratio);
    setLineItems(updated);
  };

  // Handle direct PCS input
  const handlePcsChange = (index: number, pcs: number) => {
    const updated = [...lineItems];
    updated[index].qtyPcs = Math.max(0, pcs);
    setLineItems(updated);
  };

  // Add line item
  const handleAddLineItem = () => {
    const defaultPart = parts[1] || parts[0];
    setLineItems([
      ...lineItems,
      {
        partId: defaultPart.id,
        packsInput: 25,
        qtyPcs: calculatePackToPcs(25, defaultPart.defaultPackRatio),
        unitPrice: defaultPart.standardPrice,
      },
    ]);
  };

  // Remove line item
  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, idx) => idx !== index));
  };

  // Calculate totals
  const totals = calculateOrderTotals(lineItems);
  const totalPcs = totals.totalQtyPcs;
  const totalAmount = totals.totalEstimatedAmount;

  // Validate before showing confirmation dialog
  const handleInitiateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateSalesOrderForm({
      customerId: selectedCustomerId,
      customerPoNumber: poNumber,
      needDate,
      items: lineItems.map((i) => ({ partId: i.partId, qtyPcs: i.qtyPcs })),
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);
    setIsConfirmModalOpen(true);
  };

  // Execute committed save
  const handleFinalConfirm = () => {
    const selectedCust = customers.find((c) => c.id === selectedCustomerId) || customers[0];

    const formattedItems: SalesOrderItem[] = lineItems.map((item, idx) => {
      const part = parts.find((p) => p.id === item.partId)!;
      return {
        id: item.id || `soi-new-${Date.now()}-${idx}`,
        partId: part.id,
        partNumber: part.partNumber,
        partDescription: part.description,
        qtyOrdered: item.qtyPcs,
        unitPrice: item.unitPrice,
        qtyDelivered: item.qtyDelivered || 0,
        qtyBilled: item.qtyBilled || 0,
      };
    });

    const savedOrder: SalesOrder = {
      id: editingOrder ? editingOrder.id : `so-new-${Date.now()}`,
      soNumber: editingOrder ? editingOrder.soNumber : `SO-2026-00${Math.floor(46 + Math.random() * 20)}`,
      customerPoNumber: poNumber.trim(),
      customerId: selectedCust.id,
      customerName: selectedCust.name,
      orderType,
      orderDate: editingOrder ? editingOrder.orderDate : new Date().toISOString().split('T')[0],
      needDate,
      statusProduction: editingOrder ? editingOrder.statusProduction : 'Pending',
      statusDelivery: editingOrder ? editingOrder.statusDelivery : 'Pending',
      statusBilling: editingOrder ? editingOrder.statusBilling : 'Unbilled',
      items: formattedItems,
      notes,
      createdBy: editingOrder ? editingOrder.createdBy : 'Staff Marketing',
    };

    setIsConfirmModalOpen(false);
    onSaveOrder(savedOrder);
  };

  const selectedCustObj = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div className="flex-1 overflow-y-auto bg-[#ffffff] p-6 pb-12">
      <div className="max-w-[1100px] mx-auto space-y-6">
        {/* Form Container */}
        <form onSubmit={handleInitiateSubmit} className="border border-[#d5dce2] rounded-[4px] bg-[#ffffff] overflow-hidden">
          {/* Header Bar */}
          <div className="px-6 py-4 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0057d2]">
                  {isEditMode ? 'Koreksi Data Dokumen' : 'Penerbitan Dokumen Induk'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#edf7ed] text-[#10683b] border border-[#a5d6a7] rounded-[4px]">
                  {isEditMode ? `EDIT: ${editingOrder?.soNumber}` : 'FEAT-SO-01 / BR-SO-01'}
                </span>
              </div>
              <h2 className="text-[16px] font-bold text-[#000000] mt-0.5">
                {isEditMode
                  ? `Edit Sales Order: ${editingOrder?.soNumber}`
                  : 'Formulir Penerbitan Sales Order Baru'}
              </h2>
              <p className="text-[12px] text-[#545454] mt-0.5">
                Konversi Customer PO menjadi dokumen Sales Order internal multi-part dengan kalkulasi Pack-to-PCS otomatis
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-[11px] text-[#545454] block">Satuan Resmi Produksi:</span>
              <span className="text-[13px] font-bold text-[#10683b]">PCS (Tunggal)</span>
            </div>
          </div>

          {/* Validation Error Banner */}
          {validationErrors.length > 0 && (
            <div className="m-6 p-4 bg-[#fde8e8] border border-[#d32f2f]/30 rounded-[4px] space-y-1.5">
              <div className="flex items-center gap-2 text-[#c62828] font-bold text-[13px]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Mohon lengkapi data wajib berikut:</span>
              </div>
              <ul className="list-disc list-inside text-[12px] text-[#c62828] space-y-0.5 pl-1">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* Section 1: Customer & PO Header */}
            <div className="space-y-4">
              <div className="text-[12px] font-bold text-[#000000] uppercase tracking-wider pb-1 border-b border-[#eaecee]">
                1. Informasi Customer B2B & Kontrak PO
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#223548]">
                    Customer B2B Pemesan <span className="text-[#c62828]">*</span>
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full h-[36px] px-3 text-[13px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] text-[#000000] focus:outline-none focus:border-[#0057d2]"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code} · {c.paymentTerms})
                      </option>
                    ))}
                  </select>
                  {selectedCustObj && (
                    <div className="text-[11px] text-[#545454] flex items-center justify-between">
                      <span>PIC: {selectedCustObj.contactPerson}</span>
                      <span>Termin Default Simulasi (TBD-14): <strong>{selectedCustObj.paymentTerms}</strong></span>
                    </div>
                  )}
                </div>

                {/* PO Number Input */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#223548]">
                    Nomor PO Pelanggan Resmi <span className="text-[#c62828]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    placeholder="Contoh: ADM-PO-2611-9014"
                    className="w-full h-[36px] px-3 font-mono text-[13px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] text-[#000000] focus:outline-none focus:border-[#0057d2]"
                  />
                  <span className="text-[11px] text-[#545454]">
                    Nomor referensi PO wajib sesuai dokumen fisik/surat order pelanggan
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Order Type */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#223548]">
                    Klasifikasi Tipe Pesanan (BR-SO-04) <span className="text-[#c62828]">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setOrderType('Rutin Bulanan')}
                      className={`h-[36px] text-[12px] font-bold rounded-[4px] border transition-colors cursor-pointer ${
                        orderType === 'Rutin Bulanan'
                          ? 'bg-[#0057d2] text-white border-[#0057d2]'
                          : 'bg-[#ffffff] text-[#223548] border-[#d5dce2] hover:bg-[#eaecee]'
                      }`}
                    >
                      Rutin Bulanan
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('Urgent')}
                      className={`h-[36px] text-[12px] font-bold rounded-[4px] border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                        orderType === 'Urgent'
                          ? 'bg-[#8d4b00] text-white border-[#8d4b00]'
                          : 'bg-[#fff6e5] text-[#8d4b00] border-[#8d4b00]/30 hover:bg-[#ffecc7]'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Urgent Order</span>
                    </button>
                  </div>
                  {orderType === 'Urgent' && (
                    <div className="text-[11px] text-[#8d4b00] font-medium bg-[#fff6e5] p-2 rounded-[4px] border border-[#8d4b00]/20">
                      <strong>Perhatian Urgent (BR-SO-05):</strong> Memerlukan prioritas jadwal SPK lini manufaktur.
                    </div>
                  )}
                </div>

                {/* Need Date */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#223548]">
                    Need Date (Batas Tanggal Kebutuhan) <span className="text-[#c62828]">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={needDate}
                    onChange={(e) => setNeedDate(e.target.value)}
                    className="w-full h-[36px] px-3 text-[13px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] text-[#000000] focus:outline-none focus:border-[#0057d2]"
                  />
                  <span className="text-[11px] text-[#545454]">
                    Atribut krusial prioritas lini produksi PPIC & jadwal pengiriman (BR-SO-05)
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Multi-Part Line Items Table */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pb-1 border-b border-[#eaecee]">
                <div className="text-[12px] font-bold text-[#000000] uppercase tracking-wider">
                  2. Line Items Part Komponen (Multi-Line Item — BR-SO-01)
                </div>
                <button
                  type="button"
                  onClick={handleAddLineItem}
                  className="flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-[#0057d2] hover:bg-[#ebf8ff] border border-[#d5dce2] rounded-[4px] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Baris Part</span>
                </button>
              </div>

              <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden">
                <table className="w-full text-left text-[12px] border-collapse">
                  <thead className="bg-[#f5f6f7] border-b border-[#d5dce2] text-[10px] font-bold text-[#545454] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 w-[40px] text-center">#</th>
                      <th className="py-2.5 px-3 min-w-[220px]">Part Komponen Otomotif</th>
                      <th className="py-2.5 px-3 text-center w-[110px]">Rasio Kemasan</th>
                      <th className="py-2.5 px-3 text-right w-[110px]">Input Kemasan</th>
                      <th className="py-2.5 px-3 text-right w-[140px]">Kuantitas (PCS)</th>
                      <th className="py-2.5 px-3 text-right w-[140px]">
                        <div>Harga (Rp/PCS)</div>
                        <div className="text-[9px] font-normal text-[#545454] lowercase">acuan demo (TBD-09)</div>
                      </th>
                      <th className="py-2.5 px-3 text-right w-[150px]">
                        <div>Subtotal (Rp)</div>
                        <div className="text-[9px] font-normal text-[#545454] lowercase">estimasi (TBD-09)</div>
                      </th>
                      <th className="py-2.5 px-3 w-[50px] text-center">Hapus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d5dce2]">
                    {lineItems.map((item, idx) => {
                      const selectedPart = parts.find((p) => p.id === item.partId) || parts[0];
                      const subtotal = item.qtyPcs * item.unitPrice;

                      return (
                        <tr key={idx} className="hover:bg-[#f8f9fa]">
                          <td className="py-2.5 px-3 text-center text-[#545454] font-semibold">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            <select
                              value={item.partId}
                              onChange={(e) => handlePartChange(idx, e.target.value)}
                              className="w-full h-[32px] px-2 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] font-medium text-[#000000]"
                            >
                              {parts.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.partNumber} — {p.description} ({p.category})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2.5 px-3 text-center text-[#545454] tabular-nums font-mono text-[11px]">
                            {selectedPart.defaultPackRatio} PCS/pack
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              min="1"
                              value={item.packsInput}
                              onChange={(e) => handlePacksChange(idx, Math.max(1, parseInt(e.target.value, 10) || 1))}
                              className="w-full h-[32px] px-2 text-right font-mono text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] text-[#000000]"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="1"
                                value={item.qtyPcs}
                                onChange={(e) => handlePcsChange(idx, parseInt(e.target.value, 10) || 0)}
                                className="w-full h-[32px] px-2 text-right font-mono font-bold text-[12px] bg-[#edf7ed] border border-[#a5d6a7] rounded-[4px] text-[#10683b]"
                              />
                              <span className="text-[10px] text-[#545454] font-bold">PCS</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#545454]">
                            Rp {item.unitPrice.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-[#000000]">
                            Rp {subtotal.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLineItem(idx)}
                              disabled={lineItems.length <= 1}
                              className={`p-1.5 rounded-[4px] transition-colors ${
                                lineItems.length <= 1
                                  ? 'text-[#cbd5e1] cursor-not-allowed'
                                  : 'text-[#d32f2f] hover:bg-[#fde8e8] cursor-pointer'
                              }`}
                              title={lineItems.length <= 1 ? 'Minimal 1 baris part' : 'Hapus baris'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-[#f5f6f7] border-t border-[#d5dce2] font-bold text-[12px]">
                    <tr>
                      <td colSpan={4} className="py-2.5 px-3 text-right text-[#000000]">
                        Total Akumulasi Pesanan:
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#0057d2] tabular-nums text-[13px] font-mono">
                        {totalPcs.toLocaleString('id-ID')} PCS
                      </td>
                      <td className="py-2.5 px-3"></td>
                      <td className="py-2.5 px-3 text-right text-[#000000] tabular-nums text-[13px] font-mono">
                        <div>Rp {totalAmount.toLocaleString('id-ID')}</div>
                        <div className="text-[10px] font-normal text-[#545454] mt-0.5">
                          Estimasi nominal berbasis harga acuan demo — TBD-09
                        </div>
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Section 3: Notes Field */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[12px] font-semibold text-[#223548]">
                Catatan Operasional / Instruksi Khusus Marketing
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan tambahan untuk PPIC, Purchasing, dan Pengiriman..."
                className="w-full p-2.5 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] text-[#223548] focus:outline-none focus:border-[#0057d2]"
              />
            </div>
          </div>

          {/* Form Action Footer */}
          <div className="px-6 py-4 bg-[#f5f6f7] border-t border-[#d5dce2] flex items-center justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-[12px] font-semibold text-[#475e75] hover:text-[#000000] hover:bg-[#eaecee] border border-[#d5dce2] rounded-[4px] transition-colors cursor-pointer"
            >
              Kembali ke Daftar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-[12px] font-bold text-white bg-[#0057d2] hover:bg-[#0049b0] active:bg-[#00368a] rounded-[4px] shadow-sm transition-colors cursor-pointer"
            >
              <span>{isEditMode ? 'Simpan Perubahan Sales Order' : 'Terbitkan Sales Order'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* 4. MODAL DIALOG KONFIRMASI PENERBITAN / EDIT SO */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#000000]/40 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-xl w-full max-w-[520px] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0057d2]">
                  Verifikasi Operasional Komersial
                </span>
                <h3 className="text-[15px] font-bold text-[#000000]">
                  {isEditMode ? 'Konfirmasi Perubahan Sales Order' : 'Konfirmasi Penerbitan Sales Order Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="p-1 text-[#545454] hover:text-[#000000] rounded hover:bg-[#eaecee] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3.5 text-[12px]">
              <p className="text-[#475e75] leading-relaxed">
                Pastikan seluruh parameter Sales Order di bawah ini telah sesuai dengan dokumen Purchase Order resmi dari pelanggan sebelum data diteruskan ke alur kerja PPIC & Purchasing.
              </p>

              <div className="p-3.5 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px] space-y-2">
                <div className="flex justify-between items-center py-0.5 border-b border-[#eaecee]">
                  <span className="text-[#545454]">Customer B2B:</span>
                  <span className="font-bold text-[#000000]">{selectedCustObj?.name}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-[#eaecee]">
                  <span className="text-[#545454]">Nomor PO Pelanggan:</span>
                  <span className="font-mono font-bold text-[#0057d2]">{poNumber}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-[#eaecee]">
                  <span className="text-[#545454]">Tipe Pesanan:</span>
                  <span
                    className={`px-1.5 py-0.2 text-[10px] font-bold rounded-[3px] border ${
                      orderType === 'Urgent'
                        ? 'bg-[#fff6e5] text-[#8d4b00] border-[#8d4b00]/30'
                        : 'bg-[#eaecee] text-[#354a5f] border-[#d5dce2]'
                    }`}
                  >
                    {orderType}
                  </span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-[#eaecee]">
                  <span className="text-[#545454]">Need Date (Batas Kirim):</span>
                  <span className="font-semibold text-[#000000]">{formatIndoDate(needDate)}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-[#eaecee]">
                  <span className="text-[#545454]">Jumlah Line Items:</span>
                  <span className="font-semibold text-[#000000]">{lineItems.length} Part Komponen</span>
                </div>
                <div className="flex justify-between items-center pt-1 text-[13px]">
                  <span className="font-bold text-[#000000]">Total Volume Pesanan:</span>
                  <span className="font-mono font-bold text-[#10683b]">{totalPcs.toLocaleString('id-ID')} PCS</span>
                </div>
              </div>

              {orderType === 'Urgent' && (
                <div className="p-2.5 bg-[#fff6e5] border border-[#8d4b00]/30 rounded-[4px] text-[11px] text-[#8d4b00] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Pesanan Urgent akan ditandai prioritas pada jadwal SPK bulanan PPIC.</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-[#f5f6f7] border-t border-[#d5dce2] flex items-center justify-between">
              <span className="text-[10px] text-[#545454]">
                Audit Rule: BR-SO-01 s/d BR-SO-06
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-3 py-1.5 text-[11px] font-semibold text-[#223548] hover:bg-[#eaecee] border border-[#d5dce2] rounded-[4px] cursor-pointer"
                >
                  Periksa Kembali
                </button>
                <button
                  type="button"
                  onClick={handleFinalConfirm}
                  className="px-3.5 py-1.5 text-[11px] font-bold text-white bg-[#0057d2] hover:bg-[#0049b0] rounded-[4px] cursor-pointer"
                >
                  {isEditMode ? 'Konfirmasi Simpan' : 'Konfirmasi & Terbitkan SO'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
