/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Modal Pembuatan Faktur Tagihan Bulanan (Multi-SJ Invoice Creation)
 * BRD §5.8 (BR-BIL-01, BR-BIL-02, BR-BIL-03), FEAT-BIL-01, TBD-09, TBD-14
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Receipt,
  FileCheck2,
  Calendar,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import { Customer, DeliveryOrder, Invoice, InvoiceItem, PartItem, SalesOrder } from '../../../types/erp';
import { formatIndoDate, validateInvoiceCreation } from '../../../utils/logic';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  parts: PartItem[];
  orders: SalesOrder[];
  deliveryOrders: DeliveryOrder[];
  existingInvoices: Invoice[];
  initialSelectedSjNumbers?: string[];
  onCreateInvoice: (newInvoice: Invoice) => void;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  customers,
  parts,
  orders,
  deliveryOrders,
  existingInvoices,
  initialSelectedSjNumbers = [],
  onCreateInvoice,
}) => {
  if (!isOpen) return null;

  // Auto generate invoice number
  const nextInvoiceNumber = useMemo(() => {
    const count = existingInvoices.length + 1;
    const pad = count < 10 ? `00${count}` : count < 100 ? `0${count}` : `${count}`;
    return `INV-2026-11-${pad}`;
  }, [existingInvoices]);

  // Determine initial customer
  const initialCustomer = useMemo(() => {
    if (initialSelectedSjNumbers.length > 0) {
      const matchSj = deliveryOrders.find((s) => s.sjNumber === initialSelectedSjNumbers[0]);
      if (matchSj) {
        return customers.find((c) => c.name === matchSj.customerName) || customers[0];
      }
    }
    return customers[0];
  }, [customers, deliveryOrders, initialSelectedSjNumbers]);

  const [invoiceNumber, setInvoiceNumber] = useState(nextInvoiceNumber);
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomer ? initialCustomer.id : '');
  const [periodMonth, setPeriodMonth] = useState('November');
  const [periodYear, setPeriodYear] = useState('2026');
  const [invoiceDate, setInvoiceDate] = useState('2026-11-04');
  const [notes, setNotes] = useState('');
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  // Selected customer object
  const currentCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || customers[0];
  }, [customers, selectedCustomerId]);

  // Calculate payment terms and due date
  const paymentTerms = currentCustomer?.paymentTerms || 'Net 30';
  const dueDate = useMemo(() => {
    const daysToAdd = paymentTerms.includes('45') ? 45 : 30;
    const invDateObj = new Date(invoiceDate);
    if (isNaN(invDateObj.getTime())) return '2026-12-04';
    invDateObj.setDate(invDateObj.getDate() + daysToAdd);
    return invDateObj.toISOString().split('T')[0];
  }, [invoiceDate, paymentTerms]);

  // Customer PO Number: find from customer's latest active sales order
  const customerPoNumber = useMemo(() => {
    if (!currentCustomer) return '';
    const matchOrder = orders.find((o) => o.customerName === currentCustomer.name);
    return matchOrder ? matchOrder.customerPoNumber : 'PO-DEMO-2026';
  }, [orders, currentCustomer]);

  // Find eligible SJs for this customer (Delivered & Matched)
  const eligibleSjsForCustomer = useMemo(() => {
    if (!currentCustomer) return [];
    return deliveryOrders.filter(
      (sj) =>
        sj.customerName === currentCustomer.name &&
        sj.status === 'Delivered' &&
        sj.controlStatus === 'Matched'
    );
  }, [deliveryOrders, currentCustomer]);

  // State of selected line items to bill
  interface FormItemRow {
    sjId: string;
    sjNumber: string;
    soId: string;
    soNumber: string;
    partNumber: string;
    partDescription: string;
    availableUnbilledQty: number;
    qtyToBill: number;
    unitPrice: number;
    sjStatus: 'Draft' | 'Printed' | 'Delivered';
    sjControlStatus: 'Pending' | 'Matched' | 'Exception';
  }

  const [itemRows, setItemRows] = useState<FormItemRow[]>([]);

  // Populate items when customer or initialSelectedSjNumbers changes
  useEffect(() => {
    const rows: FormItemRow[] = [];

    eligibleSjsForCustomer.forEach((sj) => {
      // If initialSelectedSjNumbers is provided and not empty, only include selected SJs
      if (
        initialSelectedSjNumbers.length > 0 &&
        !initialSelectedSjNumbers.includes(sj.sjNumber)
      ) {
        return;
      }

      sj.items.forEach((it) => {
        // Calculate already billed quantity for this specific item across all existing invoices
        let alreadyBilled = 0;
        existingInvoices.forEach((inv) => {
          inv.items.forEach((invIt) => {
            if (invIt.sjNumber === sj.sjNumber && invIt.partNumber === it.partNumber) {
              alreadyBilled += invIt.qtyBilled;
            }
          });
        });

        const unbilledAvailable = Math.max(0, it.qtyShipped - alreadyBilled);

        if (unbilledAvailable > 0) {
          // Find standard price from master parts
          const partDef = parts.find((p) => p.partNumber === it.partNumber);
          const unitPrice = partDef ? partDef.standardPrice : 12500;

          rows.push({
            sjId: sj.id,
            sjNumber: sj.sjNumber,
            soId: sj.soId,
            soNumber: sj.soNumber,
            partNumber: it.partNumber,
            partDescription: it.partDescription,
            availableUnbilledQty: unbilledAvailable,
            qtyToBill: unbilledAvailable,
            unitPrice,
            sjStatus: sj.status,
            sjControlStatus: sj.controlStatus,
          });
        }
      });
    });

    setItemRows(rows);
  }, [eligibleSjsForCustomer, initialSelectedSjNumbers, existingInvoices, parts]);

  // Handlers for modifying items
  const handleUpdateQty = (index: number, newQty: number) => {
    setItemRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, qtyToBill: Math.max(0, newQty) } : r))
    );
  };

  const handleUpdatePrice = (index: number, newPrice: number) => {
    setItemRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, unitPrice: Math.max(0, newPrice) } : r))
    );
  };

  const handleRemoveRow = (index: number) => {
    setItemRows((prev) => prev.filter((_, i) => i !== index));
  };

  // Live calculation of preview totals
  const previewCalculation = useMemo(() => {
    return validateInvoiceCreation({
      invoiceNumber,
      customerId: currentCustomer?.id || '',
      customerName: currentCustomer?.name || '',
      customerPoNumber,
      periodMonth,
      periodYear,
      dueDate,
      paymentTerms,
      items: itemRows,
    });
  }, [
    invoiceNumber,
    currentCustomer,
    customerPoNumber,
    periodMonth,
    periodYear,
    dueDate,
    paymentTerms,
    itemRows,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!previewCalculation.isValid) {
      setErrorMessages(previewCalculation.errors);
      return;
    }

    const newInvoiceItems: InvoiceItem[] = itemRows.map((row, idx) => ({
      id: `inv-item-${Date.now()}-${idx}`,
      sjId: row.sjId,
      sjNumber: row.sjNumber,
      soId: row.soId,
      soNumber: row.soNumber,
      partNumber: row.partNumber,
      partDescription: row.partDescription,
      qtyBilled: row.qtyToBill,
      unitPrice: row.unitPrice,
      subtotal: row.qtyToBill * row.unitPrice,
    }));

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNumber.trim(),
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      customerPoNumber,
      periodMonth,
      periodYear,
      invoiceDate,
      dueDate,
      paymentTerms,
      items: newInvoiceItems,
      totalQtyPcs: previewCalculation.totalQtyPcs,
      subtotalAmount: previewCalculation.subtotalAmount,
      taxAmount: previewCalculation.taxAmount,
      totalAmount: previewCalculation.totalAmount,
      paidAmount: 0,
      outstandingAmount: previewCalculation.totalAmount,
      status: 'Unpaid',
      linkedSjNumbers: previewCalculation.linkedSjNumbers,
      notes: notes.trim() || undefined,
      createdAt: `${invoiceDate} 10:00`,
      createdBy: 'Ratna Sulistyo (Finance & Billing Specialist)',
    };

    onCreateInvoice(newInvoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/50 p-4">
      <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#0057d2]" />
            <h2 className="text-[14px] font-bold text-[#000000]">
              Penerbitan Faktur Penagihan Bulanan (Multi-SJ Invoice)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#545454] hover:text-[#000000] hover:bg-[#eaecee] rounded-[4px] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Error Banner */}
          {errorMessages.length > 0 && (
            <div className="bg-[#fdeded] border border-[#ef9a9a] text-[#c5221f] rounded-[4px] p-3 text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>Penerbitan faktur ditolak sistem (Audit Integritas BR-BIL-01):</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-1">
                {errorMessages.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Form Header Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#f8f9fa] p-3.5 rounded-[4px] border border-[#d5dce2] text-[12px]">
            <div>
              <label className="block text-[10px] font-bold text-[#545454] uppercase mb-1">
                Customer B2B Pelanggan:
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full py-1.5 px-2 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] font-bold text-[#000000] focus:outline-none focus:border-[#0057d2]"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#545454] uppercase mb-1">
                Nomor Faktur / Invoice:
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full py-1.5 px-2 font-mono font-bold text-[#0057d2] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#545454] uppercase mb-1">
                Ref. PO Customer:
              </label>
              <input
                type="text"
                value={customerPoNumber}
                readOnly
                className="w-full py-1.5 px-2 font-mono text-[#545454] bg-[#eaecee] border border-[#d5dce2] rounded-[4px]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#545454] uppercase mb-1">
                Periode Tagihan:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={periodMonth}
                  onChange={(e) => setPeriodMonth(e.target.value)}
                  className="w-2/3 py-1.5 px-2 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]"
                  placeholder="Bulan"
                />
                <input
                  type="text"
                  value={periodYear}
                  onChange={(e) => setPeriodYear(e.target.value)}
                  className="w-1/3 py-1.5 px-2 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]"
                  placeholder="Tahun"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#545454] uppercase mb-1">
                Tanggal Faktur:
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full py-1.5 px-2 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#545454] uppercase mb-1">
                Jatuh Tempo ({paymentTerms} - TBD-14):
              </label>
              <input
                type="text"
                value={`${formatIndoDate(dueDate)} (${paymentTerms})`}
                readOnly
                className="w-full py-1.5 px-2 bg-[#eaecee] text-[#000000] font-bold border border-[#d5dce2] rounded-[4px]"
              />
            </div>
          </div>

          {/* Section: Muatan Surat Jalan & Line Items */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#545454] flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-[#10683b]" />
                Komponen dari Surat Jalan Terverifikasi (Delivered & Matched)
              </span>
              <span className="text-[10px] text-[#545454]">
                Hanya menampilkan item dengan saldo sisa belum ditagihkan
              </span>
            </div>

            {itemRows.length === 0 ? (
              <div className="p-6 text-center text-[#545454] bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px] text-[12px]">
                Tidak ada item Surat Jalan berstatus <strong>Delivered & Matched</strong> yang belum ditagihkan untuk customer ini.
              </div>
            ) : (
              <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-[#f5f6f7] border-b border-[#d5dce2] text-[10px] font-bold text-[#545454]">
                    <tr>
                      <th className="py-2 px-3">Surat Jalan & SO</th>
                      <th className="py-2 px-3">Part Number & Deskripsi</th>
                      <th className="py-2 px-3 text-right">Sisa Unbilled</th>
                      <th className="py-2 px-3 text-right w-28">Qty Ditagih (PCS)</th>
                      <th className="py-2 px-3 text-right w-32">Harga Satuan (Rp)</th>
                      <th className="py-2 px-3 text-right">Subtotal</th>
                      <th className="py-2 px-3 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e9ec]">
                    {itemRows.map((row, idx) => {
                      const isQtyExceeded = row.qtyToBill > row.availableUnbilledQty;
                      const subtotal = row.qtyToBill * row.unitPrice;

                      return (
                        <tr key={idx} className="hover:bg-[#f8f9fa]">
                          <td className="py-2 px-3">
                            <span className="font-mono font-bold text-[#0057d2]">
                              {row.sjNumber}
                            </span>
                            <div className="text-[9px] text-[#545454]">{row.soNumber}</div>
                          </td>
                          <td className="py-2 px-3">
                            <span className="font-mono font-bold text-[#000000]">
                              {row.partNumber}
                            </span>
                            <div className="text-[10px] text-[#545454]">{row.partDescription}</div>
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-[#10683b] font-bold">
                            {row.availableUnbilledQty.toLocaleString('id-ID')} PCS
                          </td>
                          <td className="py-2 px-3 text-right">
                            <input
                              type="number"
                              min={1}
                              max={row.availableUnbilledQty}
                              value={row.qtyToBill}
                              onChange={(e) => handleUpdateQty(idx, parseInt(e.target.value, 10) || 0)}
                              className={`w-full py-1 px-2 text-right font-bold rounded-[2px] border ${
                                isQtyExceeded
                                  ? 'border-[#c5221f] bg-[#fdeded] text-[#c5221f]'
                                  : 'border-[#d5dce2] bg-[#ffffff] text-[#000000]'
                              }`}
                            />
                          </td>
                          <td className="py-2 px-3 text-right">
                            <input
                              type="number"
                              min={0}
                              value={row.unitPrice}
                              onChange={(e) => handleUpdatePrice(idx, parseInt(e.target.value, 10) || 0)}
                              className="w-full py-1 px-2 text-right text-[#545454] border border-[#d5dce2] rounded-[2px] bg-[#ffffff]"
                            />
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums font-bold text-[#000000]">
                            Rp {subtotal.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(idx)}
                              className="p-1 text-[#888888] hover:text-[#c5221f] transition-colors"
                              title="Hapus baris item ini dari invoice"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section: Ringkasan Nilai & PPN */}
          <div className="bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#545454] block">
                Catatan Faktur (Opsional):
              </span>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Penagihan termin pengiriman periode awal November"
                className="w-full md:w-[380px] py-1.5 px-2 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] text-[11px]"
              />
            </div>

            <div className="text-right space-y-1 min-w-[260px] text-[12px]">
              <div className="flex justify-between text-[#545454]">
                <span>Total Volume PCS:</span>
                <span className="font-bold text-[#0057d2]">
                  {previewCalculation.totalQtyPcs.toLocaleString('id-ID')} PCS
                </span>
              </div>
              <div className="flex justify-between text-[#545454]">
                <span>Subtotal DPP:</span>
                <span className="font-bold text-[#000000]">
                  Rp {previewCalculation.subtotalAmount.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-[#545454]">
                <span>PPN 11% (Manufaktur):</span>
                <span className="font-bold text-[#000000]">
                  Rp {previewCalculation.taxAmount.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#d5dce2] text-[14px] font-bold text-[#0057d2]">
                <span>TOTAL FAKTUR:</span>
                <span>Rp {previewCalculation.totalAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#d5dce2]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#d5dce2] bg-[#ffffff] hover:bg-[#f5f6f7] text-[#545454] rounded-[4px] text-[12px] font-bold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={itemRows.length === 0 || !previewCalculation.isValid}
              className={`px-5 py-2 rounded-[4px] text-[12px] font-bold flex items-center gap-1.5 transition-colors ${
                itemRows.length > 0 && previewCalculation.isValid
                  ? 'bg-[#0057d2] hover:bg-[#0046a8] text-[#ffffff] shadow-sm'
                  : 'bg-[#e0e0e0] text-[#888888] cursor-not-allowed'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              Terbitkan Invoice Resmi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
