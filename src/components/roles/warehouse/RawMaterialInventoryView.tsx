import React, { useState } from 'react';
import {
  Box,
  Search,
  Filter,
  Layers,
  ArrowRightLeft,
  Settings,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Warehouse,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { RawMaterial, StorageBinLocation } from '../../../types/erp';

interface RawMaterialInventoryViewProps {
  materials: RawMaterial[];
  storageLocations: StorageBinLocation[];
  onNavigateTab: (tabId: string) => void;
  onOpenIssueModal: (materialId?: string) => void;
  onOpenAdjModal: (materialId?: string) => void;
}

export const RawMaterialInventoryView: React.FC<RawMaterialInventoryViewProps> = ({
  materials,
  storageLocations,
  onNavigateTab,
  onOpenIssueModal,
  onOpenAdjModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredMaterials = materials.filter((mat) => {
    if (categoryFilter !== 'All' && mat.category !== categoryFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchCode = mat.code.toLowerCase().includes(q);
      const matchName = mat.name.toLowerCase().includes(q);
      const matchLoc = mat.storageLocation.toLowerCase().includes(q);
      if (!matchCode && !matchName && !matchLoc) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8fafc]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#d5dce2]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#0057d2]/10 text-[#0057d2] border border-[#0057d2]/20 rounded-[4px]">
              FEAT-WH-02 · Domain 2 Management
            </span>
            <span className="text-[10px] font-semibold text-[#545454]">
              SALDO FISIK ON-HAND RESMI
            </span>
          </div>
          <h1 className="text-[20px] font-bold text-[#000000] tracking-tight">
            Persediaan Bahan Baku (Raw Material Inventory) & Lokasi Rak
          </h1>
          <p className="text-[12px] text-[#545454] mt-0.5">
            Daftar saldo fisik material on-hand, kuantitas teralokasi SPK manufaktur, sisa stok bebas, dan penempatan rak/palet penyimpanan resmi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('warehouse-ledger')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-[#223548] bg-[#ffffff] hover:bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] shadow-sm transition-colors cursor-pointer"
          >
            <ClipboardList className="w-3.5 h-3.5 text-[#0057d2]" />
            Buku Kartu Stok (Ledger)
          </button>
        </div>
      </div>

      {/* Domain Alignment Callout Banner */}
      <div className="p-3 bg-[#e8f1fb] border border-[#b8d5f5] rounded-[4px] text-[11px] text-[#223548] flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#0057d2] mt-0.5 shrink-0" />
        <div>
          <strong className="text-[#0057d2]">Konsistensi Mutlak Domain 2 Management:</strong>{' '}
          Saldo persediaan yang ditampilkan di modul Gudang ini terhubung 100% dengan Domain 2 Executive Management Dashboard.
          Baseline on-hand fisik: <strong>MAT-EPDM-01 (840 Kg)</strong>, <strong>MAT-FOAM-PU10 (1.250 Sheet)</strong>, dan <strong>MAT-EVA-SP20 (950 Sheet)</strong>. Saldo dihitung murni dari kronologi transaksi ledger.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-[#ffffff] p-1 border border-[#d5dce2] rounded-[4px]">
          <button
            onClick={() => setCategoryFilter('All')}
            className={`px-3 py-1 text-[11px] font-semibold rounded-[4px] transition-colors cursor-pointer ${
              categoryFilter === 'All'
                ? 'bg-[#0057d2] text-[#ffffff]'
                : 'text-[#545454] hover:bg-[#f5f6f7]'
            }`}
          >
            Semua Kategori ({materials.length})
          </button>
          <button
            onClick={() => setCategoryFilter('Karet / Rubber')}
            className={`px-3 py-1 text-[11px] font-semibold rounded-[4px] transition-colors cursor-pointer ${
              categoryFilter === 'Karet / Rubber'
                ? 'bg-[#0057d2] text-[#ffffff]'
                : 'text-[#545454] hover:bg-[#f5f6f7]'
            }`}
          >
            Karet / Rubber
          </button>
          <button
            onClick={() => setCategoryFilter('Busa / Foam')}
            className={`px-3 py-1 text-[11px] font-semibold rounded-[4px] transition-colors cursor-pointer ${
              categoryFilter === 'Busa / Foam'
                ? 'bg-[#0057d2] text-[#ffffff]'
                : 'text-[#545454] hover:bg-[#f5f6f7]'
            }`}
          >
            Busa / Foam
          </button>
          <button
            onClick={() => setCategoryFilter('EVA Sponge')}
            className={`px-3 py-1 text-[11px] font-semibold rounded-[4px] transition-colors cursor-pointer ${
              categoryFilter === 'EVA Sponge'
                ? 'bg-[#0057d2] text-[#ffffff]'
                : 'text-[#545454] hover:bg-[#f5f6f7]'
            }`}
          >
            EVA Sponge
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#545454]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Kode, Nama, Lokasi Rak..."
            className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
          />
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] overflow-hidden shadow-xs">
        <div className="px-4 py-2.5 bg-[#f8fafc] border-b border-[#d5dce2] flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#000000]">
            Katalog Saldo Fisik Material Baku ({filteredMaterials.length} Item)
          </span>
          <span className="text-[10px] text-[#545454]">
            Zero-Negative Policy (NFR-02) Aktif
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-[#d5dce2] bg-[#f5f6f7] text-[#545454] font-semibold">
                <th className="py-2.5 px-3">Kode & Nama Material</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3">Lokasi Simpan Rak</th>
                <th className="py-2.5 px-3 text-right">Saldo On-Hand (Fisik)</th>
                <th className="py-2.5 px-3 text-right">Alokasi SPK</th>
                <th className="py-2.5 px-3 text-right">Stok Bebas (Free)</th>
                <th className="py-2.5 px-3 text-right">Safety Buffer</th>
                <th className="py-2.5 px-3">Status Buffer</th>
                <th className="py-2.5 px-3 text-center">Aksi Operasional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d5dce2]">
              {filteredMaterials.map((mat) => {
                const freeStock = Math.max(0, mat.onHandQty - mat.allocatedSpkQty);
                const isSafe = mat.onHandQty > mat.safetyStock;

                return (
                  <tr key={mat.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-[#0057d2] block">{mat.code}</span>
                      <span className="text-[#000000] font-medium block">{mat.name}</span>
                      <span className="text-[10px] text-[#545454] block mt-0.5">
                        Konversi: {mat.conversionNote}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#223548]">
                      {mat.category}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-[#000000] block">{mat.storageLocation}</span>
                      <span className="text-[10px] text-[#545454]">Kapasitas terkelola</span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="font-bold text-[14px] text-[#0057d2] block">
                        {mat.onHandQty.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-[#545454]">{mat.purchaseUom}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="font-medium text-[#223548] block">
                        {mat.allocatedSpkQty.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-[#545454]">{mat.purchaseUom}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="font-bold text-[#00875a] block">
                        {freeStock.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-[#545454]">{mat.purchaseUom}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#545454]">
                      {mat.safetyStock.toLocaleString('id-ID')} {mat.purchaseUom}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-[4px] ${
                          isSafe
                            ? 'bg-[#00875a]/10 text-[#00875a] border border-[#00875a]/30'
                            : 'bg-[#de350b]/10 text-[#de350b] border border-[#de350b]/30'
                        }`}
                      >
                        {isSafe ? 'Stok Aman' : 'Buffer Kritis'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenIssueModal(mat.id)}
                          className="px-2 py-1 text-[10px] font-semibold text-[#ffffff] bg-[#0057d2] hover:bg-[#0046a8] rounded-[4px] transition-colors cursor-pointer"
                        >
                          Issue Lini
                        </button>
                        <button
                          onClick={() => onOpenAdjModal(mat.id)}
                          className="px-2 py-1 text-[10px] font-semibold text-[#545454] hover:text-[#000000] bg-[#f5f6f7] hover:bg-[#eaecef] border border-[#d5dce2] rounded-[4px] transition-colors cursor-pointer"
                        >
                          Adj
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Storage Bin & Locations Overview */}
      <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#f0f2f5] mb-3">
          <div>
            <h3 className="text-[13px] font-bold text-[#000000]">
              Tata Letak Rak & Pallet Penyimpanan Fisik (Warehouse Bins)
            </h3>
            <p className="text-[11px] text-[#545454]">
              Lokasi fisik terdaftar di Gudang Bahan Baku pabrik PT Nutech Pundi Arta.
            </p>
          </div>
          <span className="text-[10px] font-semibold text-[#00875a] bg-[#00875a]/10 px-2 py-0.5 rounded-[4px]">
            {storageLocations.length} Lokasi Terverifikasi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {storageLocations.map((loc) => (
            <div
              key={loc.id}
              className="p-3 bg-[#f8fafc] border border-[#d5dce2] rounded-[4px] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#0057d2] bg-[#0057d2]/10 px-1.5 py-0.5 rounded-[4px]">
                    {loc.code}
                  </span>
                  <span className="text-[9px] font-semibold text-[#00875a] bg-[#00875a]/10 px-1.5 py-0.5 rounded-[4px]">
                    {loc.status}
                  </span>
                </div>
                <h4 className="text-[12px] font-bold text-[#000000] mt-1.5">
                  {loc.name}
                </h4>
                <p className="text-[10px] text-[#545454] mt-0.5">
                  Zona: {loc.zone}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#d5dce2] flex items-center justify-between text-[10px]">
                <span className="text-[#545454]">Material:</span>
                <span className="font-semibold text-[#223548]">
                  {loc.currentMaterialCode}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] mt-0.5">
                <span className="text-[#545454]">Batas Kapasitas:</span>
                <span className="font-medium text-[#000000]">{loc.capacityLimit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
