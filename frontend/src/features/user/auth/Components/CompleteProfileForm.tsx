import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select, Checkbox } from '@components/ui';
import { completeProfileSchema, type CompleteProfileFormData } from '../schemas/completeProfileSchema';

interface CompleteProfileFormProps {
  onSubmit: (data: CompleteProfileFormData) => Promise<void>;
  isLoading?: boolean;
}

const industryOptions = [
  { value: '', label: 'Select your industry' },
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'hospitality', label: 'Hospitality & Travel' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'non-profit', label: 'Non-profit' },
  { value: 'other', label: 'Other' },
];

const seoGoalOptions = [
  { value: '', label: 'Select your main goal' },
  { value: 'increase-traffic', label: 'Increase organic traffic' },
  { value: 'improve-rankings', label: 'Improve search rankings' },
  { value: 'local-seo', label: 'Improve local SEO visibility' },
  { value: 'brand-awareness', label: 'Build brand awareness' },
  { value: 'lead-generation', label: 'Generate more leads' },
  { value: 'sales-conversion', label: 'Increase sales conversions' },
  { value: 'competitor-analysis', label: 'Analyze competitors' },
  { value: 'other', label: 'Other' },
];

const experienceLevelOptions = [
  { value: '', label: 'Select your level' },
  { value: 'beginner', label: 'Beginner (0-1 years)' },
  { value: 'intermediate', label: 'Intermediate (1-3 years)' },
  { value: 'advanced', label: 'Advanced (3-5 years)' },
  { value: 'expert', label: 'Expert (5+ years)' },
];

const seoChallengesOptions = [
  { value: 'low-traffic', label: 'Low organic traffic' },
  { value: 'poor-rankings', label: 'Poor search rankings' },
  { value: 'technical-seo', label: 'Technical SEO issues' },
  { value: 'content-optimization', label: 'Content optimization' },
  { value: 'local-seo', label: 'Local SEO visibility' },
  { value: 'keyword-research', label: 'Keyword research' },
  { value: 'competitor-analysis', label: 'Competitor analysis' },
  { value: 'link-building', label: 'Link building' },
];

const CompleteProfileForm: React.FC<CompleteProfileFormProps> = ({
  onSubmit,
  isLoading = false
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch
  } = useForm<CompleteProfileFormData>({
    resolver: zodResolver(completeProfileSchema),
    mode: 'onChange',
  });

  const selectedChallenges = watch('seoChallenges') || [];

  return (
    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
      {/* Business Information Section */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
          <p className="text-sm text-gray-600 mt-1">Tell us about your business</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Name */}
          <div className="md:col-span-2">
            <Input
              label="Company/Website Name"
              {...register('companyName')}
              error={errors.companyName?.message}
              placeholder="Enter your company or website name"
              fullWidth
            />
          </div>

          {/* Industry */}
          <div>
            <Select
              label="Industry"
              {...register('industry')}
              error={errors.industry?.message}
              options={industryOptions}
              placeholder="Select your industry"
              fullWidth
            />
          </div>

          {/* Target Audience Location */}
          <div>
            <Input
              label="Target Audience Location"
              {...register('targetAudienceLocation')}
              error={errors.targetAudienceLocation?.message}
              placeholder="e.g., United States, Global, etc."
              fullWidth
            />
          </div>
        </div>
      </div>

      {/* SEO Goals Section */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">SEO Goals</h3>
          <p className="text-sm text-gray-600 mt-1">Help us understand your SEO objectives</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary SEO Goal */}
          <div>
            <Select
              label="Primary SEO Goal"
              {...register('primarySeoGoal')}
              error={errors.primarySeoGoal?.message}
              options={seoGoalOptions}
              placeholder="Select your main goal"
              fullWidth
            />
          </div>

          {/* Current SEO Experience */}
          <div>
            <Select
              label="Current SEO Experience Level"
              {...register('currentSeoExperience')}
              error={errors.currentSeoExperience?.message}
              options={experienceLevelOptions}
              placeholder="Select your level"
              fullWidth
            />
          </div>

          {/* Main Competitors */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Competitors (Optional)
            </label>
            <textarea
              {...register('mainCompetitors')}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm resize-none"
              placeholder="List your main competitors' websites..."
            />
          </div>
        </div>
      </div>

      {/* SEO Challenges Section */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            What SEO challenges are you facing?
          </h3>
          <p className="text-sm text-gray-600 mt-1">Select all that apply</p>
        </div>

        <Controller
          name="seoChallenges"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {seoChallengesOptions.map((option) => (
                <div
                  key={option.value}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <Checkbox
                    label={option.label}
                    checked={selectedChallenges.includes(option.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        field.onChange([...selectedChallenges, option.value]);
                      } else {
                        field.onChange(selectedChallenges.filter(challenge => challenge !== option.value));
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        />
        {errors.seoChallenges && (
          <p className="text-sm text-red-600">{errors.seoChallenges.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-6">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          className="bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isLoading ? 'Completing Setup...' : 'Complete Setup & Go to Dashboard'}
        </Button>
      </div>
    </form>
  );
};

export default CompleteProfileForm;



