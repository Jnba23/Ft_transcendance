import { Router } from 'express';
import passport from 'passport';
import { googleAuthCallback } from './controller.js';

const router = Router();

// Initiate Google OAuth login
router.get(
  '/google',
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email'],
  })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login',
  }),
  googleAuthCallback
);

export default router;
