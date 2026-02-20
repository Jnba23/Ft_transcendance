import { Request, Response, NextFunction, Router } from 'express';
import {
  getAllUsersHandler,
  getCurrentUserHandler,
  getUserbyIdHandler,
  updateUserHandler,
  updateUserStatusHandler,
  resetAvatarHandler,
  getAvatarHandler,
} from './controller.js';
import { requireUser } from '../../middleware/requireUser.js';
import { updateUserSchema, updateStatusSchema } from './schema.js';
import { validateResource } from '../../middleware/validateResource.js';
import { upload } from '../../utils/fileUpload.js';

const router = Router();

const optionalFileUpload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const contentType = req.headers['content-type'] || '';

  if (contentType.includes('multipart/form-data')) {
    upload.single('avatar')(req, res, next);
  } else {
    next();
  }
};

router.get('/me', requireUser, getCurrentUserHandler);

router.patch(
  '/me',
  requireUser,
  optionalFileUpload,
  validateResource(updateUserSchema),
  updateUserHandler
);

router.delete('/me/avatar', requireUser, resetAvatarHandler);

router.get('/', requireUser, getAllUsersHandler);

router.get('/:id', requireUser, getUserbyIdHandler);

router.patch(
  '/status',
  requireUser,
  validateResource(updateStatusSchema),
  updateUserStatusHandler
);

router.get('/avatar/:filename', requireUser, getAvatarHandler);

export default router;
