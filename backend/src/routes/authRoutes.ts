import { Router } from 'express';
import { login, register, getMe, getAllUsers } from '../controllers/authController';
import { authenticateJwt, requireRole } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticateJwt, getMe);
router.get('/users', authenticateJwt, requireRole(['ADMIN']), getAllUsers);

export default router;
