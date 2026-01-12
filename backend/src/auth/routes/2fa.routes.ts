import { validateResource } from '../../middleware/validateResource.js';
import { requireUser } from '../../middleware/requireUser.js';
import {
    authenticate2FaHandler,
    generate2FaHandler,
    turnOff2FaHandler,
    turnOn2FaHandler
} from '../controllers/2fa.controller.js';
import { twoFaSchema, verify2FaSchema, turnOff2FaSchema } from '../schemas/2fa.schema.js';
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /auth/2fa/authenticate:
 *   post:
 *     summary: Verify 2FA code during login
 *     description: |
 *       Complete the 2FA authentication flow after receiving a tempToken from login.
 *       
 *       **Flow:**
 *       1. Call /auth/login with credentials
 *       2. If 2FA is enabled, receive a temporary token (valid for 5 minutes)
 *       3. Call this endpoint with the temporary token and 6-digit OTP code
 *       4. Receive full access and refresh tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Verify2FALoginReq'
 *     responses:
 *       200:
 *         description: 2FA verification successful - tokens set in HTTP-only cookies
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
 *                   example: 2FA authentication successful
 *         headers:
 *           Set-Cookie:
 *             description: HTTP-only cookies containing accessToken and refreshToken
 *             schema:
 *               type: string
 *       400:
 *         description: Invalid or expired temporary token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: fail
 *               message: Invalid or expired 2FA session
 *       401:
 *         description: Invalid OTP code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: fail
 *               message: Invalid 2FA code
 */
router.post('/authenticate', validateResource(verify2FaSchema), authenticate2FaHandler);

// 2FA - Setup (Protected: You must be logged in to turn it on)
/**
 * @swagger
 * /auth/2fa/generate:
 *   post:
 *     summary: Generate 2FA QR Code
 *     description: |
 *       Generate a new TOTP secret and QR code for setting up 2FA.
 *       
 *       **Setup Flow:**
 *       1. Call this endpoint (requires authentication)
 *       2. Display the QR code to the user
 *       3. User scans with authenticator app (Google Authenticator, Authy, etc.)
 *       4. User enters the 6-digit code from the app
 *       5. Call POST /auth/2fa/turn-on to verify and enable 2FA
 *       
 *       **Note:** The secret is temporarily stored and must be verified within the session.
 *     security:
 *       - bearerAuth: []
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: QR code generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Generate2FARes'
 *       401:
 *         description: Unauthorized - valid access token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Failed to generate QR code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/generate', requireUser, generate2FaHandler);

/**
 * @swagger
 * /auth/2fa/turn-on:
 *   post:
 *     summary: Enable 2FA
 *     description: |
 *       Verify the OTP code from the authenticator app and enable 2FA for the account.
 *       
 *       **Prerequisites:**
 *       - Must be authenticated
 *       - Must have called POST /auth/2fa/generate to get a pending secret
 *       
 *       **After enabling:**
 *       - All future logins will require 2FA verification
 *       - The secret is permanently stored in the database
 *     security:
 *       - bearerAuth: []
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Enable2FAReq'
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
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
 *                   example: 2FA has been enabled
 *       400:
 *         description: Invalid OTP code or no pending 2FA setup
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: fail
 *               message: Invalid 2FA code
 *       401:
 *         description: Unauthorized - valid access token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/turn-on', requireUser, validateResource(twoFaSchema), turnOn2FaHandler);

/**
 * @swagger
 * /auth/2fa/turn-off:
 *   post:
 *     summary: Disable 2FA
 *     description: |
 *       Disable two-factor authentication for the account.
 *       
 *       **Security Requirements:**
 *       - Must be authenticated
 *       - Must provide account password for verification
 *       
 *       **After disabling:**
 *       - Future logins will NOT require 2FA
 *       - The 2FA secret is deleted from the database
 *       - User must re-scan a new QR code if they want to enable 2FA again
 *     security:
 *       - bearerAuth: []
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Disable2FAReq'
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
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
 *                   example: 2FA has been disabled
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized or invalid password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               status: fail
 *               message: Invalid password
 */
router.post('/turn-off', requireUser, validateResource(turnOff2FaSchema), turnOff2FaHandler);

export default router;