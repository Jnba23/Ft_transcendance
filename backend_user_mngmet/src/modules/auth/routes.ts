import { Router } from 'express';
import { validateResource } from '../../core/middleware/validateResource.js';
import {
  loginHandler,
  signupHandler,
  refreshAccessTokenHandler,
  logoutHandler,
} from './controller.js';
import {
  loginSchema,
  signupSchema,
  refreshSchema,
  logoutSchema,
} from './schema.js';

const router = Router();

// Register
router.post('/signup', validateResource(signupSchema), signupHandler);

// Login
router.post('/login', validateResource(loginSchema), loginHandler);

// Refresh Token
router.post(
  '/refresh',
  validateResource(refreshSchema),
  refreshAccessTokenHandler
);

// Logout
router.post('/logout', validateResource(logoutSchema), logoutHandler);

export default router;
