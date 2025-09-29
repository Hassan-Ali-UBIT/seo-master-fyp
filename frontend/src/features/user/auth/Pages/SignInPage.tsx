import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SimpleHeader, Footer } from '@components/layout';
import SignInForm from '../Components/SignInForm';
import { type SignInFormData } from '../schemas/signInSchema';

const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: SignInFormData) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Sign in data:', data);

      // TODO: Handle successful sign in
      // For now, simulate successful authentication
      navigate('/user/dashboard');
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <SimpleHeader
        onSignIn={() => {}}
        onGetStarted={handleSignUp}
        onLogoClick={handleLogoClick}
      />

      {/* Main Content */}
      <main className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 mb-4">
              <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              Sign in to your SEO Master Pro account
            </p>
          </div>

          {/* Sign In Form */}
          <div className="mt-8">
            <SignInForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              onForgotPassword={handleForgotPassword}
              onSignUpClick={handleSignUp}
            />
          </div>

          {/* Additional Help */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Having trouble signing in?{' '}
              <button
                type="button"
                onClick={handleForgotPassword}
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Get help
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SignInPage;
