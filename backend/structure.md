## This is an approximation of how the backend should be structured

### Think of Your Backend Like a Restaurant

the backend is like a **restaurant system**:

```
Customer (Frontend/React)
    ↓
    └─→ Fastify (Waiter)
        └─→ Routes (Which table? What order?)
            └─→ Controller/requestHandelers (Take the order to kitchen)
                └─→ Service (Chef - does the cooking)
                    └─→ Database (Pantry - stores ingredients)
```

Illustration using **the Login feature**

---

## The Flow: User Logs In

```
1. Frontend (React) sends: POST /api/auth/login { email, password }
                           ↓
2. Fastify (Server) receives the request
                           ↓
3. Route (auth/routes.ts): "This is an auth request, send to controller"
                           ↓
4. Controller (auth/controller.ts): "Parse the email/password, send to service"
                           ↓
5. Service (auth/service.ts): "Check if user exists, validate password, create token"
                           ↓
6. Database (core/database.ts): "Query SQLite for user with this email"
                           ↓
7. Response goes back: { success: true, token: "xyz123" }
```

Now let's look at each file:

---

## Layer 1: ROUTES (Entry Point)

**File: `backend/src/auth/routes.ts`**

This is the **waiter taking orders**. It says:

- "If someone POSTs to /auth/login, send them to the login handler"
- "If someone POSTs to /auth/register, send them to the register handler"

```typescript
// What URL patterns do we accept?
// What method? (POST, GET, etc)
// What should we do when they arrive?

import { FastifyInstance } from 'fastify';
import { authController } from './controller';

export async function authRoutes(app: FastifyInstance) {
  // When someone POSTs to /api/auth/login
  app.post('/auth/login', authController.login);

  // When someone POSTs to /api/auth/register
  app.post('/auth/register', authController.register);

  // When someone POSTs to /api/auth/logout (protected route)
  app.post(
    '/auth/logout',
    { onRequest: [app.authenticate] }, // Must be logged in first!
    authController.logout
  );

  // When someone GETs /api/auth/me (protected route)
  app.get(
    '/auth/me',
    { onRequest: [app.authenticate] },
    authController.getCurrentUser
  );
}
```

---

## Layer 2: CONTROLLER (Request Handler)

**File: `backend/src/auth/RequestHandler.ts`**

This is the **kitchen staff receiving the order**. It says:

- "Get the email and password from the request"
- "Call the service to handle it"
- "Send back the response"

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from './service';
import { loginSchema } from './schema';

export const authRequestHandler = {
  // When someone wants to login
  login: async (request: FastifyRequest, reply: FastifyReply) => {
    // 1. Get email and password from request
    const { email, password } = request.body as {
      email: string;
      password: string;
    };

    // 2. Ask the service to handle login
    const result = await authService.login(email, password);

    // 3. Send back the response
    return reply.send({
      success: true,
      token: result.token,
      user: result.user,
    });
  },

  register: async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password, username } = request.body as any;
    const result = await authService.register(email, password, username);
    return reply.status(201).send({
      success: true,
      user: result.user,
    });
  },

  logout: async (request: FastifyRequest, reply: FastifyReply) => {
    // request.user is available because of middleware!
    const userId = request.user.id;
    await authService.logout(userId);
    return reply.send({ success: true });
  },

  getCurrentUser: async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user.id;
    const user = await authService.getUserById(userId);
    return reply.send({ user });
  },
};
```

---

## Layer 3: SERVICE (Business Logic)

**File: `backend/src/auth/service.ts`**

This is the **chef cooking**. It says:

- "Here's the email and password"
- "Check if user exists"
- "Compare passwords"
- "Create a token"
- "Return the result"

```typescript
import { authUtils } from '../../utils/jwt';
import { hashUtils } from '../../utils/hash';
import { db } from '../../core/database';

