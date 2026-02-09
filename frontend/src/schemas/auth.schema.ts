import { z } from 'zod';

export const signupSchema = z
  .object({
    username: z
      .string()
      .min(4, { message: 'Username must be at least 4 characters' })
      .max(30, { message: 'Username must be less than 30 characters' }),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(/[0-9]/, { message: 'Password must contain at least 1 number' })
      .regex(/[^a-zA-Z0-9]/, {
        message: 'Password must contain at least 1 special character',
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
