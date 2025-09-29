import React from 'react';
import { cn } from '@utils/helpers';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  className,
  id,
  ...props
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cn('flex items-start space-x-3', className)}>
      <div className="flex items-center h-5">
        <input
          id={checkboxId}
          type="checkbox"
          className={cn(
            'h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors',
            error && 'border-red-300 text-red-600 focus:ring-red-500'
          )}
          {...props}
        />
      </div>
      {label && (
        <div className="flex-1">
          <label
            htmlFor={checkboxId}
            className={cn(
              'text-sm font-medium cursor-pointer transition-colors',
              error ? 'text-red-700' : 'text-gray-700 hover:text-gray-900',
              props.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {label}
          </label>
        </div>
      )}
    </div>
  );
};

export default Checkbox;



