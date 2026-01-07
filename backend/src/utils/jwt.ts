import { config } from '../auth/config/index.js';
import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';

export type VerifyJwtResult =
  | { valid: true; expired: false; decoded: string | JwtPayload }
  | { valid: false; expired: boolean; decoded: null };

export const signJwt = (payload: object, options?: SignOptions): string => {
  return jwt.sign(payload, config.jwtSecret, options);
};

export const verifyJwt = (token: string): VerifyJwtResult => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    return {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (error: unknown) {
    let expired = false;
    if (error instanceof Error && error.message === 'jwt expired')
      expired = true;
    return {
      valid: false,
      expired,
      decoded: null,
    };
  }
};
