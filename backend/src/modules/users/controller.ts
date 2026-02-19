import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../../core/utils/catchAsync.js';
import { AppError } from '../../core/utils/AppError.js';
import { User } from '../../core/types/index.js';
import { userService } from './service.js';
import fs from 'fs';
import path from 'path';
import app from '../../app.js';

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

const deleteFile = async (filePath: string): Promise<void> => {
  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error('Error deleting file:', error);
    }
  }
};

const DEFAULT_AVATR = 'uploads/default-avatar.png';

const isDeletableAvatar = (avatarUrl: string | null | undefined): boolean => {
  return !!(
    avatarUrl && 
    avatarUrl.startsWith('/uploads/') &&
    avatarUrl !== DEFAULT_AVATR
  );
};

export const updateUserHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const oldUser = userService.findById((currentUser.id));
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

export const resetAvatarHandler = catchAsync (async (req: Request, res: Response, next: NextFunction) => {
  const currentUser = res.locals.user as User;

  const oldUser = userService.findById(currentUser.id);

  if (oldUser?.avatar_url === DEFAULT_AVATR) {
    res.status(200).json({
      status: 'success',
      message: 'Already using default avatar',
      data: {
        user: userService.getSanitizedUser(oldUser)
      }
    });
  }

  if (isDeletableAvatar(oldUser?.avatar_url)) {
    const oldPath = path.join(process.cwd(), oldUser!.avatar_url);
    await deleteFile(oldPath);
  }

  userService.updateProfile(currentUser.id, { avatarUrl: DEFAULT_AVATR });

  const updateUser = userService.findById(currentUser.id);
  if (!updateUser) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: userService.getSanitizedUser(updateUser)
    }
  });
});


export const updateUserStatusHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
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

  }
);