import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@utils/helpers';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  error,
  disabled = false,
  className
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus the first empty input or the last filled input
    const firstEmptyIndex = value.length;
    const indexToFocus = firstEmptyIndex < length ? firstEmptyIndex : length - 1;
    inputRefs.current[indexToFocus]?.focus();
    setActiveIndex(indexToFocus);
  }, [value.length, length]);

  useEffect(() => {
    if (value.length === length && onComplete) {
      onComplete(value);
    }
  }, [value, length, onComplete]);

  const handleInputChange = (index: number, inputValue: string) => {
    // Only allow digits
    const numericValue = inputValue.replace(/\D/g, '');

    if (numericValue.length > 1) {
      // Handle paste or multiple character input
      const pastedDigits = numericValue.slice(0, length);
      onChange(pastedDigits);

      // Focus the next empty input or the last input
      const nextIndex = Math.min(pastedDigits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      setActiveIndex(nextIndex);
      return;
    }

    // Update the value
    const newValue = value.split('');
    newValue[index] = numericValue;
    const updatedValue = newValue.join('').slice(0, length);
    onChange(updatedValue);

    // Move to next input if current input is filled
    if (numericValue && index < length - 1) {
      const nextIndex = index + 1;
      inputRefs.current[nextIndex]?.focus();
      setActiveIndex(nextIndex);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        // If current input is empty, move to previous input
        const prevIndex = index - 1;
        inputRefs.current[prevIndex]?.focus();
        setActiveIndex(prevIndex);
      } else {
        // Clear current input
        const newValue = value.split('');
        newValue[index] = '';
        onChange(newValue.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  const handleFocus = (index: number) => {
    setActiveIndex(index);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pastedData.length > 0) {
      const truncatedData = pastedData.slice(0, length);
      onChange(truncatedData);

      // Focus the next empty input or the last input
      const nextIndex = Math.min(truncatedData.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      setActiveIndex(nextIndex);
    }
  };

  return (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      <div className="flex space-x-3">
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={() => handleFocus(index)}
            onPaste={handlePaste}
            disabled={disabled}
            className={cn(
              'w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
              error
                ? 'border-red-300 bg-red-50 text-red-900'
                : activeIndex === index
                ? 'border-primary-500 bg-primary-50'
                : value[index]
                ? 'border-green-300 bg-green-50 text-green-900'
                : 'border-gray-300 bg-white hover:border-gray-400',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          />
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  );
};

export default OTPInput;
