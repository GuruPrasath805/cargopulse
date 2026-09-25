import { Router } from 'express';
import { getSuppliers, getSupplierById, createSupplier } from '../controllers/supplierController';
import { authenticateJwt, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', getSuppliers);
router.get('/:id', getSupplierById);
router.post('/', authenticateJwt, requireRole(['ADMIN']), createSupplier);

export default router;
