import { Router } from 'express';
import { validateResource } from '../../middleware/validateResource.js';
import {
  loginHandler,
  signupHandler,
  refreshAccessTokenHandler,
  logoutHandler,
} from '../controllers/auth.controllers.js';
import {
  loginSchema,
  signupSchema,
  refreshSchema,
} from '../schemas/auth.schema.js';

const router = Router();

router.post('/login', validateResource(loginSchema), loginHandler);
router.post('/signup', validateResource(signupSchema), signupHandler);
router.post(
  '/refresh',
  validateResource(refreshSchema),
  refreshAccessTokenHandler
);
router.post('/logout', logoutHandler);

export default router;
