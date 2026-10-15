import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CargoPulse India Supply Chain Database Seeding...');

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
      name: 'CargoPulse India Logistics & Telematics Corp',
      code: 'CP-INDIA',
      address: 'Tower A, Global Logistics Center, Guindy, Chennai, TN 600032',
      phone: '+91 44 4800 9000',
    },
  });

  // 2. Users with authentic Indian worker profiles
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@cargopulse.io',
      name: 'Rajesh Sharma',
      passwordHash,
      role: 'ADMIN',
      status: 'APPROVED',
      phone: '+91 98400 11223',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      aadharCardUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      experienceYears: 15,
      address: 'Tower A, Global Logistics Center, Guindy, Chennai, TN 600032',
      organizationId: org.id,
    },
  });

  const wmUser = await prisma.user.create({
    data: {
      email: 'warehouse@cargopulse.io',
      name: 'Karthik Subramanian',
      passwordHash,
      role: 'WAREHOUSE_MANAGER',
      status: 'APPROVED',
      phone: '+91 98401 55678',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      aadharCardUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      experienceYears: 11,
      address: 'Plot 42, SIPCOT Industrial Park, Sriperumbudur, Kanchipuram, TN 602105',
      approvedById: adminUser.id,
      approvedAt: new Date(),
      organizationId: org.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'logistics@cargopulse.io',
      name: 'Arunkumar Pillai',
      passwordHash,
      role: 'LOGISTICS_MANAGER',
      status: 'APPROVED',
      phone: '+91 98840 99881',
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
      aadharCardUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      experienceYears: 9,
      address: 'Fleet Control Hub 14, Peenya 3rd Phase, Bengaluru, KA 560058',
      approvedById: adminUser.id,
      approvedAt: new Date(),
      organizationId: org.id,
    },
  });

  // Pending user for admin review queue
  await prisma.user.create({
    data: {
      email: 'pradeep.rajan@cargopulse.io',
      name: 'Pradeep Rajan',
      passwordHash,
      role: 'WAREHOUSE_MANAGER',
      status: 'PENDING',
      phone: '+91 98412 87654',
      photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
      aadharCardUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      experienceYears: 6,
      address: 'Flat 3B, Sri Sai Enclave, Ambattur Industrial Estate, Chennai, TN 600058',
      organizationId: org.id,
    },
  });

  // 3. Categories
  const catAuto = await prisma.category.create({
    data: { name: 'Automotive & Commercial Powertrain', description: 'Heavy commercial transmissions, braking units, and forged axle assemblies' },
  });
  const catPharma = await prisma.category.create({
    data: { name: 'Pharmaceuticals & Active Ingredients', description: 'Temperature-controlled cold chain vaccines and injectables' },
  });

  // 4. Suppliers
  const supTata = await prisma.supplier.create({
    data: {
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
  });

  // 5. Products
  const prodGearbox = await prisma.product.create({
    data: {
      sku: 'TATA-GBX-6S',
      name: 'Tata Motors 6-Speed Heavy Commercial Synchro-Gearbox',
      description: 'G-1150 6-speed manual synchromesh transmission for heavy commercial trucks',
      categoryId: catAuto.id,
      unit: 'units',
      price: 145000,
      minStock: 15,
      maxStock: 120,
      weightKg: 185.0,
      dailyDemand: 4.5,
      supplierId: supTata.id,
    },
  });

  // 6. Warehouses
  const whChennai = await prisma.warehouse.create({
    data: {
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
      organizationId: org.id,
    },
  });

  const zoneA = await prisma.warehouseZone.create({
    data: { code: 'ZONE-A', name: 'Heavy Commercial Powertrain Staging', warehouseId: whChennai.id },
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
      productId: prodGearbox.id,
      warehouseId: whChennai.id,
      binId: bin01.id,
      quantity: 48,
      batchNumber: 'BT-2026-CHN-01',
    },
  });

  await prisma.inventoryTransaction.create({
    data: {
      transactionNo: 'TX-IND-2026-1001',
      productId: prodGearbox.id,
      warehouseId: whChennai.id,
      type: 'STOCK_IN',
      quantity: 40,
      previousStock: 8,
      newStock: 48,
      reason: 'Inbound receipt from Tata AutoComp Systems Ltd',
      userId: wmUser.id,
    },
  });

  console.log('✅ CargoPulse India database seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
