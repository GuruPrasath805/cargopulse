import { Router } from 'express';
import {
  getDashboardStats,
  getInventoryMovementTrend,
  getShipmentDistribution,
  getRecentActivities,
} from '../controllers/dashboardController';

const router = Router();

router.get('/stats', getDashboardStats);
router.get('/trend', getInventoryMovementTrend);
router.get('/shipment-distribution', getShipmentDistribution);
router.get('/activities', getRecentActivities);

export default router;
