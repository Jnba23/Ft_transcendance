import express, { Application } from 'express';
import authRoutes from './auth/auth/routes.js';
import oauthRoutes from './auth/oauth/routes.js';
import userRoutes from './user/users/routes.js';
import friendRoutes from './user/friends/routes.js';
import twoFatRoutes from './auth/2fa/routes.js';
import publicApiRoutes from './publicApi/routes.js';
import chatRoutes from './chat/routes.js';
import gameRoutes from './realTimeGame/persistence/routes.js';
import { AppError } from './utils/AppError.js';
import { deserializeUser } from './middleware/deserializeUser.js';
import { config } from './config/index.js';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import './config/passport.js'; // Initialize passport strategies
import { scalarDocs } from './docs/scalarConfig.js';
import { globalErrorHandler } from './middleware/errorMiddleware.js';

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
app.use('/api/public', publicApiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/games', gameRoutes);

// Documentation
app.use('/docs', scalarDocs);

// 404 Handler
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
