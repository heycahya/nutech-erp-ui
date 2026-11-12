/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Modul Produksi: Production Downtime Monitoring (Admin Operasional)
 * BRD §4.2, F-04
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Wrench,
  Activity,
  CheckCircle2,
  Calendar,
  Layers,
  Info,
} from 'lucide-react';
import { DailyProductionRecord, ProductionLane } from '../../../types/erp';

interface ProductionDowntimeViewProps {
  dailyRecords: DailyProductionRecord[];
  lanes: ProductionLane[];
}

export const ProductionDowntimeView: React.FC<ProductionDowntimeViewProps> = ({
  dailyRecords,
  lanes,
}) => {
  const [filterLane, setFilterLane] = useState<string>('all');

  const downtimeIncidents = [
    {
      id: 'dt-1',
      date: '2026-11-04',
      laneId: 'lane-1',
      laneName: 'Lane 1 (Rubber Cutting)',
      category: 'Blade Sharpening & Calibration',
      durationMinutes: 45,
      impactPcs: 100,
      description: 'Pengasahan pisau rotary pemotong EPDM profil silinder head shift pagi.',
      status: 'Resolved',
      technician: 'Joko & Tim Maintenance',
    },
    {
      id: 'dt-2',
      date: '2026-11-03',
      laneId: 'lane-2',
      laneName: 'Lane 2 (Foam Slicing)',
      category: 'Blade Guide Alignment',
      durationMinutes: 20,
      impactPcs: 0,
      description: 'Penyetelan tensioner pita pemotong busa horizontal sebelum start shift.',
      status: 'Resolved',
      technician: 'Slamet Riyadi',
    },
    {
      id: 'dt-3',
      date: '2026-11-02',
      laneId: 'lane-3',
      laneName: 'Lane 3 (EVA Die-cut)',
      category: 'Dies Changeover',
      durationMinutes: 30,
      impactPcs: 0,
      description: 'Penggantian cetakan dies pisau potong kiss-cut weatherstrip Avanza ke Xenia.',
      status: 'Resolved',
      technician: 'Hendra Gunawan',
    },
  ];

  const filteredIncidents = downtimeIncidents.filter(
    (inc) => filterLane === 'all' || inc.laneId === filterLane
  );

  const totalMinutes = filteredIncidents.reduce((s, i) => s + i.durationMinutes, 0);

  return (
    <div className="flex-1 overflow-y-auto bg-[#ffffff] p-6 space-y-5">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d5dce2] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#fff8e1] text-[#8d4b00] border border-[#ffd54f]/80 rounded-[4px] uppercase tracking-wider">
              MAINTENANCE & DOWNTIME LOG
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#f0f2f5] text-[#475e75] border border-[#d5dce2] rounded-[4px]">
              EVALUASI OEE MESIN
            </span>
          </div>
          <h1 className="text-[20px] font-bold text-[#000000] tracking-tight">
            Monitoring Downtime & Kendala Mesin Lini
          </h1>
          <p className="text-[12px] text-[#545454] mt-0.5">
            Pencatatan insiden pengasahan pisau, pergantian dies (changeover), dan pemeliharaan alat potong yang memengaruhi target SPK harian.
          </p>
        </div>
      </div>

      {/* 2. Ringkasan Kartu Downtime */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
          <span className="text-[10px] font-bold text-[#545454] uppercase tracking-wider block">
            Total Waktu Henti (Downtime)
          </span>
          <div className="text-[22px] font-bold text-[#8d4b00] tabular-nums mt-0.5">
            {totalMinutes} <span className="text-[12px] font-normal text-[#545454]">Menit</span>
          </div>
          <div className="text-[10px] text-[#545454] mt-1">Terbagi dalam 3 insiden terkelola</div>
        </div>

        <div className="p-4 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
          <span className="text-[10px] font-bold text-[#545454] uppercase tracking-wider block">
            Insiden Kritis Hari Ini (04 Nov)
          </span>
          <div className="text-[22px] font-bold text-[#c53929] tabular-nums mt-0.5">
            45 <span className="text-[12px] font-normal text-[#545454]">Menit (Lane 1)</span>
          </div>
          <div className="text-[10px] text-[#c53929] mt-1">Menyebabkan defisit target +100 PCS</div>
        </div>

        <div className="p-4 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
          <span className="text-[10px] font-bold text-[#545454] uppercase tracking-wider block">
            Status Penyelesaian Masalah
          </span>
          <div className="text-[22px] font-bold text-[#10683b] mt-0.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" /> 100% Resolved
          </div>
          <div className="text-[10px] text-[#545454] mt-1">Seluruh lini telah beroperasi normal kembali</div>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="flex items-center justify-between bg-[#f8f9fa] border border-[#d5dce2] p-3 rounded-[4px]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#545454] uppercase">Filter Lini:</span>
          <select
            value={filterLane}
            onChange={(e) => setFilterLane(e.target.value)}
            className="px-2 py-1 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] text-[11px]"
          >
            <option value="all">Semua Lini</option>
            <option value="lane-1">Lane 1 (Rubber Cutting)</option>
            <option value="lane-2">Lane 2 (Foam Slicing)</option>
            <option value="lane-3">Lane 3 (EVA Die-cut)</option>
          </select>
        </div>

        <span className="text-[11px] text-[#545454]">
          Daftar Log Insiden Downtime Mesin
        </span>
      </div>

      {/* 4. Tabel Log Insiden */}
      <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="bg-[#f5f6f7] border-b border-[#d5dce2] text-[10px] font-bold text-[#545454] uppercase tracking-wider">
              <th className="py-2.5 px-3">Tanggal</th>
              <th className="py-2.5 px-3">Lini Manufaktur</th>
              <th className="py-2.5 px-3">Kategori Kendala</th>
              <th className="py-2.5 px-3 text-right">Durasi</th>
              <th className="py-2.5 px-3 text-right">Dampak Gap</th>
              <th className="py-2.5 px-3">Keterangan Teknis</th>
              <th className="py-2.5 px-3">Teknisi / Penanggung Jawab</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eaecee]">
            {filteredIncidents.map((inc) => (
              <tr key={inc.id} className="hover:bg-[#f8f9fa]">
                <td className="py-2.5 px-3 font-mono font-bold text-[10px] text-[#000000]">
                  {inc.date}
                </td>
                <td className="py-2.5 px-3 font-semibold text-[#1a1a1a]">
                  {inc.laneName}
                </td>
                <td className="py-2.5 px-3 font-medium text-[#0057d2]">
                  {inc.category}
                </td>
                <td className="py-2.5 px-3 text-right tabular-nums font-bold text-[#8d4b00]">
                  {inc.durationMinutes} mnt
                </td>
                <td className="py-2.5 px-3 text-right tabular-nums">
                  {inc.impactPcs > 0 ? (
                    <span className="text-[#c53929] font-bold">+{inc.impactPcs} PCS</span>
                  ) : (
                    <span className="text-[#545454]">-</span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-[10px] text-[#545454] max-w-xs">
                  {inc.description}
                </td>
                <td className="py-2.5 px-3 text-[10px] text-[#1a1a1a]">
                  {inc.technician}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-[#eaf6ef] text-[#10683b] rounded-[3px] border border-[#10683b]/20">
                    {inc.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
