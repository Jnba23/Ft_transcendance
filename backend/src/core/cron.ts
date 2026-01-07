import { getDb } from './database.js';

export const startCleanupJob = () => {
  const INTERVAL_MS = 24 * 60 * 60 * 1000;

  console.log('⏰ Token cleanup job initialized (Interval: 1 day)');

  const runCleanup = () => {
    try {
      const db = getDb();
      const now = new Date().toISOString();

      const info = db
        .prepare('DELETE FROM token_blacklist WHERE expires_at < ?')
        .run(now);

      if (info.changes > 0) {
        console.log(
          `🧹 cleanup: Remove ${info.changes} expired tokens from blacklist`
        );
      }
    } catch (error) {
      console.error('❌ Error during token cleanup: ', error);
    }
  };

  setInterval(runCleanup, INTERVAL_MS);
};
