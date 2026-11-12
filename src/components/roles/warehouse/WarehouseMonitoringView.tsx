import React, { useState } from 'react';
import {
  PackageCheck,
  ArrowRightLeft,
  Settings,
  AlertTriangle,
  ArrowUpRight,
  TrendingDown,
  Warehouse,
  FileText,
  Clock,
  Layers,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import {
  RawMaterial,
  PurchaseOrder,
  GoodsReceiptNote,
  MaterialIssue,
  StockMovement,
  MaterialShortageTicket,
  StorageBinLocation,
} from '../../../types/erp';
import { calculateWarehouseSummary } from '../../../utils/logic';

interface WarehouseMonitoringViewProps {
  materials: RawMaterial[];
  purchaseOrders: PurchaseOrder[];
  grnList: GoodsReceiptNote[];
  materialIssues: MaterialIssue[];
  stockMovements: StockMovement[];
  shortageTickets: MaterialShortageTicket[];
  storageLocations: StorageBinLocation[];
  onNavigateTab: (tabId: string) => void;
  onOpenCreateGrn: (prefillPoId?: string) => void;
  onOpenCreateIssue: () => void;
  onOpenCreateAdj: () => void;
}

export const WarehouseMonitoringView: React.FC<WarehouseMonitoringViewProps> = ({
  materials,
  purchaseOrders,
  grnList,
  materialIssues,
  stockMovements,
  shortageTickets,
  storageLocations,
  onNavigateTab,
  onOpenCreateGrn,
  onOpenCreateIssue,
  onOpenCreateAdj,
}) => {
  const summary = calculateWarehouseSummary(materials, stockMovements, purchaseOrders);

  // Inbound PO queue (waiting GRN)
  const pendingInboundPos = purchaseOrders.filter(
    (po) => po.grnStatus === 'No Receipt' || po.grnStatus === 'Partial GRN'
  );

  // Recent movements (last 5)
  const recentMovements = [...stockMovements].reverse().slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8fafc]">
      {/* Header & Quick Action Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#d5dce2]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#0057d2]/10 text-[#0057d2] border border-[#0057d2]/20 rounded-[4px]">
              Gudang Bahan Baku · FEAT-WH-01 s/d FEAT-WH-04
            </span>
            <span className="text-[10px] font-semibold text-[#545454]">
              Zero Negative Policy (BR-MAT-01, NFR-02)
            </span>
          </div>
          <h1 className="text-[20px] font-bold text-[#000000] tracking-tight">
            Monitoring Operasional Gudang Bahan Baku & Persediaan
          </h1>
          <p className="text-[12px] text-[#545454] mt-0.5">
            Pengawasan terpusat saldo on-hand fisik, antrean penerimaan GRN supplier, riwayat pengeluaran bahan ke lini kerja, dan kapasitas penyimpanan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenCreateGrn()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-[#ffffff] bg-[#0057d2] hover:bg-[#0046a8] border border-[#0057d2] rounded-[4px] shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            + Terima Barang (GRN)
          </button>
          <button
            onClick={onOpenCreateIssue}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-[#223548] bg-[#ffffff] hover:bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] shadow-sm transition-colors cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#0057d2]" />
            + Issue Bahan ke Lini
          </button>
          <button
            onClick={onOpenCreateAdj}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-[#223548] bg-[#ffffff] hover:bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] shadow-sm transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-[#73510d]" />
            Penyesuaian Stok
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Saldo On-Hand */}
        <div className="p-4 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[#545454]">Total Item Material Baku</span>
            <div className="p-1.5 bg-[#0057d2]/10 rounded-[4px]">
              <Warehouse className="w-4 h-4 text-[#0057d2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-[#000000]">{summary.totalMaterialItems} Jenis</span>
            <span className="text-[10px] text-[#00875a] font-semibold flex items-center">
              100% Terverifikasi
            </span>
          </div>
          <div className="mt-2 text-[10px] text-[#545454] border-t border-[#f0f2f5] pt-2 flex justify-between">
            <span>EPDM: 840 Kg</span>
            <span>PU Foam: 1.250 Sheet</span>
            <span>EVA: 950 Sheet</span>
          </div>
        </div>

        {/* KPI 2: Armada / Inbound PO Waiting GRN */}
        <div className="p-4 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[#545454]">Inbound Menunggu GRN</span>
            <div className="p-1.5 bg-[#e06c00]/10 rounded-[4px]">
              <PackageCheck className="w-4 h-4 text-[#e06c00]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-[#e06c00]">
              {summary.inboundWaitingGrnCount} PO
            </span>
            <span className="text-[10px] text-[#545454]">
              {pendingInboundPos.length > 0 ? 'Menunggu bongkar muat' : 'Semua PO selesai'}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-[#545454] border-t border-[#f0f2f5] pt-2">
            {pendingInboundPos.length > 0 ? (
              <span className="text-[#e06c00] font-medium">
                PO-0081 (150 Sheet) & PO-0080 (150 Sheet)
              </span>
            ) : (
              'Tidak ada antrean kedatangan'
            )}
          </div>
        </div>

        {/* KPI 3: Total Mutasi Ledger Append-Only */}
        <div className="p-4 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[#545454]">Transaksi Buku Besar (Ledger)</span>
            <div className="p-1.5 bg-[#00875a]/10 rounded-[4px]">
              <FileText className="w-4 h-4 text-[#00875a]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-[#000000]">
              {stockMovements.length} Mutasi
            </span>
            <span className="text-[10px] text-[#00875a] font-semibold">
              Append-Only
            </span>
          </div>
          <div className="mt-2 text-[10px] text-[#545454] border-t border-[#f0f2f5] pt-2 flex justify-between">
            <span>GRN: {grnList.filter(g => g.status === 'Confirmed').length}</span>
            <span>Issue: {materialIssues.length}</span>
            <span>Adj: {stockMovements.filter(m => m.movementType === 'adj').length}</span>
          </div>
        </div>

        {/* KPI 4: Status Buffer / Safety Stock */}
        <div className="p-4 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[#545454]">Indikator Buffer Kritis</span>
            <div className={`p-1.5 rounded-[4px] ${summary.bufferWarningCount > 0 ? 'bg-[#de350b]/10' : 'bg-[#00875a]/10'}`}>
              <AlertTriangle className={`w-4 h-4 ${summary.bufferWarningCount > 0 ? 'text-[#de350b]' : 'text-[#00875a]'}`} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-[22px] font-bold ${summary.bufferWarningCount > 0 ? 'text-[#de350b]' : 'text-[#00875a]'}`}>
              {summary.bufferWarningCount === 0 ? 'Stok Aman' : `${summary.bufferWarningCount} Buffer Kritis`}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-[#545454] border-t border-[#f0f2f5] pt-2">
            {summary.bufferWarningCount === 0 ? (
              <span className="text-[#00875a]">Seluruh material di atas batas safety stock</span>
            ) : (
              <span className="text-[#de350b]">Perlu percepatan penerimaan PO</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid: Inbound Queue & Live Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Inbound PO Queue & Material Inventory Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Antrean PO Supplier Menunggu Penerimaan (GRN) */}
          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] overflow-hidden shadow-xs">
            <div className="px-4 py-3 border-b border-[#d5dce2] bg-[#f8fafc] flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-bold text-[#000000]">
                  Antrean Purchase Order (PO) Menunggu Verifikasi GRN Fisik
                </h3>
                <p className="text-[11px] text-[#545454]">
                  Armada supplier dijadwalkan tiba. Penerimaan fisik wajib dicatat melalui GRN (BR-MAT-01).
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('warehouse-grn')}
                className="text-[11px] font-semibold text-[#0057d2] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Lihat Semua GRN
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-[#d5dce2] bg-[#f5f6f7] text-[#545454] font-semibold">
                    <th className="py-2.5 px-3">No. PO & Tanggal</th>
                    <th className="py-2.5 px-3">Pemasok (Supplier)</th>
                    <th className="py-2.5 px-3">Material Baku</th>
                    <th className="py-2.5 px-3 text-right">Order</th>
                    <th className="py-2.5 px-3 text-right">Diterima GRN</th>
                    <th className="py-2.5 px-3 text-right">Sisa PO</th>
                    <th className="py-2.5 px-3">Status Inbound</th>
                    <th className="py-2.5 px-3 text-center">Aksi Gudang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d5dce2]">
                  {pendingInboundPos.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-[#545454]">
                        Seluruh Purchase Order telah selesai diterima 100% oleh Warehouse.
                      </td>
                    </tr>
                  ) : (
                    pendingInboundPos.map((po) => {
                      const item = po.items[0];
                      const remaining = Math.max(0, (item?.qtyOrdered || 0) - (item?.qtyReceivedGrn || 0));

                      return (
                        <tr key={po.id} className="hover:bg-[#f8fafc] transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-[#0057d2]">
                            {po.poNumber}
                            <span className="block text-[10px] text-[#545454] font-normal">
                              ETA: {po.expectedDeliveryDate}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-[#000000]">
                            {po.supplierName}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-[#223548]">
                            {item ? item.materialCode : '-'}
                            <span className="block text-[10px] text-[#545454] font-normal truncate max-w-[160px]">
                              {item ? item.materialName : ''}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-[#000000]">
                            {item ? item.qtyOrdered.toLocaleString('id-ID') : 0} {item?.purchaseUom}
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#00875a] font-medium">
                            {item ? item.qtyReceivedGrn.toLocaleString('id-ID') : 0} {item?.purchaseUom}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#e06c00]">
                            {remaining.toLocaleString('id-ID')} {item?.purchaseUom}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-[4px] ${
                                po.grnStatus === 'Partial GRN'
                                  ? 'bg-[#e06c00]/10 text-[#e06c00] border border-[#e06c00]/30'
                                  : 'bg-[#0057d2]/10 text-[#0057d2] border border-[#0057d2]/30'
                              }`}
                            >
                              {po.grnStatus === 'Partial GRN' ? 'GRN Parsial' : 'In Transit (Open)'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => onOpenCreateGrn(po.id)}
                              className="px-2.5 py-1 text-[10px] font-semibold text-[#ffffff] bg-[#0057d2] hover:bg-[#0046a8] rounded-[4px] transition-colors cursor-pointer"
                            >
                              Proses GRN
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

          {/* Section: Ringkasan Saldo Stok Material Baku & Lokasi Rak */}
          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] overflow-hidden shadow-xs">
            <div className="px-4 py-3 border-b border-[#d5dce2] bg-[#f8fafc] flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-bold text-[#000000]">
                  Saldo Fisik On-Hand Material Baku (Konsistensi Domain 2 Management)
                </h3>
                <p className="text-[11px] text-[#545454]">
                  Saldo terhitung otomatis dari ledger append-only (NFR-02, NFR-04).
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('warehouse-inventory')}
                className="text-[11px] font-semibold text-[#0057d2] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Lihat Detail Inventory
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {materials.map((mat) => {
                const isSafe = mat.onHandQty > mat.safetyStock;
                const freeStock = Math.max(0, mat.onHandQty - mat.allocatedSpkQty);

                return (
                  <div
                    key={mat.id}
                    className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] flex flex-col justify-between hover:border-[#0057d2] transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#f5f6f7] text-[#223548] border border-[#d5dce2] rounded-[4px]">
                          {mat.code}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-[4px] ${
                            isSafe
                              ? 'bg-[#00875a]/10 text-[#00875a] border border-[#00875a]/30'
                              : 'bg-[#de350b]/10 text-[#de350b] border border-[#de350b]/30'
                          }`}
                        >
                          {isSafe ? 'Stok Aman' : 'Buffer Kritis'}
                        </span>
                      </div>
                      <h4 className="text-[12px] font-bold text-[#000000] mt-1.5 line-clamp-1">
                        {mat.name}
                      </h4>
                      <p className="text-[10px] text-[#545454] mt-0.5">
                        Lokasi: {mat.storageLocation}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#f0f2f5] space-y-1 text-[11px]">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[#545454] text-[10px]">Saldo On-Hand:</span>
                        <span className="text-[16px] font-bold text-[#0057d2]">
                          {mat.onHandQty.toLocaleString('id-ID')} {mat.purchaseUom}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-[#545454]">
                        <span>Alokasi SPK:</span>
                        <span className="font-semibold text-[#000000]">
                          {mat.allocatedSpkQty.toLocaleString('id-ID')} {mat.purchaseUom}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-[#545454]">
                        <span>Stok Bebas (Unallocated):</span>
                        <span className="font-semibold text-[#00875a]">
                          {freeStock.toLocaleString('id-ID')} {mat.purchaseUom}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-[#545454]">
                        <span>Safety Stock:</span>
                        <span>{mat.safetyStock.toLocaleString('id-ID')} {mat.purchaseUom}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#f0f2f5] flex items-center justify-between text-[10px]">
                      <button
                        onClick={() => onNavigateTab('warehouse-ledger')}
                        className="text-[#0057d2] hover:underline font-semibold cursor-pointer"
                      >
                        Buku Kartu Stok →
                      </button>
                      <button
                        onClick={onOpenCreateIssue}
                        className="text-[#545454] hover:text-[#000000] font-medium cursor-pointer"
                      >
                        Issue Bahan
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Urgent PR Shortages & Recent Ledger Stream */}
        <div className="space-y-6">
          {/* Card: Tiket Kebutuhan Bahan (Shortage PR) */}
          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] overflow-hidden shadow-xs">
            <div className="px-4 py-3 border-b border-[#d5dce2] bg-[#f8fafc] flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-bold text-[#000000]">
                  Permintaan Mendesak (PR Shortage)
                </h3>
                <p className="text-[11px] text-[#545454]">
                  Laporan kekurangan bahan dari lantai produksi & PPIC (FEAT-SH-01).
                </p>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-[#de350b]/10 text-[#de350b] rounded-[4px]">
                {shortageTickets.length} Tiket
              </span>
            </div>

            <div className="divide-y divide-[#d5dce2] p-2">
              {shortageTickets.map((ticket) => (
                <div key={ticket.id} className="p-2.5 hover:bg-[#f8fafc] transition-colors rounded-[4px]">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="font-bold text-[#0057d2]">{ticket.ticketNumber}</span>
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-bold rounded-[4px] ${
                        ticket.urgency === 'Urgent'
                          ? 'bg-[#de350b]/10 text-[#de350b] border border-[#de350b]/30'
                          : 'bg-[#545454]/10 text-[#545454]'
                      }`}
                    >
                      {ticket.urgency}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-[#000000]">
                    {ticket.materialCode} ({ticket.qtyNeeded} {ticket.uom})
                  </div>
                  <p className="text-[10px] text-[#545454] mt-0.5 line-clamp-2">
                    {ticket.reason}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#545454]">
                    <span>Oleh: {ticket.requesterName}</span>
                    <span className="font-medium text-[#00875a]">{ticket.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Live Ledger Feed (Append-Only Audit Trail) */}
          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] overflow-hidden shadow-xs">
            <div className="px-4 py-3 border-b border-[#d5dce2] bg-[#f8fafc] flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-bold text-[#000000]">
                  Aktivitas Mutasi Terkini
                </h3>
                <p className="text-[11px] text-[#545454]">
                  Buku besar append-only real-time
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('warehouse-ledger')}
                className="text-[11px] font-semibold text-[#0057d2] hover:underline cursor-pointer"
              >
                Semua
              </button>
            </div>

            <div className="p-3 divide-y divide-[#f0f2f5] space-y-2">
              {recentMovements.map((mov) => {
                const isGrn = mov.movementType === 'grn';
                const isIssue = mov.movementType === 'issue';
                const isAdj = mov.movementType === 'adj';

                return (
                  <div key={mov.id} className="pt-2 first:pt-0 flex items-start gap-2.5">
                    <div
                      className={`p-1.5 rounded-[4px] mt-0.5 shrink-0 ${
                        isGrn
                          ? 'bg-[#00875a]/10 text-[#00875a]'
                          : isIssue
                          ? 'bg-[#e06c00]/10 text-[#e06c00]'
                          : 'bg-[#0057d2]/10 text-[#0057d2]'
                      }`}
                    >
                      {isGrn ? (
                        <PackageCheck className="w-3.5 h-3.5" />
                      ) : isIssue ? (
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      ) : (
                        <Settings className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#000000] truncate">
                          {mov.referenceNumber}
                        </span>
                        <span
                          className={`font-bold ${
                            isGrn
                              ? 'text-[#00875a]'
                              : isIssue
                              ? 'text-[#e06c00]'
                              : 'text-[#0057d2]'
                          }`}
                        >
                          {isGrn ? `+${mov.qtyIn}` : isIssue ? `-${mov.qtyOut}` : `${mov.qtyIn - mov.qtyOut}`} {mov.uom}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#545454] truncate">
                        {mov.materialCode} · Saldo: {mov.balanceAfter} {mov.uom}
                      </div>
                      <div className="text-[9px] text-[#8993a4] mt-0.5 flex items-center justify-between">
                        <span>{mov.transactionDate}</span>
                        <span>{mov.userName.split('(')[0]}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
