import { Router } from 'express';
import {
  getAllUsersHandler,
  getCurrentUserHandler,
  getUserbyIdHandler,
  updateUserHandler,
} from '../controllers/user.controller.js';
import { requireUser } from '../../middleware/requireUser.js';
import { updateUserSchema } from '../schemas/user.schema.js';
import { validateResource } from '../../middleware/validateResource.js';

const router = Router();

// Protected Routes (Require Login)
router.get('/me', requireUser, getCurrentUserHandler);
router.patch(
  '/me',
  requireUser,
  validateResource(updateUserSchema),
  updateUserHandler
);

// Public Routes
router.get('/', getAllUsersHandler);
router.get('/:id', getUserbyIdHandler);

export default router;
