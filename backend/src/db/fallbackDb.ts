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

  updatePassword(email: string, newPasswordHash: string) {
    const u = this.findUserByEmail(email);
    if (!u) return false;
    u.passwordHash = newPasswordHash;
    u.updatedAt = new Date().toISOString();
    this.addAuditLog({ userId: u.id, userName: u.name, action: 'PASSWORD_RESET', entity: 'User', entityId: u.id, details: `Password reset successfully for ${u.email}` });
    return true;
  }

  seed() {
    // 1. Initial Users for all 5 roles + Pending Applicants with authentic Indian worker profiles
    // Standard Demo Password for all accounts: password123
    const DEMO_HASH = '$2a$10$t8dqLAujkbkNob1.E.T8AueZv/WzwTUAXmobMfi/2pG1OnaFKmdQa';

    this.users = [
      {
        id: 'usr-admin-1',
        email: 'admin@cargopulse.io',
        passwordHash: DEMO_HASH,
        name: 'Rajesh Sharma',
        role: 'ADMIN',
        status: 'APPROVED',
        phone: '+91 98400 11223',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        aadharCardUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        experienceYears: 15,
        address: 'Tower A, Global Logistics Center, Guindy, Chennai, TN 600032',
        createdAt: '2026-01-10T08:00:00Z',
        updatedAt: '2026-01-10T08:00:00Z',
      },
      {
        id: 'usr-wm-1',
        email: 'warehouse@cargopulse.io',
        passwordHash: DEMO_HASH,
        name: 'Karthik Subramanian',
        role: 'WAREHOUSE_MANAGER',
        status: 'APPROVED',
        phone: '+91 98401 55678',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
        aadharCardUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        experienceYears: 11,
        address: 'Plot 42, SIPCOT Industrial Park, Sriperumbudur, Kanchipuram, TN 602105',
        approvedById: 'usr-admin-1',
        approvedByName: 'Rajesh Sharma',
        approvedAt: '2026-01-11T10:00:00Z',
        createdAt: '2026-01-11T09:30:00Z',
        updatedAt: '2026-01-11T10:00:00Z',
      },
      {
        id: 'usr-log-1',
        email: 'logistics@cargopulse.io',
        passwordHash: DEMO_HASH,
        name: 'Arunkumar Pillai',
        role: 'LOGISTICS_MANAGER',
        status: 'APPROVED',
        phone: '+91 98840 99881',
        photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
        aadharCardUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        experienceYears: 9,
        address: 'Fleet Control Hub 14, Peenya 3rd Phase, Bengaluru, KA 560058',
        approvedById: 'usr-admin-1',
        approvedByName: 'Rajesh Sharma',
        approvedAt: '2026-01-12T11:00:00Z',
        createdAt: '2026-01-12T10:00:00Z',
        updatedAt: '2026-01-12T11:00:00Z',
      },
      {
        id: 'usr-sup-1',
        email: 'supplier@apexdevices.com',
        passwordHash: DEMO_HASH,
        name: 'Vikramaditya Mehta',
        role: 'SUPPLIER',
        status: 'APPROVED',
        companyName: 'Tata AutoComp Systems Ltd',
        phone: '+91 98200 44556',
        photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
        aadharCardUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        experienceYears: 14,
        address: 'Tata AutoComp Campus, Phase 1, Hinjewadi MIDC, Pune, MH 411057',
        approvedById: 'usr-admin-1',
        approvedByName: 'Rajesh Sharma',
        approvedAt: '2026-01-15T12:00:00Z',
        createdAt: '2026-01-15T11:00:00Z',
        updatedAt: '2026-01-15T12:00:00Z',
      },
      {
        id: 'usr-cust-1',
        email: 'customer@novatech.com',
        passwordHash: DEMO_HASH,
        name: 'Ananya Sengupta',
        role: 'CUSTOMER',
        status: 'APPROVED',
        companyName: 'Reliance Retail Supply Logistics',
        phone: '+91 98190 33221',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
        aadharCardUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        experienceYears: 8,
        address: 'Reliance Retail Central Hub, BKC Bandra Kurla Complex, Mumbai, MH 400051',
        approvedById: 'usr-admin-1',
        approvedByName: 'Rajesh Sharma',
        approvedAt: '2026-01-20T15:00:00Z',
        createdAt: '2026-01-20T14:20:00Z',
        updatedAt: '2026-01-20T15:00:00Z',
      },
      // Realistic Pending Registration Dossiers for Admin Review Tab
      {
        id: 'usr-pending-1',
        email: 'pradeep.rajan@cargopulse.io',
        passwordHash: DEMO_HASH,
        name: 'Pradeep Rajan',
        role: 'WAREHOUSE_MANAGER',
        status: 'PENDING',
        phone: '+91 98412 87654',
        photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
        aadharCardUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        experienceYears: 6,
        address: 'Flat 3B, Sri Sai Enclave, Ambattur Industrial Estate, Chennai, TN 600058',
        createdAt: '2026-10-14T09:00:00Z',
        updatedAt: '2026-10-14T09:00:00Z',
      },
      {
        id: 'usr-pending-2',
        email: 'deepak.choudhary@havells.com',
        passwordHash: DEMO_HASH,
        name: 'Deepak Choudhary',
        role: 'SUPPLIER',
        status: 'PENDING',
        companyName: 'Havells India Industrial Supply',
        phone: '+91 99100 88992',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        aadharCardUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        experienceYears: 9,
        address: 'Plot 20, Sector 18, Udyog Vihar, Gurugram, HR 122015',
        createdAt: '2026-10-14T11:30:00Z',
        updatedAt: '2026-10-14T11:30:00Z',
      },
    ];

    // 2. Categories (India Core Industrial & Logistics Sectors)
    this.categories = [
      { id: 'cat-auto', name: 'Automotive & Commercial Powertrain', description: 'Heavy commercial transmissions, braking units, and forged axle assemblies (Tata Motors, Ashok Leyland)' },
      { id: 'cat-pharma', name: 'Pharmaceuticals & Active Ingredients', description: 'Temperature-controlled cold chain vaccines, life-saving serums, and sterile injectables (Sun Pharma, Serum Institute)' },
      { id: 'cat-elec', name: 'Enterprise Computing & Telematics', description: 'Industrial IoT modules, 4G GPS trackers, and high-performance server boards (Dixon Technologies, Foxconn India)' },
      { id: 'cat-industrial', name: 'Heavy Industrial Automation & Switchgear', description: 'PLC controllers, high-voltage breakers, and pneumatic robotic actuators (L&T, Siemens India)' },
      { id: 'cat-fmcg', name: 'Fast-Moving Consumer & Retail Goods', description: 'High-turnover packaged retail consumables for wholesale national distribution (Reliance Retail, ITC)' },
    ];

    // 3. Indian Enterprise Suppliers
    this.suppliers = [
      {
        id: 'sup-101',
        code: 'SUP-TATA-AUTO',
        name: 'Tata AutoComp Systems Ltd',
        contactName: 'Vikramaditya Mehta',
        email: 'supplier@apexdevices.com',
        phone: '+91 98200 44556',
        address: 'Tata AutoComp Campus, Phase 1, Hinjewadi MIDC',
        city: 'Pune',
        country: 'India',
        rating: 4.9,
        onTimeDeliveryRate: 97.4,
        qualityRate: 99.2,
        fulfillmentRate: 98.0,
        overallScore: 98.2,
      },
      {
        id: 'sup-102',
        code: 'SUP-SUN-PHARMA',
        name: 'Sun Pharma Global Industries',
        contactName: 'Dr. Suresh Chandran',
        email: 'orders@sunpharma.in',
        phone: '+91 265 233 4455',
        address: 'Plot 18, MIDC Industrial Estate, Makarpura',
        city: 'Vadodara',
        country: 'India',
        rating: 4.8,
        onTimeDeliveryRate: 98.2,
        qualityRate: 99.6,
        fulfillmentRate: 97.5,
        overallScore: 98.4,
      },
      {
        id: 'sup-103',
        code: 'SUP-DIXON-TECH',
        name: 'Dixon Technologies (India) Ltd',
        contactName: 'Rajeshwar Varma',
        email: 'procure@dixoninfo.com',
        phone: '+91 120 472 8800',
        address: 'B-37, Sector 63, Electronic City',
        city: 'Noida',
        country: 'India',
        rating: 4.7,
        onTimeDeliveryRate: 95.8,
        qualityRate: 97.5,
        fulfillmentRate: 96.0,
        overallScore: 96.4,
      },
      {
        id: 'sup-104',
        code: 'SUP-BHARAT-FORGE',
        name: 'Bharat Forge Commercials Ltd',
        contactName: 'Amit Deshmukh',
        email: 'sales@bharatforge.in',
        phone: '+91 20 6704 2777',
        address: 'Mundhwa Industrial Corridor, Pune Cantonment',
        city: 'Pune',
        country: 'India',
        rating: 4.9,
        onTimeDeliveryRate: 99.1,
        qualityRate: 99.8,
        fulfillmentRate: 98.9,
        overallScore: 99.3,
      },
    ];

    // 4. Products (Real-world Indian items, specifications & INR pricing)
    this.products = [
      {
        id: 'prd-001',
        sku: 'TATA-GBX-6S',
        name: 'Tata Motors 6-Speed Heavy Commercial Synchro-Gearbox',
        description: 'G-1150 6-speed manual synchromesh transmission for heavy line-haul commercial trucks',
        categoryId: 'cat-auto',
        unit: 'units',
        price: 145000,
        minStock: 15,
        maxStock: 120,
        weightKg: 185.0,
        dailyDemand: 4.5,
        supplierId: 'sup-101',
        createdAt: '2026-02-01T00:00:00Z',
      },
      {
        id: 'prd-002',
        sku: 'SUN-VAX-02',
        name: 'Sun Pharma Sterile Cold-Chain Injectable Serum (Pack of 100)',
        description: 'Active bio-formulation life sciences injectables, temperature-monitored at 2°C to 8°C',
        categoryId: 'cat-pharma',
        unit: 'packs',
        price: 1850,
        minStock: 200,
        maxStock: 3000,
        weightKg: 0.25,
        dailyDemand: 65.0,
        supplierId: 'sup-102',
        createdAt: '2026-02-02T00:00:00Z',
      },
      {
        id: 'prd-003',
        sku: 'DXN-DISP-55',
        name: 'Dixon 4K Ultra-HD Smart Industrial Telematics Display Panel',
        description: '55-inch anti-glare high-nit industrial terminal display with built-in telemetry dashboard',
        categoryId: 'cat-elec',
        unit: 'units',
        price: 32500,
        minStock: 20,
        maxStock: 150,
        weightKg: 12.5,
        dailyDemand: 3.8,
        supplierId: 'sup-103',
        createdAt: '2026-02-03T00:00:00Z',
      },
      {
        id: 'prd-004',
        sku: 'BF-AXL-770',
        name: 'Bharat Forge Forged High-Tensile Steel Front Axle Beam Assembly',
        description: 'Drop-forged I-beam heavy commercial front steering axle tested to 7.5T dynamic load',
        categoryId: 'cat-auto',
        unit: 'assemblies',
        price: 28400,
        minStock: 25,
        maxStock: 200,
        weightKg: 68.0,
        dailyDemand: 6.2,
        supplierId: 'sup-104',
        createdAt: '2026-02-04T00:00:00Z',
      },
      {
        id: 'prd-005',
        sku: 'LT-PLC-900',
        name: 'L&T Modular Heavy Industrial Switchgear PLC Panel',
        description: 'Microprocessor-based automation logic controller with built-in Modbus and PROFINET interface',
        categoryId: 'cat-industrial',
        unit: 'units',
        price: 84000,
        minStock: 8,
        maxStock: 60,
        weightKg: 14.2,
        dailyDemand: 1.5,
        supplierId: 'sup-104',
        createdAt: '2026-02-05T00:00:00Z',
      },
      {
        id: 'prd-006',
        sku: 'IND-IOT-4G',
        name: 'Cellular 4G IoT Ambient Temperature & Real-Time GPS Probe',
        description: 'Ruggedized IP67 telemetry tracker with 5-year standby lithium battery and NIST-traceable sensor',
        categoryId: 'cat-elec',
        unit: 'probes',
        price: 3850,
        minStock: 50,
        maxStock: 500,
        weightKg: 0.18,
        dailyDemand: 12.0,
        supplierId: 'sup-103',
        createdAt: '2026-02-06T00:00:00Z',
      },
    ];

    // 5. Strategic Indian Mega Warehouses with Complete Zone -> Rack -> Bin Hierarchies
    this.warehouses = [
      {
        id: 'wh-chn-01',
        code: 'WH-CHN',
        name: 'Chennai Central Mega Fulfillment Hub',
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        address: 'Plot 14-18, SIPCOT Logistics Park, Sriperumbudur, Chennai, TN 602105',
        latitude: 12.9815,
        longitude: 80.0152,
        capacitySqFt: 185000,
        utilizationPct: 76.5,
        zones: [
          {
            id: 'zone-chn-a',
            code: 'ZONE-A',
            name: 'Heavy Commercial Powertrain Staging',
            warehouseId: 'wh-chn-01',
            racks: [
              {
                id: 'rack-chn-a01',
                code: 'RACK-A01',
                zoneId: 'zone-chn-a',
                bins: [
                  { id: 'bin-chn-a01-01', code: 'BIN-A01-01', rackId: 'rack-chn-a01' },
                  { id: 'bin-chn-a01-02', code: 'BIN-A01-02', rackId: 'rack-chn-a01' },
                ],
              },
            ],
          },
          {
            id: 'zone-chn-b',
            code: 'ZONE-B',
            name: 'High-Security Telematics & Electronics Vault',
            warehouseId: 'wh-chn-01',
            racks: [
              {
                id: 'rack-chn-b01',
                code: 'RACK-B01',
                zoneId: 'zone-chn-b',
                bins: [
                  { id: 'bin-chn-b01-01', code: 'BIN-B01-01', rackId: 'rack-chn-b01' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'wh-blr-02',
        code: 'WH-BLR',
        name: 'Bengaluru Tech & Cold-Chain Depot',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        address: 'KIADB Industrial Area, Phase 3, Peenya, Bengaluru, KA 560058',
        latitude: 13.0324,
        longitude: 77.5218,
        capacitySqFt: 140000,
        utilizationPct: 68.2,
        zones: [
          {
            id: 'zone-blr-a',
            code: 'ZONE-A',
            name: 'Automated Fast-Pick Conveyor Line',
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
            name: 'Sub-Zero Pharma Depository (2°C - 8°C)',
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
        name: 'Mumbai-Bhiwandi Western Logistics Hub',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        address: 'Kalyan-Bhiwandi Logistics Highway, Sector 4, Bhiwandi, MH 421302',
        latitude: 19.2967,
        longitude: 73.0631,
        capacitySqFt: 210000,
        utilizationPct: 82.0,
        zones: [
          {
            id: 'zone-mum-a',
            code: 'ZONE-A',
            name: 'Regional Retail Pallet Storage',
            warehouseId: 'wh-mum-03',
            racks: [
              {
                id: 'rack-mum-a01',
                code: 'RACK-A01',
                zoneId: 'zone-mum-a',
                bins: [
                  { id: 'bin-mum-a01-01', code: 'BIN-A01-01', rackId: 'rack-mum-a01' },
                  { id: 'bin-mum-a01-02', code: 'BIN-A01-02', rackId: 'rack-mum-a01' },
                ],
              },
            ],
          },
        ],
      },
    ];

    // 6. Inventories (Mapped to verified Indian Bins)
    this.inventories = [
      {
        id: 'inv-1',
        productId: 'prd-001', // Tata Gearbox
        warehouseId: 'wh-chn-01',
        binId: 'bin-chn-a01-01',
        quantity: 48,
        batchNumber: 'BT-2026-CHN-01',
        updatedAt: '2026-10-10T08:00:00Z',
      },
      {
        id: 'inv-2',
        productId: 'prd-004', // Bharat Forge Axle
        warehouseId: 'wh-chn-01',
        binId: 'bin-chn-a01-02',
        quantity: 110,
        batchNumber: 'BT-2026-CHN-02',
        updatedAt: '2026-10-10T09:30:00Z',
      },
      {
        id: 'inv-3',
        productId: 'prd-006', // IoT Telematics Probes
        warehouseId: 'wh-chn-01',
        binId: 'bin-chn-b01-01',
        quantity: 320,
        batchNumber: 'BT-2026-CHN-03',
        updatedAt: '2026-10-11T11:00:00Z',
      },
      {
        id: 'inv-4',
        productId: 'prd-002', // Sun Pharma Injectables
        warehouseId: 'wh-blr-02',
        binId: 'bin-blr-c01-01',
        quantity: 1600,
        batchNumber: 'COV-BATCH-9941',
        expiryDate: '2027-06-30',
        updatedAt: '2026-10-12T14:00:00Z',
      },
      {
        id: 'inv-5',
        productId: 'prd-001', // Tata Gearbox (Low stock alert test)
        warehouseId: 'wh-blr-02',
        binId: 'bin-blr-a01-01',
        quantity: 12, // Below minStock 15 -> triggers live Low Stock Alert!
        batchNumber: 'BT-2026-BLR-01',
        updatedAt: '2026-10-13T10:00:00Z',
      },
      {
        id: 'inv-6',
        productId: 'prd-003', // Dixon 4K Displays
        warehouseId: 'wh-mum-03',
        binId: 'bin-mum-a01-01',
        quantity: 95,
        batchNumber: 'BT-2026-MUM-01',
        updatedAt: '2026-10-14T09:00:00Z',
      },
      {
        id: 'inv-7',
        productId: 'prd-005', // L&T PLC Panels
        warehouseId: 'wh-mum-03',
        binId: 'bin-mum-a01-02',
        quantity: 18,
        batchNumber: 'BT-2026-MUM-02',
        updatedAt: '2026-10-14T12:00:00Z',
      },
    ];

    // 7. Inventory Transactions Ledger
    this.transactions = [
      {
        id: 'tx-1001',
        transactionNo: 'TX-IND-2026-1001',
        productId: 'prd-001',
        warehouseId: 'wh-chn-01',
        type: 'STOCK_IN',
        quantity: 40,
        previousStock: 8,
        newStock: 48,
        reason: 'Received against Inbound Purchase Order PO-IND-2026-01 from Tata AutoComp',
        referenceDoc: 'PO-IND-2026-01',
        userId: 'usr-wm-1',
        createdAt: '2026-10-10T08:00:00Z',
      },
      {
        id: 'tx-1002',
        transactionNo: 'TX-IND-2026-1002',
        productId: 'prd-001',
        warehouseId: 'wh-chn-01',
        type: 'STOCK_OUT',
        quantity: 12,
        previousStock: 48,
        newStock: 36,
        reason: 'Outbound line-haul dispatch for Reliance Retail Mumbai (Shipment SH-IND-1001)',
        referenceDoc: 'SH-IND-1001',
        userId: 'usr-wm-1',
        createdAt: '2026-10-12T11:20:00Z',
      },
      {
        id: 'tx-1003',
        transactionNo: 'TX-IND-2026-1003',
        productId: 'prd-002',
        warehouseId: 'wh-blr-02',
        type: 'STOCK_IN',
        quantity: 800,
        previousStock: 800,
        newStock: 1600,
        reason: 'Cold-chain vaccine receipt from Sun Pharma Makarpura Vadodara',
        referenceDoc: 'PO-IND-2026-02',
        userId: 'usr-wm-1',
        createdAt: '2026-10-13T09:15:00Z',
      },
    ];

    // 8. Purchase Orders (Procurement Lifecycle with INR ₹ Values)
    this.purchaseOrders = [
      {
        id: 'po-10231',
        orderNo: 'PO-IND-2026-01',
        supplierId: 'sup-101',
        warehouseId: 'wh-chn-01',
        status: 'CONFIRMED',
        totalAmount: 5800000,
        currency: 'INR',
        expectedDate: '2026-10-22',
        createdById: 'usr-wm-1',
        items: [
          {
            id: 'poi-1',
            purchaseOrderId: 'po-10231',
            productId: 'prd-001',
            quantity: 40,
            unitPrice: 145000,
            totalPrice: 5800000,
            receivedQty: 0,
          },
        ],
        createdAt: '2026-10-08T09:00:00Z',
      },
      {
        id: 'po-10232',
        orderNo: 'PO-IND-2026-02',
        supplierId: 'sup-102',
        warehouseId: 'wh-blr-02',
        status: 'DISPATCHED',
        totalAmount: 1480000,
        currency: 'INR',
        expectedDate: '2026-10-18',
        createdById: 'usr-wm-1',
        items: [
          {
            id: 'poi-2',
            purchaseOrderId: 'po-10232',
            productId: 'prd-002',
            quantity: 800,
            unitPrice: 1850,
            totalPrice: 1480000,
            receivedQty: 0,
          },
        ],
        createdAt: '2026-10-10T11:30:00Z',
      },
      {
        id: 'po-10233',
        orderNo: 'PO-IND-2026-03',
        supplierId: 'sup-103',
        warehouseId: 'wh-mum-03',
        status: 'APPROVED',
        totalAmount: 3900000,
        currency: 'INR',
        expectedDate: '2026-10-25',
        createdById: 'usr-wm-1',
        items: [
          {
            id: 'poi-3',
            purchaseOrderId: 'po-10233',
            productId: 'prd-003',
            quantity: 120,
            unitPrice: 32500,
            totalPrice: 3900000,
            receivedQty: 0,
          },
        ],
        createdAt: '2026-10-12T14:15:00Z',
      },
      {
        id: 'po-10234',
        orderNo: 'PO-IND-2026-04',
        supplierId: 'sup-104',
        warehouseId: 'wh-chn-01',
        status: 'RECEIVED',
        totalAmount: 1420000,
        currency: 'INR',
        expectedDate: '2026-10-12',
        receivedDate: '2026-10-12T16:00:00Z',
        createdById: 'usr-wm-1',
        items: [
          {
            id: 'poi-4',
            purchaseOrderId: 'po-10234',
            productId: 'prd-004',
            quantity: 50,
            unitPrice: 28400,
            totalPrice: 1420000,
            receivedQty: 50,
          },
        ],
        createdAt: '2026-10-04T10:00:00Z',
      },
    ];

    // 9. Fleet Carriers, Indian Commercial Drivers & Heavy Vehicles
    this.carriers = [
      { id: 'car-tci', name: 'TCI Express Commercial Freight Ltd', code: 'TCI-IND', contact: '+91 80 2200 4400', rating: 4.8 },
      { id: 'car-vrl', name: 'VRL Logistics Express Network', code: 'VRL-IND', contact: '+91 80 2600 5500', rating: 4.7 },
      { id: 'car-blue', name: 'Blue Dart Cold-Chain Specialized Logistics', code: 'BLUEDART-IND', contact: '+91 80 2800 6600', rating: 4.9 },
      { id: 'car-mll', name: 'Mahindra Logistics National Supply Network', code: 'MLL-IND', contact: '+91 22 2800 7700', rating: 4.8 },
    ];

    this.drivers = [
      { id: 'drv-1', name: 'Ramesh Kumar', phone: '+91 98450 12345', licenseNo: 'TN-04-20150001234', rating: 4.9 },
      { id: 'drv-2', name: 'Suresh Babu', phone: '+91 98450 67890', licenseNo: 'KA-01-20180005678', rating: 4.7 },
      { id: 'drv-3', name: 'Muthu Krishnan', phone: '+91 98450 11122', licenseNo: 'TN-22-20160009988', rating: 4.8 },
      { id: 'drv-4', name: 'Dnyaneshwar Patil', phone: '+91 97660 77889', licenseNo: 'MH-12-20170004455', rating: 4.9 },
    ];

    this.vehicles = [
      { id: 'veh-1', plateNumber: 'TN 04 BB 4120', model: 'Tata Signa 2823.T Heavy Multi-Axle', type: 'MULTI_AXLE_TRUCK', capacityTons: 24, currentLoadTons: 18.2, carrierId: 'car-tci', driverId: 'drv-1' },
      { id: 'veh-2', plateNumber: 'KA 01 AH 9042', model: 'BharatBenz 1617R Medium Container Hauler', type: 'CONTAINER_TRUCK', capacityTons: 12, currentLoadTons: 8.5, carrierId: 'car-vrl', driverId: 'drv-2' },
      { id: 'veh-3', plateNumber: 'TN 22 CE 7701', model: 'Eicher Pro 3015 Sub-Zero Reefer (2°C-8°C)', type: 'REEFER_COLD_CHAIN', capacityTons: 8, currentLoadTons: 3.8, carrierId: 'car-blue', driverId: 'drv-3' },
      { id: 'veh-4', plateNumber: 'MH 12 RN 8821', model: 'Ashok Leyland 4220 Heavy Commercial Trailer', type: 'MULTI_AXLE_TRUCK', capacityTons: 30, currentLoadTons: 22.0, carrierId: 'car-mll', driverId: 'drv-4' },
    ];

    // 10. Live Line-Haul Shipments Along Major Indian Corridors
    this.shipments = [
      {
        id: 'sh-10234',
        trackingNumber: 'SH-IND-1001',
        originWarehouseId: 'wh-chn-01',
        destWarehouseId: 'wh-mum-03',
        destinationAddress: 'Reliance Retail Central Hub, BKC Bandra Kurla Complex, Mumbai, MH 400051',
        status: 'IN_TRANSIT',
        riskScore: 28,
        delayReason: 'Normal transit trajectory along NH-48 Express Corridor',
        estimatedDelivery: '2026-10-18T18:00:00Z',
        carrierId: 'car-tci',
        vehicleId: 'veh-1',
        driverId: 'drv-1',
        currentLocation: 'Hubli Bypass, NH-48 Express Highway Corridor, Karnataka',
        currentLat: 15.3647,
        currentLng: 75.1240,
        items: [
          { productId: 'prd-001', quantity: 12 },
          { productId: 'prd-004', quantity: 20 },
        ],
        trackingEvents: [
          { id: 'ev-1', shipmentId: 'sh-10234', status: 'ORDERED', location: 'Chennai Mega Fulfillment Hub, Sriperumbudur', timestamp: '2026-10-12T08:00:00Z' },
          { id: 'ev-2', shipmentId: 'sh-10234', status: 'PACKED', location: 'Zone A Bay 3, Sriperumbudur', timestamp: '2026-10-12T14:30:00Z' },
          { id: 'ev-3', shipmentId: 'sh-10234', status: 'DISPATCHED', location: 'Gate 4, Sriperumbudur Logistics Park', timestamp: '2026-10-13T06:00:00Z' },
          { id: 'ev-4', shipmentId: 'sh-10234', status: 'IN_TRANSIT', location: 'Ranipet Toll Plaza, NH-48', timestamp: '2026-10-13T09:30:00Z' },
          { id: 'ev-5', shipmentId: 'sh-10234', status: 'IN_TRANSIT', location: 'Hosur Border Checkpost, Karnataka', timestamp: '2026-10-13T16:00:00Z' },
          { id: 'ev-6', shipmentId: 'sh-10234', status: 'IN_TRANSIT', location: 'Hubli Bypass, NH-48 Express Highway', timestamp: '2026-10-14T11:00:00Z' },
        ],
        createdAt: '2026-10-12T08:00:00Z',
      },
      {
        id: 'sh-10235',
        trackingNumber: 'SH-IND-1002',
        originWarehouseId: 'wh-blr-02',
        destWarehouseId: 'wh-chn-01',
        destinationAddress: 'Apollo Speciality Hospital Cold Depository, Greams Road, Chennai, TN 600006',
        status: 'OUT_FOR_DELIVERY',
        riskScore: 10,
        delayReason: 'On-time trajectory with continuous verified sub-zero telemetry (3.6°C)',
        estimatedDelivery: '2026-10-15T16:30:00Z',
        carrierId: 'car-blue',
        vehicleId: 'veh-3',
        driverId: 'drv-3',
        currentLocation: 'Kathipara Flyover, Guindy, Chennai, Tamil Nadu',
        currentLat: 13.0067,
        currentLng: 80.2010,
        items: [
          { productId: 'prd-002', quantity: 250 },
        ],
        trackingEvents: [
          { id: 'ev-11', shipmentId: 'sh-10235', status: 'DISPATCHED', location: 'Bengaluru Peenya Cold Staging Dock', timestamp: '2026-10-14T22:00:00Z' },
          { id: 'ev-12', shipmentId: 'sh-10235', status: 'IN_TRANSIT', location: 'Attibele Toll Plaza, Karnataka-TN Border', timestamp: '2026-10-14T23:45:00Z' },
          { id: 'ev-13', shipmentId: 'sh-10235', status: 'IN_TRANSIT', location: 'Kanchipuram Corridor, NH-48', timestamp: '2026-10-15T09:30:00Z' },
          { id: 'ev-14', shipmentId: 'sh-10235', status: 'OUT_FOR_DELIVERY', location: 'Kathipara Flyover, Guindy, Chennai', timestamp: '2026-10-15T14:00:00Z' },
        ],
        createdAt: '2026-10-14T20:00:00Z',
      },
      {
        id: 'sh-10236',
        trackingNumber: 'SH-IND-1003',
        originWarehouseId: 'wh-chn-01',
        destinationAddress: 'Ashok Leyland Assembly Plant, Ennore High Road, Chennai, TN 600057',
        status: 'DELIVERED',
        riskScore: 5,
        carrierId: 'car-vrl',
        vehicleId: 'veh-2',
        driverId: 'drv-2',
        currentLocation: 'Delivered at Ashok Leyland Dock 3, Ennore, Chennai',
        currentLat: 13.2085,
        currentLng: 80.3150,
        estimatedDelivery: '2026-10-14T16:00:00Z',
        actualDelivery: '2026-10-14T15:45:00Z',
        items: [
          { productId: 'prd-004', quantity: 15 },
        ],
        trackingEvents: [
          { id: 'ev-21', shipmentId: 'sh-10236', status: 'DISPATCHED', location: 'Sriperumbudur Mega Hub Gate 2', timestamp: '2026-10-14T10:00:00Z' },
          { id: 'ev-22', shipmentId: 'sh-10236', status: 'IN_TRANSIT', location: 'Chennai Outer Ring Road (ORR) Minjur Segment', timestamp: '2026-10-14T12:30:00Z' },
          { id: 'ev-23', shipmentId: 'sh-10236', status: 'DELIVERED', location: 'Ashok Leyland Ennore Receiving Bay 3', timestamp: '2026-10-14T15:45:00Z' },
        ],
        createdAt: '2026-10-14T09:00:00Z',
      },
    ];

    // 11. Last-Mile Deliveries & Electronic Proof of Delivery (e-POD)
    this.deliveries = [
      {
        id: 'del-1001',
        deliveryNo: 'DEL-IND-2026-01',
        shipmentId: 'sh-10236',
        recipientName: 'Murugan K. (Store Head)',
        recipientPhone: '+91 98400 55443',
        destination: 'Ashok Leyland Assembly Plant, Ennore, Chennai, TN 600057',
        status: 'DELIVERED',
        scheduledTime: '2026-10-14T16:00:00Z',
        deliveredTime: '2026-10-14T15:45:00Z',
        proofOfDelivery: {
          signatureUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&auto=format&fit=crop&q=80',
          signedBy: 'Murugan K.',
          signedAt: '2026-10-14T15:45:00Z',
          notes: 'All 15 forged front axle beam assemblies received in pristine condition. QR & heat batch stamps cross-verified.',
        },
      },
      {
        id: 'del-1002',
        deliveryNo: 'DEL-IND-2026-02',
        shipmentId: 'sh-10235',
        recipientName: 'Dr. S. Meenakshi (Chief Pharmacist)',
        recipientPhone: '+91 98400 99887',
        destination: 'Apollo Hospital Cold Depository, Greams Road, Chennai, TN 600006',
        status: 'OUT_FOR_DELIVERY',
        scheduledTime: '2026-10-15T16:30:00Z',
      },
    ];

    // 12. Reverse Logistics / RMA Returns (Indian Corporate Consignees)
    this.returns = [
      {
        id: 'ret-1001',
        returnNo: 'RMA-IND-2026-01',
        customerName: 'Tata Motors Pimpri Works, Pune',
        customerEmail: 'procure@tatamotors.com',
        warehouseId: 'wh-chn-01',
        status: 'RECEIVED_FOR_INSPECTION',
        decision: 'REPAIR',
        reason: 'Transit packaging carton scuffed on bottom corner during line-haul transit; inspection verified sensor wiring intact',
        inspectionNotes: 'Gearbox tested on dynamometer bench; synchro-mesh operates flawlessly within 0.02mm tolerance. Repackaging approved.',
        items: [
          { productId: 'prd-001', quantity: 2, condition: 'OPEN_BOX' },
        ],
        createdAt: '2026-10-13T11:00:00Z',
      },
      {
        id: 'ret-1002',
        returnNo: 'RMA-IND-2026-02',
        customerName: 'MedLife Distribution Bengaluru',
        customerEmail: 'orders@medlife.in',
        warehouseId: 'wh-blr-02',
        status: 'COMPLETED',
        decision: 'RESTOCK',
        reason: 'Over-ordered quantity returned in sealed sterile outer transport case with unbroken cold-chain seals',
        inspectionNotes: 'Continuous datalogger confirmed 3.6°C throughout transit. Full QA sign-off granted.',
        items: [
          { productId: 'prd-002', quantity: 150, condition: 'NEW' },
        ],
        createdAt: '2026-10-11T15:30:00Z',
      },
    ];

    // 13. System Notifications & Real-World Operations Telemetry Alerts
    this.notifications = [
      {
        id: 'notif-1',
        title: 'Low Stock Warning: Tata 6-Speed Synchro-Gearbox (TATA-GBX-6S)',
        message: 'Current stock at Bengaluru Tech Depot is 12 units, below the mandatory safety threshold of 15 units. Reorder triggered via RouteIQ replenishment.',
        severity: 'CRITICAL',
        type: 'INVENTORY',
        isRead: false,
        link: '/inventory',
        createdAt: '2026-10-14T08:15:00Z',
      },
      {
        id: 'notif-2',
        title: 'NH-48 Corridor Weather Telemetry Alert: Freight Truck TN 04 BB 4120',
        message: 'Severe pre-cyclonic rainfall reported along NH-48 near Belagavi-Kolhapur corridor. Speed monitored at 58 km/h. Driver Ramesh Kumar notified.',
        severity: 'WARNING',
        type: 'SHIPMENT',
        isRead: false,
        link: '/shipments/sh-10234/tracking',
        createdAt: '2026-10-14T10:45:00Z',
      },
      {
        id: 'notif-3',
        title: 'e-POD Verified & Stored: Ashok Leyland Delivery (DEL-IND-2026-01)',
        message: 'Digital sign-off completed by Murugan K. at Ennore Receiving Bay 3. Invoice 3-way matching cleared.',
        severity: 'SUCCESS',
        type: 'DELIVERY',
        isRead: true,
        link: '/deliveries',
        createdAt: '2026-10-14T15:50:00Z',
      },
    ];

    // 14. Initial Enterprise Audit Trail
    this.auditLogs = [
      {
        id: 'log-init-1',
        userId: 'usr-admin-1',
        userName: 'Rajesh Sharma',
        action: 'INITIALIZE_PLATFORM',
        entity: 'System',
        details: 'CargoPulse Enterprise Platform initialized with India Supply Chain topology and verified RBAC credentials.',
        createdAt: '2026-10-10T08:00:00Z',
      },
      {
        id: 'log-init-2',
        userId: 'usr-wm-1',
        userName: 'Karthik Subramanian',
        action: 'APPROVE_PO',
        entity: 'PurchaseOrder',
        entityId: 'po-10231',
        details: 'Approved PO-IND-2026-01 for 40 Heavy Commercial Synchro-Gearboxes (₹58,00,000) from Tata AutoComp Systems Ltd.',
        createdAt: '2026-10-10T09:15:00Z',
      },
      {
        id: 'log-init-3',
        userId: 'usr-log-1',
        userName: 'Arunkumar Pillai',
        action: 'DISPATCH_SHIPMENT',
        entity: 'Shipment',
        entityId: 'sh-10234',
        details: 'Dispatched line-haul freight SH-IND-1001 with vehicle TN 04 BB 4120 via RouteIQ NH-48 corridor.',
        createdAt: '2026-10-13T06:00:00Z',
      },
    ];
  }
}

export const fallbackDb = new InMemoryDatabase();
