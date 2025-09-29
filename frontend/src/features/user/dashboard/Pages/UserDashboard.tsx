import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@components/layout/DashboardLayout';
import SEOToolsGrid from '@components/dashboard/SEOToolsGrid';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Implement logout logic (clear auth state, redirect, etc.)
    console.log('Logging out...');
    // For now, just redirect to home
    navigate('/');
  };

  return (
    <DashboardLayout onLogout={handleLogout}>
      <div className="max-w-7xl mx-auto">
        <SEOToolsGrid />
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;