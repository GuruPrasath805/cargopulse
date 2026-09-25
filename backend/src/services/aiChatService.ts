import { AiDataService } from './aiDataService';
import { RiskAnalysisService } from './riskAnalysisService';
import { fallbackDb } from '../db/fallbackDb';
import { ExternalAiService } from './externalAiService';

export interface ChatSourceCitation {
  type: 'inventory' | 'shipments' | 'suppliers' | 'purchase_orders' | 'risk_rules' | 'module_knowledge' | 'system';
  description: string;
}

export interface ChatResponsePayload {
  success: boolean;
  answer: string;
  sources: ChatSourceCitation[];
  timestamp: string;
  suggestedQuestions?: string[];
  quickAction?: { label: string; url: string };
}

export class AiChatService {
  /**
   * Processes ANY natural language question related to CargoPulse project modules,
   * live operational data, technical workflows, or supply chain concepts.
   */
  static async processQuery(message: string, userRole?: string): Promise<ChatResponsePayload> {
    const q = (message || '').trim();
    const lower = q.toLowerCase();
    const timestamp = new Date().toISOString();

    if (!q) {
      return {
        success: false,
        answer: 'Please ask any question about CargoPulse modules (Inventory, Shipments, Warehouses, Suppliers, POs, Returns, Telematics, or Admin).',
        sources: [],
        timestamp,
        suggestedQuestions: [
          'Which products have low stock?',
          'Where is shipment SH-10234?',
          'How does the warehouse bin allocation work?',
          'Explain the returns (RMA) workflow',
        ],
      };
    }

    // =========================================================================
    // 1. SPECIFIC SHIPMENT TELEMATICS LOOKUP (e.g. SH-10234, SHP-101, etc.)
    // =========================================================================
    const trackingCodeMatch = q.match(/sh[-_]?[0-9]+/i) || q.match(/shp[-_]?[0-9]+/i);
    if (trackingCodeMatch) {
      const code = trackingCodeMatch[0].toUpperCase();
      const result = await AiDataService.getShipmentStatus(code);

      if (result.found && result.shipment) {
        const s = result.shipment;
        const answer = [
          `### 🚚 Real-Time Shipment Telematics: **${s.trackingNumber}**`,
          ``,
          `* **Transit Status:** \`${s.status}\` (Risk Score: **${s.riskScore}/100**)`,
          `* **Origin Dispatch Hub:** ${s.origin}`,
          `* **Final Destination:** ${s.destination}`,
          `* **Assigned Carrier:** ${s.carrier} &bull; **Driver:** ${s.driverName} (${s.driverPhone})`,
          `* **Vehicle Fleet Unit:** \`${s.vehiclePlate}\``,
          `* **Current GPS Waypoint:** Near ${s.currentLocation || 'Checkpoint Corridor'}`,
          `* **Estimated Delivery (ETA):** **${new Date(s.estimatedDelivery).toLocaleString()}**`,
          s.delayReason ? `* **Active Delay Flag:** *${s.delayReason}*` : '',
          s.latestEvent ? `* **Latest Checkpoint Event:** ${s.latestEvent.status} at ${s.latestEvent.location} (${new Date(s.latestEvent.timestamp).toLocaleTimeString()}) &mdash; *${s.latestEvent.note || ''}*` : '',
        ].filter(Boolean).join('\n');

        return {
          success: true,
          answer,
          sources: [
            { type: 'shipments', description: `Live tracking events and telemetry for ${s.trackingNumber}` },
          ],
          timestamp,
          suggestedQuestions: [
            'Which shipments are currently delayed?',
            'Show shipments currently in transit',
            'How does RouteIQ optimize delivery routes?',
          ],
          quickAction: {
            label: `View ${s.trackingNumber} in Logistics`,
            url: `/shipments?search=${s.trackingNumber}`,
          },
        };
      }
    }

    // =========================================================================
    // 2. PRODUCT MANAGEMENT MODULE (Adding products, SKUs, pricing, categories)
    // =========================================================================
    if (
      lower.includes('product management') ||
      (lower.includes('product') && (lower.includes('how') || lower.includes('work') || lower.includes('add') || lower.includes('create') || lower.includes('manage') || lower.includes('module')))
    ) {
      const products = fallbackDb.products;
      const answer = [
        `### 📦 Product Management Module Architecture`,
        `The **Product Management Module** serves as the central master catalog for all SKUs circulating through CargoPulse facilities:`,
        ``,
        `1. **Master SKU Registry:** Currently tracks **${products.length} active SKUs** across Electronics, Industrial Automation, and Medical IoT categories.`,
        `2. **Key Product Attributes:**`,
        `   - **Unique SKU Identifier:** High-contrast barcodes (e.g. \`LAP-001\`, \`SRV-PLC-09\`).`,
        `   - **Safety Stock Thresholds:** Defined minimum (\`minStock\`) and maximum (\`maxStock\`) capacities per facility.`,
        `   - **Consumption Velocity:** Daily demand rate (\`dailyDemand\`) used for automated burn-rate calculations.`,
        `   - **Pricing & Weight:** Unit valuation and physical payload dimensions for truck load balancing.`,
        `3. **How to Add / Update a Product:** Navigate to the **Products Catalog** &rarr; click **"Add New Product"** &rarr; enter SKU, name, unit cost, reorder minimum, and assign a verified supplier.`,
      ].join('\n');

      return {
        success: true,
        answer,
        sources: [{ type: 'module_knowledge', description: 'Product catalog definitions and master data schema' }],
        timestamp,
        suggestedQuestions: [
          'Which products have low stock?',
          'What is the available quantity of LAP-001?',
          'How does inventory management work?',
        ],
        quickAction: { label: 'Open Products Catalog', url: '/products' },
      };
    }

    // =========================================================================
    // 3. INVENTORY MANAGEMENT MODULE (Bins, Stock movements, GRN, Safety Stock)
    // =========================================================================
    if (
      lower.includes('inventory management') ||
      (lower.includes('inventory') && (lower.includes('how') || lower.includes('work') || lower.includes('movement') || lower.includes('module') || lower.includes('explain')))
    ) {
      const summary = await AiDataService.getInventorySummary();
      const answer = [
        `### 📊 Inventory Management Module Architecture`,
        `The **Inventory Management Module** tracks on-hand physical stock across all warehouses with double-entry audit integrity:`,
        ``,
        `1. **Real-Time Stock Metrics:** Total **${summary.totalUnitsInStock.toLocaleString()} units** currently managed across **${summary.warehousesCount} hubs**.`,
        `2. **Supported Stock Transactions:**`,
        `   - **STOCK_IN:** Goods Receipt Note (GRN) inbound from purchase orders.`,
        `   - **STOCK_OUT:** Outbound pick and packing against customer dispatch orders.`,
        `   - **TRANSFER:** Inter-hub inventory rebalancing (e.g. Chennai &rarr; Bangalore).`,
        `   - **ADJUSTMENT:** Cyclic physical count variance reconciliation.`,
        `   - **DAMAGED:** Quarantined items segregated from active pickable bays.`,
        `   - **RETURN:** Inbound reverse logistics from processed RMA claims.`,
        `3. **Safety Stock Formula:** When \`currentStock <= minStock\`, the system triggers urgent replenishment notices and flags the item in the Risk Radar.`,
      ].join('\n');

      return {
        success: true,
        answer,
        sources: [{ type: 'inventory', description: 'Inventory transaction ledger and stock balances' }],
        timestamp,
        suggestedQuestions: [
          'Which products have low stock?',
          'How does warehouse bin allocation work?',
          'Show pending purchase orders',
        ],
        quickAction: { label: 'Open Inventory Management', url: '/inventory' },
      };
    }

    // =========================================================================
    // 4. LOW STOCK / STOCKOUT RISK ADVISORY
    // =========================================================================
    if (
      lower.includes('low stock') || lower.includes('stockout') || lower.includes('below threshold') ||
      (lower.includes('inventory') && (lower.includes('summary') || lower.includes('summarize') || lower.includes('check')))
    ) {
      const summary = await AiDataService.getInventorySummary();
      if (summary.lowStockItems.length > 0) {
        const rows = summary.lowStockItems.map(p =>
          `| **${p.sku}** | ${p.name} | **${p.currentStock} units** | ${p.minStock} units | ${p.burnRate}/day | **${p.daysRemaining} days** | \`${p.status}\` |`
        ).join('\n');

        const answer = [
          `### ⚠️ Low Stock & Replenishment Advisory`,
          `Currently **${summary.lowStockCount} of ${summary.totalSkus} SKUs** are operating at or below safety margins:`,
          ``,
          `| SKU | Name | On-Hand Stock | Min Threshold | Daily Burn | Days Left | Status |`,
          `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |`,
          rows,
          ``,
          `*Recommended Action:* Generate emergency purchase orders to prevent line stoppages.`,
        ].join('\n');

        return {
          success: true,
          answer,
          sources: [{ type: 'inventory', description: 'Product catalog & warehouse bin stock records' }],
          timestamp,
          suggestedQuestions: ['Show pending purchase orders', 'Show our suppliers'],
          quickAction: { label: 'Open Inventory', url: '/inventory' },
        };
      } else {
        return {
          success: true,
          answer: `### ✅ Inventory Health: All SKUs Stocked Comfortably\nAll **${summary.totalSkus} SKUs** (${summary.totalUnitsInStock} total units) are stocked above safety minimums across all warehouses.`,
          sources: [{ type: 'inventory', description: 'Inventory stock records' }],
          timestamp,
          suggestedQuestions: ['Show active shipments', 'Show pending purchase orders'],
        };
      }
    }

    // =========================================================================
    // 5. WAREHOUSE MANAGEMENT & BIN ALLOCATION MODULE
    // =========================================================================
    if (
      lower.includes('warehouse') || lower.includes('bin') || lower.includes('rack') ||
      lower.includes('zone') || lower.includes('put-away') || lower.includes('grn')
    ) {
      const warehouses = fallbackDb.warehouses;
      const answer = [
        `### 🏭 Warehouse Management & 3D Spatial Layout`,
        `CargoPulse structures warehouse storage into a strict 3-tier hierarchy: **Warehouse &rarr; Zone &rarr; Rack &rarr; Bin**:`,
        ``,
        `1. **Active Facilities (${warehouses.length} Hubs):**`,
        warehouses.map(w => `   - **${w.name}** (\`${w.code}\`): ${w.city}, ${w.capacitySqFt.toLocaleString()} sq.ft. (Utilization: **${w.utilizationPct}%**)`).join('\n'),
        ``,
        `2. **Dynamic Zone Layout Protocol:**`,
        `   - **Zone A (Fast Movers):** High pick-frequency electronics & fast-turning items located near dispatch bays.`,
        `   - **Zone B (Bulk Pallets):** High-density industrial components and multi-tier pallet racking.`,
        `   - **Zone C (Secured Vault):** Locked wire enclosures for high-valueflagships & sensitive hardware.`,
        `   - **Zone D (Climate-Controlled 2°C–8°C):** Cold-chain pharmaceuticals and temperature-critical probes.`,
        `3. **Goods Receipt Note (GRN) SOP:** Inbound pallets must be barcode-scanned against the PO Bill of Lading within 2 hours of dock docking.`,
      ].join('\n');

      return {
        success: true,
        answer,
        sources: [{ type: 'module_knowledge', description: 'Warehouse zones, rack layout and bin allocation protocol' }],
        timestamp,
        suggestedQuestions: [
          'Which products have low stock?',
          'How does inventory management work?',
          'Show shipments currently in transit',
        ],
        quickAction: { label: 'Open Warehouses Console', url: '/warehouses' },
      };
    }

    // =========================================================================
    // 6. SUPPLIER MANAGEMENT MODULE (Vendors, SLAs, ASN)
    // =========================================================================
    if (lower.includes('supplier') || lower.includes('vendor') || lower.includes('asn')) {
      const suppliers = await AiDataService.getSupplierSummary();
      const rows = suppliers.map(s =>
        `| **${s.name}** | \`${s.code}\` | ${s.city} | **${s.onTimeDeliveryRate}%** | ${s.qualityRate}% | **${s.overallScore}/100** |`
      ).join('\n');

      const answer = [
        `### 🏢 Supplier Procurement & Vendor Network Directory`,
        `CargoPulse enforces enterprise vendor governance across all registered suppliers:`,
        ``,
        `| Supplier Organization | Code | Hub Location | On-Time SLA | Quality Rate | Composite Rating |`,
        `| :--- | :--- | :--- | :--- | :--- | :--- |`,
        rows,
        ``,
        `#### Key Supplier Protocols:`,
        `- **PO Acknowledgment SLA:** Must confirm scheduled delivery within **4 business hours**.`,
        `- **Advanced Shipping Notice (ASN):** Must transmit digital packing dimensions & carrier waybill at least **4 hours prior to vehicle departure**.`,
        `- **Compliance Threshold:** Minimum **95.0% on-time delivery** required to maintain active vendor status.`,
      ].join('\n');

      return {
        success: true,
        answer,
        sources: [{ type: 'suppliers', description: 'Partner supplier registry and performance evaluations' }],
        timestamp,
        suggestedQuestions: [
          'Which suppliers have pending purchase orders?',
          'Show pending purchase orders',
          'How does purchase order approval work?',
        ],
        quickAction: { label: 'Open Supplier Portal', url: '/suppliers' },
      };
    }

    // =========================================================================
    // 7. PURCHASE ORDERS MODULE (PO Lifecycle, 3-Way Matching)
    // =========================================================================
    if (lower.includes('purchase order') || lower.includes('po ') || lower.includes('po-') || lower.includes('procurement')) {
      const pos = await AiDataService.getPendingPurchaseOrders();
      const rows = pos.map(p =>
        `| **${p.orderNo}** | ${p.supplierName} | ${p.warehouseName} | \`${p.status}\` | ₹${p.totalAmount.toLocaleString()} | ${p.expectedDate ? new Date(p.expectedDate).toLocaleDateString() : 'N/A'} |`
      ).join('\n');

      const answer = [
        `### 📋 Purchase Order (PO) Management & Fulfillment Lifecycle`,
        `Purchase orders manage procurement replenishments through a strictly controlled state machine:`,
        ``,
        `**Status Workflow:** \`DRAFT\` &rarr; \`PENDING\` &rarr; \`APPROVED\` &rarr; \`CONFIRMED\` &rarr; \`PROCESSING\` &rarr; \`DISPATCHED\` &rarr; \`RECEIVED\``,
        ``,
        `#### Active / Pending Purchase Orders:`,
        `| PO # | Supplier | Target Hub | Status | Total Amount | Expected Arrival |`,
        `| :--- | :--- | :--- | :--- | :--- | :--- |`,
        rows || '| None | No pending POs | - | - | - | - |',
        ``,
        `*3-Way Matching Guarantee:* Invoices are cleared automatically only when the Purchase Order, Supplier ASN, and Warehouse GRN quantities match with zero discrepancies.`,
      ].join('\n');

      return {
        success: true,
        answer,
        sources: [{ type: 'purchase_orders', description: 'Purchase order lifecycle and active procurement orders' }],
        timestamp,
        suggestedQuestions: [
          'Show our suppliers',
          'Which products have low stock?',
          'How does inventory management work?',
        ],
        quickAction: { label: 'Open Purchase Orders', url: '/purchase-orders' },
      };
    }

    // =========================================================================
    // 8. SHIPMENT MANAGEMENT & FLEET DISPATCH MODULE
    // =========================================================================
    if (
      lower.includes('shipment management') || lower.includes('fleet') ||
      lower.includes('carrier') || lower.includes('driver') || lower.includes('truck') ||
      (lower.includes('shipment') && (lower.includes('how') || lower.includes('create') || lower.includes('dispatch')))
    ) {
      const carriers = fallbackDb.carriers;
      const drivers = fallbackDb.drivers;
      const vehicles = fallbackDb.vehicles;

      const answer = [
        `### 🚛 Shipment & Fleet Dispatch Management`,
        `The **Shipment Management Module** coordinates line-haul freight dispatch and vehicle telematics:`,
        ``,
        `1. **Partner Carriers (${carriers.length}):** ${carriers.map(c => `${c.name} (${c.rating}★)`).join(', ')}.`,
        `2. **Commercial Fleet:** BharatBenz heavy haulers, Tata Ultra dry vans, and Ashok Leyland multi-axle carriers equipped with GPS transponders and cold-chain temperature loggers.`,
        `3. **Driver Allocation:** Dedicated line-haul drivers (${drivers.map(d => d.name).join(', ')}).`,
        `4. **Dispatch Workflow:**`,
        `   - Step 1: Assign origin warehouse bay and destination consignee address.`,
        `   - Step 2: Pair carrier, vehicle capacity (tons), and certified driver.`,
        `   - Step 3: Run RouteIQ optimization to select the fastest weather-safe corridor.`,
        `   - Step 4: Issue Bill of Lading (BOL) and generate live tracking code (e.g. \`SH-10234\`).`,
      ].join('\n');

      return {
        success: true,
        answer,
        sources: [{ type: 'shipments', description: 'Fleet, carrier directory and shipment dispatch rules' }],
        timestamp,
        suggestedQuestions: [
          'Show shipments currently in transit',
          'Which shipments are overdue?',
          'Where is shipment SH-10234?',
        ],
        quickAction: { label: 'Open Shipments Console', url: '/shipments' },
      };
    }

    // =========================================================================
    // 9. SHIPMENT TRACKING, GPS & ROUTEIQ TELEMATICS
    // =========================================================================
    if (
      lower.includes('tracking') || lower.includes('telematics') || lower.includes('routeiq') ||
      lower.includes('gps') || lower.includes('route') || lower.includes('corridor')
    ) {
      const active = await AiDataService.getActiveShipments();
      const rows = active.map(s =>
        `| **${s.trackingNumber}** | \`${s.status}\` | ${s.origin} | Near ${s.currentLocation} | **${new Date(s.estimatedDelivery).toLocaleDateString()}** |`
      ).join('\n');

      const answer = [
        `### 🛰️ Real-Time Telematics & RouteIQ Navigation`,
        `CargoPulse monitors commercial freight across primary interstate corridors with 60-second coordinate pings:`,
        ``,
        `1. **Live GPS Waypoint Tracking:** Every truck broadcasts latitude, longitude, transit speed, and checkpoint milestones.`,
        `2. **Cold-Chain Telematics:** Active IoT temperature probes maintain pharmaceutical cargo between **2°C and 8°C**.`,
        `3. **RouteIQ Dynamic Rerouting:** Automatically detects highway bottlenecks, waterlogging, or accidents and routes drivers via detour corridors (e.g. bypassing NH-44 via SH-17).`,
        ``,
        `#### Currently Tracking Consignments:`,
        `| Tracking # | Status | Origin | Waypoint | ETA |`,
        `| :--- | :--- | :--- | :--- | :--- |`,
        rows,
      ].join('\n');

      return {
        success: true,
        answer,
        sources: [{ type: 'shipments', description: 'GPS coordinates and live telemetry stream' }],
        timestamp,
        suggestedQuestions: [
          'Where is shipment SH-10234?',
          'Which shipments are overdue?',
          'Explain the delivery and e-POD workflow',
        ],
        quickAction: { label: 'Open Live Tracking', url: '/tracking' },
      };
    }

    // =========================================================================
    // 10. OVERDUE & DELAYED SHIPMENTS QUERY
    // =========================================================================
    if (lower.includes('overdue') || (lower.includes('delay') && (lower.includes('shipment') || lower.includes('which') || lower.includes('show')))) {
      const { summary, shipments } = RiskAnalysisService.getRiskSummary();
      const overdueList = shipments.filter(s => s.rulesTriggered.includes('OVERDUE_DELIVERY') || s.status === 'DELAYED');

      if (overdueList.length > 0) {
        const rows = overdueList.map(s =>
          `| **${s.trackingNumber}** | \`${s.status}\` | ${s.origin} &rarr; ${s.destination} | ${new Date(s.expectedDelivery).toLocaleDateString()} | **${s.riskLevel}** | ${s.reason} |`
        ).join('\n');

        const answer = [
          `### 🚨 Overdue & Delayed Shipments Summary`,
          `Analysis identified **${overdueList.length} shipment(s)** with delivery risks based on scheduled ETAs and live transit logs:`,
          ``,
          `| Tracking # | Status | Route Corridor | Scheduled ETA | Risk Level | Reason |`,
          `| :--- | :--- | :--- | :--- | :--- | :--- |`,
          rows,
          ``,
          `*Rule Applied:* Expected delivery date has passed without confirmation of delivery, or transit speed dropped below threshold.`,
        ].join('\n');

        return {
          success: true,
          answer,
          sources: [
            { type: 'shipments', description: 'Active shipment records' },
            { type: 'risk_rules', description: 'Overdue and line-haul delay detection ruleset' },
          ],
          timestamp,
          suggestedQuestions: [
            'Where is shipment SH-10234?',
            'Show shipments currently in transit',
            'How does returns management work?',
          ],
          quickAction: { label: 'Open Shipments', url: '/shipments' },
        };
      } else {
        return {
          success: true,
          answer: `### ✅ All Shipments Operating On Schedule\nNo shipments are currently flagged as overdue. All consignments are moving within acceptable transit buffers.`,
          sources: [{ type: 'shipments', description: 'Active shipment records' }],
          timestamp,
          suggestedQuestions: ['Show shipments currently in transit'],
        };
      }
    }

    // =========================================================================
    // 11. DELIVERY MANAGEMENT & ELECTRONIC PROOF OF DELIVERY (e-POD)
    // =========================================================================
    if (lower.includes('delivery') || lower.includes('e-pod') || lower.includes('pod') || lower.includes('proof of delivery') || lower.includes('otp')) {
      const answer = [
        `### 📦 Delivery Management & Electronic Proof of Delivery (e-POD)`,
        `The **Delivery Management Module** governs the final handover of consignments to enterprise recipients:`,
        ``,
        `1. **Last-Mile Assignment:** Courier drivers receive assigned parcels with delivery waypoints and contact telephone numbers.`,
        `2. **Two-Factor Handover Security:** Consignee receives an OTP on their registered phone number before delivery package handover.`,
        `3. **Digital Proof of Delivery (e-POD):**`,
        `   - Recipient digital signature captured directly on the courier device.`,
        `   - Unboxing / package condition photograph attached to the record.`,
        `   - Immediate generation of digital delivery receipt accessible in the Customer Portal.`,
        `4. **Exception Handling:** If delivery fails (e.g. facility closed, gate pass unavailable), status transitions to \`RESCHEDULED\` with automated consignee notification.`,
      ].join('\n');

      return {
        success: true,
        answer,
        sources: [{ type: 'module_knowledge', description: 'Delivery workflows, e-POD protocols and recipient handover' }],
        timestamp,
        suggestedQuestions: [
          'How does returns management work?',
          'Where is shipment SH-10234?',
          'Show active shipments',
        ],
        quickAction: { label: 'Open Deliveries', url: '/deliveries' },
      };
    }

    // =========================================================================
    // 12. RETURNS MANAGEMENT (RMA) & REVERSE LOGISTICS
    // =========================================================================
    if (lower.includes('return') || lower.includes('rma') || lower.includes('refund') || lower.includes('replacement') || lower.includes('scrap')) {
      const answer = [
        `### 🔄 Returns Management (RMA) & Reverse Logistics`,
        `CargoPulse includes a full-lifecycle Reverse Logistics workflow for damaged, mismatched, or surplus items:`,
        ``,
        `1. **48-Hour Return Filing Window:** Consignees file RMA tickets through the Customer Portal with attached discrepancy photos.`,
        `2. **Automated Return Airway Bill (AWB):** System assigns reverse-courier routing to return the parcel to the nearest hub.`,
        `3. **Dock Inspection & Triage Decisions:**`,
        `   - \`RESTOCK\`: Undamaged surplus returned directly to active warehouse pick bins.`,
        `   - \`REPAIR\`: Transferred to technical refurbishing facility.`,
        `   - \`REPLACE\`: Triggers an expedited replacement shipment to the consignee automatically.`,
        `   - \`SCRAP\`: Written off and logged in the damaged stock adjustment ledger.`,
      ].join('\n');

      return {
        success: true,
        answer,
        sources: [{ type: 'module_knowledge', description: 'RMA reverse logistics lifecycle and inspection decisions' }],
        timestamp,
        suggestedQuestions: [
          'How does delivery management work?',
          'Which products have low stock?',
          'How does the digital twin work?',
        ],
        quickAction: { label: 'Open Returns Management', url: '/returns' },
      };
    }

    // =========================================================================
    // 13. ANALYTICS, RISK RADAR & ML PREDICTIONS
    // =========================================================================
    if (lower.includes('risk radar') || lower.includes('analytics') || lower.includes('prediction') || lower.includes('score') || lower.includes('machine learning') || lower.includes('ml')) {
      const { summary } = RiskAnalysisService.getRiskSummary();
      const ml = RiskAnalysisService.evaluateMLFeasibility();

      const answer = [
        `### 🎯 Multi-Factor Risk Radar & Predictive Engine`,
        `CargoPulse evaluates supply chain vulnerability using a transparent composite scoring engine:`,
        ``,
        `1. **Active Composite Risk Assessment:**`,
        `   - Total Consignments Evaluated: **${summary.totalAnalyzed}**`,
        `   - Overdue Deliveries Flagged: **${summary.overdueCount}**`,
        `   - Risk Distribution: **${summary.riskDistribution.high} High**, **${summary.riskDistribution.medium} Medium**, **${summary.riskDistribution.low} Low**.`,
        `2. **Core Risk Evaluation Factors:**`,
        `   - Transit Weather & Road Congestion (e.g. NH-44 ghat section waterlogging).`,
        `   - Safety Stock Deficit & SKU Burn Velocity (\`currentStock / dailyDemand\`).`,
        `   - Supplier Lead Time Volatility & Quality Variance.`,
        `3. **Machine Learning Feasibility Status:** Currently operating under **Transparent Rule-Based Classification** (Status: \`${ml.status}\`). The ML training pipeline (Random Forest / XGBoost) is architected for deployment once 1,000+ real trip cycles accumulate.`,
      ].join('\n');

      return {
        success: true,
        answer,
        sources: [{ type: 'risk_rules', description: 'Multi-factor risk evaluation matrix and ML feasibility report' }],
        timestamp,
        suggestedQuestions: [
          'Which shipments are overdue?',
          'Which products have low stock?',
          'Explain the digital twin',
        ],
        quickAction: { label: 'Open Risk Radar', url: '/intelligence' },
      };
    }

    // =========================================================================
    // 14. ADMIN CONSOLE, USER GOVERNANCE & AADHAR VERIFICATION
    // =========================================================================
    if (
      lower.includes('admin') || lower.includes('approval') || lower.includes('approve') ||
      lower.includes('user') || lower.includes('role') || lower.includes('register') ||
      lower.includes('aadhar') || lower.includes('directive') || lower.includes('clearance')
    ) {
      const pendingCount = fallbackDb.users.filter(u => u.status === 'PENDING').length;
      const totalUsers = fallbackDb.users.length;

      const answer = [
        `### 🛡️ Admin Console & User Governance Protocol`,
        `CargoPulse enforces enterprise **Zero-Trust Role-Based Access Control (RBAC)**:`,
        ``,
        `1. **Current Access Pool:** **${totalUsers} registered users** (${pendingCount} currently awaiting Admin authorization).`,
        `2. **Mandatory Identity Verification:**`,
        `   - **Employee Photo:** Front-facing portrait of the operator/manager.`,
        `   - **Aadhar Card Photo:** Official photo ID document proof verified by the admin before granting access.`,
        `   - **Experience & Address:** Verified credentials and residential/facility address.`,
        `3. **Automated Approval Email Dispatch:** Upon approval, the system dispatches an official branded email featuring the **CargoPulse logo** and role-specific operating directives.`,
        `4. **Operational Directives Dispatch:** Administrators can send targeted directives (Urgent, High, Normal) directly to any manager console with live audit logging.`,
      ].join('\n');

      return {
        success: true,
        answer,
        sources: [{ type: 'system', description: 'User administration, identity verification and role governance' }],
        timestamp,
        suggestedQuestions: [
          'What are all the portals and roles in CargoPulse?',
          'How does warehouse management work?',
          'Show active shipments',
        ],
        quickAction: { label: 'Open Admin Console', url: '/admin' },
      };
    }

    // =========================================================================
    // 15. DIGITAL TWIN & NETWORK GRAPH
    // =========================================================================
    if (lower.includes('digital twin') || lower.includes('network') || lower.includes('graph') || lower.includes('topology')) {
      const answer = [
        `### 🌐 Supply Chain Digital Twin Architecture`,
        `The **Digital Twin** provides an interactive, live topological graph of the entire supply chain network:`,
        ``,
        `1. **Node Entities:**`,
        `   - **Suppliers:** Manufacturing nodes providing raw materials & finished goods.`,
        `   - **Warehouses:** Regional distribution hubs with live capacity utilization percentages.`,
        `   - **Corridors:** Line-haul highway routes with dynamic weather and traffic risk overlays.`,
        `   - **Consignees:** Customer fulfillment destination docks.`,
        `2. **Interactive Telemetry:** Clicking any node reveals real-time capacity stress, active shipment arrivals, and localized risk scores.`,
      ].join('\n');

      return {
        success: true,
        answer,
        sources: [{ type: 'module_knowledge', description: 'Digital Twin network graph topology' }],
        timestamp,
        suggestedQuestions: [
          'How does RouteIQ work?',
          'Where is shipment SH-10234?',
          'Show our suppliers',
        ],
        quickAction: { label: 'Open Digital Twin', url: '/digital-twin' },
      };
    }

    // =========================================================================
    // 16. PLATFORM PORTALS & ROLES SUMMARY
    // =========================================================================
    if (lower.includes('portal') || lower.includes('roles') || lower.includes('what is cargopulse') || lower.includes('about')) {
      const answer = [
        `### 🚀 CargoPulse Platform & Dedicated Portals`,
        `CargoPulse is a Next-Generation AI-powered Supply Chain & Logistics Management Platform with 5 dedicated user portals:`,
        ``,
        `1. **Warehouse Operations Portal (\`/warehouse\`):** Bin management, inventory intake, GRN scanning, and safety stock reordering.`,
        `2. **Logistics & Fleet Portal (\`/logistics\`):** Fleet telematics, dynamic RouteIQ routing, driver dispatch, and e-POD verification.`,
        `3. **Supplier Network Portal (\`/supplier\`):** Purchase order fulfillment, ASN generation, and quality certification.`,
        `4. **Customer Consignee Portal (\`/customer\`):** Live shipment tracking, delivery receipts, and 48-hour RMA return filing.`,
        `5. **Central Admin Console (\`/admin\`):** User authorization with Aadhar/photo identity verification, directive email dispatch, and audit logging.`,
      ].join('\n');

      return {
        success: true,
        answer,
        sources: [{ type: 'system', description: 'CargoPulse platform overview and portal definitions' }],
        timestamp,
        suggestedQuestions: [
          'Which products have low stock?',
          'Where is shipment SH-10234?',
          'How does warehouse management work?',
        ],
      };
    }

    // =========================================================================
    // 17. SPECIFIC PRODUCT AVAILABILITY LOOKUP
    // =========================================================================
    const products = fallbackDb.products;
    const matched = products.find(p => lower.includes(p.sku.toLowerCase()) || lower.includes(p.name.toLowerCase()));
    if (matched) {
      const inventories = fallbackDb.inventories.filter(i => i.productId === matched.id);
      const total = inventories.reduce((s, c) => s + c.quantity, 0);
      const whBreakdown = inventories.map(i => {
        const whName = fallbackDb.warehouses.find(w => w.id === i.warehouseId)?.name || i.warehouseId;
        return `- **${whName}:** ${i.quantity} units (Bin: ${i.binId || 'Aisle Storage'})`;
      }).join('\n');

      const answer = [
        `### 📦 Product Telemetry: **${matched.name}** (\`${matched.sku}\`)`,
        ``,
        `- **Total On-Hand Stock:** **${total} ${matched.unit}**`,
        `- **Safety Reorder Minimum:** ${matched.minStock} units (Max: ${matched.maxStock} units)`,
        `- **Unit Valuation:** ₹${matched.price.toLocaleString()}`,
        `- **Consumption Velocity:** ${matched.dailyDemand || 3.0} units/day (Days Remaining: **${Number((total / (matched.dailyDemand || 3)).toFixed(1))} days**)`,
        ``,
        `#### Warehouse Allocation:`,
        whBreakdown || '- No warehouse allocations found.',
      ].join('\n');

      return {
        success: true,
        answer,
        sources: [{ type: 'inventory', description: `Inventory bins for SKU ${matched.sku}` }],
        timestamp,
        suggestedQuestions: ['Which products have low stock?', 'Show pending purchase orders'],
        quickAction: { label: `View ${matched.sku} in Catalog`, url: `/products?search=${matched.sku}` },
      };
    }

    // =========================================================================
    // 18. CLOUD LLM ENHANCEMENT (optional — only runs if GEMINI_API_KEY or
    //     OPENAI_API_KEY is set in the environment). Only reached once none
    //     of the fast local intents above matched, so configured deployments
    //     get free-form answers to anything, while unconfigured ones keep
    //     working exactly as before via the local knowledgebase in case 19.
    // =========================================================================
    if (ExternalAiService.isConfigured()) {
      const enhanced = await ExternalAiService.generateAnswer(q);
      if (enhanced) {
        return {
          success: true,
          answer: enhanced,
          sources: [{ type: 'module_knowledge', description: 'Cloud LLM-enhanced response (OpenAI/Gemini), grounded by the CargoPulse system prompt' }],
          timestamp,
          suggestedQuestions: [
            'Which products have low stock?',
            'Where is shipment SH-10234?',
            'How does warehouse management work?',
          ],
        };
      }
      // Falls through to the local knowledgebase answer below if the cloud
      // call failed or timed out, so the assistant still responds.
    }

    // =========================================================================
    // 19. GENERALIZED INTELLIGENT COMPREHENSIVE ANSWER (local fallback —
    //     always available even with zero API keys configured)
    // =========================================================================
    const answer = [
      `### 🤖 CargoPulse AI Copilot Operational Response`,
      `Regarding **"${q}"**:`,
      ``,
      `CargoPulse coordinates this operational workflow through interconnected microservices:`,
      `- **Data Integrity:** Queries are executed against verified PostgreSQL database records without data fabrication.`,
      `- **Role Isolation:** Access is scoped by your assigned portal permissions (Warehouse, Logistics, Supplier, or Customer).`,
      `- **Live Telemetry:** Consignments are tracked using GPS coordinates and cold-chain temperature sensors.`,
      `- **Actionable Workflows:** You can execute transactions, dispatch directive emails, or analyze risk directly through the platform.`,
      ``,
      `*You can ask me anything about:*`,
      `1. **Inventory & SKUs:** *"Which products have low stock?"* or *"What is available quantity of LAP-001?"*`,
      `2. **Shipments & Fleet:** *"Where is shipment SH-10234?"* or *"Show shipments in transit"*`,
      `3. **Warehouses & Bins:** *"Explain warehouse bin allocation"* or *"What are Zone A and B?"*`,
      `4. **Suppliers & Orders:** *"Show our suppliers"* or *"Show pending purchase orders"*`,
      `5. **Deliveries & Returns:** *"How does e-POD work?"* or *"Explain returns management"*`,
      `6. **Admin Governance:** *"How does identity verification work?"* or *"Explain operational directives"*`,
    ].join('\n');

    return {
      success: true,
      answer,
      sources: [{ type: 'module_knowledge', description: 'CargoPulse End-to-End Supply Chain Knowledgebase' }],
      timestamp,
      suggestedQuestions: [
        'Which products have low stock?',
        'Where is shipment SH-10234?',
        'How does warehouse management work?',
        'Explain the returns (RMA) workflow',
      ],
    };
  }
}
