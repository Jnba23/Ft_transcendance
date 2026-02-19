import { verifyPassword } from '../../utils/crypt.js';
import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { AppError } from '../../utils/AppError.js';
import { signJwt, verifyJwt } from '../../utils/jwt.js';
import { config } from '../../config/index.js';
import { User } from '../types.js';
import { authService } from './service.js';
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
  path: '/api/auth/refresh',
  maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
};

export const signupHandler = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { username, email, password } = req.body;

    const existing = authService.checkExistingUser(email, username);
    if (existing) {
      if (existing.email) {
        throw new AppError('Email is already taken', 409);
      }
      if (existing.username) {
        throw new AppError('Username is already taken', 409);
      }
    }

    const user = await authService.createUser({ username, email, password });

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
    const { identifier, password } = req.body;

    const user = authService.findByEmailOrUsername(identifier);

    // Check if user exists and has a password (oauth users might not have one)
    if (
      !user ||
      !user.password_hash ||
      !(await verifyPassword(password, user.password_hash))
    ) {
      return next(new AppError('Invalid email/username or password', 401));
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
        tempToken, // Frontend/Postman must send this back with the code
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
      message: 'Logged in successfully',
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

    if (authService.isTokenBlacklisted(refreshToken)) {
      return next(new AppError('Token revoked. Please login again', 401));
    }

    const user = authService.findById(userId);

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
      message: 'Token refreshed',
    });
  }
);

export const logoutHandler = catchAsync(async (req: Request, res: Response) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  const blacklistToken = (token: string) => {
    const { decoded, valid } = verifyJwt(token);

    if (valid && decoded && typeof decoded === 'object') {
      const exp = (decoded as JwtPayload).exp;
      if (exp) {
        const expiresAt = new Date(exp * 1000).toISOString();
        authService.blacklistToken(token, expiresAt);
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
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});
