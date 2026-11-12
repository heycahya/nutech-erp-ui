/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Domain 2: Material Inventory Card (FEAT-DSH-01, FEAT-WH-01, BRD §5.5, TBD-06)
 * Menyajikan saldo fisik bahan baku & kebutuhan operasional dengan label asumsi simulasi statis tegas
 */

import React from 'react';
import { Boxes, AlertCircle, Layers } from 'lucide-react';

interface MaterialStockItem {
  code: string;
  name: string;
  category: string;
  uom: string;
  onHandQty: number;
  allocatedSpkQty: number;
  simulatedBufferDays: number;
}

const MATERIAL_DATA: MaterialStockItem[] = [
  {
    code: 'MAT-EPDM-01',
    name: 'EPDM Synthetic Rubber Roll 3mm',
    category: 'Karet / Rubber',
    uom: 'Kg',
    onHandQty: 840,
    allocatedSpkQty: 620,
    simulatedBufferDays: 14,
  },
  {
    code: 'MAT-FOAM-PU10',
    name: 'PU Open-Cell Acoustic Foam Block',
    category: 'Busa / Foam',
    uom: 'Mtr',
    onHandQty: 1250,
    allocatedSpkQty: 980,
    simulatedBufferDays: 14,
  },
  {
    code: 'MAT-EVA-SP20',
    name: 'EVA High-Density Closed Cell Sheet',
    category: 'EVA Sponge',
    uom: 'Sheet',
    onHandQty: 950,
    allocatedSpkQty: 700,
    simulatedBufferDays: 14,
  },
];

import { RawMaterial } from '../../../types/erp';

interface MaterialInventoryCardProps {
  materials?: RawMaterial[];
}

export const MaterialInventoryCard: React.FC<MaterialInventoryCardProps> = ({ materials }) => {
  // If dynamic materials passed, use them; otherwise fallback to baseline MATERIAL_DATA
  const items = materials && materials.length > 0 ? materials.map(m => ({
    code: m.code,
    name: m.name,
    category: m.category,
    uom: m.usageUom,
    onHandQty: m.onHandQty,
    allocatedSpkQty: m.allocatedSpkQty,
    simulatedBufferDays: 14,
  })) : MATERIAL_DATA;

  return (
    <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] overflow-hidden flex flex-col justify-between shadow-none">
      {/* Header */}
      <div>
        <div className="px-4 py-3 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-[#0057d2]" />
            <h3 className="text-[13px] font-bold text-[#000000]">
              Domain 2: Stok Bahan Baku & Kebutuhan SPK
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-[#ffffff] border border-[#d5dce2] text-[#475e75] rounded-[4px]">
            3 KATEGORI BAHAN
          </span>
        </div>

        {/* Wajib: Label Asumsi Data Simulasi Statis & Status TBD-06 */}
        <div className="p-3 bg-[#fff8e1] border-b border-[#ffd54f]/60 text-[11px] text-[#8d4b00] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[#8d4b00] shrink-0 mt-0.5" />
          <div className="leading-snug">
            <strong>Asumsi Data Simulasi Statis</strong> — Bukan stok aktual yang telah direkonsiliasi.
            <div className="text-[10px] text-[#8d4b00] mt-0.5 font-medium">
              Formula kalkulasi shortage definitif & safety buffer menunggu kesepakatan bisnis resmi (TBD-06).
            </div>
          </div>
        </div>

        {/* Tabel Data Saldo Bahan Baku */}
        <div className="p-4 space-y-3">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-[#d5dce2] text-[10px] font-bold text-[#545454] uppercase tracking-wider">
                <th className="pb-2">Kode & Bahan Baku</th>
                <th className="pb-2 text-right">Saldo Fisik</th>
                <th className="pb-2 text-right">Kebutuhan SPK</th>
                <th className="pb-2 text-center">Status MRP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaecee]">
              {items.map((mat) => (
                <tr key={mat.code} className="hover:bg-[#f8f9fa] transition-colors">
                  <td className="py-2.5 pr-2">
                    <div className="font-mono font-bold text-[#0057d2] text-[10px]">{mat.code}</div>
                    <div className="font-semibold text-[#1a1a1a] truncate max-w-[200px]" title={mat.name}>
                      {mat.name}
                    </div>
                    <div className="text-[9px] text-[#545454]">{mat.category}</div>
                  </td>
                  <td className="py-2.5 text-right font-bold text-[#000000] tabular-nums whitespace-nowrap">
                    {mat.onHandQty.toLocaleString('id-ID')} <span className="font-normal text-[#545454] text-[10px]">{mat.uom}</span>
                  </td>
                  <td className="py-2.5 text-right font-medium text-[#475e75] tabular-nums whitespace-nowrap">
                    {mat.allocatedSpkQty.toLocaleString('id-ID')} <span className="font-normal text-[#545454] text-[10px]">{mat.uom}</span>
                  </td>
                  <td className="py-2.5 text-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[#f0f2f5] text-[#475e75] border border-[#d5dce2] rounded-[4px] whitespace-nowrap">
                      Pending (TBD-06)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2.5 bg-[#f8f9fa] border-t border-[#d5dce2] text-[10px] text-[#545454] flex items-center justify-between">
        <span>Asumsi Model: Buffer simulasi 14 hari kerja</span>
        <span className="font-semibold text-[#0057d2]">Zero-Negative Policy (BR-MAT-02)</span>
      </div>
    </div>
  );
};
