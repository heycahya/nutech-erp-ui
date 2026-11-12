/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Executive Dashboard Header (BRD F-12, BR-ROL-01)
 * Menampilkan identitas eksekutif, status izin 100% read-only, dan asumsi shift simulasi
 */

import React from 'react';
import { ShieldCheck, Calendar, Clock, Building2 } from 'lucide-react';
import { formatIndoDate } from '../../../utils/logic';

export const ExecutiveHeader: React.FC = () => {
  const todayStr = '2026-11-04'; // Tanggal baseline simulasi

  return (
    <div className="bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#545454] flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#0057d2]" />
            PT Nutech Pundi Arta · Executive Board
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-[#edf7ed] text-[#10683b] border border-[#a5d6a7] rounded-[4px]">
            MODUL 1 · EXECUTIVE MANAGEMENT DASHBOARD (F-12)
          </span>
        </div>
        <h1 className="text-[18px] font-bold text-[#000000] mt-1 tracking-tight">
          Ringkasan Eksekutif Operasional Manufaktur
        </h1>
        <div className="flex flex-wrap items-center gap-4 mt-1.5 text-[11px] text-[#475e75]">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#545454]" />
            Periode: <strong>{formatIndoDate(todayStr)}</strong>
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] text-[#545454]">
            <Clock className="w-3.5 h-3.5 text-[#0057d2]" />
            <span>Asumsi Simulasi: <strong>Shift 1 (08:00 - 16:00 WIB)</strong></span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start md:self-auto">
        <div className="flex items-center gap-2 text-[11px] font-bold px-3 py-1.5 bg-[#fff8e1] text-[#8d4b00] border border-[#ffd54f] rounded-[4px] shadow-none">
          <ShieldCheck className="w-4 h-4 text-[#8d4b00]" />
          <span>HAK AKSES MURNI READ-ONLY (BR-ROL-01)</span>
        </div>
      </div>
    </div>
  );
};
