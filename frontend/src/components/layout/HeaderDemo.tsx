import React, { useState } from 'react';
import { Header, SimpleHeader } from './index';

const HeaderDemo: React.FC = () => {
  const [signInLoading, setSignInLoading] = useState(false);
  const [getStartedLoading, setGetStartedLoading] = useState(false);

  const handleSignIn = () => {
    setSignInLoading(true);
    setTimeout(() => setSignInLoading(false), 2000);
  };

  const handleGetStarted = () => {
    setGetStartedLoading(true);
    setTimeout(() => setGetStartedLoading(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Simple Header - Matching your design */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Simple Header</h3>
          <p className="text-gray-600">Clean header matching your design</p>
        </div>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <SimpleHeader
            onSignIn={handleSignIn}
            onGetStarted={handleGetStarted}
            signInLoading={signInLoading}
            getStartedLoading={getStartedLoading}
          />
          <div className="p-4 bg-gray-50">
            <p className="text-sm text-gray-600">Header content area</p>
          </div>
        </div>
      </div>

      {/* Full Header with Navigation */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Full Header with Navigation</h3>
          <p className="text-gray-600">Complete header with navigation menu</p>
        </div>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <Header
            onSignIn={handleSignIn}
            onGetStarted={handleGetStarted}
            signInLoading={signInLoading}
            getStartedLoading={getStartedLoading}
          />
          <div className="p-4 bg-gray-50">
            <p className="text-sm text-gray-600">Header content area</p>
          </div>
        </div>
      </div>

      {/* Header Features */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Header Features</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center text-green-600">
              <span className="mr-2">✅</span>
              <span>Responsive design</span>
            </div>
            <div className="flex items-center text-green-600">
              <span className="mr-2">✅</span>
              <span>Mobile navigation</span>
            </div>
            <div className="flex items-center text-green-600">
              <span className="mr-2">✅</span>
              <span>Loading states</span>
            </div>
            <div className="flex items-center text-green-600">
              <span className="mr-2">✅</span>
              <span>Clean typography</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-green-600">
              <span className="mr-2">✅</span>
              <span>Brand consistency</span>
            </div>
            <div className="flex items-center text-green-600">
              <span className="mr-2">✅</span>
              <span>Accessibility</span>
            </div>
            <div className="flex items-center text-green-600">
              <span className="mr-2">✅</span>
              <span>TypeScript support</span>
            </div>
            <div className="flex items-center text-green-600">
              <span className="mr-2">✅</span>
              <span>Customizable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderDemo;
