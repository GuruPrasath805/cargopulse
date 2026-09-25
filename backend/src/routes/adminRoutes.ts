import { Router } from 'express';
import { authenticateJwt, requireRole } from '../middleware/auth';
import {
  getOverview,
  listUsers,
  listPendingUsers,
  approveUser,
  rejectUser,
  suspendUser,
  reactivateUser,
  updateUserRole,
  deleteUser,
  createUser,
  listAuditLogs,
  sendUserDirective,
} from '../controllers/adminController';

const router = Router();

router.use(authenticateJwt, requireRole(['ADMIN']));

router.get('/overview', getOverview);
router.get('/users', listUsers);
router.post('/users', createUser);
router.get('/users/pending', listPendingUsers);
router.post('/users/:id/approve', approveUser);
router.post('/users/:id/reject', rejectUser);
router.post('/users/:id/suspend', suspendUser);
router.post('/users/:id/reactivate', reactivateUser);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/audit-logs', listAuditLogs);
router.post('/users/:id/send-directive', sendUserDirective);

export default router;
