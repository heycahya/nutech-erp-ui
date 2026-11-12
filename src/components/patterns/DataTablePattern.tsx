/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Pattern 1: High-Density SAP-Style Enterprise Data Table
 * Refined vertical composition, summary totals row, and Indonesian date formatting.
 */

import React, { useState } from 'react';
import { SalesOrder } from '../../types/erp';
import { formatIndoDate } from '../../utils/logic';
import { Search, Eye, ArrowUpDown, ChevronLeft, ChevronRight, SlidersHorizontal, Edit2 } from 'lucide-react';

interface DataTablePatternProps {
  orders: SalesOrder[];
  onSelectOrder: (order: SalesOrder) => void;
  onOpenCreate: () => void;
  onEditOrder?: (order: SalesOrder) => void;
  isReadOnly?: boolean;
}

export const DataTablePattern: React.FC<DataTablePatternProps> = ({
  orders,
  onSelectOrder,
  onOpenCreate,
  onEditOrder,
  isReadOnly = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'urgent' | 'in_prod' | 'partial_ship'>('all');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Rutin Bulanan' | 'Urgent'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'In Production' | 'Completed' | 'Pending'>('All');
  const [pageSize, setPageSize] = useState<number>(10);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.soNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPoNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'All' || order.orderType === typeFilter;
    const matchesStatus = statusFilter === 'All' || order.statusProduction === statusFilter;

    let matchesQuick = true;
    if (quickFilter === 'urgent') matchesQuick = order.orderType === 'Urgent';
    if (quickFilter === 'in_prod') matchesQuick = order.statusProduction === 'In Production';
    if (quickFilter === 'partial_ship') matchesQuick = order.statusDelivery === 'Partially Shipped';

    return matchesSearch && matchesType && matchesStatus && matchesQuick;
  });

  // Calculate cumulative summary totals
  const totalVolumePcs = filteredOrders.reduce(
    (acc, o) => acc + o.items.reduce((sum, item) => sum + item.qtyOrdered, 0),
    0
  );
  const totalDeliveredPcs = filteredOrders.reduce(
    (acc, o) => acc + o.items.reduce((sum, item) => sum + item.qtyDelivered, 0),
    0
  );
  const totalRemainingPcs = Math.max(0, totalVolumePcs - totalDeliveredPcs);

  return (
    <div className="flex flex-col h-full bg-[#ffffff]">
      {/* 1. Quick Filter Tabs & Operational Search Toolbar */}
      <div className="p-4 border-b border-[#d5dce2] bg-[#ffffff] space-y-3 shrink-0">
        {/* Quick Filter Segmented Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-0.5 bg-[#f5f6f7] border border-[#d5dce2] rounded-[6px]">
            <button
              type="button"
              onClick={() => {
                setQuickFilter('all');
                setTypeFilter('All');
              }}
              className={`px-3 py-1 text-[12px] font-medium rounded-[4px] transition-colors cursor-pointer ${
                quickFilter === 'all'
                  ? 'bg-[#0057d2] text-[#ffffff] font-semibold'
                  : 'text-[#354a5f] hover:text-[#000000] hover:bg-[#eaecee]'
              }`}
            >
              Semua SO ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setQuickFilter('urgent')}
              className={`px-3 py-1 text-[12px] font-medium rounded-[4px] transition-colors cursor-pointer ${
                quickFilter === 'urgent'
                  ? 'bg-[#8d4b00] text-[#ffffff] font-semibold'
                  : 'text-[#8d4b00] hover:bg-[#fff6e5]'
              }`}
            >
              Urgent ({orders.filter((o) => o.orderType === 'Urgent').length})
            </button>
            <button
              type="button"
              onClick={() => setQuickFilter('in_prod')}
              className={`px-3 py-1 text-[12px] font-medium rounded-[4px] transition-colors cursor-pointer ${
                quickFilter === 'in_prod'
                  ? 'bg-[#0057d2] text-[#ffffff] font-semibold'
                  : 'text-[#0057d2] hover:bg-[#ebf8ff]'
              }`}
            >
              Sedang Produksi ({orders.filter((o) => o.statusProduction === 'In Production').length})
            </button>
            <button
              type="button"
              onClick={() => setQuickFilter('partial_ship')}
              className={`px-3 py-1 text-[12px] font-medium rounded-[4px] transition-colors cursor-pointer ${
                quickFilter === 'partial_ship'
                  ? 'bg-[#10683b] text-[#ffffff] font-semibold'
                  : 'text-[#10683b] hover:bg-[#eaf6ef]'
              }`}
            >
              Pengiriman Parsial ({orders.filter((o) => o.statusDelivery === 'Partially Shipped').length})
            </button>
          </div>
        </div>

        {/* Search and Dropdown Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Quick Filter Search */}
            <div className="relative w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#545454]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter No. SO, No. PO, Customer B2B..."
                className="w-full h-[36px] pl-9 pr-3 text-[13px] bg-[#ffffff] border border-[#475e75] rounded-[6px] text-[#223548] placeholder-[#545454] focus:outline-none focus:ring-2 focus:ring-[#0057d2]"
              />
            </div>

            {/* Tipe Pesanan Filter */}
            <div className="flex items-center gap-1.5 text-[12px]">
              <span className="text-[#545454] font-medium">Tipe:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="h-[36px] px-2.5 text-[13px] bg-[#ffffff] border border-[#d5dce2] rounded-[6px] text-[#223548] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
              >
                <option value="All">Semua Tipe</option>
                <option value="Rutin Bulanan">Rutin Bulanan</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            {/* Status Produksi Filter */}
            <div className="flex items-center gap-1.5 text-[12px]">
              <span className="text-[#545454] font-medium">Status Produksi:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="h-[36px] px-2.5 text-[13px] bg-[#ffffff] border border-[#d5dce2] rounded-[6px] text-[#223548] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
              >
                <option value="All">Semua Status</option>
                <option value="In Production">In Production</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Counter info */}
          <div className="text-[12px] text-[#545454] tabular-nums">
            Menampilkan <strong className="text-[#000000]">{filteredOrders.length}</strong> dari{' '}
            <strong className="text-[#000000]">{orders.length}</strong> Sales Order
          </div>
        </div>
      </div>

      {/* 2. High-Density Enterprise Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[1150px] text-left border-collapse">
          {/* Table Header */}
          <thead className="bg-[#f5f6f7] sticky top-0 z-10 border-b border-[#d5dce2] text-[12px] font-semibold text-[#000000] select-none">
            <tr>
              <th className="py-2.5 px-3.5 border-r border-[#d5dce2] w-[130px]">
                <div className="flex items-center justify-between">
                  <span>No. SO</span>
                  <ArrowUpDown className="w-3 h-3 text-[#545454]" />
                </div>
              </th>
              <th className="py-2.5 px-3.5 border-r border-[#d5dce2] w-[160px]">No. PO Pelanggan</th>
              <th className="py-2.5 px-3.5 border-r border-[#d5dce2] min-w-[220px]">Customer B2B</th>
              <th className="py-2.5 px-3.5 border-r border-[#d5dce2] w-[110px]">Tipe Pesanan</th>
              <th className="py-2.5 px-3.5 border-r border-[#d5dce2] w-[115px] text-center">Need Date</th>
              <th className="py-2.5 px-3.5 border-r border-[#d5dce2] w-[150px] text-right">Total Order (PCS)</th>
              <th className="py-2.5 px-3.5 border-r border-[#d5dce2] w-[110px] text-center">Produksi</th>
              <th className="py-2.5 px-3.5 border-r border-[#d5dce2] w-[125px] text-center">Pengiriman</th>
              <th className="py-2.5 px-3.5 border-r border-[#d5dce2] w-[115px] text-center">Billing</th>
              <th className="py-2.5 px-3.5 w-[90px] text-center">Aksi</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[#d5dce2] text-[13px] text-[#223548]">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-16 text-center text-[#545454]">
                  Tidak ada Sales Order yang cocok dengan kriteria filter saat ini.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const totalQty = order.items.reduce((acc, i) => acc + i.qtyOrdered, 0);
                const totalDelivered = order.items.reduce((acc, i) => acc + i.qtyDelivered, 0);
                const isUrgent = order.orderType === 'Urgent';

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-[#f5f6f7] transition-colors cursor-pointer group"
                    onClick={() => onSelectOrder(order)}
                  >
                    {/* No. SO */}
                    <td className="py-3 px-3.5 border-r border-[#d5dce2] font-semibold text-[#0057d2] tabular-nums whitespace-nowrap">
                      {order.soNumber}
                    </td>

                    {/* No. PO */}
                    <td className="py-3 px-3.5 border-r border-[#d5dce2] tabular-nums font-mono font-medium text-[#354a5f] whitespace-nowrap">
                      {order.customerPoNumber}
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-3.5 border-r border-[#d5dce2] font-medium text-[#000000]">
                      <div className="truncate max-w-[260px] font-semibold">{order.customerName}</div>
                      <div className="text-[11px] text-[#475e75] truncate mt-0.5">
                        {order.items.length} line item ({order.items.map((i) => i.partNumber).join(', ')})
                      </div>
                    </td>

                    {/* Tipe Pesanan */}
                    <td className="py-3 px-3.5 border-r border-[#d5dce2] whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded-[4px] border ${
                          isUrgent
                            ? 'bg-[#fff6e5] text-[#8d4b00] border-[#8d4b00]/30'
                            : 'bg-[#eaecee] text-[#354a5f] border-[#d5dce2]'
                        }`}
                      >
                        {order.orderType}
                      </span>
                    </td>

                    {/* Need Date - Formatted Indonesia */}
                    <td className="py-3 px-3.5 border-r border-[#d5dce2] text-center tabular-nums whitespace-nowrap font-medium">
                      <span className={isUrgent ? 'text-[#8d4b00] font-bold' : 'text-[#223548]'}>
                        {formatIndoDate(order.needDate)}
                      </span>
                    </td>

                    {/* Total Order */}
                    <td className="py-3 px-3.5 border-r border-[#d5dce2] text-right tabular-nums whitespace-nowrap">
                      <div className="font-bold text-[#000000]">{totalQty.toLocaleString('id-ID')} PCS</div>
                      <div className="text-[11px] text-[#475e75] mt-0.5">
                        Terkirim: {totalDelivered.toLocaleString('id-ID')} PCS
                      </div>
                    </td>

                    {/* Status Produksi */}
                    <td className="py-3 px-3.5 border-r border-[#d5dce2] text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-[4px] border ${
                          order.statusProduction === 'Completed'
                            ? 'bg-[#eaf6ef] text-[#10683b] border-[#10683b]/30'
                            : order.statusProduction === 'In Production'
                            ? 'bg-[#ebf8ff] text-[#0057d2] border-[#0057d2]/30'
                            : 'bg-[#eaecee] text-[#545454] border-[#d5dce2]'
                        }`}
                      >
                        {order.statusProduction}
                      </span>
                    </td>

                    {/* Status Pengiriman */}
                    <td className="py-3 px-3.5 border-r border-[#d5dce2] text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-[4px] border ${
                          order.statusDelivery === 'Fully Delivered'
                            ? 'bg-[#eaf6ef] text-[#10683b] border-[#10683b]/30'
                            : order.statusDelivery === 'Partially Shipped'
                            ? 'bg-[#fff6e5] text-[#8d4b00] border-[#8d4b00]/30'
                            : 'bg-[#eaecee] text-[#545454] border-[#d5dce2]'
                        }`}
                      >
                        {order.statusDelivery}
                      </span>
                    </td>

                    {/* Status Billing */}
                    <td className="py-3 px-3.5 border-r border-[#d5dce2] text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-[4px] border ${
                          order.statusBilling === 'Fully Billed'
                            ? 'bg-[#eaf6ef] text-[#10683b] border-[#10683b]/30'
                            : order.statusBilling === 'Partially Billed'
                            ? 'bg-[#ebf8ff] text-[#0057d2] border-[#0057d2]/30'
                            : 'bg-[#eaecee] text-[#545454] border-[#d5dce2]'
                        }`}
                      >
                        {order.statusBilling}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectOrder(order)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#0057d2] hover:bg-[#ebf8ff] border border-[#d5dce2] hover:border-[#0057d2] rounded-[4px] transition-colors cursor-pointer"
                          title="Buka Split-Pane Detail Transaksi"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                        {onEditOrder && !isReadOnly && (
                          <button
                            type="button"
                            onClick={() => onEditOrder(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#545454] hover:text-[#0057d2] hover:bg-[#f5f6f7] border border-[#d5dce2] hover:border-[#0057d2] rounded-[4px] transition-colors cursor-pointer"
                            title="Edit Sales Order"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* 3. Enterprise Summary Row (tfoot) — Balancing Vertical Composition */}
          {filteredOrders.length > 0 && (
            <tfoot className="bg-[#f5f6f7] border-t-2 border-[#d5dce2] text-[12px] font-bold text-[#000000] select-none sticky bottom-0 z-10">
              <tr>
                <td colSpan={5} className="py-3 px-3.5 border-r border-[#d5dce2] text-right uppercase tracking-wider text-[#354a5f]">
                  Total Kumulatif ({filteredOrders.length} Pesanan Aktif):
                </td>
                <td className="py-3 px-3.5 border-r border-[#d5dce2] text-right tabular-nums whitespace-nowrap">
                  <div className="text-[13px] text-[#0057d2] font-bold">
                    {totalVolumePcs.toLocaleString('id-ID')} PCS
                  </div>
                  <div className="text-[10px] text-[#475e75] font-normal">
                    Delivered Internal SO: {totalDeliveredPcs.toLocaleString('id-ID')} · Sisa: {totalRemainingPcs.toLocaleString('id-ID')}
                  </div>
                </td>
                <td colSpan={3} className="py-3 px-3.5 border-r border-[#d5dce2] text-center text-[11px] text-[#475e75]">
                  Catatan Internal SO: <strong className="text-[#10683b]">{totalDeliveredPcs.toLocaleString('id-ID')} PCS Kuantitas Delivered Internal SO (Belum Direkonsiliasi)</strong> · <strong className="text-[#8d4b00]">{totalRemainingPcs.toLocaleString('id-ID')} Outstanding PCS</strong>
                </td>
                <td className="py-3 px-3.5 text-center text-[11px] text-[#545454]">
                  Selesai
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* 4. Authentic ERP Pagination & Records Footer Bar */}
      <div className="px-6 py-2.5 border-t border-[#d5dce2] bg-[#f5f6f7] flex flex-wrap items-center justify-between gap-3 text-[12px] text-[#545454] shrink-0">
        <div className="flex items-center gap-3">
          <span>
            Menampilkan <strong className="text-[#000000]">{filteredOrders.length > 0 ? 1 : 0}</strong> -{' '}
            <strong className="text-[#000000]">{filteredOrders.length}</strong> dari{' '}
            <strong className="text-[#000000]">{filteredOrders.length}</strong> data aktif
          </span>
          <span className="text-[#d5dce2]">|</span>
          <div className="flex items-center gap-1.5">
            <span>Baris per halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="h-[26px] px-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] text-[#223548]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Page Nav Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled
            className="p-1 text-[#545454] border border-[#d5dce2] rounded-[4px] bg-[#ffffff] opacity-40 cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2.5 py-0.5 text-[12px] font-bold bg-[#0057d2] text-[#ffffff] rounded-[4px]">
            1
          </span>
          <button
            type="button"
            disabled
            className="p-1 text-[#545454] border border-[#d5dce2] rounded-[4px] bg-[#ffffff] opacity-40 cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
