import express, { Application, Request, Response, NextFunction } from 'express';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import twoFatRoutes from './routes/2fa.routes.js';
import { AppError } from '../utils/AppError.js';
import { deserializeUser } from '../middleware/deserializeUser.js';
import { config } from './config/index.js';
import morgan from 'morgan';
import cors from 'cors';
import { swaggerSpec } from './config/swagger.js';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';

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

// Custom Middleware
app.use(deserializeUser);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Auth Service Running 🚀' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth/2fa', twoFatRoutes);

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

    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = err.stack;
    }

    if (err instanceof AppError && err.isOperational) {
      // Trusted error: Send the response we built
      res.status(err.statusCode).json(errorResponse);
    } else {
      console.log('ERROR 💥', err);

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
