/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Modul Produksi: Production History & Detail (Admin Operasional)
 * BRD §4.2, F-04, BR-PR-01
 */

import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Calendar,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
} from 'lucide-react';
import { DailyProductionRecord } from '../../../types/erp';
import { calculateProductionAchievement } from '../../../utils/logic';

interface ProductionHistoryViewProps {
  dailyRecords: DailyProductionRecord[];
}

export const ProductionHistoryView: React.FC<ProductionHistoryViewProps> = ({ dailyRecords }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterLane, setFilterLane] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<DailyProductionRecord | null>(
    dailyRecords[0] || null
  );

  const filteredRecords = useMemo(() => {
    return dailyRecords.filter((rec) => {
      const matchSearch =
        rec.spkNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.laneName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rec.notes || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchLane = filterLane === 'all' || rec.laneId === filterLane;

      return matchSearch && matchLane;
    });
  }, [dailyRecords, searchQuery, filterLane]);

  const totalTarget = filteredRecords.reduce((s, r) => s + r.targetPcs, 0);
  const totalActual = filteredRecords.reduce((s, r) => s + r.actualPcs, 0);
  const totalNg = filteredRecords.reduce((s, r) => s + (r.ngPcs || 0), 0);

  return (
    <div className="flex-1 overflow-y-auto bg-[#ffffff] p-6 space-y-5">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d5dce2] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#ebf8ff] text-[#0057d2] border border-[#0057d2]/20 rounded-[4px] uppercase tracking-wider">
              FEAT-PR-02 · AUDIT TRAIL
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#f0f2f5] text-[#475e75] border border-[#d5dce2] rounded-[4px]">
              KRONOLOGI PRODUKSI
            </span>
          </div>
          <h1 className="text-[20px] font-bold text-[#000000] tracking-tight">
            Histori & Rincian Log Produksi Lini
          </h1>
          <p className="text-[12px] text-[#545454] mt-0.5">
            Arsip lengkap laporan kinerja harian mesin manufaktur, verifikasi gap per shift, dan histori cacat fisik NG.
          </p>
        </div>

        <button
          type="button"
          disabled
          className="px-3.5 py-2 text-[12px] font-bold text-[#545454] bg-[#f0f2f5] border border-[#d5dce2] rounded-[4px] flex items-center gap-1.5 cursor-not-allowed opacity-60"
        >
          <Download className="w-4 h-4" />
          Ekspor Log (PDF) (TBD)
        </button>
      </div>

      {/* 2. Ringkasan Metrik Historis */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3.5 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
          <span className="text-[10px] text-[#545454] font-bold uppercase tracking-wider block">
            Kumulatif Target PPIC
          </span>
          <div className="text-[20px] font-bold text-[#000000] tabular-nums mt-0.5">
            {totalTarget.toLocaleString('id-ID')}{' '}
            <span className="text-[11px] font-normal text-[#545454]">PCS</span>
          </div>
          <div className="text-[10px] text-[#545454] mt-0.5">{filteredRecords.length} catatan shift terfilter</div>
        </div>

        <div className="p-3.5 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
          <span className="text-[10px] text-[#545454] font-bold uppercase tracking-wider block">
            Kumulatif Realisasi Output
          </span>
          <div className="text-[20px] font-bold text-[#10683b] tabular-nums mt-0.5">
            {totalActual.toLocaleString('id-ID')}{' '}
            <span className="text-[11px] font-normal text-[#545454]">PCS</span>
          </div>
          <div className="text-[10px] text-[#545454] mt-0.5">
            Pencapaian: {calculateProductionAchievement(totalActual, totalTarget)}%
          </div>
        </div>

        <div className="p-3.5 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
          <span className="text-[10px] text-[#545454] font-bold uppercase tracking-wider block">
            Akumulasi NG Fisik
          </span>
          <div className="text-[20px] font-bold text-[#8d4b00] tabular-nums mt-0.5">
            {totalNg}{' '}
            <span className="text-[11px] font-normal text-[#545454]">PCS</span>
          </div>
          <div className="text-[10px] text-[#545454] mt-0.5">Dicatat terpisah dari kuantitas mesin</div>
        </div>
      </div>

      {/* 3. Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#f8f9fa] border border-[#d5dce2] p-3 rounded-[4px]">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#545454] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari SPK, Part, Lini, Catatan..."
            className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
          />
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-[#545454] text-[10px] font-bold uppercase">Lini:</span>
          <select
            value={filterLane}
            onChange={(e) => setFilterLane(e.target.value)}
            className="px-2 py-1.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] text-[11px]"
          >
            <option value="all">Semua Lini</option>
            <option value="lane-1">Lane 1 (Rubber Cutting)</option>
            <option value="lane-2">Lane 2 (Foam Slicing)</option>
            <option value="lane-3">Lane 3 (EVA Die-cut)</option>
          </select>
        </div>
      </div>

      {/* 4. Tabel Histori */}
      <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="bg-[#f5f6f7] border-b border-[#d5dce2] text-[10px] font-bold text-[#545454] uppercase tracking-wider">
              <th className="py-2.5 px-3">Tanggal</th>
              <th className="py-2.5 px-3">Lini Manufaktur</th>
              <th className="py-2.5 px-3">Ref SPK</th>
              <th className="py-2.5 px-3">Part Komponen</th>
              <th className="py-2.5 px-3 text-right">Target PPIC</th>
              <th className="py-2.5 px-3 text-right">Aktual</th>
              <th className="py-2.5 px-3 text-center">Gap</th>
              <th className="py-2.5 px-3 text-right">NG</th>
              <th className="py-2.5 px-3">Downtime & Alasan</th>
              <th className="py-2.5 px-3">Petugas / Operator</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eaecee]">
            {filteredRecords.map((rec) => {
              const isDeficit = rec.gapPcs > 0;
              const isSurplus = rec.gapPcs < 0;

              return (
                <tr key={rec.id} className="hover:bg-[#f8f9fa] transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-[10px] text-[#000000]">
                    {rec.date}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-[#1a1a1a]">
                    {rec.laneName}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#0057d2] font-semibold text-[10px]">
                    {rec.spkNumber}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-mono font-bold text-[#000000] text-[10px]">{rec.partNumber}</div>
                    <div className="text-[10px] text-[#545454] truncate max-w-[160px]">{rec.partDescription}</div>
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-[#475e75]">
                    {rec.targetPcs.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold text-[#000000]">
                    {rec.actualPcs.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold">
                    {isDeficit && (
                      <span className="px-1.5 py-0.5 text-[9px] bg-[#fde8e8] text-[#c53929] rounded-[3px] border border-[#c53929]/20">
                        +{rec.gapPcs}
                      </span>
                    )}
                    {isSurplus && (
                      <span className="px-1.5 py-0.5 text-[9px] bg-[#ebf8ff] text-[#0057d2] rounded-[3px] border border-[#0057d2]/20">
                        {rec.gapPcs}
                      </span>
                    )}
                    {!isDeficit && !isSurplus && (
                      <span className="px-1.5 py-0.5 text-[9px] bg-[#eaf6ef] text-[#10683b] rounded-[3px] border border-[#10683b]/20">
                        0
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-[#8d4b00] font-semibold">
                    {rec.ngPcs || 0}
                  </td>
                  <td className="py-2.5 px-3 text-[10px]">
                    <span className="font-semibold text-[#1a1a1a]">{rec.downtimeReason || 'None'}</span>
                    {rec.downtimeMinutes ? (
                      <span className="text-[#8d4b00] ml-1">({rec.downtimeMinutes} mnt)</span>
                    ) : null}
                  </td>
                  <td className="py-2.5 px-3 text-[10px] text-[#545454]">
                    {rec.operatorName || 'Foreman Lini'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
