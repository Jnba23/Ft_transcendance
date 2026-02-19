import { z } from 'zod';

/**
 * @swagger
 * components:
 *   schemas:
 *     MyProfileRes:
 *       type: object
 *       description: Full user profile for authenticated user
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique user identifier
 *           example: 1
 *         username:
 *           type: string
 *           description: Display name
 *           example: johndoe
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: john@example.com
 *         avatar_url:
 *           type: string
 *           description: Profile picture URL
 *           example: /default-avatar.png
 *         level:
 *           type: integer
 *           description: Player level
 *           example: 5
 *         is_2fa_enabled:
 *           type: boolean
 *           description: Whether 2FA is enabled
 *           example: false
 *         status:
 *           type: string
 *           enum: [online, offline, in_game]
 *           description: Current user status
 *           example: online
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Account creation date
 *           example: "2026-01-11T12:00:00Z"
 *         pong_wins:
 *           type: integer
 *           description: Total Pong wins
 *           example: 10
 *         pong_losses:
 *           type: integer
 *           description: Total Pong losses
 *           example: 5
 *         chess_wins:
 *           type: integer
 *           description: Total Chess wins
 *           example: 8
 *         chess_losses:
 *           type: integer
 *           description: Total Chess losses
 *           example: 3
 *         win_streak:
 *           type: integer
 *           description: Current winning streak
 *           example: 3
 *     UpdateProfileReq:
 *       type: object
 *       description: Fields that can be updated on user profile
 *       properties:
 *         username:
 *           type: string
 *           minLength: 3
 *           description: New username (must be unique)
 *           example: newusername
 *         avatarUrl:
 *           type: string
 *           format: uri
 *           description: New avatar image URL
 *           example: https://example.com/avatar.png
 *     UserSummaryRes:
 *       type: object
 *       description: Public user information (for listings)
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         username:
 *           type: string
 *           example: johndoe
 *         avatar_url:
 *           type: string
 *           example: /default-avatar.png
 *         level:
 *           type: integer
 *           example: 5
 *         status:
 *           type: string
 *           enum: [online, offline, in_game]
 *           example: online
 *     UserProfileRes:
 *       type: object
 *       description: Public user profile with stats
 *       allOf:
 *         - $ref: '#/components/schemas/UserSummaryRes'
 *         - type: object
 *           properties:
 *             created_at:
 *               type: string
 *               format: date-time
 *               example: "2026-01-11T12:00:00Z"
 *             pong_wins:
 *               type: integer
 *               example: 10
 *             pong_losses:
 *               type: integer
 *               example: 5
 *             chess_wins:
 *               type: integer
 *               example: 8
 *             chess_losses:
 *               type: integer
 *               example: 3
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
