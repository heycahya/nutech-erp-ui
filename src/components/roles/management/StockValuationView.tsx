/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Halaman 2: Valuasi Stok Material & Finished Goods (Management Read-Only)
 * BRD §5.5 (BR-MAT-01 s/d BR-MAT-04), FEAT-WH-01, FEAT-WH-02, TBD-06
 * Tab Material & FG, kuantitas fisik, snapshot statis, dan empty/TBD state untuk valuasi nominal
 */

import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Layers,
  AlertCircle,
  Search,
  Filter,
  Warehouse,
  Coins,
  Info,
  Eye,
  X,
  FileQuestion,
  HelpCircle,
} from 'lucide-react';

interface MaterialStockRecord {
  code: string;
  name: string;
  category: string;
  location: string;
  uom: string;
  onHandQty: number;
  allocatedSpkQty: number;
  simulatedBufferDays: number;
  storageCondition: string;
}

interface FgStockRecord {
  partNumber: string;
  partDescription: string;
  category: string;
  lineEndQty: number; // Ujung Lini
  warehouseQty: number; // Gudang FG
  totalQtyPcs: number;
  defaultPackRatio: number;
  shippingAllocation: string;
}

const MATERIAL_STOCKS: MaterialStockRecord[] = [
  {
    code: 'MAT-EPDM-01',
    name: 'EPDM Synthetic Rubber Roll 3mm',
    category: 'Karet / Rubber',
    location: 'Gudang Material Rak A-01',
    uom: 'Kg',
    onHandQty: 840,
    allocatedSpkQty: 620,
    simulatedBufferDays: 14,
    storageCondition: 'Temperatur ruang < 28°C, terlindung UV',
  },
  {
    code: 'MAT-FOAM-PU10',
    name: 'PU Open-Cell Acoustic Foam Block',
    category: 'Busa / Foam',
    location: 'Gudang Material Rak B-04',
    uom: 'Mtr',
    onHandQty: 1250,
    allocatedSpkQty: 980,
    simulatedBufferDays: 14,
    storageCondition: 'Area kering, kelembaban < 65%',
  },
  {
    code: 'MAT-EVA-SP20',
    name: 'EVA High-Density Closed Cell Sheet',
    category: 'EVA Sponge',
    location: 'Gudang Material Pallet C-02',
    uom: 'Sheet',
    onHandQty: 950,
    allocatedSpkQty: 700,
    simulatedBufferDays: 14,
    storageCondition: 'Penyimpanan tumpuk maksimal 10 sheet',
  },
];

const FG_STOCKS: FgStockRecord[] = [
  {
    partNumber: 'NTC-RUB-0101',
    partDescription: 'Gasket Seal Cylinder Head EPDM',
    category: 'Karet / Rubber',
    lineEndQty: 1700,
    warehouseQty: 1000,
    totalQtyPcs: 2700,
    defaultPackRatio: 50,
    shippingAllocation: 'Alokasi Surat Jalan SJ-0092 (Draft)',
  },
  {
    partNumber: 'NTC-RUB-0104',
    partDescription: 'Bushing Engine Mount Anti-Vibration',
    category: 'Karet / Rubber',
    lineEndQty: 0,
    warehouseQty: 1800,
    totalQtyPcs: 1800,
    defaultPackRatio: 40,
    shippingAllocation: 'Siap alokasi PO baru',
  },
  {
    partNumber: 'NTC-FOAM-0201',
    partDescription: 'Acoustic Foam Barrier Firewall 10mm',
    category: 'Busa / Foam',
    lineEndQty: 0,
    warehouseQty: 200,
    totalQtyPcs: 200,
    defaultPackRatio: 25,
    shippingAllocation: 'Sisa stok buffer gudang',
  },
  {
    partNumber: 'NTC-EVA-0301',
    partDescription: 'EVA Sponge Weatherstrip Door Sash',
    category: 'EVA Sponge',
    lineEndQty: 2500,
    warehouseQty: 0,
    totalQtyPcs: 2500,
    defaultPackRatio: 100,
    shippingAllocation: 'Ujung Lini inspeksi QC',
  },
];

