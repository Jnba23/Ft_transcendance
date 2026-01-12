import { Request, Response, NextFunction } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
import { verifyJwt } from '../utils/jwt.js';
import { getDb } from '../core/database.js';

export const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return next();
  }

  const { decoded, valid } = verifyJwt(accessToken);

  // Prevent using the temporary 2FA token for general access
  if (decoded && (decoded as JwtPayload).login_step === '2fa') {
    return next();
  }

  if (decoded && valid) {
    const userId = (decoded as JwtPayload & { id: number }).id;

    const db = getDb();

    const isBlacklistedStmt = db.prepare(
      'SELECT token FROM token_blacklist WHERE token = ?'
    );
    const isBlacklisted = isBlacklistedStmt.get(accessToken);
    if (isBlacklisted) return next();

    try {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      if (user) {
        res.locals.user = user;
      }
    } catch (error: unknown) {
      console.log('Error in deserializeUser middleware', error);
    }
  }

  return next();
};
