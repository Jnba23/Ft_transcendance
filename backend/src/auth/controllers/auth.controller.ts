import { hashPassword, verifyPassword } from '../../utils/crypt.js';
import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { AppError } from '../../utils/AppError.js';
import { getDb } from '../../core/database.js';
import { signJwt, verifyJwt } from '../../utils/jwt.js';
import { config } from '../config/index.js';
import { User } from '../types.js';
import type { JwtPayload } from 'jsonwebtoken';

const cookieOptions = {
	httpOnly: true,
	secure: config.nodeEnv === 'production',
	sameSite: 'strict' as const,
	path: '/',
};

const accessTokenCookieOptions = {
	...cookieOptions,
	maxAge: 15 * 60 * 1000, // 15 minutes
};

const refreshTokenCookieOptions = {
	...cookieOptions,
	maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
};

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

	// Create tokens for immediate login after signup
	const accessToken = signJwt(
	  { id: user.id, username: user.username },
	  { expiresIn: config.jwtAccessExpiresIn }
	);

	const refreshToken = signJwt(
	  { id: user.id, username: user.username },
	  { expiresIn: config.jwtRefreshExpiresIn }
	);

	// Set tokens in cookies
	res.cookie('accessToken', accessToken, accessTokenCookieOptions);
	res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

	res.status(201).json({
	  status: 'success',
	  message: 'Account created successfully',
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

	if (user.is_2fa_enabled) {
		const tempToken = signJwt(
			{ id: user.id, username: user.username, login_step: '2fa' },
			{ expiresIn: '5m' }
		);

		return res.status(200).json({
			status: 'success',
			message: '2Fa required',
			action_required: '2fa_auth',
			tempToken // Frontend/Postman must send this back with the code
		});
	}

	const accessToken = signJwt(
	  { id: user.id, username: user.username },
	  { expiresIn: config.jwtAccessExpiresIn }
	);

	const refreshToken = signJwt(
	  { id: user.id, username: user.username },
	  { expiresIn: config.jwtRefreshExpiresIn }
	);

	res.cookie('accessToken', accessToken, accessTokenCookieOptions);
	res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

	res.status(200).json({
	  status: 'success',
	  message: 'Logged in successfully'
	});
  }
);

export const refreshAccessTokenHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
	const refreshToken = req.cookies.refreshToken;

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

	res.cookie('accessToken', accessToken, accessTokenCookieOptions);

	res.status(200).json({
	  status: 'success',
	  message: 'Token refreshed'
	});
  }
);

export const logoutHandler = catchAsync(async (req: Request, res: Response) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

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

  // Clear cookies
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });

  res.status(200).json({
	status: 'success',
	message: 'Logged out successfully',
  });
});
