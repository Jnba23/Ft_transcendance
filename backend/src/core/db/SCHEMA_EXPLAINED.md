<!-- Presentation: short intro for readers -->
# Schema Overview

This document explains the database schema used by the Ft_transcendance backend. It provides a clear, beginner-friendly description of each table, the purpose of its columns, example SQL queries for common operations, and notes on indexes and performance. Use this page as a quick reference when developing features that read or write data.

1. USERS TABLE - The Heart of Your Application
```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,           -- Unique ID for each user (auto-increments: 1, 2, 3...)
  username TEXT UNIQUE NOT NULL,                  -- Login name, must be unique and required
  email TEXT UNIQUE NOT NULL,                     -- Email, must be unique and required
  password_hash TEXT NOT NULL,                    -- Encrypted password (never store plain text!)
  avatar_url TEXT DEFAULT '/default-avatar.png',  -- Profile picture path
  is_2fa_enabled BOOLEAN DEFAULT 0,               -- Is Two-Factor Auth enabled? (0=false, 1=true)
  two_fa_secret TEXT,                             -- Secret code for 2FA apps like Google Authenticator
  status TEXT DEFAULT 'offline' CHECK(status IN ('online', 'offline', 'in_game')), -- User's current state
  wins INTEGER DEFAULT 0,                         -- Total wins count
  losses INTEGER DEFAULT 0,                       -- Total losses count
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP   -- When account was created (auto-filled)
);
```

How to use:

```sql
-- Create a new user
INSERT INTO users (username, email, password_hash) 
VALUES ('john_doe', 'john@42.fr', 'hashed_password_here');

-- Find a user by username
SELECT * FROM users WHERE username = 'john_doe';

-- Update user status when they login
UPDATE users SET status = 'online' WHERE id = 1;
```

2. OAUTH_ACCOUNTS - For Social Logins (42, Google, GitHub)
```sql
CREATE TABLE IF NOT EXISTS oauth_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,                       -- Links to users table
  provider TEXT NOT NULL CHECK(provider IN ('42', 'google', 'github')), -- Which service
  provider_user_id TEXT NOT NULL,                 -- User's ID from the provider (42 intra ID, etc.)
  access_token TEXT,                              -- Temporary access token from provider
  refresh_token TEXT,                             -- Token to get new access tokens
  expires_at DATETIME,                            -- When tokens expire
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, -- If user deleted, delete this too
  UNIQUE(provider, provider_user_id)              -- One account per provider
);
```

How to use:

```sql
-- Link a 42 account to a user
INSERT INTO oauth_accounts (user_id, provider, provider_user_id, access_token) 
VALUES (1, '42', '12345', 'oauth_token_here');

-- Find user by their 42 ID
SELECT u.* FROM users u 
JOIN oauth_accounts oa ON u.id = oa.user_id 
WHERE oa.provider = '42' AND oa.provider_user_id = '12345';
```

3. REFRESH_TOKENS - For Secure JWT Management
```sql
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,                       -- Which user this token belongs to
  token_hash TEXT UNIQUE NOT NULL,                -- Encrypted token (for security)
  expires_at DATETIME NOT NULL,                   -- When token becomes invalid
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- Clean up when user deleted
);
```

How to use:

```sql
-- Store a refresh token when user logs in
INSERT INTO refresh_tokens (user_id, token_hash, expires_at) 
VALUES (1, 'hashed_token_here', '2024-12-31 23:59:59');

-- Verify a refresh token
SELECT * FROM refresh_tokens 
WHERE token_hash = 'hashed_token_here' AND expires_at > CURRENT_TIMESTAMP;

-- Delete expired tokens
DELETE FROM refresh_tokens WHERE expires_at < CURRENT_TIMESTAMP;
```

4. MATCHMAKING_QUEUE - Find Players for Games
```sql
CREATE TABLE IF NOT EXISTS matchmaking_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,                       -- Who's waiting
  game_mode TEXT DEFAULT 'classic' CHECK(game_mode IN ('classic', 'speed')), -- What game type
  status TEXT DEFAULT 'waiting' CHECK(status IN ('waiting', 'matched', 'cancelled')),
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,   -- When they joined queue
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id)  -- Prevents same user joining multiple times
);
```

