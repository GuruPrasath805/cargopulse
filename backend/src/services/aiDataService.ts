import { fallbackDb, ProductEntity, InventoryEntity, ShipmentEntity, PurchaseOrderEntity, SupplierEntity } from '../db/fallbackDb';

/**
 * Controlled, read-only data access service for AI queries.
 * Never gives unrestricted raw SQL or full DB access to LLMs.
 */
export interface InventorySummary {
  totalSkus: number;
  totalUnitsInStock: number;
  lowStockCount: number;
  warehousesCount: number;
  lowStockItems: Array<{
    sku: string;
    name: string;
    currentStock: number;
    minStock: number;
    burnRate: number;
    daysRemaining: number;
    status: 'CRITICAL' | 'WARNING' | 'HEALTHY';
  }>;
}

export interface ShipmentStatusResult {
  found: boolean;
  shipment?: {
    id: string;
    trackingNumber: string;
    status: string;
    origin: string;
    destination: string;
    carrier: string;
    driverName: string;
    driverPhone: string;
    vehiclePlate: string;
    estimatedDelivery: string;
    actualDelivery?: string;
    currentLocation: string;
    riskScore: number;
    delayReason?: string;
    latestEvent?: {
      status: string;
      location: string;
      timestamp: string;
      note?: string;
    };
  };
}

export class AiDataService {
  /**
   * Retrieves high-level inventory metrics and items below safety threshold.
   */
  static async getInventorySummary(): Promise<InventorySummary> {
    const products = fallbackDb.products;
    const inventories = fallbackDb.inventories;
    const warehouses = fallbackDb.warehouses;

    let totalUnits = 0;
    const lowStockItems: InventorySummary['lowStockItems'] = [];

    for (const prod of products) {
      const stock = inventories
        .filter(i => i.productId === prod.id)
        .reduce((sum, item) => sum + item.quantity, 0);

      totalUnits += stock;
      const burn = prod.dailyDemand || 4.0;
      const days = Number((stock / burn).toFixed(1));

      let status: 'CRITICAL' | 'WARNING' | 'HEALTHY' = 'HEALTHY';
      if (stock <= prod.minStock) {
        status = 'CRITICAL';
      } else if (stock <= prod.minStock * 1.3) {
        status = 'WARNING';
      }

      if (status !== 'HEALTHY') {
        lowStockItems.push({
          sku: prod.sku,
          name: prod.name,
          currentStock: stock,
          minStock: prod.minStock,
          burnRate: burn,
          daysRemaining: days,
          status,
        });
      }
    }

    return {
      totalSkus: products.length,
      totalUnitsInStock: totalUnits,
      lowStockCount: lowStockItems.length,
      warehousesCount: warehouses.length,
      lowStockItems,
    };
  }

  /**
   * Returns list of products with current stock <= minStock.
   */
  static async getLowStockProducts() {
    const summary = await this.getInventorySummary();
    return summary.lowStockItems;
  }

  /**
   * Safe lookup of a single shipment by trackingNumber or ID.
   */
  static async getShipmentStatus(trackingOrId: string): Promise<ShipmentStatusResult> {
    const term = (trackingOrId || '').trim().toUpperCase();
    const ship = fallbackDb.shipments.find(
      s => s.trackingNumber.toUpperCase() === term || s.id.toUpperCase() === term
    );

    if (!ship) {
      return { found: false };
    }

    const originWh = fallbackDb.warehouses.find(w => w.id === ship.originWarehouseId)?.name || 'Central Logistics Hub';
    const destWh = ship.destWarehouseId
      ? fallbackDb.warehouses.find(w => w.id === ship.destWarehouseId)?.name
      : undefined;
    const destination = destWh || ship.destinationAddress || 'Consignee Dock';

    const carrier = fallbackDb.carriers.find(c => c.id === ship.carrierId)?.name || 'Express Logistics';
    const driver = fallbackDb.drivers.find(d => d.id === ship.driverId);
    const vehicle = fallbackDb.vehicles.find(v => v.id === ship.vehicleId);

    const latestEvent = ship.trackingEvents && ship.trackingEvents.length > 0
      ? ship.trackingEvents[ship.trackingEvents.length - 1]
      : undefined;

    return {
      found: true,
      shipment: {
        id: ship.id,
        trackingNumber: ship.trackingNumber,
        status: ship.status,
        origin: originWh,
        destination,
        carrier,
        driverName: driver?.name || 'Assigned Driver',
        driverPhone: driver?.phone || 'Confidential Telematics',
        vehiclePlate: vehicle?.plateNumber || 'FLEET-HAUL',
        estimatedDelivery: ship.estimatedDelivery,
        actualDelivery: ship.actualDelivery,
        currentLocation: ship.currentLocation,
        riskScore: ship.riskScore,
        delayReason: ship.delayReason,
        latestEvent: latestEvent ? {
          status: latestEvent.status,
          location: latestEvent.location,
          timestamp: latestEvent.timestamp,
          note: latestEvent.note,
        } : undefined,
      },
    };
  }

  /**
   * Returns all active non-delivered shipments.
   */
  static async getActiveShipments() {
    const nonDelivered = fallbackDb.shipments.filter(
      s => s.status !== 'DELIVERED' && s.status !== 'CANCELLED'
    );

    return nonDelivered.map(s => {
      const origin = fallbackDb.warehouses.find(w => w.id === s.originWarehouseId)?.name || 'Hub';
      const dest = s.destinationAddress;
      const carrier = fallbackDb.carriers.find(c => c.id === s.carrierId)?.name || 'Carrier';
      return {
        id: s.id,
        trackingNumber: s.trackingNumber,
        status: s.status,
        origin,
        destination: dest,
        carrier,
        estimatedDelivery: s.estimatedDelivery,
        currentLocation: s.currentLocation,
        riskScore: s.riskScore,
        delayReason: s.delayReason,
      };
    });
  }

  /**
   * Returns pending purchase orders awaiting supplier dispatch or confirmation.
   */
  static async getPendingPurchaseOrders() {
    const pending = fallbackDb.purchaseOrders.filter(
      po => po.status === 'PENDING' || po.status === 'APPROVED' || po.status === 'PROCESSING'
    );

    return pending.map(po => {
      const sup = fallbackDb.suppliers.find(s => s.id === po.supplierId)?.name || 'Supplier';
      const wh = fallbackDb.warehouses.find(w => w.id === po.warehouseId)?.name || 'Warehouse';
      return {
        orderNo: po.orderNo,
        supplierName: sup,
        warehouseName: wh,
        status: po.status,
        totalAmount: po.totalAmount,
        currency: po.currency,
        expectedDate: po.expectedDate,
        itemCount: po.items?.length || 0,
      };
    });
  }

  /**
   * Returns supplier performance metrics and scorecards.
   */
  static async getSupplierSummary() {
    return fallbackDb.suppliers.map(s => ({
      id: s.id,
      code: s.code,
      name: s.name,
      rating: s.rating,
      onTimeDeliveryRate: s.onTimeDeliveryRate,
      qualityRate: s.qualityRate,
      overallScore: s.overallScore,
      city: s.city,
    }));
  }
}
