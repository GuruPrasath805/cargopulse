import { Router } from 'express';
import {
  getShipments,
  getShipmentById,
  createShipment,
  addTrackingEvent,
} from '../controllers/shipmentController';
import { authenticateJwt, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', getShipments);
router.get('/:id', getShipmentById);
router.post('/', authenticateJwt, requireRole(['ADMIN', 'LOGISTICS_MANAGER']), createShipment);
router.post('/:id/events', authenticateJwt, addTrackingEvent);

export default router;
