import { Request, Response } from 'express';
import { fallbackDb } from '../db/fallbackDb';

export const getSuppliers = async (req: Request, res: Response) => {
  const list = fallbackDb.suppliers.map(sup => {
    const products = fallbackDb.products.filter(p => p.supplierId === sup.id);
    const purchaseOrders = fallbackDb.purchaseOrders.filter(po => po.supplierId === sup.id);

    return {
      ...sup,
      productCount: products.length,
      orderCount: purchaseOrders.length,
      riskLevel: sup.overallScore >= 95 ? 'LOW' : sup.overallScore >= 90 ? 'MODERATE' : 'ELEVATED',
    };
  });

  return res.json({ success: true, count: list.length, data: list });
};

export const getSupplierById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const supplier = fallbackDb.suppliers.find(s => s.id === id || s.code === id);
  if (!supplier) {
    return res.status(404).json({ success: false, message: 'Supplier not found' });
  }

  const products = fallbackDb.products.filter(p => p.supplierId === supplier.id);
  const purchaseOrders = fallbackDb.purchaseOrders.filter(po => po.supplierId === supplier.id);

  return res.json({
    success: true,
    data: {
      ...supplier,
      products,
      purchaseOrders,
      metrics: {
        onTimeRate: supplier.onTimeDeliveryRate,
        qualityRate: supplier.qualityRate,
        fulfillmentRate: supplier.fulfillmentRate,
        compositeScore: supplier.overallScore,
      },
    },
  });
};

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const { code, name, contactName, email, phone, address, city } = req.body;
    if (!code || !name || !email) {
      return res.status(400).json({ success: false, message: 'Code, Name, and Email are required' });
    }

    const newSup = {
      id: `sup-${Date.now()}`,
      code: code.toUpperCase(),
      name,
      contactName: contactName || 'Primary Contact',
      email,
      phone: phone || '+91 99999 00000',
      address: address || '',
      city: city || 'Chennai',
      country: 'India',
      rating: 4.5,
      onTimeDeliveryRate: 95.0,
      qualityRate: 98.0,
      fulfillmentRate: 95.0,
      overallScore: 96.0,
    };

    fallbackDb.suppliers.push(newSup);
    return res.status(201).json({ success: true, message: 'Supplier created', data: newSup });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
