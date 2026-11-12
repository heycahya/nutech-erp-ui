import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  Package,
  Building2,
  Calendar,
  UserCheck
} from 'lucide-react';
import { DeliveryOrder, FinishedGoodStock, FgLocationType } from '../../../types/erp';
import { validateDeliveryConfirmation } from '../../../utils/logic';

interface DeliveryConfirmationModalProps {
  isOpen: boolean;
  sj: DeliveryOrder | null;
  fgStocks: FinishedGoodStock[];
  onClose: () => void;
  onConfirm: (payload: {
    sjId: string;
    recipientName: string;
    confirmedAt: string;
    proofOfDeliveryNotes: string;
    deductions: { partNumber: string; sourceLocation: FgLocationType; qtyPcs: number }[];
  }) => void;
}

export const DeliveryConfirmationModal: React.FC<DeliveryConfirmationModalProps> = ({
  isOpen,
  sj,
  fgStocks,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !sj) return null;

  const [recipientName, setRecipientName] = useState('Bpk. Hendrawan (Receiving ADM)');
  const [confirmedDate, setConfirmedDate] = useState('2026-11-04');
  const [confirmedTime, setConfirmedTime] = useState('14:30');
  const [proofSigned, setProofSigned] = useState(false);
  const [proofNotes, setProofNotes] = useState('Lembar asli SJ bertanda tangan & cap basah telah diterima fisik dan diarsipkan di bagian logistik.');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Determine source location type
  const isWarehouse = sj.sourceLocation.toLowerCase().includes('gudang fg');
  const targetLocation: FgLocationType = isWarehouse ? 'Gudang FG' : 'Ujung Lini Produksi';

  // Compute available stock at location for each item in the SJ
  const itemStockAudits = sj.items.map((item) => {
    const stock = fgStocks.find((s) => s.partNumber === item.partNumber);
    const availableAtLoc = stock
      ? isWarehouse
        ? stock.warehouseQty
        : stock.lineEndQty
      : 0;
    const isSufficient = availableAtLoc >= item.qtyShipped;

    return {
      partNumber: item.partNumber,
      partDescription: item.partDescription,
      qtyShipped: item.qtyShipped,
      availableAtLoc,
      isSufficient,
    };
  });

  const totalShipped = sj.items.reduce((sum, it) => sum + it.qtyShipped, 0);
  const totalAvailable = itemStockAudits.reduce((sum, it) => sum + it.availableAtLoc, 0);
  const hasInsufficientStock = itemStockAudits.some((it) => !it.isSufficient);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Business rule check via pure logic function
    const validation = validateDeliveryConfirmation({
      currentStatus: sj.status,
      controlStatus: sj.controlStatus,
      proofSigned,
      totalQtyShipped: totalShipped,
      availableStockAtLocation: totalAvailable,
      alreadyDeducted: sj.deductedFromFg,
    });

    if (!validation.isValid) {
      setValidationError(validation.error || 'Konfirmasi pengiriman tidak memenuhi syarat validasi.');
      return;
    }

    if (!recipientName.trim()) {
      setValidationError('Nama penerima fisik pada tanda terima Surat Jalan wajib diisi.');
      return;
    }

    const deductions = sj.items.map((it) => ({
      partNumber: it.partNumber,
      sourceLocation: targetLocation,
      qtyPcs: it.qtyShipped,
    }));

    onConfirm({
      sjId: sj.id,
      recipientName: recipientName.trim(),
      confirmedAt: `${confirmedDate} ${confirmedTime} WIB`,
      proofOfDeliveryNotes: proofNotes.trim(),
      deductions,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-lg border border-zinc-200 shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-zinc-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Konfirmasi Tanda Tangan Fisik & Pengurangan Stok FG
              </h3>
              <p className="text-xs text-zinc-400">
                Verifikasi penerimaan fisik pelanggan untuk Surat Jalan <strong>{sj.sjNumber}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Rules / Disiplin Snapshot Warning */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
              Perhatian: Pengurangan Persediaan Barang Jadi (FG)
            </div>
            <p className="text-[11px] leading-relaxed">
              Tindakan ini akan mengesahkan status pengiriman menjadi <strong>Delivered</strong>, memperbarui realisasi pengiriman pada Sales Order <strong>{sj.soNumber}</strong>, dan memotong saldo fisik persediaan FG di lokasi <strong>{targetLocation}</strong> secara resmi.
            </p>
          </div>

          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="font-medium">{validationError}</div>
            </div>
          )}

          {/* SJ Summary Card */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-zinc-50 rounded border border-zinc-200">
            <div>
              <span className="text-zinc-500 block text-[11px]">No. Surat Jalan</span>
              <span className="font-bold text-zinc-900 text-sm">{sj.sjNumber}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[11px]">Pelanggan B2B</span>
              <span className="font-semibold text-zinc-900">{sj.customerName}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[11px]">No. Sales Order</span>
              <span className="font-mono text-zinc-900">{sj.soNumber}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[11px]">Lokasi Sumber Pengambilan</span>
              <span className="font-semibold text-zinc-900">{targetLocation}</span>
            </div>
          </div>

          {/* Stock Deduction Verification Table */}
          <div>
            <div className="font-bold text-zinc-800 mb-2 flex items-center justify-between">
              <span>Pemeriksaan Ketersediaan Stok FG di {targetLocation}</span>
              <span className="font-mono text-zinc-500">
                Total Muatan: {totalShipped.toLocaleString('id-ID')} PCS
              </span>
            </div>

            <div className="border border-zinc-200 rounded overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-zinc-100 text-zinc-700 font-semibold border-b border-zinc-200">
                  <tr>
                    <th className="py-2 px-3 text-left">Part Number & Deskripsi</th>
                    <th className="py-2 px-3 text-right">Kuantitas Kirim</th>
                    <th className="py-2 px-3 text-right">Stok Fisik di Lokasi</th>
                    <th className="py-2 px-3 text-center">Status Kelayakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {itemStockAudits.map((item, idx) => (
                    <tr key={idx} className={item.isSufficient ? 'bg-white' : 'bg-rose-50/50'}>
                      <td className="py-2 px-3">
                        <div className="font-mono font-bold text-zinc-900">{item.partNumber}</div>
                        <div className="text-[11px] text-zinc-500">{item.partDescription}</div>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-zinc-900">
                        {item.qtyShipped.toLocaleString('id-ID')} PCS
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-zinc-700">
                        {item.availableAtLoc.toLocaleString('id-ID')} PCS
                      </td>
                      <td className="py-2 px-3 text-center">
                        {item.isSufficient ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Cukup
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Defisit
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasInsufficientStock && (
              <p className="mt-2 text-[11px] text-rose-600 font-medium">
                Peringatan: Saldo persediaan FG di {targetLocation} tidak mencukupi untuk memenuhi seluruh kuantitas pengiriman. Konfirmasi akan diblokir oleh sistem.
              </p>
            )}
          </div>

          {/* Form Fields: Recipient, Timestamp, Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                Nama Penerima Fisik Pelanggan <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Contoh: Bpk. Hendrawan (Receiving ADM)"
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0057d2] focus:border-[#0057d2]"
                />
              </div>
              <span className="text-[10px] text-zinc-500 mt-0.5 block">
                Nama staf/pihak receiving pelanggan yang menandatangani lembar fisik
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Tanggal Terima <span className="text-rose-600">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={confirmedDate}
                  onChange={(e) => setConfirmedDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0057d2] focus:border-[#0057d2]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Waktu Terima
                </label>
                <input
                  type="time"
                  value={confirmedTime}
                  onChange={(e) => setConfirmedTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0057d2] focus:border-[#0057d2]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-800 mb-1">
              Catatan Bukti Serah Terima Fisik
            </label>
            <textarea
              rows={2}
              value={proofNotes}
              onChange={(e) => setProofNotes(e.target.value)}
              placeholder="Catatan kondisi penerimaan barang, no invoice pelengkap, dsb..."
              className="w-full px-3 py-1.5 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0057d2] focus:border-[#0057d2]"
            />
          </div>

          {/* Mandatory Checkbox */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={proofSigned}
                onChange={(e) => setProofSigned(e.target.checked)}
                className="mt-0.5 h-4 w-4 text-[#0057d2] border-zinc-300 rounded focus:ring-[#0057d2]"
              />
              <div className="text-xs text-zinc-900 leading-snug">
                <strong className="text-blue-900">
                  Saya menyatakan bahwa lembar asli Surat Jalan bertanda tangan dan dicap basah oleh pihak penerima telah diterima fisik oleh bagian Logistik/Admin Operasional.
                </strong>
                <span className="block text-[11px] text-zinc-600 mt-1">
                  Persetujuan ini mengaktifkan pemotongan kuantitas persediaan Finished Goods ({totalShipped.toLocaleString('id-ID')} PCS) dan mengesahkan status dokumen ke penagihan.
                </span>
              </div>
            </label>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 rounded hover:bg-zinc-50 transition-colors"
            >
              Batalkan
            </button>
            <button
              type="submit"
              disabled={!proofSigned || hasInsufficientStock}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded text-white shadow-sm transition-colors ${
                !proofSigned || hasInsufficientStock
                  ? 'bg-zinc-300 cursor-not-allowed text-zinc-500'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Sahkan Pengiriman Fisik & Potong Stok FG
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
