import React, { useState } from 'react';
import {
  Settings,
  Search,
  Plus,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  Layers,
  X,
  UserCheck,
} from 'lucide-react';
import {
  StockAdjustment,
  RawMaterial,
  AdjustmentReasonCategory,
} from '../../../types/erp';
import { validateStockAdjustment } from '../../../utils/logic';

interface StockAdjustmentViewProps {
  adjustments: StockAdjustment[];
  materials: RawMaterial[];
  onSaveAdjustment: (newAdj: StockAdjustment) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  prefillMaterialId?: string;
}

export const StockAdjustmentView: React.FC<StockAdjustmentViewProps> = ({
  adjustments,
  materials,
  onSaveAdjustment,
  isCreateModalOpen,
  setIsCreateModalOpen,
  prefillMaterialId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [selectedMaterialId, setSelectedMaterialId] = useState(prefillMaterialId || materials[0]?.id || '');
  const [actualQty, setActualQty] = useState<number>(materials[0]?.onHandQty || 0);
  const [reasonCategory, setReasonCategory] = useState<AdjustmentReasonCategory>('Stock Opname Bulanan');
  const [reasonDetail, setReasonDetail] = useState('');
  const [authorizedBy, setAuthorizedBy] = useState('Bambang Hariyadi (Admin Gudang)');
  const [formError, setFormError] = useState<string | null>(null);

  const activeMaterial = materials.find((m) => m.id === selectedMaterialId) || materials[0];
  const systemQty = activeMaterial ? activeMaterial.onHandQty : 0;
  const difference = actualQty - systemQty;

  const handleOpenModal = (matId?: string) => {
    setFormError(null);
    const targetMat = materials.find((m) => m.id === matId) || materials[0];
    if (targetMat) {
      setSelectedMaterialId(targetMat.id);
      setActualQty(targetMat.onHandQty);
    }
    setReasonCategory('Stock Opname Bulanan');
    setReasonDetail('');
    setIsCreateModalOpen(true);
  };

  const handleSelectMaterial = (matId: string) => {
    setSelectedMaterialId(matId);
    const mat = materials.find((m) => m.id === matId);
    if (mat) {
      setActualQty(mat.onHandQty);
    }
  };

  const handleSubmitModal = () => {
    setFormError(null);
    const mat = materials.find((m) => m.id === selectedMaterialId);
    if (!mat) {
      setFormError('Material bahan baku wajib dipilih.');
      return;
    }

    const val = validateStockAdjustment(mat.onHandQty, actualQty, reasonCategory, reasonDetail);
    if (!val.isValid) {
      setFormError(val.error || 'Validasi penyesuaian stok gagal.');
      return;
    }

    const newAdjNumber = `ADJ-2026-11-${String(adjustments.length + 1).padStart(3, '0')}`;

    const newAdj: StockAdjustment = {
      id: `adj-${Date.now()}`,
      adjNumber: newAdjNumber,
      adjDate: '2026-11-08',
      materialId: mat.id,
      materialCode: mat.code,
      materialName: mat.name,
      storageLocation: mat.storageLocation,
      systemQtyBefore: mat.onHandQty,
      actualPhysicalQty: actualQty,
      differenceQty: val.differenceQty,
      uom: mat.purchaseUom,
      reasonCategory,
      reasonDetail: reasonDetail.trim(),
      authorizedBy: authorizedBy.trim() || 'Admin Gudang',
      notes: `Koreksi stok via ledger: ${val.differenceQty > 0 ? `+${val.differenceQty}` : val.differenceQty} ${mat.purchaseUom}`,
    };

    onSaveAdjustment(newAdj);
    setIsCreateModalOpen(false);
  };

  const filteredAdjustments = adjustments.filter((adj) => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchNum = adj.adjNumber.toLowerCase().includes(q);
      const matchMat = adj.materialCode.toLowerCase().includes(q) || adj.materialName.toLowerCase().includes(q);
      const matchReason = adj.reasonCategory.toLowerCase().includes(q) || adj.reasonDetail.toLowerCase().includes(q);
      if (!matchNum && !matchMat && !matchReason) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8fafc]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#d5dce2]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#73510d]/10 text-[#73510d] border border-[#73510d]/20 rounded-[4px] flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#73510d]" />
              FEAT-WH-04 · Otorisasi Khusus (Permission: stock_adjust_material)
            </span>
            <span className="text-[10px] font-semibold text-[#545454]">
              Koreksi Saldo via Ledger (F-13)
            </span>
          </div>
          <h1 className="text-[20px] font-bold text-[#000000] tracking-tight">
            Penyesuaian Stok Material (Stock Adjustment) & Audit Selisih Opname
          </h1>
          <p className="text-[12px] text-[#545454] mt-0.5">
            Pencatatan resmi koreksi saldo stok material hasil stock opname fisik, selisih timbangan, atau barang rusak. Seluruh penyesuaian wajib mencantumkan alasan tertulis dan diotorisasi resmi (NFR-04).
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-[#ffffff] bg-[#0057d2] hover:bg-[#0046a8] border border-[#0057d2] rounded-[4px] shadow-sm transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          + Buat Penyesuaian Stok (Adjustment)
        </button>
      </div>

      {/* Governance & Rule Callout Banner */}
      <div className="p-3 bg-[#fbf5eb] border border-[#f5dfb8] rounded-[4px] text-[11px] text-[#73510d] flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#73510d] mt-0.5 shrink-0" />
        <div>
          <strong className="text-[#73510d]">Aturan Audit Penyesuaian Saldo (FEAT-WH-04 & NFR-04):</strong>{' '}
          Penyesuaian stok hanya boleh dilakukan oleh staf dengan izin otorisasi khusus. Sistem secara mutlak menolak penyesuaian yang tidak mencantumkan alasan tertulis rinci atau penyesuaian yang menyebabkan saldo bernilai negatif.
          Adjustment dicatat sebagai mutasi bertipe <code>adj</code> di ledger append-only lengkap dengan catatan selisih.
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-medium text-[#545454]">
          Menampilkan {filteredAdjustments.length} transaksi penyesuaian stok resmi
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#545454]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari No. ADJ, Material, Alasan..."
            className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
          />
        </div>
      </div>

      {/* Table: Riwayat Stock Adjustment */}
      <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] overflow-hidden shadow-xs">
        <div className="px-4 py-2.5 bg-[#f8fafc] border-b border-[#d5dce2] flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#000000]">
            Riwayat Penyesuaian Stok Material (Audit Trail)
          </span>
          <span className="text-[10px] text-[#545454]">
            Tercatat permanen di Ledger
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-[#d5dce2] bg-[#f5f6f7] text-[#545454] font-semibold">
                <th className="py-2.5 px-3">No. ADJ & Tanggal</th>
                <th className="py-2.5 px-3">Material Baku</th>
                <th className="py-2.5 px-3">Lokasi Rak</th>
                <th className="py-2.5 px-3 text-right">Saldo Sistem</th>
                <th className="py-2.5 px-3 text-right">Fisik Opname</th>
                <th className="py-2.5 px-3 text-right font-bold">Selisih (+/-)</th>
                <th className="py-2.5 px-3">Kategori Alasan</th>
                <th className="py-2.5 px-3">Keterangan Detail (Wajib)</th>
                <th className="py-2.5 px-3">Diotorisasi Oleh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d5dce2]">
              {filteredAdjustments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#545454]">
                    Belum ada riwayat penyesuaian stok yang tercatat.
                  </td>
                </tr>
              ) : (
                filteredAdjustments.map((adj) => {
                  const isPositive = adj.differenceQty > 0;
                  const isZero = adj.differenceQty === 0;

                  return (
                    <tr key={adj.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-[#0057d2] whitespace-nowrap">
                        {adj.adjNumber}
                        <span className="block text-[10px] text-[#545454] font-normal">
                          {adj.adjDate}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-[#223548] block">
                          {adj.materialCode}
                        </span>
                        <span className="text-[10px] text-[#545454] truncate max-w-[140px] block">
                          {adj.materialName}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[10px] text-[#545454]">
                        {adj.storageLocation}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#545454]">
                        {adj.systemQtyBefore.toLocaleString('id-ID')} {adj.uom}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-[#000000]">
                        {adj.actualPhysicalQty.toLocaleString('id-ID')} {adj.uom}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold">
                        <span
                          className={
                            isPositive
                              ? 'text-[#00875a]'
                              : isZero
                              ? 'text-[#545454]'
                              : 'text-[#de350b]'
                          }
                        >
                          {isPositive ? `+${adj.differenceQty}` : adj.differenceQty} {adj.uom}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-block px-2 py-0.5 text-[9px] font-semibold bg-[#f5f6f7] text-[#223548] border border-[#d5dce2] rounded-[4px]">
                          {adj.reasonCategory}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#000000] max-w-[220px]">
                        {adj.reasonDetail}
                      </td>
                      <td className="py-2.5 px-3 text-[10px] text-[#223548] whitespace-nowrap">
                        <div className="flex items-center gap-1 font-medium">
                          <UserCheck className="w-3.5 h-3.5 text-[#00875a]" />
                          {adj.authorizedBy}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Form Buat Penyesuaian Stok */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#000000]/50 flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-lg w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-[#f8fafc] border-b border-[#d5dce2] flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-bold text-[#000000]">
                  Formulir Penyesuaian Saldo Stok (Stock Adjustment)
                </h3>
                <p className="text-[11px] text-[#545454]">
                  Koreksi saldo fisik persediaan dengan alasan wajib dan jejak audit ledger (FEAT-WH-04).
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

              {/* Material Selection */}
              <div>
                <label className="block text-[10px] font-bold text-[#545454] mb-1">
                  PILIH MATERIAL BAHAN BAKU <span className="text-[#de350b]">*</span>
                </label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => handleSelectMaterial(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code} — {m.name} (Saldo Sistem: {m.onHandQty} {m.purchaseUom})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity Comparison Grid */}
              <div className="p-3 bg-[#f8fafc] border border-[#d5dce2] rounded-[4px] grid grid-cols-3 gap-3 text-center">
                <div>
                  <span className="text-[10px] text-[#545454] block">Saldo Sistem Saat Ini</span>
                  <span className="text-[14px] font-bold text-[#223548]">
                    {systemQty.toLocaleString('id-ID')} {activeMaterial?.purchaseUom}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#545454] block">Hasil Fisik Opname</span>
                  <span className="text-[14px] font-bold text-[#0057d2]">
                    {actualQty.toLocaleString('id-ID')} {activeMaterial?.purchaseUom}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#545454] block">Kalkulasi Selisih</span>
                  <span
                    className={`text-[14px] font-bold ${
                      difference > 0
                        ? 'text-[#00875a]'
                        : difference < 0
                        ? 'text-[#de350b]'
                        : 'text-[#545454]'
                    }`}
                  >
                    {difference > 0 ? `+${difference}` : difference} {activeMaterial?.purchaseUom}
                  </span>
                </div>
              </div>

              {/* Physical Input */}
              <div>
                <label className="block text-[10px] font-bold text-[#545454] mb-1">
                  INPUT KUANTITAS FISIK HASIL OPNAME ({activeMaterial?.purchaseUom}) <span className="text-[#de350b]">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={actualQty}
                  onChange={(e) => setActualQty(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-[13px] font-bold text-[#000000] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                />
                <span className="text-[10px] text-[#545454] mt-0.5 block">
                  Nilai tidak boleh bernilai negatif (NFR-02).
                </span>
              </div>

              {/* Reason Category Dropdown */}
              <div>
                <label className="block text-[10px] font-bold text-[#545454] mb-1">
                  KATEGORI ALASAN PENYESUAIAN <span className="text-[#de350b]">*</span>
                </label>
                <select
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                >
                  <option value="Stock Opname Bulanan">Stock Opname Bulanan</option>
                  <option value="Kerusakan / Cacat Fisik">Kerusakan / Cacat Fisik</option>
                  <option value="Koreksi Kesalahan Input">Koreksi Kesalahan Input</option>
                  <option value="Selisih Timbangan / Scrap">Selisih Timbangan / Scrap</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>

              {/* Detailed Reason Mandatory */}
              <div>
                <label className="block text-[10px] font-bold text-[#545454] mb-1">
                  KETERANGAN ALASAN DETAIL (WAJIB DIISI) <span className="text-[#de350b]">*</span>
                </label>
                <textarea
                  rows={2}
                  value={reasonDetail}
                  onChange={(e) => setReasonDetail(e.target.value)}
                  placeholder="Jelaskan secara spesifik temuan fisik, nomor lembar opname, atau penyebab kerusakan material..."
                  className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                />
                <span className="text-[10px] text-[#545454] mt-0.5 block">
                  Wajib minimal 5 karakter untuk jejak audit pemeriksaan internal.
                </span>
              </div>

              {/* Authorized By */}
              <div>
                <label className="block text-[10px] font-bold text-[#545454] mb-1">
                  NAMA PETUGAS OTORISASI GUDANG
                </label>
                <input
                  type="text"
                  value={authorizedBy}
                  onChange={(e) => setAuthorizedBy(e.target.value)}
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
                Simpan Penyesuaian ke Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
