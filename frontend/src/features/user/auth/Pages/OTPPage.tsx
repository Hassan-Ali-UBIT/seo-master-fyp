import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SimpleHeader, Footer } from '@components/layout';
import OTPForm from '../Components/OTPForm';
import { type OTPFormData } from '../schemas/otpSchema';

const OTPPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  // Get email from location state (passed from sign-up)
  const email = location.state?.email || 'your email';

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVerifyOTP = async (data: OTPFormData) => {
    setIsLoading(true);

        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.log('OTP verified:', data.otp);
          // TODO: Handle successful OTP verification
          // Redirect to complete profile page for first-time users
          navigate('/complete-profile');
    } catch (error) {
      console.error('OTP verification error:', error);
      alert('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('OTP resent to:', email);
      setTimeLeft(300); // Reset timer
      setCanResend(false);
      alert('OTP has been resent to your email');
    } catch (error) {
      console.error('Resend OTP error:', error);
      alert('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleSignIn = () => {
    navigate('/signin');
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
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          {/* OTP Form Component */}
          <OTPForm
            onSubmit={handleVerifyOTP}
            onResendOTP={handleResendOTP}
            isLoading={isLoading}
            isResending={isResending}
            timeLeft={timeLeft}
            canResend={canResend}
            email={email}
          />

          {/* Additional Help Text */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Wrong email?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Go back to sign up
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

export default OTPPage;
