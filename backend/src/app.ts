import express from 'express';
import cors from 'cors';
import compression from 'compression';
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

// Gzip/deflate compression for all JSON API responses — cuts payload size
// (and transfer time) substantially for the larger list/dashboard endpoints.
app.use(compression());

// Honor CLIENT_URL from the environment instead of a hardcoded wildcard, so
// CORS actually matches the deployed Vercel origin. Supports a comma-separated
// list (e.g. production + preview URLs) and falls back to '*' only when
// CLIENT_URL is explicitly set to '*' (useful for quick local testing).
const allowedOrigins = config.clientUrl.split(',').map((o) => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    platform: 'CargoPulse End-to-End Supply Chain Management Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Register Module Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/returns', returnsRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/traceability', traceabilityRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
