import type { FastifyInstance } from 'fastify';
import { healthResponseSchema } from '@app/types/health';

export function registerHealthRoutes(server: FastifyInstance) {
  server.get('/health', async () => {
    return healthResponseSchema.parse({ status: 'ok' });
  });
}
