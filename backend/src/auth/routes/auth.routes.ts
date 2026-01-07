import { Router } from 'express';
import { validateResource } from '../../middleware/validateResource.js';
import {
  loginHandler,
  signupHandler,
} from '../controllers/auth.controllers.js';
import { loginSchema, signupSchema } from '../schemas/auth.schema.js';

const router = Router();

router.post('/login', validateResource(loginSchema), loginHandler);
router.post('/signup', validateResource(signupSchema), signupHandler);

export default router;
