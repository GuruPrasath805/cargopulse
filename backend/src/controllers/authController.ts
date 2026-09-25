import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { fallbackDb } from '../db/fallbackDb';

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
});

/**
 * Portal-scoped login. `expectedRole` comes from the route (e.g. the Warehouse
 * portal login form) so a Supplier account can't be used to sign into the
 * Warehouse portal even with the correct password.
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, expectedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = fallbackDb.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // ADMIN accounts have root privileges and can log in to ANY portal for operational review
    if (expectedRole && user.role !== expectedRole && user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: `This account is not registered for the ${expectedRole.replace(/_/g, ' ')} portal.`,
      });
    }

    if (user.status === 'PENDING') {
      return res.status(403).json({ success: false, message: 'Your account is awaiting admin approval. You will be able to sign in once approved.', status: 'PENDING' });
    }
    if (user.status === 'REJECTED') {
      return res.status(403).json({ success: false, message: `Your registration was rejected${user.rejectedReason ? `: ${user.rejectedReason}` : '.'}`, status: 'REJECTED' });
    }
    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Contact an administrator.', status: 'SUSPENDED' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    fallbackDb.addAuditLog({ userId: user.id, userName: user.name, action: 'LOGIN', entity: 'User', entityId: user.id, details: `${user.name} signed in to the ${user.role} portal` });

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: publicUser(user),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Self-service registration for the Warehouse, Logistics, Supplier and
 * Customer portals. Every new account starts PENDING and cannot log in until
 * an Admin approves it. Admin accounts cannot be self-registered.
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, name, password, role, companyName, phone, photoUrl, aadharCardUrl, experienceYears, address } = req.body;

    if (!email || !name || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, password and role are required.' });
    }
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }
    if (role === 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin accounts cannot be self-registered. Ask an existing admin to create one.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    const existing = fallbackDb.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = fallbackDb.createPendingUser({ email, name, passwordHash, role, companyName, phone, photoUrl, aadharCardUrl, experienceYears, address });

    return res.status(201).json({
      success: true,
      message: 'Registration submitted. An administrator will review your account before you can sign in.',
      user: publicUser(newUser),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMe = async (req: any, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const user = fallbackDb.users.find(u => u.id === req.user.id);
  return res.json({
    success: true,
    user: user ? publicUser(user) : req.user,
  });
};

export const getAllUsers = async (req: Request, res: Response) => {
  const users = fallbackDb.users.map(publicUser);
  return res.json({ success: true, count: users.length, users });
};
