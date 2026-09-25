import { Router } from 'express';
import { getReturns, createReturn, processInspectionDecision } from '../controllers/returnsController';
import { authenticateJwt, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', getReturns);
router.post('/', createReturn);
router.put('/:id/decision', authenticateJwt, requireRole(['ADMIN', 'WAREHOUSE_MANAGER']), processInspectionDecision);

export default router;
