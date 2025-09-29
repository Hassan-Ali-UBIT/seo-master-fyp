import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SimpleHeader, Footer } from '@components/layout';
import CompleteProfileForm from '../Components/CompleteProfileForm';
import { type CompleteProfileFormData } from '../schemas/completeProfileSchema';

const CompleteProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CompleteProfileFormData) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Profile completion data:', data);

      // TODO: Save profile data to backend
      // For now, simulate successful profile completion
      navigate('/user/dashboard');
    } catch (error) {
      console.error('Profile completion error:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <SimpleHeader
        onSignIn={() => {}}
        onGetStarted={() => {}}
        onLogoClick={handleLogoClick}
      />

      {/* Main Content */}
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-white shadow-lg mb-6">
              <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Complete Your Profile
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Help us personalize your SEO experience by telling us more about yourself and your goals.
            </p>
          </div>

          {/* Profile Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8">
              <CompleteProfileForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Step 2 of 3: Complete your profile
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CompleteProfilePage;



