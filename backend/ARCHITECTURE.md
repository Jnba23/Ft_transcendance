# Backend Architecture - Ft_transcendence

## Overview

This backend uses a **clean modular architecture** that separates concerns and promotes maintainability. The structure follows industry best practices with clear separation between infrastructure, business logic, and presentation layers.

## Project Structure

```
backend/
├── src/
│   ├── app.ts                      # Express app setup & middleware
│   ├── server.ts                   # Server initialization with Socket.io
│   ├── core/                       # Shared infrastructure
│   │   ├── config/                 # Configuration files
│   │   │   ├── index.ts           # Environment config
│   │   │   ├── passport.ts        # Passport.js strategies
│   │   │   └── swagger.ts         # API documentation config
│   │   ├── database/              # Database layer
│   │   │   ├── index.ts          # SQLite connection & queries
│   │   │   ├── schema.sql        # Database schema
│   │   │   └── SCHEMA_EXPLAINED.md
│   │   ├── middleware/            # Express middleware
│   │   │   ├── deserializeUser.ts # JWT token validation
│   │   │   ├── requireUser.ts    # Route protection
│   │   │   └── validateResource.ts # Request validation
│   │   ├── sockets/               # Socket.io setup
│   │   │   ├── socketServer.ts   # Socket.io initialization
│   │   │   └── gameSessionManager.ts # Game session management
│   │   ├── types/                 # Shared TypeScript types
│   │   │   └── index.ts          # User types, etc.
│   │   └── utils/                 # Utility functions
│   │       ├── AppError.ts       # Custom error class
│   │       ├── catchAsync.ts     # Async error handler
│   │       ├── crypt.ts          # Password hashing
│   │       ├── fileUpload.ts     # File upload (multer)
│   │       └── jwt.ts            # JWT token utilities
│   └── modules/                   # Feature modules
│       ├── auth/                  # Authentication
│       │   ├── controller.ts     # Request handlers
│       │   ├── service.ts        # Business logic
│       │   ├── routes.ts         # Route definitions
│       │   ├── schema.ts         # Validation schemas
│       │   └── types.ts          # Module types
│       ├── 2fa/                   # Two-factor authentication
│       ├── oauth/                 # OAuth providers (Google)
│       ├── users/                 # User management & profiles
│       ├── friends/               # Friend system
│       ├── chat/                  # Chat with Socket.io
│       └── games/                 # Game modules
│           ├── game/             # Pong game
│           ├── scnd_game/        # Rock-Paper-Scissors
│           ├── matchmaking/      # Matchmaking system
│           ├── gamePersistence.ts # Save game results
│           └── types.ts          # Game types
├── data/                          # Runtime data
│   ├── uploads/                  # User uploads (avatars)
│   └── transcendance.db          # SQLite database
├── package.json
├── tsconfig.json
└── .gitignore

```

## Architecture Pattern

This backend follows the **MVC (Model-View-Controller)** pattern with service layer:

```
Request Flow:
Frontend → Routes → Controller → Service → Database
                      ↓              ↓
                  Validation    Business Logic
```

### Layer Responsibilities

#### 1. **Routes** (`routes.ts`)
- Define HTTP endpoints and methods
- Apply middleware (auth, validation)
- Map URLs to controller handlers
- **No business logic**

#### 2. **Controllers** (`controller.ts`)
- Handle HTTP requests/responses
- Extract data from request
- Call service methods
- Format responses
- **Minimal logic** - mainly coordination

#### 3. **Services** (`service.ts`)
- Contain all business logic
- Interact with database
- Handle data transformations
- Validate business rules
- **Core application logic**

#### 4. **Schemas** (`schema.ts`)
- Define validation rules using Zod
- Ensure data integrity
- Type-safe request validation

## Feature Modules

### Authentication (`modules/auth/`)
- User registration & login
- Password hashing & verification
- JWT token generation
- Session management

### OAuth (`modules/oauth/`)
- Google OAuth integration
- Provider strategy setup
- OAuth callback handling

### 2FA (`modules/2fa/`)
- TOTP-based 2FA
- QR code generation
- Secret storage
- Verification

### Users (`modules/users/`)
- User profile management
- Avatar upload & management
- Profile updates
- User statistics

### Friends (`modules/friends/`)
- Friend requests
- Accept/reject requests
- Remove friendships
- Check friendship status

### Chat (`modules/chat/`)
- Real-time messaging via Socket.io
- Channel management
- Message persistence

### Games (`modules/games/`)

#### Pong (`game/`)
- Real-time multiplayer Pong
- Game state management
- Score tracking
- Socket.io events

#### Rock-Paper-Scissors (`scnd_game/`)
- Turn-based RPS game
- Match logic
- Win/loss tracking