export const authService = {
  login: async (email: string, password: string) => {
    // 1. Find user in database
    const user = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    // 2. User doesn't exist?
    if (!user) {
      throw new Error('User not found');
    }

    // 3. Compare password
    const isValid = await hashUtils.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid password');
    }

    // 4. Create JWT token
    const token = authUtils.generateToken(user.id);

    // 5. Return to RequestHandler
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  },

  register: async (email: string, password: string, username: string) => {
    // 1. Check if user already exists
    const existing = await db.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);

    if (existing) {
      throw new Error('User already exists');
    }

    // 2. Hash the password
    const hashedPassword = await hashUtils.hash(password);

    // 3. Insert into database
    const user = await db.query(
      'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
      [email, username, hashedPassword]
    );

    return { user };
  },

  logout: async (userId: string) => {
    // Clear session or token from database
    await db.query('UPDATE users SET last_logout = NOW() WHERE id = ?', [
      userId,
    ]);
  },
};
```

---

## Layer 4: TYPES (Data Structure)

**File: `backend/src/auth/types.ts`**

This defines **what shape the data has**. It's like saying:

- "A User always has: id, email, username, password"
- "A Login request always has: email, password"
- "A Login response always has: token, user"

```typescript
// What does a User look like?
export interface User {
  id: string;
  email: string;
  username: string;
  password: string; // hashed
  createdAt: Date;
}

// What does a login request look like?
export interface LoginRequest {
  email: string;
  password: string;
}

// What does a login response look like?
export interface LoginResponse {
  token: string;
  user: Omit<User, 'password'>;
}

// What does the JWT payload contain?
export interface JWTPayload {
  userId: string;
  email: string;
}
```

---

## Layer 5: SCHEMA (Validation)

**File: `backend/src/auth/schema.ts`**

This checks **if the data is valid** before using it. It's like:

- "Email must be a real email"
- "Password must be at least 8 characters"

```typescript
export const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8 },
    },
  },
};

export const registerSchema = {
  body: {
    type: 'object',
    required: ['email', 'password', 'username'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8 },
      username: { type: 'string', minLength: 3 },
    },
  },
};
```

---

## Now Let's Look at SHARED LAYERS

## Core Folder (Shared Infrastructure)

**File: `backend/src/core/database.ts`**

This is the **pantry**. All features use it to store/retrieve data:

```typescript
import Database from 'better-sqlite3';

const sqlite = new Database('./data/transcendance.db');

export const db = {
  query: (sql: string, params: any[] = []) => {
    const stmt = sqlite.prepare(sql);
    return stmt.all(...params);
  },

  run: (sql: string, params: any[] = []) => {
    const stmt = sqlite.prepare(sql);
    return stmt.run(...params);
  },
};
```

**Usage by anyone:**

```typescript
// Auth uses it
await db.query('SELECT * FROM users WHERE email = ?', [email]);

// Game uses it
await db.query('SELECT * FROM games WHERE id = ?', [gameId]);

// RPS uses it
await db.query('INSERT INTO rps_games VALUES (?, ?, ?)', [
  player1,
  player2,
  winner,
]);
```

**Simple analogy:** Core is like the **shared kitchen equipment**:

- Everyone can use the oven
- Everyone can use the fridge
- Don't duplicate it for each person

---

## Core Folder: Redis

**File: `backend/src/core/redis.ts`**

This is like the **order board** where everyone can see real-time updates:

```typescript
import redis from 'redis';

const redisClient = redis.createClient({
  host: 'redis',
  port: 6379,
});

export const redisService = {
  // Store real-time player locations
  setPlayerStatus: (userId: string, status: string) => {
    redisClient.set(`player:${userId}:status`, status);
  },

  // Get who's online now
  getPlayerStatus: (userId: string) => {
    return redisClient.get(`player:${userId}:status`);
  },

  // Broadcast to chat users
  publishChatMessage: (message: string) => {
    redisClient.publish('chat', message);
  },
};
```

**Usage:**

```typescript
// Chat service: notify someone is online
await redisService.setPlayerStatus(userId, 'online');

// Game service: notify game started
await redisService.publishGameEvent('game:started', gameId);

