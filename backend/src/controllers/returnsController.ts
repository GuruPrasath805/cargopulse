import { Request, Response } from 'express';
import { fallbackDb } from '../db/fallbackDb';

export const getReturns = async (req: Request, res: Response) => {
  const list = fallbackDb.returns.map(ret => {
    const warehouse = fallbackDb.warehouses.find(w => w.id === ret.warehouseId);
    const enrichedItems = ret.items.map(it => {
      const prod = fallbackDb.products.find(p => p.id === it.productId);
      return {
        ...it,
        productName: prod ? prod.name : 'Unknown Product',
        sku: prod ? prod.sku : 'N/A',
      };
    });

    return {
      ...ret,
      warehouseName: warehouse ? warehouse.name : 'Unknown Warehouse',
      warehouseCode: warehouse ? warehouse.code : 'N/A',
      items: enrichedItems,
    };
  });

  return res.json({ success: true, count: list.length, data: list });
};

export const createReturn = async (req: Request, res: Response) => {
  try {
    const { customerName, customerEmail, warehouseId, reason, items } = req.body;
    if (!customerName || !warehouseId || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Customer name, warehouse, and items are required' });
    }

    const returnNo = `RET-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReturn = {
      id: `ret-${Date.now()}`,
      returnNo,
      customerName,
      customerEmail: customerEmail || 'customer@client.com',
      warehouseId,
      status: 'REQUESTED' as const,
      decision: 'PENDING' as const,
      reason: reason || 'Customer requested RMA return',
      items,
      createdAt: new Date().toISOString(),
    };

    fallbackDb.returns.unshift(newReturn);

    return res.status(201).json({ success: true, message: 'Return RMA request initiated', data: newReturn });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const processInspectionDecision = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { decision, inspectionNotes } = req.body;

    const validDecisions = ['RESTOCK', 'REPAIR', 'REPLACE', 'SCRAP'];
    if (!validDecisions.includes(decision)) {
      return res.status(400).json({ success: false, message: `Invalid decision. Allowed: [${validDecisions.join(', ')}]` });
    }

    const returnRecord = fallbackDb.returns.find(r => r.id === id || r.returnNo === id);
    if (!returnRecord) {
      return res.status(404).json({ success: false, message: 'Return record not found' });
    }

    returnRecord.decision = decision;
    returnRecord.status = 'COMPLETED';
    returnRecord.inspectionNotes = inspectionNotes || `Triage completed. Decision executed: ${decision}`;

    // If RESTOCK, automatically return goods into warehouse inventory!
    if (decision === 'RESTOCK') {
      returnRecord.items.forEach(item => {
        let inv = fallbackDb.inventories.find(
          i => i.productId === item.productId && i.warehouseId === returnRecord.warehouseId
        );

        let prevStock = 0;
        if (inv) {
          prevStock = inv.quantity;
          inv.quantity += item.quantity;
          inv.updatedAt = new Date().toISOString();
        } else {
          inv = {
            id: `inv-${Date.now()}`,
            productId: item.productId,
            warehouseId: returnRecord.warehouseId,
            quantity: item.quantity,
            batchNumber: `RESTOCK-${returnRecord.returnNo}`,
            updatedAt: new Date().toISOString(),
          };
          fallbackDb.inventories.push(inv);
        }

        // Record RETURN transaction in ledger
        fallbackDb.transactions.unshift({
          id: `tx-${Date.now()}`,
          transactionNo: `TX-RET-${Date.now().toString().slice(-6)}`,
          productId: item.productId,
          warehouseId: returnRecord.warehouseId,
          type: 'RETURN',
          quantity: item.quantity,
          previousStock: prevStock,
          newStock: inv.quantity,
          reason: `Restocked after RMA inspection QA passed (${returnRecord.returnNo})`,
          referenceDoc: returnRecord.returnNo,
          userId: req.user?.id || 'usr-wm-1',
          createdAt: new Date().toISOString(),
        });
      });
    }

    return res.json({
      success: true,
      message: `Return inspection completed with decision: ${decision}`,
      data: returnRecord,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
