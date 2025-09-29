import React, { useState } from 'react';
import { OTPInput } from '@components/ui';

const OTPInputDemo: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleOTPChange = (value: string) => {
    setOtp(value);
    setError(''); // Clear error when user types
  };

  const handleOTPComplete = (value: string) => {
    console.log('OTP completed:', value);
    if (value === '123456') {
      setError('');
      alert('OTP verified successfully!');
    } else {
      setError('Invalid OTP. Try 123456');
    }
  };

  const handleSubmit = () => {
    if (otp.length !== 6) {
      setError('Please enter a complete 6-digit OTP');
      return;
    }

    if (otp === '123456') {
      setError('');
      alert('OTP verified successfully!');
    } else {
      setError('Invalid OTP. Try 123456');
    }
  };

  const handleClear = () => {
    setOtp('');
    setError('');
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
        OTP Input Demo
      </h3>

      <div className="space-y-6">
        <div>
          <OTPInput
            value={otp}
            onChange={handleOTPChange}
            onComplete={handleOTPComplete}
            error={error}
            length={6}
          />
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Try entering: <span className="font-mono font-semibold">123456</span>
          </p>
          <p className="text-xs text-gray-500">
            Or any other 6-digit code to see validation
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Verify OTP
          </button>
          <button
            onClick={handleClear}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Current OTP: <span className="font-mono font-semibold">{otp || 'Empty'}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPInputDemo;
