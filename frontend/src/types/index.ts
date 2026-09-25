export type UserRole = 'ADMIN' | 'WAREHOUSE_MANAGER' | 'LOGISTICS_MANAGER' | 'SUPPLIER' | 'CUSTOMER';
export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status?: UserStatus;
  companyName?: string;
  phone?: string;
  photoUrl?: string;
  aadharCardUrl?: string;
  experienceYears?: number | string;
  address?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectedReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  categoryId: string;
  category?: string;
  unit: string;
  price: number;
  minStock: number;
  maxStock: number;
  weightKg?: number;
  dailyDemand?: number;
  supplierId?: string;
  supplier?: string;
  currentStock?: number;
  isLowStock?: boolean;
  daysRemaining?: number;
}

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  category: string;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  binId?: string;
  locationPath: string;
  quantity: number;
  minStock: number;
  isLowStock: boolean;
  batchNumber?: string;
  expiryDate?: string;
  updatedAt: string;
}

export interface InventoryTransaction {
  id: string;
  transactionNo: string;
  productId: string;
  productName: string;
  sku: string;
  warehouseId: string;
  warehouseName: string;
  type: 'STOCK_IN' | 'STOCK_OUT' | 'TRANSFER' | 'ADJUSTMENT' | 'DAMAGED' | 'RETURN';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  referenceDoc?: string;
  userName: string;
  createdAt: string;
}

export interface WarehouseBin {
  id: string;
  code: string;
  rackId: string;
  occupied?: boolean;
  totalQty?: number;
  items?: any[];
}

export interface WarehouseRack {
  id: string;
  code: string;
  zoneId: string;
  bins: WarehouseBin[];
}

export interface WarehouseZone {
  id: string;
  code: string;
  name: string;
  warehouseId: string;
  racks: WarehouseRack[];
}

export interface Warehouse {
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
  totalUnits?: number;
  totalSKUs?: number;
  totalZones?: number;
  totalBins?: number;
  activeInbound?: number;
  activeOutbound?: number;
  zones?: WarehouseZone[];
}

export interface Supplier {
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
  productCount?: number;
  orderCount?: number;
  riskLevel?: 'LOW' | 'MODERATE' | 'ELEVATED';
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQty: number;
}

export interface PurchaseOrder {
  id: string;
  orderNo: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'CONFIRMED' | 'PROCESSING' | 'DISPATCHED' | 'RECEIVED' | 'CANCELLED';
  totalAmount: number;
  currency: string;
  expectedDate: string;
  receivedDate?: string;
  createdAt: string;
  items: PurchaseOrderItem[];
}

export interface TrackingEvent {
  id: string;
  shipmentId: string;
  status: string;
  location: string;
  latitude?: number;
  longitude?: number;
  note?: string;
  timestamp: string;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  originWarehouseId: string;
  originName: string;
  originCity: string;
  destWarehouseId?: string;
  destName: string;
  destCity: string;
  destinationAddress: string;
  carrierName: string;
  vehiclePlate: string;
  vehicleType: string;
  driverName: string;
  driverPhone: string;
  status: 'ORDERED' | 'PACKED' | 'DISPATCHED' | 'IN_TRANSIT' | 'ARRIVED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'DELAYED' | 'CANCELLED';
  estimatedDelivery: string;
  actualDelivery?: string;
  currentLocation: string;
  currentLat: number;
  currentLng: number;
  riskScore: number;
  delayReason?: string;
  isDelayed: boolean;
  items: { productId: string; productName: string; sku: string; quantity: number }[];
  trackingEvents?: TrackingEvent[];
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  type: string;
  capacityTons: number;
  currentLoadTons: number;
  loadPct: number;
  carrierName: string;
  driverName: string;
  driverPhone: string;
  status: string;
  activeShipmentNumber?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNo: string;
  rating: number;
  vehiclePlate: string;
}

export interface Delivery {
  id: string;
  deliveryNo: string;
  shipmentId: string;
  trackingNumber: string;
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

export interface ReturnRequest {
  id: string;
  returnNo: string;
  customerName: string;
  customerEmail: string;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  status: 'REQUESTED' | 'PICKUP_SCHEDULED' | 'IN_TRANSIT' | 'RECEIVED_FOR_INSPECTION' | 'COMPLETED' | 'REJECTED';
  decision: 'PENDING' | 'RESTOCK' | 'REPAIR' | 'REPLACE' | 'SCRAP';
  reason: string;
  inspectionNotes?: string;
  items: { productId: string; productName: string; sku: string; quantity: number; condition: string }[];
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}
