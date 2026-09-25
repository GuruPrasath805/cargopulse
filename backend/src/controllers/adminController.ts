import { sendApprovalEmail, sendDirectiveEmail } from '../services/emailService';
import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { fallbackDb } from '../db/fallbackDb';
import { AuthenticatedRequest } from '../middleware/auth';


const getPortalMeta = (role: string) => {
  switch (role) {
    case 'WAREHOUSE_MANAGER':
      return { title: 'Warehouse Operations Portal', url: 'http://localhost:5173/warehouse/login' };
    case 'LOGISTICS_MANAGER':
      return { title: 'Logistics & Fleet Portal', url: 'http://localhost:5173/logistics/login' };
    case 'SUPPLIER':
      return { title: 'Supplier Network Portal', url: 'http://localhost:5173/supplier/login' };
    case 'CUSTOMER':
      return { title: 'Customer & Consignee Portal', url: 'http://localhost:5173/customer/login' };
    default:
      return { title: 'CargoPulse Portal', url: 'http://localhost:5173/warehouse/login' };
  }
};

const ALLOWED_ROLES = ['ADMIN', 'WAREHOUSE_MANAGER', 'LOGISTICS_MANAGER', 'SUPPLIER', 'CUSTOMER'];

const publicUser = (u: any) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  role: u.role,
  status: u.status,
  companyName: u.companyName,
  phone: u.phone,
  photoUrl: u.photoUrl,
  aadharCardUrl: u.aadharCardUrl,
  experienceYears: u.experienceYears,
  address: u.address,
  approvedByName: u.approvedByName,
  approvedAt: u.approvedAt,
  rejectedReason: u.rejectedReason,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

const currentActor = (req: AuthenticatedRequest) => fallbackDb.users.find(u => u.id === req.user!.id)!;

export const getOverview = async (req: AuthenticatedRequest, res: Response) => {
  const users = fallbackDb.users;
  const byStatus = {
    pending: users.filter(u => u.status === 'PENDING').length,
    approved: users.filter(u => u.status === 'APPROVED').length,
    rejected: users.filter(u => u.status === 'REJECTED').length,
    suspended: users.filter(u => u.status === 'SUSPENDED').length,
  };
  const byRole: Record<string, number> = {};
  for (const u of users) byRole[u.role] = (byRole[u.role] || 0) + 1;

  return res.json({
    success: true,
    stats: {
      totalUsers: users.length,
      ...byStatus,
      byRole,
      totalAuditEvents: fallbackDb.auditLogs.length,
      recentAuditEvents: fallbackDb.auditLogs.slice(0, 5),
    },
  });
};

export const listUsers = async (req: AuthenticatedRequest, res: Response) => {
  const { status, role } = req.query;
  let users = fallbackDb.users;
  if (status) users = users.filter(u => u.status === status);
  if (role) users = users.filter(u => u.role === role);
  return res.json({ success: true, count: users.length, users: users.map(publicUser) });
};

export const listPendingUsers = async (req: AuthenticatedRequest, res: Response) => {
  const pending = fallbackDb.users.filter(u => u.status === 'PENDING');
  return res.json({ success: true, count: pending.length, users: pending.map(publicUser) });
};

export const approveUser = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updated = fallbackDb.approveUser(id, currentActor(req));
  if (!updated) return res.status(404).json({ success: false, message: 'User not found.' });

  // Send email notification to user's registered email
  try {
    const meta = getPortalMeta(updated.role);
    await sendApprovalEmail({
      to: updated.email,
      name: updated.name,
      role: updated.role,
      portalTitle: meta.title,
      loginUrl: meta.url,
    });
  } catch (err) {
    console.error('Failed to trigger approval email:', err);
  }

  return res.json({ success: true, message: `${updated.name} approved and confirmation email dispatched.`, user: publicUser(updated) });
};

export const rejectUser = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const updated = fallbackDb.rejectUser(id, currentActor(req), reason);
  if (!updated) return res.status(404).json({ success: false, message: 'User not found.' });
  return res.json({ success: true, message: `${updated.name} rejected.`, user: publicUser(updated) });
};

