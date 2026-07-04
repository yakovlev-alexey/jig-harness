import Fastify from 'fastify';
import { healthResponseSchema } from '@app/types/health';
import { registerHealthRoutes } from './routes/health';

const server = Fastify({ logger: true });

registerHealthRoutes(server);

const port = Number(process.env.PORT ?? 3001);

server
  .listen({ port, host: '0.0.0.0' })
  .then(() => {
    healthResponseSchema.parse({ status: 'ok' });
    server.log.info(`API listening on port ${port}`);
  })
  .catch((error) => {
    server.log.error(error);
    process.exit(1);
  });
