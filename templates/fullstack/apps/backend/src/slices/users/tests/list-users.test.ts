import { randomUUID } from 'node:crypto';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { buildApp } from '../../../common/build-app.js';
import { prisma } from '../../../common/prisma.js';

function requireDatabaseUrl(): void {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for integration tests');
  }
}

function namespacedEmail(namespace: string, label: string): string {
  return `${namespace}+${label}@e2e.test`;
}

describe('GET /users', () => {
  const namespace = `vitest-${randomUUID()}`;
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    requireDatabaseUrl();
    app = await buildApp({ logger: false });
  });

  afterEach(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: namespace,
        },
      },
    });
  });

  afterAll(async () => {
    await app?.close();
    await prisma.$disconnect();
  });

  it('includes namespaced users created in this test', async () => {
    const emailOne = namespacedEmail(namespace, 'one');
    const emailTwo = namespacedEmail(namespace, 'two');

    await app.inject({
      method: 'POST',
      url: '/api/users',
      payload: { email: emailOne, name: 'One' },
    });

    await app.inject({
      method: 'POST',
      url: '/api/users',
      payload: { email: emailTwo, name: 'Two' },
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/users',
    });

    expect(response.statusCode).toBe(200);

    const users = response.json() as Array<{ email: string; name: string | null }>;
    const emails = users.map((user) => user.email);

    expect(emails).toContain(emailOne);
    expect(emails).toContain(emailTwo);
  });
});
