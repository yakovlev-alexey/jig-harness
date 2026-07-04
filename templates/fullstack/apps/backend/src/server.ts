import Fastify from 'fastify';
import { registerSlicePlugins } from './common/register-slices.js';

const server = Fastify({ logger: true });

await registerSlicePlugins(server);

const port = Number(process.env.PORT ?? 3001);

server
  .listen({ port, host: '0.0.0.0' })
  .then(() => {
    server.log.info(`Backend listening on port ${port}`);
  })
  .catch((error) => {
    server.log.error(error);
    process.exit(1);
  });
