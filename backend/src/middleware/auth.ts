import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { fallbackDb } from '../db/fallbackDb';

export type RoleName = 'ADMIN' | 'WAREHOUSE_MANAGER' | 'LOGISTICS_MANAGER' | 'SUPPLIER' | 'CUSTOMER';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: RoleName;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const authenticateJwt = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. Missing Bearer token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthUser;

    // Live revocation check: even a valid, unexpired token is rejected if the
    // account has since been suspended, rejected, or removed by an admin.
    const liveUser = fallbackDb.users.find(u => u.id === decoded.id);
    if (!liveUser) {
      return res.status(401).json({ success: false, message: 'Account no longer exists.' });
    }
    if (liveUser.status !== 'APPROVED') {
      return res.status(403).json({ success: false, message: `Account is ${liveUser.status.toLowerCase()}. Access revoked.`, status: liveUser.status });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

export const requireRole = (roles: RoleName[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (req.user.role === 'ADMIN' || roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Requires one of roles: [${roles.join(', ')}]. Current role: ${req.user.role}`,
    });
  };
};
