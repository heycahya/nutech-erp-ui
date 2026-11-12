/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Surat Jalan Siap Ditagihkan (Ready to Bill & Billing Eligibility Gate)
 * BRD §5.7 (BR-CTL-01..06), §5.8 (BR-BIL-01, BR-BIL-02), FEAT-BIL-01
 */

import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  Lock,
  Search,
  Filter,
  CheckSquare,
  Square,
  AlertCircle,
  Receipt,
  Truck,
  FileWarning,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { DeliveryOrder, Invoice, SalesOrder } from '../../../types/erp';
import { formatIndoDate, evaluateBillingEligibility } from '../../../utils/logic';

interface ReadyToBillViewProps {
  orders: SalesOrder[];
  deliveryOrders: DeliveryOrder[];
  invoices: Invoice[];
  onOpenCreateInvoiceWithSjs: (selectedSjNumbers: string[], customerId?: string) => void;
}

export const ReadyToBillView: React.FC<ReadyToBillViewProps> = ({
  orders,
  deliveryOrders,
  invoices,
  onOpenCreateInvoiceWithSjs,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'eligible' | 'locked'>('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [selectedSjNumbers, setSelectedSjNumbers] = useState<string[]>([]);
  const [expandedSjNumber, setExpandedSjNumber] = useState<string | null>(null);

  // Compute billing status for each Delivery Order
  const processedSjs = useMemo(() => {
    return deliveryOrders.map((sj) => {
      const eligibility = evaluateBillingEligibility(sj.status, sj.controlStatus);
      const isDeliveredAndMatched = sj.status === 'Delivered' && sj.controlStatus === 'Matched';

      // Hitung kuantitas total SJ
      const totalSjQty = sj.items.reduce((s, it) => s + it.qtyShipped, 0);

      // Hitung kuantitas yang sudah ditagih di existing invoices
      let alreadyBilledQty = 0;
      invoices.forEach((inv) => {
        inv.items.forEach((item) => {
          if (item.sjNumber === sj.sjNumber) {
            alreadyBilledQty += item.qtyBilled;
          }
        });
      });

      const remainingUnbilledQty = Math.max(0, totalSjQty - alreadyBilledQty);
      const isFullyBilled = alreadyBilledQty >= totalSjQty && totalSjQty > 0;
      const isPartiallyBilled = alreadyBilledQty > 0 && !isFullyBilled;
      const canBeSelected = isDeliveredAndMatched && remainingUnbilledQty > 0;

      return {
        ...sj,
        totalSjQty,
        alreadyBilledQty,
        remainingUnbilledQty,
        isFullyBilled,
        isPartiallyBilled,
        canBeSelected,
        eligibilityReason: eligibility.reason,
      };
    });
  }, [deliveryOrders, invoices]);

  // Unique customers for filter
  const uniqueCustomers = useMemo(() => {
    const list = Array.from(new Set(deliveryOrders.map((d) => d.customerName)));
    return list;
  }, [deliveryOrders]);

  // Filtered SJ list
  const filteredSjs = useMemo(() => {
    return processedSjs.filter((sj) => {
      const matchSearch =
        sj.sjNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sj.soNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sj.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sj.customerPoNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCustomer = customerFilter === 'all' || sj.customerName === customerFilter;

      const matchEligibility =
        statusFilter === 'all' ||
        (statusFilter === 'eligible' && sj.canBeSelected) ||
        (statusFilter === 'locked' && !sj.canBeSelected);

      return matchSearch && matchCustomer && matchEligibility;
    });
  }, [processedSjs, searchQuery, customerFilter, statusFilter]);

  // Toggle selection for multi-SJ invoice creation
  const handleToggleSelect = (sjNumber: string, customerName: string) => {
    // If selecting, ensure same customer constraint (BR-BIL-02)
    if (selectedSjNumbers.includes(sjNumber)) {
      setSelectedSjNumbers(selectedSjNumbers.filter((num) => num !== sjNumber));
    } else {
      if (selectedSjNumbers.length > 0) {
        const firstSelected = processedSjs.find((s) => s.sjNumber === selectedSjNumbers[0]);
        if (firstSelected && firstSelected.customerName !== customerName) {
          alert(
            `Konsolidasi Multi-SJ hanya diizinkan untuk customer yang sama.\n\nFaktur saat ini memilih customer: ${firstSelected.customerName}.\nSJ yang Anda pilih milik: ${customerName}.`
          );
          return;
        }
      }
      setSelectedSjNumbers([...selectedSjNumbers, sjNumber]);
    }
  };

  const handleSelectAllEligible = () => {
    const eligibleSjs = filteredSjs.filter((s) => s.canBeSelected);
    if (eligibleSjs.length === 0) return;

    // Default to the first customer's eligible SJs
    const targetCustomer = eligibleSjs[0].customerName;
    const sameCustomerEligible = eligibleSjs
      .filter((s) => s.customerName === targetCustomer)
      .map((s) => s.sjNumber);

    if (selectedSjNumbers.length === sameCustomerEligible.length) {
      setSelectedSjNumbers([]);
    } else {
      setSelectedSjNumbers(sameCustomerEligible);
    }
  };

  const handleTriggerInvoice = () => {
    if (selectedSjNumbers.length === 0) return;
    onOpenCreateInvoiceWithSjs(selectedSjNumbers);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#ffffff] p-6 pb-16 space-y-6">
      {/* 1. Header Informasi Halaman */}
      <div className="bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#545454] flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-[#0057d2]" />
              Audit Gerbang Penagihan (Billing Gate) · BRD §5.7 & §5.8
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#edf7ed] text-[#10683b] border border-[#a5d6a7] rounded-[4px]">
              VERIFIED DELIVERIES ONLY
            </span>
          </div>
          <h1 className="text-[18px] font-bold text-[#000000] mt-1 tracking-tight">
            Surat Jalan Siap Ditagihkan (Ready to Bill)
          </h1>
          <p className="text-[11px] text-[#545454] mt-0.5">
            Daftar seluruh Surat Jalan fisik. Hanya SJ yang telah <strong>Delivered</strong> dan <strong>Matched</strong> yang dapat digabungkan ke dalam faktur tagihan bulanan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerInvoice}
            disabled={selectedSjNumbers.length === 0}
            className={`px-3.5 py-2 rounded-[4px] text-[12px] font-bold flex items-center gap-2 transition-all ${
              selectedSjNumbers.length > 0
                ? 'bg-[#0057d2] hover:bg-[#0046a8] text-[#ffffff] shadow-sm'
                : 'bg-[#e0e0e0] text-[#888888] cursor-not-allowed'
            }`}
          >
            <Receipt className="w-4 h-4" />
            + Buat Invoice ({selectedSjNumbers.length} SJ Terpilih)
          </button>
        </div>
      </div>

      {/* 2. Billing Protection Policy Banner */}
      <div className="bg-[#f0f7ff] border-l-4 border-l-[#0057d2] border border-[#90caf9] rounded-[4px] p-4 text-[11px] text-[#223548] space-y-1">
        <div className="flex items-center gap-2 font-bold text-[#0057d2]">
          <AlertCircle className="w-4 h-4" />
          <span>Aturan Bisnis Penagihan & Perlindungan Double Billing (BR-BIL-01 & FEAT-BIL-01):</span>
        </div>
        <p>
          1. <strong>Status Wajib Delivered & Matched:</strong> SJ berstatus <em>Draft</em>, <em>Printed</em>, atau <em>Exception</em> dikunci secara sistem dan dilarang masuk proses penerbitan invoice.
        </p>
        <p>
          2. <strong>Batas Kuantitas Fisik:</strong> Kuantitas yang ditagih tidak boleh melebihi sisa kuantitas delivered yang belum ditagihkan (mencegah double billing atas item yang sama).
        </p>
        <p>
          3. <strong>Pencegahan Anomali SO-0043:</strong> Pesanan dengan kuantitas delivered internal tanpa lembar fisik SJ diisolasi dan dilarang diterbitkan faktur.
        </p>
      </div>

      {/* 3. Filter & Controls Bar */}
      <div className="bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px] p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-[#545454] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari No. SJ, PO, Customer..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] text-[12px] text-[#000000] focus:outline-none focus:border-[#0057d2]"
            />
          </div>

          {/* Customer Filter */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-[#545454] font-medium">Customer:</span>
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="py-1 px-2.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] text-[12px] text-[#000000] focus:outline-none focus:border-[#0057d2]"
            >
              <option value="all">Semua Customer</option>
              {uniqueCustomers.map((cust) => (
                <option key={cust} value={cust}>
                  {cust}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 text-[11px]">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-[4px] font-bold border transition-colors ${
                statusFilter === 'all'
                  ? 'bg-[#0057d2] text-[#ffffff] border-[#0057d2]'
                  : 'bg-[#ffffff] text-[#545454] border-[#d5dce2] hover:bg-[#f5f6f7]'
              }`}
            >
              Semua ({processedSjs.length})
            </button>
            <button
              onClick={() => setStatusFilter('eligible')}
              className={`px-2.5 py-1 rounded-[4px] font-bold border transition-colors ${
                statusFilter === 'eligible'
                  ? 'bg-[#10683b] text-[#ffffff] border-[#10683b]'
                  : 'bg-[#ffffff] text-[#10683b] border-[#d5dce2] hover:bg-[#f5f6f7]'
              }`}
            >
              Siap Tagih ({processedSjs.filter((s) => s.canBeSelected).length})
            </button>
            <button
              onClick={() => setStatusFilter('locked')}
              className={`px-2.5 py-1 rounded-[4px] font-bold border transition-colors ${
                statusFilter === 'locked'
                  ? 'bg-[#545454] text-[#ffffff] border-[#545454]'
                  : 'bg-[#ffffff] text-[#545454] border-[#d5dce2] hover:bg-[#f5f6f7]'
              }`}
            >
              Terkunci / Belum Syarat ({processedSjs.filter((s) => !s.canBeSelected).length})
            </button>
          </div>
        </div>

        {/* Bulk select action info */}
        {selectedSjNumbers.length > 0 && (
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#0057d2] bg-[#e3f2fd] px-3 py-1 rounded-[4px] border border-[#90caf9]">
            <span>{selectedSjNumbers.length} SJ dipilih untuk konsolidasi</span>
            <button
              onClick={() => setSelectedSjNumbers([])}
              className="text-[#c5221f] hover:underline ml-2"
            >
              Batal Pilih
            </button>
          </div>
        )}
      </div>

      {/* 4. Tabel Daftar Surat Jalan */}
      <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden bg-[#ffffff]">
        <table className="w-full text-left text-[12px] border-collapse">
          <thead className="bg-[#f5f6f7] border-b border-[#d5dce2] text-[10px] font-bold text-[#545454] uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3 text-center w-10">
                <input
                  type="checkbox"
                  onChange={handleSelectAllEligible}
                  checked={
                    selectedSjNumbers.length > 0 &&
                    selectedSjNumbers.length === filteredSjs.filter((s) => s.canBeSelected).length
                  }
                  className="rounded-[2px] cursor-pointer"
                  title="Pilih semua SJ yang memenuhi syarat"
                />
              </th>
              <th className="py-2.5 px-3">No. Surat Jalan</th>
              <th className="py-2.5 px-3">Customer B2B & PO</th>
              <th className="py-2.5 px-3">Tgl Kirim</th>
              <th className="py-2.5 px-3 text-center">Status Fisik SJ</th>
              <th className="py-2.5 px-3 text-center">Audit Gerbang</th>
              <th className="py-2.5 px-3 text-right">Total Kirim</th>
              <th className="py-2.5 px-3 text-right">Sudah Ditagih</th>
              <th className="py-2.5 px-3 text-right">Sisa Siap Tagih</th>
              <th className="py-2.5 px-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d5dce2]">
            {filteredSjs.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-[#545454] text-[12px]">
                  Tidak ada data Surat Jalan yang cocok dengan kriteria pencarian.
                </td>
              </tr>
            ) : (
              filteredSjs.map((sj) => {
                const isSelected = selectedSjNumbers.includes(sj.sjNumber);
                const isExpanded = expandedSjNumber === sj.sjNumber;

                return (
                  <React.Fragment key={sj.id}>
                    <tr
                      className={`hover:bg-[#f8f9fa] transition-colors ${
                        isSelected ? 'bg-[#f0f7ff]' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        {sj.canBeSelected ? (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(sj.sjNumber, sj.customerName)}
                            className="rounded-[2px] cursor-pointer"
                          />
                        ) : (
                          <span title="Terkunci: Tidak memenuhi syarat penagihan" className="inline-block">
                            <Lock className="w-3.5 h-3.5 text-[#888888] mx-auto" />
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-[#0057d2]">{sj.sjNumber}</div>
                        <div className="text-[10px] text-[#545454]">SO: {sj.soNumber}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#000000]">{sj.customerName}</div>
                        <div className="text-[10px] text-[#545454]">PO: {sj.customerPoNumber}</div>
                      </td>
                      <td className="py-3 px-3 text-[#545454] whitespace-nowrap">
                        {formatIndoDate(sj.deliveryDate)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-[4px] border ${
                            sj.status === 'Delivered'
                              ? 'bg-[#edf7ed] text-[#10683b] border-[#a5d6a7]'
                              : sj.status === 'Printed'
                              ? 'bg-[#fff8e1] text-[#8d4b00] border-[#ffe082]'
                              : 'bg-[#f5f6f7] text-[#545454] border-[#d5dce2]'
                          }`}
                        >
                          {sj.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {sj.canBeSelected ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 bg-[#edf7ed] text-[#10683b] border border-[#a5d6a7] rounded-[4px]">
                            <CheckCircle2 className="w-3 h-3" />
                            SIAP DITAGIHKAN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 bg-[#f5f6f7] text-[#545454] border border-[#d5dce2] rounded-[4px]" title={sj.eligibilityReason}>
                            <Lock className="w-3 h-3 text-[#888888]" />
                            TERKUNCI
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums font-bold text-[#000000]">
                        {sj.totalSjQty.toLocaleString('id-ID')}{' '}
                        <span className="text-[10px] font-normal text-[#545454]">PCS</span>
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums text-[#0057d2]">
                        {sj.alreadyBilledQty.toLocaleString('id-ID')}{' '}
                        <span className="text-[10px] font-normal text-[#545454]">PCS</span>
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums font-bold">
                        <span
                          className={
                            sj.remainingUnbilledQty > 0
                              ? 'text-[#10683b] font-bold'
                              : 'text-[#888888]'
                          }
                        >
                          {sj.remainingUnbilledQty.toLocaleString('id-ID')}{' '}
                          <span className="text-[10px] font-normal text-[#545454]">PCS</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() =>
                              setExpandedSjNumber(isExpanded ? null : sj.sjNumber)
                            }
                            className="p-1 text-[#545454] hover:text-[#0057d2] hover:bg-[#f5f6f7] rounded-[4px] transition-colors"
                            title="Lihat Rincian Item SJ"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {sj.canBeSelected && (
                            <button
                              onClick={() => onOpenCreateInvoiceWithSjs([sj.sjNumber])}
                              className="px-2 py-0.5 bg-[#0057d2] hover:bg-[#0046a8] text-[#ffffff] rounded-[4px] text-[10px] font-bold transition-colors"
                            >
                              Tagih
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Detail Rows */}
                    {isExpanded && (
                      <tr className="bg-[#f9fafb] border-y border-[#d5dce2]">
                        <td colSpan={10} className="p-4 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] gap-2 border-b border-[#e5e9ec] pb-2">
                            <div>
                              <span className="font-bold text-[#000000]">
                                Rincian Muatan Fisik Surat Jalan: {sj.sjNumber}
                              </span>
                              <span className="text-[#545454] ml-2">
                                (Pengemudi: {sj.driverName || '-'} · Armada: {sj.vehicleNumber || '-'})
                              </span>
                            </div>
                            <div className="text-[10px] text-[#545454]">
                              Penerima Fisik:{' '}
                              <strong className="text-[#000000]">
                                {sj.recipientName || 'Belum ada konfirmasi'}
                              </strong>{' '}
                              · {sj.confirmedAt || '-'}
                            </div>
                          </div>

                          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] overflow-hidden">
                            <table className="w-full text-left text-[11px]">
                              <thead className="bg-[#f5f6f7] border-b border-[#d5dce2] text-[10px] font-bold text-[#545454]">
                                <tr>
                                  <th className="py-2 px-3">Part Number</th>
                                  <th className="py-2 px-3">Deskripsi Komponen</th>
                                  <th className="py-2 px-3 text-right">Kuantitas Kirim</th>
                                  <th className="py-2 px-3 text-right">Sudah Masuk Invoice</th>
                                  <th className="py-2 px-3 text-right">Sisa Belum Ditagih</th>
                                  <th className="py-2 px-3 text-center">Status Item</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#e5e9ec]">
                                {sj.items.map((it, idx) => {
                                  // Check billed status of this specific item in invoices
                                  let itemBilled = 0;
                                  invoices.forEach((inv) => {
                                    inv.items.forEach((invIt) => {
                                      if (
                                        invIt.sjNumber === sj.sjNumber &&
                                        invIt.partNumber === it.partNumber
                                      ) {
                                        itemBilled += invIt.qtyBilled;
                                      }
                                    });
                                  });
                                  const itemRemaining = Math.max(0, it.qtyShipped - itemBilled);

                                  return (
                                    <tr key={idx} className="hover:bg-[#f8f9fa]">
                                      <td className="py-2 px-3 font-mono font-bold text-[#0057d2]">
                                        {it.partNumber}
                                      </td>
                                      <td className="py-2 px-3 text-[#000000]">
                                        {it.partDescription}
                                      </td>
                                      <td className="py-2 px-3 text-right tabular-nums font-bold">
                                        {it.qtyShipped.toLocaleString('id-ID')} PCS
                                      </td>
                                      <td className="py-2 px-3 text-right tabular-nums text-[#0057d2]">
                                        {itemBilled.toLocaleString('id-ID')} PCS
                                      </td>
                                      <td className="py-2 px-3 text-right tabular-nums font-bold text-[#10683b]">
                                        {itemRemaining.toLocaleString('id-ID')} PCS
                                      </td>
                                      <td className="py-2 px-3 text-center">
                                        {itemBilled >= it.qtyShipped ? (
                                          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#edf7ed] text-[#10683b] rounded-[2px] border border-[#a5d6a7]">
                                            TERTAGIH LENGKAP
                                          </span>
                                        ) : itemBilled > 0 ? (
                                          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#e3f2fd] text-[#0057d2] rounded-[2px] border border-[#90caf9]">
                                            TERTAGIH SEBAGIAN
                                          </span>
                                        ) : sj.canBeSelected ? (
                                          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#fff8e1] text-[#8d4b00] rounded-[2px] border border-[#ffe082]">
                                            SIAP DITAGIH
                                          </span>
                                        ) : (
                                          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#f5f6f7] text-[#545454] rounded-[2px] border border-[#d5dce2]">
                                            TERKUNCI
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {sj.proofOfDeliveryNotes && (
                            <div className="text-[10px] text-[#545454] bg-[#ffffff] p-2 rounded-[2px] border border-[#d5dce2]">
                              <strong>Catatan Bukti Fisik Penerimaan:</strong> {sj.proofOfDeliveryNotes}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
