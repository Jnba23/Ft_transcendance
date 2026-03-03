import { Router } from 'express';
import { requireUser } from '../../middleware/requireUser.js';
import { validateResource } from '../../middleware/validateResource.js';
import {
  createFriendRequest,
  handleFriendAction,
  getFriendRequests,
  getFriends,
} from './controller.js';
import { friendActionSchema } from './schema.js';

const router = Router();

router.use(requireUser);

router.get('/', getFriends);

router.get('/requests', getFriendRequests);

router.post(
  '/requests/action',
  validateResource(friendActionSchema),
  handleFriendAction
);

router.post('/requests', createFriendRequest);

export default router;
