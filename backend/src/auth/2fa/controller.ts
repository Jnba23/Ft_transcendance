import { Request, Response, NextFunction } from 'express';
import { signJwt, verifyJwt } from '../../utils/jwt.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { AppError } from '../../utils/AppError.js';
import type { JwtPayload } from 'jsonwebtoken';
import { config } from '../../config/index.js';
import { authenticator } from 'otplib';
import { User } from '../types.js';
import qrcode from 'qrcode';
import { twoFaService } from './service.js';

// Cookie options (same as auth controller)
const accessTokenCookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
};

// Generate QR Code
export const generate2FaHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user as User;

    // Generate Secret
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(
      user.email,
      'ft_transcendence',
      secret
    );

    // Generate QR Code Image (Base64)
    const imageUrl = await qrcode.toDataURL(otpauth);

    twoFaService.saveSecret(user.id, secret);

    res.status(200).json({
      status: 'success',
      data: {
        qrcode: imageUrl,
        secret,
      },
    });
  }
);

// Turn On 2FA (Verify the first code)
export const turnOn2FaHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.body;
    const user = res.locals.user as User;

    const secret = twoFaService.getSecret(user.id);

    if (!secret) {
      return next(new AppError('Please generate a QR code first', 400));
    }

    const isValid = authenticator.verify({
      token: code,
      secret,
    });

    if (!isValid) {
      return next(new AppError('Invalid 2Fa code', 400));
    }

    twoFaService.enable(user.id);

    res.status(200).json({
      status: 'success',
      message: '2Fa has been enabled',
    });
  }
);

// Authenticate (Login Step 2)
export const authenticate2FaHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code, tempToken } = req.body;

    const { decoded, valid } = verifyJwt(tempToken);

    if (
      !valid ||
      !decoded ||
      typeof decoded === 'string' ||
      (decoded as JwtPayload).login_step !== '2fa'
    ) {
      return next(new AppError('Invalid or expird login session', 401));
    }

    const userId = decoded.id;
    const user = twoFaService.findById(userId);

    if (!user || !user.two_fa_secret) {
      return next(new AppError('User not found or 2Fa not set up', 401));
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.two_fa_secret,
    });

    if (!isValid) {
      return next(new AppError('Invalid 2FA code', 401));
    }

    // Success! Issue Real Tokens in cookies
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
      message: '2FA authentication successful',
    });
  }
);

export const turnOff2FaHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.body;
    const user = res.locals.user as User;

    if (!code) {
      return next(new AppError('Please provide the 6-digit code to confirm', 400))
    }

    const secret = twoFaService.getSecret(user.id);
    if (!secret) {
      return next(new AppError('2FA is not currently enabled', 400))
    }

    const isValid = authenticator.verify({
      token: code,
      secret: secret,
    })

    if (!isValid) {
      return next(new AppError('Invalid 2FA code', 401))
    }

    twoFaService.disable(user.id);

    res.status(200).json({
      status: 'success',
      message: '2FA has been disabled',
    });
  }
);
