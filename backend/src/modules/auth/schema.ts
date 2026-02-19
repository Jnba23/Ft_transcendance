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
 *           minLength: 8
 *           description: Password (minimum 8 characters)
 *           example: securePass123
 *         confirmPassword:
 *           type: string
 *           format: password
 *           description: Must match the password field
 *           example: securePass123
 *     LoginReq:
 *       type: object
 *       required:
 *         - identifier
 *         - password
 *       properties:
 *         identifier:
 *           type: string
 *           description: Registered email address or username
 *           example: john@example.com or johndoe
 *         password:
 *           type: string
 *           format: password
 *           description: Account password
 *           example: securePass123
 *     LoginRes:
 *       type: object
 *       description: Success response with tokens set in HTTP-only cookies
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Logged in successfully
 *       headers:
 *         Set-Cookie:
 *           description: HTTP-only cookies containing accessToken and refreshToken
 *           schema:
 *             type: string
 *             example: accessToken=eyJhbG...; HttpOnly; Secure; SameSite=Strict
 *     SignupRes:
 *       type: object
 *       description: Success response with account created and tokens in cookies
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Account created successfully
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *       headers:
 *         Set-Cookie:
 *           description: HTTP-only cookies containing accessToken and refreshToken
 *           schema:
 *             type: string
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
 *     RefreshTokenRes:
 *       type: object
 *       description: Token refreshed and new accessToken set in cookie
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Token refreshed
 *       headers:
 *         Set-Cookie:
 *           description: HTTP-only cookie with new accessToken
 *           schema:
 *             type: string
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
