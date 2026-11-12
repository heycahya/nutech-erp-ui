import React, { useState } from 'react';
import {
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Package,
  Truck,
  Plus,
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  ArrowRight
} from 'lucide-react';
import { DeliveryOrder, FinishedGoodStock } from '../../../types/erp';
import { validateSjSourceLocation, evaluateBillingEligibility } from '../../../utils/logic';

interface SuratJalanManagementViewProps {
  deliveryOrders: DeliveryOrder[];
  fgStocks: FinishedGoodStock[];
  onOpenCreateModal: () => void;
  onOpenConfirmModal: (sj: DeliveryOrder) => void;
  onPrintSj: (sjId: string) => void;
}

export const SuratJalanManagementView: React.FC<SuratJalanManagementViewProps> = ({
  deliveryOrders,
  fgStocks,
  onOpenCreateModal,
  onOpenConfirmModal,
  onPrintSj,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Draft' | 'Printed' | 'Delivered'>('ALL');
  const [controlFilter, setControlFilter] = useState<'ALL' | 'Matched' | 'Exception'>('ALL');
  const [selectedSjId, setSelectedSjId] = useState<string>(deliveryOrders[0]?.id || '');
  const [printNotification, setPrintNotification] = useState<string | null>(null);

  const filteredOrders = deliveryOrders.filter((order) => {
    const matchesSearch =
      order.sjNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.soNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPoNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesControl = controlFilter === 'ALL' || order.controlStatus === controlFilter;
    return matchesSearch && matchesStatus && matchesControl;
  });

  const selectedSj = deliveryOrders.find((d) => d.id === selectedSjId) || filteredOrders[0];

  const handlePrint = (sjId: string, sjNumber: string) => {
    onPrintSj(sjId);
    setPrintNotification(`Surat Jalan ${sjNumber} berhasil dicetak. Status dokumen berubah menjadi "Printed". Persediaan FG belum berkurang.`);
    setTimeout(() => {
      setPrintNotification(null);
    }, 4500);
  };

  const getStatusBadge = (status: DeliveryOrder['status']) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Delivered
          </span>
        );
      case 'Printed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800 border border-blue-300">
            <Printer className="w-3 h-3 text-blue-600" />
            Printed
          </span>
        );
      case 'Draft':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            Draft
          </span>
        );
    }
  };

  const getControlBadge = (controlStatus: DeliveryOrder['controlStatus']) => {
    switch (controlStatus) {
      case 'Matched':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Matched
          </span>
        );
      case 'Exception':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded bg-rose-100 text-rose-800 border border-rose-300">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Exception
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
            Pengelolaan Surat Jalan (Delivery Order)
          </h2>
          <p className="text-sm text-zinc-600">
            Penerbitan dokumen pengiriman resmi, pelacakan fisik, audit lokasi sumber barang, dan konfirmasi penerimaan fisik pelanggan.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled
            title="Fitur ekspor PDF resmi dalam pengembangan"
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded border border-zinc-300 bg-zinc-100 text-zinc-400 cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            Export PDF (TBD)
          </button>
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-[#0057d2] hover:bg-[#0046a8] rounded shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            + Buat Surat Jalan Baru
          </button>
        </div>
      </div>

      {/* Disiplin Pengurangan Stok Notification / Banner */}
      {printNotification && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900 flex items-start gap-2.5 animate-fadeIn">
          <Printer className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{printNotification}</div>
        </div>
      )}

      <div className="p-3 bg-zinc-50 border border-zinc-200 rounded text-xs text-zinc-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-zinc-900 bg-zinc-200 px-1.5 py-0.5 rounded text-[11px]">
            ATURAN BR-DEL-02
          </span>
          <span>
            Status <strong>Draft</strong> dan <strong>Printed</strong> TIDAK mengurangi persediaan FG. Pengurangan stok hanya terjadi saat konfirmasi <strong>Delivered</strong> berdasarkan lembar fisik bertanda tangan.
          </span>
        </div>
        <span className="text-zinc-500 font-mono text-[11px]">Baseline Transaksi Terkunci</span>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari No. SJ, Pelanggan, No. SO, atau PO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0057d2] focus:border-[#0057d2]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center text-xs text-zinc-500 mr-1">Status:</div>
          <div className="inline-flex rounded border border-zinc-200 p-0.5 bg-zinc-50">
            {(['ALL', 'Draft', 'Printed', 'Delivered'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  statusFilter === st
                    ? 'bg-white text-zinc-900 font-bold shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {st === 'ALL' ? 'Semua' : st}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-zinc-200 mx-1" />

          <div className="flex items-center text-xs text-zinc-500 mr-1">Kontrol:</div>
          <div className="inline-flex rounded border border-zinc-200 p-0.5 bg-zinc-50">
            {(['ALL', 'Matched', 'Exception'] as const).map((ctrl) => (
              <button
                key={ctrl}
                type="button"
                onClick={() => setControlFilter(ctrl)}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  controlFilter === ctrl
                    ? 'bg-white text-zinc-900 font-bold shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {ctrl === 'ALL' ? 'Semua' : ctrl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Split Pane: Left Table / Right Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: SJ List Table (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-3 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
              Daftar Surat Jalan ({filteredOrders.length})
            </span>
            <span className="text-xs text-zinc-500">Pilih baris untuk rincian dokumen</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-100 text-zinc-700 font-semibold border-b border-zinc-200">
                <tr>
                  <th className="py-2.5 px-3">No. SJ & Tanggal</th>
                  <th className="py-2.5 px-3">Pelanggan & No. SO</th>
                  <th className="py-2.5 px-3 text-right">Kuantitas</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Audit Lini</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500">
                      Tidak ada dokumen Surat Jalan yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((sj) => {
                    const isSelected = selectedSj?.id === sj.id;
                    const totalQty = sj.items.reduce((sum, it) => sum + it.qtyShipped, 0);
                    const partNumbers = sj.items.map((it) => it.partNumber);
                    const locAudit = validateSjSourceLocation(partNumbers, sj.sourceLocation);

                    return (
                      <tr
                        key={sj.id}
                        onClick={() => setSelectedSjId(sj.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/70 border-l-4 border-l-[#0057d2]' : 'hover:bg-zinc-50'
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-zinc-900">{sj.sjNumber}</div>
                          <div className="text-[11px] text-zinc-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-zinc-400" />
                            {sj.deliveryDate}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-zinc-900 truncate max-w-[180px]">
                            {sj.customerName}
                          </div>
                          <div className="text-[11px] text-zinc-500 font-mono">
                            SO: {sj.soNumber}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="font-bold text-zinc-900 font-mono">
                            {totalQty.toLocaleString('id-ID')}
                          </div>
                          <div className="text-[11px] text-zinc-500">PCS</div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {getStatusBadge(sj.status)}
                            {getControlBadge(sj.controlStatus)}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {locAudit.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              <AlertTriangle className="w-3 h-3" />
                              {locAudit.validationStatus}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Selected SJ Detail & Verification Pane (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded border border-zinc-200 shadow-sm p-4 space-y-4">
          {selectedSj ? (
            (() => {
              const partNumbers = selectedSj.items.map((it) => it.partNumber);
              const locAudit = validateSjSourceLocation(partNumbers, selectedSj.sourceLocation);
              const billingCheck = evaluateBillingEligibility(selectedSj.status, selectedSj.controlStatus);
              const totalShipped = selectedSj.items.reduce((sum, it) => sum + it.qtyShipped, 0);

              return (
                <>
                  <div className="flex items-start justify-between pb-3 border-b border-zinc-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-zinc-900">{selectedSj.sjNumber}</span>
                        {getStatusBadge(selectedSj.status)}
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        Dibuat untuk {selectedSj.customerName}
                      </div>
                    </div>
                    {getControlBadge(selectedSj.controlStatus)}
                  </div>

                  {/* Operational & Audit Alerts */}
                  {!locAudit.isValid && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-800">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        Peringatan Audit Lokasi Sumber ({locAudit.validationStatus})
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        Data sumber tercatat sebagai <code>"{selectedSj.sourceLocation}"</code>. Berdasarkan lini manufaktur part yang dimuat, lokasi ini membutuhkan verifikasi fisik konsolidasi sebelum penerimaan final.
                      </p>
                    </div>
                  )}

                  {/* Document Metadata Grid */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-50 rounded border border-zinc-200 text-xs">
                    <div>
                      <span className="text-zinc-500 block text-[11px]">Tanggal Pengiriman</span>
                      <span className="font-semibold text-zinc-900">{selectedSj.deliveryDate}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[11px]">Nomor Referensi SO</span>
                      <span className="font-mono font-semibold text-zinc-900">{selectedSj.soNumber}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[11px]">PO Pelanggan</span>
                      <span className="font-mono text-zinc-900">{selectedSj.customerPoNumber}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[11px]">Armada & Driver</span>
                      <span className="text-zinc-900">
                        {selectedSj.vehicleNumber || 'B 9281 TZX'} ({selectedSj.driverName || 'Supir Logistik'})
                      </span>
                    </div>
                    <div className="col-span-2 border-t border-zinc-200 pt-2">
                      <span className="text-zinc-500 block text-[11px]">Lokasi Fisik Pengambilan</span>
                      <span className="font-medium text-zinc-900">{selectedSj.sourceLocation}</span>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">
                        Tervalidasi Sistem: <strong>{locAudit.displayLocation}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div>
                    <div className="text-xs font-bold text-zinc-800 mb-2 flex items-center justify-between">
                      <span>Rincian Barang yang Dimuat</span>
                      <span className="font-mono font-bold text-zinc-900">
                        Total: {totalShipped.toLocaleString('id-ID')} PCS
                      </span>
                    </div>
                    <div className="border border-zinc-200 rounded overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-zinc-100 text-zinc-600 font-semibold border-b border-zinc-200">
                          <tr>
                            <th className="py-1.5 px-2.5 text-left">Part Number</th>
                            <th className="py-1.5 px-2.5 text-left">Deskripsi</th>
                            <th className="py-1.5 px-2.5 text-right">Kuantitas</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                          {selectedSj.items.map((it, idx) => (
                            <tr key={idx} className="bg-white">
                              <td className="py-1.5 px-2.5 font-mono font-bold text-zinc-900">
                                {it.partNumber}
                              </td>
                              <td className="py-1.5 px-2.5 text-zinc-700">{it.partDescription}</td>
                              <td className="py-1.5 px-2.5 text-right font-mono font-bold text-zinc-900">
                                {it.qtyShipped.toLocaleString('id-ID')} PCS
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Physical Delivery Proof & Deduction Audit */}
                  <div className="p-3 bg-zinc-50 rounded border border-zinc-200 space-y-2 text-xs">
                    <div className="font-bold text-zinc-800 flex items-center justify-between">
                      <span>Status Mutasi Persediaan FG</span>
                      {selectedSj.deductedFromFg ? (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                          Sudah Terpotong dari FG
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-zinc-600 bg-zinc-200 px-2 py-0.5 rounded">
                          Belum Memotong Saldo FG
                        </span>
                      )}
                    </div>
                    {selectedSj.status === 'Delivered' ? (
                      <div className="space-y-1 text-zinc-600 text-[11px]">
                        <div>
                          <strong>Penerima Fisik:</strong> {selectedSj.recipientName || 'Bpk. Hendrawan (Receiving ADM)'}
                        </div>
                        <div>
                          <strong>Waktu Konfirmasi:</strong> {selectedSj.confirmedAt || '2026-11-04 14:30 WIB'}
                        </div>
                        <div>
                          <strong>Catatan Tanda Tangan:</strong> {selectedSj.proofOfDeliveryNotes || 'Surat Jalan asli bertanda tangan & cap basah tersimpan di arsip fisik logistik.'}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-zinc-600">
                        Dokumen ini belum berstatus Delivered. Saldo persediaan FG di {selectedSj.sourceLocation} masih utuh sampai konfirmasi penerimaan fisik dilakukan.
                      </p>
                    )}
                  </div>

                  {/* Billing Gate Info (BR-BIL-01) */}
                  <div className={`p-2.5 rounded border text-xs flex items-center justify-between ${
                    billingCheck.isEligible ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[11px]">Gerbang Penagihan (Billing Gate):</span>
                      <span className="text-[11px]">{billingCheck.reason}</span>
                    </div>
                    <span className="font-bold text-[11px] px-1.5 py-0.5 rounded uppercase">
                      {billingCheck.isEligible ? 'Memenuhi Syarat' : 'Terkunci'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-zinc-200 flex flex-wrap items-center gap-2">
                    {selectedSj.status === 'Draft' && (
                      <button
                        type="button"
                        onClick={() => handlePrint(selectedSj.id, selectedSj.sjNumber)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Cetak Lembar Surat Jalan (Print)
                      </button>
                    )}

                    {selectedSj.status === 'Printed' && (
                      <button
                        type="button"
                        onClick={() => onOpenConfirmModal(selectedSj)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-xs transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Konfirmasi Diterima Fisik (Delivered)
                      </button>
                    )}

                    {selectedSj.status === 'Delivered' && (
                      <div className="flex-1 p-2 text-center text-xs font-semibold text-emerald-800 bg-emerald-50 rounded border border-emerald-200 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Pengiriman Lengkap & Tervalidasi Fisik
                      </div>
                    )}

                    <button
                      type="button"
                      disabled
                      title="Penerbitan faktur tagihan dilakukan oleh Finance"
                      className="px-3 py-2 text-xs font-medium text-zinc-400 bg-zinc-100 rounded border border-zinc-200 cursor-not-allowed"
                    >
                      Proses Tagihan (Role Finance)
                    </button>
                  </div>
                </>
              );
            })()
          ) : (
            <div className="py-12 text-center text-zinc-400 text-xs">
              Pilih Surat Jalan untuk melihat rincian
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
