/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sidebar Navigation Component (248px expanded / 64px collapsed)
 */

import React from 'react';
import { RoleType } from '../../types/erp';
import { ROLES_METADATA } from '../../data/mockData';
import {
  FileText,
  TrendingUp,
  Users,
  Box,
  Calendar,
  Layers,
  BarChart3,
  Sliders,
  Calculator,
  ShoppingCart,
  Truck,
  PackageCheck,
  ClipboardList,
  ArrowRightLeft,
  Settings,
  Factory,
  Send,
  FileCheck2,
  Receipt,
  CreditCard,
  PieChart,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Clock,
  History,
} from 'lucide-react';

export interface NavItemConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: 'neutral' | 'warning' | 'info';
}

export interface NavGroupConfig {
  groupTitle: string;
  items: NavItemConfig[];
}

interface SidebarNavProps {
  activeRole: RoleType;
  selectedNavId: string;
  onSelectNav: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeRole,
  selectedNavId,
  onSelectNav,
  collapsed,
  onToggleCollapse,
}) => {
  const roleInfo = ROLES_METADATA[activeRole];

  // Definisi navigasi terstruktur per role sesuai BRD
  const getRoleNavGroups = (role: RoleType): NavGroupConfig[] => {
    switch (role) {
      case 'marketing':
        return [
          {
            groupTitle: 'Sales Orders',
            items: [
              { id: 'marketing-so-list', label: 'Daftar Sales Order', icon: FileText, badge: 5 },
              { id: 'marketing-so-fulfillment', label: 'Status Pemenuhan Parsial', icon: TrendingUp },
            ],
          },
          {
            groupTitle: 'Master Komersial',
            items: [
              { id: 'marketing-customers', label: 'Master Customer B2B', icon: Users, badge: 5 },
              { id: 'marketing-parts', label: 'Katalog Part Komponen', icon: Box, badge: 6 },
            ],
          },
        ];

      case 'ppic':
        return [
          {
            groupTitle: 'Perencanaan Produksi',
            items: [
              { id: 'ppic-spk', label: 'SPK Bulanan per Lini', icon: Calendar, badge: 'Aktif' },
              { id: 'ppic-targets', label: 'Target Harian (PCS Terkunci)', icon: Layers },
              { id: 'ppic-gap', label: 'Monitoring Gap Produksi', icon: BarChart3 },
            ],
          },
          {
            groupTitle: 'Konfigurasi Lini',
            items: [
              { id: 'ppic-pack-ratio', label: 'Rasio Pack-to-PCS', icon: Sliders },
              { id: 'ppic-lanes', label: 'Master Lini Kerja (Lanes)', icon: Factory },
            ],
          },
        ];

      case 'purchasing':
        return [
          {
            groupTitle: 'Kebutuhan Bahan',
            items: [
              { id: 'purchasing-mrp', label: 'Simulasi MRP Demo', icon: Calculator },
              { id: 'purchasing-shortage', label: 'Laporan Kebutuhan (PR)', icon: ClipboardList, badge: '2 Tiket' },
              { id: 'purchasing-po', label: 'PO Supplier Bahan Baku', icon: ShoppingCart, badge: 3 },
              { id: 'purchasing-inbound', label: 'Monitoring Inbound Bahan', icon: Truck },
            ],
          },
          {
            groupTitle: 'Master Pengadaan',
            items: [
              { id: 'purchasing-suppliers', label: 'Master Supplier', icon: Users, badge: 4 },
              { id: 'purchasing-materials', label: 'Master Material & UoM', icon: Box, badge: 3 },
            ],
          },
        ];

      case 'warehouse':
        return [
          {
            groupTitle: 'Operasional Gudang',
            items: [
              { id: 'warehouse-monitoring', label: 'Monitoring Gudang', icon: BarChart3 },
              { id: 'warehouse-grn', label: 'Penerimaan Bahan (GRN)', icon: PackageCheck, badge: 3 },
              { id: 'warehouse-issue', label: 'Material Issue ke Lini', icon: ArrowRightLeft, badge: 3 },
            ],
          },
          {
            groupTitle: 'Persediaan & Ledger',
            items: [
              { id: 'warehouse-inventory', label: 'Saldo Stok & Lokasi Rak', icon: Box, badge: 3 },
              { id: 'warehouse-ledger', label: 'Kartu Stok Ledger Material', icon: ClipboardList },
              { id: 'warehouse-adj', label: 'Penyesuaian Stok (Adjustment)', icon: Settings },
            ],
          },
        ];

      case 'admin_operasional':
        // PERHATIAN: 2 Modul Terpisah sesuai BRD Section 4 & BR-ROL-02 / BR-ROL-03
        return [
          {
            groupTitle: 'MODUL PRODUKSI (Lantai Lini)',
            items: [
              { id: 'prod-monitoring', label: 'Monitoring Produksi Lini', icon: BarChart3 },
              { id: 'prod-daily-report', label: 'Laporan & Input Aktual Harian', icon: Factory },
              { id: 'prod-history', label: 'Riwayat & Log Produksi Shift', icon: History },
              { id: 'prod-downtime', label: 'Monitoring Downtime & OEE', icon: Clock },
              { id: 'prod-fg-stocks', label: 'Stok Multi-Lokasi Finished Goods', icon: Layers },
            ],
          },
          {
            groupTitle: 'MODUL PENGIRIMAN (Surat Jalan)',
            items: [
              { id: 'del-monitoring', label: 'Monitoring Pengiriman', icon: Truck },
              { id: 'del-sj-list', label: 'Pengelolaan Surat Jalan (SJ)', icon: Send, badge: 4 },
              { id: 'del-so-matching', label: 'Pencocokan SO & Tagihan', icon: ShieldCheck },
              { id: 'del-history', label: 'Riwayat & Log Pengiriman', icon: History },
            ],
          },
        ];

      case 'finance':
        return [
          {
            groupTitle: 'Dashboard & Ringkasan',
            items: [
              { id: 'fin-dashboard', label: 'Dashboard Keuangan & AR', icon: Receipt },
            ],
          },
          {
            groupTitle: 'Kontrol Surat Jalan & Penagihan',
            items: [
              { id: 'fin-ready-to-bill', label: 'Surat Jalan Siap Tagih', icon: FileCheck2, badge: '2 SJ' },
              { id: 'fin-invoice-list', label: 'Manajemen Faktur (Invoice)', icon: FileText, badge: 1 },
            ],
          },
          {
            groupTitle: 'Manajemen Piutang (AR)',
            items: [
              { id: 'fin-ar-tracking', label: 'Pelacakan Piutang Dagang', icon: CreditCard },
              { id: 'fin-ar-aging', label: 'AR Aging & Jatuh Tempo', icon: Clock },
            ],
          },
        ];

      case 'management':
        return [
          {
            groupTitle: 'Executive Monitoring (Read-Only)',
            items: [
              { id: 'mgmt-kpi', label: 'Executive Dashboard KPI', icon: PieChart },
              { id: 'mgmt-prod-gap', label: 'Monitoring Produksi Lini', icon: BarChart3 },
              { id: 'mgmt-stock-val', label: 'Valuasi Stok Material & FG', icon: Layers },
              { id: 'mgmt-ar-aging', label: 'Aging Piutang AR', icon: CreditCard },
            ],
          },
        ];

      default:
        return [];
    }
  };

  const navGroups = getRoleNavGroups(activeRole);

  return (
    <aside
      className={`bg-[#ffffff] border-r border-[#d5dce2] flex flex-col justify-between shrink-0 transition-all duration-200 z-20 ${
        collapsed ? 'w-[64px]' : 'w-[248px]'
      }`}
    >
      {/* Top: Role Identity Box & Nav Items */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Role Identity Tag */}
        <div className="p-3 border-b border-[#d5dce2] bg-[#f5f6f7]">
          {!collapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#475e75]">
                  {roleInfo.department}
                </span>
                <span className="text-[13px] font-bold text-[#000000] truncate">
                  {roleInfo.badgeLabel}
                </span>
              </div>
              {roleInfo.isReadOnly && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#fff6e5] text-[#8d4b00] border border-[#d5dce2] rounded-[4px] shrink-0">
                  READ ONLY
                </span>
              )}
            </div>
          ) : (
            <div className="flex justify-center" title={`${roleInfo.badgeLabel} (${roleInfo.department})`}>
              <div className="w-8 h-8 rounded-[6px] bg-[#eaecee] text-[#0057d2] font-bold flex items-center justify-center text-[12px]">
                {roleInfo.badgeLabel.substring(0, 2).toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* Nav Groups */}
        <div className="py-2 space-y-4">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="px-2">
              {!collapsed && (
                <h3 className="px-2.5 mb-1.5 text-[10px] font-bold tracking-wider text-[#545454] uppercase">
                  {group.groupTitle}
                </h3>
              )}
              {collapsed && (
                <div className="w-8 mx-auto my-1 border-t border-[#d5dce2]" />
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isSelected = selectedNavId === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectNav(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-[13px] font-normal transition-colors relative cursor-pointer ${
                        isSelected
                          ? 'bg-[#ebf8ff] text-[#0057d2] font-semibold'
                          : 'text-[#223548] hover:bg-[#f5f6f7] hover:text-[#000000]'
                      }`}
                    >
                      {/* Active indicator bar */}
                      {isSelected && (
                        <span
                          className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#0057d2] rounded-r-[2px]"
                          aria-hidden="true"
                        />
                      )}
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isSelected ? 'text-[#0057d2]' : 'text-[#475e75]'
                        }`}
                      />
                      {!collapsed && (
                        <div className="flex-1 flex items-center justify-between text-left truncate">
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span
                              className={`ml-2 text-[10px] font-bold px-1.5 py-0.2 rounded-[4px] border ${
                                item.badge === 'Aktif' || item.badge === 'Matched'
                                  ? 'bg-[#eaf6ef] text-[#10683b] border-[#10683b]/20'
                                  : 'bg-[#eaecee] text-[#354a5f] border-[#d5dce2]'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom: Collapse Toggle & System Notice */}
      <div className="p-2 border-t border-[#d5dce2] bg-[#f5f6f7]">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 p-1.5 text-[12px] font-medium text-[#475e75] hover:text-[#000000] hover:bg-[#eaecee] rounded-[6px] transition-colors cursor-pointer"
          title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Ciutkan Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

// Fallback icon for check square
function CheckSquare(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}
