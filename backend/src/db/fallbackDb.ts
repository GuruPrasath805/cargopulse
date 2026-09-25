// CargoPulse Resilient In-Memory High-Fidelity Dataset
// Mirrors Prisma schema with full CRUD operations for instant zero-config startup

export type UserRoleName = 'ADMIN' | 'WAREHOUSE_MANAGER' | 'LOGISTICS_MANAGER' | 'SUPPLIER' | 'CUSTOMER';
export type UserStatusName = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRoleName;
  status: UserStatusName;
  companyName?: string;
  phone?: string;
  photoUrl?: string;
  aadharCardUrl?: string;
  experienceYears?: number | string;
  address?: string;
  approvedById?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectedReason?: string;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntity {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  createdAt: string;
}

export interface ProductEntity {
  id: string;
  sku: string;
  name: string;
  description: string;
  categoryId: string;
  unit: string;
  price: number;
  minStock: number;
  maxStock: number;
  weightKg: number;
  dailyDemand: number;
  supplierId: string;
  createdAt: string;
}

export interface WarehouseBinEntity {
  id: string;
  code: string;
  rackId: string;
}

export interface WarehouseRackEntity {
  id: string;
  code: string;
  zoneId: string;
  bins: WarehouseBinEntity[];
}

export interface WarehouseZoneEntity {
  id: string;
  code: string;
  name: string;
  warehouseId: string;
  racks: WarehouseRackEntity[];
}

export interface WarehouseEntity {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  country: string;
  address: string;
  latitude: number;
  longitude: number;
  capacitySqFt: number;
  utilizationPct: number;
  zones: WarehouseZoneEntity[];
}

export interface InventoryEntity {
  id: string;
  productId: string;
  warehouseId: string;
  binId?: string;
  quantity: number;
  batchNumber?: string;
  expiryDate?: string;
  updatedAt: string;
}

export interface InventoryTransactionEntity {
  id: string;
  transactionNo: string;
  productId: string;
  warehouseId: string;
  type: 'STOCK_IN' | 'STOCK_OUT' | 'TRANSFER' | 'ADJUSTMENT' | 'DAMAGED' | 'RETURN';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  referenceDoc?: string;
  userId?: string;
  createdAt: string;
}

export interface SupplierEntity {
  id: string;
  code: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  rating: number;
  onTimeDeliveryRate: number;
  qualityRate: number;
  fulfillmentRate: number;
  overallScore: number;
}

export interface PurchaseOrderItemEntity {
  id: string;
  purchaseOrderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQty: number;
}

export interface PurchaseOrderEntity {
  id: string;
  orderNo: string;
  supplierId: string;
  warehouseId: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'CONFIRMED' | 'PROCESSING' | 'DISPATCHED' | 'RECEIVED' | 'CANCELLED';
  totalAmount: number;
  currency: string;
  expectedDate: string;
  receivedDate?: string;
  createdById?: string;
  items: PurchaseOrderItemEntity[];
  createdAt: string;
}

export interface TrackingEventEntity {
  id: string;
  shipmentId: string;
  status: string;
  location: string;
  latitude?: number;
  longitude?: number;
  note?: string;
  timestamp: string;
}

export interface ShipmentEntity {
  id: string;
  trackingNumber: string;
  originWarehouseId: string;
  destWarehouseId?: string;
  destinationAddress: string;
  carrierId: string;
  vehicleId: string;
  driverId: string;
  status: 'ORDERED' | 'PACKED' | 'DISPATCHED' | 'IN_TRANSIT' | 'ARRIVED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'DELAYED' | 'CANCELLED';
  estimatedDelivery: string;
  actualDelivery?: string;
  currentLocation: string;
  currentLat: number;
  currentLng: number;
  riskScore: number;
  delayReason?: string;
  items: { productId: string; quantity: number }[];
  trackingEvents: TrackingEventEntity[];
  createdAt: string;
}

export interface DeliveryEntity {
  id: string;
  deliveryNo: string;
  shipmentId: string;
  recipientName: string;
  recipientPhone: string;
  destination: string;
  status: 'ASSIGNED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED' | 'RESCHEDULED';
  scheduledTime: string;
  deliveredTime?: string;
  proofOfDelivery?: {
    signatureUrl?: string;
    photoUrl?: string;
    signedBy: string;
    signedAt: string;
    notes?: string;
  };
}

export interface ReturnEntity {
  id: string;
  returnNo: string;
  customerName: string;
  customerEmail: string;
  warehouseId: string;
  status: 'REQUESTED' | 'PICKUP_SCHEDULED' | 'IN_TRANSIT' | 'RECEIVED_FOR_INSPECTION' | 'COMPLETED' | 'REJECTED';
  decision: 'PENDING' | 'RESTOCK' | 'REPAIR' | 'REPLACE' | 'SCRAP';
  reason: string;
  inspectionNotes?: string;
  items: { productId: string; quantity: number; condition: string }[];
  createdAt: string;
}

export interface NotificationEntity {
  id: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

class InMemoryDatabase {
  users: UserEntity[] = [];
  categories: { id: string; name: string; description: string }[] = [];
  products: ProductEntity[] = [];
  warehouses: WarehouseEntity[] = [];
  inventories: InventoryEntity[] = [];
  transactions: InventoryTransactionEntity[] = [];
  suppliers: SupplierEntity[] = [];
  purchaseOrders: PurchaseOrderEntity[] = [];
  carriers: { id: string; name: string; code: string; contact: string; rating: number }[] = [];
  vehicles: { id: string; plateNumber: string; model: string; type: string; capacityTons: number; currentLoadTons: number; carrierId: string; driverId: string }[] = [];
  drivers: { id: string; name: string; phone: string; licenseNo: string; rating: number }[] = [];
  shipments: ShipmentEntity[] = [];
  deliveries: DeliveryEntity[] = [];
  returns: ReturnEntity[] = [];
  notifications: NotificationEntity[] = [];
  auditLogs: AuditLogEntity[] = [];

