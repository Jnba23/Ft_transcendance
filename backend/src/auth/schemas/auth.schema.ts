import { z } from 'zod';

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterReq:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *         - confirmPassword
 *       properties:
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         confirmPassword:
 *           type: string
 *     LoginReq:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *     ApiError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "error"
 *           description: "Status status (error/fail)"
 *         message:
 *           type: string
 *           example: "Error message details"
 *           description: "A descriptive error message"
 */

export const signupSchema = z.object({
  body: z
    .object({
      username: z
        .string()
        .min(4, 'Username must be at least 4 characters')
        .max(30),
      email: z.string().email('Invalid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});
