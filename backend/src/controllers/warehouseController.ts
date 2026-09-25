import { Request, Response } from 'express';
import { fallbackDb } from '../db/fallbackDb';

export const getWarehouses = async (req: Request, res: Response) => {
  const warehouses = fallbackDb.warehouses.map(wh => {
    const stockItems = fallbackDb.inventories.filter(inv => inv.warehouseId === wh.id);
    const totalUnits = stockItems.reduce((sum, item) => sum + item.quantity, 0);

    const activeInbound = fallbackDb.purchaseOrders.filter(po => po.warehouseId === wh.id && ['APPROVED', 'DISPATCHED'].includes(po.status)).length;
    const activeOutbound = fallbackDb.shipments.filter(sh => sh.originWarehouseId === wh.id && ['ORDERED', 'PACKED', 'DISPATCHED', 'IN_TRANSIT'].includes(sh.status)).length;

    let totalBins = 0;
    wh.zones.forEach(z => z.racks.forEach(r => (totalBins += r.bins.length)));

    return {
      ...wh,
      totalUnits,
      totalSKUs: stockItems.length,
      totalZones: wh.zones.length,
      totalBins,
      activeInbound,
      activeOutbound,
    };
  });

  return res.json({ success: true, count: warehouses.length, data: warehouses });
};

export const getWarehouseById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const wh = fallbackDb.warehouses.find(w => w.id === id || w.code.toLowerCase() === id.toLowerCase());
  if (!wh) {
    return res.status(404).json({ success: false, message: 'Warehouse not found' });
  }

  // Enrich zones with bin contents
  const enrichedZones = wh.zones.map(zone => {
    const enrichedRacks = zone.racks.map(rack => {
      const enrichedBins = rack.bins.map(bin => {
        const binStock = fallbackDb.inventories.filter(i => i.binId === bin.id);
        const items = binStock.map(inv => {
          const prod = fallbackDb.products.find(p => p.id === inv.productId);
          return {
            ...inv,
            productName: prod ? prod.name : 'Unknown',
            sku: prod ? prod.sku : 'N/A',
          };
        });

        return {
          ...bin,
          occupied: items.length > 0,
          totalQty: items.reduce((sum, it) => sum + it.quantity, 0),
          items,
        };
      });

      return { ...rack, bins: enrichedBins };
    });

    return { ...zone, racks: enrichedRacks };
  });

  const stockItems = fallbackDb.inventories.filter(inv => inv.warehouseId === wh.id);
  const totalUnits = stockItems.reduce((sum, item) => sum + item.quantity, 0);

  return res.json({
    success: true,
    data: {
      ...wh,
      totalUnits,
      zones: enrichedZones,
    },
  });
};

export const createWarehouse = async (req: Request, res: Response) => {
  try {
    const { code, name, city, state, address, latitude, longitude, capacitySqFt } = req.body;
    if (!code || !name || !city) {
      return res.status(400).json({ success: false, message: 'Code, Name, and City are required' });
    }

    const newWh = {
      id: `wh-${Date.now()}`,
      code: code.toUpperCase(),
      name,
      city,
      state: state || 'State',
      country: 'India',
      address: address || `${city} Logistics Park`,
      latitude: Number(latitude) || 12.9716,
      longitude: Number(longitude) || 77.5946,
      capacitySqFt: Number(capacitySqFt) || 100000,
      utilizationPct: 15.0,
      zones: [
        {
          id: `zone-${Date.now()}-a`,
          code: 'ZONE-A',
          name: 'General Storage Bay',
          warehouseId: `wh-${Date.now()}`,
          racks: [
            {
              id: `rack-${Date.now()}-01`,
              code: 'RACK-A01',
              zoneId: `zone-${Date.now()}-a`,
              bins: [
                { id: `bin-${Date.now()}-01`, code: 'BIN-A01-01', rackId: `rack-${Date.now()}-01` },
                { id: `bin-${Date.now()}-02`, code: 'BIN-A01-02', rackId: `rack-${Date.now()}-01` },
              ],
            },
          ],
        },
      ],
    };

    fallbackDb.warehouses.push(newWh);
    return res.status(201).json({ success: true, message: 'Warehouse created', data: newWh });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
