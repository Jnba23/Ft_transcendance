import { z } from 'zod';

export const signupSchema = z.object({
  body: z
    .object({
      username: z
        .string()
        .min(4, 'Username must be at least 4 characters')
        .max(20, 'Username must be at most 20 characters')
        .regex(
          /^[a-zA-Z0-9_-]+$/,
          'Username can only contain letters, numbers, underscores and hyphens'
        ),
      email: z.string().email('Invalid email address'),
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[0-9]/, 'Password must contain at least 1 number')
        .regex(
          /[^a-zA-Z0-9]/,
          'Password must contain at least 1 special character'
        ),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }),
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(1, 'Email or Username is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// No body validation needed - tokens come from cookies
export const refreshSchema = z.object({});

// No body validation needed - tokens come from cookies
export const logoutSchema = z.object({});
