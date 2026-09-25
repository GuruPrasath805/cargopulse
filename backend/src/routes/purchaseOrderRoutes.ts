import { Router } from 'express';
import {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePOStatus,
} from '../controllers/purchaseOrderController';
import { authenticateJwt, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', getPurchaseOrders);
router.get('/:id', getPurchaseOrderById);
router.post('/', authenticateJwt, requireRole(['ADMIN', 'WAREHOUSE_MANAGER']), createPurchaseOrder);
router.put('/:id/status', authenticateJwt, updatePOStatus);

export default router;
