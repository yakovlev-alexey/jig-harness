import type { FastifyPluginAsync } from 'fastify';
import { createUserEndpoint } from '../endpoints/create-user-endpoint.js';
import { listUsersEndpoint } from '../endpoints/list-users-endpoint.js';

export const usersPlugin: FastifyPluginAsync = async (app) => {
  await app.register(createUserEndpoint);
  await app.register(listUsersEndpoint);
};
