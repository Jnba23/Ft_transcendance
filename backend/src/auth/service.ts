import buildApp from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOT || '0.0.0.0';

async function start() {
  try {
    const fastify = await buildApp();
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`🚀 Server running at http://${HOST}:${PORT}`);
  } catch (err) {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  }
}

start(); // Start the server