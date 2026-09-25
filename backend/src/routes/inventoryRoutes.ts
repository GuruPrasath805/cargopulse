import { Router } from 'express';
import {
  getInventoryList,
  getTransactions,
  stockIn,
  stockOut,
  transferStock,
} from '../controllers/inventoryController';
import { authenticateJwt, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', getInventoryList);
router.get('/transactions', getTransactions);
router.post('/stock-in', authenticateJwt, requireRole(['ADMIN', 'WAREHOUSE_MANAGER']), stockIn);
router.post('/stock-out', authenticateJwt, requireRole(['ADMIN', 'WAREHOUSE_MANAGER']), stockOut);
router.post('/transfer', authenticateJwt, requireRole(['ADMIN', 'WAREHOUSE_MANAGER']), transferStock);

export default router;
