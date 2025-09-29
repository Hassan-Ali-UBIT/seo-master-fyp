import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@hooks/useAppSelector';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole
}) => {
  const location = useLocation();
  const { userAuth, adminAuth } = useAppSelector((state) => state);

  // Check if user is authenticated
  const isAuthenticated = userAuth.isAuthenticated || adminAuth.isAuthenticated;

  if (!isAuthenticated) {
    // Redirect to sign in page with return url
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Check role-based access if required
  if (requiredRole) {
    const userRole = userAuth.user?.role || adminAuth.admin?.role;

    if (userRole !== requiredRole) {
      // Redirect to unauthorized page or dashboard based on role
      const redirectPath = userRole === 'admin' ? '/admin/dashboard' : '/user/dashboard';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
