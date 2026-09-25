import { Request, Response } from 'express';
import { fallbackDb } from '../db/fallbackDb';

export const getProducts = async (req: Request, res: Response) => {
  const { category, search, lowStock } = req.query;

  let list = fallbackDb.products.map(p => {
    const categoryObj = fallbackDb.categories.find(c => c.id === p.categoryId);
    const supplierObj = fallbackDb.suppliers.find(s => s.id === p.supplierId);
    const currentStock = fallbackDb.inventories
      .filter(inv => inv.productId === p.id)
      .reduce((sum, item) => sum + item.quantity, 0);

    const isLowStock = currentStock <= p.minStock;

    // Stockout prediction (Days remaining)
    const daysRemaining = p.dailyDemand > 0 ? (currentStock / p.dailyDemand).toFixed(1) : '99+';

    return {
      ...p,
      category: categoryObj ? categoryObj.name : 'General',
      supplier: supplierObj ? supplierObj.name : 'Unknown',
      currentStock,
      isLowStock,
      daysRemaining: parseFloat(daysRemaining),
    };
  });

  if (category && category !== 'ALL') {
    list = list.filter(p => p.categoryId === category);
  }

  if (search) {
    const term = String(search).toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term));
  }

  if (lowStock === 'true') {
    list = list.filter(p => p.isLowStock);
  }

  return res.json({ success: true, count: list.length, data: list });
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = fallbackDb.products.find(p => p.id === id || p.sku === id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const categoryObj = fallbackDb.categories.find(c => c.id === product.categoryId);
  const supplierObj = fallbackDb.suppliers.find(s => s.id === product.supplierId);

  // Inventories across warehouses
  const warehouseStock = fallbackDb.inventories
    .filter(inv => inv.productId === product.id)
    .map(inv => {
      const wh = fallbackDb.warehouses.find(w => w.id === inv.warehouseId);
      return {
        ...inv,
        warehouseName: wh ? wh.name : 'Unknown',
        warehouseCode: wh ? wh.code : 'UNKNOWN',
      };
    });

  const totalStock = warehouseStock.reduce((sum, item) => sum + item.quantity, 0);

  return res.json({
    success: true,
    data: {
      ...product,
      category: categoryObj?.name,
      supplier: supplierObj?.name,
      totalStock,
      warehouseStock,
    },
  });
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { sku, name, description, categoryId, unit, price, minStock, maxStock, weightKg, supplierId, dailyDemand } = req.body;

    if (!sku || !name || !categoryId || !price) {
      return res.status(400).json({ success: false, message: 'SKU, Name, Category, and Price are required' });
    }

    const existing = fallbackDb.products.find(p => p.sku.toUpperCase() === sku.toUpperCase());
    if (existing) {
      return res.status(400).json({ success: false, message: `Product with SKU ${sku} already exists` });
    }

    const newProduct = {
      id: `prd-${Date.now()}`,
      sku: sku.toUpperCase(),
      name,
      description: description || '',
      categoryId,
      unit: unit || 'units',
      price: Number(price),
      minStock: Number(minStock) || 10,
      maxStock: Number(maxStock) || 500,
      weightKg: Number(weightKg) || 1.0,
      dailyDemand: Number(dailyDemand) || 4.0,
      supplierId: supplierId || fallbackDb.suppliers[0]?.id,
      createdAt: new Date().toISOString(),
    };

    fallbackDb.products.unshift(newProduct);

    return res.status(201).json({ success: true, message: 'Product created successfully', data: newProduct });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  return res.json({ success: true, data: fallbackDb.categories });
};
