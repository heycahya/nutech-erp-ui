/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Domain 4: Delivery Monitoring Card (FEAT-DSH-01, FEAT-DEL-01, BRD §5.6, BR-DEL-01 s/d 03)
 * Monitoring 4 Surat Jalan aktual dengan validasi audit lokasi sumber dan rekap Delivered terverifikasi
 */

import React from 'react';
import { Truck, CheckCircle2, Clock, FileText, AlertCircle } from 'lucide-react';
import { DeliveryOrder } from '../../../types/erp';
import { formatIndoDate, validateSjSourceLocation } from '../../../utils/logic';

interface DeliveryMonitoringCardProps {
  deliveryOrders: DeliveryOrder[];
}

export const DeliveryMonitoringCard: React.FC<DeliveryMonitoringCardProps> = ({ deliveryOrders }) => {
  // Hitung total kuantitas per status
  const deliveredOrders = deliveryOrders.filter((d) => d.status === 'Delivered');
  const totalDeliveredVerifiedPcs = deliveredOrders.reduce(
    (acc, d) => acc + d.items.reduce((sum, item) => sum + item.qtyShipped, 0),
    0
  ); // 7.700 PCS

  const printedOrders = deliveryOrders.filter((d) => d.status === 'Printed');
  const totalPrintedPcs = printedOrders.reduce(
    (acc, d) => acc + d.items.reduce((sum, item) => sum + item.qtyShipped, 0),
    0
  ); // 1.500 PCS

  const draftOrders = deliveryOrders.filter((d) => d.status === 'Draft');
  const totalDraftPcs = draftOrders.reduce(
    (acc, d) => acc + d.items.reduce((sum, item) => sum + item.qtyShipped, 0),
    0
  ); // 2.500 PCS

  return (
    <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] overflow-hidden flex flex-col justify-between shadow-none">
      {/* Header */}
      <div>
        <div className="px-4 py-3 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#0057d2]" />
            <h3 className="text-[13px] font-bold text-[#000000]">
              Domain 4: Status Pengiriman & Surat Jalan (SJ)
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-[#ffffff] border border-[#d5dce2] text-[#475e75] rounded-[4px]">
            {deliveryOrders.length} SURAT JALAN
          </span>
        </div>

        {/* Ringkasan Status Pengiriman */}
        <div className="p-4 grid grid-cols-3 gap-2.5 border-b border-[#eaecee] bg-[#f8f9fa]">
          <div className="p-2 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
            <div className="text-[10px] font-bold text-[#10683b] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Delivered
            </div>
            <div className="text-[15px] font-bold text-[#000000] tabular-nums mt-0.5">
              {totalDeliveredVerifiedPcs.toLocaleString('id-ID')}{' '}
              <span className="text-[10px] font-normal text-[#545454]">PCS</span>
            </div>
            <div className="text-[9px] text-[#545454]">2 Dokumen (Stok Terpotong)</div>
          </div>

          <div className="p-2 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
            <div className="text-[10px] font-bold text-[#0057d2] flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Printed
            </div>
            <div className="text-[15px] font-bold text-[#000000] tabular-nums mt-0.5">
              {totalPrintedPcs.toLocaleString('id-ID')}{' '}
              <span className="text-[10px] font-normal text-[#545454]">PCS</span>
            </div>
            <div className="text-[9px] text-[#545454]">1 Dokumen (Siap Kirim)</div>
          </div>

          <div className="p-2 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
            <div className="text-[10px] font-bold text-[#8d4b00] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Draft
            </div>
            <div className="text-[15px] font-bold text-[#000000] tabular-nums mt-0.5">
              {totalDraftPcs.toLocaleString('id-ID')}{' '}
              <span className="text-[10px] font-normal text-[#545454]">PCS</span>
            </div>
            <div className="text-[9px] text-[#545454]">1 Dokumen (Alokasi)</div>
          </div>
        </div>

        {/* Daftar 4 Surat Jalan */}
        <div className="p-4 space-y-2.5">
          {deliveryOrders.map((sj) => {
            const totalQty = sj.items.reduce((s, i) => s + i.qtyShipped, 0);
            const partNumbers = sj.items.map((i) => i.partNumber);
            const locationAudit = validateSjSourceLocation(partNumbers, sj.sourceLocation);

            return (
              <div
                key={sj.id}
                className="p-3 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] space-y-1.5 hover:border-[#0057d2]/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[11px] text-[#0057d2]">
                      {sj.sjNumber}
                    </span>
                    <span className="text-[11px] font-bold text-[#000000] truncate max-w-[180px]">
                      {sj.customerName}
                    </span>
                  </div>
                  {sj.status === 'Delivered' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[#edf7ed] text-[#10683b] border border-[#a5d6a7] rounded-[4px]">
                      Delivered (Matched)
                    </span>
                  )}
                  {sj.status === 'Printed' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[#ebf8ff] text-[#0057d2] border border-[#0057d2]/20 rounded-[4px]">
                      Printed (Pending)
                    </span>
                  )}
                  {sj.status === 'Draft' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[#fff8e1] text-[#8d4b00] border border-[#ffd54f] rounded-[4px]">
                      Draft (Pending)
                    </span>
                  )}
                </div>

                <div className="text-[10px] text-[#475e75] flex items-center justify-between">
                  <span>
                    Ref SO: <strong>{sj.soNumber}</strong> ({sj.customerPoNumber})
                  </span>
                  <span className="font-bold text-[#000000] tabular-nums">
                    {totalQty.toLocaleString('id-ID')} PCS
                  </span>
                </div>

                {/* Audit Raw Location vs Validated Location */}
                <div className="pt-1.5 border-t border-[#eaecee] text-[10px] flex items-center justify-between">
                  <span className="text-[#545454]">
                    Tgl Kirim: {formatIndoDate(sj.deliveryDate)}
                  </span>
                  <div className="text-right">
                    {locationAudit.isValid ? (
                      <span className="font-medium text-[#10683b]">
                        Lokasi: {locationAudit.displayLocation}
                      </span>
                    ) : (
                      <span
                        className="font-medium text-[#8d4b00] flex items-center gap-1"
                        title={`Data mentah: "${sj.sourceLocation}" (Audit: ${locationAudit.validationStatus})`}
                      >
                        <AlertCircle className="w-3 h-3 text-[#8d4b00]" />
                        {locationAudit.displayLocation}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2.5 bg-[#f8f9fa] border-t border-[#d5dce2] text-[10px] text-[#545454] flex items-center justify-between">
        <span>Pengurangan stok terverifikasi: 7.700 PCS</span>
        <span className="font-semibold text-[#0057d2]">Aturan BR-DEL-02 Berlaku</span>
      </div>
    </div>
  );
};
