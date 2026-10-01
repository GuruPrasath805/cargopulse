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

  // 2. Initial Root Administrator (only required platform admin)
  const passwordHash = await bcrypt.hash('password123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@cargopulse.io',
      name: 'Alexander Cross',
      passwordHash,
      role: 'ADMIN',
      status: 'APPROVED',
      organizationId: org.id,
    },
  });

  console.log('✅ CargoPulse database seeded cleanly with Administrator!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
