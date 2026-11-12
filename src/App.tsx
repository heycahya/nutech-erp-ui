/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Nutech ERP — High-Fidelity UI Prototype (Phase 01)
 * Authentic Hybrid Enterprise ERP shell with isolated QA evaluation controls.
 */

import React, { useState } from 'react';
import {
  RoleType,
  SalesOrder,
  UiPatternType,
  Customer,
  PartItem,
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
  FgLocationType,
  DeliveryOrder,
  Invoice,
  PaymentRecord,
} from './types/erp';
import {
  INITIAL_SALES_ORDERS,
  INITIAL_DELIVERY_ORDERS,
  ROLES_METADATA,
  MOCK_CUSTOMERS,
  MOCK_PARTS,
  INITIAL_SPK_ORDERS,
  INITIAL_DAILY_PRODUCTION_RECORDS,
  INITIAL_PACK_RATIOS,
  INITIAL_PRODUCTION_LANES,
  INITIAL_SUPPLIERS,
  INITIAL_RAW_MATERIALS,
  INITIAL_BOM_ASSUMPTIONS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_MATERIAL_SHORTAGES,
  INITIAL_GOODS_RECEIPT_NOTES,
  INITIAL_MATERIAL_ISSUES,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_STOCK_ADJUSTMENTS,
  INITIAL_STORAGE_LOCATIONS,
  INITIAL_FINISHED_GOODS_STOCKS,
  INITIAL_FG_MOVEMENTS,
  INITIAL_INVOICES,
  INITIAL_PAYMENT_RECORDS,
} from './data/mockData';
import { GlobalTopbar } from './components/shell/GlobalTopbar';
import { PageHeaderRail } from './components/shell/PageHeaderRail';
import { SidebarNav } from './components/shell/SidebarNav';
import { FooterStatusBar } from './components/shell/FooterStatusBar';
import { DevelopmentShowcaseBar } from './components/shell/DevelopmentShowcaseBar';
import { RoleViewContainer } from './components/roles/RoleViewContainer';
import { ModalDialogPattern } from './components/patterns/ModalDialogPattern';
import { CreateSuratJalanModal } from './components/roles/admin_operasional/CreateSuratJalanModal';
import { DeliveryConfirmationModal } from './components/roles/admin_operasional/DeliveryConfirmationModal';
import { CreateInvoiceModal } from './components/roles/finance/CreateInvoiceModal';
import { PaymentRecordModal } from './components/roles/finance/PaymentRecordModal';

