import { getDb } from '../../core/database.js';
import { hashPassword } from '../../utils/crypt.js';
import { User } from '../types.js';

export const authService = {
  findByEmailOrUsername(identifier: string): User | undefined {
    const db = getDb();
    return db
      .prepare('SELECT * FROM users WHERE email = ? OR username = ?')
      .get(identifier, identifier) as User | undefined;
  },

  findByEmail(email: string): User | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as
      | User
      | undefined;
  },

  findByUsername(username: string): User | undefined {
    const db = getDb();
    return db
      .prepare('SELECT * FROM users WHERE username = ?')
      .get(username) as User | undefined;
  },

  findById(id: number): User | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as
      | User
      | undefined;
  },

  async createUser(data: {
    username: string;
    email: string;
    password: string;
  }): Promise<User> {
    const db = getDb();
    const passwordHash = await hashPassword(data.password);

    const stmt = db.prepare(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
    );
    const info = stmt.run(data.username, data.email, passwordHash);

    return db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(info.lastInsertRowid) as User;
  },

  checkExistingUser(
    email: string,
    username: string
  ): { email?: boolean; username?: boolean } | null {
    const db = getDb();
    const existingUser = db
      .prepare(
        'SELECT id, email, username FROM users WHERE email = ? OR username = ?'
      )
      .get(email, username) as User | undefined;

    if (!existingUser) return null;

    return {
      email: existingUser.email === email,
      username: existingUser.username === username,
    };
  },

  isTokenBlacklisted(token: string): boolean {
    const db = getDb();
    const result = db
      .prepare('SELECT token FROM token_blacklist WHERE token = ?')
      .get(token);
    return !!result;
  },

  blacklistToken(token: string, expiresAt: string): void {
    const db = getDb();
    db.prepare(
      'INSERT OR IGNORE INTO token_blacklist (token, expires_at) VALUES (?, ?)'
    ).run(token, expiresAt);
  },
};
