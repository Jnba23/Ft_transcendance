import { validateResource } from '../../middleware/validateResource.js';
import { requireUser } from '../../middleware/requireUser.js';
import {
    authenticate2FaHandler,
    generate2FaHandler,
    turnOn2FaHandler
} from '../controllers/2fa.controller.js';
import { twoFaSchema, verify2FaSchema } from '../schemas/2fa.schema.js';
import { Router } from 'express';

const router = Router();

router.post('/generate', requireUser, generate2FaHandler);
router.post('/turn-on', requireUser, validateResource(twoFaSchema), turnOn2FaHandler);

// 2FA - Step 2 of Login (Public, because user isn't fully logged in yet)
router.post('/authenticate', validateResource(verify2FaSchema), authenticate2FaHandler);

export default router;