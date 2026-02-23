import { Router } from 'express'
import {
	createConversation,
	createMessage,
	getConversations,
	getMessages,
	markConversationRead
} from '../controllers/chat.controller.js';

const router = Router();

// POST

router.post('/conversations', createConversation);
router.post('/messages', createMessage);
router.post('/conversations/:id/read', markConversationRead);

// GET

router.get('/conversations', getConversations);
router.get('/conversations/:id/messages', getMessages);


export default router;