export const suspendUser = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  if (id === req.user!.id) return res.status(400).json({ success: false, message: "You can't suspend your own account." });
  const updated = fallbackDb.setUserStatus(id, 'SUSPENDED', currentActor(req));
  if (!updated) return res.status(404).json({ success: false, message: 'User not found.' });
  return res.json({ success: true, message: `${updated.name} suspended.`, user: publicUser(updated) });
};

export const reactivateUser = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updated = fallbackDb.setUserStatus(id, 'APPROVED', currentActor(req));
  if (!updated) return res.status(404).json({ success: false, message: 'User not found.' });
  return res.json({ success: true, message: `${updated.name} reactivated.`, user: publicUser(updated) });
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!ALLOWED_ROLES.includes(role)) return res.status(400).json({ success: false, message: 'Invalid role.' });
  const updated = fallbackDb.updateUserRole(id, role, currentActor(req));
  if (!updated) return res.status(404).json({ success: false, message: 'User not found.' });
  return res.json({ success: true, message: `${updated.name} role updated to ${role}.`, user: publicUser(updated) });
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  if (id === req.user!.id) return res.status(400).json({ success: false, message: "You can't delete your own account." });
  const ok = fallbackDb.deleteUser(id, currentActor(req));
  if (!ok) return res.status(404).json({ success: false, message: 'User not found.' });
  return res.json({ success: true, message: 'User deleted.' });
};

/** Admin-only direct creation of an account (pre-approved), including other Admins. */
export const createUser = async (req: AuthenticatedRequest, res: Response) => {
  const { email, name, password, role, companyName, phone } = req.body;
  if (!email || !name || !password || !role) {
    return res.status(400).json({ success: false, message: 'Name, email, password and role are required.' });
  }
  if (!ALLOWED_ROLES.includes(role)) return res.status(400).json({ success: false, message: 'Invalid role.' });
  if (fallbackDb.findUserByEmail(email)) return res.status(400).json({ success: false, message: 'An account with this email already exists.' });

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = fallbackDb.createPendingUser({ email, name, passwordHash, role, companyName, phone });
  const actor = currentActor(req);
  fallbackDb.approveUser(newUser.id, actor);
  return res.status(201).json({ success: true, message: `${newUser.name} created and approved.`, user: publicUser(newUser) });
};

export const listAuditLogs = async (req: AuthenticatedRequest, res: Response) => {
  const limit = Math.min(parseInt(String(req.query.limit || '100'), 10) || 100, 500);
  return res.json({ success: true, count: fallbackDb.auditLogs.length, logs: fallbackDb.auditLogs.slice(0, limit) });
};


export const sendUserDirective = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { subject, directiveType, priority, message, actionUrl, actionText } = req.body;

  const target = fallbackDb.users.find(u => u.id === id);
  if (!target) return res.status(404).json({ success: false, message: 'User not found.' });

  if (!subject || !message) {
    return res.status(400).json({ success: false, message: 'Subject and message are required.' });
  }

  try {
    const meta = getPortalMeta(target.role);
    await sendDirectiveEmail({
      to: target.email,
      name: target.name,
      role: target.role,
      subject,
      directiveType: directiveType || 'GENERAL_DIRECTIVE',
      priority: priority || 'NORMAL',
      message,
      actionUrl: actionUrl || meta.url,
      actionText: actionText || `Open ${meta.title}`,
    });

    const actor = currentActor(req);
    fallbackDb.auditLogs.unshift({
      id: 'aud-' + Date.now(),
      userId: actor?.id || 'admin',
      userName: actor?.name || 'Administrator',
      action: 'OPERATIONAL_DIRECTIVE_SENT',
      entity: 'USER',
      entityId: target.id,
      details: `Sent operational directive "${subject}" to ${target.name} (${target.role})`,
      createdAt: new Date().toISOString(),
    });

    return res.json({
      success: true,
      message: `Directive email successfully dispatched to ${target.name} (${target.email}).`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to dispatch email.' });
  }
};
