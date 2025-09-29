import React from 'react';
import SignInButton from './SignInButton';
import GetStartedButton from './GetStartedButton';

interface AuthButtonGroupProps {
  onSignIn?: () => void;
  onGetStarted?: () => void;
  signInLoading?: boolean;
  getStartedLoading?: boolean;
  signInText?: string;
  getStartedText?: string;
  className?: string;
}

const AuthButtonGroup: React.FC<AuthButtonGroupProps> = ({
  onSignIn,
  onGetStarted,
  signInLoading = false,
  getStartedLoading = false,
  signInText = 'Sign In',
  getStartedText = 'Get Started',
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <SignInButton
        onClick={onSignIn}
        loading={signInLoading}
        className="flex-shrink-0"
      >
        {signInText}
      </SignInButton>

      <GetStartedButton
        onClick={onGetStarted}
        loading={getStartedLoading}
        className="flex-shrink-0"
      >
        {getStartedText}
      </GetStartedButton>
    </div>
  );
};

export default AuthButtonGroup;
