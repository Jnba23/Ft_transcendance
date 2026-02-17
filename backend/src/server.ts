import { initDatabase, closeDb } from './core/database.js';
import { config } from './auth/config/index.js';
import app from './auth/app.js';
import { startCleanupJob } from './core/cron.js';

initDatabase();
startCleanupJob();

const server = app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Server is running on http://localhost:${config.port}`);
  // eslint-disable-next-line no-console
  console.log(`Environment: ${config.nodeEnv}`);
});

const gracefullyShutdown = (signal: string) => {
  // eslint-disable-next-line no-console
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);

  server.close(() => {
    closeDb();
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefullyShutdown('SIGINT'));
process.on('SIGTERM', () => gracefullyShutdown('SIGTERM'));
