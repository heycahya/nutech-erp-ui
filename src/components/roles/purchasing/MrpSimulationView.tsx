/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FEAT-PUR-01 — Simulasi MRP (Material Requirement Planning) Demo
 * Grounded in: brd-nutech.md §5.5, features.md §2.4, BR-MAT-06, BR-MAT-07, TBD-06, TBD-15.
 */

import React, { useState, useMemo } from 'react';
import {
  RawMaterial,
  BomAssumption,
  ProductionOrderSpk,
  PurchaseUomType,
} from '../../../types/erp';
import {
  calculateMaterialRequirementSummary,
  formatIndoDate,
} from '../../../utils/logic';
import {
  Calculator,
  AlertTriangle,
  FileQuestion,
  ShoppingCart,
  Layers,
  Info,
  RefreshCw,
  Eye,
  X,
  CheckCircle2,
  Sliders,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface MrpSimulationViewProps {
  materials: RawMaterial[];
  boms: BomAssumption[];
  spkOrders: ProductionOrderSpk[];
  onCreatePoFromMrp?: (materialId: string, suggestedQty: number) => void;
}

export const MrpSimulationView: React.FC<MrpSimulationViewProps> = ({
  materials,
  boms,
  spkOrders,
  onCreatePoFromMrp,
}) => {
  // 1. Filter & Simulation State
  const [selectedSpkId, setSelectedSpkId] = useState<string>('all');
  const [scrapMultiplier, setScrapMultiplier] = useState<number>(1.0); // 1.0 = normal, 1.2 = +20% scrap test
  const [selectedMaterialDetail, setSelectedMaterialDetail] = useState<RawMaterial | null>(null);
  const [isBomModalOpen, setIsBomModalOpen] = useState<boolean>(false);
  const [simulationTriggerCount, setSimulationTriggerCount] = useState<number>(1);

  // 2. Compute Target PCS per Part based on selected SPK filter
  const targetPcsPerPart = useMemo(() => {
    const targets: Record<string, number> = {};

    const activeSpks = spkOrders.filter((s) => {
      if (s.status === 'Closed') return false;
      if (selectedSpkId === 'all') return true;
      return s.id === selectedSpkId;
    });

    for (const spk of activeSpks) {
      for (const item of spk.items) {
        targets[item.partNumber] = (targets[item.partNumber] || 0) + (item.targetPcsMonthly || 0);
      }
    }

    return targets;
  }, [spkOrders, selectedSpkId]);

  // 3. Compute adjusted BOMs with scrapMultiplier
  const adjustedBoms = useMemo(() => {
    return boms.map((b) => ({
      ...b,
      scrapAllowancePercent: Number((b.scrapAllowancePercent * scrapMultiplier).toFixed(1)),
    }));
  }, [boms, scrapMultiplier]);

  // 4. Run MRP calculation summary
  const mrpResults = useMemo(() => {
    return calculateMaterialRequirementSummary(targetPcsPerPart, adjustedBoms, materials);
  }, [targetPcsPerPart, adjustedBoms, materials, simulationTriggerCount]);

  // Aggregate metrics
  const totalNetDeficitItems = mrpResults.filter((r) => r.netRequirement > 0).length;
  const totalEstimatedCost = mrpResults.reduce((acc, r) => acc + r.estimatedCost, 0);
  const totalDemandAll = mrpResults.reduce((acc, r) => acc + r.totalDemand, 0);

  return (
    <div className="flex-1 overflow-y-auto bg-[#ffffff] p-6 space-y-5">
      {/* 1. Header Banner & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#d5dce2] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0057d2] bg-[#ebf8ff] px-2 py-0.5 rounded-[4px] border border-[#0057d2]/20">
              FEAT-PUR-01 · Purchasing Module
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8d4b00] bg-[#fff6e5] px-2 py-0.5 rounded-[4px] border border-[#8d4b00]/30">
              DESIGN ASSUMPTION (BR-MAT-06)
            </span>
          </div>
          <h1 className="text-[18px] font-bold text-[#000000] mt-1 tracking-tight flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#0057d2]" />
            Simulasi MRP (Material Requirement Planning) & Estimasi Kebutuhan Bahan
          </h1>
          <p className="text-[11px] text-[#545454] mt-0.5">
            Perhitungan estimasi kebutuhan bahan baku berdasarkan target SPK bulanan, asumsi standard consumption BOM, scrap allowance, dan saldo fisik material.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsBomModalOpen(true)}
            className="px-3 py-1.5 text-[11px] font-semibold text-[#223548] bg-[#f5f6f7] hover:bg-[#eaecee] border border-[#d5dce2] rounded-[4px] cursor-pointer inline-flex items-center gap-1.5 transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-[#0057d2]" />
            <span>Katalog BOM Asumsi</span>
          </button>
          <button
            type="button"
            onClick={() => setSimulationTriggerCount((c) => c + 1)}
            className="px-3 py-1.5 text-[11px] font-bold text-[#ffffff] bg-[#0057d2] hover:bg-[#0040b0] rounded-[4px] cursor-pointer inline-flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Hitung Ulang Simulasi</span>
          </button>
        </div>
      </div>

      {/* 2. Mandatory Enterprise Disclaimers Banner */}
      <div className="p-3.5 bg-[#f8f9fa] border-l-4 border-l-[#8d4b00] border-y border-r border-[#d5dce2] rounded-r-[4px] space-y-1.5 text-[11px]">
        <div className="flex items-center gap-2 font-bold text-[#8d4b00]">
          <AlertTriangle className="w-4 h-4 shrink-0 text-[#8d4b00]" />
          <span>BATASAN BISNIS & ATURAN AUDIT MATERIAL (BR-MAT-06, BR-MAT-07, TBD-06, TBD-15)</span>
        </div>
        <p className="text-[#354a5f] leading-relaxed">
          <strong>1. Estimasi Simulasi:</strong> Hasil kalkulasi Net Requirement adalah perkiraan kebutuhan material untuk perancangan, <em>bukan instruksi pembelian otomatis</em>.<br />
          <strong>2. Status Formula Eksak (TBD-06):</strong> Formula riil dari spreadsheet internal Purchasing berada di luar scope MVP. Sistem saat ini menerapkan formula demo: <code className="bg-[#ffffff] px-1 py-0.5 border border-[#d5dce2] rounded font-mono text-[10px]">Net Req = (Gross Req + Scrap) - Available Stock</code>.<br />
          <strong>3. Asumsi BOM & Scrap (TBD-15):</strong> Nilai standard consumption dan persentase scrap allowance merupakan <em>design assumption</em> dan wajib divalidasi dengan tim engineering sebelum go-live.<br />
          <strong>4. Isolasi Saldo Fisik:</strong> Hasil simulasi tidak memutasi saldo gudang. Penambahan persediaan material hanya sah melalui penerimaan fisik <strong>Warehouse (GRN)</strong>.
        </p>
      </div>

      {/* 3. Simulation Control & Filter Strip */}
      <div className="p-4 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] space-y-3">
        <div className="flex items-center justify-between text-[11px] font-bold text-[#545454] uppercase tracking-wider border-b border-[#eaecee] pb-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#0057d2]" />
            <span>Parameter Simulasi MRP</span>
          </div>
          <span className="text-[#0057d2] font-semibold lowercase">
            periode: november 2026
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-[#223548] mb-1">
              Lingkup Target SPK Lini:
            </label>
            <select
              value={selectedSpkId}
              onChange={(e) => setSelectedSpkId(e.target.value)}
              className="w-full px-3 py-1.5 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
            >
              <option value="all">Semua SPK Aktif Bulanan (Lane 1, 2, 3)</option>
              {spkOrders
                .filter((s) => s.status === 'Active')
                .map((spk) => (
                  <option key={spk.id} value={spk.id}>
                    {spk.spkNumber} — {spk.laneName} ({spk.targetPcsTotal.toLocaleString('id-ID')} PCS)
                  </option>
                ))}
            </select>
            <span className="text-[10px] text-[#545454] mt-1 block">
              Menghitung kebutuhan berdasarkan kuota part SPK terpilih
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#223548] mb-1">
              Faktor Uji Scrap Allowance:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={scrapMultiplier}
                onChange={(e) => setScrapMultiplier(parseFloat(e.target.value))}
                className="flex-1 accent-[#0057d2] cursor-pointer"
              />
              <span className="font-mono font-bold text-[12px] text-[#000000] min-w-[50px] text-right">
                {scrapMultiplier.toFixed(1)}x
              </span>
            </div>
            <span className="text-[10px] text-[#545454] mt-1 block">
              {scrapMultiplier === 1.0 ? 'Standar Asumsi (1.0x)' : `Simulasi stres scrap: ${(scrapMultiplier * 100).toFixed(0)}% dari baseline`}
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#223548] mb-1">
              Sumber Data Saldo Fisik:
            </label>
            <div className="px-3 py-1.5 bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] text-[11px] text-[#354a5f]">
              <div className="font-semibold text-[#000000]">Gudang Material (On-Hand)</div>
              <div className="text-[10px] text-[#545454]">Terhubung dengan Domain 2 Management Dashboard</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#545454]">
            Total Material Baku
          </div>
          <div className="mt-1 text-[22px] font-bold text-[#000000] tabular-nums">
            {materials.length} <span className="text-[12px] font-normal text-[#545454]">Jenis</span>
          </div>
          <div className="mt-1 text-[11px] text-[#475e75]">
            Karet, Busa PU, dan Spons EVA
          </div>
        </div>

        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#545454]">
            Status Defisit Material
          </div>
          <div className={`mt-1 text-[22px] font-bold tabular-nums ${totalNetDeficitItems > 0 ? 'text-[#8d4b00]' : 'text-[#10683b]'}`}>
            {totalNetDeficitItems} <span className="text-[12px] font-normal text-[#545454]">Material</span>
          </div>
          <div className="mt-1 text-[11px] text-[#475e75]">
            {totalNetDeficitItems > 0 ? 'Perlu penerbitan PO Supplier segera' : 'Persediaan on-hand mencukupi'}
          </div>
        </div>

        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#545454]">
            Estimasi Scrap Allowance
          </div>
          <div className="mt-1 text-[22px] font-bold text-[#0057d2] tabular-nums">
            ~3% - 5%
          </div>
          <div className="mt-1 text-[11px] text-[#475e75]">
            Faktor cadangan limbah potongan Dies/Blade
          </div>
        </div>

        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#545454]">
            Proyeksi Biaya Pengadaan Defisit
          </div>
          <div className="mt-1 text-[22px] font-bold text-[#000000] tabular-nums">
            Rp {totalEstimatedCost.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 text-[11px] text-[#475e75]">
            Berdasarkan harga standar material
          </div>
        </div>
      </div>

      {/* 5. Main MRP Calculation Results Table */}
      <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden bg-[#ffffff]">
        <div className="px-4 py-3 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-bold text-[#000000]">
              Hasil Perhitungan Net Requirement Bahan Baku
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#ffffff] text-[#354a5f] border border-[#d5dce2] rounded-[4px]">
              Tabel Simulasi Interaktif
            </span>
          </div>
          <span className="text-[11px] text-[#545454]">
            Satuan Beli Resmi: <strong>Kg, Sheet, Roll</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px] border-collapse">
            <thead className="bg-[#ffffff] border-b border-[#d5dce2] text-[10px] font-bold text-[#545454] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Material Bahan Baku</th>
                <th className="py-2.5 px-3 text-center">Satuan Beli</th>
                <th className="py-2.5 px-3 text-right">Kebutuhan Gross</th>
                <th className="py-2.5 px-3 text-right">Scrap Factor</th>
                <th className="py-2.5 px-3 text-right">Total Kebutuhan</th>
                <th className="py-2.5 px-3 text-right">Stok Fisik Gudang</th>
                <th className="py-2.5 px-3 text-right">Net Req (Defisit)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-4 text-center">Aksi Pengadaan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaecee]">
              {mrpResults.map((row) => {
                const isDeficit = row.netRequirement > 0;
                return (
                  <tr key={row.materialId} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-[#0057d2] text-[11px]">
                        {row.materialCode}
                      </div>
                      <div className="font-semibold text-[#000000] text-[12px] mt-0.5">
                        {row.materialName}
                      </div>
                      <div className="text-[10px] text-[#545454] mt-0.5">
                        Pemasok Utama: <span className="font-medium text-[#223548]">{row.preferredSupplierName}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-[#000000] bg-[#f5f6f7] px-2 py-0.5 rounded border border-[#d5dce2] text-[11px]">
                        {row.purchaseUom}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-[#354a5f]">
                      {row.grossRequirement.toLocaleString('id-ID')}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-[#8d4b00]">
                      +{row.scrapAllowanceQty.toLocaleString('id-ID')} ({row.scrapPercent}%)
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-[#000000]">
                      {row.totalDemand.toLocaleString('id-ID')}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-[#10683b]">
                      {row.availableStock.toLocaleString('id-ID')}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold tabular-nums">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          isDeficit
                            ? 'bg-[#fff6e5] text-[#8d4b00] border border-[#8d4b00]/30'
                            : 'text-[#545454]'
                        }`}
                      >
                        {row.netRequirement > 0 ? `+${row.netRequirement.toLocaleString('id-ID')}` : '0 (Aman)'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {isDeficit ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-[#fff6e5] text-[#8d4b00] border border-[#8d4b00]/30 rounded-[4px] inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Defisit PO</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-[#edf7ed] text-[#10683b] border border-[#a5d6a7] rounded-[4px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Mencukupi</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {isDeficit ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (onCreatePoFromMrp) {
                              onCreatePoFromMrp(row.materialId, row.recommendedPoQty);
                            }
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-[#ffffff] bg-[#0057d2] hover:bg-[#0040b0] rounded-[4px] cursor-pointer inline-flex items-center gap-1 transition-colors shadow-xs"
                          title="Buka form PO dengan kuantitas yang direkomendasikan"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          <span>Buat PO ({row.recommendedPoQty} {row.purchaseUom})</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const mat = materials.find((m) => m.id === row.materialId);
                            if (mat) setSelectedMaterialDetail(mat);
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium text-[#0057d2] bg-[#ebf8ff] hover:bg-[#d0ebff] border border-[#0057d2]/30 rounded-[4px] cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Lihat Alokasi</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-[#f5f6f7] border-t border-[#d5dce2] flex flex-col md:flex-row items-center justify-between text-[11px] text-[#545454] gap-2">
          <div>
            * Saldo fisik bahan baku: EPDM 840 Kg, Foam 1.250 Sheet, EVA 950 Sheet (Sesuai Audit Domain 2 Management Dashboard).
          </div>
          <div className="font-mono text-[#000000]">
            Rumus: <span className="font-semibold text-[#0057d2]">Net Req = Total Kebutuhan - Saldo Fisik</span>
          </div>
        </div>
      </div>

      {/* 6. Modal Katalog BOM Asumsi (TBD-15) */}
      {isBomModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#000000]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-xl w-full max-w-[800px] overflow-hidden">
            <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#0057d2] uppercase tracking-wider block">
                  Referensi Desain · TBD-15
                </span>
                <h3 className="text-[14px] font-bold text-[#000000] mt-0.5">
                  Katalog BOM Asumsi Demo (Standard Consumption & Scrap Allowance)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBomModalOpen(false)}
                className="p-1 text-[#545454] hover:text-[#000000] rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="p-3 bg-[#fff6e5] border border-[#8d4b00]/30 rounded-[4px] text-[11px] text-[#8d4b00] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>CATATAN INTEGRITAS BOM:</span>
                </div>
                <p>
                  PT Nutech Pundi Arta belum merilis standard formula resmi dari file Excel Purchasing. Angka konsumsi per PCS berikut adalah nilai acuan demo (Design Assumption) untuk memvalidasi alur sistem TO-BE.
                </p>
              </div>

              <table className="w-full text-left text-[11px] border-collapse">
                <thead className="bg-[#f5f6f7] border-b border-[#d5dce2] font-bold text-[#545454]">
                  <tr>
                    <th className="py-2 px-3">Part Komponen</th>
                    <th className="py-2 px-3">Bahan Baku</th>
                    <th className="py-2 px-3 text-right">Std Konsumsi / PCS</th>
                    <th className="py-2 px-3 text-right">Scrap Baseline</th>
                    <th className="py-2 px-3">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaecee]">
                  {boms.map((bom) => (
                    <tr key={bom.id} className="hover:bg-[#f8f9fa]">
                      <td className="py-2 px-3">
                        <div className="font-mono font-bold text-[#0057d2]">{bom.partNumber}</div>
                        <div className="text-[#354a5f]">{bom.partDescription}</div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-semibold text-[#000000]">{bom.materialName}</div>
                        <div className="font-mono text-[10px] text-[#545454]">{bom.materialCode}</div>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-[#000000]">
                        {bom.stdConsumptionPerPcs}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-[#8d4b00]">
                        {bom.scrapAllowancePercent}%
                      </td>
                      <td className="py-2 px-3 text-[#545454] text-[10px]">
                        {bom.designAssumptionNote}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 bg-[#f5f6f7] border-t border-[#d5dce2] flex justify-end">
              <button
                type="button"
                onClick={() => setIsBomModalOpen(false)}
                className="px-4 py-1.5 text-[11px] font-semibold text-[#223548] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal Detail Spesifikasi Material */}
      {selectedMaterialDetail && (
        <div className="fixed inset-0 z-50 bg-[#000000]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-xl w-full max-w-[500px] overflow-hidden">
            <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#0057d2] uppercase tracking-wider block">
                  Detail Alokasi Material
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
              <div className="p-3 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#545454]">Kategori:</span>
                  <span className="font-bold text-[#000000]">{selectedMaterialDetail.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#545454]">Lokasi Gudang:</span>
                  <span className="font-medium text-[#000000]">{selectedMaterialDetail.storageLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#545454]">Satuan Beli:</span>
                  <span className="font-bold text-[#0057d2]">{selectedMaterialDetail.purchaseUom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#545454]">Supplier Rekomendasi:</span>
                  <span className="font-medium text-[#000000]">{selectedMaterialDetail.preferredSupplierName}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
                  <span className="text-[10px] text-[#545454] block">Saldo On-Hand</span>
                  <span className="text-[18px] font-bold text-[#10683b] tabular-nums">
                    {selectedMaterialDetail.onHandQty} {selectedMaterialDetail.purchaseUom}
                  </span>
                </div>
                <div className="p-2.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
                  <span className="text-[10px] text-[#545454] block">Safety Stock</span>
                  <span className="text-[18px] font-bold text-[#475e75] tabular-nums">
                    {selectedMaterialDetail.safetyStock} {selectedMaterialDetail.purchaseUom}
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
    </div>
  );
};
