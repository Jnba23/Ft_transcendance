import dotenv from 'dotenv';
import type { SignOptions } from 'jsonwebtoken';

dotenv.config();

export const config = {
	port: process.env.PORT || 3000,
	nodeEnv: process.env.NODE_ENV || 'development',
	serverUrl: process.env.SERVER_URL || 'http://localhost:3000',
	jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
	corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001',
	jwtAccessExpiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ||
		'15m') as SignOptions['expiresIn'],
	jwtRefreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ||
		'3d') as SignOptions['expiresIn'],
	googleClientId: process.env.GOOGLE_CLIENT_ID,
	googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
	publicApiKey: process.env.PUBLIC_API_KEY,
};
