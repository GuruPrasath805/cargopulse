import { Request, Response } from 'express';
import { fallbackDb } from '../db/fallbackDb';
import { redisCache } from '../services/redisService';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const cacheKey = 'cargopulse:dashboard:stats';
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, fromCache: true, data: cached });
    }

    const totalProducts = fallbackDb.products.length;
    const totalStock = fallbackDb.inventories.reduce((acc, curr) => acc + curr.quantity, 0);

    // Identify low stock items (quantity <= minStock)
    const lowStockItems = fallbackDb.products.filter(p => {
      const currentStock = fallbackDb.inventories
        .filter(inv => inv.productId === p.id)
        .reduce((sum, item) => sum + item.quantity, 0);
      return currentStock <= p.minStock;
    });

    const activeShipments = fallbackDb.shipments.filter(s =>
      ['ORDERED', 'PACKED', 'DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(s.status)
    ).length;

    const delayedShipments = fallbackDb.shipments.filter(s =>
      s.status === 'DELAYED' || s.riskScore > 50
    ).length;

    const deliveredToday = fallbackDb.shipments.filter(s => s.status === 'DELIVERED').length;

    const totalWarehouses = fallbackDb.warehouses.length;
    const avgUtilization = Math.round(
      fallbackDb.warehouses.reduce((acc, w) => acc + w.utilizationPct, 0) / (totalWarehouses || 1)
    );

    const pendingReturns = fallbackDb.returns.filter(r => r.status !== 'COMPLETED' && r.status !== 'REJECTED').length;

    // Supply Chain Risk Score Calculation (0 - 100)
    // Delayed shipments weight + low stock weight + supplier delays
    let riskScore = 20; // baseline
    if (delayedShipments > 0) riskScore += Math.min(35, delayedShipments * 18);
    if (lowStockItems.length > 0) riskScore += Math.min(25, lowStockItems.length * 12);
    if (avgUtilization > 80) riskScore += 15;
    riskScore = Math.min(98, Math.max(12, riskScore));

    const stats = {
      totalProducts,
      totalStock,
      lowStockCount: lowStockItems.length,
      activeShipments,
      delayedShipments,
      deliveredToday,
      totalWarehouses,
      avgUtilization,
      pendingReturns,
      supplyChainRiskScore: riskScore,
      riskLevel: riskScore > 65 ? 'CRITICAL' : riskScore > 40 ? 'MODERATE' : 'OPTIMAL',
    };

    await redisCache.set(cacheKey, stats, 60);

    return res.json({ success: true, fromCache: false, data: stats });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getInventoryMovementTrend = async (req: Request, res: Response) => {
  // 7-day movement trend
  const trendData = [
    { day: 'Mon', inbound: 420, outbound: 280, transferred: 95 },
    { day: 'Tue', inbound: 310, outbound: 340, transferred: 60 },
    { day: 'Wed', inbound: 580, outbound: 410, transferred: 120 },
    { day: 'Thu', inbound: 240, outbound: 310, transferred: 80 },
    { day: 'Fri', inbound: 690, outbound: 520, transferred: 140 },
    { day: 'Sat', inbound: 380, outbound: 460, transferred: 70 },
    { day: 'Sun', inbound: 150, outbound: 190, transferred: 30 },
  ];

  return res.json({ success: true, data: trendData });
};

export const getShipmentDistribution = async (req: Request, res: Response) => {
  const distribution = [
    { name: 'In Transit', count: 42, color: '#3b82f6' },
    { name: 'Processing & Packed', count: 21, color: '#eab308' },
    { name: 'Delivered', count: 54, color: '#10b981' },
    { name: 'Delayed / High Risk', count: 12, color: '#ef4444' },
    { name: 'Out for Delivery', count: 18, color: '#8b5cf6' },
  ];

  return res.json({ success: true, data: distribution });
};

export const getRecentActivities = async (req: Request, res: Response) => {
  const activities = [
    {
      id: 'act-1',
      type: 'SHIPMENT_DELAY',
      title: 'Shipment #SH-10234 delayed near Krishnagiri',
      timestamp: '12 mins ago',
      severity: 'WARNING',
      icon: 'Truck',
    },
    {
      id: 'act-2',
      type: 'STOCK_IN',
      title: 'PO-10231 received: 100 units Dell Latitude at Chennai Hub',
      timestamp: '45 mins ago',
      severity: 'SUCCESS',
      icon: 'PackageCheck',
    },
    {
      id: 'act-3',
      type: 'INSPECTION',
      title: 'Return #RET-1023 inspected: 2 units flagged for chassis repair',
      timestamp: '2 hours ago',
      severity: 'INFO',
      icon: 'RotateCcw',
    },
    {
      id: 'act-4',
      type: 'STOCK_TRANSFER',
      title: '20 units Ceramic Brake Kits transferred to Mumbai JNPT Hub',
      timestamp: '4 hours ago',
      severity: 'INFO',
      icon: 'ArrowRightLeft',
    },
    {
      id: 'act-5',
      type: 'STOCK_ALERT',
      title: 'Low Stock threshold breached for Dell Latitude at Bangalore WH',
      timestamp: '5 hours ago',
      severity: 'CRITICAL',
      icon: 'AlertTriangle',
    },
  ];

  return res.json({ success: true, data: activities });
};
