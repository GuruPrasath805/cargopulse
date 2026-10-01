import express from 'express';
import cors from 'cors';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import productRoutes from './routes/productRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import warehouseRoutes from './routes/warehouseRoutes';
import supplierRoutes from './routes/supplierRoutes';
import purchaseOrderRoutes from './routes/purchaseOrderRoutes';
import shipmentRoutes from './routes/shipmentRoutes';
import fleetRoutes from './routes/fleetRoutes';
import deliveryRoutes from './routes/deliveryRoutes';
import returnsRoutes from './routes/returnsRoutes';
import intelligenceRoutes from './routes/intelligenceRoutes';
import aiRoutes from './routes/aiRoutes';
import traceabilityRoutes from './routes/traceabilityRoutes';
import notificationRoutes from './routes/notificationRoutes';

const app = express();

// Optional Gzip/deflate compression
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const compression = require('compression');
  app.use(compression());
} catch {
  // Compression is optional
}

// Permissive CORS configuration for Vercel + Render deployment
app.use(cors({
  origin: (origin, callback) => {
    // 1. Allow non-browser requests (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    const allowedOrigins = (config.clientUrl || '*')
      .split(',')
      .map(o => o.trim().replace(/\/+$/, ''));

    // 2. Allow wildcard or exact match
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // 3. Automatically allow all vercel.app domains (e.g. cargopulse-two.vercel.app, *.vercel.app)
    if (origin.endsWith('.vercel.app') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }

    // 4. Safe fallback: allow origin instead of throwing a 500 error
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));

// Explicit preflight handler so OPTIONS requests return 204 immediately
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));

// Health Check Endpoints
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'UP',
    platform: 'CargoPulse End-to-End Supply Chain Management Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Register Module Routes — with dual mounts (/api/auth and /auth) so requests never 404
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/admin', '/admin'], adminRoutes);
app.use(['/api/dashboard', '/dashboard'], dashboardRoutes);
app.use(['/api/products', '/products'], productRoutes);
app.use(['/api/inventory', '/inventory'], inventoryRoutes);
app.use(['/api/warehouses', '/warehouses'], warehouseRoutes);
app.use(['/api/suppliers', '/suppliers'], supplierRoutes);
app.use(['/api/purchase-orders', '/purchase-orders'], purchaseOrderRoutes);
app.use(['/api/shipments', '/shipments'], shipmentRoutes);
app.use(['/api/fleet', '/fleet'], fleetRoutes);
app.use(['/api/deliveries', '/deliveries'], deliveryRoutes);
app.use(['/api/returns', '/returns'], returnsRoutes);
app.use(['/api/intelligence', '/intelligence'], intelligenceRoutes);
app.use(['/api/ai', '/ai'], aiRoutes);
app.use(['/api/traceability', '/traceability'], traceabilityRoutes);
app.use(['/api/notifications', '/notifications'], notificationRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
