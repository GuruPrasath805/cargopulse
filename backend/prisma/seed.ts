import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CargoPulse PostgreSQL Database Seeding...');

  // Clean existing tables in reverse relational order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.returnItem.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.proofOfDelivery.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.trackingEvent.deleteMany();
  await prisma.shipmentItem.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.carrier.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.warehouseBin.deleteMany();
  await prisma.warehouseRack.deleteMany();
  await prisma.warehouseZone.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // 1. Organization
  const org = await prisma.organization.create({
    data: {
      name: 'CargoPulse Global Logistics Corp',
      code: 'CP-CORP',
      address: 'Prestige Trade Tower, Palace Road, Bangalore',
      phone: '+91 80 4000 9000',
    },
  });

  // 2. Users
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@cargopulse.io',
      name: 'Alexander Cross',
      passwordHash,
      role: 'ADMIN',
      status: 'APPROVED',
      organizationId: org.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'warehouse@cargopulse.io',
      name: 'Karthik Raman',
      passwordHash,
      role: 'WAREHOUSE_MANAGER',
      status: 'APPROVED',
      approvedById: adminUser.id,
      approvedAt: new Date(),
      organizationId: org.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'logistics@cargopulse.io',
      name: 'Sarah Jenkins',
      passwordHash,
      role: 'LOGISTICS_MANAGER',
      status: 'APPROVED',
      approvedById: adminUser.id,
      approvedAt: new Date(),
      organizationId: org.id,
    },
  });

  // A pending sign-up so the Admin approval queue has something to review
  await prisma.user.create({
    data: {
      email: 'newwarehouse@cargopulse.io',
      name: 'Priya Nair',
      passwordHash,
      role: 'WAREHOUSE_MANAGER',
      status: 'PENDING',
      organizationId: org.id,
    },
  });

  // 3. Categories
  const catElec = await prisma.category.create({
    data: { name: 'Electronics & Computing', description: 'Enterprise computing, displays, and embedded boards' },
  });
  const catPharma = await prisma.category.create({
    data: { name: 'Pharmaceuticals & Cold Chain', description: 'Temperature controlled medicines and vaccines' },
  });

  // 4. Suppliers
  const supApex = await prisma.supplier.create({
    data: {
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
  });

  // 5. Products
  const prodLaptop = await prisma.product.create({
    data: {
      sku: 'LAP-001',
      name: 'Dell Latitude Enterprise 5540 Laptop',
      description: 'Intel i7-1365U, 32GB DDR5, 1TB NVMe, 15.6 FHD',
      categoryId: catElec.id,
      unit: 'units',
      price: 89500,
      minStock: 25,
      maxStock: 200,
      weightKg: 1.62,
      dailyDemand: 6.5,
      supplierId: supApex.id,
    },
  });

  // 6. Warehouse Hierarchy
  const whChennai = await prisma.warehouse.create({
    data: {
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
      organizationId: org.id,
    },
  });

  const zoneA = await prisma.warehouseZone.create({
    data: { code: 'ZONE-A', name: 'High-Value Electronics Vault', warehouseId: whChennai.id },
  });

  const rackA01 = await prisma.warehouseRack.create({
    data: { code: 'RACK-A01', zoneId: zoneA.id },
  });

  const bin01 = await prisma.warehouseBin.create({
    data: { code: 'BIN-A01-01', rackId: rackA01.id },
  });

  // 7. Inventory & Transaction
  await prisma.inventory.create({
    data: {
      productId: prodLaptop.id,
      warehouseId: whChennai.id,
      binId: bin01.id,
      quantity: 124,
      batchNumber: 'BATCH-2026-DEL-09',
    },
  });

  await prisma.inventoryTransaction.create({
    data: {
      transactionNo: 'TX-INIT-001',
      productId: prodLaptop.id,
      warehouseId: whChennai.id,
      type: 'STOCK_IN',
      quantity: 124,
      previousStock: 0,
      newStock: 124,
      reason: 'Initial system stock initialization',
      userId: adminUser.id,
    },
  });

  console.log('✅ CargoPulse database seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
