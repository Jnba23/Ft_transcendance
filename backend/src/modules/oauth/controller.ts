import { Request, Response } from 'express';
import { signJwt } from '../../core/utils/jwt.js';
import { config } from '../../core/config/index.js';
import { User } from '../../core/types/index.js';

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

/**
 * Google OAuth callback handler
 * Called after successful authentication with Google
 * Creates JWT tokens and redirects user to the frontend
 */

export const googleAuthCallback = (req: Request, res: Response) => {
  const user = req.user as User;

  // Generate access and refresh tokens
  const accessToken = signJwt(
    { id: user.id, username: user.username },
    { expiresIn: config.jwtAccessExpiresIn }
  );

  const refreshToken = signJwt(
    { id: user.id, username: user.username },
    { expiresIn: config.jwtRefreshExpiresIn }
  );

  // Set tokens in HTTP-only cookies
  res.cookie('accessToken', accessToken, accessTokenCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

  // Redirect to frontend (adjust URL as needed)
  res.redirect(config.corsOrigin || 'http://localhost:5173/');
};
