import { Router } from 'express';
import { registerHandler } from '../controllers/auth.controllers.js';
import { validateResource } from '../../middleware/validateResource.js';
import { registerSchema } from '../schemas/auth.schema.js';

const router = Router();

router.post('/signup', validateResource(registerSchema), registerHandler);

export default router;
