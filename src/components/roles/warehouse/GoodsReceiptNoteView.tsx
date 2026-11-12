import React, { useState } from 'react';
import {
  PackageCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Plus,
  Truck,
  FileText,
  AlertCircle,
  Download,
  Building2,
  Calendar,
  X,
  ShieldCheck,
} from 'lucide-react';
import {
  GoodsReceiptNote,
  PurchaseOrder,
  RawMaterial,
  StorageBinLocation,
} from '../../../types/erp';
import { validateGrnReceipt } from '../../../utils/logic';

interface GoodsReceiptNoteViewProps {
  grnList: GoodsReceiptNote[];
  purchaseOrders: PurchaseOrder[];
  materials: RawMaterial[];
  storageLocations: StorageBinLocation[];
  onSaveGrn: (newGrn: GoodsReceiptNote, isConfirmed: boolean) => void;
  onConfirmDraftGrn: (grnId: string) => void;
  initialCreatePoId?: string;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export const GoodsReceiptNoteView: React.FC<GoodsReceiptNoteViewProps> = ({
  grnList,
  purchaseOrders,
  materials,
  storageLocations,
  onSaveGrn,
  onConfirmDraftGrn,
  initialCreatePoId,
  isCreateModalOpen,
  setIsCreateModalOpen,
}) => {
  const [selectedGrnId, setSelectedGrnId] = useState<string>(grnList[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'All' | 'Confirmed' | 'Draft'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State for Create GRN
  const [selectedPoId, setSelectedPoId] = useState<string>(initialCreatePoId || '');
  const [doNumber, setDoNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [receivedDate, setReceivedDate] = useState('2026-11-08');
  const [notes, setNotes] = useState('');
  const [receiptItems, setReceiptItems] = useState<
    {
      poItemId: string;
      materialId: string;
      materialCode: string;
      materialName: string;
      qtyOrdered: number;
      qtyPreviouslyReceived: number;
      qtyReceivedNow: number;
      purchaseUom: string;
      storageLocation: string;
      condition: 'Good' | 'Damaged' | 'QC Sample Pending';
    }[]
  >([]);
  const [formError, setFormError] = useState<string | null>(null);

  // When PO changes in modal, auto-populate items
  const handleSelectPo = (poId: string) => {
    setSelectedPoId(poId);
    setFormError(null);
    const po = purchaseOrders.find((p) => p.id === poId);
    if (po) {
      const items = po.items.map((poi) => {
        const remaining = Math.max(0, poi.qtyOrdered - (poi.qtyReceivedGrn || 0));
        const mat = materials.find((m) => m.id === poi.materialId || m.code === poi.materialCode);
        return {
          poItemId: poi.id,
          materialId: poi.materialId,
          materialCode: poi.materialCode,
          materialName: poi.materialName,
          qtyOrdered: poi.qtyOrdered,
          qtyPreviouslyReceived: poi.qtyReceivedGrn || 0,
          qtyReceivedNow: remaining, // default full remaining receipt
          purchaseUom: poi.purchaseUom,
          storageLocation: mat?.storageLocation || 'Gudang Material Rak A-01',
          condition: 'Good' as const,
        };
      });
      setReceiptItems(items);
    } else {
      setReceiptItems([]);
    }
  };

  const handleOpenModal = (poId?: string) => {
    setFormError(null);
    const targetPoId = poId || purchaseOrders.find((p) => p.grnStatus !== 'Fully Received')?.id || '';
    handleSelectPo(targetPoId);
    setDoNumber(`SJ-SUPP-${Math.floor(1000 + Math.random() * 9000)}`);
    setVehicleNumber('B 9481 UIK');
    setDriverName('Supir Armada Mitra');
    setReceivedDate('2026-11-08');
    setNotes('');
    setIsCreateModalOpen(true);
  };

  const handleSubmitModal = (isConfirmed: boolean) => {
    setFormError(null);
    const po = purchaseOrders.find((p) => p.id === selectedPoId);
    if (!po) {
      setFormError('Purchase Order (PO) wajib dipilih.');
      return;
    }

    if (!doNumber.trim()) {
      setFormError('Nomor Surat Jalan (DO) dari supplier wajib diisi.');
      return;
    }

    if (receiptItems.length === 0) {
      setFormError('Tidak ada item material yang dapat diterima pada PO ini.');
      return;
    }

    // Validate quantities
    for (const item of receiptItems) {
      const val = validateGrnReceipt(item.qtyOrdered, item.qtyPreviouslyReceived, item.qtyReceivedNow);
      if (!val.isValid) {
        setFormError(`${item.materialCode}: ${val.error}`);
        return;
      }
    }

    const newGrnNumber = `GRN-2026-${String(grnList.length + 890).padStart(4, '0')}`;
    const totalQty = receiptItems.reduce((acc, curr) => acc + curr.qtyReceivedNow, 0);

    const newGrn: GoodsReceiptNote = {
      id: `grn-${Date.now()}`,
      grnNumber: newGrnNumber,
      poId: po.id,
      poNumber: po.poNumber,
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      receivedDate,
      deliveryOrderNumber: doNumber.trim(),
      vehicleNumber: vehicleNumber.trim() || undefined,
      driverName: driverName.trim() || undefined,
      receivedBy: 'Bambang Hariyadi (Admin Gudang)',
      status: isConfirmed ? 'Confirmed' : 'Draft',
      totalQtyReceived: totalQty,
      notes: notes.trim() || (isConfirmed ? 'Penerimaan fisik barang diverifikasi lengkap di gudang.' : 'Dokumen Draft inspeksi sementara.'),
      items: receiptItems.map((item, idx) => ({
        id: `grni-${Date.now()}-${idx}`,
        poItemId: item.poItemId,
        materialId: item.materialId,
        materialCode: item.materialCode,
        materialName: item.materialName,
        qtyOrdered: item.qtyOrdered,
        qtyPreviouslyReceived: item.qtyPreviouslyReceived,
        qtyReceivedNow: item.qtyReceivedNow,
        purchaseUom: item.purchaseUom as any,
        storageLocation: item.storageLocation,
        condition: item.condition,
        notes: `Kondisi fisik: ${item.condition}`,
      })),
    };

    onSaveGrn(newGrn, isConfirmed);
    setIsCreateModalOpen(false);
    setSelectedGrnId(newGrn.id);
  };

  // Filtered GRNs
  const filteredGrns = grnList.filter((grn) => {
    if (activeTab === 'Confirmed' && grn.status !== 'Confirmed') return false;
    if (activeTab === 'Draft' && grn.status !== 'Draft') return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchGrn = grn.grnNumber.toLowerCase().includes(q);
      const matchPo = grn.poNumber.toLowerCase().includes(q);
      const matchSupp = grn.supplierName.toLowerCase().includes(q);
      const matchDo = grn.deliveryOrderNumber.toLowerCase().includes(q);
      if (!matchGrn && !matchPo && !matchSupp && !matchDo) return false;
    }
    return true;
  });

  const selectedGrn = grnList.find((g) => g.id === selectedGrnId) || filteredGrns[0];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8fafc]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#d5dce2]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#0057d2]/10 text-[#0057d2] border border-[#0057d2]/20 rounded-[4px]">
              FEAT-WH-01 · BRD F-06
            </span>
            <span className="text-[10px] font-semibold text-[#545454]">
              PENERIMAAN MATERIAL SUPPLIER (GRN)
            </span>
          </div>
          <h1 className="text-[20px] font-bold text-[#000000] tracking-tight">
            Goods Receipt Note (GRN) — Penerimaan Fisik Material Baku
          </h1>
          <p className="text-[12px] text-[#545454] mt-0.5">
            Pencatatan resmi penerimaan fisik material dari supplier berdasarkan PO. Seluruh penambahan saldo fisik on-hand wajib melalui GRN terkonfirmasi (BR-MAT-01).
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-[#ffffff] bg-[#0057d2] hover:bg-[#0046a8] border border-[#0057d2] rounded-[4px] shadow-sm transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          + Penerimaan Material Baru (GRN)
        </button>
      </div>

      {/* Governance & Rule Callout Banner */}
      <div className="p-3 bg-[#e8f1fb] border border-[#b8d5f5] rounded-[4px] text-[11px] text-[#223548] flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#0057d2] mt-0.5 shrink-0" />
        <div>
          <strong className="text-[#0057d2]">Aturan Bisnis Penerimaan Stok (BR-MAT-01 & NFR-04):</strong>{' '}
          Semua material supplier wajib masuk Gudang Bahan Baku terlebih dahulu melalui GRN resmi; tidak boleh langsung dikirim ke lini produksi.
          Status <em>Draft GRN</em> <strong>TIDAK</strong> menambah saldo stok. Saldo persediaan bertambah hanya saat status dikonfirmasi menjadi <strong>Confirmed</strong> melalui ledger append-only.
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-[#ffffff] p-1 border border-[#d5dce2] rounded-[4px]">
          <button
            onClick={() => setActiveTab('All')}
            className={`px-3 py-1 text-[11px] font-semibold rounded-[4px] transition-colors cursor-pointer ${
              activeTab === 'All'
                ? 'bg-[#0057d2] text-[#ffffff]'
                : 'text-[#545454] hover:bg-[#f5f6f7]'
            }`}
          >
            Semua GRN ({grnList.length})
          </button>
          <button
            onClick={() => setActiveTab('Confirmed')}
            className={`px-3 py-1 text-[11px] font-semibold rounded-[4px] transition-colors cursor-pointer ${
              activeTab === 'Confirmed'
                ? 'bg-[#0057d2] text-[#ffffff]'
                : 'text-[#545454] hover:bg-[#f5f6f7]'
            }`}
          >
            Confirmed ({grnList.filter((g) => g.status === 'Confirmed').length})
          </button>
          <button
            onClick={() => setActiveTab('Draft')}
            className={`px-3 py-1 text-[11px] font-semibold rounded-[4px] transition-colors cursor-pointer ${
              activeTab === 'Draft'
                ? 'bg-[#0057d2] text-[#ffffff]'
                : 'text-[#545454] hover:bg-[#f5f6f7]'
            }`}
          >
            Draft ({grnList.filter((g) => g.status === 'Draft').length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#545454]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari No. GRN, PO, Surat Jalan, Supplier..."
            className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
          />
        </div>
      </div>

      {/* Split Pane: Table Left (60%) & Detail Right (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table Pane */}
        <div className="lg:col-span-7 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] overflow-hidden shadow-xs">
          <div className="px-4 py-2.5 bg-[#f8fafc] border-b border-[#d5dce2] flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#000000]">
              Daftar Dokumen Goods Receipt Note ({filteredGrns.length} Ditemukan)
            </span>
            <span className="text-[10px] text-[#545454]">
              Klik baris untuk membuka detail verifikasi fisik
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-[#d5dce2] bg-[#f5f6f7] text-[#545454] font-semibold">
                  <th className="py-2.5 px-3">No. GRN & Tanggal</th>
                  <th className="py-2.5 px-3">Ref PO & Supplier</th>
                  <th className="py-2.5 px-3">Surat Jalan Supplier</th>
                  <th className="py-2.5 px-3 text-right">Total Diterima</th>
                  <th className="py-2.5 px-3 text-center">Status GRN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d5dce2]">
                {filteredGrns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#545454]">
                      Tidak ada dokumen GRN yang sesuai dengan kriteria filter.
                    </td>
                  </tr>
                ) : (
                  filteredGrns.map((grn) => {
                    const isSelected = selectedGrn?.id === grn.id;
                    const isConfirmed = grn.status === 'Confirmed';

                    return (
                      <tr
                        key={grn.id}
                        onClick={() => setSelectedGrnId(grn.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#e8f1fb] font-medium'
                            : 'hover:bg-[#f8fafc]'
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-[#0057d2] block">
                            {grn.grnNumber}
                          </span>
                          <span className="text-[10px] text-[#545454]">
                            {grn.receivedDate}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-medium text-[#000000] block">
                            {grn.poNumber}
                          </span>
                          <span className="text-[10px] text-[#545454] truncate max-w-[150px] block">
                            {grn.supplierName}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#223548]">
                          {grn.deliveryOrderNumber}
                          {grn.vehicleNumber && (
                            <span className="block text-[10px] text-[#545454]">
                              {grn.vehicleNumber}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#000000]">
                          {grn.totalQtyReceived.toLocaleString('id-ID')}{' '}
                          <span className="text-[10px] font-normal text-[#545454]">
                            {grn.items[0]?.purchaseUom || 'Unit'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-[4px] ${
                              isConfirmed
                                ? 'bg-[#00875a]/10 text-[#00875a] border border-[#00875a]/30'
                                : 'bg-[#e06c00]/10 text-[#e06c00] border border-[#e06c00]/30'
                            }`}
                          >
                            {isConfirmed ? 'Confirmed (Stok Masuk)' : 'Draft (Belum Masuk)'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Pane */}
        <div className="lg:col-span-5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] overflow-hidden shadow-xs">
          {selectedGrn ? (
            <div className="divide-y divide-[#d5dce2]">
              {/* Detail Header */}
              <div className="p-4 bg-[#f8fafc] flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#545454] uppercase tracking-wider">
                      Detail Verifikasi Fisik GRN
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-[4px] ${
                        selectedGrn.status === 'Confirmed'
                          ? 'bg-[#00875a]/10 text-[#00875a] border border-[#00875a]/30'
                          : 'bg-[#e06c00]/10 text-[#e06c00] border border-[#e06c00]/30'
                      }`}
                    >
                      {selectedGrn.status}
                    </span>
                  </div>
                  <h3 className="text-[16px] font-bold text-[#000000] mt-1">
                    {selectedGrn.grnNumber}
                  </h3>
                  <p className="text-[11px] text-[#545454]">
                    Referensi PO:{' '}
                    <span className="font-semibold text-[#0057d2]">
                      {selectedGrn.poNumber}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled
                    title="Format PDF Laporan GRN (TBD)"
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-[#545454] bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] opacity-75 cursor-not-allowed"
                  >
                    <Download className="w-3 h-3 text-[#545454]" />
                    PDF (TBD)
                  </button>
                </div>
              </div>

              {/* Status Stock Impact Banner */}
              <div
                className={`p-3 text-[11px] flex items-center justify-between ${
                  selectedGrn.status === 'Confirmed'
                    ? 'bg-[#00875a]/10 text-[#00875a] border-b border-[#00875a]/20'
                    : 'bg-[#e06c00]/10 text-[#e06c00] border-b border-[#e06c00]/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  {selectedGrn.status === 'Confirmed' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>
                    {selectedGrn.status === 'Confirmed'
                      ? 'Stok fisik telah sah ditambahkan ke persediaan dan tercatat di Ledger.'
                      : 'Status Draft: Saldo fisik TIDAK bertambah sampai dikonfirmasi.'}
                  </span>
                </div>

                {selectedGrn.status === 'Draft' && (
                  <button
                    onClick={() => onConfirmDraftGrn(selectedGrn.id)}
                    className="px-2.5 py-1 text-[10px] font-bold text-[#ffffff] bg-[#00875a] hover:bg-[#006f48] rounded-[4px] transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    Konfirmasi Sekarang
                  </button>
                )}
              </div>

              {/* Metadata Attributes */}
              <div className="p-4 space-y-3 text-[11px]">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#f0f2f5]">
                  <div>
                    <span className="text-[10px] text-[#545454] block">Nama Supplier:</span>
                    <span className="font-semibold text-[#000000]">
                      {selectedGrn.supplierName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#545454] block">Surat Jalan Supplier:</span>
                    <span className="font-semibold text-[#000000]">
                      {selectedGrn.deliveryOrderNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#545454] block">Tanggal Penerimaan:</span>
                    <span className="font-medium text-[#000000]">
                      {selectedGrn.receivedDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#545454] block">Petugas Penerima:</span>
                    <span className="font-medium text-[#000000]">
                      {selectedGrn.receivedBy}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#545454] block">Armada & Supir:</span>
                    <span className="text-[#000000]">
                      {selectedGrn.vehicleNumber || '-'} ({selectedGrn.driverName || 'Supir Supplier'})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#545454] block">Total Kuantitas:</span>
                    <span className="font-bold text-[#0057d2]">
                      {selectedGrn.totalQtyReceived.toLocaleString('id-ID')}{' '}
                      {selectedGrn.items[0]?.purchaseUom}
                    </span>
                  </div>
                </div>

                {/* Line Items Table */}
                <div>
                  <span className="text-[10px] font-bold text-[#545454] uppercase tracking-wider block mb-2">
                    Rincian Material Fisik yang Diterima ({selectedGrn.items.length} Baris):
                  </span>
                  <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-[#f5f6f7] text-[#545454] font-semibold border-b border-[#d5dce2]">
                        <tr>
                          <th className="py-1.5 px-2.5">Material</th>
                          <th className="py-1.5 px-2 text-right">Order</th>
                          <th className="py-1.5 px-2 text-right">Diterima</th>
                          <th className="py-1.5 px-2">Lokasi Rak</th>
                          <th className="py-1.5 px-2 text-center">Kondisi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0f2f5]">
                        {selectedGrn.items.map((item) => (
                          <tr key={item.id}>
                            <td className="py-2 px-2.5">
                              <span className="font-bold text-[#223548] block">
                                {item.materialCode}
                              </span>
                              <span className="text-[10px] text-[#545454] truncate max-w-[140px] block">
                                {item.materialName}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-right text-[#545454]">
                              {item.qtyOrdered.toLocaleString('id-ID')}
                            </td>
                            <td className="py-2 px-2 text-right font-bold text-[#00875a]">
                              {item.qtyReceivedNow.toLocaleString('id-ID')} {item.purchaseUom}
                            </td>
                            <td className="py-2 px-2 text-[10px] text-[#545454]">
                              {item.storageLocation}
                            </td>
                            <td className="py-2 px-2 text-center">
                              <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-[#00875a]/10 text-[#00875a] rounded-[4px]">
                                {item.condition}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notes */}
                {selectedGrn.notes && (
                  <div className="p-2.5 bg-[#f8fafc] border border-[#d5dce2] rounded-[4px]">
                    <span className="text-[10px] font-bold text-[#545454] block mb-0.5">
                      Catatan Fisik Pemeriksaan:
                    </span>
                    <p className="text-[11px] text-[#000000] italic">
                      "{selectedGrn.notes}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-[#545454]">
              Pilih salah satu dokumen GRN di sebelah kiri untuk melihat rincian fisik.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Buat / Input Penerimaan GRN Baru */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#000000]/50 flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-lg w-full max-w-2xl overflow-hidden animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-[#f8fafc] border-b border-[#d5dce2] flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-bold text-[#000000]">
                  Formulir Penerimaan Barang Gudang (Goods Receipt Note)
                </h3>
                <p className="text-[11px] text-[#545454]">
                  Verifikasi fisik material supplier terhadap dokumen Purchase Order resmi (FEAT-WH-01).
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#545454] hover:text-[#000000] p-1 rounded-[4px] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-[11px]">
              {formError && (
                <div className="p-2.5 bg-[#de350b]/10 border border-[#de350b]/30 rounded-[4px] text-[#de350b] text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Top Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-[#545454] mb-1">
                    PILIH PURCHASE ORDER (PO SUPPLIER) <span className="text-[#de350b]">*</span>
                  </label>
                  <select
                    value={selectedPoId}
                    onChange={(e) => handleSelectPo(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  >
                    <option value="">-- Pilih PO Terdaftar --</option>
                    {purchaseOrders.map((po) => (
                      <option key={po.id} value={po.id}>
                        {po.poNumber} — {po.supplierName} ({po.grnStatus})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#545454] mb-1">
                    NOMOR SURAT JALAN (DO) SUPPLIER <span className="text-[#de350b]">*</span>
                  </label>
                  <input
                    type="text"
                    value={doNumber}
                    onChange={(e) => setDoNumber(e.target.value)}
                    placeholder="Contoh: SJ-SKR-4890"
                    className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#545454] mb-1">
                    TANGGAL PENERIMAAN FISIK
                  </label>
                  <input
                    type="date"
                    value={receivedDate}
                    onChange={(e) => setReceivedDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#545454] mb-1">
                    NO. POLISI ARMADA & NAMA DRIVER
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      placeholder="Plat Truk"
                      className="w-full px-2 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                    />
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="Nama Supir"
                      className="w-full px-2 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                    />
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <label className="block text-[10px] font-bold text-[#545454] mb-1.5">
                  RINCIAN KUANTITAS FISIK YANG DITERIMA (PER BARIS ITEM PO)
                </label>
                {receiptItems.length === 0 ? (
                  <div className="p-4 bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] text-center text-[#545454]">
                    Pilih Purchase Order di atas untuk memuat daftar material yang harus diterima.
                  </div>
                ) : (
                  <div className="border border-[#d5dce2] rounded-[4px] overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-[#f5f6f7] text-[#545454] font-semibold border-b border-[#d5dce2]">
                        <tr>
                          <th className="py-2 px-2.5">Material</th>
                          <th className="py-2 px-2 text-right">Order</th>
                          <th className="py-2 px-2 text-right">Sudah GRN</th>
                          <th className="py-2 px-2 text-right w-28">Terima Sekarang *</th>
                          <th className="py-2 px-2">Kondisi Fisik</th>
                          <th className="py-2 px-2">Lokasi Rak</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0f2f5]">
                        {receiptItems.map((item, idx) => {
                          const remaining = Math.max(0, item.qtyOrdered - item.qtyPreviouslyReceived);

                          return (
                            <tr key={item.poItemId}>
                              <td className="py-2 px-2.5 font-medium text-[#223548]">
                                <span className="font-bold block">{item.materialCode}</span>
                                <span className="text-[10px] text-[#545454] block truncate max-w-[140px]">
                                  {item.materialName}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-right text-[#545454]">
                                {item.qtyOrdered} {item.purchaseUom}
                              </td>
                              <td className="py-2 px-2 text-right text-[#00875a]">
                                {item.qtyPreviouslyReceived} {item.purchaseUom}
                              </td>
                              <td className="py-2 px-2 text-right">
                                <input
                                  type="number"
                                  min="1"
                                  max={remaining}
                                  value={item.qtyReceivedNow}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...receiptItems];
                                    updated[idx].qtyReceivedNow = val;
                                    setReceiptItems(updated);
                                  }}
                                  className="w-full px-2 py-1 text-right text-[11px] font-bold bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                                />
                                <span className="text-[9px] text-[#545454] block">
                                  Maks: {remaining} {item.purchaseUom}
                                </span>
                              </td>
                              <td className="py-2 px-2">
                                <select
                                  value={item.condition}
                                  onChange={(e) => {
                                    const val = e.target.value as any;
                                    const updated = [...receiptItems];
                                    updated[idx].condition = val;
                                    setReceiptItems(updated);
                                  }}
                                  className="w-full px-1.5 py-1 text-[10px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px]"
                                >
                                  <option value="Good">Baik (Lolos)</option>
                                  <option value="QC Sample Pending">Sampel QC</option>
                                  <option value="Damaged">Cacat / Reject</option>
                                </select>
                              </td>
                              <td className="py-2 px-2">
                                <select
                                  value={item.storageLocation}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const updated = [...receiptItems];
                                    updated[idx].storageLocation = val;
                                    setReceiptItems(updated);
                                  }}
                                  className="w-full px-1.5 py-1 text-[10px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px]"
                                >
                                  {storageLocations.map((loc) => (
                                    <option key={loc.id} value={loc.name}>
                                      {loc.code} ({loc.name})
                                    </option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Notes Input */}
              <div>
                <label className="block text-[10px] font-bold text-[#545454] mb-1">
                  CATATAN PEMERIKSAAN KELAYAKAN FISIK (OPTIONAL)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan kondisi kemasan roll/sheet, segel supplier, hasil uji visual..."
                  className="w-full px-2.5 py-1.5 text-[11px] bg-[#ffffff] border border-[#d5dce2] rounded-[4px] focus:outline-none focus:border-[#0057d2]"
                />
              </div>

              {/* Two-action warning */}
              <div className="p-3 bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] text-[10px] text-[#545454]">
                <strong>Pilihan Otorisasi:</strong>
                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                  <li><strong>Simpan Draft:</strong> Dokumen disimpan untuk keperluan pengecekan loading dock; saldo on-hand fisik TIDAK berubah (BR-MAT-01).</li>
                  <li><strong>Konfirmasi Penerimaan:</strong> Saldo material on-hand langsung bertambah di ledger append-only dan status PO diperbarui.</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-[#f8fafc] border-t border-[#d5dce2] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-3 py-1.5 text-[11px] font-medium text-[#545454] hover:bg-[#eaecef] border border-[#d5dce2] rounded-[4px] transition-colors cursor-pointer"
              >
                Batal
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSubmitModal(false)}
                  className="px-3 py-1.5 text-[11px] font-semibold text-[#223548] bg-[#ffffff] hover:bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] transition-colors cursor-pointer"
                >
                  Simpan sebagai Draft GRN
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmitModal(true)}
                  className="px-3.5 py-1.5 text-[11px] font-semibold text-[#ffffff] bg-[#00875a] hover:bg-[#006f48] border border-[#00875a] rounded-[4px] shadow-sm transition-colors cursor-pointer"
                >
                  Konfirmasi Penerimaan Fisik (Update Stok)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
