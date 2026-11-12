/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Management Executive Dashboard (F-12) — Phase 01 Preview
 * Murni Read-Only, memetakan 5 kebutuhan KPI sesuai BRD Section 6
 */

import React from 'react';
import { SalesOrder } from '../../types/erp';
import { formatIndoDate } from '../../utils/logic';
import {
  Factory,
  Boxes,
  Layers,
  Truck,
  CreditCard,
  ShieldCheck,
  Info,
  TrendingUp,
} from 'lucide-react';

interface ManagementDashboardPreviewProps {
  orders: SalesOrder[];
}

export const ManagementDashboardPreview: React.FC<ManagementDashboardPreviewProps> = ({ orders }) => {
  const totalVolumePcs = orders.reduce(
    (acc, o) => acc + o.items.reduce((s, i) => s + i.qtyOrdered, 0),
    0
  );
  const totalDeliveredPcs = orders.reduce(
    (acc, o) => acc + o.items.reduce((s, i) => s + i.qtyDelivered, 0),
    0
  );
  const deliveryPct = Math.round((totalDeliveredPcs / totalVolumePcs) * 100);

  return (
    <div className="flex-1 overflow-y-auto bg-[#ffffff] p-6 space-y-6">
      {/* 1. Header Banner: Provisional Preview & Strict Read-Only Notice */}
      <div className="p-4 bg-[#f5f6f7] border border-[#d5dce2] rounded-[8px] flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#545454]">
              Executive Dashboard (BRD F-12)
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#fff6e5] text-[#8d4b00] border border-[#d5dce2] rounded-[4px]">
              PREVIEW SEMENTARA · PHASE 01
            </span>
          </div>
          <h2 className="text-[16px] font-bold text-[#000000] mt-0.5">
            Ringkasan 5 Domain Operasional Manufaktur PT Nutech Pundi Arta
          </h2>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-bold px-2.5 py-1 bg-[#fff6e5] text-[#8d4b00] border border-[#8d4b00]/30 rounded-[4px]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>HAK AKSES MURNI READ-ONLY (BR-ROL-01)</span>
        </div>
      </div>

      {/* 2. Pemetaan 5 Kebutuhan KPI Eksekutif BRD F-12 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
        {/* KPI 1: Produksi per Lane */}
        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[8px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#545454]">
              <span className="text-[10px] font-bold uppercase tracking-wider">1. Produksi Lini</span>
              <Factory className="w-4 h-4 text-[#0057d2]" />
            </div>
            <div className="mt-2 text-[22px] font-bold text-[#000000] tabular-nums leading-none">
              3.200 <span className="text-[12px] font-medium text-[#475e75]">PCS</span>
            </div>
            <div className="mt-1 text-[11px] text-[#10683b] font-medium">
              Aktual harian (Lane 1-3)
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eaecee] text-[10px] text-[#475e75]">
            Target SPK: 3.300 PCS (Gap: -100)
          </div>
        </div>

        {/* KPI 2: Stok Bahan Baku */}
        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[8px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#545454]">
              <span className="text-[10px] font-bold uppercase tracking-wider">2. Stok Material</span>
              <Boxes className="w-4 h-4 text-[#0057d2]" />
            </div>
            <div className="mt-2 text-[22px] font-bold text-[#10683b] tabular-nums leading-none">
              Aman
            </div>
            <div className="mt-1 text-[11px] text-[#475e75]">
              Asumsi Simulasi: Buffer 14 Hari
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eaecee] text-[10px] text-[#475e75]">
            Safety stock terjaga (Zero Negative)
          </div>
        </div>

        {/* KPI 3: Stok Barang Jadi (FG) Multi-Lokasi */}
        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[8px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#545454]">
              <span className="text-[10px] font-bold uppercase tracking-wider">3. Stok FG</span>
              <Layers className="w-4 h-4 text-[#0057d2]" />
            </div>
            <div className="mt-2 text-[22px] font-bold text-[#000000] tabular-nums leading-none">
              7.200 <span className="text-[12px] font-medium text-[#475e75]">PCS</span>
            </div>
            <div className="mt-1 text-[11px] text-[#475e75]">
              Lini (4.200) · Gudang (3.000)
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eaecee] text-[10px] text-[#475e75]">
            Multi-lokasi tanpa wajib transit
          </div>
        </div>

        {/* KPI 4: Pengiriman Pelanggan */}
        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[8px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#545454]">
              <span className="text-[10px] font-bold uppercase tracking-wider">4. Pengiriman</span>
              <Truck className="w-4 h-4 text-[#0057d2]" />
            </div>
            <div className="mt-2 text-[22px] font-bold text-[#10683b] tabular-nums leading-none">
              {deliveryPct}%
            </div>
            <div className="mt-1 text-[11px] text-[#10683b] font-medium">
              13.700 dari 25.900 PCS
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eaecee] text-[10px] text-[#475e75]">
            4 Surat Jalan (2 Delivered)
          </div>
        </div>

        {/* KPI 5: Piutang AR */}
        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[8px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#545454]">
              <span className="text-[10px] font-bold uppercase tracking-wider">5. Piutang (AR)</span>
              <CreditCard className="w-4 h-4 text-[#0057d2]" />
            </div>
            <div className="mt-2 text-[22px] font-bold text-[#10683b] tabular-nums leading-none">
              Lancar
            </div>
            <div className="mt-1 text-[11px] text-[#475e75]">
              Asumsi Simulasi: 0% Overdue
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#eaecee] text-[10px] text-[#475e75]">
            Monitoring tagihan multi-SJ Matched
          </div>
        </div>
      </div>

      {/* 3. Section Detail 5 Domain */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain 1: Pemantauan Produksi per Lini */}
        <div className="border border-[#d5dce2] rounded-[8px] bg-[#ffffff] overflow-hidden">
          <div className="px-4 py-3 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-[#000000]">
              Domain 1: Produksi per Lini (Lane 1 - 4)
            </h3>
            <span className="text-[11px] text-[#545454]">Shift Berjalan: Pagi</span>
          </div>
          <div className="p-4 space-y-3 text-[12px]">
            <div className="flex items-center justify-between py-1.5 border-b border-[#eaecee]">
              <div>
                <span className="font-bold text-[#000000]">Lane 1 (Rubber Cutting)</span>
                <div className="text-[11px] text-[#475e75]">Part: NTC-RUB-0101 Gasket Seal</div>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#10683b] tabular-nums">1.050 / 1.000 PCS</span>
                <div className="text-[11px] text-[#10683b]">Capaian: 105% (Normal)</div>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[#eaecee]">
              <div>
                <span className="font-bold text-[#000000]">Lane 2 (Foam Slicing)</span>
                <div className="text-[11px] text-[#475e75]">Part: NTC-FOAM-0201 Acoustic Barrier</div>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#8d4b00] tabular-nums">650 / 800 PCS</span>
                <div className="text-[11px] text-[#8d4b00]">Capaian: 81% (Blade Sharpening)</div>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <div>
                <span className="font-bold text-[#000000]">Lane 3 (EVA Die-cut)</span>
                <div className="text-[11px] text-[#475e75]">Part: NTC-EVA-0301 Weatherstrip</div>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#10683b] tabular-nums">1.500 / 1.500 PCS</span>
                <div className="text-[11px] text-[#10683b]">Capaian: 100% (Normal)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Domain 2: Status Pengiriman & Pemenuhan Pelanggan */}
        <div className="border border-[#d5dce2] rounded-[8px] bg-[#ffffff] overflow-hidden">
          <div className="px-4 py-3 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-[#000000]">
              Domain 4: Status Pemenuhan Order Pelanggan
            </h3>
            <span className="text-[11px] text-[#545454]">5 Kontrak PO Berjalan</span>
          </div>
          <div className="p-4 space-y-3 text-[12px]">
            {orders.map((o) => {
              const totalOrd = o.items.reduce((s, i) => s + i.qtyOrdered, 0);
              const totalDel = o.items.reduce((s, i) => s + i.qtyDelivered, 0);
              const pct = totalOrd > 0 ? Math.round((totalDel / totalOrd) * 100) : 0;

              return (
                <div key={o.id} className="flex items-center justify-between py-1 border-b border-[#eaecee] last:border-b-0">
                  <div>
                    <span className="font-bold text-[#000000]">{o.customerName}</span>
                    <div className="text-[11px] text-[#475e75]">
                      {o.soNumber} ({o.customerPoNumber}) · Need: {formatIndoDate(o.needDate)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold tabular-nums text-[#000000]">
                      {totalDel.toLocaleString('id-ID')} / {totalOrd.toLocaleString('id-ID')} PCS
                    </span>
                    <div className="text-[11px] text-[#0057d2] font-semibold">{pct}% Terkirim</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Penjelasan Pemetaan Modul Final */}
      <div className="p-4 bg-[#f5f6f7] border border-[#d5dce2] rounded-[8px] flex items-start gap-3">
        <Info className="w-4 h-4 text-[#0057d2] shrink-0 mt-0.5" />
        <div className="text-[12px] text-[#475e75] leading-relaxed">
          <strong className="text-[#000000]">Catatan Desain Dashboard Manajemen: </strong>
          Tampilan di atas adalah representasi preview awal Phase 01 untuk memastikan kelima pilar operasional (Produksi per lane, Stok material, Stok FG multi-lokasi, Pengiriman, dan Piutang AR) dipetakan dengan benar tanpa tombol aksi edit/input atau modal transaksi, sesuai batasan role read-only pada BR-ROL-01.
        </div>
      </div>
    </div>
  );
};
