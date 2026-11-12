/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Domain 1: Production Performance Hero Card (FEAT-DSH-01, BRD §2.1, BR-SPK, BR-PR-01)
 * Formula Baku: Gap = Target - Aktual, Achievement = (Aktual / Target) * 100
 */

import React from 'react';
import { Factory, TrendingUp, AlertTriangle, CheckCircle2, MinusCircle } from 'lucide-react';
import { calculateProductionGap, calculateProductionAchievement } from '../../../utils/logic';

interface ProductionLaneData {
  id: string;
  laneName: string;
  processType: string;
  partNumber: string;
  partDescription: string;
  targetQtyPcs: number;
  actualQtyPcs: number;
  statusNotes: string;
}

const LANES_DATA: ProductionLaneData[] = [
  {
    id: 'lane-1',
    laneName: 'Lini 1: Rubber Cutting',
    processType: 'Continuous Cutting & Molding EPDM',
    partNumber: 'NTC-RUB-0101',
    partDescription: 'Gasket Seal Cylinder Head EPDM',
    targetQtyPcs: 3300,
    actualQtyPcs: 3200,
    statusNotes: 'Normal Operations · Kalibrasi Pisau Shift Pagi',
  },
  {
    id: 'lane-2',
    laneName: 'Lini 2: Foam Slicing',
    processType: 'Horizontal Splitting & Acoustic Lamination',
    partNumber: 'NTC-FOAM-0201',
    partDescription: 'Acoustic Foam Barrier Firewall 10mm',
    targetQtyPcs: 2500,
    actualQtyPcs: 2500,
    statusNotes: 'Target Tercapai Sempurna (100%)',
  },
  {
    id: 'lane-3',
    laneName: 'Lini 3: EVA Die-cut',
    processType: 'Hydraulic Press & Precision Kiss-cutting',
    partNumber: 'NTC-EVA-0301',
    partDescription: 'EVA Sponge Weatherstrip Door Sash',
    targetQtyPcs: 1000,
    actualQtyPcs: 1050,
    statusNotes: 'Output Melampaui Kuota (+50 PCS Surplus)',
  },
];

