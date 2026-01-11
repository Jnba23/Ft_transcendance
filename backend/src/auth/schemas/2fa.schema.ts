import { z } from 'zod';

/**
 * @swagger
 * components:
 *   schemas:
 *     Enable2FAReq:
 *       type: object
 *       required:
 *         - code
 *       properties:
 *         code:
 *           type: string
 *           description: 6-digit OTP code from authenticator app
 *           example: "123456"
 *     Verify2FALoginReq:
 *       type: object
 *       required:
 *         - code
 *         - tempToken
 *       properties:
 *         code:
 *           type: string
 *           description: 6-digit OTP code
 *           example: "123456"
 *         tempToken:
 *           type: string
 *           description: Temporary token received from first login step
 *     Generate2FARes:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             qrCode:
 *               type: string
 *               description: Base64 encoded QR code image
 *               example: "data:image/png;base64,..."
 */

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