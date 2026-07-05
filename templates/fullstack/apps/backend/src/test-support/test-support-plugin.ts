import type { FastifyPluginAsync } from 'fastify';

import { cleanupTestNamespace } from './cleanup.js';
import { requireTestToken } from './require-token.js';
import { seedTestUsers } from './seed.js';

export const testSupportPlugin: FastifyPluginAsync = async (app) => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Test support routes cannot be registered in production');
  }

  app.addHook('preHandler', requireTestToken);

  app.post('/__test__/seed', async (request, reply) => {
    const result = await seedTestUsers(request.body);
    return reply.code(201).send(result);
  });

  app.post('/__test__/cleanup', async (request, reply) => {
    const result = await cleanupTestNamespace(request.body);
    return reply.send(result);
  });
};
