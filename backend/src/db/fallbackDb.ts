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
    // 1. Initial Root Administrator (only required platform admin)
    // Password: password123
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
    ];

    // Clean initial state: no mock users, no fake pending signups, no hardcoded stock content
    this.categories = [];
    this.suppliers = [];
    this.products = [];
    this.warehouses = [];
    this.inventories = [];
    this.transactions = [];
    this.purchaseOrders = [];
    this.carriers = [];
    this.vehicles = [];
    this.drivers = [];
    this.shipments = [];
    this.deliveries = [];
    this.returns = [];
    this.notifications = [];
    this.auditLogs = [];
  }
}

export const fallbackDb = new InMemoryDatabase();
