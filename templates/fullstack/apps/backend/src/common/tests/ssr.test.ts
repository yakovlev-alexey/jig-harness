import { randomUUID } from 'node:crypto';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { buildApp } from '../build-app.js';
import { ssrPlugin } from '../ssr-plugin.js';
import { prisma } from '../prisma.js';

function requireDatabaseUrl(): void {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for integration tests');
  }
}

function namespacedEmail(namespace: string, label: string): string {
  return `${namespace}+${label}@e2e.test`;
}

describe('SSR HTML', () => {
  const namespace = `vitest-ssr-${randomUUID()}`;
  let app: Awaited<ReturnType<typeof buildApp>>;
  let baseUrl: string;

  beforeAll(async () => {
    requireDatabaseUrl();
    app = await buildApp({ logger: false });
    await app.register(ssrPlugin);
    await app.listen({ port: 0, host: '127.0.0.1' });

    const address = app.server.address();

    if (!address || typeof address === 'string') {
      throw new Error('Expected TCP server address');
    }

    baseUrl = `http://127.0.0.1:${address.port}`;
    process.env.SSR_API_ORIGIN = baseUrl;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: namespace,
        },
      },
    });
    await app?.close();
    await prisma.$disconnect();
  });

  it('renders the home page with embedded dehydrated state', async () => {
    const response = await fetch(`${baseUrl}/`);

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');

    const body = await response.text();
    expect(body).toContain('home-page');
    expect(body).toContain('window.__APP_STATE__=');
  });

  it('prefetches users into SSR HTML for /users', async () => {
    const email = namespacedEmail(namespace, 'ssr-user');

    const createResponse = await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, name: 'SSR User' }),
    });

    expect(createResponse.status).toBe(201);

    const response = await fetch(`${baseUrl}/users`);
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain('SSR User');
    expect(body).toContain('window.__APP_STATE__=');
  });
});