How to use:

```sql
-- User joins matchmaking
INSERT INTO matchmaking_queue (user_id, game_mode) VALUES (1, 'classic');

-- Find opponents (matchmaking logic)
SELECT * FROM matchmaking_queue 
WHERE game_mode = 'classic' AND status = 'waiting' AND user_id != 1;

-- Remove from queue when matched
UPDATE matchmaking_queue SET status = 'matched' WHERE user_id = 1;
```

5. TOURNAMENTS & PARTICIPANTS - Organize Competitions
```sql
CREATE TABLE IF NOT EXISTS tournaments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                             -- Tournament name
  max_players INTEGER DEFAULT 8,                  -- Maximum participants
  current_players INTEGER DEFAULT 0,              -- How many joined so far
  status TEXT DEFAULT 'registration' CHECK(status IN ('registration', 'in_progress', 'completed')),
  winner_id INTEGER,                              -- Who won the tournament
  created_by INTEGER NOT NULL,                    -- Who created it
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (winner_id) REFERENCES users(id),   -- Winner must be a valid user
  FOREIGN KEY (created_by) REFERENCES users(id)   -- Creator must be valid user
);

CREATE TABLE IF NOT EXISTS tournament_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER NOT NULL,                 -- Which tournament
  user_id INTEGER NOT NULL,                       -- Which player
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(tournament_id, user_id)  -- Prevents joining same tournament twice
);
```

How to use:

```sql
-- Create a tournament
INSERT INTO tournaments (name, max_players, created_by) 
VALUES ('Winter Championship', 16, 1);

-- Join a tournament
INSERT INTO tournament_participants (tournament_id, user_id) VALUES (1, 2);

-- Get all participants for a tournament
SELECT u.username FROM tournament_participants tp
JOIN users u ON u.id = tp.user_id
WHERE tp.tournament_id = 1;
```

6. FRIENDS - Social Relationships
```sql
CREATE TABLE IF NOT EXISTS friends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,                       -- The user
  friend_id INTEGER NOT NULL,                     -- Their friend
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, friend_id),  -- Prevents duplicate friend relationships
  CHECK(user_id != friend_id)  -- Prevents being friends with yourself
);
```

How to use:

```sql
-- Send friend request
INSERT INTO friends (user_id, friend_id) VALUES (1, 2);

-- Accept friend request
UPDATE friends SET status = 'accepted' 
WHERE user_id = 2 AND friend_id = 1;

-- Get all friends for a user
SELECT u.username FROM friends f
JOIN users u ON u.id = f.friend_id
WHERE f.user_id = 1 AND f.status = 'accepted';
```

7. GAMES - Match History
```sql
CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player1_id INTEGER NOT NULL,                    -- First player
  player2_id INTEGER NOT NULL,                    -- Second player
  winner_id INTEGER,                              -- Who won (NULL if draw/not finished)
  player1_score INTEGER DEFAULT 0,                -- Player 1's score
  player2_score INTEGER DEFAULT 0,                -- Player 2's score
  game_mode TEXT DEFAULT 'classic',               -- Type of game
  tournament_id INTEGER,                          -- If part of a tournament
  status TEXT DEFAULT 'completed' CHECK(status IN ('pending', 'in_progress', 'completed')),
  started_at DATETIME,                            -- When game began
  ended_at DATETIME,                              -- When game ended
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player1_id) REFERENCES users(id),
  FOREIGN KEY (player2_id) REFERENCES users(id),
  FOREIGN KEY (winner_id) REFERENCES users(id),
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
  CHECK(player1_id != player2_id)  -- Prevents playing against yourself
);
```

How to use:

```sql
-- Record a completed game
INSERT INTO games (player1_id, player2_id, winner_id, player1_score, player2_score, started_at, ended_at)
VALUES (1, 2, 1, 5, 3, '2024-01-01 14:00:00', '2024-01-01 14:10:00');

-- Get game history for a user
SELECT * FROM games 
WHERE player1_id = 1 OR player2_id = 1 
ORDER BY created_at DESC;
```

