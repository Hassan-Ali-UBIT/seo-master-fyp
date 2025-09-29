import React from 'react';
import { useAppSelector } from '@hooks/useAppSelector';
import { useAppDispatch } from '@hooks/useAppDispatch';
import { setLoading } from '@store/features/userAuthSlice';
import { Button, SignInButton, GetStartedButton, AuthButtonGroup } from '@components/ui';
import ButtonDemo from '@components/ui/ButtonDemo';
import OTPInputDemo from '@components/ui/OTPInputDemo';
import HeaderDemo from '@components/layout/HeaderDemo';
import { Link } from 'react-router-dom';

const DevDemo: React.FC = () => {
  const dispatch = useAppDispatch();
  const { userAuth, adminAuth } = useAppSelector((state) => state);

  const handleTestRedux = () => {
    dispatch(setLoading(true));
    setTimeout(() => {
      dispatch(setLoading(false));
    }, 2000);
  };

  const handleSignIn = () => {
    console.log('Sign In clicked');
  };

  const handleGetStarted = () => {
    console.log('Get Started clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-4">SEO Master Pro</h1>
          <p className="text-gray-600 text-lg">Frontend Application</p>

          {/* Navigation Links */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <Link to="/">
              <Button variant="primary">View Landing Page</Button>
            </Link>
            <Link to="/signin">
              <Button variant="secondary">View Sign In Page</Button>
            </Link>
            <Link to="/signup">
              <Button variant="secondary">View Sign Up Page</Button>
            </Link>
            <Link to="/forgot-password">
              <Button variant="secondary">View Forgot Password Page</Button>
            </Link>
            <Link to="/otp">
              <Button variant="secondary">View OTP Page</Button>
            </Link>
            <Link to="/dev">
              <Button variant="outline">Development Demo</Button>
            </Link>
          </div>
        </div>

        <div className="card mb-8">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-800">Redux Store Status</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">User Auth</p>
              <p className="text-lg font-semibold text-blue-800">
                {userAuth.loading ? 'Loading...' : 'Ready'}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Admin Auth</p>
              <p className="text-lg font-semibold text-purple-800">
                {adminAuth.loading ? 'Loading...' : 'Ready'}
              </p>
            </div>
          </div>
          <Button
            onClick={handleTestRedux}
            variant="primary"
            size="lg"
            fullWidth
            loading={userAuth.loading}
            className="mb-6"
          >
            Test Redux (Loading for 2s)
          </Button>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Button Components Demo</h3>
            <div className="space-y-4">
              <AuthButtonGroup
                onSignIn={handleSignIn}
                onGetStarted={handleGetStarted}
                className="justify-center"
              />

              <div className="flex flex-wrap gap-3 justify-center">
                <Button variant="primary" size="sm">Primary Small</Button>
                <Button variant="secondary" size="md">Secondary Medium</Button>
                <Button variant="outline" size="lg">Outline Large</Button>
                <Button variant="ghost" size="md">Ghost</Button>
                <Button variant="link" size="md">Link</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-800">Project Structure Created</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                <span>Vite + React + TypeScript</span>
              </div>
              <div className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                <span>Redux Toolkit configured</span>
              </div>
              <div className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                <span>Role-based folder structure</span>
              </div>
              <div className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                <span>User & Admin features separated</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                <span>LinkedIn Tool feature</span>
              </div>
              <div className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                <span>Payment feature</span>
              </div>
              <div className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                <span>SEO feature</span>
              </div>
              <div className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                <span>React Router DOM configured</span>
              </div>
            </div>
          </div>
        </div>

        {/* Button Components Demo */}
        <div className="mt-8">
          <ButtonDemo />
        </div>

        {/* OTP Input Demo */}
        <div className="mt-8">
          <OTPInputDemo />
        </div>

        {/* Header Components Demo */}
        <div className="mt-8">
          <HeaderDemo />
        </div>
      </div>
    </div>
  );
};

export default DevDemo;
