import { Request, Response, NextFunction } from "express";
import { signJwt, verifyJwt } from "../../utils/jwt.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";
import { getDb } from "../../core/database.js";
import type { JwtPayload } from 'jsonwebtoken';
import { config } from '../config/index.js';
import { authenticator } from 'otplib';
import { User } from "../types.js";
import qrcode from 'qrcode';

// Generate QR Code
export const generate2FaHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user as User;

    // Generate Secret
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, 'ft_transcendence', secret);

    // Generate QR Code Image (Base64)
    const imageUrl = await qrcode.toDataURL(otpauth);

    const db = getDb();
    db.prepare('UPDATE users SET two_fa_secret = ? WHERE id = ?').run(secret, user.id);

    res.status(200).json({
        status: 'success',
        data: {
            qrcode: imageUrl,
            secret
        }
    });
});

// Turn On 2FA (Verify the first code)
export const turnOn2FaHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.body;
    const user = res.locals.user as User;
    const db = getDb();

    const userData = db.prepare('SELECT two_fa_secret FROM users WHERE id = ?').get(user.id) as User;

    if (!userData.two_fa_secret) {
        return next(new AppError('Please generate a QR code first', 400));
    }

    const isValid = authenticator.verify({
        token: code,
        secret: userData.two_fa_secret
    });

    if (!isValid) {
        return next(new AppError('Invalid 2Fa code', 400));
    }

    db.prepare('UPDATE users SET is_2fa_enabled = 1 WHERE id = ?').run(user.id);

    res.status(200).json({
        status: 'success',
        message: '2Fa has been enabled'
    });
});


// Authenticate (Login Step 2)
export const authenticate2FaHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { code, tempToken } = req.body;

    const { decoded, valid } = verifyJwt(tempToken);
    
    if (!valid || !decoded || typeof decoded === 'string' || (decoded as JwtPayload).login_step !== '2fa') {
        return next(new AppError('Invalid or expird login session', 401));
    }

    const userId = decoded.id;
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User | undefined;

    if (!user || !user.two_fa_secret) {
        return next(new AppError('User not found or 2Fa not set up', 401));
    }

    const isValid = authenticator.verify({
        token: code,
        secret: user.two_fa_secret
    });

    if (!isValid) {
        return next(new AppError('Invalid 2Fa code', 401));
    }

    // Success! Issue Real Tokens
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
        token: { accessToken, refreshToken }
    })
})