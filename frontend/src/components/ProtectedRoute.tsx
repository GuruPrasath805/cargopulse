import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { getPortalByRole } from '../config/portals';
import { MainLayout } from '../layouts/MainLayout';

interface ProtectedRouteProps {
  /** Roles allowed to view this route. Omit to allow any authenticated + approved user. ADMIN always passes. */
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <span className="text-xs font-semibold">Initializing CargoPulse Workspace...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && user.role !== 'ADMIN' && !allowedRoles.includes(user.role)) {
    // Signed in, but to the wrong portal for this page — send them home.
    return <Navigate to="/" replace />;
  }

  return <MainLayout />;
};

/** Guards the Admin Console specifically (no MainLayout wrapper — it has its own chrome). */
export const AdminOnlyRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to={getPortalByRole(user.role).dashboardPath} replace />;

  return <Outlet />;
};
