import { Request, Response, NextFunction } from 'express';
import { getDb } from '../../core/database.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { AppError } from '../../utils/AppError.js';
import { User } from '../types.js';

const sanitizeUser = (user: User) => {
  const { password_hash, two_fa_secret, ...safeUser } = user;

  return safeUser;
};

export const getCurrentUserHandler = (req: Request, res: Response) => {
  const user = res.locals.user as User;

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        user: sanitizeUser(user),
      },
    },
  });
};

export const getAllUsersHandler = catchAsync(
  async (req: Request, res: Response) => {
    const db = getDb();

    const users = db
      .prepare('SELECT id, username, avatar_url, level, status FROM users')
      .all() as Partial<User>[];

    res.status(200).json({
      status: 'success',
      resulte: users.length,
      data: {
        users,
      },
    });
  }
);

export const getUserbyIdHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const db = getDb();

    const user = db
      .prepare(
        'SELECT id, username, avatar_url, level, status, created_at, pong_wins, pong_losses, chess_wins, chess_losses FROM users WHERE id = ?'
      )
      .get(id) as User | undefined;

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

export const updateUserHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, avatarUrl } = req.body;

    const currentUser = res.locals.user as User;

    const db = getDb();

    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (username) {
      const existing = db
        .prepare('SELECT id FROM users WHERE username = ? AND id != ?')
        .get(username, currentUser.id);
      if (existing) {
        return next(new AppError('Username already taken', 409));
      }

      updates.push('username = ?');
      values.push(username);
    }

    if (avatarUrl) {
      updates.push('avatar_url = ?');
      values.push(avatarUrl);
    }

    if (updates.length > 0) {
      values.push(currentUser.id);

      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      db.prepare(query).run(...values);
    }

    const updateUser = db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(currentUser.id) as User;

    res.status(200).json({
      status: 'success',
      data: {
        user: sanitizeUser(updateUser),
      },
    });
  }
);
