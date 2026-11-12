/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Halaman 1: Monitoring Produksi Lini (Management Read-Only)
 * BRD §2.1, §5.3 (BR-SPK, BR-PR-01 s/d BR-PR-05), FEAT-PRD-01
 * Menampilkan ringkasan target, aktual produksi, gap baku, konversi pack-to-PCS, dan filter interaktif
 */

import React, { useState, useMemo } from 'react';
import {
  Factory,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Info,
  Calendar,
  Clock,
  Layers,
  Eye,
  X,
  MinusCircle,
} from 'lucide-react';
import {
  calculateProductionGap,
  calculateProductionAchievement,
  calculatePackToPcs,
} from '../../../utils/logic';

interface ProductionBatchRecord {
  id: string;
  spkNumber: string;
  laneId: 'lane-1' | 'lane-2' | 'lane-3';
  laneName: string;
  shift: string;
  date: string;
  partNumber: string;
  partDescription: string;
  packRatio: number;
  packCount: number;
  targetPcs: number;
  actualPcs: number;
  operatorGroup: string;
  machineStatus: string;
  qcStatusNotes: string;
}

const PRODUCTION_RECORDS: ProductionBatchRecord[] = [
  {
    id: 'pr-101',
    spkNumber: 'SPK-2026-11-001',
    laneId: 'lane-1',
    laneName: 'Lini 1: Rubber Cutting',
    shift: 'Shift 1 (08:00 - 16:00)',
    date: '2026-11-04',
    partNumber: 'NTC-RUB-0101',
    partDescription: 'Gasket Seal Cylinder Head EPDM',
    packRatio: 50,
    packCount: 64, // 64 x 50 = 3.200 PCS
    targetPcs: 3300,
    actualPcs: 3200,
    operatorGroup: 'Regu A (Operator: Joko & Supri)',
    machineStatus: 'Normal · Kalibrasi pisau potong berkala',
    qcStatusNotes: 'Menunggu proses sampling QC fisik (Belum otomatis FG)',
  },
  {
    id: 'pr-102',
    spkNumber: 'SPK-2026-11-002',
    laneId: 'lane-2',
    laneName: 'Lini 2: Foam Slicing',
    shift: 'Shift 1 (08:00 - 16:00)',
    date: '2026-11-04',
    partNumber: 'NTC-FOAM-0201',
    partDescription: 'Acoustic Foam Barrier Firewall 10mm',
    packRatio: 25,
    packCount: 100, // 100 x 25 = 2.500 PCS
    targetPcs: 2500,
    actualPcs: 2500,
    operatorGroup: 'Regu B (Operator: Hendra & Dedi)',
    machineStatus: 'Optimal · Kecepatan konveyor stabil',
    qcStatusNotes: 'Menunggu verifikasi ketebalan busa QC (Belum otomatis FG)',
  },
  {
    id: 'pr-103',
    spkNumber: 'SPK-2026-11-003',
    laneId: 'lane-3',
    laneName: 'Lini 3: EVA Die-cut',
    shift: 'Shift 1 (08:00 - 16:00)',
    date: '2026-11-04',
    partNumber: 'NTC-EVA-0301',
    partDescription: 'EVA Sponge Weatherstrip Door Sash',
    packRatio: 100,
    packCount: 10.5, // 10.5 pack x 100 = 1.050 PCS
    targetPcs: 1000,
    actualPcs: 1050,
    operatorGroup: 'Regu C (Operator: Rudi & Asep)',
    machineStatus: 'High Output · Matriks press presisi prima',
    qcStatusNotes: 'Menunggu stamping release QC (Belum otomatis FG)',
  },
];

