import { getDb } from '../../core/database.js';
import { User, SafeUser, PublicUser } from '../../auth/types.js';

const sanitizeUser = (user: User): SafeUser => {
  const {
    password_hash: _password_hash,
    two_fa_secret: _two_fa_secret,
    ...safeUser
  } = user;
  return safeUser;
};

export const userService = {
  findById(id: number): User | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  },

  findByIdPublic(id: number): PublicUser | undefined {
    const db = getDb();
    return db
      .prepare(
        'SELECT id, username, avatar_url, level, status, created_at, pong_wins, pong_losses, RPS_wins, RPS_losses FROM users WHERE id = ?'
      )
      .get(id) as PublicUser | undefined;
  },

  findAll(): PublicUser[] {
    const db = getDb();
    return db
      .prepare('SELECT id, username, avatar_url, level, status FROM users')
      .all() as PublicUser[];
  },

  findByUsername(username: string, excludeId?: number): User | undefined {
    const db = getDb();
    if (excludeId) {
      return db
        .prepare('SELECT id FROM users WHERE username = ? AND id != ?')
        .get(username, excludeId) as User | undefined;
    }
    return db
      .prepare('SELECT * FROM users WHERE username = ?')
      .get(username) as User | undefined;
  },

  updateProfile(
    userId: number,
    data: { username?: string; avatarUrl?: string }
  ): void {
    const db = getDb();
    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (data.username) {
      updates.push('username = ?');
      values.push(data.username);
    }

    if (data.avatarUrl) {
      updates.push('avatar_url = ?');
      values.push(data.avatarUrl);
    }

    if (updates.length > 0) {
      values.push(userId);
      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      db.prepare(query).run(...values);
    }
  },

  updateStatus(userId: number, status: string): void {
    const db = getDb();
    db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, userId);
  },

  getSanitizedUser(user: User): SafeUser {
    return sanitizeUser(user);
  },
};
