import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SimpleHeader, Footer } from '@components/layout';
import SignUpForm from '../Components/SignUpForm';
import { type SignUpFormData } from '../schemas/signUpSchema';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Sign up data:', data);
      // Navigate to OTP page with email
      navigate('/otp', { state: { email: data.email } });
    } catch (error) {
      console.error('Sign up error:', error);
      // TODO: Handle sign up error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    console.log('Navigate to sign in');
    // TODO: Navigate to sign in page
    navigate('/signin');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <SimpleHeader
        onSignIn={handleSignIn}
        onGetStarted={() => {}}
        onLogoClick={handleLogoClick}
      />

      {/* Main Content */}
      <main className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Join thousands of users optimizing their SEO
            </p>
          </div>

          {/* Sign Up Form */}
          <div className="mt-8">
            <SignUpForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              onSignInClick={handleSignIn}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SignUpPage;
