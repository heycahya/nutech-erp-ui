/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Modul Produksi: Laporan Produksi Harian & Input Aktual (Admin Operasional)
 * BRD §4.2, F-04, BR-PR-01 s/d BR-PR-05
 */

import React, { useState, useMemo } from 'react';
import {
  Factory,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  X,
  Plus,
  AlertCircle,
  FileText,
  Calculator,
  Lock,
  Calendar,
} from 'lucide-react';
import {
  DailyProductionRecord,
  ProductionLane,
  ProductionOrderSpk,
  PackConversionConfig,
  PartItem,
} from '../../../types/erp';
import { calculatePackToPcs, calculateProductionAchievement, validateProductionActualEntry } from '../../../utils/logic';

interface DailyProductionReportViewProps {
  dailyRecords: DailyProductionRecord[];
  lanes: ProductionLane[];
  spkOrders: ProductionOrderSpk[];
  packConfigs: PackConversionConfig[];
  parts: PartItem[];
  onSaveDailyActual: (
    recordId: string,
    actualPcs: number,
    actualPacks?: number,
    downtimeReason?: string,
    notes?: string,
    ngPcs?: number,
    ngReason?: string,
    operatorName?: string,
    shiftNumber?: number
  ) => void;
  onAddNewDailyRecord?: (newRecord: DailyProductionRecord) => void;
  isModalOpen?: boolean;
  setIsModalOpen?: (open: boolean) => void;
}

