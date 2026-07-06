import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import fastifyStatic from '@fastify/static';
import type { FastifyPluginAsync } from 'fastify';

type RenderFn = (url: string) => Promise<{ appHtml: string; dehydratedState: unknown }>;

function escapeStateScript(state: unknown): string {
  const json = JSON.stringify(state).replace(/</g, '\\u003c').replace(/\//g, '\\/');
  return `<script>window.__APP_STATE__=${json}</script>`;
}

function resolveFrontendClientDir(): string {
  const require = createRequire(import.meta.url);
  const frontendPackageJson = require.resolve('@app/frontend/package.json');

  return join(dirname(frontendPackageJson), 'dist/client');
}

export const ssrPlugin: FastifyPluginAsync = async (app) => {
  const clientDir = resolveFrontendClientDir();
  const indexHtml = readFileSync(join(clientDir, 'index.html'), 'utf8');

  await app.register(fastifyStatic, {
    prefix: '/assets/',
    root: join(clientDir, 'assets'),
  });

  app.setNotFoundHandler(async (request, reply) => {
    if (request.method !== 'GET') {
      return reply.code(404).send({ message: 'Not found' });
    }

    const url = request.url;

    if (url.startsWith('/api') || url.startsWith('/__test__')) {
      return reply.code(404).send({ message: 'Not found' });
    }

    process.env.SSR_API_ORIGIN ??= `http://127.0.0.1:${process.env.PORT ?? 3001}`;

    const { render } = (await import('@app/frontend/server-entry')) as { render: RenderFn };
    const { appHtml, dehydratedState } = await render(url);

    const html = indexHtml
      .replace('<!--ssr-outlet-->', appHtml)
      .replace('<!--ssr-state-->', escapeStateScript(dehydratedState));

    return reply.type('text/html').send(html);
  });
};
