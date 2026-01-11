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
 *           minLength: 4
 *           maxLength: 30
 *           description: Unique username for the account
 *           example: johndoe
 *         email:
 *           type: string
 *           format: email
 *           description: Valid email address
 *           example: john@example.com
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           description: Password (minimum 6 characters)
 *           example: securePass123
 *         confirmPassword:
 *           type: string
 *           format: password
 *           description: Must match the password field
 *           example: securePass123
 *     LoginReq:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Registered email address
 *           example: john@example.com
 *         password:
 *           type: string
 *           format: password
 *           description: Account password
 *           example: securePass123
 *     LoginRes:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         token:
 *           type: object
 *           properties:
 *             accessToken:
 *               type: string
 *               description: JWT access token (expires in 15 minutes)
 *             refreshToken:
 *               type: string
 *               description: JWT refresh token (expires in 3 days)
 *     Login2FARequiredRes:
 *       type: object
 *       description: Response when 2FA is enabled on the account
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: 2FA required
 *         action_required:
 *           type: string
 *           example: 2fa_auth
 *         tempToken:
 *           type: string
 *           description: Temporary token valid for 5 minutes. Use with /auth/2fa/authenticate
 *     RefreshTokenReq:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: Valid refresh token from login
 *     ApiError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [error, fail]
 *           description: Error status type
 *           example: error
 *         message:
 *           type: string
 *           description: Human-readable error message
 *           example: Invalid email or password
 *         stack:
 *           type: string
 *           description: Stack trace (only in development mode)
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