// Matchmaking: get all waiting players
const waitingPlayers = await redisService.getWaitingPlayers();
```

---

## Middleware Folder (Shared Guards/Checks)

**File: `backend/src/middleware/auth.ts`**

This is the **bouncer at the door**. Some routes are protected:

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { authUtils } from '../utils/jwt';

export const authenticateMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // 1. Get token from header
  const token = request.headers.authorization?.split(' ')[1];

  // 2. Token missing?
  if (!token) {
    return reply.status(401).send({ error: 'No token provided' });
  }

  // 3. Verify token
  const decoded = authUtils.verifyToken(token);
  if (!decoded) {
    return reply.status(401).send({ error: 'Invalid token' });
  }

  // 4. Add user to request object
  request.user = decoded;
};
```

**Usage in routes:**

```typescript
// Protected route - only logged-in users
app.post(
  '/logout',
  { onRequest: [authenticateMiddleware] }, // Check token first!
  authRequestHandler.logout
);

// Public route - anyone can access
app.post('/login', authRequestHandler.login);
```

**Simple analogy:** Middleware is like **security checks**:

- "Show me your ticket"
- "Your ticket is valid? Come in!"
- "No ticket? Stay out!"

---

## Utils Folder (Reusable Tools)

**File: `backend/src/utils/jwt.ts`**

Tools used by multiple services:

```typescript
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

export const authUtils = {
  // Create token (used by auth service)
  generateToken: (userId: string) => {
    return jwt.sign({ userId }, SECRET, { expiresIn: '7d' });
  },

  // Verify token (used by middleware)
  verifyToken: (token: string) => {
    try {
      return jwt.verify(token, SECRET);
    } catch {
      return null;
    }
  },
};
```

**Usage everywhere:**

```typescript
// Auth service creates token
const token = authUtils.generateToken(user.id);

// Middleware verifies token
const decoded = authUtils.verifyToken(token);
```

---

## The Complete Picture: User Logs In

```
1. FRONTEND
   └─→ POST /api/auth/login { email: "john@example.com", password: "secret123" }

2. FASTIFY SERVER (Receives request)
   └─→ Router: "This goes to auth routes"

3. ROUTE (auth/routes.ts)
   └─→ "POST /auth/login → authRequestHandler.login"

4. MIDDLEWARE (auth.ts)
   └─→ "Check if token present (not needed for login)"

5. RequestHandler (auth/RequestHandler.ts)
   └─→ "Extract email and password"
   └─→ "Call authService.login(email, password)"

6. SERVICE (auth/service.ts)
   └─→ "Query database for user"
   └─→ DB Query: "SELECT * FROM users WHERE email = ?"
   └─→ Database returns: User record
   └─→ "Compare password using hashUtils"
   └─→ hashUtils.compare("secret123", "$2b$10$hashedPassword")
   └─→ "Create token using authUtils"
   └─→ authUtils.generateToken(userId)
   └─→ "Return { token, user }"

7. RequestHandler sends response
   └─→ { success: true, token: "eyJhbGc...", user: { id, email, username } }

8. FRONTEND receives response
   └─→ Saves token to localStorage
   └─→ Redirects to dashboard
```

---

## Why This Pattern?

✅ **Routes** - Know which endpoint to call
✅ **RequestHandler** - Parse and validate input
✅ **Service** - Handle business logic
✅ **Types** - Ensure data is correct
✅ **Schema** - Validate before processing
✅ **Middleware** - Protect routes
✅ **Utils** - Reuse common functions
✅ **Core** - Share database and cache

Each layer has **ONE JOB**. This makes code:

- **Easy to find** - Where's the login logic? In service!
- **Easy to test** - Test each layer separately
- **Easy to change** - Change logic without touching routes
- **Reusable** - Multiple features can share utils

---

## Quick Comparison

| Layer          | Job                   | Example                   |
| -------------- | --------------------- | ------------------------- |
| Routes         | WHERE to go           | /api/auth/login           |
| RequestHandler | WHAT to do with input | Extract email/password    |
| Service        | HOW to do it          | Query DB, verify password |
| Types          | SHAPE of data         | User interface            |
| Schema         | VALID data            | Email must be email       |
| Middleware     | GATE keeper           | Must have token           |
| Utils          | TOOLS                 | Hash password, make token |
| Core           | SHARED                | Database, Redis           |
