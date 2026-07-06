import { buildApp } from './common/build-app.js';
import { ssrPlugin } from './common/ssr-plugin.js';

const app = await buildApp();

if (process.env.NODE_ENV === 'production') {
  await app.register(ssrPlugin);
}

const port = Number(process.env.PORT ?? 3001);

app
  .listen({ port, host: '0.0.0.0' })
  .then(() => {
    app.log.info(`Backend listening on port ${port}`);
  })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
