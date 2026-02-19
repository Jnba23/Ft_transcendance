# Backend Structure Visual Guide

## Directory Tree

```
backend/
│
├── 📄 package.json              # Dependencies & scripts
├── 📄 tsconfig.json             # TypeScript config
├── 📄 .env.example              # Environment template
├── 📄 .gitignore                # Git ignore rules
├── 📄 README.md                 # Quick start guide
├── 📄 ARCHITECTURE.md           # Architecture docs
│
├── 📁 data/                     # Runtime data (gitignored)
│   ├── transcendance.db        # SQLite database
│   └── uploads/                # User avatars
│
└── 📁 src/                      # Source code
    │
    ├── 📄 server.ts             # Entry point (HTTP + Socket.io)
    ├── 📄 app.ts                # Express app setup
    │
    ├── 📁 core/                 # 🔧 Shared Infrastructure
    │   │
    │   ├── 📁 config/
    │   │   ├── index.ts         # Environment config
    │   │   ├── passport.ts      # OAuth strategies
    │   │   └── swagger.ts       # API docs
    │   │
    │   ├── 📁 database/
    │   │   ├── index.ts         # DB connection
    │   │   ├── schema.sql       # DB schema
    │   │   └── SCHEMA_EXPLAINED.md
    │   │
    │   ├── 📁 middleware/
    │   │   ├── deserializeUser.ts  # JWT extraction
    │   │   ├── requireUser.ts      # Auth guard
    │   │   └── validateResource.ts # Request validation
    │   │
    │   ├── 📁 sockets/
    │   │   ├── socketServer.ts     # Socket.io setup
    │   │   └── gameSessionManager.ts
    │   │
    │   ├── 📁 types/
    │   │   └── index.ts         # Shared types
    │   │
    │   └── 📁 utils/
    │       ├── AppError.ts      # Error handling
    │       ├── catchAsync.ts    # Async wrapper
    │       ├── crypt.ts         # Password hashing
    │       ├── fileUpload.ts    # Multer config
    │       └── jwt.ts           # JWT utilities
    │
    └── 📁 modules/              # 🎯 Feature Modules
        │
        ├── 📁 auth/             # 🔐 Authentication
        │   ├── controller.ts
        │   ├── service.ts
        │   ├── routes.ts
        │   ├── schema.ts
        │   └── types.ts
        │
        ├── 📁 2fa/              # 🔒 Two-Factor Auth
        │   ├── controller.ts
        │   ├── service.ts
        │   ├── routes.ts
        │   └── schema.ts
        │
        ├── 📁 oauth/            # 🌐 OAuth (Google)
        │   ├── controller.ts
        │   ├── service.ts
        │   └── routes.ts
        │
        ├── 📁 users/            # 👤 User Management
        │   ├── controller.ts
        │   ├── service.ts
        │   ├── routes.ts
        │   └── schema.ts
        │
        ├── 📁 friends/          # 👥 Friend System
        │   ├── controller.ts
        │   ├── service.ts
        │   ├── routes.ts
        │   ├── schema.ts
        │   └── types.ts
        │
        ├── 📁 chat/             # 💬 Real-time Chat
        │   ├── service.ts
        │   ├── routes.ts
        │   ├── socketHandler.ts
        │   └── types.ts
        │
        └── 📁 games/            # 🎮 Games & Matchmaking
            │
            ├── 📁 game/         # Pong
            │   ├── routes.ts
            │   ├── socketHandler.ts
            │   ├── PongStateManager.ts
            │   └── types.ts
            │
            ├── 📁 scnd_game/    # Rock-Paper-Scissors
            │   ├── routes.ts
            │   ├── socketHandler.ts
            │   └── RpsGameManager.ts
            │
            ├── 📁 matchmaking/  # Matchmaking
            │   ├── routes.ts
            │   ├── socketHandler.ts
            │   ├── MatchMakingService.ts
            │   └── types.ts
            │
            ├── gamePersistence.ts  # Save results
            └── types.ts
```

