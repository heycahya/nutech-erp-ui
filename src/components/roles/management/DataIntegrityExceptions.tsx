/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Data Integrity Exceptions (Audit Anomali SO-2026-0043)
 * Menampilkan pengecualian integritas data secara profesional, proporsional, dan transparan
 */

import React from 'react';
import { AlertCircle, FileWarning } from 'lucide-react';

export const DataIntegrityExceptions: React.FC = () => {
  return (
    <div className="bg-[#fefcf8] border border-[#d5dce2] border-l-4 border-l-[#8d4b00] rounded-[4px] p-4 shadow-none space-y-3">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#fff8e1] text-[#8d4b00] rounded-[4px] shrink-0">
            <FileWarning className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-bold text-[#8d4b00] uppercase tracking-wider">
                Data Integrity Exceptions
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#fff8e1] text-[#8d4b00] border border-[#ffd54f] rounded-[4px]">
                Status: Unverified / Data Exception
              </span>
            </div>
            <div className="text-[11px] text-[#1a1a1a] mt-0.5">
              Dokumen: <strong className="font-mono text-[#0057d2]">SO-2026-0043</strong> · Pelanggan: <strong>PT Daya Nusantara Industri Auto</strong>
            </div>
          </div>
        </div>

        <div className="text-left md:text-right text-[10px] text-[#545454]">
          <span className="font-semibold text-[#8d4b00] block">Diisolasi dari KPI Resmi</span>
          <span>Tidak memengaruhi KPI Delivered (7.700 PCS) & Billed (2.500 PCS)</span>
        </div>
      </div>

      {/* 4 Pemisahan Data Audit Eksplisit */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Item 1 */}
        <div className="p-2.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#545454] block">
            Internal qtyDelivered
          </span>
          <span className="text-[14px] font-bold text-[#000000] tabular-nums mt-0.5 block">
            6.000 <span className="text-[10px] font-normal text-[#545454]">PCS</span>
          </span>
          <span className="text-[9px] text-[#545454]">Field item pesanan</span>
        </div>

        {/* Item 2 */}
        <div className="p-2.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#545454] block">
            Internal qtyBilled
          </span>
          <span className="text-[14px] font-bold text-[#000000] tabular-nums mt-0.5 block">
            6.000 <span className="text-[10px] font-normal text-[#545454]">PCS</span>
          </span>
          <span className="text-[9px] text-[#545454]">Field item pesanan</span>
        </div>

        {/* Item 3 */}
        <div className="p-2.5 bg-[#ffffff] border border-[#ffd54f]/70 bg-[#fffdfa] rounded-[4px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8d4b00] block">
            Verified Delivered dari SJ
          </span>
          <span className="text-[14px] font-bold text-[#8d4b00] tabular-nums mt-0.5 block">
            0 <span className="text-[10px] font-normal text-[#8d4b00]">PCS</span>
          </span>
          <span className="text-[9px] text-[#8d4b00]">Tidak ada record SJ</span>
        </div>

        {/* Item 4 */}
        <div className="p-2.5 bg-[#ffffff] border border-[#ffd54f]/70 bg-[#fffdfa] rounded-[4px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8d4b00] block">
            Verified Billed dari SJ Matched
          </span>
          <span className="text-[14px] font-bold text-[#8d4b00] tabular-nums mt-0.5 block">
            0 <span className="text-[10px] font-normal text-[#8d4b00]">PCS</span>
          </span>
          <span className="text-[9px] text-[#8d4b00]">Tidak ada dasar SJ matched</span>
        </div>
      </div>

      {/* Keterangan Penyebab */}
      <div className="pt-1 text-[11px] text-[#545454] flex items-center gap-1.5">
        <AlertCircle className="w-3.5 h-3.5 text-[#8d4b00] shrink-0" />
        <span>
          <strong>Penyebab:</strong> Tidak ditemukan record Surat Jalan pendukung dalam data simulasi INITIAL_DELIVERY_ORDERS.
        </span>
      </div>
    </div>
  );
};
