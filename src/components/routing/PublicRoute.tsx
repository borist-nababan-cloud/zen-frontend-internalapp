import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingScreen } from './LoadingScreen';

interface PublicRouteProps {
  children?: React.ReactNode;
  redirectTo?: string;
}

/**
 * PublicRoute:
 * Wrapper for unauthenticated routes (e.g. /login).
 * If user is already authenticated, automatically redirects them to /dashboard.
 * Prevents false-redirects and accidental session drops during page reloads or back navigation.
 */
export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = '/dashboard',
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Memeriksa sesi login..." />;
  }

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PublicRoute;
