import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;
let isPrismaConnected = false;

try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
} catch (error) {
  console.warn('[CargoPulse] Prisma client initialization skipped or pending database.');
}

export const checkDatabaseConnection = async (): Promise<boolean> => {
  if (!prisma) return false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    isPrismaConnected = true;
    console.log('✅ [CargoPulse] Connected to PostgreSQL via Prisma successfully.');
    return true;
  } catch (err) {
    isPrismaConnected = false;
    console.warn('ℹ️ [CargoPulse] PostgreSQL not reachable at DATABASE_URL. Running in resilient in-memory mode.');
    return false;
  }
};

export { prisma, isPrismaConnected };
