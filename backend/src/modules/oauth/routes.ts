import { Router } from 'express';
import passport from 'passport';
import { googleAuthCallback } from './controller.js';

const router = Router();

/**
 * @swagger
 * /oauth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     description: Redirects user to Google's OAuth consent screen for authentication
 *     tags: [OAuth]
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth consent screen
 */
router.get(
  '/google',
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email'],
  })
);

/**
 * @swagger
 * /oauth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     description: |
 *       Google redirects here after user authentication.
 *       On success, sets JWT tokens in HTTP-only cookies and redirects to frontend.
 *
 *       **Cookies Set:**
 *       - accessToken (expires in 15 min)
 *       - refreshToken (expires in 3 days)
 *     tags: [OAuth]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Optional state parameter for CSRF protection
 *     responses:
 *       302:
 *         description: Redirect to frontend with tokens set in cookies
 *       401:
 *         description: Authentication failed, redirects to login page
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login',
  }),
  googleAuthCallback
);

export default router;
