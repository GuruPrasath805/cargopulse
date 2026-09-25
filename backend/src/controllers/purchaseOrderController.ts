import { Request, Response } from 'express';
import { fallbackDb } from '../db/fallbackDb';

export const getPurchaseOrders = async (req: Request, res: Response) => {
  const { status, supplierId, warehouseId } = req.query;

  let list = fallbackDb.purchaseOrders.map(po => {
    const supplier = fallbackDb.suppliers.find(s => s.id === po.supplierId);
    const warehouse = fallbackDb.warehouses.find(w => w.id === po.warehouseId);
    const enrichedItems = po.items.map(item => {
      const prod = fallbackDb.products.find(p => p.id === item.productId);
      return {
        ...item,
        productName: prod ? prod.name : 'Unknown Product',
        sku: prod ? prod.sku : 'N/A',
      };
    });

    return {
      ...po,
      supplierName: supplier ? supplier.name : 'Unknown',
      warehouseName: warehouse ? warehouse.name : 'Unknown',
      warehouseCode: warehouse ? warehouse.code : 'N/A',
      items: enrichedItems,
    };
  });

  if (status) list = list.filter(po => po.status === status);
  if (supplierId) list = list.filter(po => po.supplierId === supplierId);
  if (warehouseId) list = list.filter(po => po.warehouseId === warehouseId);

  return res.json({ success: true, count: list.length, data: list });
};

export const getPurchaseOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const po = fallbackDb.purchaseOrders.find(p => p.id === id || p.orderNo === id);
  if (!po) {
    return res.status(404).json({ success: false, message: 'Purchase Order not found' });
  }

  const supplier = fallbackDb.suppliers.find(s => s.id === po.supplierId);
  const warehouse = fallbackDb.warehouses.find(w => w.id === po.warehouseId);
  const items = po.items.map(item => {
    const prod = fallbackDb.products.find(p => p.id === item.productId);
    return {
      ...item,
      productName: prod ? prod.name : 'Unknown',
      sku: prod ? prod.sku : 'N/A',
    };
  });

  return res.json({
    success: true,
    data: {
      ...po,
      supplier,
      warehouse,
      items,
    },
  });
};

export const createPurchaseOrder = async (req: any, res: Response) => {
  try {
    const { supplierId, warehouseId, expectedDate, items } = req.body;
    if (!supplierId || !warehouseId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Supplier, Warehouse, and line items are required' });
    }

    const orderNo = `PO-${Math.floor(10000 + Math.random() * 90000)}`;
    const poId = `po-${Date.now()}`;

    let totalAmount = 0;
    const poItems = items.map((it: any, idx: number) => {
      const prod = fallbackDb.products.find(p => p.id === it.productId);
      const price = it.unitPrice || prod?.price || 100;
      const qty = parseInt(it.quantity, 10) || 1;
      const total = price * qty;
      totalAmount += total;

      return {
        id: `poi-${poId}-${idx + 1}`,
        purchaseOrderId: poId,
        productId: it.productId,
        quantity: qty,
        unitPrice: price,
        totalPrice: total,
        receivedQty: 0,
      };
    });

    const newPO = {
      id: poId,
      orderNo,
      supplierId,
      warehouseId,
      status: 'PENDING' as const,
      totalAmount,
      currency: 'INR',
      expectedDate: expectedDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      createdById: req.user?.id || 'usr-wm-1',
      items: poItems,
      createdAt: new Date().toISOString(),
    };

    fallbackDb.purchaseOrders.unshift(newPO);

    return res.status(201).json({ success: true, message: 'Purchase order created successfully', data: newPO });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updatePOStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const po = fallbackDb.purchaseOrders.find(p => p.id === id || p.orderNo === id);
    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }

    const previousStatus = po.status;
    po.status = status;

    // AUTOMATIC STOCKING WHEN STATUS REACHES 'RECEIVED'
    if (status === 'RECEIVED' && previousStatus !== 'RECEIVED') {
      po.receivedDate = new Date().toISOString();

      po.items.forEach(item => {
        item.receivedQty = item.quantity;

        let inv = fallbackDb.inventories.find(
          i => i.productId === item.productId && i.warehouseId === po.warehouseId
        );

        let prevStock = 0;
        if (inv) {
          prevStock = inv.quantity;
          inv.quantity += item.quantity;
          inv.updatedAt = new Date().toISOString();
        } else {
          inv = {
            id: `inv-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            productId: item.productId,
            warehouseId: po.warehouseId,
            quantity: item.quantity,
            batchNumber: `BATCH-${po.orderNo}`,
            updatedAt: new Date().toISOString(),
          };
          fallbackDb.inventories.push(inv);
        }

        // Record immutable transaction history
        fallbackDb.transactions.unshift({
          id: `tx-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          transactionNo: `TX-PO-${po.orderNo}-${Date.now().toString().slice(-4)}`,
          productId: item.productId,
          warehouseId: po.warehouseId,
          type: 'STOCK_IN',
          quantity: item.quantity,
          previousStock: prevStock,
          newStock: inv.quantity,
          reason: `Auto-stocked from Purchase Order ${po.orderNo}`,
          referenceDoc: po.orderNo,
          userId: req.user?.id || 'usr-wm-1',
          createdAt: new Date().toISOString(),
        });
      });

      // Notification
      fallbackDb.notifications.unshift({
        id: `notif-${Date.now()}`,
        title: `PO ${po.orderNo} Received & Stocked`,
        message: `Goods for order ${po.orderNo} have been successfully verified and added to warehouse inventory.`,
        severity: 'SUCCESS',
        type: 'PURCHASE_ORDER',
        isRead: false,
        link: '/inventory',
        createdAt: new Date().toISOString(),
      });
    }

    return res.json({ success: true, message: `PO status updated to ${status}`, data: po });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
