import { Router } from 'express';
import { validateResource } from '../../middleware/validateResource.js';
import {
  loginHandler,
  signupHandler,
  refreshAccessTokenHandler,
  logoutHandler,
} from '../controllers/auth.controller.js';
import {
  loginSchema,
  signupSchema,
  refreshSchema,
  logoutSchema,
} from '../schemas/auth.schema.js';

const router = Router();

// Register
/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     description: |
 *       Create a new user account. Access and refresh tokens are automatically set in HTTP-only cookies.
 *       
 *       **Cookies Set:**
 *       - accessToken (expires in 15 min)
 *       - refreshToken (expires in 3 days)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterReq'
 *     responses:
 *       201:
 *         description: User created successfully with tokens set in cookies
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignupRes'
 *       400:
 *         description: Validation error or missing fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Email or Username already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/signup', validateResource(signupSchema), signupHandler);

// Login
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     description: |
 *       Authenticate a user with email and password.
 *       
 *       **Normal flow:** Tokens set in HTTP-only cookies automatically
 *       
 *       **2FA enabled:** Returns a temporary token. Use POST /auth/2fa/authenticate to complete login.
 *       
 *       **Cookies Set (if 2FA disabled):**
 *       - accessToken (expires in 15 min)
 *       - refreshToken (expires in 3 days)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginReq'
 *     responses:
 *       200:
 *         description: Login successful (tokens in cookies) or 2FA required (tempToken in body)
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/LoginRes'
 *                 - $ref: '#/components/schemas/Login2FARequiredRes'
 *             examples:
 *               normalLogin:
 *                 summary: Normal login (no 2FA) - tokens in cookies
 *                 value:
 *                   status: success
 *                   message: Logged in successfully
 *               twoFactorRequired:
 *                 summary: 2FA required - tempToken in response
 *                 value:
 *                   status: success
 *                   message: 2FA required
 *                   action_required: 2fa_auth
 *                   tempToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/login', validateResource(loginSchema), loginHandler);

// Refresh Token
/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: |
 *       Get a new access token using the refresh token from cookies.
 *       
 *       **Cookie Required:** refreshToken (sent automatically by browser)
 *       
 *       **Cookie Updated:** accessToken (new token set in cookie)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Access token refreshed and set in cookie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshTokenRes'
 *       403:
 *         description: Refresh token missing or invalid
 *         content:
 *           application/json:
 *       401:
 *         description: Token expired or revoked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/refresh', validateResource(refreshSchema), refreshAccessTokenHandler);

// Logout
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: |
 *       Blacklist both access and refresh tokens and clear cookies.
 *       
 *       **Cookies Used:** accessToken and refreshToken (sent automatically)
 *       
 *       **Actions:**
 *       - Tokens added to blacklist database
 *       - Cookies cleared from browser
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful - tokens blacklisted and cookies cleared
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       400:
 *                   type: string
 *                   example: Logged out successfully
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/logout', validateResource(logoutSchema), logoutHandler);

export default router;
