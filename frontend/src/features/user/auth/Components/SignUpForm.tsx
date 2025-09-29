import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Button, Input, Select } from '@components/ui';
import { signUpSchema, type SignUpFormData } from '../schemas/signUpSchema';

interface SignUpFormProps {
  onSubmit: (data: SignUpFormData) => Promise<void>;
  isLoading?: boolean;
  onSignInClick?: () => void;
}

const hearAboutUsOptions = [
  { value: 'google', label: 'Google Search' },
  { value: 'social', label: 'Social Media' },
  { value: 'friend', label: 'Friend/Colleague' },
  { value: 'advertisement', label: 'Advertisement' },
  { value: 'other', label: 'Other' },
];

const SignUpForm: React.FC<SignUpFormProps> = ({
  onSubmit,
  isLoading = false,
  onSignInClick
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
  });

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        {/* Username */}
        <Input
          label="Username"
          {...register('username')}
          error={errors.username?.message}
          placeholder="Enter your username"
          fullWidth
        />

        {/* Full Name */}
        <Input
          label="Full Name"
          {...register('fullName')}
          error={errors.fullName?.message}
          placeholder="Enter your full name"
          fullWidth
        />

        {/* Email */}
        <Input
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          placeholder="Enter your email"
          rightIcon={
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          }
          fullWidth
        />

        {/* Contact (Optional) */}
        <Input
          label="Contact (Optional)"
          type="tel"
          {...register('contact')}
          error={errors.contact?.message}
          placeholder="Enter your contact number"
          fullWidth
        />

        {/* Password */}
        <Input
          label="Password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
          placeholder="Enter your password"
          fullWidth
        />

        {/* Confirm Password */}
        <Input
          label="Confirm Password"
          type="password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          placeholder="Confirm your password"
          fullWidth
        />

        {/* How did you hear about us? */}
        <Select
          label="How did you hear about us?"
          {...register('hearAboutUs')}
          error={errors.hearAboutUs?.message}
          options={hearAboutUsOptions}
          placeholder="Select an option"
          fullWidth
        />

        {/* Referral Code (Optional) */}
        <Input
          label="Referral Code (Optional)"
          {...register('referralCode')}
          error={errors.referralCode?.message}
          placeholder="Enter referral code if any"
          fullWidth
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={isLoading}
        className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3"
      >
        {isLoading ? 'Creating Account...' : 'Sign Up'}
      </Button>

      {/* Sign In Link */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/signin"
            className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    </form>
  );
};

export default SignUpForm;
