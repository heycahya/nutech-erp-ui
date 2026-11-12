/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Pattern 4: Master-Detail Split-Pane Transaction View
 * Formatted dates in Indonesian style, clear operational verification.
 */

import React from 'react';
import { DeliveryOrder, SalesOrder } from '../../types/erp';
import { calculateSoFulfillment, formatIndoDate } from '../../utils/logic';
import { X, FileText, Truck, ShieldCheck, ArrowLeft, CheckCircle2, Edit2 } from 'lucide-react';

interface SplitPaneDetailPatternProps {
  order: SalesOrder;
  deliveryOrders: DeliveryOrder[];
  onClose: () => void;
  onOpenConfirmModal: () => void;
  onEditOrder?: (order: SalesOrder) => void;
}

export const SplitPaneDetailPattern: React.FC<SplitPaneDetailPatternProps> = ({
  order,
  deliveryOrders,
  onClose,
  onOpenConfirmModal,
  onEditOrder,
}) => {
  // Filter Surat Jalan terkait SO ini
  const relatedSj = deliveryOrders.filter((sj) => sj.soId === order.id || sj.soNumber === order.soNumber);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#ffffff]">
      {/* LEFT PANE: Header & Metadata Document Card (380px) */}
      <div className="w-full md:w-[380px] border-r border-[#d5dce2] bg-[#f5f6f7] flex flex-col justify-between shrink-0 overflow-y-auto">
        <div className="p-5 space-y-5">
          {/* Header Title */}
          <div className="flex items-center justify-between pb-3 border-b border-[#d5dce2]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#545454]">
                Dokumen Induk Transaksi
              </span>
              <h2 className="text-[18px] font-bold text-[#000000] tabular-nums leading-tight">
                {order.soNumber}
              </h2>
            </div>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-[4px] border ${
                order.orderType === 'Urgent'
                  ? 'bg-[#fff6e5] text-[#8d4b00] border-[#8d4b00]/30'
                  : 'bg-[#eaecee] text-[#354a5f] border-[#d5dce2]'
              }`}
            >
              {order.orderType}
            </span>
          </div>

          {/* Customer Profile Box */}
          <div className="bg-[#ffffff] p-3.5 border border-[#d5dce2] rounded-[8px] space-y-2">
            <div className="text-[11px] font-bold text-[#545454] uppercase tracking-wider">
              Identitas Customer B2B
            </div>
            <div className="text-[14px] font-bold text-[#000000] leading-snug">
              {order.customerName}
            </div>
            <div className="text-[12px] text-[#475e75] space-y-1">
              <div>
                <span className="text-[#545454]">No. PO:</span>{' '}
                <span className="font-mono font-bold text-[#000000] tabular-nums">
                  {order.customerPoNumber}
                </span>
              </div>
              <div>
                <span className="text-[#545454]">Tanggal Order:</span> {formatIndoDate(order.orderDate)}
              </div>
              <div>
                <span className="text-[#545454]">Need Date:</span>{' '}
                <span className="font-bold text-[#8d4b00] tabular-nums">{formatIndoDate(order.needDate)}</span>
              </div>
            </div>
          </div>

          {/* 3 Status Downstream Trackers (BR-SO-06) */}
          <div className="bg-[#ffffff] p-3.5 border border-[#d5dce2] rounded-[8px] space-y-3">
            <div className="text-[11px] font-bold text-[#545454] uppercase tracking-wider">
              Status Downstream (Terpisah)
            </div>

            <div className="space-y-2 text-[12px]">
              <div className="flex items-center justify-between py-1 border-b border-[#eaecee]">
                <span className="text-[#545454]">1. Jalur Produksi:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-[4px] border text-[10px] ${
                    order.statusProduction === 'Completed'
                      ? 'bg-[#eaf6ef] text-[#10683b] border-[#10683b]/30'
                      : order.statusProduction === 'In Production'
                      ? 'bg-[#ebf8ff] text-[#0057d2] border-[#0057d2]/30'
                      : 'bg-[#eaecee] text-[#545454] border-[#d5dce2]'
                  }`}
                >
                  {order.statusProduction}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#eaecee]">
                <span className="text-[#545454]">2. Jalur Pengiriman:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-[4px] border text-[10px] ${
                    order.statusDelivery === 'Fully Delivered'
                      ? 'bg-[#eaf6ef] text-[#10683b] border-[#10683b]/30'
                      : order.statusDelivery === 'Partially Shipped'
                      ? 'bg-[#fff6e5] text-[#8d4b00] border-[#8d4b00]/30'
                      : 'bg-[#eaecee] text-[#545454] border-[#d5dce2]'
                  }`}
                >
                  {order.statusDelivery}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-[#545454]">3. Jalur Billing/Invoice:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-[4px] border text-[10px] ${
                    order.statusBilling === 'Fully Billed'
                      ? 'bg-[#eaf6ef] text-[#10683b] border-[#10683b]/30'
                      : order.statusBilling === 'Partially Billed'
                      ? 'bg-[#ebf8ff] text-[#0057d2] border-[#0057d2]/30'
                      : 'bg-[#eaecee] text-[#545454] border-[#d5dce2]'
                  }`}
                >
                  {order.statusBilling}
                </span>
              </div>
            </div>
          </div>

          {/* Notes Box */}
          {order.notes && (
            <div className="p-3 bg-[#ffffff] border border-[#d5dce2] rounded-[8px] text-[12px] text-[#223548]">
              <span className="font-bold text-[#000000] block mb-1">Catatan Pesanan:</span>
              <p className="text-[#475e75] leading-relaxed">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Actions button */}
        <div className="p-4 border-t border-[#d5dce2] bg-[#ffffff] space-y-2">
          {onEditOrder && (
            <button
              type="button"
              onClick={() => onEditOrder(order)}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-[12px] font-bold text-white bg-[#0057d2] hover:bg-[#0049b0] active:bg-[#00368a] rounded-[4px] transition-colors cursor-pointer shadow-sm"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Sales Order Ini</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-[12px] font-semibold text-[#223548] hover:bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Tabel Data</span>
          </button>
        </div>
      </div>

      {/* RIGHT PANE: Multi-Part Line Items & Related Delivery Orders (Flexible) */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* 1. Line Items Breakdown Table */}
        <div className="border border-[#d5dce2] rounded-[8px] bg-[#ffffff] overflow-hidden">
          <div className="px-4 py-3 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-bold text-[#000000]">
                Rincian Multi-Part Line Items (Pemenuhan Parsial)
              </h3>
              <p className="text-[11px] text-[#545454]">
                Kuantitas resmi dalam satuan PCS (Sesuai aturan BR-SPK-03 & BR-SO-03)
              </p>
            </div>
            <div className="text-[12px] font-semibold text-[#0057d2] tabular-nums">
              {order.items.length} Komponen Terdaftar
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead className="bg-[#ffffff] border-b border-[#d5dce2] text-[11px] font-bold text-[#545454] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3.5">Nomor Part & Deskripsi</th>
                  <th className="py-2.5 px-3.5 text-right w-[120px]">Dipesan (PCS)</th>
                  <th className="py-2.5 px-3.5 text-right w-[140px]">Delivered Internal (PCS)</th>
                  <th className="py-2.5 px-3.5 text-right w-[120px]">Sisa (PCS)</th>
                  <th className="py-2.5 px-3.5 text-center w-[130px]">Progres Fisik</th>
                  <th className="py-2.5 px-3.5 text-right w-[140px]">Billed Internal (PCS)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d5dce2]">
                {order.items.map((item) => {
                  const fulfillment = calculateSoFulfillment(item.qtyOrdered, item.qtyDelivered);

                  return (
                    <tr key={item.id} className="hover:bg-[#f5f6f7]/50">
                      <td className="py-3 px-3.5 font-medium">
                        <div className="font-bold text-[#000000] tabular-nums font-mono">
                          {item.partNumber}
                        </div>
                        <div className="text-[12px] text-[#475e75]">{item.partDescription}</div>
                      </td>

                      <td className="py-3 px-3.5 text-right font-bold text-[#000000] tabular-nums">
                        {item.qtyOrdered.toLocaleString('id-ID')}
                      </td>

                      <td className="py-3 px-3.5 text-right font-bold text-[#10683b] tabular-nums">
                        {item.qtyDelivered.toLocaleString('id-ID')}
                      </td>

                      <td className="py-3 px-3.5 text-right font-bold text-[#8d4b00] tabular-nums">
                        {fulfillment.remainingQty.toLocaleString('id-ID')}
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-20 h-2 bg-[#eaecee] rounded-[2px] overflow-hidden">
                            <div
                              className={`h-full ${
                                fulfillment.percentComplete === 100 ? 'bg-[#10683b]' : 'bg-[#0057d2]'
                              }`}
                              style={{ width: `${fulfillment.percentComplete}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold tabular-nums text-[#223548]">
                            {fulfillment.percentComplete}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-right font-bold text-[#0057d2] tabular-nums">
                        {item.qtyBilled.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Associated Delivery Orders (Surat Jalan Fisik) */}
        <div className="border border-[#d5dce2] rounded-[8px] bg-[#ffffff] overflow-hidden">
          <div className="px-4 py-3 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#0057d2]" />
              <h3 className="text-[14px] font-bold text-[#000000]">
                Surat Jalan Terkait (Jejak Pengiriman Fisik)
              </h3>
            </div>
            <span className="text-[11px] text-[#545454]">
              {relatedSj.length} Dokumen Pengiriman
            </span>
          </div>

          {relatedSj.length === 0 ? (
            <div className="p-6 text-center text-[#545454] text-[13px]">
              Belum ada Surat Jalan yang diterbitkan untuk pesanan ini.
            </div>
          ) : (
            <div className="divide-y divide-[#d5dce2]">
              {relatedSj.map((sj) => {
                const isPendingDelivery = sj.status !== 'Delivered';

                return (
                  <div key={sj.id} className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-[#f5f6f7]/40">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-[#000000] text-[14px] tabular-nums">
                          {sj.sjNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] border ${
                            sj.status === 'Delivered'
                              ? 'bg-[#eaf6ef] text-[#10683b] border-[#10683b]/30'
                              : sj.status === 'Printed'
                              ? 'bg-[#fff6e5] text-[#8d4b00] border-[#8d4b00]/30'
                              : 'bg-[#eaecee] text-[#545454] border-[#d5dce2]'
                          }`}
                        >
                          {sj.status}
                        </span>
                        <span className="text-[11px] text-[#475e75]">
                          Tgl Kirim: <strong className="tabular-nums font-medium text-[#000000]">{formatIndoDate(sj.deliveryDate)}</strong>
                        </span>
                      </div>
                      <div className="text-[12px] text-[#475e75]">
                        Sumber Lokasi: <span className="font-semibold text-[#000000]">{sj.sourceLocation}</span> · Kendaraan: {sj.vehicleNumber} (Supir: {sj.driverName})
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-[11px] text-[#545454]">Item Diangkut:</div>
                        <div className="text-[12px] font-bold text-[#000000] tabular-nums">
                          {sj.items.map((i) => `${i.qtyShipped.toLocaleString('id-ID')} PCS (${i.partNumber})`).join(', ')}
                        </div>
                      </div>

                      {/* Interactive Button to trigger Confirmation Modal */}
                      {isPendingDelivery ? (
                        <button
                          type="button"
                          onClick={onOpenConfirmModal}
                          className="px-3 py-1.5 text-[12px] font-bold text-white bg-[#0057d2] hover:bg-[#0049b0] active:bg-[#00368a] rounded-[6px] transition-colors cursor-pointer shrink-0"
                        >
                          Konfirmasi Pengiriman
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-[#10683b] bg-[#eaf6ef] px-2 py-1 rounded-[4px] border border-[#10683b]/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Stok FG Terpotong</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Business rule banner */}
          <div className="p-3 bg-[#f5f6f7] border-t border-[#d5dce2] text-[11px] text-[#545454] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#10683b] shrink-0" />
            <span>
              <strong>Aturan Baku BRD (BR-DEL-03 s/d BR-DEL-05):</strong> Surat Jalan berstatus Draft atau Printed <u>TIDAK memotong stok FG</u>. Stok FG dipotong di ledger hanya saat status dikonfirmasi menjadi Delivered.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
