import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  Lock,
  ArrowRight
} from 'lucide-react';
import { SalesOrder, DeliveryOrder } from '../../../types/erp';
import { evaluateBillingEligibility } from '../../../utils/logic';

interface DeliveryControlMatchingViewProps {
  salesOrders: SalesOrder[];
  deliveryOrders: DeliveryOrder[];
}

export const DeliveryControlMatchingView: React.FC<DeliveryControlMatchingViewProps> = ({
  salesOrders,
  deliveryOrders,
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'MATCHED' | 'EXCEPTION'>('ALL');
  const [activeTab, setActiveTab] = useState<'SO_SUMMARY' | 'SJ_CONTROL'>('SO_SUMMARY');

  // Total metrics
  const totalOrderPcs = salesOrders.reduce(
    (sum, so) => sum + so.items.reduce((s, it) => s + it.qtyOrdered, 0),
    0
  );

  // Delivered terverifikasi HANYA dari Surat Jalan berstatus 'Delivered'
  const deliveredVerifiedPcs = deliveryOrders
    .filter((sj) => sj.status === 'Delivered')
    .reduce((sum, sj) => sum + sj.items.reduce((s, it) => s + it.qtyShipped, 0), 0);

  // Internal SO cumulative delivered
  const totalSoInternalDelivered = salesOrders.reduce(
    (sum, so) => sum + so.items.reduce((s, it) => s + it.qtyDelivered, 0),
    0
  );

  const totalGapPcs = totalOrderPcs - deliveredVerifiedPcs;

  // Matching check per SO
  const soReconciliation = salesOrders.map((so) => {
    const orderQty = so.items.reduce((sum, it) => sum + it.qtyOrdered, 0);
    const internalDelivered = so.items.reduce((sum, it) => sum + it.qtyDelivered, 0);

    // Find linked SJ records
    const linkedSjs = deliveryOrders.filter((sj) => sj.soNumber === so.soNumber);
    const verifiedDelivered = linkedSjs
      .filter((sj) => sj.status === 'Delivered')
      .reduce((sum, sj) => sum + sj.items.reduce((s, it) => s + it.qtyShipped, 0), 0);

    const hasAnomaly = so.soNumber === 'SO-2026-0043' || internalDelivered !== verifiedDelivered;
    const isMatched = !hasAnomaly && linkedSjs.every((sj) => sj.controlStatus === 'Matched');

    return {
      so,
      orderQty,
      internalDelivered,
      verifiedDelivered,
      linkedSjs,
      isMatched,
      hasAnomaly,
      anomalyReason:
        so.soNumber === 'SO-2026-0043'
          ? 'Internal SO mencatat 6.000 PCS terkirim, namun tidak ada dokumen Surat Jalan terverifikasi dalam sistem (Audit Unverified Delivery).'
          : internalDelivered !== verifiedDelivered
          ? `Selisih internal SO (${internalDelivered.toLocaleString('id-ID')} PCS) vs SJ Terverifikasi (${verifiedDelivered.toLocaleString('id-ID')} PCS)`
          : undefined,
    };
  });

  const filteredSoList = soReconciliation.filter((item) => {
    if (filterMode === 'MATCHED') return item.isMatched;
    if (filterMode === 'EXCEPTION') return item.hasAnomaly;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
            Pencocokan & Kontrol Pengiriman (Delivery Control & Matching)
          </h2>
          <p className="text-sm text-zinc-600">
            Rekonsiliasi transaksi pesanan penjualan (Sales Order) terhadap realisasi Surat Jalan fisik dan gerbang penagihan (Billing Gate).
          </p>
        </div>
      </div>

      {/* Prominent Audit Anomaly Alert: SO-2026-0043 */}
      <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-lg shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          Peringatan Audit Anomali Rekonsiliasi: SO-2026-0043 (PT Daya Nusantara Industri Auto)
        </div>
        <div className="text-xs text-rose-800 leading-relaxed space-y-1">
          <p>
            Sales Order <strong>SO-2026-0043</strong> mencatat kuantitas internal <code>qtyDelivered: 6.000 PCS</code>, namun <strong>TIDAK DITEMUKAN dokumen Surat Jalan (SJ) terverifikasi</strong> dalam catatan pengiriman fisik.
          </p>
          <p className="font-semibold text-rose-900">
            Kebijakan Integritas NUTECH ERP: Status pesanan ini dikunci sebagai <span className="bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded font-mono">Exception / Unverified Delivery</span> dan DILARANG masuk proses penagihan (Billing Gate Terkunci) sampai ada dokumen fisik sah.
          </p>
        </div>
      </div>

      {/* KPI Reconciliation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded border border-zinc-200 shadow-xs">
          <span className="text-xs text-zinc-500 font-medium">Total Pesanan Resmi (SO)</span>
          <div className="text-2xl font-bold text-zinc-900 mt-1 font-mono">
            {totalOrderPcs.toLocaleString('id-ID')} <span className="text-xs font-normal text-zinc-500">PCS</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">5 Pesanan Aktif Baseline</span>
        </div>

        <div className="p-4 bg-white rounded border border-zinc-200 shadow-xs">
          <span className="text-xs text-emerald-700 font-medium">Delivered Terverifikasi (SJ Fisik)</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono">
            {deliveredVerifiedPcs.toLocaleString('id-ID')} <span className="text-xs font-normal text-emerald-600">PCS</span>
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block">
            Berdasarkan SJ-0089 & SJ-0090
          </span>
        </div>

        <div className="p-4 bg-white rounded border border-zinc-200 shadow-xs">
          <span className="text-xs text-amber-700 font-medium">Internal SO Qty Delivered</span>
          <div className="text-2xl font-bold text-amber-800 mt-1 font-mono">
            {totalSoInternalDelivered.toLocaleString('id-ID')} <span className="text-xs font-normal text-amber-600">PCS</span>
          </div>
          <span className="text-[11px] text-amber-700 mt-1 block">
            Termasuk 6.000 PCS belum terverifikasi SJ
          </span>
        </div>

        <div className="p-4 bg-white rounded border border-zinc-200 shadow-xs">
          <span className="text-xs text-zinc-500 font-medium">Sisa Pesanan Belum Terkirim</span>
          <div className="text-2xl font-bold text-zinc-900 mt-1 font-mono">
            {totalGapPcs.toLocaleString('id-ID')} <span className="text-xs font-normal text-zinc-500">PCS</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Berdasarkan SJ Terverifikasi</span>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded border border-zinc-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('SO_SUMMARY')}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
              activeTab === 'SO_SUMMARY'
                ? 'bg-[#0057d2] text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            Rekonsiliasi Sales Order vs Surat Jalan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SJ_CONTROL')}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
              activeTab === 'SJ_CONTROL'
                ? 'bg-[#0057d2] text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            Audit Gerbang Penagihan SJ (Billing Gate)
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-500 mr-1">Filter Status:</span>
          {(['ALL', 'MATCHED', 'EXCEPTION'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilterMode(mode)}
              className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
                filterMode === mode
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              {mode === 'ALL' ? 'Semua' : mode === 'MATCHED' ? 'Matched' : 'Exception'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: SO vs SJ Reconciliation Table */}
      {activeTab === 'SO_SUMMARY' && (
        <div className="bg-white rounded border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
              Tabel Rekonsiliasi Pesanan Penjualan ({filteredSoList.length})
            </span>
            <span className="text-xs text-zinc-500">Mendeteksi anomali kuantitas antara SO dan SJ</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-100 text-zinc-700 font-semibold border-b border-zinc-200">
                <tr>
                  <th className="py-2.5 px-3">No. SO & Pelanggan</th>
                  <th className="py-2.5 px-3">PO Pelanggan</th>
                  <th className="py-2.5 px-3 text-right">Qty Pesanan (SO)</th>
                  <th className="py-2.5 px-3 text-right">Internal Delivered</th>
                  <th className="py-2.5 px-3 text-right">Delivered (SJ Fisik)</th>
                  <th className="py-2.5 px-3 text-center">Dokumen SJ Tertaut</th>
                  <th className="py-2.5 px-3 text-center">Status Rekonsiliasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredSoList.map(({ so, orderQty, internalDelivered, verifiedDelivered, linkedSjs, isMatched, hasAnomaly, anomalyReason }) => (
                  <tr
                    key={so.id}
                    className={`transition-colors ${
                      hasAnomaly ? 'bg-rose-50/40 hover:bg-rose-50/70' : 'hover:bg-zinc-50'
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-zinc-900">{so.soNumber}</div>
                      <div className="text-[11px] text-zinc-600 font-medium">{so.customerName}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-zinc-700">
                      {so.customerPoNumber}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-900">
                      {orderQty.toLocaleString('id-ID')} PCS
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-zinc-700">
                      {internalDelivered.toLocaleString('id-ID')} PCS
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                      {verifiedDelivered.toLocaleString('id-ID')} PCS
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {linkedSjs.length > 0 ? (
                        <div className="flex flex-wrap items-center justify-center gap-1">
                          {linkedSjs.map((sj) => (
                            <span
                              key={sj.id}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200"
                            >
                              {sj.sjNumber}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-rose-600 font-semibold italic">
                          Belum ada SJ
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {hasAnomaly ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Exception
                          </span>
                          {anomalyReason && (
                            <span className="text-[10px] text-rose-700 mt-0.5 max-w-[200px] truncate" title={anomalyReason}>
                              {anomalyReason}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Matched
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Billing Gate Verification Table */}
      {activeTab === 'SJ_CONTROL' && (
        <div className="bg-white rounded border border-zinc-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-3 bg-zinc-50 border-b border-zinc-200">
            <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider block">
              Aturan Gerbang Penagihan (Billing Gate Control — BR-BIL-01)
            </span>
            <p className="text-xs text-zinc-600 mt-0.5">
              Surat Jalan berstatus <strong>Exception</strong> atau belum <strong>Delivered</strong> dilarang keras diproses ke penerbitan faktur tagihan (Invoice).
            </p>
          </div>

          <div className="overflow-x-auto p-3">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-100 text-zinc-700 font-semibold border-b border-zinc-200">
                <tr>
                  <th className="py-2.5 px-3">No. Surat Jalan</th>
                  <th className="py-2.5 px-3">Pelanggan & SO</th>
                  <th className="py-2.5 px-3 text-right">Kuantitas</th>
                  <th className="py-2.5 px-3 text-center">Status Dokumen</th>
                  <th className="py-2.5 px-3 text-center">Kontrol Rekonsiliasi</th>
                  <th className="py-2.5 px-3 text-center">Kelayakan Tagihan</th>
                  <th className="py-2.5 px-3">Keterangan / Alasan Sistem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {deliveryOrders.map((sj) => {
                  const totalQty = sj.items.reduce((s, it) => s + it.qtyShipped, 0);
                  const billing = evaluateBillingEligibility(sj.status, sj.controlStatus);

                  return (
                    <tr key={sj.id} className={billing.isEligible ? 'bg-emerald-50/20' : 'bg-white'}>
                      <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">
                        {sj.sjNumber}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-zinc-900">{sj.customerName}</div>
                        <div className="text-[11px] text-zinc-500 font-mono">SO: {sj.soNumber}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-900">
                        {totalQty.toLocaleString('id-ID')} PCS
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          sj.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : sj.status === 'Printed'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {sj.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          sj.controlStatus === 'Matched'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          {sj.controlStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {billing.isEligible ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-600 text-white shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Siap Tagih
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-zinc-200 text-zinc-700 border border-zinc-300">
                            <Lock className="w-3 h-3 text-zinc-500" />
                            Terkunci
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-600 text-[11px]">
                        {billing.reason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
