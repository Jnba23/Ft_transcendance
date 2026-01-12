import { hashPassword, verifyPassword } from '../../utils/crypto.js';
import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { AppError } from '../../utils/AppError.js';
import { getDb } from '../../core/database.js';
import { signJwt, verifyJwt } from '../../utils/jwt.js';
import { config } from '../config/index.js';
import { User } from '../types.js';
import type { JwtPayload } from 'jsonwebtoken';

export const signupHandler = catchAsync(
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

export const refreshAccessTokenHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.body.refreshToken as string;

    if (!refreshToken) {
      return next(new AppError('Could not refresh access token', 403));
    }

    const { valid, expired, decoded } = verifyJwt(refreshToken);

    if (expired) {
      return next(new AppError('Token expired - Please login again', 401));
    }

    if (!decoded || typeof decoded === 'string' || !valid) {
      return next(new AppError('Invalid Token - Possible Tampering', 403));
    }

    const userId = (decoded as JwtPayload & { id: number }).id;

    const db = getDb();
    const isBlacklisted = db
      .prepare('SELECT token FROM token_blacklist WHERE token = ?')
      .get(refreshToken);

    if (isBlacklisted) {
      return next(new AppError('Token revoked. Please login again', 401));
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as
      | User
      | undefined;

    if (!user) {
      return next(new AppError('User not found', 401));
    }

    const accessToken = signJwt(
      { id: user.id, username: user.username },
      { expiresIn: config.jwtAccessExpiresIn }
    );

    res.status(200).json({
      status: 'success',
      token: accessToken,
    });
  }
);

export const logoutHandler = catchAsync(async (req: Request, res: Response) => {
  const accessToken = (req.headers.authorization || '').replace(
    /^Bearer\s/,
    ''
  );
  const { refreshToken } = req.body;

  const db = getDb();
  const blacklistStmt = db.prepare(
    'INSERT OR IGNORE INTO token_blacklist (token, expires_at) VALUES (?, ?)'
  );

  const blacklistToken = (token: string) => {
    const { decoded, valid } = verifyJwt(token);

    if (valid && decoded && typeof decoded === 'object') {
      const exp = (decoded as JwtPayload).exp;
      if (exp) {
        const expiresAt = new Date(exp * 1000).toISOString();
        blacklistStmt.run(token, expiresAt);
      }
    }
  };

  if (accessToken) {
    blacklistToken(accessToken);
  }

  if (refreshToken) {
    blacklistToken(refreshToken);
  }

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});
