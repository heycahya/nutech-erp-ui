/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Domain 3: Finished Goods Warehouse Card (FEAT-DSH-01, FEAT-WH-02, BRD §5.5, BR-MAT-02, BR-DEL-02)
 * Saldo fisik 2 lokasi resmi terkonfirmasi dengan label asumsi snapshot simulasi statis
 */

import React from 'react';
import { Layers, AlertCircle, Warehouse, ArrowDownRight } from 'lucide-react';

interface FgLocationStock {
  locationName: string;
  locationType: string;
  qtyPcs: number;
  description: string;
  isConfirmed: boolean;
}

const FG_LOCATIONS: FgLocationStock[] = [
  {
    locationName: 'Ujung Lini Produksi',
    locationType: 'Line-End Conveyor / QC Drop Zone (Lane 1-3)',
    qtyPcs: 4200,
    description: 'Output produksi lolos QC menunggu pemindahan atau pengiriman langsung',
    isConfirmed: true,
  },
  {
    locationName: 'Gudang FG',
    locationType: 'Finished Goods Racks & Storage Pallet',
    qtyPcs: 3000,
    description: 'Rak penyimpanan barang jadi siap muat dan alokasi Surat Jalan',
    isConfirmed: true,
  },
];

export const FinishedGoodsCard: React.FC = () => {
  const totalFgStock = FG_LOCATIONS.reduce((acc, l) => acc + l.qtyPcs, 0); // 7.200 PCS

  return (
    <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] overflow-hidden flex flex-col justify-between shadow-none">
      {/* Header */}
      <div>
        <div className="px-4 py-3 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0057d2]" />
            <h3 className="text-[13px] font-bold text-[#000000]">
              Domain 3: Stok Barang Jadi (Finished Goods)
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-[#ffffff] border border-[#d5dce2] text-[#475e75] rounded-[4px]">
            2 LOKASI RESMI TERKONFIRMASI
          </span>
        </div>

        {/* Wajib: Label Asumsi Snapshot Simulasi Statis */}
        <div className="p-3 bg-[#fff8e1] border-b border-[#ffd54f]/60 text-[11px] text-[#8d4b00] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[#8d4b00] shrink-0 mt-0.5" />
          <div className="leading-snug">
            <strong>Asumsi Snapshot Simulasi Statis</strong> — Stok fisik on-hand saat ini.
            <div className="text-[10px] text-[#8d4b00] mt-0.5 font-medium">
              Rekonsiliasi mutasi persediaan dengan transaksi Surat Jalan menunggu modul kartu stok (TBD).
            </div>
          </div>
        </div>

        {/* Total Saldo FG & Rincian Lokasi */}
        <div className="p-4 space-y-3.5">
          {/* Card Total Ringkasan */}
          <div className="p-3 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px] flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#545454]">
                Total Stok Fisik FG (On-Hand)
              </div>
              <div className="text-[20px] font-bold text-[#000000] tabular-nums leading-none mt-1">
                {totalFgStock.toLocaleString('id-ID')}{' '}
                <span className="text-[12px] font-normal text-[#545454]">PCS</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#edf7ed] text-[#10683b] border border-[#a5d6a7] rounded-[4px]">
                Multi-Lokasi Resmi
              </span>
              <div className="text-[10px] text-[#545454] mt-1">Tanpa Wajib Transit Gudang</div>
            </div>
          </div>

          {/* Rincian 2 Lokasi Resmi */}
          <div className="space-y-2">
            {FG_LOCATIONS.map((loc) => (
              <div
                key={loc.locationName}
                className="p-2.5 bg-[#ffffff] border border-[#eaecee] rounded-[4px] flex items-center justify-between hover:border-[#0057d2]/30 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <Warehouse className="w-3.5 h-3.5 text-[#0057d2] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] font-bold text-[#000000]">{loc.locationName}</div>
                    <div className="text-[10px] text-[#545454]">{loc.locationType}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[13px] font-bold text-[#000000] tabular-nums">
                    {loc.qtyPcs.toLocaleString('id-ID')} <span className="text-[10px] font-normal text-[#545454]">PCS</span>
                  </div>
                  <div className="text-[9px] text-[#10683b] font-medium">Terverifikasi BRD §5.5</div>
                </div>
              </div>
            ))}
          </div>

          {/* Catatan Bisnis Pemotongan Stok */}
          <div className="p-2.5 bg-[#f0f4f8] border border-[#d5dce2] rounded-[4px] text-[10px] text-[#223548] flex items-start gap-2">
            <ArrowDownRight className="w-3.5 h-3.5 text-[#0057d2] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Ketentuan Pemotongan Stok (BR-DEL-02):</strong> Stok barang jadi hanya berkurang ketika status Surat Jalan dikonfirmasi menjadi <strong>Delivered</strong>. Status Draft dan Printed tidak memotong stok.
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2.5 bg-[#f8f9fa] border-t border-[#d5dce2] text-[10px] text-[#545454] flex items-center justify-between">
        <span>Staging Area tidak dihitung sebagai saldo resmi (TBD)</span>
        <span className="font-semibold text-[#10683b]">100% Sesuai Spesifikasi Fisik</span>
      </div>
    </div>
  );
};
