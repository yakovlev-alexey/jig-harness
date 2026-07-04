import type { FastifyPluginAsync } from 'fastify';
import { createUserEndpoint } from '../endpoints/create-user-endpoint.js';

export const usersPlugin: FastifyPluginAsync = async (app) => {
  await app.register(createUserEndpoint);
};
