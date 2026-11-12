/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Pattern 5: Operational Confirmation Modal Dialog
 * Strict BRD validation: FG stock is deducted ONLY when SJ is confirmed Delivered.
 */

import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ModalDialogPatternProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSuccess?: () => void;
}

export const ModalDialogPattern: React.FC<ModalDialogPatternProps> = ({
  isOpen,
  onClose,
  onConfirmSuccess,
}) => {
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      if (onConfirmSuccess) onConfirmSuccess();
      setConfirmed(false);
      onClose();
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/50 backdrop-blur-[1px] transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="w-full max-w-[560px] bg-[#ffffff] border border-[#d5dce2] rounded-[8px] shadow-lg overflow-hidden select-none">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#8d4b00]" />
            <h2 id="modal-title" className="text-[16px] font-bold text-[#000000]">
              Konfirmasi Pemotongan Stok FG (Surat Jalan Delivered)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#545454] hover:text-[#000000] rounded-[4px] hover:bg-[#eaecee] cursor-pointer"
            aria-label="Tutup Dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4 text-[13px] text-[#223548]">
          {confirmed ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-[#10683b] mx-auto animate-bounce" />
              <h3 className="text-[16px] font-bold text-[#10683b]">
                Pengiriman Berhasil Dikonfirmasi!
              </h3>
              <p className="text-[12px] text-[#475e75]">
                Simulasi mutasi keluar -1.500 PCS dicatat pada data prototype dan status SJ diubah menjadi Delivered.
              </p>
            </div>
          ) : (
            <>
              <p className="leading-relaxed">
                Anda akan melakukan konfirmasi penerimaan fisik atas lembar Surat Jalan bertandatangan pelanggan untuk dokumen berikut:
              </p>

              {/* Document Summary Card */}
              <div className="p-3.5 bg-[#f5f6f7] border border-[#d5dce2] rounded-[6px] space-y-2 font-mono text-[12px]">
                <div className="flex justify-between border-b border-[#eaecee] pb-1">
                  <span className="text-[#545454]">Nomor Surat Jalan:</span>
                  <span className="font-bold text-[#000000] tabular-nums">SJ-2026-0091</span>
                </div>
                <div className="flex justify-between border-b border-[#eaecee] pb-1">
                  <span className="text-[#545454]">Customer:</span>
                  <span className="font-bold text-[#000000]">PT Toyota Motor Manufacturing Indonesia</span>
                </div>
                <div className="flex justify-between border-b border-[#eaecee] pb-1">
                  <span className="text-[#545454]">Item & Kuantitas:</span>
                  <span className="font-bold text-[#0057d2] tabular-nums">1.500 PCS (NTC-FOAM-0201)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#545454]">Lokasi Sumber:</span>
                  <span className="font-bold text-[#000000]">Lane 1 (Ujung Lini Produksi)</span>
                </div>
              </div>

              {/* Explicit BRD Business Rule Warning Box */}
              <div className="p-3.5 bg-[#fff6e5] border border-[#8d4b00]/30 rounded-[6px] text-[12px] text-[#223548] flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-[#8d4b00] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-[#8d4b00] block">
                    Aturan Baku BRD (BR-DEL-03, BR-DEL-05 & NFR-02):
                  </span>
                  <p className="leading-relaxed text-[#354a5f]">
                    Status Surat Jalan <strong>Draft</strong> dan <strong>Printed</strong> sama sekali <u>tidak memotong saldo persediaan FG</u>. Konfirmasi status menjadi <strong>Delivered</strong> ini merupakan <em>satu-satunya titik</em> di mana stok Finished Goods (1.500 PCS) resmi berkurang dari saldo persediaan (simulasi pemotongan stok frontend).
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Actions */}
        {!confirmed && (
          <div className="px-6 py-4 bg-[#f5f6f7] border-t border-[#d5dce2] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-[36px] px-4 text-[13px] font-medium text-[#223548] hover:text-[#000000] bg-[#ffffff] hover:bg-[#eaecee] border border-[#d5dce2] rounded-[6px] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="h-[36px] px-5 text-[13px] font-bold text-white bg-[#0057d2] hover:bg-[#0049b0] active:bg-[#00368a] rounded-[6px] transition-colors cursor-pointer"
            >
              Konfirmasi & Potong Stok FG
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