export const DailyProductionReportView: React.FC<DailyProductionReportViewProps> = ({
  dailyRecords,
  lanes,
  spkOrders,
  packConfigs,
  parts,
  onSaveDailyActual,
  onAddNewDailyRecord,
  isModalOpen,
  setIsModalOpen,
}) => {
  const [internalModalOpen, setInternalModalOpen] = useState<boolean>(false);
  const modalOpen = isModalOpen !== undefined ? isModalOpen : internalModalOpen;
  const setModalOpen = setIsModalOpen || setInternalModalOpen;
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    dailyRecords[0]?.id || 'dpr-04-1'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterLane, setFilterLane] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');

  // Form state for Entry / Edit Modal
  const [formDate, setFormDate] = useState<string>('2026-11-04');
  const [formLaneId, setFormLaneId] = useState<string>('lane-1');
  const [formPartId, setFormPartId] = useState<string>('PART-001');
  const [formSpkId, setFormSpkId] = useState<string>('spk-1');
  const [inputMode, setInputMode] = useState<'pcs' | 'pack'>('pcs');
  const [formPackCount, setFormPackCount] = useState<number>(64);
  const [formPcsCount, setFormPcsCount] = useState<number>(3200);
  const [formNgCount, setFormNgCount] = useState<number>(15);
  const [formNgReason, setFormNgReason] = useState<string>('Ujung profil retak mikro');
  const [formDowntimeReason, setFormDowntimeReason] = useState<string>('Blade Sharpening');
  const [formDowntimeMinutes, setFormDowntimeMinutes] = useState<number>(45);
  const [formOperatorName, setFormOperatorName] = useState<string>('Supardi (Foreman Lini 1)');
  const [formShiftNumber, setFormShiftNumber] = useState<number>(1);
  const [formNotes, setFormNotes] = useState<string>('Kalibrasi pisau potong shift pagi.');
  const [formError, setFormError] = useState<string | null>(null);

  // Available unique dates
  const uniqueDates = useMemo(() => {
    return Array.from(new Set(dailyRecords.map((r) => r.date))).sort().reverse();
  }, [dailyRecords]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return dailyRecords.filter((rec) => {
      const matchSearch =
        rec.spkNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.laneName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rec.notes || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchLane = filterLane === 'all' || rec.laneId === filterLane;
      const matchDate = filterDate === 'all' || rec.date === filterDate;

      return matchSearch && matchLane && matchDate;
    });
  }, [dailyRecords, searchQuery, filterLane, filterDate]);

  // Selected record detail
  const selectedRecord = useMemo(() => {
    return dailyRecords.find((r) => r.id === selectedRecordId) || dailyRecords[0];
  }, [dailyRecords, selectedRecordId]);

  // Active SPK and target for the selected form lane
  const activeSpkForLane = useMemo(() => {
    return spkOrders.find((s) => s.laneId === formLaneId && s.status === 'Active') || spkOrders[0];
  }, [spkOrders, formLaneId]);

  // Configured pack ratio for current form lane + part
  const currentPackRatio = useMemo(() => {
    const cfg = packConfigs.find(
      (c) => c.laneId === formLaneId && c.partId === formPartId
    );
    if (cfg && cfg.packRatio > 0) return cfg.packRatio;
    const pt = parts.find((p) => p.id === formPartId);
    return pt?.defaultPackRatio || 50;
  }, [packConfigs, parts, formLaneId, formPartId]);

  // Current locked PPIC target for form
  const currentPpicTarget = useMemo(() => {
    const spkItem = activeSpkForLane?.items.find((it) => it.partId === formPartId);
    return spkItem?.dailyTargetPcs || 3300;
  }, [activeSpkForLane, formPartId]);

  // On pack count change, auto-convert to PCS
  const handlePackChange = (packs: number) => {
    setFormPackCount(packs);
    const calculatedPcs = calculatePackToPcs(packs, currentPackRatio);
    setFormPcsCount(calculatedPcs);
  };

  // Open modal prefilled with selected record or default
  const handleOpenModal = (rec?: DailyProductionRecord) => {
    if (rec) {
      setFormDate(rec.date);
      setFormLaneId(rec.laneId);
      setFormPartId(rec.partId);
      setFormSpkId(rec.spkId);
      setFormPcsCount(rec.actualPcs);
      setFormPackCount(rec.actualPacks || Math.floor(rec.actualPcs / (rec.packRatio || 50)));
      setFormNgCount(rec.ngPcs || 0);
      setFormNgReason(rec.ngReason || 'None');
      setFormDowntimeReason(rec.downtimeReason || 'None');
      setFormDowntimeMinutes(rec.downtimeMinutes || 0);
      setFormOperatorName(rec.operatorName || 'Supardi (Foreman Lini)');
      setFormShiftNumber(rec.shiftNumber || 1);
      setFormNotes(rec.notes || '');
    } else {
      setFormDate('2026-11-04');
      setFormLaneId('lane-1');
      setFormPartId('PART-001');
      setFormPcsCount(3200);
      setFormPackCount(64);
      setFormNgCount(15);
      setFormNgReason('Ujung profil retak mikro');
      setFormDowntimeReason('Blade Sharpening');
      setFormDowntimeMinutes(45);
      setFormOperatorName('Supardi (Foreman Lini 1)');
      setFormShiftNumber(1);
      setFormNotes('Kalibrasi pisau potong shift pagi.');
    }
    setFormError(null);
    setModalOpen(true);
  };

  // Submit Handler
  const handleSubmitEntry = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validation = validateProductionActualEntry({
      laneId: formLaneId,
      date: formDate,
      partId: formPartId,
      targetPcs: currentPpicTarget,
      actualPcs: formPcsCount,
      actualPacks: formPackCount,
      packRatio: currentPackRatio,
      ngPcs: formNgCount,
    });

    if (!validation.isValid) {
      setFormError(validation.errors[0]);
      return;
    }

    // Check if updating existing record or adding new
    const existingRec = dailyRecords.find(
      (r) => r.date === formDate && r.laneId === formLaneId && r.partId === formPartId
    );

    if (existingRec) {
      onSaveDailyActual(
        existingRec.id,
        formPcsCount,
        formPackCount,
        formDowntimeReason,
        formNotes,
        formNgCount,
        formNgReason,
        formOperatorName,
        formShiftNumber
      );
    } else if (onAddNewDailyRecord) {
      const partObj = parts.find((p) => p.id === formPartId);
      const laneObj = lanes.find((l) => l.id === formLaneId);
      const newRec: DailyProductionRecord = {
        id: `dpr-sim-${Date.now()}`,
        spkId: activeSpkForLane.id,
        spkNumber: activeSpkForLane.spkNumber,
        date: formDate,
        laneId: formLaneId,
        laneName: laneObj?.name || formLaneId,
        partId: formPartId,
        partNumber: partObj?.partNumber || 'PART',
        partDescription: partObj?.description || 'Part Component',
        targetPcs: currentPpicTarget,
        actualPcs: formPcsCount,
        actualPacks: formPackCount,
        packRatio: currentPackRatio,
        gapPcs: currentPpicTarget - formPcsCount,
        ngPcs: formNgCount,
        ngReason: formNgReason,
        downtimeReason: formDowntimeReason,
        downtimeMinutes: formDowntimeMinutes,
        operatorName: formOperatorName,
        shiftNumber: formShiftNumber,
        notes: formNotes,
        isUrgent: false,
      };
      onAddNewDailyRecord(newRec);
    }

    setModalOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#ffffff] p-6 space-y-5">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d5dce2] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#ebf8ff] text-[#0057d2] border border-[#0057d2]/20 rounded-[4px] uppercase tracking-wider">
              FEAT-PR-02 · BR-PR-01 s/d BR-PR-05
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#f0f2f5] text-[#475e75] border border-[#d5dce2] rounded-[4px]">
              PELAPORAN OPERATOR LINI
            </span>
          </div>
          <h1 className="text-[20px] font-bold text-[#000000] tracking-tight">
            Laporan Produksi Harian & Input Aktual Lini
          </h1>
          <p className="text-[12px] text-[#545454] mt-0.5">
            Pencatatan realisasi output mesin dari lembar kerja operator. Target PPIC terkunci secara sistem dan tidak dapat diubah oleh operator.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="px-4 py-2 text-[12px] font-bold text-white bg-[#0057d2] hover:bg-[#0049b0] rounded-[4px] flex items-center gap-1.5 shadow-none cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          + Input Aktual Produksi Harian
        </button>
      </div>

      {/* 2. Banner Disiplin Operasional BRD */}
      <div className="p-3.5 bg-[#fff8e1] border border-[#ffd54f]/80 rounded-[4px] text-[11px] text-[#8d4b00] flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-[#8d4b00] shrink-0 mt-0.5" />
        <div className="leading-snug">
          <strong className="font-bold text-[#000000]">
            Aturan Mutlak BRD: Aktual Produksi ≠ Penambahan Stok Finished Goods (BR-MAT-03 & BR-QC-02)
          </strong>
          <div className="mt-0.5">
            Input hasil produksi harian ini murni mencatat kinerja lini mesin. Sistem <strong>TIDAK</strong> secara otomatis menambah saldo Finished Goods (FG). Saldo barang jadi baru bertambah setelah melewati proses verifikasi fisik QC resmi.
          </div>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#f8f9fa] border border-[#d5dce2] p-3 rounded-[4px]">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-[#545454] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari SPK, Part Number, Lini..."
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
              <option value="all">Semua Lini (Lane 1-3)</option>
              <option value="lane-1">Lane 1 (Rubber)</option>
              <option value="lane-2">Lane 2 (Foam)</option>
              <option value="lane-3">Lane 3 (EVA)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-[#545454] text-[10px] font-bold uppercase">Tanggal:</span>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-2 py-1.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] text-[11px]"
            >
              <option value="all">Semua Tanggal</option>
              {uniqueDates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-[11px] text-[#545454]">
          Menampilkan <strong>{filteredRecords.length}</strong> catatan produksi
        </div>
      </div>

      {/* 4. Split-Pane Layout (Tabel Catatan Harian + Detail Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Table (7 Columns) */}
        <div className="lg:col-span-7 border border-[#d5dce2] rounded-[4px] overflow-hidden">
          <div className="px-4 py-2.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
            <h3 className="text-[12px] font-bold text-[#000000]">
              Daftar Catatan Aktual Harian Lini
            </h3>
            <span className="text-[10px] text-[#545454]">Klik baris untuk melihat detail</span>
          </div>

          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-[#ffffff] border-b border-[#d5dce2] text-[10px] font-bold text-[#545454] uppercase tracking-wider">
                <th className="py-2.5 px-3">Tanggal & Lini</th>
                <th className="py-2.5 px-3">Part & SPK</th>
                <th className="py-2.5 px-3 text-right">Target (PPIC)</th>
                <th className="py-2.5 px-3 text-right">Aktual Lini</th>
                <th className="py-2.5 px-3 text-center">Gap</th>
                <th className="py-2.5 px-3 text-right">NG</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaecee]">
              {filteredRecords.map((rec) => {
                const isSelected = rec.id === selectedRecordId;
                const isDeficit = rec.gapPcs > 0;
                const isSurplus = rec.gapPcs < 0;

                return (
                  <tr
                    key={rec.id}
                    onClick={() => setSelectedRecordId(rec.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#e8f0fe]/60' : 'hover:bg-[#f8f9fa]'
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-mono text-[#000000] font-bold text-[10px]">{rec.date}</div>
                      <div className="text-[10px] text-[#475e75]">{rec.laneName.split(' ')[0]}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-[#0057d2] text-[10px]">{rec.partNumber}</div>
                      <div className="text-[10px] text-[#545454] truncate max-w-[140px]">{rec.partDescription}</div>
                      <div className="text-[9px] text-[#788896] font-mono">{rec.spkNumber}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-medium text-[#475e75]">
                      {rec.targetPcs.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-bold text-[#000000]">
                      {rec.actualPcs.toLocaleString('id-ID')}
                      {rec.actualPacks !== undefined && (
                        <div className="text-[9px] text-[#788896]">({rec.actualPacks} pack)</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {isDeficit && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#fde8e8] text-[#c53929] rounded-[3px] border border-[#c53929]/20">
                          +{rec.gapPcs}
                        </span>
                      )}
                      {isSurplus && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#ebf8ff] text-[#0057d2] rounded-[3px] border border-[#0057d2]/20">
                          {rec.gapPcs}
                        </span>
                      )}
                      {!isDeficit && !isSurplus && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#eaf6ef] text-[#10683b] rounded-[3px] border border-[#10683b]/20">
                          0
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-[#8d4b00] font-semibold">
                      {rec.ngPcs || 0}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(rec);
                        }}
                        className="px-2 py-0.5 text-[10px] font-bold text-[#0057d2] hover:bg-[#ebf8ff] border border-[#0057d2]/30 rounded-[3px] cursor-pointer"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right Split-Pane Detail (5 Columns) */}
        {selectedRecord && (
          <div className="lg:col-span-5 border border-[#d5dce2] rounded-[4px] overflow-hidden bg-[#ffffff] space-y-0">
            <div className="px-4 py-3 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#545454] uppercase tracking-wider block">
                  Detail Laporan Harian
                </span>
                <h3 className="text-[13px] font-bold text-[#000000]">
                  {selectedRecord.laneName} · {selectedRecord.date}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleOpenModal(selectedRecord)}
                className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#0057d2] hover:bg-[#0049b0] rounded-[3px] cursor-pointer"
              >
                Koreksi Catatan
              </button>
            </div>

            <div className="p-4 space-y-4 text-[11px]">
              {/* Part & SPK Info */}
              <div className="p-3 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px] space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-[#0057d2] text-[12px]">
                    {selectedRecord.partNumber}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#ffffff] border border-[#d5dce2] rounded-[3px]">
                    {selectedRecord.spkNumber}
                  </span>
                </div>
                <div className="font-semibold text-[#1a1a1a]">{selectedRecord.partDescription}</div>
              </div>

              {/* Realisasi vs Target */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-[#d5dce2] rounded-[4px]">
                  <span className="text-[10px] text-[#545454] uppercase tracking-wider block flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#545454]" /> Target PPIC (Terkunci)
                  </span>
                  <div className="text-[18px] font-bold text-[#000000] tabular-nums mt-0.5">
                    {selectedRecord.targetPcs.toLocaleString('id-ID')}{' '}
                    <span className="text-[10px] font-normal text-[#545454]">PCS</span>
                  </div>
                </div>

                <div className="p-3 border border-[#d5dce2] rounded-[4px]">
                  <span className="text-[10px] text-[#545454] uppercase tracking-wider block">
                    Aktual Produksi Lini
                  </span>
                  <div className="text-[18px] font-bold text-[#10683b] tabular-nums mt-0.5">
                    {selectedRecord.actualPcs.toLocaleString('id-ID')}{' '}
                    <span className="text-[10px] font-normal text-[#545454]">PCS</span>
                  </div>
                  {selectedRecord.actualPacks !== undefined && (
                    <div className="text-[9px] text-[#545454] mt-0.5">
                      Input pack: {selectedRecord.actualPacks} pack × {selectedRecord.packRatio} PCS
                    </div>
                  )}
                </div>
              </div>

              {/* Status Gap & Capaian */}
              <div className="p-3 border border-[#d5dce2] rounded-[4px] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#545454] uppercase block">Gap Produksi:</span>
                  <span className="text-[14px] font-bold text-[#000000] tabular-nums">
                    {selectedRecord.gapPcs > 0 ? `+${selectedRecord.gapPcs}` : selectedRecord.gapPcs} PCS
                  </span>
                  <span className="text-[10px] text-[#545454] ml-1">
                    ({selectedRecord.gapPcs > 0 ? 'Defisit' : selectedRecord.gapPcs < 0 ? 'Surplus' : 'Tercapai'})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#545454] uppercase block">Pencapaian:</span>
                  <span className="text-[14px] font-bold text-[#0057d2] tabular-nums">
                    {calculateProductionAchievement(selectedRecord.actualPcs, selectedRecord.targetPcs)}%
                  </span>
                </div>
              </div>

              {/* Catatan Kualitas NG & Downtime */}
              <div className="p-3 border border-[#d5dce2] rounded-[4px] space-y-2 bg-[#fbfcfd]">
                <div className="font-bold text-[#000000] text-[11px]">Laporan Mutu & Kendala Mesin:</div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#545454]">Kuantitas NG Fisik:</span>
                  <span className="font-bold text-[#8d4b00]">{selectedRecord.ngPcs || 0} PCS</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#545454]">Alasan NG:</span>
                  <span className="text-[#000000]">{selectedRecord.ngReason || 'Tidak ada cacat mayor'}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] pt-1 border-t border-[#eaecee]">
                  <span className="text-[#545454]">Downtime Lini:</span>
                  <span className="font-bold text-[#000000]">
                    {selectedRecord.downtimeReason || 'None'}{' '}
                    {selectedRecord.downtimeMinutes ? `(${selectedRecord.downtimeMinutes} mnt)` : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#545454]">Operator / Shift:</span>
                  <span className="text-[#000000]">
                    {selectedRecord.operatorName || 'Foreman Lini'} (Shift {selectedRecord.shiftNumber || 1})
                  </span>
                </div>
              </div>

              {/* Catatan Operasional */}
              {selectedRecord.notes && (
                <div className="p-3 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px] text-[10px] text-[#545454]">
                  <strong>Keterangan Lembar Kerja:</strong> "{selectedRecord.notes}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5. MODAL INPUT AKTUAL PRODUKSI HARIAN */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#000000]/50 flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-bold text-[#000000]">
                  Formulir Pelaporan Aktual Produksi Lini
                </h3>
                <p className="text-[11px] text-[#545454]">
                  Input kuantitas fisik output shift berjalan dari lembar kerja operator
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-[#545454] hover:text-[#000000] rounded-[4px] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitEntry} className="p-5 space-y-4 text-[11px]">
              {formError && (
                <div className="p-3 bg-[#fde8e8] border border-[#c53929]/40 rounded-[4px] text-[11px] text-[#c53929] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Warning Disiplin */}
              <div className="p-2.5 bg-[#fff8e1] border border-[#ffd54f]/80 rounded-[4px] text-[10px] text-[#8d4b00]">
                <strong>Disiplin Mutu:</strong> Kuantitas aktual yang diinput tidak otomatis menjadi stok Finished Goods (FG) sebelum lolos verifikasi sortir QC fisik.
              </div>

              {/* Tanggal & Lini */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#545454] uppercase tracking-wider mb-1">
                    Tanggal Produksi *
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-[#d5dce2] rounded-[4px] text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#545454] uppercase tracking-wider mb-1">
                    Lini Manufaktur *
                  </label>
                  <select
                    value={formLaneId}
                    onChange={(e) => {
                      setFormLaneId(e.target.value);
                      if (e.target.value === 'lane-1') setFormPartId('PART-001');
                      else if (e.target.value === 'lane-2') setFormPartId('PART-003');
                      else if (e.target.value === 'lane-3') setFormPartId('PART-005');
                    }}
                    className="w-full px-3 py-1.5 border border-[#d5dce2] rounded-[4px] text-[11px]"
                  >
                    <option value="lane-1">Lane 1 (Rubber Cutting)</option>
                    <option value="lane-2">Lane 2 (Foam Slicing)</option>
                    <option value="lane-3">Lane 3 (EVA Die-cut)</option>
                    <option value="lane-4" disabled>Lane 4 (Pending Configuration)</option>
                  </select>
                </div>
              </div>

              {/* Part Component & SPK */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#545454] uppercase tracking-wider mb-1">
                    Part Komponen *
                  </label>
                  <select
                    value={formPartId}
                    onChange={(e) => setFormPartId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#d5dce2] rounded-[4px] text-[11px]"
                  >
                    {parts
                      .filter((p) => {
                        if (formLaneId === 'lane-1') return p.category === 'Karet / Rubber';
                        if (formLaneId === 'lane-2') return p.category === 'Busa / Foam';
                        if (formLaneId === 'lane-3') return p.category === 'EVA Sponge';
                        return true;
                      })
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.partNumber} — {p.description}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#545454] uppercase tracking-wider mb-1">
                    Target PPIC Harian (Terkunci)
                  </label>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f0f2f5] border border-[#d5dce2] rounded-[4px] text-[11px] font-bold text-[#000000]">
                    <Lock className="w-3.5 h-3.5 text-[#545454]" />
                    <span className="tabular-nums">{currentPpicTarget.toLocaleString('id-ID')} PCS</span>
                    <span className="text-[10px] text-[#545454] font-normal">({activeSpkForLane.spkNumber})</span>
                  </div>
                </div>
              </div>

              {/* Mode Input: PCS vs Pack */}
              <div className="p-3 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#545454] uppercase">
                    Metode Input Kuantitas:
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                      <input
                        type="radio"
                        name="inputMode"
                        checked={inputMode === 'pcs'}
                        onChange={() => setInputMode('pcs')}
                      />
                      Langsung PCS
                    </label>
                    <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                      <input
                        type="radio"
                        name="inputMode"
                        checked={inputMode === 'pack'}
                        onChange={() => setInputMode('pack')}
                      />
                      Hitungan Pack ({currentPackRatio} PCS/pack)
                    </label>
                  </div>
                </div>

                {inputMode === 'pack' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-[#545454] mb-1">
                        Jumlah Pack:
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formPackCount}
                        onChange={(e) => handlePackChange(parseInt(e.target.value, 10) || 0)}
                        className="w-full px-3 py-1.5 border border-[#d5dce2] rounded-[4px] text-[12px] font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#545454] mb-1">
                        Hasil Konversi PCS:
                      </label>
                      <div className="px-3 py-1.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] text-[12px] font-bold text-[#0057d2] tabular-nums">
                        {formPcsCount.toLocaleString('id-ID')} PCS
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-[#545454] mb-1">
                      Kuantitas Aktual Produksi (PCS) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formPcsCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setFormPcsCount(val);
                        setFormPackCount(Math.floor(val / currentPackRatio));
                      }}
                      className="w-full px-3 py-1.5 border border-[#d5dce2] rounded-[4px] text-[12px] font-bold text-[#000000]"
                    />
                  </div>
                )}

                {/* Live Gap Preview */}
                <div className="pt-2 border-t border-[#eaecee] flex items-center justify-between text-[11px]">
                  <span>Preview Gap Produksi:</span>
                  <div className="font-bold tabular-nums">
                    {currentPpicTarget - formPcsCount > 0 && (
                      <span className="text-[#c53929]">+{currentPpicTarget - formPcsCount} PCS (Defisit)</span>
                    )}
                    {currentPpicTarget - formPcsCount < 0 && (
                      <span className="text-[#0057d2]">{currentPpicTarget - formPcsCount} PCS (Surplus)</span>
                    )}
                    {currentPpicTarget - formPcsCount === 0 && (
                      <span className="text-[#10683b]">0 PCS (Target Tercapai Sempurna)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* NG Fisik & Downtime */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#545454] uppercase tracking-wider mb-1">
                    Jumlah NG / Cacat Fisik (PCS)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formNgCount}
                    onChange={(e) => setFormNgCount(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-1.5 border border-[#d5dce2] rounded-[4px] text-[11px]"
                  />
                  <span className="text-[9px] text-[#545454]">Dicatat terpisah dari aktual</span>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#545454] uppercase tracking-wider mb-1">
                    Kategori / Alasan NG
                  </label>
                  <select
                    value={formNgReason}
                    onChange={(e) => setFormNgReason(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#d5dce2] rounded-[4px] text-[11px]"
                  >
                    <option value="None">None (Nihil)</option>
                    <option value="Ujung profil retak mikro">Ujung profil retak mikro</option>
                    <option value="Cacat gelembung pori busa">Cacat gelembung pori busa</option>
                    <option value="Toleransi presisi dies kiss-cut">Toleransi presisi dies kiss-cut</option>
                    <option value="Dimensi tebal di luar batas toleransi">Dimensi tebal di luar batas toleransi</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </select>
                </div>
              </div>

              {/* Downtime & Operator */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#545454] uppercase tracking-wider mb-1">
                    Downtime Mesin
                  </label>
                  <select
                    value={formDowntimeReason}
                    onChange={(e) => setFormDowntimeReason(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#d5dce2] rounded-[4px] text-[11px]"
                  >
                    <option value="None">None (Normal)</option>
                    <option value="Blade Sharpening">Blade Sharpening</option>
                    <option value="Dies Changeover">Dies Changeover</option>
                    <option value="Machine Repair">Machine Repair</option>
                    <option value="Power Outage">Power Outage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#545454] uppercase tracking-wider mb-1">
                    Durasi (Menit)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formDowntimeMinutes}
                    onChange={(e) => setFormDowntimeMinutes(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-1.5 border border-[#d5dce2] rounded-[4px] text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#545454] uppercase tracking-wider mb-1">
                    Shift Kerja
                  </label>
                  <select
                    value={formShiftNumber}
                    onChange={(e) => setFormShiftNumber(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-1.5 border border-[#d5dce2] rounded-[4px] text-[11px]"
                  >
                    <option value={1}>Shift 1 (08:00 - 16:00)</option>
                    <option value={2}>Shift 2 (16:00 - 00:00)</option>
                    <option value={3}>Shift 3 (00:00 - 08:00)</option>
                  </select>
                </div>
              </div>

              {/* Operator Name & Notes */}
              <div>
                <label className="block text-[10px] font-bold text-[#545454] uppercase tracking-wider mb-1">
                  Nama Operator / Foreman Pelapor
                </label>
                <input
                  type="text"
                  value={formOperatorName}
                  onChange={(e) => setFormOperatorName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#d5dce2] rounded-[4px] text-[11px]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#545454] uppercase tracking-wider mb-1">
                  Catatan Lembar Kerja Operator
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Catatan kondisi mesin, pergantian mata pisau, hasil visual..."
                  className="w-full px-3 py-1.5 border border-[#d5dce2] rounded-[4px] text-[11px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#d5dce2] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-[12px] font-bold text-[#545454] bg-[#ffffff] border border-[#d5dce2] hover:bg-[#f5f6f7] rounded-[4px] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-[12px] font-bold text-white bg-[#0057d2] hover:bg-[#0049b0] rounded-[4px] shadow-none cursor-pointer"
                >
                  Simpan Catatan Aktual Lini
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
