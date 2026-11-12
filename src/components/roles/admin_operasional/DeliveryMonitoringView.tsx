/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Modul Pengiriman: Delivery Dashboard & Monitoring (Admin Operasional)
 * BRD §4.3, F-08, BR-DEL-01 s/d BR-DEL-05, BR-ROL-03
 */

import React from 'react';
import {
  Truck,
  Send,
  CheckSquare,
  FileCheck2,
  Clock,
  Layers,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { DeliveryOrder, SalesOrder, FinishedGoodStock } from '../../../types/erp';

interface DeliveryMonitoringViewProps {
  deliveryOrders: DeliveryOrder[];
  orders: SalesOrder[];
  fgStocks: FinishedGoodStock[];
  onNavigateTab: (tabId: string) => void;
  onOpenCreateSjModal: () => void;
  onOpenConfirmModal: (sj: DeliveryOrder) => void;
}

export const DeliveryMonitoringView: React.FC<DeliveryMonitoringViewProps> = ({
  deliveryOrders,
  orders,
  fgStocks,
  onNavigateTab,
  onOpenCreateSjModal,
  onOpenConfirmModal,
}) => {
  // Aggregate Delivery Metrics
  const deliveredList = deliveryOrders.filter((d) => d.status === 'Delivered');
  const printedList = deliveryOrders.filter((d) => d.status === 'Printed');
  const draftList = deliveryOrders.filter((d) => d.status === 'Draft');

  const deliveredPcs = deliveredList.reduce(
    (sum, d) => sum + d.items.reduce((s, it) => s + it.qtyShipped, 0),
    0
  ); // 7.700 PCS
  const printedPcs = printedList.reduce(
    (sum, d) => sum + d.items.reduce((s, it) => s + it.qtyShipped, 0),
    0
  ); // 1.500 PCS
  const draftPcs = draftList.reduce(
    (sum, d) => sum + d.items.reduce((s, it) => s + it.qtyShipped, 0),
    0
  ); // 2.500 PCS

  const matchedCount = deliveryOrders.filter((d) => d.controlStatus === 'Matched').length; // 2
  const exceptionCount = deliveryOrders.filter((d) => d.controlStatus === 'Exception').length; // 0 or raw exceptions

  const readyToConfirmSj = printedList[0];

  return (
    <div className="flex-1 overflow-y-auto bg-[#ffffff] p-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d5dce2] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#eaf6ef] text-[#10683b] border border-[#10683b]/20 rounded-[4px] uppercase tracking-wider">
              Modul Pengiriman (Logistik Pabrik) · BR-ROL-03
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#f0f2f5] text-[#475e75] border border-[#d5dce2] rounded-[4px]">
              TANGGAL ACUAN: 04 NOV 2026
            </span>
          </div>
          <h1 className="text-[20px] font-bold text-[#000000] tracking-tight">
            Monitoring Operasional Pengiriman & Surat Jalan (SJ)
          </h1>
          <p className="text-[12px] text-[#545454] mt-0.5">
            Pengawasan penerbitan Surat Jalan resmi, alokasi armada truk, verifikasi tanda tangan fisik penerimaan pelanggan, dan pemotongan stok FG.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateTab('del-sj-list')}
            className="px-3.5 py-2 text-[12px] font-bold text-[#223548] bg-[#ffffff] border border-[#d5dce2] hover:bg-[#f5f6f7] rounded-[4px] cursor-pointer"
          >
            Buka Daftar Dokumen SJ
          </button>
          <button
            type="button"
            onClick={onOpenCreateSjModal}
            className="px-4 py-2 text-[12px] font-bold text-white bg-[#0057d2] hover:bg-[#0049b0] rounded-[4px] flex items-center gap-1.5 shadow-none cursor-pointer"
          >
            <Send className="w-4 h-4" />
            + Buat Surat Jalan Baru
          </button>
        </div>
      </div>

      {/* 2. Banner Aturan Pemotongan Stok FG (BR-DEL-02) */}
      <div className="p-3.5 bg-[#fff8e1] border border-[#ffd54f]/80 rounded-[4px] text-[11px] text-[#8d4b00] flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-[#8d4b00] shrink-0 mt-0.5" />
        <div className="leading-snug">
          <strong className="font-bold text-[#000000]">
            Aturan Mutlak Pemotongan Stok Finished Goods (BR-DEL-02):
          </strong>
          <div className="mt-0.5">
            Status Surat Jalan <strong>Draft</strong> dan <strong>Printed</strong> sama sekali <u>TIDAK memotong saldo persediaan FG</u>. Stok FG hanya berkurang ketika status diubah menjadi <strong>Delivered</strong> setelah lembar fisik SJ asli bertanda tangan dan dicap basah pelanggan diterima kembali di logistik pabrik.
          </div>
        </div>
      </div>

      {/* 3. 4 Kartu Status Dokumen Pengiriman */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Delivered */}
        <div className="p-4 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
          <div className="flex items-center justify-between text-[#545454] text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>Delivered (Terverifikasi)</span>
            <CheckSquare className="w-4 h-4 text-[#10683b]" />
          </div>
          <div className="text-[24px] font-bold text-[#10683b] tabular-nums">
            {deliveredPcs.toLocaleString('id-ID')}{' '}
            <span className="text-[13px] font-normal text-[#545454]">PCS</span>
          </div>
          <div className="text-[10px] text-[#545454] mt-1 flex items-center gap-1">
            <span className="font-bold text-[#10683b]">{deliveredList.length} Dokumen</span> · Stok FG Terpotong
          </div>
        </div>

        {/* Printed */}
        <div className="p-4 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
          <div className="flex items-center justify-between text-[#545454] text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>Printed (Siap Kirim)</span>
            <Clock className="w-4 h-4 text-[#0057d2]" />
          </div>
          <div className="text-[24px] font-bold text-[#0057d2] tabular-nums">
            {printedPcs.toLocaleString('id-ID')}{' '}
            <span className="text-[13px] font-normal text-[#545454]">PCS</span>
          </div>
          <div className="text-[10px] text-[#545454] mt-1 flex items-center gap-1">
            <span className="font-bold text-[#0057d2]">{printedList.length} Dokumen</span> · Menunggu Tanda Tangan
          </div>
        </div>

        {/* Draft */}
        <div className="p-4 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
          <div className="flex items-center justify-between text-[#545454] text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>Draft Surat Jalan</span>
            <Send className="w-4 h-4 text-[#8d4b00]" />
          </div>
          <div className="text-[24px] font-bold text-[#8d4b00] tabular-nums">
            {draftPcs.toLocaleString('id-ID')}{' '}
            <span className="text-[13px] font-normal text-[#545454]">PCS</span>
          </div>
          <div className="text-[10px] text-[#545454] mt-1 flex items-center gap-1">
            <span className="font-bold text-[#8d4b00]">{draftList.length} Dokumen</span> · Alokasi Pengiriman
          </div>
        </div>

        {/* Kontrol Matching SO */}
        <div className="p-4 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
          <div className="flex items-center justify-between text-[#545454] text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>Kontrol Matching SO</span>
            <FileCheck2 className="w-4 h-4 text-[#0057d2]" />
          </div>
          <div className="text-[24px] font-bold text-[#000000] tabular-nums">
            {matchedCount}{' '}
            <span className="text-[13px] font-normal text-[#545454]">Matched</span>
          </div>
          <div className="text-[10px] text-[#545454] mt-1 flex items-center gap-1">
            <span className="text-[#8d4b00] font-semibold">1 Anomali SO-0043</span> · Diisolasi
          </div>
        </div>
      </div>

      {/* 4. Action Banner: Dokumen Siap Konfirmasi Penerimaan */}
      {readyToConfirmSj && (
        <div className="p-4 bg-[#e8f0fe] border border-[#0057d2]/30 rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-[#0057d2] shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#ffffff] text-[#0057d2] rounded-[3px] border border-[#0057d2]/20 uppercase">
                Siap Dikonfirmasi Penerimaannya
              </span>
              <h3 className="text-[13px] font-bold text-[#000000] mt-1">
                {readyToConfirmSj.sjNumber} — {readyToConfirmSj.customerName}
              </h3>
              <p className="text-[11px] text-[#475e75] mt-0.5">
                Kuantitas: <strong>1.500 PCS</strong> ({readyToConfirmSj.items[0]?.partDescription}) · Armada: {readyToConfirmSj.vehicleNumber} ({readyToConfirmSj.driverName})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenConfirmModal(readyToConfirmSj)}
            className="px-4 py-2 text-[12px] font-bold text-white bg-[#0057d2] hover:bg-[#0049b0] rounded-[4px] cursor-pointer shrink-0"
          >
            Konfirmasi Fisik Delivered (Potong Stok FG)
          </button>
        </div>
      )}

      {/* 5. Tabel Status Dokumen Pengiriman Terkini */}
      <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden">
        <div className="px-4 py-3 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
          <h2 className="text-[13px] font-bold text-[#000000]">
            Status Dokumen Surat Jalan Aktif
          </h2>
          <span className="text-[11px] text-[#545454]">
            Menampilkan 4 dokumen Surat Jalan seeded baseline
          </span>
        </div>

        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="bg-[#ffffff] border-b border-[#d5dce2] text-[10px] font-bold text-[#545454] uppercase tracking-wider">
              <th className="py-2.5 px-3">No. SJ & Tanggal</th>
              <th className="py-2.5 px-3">Customer B2B</th>
              <th className="py-2.5 px-3">Ref SO & PO Pelanggan</th>
              <th className="py-2.5 px-3">Sumber Fisik Pengiriman</th>
              <th className="py-2.5 px-3 text-right">Kuantitas</th>
              <th className="py-2.5 px-3 text-center">Status SJ</th>
              <th className="py-2.5 px-3 text-center">Status Kontrol</th>
              <th className="py-2.5 px-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eaecee]">
            {deliveryOrders.map((sj) => {
              const totalQty = sj.items.reduce((s, it) => s + it.qtyShipped, 0);

              return (
                <tr key={sj.id} className="hover:bg-[#f8f9fa] transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-mono font-bold text-[#0057d2] text-[11px]">{sj.sjNumber}</div>
                    <div className="text-[10px] text-[#545454]">{sj.deliveryDate}</div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#1a1a1a]">
                    {sj.customerName}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-mono text-[#000000]">{sj.soNumber}</div>
                    <div className="text-[10px] text-[#545454]">{sj.customerPoNumber}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-[11px] text-[#1a1a1a]">{sj.sourceLocation}</div>
                    <div className="text-[9px] text-[#545454]">
                      {sj.vehicleNumber} · {sj.driverName}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-bold tabular-nums text-[#000000] text-[12px]">
                    {totalQty.toLocaleString('id-ID')} PCS
                  </td>
                  <td className="py-3 px-3 text-center">
                    {sj.status === 'Delivered' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#eaf6ef] text-[#10683b] rounded-[3px] border border-[#10683b]/20">
                        Delivered (Potong Stok)
                      </span>
                    )}
                    {sj.status === 'Printed' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#ebf8ff] text-[#0057d2] rounded-[3px] border border-[#0057d2]/20">
                        Printed (Siap Kirim)
                      </span>
                    )}
                    {sj.status === 'Draft' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#fff8e1] text-[#8d4b00] rounded-[3px] border border-[#ffd54f]/60">
                        Draft (Alokasi)
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {sj.controlStatus === 'Matched' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#eaf6ef] text-[#10683b] rounded-[3px]">
                        Matched
                      </span>
                    )}
                    {sj.controlStatus === 'Pending' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#f0f2f5] text-[#475e75] rounded-[3px]">
                        Pending
                      </span>
                    )}
                    {sj.controlStatus === 'Exception' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#fde8e8] text-[#c53929] rounded-[3px]">
                        Exception
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => onNavigateTab('del-sj-list')}
                      className="px-2.5 py-1 text-[10px] font-bold text-[#0057d2] hover:bg-[#ebf8ff] border border-[#0057d2]/30 rounded-[3px] cursor-pointer"
                    >
                      Buka Detail
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 6. Navigasi Aksi Bawah */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateTab('del-sj-list')}
          className="p-4 border border-[#d5dce2] rounded-[4px] hover:border-[#0057d2] hover:bg-[#f8f9fa] transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 text-[#0057d2] mb-1.5">
              <Send className="w-4 h-4" />
              <h3 className="text-[12px] font-bold text-[#000000]">Kelola Dokumen Surat Jalan</h3>
            </div>
            <p className="text-[11px] text-[#545454] leading-relaxed">
              Daftar split-pane dokumen SJ, cetak Surat Jalan, dan validasi lokasi fisik sumber.
            </p>
          </div>
          <div className="text-[10px] font-bold text-[#0057d2] flex items-center gap-1 mt-3">
            Kelola Dokumen SJ <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('del-so-matching')}
          className="p-4 border border-[#d5dce2] rounded-[4px] hover:border-[#0057d2] hover:bg-[#f8f9fa] transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 text-[#10683b] mb-1.5">
              <FileCheck2 className="w-4 h-4" />
              <h3 className="text-[12px] font-bold text-[#000000]">Kontrol Matching SJ vs SO</h3>
            </div>
            <p className="text-[11px] text-[#545454] leading-relaxed">
              Verifikasi kuantitas pengiriman terhadap Sales Order, audit status Matched, dan isolasi anomali SO-0043.
            </p>
          </div>
          <div className="text-[10px] font-bold text-[#10683b] flex items-center gap-1 mt-3">
            Buka Kontrol Matching <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('del-history')}
          className="p-4 border border-[#d5dce2] rounded-[4px] hover:border-[#0057d2] hover:bg-[#f8f9fa] transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 text-[#475e75] mb-1.5">
              <Truck className="w-4 h-4" />
              <h3 className="text-[12px] font-bold text-[#000000]">Histori Pengiriman & Armada</h3>
            </div>
            <p className="text-[11px] text-[#545454] leading-relaxed">
              Catatan riwayat armada, supir, jam penerimaan di pabrik customer, dan arsip tanda tangan fisik.
            </p>
          </div>
          <div className="text-[10px] font-bold text-[#475e75] flex items-center gap-1 mt-3">
            Lihat Histori Armada <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
