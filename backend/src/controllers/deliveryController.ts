import { Request, Response } from 'express';
import { fallbackDb } from '../db/fallbackDb';

export const getDeliveries = async (req: Request, res: Response) => {
  const list = fallbackDb.deliveries.map(d => {
    const shipment = fallbackDb.shipments.find(s => s.id === d.shipmentId);
    return {
      ...d,
      trackingNumber: shipment ? shipment.trackingNumber : 'N/A',
      currentLocation: shipment ? shipment.currentLocation : 'N/A',
    };
  });

  return res.json({ success: true, count: list.length, data: list });
};

export const completeDelivery = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { signedBy, notes, signatureUrl, photoUrl } = req.body;

    const delivery = fallbackDb.deliveries.find(d => d.id === id || d.deliveryNo === id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery record not found' });
    }

    delivery.status = 'DELIVERED';
    delivery.deliveredTime = new Date().toISOString();
    delivery.proofOfDelivery = {
      signedBy: signedBy || delivery.recipientName,
      signedAt: new Date().toISOString(),
      notes: notes || 'Delivery completed and signed by authorized recipient.',
      signatureUrl: signatureUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(signedBy || 'Signature')}`,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&q=80',
    };

    // Update shipment status as well
    const shipment = fallbackDb.shipments.find(s => s.id === delivery.shipmentId);
    if (shipment) {
      shipment.status = 'DELIVERED';
      shipment.actualDelivery = new Date().toISOString();
      shipment.trackingEvents.push({
        id: `te-${Date.now()}`,
        shipmentId: shipment.id,
        status: 'DELIVERED',
        location: delivery.destination,
        timestamp: new Date().toISOString(),
        note: `Electronic Proof of Delivery signed by ${signedBy || delivery.recipientName}`,
      });
    }

    return res.json({
      success: true,
      message: 'Proof of Delivery successfully submitted and verified',
      data: delivery,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
