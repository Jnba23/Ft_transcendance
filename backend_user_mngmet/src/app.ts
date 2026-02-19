import express, { Application, Request, Response, NextFunction } from 'express';
import authRoutes from './modules/auth/routes.js';
import oauthRoutes from './modules/oauth/routes.js';
import userRoutes from './modules/users/routes.js';
import friendRoutes from './modules/friends/routes.js';
import twoFaRoutes from './modules/2fa/routes.js';
import { AppError } from './core/utils/AppError.js';
import { deserializeUser } from './core/middleware/deserializeUser.js';
import { config } from './core/config/index.js';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import './core/config/passport.js'; // Initialize passport strategies
import multer from 'multer';

const app: Application = express();

app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Request details logger (body/params/query)
const redactKeys = new Set(['password', 'confirmPassword']);
app.use((req: Request, _res: Response, next: NextFunction) => {
  let safeBody = req.body;
  if (req.body && typeof req.body === 'object') {
    safeBody = Object.fromEntries(
      Object.entries(req.body).map(([key, value]) => [
        key,
        redactKeys.has(key) ? '[REDACTED]' : value,
      ])
    );
  }

  // eslint-disable-next-line no-console
  console.log('[Request]', {
    method: req.method,
    url: req.originalUrl,
    params: req.params,
    query: req.query,
    body: safeBody,
  });
  next();
});

// Initialize Passport
app.use(passport.initialize());

// Custom Middleware
app.use(deserializeUser);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Auth Service Running 🚀' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/auth/2fa', twoFaRoutes);

// 404 Handler
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(
  (err: AppError | Error | multer.MulterError, req: Request, res: Response, _next: NextFunction) => {
    const errorResponse: { status: string; message: string; stack?: string } = {
      status: err instanceof AppError ? err.status : 'error',
      message: err.message,
    };

    if (err instanceof multer.MulterError) {
      let message = 'File upload error';

      switch (err.code) {
        case 'LIMIT_FILE_SIZE':
          message = 'File too large. Maximum size is 5MB';
          break ;
        case 'LIMIT_FILE_COUNT':
          message = 'Only one file allowed per request';
          break ;
        case 'LIMIT_FIELD_COUNT':
          message = 'Too many form fields submitted';
          break ;
        case 'LIMIT_UNEXPECTED_FILE':
          message = 'Invalid field name. Use "avatar" for file upload';
          break ;
      }

      res.status(400).json({
        status: 'fail',
        message,
      });
      return ;
    }

    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = err.stack;
    }

    if (err instanceof AppError && err.isOperational) {
      // Trusted error: Send the response we built
      res.status(err.statusCode).json(errorResponse);
    } else {
      // IN DEVELOPMENT
      if (process.env.NODE_ENV === 'development') {
        res.status(500).json(errorResponse);
      }
      // IN PRODUCTION
      else {
        res.status(500).json({
          status: 'error',
          message: 'Something went wrong!',
        });
      }
    }
  }
);

export default app;
