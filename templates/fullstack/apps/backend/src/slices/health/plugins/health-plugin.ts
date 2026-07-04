import type { FastifyPluginAsync } from 'fastify';
import { healthEndpoint } from '../endpoints/health-endpoint.js';

export const healthPlugin: FastifyPluginAsync = async (app) => {
  await app.register(healthEndpoint);
};
