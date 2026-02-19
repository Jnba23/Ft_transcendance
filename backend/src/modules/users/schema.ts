import { z } from 'zod';

export const updateUserSchema = z.object({
  body: z.object({
    username: z
      .string()
      .min(4, 'Username must be at least 4 characters')
      .optional(),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['online', 'offline', 'in_game'], {
      required_error: 'Status is required',
    }),
  }),
});