export const StockValuationView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'material' | 'fg'>('material');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMaterialDetail, setSelectedMaterialDetail] = useState<MaterialStockRecord | null>(null);
  const [selectedFgDetail, setSelectedFgDetail] = useState<FgStockRecord | null>(null);

  // Filter Material
  const filteredMaterials = useMemo(() => {
    return MATERIAL_STOCKS.filter(
      (m) =>
        m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Filter FG
  const filteredFg = useMemo(() => {
    return FG_STOCKS.filter(
      (f) =>
        f.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.partDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Total Kuantitas Fisik FG
  const totalLineEndPcs = FG_STOCKS.reduce((s, f) => s + f.lineEndQty, 0); // 4.200
  const totalWarehousePcs = FG_STOCKS.reduce((s, f) => s + f.warehouseQty, 0); // 3.000
  const totalFgPcs = totalLineEndPcs + totalWarehousePcs; // 7.200

  return (
    <div className="flex-1 overflow-y-auto bg-[#ffffff] p-6 pb-12 space-y-5">
      {/* 1. Header Informasi Halaman */}
      <div className="bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#545454] flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-[#0057d2]" />
              Executive Inventory Monitoring · BRD §5.5
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#edf7ed] text-[#10683b] border border-[#a5d6a7] rounded-[4px]">
              DATA KUANTITAS FISIK RESMI
            </span>
          </div>
          <h1 className="text-[18px] font-bold text-[#000000] mt-1 tracking-tight">
            Monitoring & Valuasi Stok Material & Finished Goods
          </h1>
          <p className="text-[11px] text-[#545454] mt-0.5">
            Audit saldo fisik bahan baku, saldo barang jadi multi-lokasi, dan status kebijakan valuasi nominal
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-bold px-3 py-1.5 bg-[#fff8e1] text-[#8d4b00] border border-[#ffd54f] rounded-[4px]">
          <span>HAK AKSES MURNI READ-ONLY (BR-ROL-01)</span>
        </div>
      </div>

      {/* 2. AREA VALUASI FINANSIAL PERSEDIAAN (TBD / EMPTY STATE TRANSPARAN) */}
      <div className="p-4 bg-[#f8f9fa] border border-dashed border-[#d5dce2] rounded-[4px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] text-[#8c9ba5] shrink-0">
            <Coins className="w-5 h-5 text-[#8c9ba5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-[#223548]">
                Area Valuasi Finansial Persediaan (Nominal Rupiah / COGS)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#f0f2f5] text-[#545454] border border-[#d5dce2] rounded-[4px]">
                PENDING (TBD)
              </span>
            </div>
            <p className="text-[11px] text-[#545454] mt-1 leading-relaxed max-w-[850px]">
              Perhitungan nominal saldo finansial (COGS, Standard Costing, dan Valuasi FIFO/Moving Average) <strong>belum dapat disajikan</strong> karena aturan standard costing baku dan formula harga satuan bahan belum disepakati resmi perusahaan. Sistem menyajikan murni <strong>kuantitas fisik (UoM/PCS)</strong> untuk menjaga integritas data tanpa angka rupiah fiktif.
            </p>
          </div>
        </div>
        <div className="shrink-0 text-[10px] text-[#8c9ba5] italic bg-[#ffffff] px-2.5 py-1 border border-[#eaecee] rounded-[4px]">
          Zero Fake Currency Policy
        </div>
      </div>

      {/* 3. Segmented Tab Control: Material vs Finished Goods */}
      <div className="flex items-center justify-between border-b border-[#d5dce2] pb-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('material');
              setSearchQuery('');
            }}
            className={`px-4 py-2.5 text-[12px] font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'material'
                ? 'border-[#0057d2] text-[#0057d2] bg-[#ffffff]'
                : 'border-transparent text-[#545454] hover:text-[#000000] hover:bg-[#f8f9fa]'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Material Inventory (Bahan Baku)</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-[#f0f2f5] text-[#475e75] rounded-[3px]">
              3 Jenis
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('fg');
              setSearchQuery('');
            }}
            className={`px-4 py-2.5 text-[12px] font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'fg'
                ? 'border-[#0057d2] text-[#0057d2] bg-[#ffffff]'
                : 'border-transparent text-[#545454] hover:text-[#000000] hover:bg-[#f8f9fa]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Finished Goods (Barang Jadi)</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-[#edf7ed] text-[#10683b] rounded-[3px]">
              7.200 PCS
            </span>
          </button>
        </div>

        {/* Input Pencarian Lokal */}
        <div className="relative w-[260px] pb-2">
          <Search className="w-3.5 h-3.5 text-[#545454] absolute left-2.5 top-1/2 -translate-y-1/2 -mt-1" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'material' ? 'Cari kode material...' : 'Cari part number FG...'}
            className="w-full h-[32px] pl-8 pr-3 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
          />
        </div>
      </div>

      {/* 4. TAB CONTENT: MATERIAL INVENTORY */}
      {activeTab === 'material' && (
        <div className="space-y-4">
          {/* Label Asumsi Snapshot Statis */}
          <div className="p-3 bg-[#fff8e1] border border-[#ffd54f]/60 rounded-[4px] text-[11px] text-[#8d4b00] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#8d4b00] shrink-0 mt-0.5" />
            <div className="leading-snug">
              <strong>Asumsi Data Simulasi Statis</strong> — Saldo fisik bahan baku di bawah ini merupakan data snapshot percontohan, bukan kartu stok ledger terotomasi.
              <div className="text-[10px] text-[#8d4b00] mt-0.5">
                Status kecukupan material eksak menunggu penetapan formula MRP resmi (TBD-06).
              </div>
            </div>
          </div>

          {/* Tabel Bahan Baku */}
          <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden bg-[#ffffff]">
            <div className="px-4 py-3 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-[#000000]">
                Daftar Saldo Fisik Bahan Baku (Gudang Material)
              </h3>
              <span className="text-[10px] text-[#545454]">
                Menampilkan <strong>{filteredMaterials.length}</strong> material
              </span>
            </div>

            <table className="w-full text-left text-[12px] border-collapse">
              <thead className="bg-[#ffffff] border-b border-[#d5dce2] text-[10px] font-bold text-[#545454] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Kode & Deskripsi Bahan</th>
                  <th className="py-2.5 px-4">Kategori Bahan</th>
                  <th className="py-2.5 px-4">Lokasi Fisik Gudang</th>
                  <th className="py-2.5 px-4 text-right">Saldo Fisik</th>
                  <th className="py-2.5 px-4 text-right">Alokasi SPK</th>
                  <th className="py-2.5 px-4 text-center">Status MRP</th>
                  <th className="py-2.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaecee]">
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[12px] text-[#545454]">
                      Tidak ada material yang sesuai dengan kata kunci pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map((mat) => (
                    <tr key={mat.code} className="hover:bg-[#f8f9fa] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-[#0057d2] text-[11px]">{mat.code}</div>
                        <div className="font-semibold text-[#1a1a1a] text-[11px] mt-0.5">{mat.name}</div>
                      </td>
                      <td className="py-3 px-4 text-[#475e75] font-medium text-[11px]">
                        {mat.category}
                      </td>
                      <td className="py-3 px-4 text-[#545454] text-[11px]">
                        {mat.location}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#000000] tabular-nums text-[12px]">
                        {mat.onHandQty.toLocaleString('id-ID')}{' '}
                        <span className="font-normal text-[#545454] text-[10px]">{mat.uom}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-[#475e75] tabular-nums text-[12px]">
                        {mat.allocatedSpkQty.toLocaleString('id-ID')}{' '}
                        <span className="font-normal text-[#545454] text-[10px]">{mat.uom}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-[#f0f2f5] text-[#475e75] border border-[#d5dce2] rounded-[4px]">
                          Pending (TBD-06)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedMaterialDetail(mat)}
                          className="px-2.5 py-1 text-[11px] font-medium text-[#0057d2] hover:text-[#0049b0] bg-[#ebf8ff] hover:bg-[#d0ebff] border border-[#0057d2]/30 rounded-[4px] cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Spesifikasi</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: FINISHED GOODS */}
      {activeTab === 'fg' && (
        <div className="space-y-4">
          {/* Label Snapshot Statis FG & 2 Lokasi Resmi */}
          <div className="p-3 bg-[#fff8e1] border border-[#ffd54f]/60 rounded-[4px] text-[11px] text-[#8d4b00] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#8d4b00] shrink-0 mt-0.5" />
            <div className="leading-snug">
              <strong>Asumsi Snapshot Simulasi Statis (Total 7.200 PCS)</strong> — Saldo fisik hanya dihitung pada 2 lokasi resmi terkonfirmasi: Ujung Lini Produksi (4.200 PCS) dan Gudang FG (3.000 PCS).
              <div className="text-[10px] text-[#8d4b00] mt-0.5 font-medium">
                Sesuai aturan BR-DEL-02, stok FG berkurang hanya ketika Surat Jalan berstatus Delivered.
              </div>
            </div>
          </div>

          {/* Ringkasan 2 Lokasi Fisik Resmi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#545454] block">
                Total Stok FG Fisik (On-Hand)
              </span>
              <span className="text-[20px] font-bold text-[#000000] tabular-nums mt-1 block">
                {totalFgPcs.toLocaleString('id-ID')}{' '}
                <span className="text-[12px] font-normal text-[#545454]">PCS</span>
              </span>
              <span className="text-[10px] text-[#10683b] font-medium">2 Lokasi Resmi Terkonfirmasi</span>
            </div>

            <div className="p-3.5 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#545454] block">
                Ujung Lini Produksi
              </span>
              <span className="text-[20px] font-bold text-[#000000] tabular-nums mt-1 block">
                {totalLineEndPcs.toLocaleString('id-ID')}{' '}
                <span className="text-[12px] font-normal text-[#545454]">PCS</span>
              </span>
              <span className="text-[10px] text-[#545454]">Output QC Drop Zone (Siap Ambil)</span>
            </div>

            <div className="p-3.5 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#545454] block">
                Gudang FG (Rak Penyimpanan)
              </span>
              <span className="text-[20px] font-bold text-[#000000] tabular-nums mt-1 block">
                {totalWarehousePcs.toLocaleString('id-ID')}{' '}
                <span className="text-[12px] font-normal text-[#545454]">PCS</span>
              </span>
              <span className="text-[10px] text-[#545454]">Pallet rak penyimpanan barang jadi</span>
            </div>
          </div>

          {/* Tabel Detail Part FG */}
          <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden bg-[#ffffff]">
            <div className="px-4 py-3 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-[#000000]">
                Rincian Saldo Barang Jadi per Part & Lokasi Fisik
              </h3>
              <span className="text-[10px] text-[#545454]">
                Menampilkan <strong>{filteredFg.length}</strong> part komponen
              </span>
            </div>

            <table className="w-full text-left text-[12px] border-collapse">
              <thead className="bg-[#ffffff] border-b border-[#d5dce2] text-[10px] font-bold text-[#545454] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Part Number & Deskripsi</th>
                  <th className="py-2.5 px-4">Kategori Part</th>
                  <th className="py-2.5 px-4 text-right">Rasio Pack</th>
                  <th className="py-2.5 px-4 text-right">Ujung Lini</th>
                  <th className="py-2.5 px-4 text-right">Gudang FG</th>
                  <th className="py-2.5 px-4 text-right">Total Fisik</th>
                  <th className="py-2.5 px-4">Status Alokasi Pengiriman</th>
                  <th className="py-2.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaecee]">
                {filteredFg.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[12px] text-[#545454]">
                      Tidak ada part barang jadi yang sesuai filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredFg.map((fg) => (
                    <tr key={fg.partNumber} className="hover:bg-[#f8f9fa] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-[#0057d2] text-[11px]">
                          {fg.partNumber}
                        </div>
                        <div className="font-semibold text-[#1a1a1a] text-[11px] mt-0.5">
                          {fg.partDescription}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#475e75] font-medium text-[11px]">
                        {fg.category}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-[11px] text-[#545454]">
                        {fg.defaultPackRatio} PCS/pack
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-[#000000] tabular-nums text-[12px]">
                        {fg.lineEndQty.toLocaleString('id-ID')} PCS
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-[#000000] tabular-nums text-[12px]">
                        {fg.warehouseQty.toLocaleString('id-ID')} PCS
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#10683b] tabular-nums text-[13px]">
                        {fg.totalQtyPcs.toLocaleString('id-ID')} PCS
                      </td>
                      <td className="py-3 px-4 text-[11px] text-[#545454]">
                        {fg.shippingAllocation}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedFgDetail(fg)}
                          className="px-2.5 py-1 text-[11px] font-medium text-[#0057d2] hover:text-[#0049b0] bg-[#ebf8ff] hover:bg-[#d0ebff] border border-[#0057d2]/30 rounded-[4px] cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Detail Modal Dialog untuk Material */}
      {selectedMaterialDetail && (
        <div className="fixed inset-0 z-50 bg-[#000000]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-xl w-full max-w-[500px] overflow-hidden">
            <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#0057d2] uppercase tracking-wider block">
                  Spesifikasi Material Baku · Read-Only
                </span>
                <h3 className="text-[14px] font-bold text-[#000000] mt-0.5">
                  {selectedMaterialDetail.code} — {selectedMaterialDetail.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMaterialDetail(null)}
                className="p-1 text-[#545454] hover:text-[#000000] rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-[12px]">
              <div className="p-3 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#545454]">Kategori:</span>
                  <span className="font-bold text-[#000000]">{selectedMaterialDetail.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#545454]">Lokasi Penyimpanan:</span>
                  <span className="font-medium text-[#000000]">{selectedMaterialDetail.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#545454]">Kondisi Gudang:</span>
                  <span className="text-[#475e75]">{selectedMaterialDetail.storageCondition}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
                  <span className="text-[10px] text-[#545454] block">Saldo Fisik On-Hand</span>
                  <span className="text-[16px] font-bold text-[#000000] tabular-nums">
                    {selectedMaterialDetail.onHandQty} {selectedMaterialDetail.uom}
                  </span>
                </div>
                <div className="p-2.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
                  <span className="text-[10px] text-[#545454] block">Alokasi SPK Berjalan</span>
                  <span className="text-[16px] font-bold text-[#0057d2] tabular-nums">
                    {selectedMaterialDetail.allocatedSpkQty} {selectedMaterialDetail.uom}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-[#f5f6f7] border-t border-[#d5dce2] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedMaterialDetail(null)}
                className="px-4 py-1.5 text-[11px] font-semibold text-[#223548] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Detail Modal Dialog untuk FG */}
      {selectedFgDetail && (
        <div className="fixed inset-0 z-50 bg-[#000000]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-xl w-full max-w-[500px] overflow-hidden">
            <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#0057d2] uppercase tracking-wider block">
                  Detail Saldo Barang Jadi (FG) · Read-Only
                </span>
                <h3 className="text-[14px] font-bold text-[#000000] mt-0.5">
                  {selectedFgDetail.partNumber} — {selectedFgDetail.partDescription}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFgDetail(null)}
                className="p-1 text-[#545454] hover:text-[#000000] rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-[12px]">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
                  <span className="text-[10px] text-[#545454] block">Ujung Lini (QC Zone)</span>
                  <span className="text-[16px] font-bold text-[#000000] tabular-nums">
                    {selectedFgDetail.lineEndQty.toLocaleString('id-ID')} PCS
                  </span>
                </div>
                <div className="p-2.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
                  <span className="text-[10px] text-[#545454] block">Gudang FG (Rak)</span>
                  <span className="text-[16px] font-bold text-[#000000] tabular-nums">
                    {selectedFgDetail.warehouseQty.toLocaleString('id-ID')} PCS
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#545454]">Total Stok Fisik:</span>
                  <span className="font-bold text-[#10683b]">{selectedFgDetail.totalQtyPcs.toLocaleString('id-ID')} PCS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#545454]">Standar Kemasan:</span>
                  <span className="font-medium text-[#000000]">{selectedFgDetail.defaultPackRatio} PCS/pack</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#545454]">Alokasi:</span>
                  <span className="text-[#0057d2] font-medium">{selectedFgDetail.shippingAllocation}</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-[#f5f6f7] border-t border-[#d5dce2] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedFgDetail(null)}
                className="px-4 py-1.5 text-[11px] font-semibold text-[#223548] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
