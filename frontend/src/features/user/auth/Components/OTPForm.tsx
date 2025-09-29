import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, OTPInput } from '@components/ui';
import { otpSchema, type OTPFormData } from '../schemas/otpSchema';

interface OTPFormProps {
  onSubmit: (data: OTPFormData) => Promise<void>;
  onResendOTP: () => Promise<void>;
  isLoading?: boolean;
  isResending?: boolean;
  timeLeft?: number;
  canResend?: boolean;
  email?: string;
}

const OTPForm: React.FC<OTPFormProps> = ({
  onSubmit,
  onResendOTP,
  isLoading = false,
  isResending = false,
  timeLeft = 0,
  canResend = false,
  email = 'your email'
}) => {
  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    mode: 'onChange',
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOTPChange = (value: string) => {
    setValue('otp', value, { shouldValidate: true });
  };

  const handleOTPComplete = (value: string) => {
    // Auto-submit when OTP is complete
    if (value.length === 6) {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 mb-4">
          <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Verify Your Email
        </h2>
        <p className="text-gray-600">
          We've sent a 6-digit verification code to
        </p>
        <p className="text-primary-600 font-medium">
          {email}
        </p>
      </div>

      {/* OTP Form */}
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
            Enter your one-time password
          </label>
          <OTPInput
            value={watch('otp') || ''}
            onChange={handleOTPChange}
            onComplete={handleOTPComplete}
            error={errors.otp?.message}
            disabled={isLoading}
            length={6}
          />
          <p className="mt-4 text-sm text-gray-500 text-center">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {/* Timer */}
        <div className="text-center">
          {!canResend ? (
            <p className="text-sm text-gray-600">
              Resend code in <span className="font-semibold text-primary-600">{formatTime(timeLeft)}</span>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Didn't receive the code?
            </p>
          )}
        </div>

        {/* Verify Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3"
        >
          {isLoading ? 'Verifying...' : 'Verify Email'}
        </Button>

        {/* Resend Button */}
        {canResend && (
          <Button
            type="button"
            variant="outline"
            size="md"
            fullWidth
            onClick={onResendOTP}
            loading={isResending}
            className="border-primary-500 text-primary-500 hover:bg-primary-50"
          >
            {isResending ? 'Resending...' : 'Resend Code'}
          </Button>
        )}
      </form>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Check your spam folder if you don't see the email
        </p>
      </div>
    </div>
  );
};

export default OTPForm;
