/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FEAT-MD-03 — Master Supplier Bahan Baku
 * Grounded in: brd-nutech.md §8.4, features.md §2.1, FEAT-MD-03.
 */

import React, { useState, useMemo } from 'react';
import {
  Supplier,
  PurchaseOrder,
} from '../../../types/erp';
import { validateSupplierForm, formatIndoDate } from '../../../utils/logic';
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Building,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  X,
  AlertTriangle,
  ShoppingCart,
} from 'lucide-react';

interface SupplierMasterViewProps {
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  onSaveSupplier: (supplier: Supplier) => void;
}

export const SupplierMasterView: React.FC<SupplierMasterViewProps> = ({
  suppliers,
  purchaseOrders,
  onSaveSupplier,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedSupplierDetail, setSelectedSupplierDetail] = useState<Supplier | null>(null);

  // Form Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formCode, setFormCode] = useState<string>('');
  const [formName, setFormName] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('Karet / EPDM Compound');
  const [formContactPerson, setFormContactPerson] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formAddress, setFormAddress] = useState<string>('');
  const [formPaymentTerms, setFormPaymentTerms] = useState<string>('Net 30');
  const [formLeadTimeDays, setFormLeadTimeDays] = useState<number>(7);
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered Suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      if (categoryFilter !== 'all' && !s.category.toLowerCase().includes(categoryFilter.toLowerCase())) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          s.code.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.contactPerson.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [suppliers, categoryFilter, searchQuery]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingSupplier(null);
    setFormCode(`SUPP-NEW-0${suppliers.length + 1}`);
    setFormName('');
    setFormCategory('Karet / EPDM Compound');
    setFormContactPerson('');
    setFormPhone('+62 21 ');
    setFormEmail('sales@supplierdemo.co.id');
    setFormAddress('Kawasan Industri Jababeka, Cikarang, Jawa Barat');
    setFormPaymentTerms('Net 30');
    setFormLeadTimeDays(7);
    setFormStatus('Active');
    setFormNotes('');
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (s: Supplier) => {
    setEditingSupplier(s);
    setFormCode(s.code);
    setFormName(s.name);
    setFormCategory(s.category);
    setFormContactPerson(s.contactPerson);
    setFormPhone(s.phone);
    setFormEmail(s.email);
    setFormAddress(s.address);
    setFormPaymentTerms(s.paymentTerms);
    setFormLeadTimeDays(s.leadTimeDays);
    setFormStatus(s.status);
    setFormNotes(s.notes || '');
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Save Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateSupplierForm(
      {
        code: formCode,
        name: formName,
        contactPerson: formContactPerson,
        paymentTerms: formPaymentTerms,
      },
      suppliers,
      editingSupplier?.id
    );

    if (!validation.isValid) {
      setFormError(validation.error || 'Data form tidak valid.');
      return;
    }

    const savedSupplier: Supplier = {
      id: editingSupplier ? editingSupplier.id : `supp-${Date.now()}`,
      code: formCode.trim().toUpperCase(),
      name: formName.trim(),
      category: formCategory,
      contactPerson: formContactPerson.trim(),
      phone: formPhone.trim(),
      email: formEmail.trim(),
      address: formAddress.trim(),
      paymentTerms: formPaymentTerms,
      leadTimeDays: formLeadTimeDays,
      status: formStatus,
      notes: formNotes.trim(),
      rating: editingSupplier?.rating || 'Grade A (Pemasok Baru)',
    };

    onSaveSupplier(savedSupplier);
    setIsFormModalOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#ffffff] p-6 space-y-5">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#d5dce2] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0057d2] bg-[#ebf8ff] px-2 py-0.5 rounded-[4px] border border-[#0057d2]/20">
              FEAT-MD-03 · Master Data
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#10683b] bg-[#edf7ed] px-2 py-0.5 rounded-[4px] border border-[#a5d6a7]">
              SUPPLIER MATERIAL BAKU
            </span>
          </div>
          <h1 className="text-[18px] font-bold text-[#000000] mt-1 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0057d2]" />
            Master Pemasok (Supplier Management)
          </h1>
          <p className="text-[11px] text-[#545454] mt-0.5">
            Pengelolaan data master supplier bahan baku resmi, kontak penanggung jawab, termin pembayaran, dan performa ketepatan waktu pengiriman.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="px-3.5 py-1.5 text-[11px] font-bold text-[#ffffff] bg-[#0057d2] hover:bg-[#0040b0] rounded-[4px] cursor-pointer inline-flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Supplier Baru</span>
        </button>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#545454]">
            Total Supplier Terdaftar
          </div>
          <div className="mt-1 text-[22px] font-bold text-[#000000] tabular-nums">
            {suppliers.length} <span className="text-[12px] font-normal text-[#545454]">Vendor</span>
          </div>
          <div className="mt-1 text-[11px] text-[#10683b]">100% Pemasok B2B Terverifikasi</div>
        </div>

        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#545454]">
            Kategori Material Utama
          </div>
          <div className="mt-1 text-[22px] font-bold text-[#0057d2] tabular-nums">
            3 <span className="text-[12px] font-normal text-[#545454]">Sektor</span>
          </div>
          <div className="mt-1 text-[11px] text-[#475e75]">EPDM Rubber, PU Foam, EVA Sponge</div>
        </div>

        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#545454]">
            Rata-rata Lead Time
          </div>
          <div className="mt-1 text-[22px] font-bold text-[#000000] tabular-nums">
            ~7 - 10 <span className="text-[12px] font-normal text-[#545454]">Hari</span>
          </div>
          <div className="mt-1 text-[11px] text-[#475e75]">Waktu pemesanan hingga tiba di pabrik</div>
        </div>

        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#545454]">
            Standar Termin Pembayaran
          </div>
          <div className="mt-1 text-[22px] font-bold text-[#10683b] tabular-nums">
            Net 30 / 45
          </div>
          <div className="mt-1 text-[11px] text-[#475e75]">Sesuai kesepakatan kontrak pengadaan</div>
        </div>
      </div>

      {/* 3. Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px]">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'all', label: 'Semua Kategori' },
            { id: 'Karet', label: 'Karet / EPDM' },
            { id: 'Busa', label: 'Busa / Foam' },
            { id: 'EVA', label: 'EVA Sponge' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-[4px] cursor-pointer transition-colors whitespace-nowrap ${
                categoryFilter === tab.id
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
            placeholder="Cari Kode, Nama, PIC, Alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] w-[240px] focus:outline-none focus:border-[#0057d2]"
          />
        </div>
      </div>

      {/* 4. Table of Suppliers */}
      <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden bg-[#ffffff]">
        <div className="px-4 py-2.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
          <div className="text-[11px] font-bold text-[#000000] uppercase tracking-wider">
            Daftar Rekanan Pemasok ({filteredSuppliers.length})
          </div>
          <span className="text-[10px] text-[#545454]">
            Data fiktif simulasi demo terstandarisasi ISO / IATF
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px] border-collapse">
            <thead className="bg-[#ffffff] border-b border-[#d5dce2] text-[10px] font-bold text-[#545454] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Kode & Nama Pemasok</th>
                <th className="py-2.5 px-3">Kategori Material</th>
                <th className="py-2.5 px-3">Kontak Penanggung Jawab</th>
                <th className="py-2.5 px-3">Lokasi / Alamat</th>
                <th className="py-2.5 px-3 text-center">Termin</th>
                <th className="py-2.5 px-3 text-center">Lead Time</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaecee]">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[12px] text-[#545454]">
                    Tidak ada supplier yang sesuai dengan kata kunci pencarian.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-[#0057d2] text-[11px]">{s.code}</div>
                      <div className="font-semibold text-[#000000] text-[12px] mt-0.5">{s.name}</div>
                      {s.rating && <div className="text-[10px] text-[#10683b] mt-0.5 font-medium">{s.rating}</div>}
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-[#f5f6f7] border border-[#d5dce2] rounded text-[11px] text-[#223548]">
                        {s.category}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-[11px]">
                      <div className="font-medium text-[#000000]">{s.contactPerson}</div>
                      <div className="text-[#545454] text-[10px] mt-0.5">{s.phone}</div>
                    </td>

                    <td className="py-3 px-3 text-[11px] text-[#354a5f] max-w-[220px] truncate">
                      {s.address}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="font-mono font-bold text-[#0057d2] text-[11px] bg-[#ebf8ff] px-2 py-0.5 rounded border border-[#0057d2]/20">
                        {s.paymentTerms}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center font-mono tabular-nums text-[11px]">
                      {s.leadTimeDays} Hari
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-[#edf7ed] text-[#10683b] border border-[#a5d6a7] rounded-[3px]">
                        {s.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedSupplierDetail(s)}
                          className="px-2 py-1 text-[11px] font-medium text-[#0057d2] hover:bg-[#ebf8ff] border border-[#0057d2]/30 rounded-[4px] cursor-pointer inline-flex items-center gap-1"
                          title="Lihat Profil & Riwayat PO"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Riwayat PO</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(s)}
                          className="p-1 text-[#545454] hover:text-[#0057d2] hover:bg-[#f5f6f7] rounded cursor-pointer"
                          title="Edit Supplier"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Detail Modal Supplier & Riwayat PO */}
      {selectedSupplierDetail && (
        <div className="fixed inset-0 z-50 bg-[#000000]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-xl w-full max-w-[650px] overflow-hidden">
            <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#0057d2] uppercase tracking-wider block">
                  Profil Pemasok & Riwayat Transaksi
                </span>
                <h3 className="text-[14px] font-bold text-[#000000] mt-0.5">
                  {selectedSupplierDetail.code} — {selectedSupplierDetail.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSupplierDetail(null)}
                className="p-1 text-[#545454] hover:text-[#000000] rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-[12px]">
              <div className="p-3 bg-[#f8f9fa] border border-[#d5dce2] rounded-[4px] space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-[#545454] block">Kategori Material:</span>
                    <span className="font-bold text-[#000000]">{selectedSupplierDetail.category}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#545454] block">PIC / Penanggung Jawab:</span>
                    <span className="font-semibold text-[#0057d2]">{selectedSupplierDetail.contactPerson}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#545454] block">Telepon / WhatsApp:</span>
                    <span className="font-medium text-[#223548]">{selectedSupplierDetail.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#545454] block">Email Procurement:</span>
                    <span className="font-medium text-[#223548]">{selectedSupplierDetail.email}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#eaecee]">
                  <span className="text-[10px] text-[#545454] block">Alamat Gudang / Pabrik:</span>
                  <span className="text-[#354a5f]">{selectedSupplierDetail.address}</span>
                </div>
              </div>

              {/* Riwayat PO ke Supplier ini */}
              <div>
                <div className="text-[11px] font-bold text-[#000000] mb-2 flex items-center justify-between">
                  <span>Riwayat Purchase Order (PO):</span>
                  <span className="text-[10px] text-[#545454]">
                    {purchaseOrders.filter((p) => p.supplierId === selectedSupplierDetail.id).length} PO Tercatat
                  </span>
                </div>

                <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead className="bg-[#f5f6f7] border-b border-[#d5dce2] font-bold text-[#545454]">
                      <tr>
                        <th className="py-2 px-3">No. PO</th>
                        <th className="py-2 px-3">Tanggal</th>
                        <th className="py-2 px-3 text-right">Nilai Total</th>
                        <th className="py-2 px-3 text-center">Status PO</th>
                        <th className="py-2 px-3 text-center">Status GRN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eaecee]">
                      {purchaseOrders.filter((p) => p.supplierId === selectedSupplierDetail.id).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-[#545454]">
                            Belum ada Purchase Order yang diterbitkan untuk supplier ini.
                          </td>
                        </tr>
                      ) : (
                        purchaseOrders
                          .filter((p) => p.supplierId === selectedSupplierDetail.id)
                          .map((po) => (
                            <tr key={po.id} className="hover:bg-[#f8f9fa]">
                              <td className="py-2 px-3 font-mono font-bold text-[#0057d2]">{po.poNumber}</td>
                              <td className="py-2 px-3">{formatIndoDate(po.orderDate)}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-[#000000]">
                                Rp {po.totalAmount.toLocaleString('id-ID')}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#ebf8ff] text-[#0057d2]">
                                  {po.status}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-center text-[10px]">
                                {po.grnStatus}
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-[#f5f6f7] border-t border-[#d5dce2] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSupplierDetail(null)}
                className="px-4 py-1.5 text-[11px] font-semibold text-[#223548] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Form Modal Create / Edit Supplier */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#000000]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-xl w-full max-w-[550px] overflow-hidden">
            <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#0057d2] uppercase tracking-wider block">
                  {editingSupplier ? 'Revisi Master Supplier' : 'Registrasi Supplier Baru'}
                </span>
                <h3 className="text-[14px] font-bold text-[#000000] mt-0.5">
                  {editingSupplier ? `Edit Supplier (${editingSupplier.code})` : 'Formulir Pemasok Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 text-[#545454] hover:text-[#000000] rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 space-y-3 text-[12px]">
              {formError && (
                <div className="p-2.5 bg-[#fff6e5] border border-[#8d4b00]/30 rounded-[4px] text-[11px] text-[#8d4b00] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    Kode Pemasok (Unik):
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 text-[11px] font-mono font-bold bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    Kategori Material:
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  >
                    <option value="Karet / EPDM Compound">Karet / EPDM Compound</option>
                    <option value="Busa / Acoustic PU Foam">Busa / Acoustic PU Foam</option>
                    <option value="EVA Sponge & Sheet">EVA Sponge & Sheet</option>
                    <option value="Elastomer & Rubber Sheet">Elastomer & Rubber Sheet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#223548] mb-1">
                  Nama Badan Usaha / Perusahaan:
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder="Misal: PT Sumber Bahan Utama"
                  className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    Nama Kontak PIC:
                  </label>
                  <input
                    type="text"
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    required
                    placeholder="Misal: Budi Darmawan"
                    className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    No. Telepon / Kantor:
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 text-[11px] font-mono bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    Termin Pembayaran:
                  </label>
                  <select
                    value={formPaymentTerms}
                    onChange={(e) => setFormPaymentTerms(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  >
                    <option value="Net 30">Net 30 Hari</option>
                    <option value="Net 45">Net 45 Hari</option>
                    <option value="Net 60">Net 60 Hari</option>
                    <option value="Cash Before Delivery (CBD)">Cash Before Delivery (CBD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    Standar Lead Time (Hari):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formLeadTimeDays}
                    onChange={(e) => setFormLeadTimeDays(parseInt(e.target.value, 10) || 7)}
                    required
                    className="w-full px-2.5 py-1.5 text-[11px] font-mono bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#223548] mb-1">
                  Alamat Pabrik / Gudang Vendor:
                </label>
                <textarea
                  rows={2}
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  required
                  placeholder="Kawasan Industri, Kota, Provinsi"
                  className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                />
              </div>

              <div className="pt-3 border-t border-[#d5dce2] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-1.5 text-[11px] font-semibold text-[#223548] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-[11px] font-bold text-[#ffffff] bg-[#0057d2] hover:bg-[#0040b0] rounded-[4px] cursor-pointer shadow-xs"
                >
                  Simpan Data Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
