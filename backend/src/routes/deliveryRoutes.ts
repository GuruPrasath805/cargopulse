import { Router } from 'express';
import { getDeliveries, completeDelivery } from '../controllers/deliveryController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.get('/', getDeliveries);
router.post('/:id/complete', authenticateJwt, completeDelivery);

export default router;
