import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Search,
  Filter,
  Plus,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  ShieldCheck,
  FileText,
  X,
  Building,
} from 'lucide-react';
import {
  MaterialIssue,
  ProductionOrderSpk,
  RawMaterial,
  ProductionLane,
} from '../../../types/erp';
import { validateMaterialIssue } from '../../../utils/logic';

interface MaterialIssueViewProps {
  materialIssues: MaterialIssue[];
  materials: RawMaterial[];
  spkOrders: ProductionOrderSpk[];
  lanes: ProductionLane[];
  onSaveIssue: (newIssue: MaterialIssue) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  prefillMaterialId?: string;
}

export const MaterialIssueView: React.FC<MaterialIssueViewProps> = ({
  materialIssues,
  materials,
  spkOrders,
  lanes,
  onSaveIssue,
  isCreateModalOpen,
  setIsCreateModalOpen,
  prefillMaterialId,
}) => {
  const [selectedIssueId, setSelectedIssueId] = useState<string>(materialIssues[0]?.id || '');
  const [laneFilter, setLaneFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Form State
  const [targetLaneId, setTargetLaneId] = useState('lane-1');
  const [selectedSpkId, setSelectedSpkId] = useState('spk-1');
  const [selectedMaterialId, setSelectedMaterialId] = useState(prefillMaterialId || materials[0]?.id || '');
  const [issueQty, setIssueQty] = useState<number>(50);
  const [requestedBy, setRequestedBy] = useState('Supardi (Foreman Lini)');
  const [authorizedBy, setAuthorizedBy] = useState('Bambang Hariyadi (Admin Gudang)');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const activeMaterial = materials.find((m) => m.id === selectedMaterialId) || materials[0];

  const handleOpenModal = (matId?: string) => {
    setFormError(null);
    if (matId) setSelectedMaterialId(matId);
    setIssueQty(50);
    setNotes('');
    setIsCreateModalOpen(true);
  };

  const handleSubmitModal = () => {
    setFormError(null);
    const mat = materials.find((m) => m.id === selectedMaterialId);
    if (!mat) {
      setFormError('Material bahan baku wajib dipilih.');
      return;
    }

    const lane = lanes.find((l) => l.id === targetLaneId);
    const spk = spkOrders.find((s) => s.id === selectedSpkId);

    // Validate using pure domain logic
    const val = validateMaterialIssue(mat.onHandQty, issueQty, targetLaneId);
    if (!val.isValid) {
      setFormError(val.error || 'Validasi pengeluaran bahan gagal.');
      return;
    }

    const newIssueNumber = `ISSUE-2026-11-${String(materialIssues.length + 1).padStart(3, '0')}`;

    const newIssue: MaterialIssue = {
      id: `issue-${Date.now()}`,
      issueNumber: newIssueNumber,
      issueDate: '2026-11-08',
      spkId: spk?.id || 'spk-1',
      spkNumber: spk?.spkNumber || 'SPK-2026-11-L1',
      targetLaneId,
      targetLaneName: lane?.name || 'Lane 1 (Rubber Cutting)',
      requestedBy: requestedBy.trim() || 'Foreman Lini',
      authorizedBy: authorizedBy.trim() || 'Bambang Hariyadi (Admin Gudang)',
      status: 'Confirmed',
      totalQtyIssued: issueQty,
      notes: notes.trim() || 'Pengeluaran bahan baku diserahkan ke conveyor infeed lini kerja.',
      items: [
        {
          id: `iss-item-${Date.now()}`,
          materialId: mat.id,
          materialCode: mat.code,
          materialName: mat.name,
          qtyIssued: issueQty,
          uom: mat.purchaseUom,
          storageLocation: mat.storageLocation,
          notes: `Diserahkan ke ${lane?.name || 'Lini Produksi'}`,
        },
      ],
    };

    onSaveIssue(newIssue);
    setIsCreateModalOpen(false);
    setSelectedIssueId(newIssue.id);
  };

  // Filtered issues
  const filteredIssues = materialIssues.filter((issue) => {
    if (laneFilter !== 'All' && issue.targetLaneId !== laneFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchNum = issue.issueNumber.toLowerCase().includes(q);
      const matchSpk = issue.spkNumber.toLowerCase().includes(q);
      const matchLane = issue.targetLaneName.toLowerCase().includes(q);
      const matchMat = issue.items.some(
        (i) => i.materialCode.toLowerCase().includes(q) || i.materialName.toLowerCase().includes(q)
      );
      if (!matchNum && !matchSpk && !matchLane && !matchMat) return false;
    }
    return true;
  });

  const selectedIssue = materialIssues.find((i) => i.id === selectedIssueId) || filteredIssues[0];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8fafc]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#d5dce2]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#0057d2]/10 text-[#0057d2] border border-[#0057d2]/20 rounded-[4px]">
              FEAT-WH-03 · BRD F-07
            </span>
            <span className="text-[10px] font-semibold text-[#545454]">
              PENGELUARAN BAHAN BERTAHAP (BR-MAT-02, BR-MAT-03)
            </span>
          </div>
          <h1 className="text-[20px] font-bold text-[#000000] tracking-tight">
            Material Issue — Otorisasi Pengeluaran Bahan ke Lini Produksi
          </h1>
          <p className="text-[12px] text-[#545454] mt-0.5">
            Pengeluaran bahan baku ke lantai produksi secara bertahap sesuai kebutuhan lini kerja (1 SPK ≠ 1 kali issue). Seluruh pengeluaran mengurangi stok material secara otomatis di ledger append-only.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-[#ffffff] bg-[#0057d2] hover:bg-[#0046a8] border border-[#0057d2] rounded-[4px] shadow-sm transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          + Catat Pengeluaran Bahan (Issue)
        </button>
      </div>

      {/* Governance & Rule Callout Banner */}
      <div className="p-3 bg-[#e8f1fb] border border-[#b8d5f5] rounded-[4px] text-[11px] text-[#223548] flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#0057d2] mt-0.5 shrink-0" />
        <div>
          <strong className="text-[#0057d2]">Aturan Pengeluaran Bahan (BR-MAT-02, BR-MAT-03, NFR-02):</strong>{' '}
          Pengambilan bahan baku dilakukan bertahap per kebutuhan lini produksi dan wajib diawasi serta diotorisasi oleh Admin Gudang.
          Sistem secara mutlak menolak transaksi pengeluaran apabila kuantitas melebihi saldo on-hand fisik yang tersedia (Kebijakan Zero-Negative Stock). Pengeluaran material hanya memotong stok bahan mentah dan tidak mengubah stok barang jadi (Finished Goods).
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-[#ffffff] p-1 border border-[#d5dce2] rounded-[4px]">
          <button
            onClick={() => setLaneFilter('All')}
            className={`px-3 py-1 text-[11px] font-semibold rounded-[4px] transition-colors cursor-pointer ${
              laneFilter === 'All'
                ? 'bg-[#0057d2] text-[#ffffff]'
                : 'text-[#545454] hover:bg-[#f5f6f7]'
            }`}
          >
            Semua Lini ({materialIssues.length})
          </button>
          <button
            onClick={() => setLaneFilter('lane-1')}
            className={`px-3 py-1 text-[11px] font-semibold rounded-[4px] transition-colors cursor-pointer ${
              laneFilter === 'lane-1'
                ? 'bg-[#0057d2] text-[#ffffff]'
                : 'text-[#545454] hover:bg-[#f5f6f7]'
            }`}
          >
            Lane 1 (Rubber)
          </button>
          <button
            onClick={() => setLaneFilter('lane-2')}
            className={`px-3 py-1 text-[11px] font-semibold rounded-[4px] transition-colors cursor-pointer ${
              laneFilter === 'lane-2'
                ? 'bg-[#0057d2] text-[#ffffff]'
                : 'text-[#545454] hover:bg-[#f5f6f7]'
            }`}
          >
            Lane 2 (Foam)
          </button>
          <button
            onClick={() => setLaneFilter('lane-3')}
            className={`px-3 py-1 text-[11px] font-semibold rounded-[4px] transition-colors cursor-pointer ${
              laneFilter === 'lane-3'
                ? 'bg-[#0057d2] text-[#ffffff]'
                : 'text-[#545454] hover:bg-[#f5f6f7]'
            }`}
          >
            Lane 3 (EVA)
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#545454]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari No. Issue, SPK, Lini, Material..."
            className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
          />
        </div>
      </div>

      {/* Split Pane: Left Table & Right Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table Pane */}
        <div className="lg:col-span-7 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] overflow-hidden shadow-xs">
          <div className="px-4 py-2.5 bg-[#f8fafc] border-b border-[#d5dce2] flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#000000]">
              Daftar Bukti Pengeluaran Bahan Baku ({filteredIssues.length} Transaksi)
            </span>
            <span className="text-[10px] text-[#545454]">
              Klik baris untuk membuka detail bon pengeluaran
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-[#d5dce2] bg-[#f5f6f7] text-[#545454] font-semibold">
                  <th className="py-2.5 px-3">No. Issue & Tgl</th>
                  <th className="py-2.5 px-3">Ref SPK & Lini Tujuan</th>
                  <th className="py-2.5 px-3">Material Baku</th>
                  <th className="py-2.5 px-3 text-right">Kuantitas Keluar</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d5dce2]">
                {filteredIssues.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#545454]">
                      Tidak ada catatan pengeluaran bahan baku yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredIssues.map((issue) => {
                    const isSelected = selectedIssue?.id === issue.id;
                    const item = issue.items[0];

                    return (
                      <tr
                        key={issue.id}
                        onClick={() => setSelectedIssueId(issue.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#e8f1fb] font-medium'
                            : 'hover:bg-[#f8fafc]'
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-[#0057d2] block">
                            {issue.issueNumber}
                          </span>
                          <span className="text-[10px] text-[#545454]">
                            {issue.issueDate}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-[#000000] block">
                            {issue.spkNumber}
                          </span>
                          <span className="text-[10px] text-[#545454] block">
                            {issue.targetLaneName}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-medium text-[#223548] block">
                            {item ? item.materialCode : '-'}
                          </span>
                          <span className="text-[10px] text-[#545454] truncate max-w-[140px] block">
                            {item ? item.materialName : ''}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#e06c00]">
                          -{issue.totalQtyIssued.toLocaleString('id-ID')}{' '}
                          <span className="text-[10px] font-normal text-[#545454]">
                            {item?.uom || 'Unit'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-block px-2 py-0.5 text-[9px] font-bold rounded-[4px] bg-[#00875a]/10 text-[#00875a] border border-[#00875a]/30">
                            Diserahkan
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Pane */}
        <div className="lg:col-span-5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] overflow-hidden shadow-xs">
          {selectedIssue ? (
            <div className="divide-y divide-[#d5dce2]">
              {/* Header */}
              <div className="p-4 bg-[#f8fafc] flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#545454] uppercase tracking-wider">
                      Bukti Serah Terima Material (Issue Slip)
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-[4px] bg-[#00875a]/10 text-[#00875a] border border-[#00875a]/30">
                      Confirmed
                    </span>
                  </div>
                  <h3 className="text-[16px] font-bold text-[#000000] mt-1">
                    {selectedIssue.issueNumber}
                  </h3>
                  <p className="text-[11px] text-[#545454]">
                    Peruntukan SPK:{' '}
                    <span className="font-semibold text-[#0057d2]">
                      {selectedIssue.spkNumber}
                    </span>
                  </p>
                </div>
              </div>

              {/* Attributes */}
              <div className="p-4 space-y-3 text-[11px]">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#f0f2f5]">
                  <div>
                    <span className="text-[10px] text-[#545454] block">Lini Produksi Tujuan:</span>
                    <span className="font-semibold text-[#000000]">
                      {selectedIssue.targetLaneName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#545454] block">Tanggal Pengeluaran:</span>
                    <span className="font-medium text-[#000000]">
                      {selectedIssue.issueDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#545454] block">Pemohon (Foreman Lini):</span>
                    <span className="font-medium text-[#000000]">
                      {selectedIssue.requestedBy}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#545454] block">Diotorisasi Oleh:</span>
                    <span className="font-medium text-[#000000]">
                      {selectedIssue.authorizedBy}
                    </span>
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <span className="text-[10px] font-bold text-[#545454] uppercase tracking-wider block mb-2">
                    Daftar Material yang Dikeluarkan ({selectedIssue.items.length} Baris):
                  </span>
                  <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-[#f5f6f7] text-[#545454] font-semibold border-b border-[#d5dce2]">
                        <tr>
                          <th className="py-1.5 px-2.5">Material</th>
                          <th className="py-1.5 px-2 text-right">Kuantitas</th>
                          <th className="py-1.5 px-2">Asal Rak</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0f2f5]">
                        {selectedIssue.items.map((item) => (
                          <tr key={item.id}>
                            <td className="py-2 px-2.5">
                              <span className="font-bold text-[#223548] block">
                                {item.materialCode}
                              </span>
                              <span className="text-[10px] text-[#545454]">
                                {item.materialName}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-right font-bold text-[#e06c00]">
                              {item.qtyIssued.toLocaleString('id-ID')} {item.uom}
                            </td>
                            <td className="py-2 px-2 text-[10px] text-[#545454]">
                              {item.storageLocation}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notes */}
                {selectedIssue.notes && (
                  <div className="p-2.5 bg-[#f8fafc] border border-[#d5dce2] rounded-[4px]">
                    <span className="text-[10px] font-bold text-[#545454] block mb-0.5">
                      Catatan Serah Terima Fisik:
                    </span>
                    <p className="text-[11px] text-[#000000] italic">
                      "{selectedIssue.notes}"
                    </p>
                  </div>
                )}

                {/* Ledger Proof Badge */}
                <div className="p-2.5 bg-[#00875a]/10 border border-[#00875a]/20 rounded-[4px] text-[10px] text-[#00875a] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Transaksi ini telah memotong saldo persediaan bahan baku dan tercatat di Ledger Append-Only.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-[#545454]">
              Pilih salah satu bukti Material Issue di sebelah kiri untuk melihat detail serah terima.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Input Pengeluaran Bahan ke Lini */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#000000]/50 flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-lg w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-[#f8fafc] border-b border-[#d5dce2] flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-bold text-[#000000]">
                  Formulir Pengeluaran Bahan Baku ke Lini (Material Issue)
                </h3>
                <p className="text-[11px] text-[#545454]">
                  Otorisasi serah terima bahan baku gudang untuk jadwal produksi aktif (FEAT-WH-03).
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#545454] hover:text-[#000000] p-1 rounded-[4px] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-[11px]">
              {formError && (
                <div className="p-2.5 bg-[#de350b]/10 border border-[#de350b]/30 rounded-[4px] text-[#de350b] text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Lane & SPK Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#545454] mb-1">
                    LINI PRODUKSI TUJUAN <span className="text-[#de350b]">*</span>
                  </label>
                  <select
                    value={targetLaneId}
                    onChange={(e) => setTargetLaneId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  >
                    <option value="lane-1">Lane 1 (Rubber Cutting)</option>
                    <option value="lane-2">Lane 2 (Foam Slicing)</option>
                    <option value="lane-3">Lane 3 (EVA Die-cut)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#545454] mb-1">
                    REFERENSI SPK AKTIF <span className="text-[#de350b]">*</span>
                  </label>
                  <select
                    value={selectedSpkId}
                    onChange={(e) => setSelectedSpkId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  >
                    {spkOrders.map((spk) => (
                      <option key={spk.id} value={spk.id}>
                        {spk.spkNumber} ({spk.laneName.split('(')[0]})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Material Selection & Stock Checker */}
              <div>
                <label className="block text-[10px] font-bold text-[#545454] mb-1">
                  PILIH MATERIAL BAHAN BAKU <span className="text-[#de350b]">*</span>
                </label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code} — {m.name} (Tersedia: {m.onHandQty} {m.purchaseUom})
                    </option>
                  ))}
                </select>

                <div className="mt-2 p-2.5 bg-[#f8fafc] border border-[#d5dce2] rounded-[4px] flex items-center justify-between text-[11px]">
                  <span className="text-[#545454]">Saldo Fisik On-Hand Tersedia:</span>
                  <span className="font-bold text-[#0057d2]">
                    {activeMaterial?.onHandQty} {activeMaterial?.purchaseUom}
                  </span>
                </div>
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block text-[10px] font-bold text-[#545454] mb-1">
                  KUANTITAS BAHAN YANG DIKELUARKAN ({activeMaterial?.purchaseUom}) <span className="text-[#de350b]">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={activeMaterial?.onHandQty}
                  value={issueQty}
                  onChange={(e) => setIssueQty(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-[13px] font-bold text-[#000000] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                />
                <span className="text-[10px] text-[#545454] mt-1 block">
                  Batas maksimum pengeluaran: {activeMaterial?.onHandQty} {activeMaterial?.purchaseUom} (Zero Negative Stock Policy).
                </span>
              </div>

              {/* Personnel Form */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#545454] mb-1">
                    PEMOHON / FOREMAN LINI
                  </label>
                  <input
                    type="text"
                    value={requestedBy}
                    onChange={(e) => setRequestedBy(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#545454] mb-1">
                    PETUGAS OTORISASI GUDANG
                  </label>
                  <input
                    type="text"
                    value={authorizedBy}
                    onChange={(e) => setAuthorizedBy(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px]"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-bold text-[#545454] mb-1">
                  CATATAN / PERUNTUKAN BATCH
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Pengambilan shift pagi setup mesin potong"
                  className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-[#f8fafc] border-t border-[#d5dce2] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-3 py-1.5 text-[11px] font-medium text-[#545454] hover:bg-[#eaecef] border border-[#d5dce2] rounded-[4px] transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSubmitModal}
                className="px-4 py-1.5 text-[11px] font-semibold text-[#ffffff] bg-[#0057d2] hover:bg-[#0046a8] border border-[#0057d2] rounded-[4px] shadow-sm transition-colors cursor-pointer"
              >
                Otorisasi & Kurangi Stok Fisik
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
