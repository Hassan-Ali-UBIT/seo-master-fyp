import React from 'react';
import { AuthButtonGroup } from '../ui';
import logoSvg from '@assets/images/logo.svg';

interface SimpleHeaderProps {
  onSignIn?: () => void;
  onGetStarted?: () => void;
  onLogoClick?: () => void;
  onDashboardClick?: () => void;
  isAuthenticated?: boolean;
  signInLoading?: boolean;
  getStartedLoading?: boolean;
  className?: string;
}

const SimpleHeader: React.FC<SimpleHeaderProps> = ({
  onSignIn,
  onGetStarted,
  onLogoClick,
  onDashboardClick,
  isAuthenticated = false,
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
              className="flex items-center gap-3 text-2xl font-bold text-gray-900 hover:text-primary-600 transition-colors duration-200 focus:outline-none rounded-md px-2 py-1"
              aria-label="Go to homepage"
            >
              {/* Logo Image */}
              <img
                src={logoSvg}
                alt="SEO Master Pro Logo"
                className="w-10 h-10 sm:w-12 sm:h-12"
              />
              {/* Brand Name */}
              <span className="hidden sm:block">SEO Master Pro</span>
            </button>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <button
                onClick={onDashboardClick}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Dashboard
              </button>
            ) : (
              <AuthButtonGroup
                onSignIn={onSignIn}
                onGetStarted={onGetStarted}
                signInLoading={signInLoading}
                getStartedLoading={getStartedLoading}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default SimpleHeader;