export default function App() {
  // 1. Core State
  // Role 'marketing' is the primary deep visual test role per prompt instructions
  const [activeRole, setActiveRole] = useState<RoleType>('marketing');
  const [selectedNavId, setSelectedNavId] = useState<string>('marketing-so-list');
  const [activePattern, setActivePattern] = useState<UiPatternType['id']>('data-table');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // 2. Mock Data State
  const [orders, setOrders] = useState<SalesOrder[]>(INITIAL_SALES_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder>(INITIAL_SALES_ORDERS[0]);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [parts, setParts] = useState<PartItem[]>(MOCK_PARTS);
  const [deliveryOrders, setDeliveryOrders] = useState(INITIAL_DELIVERY_ORDERS);

  // 3. PPIC State
  const [spkOrders, setSpkOrders] = useState<ProductionOrderSpk[]>(INITIAL_SPK_ORDERS);
  const [dailyRecords, setDailyRecords] = useState<DailyProductionRecord[]>(INITIAL_DAILY_PRODUCTION_RECORDS);
  const [packConfigs, setPackConfigs] = useState<PackConversionConfig[]>(INITIAL_PACK_RATIOS);
  const [lanes] = useState<ProductionLane[]>(INITIAL_PRODUCTION_LANES);

  // 4. Purchasing State (Sprint 04)
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(INITIAL_RAW_MATERIALS);
  const [bomAssumptions] = useState<BomAssumption[]>(INITIAL_BOM_ASSUMPTIONS);
  const [shortageTickets, setShortageTickets] = useState<MaterialShortageTicket[]>(INITIAL_MATERIAL_SHORTAGES);
  const [prefillPoMaterialId, setPrefillPoMaterialId] = useState<string | null>(null);
  const [prefillPoQty, setPrefillPoQty] = useState<number | null>(null);

  // 5. Warehouse State (Sprint 05)
  const [grnList, setGrnList] = useState<GoodsReceiptNote[]>(INITIAL_GOODS_RECEIPT_NOTES);
  const [materialIssues, setMaterialIssues] = useState<MaterialIssue[]>(INITIAL_MATERIAL_ISSUES);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(INITIAL_STOCK_MOVEMENTS);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(INITIAL_STOCK_ADJUSTMENTS);
  const [storageLocations, setStorageLocations] = useState<StorageBinLocation[]>(INITIAL_STORAGE_LOCATIONS);
  const [isGrnModalOpen, setIsGrnModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isAdjModalOpen, setIsAdjModalOpen] = useState(false);
  const [prefillGrnPoId, setPrefillGrnPoId] = useState<string | undefined>(undefined);
  const [prefillIssueMaterialId, setPrefillIssueMaterialId] = useState<string | undefined>(undefined);
  const [prefillAdjMaterialId, setPrefillAdjMaterialId] = useState<string | undefined>(undefined);

  // 6. Admin Operasional & Finished Goods State (Sprint 06)
  const [fgStocks, setFgStocks] = useState<FinishedGoodStock[]>(INITIAL_FINISHED_GOODS_STOCKS);
  const [fgMovements, setFgMovements] = useState<FgStockMovement[]>(INITIAL_FG_MOVEMENTS);
  const [isCreateSjModalOpen, setIsCreateSjModalOpen] = useState(false);
  const [isConfirmDeliveryModalOpen, setIsConfirmDeliveryModalOpen] = useState(false);
  const [confirmDeliveryTarget, setConfirmDeliveryTarget] = useState<DeliveryOrder | null>(null);

  // 7. Finance & AR State (Sprint 07)
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>(INITIAL_PAYMENT_RECORDS);
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false);
  const [selectedSjNumbersForInvoice, setSelectedSjNumbersForInvoice] = useState<string[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTargetInvoice, setPaymentTargetInvoice] = useState<Invoice | null>(null);

  // 8. Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  // Handle switching active role
  const handleRoleChange = (newRole: RoleType) => {
    setActiveRole(newRole);
    setEditingOrder(null);

    // Set default nav for each role
    switch (newRole) {
      case 'marketing':
        setSelectedNavId('marketing-so-list');
        setActivePattern('data-table');
        break;
      case 'ppic':
        setSelectedNavId('ppic-spk');
        break;
      case 'purchasing':
        setSelectedNavId('purchasing-mrp');
        break;
      case 'warehouse':
        setSelectedNavId('warehouse-monitoring');
        break;
      case 'admin_operasional':
        setSelectedNavId('prod-monitoring');
        break;
      case 'finance':
        setSelectedNavId('fin-dashboard');
        break;
      case 'management':
        setSelectedNavId('mgmt-kpi');
        setActivePattern('overview');
        break;
    }
  };

  // Handle saving sales order (create or edit)
  const handleSaveOrder = (savedOrder: SalesOrder) => {
    const existingIndex = orders.findIndex((o) => o.id === savedOrder.id);
    if (existingIndex >= 0) {
      const updated = [...orders];
      updated[existingIndex] = savedOrder;
      setOrders(updated);
      setSelectedOrder(savedOrder);
    } else {
      setOrders([savedOrder, ...orders]);
      setSelectedOrder(savedOrder);
    }
    setEditingOrder(null);
  };

  // Handle edit order initiation
  const handleEditOrder = (orderToEdit: SalesOrder) => {
    setEditingOrder(orderToEdit);
    setSelectedNavId('marketing-so-list');
    setActivePattern('form-input');
  };

  // Handle open create order
  const handleOpenCreateOrder = () => {
    setEditingOrder(null);
    setSelectedNavId('marketing-so-list');
    setActivePattern('form-input');
  };

  // Handle adding new customer
  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers((prev) => [...prev, newCustomer]);
  };

  // Handle adding new part
  const handleAddPart = (newPart: PartItem) => {
    setParts((prev) => [...prev, newPart]);
  };

  // PPIC Handlers
  const handleSaveSpk = (savedSpk: ProductionOrderSpk) => {
    setSpkOrders((prev) => {
      const idx = prev.findIndex((s) => s.id === savedSpk.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedSpk;
        return copy;
      }
      return [savedSpk, ...prev];
    });
  };

  const handleUpdateDailyTarget = (recordId: string, newTargetPcs: number, note?: string) => {
    setDailyRecords((prev) =>
      prev.map((r) => {
        if (r.id === recordId) {
          const gap = newTargetPcs - r.actualPcs;
          return {
            ...r,
            targetPcs: newTargetPcs,
            gapPcs: gap,
            notes: note ? `${r.notes ? r.notes + ' · ' : ''}${note}` : r.notes,
          };
        }
        return r;
      })
    );
  };

  const handleUpdateDailyActual = (
    recordId: string,
    actualPcs: number,
    actualPacks?: number,
    downtimeReason?: string,
    notes?: string
  ) => {
    setDailyRecords((prev) =>
      prev.map((r) => {
        if (r.id === recordId) {
          const gap = r.targetPcs - actualPcs;
          return {
            ...r,
            actualPcs,
            actualPacks: actualPacks !== undefined ? actualPacks : Math.round(actualPcs / r.packRatio),
            gapPcs: gap,
            downtimeReason: downtimeReason || r.downtimeReason,
            notes: notes !== undefined ? notes : r.notes,
          };
        }
        return r;
      })
    );
  };

  const handleSavePackConfig = (config: PackConversionConfig) => {
    setPackConfigs((prev) => {
      const idx = prev.findIndex((c) => c.id === config.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = config;
        return copy;
      }
      return [...prev, config];
    });
  };

  const handleDeletePackConfig = (id: string) => {
    setPackConfigs((prev) => prev.filter((c) => c.id !== id));
  };

  // Purchasing Handlers (Sprint 04)
  const handleSavePo = (savedPo: PurchaseOrder) => {
    setPurchaseOrders((prev) => {
      const idx = prev.findIndex((p) => p.id === savedPo.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedPo;
        return copy;
      }
      return [savedPo, ...prev];
    });
  };

  const handleSaveSupplier = (savedSupplier: Supplier) => {
    setSuppliers((prev) => {
      const idx = prev.findIndex((s) => s.id === savedSupplier.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedSupplier;
        return copy;
      }
      return [...prev, savedSupplier];
    });
  };

  const handleSaveMaterial = (savedMaterial: RawMaterial) => {
    setRawMaterials((prev) => {
      const idx = prev.findIndex((m) => m.id === savedMaterial.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedMaterial;
        return copy;
      }
      return [...prev, savedMaterial];
    });
  };

  const handleSaveShortage = (ticket: MaterialShortageTicket) => {
    setShortageTickets((prev) => {
      const idx = prev.findIndex((t) => t.id === ticket.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = ticket;
        return copy;
      }
      return [ticket, ...prev];
    });
  };

  const handleCreatePoFromMrp = (materialId: string, suggestedQty: number) => {
    setPrefillPoMaterialId(materialId);
    setPrefillPoQty(suggestedQty);
    setSelectedNavId('purchasing-po');
  };

  const handleClearPoPrefill = () => {
    setPrefillPoMaterialId(null);
    setPrefillPoQty(null);
  };

  // Warehouse Handlers (Sprint 05)
  const handleSaveGrn = (newGrn: GoodsReceiptNote, isConfirmed: boolean) => {
    if (isConfirmed) {
      // 1. Update purchase order received quantities
      setPurchaseOrders((prev) =>
        prev.map((po) => {
          if (po.id === newGrn.poId || po.poNumber === newGrn.poNumber) {
            const updatedItems = po.items.map((poi) => {
              const grnItem = newGrn.items.find((gi) => gi.poItemId === poi.id || gi.materialCode === poi.materialCode);
              if (grnItem) {
                const newReceived = (poi.qtyReceivedGrn || 0) + grnItem.qtyReceivedNow;
                return { ...poi, qtyReceivedGrn: newReceived };
              }
              return poi;
            });
            const allReceived = updatedItems.every((item) => item.qtyReceivedGrn >= item.qtyOrdered);
            const anyReceived = updatedItems.some((item) => item.qtyReceivedGrn > 0);

            return {
              ...po,
              items: updatedItems,
              grnStatus: allReceived ? ('Fully Received' as const) : anyReceived ? ('Partial GRN' as const) : ('No Receipt' as const),
              status: allReceived ? ('Received' as const) : ('Partially Received' as const),
            };
          }
          return po;
        })
      );

      // 2. Update raw materials onHandQty and append to ledger
      const newMovements: StockMovement[] = [];
      setRawMaterials((prev) =>
        prev.map((mat) => {
          const item = newGrn.items.find((gi) => gi.materialId === mat.id || gi.materialCode === mat.code);
          if (item) {
            const updatedOnHand = mat.onHandQty + item.qtyReceivedNow;
            newMovements.push({
              id: `mov-${Date.now()}-${mat.code}`,
              transactionDate: `${newGrn.receivedDate} 10:00`,
              movementType: 'grn',
              referenceType: 'PO_GRN',
              referenceNumber: newGrn.grnNumber,
              materialId: mat.id,
              materialCode: mat.code,
              materialName: mat.name,
              storageLocation: item.storageLocation || mat.storageLocation,
              qtyIn: item.qtyReceivedNow,
              qtyOut: 0,
              balanceAfter: updatedOnHand,
              uom: item.purchaseUom,
              userId: 'WH-01',
              userName: newGrn.receivedBy || 'Bambang Hariyadi (Admin Gudang)',
              notes: `Penerimaan resmi via ${newGrn.grnNumber} (Ref PO: ${newGrn.poNumber}, SJ: ${newGrn.deliveryOrderNumber})`,
            });
            return { ...mat, onHandQty: updatedOnHand };
          }
          return mat;
        })
      );

      if (newMovements.length > 0) {
        setStockMovements((prev) => [...newMovements, ...prev]);
      }
    }

    setGrnList((prev) => [newGrn, ...prev]);
  };

  const handleConfirmDraftGrn = (grnId: string) => {
    const targetGrn = grnList.find((g) => g.id === grnId);
    if (!targetGrn || targetGrn.status !== 'Draft') return;

    // Execute confirmation
    handleSaveGrn({ ...targetGrn, status: 'Confirmed' }, true);
    setGrnList((prev) => prev.filter((g) => g.id !== grnId));
  };

  const handleSaveIssue = (newIssue: MaterialIssue) => {
    const newMovements: StockMovement[] = [];

    // Decrement raw material stock and append to ledger
    setRawMaterials((prev) =>
      prev.map((mat) => {
        const item = newIssue.items.find((ii) => ii.materialId === mat.id || ii.materialCode === mat.code);
        if (item) {
          const updatedOnHand = Math.max(0, mat.onHandQty - item.qtyIssued);
          newMovements.push({
            id: `mov-${Date.now()}-${mat.code}`,
            transactionDate: `${newIssue.issueDate} 11:30`,
            movementType: 'issue',
            referenceType: 'MATERIAL_ISSUE',
            referenceNumber: newIssue.issueNumber,
            materialId: mat.id,
            materialCode: mat.code,
            materialName: mat.name,
            storageLocation: item.storageLocation || mat.storageLocation,
            qtyIn: 0,
            qtyOut: item.qtyIssued,
            balanceAfter: updatedOnHand,
            uom: item.uom,
            userId: 'WH-01',
            userName: newIssue.authorizedBy || 'Bambang Hariyadi (Admin Gudang)',
            notes: `Pengeluaran bahan ke ${newIssue.targetLaneName} untuk ${newIssue.spkNumber} (${newIssue.notes || 'Setup lini'})`,
          });
          return { ...mat, onHandQty: updatedOnHand };
        }
        return mat;
      })
    );

    if (newMovements.length > 0) {
      setStockMovements((prev) => [...newMovements, ...prev]);
    }

    setMaterialIssues((prev) => [newIssue, ...prev]);
  };

  const handleSaveAdjustment = (newAdj: StockAdjustment) => {
    let updatedOnHand = newAdj.actualPhysicalQty;

    setRawMaterials((prev) =>
      prev.map((mat) => {
        if (mat.id === newAdj.materialId || mat.code === newAdj.materialCode) {
          updatedOnHand = newAdj.actualPhysicalQty;
          return { ...mat, onHandQty: newAdj.actualPhysicalQty };
        }
        return mat;
      })
    );

    const newMovement: StockMovement = {
      id: `mov-${Date.now()}-${newAdj.materialCode}`,
      transactionDate: `${newAdj.adjDate} 16:00`,
      movementType: 'adj',
      referenceType: 'STOCK_ADJUSTMENT',
      referenceNumber: newAdj.adjNumber,
      materialId: newAdj.materialId,
      materialCode: newAdj.materialCode,
      materialName: newAdj.materialName,
      storageLocation: newAdj.storageLocation,
      qtyIn: newAdj.differenceQty > 0 ? newAdj.differenceQty : 0,
      qtyOut: newAdj.differenceQty < 0 ? Math.abs(newAdj.differenceQty) : 0,
      balanceAfter: updatedOnHand,
      uom: newAdj.uom,
      userId: 'WH-01',
      userName: newAdj.authorizedBy || 'Bambang Hariyadi (Admin Gudang)',
      reason: newAdj.reasonDetail,
      notes: `Penyesuaian stok (${newAdj.reasonCategory}): ${newAdj.reasonDetail}`,
    };

    setStockMovements((prev) => [newMovement, ...prev]);
    setStockAdjustments((prev) => [newAdj, ...prev]);
  };

  // Admin Operasional Handlers (Sprint 06)
  const handleSaveDailyActual = (record: DailyProductionRecord) => {
    setDailyRecords((prev) => {
      const idx = prev.findIndex((r) => r.id === record.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [record, ...prev];
    });
  };

  const handleCreateSuratJalan = (newSj: DeliveryOrder) => {
    setDeliveryOrders((prev) => [newSj, ...prev]);
    setIsCreateSjModalOpen(false);
    setSelectedNavId('del-sj-list');
  };

  const handlePrintSuratJalan = (sjId: string) => {
    setDeliveryOrders((prev) =>
      prev.map((sj) => (sj.id === sjId && sj.status === 'Draft' ? { ...sj, status: 'Printed' as const } : sj))
    );
  };

  const handleOpenConfirmDeliveryModal = (targetSj: DeliveryOrder) => {
    setConfirmDeliveryTarget(targetSj);
    setIsConfirmDeliveryModalOpen(true);
  };

  const handleConfirmDelivery = (payload: {
    sjId: string;
    recipientName: string;
    confirmedAt: string;
    proofOfDeliveryNotes: string;
    deductions: { partNumber: string; sourceLocation: FgLocationType; qtyPcs: number }[];
  }) => {
    // 1. Update delivery order status to Delivered and deductedFromFg = true
    setDeliveryOrders((prev) =>
      prev.map((sj) => {
        if (sj.id === payload.sjId) {
          return {
            ...sj,
            status: 'Delivered',
            controlStatus: 'Matched',
            recipientName: payload.recipientName,
            confirmedAt: payload.confirmedAt,
            proofOfDeliveryNotes: payload.proofOfDeliveryNotes,
            deductedFromFg: true,
          };
        }
        return sj;
      })
    );

    // 2. Deduct physical FG inventory at source location
    const newFgMovements: FgStockMovement[] = [];
    setFgStocks((prev) =>
      prev.map((stk) => {
        const deductItem = payload.deductions.find((d) => d.partNumber === stk.partNumber);
        if (deductItem) {
          const isWarehouse = deductItem.sourceLocation === 'Gudang FG';
          const newLineEnd = isWarehouse ? stk.lineEndQty : Math.max(0, stk.lineEndQty - deductItem.qtyPcs);
          const newWarehouse = isWarehouse ? Math.max(0, stk.warehouseQty - deductItem.qtyPcs) : stk.warehouseQty;
          const newTotal = newLineEnd + newWarehouse;

          newFgMovements.push({
            id: `fg-mov-${Date.now()}-${stk.partNumber}`,
            timestamp: payload.confirmedAt,
            movementType: 'DELIVERY_DEDUCTION',
            referenceNumber: confirmDeliveryTarget?.sjNumber || 'SJ-CONFIRMED',
            partNumber: stk.partNumber,
            partDescription: stk.partDescription,
            sourceLocation: deductItem.sourceLocation,
            qtyChange: -deductItem.qtyPcs,
            balanceAfter: newTotal,
            authorizedBy: 'Bambang Hariyadi (Admin Operasional)',
            notes: `Bukti serah terima pelanggan: ${payload.recipientName}`,
          });

          return {
            ...stk,
            lineEndQty: newLineEnd,
            warehouseQty: newWarehouse,
            totalQtyPcs: newTotal,
            lastUpdated: payload.confirmedAt,
          };
        }
        return stk;
      })
    );

    if (newFgMovements.length > 0) {
      setFgMovements((prev) => [...newFgMovements, ...prev]);
    }

    // 3. Update Sales Order qtyDelivered if linked
    if (confirmDeliveryTarget?.soNumber) {
      setOrders((prev) =>
        prev.map((so) => {
          if (so.soNumber === confirmDeliveryTarget?.soNumber) {
            const updatedItems = so.items.map((soi) => {
              const shipped = payload.deductions.find((d) => d.partNumber === soi.partNumber);
              if (shipped) {
                return {
                  ...soi,
                  qtyDelivered: soi.qtyDelivered + shipped.qtyPcs,
                };
              }
              return soi;
            });
            const allDelivered = updatedItems.every((it) => it.qtyDelivered >= it.qtyOrdered);
            return {
              ...so,
              items: updatedItems,
              statusDelivery: allDelivered ? ('Fully Delivered' as const) : ('Partially Shipped' as const),
            };
          }
          return so;
        })
      );
    }

    setIsConfirmDeliveryModalOpen(false);
    setConfirmDeliveryTarget(null);
  };

  // Finance Handlers (Sprint 07)
  const handleCreateInvoice = (newInvoice: Invoice) => {
    setInvoices((prev) => [newInvoice, ...prev]);

    // Update Sales Order qtyBilled if linked items
    setOrders((prev) =>
      prev.map((so) => {
        let hasItemUpdated = false;
        const updatedItems = so.items.map((soi) => {
          const matchingInvoiceItems = newInvoice.items.filter(
            (it) => it.soNumber === so.soNumber && it.partNumber === soi.partNumber
          );
          if (matchingInvoiceItems.length > 0) {
            hasItemUpdated = true;
            const additionalBilled = matchingInvoiceItems.reduce((acc, it) => acc + it.qtyBilled, 0);
            return {
              ...soi,
              qtyBilled: soi.qtyBilled + additionalBilled,
            };
          }
          return soi;
        });

        if (hasItemUpdated) {
          const allBilled = updatedItems.every((it) => it.qtyBilled >= it.qtyOrdered);
          const anyBilled = updatedItems.some((it) => it.qtyBilled > 0);
          return {
            ...so,
            items: updatedItems,
            statusBilling: allBilled ? ('Fully Billed' as const) : anyBilled ? ('Partially Billed' as const) : ('Unbilled' as const),
          };
        }
        return so;
      })
    );
  };

  const handleRecordPayment = (payment: PaymentRecord, updatedInvoice: Invoice) => {
    setPaymentRecords((prev) => [payment, ...prev]);
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv))
    );
  };

  const handleOpenCreateInvoice = (sjs?: string[]) => {
    setSelectedSjNumbersForInvoice(sjs || []);
    setIsCreateInvoiceModalOpen(true);
  };

  const handleOpenPaymentModal = (targetInv: Invoice) => {
    setPaymentTargetInvoice(targetInv);
    setIsPaymentModalOpen(true);
  };

  // Dynamic breadcrumbs based on role and active pattern
  const getBreadcrumbs = () => {
    const roleInfo = ROLES_METADATA[activeRole];
    if (activeRole === 'marketing') {
      if (selectedNavId === 'marketing-customers') {
        return ['Komersial', 'Master Komersial', 'Master Customer B2B'];
      }
      if (selectedNavId === 'marketing-parts') {
        return ['Komersial', 'Master Komersial', 'Katalog Part Komponen'];
      }
      if (selectedNavId === 'marketing-so-fulfillment') {
        return ['Komersial', 'Sales Orders', 'Status Pemenuhan Parsial (Fulfillment)'];
      }
      const patternLabels: Record<UiPatternType['id'], string> = {
        'data-table': 'Daftar Sales Order',
        'overview': 'Status Pemenuhan Parsial',
        'form-input': editingOrder ? `Edit Sales Order (${editingOrder.soNumber})` : 'Penerbitan Sales Order Baru',
        'split-pane': `Detail Transaksi (${selectedOrder.soNumber})`,
        'modal-demo': 'Konfirmasi Operasional',
      };
      return ['Komersial', 'Sales Orders', patternLabels[activePattern]];
    }
    if (activeRole === 'ppic') {
      switch (selectedNavId) {
        case 'ppic-targets':
          return ['PPIC & Planning', 'Perencanaan Produksi', 'Target Harian (PCS Terkunci)'];
        case 'ppic-gap':
          return ['PPIC & Planning', 'Perencanaan Produksi', 'Monitoring Gap Produksi'];
        case 'ppic-pack-ratio':
          return ['PPIC & Planning', 'Konfigurasi Lini', 'Rasio Pack-to-PCS'];
        case 'ppic-lanes':
          return ['PPIC & Planning', 'Konfigurasi Lini', 'Master Lini Kerja (Lanes)'];
        case 'ppic-spk':
        default:
          return ['PPIC & Planning', 'Perencanaan Produksi', 'SPK Bulanan per Lini'];
      }
    }
    if (activeRole === 'purchasing') {
      switch (selectedNavId) {
        case 'purchasing-shortage':
          return ['Divisi Pengadaan', 'Kebutuhan Bahan', 'Laporan Kebutuhan (PR) & Shortage'];
        case 'purchasing-po':
          return ['Divisi Pengadaan', 'Kebutuhan Bahan', 'Purchase Order (PO) Bahan Baku Supplier'];
        case 'purchasing-inbound':
          return ['Divisi Pengadaan', 'Kebutuhan Bahan', 'Monitoring Pengadaan & Inbound Material'];
        case 'purchasing-suppliers':
          return ['Divisi Pengadaan', 'Master Pengadaan', 'Master Supplier Bahan Baku'];
        case 'purchasing-materials':
          return ['Divisi Pengadaan', 'Master Pengadaan', 'Master Material & Konversi Satuan (UoM)'];
        case 'purchasing-mrp':
        default:
          return ['Divisi Pengadaan', 'Kebutuhan Bahan', 'Simulasi MRP Demo (BR-MAT-06)'];
      }
    }
    if (activeRole === 'warehouse') {
      switch (selectedNavId) {
        case 'warehouse-grn':
          return ['Gudang Bahan Baku', 'Operasional Gudang', 'Goods Receipt Note (GRN)'];
        case 'warehouse-issue':
          return ['Gudang Bahan Baku', 'Operasional Gudang', 'Material Issue ke Lini'];
        case 'warehouse-inventory':
          return ['Gudang Bahan Baku', 'Persediaan & Ledger', 'Saldo Fisik On-Hand & Lokasi Rak'];
        case 'warehouse-ledger':
          return ['Gudang Bahan Baku', 'Persediaan & Ledger', 'Buku Besar Kartu Stok (Ledger)'];
        case 'warehouse-adj':
          return ['Gudang Bahan Baku', 'Persediaan & Ledger', 'Penyesuaian Stok Material (Adjustment)'];
        case 'warehouse-monitoring':
        default:
          return ['Gudang Bahan Baku', 'Operasional Gudang', 'Monitoring Gudang & Persediaan'];
      }
    }
    if (activeRole === 'admin_operasional') {
      switch (selectedNavId) {
        case 'prod-daily-report':
          return ['Operasional Produksi', 'Lantai Lini', 'Laporan & Input Harian'];
        case 'prod-history':
          return ['Operasional Produksi', 'Lantai Lini', 'Riwayat & Log Produksi Shift'];
        case 'prod-downtime':
          return ['Operasional Produksi', 'Lantai Lini', 'Monitoring Downtime & OEE'];
        case 'prod-fg-stocks':
          return ['Operasional Produksi', 'Persediaan FG', 'Stok Multi-Lokasi Barang Jadi'];
        case 'prod-monitoring':
          return ['Operasional Produksi', 'Lantai Lini', 'Monitoring Produksi Lini'];
        case 'del-sj-list':
          return ['Operasional Pengiriman', 'Surat Jalan', 'Pengelolaan Surat Jalan (SJ)'];
        case 'del-so-matching':
          return ['Operasional Pengiriman', 'Surat Jalan', 'Pencocokan SO & Kontrol Tagihan'];
        case 'del-history':
          return ['Operasional Pengiriman', 'Logistik', 'Riwayat & Log Pengiriman'];
        case 'del-monitoring':
        default:
          return ['Operasional Pengiriman', 'Logistik', 'Monitoring Pengiriman & Armada'];
      }
    }
    if (activeRole === 'finance') {
      switch (selectedNavId) {
        case 'fin-ready-to-bill':
        case 'fin-control-sj':
          return ['Keuangan & Akuntansi', 'Audit Penagihan', 'Surat Jalan Siap Ditagihkan'];
        case 'fin-invoice-list':
        case 'fin-monthly-invoice':
          return ['Keuangan & Akuntansi', 'Faktur Tagihan', 'Manajemen Faktur Tagihan Bulanan'];
        case 'fin-ar-tracking':
          return ['Keuangan & Akuntansi', 'Piutang Usaha', 'Pelacakan Piutang Dagang (AR)'];
        case 'fin-ar-aging':
          return ['Keuangan & Akuntansi', 'Piutang Usaha', 'AR Aging & Analisis Jatuh Tempo (TBD-14)'];
        case 'fin-dashboard':
        default:
          return ['Keuangan & Akuntansi', 'Dashboard & Ringkasan', 'Dashboard Penagihan & AR'];
      }
    }
    if (activeRole === 'management') {
      switch (selectedNavId) {
        case 'mgmt-prod-gap':
          return ['Manajemen', 'Monitoring Produksi', 'Gap Harian & Lini Produksi'];
        case 'mgmt-stock-val':
          return ['Manajemen', 'Persediaan', 'Valuasi Stok Material & FG'];
        case 'mgmt-ar-aging':
          return ['Manajemen', 'Keuangan', 'Aging Piutang & Status Billing'];
        case 'mgmt-kpi':
        default:
          return ['Manajemen', 'Direksi', 'Executive Overview (Preview 5 Domain)'];
      }
    }
    return [roleInfo.department, roleInfo.badgeLabel, 'Workspace Operasional'];
  };

  // Dynamic page title
  const getPageTitle = () => {
    if (activeRole === 'marketing') {
      if (selectedNavId === 'marketing-customers') {
        return 'Master Data Customer B2B & Profil Pelanggan';
      }
      if (selectedNavId === 'marketing-parts') {
        return 'Katalog Part Komponen Manufaktur Otomotif (UoM: PCS)';
      }
      if (selectedNavId === 'marketing-so-fulfillment') {
        return 'Pemantauan Status Pemenuhan Parsial Sales Order (Downstream)';
      }
      const titles: Record<UiPatternType['id'], string> = {
        'data-table': 'Pengelolaan Sales Order & Pemenuhan Pelanggan',
        'overview': 'Status Pemenuhan Parsial — Multi-Track Downstream',
        'form-input': editingOrder
          ? `Edit Sales Order: ${editingOrder.soNumber} — ${editingOrder.customerName}`
          : 'Input Sales Order Baru (Konversi PO Pelanggan)',
        'split-pane': `Detail Dokumen: ${selectedOrder.soNumber} — ${selectedOrder.customerName}`,
        'modal-demo': 'Simulasi Dialog Konfirmasi Operasional',
      };
      return titles[activePattern];
    }
    if (activeRole === 'ppic') {
      switch (selectedNavId) {
        case 'ppic-targets':
          return 'Target Produksi Harian (Satuan Resmi PCS — Terkunci Operator)';
        case 'ppic-gap':
          return 'Monitoring Gap Produksi Harian (Target vs Aktual per Lini)';
        case 'ppic-pack-ratio':
          return 'Konfigurasi Rasio Konversi Pack-to-PCS per Lini & Part';
        case 'ppic-lanes':
          return 'Master Data Lini Kerja Manufaktur (Production Lanes)';
        case 'ppic-spk':
        default:
          return 'Surat Perintah Kerja (SPK) Bulanan per Lini Manufaktur';
      }
    }
    if (activeRole === 'purchasing') {
      switch (selectedNavId) {
        case 'purchasing-shortage':
          return 'Laporan Kebutuhan Bahan (Purchase Requisition) & Penanganan Shortage';
        case 'purchasing-po':
          return 'Manajemen Purchase Order (PO) Supplier Multi-Line Bahan Baku';
        case 'purchasing-inbound':
          return 'Monitoring Pengadaan & Jadwal Kedatangan Bahan (Inbound Tracking)';
        case 'purchasing-suppliers':
          return 'Master Pemasok (Supplier Management) & Evaluasi Kemitraan';
        case 'purchasing-materials':
          return 'Master Material Bahan Baku & Konfigurasi Konversi Satuan (UoM)';
        case 'purchasing-mrp':
        default:
          return 'Simulasi MRP (Material Requirement Planning) & Estimasi Kebutuhan';
      }
    }
    if (activeRole === 'warehouse') {
      switch (selectedNavId) {
        case 'warehouse-grn':
          return 'Goods Receipt Note (GRN) — Penerimaan Fisik Material Baku';
        case 'warehouse-issue':
          return 'Material Issue — Otorisasi Pengeluaran Bahan ke Lini Produksi';
        case 'warehouse-inventory':
          return 'Persediaan Bahan Baku (Raw Material Inventory) & Lokasi Rak';
        case 'warehouse-ledger':
          return 'Kartu Stok Material (Inventory Stock Movements Ledger)';
        case 'warehouse-adj':
          return 'Penyesuaian Stok Material (Stock Adjustment) & Audit Selisih Opname';
        case 'warehouse-monitoring':
        default:
          return 'Monitoring Operasional Gudang Bahan Baku & Persediaan';
      }
    }
    if (activeRole === 'admin_operasional') {
      switch (selectedNavId) {
        case 'prod-daily-report':
          return 'Laporan Produksi Harian & Input Form Aktual Operator (PCS / Pack)';
        case 'prod-history':
          return 'Riwayat Produksi Shift & Log Mesin Operator Lini';
        case 'prod-downtime':
          return 'Monitoring Downtime & Analisis Efisiensi Lini Manufaktur';
        case 'prod-fg-stocks':
          return 'Stok Multi-Lokasi Barang Jadi (Ujung Lini & Gudang FG)';
        case 'prod-monitoring':
          return 'Monitoring Produksi Lini Manufaktur (Lane 1 - 4)';
        case 'del-sj-list':
          return 'Pengelolaan Surat Jalan (Delivery Order) & Penerbitan Dokumen';
        case 'del-so-matching':
          return 'Pencocokan SO vs SJ & Kontrol Gerbang Penagihan (Billing Gate)';
        case 'del-history':
          return 'Riwayat Pengiriman & Log Bukti Serah Terima Fisik Pelanggan';
        case 'del-monitoring':
        default:
          return 'Monitoring Operasional Pengiriman & Armada Logistik';
      }
    }
    if (activeRole === 'finance') {
      switch (selectedNavId) {
        case 'fin-ready-to-bill':
        case 'fin-control-sj':
          return 'Audit Gerbang Penagihan: Surat Jalan Siap Ditagihkan (Ready to Bill)';
        case 'fin-invoice-list':
        case 'fin-monthly-invoice':
          return 'Manajemen Faktur Penagihan Bulanan (Multi-SJ Commercial Invoice)';
        case 'fin-ar-tracking':
          return 'Pelacakan Saldo Piutang Dagang & Status Pelunasan Kas (AR Tracking)';
        case 'fin-ar-aging':
          return 'Analisis Umur Piutang Dagang (AR Aging) & Kepatuhan Termin TBD-14';
        case 'fin-dashboard':
        default:
          return 'Dashboard Penagihan (Billing) & Piutang Dagang (Accounts Receivable)';
      }
    }
    if (activeRole === 'management') {
      switch (selectedNavId) {
        case 'mgmt-prod-gap':
          return 'Monitoring Kinerja Produksi Lini & Gap Harian (SPK)';
        case 'mgmt-stock-val':
          return 'Valuasi & Saldo Persediaan: Bahan Baku & Barang Jadi (FG)';
        case 'mgmt-ar-aging':
          return 'Audit Piutang Usaha (AR) & Status Tagihan Surat Jalan';
        case 'mgmt-kpi':
        default:
          return 'Executive Overview — 5 Domain Operasional Manufaktur';
      }
    }
    return 'Workspace Operasional Manufaktur PT Nutech';
  };

  const isReadOnly = ROLES_METADATA[activeRole].isReadOnly;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#ffffff] text-[#223548]">
      {/* TIER 1: GLOBAL TOPBAR (60px) */}
      <GlobalTopbar activeRole={activeRole} onRoleChange={handleRoleChange} />

      {/* TIER 2: CONTEXT & PAGE HEADER RAIL (Authentic Product Chrome) */}
      <PageHeaderRail
        breadcrumbs={getBreadcrumbs()}
        title={getPageTitle()}
        activePattern={activePattern}
        selectedNavId={selectedNavId}
        onOpenCreateModal={handleOpenCreateOrder}
        onNavigateBack={() => {
          setEditingOrder(null);
          setActivePattern('data-table');
        }}
        isReadOnly={isReadOnly}
      />

      {/* WORKSPACE FRAME: SIDEBAR + MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR NAVIGATION (248px or 64px) */}
        <SidebarNav
          activeRole={activeRole}
          selectedNavId={selectedNavId}
          onSelectNav={(id) => {
            setSelectedNavId(id);
            if (activeRole === 'marketing') {
              if (id === 'marketing-so-list') {
                setActivePattern('data-table');
                setEditingOrder(null);
              }
              if (id === 'marketing-so-fulfillment') {
                setActivePattern('overview');
              }
            }
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* MAIN WORKSPACE CONTENT */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#ffffff] relative">
          <RoleViewContainer
            activeRole={activeRole}
            selectedNavId={selectedNavId}
            activePattern={activePattern}
            onPatternChange={setActivePattern}
            orders={orders}
            selectedOrder={selectedOrder}
            onSelectOrder={(ord) => {
              setSelectedOrder(ord);
              setActivePattern('split-pane');
            }}
            onSaveNewOrder={handleSaveOrder}
            deliveryOrders={deliveryOrders}
            isConfirmModalOpen={isConfirmModalOpen}
            onOpenConfirmModal={() => setIsConfirmModalOpen(true)}
            onCloseConfirmModal={() => setIsConfirmModalOpen(false)}
            customers={customers}
            parts={parts}
            onAddCustomer={handleAddCustomer}
            onAddPart={handleAddPart}
            onEditOrder={handleEditOrder}
            editingOrder={editingOrder}
            onOpenCreateOrder={handleOpenCreateOrder}
            spkOrders={spkOrders}
            onSaveSpk={handleSaveSpk}
            dailyRecords={dailyRecords}
            onUpdateDailyTarget={handleUpdateDailyTarget}
            onUpdateDailyActual={handleUpdateDailyActual}
            packConfigs={packConfigs}
            onSavePackConfig={handleSavePackConfig}
            onDeletePackConfig={handleDeletePackConfig}
            lanes={lanes}
            suppliers={suppliers}
            purchaseOrders={purchaseOrders}
            rawMaterials={rawMaterials}
            bomAssumptions={bomAssumptions}
            shortageTickets={shortageTickets}
            onSavePo={handleSavePo}
            onSaveSupplier={handleSaveSupplier}
            onSaveMaterial={handleSaveMaterial}
            onSaveShortage={handleSaveShortage}
            onCreatePoFromMrp={handleCreatePoFromMrp}
            prefillPoMaterialId={prefillPoMaterialId}
            prefillPoQty={prefillPoQty}
            onClearPoPrefill={handleClearPoPrefill}
            grnList={grnList}
            materialIssues={materialIssues}
            stockMovements={stockMovements}
            stockAdjustments={stockAdjustments}
            storageLocations={storageLocations}
            onSaveGrn={handleSaveGrn}
            onConfirmDraftGrn={handleConfirmDraftGrn}
            onSaveIssue={handleSaveIssue}
            onSaveAdjustment={handleSaveAdjustment}
            onNavigateNavId={(navId) => setSelectedNavId(navId)}
            isGrnModalOpen={isGrnModalOpen}
            setIsGrnModalOpen={setIsGrnModalOpen}
            isIssueModalOpen={isIssueModalOpen}
            setIsIssueModalOpen={setIsIssueModalOpen}
            isAdjModalOpen={isAdjModalOpen}
            setIsAdjModalOpen={setIsAdjModalOpen}
            prefillGrnPoId={prefillGrnPoId}
            prefillIssueMaterialId={prefillIssueMaterialId}
            prefillAdjMaterialId={prefillAdjMaterialId}
            onSetPrefillGrnPoId={(poId) => setPrefillGrnPoId(poId)}
            onSetPrefillIssueMaterialId={(matId) => setPrefillIssueMaterialId(matId)}
            onSetPrefillAdjMaterialId={(matId) => setPrefillAdjMaterialId(matId)}
            fgStocks={fgStocks}
            fgMovements={fgMovements}
            onSaveDailyActual={handleSaveDailyActual}
            onPrintSj={handlePrintSuratJalan}
            onOpenCreateSjModal={() => setIsCreateSjModalOpen(true)}
            onOpenConfirmDeliveryModal={handleOpenConfirmDeliveryModal}
            invoices={invoices}
            paymentRecords={paymentRecords}
            onOpenCreateInvoice={() => handleOpenCreateInvoice()}
            onOpenCreateInvoiceWithSjs={(sjs) => handleOpenCreateInvoice(sjs)}
            onOpenPaymentModal={handleOpenPaymentModal}
          />
        </main>
      </div>

      {/* PERSISTENT STATUS BAR FOOTER (28px) */}
      <FooterStatusBar activeRole={activeRole} />

      {/* DEDICATED DEV SHOWCASE & QA TOOLBAR (ISOLATED FROM END-USER CHROME) */}
      <DevelopmentShowcaseBar
        activePattern={activePattern}
        onSelectPattern={(pat) => setActivePattern(pat)}
        onOpenConfirmModal={() => setIsConfirmModalOpen(true)}
      />

      {/* GLOBAL OPERATIONAL CONFIRMATION MODAL */}
      <ModalDialogPattern
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirmSuccess={() => {
          // Update delivery order status to Delivered
          const updated = deliveryOrders.map((doItem) =>
            doItem.sjNumber === 'SJ-2026-0091' ? { ...doItem, status: 'Delivered' as const } : doItem
          );
          setDeliveryOrders(updated);
        }}
      />

      {/* CREATE SURAT JALAN MODAL (SPRINT 06) */}
      <CreateSuratJalanModal
        isOpen={isCreateSjModalOpen}
        salesOrders={orders}
        existingSjCount={deliveryOrders.length}
        onClose={() => setIsCreateSjModalOpen(false)}
        onCreateSj={handleCreateSuratJalan}
      />

      {/* CONFIRM PHYSICAL DELIVERY & DEDUCT FG MODAL (SPRINT 06) */}
      <DeliveryConfirmationModal
        isOpen={isConfirmDeliveryModalOpen}
        sj={confirmDeliveryTarget}
        fgStocks={fgStocks}
        onClose={() => {
          setIsConfirmDeliveryModalOpen(false);
          setConfirmDeliveryTarget(null);
        }}
        onConfirm={handleConfirmDelivery}
      />

      {/* CREATE INVOICE MODAL (SPRINT 07) */}
      <CreateInvoiceModal
        isOpen={isCreateInvoiceModalOpen}
        customers={customers}
        parts={parts}
        orders={orders}
        deliveryOrders={deliveryOrders}
        existingInvoices={invoices}
        initialSelectedSjNumbers={selectedSjNumbersForInvoice}
        onClose={() => {
          setIsCreateInvoiceModalOpen(false);
          setSelectedSjNumbersForInvoice([]);
        }}
        onCreateInvoice={handleCreateInvoice}
      />

      {/* RECORD PAYMENT MODAL (SPRINT 07) */}
      <PaymentRecordModal
        isOpen={isPaymentModalOpen}
        invoice={paymentTargetInvoice}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentTargetInvoice(null);
        }}
        onRecordPayment={handleRecordPayment}
      />
    </div>
  );
}
