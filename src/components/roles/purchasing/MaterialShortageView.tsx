/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FEAT-SH-01 / F-15 — Material Requirement & Shortage Reporting (PR)
 * Grounded in: brd-nutech.md §3.2, features.md §2.9, F-15.
 */

import React, { useState, useMemo } from 'react';
import {
  MaterialShortageTicket,
  RawMaterial,
  Supplier,
} from '../../../types/erp';
import { formatIndoDate } from '../../../utils/logic';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShoppingCart,
  X,
  User,
  Factory,
  Info,
} from 'lucide-react';

interface MaterialShortageViewProps {
  shortages: MaterialShortageTicket[];
  materials: RawMaterial[];
  onSaveShortage: (ticket: MaterialShortageTicket) => void;
  onOpenCreatePoFromShortage?: (materialId: string, neededQty: number) => void;
}

export const MaterialShortageView: React.FC<MaterialShortageViewProps> = ({
  shortages,
  materials,
  onSaveShortage,
  onOpenCreatePoFromShortage,
}) => {
  // 1. Filter State
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');

  // 2. Modal Form State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formRequesterRole, setFormRequesterRole] = useState<'ppic' | 'admin_operasional' | 'warehouse'>('ppic');
  const [formRequesterName, setFormRequesterName] = useState<string>('Joko Susilo (PPIC)');
  const [formMaterialId, setFormMaterialId] = useState<string>(materials[0]?.id || '');
  const [formQtyNeeded, setFormQtyNeeded] = useState<number>(100);
  const [formUrgency, setFormUrgency] = useState<'Normal' | 'Urgent' | 'Critical'>('Urgent');
  const [formLaneId, setFormLaneId] = useState<string>('lane-1');
  const [formReason, setFormReason] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered List
  const filteredShortages = useMemo(() => {
    return shortages.filter((ticket) => {
      if (activeStatus !== 'all' && ticket.status !== activeStatus) return false;
      if (urgencyFilter !== 'all' && ticket.urgency !== urgencyFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          ticket.ticketNumber.toLowerCase().includes(q) ||
          ticket.materialCode.toLowerCase().includes(q) ||
          ticket.materialName.toLowerCase().includes(q) ||
          ticket.requesterName.toLowerCase().includes(q) ||
          ticket.reason.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [shortages, activeStatus, urgencyFilter, searchQuery]);

  // Aggregate Metrics
  const pendingCount = shortages.filter((s) => s.status === 'Pending' || s.status === 'In Review').length;
  const urgentCount = shortages.filter((s) => s.urgency === 'Urgent' || s.urgency === 'Critical').length;
  const poCreatedCount = shortages.filter((s) => s.status === 'PO Created').length;

  const handleOpenModal = () => {
    const defaultMat = materials[0];
    setFormRequesterRole('ppic');
    setFormRequesterName('Joko Susilo (PPIC)');
    setFormMaterialId(defaultMat?.id || '');
    setFormQtyNeeded(100);
    setFormUrgency('Urgent');
    setFormLaneId('lane-1');
    setFormReason('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formMaterialId) {
      setFormError('Material bahan baku wajib dipilih.');
      return;
    }

    if (formQtyNeeded <= 0) {
      setFormError('Kuantitas kebutuhan harus lebih dari 0.');
      return;
    }

    if (!formReason.trim()) {
      setFormError('Alasan kebutuhan / shortage wajib diisi secara rinci.');
      return;
    }

    const mat = materials.find((m) => m.id === formMaterialId);
    if (!mat) return;

    const newTicket: MaterialShortageTicket = {
      id: `pr-${Date.now()}`,
      ticketNumber: `PR-2026-11-${String(shortages.length + 1).padStart(3, '0')}`,
      requestedByRole: formRequesterRole,
      requesterName: formRequesterName,
      requestDate: '2026-11-06',
      materialId: mat.id,
      materialCode: mat.code,
      materialName: mat.name,
      qtyNeeded: formQtyNeeded,
      uom: mat.purchaseUom,
      urgency: formUrgency,
      status: 'In Review',
      laneId: formLaneId,
      reason: formReason,
    };

    onSaveShortage(newTicket);
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#ffffff] p-6 space-y-5">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#d5dce2] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0057d2] bg-[#ebf8ff] px-2 py-0.5 rounded-[4px] border border-[#0057d2]/20">
              FEAT-SH-01 · BRD F-15
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8d4b00] bg-[#fff6e5] px-2 py-0.5 rounded-[4px] border border-[#8d4b00]/30">
              PURCHASE REQUISITION & SHORTAGE
            </span>
          </div>
          <h1 className="text-[18px] font-bold text-[#000000] mt-1 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#0057d2]" />
            Laporan Kebutuhan Bahan (PR) & Tindak Lanjut Shortage
          </h1>
          <p className="text-[11px] text-[#545454] mt-0.5">
            Pelaporan kebutuhan mendesak dari lantai produksi dan PPIC untuk direspon cepat oleh divisi Purchasing melalui penerbitan PO Supplier.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="px-3.5 py-1.5 text-[11px] font-bold text-[#ffffff] bg-[#0057d2] hover:bg-[#0040b0] rounded-[4px] cursor-pointer inline-flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Input Kebutuhan Bahan (PR Baru)</span>
        </button>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#545454]">
            Total Tiket Kebutuhan
          </div>
          <div className="mt-1 text-[22px] font-bold text-[#000000] tabular-nums">
            {shortages.length} <span className="text-[12px] font-normal text-[#545454]">Tiket</span>
          </div>
          <div className="mt-1 text-[11px] text-[#475e75]">Kebutuhan lintas divisi</div>
        </div>

        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#545454]">
            Menunggu Tindak Lanjut
          </div>
          <div className={`mt-1 text-[22px] font-bold tabular-nums ${pendingCount > 0 ? 'text-[#8d4b00]' : 'text-[#10683b]'}`}>
            {pendingCount} <span className="text-[12px] font-normal text-[#545454]">Permintaan</span>
          </div>
          <div className="mt-1 text-[11px] text-[#475e75]">Perlu review Purchasing</div>
        </div>

        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#545454]">
            Kategori Urgent / Kritis
          </div>
          <div className={`mt-1 text-[22px] font-bold tabular-nums ${urgentCount > 0 ? 'text-[#d32f2f]' : 'text-[#10683b]'}`}>
            {urgentCount} <span className="text-[12px] font-normal text-[#545454]">Tiket</span>
          </div>
          <div className="mt-1 text-[11px] text-[#475e75]">Mempengaruhi kuota SPK lini</div>
        </div>

        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#545454]">
            Sudah Terbit PO Supplier
          </div>
          <div className="mt-1 text-[22px] font-bold text-[#10683b] tabular-nums">
            {poCreatedCount} <span className="text-[12px] font-normal text-[#545454]">Tiket</span>
          </div>
          <div className="mt-1 text-[11px] text-[#475e75]">Telah diproses ke PO</div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px]">
        {/* Status Filter */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'all', label: 'Semua Status' },
            { id: 'In Review', label: 'Dalam Review' },
            { id: 'Pending', label: 'Pending' },
            { id: 'PO Created', label: 'Sudah Terbit PO' },
            { id: 'Resolved', label: 'Tuntas' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveStatus(tab.id)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-[4px] cursor-pointer transition-colors whitespace-nowrap ${
                activeStatus === tab.id
                  ? 'bg-[#ffffff] text-[#0057d2] border border-[#d5dce2] shadow-xs'
                  : 'text-[#545454] hover:text-[#000000] hover:bg-[#eaecee]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Urgency Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#545454] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari Tiket, Material, Pelapor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] w-[200px] focus:outline-none focus:border-[#0057d2]"
            />
          </div>

          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-2.5 py-1 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
          >
            <option value="all">Semua Urgensi</option>
            <option value="Normal">Normal</option>
            <option value="Urgent">Urgent</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* 4. Table of Shortage Tickets */}
      <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden bg-[#ffffff]">
        <div className="px-4 py-2.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
          <div className="text-[11px] font-bold text-[#000000] uppercase tracking-wider">
            Daftar Tiket Permintaan Bahan ({filteredShortages.length})
          </div>
          <span className="text-[10px] text-[#545454]">
            Terintegrasi lintas bagian: PPIC, Produksi, dan Purchasing
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px] border-collapse">
            <thead className="bg-[#ffffff] border-b border-[#d5dce2] text-[10px] font-bold text-[#545454] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">No. Tiket PR</th>
                <th className="py-2.5 px-3">Pelapor / Divisi</th>
                <th className="py-2.5 px-3">Material Bahan Baku</th>
                <th className="py-2.5 px-3 text-right">Kuantitas</th>
                <th className="py-2.5 px-3 text-center">Urgensi</th>
                <th className="py-2.5 px-4">Alasan & Konteks</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Aksi Purchasing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaecee]">
              {filteredShortages.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[12px] text-[#545454]">
                    Tidak ada tiket kekurangan material yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredShortages.map((t) => (
                  <tr key={t.id} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-[#0057d2] text-[11px]">{t.ticketNumber}</div>
                      <div className="text-[10px] text-[#545454] mt-0.5">{formatIndoDate(t.requestDate)}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-[#000000] text-[11px]">{t.requesterName}</div>
                      <div className="text-[10px] text-[#545454] uppercase font-mono">{t.requestedByRole}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-[#0057d2] text-[11px]">{t.materialCode}</div>
                      <div className="text-[11px] text-[#354a5f]">{t.materialName}</div>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-[#000000]">
                      {t.qtyNeeded.toLocaleString('id-ID')} <span className="text-[10px] text-[#545454] font-normal">{t.uom}</span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {t.urgency === 'Critical' ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#fde8e8] text-[#d32f2f] border border-[#f8b4b4] rounded-[3px]">
                          CRITICAL
                        </span>
                      ) : t.urgency === 'Urgent' ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#fff6e5] text-[#8d4b00] border border-[#8d4b00]/30 rounded-[3px]">
                          URGENT
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 bg-[#f5f6f7] text-[#545454] border border-[#d5dce2] rounded-[3px]">
                          Normal
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-[11px] text-[#223548]">
                      <div>{t.reason}</div>
                      {t.laneId && <div className="text-[10px] text-[#545454] mt-0.5">Lini Produksi: {t.laneId}</div>}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {t.status === 'PO Created' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-[#edf7ed] text-[#10683b] border border-[#a5d6a7] rounded-[3px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>PO Terbit</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-[#ebf8ff] text-[#0057d2] border border-[#0057d2]/30 rounded-[3px] inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{t.status}</span>
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {t.status !== 'PO Created' && onOpenCreatePoFromShortage ? (
                        <button
                          type="button"
                          onClick={() => onOpenCreatePoFromShortage(t.materialId, t.qtyNeeded)}
                          className="px-2.5 py-1 text-[10px] font-bold text-[#ffffff] bg-[#0057d2] hover:bg-[#0040b0] rounded-[4px] cursor-pointer inline-flex items-center gap-1"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          <span>Terbitkan PO</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#545454] font-mono">
                          {t.poReferenceId || 'Diproses'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modal Input Kebutuhan Bahan (PR Baru) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#000000]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-xl w-full max-w-[550px] overflow-hidden">
            <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#0057d2] uppercase tracking-wider block">
                  Purchase Requisition Digital
                </span>
                <h3 className="text-[14px] font-bold text-[#000000] mt-0.5">
                  Input Laporan Kebutuhan / Shortage Bahan Baku
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#545454] hover:text-[#000000] rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 space-y-3.5 text-[12px]">
              {formError && (
                <div className="p-2.5 bg-[#fff6e5] border border-[#8d4b00]/30 rounded-[4px] text-[11px] text-[#8d4b00] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    Divisi Pelapor:
                  </label>
                  <select
                    value={formRequesterRole}
                    onChange={(e) => setFormRequesterRole(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  >
                    <option value="ppic">PPIC Planner</option>
                    <option value="admin_operasional">Admin Operasional / Produksi</option>
                    <option value="warehouse">Gudang Bahan Baku</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    Nama Penanggung Jawab:
                  </label>
                  <input
                    type="text"
                    value={formRequesterName}
                    onChange={(e) => setFormRequesterName(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#223548] mb-1">
                  Material Bahan Baku yang Dibutuhkan:
                </label>
                <select
                  value={formMaterialId}
                  onChange={(e) => setFormMaterialId(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code} — {m.name} ({m.purchaseUom})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    Kuantitas Dibutuhkan:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formQtyNeeded}
                    onChange={(e) => setFormQtyNeeded(parseInt(e.target.value, 10) || 0)}
                    required
                    className="w-full px-2.5 py-1.5 text-[11px] font-mono bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#223548] mb-1">
                    Tingkat Urgensi:
                  </label>
                  <select
                    value={formUrgency}
                    onChange={(e) => setFormUrgency(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent (Prioritas)</option>
                    <option value="Critical">Critical (Lini Terancam Stop)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#223548] mb-1">
                  Alasan Kebutuhan / Penyebab Shortage:
                </label>
                <textarea
                  rows={3}
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  required
                  placeholder="Misal: Penyesuaian kuota SPK darurat order Avanza atau hasil scrap berlebih pada proses dies changeover."
                  className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                />
              </div>

              <div className="pt-3 border-t border-[#d5dce2] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 text-[11px] font-semibold text-[#223548] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-[11px] font-bold text-[#ffffff] bg-[#0057d2] hover:bg-[#0040b0] rounded-[4px] cursor-pointer shadow-xs"
                >
                  Kirim Laporan Shortage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
