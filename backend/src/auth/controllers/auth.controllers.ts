import { hashPassword, verifyPassword } from '../../utils/crypto.js';
import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { AppError } from '../../utils/AppError.js';
import { getDb } from '../../core/database.js';
import { signJwt } from '../../utils/jwt.js';
import { config } from '../config/index.js';
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

export const loginHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const db = getDb();

    const user = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email) as User | undefined;

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return next(new AppError('Invalid email or password', 401));
    }

    const accessToken = signJwt(
      { id: user.id, username: user.username },
      { expiresIn: config.jwtAccessExpiresIn }
    );

    const refreshToken = signJwt(
      { id: user.id, username: user.username },
      { expiresIn: config.jwtRefreshExpiresIn }
    );

    res.status(200).json({
      status: 'success',
      token: {
        accessToken,
        refreshToken,
      },
    });
  }
);
