import React, { useState } from 'react';
import {
  X,
  FilePlus,
  Truck,
  Building2,
  Calendar,
  AlertTriangle,
  Info,
  PackageCheck,
  Check
} from 'lucide-react';
import { SalesOrder, DeliveryOrder, FgLocationType } from '../../../types/erp';
import { validateSuratJalanDraft } from '../../../utils/logic';

interface CreateSuratJalanModalProps {
  isOpen: boolean;
  salesOrders: SalesOrder[];
  existingSjCount: number;
  onClose: () => void;
  onCreateSj: (newSj: DeliveryOrder) => void;
}

export const CreateSuratJalanModal: React.FC<CreateSuratJalanModalProps> = ({
  isOpen,
  salesOrders,
  existingSjCount,
  onClose,
  onCreateSj,
}) => {
  if (!isOpen) return null;

  // Generate next SJ Number e.g. SJ-2026-0093
  const nextSjNumber = `SJ-2026-${String(89 + existingSjCount).padStart(4, '0')}`;

  const [selectedSoId, setSelectedSoId] = useState<string>(salesOrders[0]?.id || '');
  const [deliveryDate, setDeliveryDate] = useState<string>('2026-11-05');
  const [sourceLocation, setSourceLocation] = useState<FgLocationType>('Ujung Lini Produksi');
  const [vehicleNumber, setVehicleNumber] = useState<string>('B 9821 TZX');
  const [driverName, setDriverName] = useState<string>('Ahmad Fauzi');
  const [errors, setErrors] = useState<string[]>([]);

  const selectedSo = salesOrders.find((so) => so.id === selectedSoId) || salesOrders[0];

  // Initialize draft quantities from selected SO items
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    if (selectedSo) {
      selectedSo.items.forEach((it) => {
        // Default to order quantity or 500
        init[it.partNumber] = Math.min(it.qtyOrdered, 1000);
      });
    }
    return init;
  });

  const handleSoChange = (soId: string) => {
    setSelectedSoId(soId);
    const so = salesOrders.find((s) => s.id === soId);
    if (so) {
      const updated: Record<string, number> = {};
      so.items.forEach((it) => {
        updated[it.partNumber] = Math.min(it.qtyOrdered, 1000);
      });
      setItemQuantities(updated);
    }
  };

  const handleQtyChange = (partNumber: string, value: number) => {
    setItemQuantities((prev) => ({
      ...prev,
      [partNumber]: Math.max(0, value),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    if (!selectedSo) {
      setErrors(['Sales Order wajib dipilih']);
      return;
    }

    const items = selectedSo.items.map((it) => ({
      partNumber: it.partNumber,
      partDescription: it.partDescription,
      qtyShipped: itemQuantities[it.partNumber] || 0,
    })).filter((it) => it.qtyShipped > 0);

    const validation = validateSuratJalanDraft({
      soId: selectedSo.id,
      deliveryDate,
      sourceLocation,
      items,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const newOrder: DeliveryOrder = {
      id: `sj-${Date.now()}`,
      sjNumber: nextSjNumber,
      soId: selectedSo.id,
      soNumber: selectedSo.soNumber,
      customerPoNumber: selectedSo.customerPoNumber,
      customerName: selectedSo.customerName,
      deliveryDate,
      status: 'Draft',
      controlStatus: 'Matched',
      sourceLocation,
      vehicleNumber,
      driverName,
      items,
      deductedFromFg: false, // Disiplin BR-DEL-02
    };

    onCreateSj(newOrder);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-lg border border-zinc-200 shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-[#0057d2] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FilePlus className="w-5 h-5 text-blue-200" />
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Penerbitan Draft Surat Jalan Baru
              </h3>
              <p className="text-xs text-blue-100">
                Alokasi pengiriman barang jadi terhadap pesanan penjualan (Sales Order)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-blue-200 hover:text-white hover:bg-blue-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errors.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Validasi Draft Pengiriman Gagal:
              </div>
              <ul className="list-disc list-inside text-[11px] space-y-0.5 pl-1">
                {errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Disiplin Mutasi Persediaan (BR-DEL-02):</strong> Pembuatan draft Surat Jalan tidak akan memotong persediaan Finished Goods. Pengurangan stok hanya dieksekusi saat lembar fisik bertanda tangan dikonfirmasi oleh penerima.
            </div>
          </div>

          {/* Grid Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                Nomor Surat Jalan (Auto)
              </label>
              <input
                type="text"
                disabled
                value={nextSjNumber}
                className="w-full px-3 py-1.5 text-xs bg-zinc-100 border border-zinc-300 rounded font-mono font-bold text-zinc-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                Tanggal Pengiriman <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                required
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0057d2] focus:border-[#0057d2]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                Referensi Sales Order (SO) <span className="text-rose-600">*</span>
              </label>
              <select
                value={selectedSoId}
                onChange={(e) => handleSoChange(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0057d2] focus:border-[#0057d2] bg-white font-medium"
              >
                {salesOrders.map((so) => (
                  <option key={so.id} value={so.id}>
                    {so.soNumber} — {so.customerName} ({so.items.length} item)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                Lokasi Sumber Pengambilan Fisik <span className="text-rose-600">*</span>
              </label>
              <select
                value={sourceLocation}
                onChange={(e) => setSourceLocation(e.target.value as FgLocationType)}
                className="w-full px-3 py-1.5 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0057d2] focus:border-[#0057d2] bg-white font-medium"
              >
                <option value="Ujung Lini Produksi">Ujung Lini Produksi (Area Line-End)</option>
                <option value="Gudang FG">Gudang FG (Warehouse Central)</option>
              </select>
              <span className="text-[10px] text-zinc-500 mt-0.5 block">
                Staging Area dilarang menjadi lokasi fisik resmi tanpa dasar BRD §5.5
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                Nomor Polisi Armada
              </label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="Contoh: B 9821 TZX"
                className="w-full px-3 py-1.5 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0057d2] focus:border-[#0057d2]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                Nama Driver / Supir Ekspedisi
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="Contoh: Ahmad Fauzi"
                className="w-full px-3 py-1.5 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0057d2] focus:border-[#0057d2]"
              />
            </div>
          </div>

          {/* Customer PO Info Banner */}
          {selectedSo && (
            <div className="p-3 bg-zinc-50 rounded border border-zinc-200 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-zinc-500 text-[11px] block">Pelanggan B2B</span>
                <span className="font-semibold text-zinc-900">{selectedSo.customerName}</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[11px] block">Nomor PO Pelanggan</span>
                <span className="font-mono font-semibold text-zinc-900">{selectedSo.customerPoNumber}</span>
              </div>
            </div>
          )}

          {/* Line Items Selection */}
          {selectedSo && (
            <div>
              <div className="font-bold text-zinc-800 mb-2 flex items-center justify-between">
                <span>Alokasi Kuantitas Part Dikirim</span>
                <span className="text-[11px] text-zinc-500 font-normal">
                  Masukkan jumlah PCS yang dimuat ke armada
                </span>
              </div>

              <div className="border border-zinc-200 rounded overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-zinc-100 text-zinc-700 font-semibold border-b border-zinc-200">
                    <tr>
                      <th className="py-2 px-3 text-left">Part Number</th>
                      <th className="py-2 px-3 text-left">Deskripsi Komponen</th>
                      <th className="py-2 px-3 text-right">Pesanan SO</th>
                      <th className="py-2 px-3 text-right">Terkirim (SO)</th>
                      <th className="py-2 px-3 text-right w-36">Qty Kirim (PCS)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {selectedSo.items.map((it) => (
                      <tr key={it.id} className="bg-white">
                        <td className="py-2 px-3 font-mono font-bold text-zinc-900">
                          {it.partNumber}
                        </td>
                        <td className="py-2 px-3 text-zinc-700">{it.partDescription}</td>
                        <td className="py-2 px-3 text-right font-mono text-zinc-600">
                          {it.qtyOrdered.toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-zinc-600">
                          {it.qtyDelivered.toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            max={it.qtyOrdered}
                            value={itemQuantities[it.partNumber] ?? 0}
                            onChange={(e) => handleQtyChange(it.partNumber, Number(e.target.value))}
                            className="w-28 px-2 py-1 text-right font-mono font-bold text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0057d2]"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 rounded hover:bg-zinc-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded text-white bg-[#0057d2] hover:bg-[#0046a8] shadow-sm transition-colors"
            >
              <PackageCheck className="w-4 h-4" />
              Simpan Draft Surat Jalan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
