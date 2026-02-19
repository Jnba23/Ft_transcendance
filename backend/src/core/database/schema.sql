-- ============================================
-- ft_transcendence - Simplified Database Schema
-- ============================================

-- Core Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,

    -- OAuth
    google_id TEXT UNIQUE,

    avatar_url TEXT DEFAULT '/default-avatar.png',
    level INTEGER DEFAULT 1,          -- New: Player level (e.g. Lv. 24)
    is_2fa_enabled BOOLEAN DEFAULT 0,
    two_fa_secret TEXT,
    status TEXT DEFAULT 'offline' CHECK(status IN ('online', 'offline', 'in_game')),
    
    -- Stats: Pong
    pong_wins INTEGER DEFAULT 0,
    pong_losses INTEGER DEFAULT 0,
    
    -- Stats: Second Game (RPS)
    RPS_wins INTEGER DEFAULT 0,
    RPS_losses INTEGER DEFAULT 0,
    
    -- Stats: General
    win_streak INTEGER DEFAULT 0,     -- New: Track consecutive wins
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Token Blacklist (for server-side logout)
CREATE TABLE IF NOT EXISTS token_blacklist (
    token TEXT PRIMARY KEY,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Simple Matchmaking Queue
CREATE TABLE IF NOT EXISTS matchmaking_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    game_mode TEXT DEFAULT 'classic' CHECK(game_mode IN ('classic', 'speed')),
    status TEXT DEFAULT 'waiting' CHECK(status IN ('waiting', 'matched', 'cancelled')),
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id)
);

-- Simple Tournaments
CREATE TABLE IF NOT EXISTS tournaments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    max_players INTEGER DEFAULT 8,
    current_players INTEGER DEFAULT 0,
    status TEXT DEFAULT 'registration' CHECK(status IN ('registration', 'in_progress', 'completed')),
    winner_id INTEGER,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (winner_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tournament Participants
CREATE TABLE IF NOT EXISTS tournament_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(tournament_id, user_id)
);

-- Friends system
CREATE TABLE IF NOT EXISTS friendship (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id_1 INTEGER NOT NULL,
    user_id_2 INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id_1) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id_2) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id_1, user_id_2),
    CHECK(user_id_1 != user_id_2)
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player1_id INTEGER NOT NULL,
    player2_id INTEGER NOT NULL,
    winner_id INTEGER, -- NULL if draw
    player1_score INTEGER DEFAULT 0,
    player2_score INTEGER DEFAULT 0,
    game_type TEXT DEFAULT 'pong' CHECK(game_type IN ('pong', 'RPS')),
    game_mode TEXT DEFAULT 'classic', -- For variations (speed, blitz, etc.)
    tournament_id INTEGER,
    status TEXT DEFAULT 'completed' CHECK(status IN ('pending', 'in_progress', 'completed')),
    started_at DATETIME,
    ended_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player1_id) REFERENCES users(id),
    FOREIGN KEY (player2_id) REFERENCES users(id),
    FOREIGN KEY (winner_id) REFERENCES users(id),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    CHECK(player1_id != player2_id)
);

-- Chat channels
CREATE TABLE IF NOT EXISTS chat_channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'public' CHECK(type IN ('public', 'private', 'direct')),
    owner_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Chat Channel Members // not
CREATE TABLE IF NOT EXISTS chat_channel_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT DEFAULT 'member' CHECK(role IN ('owner', 'admin', 'member')),
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (channel_id) REFERENCES chat_channels(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(channel_id, user_id)
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (channel_id) REFERENCES chat_channels(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- ============================================
-- Essential Indexes for Performance
-- ============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Matchmaking indexes
CREATE INDEX IF NOT EXISTS idx_matchmaking_status ON matchmaking_queue(status);
CREATE INDEX IF NOT EXISTS idx_matchmaking_mode ON matchmaking_queue(game_mode);

-- Tournament indexes
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_user ON tournament_participants(user_id);

-- Friends indexes
CREATE INDEX IF NOT EXISTS idx_friendship_user_id_1 ON friendship(user_id_1);
CREATE INDEX IF NOT EXISTS idx_friendship_user_id_2 ON friendship(user_id_2);

-- Games indexes
CREATE INDEX IF NOT EXISTS idx_games_player1 ON games(player1_id);
CREATE INDEX IF NOT EXISTS idx_games_player2 ON games(player2_id);
CREATE INDEX IF NOT EXISTS idx_games_tournament ON games(tournament_id);
CREATE INDEX IF NOT EXISTS idx_games_type ON games(game_type);

-- Chat indexes
CREATE INDEX IF NOT EXISTS idx_chat_members_channel ON chat_channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_user ON chat_channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);