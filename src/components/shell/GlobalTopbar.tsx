/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Global Topbar Component (Tier 1 Chrome - 60px Height)
 */

import React, { useState, useRef, useEffect } from 'react';
import { RoleType } from '../../types/erp';
import { ROLES_METADATA } from '../../data/mockData';
import { Search, ChevronDown, Check, UserCircle, ShieldAlert } from 'lucide-react';

interface GlobalTopbarProps {
  activeRole: RoleType;
  onRoleChange: (role: RoleType) => void;
}

export const GlobalTopbar: React.FC<GlobalTopbarProps> = ({
  activeRole,
  onRoleChange,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentRoleInfo = ROLES_METADATA[activeRole];

  return (
    <header className="h-[60px] bg-[#f5f6f7] border-b border-[#d5dce2] px-6 flex items-center justify-between select-none shrink-0 z-30">
      {/* Zone 1: Brand & Wordmark */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2.5">
          {/* Logo mark */}
          <div className="w-8 h-8 bg-[#0057d2] text-white flex items-center justify-center font-bold text-sm tracking-wider">
            NT
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-[#000000] tracking-tight leading-tight">
              PT NUTECH PUNDI ARTA
            </span>
            <span className="text-[11px] font-medium text-[#545454] tracking-normal leading-none mt-0.5">
              Integrated Manufacturing ERP System
            </span>
          </div>
        </div>
      </div>

      {/* Zone 2: Visual Search Placeholder (Non-aktif / Read-Only per TBD Decision) */}
      <div className="hidden lg:flex items-center w-[400px] max-w-[420px]">
        <div className="relative w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#545454]"
            aria-hidden="true"
          />
          <input
            type="text"
            disabled
            placeholder="Pencarian dokumen, part, customer... (TBD)"
            className="w-full h-[36px] pl-9 pr-16 bg-[#ffffff] border border-[#d5dce2] text-[13px] text-[#545454] rounded-[8px] cursor-not-allowed opacity-90 focus:outline-none"
            title="Global Search is currently non-active (Pending Decision per BRD)"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-[#545454] bg-[#eaecee] px-1.5 py-0.5 rounded-[4px] border border-[#d5dce2]">
            TBD
          </span>
        </div>
      </div>

      {/* Zone 3: Interactive Role Switcher & User Profile Simulation */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#eaecee] text-[#354a5f] text-[11px] font-semibold tracking-wide rounded-[4px]">
          <span>PROTOTYPE UI</span>
          <span>·</span>
          <span>SIMULASI</span>
        </div>

        {/* Role Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 h-[38px] px-3 bg-[#ffffff] hover:bg-[#ebf8ff] border border-[#d5dce2] hover:border-[#0057d2] rounded-[8px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0057d2] focus:ring-offset-1 cursor-pointer"
            aria-expanded={dropdownOpen}
            aria-haspopup="listbox"
            aria-label="Ganti Role Simulasi"
          >
            <UserCircle className="w-4 h-4 text-[#0057d2] shrink-0" />
            <div className="text-left flex flex-col justify-center">
              <span className="text-[10px] uppercase font-bold text-[#545454] leading-none">
                Role Aktif
              </span>
              <span className="text-[13px] font-semibold text-[#000000] leading-tight truncate max-w-[140px]">
                {currentRoleInfo.badgeLabel}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#545454] shrink-0 ml-1" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              className="absolute right-0 mt-1.5 w-[310px] bg-[#ffffff] border border-[#475e75] shadow-lg rounded-[8px] py-1.5 z-50 text-[13px]"
              role="listbox"
            >
              <div className="px-3.5 py-2 border-b border-[#d5dce2] bg-[#f5f6f7]">
                <p className="font-bold text-[#000000] text-[12px] uppercase tracking-wider">
                  Role Switcher (Simulasi 7 Role)
                </p>
                <p className="text-[11px] text-[#545454] mt-0.5 leading-snug">
                  Pilih salah satu role untuk menguji tampilan dan navigasi sesuai hak akses BRD.
                </p>
              </div>

              <div className="py-1 max-h-[360px] overflow-y-auto">
                {(Object.keys(ROLES_METADATA) as RoleType[]).map((rKey) => {
                  const role = ROLES_METADATA[rKey];
                  const isSelected = activeRole === rKey;
                  return (
                    <button
                      key={rKey}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onRoleChange(rKey);
                        setDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-left flex items-start justify-between transition-colors ${
                        isSelected
                          ? 'bg-[#ebf8ff] text-[#0057d2]'
                          : 'hover:bg-[#f5f6f7] text-[#223548]'
                      }`}
                    >
                      <div className="flex flex-col pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[13px] text-[#000000]">
                            {role.title}
                          </span>
                          {role.isReadOnly && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#fff6e5] text-[#8d4b00] rounded-[4px] border border-[#d5dce2]">
                              READ ONLY
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#475e75] mt-0.5 leading-tight">
                          {role.department}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#0057d2] shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="px-3.5 py-2 border-t border-[#d5dce2] bg-[#f5f6f7] text-[11px] text-[#475e75]">
                <div className="flex items-center gap-1.5 text-[#8d4b00]">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>Tanpa autentikasi backend · Mode UI Mock</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
