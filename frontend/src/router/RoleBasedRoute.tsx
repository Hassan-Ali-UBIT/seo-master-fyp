import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@hooks/useAppSelector';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('user' | 'admin')[];
  fallbackPath?: string;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles,
  fallbackPath = '/'
}) => {
  const { userAuth, adminAuth } = useAppSelector((state) => state);

  // Check if user is authenticated
  const isAuthenticated = userAuth.isAuthenticated || adminAuth.isAuthenticated;

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Get current user role
  const currentRole = userAuth.user?.role || adminAuth.admin?.role;

  // Check if user has required role
  if (!currentRole || !allowedRoles.includes(currentRole as 'user' | 'admin')) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
