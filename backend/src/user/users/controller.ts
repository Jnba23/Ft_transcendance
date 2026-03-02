import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { AppError } from '../../utils/AppError.js';
import { User } from '../../auth/types.js';
import { userService } from './service.js';
import fs from 'fs';
import path from 'path';

export const getCurrentUserHandler = (req: Request, res: Response) => {
  const user = res.locals.user as User;

  res.status(200).json({
    status: 'success',
    data: {
      user: userService.getSanitizedUser(user),
    },
  });
};

export const getAllUsersHandler = catchAsync(
  async (req: Request, res: Response) => {
    const users = userService.findAll();

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  }
);

export const getUserbyIdHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const currentUser = res.locals.user as User;

    if (parseInt(id) === currentUser.id) {
      return res.status(200).json({
        status: 'success',
        data: {
          user: userService.getSanitizedUser(currentUser),
        },
      });
    }

    const user = userService.findByIdPublic(parseInt(id));

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  }
);

export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      // eslint-disable-next-line no-console
      console.error('Error deleting file:', error);
    }
  }
};

const DEFAULT_AVATAR = '/uploads/default-avatar.jpeg';

const isDeletableAvatar = (avatarUrl: string | null | undefined): boolean => {
  return !!(
    avatarUrl &&
    avatarUrl.startsWith('/uploads/') &&
    avatarUrl !== DEFAULT_AVATAR
  );
};

export const updateUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { username } = req.body;
  const currentUser = res.locals.user as User;

  try {
    if (username) {
      const existing = userService.findByUsername(username, currentUser.id);
      if (existing) {
        if (req.file) {
          await deleteFile(req.file.path);
        }
        return next(new AppError('Username already taken', 409));
      }
    }

    let avatarUrl: string | undefined;
    if (req.file) {
      avatarUrl = `/uploads/${req.file.filename}`;

      const oldUser = userService.findById(currentUser.id);
      if (isDeletableAvatar(oldUser?.avatar_url)) {
        const oldPath = path.join(process.cwd(), oldUser!.avatar_url);
        await deleteFile(oldPath);
      }
    }

    const updateData: { username?: string; avatarUrl?: string } = {};
    if (username) updateData.username = username;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;

    userService.updateProfile(currentUser.id, updateData);

    const updatedUser = userService.findById(currentUser.id);
    if (!updatedUser) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: userService.getSanitizedUser(updatedUser),
      },
    });
  } catch (err) {
    if (req.file) {
      await deleteFile(req.file.path);
    }
    next(err);
  }
};

export const updateUserStatusHandler = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { status } = req.body;
    const currentUser = res.locals.user as User;

    userService.updateStatus(currentUser.id, status);

    res.status(200).json({
      status: 'success',
      data: { status },
    });
  }
);

export const getAvatarHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const user = userService.findByIdPublic(parseInt(id));
    if (!user || !user.avatar_url) {
      return next(new AppError('User or avatar not found', 404));
    }
    const avatarPath = path.join(
      process.cwd(),
      user.avatar_url.startsWith('/')
        ? user.avatar_url.slice(1)
        : user.avatar_url
    );
    if (!fs.existsSync(avatarPath)) {
      return next(new AppError('Avatar file not found', 404));
    }

    res.sendFile(avatarPath);
  }
);
