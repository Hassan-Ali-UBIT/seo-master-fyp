import React from 'react';
import Button from './Button';

interface SignInButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  fullWidth?: boolean;
}

const SignInButton: React.FC<SignInButtonProps> = ({
  children = 'Sign In',
  loading = false,
  fullWidth = false,
  className,
  ...props
}) => {
  return (
    <Button
      variant="outline"
      size="md"
      loading={loading}
      fullWidth={fullWidth}
      className={`border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400 ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
};

export default SignInButton;
