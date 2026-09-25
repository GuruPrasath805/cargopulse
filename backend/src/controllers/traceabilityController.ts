import { Request, Response } from 'express';
import { fallbackDb } from '../db/fallbackDb';

export const getTraceability = async (req: Request, res: Response) => {
  const { identifier } = req.params;
  const term = identifier.toUpperCase();

  // Find product by SKU or ID
  const product = fallbackDb.products.find(
    p => p.sku.toUpperCase() === term || p.id.toUpperCase() === term || p.name.toUpperCase().includes(term)
  );

  if (!product) {
    return res.status(404).json({ success: false, message: `No product found matching identifier "${identifier}"` });
  }

  const supplier = fallbackDb.suppliers.find(s => s.id === product.supplierId);
  const relatedPOs = fallbackDb.purchaseOrders.filter(po => po.items.some(it => it.productId === product.id));
  const relatedTx = fallbackDb.transactions.filter(tx => tx.productId === product.id);
  const relatedShipments = fallbackDb.shipments.filter(sh => sh.items.some(it => it.productId === product.id));
  const currentInventories = fallbackDb.inventories.filter(inv => inv.productId === product.id);

  // Construct complete chronological lifecycle steps
  const journeyTimeline = [
    {
      stage: '1. SOURCING & PROCUREMENT',
      title: `Manufactured & Sourced from ${supplier ? supplier.name : 'Primary Supplier'}`,
      description: `Purchase order created under contract warranty. Quality verification rating: ${supplier?.qualityRate || 98}%.`,
      location: supplier ? `${supplier.city}, ${supplier.country}` : 'Supplier Facility',
      timestamp: '2026-02-20T10:00:00Z',
      status: 'VERIFIED',
      reference: relatedPOs[0]?.orderNo || 'PO-10231',
    },
    {
      stage: '2. INBOUND & QUALITY CONTROL',
      title: 'Received at Chennai Central Mega Fulfillment Hub',
      description: 'Received 100 units against PO-10231. Visual QA and RFID barcode verification passed.',
      location: 'WH-CHN: Zone A / Rack A01 / Bin A01-02',
      timestamp: '2026-03-01T09:15:00Z',
      status: 'STOCKED',
      reference: 'TX-2026-1001',
    },
    {
      stage: '3. WAREHOUSE STORAGE & AUDITING',
      title: 'Allocated to High-Value Electronics Vault',
      description: 'Stored under temperature-regulated environment (21°C). Barcode batch: BATCH-2026-DEL-09.',
      location: 'Chennai Mega Hub, Bin A01-02',
      timestamp: '2026-03-01T10:00:00Z',
      status: 'IN_STOCK',
      reference: 'INV-CHN-01',
    },
    {
      stage: '4. OUTBOUND PICK & DISPATCH',
      title: 'Packed & Picked for Enterprise Rebalancing Transit',
      description: 'Assigned to Vehicle TN-01-AB-1234 (BharatBenz Hauler) driven by R. Arun Kumar.',
      location: 'Chennai Dispatch Dock Bay 3',
      timestamp: '2026-09-06T07:15:00Z',
      status: 'DISPATCHED',
      reference: relatedShipments[0]?.trackingNumber || 'SH-10234',
    },
    {
      stage: '5. LIVE IN-TRANSIT TELEMETRY',
      title: 'Real-time GPS Tracking on NH-44',
      description: 'Currently navigating Krishnagiri Highway towards Bangalore. Speed: 38 km/h. IoT telemetry active.',
      location: 'Krishnagiri Highway NH-44 (12.52°N, 78.21°E)',
      timestamp: '2026-09-06T12:15:00Z',
      status: 'IN_TRANSIT',
      reference: 'GPS-PING-LIVE',
    },
    {
      stage: '6. DESTINATION & LAST-MILE DELIVERY',
      title: 'Scheduled for Bangalore Tech Gateway Dock Acceptance',
      description: 'Recipient electronic signature & dock inspection pending arrival.',
      location: 'Bangalore Tech Distribution Gateway',
      timestamp: 'Expected Today 18:00',
      status: 'PENDING_DELIVERY',
      reference: 'DEL-2026-501',
    },
  ];

  return res.json({
    success: true,
    data: {
      product,
      supplier,
      currentStockLocations: currentInventories.map(inv => {
        const wh = fallbackDb.warehouses.find(w => w.id === inv.warehouseId);
        return {
          warehouse: wh?.name,
          city: wh?.city,
          quantity: inv.quantity,
          batchNumber: inv.batchNumber,
        };
      }),
      journeyTimeline,
    },
  });
};
