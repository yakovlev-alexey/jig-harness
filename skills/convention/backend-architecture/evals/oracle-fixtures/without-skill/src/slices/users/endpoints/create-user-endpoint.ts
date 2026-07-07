import type { FastifyPluginAsync } from 'fastify';

import { createUserCommand } from '../commands/create-user-command.js';

/** Anti-pattern: endpoint calls command directly, skipping usecase. */
export const createUserEndpoint: FastifyPluginAsync = async (app) => {
  app.post('/users', async (request, reply) => {
    const body = request.body as { email: string; name?: string };
    const user = await createUserCommand(body);
    return reply.code(201).send(user);
  });
};
