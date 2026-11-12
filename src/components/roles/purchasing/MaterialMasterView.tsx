/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FEAT-MD-06 & FEAT-MD-07 — Master Material Bahan Baku & Konversi Satuan (UoM)
 * Grounded in: brd-nutech.md §5.5, features.md §2.1, BR-MAT-04 (TECHNICAL CONSTRAINT).
 */

import React, { useState, useMemo } from 'react';
import {
  RawMaterial,
  Supplier,
  PurchaseUomType,
  UsageUomType,
} from '../../../types/erp';
import {
  Box,
  Plus,
  Search,
  Filter,
  Calculator,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Building,
  Info,
  X,
  Edit2,
  Eye,
} from 'lucide-react';

interface MaterialMasterViewProps {
  materials: RawMaterial[];
  suppliers: Supplier[];
  onSaveMaterial: (material: RawMaterial) => void;
}

export const MaterialMasterView: React.FC<MaterialMasterViewProps> = ({
  materials,
  suppliers,
  onSaveMaterial,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedMaterialDetail, setSelectedMaterialDetail] = useState<RawMaterial | null>(null);

  // Conversion Simulator State
  const [simSelectedMatId, setSimSelectedMatId] = useState<string>(materials[0]?.id || '');
  const [simPurchaseQty, setSimPurchaseQty] = useState<number>(10);

  // Form Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);
  const [formCode, setFormCode] = useState<string>('');
  const [formName, setFormName] = useState<string>('');
  const [formCategory, setFormCategory] = useState<'Karet / Rubber' | 'Busa / Foam' | 'EVA Sponge'>('Karet / Rubber');
  const [formPurchaseUom, setFormPurchaseUom] = useState<PurchaseUomType>('Kg');
  const [formUsageUom, setFormUsageUom] = useState<UsageUomType>('PCS');
  const [formConversionRatio, setFormConversionRatio] = useState<number>(1);
  const [formConversionNote, setFormConversionNote] = useState<string>('');
  const [formSafetyStock, setFormSafetyStock] = useState<number>(300);
  const [formMinOrderQty, setFormMinOrderQty] = useState<number>(100);
  const [formStandardPrice, setFormStandardPrice] = useState<number>(45000);
  const [formSupplierId, setFormSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [formLocation, setFormLocation] = useState<string>('Gudang Material Rak A-01');
  const [formScrapPct, setFormScrapPct] = useState<number>(5);
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered Materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      if (categoryFilter !== 'all' && m.category !== categoryFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          m.code.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          m.preferredSupplierName.toLowerCase().includes(q) ||
          m.storageLocation.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [materials, categoryFilter, searchQuery]);

  // Conversion Simulator Output
  const simMaterial = materials.find((m) => m.id === simSelectedMatId) || materials[0];
  const simConvertedUnits = simMaterial ? simPurchaseQty * simMaterial.conversionRatio : 0;
  const simEstimatedScrap = simMaterial ? Number((simConvertedUnits * (simMaterial.standardScrapPct / 100)).toFixed(1)) : 0;

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingMaterial(null);
    setFormCode(`MAT-NEW-0${materials.length + 1}`);
    setFormName('');
    setFormCategory('Karet / Rubber');
    setFormPurchaseUom('Kg');
    setFormUsageUom('Kg');
    setFormConversionRatio(1);
    setFormConversionNote('1 Kg = 1 Kg compound');
    setFormSafetyStock(200);
    setFormMinOrderQty(100);
    setFormStandardPrice(50000);
    setFormSupplierId(suppliers[0]?.id || '');
    setFormLocation('Gudang Material Rak A-02');
    setFormScrapPct(5);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (m: RawMaterial) => {
    setEditingMaterial(m);
    setFormCode(m.code);
    setFormName(m.name);
    setFormCategory(m.category);
    setFormPurchaseUom(m.purchaseUom);
    setFormUsageUom(m.usageUom);
    setFormConversionRatio(m.conversionRatio);
    setFormConversionNote(m.conversionNote);
    setFormSafetyStock(m.safetyStock);
    setFormMinOrderQty(m.minOrderQty);
    setFormStandardPrice(m.standardPricePerUom);
    setFormSupplierId(m.preferredSupplierId);
    setFormLocation(m.storageLocation);
    setFormScrapPct(m.standardScrapPct);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Save Material
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formCode.trim()) {
      setFormError('Kode Material wajib diisi.');
      return;
    }

    if (!formName.trim()) {
      setFormError('Nama Material wajib diisi.');
      return;
    }

    if (formConversionRatio <= 0) {
      setFormError('Rasio konversi satuan harus lebih dari 0.');
      return;
    }

    const supp = suppliers.find((s) => s.id === formSupplierId);

    const saved: RawMaterial = {
      id: editingMaterial ? editingMaterial.id : `mat-${Date.now()}`,
      code: formCode.trim().toUpperCase(),
      name: formName.trim(),
      category: formCategory,
      purchaseUom: formPurchaseUom,
      usageUom: formUsageUom,
      conversionRatio: formConversionRatio,
      conversionNote: formConversionNote || `1 ${formPurchaseUom} = ${formConversionRatio} ${formUsageUom}`,
      onHandQty: editingMaterial ? editingMaterial.onHandQty : 500, // Pertahankan saldo audit
      allocatedSpkQty: editingMaterial ? editingMaterial.allocatedSpkQty : 0,
      safetyStock: formSafetyStock,
      minOrderQty: formMinOrderQty,
      standardPricePerUom: formStandardPrice,
      preferredSupplierId: formSupplierId,
      preferredSupplierName: supp ? supp.name : 'Supplier Rekanan',
      storageLocation: formLocation,
      standardScrapPct: formScrapPct,
    };

    onSaveMaterial(saved);
    setIsFormModalOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#ffffff] p-6 space-y-5">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#d5dce2] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0057d2] bg-[#ebf8ff] px-2 py-0.5 rounded-[4px] border border-[#0057d2]/20">
              FEAT-MD-06 & FEAT-MD-07 · Technical Constraint
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#10683b] bg-[#edf7ed] px-2 py-0.5 rounded-[4px] border border-[#a5d6a7]">
              KONVERSI SATUAN RESMI (BR-MAT-04)
            </span>
          </div>
          <h1 className="text-[18px] font-bold text-[#000000] mt-1 tracking-tight flex items-center gap-2">
            <Box className="w-5 h-5 text-[#0057d2]" />
            Master Material Bahan Baku & Konfigurasi Satuan (UoM)
          </h1>
          <p className="text-[11px] text-[#545454] mt-0.5">
            Katalog master material bahan baku, aturan konversi satuan beli supplier (Roll/Sheet/Kg) ke satuan produksi (PCS/Kg), dan saldo on-hand fisik.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="px-3.5 py-1.5 text-[11px] font-bold text-[#ffffff] bg-[#0057d2] hover:bg-[#0040b0] rounded-[4px] cursor-pointer inline-flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Material Baku Baru</span>
        </button>
      </div>

      {/* 2. Interactive UoM Conversion Simulator (BR-MAT-04) */}
      <div className="p-4 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px] space-y-3">
        <div className="flex items-center justify-between border-b border-[#eaecee] pb-2 text-[11px]">
          <div className="flex items-center gap-2 font-bold text-[#000000]">
            <ArrowRightLeft className="w-4 h-4 text-[#0057d2]" />
            <span>Kalkulator Simulasi Konversi Satuan Beli ke Satuan Produksi (BR-MAT-04)</span>
          </div>
          <span className="text-[10px] text-[#8d4b00] font-semibold bg-[#fff6e5] px-2 py-0.5 rounded border border-[#8d4b00]/30">
            Mandatori BRD: Multi-UoM Converter
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div>
            <label className="block text-[10px] font-bold text-[#545454] uppercase mb-1">
              Pilih Material:
            </label>
            <select
              value={simSelectedMatId}
              onChange={(e) => setSimSelectedMatId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
            >
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} — {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#545454] uppercase mb-1">
              Kuantitas Satuan Beli ({simMaterial?.purchaseUom}):
            </label>
            <input
              type="number"
              min="1"
              value={simPurchaseQty}
              onChange={(e) => setSimPurchaseQty(parseInt(e.target.value, 10) || 1)}
              className="w-full px-2.5 py-1.5 text-[11px] font-mono font-bold bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
            />
          </div>

          <div className="p-2.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
            <span className="text-[10px] text-[#545454] block">Hasil Konversi Produksi:</span>
            <div className="text-[16px] font-bold text-[#0057d2] font-mono tabular-nums mt-0.5">
              = {simConvertedUnits.toLocaleString('id-ID')} {simMaterial?.usageUom}
            </div>
            <span className="text-[9px] text-[#475e75] block mt-0.5">{simMaterial?.conversionNote}</span>
          </div>

          <div className="p-2.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
            <span className="text-[10px] text-[#545454] block">Estimasi Limbah Scrap:</span>
            <div className="text-[16px] font-bold text-[#8d4b00] font-mono tabular-nums mt-0.5">
              ~{simEstimatedScrap} {simMaterial?.usageUom} ({simMaterial?.standardScrapPct}%)
            </div>
            <span className="text-[9px] text-[#475e75] block mt-0.5">Scrap allowance dies cutting</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px]">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'all', label: 'Semua Kategori' },
            { id: 'Karet / Rubber', label: 'Karet / Rubber' },
            { id: 'Busa / Foam', label: 'Busa / Foam' },
            { id: 'EVA Sponge', label: 'EVA Sponge' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-[4px] cursor-pointer transition-colors whitespace-nowrap ${
                categoryFilter === tab.id
                  ? 'bg-[#ffffff] text-[#0057d2] border border-[#d5dce2] shadow-xs'
                  : 'text-[#545454] hover:text-[#000000] hover:bg-[#eaecee]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#545454] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari Kode, Nama, Lokasi, Supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] w-[240px] focus:outline-none focus:border-[#0057d2]"
          />
        </div>
      </div>

      {/* 4. Table of Materials */}
      <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden bg-[#ffffff]">
        <div className="px-4 py-2.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
          <div className="text-[11px] font-bold text-[#000000] uppercase tracking-wider">
            Katalog Master Material ({filteredMaterials.length})
          </div>
          <span className="text-[10px] text-[#545454]">
            Saldo fisik resmi diverifikasi bersama Domain 2 Management Dashboard
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px] border-collapse">
            <thead className="bg-[#ffffff] border-b border-[#d5dce2] text-[10px] font-bold text-[#545454] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Kode & Nama Material</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-2 text-center">Satuan Beli</th>
                <th className="py-2.5 px-2 text-center">Satuan Pakai</th>
                <th className="py-2.5 px-3">Rasio Konversi</th>
                <th className="py-2.5 px-3 text-right">Saldo On-Hand</th>
                <th className="py-2.5 px-3 text-right">Harga Estimasi (Rp)</th>
                <th className="py-2.5 px-3">Pemasok Utama</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaecee]">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[12px] text-[#545454]">
                    Tidak ada material yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((m) => (
                  <tr key={m.id} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-[#0057d2] text-[11px]">{m.code}</div>
                      <div className="font-semibold text-[#000000] text-[12px] mt-0.5">{m.name}</div>
                      <div className="text-[10px] text-[#545454] mt-0.5">{m.storageLocation}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-[#f5f6f7] border border-[#d5dce2] rounded text-[11px] text-[#223548]">
                        {m.category}
                      </span>
                    </td>

                    <td className="py-3 px-2 text-center">
                      <span className="font-bold text-[#000000] bg-[#f5f6f7] px-2 py-0.5 rounded border border-[#d5dce2] text-[11px]">
                        {m.purchaseUom}
                      </span>
                    </td>

                    <td className="py-3 px-2 text-center">
                      <span className="font-bold text-[#0057d2] bg-[#ebf8ff] px-2 py-0.5 rounded border border-[#0057d2]/20 text-[11px]">
                        {m.usageUom}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-[11px] text-[#354a5f]">
                      <div className="font-semibold text-[#000000]">1 {m.purchaseUom} = {m.conversionRatio} {m.usageUom}</div>
                      <div className="text-[10px] text-[#545454] truncate max-w-[170px]">{m.conversionNote}</div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-[#10683b]">
                      {m.onHandQty.toLocaleString('id-ID')} <span className="text-[10px] text-[#545454] font-normal">{m.purchaseUom}</span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-[#000000]">
                      {m.standardPricePerUom.toLocaleString('id-ID')}
                    </td>

                    <td className="py-3 px-3 text-[11px]">
                      <div className="font-medium text-[#223548]">{m.preferredSupplierName}</div>
                      <div className="text-[10px] text-[#545454]">Safety: {m.safetyStock} {m.purchaseUom}</div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(m)}
                        className="p-1 text-[#545454] hover:text-[#0057d2] hover:bg-[#f5f6f7] rounded cursor-pointer"
                        title="Edit Parameter Material"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modal Form Create / Edit Material */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#000000]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-xl w-full max-w-[600px] overflow-hidden">
            <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#0057d2] uppercase tracking-wider block">
                  {editingMaterial ? 'Edit Parameter Material' : 'Registrasi Material Baru'}
                </span>
                <h3 className="text-[14px] font-bold text-[#000000] mt-0.5">
                  {editingMaterial ? `Ubah Data Material (${editingMaterial.code})` : 'Formulir Material Bahan Baku'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 text-[#545454] hover:text-[#000000] rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 space-y-3.5 text-[12px]">
              {formError && (
                <div className="p-2.5 bg-[#fff6e5] border border-[#8d4b00]/30 rounded-[4px] text-[11px] text-[#8d4b00] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    Kode Material (Unik):
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 text-[11px] font-mono font-bold bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    Kategori Material:
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  >
                    <option value="Karet / Rubber">Karet / Rubber</option>
                    <option value="Busa / Foam">Busa / Foam</option>
                    <option value="EVA Sponge">EVA Sponge</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#223548] mb-1">
                  Nama Lengkap Material:
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder="Misal: EPDM Synthetic Rubber Roll 3mm"
                  className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
                <div>
                  <label className="block text-[10px] font-bold text-[#545454] uppercase mb-1">
                    Satuan Beli:
                  </label>
                  <select
                    value={formPurchaseUom}
                    onChange={(e) => setFormPurchaseUom(e.target.value as PurchaseUomType)}
                    className="w-full px-2 py-1 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  >
                    <option value="Roll">Roll</option>
                    <option value="Sheet">Sheet</option>
                    <option value="Kg">Kg</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#545454] uppercase mb-1">
                    Satuan Pakai:
                  </label>
                  <select
                    value={formUsageUom}
                    onChange={(e) => setFormUsageUom(e.target.value as UsageUomType)}
                    className="w-full px-2 py-1 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  >
                    <option value="PCS">PCS</option>
                    <option value="Mtr">Mtr</option>
                    <option value="Kg">Kg</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#545454] uppercase mb-1">
                    Rasio Konversi:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formConversionRatio}
                    onChange={(e) => setFormConversionRatio(parseInt(e.target.value, 10) || 1)}
                    required
                    className="w-full px-2 py-1 text-[11px] font-mono bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    Harga Beli Standar per Satuan (Rp):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={formStandardPrice}
                    onChange={(e) => setFormStandardPrice(parseInt(e.target.value, 10) || 0)}
                    required
                    className="w-full px-2.5 py-1.5 text-[11px] font-mono bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    Safety Stock Minimal:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formSafetyStock}
                    onChange={(e) => setFormSafetyStock(parseInt(e.target.value, 10) || 0)}
                    required
                    className="w-full px-2.5 py-1.5 text-[11px] font-mono bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    Pemasok Rekomendasi:
                  </label>
                  <select
                    value={formSupplierId}
                    onChange={(e) => setFormSupplierId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    Lokasi Rak Gudang:
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#d5dce2] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-1.5 text-[11px] font-semibold text-[#223548] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-[11px] font-bold text-[#ffffff] bg-[#0057d2] hover:bg-[#0040b0] rounded-[4px] cursor-pointer shadow-xs"
                >
                  Simpan Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
