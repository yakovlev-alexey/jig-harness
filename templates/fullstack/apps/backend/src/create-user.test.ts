import { randomUUID } from 'node:crypto';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { buildApp } from './common/build-app.js';
import { prisma } from './common/prisma.js';

function requireDatabaseUrl(): void {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for integration tests');
  }
}

function namespacedEmail(namespace: string, label: string): string {
  return `${namespace}+${label}@e2e.test`;
}

describe('POST /users', () => {
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

  it('creates a user', async () => {
    const email = namespacedEmail(namespace, 'alice');

    const response = await app.inject({
      method: 'POST',
      url: '/users',
      payload: {
        email,
        name: 'Alice',
      },
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();
    expect(body.email).toBe(email);
    expect(body.name).toBe('Alice');
    expect(body.id).toBeTypeOf('string');
  });

  it('returns 409 when the email already exists', async () => {
    const email = namespacedEmail(namespace, 'bob');

    await app.inject({
      method: 'POST',
      url: '/users',
      payload: { email },
    });

    const response = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { email },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({
      message: 'User with this email already exists',
    });
  });
});
