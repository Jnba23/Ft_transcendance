import { validateResource } from '../../middleware/validateResource.js';
import { requireUser } from '../../middleware/requireUser.js';
import {
    authenticate2FaHandler,
    generate2FaHandler,
    turnOn2FaHandler
} from '../controllers/2fa.controller.js';
import { twoFaSchema, verify2FaSchema } from '../schemas/2fa.schema.js';
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /auth/2fa/authenticate:
 *   post:
 *     summary: Verify 2FA code during login
 *     description: Verify the OTP code using the temporary token received during login. Returns full access tokens.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Verify2FALoginReq'
 *     responses:
 *       200:
 *         description: 2FA verification successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 tokens:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: Invalid or expired session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Invalid code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/authenticate', validateResource(verify2FaSchema), authenticate2FaHandler);

// 2FA - Setup (Protected: You must be logged in to turn it on)
/**
 * @swagger
 * /auth/2fa/generate:
 *   post:
 *     summary: Generate 2FA QR Code
 *     description: Generate a new 2FA secret and return a QR code for scanning.
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
 *         description: Unauthorized
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
 *     description: Verify and enable 2FA for the account.
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
 *         description: Invalid code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/turn-on', requireUser, validateResource(twoFaSchema), turnOn2FaHandler);

export default router;