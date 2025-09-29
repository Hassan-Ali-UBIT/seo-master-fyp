import { z } from 'zod';

export const signInSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address'),

  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters'),

  rememberMe: z
    .boolean()
    .optional()
    .default(false),
});

export type SignInFormData = z.infer<typeof signInSchema>;
