import { Router } from 'express';
import { validateResource } from '../../middleware/validateResource.js';
import {
  loginHandler,
  registerHandler,
} from '../controllers/auth.controllers.js';
import { loginSchema, registerSchema } from '../schemas/auth.schema.js';

const router = Router();

router.post('/login', validateResource(loginSchema), loginHandler);
router.post('/register', validateResource(registerSchema), registerHandler);

export default router;
