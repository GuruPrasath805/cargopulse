import { Router } from 'express';
import {
  getRiskSummary,
  getStockoutPredictions,
  getShipmentDelays,
  getSupplierRisk,
  handleAssistantChat,
} from '../controllers/intelligenceController';

const router = Router();

router.get('/risk-summary', getRiskSummary);
router.get('/stockouts', getStockoutPredictions);
router.get('/shipment-delays', getShipmentDelays);
router.get('/suppliers', getSupplierRisk);
router.post('/chat', handleAssistantChat);
router.post('/assistant', handleAssistantChat);

export default router;
