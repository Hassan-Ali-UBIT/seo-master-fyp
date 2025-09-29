import React from 'react';
import Button from './Button';

interface GetStartedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  fullWidth?: boolean;
}

const GetStartedButton: React.FC<GetStartedButtonProps> = ({
  children = 'Get Started',
  loading = false,
  fullWidth = false,
  className,
  ...props
}) => {
  return (
    <Button
      variant="primary"
      size="md"
      loading={loading}
      fullWidth={fullWidth}
      className={`bg-primary-600 hover:bg-primary-700 text-white shadow-sm ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
};

export default GetStartedButton;