#### Matchmaking (`matchmaking/`)
- Queue system
- Player pairing
- Game session creation
- Mode selection (classic, speed)

## Core Infrastructure

### Database (`core/database/`)
- SQLite with better-sqlite3
- Schema initialization
- Query helpers
- Transaction support

**Key Tables:**
- `users` - User accounts & stats
- `friendship` - Friend relationships
- `games` - Game history
- `chat_channels` & `chat_messages` - Chat data
- `token_blacklist` - Logout tokens

### Middleware (`core/middleware/`)
- `deserializeUser` - Extract user from JWT
- `requireUser` - Protect routes (401 if not authenticated)
- `validateResource` - Validate request bodies with Zod

### Socket.io (`core/sockets/`)
- Namespace-based architecture
- Game session management
- Real-time event handling

**Namespaces:**
- `/matchmaking` - Queue & matchmaking
- `/games` - Pong game events
- `/chat` - Chat messages
- `/rps` - RPS game events

### Utilities (`core/utils/`)
- `jwt.ts` - Sign/verify tokens
- `crypt.ts` - bcrypt password hashing
- `AppError.ts` - Custom error handling
- `catchAsync.ts` - Async error wrapper
- `fileUpload.ts` - Multer file upload config

## Configuration (`core/config/`)
- Environment variables
- Passport strategies
- Swagger API docs
- CORS settings

## API Documentation

Swagger UI available at `/api-docs` when server is running.

## Key Features

### ✅ Merged Features from Both Backends

**From `backend` (Socket.io version):**
- Real-time Pong game
- Rock-Paper-Scissors game
- Matchmaking system
- Socket.io integration
- Game session management

**From `backend_user_mngmet`:**
- User profile management
- Avatar upload
- Friend system (requests, acceptance)
- Enhanced database schema
- File upload utilities

### ✅ Architecture Improvements

1. **Modular Structure** - Each feature is self-contained
2. **Consistent Patterns** - All modules follow Routes → Controller → Service
3. **Centralized Core** - Shared code in `core/`
4. **Type Safety** - TypeScript throughout
5. **Better Organization** - Clear separation of concerns
6. **Scalability** - Easy to add new modules

## Running the Backend

```bash
# Install dependencies
npm install

# Development mode (hot reload)
npm run dev

# Production mode
npm start

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check
```

## Environment Variables

Create a `.env` file:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173

# OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/oauth/google/callback
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout (protected)
- `GET /api/auth/me` - Get current user (protected)

### OAuth
- `GET /api/oauth/google` - Initiate Google OAuth
- `GET /api/oauth/google/callback` - OAuth callback

### 2FA
- `POST /api/auth/2fa/generate` - Generate 2FA secret (protected)
- `POST /api/auth/2fa/verify` - Verify 2FA code (protected)
- `POST /api/auth/2fa/disable` - Disable 2FA (protected)

### Users
- `GET /api/users/me` - Get profile (protected)
- `PATCH /api/users/me` - Update profile (protected)
- `DELETE /api/users/me/avatar` - Remove avatar (protected)
- `GET /api/users/avatar/:filename` - Get avatar image

### Friends
- `GET /api/friends` - List friends (protected)
- `POST /api/friends/requests/:id` - Send friend request (protected)
- `POST /api/friends/requests/action` - Accept/reject request (protected)
- `DELETE /api/friends/:id` - Remove friend (protected)
- `GET /api/friends/requests/check/:id` - Check friendship status (protected)

### Games & Matchmaking
- Socket.io events for real-time gameplay
- REST endpoints for game history (TBD)

## Development Guidelines

### Adding a New Module

1. Create module directory: `src/modules/myfeature/`
2. Add files:
   - `routes.ts` - Define endpoints
   - `controller.ts` - Request handlers
   - `service.ts` - Business logic
   - `schema.ts` - Validation (optional)
   - `types.ts` - TypeScript types (optional)
3. Register routes in `src/app.ts`
4. Update this documentation

### Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Use Prettier for formatting
- Write modular, testable code
- Keep functions small and focused

## Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- CORS enabled
- Input validation with Zod
- SQL injection protection (parameterized queries)
- File upload restrictions (size, type)
- 2FA support

## Future Enhancements

- [ ] Add tests (Jest/Supertest)
- [ ] Add rate limiting
- [ ] Add Redis for session storage
- [ ] Add WebSocket authentication
- [ ] Add tournament system
- [ ] Add chat moderation
- [ ] Add user blocking
- [ ] Add leaderboards

---

**Last Updated:** 2026-02-19
**Version:** 2.0.0 (Merged & Refactored)
