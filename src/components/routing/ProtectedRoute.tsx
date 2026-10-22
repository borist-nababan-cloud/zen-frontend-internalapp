import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingScreen } from './LoadingScreen';
import { EmployeeLinkScreen } from '../auth/EmployeeLinkScreen';
import { PendingApprovalScreen } from '../auth/PendingApprovalScreen';
import { RejectedScreen } from '../auth/RejectedScreen';
import { DeactivatedScreen } from '../auth/DeactivatedScreen';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: number[]; // Optional role-level filtering (e.g. [8, 6] for admin)
  redirectOnUnauthorized?: string;
}

/**
 * ProtectedRoute:
 * Guards authenticated application routes.
 * 1. Shows LoadingScreen while checking session to prevent false-redirects.
 * 2. Redirects unauthenticated visitors to /login preserving the requested path in state.
 * 3. Enforces Zen employee code linking & approval workflow gates.
 * 4. Checks role authorization if allowedRoles is specified.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectOnUnauthorized = '/dashboard',
}) => {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  // 1. Initial or active loading state
  if (isLoading) {
    return <LoadingScreen message="Memverifikasi akses staf..." />;
  }

  // 2. Unauthenticated: safely redirect to /login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3. Approval Workflow Gates
  const isSuperuser = profile?.role_user === 8 || profile?.user_role === 8;

  // SUPERUSER (Role 8) bypasses employee linking and outlet approval
  if (!isSuperuser) {
    if (profile?.approval_status === 'UNLINKED') {
      return <EmployeeLinkScreen />;
    }

    if (profile?.approval_status === 'PENDING') {
      return <PendingApprovalScreen />;
    }

    if (profile?.approval_status === 'REJECTED') {
      return <RejectedScreen />;
    }
  }

  // 4. Deactivated account check
  if (profile?.approval_status === 'APPROVED' && !profile.is_active) {
    return <DeactivatedScreen />;
  }

  // 5. Role-based permission check (if specified)
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoleNum = profile?.user_role ?? profile?.role_user ?? 12;
    if (!allowedRoles.includes(userRoleNum)) {
      return <Navigate to={redirectOnUnauthorized} replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
