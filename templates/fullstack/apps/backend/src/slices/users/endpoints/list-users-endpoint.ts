import type { FastifyPluginAsync } from 'fastify';
import { usersListResponseSchema } from '@app/types/slices/users/user-contracts';

import { listUsersQuery } from '../queries/list-users-query.js';

export const listUsersEndpoint: FastifyPluginAsync = async (app) => {
  app.get('/users', async () => {
    const users = await listUsersQuery();

    return usersListResponseSchema.parse(
      users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
    );
  });
};
