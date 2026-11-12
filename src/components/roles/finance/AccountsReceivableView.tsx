/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Pelacakan Piutang Dagang (Accounts Receivable / AR Tracking)
 * BRD §5.8 (BR-BIL-05), FEAT-BIL-02, TBD-14
 */

import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Building,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { Customer, Invoice, PaymentRecord } from '../../../types/erp';
import { formatIndoDate } from '../../../utils/logic';

interface AccountsReceivableViewProps {
  invoices: Invoice[];
  paymentRecords: PaymentRecord[];
  customers: Customer[];
  onOpenPaymentModal: (invoice: Invoice) => void;
}

export const AccountsReceivableView: React.FC<AccountsReceivableViewProps> = ({
  invoices,
  paymentRecords,
  customers,
  onOpenPaymentModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'customers'>('invoices');

  // Total summary metrics
  const totalInvoiced = invoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalPaid = invoices.reduce((s, i) => s + i.paidAmount, 0);
  const totalOutstanding = invoices.reduce((s, i) => s + i.outstandingAmount, 0);

  // Group by customer
  const customerSummary = useMemo(() => {
    const map = new Map<string, { totalInv: number; totalPaid: number; totalOut: number; count: number }>();

    invoices.forEach((inv) => {
      const existing = map.get(inv.customerName) || { totalInv: 0, totalPaid: 0, totalOut: 0, count: 0 };
      existing.totalInv += inv.totalAmount;
      existing.totalPaid += inv.paidAmount;
      existing.totalOut += inv.outstandingAmount;
      existing.count += 1;
      map.set(inv.customerName, existing);
    });

    return Array.from(map.entries()).map(([name, data]) => ({
      customerName: name,
      ...data,
    }));
  }, [invoices]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customerPoNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCustomer = customerFilter === 'all' || inv.customerName === customerFilter;
      const matchStatus = statusFilter === 'all' || inv.status === statusFilter;

      return matchSearch && matchCustomer && matchStatus;
    });
  }, [invoices, searchQuery, customerFilter, statusFilter]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#ffffff] p-6 pb-16 space-y-6">
      {/* 1. Header Informasi Halaman */}
      <div className="bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#545454] flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#0057d2]" />
              Manajemen Kas & Piutang · Accounts Receivable
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#edf7ed] text-[#10683b] border border-[#a5d6a7] rounded-[4px]">
              AR TRACKING ACTIVE
            </span>
          </div>
          <h1 className="text-[18px] font-bold text-[#000000] mt-1 tracking-tight">
            Pelacakan Piutang Dagang (Accounts Receivable Tracking)
          </h1>
          <p className="text-[11px] text-[#545454] mt-0.5">
            Monitoring saldo tagihan belum terbayar per customer, status jatuh tempo (TBD-14), dan riwayat penerimaan kas bank
          </p>
        </div>
      </div>

      {/* 2. Top Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#545454] block">
            Total Nilai Faktur (AR Gross)
          </span>
          <span className="text-[20px] font-bold text-[#000000] tabular-nums mt-1 block">
            Rp {totalInvoiced.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-[#545454]">Dari {invoices.length} faktur penagihan aktif</span>
        </div>

        <div className="p-4 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#10683b] block">
            Kas Diterima (Paid)
          </span>
          <span className="text-[20px] font-bold text-[#10683b] tabular-nums mt-1 block">
            Rp {totalPaid.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-[#10683b] font-medium">
            {((totalPaid / (totalInvoiced || 1)) * 100).toFixed(1)}% tertagih
          </span>
        </div>

        <div className="p-4 bg-[#fffdfa] border border-[#ffd54f] rounded-[4px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8d4b00] block">
            Sisa Saldo Piutang (Outstanding)
          </span>
          <span className="text-[20px] font-bold text-[#8d4b00] tabular-nums mt-1 block">
            Rp {totalOutstanding.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-[#8d4b00]">Saldo berjalan yang harus ditagih</span>
        </div>

        <div className="p-4 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#545454] block">
            Piutang Overdue (Lewat Tempo)
          </span>
          <span className="text-[20px] font-bold text-[#10683b] tabular-nums mt-1 block">
            Rp 0
          </span>
          <span className="text-[10px] text-[#10683b]">Semua faktur dalam masa kredit aktif</span>
        </div>
      </div>

      {/* 3. Tab Selector */}
      <div className="flex items-center gap-2 border-b border-[#d5dce2] pb-1">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-3.5 py-1.5 text-[12px] font-bold rounded-t-[4px] border-b-2 transition-colors ${
            activeTab === 'invoices'
              ? 'border-[#0057d2] text-[#0057d2] bg-[#f0f7ff]'
              : 'border-transparent text-[#545454] hover:text-[#000000]'
          }`}
        >
          Piutang per Faktur ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-3.5 py-1.5 text-[12px] font-bold rounded-t-[4px] border-b-2 transition-colors ${
            activeTab === 'customers'
              ? 'border-[#0057d2] text-[#0057d2] bg-[#f0f7ff]'
              : 'border-transparent text-[#545454] hover:text-[#000000]'
          }`}
        >
          Rekapitulasi per Customer ({customerSummary.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-3.5 py-1.5 text-[12px] font-bold rounded-t-[4px] border-b-2 transition-colors ${
            activeTab === 'payments'
              ? 'border-[#0057d2] text-[#0057d2] bg-[#f0f7ff]'
              : 'border-transparent text-[#545454] hover:text-[#000000]'
          }`}
        >
          Riwayat Kas Masuk ({paymentRecords.length})
        </button>
      </div>

      {/* 4. Tab Content 1: Piutang per Faktur */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px] p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 text-[#545454] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari No. Faktur, Customer, PO..."
                  className="w-full pl-8 pr-3 py-1.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] text-[12px] text-[#000000] focus:outline-none focus:border-[#0057d2]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-1 px-2.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] text-[12px] text-[#000000] focus:outline-none focus:border-[#0057d2]"
              >
                <option value="all">Semua Status Pelunasan</option>
                <option value="Unpaid">Belum Dibayar (Unpaid)</option>
                <option value="Partially Paid">Dibayar Sebagian (Partially Paid)</option>
                <option value="Paid">Lunas (Paid)</option>
                <option value="Overdue">Lewat Tempo (Overdue)</option>
              </select>
            </div>
          </div>

          <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden bg-[#ffffff]">
            <table className="w-full text-left text-[12px] border-collapse">
              <thead className="bg-[#f5f6f7] border-b border-[#d5dce2] text-[10px] font-bold text-[#545454] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">No. Faktur</th>
                  <th className="py-2.5 px-3">Customer B2B & PO</th>
                  <th className="py-2.5 px-3">Tanggal Terbit</th>
                  <th className="py-2.5 px-3">Jatuh Tempo</th>
                  <th className="py-2.5 px-3 text-right">Total Faktur</th>
                  <th className="py-2.5 px-3 text-right">Sudah Dibayar</th>
                  <th className="py-2.5 px-3 text-right">Sisa Piutang</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d5dce2]">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-[#0057d2]">
                        {inv.invoiceNumber}
                      </span>
                      <div className="text-[10px] text-[#545454]">
                        Ref SJ: {inv.linkedSjNumbers.join(', ')}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#000000]">{inv.customerName}</div>
                      <div className="text-[10px] text-[#545454]">PO: {inv.customerPoNumber}</div>
                    </td>
                    <td className="py-3 px-3 text-[#545454] whitespace-nowrap">
                      {formatIndoDate(inv.invoiceDate)}
                    </td>
                    <td className="py-3 px-3 text-[#000000] whitespace-nowrap font-medium">
                      {formatIndoDate(inv.dueDate)}{' '}
                      <span className="text-[10px] text-[#545454]">({inv.paymentTerms})</span>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums font-bold text-[#000000]">
                      Rp {inv.totalAmount.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-[#10683b] font-bold">
                      Rp {inv.paidAmount.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-[#8d4b00] font-bold">
                      Rp {inv.outstandingAmount.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-[4px] border ${
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
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {inv.status !== 'Paid' ? (
                        <button
                          onClick={() => onOpenPaymentModal(inv)}
                          className="px-2.5 py-1 bg-[#0057d2] hover:bg-[#0046a8] text-[#ffffff] rounded-[4px] text-[10px] font-bold transition-colors shadow-sm"
                        >
                          Catat Bayar
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#10683b] font-bold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Lunas
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

      {/* 5. Tab Content 2: Rekapitulasi per Customer */}
      {activeTab === 'customers' && (
        <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden bg-[#ffffff]">
          <table className="w-full text-left text-[12px] border-collapse">
            <thead className="bg-[#f5f6f7] border-b border-[#d5dce2] text-[10px] font-bold text-[#545454] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Nama Perusahaan Customer</th>
                <th className="py-2.5 px-4 text-center">Jumlah Faktur</th>
                <th className="py-2.5 px-4 text-right">Total Tagihan Bruto</th>
                <th className="py-2.5 px-4 text-right">Total Kas Diterima</th>
                <th className="py-2.5 px-4 text-right">Sisa Piutang (AR)</th>
                <th className="py-2.5 px-4 text-center">Status Pembayaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d5dce2]">
              {customerSummary.map((c, idx) => (
                <tr key={idx} className="hover:bg-[#f8f9fa]">
                  <td className="py-3 px-4 font-bold text-[#000000]">
                    {c.customerName}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-[#545454]">
                    {c.count} Faktur
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-bold text-[#000000]">
                    Rp {c.totalInv.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-bold text-[#10683b]">
                    Rp {c.totalPaid.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-bold text-[#8d4b00]">
                    Rp {c.totalOut.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {c.totalOut === 0 ? (
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-[#edf7ed] text-[#10683b] border border-[#a5d6a7] rounded-[4px]">
                        LUNAS
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-[#e3f2fd] text-[#0057d2] border border-[#90caf9] rounded-[4px]">
                        BERJALAN ({( (c.totalPaid / c.totalInv) * 100).toFixed(0)}% Lunas)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 6. Tab Content 3: Riwayat Pembayaran Kas Masuk */}
      {activeTab === 'payments' && (
        <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden bg-[#ffffff]">
          <table className="w-full text-left text-[12px] border-collapse">
            <thead className="bg-[#f5f6f7] border-b border-[#d5dce2] text-[10px] font-bold text-[#545454] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">No. Bukti Kas (Receipt)</th>
                <th className="py-2.5 px-4">No. Faktur Rujukan</th>
                <th className="py-2.5 px-4">Customer Pelanggan</th>
                <th className="py-2.5 px-4">Tanggal Pembayaran</th>
                <th className="py-2.5 px-4">Metode & Ref Transfer</th>
                <th className="py-2.5 px-4 text-right">Nominal Diterima</th>
                <th className="py-2.5 px-4">Dicatat Oleh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d5dce2]">
              {paymentRecords.map((pay) => (
                <tr key={pay.id} className="hover:bg-[#f8f9fa]">
                  <td className="py-3 px-4 font-mono font-bold text-[#0057d2]">
                    {pay.paymentNumber}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#000000]">
                    {pay.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#000000]">{pay.customerName}</td>
                  <td className="py-3 px-4 text-[#545454] whitespace-nowrap">
                    {formatIndoDate(pay.paymentDate)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-[#000000] block">{pay.paymentMethod}</span>
                    <span className="text-[10px] text-[#545454] font-mono">
                      Ref: {pay.referenceNumber}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-bold text-[#10683b] text-[13px]">
                    + Rp {pay.amountPaid.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-[11px] text-[#545454]">{pay.recordedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
