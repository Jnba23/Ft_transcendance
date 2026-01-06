import { Request, Response, NextFunction } from 'express';
import { hashPassword } from '../../utils/crypto.js';
import { getDb } from '../../core/database.js';
import { AppError } from '../../utils/AppError.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { User } from '../types.js';

export const registerHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password } = req.body;
    const db = getDb();

    const existingUser = db
      .prepare('SELECT id FROM users WHERE email = ? OR username = ?')
      .get(email, username);
    if (existingUser) {
      return next(
        new AppError('User with that email or username already exists', 409)
      );
    }

    const passwordHash = await hashPassword(password);

    const stmt = db.prepare(`
		INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)
	`);
    const info = stmt.run(username, email, passwordHash);

    const user = db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(info.lastInsertRowid) as User;

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
    });
  }
);