export const ProductionMonitoringView: React.FC = () => {
  const [selectedLaneFilter, setSelectedLaneFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<ProductionBatchRecord | null>(null);

  // Filter records secara lokal
  const filteredRecords = useMemo(() => {
    return PRODUCTION_RECORDS.filter((rec) => {
      const matchLane = selectedLaneFilter === 'all' || rec.laneId === selectedLaneFilter;
      const matchSearch =
        rec.spkNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.partDescription.toLowerCase().includes(searchQuery.toLowerCase());
      return matchLane && matchSearch;
    });
  }, [selectedLaneFilter, searchQuery]);

  // Kalkulasi ringkasan agregat
  const totalTarget = PRODUCTION_RECORDS.reduce((s, r) => s + r.targetPcs, 0); // 6.800
  const totalActual = PRODUCTION_RECORDS.reduce((s, r) => s + r.actualPcs, 0); // 6.750
  const totalGap = calculateProductionGap(totalTarget, totalActual); // +50
  const totalAchievement = calculateProductionAchievement(totalActual, totalTarget); // 99.26%

  return (
    <div className="flex-1 overflow-y-auto bg-[#ffffff] p-6 pb-12 space-y-5">
      {/* 1. Header Informasi Halaman */}
      <div className="bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#545454] flex items-center gap-1.5">
              <Factory className="w-3.5 h-3.5 text-[#0057d2]" />
              Executive Operational Monitoring · BRD §5.3
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#edf7ed] text-[#10683b] border border-[#a5d6a7] rounded-[4px]">
              3 LINI AKTIF TERKONFIRMASI
            </span>
          </div>
          <h1 className="text-[18px] font-bold text-[#000000] mt-1 tracking-tight">
            Monitoring Kinerja Produksi Lini Manufaktur
          </h1>
          <p className="text-[11px] text-[#545454] mt-0.5">
            Audit kuota harian SPK, konversi Pack-to-PCS, gap output per lini, dan status kesiapan QC
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-bold px-3 py-1.5 bg-[#fff8e1] text-[#8d4b00] border border-[#ffd54f] rounded-[4px]">
          <span>HAK AKSES MURNI READ-ONLY (BR-ROL-01)</span>
        </div>
      </div>

      {/* 2. Peringatan Disiplin Operasional (Aktual != Otomatis QC Passed / FG) */}
      <div className="p-3.5 bg-[#f0f4f8] border border-[#d5dce2] rounded-[4px] text-[11px] text-[#223548] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#0057d2] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-[#000000]">Ketentuan Alur Manufaktur (BRD §5.4 & BR-QC-01): </strong>
          Kuantitas Aktual Produksi yang dicatat operator di lini perakitan <strong>bukan merupakan stok barang jadi (FG)</strong> dan <strong>belum tentu 100% lolos QC</strong>. Output lini harus melewati sampling inspeksi fisik QC sebelum diterbitkan status transfer ke gudang FG atau alokasi Surat Jalan.
        </div>
      </div>

      {/* 3. Kartu Ringkasan Agregat Pabrik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-3.5 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#545454] block">
            Target SPK Harian (Pabrik)
          </span>
          <span className="text-[20px] font-bold text-[#000000] tabular-nums mt-1 block">
            {totalTarget.toLocaleString('id-ID')}{' '}
            <span className="text-[12px] font-normal text-[#545454]">PCS</span>
          </span>
          <span className="text-[10px] text-[#545454]">Terkunci per SPK bulanan</span>
        </div>

        <div className="p-3.5 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#545454] block">
            Aktual Produksi Fisik
          </span>
          <span className="text-[20px] font-bold text-[#000000] tabular-nums mt-1 block">
            {totalActual.toLocaleString('id-ID')}{' '}
            <span className="text-[12px] font-normal text-[#545454]">PCS</span>
          </span>
          <span className="text-[10px] text-[#545454]">Akumulasi 3 lini manufaktur</span>
        </div>

        <div className="p-3.5 bg-[#f8f9fa] border border-[#ffd54f]/80 bg-[#fffdfa] rounded-[4px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8d4b00] block">
            Gap Produksi Agregat
          </span>
          <span className="text-[20px] font-bold text-[#8d4b00] tabular-nums mt-1 block">
            +{totalGap} <span className="text-[12px] font-normal text-[#8d4b00]">PCS (Defisit)</span>
          </span>
          <span className="text-[10px] text-[#8d4b00]">Formula: Target - Aktual</span>
        </div>

        <div className="p-3.5 bg-[#f8f9fa] border border-[#a5d6a7]/80 bg-[#fafffa] rounded-[4px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#10683b] block">
            Pencapaian Pabrik
          </span>
          <span className="text-[20px] font-bold text-[#10683b] tabular-nums mt-1 block">
            {totalAchievement}%
          </span>
          <span className="text-[10px] text-[#10683b]">Output / Target × 100</span>
        </div>
      </div>

      {/* 4. Toolbar Filter Interaktif & Pencarian */}
      <div className="bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#545454] mr-1">
            <Filter className="w-3.5 h-3.5 text-[#0057d2]" />
            <span>Filter Lini:</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSelectedLaneFilter('all')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-[4px] border transition-colors cursor-pointer ${
                selectedLaneFilter === 'all'
                  ? 'bg-[#0057d2] text-[#ffffff] border-[#0057d2] font-semibold'
                  : 'bg-[#ffffff] text-[#223548] border-[#d5dce2] hover:bg-[#eaecee]'
              }`}
            >
              Semua Lini (3)
            </button>
            <button
              type="button"
              onClick={() => setSelectedLaneFilter('lane-1')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-[4px] border transition-colors cursor-pointer ${
                selectedLaneFilter === 'lane-1'
                  ? 'bg-[#0057d2] text-[#ffffff] border-[#0057d2] font-semibold'
                  : 'bg-[#ffffff] text-[#223548] border-[#d5dce2] hover:bg-[#eaecee]'
              }`}
            >
              Lini 1 (Rubber)
            </button>
            <button
              type="button"
              onClick={() => setSelectedLaneFilter('lane-2')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-[4px] border transition-colors cursor-pointer ${
                selectedLaneFilter === 'lane-2'
                  ? 'bg-[#0057d2] text-[#ffffff] border-[#0057d2] font-semibold'
                  : 'bg-[#ffffff] text-[#223548] border-[#d5dce2] hover:bg-[#eaecee]'
              }`}
            >
              Lini 2 (Foam)
            </button>
            <button
              type="button"
              onClick={() => setSelectedLaneFilter('lane-3')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-[4px] border transition-colors cursor-pointer ${
                selectedLaneFilter === 'lane-3'
                  ? 'bg-[#0057d2] text-[#ffffff] border-[#0057d2] font-semibold'
                  : 'bg-[#ffffff] text-[#223548] border-[#d5dce2] hover:bg-[#eaecee]'
              }`}
            >
              Lini 3 (EVA)
            </button>
          </div>
        </div>

        {/* Input Pencarian Lokal */}
        <div className="relative w-full sm:w-[280px]">
          <Search className="w-3.5 h-3.5 text-[#545454] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari SPK, Part Number, Deskripsi..."
            className="w-full h-[32px] pl-8 pr-3 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
          />
        </div>
      </div>

      {/* 5. Tabel Detail Laporan Produksi Lini (Enterprise Density) */}
      <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden bg-[#ffffff]">
        <div className="px-4 py-3 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0057d2]" />
            <h3 className="text-[13px] font-bold text-[#000000]">
              Tabel Catatan Batch Produksi Lini Harian
            </h3>
          </div>
          <span className="text-[10px] text-[#545454]">
            Menampilkan <strong>{filteredRecords.length}</strong> dari 3 data lini
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px] border-collapse">
            <thead className="bg-[#ffffff] border-b border-[#d5dce2] text-[10px] font-bold text-[#545454] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">No. SPK & Lini</th>
                <th className="py-2.5 px-3">Komponen Part</th>
                <th className="py-2.5 px-3 text-right">Rasio Pack</th>
                <th className="py-2.5 px-3 text-right">Target SPK</th>
                <th className="py-2.5 px-3 text-right">Aktual Lini</th>
                <th className="py-2.5 px-3 text-center">Gap Baku</th>
                <th className="py-2.5 px-3 text-right">Capaian</th>
                <th className="py-2.5 px-3">Status QC Sampling</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaecee]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[12px] text-[#545454]">
                    Tidak ditemukan catatan produksi yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const gap = calculateProductionGap(rec.targetPcs, rec.actualPcs);
                  const ach = calculateProductionAchievement(rec.actualPcs, rec.targetPcs);
                  const isDeficit = gap > 0;
                  const isSurplus = gap < 0;
                  const isExact = gap === 0;

                  return (
                    <tr key={rec.id} className="hover:bg-[#f8f9fa] transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-[#0057d2] text-[11px]">
                          {rec.spkNumber}
                        </div>
                        <div className="font-bold text-[#000000] text-[11px] mt-0.5">
                          {rec.laneName}
                        </div>
                        <div className="text-[10px] text-[#545454]">{rec.shift}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-[#1a1a1a] text-[11px]">
                          {rec.partNumber}
                        </div>
                        <div className="text-[11px] text-[#475e75] font-medium truncate max-w-[220px]" title={rec.partDescription}>
                          {rec.partDescription}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right tabular-nums">
                        <div className="font-bold text-[#000000] text-[11px]">
                          {rec.packCount} Pack
                        </div>
                        <div className="text-[10px] text-[#545454]">
                          @{rec.packRatio} PCS/pack
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-[#000000] tabular-nums">
                        {rec.targetPcs.toLocaleString('id-ID')} PCS
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-[#000000] tabular-nums">
                        {rec.actualPcs.toLocaleString('id-ID')} PCS
                      </td>

                      <td className="py-3 px-3 text-center">
                        {isDeficit && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-[#fff8e1] text-[#8d4b00] border border-[#ffd54f] rounded-[4px] inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            +{gap} PCS Defisit
                          </span>
                        )}
                        {isExact && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-[#edf7ed] text-[#10683b] border border-[#a5d6a7] rounded-[4px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            0 (Tercapai)
                          </span>
                        )}
                        {isSurplus && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-[#edf7ed] text-[#10683b] border border-[#a5d6a7] rounded-[4px] inline-flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {gap} PCS Surplus
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-bold tabular-nums">
                        <span className={isDeficit ? 'text-[#8d4b00]' : 'text-[#10683b]'}>
                          {ach}%
                        </span>
                      </td>

                      <td className="py-3 px-3 text-[11px] text-[#475e75]">
                        <span className="truncate block max-w-[200px]" title={rec.qcStatusNotes}>
                          {rec.qcStatusNotes}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedRecordForDetail(rec)}
                          className="px-2.5 py-1 text-[11px] font-medium text-[#0057d2] hover:text-[#0049b0] bg-[#ebf8ff] hover:bg-[#d0ebff] border border-[#0057d2]/30 rounded-[4px] cursor-pointer inline-flex items-center gap-1 transition-colors"
                          title="Inspeksi parameter operasional lini (Read-Only)"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspeksi</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Lini 4 Status Card: Explicit TBD */}
      <div className="p-4 bg-[#f8f9fa] border border-dashed border-[#d5dce2] rounded-[4px] flex items-center justify-between gap-4 opacity-80">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] text-[#8c9ba5]">
            <MinusCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-[#545454]">
                Lini 4: Assembly & Packing
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#f0f2f5] text-[#545454] border border-[#d5dce2] rounded-[4px]">
                STATUS: BELUM DIKONFIGURASI (TBD)
              </span>
            </div>
            <p className="text-[11px] text-[#545454] mt-0.5">
              BRD §2.1 hanya mengonfirmasi 3 lini manufaktur berjalan (Rubber Cutting, Foam Slicing, EVA Die-cut).
            </p>
          </div>
        </div>
        <span className="text-[10px] text-[#8c9ba5] italic">Fase Ekspansi TBD</span>
      </div>

      {/* 7. Modal Dialog Inspeksi Detail (Murni Read-Only) */}
      {selectedRecordForDetail && (
        <div className="fixed inset-0 z-50 bg-[#000000]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-xl w-full max-w-[560px] overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#0057d2] uppercase tracking-wider block">
                  Inspeksi Parameter Lini Produksi · Read-Only
                </span>
                <h3 className="text-[15px] font-bold text-[#000000] mt-0.5">
                  {selectedRecordForDetail.spkNumber} — {selectedRecordForDetail.laneName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecordForDetail(null)}
                className="p-1 text-[#545454] hover:text-[#000000] hover:bg-[#eaecee] rounded cursor-pointer"
                aria-label="Tutup Dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-[12px]">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
                <div>
                  <span className="text-[10px] text-[#545454] block">Part Number</span>
                  <span className="font-mono font-bold text-[#000000] text-[13px]">
                    {selectedRecordForDetail.partNumber}
                  </span>
                  <span className="text-[10px] text-[#475e75] block mt-0.5">
                    {selectedRecordForDetail.partDescription}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#545454] block">Konversi Pack-to-PCS</span>
                  <span className="font-bold text-[#000000] text-[13px]">
                    {selectedRecordForDetail.packCount} Pack × {selectedRecordForDetail.packRatio} PCS
                  </span>
                  <span className="text-[10px] text-[#10683b] block mt-0.5 font-medium">
                    = {calculatePackToPcs(selectedRecordForDetail.packCount, selectedRecordForDetail.packRatio).toLocaleString('id-ID')} PCS
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
                  <span className="text-[10px] text-[#545454] block">Target SPK</span>
                  <span className="text-[15px] font-bold text-[#000000] tabular-nums">
                    {selectedRecordForDetail.targetPcs.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[9px] text-[#545454] block">PCS</span>
                </div>
                <div className="p-2.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
                  <span className="text-[10px] text-[#545454] block">Aktual Fisik</span>
                  <span className="text-[15px] font-bold text-[#000000] tabular-nums">
                    {selectedRecordForDetail.actualPcs.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[9px] text-[#545454] block">PCS</span>
                </div>
                <div className="p-2.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
                  <span className="text-[10px] text-[#545454] block">Capaian</span>
                  <span className="text-[15px] font-bold text-[#10683b] tabular-nums">
                    {calculateProductionAchievement(selectedRecordForDetail.actualPcs, selectedRecordForDetail.targetPcs)}%
                  </span>
                  <span className="text-[9px] text-[#10683b] block">Ratio</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-[#eaecee] pt-3 text-[11px]">
                <div className="flex justify-between py-1 border-b border-[#eaecee]">
                  <span className="text-[#545454]">Regu Operator Lini:</span>
                  <span className="font-semibold text-[#000000]">{selectedRecordForDetail.operatorGroup}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#eaecee]">
                  <span className="text-[#545454]">Kondisi Mesin & Pisau:</span>
                  <span className="font-semibold text-[#000000]">{selectedRecordForDetail.machineStatus}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#545454]">Catatan Alur QC:</span>
                  <span className="font-semibold text-[#8d4b00]">{selectedRecordForDetail.qcStatusNotes}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-[#f5f6f7] border-t border-[#d5dce2] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRecordForDetail(null)}
                className="px-4 py-1.5 text-[11px] font-semibold text-[#223548] hover:text-[#000000] bg-[#ffffff] border border-[#d5dce2] hover:bg-[#eaecee] rounded-[4px] cursor-pointer"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
