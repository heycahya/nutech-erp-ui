/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Modul Produksi: Stok Multi-Lokasi Finished Goods (FG) (Admin Operasional)
 * BRD §5.5, BR-DEL-02, BR-ROL-02
 */

import React, { useState } from 'react';
import {
  Layers,
  Search,
  Warehouse,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Info,
  Clock,
  ArrowRight,
  Send,
} from 'lucide-react';
import { FinishedGoodStock, FgStockMovement } from '../../../types/erp';

interface FinishedGoodsStockViewProps {
  fgStocks: FinishedGoodStock[];
  fgMovements: FgStockMovement[];
  onNavigateTab?: (tabId: string) => void;
}

export const FinishedGoodsStockView: React.FC<FinishedGoodsStockViewProps> = ({
  fgStocks,
  fgMovements,
  onNavigateTab,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const totalLineEnd = fgStocks.reduce((s, f) => s + f.lineEndQty, 0); // 4.200
  const totalWarehouse = fgStocks.reduce((s, f) => s + f.warehouseQty, 0); // 3.000
  const totalFg = totalLineEnd + totalWarehouse; // 7.200

  const filteredStocks = fgStocks.filter(
    (f) =>
      f.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.partDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#ffffff] p-6 space-y-5">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d5dce2] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#eaf6ef] text-[#10683b] border border-[#10683b]/20 rounded-[4px] uppercase tracking-wider">
              BRD §5.5 · 2 LOKASI FISIK RESMI
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#f0f2f5] text-[#475e75] border border-[#d5dce2] rounded-[4px]">
              TOTAL ON-HAND: {totalFg.toLocaleString('id-ID')} PCS
            </span>
          </div>
          <h1 className="text-[20px] font-bold text-[#000000] tracking-tight">
            Persediaan Fisik Barang Jadi (Finished Goods Multi-Lokasi)
          </h1>
          <p className="text-[12px] text-[#545454] mt-0.5">
            Saldo on-hand resmi barang jadi pada dua titik fisik: Ujung Lini Produksi dan Gudang FG. Terhubung langsung dengan pemotongan Surat Jalan Delivered.
          </p>
        </div>

        {onNavigateTab && (
          <button
            type="button"
            onClick={() => onNavigateTab('del-sj-list')}
            className="px-3.5 py-2 text-[12px] font-bold text-white bg-[#0057d2] hover:bg-[#0049b0] rounded-[4px] flex items-center gap-1.5 shadow-none cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
            Alokasi Surat Jalan
          </button>
        )}
      </div>

      {/* 2. Banner Peraturan Lokasi Fisik */}
      <div className="p-3.5 bg-[#fff8e1] border border-[#ffd54f]/80 rounded-[4px] text-[11px] text-[#8d4b00] flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-[#8d4b00] shrink-0 mt-0.5" />
        <div className="leading-snug">
          <strong className="font-bold text-[#000000]">
            Aturan Baku Lokasi Persediaan FG (BRD §5.5 & BR-DEL-02):
          </strong>
          <div className="mt-0.5">
            Dua lokasi resmi Finished Goods adalah <strong>Ujung Lini Produksi</strong> dan <strong>Gudang FG</strong>. <em>Staging Area</em> bukan lokasi persediaan resmi. Saldo FG berkurang <strong>hanya</strong> saat Surat Jalan dikonfirmasi berstatus <strong>Delivered</strong> setelah penerimaan fisik di pelanggan.
          </div>
        </div>
      </div>

      {/* 3. Kartu Ringkasan 2 Lokasi Fisik Resmi */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total FG */}
        <div className="p-4 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
          <span className="text-[10px] font-bold text-[#545454] uppercase tracking-wider block">
            Total Stok Fisik FG (On-Hand)
          </span>
          <div className="text-[24px] font-bold text-[#000000] tabular-nums mt-0.5">
            {totalFg.toLocaleString('id-ID')}{' '}
            <span className="text-[13px] font-normal text-[#545454]">PCS</span>
          </div>
          <div className="text-[10px] text-[#10683b] font-semibold mt-1">
            Konsisten dengan Domain 3 Management
          </div>
        </div>

        {/* Lokasi 1: Ujung Lini */}
        <div className="p-4 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
          <div className="flex items-center justify-between text-[#545454] text-[10px] font-bold uppercase tracking-wider mb-1">
            <span>Ujung Lini Produksi</span>
            <Layers className="w-4 h-4 text-[#0057d2]" />
          </div>
          <div className="text-[24px] font-bold text-[#0057d2] tabular-nums">
            {totalLineEnd.toLocaleString('id-ID')}{' '}
            <span className="text-[13px] font-normal text-[#545454]">PCS</span>
          </div>
          <div className="text-[10px] text-[#545454] mt-1">
            Line-End Conveyor / QC Drop Zone (Lane 1-3)
          </div>
        </div>

        {/* Lokasi 2: Gudang FG */}
        <div className="p-4 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
          <div className="flex items-center justify-between text-[#545454] text-[10px] font-bold uppercase tracking-wider mb-1">
            <span>Gudang Finished Goods (FG)</span>
            <Warehouse className="w-4 h-4 text-[#10683b]" />
          </div>
          <div className="text-[24px] font-bold text-[#10683b] tabular-nums">
            {totalWarehouse.toLocaleString('id-ID')}{' '}
            <span className="text-[13px] font-normal text-[#545454]">PCS</span>
          </div>
          <div className="text-[10px] text-[#545454] mt-1">
            Finished Goods Racks & Storage Pallet
          </div>
        </div>
      </div>

      {/* 4. Filter Bar */}
      <div className="flex items-center justify-between bg-[#f8f9fa] border border-[#d5dce2] p-3 rounded-[4px]">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#545454] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari part number, deskripsi, kategori..."
            className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
          />
        </div>
        <div className="text-[11px] text-[#545454]">
          Daftar Saldo Per Part Komponen
        </div>
      </div>

      {/* 5. Tabel Saldo FG Per Part */}
      <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="bg-[#f5f6f7] border-b border-[#d5dce2] text-[10px] font-bold text-[#545454] uppercase tracking-wider">
              <th className="py-2.5 px-4">Part Number & Deskripsi</th>
              <th className="py-2.5 px-4">Kategori</th>
              <th className="py-2.5 px-4 text-right">Ujung Lini (PCS)</th>
              <th className="py-2.5 px-4 text-right">Gudang FG (PCS)</th>
              <th className="py-2.5 px-4 text-right">Total Saldo On-Hand</th>
              <th className="py-2.5 px-4">Alokasi & Status Pengiriman</th>
              <th className="py-2.5 px-4">Terakhir Diperbarui</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eaecee]">
            {filteredStocks.map((stock) => (
              <tr key={stock.id} className="hover:bg-[#f8f9fa] transition-colors">
                <td className="py-3 px-4">
                  <div className="font-mono font-bold text-[#0057d2] text-[11px]">
                    {stock.partNumber}
                  </div>
                  <div className="font-medium text-[#1a1a1a] truncate max-w-xs">
                    {stock.partDescription}
                  </div>
                </td>
                <td className="py-3 px-4 text-[#545454]">
                  {stock.category}
                </td>
                <td className="py-3 px-4 text-right font-bold text-[#0057d2] tabular-nums">
                  {stock.lineEndQty.toLocaleString('id-ID')}
                </td>
                <td className="py-3 px-4 text-right font-bold text-[#10683b] tabular-nums">
                  {stock.warehouseQty.toLocaleString('id-ID')}
                </td>
                <td className="py-3 px-4 text-right font-bold text-[#000000] tabular-nums text-[12px]">
                  {(stock.lineEndQty + stock.warehouseQty).toLocaleString('id-ID')} PCS
                </td>
                <td className="py-3 px-4 text-[10px] text-[#475e75]">
                  {stock.shippingAllocation || 'Siap alokasi'}
                </td>
                <td className="py-3 px-4 text-[10px] text-[#788896] font-mono">
                  {stock.lastUpdated || '2026-11-04 08:00'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 6. Riwayat Pergerakan Fisik FG */}
      <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden">
        <div className="px-4 py-2.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
          <h3 className="text-[12px] font-bold text-[#000000]">
            Log Mutasi Fisik Finished Goods (Audit Trail)
          </h3>
          <span className="text-[10px] text-[#545454]">Tercatat di Ledger Pengiriman</span>
        </div>
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="bg-[#ffffff] border-b border-[#d5dce2] text-[10px] font-bold text-[#545454] uppercase tracking-wider">
              <th className="py-2 px-3">Waktu</th>
              <th className="py-2 px-3">Tipe Mutasi</th>
              <th className="py-2 px-3">Ref Dokumen</th>
              <th className="py-2 px-3">Part Komponen</th>
              <th className="py-2 px-3">Lokasi Fisik</th>
              <th className="py-2 px-3 text-right">Mutasi (+/-)</th>
              <th className="py-2 px-3 text-right">Saldo Sesudah</th>
              <th className="py-2 px-3">Otorisasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eaecee]">
            {fgMovements.map((mov) => (
              <tr key={mov.id} className="hover:bg-[#f8f9fa]">
                <td className="py-2 px-3 font-mono text-[10px] text-[#545454]">
                  {mov.timestamp}
                </td>
                <td className="py-2 px-3">
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#f0f2f5] text-[#354a5f] rounded-[3px]">
                    {mov.movementType}
                  </span>
                </td>
                <td className="py-2 px-3 font-mono font-bold text-[#0057d2]">
                  {mov.referenceNumber}
                </td>
                <td className="py-2 px-3">
                  <span className="font-mono text-[#000000]">{mov.partNumber}</span>
                </td>
                <td className="py-2 px-3 text-[#545454]">
                  {mov.sourceLocation}
                </td>
                <td className="py-2 px-3 text-right font-bold tabular-nums">
                  {mov.qtyChange < 0 ? (
                    <span className="text-[#c53929]">{mov.qtyChange.toLocaleString('id-ID')} PCS</span>
                  ) : (
                    <span className="text-[#10683b]">+{mov.qtyChange.toLocaleString('id-ID')} PCS</span>
                  )}
                </td>
                <td className="py-2 px-3 text-right font-bold tabular-nums text-[#000000]">
                  {mov.balanceAfter.toLocaleString('id-ID')} PCS
                </td>
                <td className="py-2 px-3 text-[10px] text-[#545454]">
                  {mov.authorizedBy}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
