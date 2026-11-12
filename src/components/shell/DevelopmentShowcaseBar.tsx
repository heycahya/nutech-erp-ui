/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Internal UI Evaluation / Developer Showcase Floating Toolbar
 * Disconnected from end-user ERP product chrome.
 * Dilengkapi kemampuan untuk disembunyikan sepenuhnya saat mode presentasi.
 */

import React, { useState } from 'react';
import { UiPatternType } from '../../types/erp';
import { ChevronUp, ChevronDown, Sliders, X, EyeOff } from 'lucide-react';

interface DevelopmentShowcaseBarProps {
  activePattern: UiPatternType['id'];
  onSelectPattern: (pattern: UiPatternType['id']) => void;
  onOpenConfirmModal: () => void;
}

export const DevelopmentShowcaseBar: React.FC<DevelopmentShowcaseBarProps> = ({
  activePattern,
  onSelectPattern,
  onOpenConfirmModal,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const PATTERNS: { id: UiPatternType['id']; label: string; desc: string }[] = [
    { id: 'data-table', label: '1. Enterprise Table', desc: 'Tabel data padat SAP-style dengan summary row' },
    { id: 'overview', label: '2. Overview KPI', desc: 'Executive metric cards & multi-track downstream' },
    { id: 'form-input', label: '3. Dense Form', desc: 'Input Sales Order dengan konversi Pack-to-PCS' },
    { id: 'split-pane', label: '4. Split-Pane Detail', desc: 'Master-detail view header & line items' },
    { id: 'modal-demo', label: '5. Modal Dialog', desc: 'Dialog konfirmasi potong stok FG Delivered' },
  ];

  const isCleanUrl = typeof window !== 'undefined' && (window.location.search.includes('clean=1') || window.location.search.includes('hide_qa=1'));
  const [isTotallyHidden, setIsTotallyHidden] = useState(isCleanUrl);

  if (isTotallyHidden) {
    return null;
  }

  // Saat mode presentasi minim (hanya tombol kecil atau dapat ditutup total)
  if (isHidden) {
    return (
      <div className="fixed bottom-[32px] right-4 z-40 flex items-center gap-1 bg-[#ffffff] border border-[#d5dce2] rounded-[4px] shadow-sm p-0.5">
        <button
          type="button"
          onClick={() => setIsHidden(false)}
          className="px-2 py-0.5 hover:bg-[#f5f6f7] text-[#545454] hover:text-[#0057d2] text-[10px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          title="Tampilkan Kembali Panel Evaluasi UI (DEV/QA Tool)"
          aria-label="Buka Panel Evaluasi UI Phase 01"
        >
          <Sliders className="w-3 h-3 text-[#0057d2]" />
          <span>Panel QA</span>
        </button>
        <button
          type="button"
          onClick={() => setIsTotallyHidden(true)}
          className="p-1 text-[#8c9ba5] hover:text-[#d32f2f] hover:bg-[#eaecee] rounded-[2px] cursor-pointer"
          title="Sembunyikan Total (Mode Presentasi)"
          aria-label="Tutup Panel QA Sepenuhnya"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="Panel Evaluasi Internal"
      className="fixed bottom-[36px] right-6 z-40 bg-[#ffffff] border border-[#0057d2]/40 rounded-[8px] shadow-md select-none transition-all duration-200"
      style={{ maxWidth: collapsed ? '260px' : '720px' }}
    >
      {/* Header bar */}
      <div className="px-3 py-1.5 bg-[#f5f6f7] border-b border-[#d5dce2] flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-[#0057d2]" />
          <span className="text-[11px] font-bold text-[#000000] uppercase tracking-wider">
            Evaluasi UI Phase 01
          </span>
          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#fff8e1] text-[#8d4b00] border border-[#d5dce2] rounded-[3px]">
            DEV / QA TOOL
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 text-[#545454] hover:text-[#000000] rounded hover:bg-[#eaecee] cursor-pointer"
            title={collapsed ? 'Perluas Kontrol Evaluasi' : 'Ciutkan Kontrol Evaluasi'}
            aria-label={collapsed ? 'Perluas Kontrol Evaluasi' : 'Ciutkan Kontrol Evaluasi'}
          >
            {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setIsHidden(true)}
            className="p-1 text-[#545454] hover:text-[#d32f2f] rounded hover:bg-[#eaecee] cursor-pointer"
            title="Sembunyikan Panel (Mode Presentasi Bersih)"
            aria-label="Sembunyikan Panel Evaluasi UI"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body: 5 Pattern Jump Buttons */}
      {!collapsed && (
        <div className="p-2.5 bg-[#ffffff] flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-[#545454] mr-1">Pola Uji:</span>
          {PATTERNS.map((p) => {
            const isActive = activePattern === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  if (p.id === 'modal-demo') {
                    onOpenConfirmModal();
                  } else {
                    onSelectPattern(p.id);
                  }
                }}
                title={p.desc}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-[4px] border transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#0057d2] text-[#ffffff] border-[#0057d2] font-semibold'
                    : 'bg-[#f5f6f7] text-[#223548] border-[#d5dce2] hover:bg-[#eaecee]'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
};
