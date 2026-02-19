import { getDb } from '../../core/database/index.js';
import { User } from '../../core/types/index.js';

export const twoFaService = {
  findById(id: number): User | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as
      | User
      | undefined;
  },

  getSecret(userId: number): string | null {
    const db = getDb();
    const user = db
      .prepare('SELECT two_fa_secret FROM users WHERE id = ?')
      .get(userId) as Pick<User, 'two_fa_secret'> | undefined;
    return user?.two_fa_secret || null;
  },

  getPasswordHash(userId: number): string | null {
    const db = getDb();
    const user = db
      .prepare('SELECT password_hash FROM users WHERE id = ?')
      .get(userId) as Pick<User, 'password_hash'> | undefined;
    return user?.password_hash || null;
  },

  saveSecret(userId: number, secret: string): void {
    const db = getDb();
    db.prepare('UPDATE users SET two_fa_secret = ? WHERE id = ?').run(
      secret,
      userId
    );
  },

  enable(userId: number): void {
    const db = getDb();
    db.prepare('UPDATE users SET is_2fa_enabled = 1 WHERE id = ?').run(userId);
  },

  disable(userId: number): void {
    const db = getDb();
    db.prepare(
      'UPDATE users SET is_2fa_enabled = 0, two_fa_secret = NULL WHERE id = ?'
    ).run(userId);
  },
};
