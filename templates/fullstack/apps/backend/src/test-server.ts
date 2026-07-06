import { buildApp } from './common/build-app.js';
import { ssrPlugin } from './common/ssr-plugin.js';
import { testSupportPlugin } from './test-support/test-support-plugin.js';

if (process.env.ENABLE_TEST_ROUTES !== 'true') {
  throw new Error('ENABLE_TEST_ROUTES must be true to run test-server');
}

const app = await buildApp();
await app.register(testSupportPlugin);
await app.register(ssrPlugin);

const port = Number(process.env.PORT ?? 3001);

app
  .listen({ port, host: '0.0.0.0' })
  .then(() => {
    app.log.info(`Test backend listening on port ${port}`);
  })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
