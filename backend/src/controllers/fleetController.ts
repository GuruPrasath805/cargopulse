import { Request, Response } from 'express';
import { fallbackDb } from '../db/fallbackDb';

export const getVehicles = async (req: Request, res: Response) => {
  const list = fallbackDb.vehicles.map(v => {
    const carrier = fallbackDb.carriers.find(c => c.id === v.carrierId);
    const driver = fallbackDb.drivers.find(d => d.id === v.driverId);
    const activeShipment = fallbackDb.shipments.find(s => s.vehicleId === v.id && s.status !== 'DELIVERED');

    return {
      ...v,
      carrierName: carrier ? carrier.name : 'Unknown Carrier',
      driverName: driver ? driver.name : 'Unassigned',
      driverPhone: driver ? driver.phone : 'N/A',
      loadPct: Math.round((v.currentLoadTons / v.capacityTons) * 100),
      activeShipmentNumber: activeShipment ? activeShipment.trackingNumber : null,
      status: activeShipment ? activeShipment.status : 'AVAILABLE',
    };
  });

  return res.json({ success: true, count: list.length, data: list });
};

export const getDrivers = async (req: Request, res: Response) => {
  const list = fallbackDb.drivers.map(d => {
    const assignedVehicle = fallbackDb.vehicles.find(v => v.driverId === d.id);
    return {
      ...d,
      vehiclePlate: assignedVehicle ? assignedVehicle.plateNumber : 'None Assigned',
    };
  });

  return res.json({ success: true, count: list.length, data: list });
};

export const getCarriers = async (req: Request, res: Response) => {
  return res.json({ success: true, data: fallbackDb.carriers });
};
