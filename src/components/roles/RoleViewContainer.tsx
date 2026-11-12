/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Role-Based View Container for All 7 Roles
 */

import React from 'react';
import { RoleType, SalesOrder, DeliveryOrder, UiPatternType, Customer, PartItem } from '../../types/erp';
import { DataTablePattern } from '../patterns/DataTablePattern';
import { OverviewPattern } from '../patterns/OverviewPattern';
import { FormInputPattern } from '../patterns/FormInputPattern';
import { SplitPaneDetailPattern } from '../patterns/SplitPaneDetailPattern';
import { ModalDialogPattern } from '../patterns/ModalDialogPattern';
import { CustomerMasterView } from './marketing/CustomerMasterView';
import { PartCatalogView } from './marketing/PartCatalogView';
import { SpkManagementView } from './ppic/SpkManagementView';
import { DailyTargetPlanningView } from './ppic/DailyTargetPlanningView';
import { ProductionGapMonitoringView } from './ppic/ProductionGapMonitoringView';
import { PackRatioConfigView } from './ppic/PackRatioConfigView';
import { MasterLanesView } from './ppic/MasterLanesView';
import { ManagementDashboard } from './management/ManagementDashboard';
import { ProductionMonitoringView } from './management/ProductionMonitoringView';
import { StockValuationView } from './management/StockValuationView';
import { ArAgingView } from './management/ArAgingView';
import {
  ProductionOrderSpk,
  DailyProductionRecord,
  PackConversionConfig,
  ProductionLane,
  Supplier,
  RawMaterial,
  BomAssumption,
  PurchaseOrder,
  MaterialShortageTicket,
  GoodsReceiptNote,
  MaterialIssue,
  StockMovement,
  StockAdjustment,
  StorageBinLocation,
  FinishedGoodStock,
  FgStockMovement,
} from '../../types/erp';
import { MrpSimulationView } from './purchasing/MrpSimulationView';
import { PurchaseOrderManagementView } from './purchasing/PurchaseOrderManagementView';
import { MaterialShortageView } from './purchasing/MaterialShortageView';
import { PurchasingMonitoringView } from './purchasing/PurchasingMonitoringView';
import { SupplierMasterView } from './purchasing/SupplierMasterView';
import { MaterialMasterView } from './purchasing/MaterialMasterView';
import { WarehouseMonitoringView } from './warehouse/WarehouseMonitoringView';
import { GoodsReceiptNoteView } from './warehouse/GoodsReceiptNoteView';
import { RawMaterialInventoryView } from './warehouse/RawMaterialInventoryView';
import { MaterialIssueView } from './warehouse/MaterialIssueView';
import { StockLedgerView } from './warehouse/StockLedgerView';
import { StockAdjustmentView } from './warehouse/StockAdjustmentView';
import { ProductionMonitoringView as AdminProdMonitoringView } from './admin_operasional/ProductionMonitoringView';
import { DailyProductionReportView } from './admin_operasional/DailyProductionReportView';
import { ProductionHistoryView } from './admin_operasional/ProductionHistoryView';
import { ProductionDowntimeView } from './admin_operasional/ProductionDowntimeView';
import { FinishedGoodsStockView } from './admin_operasional/FinishedGoodsStockView';
import { DeliveryMonitoringView } from './admin_operasional/DeliveryMonitoringView';
import { SuratJalanManagementView } from './admin_operasional/SuratJalanManagementView';
import { DeliveryControlMatchingView } from './admin_operasional/DeliveryControlMatchingView';
import { DeliveryHistoryView } from './admin_operasional/DeliveryHistoryView';
import { FinanceDashboardView } from './finance/FinanceDashboardView';
import { ReadyToBillView } from './finance/ReadyToBillView';
import { InvoiceManagementView } from './finance/InvoiceManagementView';
import { AccountsReceivableView } from './finance/AccountsReceivableView';
import { ArAgingViewFinance } from './finance/ArAgingViewFinance';
import { Invoice, PaymentRecord } from '../../types/erp';
import {
  Calendar,
  Layers,
  BarChart3,
  Factory,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileCheck2,
  ShieldAlert,
  ArrowRightLeft,
  PackageCheck,
  TrendingUp,
} from 'lucide-react';

