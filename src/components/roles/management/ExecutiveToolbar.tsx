/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Executive Dashboard Action Toolbar (Read-Only)
 * Menyediakan placeholder ekspor berstatus TBD nonaktif dan status kontrol eksekutif
 */

import React from 'react';
import { Download, RefreshCw, Shield, HelpCircle } from 'lucide-react';

export const ExecutiveToolbar: React.FC = () => {
  return (
    <div className="bg-[#f5f6f7] border border-[#d5dce2] rounded-[4px] p-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {/* Tombol Ekspor PDF Nonaktif (TBD) */}
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Fungsi ekspor PDF laporan direksi masih dalam status TBD (Pending Decision)"
          className="px-3 py-1.5 text-[11px] font-bold text-[#8c9ba5] bg-[#e2e8f0] border border-[#cbd5e1] rounded-[4px] cursor-not-allowed flex items-center gap-1.5 opacity-80"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Unduh Laporan Direksi (PDF) (TBD)</span>
        </button>

        <span className="text-[10px] text-[#545454] flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-[#8c9ba5]" />
          Format pelaporan direksi menunggu standarisasi template (TBD)
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-[10px] text-[#545454] flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[#10683b]" />
          <span>Data Integrity Engine: <strong>Active (Simulasi Frontend)</strong></span>
        </div>
      </div>
    </div>
  );
};