8. CHAT SYSTEM - Messaging
```sql
CREATE TABLE IF NOT EXISTS chat_channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                             -- Channel name
  type TEXT DEFAULT 'public' CHECK(type IN ('public', 'private', 'direct')),
  owner_id INTEGER,                               -- Who created the channel
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS chat_channel_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id INTEGER NOT NULL,                    -- Which channel
  user_id INTEGER NOT NULL,                       -- Which user
  role TEXT DEFAULT 'member' CHECK(role IN ('owner', 'admin', 'member')),
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (channel_id) REFERENCES chat_channels(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(channel_id, user_id)  -- Prevents duplicate memberships
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id INTEGER NOT NULL,                    -- Where message was sent
  sender_id INTEGER NOT NULL,                     -- Who sent it
  content TEXT NOT NULL,                          -- The actual message
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (channel_id) REFERENCES chat_channels(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id)
);
```

How to use:

```sql
-- Create a channel
INSERT INTO chat_channels (name, type, owner_id) VALUES ('general', 'public', 1);

-- Add members to channel
INSERT INTO chat_channel_members (channel_id, user_id, role) VALUES (1, 1, 'owner');
INSERT INTO chat_channel_members (channel_id, user_id, role) VALUES (1, 2, 'member');

-- Send a message
INSERT INTO chat_messages (channel_id, sender_id, content) VALUES (1, 1, 'Hello everyone!');

-- Get channel messages with usernames
SELECT u.username, cm.content, cm.created_at 
FROM chat_messages cm
JOIN users u ON u.id = cm.sender_id
WHERE cm.channel_id = 1
ORDER BY cm.created_at ASC;
```

9. INDEXES - The Performance Boosters
Indexes are like the "table of contents" for your database - they make searching faster:

```sql
-- Find users by email quickly (login operations)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Find users by username quickly
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Check who's online quickly
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Find OAuth accounts for a user quickly
CREATE INDEX IF NOT EXISTS idx_oauth_user_id ON oauth_accounts(user_id);

-- Find refresh tokens for a user and check expiration
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- Matchmaking: find waiting players by game mode
CREATE INDEX IF NOT EXISTS idx_matchmaking_status ON matchmaking_queue(status);
CREATE INDEX IF NOT EXISTS idx_matchmaking_mode ON matchmaking_queue(game_mode);

-- Tournament: find tournaments by status, participants by tournament
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament ON tournament_participants(tournament_id);

-- Games: find games by players or tournaments
CREATE INDEX IF NOT EXISTS idx_games_player1 ON games(player1_id);
CREATE INDEX IF NOT EXISTS idx_games_player2 ON games(player2_id);
CREATE INDEX IF NOT EXISTS idx_games_tournament ON games(tournament_id);

-- Chat: find messages by channel, members by channel/user
CREATE INDEX IF NOT EXISTS idx_chat_members_channel ON chat_channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_user ON chat_channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel_id);
```

Why indexes matter:

Without indexes: Database scans EVERY row (slow)

With indexes: Database jumps directly to relevant rows (fast)

Essential for tables with thousands of records

Putting It All Together - Example Workflow:
```sql
-- 1. User registers
INSERT INTO users (username, email, password_hash) VALUES ('alice', 'alice@42.fr', 'hash123');

-- 2. User joins matchmaking
INSERT INTO matchmaking_queue (user_id, game_mode) VALUES (1, 'classic');

-- 3. Game is created when match found
INSERT INTO games (player1_id, player2_id, status, started_at) 
VALUES (1, 2, 'in_progress', CURRENT_TIMESTAMP);

-- 4. Game ends - record results
UPDATE games SET winner_id = 1, player1_score = 5, player2_score = 3, 
status = 'completed', ended_at = CURRENT_TIMESTAMP WHERE id = 1;

-- 5. Update user stats
UPDATE users SET wins = wins + 1 WHERE id = 1;
UPDATE users SET losses = losses + 1 WHERE id = 2;

-- 6. Users chat about the game
INSERT INTO chat_messages (channel_id, sender_id, content) 
VALUES (1, 1, 'Great game! Want a rematch?');
```

