import React from 'react';
import { AuthButtonGroup } from '../ui';

interface HeaderProps {
  onSignIn?: () => void;
  onGetStarted?: () => void;
  signInLoading?: boolean;
  getStartedLoading?: boolean;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  onSignIn,
  onGetStarted,
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
            <h1 className="text-2xl font-bold text-gray-900">
              SEO Master Pro
            </h1>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Pricing
            </a>
            <a
              href="#about"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Contact
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center">
            <AuthButtonGroup
              onSignIn={onSignIn}
              onGetStarted={onGetStarted}
              signInLoading={signInLoading}
              getStartedLoading={getStartedLoading}
              className="hidden sm:flex"
            />

            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 py-4">
          <nav className="flex flex-col space-y-2">
            <a
              href="#features"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md transition-colors duration-200"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md transition-colors duration-200"
            >
              Pricing
            </a>
            <a
              href="#about"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md transition-colors duration-200"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md transition-colors duration-200"
            >
              Contact
            </a>
          </nav>

          {/* Mobile Auth Buttons */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <AuthButtonGroup
              onSignIn={onSignIn}
              onGetStarted={onGetStarted}
              signInLoading={signInLoading}
              getStartedLoading={getStartedLoading}
              className="flex-col space-y-2"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
