import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '@features/user/landingPage/Pages/LandingPage';
import SignUpPage from '@features/user/auth/Pages/SignUpPage';
import SignInPage from '@features/user/auth/Pages/SignInPage';
import ForgotPasswordPage from '@features/user/auth/Pages/ForgotPasswordPage';
import CompleteProfilePage from '@features/user/auth/Pages/CompleteProfilePage';
import OTPPage from '@features/user/auth/Pages/OTPPage';
import UserDashboard from '@features/user/dashboard/Pages/UserDashboard';
import AdminDashboard from '@features/admin/dashboard/Pages/AdminDashboard';
import DevDemo from '@components/layout/DevDemo';
import ProtectedRoute from './ProtectedRoute';
import RoleBasedRoute from './RoleBasedRoute';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/complete-profile" element={<CompleteProfilePage />} />
        <Route path="/otp" element={<OTPPage />} />

        {/* Protected Routes */}
        <Route
          path="/user/dashboard"
          element={
            // <ProtectedRoute requiredRole="user">
              <UserDashboard />
            // </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Role-based Routes */}
        <Route
          path="/dashboard"
          element={
            <RoleBasedRoute allowedRoles={['user', 'admin']}>
              <UserDashboard />
            </RoleBasedRoute>
          }
        />

        {/* Development Route */}
        <Route path="/dev" element={<DevDemo />} />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
