import { Request, Response } from 'express';
import { fallbackDb } from '../db/fallbackDb';

export const getInventoryList = async (req: Request, res: Response) => {
  const { warehouseId, productId } = req.query;

  let list = fallbackDb.inventories.map(inv => {
    const product = fallbackDb.products.find(p => p.id === inv.productId);
    const warehouse = fallbackDb.warehouses.find(w => w.id === inv.warehouseId);
    let binCode = 'UNASSIGNED';

    if (warehouse && inv.binId) {
      for (const zone of warehouse.zones) {
        for (const rack of zone.racks) {
          const bin = rack.bins.find(b => b.id === inv.binId);
          if (bin) {
            binCode = `${zone.code} / ${rack.code} / ${bin.code}`;
            break;
          }
        }
      }
    }

    return {
      ...inv,
      productName: product ? product.name : 'Unknown Product',
      sku: product ? product.sku : 'N/A',
      category: product ? fallbackDb.categories.find(c => c.id === product.categoryId)?.name : 'General',
      warehouseName: warehouse ? warehouse.name : 'Unknown Warehouse',
      warehouseCode: warehouse ? warehouse.code : 'N/A',
      locationPath: binCode,
      minStock: product ? product.minStock : 10,
      isLowStock: product ? inv.quantity <= product.minStock : false,
    };
  });

  if (warehouseId) {
    list = list.filter(i => i.warehouseId === warehouseId);
  }
  if (productId) {
    list = list.filter(i => i.productId === productId);
  }

  return res.json({ success: true, count: list.length, data: list });
};

export const getTransactions = async (req: Request, res: Response) => {
  const list = fallbackDb.transactions.map(tx => {
    const product = fallbackDb.products.find(p => p.id === tx.productId);
    const warehouse = fallbackDb.warehouses.find(w => w.id === tx.warehouseId);
    const user = fallbackDb.users.find(u => u.id === tx.userId);

    return {
      ...tx,
      productName: product ? product.name : 'Unknown',
      sku: product ? product.sku : 'N/A',
      warehouseName: warehouse ? warehouse.name : 'Unknown',
      userName: user ? user.name : 'System Automation',
    };
  });

  return res.json({ success: true, count: list.length, data: list });
};

export const stockIn = async (req: any, res: Response) => {
  try {
    const { productId, warehouseId, binId, quantity, reason, referenceDoc, batchNumber } = req.body;
    const qty = parseInt(quantity, 10);
    if (!productId || !warehouseId || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid productId, warehouseId, or quantity' });
    }

    let inv = fallbackDb.inventories.find(i => i.productId === productId && i.warehouseId === warehouseId);
    let prevStock = 0;

    if (inv) {
      prevStock = inv.quantity;
      inv.quantity += qty;
      inv.updatedAt = new Date().toISOString();
      if (binId) inv.binId = binId;
    } else {
      inv = {
        id: `inv-${Date.now()}`,
        productId,
        warehouseId,
        binId,
        quantity: qty,
        batchNumber: batchNumber || `BATCH-${Date.now()}`,
        updatedAt: new Date().toISOString(),
      };
      fallbackDb.inventories.push(inv);
    }

    const tx = {
      id: `tx-${Date.now()}`,
      transactionNo: `TX-${Date.now().toString().slice(-6)}`,
      productId,
      warehouseId,
      type: 'STOCK_IN' as const,
      quantity: qty,
      previousStock: prevStock,
      newStock: inv.quantity,
      reason: reason || 'Direct manual stock in',
      referenceDoc: referenceDoc || 'MANUAL-IN',
      userId: req.user?.id || 'usr-admin-1',
      createdAt: new Date().toISOString(),
    };
    fallbackDb.transactions.unshift(tx);

    return res.status(201).json({ success: true, message: 'Stock added successfully', transaction: tx, inventory: inv });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const stockOut = async (req: any, res: Response) => {
  try {
    const { productId, warehouseId, quantity, reason, referenceDoc } = req.body;
    const qty = parseInt(quantity, 10);
    if (!productId || !warehouseId || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid productId, warehouseId, or quantity' });
    }

    const inv = fallbackDb.inventories.find(i => i.productId === productId && i.warehouseId === warehouseId);
    if (!inv || inv.quantity < qty) {
      return res.status(400).json({ success: false, message: `Insufficient stock! Current stock: ${inv ? inv.quantity : 0}` });
    }

    const prevStock = inv.quantity;
    inv.quantity -= qty;
    inv.updatedAt = new Date().toISOString();

    const tx = {
      id: `tx-${Date.now()}`,
      transactionNo: `TX-${Date.now().toString().slice(-6)}`,
      productId,
      warehouseId,
      type: 'STOCK_OUT' as const,
      quantity: qty,
      previousStock: prevStock,
      newStock: inv.quantity,
      reason: reason || 'Manual stock deduction',
      referenceDoc: referenceDoc || 'MANUAL-OUT',
      userId: req.user?.id || 'usr-admin-1',
      createdAt: new Date().toISOString(),
    };
    fallbackDb.transactions.unshift(tx);

    return res.json({ success: true, message: 'Stock removed successfully', transaction: tx, inventory: inv });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const transferStock = async (req: any, res: Response) => {
  try {
    const { productId, sourceWarehouseId, targetWarehouseId, targetBinId, quantity, reason } = req.body;
    const qty = parseInt(quantity, 10);

    if (!productId || !sourceWarehouseId || !targetWarehouseId || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid source, target, or quantity' });
    }

    const sourceInv = fallbackDb.inventories.find(i => i.productId === productId && i.warehouseId === sourceWarehouseId);
    if (!sourceInv || sourceInv.quantity < qty) {
      return res.status(400).json({ success: false, message: 'Insufficient stock in source warehouse' });
    }

    // Deduct from source
    sourceInv.quantity -= qty;
    sourceInv.updatedAt = new Date().toISOString();

    // Add to target
    let targetInv = fallbackDb.inventories.find(i => i.productId === productId && i.warehouseId === targetWarehouseId);
    if (targetInv) {
      targetInv.quantity += qty;
      targetInv.updatedAt = new Date().toISOString();
      if (targetBinId) targetInv.binId = targetBinId;
    } else {
      targetInv = {
        id: `inv-${Date.now()}`,
        productId,
        warehouseId: targetWarehouseId,
        binId: targetBinId,
        quantity: qty,
        updatedAt: new Date().toISOString(),
      };
      fallbackDb.inventories.push(targetInv);
    }

    const txNo = `TRF-${Date.now().toString().slice(-6)}`;
    const tx = {
      id: `tx-${Date.now()}`,
      transactionNo: txNo,
      productId,
      warehouseId: sourceWarehouseId,
      type: 'TRANSFER' as const,
      quantity: qty,
      previousStock: sourceInv.quantity + qty,
      newStock: sourceInv.quantity,
      reason: reason || `Transferred to warehouse ${targetWarehouseId}`,
      referenceDoc: txNo,
      userId: req.user?.id || 'usr-admin-1',
      createdAt: new Date().toISOString(),
    };
    fallbackDb.transactions.unshift(tx);

    return res.json({ success: true, message: 'Inter-warehouse stock transfer successful', transaction: tx });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
