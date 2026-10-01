import { Router } from 'express';
import { login, register, getMe, getAllUsers, forgotPassword, resetPassword } from '../controllers/authController';
import { authenticateJwt, requireRole } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authenticateJwt, getMe);
router.get('/users', authenticateJwt, requireRole(['ADMIN']), getAllUsers);

export default router;
