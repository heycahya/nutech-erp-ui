/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Pattern 2: Operational Overview / Executive Dashboard
 * Formatted dates in Indonesian style, multi-track downstream overview.
 */

import React, { useState } from 'react';
import { SalesOrder } from '../../types/erp';
import { formatIndoDate } from '../../utils/logic';
import { TrendingUp, AlertTriangle, Search } from 'lucide-react';

interface OverviewPatternProps {
  orders: SalesOrder[];
  onSelectOrder: (order: SalesOrder) => void;
}

export const OverviewPattern: React.FC<OverviewPatternProps> = ({ orders, onSelectOrder }) => {
  const [matrixSearch, setMatrixSearch] = useState('');

  // Aggregate calculations
  const totalOrders = orders.length;
  const urgentOrdersList = orders.filter((o) => o.orderType === 'Urgent');
  const urgentOrders = urgentOrdersList.length;
  const totalQtyOrdered = orders.reduce(
    (acc, o) => acc + o.items.reduce((sum, item) => sum + item.qtyOrdered, 0),
    0
  );
  const totalQtyDelivered = orders.reduce(
    (acc, o) => acc + o.items.reduce((sum, item) => sum + item.qtyDelivered, 0),
    0
  );
  const totalQtyBilled = orders.reduce(
    (acc, o) => acc + o.items.reduce((sum, item) => sum + item.qtyBilled, 0),
    0
  );

  const deliveryPercent =
    totalQtyOrdered > 0 ? Math.round((totalQtyDelivered / totalQtyOrdered) * 100) : 0;
  const billingPercent =
    totalQtyDelivered > 0 ? Math.round((totalQtyBilled / totalQtyDelivered) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto bg-[#ffffff] p-6 space-y-6">
      {/* 1. Industrial Top Metrics Grid (Flat & Disciplined, Zero Decorative Shadows) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 bg-[#f5f6f7] border border-[#d5dce2] rounded-[8px]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#545454]">
            Total Active Sales Orders
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-[#000000] tabular-nums leading-none">
              {totalOrders}
            </span>
            <span className="text-[12px] font-semibold text-[#8d4b00] bg-[#fff6e5] px-1.5 py-0.5 rounded-[4px] border border-[#d5dce2]">
              {urgentOrders} Urgent
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#475e75]">
            5 Customer B2B aktif dalam periode berjalan
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 bg-[#f5f6f7] border border-[#d5dce2] rounded-[8px]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#545454]">
            Total Kebutuhan Volume (PCS)
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-[#000000] tabular-nums leading-none">
              {totalQtyOrdered.toLocaleString('id-ID')}
            </span>
            <span className="text-[12px] font-medium text-[#475e75]">PCS</span>
          </div>
          <div className="mt-2 text-[11px] text-[#475e75]">
            Akumulasi seluruh PO multi-part aktif
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 bg-[#f5f6f7] border border-[#d5dce2] rounded-[8px]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#545454]">
            Kuantitas Delivered Internal SO
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-[#10683b] tabular-nums leading-none">
              {totalQtyDelivered.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] font-semibold text-[#8d4b00] bg-[#fff6e5] px-1.5 py-0.5 rounded-[4px] border border-[#8d4b00]/20">
              Belum Direkonsiliasi
            </span>
          </div>
          <div className="mt-2 text-[10px] text-[#475e75] leading-relaxed">
            Internal SO: {totalQtyDelivered.toLocaleString('id-ID')} PCS · Verified SJ Fisik: <strong className="text-[#10683b]">7.700 PCS</strong>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 bg-[#f5f6f7] border border-[#d5dce2] rounded-[8px]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#545454]">
            Kuantitas Billed Internal SO
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-[#0057d2] tabular-nums leading-none">
              {totalQtyBilled.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] font-semibold text-[#8d4b00] bg-[#fff6e5] px-1.5 py-0.5 rounded-[4px] border border-[#8d4b00]/20">
              Belum Diverifikasi SJ
            </span>
          </div>
          <div className="mt-2 text-[10px] text-[#475e75] leading-relaxed">
            Internal SO: {totalQtyBilled.toLocaleString('id-ID')} PCS · Verified Billed SJ Matched: <strong className="text-[#0057d2]">2.500 PCS</strong>
          </div>
        </div>
      </div>

      {/* 2. Downstream Multi-Track Progress Overview (BR-SO-06) */}
      <div className="border border-[#d5dce2] rounded-[8px] bg-[#ffffff] overflow-hidden">
        <div className="px-4 py-3 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#0057d2]" />
            <h2 className="text-[14px] font-bold text-[#000000]">
              Pemisahan Status Downstream (Aturan BR-SO-06)
            </h2>
          </div>
          <span className="text-[11px] text-[#545454]">
            Status Produksi, Pengiriman, dan Billing dikelola independen
          </span>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#d5dce2]">
          {/* Column 1: Produksi */}
          <div className="space-y-3 pt-3 md:pt-0">
            <div className="flex items-center justify-between text-[13px] font-semibold text-[#000000]">
              <span>Jalur Produksi</span>
              <span className="text-[11px] text-[#475e75]">5 Order</span>
            </div>
            <div className="space-y-2 text-[12px]">
              <div className="flex justify-between items-center py-1 border-b border-[#eaecee]">
                <span className="text-[#475e75]">Completed</span>
                <span className="font-bold text-[#10683b] tabular-nums">1 SO (20%)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#eaecee]">
                <span className="text-[#475e75]">In Production</span>
                <span className="font-bold text-[#0057d2] tabular-nums">3 SO (60%)</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#475e75]">Pending Planning</span>
                <span className="font-bold text-[#8d4b00] tabular-nums">1 SO (20%)</span>
              </div>
            </div>
          </div>

          {/* Column 2: Pengiriman */}
          <div className="space-y-3 pt-3 md:pt-0 md:pl-6">
            <div className="flex items-center justify-between text-[13px] font-semibold text-[#000000]">
              <span>Jalur Pengiriman (Surat Jalan)</span>
              <span className="text-[11px] text-[#475e75]">Potong Stok saat Delivered</span>
            </div>
            <div className="space-y-2 text-[12px]">
              <div className="flex justify-between items-center py-1 border-b border-[#eaecee]">
                <span className="text-[#475e75]">Fully Delivered</span>
                <span className="font-bold text-[#10683b] tabular-nums">1 SO (20%)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#eaecee]">
                <span className="text-[#475e75]">Partially Shipped</span>
                <span className="font-bold text-[#8d4b00] tabular-nums">2 SO (40%)</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#475e75]">Pending Delivery</span>
                <span className="font-bold text-[#354a5f] tabular-nums">2 SO (40%)</span>
              </div>
            </div>
          </div>

          {/* Column 3: Billing & Finance */}
          <div className="space-y-3 pt-3 md:pt-0 md:pl-6">
            <div className="flex items-center justify-between text-[13px] font-semibold text-[#000000]">
              <span>Jalur Billing & Invoice</span>
              <span className="text-[11px] text-[#475e75]">Hanya SJ Matched</span>
            </div>
            <div className="space-y-2 text-[12px]">
              <div className="flex justify-between items-center py-1 border-b border-[#eaecee]">
                <span className="text-[#475e75]">Fully Billed</span>
                <span className="font-bold text-[#10683b] tabular-nums">1 SO (20%)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#eaecee]">
                <span className="text-[#475e75]">Partially Billed</span>
                <span className="font-bold text-[#0057d2] tabular-nums">1 SO (20%)</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#475e75]">Unbilled (Pending SJ)</span>
                <span className="font-bold text-[#354a5f] tabular-nums">3 SO (60%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Urgent Need Date Alert Panel */}
      {urgentOrdersList.length > 0 && (
        <div className="border border-[#8d4b00]/30 bg-[#fff6e5] rounded-[4px] p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#8d4b00] shrink-0 mt-0.5" />
          <div className="text-[12px] text-[#223548]">
            <span className="font-bold text-[#8d4b00]">Perhatian Need Date Urgent: </span>
            Terdapat {urgentOrdersList.length} Sales Order bertipe <span className="font-bold">Urgent</span> dengan tanggal kebutuhan pelanggan prioritas:{' '}
            {urgentOrdersList.map((uo, idx) => (
              <span key={uo.id}>
                {idx > 0 && ' dan '}
                <strong className="text-[#000000]">
                  {uo.soNumber} ({uo.customerName}, Need: {formatIndoDate(uo.needDate)})
                </strong>
              </span>
            ))}
            . Pastikan PPIC mengalokasikan slot lini prioritas.
          </div>
        </div>
      )}

      {/* 4. Customer Fulfillment Matrix */}
      <div className="border border-[#d5dce2] rounded-[4px] bg-[#ffffff] overflow-hidden">
        <div className="px-4 py-3 bg-[#f5f6f7] border-b border-[#d5dce2] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[14px] font-bold text-[#000000]">
              Progres Pemenuhan Sales Order per Customer B2B
            </h2>
            <span className="text-[11px] text-[#545454]">Kompilasi partial fulfillment (BR-SO-03)</span>
          </div>

          <div className="relative w-full sm:w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8c9ba5]" />
            <input
              type="text"
              value={matrixSearch}
              onChange={(e) => setMatrixSearch(e.target.value)}
              placeholder="Cari SO, customer..."
              className="w-full h-[30px] pl-8 pr-2.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] text-[#000000] focus:outline-none focus:border-[#0057d2]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead className="bg-[#ffffff] border-b border-[#d5dce2] text-[11px] font-bold text-[#545454] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">No. SO</th>
                <th className="py-2.5 px-4">Customer B2B</th>
                <th className="py-2.5 px-4 text-center">Tipe</th>
                <th className="py-2.5 px-4 text-center">Need Date</th>
                <th className="py-2.5 px-4 text-right">Dipesan</th>
                <th className="py-2.5 px-4 text-right">Delivered (Internal SO)</th>
                <th className="py-2.5 px-4 text-center">Progres Fisik</th>
                <th className="py-2.5 px-4 text-right">Billed (Internal SO)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d5dce2]">
              {orders
                .filter(
                  (o) =>
                    o.soNumber.toLowerCase().includes(matrixSearch.toLowerCase()) ||
                    o.customerName.toLowerCase().includes(matrixSearch.toLowerCase())
                )
                .map((o) => {
                const totalOrd = o.items.reduce((s, i) => s + i.qtyOrdered, 0);
                const totalDel = o.items.reduce((s, i) => s + i.qtyDelivered, 0);
                const totalBil = o.items.reduce((s, i) => s + i.qtyBilled, 0);
                const pct = totalOrd > 0 ? Math.round((totalDel / totalOrd) * 100) : 0;

                return (
                  <tr
                    key={o.id}
                    onClick={() => onSelectOrder(o)}
                    className="hover:bg-[#f5f6f7] cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-4 font-semibold text-[#0057d2] tabular-nums">
                      {o.soNumber}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-[#000000]">{o.customerName}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded-[4px] border ${
                          o.orderType === 'Urgent'
                            ? 'bg-[#fff6e5] text-[#8d4b00] border-[#8d4b00]/30'
                            : 'bg-[#eaecee] text-[#354a5f] border-[#d5dce2]'
                        }`}
                      >
                        {o.orderType}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center tabular-nums">{formatIndoDate(o.needDate)}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums font-bold text-[#000000]">
                      {totalOrd.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums font-bold text-[#10683b]">
                      {totalDel.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-24 h-2 bg-[#eaecee] rounded-[2px] overflow-hidden">
                          <div
                            className={`h-full ${pct === 100 ? 'bg-[#10683b]' : 'bg-[#0057d2]'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold tabular-nums w-8 text-right">
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums font-bold text-[#0057d2]">
                      {totalBil.toLocaleString('id-ID')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
