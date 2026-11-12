import React, { useState } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  Download,
  ShieldCheck,
  FileText,
  PackageCheck,
  ArrowRightLeft,
  Settings,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { StockMovement, RawMaterial } from '../../../types/erp';

interface StockLedgerViewProps {
  stockMovements: StockMovement[];
  materials: RawMaterial[];
}

export const StockLedgerView: React.FC<StockLedgerViewProps> = ({
  stockMovements,
  materials,
}) => {
  const [materialFilter, setMaterialFilter] = useState('All');
  const [movementTypeFilter, setMovementTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter movements
  const filteredMovements = stockMovements.filter((mov) => {
    if (materialFilter !== 'All' && mov.materialCode !== materialFilter) return false;
    if (movementTypeFilter !== 'All' && mov.movementType !== movementTypeFilter) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchRef = mov.referenceNumber.toLowerCase().includes(q);
      const matchMat = mov.materialCode.toLowerCase().includes(q) || mov.materialName.toLowerCase().includes(q);
      const matchUser = mov.userName.toLowerCase().includes(q);
      const matchNote = (mov.notes || '').toLowerCase().includes(q);
      if (!matchRef && !matchMat && !matchUser && !matchNote) return false;
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
              FEAT-WH-02 · BRD F-06 & NFR-04
            </span>
            <span className="text-[10px] font-semibold text-[#545454]">
              BUKU BESAR MUTASI STOK (APPEND-ONLY)
            </span>
          </div>
          <h1 className="text-[20px] font-bold text-[#000000] tracking-tight">
            Kartu Stok Material (Inventory Stock Movements Ledger)
          </h1>
          <p className="text-[12px] text-[#545454] mt-0.5">
            Buku besar transaksi mutasi persediaan append-only. Seluruh penerimaan (GRN), pengeluaran (Issue), dan penyesuaian (Adjustment) tercatat permanen tanpa mutasi langsung.
          </p>
        </div>

        <button
          disabled
          title="Ekspor Buku Besar (TBD)"
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-[#545454] bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] opacity-75 cursor-not-allowed self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-[#545454]" />
          Ekspor Ledger (TBD)
        </button>
      </div>

      {/* Governance & Rule Callout Banner */}
      <div className="p-3 bg-[#e8f1fb] border border-[#b8d5f5] rounded-[4px] text-[11px] text-[#223548] flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#0057d2] mt-0.5 shrink-0" />
        <div>
          <strong className="text-[#0057d2]">Kepatuhan Audit Mutlak (NFR-04 & IATF 16949):</strong>{' '}
          Ledger ini bersifat <strong>append-only</strong> (hanya penambahan baris). Baris transaksi historis tidak dapat diedit atau dihapus secara langsung.
          Setiap pergerakan wajib memuat: <code>timestamp</code>, <code>movement_type</code>, <code>reference_id</code>, <code>user_id</code>, <code>qty</code>, dan <code>notes</code>. Saldo akhir dapat ditelusuri dari total mutasi masuk dikurangi keluar.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Material Select Filter */}
          <div className="flex items-center gap-1.5 bg-[#ffffff] px-2.5 py-1 border border-[#d5dce2] rounded-[4px] text-[11px]">
            <span className="text-[#545454] text-[10px] font-semibold">Material:</span>
            <select
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              className="bg-transparent font-medium text-[#000000] focus:outline-none"
            >
              <option value="All">Semua Material</option>
              {materials.map((m) => (
                <option key={m.id} value={m.code}>
                  {m.code} ({m.name.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Movement Type Filter */}
          <div className="flex items-center gap-1.5 bg-[#ffffff] px-2.5 py-1 border border-[#d5dce2] rounded-[4px] text-[11px]">
            <span className="text-[#545454] text-[10px] font-semibold">Tipe:</span>
            <select
              value={movementTypeFilter}
              onChange={(e) => setMovementTypeFilter(e.target.value)}
              className="bg-transparent font-medium text-[#000000] focus:outline-none"
            >
              <option value="All">Semua Tipe Mutasi</option>
              <option value="grn">Penerimaan (GRN)</option>
              <option value="issue">Pengeluaran (Issue)</option>
              <option value="adj">Penyesuaian (Adjustment)</option>
              <option value="init">Saldo Awal (Init)</option>
            </select>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#545454]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Ref Dokumen, Material, User, Catatan..."
            className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
          />
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] overflow-hidden shadow-xs">
        <div className="px-4 py-2.5 bg-[#f8fafc] border-b border-[#d5dce2] flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#000000]">
            Buku Besar Mutasi Stok ({filteredMovements.length} Transaksi Tercatat)
          </span>
          <span className="text-[10px] text-[#545454]">
            Urutan Kronologis Transaksi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-[#d5dce2] bg-[#f5f6f7] text-[#545454] font-semibold">
                <th className="py-2.5 px-3">Tanggal & Waktu</th>
                <th className="py-2.5 px-3">Tipe Mutasi</th>
                <th className="py-2.5 px-3">No. Referensi Dokumen</th>
                <th className="py-2.5 px-3">Material Baku</th>
                <th className="py-2.5 px-3">Lokasi Rak</th>
                <th className="py-2.5 px-3 text-right">Masuk (+)</th>
                <th className="py-2.5 px-3 text-right">Keluar (-)</th>
                <th className="py-2.5 px-3 text-right font-bold text-[#000000]">Saldo Berjalan</th>
                <th className="py-2.5 px-3">Petugas Otorisasi</th>
                <th className="py-2.5 px-3">Keterangan Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d5dce2]">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-[#545454]">
                    Tidak ada catatan pergerakan stok yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => {
                  const isGrn = mov.movementType === 'grn';
                  const isIssue = mov.movementType === 'issue';
                  const isAdj = mov.movementType === 'adj';
                  const isInit = mov.movementType === 'init';

                  return (
                    <tr key={mov.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="py-2.5 px-3 text-[#223548] whitespace-nowrap font-medium">
                        {mov.transactionDate}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-[4px] ${
                            isGrn
                              ? 'bg-[#00875a]/10 text-[#00875a] border border-[#00875a]/30'
                              : isIssue
                              ? 'bg-[#e06c00]/10 text-[#e06c00] border border-[#e06c00]/30'
                              : isAdj
                              ? 'bg-[#73510d]/10 text-[#73510d] border border-[#73510d]/30'
                              : 'bg-[#0057d2]/10 text-[#0057d2] border border-[#0057d2]/30'
                          }`}
                        >
                          {isGrn
                            ? 'GRN Masuk'
                            : isIssue
                            ? 'Issue Keluar'
                            : isAdj
                            ? 'Adjustment'
                            : 'Saldo Awal'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#0057d2] whitespace-nowrap">
                        {mov.referenceNumber}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-[#223548] block">
                          {mov.materialCode}
                        </span>
                        <span className="text-[10px] text-[#545454] block truncate max-w-[130px]">
                          {mov.materialName}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[10px] text-[#545454]">
                        {mov.storageLocation}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-[#00875a]">
                        {mov.qtyIn > 0 ? `+${mov.qtyIn.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-[#e06c00]">
                        {mov.qtyOut > 0 ? `-${mov.qtyOut.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#000000] text-[12px]">
                        {mov.balanceAfter.toLocaleString('id-ID')}{' '}
                        <span className="text-[10px] font-normal text-[#545454]">{mov.uom}</span>
                      </td>
                      <td className="py-2.5 px-3 text-[10px] text-[#223548] whitespace-nowrap">
                        {mov.userName}
                      </td>
                      <td className="py-2.5 px-3 text-[10px] text-[#545454] max-w-[200px] truncate">
                        {mov.notes || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
