import { z } from 'zod';

export const twoFaSchema = z.object({
  body: z.object({
    code: z.string().length(6, 'Code must be exactly 6 digits'),
  }),
});

export const verify2FaSchema = z.object({
  body: z.object({
    code: z.string().length(6, 'Code must be exactly 6 digits'),
    tempToken: z.string().min(1, 'Temporary token is required'),
  }),
});

export const turnOff2FaSchema = z.object({
  body: z.object({
    password: z.string().min(1, 'Password is required to disable 2FA'),
  }),
});
