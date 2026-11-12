/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PPIC Module: Master Production Lanes View (Section 2.1, BR-SPK-01, Section 8.4)
 */

import React, { useState } from 'react';
import { ProductionLane, PartItem, ProductionOrderSpk } from '../../../types/erp';
import {
  Factory,
  Layers,
  Settings,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Info,
  X,
  Gauge,
  Users,
} from 'lucide-react';

interface MasterLanesViewProps {
  lanes: ProductionLane[];
  parts: PartItem[];
  spkOrders: ProductionOrderSpk[];
}

export const MasterLanesView: React.FC<MasterLanesViewProps> = ({
  lanes,
  parts,
  spkOrders,
}) => {
  const [selectedLaneDetail, setSelectedLaneDetail] = useState<ProductionLane | null>(null);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#ffffff] text-[#223548]">
      {/* 1. Header & Section 2.1 Banner */}
      <div className="p-4 bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#475e75]">
              Master Konfigurasi Pabrik · BRD §2.1 & Section 8.4
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#eaf6ef] text-[#10683b] border border-[#10683b]/20 rounded-[4px]">
              3 LINI AKTIF TERVERIFIKASI
            </span>
          </div>
          <h2 className="text-[17px] font-bold text-[#000000] mt-0.5">
            Master Data Lini Kerja Manufaktur (Production Lanes)
          </h2>
          <p className="text-[12px] text-[#475e75] mt-1 max-w-3xl leading-relaxed">
            PT Nutech Pundi Arta mengoperasikan 3 lini manufaktur terpisah: <strong>Lane 1 (Rubber Cutting)</strong>, <strong>Lane 2 (Foam Slicing)</strong>, dan <strong>Lane 3 (EVA Die-cut)</strong>.
            Slot <strong>Lane 4 (Assembly & Packing)</strong> berstatus pending menunggu spesifikasi fase ekspansi.
          </p>
        </div>
      </div>

      {/* 2. Top Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#475e75]">
            Lini Aktif Operasional
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-[#10683b] tabular-nums">3</span>
            <span className="text-[11px] text-[#475e75]">Lini Produksi</span>
          </div>
          <div className="mt-1 text-[11px] text-[#475e75]">
            Kapasitas terpasang: 8.000 PCS/hari
          </div>
        </div>

        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#475e75]">
            Slot Ekspansi (TBD)
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-[#8d4b00] tabular-nums">1</span>
            <span className="text-[11px] text-[#475e75]">Lini Pending</span>
          </div>
          <div className="mt-1 text-[11px] text-[#8d4b00]">
            Lane 4: Assembly & Packing
          </div>
        </div>

        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#475e75]">
            Mesin Potong Terpasang
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-[#0057d2] tabular-nums">9</span>
            <span className="text-[11px] text-[#475e75]">Unit Mesin</span>
          </div>
          <div className="mt-1 text-[11px] text-[#475e75]">
            Hydraulic cutter, band-knife & die-press
          </div>
        </div>

        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#475e75]">
            Jadwal Shift Kerja
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-[#000000] tabular-nums">2</span>
            <span className="text-[11px] text-[#475e75]">Shift Operasional</span>
          </div>
          <div className="mt-1 text-[11px] text-[#475e75]">
            Shift 1 (08-16) · Shift 2 (16-00)
          </div>
        </div>
      </div>

      {/* 3. Lane Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lanes.map((lane) => {
          const laneParts = parts.filter((p) => {
            if (lane.id === 'lane-1') return p.category === 'Karet / Rubber';
            if (lane.id === 'lane-2') return p.category === 'Busa / Foam';
            if (lane.id === 'lane-3') return p.category === 'EVA Sponge';
            return false;
          });

          const activeSpks = spkOrders.filter(
            (s) => s.laneId === lane.id && s.status === 'Active'
          );

          return (
            <div
              key={lane.id}
              className={`border rounded-[4px] overflow-hidden bg-[#ffffff] transition-shadow ${
                lane.status === 'Active'
                  ? 'border-[#d5dce2] hover:shadow-xs'
                  : 'border-[#d5dce2] bg-[#f9fafb] opacity-85'
              }`}
            >
              {/* Card Header */}
              <div className="px-4 py-3 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Factory
                    className={`w-4 h-4 ${
                      lane.status === 'Active' ? 'text-[#0057d2]' : 'text-[#475e75]'
                    }`}
                  />
                  <div>
                    <h3 className="text-[14px] font-bold text-[#000000]">{lane.name}</h3>
                    <div className="text-[11px] text-[#475e75]">{lane.processName}</div>
                  </div>
                </div>
                {lane.status === 'Active' ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#eaf6ef] text-[#10683b] border border-[#10683b]/20 rounded-[4px]">
                    AKTIF BERJALAN
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#fff6e5] text-[#8d4b00] border border-[#8d4b00]/30 rounded-[4px]">
                    PENDING (TBD)
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3.5 text-[13px]">
                <p className="text-[#475e75] text-[12px] leading-relaxed">
                  {lane.description}
                </p>

                {/* Key specs */}
                <div className="grid grid-cols-2 gap-2 text-[12px] p-3 bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px]">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#475e75]">
                      Kapasitas Harian:
                    </span>
                    <div className="font-bold text-[#000000] tabular-nums">
                      {lane.status === 'Active'
                        ? `${lane.dailyCapacityPcs.toLocaleString('id-ID')} PCS / hari`
                        : 'Belum Dikonfigurasi'}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#475e75]">
                      Supervisor Lini:
                    </span>
                    <div className="font-semibold text-[#000000]">
                      {lane.supervisorName}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#475e75]">
                      Jumlah Mesin:
                    </span>
                    <div className="font-semibold text-[#000000]">
                      {lane.machineCount > 0 ? `${lane.machineCount} Unit Mesin` : '—'}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#475e75]">
                      Kategori Material:
                    </span>
                    <div className="font-semibold text-[#0057d2]">
                      {lane.allowedCategories.join(', ')}
                    </div>
                  </div>
                </div>

                {/* Associated parts */}
                <div>
                  <div className="text-[11px] font-bold uppercase text-[#475e75] mb-1.5">
                    Part Komponen Resmi yang Dikerjakan ({laneParts.length}):
                  </div>
                  {laneParts.length > 0 ? (
                    <div className="space-y-1">
                      {laneParts.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between text-[12px] py-1 px-2.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#0057d2]">
                              {p.partNumber}
                            </span>
                            <span className="text-[#223548] truncate max-w-[200px]">
                              {p.description}
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-[#475e75]">
                            {p.defaultPackRatio} PCS/pack
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#475e75] italic">
                      Menunggu spesifikasi teknis dan alokasi part fase ekspansi.
                    </div>
                  )}
                </div>

                {/* Active SPK badge */}
                {activeSpks.length > 0 && (
                  <div className="flex items-center gap-2 pt-1 text-[11px]">
                    <span className="font-bold text-[#10683b]">SPK Aktif:</span>
                    {activeSpks.map((s) => (
                      <span
                        key={s.id}
                        className="font-mono font-semibold px-2 py-0.5 bg-[#eaf6ef] text-[#10683b] border border-[#10683b]/20 rounded-[4px]"
                      >
                        {s.spkNumber} ({s.targetPcsTotal.toLocaleString('id-ID')} PCS)
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-4 py-2.5 bg-[#f5f6f7] border-t border-[#d5dce2] flex items-center justify-between">
                <span className="text-[11px] text-[#475e75]">
                  Kode Lini: <strong>{lane.code}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedLaneDetail(lane)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#0057d2] hover:bg-[#ebf8ff] border border-[#d5dce2] rounded-[4px] cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Detail Spesifikasi</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Detail Lane Modal Drawer */}
      {selectedLaneDetail && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-lane-detail-title"
          className="fixed inset-0 z-50 bg-[#000000]/40 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Factory className="w-4 h-4 text-[#0057d2]" />
                <h3 id="modal-lane-detail-title" className="text-[14px] font-bold text-[#000000]">
                  Spesifikasi Teknis: {selectedLaneDetail.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLaneDetail(null)}
                className="p-1 text-[#475e75] hover:text-[#000000] rounded-[4px] cursor-pointer"
                aria-label="Tutup Spesifikasi Lini"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-[13px]">
              <div className="p-3 bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] space-y-1">
                <div className="text-[11px] font-bold text-[#475e75]">Proses Manufaktur Resmi:</div>
                <div className="text-[14px] font-bold text-[#000000]">
                  {selectedLaneDetail.processName}
                </div>
                <div className="text-[12px] text-[#475e75]">
                  {selectedLaneDetail.description}
                </div>
              </div>

              <div className="space-y-2 text-[12px]">
                <div className="flex justify-between py-1.5 border-b border-[#d5dce2]">
                  <span className="text-[#475e75]">Status Konfigurasi:</span>
                  <span className="font-bold text-[#000000]">{selectedLaneDetail.status}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#d5dce2]">
                  <span className="text-[#475e75]">Kapasitas Terpasang Harian:</span>
                  <span className="font-bold text-[#000000]">
                    {selectedLaneDetail.status === 'Active'
                      ? `${selectedLaneDetail.dailyCapacityPcs.toLocaleString('id-ID')} PCS / hari (2 Shift)`
                      : 'Pending (TBD)'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#d5dce2]">
                  <span className="text-[#475e75]">Supervisor Lapangan:</span>
                  <span className="font-bold text-[#000000]">{selectedLaneDetail.supervisorName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#d5dce2]">
                  <span className="text-[#475e75]">Jumlah Peralatan / Mesin:</span>
                  <span className="font-bold text-[#000000]">
                    {selectedLaneDetail.machineCount > 0 ? `${selectedLaneDetail.machineCount} Unit Mesin` : 'Belum Terinstal'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#d5dce2]">
                  <span className="text-[#475e75]">Kategori Material yang Diizinkan:</span>
                  <span className="font-bold text-[#0057d2]">
                    {selectedLaneDetail.allowedCategories.join(', ')}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#eaf6ef] border border-[#10683b]/20 rounded-[4px] text-[11px] text-[#10683b]">
                Lini produksi umumnya mengerjakan part yang relatif tetap sesuai konvensi pabrik, namun secara sistem tidak dikunci mutlak demi fleksibilitas operasional darurat (BR-SPK-02).
              </div>
            </div>

            <div className="px-5 py-3 bg-[#f5f6f7] border-t border-[#d5dce2] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedLaneDetail(null)}
                className="px-4 py-1.5 text-[12px] font-bold text-white bg-[#0057d2] hover:bg-[#0049b0] rounded-[4px] cursor-pointer"
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
