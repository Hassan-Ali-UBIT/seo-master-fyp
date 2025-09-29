import { z } from 'zod';

export const completeProfileSchema = z.object({
  // Business Information
  companyName: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters'),

  industry: z
    .string()
    .min(1, 'Please select your industry'),

  targetAudienceLocation: z
    .string()
    .min(2, 'Please specify your target audience location')
    .max(100, 'Location must be less than 100 characters'),

  // SEO Goals
  primarySeoGoal: z
    .string()
    .min(1, 'Please select your primary SEO goal'),

  currentSeoExperience: z
    .string()
    .min(1, 'Please select your SEO experience level'),

  mainCompetitors: z
    .string()
    .optional(),

  // SEO Challenges
  seoChallenges: z
    .array(z.string())
    .min(1, 'Please select at least one SEO challenge'),
});

export type CompleteProfileFormData = z.infer<typeof completeProfileSchema>;



