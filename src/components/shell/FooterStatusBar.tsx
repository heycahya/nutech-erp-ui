/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Neutral Prototype Status Bar Footer (28px Height)
 */

import React from 'react';
import { RoleType } from '../../types/erp';
import { ROLES_METADATA } from '../../data/mockData';

interface FooterStatusBarProps {
  activeRole: RoleType;
}

export const FooterStatusBar: React.FC<FooterStatusBarProps> = ({ activeRole }) => {
  const roleInfo = ROLES_METADATA[activeRole];

  return (
    <footer className="h-[28px] bg-[#eaecee] border-t border-[#d5dce2] px-6 flex items-center justify-between text-[11px] text-[#545454] select-none shrink-0 z-20">
      <div className="flex items-center gap-3">
        <span className="font-semibold text-[#354a5f]">
          PT NUTECH PUNDI ARTA — MINI ERP PROTOTYPE
        </span>
        <span className="text-[#d5dce2]">|</span>
        <span>Mode: UI Verification (Frontend-Only)</span>
        <span className="text-[#d5dce2]">|</span>
        <span>Single Source of Truth: BRD v3.0</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[#475e75]">Simulasi User:</span>
          <span className="font-semibold text-[#000000]">{roleInfo.title}</span>
        </div>
        <span className="text-[#d5dce2]">|</span>
        <span className="font-mono text-[10px] text-[#475e75]">Baseline: 1440 × 900 Desktop</span>
      </div>
    </footer>
  );
};
