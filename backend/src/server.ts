import { initDatabase, closeDb } from './core/database.js';
import { config } from './config/index.js';
import app from './app.js';
import { startCleanupJob } from './core/cron.js';
import { createServer } from 'http';
import { initSocketIo } from './core/sockets/socketServer.js';

initDatabase();
startCleanupJob();
const server = createServer(app);
initSocketIo(server);

server.listen(config.port, () => {
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
