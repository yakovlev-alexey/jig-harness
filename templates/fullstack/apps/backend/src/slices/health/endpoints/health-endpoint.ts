import type { FastifyPluginAsync } from 'fastify';
import { healthResponseSchema } from '@app/types/slices/health/health-contracts';

export const healthEndpoint: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => {
    return healthResponseSchema.parse({ status: 'ok' });
  });
};
