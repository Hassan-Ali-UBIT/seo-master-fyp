import React from 'react';
import { AuthButtonGroup } from '../ui';

interface SimpleHeaderProps {
  onSignIn?: () => void;
  onGetStarted?: () => void;
  onLogoClick?: () => void;
  signInLoading?: boolean;
  getStartedLoading?: boolean;
  className?: string;
}

const SimpleHeader: React.FC<SimpleHeaderProps> = ({
  onSignIn,
  onGetStarted,
  onLogoClick,
  signInLoading = false,
  getStartedLoading = false,
  className = ''
}) => {
  return (
    <header className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <button
              onClick={onLogoClick}
              className="text-2xl font-bold text-gray-900 hover:text-primary-600 transition-colors duration-200 focus:outline-none rounded-md px-2 py-1"
              aria-label="Go to homepage"
            >
              SEO Master Pro
            </button>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center">
            <AuthButtonGroup
              onSignIn={onSignIn}
              onGetStarted={onGetStarted}
              signInLoading={signInLoading}
              getStartedLoading={getStartedLoading}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default SimpleHeader;
