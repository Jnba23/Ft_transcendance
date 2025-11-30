import buildApp from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  try {
    const fastify = await buildApp();
    await fastify.listen({ port: PORT, host: HOST });
    fastify.log.info(`🚀 Server running at http://${HOST}:${PORT}`);
  } catch (err: unknown) {
    // eslint-disable-next-line no-console
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  }
}

start(); // Start the server
