import { Router } from 'express';
import { getProducts, getProductById, createProduct, getCategories } from '../controllers/productController';
import { authenticateJwt, requireRole } from '../middleware/auth';

const router = Router();

router.get('/categories', getCategories);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authenticateJwt, requireRole(['ADMIN', 'WAREHOUSE_MANAGER']), createProduct);

export default router;
