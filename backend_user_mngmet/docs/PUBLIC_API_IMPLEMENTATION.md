# Public API Implementation Guide

This document outlines how to implement the **Public API module** for ft_transcendence, featuring:
- Secured API Key authentication
- Rate limiting
- At least 5 endpoints (GET, POST, PUT, DELETE)
- Swagger documentation

---

## 1. Database Schema

Add to `src/core/db/schema.sql`:

```sql
-- API Keys for public API access
CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,                    -- Description: "My Discord Bot"
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rate_limit INTEGER DEFAULT 100,        -- Requests per minute
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_used_at DATETIME
);

-- Index for fast key lookup
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);
```

---

## 2. Install Dependencies

```bash
cd backend
npm install express-rate-limit
npm install -D @types/express-rate-limit  # If needed
```

---

## 3. Configuration

Add to `src/auth/config/index.ts`:

```typescript
export const config = {
  // ... existing config
  
  // Public API
  apiKeyHeader: 'x-api-key',
  defaultRateLimit: 100,        // requests per minute
  rateLimitWindowMs: 60 * 1000, // 1 minute
};
```

---

## 4. API Key Middleware

Create `src/public-api/middleware/validateApiKey.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { getDb } from '../../core/database.js';
import { AppError } from '../../utils/AppError.js';
import { config } from '../../auth/config/index.js';

export interface ApiKeyInfo {
  id: number;
  key: string;
  name: string;
  owner_id: number;
  rate_limit: number;
}

export const validateApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.get(config.apiKeyHeader);

  if (!apiKey) {
    return next(new AppError('API key is required. Set x-api-key header.', 401));
  }

  const db = getDb();

  const keyRecord = db
    .prepare('SELECT * FROM api_keys WHERE key = ? AND is_active = 1')
    .get(apiKey) as ApiKeyInfo | undefined;

  if (!keyRecord) {
    return next(new AppError('Invalid or inactive API key', 401));
  }

  // Update last used timestamp
  db.prepare('UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(keyRecord.id);

  // Attach key info to request for rate limiting
  res.locals.apiKey = keyRecord;

  next();
};
```

---

## 5. Rate Limiter Middleware

Create `src/public-api/middleware/rateLimiter.ts`:

```typescript
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { config } from '../../auth/config/index.js';
import { ApiKeyInfo } from './validateApiKey.js';

// Dynamic rate limiter based on API key's rate_limit
export const apiRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  
  // Dynamic limit per API key
  max: (req: Request, res: Response) => {
    const apiKey = res.locals.apiKey as ApiKeyInfo | undefined;
    return apiKey?.rate_limit || config.defaultRateLimit;
  },

  // Use API key as identifier (not IP)
  keyGenerator: (req: Request) => {
    return req.get(config.apiKeyHeader) || req.ip || 'unknown';
  },

  message: {
    status: 'error',
    message: 'Rate limit exceeded. Please try again later.',
  },

  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});
```

---

## 6. Public API Routes

Create `src/public-api/routes.ts`:

