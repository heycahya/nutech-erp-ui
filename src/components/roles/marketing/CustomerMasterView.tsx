/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Master Customer B2B View (Marketing Module)
 * BRD Section 8.4, FEAT-MD-01
 * Pengelolaan profil pelanggan B2B, syarat pembayaran, riwayat SO, dan simulasi penambahan pelanggan.
 */

import React, { useState, useMemo } from 'react';
import { Customer, SalesOrder } from '../../../types/erp';
import {
  Users,
  Search,
  Plus,
  Building2,
  Phone,
  User,
  CreditCard,
  FileText,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface CustomerMasterViewProps {
  customers: Customer[];
  orders: SalesOrder[];
  onAddCustomer: (customer: Customer) => void;
  onSelectCustomerForOrder?: (customerId: string) => void;
}

export const CustomerMasterView: React.FC<CustomerMasterViewProps> = ({
  customers,
  orders,
  onAddCustomer,
  onSelectCustomerForOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [termFilter, setTermFilter] = useState<'all' | 'Net 30' | 'Net 45'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state for adding customer
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPaymentTerms, setFormPaymentTerms] = useState('Net 30');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccessNotification, setFormSuccessNotification] = useState<string | null>(null);

  // Compute aggregate stats per customer
  const customerStats = useMemo(() => {
    const stats: Record<string, { soCount: number; totalOrderedPcs: number }> = {};
    for (const c of customers) {
      const custOrders = orders.filter((o) => o.customerId === c.id || o.customerName === c.name);
      const totalPcs = custOrders.reduce(
        (sum, o) => sum + o.items.reduce((s, item) => s + item.qtyOrdered, 0),
        0
      );
      stats[c.id] = {
        soCount: custOrders.length,
        totalOrderedPcs: totalPcs,
      };
    }
    return stats;
  }, [customers, orders]);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTerm = termFilter === 'all' || c.paymentTerms === termFilter;
      return matchesSearch && matchesTerm;
    });
  }, [customers, searchTerm, termFilter]);

  const handleOpenAddModal = () => {
    const nextNum = customers.length + 1;
    setFormCode(`CUST-AUTO-0${nextNum}`);
    setFormName('');
    setFormAddress('');
    setFormContactPerson('');
    setFormPhone('+62 21 ');
    setFormPaymentTerms('Net 30');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Nama perusahaan pelanggan wajib diisi.');
      return;
    }
    if (!formAddress.trim()) {
      setFormError('Alamat pabrik / kawasan industri wajib diisi.');
      return;
    }
    if (!formContactPerson.trim()) {
      setFormError('Nama kontak person (PIC) wajib diisi.');
      return;
    }

    const newCustomer: Customer = {
      id: formCode.trim().toUpperCase(),
      code: formCode.trim().toUpperCase(),
      name: formName.trim(),
      address: formAddress.trim(),
      contactPerson: formContactPerson.trim(),
      phone: formPhone.trim(),
      paymentTerms: formPaymentTerms,
    };

    onAddCustomer(newCustomer);
    setIsAddModalOpen(false);
    setFormSuccessNotification(`Pelanggan baru "${newCustomer.name}" berhasil ditambahkan ke Master Data.`);
    setTimeout(() => setFormSuccessNotification(null), 5000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#ffffff] p-6 pb-12 space-y-5">
      {/* 1. Header Informasi Halaman */}
      <div className="bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#545454] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#0057d2]" />
              Master Komersial · BRD Section 8.4 & FEAT-MD-01
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#edf7ed] text-[#10683b] border border-[#a5d6a7] rounded-[4px]">
              DATA MASTER RESMI
            </span>
          </div>
          <h1 className="text-[18px] font-bold text-[#000000] mt-1 tracking-tight">
            Master Data Pelanggan B2B (Manufaktur Otomotif)
          </h1>
          <p className="text-[11px] text-[#545454] mt-0.5">
            Daftar entitas pembeli tier-1 otomotif, relasi kontrak Sales Order, dan ketentuan termin pembayaran
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-bold text-white bg-[#0057d2] hover:bg-[#0049b0] active:bg-[#00368a] rounded-[4px] shadow-sm transition-colors cursor-pointer shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Customer (Simulasi)</span>
        </button>
      </div>

      {/* Success Notification Toast */}
      {formSuccessNotification && (
        <div className="p-3 bg-[#eaf6ef] border border-[#10683b]/30 rounded-[4px] flex items-center justify-between text-[12px] text-[#10683b]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{formSuccessNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setFormSuccessNotification(null)}
            className="p-1 hover:bg-[#10683b]/10 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Filter & Pencarian */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#545454] uppercase tracking-wider">
            Termin Default Simulasi (TBD-14):
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setTermFilter('all')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-[4px] border transition-colors cursor-pointer ${
                termFilter === 'all'
                  ? 'bg-[#0057d2] text-[#ffffff] border-[#0057d2] font-semibold'
                  : 'bg-[#ffffff] text-[#223548] border-[#d5dce2] hover:bg-[#eaecee]'
              }`}
            >
              Semua ({customers.length})
            </button>
            <button
              type="button"
              onClick={() => setTermFilter('Net 30')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-[4px] border transition-colors cursor-pointer ${
                termFilter === 'Net 30'
                  ? 'bg-[#0057d2] text-[#ffffff] border-[#0057d2] font-semibold'
                  : 'bg-[#ffffff] text-[#223548] border-[#d5dce2] hover:bg-[#eaecee]'
              }`}
            >
              Net 30
            </button>
            <button
              type="button"
              onClick={() => setTermFilter('Net 45')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-[4px] border transition-colors cursor-pointer ${
                termFilter === 'Net 45'
                  ? 'bg-[#0057d2] text-[#ffffff] border-[#0057d2] font-semibold'
                  : 'bg-[#ffffff] text-[#223548] border-[#d5dce2] hover:bg-[#eaecee]'
              }`}
            >
              Net 45
            </button>
          </div>
        </div>

        <div className="relative w-full sm:w-[280px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8c9ba5]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama, kode, PIC, lokasi..."
            className="w-full h-[32px] pl-8 pr-3 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2] text-[#000000]"
          />
        </div>
      </div>

      {/* 3. Tabel Master Customer */}
      <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden bg-[#ffffff]">
        <div className="px-4 py-3 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#0057d2]" />
            <h2 className="text-[13px] font-bold text-[#000000]">
              Daftar Entitas Pelanggan B2B Terdaftar
            </h2>
          </div>
          <span className="text-[11px] text-[#545454]">
            Menampilkan <strong>{filteredCustomers.length}</strong> dari {customers.length} entitas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px] border-collapse">
            <thead className="bg-[#ffffff] border-b border-[#d5dce2] text-[10px] font-bold text-[#545454] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Kode & Nama Pelanggan</th>
                <th className="py-2.5 px-4">Alamat Pabrik / Kawasan</th>
                <th className="py-2.5 px-4">Kontak Person (PIC)</th>
                <th className="py-2.5 px-4 text-center">
                  <div>Termin Pembayaran</div>
                  <div className="text-[9px] font-normal text-[#545454] lowercase">default simulasi (TBD-14)</div>
                </th>
                <th className="py-2.5 px-4 text-center">Kontrak SO</th>
                <th className="py-2.5 px-4 text-right">Akumulasi Order</th>
                <th className="py-2.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d5dce2]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[12px] text-[#8c9ba5]">
                    Tidak ada pelanggan yang sesuai dengan kriteria pencarian "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const stat = customerStats[cust.id] || { soCount: 0, totalOrderedPcs: 0 };
                  return (
                    <tr key={cust.id} className="hover:bg-[#f5f6f7] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono text-[11px] font-bold text-[#0057d2]">
                          {cust.code}
                        </div>
                        <div className="text-[13px] font-bold text-[#000000]">{cust.name}</div>
                      </td>
                      <td className="py-3 px-4 max-w-[280px]">
                        <div className="text-[11px] text-[#223548] leading-relaxed truncate" title={cust.address}>
                          {cust.address}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[11px] font-semibold text-[#000000] flex items-center gap-1.5">
                          <User className="w-3 h-3 text-[#545454]" />
                          <span>{cust.contactPerson}</span>
                        </div>
                        <div className="text-[10px] text-[#545454] flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-[#8c9ba5]" />
                          <span>{cust.phone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-[#eaecee] text-[#354a5f] rounded-[4px] border border-[#d5dce2]">
                          {cust.paymentTerms}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-[#edf7ed] text-[#10683b] rounded-[4px] border border-[#a5d6a7]">
                          {stat.soCount} Pesanan
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-[#000000]">
                        {stat.totalOrderedPcs.toLocaleString('id-ID')}{' '}
                        <span className="text-[10px] font-normal text-[#545454]">PCS</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(cust)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#0057d2] hover:bg-[#0057d2]/10 border border-[#0057d2]/30 rounded-[4px] transition-colors cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Profil</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot className="bg-[#f8f9fa] border-t border-[#d5dce2] font-semibold text-[11px] text-[#223548]">
              <tr>
                <td colSpan={4} className="py-2.5 px-4 font-bold text-[#000000]">
                  Total Portofolio Komersial (Pelanggan B2B Terdaftar):
                </td>
                <td className="py-2.5 px-4 text-center font-bold text-[#10683b]">
                  {orders.length} Sales Order
                </td>
                <td className="py-2.5 px-4 text-right font-bold tabular-nums text-[#000000]">
                  {orders
                    .reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.qtyOrdered, 0), 0)
                    .toLocaleString('id-ID')}{' '}
                  <span className="text-[10px] font-normal text-[#545454]">PCS</span>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 4. MODAL DETAIL PROFIL CUSTOMER */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-[#000000]/40 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-xl w-full max-w-[680px] max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#545454]">
                  Profil Master Pelanggan B2B
                </span>
                <h3 className="text-[15px] font-bold text-[#000000]">{selectedCustomer.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="p-1 text-[#545454] hover:text-[#000000] rounded hover:bg-[#eaecee] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
                <div className="p-3 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
                  <span className="text-[10px] text-[#545454] font-bold uppercase block">
                    Kode Pelanggan (ID)
                  </span>
                  <span className="font-mono font-bold text-[#0057d2] text-[13px]">
                    {selectedCustomer.code}
                  </span>
                </div>
                <div className="p-3 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
                  <span className="text-[10px] text-[#545454] font-bold uppercase block">
                    Termin Default Simulasi (TBD-14)
                  </span>
                  <span className="font-bold text-[#000000] text-[13px]">
                    {selectedCustomer.paymentTerms}
                  </span>
                </div>
                <div className="p-3 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
                  <span className="text-[10px] text-[#545454] font-bold uppercase block">
                    Kontak Person (PIC)
                  </span>
                  <span className="font-semibold text-[#000000] block">{selectedCustomer.contactPerson}</span>
                  <span className="text-[11px] text-[#545454]">{selectedCustomer.phone}</span>
                </div>
                <div className="p-3 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px]">
                  <span className="text-[10px] text-[#545454] font-bold uppercase block">
                    Alamat Pengiriman & Pabrik
                  </span>
                  <span className="text-[11px] text-[#223548] leading-tight block">
                    {selectedCustomer.address}
                  </span>
                </div>
              </div>

              {/* Riwayat Sales Order Terkait */}
              <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden">
                <div className="px-3.5 py-2 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#000000]">
                    Riwayat Sales Order untuk Customer Ini
                  </span>
                  <span className="text-[#545454]">
                    {orders.filter((o) => o.customerId === selectedCustomer.id || o.customerName === selectedCustomer.name).length} Transaksi
                  </span>
                </div>
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-[#ffffff] border-b border-[#d5dce2] text-[10px] font-bold text-[#545454]">
                    <tr>
                      <th className="py-2 px-3">No. SO</th>
                      <th className="py-2 px-3">No. PO</th>
                      <th className="py-2 px-3 text-center">Tipe</th>
                      <th className="py-2 px-3 text-right">Volume</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d5dce2]">
                    {orders
                      .filter((o) => o.customerId === selectedCustomer.id || o.customerName === selectedCustomer.name)
                      .map((o) => {
                        const totalPcs = o.items.reduce((s, i) => s + i.qtyOrdered, 0);
                        return (
                          <tr key={o.id} className="hover:bg-[#f5f6f7]">
                            <td className="py-2 px-3 font-mono font-bold text-[#0057d2]">
                              {o.soNumber}
                            </td>
                            <td className="py-2 px-3 font-mono text-[#545454]">{o.customerPoNumber}</td>
                            <td className="py-2 px-3 text-center">
                              <span
                                className={`px-1.5 py-0.2 text-[9px] font-bold rounded-[3px] border ${
                                  o.orderType === 'Urgent'
                                    ? 'bg-[#fff6e5] text-[#8d4b00] border-[#8d4b00]/30'
                                    : 'bg-[#eaecee] text-[#354a5f] border-[#d5dce2]'
                                }`}
                              >
                                {o.orderType}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right tabular-nums font-bold">
                              {totalPcs.toLocaleString('id-ID')} PCS
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#edf7ed] text-[#10683b] rounded-[3px]">
                                {o.statusProduction}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-[#f5f6f7] border-t border-[#d5dce2] flex items-center justify-between">
              <span className="text-[10px] text-[#545454]">
                Data Master Customer · Single Source of Truth
              </span>
              <div className="flex items-center gap-2">
                {onSelectCustomerForOrder && (
                  <button
                    type="button"
                    onClick={() => {
                      const custId = selectedCustomer.id;
                      setSelectedCustomer(null);
                      onSelectCustomerForOrder(custId);
                    }}
                    className="px-3 py-1.5 text-[11px] font-bold text-white bg-[#0057d2] hover:bg-[#0049b0] rounded-[4px] cursor-pointer"
                  >
                    Buat SO Baru untuk Customer Ini
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="px-3 py-1.5 text-[11px] font-semibold text-[#223548] hover:bg-[#eaecee] border border-[#d5dce2] rounded-[4px] cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL TAMBAH CUSTOMER BARU (SIMULASI) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#000000]/40 backdrop-blur-[1px] flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCustomer}
            className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-xl w-full max-w-[560px] flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0057d2]">
                  Simulasi Komersial
                </span>
                <h3 className="text-[15px] font-bold text-[#000000]">
                  Registrasi Master Customer B2B Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#545454] hover:text-[#000000] rounded hover:bg-[#eaecee] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-3.5 text-[12px]">
              {formError && (
                <div className="p-2.5 bg-[#fde8e8] border border-[#d32f2f]/30 rounded-[4px] text-[#c62828] text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    Kode Pelanggan (Otomatis)
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full h-[32px] px-2.5 font-mono text-[12px] bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] text-[#0057d2] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    Termin Pembayaran (TOP)
                  </label>
                  <select
                    value={formPaymentTerms}
                    onChange={(e) => setFormPaymentTerms(e.target.value)}
                    className="w-full h-[32px] px-2.5 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px]"
                  >
                    <option value="Net 30">Net 30 (30 Hari)</option>
                    <option value="Net 45">Net 45 (45 Hari)</option>
                    <option value="Net 60">Net 60 (60 Hari)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#223548] mb-1">
                  Nama Perusahaan B2B (Fiktif) <span className="text-[#c62828]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT Prima Presisi Otomotif Nusantara"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full h-[32px] px-2.5 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#223548] mb-1">
                  Alamat Pabrik / Kawasan Industri <span className="text-[#c62828]">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Contoh: Kawasan Industri Jababeka Tahap V, Cikarang Timur, Bekasi"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full p-2 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    Kontak Person (PIC) <span className="text-[#c62828]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso (Purchasing)"
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    className="w-full h-[32px] px-2.5 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    No. Telepon / Kantor
                  </label>
                  <input
                    type="text"
                    placeholder="+62 21 8900 1234"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full h-[32px] px-2.5 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-[#f5f6f7] border-t border-[#d5dce2] flex items-center justify-between">
              <span className="text-[10px] text-[#545454]">
                Mode Simulasi UI Frontend · Tanpa Database Riil
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-[11px] font-semibold text-[#223548] hover:bg-[#eaecee] border border-[#d5dce2] rounded-[4px] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-[11px] font-bold text-white bg-[#0057d2] hover:bg-[#0049b0] rounded-[4px] cursor-pointer"
                >
                  Simpan Pelanggan
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
