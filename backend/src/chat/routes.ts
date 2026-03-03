import { Router } from 'express';
import { validateResource } from '../middleware/validateResource.js';
import { createMessageSchema } from './schema.js';
import {
  createConversation,
  createMessage,
  getConversations,
  getMessages,
  markConversationRead,
} from './controller.js';

const router = Router();

// POST

router.post('/conversations', createConversation);
router.post('/messages', validateResource(createMessageSchema), createMessage);
router.post('/conversations/:id/read', markConversationRead);

// GET

router.get('/conversations', getConversations);
router.get('/conversations/:id/messages', getMessages);

export default router;
