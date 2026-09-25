import { Request, Response } from 'express';
import { fallbackDb } from '../db/fallbackDb';

export const getShipments = async (req: Request, res: Response) => {
  const { status, originId, destId } = req.query;

  let list = fallbackDb.shipments.map(s => {
    const origin = fallbackDb.warehouses.find(w => w.id === s.originWarehouseId);
    const dest = fallbackDb.warehouses.find(w => w.id === s.destWarehouseId);
    const carrier = fallbackDb.carriers.find(c => c.id === s.carrierId);
    const vehicle = fallbackDb.vehicles.find(v => v.id === s.vehicleId);
    const driver = fallbackDb.drivers.find(d => d.id === s.driverId);

    const itemsEnriched = s.items.map(item => {
      const prod = fallbackDb.products.find(p => p.id === item.productId);
      return {
        ...item,
        productName: prod ? prod.name : 'Unknown Product',
        sku: prod ? prod.sku : 'N/A',
      };
    });

    return {
      ...s,
      originName: origin ? origin.name : 'Origin Hub',
      originCity: origin ? origin.city : 'Chennai',
      destName: dest ? dest.name : 'Destination Address',
      destCity: dest ? dest.city : 'Bangalore',
      carrierName: carrier ? carrier.name : 'Standard Carrier',
      vehiclePlate: vehicle ? vehicle.plateNumber : 'N/A',
      vehicleType: vehicle ? vehicle.type : 'Truck',
      driverName: driver ? driver.name : 'Assigned Driver',
      driverPhone: driver ? driver.phone : 'N/A',
      items: itemsEnriched,
      isDelayed: s.status === 'DELAYED' || s.riskScore > 50,
    };
  });

  if (status) list = list.filter(s => s.status === status);
  if (originId) list = list.filter(s => s.originWarehouseId === originId);
  if (destId) list = list.filter(s => s.destWarehouseId === destId);

  return res.json({ success: true, count: list.length, data: list });
};

export const getShipmentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const shipment = fallbackDb.shipments.find(s => s.id === id || s.trackingNumber.toLowerCase() === id.toLowerCase());
  if (!shipment) {
    return res.status(404).json({ success: false, message: 'Shipment not found' });
  }

  const origin = fallbackDb.warehouses.find(w => w.id === shipment.originWarehouseId);
  const dest = fallbackDb.warehouses.find(w => w.id === shipment.destWarehouseId);
  const carrier = fallbackDb.carriers.find(c => c.id === shipment.carrierId);
  const vehicle = fallbackDb.vehicles.find(v => v.id === shipment.vehicleId);
  const driver = fallbackDb.drivers.find(d => d.id === shipment.driverId);

  const itemsEnriched = shipment.items.map(item => {
    const prod = fallbackDb.products.find(p => p.id === item.productId);
    return {
      ...item,
      productName: prod ? prod.name : 'Unknown Product',
      sku: prod ? prod.sku : 'N/A',
    };
  });

  // Calculate milestones
  const allMilestones = [
    { key: 'ORDERED', label: 'Order Confirmed', completed: true },
    { key: 'PACKED', label: 'Packed & Weighed', completed: ['PACKED', 'DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(shipment.status) },
    { key: 'DISPATCHED', label: 'Dispatched from Hub', completed: ['DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(shipment.status) },
    { key: 'IN_TRANSIT', label: 'In Transit on Route', completed: ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(shipment.status) },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', completed: ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(shipment.status) },
    { key: 'DELIVERED', label: 'Delivered to Recipient', completed: shipment.status === 'DELIVERED' },
  ];

  return res.json({
    success: true,
    data: {
      ...shipment,
      origin,
      dest,
      carrier,
      vehicle,
      driver,
      items: itemsEnriched,
      milestones: allMilestones,
    },
  });
};

export const createShipment = async (req: Request, res: Response) => {
  try {
    const { originWarehouseId, destWarehouseId, destinationAddress, carrierId, vehicleId, driverId, estimatedDelivery, items } = req.body;
    if (!originWarehouseId || !destinationAddress || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Origin, Destination address, and items are required' });
    }

    const trackingNumber = `SH-${Math.floor(10000 + Math.random() * 90000)}`;
    const shipmentId = `sh-${Date.now()}`;

    const newShipment = {
      id: shipmentId,
      trackingNumber,
      originWarehouseId,
      destWarehouseId,
      destinationAddress,
      carrierId: carrierId || fallbackDb.carriers[0].id,
      vehicleId: vehicleId || fallbackDb.vehicles[0].id,
      driverId: driverId || fallbackDb.drivers[0].id,
      status: 'ORDERED' as const,
      estimatedDelivery: estimatedDelivery || new Date(Date.now() + 2 * 86400000).toISOString(),
      currentLocation: 'Origin Fulfillment Hub',
      currentLat: 12.9815,
      currentLng: 80.0152,
      riskScore: 10,
      items,
      trackingEvents: [
        {
          id: `te-${Date.now()}`,
          shipmentId,
          status: 'ORDERED',
          location: 'Origin Warehouse Facility',
          timestamp: new Date().toISOString(),
          note: 'Shipment created and ready for pick & pack.',
        },
      ],
      createdAt: new Date().toISOString(),
    };

    fallbackDb.shipments.unshift(newShipment);

    return res.status(201).json({ success: true, message: 'Shipment created successfully', data: newShipment });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const addTrackingEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, location, note, latitude, longitude } = req.body;

    const shipment = fallbackDb.shipments.find(s => s.id === id || s.trackingNumber === id);
    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    if (status) shipment.status = status;
    if (location) shipment.currentLocation = location;
    if (latitude) shipment.currentLat = latitude;
    if (longitude) shipment.currentLng = longitude;

    const event = {
      id: `te-${Date.now()}`,
      shipmentId: shipment.id,
      status: status || shipment.status,
      location: location || shipment.currentLocation,
      latitude: latitude || shipment.currentLat,
      longitude: longitude || shipment.currentLng,
      note: note || 'Location updated via telematics ping.',
      timestamp: new Date().toISOString(),
    };

    shipment.trackingEvents.push(event);

    return res.json({ success: true, message: 'Tracking event recorded', data: event, shipment });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
