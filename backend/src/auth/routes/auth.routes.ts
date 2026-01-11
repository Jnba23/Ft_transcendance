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
 *     description: Create a new user account with username, email, and password.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterReq'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         username:
 *                           type: string
 *                         email:
 *                           type: string
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
 *       **Normal flow:** Returns access and refresh tokens.
 *       
 *       **2FA enabled:** Returns a temporary token. Use POST /auth/2fa/authenticate to complete login.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginReq'
 *     responses:
 *       200:
 *         description: Login successful (or 2FA required)
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/LoginRes'
 *                 - $ref: '#/components/schemas/Login2FARequiredRes'
 *             examples:
 *               normalLogin:
 *                 summary: Normal login (no 2FA)
 *                 value:
 *                   status: success
 *                   token:
 *                     accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               twoFactorRequired:
 *                 summary: 2FA required
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
 *     description: Exchange a valid refresh token for a new access token. Use this when the access token expires.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenReq'
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 token:
 *                   type: string
 *                   description: New JWT access token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       403:
 *         description: Refresh token is required or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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
 *       Invalidate both access and refresh tokens by adding them to the blacklist.
 *       
 *       **Requirements:**
 *       - Send access token in Authorization header
 *       - Send refresh token in request body
 *       
 *       Both tokens will be blacklisted and cannot be used again.
 *     security:
 *       - bearerAuth: []
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogoutReq'
 *     responses:
 *       200:
 *         description: Logout successful - tokens blacklisted
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
 *         description: Refresh token is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: fail
 *               message: Refresh token is required
 *       401:
 *         description: Unauthorized - no access token provided
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
router.post('/logout', validateResource(logoutSchema), logoutHandler);

export default router;
