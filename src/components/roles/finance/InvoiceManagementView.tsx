/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Manajemen Faktur Tagihan Bulanan / Invoice Management
 * BRD §5.8 (BR-BIL-01, BR-BIL-02, BR-BIL-03), FEAT-BIL-01, TBD-09
 */

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Receipt,
  CreditCard,
  Printer,
  FileCheck2,
  Calendar,
  AlertCircle,
  Building,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Invoice, PaymentRecord } from '../../../types/erp';
import { formatIndoDate } from '../../../utils/logic';

interface InvoiceManagementViewProps {
  invoices: Invoice[];
  paymentRecords: PaymentRecord[];
  onOpenCreateInvoice: () => void;
  onOpenPaymentModal: (invoice: Invoice) => void;
}

export const InvoiceManagementView: React.FC<InvoiceManagementViewProps> = ({
  invoices,
  paymentRecords,
  onOpenCreateInvoice,
  onOpenPaymentModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(
    invoices.length > 0 ? invoices[0].id : ''
  );

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customerPoNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.linkedSjNumbers.some((sj) => sj.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === 'all' || inv.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  // Selected invoice object
  const selectedInvoice = useMemo(() => {
    return invoices.find((inv) => inv.id === selectedInvoiceId) || (invoices.length > 0 ? invoices[0] : null);
  }, [invoices, selectedInvoiceId]);

  // Payments for selected invoice
  const selectedInvoicePayments = useMemo(() => {
    if (!selectedInvoice) return [];
    return paymentRecords.filter((p) => p.invoiceId === selectedInvoice.id || p.invoiceNumber === selectedInvoice.invoiceNumber);
  }, [selectedInvoice, paymentRecords]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#ffffff] p-6 pb-16 space-y-6">
      {/* 1. Header Informasi Halaman */}
      <div className="bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#545454] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#0057d2]" />
              Modul Penagihan · Manajemen Faktur B2B Bulanan
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#edf7ed] text-[#10683b] border border-[#a5d6a7] rounded-[4px]">
              MULTI-SJ INVOICING ACTIVE
            </span>
          </div>
          <h1 className="text-[18px] font-bold text-[#000000] mt-1 tracking-tight">
            Daftar Faktur Penagihan (Invoice Management)
          </h1>
          <p className="text-[11px] text-[#545454] mt-0.5">
            Pengelolaan faktur komersial bulanan berbasis gabungan Surat Jalan terverifikasi, perhitungan PPN 11%, dan monitoring status pelunasan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateInvoice}
            className="px-3.5 py-2 bg-[#0057d2] hover:bg-[#0046a8] text-[#ffffff] rounded-[4px] text-[12px] font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            + Terbitkan Invoice Baru
          </button>
        </div>
      </div>

      {/* 2. Top Summary Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#545454] block">
            Total Faktur Terbit
          </span>
          <span className="text-[18px] font-bold text-[#000000] tabular-nums mt-0.5 block">
            {invoices.length} <span className="text-[11px] font-normal text-[#545454]">Dokumen</span>
          </span>
        </div>
        <div className="p-3 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0057d2] block">
            Total Nilai Faktur
          </span>
          <span className="text-[18px] font-bold text-[#0057d2] tabular-nums mt-0.5 block">
            Rp {invoices.reduce((s, i) => s + i.totalAmount, 0).toLocaleString('id-ID')}
          </span>
        </div>
        <div className="p-3 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#10683b] block">
            Pembayaran Diterima
          </span>
          <span className="text-[18px] font-bold text-[#10683b] tabular-nums mt-0.5 block">
            Rp {invoices.reduce((s, i) => s + i.paidAmount, 0).toLocaleString('id-ID')}
          </span>
        </div>
        <div className="p-3 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8d4b00] block">
            Sisa Piutang (AR)
          </span>
          <span className="text-[18px] font-bold text-[#8d4b00] tabular-nums mt-0.5 block">
            Rp {invoices.reduce((s, i) => s + i.outstandingAmount, 0).toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* 3. Controls & Filter Bar */}
      <div className="bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px] p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[260px]">
            <Search className="w-3.5 h-3.5 text-[#545454] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari No. Faktur, Customer, PO, SJ..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] text-[12px] text-[#000000] focus:outline-none focus:border-[#0057d2]"
            />
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            {['all', 'Unpaid', 'Partially Paid', 'Paid', 'Overdue'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-[4px] font-bold border transition-colors ${
                  statusFilter === st
                    ? 'bg-[#0057d2] text-[#ffffff] border-[#0057d2]'
                    : 'bg-[#ffffff] text-[#545454] border-[#d5dce2] hover:bg-[#f5f6f7]'
                }`}
              >
                {st === 'all' ? 'Semua Status' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Split-Pane Layout: Daftar Faktur & Rincian Faktur Terpilih */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Tabel Ringkas Invoice (5 cols) */}
        <div className="lg:col-span-5 border border-[#d5dce2] rounded-[4px] overflow-hidden bg-[#ffffff] flex flex-col">
          <div className="px-3.5 py-2.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#000000] uppercase tracking-wide">
              Daftar Faktur ({filteredInvoices.length})
            </span>
            <span className="text-[10px] text-[#545454]">Pilih untuk melihat detail</span>
          </div>

          <div className="divide-y divide-[#d5dce2] overflow-y-auto max-h-[620px]">
            {filteredInvoices.length === 0 ? (
              <div className="p-8 text-center text-[#545454] text-[12px]">
                Tidak ada faktur yang sesuai filter.
              </div>
            ) : (
              filteredInvoices.map((inv) => {
                const isSelected = selectedInvoice?.id === inv.id;
                return (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedInvoiceId(inv.id)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#f0f7ff] border-l-4 border-l-[#0057d2]'
                        : 'hover:bg-[#f8f9fa]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#0057d2] text-[12px]">
                            {inv.invoiceNumber}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-[2px] border ${
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
                        <div className="text-[12px] font-bold text-[#000000] mt-0.5 truncate max-w-[240px]">
                          {inv.customerName}
                        </div>
                        <div className="text-[10px] text-[#545454] mt-0.5">
                          Ref PO: {inv.customerPoNumber} · {inv.totalQtyPcs.toLocaleString('id-ID')} PCS
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[12px] font-bold text-[#000000] tabular-nums">
                          Rp {inv.totalAmount.toLocaleString('id-ID')}
                        </div>
                        <div className="text-[10px] text-[#545454] mt-0.5">
                          Sisa: Rp {inv.outstandingAmount.toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#545454] mt-2 pt-1 border-t border-[#e5e9ec]">
                      <span>Terbit: {formatIndoDate(inv.invoiceDate)}</span>
                      <span>Tempo: {formatIndoDate(inv.dueDate)} ({inv.paymentTerms})</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Kolom Kanan: Rincian Lengkap Faktur Terpilih (7 cols) */}
        <div className="lg:col-span-7 border border-[#d5dce2] rounded-[4px] overflow-hidden bg-[#ffffff] flex flex-col">
          {selectedInvoice ? (
            <div className="p-5 space-y-5">
              {/* Header Rincian Faktur */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b border-[#d5dce2] gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[16px] font-bold text-[#0057d2]">
                      {selectedInvoice.invoiceNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] border ${
                        selectedInvoice.status === 'Paid'
                          ? 'bg-[#edf7ed] text-[#10683b] border-[#a5d6a7]'
                          : selectedInvoice.status === 'Partially Paid'
                          ? 'bg-[#e3f2fd] text-[#0057d2] border-[#90caf9]'
                          : selectedInvoice.status === 'Overdue'
                          ? 'bg-[#fdeded] text-[#c5221f] border-[#ef9a9a]'
                          : 'bg-[#fff8e1] text-[#8d4b00] border-[#ffe082]'
                      }`}
                    >
                      {selectedInvoice.status.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-[15px] font-bold text-[#000000] mt-1">
                    {selectedInvoice.customerName}
                  </h2>
                  <p className="text-[11px] text-[#545454]">
                    No. PO Pelanggan: <strong>{selectedInvoice.customerPoNumber}</strong> · Periode: {selectedInvoice.periodMonth} {selectedInvoice.periodYear}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenPaymentModal(selectedInvoice)}
                    disabled={selectedInvoice.status === 'Paid'}
                    className={`px-3 py-1.5 rounded-[4px] text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
                      selectedInvoice.status === 'Paid'
                        ? 'bg-[#e0e0e0] text-[#888888] cursor-not-allowed'
                        : 'bg-[#0057d2] hover:bg-[#0046a8] text-[#ffffff] shadow-sm'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Catat Pembayaran
                  </button>

                  <button
                    disabled
                    title="Fitur Cetak Faktur PDF & Pajak e-Faktur terikat TBD-09 (Simulasi Harga)"
                    className="px-3 py-1.5 bg-[#f5f6f7] text-[#888888] border border-[#d5dce2] rounded-[4px] text-[11px] font-bold flex items-center gap-1.5 cursor-not-allowed"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Cetak PDF (TBD)
                  </button>
                </div>
              </div>

              {/* Info Dokumen & Tanggal */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f8f9fa] p-3 rounded-[4px] border border-[#d5dce2] text-[11px]">
                <div>
                  <span className="text-[#545454] block text-[10px] uppercase font-bold">
                    Tanggal Faktur
                  </span>
                  <span className="font-bold text-[#000000]">
                    {formatIndoDate(selectedInvoice.invoiceDate)}
                  </span>
                </div>
                <div>
                  <span className="text-[#545454] block text-[10px] uppercase font-bold">
                    Jatuh Tempo (Due Date)
                  </span>
                  <span className="font-bold text-[#000000]">
                    {formatIndoDate(selectedInvoice.dueDate)}
                  </span>
                </div>
                <div>
                  <span className="text-[#545454] block text-[10px] uppercase font-bold">
                    Termin Pembayaran
                  </span>
                  <span className="font-bold text-[#0057d2]">
                    {selectedInvoice.paymentTerms} (TBD-14)
                  </span>
                </div>
                <div>
                  <span className="text-[#545454] block text-[10px] uppercase font-bold">
                    Diterbitkan Oleh
                  </span>
                  <span className="font-bold text-[#000000] truncate block">
                    {selectedInvoice.createdBy || 'Staff Finance'}
                  </span>
                </div>
              </div>

              {/* Surat Jalan yang Dihubungkan (Multi-SJ) */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#545454] block mb-1.5">
                  Surat Jalan Fisik Terverifikasi yang Digabungkan:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedInvoice.linkedSjNumbers.map((sjNum) => (
                    <span
                      key={sjNum}
                      className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-1 bg-[#f0f7ff] text-[#0057d2] border border-[#90caf9] rounded-[4px]"
                    >
                      <FileCheck2 className="w-3 h-3 text-[#10683b]" />
                      {sjNum}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rincian Item Tagihan */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#545454]">
                    Rincian Komponen / Barang yang Ditagihkan
                  </span>
                  <span className="text-[10px] text-[#8d4b00] bg-[#fff8e1] px-2 py-0.5 rounded-[2px] border border-[#ffe082]">
                    * Harga adalah Estimasi Simulasi (TBD-09)
                  </span>
                </div>

                <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#f5f6f7] border-b border-[#d5dce2] text-[10px] font-bold text-[#545454]">
                      <tr>
                        <th className="py-2 px-3">Part Number & Deskripsi</th>
                        <th className="py-2 px-3">Ref. SJ / SO</th>
                        <th className="py-2 px-3 text-right">Kuantitas</th>
                        <th className="py-2 px-3 text-right">Harga Satuan</th>
                        <th className="py-2 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e9ec]">
                      {selectedInvoice.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-[#f8f9fa]">
                          <td className="py-2.5 px-3">
                            <div className="font-mono font-bold text-[#0057d2]">
                              {it.partNumber}
                            </div>
                            <div className="text-[10px] text-[#545454]">{it.partDescription}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-mono text-[#000000]">{it.sjNumber}</div>
                            <div className="text-[10px] text-[#545454]">{it.soNumber}</div>
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums font-bold">
                            {it.qtyBilled.toLocaleString('id-ID')} PCS
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-[#545454]">
                            Rp {it.unitPrice.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums font-bold text-[#000000]">
                            Rp {it.subtotal.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-[#f9fafb] border-t border-[#d5dce2] text-[11px]">
                      <tr>
                        <td colSpan={2} className="py-2 px-3 font-bold text-[#545454]">
                          Total Volume
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-[#0057d2]">
                          {selectedInvoice.totalQtyPcs.toLocaleString('id-ID')} PCS
                        </td>
                        <td className="py-2 px-3 text-right text-[#545454]">Subtotal DPP:</td>
                        <td className="py-2 px-3 text-right font-bold text-[#000000]">
                          Rp {selectedInvoice.subtotalAmount.toLocaleString('id-ID')}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="py-1 px-3"></td>
                        <td className="py-1 px-3 text-right text-[#545454]">PPN 11%:</td>
                        <td className="py-1 px-3 text-right font-bold text-[#000000]">
                          Rp {selectedInvoice.taxAmount.toLocaleString('id-ID')}
                        </td>
                      </tr>
                      <tr className="bg-[#f0f7ff] border-t border-[#d5dce2] text-[12px]">
                        <td colSpan={3} className="py-2.5 px-3 font-bold text-[#0057d2]">
                          TOTAL TAGIHAN FAKTUR
                        </td>
                        <td colSpan={2} className="py-2.5 px-3 text-right font-bold text-[#0057d2] text-[14px]">
                          Rp {selectedInvoice.totalAmount.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Status Pelunasan & Riwayat Pembayaran */}
              <div className="bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#000000] uppercase tracking-wide flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#0057d2]" />
                    Status Pelunasan Kas & Riwayat Pembayaran
                  </span>
                  <span className="text-[11px] font-bold text-[#0057d2]">
                    {((selectedInvoice.paidAmount / selectedInvoice.totalAmount) * 100).toFixed(1)}% Terbayar
                  </span>
                </div>

                <div className="w-full bg-[#e0e0e0] h-2 rounded-[2px] overflow-hidden">
                  <div
                    className="bg-[#10683b] h-full rounded-[2px]"
                    style={{
                      width: `${Math.min(100, Math.round((selectedInvoice.paidAmount / selectedInvoice.totalAmount) * 100))}%`,
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px] pt-1">
                  <div>
                    <span className="text-[#545454]">Total Pembayaran Diterima:</span>
                    <span className="font-bold text-[#10683b] block text-[13px]">
                      Rp {selectedInvoice.paidAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#545454]">Sisa Piutang Tertagih (AR):</span>
                    <span className="font-bold text-[#8d4b00] block text-[13px]">
                      Rp {selectedInvoice.outstandingAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Riwayat Pembayaran */}
                <div className="border-t border-[#e5e9ec] pt-2">
                  <span className="text-[10px] font-bold uppercase text-[#545454] block mb-1">
                    Log Mutasi Pembayaran Masuk ({selectedInvoicePayments.length}):
                  </span>
                  {selectedInvoicePayments.length === 0 ? (
                    <div className="text-[11px] text-[#545454] italic">
                      Belum ada pembayaran yang dicatat untuk faktur ini.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedInvoicePayments.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between bg-[#ffffff] p-2 rounded-[2px] border border-[#d5dce2] text-[11px]"
                        >
                          <div>
                            <span className="font-mono font-bold text-[#0057d2]">
                              {p.paymentNumber}
                            </span>{' '}
                            · <span className="text-[#545454]">{formatIndoDate(p.paymentDate)}</span>{' '}
                            · <span className="text-[#000000]">{p.paymentMethod}</span>{' '}
                            <span className="text-[10px] text-[#545454]">(Ref: {p.referenceNumber})</span>
                          </div>
                          <div className="font-bold text-[#10683b] tabular-nums">
                            + Rp {p.amountPaid.toLocaleString('id-ID')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="text-[11px] text-[#545454] bg-[#f9fcff] p-3 rounded-[4px] border border-[#90caf9]">
                  <strong className="text-[#0057d2]">Catatan Internal:</strong> {selectedInvoice.notes}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-[#545454] text-[13px]">
              Pilih salah satu faktur di sebelah kiri untuk melihat rincian lengkap.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
