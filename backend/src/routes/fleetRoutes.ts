import { Router } from 'express';
import { getVehicles, getDrivers, getCarriers } from '../controllers/fleetController';

const router = Router();

router.get('/vehicles', getVehicles);
router.get('/drivers', getDrivers);
router.get('/carriers', getCarriers);

export default router;
