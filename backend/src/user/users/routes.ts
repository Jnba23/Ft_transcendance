import { Request, Response, NextFunction, Router } from 'express';
import {
  getAllUsersHandler,
  getCurrentUserHandler,
  getUserbyIdHandler,
  updateUserHandler,
  updateUserStatusHandler,
  getAvatarHandler,
} from './controller.js';
import { requireUser } from '../../middleware/requireUser.js';
import { updateUserSchema, updateStatusSchema } from './schema.js';
import { validateResource } from '../../middleware/validateResource.js';
import { upload } from '../../utils/fileUpload.js';
import { AppError } from '../../utils/AppError.js';

const router = Router();

const optionalFileUpload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const contentType = req.headers['content-type'] || '';

  if (contentType.includes('multipart/form-data')) {
    if (!contentType.includes('boundary=')) {
      return next(new AppError('Multipart: Boundary not found', 400));
    }
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

router.get('/', requireUser, getAllUsersHandler);

router.get('/:id', requireUser, getUserbyIdHandler);

router.get('/avatar/:id', requireUser, getAvatarHandler);

export default router;
