/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Part Component Catalog View (Marketing Module)
 * BRD Section 8.4, FEAT-MD-02, FEAT-MD-08
 * Pengelolaan katalog komponen otomotif, satuan resmi PCS, rasio pack-to-PCS, dan alokasi lini produksi.
 */

import React, { useState, useMemo } from 'react';
import { PartItem, SalesOrder } from '../../../types/erp';
import {
  Box,
  Search,
  Plus,
  Factory,
  Layers,
  DollarSign,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  Sliders,
} from 'lucide-react';

interface PartCatalogViewProps {
  parts: PartItem[];
  orders: SalesOrder[];
  onAddPart: (part: PartItem) => void;
}

export const PartCatalogView: React.FC<PartCatalogViewProps> = ({
  parts,
  orders,
  onAddPart,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [laneFilter, setLaneFilter] = useState<string>('all');
  const [selectedPart, setSelectedPart] = useState<PartItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state for adding part
  const [formPartNumber, setFormPartNumber] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<'Karet / Rubber' | 'Busa / Foam' | 'EVA Sponge'>('Karet / Rubber');
  const [formPackRatio, setFormPackRatio] = useState<number>(50);
  const [formStandardPrice, setFormStandardPrice] = useState<number>(15000);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccessNotification, setFormSuccessNotification] = useState<string | null>(null);

  // Helper to determine designated lane from part number / category
  const getDesignatedLane = (partNumber: string, category: string) => {
    if (partNumber.includes('RUB') || category.includes('Rubber')) {
      return { laneName: 'Lini 1 (Rubber Cutting)', process: 'Continuous Cutting & Molding EPDM' };
    }
    if (partNumber.includes('FOAM') || category.includes('Foam')) {
      return { laneName: 'Lini 2 (Foam Slicing)', process: 'Horizontal Splitting & Acoustic Lamination' };
    }
    if (partNumber.includes('EVA') || category.includes('EVA')) {
      return { laneName: 'Lini 3 (EVA Die-cut)', process: 'Hydraulic Press & Precision Kiss-cutting' };
    }
    return { laneName: 'Lini 1 (Rubber Cutting)', process: 'Standar Pabrik' };
  };

  // Filtered parts
  const filteredParts = useMemo(() => {
    return parts.filter((p) => {
      const matchesSearch =
        p.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

      const laneInfo = getDesignatedLane(p.partNumber, p.category);
      const matchesLane =
        laneFilter === 'all' ||
        (laneFilter === 'lane-1' && laneInfo.laneName.includes('Lini 1')) ||
        (laneFilter === 'lane-2' && laneInfo.laneName.includes('Lini 2')) ||
        (laneFilter === 'lane-3' && laneInfo.laneName.includes('Lini 3'));

      return matchesSearch && matchesCategory && matchesLane;
    });
  }, [parts, searchTerm, categoryFilter, laneFilter]);

  const handleOpenAddModal = () => {
    setFormPartNumber('NTC-RUB-0105');
    setFormDescription('');
    setFormCategory('Karet / Rubber');
    setFormPackRatio(50);
    setFormStandardPrice(16500);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleSavePart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPartNumber.trim()) {
      setFormError('Nomor part (Part Number) wajib diisi.');
      return;
    }
    if (!formDescription.trim()) {
      setFormError('Deskripsi part komponen wajib diisi.');
      return;
    }
    if (formPackRatio <= 0) {
      setFormError('Rasio pack (PCS per pack) harus lebih dari 0.');
      return;
    }

    const newPart: PartItem = {
      id: `PART-00${parts.length + 1}`,
      partNumber: formPartNumber.trim().toUpperCase(),
      description: formDescription.trim(),
      category: formCategory,
      officialUom: 'PCS',
      defaultPackRatio: formPackRatio,
      standardPrice: formStandardPrice,
    };

    onAddPart(newPart);
    setIsAddModalOpen(false);
    setFormSuccessNotification(`Part baru "${newPart.partNumber} - ${newPart.description}" berhasil ditambahkan ke Katalog.`);
    setTimeout(() => setFormSuccessNotification(null), 5000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#ffffff] p-6 pb-12 space-y-5">
      {/* 1. Header Informasi Halaman */}
      <div className="bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#545454] flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-[#0057d2]" />
              Master Komersial · BRD Section 8.4 & FEAT-MD-02
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#edf7ed] text-[#10683b] border border-[#a5d6a7] rounded-[4px]">
              SATUAN RESMI PCS (UOM TUNGGAL)
            </span>
          </div>
          <h1 className="text-[18px] font-bold text-[#000000] mt-1 tracking-tight">
            Katalog Part Komponen Manufaktur Otomotif
          </h1>
          <p className="text-[11px] text-[#545454] mt-0.5">
            Daftar resmi part komponen kendaraan, rasio kemasan (Pack-to-PCS), harga acuan, dan pemetaan lini produksi
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-bold text-white bg-[#0057d2] hover:bg-[#0049b0] active:bg-[#00368a] rounded-[4px] shadow-sm transition-colors cursor-pointer shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Part (Simulasi)</span>
        </button>
      </div>

      {/* Success Notification Toast */}
      {formSuccessNotification && (
        <div className="p-3 bg-[#eaf6ef] border border-[#10683b]/30 rounded-[4px] flex items-center justify-between text-[12px] text-[#10683b]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{formSuccessNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setFormSuccessNotification(null)}
            className="p-1 hover:bg-[#10683b]/10 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Filter & Pencarian */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-[#545454] mr-1">Kategori:</span>
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`px-2 py-1 text-[11px] font-medium rounded-[4px] border transition-colors cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-[#0057d2] text-[#ffffff] border-[#0057d2] font-semibold'
                  : 'bg-[#ffffff] text-[#223548] border-[#d5dce2] hover:bg-[#eaecee]'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('Karet / Rubber')}
              className={`px-2 py-1 text-[11px] font-medium rounded-[4px] border transition-colors cursor-pointer ${
                categoryFilter === 'Karet / Rubber'
                  ? 'bg-[#0057d2] text-[#ffffff] border-[#0057d2] font-semibold'
                  : 'bg-[#ffffff] text-[#223548] border-[#d5dce2] hover:bg-[#eaecee]'
              }`}
            >
              Karet / Rubber
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('Busa / Foam')}
              className={`px-2 py-1 text-[11px] font-medium rounded-[4px] border transition-colors cursor-pointer ${
                categoryFilter === 'Busa / Foam'
                  ? 'bg-[#0057d2] text-[#ffffff] border-[#0057d2] font-semibold'
                  : 'bg-[#ffffff] text-[#223548] border-[#d5dce2] hover:bg-[#eaecee]'
              }`}
            >
              Busa / Foam
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('EVA Sponge')}
              className={`px-2 py-1 text-[11px] font-medium rounded-[4px] border transition-colors cursor-pointer ${
                categoryFilter === 'EVA Sponge'
                  ? 'bg-[#0057d2] text-[#ffffff] border-[#0057d2] font-semibold'
                  : 'bg-[#ffffff] text-[#223548] border-[#d5dce2] hover:bg-[#eaecee]'
              }`}
            >
              EVA Sponge
            </button>
          </div>

          <div className="h-4 w-[1px] bg-[#d5dce2] mx-1 hidden sm:block" />

          {/* Lane Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-[#545454] mr-1">Lini:</span>
            <button
              type="button"
              onClick={() => setLaneFilter('all')}
              className={`px-2 py-1 text-[11px] font-medium rounded-[4px] border transition-colors cursor-pointer ${
                laneFilter === 'all'
                  ? 'bg-[#354a5f] text-[#ffffff] border-[#354a5f] font-semibold'
                  : 'bg-[#ffffff] text-[#223548] border-[#d5dce2] hover:bg-[#eaecee]'
              }`}
            >
              Semua Lini
            </button>
            <button
              type="button"
              onClick={() => setLaneFilter('lane-1')}
              className={`px-2 py-1 text-[11px] font-medium rounded-[4px] border transition-colors cursor-pointer ${
                laneFilter === 'lane-1'
                  ? 'bg-[#354a5f] text-[#ffffff] border-[#354a5f] font-semibold'
                  : 'bg-[#ffffff] text-[#223548] border-[#d5dce2] hover:bg-[#eaecee]'
              }`}
            >
              Lini 1 (Rubber)
            </button>
            <button
              type="button"
              onClick={() => setLaneFilter('lane-2')}
              className={`px-2 py-1 text-[11px] font-medium rounded-[4px] border transition-colors cursor-pointer ${
                laneFilter === 'lane-2'
                  ? 'bg-[#354a5f] text-[#ffffff] border-[#354a5f] font-semibold'
                  : 'bg-[#ffffff] text-[#223548] border-[#d5dce2] hover:bg-[#eaecee]'
              }`}
            >
              Lini 2 (Foam)
            </button>
            <button
              type="button"
              onClick={() => setLaneFilter('lane-3')}
              className={`px-2 py-1 text-[11px] font-medium rounded-[4px] border transition-colors cursor-pointer ${
                laneFilter === 'lane-3'
                  ? 'bg-[#354a5f] text-[#ffffff] border-[#354a5f] font-semibold'
                  : 'bg-[#ffffff] text-[#223548] border-[#d5dce2] hover:bg-[#eaecee]'
              }`}
            >
              Lini 3 (EVA)
            </button>
          </div>
        </div>

        <div className="relative w-full sm:w-[260px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8c9ba5]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari part number, deskripsi..."
            className="w-full h-[32px] pl-8 pr-3 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2] text-[#000000]"
          />
        </div>
      </div>

      {/* 3. Tabel Katalog Part */}
      <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden bg-[#ffffff]">
        <div className="px-4 py-3 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0057d2]" />
            <h2 className="text-[13px] font-bold text-[#000000]">
              Daftar Spesifikasi & Master Item Part Komponen
            </h2>
          </div>
          <span className="text-[11px] text-[#545454]">
            Menampilkan <strong>{filteredParts.length}</strong> dari {parts.length} part terdaftar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px] border-collapse">
            <thead className="bg-[#ffffff] border-b border-[#d5dce2] text-[10px] font-bold text-[#545454] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Part Number & Deskripsi</th>
                <th className="py-2.5 px-4">Kategori Material</th>
                <th className="py-2.5 px-4 text-center">Satuan Resmi (UoM)</th>
                <th className="py-2.5 px-4 text-center">Rasio Kemasan (Pack Ratio)</th>
                <th className="py-2.5 px-4">Lini Produksi Resmi</th>
                <th className="py-2.5 px-4 text-right">
                  <div>Harga Acuan (Rp)</div>
                  <div className="text-[9px] font-normal text-[#545454] lowercase">estimasi harga standar simulasi (TBD-09)</div>
                </th>
                <th className="py-2.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d5dce2]">
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[12px] text-[#8c9ba5]">
                    Tidak ada part yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredParts.map((p) => {
                  const laneInfo = getDesignatedLane(p.partNumber, p.category);
                  return (
                    <tr key={p.id} className="hover:bg-[#f5f6f7] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono text-[12px] font-bold text-[#0057d2]">
                          {p.partNumber}
                        </div>
                        <div className="text-[13px] font-semibold text-[#000000]">{p.description}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-[#eaecee] text-[#354a5f] rounded-[4px] border border-[#d5dce2]">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-[#edf7ed] text-[#10683b] rounded-[4px] border border-[#a5d6a7]">
                          {p.officialUom}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-bold text-[12px] text-[#000000]">
                          {p.defaultPackRatio}
                        </span>{' '}
                        <span className="text-[10px] text-[#545454]">PCS / pack</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[11px] font-semibold text-[#000000] flex items-center gap-1.5">
                          <Factory className="w-3.5 h-3.5 text-[#545454]" />
                          <span>{laneInfo.laneName}</span>
                        </div>
                        <div className="text-[10px] text-[#545454] mt-0.5 truncate max-w-[220px]">
                          {laneInfo.process}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        <div className="font-bold text-[#000000]">Rp {p.standardPrice.toLocaleString('id-ID')}</div>
                        <div className="text-[9px] text-[#545454]">estimasi simulasi (TBD-09)</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedPart(p)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#0057d2] hover:bg-[#0057d2]/10 border border-[#0057d2]/30 rounded-[4px] transition-colors cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Spesifikasi</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MODAL DETAIL SPESIFIKASI PART */}
      {selectedPart && (
        <div className="fixed inset-0 z-50 bg-[#000000]/40 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-xl w-full max-w-[620px] max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#545454]">
                  Detail Master Part Komponen
                </span>
                <h3 className="text-[15px] font-bold text-[#000000] font-mono">{selectedPart.partNumber}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPart(null)}
                className="p-1 text-[#545454] hover:text-[#000000] rounded hover:bg-[#eaecee] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto text-[12px]">
              <div>
                <span className="text-[10px] text-[#545454] font-bold uppercase block">
                  Deskripsi Komponen Resmi
                </span>
                <div className="text-[14px] font-bold text-[#000000] mt-0.5">
                  {selectedPart.description}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
                  <span className="text-[10px] text-[#545454] font-bold uppercase block">
                    Kategori Bahan
                  </span>
                  <span className="font-semibold text-[#000000]">{selectedPart.category}</span>
                </div>
                <div className="p-3 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
                  <span className="text-[10px] text-[#545454] font-bold uppercase block">
                    Satuan Resmi (UoM)
                  </span>
                  <span className="font-bold text-[#10683b]">PCS (Tunggal)</span>
                </div>
                <div className="p-3 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
                  <span className="text-[10px] text-[#545454] font-bold uppercase block">
                    Rasio Pack-to-PCS
                  </span>
                  <span className="font-bold text-[#0057d2]">
                    {selectedPart.defaultPackRatio} PCS / pack
                  </span>
                </div>
                <div className="p-3 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px] col-span-2 sm:col-span-3">
                  <span className="text-[10px] text-[#545454] font-bold uppercase block">
                    Harga Acuan Standar
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[14px] font-mono font-bold text-[#000000]">
                      Rp {selectedPart.standardPrice.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[11px] text-[#545454]">
                      (Estimasi harga standar simulasi — TBD-09)
                    </span>
                  </div>
                </div>
              </div>

              {/* Lini & Proses */}
              <div className="p-3.5 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px] space-y-1">
                <span className="text-[10px] text-[#545454] font-bold uppercase block">
                  Penetapan Lini Produksi (BRD §2.1)
                </span>
                <div className="font-bold text-[#000000]">
                  {getDesignatedLane(selectedPart.partNumber, selectedPart.category).laneName}
                </div>
                <div className="text-[11px] text-[#475e75]">
                  Proses utama: {getDesignatedLane(selectedPart.partNumber, selectedPart.category).process}
                </div>
              </div>

              {/* BOM Note (DESIGN ASSUMPTION per BRD) */}
              <div className="p-3.5 bg-[#fffdfa] border border-[#ffd54f]/80 rounded-[4px] flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-[#8d4b00] shrink-0 mt-0.5" />
                <div className="text-[11px] text-[#8d4b00]">
                  <strong className="block text-[11px]">Bill of Materials (BOM) & Scrap Allowance:</strong>
                  Spesifikasi konsumsi bahan baku riil dan batas toleransi scrap allowance merupakan <em>DESIGN ASSUMPTION (Placeholder Demo per BRD Section 8.4)</em> yang akan dikonfigurasi resmi sebelum fase go-live.
                </div>
              </div>

              {/* Riwayat Order Terkait */}
              <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden">
                <div className="px-3 py-2 bg-[#f5f6f7] border-b border-[#d5dce2] text-[11px] font-bold text-[#000000]">
                  Sales Order Aktif yang Menggunakan Part Ini
                </div>
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-[#ffffff] border-b border-[#d5dce2] text-[10px] font-bold text-[#545454]">
                    <tr>
                      <th className="py-2 px-3">No. SO</th>
                      <th className="py-2 px-3">Customer</th>
                      <th className="py-2 px-3 text-right">Kuantitas Order</th>
                      <th className="py-2 px-3 text-right">Terkirim</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d5dce2]">
                    {orders
                      .filter((o) => o.items.some((i) => i.partNumber === selectedPart.partNumber))
                      .map((o) => {
                        const item = o.items.find((i) => i.partNumber === selectedPart.partNumber);
                        return (
                          <tr key={o.id} className="hover:bg-[#f5f6f7]">
                            <td className="py-1.5 px-3 font-mono font-bold text-[#0057d2]">
                              {o.soNumber}
                            </td>
                            <td className="py-1.5 px-3">{o.customerName}</td>
                            <td className="py-1.5 px-3 text-right font-bold tabular-nums">
                              {item?.qtyOrdered.toLocaleString('id-ID')} PCS
                            </td>
                            <td className="py-1.5 px-3 text-right text-[#10683b] tabular-nums">
                              {item?.qtyDelivered.toLocaleString('id-ID')} PCS
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-[#f5f6f7] border-t border-[#d5dce2] flex items-center justify-between">
              <span className="text-[10px] text-[#545454]">
                Katalog Part Nutech ERP · Single Source of Truth
              </span>
              <button
                type="button"
                onClick={() => setSelectedPart(null)}
                className="px-3.5 py-1.5 text-[11px] font-semibold text-[#223548] hover:bg-[#eaecee] border border-[#d5dce2] rounded-[4px] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL TAMBAH PART BARU (SIMULASI) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#000000]/40 backdrop-blur-[1px] flex items-center justify-center p-4">
          <form
            onSubmit={handleSavePart}
            className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-xl w-full max-w-[540px] flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0057d2]">
                  Simulasi Master Item
                </span>
                <h3 className="text-[15px] font-bold text-[#000000]">
                  Registrasi Part Komponen Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#545454] hover:text-[#000000] rounded hover:bg-[#eaecee] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-3.5 text-[12px]">
              {formError && (
                <div className="p-2.5 bg-[#fde8e8] border border-[#d32f2f]/30 rounded-[4px] text-[#c62828] text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    Nomor Part (Part Number) <span className="text-[#c62828]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: NTC-RUB-0105"
                    value={formPartNumber}
                    onChange={(e) => setFormPartNumber(e.target.value)}
                    className="w-full h-[32px] px-2.5 font-mono text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] text-[#0057d2] font-bold focus:outline-none focus:border-[#0057d2]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    Kategori Material
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) =>
                      setFormCategory(e.target.value as 'Karet / Rubber' | 'Busa / Foam' | 'EVA Sponge')
                    }
                    className="w-full h-[32px] px-2.5 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px]"
                  >
                    <option value="Karet / Rubber">Karet / Rubber (Lini 1)</option>
                    <option value="Busa / Foam">Busa / Foam (Lini 2)</option>
                    <option value="EVA Sponge">EVA Sponge (Lini 3)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#223548] mb-1">
                  Deskripsi Part Komponen <span className="text-[#c62828]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rubber Boot Steering Gearbox Seal"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full h-[32px] px-2.5 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    Rasio Pack (PCS/pack) <span className="text-[#c62828]">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formPackRatio}
                    onChange={(e) => setFormPackRatio(parseInt(e.target.value, 10) || 1)}
                    className="w-full h-[32px] px-2.5 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    Harga Acuan (Rp / PCS)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={formStandardPrice}
                    onChange={(e) => setFormStandardPrice(parseInt(e.target.value, 10) || 0)}
                    className="w-full h-[32px] px-2.5 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px] text-[11px] text-[#545454]">
                Satuan resmi secara otomatis disetel ke <strong>PCS</strong> sesuai kebijakan single UoM Nutech ERP.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-[#f5f6f7] border-t border-[#d5dce2] flex items-center justify-between">
              <span className="text-[10px] text-[#545454]">
                Mode Simulasi UI Frontend · Tanpa Database Riil
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-[11px] font-semibold text-[#223548] hover:bg-[#eaecee] border border-[#d5dce2] rounded-[4px] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-[11px] font-bold text-white bg-[#0057d2] hover:bg-[#0049b0] rounded-[4px] cursor-pointer"
                >
                  Simpan Part
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
