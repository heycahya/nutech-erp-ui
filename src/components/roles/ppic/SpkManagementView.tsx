/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PPIC Module: SPK Management View (FEAT-SPK-01, BR-SPK-01 to BR-SPK-05, F-02)
 */

import React, { useState, useMemo } from 'react';
import {
  ProductionOrderSpk,
  ProductionLane,
  PartItem,
  SalesOrder,
} from '../../../types/erp';
import {
  Calendar,
  Layers,
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  X,
  FileText,
  Factory,
} from 'lucide-react';
import { validateSpkForm, calculateSpkTotalTarget, formatIndoDate } from '../../../utils/logic';

interface SpkManagementViewProps {
  spkOrders: ProductionOrderSpk[];
  lanes: ProductionLane[];
  parts: PartItem[];
  orders: SalesOrder[];
  onSaveSpk: (spk: ProductionOrderSpk) => void;
  onOpenCreateSpkModal?: () => void;
}

export const SpkManagementView: React.FC<SpkManagementViewProps> = ({
  spkOrders,
  lanes,
  parts,
  orders,
  onSaveSpk,
}) => {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLaneFilter, setSelectedLaneFilter] = useState('ALL');
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Modal states
  const [detailSpk, setDetailSpk] = useState<ProductionOrderSpk | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSpk, setEditingSpk] = useState<ProductionOrderSpk | null>(null);

  // Form State
  const [formSpkNumber, setFormSpkNumber] = useState('');
  const [formLaneId, setFormLaneId] = useState('lane-1');
  const [formPeriodMonth, setFormPeriodMonth] = useState('November');
  const [formPeriodYear, setFormPeriodYear] = useState('2026');
  const [formSoId, setFormSoId] = useState<string>('');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Draft' | 'Closed'>('Active');
  const [formItems, setFormItems] = useState<{ partId: string; targetPcsMonthly: number }[]>([
    { partId: 'PART-001', targetPcsMonthly: 50000 },
  ]);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Filtered SPK List
  const filteredSpks = useMemo(() => {
    return spkOrders.filter((spk) => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        spk.spkNumber.toLowerCase().includes(q) ||
        spk.laneName.toLowerCase().includes(q) ||
        (spk.soNumber && spk.soNumber.toLowerCase().includes(q)) ||
        (spk.customerName && spk.customerName.toLowerCase().includes(q)) ||
        spk.items.some(
          (it) =>
            it.partNumber.toLowerCase().includes(q) ||
            it.partDescription.toLowerCase().includes(q)
        );

      // Lane Filter
      const matchLane = selectedLaneFilter === 'ALL' || spk.laneId === selectedLaneFilter;

      // Period Filter
      const matchPeriod =
        selectedPeriodFilter === 'ALL' ||
        `${spk.periodMonth} ${spk.periodYear}` === selectedPeriodFilter;

      // Status Filter
      const matchStatus =
        selectedStatusFilter === 'ALL' || spk.status === selectedStatusFilter;

      return matchSearch && matchLane && matchPeriod && matchStatus;
    });
  }, [spkOrders, searchQuery, selectedLaneFilter, selectedPeriodFilter, selectedStatusFilter]);

  // Aggregate metrics
  const activeCount = spkOrders.filter((s) => s.status === 'Active').length;
  const draftCount = spkOrders.filter((s) => s.status === 'Draft').length;
  const totalTargetCommitment = spkOrders
    .filter((s) => s.status === 'Active')
    .reduce((sum, s) => sum + s.targetPcsTotal, 0);

  // Open Form for Create
  const handleOpenCreate = () => {
    setEditingSpk(null);
    setFormSpkNumber(`SPK-2026-11-L${spkOrders.length + 1}`);
    setFormLaneId('lane-1');
    setFormPeriodMonth('November');
    setFormPeriodYear('2026');
    setFormSoId('');
    setFormNotes('');
    setFormStatus('Active');
    setFormItems([{ partId: 'PART-001', targetPcsMonthly: 25000 }]);
    setFormErrors([]);
    setIsFormModalOpen(true);
  };

  // Open Form for Edit
  const handleOpenEdit = (spk: ProductionOrderSpk) => {
    setEditingSpk(spk);
    setFormSpkNumber(spk.spkNumber);
    setFormLaneId(spk.laneId);
    setFormPeriodMonth(spk.periodMonth);
    setFormPeriodYear(spk.periodYear);
    setFormSoId(spk.soId || '');
    setFormNotes(spk.notes || '');
    setFormStatus(spk.status);
    setFormItems(
      spk.items.map((it) => ({
        partId: it.partId,
        targetPcsMonthly: it.targetPcsMonthly,
      }))
    );
    setFormErrors([]);
    setIsFormModalOpen(true);
  };

  // Add Item Line in Form
  const handleAddItemLine = () => {
    const availablePart = parts.find(
      (p) => !formItems.some((fi) => fi.partId === p.id)
    ) || parts[0];
    setFormItems([...formItems, { partId: availablePart.id, targetPcsMonthly: 10000 }]);
  };

  // Remove Item Line
  const handleRemoveItemLine = (idx: number) => {
    if (formItems.length <= 1) return;
    setFormItems(formItems.filter((_, i) => i !== idx));
  };

  // Update Item Line
  const handleUpdateItemLine = (
    idx: number,
    field: 'partId' | 'targetPcsMonthly',
    val: string | number
  ) => {
    const updated = [...formItems];
    if (field === 'partId') {
      updated[idx].partId = String(val);
    } else {
      updated[idx].targetPcsMonthly = Math.max(0, Number(val) || 0);
    }
    setFormItems(updated);
  };

  // Handle Save Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateSpkForm({
      spkNumber: formSpkNumber,
      laneId: formLaneId,
      periodMonth: formPeriodMonth,
      periodYear: formPeriodYear,
      items: formItems,
    });

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    const selectedLaneObj = lanes.find((l) => l.id === formLaneId);
    const selectedSoObj = orders.find((o) => o.id === formSoId);

    const compiledItems = formItems.map((fi, i) => {
      const partObj = parts.find((p) => p.id === fi.partId);
      // Asumsi 26 hari kerja per bulan
      const dailyCalc = Math.round(fi.targetPcsMonthly / 26);
      return {
        id: editingSpk?.items[i]?.id || `spki-new-${Date.now()}-${i}`,
        partId: fi.partId,
        partNumber: partObj?.partNumber || 'PART-UNKNOWN',
        partDescription: partObj?.description || 'Part Komponen',
        targetPcsMonthly: fi.targetPcsMonthly,
        dailyTargetPcs: dailyCalc,
      };
    });

    const totalTarget = calculateSpkTotalTarget(compiledItems);

    const newSpk: ProductionOrderSpk = {
      id: editingSpk?.id || `spk-${Date.now()}`,
      spkNumber: formSpkNumber.trim(),
      laneId: formLaneId,
      laneName: selectedLaneObj?.name || 'Lane Manufaktur',
      periodMonth: formPeriodMonth,
      periodYear: formPeriodYear,
      status: formStatus,
      soId: formSoId || null,
      soNumber: selectedSoObj?.soNumber || null,
      customerName: selectedSoObj?.customerName || 'Alokasi Buffer Stock / Non-SO',
      orderType: selectedSoObj?.orderType || 'Rutin Bulanan',
      targetPcsTotal: totalTarget,
      createdAt: editingSpk?.createdAt || new Date().toISOString().split('T')[0],
      items: compiledItems,
      notes: formNotes,
    };

    onSaveSpk(newSpk);
    setIsFormModalOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#ffffff] text-[#223548]">
      {/* 1. Header & Metadata Banner */}
      <div className="p-4 bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#475e75]">
              PPIC & Perencanaan Produksi · BRD §5.2 & FEAT-SPK-01
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#eaf6ef] text-[#10683b] border border-[#10683b]/20 rounded-[4px]">
              ATURAN RESMI TERVERIFIKASI
            </span>
          </div>
          <h2 className="text-[17px] font-bold text-[#000000] mt-0.5">
            Surat Perintah Kerja (SPK) Bulanan per Lini Manufaktur
          </h2>
          <p className="text-[12px] text-[#475e75] mt-1 max-w-3xl leading-relaxed">
            SPK diterbitkan bulanan per lini produksi (Lane) dalam satuan resmi <strong>PCS</strong> (BR-SPK-03).
            Target harian dikunci dari operator lapangan (BR-SPK-05). Relasi Sales Order bersifat fleksibel (nullable per TBD-05).
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 h-[34px] px-3.5 bg-[#0057d2] hover:bg-[#0049b0] active:bg-[#00368a] text-white text-[13px] font-medium rounded-[4px] transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Terbitkan SPK Baru</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#475e75]">
            Total SPK Terbit
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-[#000000] tabular-nums">
              {spkOrders.length}
            </span>
            <span className="text-[11px] text-[#475e75]">Dokumen SPK</span>
          </div>
          <div className="mt-1 text-[11px] text-[#10683b] font-medium">
            {activeCount} Aktif · {draftCount} Draft
          </div>
        </div>

        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#475e75]">
            Target Komitmen Aktif
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-[#0057d2] tabular-nums">
              {totalTargetCommitment.toLocaleString('id-ID')}
            </span>
            <span className="text-[11px] text-[#475e75]">PCS</span>
          </div>
          <div className="mt-1 text-[11px] text-[#475e75]">
            Akumulasi 3 Lini Aktif (Nov 2026)
          </div>
        </div>

        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#475e75]">
            Lini Kerja Terkonfirmasi
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-[#10683b] tabular-nums">
              3 Lini
            </span>
            <span className="text-[11px] text-[#475e75]">dari 4 slot</span>
          </div>
          <div className="mt-1 text-[11px] text-[#475e75]">
            Lane 1 (Rubber), Lane 2 (Foam), Lane 3 (EVA)
          </div>
        </div>

        <div className="p-3.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#475e75]">
            Status Otorisasi Target
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[15px] font-bold text-[#10683b]">
            <Lock className="w-4 h-4 text-[#10683b]" />
            <span>Terkunci (PPIC Only)</span>
          </div>
          <div className="mt-1 text-[11px] text-[#475e75]">
            Operator tidak dapat mengubah angka (BR-SPK-05)
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Bar */}
      <div className="p-3 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Lane Filter */}
          <div className="flex items-center gap-1.5 text-[12px]">
            <span className="text-[#475e75] font-medium">Lini:</span>
            <select
              value={selectedLaneFilter}
              onChange={(e) => setSelectedLaneFilter(e.target.value)}
              className="h-[32px] px-2 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
            >
              <option value="ALL">Semua Lini</option>
              <option value="lane-1">Lane 1 (Rubber Cutting)</option>
              <option value="lane-2">Lane 2 (Foam Slicing)</option>
              <option value="lane-3">Lane 3 (EVA Die-cut)</option>
            </select>
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-1.5 text-[12px]">
            <span className="text-[#475e75] font-medium">Periode:</span>
            <select
              value={selectedPeriodFilter}
              onChange={(e) => setSelectedPeriodFilter(e.target.value)}
              className="h-[32px] px-2 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
            >
              <option value="ALL">Semua Periode</option>
              <option value="November 2026">November 2026</option>
              <option value="Desember 2026">Desember 2026</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-[12px]">
            <span className="text-[#475e75] font-medium">Status:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="h-[32px] px-2 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
            >
              <option value="ALL">Semua Status</option>
              <option value="Active">Aktif</option>
              <option value="Draft">Draft</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[280px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#475e75]" />
          <input
            type="text"
            placeholder="Cari No. SPK, Ref SO, Part, Pelanggan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[32px] pl-8 pr-3 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
          />
        </div>
      </div>

      {/* 4. Main SPK Table */}
      <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden bg-[#ffffff]">
        <div className="px-4 py-2.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0057d2]" />
            <h3 className="text-[13px] font-bold text-[#000000]">
              Daftar SPK Produksi Bulanan (Multi-Part Terjadwal)
            </h3>
          </div>
          <span className="text-[11px] text-[#475e75]">
            Menampilkan <strong>{filteredSpks.length}</strong> dari {spkOrders.length} SPK
          </span>
        </div>

        <table className="w-full text-left text-[13px] border-collapse">
          <thead className="bg-[#ffffff] border-b border-[#d5dce2] text-[11px] font-bold text-[#475e75] uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-4">No. SPK & Tgl Rilis</th>
              <th className="py-2.5 px-4">Lini Produksi</th>
              <th className="py-2.5 px-4">Periode</th>
              <th className="py-2.5 px-4">Part Terjadwal (Multi-Part)</th>
              <th className="py-2.5 px-4 text-right">Total Target (PCS)</th>
              <th className="py-2.5 px-4">Referensi SO & Tipe</th>
              <th className="py-2.5 px-4 text-center">Status SPK</th>
              <th className="py-2.5 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d5dce2]">
            {filteredSpks.map((spk) => (
              <tr key={spk.id} className="hover:bg-[#f5f6f7] transition-colors">
                <td className="py-3 px-4">
                  <div className="font-mono font-bold text-[#0057d2] text-[13px]">
                    {spk.spkNumber}
                  </div>
                  <div className="text-[11px] text-[#475e75]">
                    Rilis: {formatIndoDate(spk.createdAt)}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-[#000000]">{spk.laneName}</div>
                  <div className="text-[11px] text-[#475e75]">
                    {spk.laneId === 'lane-1' && 'Continuous Cutting EPDM'}
                    {spk.laneId === 'lane-2' && 'Horizontal Splitting Foam'}
                    {spk.laneId === 'lane-3' && 'Hydraulic Kiss-cutting EVA'}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#f5f6f7] text-[#223548] border border-[#d5dce2] rounded-[4px]">
                    {spk.periodMonth} {spk.periodYear}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="space-y-1">
                    {spk.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-[12px]">
                        <span className="font-mono font-bold text-[#223548]">
                          {item.partNumber}
                        </span>
                        <span className="text-[#475e75] truncate max-w-[180px]" title={item.partDescription}>
                          ({item.partDescription})
                        </span>
                        <span className="text-[11px] font-semibold text-[#0057d2] tabular-nums ml-auto">
                          {item.targetPcsMonthly.toLocaleString('id-ID')} PCS
                        </span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="text-[14px] font-bold text-[#000000] tabular-nums">
                    {spk.targetPcsTotal.toLocaleString('id-ID')} PCS
                  </div>
                  <div className="text-[11px] text-[#475e75]">
                    ~{Math.round(spk.targetPcsTotal / 26).toLocaleString('id-ID')} PCS / hari kerja
                  </div>
                </td>
                <td className="py-3 px-4">
                  {spk.soNumber ? (
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[#000000]">
                          {spk.soNumber}
                        </span>
                        {spk.orderType === 'Urgent' ? (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#fff6e5] text-[#8d4b00] border border-[#8d4b00]/30 rounded-[4px]">
                            URGENT
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-[#f5f6f7] text-[#475e75] border border-[#d5dce2] rounded-[4px]">
                            RUTIN
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#475e75] truncate max-w-[200px]">
                        {spk.customerName}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[12px] italic text-[#475e75]">
                        Non-SO (Buffer Stock)
                      </span>
                      <div className="text-[10px] text-[#475e75]">
                        Relasi TBD-05 Fallback
                      </div>
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  {spk.status === 'Active' && (
                    <span className="px-2 py-0.5 text-[11px] font-bold bg-[#eaf6ef] text-[#10683b] border border-[#10683b]/20 rounded-[4px]">
                      Aktif Berjalan
                    </span>
                  )}
                  {spk.status === 'Draft' && (
                    <span className="px-2 py-0.5 text-[11px] font-bold bg-[#fff6e5] text-[#8d4b00] border border-[#8d4b00]/30 rounded-[4px]">
                      Draft Perencanaan
                    </span>
                  )}
                  {spk.status === 'Closed' && (
                    <span className="px-2 py-0.5 text-[11px] font-bold bg-[#eaecee] text-[#354a5f] border border-[#d5dce2] rounded-[4px]">
                      Selesai (Closed)
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDetailSpk(spk)}
                      title="Lihat Rincian Lengkap SPK"
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#0057d2] hover:bg-[#ebf8ff] border border-[#d5dce2] rounded-[4px] transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detail</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(spk)}
                      title="Edit Parameter SPK"
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#223548] hover:bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#475e75]" />
                      <span>Edit</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredSpks.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#475e75] text-[13px]">
                  Tidak ada dokumen SPK yang memenuhi kriteria filter atau pencarian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 5. Detail SPK Modal Drawer */}
      {detailSpk && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-spk-title"
          className="fixed inset-0 z-50 bg-[#000000]/40 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0057d2]" />
                <h3 id="detail-spk-title" className="text-[14px] font-bold text-[#000000]">
                  Rincian Dokumen SPK: {detailSpk.spkNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailSpk(null)}
                className="p-1 text-[#475e75] hover:text-[#000000] rounded-[4px] cursor-pointer"
                aria-label="Tutup Detail SPK"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-[13px]">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px]">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#475e75]">Lini Produksi (Lane)</div>
                  <div className="font-bold text-[#000000]">{detailSpk.laneName}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#475e75]">Periode Perencanaan</div>
                  <div className="font-bold text-[#000000]">{detailSpk.periodMonth} {detailSpk.periodYear}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#475e75]">Referensi Sales Order</div>
                  <div className="font-bold text-[#0057d2]">
                    {detailSpk.soNumber || 'Non-SO (Buffer Stock)'}
                  </div>
                  {detailSpk.customerName && (
                    <div className="text-[11px] text-[#475e75]">{detailSpk.customerName}</div>
                  )}
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#475e75]">Status Dokumen SPK</div>
                  <div className="font-bold">
                    {detailSpk.status === 'Active' ? 'Aktif Berjalan' : detailSpk.status}
                  </div>
                  <div className="text-[10px] text-[#10683b] flex items-center gap-1 mt-0.5">
                    <Lock className="w-3 h-3" />
                    <span>Angka target terkunci dari operator lini (BR-SPK-05)</span>
                  </div>
                </div>
              </div>

              {/* Multi-Part Target Table */}
              <div>
                <h4 className="text-[12px] font-bold text-[#000000] uppercase tracking-wider mb-2">
                  Daftar Part Komponen & Kuota Produksi
                </h4>
                <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden">
                  <table className="w-full text-left text-[12px]">
                    <thead className="bg-[#f5f6f7] border-b border-[#d5dce2] text-[10px] font-bold text-[#475e75] uppercase">
                      <tr>
                        <th className="py-2 px-3">Part Number</th>
                        <th className="py-2 px-3">Deskripsi Komponen</th>
                        <th className="py-2 px-3 text-right">Target Bulanan</th>
                        <th className="py-2 px-3 text-right">Est. Target Harian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d5dce2]">
                      {detailSpk.items.map((it) => (
                        <tr key={it.id}>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#0057d2]">
                            {it.partNumber}
                          </td>
                          <td className="py-2.5 px-3 text-[#223548]">{it.partDescription}</td>
                          <td className="py-2.5 px-3 text-right font-bold tabular-nums">
                            {it.targetPcsMonthly.toLocaleString('id-ID')} PCS
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#475e75]">
                            ~{it.dailyTargetPcs.toLocaleString('id-ID')} PCS / hari
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-[#f5f6f7] border-t border-[#d5dce2] font-bold">
                      <tr>
                        <td colSpan={2} className="py-2 px-3 text-[11px] text-[#000000]">
                          Total Target SPK:
                        </td>
                        <td className="py-2 px-3 text-right text-[13px] text-[#0057d2] tabular-nums">
                          {detailSpk.targetPcsTotal.toLocaleString('id-ID')} PCS
                        </td>
                        <td className="py-2 px-3 text-right text-[11px] text-[#475e75] tabular-nums">
                          ~{Math.round(detailSpk.targetPcsTotal / 26).toLocaleString('id-ID')} PCS / hari
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {detailSpk.notes && (
                <div className="p-3 bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] text-[12px]">
                  <span className="font-bold text-[#000000]">Catatan Instruksi PPIC: </span>
                  <span className="text-[#475e75]">{detailSpk.notes}</span>
                </div>
              )}

              {/* Business Rule Notice */}
              <div className="p-2.5 bg-[#eaf6ef] border border-[#10683b]/20 rounded-[4px] text-[11px] text-[#10683b] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  Target harian SPK berlaku resmi sejak awal bulan (BR-SPK-04). Defisit aktual harian tidak otomatis menggeser target esok hari (BR-PR-02).
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-[#f5f6f7] border-t border-[#d5dce2] flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#223548] hover:bg-[#eaecee] border border-[#d5dce2] rounded-[4px] cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#475e75]" />
                <span>Cetak Lembar Kerja SPK</span>
              </button>
              <button
                type="button"
                onClick={() => setDetailSpk(null)}
                className="px-4 py-1.5 text-[12px] font-bold text-white bg-[#0057d2] hover:bg-[#0049b0] rounded-[4px] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Form Tambah / Edit SPK Modal */}
      {isFormModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="form-spk-title"
          className="fixed inset-0 z-50 bg-[#000000]/40 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0057d2]" />
                <h3 id="form-spk-title" className="text-[14px] font-bold text-[#000000]">
                  {editingSpk ? `Edit SPK: ${editingSpk.spkNumber}` : 'Penerbitan SPK Bulanan Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 text-[#475e75] hover:text-[#000000] rounded-[4px] cursor-pointer"
                aria-label="Tutup Form SPK"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveForm} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-5 overflow-y-auto space-y-4 text-[13px]">
                {/* Validation Errors */}
                {formErrors.length > 0 && (
                  <div className="p-3 bg-[#fff6e5] border border-[#8d4b00]/30 rounded-[4px] text-[12px] text-[#8d4b00] space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Validasi Input Gagal:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 pl-1">
                      {formErrors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Form Fields Grid */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#475e75] mb-1">
                      Nomor Dokumen SPK *
                    </label>
                    <input
                      type="text"
                      required
                      value={formSpkNumber}
                      onChange={(e) => setFormSpkNumber(e.target.value)}
                      placeholder="misal: SPK-2026-11-L1"
                      className="w-full h-[34px] px-3 font-mono text-[13px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#475e75] mb-1">
                      Lini Produksi (Lane) *
                    </label>
                    <select
                      value={formLaneId}
                      onChange={(e) => setFormLaneId(e.target.value)}
                      className="w-full h-[34px] px-3 text-[13px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
                    >
                      {lanes
                        .filter((l) => l.status === 'Active')
                        .map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#475e75] mb-1">
                      Periode Bulan & Tahun *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={formPeriodMonth}
                        onChange={(e) => setFormPeriodMonth(e.target.value)}
                        className="h-[34px] px-2 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
                      >
                        <option value="November">November</option>
                        <option value="Desember">Desember</option>
                        <option value="Januari">Januari</option>
                      </select>
                      <select
                        value={formPeriodYear}
                        onChange={(e) => setFormPeriodYear(e.target.value)}
                        className="h-[34px] px-2 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
                      >
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#475e75] mb-1">
                      Referensi Sales Order (TBD-05 Optional)
                    </label>
                    <select
                      value={formSoId}
                      onChange={(e) => setFormSoId(e.target.value)}
                      className="w-full h-[34px] px-2 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
                    >
                      <option value="">Non-SO (Buffer Stock Internal)</option>
                      {orders.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.soNumber} — {o.customerName} ({o.orderType})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status selector */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#475e75] mb-1">
                    Status SPK
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-[12px] cursor-pointer">
                      <input
                        type="radio"
                        name="spkStatus"
                        value="Active"
                        checked={formStatus === 'Active'}
                        onChange={() => setFormStatus('Active')}
                      />
                      <span>Aktif (Langsung berlaku — TBD-07 Fallback)</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-[12px] cursor-pointer">
                      <input
                        type="radio"
                        name="spkStatus"
                        value="Draft"
                        checked={formStatus === 'Draft'}
                        onChange={() => setFormStatus('Draft')}
                      />
                      <span>Draft Perencanaan</span>
                    </label>
                  </div>
                </div>

                {/* Line Items Builder (Multi-Part) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#475e75]">
                      Item Part Komponen & Target Bulanan (PCS) *
                    </label>
                    <button
                      type="button"
                      onClick={handleAddItemLine}
                      className="text-[11px] font-bold text-[#0057d2] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Part</span>
                    </button>
                  </div>

                  <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden">
                    <table className="w-full text-left text-[12px]">
                      <thead className="bg-[#f5f6f7] border-b border-[#d5dce2] text-[10px] font-bold text-[#475e75] uppercase">
                        <tr>
                          <th className="py-2 px-3">Part Komponen</th>
                          <th className="py-2 px-3 text-right w-[160px]">Target PCS Bulanan</th>
                          <th className="py-2 px-3 text-right w-[140px]">Est. Target Harian</th>
                          <th className="py-2 px-2 text-center w-[40px]">Hapus</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#d5dce2]">
                        {formItems.map((fi, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3">
                              <select
                                value={fi.partId}
                                onChange={(e) => handleUpdateItemLine(idx, 'partId', e.target.value)}
                                className="w-full h-[30px] px-2 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px]"
                              >
                                {parts.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.partNumber} — {p.description} ({p.category})
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2 px-3 text-right">
                              <input
                                type="number"
                                min={1}
                                step={100}
                                value={fi.targetPcsMonthly || ''}
                                onChange={(e) =>
                                  handleUpdateItemLine(idx, 'targetPcsMonthly', e.target.value)
                                }
                                className="w-full h-[30px] px-2 text-right font-mono font-bold text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px]"
                              />
                            </td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums text-[#475e75]">
                              ~{Math.round((fi.targetPcsMonthly || 0) / 26).toLocaleString('id-ID')} PCS
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                disabled={formItems.length <= 1}
                                onClick={() => handleRemoveItemLine(idx)}
                                className="text-[#8d4b00] hover:text-[#b30000] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                title="Hapus Baris Part"
                              >
                                <X className="w-4 h-4 mx-auto" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#475e75] mb-1">
                    Instruksi Produksi Khusus / Catatan
                  </label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="misal: Perhatikan kalibrasi pisau, alokasi shift 1 dan shift 2..."
                    className="w-full p-2.5 text-[12px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
                  />
                </div>
              </div>

              {/* Form Footer */}
              <div className="px-5 py-3 bg-[#f5f6f7] border-t border-[#d5dce2] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-1.5 text-[12px] font-medium text-[#223548] hover:bg-[#eaecee] border border-[#d5dce2] rounded-[4px] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-[12px] font-bold text-white bg-[#0057d2] hover:bg-[#0049b0] rounded-[4px] cursor-pointer shadow-sm"
                >
                  {editingSpk ? 'Simpan Perubahan SPK' : 'Terbitkan Dokumen SPK'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
