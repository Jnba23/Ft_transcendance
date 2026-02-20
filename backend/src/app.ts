import express, { Application, Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import authRoutes from './auth/auth/routes.js';
import oauthRoutes from './auth/oauth/routes.js';
import userRoutes from './user/users/routes.js';
import friendRoutes from './user/friends/routes.js';
import twoFatRoutes from './auth/2fa/routes.js';
import { AppError } from './utils/AppError.js';
import { deserializeUser } from './middleware/deserializeUser.js';
import { config } from './config/index.js';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import multer from 'multer';
import './config/passport.js'; // Initialize passport strategies
import { apiReference } from '@scalar/express-api-reference';

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
app.use('/api/oauth', oauthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/auth/2fa', twoFatRoutes);
app.use(
  '/docs',
  apiReference({
    theme: 'default',
    layout: 'modern',
    defaultHttpClient: {
      targetKey: 'node',
      clientKey: 'undici',
    },
    content: () => {
      const specPath = path.join(process.cwd(), 'src/docs/openapi.json');
      const spec = fs.readFileSync(specPath, 'utf-8');
      return JSON.parse(spec);
    },
    // User Configuration
    hideClientButton: true,
    hideModels: true,
    hideTestRequestButton: true,
    showSidebar: true,
    showDeveloperTools: 'localhost',
    // showToolbar: 'localhost', // Deprecated in types
    operationTitleSource: 'summary',
    persistAuth: false,
    telemetry: true,
    isEditable: false,
    isLoading: false,
    documentDownloadType: 'both',
    hideSearch: false,
    showOperationId: false,
    hideDarkModeToggle: false,
    withDefaultFonts: true,
    defaultOpenAllTags: false,
    expandAllModelSections: false,
    expandAllResponses: false,
    orderSchemaPropertiesBy: 'alpha',
    orderRequiredPropertiesFirst: true,
    // Attempt to hide AI in search using custom CSS
    customCss: `
      .scalar-search-ai { display: none !important; }
      .scalar-api-client__ai { display: none !important; }
    `,
  })
);

// 404 Handler
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(
  (err: AppError | Error, req: Request, res: Response, _next: NextFunction) => {
    const errorResponse: { status: string; message: string; stack?: string } = {
      status: err instanceof AppError ? err.status : 'error',
      message: err.message,
    };

    if (err instanceof multer.MulterError) {
      let message = 'File upload error';

      switch (err.code) {
        case 'LIMIT_FILE_SIZE':
          message = 'File too large. Maximum size is 5MB';
          break;
        case 'LIMIT_FILE_COUNT':
          message = 'Only one file allowed per request';
          break;
        case 'LIMIT_FIELD_COUNT':
          message = 'Too many form fields submitted';
          break;
        case 'LIMIT_UNEXPECTED_FILE':
          message = 'Invalid field name. Use "avatar" for file upload';
          break;
      }

      res.status(400).json({
        status: 'fail',
        message,
      });
      return;
    }

    if (err.message.includes('Multipart: Boundary not found')) {
      res.status(400).json({
        status: 'fail',
        message: 'Invalid multipart request: Boundary not found',
      });
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = err.stack;
    }

    if (err instanceof AppError && err.isOperational) {
      // Trusted error: Send the response we built
      res.status(err.statusCode).json(errorResponse);
    } else {
      // Log error for debugging (disabled in production)
      // console.log('ERROR 💥', err);

      // IN DEVELOPMENT: You usually want to see the crash details anyway
      if (process.env.NODE_ENV === 'development') {
        res.status(500).json(errorResponse);
      }
      // IN PRODUCTION: Send generic message (Hide details)
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
