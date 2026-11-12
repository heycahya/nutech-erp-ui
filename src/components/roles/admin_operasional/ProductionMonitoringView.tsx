/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Modul Produksi: Production Operations Monitoring & Dashboard (Admin Operasional)
 * BRD §2.1, §4.2, F-04, BR-ROL-02, BR-PR-01 s/d BR-PR-05
 */

import React from 'react';
import {
  Factory,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Info,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { DailyProductionRecord, ProductionLane, ProductionOrderSpk } from '../../../types/erp';

interface ProductionMonitoringViewProps {
  dailyRecords: DailyProductionRecord[];
  lanes: ProductionLane[];
  spkOrders: ProductionOrderSpk[];
  onNavigateTab: (tabId: string) => void;
  onOpenActualEntryModal: () => void;
}

export const ProductionMonitoringView: React.FC<ProductionMonitoringViewProps> = ({
  dailyRecords,
  lanes,
  spkOrders,
  onNavigateTab,
  onOpenActualEntryModal,
}) => {
  // Filter for reference date 2026-11-04
  const todayRecords = dailyRecords.filter((r) => r.date === '2026-11-04');
  const targetPabrik = todayRecords.reduce((s, r) => s + r.targetPcs, 0); // 6.800
  const aktualPabrik = todayRecords.reduce((s, r) => s + r.actualPcs, 0); // 6.750
  const totalGap = targetPabrik - aktualPabrik; // +50 (Defisit)
  const achievementRate = targetPabrik > 0 ? ((aktualPabrik / targetPabrik) * 100).toFixed(2) : '0';
  const totalNg = todayRecords.reduce((s, r) => s + (r.ngPcs || 0), 0); // Total NG tercatat
  const totalDowntime = todayRecords.reduce((s, r) => s + (r.downtimeMinutes || 0), 0); // Total downtime minutes

  return (
    <div className="flex-1 overflow-y-auto bg-[#ffffff] p-6 space-y-6">
      {/* 1. Header Banner Operasional Produksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d5dce2] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#ebf8ff] text-[#0057d2] border border-[#0057d2]/20 rounded-[4px] uppercase tracking-wider">
              Lantai Produksi (Shop Floor) · BR-ROL-02
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#f0f2f5] text-[#475e75] border border-[#d5dce2] rounded-[4px]">
              Tanggal Acuan: 04 Nov 2026
            </span>
          </div>
          <h1 className="text-[20px] font-bold text-[#000000] tracking-tight">
            Monitoring & Dashboard Operasional Produksi Lini
          </h1>
          <p className="text-[12px] text-[#545454] mt-0.5">
            Pengawasan real-time target PPIC vs aktual output operator, rasio konversi pack, catatan NG terpisah, dan downtime mesin.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateTab('prod-daily-report')}
            className="px-3.5 py-2 text-[12px] font-bold text-[#223548] bg-[#ffffff] border border-[#d5dce2] hover:bg-[#f5f6f7] rounded-[4px] cursor-pointer"
          >
            Buka Form Laporan Harian
          </button>
          <button
            type="button"
            onClick={onOpenActualEntryModal}
            className="px-4 py-2 text-[12px] font-bold text-white bg-[#0057d2] hover:bg-[#0049b0] rounded-[4px] flex items-center gap-1.5 shadow-none cursor-pointer"
          >
            <Factory className="w-4 h-4" />
            + Input Aktual Produksi
          </button>
        </div>
      </div>

      {/* 2. Banner Disiplin Operasional BRD (Pemisahan QC & FG) */}
      <div className="p-3.5 bg-[#fff8e1] border border-[#ffd54f]/80 rounded-[4px] text-[11px] text-[#8d4b00] flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-[#8d4b00] shrink-0 mt-0.5" />
        <div className="leading-snug space-y-0.5">
          <strong className="font-bold text-[#000000]">
            Peringatan Disiplin Operasional (BR-PR-01, BR-QC-02, BR-MAT-03):
          </strong>
          <div>
            Aktual produksi yang diinput operator di lantai produksi <strong>BUKAN stok Finished Goods (FG)</strong> dan <strong>TIDAK otomatis menambah persediaan FG</strong>. Seluruh output lini harus melewati verifikasi fisik QC sebelum diotorisasi menjadi saldo barang jadi resmi.
          </div>
        </div>
      </div>

      {/* 3. Ringkasan 4 Kartu KPI Produksi Hari Ini */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Target Pabrik PPIC */}
        <div className="bg-[#f8f9fa] border border-[#d5dce2] p-4 rounded-[4px]">
          <div className="flex items-center justify-between text-[#545454] text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>Target Pabrik (PPIC)</span>
            <Calendar className="w-4 h-4 text-[#0057d2]" />
          </div>
          <div className="text-[24px] font-bold text-[#000000] tabular-nums">
            {targetPabrik.toLocaleString('id-ID')}{' '}
            <span className="text-[13px] font-normal text-[#545454]">PCS</span>
          </div>
          <div className="text-[10px] text-[#545454] mt-1 flex items-center gap-1">
            <span className="font-bold text-[#10683b]">Terkunci Resmi</span> · Dari 3 SPK aktif
          </div>
        </div>

        {/* KPI 2: Aktual Produksi Lini */}
        <div className="bg-[#f8f9fa] border border-[#d5dce2] p-4 rounded-[4px]">
          <div className="flex items-center justify-between text-[#545454] text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>Aktual Output Lini</span>
            <Factory className="w-4 h-4 text-[#10683b]" />
          </div>
          <div className="text-[24px] font-bold text-[#000000] tabular-nums">
            {aktualPabrik.toLocaleString('id-ID')}{' '}
            <span className="text-[13px] font-normal text-[#545454]">PCS</span>
          </div>
          <div className="text-[10px] text-[#545454] mt-1 flex items-center gap-1">
            <span className="font-bold text-[#0057d2]">Capaian: {achievementRate}%</span> · Shift 1
          </div>
        </div>

        {/* KPI 3: Gap Agregat Produksi */}
        <div className="bg-[#f8f9fa] border border-[#d5dce2] p-4 rounded-[4px]">
          <div className="flex items-center justify-between text-[#545454] text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>Gap Produksi (Target - Act)</span>
            <TrendingUp className="w-4 h-4 text-[#c53929]" />
          </div>
          <div className="text-[24px] font-bold text-[#c53929] tabular-nums">
            +{totalGap.toLocaleString('id-ID')}{' '}
            <span className="text-[13px] font-normal text-[#c53929]">PCS</span>
          </div>
          <div className="text-[10px] text-[#c53929] mt-1 font-semibold">
            Defisit +50 PCS (Lini 1 -100, Lini 3 +50)
          </div>
        </div>

        {/* KPI 4: Kualitas & Kendala (NG & Downtime) */}
        <div className="bg-[#f8f9fa] border border-[#d5dce2] p-4 rounded-[4px]">
          <div className="flex items-center justify-between text-[#545454] text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>NG Fisik & Downtime</span>
            <AlertTriangle className="w-4 h-4 text-[#8d4b00]" />
          </div>
          <div className="text-[24px] font-bold text-[#000000] tabular-nums">
            {totalNg}{' '}
            <span className="text-[13px] font-normal text-[#545454]">PCS NG</span>
          </div>
          <div className="text-[10px] text-[#545454] mt-1 flex items-center gap-1">
            <span className="font-bold text-[#8d4b00]">{totalDowntime} Menit</span> · Kalibrasi Pisau Lini 1
          </div>
        </div>
      </div>

      {/* 4. Status Kinerja Lini Manufaktur (3 Lini Aktif + 1 Pending) */}
      <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden">
        <div className="px-4 py-3 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0057d2]" />
            <h2 className="text-[13px] font-bold text-[#000000]">
              Status Kinerja 4 Lini Manufaktur (Shift 1 Berjalan)
            </h2>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-[#ffffff] border border-[#d5dce2] text-[#475e75] rounded-[4px]">
            Formula: Gap = Target - Aktual
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#d5dce2]">
          {/* Lini 1: Rubber Cutting */}
          <div className="p-4 bg-[#ffffff] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#e8f0fe] text-[#0057d2] rounded-[4px]">
                LANE 1
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#fde8e8] text-[#c53929] rounded-[4px] border border-[#c53929]/20">
                Defisit +100 PCS
              </span>
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#000000]">Lane 1 (Rubber Cutting)</div>
              <div className="text-[11px] text-[#545454] font-mono mt-0.5">NTC-RUB-0101</div>
              <div className="text-[10px] text-[#545454] truncate">Gasket Seal Cylinder Head EPDM</div>
            </div>
            <div className="space-y-1.5 pt-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#545454]">Target PPIC:</span>
                <span className="font-bold tabular-nums">3.300 PCS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#545454]">Aktual Operator:</span>
                <span className="font-bold text-[#000000] tabular-nums">3.200 PCS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#545454]">Input Pack (Ratio 50):</span>
                <span className="font-mono tabular-nums text-[#475e75]">64 Pack</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#eaecee]">
                <span className="text-[#545454]">NG & Downtime:</span>
                <span className="font-bold text-[#8d4b00]">15 NG · 45 Mnt</span>
              </div>
            </div>
            <div className="p-2 bg-[#f8f9fa] rounded-[4px] text-[10px] text-[#545454]">
              <strong>Catatan:</strong> Kalibrasi pisau potong shift pagi.
            </div>
          </div>

          {/* Lini 2: Foam Slicing */}
          <div className="p-4 bg-[#ffffff] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#e8f0fe] text-[#0057d2] rounded-[4px]">
                LANE 2
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#eaf6ef] text-[#10683b] rounded-[4px] border border-[#10683b]/20">
                Tercapai (0 Gap)
              </span>
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#000000]">Lane 2 (Foam Slicing)</div>
              <div className="text-[11px] text-[#545454] font-mono mt-0.5">NTC-FOAM-0201</div>
              <div className="text-[10px] text-[#545454] truncate">Acoustic Foam Barrier Firewall 10mm</div>
            </div>
            <div className="space-y-1.5 pt-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#545454]">Target PPIC:</span>
                <span className="font-bold tabular-nums">2.500 PCS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#545454]">Aktual Operator:</span>
                <span className="font-bold text-[#10683b] tabular-nums">2.500 PCS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#545454]">Input Pack (Ratio 25):</span>
                <span className="font-mono tabular-nums text-[#475e75]">100 Pack</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#eaecee]">
                <span className="text-[#545454]">NG & Downtime:</span>
                <span className="font-bold text-[#10683b]">8 NG · 0 Mnt</span>
              </div>
            </div>
            <div className="p-2 bg-[#f8f9fa] rounded-[4px] text-[10px] text-[#545454]">
              <strong>Catatan:</strong> Target tercapai sempurna (100%).
            </div>
          </div>

          {/* Lini 3: EVA Die-cut */}
          <div className="p-4 bg-[#ffffff] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#e8f0fe] text-[#0057d2] rounded-[4px]">
                LANE 3
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#ebf8ff] text-[#0057d2] rounded-[4px] border border-[#0057d2]/20">
                Surplus -50 PCS
              </span>
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#000000]">Lane 3 (EVA Die-cut)</div>
              <div className="text-[11px] text-[#545454] font-mono mt-0.5">NTC-EVA-0301</div>
              <div className="text-[10px] text-[#545454] truncate">EVA Sponge Weatherstrip Door Sash</div>
            </div>
            <div className="space-y-1.5 pt-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#545454]">Target PPIC:</span>
                <span className="font-bold tabular-nums">1.000 PCS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#545454]">Aktual Operator:</span>
                <span className="font-bold text-[#0057d2] tabular-nums">1.050 PCS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#545454]">Input Pack (Ratio 100):</span>
                <span className="font-mono tabular-nums text-[#475e75]">11 Pack</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#eaecee]">
                <span className="text-[#545454]">NG & Downtime:</span>
                <span className="font-bold text-[#10683b]">12 NG · 0 Mnt</span>
              </div>
            </div>
            <div className="p-2 bg-[#f8f9fa] rounded-[4px] text-[10px] text-[#545454]">
              <strong>Catatan:</strong> Output melampaui kuota (+50 PCS).
            </div>
          </div>

          {/* Lini 4: Assembly & Packing (Pending TBD) */}
          <div className="p-4 bg-[#fbfcfd] space-y-3 opacity-80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#f0f2f5] text-[#545454] rounded-[4px]">
                LANE 4
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#f0f2f5] text-[#545454] rounded-[4px] border border-[#d5dce2]">
                PENDING (TBD)
              </span>
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#545454]">Lane 4 (Assembly & Packing)</div>
              <div className="text-[11px] text-[#788896] mt-0.5">Konfigurasi Belum Aktif</div>
              <div className="text-[10px] text-[#788896]">Ekspansi Fase Mendatang</div>
            </div>
            <div className="p-3 bg-[#f0f2f5] border border-[#d5dce2] rounded-[4px] text-[10px] text-[#545454] leading-relaxed">
              BRD §2.1 hanya mengonfirmasi 3 lini manufaktur aktif (Rubber, Foam, EVA). Lane 4 dinonaktifkan dari pelaporan.
            </div>
          </div>
        </div>
      </div>

      {/* 5. Aksi Cepat & Navigasi Terkait */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateTab('prod-daily-report')}
          className="p-4 border border-[#d5dce2] rounded-[4px] hover:border-[#0057d2] hover:bg-[#f8f9fa] transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 text-[#0057d2] mb-1.5">
              <Factory className="w-4 h-4" />
              <h3 className="text-[12px] font-bold text-[#000000]">Laporan Harian & Input Aktual</h3>
            </div>
            <p className="text-[11px] text-[#545454] leading-relaxed">
              Buka formulir input aktual produksi operator per shift, konversi pack-to-PCS, dan pelaporan NG.
            </p>
          </div>
          <div className="text-[10px] font-bold text-[#0057d2] flex items-center gap-1 mt-3">
            Buka Laporan Harian <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('prod-downtime')}
          className="p-4 border border-[#d5dce2] rounded-[4px] hover:border-[#0057d2] hover:bg-[#f8f9fa] transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 text-[#8d4b00] mb-1.5">
              <Clock className="w-4 h-4" />
              <h3 className="text-[12px] font-bold text-[#000000]">Monitoring Downtime Lini</h3>
            </div>
            <p className="text-[11px] text-[#545454] leading-relaxed">
              Pantau insiden blade sharpening, tooling changeover, dan kendala mekanik yang memengaruhi target.
            </p>
          </div>
          <div className="text-[10px] font-bold text-[#8d4b00] flex items-center gap-1 mt-3">
            Lihat Rekap Downtime <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('prod-fg-stocks')}
          className="p-4 border border-[#d5dce2] rounded-[4px] hover:border-[#0057d2] hover:bg-[#f8f9fa] transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 text-[#10683b] mb-1.5">
              <Layers className="w-4 h-4" />
              <h3 className="text-[12px] font-bold text-[#000000]">Stok Multi-Lokasi FG (7.200 PCS)</h3>
            </div>
            <p className="text-[11px] text-[#545454] leading-relaxed">
              Saldo fisik Finished Goods pada 2 lokasi sah: Ujung Lini (4.200) dan Gudang FG (3.000).
            </p>
          </div>
          <div className="text-[10px] font-bold text-[#10683b] flex items-center gap-1 mt-3">
            Lihat Stok Barang Jadi <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
