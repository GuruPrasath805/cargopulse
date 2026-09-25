import { Request, Response } from 'express';
import { fallbackDb } from '../db/fallbackDb';

export const getRiskSummary = async (req: Request, res: Response) => {
  const delayedCount = fallbackDb.shipments.filter(s => s.status === 'DELAYED' || s.riskScore > 50).length;
  const lowStockCount = fallbackDb.products.filter(p => {
    const stock = fallbackDb.inventories.filter(i => i.productId === p.id).reduce((s, c) => s + c.quantity, 0);
    return stock <= p.minStock;
  }).length;

  const supplierIssues = fallbackDb.suppliers.filter(s => s.overallScore < 90).length;

  let overallScore = 18;
  const breakdown = [
    { factor: 'Transit Weather & Route Congestion', impact: delayedCount * 18, severity: delayedCount > 0 ? 'HIGH' : 'LOW' },
    { factor: 'Safety Stock Deficit', impact: lowStockCount * 14, severity: lowStockCount > 0 ? 'MEDIUM' : 'LOW' },
    { factor: 'Supplier Lead Time Volatility', impact: supplierIssues * 15, severity: supplierIssues > 0 ? 'MEDIUM' : 'LOW' },
    { factor: 'Warehouse Peak Capacity Stress', impact: 8, severity: 'LOW' },
  ];

  breakdown.forEach(b => (overallScore += b.impact));
  overallScore = Math.min(96, Math.max(15, overallScore));

  return res.json({
    success: true,
    data: {
      overallRiskScore: overallScore,
      riskTier: overallScore > 65 ? 'CRITICAL RISK' : overallScore > 40 ? 'MODERATE RISK' : 'LOW RISK / OPTIMAL',
      recommendations: [
        'Initiate urgent purchase orders for SKUs nearing zero threshold (LAP-001 at WH-BLR).',
        'Reroute Bangalore-bound freight away from NH-44 Krishnagiri ghat section.',
        'Auditing Precision Auto Dynamics due to dipping on-time delivery rate (86.5%).',
      ],
      breakdown,
    },
  });
};

export const getStockoutPredictions = async (req: Request, res: Response) => {
  const predictions = fallbackDb.products.map(product => {
    const totalStock = fallbackDb.inventories
      .filter(i => i.productId === product.id)
      .reduce((sum, item) => sum + item.quantity, 0);

    const dailyBurnRate = product.dailyDemand || 4.5;
    const daysRemaining = Number((totalStock / dailyBurnRate).toFixed(1));

    let risk = 'LOW';
    if (daysRemaining <= 4) risk = 'CRITICAL';
    else if (daysRemaining <= 10) risk = 'MODERATE';

    const projectedStockoutDate = new Date(Date.now() + daysRemaining * 86400000).toISOString().split('T')[0];

    return {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      currentStock: totalStock,
      minStock: product.minStock,
      dailyBurnRate,
      daysRemaining,
      projectedStockoutDate,
      riskLevel: risk,
      suggestedReorderQuantity: Math.max(product.minStock * 3, Math.round(product.dailyDemand * 30)),
    };
  });

  // Sort by lowest days remaining first
  predictions.sort((a, b) => a.daysRemaining - b.daysRemaining);

  return res.json({ success: true, data: predictions });
};

export const getShipmentDelays = async (req: Request, res: Response) => {
  const delays = fallbackDb.shipments.map(s => {
    const carrier = fallbackDb.carriers.find(c => c.id === s.carrierId);
    return {
      shipmentId: s.id,
      trackingNumber: s.trackingNumber,
      status: s.status,
      currentLocation: s.currentLocation,
      carrierName: carrier ? carrier.name : 'Unknown Carrier',
      delayProbability: `${s.riskScore}%`,
      riskScore: s.riskScore,
      delayReason: s.delayReason || (s.riskScore > 50 ? 'Traffic slowdown & checkpoint delays' : 'On Schedule'),
      eta: s.estimatedDelivery,
    };
  });

  return res.json({ success: true, data: delays });
};

export const getSupplierRisk = async (req: Request, res: Response) => {
  const riskList = fallbackDb.suppliers.map(s => {
    const riskScore = Math.round(100 - s.overallScore);
    return {
      id: s.id,
      name: s.name,
      code: s.code,
      score: s.overallScore,
      riskScore,
      riskLevel: riskScore > 15 ? 'HIGH' : riskScore > 8 ? 'MEDIUM' : 'LOW',
      onTimeRate: s.onTimeDeliveryRate,
      qualityRate: s.qualityRate,
    };
  });

  return res.json({ success: true, data: riskList });
};