  constructor() {
    this.seed();
  }

  // ---------- Auth / user management helpers ----------

  addAuditLog(entry: { userId?: string; userName?: string; action: string; entity: string; entityId?: string; details?: string }) {
    this.auditLogs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      ...entry,
    });
    // Keep the in-memory log bounded
    if (this.auditLogs.length > 500) this.auditLogs.length = 500;
  }

  findUserByEmail(email: string) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createPendingUser(input: {
    email: string;
    name: string;
    passwordHash: string;
    role: UserRoleName;
    companyName?: string;
    phone?: string;
    photoUrl?: string;
    aadharCardUrl?: string;
    experienceYears?: number | string;
    address?: string;
  }) {
    const newUser: UserEntity = {
      id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      email: input.email,
      name: input.name,
      passwordHash: input.passwordHash,
      role: input.role,
      status: 'PENDING',
      companyName: input.companyName,
      phone: input.phone,
      photoUrl: input.photoUrl,
      aadharCardUrl: input.aadharCardUrl,
      experienceYears: input.experienceYears,
      address: input.address,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    this.addAuditLog({ userName: newUser.name, action: 'REGISTER_REQUEST', entity: 'User', entityId: newUser.id, details: `${newUser.role} registration submitted for approval` });
    return newUser;
  }

  approveUser(userId: string, approvedBy: UserEntity) {
    const u = this.users.find(x => x.id === userId);
    if (!u) return null;
    u.status = 'APPROVED';
    u.approvedById = approvedBy.id;
    u.approvedByName = approvedBy.name;
    u.approvedAt = new Date().toISOString();
    u.rejectedReason = undefined;
    u.updatedAt = new Date().toISOString();
    this.addAuditLog({ userId: approvedBy.id, userName: approvedBy.name, action: 'APPROVE_USER', entity: 'User', entityId: u.id, details: `Approved ${u.name} (${u.role})` });
    return u;
  }

  rejectUser(userId: string, rejectedBy: UserEntity, reason?: string) {
    const u = this.users.find(x => x.id === userId);
    if (!u) return null;
    u.status = 'REJECTED';
    u.rejectedReason = reason || 'Not specified';
    u.updatedAt = new Date().toISOString();
    this.addAuditLog({ userId: rejectedBy.id, userName: rejectedBy.name, action: 'REJECT_USER', entity: 'User', entityId: u.id, details: `Rejected ${u.name} (${u.role}): ${u.rejectedReason}` });
    return u;
  }

  setUserStatus(userId: string, status: UserStatusName, actor: UserEntity) {
    const u = this.users.find(x => x.id === userId);
    if (!u) return null;
    u.status = status;
    u.updatedAt = new Date().toISOString();
    this.addAuditLog({ userId: actor.id, userName: actor.name, action: `SET_STATUS_${status}`, entity: 'User', entityId: u.id, details: `${actor.name} set ${u.name} status to ${status}` });
    return u;
  }

  updateUserRole(userId: string, role: UserRoleName, actor: UserEntity) {
    const u = this.users.find(x => x.id === userId);
    if (!u) return null;
    const oldRole = u.role;
    u.role = role;
    u.updatedAt = new Date().toISOString();
    this.addAuditLog({ userId: actor.id, userName: actor.name, action: 'UPDATE_ROLE', entity: 'User', entityId: u.id, details: `${actor.name} changed ${u.name} role from ${oldRole} to ${role}` });
    return u;
  }

  deleteUser(userId: string, actor: UserEntity) {
    const idx = this.users.findIndex(x => x.id === userId);
    if (idx === -1) return false;
    const u = this.users[idx];
    this.users.splice(idx, 1);
    this.addAuditLog({ userId: actor.id, userName: actor.name, action: 'DELETE_USER', entity: 'User', entityId: userId, details: `${actor.name} deleted account for ${u.name}` });
    return true;
  }

  seed() {
    // 1. Users for all 5 roles
    // Demo password for every seeded account below is: password123
    const DEMO_HASH = '$2a$10$t8dqLAujkbkNob1.E.T8AueZv/WzwTUAXmobMfi/2pG1OnaFKmdQa';
    this.users = [
      {
        id: 'usr-admin-1',
        email: 'admin@cargopulse.io',
        passwordHash: DEMO_HASH,
        name: 'Alexander Cross',
        role: 'ADMIN',
        status: 'APPROVED',
        phone: '+91 98400 11223',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        aadharCardUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        experienceYears: 14,
        address: 'Tower A, Global Logistics Center, Guindy, Chennai, TN 600032',
        createdAt: '2026-01-10T08:00:00Z',
        updatedAt: '2026-01-10T08:00:00Z',
      },
      {
        id: 'usr-wm-1',
        email: 'warehouse@cargopulse.io',
        passwordHash: DEMO_HASH,
        name: 'Karthik Raman',
        role: 'WAREHOUSE_MANAGER',
        status: 'APPROVED',
        phone: '+91 94441 55678',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        aadharCardUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        experienceYears: 9,
        address: 'Plot 42, Sriperumbudur Industrial Corridor, Kanchipuram, TN 602105',
        approvedById: 'usr-admin-1',
        approvedByName: 'Alexander Cross',
        approvedAt: '2026-01-11T10:00:00Z',
        createdAt: '2026-01-11T09:30:00Z',
        updatedAt: '2026-01-11T10:00:00Z',
      },
      {
        id: 'usr-log-1',
        email: 'logistics@cargopulse.io',
        passwordHash: DEMO_HASH,
        name: 'Sarah Jenkins',
        role: 'LOGISTICS_MANAGER',
        status: 'APPROVED',
        phone: '+91 98840 99881',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
        aadharCardUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        experienceYears: 7,
        address: 'Fleet Control Hub 12, Whitefield Expressway, Bangalore, KA 560066',
        approvedById: 'usr-admin-1',
        approvedByName: 'Alexander Cross',
        approvedAt: '2026-01-12T11:00:00Z',
        createdAt: '2026-01-12T10:00:00Z',
        updatedAt: '2026-01-12T11:00:00Z',
      },
      {
        id: 'usr-sup-1',
        email: 'supplier@apexdevices.com',
        passwordHash: DEMO_HASH,
        name: 'Vikram Mehta',
        role: 'SUPPLIER',
        status: 'APPROVED',
        companyName: 'Apex Micro Devices Ltd',
        phone: '+91 98200 44556',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
        aadharCardUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        experienceYears: 12,
        address: 'Apex Tech Campus, Phase 2, Electronic City, Bangalore, KA 560100',
        approvedById: 'usr-admin-1',
        approvedByName: 'Alexander Cross',
        approvedAt: '2026-01-15T12:00:00Z',
        createdAt: '2026-01-15T11:00:00Z',
        updatedAt: '2026-01-15T12:00:00Z',
      },
      {
        id: 'usr-cust-1',
        email: 'customer@novatech.com',
        passwordHash: DEMO_HASH,
        name: 'Elena Rostova',
        role: 'CUSTOMER',
        status: 'APPROVED',
        companyName: 'NovaTech Systems',
        phone: '+91 97110 33221',
        photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
        aadharCardUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        experienceYears: 5,
        address: 'NovaTech Park, BKC Bandra Kurla Complex, Mumbai, MH 400051',
        approvedById: 'usr-admin-1',
        approvedByName: 'Alexander Cross',
        approvedAt: '2026-01-20T15:00:00Z',
        createdAt: '2026-01-20T14:20:00Z',
        updatedAt: '2026-01-20T15:00:00Z',
      },
      // Realistic pending sign-ups so the Admin approval queue shows full applicant dossiers
      {
        id: 'usr-pending-1',
        email: 'newwarehouse@cargopulse.io',
        passwordHash: DEMO_HASH,
        name: 'Priya Nair',
        role: 'WAREHOUSE_MANAGER',
        status: 'PENDING',
        phone: '+91 98412 87654',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        aadharCardUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        experienceYears: 6,
        address: 'Villa 18, Lakeview Residency, Medavakkam, Chennai, TN 600100',
        createdAt: '2026-09-18T09:00:00Z',
        updatedAt: '2026-09-18T09:00:00Z',
      },
      {
        id: 'usr-pending-2',
        email: 'partner@brightsupply.com',
        passwordHash: DEMO_HASH,
        name: 'Daniel Osei',
        role: 'SUPPLIER',
        status: 'PENDING',
        companyName: 'BrightSupply Traders',
        phone: '+91 99620 11990',
        photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
        aadharCardUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        experienceYears: 8,
        address: 'B2 Trade Center, Port Trust Road, Tuticorin, TN 628001',
        createdAt: '2026-09-19T13:00:00Z',
        updatedAt: '2026-09-19T13:00:00Z',
      },
    ];

    // 2. Categories
    this.categories = [
      { id: 'cat-elec', name: 'Electronics & Computing', description: 'Enterprise computing, displays, and embedded boards' },
      { id: 'cat-pharma', name: 'Pharmaceuticals & Cold Chain', description: 'Temperature controlled medicines and vaccines' },
      { id: 'cat-auto', name: 'Automotive Components', description: 'High-precision drivetrain, sensors, and braking assemblies' },
      { id: 'cat-industrial', name: 'Industrial Automation', description: 'Servos, PLCs, and pneumatic actuators' },
    ];

    // 3. Suppliers
    this.suppliers = [
      {
        id: 'sup-101',
        code: 'SUP-APEX',
        name: 'Apex Micro Devices Ltd',
        contactName: 'Vikram Mehta',
        email: 'supplier@apexdevices.com',
        phone: '+91 98450 11223',
        address: 'Electronic City Phase II, Hosur Road',
        city: 'Bangalore',
        country: 'India',
        rating: 4.8,
        onTimeDeliveryRate: 94.2,
        qualityRate: 98.6,
        fulfillmentRate: 96.0,
        overallScore: 96.2,
      },
      {
        id: 'sup-102',
        code: 'SUP-BIOPHARMA',
        name: 'BioPharma Global Ltd',
        contactName: 'Dr. Ananya Roy',
        email: 'orders@biopharmaglobal.com',
        phone: '+91 98200 44332',
        address: 'MIDC Biotech Park, Hinjewadi',
        city: 'Pune',
        country: 'India',
        rating: 4.9,
        onTimeDeliveryRate: 98.1,
        qualityRate: 99.4,
        fulfillmentRate: 97.5,
        overallScore: 98.3,
      },
      {
        id: 'sup-103',
        code: 'SUP-PRECISION',
        name: 'Precision Auto Dynamics',
        contactName: 'Rajesh Nair',
        email: 'sales@precisionautodynamics.in',
        phone: '+91 97910 88776',
        address: 'Oragadam Industrial Corridor, Sriperumbudur',
        city: 'Chennai',
        country: 'India',
        rating: 4.3,
        onTimeDeliveryRate: 86.5,
        qualityRate: 93.0,
        fulfillmentRate: 88.0,
        overallScore: 89.1,
      },
    ];

    // 4. Products
    this.products = [
      {
        id: 'prd-001',
        sku: 'LAP-001',
        name: 'Dell Latitude Enterprise 5540 Laptop',
        description: 'Intel i7-1365U, 32GB DDR5, 1TB NVMe, 15.6 FHD Anti-Glare',
        categoryId: 'cat-elec',
        unit: 'units',
        price: 89500,
        minStock: 25,
        maxStock: 200,
        weightKg: 1.62,
        dailyDemand: 6.5,
        supplierId: 'sup-101',
        createdAt: '2026-02-01T00:00:00Z',
      },
      {
        id: 'prd-002',
        sku: 'MON-1023',
        name: 'Samsung ViewFinity S8 34" Curved Monitor',
        description: 'Ultra-wide WQHD (3440 x 1440), 90W USB-C PD, HDR10',
        categoryId: 'cat-elec',
        unit: 'units',
        price: 44900,
        minStock: 15,
        maxStock: 150,
        weightKg: 7.2,
        dailyDemand: 4.2,
        supplierId: 'sup-101',
        createdAt: '2026-02-02T00:00:00Z',
      },
      {
        id: 'prd-003',
        sku: 'MED-COLD-88',
        name: 'BioPharma Insulin Glargine Cold Chain (100 IU/ml)',
        description: 'Store at 2°C to 8°C. Monitored thermal datalogger included.',
        categoryId: 'cat-pharma',
        unit: 'vials',
        price: 680,
        minStock: 200,
        maxStock: 2000,
        weightKg: 0.15,
        dailyDemand: 45.0,
        supplierId: 'sup-102',
        createdAt: '2026-02-03T00:00:00Z',
      },
      {
        id: 'prd-004',
        sku: 'AUTO-BRK-40',
        name: 'Ceramic Composite Ventilated Brake Rotor Kit',
        description: 'High thermal dissipation for heavy electric vehicles',
        categoryId: 'cat-auto',
        unit: 'sets',
        price: 18200,
        minStock: 18,
        maxStock: 120,
        weightKg: 14.5,
        dailyDemand: 2.8,
        supplierId: 'sup-103',
        createdAt: '2026-02-04T00:00:00Z',
      },
      {
        id: 'prd-005',
        sku: 'SRV-PLC-09',
        name: 'Siemens Simatic S7-1500 Modular PLC CPU',
        description: 'Industrial automation controller with integrated PROFINET',
        categoryId: 'cat-industrial',
        unit: 'units',
        price: 135000,
        minStock: 8,
        maxStock: 50,
        weightKg: 2.1,
        dailyDemand: 1.2,
        supplierId: 'sup-101',
        createdAt: '2026-02-05T00:00:00Z',
      },
      {
        id: 'prd-006',
        sku: 'IOT-TEMP-02',
        name: 'Cellular IoT Ambient & Humidity Sensor Probe',
        description: 'Real-time telemetry transponder with 5-year internal battery',
        categoryId: 'cat-elec',
        unit: 'units',
        price: 4200,
        minStock: 30,
        maxStock: 300,
        weightKg: 0.28,
        dailyDemand: 5.0,
        supplierId: 'sup-101',
        createdAt: '2026-02-06T00:00:00Z',
      },
    ];

    // 5. Warehouses with Zone -> Rack -> Bin hierarchy
    this.warehouses = [
      {
        id: 'wh-chn-01',
        code: 'WH-CHN',
        name: 'Chennai Central Mega Fulfillment Hub',
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        address: 'Plot 14-18, SIPCOT Logistics Park, Sriperumbudur',
        latitude: 12.9815,
        longitude: 80.0152,
        capacitySqFt: 185000,
        utilizationPct: 78.4,
        zones: [
          {
            id: 'zone-chn-a',
            code: 'ZONE-A',
            name: 'High-Value Electronics Vault',
            warehouseId: 'wh-chn-01',
            racks: [
              {
                id: 'rack-chn-a01',
                code: 'RACK-A01',
                zoneId: 'zone-chn-a',
                bins: [
                  { id: 'bin-chn-a01-01', code: 'BIN-A01-01', rackId: 'rack-chn-a01' },
                  { id: 'bin-chn-a01-02', code: 'BIN-A01-02', rackId: 'rack-chn-a01' },
                  { id: 'bin-chn-a01-03', code: 'BIN-A01-03', rackId: 'rack-chn-a01' },
                ],
              },
              {
                id: 'rack-chn-a02',
                code: 'RACK-A02',
                zoneId: 'zone-chn-a',
                bins: [
                  { id: 'bin-chn-a02-01', code: 'BIN-A02-01', rackId: 'rack-chn-a02' },
                  { id: 'bin-chn-a02-02', code: 'BIN-A02-02', rackId: 'rack-chn-a02' },
                ],
              },
            ],
          },
          {
            id: 'zone-chn-b',
            code: 'ZONE-B',
            name: 'Automotive & Heavy Parts Bay',
            warehouseId: 'wh-chn-01',
            racks: [
              {
                id: 'rack-chn-b01',
                code: 'RACK-B01',
                zoneId: 'zone-chn-b',
                bins: [
                  { id: 'bin-chn-b01-01', code: 'BIN-B01-01', rackId: 'rack-chn-b01' },
                  { id: 'bin-chn-b01-02', code: 'BIN-B01-02', rackId: 'rack-chn-b01' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'wh-blr-02',
        code: 'WH-BLR',
        name: 'Bangalore Tech Distribution Gateway',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        address: 'Survey 45/2, KIADB Aerospace SEZ, Devanahalli',
        latitude: 13.2084,
        longitude: 77.7126,
        capacitySqFt: 140000,
        utilizationPct: 62.1,
        zones: [
          {
            id: 'zone-blr-a',
            code: 'ZONE-A',
            name: 'Rapid Dispatch & Cross-docking',
            warehouseId: 'wh-blr-02',
            racks: [
              {
                id: 'rack-blr-a01',
                code: 'RACK-A01',
                zoneId: 'zone-blr-a',
                bins: [
                  { id: 'bin-blr-a01-01', code: 'BIN-A01-01', rackId: 'rack-blr-a01' },
                  { id: 'bin-blr-a01-02', code: 'BIN-A01-02', rackId: 'rack-blr-a01' },
                ],
              },
            ],
          },
          {
            id: 'zone-blr-c',
            code: 'ZONE-C',
            name: 'Cold Storage Quarantine (2-8°C)',
            warehouseId: 'wh-blr-02',
            racks: [
              {
                id: 'rack-blr-c01',
                code: 'RACK-C01',
                zoneId: 'zone-blr-c',
                bins: [
                  { id: 'bin-blr-c01-01', code: 'BIN-C01-01', rackId: 'rack-blr-c01' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'wh-mum-03',
        code: 'WH-MUM',
        name: 'Mumbai JNPT Port Logistics Center',
        city: 'Navi Mumbai',
        state: 'Maharashtra',
        country: 'India',
        address: 'Sector 11, JNPT Special Economic Zone, Nhava Sheva',
        latitude: 18.9482,
        longitude: 72.9511,
        capacitySqFt: 220000,
        utilizationPct: 84.6,
        zones: [
          {
            id: 'zone-mum-a',
            code: 'ZONE-A',
            name: 'Container Freight Staging',
            warehouseId: 'wh-mum-03',
            racks: [
              {
                id: 'rack-mum-a01',
                code: 'RACK-A01',
                zoneId: 'zone-mum-a',
                bins: [
                  { id: 'bin-mum-a01-01', code: 'BIN-A01-01', rackId: 'rack-mum-a01' },
                ],
              },
            ],
          },
        ],
      },
    ];

    // 6. Inventories (Live stock mapped to bin locations)
    this.inventories = [
      {
        id: 'inv-1',
        productId: 'prd-001', // Dell Latitude
        warehouseId: 'wh-chn-01',
        binId: 'bin-chn-a01-02',
        quantity: 124,
        batchNumber: 'BATCH-2026-DEL-09',
        expiryDate: '2029-12-31',
        updatedAt: '2026-03-01T10:00:00Z',
      },
      {
        id: 'inv-2',
        productId: 'prd-001',
        warehouseId: 'wh-blr-02',
        binId: 'bin-blr-a01-01',
        quantity: 18, // LOW STOCK alert (minStock = 25)
        batchNumber: 'BATCH-2026-DEL-08',
        expiryDate: '2029-12-31',
        updatedAt: '2026-03-02T11:20:00Z',
      },
      {
        id: 'inv-3',
        productId: 'prd-002', // Samsung 34" Monitor
        warehouseId: 'wh-chn-01',
        binId: 'bin-chn-a02-01',
        quantity: 68,
        batchNumber: 'BATCH-SAM-554',
        updatedAt: '2026-03-01T14:30:00Z',
      },
      {
        id: 'inv-4',
        productId: 'prd-003', // Insulin Cold Chain
        warehouseId: 'wh-blr-02',
        binId: 'bin-blr-c01-01',
        quantity: 1420,
        batchNumber: 'CC-GLARG-26-03',
        expiryDate: '2027-04-15',
        updatedAt: '2026-03-03T09:00:00Z',
      },
      {
        id: 'inv-5',
        productId: 'prd-004', // Ceramic Brake Kit
        warehouseId: 'wh-chn-01',
        binId: 'bin-chn-b01-02',
        quantity: 54,
        batchNumber: 'PAD-BRK-991',
        updatedAt: '2026-03-01T16:00:00Z',
      },
      {
        id: 'inv-6',
        productId: 'prd-005', // Siemens PLC
        warehouseId: 'wh-chn-01',
        binId: 'bin-chn-a01-03',
        quantity: 12,
        batchNumber: 'SIE-PLC-8812',
        updatedAt: '2026-03-02T08:15:00Z',
      },
      {
        id: 'inv-7',
        productId: 'prd-006', // IoT Sensor
        warehouseId: 'wh-chn-01',
        binId: 'bin-chn-a01-01',
        quantity: 180,
        batchNumber: 'IOT-SN-4412',
        updatedAt: '2026-03-01T11:00:00Z',
      },
    ];

    // 7. Inventory Transactions (History ledger)
    this.transactions = [
      {
        id: 'tx-1001',
        transactionNo: 'TX-2026-1001',
        productId: 'prd-001',
        warehouseId: 'wh-chn-01',
        type: 'STOCK_IN',
        quantity: 100,
        previousStock: 24,
        newStock: 124,
        reason: 'Received against Purchase Order PO-10231',
        referenceDoc: 'PO-10231',
        userId: 'usr-wm-1',
        createdAt: '2026-03-01T09:15:00Z',
      },
      {
        id: 'tx-1002',
        transactionNo: 'TX-2026-1002',
        productId: 'prd-001',
        warehouseId: 'wh-blr-02',
        type: 'STOCK_OUT',
        quantity: 12,
        previousStock: 30,
        newStock: 18,
        reason: 'Dispatched for enterprise client order ORD-8812',
        referenceDoc: 'SH-10234',
        userId: 'usr-wm-1',
        createdAt: '2026-03-02T11:20:00Z',
      },
      {
        id: 'tx-1003',
        transactionNo: 'TX-2026-1003',
        productId: 'prd-003',
        warehouseId: 'wh-blr-02',
        type: 'STOCK_IN',
        quantity: 500,
        previousStock: 920,
        newStock: 1420,
        reason: 'Direct cold chain transfer from BioPharma Global',
        referenceDoc: 'PO-10232',
        userId: 'usr-wm-1',
        createdAt: '2026-03-03T09:00:00Z',
      },
      {
        id: 'tx-1004',
        transactionNo: 'TX-2026-1004',
        productId: 'prd-004',
        warehouseId: 'wh-chn-01',
        type: 'TRANSFER',
        quantity: 20,
        previousStock: 74,
        newStock: 54,
        reason: 'Inter-warehouse rebalancing transfer to Mumbai WH',
        referenceDoc: 'TRF-CHN-MUM-01',
        userId: 'usr-wm-1',
        createdAt: '2026-03-04T14:40:00Z',
      },
      {
        id: 'tx-1005',
        transactionNo: 'TX-2026-1005',
        productId: 'prd-002',
        warehouseId: 'wh-chn-01',
        type: 'DAMAGED',
        quantity: 2,
        previousStock: 70,
        newStock: 68,
        reason: 'Transit packaging rupture flagged during inbound QA',
        referenceDoc: 'RET-1023',
        userId: 'usr-wm-1',
        createdAt: '2026-03-04T16:10:00Z',
      },
    ];

    // 8. Purchase Orders
    this.purchaseOrders = [
      {
        id: 'po-10231',
        orderNo: 'PO-10231',
        supplierId: 'sup-101',
        warehouseId: 'wh-chn-01',
        status: 'RECEIVED',
        totalAmount: 8950000,
        currency: 'INR',
        expectedDate: '2026-03-01',
        receivedDate: '2026-03-01T09:00:00Z',
        createdById: 'usr-wm-1',
        createdAt: '2026-02-20T10:00:00Z',
        items: [
          { id: 'poi-1', purchaseOrderId: 'po-10231', productId: 'prd-001', quantity: 100, unitPrice: 89500, totalPrice: 8950000, receivedQty: 100 },
        ],
      },
      {
        id: 'po-10232',
        orderNo: 'PO-10232',
        supplierId: 'sup-102',
        warehouseId: 'wh-blr-02',
        status: 'DISPATCHED',
        totalAmount: 340000,
        currency: 'INR',
        expectedDate: '2026-03-07',
        createdById: 'usr-wm-1',
        createdAt: '2026-03-02T14:00:00Z',
        items: [
          { id: 'poi-2', purchaseOrderId: 'po-10232', productId: 'prd-003', quantity: 500, unitPrice: 680, totalPrice: 340000, receivedQty: 0 },
        ],
      },
      {
        id: 'po-10233',
        orderNo: 'PO-10233',
        supplierId: 'sup-103',
        warehouseId: 'wh-chn-01',
        status: 'PENDING',
        totalAmount: 910000,
        currency: 'INR',
        expectedDate: '2026-03-12',
        createdById: 'usr-wm-1',
        createdAt: '2026-03-04T16:30:00Z',
        items: [
          { id: 'poi-3', purchaseOrderId: 'po-10233', productId: 'prd-004', quantity: 50, unitPrice: 18200, totalPrice: 910000, receivedQty: 0 },
        ],
      },
      {
        id: 'po-10234',
        orderNo: 'PO-10234',
        supplierId: 'sup-101',
        warehouseId: 'wh-blr-02',
        status: 'APPROVED',
        totalAmount: 2245000,
        currency: 'INR',
        expectedDate: '2026-03-15',
        createdById: 'usr-wm-1',
        createdAt: '2026-03-05T09:10:00Z',
        items: [
          { id: 'poi-4', purchaseOrderId: 'po-10234', productId: 'prd-002', quantity: 50, unitPrice: 44900, totalPrice: 2245000, receivedQty: 0 },
        ],
      },
    ];

    // 9. Carriers, Fleet & Drivers
    this.carriers = [
      { id: 'car-1', name: 'BlueDart Aviation & Express', code: 'BLUEDART', contact: '+91 1800 233 1234', rating: 4.8 },
      { id: 'car-2', name: 'DHL Global Forwarding India', code: 'DHL-IN', contact: '+91 1800 111 3456', rating: 4.9 },
      { id: 'car-3', name: 'CargoSpeed Dedicated Freight Lines', code: 'CARGOSPEED', contact: '+91 44 2884 9900', rating: 4.4 },
    ];

    this.drivers = [
      { id: 'drv-1', name: 'R. Arun Kumar', phone: '+91 94441 23098', licenseNo: 'TN-01-2015-009812', rating: 4.9 },
      { id: 'drv-2', name: 'Manish Verma', phone: '+91 98211 44556', licenseNo: 'MH-03-2017-004512', rating: 4.7 },
      { id: 'drv-3', name: 'Praveen Gowda', phone: '+91 99002 77112', licenseNo: 'KA-05-2019-001290', rating: 4.8 },
    ];

    this.vehicles = [
      { id: 'veh-1', plateNumber: 'TN-01-AB-1234', model: 'BharatBenz 2823R Heavy Hauler', type: 'Refrigerated Multi-Axle', capacityTons: 18.0, currentLoadTons: 11.4, carrierId: 'car-3', driverId: 'drv-1' },
      { id: 'veh-2', plateNumber: 'KA-05-CD-9876', model: 'Tata Ultra T.16 Clean Logistics', type: 'Dry Van Box Truck', capacityTons: 10.0, currentLoadTons: 6.8, carrierId: 'car-1', driverId: 'drv-3' },
      { id: 'veh-3', plateNumber: 'MH-04-EF-5544', model: 'Ashok Leyland Boss 1920', type: 'Heavy Cargo Carrier', capacityTons: 14.0, currentLoadTons: 8.5, carrierId: 'car-2', driverId: 'drv-2' },
    ];

    // 10. Shipments (with detailed tracking events and live GPS simulation coordinates)
    this.shipments = [
      {
        id: 'sh-10234',
        trackingNumber: 'SH-10234',
        originWarehouseId: 'wh-chn-01',
        destWarehouseId: 'wh-blr-02',
        destinationAddress: 'Survey 45/2, KIADB Aerospace SEZ, Devanahalli, Bangalore',
        carrierId: 'car-3',
        vehicleId: 'veh-1',
        driverId: 'drv-1',
        status: 'IN_TRANSIT',
        estimatedDelivery: '2026-09-06T18:00:00Z',
        currentLocation: 'Krishnagiri Highway NH-44',
        currentLat: 12.5266,
        currentLng: 78.2146,
        riskScore: 68,
        delayReason: 'Monsoon heavy rain & highway maintenance near Hosur ghat section',
        items: [
          { productId: 'prd-001', quantity: 25 },
          { productId: 'prd-005', quantity: 4 },
        ],
        trackingEvents: [
          { id: 'te-1', shipmentId: 'sh-10234', status: 'ORDERED', location: 'Chennai Warehouse', timestamp: '2026-09-06T06:00:00Z', note: 'Consignment manifest generated' },
          { id: 'te-2', shipmentId: 'sh-10234', status: 'PACKED', location: 'Chennai Warehouse Bay 3', timestamp: '2026-09-06T07:15:00Z', note: 'Pallets shrink-wrapped & RFID tags sealed' },
          { id: 'te-3', shipmentId: 'sh-10234', status: 'DISPATCHED', location: 'Sriperumbudur Toll Plaza', timestamp: '2026-09-06T08:30:00Z', note: 'Vehicle TN-01-AB-1234 departed origin hub' },
          { id: 'te-4', shipmentId: 'sh-10234', status: 'IN_TRANSIT', location: 'Vellore Bypass Point', timestamp: '2026-09-06T10:45:00Z', note: 'GPS checkpoint verified at 74 km/h' },
          { id: 'te-5', shipmentId: 'sh-10234', status: 'DELAYED', location: 'Krishnagiri Highway NH-44', timestamp: '2026-09-06T12:15:00Z', note: 'Speed dropped to 15 km/h due to waterlogging' },
        ],
        createdAt: '2026-09-06T06:00:00Z',
      },
      {
        id: 'sh-10235',
        trackingNumber: 'SH-10235',
        originWarehouseId: 'wh-blr-02',
        destinationAddress: 'NovaTech Systems HQ, Prestige Tech Park, Marathahalli, Bangalore',
        carrierId: 'car-1',
        vehicleId: 'veh-2',
        driverId: 'drv-3',
        status: 'OUT_FOR_DELIVERY',
        estimatedDelivery: '2026-09-06T15:30:00Z',
        currentLocation: 'Outer Ring Road, Bellandur Junction',
        currentLat: 12.9304,
        currentLng: 77.6784,
        riskScore: 12,
        items: [
          { productId: 'prd-002', quantity: 10 },
          { productId: 'prd-006', quantity: 20 },
        ],
        trackingEvents: [
          { id: 'te-21', shipmentId: 'sh-10235', status: 'ORDERED', location: 'Bangalore Tech Gateway', timestamp: '2026-09-06T07:00:00Z', note: 'Direct client dispatch created' },
          { id: 'te-22', shipmentId: 'sh-10235', status: 'DISPATCHED', location: 'Devanahalli Logistics Hub', timestamp: '2026-09-06T09:10:00Z', note: 'Loaded on Tata Ultra T.16' },
          { id: 'te-23', shipmentId: 'sh-10235', status: 'OUT_FOR_DELIVERY', location: 'Bellandur Sub-Hub', timestamp: '2026-09-06T13:40:00Z', note: 'Courier assigned to courier Praveen Gowda' },
        ],
        createdAt: '2026-09-06T07:00:00Z',
      },
      {
        id: 'sh-10236',
        trackingNumber: 'SH-10236',
        originWarehouseId: 'wh-chn-01',
        destWarehouseId: 'wh-mum-03',
        destinationAddress: 'JNPT SEZ Logistics Center, Navi Mumbai',
        carrierId: 'car-2',
        vehicleId: 'veh-3',
        driverId: 'drv-2',
        status: 'DELIVERED',
        estimatedDelivery: '2026-09-05T18:00:00Z',
        actualDelivery: '2026-09-05T17:25:00Z',
        currentLocation: 'Mumbai JNPT Port Facility',
        currentLat: 18.9482,
        currentLng: 72.9511,
        riskScore: 5,
        items: [
          { productId: 'prd-004', quantity: 20 },
        ],
        trackingEvents: [
          { id: 'te-31', shipmentId: 'sh-10236', status: 'DISPATCHED', location: 'Chennai Mega Hub', timestamp: '2026-09-04T08:00:00Z', note: 'Interstate transit initiated' },
          { id: 'te-32', shipmentId: 'sh-10236', status: 'IN_TRANSIT', location: 'Solapur Checkpost', timestamp: '2026-09-05T04:20:00Z', note: 'On-schedule clearance' },
          { id: 'te-33', shipmentId: 'sh-10236', status: 'ARRIVED', location: 'Navi Mumbai Entry Gate', timestamp: '2026-09-05T15:50:00Z', note: 'Security manifest signed' },
          { id: 'te-34', shipmentId: 'sh-10236', status: 'DELIVERED', location: 'Mumbai JNPT Receiving Dock 4', timestamp: '2026-09-05T17:25:00Z', note: 'Cargo accepted in pristine condition' },
        ],
        createdAt: '2026-09-04T08:00:00Z',
      },
    ];

    // 11. Deliveries & Proof of Delivery
    this.deliveries = [
      {
        id: 'del-501',
        deliveryNo: 'DEL-2026-501',
        shipmentId: 'sh-10235',
        recipientName: 'Elena Rostova',
        recipientPhone: '+91 98455 66778',
        destination: 'NovaTech Systems HQ, Prestige Tech Park, Marathahalli, Bangalore',
        status: 'OUT_FOR_DELIVERY',
        scheduledTime: '2026-09-06T15:30:00Z',
      },
      {
        id: 'del-502',
        deliveryNo: 'DEL-2026-502',
        shipmentId: 'sh-10236',
        recipientName: 'Gaurav Singhania',
        recipientPhone: '+91 98201 11223',
        destination: 'Mumbai JNPT Port Logistics Center Dock 4',
        status: 'DELIVERED',
        scheduledTime: '2026-09-05T18:00:00Z',
        deliveredTime: '2026-09-05T17:25:00Z',
        proofOfDelivery: {
          signatureUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=GauravSign',
          photoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&q=80',
          signedBy: 'Gaurav Singhania (Warehouse Head)',
          signedAt: '2026-09-05T17:25:00Z',
          notes: 'Seal number verified intact: #SL-889921',
        },
      },
    ];

    // 12. Reverse Logistics (Returns)
    this.returns = [
      {
        id: 'ret-1023',
        returnNo: 'RET-1023',
        customerName: 'AeroTech Systems Pvt Ltd',
        customerEmail: 'procurement@aerotech.in',
        warehouseId: 'wh-chn-01',
        status: 'RECEIVED_FOR_INSPECTION',
        decision: 'PENDING',
        reason: 'Display bezel cracked during customer installation',
        inspectionNotes: 'Front protective film was peeled before unboxing; inner LCD is functioning, outer chassis dented.',
        items: [
          { productId: 'prd-002', quantity: 2, condition: 'DAMAGED' },
        ],
        createdAt: '2026-09-04T11:00:00Z',
      },
      {
        id: 'ret-1024',
        returnNo: 'RET-1024',
        customerName: 'MediLife Hospital Network',
        customerEmail: 'supplies@medilife.org',
        warehouseId: 'wh-blr-02',
        status: 'COMPLETED',
        decision: 'RESTOCK',
        reason: 'Over-ordered quantity returned in sealed sterile outer transport case',
        inspectionNotes: 'Temperature recorder verified continuous 3.8°C throughout transit. Full QA passed.',
        items: [
          { productId: 'prd-003', quantity: 150, condition: 'NEW' },
        ],
        createdAt: '2026-09-01T15:30:00Z',
      },
    ];

    // 13. System Notifications
    this.notifications = [
      {
        id: 'notif-1',
        title: 'Low Stock Alert: Dell Latitude (LAP-001)',
        message: 'Current stock at Bangalore Warehouse is 18 units, below safety threshold of 25 units. Estimated stockout: 2.8 days.',
        severity: 'CRITICAL',
        type: 'INVENTORY',
        isRead: false,
        link: '/inventory',
        createdAt: '2026-09-06T08:15:00Z',
      },
      {
        id: 'notif-2',
        title: 'Transit Risk Warning: Shipment #SH-10234',
        message: 'Severe weather delay reported on NH-44 near Krishnagiri. Expected delay +2.5 hours. Carrier notified.',
        severity: 'WARNING',
        type: 'SHIPMENT',
        isRead: false,
        link: '/shipments/sh-10234/tracking',
        createdAt: '2026-09-06T10:45:00Z',
      },
      {
        id: 'notif-3',
        title: 'Purchase Order Approved: PO-10234',
        message: 'PO-10234 for 50 units of Samsung Curved Monitors has been approved and transmitted to Apex Micro Devices.',
        severity: 'SUCCESS',
        type: 'PURCHASE_ORDER',
        isRead: true,
        link: '/purchase-orders',
        createdAt: '2026-09-05T14:20:00Z',
      },
    ];
  }
}

export const fallbackDb = new InMemoryDatabase();
