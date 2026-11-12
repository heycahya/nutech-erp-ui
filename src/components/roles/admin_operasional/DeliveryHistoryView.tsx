import React, { useState } from 'react';
import {
  History,
  Search,
  Calendar,
  Truck,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Download,
  Filter
} from 'lucide-react';
import { DeliveryOrder } from '../../../types/erp';

interface DeliveryHistoryViewProps {
  deliveryOrders: DeliveryOrder[];
}

export const DeliveryHistoryView: React.FC<DeliveryHistoryViewProps> = ({
  deliveryOrders,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Delivered' | 'Printed' | 'Draft'>('ALL');

  const filteredHistory = deliveryOrders.filter((order) => {
    const matchesSearch =
      order.sjNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.soNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.driverName && order.driverName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.vehicleNumber && order.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
            Riwayat Logistik & Pengiriman (Delivery History & Audit Trail)
          </h2>
          <p className="text-sm text-zinc-600">
            Log lengkap pergerakan armada pengiriman, bukti tanda tangan fisik pelanggan, dan riwayat mutasi persediaan barang jadi.
          </p>
        </div>
        <div>
          <button
            type="button"
            disabled
            title="Ekspor log audit dalam format spreadsheet dalam pengembangan"
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded border border-zinc-300 bg-zinc-100 text-zinc-400 cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Ekspor Log Pengiriman (TBD)
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded border border-zinc-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari No. SJ, Driver, No. Polisi, atau Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Filter Status:</span>
          <div className="inline-flex rounded border border-zinc-200 p-0.5 bg-zinc-50">
            {(['ALL', 'Delivered', 'Printed', 'Draft'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                  statusFilter === st
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {st === 'ALL' ? 'Semua' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
            Log Perjalanan Pengiriman ({filteredHistory.length} Arsip)
          </span>
          <span className="text-xs text-zinc-500">Mencatat bukti serah terima dokumen fisik</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-100 text-zinc-700 font-semibold border-b border-zinc-200">
              <tr>
                <th className="py-2.5 px-3">Tanggal & No. SJ</th>
                <th className="py-2.5 px-3">Pelanggan & SO</th>
                <th className="py-2.5 px-3">Muatan Part</th>
                <th className="py-2.5 px-3 text-right">Total PCS</th>
                <th className="py-2.5 px-3">Armada & Supir</th>
                <th className="py-2.5 px-3">Penerima & Tanda Tangan</th>
                <th className="py-2.5 px-3 text-center">Status Dokumen</th>
                <th className="py-2.5 px-3 text-center">Mutasi FG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredHistory.map((sj) => {
                const totalQty = sj.items.reduce((sum, it) => sum + it.qtyShipped, 0);

                return (
                  <tr key={sj.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-zinc-900">{sj.sjNumber}</div>
                      <div className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-400" />
                        {sj.deliveryDate}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-zinc-900">{sj.customerName}</div>
                      <div className="text-[11px] text-zinc-500 font-mono">SO: {sj.soNumber}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="space-y-0.5">
                        {sj.items.map((it, i) => (
                          <div key={i} className="text-[11px] text-zinc-700">
                            <span className="font-mono font-medium">{it.partNumber}</span>
                            <span className="text-zinc-500"> ({it.qtyShipped.toLocaleString('id-ID')} PCS)</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-900">
                      {totalQty.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-700">
                      <div className="font-medium text-zinc-900 flex items-center gap-1">
                        <Truck className="w-3 h-3 text-zinc-400" />
                        {sj.vehicleNumber || 'B 9281 TZX'}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        Supir: {sj.driverName || 'Supir Logistik'}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      {sj.status === 'Delivered' ? (
                        <div>
                          <div className="font-medium text-zinc-900">{sj.recipientName || 'Bpk. Hendrawan'}</div>
                          <div className="text-[11px] text-emerald-700 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            {sj.confirmedAt || 'Telah Diverifikasi Fisik'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic text-[11px]">
                          Menunggu tanda terima fisik
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        sj.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : sj.status === 'Printed'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {sj.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {sj.deductedFromFg ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Terpotong
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                          Belum Mutasi
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