export const ProductionPerformanceHero: React.FC = () => {
  // Hitung total agregat pabrik
  const aggregateTarget = LANES_DATA.reduce((acc, l) => acc + l.targetQtyPcs, 0); // 6.800
  const aggregateActual = LANES_DATA.reduce((acc, l) => acc + l.actualQtyPcs, 0); // 6.750
  const aggregateGap = calculateProductionGap(aggregateTarget, aggregateActual); // +50 (Defisit)
  const aggregateAchievement = calculateProductionAchievement(aggregateActual, aggregateTarget); // 99.26%

  return (
    <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] overflow-hidden shadow-none">
      {/* Header Banner Hero */}
      <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#0057d2]/10 text-[#0057d2] rounded-[4px]">
            <Factory className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[14px] font-bold text-[#000000] tracking-tight">
                Domain 1: Kinerja Produksi Lini (Production Performance)
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#ffffff] border border-[#d5dce2] text-[#475e75] rounded-[4px]">
                HERO SECTION · 3 LINI AKTIF
              </span>
            </div>
            <p className="text-[11px] text-[#545454] mt-0.5">
              Monitoring target SPK harian vs aktual output produksi per lini manufaktur otomotif
            </p>
          </div>
        </div>

        {/* Agregat Pabrik Badge */}
        <div className="flex items-center gap-4 bg-[#ffffff] border border-[#d5dce2] px-4 py-2 rounded-[4px]">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#545454]">
              Target Pabrik (SPK)
            </div>
            <div className="text-[15px] font-bold text-[#000000] tabular-nums">
              {aggregateTarget.toLocaleString('id-ID')} <span className="text-[11px] font-normal text-[#545454]">PCS</span>
            </div>
          </div>
          <div className="h-7 w-px bg-[#d5dce2]" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#545454]">
              Aktual Produksi
            </div>
            <div className="text-[15px] font-bold text-[#000000] tabular-nums">
              {aggregateActual.toLocaleString('id-ID')} <span className="text-[11px] font-normal text-[#545454]">PCS</span>
            </div>
          </div>
          <div className="h-7 w-px bg-[#d5dce2]" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#545454]">
              Gap Agregat
            </div>
            <div className="text-[15px] font-bold text-[#8d4b00] tabular-nums flex items-center gap-1">
              +{aggregateGap} <span className="text-[10px] font-semibold text-[#8d4b00]">PCS (Defisit)</span>
            </div>
          </div>
          <div className="h-7 w-px bg-[#d5dce2]" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#545454]">
              Pencapaian Pabrik
            </div>
            <div className="text-[15px] font-bold text-[#10683b] tabular-nums">
              {aggregateAchievement}%
            </div>
          </div>
        </div>
      </div>

      {/* Grid 3 Lini Manufaktur Terkonfirmasi + 1 Slot Status TBD */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#ffffff]">
        {LANES_DATA.map((lane) => {
          const gap = calculateProductionGap(lane.targetQtyPcs, lane.actualQtyPcs);
          const achievement = calculateProductionAchievement(lane.actualQtyPcs, lane.targetQtyPcs);
          const isDeficit = gap > 0;
          const isSurplus = gap < 0;
          const isExact = gap === 0;

          return (
            <div
              key={lane.id}
              className="p-4 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px] flex flex-col justify-between space-y-3.5 hover:border-[#0057d2]/40 transition-colors"
            >
              {/* Lane Header */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#000000] tracking-tight">
                    {lane.laneName}
                  </span>
                  {isDeficit && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#fff8e1] text-[#8d4b00] border border-[#ffd54f] rounded-[4px] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Defisit +{gap} PCS
                    </span>
                  )}
                  {isExact && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#edf7ed] text-[#10683b] border border-[#a5d6a7] rounded-[4px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Tercapai (0 Gap)
                    </span>
                  )}
                  {isSurplus && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#edf7ed] text-[#10683b] border border-[#a5d6a7] rounded-[4px] flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Surplus {gap} PCS
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-[#545454] mt-0.5">
                  Proses: {lane.processType}
                </div>
              </div>

              {/* Part Info */}
              <div className="p-2.5 bg-[#ffffff] border border-[#e2e8f0] rounded-[4px]">
                <div className="text-[10px] font-mono font-bold text-[#0057d2]">
                  {lane.partNumber}
                </div>
                <div className="text-[11px] font-medium text-[#1a1a1a] truncate" title={lane.partDescription}>
                  {lane.partDescription}
                </div>
              </div>

              {/* Metrik Target vs Aktual */}
              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-[10px] text-[#545454] block">Aktual / Target</span>
                    <span className="text-[16px] font-bold text-[#000000] tabular-nums">
                      {lane.actualQtyPcs.toLocaleString('id-ID')}{' '}
                      <span className="text-[12px] font-normal text-[#545454]">
                        / {lane.targetQtyPcs.toLocaleString('id-ID')} PCS
                      </span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#545454] block">Capaian</span>
                    <span
                      className={`text-[14px] font-bold tabular-nums ${
                        isDeficit ? 'text-[#8d4b00]' : 'text-[#10683b]'
                      }`}
                    >
                      {achievement}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#e2e8f0] h-2 rounded-[2px] overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isDeficit ? 'bg-[#8d4b00]' : isSurplus ? 'bg-[#0057d2]' : 'bg-[#10683b]'
                    }`}
                    style={{ width: `${Math.min(100, achievement)}%` }}
                  />
                </div>
              </div>

              {/* Status Note Footer */}
              <div className="pt-2 border-t border-[#e2e8f0] text-[10px] text-[#545454] flex items-center justify-between">
                <span className="truncate">{lane.statusNotes}</span>
              </div>
            </div>
          );
        })}

        {/* Lini 4 Status Pending (TBD) */}
        <div className="p-4 bg-[#f8f9fa] border border-dashed border-[#d5dce2] rounded-[4px] flex flex-col justify-between opacity-80">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#545454]">
                Lini 4: Assembly & Packing
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#f0f2f5] text-[#545454] border border-[#d5dce2] rounded-[4px]">
                PENDING (TBD)
              </span>
            </div>
            <div className="text-[10px] text-[#545454] mt-0.5">
              Status Konfigurasi Lini Manufaktur
            </div>
          </div>

          <div className="p-3 bg-[#ffffff] border border-[#e2e8f0] rounded-[4px] text-center my-3">
            <MinusCircle className="w-5 h-5 text-[#8c9ba5] mx-auto mb-1.5" />
            <div className="text-[11px] font-bold text-[#475e75]">
              Belum Dikonfigurasi
            </div>
            <div className="text-[10px] text-[#545454] mt-1 leading-relaxed">
              BRD §2.1 saat ini hanya mengonfirmasi 3 lini manufaktur aktif (Rubber, Foam, EVA).
            </div>
          </div>

          <div className="pt-2 border-t border-[#e2e8f0] text-[10px] text-[#545454] text-center">
            Menunggu spesifikasi teknis fase ekspansi
          </div>
        </div>
      </div>
    </div>
  );
};
