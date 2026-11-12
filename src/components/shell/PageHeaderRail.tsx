/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Context & Page Header Rail (Tier 2 Chrome)
 * Authentic ERP Header with Breadcrumbs, Title, and Contextual Actions.
 */

import React from 'react';
import { Plus, Download, ArrowLeft, Printer } from 'lucide-react';
import { UiPatternType } from '../../types/erp';

interface PageHeaderRailProps {
  breadcrumbs: string[];
  title: string;
  activePattern: UiPatternType['id'];
  selectedNavId?: string;
  onOpenCreateModal?: () => void;
  onNavigateBack?: () => void;
  isReadOnly?: boolean;
}

export const PageHeaderRail: React.FC<PageHeaderRailProps> = ({
  breadcrumbs,
  title,
  activePattern,
  selectedNavId,
  onOpenCreateModal,
  onNavigateBack,
  isReadOnly = false,
}) => {
  return (
    <div className="bg-[#ffffff] border-b border-[#d5dce2] px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 shrink-0">
      {/* Left: Breadcrumbs & Page Title */}
      <div className="flex flex-col gap-0.5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12px] text-[#545454]">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb}>
              <span className={idx === breadcrumbs.length - 1 ? 'text-[#000000] font-medium' : ''}>
                {crumb}
              </span>
              {idx < breadcrumbs.length - 1 && <span className="text-[#d5dce2]">/</span>}
            </React.Fragment>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <h1 className="text-[20px] font-semibold text-[#000000] tracking-tight leading-tight">
            {title}
          </h1>
          {isReadOnly && (
            <span className="text-[11px] font-bold px-2 py-0.5 bg-[#fff6e5] text-[#8d4b00] border border-[#d5dce2] rounded-[4px]">
              MODE READ-ONLY (BR-ROL-01)
            </span>
          )}
        </div>
      </div>

      {/* Right: Authentic Product Action Buttons (Contextual) */}
      <div className="flex items-center gap-2.5">
        {/* If in form input or split pane, offer clean back navigation */}
        {!isReadOnly && (activePattern === 'form-input' || activePattern === 'split-pane') && onNavigateBack && (
          <button
            type="button"
            onClick={onNavigateBack}
            className="flex items-center gap-1.5 h-[34px] px-3 text-[12px] font-medium text-[#223548] hover:text-[#000000] hover:bg-[#eaecee] border border-[#d5dce2] rounded-[6px] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Daftar</span>
          </button>
        )}

        {/* Print / Export Document action for detail view */}
        {!isReadOnly && activePattern === 'split-pane' && (
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 h-[34px] px-3 text-[12px] font-medium text-[#223548] hover:text-[#000000] hover:bg-[#eaecee] border border-[#d5dce2] rounded-[6px] transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Ringkasan SO</span>
          </button>
        )}

        {/* Read-only export report placeholder (TBD) */}
        {isReadOnly && (
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Format pelaporan direksi menunggu standarisasi template resmi (TBD)"
            className="flex items-center gap-1.5 h-[34px] px-3 text-[12px] font-medium text-[#8c9ba5] bg-[#f0f2f5] border border-[#d5dce2] rounded-[4px] cursor-not-allowed opacity-80"
          >
            <Download className="w-3.5 h-3.5 text-[#8c9ba5]" />
            <span>Unduh Laporan Direksi (PDF) (TBD)</span>
          </button>
        )}

        {/* Export Data action for table view */}
        {activePattern === 'data-table' && (!selectedNavId || selectedNavId === 'marketing-so-list') && (
          <button
            type="button"
            className="flex items-center gap-1.5 h-[34px] px-3 text-[12px] font-medium text-[#223548] hover:text-[#000000] hover:bg-[#eaecee] border border-[#d5dce2] rounded-[4px] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#545454]" />
            <span>Export Data</span>
          </button>
        )}

        {/* Primary Action Button (Input SO Baru) — Strictly hidden if read-only or not in SO list */}
        {!isReadOnly && activePattern === 'data-table' && (!selectedNavId || selectedNavId === 'marketing-so-list') && onOpenCreateModal && (
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 h-[34px] px-3.5 bg-[#0057d2] hover:bg-[#0049b0] active:bg-[#00368a] text-white text-[13px] font-medium rounded-[4px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0057d2] cursor-pointer shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Input SO Baru</span>
          </button>
        )}
      </div>
    </div>
  );
};
