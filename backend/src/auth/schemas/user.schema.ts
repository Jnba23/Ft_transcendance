import { z } from 'zod';

/**
 * @swagger
 * components:
 *   schemas:
 *     MyProfileRes:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         avatar_url:
 *           type: string
 *         level:
 *           type: number
 *         is_2fa_enabled:
 *           type: integer
 *         status:
 *           type: string
 *         created_at:
 *           type: string
 *         pong_wins:
 *           type: integer
 *         pong_losses:
 *           type: integer
 *         chess_wins:
 *           type: integer
 *         chess_losses:
 *           type: integer
 *         win_streak:
 *           type: integer
 *     UpdateProfileReq:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *         avatarUrl:
 *           type: string
 *     UserSummaryRes:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         username:
 *           type: string
 *         avatar_url:
 *           type: string
 *         level:
 *           type: number
 *         status:
 *           type: string
 *     UserProfileRes:
 *       type: object
 *       allOf:
 *         - $ref: '#/components/schemas/UserSummaryRes'
 *         - type: object
 *           properties:
 *             created_at:
 *               type: string
 *             pong_wins:
 *               type: integer
 *             pong_losses:
 *               type: integer
 *             chess_wins:
 *               type: integer
 *             chess_losses:
 *               type: integer
 */

export const updateUserSchema = z.object({
  body: z.object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .optional(),
    avatarUrl: z.string().url('Invalid URL format').optional(),
  }),
});
