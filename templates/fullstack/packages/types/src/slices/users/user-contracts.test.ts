import { describe, expect, it } from 'vitest';

import {
  createUserBodySchema,
  testCleanupSchema,
  testSeedSchema,
  userResponseSchema,
  usersListResponseSchema,
} from './user-contracts.js';

const validUserResponse = {
  id: 'usr_1',
  email: 'alice@example.com',
  name: 'Alice',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('createUserBodySchema', () => {
  it('accepts a valid body', () => {
    expect(
      createUserBodySchema.safeParse({ email: 'alice@example.com', name: 'Alice' }).success,
    ).toBe(true);
  });

  it('accepts a body without optional name', () => {
    expect(createUserBodySchema.safeParse({ email: 'alice@example.com' }).success).toBe(true);
  });

  it('rejects an invalid email', () => {
    expect(createUserBodySchema.safeParse({ email: 'not-an-email' }).success).toBe(false);
  });

  it('rejects an empty name when provided', () => {
    expect(createUserBodySchema.safeParse({ email: 'alice@example.com', name: '' }).success).toBe(
      false,
    );
  });
});

describe('usersListResponseSchema', () => {
  it('accepts an empty list', () => {
    expect(usersListResponseSchema.safeParse([]).success).toBe(true);
  });

  it('accepts a list of valid users', () => {
    expect(usersListResponseSchema.safeParse([validUserResponse]).success).toBe(true);
  });

  it('rejects a list with an invalid user', () => {
    expect(
      usersListResponseSchema.safeParse([{ ...validUserResponse, email: 'bad' }]).success,
    ).toBe(false);
  });
});

describe('userResponseSchema', () => {
  it('accepts a valid user', () => {
    expect(userResponseSchema.safeParse(validUserResponse).success).toBe(true);
  });

  it('rejects a user missing required fields', () => {
    expect(userResponseSchema.safeParse({ email: 'alice@example.com' }).success).toBe(false);
  });
});

describe('testSeedSchema', () => {
  it('accepts a namespaced seed payload', () => {
    expect(
      testSeedSchema.safeParse({
        users: [{ email: 'ns0+alice@e2e.test', name: 'Alice' }],
      }).success,
    ).toBe(true);
  });

  it('accepts an empty users array', () => {
    expect(testSeedSchema.safeParse({ users: [] }).success).toBe(true);
  });

  it('rejects users with invalid bodies', () => {
    expect(
      testSeedSchema.safeParse({
        users: [{ email: 'not-an-email' }],
      }).success,
    ).toBe(false);
  });
});

describe('testCleanupSchema', () => {
  it('accepts a non-empty namespace', () => {
    expect(testCleanupSchema.safeParse({ namespace: 'e2e-run-0-abc' }).success).toBe(true);
  });

  it('rejects an empty namespace', () => {
    expect(testCleanupSchema.safeParse({ namespace: '' }).success).toBe(false);
  });

  it('rejects a missing namespace', () => {
    expect(testCleanupSchema.safeParse({}).success).toBe(false);
  });
});