## Module Pattern (Consistent Across All Features)

```
module/
├── routes.ts       # 🚪 Entry point (HTTP endpoints)
│                      - Defines URL paths
│                      - Applies middleware
│                      - Maps to controllers
│
├── controller.ts   # 🎛️ Request handler
│                      - Extract request data
│                      - Call services
│                      - Format responses
│
├── service.ts      # 🧠 Business logic
│                      - Database queries
│                      - Data processing
│                      - Business rules
│
├── schema.ts       # ✅ Validation (Zod)
│                      - Input validation
│                      - Type checking
│
└── types.ts        # 📋 TypeScript types
                       - Interfaces
                       - Type definitions
```

## Request Flow

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────┐
│   Routes    │  ← Defines endpoints & middleware
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Middleware  │  ← Auth, validation, etc.
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Controller  │  ← Extract data, coordinate
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Service    │  ← Business logic
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Database   │  ← Data persistence
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Response   │
└─────────────┘
```

## Socket.io Flow

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │ Socket.io Connection
       ▼
┌─────────────┐
│ Namespaces  │  ← /matchmaking, /games, /chat, /rps
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Socket Handler│ ← Handle events
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Game Manager │  ← Game state & logic
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Broadcast  │  ← Emit to clients
└─────────────┘
```

## Database Schema Overview

```
┌──────────────┐
│    users     │  ← Core user data
│              │     - id, username, email
│              │     - password_hash, avatar_url
│              │     - stats (pong_wins, RPS_wins, etc.)
│              │     - 2FA (is_2fa_enabled, two_fa_secret)
└──────┬───────┘
       │
       ├─────┐
       │     │
       ▼     ▼
┌────────┐ ┌────────────┐
│ games  │ │ friendship │  ← Relationships
│        │ │            │
└────────┘ └────────────┘
       │
       ▼
┌──────────────────┐
│ matchmaking_queue│  ← Active queue
└──────────────────┘
       │
       ▼
┌──────────────────┐
│   tournaments    │  ← Tournament data
└──────────────────┘
       │
       ▼
┌──────────────────┐
│ chat_channels    │  ← Chat data
│ chat_messages    │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│ token_blacklist  │  ← Logout tokens
└──────────────────┘
```

## Key Files

| File | Purpose |
|------|---------|
| `server.ts` | Entry point, HTTP + Socket.io server |
| `app.ts` | Express app setup, routes, middleware |
| `core/database/schema.sql` | Database schema |
| `core/sockets/socketServer.ts` | Socket.io initialization |
| `modules/*/routes.ts` | API endpoints |
| `modules/*/controller.ts` | Request handlers |
| `modules/*/service.ts` | Business logic |

## Technology Stack

```
┌───────────────────────────────────────┐
│         Frontend (React)              │
└───────────────┬───────────────────────┘
                │
    HTTP REST   │   Socket.io (WS)
                │
┌───────────────▼───────────────────────┐
│         Backend (Node.js)             │
│  ┌─────────────────────────────────┐ │
│  │  Express.js  +  Socket.io       │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │  TypeScript  +  Zod Validation  │ │
│  └─────────────────────────────────┘ │
└───────────────┬───────────────────────┘
                │
┌───────────────▼───────────────────────┐
│      Database (SQLite)                │
│      better-sqlite3                   │
└───────────────────────────────────────┘
```

## Dependencies Highlight

**Core:**
- `express` - HTTP server
- `socket.io` - Real-time communication
- `better-sqlite3` - Database
- `typescript` - Type safety

**Authentication:**
- `jsonwebtoken` - JWT tokens
- `bcrypt` - Password hashing
- `passport` - OAuth
- `otplib` - 2FA

**Validation:**
- `zod` - Schema validation
- `multer` - File uploads

**Utilities:**
- `uuid` - Unique IDs
- `qrcode` - QR codes for 2FA
- `morgan` - Logging
- `cors` - CORS handling

---

**Last Updated:** 2026-02-19
