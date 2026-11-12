/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Finance Dashboard & Executive AR Overview
 * BRD §5.7, §5.8 (BR-BIL-01, BR-BIL-02, BR-BIL-05), FEAT-BIL-01, FEAT-BIL-02
 */

import React from 'react';
import {
  CreditCard,
  FileCheck2,
  Receipt,
  FileText,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { DeliveryOrder, Invoice, SalesOrder } from '../../../types/erp';
import { calculateFinanceSummary, formatIndoDate } from '../../../utils/logic';

interface FinanceDashboardViewProps {
  orders: SalesOrder[];
  deliveryOrders: DeliveryOrder[];
  invoices: Invoice[];
  onNavigate: (navId: string) => void;
  onOpenCreateInvoice: () => void;
  onOpenPaymentModal: (invoice: Invoice) => void;
}

export const FinanceDashboardView: React.FC<FinanceDashboardViewProps> = ({
  orders,
  deliveryOrders,
  invoices,
  onNavigate,
  onOpenCreateInvoice,
  onOpenPaymentModal,
}) => {
  const summary = calculateFinanceSummary(deliveryOrders, invoices);

  // Kuantitas internal SO (Belum Rekonsiliasi)
  const internalSoOrderedPcs = orders.reduce(
    (acc, o) => acc + o.items.reduce((s, i) => s + i.qtyOrdered, 0),
    0
  );
  const internalSoDeliveredPcs = orders.reduce(
    (acc, o) => acc + o.items.reduce((s, i) => s + i.qtyDelivered, 0),
    0
  );
  const internalSoBilledPcs = orders.reduce(
    (acc, o) => acc + o.items.reduce((s, i) => s + i.qtyBilled, 0),
    0
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#ffffff] p-6 pb-16 space-y-6">
      {/* 1. Header Informasi Modul Finance */}
      <div className="bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#545454] flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-[#0057d2]" />
              Divisi Keuangan & Akuntansi · Modul Penagihan & AR
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#edf7ed] text-[#10683b] border border-[#a5d6a7] rounded-[4px]">
              BILLING PROTECTION ACTIVE
            </span>
          </div>
          <h1 className="text-[18px] font-bold text-[#000000] mt-1 tracking-tight">
            Dashboard Penagihan (Billing) & Piutang Dagang (Accounts Receivable)
          </h1>
          <p className="text-[11px] text-[#545454] mt-0.5">
            Penerbitan faktur tagihan berbasis Surat Jalan resmi (Delivered & Matched), monitoring piutang pelanggan, dan pencatatan kas masuk
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('fin-ready-to-bill')}
            className="px-3 py-1.5 bg-[#ffffff] text-[#0057d2] border border-[#0057d2] hover:bg-[#0057d2]/5 rounded-[4px] text-[12px] font-bold transition-colors flex items-center gap-1.5"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            SJ Siap Tagih
          </button>
          <button
            onClick={onOpenCreateInvoice}
            className="px-3 py-1.5 bg-[#0057d2] hover:bg-[#0046a8] text-[#ffffff] rounded-[4px] text-[12px] font-bold transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Receipt className="w-3.5 h-3.5" />
            + Buat Invoice Baru
          </button>
        </div>
      </div>

      {/* 2. Audit Integritas & Semantic Consistency Banner */}
      <div className="bg-[#fffdfa] border-l-4 border-l-[#8d4b00] border border-[#ffd54f] rounded-[4px] p-4 space-y-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#8d4b00] shrink-0" />
          <h3 className="text-[12px] font-bold text-[#8d4b00] uppercase tracking-wide">
            Audit Integritas Data Penagihan: Rekonsiliasi Kuantitas Fisik vs Dokumen Resmi (Sprint 02 & 07)
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-[#545454]">
          <div className="bg-[#ffffff] p-2.5 rounded-[4px] border border-[#e0e0e0]">
            <span className="font-bold text-[#10683b] block mb-1">
              ✓ Kuantitas Resmi Terverifikasi Dokumen (SJ Delivered & Matched):
            </span>
            <ul className="list-disc list-inside space-y-0.5">
              <li>
                <strong>Delivered Terverifikasi:</strong> {summary.verifiedDeliveredPcs.toLocaleString('id-ID')} PCS (SJ-0089: 6.500 PCS + SJ-0090: 1.200 PCS).
              </li>
              <li>
                <strong>Billed Terverifikasi:</strong> {summary.verifiedBilledPcs.toLocaleString('id-ID')} PCS (INV-2026-11-001 atas item Gasket Seal).
              </li>
              <li>
                <strong>Unbilled Delivered:</strong> {summary.unbilledDeliveredPcs.toLocaleString('id-ID')} PCS (7.700 - 2.500 PCS siap diterbitkan faktur).
              </li>
            </ul>
          </div>
          <div className="bg-[#ffffff] p-2.5 rounded-[4px] border border-[#e0e0e0]">
            <span className="font-bold text-[#c5221f] block mb-1">
              ⚠ Kuantitas Internal SO (Belum Direkonsiliasi / Exception):
            </span>
            <ul className="list-disc list-inside space-y-0.5">
              <li>
                <strong>Internal SO Delivered:</strong> {internalSoDeliveredPcs.toLocaleString('id-ID')} PCS (termasuk 6.000 PCS SO-0043 unverified).
              </li>
              <li>
                <strong>Internal SO Billed:</strong> {internalSoBilledPcs.toLocaleString('id-ID')} PCS (termasuk 6.000 PCS SO-0043 unverified).
              </li>
              <li>
                <strong>Isolasi SO-2026-0043:</strong> Terkunci sebagai Data Integrity Exception dan dilarang masuk ke faktur penagihan.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Kartu Metrik Kunci Penagihan & Keuangan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Billed Terverifikasi */}
        <div className="p-4 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#0057d2]">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Billed Terverifikasi
              </span>
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div className="text-[22px] font-bold text-[#0057d2] tabular-nums mt-1">
              {summary.verifiedBilledPcs.toLocaleString('id-ID')}{' '}
              <span className="text-[12px] font-normal text-[#545454]">PCS</span>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-[#545454] border-t border-[#e5e9ec] pt-2">
            Faktur resmi terbit: {invoices.length} Dokumen ({summary.totalInvoicedAmount.toLocaleString('id-ID')})
          </div>
        </div>

        {/* Metric 2: Unbilled Delivered */}
        <div className="p-4 bg-[#fffdfa] border border-[#ffd54f] rounded-[4px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#8d4b00]">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Unbilled (Siap Ditagih)
              </span>
              <Receipt className="w-4 h-4" />
            </div>
            <div className="text-[22px] font-bold text-[#8d4b00] tabular-nums mt-1">
              {summary.unbilledDeliveredPcs.toLocaleString('id-ID')}{' '}
              <span className="text-[12px] font-normal text-[#545454]">PCS</span>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-[#8d4b00] border-t border-[#ffe082] pt-2 flex items-center justify-between">
            <span>Dari 2 SJ Delivered Matched</span>
            <button
              onClick={() => onNavigate('fin-ready-to-bill')}
              className="text-[#0057d2] font-bold hover:underline flex items-center gap-0.5"
            >
              Proses <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 3: Total Piutang Tertagih (AR Outstanding) */}
        <div className="p-4 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#000000]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#545454]">
                Sisa Saldo Piutang (AR)
              </span>
              <CreditCard className="w-4 h-4 text-[#0057d2]" />
            </div>
            <div className="text-[20px] font-bold text-[#000000] tabular-nums mt-1">
              Rp {summary.totalOutstandingAr.toLocaleString('id-ID')}
            </div>
          </div>
          <div className="mt-2 text-[10px] text-[#545454] border-t border-[#e5e9ec] pt-2">
            Terbayar: Rp {summary.totalPaidAmount.toLocaleString('id-ID')} ({(
              (summary.totalPaidAmount / (summary.totalInvoicedAmount || 1)) *
              100
            ).toFixed(1)}%)
          </div>
        </div>

        {/* Metric 4: Status Jatuh Tempo / Overdue */}
        <div className="p-4 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#545454]">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Piutang Jatuh Tempo
              </span>
              <Clock className="w-4 h-4 text-[#10683b]" />
            </div>
            <div className="text-[20px] font-bold text-[#10683b] tabular-nums mt-1">
              Rp {summary.overdueArAmount.toLocaleString('id-ID')}
            </div>
          </div>
          <div className="mt-2 text-[10px] text-[#10683b] border-t border-[#e5e9ec] pt-2">
            0 Faktur Melewati Jatuh Tempo (Status Lancar)
          </div>
        </div>
      </div>

      {/* 4. Split Layout: Faktur Aktif & Antrean Siap Tagih */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom Kiri: Ringkasan Faktur Tagihan Aktif */}
        <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden bg-[#ffffff]">
          <div className="px-4 py-3 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0057d2]" />
              <h3 className="text-[12px] font-bold text-[#000000] uppercase tracking-wide">
                Daftar Faktur Tagihan Terbit
              </h3>
            </div>
            <button
              onClick={() => onNavigate('fin-invoice-list')}
              className="text-[11px] font-bold text-[#0057d2] hover:underline flex items-center gap-1"
            >
              Kelola Faktur <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-[#d5dce2]">
            {invoices.map((inv) => (
              <div key={inv.id} className="p-4 hover:bg-[#f8f9fa] transition-colors space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#0057d2] text-[13px]">
                        {inv.invoiceNumber}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] border ${
                          inv.status === 'Paid'
                            ? 'bg-[#edf7ed] text-[#10683b] border-[#a5d6a7]'
                            : inv.status === 'Partially Paid'
                            ? 'bg-[#e3f2fd] text-[#0057d2] border-[#90caf9]'
                            : inv.status === 'Overdue'
                            ? 'bg-[#fdeded] text-[#c5221f] border-[#ef9a9a]'
                            : 'bg-[#fff8e1] text-[#8d4b00] border-[#ffe082]'
                        }`}
                      >
                        {inv.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[12px] font-bold text-[#000000] mt-0.5">
                      {inv.customerName}
                    </p>
                    <p className="text-[11px] text-[#545454]">
                      Ref PO: {inv.customerPoNumber} · Ref SJ: {inv.linkedSjNumbers.join(', ')}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[13px] font-bold text-[#000000] tabular-nums block">
                      Rp {inv.totalAmount.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-[#545454]">
                      Sisa: Rp {inv.outstandingAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Progress Pembayaran */}
                <div>
                  <div className="flex justify-between text-[10px] text-[#545454] mb-1">
                    <span>
                      Terbayar: Rp {inv.paidAmount.toLocaleString('id-ID')} ({inv.totalQtyPcs.toLocaleString('id-ID')} PCS)
                    </span>
                    <span>Jatuh Tempo: {formatIndoDate(inv.dueDate)}</span>
                  </div>
                  <div className="w-full bg-[#e0e0e0] h-1.5 rounded-[2px] overflow-hidden">
                    <div
                      className="bg-[#0057d2] h-full rounded-[2px]"
                      style={{
                        width: `${Math.min(100, Math.round((inv.paidAmount / inv.totalAmount) * 100))}%`,
                      }}
                    />
                  </div>
                </div>

                {inv.status !== 'Paid' && (
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => onOpenPaymentModal(inv)}
                      className="px-2.5 py-1 bg-[#ffffff] hover:bg-[#0057d2]/5 border border-[#0057d2] text-[#0057d2] rounded-[4px] text-[11px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <CreditCard className="w-3 h-3" />
                      Catat Pembayaran Masuk
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Surat Jalan Siap Ditagihkan */}
        <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden bg-[#ffffff]">
          <div className="px-4 py-3 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#10683b]" />
              <h3 className="text-[12px] font-bold text-[#000000] uppercase tracking-wide">
                Surat Jalan Siap Ditagihkan (Ready to Bill)
              </h3>
            </div>
            <button
              onClick={() => onNavigate('fin-ready-to-bill')}
              className="text-[11px] font-bold text-[#0057d2] hover:underline flex items-center gap-1"
            >
              Semua SJ <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            <p className="text-[11px] text-[#545454]">
              Hanya dokumen Surat Jalan dengan status <strong>Delivered & Matched</strong> yang lolos audit gerbang penagihan (BR-BIL-01):
            </p>

            <div className="space-y-2.5">
              {/* Item 1: SJ-0089 sisa EVA Sponge */}
              <div className="p-3 bg-[#f9fcff] border border-[#0057d2]/20 rounded-[4px] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#0057d2] text-[12px]">
                      SJ-2026-0089
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#edf7ed] text-[#10683b] border border-[#a5d6a7] rounded-[4px]">
                      DELIVERED & MATCHED
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-[#000000] mt-0.5">
                    PT Auto Dinamika Manufaktur
                  </div>
                  <div className="text-[10px] text-[#545454]">
                    Item sisa belum ditagih: EVA Sponge Door Sash (4.000 PCS)
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[12px] font-bold text-[#0057d2] tabular-nums block">
                    4.000 PCS
                  </span>
                  <span className="text-[9px] text-[#545454]">Sisa Siap Tagih</span>
                </div>
              </div>

              {/* Item 2: SJ-0090 Bushing Engine Mount */}
              <div className="p-3 bg-[#f9fcff] border border-[#0057d2]/20 rounded-[4px] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#0057d2] text-[12px]">
                      SJ-2026-0090
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#edf7ed] text-[#10683b] border border-[#a5d6a7] rounded-[4px]">
                      DELIVERED & MATCHED
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-[#000000] mt-0.5">
                    PT Heavy Mobil Manufaktur Indonesia
                  </div>
                  <div className="text-[10px] text-[#545454]">
                    Item belum ditagih: Bushing Engine Mount (1.200 PCS)
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[12px] font-bold text-[#0057d2] tabular-nums block">
                    1.200 PCS
                  </span>
                  <span className="text-[9px] text-[#545454]">Total Siap Tagih</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('fin-ready-to-bill')}
                className="w-full py-2 bg-[#0057d2] hover:bg-[#0046a8] text-[#ffffff] rounded-[4px] text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Receipt className="w-3.5 h-3.5" />
                Buka Konsolidasi Multi-SJ & Buat Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
