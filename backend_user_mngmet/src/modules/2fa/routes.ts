import { validateResource } from '../../core/middleware/validateResource.js';
import { requireUser } from '../../core/middleware/requireUser.js';
import {
  authenticate2FaHandler,
  generate2FaHandler,
  turnOff2FaHandler,
  turnOn2FaHandler,
} from './controller.js';
import { twoFaSchema, verify2FaSchema, turnOff2FaSchema } from './schema.js';
import { Router } from 'express';

const router = Router();

// Verify 2FA code during login (complete 2FA flow with temp token + OTP)
router.post(
  '/authenticate',
  validateResource(verify2FaSchema),
  authenticate2FaHandler
);

// Generate 2FA QR Code (protected - must be authenticated)
router.post('/generate', requireUser, generate2FaHandler);

// Enable 2FA (protected - verify OTP and enable)
router.post(
  '/turn-on',
  requireUser,
  validateResource(twoFaSchema),
  turnOn2FaHandler
);

// Disable 2FA (protected - requires password verification)
router.post(
  '/turn-off',
  requireUser,
  validateResource(turnOff2FaSchema),
  turnOff2FaHandler
);

export default router;