```typescript
import { Router, Request, Response, NextFunction } from 'express';
import { getDb } from '../core/database.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import { validateApiKey } from './middleware/validateApiKey.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';

const router = Router();

// Apply API key validation and rate limiting to all routes
router.use(validateApiKey);
router.use(apiRateLimiter);

// ============================================
// GET /public/leaderboard
// ============================================
/**
 * @swagger
 * /public/leaderboard:
 *   get:
 *     summary: Get top players leaderboard
 *     description: Returns ranked list of players by total wins
 *     tags: [Public API]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: game
 *         schema:
 *           type: string
 *           enum: [pong, chess, all]
 *         description: Filter by game type (default: all)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of results (default: 10)
 *     responses:
 *       200:
 *         description: Leaderboard data
 *       401:
 *         description: Invalid or missing API key
 *       429:
 *         description: Rate limit exceeded
 */
router.get('/leaderboard', catchAsync(async (req: Request, res: Response) => {
  const game = (req.query.game as string) || 'all';
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
  
  const db = getDb();
  
  let query: string;
  if (game === 'pong') {
    query = `SELECT id, username, avatar_url, level, pong_wins, pong_losses,
             (pong_wins - pong_losses) as score
             FROM users ORDER BY score DESC LIMIT ?`;
  } else if (game === 'chess') {
    query = `SELECT id, username, avatar_url, level, chess_wins, chess_losses,
             (chess_wins - chess_losses) as score
             FROM users ORDER BY score DESC LIMIT ?`;
  } else {
    query = `SELECT id, username, avatar_url, level,
             pong_wins, pong_losses, chess_wins, chess_losses,
             (pong_wins + chess_wins - pong_losses - chess_losses) as score
             FROM users ORDER BY score DESC LIMIT ?`;
  }
  
  const leaderboard = db.prepare(query).all(limit);
  
  res.json({
    status: 'success',
    results: leaderboard.length,
    data: { leaderboard },
  });
}));

// ============================================
// GET /public/users/:id
// ============================================
/**
 * @swagger
 * /public/users/{id}:
 *   get:
 *     summary: Get public user profile
 *     tags: [Public API]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User profile
 *       404:
 *         description: User not found
 */
router.get('/users/:id', catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const db = getDb();
  
  const user = db.prepare(`
    SELECT id, username, avatar_url, level, status,
           pong_wins, pong_losses, chess_wins, chess_losses, created_at
    FROM users WHERE id = ?
  `).get(id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  res.json({
    status: 'success',
    data: { user },
  });
}));

// ============================================
// POST /public/matches
// ============================================
/**
 * @swagger
 * /public/matches:
 *   post:
 *     summary: Record a match result
 *     tags: [Public API]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - game
 *               - player1_id
 *               - player2_id
 *               - winner_id
 *             properties:
 *               game:
 *                 type: string
 *                 enum: [pong, chess]
 *               player1_id:
 *                 type: integer
 *               player2_id:
 *                 type: integer
 *               winner_id:
 *                 type: integer
 *               score:
 *                 type: string
 *                 example: "11-7"
 *     responses:
 *       201:
 *         description: Match recorded
 *       400:
 *         description: Invalid input
 */
router.post('/matches', catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { game, player1_id, player2_id, winner_id, score } = req.body;
  
  if (!game || !player1_id || !player2_id || !winner_id) {
    return next(new AppError('Missing required fields', 400));
  }
  
  if (!['pong', 'chess'].includes(game)) {
    return next(new AppError('Invalid game type. Must be pong or chess', 400));
  }
  
  const db = getDb();
  
  // Verify players exist
  const p1 = db.prepare('SELECT id FROM users WHERE id = ?').get(player1_id);
  const p2 = db.prepare('SELECT id FROM users WHERE id = ?').get(player2_id);
  
  if (!p1 || !p2) {
    return next(new AppError('One or both players not found', 404));
  }
  
  // Insert match record
  const result = db.prepare(`
    INSERT INTO matches (game, player1_id, player2_id, winner_id, score)
    VALUES (?, ?, ?, ?, ?)
  `).run(game, player1_id, player2_id, winner_id, score || null);
  
  // Update player stats
  const winCol = game === 'pong' ? 'pong_wins' : 'chess_wins';
  const loseCol = game === 'pong' ? 'pong_losses' : 'chess_losses';
  const loserId = winner_id === player1_id ? player2_id : player1_id;
  
  db.prepare(`UPDATE users SET ${winCol} = ${winCol} + 1 WHERE id = ?`).run(winner_id);
  db.prepare(`UPDATE users SET ${loseCol} = ${loseCol} + 1 WHERE id = ?`).run(loserId);
  
  res.status(201).json({
    status: 'success',
    data: {
      match: {
        id: result.lastInsertRowid,
        game,
        player1_id,
        player2_id,
        winner_id,
        score,
      },
    },
  });
}));

// ============================================
// PUT /public/matches/:id
// ============================================
/**
 * @swagger
 * /public/matches/{id}:
 *   put:
 *     summary: Update a match record
 *     tags: [Public API]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               winner_id:
 *                 type: integer
 *               score:
 *                 type: string
 *     responses:
 *       200:
 *         description: Match updated
 *       404:
 *         description: Match not found
 */
router.put('/matches/:id', catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { winner_id, score } = req.body;
  
  const db = getDb();
  
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(id);
  
  if (!match) {
    return next(new AppError('Match not found', 404));
  }
  
  const updates: string[] = [];
  const values: (string | number)[] = [];
  
  if (winner_id !== undefined) {
    updates.push('winner_id = ?');
    values.push(winner_id);
  }
  
  if (score !== undefined) {
    updates.push('score = ?');
    values.push(score);
  }
  
  if (updates.length === 0) {
    return next(new AppError('No fields to update', 400));
  }
  
  values.push(parseInt(id));
  db.prepare(`UPDATE matches SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  
  const updatedMatch = db.prepare('SELECT * FROM matches WHERE id = ?').get(id);
  
  res.json({
    status: 'success',
    data: { match: updatedMatch },
  });
}));

