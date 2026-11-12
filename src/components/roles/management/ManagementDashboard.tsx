/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Modul 1: Executive Management Dashboard (FEAT-DSH-01, BRD F-12, BR-ROL-01)
 * Murni Read-Only, mengintegrasikan 5 domain operasional + Data Integrity Exceptions
 */

import { SalesOrder, DeliveryOrder, RawMaterial } from '../../../types/erp';
import { ExecutiveHeader } from './ExecutiveHeader';
import { ProductionPerformanceHero } from './ProductionPerformanceHero';
import { MaterialInventoryCard } from './MaterialInventoryCard';
import { FinishedGoodsCard } from './FinishedGoodsCard';
import { DeliveryMonitoringCard } from './DeliveryMonitoringCard';
import { AccountReceivableCard } from './AccountReceivableCard';
import { DataIntegrityExceptions } from './DataIntegrityExceptions';
import { ExecutiveToolbar } from './ExecutiveToolbar';

interface ManagementDashboardProps {
  orders: SalesOrder[];
  deliveryOrders: DeliveryOrder[];
  rawMaterials?: RawMaterial[];
}

export const ManagementDashboard: React.FC<ManagementDashboardProps> = ({
  orders,
  deliveryOrders,
  rawMaterials,
}) => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#ffffff] p-6 pb-12 space-y-5">
      {/* 1. Header Eksekutif & Asumsi Shift */}
      <ExecutiveHeader />

      {/* 2. Hero Section: Kinerja Produksi Lini (Full Width) */}
      <ProductionPerformanceHero />

      {/* 3. Grid 2 Kolom Seimbang: 4 Domain Operasional (560px per kolom pada baseline 1440x900) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Domain 2: Material Inventory */}
        <MaterialInventoryCard materials={rawMaterials} />

        {/* Domain 3: Finished Goods Warehouse */}
        <FinishedGoodsCard />

        {/* Domain 4: Delivery Monitoring */}
        <DeliveryMonitoringCard deliveryOrders={deliveryOrders} />

        {/* Domain 5: Billing & Account Receivable */}
        <AccountReceivableCard orders={orders} />
      </div>

      {/* 4. Seksi Khusus Audit: Data Integrity Exceptions */}
      <DataIntegrityExceptions />

      {/* 5. Action Toolbar (100% Read-Only, Disabled Export PDF) */}
      <ExecutiveToolbar />
    </div>
  );
};
