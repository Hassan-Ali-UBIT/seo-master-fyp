import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@components/layout/DashboardLayout';
import { clearTokens } from '@utils/tokenStorage';
import {
  getDashboardCounts,
  getSignupsGraph,
  getModuleUsage,
} from '@/services/api/dashboardService';
import type {
  DashboardCounts,
  SignupData,
  ModuleUsageData
} from '@/services/api/dashboardService';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [signups, setSignups] = useState<SignupData[]>([]);
  const [usage, setUsage] = useState<ModuleUsageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countsData, signupsData, usageData] = await Promise.all([
          getDashboardCounts(),
          getSignupsGraph(),
          getModuleUsage()
        ]);
        setCounts(countsData);
        setSignups(signupsData);
        setUsage(usageData);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    clearTokens();
    navigate('/');
  };

  if (loading) {
    return (
      <DashboardLayout onLogout={handleLogout}>
        <div className="flex items-center justify-center h-full">
          <div className="text-xl">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout onLogout={handleLogout}>
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Users" value={counts?.total_users || 0} color="bg-blue-50 text-blue-700" />
          <StatCard title="Active Modules" value={counts?.total_modules || 0} color="bg-green-50 text-green-700" />
          <StatCard title="Active Plans" value={counts?.total_plans || 0} color="bg-purple-50 text-purple-700" />
          <StatCard title="Total Revenue" value={`$${counts?.total_revenue || 0}`} color="bg-yellow-50 text-yellow-700" />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Signups Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">User Signups (Last 12 Months)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={signups}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Module Usage Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Module Usage Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usage} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="module" type="category" width={120} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="usage" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color }) => (
  <div className={`p-6 rounded-xl shadow-sm border border-gray-100 ${color}`}>
    <h3 className="text-sm font-medium opacity-80">{title}</h3>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

export default AdminDashboard;