// ============================================
// DELETE /public/matches/:id
// ============================================
/**
 * @swagger
 * /public/matches/{id}:
 *   delete:
 *     summary: Delete a match record
 *     tags: [Public API]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Match deleted
 *       404:
 *         description: Match not found
 */
router.delete('/matches/:id', catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const db = getDb();
  
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(id);
  
  if (!match) {
    return next(new AppError('Match not found', 404));
  }
  
  db.prepare('DELETE FROM matches WHERE id = ?').run(id);
  
  res.status(204).send();
}));

export default router;
```

---

## 7. API Key Management Routes

Create `src/public-api/apiKeyRoutes.ts`:

```typescript
import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { getDb } from '../core/database.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import { requireUser } from '../middleware/requireUser.js';
import { User } from '../auth/types.js';

const router = Router();

// Generate a secure random API key
const generateApiKey = (): string => {
  return `sk_live_${crypto.randomBytes(24).toString('hex')}`;
};

/**
 * @swagger
 * /keys:
 *   post:
 *     summary: Generate a new API key
 *     description: Creates a new API key for the authenticated user
 *     tags: [API Keys]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Description for this API key
 *                 example: My Discord Bot
 *     responses:
 *       201:
 *         description: API key created
 */
router.post('/', requireUser, catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body;
  const user = res.locals.user as User;
  
  if (!name || name.trim().length === 0) {
    return next(new AppError('API key name is required', 400));
  }
  
  const apiKey = generateApiKey();
  const db = getDb();
  
  const result = db.prepare(`
    INSERT INTO api_keys (key, name, owner_id) VALUES (?, ?, ?)
  `).run(apiKey, name.trim(), user.id);
  
  // Only show the full key once!
  res.status(201).json({
    status: 'success',
    message: 'API key created. Save this key - it will not be shown again!',
    data: {
      id: result.lastInsertRowid,
      key: apiKey,
      name: name.trim(),
    },
  });
}));

/**
 * @swagger
 * /keys:
 *   get:
 *     summary: List your API keys
 *     tags: [API Keys]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of API keys (keys are masked)
 */
router.get('/', requireUser, catchAsync(async (req: Request, res: Response) => {
  const user = res.locals.user as User;
  const db = getDb();
  
  const keys = db.prepare(`
    SELECT id, 
           SUBSTR(key, 1, 12) || '...' as key_preview,
           name, rate_limit, is_active, created_at, last_used_at
    FROM api_keys WHERE owner_id = ?
  `).all(user.id);
  
  res.json({
    status: 'success',
    results: keys.length,
    data: { keys },
  });
}));

