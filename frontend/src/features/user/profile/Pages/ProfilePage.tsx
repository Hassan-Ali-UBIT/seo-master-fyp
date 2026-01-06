import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@components/layout/DashboardLayout';
import { useAppSelector } from '@hooks/useAppSelector';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.userAuth);
  const { subscription } = useAppSelector((state) => state.payment);

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <DashboardLayout onLogout={handleLogout}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

        {/* User Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Name</span>
              <span className="font-medium text-gray-900">{user?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Email</span>
              <span className="font-medium text-gray-900">{user?.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">User ID</span>
              <span className="font-medium text-gray-900 text-sm">{user?.id || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Subscription Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Subscription</h2>
            <button
              onClick={() => navigate('/user/plans')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {subscription ? 'Change Plan' : 'Subscribe Now'}
            </button>
          </div>

          {subscription ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Plan</span>
                <span className="font-medium text-gray-900 capitalize">{subscription.plan}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    subscription.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : subscription.status === 'expired'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {subscription.status}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Expiry Date</span>
                <span className="font-medium text-gray-900">
                  {new Date(subscription.expiryDate).toLocaleDateString()}
                </span>
              </div>
              <div className="py-3">
                <span className="text-gray-600 block mb-2">Features</span>
                <ul className="list-disc list-inside space-y-1">
                  {subscription.features.map((feature, index) => (
                    <li key={index} className="text-gray-900">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
              <p className="text-gray-600 mb-4">
                Subscribe to a plan to unlock all features and start optimizing your LinkedIn
                profile.
              </p>
              <button
                onClick={() => navigate('/user/plans')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Plans
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
