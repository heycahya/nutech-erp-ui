/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FEAT-PUR-02 / Monitoring — Purchasing Monitoring & Inbound Material Tracking
 * Grounded in: brd-nutech.md §5.5, features.md §2.4, BR-MAT-01, BR-MAT-04.
 */

import React, { useState, useMemo } from 'react';
import {
  PurchaseOrder,
  Supplier,
  RawMaterial,
  ProductionOrderSpk,
} from '../../../types/erp';
import { formatIndoDate } from '../../../utils/logic';
import {
  Truck,
  PackageCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building,
  Layers,
  Search,
  Filter,
  Info,
  ShieldCheck,
} from 'lucide-react';

interface PurchasingMonitoringViewProps {
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
  materials: RawMaterial[];
  spkOrders: ProductionOrderSpk[];
}

export const PurchasingMonitoringView: React.FC<PurchasingMonitoringViewProps> = ({
  purchaseOrders,
  suppliers,
  materials,
  spkOrders,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Compute inbound line items from purchaseOrders
  const inboundLines = useMemo(() => {
    const list: {
      poId: string;
      poNumber: string;
      supplierId: string;
      supplierName: string;
      orderDate: string;
      expectedDeliveryDate: string;
      poStatus: string;
      grnStatus: string;
      materialCode: string;
      materialName: string;
      purchaseUom: string;
      qtyOrdered: number;
      qtyReceivedGrn: number;
      outstandingQty: number;
      linkedSpkNumber?: string;
      targetLane?: string;
      logisticStatus: 'Delivered' | 'In Transit' | 'Pending Dispatch' | 'Draft';
    }[] = [];

    for (const po of purchaseOrders) {
      const linkedSpk = spkOrders.find((s) => s.id === po.linkedSpkId);

      for (const item of po.items) {
        const outstanding = Math.max(0, item.qtyOrdered - item.qtyReceivedGrn);

        let logisticStatus: 'Delivered' | 'In Transit' | 'Pending Dispatch' | 'Draft' = 'In Transit';
        if (po.status === 'Received' || outstanding === 0) {
          logisticStatus = 'Delivered';
        } else if (po.status === 'Draft') {
          logisticStatus = 'Draft';
        } else if (po.status === 'Open' || po.status === 'Partially Received') {
          logisticStatus = 'In Transit';
        }

        list.push({
          poId: po.id,
          poNumber: po.poNumber,
          supplierId: po.supplierId,
          supplierName: po.supplierName,
          orderDate: po.orderDate,
          expectedDeliveryDate: po.expectedDeliveryDate,
          poStatus: po.status,
          grnStatus: po.grnStatus,
          materialCode: item.materialCode,
          materialName: item.materialName,
          purchaseUom: item.purchaseUom,
          qtyOrdered: item.qtyOrdered,
          qtyReceivedGrn: item.qtyReceivedGrn,
          outstandingQty: outstanding,
          linkedSpkNumber: linkedSpk ? linkedSpk.spkNumber : undefined,
          targetLane: linkedSpk ? linkedSpk.laneName : 'Gudang Material',
          logisticStatus,
        });
      }
    }

    return list;
  }, [purchaseOrders, spkOrders]);

  // Filtered
  const filteredLines = useMemo(() => {
    return inboundLines.filter((row) => {
      if (statusFilter !== 'all' && row.logisticStatus !== statusFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          row.poNumber.toLowerCase().includes(q) ||
          row.supplierName.toLowerCase().includes(q) ||
          row.materialCode.toLowerCase().includes(q) ||
          row.materialName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [inboundLines, statusFilter, searchQuery]);

  // Aggregate Metrics
  const inTransitCount = inboundLines.filter((l) => l.logisticStatus === 'In Transit').length;
  const totalOutstandingQty = inboundLines
    .filter((l) => l.logisticStatus === 'In Transit')
    .reduce((acc, l) => acc + l.outstandingQty, 0);
  const deliveredCount = inboundLines.filter((l) => l.logisticStatus === 'Delivered').length;
  const fulfillmentRate =
    inboundLines.length > 0 ? ((deliveredCount / inboundLines.length) * 100).toFixed(1) : '100';

  return (
    <div className="flex-1 overflow-y-auto bg-[#ffffff] p-6 space-y-5">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#d5dce2] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0057d2] bg-[#ebf8ff] px-2 py-0.5 rounded-[4px] border border-[#0057d2]/20">
              Purchasing Monitoring
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#10683b] bg-[#edf7ed] px-2 py-0.5 rounded-[4px] border border-[#a5d6a7]">
              JADWAL KEDATANGAN MATERIAL & LEAD TIME
            </span>
          </div>
          <h1 className="text-[18px] font-bold text-[#000000] mt-1 tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#0057d2]" />
            Monitoring Pengadaan & Jadwal Kedatangan Bahan (Inbound Tracking)
          </h1>
          <p className="text-[11px] text-[#545454] mt-0.5">
            Pelacakan real-time jadwal pengiriman armada supplier, status pemenuhan PO, dan perbandingan kuantitas order vs bukti fisik GRN Warehouse.
          </p>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#545454]">
            Item Dalam Pengiriman
          </div>
          <div className="mt-1 text-[22px] font-bold text-[#0057d2] tabular-nums">
            {inTransitCount} <span className="text-[12px] font-normal text-[#545454]">Batch Item</span>
          </div>
          <div className="mt-1 text-[11px] text-[#475e75]">Armada supplier menuju pabrik</div>
        </div>

        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#545454]">
            Total Kuantitas In-Transit
          </div>
          <div className="mt-1 text-[22px] font-bold text-[#8d4b00] tabular-nums">
            {totalOutstandingQty.toLocaleString('id-ID')}{' '}
            <span className="text-[12px] font-normal text-[#545454]">Unit Beli</span>
          </div>
          <div className="mt-1 text-[11px] text-[#475e75]">Menunggu kedatangan & GRN</div>
        </div>

        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#545454]">
            Tingkat Pemenuhan PO (Fulfillment)
          </div>
          <div className="mt-1 text-[22px] font-bold text-[#10683b] tabular-nums">
            {fulfillmentRate}%
          </div>
          <div className="mt-1 text-[11px] text-[#475e75]">Berdasarkan verifikasi GRN resmi</div>
        </div>

        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#545454]">
            Kedatangan Terdekat (ETA)
          </div>
          <div className="mt-1 text-[18px] font-bold text-[#000000] tabular-nums">
            08 Nov 2026
          </div>
          <div className="mt-1 text-[11px] text-[#475e75]">PT Polyfoam (150 Sheet PU Foam)</div>
        </div>
      </div>

      {/* 3. Search & Segmented Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px]">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'all', label: 'Semua Status Kedatangan' },
            { id: 'In Transit', label: 'Dalam Perjalanan (In Transit)' },
            { id: 'Delivered', label: 'Telah Diterima Gudang (GRN)' },
            { id: 'Draft', label: 'Draft' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-[4px] cursor-pointer transition-colors whitespace-nowrap ${
                statusFilter === tab.id
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
            placeholder="Cari PO, Supplier, Material..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] w-[240px] focus:outline-none focus:border-[#0057d2]"
          />
        </div>
      </div>

      {/* 4. Inbound Tracking Table */}
      <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden bg-[#ffffff]">
        <div className="px-4 py-2.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
          <div className="text-[11px] font-bold text-[#000000] uppercase tracking-wider">
            Matriks Pelacakan Kedatangan Material ({filteredLines.length} Item)
          </div>
          <span className="text-[10px] text-[#545454]">
            Penerimaan fisik dicatat murni oleh Warehouse (BR-MAT-01)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px] border-collapse">
            <thead className="bg-[#ffffff] border-b border-[#d5dce2] text-[10px] font-bold text-[#545454] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">No. PO & Tanggal</th>
                <th className="py-2.5 px-3">Pemasok (Supplier)</th>
                <th className="py-2.5 px-3">Material Baku</th>
                <th className="py-2.5 px-3 text-right">Kuantitas Order</th>
                <th className="py-2.5 px-3 text-right">Diterima GRN</th>
                <th className="py-2.5 px-3 text-right">Sisa Inbound</th>
                <th className="py-2.5 px-3 text-center">Estimasi Tiba (ETA)</th>
                <th className="py-2.5 px-3 text-center">Status Logistik</th>
                <th className="py-2.5 px-3">Peruntukan SPK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaecee]">
              {filteredLines.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[12px] text-[#545454]">
                    Tidak ada jadwal kedatangan material yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredLines.map((row, idx) => (
                  <tr key={`${row.poId}-${row.materialCode}-${idx}`} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-[#0057d2] text-[11px]">{row.poNumber}</div>
                      <div className="text-[10px] text-[#545454] mt-0.5">{formatIndoDate(row.orderDate)}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-[#000000] text-[11px]">{row.supplierName}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-[#0057d2] text-[11px]">{row.materialCode}</div>
                      <div className="text-[10px] text-[#354a5f] truncate max-w-[170px]">{row.materialName}</div>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-[#000000]">
                      {row.qtyOrdered.toLocaleString('id-ID')} <span className="text-[10px] text-[#545454] font-normal">{row.purchaseUom}</span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      <span className={row.qtyReceivedGrn >= row.qtyOrdered ? 'text-[#10683b] font-bold' : 'text-[#8d4b00]'}>
                        {row.qtyReceivedGrn.toLocaleString('id-ID')}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      <span className={row.outstandingQty > 0 ? 'text-[#8d4b00] font-bold' : 'text-[#545454]'}>
                        {row.outstandingQty > 0 ? row.outstandingQty.toLocaleString('id-ID') : '0'}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span className="font-medium text-[#223548] text-[11px] bg-[#f5f6f7] px-2 py-0.5 rounded border border-[#d5dce2]">
                        {formatIndoDate(row.expectedDeliveryDate)}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {row.logisticStatus === 'Delivered' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-[#edf7ed] text-[#10683b] border border-[#a5d6a7] rounded-[3px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Diterima (GRN)</span>
                        </span>
                      ) : row.logisticStatus === 'In Transit' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-[#fff6e5] text-[#8d4b00] border border-[#8d4b00]/30 rounded-[3px] inline-flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          <span>In Transit</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 bg-[#f5f6f7] text-[#545454] border border-[#d5dce2] rounded-[3px]">
                          Draft PO
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-[11px]">
                      {row.linkedSpkNumber ? (
                        <div>
                          <span className="font-mono font-bold text-[#0057d2]">{row.linkedSpkNumber}</span>
                          <div className="text-[10px] text-[#545454]">{row.targetLane}</div>
                        </div>
                      ) : (
                        <span className="text-[#545454] italic">Gudang Bahan Baku</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-[#f5f6f7] border-t border-[#d5dce2] flex items-center justify-between text-[11px] text-[#545454]">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#0057d2]" />
            <span>Kepatuhan BR-MAT-01: Seluruh armada supplier wajib bongkar muat dan diverifikasi di Gudang Bahan Baku sebelum diserahkan ke lini kerja.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