/**
 * @swagger
 * /keys/{id}:
 *   delete:
 *     summary: Revoke an API key
 *     tags: [API Keys]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: API key revoked
 */
router.delete('/:id', requireUser, catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const user = res.locals.user as User;
  const db = getDb();
  
  const key = db.prepare('SELECT * FROM api_keys WHERE id = ? AND owner_id = ?')
    .get(id, user.id);
  
  if (!key) {
    return next(new AppError('API key not found', 404));
  }
  
  db.prepare('DELETE FROM api_keys WHERE id = ?').run(id);
  
  res.status(204).send();
}));

export default router;
```

---

## 8. Register Routes in App

Update `src/auth/app.ts`:

```typescript
// Add imports
import publicApiRoutes from '../public-api/routes.js';
import apiKeyRoutes from '../public-api/apiKeyRoutes.js';

// Add routes (after existing routes)
app.use('/api/public', publicApiRoutes);
app.use('/api/keys', apiKeyRoutes);
```

---

## 9. Update Swagger Config

Update `src/auth/config/swagger.ts`:

```typescript
// Add to tags array:
{
  name: 'Public API',
  description: 'Public API endpoints accessible with API key',
},
{
  name: 'API Keys',
  description: 'Manage your API keys',
},

// Add to components.securitySchemes:
apiKeyAuth: {
  type: 'apiKey',
  in: 'header',
  name: 'x-api-key',
  description: 'API key for public API access. Generate one at POST /api/keys',
},

// Update apis array to include public-api:
apis: ['./src/auth/routes/*.ts', './src/auth/schemas/*.ts', './src/public-api/*.ts'],
```

---

## 10. Matches Table (if not exists)

Add to `src/core/db/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game TEXT NOT NULL CHECK(game IN ('pong', 'chess')),
    player1_id INTEGER NOT NULL REFERENCES users(id),
    player2_id INTEGER NOT NULL REFERENCES users(id),
    winner_id INTEGER NOT NULL REFERENCES users(id),
    score TEXT,                    -- e.g., "11-7" for pong
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_matches_game ON matches(game);
CREATE INDEX IF NOT EXISTS idx_matches_players ON matches(player1_id, player2_id);
```

---

## Summary: Endpoints Created

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/public/leaderboard` | API Key | Get top players |
| GET | `/api/public/users/:id` | API Key | Get user profile |
| POST | `/api/public/matches` | API Key | Record match |
| PUT | `/api/public/matches/:id` | API Key | Update match |
| DELETE | `/api/public/matches/:id` | API Key | Delete match |
| POST | `/api/keys` | Cookie/JWT | Generate API key |
| GET | `/api/keys` | Cookie/JWT | List your keys |
| DELETE | `/api/keys/:id` | Cookie/JWT | Revoke key |

---

## Testing with cURL

```bash
# 1. Login and generate API key (use browser/Postman for cookie-based auth)

# 2. Test public API
curl -H "x-api-key: sk_live_abc123..." http://localhost:3000/api/public/leaderboard

# 3. Create a match
curl -X POST http://localhost:3000/api/public/matches \
  -H "x-api-key: sk_live_abc123..." \
  -H "Content-Type: application/json" \
  -d '{"game":"pong","player1_id":1,"player2_id":2,"winner_id":1,"score":"11-7"}'
```

---

## Checklist

- [ ] Add `api_keys` table to schema.sql
- [ ] Add `matches` table to schema.sql (if not exists)
- [ ] Install `express-rate-limit`
- [ ] Create `src/public-api/` folder
- [ ] Create `validateApiKey.ts` middleware
- [ ] Create `rateLimiter.ts` middleware
- [ ] Create `routes.ts` with 5 endpoints
- [ ] Create `apiKeyRoutes.ts` for key management
- [ ] Register routes in `app.ts`
- [ ] Update Swagger config
- [ ] Test all endpoints
