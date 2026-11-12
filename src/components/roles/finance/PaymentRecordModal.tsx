/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Modal Pencatatan Kas Masuk / Pelunasan Piutang (Payment Recording)
 * BRD §5.8 (BR-BIL-05), FEAT-BIL-02
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  CreditCard,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Building,
  ShieldCheck,
  Receipt,
} from 'lucide-react';
import { Invoice, PaymentMethod, PaymentRecord } from '../../../types/erp';
import { formatIndoDate, validatePaymentRecording } from '../../../utils/logic';

interface PaymentRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onRecordPayment: (payment: PaymentRecord, updatedInvoice: Invoice) => void;
}

export const PaymentRecordModal: React.FC<PaymentRecordModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onRecordPayment,
}) => {
  if (!isOpen || !invoice) return null;

  const [paymentDate, setPaymentDate] = useState('2026-11-10');
  const [amountPaid, setAmountPaid] = useState<number>(invoice.outstandingAmount);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer (BCA)');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  // Validation
  const validationResult = useMemo(() => {
    return validatePaymentRecording({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      totalInvoiceAmount: invoice.totalAmount,
      currentPaidAmount: invoice.paidAmount,
      amountToPay: amountPaid,
      paymentDate,
      paymentMethod,
      referenceNumber,
    });
  }, [invoice, amountPaid, paymentDate, paymentMethod, referenceNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validationResult.isValid) {
      setErrorMessages(validationResult.errors);
      return;
    }

    const newPaymentRecord: PaymentRecord = {
      id: `pay-${Date.now()}`,
      paymentNumber: `PAY-2026-11-${Math.floor(100 + Math.random() * 900)}`,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      paymentDate,
      amountPaid,
      paymentMethod,
      referenceNumber: referenceNumber.trim() || `TRF-AUTO-${Date.now().toString().slice(-6)}`,
      recordedBy: 'Ratna Sulistyo (Finance & Billing Specialist)',
      notes: notes.trim() || undefined,
    };

    const updatedInvoice: Invoice = {
      ...invoice,
      paidAmount: validationResult.newPaidAmount,
      outstandingAmount: validationResult.newOutstandingAmount,
      status: validationResult.newStatus,
    };

    onRecordPayment(newPaymentRecord, updatedInvoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/50 p-4">
      <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#0057d2]" />
            <h2 className="text-[14px] font-bold text-[#000000]">
              Pencatatan Pembayaran Kas Masuk (AR Settlement)
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
                <AlertCircle className="w-4 h-4" />
                <span>Validasi pembayaran gagal:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-1">
                {errorMessages.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Ringkasan Faktur yang Akan Dibayar */}
          <div className="bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px] p-3.5 space-y-2 text-[12px]">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono font-bold text-[#0057d2] text-[13px]">
                  {invoice.invoiceNumber}
                </span>
                <div className="font-bold text-[#000000] mt-0.5">{invoice.customerName}</div>
                <div className="text-[10px] text-[#545454]">
                  Ref PO: {invoice.customerPoNumber} · Jatuh Tempo: {formatIndoDate(invoice.dueDate)}
                </div>
              </div>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-[2px] border ${
                  invoice.status === 'Paid'
                    ? 'bg-[#edf7ed] text-[#10683b] border-[#a5d6a7]'
                    : 'bg-[#e3f2fd] text-[#0057d2] border-[#90caf9]'
                }`}
              >
                {invoice.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#e5e9ec] text-[11px]">
              <div>
                <span className="text-[#545454] block text-[10px]">Total Nilai Faktur:</span>
                <span className="font-bold text-[#000000]">
                  Rp {invoice.totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
              <div>
                <span className="text-[#545454] block text-[10px]">Sudah Dibayar:</span>
                <span className="font-bold text-[#10683b]">
                  Rp {invoice.paidAmount.toLocaleString('id-ID')}
                </span>
              </div>
              <div>
                <span className="text-[#545454] block text-[10px]">Sisa Piutang:</span>
                <span className="font-bold text-[#8d4b00]">
                  Rp {invoice.outstandingAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Form Input Fields */}
          <div className="space-y-3 text-[12px]">
            <div>
              <label className="block text-[10px] font-bold text-[#545454] uppercase mb-1">
                Tanggal Diterima Pembayaran:
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full py-1.5 px-3 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-[#545454] uppercase">
                  Nominal Pembayaran (Rp):
                </label>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setAmountPaid(invoice.outstandingAmount)}
                    className="text-[#0057d2] hover:underline font-bold"
                  >
                    Bayar Penuh (100%)
                  </button>
                  <span className="text-[#d5dce2]">|</span>
                  <button
                    type="button"
                    onClick={() => setAmountPaid(Math.round(invoice.outstandingAmount * 0.5))}
                    className="text-[#0057d2] hover:underline"
                  >
                    50%
                  </button>
                </div>
              </div>
              <input
                type="number"
                min={1}
                max={invoice.outstandingAmount}
                value={amountPaid}
                onChange={(e) => setAmountPaid(parseInt(e.target.value, 10) || 0)}
                className="w-full py-2 px-3 text-[14px] font-bold text-[#000000] tabular-nums bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                required
              />
              <span className="text-[10px] text-[#545454] mt-1 block">
                Maksimal nominal pembayaran adalah sisa piutang: Rp {invoice.outstandingAmount.toLocaleString('id-ID')}
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#545454] uppercase mb-1">
                Metode Pembayaran Kas:
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full py-1.5 px-3 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
              >
                <option value="Bank Transfer (BCA)">Bank Transfer (Rekening BCA PT Nutech)</option>
                <option value="Bank Transfer (Mandiri)">Bank Transfer (Rekening Mandiri PT Nutech)</option>
                <option value="Giro / Cek">Giro Bilyet / Cek Kliring</option>
                <option value="Setoran Tunai">Setoran Kasir / Tunai</option>
                <option value="Lainnya">Lain-lain</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#545454] uppercase mb-1">
                Nomor Referensi Bukti Transfer / Giro:
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Misal: TRF-BCA-987123 / BG-001928"
                className="w-full py-1.5 px-3 font-mono bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#545454] uppercase mb-1">
                Catatan Kas Masuk (Opsional):
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Pembayaran pelunasan termin ke-2 PO ADM"
                className="w-full py-1.5 px-3 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] text-[11px]"
              />
            </div>
          </div>

          {/* Pratinjau Dampak Pelunasan */}
          <div className="bg-[#f0f7ff] border border-[#90caf9] rounded-[4px] p-3 text-[11px] text-[#223548] flex items-center justify-between">
            <div>
              <span className="font-bold text-[#0057d2] block">
                Status Setelah Pembayaran Ini:
              </span>
              <span>
                Sisa saldo piutang akan menjadi:{' '}
                <strong className="text-[#000000]">
                  Rp {Math.max(0, invoice.outstandingAmount - amountPaid).toLocaleString('id-ID')}
                </strong>
              </span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-1 rounded-[2px] border ${
                amountPaid >= invoice.outstandingAmount
                  ? 'bg-[#edf7ed] text-[#10683b] border-[#a5d6a7]'
                  : 'bg-[#e3f2fd] text-[#0057d2] border-[#90caf9]'
              }`}
            >
              {amountPaid >= invoice.outstandingAmount ? 'LUNAS (PAID)' : 'SEBAGIAN (PARTIALLY PAID)'}
            </span>
          </div>

          {/* Modal Actions */}
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
              disabled={!validationResult.isValid}
              className={`px-5 py-2 rounded-[4px] text-[12px] font-bold flex items-center gap-1.5 transition-colors ${
                validationResult.isValid
                  ? 'bg-[#10683b] hover:bg-[#0d532f] text-[#ffffff] shadow-sm'
                  : 'bg-[#e0e0e0] text-[#888888] cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Simpan Bukti Pembayaran
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
