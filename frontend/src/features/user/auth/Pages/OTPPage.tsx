import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SimpleHeader, Footer } from '@components/layout';
import OTPForm from '../Components/OTPForm';
import { verifyOtp, resendSignUpOtp, sendForgotPasswordOtp } from '@/services/api/authService';
import { type OTPFormData } from '../schemas/otpSchema';

const OTPPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formResetRef = useRef<(() => void) | null>(null);
  const resendLockRef = useRef(false);

  // Get email from location state (passed from sign-up or forgot password)
  const email = location.state?.email || 'your email';
  const otpType = location.state?.type || 'sign_up'; // 'sign_up' or 'forget_password'

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
    setErrorMessage(null);

    try {
      const result = await verifyOtp({ email, otp: Number(data.otp) });

      if (otpType === 'forget_password') {
        // For forgot password flow, navigate to reset password page with token
        if (result.data.reset_token) {
          navigate('/reset-password', {
            state: {
              email,
              reset_token: result.data.reset_token
            }
          });
        } else {
          throw new Error('Reset token not received');
        }
      } else {
        // For sign up activation flow, redirect to sign-in
        alert(result.message || 'OTP verified successfully');
        navigate('/signin');
      }
    } catch (error) {
      const message = error?.message || 'Invalid OTP. Please try again.';
      setErrorMessage(message);
      console.error('OTP verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    // Prevent concurrent resend requests
    if (resendLockRef.current || isResending) {
      return;
    }

    resendLockRef.current = true;
    setIsResending(true);

    try {
      if (otpType === 'forget_password') {
        await sendForgotPasswordOtp(email);
      } else {
        await resendSignUpOtp(email);
      }
      setTimeLeft(300); // Reset timer
      setCanResend(false);
      alert('OTP has been resent to your email');
    } catch (error) {
      console.error('Resend OTP error:', error);
      alert('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
      resendLockRef.current = false;
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

          {/* Error Message */}
          {errorMessage && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          )}

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
