import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getHasPaid, getUserRole } from '../utils/tokenStorage';
// import { toast } from 'react-hot-toast'; // Assuming you have this or similar

// If you don't have a toast library installed and configured globally,
// you can replace this with a simple alert or preferably a better UI notification.
// For now, I'll use a simple approach or assume a Toaster exists in App.tsx.

interface PaymentProtectedRouteProps {
    children?: React.ReactNode;
}

const PaymentProtectedRoute: React.FC<PaymentProtectedRouteProps> = ({ children }) => {
    const hasPaid = getHasPaid();
    const role = getUserRole();

    // Admin/Superadmin bypass payment check
    if (role === 'admin' || role === 'superadmin') {
        return children ? <>{children}</> : <Outlet />;
    }

    if (!hasPaid) {
        // Ideally, dispatch a toast here.
        // Since this is a render method, side-effects like toast should be in useEffect
        // BUT Navigate will unmount this immediately.
        // So we can pass state to the redirect location.
        return <Navigate to="/user/plans" state={{ message: "Please upgrade your plan to access this feature." }} replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};

export default PaymentProtectedRoute;
