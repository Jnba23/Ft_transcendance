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
 *           pattern: '^\d{6}$'
 *           description: 6-digit OTP code from authenticator app (Google Authenticator, Authy, etc.)
 *           example: "123456"
 *     Verify2FALoginReq:
 *       type: object
 *       required:
 *         - code
 *         - tempToken
 *       properties:
 *         code:
 *           type: string
 *           pattern: '^\d{6}$'
 *           description: 6-digit OTP code from authenticator app
 *           example: "123456"
 *         tempToken:
 *           type: string
 *           description: Temporary JWT token received from login endpoint when 2FA is enabled
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     Generate2FARes:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             qrcode:
 *               type: string
 *               description: Base64 encoded QR code image (scan with authenticator app)
 *               example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 *             secret:
 *               type: string
 *               description: Secret key for manual entry in authenticator app
 *               example: "KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD"
 *     Disable2FAReq:
 *       type: object
 *       required:
 *         - password
 *       properties:
 *         password:
 *           type: string
 *           format: password
 *           description: User's account password for security verification
 *           example: "securePass123"
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

export const turnOff2FaSchema = z.object({
    body: z.object({
        password: z.string().min(1, 'Password is required to disable 2FA'),
    }),
});