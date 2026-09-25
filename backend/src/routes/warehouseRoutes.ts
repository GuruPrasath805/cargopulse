import { Router } from 'express';
import { getWarehouses, getWarehouseById, createWarehouse } from '../controllers/warehouseController';
import { authenticateJwt, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', getWarehouses);
router.get('/:id', getWarehouseById);
router.post('/', authenticateJwt, requireRole(['ADMIN']), createWarehouse);

export default router;
