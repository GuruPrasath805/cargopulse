import { Router } from 'express';
import {
  handleAiChat,
  getAiRiskSummary,
  getAiRiskShipments,
  getShipmentRiskById,
  getMlFeasibilityStatus,
} from '../controllers/aiController';

const router = Router();

router.post('/chat', handleAiChat);
router.get('/summary', getAiRiskSummary);
router.get('/risk/shipments', getAiRiskShipments);
router.get('/risk/shipments/:shipmentId', getShipmentRiskById);
router.get('/ml-status', getMlFeasibilityStatus);

export default router;
