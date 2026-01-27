import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@components/layout/DashboardLayout';
import { useAppSelector } from '@hooks/useAppSelector';
import { getCurrentUser } from '@/services/api/authService';
import { getUserResources } from '@/services/api/userService';
import type { UserResources } from '@/services/api/userService';
import { clearTokens } from '@utils/tokenStorage';

interface UserProfile {
  id?: string;
  email?: string;
  full_name?: string;
  username?: string;
  contact?: string;
  hear_about_us?: string;
  referral_code?: string;
  [key: string]: unknown;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.userAuth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userResources, setUserResources] = useState<UserResources | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [profileResponse, resourcesResponse] = await Promise.all([
          getCurrentUser(),
          getUserResources().catch(err => {
            console.error("Failed to fetch user resources", err);
            return null;
          })
        ]);

        // Handle different response formats
        let {email, profile} = profileResponse?.data || profileResponse;

        setUserProfile({email, ...profile});
        setUserResources(resourcesResponse);

      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setError('Failed to load user profile');
        // Fallback to Redux state if API fails
        if (user) {
          setUserProfile(user);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);


  const handleLogout = () => {
    clearTokens();
    navigate('/');
  };

  const calculateDaysLeft = (endDate: string | null) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  return (
    <DashboardLayout onLogout={handleLogout}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 mt-4">Loading profile...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!isLoading && (
          <>
            {/* User Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Name</span>
                  <span className="font-medium text-gray-900">{userProfile?.full_name || user?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium text-gray-900">{userProfile?.email || user?.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Username</span>
                  <span className="font-medium text-gray-900">{userProfile?.username || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Contact</span>
                  <span className="font-medium text-gray-900">{userProfile?.contact || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">User ID</span>
                  <span className="font-medium text-gray-900 text-sm">{userProfile?.id || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Subscription Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
                <button
                  onClick={() => navigate('/user/plans')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All Plans
                </button>
              </div>

              {userResources ? (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Active Plan</p>
                      <h3 className="text-lg font-bold text-gray-900 capitalize">{userResources.plan_name || 'Standard Plan'}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Status</p>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium 'bg-green-100 text-green-800'`}
                      >
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Credits</p>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-2xl font-bold text-gray-900">{userResources.total_credits - userResources.credits_used}</span>
                        <span className="text-sm text-gray-500">/ {userResources.total_credits}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(userResources.credits_used / (userResources.total_credits || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">AI Words</p>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-2xl font-bold text-gray-900">{userResources.total_ai_words_limit - userResources.ai_words_used}</span>
                        <span className="text-sm text-gray-500">/ {userResources.total_ai_words_limit}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${(userResources.ai_words_used / (userResources.total_ai_words_limit || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Keywords</p>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-2xl font-bold text-gray-900">{userResources.total_keywords_limit - userResources.keywords_used}</span>
                        <span className="text-sm text-gray-500">/ {userResources.total_keywords_limit}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(userResources.keywords_used / (userResources.total_keywords_limit || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Subscription Details</p>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Start Date:</span>
                          <span className="font-medium">{userResources.subscription_start ? new Date(userResources.subscription_start).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Expiry Date:</span>
                          <span className="font-medium">{userResources.subscription_end ? new Date(userResources.subscription_end).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Days Left:</span>
                          <span className="font-medium text-blue-600">{calculateDaysLeft(userResources.subscription_end)} Days</span>
                        </div>
                      </div>
                    </div>
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
                    Subscribe to a plan to unlock all features.
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
