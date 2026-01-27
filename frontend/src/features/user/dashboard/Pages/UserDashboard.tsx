import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@components/layout/DashboardLayout';
import SEOToolsGrid from '@components/dashboard/SEOToolsGrid';

import { clearTokens } from '@utils/tokenStorage';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearTokens();
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