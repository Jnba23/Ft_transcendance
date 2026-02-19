# Ft_transcendence Backend

A modern, modular backend for the Ft_transcendence project, featuring real-time gaming, user management, and social features.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create .env file (see Environment Variables below)
cp .env.example .env

# Run in development mode
npm run dev

# Run in production mode
npm start
```

Server will be running at `http://localhost:3000`

## 📦 Features

### Core Features
- 🔐 **Authentication** - JWT-based auth with OAuth (Google)
- 🔒 **2FA** - Two-factor authentication with TOTP
- 👤 **User Management** - Profiles, avatars, stats
- 👥 **Friend System** - Requests, acceptance, management
- 💬 **Real-time Chat** - Socket.io powered chat
- 🎮 **Games** - Pong & Rock-Paper-Scissors
- 🎯 **Matchmaking** - Queue system for game pairing

### Technical Features
- ✅ TypeScript for type safety
- ✅ Modular architecture
- ✅ SQLite database
- ✅ Socket.io for real-time features
- ✅ File upload support (avatars)
- ✅ API documentation (Swagger)
- ✅ Input validation (Zod)
- ✅ Error handling
- ✅ ESLint & Prettier

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.ts              # Express app
│   ├── server.ts           # Server with Socket.io
│   ├── core/               # Shared infrastructure
│   │   ├── config/         # Configuration
│   │   ├── database/       # Database layer
│   │   ├── middleware/     # Auth middleware
│   │   ├── sockets/        # Socket.io setup
│   │   └── utils/          # Utilities
│   └── modules/            # Feature modules
│       ├── auth/           # Authentication
│       ├── 2fa/            # Two-factor auth
│       ├── oauth/          # OAuth providers
│       ├── users/          # User management
│       ├── friends/        # Friend system
│       ├── chat/           # Chat
│       └── games/          # Games & matchmaking
├── data/                   # Runtime data (DB, uploads)
└── package.json
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

## 🛠️ Environment Variables

Create a `.env` file in the backend directory:

```env
# Server
NODE_ENV=development
PORT=3000

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/oauth/google/callback
```

## 📚 API Documentation

### REST API
Once the server is running, visit:
- Swagger UI: `http://localhost:3000/api-docs`

### Socket.io Events

#### Matchmaking (`/matchmaking` namespace)
- `joinQueue` - Join matchmaking queue
- `leaveQueue` - Leave queue
- `matchFound` - Match was found

#### Pong Game (`/games` namespace)
- `playerMove` - Send paddle position
- `gameState` - Receive game state updates
- `gameOver` - Game finished

#### RPS Game (`/rps` namespace)
- `makeMove` - Submit rock/paper/scissors
- `roundResult` - Round outcome
- `gameResult` - Final game result

## 🔐 Authentication Flow

1. **Register**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login` → Returns JWT token
3. **Use Token**: Add `Authorization: Bearer <token>` header
4. **Protected Routes**: Access user-specific endpoints

### OAuth Flow
1. Frontend redirects to: `GET /api/oauth/google`
2. User authenticates with Google
3. Callback to: `GET /api/oauth/google/callback`
4. Returns JWT token

## 🎮 Game Flow

### Matchmaking
1. Connect to Socket.io: `/matchmaking` namespace
2. Emit `joinQueue` with game mode
3. Wait for `matchFound` event
4. Join game namespace with session ID

### Playing Pong
1. Connect to `/games` namespace
2. Listen for `gameState` updates
3. Emit `playerMove` with paddle position
4. Game ends with `gameOver` event

## 🧪 Development

### Scripts
```bash
npm run dev          # Start dev server (hot reload)
npm start            # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format with Prettier
npm run format:check # Check formatting
```

### Code Style
- TypeScript strict mode
- 2-space indentation
- Single quotes
- Semicolons required
- Follow ESLint rules

## 🗄️ Database

SQLite database located at `data/transcendance.db`

### Schema
- `users` - User accounts & stats
- `friendship` - Friend relationships
- `games` - Game history
- `chat_channels` - Chat channels
- `chat_messages` - Messages
- `matchmaking_queue` - Active matchmaking
- `tournaments` - Tournaments
- `token_blacklist` - Logout tokens

See `src/core/database/schema.sql` for full schema.

## 📝 Adding a New Feature

1. Create module directory: `src/modules/myfeature/`
2. Add files:
   ```
   routes.ts      # Define endpoints
   controller.ts  # Request handlers
   service.ts     # Business logic
   schema.ts      # Validation (optional)
   types.ts       # TypeScript types (optional)
   ```
3. Register routes in `src/app.ts`
4. Update documentation

Example module structure:
```typescript
// routes.ts
import { Router } from 'express';
import { controller } from './controller.js';
import { requireUser } from '../../core/middleware/requireUser.js';

const router = Router();
router.get('/', requireUser, controller.list);
router.post('/', requireUser, controller.create);
export default router;

// controller.ts
import { Request, Response } from 'express';
import { service } from './service.js';

export const controller = {
  list: async (req: Request, res: Response) => {
    const items = await service.getAll();
    res.json(items);
  },
  create: async (req: Request, res: Response) => {
    const item = await service.create(req.body);
    res.status(201).json(item);
  }
};

// service.ts
import { db } from '../../core/database/index.js';

export const service = {
  getAll: () => {
    return db.query('SELECT * FROM items');
  },
  create: (data: any) => {
    return db.run('INSERT INTO items (name) VALUES (?)', [data.name]);
  }
};
```

## 🔒 Security

- Passwords hashed with bcrypt (cost factor: 10)
- JWT tokens with expiration
- CORS enabled
- Input validation with Zod
- SQL injection protection (parameterized queries)
- File upload restrictions (5MB limit, images only)
- 2FA support with TOTP

## 🐛 Troubleshooting

### Database Issues
```bash
# Delete database and restart (development only!)
rm data/transcendance.db
npm run dev
```

### Port Already in Use
Change `PORT` in `.env` file

### OAuth Not Working
1. Check Google Console credentials
2. Verify callback URL matches
3. Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set

## 📄 License

This project is part of the 42 school curriculum.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linter: `npm run lint:fix`
5. Test your changes
6. Submit a pull request

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for 42 School**