interface RoleViewContainerProps {
  activeRole: RoleType;
  selectedNavId: string;
  activePattern: UiPatternType['id'];
  onPatternChange: (p: UiPatternType['id']) => void;
  orders: SalesOrder[];
  selectedOrder: SalesOrder;
  onSelectOrder: (order: SalesOrder) => void;
  onSaveNewOrder: (order: SalesOrder) => void;
  deliveryOrders: DeliveryOrder[];
  isConfirmModalOpen: boolean;
  onOpenConfirmModal: () => void;
  onCloseConfirmModal: () => void;
  // Marketing additions
  customers: Customer[];
  parts: PartItem[];
  onAddCustomer: (customer: Customer) => void;
  onAddPart: (part: PartItem) => void;
  onEditOrder: (order: SalesOrder) => void;
  editingOrder?: SalesOrder | null;
  onOpenCreateOrder: (preselectedCustomerId?: string) => void;
  // PPIC additions
  spkOrders: ProductionOrderSpk[];
  onSaveSpk: (spk: ProductionOrderSpk) => void;
  dailyRecords: DailyProductionRecord[];
  onUpdateDailyTarget: (recordId: string, newTargetPcs: number, note?: string) => void;
  onUpdateDailyActual: (
    recordId: string,
    actualPcs: number,
    actualPacks?: number,
    downtimeReason?: string,
    notes?: string
  ) => void;
  packConfigs: PackConversionConfig[];
  onSavePackConfig: (config: PackConversionConfig) => void;
  onDeletePackConfig?: (id: string) => void;
  lanes: ProductionLane[];
  // Purchasing additions (Sprint 04)
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  rawMaterials: RawMaterial[];
  bomAssumptions: BomAssumption[];
  shortageTickets: MaterialShortageTicket[];
  onSavePo: (po: PurchaseOrder) => void;
  onSaveSupplier: (supplier: Supplier) => void;
  onSaveMaterial: (material: RawMaterial) => void;
  onSaveShortage: (ticket: MaterialShortageTicket) => void;
  onCreatePoFromMrp?: (materialId: string, suggestedQty: number) => void;
  prefillPoMaterialId?: string | null;
  prefillPoQty?: number | null;
  onClearPoPrefill?: () => void;
  // Warehouse additions (Sprint 05)
  grnList: GoodsReceiptNote[];
  materialIssues: MaterialIssue[];
  stockMovements: StockMovement[];
  stockAdjustments: StockAdjustment[];
  storageLocations: StorageBinLocation[];
  onSaveGrn: (newGrn: GoodsReceiptNote, isConfirmed: boolean) => void;
  onConfirmDraftGrn: (grnId: string) => void;
  onSaveIssue: (newIssue: MaterialIssue) => void;
  onSaveAdjustment: (newAdj: StockAdjustment) => void;
  onNavigateNavId?: (navId: string) => void;
  isGrnModalOpen: boolean;
  setIsGrnModalOpen: (open: boolean) => void;
  isIssueModalOpen: boolean;
  setIsIssueModalOpen: (open: boolean) => void;
  isAdjModalOpen: boolean;
  setIsAdjModalOpen: (open: boolean) => void;
  prefillGrnPoId?: string;
  prefillIssueMaterialId?: string;
  prefillAdjMaterialId?: string;
  onSetPrefillGrnPoId?: (poId?: string) => void;
  onSetPrefillIssueMaterialId?: (matId?: string) => void;
  onSetPrefillAdjMaterialId?: (matId?: string) => void;
  // Admin Operasional additions (Sprint 06)
  fgStocks?: FinishedGoodStock[];
  fgMovements?: FgStockMovement[];
  onSaveDailyActual?: (record: DailyProductionRecord) => void;
  onPrintSj?: (sjId: string) => void;
  onOpenCreateSjModal?: () => void;
  onOpenConfirmDeliveryModal?: (sj: DeliveryOrder) => void;
  // Finance additions (Sprint 07)
  invoices?: Invoice[];
  paymentRecords?: PaymentRecord[];
  onOpenCreateInvoice?: () => void;
  onOpenCreateInvoiceWithSjs?: (selectedSjNumbers: string[], customerId?: string) => void;
  onOpenPaymentModal?: (invoice: Invoice) => void;
}

