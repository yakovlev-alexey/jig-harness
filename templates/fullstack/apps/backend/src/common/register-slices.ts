import type { FastifyInstance } from 'fastify';
import { healthPlugin } from '../slices/health/plugins/health-plugin.js';
import { usersPlugin } from '../slices/users/plugins/users-plugin.js';

export async function registerSlicePlugins(server: FastifyInstance) {
  await server.register(healthPlugin, { prefix: '/api' });
  await server.register(usersPlugin, { prefix: '/api' });
}
