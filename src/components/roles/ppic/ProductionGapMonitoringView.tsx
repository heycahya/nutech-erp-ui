/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PPIC Module: Production Gap Monitoring View (FEAT-SPK-02, BR-PR-01, BR-PR-02, BR-PR-03, F-02)
 */

import React, { useState, useMemo } from 'react';
import {
  DailyProductionRecord,
  ProductionOrderSpk,
  ProductionLane,
  PartItem,
} from '../../../types/erp';
import {
  BarChart3,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Sliders,
  Edit2,
  X,
  Clock,
  ArrowRight,
  Info,
  Package,
} from 'lucide-react';
import {
  calculateProductionGap,
  evaluateProductionGapDetail,
  calculateProductionAchievement,
  calculatePackToPcs,
  formatIndoDate,
} from '../../../utils/logic';

interface ProductionGapMonitoringViewProps {
  dailyRecords: DailyProductionRecord[];
  spkOrders: ProductionOrderSpk[];
  lanes: ProductionLane[];
  parts: PartItem[];
  onUpdateDailyActual: (
    recordId: string,
    actualPcs: number,
    actualPacks?: number,
    downtimeReason?: string,
    notes?: string
  ) => void;
}

export const ProductionGapMonitoringView: React.FC<ProductionGapMonitoringViewProps> = ({
  dailyRecords,
  spkOrders,
  lanes,
  parts,
  onUpdateDailyActual,
}) => {
  // Filters
  const [selectedDate, setSelectedDate] = useState('2026-11-04');
  const [selectedLane, setSelectedLane] = useState('ALL');
  const [selectedGapStatus, setSelectedGapStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Input Aktual state
  const [editingRecord, setEditingRecord] = useState<DailyProductionRecord | null>(null);
  const [inputMode, setInputMode] = useState<'pcs' | 'pack'>('pack');
  const [inputPacks, setInputPacks] = useState<number>(0);
  const [inputPcs, setInputPcs] = useState<number>(0);
  const [downtimeReason, setDowntimeReason] = useState<string>('None');
  const [notes, setNotes] = useState<string>('');

  // Available unique dates
  const availableDates = useMemo(() => {
    return Array.from(new Set(dailyRecords.map((r) => r.date))).sort();
  }, [dailyRecords]);

  // Filtered records for selected date and criteria
  const filteredRecords = useMemo(() => {
    return dailyRecords.filter((r) => {
      const matchDate = r.date === selectedDate;
      const matchLane = selectedLane === 'ALL' || r.laneId === selectedLane;
      const gapDetail = evaluateProductionGapDetail(r.targetPcs, r.actualPcs);
      const matchGapStatus =
        selectedGapStatus === 'ALL' || gapDetail.status === selectedGapStatus;

      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        r.partNumber.toLowerCase().includes(q) ||
        r.partDescription.toLowerCase().includes(q) ||
        r.spkNumber.toLowerCase().includes(q) ||
        r.laneName.toLowerCase().includes(q);

      return matchDate && matchLane && matchGapStatus && matchSearch;
    });
  }, [dailyRecords, selectedDate, selectedLane, selectedGapStatus, searchQuery]);

  // Aggregate metrics for selected date
  const allRecordsForDate = useMemo(() => {
    return dailyRecords.filter((r) => r.date === selectedDate);
  }, [dailyRecords, selectedDate]);

  const totalTarget = allRecordsForDate.reduce((sum, r) => sum + r.targetPcs, 0);
  const totalActual = allRecordsForDate.reduce((sum, r) => sum + r.actualPcs, 0);
  const aggregateGap = totalTarget - totalActual;
  const achievementRate = calculateProductionAchievement(totalActual, totalTarget);

  // Open modal
  const handleOpenEdit = (rec: DailyProductionRecord) => {
    setEditingRecord(rec);
    setInputPcs(rec.actualPcs);
    const packs = rec.actualPacks ?? Math.round(rec.actualPcs / rec.packRatio);
    setInputPacks(packs);
    setInputMode('pack');
    setDowntimeReason(rec.downtimeReason || 'None');
    setNotes(rec.notes || '');
  };

  // Change packs
  const handlePacksChange = (p: number) => {
    const safeP = Math.max(0, p);
    setInputPacks(safeP);
    if (editingRecord) {
      const convertedPcs = calculatePackToPcs(safeP, editingRecord.packRatio);
      setInputPcs(convertedPcs);
    }
  };

  // Change PCS
  const handlePcsChange = (pcs: number) => {
    const safePcs = Math.max(0, pcs);
    setInputPcs(safePcs);
    if (editingRecord) {
      setInputPacks(Math.round(safePcs / editingRecord.packRatio));
    }
  };

  // Submit edit
  const handleSubmitActual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    onUpdateDailyActual(editingRecord.id, inputPcs, inputPacks, downtimeReason, notes);
    setEditingRecord(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#ffffff] text-[#223548]">
      {/* 1. Header & Business Rule Summary Banner */}
      <div className="p-4 bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#475e75]">
              PPIC & Perencanaan Produksi · FEAT-SPK-02 & BR-PR-01/02/03
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#eaf6ef] text-[#10683b] border border-[#10683b]/20 rounded-[4px]">
              ON-THE-FLY GAP CALCULATION
            </span>
          </div>
          <h2 className="text-[17px] font-bold text-[#000000] mt-0.5">
            Monitoring Gap Produksi Harian (Target vs Aktual per Lini)
          </h2>
          <p className="text-[12px] text-[#475e75] mt-1 max-w-3xl leading-relaxed">
            Gap dihitung on-the-fly dengan formula resmi: <strong>Gap = Target minus Aktual</strong> (BR-PR-01).
            Gap positif mencerminkan <em>defisit</em>, gap nol berarti <em>tercapai</em>, dan gap negatif mencerminkan <em>surplus</em>.
            Defisit hari ini <strong>tidak otomatis di-carry-over</strong> ke target hari berikutnya (BR-PR-02).
          </p>
        </div>
        <div className="text-[11px] text-[#475e75] bg-[#ffffff] p-2.5 border border-[#d5dce2] rounded-[4px] max-w-xs">
          <div className="font-bold text-[#000000] flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-[#0057d2]" />
            <span>Pemisahan QC & Stok FG (BR-QC-02)</span>
          </div>
          <div>Aktual produksi tidak otomatis menambah saldo barang jadi (FG) sebelum verifikasi fisik QC.</div>
        </div>
      </div>

      {/* 2. Top Metric KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#475e75]">
            Target Pabrik (SPK)
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-[#000000] tabular-nums">
              {totalTarget.toLocaleString('id-ID')}
            </span>
            <span className="text-[11px] text-[#475e75]">PCS</span>
          </div>
          <div className="mt-1 text-[11px] text-[#475e75]">
            Kebutuhan Harian Terjadwal (3 Lini)
          </div>
        </div>

        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#475e75]">
            Aktual Produksi Fisik
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-[#0057d2] tabular-nums">
              {totalActual.toLocaleString('id-ID')}
            </span>
            <span className="text-[11px] text-[#475e75]">PCS</span>
          </div>
          <div className="mt-1 text-[11px] text-[#10683b]">
            Hasil Pemotongan & Slicing Shift 1-2
          </div>
        </div>

        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#475e75]">
            Gap Agregat (On-the-fly)
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={`text-[22px] font-bold tabular-nums ${
                aggregateGap > 0
                  ? 'text-[#8d4b00]'
                  : aggregateGap === 0
                  ? 'text-[#10683b]'
                  : 'text-[#0057d2]'
              }`}
            >
              {aggregateGap > 0 ? `+${aggregateGap.toLocaleString('id-ID')}` : aggregateGap.toLocaleString('id-ID')}
            </span>
            <span className="text-[11px] text-[#475e75]">
              PCS {aggregateGap > 0 ? '(Defisit)' : aggregateGap === 0 ? '(Tepat)' : '(Surplus)'}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-[#475e75]">
            Formula: Target ({totalTarget.toLocaleString('id-ID')}) - Aktual ({totalActual.toLocaleString('id-ID')})
          </div>
        </div>

        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#475e75]">
            Pencapaian Pabrik
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-[#10683b] tabular-nums">
              {achievementRate}%
            </span>
          </div>
          <div className="mt-1 text-[11px] text-[#475e75]">
            Baseline Efisiensi Operasional Harian
          </div>
        </div>
      </div>

      {/* 3. Date, Lane, & Status Filter Bar */}
      <div className="p-3 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Selector */}
          <div className="flex items-center gap-1.5 text-[12px]">
            <Calendar className="w-3.5 h-3.5 text-[#475e75]" />
            <span className="text-[#475e75] font-medium">Tanggal:</span>
            <div className="flex items-center gap-1">
              {availableDates.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDate(d)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-[4px] border transition-colors cursor-pointer ${
                    selectedDate === d
                      ? 'bg-[#0057d2] text-white border-[#0057d2] font-bold'
                      : 'bg-[#ffffff] text-[#223548] border-[#d5dce2] hover:bg-[#f5f6f7]'
                  }`}
                >
                  {formatIndoDate(d)}
                  {d === '2026-11-04' && ' (Acuan Phase 01)'}
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

          {/* Gap Status Filter */}
          <div className="flex items-center gap-1.5 text-[12px]">
            <span className="text-[#475e75] font-medium">Status Gap:</span>
            <select
              value={selectedGapStatus}
              onChange={(e) => setSelectedGapStatus(e.target.value)}
              className="h-[30px] px-2 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
            >
              <option value="ALL">Semua Status</option>
              <option value="defisit">Defisit (&gt; 0)</option>
              <option value="tercapai">Target Tercapai (= 0)</option>
              <option value="surplus">Surplus (&lt; 0)</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#475e75]" />
          <input
            type="text"
            placeholder="Cari part, SPK, lini..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[30px] pl-7 pr-3 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
          />
        </div>
      </div>

      {/* 4. Production Gap Interactive Table */}
      <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden bg-[#ffffff]">
        <div className="px-4 py-2.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
          <h3 className="text-[13px] font-bold text-[#000000]">
            Kinerja Harian per Lini Kerja & Analisis Deviasi Output (Tanggal: {formatIndoDate(selectedDate)})
          </h3>
          <span className="text-[11px] text-[#475e75]">
            Gap dihitung on-the-fly · Tidak ada carry-over otomatis (BR-PR-02)
          </span>
        </div>

        <table className="w-full text-left text-[13px] border-collapse">
          <thead className="bg-[#ffffff] border-b border-[#d5dce2] text-[11px] font-bold text-[#475e75] uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-4">Lini Produksi</th>
              <th className="py-2.5 px-4">Part Number & Deskripsi</th>
              <th className="py-2.5 px-4">No. SPK & Ref SO</th>
              <th className="py-2.5 px-4 text-right">Target (PCS)</th>
              <th className="py-2.5 px-4 text-right">Aktual Produksi</th>
              <th className="py-2.5 px-4 text-center">Gap On-The-Fly</th>
              <th className="py-2.5 px-4 text-center">Capaian %</th>
              <th className="py-2.5 px-4">Kendala / Downtime (BR-PR-08)</th>
              <th className="py-2.5 px-4 text-center">Aksi Simulasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d5dce2]">
            {filteredRecords.map((r) => {
              const gapDetail = evaluateProductionGapDetail(r.targetPcs, r.actualPcs);
              const achievement = calculateProductionAchievement(r.actualPcs, r.targetPcs);
              const spkObj = spkOrders.find((s) => s.id === r.spkId || s.spkNumber === r.spkNumber);

              return (
                <tr key={r.id} className="hover:bg-[#f5f6f7] transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#000000]">{r.laneName}</div>
                    <div className="text-[11px] text-[#475e75]">
                      {r.laneId === 'lane-1' && 'Continuous EPDM Cutting'}
                      {r.laneId === 'lane-2' && 'Horizontal Splitting Foam'}
                      {r.laneId === 'lane-3' && 'Hydraulic Kiss-cutting EVA'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-[#0057d2] text-[13px]">
                      {r.partNumber}
                    </div>
                    <div className="text-[11px] text-[#223548]">{r.partDescription}</div>
                    {r.isUrgent && (
                      <span className="mt-1 inline-block px-1.5 py-0.2 text-[9px] font-bold bg-[#fff6e5] text-[#8d4b00] border border-[#8d4b00]/30 rounded-[4px]">
                        URGENT SO
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-mono text-[#000000] font-semibold">{r.spkNumber}</div>
                    {spkObj?.soNumber && (
                      <div className="text-[11px] text-[#475e75]">
                        Ref: {spkObj.soNumber} ({spkObj.customerName?.split(' ')[1] || 'B2B'})
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="font-mono font-bold text-[#000000] tabular-nums text-[14px]">
                      {r.targetPcs.toLocaleString('id-ID')} PCS
                    </div>
                    <div className="text-[10px] text-[#475e75]">Terkunci (PPIC)</div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="font-mono font-bold text-[#0057d2] tabular-nums text-[14px]">
                      {r.actualPcs.toLocaleString('id-ID')} PCS
                    </div>
                    <div className="text-[11px] text-[#475e75]">
                      ~{r.actualPacks ?? Math.round(r.actualPcs / r.packRatio)} Pack ({r.packRatio} PCS/pck)
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {gapDetail.status === 'defisit' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-[#fff6e5] text-[#8d4b00] border border-[#8d4b00]/30 rounded-[4px]">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{gapDetail.label}</span>
                      </span>
                    )}
                    {gapDetail.status === 'tercapai' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-[#eaf6ef] text-[#10683b] border border-[#10683b]/20 rounded-[4px]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{gapDetail.label}</span>
                      </span>
                    )}
                    {gapDetail.status === 'surplus' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-[#ebf8ff] text-[#0057d2] border border-[#0057d2]/20 rounded-[4px]">
                        <TrendingUp className="w-3 h-3" />
                        <span>{gapDetail.label}</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[12px] font-bold tabular-nums ${
                        achievement >= 100 ? 'text-[#10683b]' : 'text-[#8d4b00]'
                      }`}
                    >
                      {achievement}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-[12px] font-semibold text-[#000000]">
                      {r.downtimeReason === 'None' || !r.downtimeReason ? 'Operasi Normal' : r.downtimeReason}
                    </div>
                    <div className="text-[11px] text-[#475e75] truncate max-w-[200px]" title={r.notes}>
                      {r.notes || '—'}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(r)}
                      className="flex items-center gap-1 mx-auto px-2.5 py-1 text-[11px] font-medium text-[#0057d2] hover:bg-[#ebf8ff] border border-[#d5dce2] rounded-[4px] transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Koreksi / Input</span>
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredRecords.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-[#475e75]">
                  Tidak ada data pelaporan pada kriteria tanggal atau filter yang dipilih.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-[#f5f6f7] border-t border-[#d5dce2] font-bold">
            <tr>
              <td colSpan={3} className="py-2.5 px-4 text-[12px] text-[#000000]">
                Total Agregat Tanggal {formatIndoDate(selectedDate)}:
              </td>
              <td className="py-2.5 px-4 text-right text-[14px] text-[#000000] tabular-nums">
                {totalTarget.toLocaleString('id-ID')} PCS
              </td>
              <td className="py-2.5 px-4 text-right text-[14px] text-[#0057d2] tabular-nums">
                {totalActual.toLocaleString('id-ID')} PCS
              </td>
              <td className="py-2.5 px-4 text-center text-[12px] tabular-nums">
                {aggregateGap > 0 ? `+${aggregateGap.toLocaleString('id-ID')} Defisit` : `${aggregateGap.toLocaleString('id-ID')} PCS`}
              </td>
              <td className="py-2.5 px-4 text-center text-[12px] text-[#10683b] tabular-nums">
                {achievementRate}%
              </td>
              <td colSpan={2} className="py-2.5 px-4 text-[11px] text-[#475e75]">
                Gap dihitung on-the-fly tanpa kolom gap statis database (BR-PR-01)
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 5. Business Rule Callout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="p-3.5 bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] text-[12px]">
          <div className="font-bold text-[#000000] flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10683b]" />
            <span>Aturan Non-Carry-Over Gap (BR-PR-02 & BR-PR-03):</span>
          </div>
          <p className="text-[#475e75] leading-relaxed">
            Sistem tidak menambahkan gap defisit hari ini ke target produksi esok hari secara otomatis.
            Target harian esok hari tetap berpedoman penuh pada rencana awal SPK bulanan yang telah disahkan oleh PPIC.
          </p>
        </div>

        <div className="p-3.5 bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] text-[12px]">
          <div className="font-bold text-[#000000] flex items-center gap-1.5 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-[#8d4b00]" />
            <span>Aturan Persediaan Barang Jadi (BR-QC-02):</span>
          </div>
          <p className="text-[#475e75] leading-relaxed">
            Aktual produksi fisik pada dashboard ini mencerminkan output mentah mesin potong/slicing.
            Kuantitas stok barang jadi (Finished Goods) hanya bertambah setelah dilakukan verifikasi dan serah terima dokumen fisik oleh tim Quality Control (QC).
          </p>
        </div>
      </div>

      {/* 6. Modal Input / Koreksi Hasil Produksi (Simulasi) */}
      {editingRecord && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-input-aktual-title"
          className="fixed inset-0 z-50 bg-[#000000]/40 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#0057d2]" />
                <h3 id="modal-input-aktual-title" className="text-[14px] font-bold text-[#000000]">
                  Input Hasil Produksi Harian (Simulasi)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="p-1 text-[#475e75] hover:text-[#000000] rounded-[4px] cursor-pointer"
                aria-label="Tutup Form Input Aktual"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitActual} className="p-5 space-y-4 text-[13px]">
              {/* Context Summary */}
              <div className="p-3 bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] space-y-1">
                <div className="text-[11px] font-bold text-[#475e75]">Target Terkunci:</div>
                <div className="font-bold text-[#000000]">
                  {editingRecord.laneName} — {editingRecord.partNumber}
                </div>
                <div className="text-[11px] text-[#475e75] flex items-center justify-between pt-1">
                  <span>Target SPK: <strong>{editingRecord.targetPcs.toLocaleString('id-ID')} PCS</strong></span>
                  <span>Rasio: <strong>{editingRecord.packRatio} PCS/pack</strong></span>
                </div>
              </div>

              {/* Mode Input Selector */}
              <div className="flex items-center gap-2 p-1 bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px]">
                <button
                  type="button"
                  onClick={() => setInputMode('pack')}
                  className={`flex-1 py-1 text-[12px] font-semibold rounded-[3px] transition-colors cursor-pointer ${
                    inputMode === 'pack'
                      ? 'bg-[#0057d2] text-white shadow-xs'
                      : 'text-[#475e75] hover:text-[#000000]'
                  }`}
                >
                  Input Satuan Pack (Operator)
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('pcs')}
                  className={`flex-1 py-1 text-[12px] font-semibold rounded-[3px] transition-colors cursor-pointer ${
                    inputMode === 'pcs'
                      ? 'bg-[#0057d2] text-white shadow-xs'
                      : 'text-[#475e75] hover:text-[#000000]'
                  }`}
                >
                  Input Satuan PCS Langsung
                </button>
              </div>

              {/* Input Fields */}
              {inputMode === 'pack' ? (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#475e75] mb-1">
                    Jumlah Pack Terhitung (Pack Ratio: {editingRecord.packRatio} PCS/pack) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    required
                    value={inputPacks}
                    onChange={(e) => handlePacksChange(Number(e.target.value) || 0)}
                    className="w-full h-[36px] px-3 font-mono font-bold text-[14px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
                  />
                  <div className="text-[11px] text-[#0057d2] font-semibold mt-1">
                    Hasil Konversi Otomatis: {inputPcs.toLocaleString('id-ID')} PCS (BR-PR-04)
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#475e75] mb-1">
                    Kuantitas Aktual Produksi (PCS) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    required
                    value={inputPcs}
                    onChange={(e) => handlePcsChange(Number(e.target.value) || 0)}
                    className="w-full h-[36px] px-3 font-mono font-bold text-[14px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
                  />
                  <div className="text-[11px] text-[#475e75] mt-1">
                    Setara ~{inputPacks} Pack kemasan
                  </div>
                </div>
              )}

              {/* Live Gap Preview */}
              <div className="p-3 bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px]">
                <div className="text-[10px] uppercase font-bold text-[#475e75] mb-1">
                  Kalkulasi Gap On-The-Fly (Target - Aktual):
                </div>
                {(() => {
                  const liveGap = calculateProductionGap(editingRecord.targetPcs, inputPcs);
                  if (liveGap > 0) {
                    return (
                      <div className="text-[13px] font-bold text-[#8d4b00] flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Defisit +{liveGap.toLocaleString('id-ID')} PCS (Kurang dari kuota)</span>
                      </div>
                    );
                  }
                  if (liveGap === 0) {
                    return (
                      <div className="text-[13px] font-bold text-[#10683b] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Target Tercapai Tepat 0 Gap (100% Selesai)</span>
                      </div>
                    );
                  }
                  return (
                    <div className="text-[13px] font-bold text-[#0057d2] flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      <span>Surplus {liveGap.toLocaleString('id-ID')} PCS (Melebihi target)</span>
                    </div>
                  );
                })()}
              </div>

              {/* Downtime Reason Dropdown (BR-PR-08) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#475e75] mb-1">
                  Kategori Kendala / Downtime Lini (BR-PR-08)
                </label>
                <select
                  value={downtimeReason}
                  onChange={(e) => setDowntimeReason(e.target.value)}
                  className="w-full h-[34px] px-2 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
                >
                  <option value="None">Tidak Ada Kendala (Operasi Normal)</option>
                  <option value="Blade Sharpening">Blade Sharpening (Pengasahan Mata Pisau)</option>
                  <option value="Dies Changeover">Dies Changeover (Pergantian Tooling/Cetakan)</option>
                  <option value="Machine Repair">Machine Repair (Perbaikan Mesin Potong)</option>
                  <option value="Power Outage">Power Outage (Gangguan Suplai Listrik)</option>
                </select>
              </div>

              {/* Free Text Notes */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#475e75] mb-1">
                  Catatan Lapangan Operator / Supervisor
                </label>
                <input
                  type="text"
                  placeholder="misal: Kalibrasi pisau selesai pukul 10:15 WIB..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-[34px] px-3 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
                />
              </div>

              {/* Modal Buttons */}
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
                  Simpan Aktual Produksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