export const RoleViewContainer: React.FC<RoleViewContainerProps> = ({
  activeRole,
  selectedNavId,
  activePattern,
  onPatternChange,
  orders,
  selectedOrder,
  onSelectOrder,
  onSaveNewOrder,
  deliveryOrders,
  isConfirmModalOpen,
  onOpenConfirmModal,
  onCloseConfirmModal,
  customers,
  parts,
  onAddCustomer,
  onAddPart,
  onEditOrder,
  editingOrder,
  onOpenCreateOrder,
  spkOrders,
  onSaveSpk,
  dailyRecords,
  onUpdateDailyTarget,
  onUpdateDailyActual,
  packConfigs,
  onSavePackConfig,
  onDeletePackConfig,
  lanes,
  suppliers,
  purchaseOrders,
  rawMaterials,
  bomAssumptions,
  shortageTickets,
  onSavePo,
  onSaveSupplier,
  onSaveMaterial,
  onSaveShortage,
  onCreatePoFromMrp,
  prefillPoMaterialId,
  prefillPoQty,
  onClearPoPrefill,
  grnList,
  materialIssues,
  stockMovements,
  stockAdjustments,
  storageLocations,
  onSaveGrn,
  onConfirmDraftGrn,
  onSaveIssue,
  onSaveAdjustment,
  onNavigateNavId,
  isGrnModalOpen,
  setIsGrnModalOpen,
  isIssueModalOpen,
  setIsIssueModalOpen,
  isAdjModalOpen,
  setIsAdjModalOpen,
  prefillGrnPoId,
  prefillIssueMaterialId,
  prefillAdjMaterialId,
  onSetPrefillGrnPoId,
  onSetPrefillIssueMaterialId,
  onSetPrefillAdjMaterialId,
  fgStocks = [],
  fgMovements = [],
  onSaveDailyActual,
  onPrintSj,
  onOpenCreateSjModal,
  onOpenConfirmDeliveryModal,
  invoices = [],
  paymentRecords = [],
  onOpenCreateInvoice,
  onOpenCreateInvoiceWithSjs,
  onOpenPaymentModal,
}) => {
  // 1. Role: MARKETING (Sales Orders & Master Komersial)
  if (activeRole === 'marketing') {
    // 1A. Master Komersial: Master Customer B2B (FEAT-MD-01)
    if (selectedNavId === 'marketing-customers') {
      return (
        <CustomerMasterView
          customers={customers}
          orders={orders}
          onAddCustomer={onAddCustomer}
          onSelectCustomerForOrder={(custId) => {
            onOpenCreateOrder(custId);
          }}
        />
      );
    }

    // 1B. Master Komersial: Katalog Part Komponen (FEAT-MD-02, FEAT-MD-08)
    if (selectedNavId === 'marketing-parts') {
      return (
        <PartCatalogView
          parts={parts}
          orders={orders}
          onAddPart={onAddPart}
        />
      );
    }

    // 1C. Sales Orders: Status Pemenuhan Parsial (FEAT-SO-02, BR-SO-03, BR-SO-06)
    if (selectedNavId === 'marketing-so-fulfillment') {
      return (
        <OverviewPattern
          orders={orders}
          onSelectOrder={(order) => {
            onSelectOrder(order);
            onPatternChange('split-pane');
          }}
        />
      );
    }

    // 1D. Sales Orders: Core Patterns (Data Table, Form Input, Split Pane, Modal Demo)
    switch (activePattern) {
      case 'data-table':
        return (
          <DataTablePattern
            orders={orders}
            onSelectOrder={(order) => {
              onSelectOrder(order);
              onPatternChange('split-pane');
            }}
            onOpenCreate={() => onOpenCreateOrder()}
            onEditOrder={onEditOrder}
          />
        );

      case 'overview':
        return (
          <OverviewPattern
            orders={orders}
            onSelectOrder={(order) => {
              onSelectOrder(order);
              onPatternChange('split-pane');
            }}
          />
        );

      case 'form-input':
        return (
          <FormInputPattern
            editingOrder={editingOrder}
            customers={customers}
            parts={parts}
            onSaveOrder={(newOrder) => {
              onSaveNewOrder(newOrder);
              onPatternChange('data-table');
            }}
            onCancel={() => onPatternChange('data-table')}
          />
        );

      case 'split-pane':
        return (
          <SplitPaneDetailPattern
            order={selectedOrder}
            deliveryOrders={deliveryOrders}
            onClose={() => onPatternChange('data-table')}
            onOpenConfirmModal={onOpenConfirmModal}
            onEditOrder={onEditOrder}
          />
        );

      case 'modal-demo':
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#ffffff] space-y-4">
            <div className="max-w-[500px] p-6 border border-[#d5dce2] rounded-[4px] bg-[#f5f6f7] text-center space-y-3">
              <h3 className="text-[16px] font-bold text-[#000000]">
                Pola 5: Modal Dialog Konfirmasi Operasional
              </h3>
              <p className="text-[12px] text-[#475e75] leading-relaxed">
                Dialog modal digunakan untuk verifikasi kritis sebelum mutasi stok permanen atau persetujuan order urgent, berpedoman pada aturan zero negative stock dan larangan pemotongan stok prematur.
              </p>
              <button
                type="button"
                onClick={onOpenConfirmModal}
                className="px-5 py-2.5 text-[13px] font-bold text-white bg-[#0057d2] hover:bg-[#0049b0] active:bg-[#00368a] rounded-[4px] transition-colors cursor-pointer"
              >
                Buka Dialog Konfirmasi Surat Jalan
              </button>
            </div>
          </div>
        );

      default:
        return (
          <DataTablePattern
            orders={orders}
            onSelectOrder={onSelectOrder}
            onOpenCreate={() => onOpenCreateOrder()}
            onEditOrder={onEditOrder}
          />
        );
    }
  }

  // 2. Role: PPIC (Perencanaan Produksi & SPK Bulanan)
  if (activeRole === 'ppic') {
    switch (selectedNavId) {
      case 'ppic-targets':
        return (
          <DailyTargetPlanningView
            dailyRecords={dailyRecords}
            spkOrders={spkOrders}
            lanes={lanes}
            parts={parts}
            onUpdateDailyTarget={onUpdateDailyTarget}
          />
        );
      case 'ppic-gap':
        return (
          <ProductionGapMonitoringView
            dailyRecords={dailyRecords}
            spkOrders={spkOrders}
            lanes={lanes}
            parts={parts}
            onUpdateDailyActual={onUpdateDailyActual}
          />
        );
      case 'ppic-pack-ratio':
        return (
          <PackRatioConfigView
            packConfigs={packConfigs}
            lanes={lanes}
            parts={parts}
            onSavePackConfig={onSavePackConfig}
            onDeletePackConfig={onDeletePackConfig}
          />
        );
      case 'ppic-lanes':
        return (
          <MasterLanesView
            lanes={lanes}
            parts={parts}
            spkOrders={spkOrders}
          />
        );
      case 'ppic-spk':
      default:
        return (
          <SpkManagementView
            spkOrders={spkOrders}
            lanes={lanes}
            parts={parts}
            orders={orders}
            onSaveSpk={onSaveSpk}
          />
        );
    }
  }

  // 3. Role: PURCHASING (Pengadaan Material & Simulasi MRP)
  if (activeRole === 'purchasing') {
    // 3A. Simulasi MRP Demo (FEAT-PUR-01)
    if (selectedNavId === 'purchasing-mrp') {
      return (
        <MrpSimulationView
          materials={rawMaterials}
          boms={bomAssumptions}
          spkOrders={spkOrders}
          onCreatePoFromMrp={onCreatePoFromMrp}
        />
      );
    }

    // 3B. Laporan Kebutuhan / Shortage (PR) (FEAT-SH-01 / F-15)
    if (selectedNavId === 'purchasing-shortage') {
      return (
        <MaterialShortageView
          shortages={shortageTickets}
          materials={rawMaterials}
          onSaveShortage={onSaveShortage}
          onOpenCreatePoFromShortage={onCreatePoFromMrp}
        />
      );
    }

    // 3C. Purchase Order (PO) Supplier Management (FEAT-PUR-02)
    if (selectedNavId === 'purchasing-po') {
      return (
        <PurchaseOrderManagementView
          purchaseOrders={purchaseOrders}
          suppliers={suppliers}
          materials={rawMaterials}
          onSavePo={onSavePo}
          prefillMaterialId={prefillPoMaterialId}
          prefillQty={prefillPoQty}
          onClearPrefill={onClearPoPrefill}
        />
      );
    }

    // 3D. Monitoring Pengadaan & Inbound Material (Tracking)
    if (selectedNavId === 'purchasing-inbound') {
      return (
        <PurchasingMonitoringView
          purchaseOrders={purchaseOrders}
          suppliers={suppliers}
          materials={rawMaterials}
          spkOrders={spkOrders}
        />
      );
    }

    // 3E. Master Supplier (FEAT-MD-03)
    if (selectedNavId === 'purchasing-suppliers') {
      return (
        <SupplierMasterView
          suppliers={suppliers}
          purchaseOrders={purchaseOrders}
          onSaveSupplier={onSaveSupplier}
        />
      );
    }

    // 3F. Master Material & Konversi Satuan UoM (FEAT-MD-06 / FEAT-MD-07 / BR-MAT-04)
    if (selectedNavId === 'purchasing-materials') {
      return (
        <MaterialMasterView
          materials={rawMaterials}
          suppliers={suppliers}
          onSaveMaterial={onSaveMaterial}
        />
      );
    }

    // Default Fallback: MrpSimulationView
    return (
      <MrpSimulationView
        materials={rawMaterials}
        boms={bomAssumptions}
        spkOrders={spkOrders}
        onCreatePoFromMrp={onCreatePoFromMrp}
      />
    );
  }

  // 4. Role: WAREHOUSE (Gudang Bahan Baku)
  if (activeRole === 'warehouse') {
    // 4A. Monitoring & Ringkasan Gudang
    if (selectedNavId === 'warehouse-monitoring') {
      return (
        <WarehouseMonitoringView
          materials={rawMaterials}
          purchaseOrders={purchaseOrders}
          grnList={grnList}
          materialIssues={materialIssues}
          stockMovements={stockMovements}
          shortageTickets={shortageTickets}
          storageLocations={storageLocations}
          onNavigateTab={(tabId) => onNavigateNavId && onNavigateNavId(tabId)}
          onOpenCreateGrn={(prefillPoId) => {
            if (onSetPrefillGrnPoId) onSetPrefillGrnPoId(prefillPoId);
            setIsGrnModalOpen(true);
          }}
          onOpenCreateIssue={() => setIsIssueModalOpen(true)}
          onOpenCreateAdj={() => setIsAdjModalOpen(true)}
        />
      );
    }

    // 4B. Goods Receipt Note (GRN) — FEAT-WH-01
    if (selectedNavId === 'warehouse-grn') {
      return (
        <GoodsReceiptNoteView
          grnList={grnList}
          purchaseOrders={purchaseOrders}
          materials={rawMaterials}
          storageLocations={storageLocations}
          onSaveGrn={onSaveGrn}
          onConfirmDraftGrn={onConfirmDraftGrn}
          initialCreatePoId={prefillGrnPoId}
          isCreateModalOpen={isGrnModalOpen}
          setIsCreateModalOpen={setIsGrnModalOpen}
        />
      );
    }

    // 4C. Saldo Stok & Lokasi Rak (Raw Material Inventory) — FEAT-WH-02 & Domain 2
    if (selectedNavId === 'warehouse-inventory') {
      return (
        <RawMaterialInventoryView
          materials={rawMaterials}
          storageLocations={storageLocations}
          onNavigateTab={(tabId) => onNavigateNavId && onNavigateNavId(tabId)}
          onOpenIssueModal={(matId) => {
            if (onSetPrefillIssueMaterialId) onSetPrefillIssueMaterialId(matId);
            setIsIssueModalOpen(true);
          }}
          onOpenAdjModal={(matId) => {
            if (onSetPrefillAdjMaterialId) onSetPrefillAdjMaterialId(matId);
            setIsAdjModalOpen(true);
          }}
        />
      );
    }

    // 4D. Material Issue ke Lini — FEAT-WH-03
    if (selectedNavId === 'warehouse-issue') {
      return (
        <MaterialIssueView
          materialIssues={materialIssues}
          materials={rawMaterials}
          spkOrders={spkOrders}
          lanes={lanes}
          onSaveIssue={onSaveIssue}
          isCreateModalOpen={isIssueModalOpen}
          setIsCreateModalOpen={setIsIssueModalOpen}
          prefillMaterialId={prefillIssueMaterialId}
        />
      );
    }

    // 4E. Kartu Stok Ledger Material (Append-Only) — FEAT-WH-02 & NFR-04
    if (selectedNavId === 'warehouse-ledger') {
      return (
        <StockLedgerView
          stockMovements={stockMovements}
          materials={rawMaterials}
        />
      );
    }

    // 4F. Stock Adjustment Material — FEAT-WH-04
    if (selectedNavId === 'warehouse-adj') {
      return (
        <StockAdjustmentView
          adjustments={stockAdjustments}
          materials={rawMaterials}
          onSaveAdjustment={onSaveAdjustment}
          isCreateModalOpen={isAdjModalOpen}
          setIsCreateModalOpen={setIsAdjModalOpen}
          prefillMaterialId={prefillAdjMaterialId}
        />
      );
    }

    // Default Fallback: Monitoring Gudang
    return (
      <WarehouseMonitoringView
        materials={rawMaterials}
        purchaseOrders={purchaseOrders}
        grnList={grnList}
        materialIssues={materialIssues}
        stockMovements={stockMovements}
        shortageTickets={shortageTickets}
        storageLocations={storageLocations}
        onNavigateTab={(tabId) => onNavigateNavId && onNavigateNavId(tabId)}
        onOpenCreateGrn={(prefillPoId) => {
          if (onSetPrefillGrnPoId) onSetPrefillGrnPoId(prefillPoId);
          setIsGrnModalOpen(true);
        }}
        onOpenCreateIssue={() => setIsIssueModalOpen(true)}
        onOpenCreateAdj={() => setIsAdjModalOpen(true)}
      />
    );
  }

  // 5. Role: ADMIN_OPERASIONAL (Wajib 2 Modul Terpisah: Produksi & Pengiriman)
  if (activeRole === 'admin_operasional') {
    switch (selectedNavId) {
      // Modul Produksi (Lantai Lini)
      case 'prod-daily-report':
        return (
          <DailyProductionReportView
            dailyRecords={dailyRecords}
            lanes={lanes}
            spkOrders={spkOrders}
            packConfigs={packConfigs}
            parts={parts}
            onSaveDailyActual={(
              recordId,
              actualPcs,
              actualPacks,
              downtimeReason,
              notes
            ) => {
              if (onUpdateDailyActual) {
                onUpdateDailyActual(recordId, actualPcs, actualPacks, downtimeReason, notes);
              }
            }}
            onAddNewDailyRecord={(newRec) => {
              if (onSaveDailyActual) {
                onSaveDailyActual(newRec);
              }
            }}
          />
        );
      case 'prod-history':
        return (
          <ProductionHistoryView
            dailyRecords={dailyRecords}
          />
        );
      case 'prod-downtime':
        return (
          <ProductionDowntimeView
            dailyRecords={dailyRecords}
            lanes={lanes}
          />
        );
      case 'prod-fg-stocks':
        return (
          <FinishedGoodsStockView
            fgStocks={fgStocks}
            fgMovements={fgMovements}
          />
        );
      case 'prod-monitoring':
        return (
          <AdminProdMonitoringView
            dailyRecords={dailyRecords}
            lanes={lanes}
            spkOrders={spkOrders}
            onNavigateTab={(tabId: string) => onNavigateNavId && onNavigateNavId(tabId)}
            onOpenActualEntryModal={() => onNavigateNavId && onNavigateNavId('prod-daily-report')}
          />
        );

      // Modul Pengiriman (Surat Jalan)
      case 'del-sj-list':
        return (
          <SuratJalanManagementView
            deliveryOrders={deliveryOrders}
            fgStocks={fgStocks}
            onOpenCreateModal={() => onOpenCreateSjModal && onOpenCreateSjModal()}
            onOpenConfirmModal={(sj) => onOpenConfirmDeliveryModal && onOpenConfirmDeliveryModal(sj)}
            onPrintSj={(sjId) => onPrintSj && onPrintSj(sjId)}
          />
        );
      case 'del-so-matching':
        return (
          <DeliveryControlMatchingView
            salesOrders={orders}
            deliveryOrders={deliveryOrders}
          />
        );
      case 'del-history':
        return (
          <DeliveryHistoryView
            deliveryOrders={deliveryOrders}
          />
        );
      case 'del-monitoring':
      default:
        return (
          <DeliveryMonitoringView
            deliveryOrders={deliveryOrders}
            orders={orders}
            fgStocks={fgStocks}
            onNavigateTab={(tabId: string) => onNavigateNavId && onNavigateNavId(tabId)}
            onOpenCreateSjModal={() => onOpenCreateSjModal && onOpenCreateSjModal()}
            onOpenConfirmModal={(sj: DeliveryOrder) => onOpenConfirmDeliveryModal && onOpenConfirmDeliveryModal(sj)}
          />
        );
    }
  }

  // 6. Role: FINANCE (Modul Penagihan & Accounts Receivable - Sprint 07)
  if (activeRole === 'finance') {
    switch (selectedNavId) {
      case 'fin-ready-to-bill':
      case 'fin-control-sj':
        return (
          <ReadyToBillView
            orders={orders}
            deliveryOrders={deliveryOrders}
            invoices={invoices}
            onOpenCreateInvoiceWithSjs={
              onOpenCreateInvoiceWithSjs || ((sjs) => onOpenCreateInvoice && onOpenCreateInvoice())
            }
          />
        );

      case 'fin-invoice-list':
      case 'fin-monthly-invoice':
        return (
          <InvoiceManagementView
            invoices={invoices}
            paymentRecords={paymentRecords}
            onOpenCreateInvoice={onOpenCreateInvoice || (() => {})}
            onOpenPaymentModal={onOpenPaymentModal || (() => {})}
          />
        );

      case 'fin-ar-tracking':
        return (
          <AccountsReceivableView
            invoices={invoices}
            paymentRecords={paymentRecords}
            customers={customers}
            onOpenPaymentModal={onOpenPaymentModal || (() => {})}
          />
        );

      case 'fin-ar-aging':
        return (
          <ArAgingViewFinance
            orders={orders}
            invoices={invoices}
            customers={customers}
            onOpenPaymentModal={onOpenPaymentModal || (() => {})}
          />
        );

      case 'fin-dashboard':
      default:
        return (
          <FinanceDashboardView
            orders={orders}
            deliveryOrders={deliveryOrders}
            invoices={invoices}
            onNavigate={(navId) => onNavigateNavId && onNavigateNavId(navId)}
            onOpenCreateInvoice={onOpenCreateInvoice || (() => {})}
            onOpenPaymentModal={onOpenPaymentModal || (() => {})}
          />
        );
    }
  }

  // 7. Role: MANAGEMENT (Murni Read-Only Executive Management Views — BRD F-12, FEAT-DSH-01)
  if (activeRole === 'management') {
    switch (selectedNavId) {
      case 'mgmt-prod-gap':
        return <ProductionMonitoringView />;
      case 'mgmt-stock-val':
        return <StockValuationView />;
      case 'mgmt-ar-aging':
        return <ArAgingView orders={orders} deliveryOrders={deliveryOrders} />;
      case 'mgmt-kpi':
      default:
        return <ManagementDashboard orders={orders} deliveryOrders={deliveryOrders} rawMaterials={rawMaterials} />;
    }
  }

  return null;
};