export const handleAssistantChat = async (req: Request, res: Response) => {
  const { message, context } = req.body;
  const q = (message || '').trim().toLowerCase();

  // Helper to extract low stock items
  const getLowStockProducts = () => {
    return fallbackDb.products.map(p => {
      const currentStock = fallbackDb.inventories
        .filter(i => i.productId === p.id)
        .reduce((sum, item) => sum + item.quantity, 0);
      const burn = p.dailyDemand || 4.5;
      const days = Number((currentStock / burn).toFixed(1));
      return { ...p, currentStock, burn, days };
    }).filter(p => p.currentStock <= p.minStock || p.days <= 7);
  };

  // Helper to extract delayed shipments
  const getDelayedShipments = () => {
    return fallbackDb.shipments.filter(s => s.status === 'DELAYED' || s.riskScore > 40);
  };

  let reply = '';
  let suggestions: string[] = [];
  let quickAction: { label: string; url: string } | undefined = undefined;

  // 1. Specific tracking ID lookup (e.g. SH-10021, SH-10023)
  const shipMatch = q.match(/sh-[a-z0-9]+/i);
  if (shipMatch) {
    const codeStr = shipMatch[0].toUpperCase();
    const ship = fallbackDb.shipments.find(s => s.trackingNumber.toUpperCase() === codeStr || s.id.toUpperCase() === codeStr);
    if (ship) {
      const originWh = fallbackDb.warehouses.find(w => w.id === ship.originWarehouseId)?.name || 'Central Logistics Hub';
      const dest = ship.destinationAddress || 'Consignee Dock';
      const driver = fallbackDb.drivers.find(d => d.id === ship.driverId)?.name || 'Assigned Driver';
      const carrier = fallbackDb.carriers.find(c => c.id === ship.carrierId)?.name || 'Express Line-Haul';

      reply = `### 🚚 Consignment Telematics: **${ship.trackingNumber}**\n\n` +
        `- **Status:** \'${ship.status}\' (Risk Score: **${ship.riskScore}/100**)\n` +
        `- **Carrier:** ${carrier} &bull; **Driver:** ${driver}\n` +
        `- **Route Corridor:** **${originWh}** &rarr; **${dest}**\n` +
        `- **Current Location:** Near ${ship.currentLocation || 'Transit Waypoint'}\n` +
        `- **Estimated Delivery (ETA):** **${new Date(ship.estimatedDelivery).toLocaleString()}**\n\n` +
        `*Operational Recommendation:* ${ship.riskScore > 50 ? '⚠️ High transit delay risk detected. RouteIQ recommends monitoring GPS telemetry.' : '✅ Corridor transit is proceeding on schedule with green telemetry.'}`;
      suggestions = ['Check all delayed shipments', 'View live RouteIQ map', 'Review carrier SLA'];
      quickAction = { label: `View ${ship.trackingNumber} in Logistics`, url: `/logistics/shipments?search=${ship.trackingNumber}` };
      return res.json({ success: true, reply, suggestions, quickAction });
    }
  }

  // 2. Stockout / Inventory Queries
  if (q.includes('stock') || q.includes('inventory') || q.includes('sku') || q.includes('burn rate') || q.includes('replenish') || q.includes('deficit')) {
    const lowItems = getLowStockProducts();
    if (lowItems.length > 0) {
      reply = `### ⚠️ Real-Time Stockout Risk Advisory\n\n` +
        `I scanned all active warehouse inventory bins and detected **${lowItems.length} SKU(s)** operating below safety thresholds:\n\n` +
        lowItems.map(p => 
          `- **${p.sku}** (${p.name}): **${p.currentStock} units** in stock (Safety Min: ${p.minStock}). At current burn rate of **${p.burn} units/day**, stockout will occur in **${p.days} days**.`
        ).join('\n') +
        `\n\n**Recommended Action:** Trigger emergency purchase orders or rebalance stock from secondary regional fulfillment centers.`;
      suggestions = ['Create replenishment PO', 'View Warehouse Inventory', 'Calculate safety stock buffer'];
      quickAction = { label: 'Open Warehouse Inventory', url: '/warehouse/inventory' };
    } else {
      reply = `### ✅ Inventory Health Status: OPTIMAL\n\nAll SKUs across active warehouses are currently stocked comfortably above their minimum safety thresholds. No immediate stockout hazards detected in the next 14-day projection window.`;
      suggestions = ['View Warehouse Bins', 'Simulate high-demand scenario', 'Supplier lead time audit'];
      quickAction = { label: 'Go to Inventory', url: '/warehouse/inventory' };
    }
    return res.json({ success: true, reply, suggestions, quickAction });
  }

  // 3. Bin Allocation & Warehouse SOP Queries
  if (q.includes('bin') || q.includes('aisle') || q.includes('put-away') || q.includes('grn') || (q.includes('warehouse') && (q.includes('how') || q.includes('guide') || q.includes('sop')))) {
    reply = `### 📦 Warehouse Bin Allocation & Put-Away Protocol\n\n` +
      `CargoPulse uses dynamic zone-based bin assignment to maximize pick velocity:\n\n` +
      `1. **Zone A (Aisles 1–4, Lower Bays):** Fast-Moving Consumer Goods & High-Demand Electronics (turnover < 48h).\n` +
      `2. **Zone B (Aisles 5–10, Multi-tier):** Standard Bulk Pallets & Industrial Components.\n` +
      `3. **Zone C (Secured Wire Enclosure):** High-Value SKUs, Laptops & Mobile Flagships (Double-scan mandatory).\n` +
      `4. **Zone D (Climate-Controlled 2°C–8°C):** Cold-chain pharmaceuticals and temperature-sensitive goods.\n\n` +
      `*Warehouse Manager SOP:* When scanning Goods Receipt Notes (GRN), confirm pallet batch barcodes before marking stowed status.`;
    suggestions = ['Check bin capacity metrics', 'View stockout predictions', 'Quarantine damaged pallet'];
    quickAction = { label: 'Open Warehouse Dashboard', url: '/warehouse' };
    return res.json({ success: true, reply, suggestions, quickAction });
  }

  // 4. Shipment / Fleet / Delay Queries
  if (q.includes('delay') || q.includes('traffic') || q.includes('route') || q.includes('fleet') || q.includes('logistics') || q.includes('truck') || q.includes('carrier')) {
    const delayed = getDelayedShipments();
    if (delayed.length > 0) {
      reply = `### 🚨 Line-Haul Exception Alert: ${delayed.length} Active Shipment(s) Delayed\n\n` +
        delayed.map(s => {
          const originWh = fallbackDb.warehouses.find(w => w.id === s.originWarehouseId)?.name || 'Central Hub';
          const carrier = fallbackDb.carriers.find(c => c.id === s.carrierId)?.name || 'Express Carrier';
          return `- **${s.trackingNumber}** (${originWh} &rarr; ${s.destinationAddress}): Status \'${s.status}\' &bull; Risk Score: **${s.riskScore}/100**\n` +
            `  *Carrier:* ${carrier} &bull; *Delay Reason:* ${s.delayReason || 'Highway congestion / Weather slowdown'}\n` +
            `  *Current Waypoint:* Near ${s.currentLocation || 'En-route Checkpoint'}`;
        }).join('\n\n') +
        `\n\n**Logistics Guidance:** RouteIQ recommends dispatching a route detour alert to drivers to bypass the Krishnagiri bottleneck via State Highway 17.`;
      suggestions = ['View RouteIQ Live Map', 'Contact carrier dispatch', 'Notify consignees of delay'];
      quickAction = { label: 'Open RouteIQ Fleet Portal', url: '/logistics/routes' };
    } else {
      reply = `### 🟢 Fleet Telematics: All Systems Green\n\nAll line-haul consignments are currently tracking within their scheduled transit buffers. Carrier on-time SLA is tracking at **96.4%** across primary interstate corridors.`;
      suggestions = ['View active shipments', 'Check weather corridor risks', 'Review driver telematics'];
      quickAction = { label: 'Open Logistics Shipments', url: '/logistics/shipments' };
    }
    return res.json({ success: true, reply, suggestions, quickAction });
  }

  // 5. Supplier / Purchase Order / SLA Queries
  if (q.includes('supplier') || q.includes('vendor') || q.includes('po') || q.includes('purchase order') || q.includes('asn') || q.includes('procurement')) {
    const suppliers = fallbackDb.suppliers;
    reply = `### 🏭 Supplier Network & Procurement Telemetry\n\n` +
      `Platform overview across active suppliers:\n\n` +
      suppliers.slice(0, 3).map(sup => 
        `- **${sup.name}** &bull; On-Time Delivery: **${sup.onTimeDeliveryRate}%** &bull; Overall Score: **${sup.overallScore}/100** &bull; Quality: **${sup.qualityRate}%**`
      ).join('\n') +
      `\n\n**Supplier Operating SOP:**\n` +
      `- All new POs must be acknowledged within **4 business hours**.\n` +
      `- Advanced Shipping Notices (ASN) must be transmitted at least **4 hours prior to vehicle departure** to guarantee pre-allocated dock bays.`;
    suggestions = ['View Purchase Orders', 'Supplier performance rankings', 'Draft emergency PO'];
    quickAction = { label: 'Open Supplier Portal', url: '/supplier/orders' };
    return res.json({ success: true, reply, suggestions, quickAction });
  }

  // 6. Returns / RMA Queries
  if (q.includes('return') || q.includes('rma') || q.includes('refund') || q.includes('replace') || q.includes('damage')) {
    reply = `### 🔄 Return Merchandise Authorization (RMA) Workflow\n\n` +
      `Here is the step-by-step process for filing and handling consignee returns:\n\n` +
      `1. **Filing Window:** Consignees must initiate the RMA within **48 hours** of package delivery.\n` +
      `2. **Required Documentation:** Attach unboxing condition photographs and specify the discrepancy (e.g., Transit Damage, Wrong SKU, or Defective Unit).\n` +
      `3. **Automated Return Airway Bill:** The platform automatically assigns a reverse-pickup tracking code and routes it to the nearest regional return depot.\n` +
      `4. **Expedited Replacement:** Once the return barcode scans into the inbound dock, a replacement order triggers automatically.`;
    suggestions = ['File an RMA return', 'Track return shipment', 'Contact customer support'];
    quickAction = { label: 'Open Customer Returns Portal', url: '/customer/returns' };
    return res.json({ success: true, reply, suggestions, quickAction });
  }

  // 7. Admin / Security / User Approval Queries
  if (q.includes('admin') || q.includes('approval') || q.includes('approve') || q.includes('register') || q.includes('role') || q.includes('email')) {
    const pendingCount = fallbackDb.users.filter(u => u.status === 'PENDING').length;
    reply = `### 🛡️ Administrative Governance & Access Control\n\n` +
      `CargoPulse enforces enterprise Zero-Trust access:\n\n` +
      `- **Pending Registrations:** Currently **${pendingCount} user(s)** are awaiting admin authorization.\n` +
      `- **Automated Approval Email:** When an administrator approves an applicant, the system automatically dispatches an enterprise email featuring the official CargoPulse logo, credentials, and role-specific operating directives.\n` +
      `- **Direct Operational Directive:** Admins can send targeted SOP updates, audit notices, or high-priority guidance directly to any manager from the Admin Console.`;
    suggestions = ['Review pending user registrations', 'Send directive to manager', 'View security audit logs'];
    quickAction = { label: 'Open Admin Console', url: '/admin' };
    return res.json({ success: true, reply, suggestions, quickAction });
  }

  // Default contextual fallback
  reply = `### 👋 CargoPulse AI Copilot at your service!\n\n` +
    `I am your intelligent operational assistant for end-to-end supply chain visibility. Here is what I can do for you right now:\n\n` +
    `- **Warehouse & Stock:** Ask *"Which SKUs are running out?"* or *"Explain bin allocation rules"*\n` +
    `- **Fleet & Transit:** Ask *"Show delayed shipments"* or query any tracking code like \'SH-10021\'\n` +
    `- **Suppliers & Orders:** Ask *"Check supplier SLA metrics"* or *"PO acknowledgement guidelines"*\n` +
    `- **Customer & Returns:** Ask *"How to request an RMA return?"*\n` +
    `- **Admin & Approvals:** Ask *"How are new managers approved and notified?"*`;

  suggestions = [
    'Check stockout predictions',
    'Where is shipment SH-10021?',
    'Review delayed freight corridors',
    'Explain warehouse put-away SOP',
  ];

  return res.json({ success: true, reply, suggestions, quickAction });
};
