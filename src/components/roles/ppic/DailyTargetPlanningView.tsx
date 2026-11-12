/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PPIC Module: Daily Target Planning & Monitoring View (BR-SPK-03, BR-SPK-04, BR-SPK-05, BR-PR-03)
 */

import React, { useState, useMemo } from 'react';
import {
  DailyProductionRecord,
  ProductionOrderSpk,
  ProductionLane,
  PartItem,
} from '../../../types/erp';
import {
  Layers,
  Lock,
  Calendar,
  Filter,
  Search,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sliders,
  X,
  ShieldCheck,
} from 'lucide-react';
import { calculatePackToPcs, formatIndoDate } from '../../../utils/logic';

interface DailyTargetPlanningViewProps {
  dailyRecords: DailyProductionRecord[];
  spkOrders: ProductionOrderSpk[];
  lanes: ProductionLane[];
  parts: PartItem[];
  onUpdateDailyTarget: (recordId: string, newTargetPcs: number, note?: string) => void;
}

export const DailyTargetPlanningView: React.FC<DailyTargetPlanningViewProps> = ({
  dailyRecords,
  spkOrders,
  lanes,
  parts,
  onUpdateDailyTarget,
}) => {
  // Filter states
  const [selectedLane, setSelectedLane] = useState('ALL');
  const [selectedPart, setSelectedPart] = useState('ALL');
  const [selectedDateFilter, setSelectedDateFilter] = useState('2026-11-04');
  const [viewMode, setViewMode] = useState<'table' | 'matrix'>('table');

  // Edit target modal state
  const [editingRecord, setEditingRecord] = useState<DailyProductionRecord | null>(null);
  const [newTargetInput, setNewTargetInput] = useState<number>(0);
  const [editReasonNote, setEditReasonNote] = useState('');

  // Available dates in records
  const availableDates = useMemo(() => {
    const dates = Array.from(new Set(dailyRecords.map((r) => r.date))).sort();
    return dates;
  }, [dailyRecords]);

  // Filtered records for selected date
  const recordsForDate = useMemo(() => {
    return dailyRecords.filter((r) => {
      const matchDate = r.date === selectedDateFilter;
      const matchLane = selectedLane === 'ALL' || r.laneId === selectedLane;
      const matchPart = selectedPart === 'ALL' || r.partId === selectedPart;
      return matchDate && matchLane && matchPart;
    });
  }, [dailyRecords, selectedDateFilter, selectedLane, selectedPart]);

  // Total daily target aggregate for selected date
  const totalTargetForDate = recordsForDate.reduce((sum, r) => sum + r.targetPcs, 0);

  // Open edit modal
  const handleOpenEditTarget = (record: DailyProductionRecord) => {
    setEditingRecord(record);
    setNewTargetInput(record.targetPcs);
    setEditReasonNote('');
  };

  // Submit edit
  const handleSaveTargetEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    if (newTargetInput <= 0) return;

    onUpdateDailyTarget(editingRecord.id, newTargetInput, editReasonNote);
    setEditingRecord(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#ffffff] text-[#223548]">
      {/* 1. Header & Lock Banner */}
      <div className="p-4 bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#475e75]">
              PPIC Target Management · BRD §5.2 & BR-SPK-03/04/05
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#fff6e5] text-[#8d4b00] border border-[#8d4b00]/30 rounded-[4px] flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              <span>PCS TERKUNCI (OPERATOR READ-ONLY)</span>
            </span>
          </div>
          <h2 className="text-[17px] font-bold text-[#000000] mt-0.5">
            Target Produksi Harian per Lini, Tanggal, dan Part
          </h2>
          <p className="text-[12px] text-[#475e75] mt-1 max-w-3xl leading-relaxed">
            Target harian resmi selalu dalam satuan <strong>PCS</strong> (BR-SPK-03).
            Staf lini dan operator pabrik tidak memiliki hak akses mengubah angka target (BR-SPK-05).
            Target hari berikutnya tetap mengacu pada rencana awal PPIC dan tidak terpengaruh defisit hari ini (BR-PR-03).
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#ffffff] p-1 border border-[#d5dce2] rounded-[4px]">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 text-[12px] font-medium rounded-[3px] transition-colors cursor-pointer ${
              viewMode === 'table' ? 'bg-[#0057d2] text-white font-semibold' : 'text-[#475e75] hover:text-[#000000]'
            }`}
          >
            Tampilan Tabel Detail
          </button>
          <button
            type="button"
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1 text-[12px] font-medium rounded-[3px] transition-colors cursor-pointer ${
              viewMode === 'matrix' ? 'bg-[#0057d2] text-white font-semibold' : 'text-[#475e75] hover:text-[#000000]'
            }`}
          >
            Matrix Multi-Tanggal
          </button>
        </div>
      </div>

      {/* 2. Target KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#475e75]">
            Target Tanggal Terpilih
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-[#000000] tabular-nums">
              {totalTargetForDate.toLocaleString('id-ID')}
            </span>
            <span className="text-[11px] text-[#475e75]">PCS</span>
          </div>
          <div className="mt-1 text-[11px] text-[#0057d2] font-semibold">
            {formatIndoDate(selectedDateFilter)}
          </div>
        </div>

        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#475e75]">
            Lini Aktif Beroperasi
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-[#10683b] tabular-nums">
              3 Lini
            </span>
            <span className="text-[11px] text-[#475e75]">terjadwal</span>
          </div>
          <div className="mt-1 text-[11px] text-[#475e75]">
            Lane 1 (EPDM), Lane 2 (Foam), Lane 3 (EVA)
          </div>
        </div>

        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#475e75]">
            Alokasi Prioritas Urgent
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-[#8d4b00] tabular-nums">
              2.500
            </span>
            <span className="text-[11px] text-[#475e75]">PCS di Lane 2</span>
          </div>
          <div className="mt-1 text-[11px] text-[#8d4b00] font-medium">
            NTC-FOAM-0201 (Need: 06 Nov 2026)
          </div>
        </div>

        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#475e75]">
            Hak Akses Target (BR-SPK-05)
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[14px] font-bold text-[#0057d2]">
            <ShieldCheck className="w-4 h-4 text-[#0057d2]" />
            <span>PPIC Authorized</span>
          </div>
          <div className="mt-1 text-[11px] text-[#475e75]">
            Operator Lapangan: Terkunci (Read-Only)
          </div>
        </div>
      </div>

      {/* 3. Date & Lane Selection Bar */}
      <div className="p-3 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Selector Buttons */}
          <div className="flex items-center gap-1.5 text-[12px]">
            <Calendar className="w-3.5 h-3.5 text-[#475e75]" />
            <span className="text-[#475e75] font-medium">Tanggal Produksi:</span>
            <div className="flex items-center gap-1">
              {availableDates.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDateFilter(d)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-[4px] border transition-colors cursor-pointer ${
                    selectedDateFilter === d
                      ? 'bg-[#0057d2] text-white border-[#0057d2] font-bold'
                      : 'bg-[#ffffff] text-[#223548] border-[#d5dce2] hover:bg-[#f5f6f7]'
                  }`}
                >
                  {formatIndoDate(d)}
                  {d === '2026-11-04' && ' (Acuan)'}
                </button>
              ))}
            </div>
          </div>

          {/* Lane Filter */}
          <div className="flex items-center gap-1.5 text-[12px] border-l border-[#d5dce2] pl-3">
            <span className="text-[#475e75] font-medium">Lini:</span>
            <select
              value={selectedLane}
              onChange={(e) => setSelectedLane(e.target.value)}
              className="h-[30px] px-2 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
            >
              <option value="ALL">Semua Lini</option>
              <option value="lane-1">Lane 1 (Rubber Cutting)</option>
              <option value="lane-2">Lane 2 (Foam Slicing)</option>
              <option value="lane-3">Lane 3 (EVA Die-cut)</option>
            </select>
          </div>

          {/* Part Filter */}
          <div className="flex items-center gap-1.5 text-[12px]">
            <span className="text-[#475e75] font-medium">Part:</span>
            <select
              value={selectedPart}
              onChange={(e) => setSelectedPart(e.target.value)}
              className="h-[30px] px-2 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
            >
              <option value="ALL">Semua Part</option>
              {parts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.partNumber} ({p.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-[11px] text-[#475e75]">
          Status: <strong>Target Resmi Terkunci</strong>
        </div>
      </div>

      {/* 4A. Table View of Daily Targets */}
      {viewMode === 'table' && (
        <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden bg-[#ffffff]">
          <div className="px-4 py-2.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-[#000000]">
              Alokasi Target Harian PPIC — Tanggal: {formatIndoDate(selectedDateFilter)}
            </h3>
            <span className="text-[11px] text-[#475e75]">
              Target Resmi PCS (Operator Read-Only)
            </span>
          </div>

          <table className="w-full text-left text-[13px] border-collapse">
            <thead className="bg-[#ffffff] border-b border-[#d5dce2] text-[11px] font-bold text-[#475e75] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Lini Produksi</th>
                <th className="py-2.5 px-4">Part Number & Deskripsi</th>
                <th className="py-2.5 px-4">Dokumen SPK & Ref SO</th>
                <th className="py-2.5 px-4 text-center">Rasio Kemasan</th>
                <th className="py-2.5 px-4 text-right">Target Resmi (PCS)</th>
                <th className="py-2.5 px-4 text-right">Target Setara (Pack)</th>
                <th className="py-2.5 px-4 text-center">Status Kunci Target</th>
                <th className="py-2.5 px-4 text-center">Aksi PPIC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d5dce2]">
              {recordsForDate.map((r) => {
                const spkObj = spkOrders.find((s) => s.id === r.spkId || s.spkNumber === r.spkNumber);
                const packEquivalent = Math.round(r.targetPcs / r.packRatio);

                return (
                  <tr key={r.id} className="hover:bg-[#f5f6f7] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#000000]">{r.laneName}</div>
                      <div className="text-[11px] text-[#475e75]">
                        Kapasitas Terpasang: 3.000 - 3.500 PCS/hari
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-[#0057d2] text-[13px]">
                        {r.partNumber}
                      </div>
                      <div className="text-[11px] text-[#223548]">{r.partDescription}</div>
                      {r.isUrgent && (
                        <span className="mt-1 inline-block px-1.5 py-0.2 text-[9px] font-bold bg-[#fff6e5] text-[#8d4b00] border border-[#8d4b00]/30 rounded-[4px]">
                          PRIORITAS URGENT (TMMIN NEED DATE: 06 NOV)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono font-semibold text-[#000000]">{r.spkNumber}</div>
                      {spkObj?.soNumber && (
                        <div className="text-[11px] text-[#475e75]">
                          Ref: {spkObj.soNumber} ({spkObj.customerName})
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#f5f6f7] text-[#223548] border border-[#d5dce2] rounded-[4px]">
                        {r.packRatio} PCS / pack
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="text-[15px] font-bold text-[#000000] tabular-nums">
                        {r.targetPcs.toLocaleString('id-ID')} PCS
                      </div>
                      <div className="text-[10px] text-[#10683b]">Resmi Terkunci</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-[#475e75]">
                      ~{packEquivalent.toLocaleString('id-ID')} Pack
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-[#eaf6ef] text-[#10683b] border border-[#10683b]/20 rounded-[4px]">
                        <Lock className="w-3 h-3" />
                        <span>Terkunci (BR-SPK-05)</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenEditTarget(r)}
                        className="flex items-center gap-1 mx-auto px-2.5 py-1 text-[11px] font-medium text-[#0057d2] hover:bg-[#ebf8ff] border border-[#d5dce2] rounded-[4px] transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sesuaikan</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {recordsForDate.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#475e75]">
                    Tidak ada jadwal target produksi pada tanggal ini untuk filter terpilih.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-[#f5f6f7] border-t border-[#d5dce2] font-bold">
              <tr>
                <td colSpan={4} className="py-2.5 px-4 text-[12px] text-[#000000]">
                  Total Target Kumulatif Tanggal {formatIndoDate(selectedDateFilter)}:
                </td>
                <td className="py-2.5 px-4 text-right text-[15px] text-[#0057d2] tabular-nums">
                  {totalTargetForDate.toLocaleString('id-ID')} PCS
                </td>
                <td colSpan={3} className="py-2.5 px-4 text-[11px] text-[#475e75]">
                  Seluruh angka terdaftar dalam SPK bulanan resmi PT Nutech Pundi Arta
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* 4B. Matrix View Across Dates */}
      {viewMode === 'matrix' && (
        <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden bg-[#ffffff]">
          <div className="px-4 py-2.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-[#000000]">
              Matrix Alokasi Target Harian Multi-Tanggal (Awal November 2026)
            </h3>
            <span className="text-[11px] text-[#475e75]">Satuan: PCS</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] border-collapse min-w-[700px]">
              <thead className="bg-[#ffffff] border-b border-[#d5dce2] text-[10px] font-bold text-[#475e75] uppercase">
                <tr>
                  <th className="py-2 px-3">Lini & Part</th>
                  <th className="py-2 px-3">Rasio Pack</th>
                  {availableDates.map((d) => (
                    <th key={d} className="py-2 px-3 text-right">
                      {formatIndoDate(d).substring(0, 6)}
                    </th>
                  ))}
                  <th className="py-2 px-3 text-right">Rata-rata Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d5dce2]">
                {/* Lane 1 */}
                <tr className="hover:bg-[#f5f6f7]">
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-[#000000]">Lane 1: Rubber</span>
                    <div className="font-mono text-[#0057d2]">NTC-RUB-0101 (Gasket EPDM)</div>
                  </td>
                  <td className="py-2.5 px-3">50 PCS / pack</td>
                  {availableDates.map((d) => {
                    const match = dailyRecords.find((r) => r.laneId === 'lane-1' && r.date === d);
                    return (
                      <td key={d} className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                        {match ? `${match.targetPcs.toLocaleString('id-ID')} PCS` : '—'}
                      </td>
                    );
                  })}
                  <td className="py-2.5 px-3 text-right font-bold text-[#0057d2] tabular-nums">
                    3.300 PCS
                  </td>
                </tr>

                {/* Lane 2 */}
                <tr className="hover:bg-[#f5f6f7]">
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-[#000000]">Lane 2: Foam Slicing</span>
                    <div className="font-mono text-[#0057d2]">NTC-FOAM-0201 (Acoustic Foam)</div>
                    <span className="text-[9px] font-bold text-[#8d4b00]">Urgent TMMIN</span>
                  </td>
                  <td className="py-2.5 px-3">25 PCS / pack</td>
                  {availableDates.map((d) => {
                    const match = dailyRecords.find((r) => r.laneId === 'lane-2' && r.date === d);
                    return (
                      <td key={d} className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                        {match ? `${match.targetPcs.toLocaleString('id-ID')} PCS` : '—'}
                      </td>
                    );
                  })}
                  <td className="py-2.5 px-3 text-right font-bold text-[#0057d2] tabular-nums">
                    2.500 PCS
                  </td>
                </tr>

                {/* Lane 3 */}
                <tr className="hover:bg-[#f5f6f7]">
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-[#000000]">Lane 3: EVA Die-cut</span>
                    <div className="font-mono text-[#0057d2]">NTC-EVA-0301 (Weatherstrip)</div>
                  </td>
                  <td className="py-2.5 px-3">100 PCS / pack</td>
                  {availableDates.map((d) => {
                    const match = dailyRecords.find((r) => r.laneId === 'lane-3' && r.date === d);
                    return (
                      <td key={d} className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                        {match ? `${match.targetPcs.toLocaleString('id-ID')} PCS` : '—'}
                      </td>
                    );
                  })}
                  <td className="py-2.5 px-3 text-right font-bold text-[#0057d2] tabular-nums">
                    1.000 PCS
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Business Rule Reminder Card */}
      <div className="p-3.5 bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] text-[12px] space-y-1">
        <div className="font-bold text-[#000000] flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-[#0057d2]" />
          <span>Aturan Bisnis Penguncian Target PPIC (BR-SPK-04 & BR-SPK-05):</span>
        </div>
        <p className="text-[#475e75] leading-relaxed">
          1. Angka target harian per part per lane telah dipatok PPIC sejak awal bulan kalender berjalan.
          <br />
          2. Hanya pengguna dengan peran <strong>PPIC</strong> yang diizinkan menyesuaikan angka target jika ada perubahan kuota resmi atau penambahan Sales Order urgent (TBD-08).
          <br />
          3. Staf lapangan/operator tidak diizinkan mengubah nilai target di formulir pelaporan produksi harian.
        </p>
      </div>

      {/* 6. Edit Target Modal */}
      {editingRecord && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-target-title"
          className="fixed inset-0 z-50 bg-[#000000]/40 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#0057d2]" />
                <h3 id="edit-target-title" className="text-[14px] font-bold text-[#000000]">
                  Penyesuaian Target Harian PPIC
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="p-1 text-[#475e75] hover:text-[#000000] rounded-[4px] cursor-pointer"
                aria-label="Tutup Edit Target"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTargetEdit} className="p-5 space-y-4 text-[13px]">
              <div className="p-3 bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] space-y-1">
                <div className="text-[11px] font-bold text-[#475e75]">Lini & Part:</div>
                <div className="font-bold text-[#000000]">
                  {editingRecord.laneName} — {editingRecord.partNumber}
                </div>
                <div className="text-[11px] text-[#475e75]">
                  Tanggal: {formatIndoDate(editingRecord.date)} · Rasio: {editingRecord.packRatio} PCS/pack
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#475e75] mb-1">
                  Target Baru PPIC (PCS) *
                </label>
                <input
                  type="number"
                  min={1}
                  step={50}
                  required
                  value={newTargetInput}
                  onChange={(e) => setNewTargetInput(Number(e.target.value) || 0)}
                  className="w-full h-[36px] px-3 font-mono font-bold text-[14px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
                />
                <span className="text-[11px] text-[#475e75] mt-1 block">
                  Setara dengan ~{Math.round(newTargetInput / editingRecord.packRatio)} Pack kemasan lini
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#475e75] mb-1">
                  Alasan Penyesuaian Target PPIC
                </label>
                <input
                  type="text"
                  placeholder="misal: Penambahan kuota darurat SO Urgent TMMIN..."
                  value={editReasonNote}
                  onChange={(e) => setEditReasonNote(e.target.value)}
                  className="w-full h-[34px] px-3 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
                />
              </div>

              <div className="p-2.5 bg-[#fff6e5] border border-[#8d4b00]/30 rounded-[4px] text-[11px] text-[#8d4b00]">
                Perubahan target harian akan langsung memperbarui kalkulasi gap on-the-fly pada modul monitoring produksi.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-1.5 text-[12px] font-medium text-[#223548] hover:bg-[#eaecee] border border-[#d5dce2] rounded-[4px] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-[12px] font-bold text-white bg-[#0057d2] hover:bg-[#0049b0] rounded-[4px] cursor-pointer shadow-sm"
                >
                  Simpan Target Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
