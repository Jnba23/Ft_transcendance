import { getDb } from './database/index.js';

export const startCleanupJob = () => {
  const INTERVAL_MS = 24 * 60 * 60 * 1000;

  // eslint-disable-next-line no-console
  console.log('⏰ Token cleanup job initialized (Interval: 1 day)');

  const runCleanup = () => {
    try {
      const db = getDb();
      const now = new Date().toISOString();

      const info = db
        .prepare('DELETE FROM token_blacklist WHERE expires_at < ?')
        .run(now);

      if (info.changes > 0) {
        // eslint-disable-next-line no-console
        console.log(
          `🧹 cleanup: Remove ${info.changes} expired tokens from blacklist`
        );
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Error during token cleanup: ', error);
    }
  };

  setInterval(runCleanup, INTERVAL_MS);
};
