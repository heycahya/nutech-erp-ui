/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PPIC Module: Pack-to-PCS Conversion Configuration View (FEAT-MD-08, F-14, BR-PR-04/05)
 */

import React, { useState } from 'react';
import { PackConversionConfig, ProductionLane, PartItem } from '../../../types/erp';
import {
  Sliders,
  Plus,
  Edit2,
  Trash2,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  Package,
  Layers,
  Info,
} from 'lucide-react';
import { validatePackConversionConfig, calculatePackToPcs } from '../../../utils/logic';

interface PackRatioConfigViewProps {
  packConfigs: PackConversionConfig[];
  lanes: ProductionLane[];
  parts: PartItem[];
  onSavePackConfig: (config: PackConversionConfig) => void;
  onDeletePackConfig?: (id: string) => void;
}

export const PackRatioConfigView: React.FC<PackRatioConfigViewProps> = ({
  packConfigs,
  lanes,
  parts,
  onSavePackConfig,
  onDeletePackConfig,
}) => {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<PackConversionConfig | null>(null);

  // Form state
  const [formLaneId, setFormLaneId] = useState('lane-1');
  const [formPartId, setFormPartId] = useState('PART-001');
  const [formPackRatio, setFormPackRatio] = useState<number>(50);
  const [formError, setFormError] = useState<string | null>(null);

  // Sandbox Calculator state
  const [sandboxLaneId, setSandboxLaneId] = useState('lane-1');
  const [sandboxPartId, setSandboxPartId] = useState('PART-001');
  const [sandboxPacks, setSandboxPacks] = useState<number>(10);

  // Filter
  const [selectedLaneFilter, setSelectedLaneFilter] = useState('ALL');

  // Filtered configs
  const filteredConfigs = packConfigs.filter(
    (cfg) => selectedLaneFilter === 'ALL' || cfg.laneId === selectedLaneFilter
  );

  // Sandbox active config
  const activeSandboxConfig = packConfigs.find(
    (cfg) => cfg.laneId === sandboxLaneId && cfg.partId === sandboxPartId
  );
  const activeRatio = activeSandboxConfig?.packRatio || 50;
  const calculatedPcs = calculatePackToPcs(sandboxPacks, activeRatio);

  // Open Create
  const handleOpenCreate = () => {
    setEditingConfig(null);
    setFormLaneId('lane-1');
    setFormPartId('PART-001');
    setFormPackRatio(50);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (cfg: PackConversionConfig) => {
    setEditingConfig(cfg);
    setFormLaneId(cfg.laneId);
    setFormPartId(cfg.partId);
    setFormPackRatio(cfg.packRatio);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Submit Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validatePackConversionConfig(
      formLaneId,
      formPartId,
      formPackRatio,
      packConfigs,
      editingConfig?.id
    );

    if (!validation.isValid) {
      setFormError(validation.error || 'Validasi rasio gagal.');
      return;
    }

    const laneObj = lanes.find((l) => l.id === formLaneId);
    const partObj = parts.find((p) => p.id === formPartId);

    const newConfig: PackConversionConfig = {
      id: editingConfig?.id || `pcfg-${Date.now()}`,
      laneId: formLaneId,
      laneName: laneObj?.name || 'Lane Manufaktur',
      partId: formPartId,
      partNumber: partObj?.partNumber || 'PART-UNKNOWN',
      partDescription: partObj?.description || 'Part Komponen',
      packRatio: formPackRatio,
      effectiveDate: editingConfig?.effectiveDate || '2026-11-01',
    };

    onSavePackConfig(newConfig);
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#ffffff] text-[#223548]">
      {/* 1. Header & Metadata Banner */}
      <div className="p-4 bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#475e75]">
              Konfigurasi Master Produksi · BRD Section 6 F-14 & FEAT-MD-08
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#eaf6ef] text-[#10683b] border border-[#10683b]/20 rounded-[4px]">
              TIDAK ADA RASIO GLOBAL PABRIK (BR-PR-05)
            </span>
          </div>
          <h2 className="text-[17px] font-bold text-[#000000] mt-0.5">
            Konfigurasi Rasio Konversi Pack-to-PCS per Lini & Part
          </h2>
          <p className="text-[12px] text-[#475e75] mt-1 max-w-3xl leading-relaxed">
            Operator pabrik di lantai lini mencatat hasil pemotongan dalam satuan fisik <strong>Pack</strong>.
            Sistem secara otomatis mengonversinya ke satuan resmi <strong>PCS</strong> berdasarkan matriks rasio per kombinasi Lini dan Part (BR-PR-04).
            Setiap kombinasi Lini + Part bersifat unik dan tidak boleh terduplikasi.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 h-[34px] px-3.5 bg-[#0057d2] hover:bg-[#0049b0] active:bg-[#00368a] text-white text-[13px] font-medium rounded-[4px] transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Konfigurasi Rasio</span>
        </button>
      </div>

      {/* 2. Interactive Conversion Sandbox */}
      <div className="p-4 bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#0057d2]" />
            <h3 className="text-[13px] font-bold text-[#000000]">
              Simulasi Kalkulator Konversi Pack ke PCS (Uji Live On-The-Fly)
            </h3>
          </div>
          <span className="text-[11px] text-[#475e75]">
            Menguji formula konversi otomatis pelaporan produksi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[11px] font-bold uppercase text-[#475e75] mb-1">
              Pilih Lini Produksi
            </label>
            <select
              value={sandboxLaneId}
              onChange={(e) => setSandboxLaneId(e.target.value)}
              className="w-full h-[34px] px-2 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
            >
              <option value="lane-1">Lane 1 (Rubber Cutting)</option>
              <option value="lane-2">Lane 2 (Foam Slicing)</option>
              <option value="lane-3">Lane 3 (EVA Die-cut)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#475e75] mb-1">
              Pilih Part Komponen
            </label>
            <select
              value={sandboxPartId}
              onChange={(e) => setSandboxPartId(e.target.value)}
              className="w-full h-[34px] px-2 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
            >
              {parts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.partNumber} ({p.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#475e75] mb-1">
              Input Jumlah Pack Fisik
            </label>
            <input
              type="number"
              min={0}
              step={1}
              value={sandboxPacks}
              onChange={(e) => setSandboxPacks(Number(e.target.value) || 0)}
              className="w-full h-[34px] px-3 font-mono font-bold text-[13px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
            />
          </div>

          <div className="p-2.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#475e75]">Hasil Konversi Resmi</span>
              <div className="text-[16px] font-bold text-[#0057d2] tabular-nums">
                {calculatedPcs.toLocaleString('id-ID')} PCS
              </div>
            </div>
            <div className="text-[10px] text-[#10683b] font-medium text-right">
              Rasio: {activeRatio} PCS/pack
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="flex items-center justify-between text-[12px]">
        <div className="flex items-center gap-2">
          <span className="text-[#475e75] font-medium">Filter Lini:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSelectedLaneFilter('ALL')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-[4px] border transition-colors cursor-pointer ${
                selectedLaneFilter === 'ALL'
                  ? 'bg-[#0057d2] text-white border-[#0057d2] font-bold'
                  : 'bg-[#ffffff] text-[#223548] border-[#d5dce2] hover:bg-[#f5f6f7]'
              }`}
            >
              Semua Lini ({packConfigs.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedLaneFilter('lane-1')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-[4px] border transition-colors cursor-pointer ${
                selectedLaneFilter === 'lane-1'
                  ? 'bg-[#0057d2] text-white border-[#0057d2] font-bold'
                  : 'bg-[#ffffff] text-[#223548] border-[#d5dce2] hover:bg-[#f5f6f7]'
              }`}
            >
              Lane 1 (Rubber)
            </button>
            <button
              type="button"
              onClick={() => setSelectedLaneFilter('lane-2')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-[4px] border transition-colors cursor-pointer ${
                selectedLaneFilter === 'lane-2'
                  ? 'bg-[#0057d2] text-white border-[#0057d2] font-bold'
                  : 'bg-[#ffffff] text-[#223548] border-[#d5dce2] hover:bg-[#f5f6f7]'
              }`}
            >
              Lane 2 (Foam)
            </button>
            <button
              type="button"
              onClick={() => setSelectedLaneFilter('lane-3')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-[4px] border transition-colors cursor-pointer ${
                selectedLaneFilter === 'lane-3'
                  ? 'bg-[#0057d2] text-white border-[#0057d2] font-bold'
                  : 'bg-[#ffffff] text-[#223548] border-[#d5dce2] hover:bg-[#f5f6f7]'
              }`}
            >
              Lane 3 (EVA)
            </button>
          </div>
        </div>
        <div className="text-[#475e75]">
          Menampilkan <strong>{filteredConfigs.length}</strong> rasio kemasan aktif
        </div>
      </div>

      {/* 4. Configuration Table */}
      <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden bg-[#ffffff]">
        <table className="w-full text-left text-[13px] border-collapse">
          <thead className="bg-[#f5f6f7] border-b border-[#d5dce2] text-[11px] font-bold text-[#475e75] uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-4">Lini Produksi (Lane)</th>
              <th className="py-2.5 px-4">Part Number & Deskripsi</th>
              <th className="py-2.5 px-4 text-center">Satuan Resmi (UoM)</th>
              <th className="py-2.5 px-4 text-right">Rasio Kemasan (Pack-to-PCS)</th>
              <th className="py-2.5 px-4">Contoh Konversi Lapangan</th>
              <th className="py-2.5 px-4 text-center">Tanggal Efektif</th>
              <th className="py-2.5 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d5dce2]">
            {filteredConfigs.map((cfg) => (
              <tr key={cfg.id} className="hover:bg-[#f5f6f7] transition-colors">
                <td className="py-3 px-4">
                  <div className="font-bold text-[#000000]">{cfg.laneName}</div>
                  <div className="text-[11px] text-[#475e75]">
                    {cfg.laneId === 'lane-1' && 'Continuous Cutting Profil EPDM'}
                    {cfg.laneId === 'lane-2' && 'Horizontal Splitting Foam Block'}
                    {cfg.laneId === 'lane-3' && 'Hydraulic Kiss-cutting Press'}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-mono font-bold text-[#0057d2] text-[13px]">
                    {cfg.partNumber}
                  </div>
                  <div className="text-[11px] text-[#223548]">{cfg.partDescription}</div>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 text-[11px] font-bold bg-[#f5f6f7] text-[#223548] border border-[#d5dce2] rounded-[4px]">
                    PCS (Tunggal)
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="font-mono font-bold text-[#000000] text-[15px] tabular-nums">
                    {cfg.packRatio} PCS / pack
                  </div>
                  <div className="text-[10px] text-[#10683b]">Tervalidasi Unik</div>
                </td>
                <td className="py-3 px-4 text-[12px] text-[#475e75]">
                  <span>10 Pack = </span>
                  <strong className="text-[#0057d2]">{(10 * cfg.packRatio).toLocaleString('id-ID')} PCS</strong>
                  <span> · 50 Pack = </span>
                  <strong className="text-[#0057d2]">{(50 * cfg.packRatio).toLocaleString('id-ID')} PCS</strong>
                </td>
                <td className="py-3 px-4 text-center font-mono text-[12px] text-[#475e75]">
                  {cfg.effectiveDate}
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cfg)}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#0057d2] hover:bg-[#ebf8ff] border border-[#d5dce2] rounded-[4px] transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    {onDeletePackConfig && (
                      <button
                        type="button"
                        onClick={() => onDeletePackConfig(cfg.id)}
                        className="p-1 text-[#8d4b00] hover:text-[#b30000] rounded-[4px] cursor-pointer"
                        title="Hapus Konfigurasi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. Modal Tambah / Edit Konfigurasi Rasio */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-ratio-title"
          className="fixed inset-0 z-50 bg-[#000000]/40 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#0057d2]" />
                <h3 id="modal-ratio-title" className="text-[14px] font-bold text-[#000000]">
                  {editingConfig ? 'Edit Rasio Konversi' : 'Tambah Konfigurasi Rasio Pack'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#475e75] hover:text-[#000000] rounded-[4px] cursor-pointer"
                aria-label="Tutup Modal Rasio"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-5 space-y-4 text-[13px]">
              {formError && (
                <div className="p-3 bg-[#fff6e5] border border-[#8d4b00]/30 rounded-[4px] text-[12px] text-[#8d4b00] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#475e75] mb-1">
                  Lini Produksi (Lane) *
                </label>
                <select
                  value={formLaneId}
                  onChange={(e) => setFormLaneId(e.target.value)}
                  className="w-full h-[34px] px-2 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
                >
                  <option value="lane-1">Lane 1 (Rubber Cutting)</option>
                  <option value="lane-2">Lane 2 (Foam Slicing)</option>
                  <option value="lane-3">Lane 3 (EVA Die-cut)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#475e75] mb-1">
                  Part Komponen *
                </label>
                <select
                  value={formPartId}
                  onChange={(e) => setFormPartId(e.target.value)}
                  className="w-full h-[34px] px-2 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
                >
                  {parts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.partNumber} — {p.description} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#475e75] mb-1">
                  Rasio Kemasan (PCS per 1 Pack) *
                </label>
                <input
                  type="number"
                  min={1}
                  step={5}
                  required
                  value={formPackRatio}
                  onChange={(e) => setFormPackRatio(Number(e.target.value) || 0)}
                  className="w-full h-[36px] px-3 font-mono font-bold text-[14px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
                />
                <span className="text-[11px] text-[#475e75] mt-1 block">
                  Misal: 50 PCS per pack. Angka harus bernilai positif &gt; 0.
                </span>
              </div>

              <div className="p-2.5 bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] text-[11px] text-[#475e75]">
                Kombinasi Lini dan Part harus unik. Sistem secara otomatis menolak konfigurasi duplikat pada lini yang sama (FEAT-MD-08).
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 text-[12px] font-medium text-[#223548] hover:bg-[#eaecee] border border-[#d5dce2] rounded-[4px] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-[12px] font-bold text-white bg-[#0057d2] hover:bg-[#0049b0] rounded-[4px] cursor-pointer shadow-sm"
                >
                  Simpan Konfigurasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
