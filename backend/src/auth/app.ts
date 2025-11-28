import databasePlugin from '../core/database';
// import cookiePlugin from '@fastify/cookie';
// import authPlugin from './plugins/auth'
import userRoutes from './routes/users';
import Fastify from 'fastify';

async function buildApp() {
  const fastify = Fastify({ logger: true });
  // ============================================================
  // Register Plugins
  // ============================================================
  await fastify.register(databasePlugin);
  // await fastify.register(authPlugin);

  // ============================================================
  // Register Routes
  // ============================================================
  await fastify.register(userRoutes);

  // ============================================================
  // Health Check Route
  // ============================================================
  fastify.route({
    method: 'GET',
    url: '/health',
    schema: {
      description: 'Server health check',
      tags: ['Health'],
      response: {
        200: {
          description: 'Server is healthy',
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      return reply.code(200).send({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    },
  });

  return fastify;
}

export default buildApp;
