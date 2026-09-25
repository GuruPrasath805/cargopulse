import { Router } from 'express';
import { getTraceability } from '../controllers/traceabilityController';

const router = Router();

router.get('/:identifier', getTraceability);

export default router;
